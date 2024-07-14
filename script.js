/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
let CANVAS_WIDTH, CANVAS_HEIGHT;
const enemiesArray = [];
const numberOfEnemies = 10;
const enemyImage = new Image();
enemyImage.src = 'enemy2.png';
const playerImage = new Image();
playerImage.src = 'player1.png'; // Replace with the path to your player image
let gameframe = 0;
let playerX, playerY;
const playerSpeed = 5;
let keys = {};
const backgroundImage = new Image();
backgroundImage.src = 'background-space-planets.png'; // Replace with the path to your background image
let score = 0;
let tokens = 0;
let lives = 5;
const waves = 5;
let currentWave = 1;

/**
 * Enemy class representing enemies in the game.
 */
class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speedX = Math.random() * 4 - 2;
        this.speedY = Math.random() * 2 + 1; // Move downwards
        this.spriteWidth = 93;
        this.spriteHeight = 102;
        this.height = this.spriteWidth / 2.5;
        this.width = this.spriteHeight / 2.5;
        this.frame = 0;
    }

    /**
     * Update enemy position and animation frame.
     */
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (gameframe % 2 === 0) {
            this.frame > 4 ? this.frame = 0 : this.frame++;
        }

        // Reset position if off screen
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
                // Move enemy back to the top of the screen
                this.y = 0 - this.height;
                this.x = Math.random() * CANVAS_WIDTH;
            }
        }
    }

    /**
     * Draw enemy sprite on canvas.
     */
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

    /**
     * Update laser position.
     */
    update() {
        this.y -= this.speed;
    }

    /**
     * Draw laser on canvas.
     */
    draw() {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

const lasers = [];

/**
 * Create initial set of enemies.
 */
function createEnemies() {
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

/**
 * Event listener for releasing keys.
 */
window.addEventListener('keyup', function (e) {
    keys[e.key] = false;
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
}

/**
 * Update score and tokens based on game events.
 * @param {number} points - Points to add to score.
 */
function updateScore(points) {
    score += points;
    document.getElementById('score').textContent = `Score: ${score}`;
    if (score % 50 === 0) {
        tokens += 0.1;
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
    gameOver = false;
    document.getElementById('game-over').style.display = 'none';
    resizeCanvas(); // Reset player position
    animate(); // Restart the game loop
}

/**
 * Handle end game event.
 */
function endGame() {
    gameOver = true;
    document.getElementById('game-over').style.display = 'block';
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
                updateScore(5);
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
    CANVAS_WIDTH = window.innerWidth * 0.8;
    CANVAS_HEIGHT = window.innerHeight * 0.8;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    playerX = CANVAS_WIDTH / 2 - 25;
    playerY = CANVAS_HEIGHT - 100;
}

// Initialize game
window.addEventListener('load', () => {
    resizeCanvas();
    createEnemies();
    animate();
});
