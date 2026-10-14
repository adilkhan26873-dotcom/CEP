<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'POST') {
    $data = get_json_input();
    
    if ($action === 'login') {
        $username = trim($data['username'] ?? '');
        $password = $data['password'] ?? '';

        if (!$username || !$password) {
            send_json_response(['success' => false, 'message' => 'Username and password are required.'], 400);
        }

        $stmt = $pdo->prepare("SELECT user_id, full_name, username, password, role FROM users WHERE LOWER(username) = LOWER(?) LIMIT 1");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if ($user && $user['password'] === $password) {
            unset($user['password']);
            send_json_response([
                'success' => true,
                'message' => 'Login successful',
                'user' => [
                    'id' => $user['user_id'],
                    'name' => $user['full_name'],
                    'username' => $user['username'],
                    'role' => $user['role']
                ]
            ]);
        } else {
            send_json_response(['success' => false, 'message' => 'Invalid username or password.'], 401);
        }
    } 
    elseif ($action === 'register') {
        $name = trim($data['name'] ?? '');
        $username = trim(strtolower($data['username'] ?? ''));
        $password = $data['password'] ?? '';
        $confirm = $data['confirm_password'] ?? '';

        if (!$name || !$username || !$password || !$confirm) {
            send_json_response(['success' => false, 'message' => 'Please fill all fields.'], 400);
        }
        if (!preg_match('/^[A-Za-z ]+$/', $name)) {
            send_json_response(['success' => false, 'message' => 'Full name can contain letters and spaces only.'], 400);
        }
        if (strlen($username) < 3) {
            send_json_response(['success' => false, 'message' => 'Username must be at least 3 characters.'], 400);
        }
        if (strlen($password) < 4) {
            send_json_response(['success' => false, 'message' => 'Password must be at least 4 characters.'], 400);
        }
        if ($password !== $confirm) {
            send_json_response(['success' => false, 'message' => 'Passwords do not match.'], 400);
        }

        // Check if username exists
        $stmt = $pdo->prepare("SELECT user_id FROM users WHERE LOWER(username) = LOWER(?)");
        $stmt->execute([$username]);
        if ($stmt->fetch()) {
            send_json_response(['success' => false, 'message' => 'Username already exists.'], 409);
        }

        $stmt = $pdo->prepare("INSERT INTO users (full_name, username, password, role, status) VALUES (?, ?, ?, 'staff', 'active')");
        $stmt->execute([$name, $username, $password]);
        $new_id = $pdo->lastInsertId();

        send_json_response([
            'success' => true,
            'message' => 'Account created successfully. You can now login.',
            'user' => [
                'id' => $new_id,
                'name' => $name,
                'username' => $username,
                'role' => 'staff'
            ]
        ]);
    }
} elseif ($method === 'GET') {
    // List users
    $stmt = $pdo->query("SELECT user_id AS id, full_name AS name, username, role, created_at FROM users ORDER BY user_id ASC");
    $users = $stmt->fetchAll();
    send_json_response(['success' => true, 'data' => $users]);
}

send_json_response(['success' => false, 'message' => 'Invalid endpoint'], 404);
