# 🛍️ Shop API (E-commerce Backend)

A production-ready RESTful API for an online store, built with **Node.js**, **Express**, and **MongoDB**.
This project includes a comprehensive **Swagger (OpenAPI)** documentation for easy testing and frontend integration.

## 🚀 Key Features

- **🔐 Authentication:** Secure signup/login with JWT & Bcrypt.
- **📦 Product Management:** CRUD operations for products with categories.
- **🛒 Shopping Cart:** Embedded cart system within user profile.
- **💳 Order System:** Order processing with price freezing logic & status tracking.
- **⭐ Reviews:** Product feedback & rating system.
- **📄 API Documentation:** Interactive API explorer using Swagger UI.

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Documentation:** Swagger UI (OpenAPI 3.0)
- **Validation:** Validator.js

---

## 💻 Getting Started

Follow these steps to set up the project locally:

### 1. Clone the Repository

```bash
git clone [https://github.com/hypnotize/shop-api.git](https://github.com/hypnotize/shop-api.git)
cd shop-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

```bash
Create a .env file in the root directory and add the following variables:
PORT=3000
MONGODB_URL=mongodb://localhost:27017/shop-api
JWT_SECRET=your_super_secret_key_here
```

### 4. Run the Server

```bash
# Development mode (with nodemon)
npm run dev
# Production mode
npm start
```

### 📖 API Documentation (Swagger)

```bash
Once the server is running, you can access the interactive API documentation at:

👉 http://localhost:3000/api-docs
```
