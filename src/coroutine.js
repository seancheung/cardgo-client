import * as Promise from 'bluebird';

const iterators = {};

export default class Coroutine {

    /**
     * Creates an instance of Coroutine.
     * @param {IterableIterator<any>} iterator
     * @memberof Coroutine
     */
    constructor(iterator) {
        if (!Coroutine.isIterable(iterator)) {
            throw new Error('invalid iterator');
        }
        this._iterator = iterator;
        this._paused = false;
    }

    static get iterators() {
        return iterators;
    }

    /**
     * Get the dispose state
     *
     * @readonly
     * @memberof Coroutine
     */
    get disposed() {
        return !this._iterator;
    }

    /**
     * Get the pause state
     *
     * @readonly
     * @memberof Coroutine
     */
    get paused() {
        return !!this._paused;
    }

    *[Symbol.iterator]() {
        if (this.disposed) {
            return;
        }
        try {
            if (this.paused) {
                yield;
            }
            for (const value of this._iterator) {
                this._current = value;
                if (Coroutine.is(value)) {
                    yield* value;
                } else {
                    yield value;
                }
            }
        } catch (err) {
            if (!(err instanceof CancellationError)) {
                if (this._catch) {
                    this._catch(err);
                }
                if (this._callback) {
                    this._callback(err);
                }
            }
            this._dispose();

            return;
        }
        if (this._done) {
            this._done(this._current);
        }
        if (this._callback) {
            this._callback(null, this._current);
        }
        this._dispose();
    }

    /**
     * Start the coroutine
     *
     * @returns {number}
     * @memberof Coroutine
     */
    start() {
        if (this.disposed) {
            throw new Error(
                'trying to start a disposed coroutine is not allowed'
            );
        }
        const id = Date.now();
        Coroutine.iterators[id] = this[Symbol.iterator]();

        return id;
    }

    /**
     * Stop the coroutine
     *
     * @memberof Coroutine
     */
    stop() {
        if (this.disposed) {
            throw new Error(
                'trying to stop a disposed coroutine is not allowed'
            );
        }
        this._dispose();
    }

    /**
     * Suspend the coroutine
     *
     * @memberof Coroutine
     */
    pause() {
        if (this.disposed) {
            throw new Error(
                'trying to pause a disposed coroutine is not allowed'
            );
        }
        this._paused = true;
    }

    /**
     * Resume the coroutine
     *
     * @memberof Coroutine
     */
    resume() {
        if (this.disposed) {
            throw new Error(
                'trying to resume a disposed coroutine is not allowed'
            );
        }
        this._paused = false;
    }

    _dispose() {
        if (!this.disposed) {
            delete this._iterator;
            if (this._finally) {
                this._finally();
            }
        }
    }

    /**
     * Set complete callback
     *
     * @param {(value?: any)=>void} callback
     * @returns {this}
     * @memberof Coroutine
     */
    done(callback) {
        if (typeof callback === 'function') {
            this._done = callback;
        }

        return this;
    }

    /**
     * Set error callback
     *
     * @param {(err: Error)=>void} callback
     * @returns {this}
     * @memberof Coroutine
     */
    catch(callback) {
        if (typeof callback === 'function') {
            this._catch = callback;
        }

        return this;
    }

    /**
     * Set end callback
     *
     * @param {()=>void} callback
     * @returns {this}
     * @memberof Coroutine
     */
    finally(callback) {
        if (typeof callback === 'function') {
            this._finally = callback;
        }

        return this;
    }

    /**
     * Set callback
     *
     * @param {(err?: Error, value?: any)=>void} callback
     * @returns {this}
     * @memberof Coroutine
     */
    asCallback(callback) {
        if (typeof callback === 'function') {
            this._callback = callback;
        }

        return this;
    }

    /**
    * Start a new coroutine
    *
    * @static
    * @param {IterableIterator<any>} iterator
    * @memberof Coroutine
    */
    static start(iterator) {
        return new Coroutine(iterator).start();
    }

    /**
     * Stop a coroutine by its id
     *
     * @static
     * @param {number} id
     * @memberof Coroutine
     */
    static stop(id) {
        if (id && Coroutine.iterators[id]) {
            Coroutine.iterators[id].throw(new CancellationError());
        }
    }

    /**
     * Check if the given object is a coroutine
     *
     * @static
     * @param {any} coroutine
     * @returns {boolean}
     * @memberof Coroutine
     */
    static is(coroutine) {
        return coroutine instanceof this;
    }

    /**
     * Check if the given object is iterable
     *
     * @static
     * @param {any} iterable
     * @returns {boolean}
     * @memberof Coroutine
     */
    static isIterable(iterable) {
        return iterable && typeof iterable[Symbol.iterator] === 'function';
    }

    /**
     * Create a coroutine within a promise and start it
     *
     * @static
     * @param {IterableIterator<any>} iterator
     * @returns {Promise<any>}
     * @memberof Coroutine
     */
    static promisify(iterator) {
        return new Promise((resolve, reject) => {
            if (!this.isIterable(iterator)) {
                reject(new Error('not a iterator'));
            } else {
                new this(iterator)
                    .done(resolve)
                    .catch(reject)
                    .start();
            }
        });
    }

    static tick() {
        Object.keys(this.iterators).forEach(id => {
            const iterator = this.iterators[id];
            if (iterator) {
                const res = iterator.next();
                if (res.done) {
                    delete this.iterators[id];
                }
            }
        });
    }

}

export class CancellationError extends Error {}

export class WaitForSeconds extends Coroutine {

    /**
     * Creates an instance of WaitForSeconds.
     * @param {number} seconds
     * @memberof WaitForSeconds
     */
    constructor(seconds) {
        let done = false;
        super(
            (function*() {
                setTimeout(() => (done = true), seconds * 1000);
                while (!done) {
                    yield;
                }
            })()
        );
    }

}

export class WaitForFrames extends Coroutine {

    /**
     * Creates an instance of WaitForFrames.
     * @param {number} [frames]
     * @memberof WaitForFrames
     */
    constructor(frames) {
        if (frames === undefined) {
            frames = 1;
        }
        super(
            (function*() {
                while (frames-- > 0) {
                    yield;
                }
            })()
        );
    }

}

export class WaitUntil extends Coroutine {

    /**
     * Creates an instance of WaitUntil.
     * @param {(args?: any[])=>boolean} func
     * @param {any[]} args
     * @memberof WaitUntil
     */
    constructor(func, ...args) {
        super(
            (function*() {
                while (!func(...args)) {
                    yield;
                }
            })()
        );
    }

}

export class WaitWhile extends Coroutine {

    /**
     * Creates an instance of WaitWhile.
     * @param {(args?: any[])=>boolean} func
     * @param {any[]} args
     * @memberof WaitUntil
     */
    constructor(func, ...args) {
        super(
            (function*() {
                while (func(...args)) {
                    yield;
                }
            })()
        );
    }

}
