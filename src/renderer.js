var canvas = document.getElementById('mainCanvas');
var context = canvas.getContext("2d");

mainwidth = canvas.width;
/* canvas painting tests
context.beginPath();
context.rect(20, 40, 20, 20);
context.fillStyle = "#FF0000";
context.fill();
context.closePath();

context.beginPath();
context.arc(240, 160, 20, 0, Math.PI*2, false);
context.fillStyle = "green";
context.fill();
context.closePath();

context.beginPath();
context.rect(160, 10, 100, 40);
context.strokeStyle = "rgba(0, 0, 255, 0.5)";
context.stroke();
context.closePath();
*/

var ball_x = canvas.width/2;
var ball_y = canvas.height-30;
var ballRadius = 10;
var mainColor = "#0095DD";
var ballColor2 = "#DD5500";
var color = "#FFFFFF";
var dx = 2;
var dy = -2;
var paddleSpeed = 4;

var noHitColor = "lightgrey";
var hitColor = "red";

var paddleHeight = 10
var paddleWidth = 75;
var paddleX = (canvas.width-paddleWidth) / 2;
var paddleY = canvas.height / 20 * 19; // postion is sleightly over the bottom
var paddleMoveRight = false;
var paddleMoveLeft = false;

var brickRowCount = 3;
var brickColumnCount = 5;
var brickwidth = 75;
var brickHeight = 20;
var brickPadding = 10;
var brickOffsetTop = 30;
var brickOffsetLeft = 30;

var bricks = [];

var score = 0;
var lives = 3;

var running = false;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

initializeBricks();

function mouseMoveHandler(e) {
    var relativeX = e.clientX - canvas.offsetLeft;
    if(relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth/2;
    }
}

function keyDownHandler(e) {
    if(e.key == "Right" || e.key == "ArrowRight") {
        paddleMoveRight = true;
        paddleMoveLeft = false;
    }
    else if (e.key == "Left" || e.key == "ArrowLeft") {
        paddleMoveLeft = true;
        paddleMoveRight = false;
    }
}

function keyUpHandler(e) {
    if(e.key == "Right" || e.key == "ArrowRight") {
        paddleMoveRight = false;
    }
    else if (e.key == "Left" || e.key == "ArrowLeft") {
        paddleMoveLeft = false;
    }
    if(e.keyCode == 32 && !running) {
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
    for(var brickColumn = 0; brickColumn <= brickColumnCount; brickColumn++) {
        bricks[brickColumn] = [];
        for(var brickRow = 0; brickRow <= brickRowCount; brickRow++) {
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
    for( var column = 0; column < brickColumnCount; column++) {
        for(var row = 0; row < brickRowCount; row++) {
            if(bricks[column][row].status == 1) {
                var brickX = (column*(brickwidth+brickPadding))+brickOffsetLeft;
                var brickY = (row*(brickHeight+brickPadding))+brickOffsetTop;
                bricks[column][row].x = brickX;
                bricks[column][row].y = brickY;
                context.beginPath();
                context.rect(brickX, brickY, brickwidth, brickHeight);
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

    markHit = noHitColor;
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
    document.getElementById('hitbar').style.backgroundColor = markHit;

    collisionDetection();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();
}

function switchColor() {
    if(color == ballColor2) {
        color = mainColor;
    } else {
        color = ballColor2;
    }
}

function collisionDetection() {
    for(var c=0; c < brickColumnCount; c++) {
        for(var r=0; r<brickRowCount; r++) {
            var b = bricks[c][r];
            if(b.status == 1) {
                if(ball_x > b.x && ball_x < b.x+brickwidth && ball_y > b.y && ball_y < b.y+brickHeight) {
                    dy = -dy;
                    b.status = 0;
                    score++;
                    if(score == brickRowCount*brickColumnCount) {
                        alert("You've won. Press Space to play again.");
                        clearInterval(interval);
                        running = false;
                    }
                }
            }
        }
    }
}


var interval = setInterval(draw, 10);
running = true;