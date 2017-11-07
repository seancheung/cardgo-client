/*eslint no-unused-vars:off*/
import * as PIXI from 'pixi.js';
import { EventEmitter } from 'events';

export const STATE = {
    NONE: 0,
    LOADED: 1,
    INITIALIZED: 2,
    READY: 3
};

export default class Scene extends EventEmitter {

    /**
     * Creates an instance of Scene.
     * @param {string} [name]
     * @memberof Scene
     */
    constructor(name) {
        super();
        this.name = name;
        this.state = STATE.NONE;
    }

    /**
     * Load scene
     *
     * @param {SceneManager} manager
     * @param {{enable?: boolean}} options
     * @memberof Scene
     */
    *load(manager, options) {
        if (!options) {
            options = {};
        }
        if (options.enable === undefined) {
            options.enable = true;
        }
        this.manager = manager;
        if (this.state === STATE.NONE) {
            const loader = new PIXI.loaders.Loader();
            yield this.setup(loader);
            loader.load();
            while (loader.loading) {
                yield;
            }
            this.resources = loader.resources;
            loader.destroy();
            this.state = STATE.LOADED;
        }
        if (this.state === STATE.LOADED) {
            yield this.init();
            this.state = STATE.INITIALIZED;
        }
        if (this.state === STATE.INITIALIZED && options.enable) {
            yield this.enter();
            this.state = STATE.READY;
        }
    }

    /**
     * Setup
     *
     * @param {PIXI.loaders.Loader} loader loader
     * @memberof Scene
     */
    setup(loader) {}

    /**
     * Init
     *
     * @memberof Scene
     */
    init() {
        this.root = new PIXI.Container();
    }

    /**
     * Enter
     *
     * @memberof Scene
     */
    enter() {
        this.root.position.set(
            this.manager.renderer.width / 2,
            this.manager.renderer.height / 2
        );
        this.manager.stage.addChild(this.root);
        this.manager.ticker.add(this.update, this);
    }

    /**
     * Update
     *
     * @param {number} dt deltaTime
     * @memberof Scene
     */
    update(dt) {}

    /**
     * Exit
     *
     * @memberof Scene
     */
    exit() {
        this.manager.ticker.remove(this.update, this);
        this.manager.stage.removeChild(this.root);
    }

    /**
     * Destroy
     *
     * @memberof Scene
     */
    destroy() {
        this.root.destroy(true);
        delete this.root;
    }

    /**
     * Release
     *
     * @memberof Scene
     */
    release() {
        for (const key in this.resources) {
            if (this.resources[key].textures) {
                let base;
                for (const txt in this.resources[key].textures) {
                    base = this.resources[key].textures[txt].baseTexture;
                    const texture = PIXI.Texture.removeFromCache(txt);
                    if (texture) {
                        texture.destroy(true);
                    }
                }
                PIXI.BaseTexture.removeFromCache(base);
            }
            if (this.resources[key].texture) {
                const texture = PIXI.Texture.removeFromCache(key);
                if (texture) {
                    texture.destroy(true);
                }
            }
        }
        delete this.resources;
    }

    /**
     * Unload scene(destroy root, cleanup assets, etc.)
     *
     * @memberof Scene
     */
    *unload() {
        if (this.state === STATE.READY) {
            yield this.exit();
            this.state = STATE.INITIALIZED;
        }
        if (this.state === STATE.INITIALIZED) {
            yield this.destroy();
            this.state = STATE.LOADED;
        }
        if (this.state === STATE.LOADED) {
            this.release();
            this.state = STATE.NONE;
        }
    }

}
