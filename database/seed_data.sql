-- =============================================================================
-- INVENTORY & BILLING SOFTWARE FOR LOCAL SHOPS (PANI PURI SHOP)
-- Course: T.Y.BSc. IT - CEP Project Sample Seed Data
-- =============================================================================

USE `panipuri_db`;

-- -----------------------------------------------------------------------------
-- Seed: users
-- Default credentials:
-- 1. admin / admin123
-- 2. staff / staff123
-- -----------------------------------------------------------------------------
INSERT INTO `users` (`user_id`, `full_name`, `username`, `password`, `role`, `status`) VALUES
(1, 'Administrator', 'admin', 'admin123', 'admin', 'active'),
(2, 'Adil Khan', 'adil', 'adil123', 'admin', 'active'),
(3, 'Shop Assistant', 'staff', 'staff123', 'staff', 'active');

-- -----------------------------------------------------------------------------
-- Seed: customers
-- -----------------------------------------------------------------------------
INSERT INTO `customers` (`customer_id`, `name`, `mobile_no`, `email`, `address`, `total_spent`) VALUES
(1, 'Amit Sharma', '9876543210', 'amit@example.com', 'Chembur, Mumbai', 240.00),
(2, 'Neha Khan', '9820012345', 'neha@example.com', 'Kurla, Mumbai', 180.00),
(3, 'Rahul Verma', '9819988776', 'rahul.v@example.com', 'Ghatkopar, Mumbai', 90.00),
(4, 'Priya Patel', '9833445566', 'priya.p@example.com', 'Sion, Mumbai', 150.00);

-- -----------------------------------------------------------------------------
-- Seed: products
-- -----------------------------------------------------------------------------
INSERT INTO `products` (`item_id`, `item_name`, `category`, `price_per_plate`, `available_qty`, `unit`, `status`) VALUES
(1, 'Pani Puri Plate', 'Pani Puri', 30.00, 100, 'Plate', 'In Stock'),
(2, 'Masala Puri Plate', 'Pani Puri', 40.00, 80, 'Plate', 'In Stock'),
(3, 'Dahi Puri Plate', 'Chaat', 60.00, 50, 'Plate', 'In Stock'),
(4, 'Sev Puri Plate', 'Chaat', 50.00, 60, 'Plate', 'In Stock'),
(5, 'Ragda Puri Plate', 'Chaat', 50.00, 45, 'Plate', 'In Stock'),
(6, 'Extra Puri (6 Pcs)', 'Extras', 10.00, 150, 'Packet', 'In Stock'),
(7, 'Sweet Chutney (Jar)', 'Chutney', 20.00, 40, 'Bottle', 'In Stock'),
(8, 'Spicy Teekha Pani (1L)', 'Pani', 15.00, 50, 'Bottle', 'In Stock');

-- -----------------------------------------------------------------------------
-- Seed: ingredients (Raw kitchen stock)
-- -----------------------------------------------------------------------------
INSERT INTO `ingredients` (`ingredient_id`, `name`, `unit`, `stock`, `reorder_level`, `cost_per_unit`) VALUES
(1, 'Puri Shells', 'pieces', 1200.00, 200.00, 0.40),
(2, 'Boiled Potatoes (Aloo)', 'kg', 25.00, 5.00, 30.00),
(3, 'White Peas Ragda', 'kg', 18.00, 4.00, 45.00),
(4, 'Fresh Mint & Coriander', 'kg', 6.00, 1.50, 60.00),
(5, 'Tamarind & Jaggery Pulp', 'kg', 10.00, 2.00, 80.00),
(6, 'Nylon Crisp Sev', 'kg', 15.00, 3.00, 120.00),
(7, 'Fresh Whipped Dahi (Curd)', 'kg', 8.00, 2.00, 70.00),
(8, 'Chaat Masala & Kala Namak', 'kg', 4.00, 1.00, 150.00);

-- -----------------------------------------------------------------------------
-- Seed: recipes (Ingredients needed per plate)
-- -----------------------------------------------------------------------------
INSERT INTO `recipes` (`recipe_id`, `item_id`, `ingredient_id`, `required_quantity`) VALUES
(1, 1, 1, 6.00),   -- Pani Puri Plate needs 6 Puris
(2, 1, 2, 0.08),   -- 80g potato
(3, 1, 4, 0.05),   -- 50g mint water base
(4, 3, 1, 6.00),   -- Dahi Puri Plate needs 6 Puris
(5, 3, 7, 0.12),   -- 120g Curd
(6, 3, 6, 0.03),   -- 30g Sev
(7, 4, 1, 6.00),   -- Sev Puri Plate needs 6 Puris
(8, 4, 2, 0.08),   -- 80g Potato
(9, 4, 6, 0.04);   -- 40g Sev

-- -----------------------------------------------------------------------------
-- Seed: bills & bill_items (Sample transactions)
-- -----------------------------------------------------------------------------
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
