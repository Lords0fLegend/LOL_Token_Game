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

function redirectWithError($message) {
    $_SESSION['error_message'] = $message;
    header("Location: index.php");
    exit();
}

try {
    // Establish database connection
    $conn = new mysqli($servername, $dbusername, $dbpassword, $dbname);
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }

    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        // Sanitize input
        $username = filter_var(trim($_POST['username']), FILTER_SANITIZE_STRING);
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
                
                // Redirect to game page
                header("Location: game.php");
                exit();
            } else {
                redirectWithError("Invalid credentials, please try again.");
            }
        } else {
            redirectWithError("Invalid credentials, please try again.");
        }
        $stmt->close();
    }
} catch (Exception $e) {
    error_log($e->getMessage());
    redirectWithError("An error occurred. Please try again later.");
} finally {
    $conn->close();
}
?>
