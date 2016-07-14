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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvbm9kZS11dWlkL3V1aWQuanMiLCJub2RlX21vZHVsZXMvc3RvcmUvc3RvcmUuanMiLCIvaG9tZS95b2F2L2NvZGUvYWxlcGhiZXQvc3JjL2FkYXB0ZXJzLmNvZmZlZSIsIi9ob21lL3lvYXYvY29kZS9hbGVwaGJldC9zcmMvYWxlcGhiZXQuY29mZmVlIiwiL2hvbWUveW9hdi9jb2RlL2FsZXBoYmV0L3NyYy9vcHRpb25zLmNvZmZlZSIsIi9ob21lL3lvYXYvY29kZS9hbGVwaGJldC9zcmMvc3RvcmFnZS5jb2ZmZWUiLCIvaG9tZS95b2F2L2NvZGUvYWxlcGhiZXQvc3JjL3V0aWxzLmNvZmZlZSIsInZlbmRvci9sb2Rhc2guY3VzdG9tLm1pbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDclBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQy9MQSxJQUFBLHdCQUFBO0VBQUE7O0FBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztBQUNSLE9BQUEs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QUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxPQUFaLEVBQUE7O0VBREk7O0VBRU4sS0FBQyxDQUFBLElBQUQsR0FBTyxJQUFJLENBQUM7Ozs7OztBQUVkLE1BQU0sQ0FBQyxPQUFQLEdBQWlCOzs7OztBQ2JqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vICAgICB1dWlkLmpzXG4vL1xuLy8gICAgIENvcHlyaWdodCAoYykgMjAxMC0yMDEyIFJvYmVydCBLaWVmZmVyXG4vLyAgICAgTUlUIExpY2Vuc2UgLSBodHRwOi8vb3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIF9nbG9iYWwgPSB0aGlzO1xuXG4gIC8vIFVuaXF1ZSBJRCBjcmVhdGlvbiByZXF1aXJlcyBhIGhpZ2ggcXVhbGl0eSByYW5kb20gIyBnZW5lcmF0b3IuICBXZSBmZWF0dXJlXG4gIC8vIGRldGVjdCB0byBkZXRlcm1pbmUgdGhlIGJlc3QgUk5HIHNvdXJjZSwgbm9ybWFsaXppbmcgdG8gYSBmdW5jdGlvbiB0aGF0XG4gIC8vIHJldHVybnMgMTI4LWJpdHMgb2YgcmFuZG9tbmVzcywgc2luY2UgdGhhdCdzIHdoYXQncyB1c3VhbGx5IHJlcXVpcmVkXG4gIHZhciBfcm5nO1xuXG4gIC8vIE5vZGUuanMgY3J5cHRvLWJhc2VkIFJORyAtIGh0dHA6Ly9ub2RlanMub3JnL2RvY3MvdjAuNi4yL2FwaS9jcnlwdG8uaHRtbFxuICAvL1xuICAvLyBNb2RlcmF0ZWx5IGZhc3QsIGhpZ2ggcXVhbGl0eVxuICBpZiAodHlwZW9mKF9nbG9iYWwucmVxdWlyZSkgPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRyeSB7XG4gICAgICB2YXIgX3JiID0gX2dsb2JhbC5yZXF1aXJlKCdjcnlwdG8nKS5yYW5kb21CeXRlcztcbiAgICAgIF9ybmcgPSBfcmIgJiYgZnVuY3Rpb24oKSB7cmV0dXJuIF9yYigxNik7fTtcbiAgICB9IGNhdGNoKGUpIHt9XG4gIH1cblxuICBpZiAoIV9ybmcgJiYgX2dsb2JhbC5jcnlwdG8gJiYgY3J5cHRvLmdldFJhbmRvbVZhbHVlcykge1xuICAgIC8vIFdIQVRXRyBjcnlwdG8tYmFzZWQgUk5HIC0gaHR0cDovL3dpa2kud2hhdHdnLm9yZy93aWtpL0NyeXB0b1xuICAgIC8vXG4gICAgLy8gTW9kZXJhdGVseSBmYXN0LCBoaWdoIHF1YWxpdHlcbiAgICB2YXIgX3JuZHM4ID0gbmV3IFVpbnQ4QXJyYXkoMTYpO1xuICAgIF9ybmcgPSBmdW5jdGlvbiB3aGF0d2dSTkcoKSB7XG4gICAgICBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKF9ybmRzOCk7XG4gICAgICByZXR1cm4gX3JuZHM4O1xuICAgIH07XG4gIH1cblxuICBpZiAoIV9ybmcpIHtcbiAgICAvLyBNYXRoLnJhbmRvbSgpLWJhc2VkIChSTkcpXG4gICAgLy9cbiAgICAvLyBJZiBhbGwgZWxzZSBmYWlscywgdXNlIE1hdGgucmFuZG9tKCkuICBJdCdzIGZhc3QsIGJ1dCBpcyBvZiB1bnNwZWNpZmllZFxuICAgIC8vIHF1YWxpdHkuXG4gICAgdmFyICBfcm5kcyA9IG5ldyBBcnJheSgxNik7XG4gICAgX3JuZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIHI7IGkgPCAxNjsgaSsrKSB7XG4gICAgICAgIGlmICgoaSAmIDB4MDMpID09PSAwKSByID0gTWF0aC5yYW5kb20oKSAqIDB4MTAwMDAwMDAwO1xuICAgICAgICBfcm5kc1tpXSA9IHIgPj4+ICgoaSAmIDB4MDMpIDw8IDMpICYgMHhmZjtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIF9ybmRzO1xuICAgIH07XG4gIH1cblxuICAvLyBCdWZmZXIgY2xhc3MgdG8gdXNlXG4gIHZhciBCdWZmZXJDbGFzcyA9IHR5cGVvZihfZ2xvYmFsLkJ1ZmZlcikgPT0gJ2Z1bmN0aW9uJyA/IF9nbG9iYWwuQnVmZmVyIDogQXJyYXk7XG5cbiAgLy8gTWFwcyBmb3IgbnVtYmVyIDwtPiBoZXggc3RyaW5nIGNvbnZlcnNpb25cbiAgdmFyIF9ieXRlVG9IZXggPSBbXTtcbiAgdmFyIF9oZXhUb0J5dGUgPSB7fTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCAyNTY7IGkrKykge1xuICAgIF9ieXRlVG9IZXhbaV0gPSAoaSArIDB4MTAwKS50b1N0cmluZygxNikuc3Vic3RyKDEpO1xuICAgIF9oZXhUb0J5dGVbX2J5dGVUb0hleFtpXV0gPSBpO1xuICB9XG5cbiAgLy8gKipgcGFyc2UoKWAgLSBQYXJzZSBhIFVVSUQgaW50byBpdCdzIGNvbXBvbmVudCBieXRlcyoqXG4gIGZ1bmN0aW9uIHBhcnNlKHMsIGJ1Ziwgb2Zmc2V0KSB7XG4gICAgdmFyIGkgPSAoYnVmICYmIG9mZnNldCkgfHwgMCwgaWkgPSAwO1xuXG4gICAgYnVmID0gYnVmIHx8IFtdO1xuICAgIHMudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9bMC05YS1mXXsyfS9nLCBmdW5jdGlvbihvY3QpIHtcbiAgICAgIGlmIChpaSA8IDE2KSB7IC8vIERvbid0IG92ZXJmbG93IVxuICAgICAgICBidWZbaSArIGlpKytdID0gX2hleFRvQnl0ZVtvY3RdO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gWmVybyBvdXQgcmVtYWluaW5nIGJ5dGVzIGlmIHN0cmluZyB3YXMgc2hvcnRcbiAgICB3aGlsZSAoaWkgPCAxNikge1xuICAgICAgYnVmW2kgKyBpaSsrXSA9IDA7XG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1ZjtcbiAgfVxuXG4gIC8vICoqYHVucGFyc2UoKWAgLSBDb252ZXJ0IFVVSUQgYnl0ZSBhcnJheSAoYWxhIHBhcnNlKCkpIGludG8gYSBzdHJpbmcqKlxuICBmdW5jdGlvbiB1bnBhcnNlKGJ1Ziwgb2Zmc2V0KSB7XG4gICAgdmFyIGkgPSBvZmZzZXQgfHwgMCwgYnRoID0gX2J5dGVUb0hleDtcbiAgICByZXR1cm4gIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICtcbiAgICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICsgJy0nICtcbiAgICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICsgJy0nICtcbiAgICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICsgJy0nICtcbiAgICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICsgJy0nICtcbiAgICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICtcbiAgICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICtcbiAgICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dO1xuICB9XG5cbiAgLy8gKipgdjEoKWAgLSBHZW5lcmF0ZSB0aW1lLWJhc2VkIFVVSUQqKlxuICAvL1xuICAvLyBJbnNwaXJlZCBieSBodHRwczovL2dpdGh1Yi5jb20vTGlvc0svVVVJRC5qc1xuICAvLyBhbmQgaHR0cDovL2RvY3MucHl0aG9uLm9yZy9saWJyYXJ5L3V1aWQuaHRtbFxuXG4gIC8vIHJhbmRvbSAjJ3Mgd2UgbmVlZCB0byBpbml0IG5vZGUgYW5kIGNsb2Nrc2VxXG4gIHZhciBfc2VlZEJ5dGVzID0gX3JuZygpO1xuXG4gIC8vIFBlciA0LjUsIGNyZWF0ZSBhbmQgNDgtYml0IG5vZGUgaWQsICg0NyByYW5kb20gYml0cyArIG11bHRpY2FzdCBiaXQgPSAxKVxuICB2YXIgX25vZGVJZCA9IFtcbiAgICBfc2VlZEJ5dGVzWzBdIHwgMHgwMSxcbiAgICBfc2VlZEJ5dGVzWzFdLCBfc2VlZEJ5dGVzWzJdLCBfc2VlZEJ5dGVzWzNdLCBfc2VlZEJ5dGVzWzRdLCBfc2VlZEJ5dGVzWzVdXG4gIF07XG5cbiAgLy8gUGVyIDQuMi4yLCByYW5kb21pemUgKDE0IGJpdCkgY2xvY2tzZXFcbiAgdmFyIF9jbG9ja3NlcSA9IChfc2VlZEJ5dGVzWzZdIDw8IDggfCBfc2VlZEJ5dGVzWzddKSAmIDB4M2ZmZjtcblxuICAvLyBQcmV2aW91cyB1dWlkIGNyZWF0aW9uIHRpbWVcbiAgdmFyIF9sYXN0TVNlY3MgPSAwLCBfbGFzdE5TZWNzID0gMDtcblxuICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2Jyb29mYS9ub2RlLXV1aWQgZm9yIEFQSSBkZXRhaWxzXG4gIGZ1bmN0aW9uIHYxKG9wdGlvbnMsIGJ1Ziwgb2Zmc2V0KSB7XG4gICAgdmFyIGkgPSBidWYgJiYgb2Zmc2V0IHx8IDA7XG4gICAgdmFyIGIgPSBidWYgfHwgW107XG5cbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHZhciBjbG9ja3NlcSA9IG9wdGlvbnMuY2xvY2tzZXEgIT0gbnVsbCA/IG9wdGlvbnMuY2xvY2tzZXEgOiBfY2xvY2tzZXE7XG5cbiAgICAvLyBVVUlEIHRpbWVzdGFtcHMgYXJlIDEwMCBuYW5vLXNlY29uZCB1bml0cyBzaW5jZSB0aGUgR3JlZ29yaWFuIGVwb2NoLFxuICAgIC8vICgxNTgyLTEwLTE1IDAwOjAwKS4gIEpTTnVtYmVycyBhcmVuJ3QgcHJlY2lzZSBlbm91Z2ggZm9yIHRoaXMsIHNvXG4gICAgLy8gdGltZSBpcyBoYW5kbGVkIGludGVybmFsbHkgYXMgJ21zZWNzJyAoaW50ZWdlciBtaWxsaXNlY29uZHMpIGFuZCAnbnNlY3MnXG4gICAgLy8gKDEwMC1uYW5vc2Vjb25kcyBvZmZzZXQgZnJvbSBtc2Vjcykgc2luY2UgdW5peCBlcG9jaCwgMTk3MC0wMS0wMSAwMDowMC5cbiAgICB2YXIgbXNlY3MgPSBvcHRpb25zLm1zZWNzICE9IG51bGwgPyBvcHRpb25zLm1zZWNzIDogbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cbiAgICAvLyBQZXIgNC4yLjEuMiwgdXNlIGNvdW50IG9mIHV1aWQncyBnZW5lcmF0ZWQgZHVyaW5nIHRoZSBjdXJyZW50IGNsb2NrXG4gICAgLy8gY3ljbGUgdG8gc2ltdWxhdGUgaGlnaGVyIHJlc29sdXRpb24gY2xvY2tcbiAgICB2YXIgbnNlY3MgPSBvcHRpb25zLm5zZWNzICE9IG51bGwgPyBvcHRpb25zLm5zZWNzIDogX2xhc3ROU2VjcyArIDE7XG5cbiAgICAvLyBUaW1lIHNpbmNlIGxhc3QgdXVpZCBjcmVhdGlvbiAoaW4gbXNlY3MpXG4gICAgdmFyIGR0ID0gKG1zZWNzIC0gX2xhc3RNU2VjcykgKyAobnNlY3MgLSBfbGFzdE5TZWNzKS8xMDAwMDtcblxuICAgIC8vIFBlciA0LjIuMS4yLCBCdW1wIGNsb2Nrc2VxIG9uIGNsb2NrIHJlZ3Jlc3Npb25cbiAgICBpZiAoZHQgPCAwICYmIG9wdGlvbnMuY2xvY2tzZXEgPT0gbnVsbCkge1xuICAgICAgY2xvY2tzZXEgPSBjbG9ja3NlcSArIDEgJiAweDNmZmY7XG4gICAgfVxuXG4gICAgLy8gUmVzZXQgbnNlY3MgaWYgY2xvY2sgcmVncmVzc2VzIChuZXcgY2xvY2tzZXEpIG9yIHdlJ3ZlIG1vdmVkIG9udG8gYSBuZXdcbiAgICAvLyB0aW1lIGludGVydmFsXG4gICAgaWYgKChkdCA8IDAgfHwgbXNlY3MgPiBfbGFzdE1TZWNzKSAmJiBvcHRpb25zLm5zZWNzID09IG51bGwpIHtcbiAgICAgIG5zZWNzID0gMDtcbiAgICB9XG5cbiAgICAvLyBQZXIgNC4yLjEuMiBUaHJvdyBlcnJvciBpZiB0b28gbWFueSB1dWlkcyBhcmUgcmVxdWVzdGVkXG4gICAgaWYgKG5zZWNzID49IDEwMDAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3V1aWQudjEoKTogQ2FuXFwndCBjcmVhdGUgbW9yZSB0aGFuIDEwTSB1dWlkcy9zZWMnKTtcbiAgICB9XG5cbiAgICBfbGFzdE1TZWNzID0gbXNlY3M7XG4gICAgX2xhc3ROU2VjcyA9IG5zZWNzO1xuICAgIF9jbG9ja3NlcSA9IGNsb2Nrc2VxO1xuXG4gICAgLy8gUGVyIDQuMS40IC0gQ29udmVydCBmcm9tIHVuaXggZXBvY2ggdG8gR3JlZ29yaWFuIGVwb2NoXG4gICAgbXNlY3MgKz0gMTIyMTkyOTI4MDAwMDA7XG5cbiAgICAvLyBgdGltZV9sb3dgXG4gICAgdmFyIHRsID0gKChtc2VjcyAmIDB4ZmZmZmZmZikgKiAxMDAwMCArIG5zZWNzKSAlIDB4MTAwMDAwMDAwO1xuICAgIGJbaSsrXSA9IHRsID4+PiAyNCAmIDB4ZmY7XG4gICAgYltpKytdID0gdGwgPj4+IDE2ICYgMHhmZjtcbiAgICBiW2krK10gPSB0bCA+Pj4gOCAmIDB4ZmY7XG4gICAgYltpKytdID0gdGwgJiAweGZmO1xuXG4gICAgLy8gYHRpbWVfbWlkYFxuICAgIHZhciB0bWggPSAobXNlY3MgLyAweDEwMDAwMDAwMCAqIDEwMDAwKSAmIDB4ZmZmZmZmZjtcbiAgICBiW2krK10gPSB0bWggPj4+IDggJiAweGZmO1xuICAgIGJbaSsrXSA9IHRtaCAmIDB4ZmY7XG5cbiAgICAvLyBgdGltZV9oaWdoX2FuZF92ZXJzaW9uYFxuICAgIGJbaSsrXSA9IHRtaCA+Pj4gMjQgJiAweGYgfCAweDEwOyAvLyBpbmNsdWRlIHZlcnNpb25cbiAgICBiW2krK10gPSB0bWggPj4+IDE2ICYgMHhmZjtcblxuICAgIC8vIGBjbG9ja19zZXFfaGlfYW5kX3Jlc2VydmVkYCAoUGVyIDQuMi4yIC0gaW5jbHVkZSB2YXJpYW50KVxuICAgIGJbaSsrXSA9IGNsb2Nrc2VxID4+PiA4IHwgMHg4MDtcblxuICAgIC8vIGBjbG9ja19zZXFfbG93YFxuICAgIGJbaSsrXSA9IGNsb2Nrc2VxICYgMHhmZjtcblxuICAgIC8vIGBub2RlYFxuICAgIHZhciBub2RlID0gb3B0aW9ucy5ub2RlIHx8IF9ub2RlSWQ7XG4gICAgZm9yICh2YXIgbiA9IDA7IG4gPCA2OyBuKyspIHtcbiAgICAgIGJbaSArIG5dID0gbm9kZVtuXTtcbiAgICB9XG5cbiAgICByZXR1cm4gYnVmID8gYnVmIDogdW5wYXJzZShiKTtcbiAgfVxuXG4gIC8vICoqYHY0KClgIC0gR2VuZXJhdGUgcmFuZG9tIFVVSUQqKlxuXG4gIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vYnJvb2ZhL25vZGUtdXVpZCBmb3IgQVBJIGRldGFpbHNcbiAgZnVuY3Rpb24gdjQob3B0aW9ucywgYnVmLCBvZmZzZXQpIHtcbiAgICAvLyBEZXByZWNhdGVkIC0gJ2Zvcm1hdCcgYXJndW1lbnQsIGFzIHN1cHBvcnRlZCBpbiB2MS4yXG4gICAgdmFyIGkgPSBidWYgJiYgb2Zmc2V0IHx8IDA7XG5cbiAgICBpZiAodHlwZW9mKG9wdGlvbnMpID09ICdzdHJpbmcnKSB7XG4gICAgICBidWYgPSBvcHRpb25zID09ICdiaW5hcnknID8gbmV3IEJ1ZmZlckNsYXNzKDE2KSA6IG51bGw7XG4gICAgICBvcHRpb25zID0gbnVsbDtcbiAgICB9XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICB2YXIgcm5kcyA9IG9wdGlvbnMucmFuZG9tIHx8IChvcHRpb25zLnJuZyB8fCBfcm5nKSgpO1xuXG4gICAgLy8gUGVyIDQuNCwgc2V0IGJpdHMgZm9yIHZlcnNpb24gYW5kIGBjbG9ja19zZXFfaGlfYW5kX3Jlc2VydmVkYFxuICAgIHJuZHNbNl0gPSAocm5kc1s2XSAmIDB4MGYpIHwgMHg0MDtcbiAgICBybmRzWzhdID0gKHJuZHNbOF0gJiAweDNmKSB8IDB4ODA7XG5cbiAgICAvLyBDb3B5IGJ5dGVzIHRvIGJ1ZmZlciwgaWYgcHJvdmlkZWRcbiAgICBpZiAoYnVmKSB7XG4gICAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgMTY7IGlpKyspIHtcbiAgICAgICAgYnVmW2kgKyBpaV0gPSBybmRzW2lpXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYnVmIHx8IHVucGFyc2Uocm5kcyk7XG4gIH1cblxuICAvLyBFeHBvcnQgcHVibGljIEFQSVxuICB2YXIgdXVpZCA9IHY0O1xuICB1dWlkLnYxID0gdjE7XG4gIHV1aWQudjQgPSB2NDtcbiAgdXVpZC5wYXJzZSA9IHBhcnNlO1xuICB1dWlkLnVucGFyc2UgPSB1bnBhcnNlO1xuICB1dWlkLkJ1ZmZlckNsYXNzID0gQnVmZmVyQ2xhc3M7XG5cbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIC8vIFB1Ymxpc2ggYXMgQU1EIG1vZHVsZVxuICAgIGRlZmluZShmdW5jdGlvbigpIHtyZXR1cm4gdXVpZDt9KTtcbiAgfSBlbHNlIGlmICh0eXBlb2YobW9kdWxlKSAhPSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgIC8vIFB1Ymxpc2ggYXMgbm9kZS5qcyBtb2R1bGVcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHV1aWQ7XG4gIH0gZWxzZSB7XG4gICAgLy8gUHVibGlzaCBhcyBnbG9iYWwgKGluIGJyb3dzZXJzKVxuICAgIHZhciBfcHJldmlvdXNSb290ID0gX2dsb2JhbC51dWlkO1xuXG4gICAgLy8gKipgbm9Db25mbGljdCgpYCAtIChicm93c2VyIG9ubHkpIHRvIHJlc2V0IGdsb2JhbCAndXVpZCcgdmFyKipcbiAgICB1dWlkLm5vQ29uZmxpY3QgPSBmdW5jdGlvbigpIHtcbiAgICAgIF9nbG9iYWwudXVpZCA9IF9wcmV2aW91c1Jvb3Q7XG4gICAgICByZXR1cm4gdXVpZDtcbiAgICB9O1xuXG4gICAgX2dsb2JhbC51dWlkID0gdXVpZDtcbiAgfVxufSkuY2FsbCh0aGlzKTtcbiIsIlwidXNlIHN0cmljdFwiXG4vLyBNb2R1bGUgZXhwb3J0IHBhdHRlcm4gZnJvbVxuLy8gaHR0cHM6Ly9naXRodWIuY29tL3VtZGpzL3VtZC9ibG9iL21hc3Rlci9yZXR1cm5FeHBvcnRzLmpzXG47KGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgICAgIGRlZmluZShbXSwgZmFjdG9yeSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgLy8gTm9kZS4gRG9lcyBub3Qgd29yayB3aXRoIHN0cmljdCBDb21tb25KUywgYnV0XG4gICAgICAgIC8vIG9ubHkgQ29tbW9uSlMtbGlrZSBlbnZpcm9ubWVudHMgdGhhdCBzdXBwb3J0IG1vZHVsZS5leHBvcnRzLFxuICAgICAgICAvLyBsaWtlIE5vZGUuXG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEJyb3dzZXIgZ2xvYmFscyAocm9vdCBpcyB3aW5kb3cpXG4gICAgICAgIHJvb3Quc3RvcmUgPSBmYWN0b3J5KCk7XG4gIH1cbn0odGhpcywgZnVuY3Rpb24gKCkge1xuXHRcblx0Ly8gU3RvcmUuanNcblx0dmFyIHN0b3JlID0ge30sXG5cdFx0d2luID0gKHR5cGVvZiB3aW5kb3cgIT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiBnbG9iYWwpLFxuXHRcdGRvYyA9IHdpbi5kb2N1bWVudCxcblx0XHRsb2NhbFN0b3JhZ2VOYW1lID0gJ2xvY2FsU3RvcmFnZScsXG5cdFx0c2NyaXB0VGFnID0gJ3NjcmlwdCcsXG5cdFx0c3RvcmFnZVxuXG5cdHN0b3JlLmRpc2FibGVkID0gZmFsc2Vcblx0c3RvcmUudmVyc2lvbiA9ICcxLjMuMjAnXG5cdHN0b3JlLnNldCA9IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHt9XG5cdHN0b3JlLmdldCA9IGZ1bmN0aW9uKGtleSwgZGVmYXVsdFZhbCkge31cblx0c3RvcmUuaGFzID0gZnVuY3Rpb24oa2V5KSB7IHJldHVybiBzdG9yZS5nZXQoa2V5KSAhPT0gdW5kZWZpbmVkIH1cblx0c3RvcmUucmVtb3ZlID0gZnVuY3Rpb24oa2V5KSB7fVxuXHRzdG9yZS5jbGVhciA9IGZ1bmN0aW9uKCkge31cblx0c3RvcmUudHJhbnNhY3QgPSBmdW5jdGlvbihrZXksIGRlZmF1bHRWYWwsIHRyYW5zYWN0aW9uRm4pIHtcblx0XHRpZiAodHJhbnNhY3Rpb25GbiA9PSBudWxsKSB7XG5cdFx0XHR0cmFuc2FjdGlvbkZuID0gZGVmYXVsdFZhbFxuXHRcdFx0ZGVmYXVsdFZhbCA9IG51bGxcblx0XHR9XG5cdFx0aWYgKGRlZmF1bHRWYWwgPT0gbnVsbCkge1xuXHRcdFx0ZGVmYXVsdFZhbCA9IHt9XG5cdFx0fVxuXHRcdHZhciB2YWwgPSBzdG9yZS5nZXQoa2V5LCBkZWZhdWx0VmFsKVxuXHRcdHRyYW5zYWN0aW9uRm4odmFsKVxuXHRcdHN0b3JlLnNldChrZXksIHZhbClcblx0fVxuXHRzdG9yZS5nZXRBbGwgPSBmdW5jdGlvbigpIHt9XG5cdHN0b3JlLmZvckVhY2ggPSBmdW5jdGlvbigpIHt9XG5cblx0c3RvcmUuc2VyaWFsaXplID0gZnVuY3Rpb24odmFsdWUpIHtcblx0XHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkodmFsdWUpXG5cdH1cblx0c3RvcmUuZGVzZXJpYWxpemUgPSBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdGlmICh0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIHsgcmV0dXJuIHVuZGVmaW5lZCB9XG5cdFx0dHJ5IHsgcmV0dXJuIEpTT04ucGFyc2UodmFsdWUpIH1cblx0XHRjYXRjaChlKSB7IHJldHVybiB2YWx1ZSB8fCB1bmRlZmluZWQgfVxuXHR9XG5cblx0Ly8gRnVuY3Rpb25zIHRvIGVuY2Fwc3VsYXRlIHF1ZXN0aW9uYWJsZSBGaXJlRm94IDMuNi4xMyBiZWhhdmlvclxuXHQvLyB3aGVuIGFib3V0LmNvbmZpZzo6ZG9tLnN0b3JhZ2UuZW5hYmxlZCA9PT0gZmFsc2Vcblx0Ly8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXJjdXN3ZXN0aW4vc3RvcmUuanMvaXNzdWVzI2lzc3VlLzEzXG5cdGZ1bmN0aW9uIGlzTG9jYWxTdG9yYWdlTmFtZVN1cHBvcnRlZCgpIHtcblx0XHR0cnkgeyByZXR1cm4gKGxvY2FsU3RvcmFnZU5hbWUgaW4gd2luICYmIHdpbltsb2NhbFN0b3JhZ2VOYW1lXSkgfVxuXHRcdGNhdGNoKGVycikgeyByZXR1cm4gZmFsc2UgfVxuXHR9XG5cblx0aWYgKGlzTG9jYWxTdG9yYWdlTmFtZVN1cHBvcnRlZCgpKSB7XG5cdFx0c3RvcmFnZSA9IHdpbltsb2NhbFN0b3JhZ2VOYW1lXVxuXHRcdHN0b3JlLnNldCA9IGZ1bmN0aW9uKGtleSwgdmFsKSB7XG5cdFx0XHRpZiAodmFsID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHN0b3JlLnJlbW92ZShrZXkpIH1cblx0XHRcdHN0b3JhZ2Uuc2V0SXRlbShrZXksIHN0b3JlLnNlcmlhbGl6ZSh2YWwpKVxuXHRcdFx0cmV0dXJuIHZhbFxuXHRcdH1cblx0XHRzdG9yZS5nZXQgPSBmdW5jdGlvbihrZXksIGRlZmF1bHRWYWwpIHtcblx0XHRcdHZhciB2YWwgPSBzdG9yZS5kZXNlcmlhbGl6ZShzdG9yYWdlLmdldEl0ZW0oa2V5KSlcblx0XHRcdHJldHVybiAodmFsID09PSB1bmRlZmluZWQgPyBkZWZhdWx0VmFsIDogdmFsKVxuXHRcdH1cblx0XHRzdG9yZS5yZW1vdmUgPSBmdW5jdGlvbihrZXkpIHsgc3RvcmFnZS5yZW1vdmVJdGVtKGtleSkgfVxuXHRcdHN0b3JlLmNsZWFyID0gZnVuY3Rpb24oKSB7IHN0b3JhZ2UuY2xlYXIoKSB9XG5cdFx0c3RvcmUuZ2V0QWxsID0gZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgcmV0ID0ge31cblx0XHRcdHN0b3JlLmZvckVhY2goZnVuY3Rpb24oa2V5LCB2YWwpIHtcblx0XHRcdFx0cmV0W2tleV0gPSB2YWxcblx0XHRcdH0pXG5cdFx0XHRyZXR1cm4gcmV0XG5cdFx0fVxuXHRcdHN0b3JlLmZvckVhY2ggPSBmdW5jdGlvbihjYWxsYmFjaykge1xuXHRcdFx0Zm9yICh2YXIgaT0wOyBpPHN0b3JhZ2UubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIGtleSA9IHN0b3JhZ2Uua2V5KGkpXG5cdFx0XHRcdGNhbGxiYWNrKGtleSwgc3RvcmUuZ2V0KGtleSkpXG5cdFx0XHR9XG5cdFx0fVxuXHR9IGVsc2UgaWYgKGRvYyAmJiBkb2MuZG9jdW1lbnRFbGVtZW50LmFkZEJlaGF2aW9yKSB7XG5cdFx0dmFyIHN0b3JhZ2VPd25lcixcblx0XHRcdHN0b3JhZ2VDb250YWluZXJcblx0XHQvLyBTaW5jZSAjdXNlckRhdGEgc3RvcmFnZSBhcHBsaWVzIG9ubHkgdG8gc3BlY2lmaWMgcGF0aHMsIHdlIG5lZWQgdG9cblx0XHQvLyBzb21laG93IGxpbmsgb3VyIGRhdGEgdG8gYSBzcGVjaWZpYyBwYXRoLiAgV2UgY2hvb3NlIC9mYXZpY29uLmljb1xuXHRcdC8vIGFzIGEgcHJldHR5IHNhZmUgb3B0aW9uLCBzaW5jZSBhbGwgYnJvd3NlcnMgYWxyZWFkeSBtYWtlIGEgcmVxdWVzdCB0b1xuXHRcdC8vIHRoaXMgVVJMIGFueXdheSBhbmQgYmVpbmcgYSA0MDQgd2lsbCBub3QgaHVydCB1cyBoZXJlLiAgV2Ugd3JhcCBhblxuXHRcdC8vIGlmcmFtZSBwb2ludGluZyB0byB0aGUgZmF2aWNvbiBpbiBhbiBBY3RpdmVYT2JqZWN0KGh0bWxmaWxlKSBvYmplY3Rcblx0XHQvLyAoc2VlOiBodHRwOi8vbXNkbi5taWNyb3NvZnQuY29tL2VuLXVzL2xpYnJhcnkvYWE3NTI1NzQodj1WUy44NSkuYXNweClcblx0XHQvLyBzaW5jZSB0aGUgaWZyYW1lIGFjY2VzcyBydWxlcyBhcHBlYXIgdG8gYWxsb3cgZGlyZWN0IGFjY2VzcyBhbmRcblx0XHQvLyBtYW5pcHVsYXRpb24gb2YgdGhlIGRvY3VtZW50IGVsZW1lbnQsIGV2ZW4gZm9yIGEgNDA0IHBhZ2UuICBUaGlzXG5cdFx0Ly8gZG9jdW1lbnQgY2FuIGJlIHVzZWQgaW5zdGVhZCBvZiB0aGUgY3VycmVudCBkb2N1bWVudCAod2hpY2ggd291bGRcblx0XHQvLyBoYXZlIGJlZW4gbGltaXRlZCB0byB0aGUgY3VycmVudCBwYXRoKSB0byBwZXJmb3JtICN1c2VyRGF0YSBzdG9yYWdlLlxuXHRcdHRyeSB7XG5cdFx0XHRzdG9yYWdlQ29udGFpbmVyID0gbmV3IEFjdGl2ZVhPYmplY3QoJ2h0bWxmaWxlJylcblx0XHRcdHN0b3JhZ2VDb250YWluZXIub3BlbigpXG5cdFx0XHRzdG9yYWdlQ29udGFpbmVyLndyaXRlKCc8JytzY3JpcHRUYWcrJz5kb2N1bWVudC53PXdpbmRvdzwvJytzY3JpcHRUYWcrJz48aWZyYW1lIHNyYz1cIi9mYXZpY29uLmljb1wiPjwvaWZyYW1lPicpXG5cdFx0XHRzdG9yYWdlQ29udGFpbmVyLmNsb3NlKClcblx0XHRcdHN0b3JhZ2VPd25lciA9IHN0b3JhZ2VDb250YWluZXIudy5mcmFtZXNbMF0uZG9jdW1lbnRcblx0XHRcdHN0b3JhZ2UgPSBzdG9yYWdlT3duZXIuY3JlYXRlRWxlbWVudCgnZGl2Jylcblx0XHR9IGNhdGNoKGUpIHtcblx0XHRcdC8vIHNvbWVob3cgQWN0aXZlWE9iamVjdCBpbnN0YW50aWF0aW9uIGZhaWxlZCAocGVyaGFwcyBzb21lIHNwZWNpYWxcblx0XHRcdC8vIHNlY3VyaXR5IHNldHRpbmdzIG9yIG90aGVyd3NlKSwgZmFsbCBiYWNrIHRvIHBlci1wYXRoIHN0b3JhZ2Vcblx0XHRcdHN0b3JhZ2UgPSBkb2MuY3JlYXRlRWxlbWVudCgnZGl2Jylcblx0XHRcdHN0b3JhZ2VPd25lciA9IGRvYy5ib2R5XG5cdFx0fVxuXHRcdHZhciB3aXRoSUVTdG9yYWdlID0gZnVuY3Rpb24oc3RvcmVGdW5jdGlvbikge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMClcblx0XHRcdFx0YXJncy51bnNoaWZ0KHN0b3JhZ2UpXG5cdFx0XHRcdC8vIFNlZSBodHRwOi8vbXNkbi5taWNyb3NvZnQuY29tL2VuLXVzL2xpYnJhcnkvbXM1MzEwODEodj1WUy44NSkuYXNweFxuXHRcdFx0XHQvLyBhbmQgaHR0cDovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L21zNTMxNDI0KHY9VlMuODUpLmFzcHhcblx0XHRcdFx0c3RvcmFnZU93bmVyLmFwcGVuZENoaWxkKHN0b3JhZ2UpXG5cdFx0XHRcdHN0b3JhZ2UuYWRkQmVoYXZpb3IoJyNkZWZhdWx0I3VzZXJEYXRhJylcblx0XHRcdFx0c3RvcmFnZS5sb2FkKGxvY2FsU3RvcmFnZU5hbWUpXG5cdFx0XHRcdHZhciByZXN1bHQgPSBzdG9yZUZ1bmN0aW9uLmFwcGx5KHN0b3JlLCBhcmdzKVxuXHRcdFx0XHRzdG9yYWdlT3duZXIucmVtb3ZlQ2hpbGQoc3RvcmFnZSlcblx0XHRcdFx0cmV0dXJuIHJlc3VsdFxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIEluIElFNywga2V5cyBjYW5ub3Qgc3RhcnQgd2l0aCBhIGRpZ2l0IG9yIGNvbnRhaW4gY2VydGFpbiBjaGFycy5cblx0XHQvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL21hcmN1c3dlc3Rpbi9zdG9yZS5qcy9pc3N1ZXMvNDBcblx0XHQvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL21hcmN1c3dlc3Rpbi9zdG9yZS5qcy9pc3N1ZXMvODNcblx0XHR2YXIgZm9yYmlkZGVuQ2hhcnNSZWdleCA9IG5ldyBSZWdFeHAoXCJbIVxcXCIjJCUmJygpKissL1xcXFxcXFxcOjs8PT4/QFtcXFxcXV5ge3x9fl1cIiwgXCJnXCIpXG5cdFx0dmFyIGllS2V5Rml4ID0gZnVuY3Rpb24oa2V5KSB7XG5cdFx0XHRyZXR1cm4ga2V5LnJlcGxhY2UoL15kLywgJ19fXyQmJykucmVwbGFjZShmb3JiaWRkZW5DaGFyc1JlZ2V4LCAnX19fJylcblx0XHR9XG5cdFx0c3RvcmUuc2V0ID0gd2l0aElFU3RvcmFnZShmdW5jdGlvbihzdG9yYWdlLCBrZXksIHZhbCkge1xuXHRcdFx0a2V5ID0gaWVLZXlGaXgoa2V5KVxuXHRcdFx0aWYgKHZhbCA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiBzdG9yZS5yZW1vdmUoa2V5KSB9XG5cdFx0XHRzdG9yYWdlLnNldEF0dHJpYnV0ZShrZXksIHN0b3JlLnNlcmlhbGl6ZSh2YWwpKVxuXHRcdFx0c3RvcmFnZS5zYXZlKGxvY2FsU3RvcmFnZU5hbWUpXG5cdFx0XHRyZXR1cm4gdmFsXG5cdFx0fSlcblx0XHRzdG9yZS5nZXQgPSB3aXRoSUVTdG9yYWdlKGZ1bmN0aW9uKHN0b3JhZ2UsIGtleSwgZGVmYXVsdFZhbCkge1xuXHRcdFx0a2V5ID0gaWVLZXlGaXgoa2V5KVxuXHRcdFx0dmFyIHZhbCA9IHN0b3JlLmRlc2VyaWFsaXplKHN0b3JhZ2UuZ2V0QXR0cmlidXRlKGtleSkpXG5cdFx0XHRyZXR1cm4gKHZhbCA9PT0gdW5kZWZpbmVkID8gZGVmYXVsdFZhbCA6IHZhbClcblx0XHR9KVxuXHRcdHN0b3JlLnJlbW92ZSA9IHdpdGhJRVN0b3JhZ2UoZnVuY3Rpb24oc3RvcmFnZSwga2V5KSB7XG5cdFx0XHRrZXkgPSBpZUtleUZpeChrZXkpXG5cdFx0XHRzdG9yYWdlLnJlbW92ZUF0dHJpYnV0ZShrZXkpXG5cdFx0XHRzdG9yYWdlLnNhdmUobG9jYWxTdG9yYWdlTmFtZSlcblx0XHR9KVxuXHRcdHN0b3JlLmNsZWFyID0gd2l0aElFU3RvcmFnZShmdW5jdGlvbihzdG9yYWdlKSB7XG5cdFx0XHR2YXIgYXR0cmlidXRlcyA9IHN0b3JhZ2UuWE1MRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmF0dHJpYnV0ZXNcblx0XHRcdHN0b3JhZ2UubG9hZChsb2NhbFN0b3JhZ2VOYW1lKVxuXHRcdFx0Zm9yICh2YXIgaT1hdHRyaWJ1dGVzLmxlbmd0aC0xOyBpPj0wOyBpLS0pIHtcblx0XHRcdFx0c3RvcmFnZS5yZW1vdmVBdHRyaWJ1dGUoYXR0cmlidXRlc1tpXS5uYW1lKVxuXHRcdFx0fVxuXHRcdFx0c3RvcmFnZS5zYXZlKGxvY2FsU3RvcmFnZU5hbWUpXG5cdFx0fSlcblx0XHRzdG9yZS5nZXRBbGwgPSBmdW5jdGlvbihzdG9yYWdlKSB7XG5cdFx0XHR2YXIgcmV0ID0ge31cblx0XHRcdHN0b3JlLmZvckVhY2goZnVuY3Rpb24oa2V5LCB2YWwpIHtcblx0XHRcdFx0cmV0W2tleV0gPSB2YWxcblx0XHRcdH0pXG5cdFx0XHRyZXR1cm4gcmV0XG5cdFx0fVxuXHRcdHN0b3JlLmZvckVhY2ggPSB3aXRoSUVTdG9yYWdlKGZ1bmN0aW9uKHN0b3JhZ2UsIGNhbGxiYWNrKSB7XG5cdFx0XHR2YXIgYXR0cmlidXRlcyA9IHN0b3JhZ2UuWE1MRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmF0dHJpYnV0ZXNcblx0XHRcdGZvciAodmFyIGk9MCwgYXR0cjsgYXR0cj1hdHRyaWJ1dGVzW2ldOyArK2kpIHtcblx0XHRcdFx0Y2FsbGJhY2soYXR0ci5uYW1lLCBzdG9yZS5kZXNlcmlhbGl6ZShzdG9yYWdlLmdldEF0dHJpYnV0ZShhdHRyLm5hbWUpKSlcblx0XHRcdH1cblx0XHR9KVxuXHR9XG5cblx0dHJ5IHtcblx0XHR2YXIgdGVzdEtleSA9ICdfX3N0b3JlanNfXydcblx0XHRzdG9yZS5zZXQodGVzdEtleSwgdGVzdEtleSlcblx0XHRpZiAoc3RvcmUuZ2V0KHRlc3RLZXkpICE9IHRlc3RLZXkpIHsgc3RvcmUuZGlzYWJsZWQgPSB0cnVlIH1cblx0XHRzdG9yZS5yZW1vdmUodGVzdEtleSlcblx0fSBjYXRjaChlKSB7XG5cdFx0c3RvcmUuZGlzYWJsZWQgPSB0cnVlXG5cdH1cblx0c3RvcmUuZW5hYmxlZCA9ICFzdG9yZS5kaXNhYmxlZFxuXHRcblx0cmV0dXJuIHN0b3JlXG59KSk7XG4iLCJ1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKVxuU3RvcmFnZSA9IHJlcXVpcmUoJy4vc3RvcmFnZScpXG5cbmNsYXNzIEFkYXB0ZXJzXG5cbiAgIyMgQWRhcHRlciBmb3IgdXNpbmcgdGhlIGdpbWVsIGJhY2tlbmQuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vQWxlcGhiZXQvZ2ltZWxcbiAgIyMgdXNlcyBqUXVlcnkgdG8gc2VuZCBkYXRhIGlmIGAkLmFqYXhgIGlzIGZvdW5kLiBGYWxscyBiYWNrIG9uIHBsYWluIGpzIHhoclxuICAjIyBwYXJhbXM6XG4gICMjIC0gdXJsOiBHaW1lbCB0cmFjayBVUkwgdG8gcG9zdCBldmVudHMgdG9cbiAgIyMgLSBuYW1lcHNhY2U6IG5hbWVzcGFjZSBmb3IgR2ltZWwgKGFsbG93cyBzZXR0aW5nIGRpZmZlcmVudCBlbnZpcm9ubWVudHMgZXRjKVxuICAjIyAtIHN0b3JhZ2UgKG9wdGlvbmFsKSAtIHN0b3JhZ2UgYWRhcHRlciBmb3IgdGhlIHF1ZXVlXG4gIGNsYXNzIEBHaW1lbEFkYXB0ZXJcbiAgICBxdWV1ZV9uYW1lOiAnX2dpbWVsX3F1ZXVlJ1xuXG4gICAgY29uc3RydWN0b3I6ICh1cmwsIG5hbWVzcGFjZSwgc3RvcmFnZSA9IEFkYXB0ZXJzLkxvY2FsU3RvcmFnZUFkYXB0ZXIpIC0+XG4gICAgICBAX3N0b3JhZ2UgPSBzdG9yYWdlXG4gICAgICBAdXJsID0gdXJsXG4gICAgICBAbmFtZXNwYWNlID0gbmFtZXNwYWNlXG4gICAgICBAX3F1ZXVlID0gSlNPTi5wYXJzZShAX3N0b3JhZ2UuZ2V0KEBxdWV1ZV9uYW1lKSB8fCAnW10nKVxuICAgICAgQF9mbHVzaCgpXG5cbiAgICBfcmVtb3ZlX3V1aWQ6ICh1dWlkKSAtPlxuICAgICAgKGVyciwgcmVzKSA9PlxuICAgICAgICByZXR1cm4gaWYgZXJyXG4gICAgICAgIHV0aWxzLnJlbW92ZShAX3F1ZXVlLCAoZWwpIC0+IGVsLnByb3BlcnRpZXMudXVpZCA9PSB1dWlkKVxuICAgICAgICBAX3N0b3JhZ2Uuc2V0KEBxdWV1ZV9uYW1lLCBKU09OLnN0cmluZ2lmeShAX3F1ZXVlKSlcblxuICAgIF9qcXVlcnlfZ2V0OiAodXJsLCBkYXRhLCBjYWxsYmFjaykgLT5cbiAgICAgIHV0aWxzLmxvZygnc2VuZCByZXF1ZXN0IHVzaW5nIGpRdWVyeScpXG4gICAgICAkLmFqYXhcbiAgICAgICAgbWV0aG9kOiAnR0VUJ1xuICAgICAgICB1cmw6IHVybFxuICAgICAgICBkYXRhOiBkYXRhXG4gICAgICAgIHN1Y2Nlc3M6IGNhbGxiYWNrXG5cbiAgICBfcGxhaW5fanNfZ2V0OiAodXJsLCBkYXRhLCBjYWxsYmFjaykgLT5cbiAgICAgIHV0aWxzLmxvZygnZmFsbGJhY2sgb24gcGxhaW4ganMgeGhyJylcbiAgICAgIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG4gICAgICBwYXJhbXMgPSAoXCIje2VuY29kZVVSSUNvbXBvbmVudChrKX09I3tlbmNvZGVVUklDb21wb25lbnQodil9XCIgZm9yIGssdiBvZiBkYXRhKVxuICAgICAgcGFyYW1zID0gcGFyYW1zLmpvaW4oJyYnKS5yZXBsYWNlKC8lMjAvZywgJysnKVxuICAgICAgeGhyLm9wZW4oJ0dFVCcsIFwiI3t1cmx9PyN7cGFyYW1zfVwiKVxuICAgICAgeGhyLm9ubG9hZCA9IC0+XG4gICAgICAgIGlmIHhoci5zdGF0dXMgPT0gMjAwXG4gICAgICAgICAgY2FsbGJhY2soKVxuICAgICAgeGhyLnNlbmQoKVxuXG4gICAgX2FqYXhfZ2V0OiAodXJsLCBkYXRhLCBjYWxsYmFjaykgLT5cbiAgICAgIGlmICQ/LmFqYXhcbiAgICAgICAgQF9qcXVlcnlfZ2V0KHVybCwgZGF0YSwgY2FsbGJhY2spXG4gICAgICBlbHNlXG4gICAgICAgIEBfcGxhaW5fanNfZ2V0KHVybCwgZGF0YSwgY2FsbGJhY2spXG5cbiAgICBfZmx1c2g6IC0+XG4gICAgICBmb3IgaXRlbSBpbiBAX3F1ZXVlXG4gICAgICAgIGNhbGxiYWNrID0gQF9yZW1vdmVfdXVpZChpdGVtLnByb3BlcnRpZXMudXVpZClcbiAgICAgICAgQF9hamF4X2dldChAdXJsLCBpdGVtLnByb3BlcnRpZXMsIGNhbGxiYWNrKVxuICAgICAgICBudWxsXG5cbiAgICBfdHJhY2s6IChleHBlcmltZW50X25hbWUsIHZhcmlhbnQsIGV2ZW50KSAtPlxuICAgICAgdXRpbHMubG9nKFwiUGVyc2lzdGVudCBRdWV1ZSBHaW1lbCB0cmFjazogI3tAbmFtZXNwYWNlfSwgI3tleHBlcmltZW50X25hbWV9LCAje3ZhcmlhbnR9LCAje2V2ZW50fVwiKVxuICAgICAgQF9xdWV1ZS5zaGlmdCgpIGlmIEBfcXVldWUubGVuZ3RoID4gMTAwXG4gICAgICBAX3F1ZXVlLnB1c2hcbiAgICAgICAgcHJvcGVydGllczpcbiAgICAgICAgICBleHBlcmltZW50OiBleHBlcmltZW50X25hbWVcbiAgICAgICAgICB1dWlkOiB1dGlscy51dWlkKClcbiAgICAgICAgICB2YXJpYW50OiB2YXJpYW50XG4gICAgICAgICAgZXZlbnQ6IGV2ZW50XG4gICAgICAgICAgbmFtZXNwYWNlOiBAbmFtZXNwYWNlXG4gICAgICBAX3N0b3JhZ2Uuc2V0KEBxdWV1ZV9uYW1lLCBKU09OLnN0cmluZ2lmeShAX3F1ZXVlKSlcbiAgICAgIEBfZmx1c2goKVxuXG4gICAgZXhwZXJpbWVudF9zdGFydDogKGV4cGVyaW1lbnRfbmFtZSwgdmFyaWFudCkgPT5cbiAgICAgIEBfdHJhY2soZXhwZXJpbWVudF9uYW1lLCB2YXJpYW50LCAncGFydGljaXBhdGUnKVxuXG4gICAgZ29hbF9jb21wbGV0ZTogKGV4cGVyaW1lbnRfbmFtZSwgdmFyaWFudCwgZ29hbCkgPT5cbiAgICAgIEBfdHJhY2soZXhwZXJpbWVudF9uYW1lLCB2YXJpYW50LCBnb2FsKVxuXG5cbiAgY2xhc3MgQFBlcnNpc3RlbnRRdWV1ZUdvb2dsZUFuYWx5dGljc0FkYXB0ZXJcbiAgICBuYW1lc3BhY2U6ICdhbGVwaGJldCdcbiAgICBxdWV1ZV9uYW1lOiAnX2dhX3F1ZXVlJ1xuXG4gICAgY29uc3RydWN0b3I6IChzdG9yYWdlID0gQWRhcHRlcnMuTG9jYWxTdG9yYWdlQWRhcHRlcikgLT5cbiAgICAgIEBfc3RvcmFnZSA9IHN0b3JhZ2VcbiAgICAgIEBfcXVldWUgPSBKU09OLnBhcnNlKEBfc3RvcmFnZS5nZXQoQHF1ZXVlX25hbWUpIHx8ICdbXScpXG4gICAgICBAX2ZsdXNoKClcblxuICAgIF9yZW1vdmVfdXVpZDogKHV1aWQpIC0+XG4gICAgICA9PlxuICAgICAgICB1dGlscy5yZW1vdmUoQF9xdWV1ZSwgKGVsKSAtPiBlbC51dWlkID09IHV1aWQpXG4gICAgICAgIEBfc3RvcmFnZS5zZXQoQHF1ZXVlX25hbWUsIEpTT04uc3RyaW5naWZ5KEBfcXVldWUpKVxuXG4gICAgX2ZsdXNoOiAtPlxuICAgICAgdGhyb3cgJ2dhIG5vdCBkZWZpbmVkLiBQbGVhc2UgbWFrZSBzdXJlIHlvdXIgVW5pdmVyc2FsIGFuYWx5dGljcyBpcyBzZXQgdXAgY29ycmVjdGx5JyBpZiB0eXBlb2YgZ2EgaXNudCAnZnVuY3Rpb24nXG4gICAgICBmb3IgaXRlbSBpbiBAX3F1ZXVlXG4gICAgICAgIGNhbGxiYWNrID0gQF9yZW1vdmVfdXVpZChpdGVtLnV1aWQpXG4gICAgICAgIGdhKCdzZW5kJywgJ2V2ZW50JywgaXRlbS5jYXRlZ29yeSwgaXRlbS5hY3Rpb24sIGl0ZW0ubGFiZWwsIHsnaGl0Q2FsbGJhY2snOiBjYWxsYmFjaywgJ25vbkludGVyYWN0aW9uJzogMX0pXG5cbiAgICBfdHJhY2s6IChjYXRlZ29yeSwgYWN0aW9uLCBsYWJlbCkgLT5cbiAgICAgIHV0aWxzLmxvZyhcIlBlcnNpc3RlbnQgUXVldWUgR29vZ2xlIFVuaXZlcnNhbCBBbmFseXRpY3MgdHJhY2s6ICN7Y2F0ZWdvcnl9LCAje2FjdGlvbn0sICN7bGFiZWx9XCIpXG4gICAgICBAX3F1ZXVlLnNoaWZ0KCkgaWYgQF9xdWV1ZS5sZW5ndGggPiAxMDBcbiAgICAgIEBfcXVldWUucHVzaCh7dXVpZDogdXRpbHMudXVpZCgpLCBjYXRlZ29yeTogY2F0ZWdvcnksIGFjdGlvbjogYWN0aW9uLCBsYWJlbDogbGFiZWx9KVxuICAgICAgQF9zdG9yYWdlLnNldChAcXVldWVfbmFtZSwgSlNPTi5zdHJpbmdpZnkoQF9xdWV1ZSkpXG4gICAgICBAX2ZsdXNoKClcblxuICAgIGV4cGVyaW1lbnRfc3RhcnQ6IChleHBlcmltZW50X25hbWUsIHZhcmlhbnQpID0+XG4gICAgICBAX3RyYWNrKEBuYW1lc3BhY2UsIFwiI3tleHBlcmltZW50X25hbWV9IHwgI3t2YXJpYW50fVwiLCAnVmlzaXRvcnMnKVxuXG4gICAgZ29hbF9jb21wbGV0ZTogKGV4cGVyaW1lbnRfbmFtZSwgdmFyaWFudCwgZ29hbCkgPT5cbiAgICAgIEBfdHJhY2soQG5hbWVzcGFjZSwgXCIje2V4cGVyaW1lbnRfbmFtZX0gfCAje3ZhcmlhbnR9XCIsIGdvYWwpXG5cblxuICBjbGFzcyBAUGVyc2lzdGVudFF1ZXVlS2VlbkFkYXB0ZXJcbiAgICBxdWV1ZV9uYW1lOiAnX2tlZW5fcXVldWUnXG5cbiAgICBjb25zdHJ1Y3RvcjogKGtlZW5fY2xpZW50LCBzdG9yYWdlID0gQWRhcHRlcnMuTG9jYWxTdG9yYWdlQWRhcHRlcikgLT5cbiAgICAgIEBjbGllbnQgPSBrZWVuX2NsaWVudFxuICAgICAgQF9zdG9yYWdlID0gc3RvcmFnZVxuICAgICAgQF9xdWV1ZSA9IEpTT04ucGFyc2UoQF9zdG9yYWdlLmdldChAcXVldWVfbmFtZSkgfHwgJ1tdJylcbiAgICAgIEBfZmx1c2goKVxuXG4gICAgX3JlbW92ZV91dWlkOiAodXVpZCkgLT5cbiAgICAgIChlcnIsIHJlcykgPT5cbiAgICAgICAgcmV0dXJuIGlmIGVyclxuICAgICAgICB1dGlscy5yZW1vdmUoQF9xdWV1ZSwgKGVsKSAtPiBlbC5wcm9wZXJ0aWVzLnV1aWQgPT0gdXVpZClcbiAgICAgICAgQF9zdG9yYWdlLnNldChAcXVldWVfbmFtZSwgSlNPTi5zdHJpbmdpZnkoQF9xdWV1ZSkpXG5cbiAgICBfZmx1c2g6IC0+XG4gICAgICBmb3IgaXRlbSBpbiBAX3F1ZXVlXG4gICAgICAgIGNhbGxiYWNrID0gQF9yZW1vdmVfdXVpZChpdGVtLnByb3BlcnRpZXMudXVpZClcbiAgICAgICAgQGNsaWVudC5hZGRFdmVudChpdGVtLmV4cGVyaW1lbnRfbmFtZSwgaXRlbS5wcm9wZXJ0aWVzLCBjYWxsYmFjaylcblxuICAgIF90cmFjazogKGV4cGVyaW1lbnRfbmFtZSwgdmFyaWFudCwgZXZlbnQpIC0+XG4gICAgICB1dGlscy5sb2coXCJQZXJzaXN0ZW50IFF1ZXVlIEtlZW4gdHJhY2s6ICN7ZXhwZXJpbWVudF9uYW1lfSwgI3t2YXJpYW50fSwgI3tldmVudH1cIilcbiAgICAgIEBfcXVldWUuc2hpZnQoKSBpZiBAX3F1ZXVlLmxlbmd0aCA+IDEwMFxuICAgICAgQF9xdWV1ZS5wdXNoXG4gICAgICAgIGV4cGVyaW1lbnRfbmFtZTogZXhwZXJpbWVudF9uYW1lXG4gICAgICAgIHByb3BlcnRpZXM6XG4gICAgICAgICAgdXVpZDogdXRpbHMudXVpZCgpXG4gICAgICAgICAgdmFyaWFudDogdmFyaWFudFxuICAgICAgICAgIGV2ZW50OiBldmVudFxuICAgICAgQF9zdG9yYWdlLnNldChAcXVldWVfbmFtZSwgSlNPTi5zdHJpbmdpZnkoQF9xdWV1ZSkpXG4gICAgICBAX2ZsdXNoKClcblxuICAgIGV4cGVyaW1lbnRfc3RhcnQ6IChleHBlcmltZW50X25hbWUsIHZhcmlhbnQpID0+XG4gICAgICBAX3RyYWNrKGV4cGVyaW1lbnRfbmFtZSwgdmFyaWFudCwgJ3BhcnRpY2lwYXRlJylcblxuICAgIGdvYWxfY29tcGxldGU6IChleHBlcmltZW50X25hbWUsIHZhcmlhbnQsIGdvYWwpID0+XG4gICAgICBAX3RyYWNrKGV4cGVyaW1lbnRfbmFtZSwgdmFyaWFudCwgZ29hbClcblxuXG4gIGNsYXNzIEBHb29nbGVVbml2ZXJzYWxBbmFseXRpY3NBZGFwdGVyXG4gICAgQG5hbWVzcGFjZTogJ2FsZXBoYmV0J1xuXG4gICAgQF90cmFjazogKGNhdGVnb3J5LCBhY3Rpb24sIGxhYmVsKSAtPlxuICAgICAgdXRpbHMubG9nKFwiR29vZ2xlIFVuaXZlcnNhbCBBbmFseXRpY3MgdHJhY2s6ICN7Y2F0ZWdvcnl9LCAje2FjdGlvbn0sICN7bGFiZWx9XCIpXG4gICAgICB0aHJvdyAnZ2Egbm90IGRlZmluZWQuIFBsZWFzZSBtYWtlIHN1cmUgeW91ciBVbml2ZXJzYWwgYW5hbHl0aWNzIGlzIHNldCB1cCBjb3JyZWN0bHknIGlmIHR5cGVvZiBnYSBpc250ICdmdW5jdGlvbidcbiAgICAgIGdhKCdzZW5kJywgJ2V2ZW50JywgY2F0ZWdvcnksIGFjdGlvbiwgbGFiZWwsIHsnbm9uSW50ZXJhY3Rpb24nOiAxfSlcblxuICAgIEBleHBlcmltZW50X3N0YXJ0OiAoZXhwZXJpbWVudF9uYW1lLCB2YXJpYW50KSA9PlxuICAgICAgQF90cmFjayhAbmFtZXNwYWNlLCBcIiN7ZXhwZXJpbWVudF9uYW1lfSB8ICN7dmFyaWFudH1cIiwgJ1Zpc2l0b3JzJylcblxuICAgIEBnb2FsX2NvbXBsZXRlOiAoZXhwZXJpbWVudF9uYW1lLCB2YXJpYW50LCBnb2FsKSA9PlxuICAgICAgQF90cmFjayhAbmFtZXNwYWNlLCBcIiN7ZXhwZXJpbWVudF9uYW1lfSB8ICN7dmFyaWFudH1cIiwgZ29hbClcblxuXG4gIGNsYXNzIEBMb2NhbFN0b3JhZ2VBZGFwdGVyXG4gICAgQG5hbWVzcGFjZTogJ2FsZXBoYmV0J1xuICAgIEBzZXQ6IChrZXksIHZhbHVlKSAtPlxuICAgICAgbmV3IFN0b3JhZ2UoQG5hbWVzcGFjZSkuc2V0KGtleSwgdmFsdWUpXG4gICAgQGdldDogKGtleSkgLT5cbiAgICAgIG5ldyBTdG9yYWdlKEBuYW1lc3BhY2UpLmdldChrZXkpXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBZGFwdGVyc1xuIiwidXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJylcbmFkYXB0ZXJzID0gcmVxdWlyZSgnLi9hZGFwdGVycycpXG5vcHRpb25zID0gcmVxdWlyZSgnLi9vcHRpb25zJylcblxuY2xhc3MgQWxlcGhCZXRcbiAgQG9wdGlvbnMgPSBvcHRpb25zXG4gIEB1dGlscyA9IHV0aWxzXG5cbiAgQEdpbWVsQWRhcHRlciA9IGFkYXB0ZXJzLkdpbWVsQWRhcHRlclxuICBAUGVyc2lzdGVudFF1ZXVlR29vZ2xlQW5hbHl0aWNzQWRhcHRlciA9IGFkYXB0ZXJzLlBlcnNpc3RlbnRRdWV1ZUdvb2dsZUFuYWx5dGljc0FkYXB0ZXJcbiAgQFBlcnNpc3RlbnRRdWV1ZUtlZW5BZGFwdGVyID0gYWRhcHRlcnMuUGVyc2lzdGVudFF1ZXVlS2VlbkFkYXB0ZXJcblxuICBjbGFzcyBARXhwZXJpbWVudFxuICAgIEBfb3B0aW9uczpcbiAgICAgIG5hbWU6IG51bGxcbiAgICAgIHZhcmlhbnRzOiBudWxsXG4gICAgICBzYW1wbGU6IDEuMFxuICAgICAgdHJpZ2dlcjogLT4gdHJ1ZVxuICAgICAgdHJhY2tpbmdfYWRhcHRlcjogYWRhcHRlcnMuR29vZ2xlVW5pdmVyc2FsQW5hbHl0aWNzQWRhcHRlclxuICAgICAgc3RvcmFnZV9hZGFwdGVyOiBhZGFwdGVycy5Mb2NhbFN0b3JhZ2VBZGFwdGVyXG5cbiAgICBjb25zdHJ1Y3RvcjogKEBvcHRpb25zPXt9KSAtPlxuICAgICAgdXRpbHMuZGVmYXVsdHMoQG9wdGlvbnMsIEV4cGVyaW1lbnQuX29wdGlvbnMpXG4gICAgICBfdmFsaWRhdGUuY2FsbCh0aGlzKVxuICAgICAgQG5hbWUgPSBAb3B0aW9ucy5uYW1lXG4gICAgICBAdmFyaWFudHMgPSBAb3B0aW9ucy52YXJpYW50c1xuICAgICAgQHZhcmlhbnRfbmFtZXMgPSB1dGlscy5rZXlzKEB2YXJpYW50cylcbiAgICAgIF9ydW4uY2FsbCh0aGlzKVxuXG4gICAgcnVuOiAtPlxuICAgICAgdXRpbHMubG9nKFwicnVubmluZyB3aXRoIG9wdGlvbnM6ICN7SlNPTi5zdHJpbmdpZnkoQG9wdGlvbnMpfVwiKVxuICAgICAgaWYgdmFyaWFudCA9IEBnZXRfc3RvcmVkX3ZhcmlhbnQoKVxuICAgICAgICAjIGEgdmFyaWFudCB3YXMgYWxyZWFkeSBjaG9zZW4uIGFjdGl2YXRlIGl0XG4gICAgICAgIHV0aWxzLmxvZyhcIiN7dmFyaWFudH0gYWN0aXZlXCIpXG4gICAgICAgIEBhY3RpdmF0ZV92YXJpYW50KHZhcmlhbnQpXG4gICAgICBlbHNlXG4gICAgICAgIEBjb25kaXRpb25hbGx5X2FjdGl2YXRlX3ZhcmlhbnQoKVxuXG4gICAgX3J1biA9IC0+IEBydW4oKVxuXG4gICAgYWN0aXZhdGVfdmFyaWFudDogKHZhcmlhbnQpIC0+XG4gICAgICBAdmFyaWFudHNbdmFyaWFudF0/LmFjdGl2YXRlKHRoaXMpXG4gICAgICBAc3RvcmFnZSgpLnNldChcIiN7QG9wdGlvbnMubmFtZX06dmFyaWFudFwiLCB2YXJpYW50KVxuXG4gICAgIyBpZiBleHBlcmltZW50IGNvbmRpdGlvbnMgbWF0Y2gsIHBpY2sgYW5kIGFjdGl2YXRlIGEgdmFyaWFudCwgdHJhY2sgZXhwZXJpbWVudCBzdGFydFxuICAgIGNvbmRpdGlvbmFsbHlfYWN0aXZhdGVfdmFyaWFudDogLT5cbiAgICAgIHJldHVybiB1bmxlc3MgQG9wdGlvbnMudHJpZ2dlcigpXG4gICAgICB1dGlscy5sb2coJ3RyaWdnZXIgc2V0JylcbiAgICAgIHJldHVybiB1bmxlc3MgQGluX3NhbXBsZSgpXG4gICAgICB1dGlscy5sb2coJ2luIHNhbXBsZScpXG4gICAgICB2YXJpYW50ID0gQHBpY2tfdmFyaWFudCgpXG4gICAgICBAdHJhY2tpbmcoKS5leHBlcmltZW50X3N0YXJ0KEBvcHRpb25zLm5hbWUsIHZhcmlhbnQpXG4gICAgICBAYWN0aXZhdGVfdmFyaWFudCh2YXJpYW50KVxuXG4gICAgZ29hbF9jb21wbGV0ZTogKGdvYWxfbmFtZSwgcHJvcHM9e30pIC0+XG4gICAgICB1dGlscy5kZWZhdWx0cyhwcm9wcywge3VuaXF1ZTogdHJ1ZX0pXG4gICAgICByZXR1cm4gaWYgcHJvcHMudW5pcXVlICYmIEBzdG9yYWdlKCkuZ2V0KFwiI3tAb3B0aW9ucy5uYW1lfToje2dvYWxfbmFtZX1cIilcbiAgICAgIHZhcmlhbnQgPSBAZ2V0X3N0b3JlZF92YXJpYW50KClcbiAgICAgIHJldHVybiB1bmxlc3MgdmFyaWFudFxuICAgICAgQHN0b3JhZ2UoKS5zZXQoXCIje0BvcHRpb25zLm5hbWV9OiN7Z29hbF9uYW1lfVwiLCB0cnVlKSBpZiBwcm9wcy51bmlxdWVcbiAgICAgIHV0aWxzLmxvZyhcImV4cGVyaW1lbnQ6ICN7QG9wdGlvbnMubmFtZX0gdmFyaWFudDoje3ZhcmlhbnR9IGdvYWw6I3tnb2FsX25hbWV9IGNvbXBsZXRlXCIpXG4gICAgICBAdHJhY2tpbmcoKS5nb2FsX2NvbXBsZXRlKEBvcHRpb25zLm5hbWUsIHZhcmlhbnQsIGdvYWxfbmFtZSlcblxuICAgIGdldF9zdG9yZWRfdmFyaWFudDogLT5cbiAgICAgIEBzdG9yYWdlKCkuZ2V0KFwiI3tAb3B0aW9ucy5uYW1lfTp2YXJpYW50XCIpXG5cbiAgICBwaWNrX3ZhcmlhbnQ6IC0+XG4gICAgICBwYXJ0aXRpb25zID0gMS4wIC8gQHZhcmlhbnRfbmFtZXMubGVuZ3RoXG4gICAgICBjaG9zZW5fcGFydGl0aW9uID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpIC8gcGFydGl0aW9ucylcbiAgICAgIHZhcmlhbnQgPSBAdmFyaWFudF9uYW1lc1tjaG9zZW5fcGFydGl0aW9uXVxuICAgICAgdXRpbHMubG9nKFwiI3t2YXJpYW50fSBwaWNrZWRcIilcbiAgICAgIHZhcmlhbnRcblxuICAgIGluX3NhbXBsZTogLT5cbiAgICAgIGFjdGl2ZSA9IEBzdG9yYWdlKCkuZ2V0KFwiI3tAb3B0aW9ucy5uYW1lfTppbl9zYW1wbGVcIilcbiAgICAgIHJldHVybiBhY3RpdmUgdW5sZXNzIHR5cGVvZiBhY3RpdmUgaXMgJ3VuZGVmaW5lZCdcbiAgICAgIGFjdGl2ZSA9IE1hdGgucmFuZG9tKCkgPD0gQG9wdGlvbnMuc2FtcGxlXG4gICAgICBAc3RvcmFnZSgpLnNldChcIiN7QG9wdGlvbnMubmFtZX06aW5fc2FtcGxlXCIsIGFjdGl2ZSlcbiAgICAgIGFjdGl2ZVxuXG4gICAgYWRkX2dvYWw6IChnb2FsKSA9PlxuICAgICAgZ29hbC5hZGRfZXhwZXJpbWVudCh0aGlzKVxuXG4gICAgYWRkX2dvYWxzOiAoZ29hbHMpID0+XG4gICAgICBAYWRkX2dvYWwoZ29hbCkgZm9yIGdvYWwgaW4gZ29hbHNcblxuICAgIHN0b3JhZ2U6IC0+IEBvcHRpb25zLnN0b3JhZ2VfYWRhcHRlclxuXG4gICAgdHJhY2tpbmc6IC0+IEBvcHRpb25zLnRyYWNraW5nX2FkYXB0ZXJcblxuICAgIF92YWxpZGF0ZSA9IC0+XG4gICAgICB0aHJvdyAnYW4gZXhwZXJpbWVudCBuYW1lIG11c3QgYmUgc3BlY2lmaWVkJyBpZiBAb3B0aW9ucy5uYW1lIGlzIG51bGxcbiAgICAgIHRocm93ICd2YXJpYW50cyBtdXN0IGJlIHByb3ZpZGVkJyBpZiBAb3B0aW9ucy52YXJpYW50cyBpcyBudWxsXG4gICAgICB0aHJvdyAndHJpZ2dlciBtdXN0IGJlIGEgZnVuY3Rpb24nIGlmIHR5cGVvZiBAb3B0aW9ucy50cmlnZ2VyIGlzbnQgJ2Z1bmN0aW9uJ1xuXG5cbiAgY2xhc3MgQEdvYWxcbiAgICBjb25zdHJ1Y3RvcjogKEBuYW1lLCBAcHJvcHM9e30pIC0+XG4gICAgICB1dGlscy5kZWZhdWx0cyhAcHJvcHMsIHt1bmlxdWU6IHRydWV9KVxuICAgICAgQGV4cGVyaW1lbnRzID0gW11cblxuICAgIGFkZF9leHBlcmltZW50OiAoZXhwZXJpbWVudCkgLT5cbiAgICAgIEBleHBlcmltZW50cy5wdXNoKGV4cGVyaW1lbnQpXG5cbiAgICBhZGRfZXhwZXJpbWVudHM6IChleHBlcmltZW50cykgLT5cbiAgICAgIEBhZGRfZXhwZXJpbWVudChleHBlcmltZW50KSBmb3IgZXhwZXJpbWVudCBpbiBleHBlcmltZW50c1xuXG4gICAgY29tcGxldGU6IC0+XG4gICAgICBmb3IgZXhwZXJpbWVudCBpbiBAZXhwZXJpbWVudHNcbiAgICAgICAgZXhwZXJpbWVudC5nb2FsX2NvbXBsZXRlKEBuYW1lLCBAcHJvcHMpXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBbGVwaEJldFxuIiwibW9kdWxlLmV4cG9ydHMgPVxuICBkZWJ1ZzogZmFsc2VcbiIsInN0b3JlID0gcmVxdWlyZSgnc3RvcmUnKVxuXG4jIGEgdGhpbiB3cmFwcGVyIGFyb3VuZCBzdG9yZS5qcyBmb3IgZWFzeSBzd2FwcGluZ1xuY2xhc3MgU3RvcmFnZVxuICBjb25zdHJ1Y3RvcjogKEBuYW1lc3BhY2U9J2FsZXBoYmV0JykgLT5cbiAgICB0aHJvdyAnbG9jYWwgc3RvcmFnZSBub3Qgc3VwcG9ydGVkJyB1bmxlc3Mgc3RvcmUuZW5hYmxlZFxuICAgIEBzdG9yYWdlID0gc3RvcmUuZ2V0KEBuYW1lc3BhY2UpIHx8IHt9XG4gIHNldDogKGtleSwgdmFsdWUpIC0+XG4gICAgQHN0b3JhZ2Vba2V5XSA9IHZhbHVlXG4gICAgc3RvcmUuc2V0KEBuYW1lc3BhY2UsIEBzdG9yYWdlKVxuICAgIHJldHVybiB2YWx1ZVxuICBnZXQ6IChrZXkpIC0+XG4gICAgQHN0b3JhZ2Vba2V5XVxuICAgICMgc3RvcmUuZ2V0KFwiI3tAbmFtZXNwYWNlfToje2tleX1cIilcblxubW9kdWxlLmV4cG9ydHMgPSBTdG9yYWdlXG4iLCIjIE5PVEU6IHVzaW5nIGEgY3VzdG9tIGJ1aWxkIG9mIGxvZGFzaCwgdG8gc2F2ZSBzcGFjZVxuXyA9IHJlcXVpcmUoJ2xvZGFzaC5jdXN0b20nKVxudXVpZCA9IHJlcXVpcmUoJ25vZGUtdXVpZCcpXG5vcHRpb25zID0gcmVxdWlyZSgnLi9vcHRpb25zJylcblxuY2xhc3MgVXRpbHNcbiAgQGRlZmF1bHRzOiBfLmRlZmF1bHRzXG4gIEBrZXlzOiBfLmtleXNcbiAgQHJlbW92ZTogXy5yZW1vdmVcbiAgQGxvZzogKG1lc3NhZ2UpIC0+XG4gICAgY29uc29sZS5sb2cobWVzc2FnZSkgaWYgb3B0aW9ucy5kZWJ1Z1xuICBAdXVpZDogdXVpZC52NFxuXG5tb2R1bGUuZXhwb3J0cyA9IFV0aWxzXG4iLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBsb2Rhc2ggMy4xMC4wIChDdXN0b20gQnVpbGQpIGxvZGFzaC5jb20vbGljZW5zZSB8IFVuZGVyc2NvcmUuanMgMS44LjMgdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFXG4gKiBCdWlsZDogYGxvZGFzaCAtcCBpbmNsdWRlPVwia2V5cyxkZWZhdWx0cyxyZW1vdmVcIiBleHBvcnRzPVwibm9kZVwiIC1vIC4vdmVuZG9yL2xvZGFzaC5jdXN0b20ubWluLmpzYFxuICovXG47KGZ1bmN0aW9uKCl7ZnVuY3Rpb24gQihhKXtyZXR1cm4hIWEmJnR5cGVvZiBhPT1cIm9iamVjdFwifWZ1bmN0aW9uIG4oKXt9ZnVuY3Rpb24gU2EoYSxiKXt2YXIgYz0tMSxlPWEubGVuZ3RoO2ZvcihifHwoYj1BcnJheShlKSk7KytjPGU7KWJbY109YVtjXTtyZXR1cm4gYn1mdW5jdGlvbiByYShhLGIpe2Zvcih2YXIgYz0tMSxlPWEubGVuZ3RoOysrYzxlJiZmYWxzZSE9PWIoYVtjXSxjLGEpOyk7cmV0dXJuIGF9ZnVuY3Rpb24gVGEoYSxiKXtmb3IodmFyIGM9LTEsZT1hLmxlbmd0aDsrK2M8ZTspaWYoYihhW2NdLGMsYSkpcmV0dXJuIHRydWU7cmV0dXJuIGZhbHNlfWZ1bmN0aW9uIHNhKGEsYil7dmFyIGM7aWYobnVsbD09YiljPWE7ZWxzZXtjPUMoYik7dmFyIGU9YTtlfHwoZT17fSk7Zm9yKHZhciBkPS0xLGY9Yy5sZW5ndGg7KytkPGY7KXt2YXIgaD1jW2RdO2VbaF09YltoXX1jPWV9cmV0dXJuIGN9ZnVuY3Rpb24gdGEoYSxiLGMpe3ZhciBlPXR5cGVvZiBhO3JldHVyblwiZnVuY3Rpb25cIj09XG5lP2I9PT1wP2E6dWEoYSxiLGMpOm51bGw9PWE/aGE6XCJvYmplY3RcIj09ZT92YShhKTpiPT09cD93YShhKTpVYShhLGIpfWZ1bmN0aW9uIHhhKGEsYixjLGUsZCxmLGgpe3ZhciBnO2MmJihnPWQ/YyhhLGUsZCk6YyhhKSk7aWYoZyE9PXApcmV0dXJuIGc7aWYoIXYoYSkpcmV0dXJuIGE7aWYoZT15KGEpKXtpZihnPVZhKGEpLCFiKXJldHVybiBTYShhLGcpfWVsc2V7dmFyIGw9QS5jYWxsKGEpLG09bD09SDtpZihsPT10fHxsPT1JfHxtJiYhZCl7aWYoUShhKSlyZXR1cm4gZD9hOnt9O2c9V2EobT97fTphKTtpZighYilyZXR1cm4gc2EoZyxhKX1lbHNlIHJldHVybiBxW2xdP1hhKGEsbCxiKTpkP2E6e319Znx8KGY9W10pO2h8fChoPVtdKTtmb3IoZD1mLmxlbmd0aDtkLS07KWlmKGZbZF09PWEpcmV0dXJuIGhbZF07Zi5wdXNoKGEpO2gucHVzaChnKTsoZT9yYTpZYSkoYSxmdW5jdGlvbihkLGUpe2dbZV09eGEoZCxiLGMsZSxhLGYsaCl9KTtyZXR1cm4gZ31mdW5jdGlvbiBZYShhLGIpe3JldHVybiBaYShhLFxuYixDKX1mdW5jdGlvbiB5YShhLGIsYyl7aWYobnVsbCE9YSl7YT16KGEpO2MhPT1wJiZjIGluIGEmJihiPVtjXSk7Yz0wO2Zvcih2YXIgZT1iLmxlbmd0aDtudWxsIT1hJiZjPGU7KWE9eihhKVtiW2MrK11dO3JldHVybiBjJiZjPT1lP2E6cH19ZnVuY3Rpb24gaWEoYSxiLGMsZSxkLGYpe2lmKGE9PT1iKWE9dHJ1ZTtlbHNlIGlmKG51bGw9PWF8fG51bGw9PWJ8fCF2KGEpJiYhQihiKSlhPWEhPT1hJiZiIT09YjtlbHNlIGE6e3ZhciBoPWlhLGc9eShhKSxsPXkoYiksbT1GLGs9RjtnfHwobT1BLmNhbGwoYSksbT09ST9tPXQ6bSE9dCYmKGc9amEoYSkpKTtsfHwoaz1BLmNhbGwoYiksaz09ST9rPXQ6ayE9dCYmamEoYikpO3ZhciBwPW09PXQmJiFRKGEpLGw9az09dCYmIVEoYiksaz1tPT1rO2lmKCFrfHxnfHxwKXtpZighZSYmKG09cCYmdS5jYWxsKGEsXCJfX3dyYXBwZWRfX1wiKSxsPWwmJnUuY2FsbChiLFwiX193cmFwcGVkX19cIiksbXx8bCkpe2E9aChtP2EudmFsdWUoKTphLGw/Yi52YWx1ZSgpOlxuYixjLGUsZCxmKTticmVhayBhfWlmKGspe2R8fChkPVtdKTtmfHwoZj1bXSk7Zm9yKG09ZC5sZW5ndGg7bS0tOylpZihkW21dPT1hKXthPWZbbV09PWI7YnJlYWsgYX1kLnB1c2goYSk7Zi5wdXNoKGIpO2E9KGc/JGE6YWIpKGEsYixoLGMsZSxkLGYpO2QucG9wKCk7Zi5wb3AoKX1lbHNlIGE9ZmFsc2V9ZWxzZSBhPWJiKGEsYixtKX1yZXR1cm4gYX1mdW5jdGlvbiBjYihhLGIpe3ZhciBjPWIubGVuZ3RoLGU9YztpZihudWxsPT1hKXJldHVybiFlO2ZvcihhPXooYSk7Yy0tOyl7dmFyIGQ9YltjXTtpZihkWzJdP2RbMV0hPT1hW2RbMF1dOiEoZFswXWluIGEpKXJldHVybiBmYWxzZX1mb3IoOysrYzxlOyl7dmFyIGQ9YltjXSxmPWRbMF0saD1hW2ZdLGc9ZFsxXTtpZihkWzJdKXtpZihoPT09cCYmIShmIGluIGEpKXJldHVybiBmYWxzZX1lbHNlIGlmKGQ9cCxkPT09cD8haWEoZyxoLHZvaWQgMCx0cnVlKTohZClyZXR1cm4gZmFsc2V9cmV0dXJuIHRydWV9ZnVuY3Rpb24gdmEoYSl7dmFyIGI9ZGIoYSk7aWYoMT09Yi5sZW5ndGgmJlxuYlswXVsyXSl7dmFyIGM9YlswXVswXSxlPWJbMF1bMV07cmV0dXJuIGZ1bmN0aW9uKGEpe2lmKG51bGw9PWEpcmV0dXJuIGZhbHNlO2E9eihhKTtyZXR1cm4gYVtjXT09PWUmJihlIT09cHx8YyBpbiBhKX19cmV0dXJuIGZ1bmN0aW9uKGEpe3JldHVybiBjYihhLGIpfX1mdW5jdGlvbiBVYShhLGIpe3ZhciBjPXkoYSksZT16YShhKSYmYj09PWImJiF2KGIpLGQ9YStcIlwiO2E9QWEoYSk7cmV0dXJuIGZ1bmN0aW9uKGYpe2lmKG51bGw9PWYpcmV0dXJuIGZhbHNlO3ZhciBoPWQ7Zj16KGYpO2lmKCEoIWMmJmV8fGggaW4gZikpe2lmKDEhPWEubGVuZ3RoKXt2YXIgaD1hLGc9MCxsPS0xLG09LTEsaz1oLmxlbmd0aCxnPW51bGw9PWc/MDorZ3x8MDswPmcmJihnPS1nPms/MDprK2cpO2w9bD09PXB8fGw+az9rOitsfHwwOzA+bCYmKGwrPWspO2s9Zz5sPzA6bC1nPj4+MDtnPj4+PTA7Zm9yKGw9QXJyYXkoayk7KyttPGs7KWxbbV09aFttK2ddO2Y9eWEoZixsKX1pZihudWxsPT1mKXJldHVybiBmYWxzZTtoPUJhKGEpO1xuZj16KGYpfXJldHVybiBmW2hdPT09Yj9iIT09cHx8aCBpbiBmOmlhKGIsZltoXSxwLHRydWUpfX1mdW5jdGlvbiBDYShhKXtyZXR1cm4gZnVuY3Rpb24oYil7cmV0dXJuIG51bGw9PWI/cDp6KGIpW2FdfX1mdW5jdGlvbiBlYihhKXt2YXIgYj1hK1wiXCI7YT1BYShhKTtyZXR1cm4gZnVuY3Rpb24oYyl7cmV0dXJuIHlhKGMsYSxiKX19ZnVuY3Rpb24gdWEoYSxiLGMpe2lmKHR5cGVvZiBhIT1cImZ1bmN0aW9uXCIpcmV0dXJuIGhhO2lmKGI9PT1wKXJldHVybiBhO3N3aXRjaChjKXtjYXNlIDE6cmV0dXJuIGZ1bmN0aW9uKGMpe3JldHVybiBhLmNhbGwoYixjKX07Y2FzZSAzOnJldHVybiBmdW5jdGlvbihjLGQsZil7cmV0dXJuIGEuY2FsbChiLGMsZCxmKX07Y2FzZSA0OnJldHVybiBmdW5jdGlvbihjLGQsZixoKXtyZXR1cm4gYS5jYWxsKGIsYyxkLGYsaCl9O2Nhc2UgNTpyZXR1cm4gZnVuY3Rpb24oYyxkLGYsaCxnKXtyZXR1cm4gYS5jYWxsKGIsYyxkLGYsaCxnKX19cmV0dXJuIGZ1bmN0aW9uKCl7cmV0dXJuIGEuYXBwbHkoYixcbmFyZ3VtZW50cyl9fWZ1bmN0aW9uIERhKGEpe3ZhciBiPW5ldyBmYihhLmJ5dGVMZW5ndGgpOyhuZXcga2EoYikpLnNldChuZXcga2EoYSkpO3JldHVybiBifWZ1bmN0aW9uICRhKGEsYixjLGUsZCxmLGgpe3ZhciBnPS0xLGw9YS5sZW5ndGgsbT1iLmxlbmd0aDtpZihsIT1tJiYhKGQmJm0+bCkpcmV0dXJuIGZhbHNlO2Zvcig7KytnPGw7KXt2YXIgaz1hW2ddLG09YltnXSxuPWU/ZShkP206ayxkP2s6bSxnKTpwO2lmKG4hPT1wKXtpZihuKWNvbnRpbnVlO3JldHVybiBmYWxzZX1pZihkKXtpZighVGEoYixmdW5jdGlvbihhKXtyZXR1cm4gaz09PWF8fGMoayxhLGUsZCxmLGgpfSkpcmV0dXJuIGZhbHNlfWVsc2UgaWYoayE9PW0mJiFjKGssbSxlLGQsZixoKSlyZXR1cm4gZmFsc2V9cmV0dXJuIHRydWV9ZnVuY3Rpb24gYmIoYSxiLGMpe3N3aXRjaChjKXtjYXNlIEo6Y2FzZSBLOnJldHVybithPT0rYjtjYXNlIEw6cmV0dXJuIGEubmFtZT09Yi5uYW1lJiZhLm1lc3NhZ2U9PWIubWVzc2FnZTtjYXNlIE06cmV0dXJuIGEhPVxuK2E/YiE9K2I6YT09K2I7Y2FzZSBOOmNhc2UgRDpyZXR1cm4gYT09YitcIlwifXJldHVybiBmYWxzZX1mdW5jdGlvbiBhYihhLGIsYyxlLGQsZixoKXt2YXIgZz1DKGEpLGw9Zy5sZW5ndGgsbT1DKGIpLmxlbmd0aDtpZihsIT1tJiYhZClyZXR1cm4gZmFsc2U7Zm9yKG09bDttLS07KXt2YXIgaz1nW21dO2lmKCEoZD9rIGluIGI6dS5jYWxsKGIsaykpKXJldHVybiBmYWxzZX1mb3IodmFyIG49ZDsrK208bDspe3ZhciBrPWdbbV0scT1hW2tdLHI9YltrXSxzPWU/ZShkP3I6cSxkP3E6cixrKTpwO2lmKHM9PT1wPyFjKHEscixlLGQsZixoKTohcylyZXR1cm4gZmFsc2U7bnx8KG49XCJjb25zdHJ1Y3RvclwiPT1rKX1yZXR1cm4gbnx8KGM9YS5jb25zdHJ1Y3RvcixlPWIuY29uc3RydWN0b3IsIShjIT1lJiZcImNvbnN0cnVjdG9yXCJpbiBhJiZcImNvbnN0cnVjdG9yXCJpbiBiKXx8dHlwZW9mIGM9PVwiZnVuY3Rpb25cIiYmYyBpbnN0YW5jZW9mIGMmJnR5cGVvZiBlPT1cImZ1bmN0aW9uXCImJmUgaW5zdGFuY2VvZiBlKT90cnVlOmZhbHNlfWZ1bmN0aW9uIGRiKGEpe2E9XG5FYShhKTtmb3IodmFyIGI9YS5sZW5ndGg7Yi0tOyl7dmFyIGM9YVtiXVsxXTthW2JdWzJdPWM9PT1jJiYhdihjKX1yZXR1cm4gYX1mdW5jdGlvbiBGYShhLGIpe3ZhciBjPW51bGw9PWE/cDphW2JdO3JldHVybiBHYShjKT9jOnB9ZnVuY3Rpb24gVmEoYSl7dmFyIGI9YS5sZW5ndGgsYz1uZXcgYS5jb25zdHJ1Y3RvcihiKTtiJiZcInN0cmluZ1wiPT10eXBlb2YgYVswXSYmdS5jYWxsKGEsXCJpbmRleFwiKSYmKGMuaW5kZXg9YS5pbmRleCxjLmlucHV0PWEuaW5wdXQpO3JldHVybiBjfWZ1bmN0aW9uIFdhKGEpe2E9YS5jb25zdHJ1Y3Rvcjt0eXBlb2YgYT09XCJmdW5jdGlvblwiJiZhIGluc3RhbmNlb2YgYXx8KGE9T2JqZWN0KTtyZXR1cm4gbmV3IGF9ZnVuY3Rpb24gWGEoYSxiLGMpe3ZhciBlPWEuY29uc3RydWN0b3I7c3dpdGNoKGIpe2Nhc2UgbGE6cmV0dXJuIERhKGEpO2Nhc2UgSjpjYXNlIEs6cmV0dXJuIG5ldyBlKCthKTtjYXNlIFI6Y2FzZSBTOmNhc2UgVDpjYXNlIFU6Y2FzZSBWOmNhc2UgVzpjYXNlIFg6Y2FzZSBZOmNhc2UgWjpyZXR1cm4gZSBpbnN0YW5jZW9mXG5lJiYoZT13W2JdKSxiPWEuYnVmZmVyLG5ldyBlKGM/RGEoYik6YixhLmJ5dGVPZmZzZXQsYS5sZW5ndGgpO2Nhc2UgTTpjYXNlIEQ6cmV0dXJuIG5ldyBlKGEpO2Nhc2UgTjp2YXIgZD1uZXcgZShhLnNvdXJjZSxnYi5leGVjKGEpKTtkLmxhc3RJbmRleD1hLmxhc3RJbmRleH1yZXR1cm4gZH1mdW5jdGlvbiAkKGEsYil7YT10eXBlb2YgYT09XCJudW1iZXJcInx8aGIudGVzdChhKT8rYTotMTtiPW51bGw9PWI/SGE6YjtyZXR1cm4tMTxhJiYwPT1hJTEmJmE8Yn1mdW5jdGlvbiBJYShhLGIsYyl7aWYoIXYoYykpcmV0dXJuIGZhbHNlO3ZhciBlPXR5cGVvZiBiO3JldHVybihcIm51bWJlclwiPT1lP251bGwhPWMmJkUobWEoYykpJiYkKGIsYy5sZW5ndGgpOlwic3RyaW5nXCI9PWUmJmIgaW4gYyk/KGI9Y1tiXSxhPT09YT9hPT09YjpiIT09Yik6ZmFsc2V9ZnVuY3Rpb24gemEoYSl7dmFyIGI9dHlwZW9mIGE7cmV0dXJuXCJzdHJpbmdcIj09YiYmaWIudGVzdChhKXx8XCJudW1iZXJcIj09Yj90cnVlOnkoYSk/ZmFsc2U6IWpiLnRlc3QoYSl8fFxuITF9ZnVuY3Rpb24gRShhKXtyZXR1cm4gdHlwZW9mIGE9PVwibnVtYmVyXCImJi0xPGEmJjA9PWElMSYmYTw9SGF9ZnVuY3Rpb24gSmEoYSl7Zm9yKHZhciBiPUthKGEpLGM9Yi5sZW5ndGgsZT1jJiZhLmxlbmd0aCxkPSEhZSYmRShlKSYmKHkoYSl8fG5hKGEpfHxhYShhKSksZj0tMSxoPVtdOysrZjxjOyl7dmFyIGc9YltmXTsoZCYmJChnLGUpfHx1LmNhbGwoYSxnKSkmJmgucHVzaChnKX1yZXR1cm4gaH1mdW5jdGlvbiB6KGEpe2lmKG4uc3VwcG9ydC51bmluZGV4ZWRDaGFycyYmYWEoYSkpe2Zvcih2YXIgYj0tMSxjPWEubGVuZ3RoLGU9T2JqZWN0KGEpOysrYjxjOyllW2JdPWEuY2hhckF0KGIpO3JldHVybiBlfXJldHVybiB2KGEpP2E6T2JqZWN0KGEpfWZ1bmN0aW9uIEFhKGEpe2lmKHkoYSkpcmV0dXJuIGE7dmFyIGI9W107KG51bGw9PWE/XCJcIjphK1wiXCIpLnJlcGxhY2Uoa2IsZnVuY3Rpb24oYSxlLGQsZil7Yi5wdXNoKGQ/Zi5yZXBsYWNlKGxiLFwiJDFcIik6ZXx8YSl9KTtyZXR1cm4gYn1cbmZ1bmN0aW9uIEJhKGEpe3ZhciBiPWE/YS5sZW5ndGg6MDtyZXR1cm4gYj9hW2ItMV06cH1mdW5jdGlvbiBvYShhLGIpe2lmKHR5cGVvZiBhIT1cImZ1bmN0aW9uXCIpdGhyb3cgbmV3IFR5cGVFcnJvcihtYik7Yj1MYShiPT09cD9hLmxlbmd0aC0xOitifHwwLDApO3JldHVybiBmdW5jdGlvbigpe2Zvcih2YXIgYz1hcmd1bWVudHMsZT0tMSxkPUxhKGMubGVuZ3RoLWIsMCksZj1BcnJheShkKTsrK2U8ZDspZltlXT1jW2IrZV07c3dpdGNoKGIpe2Nhc2UgMDpyZXR1cm4gYS5jYWxsKHRoaXMsZik7Y2FzZSAxOnJldHVybiBhLmNhbGwodGhpcyxjWzBdLGYpO2Nhc2UgMjpyZXR1cm4gYS5jYWxsKHRoaXMsY1swXSxjWzFdLGYpfWQ9QXJyYXkoYisxKTtmb3IoZT0tMTsrK2U8YjspZFtlXT1jW2VdO2RbYl09ZjtyZXR1cm4gYS5hcHBseSh0aGlzLGQpfX1mdW5jdGlvbiBuYShhKXtyZXR1cm4gQihhKSYmbnVsbCE9YSYmRShtYShhKSkmJnUuY2FsbChhLFwiY2FsbGVlXCIpJiYhYmEuY2FsbChhLFwiY2FsbGVlXCIpfVxuZnVuY3Rpb24gY2EoYSl7cmV0dXJuIHYoYSkmJkEuY2FsbChhKT09SH1mdW5jdGlvbiB2KGEpe3ZhciBiPXR5cGVvZiBhO3JldHVybiEhYSYmKFwib2JqZWN0XCI9PWJ8fFwiZnVuY3Rpb25cIj09Yil9ZnVuY3Rpb24gR2EoYSl7cmV0dXJuIG51bGw9PWE/ZmFsc2U6Y2EoYSk/TWEudGVzdChOYS5jYWxsKGEpKTpCKGEpJiYoUShhKT9NYTpuYikudGVzdChhKX1mdW5jdGlvbiBhYShhKXtyZXR1cm4gdHlwZW9mIGE9PVwic3RyaW5nXCJ8fEIoYSkmJkEuY2FsbChhKT09RH1mdW5jdGlvbiBqYShhKXtyZXR1cm4gQihhKSYmRShhLmxlbmd0aCkmJiEhcltBLmNhbGwoYSldfWZ1bmN0aW9uIEthKGEpe2lmKG51bGw9PWEpcmV0dXJuW107dihhKXx8KGE9T2JqZWN0KGEpKTtmb3IodmFyIGI9YS5sZW5ndGgsYz1uLnN1cHBvcnQsYj1iJiZFKGIpJiYoeShhKXx8bmEoYSl8fGFhKGEpKSYmYnx8MCxlPWEuY29uc3RydWN0b3IsZD0tMSxlPWNhKGUpJiZlLnByb3RvdHlwZXx8RyxmPWU9PT1hLGg9QXJyYXkoYiksZz1cbjA8YixsPWMuZW51bUVycm9yUHJvcHMmJihhPT09ZGF8fGEgaW5zdGFuY2VvZiBFcnJvciksbT1jLmVudW1Qcm90b3R5cGVzJiZjYShhKTsrK2Q8YjspaFtkXT1kK1wiXCI7Zm9yKHZhciBrIGluIGEpbSYmXCJwcm90b3R5cGVcIj09a3x8bCYmKFwibWVzc2FnZVwiPT1rfHxcIm5hbWVcIj09ayl8fGcmJiQoayxiKXx8XCJjb25zdHJ1Y3RvclwiPT1rJiYoZnx8IXUuY2FsbChhLGspKXx8aC5wdXNoKGspO2lmKGMubm9uRW51bVNoYWRvd3MmJmEhPT1HKWZvcihiPWE9PT1vYj9EOmE9PT1kYT9MOkEuY2FsbChhKSxjPXNbYl18fHNbdF0sYj09dCYmKGU9RyksYj1wYS5sZW5ndGg7Yi0tOylrPXBhW2JdLGQ9Y1trXSxmJiZkfHwoZD8hdS5jYWxsKGEsayk6YVtrXT09PWVba10pfHxoLnB1c2goayk7cmV0dXJuIGh9ZnVuY3Rpb24gRWEoYSl7YT16KGEpO2Zvcih2YXIgYj0tMSxjPUMoYSksZT1jLmxlbmd0aCxkPUFycmF5KGUpOysrYjxlOyl7dmFyIGY9Y1tiXTtkW2JdPVtmLGFbZl1dfXJldHVybiBkfWZ1bmN0aW9uIGVhKGEsXG5iLGMpe2MmJklhKGEsYixjKSYmKGI9cCk7cmV0dXJuIEIoYSk/T2EoYSk6dGEoYSxiKX1mdW5jdGlvbiBoYShhKXtyZXR1cm4gYX1mdW5jdGlvbiBPYShhKXtyZXR1cm4gdmEoeGEoYSx0cnVlKSl9ZnVuY3Rpb24gd2EoYSl7cmV0dXJuIHphKGEpP0NhKGEpOmViKGEpfXZhciBwLG1iPVwiRXhwZWN0ZWQgYSBmdW5jdGlvblwiLEk9XCJbb2JqZWN0IEFyZ3VtZW50c11cIixGPVwiW29iamVjdCBBcnJheV1cIixKPVwiW29iamVjdCBCb29sZWFuXVwiLEs9XCJbb2JqZWN0IERhdGVdXCIsTD1cIltvYmplY3QgRXJyb3JdXCIsSD1cIltvYmplY3QgRnVuY3Rpb25dXCIsTT1cIltvYmplY3QgTnVtYmVyXVwiLHQ9XCJbb2JqZWN0IE9iamVjdF1cIixOPVwiW29iamVjdCBSZWdFeHBdXCIsRD1cIltvYmplY3QgU3RyaW5nXVwiLGxhPVwiW29iamVjdCBBcnJheUJ1ZmZlcl1cIixSPVwiW29iamVjdCBGbG9hdDMyQXJyYXldXCIsUz1cIltvYmplY3QgRmxvYXQ2NEFycmF5XVwiLFQ9XCJbb2JqZWN0IEludDhBcnJheV1cIixVPVwiW29iamVjdCBJbnQxNkFycmF5XVwiLFxuVj1cIltvYmplY3QgSW50MzJBcnJheV1cIixXPVwiW29iamVjdCBVaW50OEFycmF5XVwiLFg9XCJbb2JqZWN0IFVpbnQ4Q2xhbXBlZEFycmF5XVwiLFk9XCJbb2JqZWN0IFVpbnQxNkFycmF5XVwiLFo9XCJbb2JqZWN0IFVpbnQzMkFycmF5XVwiLGpiPS9cXC58XFxbKD86W15bXFxdXSp8KFtcIiddKSg/Oig/IVxcMSlbXlxcblxcXFxdfFxcXFwuKSo/XFwxKVxcXS8saWI9L15cXHcqJC8sa2I9L1teLltcXF1dK3xcXFsoPzooLT9cXGQrKD86XFwuXFxkKyk/KXwoW1wiJ10pKCg/Oig/IVxcMilbXlxcblxcXFxdfFxcXFwuKSo/KVxcMilcXF0vZyxsYj0vXFxcXChcXFxcKT8vZyxnYj0vXFx3KiQvLG5iPS9eXFxbb2JqZWN0IC4rP0NvbnN0cnVjdG9yXFxdJC8saGI9L15cXGQrJC8scGE9XCJjb25zdHJ1Y3RvciBoYXNPd25Qcm9wZXJ0eSBpc1Byb3RvdHlwZU9mIHByb3BlcnR5SXNFbnVtZXJhYmxlIHRvTG9jYWxlU3RyaW5nIHRvU3RyaW5nIHZhbHVlT2ZcIi5zcGxpdChcIiBcIikscj17fTtyW1JdPXJbU109cltUXT1yW1VdPXJbVl09cltXXT1yW1hdPXJbWV09cltaXT10cnVlO1xucltJXT1yW0ZdPXJbbGFdPXJbSl09cltLXT1yW0xdPXJbSF09cltcIltvYmplY3QgTWFwXVwiXT1yW01dPXJbdF09cltOXT1yW1wiW29iamVjdCBTZXRdXCJdPXJbRF09cltcIltvYmplY3QgV2Vha01hcF1cIl09ZmFsc2U7dmFyIHE9e307cVtJXT1xW0ZdPXFbbGFdPXFbSl09cVtLXT1xW1JdPXFbU109cVtUXT1xW1VdPXFbVl09cVtNXT1xW3RdPXFbTl09cVtEXT1xW1ddPXFbWF09cVtZXT1xW1pdPXRydWU7cVtMXT1xW0hdPXFbXCJbb2JqZWN0IE1hcF1cIl09cVtcIltvYmplY3QgU2V0XVwiXT1xW1wiW29iamVjdCBXZWFrTWFwXVwiXT1mYWxzZTt2YXIgZmE9e1wiZnVuY3Rpb25cIjp0cnVlLG9iamVjdDp0cnVlfSxnYT1mYVt0eXBlb2YgZXhwb3J0c10mJmV4cG9ydHMmJiFleHBvcnRzLm5vZGVUeXBlJiZleHBvcnRzLE89ZmFbdHlwZW9mIG1vZHVsZV0mJm1vZHVsZSYmIW1vZHVsZS5ub2RlVHlwZSYmbW9kdWxlLHBiPWZhW3R5cGVvZiBzZWxmXSYmc2VsZiYmc2VsZi5PYmplY3QmJnNlbGYsUGE9ZmFbdHlwZW9mIHdpbmRvd10mJlxud2luZG93JiZ3aW5kb3cuT2JqZWN0JiZ3aW5kb3cscWI9TyYmTy5leHBvcnRzPT09Z2EmJmdhLHg9Z2EmJk8mJnR5cGVvZiBnbG9iYWw9PVwib2JqZWN0XCImJmdsb2JhbCYmZ2xvYmFsLk9iamVjdCYmZ2xvYmFsfHxQYSE9PSh0aGlzJiZ0aGlzLndpbmRvdykmJlBhfHxwYnx8dGhpcyxRPWZ1bmN0aW9uKCl7dHJ5e09iamVjdCh7dG9TdHJpbmc6MH0rXCJcIil9Y2F0Y2goYSl7cmV0dXJuIGZ1bmN0aW9uKCl7cmV0dXJuIGZhbHNlfX1yZXR1cm4gZnVuY3Rpb24oYSl7cmV0dXJuIHR5cGVvZiBhLnRvU3RyaW5nIT1cImZ1bmN0aW9uXCImJnR5cGVvZihhK1wiXCIpPT1cInN0cmluZ1wifX0oKSxyYj1BcnJheS5wcm90b3R5cGUsZGE9RXJyb3IucHJvdG90eXBlLEc9T2JqZWN0LnByb3RvdHlwZSxvYj1TdHJpbmcucHJvdG90eXBlLE5hPUZ1bmN0aW9uLnByb3RvdHlwZS50b1N0cmluZyx1PUcuaGFzT3duUHJvcGVydHksQT1HLnRvU3RyaW5nLE1hPVJlZ0V4cChcIl5cIitOYS5jYWxsKHUpLnJlcGxhY2UoL1tcXFxcXiQuKis/KClbXFxde318XS9nLFxuXCJcXFxcJCZcIikucmVwbGFjZSgvaGFzT3duUHJvcGVydHl8KGZ1bmN0aW9uKS4qPyg/PVxcXFxcXCgpfCBmb3IgLis/KD89XFxcXFxcXSkvZyxcIiQxLio/XCIpK1wiJFwiKSxmYj14LkFycmF5QnVmZmVyLGJhPUcucHJvcGVydHlJc0VudW1lcmFibGUsUWE9cmIuc3BsaWNlLGthPXguVWludDhBcnJheSxzYj1GYShBcnJheSxcImlzQXJyYXlcIiksUmE9RmEoT2JqZWN0LFwia2V5c1wiKSxMYT1NYXRoLm1heCxIYT05MDA3MTk5MjU0NzQwOTkxLHc9e307d1tSXT14LkZsb2F0MzJBcnJheTt3W1NdPXguRmxvYXQ2NEFycmF5O3dbVF09eC5JbnQ4QXJyYXk7d1tVXT14LkludDE2QXJyYXk7d1tWXT14LkludDMyQXJyYXk7d1tXXT1rYTt3W1hdPXguVWludDhDbGFtcGVkQXJyYXk7d1tZXT14LlVpbnQxNkFycmF5O3dbWl09eC5VaW50MzJBcnJheTt2YXIgcz17fTtzW0ZdPXNbS109c1tNXT17Y29uc3RydWN0b3I6dHJ1ZSx0b0xvY2FsZVN0cmluZzp0cnVlLHRvU3RyaW5nOnRydWUsdmFsdWVPZjp0cnVlfTtzW0pdPXNbRF09e2NvbnN0cnVjdG9yOnRydWUsXG50b1N0cmluZzp0cnVlLHZhbHVlT2Y6dHJ1ZX07c1tMXT1zW0hdPXNbTl09e2NvbnN0cnVjdG9yOnRydWUsdG9TdHJpbmc6dHJ1ZX07c1t0XT17Y29uc3RydWN0b3I6dHJ1ZX07cmEocGEsZnVuY3Rpb24oYSl7Zm9yKHZhciBiIGluIHMpaWYodS5jYWxsKHMsYikpe3ZhciBjPXNbYl07Y1thXT11LmNhbGwoYyxhKX19KTt2YXIgUD1uLnN1cHBvcnQ9e307KGZ1bmN0aW9uKGEpe2Z1bmN0aW9uIGIoKXt0aGlzLng9YX12YXIgYz17MDphLGxlbmd0aDphfSxlPVtdO2IucHJvdG90eXBlPXt2YWx1ZU9mOmEseTphfTtmb3IodmFyIGQgaW4gbmV3IGIpZS5wdXNoKGQpO1AuZW51bUVycm9yUHJvcHM9YmEuY2FsbChkYSxcIm1lc3NhZ2VcIil8fGJhLmNhbGwoZGEsXCJuYW1lXCIpO1AuZW51bVByb3RvdHlwZXM9YmEuY2FsbChiLFwicHJvdG90eXBlXCIpO1Aubm9uRW51bVNoYWRvd3M9IS92YWx1ZU9mLy50ZXN0KGUpO1Auc3BsaWNlT2JqZWN0cz0oUWEuY2FsbChjLDAsMSksIWNbMF0pO1AudW5pbmRleGVkQ2hhcnM9XCJ4eFwiIT1cInhcIlswXStcbk9iamVjdChcInhcIilbMF19KSgxLDApO3ZhciBaYT1mdW5jdGlvbihhKXtyZXR1cm4gZnVuY3Rpb24oYixjLGUpe3ZhciBkPXooYik7ZT1lKGIpO2Zvcih2YXIgZj1lLmxlbmd0aCxoPWE/ZjotMTthP2gtLTorK2g8Zjspe3ZhciBnPWVbaF07aWYoZmFsc2U9PT1jKGRbZ10sZyxkKSlicmVha31yZXR1cm4gYn19KCksbWE9Q2EoXCJsZW5ndGhcIikseT1zYnx8ZnVuY3Rpb24oYSl7cmV0dXJuIEIoYSkmJkUoYS5sZW5ndGgpJiZBLmNhbGwoYSk9PUZ9LHFhPWZ1bmN0aW9uKGEpe3JldHVybiBvYShmdW5jdGlvbihiLGMpe3ZhciBlPS0xLGQ9bnVsbD09Yj8wOmMubGVuZ3RoLGY9MjxkP2NbZC0yXTpwLGg9MjxkP2NbMl06cCxnPTE8ZD9jW2QtMV06cDt0eXBlb2YgZj09XCJmdW5jdGlvblwiPyhmPXVhKGYsZyw1KSxkLT0yKTooZj10eXBlb2YgZz09XCJmdW5jdGlvblwiP2c6cCxkLT1mPzE6MCk7aCYmSWEoY1swXSxjWzFdLGgpJiYoZj0zPmQ/cDpmLGQ9MSk7Zm9yKDsrK2U8ZDspKGg9Y1tlXSkmJmEoYixoLFxuZik7cmV0dXJuIGJ9KX0oZnVuY3Rpb24oYSxiLGMpe2lmKGMpZm9yKHZhciBlPS0xLGQ9QyhiKSxmPWQubGVuZ3RoOysrZTxmOyl7dmFyIGg9ZFtlXSxnPWFbaF0sbD1jKGcsYltoXSxoLGEsYik7KGw9PT1sP2w9PT1nOmchPT1nKSYmKGchPT1wfHxoIGluIGEpfHwoYVtoXT1sKX1lbHNlIGE9c2EoYSxiKTtyZXR1cm4gYX0pLHRiPWZ1bmN0aW9uKGEsYil7cmV0dXJuIG9hKGZ1bmN0aW9uKGMpe3ZhciBlPWNbMF07aWYobnVsbD09ZSlyZXR1cm4gZTtjLnB1c2goYik7cmV0dXJuIGEuYXBwbHkocCxjKX0pfShxYSxmdW5jdGlvbihhLGIpe3JldHVybiBhPT09cD9iOmF9KSxDPVJhP2Z1bmN0aW9uKGEpe3ZhciBiPW51bGw9PWE/cDphLmNvbnN0cnVjdG9yO3JldHVybiB0eXBlb2YgYj09XCJmdW5jdGlvblwiJiZiLnByb3RvdHlwZT09PWF8fCh0eXBlb2YgYT09XCJmdW5jdGlvblwiP24uc3VwcG9ydC5lbnVtUHJvdG90eXBlczpudWxsIT1hJiZFKG1hKGEpKSk/SmEoYSk6dihhKT9SYShhKTpbXX06XG5KYTtuLmFzc2lnbj1xYTtuLmNhbGxiYWNrPWVhO24uZGVmYXVsdHM9dGI7bi5rZXlzPUM7bi5rZXlzSW49S2E7bi5tYXRjaGVzPU9hO24ucGFpcnM9RWE7bi5wcm9wZXJ0eT13YTtuLnJlbW92ZT1mdW5jdGlvbihhLGIsYyl7dmFyIGU9W107aWYoIWF8fCFhLmxlbmd0aClyZXR1cm4gZTt2YXIgZD0tMSxmPVtdLGg9YS5sZW5ndGgsZz1uLmNhbGxiYWNrfHxlYSxnPWc9PT1lYT90YTpnO2ZvcihiPWcoYixjLDMpOysrZDxoOyljPWFbZF0sYihjLGQsYSkmJihlLnB1c2goYyksZi5wdXNoKGQpKTtmb3IoYj1hP2YubGVuZ3RoOjA7Yi0tOylpZihkPWZbYl0sZCE9bCYmJChkKSl7dmFyIGw9ZDtRYS5jYWxsKGEsZCwxKX1yZXR1cm4gZX07bi5yZXN0UGFyYW09b2E7bi5leHRlbmQ9cWE7bi5pdGVyYXRlZT1lYTtuLmlkZW50aXR5PWhhO24uaXNBcmd1bWVudHM9bmE7bi5pc0FycmF5PXk7bi5pc0Z1bmN0aW9uPWNhO24uaXNOYXRpdmU9R2E7bi5pc09iamVjdD12O24uaXNTdHJpbmc9YWE7bi5pc1R5cGVkQXJyYXk9XG5qYTtuLmxhc3Q9QmE7bi5WRVJTSU9OPVwiMy4xMC4wXCI7Z2EmJk8mJnFiJiYoKE8uZXhwb3J0cz1uKS5fPW4pfS5jYWxsKHRoaXMpKTsiXX0=
