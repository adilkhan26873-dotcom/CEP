<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // 1. Total products
    $total_products = (int)$pdo->query("SELECT COUNT(*) FROM products")->fetchColumn();

    // 2. Total stock units
    $total_stock = (int)$pdo->query("SELECT COALESCE(SUM(available_qty), 0) FROM products")->fetchColumn();

    // 3. Today's sales (CURRENT_DATE is standard in both MySQL and SQLite)
    $today_sales = (float)$pdo->query("SELECT COALESCE(SUM(total_amount), 0) FROM bills WHERE DATE(bill_date) = CURRENT_DATE")->fetchColumn();

    // 4. Total customers
    $total_customers = (int)$pdo->query("SELECT COUNT(*) FROM customers")->fetchColumn();

    // 5. Total lifetime revenue & items sold
    $revenue_stmt = $pdo->query("SELECT COUNT(*) as bill_count, COALESCE(SUM(total_amount), 0) as total_rev, COALESCE(SUM(total_items), 0) as items_sold FROM bills");
    $rev_data = $revenue_stmt->fetch();

    // 6. Stock valuation
    $stock_value = (float)$pdo->query("SELECT COALESCE(SUM(price_per_plate * available_qty), 0) FROM products")->fetchColumn();

    // 7. Low stock products (stock <= 10)
    $low_stock = $pdo->query("SELECT item_id as id, item_name as name, available_qty as stock FROM products WHERE available_qty <= 10 ORDER BY available_qty ASC")->fetchAll();

    // 8. Recent 5 bills
    $recent_bills = $pdo->query("SELECT bill_id as id, bill_no as no, customer_name as customer, total_amount as total, bill_date as date FROM bills ORDER BY bill_id DESC LIMIT 5")->fetchAll();

    send_json_response([
        'success' => true,
        'data' => [
            'metrics' => [
                'total_products' => $total_products,
                'total_stock' => $total_stock,
                'today_sales' => $today_sales,
                'total_customers' => $total_customers,
                'total_bills' => (int)$rev_data['bill_count'],
                'total_revenue' => (float)$rev_data['total_rev'],
                'total_items_sold' => (int)$rev_data['items_sold'],
                'stock_value' => $stock_value
            ],
            'low_stock' => $low_stock,
            'recent_bills' => $recent_bills
        ]
    ]);
}

send_json_response(['success' => false, 'message' => 'Method not allowed'], 405);
