const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');

// Retrieve the username and user_id from the hidden DOM element
const userInfo = document.getElementById('user-info');
const username = userInfo.getAttribute('data-username');
const user_Id = userInfo.getAttribute('data-user-id');

let CANVAS_WIDTH, CANVAS_HEIGHT, playerX, playerY, gameFrame = 0, score = 0, sessionTokens = 0, lives = 5, currentWave = 1, paused = false, gameOver = false;
const PLAYER_SPEED = 5, MAX_WAVES = 10;
const enemies = [], lasers = [];
const keys = {};

// Initialize roundsPlayed to 0
let roundsPlayed = 0, roundsWon = 0, roundsLost = 0, totalRoundsPlayed = 0, totalRoundsWon = 0, totalRoundsLost = 0;

// Variable to store the animation frame ID
let animationFrameId;

const images = {
    enemy: 'enemy.png',
    player: 'player.png',
    background: 'space_background.png',
    heart: 'heart.png'
};

const loadImage = (src) => {
    const img = new Image();
    img.src = src;
    return img;
};

const assets = {
    enemy: loadImage(images.enemy),
    player: loadImage(images.player),
    background: loadImage(images.background),
    heart: loadImage(images.heart)
};

class Entity {
    constructor(x, y, width, height, spriteWidth, spriteHeight, frameSpeed = 4) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.spriteWidth = spriteWidth;
        this.spriteHeight = spriteHeight;
        this.frame = 0;
        this.frameSpeed = frameSpeed;
    }

    draw(image) {
        ctx.drawImage(image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    }
}

class Enemy extends Entity {
    constructor(x, y) {
        super(x, y, 42, 51, 105, 89);
        this.speedX = Math.random() * 4 - 2;
        this.speedY = Math.random() * 2 + 1;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (gameFrame % this.frameSpeed === 0) {
            this.frame = this.frame > 6 ? 0 : this.frame + 1;
        }
        if (this.y > CANVAS_HEIGHT) {
            this.resetPosition();
        }
        this.checkCollisionWithPlayer();
    }

    resetPosition() {
        this.y = 0 - this.height;
        this.x = Math.random() * CANVAS_WIDTH;
        this.speedX = Math.random() * 4 - 2;
        this.speedY = Math.random() * 2 + 1;
    }

    checkCollisionWithPlayer() {
        if (this.x < playerX + 50 && this.x + this.width > playerX && this.y < playerY + 50 && this.y + this.height > playerY) {
            lives--;
            if (lives <= 0) {
                lives = 0;
                endGame();
            } else {
                this.resetPosition();
            }
            document.getElementById('lives').textContent = `Lives: ${lives}`;
        }
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
        ctx.fillStyle = 'lime';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

const createEnemies = () => {
    const numberOfEnemies = 25 + (currentWave - 1) * 20;
    for (let i = 0; i < numberOfEnemies; i++) {
        enemies.push(new Enemy(Math.random() * CANVAS_WIDTH, Math.random() * -CANVAS_HEIGHT));
    }
    document.getElementById('current-wave').textContent = `Wave: ${currentWave}`; // Update wave display
};

const shootLaser = () => {
    lasers.push(new Laser(playerX + 20, playerY));
};

window.addEventListener('keydown', (e) => {
    if (e.key === ' ' && !keys[' ']) {
        keys[' '] = true;
        shootLaser();
    }
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

window.addEventListener('touchstart', shootLaser);

window.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    playerX = touch.clientX - 25;
    playerY = touch.clientY - 25;
});

const movePlayer = () => {
    if (keys['ArrowRight'] && playerX < CANVAS_WIDTH - 50) playerX += PLAYER_SPEED;
    if (keys['ArrowLeft'] && playerX > 0) playerX -= PLAYER_SPEED;
    if (keys['ArrowUp'] && playerY > 0) playerY -= PLAYER_SPEED;
    if (keys['ArrowDown'] && playerY < CANVAS_HEIGHT - 50) playerY += PLAYER_SPEED;
    if (keys['w'] && playerY > 0) playerY -= PLAYER_SPEED;
    if (keys['s'] && playerY < CANVAS_HEIGHT - 50) playerY += PLAYER_SPEED;
    if (keys['a'] && playerX > 0) playerX -= PLAYER_SPEED;
    if (keys['d'] && playerX < CANVAS_WIDTH - 50) playerX += PLAYER_SPEED;
};

const handleCollisions = () => {
    lasers.forEach((laser, laserIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (laser.x < enemy.x + enemy.width && laser.x + laser.width > enemy.x && laser.y < enemy.y + enemy.height && laser.y + laser.height > enemy.y) {
                enemies.splice(enemyIndex, 1);
                lasers.splice(laserIndex, 1);
                score += 10;
                if (score % 60 === 0) {
                    sessionTokens += 0.10;
                }
                document.getElementById('score').textContent = `Score: ${score}`;
                document.getElementById('tokens').textContent = `Tokens: ${sessionTokens.toFixed(2)}`;
                if (enemies.length === 0 && currentWave < MAX_WAVES) {
                    currentWave++;
                    createEnemies();
                }
            }
        });
    });
};

const updatePlayerStats = () => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "update_score.php", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log(xhr.responseText);
        }
    };

    // Log the values being sent for debugging
    console.log(`Sending data to server: user_Id=${user_Id}&username=${username}&score=${score}&roundsPlayed=${totalRoundsPlayed}&roundsWon=${totalRoundsWon}&roundsLost=${totalRoundsLost}&tokens=${sessionTokens.toFixed(2)}`);

    xhr.send(`user_Id=${user_Id}&username=${username}&score=${score}&roundsPlayed=${totalRoundsPlayed}&roundsWon=${totalRoundsWon}&roundsLost=${totalRoundsLost}&tokens=${sessionTokens.toFixed(2)}`);
};

const endGame = () => {
    gameOver = true;
    ctx.font = '50px Comic Sans MS';
    ctx.fillStyle = 'red';
    ctx.fillText('GAME OVER', CANVAS_WIDTH / 2 - 150, CANVAS_HEIGHT / 2);

    // Update rounds played, won, and lost
    totalRoundsLost += (currentWave - 1); // Calculate rounds lost in the current game
    totalRoundsWon += (currentWave - 1); // Add rounds won in this game to the total
    totalRoundsPlayed++; // Increment rounds played

    // Show "Play Again" and "End Game" buttons
    document.getElementById('play-again-button').style.display = 'block';
    document.getElementById('end-game-button').style.display = 'block';

    // Log the updated rounds and tokens
    console.log(`Game Over - Total Rounds Played: ${totalRoundsPlayed}, Total Rounds Won: ${totalRoundsWon}, Total Rounds Lost: ${totalRoundsLost}, Tokens: ${sessionTokens.toFixed(2)}`);
};

const togglePause = () => {
    paused = !paused;
    if (!paused) animate();
};

const restartGame = () => {
    gameOver = false;
    playerX = CANVAS_WIDTH / 2;
    playerY = CANVAS_HEIGHT - 60;
    score = 0;
    lives = 5;
    currentWave = 1;
    enemies.length = lasers.length = 0;
    document.getElementById('score').textContent = `Score: ${score}`;
    document.getElementById('tokens').textContent = `Tokens: ${sessionTokens.toFixed(2)}`;
    document.getElementById('lives').textContent = `Lives: ${lives}`;
    document.getElementById('current-wave').textContent = `Wave: ${currentWave}`; // Reset wave display
    createEnemies();
    animate();
    // Hide "Play Again" and "End Game" buttons
    document.getElementById('play-again-button').style.display = 'none';
    document.getElementById('end-game-button').style.display = 'none';
};

const resetGame = () => {
    cancelAnimationFrame(animationFrameId); // Cancel the previous animation frame
    gameOver = false;
    playerX = CANVAS_WIDTH / 2;
    playerY = CANVAS_HEIGHT - 60;
    score = 0;
    lives = 5;
    currentWave = 1;
    enemies.length = lasers.length = 0;
    document.getElementById('score').textContent = `Score: ${score}`;
    document.getElementById('tokens').textContent = `Tokens: ${sessionTokens.toFixed(2)}`;
    document.getElementById('lives').textContent = `Lives: ${lives}`;
    document.getElementById('current-wave').textContent = `Wave: ${currentWave}`; // Reset wave display
    createEnemies();
    animate();
    // Hide "Play Again" and "End Game" buttons
    document.getElementById('play-again-button').style.display = 'none';
    document.getElementById('end-game-button').style.display = 'none';
};

const animate = () => {
    if (paused) return;
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.drawImage(assets.background, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    lasers.forEach((laser, index) => {
        laser.update();
        laser.draw();
        if (laser.y < 0) lasers.splice(index, 1);
    });
    enemies.forEach(enemy => {
        enemy.update();
        enemy.draw(assets.enemy);
    });
    ctx.drawImage(assets.player, playerX, playerY, 50, 50);
    handleCollisions();
    movePlayer();
    gameFrame++;
    if (!gameOver) animationFrameId = requestAnimationFrame(animate);
};

const resizeCanvas = () => {
    CANVAS_WIDTH = window.innerWidth * 0.85;
    CANVAS_HEIGHT = window.innerHeight * 0.85;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    playerX = CANVAS_WIDTH / 2;
    playerY = CANVAS_HEIGHT - 60;
    document.getElementById('score').style.fontSize = `${CANVAS_HEIGHT * 0.03}px`;
    document.getElementById('tokens').style.fontSize = `${CANVAS_HEIGHT * 0.03}px`;
    document.getElementById('lives').style.fontSize = `${CANVAS_HEIGHT * 0.03}px`;
    document.getElementById('current-wave').style.fontSize = `${CANVAS_HEIGHT * 0.03}px`; // Adjust wave font size
};

window.addEventListener('load', () => {
    resizeCanvas();
    createEnemies();
    animate();
    document.getElementById('reset-button').addEventListener('click', resetGame);
    document.getElementById('pause-button').addEventListener('click', togglePause);
    document.getElementById('play-again-button').addEventListener('click', restartGame);
    document.getElementById('end-game-button').addEventListener('click', () => {
        updatePlayerStats(); // Ensure the latest stats are saved
        window.location.href = 'index.html'; // Redirect to the login page
    });

    // Initially hide "Play Again" and "End Game" buttons
    document.getElementById('play-again-button').style.display = 'none';
    document.getElementById('end-game-button').style.display = 'none';
});

window.addEventListener('resize', resizeCanvas);
