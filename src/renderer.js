const canvas = document.getElementById('mainCanvas');
const context = canvas.getContext("2d");

mainwidth = canvas.width;

let ball_x = canvas.width / 2;
let ball_y = canvas.height - 30;
let ballRadius = 10;
let mainColor = "#0095DD";
let ballColor2 = "#DD5500";
let color = "#FFFFFF";
let dx = 2;
let dy = -2;
let paddleSpeed = 4;

let noHitColor = "lightgrey";
let hitColor = "red";
let paddleHeight = 10
let paddleWidth = 75;
let paddleX = (canvas.width-paddleWidth) / 2;
let paddleY = canvas.height / 20 * 19; // position is slightly over the bottom
let paddleMoveRight = false;
let paddleMoveLeft = false;
let brickRowCount = 3;
let brickColumnCount = 5;
let brickWidth = 75;
let brickHeight = 20;
let brickPadding = 10;
let brickOffsetTop = 30;
let brickOffsetLeft = 3;
let bricks = [];
let score = 0;
let lives = 3;

let running = false;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

initializeBricks();

function mouseMoveHandler(e) {
    let relativeX = e.clientX - canvas.offsetLeft;
    if(relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth/2;
    }
}

function keyDownHandler(e) {
    if(e.key === "Right" || e.key === "ArrowRight") {
        paddleMoveRight = true;
        paddleMoveLeft = false;
    }
    else if (e.key === "Left" || e.key === "ArrowLeft") {
        paddleMoveLeft = true;
        paddleMoveRight = false;
    }
}

let interval;

function keyUpHandler(e) {
    if(e.key === "Right" || e.key === "ArrowRight") {
        paddleMoveRight = false;
    }
    else if (e.key === "Left" || e.key === "ArrowLeft") {
        paddleMoveLeft = false;
    }
    if(e.keyCode === 32 && !running) {
        initializeBricks();
        initGame();
        interval = setInterval(draw, 10);
        running = true;
    }
}

function initGame() {
    ball_x = canvas.width/2;
    ball_y = canvas.height-30;
    dx = 2;
    dy = -2;
    paddleX = (canvas.width-paddleWidth)/2;
    lives = 3;
    score = 0;
}

function initializeBricks() {
    for(let brickColumn = 0; brickColumn <= brickColumnCount; brickColumn++) {
        bricks[brickColumn] = [];
        for(let brickRow = 0; brickRow <= brickRowCount; brickRow++) {
            bricks[brickColumn][brickRow] = { x: 0, y: 0, status: 1};
        }
    }
}

function drawBall() {
    context.beginPath();
    context.arc(ball_x, ball_y, ballRadius, 0, Math.PI*2);
    context.fillStyle = color;
    context.fill();
    context.closePath();
}

function drawPaddle() {
    context.beginPath();
    context.rect(paddleX, paddleY-paddleHeight, paddleWidth, paddleHeight);
    context.fillStyle = mainColor;
    context.fill();
    context.closePath();
}

function drawBricks() {
    for(let column = 0; column < brickColumnCount; column++) {
        for(let row = 0; row < brickRowCount; row++) {
            if(bricks[column][row].status === 1) {
                let brickX = (column * (brickWidth + brickPadding)) + brickOffsetLeft;
                let brickY = (row * (brickHeight + brickPadding)) + brickOffsetTop;
                bricks[column][row].x = brickX;
                bricks[column][row].y = brickY;
                context.beginPath();
                context.rect(brickX, brickY, brickWidth, brickHeight);
                context.fillStyle = mainColor;
                context.fill();
                context.closePath();    
            }
        }
    }
}

function drawScore() {
    context.font = "16px Arial";
    context.fillStyle = mainColor;
    context.fillText("Score: "+score, 8, 20);
}

function drawLives() {
    context.font = "16px Arial";
    context.fillStyle = mainColor;
    context.fillText("Lives: "+lives, canvas.width-65, 20);
}

function draw() {
    context.clearRect(0, 0, mainwidth, canvas.height);

    drawBricks();

    if( ball_x-ballRadius <= 0 || ball_x+ballRadius >= mainwidth) {
        dx = -dx;
        switchColor();
    }
    if(ball_y-ballRadius <= 0) {
        dy = -dy;
        switchColor();
    }

    if( ball_y+ballRadius >= canvas.height ) { //bottom wall
        lives--;
        if(!lives) {
            alert("GAME OVER. Press Space to Start again.");
            clearInterval(interval);
            running = false;
        } else {
            ball_x = canvas.width/2;
            ball_y = canvas.height-30;
            dx = 2;
            dy = -2;
            paddleX = (canvas.width-paddleWidth)/2;
        }
    }

    let markHit = noHitColor;
    //bounce from bottom only if hit by paddle
    if(ball_x >= paddleX && ball_x <= paddleX+paddleWidth) {
        markHit = hitColor;
        if(ball_y+ballRadius >= paddleY) {  // if below paddle, turn
            dy = -dy;
        }
    }

    ball_x += dx;
    ball_y += dy;

    if(paddleMoveRight) {
        paddleX += paddleSpeed;
        if(paddleX+paddleWidth > mainwidth) {
            paddleX = mainwidth - paddleWidth;
        }
    } else if(paddleMoveLeft) {
        paddleX -= paddleSpeed;
        if (paddleX < 0) {
            paddleX = 0;
        }
    }
    document.getElementById('paddle-x').innerHTML = paddleX.toString();
    document.getElementById('ball-x').innerHTML = ball_x.toString();
    document.getElementById('ball-y').innerHTML = ball_y.toString();
    document.getElementById('hitBar').style.backgroundColor = markHit;

    collisionDetection();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();
}

function switchColor() {
    if(color === ballColor2) {
        color = mainColor;
    } else {
        color = ballColor2;
    }
}

function collisionDetection() {
    for(let c=0; c < brickColumnCount; c++) {
        for(let r=0; r<brickRowCount; r++) {
            let b = bricks[c][r];
            if(b.status === 1) {
                if(ball_x > b.x && ball_x < b.x+brickWidth && ball_y > b.y && ball_y < b.y+brickHeight) {
                    dy = -dy;
                    b.status = 0;
                    score++;
                    if(score === brickRowCount*brickColumnCount) {
                        alert("You've won. Press Space to play again.");
                        clearInterval(interval);
                        running = false;
                    }
                }
            }
        }
    }
}


interval = setInterval(draw, 10);
running = true;