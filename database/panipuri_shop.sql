-- =============================================================================
-- ALL-IN-ONE DATABASE SCRIPT FOR PHP-MYADMIN / MYSQL
-- Project: Inventory & Billing Software for Local Shops (Pani Puri Shop)
-- Student: Khan Adil Salim (T.Y.BSc. IT)
-- Institute: N.G. Acharya & D.K. Marathe College, Chembur (University of Mumbai)
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

-- 1. Table: users
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

-- 2. Table: customers
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

-- 3. Table: products (Pani Puri Item)
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

-- 4. Table: ingredients
CREATE TABLE `ingredients` (
  `ingredient_id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `unit` VARCHAR(20) NOT NULL,
  `stock` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `reorder_level` DECIMAL(10,2) NOT NULL DEFAULT 10.00,
  `cost_per_unit` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_ingredient_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Table: recipes
CREATE TABLE `recipes` (
  `recipe_id` INT AUTO_INCREMENT PRIMARY KEY,
  `item_id` INT NOT NULL,
  `ingredient_id` INT NOT NULL,
  `required_quantity` DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (`item_id`) REFERENCES `products` (`item_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`ingredient_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY `uk_item_ingredient` (`item_id`, `ingredient_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Table: bills
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

-- 7. Table: bill_items
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

-- Seed: users
INSERT INTO `users` (`user_id`, `full_name`, `username`, `password`, `role`, `status`) VALUES
(1, 'Administrator', 'admin', 'admin123', 'admin', 'active'),
(2, 'Adil Khan', 'adil', 'adil123', 'admin', 'active'),
(3, 'Shop Assistant', 'staff', 'staff123', 'staff', 'active');

-- Seed: customers
INSERT INTO `customers` (`customer_id`, `name`, `mobile_no`, `email`, `address`, `total_spent`) VALUES
(1, 'Amit Sharma', '9876543210', 'amit@example.com', 'Chembur, Mumbai', 240.00),
(2, 'Neha Khan', '9820012345', 'neha@example.com', 'Kurla, Mumbai', 180.00),
(3, 'Rahul Verma', '9819988776', 'rahul.v@example.com', 'Ghatkopar, Mumbai', 90.00),
(4, 'Priya Patel', '9833445566', 'priya.p@example.com', 'Sion, Mumbai', 150.00);

-- Seed: products
INSERT INTO `products` (`item_id`, `item_name`, `category`, `price_per_plate`, `available_qty`, `unit`, `status`) VALUES
(1, 'Pani Puri Plate', 'Pani Puri', 30.00, 100, 'Plate', 'In Stock'),
(2, 'Masala Puri Plate', 'Pani Puri', 40.00, 80, 'Plate', 'In Stock'),
(3, 'Dahi Puri Plate', 'Chaat', 60.00, 50, 'Plate', 'In Stock'),
(4, 'Sev Puri Plate', 'Chaat', 50.00, 60, 'Plate', 'In Stock'),
(5, 'Ragda Puri Plate', 'Chaat', 50.00, 45, 'Plate', 'In Stock'),
(6, 'Extra Puri (6 Pcs)', 'Extras', 10.00, 150, 'Packet', 'In Stock'),
(7, 'Sweet Chutney (Jar)', 'Chutney', 20.00, 40, 'Bottle', 'In Stock'),
(8, 'Spicy Teekha Pani (1L)', 'Pani', 15.00, 50, 'Bottle', 'In Stock');

-- Seed: ingredients
INSERT INTO `ingredients` (`ingredient_id`, `name`, `unit`, `stock`, `reorder_level`, `cost_per_unit`) VALUES
(1, 'Puri Shells', 'pieces', 1200.00, 200.00, 0.40),
(2, 'Boiled Potatoes (Aloo)', 'kg', 25.00, 5.00, 30.00),
(3, 'White Peas Ragda', 'kg', 18.00, 4.00, 45.00),
(4, 'Fresh Mint & Coriander', 'kg', 6.00, 1.50, 60.00),
(5, 'Tamarind & Jaggery Pulp', 'kg', 10.00, 2.00, 80.00),
(6, 'Nylon Crisp Sev', 'kg', 15.00, 3.00, 120.00),
(7, 'Fresh Whipped Dahi (Curd)', 'kg', 8.00, 2.00, 70.00),
(8, 'Chaat Masala & Kala Namak', 'kg', 4.00, 1.00, 150.00);

-- Seed: recipes
INSERT INTO `recipes` (`recipe_id`, `item_id`, `ingredient_id`, `required_quantity`) VALUES
(1, 1, 1, 6.00),
(2, 1, 2, 0.08),
(3, 1, 4, 0.05),
(4, 3, 1, 6.00),
(5, 3, 7, 0.12),
(6, 3, 6, 0.03),
(7, 4, 1, 6.00),
(8, 4, 2, 0.08),
(9, 4, 6, 0.04);

-- Seed: bills & bill_items
INSERT INTO `bills` (`bill_id`, `bill_no`, `customer_id`, `customer_name`, `customer_phone`, `user_id`, `total_items`, `total_amount`, `payment_mode`, `status`, `bill_date`) VALUES
(1, 'INV-100001', 1, 'Amit Sharma', '9876543210', 1, 4, 150.00, 'UPI / Online', 'Paid', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 'INV-100002', 2, 'Neha Khan', '9820012345', 1, 3, 130.00, 'Cash', 'Paid', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 'INV-100003', 3, 'Rahul Verma', '9819988776', 1, 2, 90.00, 'Cash', 'Paid', NOW());

INSERT INTO `bill_items` (`bill_item_id`, `bill_id`, `item_id`, `item_name`, `quantity`, `price`, `subtotal`) VALUES
(1, 1, 1, 'Pani Puri Plate', 2, 30.00, 60.00),
(2, 1, 4, 'Sev Puri Plate', 1, 50.00, 50.00),
(3, 1, 2, 'Masala Puri Plate', 1, 40.00, 40.00),
(4, 2, 3, 'Dahi Puri Plate', 1, 60.00, 60.00),
(5, 2, 5, 'Ragda Puri Plate', 1, 50.00, 50.00),
(6, 2, 7, 'Sweet Chutney (Jar)', 1, 20.00, 20.00),
(7, 3, 1, 'Pani Puri Plate', 1, 30.00, 30.00),
(8, 3, 3, 'Dahi Puri Plate', 1, 60.00, 60.00);

-- Reporting Views
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
