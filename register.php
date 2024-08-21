<?php
include "db.php";

// Log file path
$logFile = 'error_log.txt';

// Function to log messages
function logMessage($message) {
    global $logFile;
    file_put_contents($logFile, date('Y-m-d H:i:s') . " - " . $message . "\n", FILE_APPEND);
}

// Retrieve form data
$username = $_POST['username'];
$first_name = $_POST['first_name'];
$last_name = $_POST['last_name'];
$email = $_POST['email'];
$dob = $_POST['dob'];
$password = password_hash($_POST['password'], PASSWORD_BCRYPT);

// Calculate age
$dobDate = new DateTime($dob);
$today = new DateTime();
$age = $today->diff($dobDate)->y;

// Check if user is at least 13 years old
if ($age < 13) {
    logMessage("Registration failed: User is under 13 years old. Age: $age");
    die("Registration failed: You must be at least 13 years old to register.");
}

try {
    // Start transaction
    $conn->begin_transaction();

    // Insert user into login_info table
    $sql = "INSERT INTO login_info (Username, First_Name, Last_Name, Email_Address, DOB, Password) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Prepare failed: (" . $conn->errno . ") " . $conn->error);
    }
    $stmt->bind_param("ssssss", $username, $first_name, $last_name, $email, $dob, $password);
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: (" . $stmt->errno . ") " . $stmt->error);
    }
    
    // Get the User_ID of the newly inserted user
    $user_id = $stmt->insert_id;

    // Log new user registration
    logMessage("New user registered with User_ID: $user_id");

    // Insert User_ID into update_stats table
    $sql = "INSERT INTO update_stats (User_ID) VALUES (?)";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Prepare failed: (" . $conn->errno . ") " . $conn->error);
    }
    $stmt->bind_param("i", $user_id);
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: (" . $stmt->errno . ") " . $stmt->error);
    }

    // Commit transaction
    $conn->commit();
    logMessage("User_ID $user_id inserted into update_stats");
 // Set session variables
                $_SESSION['username'] = $username;
                $_SESSION['User_ID'] = $user_id;
                $_SESSION['login_time'] = time();
                
    // Redirect to login page or other success page
    header("Location: game.php");
    exit;

} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    logMessage("Error: " . $e->getMessage());
    die("Registration failed: " . $e->getMessage());
}