# Seller Application

This folder contains the seller-facing full-stack marketplace application.

## Structure

- `frontend/` — seller UI for listing, editing, and managing products.
- `backend/` — Go backend providing product ingestion, speech-to-product processing, smart specification suggestions, translation endpoints, and product catalog APIs.

## Purpose

This app enables merchants to onboard products quickly using voice or text input, automatically inferring key product metadata and exposing the catalog for buyer localization.

## Init Mod

cd /backend
go mod init lovable-backend