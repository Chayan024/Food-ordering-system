# 🍔 FlavorDash - Full-Stack Online Food Ordering System

A production-ready full-stack Online Food Ordering System built with **Next.js 15 (App Router, React 19, TypeScript)**, **Prisma ORM**, and **SQLite/PostgreSQL**.

Built strictly according to SRS specifications, featuring 4 distinct role classes:
1. 👤 **Customer**: Restaurant discovery, multi-criteria filtering, cart management, checkout with coupons, mock payment processing, and live GPS order tracking with interactive route maps.
2. 👨‍🍳 **Restaurant Staff**: Store toggle (open/close), live kitchen Kanban order queue (Accept, Prepare, Ready for Driver), and menu catalog editor.
3. 🛵 **Delivery Partner**: Online/offline shifts, available delivery pool, trip acceptance, 4-stage delivery state transitions, live navigation, and earnings dashboard.
4. 🛡️ **Administrator**: Platform overview, gross revenue analytics, top dishes leaderboard, user & role permissions manager, restaurant moderation, coupon campaign engine, and support disputes desk with CSV exports.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+ (v20+ recommended)
- npm or yarn

### 2. Install & Database Setup
```bash
# Navigate to project directory
cd food-ordering-system

# Install dependencies
npm install

# Push database schema & generate Prisma Client
npx prisma db push

# Seed database with demo accounts, restaurants & dishes
npx tsx prisma/seed.ts
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Pre-Seeded Demo Accounts (Password for all: `password123`)

| Role | Email | Password | Key Portal |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@example.com` | `password123` | `/` and `/orders` |
| **Restaurant Staff** | `staff@bellaitalia.com` | `password123` | `/restaurant/dashboard` and `/restaurant/menu` |
| **Delivery Partner** | `driver@example.com` | `password123` | `/delivery/dashboard` |
| **Administrator** | `admin@fooddelivery.com` | `password123` | `/admin`, `/admin/users`, `/admin/coupons` |

> 💡 **Tip**: Use the **"Switch Demo Role"** button in the top navigation bar to switch between any of the 4 roles with 1 click!

---

## 🧪 Automated Testing

Run the automated Vitest test suite:
```bash
npm run test
```
Covering:
- Registration & Bcrypt password hashing
- Restaurant search, cuisine & veg filters
- Cart calculations & 5% tax math
- Payment gateway simulation & failure rollback
- Role-based Access Control (RBAC) access denial

---

## 🐳 Docker Deployment

```bash
docker-compose up --build -d
```
The application will be accessible at [http://localhost:3000](http://localhost:3000).

---

## 📂 Architecture Overview

```
food-ordering-system/
├── prisma/
│   ├── schema.prisma       # 12 relational models & enums
│   └── seed.ts             # Comprehensive demo data seeder
├── src/
│   ├── app/
│   │   ├── api/            # REST API endpoints (Auth, Orders, Cart, Payments, Delivery, Admin)
│   │   ├── admin/          # Administrator portal pages
│   │   ├── restaurant/     # Restaurant staff kitchen & menu pages
│   │   ├── delivery/       # Delivery fleet portal pages
│   │   ├── checkout/       # Checkout & payment processing
│   │   ├── orders/         # Live order tracking & customer order history
│   │   ├── restaurant/[id] # Restaurant menu & review browsing
│   │   └── page.tsx        # Customer restaurant discovery
│   ├── components/
│   │   ├── cart/           # CartDrawer, ConflictModal
│   │   ├── layout/         # Navbar, Footer, Role Switcher
│   │   ├── notifications/  # NotificationCenter & Toast Alerts
│   │   └── tracking/       # DeliveryMap (Live GPS route simulation)
│   ├── context/            # AuthContext, CartContext
│   ├── lib/                # Prisma client, Auth, Validation, Maps, Payment Gateway
│   ├── styles/             # globals.css custom design system
│   └── middleware.ts       # RBAC Route Protection Middleware
├── tests/                  # Vitest automated test files
├── Dockerfile              # Multi-stage production container
└── docker-compose.yml      # Orchestration config
```
