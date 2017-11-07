import Scene from '../scene';
import Button from '../ui/button';
import 'res/login.png';

export default class Login extends Scene {

    setup(loader) {
        super.setup(loader);
        loader.add('login', require('res/login.json'));
    }

    init() {
        super.init();
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

}
