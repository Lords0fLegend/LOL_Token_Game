<?php
session_start();
include 'db.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

ob_start();

try {
    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        $username = $_POST['username'];
        $email = $_POST['email'];
        $dob = $_POST['dob'];
        $password = $_POST['password'];

        // Check if username or email already exists
        $sql = "SELECT * FROM users WHERE username=? OR email=?";
        if ($stmt = $conn->prepare($sql)) {
            $stmt->bind_param("ss", $username, $email);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                echo "Username or Email already taken. Please choose a different one.";
            } else {
                // Hash the password before storing it
                $hashed_password = password_hash($password, PASSWORD_BCRYPT);

                // Insert new user into the database
                $sql = "INSERT INTO users (username, email, dob, password) VALUES (?, ?, ?, ?)";
                if ($stmt = $conn->prepare($sql)) {
                    $stmt->bind_param("ssss", $username, $email, $dob, $hashed_password);
                    if ($stmt->execute()) {
                        $_SESSION['username'] = $username;
                        $_SESSION['user_Id'] = $stmt->insert_id; // Use the insert ID to set user_Id
                        $_SESSION['login_time'] = time();
                        header("Location: game.php");
                        ob_end_flush();
                        exit();
                    } else {
                        throw new Exception("Execute failed: " . $stmt->error);
                    }
                } else {
                    throw new Exception("Prepare failed: " . $conn->error);
                }
            }
            $stmt->close();
        } else {
            throw new Exception("Prepare failed: " . $conn->error);
        }
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}

$conn->close();
?>
