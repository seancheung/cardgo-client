import * as PIXI from 'pixi.js';
import Container from './container';

export default class Progress extends Container {

    /**
     * Creates an instance of Progress.
     * @param {PIXI.Texture|PIXI.Sprite} background
     * @param {PIXI.Texture|PIXI.extras.TilingSprite} fill
     * @param {number} [value]
     * @memberof Progress
     */
    constructor(background, fill, value) {
        super();
        this._value = Math.max(0, Math.min(1, value || 0));
        if (background instanceof PIXI.Texture) {
            background = new PIXI.Sprite(background);
        }
        if (fill instanceof PIXI.Texture) {
            fill = new PIXI.extras.TilingSprite(fill, fill.width, fill.height);
        }
        this.background = background;
        this.fill = fill;
        this.text = new PIXI.Text(`${Math.floor(this._value)}%`, { fill: 'white' });
        this.addChild(this.background, this.fill, this.text);
        this.fill.anchor.set(0, 0.5);
        this.fill.position.set(0, this.background.height / 2);
        this.text.anchor.set(0.5);
        this.text.position.set(
            this.background.width / 2,
            this.background.height / 2
        );
    }

    get value() {
        return this._value;
    }

    set value(value) {
        value = Math.max(0, Math.min(1, value));
        if (this._value !== value) {
            this._value = value;
            this.emit('progresschanged', value);
            this.updateProgress();
        }
    }

    updateProgress() {
        this.fill.width = this.fill.texture.width * this._value;
        this.text.text = `${Math.floor(this._value * 100)}%`;
    }

}
