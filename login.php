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
    $conn = new mysqli($servername, $dbusername, $dbpassword, $dbname);

    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }

    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        $username = $_POST['username'];
        $password = $_POST['password'];
        $sql = "SELECT User_ID, Password FROM Users WHERE Username=?";
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
            $user_id = $row['User_ID'];
            $hashed_password = $row['Password'];
            if (password_verify($password, $hashed_password)) {
                $_SESSION['username'] = $username;
                $_SESSION['User_ID'] = $user_id;
                $_SESSION['login_time'] = time();
                header("Location: game.php");
                exit();
            } else {
                echo "Invalid credentials";
            }
        } else {
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
