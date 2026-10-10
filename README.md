# 🛍️ SmartShop Frontend

> **React + Vite frontend for the SmartShop E-Commerce Platform — a complete online retail and order management application built for Indian consumers.**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📌 Project Description

SmartShop Frontend is a modern, responsive **React single-page application (SPA)** powering the SmartShop e-commerce platform. It connects to a Spring Boot REST API backend to provide a complete online shopping experience including product browsing, cart management, checkout, order tracking, and a full admin dashboard.

---

## ✨ Features

### 🛒 Customer Features
| Feature | Description |
|---|---|
| 🔐 **Registration & Login** | JWT-based authentication with persistent sessions |
| 🏠 **Home Page** | Hero banner, featured products, category showcase |
| 📦 **Product Listing** | Browse all products with search, filter, and sort |
| 🔍 **Search & Filter** | Filter by category, brand, price range; sort by price/rating |
| 📄 **Product Details** | Full product page with images, ratings, stock, add-to-cart |
| 🗂️ **Categories** | Electronics, Fashion, Home & Living, Beauty, Sports, Books |
| 🛒 **Shopping Cart** | Add/update/remove items, real-time quantity management |
| 💳 **Checkout** | Shipping address, payment method selection (COD/UPI/Card/NetBanking) |
| 📋 **Order Placement** | Full order creation with stock validation |
| 📦 **My Orders** | Track orders by status; view full order details |
| ❌ **Cancel Order** | Customer-initiated cancellation with reason selection |
| 👤 **User Profile** | View and update name, phone, and password |
| 💬 **Smart Chatbot** | AI-powered shopping assistant for product queries and order help |
| 🎫 **Support Tickets** | Create, view, and reply to customer support tickets |
| ❓ **FAQ Page** | Searchable FAQ with category filters |

### 🛠️ Admin Features
| Feature | Description |
|---|---|
| 📊 **Admin Dashboard** | Revenue, order counts, user stats, recent orders |
| 📦 **Manage Products** | Create, edit, delete products with category assignment |
| 🗂️ **Manage Categories** | Full CRUD for product categories |
| 📋 **Manage Orders** | View all orders, update order status, view cancellations |
| 👥 **Manage Users** | List all users, activate/deactivate accounts |
| 📊 **Inventory** | View low-stock products |
| 📈 **Reports** | Order and revenue analytics |
| 🎫 **Admin Support** | Manage customer tickets, reply to threads |
| ❓ **Admin FAQs** | Create, update, and delete FAQ entries |
| 💬 **Customer Care** | Monitor and join live chatbot conversations |

---

## 🛠️ Technology Stack

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19 | UI framework |
| **Vite** | 8.x | Build tool and dev server |
| **React Router DOM** | v7 | Client-side routing |
| **Axios** | 1.x | HTTP client with interceptors |
| **Context API** | (React built-in) | State management (Auth, Cart) |
| **Vanilla CSS** | Custom | Modern blue customer theme + dark admin dashboard |

---

## 🏗️ Frontend Architecture

```
frontend/
├── public/                    # Static assets
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── Header.jsx         # Global navigation header
│   │   ├── Footer.jsx         # Site footer
│   │   ├── CartItem.jsx       # Cart item card
│   │   ├── OrderCard.jsx      # Order summary card
│   │   ├── ProductCard.jsx    # Product grid card
│   │   ├── ProductGrid.jsx    # Product grid container
│   │   ├── CategoryCard.jsx   # Category display card
│   │   ├── ChatWidget.jsx     # Floating chatbot widget
│   │   ├── CancelOrderModal.jsx # Order cancellation modal
│   │   ├── Toast.jsx          # Notification toast
│   │   ├── Modal.jsx          # Generic modal component
│   │   ├── Loading.jsx        # Loading spinner
│   │   ├── ErrorMessage.jsx   # Error display
│   │   ├── SearchBar.jsx      # Search input
│   │   ├── Sidebar.jsx        # Product filter sidebar
│   │   ├── Pagination.jsx     # Page navigation
│   │   └── AdminSidebar.jsx   # Admin navigation sidebar
│   │
│   ├── context/               # React Context providers
│   │   ├── AuthContext.jsx    # User auth state + JWT storage
│   │   └── CartContext.jsx    # Cart state management
│   │
│   ├── layouts/
│   │   └── AdminLayout.jsx    # Admin panel layout wrapper
│   │
│   ├── pages/                 # Route-level page components
│   │   ├── HomePage.jsx
│   │   ├── ProductListingPage.jsx
│   │   ├── ProductDetailsPage.jsx
│   │   ├── CartPage.jsx
│   │   ├── CheckoutPage.jsx
│   │   ├── OrderConfirmationPage.jsx
│   │   ├── MyOrdersPage.jsx
│   │   ├── UserProfilePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── SupportPage.jsx
│   │   ├── TicketDetailPage.jsx
│   │   ├── FAQPage.jsx
│   │   └── admin/
│   │       ├── AdminDashboard.jsx
│   │       ├── ManageProductsPage.jsx
│   │       ├── ManageCategoriesPage.jsx
│   │       ├── ManageOrdersPage.jsx
│   │       ├── ManageUsersPage.jsx
│   │       ├── InventoryPage.jsx
│   │       ├── ReportsPage.jsx
│   │       ├── AdminSupportPage.jsx
│   │       ├── AdminFAQPage.jsx
│   │       └── AdminCustomerCarePage.jsx
│   │
│   ├── services/              # API service layer
│   │   ├── api.js             # Axios instance + interceptors
│   │   ├── authService.js     # Login, register, token storage
│   │   ├── productService.js  # Product CRUD
│   │   ├── categoryService.js # Category operations
│   │   ├── cartService.js     # Cart management
│   │   ├── orderService.js    # Order operations
│   │   ├── userService.js     # User profile
│   │   ├── chatbotService.js  # Chatbot conversations
│   │   ├── supportService.js  # Support tickets
│   │   └── faqService.js      # FAQ management
│   │
│   ├── App.jsx                # Root component + routing
│   ├── main.jsx               # React entry point
│   ├── index.css              # Global styles + design system
│   └── App.css                # App-level styles
│
├── index.html                 # Vite HTML entry point
├── vite.config.js             # Vite configuration
├── package.json               # Dependencies and scripts
└── .gitignore
```

---

## ✅ Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** 9+ (bundled with Node.js)
- **SmartShop Backend** running at `http://localhost:8080`

---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/SmartShop-Frontend.git
cd SmartShop-Frontend

# Install dependencies
npm install
```

---

## ▶️ Running the Application

### Development Server

```bash
npm run dev
```

The application opens at: **http://localhost:5173**

### Production Build

```bash
npm run build
```

Built files are output to `dist/`.

### Preview Production Build

```bash
npm run preview
```

---

## 🔧 Backend API Configuration

The frontend connects to the Spring Boot backend via Axios.

**Default backend URL:** `http://localhost:8080`

To change the backend URL, edit `src/services/api.js`:

```js
const API_BASE_URL = 'http://localhost:8080'; // Change this
```

### JWT Authentication

- Tokens are stored in `localStorage` under key `smartshop_token`
- The Axios request interceptor automatically attaches the Bearer token
- Token expires after 24 hours

### Default Test Accounts (auto-seeded by backend)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@smartshop.com` | `admin123` |
| Customer | `customer@smartshop.com` | `customer123` |

---

## 📡 Key API Endpoints Used

| Service | Endpoint |
|---|---|
| Auth | `POST /api/auth/login`, `POST /api/auth/register` |
| Products | `GET /api/products`, `GET /api/products/{id}` |
| Categories | `GET /api/categories` |
| Cart | `GET /api/cart`, `POST /api/cart/items` |
| Orders | `POST /api/orders`, `GET /api/orders/user/{userId}` |
| Chatbot | `POST /api/chatbot/message` |
| Support | `POST /api/support/tickets` |
| FAQs | `GET /api/faqs` |

---

## 🎨 Design System

- **Customer Theme:** Modern blue (`#2563eb`) with white backgrounds
- **Admin Theme:** Dark navy/purple dashboard
- **Typography:** System fonts with Inter-like rendering
- **Animations:** CSS transitions for hover effects and modal animations

---

## 🔗 Backend Repository

👉 **[SmartShop-Backend](https://github.com/YOUR_USERNAME/SmartShop-Backend)**

The backend provides the complete REST API, MySQL database integration, JWT authentication, and business logic.

---

## 👤 Contributors

| Name | Role |
|---|---|
| **SmartShop Team** | Full-Stack Developer |

---

*SmartShop – E-Commerce Platform for Online Retail and Order Management*
