# URL Shortener API

A scalable and reusable URL shortener API built with Node.js, Express, and MongoDB. This project supports custom aliases, analytics, and rate limiting.

---

## Features

- Shorten long URLs with custom or auto-generated aliases.
- Redirect shortened URLs to their original links.
- Fetch analytics for shortened URLs.
- Input validation and secure handling.
- Scalable and reusable structure.

---

## Requirements

- Node.js >= 14.x
- MongoDB (Database)
- Redis (for caache & rate limiting)

---

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd url-shortener
   npm install

## Create .env file
-PORT
-MONGO_URI
-GOOGLE_CLIENT_ID
-SESSION_SECRET
-BASE_URL
-REDIS_HOST
-REDIS_PORT

## Api Documentation
-Baseurl/api-docs