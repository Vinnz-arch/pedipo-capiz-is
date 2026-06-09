# PEDIPO Capiz Economic Dashboard

An integrated Information System and Economic Dashboard designed for the **Provincial Economic Development and Investment Promotion Office (PEDIPO) - Capiz**. This platform features a dual-portal architecture separating Administrative management from Client access.

## 📁 Project Structure

*   **`/server`**: Laravel 11 PHP Framework (REST API)
*   **`/client`**: React + Vite (Frontend SPA)

---

## 🛠️ Tech Stack

### Backend
*   **Framework**: Laravel 11
*   **Language**: PHP 8.2+
*   **Database**: MySQL
*   **Authentication**: Laravel Sanctum (Multi-guard support for Admins & Clients)
*   **Security**: Google reCAPTCHA v2 Integration

### Frontend
*   **Framework**: React 19
*   **Build Tool**: Vite
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **UI Components**: Shadcn UI + Radix UI
*   **Icons**: Lucide React
*   **Notifications**: Sonner (Toast notifications)

---

## 🚀 Core Features

### 👨‍💼 Admin Portal
*   **Dashboard**: High-level overview of system metrics.
*   **Manage Clients**: 
    *   Full CRUD (Create, Read, Update, Delete).
    *   **Lazy Loading**: Infinite scroll pagination for large datasets.
    *   **Activity Logging**: Track Client login/logout history including IP addresses and timestamps.
    *   **Live Search**: Real-time filtering of client directory.
*   **Inquiry Management**: Handle and process economic inquiries.

### 👤 Client Portal
*   **Secure Login**: Dedicated login page with reCAPTCHA protection.
*   **Personal Dashboard**: Modular layout with dedicated sidebar and navbar.
*   **Activity History**: Clients can view their own secure login logs.
*   **Professional UI**: Tailored color palette (#1E3A8A) following the PEDIPO branding.

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
# Configure your DB_DATABASE in .env
php artisan migrate --seed
php artisan serve
```

### 3. Frontend Setup (`/client`)
```bash
cd client
npm install
# Configure VITE_RECAPTCHA_SITE_KEY in .env
npm run dev
```

---

## 📸 System Documentation

### 1. Login Gateways
| Admin Login | Client Login |
| :--- | :--- |
| ![Admin Login Placeholder](https://via.placeholder.com/400x250?text=Admin+Login+Screenshot) | ![Client Login Placeholder](https://via.placeholder.com/400x250?text=Client+Login+Screenshot) |
| *Standard Admin Access* | *Secured with reCAPTCHA* |

### 2. Management Interfaces
#### **Client Directory**
![Manage Clients Screenshot](https://via.placeholder.com/800x400?text=Manage+Clients+Table+with+Lazy+Loading)
*Features: Lazy Loading, Real-time Search, and Overlay Scrollbar.*

#### **Client Activity Logs**
![Activity Logs Screenshot](https://via.placeholder.com/800x400?text=Client+Activity+Logs+Modal)
*Audit trail showing IP addresses and login/logout events.*

---

## 🎥 System Demonstration

[![Watch the Demo](https://via.placeholder.com/600x300?text=Click+to+Watch+System+Demo)](YOUR_VIDEO_LINK_HERE)

---

## 📜 License
Copyright © 2026 PEDIPO - CAPIZ. All rights reserved.
