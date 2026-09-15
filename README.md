# PEDIPO Capiz Economic Dashboard

An integrated Information System and Economic Dashboard designed for the **Provincial Economic Development and Investment Promotion Office (PEDIPO) - Capiz**. This platform features a dual-portal architecture separating Administrative management from Client/Investor access, powered by a Laravel 11 API backend and a React (Vite + TS) frontend.

---

## 📁 Project Structure

*   **`/server`**: Laravel 11 PHP Framework (REST API)
*   **`/client`**: React + Vite (Frontend SPA)

---

## 🛠️ Tech Stack

### Backend
*   **Framework**: Laravel 11+
*   **Language**: PHP 8.2+
*   **Database**: MySQL
*   **Authentication**: Laravel Sanctum (Bearer token authentication stored in `localStorage`)
*   **Security**: Rate-limiting (`throttle:5,1`) on auth routes, CORS policy restrictions

### Frontend
*   **Framework**: React 19
*   **Build Tool**: Vite
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS & Shadcn UI
*   **Icons**: Lucide React
*   **Notifications**: Sonner (Toast notifications wrapper)

---

## 🚀 Core Features

### 👨‍💼 Admin Portal (Management)
*   **Dashboard**: High-level overview of MSMEs, industries, and system activity logs.
*   **MSME Directory Management**:
    *   Full CRUD (Create, Read, Update, Delete) and approval workflow for businesses.
    *   Image uploads for logos, cover photos, and product galleries.
    *   **Archiving System**: Toggle MSME archives without deleting data.
*   **Investment Management**:
    *   Manage Capiz investment opportunities, PEZA IT parks, and seafood hubs.
    *   Set ROI estimates, land areas, locations, incentive packages, and publishing statuses.
*   **News & Comment CMS**:
    *   Manage articles, uploads, and view comments left by public users.
*   **Inquiry Management**: View and respond to investment and business inquiry submissions.
*   **Landing Page Builder (CMS)**: Modify home hero headers, facts, statistics, and contact information.
*   **User Management**: Configure administrative and staff roles.

### 👤 Client & Investor Portal (Public)
*   **Investor Portal**: Discover registered Capiz priorities, check incentive structures, estimate ROIs, and submit direct inquiries.
*   **MSME Directory**: Search, filter, and view local businesses by category, enterprise size, map locations, and details.
*   **Comparison Tool**: Compare economic indicators (GDP, population, employment, businesses) between multiple Capiz LGUs with automated provincial averages and sync tracking.
*   **MSME Assistance**: Secure application form for MSMEs requesting training, funding, and marketing assistance.
*   **Capiz Municipalities Registry**: Integrated as a static repository in PHP containing LGU profiles, land areas, populations, and classes.

---

## ⚙️ Setup & Installation

### 1. Prerequisites
*   XAMPP / Laragon (PHP 8.2+, MySQL)
*   Composer
*   Node.js & npm

### 2. Backend Setup (`/server`)
```bash
cd server
composer install
cp .env.example .env
php artisan key:generate

# 1. Create a MySQL database named `pedipo_db`
# 2. Configure DB_DATABASE, DB_USERNAME, and DB_PASSWORD in your .env

# Run database migrations and seed baseline data
php artisan migrate --seed

# Start the Laravel local server
php artisan serve
```

### 3. Frontend Setup (`/client`)
```bash
cd client
npm install

# Start the Vite development server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 📜 License
Copyright © 2026 PEDIPO - CAPIZ. All rights reserved.
