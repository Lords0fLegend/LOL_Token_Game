<?php

include "db.php";

session_start();


// Enable error logging
ini_set('log_errors', 1);
ini_set('error_log', 'error_log.txt');
error_reporting(E_ALL);
ini_set('display_errors', 1);

function redirectWithError($conn, $message) {
    if ($conn) {
        $conn->close(); // Close the connection before exiting
    }
    $_SESSION['error_message'] = $message;
    header("Location: index.php");
    exit();
}

try {
    // Establish database connection using variables from db.php
    $conn = new mysqli($host, $user, $pass, $db);
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }

    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        // Sanitize input
        $username = trim($_POST['username']);
        $password = trim($_POST['password']);

        // Prepare and execute the SQL statement
        $sql = "SELECT User_ID, Password FROM login_info WHERE Username = ?";
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception("Prepare statement failed: " . $conn->error);
        }
        $stmt->bind_param("s", $username);
        if (!$stmt->execute()) {
            throw new Exception("Execute statement failed: " . $stmt->error);
        }

        // Fetch the result and verify the password
        $result = $stmt->get_result();
        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $user_id = $row['User_ID'];
            $hashed_password = $row['Password'];
            if (password_verify($password, $hashed_password)) {
                // Set session variables
                $_SESSION['username'] = $username;
                $_SESSION['User_ID'] = $user_id;
                $_SESSION['login_time'] = time();
                
                // Close the connection and redirect to game page
                $stmt->close();
                $conn->close();
                header("Location: game.php");
                exit();
            } else {
                redirectWithError($conn, "Invalid credentials, please try again.");
            }
        } else {
            redirectWithError($conn, "Invalid credentials, please try again.");
        }
        
    }
} catch (Exception $e) {
    if (isset($conn)) {
        $conn->close(); // Ensure the connection is closed on exception
    }
    error_log($e->getMessage());
    redirectWithError(null, "An error occurred. Please try again later.");
}