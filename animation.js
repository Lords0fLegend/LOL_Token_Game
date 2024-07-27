const canvas = document.getElementById('spriteCanvas');
const ctx = canvas.getContext('2d');

const sprite = new Image();
sprite.src = 'enemyblock2.png';

const SPRITE_WIDTH = 118;
const SPRITE_HEIGHT = 81;
const FRAME_COUNT = 4; // Assuming there are 9 frames in the sprite sheet
const TICKS_PER_FRAME = 12; // Number of game ticks per frame

let frameIndex = 0;
let tickCount = 0;

sprite.onload = () => {
    function update() {
        tickCount += 1;
        if (tickCount > TICKS_PER_FRAME) {
            tickCount = 0;
            frameIndex = (frameIndex + 1) % FRAME_COUNT;
        }
    }

    function draw() {
        ctx.clearRect(0, 0, SPRITE_WIDTH, SPRITE_HEIGHT);
        ctx.drawImage(
            sprite,
            frameIndex * SPRITE_WIDTH,
            0,
            SPRITE_WIDTH,
            SPRITE_HEIGHT,
            0,
            0,
            SPRITE_WIDTH,
            SPRITE_HEIGHT
        );
    }

    function loop() {
        update();
        draw();
       // requestAnimationFrame(loop);
    }

    loop();
};
