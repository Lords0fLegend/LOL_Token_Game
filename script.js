/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
let CANVAS_WIDTH, CANVAS_HEIGHT;
const enemiesArray = [];
const lasers = [];
let playerX, playerY;
const playerSpeed = 5;
const enemyImage = new Image();                                                                                                                                                                                                                                                                                                           
enemyImage.src = 'enemy2.png';
const playerImage = new Image();
playerImage.src = 'player1.png';
const backgroundImage = new Image();
backgroundImage.src = 'background-space-planets.png';
const heartImage = new Image();
heartImage.src = 'heart.png';
let gameframe = 0;
let keys = {};
let score = 0;
let tokens = 0;
let lives = 5;
let currentWave = 1;
let gameOver = false;
const maxWaves = 10;

/**
 * Enemy class representing enemies in the game.
 */
class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speedX = Math.random() * 4 - 2;
        this.speedY = Math.random() * 2 + 1; // Move downwards
        this.spriteWidth = 100;
        this.spriteHeight = 125;
        this.height = this.spriteWidth / 2.5;
        this.width = this.spriteHeight / 2.5;
        this.frame = 0;
        this.frameSpeed = 4; // Adjust this value to slow down or speed up the animation
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (gameframe % this.frameSpeed === 0) {
            this.frame > 4 ? this.frame = 0 : this.frame++;
        }

        if (this.y > CANVAS_HEIGHT) {
            this.y = 0 - this.height;
            this.x = Math.random() * CANVAS_WIDTH;
            this.speedX = Math.random() * 4 - 2;
            this.speedY = Math.random() * 2 + 1;
        }

        // Check collision with player
        if (
            this.x < playerX + 50 &&
            this.x + this.width > playerX &&
            this.y < playerY + 50 &&
            this.y + this.height > playerY
        ) {
            lives--;
            document.getElementById('lives').textContent = `Lives: ${lives}`;
            if (lives <= 0) {
                endGame();
            } else {
                this.y = 0 - this.height;
                this.x = Math.random() * CANVAS_WIDTH;
            }
        }
    }

    draw() {
        ctx.drawImage(
            enemyImage,
            this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight,
            this.x, this.y, this.width, this.height
        );
    }
}

/**
 * Laser class representing player's laser shots.
 */
class Laser {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 5;
        this.height = 20;
        this.speed = 5;
    }

    update() {
        this.y -= this.speed;
    }

    draw() {
        ctx.fillStyle = 'lime';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

/**
 * Create initial set of enemies.
 */
function createEnemies() {
    const numberOfEnemies = 25 + (currentWave - 1) * 20;
    for (let i = 0; i < numberOfEnemies; i++) {
        enemiesArray.push(new Enemy(Math.random() * CANVAS_WIDTH, Math.random() * -CANVAS_HEIGHT));
    }
}

/**
 * Handle shooting a laser from the player.
 */
function shootLaser() {
    const laser = new Laser(playerX + 20, playerY);
    lasers.push(laser);
}

/**
 * Event listener for keyboard input to shoot lasers.
 */
window.addEventListener('keydown', function (e) {
    if (e.key === ' ' && !keys[' ']) {
        keys[' '] = true;
        shootLaser();
    }
    keys[e.key] = true;
});

window.addEventListener('keyup', function (e) {
    keys[e.key] = false;
});

window.addEventListener('touchstart', function (e) {
    shootLaser();
});

window.addEventListener('touchmove', function (e) {
    const touch = e.touches[0];
    playerX = touch.clientX - 25;
    playerY = touch.clientY - 25;
});

/**
 * Move player based on keyboard input.
 */
function movePlayer() {
    if (keys['ArrowRight'] && playerX < CANVAS_WIDTH - 50) {
        playerX += playerSpeed;
    }
    if (keys['ArrowLeft'] && playerX > 0) {
        playerX -= playerSpeed;
    }
    if (keys['ArrowUp'] && playerY > 0) {
        playerY -= playerSpeed;
    }
    if (keys['ArrowDown'] && playerY < CANVAS_HEIGHT - 50) {
        playerY += playerSpeed;
    }
    if (keys['w'] && playerY > 0) {
        playerY -= playerSpeed;
    }
    if (keys['s'] && playerY < CANVAS_HEIGHT - 50) {
        playerY += playerSpeed;
    }
    if (keys['a'] && playerX > 0) {
        playerX -= playerSpeed;
    }
    if (keys['d'] && playerX < CANVAS_WIDTH - 50) {
        playerX += playerSpeed;
    }
}

/**
 * Update score and tokens based on game events.
 */
function updateScore(points) {
    score += points;
    document.getElementById('score').textContent = `Score: ${score}`;
    if (score % 60 === 0) {
        tokens += 0.10;
        document.getElementById('tokens').textContent = `Tokens: ${tokens.toFixed(2)}`;
    }
}

/**
 * Reset game state for a new game.
 */
function resetGame() {
    score = 0;
    tokens = 0;
    lives = 5;
    currentWave = 1;
    enemiesArray.length = 0;
    lasers.length = 0;
    createEnemies();
    document.getElementById('score').textContent = `Score: ${score}`;
    document.getElementById('tokens').textContent = `Tokens: ${tokens.toFixed(2)}`;
    document.getElementById('lives').textContent = `Lives: ${lives}`;
    document.getElementById('wave').textContent = `Wave: ${currentWave}`;
    gameOver = false;
    document.getElementById('game-over').style.display = 'none';
    resizeCanvas();
    animate();
}

/**
 * Handle end game event.
 */
function endGame() {
    gameOver = true;
    document.getElementById('game-over').style.display = 'block';
    // Update the database with player stats here
    updatePlayerStats();
}

/**
 * Main game loop to update and render game elements.
 */
function animate() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.drawImage(backgroundImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    enemiesArray.forEach((enemy, index) => {
        enemy.update();
        enemy.draw();

        lasers.forEach((laser, laserIndex) => {
            if (
                laser.x < enemy.x + enemy.width &&
                laser.x + laser.width > enemy.x &&
                laser.y < enemy.y + enemy.height &&
                laser.y + laser.height > enemy.y
            ) {
                enemiesArray.splice(index, 1);
                lasers.splice(laserIndex, 1);
                updateScore(10);
            }
        });
    });

    lasers.forEach(laser => {
        laser.update();
        laser.draw();
    });

    movePlayer();
    ctx.drawImage(playerImage, playerX, playerY, 50, 50);

    gameframe++;
    if (!gameOver) {
        requestAnimationFrame(animate);
    }
}

/**
 * Resize canvas and reset player position.
 */
function resizeCanvas() {
    CANVAS_WIDTH = window.innerWidth * 0.85;
    CANVAS_HEIGHT = window.innerHeight * 0.85;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    playerX = CANVAS_WIDTH / 2 - 25;
    playerY = CANVAS_HEIGHT - 100;
}

/**
 * Advance to the next wave.
 */
function nextWave() {
    currentWave++;
    if (currentWave > maxWaves) {
        endGame();
    } else {
        enemiesArray.length = 0;
        createEnemies();
        document.getElementById('wave').textContent = `Wave: ${currentWave}`;
    }
}

/**
 * Update player stats in the database.
 */
function updatePlayerStats() {
    // Implement AJAX call to update player stats in the database
}

// Initialize game
window.addEventListener('load', () => {
    resizeCanvas();
    createEnemies();
    animate();
});

// Implement pause, play again, and end game buttons
document.getElementById('pause').addEventListener('click', () => {
    gameOver = true;
});

document.getElementById('play-again').addEventListener('click', () => {
    resetGame();
});

document.getElementById('end-game').addEventListener('click', () => {
    endGame();
});
function updatePlayerStats() {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "update_stats.php", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            console.log(xhr.responseText);
        }
    };
    xhr.send(`score=${score}&tokens=${tokens}`);
}
function loginUser(username, password) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "login.php", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            if (xhr.responseText === "Login successful.") {
                console.log("User logged in.");
                // Redirect to game page or initialize game
            } else {
                console.log("Login failed: " + xhr.responseText);
            }
        }
    };
    xhr.send(`username=${username}&password=${password}`);
}
