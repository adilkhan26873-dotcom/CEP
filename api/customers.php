<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT customer_id AS id, name, mobile_no AS phone, email, address, total_spent FROM customers ORDER BY customer_id DESC");
    $customers = $stmt->fetchAll();
    send_json_response(['success' => true, 'data' => $customers]);
}

if ($method === 'POST') {
    $data = get_json_input();
    $name = trim($data['name'] ?? '');
    $phone = trim($data['phone'] ?? '');
    $email = trim($data['email'] ?? '');
    $address = trim($data['address'] ?? '');

    if (!$name) {
        send_json_response(['success' => false, 'message' => 'Enter customer name.'], 400);
    }
    if ($phone && !preg_match('/^\d{10}$/', $phone)) {
        send_json_response(['success' => false, 'message' => 'Enter a valid 10-digit phone number.'], 400);
    }

    $stmt = $pdo->prepare("INSERT INTO customers (name, mobile_no, email, address) VALUES (?, ?, ?, ?)");
    $stmt->execute([$name, $phone ?: null, $email ?: null, $address ?: null]);
    $new_id = $pdo->lastInsertId();

    send_json_response([
        'success' => true,
        'message' => 'Customer added successfully',
        'data' => [
            'id' => (int)$new_id,
            'name' => $name,
            'phone' => $phone,
            'email' => $email,
            'address' => $address
        ]
    ], 201);
}

if ($method === 'DELETE') {
    $id = intval($_GET['id'] ?? 0);
    if ($id <= 0) {
        send_json_response(['success' => false, 'message' => 'Customer ID required.'], 400);
    }

    $stmt = $pdo->prepare("DELETE FROM customers WHERE customer_id = ?");
    $stmt->execute([$id]);

    send_json_response(['success' => true, 'message' => 'Customer deleted successfully']);
}

send_json_response(['success' => false, 'message' => 'Method not allowed'], 405);
