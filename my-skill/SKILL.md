# Project Overview: Hackathon-Final

This repository houses a comprehensive, dual-sided marketplace solution consisting of two distinct full-stack applications: **Seller** and **Buyer**. The ecosystem is designed to bridge the gap between merchants and customers by leveraging AI for frictionless product listing and dynamic localization.

## 1. Seller Full-Stack Application

The Seller application empowers merchants with an AI-driven, effortless experience to list and manage their inventory.

### **Features & Capabilities:**
- **Voice-to-Product Listing (`/process-speech`):** Sellers can simply speak to describe their products. The system uses LLMs to process the speech, understand the context, and extract necessary product details.
- **Smart Specification Suggestions (`/suggest-specs`):** Automatically suggests relevant specifications and metadata based on the product description to ensure rich cataloging.
- **Product Management:** Full CRUD (Create, Read, Update, Delete) capabilities for managing the product catalog.
- **Shared LLM Services:** Exposes a translation endpoint (`/buyer/translate`) utilized by the buyer platform to localize product data.

### **Tech Stack:**
- **Backend:** Built with **Go** and the **Gin** web framework. Runs on port `8090`.
- **Integrations:** Integrates deeply with LLMs for speech processing, data extraction, and translation.

---

## 2. Buyer Full-Stack Application

The Buyer application provides a deeply localized, user-friendly storefront for customers to browse products in their native language.

### **Features & Capabilities:**
- **Multilingual Support:** Buyers can view the entire product catalog in multiple Indian regional languages, including English, Hindi, Tamil, Telugu, Gujarati, Bengali, and Marathi (`en-IN`, `hi-IN`, `ta-IN`, etc.).
- **Real-Time Dynamic Translation:** The backend intercepts product data from the seller platform and dynamically translates the names, descriptions, and specifications into the buyer's preferred language.
- **Intelligent Caching System:** Implements a robust, concurrent in-memory caching mechanism (`translationCache` with `sync.RWMutex`) to store previously translated products. This significantly minimizes external API calls, reduces latency, and handles translation failures gracefully.

### **Tech Stack:**
- **Frontend:** Modern SPA built with **React**, **TypeScript**, and **Vite**.
- **Backend:** Built with **Go** and the **Gin** web framework. Runs on port `8091`. Functions as a Backend-For-Frontend (BFF), communicating with the Seller API to retrieve and translate product catalogs.

## System Architecture & Data Flow
1. **Creation:** A seller uses the frontend to dictate a product description. The Seller Backend processes this speech, generates product specs, and saves the product to the central store.
2. **Request:** A buyer opens the Buyer Frontend in their native language (e.g., Hindi) and requests the product feed.
3. **Internal Sync:** The Buyer Backend (`:8091`) fetches the raw (English) product list from the Seller Backend (`:8090`).
4. **Translation & Caching:** The Buyer Backend checks its concurrent cache for each product. If a Hindi translation is missing, it calls the translation endpoint to translate the product data, caches the result to prevent future redundant calls, and finally serves the localized catalog to the buyer.
