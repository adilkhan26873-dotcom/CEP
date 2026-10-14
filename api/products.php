<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $q = trim($_GET['q'] ?? '');
    if ($q !== '') {
        $stmt = $pdo->prepare("SELECT item_id AS id, item_name AS name, category, price_per_plate AS price, available_qty AS stock, unit, status FROM products WHERE item_name LIKE ? OR category LIKE ? ORDER BY item_id ASC");
        $term = "%{$q}%";
        $stmt->execute([$term, $term]);
    } else {
        $stmt = $pdo->query("SELECT item_id AS id, item_name AS name, category, price_per_plate AS price, available_qty AS stock, unit, status FROM products ORDER BY item_id ASC");
    }
    $products = $stmt->fetchAll();
    send_json_response(['success' => true, 'data' => $products]);
}

if ($method === 'POST') {
    $data = get_json_input();
    $name = trim($data['name'] ?? '');
    $category = trim($data['category'] ?? '');
    $price = floatval($data['price'] ?? 0);
    $stock = intval($data['stock'] ?? 0);
    $unit = trim($data['unit'] ?? 'Plate');

    if (!$name || !$category || $price < 0 || $stock < 0) {
        send_json_response(['success' => false, 'message' => 'Please enter valid product details.'], 400);
    }

    $status = $stock <= 10 ? 'Low Stock' : ($stock <= 25 ? 'Low Stock' : 'In Stock');

    $stmt = $pdo->prepare("INSERT INTO products (item_name, category, price_per_plate, available_qty, unit, status) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$name, $category, $price, $stock, $unit, $status]);
    $new_id = $pdo->lastInsertId();

    send_json_response([
        'success' => true,
        'message' => 'Product added successfully',
        'data' => [
            'id' => (int)$new_id,
            'name' => $name,
            'category' => $category,
            'price' => $price,
            'stock' => $stock,
            'unit' => $unit,
            'status' => $status
        ]
    ], 201);
}

if ($method === 'PUT') {
    $data = get_json_input();
    $id = intval($data['id'] ?? 0);
    $name = trim($data['name'] ?? '');
    $category = trim($data['category'] ?? '');
    $price = floatval($data['price'] ?? 0);
    $stock = intval($data['stock'] ?? 0);
    $unit = trim($data['unit'] ?? 'Plate');

    if ($id <= 0 || !$name || !$category || $price < 0 || $stock < 0) {
        send_json_response(['success' => false, 'message' => 'Invalid product parameters.'], 400);
    }

    $status = $stock <= 10 ? 'Low Stock' : ($stock <= 25 ? 'Low Stock' : 'In Stock');

    $stmt = $pdo->prepare("UPDATE products SET item_name = ?, category = ?, price_per_plate = ?, available_qty = ?, unit = ?, status = ? WHERE item_id = ?");
    $stmt->execute([$name, $category, $price, $stock, $unit, $status, $id]);

    send_json_response(['success' => true, 'message' => 'Product updated successfully']);
}

if ($method === 'DELETE') {
    $id = intval($_GET['id'] ?? 0);
    if ($id <= 0) {
        send_json_response(['success' => false, 'message' => 'Product ID required.'], 400);
    }

    $stmt = $pdo->prepare("DELETE FROM products WHERE item_id = ?");
    $stmt->execute([$id]);

    send_json_response(['success' => true, 'message' => 'Product deleted successfully']);
}

send_json_response(['success' => false, 'message' => 'Method not allowed'], 405);
