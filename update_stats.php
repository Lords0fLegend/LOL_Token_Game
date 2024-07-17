<?php
session_start();
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

if (!isset($_SESSION['username'])) {
    echo "User not logged in.";
    exit;
}

$username = $_SESSION['username'];
$score = $_POST['score'];
$tokens = $_POST['tokens'];

// Fetch user data
$sql = "SELECT * FROM users WHERE username='$username'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $new_tokens = $row['tokens'] + $tokens;
    $new_high_score = max($row['high_score'], $score);
    $sql = "UPDATE users SET tokens='$new_tokens', high_score='$new_high_score' WHERE username='$username'";

    if ($conn->query($sql) === TRUE) {
        echo "Stats updated successfully.";
    } else {
        echo "Error: " . $sql . "<br>" . $conn->error;
    }
} else {
    echo "User not found.";
}

$conn->close();
?>
