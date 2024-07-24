<?php
session_start();
include 'db.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

ob_start();

try {
    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        $first_name = $_POST['first_name'];
        $last_name = $_POST['last_name'];
        $username = $_POST['username'];
        $email = $_POST['email'];
        $dob = $_POST['dob'];
        $password = $_POST['password'];

        $age = date_diff(date_create($dob), date_create('today'))->y;
        if ($age < 13) {
            echo "You must be at least 13 years old to register.";
            exit();
        }

        $sql = "SELECT * FROM Users WHERE username=? OR email=?";
        if ($stmt = $conn->prepare($sql)) {
            $stmt->bind_param("ss", $username, $email);
            $stmt->execute();
            $result = $stmt->get_result();
            if ($result->num_rows > 0) {
                echo "Username or Email already taken. Please choose a different one.";
            } else {
                $hashed_password = password_hash($password, PASSWORD_BCRYPT);
                $sql = "INSERT INTO Users (first_name, last_name, username, email, dob, password) VALUES (?, ?, ?, ?, ?, ?)";
                if ($stmt = $conn->prepare($sql)) {
                    $stmt->bind_param("ssssss", $first_name, $last_name, $username, $email, $dob, $hashed_password);
                    if ($stmt->execute()) {
                        $_SESSION['username'] = $username;
                        $_SESSION['user_Id'] = $stmt->insert_id;
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
