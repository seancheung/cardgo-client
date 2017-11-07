import * as PIXI from 'pixi.js';
import SceneManager from './scene-manager';

export default class Application extends PIXI.Application {

    constructor(...args) {
        super(...args);
        this.sceneManager = new SceneManager(
            this.renderer,
            this.ticker,
            this.stage
        );
    }

}
