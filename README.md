# Farmers Market — Full-Stack Agricultural Marketplace

The **Farmers Market** is a comprehensive, full-stack application designed to streamline the buying and selling of agricultural products. It serves as a central hub connecting **Farmers** (buyers), **Managers** (sellers), and **Admins**, eliminating manual processes to provide a structured, transparent, and efficient marketplace. The system also integrates an on-device local LLM (Ollama) to act as a conversational assistant that can both **query data** and **perform create/update operations** through natural language.

---

## Features

- **Role-Based Access Control**: Segregated workflows for Farmers, Managers, and Admins with JWT-authenticated sessions.
- **Location-Based Inventory**: Managers maintain regional inventory tracked by ZIP Codes, with multi-zip search support for buyers.
- **Category Management**: Admin-controlled product categories — managers select from predefined categories only.
- **Rich Media Support**: Integrated Base64 image uploads for products directly embedded within MongoDB.
- **Smart Buy Flow**: Interactive order modal collecting quantity, delivery address, and payment details with live total calculation.
- **Order Lifecycle**: Full status tracking (Pending → Accepted → Dispatched → Delivered) with automatic inventory restore on rejection.
- **Reviews System**: One-review-per-product enforcement, with dedicated review tabs for both Farmers and Managers.
- **AI Chat Widget ("Farm Assistant")**: A persistent side-panel chatbot powered by `llama3.2` via Ollama — supports **read queries**, **product creation/updates**, and **order status changes** via natural language.
- **Cloud Database**: All data persisted to MongoDB Atlas for reliability and easy access.

---

## Technology Stack

| Component | Technology | Description |
| --------- | ---------- | ----------- |
| **Frontend** | React 19 + Vite 8 | Responsive UI with glassmorphism design and Lucide icons. |
| **Backend** | Spring Boot 4 (Java 21) | REST API with Spring Security (JWT), Spring Data MongoDB. |
| **Database** | MongoDB Atlas (Cloud) | Document-based schema on a managed cloud cluster. |
| **AI LLM** | Ollama (`llama3.2`) | Local LLM running in a Docker container (3B parameter version). |
| **Containerization** | Docker (Ollama only) | Ollama runs in Docker; backend and frontend run natively. |

---

## Prerequisites

- **Java 21** - [Eclipse Temurin JDK 21](https://adoptium.net/) (install via `winget install EclipseAdoptium.Temurin.21.JDK`)
- **Node.js 20+** - [https://nodejs.org](https://nodejs.org)
- **Docker Desktop** - [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)

---

## Getting Started



### 1. Start the Backend (Spring Boot)

Open a terminal in the project root:

```bash
cd backend
# Windows PowerShell:
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.10.7-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
.\mvnw.cmd spring-boot:run
```

The API server will start on **http://localhost:8080**.

### 2. Start the Frontend (React + Vite)

Open another terminal:

```bash
cd frontend
npm install   # first time only
npm run dev
```

The application will be available at **http://localhost:5173**.

---

## Walkthrough & Usage Guide

> **Note**: A full Postman collection is included in the project root: `FarmersMarket_Postman_Collection.json`. Import this into Postman to easily test the REST API.

### Step 1 — Admin Setup (Super Admin)

> Log in with `admin_test1@example.com` / `Admin123!` (see Demo Credentials below).

1. Open [http://localhost:5173](http://localhost:5173) and sign in as **Admin**.
2. Go to the **Categories** tab and create categories (e.g., "Vegetables", "Seeds", "Fertilizers", "Tools").
   - These categories will appear as dropdown options for Managers when creating products.
3. Go to the **Users** tab to manage all registered users:
   - **Verify** managers (change status to "verified").
   - **Suspend** or **Reactivate** users.
   - **Delete** users if needed.
4. Go to the **Products** tab to view all products across all managers:
   - Click a row to **expand** and see full details (description, inventory breakdown, manager ID, creation date).
   - Use the **Edit** button to modify product name, category, unit, or description.
   - Use the **Delete** button to remove products.

### Step 2 — Manager Setup (Seller)

> Log in with `mgr_test1@example.com` / `Manager123!`, or register a new Manager account.

1. Open [http://localhost:5173](http://localhost:5173) and sign in or create a **Manager (Seller)** account.
   - During registration, provide your serviceable zip codes (e.g., `10001, 10002`).
2. In the **Products** tab:
   - Click **"Add New Product"** — fill in name, select a **category from the dropdown** (admin-defined), select a **unit from the dropdown**, description, and optionally upload an image.
   - The "My Products" table shows all your products with a **Delete** button.
3. In the **Manage Inventory** panel:
   - Select a product, select a **zip code from the dropdown** (predefined from your registration), quantity, and price.
   - You can add inventory for multiple zip codes per product.
4. In the **Inventory** tab — see a card-based overview of all products with their inventory details.
5. In the **Received Orders** tab — manage incoming orders:
   - **Accept** or **Reject** pending orders (rejecting restores the deducted inventory).
   - **Dispatch** accepted orders.
   - **Mark as Delivered** when dispatched orders arrive.
6. In the **Reviews** tab — see all customer reviews grouped by product.

### Step 3 — Farmer Workflow (Buyer)

> Log in with `farmer_test1@example.com` / `Farmer123!`, or register a new Farmer account.

1. Sign in as a **Farmer (Buyer)**.
2. In the **Marketplace** tab:
   - Enter one or more zip codes in the search bar (e.g., `10001, 10002`) and click **Search**.
   - Optionally, click the **category checkboxes** to instantly filter by product type (e.g., only "Seeds" and "Vegetables").
   - Only products with **available inventory (> 0)** are displayed. A badge indicating the **matched zip code** is displayed on the product.
   - If a product has reviews, a **⭐ X Reviews** badge appears under the description. Click it to read all reviews left by other farmers for that product.
3. Click **"Buy"** on a product — a **modal dialog** opens:
   - Set the **quantity** (max limited to available stock).
   - Fill in your **delivery address** (street, city, state, zip — zip is pre-filled from your search).
   - Choose a **payment method** (Credit Card / UPI / Cash on Delivery).
   - If Credit Card, enter **card number** and **name on card** (dummy values accepted).
   - Review the **total amount** and click **"Confirm Order"**.
4. In the **My Orders** tab:
   - Track all your orders with status badges (Pending → Accepted → Dispatched → Delivered).
   - Once an order is **Delivered**, a **"Review"** button appears next to each item.
   - Click it to write a review (1–5 stars + comment). You can only review each product **once**.
5. In the **My Reviews** tab — see all your submitted reviews with ratings and dates.

### Step 4 — Farm Assistant (AI Chat)

The **Farm Assistant** is the always-visible sidebar on the right side of the screen.

#### Read Queries (All Roles)
| Try saying... | What happens |
|---|---|
| *"Show all products"* | Fetches and lists products from MongoDB |
| *"Products in zip 10001"* | Searches inventory by zip code |
| *"How many pending orders?"* | Counts orders by status |
| *"List all farmers"* | Lists users by role (Admin only) |
| *"What is the total revenue?"* | Sums all payments (Admin only) |

#### Write Operations (Manager/Admin)
| Try saying... | What happens |
|---|---|
| *"Create a product called Wheat with category Grains, unit kg"* | Creates a new product |
| *"Update product Wheat, change category to Cereals"* | Updates the product |
| *"Accept order ORD12345"* | Changes order status to Accepted |

#### General Chat (All Roles)
| Try saying... | What happens |
|---|---|
| *"What fertilizers are best for rice?"* | LLM gives farming advice |
| *"What is organic farming?"* | LLM explains the concept |

> The system uses `llama3.2` to classify your intent, then either executes a MongoDB query, performs a write operation, or responds conversationally.

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Manager (Seller) | `mgr_test1@example.com` | `Manager123!` |
| Farmer (Buyer) | `farmer_test1@example.com` | `Farmer123!` |
| Admin | `admin_test1@example.com` | `Admin123!` |

### Verify on MongoDB Atlas

1. Log into [MongoDB Atlas](https://cloud.mongodb.com).
2. Navigate to **Cluster0 → Browse Collections**.
3. You will see the `agri_market_db` database with collections: `users`, `products`, `orders`, `payments`, `reviews`, `categories`, `zipCodes`.

---

## Project Structure

```
agrimarket/
├── backend/                    # Spring Boot Java API
│   ├── src/main/java/com/farmer/backend/
│   │   ├── config/             # MongoConfig (Atlas connection)
│   │   ├── controller/         # REST controllers (Auth, Product, Order, Review, Chat, Admin, Category, ZipCode)
│   │   ├── dto/                # Data Transfer Objects (ChatRequest, QueryIntent, etc.)
│   │   ├── model/              # MongoDB document entities (Product, Order, Review, User, etc.)
│   │   ├── repository/         # Spring Data MongoDB repositories
│   │   ├── security/           # JWT auth, filters, Spring Security config
│   │   └── service/            # Business logic (OrderService, ChatService, ProductService, QueryExecutorService)
│   └── src/main/resources/
│       └── application.properties
├── frontend/                   # React + Vite UI
│   ├── src/
│   │   ├── components/         # Auth, FarmerDashboard, ManagerDashboard, AdminDashboard, ChatWidget
│   │   ├── config.js           # Centralized API endpoints & constants
│   │   ├── App.jsx             # Root component with routing
│   │   └── index.css           # Global styles (glassmorphism theme, modals)
│   ├── .env                    # Environment variables (API URL, app name)
│   └── vite.config.js
├── docker-compose.yml          # Ollama container only
├── CHANGELOG.md                # Detailed fixes & improvements log
└── README.md
```

---

## API Endpoints Reference

### Authentication
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/signup` | Public | Register a new user |
| POST | `/api/auth/signin` | Public | Login and receive JWT token |

### Products
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/products` | Public | List all products |
| GET | `/api/products/{id}` | Public | Get product by ID |
| GET | `/api/products/search?zipCode=10001,10002&categories=Seeds&categories=Tools` | Public | Search with multi-zip + category filter |
| GET | `/api/products/category/{category}` | Public | Filter by category |
| GET | `/api/products/manager/{managerId}` | Manager/Admin | Get manager's products |
| POST | `/api/products` | Manager/Admin | Create or update a product |
| DELETE | `/api/products/{id}` | Manager/Admin | Delete a product |
| POST | `/api/products/{id}/inventory` | Manager | Add/update inventory for a product |

### Orders
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/orders?paymentMethod=credit_card` | Farmer | Place a new order |
| GET | `/api/orders/farmer/{farmerId}` | Farmer/Admin | Get farmer's orders |
| GET | `/api/orders/manager/{managerId}` | Manager/Admin | Get orders for manager's products |
| GET | `/api/orders/{id}` | Public | Get order by ID |
| PUT | `/api/orders/{id}/status?status=Accepted` | Manager/Admin | Update order status (restores inventory on Rejected) |

### Reviews
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/reviews` | Farmer | Submit a review (one per product, 409 on duplicate) |
| GET | `/api/reviews/product/{productId}` | Public | Get reviews for a product |
| GET | `/api/reviews/farmer/{farmerId}` | Farmer/Admin | Get reviews by a farmer |
| DELETE | `/api/reviews/{id}` | Admin | Delete a review |

### Admin
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/admin/users` | Admin | List all users |
| PUT | `/api/admin/users/{id}/status?status=verified` | Admin | Update user status |
| DELETE | `/api/admin/users/{id}` | Admin | Delete a user |

### Categories & Zip Codes
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/categories` | Public | List all categories |
| POST | `/api/categories` | Admin | Create a category |
| DELETE | `/api/categories/{id}` | Admin | Delete a category |
| GET | `/api/zipcodes` | Public | List all zip codes |
| POST | `/api/zipcodes` | Admin | Create a zip code |
| DELETE | `/api/zipcodes/{id}` | Admin | Delete a zip code |

### Chat (AI Assistant)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/chat` | Authenticated | Send a message — supports read, create, update, and general chat |

---

## Configuration

### MongoDB Atlas
The connection string is configured in `backend/src/main/resources/application.properties`:
```properties
spring.data.mongodb.uri=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/agri_market_db
```

### Ollama LLM
The model and API endpoint are also in `application.properties`:
```properties
ollama.api.url=http://localhost:11434/api/generate
ollama.model=llama3.2
```

### Frontend Environment
Environment variables are in `frontend/.env`:
```properties
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_NAME=Farmers Market
```

---

## Database Schema (MongoDB Collections)

| Collection | Key Fields | Description |
|------------|-----------|-------------|
| `users` | name, email, role, phone, address, serviceableZipCodes, status | Farmers, Managers, Admins |
| `products` | name, description, category, unit, managerId, inventory[], images[] | Products with embedded inventory per zip code |
| `orders` | orderId, farmerId, items[], totalAmount, currentStatus, statusHistory[], deliveryAddress | Orders with lifecycle tracking |
| `payments` | paymentId, orderId, farmerId, amount, method, status | Payment records linked to orders |
| `reviews` | reviewId, productId, farmerId, rating, comment, reviewDate | Product reviews (one per farmer per product) |
| `categories` | name, description | Admin-managed product categorization |
| `zipCodes` | code, city, state | Location reference data |
