import * as PIXI from 'pixi.js';
import Scene from '../scene';
import Progress from '../ui/progress';
import 'res/controls.png';

export default class Loading extends Scene {

    setup(loader) {
        super.setup(loader);
        loader
            .add('control', require('res/controls.json'))
            .add('loading/background', require('res/background-1.png'));
    }

    init() {
        super.init();
        const background = new PIXI.Sprite(
            this.resources['loading/background'].texture
        );
        background.anchor.set(0.5);
        this.root.addChild(background);
        const progressBar = new Progress(
            this.resources['control'].textures['LoadingBar_Background'],
            this.resources['control'].textures['LoadingBar_Fill']
        );
        progressBar.anchor.set(0.5);

        this.root.addChild(progressBar);
        this.progressBar = progressBar;
    }

    update(dt) {
        super.update();
        if (this.progressBar.value < 1) {
            this.progressBar.value += 10 * dt / 1000;
            if (this.progressBar.value >= 1) {
                this.manager.load('login');
            }
        }
    }

}
