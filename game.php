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
        body {
            background-image: url('login_background.png');
            background-size: cover;
        }
    </style>
</head>

<body>
<div id="user-info" data-username="<?php echo $username; ?>" data-user-id="<?php echo $user_id; ?>"></div>
    <div class="game-stats" id="game-stats">
        <span id="score">Score: 0</span>
        <span id="tokens">Tokens: 0</span>
        <span id="lives">Lives: 5</span>
        <span id="current-wave">Wave: 1</span>
        <span id="rounds-won">Rounds Won: 0</span>
        <span id="rounds-lost">Rounds Lost: 0</span>
    </div>
    <canvas id="canvas1"></canvas>
    <div id="game-over-container">
        <button id="play-again-button">Play Again</button>
        <div id="game-over">Game Over</div>
        <button id="end-game-button">End Game</button>
    </div>
    <div id="congratulations" style="display:none;">
        <h1>Congratulations! You made it to the last round!</h1>
        <h2>Here's 100 tokens!</h2>
    </div>
    <canvas id="fireworks" style="display:none; position:absolute; top:0; left:0; pointer-events:none;"></canvas>


    <script src="game-script.js"></script>
</body>
</html>

