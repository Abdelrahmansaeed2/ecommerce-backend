# E-Commerce Backend API

##  Overview

A complete **E-Commerce Backend System** built with:

* **Node.js**
* **Express.js**
* **MongoDB (Mongoose)**

The project follows **MVC architecture** and provides a secure, scalable RESTful API with:

* JWT Authentication
* Role-based Authorization
* Full CRUD operations
* Advanced filtering, pagination, and sorting

---

##  Objectives

* Build a real-world backend system
* Apply MVC architecture
* Secure APIs using JWT
* Implement role-based access control
* Work with MongoDB relationships
* Handle errors professionally

---

##  Features

###  Authentication & Authorization

* User Registration & Login
* Password hashing using bcrypt
* JWT Token generation
* Protected routes
* Role-based access:

  * **Admin → Full CRUD**
  * **User → Read + Orders only**

---

###  User Module

* Register user
* Login user
* Hash password
* Generate token
* Roles: `Admin`, `User`

---

###  Product Module

* Create Product (Admin only)
* Get All Products
* Get Single Product
* Update Product (Admin only)
* Delete Product (Admin only)

**Advanced:**

* Pagination
* Search (name, description)
* Filtering:

  * category
  * price range
  * status
* Sorting:

  * price
  * createdAt

---

###  Category Module

* Create Category (Admin)
* Get All Categories
* Get Single Category
* Update Category (Admin)
* Delete Category (Admin)

---

###  Order Module

* Create Order (User)
* Get My Orders
* Get All Orders (Admin)
* Get Single Order
* Update Order
* Delete Order

---

###  Middleware

* Authentication Middleware (JWT)
* Authorization Middleware (Role-based)
* Error Handling Middleware
* Rate Limiting
* Logger (Morgan + custom logger)

---

##  Database Design

### Relationships:

* Product → Category (Many-to-One)
* Order → User (Many-to-One)
* Order → Products (Many-to-Many via items)

---

##  Project Structure

```id="proj1"
project/
│
├── models/
├── controllers/
├── routes/
├── middlewares/
├── config/
├── utils/
├── public/
├── views/
├── tests/
├── app.js
├── server.js
└── package.json
```

---

##  Installation & Setup

### 1️⃣ Clone repository

```bash id="cmd1"
git clone https://github.com/your-username/ecommerce-backend.git
cd ecommerce-backend
```

### 2️⃣ Install dependencies

```bash id="cmd2"
npm install
```

### 3️⃣ Create `.env` file

```env id="env1"
PORT=5000
DB_URL=mongodb://127.0.0.1:27017/ecommerce
JWT_SECRET=your_secret_key
```

### 4️⃣ Run server

```bash id="cmd3"
npm run dev
```

---

##  Base URL

```id="base1"
http://localhost:5000/api
```

---

#  FULL API DOCUMENTATION

---

#  AUTH API

## ➤ Register User

**POST** `/api/auth/register`

### Body:

```json id="auth1"
{
  "username": "john",
  "email": "john@mail.com",
  "password": "123456"
}
```

### Response:

```json id="auth2"
{
  "message": "User registered successfully",
  "token": "JWT_TOKEN"
}
```

---

## ➤ Login User

**POST** `/api/auth/login`

### Body:

```json id="auth3"
{
  "email": "john@mail.com",
  "password": "123456"
}
```

### Response:

```json id="auth4"
{
  "message": "Login successful",
  "token": "JWT_TOKEN"
}
```

---

#  PRODUCT API

## ➤ Get All Products

**GET** `/api/products`

### Query Parameters:

```id="prod1"
?page=1
&limit=10
&search=phone
&category=categoryId
&minPrice=100
&maxPrice=1000
&status=active
&sort=price
&order=asc
```

### Response:

```json id="prod2"
{
  "data": [],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10
  }
}
```

---

## ➤ Get Single Product

**GET** `/api/products/:id`

---

## ➤ Create Product (Admin)

**POST** `/api/products`

### Headers:

```id="prod3"
Authorization: Bearer TOKEN
```

### Body:

```json id="prod4"
{
  "name": "iPhone",
  "price": 1000,
  "category": "categoryId",
  "description": "Latest model",
  "status": "active"
}
```

---

## ➤ Update Product (Admin)

**PUT/PATCH** `/api/products/:id`

---

## ➤ Delete Product (Admin)

**DELETE** `/api/products/:id`

---

#  CATEGORY API

## ➤ Get All Categories

**GET** `/api/categories`

---

## ➤ Get Single Category

**GET** `/api/categories/:id`

---

## ➤ Create Category (Admin)

**POST** `/api/categories`

---

## ➤ Update Category (Admin)

**PUT/PATCH** `/api/categories/:id`

---

## ➤ Delete Category (Admin)

**DELETE** `/api/categories/:id`

---

#  ORDER API

## ➤ Create Order

**POST** `/api/orders`

### Body:

```json id="order1"
{
  "items": [
    {
      "product": "productId",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "address": "Cairo",
    "city": "Cairo",
    "postalCode": "12345"
  },
  "paymentMethod": "cash"
}
```

---

## ➤ Get My Orders

**GET** `/api/orders/mine`

---

## ➤ Get All Orders (Admin)

**GET** `/api/orders`

---

## ➤ Get Single Order

**GET** `/api/orders/:id`

---

## ➤ Update Order

**PUT/PATCH** `/api/orders/:id`

---

## ➤ Delete Order

**DELETE** `/api/orders/:id`

---

#  Authentication

All protected routes require:

```id="authHeader"
Authorization: Bearer YOUR_TOKEN
```

---

# Error Handling

Standard error response:

```json id="err1"
{
  "status": "error",
  "message": "Error message"
}
```

---


#  Security

* JWT Authentication
* Password hashing (bcrypt)
* Rate limiting
* Protected routes

---

#  Bonus Features Implemented

* Pagination
* Search
* Filtering
* Sorting
* Logging system
* Rate limiting

---

# Status

```text id="status1"
✔ Fully Functional Backend
✔ Clean Architecture (MVC)
✔ Secure & Scalable
✔ Production Ready 
```
