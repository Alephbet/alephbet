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
      return window.jQuery.ajax({
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
      var ref;
      if ((ref = window.jQuery) != null ? ref.ajax : void 0) {
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvbm9kZS11dWlkL3V1aWQuanMiLCJub2RlX21vZHVsZXMvc3RvcmUvc3RvcmUuanMiLCIvaG9tZS95b2F2L2NvZGUvYWxlcGhiZXQvc3JjL2FkYXB0ZXJzLmNvZmZlZSIsIi9ob21lL3lvYXYvY29kZS9hbGVwaGJldC9zcmMvYWxlcGhiZXQuY29mZmVlIiwiL2hvbWUveW9hdi9jb2RlL2FsZXBoYmV0L3NyYy9vcHRpb25zLmNvZmZlZSIsIi9ob21lL3lvYXYvY29kZS9hbGVwaGJldC9zcmMvc3RvcmFnZS5jb2ZmZWUiLCIvaG9tZS95b2F2L2NvZGUvYWxlcGhiZXQvc3JjL3V0aWxzLmNvZmZlZSIsInZlbmRvci9sb2Rhc2guY3VzdG9tLm1pbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDclBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQy9MQSxJQUFBLHdCQUFBO0VBQUE7O0FBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztBQUNSLE9BQUEs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QUFPLENBQUMsS0FBaEM7YUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLE9BQVosRUFBQTs7RUFESTs7RUFFTixLQUFDLENBQUEsSUFBRCxHQUFPLElBQUksQ0FBQzs7Ozs7O0FBRWQsTUFBTSxDQUFDLE9BQVAsR0FBaUI7Ozs7O0FDYmpCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gICAgIHV1aWQuanNcbi8vXG4vLyAgICAgQ29weXJpZ2h0IChjKSAyMDEwLTIwMTIgUm9iZXJ0IEtpZWZmZXJcbi8vICAgICBNSVQgTGljZW5zZSAtIGh0dHA6Ly9vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcblxuKGZ1bmN0aW9uKCkge1xuICB2YXIgX2dsb2JhbCA9IHRoaXM7XG5cbiAgLy8gVW5pcXVlIElEIGNyZWF0aW9uIHJlcXVpcmVzIGEgaGlnaCBxdWFsaXR5IHJhbmRvbSAjIGdlbmVyYXRvci4gIFdlIGZlYXR1cmVcbiAgLy8gZGV0ZWN0IHRvIGRldGVybWluZSB0aGUgYmVzdCBSTkcgc291cmNlLCBub3JtYWxpemluZyB0byBhIGZ1bmN0aW9uIHRoYXRcbiAgLy8gcmV0dXJucyAxMjgtYml0cyBvZiByYW5kb21uZXNzLCBzaW5jZSB0aGF0J3Mgd2hhdCdzIHVzdWFsbHkgcmVxdWlyZWRcbiAgdmFyIF9ybmc7XG5cbiAgLy8gTm9kZS5qcyBjcnlwdG8tYmFzZWQgUk5HIC0gaHR0cDovL25vZGVqcy5vcmcvZG9jcy92MC42LjIvYXBpL2NyeXB0by5odG1sXG4gIC8vXG4gIC8vIE1vZGVyYXRlbHkgZmFzdCwgaGlnaCBxdWFsaXR5XG4gIGlmICh0eXBlb2YoX2dsb2JhbC5yZXF1aXJlKSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgdHJ5IHtcbiAgICAgIHZhciBfcmIgPSBfZ2xvYmFsLnJlcXVpcmUoJ2NyeXB0bycpLnJhbmRvbUJ5dGVzO1xuICAgICAgX3JuZyA9IF9yYiAmJiBmdW5jdGlvbigpIHtyZXR1cm4gX3JiKDE2KTt9O1xuICAgIH0gY2F0Y2goZSkge31cbiAgfVxuXG4gIGlmICghX3JuZyAmJiBfZ2xvYmFsLmNyeXB0byAmJiBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKSB7XG4gICAgLy8gV0hBVFdHIGNyeXB0by1iYXNlZCBSTkcgLSBodHRwOi8vd2lraS53aGF0d2cub3JnL3dpa2kvQ3J5cHRvXG4gICAgLy9cbiAgICAvLyBNb2RlcmF0ZWx5IGZhc3QsIGhpZ2ggcXVhbGl0eVxuICAgIHZhciBfcm5kczggPSBuZXcgVWludDhBcnJheSgxNik7XG4gICAgX3JuZyA9IGZ1bmN0aW9uIHdoYXR3Z1JORygpIHtcbiAgICAgIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMoX3JuZHM4KTtcbiAgICAgIHJldHVybiBfcm5kczg7XG4gICAgfTtcbiAgfVxuXG4gIGlmICghX3JuZykge1xuICAgIC8vIE1hdGgucmFuZG9tKCktYmFzZWQgKFJORylcbiAgICAvL1xuICAgIC8vIElmIGFsbCBlbHNlIGZhaWxzLCB1c2UgTWF0aC5yYW5kb20oKS4gIEl0J3MgZmFzdCwgYnV0IGlzIG9mIHVuc3BlY2lmaWVkXG4gICAgLy8gcXVhbGl0eS5cbiAgICB2YXIgIF9ybmRzID0gbmV3IEFycmF5KDE2KTtcbiAgICBfcm5nID0gZnVuY3Rpb24oKSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgcjsgaSA8IDE2OyBpKyspIHtcbiAgICAgICAgaWYgKChpICYgMHgwMykgPT09IDApIHIgPSBNYXRoLnJhbmRvbSgpICogMHgxMDAwMDAwMDA7XG4gICAgICAgIF9ybmRzW2ldID0gciA+Pj4gKChpICYgMHgwMykgPDwgMykgJiAweGZmO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gX3JuZHM7XG4gICAgfTtcbiAgfVxuXG4gIC8vIEJ1ZmZlciBjbGFzcyB0byB1c2VcbiAgdmFyIEJ1ZmZlckNsYXNzID0gdHlwZW9mKF9nbG9iYWwuQnVmZmVyKSA9PSAnZnVuY3Rpb24nID8gX2dsb2JhbC5CdWZmZXIgOiBBcnJheTtcblxuICAvLyBNYXBzIGZvciBudW1iZXIgPC0+IGhleCBzdHJpbmcgY29udmVyc2lvblxuICB2YXIgX2J5dGVUb0hleCA9IFtdO1xuICB2YXIgX2hleFRvQnl0ZSA9IHt9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IDI1NjsgaSsrKSB7XG4gICAgX2J5dGVUb0hleFtpXSA9IChpICsgMHgxMDApLnRvU3RyaW5nKDE2KS5zdWJzdHIoMSk7XG4gICAgX2hleFRvQnl0ZVtfYnl0ZVRvSGV4W2ldXSA9IGk7XG4gIH1cblxuICAvLyAqKmBwYXJzZSgpYCAtIFBhcnNlIGEgVVVJRCBpbnRvIGl0J3MgY29tcG9uZW50IGJ5dGVzKipcbiAgZnVuY3Rpb24gcGFyc2UocywgYnVmLCBvZmZzZXQpIHtcbiAgICB2YXIgaSA9IChidWYgJiYgb2Zmc2V0KSB8fCAwLCBpaSA9IDA7XG5cbiAgICBidWYgPSBidWYgfHwgW107XG4gICAgcy50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1swLTlhLWZdezJ9L2csIGZ1bmN0aW9uKG9jdCkge1xuICAgICAgaWYgKGlpIDwgMTYpIHsgLy8gRG9uJ3Qgb3ZlcmZsb3chXG4gICAgICAgIGJ1ZltpICsgaWkrK10gPSBfaGV4VG9CeXRlW29jdF07XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBaZXJvIG91dCByZW1haW5pbmcgYnl0ZXMgaWYgc3RyaW5nIHdhcyBzaG9ydFxuICAgIHdoaWxlIChpaSA8IDE2KSB7XG4gICAgICBidWZbaSArIGlpKytdID0gMDtcbiAgICB9XG5cbiAgICByZXR1cm4gYnVmO1xuICB9XG5cbiAgLy8gKipgdW5wYXJzZSgpYCAtIENvbnZlcnQgVVVJRCBieXRlIGFycmF5IChhbGEgcGFyc2UoKSkgaW50byBhIHN0cmluZyoqXG4gIGZ1bmN0aW9uIHVucGFyc2UoYnVmLCBvZmZzZXQpIHtcbiAgICB2YXIgaSA9IG9mZnNldCB8fCAwLCBidGggPSBfYnl0ZVRvSGV4O1xuICAgIHJldHVybiAgYnRoW2J1ZltpKytdXSArIGJ0aFtidWZbaSsrXV0gK1xuICAgICAgICAgICAgYnRoW2J1ZltpKytdXSArIGJ0aFtidWZbaSsrXV0gKyAnLScgK1xuICAgICAgICAgICAgYnRoW2J1ZltpKytdXSArIGJ0aFtidWZbaSsrXV0gKyAnLScgK1xuICAgICAgICAgICAgYnRoW2J1ZltpKytdXSArIGJ0aFtidWZbaSsrXV0gKyAnLScgK1xuICAgICAgICAgICAgYnRoW2J1ZltpKytdXSArIGJ0aFtidWZbaSsrXV0gKyAnLScgK1xuICAgICAgICAgICAgYnRoW2J1ZltpKytdXSArIGJ0aFtidWZbaSsrXV0gK1xuICAgICAgICAgICAgYnRoW2J1ZltpKytdXSArIGJ0aFtidWZbaSsrXV0gK1xuICAgICAgICAgICAgYnRoW2J1ZltpKytdXSArIGJ0aFtidWZbaSsrXV07XG4gIH1cblxuICAvLyAqKmB2MSgpYCAtIEdlbmVyYXRlIHRpbWUtYmFzZWQgVVVJRCoqXG4gIC8vXG4gIC8vIEluc3BpcmVkIGJ5IGh0dHBzOi8vZ2l0aHViLmNvbS9MaW9zSy9VVUlELmpzXG4gIC8vIGFuZCBodHRwOi8vZG9jcy5weXRob24ub3JnL2xpYnJhcnkvdXVpZC5odG1sXG5cbiAgLy8gcmFuZG9tICMncyB3ZSBuZWVkIHRvIGluaXQgbm9kZSBhbmQgY2xvY2tzZXFcbiAgdmFyIF9zZWVkQnl0ZXMgPSBfcm5nKCk7XG5cbiAgLy8gUGVyIDQuNSwgY3JlYXRlIGFuZCA0OC1iaXQgbm9kZSBpZCwgKDQ3IHJhbmRvbSBiaXRzICsgbXVsdGljYXN0IGJpdCA9IDEpXG4gIHZhciBfbm9kZUlkID0gW1xuICAgIF9zZWVkQnl0ZXNbMF0gfCAweDAxLFxuICAgIF9zZWVkQnl0ZXNbMV0sIF9zZWVkQnl0ZXNbMl0sIF9zZWVkQnl0ZXNbM10sIF9zZWVkQnl0ZXNbNF0sIF9zZWVkQnl0ZXNbNV1cbiAgXTtcblxuICAvLyBQZXIgNC4yLjIsIHJhbmRvbWl6ZSAoMTQgYml0KSBjbG9ja3NlcVxuICB2YXIgX2Nsb2Nrc2VxID0gKF9zZWVkQnl0ZXNbNl0gPDwgOCB8IF9zZWVkQnl0ZXNbN10pICYgMHgzZmZmO1xuXG4gIC8vIFByZXZpb3VzIHV1aWQgY3JlYXRpb24gdGltZVxuICB2YXIgX2xhc3RNU2VjcyA9IDAsIF9sYXN0TlNlY3MgPSAwO1xuXG4gIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vYnJvb2ZhL25vZGUtdXVpZCBmb3IgQVBJIGRldGFpbHNcbiAgZnVuY3Rpb24gdjEob3B0aW9ucywgYnVmLCBvZmZzZXQpIHtcbiAgICB2YXIgaSA9IGJ1ZiAmJiBvZmZzZXQgfHwgMDtcbiAgICB2YXIgYiA9IGJ1ZiB8fCBbXTtcblxuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgdmFyIGNsb2Nrc2VxID0gb3B0aW9ucy5jbG9ja3NlcSAhPSBudWxsID8gb3B0aW9ucy5jbG9ja3NlcSA6IF9jbG9ja3NlcTtcblxuICAgIC8vIFVVSUQgdGltZXN0YW1wcyBhcmUgMTAwIG5hbm8tc2Vjb25kIHVuaXRzIHNpbmNlIHRoZSBHcmVnb3JpYW4gZXBvY2gsXG4gICAgLy8gKDE1ODItMTAtMTUgMDA6MDApLiAgSlNOdW1iZXJzIGFyZW4ndCBwcmVjaXNlIGVub3VnaCBmb3IgdGhpcywgc29cbiAgICAvLyB0aW1lIGlzIGhhbmRsZWQgaW50ZXJuYWxseSBhcyAnbXNlY3MnIChpbnRlZ2VyIG1pbGxpc2Vjb25kcykgYW5kICduc2VjcydcbiAgICAvLyAoMTAwLW5hbm9zZWNvbmRzIG9mZnNldCBmcm9tIG1zZWNzKSBzaW5jZSB1bml4IGVwb2NoLCAxOTcwLTAxLTAxIDAwOjAwLlxuICAgIHZhciBtc2VjcyA9IG9wdGlvbnMubXNlY3MgIT0gbnVsbCA/IG9wdGlvbnMubXNlY3MgOiBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuICAgIC8vIFBlciA0LjIuMS4yLCB1c2UgY291bnQgb2YgdXVpZCdzIGdlbmVyYXRlZCBkdXJpbmcgdGhlIGN1cnJlbnQgY2xvY2tcbiAgICAvLyBjeWNsZSB0byBzaW11bGF0ZSBoaWdoZXIgcmVzb2x1dGlvbiBjbG9ja1xuICAgIHZhciBuc2VjcyA9IG9wdGlvbnMubnNlY3MgIT0gbnVsbCA/IG9wdGlvbnMubnNlY3MgOiBfbGFzdE5TZWNzICsgMTtcblxuICAgIC8vIFRpbWUgc2luY2UgbGFzdCB1dWlkIGNyZWF0aW9uIChpbiBtc2VjcylcbiAgICB2YXIgZHQgPSAobXNlY3MgLSBfbGFzdE1TZWNzKSArIChuc2VjcyAtIF9sYXN0TlNlY3MpLzEwMDAwO1xuXG4gICAgLy8gUGVyIDQuMi4xLjIsIEJ1bXAgY2xvY2tzZXEgb24gY2xvY2sgcmVncmVzc2lvblxuICAgIGlmIChkdCA8IDAgJiYgb3B0aW9ucy5jbG9ja3NlcSA9PSBudWxsKSB7XG4gICAgICBjbG9ja3NlcSA9IGNsb2Nrc2VxICsgMSAmIDB4M2ZmZjtcbiAgICB9XG5cbiAgICAvLyBSZXNldCBuc2VjcyBpZiBjbG9jayByZWdyZXNzZXMgKG5ldyBjbG9ja3NlcSkgb3Igd2UndmUgbW92ZWQgb250byBhIG5ld1xuICAgIC8vIHRpbWUgaW50ZXJ2YWxcbiAgICBpZiAoKGR0IDwgMCB8fCBtc2VjcyA+IF9sYXN0TVNlY3MpICYmIG9wdGlvbnMubnNlY3MgPT0gbnVsbCkge1xuICAgICAgbnNlY3MgPSAwO1xuICAgIH1cblxuICAgIC8vIFBlciA0LjIuMS4yIFRocm93IGVycm9yIGlmIHRvbyBtYW55IHV1aWRzIGFyZSByZXF1ZXN0ZWRcbiAgICBpZiAobnNlY3MgPj0gMTAwMDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcigndXVpZC52MSgpOiBDYW5cXCd0IGNyZWF0ZSBtb3JlIHRoYW4gMTBNIHV1aWRzL3NlYycpO1xuICAgIH1cblxuICAgIF9sYXN0TVNlY3MgPSBtc2VjcztcbiAgICBfbGFzdE5TZWNzID0gbnNlY3M7XG4gICAgX2Nsb2Nrc2VxID0gY2xvY2tzZXE7XG5cbiAgICAvLyBQZXIgNC4xLjQgLSBDb252ZXJ0IGZyb20gdW5peCBlcG9jaCB0byBHcmVnb3JpYW4gZXBvY2hcbiAgICBtc2VjcyArPSAxMjIxOTI5MjgwMDAwMDtcblxuICAgIC8vIGB0aW1lX2xvd2BcbiAgICB2YXIgdGwgPSAoKG1zZWNzICYgMHhmZmZmZmZmKSAqIDEwMDAwICsgbnNlY3MpICUgMHgxMDAwMDAwMDA7XG4gICAgYltpKytdID0gdGwgPj4+IDI0ICYgMHhmZjtcbiAgICBiW2krK10gPSB0bCA+Pj4gMTYgJiAweGZmO1xuICAgIGJbaSsrXSA9IHRsID4+PiA4ICYgMHhmZjtcbiAgICBiW2krK10gPSB0bCAmIDB4ZmY7XG5cbiAgICAvLyBgdGltZV9taWRgXG4gICAgdmFyIHRtaCA9IChtc2VjcyAvIDB4MTAwMDAwMDAwICogMTAwMDApICYgMHhmZmZmZmZmO1xuICAgIGJbaSsrXSA9IHRtaCA+Pj4gOCAmIDB4ZmY7XG4gICAgYltpKytdID0gdG1oICYgMHhmZjtcblxuICAgIC8vIGB0aW1lX2hpZ2hfYW5kX3ZlcnNpb25gXG4gICAgYltpKytdID0gdG1oID4+PiAyNCAmIDB4ZiB8IDB4MTA7IC8vIGluY2x1ZGUgdmVyc2lvblxuICAgIGJbaSsrXSA9IHRtaCA+Pj4gMTYgJiAweGZmO1xuXG4gICAgLy8gYGNsb2NrX3NlcV9oaV9hbmRfcmVzZXJ2ZWRgIChQZXIgNC4yLjIgLSBpbmNsdWRlIHZhcmlhbnQpXG4gICAgYltpKytdID0gY2xvY2tzZXEgPj4+IDggfCAweDgwO1xuXG4gICAgLy8gYGNsb2NrX3NlcV9sb3dgXG4gICAgYltpKytdID0gY2xvY2tzZXEgJiAweGZmO1xuXG4gICAgLy8gYG5vZGVgXG4gICAgdmFyIG5vZGUgPSBvcHRpb25zLm5vZGUgfHwgX25vZGVJZDtcbiAgICBmb3IgKHZhciBuID0gMDsgbiA8IDY7IG4rKykge1xuICAgICAgYltpICsgbl0gPSBub2RlW25dO1xuICAgIH1cblxuICAgIHJldHVybiBidWYgPyBidWYgOiB1bnBhcnNlKGIpO1xuICB9XG5cbiAgLy8gKipgdjQoKWAgLSBHZW5lcmF0ZSByYW5kb20gVVVJRCoqXG5cbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9icm9vZmEvbm9kZS11dWlkIGZvciBBUEkgZGV0YWlsc1xuICBmdW5jdGlvbiB2NChvcHRpb25zLCBidWYsIG9mZnNldCkge1xuICAgIC8vIERlcHJlY2F0ZWQgLSAnZm9ybWF0JyBhcmd1bWVudCwgYXMgc3VwcG9ydGVkIGluIHYxLjJcbiAgICB2YXIgaSA9IGJ1ZiAmJiBvZmZzZXQgfHwgMDtcblxuICAgIGlmICh0eXBlb2Yob3B0aW9ucykgPT0gJ3N0cmluZycpIHtcbiAgICAgIGJ1ZiA9IG9wdGlvbnMgPT0gJ2JpbmFyeScgPyBuZXcgQnVmZmVyQ2xhc3MoMTYpIDogbnVsbDtcbiAgICAgIG9wdGlvbnMgPSBudWxsO1xuICAgIH1cbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHZhciBybmRzID0gb3B0aW9ucy5yYW5kb20gfHwgKG9wdGlvbnMucm5nIHx8IF9ybmcpKCk7XG5cbiAgICAvLyBQZXIgNC40LCBzZXQgYml0cyBmb3IgdmVyc2lvbiBhbmQgYGNsb2NrX3NlcV9oaV9hbmRfcmVzZXJ2ZWRgXG4gICAgcm5kc1s2XSA9IChybmRzWzZdICYgMHgwZikgfCAweDQwO1xuICAgIHJuZHNbOF0gPSAocm5kc1s4XSAmIDB4M2YpIHwgMHg4MDtcblxuICAgIC8vIENvcHkgYnl0ZXMgdG8gYnVmZmVyLCBpZiBwcm92aWRlZFxuICAgIGlmIChidWYpIHtcbiAgICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCAxNjsgaWkrKykge1xuICAgICAgICBidWZbaSArIGlpXSA9IHJuZHNbaWldO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBidWYgfHwgdW5wYXJzZShybmRzKTtcbiAgfVxuXG4gIC8vIEV4cG9ydCBwdWJsaWMgQVBJXG4gIHZhciB1dWlkID0gdjQ7XG4gIHV1aWQudjEgPSB2MTtcbiAgdXVpZC52NCA9IHY0O1xuICB1dWlkLnBhcnNlID0gcGFyc2U7XG4gIHV1aWQudW5wYXJzZSA9IHVucGFyc2U7XG4gIHV1aWQuQnVmZmVyQ2xhc3MgPSBCdWZmZXJDbGFzcztcblxuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgLy8gUHVibGlzaCBhcyBBTUQgbW9kdWxlXG4gICAgZGVmaW5lKGZ1bmN0aW9uKCkge3JldHVybiB1dWlkO30pO1xuICB9IGVsc2UgaWYgKHR5cGVvZihtb2R1bGUpICE9ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgLy8gUHVibGlzaCBhcyBub2RlLmpzIG1vZHVsZVxuICAgIG1vZHVsZS5leHBvcnRzID0gdXVpZDtcbiAgfSBlbHNlIHtcbiAgICAvLyBQdWJsaXNoIGFzIGdsb2JhbCAoaW4gYnJvd3NlcnMpXG4gICAgdmFyIF9wcmV2aW91c1Jvb3QgPSBfZ2xvYmFsLnV1aWQ7XG5cbiAgICAvLyAqKmBub0NvbmZsaWN0KClgIC0gKGJyb3dzZXIgb25seSkgdG8gcmVzZXQgZ2xvYmFsICd1dWlkJyB2YXIqKlxuICAgIHV1aWQubm9Db25mbGljdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgX2dsb2JhbC51dWlkID0gX3ByZXZpb3VzUm9vdDtcbiAgICAgIHJldHVybiB1dWlkO1xuICAgIH07XG5cbiAgICBfZ2xvYmFsLnV1aWQgPSB1dWlkO1xuICB9XG59KS5jYWxsKHRoaXMpO1xuIiwiXCJ1c2Ugc3RyaWN0XCJcbi8vIE1vZHVsZSBleHBvcnQgcGF0dGVybiBmcm9tXG4vLyBodHRwczovL2dpdGh1Yi5jb20vdW1kanMvdW1kL2Jsb2IvbWFzdGVyL3JldHVybkV4cG9ydHMuanNcbjsoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cbiAgICAgICAgZGVmaW5lKFtdLCBmYWN0b3J5KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICAvLyBOb2RlLiBEb2VzIG5vdCB3b3JrIHdpdGggc3RyaWN0IENvbW1vbkpTLCBidXRcbiAgICAgICAgLy8gb25seSBDb21tb25KUy1saWtlIGVudmlyb25tZW50cyB0aGF0IHN1cHBvcnQgbW9kdWxlLmV4cG9ydHMsXG4gICAgICAgIC8vIGxpa2UgTm9kZS5cbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQnJvd3NlciBnbG9iYWxzIChyb290IGlzIHdpbmRvdylcbiAgICAgICAgcm9vdC5zdG9yZSA9IGZhY3RvcnkoKTtcbiAgfVxufSh0aGlzLCBmdW5jdGlvbiAoKSB7XG5cdFxuXHQvLyBTdG9yZS5qc1xuXHR2YXIgc3RvcmUgPSB7fSxcblx0XHR3aW4gPSAodHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IGdsb2JhbCksXG5cdFx0ZG9jID0gd2luLmRvY3VtZW50LFxuXHRcdGxvY2FsU3RvcmFnZU5hbWUgPSAnbG9jYWxTdG9yYWdlJyxcblx0XHRzY3JpcHRUYWcgPSAnc2NyaXB0Jyxcblx0XHRzdG9yYWdlXG5cblx0c3RvcmUuZGlzYWJsZWQgPSBmYWxzZVxuXHRzdG9yZS52ZXJzaW9uID0gJzEuMy4yMCdcblx0c3RvcmUuc2V0ID0gZnVuY3Rpb24oa2V5LCB2YWx1ZSkge31cblx0c3RvcmUuZ2V0ID0gZnVuY3Rpb24oa2V5LCBkZWZhdWx0VmFsKSB7fVxuXHRzdG9yZS5oYXMgPSBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHN0b3JlLmdldChrZXkpICE9PSB1bmRlZmluZWQgfVxuXHRzdG9yZS5yZW1vdmUgPSBmdW5jdGlvbihrZXkpIHt9XG5cdHN0b3JlLmNsZWFyID0gZnVuY3Rpb24oKSB7fVxuXHRzdG9yZS50cmFuc2FjdCA9IGZ1bmN0aW9uKGtleSwgZGVmYXVsdFZhbCwgdHJhbnNhY3Rpb25Gbikge1xuXHRcdGlmICh0cmFuc2FjdGlvbkZuID09IG51bGwpIHtcblx0XHRcdHRyYW5zYWN0aW9uRm4gPSBkZWZhdWx0VmFsXG5cdFx0XHRkZWZhdWx0VmFsID0gbnVsbFxuXHRcdH1cblx0XHRpZiAoZGVmYXVsdFZhbCA9PSBudWxsKSB7XG5cdFx0XHRkZWZhdWx0VmFsID0ge31cblx0XHR9XG5cdFx0dmFyIHZhbCA9IHN0b3JlLmdldChrZXksIGRlZmF1bHRWYWwpXG5cdFx0dHJhbnNhY3Rpb25Gbih2YWwpXG5cdFx0c3RvcmUuc2V0KGtleSwgdmFsKVxuXHR9XG5cdHN0b3JlLmdldEFsbCA9IGZ1bmN0aW9uKCkge31cblx0c3RvcmUuZm9yRWFjaCA9IGZ1bmN0aW9uKCkge31cblxuXHRzdG9yZS5zZXJpYWxpemUgPSBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdHJldHVybiBKU09OLnN0cmluZ2lmeSh2YWx1ZSlcblx0fVxuXHRzdG9yZS5kZXNlcmlhbGl6ZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0aWYgKHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgeyByZXR1cm4gdW5kZWZpbmVkIH1cblx0XHR0cnkgeyByZXR1cm4gSlNPTi5wYXJzZSh2YWx1ZSkgfVxuXHRcdGNhdGNoKGUpIHsgcmV0dXJuIHZhbHVlIHx8IHVuZGVmaW5lZCB9XG5cdH1cblxuXHQvLyBGdW5jdGlvbnMgdG8gZW5jYXBzdWxhdGUgcXVlc3Rpb25hYmxlIEZpcmVGb3ggMy42LjEzIGJlaGF2aW9yXG5cdC8vIHdoZW4gYWJvdXQuY29uZmlnOjpkb20uc3RvcmFnZS5lbmFibGVkID09PSBmYWxzZVxuXHQvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL21hcmN1c3dlc3Rpbi9zdG9yZS5qcy9pc3N1ZXMjaXNzdWUvMTNcblx0ZnVuY3Rpb24gaXNMb2NhbFN0b3JhZ2VOYW1lU3VwcG9ydGVkKCkge1xuXHRcdHRyeSB7IHJldHVybiAobG9jYWxTdG9yYWdlTmFtZSBpbiB3aW4gJiYgd2luW2xvY2FsU3RvcmFnZU5hbWVdKSB9XG5cdFx0Y2F0Y2goZXJyKSB7IHJldHVybiBmYWxzZSB9XG5cdH1cblxuXHRpZiAoaXNMb2NhbFN0b3JhZ2VOYW1lU3VwcG9ydGVkKCkpIHtcblx0XHRzdG9yYWdlID0gd2luW2xvY2FsU3RvcmFnZU5hbWVdXG5cdFx0c3RvcmUuc2V0ID0gZnVuY3Rpb24oa2V5LCB2YWwpIHtcblx0XHRcdGlmICh2YWwgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gc3RvcmUucmVtb3ZlKGtleSkgfVxuXHRcdFx0c3RvcmFnZS5zZXRJdGVtKGtleSwgc3RvcmUuc2VyaWFsaXplKHZhbCkpXG5cdFx0XHRyZXR1cm4gdmFsXG5cdFx0fVxuXHRcdHN0b3JlLmdldCA9IGZ1bmN0aW9uKGtleSwgZGVmYXVsdFZhbCkge1xuXHRcdFx0dmFyIHZhbCA9IHN0b3JlLmRlc2VyaWFsaXplKHN0b3JhZ2UuZ2V0SXRlbShrZXkpKVxuXHRcdFx0cmV0dXJuICh2YWwgPT09IHVuZGVmaW5lZCA/IGRlZmF1bHRWYWwgOiB2YWwpXG5cdFx0fVxuXHRcdHN0b3JlLnJlbW92ZSA9IGZ1bmN0aW9uKGtleSkgeyBzdG9yYWdlLnJlbW92ZUl0ZW0oa2V5KSB9XG5cdFx0c3RvcmUuY2xlYXIgPSBmdW5jdGlvbigpIHsgc3RvcmFnZS5jbGVhcigpIH1cblx0XHRzdG9yZS5nZXRBbGwgPSBmdW5jdGlvbigpIHtcblx0XHRcdHZhciByZXQgPSB7fVxuXHRcdFx0c3RvcmUuZm9yRWFjaChmdW5jdGlvbihrZXksIHZhbCkge1xuXHRcdFx0XHRyZXRba2V5XSA9IHZhbFxuXHRcdFx0fSlcblx0XHRcdHJldHVybiByZXRcblx0XHR9XG5cdFx0c3RvcmUuZm9yRWFjaCA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG5cdFx0XHRmb3IgKHZhciBpPTA7IGk8c3RvcmFnZS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIga2V5ID0gc3RvcmFnZS5rZXkoaSlcblx0XHRcdFx0Y2FsbGJhY2soa2V5LCBzdG9yZS5nZXQoa2V5KSlcblx0XHRcdH1cblx0XHR9XG5cdH0gZWxzZSBpZiAoZG9jICYmIGRvYy5kb2N1bWVudEVsZW1lbnQuYWRkQmVoYXZpb3IpIHtcblx0XHR2YXIgc3RvcmFnZU93bmVyLFxuXHRcdFx0c3RvcmFnZUNvbnRhaW5lclxuXHRcdC8vIFNpbmNlICN1c2VyRGF0YSBzdG9yYWdlIGFwcGxpZXMgb25seSB0byBzcGVjaWZpYyBwYXRocywgd2UgbmVlZCB0b1xuXHRcdC8vIHNvbWVob3cgbGluayBvdXIgZGF0YSB0byBhIHNwZWNpZmljIHBhdGguICBXZSBjaG9vc2UgL2Zhdmljb24uaWNvXG5cdFx0Ly8gYXMgYSBwcmV0dHkgc2FmZSBvcHRpb24sIHNpbmNlIGFsbCBicm93c2VycyBhbHJlYWR5IG1ha2UgYSByZXF1ZXN0IHRvXG5cdFx0Ly8gdGhpcyBVUkwgYW55d2F5IGFuZCBiZWluZyBhIDQwNCB3aWxsIG5vdCBodXJ0IHVzIGhlcmUuICBXZSB3cmFwIGFuXG5cdFx0Ly8gaWZyYW1lIHBvaW50aW5nIHRvIHRoZSBmYXZpY29uIGluIGFuIEFjdGl2ZVhPYmplY3QoaHRtbGZpbGUpIG9iamVjdFxuXHRcdC8vIChzZWU6IGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9hYTc1MjU3NCh2PVZTLjg1KS5hc3B4KVxuXHRcdC8vIHNpbmNlIHRoZSBpZnJhbWUgYWNjZXNzIHJ1bGVzIGFwcGVhciB0byBhbGxvdyBkaXJlY3QgYWNjZXNzIGFuZFxuXHRcdC8vIG1hbmlwdWxhdGlvbiBvZiB0aGUgZG9jdW1lbnQgZWxlbWVudCwgZXZlbiBmb3IgYSA0MDQgcGFnZS4gIFRoaXNcblx0XHQvLyBkb2N1bWVudCBjYW4gYmUgdXNlZCBpbnN0ZWFkIG9mIHRoZSBjdXJyZW50IGRvY3VtZW50ICh3aGljaCB3b3VsZFxuXHRcdC8vIGhhdmUgYmVlbiBsaW1pdGVkIHRvIHRoZSBjdXJyZW50IHBhdGgpIHRvIHBlcmZvcm0gI3VzZXJEYXRhIHN0b3JhZ2UuXG5cdFx0dHJ5IHtcblx0XHRcdHN0b3JhZ2VDb250YWluZXIgPSBuZXcgQWN0aXZlWE9iamVjdCgnaHRtbGZpbGUnKVxuXHRcdFx0c3RvcmFnZUNvbnRhaW5lci5vcGVuKClcblx0XHRcdHN0b3JhZ2VDb250YWluZXIud3JpdGUoJzwnK3NjcmlwdFRhZysnPmRvY3VtZW50Lnc9d2luZG93PC8nK3NjcmlwdFRhZysnPjxpZnJhbWUgc3JjPVwiL2Zhdmljb24uaWNvXCI+PC9pZnJhbWU+Jylcblx0XHRcdHN0b3JhZ2VDb250YWluZXIuY2xvc2UoKVxuXHRcdFx0c3RvcmFnZU93bmVyID0gc3RvcmFnZUNvbnRhaW5lci53LmZyYW1lc1swXS5kb2N1bWVudFxuXHRcdFx0c3RvcmFnZSA9IHN0b3JhZ2VPd25lci5jcmVhdGVFbGVtZW50KCdkaXYnKVxuXHRcdH0gY2F0Y2goZSkge1xuXHRcdFx0Ly8gc29tZWhvdyBBY3RpdmVYT2JqZWN0IGluc3RhbnRpYXRpb24gZmFpbGVkIChwZXJoYXBzIHNvbWUgc3BlY2lhbFxuXHRcdFx0Ly8gc2VjdXJpdHkgc2V0dGluZ3Mgb3Igb3RoZXJ3c2UpLCBmYWxsIGJhY2sgdG8gcGVyLXBhdGggc3RvcmFnZVxuXHRcdFx0c3RvcmFnZSA9IGRvYy5jcmVhdGVFbGVtZW50KCdkaXYnKVxuXHRcdFx0c3RvcmFnZU93bmVyID0gZG9jLmJvZHlcblx0XHR9XG5cdFx0dmFyIHdpdGhJRVN0b3JhZ2UgPSBmdW5jdGlvbihzdG9yZUZ1bmN0aW9uKSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKVxuXHRcdFx0XHRhcmdzLnVuc2hpZnQoc3RvcmFnZSlcblx0XHRcdFx0Ly8gU2VlIGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9tczUzMTA4MSh2PVZTLjg1KS5hc3B4XG5cdFx0XHRcdC8vIGFuZCBodHRwOi8vbXNkbi5taWNyb3NvZnQuY29tL2VuLXVzL2xpYnJhcnkvbXM1MzE0MjQodj1WUy44NSkuYXNweFxuXHRcdFx0XHRzdG9yYWdlT3duZXIuYXBwZW5kQ2hpbGQoc3RvcmFnZSlcblx0XHRcdFx0c3RvcmFnZS5hZGRCZWhhdmlvcignI2RlZmF1bHQjdXNlckRhdGEnKVxuXHRcdFx0XHRzdG9yYWdlLmxvYWQobG9jYWxTdG9yYWdlTmFtZSlcblx0XHRcdFx0dmFyIHJlc3VsdCA9IHN0b3JlRnVuY3Rpb24uYXBwbHkoc3RvcmUsIGFyZ3MpXG5cdFx0XHRcdHN0b3JhZ2VPd25lci5yZW1vdmVDaGlsZChzdG9yYWdlKVxuXHRcdFx0XHRyZXR1cm4gcmVzdWx0XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gSW4gSUU3LCBrZXlzIGNhbm5vdCBzdGFydCB3aXRoIGEgZGlnaXQgb3IgY29udGFpbiBjZXJ0YWluIGNoYXJzLlxuXHRcdC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vbWFyY3Vzd2VzdGluL3N0b3JlLmpzL2lzc3Vlcy80MFxuXHRcdC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vbWFyY3Vzd2VzdGluL3N0b3JlLmpzL2lzc3Vlcy84M1xuXHRcdHZhciBmb3JiaWRkZW5DaGFyc1JlZ2V4ID0gbmV3IFJlZ0V4cChcIlshXFxcIiMkJSYnKCkqKywvXFxcXFxcXFw6Ozw9Pj9AW1xcXFxdXmB7fH1+XVwiLCBcImdcIilcblx0XHR2YXIgaWVLZXlGaXggPSBmdW5jdGlvbihrZXkpIHtcblx0XHRcdHJldHVybiBrZXkucmVwbGFjZSgvXmQvLCAnX19fJCYnKS5yZXBsYWNlKGZvcmJpZGRlbkNoYXJzUmVnZXgsICdfX18nKVxuXHRcdH1cblx0XHRzdG9yZS5zZXQgPSB3aXRoSUVTdG9yYWdlKGZ1bmN0aW9uKHN0b3JhZ2UsIGtleSwgdmFsKSB7XG5cdFx0XHRrZXkgPSBpZUtleUZpeChrZXkpXG5cdFx0XHRpZiAodmFsID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHN0b3JlLnJlbW92ZShrZXkpIH1cblx0XHRcdHN0b3JhZ2Uuc2V0QXR0cmlidXRlKGtleSwgc3RvcmUuc2VyaWFsaXplKHZhbCkpXG5cdFx0XHRzdG9yYWdlLnNhdmUobG9jYWxTdG9yYWdlTmFtZSlcblx0XHRcdHJldHVybiB2YWxcblx0XHR9KVxuXHRcdHN0b3JlLmdldCA9IHdpdGhJRVN0b3JhZ2UoZnVuY3Rpb24oc3RvcmFnZSwga2V5LCBkZWZhdWx0VmFsKSB7XG5cdFx0XHRrZXkgPSBpZUtleUZpeChrZXkpXG5cdFx0XHR2YXIgdmFsID0gc3RvcmUuZGVzZXJpYWxpemUoc3RvcmFnZS5nZXRBdHRyaWJ1dGUoa2V5KSlcblx0XHRcdHJldHVybiAodmFsID09PSB1bmRlZmluZWQgPyBkZWZhdWx0VmFsIDogdmFsKVxuXHRcdH0pXG5cdFx0c3RvcmUucmVtb3ZlID0gd2l0aElFU3RvcmFnZShmdW5jdGlvbihzdG9yYWdlLCBrZXkpIHtcblx0XHRcdGtleSA9IGllS2V5Rml4KGtleSlcblx0XHRcdHN0b3JhZ2UucmVtb3ZlQXR0cmlidXRlKGtleSlcblx0XHRcdHN0b3JhZ2Uuc2F2ZShsb2NhbFN0b3JhZ2VOYW1lKVxuXHRcdH0pXG5cdFx0c3RvcmUuY2xlYXIgPSB3aXRoSUVTdG9yYWdlKGZ1bmN0aW9uKHN0b3JhZ2UpIHtcblx0XHRcdHZhciBhdHRyaWJ1dGVzID0gc3RvcmFnZS5YTUxEb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuYXR0cmlidXRlc1xuXHRcdFx0c3RvcmFnZS5sb2FkKGxvY2FsU3RvcmFnZU5hbWUpXG5cdFx0XHRmb3IgKHZhciBpPWF0dHJpYnV0ZXMubGVuZ3RoLTE7IGk+PTA7IGktLSkge1xuXHRcdFx0XHRzdG9yYWdlLnJlbW92ZUF0dHJpYnV0ZShhdHRyaWJ1dGVzW2ldLm5hbWUpXG5cdFx0XHR9XG5cdFx0XHRzdG9yYWdlLnNhdmUobG9jYWxTdG9yYWdlTmFtZSlcblx0XHR9KVxuXHRcdHN0b3JlLmdldEFsbCA9IGZ1bmN0aW9uKHN0b3JhZ2UpIHtcblx0XHRcdHZhciByZXQgPSB7fVxuXHRcdFx0c3RvcmUuZm9yRWFjaChmdW5jdGlvbihrZXksIHZhbCkge1xuXHRcdFx0XHRyZXRba2V5XSA9IHZhbFxuXHRcdFx0fSlcblx0XHRcdHJldHVybiByZXRcblx0XHR9XG5cdFx0c3RvcmUuZm9yRWFjaCA9IHdpdGhJRVN0b3JhZ2UoZnVuY3Rpb24oc3RvcmFnZSwgY2FsbGJhY2spIHtcblx0XHRcdHZhciBhdHRyaWJ1dGVzID0gc3RvcmFnZS5YTUxEb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuYXR0cmlidXRlc1xuXHRcdFx0Zm9yICh2YXIgaT0wLCBhdHRyOyBhdHRyPWF0dHJpYnV0ZXNbaV07ICsraSkge1xuXHRcdFx0XHRjYWxsYmFjayhhdHRyLm5hbWUsIHN0b3JlLmRlc2VyaWFsaXplKHN0b3JhZ2UuZ2V0QXR0cmlidXRlKGF0dHIubmFtZSkpKVxuXHRcdFx0fVxuXHRcdH0pXG5cdH1cblxuXHR0cnkge1xuXHRcdHZhciB0ZXN0S2V5ID0gJ19fc3RvcmVqc19fJ1xuXHRcdHN0b3JlLnNldCh0ZXN0S2V5LCB0ZXN0S2V5KVxuXHRcdGlmIChzdG9yZS5nZXQodGVzdEtleSkgIT0gdGVzdEtleSkgeyBzdG9yZS5kaXNhYmxlZCA9IHRydWUgfVxuXHRcdHN0b3JlLnJlbW92ZSh0ZXN0S2V5KVxuXHR9IGNhdGNoKGUpIHtcblx0XHRzdG9yZS5kaXNhYmxlZCA9IHRydWVcblx0fVxuXHRzdG9yZS5lbmFibGVkID0gIXN0b3JlLmRpc2FibGVkXG5cdFxuXHRyZXR1cm4gc3RvcmVcbn0pKTtcbiIsInV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpXG5TdG9yYWdlID0gcmVxdWlyZSgnLi9zdG9yYWdlJylcblxuY2xhc3MgQWRhcHRlcnNcblxuICAjIyBBZGFwdGVyIGZvciB1c2luZyB0aGUgZ2ltZWwgYmFja2VuZC4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9BbGVwaGJldC9naW1lbFxuICAjIyB1c2VzIGpRdWVyeSB0byBzZW5kIGRhdGEgaWYgYCQuYWpheGAgaXMgZm91bmQuIEZhbGxzIGJhY2sgb24gcGxhaW4ganMgeGhyXG4gICMjIHBhcmFtczpcbiAgIyMgLSB1cmw6IEdpbWVsIHRyYWNrIFVSTCB0byBwb3N0IGV2ZW50cyB0b1xuICAjIyAtIG5hbWVwc2FjZTogbmFtZXNwYWNlIGZvciBHaW1lbCAoYWxsb3dzIHNldHRpbmcgZGlmZmVyZW50IGVudmlyb25tZW50cyBldGMpXG4gICMjIC0gc3RvcmFnZSAob3B0aW9uYWwpIC0gc3RvcmFnZSBhZGFwdGVyIGZvciB0aGUgcXVldWVcbiAgY2xhc3MgQEdpbWVsQWRhcHRlclxuICAgIHF1ZXVlX25hbWU6ICdfZ2ltZWxfcXVldWUnXG5cbiAgICBjb25zdHJ1Y3RvcjogKHVybCwgbmFtZXNwYWNlLCBzdG9yYWdlID0gQWRhcHRlcnMuTG9jYWxTdG9yYWdlQWRhcHRlcikgLT5cbiAgICAgIEBfc3RvcmFnZSA9IHN0b3JhZ2VcbiAgICAgIEB1cmwgPSB1cmxcbiAgICAgIEBuYW1lc3BhY2UgPSBuYW1lc3BhY2VcbiAgICAgIEBfcXVldWUgPSBKU09OLnBhcnNlKEBfc3RvcmFnZS5nZXQoQHF1ZXVlX25hbWUpIHx8ICdbXScpXG4gICAgICBAX2ZsdXNoKClcblxuICAgIF9yZW1vdmVfdXVpZDogKHV1aWQpIC0+XG4gICAgICAoZXJyLCByZXMpID0+XG4gICAgICAgIHJldHVybiBpZiBlcnJcbiAgICAgICAgdXRpbHMucmVtb3ZlKEBfcXVldWUsIChlbCkgLT4gZWwucHJvcGVydGllcy51dWlkID09IHV1aWQpXG4gICAgICAgIEBfc3RvcmFnZS5zZXQoQHF1ZXVlX25hbWUsIEpTT04uc3RyaW5naWZ5KEBfcXVldWUpKVxuXG4gICAgX2pxdWVyeV9nZXQ6ICh1cmwsIGRhdGEsIGNhbGxiYWNrKSAtPlxuICAgICAgdXRpbHMubG9nKCdzZW5kIHJlcXVlc3QgdXNpbmcgalF1ZXJ5JylcbiAgICAgIHdpbmRvdy5qUXVlcnkuYWpheFxuICAgICAgICBtZXRob2Q6ICdHRVQnXG4gICAgICAgIHVybDogdXJsXG4gICAgICAgIGRhdGE6IGRhdGFcbiAgICAgICAgc3VjY2VzczogY2FsbGJhY2tcblxuICAgIF9wbGFpbl9qc19nZXQ6ICh1cmwsIGRhdGEsIGNhbGxiYWNrKSAtPlxuICAgICAgdXRpbHMubG9nKCdmYWxsYmFjayBvbiBwbGFpbiBqcyB4aHInKVxuICAgICAgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcbiAgICAgIHBhcmFtcyA9IChcIiN7ZW5jb2RlVVJJQ29tcG9uZW50KGspfT0je2VuY29kZVVSSUNvbXBvbmVudCh2KX1cIiBmb3Igayx2IG9mIGRhdGEpXG4gICAgICBwYXJhbXMgPSBwYXJhbXMuam9pbignJicpLnJlcGxhY2UoLyUyMC9nLCAnKycpXG4gICAgICB4aHIub3BlbignR0VUJywgXCIje3VybH0/I3twYXJhbXN9XCIpXG4gICAgICB4aHIub25sb2FkID0gLT5cbiAgICAgICAgaWYgeGhyLnN0YXR1cyA9PSAyMDBcbiAgICAgICAgICBjYWxsYmFjaygpXG4gICAgICB4aHIuc2VuZCgpXG5cbiAgICBfYWpheF9nZXQ6ICh1cmwsIGRhdGEsIGNhbGxiYWNrKSAtPlxuICAgICAgaWYgd2luZG93LmpRdWVyeT8uYWpheFxuICAgICAgICBAX2pxdWVyeV9nZXQodXJsLCBkYXRhLCBjYWxsYmFjaylcbiAgICAgIGVsc2VcbiAgICAgICAgQF9wbGFpbl9qc19nZXQodXJsLCBkYXRhLCBjYWxsYmFjaylcblxuICAgIF9mbHVzaDogLT5cbiAgICAgIGZvciBpdGVtIGluIEBfcXVldWVcbiAgICAgICAgY2FsbGJhY2sgPSBAX3JlbW92ZV91dWlkKGl0ZW0ucHJvcGVydGllcy51dWlkKVxuICAgICAgICBAX2FqYXhfZ2V0KEB1cmwsIGl0ZW0ucHJvcGVydGllcywgY2FsbGJhY2spXG4gICAgICAgIG51bGxcblxuICAgIF90cmFjazogKGV4cGVyaW1lbnRfbmFtZSwgdmFyaWFudCwgZXZlbnQpIC0+XG4gICAgICB1dGlscy5sb2coXCJQZXJzaXN0ZW50IFF1ZXVlIEdpbWVsIHRyYWNrOiAje0BuYW1lc3BhY2V9LCAje2V4cGVyaW1lbnRfbmFtZX0sICN7dmFyaWFudH0sICN7ZXZlbnR9XCIpXG4gICAgICBAX3F1ZXVlLnNoaWZ0KCkgaWYgQF9xdWV1ZS5sZW5ndGggPiAxMDBcbiAgICAgIEBfcXVldWUucHVzaFxuICAgICAgICBwcm9wZXJ0aWVzOlxuICAgICAgICAgIGV4cGVyaW1lbnQ6IGV4cGVyaW1lbnRfbmFtZVxuICAgICAgICAgIHV1aWQ6IHV0aWxzLnV1aWQoKVxuICAgICAgICAgIHZhcmlhbnQ6IHZhcmlhbnRcbiAgICAgICAgICBldmVudDogZXZlbnRcbiAgICAgICAgICBuYW1lc3BhY2U6IEBuYW1lc3BhY2VcbiAgICAgIEBfc3RvcmFnZS5zZXQoQHF1ZXVlX25hbWUsIEpTT04uc3RyaW5naWZ5KEBfcXVldWUpKVxuICAgICAgQF9mbHVzaCgpXG5cbiAgICBleHBlcmltZW50X3N0YXJ0OiAoZXhwZXJpbWVudF9uYW1lLCB2YXJpYW50KSA9PlxuICAgICAgQF90cmFjayhleHBlcmltZW50X25hbWUsIHZhcmlhbnQsICdwYXJ0aWNpcGF0ZScpXG5cbiAgICBnb2FsX2NvbXBsZXRlOiAoZXhwZXJpbWVudF9uYW1lLCB2YXJpYW50LCBnb2FsKSA9PlxuICAgICAgQF90cmFjayhleHBlcmltZW50X25hbWUsIHZhcmlhbnQsIGdvYWwpXG5cblxuICBjbGFzcyBAUGVyc2lzdGVudFF1ZXVlR29vZ2xlQW5hbHl0aWNzQWRhcHRlclxuICAgIG5hbWVzcGFjZTogJ2FsZXBoYmV0J1xuICAgIHF1ZXVlX25hbWU6ICdfZ2FfcXVldWUnXG5cbiAgICBjb25zdHJ1Y3RvcjogKHN0b3JhZ2UgPSBBZGFwdGVycy5Mb2NhbFN0b3JhZ2VBZGFwdGVyKSAtPlxuICAgICAgQF9zdG9yYWdlID0gc3RvcmFnZVxuICAgICAgQF9xdWV1ZSA9IEpTT04ucGFyc2UoQF9zdG9yYWdlLmdldChAcXVldWVfbmFtZSkgfHwgJ1tdJylcbiAgICAgIEBfZmx1c2goKVxuXG4gICAgX3JlbW92ZV91dWlkOiAodXVpZCkgLT5cbiAgICAgID0+XG4gICAgICAgIHV0aWxzLnJlbW92ZShAX3F1ZXVlLCAoZWwpIC0+IGVsLnV1aWQgPT0gdXVpZClcbiAgICAgICAgQF9zdG9yYWdlLnNldChAcXVldWVfbmFtZSwgSlNPTi5zdHJpbmdpZnkoQF9xdWV1ZSkpXG5cbiAgICBfZmx1c2g6IC0+XG4gICAgICB0aHJvdyAnZ2Egbm90IGRlZmluZWQuIFBsZWFzZSBtYWtlIHN1cmUgeW91ciBVbml2ZXJzYWwgYW5hbHl0aWNzIGlzIHNldCB1cCBjb3JyZWN0bHknIGlmIHR5cGVvZiBnYSBpc250ICdmdW5jdGlvbidcbiAgICAgIGZvciBpdGVtIGluIEBfcXVldWVcbiAgICAgICAgY2FsbGJhY2sgPSBAX3JlbW92ZV91dWlkKGl0ZW0udXVpZClcbiAgICAgICAgZ2EoJ3NlbmQnLCAnZXZlbnQnLCBpdGVtLmNhdGVnb3J5LCBpdGVtLmFjdGlvbiwgaXRlbS5sYWJlbCwgeydoaXRDYWxsYmFjayc6IGNhbGxiYWNrLCAnbm9uSW50ZXJhY3Rpb24nOiAxfSlcblxuICAgIF90cmFjazogKGNhdGVnb3J5LCBhY3Rpb24sIGxhYmVsKSAtPlxuICAgICAgdXRpbHMubG9nKFwiUGVyc2lzdGVudCBRdWV1ZSBHb29nbGUgVW5pdmVyc2FsIEFuYWx5dGljcyB0cmFjazogI3tjYXRlZ29yeX0sICN7YWN0aW9ufSwgI3tsYWJlbH1cIilcbiAgICAgIEBfcXVldWUuc2hpZnQoKSBpZiBAX3F1ZXVlLmxlbmd0aCA+IDEwMFxuICAgICAgQF9xdWV1ZS5wdXNoKHt1dWlkOiB1dGlscy51dWlkKCksIGNhdGVnb3J5OiBjYXRlZ29yeSwgYWN0aW9uOiBhY3Rpb24sIGxhYmVsOiBsYWJlbH0pXG4gICAgICBAX3N0b3JhZ2Uuc2V0KEBxdWV1ZV9uYW1lLCBKU09OLnN0cmluZ2lmeShAX3F1ZXVlKSlcbiAgICAgIEBfZmx1c2goKVxuXG4gICAgZXhwZXJpbWVudF9zdGFydDogKGV4cGVyaW1lbnRfbmFtZSwgdmFyaWFudCkgPT5cbiAgICAgIEBfdHJhY2soQG5hbWVzcGFjZSwgXCIje2V4cGVyaW1lbnRfbmFtZX0gfCAje3ZhcmlhbnR9XCIsICdWaXNpdG9ycycpXG5cbiAgICBnb2FsX2NvbXBsZXRlOiAoZXhwZXJpbWVudF9uYW1lLCB2YXJpYW50LCBnb2FsKSA9PlxuICAgICAgQF90cmFjayhAbmFtZXNwYWNlLCBcIiN7ZXhwZXJpbWVudF9uYW1lfSB8ICN7dmFyaWFudH1cIiwgZ29hbClcblxuXG4gIGNsYXNzIEBQZXJzaXN0ZW50UXVldWVLZWVuQWRhcHRlclxuICAgIHF1ZXVlX25hbWU6ICdfa2Vlbl9xdWV1ZSdcblxuICAgIGNvbnN0cnVjdG9yOiAoa2Vlbl9jbGllbnQsIHN0b3JhZ2UgPSBBZGFwdGVycy5Mb2NhbFN0b3JhZ2VBZGFwdGVyKSAtPlxuICAgICAgQGNsaWVudCA9IGtlZW5fY2xpZW50XG4gICAgICBAX3N0b3JhZ2UgPSBzdG9yYWdlXG4gICAgICBAX3F1ZXVlID0gSlNPTi5wYXJzZShAX3N0b3JhZ2UuZ2V0KEBxdWV1ZV9uYW1lKSB8fCAnW10nKVxuICAgICAgQF9mbHVzaCgpXG5cbiAgICBfcmVtb3ZlX3V1aWQ6ICh1dWlkKSAtPlxuICAgICAgKGVyciwgcmVzKSA9PlxuICAgICAgICByZXR1cm4gaWYgZXJyXG4gICAgICAgIHV0aWxzLnJlbW92ZShAX3F1ZXVlLCAoZWwpIC0+IGVsLnByb3BlcnRpZXMudXVpZCA9PSB1dWlkKVxuICAgICAgICBAX3N0b3JhZ2Uuc2V0KEBxdWV1ZV9uYW1lLCBKU09OLnN0cmluZ2lmeShAX3F1ZXVlKSlcblxuICAgIF9mbHVzaDogLT5cbiAgICAgIGZvciBpdGVtIGluIEBfcXVldWVcbiAgICAgICAgY2FsbGJhY2sgPSBAX3JlbW92ZV91dWlkKGl0ZW0ucHJvcGVydGllcy51dWlkKVxuICAgICAgICBAY2xpZW50LmFkZEV2ZW50KGl0ZW0uZXhwZXJpbWVudF9uYW1lLCBpdGVtLnByb3BlcnRpZXMsIGNhbGxiYWNrKVxuXG4gICAgX3RyYWNrOiAoZXhwZXJpbWVudF9uYW1lLCB2YXJpYW50LCBldmVudCkgLT5cbiAgICAgIHV0aWxzLmxvZyhcIlBlcnNpc3RlbnQgUXVldWUgS2VlbiB0cmFjazogI3tleHBlcmltZW50X25hbWV9LCAje3ZhcmlhbnR9LCAje2V2ZW50fVwiKVxuICAgICAgQF9xdWV1ZS5zaGlmdCgpIGlmIEBfcXVldWUubGVuZ3RoID4gMTAwXG4gICAgICBAX3F1ZXVlLnB1c2hcbiAgICAgICAgZXhwZXJpbWVudF9uYW1lOiBleHBlcmltZW50X25hbWVcbiAgICAgICAgcHJvcGVydGllczpcbiAgICAgICAgICB1dWlkOiB1dGlscy51dWlkKClcbiAgICAgICAgICB2YXJpYW50OiB2YXJpYW50XG4gICAgICAgICAgZXZlbnQ6IGV2ZW50XG4gICAgICBAX3N0b3JhZ2Uuc2V0KEBxdWV1ZV9uYW1lLCBKU09OLnN0cmluZ2lmeShAX3F1ZXVlKSlcbiAgICAgIEBfZmx1c2goKVxuXG4gICAgZXhwZXJpbWVudF9zdGFydDogKGV4cGVyaW1lbnRfbmFtZSwgdmFyaWFudCkgPT5cbiAgICAgIEBfdHJhY2soZXhwZXJpbWVudF9uYW1lLCB2YXJpYW50LCAncGFydGljaXBhdGUnKVxuXG4gICAgZ29hbF9jb21wbGV0ZTogKGV4cGVyaW1lbnRfbmFtZSwgdmFyaWFudCwgZ29hbCkgPT5cbiAgICAgIEBfdHJhY2soZXhwZXJpbWVudF9uYW1lLCB2YXJpYW50LCBnb2FsKVxuXG5cbiAgY2xhc3MgQEdvb2dsZVVuaXZlcnNhbEFuYWx5dGljc0FkYXB0ZXJcbiAgICBAbmFtZXNwYWNlOiAnYWxlcGhiZXQnXG5cbiAgICBAX3RyYWNrOiAoY2F0ZWdvcnksIGFjdGlvbiwgbGFiZWwpIC0+XG4gICAgICB1dGlscy5sb2coXCJHb29nbGUgVW5pdmVyc2FsIEFuYWx5dGljcyB0cmFjazogI3tjYXRlZ29yeX0sICN7YWN0aW9ufSwgI3tsYWJlbH1cIilcbiAgICAgIHRocm93ICdnYSBub3QgZGVmaW5lZC4gUGxlYXNlIG1ha2Ugc3VyZSB5b3VyIFVuaXZlcnNhbCBhbmFseXRpY3MgaXMgc2V0IHVwIGNvcnJlY3RseScgaWYgdHlwZW9mIGdhIGlzbnQgJ2Z1bmN0aW9uJ1xuICAgICAgZ2EoJ3NlbmQnLCAnZXZlbnQnLCBjYXRlZ29yeSwgYWN0aW9uLCBsYWJlbCwgeydub25JbnRlcmFjdGlvbic6IDF9KVxuXG4gICAgQGV4cGVyaW1lbnRfc3RhcnQ6IChleHBlcmltZW50X25hbWUsIHZhcmlhbnQpID0+XG4gICAgICBAX3RyYWNrKEBuYW1lc3BhY2UsIFwiI3tleHBlcmltZW50X25hbWV9IHwgI3t2YXJpYW50fVwiLCAnVmlzaXRvcnMnKVxuXG4gICAgQGdvYWxfY29tcGxldGU6IChleHBlcmltZW50X25hbWUsIHZhcmlhbnQsIGdvYWwpID0+XG4gICAgICBAX3RyYWNrKEBuYW1lc3BhY2UsIFwiI3tleHBlcmltZW50X25hbWV9IHwgI3t2YXJpYW50fVwiLCBnb2FsKVxuXG5cbiAgY2xhc3MgQExvY2FsU3RvcmFnZUFkYXB0ZXJcbiAgICBAbmFtZXNwYWNlOiAnYWxlcGhiZXQnXG4gICAgQHNldDogKGtleSwgdmFsdWUpIC0+XG4gICAgICBuZXcgU3RvcmFnZShAbmFtZXNwYWNlKS5zZXQoa2V5LCB2YWx1ZSlcbiAgICBAZ2V0OiAoa2V5KSAtPlxuICAgICAgbmV3IFN0b3JhZ2UoQG5hbWVzcGFjZSkuZ2V0KGtleSlcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEFkYXB0ZXJzXG4iLCJ1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKVxuYWRhcHRlcnMgPSByZXF1aXJlKCcuL2FkYXB0ZXJzJylcbm9wdGlvbnMgPSByZXF1aXJlKCcuL29wdGlvbnMnKVxuXG5jbGFzcyBBbGVwaEJldFxuICBAb3B0aW9ucyA9IG9wdGlvbnNcbiAgQHV0aWxzID0gdXRpbHNcblxuICBAR2ltZWxBZGFwdGVyID0gYWRhcHRlcnMuR2ltZWxBZGFwdGVyXG4gIEBQZXJzaXN0ZW50UXVldWVHb29nbGVBbmFseXRpY3NBZGFwdGVyID0gYWRhcHRlcnMuUGVyc2lzdGVudFF1ZXVlR29vZ2xlQW5hbHl0aWNzQWRhcHRlclxuICBAUGVyc2lzdGVudFF1ZXVlS2VlbkFkYXB0ZXIgPSBhZGFwdGVycy5QZXJzaXN0ZW50UXVldWVLZWVuQWRhcHRlclxuXG4gIGNsYXNzIEBFeHBlcmltZW50XG4gICAgQF9vcHRpb25zOlxuICAgICAgbmFtZTogbnVsbFxuICAgICAgdmFyaWFudHM6IG51bGxcbiAgICAgIHNhbXBsZTogMS4wXG4gICAgICB0cmlnZ2VyOiAtPiB0cnVlXG4gICAgICB0cmFja2luZ19hZGFwdGVyOiBhZGFwdGVycy5Hb29nbGVVbml2ZXJzYWxBbmFseXRpY3NBZGFwdGVyXG4gICAgICBzdG9yYWdlX2FkYXB0ZXI6IGFkYXB0ZXJzLkxvY2FsU3RvcmFnZUFkYXB0ZXJcblxuICAgIGNvbnN0cnVjdG9yOiAoQG9wdGlvbnM9e30pIC0+XG4gICAgICB1dGlscy5kZWZhdWx0cyhAb3B0aW9ucywgRXhwZXJpbWVudC5fb3B0aW9ucylcbiAgICAgIF92YWxpZGF0ZS5jYWxsKHRoaXMpXG4gICAgICBAbmFtZSA9IEBvcHRpb25zLm5hbWVcbiAgICAgIEB2YXJpYW50cyA9IEBvcHRpb25zLnZhcmlhbnRzXG4gICAgICBAdmFyaWFudF9uYW1lcyA9IHV0aWxzLmtleXMoQHZhcmlhbnRzKVxuICAgICAgX3J1bi5jYWxsKHRoaXMpXG5cbiAgICBydW46IC0+XG4gICAgICB1dGlscy5sb2coXCJydW5uaW5nIHdpdGggb3B0aW9uczogI3tKU09OLnN0cmluZ2lmeShAb3B0aW9ucyl9XCIpXG4gICAgICBpZiB2YXJpYW50ID0gQGdldF9zdG9yZWRfdmFyaWFudCgpXG4gICAgICAgICMgYSB2YXJpYW50IHdhcyBhbHJlYWR5IGNob3Nlbi4gYWN0aXZhdGUgaXRcbiAgICAgICAgdXRpbHMubG9nKFwiI3t2YXJpYW50fSBhY3RpdmVcIilcbiAgICAgICAgQGFjdGl2YXRlX3ZhcmlhbnQodmFyaWFudClcbiAgICAgIGVsc2VcbiAgICAgICAgQGNvbmRpdGlvbmFsbHlfYWN0aXZhdGVfdmFyaWFudCgpXG5cbiAgICBfcnVuID0gLT4gQHJ1bigpXG5cbiAgICBhY3RpdmF0ZV92YXJpYW50OiAodmFyaWFudCkgLT5cbiAgICAgIEB2YXJpYW50c1t2YXJpYW50XT8uYWN0aXZhdGUodGhpcylcbiAgICAgIEBzdG9yYWdlKCkuc2V0KFwiI3tAb3B0aW9ucy5uYW1lfTp2YXJpYW50XCIsIHZhcmlhbnQpXG5cbiAgICAjIGlmIGV4cGVyaW1lbnQgY29uZGl0aW9ucyBtYXRjaCwgcGljayBhbmQgYWN0aXZhdGUgYSB2YXJpYW50LCB0cmFjayBleHBlcmltZW50IHN0YXJ0XG4gICAgY29uZGl0aW9uYWxseV9hY3RpdmF0ZV92YXJpYW50OiAtPlxuICAgICAgcmV0dXJuIHVubGVzcyBAb3B0aW9ucy50cmlnZ2VyKClcbiAgICAgIHV0aWxzLmxvZygndHJpZ2dlciBzZXQnKVxuICAgICAgcmV0dXJuIHVubGVzcyBAaW5fc2FtcGxlKClcbiAgICAgIHV0aWxzLmxvZygnaW4gc2FtcGxlJylcbiAgICAgIHZhcmlhbnQgPSBAcGlja192YXJpYW50KClcbiAgICAgIEB0cmFja2luZygpLmV4cGVyaW1lbnRfc3RhcnQoQG9wdGlvbnMubmFtZSwgdmFyaWFudClcbiAgICAgIEBhY3RpdmF0ZV92YXJpYW50KHZhcmlhbnQpXG5cbiAgICBnb2FsX2NvbXBsZXRlOiAoZ29hbF9uYW1lLCBwcm9wcz17fSkgLT5cbiAgICAgIHV0aWxzLmRlZmF1bHRzKHByb3BzLCB7dW5pcXVlOiB0cnVlfSlcbiAgICAgIHJldHVybiBpZiBwcm9wcy51bmlxdWUgJiYgQHN0b3JhZ2UoKS5nZXQoXCIje0BvcHRpb25zLm5hbWV9OiN7Z29hbF9uYW1lfVwiKVxuICAgICAgdmFyaWFudCA9IEBnZXRfc3RvcmVkX3ZhcmlhbnQoKVxuICAgICAgcmV0dXJuIHVubGVzcyB2YXJpYW50XG4gICAgICBAc3RvcmFnZSgpLnNldChcIiN7QG9wdGlvbnMubmFtZX06I3tnb2FsX25hbWV9XCIsIHRydWUpIGlmIHByb3BzLnVuaXF1ZVxuICAgICAgdXRpbHMubG9nKFwiZXhwZXJpbWVudDogI3tAb3B0aW9ucy5uYW1lfSB2YXJpYW50OiN7dmFyaWFudH0gZ29hbDoje2dvYWxfbmFtZX0gY29tcGxldGVcIilcbiAgICAgIEB0cmFja2luZygpLmdvYWxfY29tcGxldGUoQG9wdGlvbnMubmFtZSwgdmFyaWFudCwgZ29hbF9uYW1lKVxuXG4gICAgZ2V0X3N0b3JlZF92YXJpYW50OiAtPlxuICAgICAgQHN0b3JhZ2UoKS5nZXQoXCIje0BvcHRpb25zLm5hbWV9OnZhcmlhbnRcIilcblxuICAgIHBpY2tfdmFyaWFudDogLT5cbiAgICAgIHBhcnRpdGlvbnMgPSAxLjAgLyBAdmFyaWFudF9uYW1lcy5sZW5ndGhcbiAgICAgIGNob3Nlbl9wYXJ0aXRpb24gPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgLyBwYXJ0aXRpb25zKVxuICAgICAgdmFyaWFudCA9IEB2YXJpYW50X25hbWVzW2Nob3Nlbl9wYXJ0aXRpb25dXG4gICAgICB1dGlscy5sb2coXCIje3ZhcmlhbnR9IHBpY2tlZFwiKVxuICAgICAgdmFyaWFudFxuXG4gICAgaW5fc2FtcGxlOiAtPlxuICAgICAgYWN0aXZlID0gQHN0b3JhZ2UoKS5nZXQoXCIje0BvcHRpb25zLm5hbWV9OmluX3NhbXBsZVwiKVxuICAgICAgcmV0dXJuIGFjdGl2ZSB1bmxlc3MgdHlwZW9mIGFjdGl2ZSBpcyAndW5kZWZpbmVkJ1xuICAgICAgYWN0aXZlID0gTWF0aC5yYW5kb20oKSA8PSBAb3B0aW9ucy5zYW1wbGVcbiAgICAgIEBzdG9yYWdlKCkuc2V0KFwiI3tAb3B0aW9ucy5uYW1lfTppbl9zYW1wbGVcIiwgYWN0aXZlKVxuICAgICAgYWN0aXZlXG5cbiAgICBhZGRfZ29hbDogKGdvYWwpID0+XG4gICAgICBnb2FsLmFkZF9leHBlcmltZW50KHRoaXMpXG5cbiAgICBhZGRfZ29hbHM6IChnb2FscykgPT5cbiAgICAgIEBhZGRfZ29hbChnb2FsKSBmb3IgZ29hbCBpbiBnb2Fsc1xuXG4gICAgc3RvcmFnZTogLT4gQG9wdGlvbnMuc3RvcmFnZV9hZGFwdGVyXG5cbiAgICB0cmFja2luZzogLT4gQG9wdGlvbnMudHJhY2tpbmdfYWRhcHRlclxuXG4gICAgX3ZhbGlkYXRlID0gLT5cbiAgICAgIHRocm93ICdhbiBleHBlcmltZW50IG5hbWUgbXVzdCBiZSBzcGVjaWZpZWQnIGlmIEBvcHRpb25zLm5hbWUgaXMgbnVsbFxuICAgICAgdGhyb3cgJ3ZhcmlhbnRzIG11c3QgYmUgcHJvdmlkZWQnIGlmIEBvcHRpb25zLnZhcmlhbnRzIGlzIG51bGxcbiAgICAgIHRocm93ICd0cmlnZ2VyIG11c3QgYmUgYSBmdW5jdGlvbicgaWYgdHlwZW9mIEBvcHRpb25zLnRyaWdnZXIgaXNudCAnZnVuY3Rpb24nXG5cblxuICBjbGFzcyBAR29hbFxuICAgIGNvbnN0cnVjdG9yOiAoQG5hbWUsIEBwcm9wcz17fSkgLT5cbiAgICAgIHV0aWxzLmRlZmF1bHRzKEBwcm9wcywge3VuaXF1ZTogdHJ1ZX0pXG4gICAgICBAZXhwZXJpbWVudHMgPSBbXVxuXG4gICAgYWRkX2V4cGVyaW1lbnQ6IChleHBlcmltZW50KSAtPlxuICAgICAgQGV4cGVyaW1lbnRzLnB1c2goZXhwZXJpbWVudClcblxuICAgIGFkZF9leHBlcmltZW50czogKGV4cGVyaW1lbnRzKSAtPlxuICAgICAgQGFkZF9leHBlcmltZW50KGV4cGVyaW1lbnQpIGZvciBleHBlcmltZW50IGluIGV4cGVyaW1lbnRzXG5cbiAgICBjb21wbGV0ZTogLT5cbiAgICAgIGZvciBleHBlcmltZW50IGluIEBleHBlcmltZW50c1xuICAgICAgICBleHBlcmltZW50LmdvYWxfY29tcGxldGUoQG5hbWUsIEBwcm9wcylcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEFsZXBoQmV0XG4iLCJtb2R1bGUuZXhwb3J0cyA9XG4gIGRlYnVnOiBmYWxzZVxuIiwic3RvcmUgPSByZXF1aXJlKCdzdG9yZScpXG5cbiMgYSB0aGluIHdyYXBwZXIgYXJvdW5kIHN0b3JlLmpzIGZvciBlYXN5IHN3YXBwaW5nXG5jbGFzcyBTdG9yYWdlXG4gIGNvbnN0cnVjdG9yOiAoQG5hbWVzcGFjZT0nYWxlcGhiZXQnKSAtPlxuICAgIHRocm93ICdsb2NhbCBzdG9yYWdlIG5vdCBzdXBwb3J0ZWQnIHVubGVzcyBzdG9yZS5lbmFibGVkXG4gICAgQHN0b3JhZ2UgPSBzdG9yZS5nZXQoQG5hbWVzcGFjZSkgfHwge31cbiAgc2V0OiAoa2V5LCB2YWx1ZSkgLT5cbiAgICBAc3RvcmFnZVtrZXldID0gdmFsdWVcbiAgICBzdG9yZS5zZXQoQG5hbWVzcGFjZSwgQHN0b3JhZ2UpXG4gICAgcmV0dXJuIHZhbHVlXG4gIGdldDogKGtleSkgLT5cbiAgICBAc3RvcmFnZVtrZXldXG4gICAgIyBzdG9yZS5nZXQoXCIje0BuYW1lc3BhY2V9OiN7a2V5fVwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFN0b3JhZ2VcbiIsIiMgTk9URTogdXNpbmcgYSBjdXN0b20gYnVpbGQgb2YgbG9kYXNoLCB0byBzYXZlIHNwYWNlXG5fID0gcmVxdWlyZSgnbG9kYXNoLmN1c3RvbScpXG51dWlkID0gcmVxdWlyZSgnbm9kZS11dWlkJylcbm9wdGlvbnMgPSByZXF1aXJlKCcuL29wdGlvbnMnKVxuXG5jbGFzcyBVdGlsc1xuICBAZGVmYXVsdHM6IF8uZGVmYXVsdHNcbiAgQGtleXM6IF8ua2V5c1xuICBAcmVtb3ZlOiBfLnJlbW92ZVxuICBAbG9nOiAobWVzc2FnZSkgLT5cbiAgICBjb25zb2xlLmxvZyhtZXNzYWdlKSBpZiBvcHRpb25zLmRlYnVnXG4gIEB1dWlkOiB1dWlkLnY0XG5cbm1vZHVsZS5leHBvcnRzID0gVXRpbHNcbiIsIi8qKlxuICogQGxpY2Vuc2VcbiAqIGxvZGFzaCAzLjEwLjAgKEN1c3RvbSBCdWlsZCkgbG9kYXNoLmNvbS9saWNlbnNlIHwgVW5kZXJzY29yZS5qcyAxLjguMyB1bmRlcnNjb3JlanMub3JnL0xJQ0VOU0VcbiAqIEJ1aWxkOiBgbG9kYXNoIC1wIGluY2x1ZGU9XCJrZXlzLGRlZmF1bHRzLHJlbW92ZVwiIGV4cG9ydHM9XCJub2RlXCIgLW8gLi92ZW5kb3IvbG9kYXNoLmN1c3RvbS5taW4uanNgXG4gKi9cbjsoZnVuY3Rpb24oKXtmdW5jdGlvbiBCKGEpe3JldHVybiEhYSYmdHlwZW9mIGE9PVwib2JqZWN0XCJ9ZnVuY3Rpb24gbigpe31mdW5jdGlvbiBTYShhLGIpe3ZhciBjPS0xLGU9YS5sZW5ndGg7Zm9yKGJ8fChiPUFycmF5KGUpKTsrK2M8ZTspYltjXT1hW2NdO3JldHVybiBifWZ1bmN0aW9uIHJhKGEsYil7Zm9yKHZhciBjPS0xLGU9YS5sZW5ndGg7KytjPGUmJmZhbHNlIT09YihhW2NdLGMsYSk7KTtyZXR1cm4gYX1mdW5jdGlvbiBUYShhLGIpe2Zvcih2YXIgYz0tMSxlPWEubGVuZ3RoOysrYzxlOylpZihiKGFbY10sYyxhKSlyZXR1cm4gdHJ1ZTtyZXR1cm4gZmFsc2V9ZnVuY3Rpb24gc2EoYSxiKXt2YXIgYztpZihudWxsPT1iKWM9YTtlbHNle2M9QyhiKTt2YXIgZT1hO2V8fChlPXt9KTtmb3IodmFyIGQ9LTEsZj1jLmxlbmd0aDsrK2Q8Zjspe3ZhciBoPWNbZF07ZVtoXT1iW2hdfWM9ZX1yZXR1cm4gY31mdW5jdGlvbiB0YShhLGIsYyl7dmFyIGU9dHlwZW9mIGE7cmV0dXJuXCJmdW5jdGlvblwiPT1cbmU/Yj09PXA/YTp1YShhLGIsYyk6bnVsbD09YT9oYTpcIm9iamVjdFwiPT1lP3ZhKGEpOmI9PT1wP3dhKGEpOlVhKGEsYil9ZnVuY3Rpb24geGEoYSxiLGMsZSxkLGYsaCl7dmFyIGc7YyYmKGc9ZD9jKGEsZSxkKTpjKGEpKTtpZihnIT09cClyZXR1cm4gZztpZighdihhKSlyZXR1cm4gYTtpZihlPXkoYSkpe2lmKGc9VmEoYSksIWIpcmV0dXJuIFNhKGEsZyl9ZWxzZXt2YXIgbD1BLmNhbGwoYSksbT1sPT1IO2lmKGw9PXR8fGw9PUl8fG0mJiFkKXtpZihRKGEpKXJldHVybiBkP2E6e307Zz1XYShtP3t9OmEpO2lmKCFiKXJldHVybiBzYShnLGEpfWVsc2UgcmV0dXJuIHFbbF0/WGEoYSxsLGIpOmQ/YTp7fX1mfHwoZj1bXSk7aHx8KGg9W10pO2ZvcihkPWYubGVuZ3RoO2QtLTspaWYoZltkXT09YSlyZXR1cm4gaFtkXTtmLnB1c2goYSk7aC5wdXNoKGcpOyhlP3JhOllhKShhLGZ1bmN0aW9uKGQsZSl7Z1tlXT14YShkLGIsYyxlLGEsZixoKX0pO3JldHVybiBnfWZ1bmN0aW9uIFlhKGEsYil7cmV0dXJuIFphKGEsXG5iLEMpfWZ1bmN0aW9uIHlhKGEsYixjKXtpZihudWxsIT1hKXthPXooYSk7YyE9PXAmJmMgaW4gYSYmKGI9W2NdKTtjPTA7Zm9yKHZhciBlPWIubGVuZ3RoO251bGwhPWEmJmM8ZTspYT16KGEpW2JbYysrXV07cmV0dXJuIGMmJmM9PWU/YTpwfX1mdW5jdGlvbiBpYShhLGIsYyxlLGQsZil7aWYoYT09PWIpYT10cnVlO2Vsc2UgaWYobnVsbD09YXx8bnVsbD09Ynx8IXYoYSkmJiFCKGIpKWE9YSE9PWEmJmIhPT1iO2Vsc2UgYTp7dmFyIGg9aWEsZz15KGEpLGw9eShiKSxtPUYsaz1GO2d8fChtPUEuY2FsbChhKSxtPT1JP209dDptIT10JiYoZz1qYShhKSkpO2x8fChrPUEuY2FsbChiKSxrPT1JP2s9dDprIT10JiZqYShiKSk7dmFyIHA9bT09dCYmIVEoYSksbD1rPT10JiYhUShiKSxrPW09PWs7aWYoIWt8fGd8fHApe2lmKCFlJiYobT1wJiZ1LmNhbGwoYSxcIl9fd3JhcHBlZF9fXCIpLGw9bCYmdS5jYWxsKGIsXCJfX3dyYXBwZWRfX1wiKSxtfHxsKSl7YT1oKG0/YS52YWx1ZSgpOmEsbD9iLnZhbHVlKCk6XG5iLGMsZSxkLGYpO2JyZWFrIGF9aWYoayl7ZHx8KGQ9W10pO2Z8fChmPVtdKTtmb3IobT1kLmxlbmd0aDttLS07KWlmKGRbbV09PWEpe2E9ZlttXT09YjticmVhayBhfWQucHVzaChhKTtmLnB1c2goYik7YT0oZz8kYTphYikoYSxiLGgsYyxlLGQsZik7ZC5wb3AoKTtmLnBvcCgpfWVsc2UgYT1mYWxzZX1lbHNlIGE9YmIoYSxiLG0pfXJldHVybiBhfWZ1bmN0aW9uIGNiKGEsYil7dmFyIGM9Yi5sZW5ndGgsZT1jO2lmKG51bGw9PWEpcmV0dXJuIWU7Zm9yKGE9eihhKTtjLS07KXt2YXIgZD1iW2NdO2lmKGRbMl0/ZFsxXSE9PWFbZFswXV06IShkWzBdaW4gYSkpcmV0dXJuIGZhbHNlfWZvcig7KytjPGU7KXt2YXIgZD1iW2NdLGY9ZFswXSxoPWFbZl0sZz1kWzFdO2lmKGRbMl0pe2lmKGg9PT1wJiYhKGYgaW4gYSkpcmV0dXJuIGZhbHNlfWVsc2UgaWYoZD1wLGQ9PT1wPyFpYShnLGgsdm9pZCAwLHRydWUpOiFkKXJldHVybiBmYWxzZX1yZXR1cm4gdHJ1ZX1mdW5jdGlvbiB2YShhKXt2YXIgYj1kYihhKTtpZigxPT1iLmxlbmd0aCYmXG5iWzBdWzJdKXt2YXIgYz1iWzBdWzBdLGU9YlswXVsxXTtyZXR1cm4gZnVuY3Rpb24oYSl7aWYobnVsbD09YSlyZXR1cm4gZmFsc2U7YT16KGEpO3JldHVybiBhW2NdPT09ZSYmKGUhPT1wfHxjIGluIGEpfX1yZXR1cm4gZnVuY3Rpb24oYSl7cmV0dXJuIGNiKGEsYil9fWZ1bmN0aW9uIFVhKGEsYil7dmFyIGM9eShhKSxlPXphKGEpJiZiPT09YiYmIXYoYiksZD1hK1wiXCI7YT1BYShhKTtyZXR1cm4gZnVuY3Rpb24oZil7aWYobnVsbD09ZilyZXR1cm4gZmFsc2U7dmFyIGg9ZDtmPXooZik7aWYoISghYyYmZXx8aCBpbiBmKSl7aWYoMSE9YS5sZW5ndGgpe3ZhciBoPWEsZz0wLGw9LTEsbT0tMSxrPWgubGVuZ3RoLGc9bnVsbD09Zz8wOitnfHwwOzA+ZyYmKGc9LWc+az8wOmsrZyk7bD1sPT09cHx8bD5rP2s6K2x8fDA7MD5sJiYobCs9ayk7az1nPmw/MDpsLWc+Pj4wO2c+Pj49MDtmb3IobD1BcnJheShrKTsrK208azspbFttXT1oW20rZ107Zj15YShmLGwpfWlmKG51bGw9PWYpcmV0dXJuIGZhbHNlO2g9QmEoYSk7XG5mPXooZil9cmV0dXJuIGZbaF09PT1iP2IhPT1wfHxoIGluIGY6aWEoYixmW2hdLHAsdHJ1ZSl9fWZ1bmN0aW9uIENhKGEpe3JldHVybiBmdW5jdGlvbihiKXtyZXR1cm4gbnVsbD09Yj9wOnooYilbYV19fWZ1bmN0aW9uIGViKGEpe3ZhciBiPWErXCJcIjthPUFhKGEpO3JldHVybiBmdW5jdGlvbihjKXtyZXR1cm4geWEoYyxhLGIpfX1mdW5jdGlvbiB1YShhLGIsYyl7aWYodHlwZW9mIGEhPVwiZnVuY3Rpb25cIilyZXR1cm4gaGE7aWYoYj09PXApcmV0dXJuIGE7c3dpdGNoKGMpe2Nhc2UgMTpyZXR1cm4gZnVuY3Rpb24oYyl7cmV0dXJuIGEuY2FsbChiLGMpfTtjYXNlIDM6cmV0dXJuIGZ1bmN0aW9uKGMsZCxmKXtyZXR1cm4gYS5jYWxsKGIsYyxkLGYpfTtjYXNlIDQ6cmV0dXJuIGZ1bmN0aW9uKGMsZCxmLGgpe3JldHVybiBhLmNhbGwoYixjLGQsZixoKX07Y2FzZSA1OnJldHVybiBmdW5jdGlvbihjLGQsZixoLGcpe3JldHVybiBhLmNhbGwoYixjLGQsZixoLGcpfX1yZXR1cm4gZnVuY3Rpb24oKXtyZXR1cm4gYS5hcHBseShiLFxuYXJndW1lbnRzKX19ZnVuY3Rpb24gRGEoYSl7dmFyIGI9bmV3IGZiKGEuYnl0ZUxlbmd0aCk7KG5ldyBrYShiKSkuc2V0KG5ldyBrYShhKSk7cmV0dXJuIGJ9ZnVuY3Rpb24gJGEoYSxiLGMsZSxkLGYsaCl7dmFyIGc9LTEsbD1hLmxlbmd0aCxtPWIubGVuZ3RoO2lmKGwhPW0mJiEoZCYmbT5sKSlyZXR1cm4gZmFsc2U7Zm9yKDsrK2c8bDspe3ZhciBrPWFbZ10sbT1iW2ddLG49ZT9lKGQ/bTprLGQ/azptLGcpOnA7aWYobiE9PXApe2lmKG4pY29udGludWU7cmV0dXJuIGZhbHNlfWlmKGQpe2lmKCFUYShiLGZ1bmN0aW9uKGEpe3JldHVybiBrPT09YXx8YyhrLGEsZSxkLGYsaCl9KSlyZXR1cm4gZmFsc2V9ZWxzZSBpZihrIT09bSYmIWMoayxtLGUsZCxmLGgpKXJldHVybiBmYWxzZX1yZXR1cm4gdHJ1ZX1mdW5jdGlvbiBiYihhLGIsYyl7c3dpdGNoKGMpe2Nhc2UgSjpjYXNlIEs6cmV0dXJuK2E9PStiO2Nhc2UgTDpyZXR1cm4gYS5uYW1lPT1iLm5hbWUmJmEubWVzc2FnZT09Yi5tZXNzYWdlO2Nhc2UgTTpyZXR1cm4gYSE9XG4rYT9iIT0rYjphPT0rYjtjYXNlIE46Y2FzZSBEOnJldHVybiBhPT1iK1wiXCJ9cmV0dXJuIGZhbHNlfWZ1bmN0aW9uIGFiKGEsYixjLGUsZCxmLGgpe3ZhciBnPUMoYSksbD1nLmxlbmd0aCxtPUMoYikubGVuZ3RoO2lmKGwhPW0mJiFkKXJldHVybiBmYWxzZTtmb3IobT1sO20tLTspe3ZhciBrPWdbbV07aWYoIShkP2sgaW4gYjp1LmNhbGwoYixrKSkpcmV0dXJuIGZhbHNlfWZvcih2YXIgbj1kOysrbTxsOyl7dmFyIGs9Z1ttXSxxPWFba10scj1iW2tdLHM9ZT9lKGQ/cjpxLGQ/cTpyLGspOnA7aWYocz09PXA/IWMocSxyLGUsZCxmLGgpOiFzKXJldHVybiBmYWxzZTtufHwobj1cImNvbnN0cnVjdG9yXCI9PWspfXJldHVybiBufHwoYz1hLmNvbnN0cnVjdG9yLGU9Yi5jb25zdHJ1Y3RvciwhKGMhPWUmJlwiY29uc3RydWN0b3JcImluIGEmJlwiY29uc3RydWN0b3JcImluIGIpfHx0eXBlb2YgYz09XCJmdW5jdGlvblwiJiZjIGluc3RhbmNlb2YgYyYmdHlwZW9mIGU9PVwiZnVuY3Rpb25cIiYmZSBpbnN0YW5jZW9mIGUpP3RydWU6ZmFsc2V9ZnVuY3Rpb24gZGIoYSl7YT1cbkVhKGEpO2Zvcih2YXIgYj1hLmxlbmd0aDtiLS07KXt2YXIgYz1hW2JdWzFdO2FbYl1bMl09Yz09PWMmJiF2KGMpfXJldHVybiBhfWZ1bmN0aW9uIEZhKGEsYil7dmFyIGM9bnVsbD09YT9wOmFbYl07cmV0dXJuIEdhKGMpP2M6cH1mdW5jdGlvbiBWYShhKXt2YXIgYj1hLmxlbmd0aCxjPW5ldyBhLmNvbnN0cnVjdG9yKGIpO2ImJlwic3RyaW5nXCI9PXR5cGVvZiBhWzBdJiZ1LmNhbGwoYSxcImluZGV4XCIpJiYoYy5pbmRleD1hLmluZGV4LGMuaW5wdXQ9YS5pbnB1dCk7cmV0dXJuIGN9ZnVuY3Rpb24gV2EoYSl7YT1hLmNvbnN0cnVjdG9yO3R5cGVvZiBhPT1cImZ1bmN0aW9uXCImJmEgaW5zdGFuY2VvZiBhfHwoYT1PYmplY3QpO3JldHVybiBuZXcgYX1mdW5jdGlvbiBYYShhLGIsYyl7dmFyIGU9YS5jb25zdHJ1Y3Rvcjtzd2l0Y2goYil7Y2FzZSBsYTpyZXR1cm4gRGEoYSk7Y2FzZSBKOmNhc2UgSzpyZXR1cm4gbmV3IGUoK2EpO2Nhc2UgUjpjYXNlIFM6Y2FzZSBUOmNhc2UgVTpjYXNlIFY6Y2FzZSBXOmNhc2UgWDpjYXNlIFk6Y2FzZSBaOnJldHVybiBlIGluc3RhbmNlb2ZcbmUmJihlPXdbYl0pLGI9YS5idWZmZXIsbmV3IGUoYz9EYShiKTpiLGEuYnl0ZU9mZnNldCxhLmxlbmd0aCk7Y2FzZSBNOmNhc2UgRDpyZXR1cm4gbmV3IGUoYSk7Y2FzZSBOOnZhciBkPW5ldyBlKGEuc291cmNlLGdiLmV4ZWMoYSkpO2QubGFzdEluZGV4PWEubGFzdEluZGV4fXJldHVybiBkfWZ1bmN0aW9uICQoYSxiKXthPXR5cGVvZiBhPT1cIm51bWJlclwifHxoYi50ZXN0KGEpPythOi0xO2I9bnVsbD09Yj9IYTpiO3JldHVybi0xPGEmJjA9PWElMSYmYTxifWZ1bmN0aW9uIElhKGEsYixjKXtpZighdihjKSlyZXR1cm4gZmFsc2U7dmFyIGU9dHlwZW9mIGI7cmV0dXJuKFwibnVtYmVyXCI9PWU/bnVsbCE9YyYmRShtYShjKSkmJiQoYixjLmxlbmd0aCk6XCJzdHJpbmdcIj09ZSYmYiBpbiBjKT8oYj1jW2JdLGE9PT1hP2E9PT1iOmIhPT1iKTpmYWxzZX1mdW5jdGlvbiB6YShhKXt2YXIgYj10eXBlb2YgYTtyZXR1cm5cInN0cmluZ1wiPT1iJiZpYi50ZXN0KGEpfHxcIm51bWJlclwiPT1iP3RydWU6eShhKT9mYWxzZTohamIudGVzdChhKXx8XG4hMX1mdW5jdGlvbiBFKGEpe3JldHVybiB0eXBlb2YgYT09XCJudW1iZXJcIiYmLTE8YSYmMD09YSUxJiZhPD1IYX1mdW5jdGlvbiBKYShhKXtmb3IodmFyIGI9S2EoYSksYz1iLmxlbmd0aCxlPWMmJmEubGVuZ3RoLGQ9ISFlJiZFKGUpJiYoeShhKXx8bmEoYSl8fGFhKGEpKSxmPS0xLGg9W107KytmPGM7KXt2YXIgZz1iW2ZdOyhkJiYkKGcsZSl8fHUuY2FsbChhLGcpKSYmaC5wdXNoKGcpfXJldHVybiBofWZ1bmN0aW9uIHooYSl7aWYobi5zdXBwb3J0LnVuaW5kZXhlZENoYXJzJiZhYShhKSl7Zm9yKHZhciBiPS0xLGM9YS5sZW5ndGgsZT1PYmplY3QoYSk7KytiPGM7KWVbYl09YS5jaGFyQXQoYik7cmV0dXJuIGV9cmV0dXJuIHYoYSk/YTpPYmplY3QoYSl9ZnVuY3Rpb24gQWEoYSl7aWYoeShhKSlyZXR1cm4gYTt2YXIgYj1bXTsobnVsbD09YT9cIlwiOmErXCJcIikucmVwbGFjZShrYixmdW5jdGlvbihhLGUsZCxmKXtiLnB1c2goZD9mLnJlcGxhY2UobGIsXCIkMVwiKTplfHxhKX0pO3JldHVybiBifVxuZnVuY3Rpb24gQmEoYSl7dmFyIGI9YT9hLmxlbmd0aDowO3JldHVybiBiP2FbYi0xXTpwfWZ1bmN0aW9uIG9hKGEsYil7aWYodHlwZW9mIGEhPVwiZnVuY3Rpb25cIil0aHJvdyBuZXcgVHlwZUVycm9yKG1iKTtiPUxhKGI9PT1wP2EubGVuZ3RoLTE6K2J8fDAsMCk7cmV0dXJuIGZ1bmN0aW9uKCl7Zm9yKHZhciBjPWFyZ3VtZW50cyxlPS0xLGQ9TGEoYy5sZW5ndGgtYiwwKSxmPUFycmF5KGQpOysrZTxkOylmW2VdPWNbYitlXTtzd2l0Y2goYil7Y2FzZSAwOnJldHVybiBhLmNhbGwodGhpcyxmKTtjYXNlIDE6cmV0dXJuIGEuY2FsbCh0aGlzLGNbMF0sZik7Y2FzZSAyOnJldHVybiBhLmNhbGwodGhpcyxjWzBdLGNbMV0sZil9ZD1BcnJheShiKzEpO2ZvcihlPS0xOysrZTxiOylkW2VdPWNbZV07ZFtiXT1mO3JldHVybiBhLmFwcGx5KHRoaXMsZCl9fWZ1bmN0aW9uIG5hKGEpe3JldHVybiBCKGEpJiZudWxsIT1hJiZFKG1hKGEpKSYmdS5jYWxsKGEsXCJjYWxsZWVcIikmJiFiYS5jYWxsKGEsXCJjYWxsZWVcIil9XG5mdW5jdGlvbiBjYShhKXtyZXR1cm4gdihhKSYmQS5jYWxsKGEpPT1IfWZ1bmN0aW9uIHYoYSl7dmFyIGI9dHlwZW9mIGE7cmV0dXJuISFhJiYoXCJvYmplY3RcIj09Ynx8XCJmdW5jdGlvblwiPT1iKX1mdW5jdGlvbiBHYShhKXtyZXR1cm4gbnVsbD09YT9mYWxzZTpjYShhKT9NYS50ZXN0KE5hLmNhbGwoYSkpOkIoYSkmJihRKGEpP01hOm5iKS50ZXN0KGEpfWZ1bmN0aW9uIGFhKGEpe3JldHVybiB0eXBlb2YgYT09XCJzdHJpbmdcInx8QihhKSYmQS5jYWxsKGEpPT1EfWZ1bmN0aW9uIGphKGEpe3JldHVybiBCKGEpJiZFKGEubGVuZ3RoKSYmISFyW0EuY2FsbChhKV19ZnVuY3Rpb24gS2EoYSl7aWYobnVsbD09YSlyZXR1cm5bXTt2KGEpfHwoYT1PYmplY3QoYSkpO2Zvcih2YXIgYj1hLmxlbmd0aCxjPW4uc3VwcG9ydCxiPWImJkUoYikmJih5KGEpfHxuYShhKXx8YWEoYSkpJiZifHwwLGU9YS5jb25zdHJ1Y3RvcixkPS0xLGU9Y2EoZSkmJmUucHJvdG90eXBlfHxHLGY9ZT09PWEsaD1BcnJheShiKSxnPVxuMDxiLGw9Yy5lbnVtRXJyb3JQcm9wcyYmKGE9PT1kYXx8YSBpbnN0YW5jZW9mIEVycm9yKSxtPWMuZW51bVByb3RvdHlwZXMmJmNhKGEpOysrZDxiOyloW2RdPWQrXCJcIjtmb3IodmFyIGsgaW4gYSltJiZcInByb3RvdHlwZVwiPT1rfHxsJiYoXCJtZXNzYWdlXCI9PWt8fFwibmFtZVwiPT1rKXx8ZyYmJChrLGIpfHxcImNvbnN0cnVjdG9yXCI9PWsmJihmfHwhdS5jYWxsKGEsaykpfHxoLnB1c2goayk7aWYoYy5ub25FbnVtU2hhZG93cyYmYSE9PUcpZm9yKGI9YT09PW9iP0Q6YT09PWRhP0w6QS5jYWxsKGEpLGM9c1tiXXx8c1t0XSxiPT10JiYoZT1HKSxiPXBhLmxlbmd0aDtiLS07KWs9cGFbYl0sZD1jW2tdLGYmJmR8fChkPyF1LmNhbGwoYSxrKTphW2tdPT09ZVtrXSl8fGgucHVzaChrKTtyZXR1cm4gaH1mdW5jdGlvbiBFYShhKXthPXooYSk7Zm9yKHZhciBiPS0xLGM9QyhhKSxlPWMubGVuZ3RoLGQ9QXJyYXkoZSk7KytiPGU7KXt2YXIgZj1jW2JdO2RbYl09W2YsYVtmXV19cmV0dXJuIGR9ZnVuY3Rpb24gZWEoYSxcbmIsYyl7YyYmSWEoYSxiLGMpJiYoYj1wKTtyZXR1cm4gQihhKT9PYShhKTp0YShhLGIpfWZ1bmN0aW9uIGhhKGEpe3JldHVybiBhfWZ1bmN0aW9uIE9hKGEpe3JldHVybiB2YSh4YShhLHRydWUpKX1mdW5jdGlvbiB3YShhKXtyZXR1cm4gemEoYSk/Q2EoYSk6ZWIoYSl9dmFyIHAsbWI9XCJFeHBlY3RlZCBhIGZ1bmN0aW9uXCIsST1cIltvYmplY3QgQXJndW1lbnRzXVwiLEY9XCJbb2JqZWN0IEFycmF5XVwiLEo9XCJbb2JqZWN0IEJvb2xlYW5dXCIsSz1cIltvYmplY3QgRGF0ZV1cIixMPVwiW29iamVjdCBFcnJvcl1cIixIPVwiW29iamVjdCBGdW5jdGlvbl1cIixNPVwiW29iamVjdCBOdW1iZXJdXCIsdD1cIltvYmplY3QgT2JqZWN0XVwiLE49XCJbb2JqZWN0IFJlZ0V4cF1cIixEPVwiW29iamVjdCBTdHJpbmddXCIsbGE9XCJbb2JqZWN0IEFycmF5QnVmZmVyXVwiLFI9XCJbb2JqZWN0IEZsb2F0MzJBcnJheV1cIixTPVwiW29iamVjdCBGbG9hdDY0QXJyYXldXCIsVD1cIltvYmplY3QgSW50OEFycmF5XVwiLFU9XCJbb2JqZWN0IEludDE2QXJyYXldXCIsXG5WPVwiW29iamVjdCBJbnQzMkFycmF5XVwiLFc9XCJbb2JqZWN0IFVpbnQ4QXJyYXldXCIsWD1cIltvYmplY3QgVWludDhDbGFtcGVkQXJyYXldXCIsWT1cIltvYmplY3QgVWludDE2QXJyYXldXCIsWj1cIltvYmplY3QgVWludDMyQXJyYXldXCIsamI9L1xcLnxcXFsoPzpbXltcXF1dKnwoW1wiJ10pKD86KD8hXFwxKVteXFxuXFxcXF18XFxcXC4pKj9cXDEpXFxdLyxpYj0vXlxcdyokLyxrYj0vW14uW1xcXV0rfFxcWyg/OigtP1xcZCsoPzpcXC5cXGQrKT8pfChbXCInXSkoKD86KD8hXFwyKVteXFxuXFxcXF18XFxcXC4pKj8pXFwyKVxcXS9nLGxiPS9cXFxcKFxcXFwpPy9nLGdiPS9cXHcqJC8sbmI9L15cXFtvYmplY3QgLis/Q29uc3RydWN0b3JcXF0kLyxoYj0vXlxcZCskLyxwYT1cImNvbnN0cnVjdG9yIGhhc093blByb3BlcnR5IGlzUHJvdG90eXBlT2YgcHJvcGVydHlJc0VudW1lcmFibGUgdG9Mb2NhbGVTdHJpbmcgdG9TdHJpbmcgdmFsdWVPZlwiLnNwbGl0KFwiIFwiKSxyPXt9O3JbUl09cltTXT1yW1RdPXJbVV09cltWXT1yW1ddPXJbWF09cltZXT1yW1pdPXRydWU7XG5yW0ldPXJbRl09cltsYV09cltKXT1yW0tdPXJbTF09cltIXT1yW1wiW29iamVjdCBNYXBdXCJdPXJbTV09clt0XT1yW05dPXJbXCJbb2JqZWN0IFNldF1cIl09cltEXT1yW1wiW29iamVjdCBXZWFrTWFwXVwiXT1mYWxzZTt2YXIgcT17fTtxW0ldPXFbRl09cVtsYV09cVtKXT1xW0tdPXFbUl09cVtTXT1xW1RdPXFbVV09cVtWXT1xW01dPXFbdF09cVtOXT1xW0RdPXFbV109cVtYXT1xW1ldPXFbWl09dHJ1ZTtxW0xdPXFbSF09cVtcIltvYmplY3QgTWFwXVwiXT1xW1wiW29iamVjdCBTZXRdXCJdPXFbXCJbb2JqZWN0IFdlYWtNYXBdXCJdPWZhbHNlO3ZhciBmYT17XCJmdW5jdGlvblwiOnRydWUsb2JqZWN0OnRydWV9LGdhPWZhW3R5cGVvZiBleHBvcnRzXSYmZXhwb3J0cyYmIWV4cG9ydHMubm9kZVR5cGUmJmV4cG9ydHMsTz1mYVt0eXBlb2YgbW9kdWxlXSYmbW9kdWxlJiYhbW9kdWxlLm5vZGVUeXBlJiZtb2R1bGUscGI9ZmFbdHlwZW9mIHNlbGZdJiZzZWxmJiZzZWxmLk9iamVjdCYmc2VsZixQYT1mYVt0eXBlb2Ygd2luZG93XSYmXG53aW5kb3cmJndpbmRvdy5PYmplY3QmJndpbmRvdyxxYj1PJiZPLmV4cG9ydHM9PT1nYSYmZ2EseD1nYSYmTyYmdHlwZW9mIGdsb2JhbD09XCJvYmplY3RcIiYmZ2xvYmFsJiZnbG9iYWwuT2JqZWN0JiZnbG9iYWx8fFBhIT09KHRoaXMmJnRoaXMud2luZG93KSYmUGF8fHBifHx0aGlzLFE9ZnVuY3Rpb24oKXt0cnl7T2JqZWN0KHt0b1N0cmluZzowfStcIlwiKX1jYXRjaChhKXtyZXR1cm4gZnVuY3Rpb24oKXtyZXR1cm4gZmFsc2V9fXJldHVybiBmdW5jdGlvbihhKXtyZXR1cm4gdHlwZW9mIGEudG9TdHJpbmchPVwiZnVuY3Rpb25cIiYmdHlwZW9mKGErXCJcIik9PVwic3RyaW5nXCJ9fSgpLHJiPUFycmF5LnByb3RvdHlwZSxkYT1FcnJvci5wcm90b3R5cGUsRz1PYmplY3QucHJvdG90eXBlLG9iPVN0cmluZy5wcm90b3R5cGUsTmE9RnVuY3Rpb24ucHJvdG90eXBlLnRvU3RyaW5nLHU9Ry5oYXNPd25Qcm9wZXJ0eSxBPUcudG9TdHJpbmcsTWE9UmVnRXhwKFwiXlwiK05hLmNhbGwodSkucmVwbGFjZSgvW1xcXFxeJC4qKz8oKVtcXF17fXxdL2csXG5cIlxcXFwkJlwiKS5yZXBsYWNlKC9oYXNPd25Qcm9wZXJ0eXwoZnVuY3Rpb24pLio/KD89XFxcXFxcKCl8IGZvciAuKz8oPz1cXFxcXFxdKS9nLFwiJDEuKj9cIikrXCIkXCIpLGZiPXguQXJyYXlCdWZmZXIsYmE9Ry5wcm9wZXJ0eUlzRW51bWVyYWJsZSxRYT1yYi5zcGxpY2Usa2E9eC5VaW50OEFycmF5LHNiPUZhKEFycmF5LFwiaXNBcnJheVwiKSxSYT1GYShPYmplY3QsXCJrZXlzXCIpLExhPU1hdGgubWF4LEhhPTkwMDcxOTkyNTQ3NDA5OTEsdz17fTt3W1JdPXguRmxvYXQzMkFycmF5O3dbU109eC5GbG9hdDY0QXJyYXk7d1tUXT14LkludDhBcnJheTt3W1VdPXguSW50MTZBcnJheTt3W1ZdPXguSW50MzJBcnJheTt3W1ddPWthO3dbWF09eC5VaW50OENsYW1wZWRBcnJheTt3W1ldPXguVWludDE2QXJyYXk7d1taXT14LlVpbnQzMkFycmF5O3ZhciBzPXt9O3NbRl09c1tLXT1zW01dPXtjb25zdHJ1Y3Rvcjp0cnVlLHRvTG9jYWxlU3RyaW5nOnRydWUsdG9TdHJpbmc6dHJ1ZSx2YWx1ZU9mOnRydWV9O3NbSl09c1tEXT17Y29uc3RydWN0b3I6dHJ1ZSxcbnRvU3RyaW5nOnRydWUsdmFsdWVPZjp0cnVlfTtzW0xdPXNbSF09c1tOXT17Y29uc3RydWN0b3I6dHJ1ZSx0b1N0cmluZzp0cnVlfTtzW3RdPXtjb25zdHJ1Y3Rvcjp0cnVlfTtyYShwYSxmdW5jdGlvbihhKXtmb3IodmFyIGIgaW4gcylpZih1LmNhbGwocyxiKSl7dmFyIGM9c1tiXTtjW2FdPXUuY2FsbChjLGEpfX0pO3ZhciBQPW4uc3VwcG9ydD17fTsoZnVuY3Rpb24oYSl7ZnVuY3Rpb24gYigpe3RoaXMueD1hfXZhciBjPXswOmEsbGVuZ3RoOmF9LGU9W107Yi5wcm90b3R5cGU9e3ZhbHVlT2Y6YSx5OmF9O2Zvcih2YXIgZCBpbiBuZXcgYillLnB1c2goZCk7UC5lbnVtRXJyb3JQcm9wcz1iYS5jYWxsKGRhLFwibWVzc2FnZVwiKXx8YmEuY2FsbChkYSxcIm5hbWVcIik7UC5lbnVtUHJvdG90eXBlcz1iYS5jYWxsKGIsXCJwcm90b3R5cGVcIik7UC5ub25FbnVtU2hhZG93cz0hL3ZhbHVlT2YvLnRlc3QoZSk7UC5zcGxpY2VPYmplY3RzPShRYS5jYWxsKGMsMCwxKSwhY1swXSk7UC51bmluZGV4ZWRDaGFycz1cInh4XCIhPVwieFwiWzBdK1xuT2JqZWN0KFwieFwiKVswXX0pKDEsMCk7dmFyIFphPWZ1bmN0aW9uKGEpe3JldHVybiBmdW5jdGlvbihiLGMsZSl7dmFyIGQ9eihiKTtlPWUoYik7Zm9yKHZhciBmPWUubGVuZ3RoLGg9YT9mOi0xO2E/aC0tOisraDxmOyl7dmFyIGc9ZVtoXTtpZihmYWxzZT09PWMoZFtnXSxnLGQpKWJyZWFrfXJldHVybiBifX0oKSxtYT1DYShcImxlbmd0aFwiKSx5PXNifHxmdW5jdGlvbihhKXtyZXR1cm4gQihhKSYmRShhLmxlbmd0aCkmJkEuY2FsbChhKT09Rn0scWE9ZnVuY3Rpb24oYSl7cmV0dXJuIG9hKGZ1bmN0aW9uKGIsYyl7dmFyIGU9LTEsZD1udWxsPT1iPzA6Yy5sZW5ndGgsZj0yPGQ/Y1tkLTJdOnAsaD0yPGQ/Y1syXTpwLGc9MTxkP2NbZC0xXTpwO3R5cGVvZiBmPT1cImZ1bmN0aW9uXCI/KGY9dWEoZixnLDUpLGQtPTIpOihmPXR5cGVvZiBnPT1cImZ1bmN0aW9uXCI/ZzpwLGQtPWY/MTowKTtoJiZJYShjWzBdLGNbMV0saCkmJihmPTM+ZD9wOmYsZD0xKTtmb3IoOysrZTxkOykoaD1jW2VdKSYmYShiLGgsXG5mKTtyZXR1cm4gYn0pfShmdW5jdGlvbihhLGIsYyl7aWYoYylmb3IodmFyIGU9LTEsZD1DKGIpLGY9ZC5sZW5ndGg7KytlPGY7KXt2YXIgaD1kW2VdLGc9YVtoXSxsPWMoZyxiW2hdLGgsYSxiKTsobD09PWw/bD09PWc6ZyE9PWcpJiYoZyE9PXB8fGggaW4gYSl8fChhW2hdPWwpfWVsc2UgYT1zYShhLGIpO3JldHVybiBhfSksdGI9ZnVuY3Rpb24oYSxiKXtyZXR1cm4gb2EoZnVuY3Rpb24oYyl7dmFyIGU9Y1swXTtpZihudWxsPT1lKXJldHVybiBlO2MucHVzaChiKTtyZXR1cm4gYS5hcHBseShwLGMpfSl9KHFhLGZ1bmN0aW9uKGEsYil7cmV0dXJuIGE9PT1wP2I6YX0pLEM9UmE/ZnVuY3Rpb24oYSl7dmFyIGI9bnVsbD09YT9wOmEuY29uc3RydWN0b3I7cmV0dXJuIHR5cGVvZiBiPT1cImZ1bmN0aW9uXCImJmIucHJvdG90eXBlPT09YXx8KHR5cGVvZiBhPT1cImZ1bmN0aW9uXCI/bi5zdXBwb3J0LmVudW1Qcm90b3R5cGVzOm51bGwhPWEmJkUobWEoYSkpKT9KYShhKTp2KGEpP1JhKGEpOltdfTpcbkphO24uYXNzaWduPXFhO24uY2FsbGJhY2s9ZWE7bi5kZWZhdWx0cz10YjtuLmtleXM9QztuLmtleXNJbj1LYTtuLm1hdGNoZXM9T2E7bi5wYWlycz1FYTtuLnByb3BlcnR5PXdhO24ucmVtb3ZlPWZ1bmN0aW9uKGEsYixjKXt2YXIgZT1bXTtpZighYXx8IWEubGVuZ3RoKXJldHVybiBlO3ZhciBkPS0xLGY9W10saD1hLmxlbmd0aCxnPW4uY2FsbGJhY2t8fGVhLGc9Zz09PWVhP3RhOmc7Zm9yKGI9ZyhiLGMsMyk7KytkPGg7KWM9YVtkXSxiKGMsZCxhKSYmKGUucHVzaChjKSxmLnB1c2goZCkpO2ZvcihiPWE/Zi5sZW5ndGg6MDtiLS07KWlmKGQ9ZltiXSxkIT1sJiYkKGQpKXt2YXIgbD1kO1FhLmNhbGwoYSxkLDEpfXJldHVybiBlfTtuLnJlc3RQYXJhbT1vYTtuLmV4dGVuZD1xYTtuLml0ZXJhdGVlPWVhO24uaWRlbnRpdHk9aGE7bi5pc0FyZ3VtZW50cz1uYTtuLmlzQXJyYXk9eTtuLmlzRnVuY3Rpb249Y2E7bi5pc05hdGl2ZT1HYTtuLmlzT2JqZWN0PXY7bi5pc1N0cmluZz1hYTtuLmlzVHlwZWRBcnJheT1cbmphO24ubGFzdD1CYTtuLlZFUlNJT049XCIzLjEwLjBcIjtnYSYmTyYmcWImJigoTy5leHBvcnRzPW4pLl89bil9LmNhbGwodGhpcykpOyJdfQ==
