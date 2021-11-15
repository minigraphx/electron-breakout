// todo: hit help could use the angle the ball moves to show if it will hit
// todo: ball could bounce with different angles depending on where paddle is hit and if paddle is moving or not
// todo: debug mode could create just 1 brick
import Phaser from 'phaser';
import CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys;
import Vector2 = Phaser.Math.Vector2;

let cursorKeys: CursorKeys;
const mainColor         = 0x0095DD;
const ballRadius        = 10;
const ballVelocity      = 200;
const paddleSpeed       = 300;
const paddleHeight      = 10;
const paddleWidth       = 75;
const brickRowCount     = 3;
const brickColumnCount  = 5;
const brickwidth        = 75;
const brickHeight       = 20;
const brickPadding      = 10;
const brickOffsetTop    = 30;
const brickOffsetLeft   = 60;
const noHitColor        = 0xCCCCCC;
const hitColor          = 0xFF0000;

class breakoutScene extends Phaser.Scene {
    private bricks: Phaser.Physics.Arcade.StaticGroup = null;
    private score: number;
    private lives: number;
    private isPaused: boolean;
    private paddleHeight: number;
    private paddle: Phaser.GameObjects.Rectangle = null;
    private height: number;
    private width: number;
    private ball: Phaser.GameObjects.Ellipse = null;
    private scoreHUD: Phaser.GameObjects.Text;
    private hitMarker: Phaser.GameObjects.Rectangle;
    private livesHUD: Phaser.GameObjects.Text;
    private gameOverText: Phaser.GameObjects.Text;
    private winText: Phaser.GameObjects.Text;
    private paddleBody: Phaser.Physics.Arcade.Body = null;
    private ballBody: Phaser.Physics.Arcade.Body = null;

    initialize() {
        this.lives = 3;
        this.score = 0;

        /** @var isPaused Boolean */
        this.isPaused = false;
        this.height = this.game.config.height as number
        this.width = this.game.config.width as number
        this.paddleHeight = this.height - this.height / 10;

        this.paddle = this.add.rectangle(this.width / 2 - paddleWidth / 2, this.paddleHeight, paddleWidth, paddleHeight, mainColor);
    }

    preload() {
        /*
        game.scale.scaleMode = Phaser.ScaleModes.DEFAULT;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
         */
    }

    create() {
        this.initialize();
        cursorKeys = this.input.keyboard.createCursorKeys();

        // bounce anywhere but bottom
        this.physics.world.setBoundsCollision(true, true, true, false);
        this.physics.world.enable(this.paddle);

        this.paddleBody = this.paddle.body as Phaser.Physics.Arcade.Body
        this.paddleBody.setCollideWorldBounds(true);
        this.paddleBody.setBounceX(1);

        // create bricks
        this.bricks = this.physics.add.staticGroup();
        this.createBricks();

        // create ball
        this.ball = this.add.ellipse(this.width / 2 - ballRadius, this.height / 2 - ballRadius, ballRadius, ballRadius, mainColor);
        this.physics.world.enable(this.ball);
        this.resetBall();
        this.ballBody = this.ball.body as Phaser.Physics.Arcade.Body
        this.ballBody.setCollideWorldBounds(true);
        this.ballBody.setBounce(1, 1);

        this.hitMarker = this.add.rectangle(this.width / 2 + 110, this.height - 12, 40, 10, noHitColor);

        this.physics.add.collider(this.ball, this.bricks, this.hitBrick, null, this);
        this.physics.add.collider(this.ball, this.paddle, this.hitPaddle, null, this);

        this.livesHUD = this.add.text(this.width - 90, this.height - 20,
            'Lives: ' + this.lives,
            {color: 'black'});
        this.scoreHUD = this.add.text(240, this.height - 20,
            'Score: ' + this.score,
            {color: 'black'});

        this.gameOverText = this.add.text(this.width / 2 - 50, this.height / 2,
            'GAME OVER',
            {color: 'black'});
        this.gameOverText.visible = false;

        this.winText = this.add.text(this.width / 2 - 50, this.height / 2, "You've Won",
            {
                color: 'black',
                fontFamily: 'Arial',
                fontSize: '24px'
            }
        );
        this.winText.visible = false;

        this.input.on('pointermove', this.mouseMovePaddle);
    }

    update() {
        //TODO: only call stuff when needed (i.e. modify text)

        this.paddleBody.setVelocity(0, 0);
        if (!this.isPaused) {
            if (cursorKeys.left.isDown) this.paddleBody.setVelocity(-paddleSpeed, 0);
            if (cursorKeys.right.isDown) this.paddleBody.setVelocity(paddleSpeed, 0);
        } else {
            this.ballBody.setVelocity(0, 0);
        }

        // if the ball is below bottom, reset ball and subtract 1 live
        if (this.ball.y > this.height) {
            this.resetBall();
            this.lives -= 1;
        }

        if (this.ball.x > this.paddle.x - this.paddle.width / 2 && this.ball.x < this.paddle.x + this.paddle.width / 2) {
            this.hitMarker.setStrokeStyle(2, hitColor);
            this.hitMarker.setFillStyle(hitColor);
        } else {
            this.hitMarker.setStrokeStyle(2, noHitColor);
            this.hitMarker.setFillStyle(noHitColor);
        }

        if (this.lives < 0 || this.bricks.countActive() === 0) {
            this.isPaused = true;
            if (this.lives < 0) {
                this.gameOverText.visible = true;
            } else {
                this.winText.visible = true;
            }
            if (cursorKeys.space.isDown) {
                this.restart();
            }
        } else {
            this.livesHUD.text = 'Lives: ' + this.lives;
        }

    }

    restart() {
        this.lives = 3;
        this.score = 0;
        this.isPaused = false;
        this.gameOverText.visible = false;
        this.winText.visible = false;
        this.resetLevel();
    }

    mouseMovePaddle(pointer: Phaser.Input.Pointer) {
        let scene = this.scene as unknown as breakoutScene;
        if (!this.scene.isPaused && scene.paddleBody !== undefined) {
            let mousePos = pointer.position.x
            if (0 <= mousePos && mousePos < scene.width) {
                scene.paddle.setPosition(mousePos, scene.paddleHeight);
            }
        }
    }

    hitBrick(ball: any, brick: { destroy: () => void; }) {
        brick.destroy(); // better just deactivate bricks and reactivate on reset !?
        this.score += 1;
        this.scoreHUD.text = 'Score: ' + this.score;
    }

    hitPaddle() {
        this.ball.body.velocity.y = -ballVelocity;
    }

    resetBall() {
        this.ball.setPosition(this.paddle.x, this.height / 2);
        let ballBody: Phaser.Physics.Arcade.Body = this.ball.body as Phaser.Physics.Arcade.Body
        ballBody.velocity = new Vector2(ballVelocity * (-.5 + Math.random()), ballVelocity);
    }

    resetLevel() {
        this.bricks.clear(false, true);
        this.resetBall();
        this.createBricks();
    }

    createBricks() {
        for (let column = 0; column < brickColumnCount; column++) {
            for (let row = 0; row < brickRowCount; row++) {
                let brickX = (column * (brickwidth + brickPadding)) + brickOffsetLeft;
                let brickY = (row * (brickHeight + brickPadding)) + brickOffsetTop;
                let brick = this.add.rectangle(brickX, brickY, brickwidth, brickHeight, mainColor);
                this.bricks.add(brick);
            }
        }
    }
}

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO, // Phaser.WEBGL or Phaser.CANVAS
    width: 480,
    height: 640,
    backgroundColor: '#eee',
    scene: [ breakoutScene ],
    physics: {
        default: 'arcade',
        arcade: {
           debug: true,
        },
    }
};

const game = new Phaser.Game(config);

export default game;
