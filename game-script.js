// Preload images for better performance
const enemyImages = {
    boss: 'boss.png',
    enemy1: 'enemy1.png',
    enemy2: 'enemy2.png',
    enemy3: 'enemy3.png'
};

function preloadImages(imageDict) {
    for (let key in imageDict) {
        const img = new Image();
        img.src = imageDict[key];
        imageDict[key] = img;
    }
}

preloadImages(enemyImages);

// Define all constants and variables at the top
const FPS = 60;
const SHIP_SIZE = 30;
const SHIP_THRUST = 0.1;
const SHIP_TURN_SPD = 360;  // Turn speed in degrees per second
const FRICTION = 0.99;  // Friction coefficient (0 < FRICTION < 1)
const LASER_MAX = 10;  // Maximum number of lasers on screen
const LASER_SPEED = 5;  // Speed of the laser
const LASER_LIFE = 60;  // Duration in frames that the laser exists

let canv = document.getElementById("gameCanvas");
let ctx = canv.getContext("2d");

let ship, lasers = [], isPaused = false, thrusting = false, score = 0;
let enemies = [];

// Enemy constructor with preloaded images
function Enemy(type, canvas) {
    this.type = type;
    this.canvas = canvas;
    this.img = enemyImages[type];

    this.width = 50;
    this.height = 50;

    // Random initial position, ensuring no overlap with player
    do {
        this.x = Math.random() * (canvas.width - this.width);
        this.y = Math.random() * (canvas.height - this.height);
    } while (
        this.x < ship.x + ship.r + 1 && this.x + this.width > ship.x - ship.r - 1 &&
        this.y < ship.y + ship.r + 1 && this.y + this.height > ship.y - ship.r - 1
    );

    // Random initial velocity for floating effect
    this.vx = (Math.random() * 2 - 1) * 2; // Velocity between -2 and 2
    this.vy = (Math.random() * 2 - 1) * 2; // Velocity between -2 and 2
}

Enemy.prototype.draw = function(ctx) {
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
};

Enemy.prototype.updatePosition = function() {
    // Update position based on velocity
    this.x += this.vx;
    this.y += this.vy;

    // Handle edge of screen: wrapping around to the opposite side
    if (this.x < 0 - this.width) {
        this.x = this.canvas.width;
    } else if (this.x > this.canvas.width) {
        this.x = 0 - this.width;
    }

    if (this.y < 0 - this.height) {
        this.y = this.canvas.height;
    } else if (this.y > this.canvas.height) {
        this.y = 0 - this.height;
    }
};

Enemy.prototype.respawn = function() {
    let attempts = 100;  // Maximum attempts to find a collision-free spot
    do {
        this.x = Math.random() * (this.canvas.width - this.width);
        this.y = Math.random() * (this.canvas.height - this.height);
    } while (
        this.checkCollisionWithPlayer(ship) && --attempts > 0
    );

    // Reset velocity when respawning
    this.vx = (Math.random() * 2 - 1) * 2; // Velocity between -2 and 2
    this.vy = (Math.random() * 2 - 1) * 2; // Velocity between -2 and 2
};

Enemy.prototype.checkCollision = function(lasers) {
    for (let i = lasers.length - 1; i >= 0; i--) {
        const laser = lasers[i];
        if (
            laser.x < this.x + this.width &&
            laser.x + 2 > this.x &&  // assuming laser is 2px wide
            laser.y < this.y + this.height &&
            laser.y + 2 > this.y    // assuming laser is 2px tall
        ) {
            // Collision detected, remove the laser and return true
            lasers.splice(i, 1);
            score += 50; // Increment score by 50 when an enemy is hit
            return true;
        }
    }
    return false;
};

Enemy.prototype.checkCollisionWithPlayer = function(ship) {
    // Check if enemy overlaps with the player ship
    return (
        this.x < ship.x + ship.r &&
        this.x + this.width > ship.x - ship.r &&
        this.y < ship.y + ship.r &&
        this.y + this.height > ship.y - ship.r
    );
};

function startGame() {
    document.getElementById("pauseBtn").addEventListener("click", togglePause);
    document.getElementById("resumeBtn").addEventListener("click", togglePause);
    document.getElementById("resetBtn").addEventListener("click", resetGame);

    document.addEventListener("keydown", keyDown);
    document.addEventListener("keyup", keyUp);

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Initialize canvas size

    newGame();
    requestAnimationFrame(update);
}

let lives = 3;  // Number of lives the player starts with

function newGame() {
    ship = newShip(); // Reinitialize the ship
    lasers = []; // Reset lasers
    enemies = [ // Initialize enemies
        new Enemy('enemy1', canv),
        new Enemy('enemy2', canv),
        new Enemy('enemy3', canv),
        new Enemy('boss', canv)
    ];
    lives = 3;  // Reset lives when starting a new game
    score = 0; // Reset score when starting a new game
}

function update() {
    if (isPaused) return;
    drawBackground();
    drawLives(); // Draw lives on the screen
    drawScore(); // Draw score on the screen
    moveShip();
    updateLasers();

    // Update and draw enemies
    enemies.forEach(function(enemy) {
        enemy.updatePosition(); // Update enemy position
        if (enemy.checkCollision(lasers)) {
            enemy.respawn();  // Respawn the enemy on collision with a laser
        }

        if (enemy.checkCollisionWithPlayer(ship)) {
            handlePlayerEnemyCollision();
        }

        enemy.draw(ctx);
    });

    drawShip(ship.x, ship.y, ship.a);
    requestAnimationFrame(update);
}

function handlePlayerEnemyCollision() {
    lives--; // Decrement lives
    if (lives <= 0) {
        alert("Game Over! You've lost all your lives.");
        resetGame(); // Call resetGame() to start over
    } else {
        resetShip(); // Reset the ship's position and thrust
    }
}

function resetGame() {
    newGame(); // Start a new game
    if (isPaused) togglePause();
}

function resetShip() {
    ship.x = canv.width / 2;
    ship.y = canv.height / 2;
    ship.a = 90 / 180 * Math.PI; // Reset the angle
    ship.rot = 0; // Stop any rotation
    ship.thrust.x = 0;
    ship.thrust.y = 0;
}

function newShip() {
    return {
        x: canv.width / 2,
        y: canv.height / 2,
        a: 155 / 180 * Math.PI,  // Angle of rotation (in radians)
        r: SHIP_SIZE / 2,
        rot: 0,  // Rotation speed
        thrust: {
            x: 0,
            y: 0
        }
    };
}

function drawLives() {
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Lives: " + lives, 20, 30); // Display lives in the top-left corner
}

function drawScore() {
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, canv.width - 100, 30); // Display score in the top-right corner
}

function resizeCanvas() {
    canv.width = window.innerWidth;
    canv.height = window.innerHeight;
    drawBackground();
}

function drawBackground() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canv.width, canv.height);
}

function togglePause() {
    isPaused = !isPaused;
    document.getElementById("pauseBtn").disabled = isPaused;
    document.getElementById("resumeBtn").disabled = !isPaused;

    if (!isPaused) {
        requestAnimationFrame(update);
    }
}

function shootLaser() {
    if (lasers.length < LASER_MAX) {
        lasers.push({
            x: ship.x,
            y: ship.y,
            angle: ship.a, // Store the angle at which the laser is shot
            life: LASER_LIFE
        });
    }
}

function updateLasers() {
    for (let i = lasers.length - 1; i >= 0; i--) {
        lasers[i].life--;

        if (lasers[i].life <= 0) {
            lasers.splice(i, 1);
            continue;
        }

        // Set the laser length to a fixed smaller value, e.g., 50 pixels
        const laserLength = 20 ; // You can adjust this value as needed

        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.beginPath();

        // Starting point of the laser
        let startX = lasers[i].x;
        let startY = lasers[i].y;

        // Ending point of the laser (fixed length)
        let endX = startX + Math.cos(lasers[i].angle) * laserLength;
        let endY = startY + Math.sin(lasers[i].angle) * laserLength;

        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Update the laser's position
        lasers[i].x += Math.cos(lasers[i].angle) * LASER_SPEED;
        lasers[i].y += Math.sin(lasers[i].angle) * LASER_SPEED;

        // Handle edge of screen for lasers
        if (lasers[i].x < 0) lasers[i].x = canv.width;
        else if (lasers[i].x > canv.width) lasers[i].x = 0;
        if (lasers[i].y < 0) lasers[i].y = canv.height;
        else if (lasers[i].y > canv.height) lasers[i].y = 0;
    }
}

function drawShip(x, y, a, colour = "white") {
    ctx.save();
    ctx.translate(x, y); // Move the rotation point to the ship's center
    ctx.rotate(a); // Rotate the ship based on its current angle

    // Draw the square (ship)
    ctx.fillStyle = colour;
    ctx.fillRect(-ship.r, -ship.r, SHIP_SIZE, SHIP_SIZE);

    // Draw the thrust if the ship is thrusting 
    if (thrusting) {
        ctx.beginPath();
        ctx.moveTo(-ship.r, -SHIP_SIZE / 4); // Start at the rear left
        ctx.lineTo(-ship.r - SHIP_SIZE / 2, 0); // Go to the center rear, extending out
        ctx.lineTo(-ship.r, SHIP_SIZE / 4); // Go to the rear right
        ctx.closePath(); // Closes the path back to the starting point to form a triangle

        // Set the thrust color and draw the thrust
        ctx.fillStyle = "red";
        ctx.fill();

        // Yellow border
        ctx.strokeStyle = "yellow";
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    ctx.restore();
}

function moveShip() {
    ship.a += ship.rot * Math.PI / 180;

    if (thrusting) {
        ship.thrust.x += SHIP_THRUST * Math.cos(ship.a);
        ship.thrust.y += SHIP_THRUST * Math.sin(ship.a);
    }

    ship.thrust.x *= FRICTION;
    ship.thrust.y *= FRICTION;

    ship.x += ship.thrust.x;
    ship.y += ship.thrust.y;

    // Handle edge of screen
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
}

function keyDown(ev) {
    switch (ev.keyCode) {
        case 32: // Spacebar
            shootLaser();
            break;
        case 37: // Left arrow
            ship.rot = -SHIP_TURN_SPD / FPS; // Rotate counterclockwise
            break;
        case 38: // Up arrow
            thrusting = true; // Activate thrust effect
            break;
        case 39: // Right arrow
            ship.rot = SHIP_TURN_SPD / FPS; // Rotate clockwise
            break;
    }
}

function keyUp(ev) {
    switch (ev.keyCode) {
        case 37:
        case 39:
            ship.rot = 0; // Stop rotation
            break;
        case 38:
            thrusting = false; // Deactivate thrust effect
            break;
    }
}

startGame();

