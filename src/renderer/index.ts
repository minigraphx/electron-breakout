// todo: hit help could use the angle the ball moves to show if it will hit
// todo: ball could bounce with different angles depending on where paddle is hit and if paddle is moving or not
// todo: debug mode could create just 1 brick
import Phaser from 'phaser';

import gameScene from '../scenes/gameScene';
import startScene from "../scenes/startScene";
import endScene from "../scenes/endScene";

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO, // Phaser.WEBGL or Phaser.CANVAS
    width: 480,
    height: 640,
    backgroundColor: '#eee',
    scene: [ startScene, gameScene, endScene ],
    physics: {
        default: 'arcade',
        arcade: {
           debug: true,
        },
    }
};

const game = new Phaser.Game(config);

export default game;
