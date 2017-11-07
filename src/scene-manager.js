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
            this._handler = null;
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
        this._active = [];
        this._current = null;
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
     * Current active scene
     *
     * @memberof SceneManager
     */
    get current() {
        return this._current;
    }

    set current(value) {
        if (this._current !== value && this._active.indexOf(value) >= 0) {
            this._current = value;
        }
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
     * Go to scene
     *
     * @param {Scene|string|number} scene
     * @returns {Promise<SceneLoader>}
     * @memberof SceneManager
     */
    goto(scene) {
        return this.load(scene, { mode: MODE.SINGLE });
    }

    /**
     * Load scene
     * 
     * @param {Scene|string|number} scene
     * @param {{mode?: number, enable?: boolean, active?: boolean}} [options]
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
        if (options.enable === undefined) {
            options.enable = true;
        }
        if (options.active === undefined) {
            options.active = true;
        }
        if (options.mode === undefined) {
            options.mode = MODE.SINGLE;
        }
        if (options.mode === MODE.SINGLE) {
            return Coroutine.promisify(
                scene.load(this, { enable: options.enable })
            )
                .then(() => {
                    if (options.enable) {
                        return this.unload();
                    }
                })
                .then(() => {
                    if (options.enable) {
                        this._active.push(scene);
                        if (options.active) {
                            this._current = scene;
                        }

                        return new SceneLoader();
                    }

                    return new SceneLoader(() => {
                        Coroutine.promisify(scene.load(this))
                            .then(() => this.unload())
                            .then(() => {
                                this._active.push(scene);
                                if (options.active) {
                                    this._current = scene;
                                }
                            });
                    });
                });
        } else if (options.mode === MODE.ADDTIVE) {
            return Coroutine.promisify(
                scene.load(this, { enable: options.enable })
            ).then(() => {
                if (options.enable) {
                    this._active.push(scene);
                    if (options.active) {
                        this._current = scene;
                    }

                    return new SceneLoader();
                }

                return new SceneLoader(() => {
                    Coroutine.promisify(scene.load(this)).then(() => {
                        this._active.push(scene);
                        if (options.active) {
                            this._current = scene;
                        }
                    });
                });
            });
        }

        return Promise.reject(new Error('invalid scene load mode'));
    }

    /**
     * Unload an active scene. If no scene passed in, all active scenes will be unloaded
     *
     * @param {string|number} [scene]
     * @returns {Promise<void>}
     * @memberof SceneManager
     */
    unload(scene) {
        if (scene === undefined) {
            return Promise.map(this._active, scene =>
                Coroutine.promisify(scene.unload())
            ).then(() => this._active.splice(0));
        }
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
        const index = this._active.indexOf(scene);
        if (index > 0) {
            return Coroutine.promisify(scene.unload()).then(() =>
                this._active.splice(index, 1)
            );
        }

        return Promise.resolve();
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
     * Create an empty scene and add to the manager
     * 
     * @param {any} name
     * @param {any} index
     * @returns {Scene}
     * @memberof SceneManager
     */
    create(name, index) {
        const scene = new Scene(name);
        this.add(scene, index);

        return scene;
    }

    /**
     * Merge source scene into target scene
     *
     * @param {Scene} src
     * @param {Scene} dest
     * @returns {Scene}
     * @memberof SceneManager
     */
    merge(src, dest) {
        src.root.children.forEach(child => child.setParent(dest.root));

        return dest;
    }

}
