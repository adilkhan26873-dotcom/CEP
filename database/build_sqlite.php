<?php
chdir(__DIR__);
$dbPath = 'panipuri_db.sqlite';
if (file_exists($dbPath)) {
    unlink($dbPath);
}
$pdo = new PDO('sqlite:' . $dbPath);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$pdo->exec("CREATE TABLE users (
  user_id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  status TEXT NOT NULL DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);");

$pdo->exec("CREATE TABLE customers (
  customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  mobile_no TEXT,
  email TEXT,
  address TEXT,
  total_spent REAL NOT NULL DEFAULT 0.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);");

$pdo->exec("CREATE TABLE products (
  item_id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  price_per_plate REAL NOT NULL,
  available_qty INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'Plate',
  status TEXT NOT NULL DEFAULT 'In Stock',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);");

$pdo->exec("CREATE TABLE ingredients (
  ingredient_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  stock REAL NOT NULL DEFAULT 0.0,
  reorder_level REAL NOT NULL DEFAULT 10.0,
  cost_per_unit REAL NOT NULL DEFAULT 0.0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);");

$pdo->exec("CREATE TABLE recipes (
  recipe_id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER NOT NULL,
  ingredient_id INTEGER NOT NULL,
  required_quantity REAL NOT NULL,
  FOREIGN KEY (item_id) REFERENCES products(item_id),
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(ingredient_id)
);");

$pdo->exec("CREATE TABLE bills (
  bill_id INTEGER PRIMARY KEY AUTOINCREMENT,
  bill_no TEXT NOT NULL UNIQUE,
  customer_id INTEGER,
  customer_name TEXT NOT NULL DEFAULT 'Walk-in Customer',
  customer_phone TEXT,
  user_id INTEGER,
  total_items INTEGER NOT NULL DEFAULT 0,
  total_amount REAL NOT NULL DEFAULT 0.0,
  payment_mode TEXT NOT NULL DEFAULT 'Cash',
  status TEXT NOT NULL DEFAULT 'Paid',
  bill_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);");

$pdo->exec("CREATE TABLE bill_items (
  bill_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
  bill_id INTEGER NOT NULL,
  item_id INTEGER NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price REAL NOT NULL,
  subtotal REAL NOT NULL,
  FOREIGN KEY (bill_id) REFERENCES bills(bill_id),
  FOREIGN KEY (item_id) REFERENCES products(item_id)
);");

$pdo->exec("INSERT INTO users (user_id, full_name, username, password, role) VALUES 
  (1, 'Administrator', 'admin', 'admin123', 'admin'),
  (2, 'Adil Khan', 'adil', 'adil123', 'admin'),
  (3, 'Shop Assistant', 'staff', 'staff123', 'staff');");

$pdo->exec("INSERT INTO customers (customer_id, name, mobile_no, email, address, total_spent) VALUES
  (1, 'Amit Sharma', '9876543210', 'amit@example.com', 'Chembur, Mumbai', 240.0),
  (2, 'Neha Khan', '9820012345', 'neha@example.com', 'Kurla, Mumbai', 180.0),
  (3, 'Rahul Verma', '9819988776', 'rahul.v@example.com', 'Ghatkopar, Mumbai', 90.0),
  (4, 'Priya Patel', '9833445566', 'priya.p@example.com', 'Sion, Mumbai', 150.0);");

$pdo->exec("INSERT INTO products (item_id, item_name, category, price_per_plate, available_qty, unit, status) VALUES
  (1, 'Pani Puri Plate', 'Pani Puri', 30.0, 100, 'Plate', 'In Stock'),
  (2, 'Masala Puri Plate', 'Pani Puri', 40.0, 80, 'Plate', 'In Stock'),
  (3, 'Dahi Puri Plate', 'Chaat', 60.0, 50, 'Plate', 'In Stock'),
  (4, 'Sev Puri Plate', 'Chaat', 50.0, 60, 'Plate', 'In Stock'),
  (5, 'Ragda Puri Plate', 'Chaat', 50.0, 45, 'Plate', 'In Stock'),
  (6, 'Extra Puri (6 Pcs)', 'Extras', 10.0, 150, 'Packet', 'In Stock'),
  (7, 'Sweet Chutney (Jar)', 'Chutney', 20.0, 40, 'Bottle', 'In Stock'),
  (8, 'Spicy Teekha Pani (1L)', 'Pani', 15.0, 50, 'Bottle', 'In Stock');");

$pdo->exec("INSERT INTO ingredients (ingredient_id, name, unit, stock, reorder_level, cost_per_unit) VALUES
  (1, 'Puri Shells', 'pieces', 1200.0, 200.0, 0.40),
  (2, 'Boiled Potatoes (Aloo)', 'kg', 25.0, 5.0, 30.0),
  (3, 'White Peas Ragda', 'kg', 18.0, 4.0, 45.0),
  (4, 'Fresh Mint & Coriander', 'kg', 6.0, 1.5, 60.0),
  (5, 'Tamarind & Jaggery Pulp', 'kg', 10.0, 2.0, 80.0),
  (6, 'Nylon Crisp Sev', 'kg', 15.0, 3.0, 120.0),
  (7, 'Fresh Whipped Dahi', 'kg', 8.0, 2.0, 70.0),
  (8, 'Chaat Masala & Kala Namak', 'kg', 4.0, 1.0, 150.0);");

$pdo->exec("INSERT INTO bills (bill_id, bill_no, customer_id, customer_name, customer_phone, user_id, total_items, total_amount, payment_mode) VALUES
  (1, 'INV-100001', 1, 'Amit Sharma', '9876543210', 1, 4, 150.0, 'UPI / Online'),
  (2, 'INV-100002', 2, 'Neha Khan', '9820012345', 1, 3, 130.0, 'Cash'),
  (3, 'INV-100003', 3, 'Rahul Verma', '9819988776', 1, 2, 90.0, 'Cash');");

$pdo->exec("INSERT INTO bill_items (bill_item_id, bill_id, item_id, item_name, quantity, price, subtotal) VALUES
  (1, 1, 1, 'Pani Puri Plate', 2, 30.0, 60.0),
  (2, 1, 4, 'Sev Puri Plate', 1, 50.0, 50.0),
  (3, 1, 2, 'Masala Puri Plate', 1, 40.0, 40.0),
  (4, 2, 3, 'Dahi Puri Plate', 1, 60.0, 60.0),
  (5, 2, 5, 'Ragda Puri Plate', 1, 50.0, 50.0),
  (6, 2, 7, 'Sweet Chutney (Jar)', 1, 20.0, 20.0),
  (7, 3, 1, 'Pani Puri Plate', 1, 30.0, 30.0),
  (8, 3, 3, 'Dahi Puri Plate', 1, 60.0, 60.0);");

echo "SQLite database panipuri_db.sqlite successfully created and seeded!\n";
