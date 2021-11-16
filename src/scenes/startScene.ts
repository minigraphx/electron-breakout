import Phaser from "phaser";
import Text = Phaser.GameObjects.Text;

export default class startScene extends Phaser.Scene {

    private startText: string = "Press Space to Start"
    private gameWidth: number
    private gameHeight: number
    private cursorKeys: any;

    constructor() {
        super('startScene');
    }

    init() {
        this.gameWidth = this.game.config.width as number
        this.gameHeight = this.game.config.height as number
    }

    create() {
        this.add.text( this.gameWidth * .5, this.gameHeight * .4,
            "Breakout Mini", { color: "black" })
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

}
