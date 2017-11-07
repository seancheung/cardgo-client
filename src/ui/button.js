import * as PIXI from 'pixi.js';
import Container from './container';

export default class Button extends Container {

    /**
     * Creates an instance of Button.
     * @param {PIXI.Texture|PIXI.Sprite} backgroud
     * @param {{text?: string|PIXI.Text, scale?: boolean, tint?: number|{hover?: number, pressed?: number, disabled?: number}, swap?: PIXI.Texture|{hover?: PIXI.Texture, pressed?: PIXI.Texture, disabled?: PIXI.Texture}}} [options]
     * @memberof Button
     */
    constructor(backgroud, options) {
        super();
        if (!options) {
            options = {};
        }
        if (backgroud instanceof PIXI.Texture) {
            this.backgroud = new PIXI.Sprite(backgroud);
        } else if (backgroud instanceof PIXI.Sprite) {
            this.backgroud = backgroud;
        } else {
            throw new Error('invalid background');
        }
        this.texture = this.backgroud.texture;
        this.addChild(this.backgroud);
        if (options.text) {
            if (typeof options.text === 'string') {
                this.text = new PIXI.Text(options.text);
            } else if (options.text instanceof PIXI.Text) {
                this.text = options.text;
            } else {
                throw new Error('invalid text');
            }
            this.addChild(this.text);
            this.text.anchor.set(0.5);
            this.text.position.set(
                this.backgroud.width / 2,
                this.backgroud.height / 2
            );
        }
        this.interactive = true;
        this._down = false;
        this.on('pointerover', () => {
            if (options.scale === true) {
                this.scale.set(1.02);
            }
            if (options.tint && typeof options.tint.hover === 'number') {
                this.backgroud.tint = options.tint.hover;
            }
            if (options.swap && options.swap.hover instanceof PIXI.Texture) {
                this.backgroud.texture = options.swap.hover;
            }
        });
        this.on('pointerdown', () => {
            this._down = true;
            if (options.scale === true) {
                this.scale.set(0.98);
            }
            if (options.tint) {
                if (typeof options.tint === 'number') {
                    this.backgroud.tint = options.tint;
                } else if (typeof options.tint.pressed === 'number') {
                    this.backgroud.tint = options.tint.pressed;
                }
            }
            if (options.swap) {
                if (options.swap instanceof PIXI.Texture) {
                    this.backgroud.texture = options.swap;
                } else if (options.swap.pressed instanceof PIXI.Texture) {
                    this.backgroud.texture = options.swap.pressed;
                }
            }
        });
        this.on('pointerup', () => {
            if (this._down) {
                this._down = false;
                if (this._action) {
                    this._action();
                }
            }
            if (options.scale === true) {
                this.scale.set(1);
            }
            if (options.tint) {
                this.backgroud.tint = 0xffffff;
            }
            if (options.swap) {
                this.backgroud.texture = this.texture;
            }
        });
        this.on('pointerout', () => {
            this._down = false;
            if (options.scale === true) {
                this.scale.set(1);
            }
            if (options.tint) {
                this.backgroud.tint = 0xffffff;
            }
            if (options.swap) {
                this.backgroud.texture = this.texture;
            }
        });
        this.on('pointerupoutside', () => {
            this._down = false;
            if (options.scale === true) {
                this.scale.set(1);
            }
            if (options.tint) {
                this.backgroud.tint = 0xffffff;
            }
            if (options.swap) {
                this.backgroud.texture = this.texture;
            }
        });
    }

    get action() {
        return this._action;
    }

    set action(value) {
        if (typeof value === 'function') {
            this._action = value;
        }
    }

}
