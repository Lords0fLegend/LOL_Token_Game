<?php
session_start();
$servername = "localhost";
$dbusername = "markxwyo_laserteam";
$dbpassword = "Homiez@420";
$dbname = "markxwyo_player_stats_LaserGame";

// Enable error logging
ini_set('log_errors', 1);
ini_set('error_log', 'error_log.txt');
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    // Create connection
    $conn = new mysqli($servername, $dbusername, $dbpassword, $dbname);

    // Check connection
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }

    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        $username = $_POST['username'];
        $password = $_POST['password'];
        
        // Log the received username and password length
        error_log("Received username: $username");
        error_log("Received password length: " . strlen($password));

        // SQL query to fetch the hashed password for the provided username
        $sql = "SELECT user_Id, password FROM users WHERE username=?";
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception("Prepare statement failed: " . $conn->error);
        }
        
        $stmt->bind_param("s", $username);
        if (!$stmt->execute()) {
            throw new Exception("Execute statement failed: " . $stmt->error);
        }
        
        $result = $stmt->get_result();
        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $user_id = $row['user_Id'];
            $hashed_password = $row['password'];

            // Log the hashed password fetched from the database
            error_log("Fetched hashed password: $hashed_password");

            // Verify the provided password against the hashed password
            $is_password_correct = password_verify($password, $hashed_password);
            error_log("Password verify result: " . ($is_password_correct ? "true" : "false"));

            if ($is_password_correct) {
                $_SESSION['username'] = $username;
                $_SESSION['user_Id'] = $user_id; // Store the user ID in the session
                $_SESSION['login_time'] = time();
                header("Location: game.php");
                exit();
            } else {
                error_log("Invalid credentials for user: $username");
                echo "Invalid credentials";
            }
        } else {
            error_log("User not found: $username");
            echo "Invalid credentials";
        }
        $stmt->close();
    }
} catch (Exception $e) {
    error_log($e->getMessage());
    echo "An error occurred. Please try again later.";
} finally {
    $conn->close();
}
?>
