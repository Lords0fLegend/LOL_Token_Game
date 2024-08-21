<?php
session_start();

if (!isset($_SESSION['username']) || !isset($_SESSION['login_time'])) {
    header("Location: index.php");
    exit();
}

$username = $_SESSION['username'];
$user_id = $_SESSION['User_ID'];
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="icon" href="favicon.png" type="image/png">
    <meta charset="UTF-8">
    <title>Lords Of Legend Laser Game</title>
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
            
        }
        #gameCanvas {
            background-image: url('space_background.png');
            display: block;
            margin-bottom: 10px;
        }
        #stats {
            display: flex;
            justify-content: space-between;
            width: 760px;
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
            <div id="lives">Lives: 5</div>
            <div id="score">Score: 0</div>
            <div id="highScore">Best: 0</div>
            <div id="token">Tokens: 0</div>
        </div>
        <canvas id="gameCanvas" width="760" height="570"></canvas>
        <div id="controls">
            <button id="pauseBtn">Pause</button>
            <button id="resumeBtn" disabled>Resume</button>
            <button id="resetBtn">Reset</button>
            <button id="logOutBtn">Log Out</button>
        </div>
    </div>
    <script>
        const FPS = 30;
        const FRICTION = 0.7;
        const GAME_LIVES = 5;
        const LASER_DIST = 0.6;
        const LASER_EXPLODE_DUR = 0.1;
        const LASER_MAX = 10;
        const LASER_SPD = 500;
        const ROID_PTS_LGE = 20;
        const ROID_PTS_MED = 50;
        const ROID_PTS_SML = 100;
        const ROID_NUM = 3;
        const ROID_SIZE = 100;
        const ROID_SPD = 50;
        const SAVE_KEY_SCORE = "highscore";
        const SHIP_BLINK_DUR = 0.1;
        const SHIP_EXPLODE_DUR = 0.3;
        const SHIP_INV_DUR = 3;
        const SHIP_SIZE = 30;
        const SHIP_THRUST = 5;
        const SHIP_TURN_SPD = 360;
        const SHOW_BOUNDING = false;
        const SHOW_CENTRE_DOT = false;
        const TEXT_FADE_TIME = 2.5;
        const TEXT_SIZE = 40;
// Load background images (you can use multiple layers for parallax effect)
const background1 = new Image();
background1.src = "space_background.png"; // Further background

const background2 = new Image();
background2.src = "space_background.png"; // Closer background

// Background position
let bg1X = 0;
let bg2X = 0;

const bg1Speed = 1; // Speed for further background
const bg2Speed = 2; // Speed for closer background

        var canv = document.getElementById("gameCanvas");
        var ctx = canv.getContext("2d");
        var tokensCollected = 0;
        var level, lives, roids, score, scoreHigh, ship, text, textAlpha, gameInterval;
        var isPaused = false;

        // Tracking variables
        var roundsPlayed = 0;
        var roundsWon = 0;
        var roundsLost = 0;

        document.getElementById("pauseBtn").addEventListener("click", pauseGame);
        document.getElementById("resumeBtn").addEventListener("click", resumeGame);
        document.getElementById("resetBtn").addEventListener("click", resetGame);
         document.getElementById("logOutBtn").addEventListener("click", logOut);
        document.addEventListener("keydown", keyDown);
        document.addEventListener("keyup", keyUp);

        // Start the game when the page loads
        newGame();
        resumeGame(); // Start the game loop immediately after setup

     function logOut() {
    // Update scores
    sendGameData();
    
    // Logout of current session
    fetch('logout.php', {
        method: 'POST',
        credentials: 'same-origin' // Include session cookies
    })
    .then(response => {
        console.log('HTTP Status Code:', response.status);  // Log the status code
        
        if (response.ok) {
            return response.json();  // Parse the response as JSON
        } else {
            console.error('Logout failed with status:', response.status);
            throw new Error('Logout failed.');
        }
    })
    .then(data => {
        console.log(data.message);  // Log the success message from the server
        // Redirect to index.php after successful logout
        window.location.href = 'index.php';
    })
    .catch(error => {
        console.error('Error during logout:', error);
    });
}




             




        function updateBackground() {
    // Move background layers
    bg1X -= bg1Speed;
    bg2X -= bg2Speed;

    // Reset background position to create an endless loop
    if (bg1X <= -canv.width) {
        bg1X = 0;
    }
    if (bg2X <= -canv.width) {
        bg2X = 0;
    }

    // Draw backgrounds
    ctx.drawImage(background1, bg1X, 0, canv.width, canv.height);
    ctx.drawImage(background1, bg1X + canv.width, 0, canv.width, canv.height);

    ctx.drawImage(background2, bg2X, 0, canv.width, canv.height);
    ctx.drawImage(background2, bg2X + canv.width, 0, canv.width, canv.height);
}
        function updateUI() {
            document.getElementById("lives").textContent = `Lives: ${lives}`;
            document.getElementById("score").textContent = `Score: ${score}`;
            document.getElementById("highScore").textContent = `Best: ${scoreHigh}`;
            document.getElementById("token").textContent = `Tokens: ${tokensCollected}`;
        }

        function pauseGame() {
            clearInterval(gameInterval);
            isPaused = true;
            document.getElementById("pauseBtn").disabled = true;
            document.getElementById("resumeBtn").disabled = false;
        }

        function resumeGame() {
            gameInterval = setInterval(update, 1000 / FPS);
            isPaused = false;
            document.getElementById("pauseBtn").disabled = false;
            document.getElementById("resumeBtn").disabled = true;
        }

        function resetGame() {
            clearInterval(gameInterval);
            newGame();
            resumeGame();
        }

        function createEnemyWave() {
            roids = [];
            var x, y;
            for (var i = 0; i < ROID_NUM + level; i++) {
                do {
                    x = Math.floor(Math.random() * canv.width);
                    y = Math.floor(Math.random() * canv.height);
                } while (distBetweenPoints(ship.x, ship.y, x, y) < ROID_SIZE * 2 + ship.r);

                let enemyType = Math.floor(Math.random() * 3) + 1; // Randomly choose enemy type
                roids.push(newEnemy(x, y, enemyType, ROID_SIZE / 2)); // Push a new enemy to the array
            }
            if (level % 5 === 0) {  // Every 5th level, introduce a boss
                let bossX = Math.floor(Math.random() * canv.width);
                let bossY = Math.floor(Math.random() * canv.height);
                roids.push(newEnemy(bossX, bossY, "boss", ROID_SIZE));
            }
        }

        function newEnemy(x, y, type, size) {
            var lvlMult = 1 + 0.1 * level;
            var enemy = {
                x: x,
                y: y,
                xv: Math.random() * ROID_SPD * lvlMult / FPS * (Math.random() < 0.5 ? 1 : -1),
                yv: Math.random() * ROID_SPD * lvlMult / FPS * (Math.random() < 0.5 ? 1 : -1),
                a: Math.random() * Math.PI * 2,
                r: size,
                type: type,
                img: new Image()
            };

            switch (type) {
                case 1:
                    enemy.img.src = "enemy1.png";
                    break;
                case 2:
                    enemy.img.src = "enemy2.png";
                    break;
                case 3:
                    enemy.img.src = "enemy3.png";
                    break;
                case "boss":
                    enemy.img.src = "boss.png";
                    break;
            }

            return enemy;
        }

        function destroyEnemy(index) {
            var x = roids[index].x;
            var y = roids[index].y;
            var r = roids[index].r;
            var type = roids[index].type;

            if (r > ROID_SIZE / 8) { // Split until the smallest size
                // Create two smaller enemies
                roids.push(newEnemy(x, y, type, r / 2));
                roids.push(newEnemy(x, y, type, r / 2));

                // Adjust score based on the type and size
                switch (type) {
                    case 1:
                        score += ROID_PTS_LGE;
                        break;
                    case 2:
                        score += ROID_PTS_MED;
                        break;
                    case 3:
                        score += ROID_PTS_SML;
                        break;
                    case "boss":
                        score += ROID_PTS_LGE * 5;  // Bosses give more points
                        break;
                }
            } else {
                // This is the smallest size, no more splitting, just drop a token
                createToken(x, y);
                score += ROID_PTS_SML;
            }

            if (score > scoreHigh) {
                scoreHigh = score;
                localStorage.setItem(SAVE_KEY_SCORE, scoreHigh);
            }

            // Remove the destroyed enemy from the array
            roids.splice(index, 1);

            if (roids.length == 0) {
                level++;
                newLevel();
            }
            updateUI();
        }

        function distBetweenPoints(x1, y1, x2, y2) {
            return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        }

        function drawShip(x, y, a, colour = "white") {
            ctx.strokeStyle = colour;
            ctx.lineWidth = SHIP_SIZE / 20;
            ctx.beginPath();
            ctx.moveTo(
                x + 4 / 3 * ship.r * Math.cos(a),
                y - 4 / 3 * ship.r * Math.sin(a)
            );
            ctx.lineTo(
                x - ship.r * (2 / 3 * Math.cos(a) + Math.sin(a)),
                y + ship.r * (2 / 3 * Math.sin(a) - Math.cos(a))
            );
            ctx.lineTo(
                x - ship.r * (2 / 3 * Math.cos(a) - Math.sin(a)),
                y + ship.r * (2 / 3 * Math.sin(a) + Math.cos(a))
            );
            ctx.closePath();
            ctx.stroke();
        }

        function explodeShip() {
            ship.explodeTime = Math.ceil(SHIP_EXPLODE_DUR * FPS);
        }

        function gameOver() {
            ship.dead = true;
            text = "Game Over";
            textAlpha = 1.0;
            roundsLost++;
            endGame(false);
        }

        function keyDown(ev) {
            if (ship.dead) return;

            switch(ev.keyCode) {
                case 32:
                    shootLaser();
                    break;
                case 37:
                    ship.rot = SHIP_TURN_SPD / 180 * Math.PI / FPS;
                    break;
                case 38:
                    ship.thrusting = true;
                    break;
                case 39:
                    ship.rot = -SHIP_TURN_SPD / 180 * Math.PI / FPS;
                    break;
            }
        }

        function keyUp(ev) {
            if (ship.dead) return;

            switch(ev.keyCode) {
                case 32:
                    ship.canShoot = true;
                    break;
                case 37:
                    ship.rot = 0;
                    break;
                case 38:
                    ship.thrusting = false;
                    break;
                case 39:
                    ship.rot = 0;
                    break;
            }
        }

        function newGame() {
            level = 0;
            lives = GAME_LIVES;
            score = 0;
            roundsPlayed = 0;
            roundsWon = 0;
            roundsLost = 0;
            tokensCollected = 0;
            ship = newShip();

            var scoreStr = localStorage.getItem(SAVE_KEY_SCORE);
            scoreHigh = scoreStr ? parseInt(scoreStr) : 0;
            updateBackground();
            newLevel();
            updateUI();
        }

        function newLevel() {
            text = "Level " + (level + 1);
            textAlpha = 1.0;
            createEnemyWave();
        }

        function newShip() {
            return {
                x: canv.width / 2,
                y: canv.height / 2,
                a: 90 / 180 * Math.PI,
                r: SHIP_SIZE / 2,
                blinkNum: Math.ceil(SHIP_INV_DUR / SHIP_BLINK_DUR),
                blinkTime: Math.ceil(SHIP_BLINK_DUR * FPS),
                canShoot: true,
                dead: false,
                explodeTime: 0,
                lasers: [],
                rot: 0,
                thrusting: false,
                thrust: {
                    x: 0,
                    y: 0
                }
            };
        }

        function shootLaser() {
            if (ship.canShoot && ship.lasers.length < LASER_MAX) {
                ship.lasers.push({
                    x: ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
                    y: ship.y - 4 / 3 * ship.r * Math.sin(ship.a),
                    xv: LASER_SPD * Math.cos(ship.a) / FPS,
                    yv: -LASER_SPD * Math.sin(ship.a) / FPS,
                    dist: 0,
                    explodeTime: 0
                });
            }
            ship.canShoot = false;
        }

        // Global variables
        let tokens = [];
        // Create a token at a given position
        function createToken(x, y) {
            let token = {
                x: x,
                y: y,
                r: 10,  // radius of the token
                collected: false
            };

            tokens.push(token);
        }

        // Draw tokens on the canvas
        function drawTokens() {
            tokens.forEach((token) => {
                if (!token.collected) {
                    // Draw the token as an image
                    const img = new Image();
                    img.src = 'token.png'; // Path to your token image

                    img.onload = function() {
                        ctx.drawImage(img, token.x - token.r, token.y - token.r, token.r * 2, token.r * 2);
                    };
                }
            });
        }

        // Check for token collection by the ship
        function checkTokenCollection() {
            tokens.forEach((token) => {
                if (!token.collected && distBetweenPoints(ship.x, ship.y, token.x, token.y) < ship.r + token.r) {
                    token.collected = true;
                    tokensCollected += 1;
                    updateUI();
                }
            });
        }

        function update() {
            if (isPaused) return;

            drawTokens();
            checkTokenCollection();

            var blinkOn = ship.blinkNum % 2 == 0;
            var exploding = ship.explodeTime > 0;

            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canv.width, canv.height);

            for (var i = 0; i < roids.length; i++) {
                var r = roids[i].r;
                ctx.drawImage(roids[i].img, roids[i].x - r, roids[i].y - r, r * 2, r * 2);
            }

            if (ship.thrusting && !ship.dead) {
                ship.thrust.x += SHIP_THRUST * Math.cos(ship.a) / FPS;
                ship.thrust.y -= SHIP_THRUST * Math.sin(ship.a) / FPS;

                if (!exploding && blinkOn) {
                    ctx.fillStyle = "red";
                    ctx.strokeStyle = "yellow";
                    ctx.lineWidth = SHIP_SIZE / 10;
                    ctx.beginPath();
                    ctx.moveTo(
                        ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + 0.5 * Math.sin(ship.a)),
                        ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - 0.5 * Math.cos(ship.a))
                    );
                    ctx.lineTo(
                        ship.x - ship.r * 5 / 3 * Math.cos(ship.a),
                        ship.y + ship.r * 5 / 3 * Math.sin(ship.a)
                    );
                    ctx.lineTo(
                        ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - 0.5 * Math.sin(ship.a)),
                        ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + 0.5 * Math.cos(ship.a))
                    );
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                }
            } else {
                ship.thrust.x -= FRICTION * ship.thrust.x / FPS;
                ship.thrust.y -= FRICTION * ship.thrust.y / FPS;
            }

            if (!exploding) {
                if (blinkOn && !ship.dead) {
                    drawShip(ship.x, ship.y, ship.a);
                }

                if (ship.blinkNum > 0) {
                    ship.blinkTime--;
                    if (ship.blinkTime == 0) {
                        ship.blinkTime = Math.ceil(SHIP_BLINK_DUR * FPS);
                        ship.blinkNum--;
                    }
                }
            }

            if (SHOW_BOUNDING) {
                ctx.strokeStyle = "lime";
                ctx.beginPath();
                ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2, false);
                ctx.stroke();
            }

            if (SHOW_CENTRE_DOT) {
                ctx.fillStyle = "red";
                ctx.fillRect(ship.x - 1, ship.y - 1, 2, 2);
            }

            for (var i = 0; i < ship.lasers.length; i++) {
                if (ship.lasers[i].explodeTime == 0) {
                    ctx.fillStyle = "salmon";
                    ctx.beginPath();
                    ctx.arc(ship.lasers[i].x, ship.lasers[i].y, SHIP_SIZE / 15, 0, Math.PI * 2, false);
                    ctx.fill();
                } else {
                    ctx.fillStyle = "orangered";
                    ctx.beginPath();
                    ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.75, 0, Math.PI * 2, false);
                    ctx.fill();
                    ctx.fillStyle = "salmon";
                    ctx.beginPath();
                    ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.5, 0, Math.PI * 2, false);
                    ctx.fill();
                    ctx.fillStyle = "pink";
                    ctx.beginPath();
                    ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.25, 0, Math.PI * 2, false);
                    ctx.fill();
                }
            }

            if (textAlpha >= 0) {
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = "rgba(255, 255, 255, " + textAlpha + ")";
                ctx.font = "small-caps " + TEXT_SIZE + "px dejavu sans mono";
                ctx.fillText(text, canv.width / 2, canv.height * 0.75);
                textAlpha -= (1.0 / TEXT_FADE_TIME / FPS);
            } else if (ship.dead) {
                newGame();
            }

            var lifeColour;
            for (var i = 0; i < lives; i++) {
                lifeColour = exploding && i == lives - 1 ? "red" : "white";
                drawShip(SHIP_SIZE + i * SHIP_SIZE * 1.2, SHIP_SIZE, 0.5 * Math.PI, lifeColour);
            }

            ctx.textAlign = "right";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "white";
            ctx.font = TEXT_SIZE + "px dejavu sans mono";
            ctx.fillText(score, canv.width - SHIP_SIZE / 2, SHIP_SIZE);

            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "white";
            ctx.font = (TEXT_SIZE * 0.75) + "px dejavu sans mono";
            ctx.fillText("BEST " + scoreHigh, canv.width / 2, SHIP_SIZE);

            var ax, ay, ar, lx, ly;
            for (var i = roids.length - 1; i >= 0; i--) {
                ax = roids[i].x;
                ay = roids[i].y;
                ar = roids[i].r;

                for (var j = ship.lasers.length - 1; j >= 0; j--) {
                    lx = ship.lasers[j].x;
                    ly = ship.lasers[j].y;

                    if (ship.lasers[j].explodeTime == 0 && distBetweenPoints(ax, ay, lx, ly) < ar) {
                        destroyEnemy(i);
                        ship.lasers[j].explodeTime = Math.ceil(LASER_EXPLODE_DUR * FPS);
                        break;
                    }
                }
            }

            if (!exploding) {
                if (ship.blinkNum == 0 && !ship.dead) {
                    for (var i = 0; i < roids.length; i++) {
                        if (distBetweenPoints(ship.x, ship.y, roids[i].x, roids[i].y) < ship.r + roids[i].r) {
                            explodeShip();
                            destroyEnemy(i);
                            lives--;
                            if (lives == 0) {
                                gameOver();
                            } else {
                                ship = newShip();
                            }
                            break;
                        }
                    }
                }

                ship.a += ship.rot;
                ship.x += ship.thrust.x;
                ship.y += ship.thrust.y;
            } else {
                ship.explodeTime--;

                if (ship.explodeTime == 0) {
                    lives--;
                    if (lives == 0) {
                        gameOver();
                    } else {
                        ship = newShip();
                    }
                }
            }

            if (ship.x < 0 - ship.r) {
                ship.x = canv.width + ship.r;
            } else if (ship.x > canv.width + ship.r) {
                ship.x = 0 - ship.r;
            }
            if (ship.y < 0 - ship.r) {
                ship.y = canv.height + ship.r;
            } else if (ship.y > canv.height + ship.r) {
                ship.y = 0 - ship.r;
            }

            for (var i = ship.lasers.length - 1; i >= 0; i--) {
                if (ship.lasers[i].dist > LASER_DIST * canv.width) {
                    ship.lasers.splice(i, 1);
                    continue;
                }

                if (ship.lasers[i].explodeTime > 0) {
                    ship.lasers[i].explodeTime--;

                    if (ship.lasers[i].explodeTime == 0) {
                        ship.lasers.splice(i, 1);
                        continue;
                    }
                } else {
                    ship.lasers[i].x += ship.lasers[i].xv;
                    ship.lasers[i].y += ship.lasers[i].yv;

                    ship.lasers[i].dist += Math.sqrt(Math.pow(ship.lasers[i].xv, 2) + Math.pow(ship.lasers[i].yv, 2));
                }

                if (ship.lasers[i].x < 0) {
                    ship.lasers[i].x = canv.width;
                } else if (ship.lasers[i].x > canv.width) {
                    ship.lasers[i].x = 0;
                }
                if (ship.lasers[i].y < 0) {
                    ship.lasers[i].y = canv.height;
                } else if (ship.lasers[i].y > canv.height) {
                    ship.lasers[i].y = 0;
                }
            }

            for (var i = roids.length - 1; i >= 0; i--) {
                roids[i].x += roids[i].xv;
                roids[i].y += roids[i].yv;

                if (roids[i].x < 0 - roids[i].r) {
                    roids[i].x = canv.width + roids[i].r;
                } else if (roids[i].x > canv.width + roids[i].r) {
                    roids[i].x = 0 - roids[i].r;
                }
                if (roids[i].y < 0 - roids[i].r) {
                    roids[i].y = canv.height + roids[i].r;
                } else if (roids[i].y > canv.height + roids[i].r) {
                    roids[i].y = 0 - roids[i].r;
                }
            }
        }

        // Call this function when the game ends to determine win/loss
        function endGame(isWin) {
            roundsPlayed++;
            if (isWin) {
                roundsWon++;
            } else {
                roundsLost++;
            }

            // Send data to the server
            sendGameData();
        }

        // Function to send game data to the server
        function sendGameData() {
            var xhr = new XMLHttpRequest();
            xhr.open("POST", "update_score.php", true);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

            var params = "user_Id=" + encodeURIComponent(<?php echo $user_id; ?>) +
                         "&score=" + encodeURIComponent(score) +
                         "&roundsPlayed=" + encodeURIComponent(roundsPlayed) +
                         "&roundsWon=" + encodeURIComponent(roundsWon) +
                         "&roundsLost=" + encodeURIComponent(roundsLost) +
                         "&tokens=" + encodeURIComponent(tokensCollected);

            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    console.log("Score updated successfully.");
                }
            };

            xhr.send(params);
        }
    </script>
</body>
</html>
