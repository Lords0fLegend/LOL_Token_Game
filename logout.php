<?php
session_start();

// Ensure this is a POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    session_unset();
    session_destroy();
    echo json_encode(["message" => "Logged out successfully."]);
    exit();
} else {
    http_response_code(405); // Method Not Allowed
    echo json_encode(["message" => "Invalid request method."]);
    exit();
}
?>