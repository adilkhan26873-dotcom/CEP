<?php
/**
 * Database Configuration & Connection Handler
 * Project: Inventory & Billing Software for Local Shops (Pani Puri Shop)
 * Auto-detects MySQL (XAMPP default: root / '') with graceful fallback to SQLite
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if (!isset($_SERVER['REQUEST_METHOD'])) {
    $_SERVER['REQUEST_METHOD'] = 'GET';
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$db_host = '127.0.0.1';
$db_port = '3306';
$db_name = 'panipuri_db';
$db_user = 'root';
$db_pass = '';

$pdo = null;

try {
    // Attempt connection to MySQL server
    $dsn = "mysql:host={$db_host};port={$db_port};dbname={$db_name};charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    $pdo = new PDO($dsn, $db_user, $db_pass, $options);
    $db_driver = 'mysql';
} catch (PDOException $e) {
    // If MySQL connection fails (e.g. MySQL service not started in XAMPP), fallback to local SQLite database
    $sqlite_file = dirname(__DIR__) . '/database/panipuri_db.sqlite';
    if (file_exists($sqlite_file)) {
        try {
            $pdo = new PDO('sqlite:' . $sqlite_file);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            $db_driver = 'sqlite';
        } catch (PDOException $sqle) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Database connection failed: ' . $sqle->getMessage()]);
            exit;
        }
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'MySQL connection failed and SQLite fallback file not found: ' . $e->getMessage()]);
        exit;
    }
}

function send_json_response($data, $status_code = 200) {
    http_response_code($status_code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
    exit;
}

function get_json_input() {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?: [];
}
