import Phaser from 'phaser';

var breakout = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize:
    function Breakout() {
        Phaser.Scene.call(this, { key: 'breakout'});

        /** @var bricks Phaser.Physics.Arcade.StaticGroup */
        this.bricks;
        /** @var paddle Phaser.GameObjects.Rectangle */
        this.paddle;
        /** @var ball Phaser.GameObjects.Ellipse */
        this.ball;

        this.score = 0;
        this.lives = 3;

        this.scoreHUD;
        this.livesHUD;
        this.mouseHUD;
        /** @var gameOverText Phaser.GameObjects.Text */
        this.gameOverText;
        /** @var winText Phaser.GameObjects.Text */
        this.winText;

        /** @var isPaused Boolean */
        this.isPaused = false;

        this.paddleHeight = config.height-config.height/10;
    },

    preload: function() {
        game.scale.scaleMode = Phaser.ScaleModes.DEFAULT;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
    },

    create: function() {
        cursorKeys = this.input.keyboard.createCursorKeys();

        this.paddle = this.add.rectangle(config.width/2-paddleWidth/2, this.paddleHeight, paddleWidth, paddleHeight, mainColor);
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
        this.ball = this.add.ellipse(config.width/2-ballRadius, config.height/2-ballRadius, ballRadius, ballRadius, mainColor);
        //this.ball.setStrokeStyle(1, mainColor);
        this.physics.world.enable(this.ball);
        this.resetBall();
        this.ball.body.setCollideWorldBounds(true);
        this.ball.body.setBounce(1, 1);

        this.physics.add.collider(this.ball, this.bricks, this.hitBrick, null, this);
        this.physics.add.collider(this.ball, this.paddle, this.hitPaddle, null, this);

        this.livesHUD = this.add.text(700, config.height-20, 'Lives: '+this.lives, {color: 0xFFFFFF});
        this.scoreHUD = this.add.text(500, config.height-20, 'Score: '+this.score, {color: 0xFFFFFF});
        this.mouseHUD = this.add.text(10, config.height-20, 'Mouse Movement X: ', {color: 0xFFFFFF});

        /** @var gameOverText Phaser.GameObjects.Text */
        this.gameOverText = this.add.text(config.width/2-50, config.height/2, 'GAME OVER', { color: 0xFFFFFF });
        this.gameOverText.visible = false;
        /** @var winText Phaser.GameObjects.Text */
        this.winText = this.add.text(config.width/2-50, config.height/2, "You've Won", { color: 0xFFFFFF, fontFamily: 'Arial', fontSize: 24 });
        this.winText.visible = false;

        this.input.on('pointermove', this.mouseMovePaddle);
    },

    update: function() {
        //TODO: only call stuff when needed (i.e. modify text)

        this.paddle.body.setVelocity(0,0);
        if(!this.isPaused) {
            if (cursorKeys.left.isDown ) this.paddle.body.setVelocity(-paddleSpeed, 0);
            if (cursorKeys.right.isDown) this.paddle.body.setVelocity(paddleSpeed, 0);
        } else {
            this.ball.body.setVelocity(0,0);
        }

        // if the ball is below bottom, reset ball and subtract 1 live
        if(this.ball.y > config.height) {
            this.resetBall();
            this.lives -= 1;
        }

        if( this.lives < 0 || this.bricks.countActive() === 0) {
            this.isPaused = true;
            if(this.lives < 0) {
                this.gameOverText.visible = true;
            } else {
                this.winText.visible = true;
            }
            if(cursorKeys.space.isDown) {
                this.restart();
            }
        } else {
            this.livesHUD.text = 'Lives: '+this.lives;
        }

    },

    restart: function () {
        this.lives = 3;
        this.score = 0;
        this.isPaused = false;
        this.gameOverText.visible = false;
        this.winText.visible = false;
        this.resetLevel();
    },

    mouseMovePaddle: function(pointer) {
        if(!this.scene.isPaused) {
            let mousePos = pointer.position.x;
            this.scene.mouseHUD.text = 'Mouse Movement X: '+mousePos;
            if( (mousePos < 0 && this.scene.paddle.body.position.x > 0) || (mousePos < config.width && this.scene.paddle.body.position.x < config.width) ) {
                this.scene.paddle.setPosition(mousePos, this.scene.paddleHeight);
            }
        }
    },

    hitBrick: function(ball, brick) {
        brick.destroy(); // better just deactivate bricks and reactivate on reset !?
        this.score += 1;
        this.scoreHUD.text = 'Score: '+this.score;
    },

    hitPaddle: function(ball, paddle) {
        this.ball.body.velocity.y = -ballVelocity;
    },

    resetBall: function() {
        this.ball.setPosition(this.paddle.x, config.height/2);
        this.ball.body.setVelocity(ballVelocity * (-.5+Math.random()), ballVelocity);
    },

    resetLevel: function() {
        this.bricks.clear(false, true);
        this.resetBall();
        this.createBricks();

//        this.bricks.children.each(function(brick) {
//        });
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

brickRowCount = 1;
brickColumnCount = 1;
