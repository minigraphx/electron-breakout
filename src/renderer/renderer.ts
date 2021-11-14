// noinspection JSUnusedAssignment

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

import '../index.css';
import 'kaboom'
import type {KaboomCtx} from 'kaboom';
import kaboom, {GameObj} from "kaboom";

const k = kaboom({
    background: [0xee, 0xee, 0xee],
    height: 800,
    width: 600,
    debug: true
})

const ballRadius        = 5;
let ballVelocity      = 200;

const paddleSpeed       = 300;
const paddleHeight      = 10;
const paddleWidth       = 75;
const paddleDisplayHeight = 50;

let bricks: GameObj[] = [];
const brickRowCount     = 1;
const brickColumnCount  = 2;
const brickWidth        = 75;
const brickHeight       = 20;
const brickPadding      = 10;
const brickOffsetTop    = 30;
const brickOffsetLeft   = 30;

const mainColor         = { r: 0x00, g: 0x95, b: 0xDD };

let score: number = 0;
let lives: number = 3;

let livesHUD: GameObj;
let scoreHUD: GameObj;

let paddle: GameObj;
let ball: GameObj;

let winLabel: GameObj;
let restartLabel: GameObj;
let looseLabel: GameObj;

let restart = true;

function init() {
    lives = 3;
    score = 0;
    winLabel.hidden = true;
    looseLabel.hidden = true;
    restartLabel.hidden = true;
}

function createBall(k: KaboomCtx): GameObj {
    return k.add([
        k.circle(ballRadius),
        k.color(mainColor.r, mainColor.g, mainColor.b),
        k.pos(k.width() * .5, k.height() * .5),
        k.origin('center'),
        k.area({ width: ballRadius * 2, height: ballRadius * 2}),
        k.solid(),
        k.cleanup(),
        'ball'
    ])
}

function createPaddle(k: KaboomCtx): GameObj {
    return k.add([
        k.rect(paddleWidth, paddleHeight),
        k.color(mainColor.r, mainColor.g, mainColor.b),
        k.pos(k.width() * .5, k.height() - paddleDisplayHeight),
        k.origin('bot'),
        k.area({width: paddleWidth, height:paddleHeight}),
        k.solid(),
        k.scale(1),
        'paddle'
    ])
}

function createBricks(k: KaboomCtx) {
    for (let row = 1; row <= brickRowCount; row++) {
        for (let column = 1; column <= brickColumnCount; column++) {
            bricks[column-1 + (row-1) * brickColumnCount] = k.add([
                k.rect(brickWidth, brickHeight),
                k.color(mainColor.r, mainColor.g, mainColor.b),
                k.pos(brickOffsetLeft + column * (brickWidth + brickPadding), brickOffsetTop + row * (brickHeight + brickPadding)),
                k.origin('center'),
                k.area({width: brickWidth, height: brickHeight}),
                k.solid(),
                'brick'
            ]);
        }
    }
}

function createLabel(k: KaboomCtx, message: string, x: number, y: number): GameObj {
    return k.add([
        k.text(message, {size: 16}),
        k.pos(x, y),
        k.color(0x00, 0x00, 0x00),
        k.origin('botleft'),
        'label'
    ]);
}

function resetBall() {
    ball.pos.x = k.width() / 2;
    ball.pos.y = k.height() / 2;
}

function createHitMarker() {
    return k.add([
        k.rect(60, 16),
        k.origin("botleft"),
        k.pos(k.width() * .5, k.height() - 10),
        k.color(k.WHITE),
        'hitMarker'
    ])
}

k.scene('main', () => {
    livesHUD = createLabel(k,'Lives: ' + lives as string, brickOffsetLeft, k.height() - 10);
    scoreHUD = createLabel(k, 'Score: ' + score as string, k.width() * .3, k.height() - 10);
    paddle = createPaddle(k);
    winLabel = createLabel(k, 'You\'ve won', k.width() * .5, k.height() *.4);
    winLabel.hidden = true;
    looseLabel = createLabel(k, 'GAME OVER', k.width() *.5, k.height() * .4);
    looseLabel.hidden = true;
    restartLabel = createLabel(k, 'Press Space to start again', k.width() * .5, k.height() * .5);
    restartLabel.hidden = true;

    let paused = true;

    let ballSpeed = ballVelocity;
    let ballSpeedX = ballVelocity;

    let hitMarker: GameObj;
    hitMarker = createHitMarker();
    let noHitColor = k.color(0xCC, 0xCC, 0xCC ).color;
    let hitColor = k.RED;

    init();
    createBricks(k);
    ball = createBall(k);

    k.onKeyDown("left", () => {
        if( paused ) {
            return;
        }
        /** @type GameObj */
        if(paddle.pos.x > paddleWidth / 2) {
            paddle.move(-paddleSpeed, 0);
        }
    })

    k.onKeyDown("right", () => {
        if( paused ) {
            return;
        }
        /** @type GameObj */
        if(paddle.pos.x < k.width()-paddleWidth/2) {
            paddle.move(paddleSpeed, 0);
        }
    })

    k.onKeyPress('space', () => {
        if(restart === true) {
            init();
            k.destroyAll('brick');
            createBricks(k);
//            k.destroy(ball);
            k.readd(ball);
            resetBall();
            scoreHUD.text = 'Score: ' + score as string;
            livesHUD.text = 'Lives: ' + lives as string;
        }
        paused = false
    })

    k.onMouseMove( (mousePos) => {
        if( paused ) {
            return;
        }
        if ( mousePos.x > paddleWidth / 2 && mousePos.x < k.width() - paddleWidth / 2 ) {
            paddle.pos.x = mousePos.x;
        }
    })

    k.onDraw('hitMarker', (marker) => {
        if( (paddle.pos.x - paddleWidth / 2 < ball.pos.x) && (ball.pos.x < paddle.pos.x + paddleWidth / 2) ) {
            marker.color = hitColor;
        } else {
            marker.color = noHitColor;
        }
    })

    k.onUpdate( () => {
        if(!paused) {
            if( ball.pos.x <= 0 ) {
                ballSpeedX = ballVelocity
            }
            if( ball.pos.x >= k.width() ) {
                ballSpeedX = -ballVelocity
            }
            if(ball.pos.y <= 0) {
                ballSpeed = ballVelocity;
            }
            if(ball.pos.y >= k.height() ) {
                if( lives > 0) {
                    lives -= 1;
                    livesHUD.text = 'Lives: ' + lives as string;
                    resetBall();
                } else {
                    // lost - no lives left
                    paused = true;
                    restart = true;
                    looseLabel.hidden = false;
                    restartLabel.hidden = false;
                }
            }
            ball.move(ballSpeedX, ballSpeed);
        }
    })

    k.onCollide('ball', 'paddle', () => {
        ballSpeed = -ballVelocity;
    })

    k.onCollide('ball', 'brick', (ball, brick, collision) => {
        if( !collision.target.is('brick') ) {
            return
        }
        ballSpeed = ballVelocity;
        brick.hidden = true;
        brick.destroy();
        score += 1;
        scoreHUD.text = 'Score: ' + score as string;
        let won = true;
        // last brick not counted ?
        k.every('brick', (brick) => {
            if( !brick.hidden ) {
                won = false
            }
        })
        if(won) {
            paused = true;
            restart = true;
            winLabel.hidden = false;
            restartLabel.hidden = false;
        }
    })
});

k.go('main');
