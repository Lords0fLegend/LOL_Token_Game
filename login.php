<?php
$servername = "localhost";
$username = 'markxwyo_laserteam';
$password = 'Homiez@420';
$dbname = 'markxwyo_player_stats_LaserGame';

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$username = $_POST['username'];
$password = $_POST['password'];

// Fetch user data
$sql = "SELECT * FROM users WHERE username='$username'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    if (password_verify($password, $row['password'])) {
        echo "Login successful.";
        // Set session variables or tokens for authenticated user
        session_start();
        $_SESSION['username'] = $username;
        $_SESSION['userid'] = $row['id'];
    } else {
        echo "Invalid password.";
    }
} else {
    echo "No user found with this username.";
}

$conn->close();
?>
