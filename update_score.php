<?php
include 'db.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Not authorized']);
    exit();
}

$user_id = $_SESSION['user_id'];
$score = $_POST['score'];
$tokens = $_POST['tokens'];

$sql = "UPDATE users SET score = ?, tokens = ? WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("idi", $score, $tokens, $user_id);
$stmt->execute();

echo json_encode(['status' => 'success', 'message' => 'Scores updated successfully']);
?>
