const gameArea = document.getElementById("game-area");
const leftPaddle = document.getElementById("left-paddle");
const rightPaddle = document.getElementById("right-paddle");
const ball = document.getElementById("ball");
const leftScoreEl = document.getElementById("left-score");
const rightScoreEl = document.getElementById("right-score");

const PADDLE_WIDTH = 14;
const PADDLE_HEIGHT = 90;
const BALL_SIZE = 18;
const PLAYER_SPEED = 7;
const AI_SPEED = 5.2;

let leftY = gameArea.clientHeight / 2 - PADDLE_HEIGHT / 2;
let rightY = gameArea.clientHeight / 2 - PADDLE_HEIGHT / 2;
let ballX = gameArea.clientWidth / 2;
let ballY = gameArea.clientHeight / 2;
let ballSpeedX = 4.5;
let ballSpeedY = 3;
let leftScore = 0;
let rightScore = 0;
let arrowUp = false;
let arrowDown = false;
let lastTimestamp = 0;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function setPaddlePosition(paddle, y) {
  paddle.style.top = `${y}px`;
}

function updateScore() {
  leftScoreEl.textContent = leftScore;
  rightScoreEl.textContent = rightScore;
}

function resetBall() {
  ballX = gameArea.clientWidth / 2 - BALL_SIZE / 2;
  ballY = gameArea.clientHeight / 2 - BALL_SIZE / 2;

  const direction = Math.random() < 0.5 ? -1 : 1;
  ballSpeedX = direction * (4.5 + Math.random() * 1.4);
  ballSpeedY = (Math.random() * 3.5 + 2.5) * (Math.random() < 0.5 ? -1 : 1);
}

function scorePoint(side) {
  if (side === "left") {
    leftScore += 1;
  } else {
    rightScore += 1;
  }

  updateScore();
  resetBall();
}

function handleWallCollision() {
  if (ballY <= 0) {
    ballY = 0;
    ballSpeedY *= -1;
  }

  if (ballY + BALL_SIZE >= gameArea.clientHeight) {
    ballY = gameArea.clientHeight - BALL_SIZE;
    ballSpeedY *= -1;
  }
}

function checkPaddleCollision() {
  const leftX = 20;
  const rightX = gameArea.clientWidth - 20 - PADDLE_WIDTH;

  const leftTop = leftY;
  const leftBottom = leftY + PADDLE_HEIGHT;
  const rightTop = rightY;
  const rightBottom = rightY + PADDLE_HEIGHT;

  const ballLeft = ballX;
  const ballRight = ballX + BALL_SIZE;
  const ballTop = ballY;
  const ballBottom = ballY + BALL_SIZE;

  if (
    ballRight >= leftX &&
    ballLeft <= leftX + PADDLE_WIDTH &&
    ballBottom >= leftTop &&
    ballTop <= leftBottom &&
    ballSpeedX < 0
  ) {
    const hitPosition = (ballY + BALL_SIZE / 2 - (leftY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
    ballX = leftX + PADDLE_WIDTH;
    ballSpeedX *= -1.08;
    ballSpeedY = hitPosition * 5.5;
  }

  if (
    ballLeft <= rightX + PADDLE_WIDTH &&
    ballRight >= rightX &&
    ballBottom >= rightTop &&
    ballTop <= rightBottom &&
    ballSpeedX > 0
  ) {
    const hitPosition = (ballY + BALL_SIZE / 2 - (rightY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
    ballX = rightX - BALL_SIZE;
    ballSpeedX *= -1.08;
    ballSpeedY = hitPosition * 5.5;
  }
}

function updatePlayer() {
  if (arrowUp) {
    leftY -= PLAYER_SPEED;
  }

  if (arrowDown) {
    leftY += PLAYER_SPEED;
  }

  leftY = clamp(leftY, 0, gameArea.clientHeight - PADDLE_HEIGHT);
  setPaddlePosition(leftPaddle, leftY);
}

function updateComputer() {
  const paddleCenter = rightY + PADDLE_HEIGHT / 2;
  const ballCenter = ballY + BALL_SIZE / 2;

  if (ballCenter < paddleCenter) {
    rightY -= AI_SPEED;
  } else if (ballCenter > paddleCenter) {
    rightY += AI_SPEED;
  }

  rightY = clamp(rightY, 0, gameArea.clientHeight - PADDLE_HEIGHT);
  setPaddlePosition(rightPaddle, rightY);
}

function updateBall() {
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  handleWallCollision();
  checkPaddleCollision();

  if (ballX + BALL_SIZE <= 0) {
    scorePoint("right");
  }

  if (ballX >= gameArea.clientWidth) {
    scorePoint("left");
  }

  ball.style.left = `${ballX}px`;
  ball.style.top = `${ballY}px`;
}

function gameLoop(timestamp) {
  const delta = (timestamp - lastTimestamp) || 16.67;
  lastTimestamp = timestamp;
  const scale = delta / 16.67;

  updatePlayer();
  updateComputer();

  ballX += ballSpeedX * scale;
  ballY += ballSpeedY * scale;

  handleWallCollision();
  checkPaddleCollision();

  if (ballX + BALL_SIZE <= 0) {
    scorePoint("right");
  }

  if (ballX >= gameArea.clientWidth) {
    scorePoint("left");
  }

  ball.style.left = `${ballX}px`;
  ball.style.top = `${ballY}px`;

  requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp") {
    arrowUp = true;
  }

  if (event.key === "ArrowDown") {
    arrowDown = true;
  }
});

document.addEventListener("keyup", (event) => {
  if (event.key === "ArrowUp") {
    arrowUp = false;
  }

  if (event.key === "ArrowDown") {
    arrowDown = false;
  }
});

gameArea.addEventListener("mousemove", (event) => {
  const rect = gameArea.getBoundingClientRect();
  const mouseY = event.clientY - rect.top;
  leftY = clamp(mouseY - PADDLE_HEIGHT / 2, 0, gameArea.clientHeight - PADDLE_HEIGHT);
  setPaddlePosition(leftPaddle, leftY);
});

updateScore();
setPaddlePosition(leftPaddle, leftY);
setPaddlePosition(rightPaddle, rightY);
resetBall();
requestAnimationFrame(gameLoop);

window.addEventListener("resize", () => {
  if (leftY > gameArea.clientHeight - PADDLE_HEIGHT) {
    leftY = gameArea.clientHeight - PADDLE_HEIGHT;
  }

  if (rightY > gameArea.clientHeight - PADDLE_HEIGHT) {
    rightY = gameArea.clientHeight - PADDLE_HEIGHT;
  }

  setPaddlePosition(leftPaddle, leftY);
  setPaddlePosition(rightPaddle, rightY);
});

window.addEventListener("blur", () => {
  arrowUp = false;
  arrowDown = false;
});

setTimeout(() => {
  ball.style.left = `${ballX}px`;
  ball.style.top = `${ballY}px`;
}, 0);

