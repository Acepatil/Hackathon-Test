# Project Overview: Hackathon

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

## Error Handling & Fallbacks

| Failure | Fallback |
|---|---|
| LLM API timeout | Return cached translation if exists, else show English with warning banner |
| Speech recognition error | Show raw transcript, let seller manually edit before AI processing |
| Profanity detected | Field left blank, orange border, "Re-record" prompt — never silently passed |
| Noisy audio / empty transcript | Mic shows "Couldn't hear clearly" — no API call made |

## Cost Reality
"Near zero marginal cost" applies to buyer-side reads served from cache. Seller-side write = 1 LLM call per product per language. At 10K new products/day × 7 languages = ~70K API calls/day, within Claude batch pricing.

## Tradeoffs Considered

| Decision | Alternative Rejected | Why |
|---|---|---|
| Go/Gin backend | Node.js | Lower memory, native goroutines for concurrent cache |
| BFF pattern | Single monolith | Seller/buyer concerns diverge — separate deployability |
| Web Speech API | Whisper self-hosted | No GPU in hackathon infra |
| Claude for post-processing | IndicTrans2 only | Pure translation = literal; Claude = B2B-toned summary |
| In-memory cache (sync.RWMutex) | Redis | Simpler for hackathon; Redis is the prod upgrade path |

## Assumptions & Non-Goals
- v1 targets 7 languages; languages 8-22 are architecture-ready, gated behind IndicTrans2 model addition only
- Arabic RTL tested in Chrome; GCC market = UI only, no regulatory compliance claimed
- Listing score recalculates client-side on: name ≥3 words, description ≥100 chars, photo uploaded, PDF uploaded, price filled — mirrors IndiaMART's documented Product Score criteria

