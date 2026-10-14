# PaniPuri Shop — Inventory & Billing Management System

**College Evaluation Project (CEP) / Capstone Project**  
**Course:** T.Y.BSc. IT (Semester VI), University of Mumbai  
**Student:** Khan Adil Salim  
**College:** Chembur Trombay Education Society's N.G. Acharya & D.K. Marathe College of Arts, Science & Commerce, Chembur, Mumbai  
**Project Guide:** Mr. Sumit Khedekar  

---

## 📋 Project Overview

The **PaniPuri Shop Inventory & Billing Management System** is a full-featured Point-of-Sale (POS), inventory tracking, and sales analytics application designed specifically for local food businesses and chaat stalls. 

It solves the manual accounting, stock discrepancies, and paper billing problems faced by small food stall owners by providing:
- Real-time inventory tracking and low-stock threshold alerts
- Fast billing counter with automated invoice generation and stock deduction
- Customer directory and transaction history
- Kitchen raw material / ingredient management
- Real-time sales analytics and CSV reporting
- Clean, printable GST/Tax invoice receipts

---

## 🗂️ Project Directory Structure

```text
cep/
├── index.html                      # Main clean semantic HTML interface
├── README.md                       # Complete documentation & setup instructions
│
├── assets/                         # Static assets
│   ├── images/
│   │   └── logo.png                # Extracted high-resolution PaniPuri Shop logo
│   └── icons/                      # Icon assets
│
├── css/                            # Separated modular stylesheets
│   ├── style.css                   # Core design system, layout, cards, modals & tables
│   ├── responsive.css              # Tablet & mobile responsive styles
│   └── print.css                   # Print styling for clean invoice receipt generation
│
├── js/                             # Separated modular JavaScript
│   ├── app.js                      # Application orchestrator, navigation & lifecycle
│   ├── db.js                       # Unified Database & storage abstraction adapter
│   ├── auth.js                     # Login, registration & show/hide password logic
│   ├── inventory.js                # Menu items catalog & stock management
│   ├── billing.js                  # POS billing, cart & invoice generation
│   ├── customers.js                # Customer directory & validation
│   └── reports.js                  # Analytics, metrics calculation & CSV export
│
├── database/                       # Full Relational Database files
│   ├── panipuri_shop.sql           # All-in-one MySQL import script (Schema + Seed data)
│   ├── schema.sql                  # MySQL DDL table schema definitions
│   ├── seed_data.sql               # Initial realistic menu, stock & customer records
│   ├── panipuri_db.sqlite          # Pre-populated portable SQLite database file
│   ├── er_diagram_schema.md        # Comprehensive ER diagram & data dictionary
│   └── build_sqlite.php            # Automated SQLite database generation script
│
├── api/                            # PHP REST API (for XAMPP / Apache / MySQL)
│   ├── config.php                  # Database connection with auto-fallback to SQLite
│   ├── auth.php                    # Login & registration API
│   ├── products.php                # Products CRUD API
│   ├── ingredients.php             # Raw ingredient inventory API
│   ├── customers.php               # Customer directory API
│   ├── bills.php                   # ACID transaction billing & stock deduction API
│   └── reports.php                 # Analytics & sales reporting API
│
└── original/                       # Original monolithic backup files
    ├── cep.final.project.html
    └── cep.final.project_show_password.html
```

---

## 🚀 How to Run the Project

### Option 1: Instant Standalone Mode (Zero Installation)
1. Open the project folder: `C:\Users\Windows 11Pro\Downloads\cep`.
2. Double-click **`index.html`** in any web browser (Google Chrome, Microsoft Edge, Firefox, Brave).
3. The application will launch instantly with the pre-seeded catalog, customers, and demonstration data stored locally in your browser.

### Option 2: Full XAMPP / MySQL / Apache Mode
1. Copy or link this `cep` folder to your XAMPP web root:
   ```text
   C:\xampp\htdocs\cep
   ```
2. Start **Apache** and **MySQL** from the XAMPP Control Panel.
3. Open **phpMyAdmin** in your browser: `http://localhost/phpmyadmin`.
4. Click **Import**, choose the file:
   ```text
   C:\xampp\htdocs\cep\database\panipuri_shop.sql
   ```
   and click **Go**. This creates the `panipuri_db` database with all 7 tables and initial data.
5. Open your browser and navigate to:
   ```text
   http://localhost/cep/index.html
   ```

---

## 🔐 Default Credentials

| Role | Username | Password | Notes |
|---|---|---|---|
| **Admin** | `admin` | `admin123` | Full administrative control |
| **Admin** | `adil` | `adil123` | Student project admin account |
| **Staff** | `staff` | `staff123` | Standard cashier/counter user |

*You can also create a new account anytime using the **"Create New Account"** link on the login screen.*

---

## 🗄️ Database Architecture (Chapter 3 Mapping)

The database schema strictly adheres to the Mumbai University Capstone Project specifications:

1. **`users`** — System access control, cashier/admin accounts.
2. **`customers`** — Customer contact information and loyalty spending.
3. **`products`** — Pani Puri and Chaat menu items, pricing, plate stocks.
4. **`ingredients`** — Raw material kitchen stock (Puris, Potatoes, Ragda, Sev, Chutney, Dahi).
5. **`recipes`** — Relationship table defining ingredient quantities needed per plate.
6. **`bills`** — Master invoice table tracking date, customer, payment mode, and total.
7. **`bill_items`** — Itemized lines for every bill.
8. **`view_daily_sales`** & **`view_low_stock`** — SQL views for reporting queries.

---

## ✨ Improvements Over the Original Monolithic Code

1. **Separation of Concerns:** Split 6.2MB monolithic HTML file into dedicated HTML, CSS, JavaScript, Asset, and Database directories.
2. **Reduced File Size:** Extracted 2MB embedded base64 images into an optimized `assets/images/logo.png` file, making `index.html` lightweight (~15KB) and lightning-fast.
3. **Fixed Corrupted Characters:** Restored broken unicode mojibake (`,1`, `dY...`, `A-`) with proper Indian Rupee (`₹`) symbols, clean UI icons, and food badges.
4. **Added Relational Database:** Created complete MySQL SQL scripts (`schema.sql`, `seed_data.sql`, `panipuri_shop.sql`) plus an SQLite database file.
5. **Complete Backend API:** Built a full PHP REST API with ACID transactions and automatic stock deduction.
6. **Dual Mode Compatibility:** Works both as an instant double-click standalone web app and as a full-stack XAMPP web application.
7. **Original Files Preserved:** Moved original single-file versions into `original/` folder so you always have access to your earlier copies.
