// Game Canvas and Context
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game Objects
const paddle = {
    width: 10,
    height: 80,
    x: 10,
    y: canvas.height / 2 - 40,
    dy: 0,
    speed: 6
};

const computerPaddle = {
    width: 10,
    height: 80,
    x: canvas.width - 20,
    y: canvas.height / 2 - 40,
    dy: 0,
    speed: 4
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 7,
    dx: 5,
    dy: 5,
    speed: 5
};

// Game State
let playerScore = 0;
let computerScore = 0;
let gameRunning = false;
let keys = {};
let mouseY = canvas.height / 2;

// Event Listeners
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('resetBtn').addEventListener('click', resetScore);

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Game Functions
function startGame() {
    gameRunning = true;
    document.getElementById('startBtn').textContent = 'Restart';
    gameLoop();
}

function resetScore() {
    playerScore = 0;
    computerScore = 0;
    updateScore();
    gameRunning = false;
    document.getElementById('startBtn').textContent = 'Start Game';
    resetBall();
    draw();
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
    ball.dy = (Math.random() - 0.5) * ball.speed * 2;
}

function updateScore() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

function update() {
    // Update player paddle position with mouse and arrow keys
    if (keys['ArrowUp'] || keys['w']) {
        paddle.y = Math.max(0, paddle.y - paddle.speed);
    }
    if (keys['ArrowDown'] || keys['s']) {
        paddle.y = Math.min(canvas.height - paddle.height, paddle.y + paddle.speed);
    }
    
    // Use mouse position for player paddle
    const targetY = mouseY - paddle.height / 2;
    paddle.y = Math.max(0, Math.min(canvas.height - paddle.height, targetY));

    // Update computer paddle position (AI)
    const computerCenter = computerPaddle.y + computerPaddle.height / 2;
    if (computerCenter < ball.y - 35) {
        computerPaddle.y = Math.min(canvas.height - computerPaddle.height, computerPaddle.y + computerPaddle.speed);
    } else if (computerCenter > ball.y + 35) {
        computerPaddle.y = Math.max(0, computerPaddle.y - computerPaddle.speed);
    }

    // Update ball position
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom walls
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.radius, Math.min(canvas.height - ball.radius, ball.y));
    }

    // Ball collision with paddles
    // Player paddle collision
    if (
        ball.x - ball.radius < paddle.x + paddle.width &&
        ball.y > paddle.y &&
        ball.y < paddle.y + paddle.height
    ) {
        ball.dx = -ball.dx;
        ball.x = paddle.x + paddle.width + ball.radius;
        
        // Add spin based on where ball hits paddle
        const collidePoint = ball.y - (paddle.y + paddle.height / 2);
        ball.dy = (collidePoint / (paddle.height / 2)) * ball.speed;
        ball.dx = Math.abs(ball.dx);
    }

    // Computer paddle collision
    if (
        ball.x + ball.radius > computerPaddle.x &&
        ball.y > computerPaddle.y &&
        ball.y < computerPaddle.y + computerPaddle.height
    ) {
        ball.dx = -ball.dx;
        ball.x = computerPaddle.x - ball.radius;
        
        // Add spin based on where ball hits paddle
        const collidePoint = ball.y - (computerPaddle.y + computerPaddle.height / 2);
        ball.dy = (collidePoint / (computerPaddle.height / 2)) * ball.speed;
        ball.dx = -Math.abs(ball.dx);
    }

    // Ball out of bounds (score points)
    if (ball.x - ball.radius < 0) {
        computerScore++;
        updateScore();
        resetBall();
    }
    if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        updateScore();
        resetBall();
    }
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    ctx.strokeStyle = '#fff';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw paddles
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

    ctx.fillStyle = '#ff0000';
    ctx.fillRect(computerPaddle.x, computerPaddle.y, computerPaddle.width, computerPaddle.height);

    // Draw ball
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
}

function gameLoop() {
    if (gameRunning) {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }
}

// Initial draw
draw();
