# Enterprise E-Commerce Backend

This is a robust, scalable, and production-ready backend for a modern e-commerce platform, built with Node.js, Express, and MongoDB. It follows a clean, service-oriented architecture and includes a wide range of advanced, enterprise-grade features.

---

##  Core Features

-   **Clean Architecture**: Follows a modular `Controller` → `Service` → `Model` structure for excellent separation of concerns and maintainability.
-   **Advanced Authentication**: Secure JWT-based authentication featuring a refresh token strategy for persistent sessions and role-based access control (`user`, `admin`).
-   **Multi-Gateway Payment System**: A flexible, provider-agnostic payment architecture supporting:
    -   **Stripe**: For international credit card payments.
    -   **Paymob**: Redirect-based payment gateway for the Egyptian market.
    -   **Fawry**: Redirect-based payment gateway for the Egyptian market.
    -   **Cash on Delivery (COD)**: For offline payments.
-   **Webhook-Driven Orders**: A reliable, asynchronous order creation flow. Orders are only created after receiving a verified success notification from the payment provider, preventing data inconsistencies.
-   **Intelligent AI Chatbot**:
    -   **Retrieval-Augmented Generation (RAG)**: The chatbot is connected directly to the product and order databases.
    -   **Vector Search**: Uses MongoDB Atlas Vector Search and OpenAI embeddings for advanced semantic search, allowing it to understand the *meaning* behind user queries (e.g., "show me something for a cold day").
    -   **Conversational Memory**: Remembers previous messages in a conversation for natural, context-aware interactions.
-   **Full Product Management**: Complete CRUD API for products with advanced capabilities like filtering, sorting, field selection, and pagination.
-   **Comprehensive User Features**:
    -   **Wishlist**: Allows users to save products for later.
    -   **Persistent Cart**: Full shopping cart management.
    -   **Reviews & Ratings**: Users can review and rate products, with automatic calculation of average ratings.
-   **Admin Dashboard APIs**: Secure endpoints for administrators to view key metrics (total sales, users, orders) and manage platform data.
-   **Coupon & Discount System**: Enables admins to create and manage discount codes that can be applied to user carts.
-   **Real-time Systems**:
    -   **Socket.io Chat**: Foundation for real-time customer support or user-to-user messaging.
    -   **In-App Notifications**: Real-time alerts for events like order status changes, pushed to the client via Socket.io.
-   **Production-Ready Infrastructure**:
    -   **Centralized Error Handling**: A global error handler provides graceful error management and consistent API error responses.
    -   **Robust Input Validation**: Server-side validation for all incoming data using `express-validator`.
    -   **Comprehensive Logging**: Detailed logging with `winston`, configured for both development (console) and production (file-based) environments.
    -   **Security Hardening**: Includes rate limiting, password hashing (`bcrypt`), and secure cookie configurations.

---

##  Getting Started

### Prerequisites

-   Node.js (v16 or higher)
-   MongoDB (a local instance or a cloud service like MongoDB Atlas is required)
-   An account with Stripe, Paymob, and Fawry for payment testing.
-   An OpenAI account for the AI chatbot and embedding generation.

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd ecommerce-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root of the project by copying the example file:

```bash
cp .env.example .env
```

Now, open the `.env` file and fill in all the required values for the database, JWT secrets, and external service API keys.

### 4. Run the Server

For development with automatic reloading via `nodemon`:

```bash
npm run dev
```

For a standard production start:

```bash
npm start
```

The server will be running at `http://localhost:5000` (or the port specified in your `.env` file).

---

##  AI Chatbot & Vector Search Setup

The chatbot uses MongoDB Atlas Vector Search for its advanced semantic search capabilities. This requires a one-time setup in your Atlas cluster.

### 1. Create the Vector Search Index

You must create a vector search index on the `products` collection in your MongoDB Atlas cluster.

1.  Navigate to your cluster in Atlas and click the **Search** tab.
2.  Click **Create Search Index** and choose the **JSON Editor** option.
3.  Select the correct database and the `products` collection.
4.  Give the index a name (e.g., `vector_index`). This name must match the `index` field in the `$vectorSearch` stage in `chatbotController.js`.
5.  Paste the following JSON configuration. This configuration assumes your embedding model (like `text-embedding-3-small`) produces vectors of **1536** dimensions. If you use a different model, you must update the `dimension` value.

```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "description_embedding": {
        "type": "vector",
        "dimension": 1536,
        "similarity": "cosine"
      }
    }
  }
}
```

### 2. Backfill Embeddings for Existing Products

While new products will automatically have their descriptions converted to vector embeddings upon creation, your existing products need to be processed. The provided backfill script handles this.

This script finds all products without an embedding, generates one using the OpenAI API, and saves it to the database. It processes products in batches to ensure stability and avoid rate limits.

```bash
npm run backfill:embeddings
```

---

##  Payment & Order Flow

The system uses a robust, webhook-driven flow for online payments to ensure reliability.

1.  **Payment Initiation**: The frontend sends a request to `/api/v1/payments/initiate` with the chosen `paymentMethod` (`stripe`, `paymob`, or `fawry`).
2.  **Frontend Action**:
    -   For **Stripe**, the backend returns a `clientSecret`, which the frontend uses with Stripe.js to render the payment form.
    -   For **Paymob** or **Fawry**, the backend returns a `redirectUrl`, and the frontend redirects the user to this URL to complete payment.
3.  **Webhook Confirmation**: After a successful payment, the payment provider sends an asynchronous request to our secure webhook endpoint (e.g., `/api/v1/webhooks/stripe`).
4.  **Order Creation**: The webhook handler verifies the incoming request's authenticity. If valid, it calls the `createOrderAfterPayment` function, which creates the official order in the database, updates product stock, and clears the user's cart.

For **Cash on Delivery (COD)**, the flow is simpler and synchronous. The frontend calls `/api/v1/orders/cod`, which immediately creates the order.

---

##  Project Structure

```
ecommerce-backend/
├── config/             # Database, logging, and other configurations
├── controllers/        # Express route handlers (the "C" in MVC)
├── middleware/         # Custom middleware (error handling, validation)
├── models/             # Mongoose schemas and models (the "M" in MVC)
├── routes/             # Express route definitions
├── scripts/            # Utility scripts (e.g., data backfilling)
├── services/           # Business logic abstracted from controllers
├── utils/              # Reusable utility functions and classes
├── .env.example        # Example environment variables
├── app.js              # Express application setup
└── server.js           # Main server entry point
```

---

##  API Documentation

Once the server is running, comprehensive and interactive API documentation is available via Swagger UI at:

**http://localhost:5000/api-docs**

This interface allows you to explore all available endpoints, view their required parameters and schemas, and test them directly from your browser.

---

##  Available Scripts

In the project directory, you can run the following commands:

-   `npm run dev`: Starts the server in development mode with `nodemon` for automatic restarts.
-   `npm start`: Starts the server in production mode.
-   `npm run backfill:embeddings`: Runs the script to generate and save vector embeddings for existing products in the database.

```

