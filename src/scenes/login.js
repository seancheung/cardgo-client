import * as PIXI from 'pixi.js';
import Scene from '../scene';
import Button from '../ui/button';
import 'res/login.png';

export default class Login extends Scene {

    setup(loader) {
        super.setup(loader);
        loader
            .add('login', require('res/login.json'))
            .add('login/background-top', require('res/background-top.png'))
            .add('login/background', require('res/background-1.png'));
    }

    init() {
        super.init();
        const background = new PIXI.Sprite(
            this.resources['login/background'].texture
        );
        background.anchor.set(0.5);
        this.root.addChild(background);
        const topTexture = this.resources['login/background-top'].texture;
        this.top = new PIXI.extras.TilingSprite(
            topTexture,
            this.manager.renderer.width,
            this.manager.renderer.height
        );
        this.top.anchor.set(0.5);
        this.root.addChild(this.top);
        const button = new Button(
            this.resources['login'].textures['login_big_btn'],
            {
                swap: {
                    hover: this.resources['login'].textures[
                        'login_big_btn-HOVER'
                    ],
                    pressed: this.resources['login'].textures[
                        'login_big_btn-PUSH'
                    ]
                }
            }
        );
        button.anchor.set(0.5);
        button.action = () => this.manager.load('loading');
        this.root.addChild(button);
    }

    update(dt) {
        super.update(dt);
        this.top.tilePosition.x -= 1.5 * dt;
    }

}
