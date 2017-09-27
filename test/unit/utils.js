/**
 * GlobalOverrider - Utility that allows you to override properties on the global object.
 *                   See unit-entry.js for example usage.
 */
class GlobalOverrider {
  constructor() {
    this.originalGlobals = new Map();
    this.sandbox = sinon.sandbox.create();
  }

  /**
   * _override - Internal method to override properties on the global object.
   *             The first time a given key is overridden, we cache the original
   *             value in this.originalGlobals so that later it can be restored.
   *
   * @param  {string} key The identifier of the property
   * @param  {any} value The value to which the property should be reassigned
   */
  _override(key, value) {
    if (key === "Components") {
      // Components can be reassigned, but it will subsequently throw a deprecation
      // error in Firefox which will stop execution. Adding the assignment statement
      // to a try/catch block will prevent this from happening.
      try {
        global[key] = value;
      } catch (e) {} // eslint-disable-line no-empty
      return;
    }
    if (!this.originalGlobals.has(key)) {
      this.originalGlobals.set(key, global[key]);
    }
    global[key] = value;
  }

  /**
   * set - Override a given property, or all properties on an object
   *
   * @param  {string|object} key If a string, the identifier of the property
   *                             If an object, a number of properties and values to which they should be reassigned.
   * @param  {any} value The value to which the property should be reassigned
   * @return {type}       description
   */
  set(key, value) {
    if (!value && typeof key === "object") {
      const overrides = key;
      Object.keys(overrides).forEach(k => this._override(k, overrides[k]));
    } else {
      this._override(key, value);
    }
    return value;
  }

  /**
   * reset - Reset the global sandbox, so all state on spies, stubs etc. is cleared.
   *         You probably want to call this after each test.
   */
  reset() {
    this.sandbox.reset();
  }

  /**
   * restore - Restore the global sandbox and reset all overriden properties to
   *           their original values. You should call this after all tests have completed.
   */
  restore() {
    this.sandbox.restore();
    this.originalGlobals.forEach((value, key) => {
      global[key] = value;
    });
  }
}

/**
 * Slimmed down version of toolkit/modules/EventEmitter.jsm
 */
function EventEmitter() {}
EventEmitter.decorate = function(objectToDecorate) {
  let emitter = new EventEmitter();
  objectToDecorate.on = emitter.on.bind(emitter);
  objectToDecorate.off = emitter.off.bind(emitter);
  objectToDecorate.once = emitter.once.bind(emitter);
  objectToDecorate.emit = emitter.emit.bind(emitter);
};
EventEmitter.prototype = {
  on(event, listener) {
    if (!this._eventEmitterListeners) {
      this._eventEmitterListeners = new Map();
    }
    if (!this._eventEmitterListeners.has(event)) {
      this._eventEmitterListeners.set(event, []);
    }
    this._eventEmitterListeners.get(event).push(listener);
  },
  off(event, listener) {
    if (!this._eventEmitterListeners) {
      return;
    }
    let listeners = this._eventEmitterListeners.get(event);
    if (listeners) {
      this._eventEmitterListeners.set(event, listeners.filter(
        l => l !== listener && l._originalListener !== listener
      ));
    }
  },
  once(event, listener) {
    return new Promise(resolve => {
      let handler = (_, first, ...rest) => {
        this.off(event, handler);
        if (listener) {
          listener(event, first, ...rest);
        }
        resolve(first);
      };

      handler._originalListener = listener;
      this.on(event, handler);
    });
  },
  // All arguments to this method will be sent to listeners
  emit(event, ...args) {
    if (!this._eventEmitterListeners || !this._eventEmitterListeners.has(event)) {
      return;
    }
    let originalListeners = this._eventEmitterListeners.get(event);
    for (let listener of this._eventEmitterListeners.get(event)) {
      // If the object was destroyed during event emission, stop
      // emitting.
      if (!this._eventEmitterListeners) {
        break;
      }
      // If listeners were removed during emission, make sure the
      // event handler we're going to fire wasn't removed.
      if (originalListeners === this._eventEmitterListeners.get(event) ||
        this._eventEmitterListeners.get(event).some(l => l === listener)) {
        try {
          listener(event, ...args);
        } catch (ex) {
          // error with a listener
        }
      }
    }
  }
};

/**
 * Slightly modified EventManager from ExtensionCommon.jsm
 */
function EventManager(context, name, register) {
  this.context = context;
  this.name = name;
  this.register = register;
  this.unregister = new Map();
  this.inputHandling = false;
}
EventManager.prototype = {
  addListener(callback, ...args) {
    if (this.unregister.has(callback)) {
      return;
    }

    let shouldFire = () => {
      if (this.unregister.has(callback)) {
        return true;
      }
      return false;
    };

    let fire = {
      sync: (...arguments) => {
        if (shouldFire()) {
          callback(...arguments);
        }
      },
      async: (...arguments) =>
        Promise.resolve().then(() => {
          if (shouldFire()) {
            callback(...arguments);
          }
        })
    };

    let unregister = this.register(fire, ...args);
    this.unregister.set(callback, unregister);
  },

  removeListener(callback) {
    if (!this.unregister.has(callback)) {
      return;
    }

    let unregister = this.unregister.get(callback);
    this.unregister.delete(callback);
    try {
      unregister();
    } catch (e) {
      console.error(e);
    }
  },

  hasListener(callback) {
    return this.unregister.has(callback);
  },

  revoke() {
    for (let callback of this.unregister.keys()) {
      this.removeListener(callback);
    }
  },

  close() {
    this.revoke();
  },

  api() {
    return {
      addListener: (...args) => this.addListener(...args),
      removeListener: (...args) => this.removeListener(...args),
      hasListener: (...args) => this.hasListener(...args),
      setUserInput: this.inputHandling
    };
  }
};

module.exports = {GlobalOverrider, EventEmitter, EventManager};
