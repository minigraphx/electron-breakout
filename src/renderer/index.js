import Phaser from 'phaser';

var breakout = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize:

    function Breakout() {
        Phaser.Scene.call(this, { key: 'breakout'});

        this.bricks;
        this.paddle;
        this.ball;
    },

    preload: function() {
        game.scale.scaleMode = Phaser.ScaleModes.DEFAULT;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
    },

    create: function() {

        cursorKeys = this.input.keyboard.createCursorKeys();
        //usage: cursorKeys.up.isDown; cursorKeys.space.isdown;
        this.paddle = this.add.rectangle(400-paddleWidth/2, 540, paddleWidth, paddleHeight, mainColor);
        this.paddle.setStrokeStyle(1, mainColor);

        // bounce anywhere but bottom
        this.physics.world.setBoundsCollision(true, true, true, false);

        this.physics.world.enable(this.paddle);
        this.paddle.body.setCollideWorldBounds(true);
        this.paddle.body.setBounce(1);

//        let brick = this.add.rectangle(10, 10, brickwidth, brickHeight, mainColor);
//        brick.setStrokeStyle(2, mainColor);

        // create bricks
        this.bricks = this.physics.add.staticGroup();
        for(let column = 0; column < brickColumnCount; column++) {
            for(let row = 0; row < brickRowCount; row++) {
                let brickX = (column*(brickwidth+brickPadding))+brickOffsetLeft;
                let brickY = (row*(brickHeight+brickPadding))+brickOffsetTop;

                let brick = this.add.rectangle(brickX, brickY, brickwidth, brickHeight, mainColor);
                this.bricks.add(brick);
            }
        }

        // create ball
        this.ball = this.add.ellipse(300, 300, 10, 10);
        this.ball.setStrokeStyle(1, mainColor);
        this.physics.world.enable(this.ball);
        this.ball.body.velocity.x = 200;
        this.ball.body.velocity.y = 200;
        this.ball.body.setCollideWorldBounds(true);
        this.ball.body.setBounce(1, 1);

        this.physics.add.collider(this.ball, this.bricks, this.hitBrick, null, this);
        this.physics.add.collider(this.ball, this.paddle, this.hitPaddle, null, this);
    },

    update: function() {
        this.physics.collide(this.ball, this.paddle);

        this.physics.collide(this.ball, this.bricks, this.hit);

        this.paddle.body.setVelocity(0,0);
        if (cursorKeys.left.isDown) this.paddle.body.setVelocity(-paddleSpeed, 0);
        if (cursorKeys.right.isDown) this.paddle.body.setVelocity(paddleSpeed, 0);
    },

    hitBrick: function(ball, brick) {
        console.log('hit brick');

        brick.destroy();
    },

    hitPaddle: function(ball, paddle) {
        console.log('hit paddle');
        this.ball.body.velocity.y = -200;
    }
});

var cursorKeys;

var config = {
    type: Phaser.AUTO, // Phaser.WEBGL or Phaser.CANVAS
    width: 800,
    height: 600,
    backgroundColor: '#eee',
    scene: [ breakout ],
    physics: {
        default: 'arcade',

        arcade: {
            debug: true,
        },
    }
};

var game = new Phaser.Game(config);

export default game;

var ballRadius = 10;
var mainColor = 0x0095DD;
var ballColor2 = 0xDD5500;
var color = 0xFFFFFF;
var dx = 2;
var dy = -2;
var paddleSpeed = 300;

var noHitColor = "lightgrey";
var hitColor = "red";

var paddleHeight = 10
var paddleWidth = 75;

var brickRowCount = 3;
var brickColumnCount = 5;
var brickwidth = 75;
var brickHeight = 20;
var brickPadding = 10;
var brickOffsetTop = 30;
var brickOffsetLeft = 60;

/*
var score = 0;
var lives = 3;

var running = false;

initializeBricks();

function mouseMoveHandler(e) {
    var relativeX = e.clientX - canvas.offsetLeft;
    if(relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth/2;
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

*/

//var interval = setInterval(draw, 10);
//running = true;