<?php
$host = 'localhost';  
$db = 'markxwyo_player_stats_LaserGame';  
$user = 'markxwyo_laserteam'; 
$pass = 'Homiez@420';  
$charset = 'utf8mb4';
$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
