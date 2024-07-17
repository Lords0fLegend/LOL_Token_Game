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

$email = $_POST['email'];
$fullname = $_POST['fullname'];
$dob = $_POST['dob'];
$username = $_POST['username'];
$password = password_hash($_POST['password'], PASSWORD_BCRYPT);

// Calculate age
$age = (new DateTime())->diff(new DateTime($dob))->y;

if ($age < 13) {
    echo "You must be 13 years or older to register.";
    exit;
}

// Check if username already exists
$sql = "SELECT * FROM users WHERE username='$username'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    echo "Username already exists.";
    exit;
}

// Insert new user
$sql = "INSERT INTO users (email, fullname, dob, username, password) VALUES ('$email', '$fullname', '$dob', '$username', '$password')";

if ($conn->query($sql) === TRUE) {
    echo "Registration successful.";
} else {
    echo "Error: " . $sql . "<br>" . $conn->error;
}

$conn->close();
?>
