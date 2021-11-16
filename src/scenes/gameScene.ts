import Phaser from "phaser";

export default class gameScene extends Phaser.Scene {
    private mainColor: number = 0x0095DD;
    private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;


    private bricks: Phaser.Physics.Arcade.StaticGroup = null;
    private brickRowCount: number = 3;
    private brickColumnCount: number = 5;
    private brickWidth        = 75;
    private brickHeight       = 20;
    private brickPadding      = 10;
    private brickOffsetTop    = 30;
    private brickOffsetLeft   = 60;

    private scoreHUD: Phaser.GameObjects.Text;
    private score: number;
    private livesHUD: Phaser.GameObjects.Text;
    private lives: number;
    private isPaused: boolean;

    private paddleHeight: number = 10;
    private paddleWidth: number = 75;
    private paddle: Phaser.GameObjects.Rectangle = null;
    private paddleSpeed: number = 300;
    private paddleBody: Phaser.Physics.Arcade.Body = null;

    private height: number;
    private width: number;

    private ball: Phaser.GameObjects.Ellipse = null;
    private ballRadius: number = 10;
    private ballVelocity: number = 200;
    private ballBody: Phaser.Physics.Arcade.Body = null;

    private hitMarker: Phaser.GameObjects.Rectangle;

    private noHitColor        = 0xCCCCCC;
    private hitColor          = 0xFF0000;

    constructor() {
        super('gameScene');
    }

    initialize() {
        if(this.game.config.physics.arcade.debug) {
            this.brickColumnCount = 1
            this.brickRowCount = 1
        }

        this.lives = 3;
        this.score = 0;

        /** @var isPaused Boolean */
        this.isPaused = false;
        this.height = this.game.config.height as number
        this.width = this.game.config.width as number

        this.paddleHeight = this.height - this.height / 10; // set paddlePosition as paddleHeight
        this.paddle = this.add.rectangle(this.width / 2 - this.paddleWidth / 2, this.paddleHeight, this.paddleWidth, 10, this.mainColor);
    }

    preload() {
        /*
        this.game.scale.scaleMode = Phaser.ScaleModes.DEFAULT;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
         */
    }

    create() {
        this.initialize();
        this.cursorKeys = this.input.keyboard.createCursorKeys();

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
        this.ball = this.add.ellipse(this.width / 2 - this.ballRadius, this.height / 2 - this.ballRadius, this.ballRadius, this.ballRadius, this.mainColor);
        this.physics.world.enable(this.ball);
        this.resetBall();
        this.ballBody = this.ball.body as Phaser.Physics.Arcade.Body
        this.ballBody.setCollideWorldBounds(true);
        this.ballBody.setBounce(1, 1);

        this.hitMarker = this.add.rectangle(this.width / 2 + 110, this.height - 12, 40, 10, this.noHitColor);

        this.physics.add.collider(this.ball, this.bricks, this.hitBrick, null, this);
        this.physics.add.collider(this.ball, this.paddle, this.hitPaddle, null, this);

        this.livesHUD = this.add.text(this.width - 90, this.height - 20,
            'Lives: ' + this.lives,
            {color: 'black'});
        this.scoreHUD = this.add.text(240, this.height - 20,
            'Score: ' + this.score,
            {color: 'black'});


        this.input.on('pointermove', this.mouseMovePaddle);
    }

    update() {
        //TODO: only call stuff when needed (i.e. modify text)

        this.paddleBody.setVelocity(0, 0);
        if (!this.isPaused) {
            if (this.cursorKeys.left.isDown) this.paddleBody.setVelocity(-this.paddleSpeed, 0);
            if (this.cursorKeys.right.isDown) this.paddleBody.setVelocity(this.paddleSpeed, 0);
        } else {
            this.ballBody.setVelocity(0, 0);
        }

        // if the ball is below bottom, reset ball and subtract 1 live
        if (this.ball.y > this.height) {
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
                this.scene.start('endScene',
                    { score: this.score, lives: 0 })
            } else {
                this.scene.start('endScene',
                    { score: this.score, lives: this.lives })
            }
            if (this.cursorKeys.space.isDown) {
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
        this.resetLevel();
    }

    mouseMovePaddle(pointer: Phaser.Input.Pointer) {
        let scene = this.scene as unknown as gameScene;
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
        this.ball.body.velocity.y = -this.ballVelocity;
    }

    resetBall() {
        this.ball.setPosition(this.paddle.x, this.height / 2);
        let ballBody: Phaser.Physics.Arcade.Body = this.ball.body as Phaser.Physics.Arcade.Body
        ballBody.velocity = new Phaser.Math.Vector2(this.ballVelocity * (-.5 + Math.random()), this.ballVelocity);
    }

    resetLevel() {
        this.bricks.clear(false, true);
        this.resetBall();
        this.createBricks();
    }

    createBricks() {
        for (let column = 0; column < this.brickColumnCount; column++) {
            for (let row = 0; row < this.brickRowCount; row++) {
                let brickX = (column * (this.brickWidth + this.brickPadding)) + this.brickOffsetLeft;
                let brickY = (row * (this.brickHeight + this.brickPadding)) + this.brickOffsetTop;
                let brick = this.add.rectangle(brickX, brickY, this.brickWidth, this.brickHeight, this.mainColor);
                this.bricks.add(brick);
            }
        }
    }
}
