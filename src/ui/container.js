import * as PIXI from 'pixi.js';

export default class Container extends PIXI.Container {

    constructor() {
        super();
        this.anchor = new PIXI.ObservablePoint(() => {
            this.pivot.x = this.width * this.anchor.x;
            this.pivot.y = this.height * this.anchor.y;
        });
    }

}
