/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
let CANVAS_WIDTH, CANVAS_HEIGHT;
const enemiesArray = [];
const numberOfEnemies = 10;
const enemyImage = new Image();
enemyImage.src = 'enemy1.png';
const playerImage = new Image();
playerImage.src = 'player.png'; // Replace with the path to your player image
let gameframe = 0;
let playerX, playerY;
const playerSpeed = 5;
let keys = {};
const backgroundImage = new Image();
backgroundImage.src = 'background.png'; // Replace with the path to your background image
let score = 0;
let tokens = 0;
let lives = 5;
const waves = 3;
let currentWave = 1;

class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speedX = Math.random() * 4 - 2;
        this.speedY = Math.random() * 2 + 1; // Move downwards
        this.spriteWidth = 290;
        this.spriteHeight = 155;
        this.height = this.spriteWidth / 2.5;
        this.width = this.spriteHeight / 2.5;
        this.frame = 0;
    }

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
            if (lives === 0) {
                resetGame();
            }
            this.y = 0 - this.height;
            this.x = Math.random() * CANVAS_WIDTH;
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
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

const lasers = [];

function createEnemies() {
    for (let i = 0; i < numberOfEnemies; i++) {
        enemiesArray.push(new Enemy(Math.random() * CANVAS_WIDTH, Math.random() * -CANVAS_HEIGHT));
    }
}

function shootLaser() {
    const laser = new Laser(playerX + 20, playerY);
    lasers.push(laser);
}

window.addEventListener('keydown', function (e) {
    keys[e.key] = true;
    if (e.key === ' ') {
        shootLaser();
    }
});

window.addEventListener('keyup', function (e) {
    keys[e.key] = false;
});

function movePlayer() {
    if (keys['ArrowRight'] && playerX < CANVAS_WIDTH - 50) {
        playerX += playerSpeed;
    }
    if (keys['ArrowLeft'] && playerX > 0) {
        playerX -= playerSpeed;
    }
}

function updateScore(points) {
    score += points;
    document.getElementById('score').textContent = `Score: ${score}`;
    if (score % 100 === 0) {
        tokens += 0.01;
        document.getElementById('tokens').textContent = `Tokens: ${tokens.toFixed(2)}`;
    }
}

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
}

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
                if (enemiesArray.length === 0 && currentWave < waves) {
                    currentWave++;
                    createEnemies();
                } else if (currentWave === waves && enemiesArray.length === 0) {
                    resetGame();
                }
            }
        });
    });

    lasers.forEach((laser, index) => {
        laser.update();
        laser.draw();
        if (laser.y < 0) {
            lasers.splice(index, 1);
        }
    });

    ctx.drawImage(playerImage, playerX, playerY, 50, 50);

    requestAnimationFrame(animate);
    gameframe++;
    movePlayer();
}

function resizeCanvas() {
    CANVAS_WIDTH = canvas.width = window.innerWidth * 0.8; // 80% of the window's width
    CANVAS_HEIGHT = canvas.height = window.innerHeight * 0.8; // 80% of the window's height
    playerX = CANVAS_WIDTH / 2 - 25; // Center player horizontally
    playerY = CANVAS_HEIGHT - 60; // Position player at the bottom
}

window.onload = () => {
    resizeCanvas();
    createEnemies();
    animate();
};

window.onresize = resizeCanvas;
