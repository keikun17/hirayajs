;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
var Hiraya = {
  /** hiraya-core **/
  Class: require('./hiraya-core/class'),
  Emitter: require('./hiraya-core/emitter'),
  Collection: require('./hiraya-core/collection'),
  Stat: require('./hiraya-game/stat'),
  Stats: require('./hiraya-game/stats'),
  EntityTurnBased: require('./hiraya-game/entity-turnbased'),
  Entity: require('./hiraya-game/entity'),
  /** hiraya-game **/
  Game: require('./hiraya-game/game'),
  Tile: require('./hiraya-game/tile'),
  Level: require('./hiraya-game/level'),
  LevelTurnBased: require('./hiraya-game/level-turnbased')
  /** hiraya-game/display **/
};

if (typeof window === 'object') {
  window.Hiraya = Hiraya;
}

module.exports = Hiraya;

},{"./hiraya-core/class":2,"./hiraya-core/emitter":3,"./hiraya-core/collection":4,"./hiraya-game/stat":5,"./hiraya-game/stats":6,"./hiraya-game/entity-turnbased":7,"./hiraya-game/entity":8,"./hiraya-game/game":9,"./hiraya-game/tile":10,"./hiraya-game/level":11,"./hiraya-game/level-turnbased":12}],2:[function(require,module,exports){
/**
 * @module hiraya
 * @submodule hiraya-core
 */


/**
 * Flag to prevent the Class.proto.init from being invoked during initialization
 */
var start = true;

/**
 * Creates a shim for invoking a this.parent() command by wrapping it inside a closure
 */
function protoParent(prototype, name, method) {
  return function() {
    this.parent = prototype[name];
    return method.apply(this, arguments);
  };
}

/**
 * Extends an object's properties and assign them as prototypes in a Function
 */
function extendClass(BaseClass, properties) {
  var parent = BaseClass.prototype;
  start = false;
  var prototype = new BaseClass();
  start = true;
  var attribute;
  // iterate over the properties and copy them.
  for(var name in properties) {
    if (properties.hasOwnProperty(name)) {
      attribute = properties[name];
      prototype[name] = typeof parent[name] === 'function' && typeof properties[name] === 'function' ?
        protoParent(parent, name, attribute) :
        attribute;
    }
  }

  /**
   * `Hiraya.Class` is the heart of all Hiraya objects. It can be used for prototypal inheritance.
   *
   *     var Human = Hiraya.Class.extend({
   *        baseHealth: 100,
   *        baseAttack: 10,
   *        health: null,
   *        init: function() {
   *          this.health = this.baseHealth;
   *        },
   *        attack: function(enemy) {
   *          this.enemy.health -= this.baseAttack;
   *        }
   *     });
   *
   *     var Orc = Human.extend({
   *        baseHealth: 200,
   *        attack: function(enemy) {
   *          // class methods have super methods
   *          this.super(enemy);
   *          this.shout('waaagh!');
   *        },
   *        shout: function(message) {
   *          alert(message);
   *        }
   *     });
   *
   *     var human = Human.create();
   *     var Orc = Orc.create();
   *
   *     // You can also override certain properties on instantiation
   *     var superman = Human.create({
   *        baseHealth: 10000,
   *        baseAttack: 10000
   *     });
   * 
   * @class Class
   * @namespace Hiraya
   */
  function Class() {
    // use the init method to define your constructor's content.
    if (start && this.init && this.init.apply) {
      this.init.apply(this, arguments);
    }
  }

  Class.prototype = prototype;
  Class.prototype.constructor = Class;
  /**
   * Extends the base class
   * @method extend
   * @param {Object} attributes*
   * @static
   * @return Class
   */
  Class.extend = function(attributes) {
    var attributesArray = Array.prototype.slice.apply(arguments, arguments, 0);
    var attribs = {};
    for (var i=0; i < attributesArray.length; i++) {
      var attrib = attributesArray[i];
      for(var key in attrib) {
        if (attrib.hasOwnProperty(key)) {
          attribs[key] = attrib[key];
        }
      }
    };
    return extendClass(Class, attribs);
  };

  /**
   * Instatiates the class. You can optionally pass attributes to set as its default value.
   *
   * example:
   *
   *     var Car = Class.extend({
   *       accleration: 10,
   *       accelerate: function() {
   *         this.position += this.acceleration;
   *       }
   *     });
   *
   *     var Ferrari = Car.create({
   *       acceleration: 100
   *     });
   *
   * @method create
   * @param {Object} attributes
   * @static
   * @return Class
   */
  Class.create = function(attributes) {
    var ClassExtend = Class.extend(attributes);
    return new ClassExtend();
  };
  return Class;
}

var Class = extendClass(function(){}, {});

module.exports = Class;

},{}],13:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],14:[function(require,module,exports){
(function(process){if (!process.EventEmitter) process.EventEmitter = function () {};

var EventEmitter = exports.EventEmitter = process.EventEmitter;
var isArray = typeof Array.isArray === 'function'
    ? Array.isArray
    : function (xs) {
        return Object.prototype.toString.call(xs) === '[object Array]'
    }
;
function indexOf (xs, x) {
    if (xs.indexOf) return xs.indexOf(x);
    for (var i = 0; i < xs.length; i++) {
        if (x === xs[i]) return i;
    }
    return -1;
}

// By default EventEmitters will print a warning if more than
// 10 listeners are added to it. This is a useful default which
// helps finding memory leaks.
//
// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
var defaultMaxListeners = 10;
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!this._events) this._events = {};
  this._events.maxListeners = n;
};


EventEmitter.prototype.emit = function(type) {
  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events || !this._events.error ||
        (isArray(this._events.error) && !this._events.error.length))
    {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }
  }

  if (!this._events) return false;
  var handler = this._events[type];
  if (!handler) return false;

  if (typeof handler == 'function') {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        var args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
    return true;

  } else if (isArray(handler)) {
    var args = Array.prototype.slice.call(arguments, 1);

    var listeners = handler.slice();
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].apply(this, args);
    }
    return true;

  } else {
    return false;
  }
};

// EventEmitter is defined in src/node_events.cc
// EventEmitter.prototype.emit() is also defined there.
EventEmitter.prototype.addListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('addListener only takes instances of Function');
  }

  if (!this._events) this._events = {};

  // To avoid recursion in the case that type == "newListeners"! Before
  // adding it to the listeners, first emit "newListeners".
  this.emit('newListener', type, listener);

  if (!this._events[type]) {
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  } else if (isArray(this._events[type])) {

    // Check for listener leak
    if (!this._events[type].warned) {
      var m;
      if (this._events.maxListeners !== undefined) {
        m = this._events.maxListeners;
      } else {
        m = defaultMaxListeners;
      }

      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this._events[type].length);
        console.trace();
      }
    }

    // If we've already got an array, just append.
    this._events[type].push(listener);
  } else {
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  var self = this;
  self.on(type, function g() {
    self.removeListener(type, g);
    listener.apply(this, arguments);
  });

  return this;
};

EventEmitter.prototype.removeListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('removeListener only takes instances of Function');
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (!this._events || !this._events[type]) return this;

  var list = this._events[type];

  if (isArray(list)) {
    var i = indexOf(list, listener);
    if (i < 0) return this;
    list.splice(i, 1);
    if (list.length == 0)
      delete this._events[type];
  } else if (this._events[type] === listener) {
    delete this._events[type];
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  if (arguments.length === 0) {
    this._events = {};
    return this;
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (type && this._events && this._events[type]) this._events[type] = null;
  return this;
};

EventEmitter.prototype.listeners = function(type) {
  if (!this._events) this._events = {};
  if (!this._events[type]) this._events[type] = [];
  if (!isArray(this._events[type])) {
    this._events[type] = [this._events[type]];
  }
  return this._events[type];
};

})(require("__browserify_process"))
},{"__browserify_process":13}],3:[function(require,module,exports){
/**
 * @module hiraya
 * @submodule hiraya-core
 */


var Class = require('./class');
var EventEmitter = require('events').EventEmitter;

/**
 * `Hiraya.Emitter` handles event-based callbacks.
 * For example if you wish to create an event manager that dispatches data
 * everytime a certain topic is called:
 *
 *      Game.topicEmitter = Hiraya.Emitter.create({
 *        newTopic: function(topic) {
 *          this.emit('newTopic', topic);
 *        }
 *      });
 *
 *      Game.topicEmitter.on('newTopic', function(topic) {
 *        console.log('Got a new topic:', topic);
 *      });
 *
 *      Game.topicEmitter.newTopic('entityCreate');
 *
 * @class Emitter
 * @extends Hiraya.Class
 * @namespace Hiraya
 */
var Emitter = Class.extend({
  init: function() {
  },
  /**
   * Adds a listener to the emitter object
   *
   * @method on
   * @param {String} topic 
   * @param {Function} callback 
   * @chainable
   */
  on: function() {
    EventEmitter.prototype.on.apply(this, arguments);
    return this;
  },

  /**
   * Removes a listener from the emitter object
   *
   * @method off
   * @param {String} topic
   * @param {Function} callback
   * @chainable
   */
  off: function(topic, callback) {
    EventEmitter.prototype.removeListener.apply(this, arguments);
    return this;
  },


  /**
   * Removes all listeners or the topic specified
   *
   * @method offAll
   * @param {String} [topic]
   * @chainable
   */
  offAll: function() {
    EventEmitter.prototype.removeAllListeners.apply(this, arguments);
    return this;
  },

  /**
   * Emits a topic contained in the emitter object
   *
   * @method emit
   * @param {String} topic
   * @param {Object|String} data*
   * @chainable
   */
  emit: function() {
    EventEmitter.prototype.emit.apply(this, arguments);
    return this;
  },

  /**
   * Subscribes to a topic only once
   *
   * @method once
   * @param {String} topic
   * @chainable
   */
  once: function() {
    EventEmitter.prototype.once.apply(this, arguments);
    return this;
  },


  /**
   * Remove an event listener
   *
   * @methoda removeListener
   * @param {String} topic
   * @param {Function} callback
   * @private
   * @chainable
   */
  removeListener: function() {
    EventEmitter.prototype.removeListener.apply(this, arguments);
    return this;
  }
});


module.exports = Emitter;

},{"events":14,"./class":2}],4:[function(require,module,exports){
/**
 * @module hiraya
 * @submodule hiraya-core
 */


var Emitter = require('./emitter');


/**
 * `Hiraya.Collection` handles list of objects that can be stored and retrieved.
 *
 * @class Collection
 * @extends Hiraya.Emitter
 * @namespace Hiraya
 */
var Collection = Emitter.extend({
  /**
   * @property {Array} _list
   * @private
   */
  _list: null,

  /**
   * Total elements in the collection. This gets updated whenever a new child is added or removed
   *
   *     var collection = Hiraya.Collection.create();
   *     collection.length; // -> 0
   *     collection.add({ name: 'James' });
   *     collection.length; // -> 1
   *
   * @property length
   * @type {Number}
   * @default 0
   */
  length: null,

  init: function() {
    this._list = [];
    this._updateLength();
  },

  /**
   * Updates the `length` property.
   *
   * @method _updateLength
   * @private
   */
  _updateLength: function() {
    this.length = this._list.length;
  },

  /**
   * Adds an element to the list
   * @method add
   * @param {Object} obj
   * @chainable
   */
  add: function(obj) {
    this._list.push(obj);
    this._updateLength();
    return this;
  },

  /**
   * Removes an element from the list
   *
   * @method remove
   * @param {Object} obj
   * @chainable
   */
  remove: function(obj) {
    this._list.splice(this._list.indexOf(obj), 1);
    this._updateLength();
    return this;
  },

  /**
   * Returns an element from the array by its index value
   *
   * @method at
   * @param {Number} index
   * @returns Object
   */
  at: function(index) {
    return this._list[index];
  },


  /**
   * Iterates to each element in the collection. If the callback parameter returns false, it will halt the looping operation.
   *
   * @method each
   * @param {Function} fn
   */
  each: function(fn) {
    for (var i=0, length = this._list.length; i < length; i++) {
      if (fn(this._list[i]) === false) {
        break;
      }
    };
  }
});

module.exports = Collection;

},{"./emitter":3}],5:[function(require,module,exports){
/**
 * @module hiraya
 * @submodule hiraya-game
 */

var Class = require('../hiraya-core/class');

/**
 * `Hiraya.Stat` manages the values for an RPG attribute.
 * It handles things like making sure the value doesn't exceed its maximum capacity.
 *
 * It also provides some useful API for value manipulation.
 *
 * @class Stat
 * @extends Hiraya.Class
 * @namespace Hiraya
 */
var Stat = Class.extend({
  /**
   * The current value of the stat. To change this,
   * use the `stat.setValue` command.
   *
   * @property value
   * @type {Number}
   * @default 0
   */
  value: null,
  
  /**
   * The maximum value for the stat.
   *
   * @property max
   * @type {Number}
   * @default 0
   */
  max: null,

  /**
   * Name of the stat.
   *
   * @property name
   * @type {String}
   */
  name: null,
  init: function() {
    this.reset(Math.max(this.value, this.max));
  },

  /**
   * Sets the value of the stat. Ensures that it doesn't go beyond zero.
   *
   * @method setValue
   * @param {Number} value
   * @chainable
   */
  setValue: function(value) {
    this.value = Math.max(0, value);
    this.value = Math.min(this.value, this.max);
    return this;
  },

  /**
   * Sets the value of the max value. Ensures that it doesn't go beyond zero.
   *
   * @method setMax
   * @param {Number} value
   * @chainable
   */
  setMax: function(value) {
    this.max = Math.max(0, value);
    return this;
  },

  /**
   * Empties the value of the stat.
   *
   * @method empty
   * @chainable
   */
  empty: function() {
    this.value = 0;
    return this;
  },

  /**
   * Increases the value of the stat. Increments the `.value` property by 1 if the value argument is undefined.
   *
   * @method add
   * @param {Number} [value=1]
   * @chainable
   */
  add: function(value) {
    this.setValue(this.value + (typeof value === 'number' ? value : 1));
    return this;
  },

  /**
   * Reduces the value by one. Decrements the `.value` property by 1 if the value argument is undefined.
   *
   * @method reduce
   * @param {Number} [value=1]
   * @chainable
   */
  reduce: function(value) {
    this.setValue(this.value - (typeof value === 'number' ? value : 1));
    return this;
  },

  /**
   * Resets the value according to its max value. Max value can be optionally
   * set by providing a value argument.
   *
   * @method reset
   * @param {Number} [value=null]
   * @chainable
   */
  reset: function(value) {
    if (typeof value === 'number') {
      this.setMax(value);
    }
    this.value = this.max;
    return this;
  },

  /**
   * Checks if the stat is full
   *
   * @method isMax
   * @returns Boolean
   */
  isMax: function() {
    return this.value === this.max;
  },

  /**
   * Tells if the stat value is 0.
   *
   * @method isEmpty 
   * @returns Boolean
   */
  isEmpty: function() {
    return this.value === 0;
  }
});

module.exports = Stat;

},{"../hiraya-core/class":2}],6:[function(require,module,exports){
/**
 * @module hiraya
 * @submodule hiraya-game
 */

var Class = require('../hiraya-core/class');
var Stat = require('./stat');

/**
 * `Hiraya.Stats` handles all stat related object. This is quite useful as a container
 * for all attributes for a character to prevent clutter in the attributes of a `Hiraya.Entity` instance.
 *
 * Although it is used primarily for RPG stats, you are free to use it elsewhere.
 *
 *     var stats = Hiraya.Stats.create();
 *     stats
 *       .set('health', 100)
 *       .set('mana', 100);
 *
 * @class Stats
 * @extends Hiraya.Class
 * @namespace Hiraya
 */
var Stats = Class.extend({
  /**
   * Default stat object returned in the `.get` method. Has a value of 1 and max value of 1.
   *
   * @property none
   * @type {Stat}
   */
  none: null,
  init: function() {
    this.set('none', 0, 0);
  },

  /**
   * Sets or creates the value of a stat attribute. You can optionally set the max value as well
   *
   * @method set
   * @param {String} name
   * @param {Number} value
   * @param {Number} [max=value]
   * @chainable
   */
  set: function(name, value, max) {
    var stat = this[name];
    var maxValue = typeof max === 'number' ? max : value;
    if (stat) {
      stat.setValue(value);
      stat.setMax(maxValue);
    } else {
      this[name] = Stat.create({
        name: name,
        value: value,
        max: maxValue
      });
    }
    return this;
  },

  /**
   * Returns a stat attribute by name. Returns an empty stat object if the stat name doesn't exist.
   *
   *     var stats = Hiraya.Stats.create();
   *     stats
   *       .set('health', 100)
   *       .set('mana', 100);
   *     stats.get('health').value; // -> 100
   *     stats.get('noneExistingStatName').value; // -> 0
   *
   *
   * @method get
   * @param {String} name
   * @returns Hiraya.Stat
   */
  get: function(name) {
    return this[name] ? this[name] : this['none'];
  }
});

module.exports = Stats;

},{"../hiraya-core/class":2,"./stat":5}],7:[function(require,module,exports){
var Entity = require('./entity');

var EntityTurnBased = Entity.extend({
  init: function() {
    this.parent();
    this.stats.set('turn', 0, 100);
    this.stats.set('turnspeed', 10);
  }
});

module.exports = EntityTurnBased;

},{"./entity":8}],8:[function(require,module,exports){
/**
 * @module hiraya
 * @submodule hiraya-game
 */


var GetterSetter = require('../hiraya-core/getter-setter');
var Stats = require('./stats');

/**
 * A basic game entity that has basic API like stats, attack and damage commands.
 *
 * @class Entity
 * @extends Hiraya.GetterSetter
 * @namespace Hiraya
 */
var Entity = GetterSetter.extend({
  /**
   * The id of the entity. Can be set uniquely or use the default Entity class ID
   *
   * @property id
   * @type {Number}
   */
  id: null,
  init: function() {
    if (this.id === undefined) {
      this.id = Entity.id++;
    }
    this.stats = Stats.create();
    this.stats
      .set('health', 100)
      .set('attack', 100);
    this.parent();
  },

  /**
   * Attacks an enemy based on its attack stat value
   *
   * @method attack
   * @param {Entity} enemy
   * @chainable
   */
  attack: function(enemy) {
    enemy.damage(this.stats.attack.value);
    return this;
  },

  /**
   * Reduces health by 1
   *
   * @method damage
   * @param {Number} damage
   * @chainable
   */
  damage: function(damage) {
    this.stats.health.reduce(damage);
    return this;
  },

  /**
   * Set the entity's attributes
   *
   * @method setStats
   * @param {Object} attributes
   */
  setStats: function(attributes) {
    for(var key in attributes) {
      if (attributes.hasOwnProperty(key)) {
        this[key] = Stat.create({ max: attributes[key] });
      }
    }
  }
});

/**
 * An id counter for the Entity class
 *
 * @property id
 * @static
 * @type {Number}
 */
Entity.id = 0;

module.exports = Entity;

},{"../hiraya-core/getter-setter":15,"./stats":6}],9:[function(require,module,exports){
/**
 * @module hiraya
 * @submodule hiraya-game
 */



var Emitter = require('../hiraya-core/emitter');

/**
 * `Hiraya.Game` is the entry point of the framework. Instantiating this will serve as your namespace,
 * as well as reference to instantiated objects that the Hiraya framework provides.
 *
 * @class Game
 * @extends Hiraya.Class
 * @namespace Hiraya
 */
var Game = Emitter.extend({
  /**
   * The `ready` event fires when the window is ready and all the assets are loaded
   *
   * @event ready
   */
  ready: function() {
  }
});

module.exports = Game;

},{"../hiraya-core/emitter":3}],10:[function(require,module,exports){
/**
 * @module hiraya
 * @submodule hiraya-game
 */


var Class = require('../hiraya-core/class');

/**
 * A tile for a level with tiles
 *
 * @class Tile
 * @extends Hiraya.Class
 * @namespace Hiraya
 */
var Tile = Class.extend({

  /**
   * x-axis coordinate
   *
   * @property x
   * @type {Number}
   */
  x: null,

  /**
   * y-axis coordinate
   *
   * @property y
   * @type {Number}
   */
  y: null,

  z: null,

  /**
   * Determining if the tile is passable. Used in the A-star algorithm.
   *
   * @property wall
   * @type {Boolean}
   * @default false
   */
  wall: null,

  /**
   * List of entities occupying this tile
   *
   * @property entities
   * @type {Array}
   */
  entities: null,

  /**
   * Returns the score of the tile used in the a-star algorithm.
   *
   * @method val
   * @returns {Number} score
   */
  val: function() {
    return this.entities.length || this.wall ? 1000 : 1;
  },

  init: function() {
    this.entities = [];
  },

  /**
   * Returns a simplified JSON format of this tile that returns the x, y and z property
   *
   * @method json
   * @returns {Object} json
   */
  json: function() {
    return {
      x: this.x,
      y: this.y,
      z: this.z
    }
  },

  /**
   * Instructs the tile to let the entity occupy it.
   *
   * @method occupy
   * @param {Entity} entity
   */
  occupy: function(entity) {
    if (!this.has(entity)) {
      this.entities.push(entity);
    }
  },

  /**
   * Checks if the entitiy exists in this tile
   *
   * @method has
   * @param {Entity} entity
   * @returns Boolean 
   */
  has: function(entity) {
    return this.entities.indexOf(entity) > -1;
  },

  /**
   * Removes the entity from the tile
   *
   * @method vacate
   * @param {Entity} entity
   */
  vacate: function(entity) {
    this.entities.splice(this.entities.indexOf(entity), 1);
  },

  /**
   * Tells if the tile is occupied by entities.
   *
   * @method isOccupied
   * @returns Boolean
   */
  isOccupied: function() {
    return this.entities.length > 0;
  }
});

module.exports = Tile;

},{"../hiraya-core/class":2}],11:[function(require,module,exports){
/**
 * @module hiraya
 * @submodule hiraya-game
 */


var Emitter = require('../hiraya-core/emitter');
var Collection = require('../hiraya-core/collection');
var Entity = require('./entity');

/**
 * `Hiraya.Level` manages the game logic and entity interaction.
 *
 * ### Events
 *
 * - `addedEntity`
 *
 * @class Level
 * @extends Hiraya.Class
 * @namespace Hiraya
 */
var Level = Emitter.extend({
  /**
   * @property entities
   * @type {Array}
   */
  entities: null,

  init: function() {
    this.entities = Collection.create();
    this.parent();
  },

  /**
   * Adds an entity into the collection based on attributes.
   *
   * Following is an example format:
   *
   *     level.addEntity({
   *       name: 'Swordsman',
   *       stats: {
   *         health: [500, 1000] // value, max
   *         attack: [100] // value, max
   *       }
   *     })
   *
   * @method addEntity
   * @param {Object} attributes
   * @chainable
   */
  addEntity: function(attributes) {
    // attributes.stats gets overwritten in library
    var entity = this.createEntity(attributes);
    var stats = attributes.stats;
    for (var key in stats) {
      if (stats.hasOwnProperty(key)) {
        var stat = stats[key];
        entity.stats.set(key, stat[0], stat[1]);
      }
    }
    this.entities.add(entity);
    this.addedEntity(entity);
    return this;
  },

  /**
   * Creates a `Hiraya.Entity` from a class. Use this to override the classname you wish to use.
   *
   * @method createEntity
   * @param {Object} attributes
   * @returns Hiraya.Entity
   */
  createEntity: function(attributes) {
    return Entity.create(attributes);
  },

  /**
   * When an entity is added.
   *
   * @event addedEntity
   * @param {Entity} entity
   */
  addedEntity: function(entity) {
  }

});

module.exports = Level;

},{"../hiraya-core/emitter":3,"../hiraya-core/collection":4,"./entity":8}],12:[function(require,module,exports){
/**
 * @module hiraya
 * @submodule hiraya-game
 */


var Level = require('./level');
var EntityTurnBased = require('./entity-turnbased');

/**
 * `Hiraya.LevelTurnBased` manages entities and game logic for turn-based games.
 *
 * ### Events
 *
 * - `gotTurn`
 * - `addedEntity`
 * - `hasWinner`
 *
 * @class LevelTurnBased
 * @extends Hiraya.Level
 * @namespace Hiraya
 */
var LevelTurnBased = Level.extend({
  /**
   * Creates a `Hiraya.EntityTurnBased` class. This overrides the original method in the `Hiraya.Level` class.
   *
   * @method createEntity
   * @param {Object} attributes
   * @returns Hiraya.EntityTurnBased
   */
  createEntity: function(attributes) {
    return EntityTurnBased.create(attributes);
  },

  /**
   * Determines how fast the tick for the turn calculation will be. Internal use only.
   *
   * @property _tickSpeed
   * @type {Number}
   * @private
   * @default 1
   */
  _tickSpeed: 1,

  /**
   * A timeout identifier for the tick operation.
   *
   * @property _turnTimeout
   * @private
   * @type {Number}
   */
  _turnTimeout: null,

  /**
   * Finds the next entity to take its turn.
   *
   * @method getTurn
   */
  getTurn: function() {
    var entity, _this = this;
    var tick = function() {
      entity = _this._getEntityTurn();
      if (!entity) {
        setTimeout(function() {
          tick();
        }, _this._tickSpeed);
      } else {
        entity.stats.turn.empty();
        _this.gotTurn(entity);
      }
    }
    tick();
  },

  /**
   * Invoked when an entity is taking its turn
   *
   * @event gotTurn
   * @param {Hiraya.EntityTurnBased} entityTurnBased
   */
  gotTurn: function(entityTurnBased) {
  },

  /**
   * Increases the entities' turn stat by 1 and returns an entity if it has reached its max turn stat value
   *
   * @method _getEntityTurn
   * @private
   * @returns Hiraya.EntityTurnBased
   */
  _getEntityTurn: function() {
    var total = this.entities.length;
    var entity;
    var result;
    for(var i=0; i<total; i++) {
      entity = this.entities.at(i);
      entity.stats.turn.add(entity.stats.get('turnspeed').value);
      if (entity.stats.turn.isMax()) {
        result = entity;
        break;
      }
    }
    return result;
  },

  /**
   * Checks to see if there is already a winning entity in the game.
   *
   * @method evaluateEntities
   * @returns null
   */
  evaluateEntities: function() {
    var enabled = [];
    var disabled = [];
    this.entities.each(function(entity) {
      if (entity.stats.health.isEmpty()) {
        disabled.push(entity);
      } else {
        enabled.push(entity);
      }
    });
    if (enabled.length <= 1) {
      this.hasWinner(enabled[0]);
    }
  },

  /**
   * Fires when a winner has been announced
   *
   * @event hasWinner
   * @param {entity} Hiraya.EntityTurnBased
   * @returns null
   */
  hasWinner: function(entity) {
  }
});


module.exports = LevelTurnBased;

},{"./level":11,"./entity-turnbased":7}],15:[function(require,module,exports){
/**
 * @module hiraya
 * @submodule hiraya-core
 */

var Emitter = require('./emitter');

/**
 * `Hiraya.GetterSetter` enables a setter and getter API which also dispatches
 * an event whenever a property has changed.
 *
 *     var cat = Hiraya.GetterSetter.create();
 *     cat.on('health', function(hp) {
 *       console.log('health has changed to',  hp);
 *     };)
 *     cat.set('hp', 10); // health has changed to 10
 *
 * @class GetterSetter
 * @extends Hiraya.Emitter
 * @namespace Hiraya
 */
var GetterSetter = Emitter.extend({
  set: function(key, value) {
    this[key] = value;
    this.emit(key, value);
  },
  get: function(key) {
    return this.hasOwnProperty(key) ? this[key] : null;
  }
});

module.exports = GetterSetter;

},{"./emitter":3}]},{},[1])
;