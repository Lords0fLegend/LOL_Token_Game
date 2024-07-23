<?php
include 'db.php';

$username = $_POST['username'];
$password = $_POST['password'];

if (!$username || !$password) {
    echo json_encode(['status' => 'error', 'message' => 'Please enter all fields']);
    exit();
}

$sql = "SELECT id, password FROM users WHERE username = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $username);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows === 0) {
    echo json_encode(['status' => 'error', 'message' => 'User does not exist']);
    exit();
}

$stmt->bind_result($id, $hashed_password);
$stmt->fetch();

if (!password_verify($password, $hashed_password)) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid credentials']);
    exit();
}

session_start();
$_SESSION['user_id'] = $id;
$_SESSION['username'] = $username;

echo json_encode(['status' => 'success', 'message' => 'Login successful', 'user' => ['id' => $id, 'username' => $username]]);
?>
