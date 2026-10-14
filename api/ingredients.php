<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT ingredient_id AS id, name, unit, stock, reorder_level, cost_per_unit, updated_at FROM ingredients ORDER BY ingredient_id ASC");
    $ingredients = $stmt->fetchAll();
    send_json_response(['success' => true, 'data' => $ingredients]);
}

if ($method === 'POST') {
    $data = get_json_input();
    $name = trim($data['name'] ?? '');
    $unit = trim($data['unit'] ?? 'kg');
    $stock = floatval($data['stock'] ?? 0);
    $reorder = floatval($data['reorder_level'] ?? 5);
    $cost = floatval($data['cost_per_unit'] ?? 0);

    if (!$name) {
        send_json_response(['success' => false, 'message' => 'Enter ingredient name.'], 400);
    }

    $stmt = $pdo->prepare("INSERT INTO ingredients (name, unit, stock, reorder_level, cost_per_unit) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$name, $unit, $stock, $reorder, $cost]);
    $new_id = $pdo->lastInsertId();

    send_json_response([
        'success' => true,
        'message' => 'Ingredient added successfully',
        'data' => [
            'id' => (int)$new_id,
            'name' => $name,
            'unit' => $unit,
            'stock' => $stock,
            'reorder_level' => $reorder,
            'cost_per_unit' => $cost
        ]
    ], 201);
}

if ($method === 'PUT') {
    $data = get_json_input();
    $id = intval($data['id'] ?? 0);
    $stock = floatval($data['stock'] ?? 0);

    if ($id <= 0) {
        send_json_response(['success' => false, 'message' => 'Ingredient ID required.'], 400);
    }

    $stmt = $pdo->prepare("UPDATE ingredients SET stock = ? WHERE ingredient_id = ?");
    $stmt->execute([$stock, $id]);

    send_json_response(['success' => true, 'message' => 'Ingredient stock updated successfully']);
}

if ($method === 'DELETE') {
    $id = intval($_GET['id'] ?? 0);
    if ($id <= 0) {
        send_json_response(['success' => false, 'message' => 'Ingredient ID required.'], 400);
    }

    $stmt = $pdo->prepare("DELETE FROM ingredients WHERE ingredient_id = ?");
    $stmt->execute([$id]);

    send_json_response(['success' => true, 'message' => 'Ingredient deleted successfully']);
}

send_json_response(['success' => false, 'message' => 'Method not allowed'], 405);
