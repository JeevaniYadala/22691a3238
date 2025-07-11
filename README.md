# 22691a3238

## Project Structure

This repository contains a complete Full Stack URL Shortener application with the following components:

### 📁 Logging Middleware
- Custom logging middleware that sends logs to the evaluation service
- Supports both backend and frontend logging
- Implements all required log levels (debug, info, warn, error, fatal)

### 📁 Backend Test Submission
- Node.js/Express TypeScript backend service
- RESTful API endpoints for URL shortening
- In-memory storage with expiration handling
- Click tracking with geolocation
- Comprehensive error handling and validation

### 📁 Frontend Test Submission
- React TypeScript application with Material UI
- URL shortener page (supports up to 5 URLs)
- Statistics page with click analytics
- Responsive design for mobile and desktop

## API Endpoints

### POST /shorturls
Create a short URL with optional custom shortcode and validity period.

### GET /shorturls/:shortcode
Get statistics for a shortened URL including click history.

### GET /:shortcode
Redirect to the original URL and track the click.

## Features

- ✅ Custom shortcode support
- ✅ URL expiration handling
- ✅ Click tracking with metadata
- ✅ Geolocation tracking
- ✅ Client-side validation
- ✅ Material UI responsive design
- ✅ Comprehensive logging
- ✅ Error handling
- ✅ TypeScript throughout

## Running the Application

### Backend
```bash
cd "Backend Test Submission"
npm install
npm run dev
```

### Frontend
```bash
cd "Frontend Test Submission"
npm install
npm run dev
```

The backend runs on port 3000 and frontend on port 5173.