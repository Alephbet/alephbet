(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.AlephBet = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//     uuid.js
//
//     Copyright (c) 2010-2012 Robert Kieffer
//     MIT License - http://opensource.org/licenses/mit-license.php

(function() {
  var _global = this;

  // Unique ID creation requires a high quality random # generator.  We feature
  // detect to determine the best RNG source, normalizing to a function that
  // returns 128-bits of randomness, since that's what's usually required
  var _rng;

  // Node.js crypto-based RNG - http://nodejs.org/docs/v0.6.2/api/crypto.html
  //
  // Moderately fast, high quality
  if (typeof(_global.require) == 'function') {
    try {
      var _rb = _global.require('crypto').randomBytes;
      _rng = _rb && function() {return _rb(16);};
    } catch(e) {}
  }

  if (!_rng && _global.crypto && crypto.getRandomValues) {
    // WHATWG crypto-based RNG - http://wiki.whatwg.org/wiki/Crypto
    //
    // Moderately fast, high quality
    var _rnds8 = new Uint8Array(16);
    _rng = function whatwgRNG() {
      crypto.getRandomValues(_rnds8);
      return _rnds8;
    };
  }

  if (!_rng) {
    // Math.random()-based (RNG)
    //
    // If all else fails, use Math.random().  It's fast, but is of unspecified
    // quality.
    var  _rnds = new Array(16);
    _rng = function() {
      for (var i = 0, r; i < 16; i++) {
        if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
        _rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
      }

      return _rnds;
    };
  }

  // Buffer class to use
  var BufferClass = typeof(_global.Buffer) == 'function' ? _global.Buffer : Array;

  // Maps for number <-> hex string conversion
  var _byteToHex = [];
  var _hexToByte = {};
  for (var i = 0; i < 256; i++) {
    _byteToHex[i] = (i + 0x100).toString(16).substr(1);
    _hexToByte[_byteToHex[i]] = i;
  }

  // **`parse()` - Parse a UUID into it's component bytes**
  function parse(s, buf, offset) {
    var i = (buf && offset) || 0, ii = 0;

    buf = buf || [];
    s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
      if (ii < 16) { // Don't overflow!
        buf[i + ii++] = _hexToByte[oct];
      }
    });

    // Zero out remaining bytes if string was short
    while (ii < 16) {
      buf[i + ii++] = 0;
    }

    return buf;
  }

  // **`unparse()` - Convert UUID byte array (ala parse()) into a string**
  function unparse(buf, offset) {
    var i = offset || 0, bth = _byteToHex;
    return  bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]];
  }

  // **`v1()` - Generate time-based UUID**
  //
  // Inspired by https://github.com/LiosK/UUID.js
  // and http://docs.python.org/library/uuid.html

  // random #'s we need to init node and clockseq
  var _seedBytes = _rng();

  // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
  var _nodeId = [
    _seedBytes[0] | 0x01,
    _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]
  ];

  // Per 4.2.2, randomize (14 bit) clockseq
  var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;

  // Previous uuid creation time
  var _lastMSecs = 0, _lastNSecs = 0;

  // See https://github.com/broofa/node-uuid for API details
  function v1(options, buf, offset) {
    var i = buf && offset || 0;
    var b = buf || [];

    options = options || {};

    var clockseq = options.clockseq != null ? options.clockseq : _clockseq;

    // UUID timestamps are 100 nano-second units since the Gregorian epoch,
    // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
    // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
    // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
    var msecs = options.msecs != null ? options.msecs : new Date().getTime();

    // Per 4.2.1.2, use count of uuid's generated during the current clock
    // cycle to simulate higher resolution clock
    var nsecs = options.nsecs != null ? options.nsecs : _lastNSecs + 1;

    // Time since last uuid creation (in msecs)
    var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

    // Per 4.2.1.2, Bump clockseq on clock regression
    if (dt < 0 && options.clockseq == null) {
      clockseq = clockseq + 1 & 0x3fff;
    }

    // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
    // time interval
    if ((dt < 0 || msecs > _lastMSecs) && options.nsecs == null) {
      nsecs = 0;
    }

    // Per 4.2.1.2 Throw error if too many uuids are requested
    if (nsecs >= 10000) {
      throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
    }

    _lastMSecs = msecs;
    _lastNSecs = nsecs;
    _clockseq = clockseq;

    // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
    msecs += 12219292800000;

    // `time_low`
    var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
    b[i++] = tl >>> 24 & 0xff;
    b[i++] = tl >>> 16 & 0xff;
    b[i++] = tl >>> 8 & 0xff;
    b[i++] = tl & 0xff;

    // `time_mid`
    var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
    b[i++] = tmh >>> 8 & 0xff;
    b[i++] = tmh & 0xff;

    // `time_high_and_version`
    b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
    b[i++] = tmh >>> 16 & 0xff;

    // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
    b[i++] = clockseq >>> 8 | 0x80;

    // `clock_seq_low`
    b[i++] = clockseq & 0xff;

    // `node`
    var node = options.node || _nodeId;
    for (var n = 0; n < 6; n++) {
      b[i + n] = node[n];
    }

    return buf ? buf : unparse(b);
  }

  // **`v4()` - Generate random UUID**

  // See https://github.com/broofa/node-uuid for API details
  function v4(options, buf, offset) {
    // Deprecated - 'format' argument, as supported in v1.2
    var i = buf && offset || 0;

    if (typeof(options) == 'string') {
      buf = options == 'binary' ? new BufferClass(16) : null;
      options = null;
    }
    options = options || {};

    var rnds = options.random || (options.rng || _rng)();

    // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;

    // Copy bytes to buffer, if provided
    if (buf) {
      for (var ii = 0; ii < 16; ii++) {
        buf[i + ii] = rnds[ii];
      }
    }

    return buf || unparse(rnds);
  }

  // Export public API
  var uuid = v4;
  uuid.v1 = v1;
  uuid.v4 = v4;
  uuid.parse = parse;
  uuid.unparse = unparse;
  uuid.BufferClass = BufferClass;

  if (typeof define === 'function' && define.amd) {
    // Publish as AMD module
    define(function() {return uuid;});
  } else if (typeof(module) != 'undefined' && module.exports) {
    // Publish as node.js module
    module.exports = uuid;
  } else {
    // Publish as global (in browsers)
    var _previousRoot = _global.uuid;

    // **`noConflict()` - (browser only) to reset global 'uuid' var**
    uuid.noConflict = function() {
      _global.uuid = _previousRoot;
      return uuid;
    };

    _global.uuid = uuid;
  }
}).call(this);

},{}],2:[function(require,module,exports){
(function (global){
"use strict"
// Module export pattern from
// https://github.com/umdjs/umd/blob/master/returnExports.js
;(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.store = factory();
  }
}(this, function () {
	
	// Store.js
	var store = {},
		win = (typeof window != 'undefined' ? window : global),
		doc = win.document,
		localStorageName = 'localStorage',
		scriptTag = 'script',
		storage

	store.disabled = false
	store.version = '1.3.20'
	store.set = function(key, value) {}
	store.get = function(key, defaultVal) {}
	store.has = function(key) { return store.get(key) !== undefined }
	store.remove = function(key) {}
	store.clear = function() {}
	store.transact = function(key, defaultVal, transactionFn) {
		if (transactionFn == null) {
			transactionFn = defaultVal
			defaultVal = null
		}
		if (defaultVal == null) {
			defaultVal = {}
		}
		var val = store.get(key, defaultVal)
		transactionFn(val)
		store.set(key, val)
	}
	store.getAll = function() {}
	store.forEach = function() {}

	store.serialize = function(value) {
		return JSON.stringify(value)
	}
	store.deserialize = function(value) {
		if (typeof value != 'string') { return undefined }
		try { return JSON.parse(value) }
		catch(e) { return value || undefined }
	}

	// Functions to encapsulate questionable FireFox 3.6.13 behavior
	// when about.config::dom.storage.enabled === false
	// See https://github.com/marcuswestin/store.js/issues#issue/13
	function isLocalStorageNameSupported() {
		try { return (localStorageName in win && win[localStorageName]) }
		catch(err) { return false }
	}

	if (isLocalStorageNameSupported()) {
		storage = win[localStorageName]
		store.set = function(key, val) {
			if (val === undefined) { return store.remove(key) }
			storage.setItem(key, store.serialize(val))
			return val
		}
		store.get = function(key, defaultVal) {
			var val = store.deserialize(storage.getItem(key))
			return (val === undefined ? defaultVal : val)
		}
		store.remove = function(key) { storage.removeItem(key) }
		store.clear = function() { storage.clear() }
		store.getAll = function() {
			var ret = {}
			store.forEach(function(key, val) {
				ret[key] = val
			})
			return ret
		}
		store.forEach = function(callback) {
			for (var i=0; i<storage.length; i++) {
				var key = storage.key(i)
				callback(key, store.get(key))
			}
		}
	} else if (doc && doc.documentElement.addBehavior) {
		var storageOwner,
			storageContainer
		// Since #userData storage applies only to specific paths, we need to
		// somehow link our data to a specific path.  We choose /favicon.ico
		// as a pretty safe option, since all browsers already make a request to
		// this URL anyway and being a 404 will not hurt us here.  We wrap an
		// iframe pointing to the favicon in an ActiveXObject(htmlfile) object
		// (see: http://msdn.microsoft.com/en-us/library/aa752574(v=VS.85).aspx)
		// since the iframe access rules appear to allow direct access and
		// manipulation of the document element, even for a 404 page.  This
		// document can be used instead of the current document (which would
		// have been limited to the current path) to perform #userData storage.
		try {
			storageContainer = new ActiveXObject('htmlfile')
			storageContainer.open()
			storageContainer.write('<'+scriptTag+'>document.w=window</'+scriptTag+'><iframe src="/favicon.ico"></iframe>')
			storageContainer.close()
			storageOwner = storageContainer.w.frames[0].document
			storage = storageOwner.createElement('div')
		} catch(e) {
			// somehow ActiveXObject instantiation failed (perhaps some special
			// security settings or otherwse), fall back to per-path storage
			storage = doc.createElement('div')
			storageOwner = doc.body
		}
		var withIEStorage = function(storeFunction) {
			return function() {
				var args = Array.prototype.slice.call(arguments, 0)
				args.unshift(storage)
				// See http://msdn.microsoft.com/en-us/library/ms531081(v=VS.85).aspx
				// and http://msdn.microsoft.com/en-us/library/ms531424(v=VS.85).aspx
				storageOwner.appendChild(storage)
				storage.addBehavior('#default#userData')
				storage.load(localStorageName)
				var result = storeFunction.apply(store, args)
				storageOwner.removeChild(storage)
				return result
			}
		}

		// In IE7, keys cannot start with a digit or contain certain chars.
		// See https://github.com/marcuswestin/store.js/issues/40
		// See https://github.com/marcuswestin/store.js/issues/83
		var forbiddenCharsRegex = new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]", "g")
		var ieKeyFix = function(key) {
			return key.replace(/^d/, '___$&').replace(forbiddenCharsRegex, '___')
		}
		store.set = withIEStorage(function(storage, key, val) {
			key = ieKeyFix(key)
			if (val === undefined) { return store.remove(key) }
			storage.setAttribute(key, store.serialize(val))
			storage.save(localStorageName)
			return val
		})
		store.get = withIEStorage(function(storage, key, defaultVal) {
			key = ieKeyFix(key)
			var val = store.deserialize(storage.getAttribute(key))
			return (val === undefined ? defaultVal : val)
		})
		store.remove = withIEStorage(function(storage, key) {
			key = ieKeyFix(key)
			storage.removeAttribute(key)
			storage.save(localStorageName)
		})
		store.clear = withIEStorage(function(storage) {
			var attributes = storage.XMLDocument.documentElement.attributes
			storage.load(localStorageName)
			for (var i=attributes.length-1; i>=0; i--) {
				storage.removeAttribute(attributes[i].name)
			}
			storage.save(localStorageName)
		})
		store.getAll = function(storage) {
			var ret = {}
			store.forEach(function(key, val) {
				ret[key] = val
			})
			return ret
		}
		store.forEach = withIEStorage(function(storage, callback) {
			var attributes = storage.XMLDocument.documentElement.attributes
			for (var i=0, attr; attr=attributes[i]; ++i) {
				callback(attr.name, store.deserialize(storage.getAttribute(attr.name)))
			}
		})
	}

	try {
		var testKey = '__storejs__'
		store.set(testKey, testKey)
		if (store.get(testKey) != testKey) { store.disabled = true }
		store.remove(testKey)
	} catch(e) {
		store.disabled = true
	}
	store.enabled = !store.disabled
	
	return store
}));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],3:[function(require,module,exports){
var Adapters, Storage, utils,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

utils = require('./utils');

Storage = require('./storage');

Adapters = (function() {
  function Adapters() {}

  Adapters.GimelAdapter = (function() {
    GimelAdapter.prototype.queue_name = '_gimel_queue';

    function GimelAdapter(url, namespace, storage) {
      if (storage == null) {
        storage = Adapters.LocalStorageAdapter;
      }
      this.goal_complete = bind(this.goal_complete, this);
      this.experiment_start = bind(this.experiment_start, this);
      this._storage = storage;
      this.url = url;
      this.namespace = namespace;
      this._queue = JSON.parse(this._storage.get(this.queue_name) || '[]');
      this._flush();
    }

    GimelAdapter.prototype._remove_uuid = function(uuid) {
      return (function(_this) {
        return function(err, res) {
          if (err) {
            return;
          }
          utils.remove(_this._queue, function(el) {
            return el.properties.uuid === uuid;
          });
          return _this._storage.set(_this.queue_name, JSON.stringify(_this._queue));
        };
      })(this);
    };

    GimelAdapter.prototype._jquery_get = function(url, data, callback) {
      utils.log('send request using jQuery');
      return $.ajax({
        method: 'GET',
        url: url,
        data: data,
        success: callback
      });
    };

    GimelAdapter.prototype._plain_js_get = function(url, data, callback) {
      var k, params, v, xhr;
      utils.log('fallback on plain js xhr');
      xhr = new XMLHttpRequest();
      params = (function() {
        var results;
        results = [];
        for (k in data) {
          v = data[k];
          results.push((encodeURIComponent(k)) + "=" + (encodeURIComponent(v)));
        }
        return results;
      })();
      params = params.join('&').replace(/%20/g, '+');
      xhr.open('GET', url + "?" + params);
      xhr.onload = function() {
        if (xhr.status === 200) {
          return callback();
        }
      };
      return xhr.send();
    };

    GimelAdapter.prototype._ajax_get = function(url, data, callback) {
      if (typeof $ !== "undefined" && $ !== null ? $.ajax : void 0) {
        return this._jquery_get(url, data, callback);
      } else {
        return this._plain_js_get(url, data, callback);
      }
    };

    GimelAdapter.prototype._flush = function() {
      var callback, i, item, len, ref, results;
      ref = this._queue;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        item = ref[i];
        callback = this._remove_uuid(item.properties.uuid);
        this._ajax_get(this.url, item.properties, callback);
        results.push(null);
      }
      return results;
    };

    GimelAdapter.prototype._track = function(experiment_name, variant, event) {
      utils.log("Persistent Queue Gimel track: " + this.namespace + ", " + experiment_name + ", " + variant + ", " + event);
      if (this._queue.length > 100) {
        this._queue.shift();
      }
      this._queue.push({
        properties: {
          experiment: experiment_name,
          uuid: utils.uuid(),
          variant: variant,
          event: event,
          namespace: this.namespace
        }
      });
      this._storage.set(this.queue_name, JSON.stringify(this._queue));
      return this._flush();
    };

    GimelAdapter.prototype.experiment_start = function(experiment_name, variant) {
      return this._track(experiment_name, variant, 'participate');
    };

    GimelAdapter.prototype.goal_complete = function(experiment_name, variant, goal) {
      return this._track(experiment_name, variant, goal);
    };

    return GimelAdapter;

  })();

  Adapters.PersistentQueueGoogleAnalyticsAdapter = (function() {
    PersistentQueueGoogleAnalyticsAdapter.prototype.namespace = 'alephbet';

    PersistentQueueGoogleAnalyticsAdapter.prototype.queue_name = '_ga_queue';

    function PersistentQueueGoogleAnalyticsAdapter(storage) {
      if (storage == null) {
        storage = Adapters.LocalStorageAdapter;
      }
      this.goal_complete = bind(this.goal_complete, this);
      this.experiment_start = bind(this.experiment_start, this);
      this._storage = storage;
      this._queue = JSON.parse(this._storage.get(this.queue_name) || '[]');
      this._flush();
    }

    PersistentQueueGoogleAnalyticsAdapter.prototype._remove_uuid = function(uuid) {
      return (function(_this) {
        return function() {
          utils.remove(_this._queue, function(el) {
            return el.uuid === uuid;
          });
          return _this._storage.set(_this.queue_name, JSON.stringify(_this._queue));
        };
      })(this);
    };

    PersistentQueueGoogleAnalyticsAdapter.prototype._flush = function() {
      var callback, i, item, len, ref, results;
      if (typeof ga !== 'function') {
        throw 'ga not defined. Please make sure your Universal analytics is set up correctly';
      }
      ref = this._queue;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        item = ref[i];
        callback = this._remove_uuid(item.uuid);
        results.push(ga('send', 'event', item.category, item.action, item.label, {
          'hitCallback': callback,
          'nonInteraction': 1
        }));
      }
      return results;
    };

    PersistentQueueGoogleAnalyticsAdapter.prototype._track = function(category, action, label) {
      utils.log("Persistent Queue Google Universal Analytics track: " + category + ", " + action + ", " + label);
      if (this._queue.length > 100) {
        this._queue.shift();
      }
      this._queue.push({
        uuid: utils.uuid(),
        category: category,
        action: action,
        label: label
      });
      this._storage.set(this.queue_name, JSON.stringify(this._queue));
      return this._flush();
    };

    PersistentQueueGoogleAnalyticsAdapter.prototype.experiment_start = function(experiment_name, variant) {
      return this._track(this.namespace, experiment_name + " | " + variant, 'Visitors');
    };

    PersistentQueueGoogleAnalyticsAdapter.prototype.goal_complete = function(experiment_name, variant, goal) {
      return this._track(this.namespace, experiment_name + " | " + variant, goal);
    };

    return PersistentQueueGoogleAnalyticsAdapter;

  })();

  Adapters.PersistentQueueKeenAdapter = (function() {
    PersistentQueueKeenAdapter.prototype.queue_name = '_keen_queue';

    function PersistentQueueKeenAdapter(keen_client, storage) {
      if (storage == null) {
        storage = Adapters.LocalStorageAdapter;
      }
      this.goal_complete = bind(this.goal_complete, this);
      this.experiment_start = bind(this.experiment_start, this);
      this.client = keen_client;
      this._storage = storage;
      this._queue = JSON.parse(this._storage.get(this.queue_name) || '[]');
      this._flush();
    }

    PersistentQueueKeenAdapter.prototype._remove_uuid = function(uuid) {
      return (function(_this) {
        return function(err, res) {
          if (err) {
            return;
          }
          utils.remove(_this._queue, function(el) {
            return el.properties.uuid === uuid;
          });
          return _this._storage.set(_this.queue_name, JSON.stringify(_this._queue));
        };
      })(this);
    };

    PersistentQueueKeenAdapter.prototype._flush = function() {
      var callback, i, item, len, ref, results;
      ref = this._queue;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        item = ref[i];
        callback = this._remove_uuid(item.properties.uuid);
        results.push(this.client.addEvent(item.experiment_name, item.properties, callback));
      }
      return results;
    };

    PersistentQueueKeenAdapter.prototype._track = function(experiment_name, variant, event) {
      utils.log("Persistent Queue Keen track: " + experiment_name + ", " + variant + ", " + event);
      if (this._queue.length > 100) {
        this._queue.shift();
      }
      this._queue.push({
        experiment_name: experiment_name,
        properties: {
          uuid: utils.uuid(),
          variant: variant,
          event: event
        }
      });
      this._storage.set(this.queue_name, JSON.stringify(this._queue));
      return this._flush();
    };

    PersistentQueueKeenAdapter.prototype.experiment_start = function(experiment_name, variant) {
      return this._track(experiment_name, variant, 'participate');
    };

    PersistentQueueKeenAdapter.prototype.goal_complete = function(experiment_name, variant, goal) {
      return this._track(experiment_name, variant, goal);
    };

    return PersistentQueueKeenAdapter;

  })();

  Adapters.GoogleUniversalAnalyticsAdapter = (function() {
    function GoogleUniversalAnalyticsAdapter() {}

    GoogleUniversalAnalyticsAdapter.namespace = 'alephbet';

    GoogleUniversalAnalyticsAdapter._track = function(category, action, label) {
      utils.log("Google Universal Analytics track: " + category + ", " + action + ", " + label);
      if (typeof ga !== 'function') {
        throw 'ga not defined. Please make sure your Universal analytics is set up correctly';
      }
      return ga('send', 'event', category, action, label, {
        'nonInteraction': 1
      });
    };

    GoogleUniversalAnalyticsAdapter.experiment_start = function(experiment_name, variant) {
      return GoogleUniversalAnalyticsAdapter._track(GoogleUniversalAnalyticsAdapter.namespace, experiment_name + " | " + variant, 'Visitors');
    };

    GoogleUniversalAnalyticsAdapter.goal_complete = function(experiment_name, variant, goal) {
      return GoogleUniversalAnalyticsAdapter._track(GoogleUniversalAnalyticsAdapter.namespace, experiment_name + " | " + variant, goal);
    };

    return GoogleUniversalAnalyticsAdapter;

  })();

  Adapters.LocalStorageAdapter = (function() {
    function LocalStorageAdapter() {}

    LocalStorageAdapter.namespace = 'alephbet';

    LocalStorageAdapter.set = function(key, value) {
      return new Storage(this.namespace).set(key, value);
    };

    LocalStorageAdapter.get = function(key) {
      return new Storage(this.namespace).get(key);
    };

    return LocalStorageAdapter;

  })();

  return Adapters;

})();

module.exports = Adapters;


},{"./storage":6,"./utils":7}],4:[function(require,module,exports){
var AlephBet, adapters, options, utils,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

utils = require('./utils');

adapters = require('./adapters');

options = require('./options');

AlephBet = (function() {
  function AlephBet() {}

  AlephBet.options = options;

  AlephBet.utils = utils;

  AlephBet.GimelAdapter = adapters.GimelAdapter;

  AlephBet.PersistentQueueGoogleAnalyticsAdapter = adapters.PersistentQueueGoogleAnalyticsAdapter;

  AlephBet.PersistentQueueKeenAdapter = adapters.PersistentQueueKeenAdapter;

  AlephBet.Experiment = (function() {
    var _run, _validate;

    Experiment._options = {
      name: null,
      variants: null,
      sample: 1.0,
      trigger: function() {
        return true;
      },
      tracking_adapter: adapters.GoogleUniversalAnalyticsAdapter,
      storage_adapter: adapters.LocalStorageAdapter
    };

    function Experiment(options1) {
      this.options = options1 != null ? options1 : {};
      this.add_goals = bind(this.add_goals, this);
      this.add_goal = bind(this.add_goal, this);
      utils.defaults(this.options, Experiment._options);
      _validate.call(this);
      this.name = this.options.name;
      this.variants = this.options.variants;
      this.variant_names = utils.keys(this.variants);
      _run.call(this);
    }

    Experiment.prototype.run = function() {
      var variant;
      utils.log("running with options: " + (JSON.stringify(this.options)));
      if (variant = this.get_stored_variant()) {
        utils.log(variant + " active");
        return this.activate_variant(variant);
      } else {
        return this.conditionally_activate_variant();
      }
    };

    _run = function() {
      return this.run();
    };

    Experiment.prototype.activate_variant = function(variant) {
      var ref;
      if ((ref = this.variants[variant]) != null) {
        ref.activate(this);
      }
      return this.storage().set(this.options.name + ":variant", variant);
    };

    Experiment.prototype.conditionally_activate_variant = function() {
      var variant;
      if (!this.options.trigger()) {
        return;
      }
      utils.log('trigger set');
      if (!this.in_sample()) {
        return;
      }
      utils.log('in sample');
      variant = this.pick_variant();
      this.tracking().experiment_start(this.options.name, variant);
      return this.activate_variant(variant);
    };

    Experiment.prototype.goal_complete = function(goal_name, props) {
      var variant;
      if (props == null) {
        props = {};
      }
      utils.defaults(props, {
        unique: true
      });
      if (props.unique && this.storage().get(this.options.name + ":" + goal_name)) {
        return;
      }
      variant = this.get_stored_variant();
      if (!variant) {
        return;
      }
      if (props.unique) {
        this.storage().set(this.options.name + ":" + goal_name, true);
      }
      utils.log("experiment: " + this.options.name + " variant:" + variant + " goal:" + goal_name + " complete");
      return this.tracking().goal_complete(this.options.name, variant, goal_name);
    };

    Experiment.prototype.get_stored_variant = function() {
      return this.storage().get(this.options.name + ":variant");
    };

    Experiment.prototype.pick_variant = function() {
      var chosen_partition, partitions, variant;
      partitions = 1.0 / this.variant_names.length;
      chosen_partition = Math.floor(Math.random() / partitions);
      variant = this.variant_names[chosen_partition];
      utils.log(variant + " picked");
      return variant;
    };

    Experiment.prototype.in_sample = function() {
      var active;
      active = this.storage().get(this.options.name + ":in_sample");
      if (typeof active !== 'undefined') {
        return active;
      }
      active = Math.random() <= this.options.sample;
      this.storage().set(this.options.name + ":in_sample", active);
      return active;
    };

    Experiment.prototype.add_goal = function(goal) {
      return goal.add_experiment(this);
    };

    Experiment.prototype.add_goals = function(goals) {
      var goal, i, len, results;
      results = [];
      for (i = 0, len = goals.length; i < len; i++) {
        goal = goals[i];
        results.push(this.add_goal(goal));
      }
      return results;
    };

    Experiment.prototype.storage = function() {
      return this.options.storage_adapter;
    };

    Experiment.prototype.tracking = function() {
      return this.options.tracking_adapter;
    };

    _validate = function() {
      if (this.options.name === null) {
        throw 'an experiment name must be specified';
      }
      if (this.options.variants === null) {
        throw 'variants must be provided';
      }
      if (typeof this.options.trigger !== 'function') {
        throw 'trigger must be a function';
      }
    };

    return Experiment;

  })();

  AlephBet.Goal = (function() {
    function Goal(name, props1) {
      this.name = name;
      this.props = props1 != null ? props1 : {};
      utils.defaults(this.props, {
        unique: true
      });
      this.experiments = [];
    }

    Goal.prototype.add_experiment = function(experiment) {
      return this.experiments.push(experiment);
    };

    Goal.prototype.add_experiments = function(experiments) {
      var experiment, i, len, results;
      results = [];
      for (i = 0, len = experiments.length; i < len; i++) {
        experiment = experiments[i];
        results.push(this.add_experiment(experiment));
      }
      return results;
    };

    Goal.prototype.complete = function() {
      var experiment, i, len, ref, results;
      ref = this.experiments;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        experiment = ref[i];
        results.push(experiment.goal_complete(this.name, this.props));
      }
      return results;
    };

    return Goal;

  })();

  return AlephBet;

})();

module.exports = AlephBet;


},{"./adapters":3,"./options":5,"./utils":7}],5:[function(require,module,exports){
module.exports = {
  debug: false
};


},{}],6:[function(require,module,exports){
var Storage, store;

store = require('store');

Storage = (function() {
  function Storage(namespace) {
    this.namespace = namespace != null ? namespace : 'alephbet';
    if (!store.enabled) {
      throw 'local storage not supported';
    }
    this.storage = store.get(this.namespace) || {};
  }

  Storage.prototype.set = function(key, value) {
    this.storage[key] = value;
    store.set(this.namespace, this.storage);
    return value;
  };

  Storage.prototype.get = function(key) {
    return this.storage[key];
  };

  return Storage;

})();

module.exports = Storage;


},{"store":2}],7:[function(require,module,exports){
var Utils, _, options, uuid;

_ = require('lodash.custom');

uuid = require('node-uuid');

options = require('./options');

Utils = (function() {
  function Utils() {}

  Utils.defaults = _.defaults;

  Utils.keys = _.keys;

  Utils.remove = _.remove;

  Utils.log = function(message) {
    if (options.debug) {
      return console.log(message);
    }
  };

  Utils.uuid = uuid.v4;

  return Utils;

})();

module.exports = Utils;


},{"./options":5,"lodash.custom":8,"node-uuid":1}],8:[function(require,module,exports){
(function (global){
/**
 * @license
 * lodash 3.10.0 (Custom Build) lodash.com/license | Underscore.js 1.8.3 underscorejs.org/LICENSE
 * Build: `lodash -p include="keys,defaults,remove" exports="node" -o ./vendor/lodash.custom.min.js`
 */
;(function(){function B(a){return!!a&&typeof a=="object"}function n(){}function Sa(a,b){var c=-1,e=a.length;for(b||(b=Array(e));++c<e;)b[c]=a[c];return b}function ra(a,b){for(var c=-1,e=a.length;++c<e&&false!==b(a[c],c,a););return a}function Ta(a,b){for(var c=-1,e=a.length;++c<e;)if(b(a[c],c,a))return true;return false}function sa(a,b){var c;if(null==b)c=a;else{c=C(b);var e=a;e||(e={});for(var d=-1,f=c.length;++d<f;){var h=c[d];e[h]=b[h]}c=e}return c}function ta(a,b,c){var e=typeof a;return"function"==
e?b===p?a:ua(a,b,c):null==a?ha:"object"==e?va(a):b===p?wa(a):Ua(a,b)}function xa(a,b,c,e,d,f,h){var g;c&&(g=d?c(a,e,d):c(a));if(g!==p)return g;if(!v(a))return a;if(e=y(a)){if(g=Va(a),!b)return Sa(a,g)}else{var l=A.call(a),m=l==H;if(l==t||l==I||m&&!d){if(Q(a))return d?a:{};g=Wa(m?{}:a);if(!b)return sa(g,a)}else return q[l]?Xa(a,l,b):d?a:{}}f||(f=[]);h||(h=[]);for(d=f.length;d--;)if(f[d]==a)return h[d];f.push(a);h.push(g);(e?ra:Ya)(a,function(d,e){g[e]=xa(d,b,c,e,a,f,h)});return g}function Ya(a,b){return Za(a,
b,C)}function ya(a,b,c){if(null!=a){a=z(a);c!==p&&c in a&&(b=[c]);c=0;for(var e=b.length;null!=a&&c<e;)a=z(a)[b[c++]];return c&&c==e?a:p}}function ia(a,b,c,e,d,f){if(a===b)a=true;else if(null==a||null==b||!v(a)&&!B(b))a=a!==a&&b!==b;else a:{var h=ia,g=y(a),l=y(b),m=F,k=F;g||(m=A.call(a),m==I?m=t:m!=t&&(g=ja(a)));l||(k=A.call(b),k==I?k=t:k!=t&&ja(b));var p=m==t&&!Q(a),l=k==t&&!Q(b),k=m==k;if(!k||g||p){if(!e&&(m=p&&u.call(a,"__wrapped__"),l=l&&u.call(b,"__wrapped__"),m||l)){a=h(m?a.value():a,l?b.value():
b,c,e,d,f);break a}if(k){d||(d=[]);f||(f=[]);for(m=d.length;m--;)if(d[m]==a){a=f[m]==b;break a}d.push(a);f.push(b);a=(g?$a:ab)(a,b,h,c,e,d,f);d.pop();f.pop()}else a=false}else a=bb(a,b,m)}return a}function cb(a,b){var c=b.length,e=c;if(null==a)return!e;for(a=z(a);c--;){var d=b[c];if(d[2]?d[1]!==a[d[0]]:!(d[0]in a))return false}for(;++c<e;){var d=b[c],f=d[0],h=a[f],g=d[1];if(d[2]){if(h===p&&!(f in a))return false}else if(d=p,d===p?!ia(g,h,void 0,true):!d)return false}return true}function va(a){var b=db(a);if(1==b.length&&
b[0][2]){var c=b[0][0],e=b[0][1];return function(a){if(null==a)return false;a=z(a);return a[c]===e&&(e!==p||c in a)}}return function(a){return cb(a,b)}}function Ua(a,b){var c=y(a),e=za(a)&&b===b&&!v(b),d=a+"";a=Aa(a);return function(f){if(null==f)return false;var h=d;f=z(f);if(!(!c&&e||h in f)){if(1!=a.length){var h=a,g=0,l=-1,m=-1,k=h.length,g=null==g?0:+g||0;0>g&&(g=-g>k?0:k+g);l=l===p||l>k?k:+l||0;0>l&&(l+=k);k=g>l?0:l-g>>>0;g>>>=0;for(l=Array(k);++m<k;)l[m]=h[m+g];f=ya(f,l)}if(null==f)return false;h=Ba(a);
f=z(f)}return f[h]===b?b!==p||h in f:ia(b,f[h],p,true)}}function Ca(a){return function(b){return null==b?p:z(b)[a]}}function eb(a){var b=a+"";a=Aa(a);return function(c){return ya(c,a,b)}}function ua(a,b,c){if(typeof a!="function")return ha;if(b===p)return a;switch(c){case 1:return function(c){return a.call(b,c)};case 3:return function(c,d,f){return a.call(b,c,d,f)};case 4:return function(c,d,f,h){return a.call(b,c,d,f,h)};case 5:return function(c,d,f,h,g){return a.call(b,c,d,f,h,g)}}return function(){return a.apply(b,
arguments)}}function Da(a){var b=new fb(a.byteLength);(new ka(b)).set(new ka(a));return b}function $a(a,b,c,e,d,f,h){var g=-1,l=a.length,m=b.length;if(l!=m&&!(d&&m>l))return false;for(;++g<l;){var k=a[g],m=b[g],n=e?e(d?m:k,d?k:m,g):p;if(n!==p){if(n)continue;return false}if(d){if(!Ta(b,function(a){return k===a||c(k,a,e,d,f,h)}))return false}else if(k!==m&&!c(k,m,e,d,f,h))return false}return true}function bb(a,b,c){switch(c){case J:case K:return+a==+b;case L:return a.name==b.name&&a.message==b.message;case M:return a!=
+a?b!=+b:a==+b;case N:case D:return a==b+""}return false}function ab(a,b,c,e,d,f,h){var g=C(a),l=g.length,m=C(b).length;if(l!=m&&!d)return false;for(m=l;m--;){var k=g[m];if(!(d?k in b:u.call(b,k)))return false}for(var n=d;++m<l;){var k=g[m],q=a[k],r=b[k],s=e?e(d?r:q,d?q:r,k):p;if(s===p?!c(q,r,e,d,f,h):!s)return false;n||(n="constructor"==k)}return n||(c=a.constructor,e=b.constructor,!(c!=e&&"constructor"in a&&"constructor"in b)||typeof c=="function"&&c instanceof c&&typeof e=="function"&&e instanceof e)?true:false}function db(a){a=
Ea(a);for(var b=a.length;b--;){var c=a[b][1];a[b][2]=c===c&&!v(c)}return a}function Fa(a,b){var c=null==a?p:a[b];return Ga(c)?c:p}function Va(a){var b=a.length,c=new a.constructor(b);b&&"string"==typeof a[0]&&u.call(a,"index")&&(c.index=a.index,c.input=a.input);return c}function Wa(a){a=a.constructor;typeof a=="function"&&a instanceof a||(a=Object);return new a}function Xa(a,b,c){var e=a.constructor;switch(b){case la:return Da(a);case J:case K:return new e(+a);case R:case S:case T:case U:case V:case W:case X:case Y:case Z:return e instanceof
e&&(e=w[b]),b=a.buffer,new e(c?Da(b):b,a.byteOffset,a.length);case M:case D:return new e(a);case N:var d=new e(a.source,gb.exec(a));d.lastIndex=a.lastIndex}return d}function $(a,b){a=typeof a=="number"||hb.test(a)?+a:-1;b=null==b?Ha:b;return-1<a&&0==a%1&&a<b}function Ia(a,b,c){if(!v(c))return false;var e=typeof b;return("number"==e?null!=c&&E(ma(c))&&$(b,c.length):"string"==e&&b in c)?(b=c[b],a===a?a===b:b!==b):false}function za(a){var b=typeof a;return"string"==b&&ib.test(a)||"number"==b?true:y(a)?false:!jb.test(a)||
!1}function E(a){return typeof a=="number"&&-1<a&&0==a%1&&a<=Ha}function Ja(a){for(var b=Ka(a),c=b.length,e=c&&a.length,d=!!e&&E(e)&&(y(a)||na(a)||aa(a)),f=-1,h=[];++f<c;){var g=b[f];(d&&$(g,e)||u.call(a,g))&&h.push(g)}return h}function z(a){if(n.support.unindexedChars&&aa(a)){for(var b=-1,c=a.length,e=Object(a);++b<c;)e[b]=a.charAt(b);return e}return v(a)?a:Object(a)}function Aa(a){if(y(a))return a;var b=[];(null==a?"":a+"").replace(kb,function(a,e,d,f){b.push(d?f.replace(lb,"$1"):e||a)});return b}
function Ba(a){var b=a?a.length:0;return b?a[b-1]:p}function oa(a,b){if(typeof a!="function")throw new TypeError(mb);b=La(b===p?a.length-1:+b||0,0);return function(){for(var c=arguments,e=-1,d=La(c.length-b,0),f=Array(d);++e<d;)f[e]=c[b+e];switch(b){case 0:return a.call(this,f);case 1:return a.call(this,c[0],f);case 2:return a.call(this,c[0],c[1],f)}d=Array(b+1);for(e=-1;++e<b;)d[e]=c[e];d[b]=f;return a.apply(this,d)}}function na(a){return B(a)&&null!=a&&E(ma(a))&&u.call(a,"callee")&&!ba.call(a,"callee")}
function ca(a){return v(a)&&A.call(a)==H}function v(a){var b=typeof a;return!!a&&("object"==b||"function"==b)}function Ga(a){return null==a?false:ca(a)?Ma.test(Na.call(a)):B(a)&&(Q(a)?Ma:nb).test(a)}function aa(a){return typeof a=="string"||B(a)&&A.call(a)==D}function ja(a){return B(a)&&E(a.length)&&!!r[A.call(a)]}function Ka(a){if(null==a)return[];v(a)||(a=Object(a));for(var b=a.length,c=n.support,b=b&&E(b)&&(y(a)||na(a)||aa(a))&&b||0,e=a.constructor,d=-1,e=ca(e)&&e.prototype||G,f=e===a,h=Array(b),g=
0<b,l=c.enumErrorProps&&(a===da||a instanceof Error),m=c.enumPrototypes&&ca(a);++d<b;)h[d]=d+"";for(var k in a)m&&"prototype"==k||l&&("message"==k||"name"==k)||g&&$(k,b)||"constructor"==k&&(f||!u.call(a,k))||h.push(k);if(c.nonEnumShadows&&a!==G)for(b=a===ob?D:a===da?L:A.call(a),c=s[b]||s[t],b==t&&(e=G),b=pa.length;b--;)k=pa[b],d=c[k],f&&d||(d?!u.call(a,k):a[k]===e[k])||h.push(k);return h}function Ea(a){a=z(a);for(var b=-1,c=C(a),e=c.length,d=Array(e);++b<e;){var f=c[b];d[b]=[f,a[f]]}return d}function ea(a,
b,c){c&&Ia(a,b,c)&&(b=p);return B(a)?Oa(a):ta(a,b)}function ha(a){return a}function Oa(a){return va(xa(a,true))}function wa(a){return za(a)?Ca(a):eb(a)}var p,mb="Expected a function",I="[object Arguments]",F="[object Array]",J="[object Boolean]",K="[object Date]",L="[object Error]",H="[object Function]",M="[object Number]",t="[object Object]",N="[object RegExp]",D="[object String]",la="[object ArrayBuffer]",R="[object Float32Array]",S="[object Float64Array]",T="[object Int8Array]",U="[object Int16Array]",
V="[object Int32Array]",W="[object Uint8Array]",X="[object Uint8ClampedArray]",Y="[object Uint16Array]",Z="[object Uint32Array]",jb=/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\n\\]|\\.)*?\1)\]/,ib=/^\w*$/,kb=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\n\\]|\\.)*?)\2)\]/g,lb=/\\(\\)?/g,gb=/\w*$/,nb=/^\[object .+?Constructor\]$/,hb=/^\d+$/,pa="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" "),r={};r[R]=r[S]=r[T]=r[U]=r[V]=r[W]=r[X]=r[Y]=r[Z]=true;
r[I]=r[F]=r[la]=r[J]=r[K]=r[L]=r[H]=r["[object Map]"]=r[M]=r[t]=r[N]=r["[object Set]"]=r[D]=r["[object WeakMap]"]=false;var q={};q[I]=q[F]=q[la]=q[J]=q[K]=q[R]=q[S]=q[T]=q[U]=q[V]=q[M]=q[t]=q[N]=q[D]=q[W]=q[X]=q[Y]=q[Z]=true;q[L]=q[H]=q["[object Map]"]=q["[object Set]"]=q["[object WeakMap]"]=false;var fa={"function":true,object:true},ga=fa[typeof exports]&&exports&&!exports.nodeType&&exports,O=fa[typeof module]&&module&&!module.nodeType&&module,pb=fa[typeof self]&&self&&self.Object&&self,Pa=fa[typeof window]&&
window&&window.Object&&window,qb=O&&O.exports===ga&&ga,x=ga&&O&&typeof global=="object"&&global&&global.Object&&global||Pa!==(this&&this.window)&&Pa||pb||this,Q=function(){try{Object({toString:0}+"")}catch(a){return function(){return false}}return function(a){return typeof a.toString!="function"&&typeof(a+"")=="string"}}(),rb=Array.prototype,da=Error.prototype,G=Object.prototype,ob=String.prototype,Na=Function.prototype.toString,u=G.hasOwnProperty,A=G.toString,Ma=RegExp("^"+Na.call(u).replace(/[\\^$.*+?()[\]{}|]/g,
"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$"),fb=x.ArrayBuffer,ba=G.propertyIsEnumerable,Qa=rb.splice,ka=x.Uint8Array,sb=Fa(Array,"isArray"),Ra=Fa(Object,"keys"),La=Math.max,Ha=9007199254740991,w={};w[R]=x.Float32Array;w[S]=x.Float64Array;w[T]=x.Int8Array;w[U]=x.Int16Array;w[V]=x.Int32Array;w[W]=ka;w[X]=x.Uint8ClampedArray;w[Y]=x.Uint16Array;w[Z]=x.Uint32Array;var s={};s[F]=s[K]=s[M]={constructor:true,toLocaleString:true,toString:true,valueOf:true};s[J]=s[D]={constructor:true,
toString:true,valueOf:true};s[L]=s[H]=s[N]={constructor:true,toString:true};s[t]={constructor:true};ra(pa,function(a){for(var b in s)if(u.call(s,b)){var c=s[b];c[a]=u.call(c,a)}});var P=n.support={};(function(a){function b(){this.x=a}var c={0:a,length:a},e=[];b.prototype={valueOf:a,y:a};for(var d in new b)e.push(d);P.enumErrorProps=ba.call(da,"message")||ba.call(da,"name");P.enumPrototypes=ba.call(b,"prototype");P.nonEnumShadows=!/valueOf/.test(e);P.spliceObjects=(Qa.call(c,0,1),!c[0]);P.unindexedChars="xx"!="x"[0]+
Object("x")[0]})(1,0);var Za=function(a){return function(b,c,e){var d=z(b);e=e(b);for(var f=e.length,h=a?f:-1;a?h--:++h<f;){var g=e[h];if(false===c(d[g],g,d))break}return b}}(),ma=Ca("length"),y=sb||function(a){return B(a)&&E(a.length)&&A.call(a)==F},qa=function(a){return oa(function(b,c){var e=-1,d=null==b?0:c.length,f=2<d?c[d-2]:p,h=2<d?c[2]:p,g=1<d?c[d-1]:p;typeof f=="function"?(f=ua(f,g,5),d-=2):(f=typeof g=="function"?g:p,d-=f?1:0);h&&Ia(c[0],c[1],h)&&(f=3>d?p:f,d=1);for(;++e<d;)(h=c[e])&&a(b,h,
f);return b})}(function(a,b,c){if(c)for(var e=-1,d=C(b),f=d.length;++e<f;){var h=d[e],g=a[h],l=c(g,b[h],h,a,b);(l===l?l===g:g!==g)&&(g!==p||h in a)||(a[h]=l)}else a=sa(a,b);return a}),tb=function(a,b){return oa(function(c){var e=c[0];if(null==e)return e;c.push(b);return a.apply(p,c)})}(qa,function(a,b){return a===p?b:a}),C=Ra?function(a){var b=null==a?p:a.constructor;return typeof b=="function"&&b.prototype===a||(typeof a=="function"?n.support.enumPrototypes:null!=a&&E(ma(a)))?Ja(a):v(a)?Ra(a):[]}:
Ja;n.assign=qa;n.callback=ea;n.defaults=tb;n.keys=C;n.keysIn=Ka;n.matches=Oa;n.pairs=Ea;n.property=wa;n.remove=function(a,b,c){var e=[];if(!a||!a.length)return e;var d=-1,f=[],h=a.length,g=n.callback||ea,g=g===ea?ta:g;for(b=g(b,c,3);++d<h;)c=a[d],b(c,d,a)&&(e.push(c),f.push(d));for(b=a?f.length:0;b--;)if(d=f[b],d!=l&&$(d)){var l=d;Qa.call(a,d,1)}return e};n.restParam=oa;n.extend=qa;n.iteratee=ea;n.identity=ha;n.isArguments=na;n.isArray=y;n.isFunction=ca;n.isNative=Ga;n.isObject=v;n.isString=aa;n.isTypedArray=
ja;n.last=Ba;n.VERSION="3.10.0";ga&&O&&qb&&((O.exports=n)._=n)}.call(this));
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},[4])(4)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvbm9kZS11dWlkL3V1aWQuanMiLCJub2RlX21vZHVsZXMvc3RvcmUvc3RvcmUuanMiLCIvaG9tZS9qb2hhbm5lcy9Xb3JrL2tlbmh1Yi9hbGVwaGJldC9zcmMvYWRhcHRlcnMuY29mZmVlIiwiL2hvbWUvam9oYW5uZXMvV29yay9rZW5odWIvYWxlcGhiZXQvc3JjL2FsZXBoYmV0LmNvZmZlZSIsIi9ob21lL2pvaGFubmVzL1dvcmsva2VuaHViL2FsZXBoYmV0L3NyYy9vcHRpb25zLmNvZmZlZSIsIi9ob21lL2pvaGFubmVzL1dvcmsva2VuaHViL2FsZXBoYmV0L3NyYy9zdG9yYWdlLmNvZmZlZSIsIi9ob21lL2pvaGFubmVzL1dvcmsva2VuaHViL2FsZXBoYmV0L3NyYy91dGlscy5jb2ZmZWUiLCJ2ZW5kb3IvbG9kYXNoLmN1c3RvbS5taW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3JQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMvTEEsSUFBQSx3QkFBQTtFQUFBOztBQUFBLEtBQUEsR0FBUSxPQUFBLENBQVEsU0FBUjs7QUFDUixPQUFBLEdBQVUsT0FBQSxDQUFRLFdBQVI7O0FBRUo7OztFQVFFLFFBQUMsQ0FBQTsyQkFDTCxVQUFBLEdBQVk7O0lBRUMsc0JBQUMsR0FBRCxFQUFNLFNBQU4sRUFBaUIsT0FBakI7O1FBQWlCLFVBQVUsUUFBUSxDQUFDOzs7O01BQy9DLElBQUMsQ0FBQSxRQUFELEdBQVk7TUFDWixJQUFDLENBQUEsR0FBRCxHQUFPO01BQ1AsSUFBQyxDQUFBLFNBQUQsR0FBYTtNQUNiLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxJQUFDLENBQUEsVUFBZixDQUFBLElBQThCLElBQXpDO01BQ1YsSUFBQyxDQUFBLE1BQUQsQ0FBQTtJQUxXOzsyQkFPYixZQUFBLEdBQWMsU0FBQyxJQUFEO2FBQ1osQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEdBQUQsRUFBTSxHQUFOO1VBQ0UsSUFBVSxHQUFWO0FBQUEsbUJBQUE7O1VBQ0EsS0FBSyxDQUFDLE1BQU4sQ0FBYSxLQUFDLENBQUEsTUFBZCxFQUFzQixTQUFDLEVBQUQ7bUJBQVEsRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFkLEtBQXNCO1VBQTlCLENBQXRCO2lCQUNBLEtBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLEtBQUMsQ0FBQSxVQUFmLEVBQTJCLElBQUksQ0FBQyxTQUFMLENBQWUsS0FBQyxDQUFBLE1BQWhCLENBQTNCO1FBSEY7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO0lBRFk7OzJCQU1kLFdBQUEsR0FBYSxTQUFDLEdBQUQsRUFBTSxJQUFOLEVBQVksUUFBWjtNQUNYLEtBQUssQ0FBQyxHQUFOLENBQVUsMkJBQVY7YUFDQSxDQUFDLENBQUMsSUFBRixDQUNFO1FBQUEsTUFBQSxFQUFRLEtBQVI7UUFDQSxHQUFBLEVBQUssR0FETDtRQUVBLElBQUEsRUFBTSxJQUZOO1FBR0EsT0FBQSxFQUFTLFFBSFQ7T0FERjtJQUZXOzsyQkFRYixhQUFBLEdBQWUsU0FBQyxHQUFELEVBQU0sSUFBTixFQUFZLFFBQVo7QUFDYixVQUFBO01BQUEsS0FBSyxDQUFDLEdBQU4sQ0FBVSwwQkFBVjtNQUNBLEdBQUEsR0FBVSxJQUFBLGNBQUEsQ0FBQTtNQUNWLE1BQUE7O0FBQVU7YUFBQSxTQUFBOzt1QkFBRSxDQUFDLGtCQUFBLENBQW1CLENBQW5CLENBQUQsQ0FBQSxHQUF1QixHQUF2QixHQUF5QixDQUFDLGtCQUFBLENBQW1CLENBQW5CLENBQUQ7QUFBM0I7OztNQUNWLE1BQUEsR0FBUyxNQUFNLENBQUMsSUFBUCxDQUFZLEdBQVosQ0FBZ0IsQ0FBQyxPQUFqQixDQUF5QixNQUF6QixFQUFpQyxHQUFqQztNQUNULEdBQUcsQ0FBQyxJQUFKLENBQVMsS0FBVCxFQUFtQixHQUFELEdBQUssR0FBTCxHQUFRLE1BQTFCO01BQ0EsR0FBRyxDQUFDLE1BQUosR0FBYSxTQUFBO1FBQ1gsSUFBRyxHQUFHLENBQUMsTUFBSixLQUFjLEdBQWpCO2lCQUNFLFFBQUEsQ0FBQSxFQURGOztNQURXO2FBR2IsR0FBRyxDQUFDLElBQUosQ0FBQTtJQVRhOzsyQkFXZixTQUFBLEdBQVcsU0FBQyxHQUFELEVBQU0sSUFBTixFQUFZLFFBQVo7TUFDVCw2Q0FBRyxDQUFDLENBQUUsYUFBTjtlQUNFLElBQUMsQ0FBQSxXQUFELENBQWEsR0FBYixFQUFrQixJQUFsQixFQUF3QixRQUF4QixFQURGO09BQUEsTUFBQTtlQUdFLElBQUMsQ0FBQSxhQUFELENBQWUsR0FBZixFQUFvQixJQUFwQixFQUEwQixRQUExQixFQUhGOztJQURTOzsyQkFNWCxNQUFBLEdBQVEsU0FBQTtBQUNOLFVBQUE7QUFBQTtBQUFBO1dBQUEscUNBQUE7O1FBQ0UsUUFBQSxHQUFXLElBQUMsQ0FBQSxZQUFELENBQWMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUE5QjtRQUNYLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBQyxDQUFBLEdBQVosRUFBaUIsSUFBSSxDQUFDLFVBQXRCLEVBQWtDLFFBQWxDO3FCQUNBO0FBSEY7O0lBRE07OzJCQU1SLE1BQUEsR0FBUSxTQUFDLGVBQUQsRUFBa0IsT0FBbEIsRUFBMkIsS0FBM0I7TUFDTixLQUFLLENBQUMsR0FBTixDQUFVLGdDQUFBLEdBQWlDLElBQUMsQ0FBQSxTQUFsQyxHQUE0QyxJQUE1QyxHQUFnRCxlQUFoRCxHQUFnRSxJQUFoRSxHQUFvRSxPQUFwRSxHQUE0RSxJQUE1RSxHQUFnRixLQUExRjtNQUNBLElBQW1CLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixHQUFpQixHQUFwQztRQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBUixDQUFBLEVBQUE7O01BQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLENBQ0U7UUFBQSxVQUFBLEVBQ0U7VUFBQSxVQUFBLEVBQVksZUFBWjtVQUNBLElBQUEsRUFBTSxLQUFLLENBQUMsSUFBTixDQUFBLENBRE47VUFFQSxPQUFBLEVBQVMsT0FGVDtVQUdBLEtBQUEsRUFBTyxLQUhQO1VBSUEsU0FBQSxFQUFXLElBQUMsQ0FBQSxTQUpaO1NBREY7T0FERjtNQU9BLElBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLElBQUMsQ0FBQSxVQUFmLEVBQTJCLElBQUksQ0FBQyxTQUFMLENBQWUsSUFBQyxDQUFBLE1BQWhCLENBQTNCO2FBQ0EsSUFBQyxDQUFBLE1BQUQsQ0FBQTtJQVhNOzsyQkFhUixnQkFBQSxHQUFrQixTQUFDLGVBQUQsRUFBa0IsT0FBbEI7YUFDaEIsSUFBQyxDQUFBLE1BQUQsQ0FBUSxlQUFSLEVBQXlCLE9BQXpCLEVBQWtDLGFBQWxDO0lBRGdCOzsyQkFHbEIsYUFBQSxHQUFlLFNBQUMsZUFBRCxFQUFrQixPQUFsQixFQUEyQixJQUEzQjthQUNiLElBQUMsQ0FBQSxNQUFELENBQVEsZUFBUixFQUF5QixPQUF6QixFQUFrQyxJQUFsQztJQURhOzs7Ozs7RUFJWCxRQUFDLENBQUE7b0RBQ0wsU0FBQSxHQUFXOztvREFDWCxVQUFBLEdBQVk7O0lBRUMsK0NBQUMsT0FBRDs7UUFBQyxVQUFVLFFBQVEsQ0FBQzs7OztNQUMvQixJQUFDLENBQUEsUUFBRCxHQUFZO01BQ1osSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFJLENBQUMsS0FBTCxDQUFXLElBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLElBQUMsQ0FBQSxVQUFmLENBQUEsSUFBOEIsSUFBekM7TUFDVixJQUFDLENBQUEsTUFBRCxDQUFBO0lBSFc7O29EQUtiLFlBQUEsR0FBYyxTQUFDLElBQUQ7YUFDWixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDRSxLQUFLLENBQUMsTUFBTixDQUFhLEtBQUMsQ0FBQSxNQUFkLEVBQXNCLFNBQUMsRUFBRDttQkFBUSxFQUFFLENBQUMsSUFBSCxLQUFXO1VBQW5CLENBQXRCO2lCQUNBLEtBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLEtBQUMsQ0FBQSxVQUFmLEVBQTJCLElBQUksQ0FBQyxTQUFMLENBQWUsS0FBQyxDQUFBLE1BQWhCLENBQTNCO1FBRkY7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO0lBRFk7O29EQUtkLE1BQUEsR0FBUSxTQUFBO0FBQ04sVUFBQTtNQUFBLElBQXlGLE9BQU8sRUFBUCxLQUFlLFVBQXhHO0FBQUEsY0FBTSxnRkFBTjs7QUFDQTtBQUFBO1dBQUEscUNBQUE7O1FBQ0UsUUFBQSxHQUFXLElBQUMsQ0FBQSxZQUFELENBQWMsSUFBSSxDQUFDLElBQW5CO3FCQUNYLEVBQUEsQ0FBRyxNQUFILEVBQVcsT0FBWCxFQUFvQixJQUFJLENBQUMsUUFBekIsRUFBbUMsSUFBSSxDQUFDLE1BQXhDLEVBQWdELElBQUksQ0FBQyxLQUFyRCxFQUE0RDtVQUFDLGFBQUEsRUFBZSxRQUFoQjtVQUEwQixnQkFBQSxFQUFrQixDQUE1QztTQUE1RDtBQUZGOztJQUZNOztvREFNUixNQUFBLEdBQVEsU0FBQyxRQUFELEVBQVcsTUFBWCxFQUFtQixLQUFuQjtNQUNOLEtBQUssQ0FBQyxHQUFOLENBQVUscURBQUEsR0FBc0QsUUFBdEQsR0FBK0QsSUFBL0QsR0FBbUUsTUFBbkUsR0FBMEUsSUFBMUUsR0FBOEUsS0FBeEY7TUFDQSxJQUFtQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQVIsR0FBaUIsR0FBcEM7UUFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQVIsQ0FBQSxFQUFBOztNQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBUixDQUFhO1FBQUMsSUFBQSxFQUFNLEtBQUssQ0FBQyxJQUFOLENBQUEsQ0FBUDtRQUFxQixRQUFBLEVBQVUsUUFBL0I7UUFBeUMsTUFBQSxFQUFRLE1BQWpEO1FBQXlELEtBQUEsRUFBTyxLQUFoRTtPQUFiO01BQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxHQUFWLENBQWMsSUFBQyxDQUFBLFVBQWYsRUFBMkIsSUFBSSxDQUFDLFNBQUwsQ0FBZSxJQUFDLENBQUEsTUFBaEIsQ0FBM0I7YUFDQSxJQUFDLENBQUEsTUFBRCxDQUFBO0lBTE07O29EQU9SLGdCQUFBLEdBQWtCLFNBQUMsZUFBRCxFQUFrQixPQUFsQjthQUNoQixJQUFDLENBQUEsTUFBRCxDQUFRLElBQUMsQ0FBQSxTQUFULEVBQXVCLGVBQUQsR0FBaUIsS0FBakIsR0FBc0IsT0FBNUMsRUFBdUQsVUFBdkQ7SUFEZ0I7O29EQUdsQixhQUFBLEdBQWUsU0FBQyxlQUFELEVBQWtCLE9BQWxCLEVBQTJCLElBQTNCO2FBQ2IsSUFBQyxDQUFBLE1BQUQsQ0FBUSxJQUFDLENBQUEsU0FBVCxFQUF1QixlQUFELEdBQWlCLEtBQWpCLEdBQXNCLE9BQTVDLEVBQXVELElBQXZEO0lBRGE7Ozs7OztFQUlYLFFBQUMsQ0FBQTt5Q0FDTCxVQUFBLEdBQVk7O0lBRUMsb0NBQUMsV0FBRCxFQUFjLE9BQWQ7O1FBQWMsVUFBVSxRQUFRLENBQUM7Ozs7TUFDNUMsSUFBQyxDQUFBLE1BQUQsR0FBVTtNQUNWLElBQUMsQ0FBQSxRQUFELEdBQVk7TUFDWixJQUFDLENBQUEsTUFBRCxHQUFVLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBQyxDQUFBLFFBQVEsQ0FBQyxHQUFWLENBQWMsSUFBQyxDQUFBLFVBQWYsQ0FBQSxJQUE4QixJQUF6QztNQUNWLElBQUMsQ0FBQSxNQUFELENBQUE7SUFKVzs7eUNBTWIsWUFBQSxHQUFjLFNBQUMsSUFBRDthQUNaLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxHQUFELEVBQU0sR0FBTjtVQUNFLElBQVUsR0FBVjtBQUFBLG1CQUFBOztVQUNBLEtBQUssQ0FBQyxNQUFOLENBQWEsS0FBQyxDQUFBLE1BQWQsRUFBc0IsU0FBQyxFQUFEO21CQUFRLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBZCxLQUFzQjtVQUE5QixDQUF0QjtpQkFDQSxLQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxLQUFDLENBQUEsVUFBZixFQUEyQixJQUFJLENBQUMsU0FBTCxDQUFlLEtBQUMsQ0FBQSxNQUFoQixDQUEzQjtRQUhGO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtJQURZOzt5Q0FNZCxNQUFBLEdBQVEsU0FBQTtBQUNOLFVBQUE7QUFBQTtBQUFBO1dBQUEscUNBQUE7O1FBQ0UsUUFBQSxHQUFXLElBQUMsQ0FBQSxZQUFELENBQWMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUE5QjtxQkFDWCxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVIsQ0FBaUIsSUFBSSxDQUFDLGVBQXRCLEVBQXVDLElBQUksQ0FBQyxVQUE1QyxFQUF3RCxRQUF4RDtBQUZGOztJQURNOzt5Q0FLUixNQUFBLEdBQVEsU0FBQyxlQUFELEVBQWtCLE9BQWxCLEVBQTJCLEtBQTNCO01BQ04sS0FBSyxDQUFDLEdBQU4sQ0FBVSwrQkFBQSxHQUFnQyxlQUFoQyxHQUFnRCxJQUFoRCxHQUFvRCxPQUFwRCxHQUE0RCxJQUE1RCxHQUFnRSxLQUExRTtNQUNBLElBQW1CLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixHQUFpQixHQUFwQztRQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBUixDQUFBLEVBQUE7O01BQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLENBQ0U7UUFBQSxlQUFBLEVBQWlCLGVBQWpCO1FBQ0EsVUFBQSxFQUNFO1VBQUEsSUFBQSxFQUFNLEtBQUssQ0FBQyxJQUFOLENBQUEsQ0FBTjtVQUNBLE9BQUEsRUFBUyxPQURUO1VBRUEsS0FBQSxFQUFPLEtBRlA7U0FGRjtPQURGO01BTUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxHQUFWLENBQWMsSUFBQyxDQUFBLFVBQWYsRUFBMkIsSUFBSSxDQUFDLFNBQUwsQ0FBZSxJQUFDLENBQUEsTUFBaEIsQ0FBM0I7YUFDQSxJQUFDLENBQUEsTUFBRCxDQUFBO0lBVk07O3lDQVlSLGdCQUFBLEdBQWtCLFNBQUMsZUFBRCxFQUFrQixPQUFsQjthQUNoQixJQUFDLENBQUEsTUFBRCxDQUFRLGVBQVIsRUFBeUIsT0FBekIsRUFBa0MsYUFBbEM7SUFEZ0I7O3lDQUdsQixhQUFBLEdBQWUsU0FBQyxlQUFELEVBQWtCLE9BQWxCLEVBQTJCLElBQTNCO2FBQ2IsSUFBQyxDQUFBLE1BQUQsQ0FBUSxlQUFSLEVBQXlCLE9BQXpCLEVBQWtDLElBQWxDO0lBRGE7Ozs7OztFQUlYLFFBQUMsQ0FBQTs7O0lBQ0wsK0JBQUMsQ0FBQSxTQUFELEdBQVk7O0lBRVosK0JBQUMsQ0FBQSxNQUFELEdBQVMsU0FBQyxRQUFELEVBQVcsTUFBWCxFQUFtQixLQUFuQjtNQUNQLEtBQUssQ0FBQyxHQUFOLENBQVUsb0NBQUEsR0FBcUMsUUFBckMsR0FBOEMsSUFBOUMsR0FBa0QsTUFBbEQsR0FBeUQsSUFBekQsR0FBNkQsS0FBdkU7TUFDQSxJQUF5RixPQUFPLEVBQVAsS0FBZSxVQUF4RztBQUFBLGNBQU0sZ0ZBQU47O2FBQ0EsRUFBQSxDQUFHLE1BQUgsRUFBVyxPQUFYLEVBQW9CLFFBQXBCLEVBQThCLE1BQTlCLEVBQXNDLEtBQXRDLEVBQTZDO1FBQUMsZ0JBQUEsRUFBa0IsQ0FBbkI7T0FBN0M7SUFITzs7SUFLVCwrQkFBQyxDQUFBLGdCQUFELEdBQW1CLFNBQUMsZUFBRCxFQUFrQixPQUFsQjthQUNqQiwrQkFBQyxDQUFBLE1BQUQsQ0FBUSwrQkFBQyxDQUFBLFNBQVQsRUFBdUIsZUFBRCxHQUFpQixLQUFqQixHQUFzQixPQUE1QyxFQUF1RCxVQUF2RDtJQURpQjs7SUFHbkIsK0JBQUMsQ0FBQSxhQUFELEdBQWdCLFNBQUMsZUFBRCxFQUFrQixPQUFsQixFQUEyQixJQUEzQjthQUNkLCtCQUFDLENBQUEsTUFBRCxDQUFRLCtCQUFDLENBQUEsU0FBVCxFQUF1QixlQUFELEdBQWlCLEtBQWpCLEdBQXNCLE9BQTVDLEVBQXVELElBQXZEO0lBRGM7Ozs7OztFQUlaLFFBQUMsQ0FBQTs7O0lBQ0wsbUJBQUMsQ0FBQSxTQUFELEdBQVk7O0lBQ1osbUJBQUMsQ0FBQSxHQUFELEdBQU0sU0FBQyxHQUFELEVBQU0sS0FBTjthQUNBLElBQUEsT0FBQSxDQUFRLElBQUMsQ0FBQSxTQUFULENBQW1CLENBQUMsR0FBcEIsQ0FBd0IsR0FBeEIsRUFBNkIsS0FBN0I7SUFEQTs7SUFFTixtQkFBQyxDQUFBLEdBQUQsR0FBTSxTQUFDLEdBQUQ7YUFDQSxJQUFBLE9BQUEsQ0FBUSxJQUFDLENBQUEsU0FBVCxDQUFtQixDQUFDLEdBQXBCLENBQXdCLEdBQXhCO0lBREE7Ozs7Ozs7Ozs7QUFJVixNQUFNLENBQUMsT0FBUCxHQUFpQjs7OztBQzlLakIsSUFBQSxrQ0FBQTtFQUFBOztBQUFBLEtBQUEsR0FBUSxPQUFBLENBQVEsU0FBUjs7QUFDUixRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVI7O0FBQ1gsT0FBQSxHQUFVLE9BQUEsQ0FBUSxXQUFSOztBQUVKOzs7RUFDSixRQUFDLENBQUEsT0FBRCxHQUFXOztFQUNYLFFBQUMsQ0FBQSxLQUFELEdBQVM7O0VBRVQsUUFBQyxDQUFBLFlBQUQsR0FBZ0IsUUFBUSxDQUFDOztFQUN6QixRQUFDLENBQUEscUNBQUQsR0FBeUMsUUFBUSxDQUFDOztFQUNsRCxRQUFDLENBQUEsMEJBQUQsR0FBOEIsUUFBUSxDQUFDOztFQUVqQyxRQUFDLENBQUE7QUFDTCxRQUFBOztJQUFBLFVBQUMsQ0FBQSxRQUFELEdBQ0U7TUFBQSxJQUFBLEVBQU0sSUFBTjtNQUNBLFFBQUEsRUFBVSxJQURWO01BRUEsTUFBQSxFQUFRLEdBRlI7TUFHQSxPQUFBLEVBQVMsU0FBQTtlQUFHO01BQUgsQ0FIVDtNQUlBLGdCQUFBLEVBQWtCLFFBQVEsQ0FBQywrQkFKM0I7TUFLQSxlQUFBLEVBQWlCLFFBQVEsQ0FBQyxtQkFMMUI7OztJQU9XLG9CQUFDLFFBQUQ7TUFBQyxJQUFDLENBQUEsNkJBQUQsV0FBUzs7O01BQ3JCLEtBQUssQ0FBQyxRQUFOLENBQWUsSUFBQyxDQUFBLE9BQWhCLEVBQXlCLFVBQVUsQ0FBQyxRQUFwQztNQUNBLFNBQVMsQ0FBQyxJQUFWLENBQWUsSUFBZjtNQUNBLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQztNQUNqQixJQUFDLENBQUEsUUFBRCxHQUFZLElBQUMsQ0FBQSxPQUFPLENBQUM7TUFDckIsSUFBQyxDQUFBLGFBQUQsR0FBaUIsS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFDLENBQUEsUUFBWjtNQUNqQixJQUFJLENBQUMsSUFBTCxDQUFVLElBQVY7SUFOVzs7eUJBUWIsR0FBQSxHQUFLLFNBQUE7QUFDSCxVQUFBO01BQUEsS0FBSyxDQUFDLEdBQU4sQ0FBVSx3QkFBQSxHQUF3QixDQUFDLElBQUksQ0FBQyxTQUFMLENBQWUsSUFBQyxDQUFBLE9BQWhCLENBQUQsQ0FBbEM7TUFDQSxJQUFHLE9BQUEsR0FBVSxJQUFDLENBQUEsa0JBQUQsQ0FBQSxDQUFiO1FBRUUsS0FBSyxDQUFDLEdBQU4sQ0FBYSxPQUFELEdBQVMsU0FBckI7ZUFDQSxJQUFDLENBQUEsZ0JBQUQsQ0FBa0IsT0FBbEIsRUFIRjtPQUFBLE1BQUE7ZUFLRSxJQUFDLENBQUEsOEJBQUQsQ0FBQSxFQUxGOztJQUZHOztJQVNMLElBQUEsR0FBTyxTQUFBO2FBQUcsSUFBQyxDQUFBLEdBQUQsQ0FBQTtJQUFIOzt5QkFFUCxnQkFBQSxHQUFrQixTQUFDLE9BQUQ7QUFDaEIsVUFBQTs7V0FBa0IsQ0FBRSxRQUFwQixDQUE2QixJQUE3Qjs7YUFDQSxJQUFDLENBQUEsT0FBRCxDQUFBLENBQVUsQ0FBQyxHQUFYLENBQWtCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVixHQUFlLFVBQWhDLEVBQTJDLE9BQTNDO0lBRmdCOzt5QkFLbEIsOEJBQUEsR0FBZ0MsU0FBQTtBQUM5QixVQUFBO01BQUEsSUFBQSxDQUFjLElBQUMsQ0FBQSxPQUFPLENBQUMsT0FBVCxDQUFBLENBQWQ7QUFBQSxlQUFBOztNQUNBLEtBQUssQ0FBQyxHQUFOLENBQVUsYUFBVjtNQUNBLElBQUEsQ0FBYyxJQUFDLENBQUEsU0FBRCxDQUFBLENBQWQ7QUFBQSxlQUFBOztNQUNBLEtBQUssQ0FBQyxHQUFOLENBQVUsV0FBVjtNQUNBLE9BQUEsR0FBVSxJQUFDLENBQUEsWUFBRCxDQUFBO01BQ1YsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUFXLENBQUMsZ0JBQVosQ0FBNkIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUF0QyxFQUE0QyxPQUE1QzthQUNBLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixPQUFsQjtJQVA4Qjs7eUJBU2hDLGFBQUEsR0FBZSxTQUFDLFNBQUQsRUFBWSxLQUFaO0FBQ2IsVUFBQTs7UUFEeUIsUUFBTTs7TUFDL0IsS0FBSyxDQUFDLFFBQU4sQ0FBZSxLQUFmLEVBQXNCO1FBQUMsTUFBQSxFQUFRLElBQVQ7T0FBdEI7TUFDQSxJQUFVLEtBQUssQ0FBQyxNQUFOLElBQWdCLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBVSxDQUFDLEdBQVgsQ0FBa0IsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFWLEdBQWUsR0FBZixHQUFrQixTQUFuQyxDQUExQjtBQUFBLGVBQUE7O01BQ0EsT0FBQSxHQUFVLElBQUMsQ0FBQSxrQkFBRCxDQUFBO01BQ1YsSUFBQSxDQUFjLE9BQWQ7QUFBQSxlQUFBOztNQUNBLElBQXlELEtBQUssQ0FBQyxNQUEvRDtRQUFBLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBVSxDQUFDLEdBQVgsQ0FBa0IsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFWLEdBQWUsR0FBZixHQUFrQixTQUFuQyxFQUFnRCxJQUFoRCxFQUFBOztNQUNBLEtBQUssQ0FBQyxHQUFOLENBQVUsY0FBQSxHQUFlLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBeEIsR0FBNkIsV0FBN0IsR0FBd0MsT0FBeEMsR0FBZ0QsUUFBaEQsR0FBd0QsU0FBeEQsR0FBa0UsV0FBNUU7YUFDQSxJQUFDLENBQUEsUUFBRCxDQUFBLENBQVcsQ0FBQyxhQUFaLENBQTBCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBbkMsRUFBeUMsT0FBekMsRUFBa0QsU0FBbEQ7SUFQYTs7eUJBU2Ysa0JBQUEsR0FBb0IsU0FBQTthQUNsQixJQUFDLENBQUEsT0FBRCxDQUFBLENBQVUsQ0FBQyxHQUFYLENBQWtCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVixHQUFlLFVBQWhDO0lBRGtCOzt5QkFHcEIsWUFBQSxHQUFjLFNBQUE7QUFDWixVQUFBO01BQUEsVUFBQSxHQUFhLEdBQUEsR0FBTSxJQUFDLENBQUEsYUFBYSxDQUFDO01BQ2xDLGdCQUFBLEdBQW1CLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFBLEdBQWdCLFVBQTNCO01BQ25CLE9BQUEsR0FBVSxJQUFDLENBQUEsYUFBYyxDQUFBLGdCQUFBO01BQ3pCLEtBQUssQ0FBQyxHQUFOLENBQWEsT0FBRCxHQUFTLFNBQXJCO2FBQ0E7SUFMWTs7eUJBT2QsU0FBQSxHQUFXLFNBQUE7QUFDVCxVQUFBO01BQUEsTUFBQSxHQUFTLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBVSxDQUFDLEdBQVgsQ0FBa0IsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFWLEdBQWUsWUFBaEM7TUFDVCxJQUFxQixPQUFPLE1BQVAsS0FBaUIsV0FBdEM7QUFBQSxlQUFPLE9BQVA7O01BQ0EsTUFBQSxHQUFTLElBQUksQ0FBQyxNQUFMLENBQUEsQ0FBQSxJQUFpQixJQUFDLENBQUEsT0FBTyxDQUFDO01BQ25DLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBVSxDQUFDLEdBQVgsQ0FBa0IsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFWLEdBQWUsWUFBaEMsRUFBNkMsTUFBN0M7YUFDQTtJQUxTOzt5QkFPWCxRQUFBLEdBQVUsU0FBQyxJQUFEO2FBQ1IsSUFBSSxDQUFDLGNBQUwsQ0FBb0IsSUFBcEI7SUFEUTs7eUJBR1YsU0FBQSxHQUFXLFNBQUMsS0FBRDtBQUNULFVBQUE7QUFBQTtXQUFBLHVDQUFBOztxQkFBQSxJQUFDLENBQUEsUUFBRCxDQUFVLElBQVY7QUFBQTs7SUFEUzs7eUJBR1gsT0FBQSxHQUFTLFNBQUE7YUFBRyxJQUFDLENBQUEsT0FBTyxDQUFDO0lBQVo7O3lCQUVULFFBQUEsR0FBVSxTQUFBO2FBQUcsSUFBQyxDQUFBLE9BQU8sQ0FBQztJQUFaOztJQUVWLFNBQUEsR0FBWSxTQUFBO01BQ1YsSUFBZ0QsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULEtBQWlCLElBQWpFO0FBQUEsY0FBTSx1Q0FBTjs7TUFDQSxJQUFxQyxJQUFDLENBQUEsT0FBTyxDQUFDLFFBQVQsS0FBcUIsSUFBMUQ7QUFBQSxjQUFNLDRCQUFOOztNQUNBLElBQXNDLE9BQU8sSUFBQyxDQUFBLE9BQU8sQ0FBQyxPQUFoQixLQUE2QixVQUFuRTtBQUFBLGNBQU0sNkJBQU47O0lBSFU7Ozs7OztFQU1SLFFBQUMsQ0FBQTtJQUNRLGNBQUMsSUFBRCxFQUFRLE1BQVI7TUFBQyxJQUFDLENBQUEsT0FBRDtNQUFPLElBQUMsQ0FBQSx5QkFBRCxTQUFPO01BQzFCLEtBQUssQ0FBQyxRQUFOLENBQWUsSUFBQyxDQUFBLEtBQWhCLEVBQXVCO1FBQUMsTUFBQSxFQUFRLElBQVQ7T0FBdkI7TUFDQSxJQUFDLENBQUEsV0FBRCxHQUFlO0lBRko7O21CQUliLGNBQUEsR0FBZ0IsU0FBQyxVQUFEO2FBQ2QsSUFBQyxDQUFBLFdBQVcsQ0FBQyxJQUFiLENBQWtCLFVBQWxCO0lBRGM7O21CQUdoQixlQUFBLEdBQWlCLFNBQUMsV0FBRDtBQUNmLFVBQUE7QUFBQTtXQUFBLDZDQUFBOztxQkFBQSxJQUFDLENBQUEsY0FBRCxDQUFnQixVQUFoQjtBQUFBOztJQURlOzttQkFHakIsUUFBQSxHQUFVLFNBQUE7QUFDUixVQUFBO0FBQUE7QUFBQTtXQUFBLHFDQUFBOztxQkFDRSxVQUFVLENBQUMsYUFBWCxDQUF5QixJQUFDLENBQUEsSUFBMUIsRUFBZ0MsSUFBQyxDQUFBLEtBQWpDO0FBREY7O0lBRFE7Ozs7Ozs7Ozs7QUFLZCxNQUFNLENBQUMsT0FBUCxHQUFpQjs7OztBQ2hIakIsTUFBTSxDQUFDLE9BQVAsR0FDRTtFQUFBLEtBQUEsRUFBTyxLQUFQOzs7OztBQ0RGLElBQUE7O0FBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxPQUFSOztBQUdGO0VBQ1MsaUJBQUMsU0FBRDtJQUFDLElBQUMsQ0FBQSxnQ0FBRCxZQUFXO0lBQ3ZCLElBQUEsQ0FBMkMsS0FBSyxDQUFDLE9BQWpEO0FBQUEsWUFBTSw4QkFBTjs7SUFDQSxJQUFDLENBQUEsT0FBRCxHQUFXLEtBQUssQ0FBQyxHQUFOLENBQVUsSUFBQyxDQUFBLFNBQVgsQ0FBQSxJQUF5QjtFQUZ6Qjs7b0JBR2IsR0FBQSxHQUFLLFNBQUMsR0FBRCxFQUFNLEtBQU47SUFDSCxJQUFDLENBQUEsT0FBUSxDQUFBLEdBQUEsQ0FBVCxHQUFnQjtJQUNoQixLQUFLLENBQUMsR0FBTixDQUFVLElBQUMsQ0FBQSxTQUFYLEVBQXNCLElBQUMsQ0FBQSxPQUF2QjtBQUNBLFdBQU87RUFISjs7b0JBSUwsR0FBQSxHQUFLLFNBQUMsR0FBRDtXQUNILElBQUMsQ0FBQSxPQUFRLENBQUEsR0FBQTtFQUROOzs7Ozs7QUFJUCxNQUFNLENBQUMsT0FBUCxHQUFpQjs7OztBQ2RqQixJQUFBOztBQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsZUFBUjs7QUFDSixJQUFBLEdBQU8sT0FBQSxDQUFRLFdBQVI7O0FBQ1AsT0FBQSxHQUFVLE9BQUEsQ0FBUSxXQUFSOztBQUVKOzs7RUFDSixLQUFDLENBQUEsUUFBRCxHQUFXLENBQUMsQ0FBQzs7RUFDYixLQUFDLENBQUEsSUFBRCxHQUFPLENBQUMsQ0FBQzs7RUFDVCxLQUFDLENBQUEsTUFBRCxHQUFTLENBQUMsQ0FBQzs7RUFDWCxLQUFDLENBQUEsR0FBRCxHQUFNLFNBQUMsT0FBRDtJQUNKLElBQXdCLE9BQU8sQ0FBQyxLQUFoQzthQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksT0FBWixFQUFBOztFQURJOztFQUVOLEtBQUMsQ0FBQSxJQUFELEdBQU8sSUFBSSxDQUFDOzs7Ozs7QUFFZCxNQUFNLENBQUMsT0FBUCxHQUFpQjs7Ozs7QUNiakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyAgICAgdXVpZC5qc1xuLy9cbi8vICAgICBDb3B5cmlnaHQgKGMpIDIwMTAtMjAxMiBSb2JlcnQgS2llZmZlclxuLy8gICAgIE1JVCBMaWNlbnNlIC0gaHR0cDovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBfZ2xvYmFsID0gdGhpcztcblxuICAvLyBVbmlxdWUgSUQgY3JlYXRpb24gcmVxdWlyZXMgYSBoaWdoIHF1YWxpdHkgcmFuZG9tICMgZ2VuZXJhdG9yLiAgV2UgZmVhdHVyZVxuICAvLyBkZXRlY3QgdG8gZGV0ZXJtaW5lIHRoZSBiZXN0IFJORyBzb3VyY2UsIG5vcm1hbGl6aW5nIHRvIGEgZnVuY3Rpb24gdGhhdFxuICAvLyByZXR1cm5zIDEyOC1iaXRzIG9mIHJhbmRvbW5lc3MsIHNpbmNlIHRoYXQncyB3aGF0J3MgdXN1YWxseSByZXF1aXJlZFxuICB2YXIgX3JuZztcblxuICAvLyBOb2RlLmpzIGNyeXB0by1iYXNlZCBSTkcgLSBodHRwOi8vbm9kZWpzLm9yZy9kb2NzL3YwLjYuMi9hcGkvY3J5cHRvLmh0bWxcbiAgLy9cbiAgLy8gTW9kZXJhdGVseSBmYXN0LCBoaWdoIHF1YWxpdHlcbiAgaWYgKHR5cGVvZihfZ2xvYmFsLnJlcXVpcmUpID09ICdmdW5jdGlvbicpIHtcbiAgICB0cnkge1xuICAgICAgdmFyIF9yYiA9IF9nbG9iYWwucmVxdWlyZSgnY3J5cHRvJykucmFuZG9tQnl0ZXM7XG4gICAgICBfcm5nID0gX3JiICYmIGZ1bmN0aW9uKCkge3JldHVybiBfcmIoMTYpO307XG4gICAgfSBjYXRjaChlKSB7fVxuICB9XG5cbiAgaWYgKCFfcm5nICYmIF9nbG9iYWwuY3J5cHRvICYmIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMpIHtcbiAgICAvLyBXSEFUV0cgY3J5cHRvLWJhc2VkIFJORyAtIGh0dHA6Ly93aWtpLndoYXR3Zy5vcmcvd2lraS9DcnlwdG9cbiAgICAvL1xuICAgIC8vIE1vZGVyYXRlbHkgZmFzdCwgaGlnaCBxdWFsaXR5XG4gICAgdmFyIF9ybmRzOCA9IG5ldyBVaW50OEFycmF5KDE2KTtcbiAgICBfcm5nID0gZnVuY3Rpb24gd2hhdHdnUk5HKCkge1xuICAgICAgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhfcm5kczgpO1xuICAgICAgcmV0dXJuIF9ybmRzODtcbiAgICB9O1xuICB9XG5cbiAgaWYgKCFfcm5nKSB7XG4gICAgLy8gTWF0aC5yYW5kb20oKS1iYXNlZCAoUk5HKVxuICAgIC8vXG4gICAgLy8gSWYgYWxsIGVsc2UgZmFpbHMsIHVzZSBNYXRoLnJhbmRvbSgpLiAgSXQncyBmYXN0LCBidXQgaXMgb2YgdW5zcGVjaWZpZWRcbiAgICAvLyBxdWFsaXR5LlxuICAgIHZhciAgX3JuZHMgPSBuZXcgQXJyYXkoMTYpO1xuICAgIF9ybmcgPSBmdW5jdGlvbigpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwLCByOyBpIDwgMTY7IGkrKykge1xuICAgICAgICBpZiAoKGkgJiAweDAzKSA9PT0gMCkgciA9IE1hdGgucmFuZG9tKCkgKiAweDEwMDAwMDAwMDtcbiAgICAgICAgX3JuZHNbaV0gPSByID4+PiAoKGkgJiAweDAzKSA8PCAzKSAmIDB4ZmY7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBfcm5kcztcbiAgICB9O1xuICB9XG5cbiAgLy8gQnVmZmVyIGNsYXNzIHRvIHVzZVxuICB2YXIgQnVmZmVyQ2xhc3MgPSB0eXBlb2YoX2dsb2JhbC5CdWZmZXIpID09ICdmdW5jdGlvbicgPyBfZ2xvYmFsLkJ1ZmZlciA6IEFycmF5O1xuXG4gIC8vIE1hcHMgZm9yIG51bWJlciA8LT4gaGV4IHN0cmluZyBjb252ZXJzaW9uXG4gIHZhciBfYnl0ZVRvSGV4ID0gW107XG4gIHZhciBfaGV4VG9CeXRlID0ge307XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgMjU2OyBpKyspIHtcbiAgICBfYnl0ZVRvSGV4W2ldID0gKGkgKyAweDEwMCkudG9TdHJpbmcoMTYpLnN1YnN0cigxKTtcbiAgICBfaGV4VG9CeXRlW19ieXRlVG9IZXhbaV1dID0gaTtcbiAgfVxuXG4gIC8vICoqYHBhcnNlKClgIC0gUGFyc2UgYSBVVUlEIGludG8gaXQncyBjb21wb25lbnQgYnl0ZXMqKlxuICBmdW5jdGlvbiBwYXJzZShzLCBidWYsIG9mZnNldCkge1xuICAgIHZhciBpID0gKGJ1ZiAmJiBvZmZzZXQpIHx8IDAsIGlpID0gMDtcblxuICAgIGJ1ZiA9IGJ1ZiB8fCBbXTtcbiAgICBzLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvWzAtOWEtZl17Mn0vZywgZnVuY3Rpb24ob2N0KSB7XG4gICAgICBpZiAoaWkgPCAxNikgeyAvLyBEb24ndCBvdmVyZmxvdyFcbiAgICAgICAgYnVmW2kgKyBpaSsrXSA9IF9oZXhUb0J5dGVbb2N0XTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFplcm8gb3V0IHJlbWFpbmluZyBieXRlcyBpZiBzdHJpbmcgd2FzIHNob3J0XG4gICAgd2hpbGUgKGlpIDwgMTYpIHtcbiAgICAgIGJ1ZltpICsgaWkrK10gPSAwO1xuICAgIH1cblxuICAgIHJldHVybiBidWY7XG4gIH1cblxuICAvLyAqKmB1bnBhcnNlKClgIC0gQ29udmVydCBVVUlEIGJ5dGUgYXJyYXkgKGFsYSBwYXJzZSgpKSBpbnRvIGEgc3RyaW5nKipcbiAgZnVuY3Rpb24gdW5wYXJzZShidWYsIG9mZnNldCkge1xuICAgIHZhciBpID0gb2Zmc2V0IHx8IDAsIGJ0aCA9IF9ieXRlVG9IZXg7XG4gICAgcmV0dXJuICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXSArXG4gICAgICAgICAgICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXSArICctJyArXG4gICAgICAgICAgICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXSArICctJyArXG4gICAgICAgICAgICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXSArICctJyArXG4gICAgICAgICAgICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXSArICctJyArXG4gICAgICAgICAgICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXSArXG4gICAgICAgICAgICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXSArXG4gICAgICAgICAgICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXTtcbiAgfVxuXG4gIC8vICoqYHYxKClgIC0gR2VuZXJhdGUgdGltZS1iYXNlZCBVVUlEKipcbiAgLy9cbiAgLy8gSW5zcGlyZWQgYnkgaHR0cHM6Ly9naXRodWIuY29tL0xpb3NLL1VVSUQuanNcbiAgLy8gYW5kIGh0dHA6Ly9kb2NzLnB5dGhvbi5vcmcvbGlicmFyeS91dWlkLmh0bWxcblxuICAvLyByYW5kb20gIydzIHdlIG5lZWQgdG8gaW5pdCBub2RlIGFuZCBjbG9ja3NlcVxuICB2YXIgX3NlZWRCeXRlcyA9IF9ybmcoKTtcblxuICAvLyBQZXIgNC41LCBjcmVhdGUgYW5kIDQ4LWJpdCBub2RlIGlkLCAoNDcgcmFuZG9tIGJpdHMgKyBtdWx0aWNhc3QgYml0ID0gMSlcbiAgdmFyIF9ub2RlSWQgPSBbXG4gICAgX3NlZWRCeXRlc1swXSB8IDB4MDEsXG4gICAgX3NlZWRCeXRlc1sxXSwgX3NlZWRCeXRlc1syXSwgX3NlZWRCeXRlc1szXSwgX3NlZWRCeXRlc1s0XSwgX3NlZWRCeXRlc1s1XVxuICBdO1xuXG4gIC8vIFBlciA0LjIuMiwgcmFuZG9taXplICgxNCBiaXQpIGNsb2Nrc2VxXG4gIHZhciBfY2xvY2tzZXEgPSAoX3NlZWRCeXRlc1s2XSA8PCA4IHwgX3NlZWRCeXRlc1s3XSkgJiAweDNmZmY7XG5cbiAgLy8gUHJldmlvdXMgdXVpZCBjcmVhdGlvbiB0aW1lXG4gIHZhciBfbGFzdE1TZWNzID0gMCwgX2xhc3ROU2VjcyA9IDA7XG5cbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9icm9vZmEvbm9kZS11dWlkIGZvciBBUEkgZGV0YWlsc1xuICBmdW5jdGlvbiB2MShvcHRpb25zLCBidWYsIG9mZnNldCkge1xuICAgIHZhciBpID0gYnVmICYmIG9mZnNldCB8fCAwO1xuICAgIHZhciBiID0gYnVmIHx8IFtdO1xuXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICB2YXIgY2xvY2tzZXEgPSBvcHRpb25zLmNsb2Nrc2VxICE9IG51bGwgPyBvcHRpb25zLmNsb2Nrc2VxIDogX2Nsb2Nrc2VxO1xuXG4gICAgLy8gVVVJRCB0aW1lc3RhbXBzIGFyZSAxMDAgbmFuby1zZWNvbmQgdW5pdHMgc2luY2UgdGhlIEdyZWdvcmlhbiBlcG9jaCxcbiAgICAvLyAoMTU4Mi0xMC0xNSAwMDowMCkuICBKU051bWJlcnMgYXJlbid0IHByZWNpc2UgZW5vdWdoIGZvciB0aGlzLCBzb1xuICAgIC8vIHRpbWUgaXMgaGFuZGxlZCBpbnRlcm5hbGx5IGFzICdtc2VjcycgKGludGVnZXIgbWlsbGlzZWNvbmRzKSBhbmQgJ25zZWNzJ1xuICAgIC8vICgxMDAtbmFub3NlY29uZHMgb2Zmc2V0IGZyb20gbXNlY3MpIHNpbmNlIHVuaXggZXBvY2gsIDE5NzAtMDEtMDEgMDA6MDAuXG4gICAgdmFyIG1zZWNzID0gb3B0aW9ucy5tc2VjcyAhPSBudWxsID8gb3B0aW9ucy5tc2VjcyA6IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXG4gICAgLy8gUGVyIDQuMi4xLjIsIHVzZSBjb3VudCBvZiB1dWlkJ3MgZ2VuZXJhdGVkIGR1cmluZyB0aGUgY3VycmVudCBjbG9ja1xuICAgIC8vIGN5Y2xlIHRvIHNpbXVsYXRlIGhpZ2hlciByZXNvbHV0aW9uIGNsb2NrXG4gICAgdmFyIG5zZWNzID0gb3B0aW9ucy5uc2VjcyAhPSBudWxsID8gb3B0aW9ucy5uc2VjcyA6IF9sYXN0TlNlY3MgKyAxO1xuXG4gICAgLy8gVGltZSBzaW5jZSBsYXN0IHV1aWQgY3JlYXRpb24gKGluIG1zZWNzKVxuICAgIHZhciBkdCA9IChtc2VjcyAtIF9sYXN0TVNlY3MpICsgKG5zZWNzIC0gX2xhc3ROU2VjcykvMTAwMDA7XG5cbiAgICAvLyBQZXIgNC4yLjEuMiwgQnVtcCBjbG9ja3NlcSBvbiBjbG9jayByZWdyZXNzaW9uXG4gICAgaWYgKGR0IDwgMCAmJiBvcHRpb25zLmNsb2Nrc2VxID09IG51bGwpIHtcbiAgICAgIGNsb2Nrc2VxID0gY2xvY2tzZXEgKyAxICYgMHgzZmZmO1xuICAgIH1cblxuICAgIC8vIFJlc2V0IG5zZWNzIGlmIGNsb2NrIHJlZ3Jlc3NlcyAobmV3IGNsb2Nrc2VxKSBvciB3ZSd2ZSBtb3ZlZCBvbnRvIGEgbmV3XG4gICAgLy8gdGltZSBpbnRlcnZhbFxuICAgIGlmICgoZHQgPCAwIHx8IG1zZWNzID4gX2xhc3RNU2VjcykgJiYgb3B0aW9ucy5uc2VjcyA9PSBudWxsKSB7XG4gICAgICBuc2VjcyA9IDA7XG4gICAgfVxuXG4gICAgLy8gUGVyIDQuMi4xLjIgVGhyb3cgZXJyb3IgaWYgdG9vIG1hbnkgdXVpZHMgYXJlIHJlcXVlc3RlZFxuICAgIGlmIChuc2VjcyA+PSAxMDAwMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCd1dWlkLnYxKCk6IENhblxcJ3QgY3JlYXRlIG1vcmUgdGhhbiAxME0gdXVpZHMvc2VjJyk7XG4gICAgfVxuXG4gICAgX2xhc3RNU2VjcyA9IG1zZWNzO1xuICAgIF9sYXN0TlNlY3MgPSBuc2VjcztcbiAgICBfY2xvY2tzZXEgPSBjbG9ja3NlcTtcblxuICAgIC8vIFBlciA0LjEuNCAtIENvbnZlcnQgZnJvbSB1bml4IGVwb2NoIHRvIEdyZWdvcmlhbiBlcG9jaFxuICAgIG1zZWNzICs9IDEyMjE5MjkyODAwMDAwO1xuXG4gICAgLy8gYHRpbWVfbG93YFxuICAgIHZhciB0bCA9ICgobXNlY3MgJiAweGZmZmZmZmYpICogMTAwMDAgKyBuc2VjcykgJSAweDEwMDAwMDAwMDtcbiAgICBiW2krK10gPSB0bCA+Pj4gMjQgJiAweGZmO1xuICAgIGJbaSsrXSA9IHRsID4+PiAxNiAmIDB4ZmY7XG4gICAgYltpKytdID0gdGwgPj4+IDggJiAweGZmO1xuICAgIGJbaSsrXSA9IHRsICYgMHhmZjtcblxuICAgIC8vIGB0aW1lX21pZGBcbiAgICB2YXIgdG1oID0gKG1zZWNzIC8gMHgxMDAwMDAwMDAgKiAxMDAwMCkgJiAweGZmZmZmZmY7XG4gICAgYltpKytdID0gdG1oID4+PiA4ICYgMHhmZjtcbiAgICBiW2krK10gPSB0bWggJiAweGZmO1xuXG4gICAgLy8gYHRpbWVfaGlnaF9hbmRfdmVyc2lvbmBcbiAgICBiW2krK10gPSB0bWggPj4+IDI0ICYgMHhmIHwgMHgxMDsgLy8gaW5jbHVkZSB2ZXJzaW9uXG4gICAgYltpKytdID0gdG1oID4+PiAxNiAmIDB4ZmY7XG5cbiAgICAvLyBgY2xvY2tfc2VxX2hpX2FuZF9yZXNlcnZlZGAgKFBlciA0LjIuMiAtIGluY2x1ZGUgdmFyaWFudClcbiAgICBiW2krK10gPSBjbG9ja3NlcSA+Pj4gOCB8IDB4ODA7XG5cbiAgICAvLyBgY2xvY2tfc2VxX2xvd2BcbiAgICBiW2krK10gPSBjbG9ja3NlcSAmIDB4ZmY7XG5cbiAgICAvLyBgbm9kZWBcbiAgICB2YXIgbm9kZSA9IG9wdGlvbnMubm9kZSB8fCBfbm9kZUlkO1xuICAgIGZvciAodmFyIG4gPSAwOyBuIDwgNjsgbisrKSB7XG4gICAgICBiW2kgKyBuXSA9IG5vZGVbbl07XG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1ZiA/IGJ1ZiA6IHVucGFyc2UoYik7XG4gIH1cblxuICAvLyAqKmB2NCgpYCAtIEdlbmVyYXRlIHJhbmRvbSBVVUlEKipcblxuICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2Jyb29mYS9ub2RlLXV1aWQgZm9yIEFQSSBkZXRhaWxzXG4gIGZ1bmN0aW9uIHY0KG9wdGlvbnMsIGJ1Ziwgb2Zmc2V0KSB7XG4gICAgLy8gRGVwcmVjYXRlZCAtICdmb3JtYXQnIGFyZ3VtZW50LCBhcyBzdXBwb3J0ZWQgaW4gdjEuMlxuICAgIHZhciBpID0gYnVmICYmIG9mZnNldCB8fCAwO1xuXG4gICAgaWYgKHR5cGVvZihvcHRpb25zKSA9PSAnc3RyaW5nJykge1xuICAgICAgYnVmID0gb3B0aW9ucyA9PSAnYmluYXJ5JyA/IG5ldyBCdWZmZXJDbGFzcygxNikgOiBudWxsO1xuICAgICAgb3B0aW9ucyA9IG51bGw7XG4gICAgfVxuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgdmFyIHJuZHMgPSBvcHRpb25zLnJhbmRvbSB8fCAob3B0aW9ucy5ybmcgfHwgX3JuZykoKTtcblxuICAgIC8vIFBlciA0LjQsIHNldCBiaXRzIGZvciB2ZXJzaW9uIGFuZCBgY2xvY2tfc2VxX2hpX2FuZF9yZXNlcnZlZGBcbiAgICBybmRzWzZdID0gKHJuZHNbNl0gJiAweDBmKSB8IDB4NDA7XG4gICAgcm5kc1s4XSA9IChybmRzWzhdICYgMHgzZikgfCAweDgwO1xuXG4gICAgLy8gQ29weSBieXRlcyB0byBidWZmZXIsIGlmIHByb3ZpZGVkXG4gICAgaWYgKGJ1Zikge1xuICAgICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IDE2OyBpaSsrKSB7XG4gICAgICAgIGJ1ZltpICsgaWldID0gcm5kc1tpaV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1ZiB8fCB1bnBhcnNlKHJuZHMpO1xuICB9XG5cbiAgLy8gRXhwb3J0IHB1YmxpYyBBUElcbiAgdmFyIHV1aWQgPSB2NDtcbiAgdXVpZC52MSA9IHYxO1xuICB1dWlkLnY0ID0gdjQ7XG4gIHV1aWQucGFyc2UgPSBwYXJzZTtcbiAgdXVpZC51bnBhcnNlID0gdW5wYXJzZTtcbiAgdXVpZC5CdWZmZXJDbGFzcyA9IEJ1ZmZlckNsYXNzO1xuXG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAvLyBQdWJsaXNoIGFzIEFNRCBtb2R1bGVcbiAgICBkZWZpbmUoZnVuY3Rpb24oKSB7cmV0dXJuIHV1aWQ7fSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mKG1vZHVsZSkgIT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAvLyBQdWJsaXNoIGFzIG5vZGUuanMgbW9kdWxlXG4gICAgbW9kdWxlLmV4cG9ydHMgPSB1dWlkO1xuICB9IGVsc2Uge1xuICAgIC8vIFB1Ymxpc2ggYXMgZ2xvYmFsIChpbiBicm93c2VycylcbiAgICB2YXIgX3ByZXZpb3VzUm9vdCA9IF9nbG9iYWwudXVpZDtcblxuICAgIC8vICoqYG5vQ29uZmxpY3QoKWAgLSAoYnJvd3NlciBvbmx5KSB0byByZXNldCBnbG9iYWwgJ3V1aWQnIHZhcioqXG4gICAgdXVpZC5ub0NvbmZsaWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgICBfZ2xvYmFsLnV1aWQgPSBfcHJldmlvdXNSb290O1xuICAgICAgcmV0dXJuIHV1aWQ7XG4gICAgfTtcblxuICAgIF9nbG9iYWwudXVpZCA9IHV1aWQ7XG4gIH1cbn0pLmNhbGwodGhpcyk7XG4iLCJcInVzZSBzdHJpY3RcIlxuLy8gTW9kdWxlIGV4cG9ydCBwYXR0ZXJuIGZyb21cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS91bWRqcy91bWQvYmxvYi9tYXN0ZXIvcmV0dXJuRXhwb3J0cy5qc1xuOyhmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuICAgICAgICBkZWZpbmUoW10sIGZhY3RvcnkpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIC8vIE5vZGUuIERvZXMgbm90IHdvcmsgd2l0aCBzdHJpY3QgQ29tbW9uSlMsIGJ1dFxuICAgICAgICAvLyBvbmx5IENvbW1vbkpTLWxpa2UgZW52aXJvbm1lbnRzIHRoYXQgc3VwcG9ydCBtb2R1bGUuZXhwb3J0cyxcbiAgICAgICAgLy8gbGlrZSBOb2RlLlxuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBCcm93c2VyIGdsb2JhbHMgKHJvb3QgaXMgd2luZG93KVxuICAgICAgICByb290LnN0b3JlID0gZmFjdG9yeSgpO1xuICB9XG59KHRoaXMsIGZ1bmN0aW9uICgpIHtcblx0XG5cdC8vIFN0b3JlLmpzXG5cdHZhciBzdG9yZSA9IHt9LFxuXHRcdHdpbiA9ICh0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnID8gd2luZG93IDogZ2xvYmFsKSxcblx0XHRkb2MgPSB3aW4uZG9jdW1lbnQsXG5cdFx0bG9jYWxTdG9yYWdlTmFtZSA9ICdsb2NhbFN0b3JhZ2UnLFxuXHRcdHNjcmlwdFRhZyA9ICdzY3JpcHQnLFxuXHRcdHN0b3JhZ2VcblxuXHRzdG9yZS5kaXNhYmxlZCA9IGZhbHNlXG5cdHN0b3JlLnZlcnNpb24gPSAnMS4zLjIwJ1xuXHRzdG9yZS5zZXQgPSBmdW5jdGlvbihrZXksIHZhbHVlKSB7fVxuXHRzdG9yZS5nZXQgPSBmdW5jdGlvbihrZXksIGRlZmF1bHRWYWwpIHt9XG5cdHN0b3JlLmhhcyA9IGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gc3RvcmUuZ2V0KGtleSkgIT09IHVuZGVmaW5lZCB9XG5cdHN0b3JlLnJlbW92ZSA9IGZ1bmN0aW9uKGtleSkge31cblx0c3RvcmUuY2xlYXIgPSBmdW5jdGlvbigpIHt9XG5cdHN0b3JlLnRyYW5zYWN0ID0gZnVuY3Rpb24oa2V5LCBkZWZhdWx0VmFsLCB0cmFuc2FjdGlvbkZuKSB7XG5cdFx0aWYgKHRyYW5zYWN0aW9uRm4gPT0gbnVsbCkge1xuXHRcdFx0dHJhbnNhY3Rpb25GbiA9IGRlZmF1bHRWYWxcblx0XHRcdGRlZmF1bHRWYWwgPSBudWxsXG5cdFx0fVxuXHRcdGlmIChkZWZhdWx0VmFsID09IG51bGwpIHtcblx0XHRcdGRlZmF1bHRWYWwgPSB7fVxuXHRcdH1cblx0XHR2YXIgdmFsID0gc3RvcmUuZ2V0KGtleSwgZGVmYXVsdFZhbClcblx0XHR0cmFuc2FjdGlvbkZuKHZhbClcblx0XHRzdG9yZS5zZXQoa2V5LCB2YWwpXG5cdH1cblx0c3RvcmUuZ2V0QWxsID0gZnVuY3Rpb24oKSB7fVxuXHRzdG9yZS5mb3JFYWNoID0gZnVuY3Rpb24oKSB7fVxuXG5cdHN0b3JlLnNlcmlhbGl6ZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0cmV0dXJuIEpTT04uc3RyaW5naWZ5KHZhbHVlKVxuXHR9XG5cdHN0b3JlLmRlc2VyaWFsaXplID0gZnVuY3Rpb24odmFsdWUpIHtcblx0XHRpZiAodHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSB7IHJldHVybiB1bmRlZmluZWQgfVxuXHRcdHRyeSB7IHJldHVybiBKU09OLnBhcnNlKHZhbHVlKSB9XG5cdFx0Y2F0Y2goZSkgeyByZXR1cm4gdmFsdWUgfHwgdW5kZWZpbmVkIH1cblx0fVxuXG5cdC8vIEZ1bmN0aW9ucyB0byBlbmNhcHN1bGF0ZSBxdWVzdGlvbmFibGUgRmlyZUZveCAzLjYuMTMgYmVoYXZpb3Jcblx0Ly8gd2hlbiBhYm91dC5jb25maWc6OmRvbS5zdG9yYWdlLmVuYWJsZWQgPT09IGZhbHNlXG5cdC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vbWFyY3Vzd2VzdGluL3N0b3JlLmpzL2lzc3VlcyNpc3N1ZS8xM1xuXHRmdW5jdGlvbiBpc0xvY2FsU3RvcmFnZU5hbWVTdXBwb3J0ZWQoKSB7XG5cdFx0dHJ5IHsgcmV0dXJuIChsb2NhbFN0b3JhZ2VOYW1lIGluIHdpbiAmJiB3aW5bbG9jYWxTdG9yYWdlTmFtZV0pIH1cblx0XHRjYXRjaChlcnIpIHsgcmV0dXJuIGZhbHNlIH1cblx0fVxuXG5cdGlmIChpc0xvY2FsU3RvcmFnZU5hbWVTdXBwb3J0ZWQoKSkge1xuXHRcdHN0b3JhZ2UgPSB3aW5bbG9jYWxTdG9yYWdlTmFtZV1cblx0XHRzdG9yZS5zZXQgPSBmdW5jdGlvbihrZXksIHZhbCkge1xuXHRcdFx0aWYgKHZhbCA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiBzdG9yZS5yZW1vdmUoa2V5KSB9XG5cdFx0XHRzdG9yYWdlLnNldEl0ZW0oa2V5LCBzdG9yZS5zZXJpYWxpemUodmFsKSlcblx0XHRcdHJldHVybiB2YWxcblx0XHR9XG5cdFx0c3RvcmUuZ2V0ID0gZnVuY3Rpb24oa2V5LCBkZWZhdWx0VmFsKSB7XG5cdFx0XHR2YXIgdmFsID0gc3RvcmUuZGVzZXJpYWxpemUoc3RvcmFnZS5nZXRJdGVtKGtleSkpXG5cdFx0XHRyZXR1cm4gKHZhbCA9PT0gdW5kZWZpbmVkID8gZGVmYXVsdFZhbCA6IHZhbClcblx0XHR9XG5cdFx0c3RvcmUucmVtb3ZlID0gZnVuY3Rpb24oa2V5KSB7IHN0b3JhZ2UucmVtb3ZlSXRlbShrZXkpIH1cblx0XHRzdG9yZS5jbGVhciA9IGZ1bmN0aW9uKCkgeyBzdG9yYWdlLmNsZWFyKCkgfVxuXHRcdHN0b3JlLmdldEFsbCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHJldCA9IHt9XG5cdFx0XHRzdG9yZS5mb3JFYWNoKGZ1bmN0aW9uKGtleSwgdmFsKSB7XG5cdFx0XHRcdHJldFtrZXldID0gdmFsXG5cdFx0XHR9KVxuXHRcdFx0cmV0dXJuIHJldFxuXHRcdH1cblx0XHRzdG9yZS5mb3JFYWNoID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcblx0XHRcdGZvciAodmFyIGk9MDsgaTxzdG9yYWdlLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciBrZXkgPSBzdG9yYWdlLmtleShpKVxuXHRcdFx0XHRjYWxsYmFjayhrZXksIHN0b3JlLmdldChrZXkpKVxuXHRcdFx0fVxuXHRcdH1cblx0fSBlbHNlIGlmIChkb2MgJiYgZG9jLmRvY3VtZW50RWxlbWVudC5hZGRCZWhhdmlvcikge1xuXHRcdHZhciBzdG9yYWdlT3duZXIsXG5cdFx0XHRzdG9yYWdlQ29udGFpbmVyXG5cdFx0Ly8gU2luY2UgI3VzZXJEYXRhIHN0b3JhZ2UgYXBwbGllcyBvbmx5IHRvIHNwZWNpZmljIHBhdGhzLCB3ZSBuZWVkIHRvXG5cdFx0Ly8gc29tZWhvdyBsaW5rIG91ciBkYXRhIHRvIGEgc3BlY2lmaWMgcGF0aC4gIFdlIGNob29zZSAvZmF2aWNvbi5pY29cblx0XHQvLyBhcyBhIHByZXR0eSBzYWZlIG9wdGlvbiwgc2luY2UgYWxsIGJyb3dzZXJzIGFscmVhZHkgbWFrZSBhIHJlcXVlc3QgdG9cblx0XHQvLyB0aGlzIFVSTCBhbnl3YXkgYW5kIGJlaW5nIGEgNDA0IHdpbGwgbm90IGh1cnQgdXMgaGVyZS4gIFdlIHdyYXAgYW5cblx0XHQvLyBpZnJhbWUgcG9pbnRpbmcgdG8gdGhlIGZhdmljb24gaW4gYW4gQWN0aXZlWE9iamVjdChodG1sZmlsZSkgb2JqZWN0XG5cdFx0Ly8gKHNlZTogaHR0cDovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L2FhNzUyNTc0KHY9VlMuODUpLmFzcHgpXG5cdFx0Ly8gc2luY2UgdGhlIGlmcmFtZSBhY2Nlc3MgcnVsZXMgYXBwZWFyIHRvIGFsbG93IGRpcmVjdCBhY2Nlc3MgYW5kXG5cdFx0Ly8gbWFuaXB1bGF0aW9uIG9mIHRoZSBkb2N1bWVudCBlbGVtZW50LCBldmVuIGZvciBhIDQwNCBwYWdlLiAgVGhpc1xuXHRcdC8vIGRvY3VtZW50IGNhbiBiZSB1c2VkIGluc3RlYWQgb2YgdGhlIGN1cnJlbnQgZG9jdW1lbnQgKHdoaWNoIHdvdWxkXG5cdFx0Ly8gaGF2ZSBiZWVuIGxpbWl0ZWQgdG8gdGhlIGN1cnJlbnQgcGF0aCkgdG8gcGVyZm9ybSAjdXNlckRhdGEgc3RvcmFnZS5cblx0XHR0cnkge1xuXHRcdFx0c3RvcmFnZUNvbnRhaW5lciA9IG5ldyBBY3RpdmVYT2JqZWN0KCdodG1sZmlsZScpXG5cdFx0XHRzdG9yYWdlQ29udGFpbmVyLm9wZW4oKVxuXHRcdFx0c3RvcmFnZUNvbnRhaW5lci53cml0ZSgnPCcrc2NyaXB0VGFnKyc+ZG9jdW1lbnQudz13aW5kb3c8Lycrc2NyaXB0VGFnKyc+PGlmcmFtZSBzcmM9XCIvZmF2aWNvbi5pY29cIj48L2lmcmFtZT4nKVxuXHRcdFx0c3RvcmFnZUNvbnRhaW5lci5jbG9zZSgpXG5cdFx0XHRzdG9yYWdlT3duZXIgPSBzdG9yYWdlQ29udGFpbmVyLncuZnJhbWVzWzBdLmRvY3VtZW50XG5cdFx0XHRzdG9yYWdlID0gc3RvcmFnZU93bmVyLmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG5cdFx0fSBjYXRjaChlKSB7XG5cdFx0XHQvLyBzb21laG93IEFjdGl2ZVhPYmplY3QgaW5zdGFudGlhdGlvbiBmYWlsZWQgKHBlcmhhcHMgc29tZSBzcGVjaWFsXG5cdFx0XHQvLyBzZWN1cml0eSBzZXR0aW5ncyBvciBvdGhlcndzZSksIGZhbGwgYmFjayB0byBwZXItcGF0aCBzdG9yYWdlXG5cdFx0XHRzdG9yYWdlID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG5cdFx0XHRzdG9yYWdlT3duZXIgPSBkb2MuYm9keVxuXHRcdH1cblx0XHR2YXIgd2l0aElFU3RvcmFnZSA9IGZ1bmN0aW9uKHN0b3JlRnVuY3Rpb24pIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApXG5cdFx0XHRcdGFyZ3MudW5zaGlmdChzdG9yYWdlKVxuXHRcdFx0XHQvLyBTZWUgaHR0cDovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L21zNTMxMDgxKHY9VlMuODUpLmFzcHhcblx0XHRcdFx0Ly8gYW5kIGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9tczUzMTQyNCh2PVZTLjg1KS5hc3B4XG5cdFx0XHRcdHN0b3JhZ2VPd25lci5hcHBlbmRDaGlsZChzdG9yYWdlKVxuXHRcdFx0XHRzdG9yYWdlLmFkZEJlaGF2aW9yKCcjZGVmYXVsdCN1c2VyRGF0YScpXG5cdFx0XHRcdHN0b3JhZ2UubG9hZChsb2NhbFN0b3JhZ2VOYW1lKVxuXHRcdFx0XHR2YXIgcmVzdWx0ID0gc3RvcmVGdW5jdGlvbi5hcHBseShzdG9yZSwgYXJncylcblx0XHRcdFx0c3RvcmFnZU93bmVyLnJlbW92ZUNoaWxkKHN0b3JhZ2UpXG5cdFx0XHRcdHJldHVybiByZXN1bHRcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBJbiBJRTcsIGtleXMgY2Fubm90IHN0YXJ0IHdpdGggYSBkaWdpdCBvciBjb250YWluIGNlcnRhaW4gY2hhcnMuXG5cdFx0Ly8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXJjdXN3ZXN0aW4vc3RvcmUuanMvaXNzdWVzLzQwXG5cdFx0Ly8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXJjdXN3ZXN0aW4vc3RvcmUuanMvaXNzdWVzLzgzXG5cdFx0dmFyIGZvcmJpZGRlbkNoYXJzUmVnZXggPSBuZXcgUmVnRXhwKFwiWyFcXFwiIyQlJicoKSorLC9cXFxcXFxcXDo7PD0+P0BbXFxcXF1eYHt8fX5dXCIsIFwiZ1wiKVxuXHRcdHZhciBpZUtleUZpeCA9IGZ1bmN0aW9uKGtleSkge1xuXHRcdFx0cmV0dXJuIGtleS5yZXBsYWNlKC9eZC8sICdfX18kJicpLnJlcGxhY2UoZm9yYmlkZGVuQ2hhcnNSZWdleCwgJ19fXycpXG5cdFx0fVxuXHRcdHN0b3JlLnNldCA9IHdpdGhJRVN0b3JhZ2UoZnVuY3Rpb24oc3RvcmFnZSwga2V5LCB2YWwpIHtcblx0XHRcdGtleSA9IGllS2V5Rml4KGtleSlcblx0XHRcdGlmICh2YWwgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gc3RvcmUucmVtb3ZlKGtleSkgfVxuXHRcdFx0c3RvcmFnZS5zZXRBdHRyaWJ1dGUoa2V5LCBzdG9yZS5zZXJpYWxpemUodmFsKSlcblx0XHRcdHN0b3JhZ2Uuc2F2ZShsb2NhbFN0b3JhZ2VOYW1lKVxuXHRcdFx0cmV0dXJuIHZhbFxuXHRcdH0pXG5cdFx0c3RvcmUuZ2V0ID0gd2l0aElFU3RvcmFnZShmdW5jdGlvbihzdG9yYWdlLCBrZXksIGRlZmF1bHRWYWwpIHtcblx0XHRcdGtleSA9IGllS2V5Rml4KGtleSlcblx0XHRcdHZhciB2YWwgPSBzdG9yZS5kZXNlcmlhbGl6ZShzdG9yYWdlLmdldEF0dHJpYnV0ZShrZXkpKVxuXHRcdFx0cmV0dXJuICh2YWwgPT09IHVuZGVmaW5lZCA/IGRlZmF1bHRWYWwgOiB2YWwpXG5cdFx0fSlcblx0XHRzdG9yZS5yZW1vdmUgPSB3aXRoSUVTdG9yYWdlKGZ1bmN0aW9uKHN0b3JhZ2UsIGtleSkge1xuXHRcdFx0a2V5ID0gaWVLZXlGaXgoa2V5KVxuXHRcdFx0c3RvcmFnZS5yZW1vdmVBdHRyaWJ1dGUoa2V5KVxuXHRcdFx0c3RvcmFnZS5zYXZlKGxvY2FsU3RvcmFnZU5hbWUpXG5cdFx0fSlcblx0XHRzdG9yZS5jbGVhciA9IHdpdGhJRVN0b3JhZ2UoZnVuY3Rpb24oc3RvcmFnZSkge1xuXHRcdFx0dmFyIGF0dHJpYnV0ZXMgPSBzdG9yYWdlLlhNTERvY3VtZW50LmRvY3VtZW50RWxlbWVudC5hdHRyaWJ1dGVzXG5cdFx0XHRzdG9yYWdlLmxvYWQobG9jYWxTdG9yYWdlTmFtZSlcblx0XHRcdGZvciAodmFyIGk9YXR0cmlidXRlcy5sZW5ndGgtMTsgaT49MDsgaS0tKSB7XG5cdFx0XHRcdHN0b3JhZ2UucmVtb3ZlQXR0cmlidXRlKGF0dHJpYnV0ZXNbaV0ubmFtZSlcblx0XHRcdH1cblx0XHRcdHN0b3JhZ2Uuc2F2ZShsb2NhbFN0b3JhZ2VOYW1lKVxuXHRcdH0pXG5cdFx0c3RvcmUuZ2V0QWxsID0gZnVuY3Rpb24oc3RvcmFnZSkge1xuXHRcdFx0dmFyIHJldCA9IHt9XG5cdFx0XHRzdG9yZS5mb3JFYWNoKGZ1bmN0aW9uKGtleSwgdmFsKSB7XG5cdFx0XHRcdHJldFtrZXldID0gdmFsXG5cdFx0XHR9KVxuXHRcdFx0cmV0dXJuIHJldFxuXHRcdH1cblx0XHRzdG9yZS5mb3JFYWNoID0gd2l0aElFU3RvcmFnZShmdW5jdGlvbihzdG9yYWdlLCBjYWxsYmFjaykge1xuXHRcdFx0dmFyIGF0dHJpYnV0ZXMgPSBzdG9yYWdlLlhNTERvY3VtZW50LmRvY3VtZW50RWxlbWVudC5hdHRyaWJ1dGVzXG5cdFx0XHRmb3IgKHZhciBpPTAsIGF0dHI7IGF0dHI9YXR0cmlidXRlc1tpXTsgKytpKSB7XG5cdFx0XHRcdGNhbGxiYWNrKGF0dHIubmFtZSwgc3RvcmUuZGVzZXJpYWxpemUoc3RvcmFnZS5nZXRBdHRyaWJ1dGUoYXR0ci5uYW1lKSkpXG5cdFx0XHR9XG5cdFx0fSlcblx0fVxuXG5cdHRyeSB7XG5cdFx0dmFyIHRlc3RLZXkgPSAnX19zdG9yZWpzX18nXG5cdFx0c3RvcmUuc2V0KHRlc3RLZXksIHRlc3RLZXkpXG5cdFx0aWYgKHN0b3JlLmdldCh0ZXN0S2V5KSAhPSB0ZXN0S2V5KSB7IHN0b3JlLmRpc2FibGVkID0gdHJ1ZSB9XG5cdFx0c3RvcmUucmVtb3ZlKHRlc3RLZXkpXG5cdH0gY2F0Y2goZSkge1xuXHRcdHN0b3JlLmRpc2FibGVkID0gdHJ1ZVxuXHR9XG5cdHN0b3JlLmVuYWJsZWQgPSAhc3RvcmUuZGlzYWJsZWRcblx0XG5cdHJldHVybiBzdG9yZVxufSkpO1xuIiwidXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJylcblN0b3JhZ2UgPSByZXF1aXJlKCcuL3N0b3JhZ2UnKVxuXG5jbGFzcyBBZGFwdGVyc1xuXG4gICMjIEFkYXB0ZXIgZm9yIHVzaW5nIHRoZSBnaW1lbCBiYWNrZW5kLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL0FsZXBoYmV0L2dpbWVsXG4gICMjIHVzZXMgalF1ZXJ5IHRvIHNlbmQgZGF0YSBpZiBgJC5hamF4YCBpcyBmb3VuZC4gRmFsbHMgYmFjayBvbiBwbGFpbiBqcyB4aHJcbiAgIyMgcGFyYW1zOlxuICAjIyAtIHVybDogR2ltZWwgdHJhY2sgVVJMIHRvIHBvc3QgZXZlbnRzIHRvXG4gICMjIC0gbmFtZXBzYWNlOiBuYW1lc3BhY2UgZm9yIEdpbWVsIChhbGxvd3Mgc2V0dGluZyBkaWZmZXJlbnQgZW52aXJvbm1lbnRzIGV0YylcbiAgIyMgLSBzdG9yYWdlIChvcHRpb25hbCkgLSBzdG9yYWdlIGFkYXB0ZXIgZm9yIHRoZSBxdWV1ZVxuICBjbGFzcyBAR2ltZWxBZGFwdGVyXG4gICAgcXVldWVfbmFtZTogJ19naW1lbF9xdWV1ZSdcblxuICAgIGNvbnN0cnVjdG9yOiAodXJsLCBuYW1lc3BhY2UsIHN0b3JhZ2UgPSBBZGFwdGVycy5Mb2NhbFN0b3JhZ2VBZGFwdGVyKSAtPlxuICAgICAgQF9zdG9yYWdlID0gc3RvcmFnZVxuICAgICAgQHVybCA9IHVybFxuICAgICAgQG5hbWVzcGFjZSA9IG5hbWVzcGFjZVxuICAgICAgQF9xdWV1ZSA9IEpTT04ucGFyc2UoQF9zdG9yYWdlLmdldChAcXVldWVfbmFtZSkgfHwgJ1tdJylcbiAgICAgIEBfZmx1c2goKVxuXG4gICAgX3JlbW92ZV91dWlkOiAodXVpZCkgLT5cbiAgICAgIChlcnIsIHJlcykgPT5cbiAgICAgICAgcmV0dXJuIGlmIGVyclxuICAgICAgICB1dGlscy5yZW1vdmUoQF9xdWV1ZSwgKGVsKSAtPiBlbC5wcm9wZXJ0aWVzLnV1aWQgPT0gdXVpZClcbiAgICAgICAgQF9zdG9yYWdlLnNldChAcXVldWVfbmFtZSwgSlNPTi5zdHJpbmdpZnkoQF9xdWV1ZSkpXG5cbiAgICBfanF1ZXJ5X2dldDogKHVybCwgZGF0YSwgY2FsbGJhY2spIC0+XG4gICAgICB1dGlscy5sb2coJ3NlbmQgcmVxdWVzdCB1c2luZyBqUXVlcnknKVxuICAgICAgJC5hamF4XG4gICAgICAgIG1ldGhvZDogJ0dFVCdcbiAgICAgICAgdXJsOiB1cmxcbiAgICAgICAgZGF0YTogZGF0YVxuICAgICAgICBzdWNjZXNzOiBjYWxsYmFja1xuXG4gICAgX3BsYWluX2pzX2dldDogKHVybCwgZGF0YSwgY2FsbGJhY2spIC0+XG4gICAgICB1dGlscy5sb2coJ2ZhbGxiYWNrIG9uIHBsYWluIGpzIHhocicpXG4gICAgICB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuICAgICAgcGFyYW1zID0gKFwiI3tlbmNvZGVVUklDb21wb25lbnQoayl9PSN7ZW5jb2RlVVJJQ29tcG9uZW50KHYpfVwiIGZvciBrLHYgb2YgZGF0YSlcbiAgICAgIHBhcmFtcyA9IHBhcmFtcy5qb2luKCcmJykucmVwbGFjZSgvJTIwL2csICcrJylcbiAgICAgIHhoci5vcGVuKCdHRVQnLCBcIiN7dXJsfT8je3BhcmFtc31cIilcbiAgICAgIHhoci5vbmxvYWQgPSAtPlxuICAgICAgICBpZiB4aHIuc3RhdHVzID09IDIwMFxuICAgICAgICAgIGNhbGxiYWNrKClcbiAgICAgIHhoci5zZW5kKClcblxuICAgIF9hamF4X2dldDogKHVybCwgZGF0YSwgY2FsbGJhY2spIC0+XG4gICAgICBpZiAkPy5hamF4XG4gICAgICAgIEBfanF1ZXJ5X2dldCh1cmwsIGRhdGEsIGNhbGxiYWNrKVxuICAgICAgZWxzZVxuICAgICAgICBAX3BsYWluX2pzX2dldCh1cmwsIGRhdGEsIGNhbGxiYWNrKVxuXG4gICAgX2ZsdXNoOiAtPlxuICAgICAgZm9yIGl0ZW0gaW4gQF9xdWV1ZVxuICAgICAgICBjYWxsYmFjayA9IEBfcmVtb3ZlX3V1aWQoaXRlbS5wcm9wZXJ0aWVzLnV1aWQpXG4gICAgICAgIEBfYWpheF9nZXQoQHVybCwgaXRlbS5wcm9wZXJ0aWVzLCBjYWxsYmFjaylcbiAgICAgICAgbnVsbFxuXG4gICAgX3RyYWNrOiAoZXhwZXJpbWVudF9uYW1lLCB2YXJpYW50LCBldmVudCkgLT5cbiAgICAgIHV0aWxzLmxvZyhcIlBlcnNpc3RlbnQgUXVldWUgR2ltZWwgdHJhY2s6ICN7QG5hbWVzcGFjZX0sICN7ZXhwZXJpbWVudF9uYW1lfSwgI3t2YXJpYW50fSwgI3tldmVudH1cIilcbiAgICAgIEBfcXVldWUuc2hpZnQoKSBpZiBAX3F1ZXVlLmxlbmd0aCA+IDEwMFxuICAgICAgQF9xdWV1ZS5wdXNoXG4gICAgICAgIHByb3BlcnRpZXM6XG4gICAgICAgICAgZXhwZXJpbWVudDogZXhwZXJpbWVudF9uYW1lXG4gICAgICAgICAgdXVpZDogdXRpbHMudXVpZCgpXG4gICAgICAgICAgdmFyaWFudDogdmFyaWFudFxuICAgICAgICAgIGV2ZW50OiBldmVudFxuICAgICAgICAgIG5hbWVzcGFjZTogQG5hbWVzcGFjZVxuICAgICAgQF9zdG9yYWdlLnNldChAcXVldWVfbmFtZSwgSlNPTi5zdHJpbmdpZnkoQF9xdWV1ZSkpXG4gICAgICBAX2ZsdXNoKClcblxuICAgIGV4cGVyaW1lbnRfc3RhcnQ6IChleHBlcmltZW50X25hbWUsIHZhcmlhbnQpID0+XG4gICAgICBAX3RyYWNrKGV4cGVyaW1lbnRfbmFtZSwgdmFyaWFudCwgJ3BhcnRpY2lwYXRlJylcblxuICAgIGdvYWxfY29tcGxldGU6IChleHBlcmltZW50X25hbWUsIHZhcmlhbnQsIGdvYWwpID0+XG4gICAgICBAX3RyYWNrKGV4cGVyaW1lbnRfbmFtZSwgdmFyaWFudCwgZ29hbClcblxuXG4gIGNsYXNzIEBQZXJzaXN0ZW50UXVldWVHb29nbGVBbmFseXRpY3NBZGFwdGVyXG4gICAgbmFtZXNwYWNlOiAnYWxlcGhiZXQnXG4gICAgcXVldWVfbmFtZTogJ19nYV9xdWV1ZSdcblxuICAgIGNvbnN0cnVjdG9yOiAoc3RvcmFnZSA9IEFkYXB0ZXJzLkxvY2FsU3RvcmFnZUFkYXB0ZXIpIC0+XG4gICAgICBAX3N0b3JhZ2UgPSBzdG9yYWdlXG4gICAgICBAX3F1ZXVlID0gSlNPTi5wYXJzZShAX3N0b3JhZ2UuZ2V0KEBxdWV1ZV9uYW1lKSB8fCAnW10nKVxuICAgICAgQF9mbHVzaCgpXG5cbiAgICBfcmVtb3ZlX3V1aWQ6ICh1dWlkKSAtPlxuICAgICAgPT5cbiAgICAgICAgdXRpbHMucmVtb3ZlKEBfcXVldWUsIChlbCkgLT4gZWwudXVpZCA9PSB1dWlkKVxuICAgICAgICBAX3N0b3JhZ2Uuc2V0KEBxdWV1ZV9uYW1lLCBKU09OLnN0cmluZ2lmeShAX3F1ZXVlKSlcblxuICAgIF9mbHVzaDogLT5cbiAgICAgIHRocm93ICdnYSBub3QgZGVmaW5lZC4gUGxlYXNlIG1ha2Ugc3VyZSB5b3VyIFVuaXZlcnNhbCBhbmFseXRpY3MgaXMgc2V0IHVwIGNvcnJlY3RseScgaWYgdHlwZW9mIGdhIGlzbnQgJ2Z1bmN0aW9uJ1xuICAgICAgZm9yIGl0ZW0gaW4gQF9xdWV1ZVxuICAgICAgICBjYWxsYmFjayA9IEBfcmVtb3ZlX3V1aWQoaXRlbS51dWlkKVxuICAgICAgICBnYSgnc2VuZCcsICdldmVudCcsIGl0ZW0uY2F0ZWdvcnksIGl0ZW0uYWN0aW9uLCBpdGVtLmxhYmVsLCB7J2hpdENhbGxiYWNrJzogY2FsbGJhY2ssICdub25JbnRlcmFjdGlvbic6IDF9KVxuXG4gICAgX3RyYWNrOiAoY2F0ZWdvcnksIGFjdGlvbiwgbGFiZWwpIC0+XG4gICAgICB1dGlscy5sb2coXCJQZXJzaXN0ZW50IFF1ZXVlIEdvb2dsZSBVbml2ZXJzYWwgQW5hbHl0aWNzIHRyYWNrOiAje2NhdGVnb3J5fSwgI3thY3Rpb259LCAje2xhYmVsfVwiKVxuICAgICAgQF9xdWV1ZS5zaGlmdCgpIGlmIEBfcXVldWUubGVuZ3RoID4gMTAwXG4gICAgICBAX3F1ZXVlLnB1c2goe3V1aWQ6IHV0aWxzLnV1aWQoKSwgY2F0ZWdvcnk6IGNhdGVnb3J5LCBhY3Rpb246IGFjdGlvbiwgbGFiZWw6IGxhYmVsfSlcbiAgICAgIEBfc3RvcmFnZS5zZXQoQHF1ZXVlX25hbWUsIEpTT04uc3RyaW5naWZ5KEBfcXVldWUpKVxuICAgICAgQF9mbHVzaCgpXG5cbiAgICBleHBlcmltZW50X3N0YXJ0OiAoZXhwZXJpbWVudF9uYW1lLCB2YXJpYW50KSA9PlxuICAgICAgQF90cmFjayhAbmFtZXNwYWNlLCBcIiN7ZXhwZXJpbWVudF9uYW1lfSB8ICN7dmFyaWFudH1cIiwgJ1Zpc2l0b3JzJylcblxuICAgIGdvYWxfY29tcGxldGU6IChleHBlcmltZW50X25hbWUsIHZhcmlhbnQsIGdvYWwpID0+XG4gICAgICBAX3RyYWNrKEBuYW1lc3BhY2UsIFwiI3tleHBlcmltZW50X25hbWV9IHwgI3t2YXJpYW50fVwiLCBnb2FsKVxuXG5cbiAgY2xhc3MgQFBlcnNpc3RlbnRRdWV1ZUtlZW5BZGFwdGVyXG4gICAgcXVldWVfbmFtZTogJ19rZWVuX3F1ZXVlJ1xuXG4gICAgY29uc3RydWN0b3I6IChrZWVuX2NsaWVudCwgc3RvcmFnZSA9IEFkYXB0ZXJzLkxvY2FsU3RvcmFnZUFkYXB0ZXIpIC0+XG4gICAgICBAY2xpZW50ID0ga2Vlbl9jbGllbnRcbiAgICAgIEBfc3RvcmFnZSA9IHN0b3JhZ2VcbiAgICAgIEBfcXVldWUgPSBKU09OLnBhcnNlKEBfc3RvcmFnZS5nZXQoQHF1ZXVlX25hbWUpIHx8ICdbXScpXG4gICAgICBAX2ZsdXNoKClcblxuICAgIF9yZW1vdmVfdXVpZDogKHV1aWQpIC0+XG4gICAgICAoZXJyLCByZXMpID0+XG4gICAgICAgIHJldHVybiBpZiBlcnJcbiAgICAgICAgdXRpbHMucmVtb3ZlKEBfcXVldWUsIChlbCkgLT4gZWwucHJvcGVydGllcy51dWlkID09IHV1aWQpXG4gICAgICAgIEBfc3RvcmFnZS5zZXQoQHF1ZXVlX25hbWUsIEpTT04uc3RyaW5naWZ5KEBfcXVldWUpKVxuXG4gICAgX2ZsdXNoOiAtPlxuICAgICAgZm9yIGl0ZW0gaW4gQF9xdWV1ZVxuICAgICAgICBjYWxsYmFjayA9IEBfcmVtb3ZlX3V1aWQoaXRlbS5wcm9wZXJ0aWVzLnV1aWQpXG4gICAgICAgIEBjbGllbnQuYWRkRXZlbnQoaXRlbS5leHBlcmltZW50X25hbWUsIGl0ZW0ucHJvcGVydGllcywgY2FsbGJhY2spXG5cbiAgICBfdHJhY2s6IChleHBlcmltZW50X25hbWUsIHZhcmlhbnQsIGV2ZW50KSAtPlxuICAgICAgdXRpbHMubG9nKFwiUGVyc2lzdGVudCBRdWV1ZSBLZWVuIHRyYWNrOiAje2V4cGVyaW1lbnRfbmFtZX0sICN7dmFyaWFudH0sICN7ZXZlbnR9XCIpXG4gICAgICBAX3F1ZXVlLnNoaWZ0KCkgaWYgQF9xdWV1ZS5sZW5ndGggPiAxMDBcbiAgICAgIEBfcXVldWUucHVzaFxuICAgICAgICBleHBlcmltZW50X25hbWU6IGV4cGVyaW1lbnRfbmFtZVxuICAgICAgICBwcm9wZXJ0aWVzOlxuICAgICAgICAgIHV1aWQ6IHV0aWxzLnV1aWQoKVxuICAgICAgICAgIHZhcmlhbnQ6IHZhcmlhbnRcbiAgICAgICAgICBldmVudDogZXZlbnRcbiAgICAgIEBfc3RvcmFnZS5zZXQoQHF1ZXVlX25hbWUsIEpTT04uc3RyaW5naWZ5KEBfcXVldWUpKVxuICAgICAgQF9mbHVzaCgpXG5cbiAgICBleHBlcmltZW50X3N0YXJ0OiAoZXhwZXJpbWVudF9uYW1lLCB2YXJpYW50KSA9PlxuICAgICAgQF90cmFjayhleHBlcmltZW50X25hbWUsIHZhcmlhbnQsICdwYXJ0aWNpcGF0ZScpXG5cbiAgICBnb2FsX2NvbXBsZXRlOiAoZXhwZXJpbWVudF9uYW1lLCB2YXJpYW50LCBnb2FsKSA9PlxuICAgICAgQF90cmFjayhleHBlcmltZW50X25hbWUsIHZhcmlhbnQsIGdvYWwpXG5cblxuICBjbGFzcyBAR29vZ2xlVW5pdmVyc2FsQW5hbHl0aWNzQWRhcHRlclxuICAgIEBuYW1lc3BhY2U6ICdhbGVwaGJldCdcblxuICAgIEBfdHJhY2s6IChjYXRlZ29yeSwgYWN0aW9uLCBsYWJlbCkgLT5cbiAgICAgIHV0aWxzLmxvZyhcIkdvb2dsZSBVbml2ZXJzYWwgQW5hbHl0aWNzIHRyYWNrOiAje2NhdGVnb3J5fSwgI3thY3Rpb259LCAje2xhYmVsfVwiKVxuICAgICAgdGhyb3cgJ2dhIG5vdCBkZWZpbmVkLiBQbGVhc2UgbWFrZSBzdXJlIHlvdXIgVW5pdmVyc2FsIGFuYWx5dGljcyBpcyBzZXQgdXAgY29ycmVjdGx5JyBpZiB0eXBlb2YgZ2EgaXNudCAnZnVuY3Rpb24nXG4gICAgICBnYSgnc2VuZCcsICdldmVudCcsIGNhdGVnb3J5LCBhY3Rpb24sIGxhYmVsLCB7J25vbkludGVyYWN0aW9uJzogMX0pXG5cbiAgICBAZXhwZXJpbWVudF9zdGFydDogKGV4cGVyaW1lbnRfbmFtZSwgdmFyaWFudCkgPT5cbiAgICAgIEBfdHJhY2soQG5hbWVzcGFjZSwgXCIje2V4cGVyaW1lbnRfbmFtZX0gfCAje3ZhcmlhbnR9XCIsICdWaXNpdG9ycycpXG5cbiAgICBAZ29hbF9jb21wbGV0ZTogKGV4cGVyaW1lbnRfbmFtZSwgdmFyaWFudCwgZ29hbCkgPT5cbiAgICAgIEBfdHJhY2soQG5hbWVzcGFjZSwgXCIje2V4cGVyaW1lbnRfbmFtZX0gfCAje3ZhcmlhbnR9XCIsIGdvYWwpXG5cblxuICBjbGFzcyBATG9jYWxTdG9yYWdlQWRhcHRlclxuICAgIEBuYW1lc3BhY2U6ICdhbGVwaGJldCdcbiAgICBAc2V0OiAoa2V5LCB2YWx1ZSkgLT5cbiAgICAgIG5ldyBTdG9yYWdlKEBuYW1lc3BhY2UpLnNldChrZXksIHZhbHVlKVxuICAgIEBnZXQ6IChrZXkpIC0+XG4gICAgICBuZXcgU3RvcmFnZShAbmFtZXNwYWNlKS5nZXQoa2V5KVxuXG5cbm1vZHVsZS5leHBvcnRzID0gQWRhcHRlcnNcbiIsInV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpXG5hZGFwdGVycyA9IHJlcXVpcmUoJy4vYWRhcHRlcnMnKVxub3B0aW9ucyA9IHJlcXVpcmUoJy4vb3B0aW9ucycpXG5cbmNsYXNzIEFsZXBoQmV0XG4gIEBvcHRpb25zID0gb3B0aW9uc1xuICBAdXRpbHMgPSB1dGlsc1xuXG4gIEBHaW1lbEFkYXB0ZXIgPSBhZGFwdGVycy5HaW1lbEFkYXB0ZXJcbiAgQFBlcnNpc3RlbnRRdWV1ZUdvb2dsZUFuYWx5dGljc0FkYXB0ZXIgPSBhZGFwdGVycy5QZXJzaXN0ZW50UXVldWVHb29nbGVBbmFseXRpY3NBZGFwdGVyXG4gIEBQZXJzaXN0ZW50UXVldWVLZWVuQWRhcHRlciA9IGFkYXB0ZXJzLlBlcnNpc3RlbnRRdWV1ZUtlZW5BZGFwdGVyXG5cbiAgY2xhc3MgQEV4cGVyaW1lbnRcbiAgICBAX29wdGlvbnM6XG4gICAgICBuYW1lOiBudWxsXG4gICAgICB2YXJpYW50czogbnVsbFxuICAgICAgc2FtcGxlOiAxLjBcbiAgICAgIHRyaWdnZXI6IC0+IHRydWVcbiAgICAgIHRyYWNraW5nX2FkYXB0ZXI6IGFkYXB0ZXJzLkdvb2dsZVVuaXZlcnNhbEFuYWx5dGljc0FkYXB0ZXJcbiAgICAgIHN0b3JhZ2VfYWRhcHRlcjogYWRhcHRlcnMuTG9jYWxTdG9yYWdlQWRhcHRlclxuXG4gICAgY29uc3RydWN0b3I6IChAb3B0aW9ucz17fSkgLT5cbiAgICAgIHV0aWxzLmRlZmF1bHRzKEBvcHRpb25zLCBFeHBlcmltZW50Ll9vcHRpb25zKVxuICAgICAgX3ZhbGlkYXRlLmNhbGwodGhpcylcbiAgICAgIEBuYW1lID0gQG9wdGlvbnMubmFtZVxuICAgICAgQHZhcmlhbnRzID0gQG9wdGlvbnMudmFyaWFudHNcbiAgICAgIEB2YXJpYW50X25hbWVzID0gdXRpbHMua2V5cyhAdmFyaWFudHMpXG4gICAgICBfcnVuLmNhbGwodGhpcylcblxuICAgIHJ1bjogLT5cbiAgICAgIHV0aWxzLmxvZyhcInJ1bm5pbmcgd2l0aCBvcHRpb25zOiAje0pTT04uc3RyaW5naWZ5KEBvcHRpb25zKX1cIilcbiAgICAgIGlmIHZhcmlhbnQgPSBAZ2V0X3N0b3JlZF92YXJpYW50KClcbiAgICAgICAgIyBhIHZhcmlhbnQgd2FzIGFscmVhZHkgY2hvc2VuLiBhY3RpdmF0ZSBpdFxuICAgICAgICB1dGlscy5sb2coXCIje3ZhcmlhbnR9IGFjdGl2ZVwiKVxuICAgICAgICBAYWN0aXZhdGVfdmFyaWFudCh2YXJpYW50KVxuICAgICAgZWxzZVxuICAgICAgICBAY29uZGl0aW9uYWxseV9hY3RpdmF0ZV92YXJpYW50KClcblxuICAgIF9ydW4gPSAtPiBAcnVuKClcblxuICAgIGFjdGl2YXRlX3ZhcmlhbnQ6ICh2YXJpYW50KSAtPlxuICAgICAgQHZhcmlhbnRzW3ZhcmlhbnRdPy5hY3RpdmF0ZSh0aGlzKVxuICAgICAgQHN0b3JhZ2UoKS5zZXQoXCIje0BvcHRpb25zLm5hbWV9OnZhcmlhbnRcIiwgdmFyaWFudClcblxuICAgICMgaWYgZXhwZXJpbWVudCBjb25kaXRpb25zIG1hdGNoLCBwaWNrIGFuZCBhY3RpdmF0ZSBhIHZhcmlhbnQsIHRyYWNrIGV4cGVyaW1lbnQgc3RhcnRcbiAgICBjb25kaXRpb25hbGx5X2FjdGl2YXRlX3ZhcmlhbnQ6IC0+XG4gICAgICByZXR1cm4gdW5sZXNzIEBvcHRpb25zLnRyaWdnZXIoKVxuICAgICAgdXRpbHMubG9nKCd0cmlnZ2VyIHNldCcpXG4gICAgICByZXR1cm4gdW5sZXNzIEBpbl9zYW1wbGUoKVxuICAgICAgdXRpbHMubG9nKCdpbiBzYW1wbGUnKVxuICAgICAgdmFyaWFudCA9IEBwaWNrX3ZhcmlhbnQoKVxuICAgICAgQHRyYWNraW5nKCkuZXhwZXJpbWVudF9zdGFydChAb3B0aW9ucy5uYW1lLCB2YXJpYW50KVxuICAgICAgQGFjdGl2YXRlX3ZhcmlhbnQodmFyaWFudClcblxuICAgIGdvYWxfY29tcGxldGU6IChnb2FsX25hbWUsIHByb3BzPXt9KSAtPlxuICAgICAgdXRpbHMuZGVmYXVsdHMocHJvcHMsIHt1bmlxdWU6IHRydWV9KVxuICAgICAgcmV0dXJuIGlmIHByb3BzLnVuaXF1ZSAmJiBAc3RvcmFnZSgpLmdldChcIiN7QG9wdGlvbnMubmFtZX06I3tnb2FsX25hbWV9XCIpXG4gICAgICB2YXJpYW50ID0gQGdldF9zdG9yZWRfdmFyaWFudCgpXG4gICAgICByZXR1cm4gdW5sZXNzIHZhcmlhbnRcbiAgICAgIEBzdG9yYWdlKCkuc2V0KFwiI3tAb3B0aW9ucy5uYW1lfToje2dvYWxfbmFtZX1cIiwgdHJ1ZSkgaWYgcHJvcHMudW5pcXVlXG4gICAgICB1dGlscy5sb2coXCJleHBlcmltZW50OiAje0BvcHRpb25zLm5hbWV9IHZhcmlhbnQ6I3t2YXJpYW50fSBnb2FsOiN7Z29hbF9uYW1lfSBjb21wbGV0ZVwiKVxuICAgICAgQHRyYWNraW5nKCkuZ29hbF9jb21wbGV0ZShAb3B0aW9ucy5uYW1lLCB2YXJpYW50LCBnb2FsX25hbWUpXG5cbiAgICBnZXRfc3RvcmVkX3ZhcmlhbnQ6IC0+XG4gICAgICBAc3RvcmFnZSgpLmdldChcIiN7QG9wdGlvbnMubmFtZX06dmFyaWFudFwiKVxuXG4gICAgcGlja192YXJpYW50OiAtPlxuICAgICAgcGFydGl0aW9ucyA9IDEuMCAvIEB2YXJpYW50X25hbWVzLmxlbmd0aFxuICAgICAgY2hvc2VuX3BhcnRpdGlvbiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAvIHBhcnRpdGlvbnMpXG4gICAgICB2YXJpYW50ID0gQHZhcmlhbnRfbmFtZXNbY2hvc2VuX3BhcnRpdGlvbl1cbiAgICAgIHV0aWxzLmxvZyhcIiN7dmFyaWFudH0gcGlja2VkXCIpXG4gICAgICB2YXJpYW50XG5cbiAgICBpbl9zYW1wbGU6IC0+XG4gICAgICBhY3RpdmUgPSBAc3RvcmFnZSgpLmdldChcIiN7QG9wdGlvbnMubmFtZX06aW5fc2FtcGxlXCIpXG4gICAgICByZXR1cm4gYWN0aXZlIHVubGVzcyB0eXBlb2YgYWN0aXZlIGlzICd1bmRlZmluZWQnXG4gICAgICBhY3RpdmUgPSBNYXRoLnJhbmRvbSgpIDw9IEBvcHRpb25zLnNhbXBsZVxuICAgICAgQHN0b3JhZ2UoKS5zZXQoXCIje0BvcHRpb25zLm5hbWV9OmluX3NhbXBsZVwiLCBhY3RpdmUpXG4gICAgICBhY3RpdmVcblxuICAgIGFkZF9nb2FsOiAoZ29hbCkgPT5cbiAgICAgIGdvYWwuYWRkX2V4cGVyaW1lbnQodGhpcylcblxuICAgIGFkZF9nb2FsczogKGdvYWxzKSA9PlxuICAgICAgQGFkZF9nb2FsKGdvYWwpIGZvciBnb2FsIGluIGdvYWxzXG5cbiAgICBzdG9yYWdlOiAtPiBAb3B0aW9ucy5zdG9yYWdlX2FkYXB0ZXJcblxuICAgIHRyYWNraW5nOiAtPiBAb3B0aW9ucy50cmFja2luZ19hZGFwdGVyXG5cbiAgICBfdmFsaWRhdGUgPSAtPlxuICAgICAgdGhyb3cgJ2FuIGV4cGVyaW1lbnQgbmFtZSBtdXN0IGJlIHNwZWNpZmllZCcgaWYgQG9wdGlvbnMubmFtZSBpcyBudWxsXG4gICAgICB0aHJvdyAndmFyaWFudHMgbXVzdCBiZSBwcm92aWRlZCcgaWYgQG9wdGlvbnMudmFyaWFudHMgaXMgbnVsbFxuICAgICAgdGhyb3cgJ3RyaWdnZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyBpZiB0eXBlb2YgQG9wdGlvbnMudHJpZ2dlciBpc250ICdmdW5jdGlvbidcblxuXG4gIGNsYXNzIEBHb2FsXG4gICAgY29uc3RydWN0b3I6IChAbmFtZSwgQHByb3BzPXt9KSAtPlxuICAgICAgdXRpbHMuZGVmYXVsdHMoQHByb3BzLCB7dW5pcXVlOiB0cnVlfSlcbiAgICAgIEBleHBlcmltZW50cyA9IFtdXG5cbiAgICBhZGRfZXhwZXJpbWVudDogKGV4cGVyaW1lbnQpIC0+XG4gICAgICBAZXhwZXJpbWVudHMucHVzaChleHBlcmltZW50KVxuXG4gICAgYWRkX2V4cGVyaW1lbnRzOiAoZXhwZXJpbWVudHMpIC0+XG4gICAgICBAYWRkX2V4cGVyaW1lbnQoZXhwZXJpbWVudCkgZm9yIGV4cGVyaW1lbnQgaW4gZXhwZXJpbWVudHNcblxuICAgIGNvbXBsZXRlOiAtPlxuICAgICAgZm9yIGV4cGVyaW1lbnQgaW4gQGV4cGVyaW1lbnRzXG4gICAgICAgIGV4cGVyaW1lbnQuZ29hbF9jb21wbGV0ZShAbmFtZSwgQHByb3BzKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gQWxlcGhCZXRcbiIsIm1vZHVsZS5leHBvcnRzID1cbiAgZGVidWc6IGZhbHNlXG4iLCJzdG9yZSA9IHJlcXVpcmUoJ3N0b3JlJylcblxuIyBhIHRoaW4gd3JhcHBlciBhcm91bmQgc3RvcmUuanMgZm9yIGVhc3kgc3dhcHBpbmdcbmNsYXNzIFN0b3JhZ2VcbiAgY29uc3RydWN0b3I6IChAbmFtZXNwYWNlPSdhbGVwaGJldCcpIC0+XG4gICAgdGhyb3cgJ2xvY2FsIHN0b3JhZ2Ugbm90IHN1cHBvcnRlZCcgdW5sZXNzIHN0b3JlLmVuYWJsZWRcbiAgICBAc3RvcmFnZSA9IHN0b3JlLmdldChAbmFtZXNwYWNlKSB8fCB7fVxuICBzZXQ6IChrZXksIHZhbHVlKSAtPlxuICAgIEBzdG9yYWdlW2tleV0gPSB2YWx1ZVxuICAgIHN0b3JlLnNldChAbmFtZXNwYWNlLCBAc3RvcmFnZSlcbiAgICByZXR1cm4gdmFsdWVcbiAgZ2V0OiAoa2V5KSAtPlxuICAgIEBzdG9yYWdlW2tleV1cbiAgICAjIHN0b3JlLmdldChcIiN7QG5hbWVzcGFjZX06I3trZXl9XCIpXG5cbm1vZHVsZS5leHBvcnRzID0gU3RvcmFnZVxuIiwiIyBOT1RFOiB1c2luZyBhIGN1c3RvbSBidWlsZCBvZiBsb2Rhc2gsIHRvIHNhdmUgc3BhY2Vcbl8gPSByZXF1aXJlKCdsb2Rhc2guY3VzdG9tJylcbnV1aWQgPSByZXF1aXJlKCdub2RlLXV1aWQnKVxub3B0aW9ucyA9IHJlcXVpcmUoJy4vb3B0aW9ucycpXG5cbmNsYXNzIFV0aWxzXG4gIEBkZWZhdWx0czogXy5kZWZhdWx0c1xuICBAa2V5czogXy5rZXlzXG4gIEByZW1vdmU6IF8ucmVtb3ZlXG4gIEBsb2c6IChtZXNzYWdlKSAtPlxuICAgIGNvbnNvbGUubG9nKG1lc3NhZ2UpIGlmIG9wdGlvbnMuZGVidWdcbiAgQHV1aWQ6IHV1aWQudjRcblxubW9kdWxlLmV4cG9ydHMgPSBVdGlsc1xuIiwiLyoqXG4gKiBAbGljZW5zZVxuICogbG9kYXNoIDMuMTAuMCAoQ3VzdG9tIEJ1aWxkKSBsb2Rhc2guY29tL2xpY2Vuc2UgfCBVbmRlcnNjb3JlLmpzIDEuOC4zIHVuZGVyc2NvcmVqcy5vcmcvTElDRU5TRVxuICogQnVpbGQ6IGBsb2Rhc2ggLXAgaW5jbHVkZT1cImtleXMsZGVmYXVsdHMscmVtb3ZlXCIgZXhwb3J0cz1cIm5vZGVcIiAtbyAuL3ZlbmRvci9sb2Rhc2guY3VzdG9tLm1pbi5qc2BcbiAqL1xuOyhmdW5jdGlvbigpe2Z1bmN0aW9uIEIoYSl7cmV0dXJuISFhJiZ0eXBlb2YgYT09XCJvYmplY3RcIn1mdW5jdGlvbiBuKCl7fWZ1bmN0aW9uIFNhKGEsYil7dmFyIGM9LTEsZT1hLmxlbmd0aDtmb3IoYnx8KGI9QXJyYXkoZSkpOysrYzxlOyliW2NdPWFbY107cmV0dXJuIGJ9ZnVuY3Rpb24gcmEoYSxiKXtmb3IodmFyIGM9LTEsZT1hLmxlbmd0aDsrK2M8ZSYmZmFsc2UhPT1iKGFbY10sYyxhKTspO3JldHVybiBhfWZ1bmN0aW9uIFRhKGEsYil7Zm9yKHZhciBjPS0xLGU9YS5sZW5ndGg7KytjPGU7KWlmKGIoYVtjXSxjLGEpKXJldHVybiB0cnVlO3JldHVybiBmYWxzZX1mdW5jdGlvbiBzYShhLGIpe3ZhciBjO2lmKG51bGw9PWIpYz1hO2Vsc2V7Yz1DKGIpO3ZhciBlPWE7ZXx8KGU9e30pO2Zvcih2YXIgZD0tMSxmPWMubGVuZ3RoOysrZDxmOyl7dmFyIGg9Y1tkXTtlW2hdPWJbaF19Yz1lfXJldHVybiBjfWZ1bmN0aW9uIHRhKGEsYixjKXt2YXIgZT10eXBlb2YgYTtyZXR1cm5cImZ1bmN0aW9uXCI9PVxuZT9iPT09cD9hOnVhKGEsYixjKTpudWxsPT1hP2hhOlwib2JqZWN0XCI9PWU/dmEoYSk6Yj09PXA/d2EoYSk6VWEoYSxiKX1mdW5jdGlvbiB4YShhLGIsYyxlLGQsZixoKXt2YXIgZztjJiYoZz1kP2MoYSxlLGQpOmMoYSkpO2lmKGchPT1wKXJldHVybiBnO2lmKCF2KGEpKXJldHVybiBhO2lmKGU9eShhKSl7aWYoZz1WYShhKSwhYilyZXR1cm4gU2EoYSxnKX1lbHNle3ZhciBsPUEuY2FsbChhKSxtPWw9PUg7aWYobD09dHx8bD09SXx8bSYmIWQpe2lmKFEoYSkpcmV0dXJuIGQ/YTp7fTtnPVdhKG0/e306YSk7aWYoIWIpcmV0dXJuIHNhKGcsYSl9ZWxzZSByZXR1cm4gcVtsXT9YYShhLGwsYik6ZD9hOnt9fWZ8fChmPVtdKTtofHwoaD1bXSk7Zm9yKGQ9Zi5sZW5ndGg7ZC0tOylpZihmW2RdPT1hKXJldHVybiBoW2RdO2YucHVzaChhKTtoLnB1c2goZyk7KGU/cmE6WWEpKGEsZnVuY3Rpb24oZCxlKXtnW2VdPXhhKGQsYixjLGUsYSxmLGgpfSk7cmV0dXJuIGd9ZnVuY3Rpb24gWWEoYSxiKXtyZXR1cm4gWmEoYSxcbmIsQyl9ZnVuY3Rpb24geWEoYSxiLGMpe2lmKG51bGwhPWEpe2E9eihhKTtjIT09cCYmYyBpbiBhJiYoYj1bY10pO2M9MDtmb3IodmFyIGU9Yi5sZW5ndGg7bnVsbCE9YSYmYzxlOylhPXooYSlbYltjKytdXTtyZXR1cm4gYyYmYz09ZT9hOnB9fWZ1bmN0aW9uIGlhKGEsYixjLGUsZCxmKXtpZihhPT09YilhPXRydWU7ZWxzZSBpZihudWxsPT1hfHxudWxsPT1ifHwhdihhKSYmIUIoYikpYT1hIT09YSYmYiE9PWI7ZWxzZSBhOnt2YXIgaD1pYSxnPXkoYSksbD15KGIpLG09RixrPUY7Z3x8KG09QS5jYWxsKGEpLG09PUk/bT10Om0hPXQmJihnPWphKGEpKSk7bHx8KGs9QS5jYWxsKGIpLGs9PUk/az10OmshPXQmJmphKGIpKTt2YXIgcD1tPT10JiYhUShhKSxsPWs9PXQmJiFRKGIpLGs9bT09aztpZigha3x8Z3x8cCl7aWYoIWUmJihtPXAmJnUuY2FsbChhLFwiX193cmFwcGVkX19cIiksbD1sJiZ1LmNhbGwoYixcIl9fd3JhcHBlZF9fXCIpLG18fGwpKXthPWgobT9hLnZhbHVlKCk6YSxsP2IudmFsdWUoKTpcbmIsYyxlLGQsZik7YnJlYWsgYX1pZihrKXtkfHwoZD1bXSk7Znx8KGY9W10pO2ZvcihtPWQubGVuZ3RoO20tLTspaWYoZFttXT09YSl7YT1mW21dPT1iO2JyZWFrIGF9ZC5wdXNoKGEpO2YucHVzaChiKTthPShnPyRhOmFiKShhLGIsaCxjLGUsZCxmKTtkLnBvcCgpO2YucG9wKCl9ZWxzZSBhPWZhbHNlfWVsc2UgYT1iYihhLGIsbSl9cmV0dXJuIGF9ZnVuY3Rpb24gY2IoYSxiKXt2YXIgYz1iLmxlbmd0aCxlPWM7aWYobnVsbD09YSlyZXR1cm4hZTtmb3IoYT16KGEpO2MtLTspe3ZhciBkPWJbY107aWYoZFsyXT9kWzFdIT09YVtkWzBdXTohKGRbMF1pbiBhKSlyZXR1cm4gZmFsc2V9Zm9yKDsrK2M8ZTspe3ZhciBkPWJbY10sZj1kWzBdLGg9YVtmXSxnPWRbMV07aWYoZFsyXSl7aWYoaD09PXAmJiEoZiBpbiBhKSlyZXR1cm4gZmFsc2V9ZWxzZSBpZihkPXAsZD09PXA/IWlhKGcsaCx2b2lkIDAsdHJ1ZSk6IWQpcmV0dXJuIGZhbHNlfXJldHVybiB0cnVlfWZ1bmN0aW9uIHZhKGEpe3ZhciBiPWRiKGEpO2lmKDE9PWIubGVuZ3RoJiZcbmJbMF1bMl0pe3ZhciBjPWJbMF1bMF0sZT1iWzBdWzFdO3JldHVybiBmdW5jdGlvbihhKXtpZihudWxsPT1hKXJldHVybiBmYWxzZTthPXooYSk7cmV0dXJuIGFbY109PT1lJiYoZSE9PXB8fGMgaW4gYSl9fXJldHVybiBmdW5jdGlvbihhKXtyZXR1cm4gY2IoYSxiKX19ZnVuY3Rpb24gVWEoYSxiKXt2YXIgYz15KGEpLGU9emEoYSkmJmI9PT1iJiYhdihiKSxkPWErXCJcIjthPUFhKGEpO3JldHVybiBmdW5jdGlvbihmKXtpZihudWxsPT1mKXJldHVybiBmYWxzZTt2YXIgaD1kO2Y9eihmKTtpZighKCFjJiZlfHxoIGluIGYpKXtpZigxIT1hLmxlbmd0aCl7dmFyIGg9YSxnPTAsbD0tMSxtPS0xLGs9aC5sZW5ndGgsZz1udWxsPT1nPzA6K2d8fDA7MD5nJiYoZz0tZz5rPzA6aytnKTtsPWw9PT1wfHxsPms/azorbHx8MDswPmwmJihsKz1rKTtrPWc+bD8wOmwtZz4+PjA7Zz4+Pj0wO2ZvcihsPUFycmF5KGspOysrbTxrOylsW21dPWhbbStnXTtmPXlhKGYsbCl9aWYobnVsbD09ZilyZXR1cm4gZmFsc2U7aD1CYShhKTtcbmY9eihmKX1yZXR1cm4gZltoXT09PWI/YiE9PXB8fGggaW4gZjppYShiLGZbaF0scCx0cnVlKX19ZnVuY3Rpb24gQ2EoYSl7cmV0dXJuIGZ1bmN0aW9uKGIpe3JldHVybiBudWxsPT1iP3A6eihiKVthXX19ZnVuY3Rpb24gZWIoYSl7dmFyIGI9YStcIlwiO2E9QWEoYSk7cmV0dXJuIGZ1bmN0aW9uKGMpe3JldHVybiB5YShjLGEsYil9fWZ1bmN0aW9uIHVhKGEsYixjKXtpZih0eXBlb2YgYSE9XCJmdW5jdGlvblwiKXJldHVybiBoYTtpZihiPT09cClyZXR1cm4gYTtzd2l0Y2goYyl7Y2FzZSAxOnJldHVybiBmdW5jdGlvbihjKXtyZXR1cm4gYS5jYWxsKGIsYyl9O2Nhc2UgMzpyZXR1cm4gZnVuY3Rpb24oYyxkLGYpe3JldHVybiBhLmNhbGwoYixjLGQsZil9O2Nhc2UgNDpyZXR1cm4gZnVuY3Rpb24oYyxkLGYsaCl7cmV0dXJuIGEuY2FsbChiLGMsZCxmLGgpfTtjYXNlIDU6cmV0dXJuIGZ1bmN0aW9uKGMsZCxmLGgsZyl7cmV0dXJuIGEuY2FsbChiLGMsZCxmLGgsZyl9fXJldHVybiBmdW5jdGlvbigpe3JldHVybiBhLmFwcGx5KGIsXG5hcmd1bWVudHMpfX1mdW5jdGlvbiBEYShhKXt2YXIgYj1uZXcgZmIoYS5ieXRlTGVuZ3RoKTsobmV3IGthKGIpKS5zZXQobmV3IGthKGEpKTtyZXR1cm4gYn1mdW5jdGlvbiAkYShhLGIsYyxlLGQsZixoKXt2YXIgZz0tMSxsPWEubGVuZ3RoLG09Yi5sZW5ndGg7aWYobCE9bSYmIShkJiZtPmwpKXJldHVybiBmYWxzZTtmb3IoOysrZzxsOyl7dmFyIGs9YVtnXSxtPWJbZ10sbj1lP2UoZD9tOmssZD9rOm0sZyk6cDtpZihuIT09cCl7aWYobiljb250aW51ZTtyZXR1cm4gZmFsc2V9aWYoZCl7aWYoIVRhKGIsZnVuY3Rpb24oYSl7cmV0dXJuIGs9PT1hfHxjKGssYSxlLGQsZixoKX0pKXJldHVybiBmYWxzZX1lbHNlIGlmKGshPT1tJiYhYyhrLG0sZSxkLGYsaCkpcmV0dXJuIGZhbHNlfXJldHVybiB0cnVlfWZ1bmN0aW9uIGJiKGEsYixjKXtzd2l0Y2goYyl7Y2FzZSBKOmNhc2UgSzpyZXR1cm4rYT09K2I7Y2FzZSBMOnJldHVybiBhLm5hbWU9PWIubmFtZSYmYS5tZXNzYWdlPT1iLm1lc3NhZ2U7Y2FzZSBNOnJldHVybiBhIT1cbithP2IhPStiOmE9PStiO2Nhc2UgTjpjYXNlIEQ6cmV0dXJuIGE9PWIrXCJcIn1yZXR1cm4gZmFsc2V9ZnVuY3Rpb24gYWIoYSxiLGMsZSxkLGYsaCl7dmFyIGc9QyhhKSxsPWcubGVuZ3RoLG09QyhiKS5sZW5ndGg7aWYobCE9bSYmIWQpcmV0dXJuIGZhbHNlO2ZvcihtPWw7bS0tOyl7dmFyIGs9Z1ttXTtpZighKGQ/ayBpbiBiOnUuY2FsbChiLGspKSlyZXR1cm4gZmFsc2V9Zm9yKHZhciBuPWQ7KyttPGw7KXt2YXIgaz1nW21dLHE9YVtrXSxyPWJba10scz1lP2UoZD9yOnEsZD9xOnIsayk6cDtpZihzPT09cD8hYyhxLHIsZSxkLGYsaCk6IXMpcmV0dXJuIGZhbHNlO258fChuPVwiY29uc3RydWN0b3JcIj09ayl9cmV0dXJuIG58fChjPWEuY29uc3RydWN0b3IsZT1iLmNvbnN0cnVjdG9yLCEoYyE9ZSYmXCJjb25zdHJ1Y3RvclwiaW4gYSYmXCJjb25zdHJ1Y3RvclwiaW4gYil8fHR5cGVvZiBjPT1cImZ1bmN0aW9uXCImJmMgaW5zdGFuY2VvZiBjJiZ0eXBlb2YgZT09XCJmdW5jdGlvblwiJiZlIGluc3RhbmNlb2YgZSk/dHJ1ZTpmYWxzZX1mdW5jdGlvbiBkYihhKXthPVxuRWEoYSk7Zm9yKHZhciBiPWEubGVuZ3RoO2ItLTspe3ZhciBjPWFbYl1bMV07YVtiXVsyXT1jPT09YyYmIXYoYyl9cmV0dXJuIGF9ZnVuY3Rpb24gRmEoYSxiKXt2YXIgYz1udWxsPT1hP3A6YVtiXTtyZXR1cm4gR2EoYyk/YzpwfWZ1bmN0aW9uIFZhKGEpe3ZhciBiPWEubGVuZ3RoLGM9bmV3IGEuY29uc3RydWN0b3IoYik7YiYmXCJzdHJpbmdcIj09dHlwZW9mIGFbMF0mJnUuY2FsbChhLFwiaW5kZXhcIikmJihjLmluZGV4PWEuaW5kZXgsYy5pbnB1dD1hLmlucHV0KTtyZXR1cm4gY31mdW5jdGlvbiBXYShhKXthPWEuY29uc3RydWN0b3I7dHlwZW9mIGE9PVwiZnVuY3Rpb25cIiYmYSBpbnN0YW5jZW9mIGF8fChhPU9iamVjdCk7cmV0dXJuIG5ldyBhfWZ1bmN0aW9uIFhhKGEsYixjKXt2YXIgZT1hLmNvbnN0cnVjdG9yO3N3aXRjaChiKXtjYXNlIGxhOnJldHVybiBEYShhKTtjYXNlIEo6Y2FzZSBLOnJldHVybiBuZXcgZSgrYSk7Y2FzZSBSOmNhc2UgUzpjYXNlIFQ6Y2FzZSBVOmNhc2UgVjpjYXNlIFc6Y2FzZSBYOmNhc2UgWTpjYXNlIFo6cmV0dXJuIGUgaW5zdGFuY2VvZlxuZSYmKGU9d1tiXSksYj1hLmJ1ZmZlcixuZXcgZShjP0RhKGIpOmIsYS5ieXRlT2Zmc2V0LGEubGVuZ3RoKTtjYXNlIE06Y2FzZSBEOnJldHVybiBuZXcgZShhKTtjYXNlIE46dmFyIGQ9bmV3IGUoYS5zb3VyY2UsZ2IuZXhlYyhhKSk7ZC5sYXN0SW5kZXg9YS5sYXN0SW5kZXh9cmV0dXJuIGR9ZnVuY3Rpb24gJChhLGIpe2E9dHlwZW9mIGE9PVwibnVtYmVyXCJ8fGhiLnRlc3QoYSk/K2E6LTE7Yj1udWxsPT1iP0hhOmI7cmV0dXJuLTE8YSYmMD09YSUxJiZhPGJ9ZnVuY3Rpb24gSWEoYSxiLGMpe2lmKCF2KGMpKXJldHVybiBmYWxzZTt2YXIgZT10eXBlb2YgYjtyZXR1cm4oXCJudW1iZXJcIj09ZT9udWxsIT1jJiZFKG1hKGMpKSYmJChiLGMubGVuZ3RoKTpcInN0cmluZ1wiPT1lJiZiIGluIGMpPyhiPWNbYl0sYT09PWE/YT09PWI6YiE9PWIpOmZhbHNlfWZ1bmN0aW9uIHphKGEpe3ZhciBiPXR5cGVvZiBhO3JldHVyblwic3RyaW5nXCI9PWImJmliLnRlc3QoYSl8fFwibnVtYmVyXCI9PWI/dHJ1ZTp5KGEpP2ZhbHNlOiFqYi50ZXN0KGEpfHxcbiExfWZ1bmN0aW9uIEUoYSl7cmV0dXJuIHR5cGVvZiBhPT1cIm51bWJlclwiJiYtMTxhJiYwPT1hJTEmJmE8PUhhfWZ1bmN0aW9uIEphKGEpe2Zvcih2YXIgYj1LYShhKSxjPWIubGVuZ3RoLGU9YyYmYS5sZW5ndGgsZD0hIWUmJkUoZSkmJih5KGEpfHxuYShhKXx8YWEoYSkpLGY9LTEsaD1bXTsrK2Y8Yzspe3ZhciBnPWJbZl07KGQmJiQoZyxlKXx8dS5jYWxsKGEsZykpJiZoLnB1c2goZyl9cmV0dXJuIGh9ZnVuY3Rpb24geihhKXtpZihuLnN1cHBvcnQudW5pbmRleGVkQ2hhcnMmJmFhKGEpKXtmb3IodmFyIGI9LTEsYz1hLmxlbmd0aCxlPU9iamVjdChhKTsrK2I8YzspZVtiXT1hLmNoYXJBdChiKTtyZXR1cm4gZX1yZXR1cm4gdihhKT9hOk9iamVjdChhKX1mdW5jdGlvbiBBYShhKXtpZih5KGEpKXJldHVybiBhO3ZhciBiPVtdOyhudWxsPT1hP1wiXCI6YStcIlwiKS5yZXBsYWNlKGtiLGZ1bmN0aW9uKGEsZSxkLGYpe2IucHVzaChkP2YucmVwbGFjZShsYixcIiQxXCIpOmV8fGEpfSk7cmV0dXJuIGJ9XG5mdW5jdGlvbiBCYShhKXt2YXIgYj1hP2EubGVuZ3RoOjA7cmV0dXJuIGI/YVtiLTFdOnB9ZnVuY3Rpb24gb2EoYSxiKXtpZih0eXBlb2YgYSE9XCJmdW5jdGlvblwiKXRocm93IG5ldyBUeXBlRXJyb3IobWIpO2I9TGEoYj09PXA/YS5sZW5ndGgtMTorYnx8MCwwKTtyZXR1cm4gZnVuY3Rpb24oKXtmb3IodmFyIGM9YXJndW1lbnRzLGU9LTEsZD1MYShjLmxlbmd0aC1iLDApLGY9QXJyYXkoZCk7KytlPGQ7KWZbZV09Y1tiK2VdO3N3aXRjaChiKXtjYXNlIDA6cmV0dXJuIGEuY2FsbCh0aGlzLGYpO2Nhc2UgMTpyZXR1cm4gYS5jYWxsKHRoaXMsY1swXSxmKTtjYXNlIDI6cmV0dXJuIGEuY2FsbCh0aGlzLGNbMF0sY1sxXSxmKX1kPUFycmF5KGIrMSk7Zm9yKGU9LTE7KytlPGI7KWRbZV09Y1tlXTtkW2JdPWY7cmV0dXJuIGEuYXBwbHkodGhpcyxkKX19ZnVuY3Rpb24gbmEoYSl7cmV0dXJuIEIoYSkmJm51bGwhPWEmJkUobWEoYSkpJiZ1LmNhbGwoYSxcImNhbGxlZVwiKSYmIWJhLmNhbGwoYSxcImNhbGxlZVwiKX1cbmZ1bmN0aW9uIGNhKGEpe3JldHVybiB2KGEpJiZBLmNhbGwoYSk9PUh9ZnVuY3Rpb24gdihhKXt2YXIgYj10eXBlb2YgYTtyZXR1cm4hIWEmJihcIm9iamVjdFwiPT1ifHxcImZ1bmN0aW9uXCI9PWIpfWZ1bmN0aW9uIEdhKGEpe3JldHVybiBudWxsPT1hP2ZhbHNlOmNhKGEpP01hLnRlc3QoTmEuY2FsbChhKSk6QihhKSYmKFEoYSk/TWE6bmIpLnRlc3QoYSl9ZnVuY3Rpb24gYWEoYSl7cmV0dXJuIHR5cGVvZiBhPT1cInN0cmluZ1wifHxCKGEpJiZBLmNhbGwoYSk9PUR9ZnVuY3Rpb24gamEoYSl7cmV0dXJuIEIoYSkmJkUoYS5sZW5ndGgpJiYhIXJbQS5jYWxsKGEpXX1mdW5jdGlvbiBLYShhKXtpZihudWxsPT1hKXJldHVybltdO3YoYSl8fChhPU9iamVjdChhKSk7Zm9yKHZhciBiPWEubGVuZ3RoLGM9bi5zdXBwb3J0LGI9YiYmRShiKSYmKHkoYSl8fG5hKGEpfHxhYShhKSkmJmJ8fDAsZT1hLmNvbnN0cnVjdG9yLGQ9LTEsZT1jYShlKSYmZS5wcm90b3R5cGV8fEcsZj1lPT09YSxoPUFycmF5KGIpLGc9XG4wPGIsbD1jLmVudW1FcnJvclByb3BzJiYoYT09PWRhfHxhIGluc3RhbmNlb2YgRXJyb3IpLG09Yy5lbnVtUHJvdG90eXBlcyYmY2EoYSk7KytkPGI7KWhbZF09ZCtcIlwiO2Zvcih2YXIgayBpbiBhKW0mJlwicHJvdG90eXBlXCI9PWt8fGwmJihcIm1lc3NhZ2VcIj09a3x8XCJuYW1lXCI9PWspfHxnJiYkKGssYil8fFwiY29uc3RydWN0b3JcIj09ayYmKGZ8fCF1LmNhbGwoYSxrKSl8fGgucHVzaChrKTtpZihjLm5vbkVudW1TaGFkb3dzJiZhIT09Rylmb3IoYj1hPT09b2I/RDphPT09ZGE/TDpBLmNhbGwoYSksYz1zW2JdfHxzW3RdLGI9PXQmJihlPUcpLGI9cGEubGVuZ3RoO2ItLTspaz1wYVtiXSxkPWNba10sZiYmZHx8KGQ/IXUuY2FsbChhLGspOmFba109PT1lW2tdKXx8aC5wdXNoKGspO3JldHVybiBofWZ1bmN0aW9uIEVhKGEpe2E9eihhKTtmb3IodmFyIGI9LTEsYz1DKGEpLGU9Yy5sZW5ndGgsZD1BcnJheShlKTsrK2I8ZTspe3ZhciBmPWNbYl07ZFtiXT1bZixhW2ZdXX1yZXR1cm4gZH1mdW5jdGlvbiBlYShhLFxuYixjKXtjJiZJYShhLGIsYykmJihiPXApO3JldHVybiBCKGEpP09hKGEpOnRhKGEsYil9ZnVuY3Rpb24gaGEoYSl7cmV0dXJuIGF9ZnVuY3Rpb24gT2EoYSl7cmV0dXJuIHZhKHhhKGEsdHJ1ZSkpfWZ1bmN0aW9uIHdhKGEpe3JldHVybiB6YShhKT9DYShhKTplYihhKX12YXIgcCxtYj1cIkV4cGVjdGVkIGEgZnVuY3Rpb25cIixJPVwiW29iamVjdCBBcmd1bWVudHNdXCIsRj1cIltvYmplY3QgQXJyYXldXCIsSj1cIltvYmplY3QgQm9vbGVhbl1cIixLPVwiW29iamVjdCBEYXRlXVwiLEw9XCJbb2JqZWN0IEVycm9yXVwiLEg9XCJbb2JqZWN0IEZ1bmN0aW9uXVwiLE09XCJbb2JqZWN0IE51bWJlcl1cIix0PVwiW29iamVjdCBPYmplY3RdXCIsTj1cIltvYmplY3QgUmVnRXhwXVwiLEQ9XCJbb2JqZWN0IFN0cmluZ11cIixsYT1cIltvYmplY3QgQXJyYXlCdWZmZXJdXCIsUj1cIltvYmplY3QgRmxvYXQzMkFycmF5XVwiLFM9XCJbb2JqZWN0IEZsb2F0NjRBcnJheV1cIixUPVwiW29iamVjdCBJbnQ4QXJyYXldXCIsVT1cIltvYmplY3QgSW50MTZBcnJheV1cIixcblY9XCJbb2JqZWN0IEludDMyQXJyYXldXCIsVz1cIltvYmplY3QgVWludDhBcnJheV1cIixYPVwiW29iamVjdCBVaW50OENsYW1wZWRBcnJheV1cIixZPVwiW29iamVjdCBVaW50MTZBcnJheV1cIixaPVwiW29iamVjdCBVaW50MzJBcnJheV1cIixqYj0vXFwufFxcWyg/OlteW1xcXV0qfChbXCInXSkoPzooPyFcXDEpW15cXG5cXFxcXXxcXFxcLikqP1xcMSlcXF0vLGliPS9eXFx3KiQvLGtiPS9bXi5bXFxdXSt8XFxbKD86KC0/XFxkKyg/OlxcLlxcZCspPyl8KFtcIiddKSgoPzooPyFcXDIpW15cXG5cXFxcXXxcXFxcLikqPylcXDIpXFxdL2csbGI9L1xcXFwoXFxcXCk/L2csZ2I9L1xcdyokLyxuYj0vXlxcW29iamVjdCAuKz9Db25zdHJ1Y3RvclxcXSQvLGhiPS9eXFxkKyQvLHBhPVwiY29uc3RydWN0b3IgaGFzT3duUHJvcGVydHkgaXNQcm90b3R5cGVPZiBwcm9wZXJ0eUlzRW51bWVyYWJsZSB0b0xvY2FsZVN0cmluZyB0b1N0cmluZyB2YWx1ZU9mXCIuc3BsaXQoXCIgXCIpLHI9e307cltSXT1yW1NdPXJbVF09cltVXT1yW1ZdPXJbV109cltYXT1yW1ldPXJbWl09dHJ1ZTtcbnJbSV09cltGXT1yW2xhXT1yW0pdPXJbS109cltMXT1yW0hdPXJbXCJbb2JqZWN0IE1hcF1cIl09cltNXT1yW3RdPXJbTl09cltcIltvYmplY3QgU2V0XVwiXT1yW0RdPXJbXCJbb2JqZWN0IFdlYWtNYXBdXCJdPWZhbHNlO3ZhciBxPXt9O3FbSV09cVtGXT1xW2xhXT1xW0pdPXFbS109cVtSXT1xW1NdPXFbVF09cVtVXT1xW1ZdPXFbTV09cVt0XT1xW05dPXFbRF09cVtXXT1xW1hdPXFbWV09cVtaXT10cnVlO3FbTF09cVtIXT1xW1wiW29iamVjdCBNYXBdXCJdPXFbXCJbb2JqZWN0IFNldF1cIl09cVtcIltvYmplY3QgV2Vha01hcF1cIl09ZmFsc2U7dmFyIGZhPXtcImZ1bmN0aW9uXCI6dHJ1ZSxvYmplY3Q6dHJ1ZX0sZ2E9ZmFbdHlwZW9mIGV4cG9ydHNdJiZleHBvcnRzJiYhZXhwb3J0cy5ub2RlVHlwZSYmZXhwb3J0cyxPPWZhW3R5cGVvZiBtb2R1bGVdJiZtb2R1bGUmJiFtb2R1bGUubm9kZVR5cGUmJm1vZHVsZSxwYj1mYVt0eXBlb2Ygc2VsZl0mJnNlbGYmJnNlbGYuT2JqZWN0JiZzZWxmLFBhPWZhW3R5cGVvZiB3aW5kb3ddJiZcbndpbmRvdyYmd2luZG93Lk9iamVjdCYmd2luZG93LHFiPU8mJk8uZXhwb3J0cz09PWdhJiZnYSx4PWdhJiZPJiZ0eXBlb2YgZ2xvYmFsPT1cIm9iamVjdFwiJiZnbG9iYWwmJmdsb2JhbC5PYmplY3QmJmdsb2JhbHx8UGEhPT0odGhpcyYmdGhpcy53aW5kb3cpJiZQYXx8cGJ8fHRoaXMsUT1mdW5jdGlvbigpe3RyeXtPYmplY3Qoe3RvU3RyaW5nOjB9K1wiXCIpfWNhdGNoKGEpe3JldHVybiBmdW5jdGlvbigpe3JldHVybiBmYWxzZX19cmV0dXJuIGZ1bmN0aW9uKGEpe3JldHVybiB0eXBlb2YgYS50b1N0cmluZyE9XCJmdW5jdGlvblwiJiZ0eXBlb2YoYStcIlwiKT09XCJzdHJpbmdcIn19KCkscmI9QXJyYXkucHJvdG90eXBlLGRhPUVycm9yLnByb3RvdHlwZSxHPU9iamVjdC5wcm90b3R5cGUsb2I9U3RyaW5nLnByb3RvdHlwZSxOYT1GdW5jdGlvbi5wcm90b3R5cGUudG9TdHJpbmcsdT1HLmhhc093blByb3BlcnR5LEE9Ry50b1N0cmluZyxNYT1SZWdFeHAoXCJeXCIrTmEuY2FsbCh1KS5yZXBsYWNlKC9bXFxcXF4kLiorPygpW1xcXXt9fF0vZyxcblwiXFxcXCQmXCIpLnJlcGxhY2UoL2hhc093blByb3BlcnR5fChmdW5jdGlvbikuKj8oPz1cXFxcXFwoKXwgZm9yIC4rPyg/PVxcXFxcXF0pL2csXCIkMS4qP1wiKStcIiRcIiksZmI9eC5BcnJheUJ1ZmZlcixiYT1HLnByb3BlcnR5SXNFbnVtZXJhYmxlLFFhPXJiLnNwbGljZSxrYT14LlVpbnQ4QXJyYXksc2I9RmEoQXJyYXksXCJpc0FycmF5XCIpLFJhPUZhKE9iamVjdCxcImtleXNcIiksTGE9TWF0aC5tYXgsSGE9OTAwNzE5OTI1NDc0MDk5MSx3PXt9O3dbUl09eC5GbG9hdDMyQXJyYXk7d1tTXT14LkZsb2F0NjRBcnJheTt3W1RdPXguSW50OEFycmF5O3dbVV09eC5JbnQxNkFycmF5O3dbVl09eC5JbnQzMkFycmF5O3dbV109a2E7d1tYXT14LlVpbnQ4Q2xhbXBlZEFycmF5O3dbWV09eC5VaW50MTZBcnJheTt3W1pdPXguVWludDMyQXJyYXk7dmFyIHM9e307c1tGXT1zW0tdPXNbTV09e2NvbnN0cnVjdG9yOnRydWUsdG9Mb2NhbGVTdHJpbmc6dHJ1ZSx0b1N0cmluZzp0cnVlLHZhbHVlT2Y6dHJ1ZX07c1tKXT1zW0RdPXtjb25zdHJ1Y3Rvcjp0cnVlLFxudG9TdHJpbmc6dHJ1ZSx2YWx1ZU9mOnRydWV9O3NbTF09c1tIXT1zW05dPXtjb25zdHJ1Y3Rvcjp0cnVlLHRvU3RyaW5nOnRydWV9O3NbdF09e2NvbnN0cnVjdG9yOnRydWV9O3JhKHBhLGZ1bmN0aW9uKGEpe2Zvcih2YXIgYiBpbiBzKWlmKHUuY2FsbChzLGIpKXt2YXIgYz1zW2JdO2NbYV09dS5jYWxsKGMsYSl9fSk7dmFyIFA9bi5zdXBwb3J0PXt9OyhmdW5jdGlvbihhKXtmdW5jdGlvbiBiKCl7dGhpcy54PWF9dmFyIGM9ezA6YSxsZW5ndGg6YX0sZT1bXTtiLnByb3RvdHlwZT17dmFsdWVPZjphLHk6YX07Zm9yKHZhciBkIGluIG5ldyBiKWUucHVzaChkKTtQLmVudW1FcnJvclByb3BzPWJhLmNhbGwoZGEsXCJtZXNzYWdlXCIpfHxiYS5jYWxsKGRhLFwibmFtZVwiKTtQLmVudW1Qcm90b3R5cGVzPWJhLmNhbGwoYixcInByb3RvdHlwZVwiKTtQLm5vbkVudW1TaGFkb3dzPSEvdmFsdWVPZi8udGVzdChlKTtQLnNwbGljZU9iamVjdHM9KFFhLmNhbGwoYywwLDEpLCFjWzBdKTtQLnVuaW5kZXhlZENoYXJzPVwieHhcIiE9XCJ4XCJbMF0rXG5PYmplY3QoXCJ4XCIpWzBdfSkoMSwwKTt2YXIgWmE9ZnVuY3Rpb24oYSl7cmV0dXJuIGZ1bmN0aW9uKGIsYyxlKXt2YXIgZD16KGIpO2U9ZShiKTtmb3IodmFyIGY9ZS5sZW5ndGgsaD1hP2Y6LTE7YT9oLS06KytoPGY7KXt2YXIgZz1lW2hdO2lmKGZhbHNlPT09YyhkW2ddLGcsZCkpYnJlYWt9cmV0dXJuIGJ9fSgpLG1hPUNhKFwibGVuZ3RoXCIpLHk9c2J8fGZ1bmN0aW9uKGEpe3JldHVybiBCKGEpJiZFKGEubGVuZ3RoKSYmQS5jYWxsKGEpPT1GfSxxYT1mdW5jdGlvbihhKXtyZXR1cm4gb2EoZnVuY3Rpb24oYixjKXt2YXIgZT0tMSxkPW51bGw9PWI/MDpjLmxlbmd0aCxmPTI8ZD9jW2QtMl06cCxoPTI8ZD9jWzJdOnAsZz0xPGQ/Y1tkLTFdOnA7dHlwZW9mIGY9PVwiZnVuY3Rpb25cIj8oZj11YShmLGcsNSksZC09Mik6KGY9dHlwZW9mIGc9PVwiZnVuY3Rpb25cIj9nOnAsZC09Zj8xOjApO2gmJklhKGNbMF0sY1sxXSxoKSYmKGY9Mz5kP3A6ZixkPTEpO2Zvcig7KytlPGQ7KShoPWNbZV0pJiZhKGIsaCxcbmYpO3JldHVybiBifSl9KGZ1bmN0aW9uKGEsYixjKXtpZihjKWZvcih2YXIgZT0tMSxkPUMoYiksZj1kLmxlbmd0aDsrK2U8Zjspe3ZhciBoPWRbZV0sZz1hW2hdLGw9YyhnLGJbaF0saCxhLGIpOyhsPT09bD9sPT09ZzpnIT09ZykmJihnIT09cHx8aCBpbiBhKXx8KGFbaF09bCl9ZWxzZSBhPXNhKGEsYik7cmV0dXJuIGF9KSx0Yj1mdW5jdGlvbihhLGIpe3JldHVybiBvYShmdW5jdGlvbihjKXt2YXIgZT1jWzBdO2lmKG51bGw9PWUpcmV0dXJuIGU7Yy5wdXNoKGIpO3JldHVybiBhLmFwcGx5KHAsYyl9KX0ocWEsZnVuY3Rpb24oYSxiKXtyZXR1cm4gYT09PXA/YjphfSksQz1SYT9mdW5jdGlvbihhKXt2YXIgYj1udWxsPT1hP3A6YS5jb25zdHJ1Y3RvcjtyZXR1cm4gdHlwZW9mIGI9PVwiZnVuY3Rpb25cIiYmYi5wcm90b3R5cGU9PT1hfHwodHlwZW9mIGE9PVwiZnVuY3Rpb25cIj9uLnN1cHBvcnQuZW51bVByb3RvdHlwZXM6bnVsbCE9YSYmRShtYShhKSkpP0phKGEpOnYoYSk/UmEoYSk6W119OlxuSmE7bi5hc3NpZ249cWE7bi5jYWxsYmFjaz1lYTtuLmRlZmF1bHRzPXRiO24ua2V5cz1DO24ua2V5c0luPUthO24ubWF0Y2hlcz1PYTtuLnBhaXJzPUVhO24ucHJvcGVydHk9d2E7bi5yZW1vdmU9ZnVuY3Rpb24oYSxiLGMpe3ZhciBlPVtdO2lmKCFhfHwhYS5sZW5ndGgpcmV0dXJuIGU7dmFyIGQ9LTEsZj1bXSxoPWEubGVuZ3RoLGc9bi5jYWxsYmFja3x8ZWEsZz1nPT09ZWE/dGE6Zztmb3IoYj1nKGIsYywzKTsrK2Q8aDspYz1hW2RdLGIoYyxkLGEpJiYoZS5wdXNoKGMpLGYucHVzaChkKSk7Zm9yKGI9YT9mLmxlbmd0aDowO2ItLTspaWYoZD1mW2JdLGQhPWwmJiQoZCkpe3ZhciBsPWQ7UWEuY2FsbChhLGQsMSl9cmV0dXJuIGV9O24ucmVzdFBhcmFtPW9hO24uZXh0ZW5kPXFhO24uaXRlcmF0ZWU9ZWE7bi5pZGVudGl0eT1oYTtuLmlzQXJndW1lbnRzPW5hO24uaXNBcnJheT15O24uaXNGdW5jdGlvbj1jYTtuLmlzTmF0aXZlPUdhO24uaXNPYmplY3Q9djtuLmlzU3RyaW5nPWFhO24uaXNUeXBlZEFycmF5PVxuamE7bi5sYXN0PUJhO24uVkVSU0lPTj1cIjMuMTAuMFwiO2dhJiZPJiZxYiYmKChPLmV4cG9ydHM9bikuXz1uKX0uY2FsbCh0aGlzKSk7Il19
