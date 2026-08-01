const canvas = document.getElementById("gameArea");
const ctx = canvas.getContext("2d");

let x = 100;
let y = 100;

const BASE_PLAYER_RADIUS = 40;
let radius = BASE_PLAYER_RADIUS;
let speed = 5;
let scale = 1;

const BASE_WIDTH = 800;
const BASE_HEIGHT = 600;
const ASPECT_RATIO = BASE_WIDTH / BASE_HEIGHT;

function resizeCanvas() {
    const availableWidth = window.innerWidth - 40;
    const availableHeight = window.innerHeight - 160;

    let newWidth = Math.min(availableWidth, BASE_WIDTH);
    let newHeight = newWidth / ASPECT_RATIO;

    if (newHeight > availableHeight) {
        newHeight = Math.max(availableHeight, 200);
        newWidth = newHeight * ASPECT_RATIO;
    }

    canvas.width = newWidth;
    canvas.height = newHeight;

    scale = newWidth / BASE_WIDTH;
    radius = BASE_PLAYER_RADIUS * scale;

    boundryCheck();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let upPressed = false;
let downPressed = false;
let leftPressed = false;
let rightPressed = false;

let gameState = "start";

let obstacles = [];
const NUM_OBSTACLES = 3;

let score = 0;

let level = 1;
const MAX_LEVEL = 10;

function scoreTarget(lvl) {
    return 10 + 5 * (lvl - 1);
}

function createObstacle() {
    const r = (15 + Math.random() * 25) * scale;
    let ox, oy;

    const edge = Math.floor(Math.random() * 4);
    switch (edge) {
        case 0: ox = Math.random() * canvas.width; oy = -r; break;
        case 1: ox = canvas.width + r; oy = Math.random() * canvas.height; break;
        case 2: ox = Math.random() * canvas.width; oy = canvas.height + r; break;
        case 3: ox = -r; oy = Math.random() * canvas.height; break;
    }

    const targetX = Math.random() * canvas.width;
    const targetY = Math.random() * canvas.height;
    const angle = Math.atan2(targetY - oy, targetX - ox);
    const speedMag = 3 + Math.random() * 4;

    return {
        x: ox,
        y: oy,
        radius: r,
        speedX: Math.cos(angle) * speedMag,
        speedY: Math.sin(angle) * speedMag
    };
}

function createObstacles() {
    obstacles = [];
    for (let i = 0; i < NUM_OBSTACLES; i++) {
        obstacles.push(createObstacle());
    }
}

function startLevel() {
    x = 100;
    y = 100;
    score = 0;
    createObstacles();
    gameState = "playing";
}

function resetGame() {
    level = 1;
    startLevel();
}

function drawGame() {
    requestAnimationFrame(drawGame);
    clearScreen();

    if (gameState === "start") {
        drawStartScreen();
        return;
    }

    if (gameState === "playing") {
        inputs();
        boundryCheck();
        moveObstacles();
        drawObstacles();
        drawSphere();
        drawScore();
        checkCollisions();
        checkLevelComplete();
        return;
    }

    drawObstacles();
    drawSphere();

    if (gameState === "gameover") {
        drawGameOverScreen();
        return;
    }

    if (gameState === "levelwin") {
        drawLevelWinScreen();
        return;
    }

    if (gameState === "finalwin") {
        drawFinalWinScreen();
        return;
    }
}

function boundryCheck(){
    if (y < radius){
        y = radius;
    }
    if (y > canvas.height - radius){
        y = canvas.height - radius;
    }
    if (x < radius) {
        x = radius;
    }
    if (x > canvas.width - radius){
        x = canvas.width - radius;
    }
}

function inputs(){
    if(upPressed){
        y = y - speed;
    }
    if(downPressed) {
        y = y + speed;
    }
    if(leftPressed){
        x = x - speed;
    }
    if(rightPressed){
        x = x + speed;
    }
}

function moveObstacles() {
    for (let i = 0; i < obstacles.length; i++) {
        const o = obstacles[i];
        o.x += o.speedX;
        o.y += o.speedY;

        const offScreen =
            o.x < -o.radius ||
            o.x > canvas.width + o.radius ||
            o.y < -o.radius ||
            o.y > canvas.height + o.radius;

        if (offScreen) {
            score++;
            obstacles[i] = createObstacle();
        }
    }
}

function drawObstacles() {
    ctx.fillStyle = "gray";
    for (const o of obstacles) {
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

function checkCollisions() {
    for (const o of obstacles) {
        const dx = x - o.x;
        const dy = y - o.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < radius + o.radius) {
            gameState = "gameover";
            break;
        }
    }
}

function checkLevelComplete() {
    if (score >= scoreTarget(level)) {
        gameState = (level >= MAX_LEVEL) ? "finalwin" : "levelwin";
    }
}

function drawSphere() {
    ctx.fillStyle ="Blue";
    ctx.beginPath();
    ctx.arc(x,y, radius,0, Math.PI * 2);
    ctx.fill();
}

function clearScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawScore() {
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.font = "20px sans-serif";
    ctx.fillText("Level: " + level, 15, 30);
    ctx.fillText("Score: " + score + " / " + scoreTarget(level), 15, 55);
}

function drawStartScreen() {
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "40px sans-serif";
    ctx.fillText("Astro Turbulence", canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = "20px sans-serif";
    ctx.fillText("Click to start", canvas.width / 2, canvas.height / 2 + 20);
}

function drawGameOverScreen() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "40px sans-serif";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = "20px sans-serif";
    ctx.fillText("Level: " + level, canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText("Score: " + score + " / " + scoreTarget(level), canvas.width / 2, canvas.height / 2 + 50);
    ctx.fillText("Click to retry Level " + level, canvas.width / 2, canvas.height / 2 + 80);
}

function drawLevelWinScreen() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "40px sans-serif";
    ctx.fillText("Level " + level + " Complete!", canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = "20px sans-serif";
    ctx.fillText("Click to continue to Level " + (level + 1), canvas.width / 2, canvas.height / 2 + 20);
}

function drawFinalWinScreen() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "40px sans-serif";
    ctx.fillText("The End", canvas.width / 2, canvas.height / 2 - 60);

    ctx.font = "20px sans-serif";
    ctx.fillText("You cleared all " + MAX_LEVEL + " levels!", canvas.width / 2, canvas.height / 2 - 20);

    ctx.font = "16px sans-serif";
    ctx.fillText("Astro Turbulence", canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText("Thanks for playing!", canvas.width / 2, canvas.height / 2 + 45);

    ctx.font = "20px sans-serif";
    ctx.fillText("Click to play again", canvas.width / 2, canvas.height / 2 + 85);
}

canvas.addEventListener('click', function() {
    if (gameState === "start" || gameState === "finalwin") {
        resetGame();
    } else if (gameState === "gameover") {
        startLevel();
    } else if (gameState === "levelwin") {
        level++;
        startLevel();
    }
});

document.body.addEventListener('keydown', keyDown);
document.body.addEventListener('keyup', keyUp);

function keyDown(event) {

    if (event.keyCode == 87){
        upPressed = true;
    }

    if (event.keyCode == 83){
        downPressed = true;
    }

    if (event.keyCode == 65){
        leftPressed = true;
    }

    if (event.keyCode == 68){
        rightPressed = true;
    }    
}

function keyUp(event) {

    if (event.keyCode == 87){
        upPressed = false;
    }

    if (event.keyCode == 83){
        downPressed = false;
    }

    if (event.keyCode == 65){
        leftPressed = false;
    }

    if (event.keyCode == 68){
        rightPressed = false;
    }
}    

drawGame();