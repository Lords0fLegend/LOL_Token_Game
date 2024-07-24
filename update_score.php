<?php
session_start();
$servername = "localhost";
$username = "markxwyo_laserteam";
$password = "Homiez@420";
$dbname = "markxwyo_player_stats_LaserGame";

// Enable error logging
ini_set('log_errors', 1);
ini_set('error_log', 'error_log.txt');
error_reporting(E_ALL);
ini_set('display_errors', 1);

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $user_Id = $_POST['user_Id'];
    $username = $_POST['username'];
    $score = $_POST['score'];
    $roundsPlayed = $_POST['roundsPlayed'];
    $roundsWon = $_POST['roundsWon'];
    $roundsLost = $_POST['roundsLost'];
    $tokens = $_POST['tokens'];

    // Debugging: print input values
    error_log("User ID: $user_Id, Username: $username, Score: $score, Rounds Played: $roundsPlayed, Rounds Won: $roundsWon, Rounds Lost: $roundsLost, Tokens: $tokens");

    $sql = "SELECT High_Score, Total_Tokens, Total_Rounds_Played, Total_Rounds_Won, Total_Rounds_Lost FROM Users WHERE User_ID=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_Id);
    $stmt->execute();
    $stmt->bind_result($existingScore, $existingTokens, $existingRoundsPlayed, $existingRoundsWon, $existingRoundsLost);
    $stmt->fetch();
    $stmt->close();

    // Debugging: print existing values
    error_log("Existing Score: $existingScore, Existing Tokens: $existingTokens, Existing Rounds Played: $existingRoundsPlayed, Existing Rounds Won: $existingRoundsWon, Existing Rounds Lost: $existingRoundsLost");

    $newScore = max($existingScore, $score);
    $newTokens = $existingTokens + $tokens;
    $newRoundsPlayed = $existingRoundsPlayed + $roundsPlayed;
    $newRoundsWon = $existingRoundsWon + $roundsWon;
    $newRoundsLost = $existingRoundsLost + $roundsLost;

    // Debugging: print new values
    error_log("New Score: $newScore, New Tokens: $newTokens, New Rounds Played: $newRoundsPlayed, New Rounds Won: $newRoundsWon, New Rounds Lost: $newRoundsLost");

    $sql = "UPDATE Users SET High_Score=?, Total_Rounds_Played=?, Total_Rounds_Won=?, Total_Rounds_Lost=?, Total_Tokens=? WHERE User_ID=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iidiii", $newScore, $newRoundsPlayed, $newRoundsWon, $newRoundsLost, $newTokens, $user_Id);

    if ($stmt->execute()) {
        echo "Record updated successfully";
    } else {
        echo "Error updating record: " . $stmt->error;
    }

    $stmt->close();
}

$conn->close();
?>
