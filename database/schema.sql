-- =============================================================================
-- INVENTORY & BILLING SOFTWARE FOR LOCAL SHOPS (PANI PURI SHOP)
-- Course: T.Y.BSc. IT (Semester VI) - Capstone / College Evaluation Project (CEP)
-- Database Name: panipuri_db
-- Compatibility: MySQL 5.7+ / MySQL 8.0+ / MariaDB / phpMyAdmin
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `panipuri_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `panipuri_db`;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `bill_items`;
DROP TABLE IF EXISTS `bills`;
DROP TABLE IF EXISTS `recipes`;
DROP TABLE IF EXISTS `ingredients`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `customers`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------------------------------
-- 1. Table: users
-- Purpose: System access, authentication, and role-based permissions
-- -----------------------------------------------------------------------------
CREATE TABLE `users` (
  `user_id` INT AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(100) NOT NULL,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'staff', 'cashier') NOT NULL DEFAULT 'admin',
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. Table: customers
-- Purpose: Stores customer profile details for billing and relationship history
-- -----------------------------------------------------------------------------
CREATE TABLE `customers` (
  `customer_id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `mobile_no` VARCHAR(15) DEFAULT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `total_spent` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_mobile_no` (`mobile_no`),
  INDEX `idx_customer_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. Table: products (Pani Puri Item)
-- Purpose: Catalog of menu dishes and items available for sale
-- -----------------------------------------------------------------------------
CREATE TABLE `products` (
  `item_id` INT AUTO_INCREMENT PRIMARY KEY,
  `item_name` VARCHAR(100) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `price_per_plate` DECIMAL(10,2) NOT NULL,
  `available_qty` INT NOT NULL DEFAULT 0,
  `unit` VARCHAR(20) NOT NULL DEFAULT 'Plate',
  `status` ENUM('In Stock', 'Low Stock', 'Out of Stock') NOT NULL DEFAULT 'In Stock',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_category` (`category`),
  INDEX `idx_item_name` (`item_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. Table: ingredients
-- Purpose: Raw material & ingredient inventory tracking for the kitchen
-- -----------------------------------------------------------------------------
CREATE TABLE `ingredients` (
  `ingredient_id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `unit` VARCHAR(20) NOT NULL, -- e.g., 'kg', 'liters', 'pieces'
  `stock` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `reorder_level` DECIMAL(10,2) NOT NULL DEFAULT 10.00,
  `cost_per_unit` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_ingredient_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. Table: recipes (Recipe / Item Ingredient Mapping)
-- Purpose: Links each menu item to the ingredients required to prepare it
-- -----------------------------------------------------------------------------
CREATE TABLE `recipes` (
  `recipe_id` INT AUTO_INCREMENT PRIMARY KEY,
  `item_id` INT NOT NULL,
  `ingredient_id` INT NOT NULL,
  `required_quantity` DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (`item_id`) REFERENCES `products` (`item_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`ingredient_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY `uk_item_ingredient` (`item_id`, `ingredient_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. Table: bills (Invoices)
-- Purpose: Master records for customer purchase transactions
-- -----------------------------------------------------------------------------
CREATE TABLE `bills` (
  `bill_id` INT AUTO_INCREMENT PRIMARY KEY,
  `bill_no` VARCHAR(30) NOT NULL UNIQUE,
  `customer_id` INT DEFAULT NULL,
  `customer_name` VARCHAR(100) NOT NULL DEFAULT 'Walk-in Customer',
  `customer_phone` VARCHAR(15) DEFAULT NULL,
  `user_id` INT DEFAULT NULL,
  `total_items` INT NOT NULL DEFAULT 0,
  `total_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `payment_mode` ENUM('Cash', 'UPI / Online', 'Card') NOT NULL DEFAULT 'Cash',
  `status` VARCHAR(20) NOT NULL DEFAULT 'Paid',
  `bill_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX `idx_bill_no` (`bill_no`),
  INDEX `idx_bill_date` (`bill_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 7. Table: bill_items (Invoice Line Items)
-- Purpose: Individual products and quantities attached to each bill
-- -----------------------------------------------------------------------------
CREATE TABLE `bill_items` (
  `bill_item_id` INT AUTO_INCREMENT PRIMARY KEY,
  `bill_id` INT NOT NULL,
  `item_id` INT NOT NULL,
  `item_name` VARCHAR(100) NOT NULL,
  `quantity` INT NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `subtotal` DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (`bill_id`) REFERENCES `bills` (`bill_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`item_id`) REFERENCES `products` (`item_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX `idx_bill_items_bill` (`bill_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- DATABASE VIEWS FOR REPORTS & DASHBOARD
-- =============================================================================

CREATE OR REPLACE VIEW `view_daily_sales` AS
SELECT 
  DATE(`bill_date`) AS `sale_date`,
  COUNT(`bill_id`) AS `total_bills`,
  SUM(`total_items`) AS `total_items_sold`,
  SUM(`total_amount`) AS `total_revenue`
FROM `bills`
GROUP BY DATE(`bill_date`)
ORDER BY `sale_date` DESC;

CREATE OR REPLACE VIEW `view_low_stock` AS
SELECT 
  `item_id`,
  `item_name`,
  `category`,
  `price_per_plate`,
  `available_qty`,
  `status`
FROM `products`
WHERE `available_qty` <= 15
ORDER BY `available_qty` ASC;
