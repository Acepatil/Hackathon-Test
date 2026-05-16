package api

import (

	"fmt"
	"lovable-backend/llm"
	"net/http"

	"github.com/gin-gonic/gin"
)

type ProcessSpeechRequest struct {
	Text     string `json:"text" binding:"required"`
	Field    string `json:"field" binding:"required"`
	Language string `json:"language"`
}

type ProcessSpeechResponse struct {
	Value string `json:"value"`
	Error string `json:"error,omitempty"`
}

func ProcessSpeechHandler(c *gin.Context) {
	var req ProcessSpeechRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Println(err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	fmt.Println(req)

	// Map language code to language name
	langName := "English"
	langMap := map[string]string{
		"en-IN": "English",
		"hi-IN": "Hindi",
		"ta-IN": "Tamil",
		"te-IN": "Telugu",
		"gu-IN": "Gujarati",
		"bn-IN": "Bengali",
		"mr-IN": "Marathi",
	}
	if name, ok := langMap[req.Language]; ok {
		langName = name
	}

	var sys string
	if req.Field == "description" {
		sys = fmt.Sprintf(`Seller described their product verbally in %s. Translate accurately to English. Remove all profanity, harmful products (like weapons, illegal drugs), and filler words. Write a clean professional B2B product description summary (150-200 words). If the product is harmful or contains profanity that cannot be cleaned, return {"error": "Content filtered, try again"}. Otherwise return ONLY JSON: {"value": "description"}`, langName)
	} else {
		sys = fmt.Sprintf(`Extract the value from seller's speech for field: %s. The seller is speaking in %s - translate accurately to English. Remove profanity and filler words. If the product is harmful (like weapons, illegal drugs) or contains profanity that cannot be cleaned, return {"error": "Content filtered, try again"}. Otherwise return ONLY JSON: {"value": "extracted text"}`, req.Field, langName)
	}
	fmt.Println("sys", sys)
	respText, err := llm.CallClaude(sys, req.Text)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to call LLM: " + err.Error()})
		return
	}

	var parsed struct {
		Value string `json:"value"`
		Error string `json:"error"`
	}
	fmt.Println("respText", respText)
	err = llm.ParseJsonLoose(respText, &parsed)
	fmt.Println("parsed", parsed)
	if err != nil || (parsed.Value == "" && parsed.Error == "") {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid LLM response format"})
		return
	}

	if parsed.Error != "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": parsed.Error})
		return
	}

	c.JSON(http.StatusOK, ProcessSpeechResponse{Value: parsed.Value})
}

type TranslateProductRequest struct {
	TargetLanguage string `json:"targetLanguage" binding:"required"`
	ProductData    string `json:"productData" binding:"required"`
}

func TranslateProductHandler(c *gin.Context) {
	var req TranslateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	sys := fmt.Sprintf(`You are a translator. Translate the following product listing to %s. Ensure the output is natural and professional. Return ONLY a JSON object containing the translated product data with identical keys but translated values. Keep numerical values and units (like "380" and "Kg") intact, just translate the text. Do not wrap in markdown tags, just return the JSON object.`, req.TargetLanguage)

	respText, err := llm.CallClaude(sys, req.ProductData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to translate: " + err.Error()})
		return
	}

	var parsed map[string]interface{}
	err = llm.ParseJsonLoose(respText, &parsed)
	if err != nil {
		// Fallback: return raw text if we can't parse JSON, though system prompt asks for JSON
		c.JSON(http.StatusOK, gin.H{"raw": respText})
		return
	}

	c.JSON(http.StatusOK, parsed)
}

type SuggestSpecsRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

func SuggestSpecsHandler(c *gin.Context) {
	var req SuggestSpecsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	response, err := llm.SuggestSpecificationKeys(req.Name, req.Description)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

// Product Storage implementation
type Product struct {
	ID             string            `json:"id"`
	Name           string            `json:"name"`
	Category       string            `json:"category"`
	Price          string            `json:"price"`
	Unit           string            `json:"unit"`
	Description    string            `json:"description"`
	PrimaryPhoto   string            `json:"primaryPhoto,omitempty"`
	Score          int               `json:"score,omitempty"`
	ConfigSpecs    map[string]string `json:"configSpecs,omitempty"`
	OtherSpecs     map[string]string `json:"otherSpecs,omitempty"`
}

var products []Product

func SaveProductHandler(c *gin.Context) {
	var req Product
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	// Specifications are now passed directly in the payload from the frontend

	// Generate a simple ID (in a real app, use UUID or DB ID)
	req.ID = fmt.Sprintf("prod-%d", len(products)+1)
	
	products = append(products, req)
	
	c.JSON(http.StatusOK, gin.H{"message": "Product saved successfully", "product": req})
}

func GetProductsHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"products": products})
}

func GetProductByIDHandler(c *gin.Context) {
	id := c.Param("id")
	for _, p := range products {
		if p.ID == id {
			c.JSON(http.StatusOK, gin.H{"product": p})
			return
		}
	}
	c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
}

func UpdateProductHandler(c *gin.Context) {
	id := c.Param("id")
	var req Product
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	// Specifications are now passed directly in the payload from the frontend

	for i, p := range products {
		if p.ID == id {
			req.ID = id
			products[i] = req
			c.JSON(http.StatusOK, gin.H{"message": "Product updated successfully", "product": req})
			return
		}
	}
	c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
}
