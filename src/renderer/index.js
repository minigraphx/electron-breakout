import Phaser from 'phaser';

var breakout = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize:
    function Breakout() {
        Phaser.Scene.call(this, { key: 'breakout'});

        this.bricks;
        this.paddle;
        this.ball;

        this.score = 0;
        this.lives = 3;

        this.scoreHUD;
        this.livesHUD;
    },

    preload: function() {
        game.scale.scaleMode = Phaser.ScaleModes.DEFAULT;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
    },

    create: function() {
        cursorKeys = this.input.keyboard.createCursorKeys();

        this.paddle = this.add.rectangle(config.width/2-paddleWidth/2, config.height-config.height/10, paddleWidth, paddleHeight, mainColor);
//        this.paddle.setStrokeStyle(1, mainColor);

        // bounce anywhere but bottom
        this.physics.world.setBoundsCollision(true, true, true, false);
        this.physics.world.enable(this.paddle);

        this.paddle.body.setCollideWorldBounds(true);
        this.paddle.body.setBounce(1);

        // create bricks
        this.bricks = this.physics.add.staticGroup();
        this.createBricks();

        // create ball
        this.ball = this.add.ellipse(config.width/2-ballRadius, config.height/2-ballRadius, ballRadius, ballRadius);
        this.ball.setStrokeStyle(1, mainColor);
        this.physics.world.enable(this.ball);
        this.ball.body.velocity.x = ballVelocity;
        this.ball.body.velocity.y = ballVelocity;
        this.ball.body.setCollideWorldBounds(true);
        this.ball.body.setBounce(1, 1);

        this.physics.add.collider(this.ball, this.bricks, this.hitBrick, null, this);
        this.physics.add.collider(this.ball, this.paddle, this.hitPaddle, null, this);

        this.livesHUD = this.add.text(700, 10, 'Lives: '+this.lives, {color: 0xFFFFFF});
        this.scoreHUD = this.add.text(500, 10, 'Score: '+this.score, {color: 0xFFFFFF});
    },

    update: function() {
        this.paddle.body.setVelocity(0,0);
        if (cursorKeys.left.isDown) this.paddle.body.setVelocity(-paddleSpeed, 0);
        if (cursorKeys.right.isDown) this.paddle.body.setVelocity(paddleSpeed, 0);

        // if the ball is below bottom, reset ball and subtract 1 live
        if(this.ball.y > config.height) {
            this.resetBall();
            this.lives -= 1;
            this.livesHUD.text = 'Lives: '+this.lives;
        }
    },

    hitBrick: function(ball, brick) {
        brick.destroy(); // better just deactivate bricks and reactivate on reset !?
        this.score += 1;
        this.scoreHUD.text = 'Score: '+this.score;

        if( this.bricks.countActive() === 0 ) {
            console.log('restart');
            this.resetLevel();
            console.log('active: '+this.bricks.countActive());
        }
    },

    hitPaddle: function(ball, paddle) {
        this.ball.body.velocity.y = -ballVelocity;
    },

    resetBall: function() {
        this.ball.setPosition(this.paddle.x, config.height/2);
        this.ball.body.setVelocity(ballVelocity, ballVelocity);
        console.log('active: '+this.bricks.countActive());
    },

    resetLevel: function() {
        this.resetBall();
        this.createBricks();
//        this.bricks.children.each(function(brick) {
//        });
        console.log('active: '+this.bricks.countActive());
    },

    createBricks: function() {
        for(let column = 0; column < brickColumnCount; column++) {
            for(let row = 0; row < brickRowCount; row++) {
                let brickX = (column*(brickwidth+brickPadding))+brickOffsetLeft;
                let brickY = (row*(brickHeight+brickPadding))+brickOffsetTop;

                let brick = this.add.rectangle(brickX, brickY, brickwidth, brickHeight, mainColor);
                this.bricks.add(brick);
            }
        }
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
var ballVelocity = 200;
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
function mouseMoveHandler(e) {
    var relativeX = e.clientX - canvas.offsetLeft;
    if(relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth/2;
    }
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