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
    <title>Asteroids</title>
    <style>
        body {
            margin: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: rgb(153, 60, 60);
            color: white;
            font-family: Arial, sans-serif;
        }
        #gameContainer {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 85%;
        }
        #gameCanvas {
            width: 100%;
            height: 85vh;
            background-color: #000;
            display: block;
            margin-bottom: 10px;
        }
        #stats {
            display: flex;
            justify-content: space-between;
            width: 100%;
        }
        #controls {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-top: 10px;
        }
        button {
            padding: 10px 20px;
            background-color: #333;
            color: white;
            border: none;
            cursor: pointer;
        }
        button:disabled {
            background-color: #555;
            cursor: not-allowed;
        }
    </style>
</head>
<body>
    <div id="gameContainer">
        <div id="stats">
            <div id="lives">Lives: 3</div>
            <div id="score">Score: 0</div>
            <div id="highScore">Best: 0</div>
        </div>
        <canvas id="gameCanvas"></canvas>
        <div id="controls">
            <button id="pauseBtn">Pause</button>
            <button id="resumeBtn" disabled>Resume</button>
            <button id="resetBtn">Reset</button>
        </div>
    </div>
   <script src="game-script.js"></script>
</body>
</html
