<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $bill_no = trim($_GET['bill_no'] ?? '');
    
    if ($bill_no !== '') {
        $stmt = $pdo->prepare("SELECT * FROM bills WHERE bill_no = ? LIMIT 1");
        $stmt->execute([$bill_no]);
        $bill = $stmt->fetch();
        
        if (!$bill) {
            send_json_response(['success' => false, 'message' => 'Bill not found'], 404);
        }

        $item_stmt = $pdo->prepare("SELECT item_name AS name, quantity AS qty, price, subtotal AS amount FROM bill_items WHERE bill_id = ?");
        $item_stmt->execute([$bill['bill_id']]);
        $bill['lines'] = $item_stmt->fetchAll();

        send_json_response(['success' => true, 'data' => $bill]);
    } else {
        $stmt = $pdo->query("SELECT bill_id AS id, bill_no AS no, customer_name AS customer, customer_phone AS phone, total_items AS items, total_amount AS total, payment_mode, bill_date AS date FROM bills ORDER BY bill_id DESC");
        $bills = $stmt->fetchAll();

        // Attach lines for each bill
        foreach ($bills as &$b) {
            $item_stmt = $pdo->prepare("SELECT item_name AS name, quantity AS qty, price, subtotal AS amount FROM bill_items WHERE bill_id = ?");
            $item_stmt->execute([$b['id']]);
            $b['lines'] = $item_stmt->fetchAll();
        }

        send_json_response(['success' => true, 'data' => $bills]);
    }
}

if ($method === 'POST') {
    $data = get_json_input();
    $customer_name = trim($data['customer'] ?? 'Walk-in Customer');
    $customer_phone = trim($data['phone'] ?? '');
    $items = $data['items'] ?? [];
    $payment_mode = $data['payment_mode'] ?? 'Cash';
    $user_id = intval($data['user_id'] ?? 1);

    if (empty($items)) {
        send_json_response(['success' => false, 'message' => 'Cart is empty. Add at least one item.'], 400);
    }

    try {
        $pdo->beginTransaction();

        $total_amount = 0.0;
        $total_items = 0;
        $verified_lines = [];

        foreach ($items as $it) {
            $product_id = intval($it['id'] ?? 0);
            $qty = intval($it['qty'] ?? 0);

            if ($product_id <= 0 || $qty <= 0) {
                throw new Exception("Invalid item or quantity.");
            }

            $for_update = (isset($db_driver) && $db_driver === 'mysql') ? ' FOR UPDATE' : '';
            $stmt = $pdo->prepare("SELECT item_id, item_name, price_per_plate, available_qty FROM products WHERE item_id = ?{$for_update}");
            $stmt->execute([$product_id]);
            $prod = $stmt->fetch();

            if (!$prod) {
                throw new Exception("Product ID {$product_id} not found.");
            }

            if ($prod['available_qty'] < $qty) {
                throw new Exception("Insufficient stock for {$prod['item_name']}. Only {$prod['available_qty']} left.");
            }

            $line_price = floatval($prod['price_per_plate']);
            $line_subtotal = $line_price * $qty;
            $total_amount += $line_subtotal;
            $total_items += $qty;

            $verified_lines[] = [
                'id' => $prod['item_id'],
                'name' => $prod['item_name'],
                'qty' => $qty,
                'price' => $line_price,
                'amount' => $line_subtotal,
                'new_stock' => $prod['available_qty'] - $qty
            ];
        }

        // Generate sequential or random bill number
        $bill_no = 'INV-' . strtoupper(substr(uniqid(), -6));

        // Insert bill master (CURRENT_TIMESTAMP is standard ANSI SQL)
        $bill_stmt = $pdo->prepare("INSERT INTO bills (bill_no, customer_name, customer_phone, user_id, total_items, total_amount, payment_mode, status, bill_date) VALUES (?, ?, ?, ?, ?, ?, ?, 'Paid', CURRENT_TIMESTAMP)");
        $bill_stmt->execute([$bill_no, $customer_name, $customer_phone ?: null, $user_id, $total_items, $total_amount, $payment_mode]);
        $bill_id = $pdo->lastInsertId();

        // Insert items and update product stock
        $item_insert = $pdo->prepare("INSERT INTO bill_items (bill_id, item_id, item_name, quantity, price, subtotal) VALUES (?, ?, ?, ?, ?, ?)");
        $stock_update = $pdo->prepare("UPDATE products SET available_qty = ?, status = CASE WHEN ? <= 10 THEN 'Low Stock' ELSE 'In Stock' END WHERE item_id = ?");

        foreach ($verified_lines as $vl) {
            $item_insert->execute([$bill_id, $vl['id'], $vl['name'], $vl['qty'], $vl['price'], $vl['amount']]);
            $stock_update->execute([$vl['new_stock'], $vl['new_stock'], $vl['id']]);
        }

        // If customer exists, update lifetime spending
        if ($customer_phone) {
            $cust_up = $pdo->prepare("UPDATE customers SET total_spent = total_spent + ? WHERE mobile_no = ?");
            $cust_up->execute([$total_amount, $customer_phone]);
        }

        $pdo->commit();

        $new_bill = [
            'id' => (int)$bill_id,
            'no' => $bill_no,
            'customer' => $customer_name,
            'phone' => $customer_phone,
            'total' => $total_amount,
            'items' => $total_items,
            'date' => date('Y-m-d H:i:s'),
            'lines' => $verified_lines
        ];

        send_json_response(['success' => true, 'message' => 'Bill saved successfully', 'data' => $new_bill], 201);
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        send_json_response(['success' => false, 'message' => $e->getMessage()], 400);
    }
}

send_json_response(['success' => false, 'message' => 'Method not allowed'], 405);
