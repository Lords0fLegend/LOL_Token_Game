<?php
include "db.php";

// Log file path
$logFile = 'error_log.txt';

// Function to log messages
function logMessage($message) {
    global $logFile;
    file_put_contents($logFile, date('Y-m-d H:i:s') . " - " . $message . "\n", FILE_APPEND);
}

// Fetch user data from update_stats table
$user_id = $_POST['user_Id'];
$sql = "SELECT User_ID, High_Score, Total_Rounds_Played, Total_Rounds_Lost, Total_Rounds_Won, Total_Tokens FROM update_stats WHERE User_ID = ?";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    logMessage("Prepare failed: (" . $conn->errno . ") " . $conn->error);
    die("Prepare failed");
}
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if ($user) {
    // Log retrieved values
    logMessage("Retrieved Values: " . print_r($user, true));

    // Get data from game-script.js
    $score = (int)$_POST['score'];
    $roundsPlayed = (int)$_POST['roundsPlayed'];
    $roundsWon = (int)$_POST['roundsWon'];
    $roundsLost = (int)$_POST['roundsLost'];
    $tokens = (float)$_POST['tokens'];

    // Log received values before addition
    logMessage("Received Values from Game: score=$score, roundsPlayed=$roundsPlayed, roundsWon=$roundsWon, roundsLost=$roundsLost, tokens=$tokens");

    // Calculate new values
    $newTotalRoundsPlayed = $user['Total_Rounds_Played'] + $roundsPlayed;
    $newTotalRoundsWon = $user['Total_Rounds_Won'] + $roundsWon;
    $newTotalRoundsLost = $user['Total_Rounds_Lost'] + $roundsLost;
    $newTotalTokens = $user['Total_Tokens'] + $tokens; 
    $newHighScore = max($user['High_Score'], $score);

    // Log new values
    logMessage("New Total Rounds Played: " . $newTotalRoundsPlayed);
    logMessage("New Total Rounds Won: " . $newTotalRoundsWon);
    logMessage("New Total Rounds Lost: " . $newTotalRoundsLost);
    logMessage("New Total Tokens: " . $newTotalTokens);
    logMessage("New High Score: " . $newHighScore);

    // Update the database
    $updateSql = "UPDATE update_stats SET High_Score = ?, Total_Rounds_Played = ?, Total_Rounds_Lost = ?, Total_Rounds_Won = ?, Total_Tokens = ? WHERE User_ID = ?";
    $updateStmt = $conn->prepare($updateSql);
    if (!$updateStmt) {
        logMessage("Prepare failed: (" . $conn->errno . ") " . $conn->error);
        die("Prepare failed");
    }
    $updateStmt->bind_param("iiiiid", $newHighScore, $newTotalRoundsPlayed, $newTotalRoundsLost, $newTotalRoundsWon, $newTotalTokens, $user_id);

    if ($updateStmt->execute()) {
        logMessage('Updated successfully');
    } else {
        logMessage("Error updating record: " . $updateStmt->error);
        die("Error updating record: " . $updateStmt->error);
    }
} else {
    logMessage("No user found with User_ID: " . $user_id);
    die("No user found with User_ID: " . $user_id);
}

// Close connection
$conn->close();
?>
