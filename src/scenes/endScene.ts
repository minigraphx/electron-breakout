import Phaser from "phaser";

export default class endScene extends Phaser.Scene {

    private startText: string = "Press Space to Start again!"
    private gameWidth: number
    private gameHeight: number
    private cursorKeys: any;
    private lives: number;
    private score: number;

    constructor() {
        super('endScene');
    }

    init() {
        this.gameWidth = this.game.config.width as number
        this.gameHeight = this.game.config.height as number
    }

    create(this: endScene, data?: { score: number, lives: number }) {
        console.log(data);
        let gameOverText: string = 'Game Over';
        if( data.lives > 0 ) {
            gameOverText = 'Your Score: '+data.score
        }
        this.add.text( this.gameWidth * .5, this.gameHeight * .4,
            gameOverText, { color: "black" })
            .setOrigin(.5, .5);

        this.add.text(this.gameWidth * .5,this.gameHeight * .5,
            this.startText, { color: "0x0000FF" } )
            .setOrigin(.5, .5)

        this.cursorKeys = this.input.keyboard.createCursorKeys();
    }

    update(time: number, delta: number) {
        if (this.cursorKeys.space.isDown) {
            this.scene.start('gameScene')
        }
    }
/*
        this.winText = this.add.text(this.width / 2 - 50, this.height / 2, "You've Won",
            {
                color: 'black',
                fontFamily: 'Arial',
                fontSize: '24px'
            }
        );
        this.winText.visible = false;
 */
}
