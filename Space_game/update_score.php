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

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
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

    // Log the received values
    error_log("Received values - user_Id: $user_Id, username: $username, score: $score, roundsPlayed: $roundsPlayed, roundsWon: $roundsWon, roundsLost: $roundsLost, tokens: $tokens");

    // Fetch the existing score and tokens from the database
    $sql = "SELECT score, tokens, roundsPlayed, roundsWon, roundsLost FROM users WHERE user_Id=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_Id);
    $stmt->execute();
    $stmt->bind_result($existingScore, $existingTokens, $existingRoundsPlayed, $existingRoundsWon, $existingRoundsLost);
    $stmt->fetch();
    $stmt->close();

    // Log the fetched values
    error_log("Fetched values - Score: $existingScore, Tokens: $existingTokens, Rounds Played: $existingRoundsPlayed, Rounds Won: $existingRoundsWon, Rounds Lost: $existingRoundsLost");

    // Determine if the score should be updated and calculate the new token count and gather rounds played and won and lost
    $newScore = max($existingScore, $score);
    $newTokens = $existingTokens + $tokens;
    $newRoundsPlayed = $existingRoundsPlayed + $roundsWon  + $roundsLost ;
    $newRoundsWon = $existingRoundsWon + $roundsWon;
    $newRoundsLost = $existingRoundsLost + $roundsLost;

    // Log the new calculated values
    error_log("New values - Score: $newScore, Tokens: $newTokens, Rounds Played: $newRoundsPlayed, Rounds Won: $newRoundsWon, Rounds Lost: $newRoundsLost");

    // Update the database with the new score and token values
    $sql = "UPDATE users SET score=?, roundsPlayed=?, roundsWon=?, roundsLost=?, tokens=? WHERE user_Id=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iiiiii", $newScore, $newRoundsPlayed, $newRoundsWon, $newRoundsLost, $tokens, $user_Id);

    if ($stmt->execute()) {
        echo "Record updated successfully";
        // Log the success message
        error_log("Record updated successfully for user_Id: $user_Id");
    } else {
        echo "Error updating record: " . $stmt->error;
        // Log the error message
        error_log("Error updating record for user_Id: $user_Id - " . $stmt->error);
    }

    $stmt->close();
}

$conn->close();
?>
