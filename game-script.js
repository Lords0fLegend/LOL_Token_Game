// Select the canvas element and its context
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');

// Retrieve user information from data attributes
const userInfo = document.getElementById('user-info');
const username = userInfo.getAttribute('data-username');
const user_Id = userInfo.getAttribute('data-user-id');

// Constants for player speed and maximum waves
const PLAYER_SPEED = 5;
const MAX_WAVES = 10;

// Paths to images used in the game
const images = {
    enemyFlying: 'small_dude.png',
    player: 'player.png',
    background: 'space_background.png',
};

// Function to load images asynchronously
const loadImage = (src) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(`Failed to load image: ${src}`, e);
    });
};

// Base class for all game entities
class Entity {
    constructor(x, y, width, height, spriteX, spriteY, spriteWidth, spriteHeight) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.spriteX = spriteX;
        this.spriteY = spriteY;
        this.spriteWidth = spriteWidth;
        this.spriteHeight = spriteHeight;
        this.angle = 0; // Rotation angle for spinning
    }

    // Method to draw the entity
    draw(image) {
        if (image.complete && image.naturalHeight !== 0) {
            ctx.save();
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.rotate(this.angle);
            ctx.drawImage(
                image,
                this.spriteX, this.spriteY,
                this.spriteWidth, this.spriteHeight,
                -this.width / 2, -this.height / 2,
                this.width, this.height
            );
            ctx.restore();
        } else {
            console.error('Image is not loaded properly:', image.src);
        }
    }
}

// Player class extending Entity
class Player extends Entity {
    constructor(x, y, width = 50, height = 50) {
        super(x, y, width, height, 0, 0, width, height);
        this.speed = PLAYER_SPEED;
        this.lives = 5;
    }

    // Method to update player position based on key inputs
    update(keys) {
        if (keys['ArrowRight'] && this.x < game.CANVAS_WIDTH - this.width) this.x += this.speed;
        if (keys['ArrowLeft'] && this.x > 0) this.x -= this.speed;
        if (keys['ArrowUp'] && this.y > 0) this.y -= this.speed;
        if (keys['ArrowDown'] && this.y < game.CANVAS_HEIGHT - this.height) this.y += this.speed;
    }
}

// Enemy class extending Entity
class Enemy extends Entity {
    constructor(x, y, width, height, spriteX, spriteY, spriteWidth, spriteHeight) {
        // Update width and height to half the original size
        super(x, y, width / 2, height / 2, spriteX, spriteY, spriteWidth, spriteHeight);
        this.speedX = Math.random() * 4 - 2;
        this.speedY = Math.random() * 2 + 1;
    }

    // Method to update enemy position and rotation
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.angle += Math.PI / 30; // Spin speed of 2 rotations per second
        if (this.y > game.CANVAS_HEIGHT) {
            this.resetPosition();
        }
    }

    // Method to reset enemy position when it goes off screen
    resetPosition() {
        this.y = 0 - this.height;
        this.x = Math.random() * game.CANVAS_WIDTH;
        this.speedX = Math.random() * 4 - 2;
        this.speedY = Math.random() * 2 + 1;
    }

    // Method to check collision with the player
    checkCollision(player) {
        return this.x < player.x + player.width &&
            this.x + this.width > player.x &&
            this.y < player.y + player.height &&
            this.y + this.height > player.y;
    }
}

// Laser class representing the player's bullets
class Laser {
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
    }

    // Method to update laser position
    update() {
        this.y -= this.speed;
    }

    // Method to draw the laser
    draw() {
        ctx.fillStyle = 'lime';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    // Method to check collision with an enemy
    checkCollision(enemy) {
        return this.x < enemy.x + enemy.width &&
            this.x + this.width > enemy.x &&
            this.y < enemy.y + enemy.height &&
            this.y + this.height > enemy.y;
    }
}

// Main game class
class Game {
    constructor() {
        this.CANVAS_WIDTH = window.innerWidth * 0.85;
        this.CANVAS_HEIGHT = window.innerHeight * 0.85;
        this.canvas = document.getElementById('canvas1');
        this.canvas.width = this.CANVAS_WIDTH;
        this.canvas.height = this.CANVAS_HEIGHT;
        this.ctx = this.canvas.getContext('2d');
        this.keys = {};
        this.enemies = [];
        this.lasers = [];
        this.player = new Player(this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT - 80);
        this.gameFrame = 0;
        this.score = 0;
        this.sessionTokens = 0;
        this.lives = 5;
        this.currentWave = 1;
        this.paused = false;
        this.gameOver = false;
        this.roundsPlayed = 1;
        this.roundsWon = 0;
        this.roundsLost = 0;
        this.totalRoundsPlayed = 0;
        this.totalRoundsWon = 0;
        this.totalRoundsLost = 0;
        this.animationFrameId = null;
    }

    // Method to preload images
    async preloadImages(sources) {
        const promises = sources.map(src => loadImage(src));
        return Promise.all(promises);
    }

    // Method to start the game
    async start() {
        const [enemyFlying, player, background] = await this.preloadImages(Object.values(images));
        this.assets = { enemyFlying, player, background };
        this.setupEventListeners();
        this.createEnemies();
        this.animate();
        this.updateHUD();  // Update HUD initially
    }

    // Method to setup event listeners for user input
    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            if (!this.paused) {  // Check if game is not paused
                this.keys[e.key] = true;
                if (e.key === ' ' && !this.keys['shooting']) {
                    this.keys['shooting'] = true;
                    this.shootLaser();
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            if (!this.paused) {  // Check if game is not paused
                this.keys[e.key] = false;
                if (e.key === ' ') {
                    this.keys['shooting'] = false;
                }
            }
        });

        window.addEventListener('touchstart', (e) => {
            if (!this.paused) {  // Check if game is not paused
                const touch = e.touches[0];
                this.player.x = touch.clientX - 25;
                this.player.y = touch.clientY - 25;
                this.shootLaser();
            }
        });

        window.addEventListener('touchmove', (e) => {
            if (!this.paused) {  // Check if game is not paused
                const touch = e.touches[0];
                this.player.x = touch.clientX - 25;
                this.player.y = touch.clientY - 25;
            }
        });

        window.addEventListener('resize', () => this.resizeCanvas());
        document.getElementById('reset-button').addEventListener('click', () => this.resetGame(true));
        document.getElementById('pause-button').addEventListener('click', () => this.togglePause());
        document.getElementById('play-again-button').addEventListener('click', () => this.resetGame(false));
        document.getElementById('end-game-button').addEventListener('click', () => this.endGame());
    }

    // Method to resize the canvas
    resizeCanvas() {
        this.CANVAS_WIDTH = window.innerWidth * 0.85;
        this.CANVAS_HEIGHT = window.innerHeight * 0.85;
        this.canvas.width = this.CANVAS_WIDTH;
        this.canvas.height = this.CANVAS_HEIGHT;
        // Keep the player's position unchanged
        this.player.x = Math.min(this.player.x, this.CANVAS_WIDTH - this.player.width);
        this.player.y = Math.min(this.player.y, this.CANVAS_HEIGHT - this.player.height);
    }

    // Method to create enemies
    createEnemies() {
        const numberOfEnemies = 25 + (this.currentWave - 1) * 20;
        for (let i = 0; i < numberOfEnemies; i++) {
            const enemy = new Enemy(
                Math.random() * this.CANVAS_WIDTH,
                Math.random() * -this.CANVAS_HEIGHT,
                118, 81, // Original dimensions, but they will be halved inside the constructor
                0, 0, 118, 81
            );
            this.enemies.push(enemy);
        }
        // Increment roundsWon correctly
        if (this.currentWave > 1) {
            this.roundsWon++;
        }
    }

    // Method to shoot a laser
    shootLaser() {
        const laser = new Laser(this.player.x + 22.5, this.player.y, 5, 20, 5);
        this.lasers.push(laser);
    }

    // Method to handle collisions between entities
    handleCollisions() {
        this.lasers.forEach((laser, laserIndex) => {
            this.enemies.forEach((enemy, enemyIndex) => {
                if (laser.checkCollision(enemy)) {
                    this.enemies.splice(enemyIndex, 1);
                    this.lasers.splice(laserIndex, 1);
                    this.score += 10;
                    if (this.score % 60 === 0) {
                        this.sessionTokens += 1;
                    }
                    this.updateHUD();  // Update HUD after score change
                    if (this.enemies.length === 0 && this.currentWave < MAX_WAVES) {
                        this.currentWave++;
                        this.createEnemies();
                        this.updateHUD();  // Update HUD after wave change
                    }
                }
            });
        });

        this.enemies.forEach((enemy, index) => {
            if (enemy.checkCollision(this.player)) {
                this.lives--;
                this.updateHUD();  // Update HUD after lives change
                if (this.lives <= 0) {
                    this.lives = 0;
                    this.roundsLost++;
                    this.endGame();
                } else {
                    enemy.resetPosition();
                }
            }
        });
    }

    // Method to update player stats in the database
    updatePlayerStats() {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "update_score.php", true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                console.log(xhr.responseText);
            }
        };

        console.log(`Sending data to server: user_Id=${user_Id}&username=${username}&score=${this.score}&roundsPlayed=${this.roundsPlayed}&roundsWon=${this.roundsWon}&roundsLost=${this.roundsLost}&tokens=${this.sessionTokens}`);

        xhr.send(`user_Id=${user_Id}&username=${username}&score=${this.score}&roundsPlayed=${this.roundsPlayed}&roundsWon=${this.roundsWon}&roundsLost=${this.roundsLost}&tokens=${this.sessionTokens}`);
    }

    // Method to end the game
    endGame() {
        this.gameOver = true;
        this.ctx.font = '50px Comic Sans MS';
        this.ctx.fillStyle = 'red';
        this.ctx.fillText('GAME OVER', this.CANVAS_WIDTH / 2 - 150, this.CANVAS_HEIGHT / 2);

        this.totalRoundsPlayed += this.roundsPlayed;
        this.totalRoundsWon += this.roundsWon;
        this.totalRoundsLost += this.roundsLost;

        console.log(`Game Over - Total Rounds Played: ${this.totalRoundsPlayed}, Total Rounds Won: ${this.totalRoundsWon}, Total Rounds Lost: ${this.totalRoundsLost}, Tokens: ${this.sessionTokens}`);

        this.updatePlayerStats();

        document.getElementById('play-again-button').style.display = 'block';
        document.getElementById('end-game-button').style.display = 'block';
    }

    // Method to toggle the game pause state
    togglePause() {
        this.paused = !this.paused;
        if (!this.paused) {
            this.animate();
        }
    }

    // Combined method to reset or restart the game
    resetGame(fullReset) {
        cancelAnimationFrame(this.animationFrameId);
        this.gameOver = false;

        if (fullReset) {
            // Full reset: reset all stats
            this.score = 0;
            this.sessionTokens = 0;
            this.roundsPlayed = 1;
            this.roundsWon = 0; // Reset roundsWon on full reset
            this.roundsLost = 0; // Reset roundsLost on full reset
        } else {
            // Restart: increment rounds played
            this.roundsPlayed++;
        }

        this.lives = 5;
        this.currentWave = 1;
        this.enemies.length = this.lasers.length = 0;
        this.player.x = this.CANVAS_WIDTH / 2;
        this.player.y = this.CANVAS_HEIGHT - 80;
        this.updateHUD();  // Update HUD after reset/restart
        this.createEnemies();
        this.animate();
        document.getElementById('play-again-button').style.display = 'none';
        document.getElementById('end-game-button').style.display = 'none';
    }

    // Method to update the heads-up display (HUD)
    updateHUD() {
        document.getElementById('score').textContent = `Score: ${this.score}`;
        document.getElementById('tokens').textContent = `Tokens: ${this.sessionTokens}`;
        document.getElementById('lives').textContent = `Lives: ${this.lives}`;
        document.getElementById('current-wave').textContent = `Wave: ${this.currentWave}`;
        document.getElementById('rounds-won').textContent = `Rounds Won: ${this.roundsWon}`;
        document.getElementById('rounds-lost').textContent = `Rounds Lost: ${this.roundsLost}`;
    }

    // Main animation loop
    animate() {
        if (this.paused) return;
        this.ctx.clearRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
        this.ctx.drawImage(this.assets.background, 0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
        this.lasers.forEach((laser, index) => {
            laser.update();
            laser.draw();
            if (laser.y < 0) this.lasers.splice(index, 1);
        });
        this.enemies.forEach(enemy => {
            enemy.update();
            enemy.draw(this.assets.enemyFlying);
        });
        this.player.draw(this.assets.player);
        this.player.update(this.keys);
        this.handleCollisions();
        this.gameFrame++;
        if (!this.gameOver) this.animationFrameId = requestAnimationFrame(() => this.animate());
    }
}

// Create and start the game
const game = new Game();
game.start();
