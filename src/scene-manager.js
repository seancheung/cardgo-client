import * as Promise from 'bluebird';
import Scene from './scene';
import { STATE } from './scene';
import Coroutine from './coroutine';

export const MODE = {
    SINGLE: 0,
    ADDTIVE: 1
};

export class SceneLoader {

    constructor(handler) {
        this._handler = handler;
    }

    enable() {
        if (this._handler) {
            this._handler();
            delete this._handler;
        }
    }

}

export default class SceneManager {

    /**
     * Creates an instance of SceneManager.
     * @param {PIXI.WebGLRenderer|PIXI.CanvasRenderer} renderer
     * @param {PIXI.ticker.Ticker} ticker
     * @param {PIXI.Container} stage
     * @memberof SceneManager
     */
    constructor(renderer, ticker, stage) {
        this.renderer = renderer;
        this.ticker = ticker;
        this.stage = stage;
        this.scenes = [];
    }

    /**
     * Scene count
     *
     * @readonly
     * @memberof SceneManager
     */
    get count() {
        return this.scenes.length;
    }

    /**
     * Loaded scenes
     *
     * @type {Scene[]}
     * @readonly
     * @memberof SceneManager
     */
    get loaded() {
        return this.scenes.filter(scene => scene.state >= STATE.LOADED);
    }

    /**
     * Get scene by index
     * 
     * @param {number} index
     * @returns {Scene}
     * @memberof SceneManager
     */
    getByIndex(index) {
        return this.scenes[index];
    }

    /**
     * Get scene by name
     * 
     * @param {string} name
     * @returns {Scene}
     * @memberof SceneManager
     */
    getByName(name) {
        return this.scenes.find(scene => scene.name === name);
    }

    /**
     * Load scene
     *
     * @param {Scene|string|number} scene
     * @param {{mode?: number, enable?: boolean}} [options]
     * @returns {Promise<SceneLoader>}
     * @memberof SceneManager
     */
    load(scene, options) {
        if (typeof scene === 'number') {
            scene = this.getByIndex(scene);
        } else if (typeof scene === 'string') {
            scene = this.getByName(scene);
        }
        if (!(scene instanceof Scene)) {
            return Promise.reject(new Error('scene not found or not valid'));
        }
        if (this.scenes.indexOf(scene) < 0) {
            return Promise.reject(new Error('scene not added'));
        }
        if (scene.state >= STATE.LOADED) {
            return Promise.reject(new Error('scene already loaded'));
        }
        if (!options) {
            options = {};
        }
        if (options.mode === undefined) {
            options.mode = MODE.SINGLE;
        }
        if (options.enable === undefined) {
            options.enable = true;
        }
        if (options.mode === MODE.SINGLE) {
            return Coroutine.promisify(
                scene.load(this, { enable: options.enable })
            )
                .then(() => {
                    if (options.enable) {
                        return Promise.map(
                            this.loaded.filter(s => s != scene),
                            s => Coroutine.promisify(s.unload())
                        );
                    }
                })
                .then(() => {
                    if (options.enable) {
                        return new SceneLoader();
                    }

                    return new SceneLoader(() => {
                        Coroutine.promisify(scene.load(this)).then(() =>
                            Promise.map(
                                this.loaded.filter(s => s != scene),
                                s => Coroutine.promisify(s.unload())
                            )
                        );
                    });
                });
        } else if (options.mode === MODE.ADDTIVE) {
            return Coroutine.promisify(
                scene.load(this, { enable: options.enable })
            ).then(() => {
                if (options.enable) {
                    return new SceneLoader();
                }

                return new SceneLoader(() => {
                    Coroutine.promisify(scene.load(this));
                });
            });
        }

        return Promise.reject(new Error('invalid scene load mode'));
    }

    /**
     * Unload an active scene. If no scene passed in, all active scenes will be unloaded
     *
     * @param {Scene|string|number} scene
     * @returns {Promise<void>}
     * @memberof SceneManager
     */
    unload(scene) {
        if (typeof scene === 'number') {
            scene = this.getByIndex(scene);
        } else if (typeof scene === 'string') {
            scene = this.getByName(scene);
        }
        if (!(scene instanceof Scene)) {
            return Promise.reject(new Error('scene not found or not valid'));
        }
        if (scene.state < STATE.LOADED) {
            return Promise.reject(new Error('scene not loaded'));
        }

        return Coroutine.promisify(scene.unload());
    }

    /**
     * Add scene
     *
     * @param {Scene} scene
     * @param {number} [index]
     * @memberof SceneManager
     */
    add(scene, index) {
        if (this.scenes.indexOf(scene) < 0) {
            scene.manager = this;
            if (typeof index !== 'number') {
                this.scenes.push(scene);
            } else {
                this.scenes.splice(index, 0, scene);
            }
        }
    }

    /**
     * Remove scene
     *
     * @param {Scene|string|number} scene
     * @memberof SceneManager
     */
    remove(scene) {
        if (typeof scene === 'number') {
            scene = this.getByIndex(scene);
        } else if (typeof scene === 'string') {
            scene = this.getByName(scene);
        }
        if (!(scene instanceof Scene)) {
            return Promise.reject(new Error('scene not found or not valid'));
        }
        const index = this.scenes.indexOf(scene);
        if (index < 0) {
            return Promise.reject(new Error('scene not added'));
        }
        this.scenes.splice(index, 1);
    }

}
