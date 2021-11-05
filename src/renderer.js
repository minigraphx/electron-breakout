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

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

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

function switchColor() {
    if(color == ballColor2) {
        color = mainColor;
    } else {
        color = ballColor2;
    }
}

function draw() {
    context.clearRect(0, 0, mainwidth, canvas.height);
    if( ball_x-ballRadius <= 0 || ball_x+ballRadius >= mainwidth) {
        dx = -dx;
        switchColor();
    }
    if(ball_y-ballRadius <= 0) {
        dy = -dy;
        switchColor();
    }

    if( ball_y+ballRadius >= canvas.height ) { //bottom wall
        alert("GAME OVER");
        clearInterval(interval);
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

    drawBall();
    drawPaddle();
}

var interval = setInterval(draw, 10);