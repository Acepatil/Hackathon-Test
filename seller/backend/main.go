package main

import (
	"log"
	"lovable-backend/api"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Try loading .env file (optional, won't crash if it doesn't exist)
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, relying on environment variables")
	}

	r := gin.Default()

	// Configure CORS so frontend can communicate with backend
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"}, // Adjust in production
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
		apiGroup.POST("/seller/process-speech", api.ProcessSpeechHandler)
		apiGroup.POST("/seller/suggest-specs", api.SuggestSpecsHandler)
		apiGroup.POST("/buyer/translate", api.TranslateProductHandler)
		apiGroup.POST("/seller/products", api.SaveProductHandler)
		apiGroup.GET("/seller/products", api.GetProductsHandler)
		apiGroup.GET("/seller/products/:id", api.GetProductByIDHandler)
		apiGroup.PUT("/seller/products/:id", api.UpdateProductHandler)
	}

	log.Println("Starting server on :8090")
	if err := r.Run(":8090"); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
