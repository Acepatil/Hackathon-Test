package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type Product map[string]interface{}

type ProductsResponse struct {
	Products []Product `json:"products"`
}

type TranslateRequest struct {
	TargetLanguage string `json:"targetLanguage"`
	ProductData    string `json:"productData"`
}

var (
	cacheMutex       sync.RWMutex
	translationCache = make(map[string]Product)
	translationFailed = make(map[string]bool)
)

func main() {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})

	apiGroup := r.Group("/api")
	{
		apiGroup.GET("/buyer/products", func(c *gin.Context) {
			langCode := c.Query("lang")
			if langCode == "" {
				langCode = "en-IN"
			}

			langMap := map[string]string{
				"en-IN": "English",
				"hi-IN": "Hindi",
				"ta-IN": "Tamil",
				"te-IN": "Telugu",
				"gu-IN": "Gujarati",
				"bn-IN": "Bengali",
				"mr-IN": "Marathi",
			}

			langName, exists := langMap[langCode]
			if !exists {
				langName = "English" // fallback
			}

			// 1. Fetch products from lovable backend
			resp, err := http.Get("http://localhost:8090/api/seller/products")
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products from seller backend"})
				return
			}
			defer resp.Body.Close()

			bodyBytes, err := io.ReadAll(resp.Body)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read seller response"})
				return
			}

			var sellerResp ProductsResponse
			if err := json.Unmarshal(bodyBytes, &sellerResp); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse seller response"})
				return
			}

			// 2. If English, just return the products
			if langName == "English" {
				c.JSON(http.StatusOK, gin.H{"products": sellerResp.Products})
				return
			}

			// 3. Otherwise, translate each product
			var translatedProducts []Product
			for _, prod := range sellerResp.Products {
				prodID := fmt.Sprintf("%v", prod["id"])
				cacheKey := langName + "_" + prodID

				cacheMutex.RLock()
				cachedProd, inCache := translationCache[cacheKey]
				_, inFailed := translationFailed[cacheKey]
				cacheMutex.RUnlock()

				if inCache {
					translatedProducts = append(translatedProducts, cachedProd)
					continue
				}

				if inFailed {
					translatedProducts = append(translatedProducts, prod)
					continue
				}

				prodJSON, _ := json.Marshal(prod)
				
				transReqBody := TranslateRequest{
					TargetLanguage: langName,
					ProductData:    string(prodJSON),
				}
				reqBytes, _ := json.Marshal(transReqBody)
				
				transResp, err := http.Post("http://localhost:8090/api/buyer/translate", "application/json", bytes.NewBuffer(reqBytes))
				if err != nil || transResp.StatusCode != http.StatusOK {
					fmt.Println("Error translating product, or non-200 status:", err)
					if transResp != nil {
						fmt.Println("Status code:", transResp.StatusCode)
						transResp.Body.Close()
					}
					
					// Fallback to original and record failure
					translatedProducts = append(translatedProducts, prod)
					cacheMutex.Lock()
					translationFailed[cacheKey] = true
					cacheMutex.Unlock()
					continue
				}

				transBytes, _ := io.ReadAll(transResp.Body)
				transResp.Body.Close()

				var translatedProduct Product
				if err := json.Unmarshal(transBytes, &translatedProduct); err != nil {
					fmt.Println("Error parsing translated product:", string(transBytes))
					
					// Fallback to original and record failure
					translatedProducts = append(translatedProducts, prod)
					cacheMutex.Lock()
					translationFailed[cacheKey] = true
					cacheMutex.Unlock()
					continue
				}
				
				// Make sure ID is preserved from original (sometimes LLMs mess it up)
				translatedProduct["id"] = prod["id"]
				
				// Best effort translation fallback:
				// If translation returns a weird response without a valid name (like {"raw": ...}), fallback to original
				if name, ok := translatedProduct["name"].(string); !ok || name == "" {
					fmt.Println("Translated product is missing name, falling back to original product")
					
					translatedProducts = append(translatedProducts, prod)
					cacheMutex.Lock()
					translationFailed[cacheKey] = true
					cacheMutex.Unlock()
					continue
				}
				
				translatedProducts = append(translatedProducts, translatedProduct)
				cacheMutex.Lock()
				translationCache[cacheKey] = translatedProduct
				cacheMutex.Unlock()
			}

			c.JSON(http.StatusOK, gin.H{"products": translatedProducts})
		})
	}

	log.Println("Starting buyer backend server on :8091")
	if err := r.Run(":8091"); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
