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
playerImage.src = 'player.png'; // Ensure this path is correct
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
const marginPercentage = 0.075; // 7.5% margin around the canvas
let paused = false;
let heartFrame = 0;
const heartSpriteWidth = 100;
const heartSpriteHeight = 100;
const heartFrameSpeed = 5;
let playerId = 1; // Replace with actual player ID
let username = 'player1'; // Replace with actual username
let roundsPlayed = 0;
let roundsWon = 0;
let roundsLost = 0;

/**
 * Enemy class representing enemies in the game.
 */
class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speedX = Math.random() * 4 - 2;
        this.speedY = Math.random() * 2 + 1;
        this.spriteWidth = 100;
        this.spriteHeight = 125;
        this.height = this.spriteWidth / 2.5;
        this.width = this.spriteHeight / 2.5;
        this.frame = 0;
        this.frameSpeed = 4;
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
            if (lives <= 0) {
                lives = 0;
                endGame();
            } else {
                this.y = 0 - this.height;
                this.x = Math.random() * CANVAS_WIDTH;
            }
            document.getElementById('lives').textContent = `Lives: ${lives}`;
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
    document.getElementById('game-over').style.display = 'none';
    resizeCanvas();
    animate();
}

/**
 * Pause the game.
 */
function pauseGame() {
    paused = !paused;
    if (!paused) {
        animate();
    }
}

/**
 * End the game and display game over screen.
 */
function endGame() {
    gameOver = true;
    document.getElementById('game-over').style.display = 'block';
}

/**
 * Animate heart sprites to create a beating effect.
 */
function animateHeart() {
    if (gameframe % heartFrameSpeed === 0) {
        heartFrame++;
    }
    if (heartFrame > 5) {
        heartFrame = 0;
    }
    ctx.drawImage(
        heartImage,
        heartFrame * heartSpriteWidth, 0, heartSpriteWidth, heartSpriteHeight,
        10, 10, 50, 50
    );
}

/**
 * Main animation loop.
 */
function animate() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (!paused && !gameOver) {
        gameframe++;
        movePlayer();
        animateHeart();

        // Draw background image
        ctx.drawImage(backgroundImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw enemies
        enemiesArray.forEach(enemy => {
            enemy.update();
            enemy.draw();
        });

        // Draw lasers
        lasers.forEach(laser => {
            laser.update();
            laser.draw();
        });

        // Draw player
        ctx.drawImage(playerImage, playerX, playerY, 50, 50);

        // Check laser-enemy collisions
        for (let i = 0; i < lasers.length; i++) {
            for (let j = 0; j < enemiesArray.length; j++) {
                if (
                    lasers[i] &&
                    lasers[i].x < enemiesArray[j].x + enemiesArray[j].width &&
                    lasers[i].x + lasers[i].width > enemiesArray[j].x &&
                    lasers[i].y < enemiesArray[j].y + enemiesArray[j].height &&
                    lasers[i].y + lasers[i].height > enemiesArray[j].y
                ) {
                    // Remove laser and enemy on collision
                    updateScore(10);
                    lasers.splice(i, 1);
                    enemiesArray.splice(j, 1);
                    break;
                }
            }
        }

        // End wave if all enemies are defeated
        if (enemiesArray.length === 0) {
            currentWave++;
            if (currentWave <= maxWaves) {
                createEnemies();
            } else {
                endGame();
            }
            document.getElementById('wave').textContent = `Wave: ${currentWave}`;
        }
        requestAnimationFrame(animate);
    }
}

/**
 * Handle window resizing and adjust canvas size.
 */
function resizeCanvas() {
    CANVAS_WIDTH = window.innerWidth * (1 - 2 * marginPercentage);
    CANVAS_HEIGHT = window.innerHeight * (1 - 2 * marginPercentage);
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    playerX = CANVAS_WIDTH / 2 - 25;
    playerY = CANVAS_HEIGHT - 60;
}

window.addEventListener('resize', resizeCanvas);

/**
 * Load all images and start the game.
 */
function loadImages() {
    let imagesLoaded = 0;
    const images = [enemyImage, playerImage, backgroundImage, heartImage];
    images.forEach((image) => {
        image.onload = () => {
            imagesLoaded++;
            if (imagesLoaded === images.length) {
                // Initial setup
                resizeCanvas();
                createEnemies();
                animate();
            }
        };
    });
}

document.getElementById('reset-button').addEventListener('click', resetGame);
document.getElementById('pause-button').addEventListener('click', pauseGame);

// Load images and start the game
loadImages();



