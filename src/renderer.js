var canvas = document.getElementById('mainCanvas');
var context = canvas.getContext("2d");

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
var ballColor = "#0095DD";
var ballColor2 = "#DD5500";
var color = "#FFFFFF";
var dx = 2;
var dy = -2;


function drawBall() {
    context.beginPath();
    context.arc(ball_x, ball_y, ballRadius, 0, Math.PI*2);
    context.fillStyle = color;
    context.fill();
    context.closePath();
}

function switchColor() {
    if(color == ballColor2) {
        color = ballColor;
    } else {
        color = ballColor2;
    }
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    if( ball_x-ballRadius <= 0 || ball_x+ballRadius >= canvas.width) {
        dx = -dx;
        switchColor();
    }
    if(ball_y-ballRadius <= 0 || ball_y+ballRadius >= canvas.height) {
        dy = -dy;
        switchColor();
    }
    ball_x += dx;
    ball_y += dy;

    drawBall();
}

setInterval(draw, 10);