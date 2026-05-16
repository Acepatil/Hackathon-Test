# Buyer Application

This folder contains the buyer-facing full-stack marketplace application.

## Structure

- `frontend/` — React + TypeScript + Vite storefront for buyers.
- `backend/` — Go backend that acts as a BFF, fetching product data from the seller service, translating it into the buyer's preferred language, and caching localized catalog results.

## Purpose

This app presents a localized shopping experience for buyers by translating seller-provided product catalogs into Indian regional languages and serving them via a responsive web UI.

## Init Mod

cd /backend
go mod init buyer-backend