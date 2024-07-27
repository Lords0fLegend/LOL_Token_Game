<?php
session_start();

if (!isset($_SESSION['username']) || !isset($_SESSION['login_time'])) {
    header("Location: index.html");
    exit();
}

$username = $_SESSION['username'];
$user_id = $_SESSION['User_ID'];
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Game</title>
    <link rel="icon" href="favicon.png" type="image/png">
    <link rel="stylesheet" href="styles.css">
    <style>
        body{
             background-image: url('login_background.png');
             background-size:cover;
        }
    </style>
</head>
<body>
    <div id="user-info" data-username="<?php echo $username; ?>" data-user-id="<?php echo $user_id; ?>"></div>
    <div class="game-stats">
        <div id="score">Score: 0</div>
        <div id="tokens">Tokens: 0</div>
        <div id="lives">Lives: 5</div>
        <div id="current-wave">Wave: 1</div>
        <div id="rounds-won">Rounds Won: 0</div> <!-- Add this line -->
        <div id="rounds-lost">Rounds Lost: 0</div> <!-- Add this line -->
    </div>
    <canvas id="canvas1"></canvas>
    <div id="game-over">GAME OVER</div>
    <button id="reset-button">Reset Game</button>
    <button id="pause-button">Pause Game</button>
    <button id="play-again-button">Play Again</button>
    <button id="end-game-button">End Game</button>
    <script src="game-script.js"></script>
</body>
</html>


