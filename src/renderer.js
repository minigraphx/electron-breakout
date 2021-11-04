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
var dx = 2;
var dy = -2;


function drawBall() {
    context.beginPath();
    context.arc(ball_x, ball_y, 10, 0, Math.PI*2);
    context.fillStyle = "#0095DD";
    context.fill();
    context.closePath();
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBall();
    ball_x += dx;
    ball_y += dy;
}

setInterval(draw, 10);