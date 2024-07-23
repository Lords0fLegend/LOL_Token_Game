<?php
include 'db.php';

$username = $_POST['username'];
$password = $_POST['password'];

if (!$username || !$password) {
    echo json_encode(['status' => 'error', 'message' => 'Please enter all fields']);
    exit();
}

$sql = "SELECT id FROM users WHERE username = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $username);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    echo json_encode(['status' => 'error', 'message' => 'User already exists']);
    exit();
}

$stmt->close();

$hashed_password = password_hash($password, PASSWORD_BCRYPT);
$sql = "INSERT INTO users (username, password) VALUES (?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $username, $hashed_password);
$stmt->execute();

echo json_encode(['status' => 'success', 'message' => 'User registered successfully']);
?>
