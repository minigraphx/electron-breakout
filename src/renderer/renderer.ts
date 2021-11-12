/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */
import Phaser from 'phaser';
import '../index.css';
import GameObject = Phaser.GameObjects.GameObject;
import CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys;
import Text = Phaser.GameObjects.Text;

export class BreakoutScene extends Phaser.Scene {

    private score: number;
    private lives: number;
    private isPaused: boolean;
    private cursorKeys: CursorKeys;
    private paddle: Phaser.GameObjects.Rectangle;

    private mainColor         = 0x0095DD;
    private ballRadius        = 10;
    private ballVelocity      = 200;
    private paddleSpeed       = 300;
    private paddleHeight      = 10;
    private paddleWidth       = 75;
    private paddleDisplayHeight: number;
    private brickRowCount     = 3;
    private brickColumnCount  = 5;
    private brickWidth        = 75;
    private brickHeight       = 20;
    private brickPadding      = 10;
    private brickOffsetTop    = 30;
    private brickOffsetLeft   = 60;
    private noHitColor        = 0xCCCCCC;
    private hitColor          = 0xFF0000;
    private hitMarker: Phaser.GameObjects.Rectangle;
    private bricks: Phaser.Physics.Arcade.StaticGroup;
    private ball: Phaser.GameObjects.Ellipse;

    private screenWidth: number;
    private screenHeight: number;
    private livesHUD: Text;
    private scoreHUD: Text;
    private winText: Text;
    private gameOverText: Text;

    constructor() {
        super('');
    }

    initialize(): void {
        this.score = 0;
        this.lives = 3;

        /** @var isPaused Boolean */
        this.isPaused = false;
        this.screenWidth = config.width as number;
        this.screenHeight = config.height as number;
        this.paddleDisplayHeight = this.screenHeight - this.screenHeight / 10;
        //Phaser.Scene.call(this, {key: 'breakout'});
    }

    preload(): void {
        this.initialize();
        //game.scale.scaleMode = Phaser.ScaleModes.DEFAULT;
        //game.scale.pageAlignHorizontally = true;
        //game.scale.pageAlignVertically = true;
    }

    create(): void {
        this.cursorKeys = this.input.keyboard.createCursorKeys();

        /** @type Phaser.GameObjects.Rectangle */
        this.paddle = this.add.rectangle(this.screenWidth, this.paddleDisplayHeight, this.paddleWidth, this.paddleHeight, this.mainColor);

        // bounds are anywhere but bottom
        this.physics.world.setBoundsCollision(true, true, true, false);
        this.physics.world.enable(this.paddle);

        const paddleBody = this.paddle.body as Phaser.Physics.Arcade.Body;
        paddleBody.setCollideWorldBounds(true);
        this.physics.world.collide(this.paddle);

        // create bricks
        this.bricks = this.physics.add.staticGroup();
        this.createBricks();

        /** @type Phaser.GameObjects.Ellipse */
        // create ball
        this.ball = this.add.ellipse(this.screenWidth / 2 - this.ballRadius, this.screenHeight / 2 - this.ballRadius, this.ballRadius, this.ballRadius, this.mainColor);
        this.physics.world.enable(this.ball);
        this.resetBall();
        this.physics.world.collide(this.ball);
        const ballBody = this.ball.body as Phaser.Physics.Arcade.Body;
        ballBody.setCollideWorldBounds(true);
        ballBody.setBounce(1, 1);

        this.physics.add.collider(this.ball, this.bricks, this.hitBrick, null, this);
        this.physics.add.collider(this.ball, this.paddle, this.hitPaddle, null, this);

        this.livesHUD = this.add.text( 20, this.screenHeight - 20, 'Lives: ' + this.lives, {color: '0xFFFFFF'});
        this.hitMarker = this.add.rectangle(this.screenWidth / 2, this.screenHeight - 12, 40, 10, this.noHitColor);
        this.scoreHUD = this.add.text(this.screenWidth - 100, this.screenHeight - 20, 'Score: ' + this.score, {color: '0xFFFFFF'});

        this.gameOverText = this.add.text(this.screenWidth / 2, this.screenHeight / 2 - 100, 'GAME OVER', {
            color: 'black',
            fontSize: '24px',
            fontFamily: 'Arial'
        }).setOrigin(.5, .5);
        this.gameOverText.visible = false;

        this.winText = this.add.text(this.screenWidth / 2 - 50, this.screenHeight / 2 - 100, "You've Won", {
            color: '0xFFFFFF',
            fontFamily: 'Arial',
            fontSize: '24px'
        }).setOrigin(.5, .5);
        this.winText.visible = false;

        this.input.on('pointermove', this.mouseMovePaddle);
    }

    update(): void {
        //TODO: only call stuff when needed (i.e. modify text)
        const paddle = this.paddle.body as Phaser.Physics.Arcade.Body;

        paddle.setVelocity(0, 0);
        if (!this.isPaused) {
            /** @type Phaser.Physics.Arcade.Body this.paddle */

            if (this.cursorKeys.left.isDown) paddle.setVelocity(-this.paddleSpeed, 0);
            if (this.cursorKeys.right.isDown) paddle.setVelocity(this.paddleSpeed, 0);
        } else {
            const ballBody = this.ball.body as Phaser.Physics.Arcade.Body;
            ballBody.setVelocity(0, 0);
        }

        // if the ball is below bottom, reset ball and subtract 1 live
        if (this.ball.y > this.screenHeight) {
            this.resetBall();
            this.lives -= 1;
        }

        if (this.ball.x > this.paddle.x - this.paddle.width / 2 && this.ball.x < this.paddle.x + this.paddle.width / 2) {
            this.hitMarker.setStrokeStyle(2, this.hitColor);
            this.hitMarker.setFillStyle(this.hitColor);
        } else {
            this.hitMarker.setStrokeStyle(2, this.noHitColor);
            this.hitMarker.setFillStyle(this.noHitColor);
        }

        if (this.lives < 0 || this.bricks.countActive() === 0) {
            this.isPaused = true;
            if (this.lives < 0) {
                this.gameOverText.visible = true;
            } else {
                this.winText.visible = true;
            }
            if (this.cursorKeys.space.isDown) {
                this.restart();
            }
        } else {
            this.livesHUD.text = 'Lives: ' + this.lives;
        }

    }

    restart():void {
        this.lives = 3;
        this.score = 0;
        this.isPaused = false;
        this.gameOverText.visible = false;
        this.winText.visible = false;
        this.resetLevel();
    }

    mouseMovePaddle(pointer: Phaser.Input.Pointer):void {
        if (!this.scene.isPaused) {
            const mousePos = pointer.position.x;
            const paddleBody = breakout.paddle.body as Phaser.Physics.Arcade.Body;
            if ((mousePos < 0 && paddleBody.position.x > 0) || (mousePos < breakout.screenWidth && paddleBody.position.x < breakout.screenWidth)) {
                breakout.paddle.setPosition(mousePos, breakout.paddleDisplayHeight);
            }
        }
    }

    hitBrick(ball: GameObject, brick: GameObject): void {
        brick.destroy(); // better just deactivate bricks and reactivate on reset !?
        this.score += 1;
        this.scoreHUD.text = 'Score: ' + this.score;
    }

    hitPaddle(): void {
        this.ball.body.velocity.y = -this.ballVelocity;
    }

    resetBall(): void {
        this.ball.setPosition(this.paddle.x, this.screenHeight / 2);
        const ball = this.ball.body as Phaser.Physics.Arcade.Body;
        ball.setVelocity(this.ballVelocity * (-.5 + Math.random()), this.ballVelocity);
    }

    resetLevel(): void {
        this.bricks.clear(false, true);
        this.resetBall();
        this.createBricks();
    }

    createBricks(): void {
        for (let column = 0; column < this.brickColumnCount; column++) {
            for (let row = 0; row < this.brickRowCount; row++) {
                const brickX = (column * (this.brickWidth + this.brickPadding)) + this.brickOffsetLeft;
                const brickY = (row * (this.brickHeight + this.brickPadding)) + this.brickOffsetTop;
                const brick = this.add.rectangle(brickX, brickY, this.brickWidth, this.brickHeight, this.mainColor);
                this.bricks.add(brick);
            }
        }
    }

}

const breakout = new BreakoutScene();
export const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO, // Phaser.WEBGL or Phaser.CANVAS
    width: 460,
    height: 500,
    backgroundColor: '#eee',
    scene: [ breakout ],
    physics: {
        default: 'arcade',
        arcade: {
//            debug: true,
        },
    }
};

const game = new Phaser.Game(config);

export default game;
