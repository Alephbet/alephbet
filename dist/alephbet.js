(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["AlephBet"] = factory();
	else
		root["AlephBet"] = factory();
})(self, function() {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/basil.js/build/basil.js":
/*!**********************************************!*\
  !*** ./node_modules/basil.js/build/basil.js ***!
  \**********************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: __webpack_require__, __webpack_exports__, module */
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_RESULT__;(function () {
	// Basil
	var Basil = function (options) {
		return Basil.utils.extend({}, Basil.plugins, new Basil.Storage().init(options));
	};

	// Version
	Basil.version = '0.4.11';

	// Utils
	Basil.utils = {
		extend: function () {
			var destination = typeof arguments[0] === 'object' ? arguments[0] : {};
			for (var i = 1; i < arguments.length; i++) {
				if (arguments[i] && typeof arguments[i] === 'object')
					for (var property in arguments[i])
						destination[property] = arguments[i][property];
			}
			return destination;
		},
		each: function (obj, fnIterator, context) {
			if (this.isArray(obj)) {
				for (var i = 0; i < obj.length; i++)
					if (fnIterator.call(context, obj[i], i) === false) return;
			} else if (obj) {
				for (var key in obj)
					if (fnIterator.call(context, obj[key], key) === false) return;
			}
		},
		tryEach: function (obj, fnIterator, fnError, context) {
			this.each(obj, function (value, key) {
				try {
					return fnIterator.call(context, value, key);
				} catch (error) {
					if (this.isFunction(fnError)) {
						try {
							fnError.call(context, value, key, error);
						} catch (error) {}
					}
				}
			}, this);
		},
		registerPlugin: function (methods) {
			Basil.plugins = this.extend(methods, Basil.plugins);
		},
		getTypeOf: function (obj) {
			if (typeof obj === 'undefined' || obj === null)
				return '' + obj;
			return Object.prototype.toString.call(obj).replace(/^\[object\s(.*)\]$/, function ($0, $1) { return $1.toLowerCase(); });
		}
	};

	// Add some isType methods: isArguments, isBoolean, isFunction, isString, isArray, isNumber, isDate, isRegExp, isUndefined, isNull.
	var types = ['Arguments', 'Boolean', 'Function', 'String', 'Array', 'Number', 'Date', 'RegExp', 'Undefined', 'Null'];
	for (var i = 0; i < types.length; i++) {
		Basil.utils['is' + types[i]] = (function (type) {
			return function (obj) {
				return Basil.utils.getTypeOf(obj) === type.toLowerCase();
			};
		})(types[i]);
	}

	// Plugins
	Basil.plugins = {};

	// Options
	Basil.options = Basil.utils.extend({
		namespace: 'b45i1',
		storages: ['local', 'cookie', 'session', 'memory'],
		expireDays: 365,
		keyDelimiter: '.'
	}, window.Basil ? window.Basil.options : {});

	// Storage
	Basil.Storage = function () {
		var _salt = 'b45i1' + (Math.random() + 1)
				.toString(36)
				.substring(7),
			_storages = {},
			_isValidKey = function (key) {
				var type = Basil.utils.getTypeOf(key);
				return (type === 'string' && key) || type === 'number' || type === 'boolean';
			},
			_toStoragesArray = function (storages) {
				if (Basil.utils.isArray(storages))
					return storages;
				return Basil.utils.isString(storages) ? [storages] : [];
			},
			_toStoredKey = function (namespace, path, delimiter) {
				var key = '';
				if (_isValidKey(path)) {
					key += path;
				} else if (Basil.utils.isArray(path)) {
					path = Basil.utils.isFunction(path.filter) ? path.filter(_isValidKey) : path;
					key = path.join(delimiter);
				}
				return key && _isValidKey(namespace) ? namespace + delimiter + key : key;
 			},
			_toKeyName = function (namespace, key, delimiter) {
				if (!_isValidKey(namespace))
					return key;
				return key.replace(new RegExp('^' + namespace + delimiter), '');
			},
			_toStoredValue = function (value) {
				return JSON.stringify(value);
			},
			_fromStoredValue = function (value) {
				return value ? JSON.parse(value) : null;
			};

		// HTML5 web storage interface
		var webStorageInterface = {
			engine: null,
			check: function () {
				try {
					window[this.engine].setItem(_salt, true);
					window[this.engine].removeItem(_salt);
				} catch (e) {
					return false;
				}
				return true;
			},
			set: function (key, value, options) {
				if (!key)
					throw Error('invalid key');
				window[this.engine].setItem(key, value);
			},
			get: function (key) {
				return window[this.engine].getItem(key);
			},
			remove: function (key) {
				window[this.engine].removeItem(key);
			},
			reset: function (namespace) {
				for (var i = 0, key; i < window[this.engine].length; i++) {
					key = window[this.engine].key(i);
					if (!namespace || key.indexOf(namespace) === 0) {
						this.remove(key);
						i--;
					}
				}
			},
			keys: function (namespace, delimiter) {
				var keys = [];
				for (var i = 0, key; i < window[this.engine].length; i++) {
					key = window[this.engine].key(i);
					if (!namespace || key.indexOf(namespace) === 0)
						keys.push(_toKeyName(namespace, key, delimiter));
				}
				return keys;
			}
		};

		// local storage
		_storages.local = Basil.utils.extend({}, webStorageInterface, {
			engine: 'localStorage'
		});
		// session storage
		_storages.session = Basil.utils.extend({}, webStorageInterface, {
			engine: 'sessionStorage'
		});

		// memory storage
		_storages.memory = {
			_hash: {},
			check: function () {
				return true;
			},
			set: function (key, value, options) {
				if (!key)
					throw Error('invalid key');
				this._hash[key] = value;
			},
			get: function (key) {
				return this._hash[key] || null;
			},
			remove: function (key) {
				delete this._hash[key];
			},
			reset: function (namespace) {
				for (var key in this._hash) {
					if (!namespace || key.indexOf(namespace) === 0)
						this.remove(key);
				}
			},
			keys: function (namespace, delimiter) {
				var keys = [];
				for (var key in this._hash)
					if (!namespace || key.indexOf(namespace) === 0)
						keys.push(_toKeyName(namespace, key, delimiter));
				return keys;
			}
		};

		// cookie storage
		_storages.cookie = {
			check: function (options) {
				if (!navigator.cookieEnabled)
					return false;
				if (window.self !== window.top) {
					// we need to check third-party cookies;
					var cookie = 'thirdparty.check=' + Math.round(Math.random() * 1000);
					document.cookie = cookie + '; path=/';
					return document.cookie.indexOf(cookie) !== -1;
				}
				// if cookie secure activated, ensure it works (not the case if we are in http only)
				if (options && options.secure) {
					try {
						this.set(_salt, _salt, options);
						var hasSecurelyPersited = this.get(_salt) === _salt;
						this.remove(_salt);
						return hasSecurelyPersited;
					} catch (error) {
						return false;
					}
				}
				return true;
			},
			set: function (key, value, options) {
				if (!this.check())
					throw Error('cookies are disabled');
				options = options || {};
				if (!key)
					throw Error('invalid key');
				var cookie = encodeURIComponent(key) + '=' + encodeURIComponent(value);
				// handle expiration days
				if (options.expireDays) {
					var date = new Date();
					date.setTime(date.getTime() + (options.expireDays * 24 * 60 * 60 * 1000));
					cookie += '; expires=' + date.toGMTString();
				}
				// handle domain
				if (options.domain && options.domain !== document.domain) {
					var _domain = options.domain.replace(/^\./, '');
					if (document.domain.indexOf(_domain) === -1 || _domain.split('.').length <= 1)
						throw Error('invalid domain');
					cookie += '; domain=' + options.domain;
				}
				// handle same site
				if (options.sameSite && ['lax','strict','none'].includes(options.sameSite.toLowerCase())) {
					cookie += '; SameSite=' + options.sameSite;
				}
				// handle secure
				if (options.secure === true) {
					cookie += '; Secure';
				}
				document.cookie = cookie + '; path=/';
			},
			get: function (key) {
				if (!this.check())
					throw Error('cookies are disabled');
				var encodedKey = encodeURIComponent(key);
				var cookies = document.cookie ? document.cookie.split(';') : [];
				// retrieve last updated cookie first
				for (var i = cookies.length - 1, cookie; i >= 0; i--) {
					cookie = cookies[i].replace(/^\s*/, '');
					if (cookie.indexOf(encodedKey + '=') === 0)
						return decodeURIComponent(cookie.substring(encodedKey.length + 1, cookie.length));
				}
				return null;
			},
			remove: function (key) {
				// remove cookie from main domain
				this.set(key, '', { expireDays: -1 });
				// remove cookie from upper domains
				var domainParts = document.domain.split('.');
				for (var i = domainParts.length; i > 1; i--) {
					this.set(key, '', { expireDays: -1, domain: '.' + domainParts.slice(- i).join('.') });
				}
			},
			reset: function (namespace) {
				var cookies = document.cookie ? document.cookie.split(';') : [];
				for (var i = 0, cookie, key; i < cookies.length; i++) {
					cookie = cookies[i].replace(/^\s*/, '');
					key = cookie.substr(0, cookie.indexOf('='));
					if (!namespace || key.indexOf(namespace) === 0)
						this.remove(key);
				}
			},
			keys: function (namespace, delimiter) {
				if (!this.check())
					throw Error('cookies are disabled');
				var keys = [],
					cookies = document.cookie ? document.cookie.split(';') : [];
				for (var i = 0, cookie, key; i < cookies.length; i++) {
					cookie = cookies[i].replace(/^\s*/, '');
					key = decodeURIComponent(cookie.substr(0, cookie.indexOf('=')));
					if (!namespace || key.indexOf(namespace) === 0)
						keys.push(_toKeyName(namespace, key, delimiter));
				}
				return keys;
			}
		};

		return {
			init: function (options) {
				this.setOptions(options);
				return this;
			},
			setOptions: function (options) {
				this.options = Basil.utils.extend({}, this.options || Basil.options, options);
			},
			support: function (storage) {
				return _storages.hasOwnProperty(storage);
			},
			check: function (storage) {
				if (this.support(storage))
					return _storages[storage].check(this.options);
				return false;
			},
			set: function (key, value, options) {
				options = Basil.utils.extend({}, this.options, options);
				if (!(key = _toStoredKey(options.namespace, key, options.keyDelimiter)))
					return false;
				value = options.raw === true ? value : _toStoredValue(value);
				var where = null;
				// try to set key/value in first available storage
				Basil.utils.tryEach(_toStoragesArray(options.storages), function (storage, index) {
					_storages[storage].set(key, value, options);
					where = storage;
					return false; // break;
				}, null, this);
				if (!where) {
					// key has not been set anywhere
					return false;
				}
				// remove key from all other storages
				Basil.utils.tryEach(_toStoragesArray(options.storages), function (storage, index) {
					if (storage !== where)
						_storages[storage].remove(key);
				}, null, this);
				return true;
			},
			get: function (key, options) {
				options = Basil.utils.extend({}, this.options, options);
				if (!(key = _toStoredKey(options.namespace, key, options.keyDelimiter)))
					return null;
				var value = null;
				Basil.utils.tryEach(_toStoragesArray(options.storages), function (storage, index) {
					if (value !== null)
						return false; // break if a value has already been found.
					value = _storages[storage].get(key, options) || null;
					value = options.raw === true ? value : _fromStoredValue(value);
				}, function (storage, index, error) {
					value = null;
				}, this);
				return value;
			},
			remove: function (key, options) {
				options = Basil.utils.extend({}, this.options, options);
				if (!(key = _toStoredKey(options.namespace, key, options.keyDelimiter)))
					return;
				Basil.utils.tryEach(_toStoragesArray(options.storages), function (storage) {
					_storages[storage].remove(key);
				}, null, this);
			},
			reset: function (options) {
				options = Basil.utils.extend({}, this.options, options);
				Basil.utils.tryEach(_toStoragesArray(options.storages), function (storage) {
					_storages[storage].reset(options.namespace);
				}, null, this);
			},
			keys: function (options) {
				options = options || {};
				var keys = [];
				for (var key in this.keysMap(options))
					keys.push(key);
				return keys;
			},
			keysMap: function (options) {
				options = Basil.utils.extend({}, this.options, options);
				var map = {};
				Basil.utils.tryEach(_toStoragesArray(options.storages), function (storage) {
					Basil.utils.each(_storages[storage].keys(options.namespace, options.keyDelimiter), function (key) {
						map[key] = Basil.utils.isArray(map[key]) ? map[key] : [];
						map[key].push(storage);
					}, this);
				}, null, this);
				return map;
			}
		};
	};

	// Access to native storages, without namespace or basil value decoration
	Basil.memory = new Basil.Storage().init({ storages: 'memory', namespace: null, raw: true });
	Basil.cookie = new Basil.Storage().init({ storages: 'cookie', namespace: null, raw: true });
	Basil.localStorage = new Basil.Storage().init({ storages: 'local', namespace: null, raw: true });
	Basil.sessionStorage = new Basil.Storage().init({ storages: 'session', namespace: null, raw: true });

	// browser export
	window.Basil = Basil;

	// AMD export
	if (true) {
		!(__WEBPACK_AMD_DEFINE_RESULT__ = (function() {
			return Basil;
		}).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	// commonjs export
	} else {}

})();


/***/ }),

/***/ "./src/adapters.coffee":
/*!*****************************!*\
  !*** ./src/adapters.coffee ***!
  \*****************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: top-level-this-exports, module, __webpack_require__ */
/*! CommonJS bailout: this is used directly at 465:7-11 */
/*! CommonJS bailout: module.exports is used directly at 467:0-14 */
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Adapters, Storage, utils;
utils = __webpack_require__(/*! ./utils */ "./src/utils.coffee");
Storage = __webpack_require__(/*! ./storage */ "./src/storage.coffee");

Adapters = function () {
  var Adapters = function Adapters() {
    _classCallCheck(this, Adapters);
  };

  ; //# Adapter for using the gimel backend. See https://github.com/Alephbet/gimel
  //# uses jQuery to send data if `$.ajax` is found. Falls back on plain js xhr
  //# params:
  //# - url: Gimel track URL to post events to
  //# - namepsace: namespace for Gimel (allows setting different environments etc)
  //# - storage (optional) - storage adapter for the queue

  Adapters.GimelAdapter = function () {
    var GimelAdapter =
    /*#__PURE__*/
    function () {
      function GimelAdapter(url, namespace) {
        var storage = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Adapters.LocalStorageAdapter;

        _classCallCheck(this, GimelAdapter);

        this._storage = storage;
        this.url = url;
        this.namespace = namespace;
        this._queue = JSON.parse(this._storage.get(this.queue_name) || '[]');

        this._flush();
      }

      _createClass(GimelAdapter, [{
        key: "_remove_quuid",
        value: function _remove_quuid(quuid) {
          var _this = this;

          return function (err, res) {
            if (err) {
              return;
            }

            utils.remove(_this._queue, function (el) {
              return el.properties._quuid === quuid;
            });
            return _this._storage.set(_this.queue_name, JSON.stringify(_this._queue));
          };
        }
      }, {
        key: "_jquery_get",
        value: function _jquery_get(url, data, callback) {
          utils.log('send request using jQuery');
          return window.jQuery.ajax({
            method: 'GET',
            url: url,
            data: data,
            success: callback
          });
        }
      }, {
        key: "_plain_js_get",
        value: function _plain_js_get(url, data, callback) {
          var k, params, v, xhr;
          utils.log('fallback on plain js xhr');
          xhr = new XMLHttpRequest();

          params = function () {
            var results;
            results = [];

            for (k in data) {
              v = data[k];
              results.push("".concat(encodeURIComponent(k), "=").concat(encodeURIComponent(v)));
            }

            return results;
          }();

          params = params.join('&').replace(/%20/g, '+');
          xhr.open('GET', "".concat(url, "?").concat(params));

          xhr.onload = function () {
            if (xhr.status === 200) {
              return callback();
            }
          };

          return xhr.send();
        }
      }, {
        key: "_ajax_get",
        value: function _ajax_get(url, data, callback) {
          var ref;

          if ((ref = window.jQuery) != null ? ref.ajax : void 0) {
            return this._jquery_get(url, data, callback);
          } else {
            return this._plain_js_get(url, data, callback);
          }
        }
      }, {
        key: "_flush",
        value: function _flush() {
          var callback, i, item, len, ref, results;
          ref = this._queue;
          results = [];

          for (i = 0, len = ref.length; i < len; i++) {
            item = ref[i];
            callback = this._remove_quuid(item.properties._quuid);

            this._ajax_get(this.url, utils.omit(item.properties, '_quuid'), callback);

            results.push(null);
          }

          return results;
        }
      }, {
        key: "_user_uuid",
        value: function _user_uuid(experiment, goal) {
          if (!experiment.user_id) {
            return utils.uuid();
          }

          if (!goal.unique) {
            // if goal is not unique, we track it every time. return a new random uuid
            return utils.uuid();
          } // for a given user id, namespace and experiment, the uuid will always be the same
          // this avoids counting goals twice for the same user across different devices


          return utils.sha1("".concat(this.namespace, ".").concat(experiment.name, ".").concat(experiment.user_id));
        }
      }, {
        key: "_track",
        value: function _track(experiment, variant, goal) {
          utils.log("Persistent Queue Gimel track: ".concat(this.namespace, ", ").concat(experiment.name, ", ").concat(variant, ", ").concat(goal.name));

          if (this._queue.length > 100) {
            this._queue.shift();
          }

          this._queue.push({
            properties: {
              experiment: experiment.name,
              _quuid: utils.uuid(),
              // queue uuid (used only internally)
              uuid: this._user_uuid(experiment, goal),
              variant: variant,
              event: goal.name,
              namespace: this.namespace
            }
          });

          this._storage.set(this.queue_name, JSON.stringify(this._queue));

          return this._flush();
        }
      }, {
        key: "experiment_start",
        value: function experiment_start(experiment, variant) {
          return this._track(experiment, variant, {
            name: 'participate',
            unique: true
          });
        }
      }, {
        key: "goal_complete",
        value: function goal_complete(experiment, variant, goal_name, props) {
          return this._track(experiment, variant, utils.defaults({
            name: goal_name
          }, props));
        }
      }]);

      return GimelAdapter;
    }();

    ;
    GimelAdapter.prototype.queue_name = '_gimel_queue';
    return GimelAdapter;
  }.call(this);

  Adapters.PersistentQueueGoogleAnalyticsAdapter = function () {
    var PersistentQueueGoogleAnalyticsAdapter =
    /*#__PURE__*/
    function () {
      function PersistentQueueGoogleAnalyticsAdapter() {
        var storage = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Adapters.LocalStorageAdapter;

        _classCallCheck(this, PersistentQueueGoogleAnalyticsAdapter);

        this._storage = storage;
        this._queue = JSON.parse(this._storage.get(this.queue_name) || '[]');

        this._flush();
      }

      _createClass(PersistentQueueGoogleAnalyticsAdapter, [{
        key: "_remove_uuid",
        value: function _remove_uuid(uuid) {
          var _this2 = this;

          return function () {
            utils.remove(_this2._queue, function (el) {
              return el.uuid === uuid;
            });
            return _this2._storage.set(_this2.queue_name, JSON.stringify(_this2._queue));
          };
        }
      }, {
        key: "_flush",
        value: function _flush() {
          var callback, i, item, len, ref, results;

          if (typeof ga !== 'function') {
            throw new Error('ga not defined. Please make sure your Universal analytics is set up correctly');
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
        }
      }, {
        key: "_track",
        value: function _track(category, action, label) {
          utils.log("Persistent Queue Google Universal Analytics track: ".concat(category, ", ").concat(action, ", ").concat(label));

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
        }
      }, {
        key: "experiment_start",
        value: function experiment_start(experiment, variant) {
          return this._track(this.namespace, "".concat(experiment.name, " | ").concat(variant), 'Visitors');
        }
      }, {
        key: "goal_complete",
        value: function goal_complete(experiment, variant, goal_name, _props) {
          return this._track(this.namespace, "".concat(experiment.name, " | ").concat(variant), goal_name);
        }
      }]);

      return PersistentQueueGoogleAnalyticsAdapter;
    }();

    ;
    PersistentQueueGoogleAnalyticsAdapter.prototype.namespace = 'alephbet';
    PersistentQueueGoogleAnalyticsAdapter.prototype.queue_name = '_ga_queue';
    return PersistentQueueGoogleAnalyticsAdapter;
  }.call(this);

  Adapters.PersistentQueueKeenAdapter = function () {
    var PersistentQueueKeenAdapter =
    /*#__PURE__*/
    function () {
      function PersistentQueueKeenAdapter(keen_client) {
        var storage = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Adapters.LocalStorageAdapter;

        _classCallCheck(this, PersistentQueueKeenAdapter);

        this.client = keen_client;
        this._storage = storage;
        this._queue = JSON.parse(this._storage.get(this.queue_name) || '[]');

        this._flush();
      }

      _createClass(PersistentQueueKeenAdapter, [{
        key: "_remove_quuid",
        value: function _remove_quuid(quuid) {
          var _this3 = this;

          return function (err, res) {
            if (err) {
              return;
            }

            utils.remove(_this3._queue, function (el) {
              return el.properties._quuid === quuid;
            });
            return _this3._storage.set(_this3.queue_name, JSON.stringify(_this3._queue));
          };
        }
      }, {
        key: "_flush",
        value: function _flush() {
          var callback, i, item, len, ref, results;
          ref = this._queue;
          results = [];

          for (i = 0, len = ref.length; i < len; i++) {
            item = ref[i];
            callback = this._remove_quuid(item.properties._quuid);
            results.push(this.client.addEvent(item.experiment_name, utils.omit(item.properties, '_quuid'), callback));
          }

          return results;
        }
      }, {
        key: "_user_uuid",
        value: function _user_uuid(experiment, goal) {
          if (!experiment.user_id) {
            return utils.uuid();
          }

          if (!goal.unique) {
            // if goal is not unique, we track it every time. return a new random uuid
            return utils.uuid();
          } // for a given user id, namespace and experiment, the uuid will always be the same
          // this avoids counting goals twice for the same user across different devices


          return utils.sha1("".concat(this.namespace, ".").concat(experiment.name, ".").concat(experiment.user_id));
        }
      }, {
        key: "_track",
        value: function _track(experiment, variant, goal) {
          utils.log("Persistent Queue Keen track: ".concat(experiment.name, ", ").concat(variant, ", ").concat(event));

          if (this._queue.length > 100) {
            this._queue.shift();
          }

          this._queue.push({
            experiment_name: experiment.name,
            properties: {
              _quuid: utils.uuid(),
              // queue uuid (used only internally)
              uuid: this._user_uuid(experiment, goal),
              variant: variant,
              event: goal.name
            }
          });

          this._storage.set(this.queue_name, JSON.stringify(this._queue));

          return this._flush();
        }
      }, {
        key: "experiment_start",
        value: function experiment_start(experiment, variant) {
          return this._track(experiment, variant, {
            name: 'participate',
            unique: true
          });
        }
      }, {
        key: "goal_complete",
        value: function goal_complete(experiment, variant, goal_name, props) {
          return this._track(experiment, variant, utils.defaults({
            name: goal_name
          }, props));
        }
      }]);

      return PersistentQueueKeenAdapter;
    }();

    ;
    PersistentQueueKeenAdapter.prototype.queue_name = '_keen_queue';
    return PersistentQueueKeenAdapter;
  }.call(this);

  Adapters.GoogleUniversalAnalyticsAdapter = function () {
    var GoogleUniversalAnalyticsAdapter =
    /*#__PURE__*/
    function () {
      function GoogleUniversalAnalyticsAdapter() {
        _classCallCheck(this, GoogleUniversalAnalyticsAdapter);
      }

      _createClass(GoogleUniversalAnalyticsAdapter, null, [{
        key: "_track",
        value: function _track(category, action, label) {
          utils.log("Google Universal Analytics track: ".concat(category, ", ").concat(action, ", ").concat(label));

          if (typeof ga !== 'function') {
            throw new Error('ga not defined. Please make sure your Universal analytics is set up correctly');
          }

          return ga('send', 'event', category, action, label, {
            'nonInteraction': 1
          });
        }
      }, {
        key: "experiment_start",
        value: function experiment_start(experiment, variant) {
          return this._track(this.namespace, "".concat(experiment.name, " | ").concat(variant), 'Visitors');
        }
      }, {
        key: "goal_complete",
        value: function goal_complete(experiment, variant, goal_name, _props) {
          return this._track(this.namespace, "".concat(experiment.name, " | ").concat(variant), goal_name);
        }
      }]);

      return GoogleUniversalAnalyticsAdapter;
    }();

    ;
    GoogleUniversalAnalyticsAdapter.namespace = 'alephbet';
    return GoogleUniversalAnalyticsAdapter;
  }.call(this);

  Adapters.LocalStorageAdapter = function () {
    var LocalStorageAdapter =
    /*#__PURE__*/
    function () {
      function LocalStorageAdapter() {
        _classCallCheck(this, LocalStorageAdapter);
      }

      _createClass(LocalStorageAdapter, null, [{
        key: "set",
        value: function set(key, value) {
          return new Storage(this.namespace).set(key, value);
        }
      }, {
        key: "get",
        value: function get(key) {
          return new Storage(this.namespace).get(key);
        }
      }]);

      return LocalStorageAdapter;
    }();

    ;
    LocalStorageAdapter.namespace = 'alephbet';
    return LocalStorageAdapter;
  }.call(this);

  return Adapters;
}.call(this);

module.exports = Adapters;

/***/ }),

/***/ "./src/alephbet.coffee":
/*!*****************************!*\
  !*** ./src/alephbet.coffee ***!
  \*****************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: top-level-this-exports, module, __webpack_require__ */
/*! CommonJS bailout: this is used directly at 331:7-11 */
/*! CommonJS bailout: module.exports is used directly at 333:0-14 */
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AlephBet, adapters, options, utils;
utils = __webpack_require__(/*! ./utils */ "./src/utils.coffee");
adapters = __webpack_require__(/*! ./adapters */ "./src/adapters.coffee");
options = __webpack_require__(/*! ./options */ "./src/options.coffee");

AlephBet = function () {
  var AlephBet = function AlephBet() {
    _classCallCheck(this, AlephBet);
  };

  ;
  AlephBet.options = options;
  AlephBet.utils = utils;
  AlephBet.GimelAdapter = adapters.GimelAdapter;
  AlephBet.PersistentQueueGoogleAnalyticsAdapter = adapters.PersistentQueueGoogleAnalyticsAdapter;
  AlephBet.PersistentQueueKeenAdapter = adapters.PersistentQueueKeenAdapter;

  AlephBet.Experiment = function () {
    var _run, _validate;

    var Experiment =
    /*#__PURE__*/
    function () {
      function Experiment() {
        var options1 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, Experiment);

        this.options = options1;
        utils.defaults(this.options, Experiment._options);

        _validate.call(this);

        this.name = this.options.name;
        this.variants = this.options.variants;
        this.user_id = this.options.user_id;
        this.variant_names = utils.keys(this.variants);

        _run.call(this);
      }

      _createClass(Experiment, [{
        key: "run",
        value: function run() {
          var variant;
          utils.log("running with options: ".concat(JSON.stringify(this.options)));

          if (variant = this.get_stored_variant()) {
            // a variant was already chosen. activate it
            utils.log("".concat(variant, " active"));
            return this.activate_variant(variant);
          } else {
            return this.conditionally_activate_variant();
          }
        }
      }, {
        key: "activate_variant",
        value: function activate_variant(variant) {
          var ref;

          if ((ref = this.variants[variant]) != null) {
            ref.activate(this);
          }

          return this.storage().set("".concat(this.options.name, ":variant"), variant);
        } // if experiment conditions match, pick and activate a variant, track experiment start

      }, {
        key: "conditionally_activate_variant",
        value: function conditionally_activate_variant() {
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
          this.tracking().experiment_start(this, variant);
          return this.activate_variant(variant);
        }
      }, {
        key: "goal_complete",
        value: function goal_complete(goal_name) {
          var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
          var variant;
          utils.defaults(props, {
            unique: true
          });

          if (props.unique && this.storage().get("".concat(this.options.name, ":").concat(goal_name))) {
            return;
          }

          variant = this.get_stored_variant();

          if (!variant) {
            return;
          }

          if (props.unique) {
            this.storage().set("".concat(this.options.name, ":").concat(goal_name), true);
          }

          utils.log("experiment: ".concat(this.options.name, " variant:").concat(variant, " goal:").concat(goal_name, " complete"));
          return this.tracking().goal_complete(this, variant, goal_name, props);
        }
      }, {
        key: "get_stored_variant",
        value: function get_stored_variant() {
          return this.storage().get("".concat(this.options.name, ":variant"));
        }
      }, {
        key: "pick_variant",
        value: function pick_variant() {
          var all_variants_have_weights;
          all_variants_have_weights = utils.check_weights(this.variants);
          utils.log("all variants have weights: ".concat(all_variants_have_weights));

          if (all_variants_have_weights) {
            return this.pick_weighted_variant();
          } else {
            return this.pick_unweighted_variant();
          }
        }
      }, {
        key: "pick_weighted_variant",
        value: function pick_weighted_variant() {
          var key, ref, value, weighted_index, weights_sum; // Choosing a weighted variant:
          // For A, B, C with weights 1, 3, 6
          // variants = A, B, C
          // weights = 1, 3, 6
          // weights_sum = 10 (sum of weights)
          // weighted_index = 2.1 (random number between 0 and weight sum)
          // ABBBCCCCCC
          // ==^
          // Select B

          weights_sum = utils.sum_weights(this.variants);
          weighted_index = Math.ceil(this._random('variant') * weights_sum);
          ref = this.variants;

          for (key in ref) {
            value = ref[key]; // then we are substracting variant weight from selected number
            // and it it reaches 0 (or below) we are selecting this variant

            weighted_index -= value.weight;

            if (weighted_index <= 0) {
              return key;
            }
          }
        }
      }, {
        key: "pick_unweighted_variant",
        value: function pick_unweighted_variant() {
          var chosen_partition, partitions, variant;
          partitions = 1.0 / this.variant_names.length;
          chosen_partition = Math.floor(this._random('variant') / partitions);
          variant = this.variant_names[chosen_partition];
          utils.log("".concat(variant, " picked"));
          return variant;
        }
      }, {
        key: "in_sample",
        value: function in_sample() {
          var active;
          active = this.storage().get("".concat(this.options.name, ":in_sample"));

          if (typeof active !== 'undefined') {
            return active;
          }

          active = this._random('sample') <= this.options.sample;
          this.storage().set("".concat(this.options.name, ":in_sample"), active);
          return active;
        }
      }, {
        key: "_random",
        value: function _random(salt) {
          var seed;

          if (!this.user_id) {
            return utils.random();
          }

          seed = "".concat(this.name, ".").concat(salt, ".").concat(this.user_id);
          return utils.random(seed);
        }
      }, {
        key: "add_goal",
        value: function add_goal(goal) {
          return goal.add_experiment(this);
        }
      }, {
        key: "add_goals",
        value: function add_goals(goals) {
          var goal, i, len, results;
          results = [];

          for (i = 0, len = goals.length; i < len; i++) {
            goal = goals[i];
            results.push(this.add_goal(goal));
          }

          return results;
        }
      }, {
        key: "storage",
        value: function storage() {
          return this.options.storage_adapter;
        }
      }, {
        key: "tracking",
        value: function tracking() {
          return this.options.tracking_adapter;
        }
      }]);

      return Experiment;
    }();

    ;
    Experiment._options = {
      name: null,
      variants: null,
      user_id: null,
      sample: 1.0,
      trigger: function trigger() {
        return true;
      },
      tracking_adapter: adapters.GoogleUniversalAnalyticsAdapter,
      storage_adapter: adapters.LocalStorageAdapter
    };

    _run = function _run() {
      return this.run();
    };

    _validate = function _validate() {
      var all_variants_have_weights;

      if (this.options.name === null) {
        throw new Error('an experiment name must be specified');
      }

      if (this.options.variants === null) {
        throw new Error('variants must be provided');
      }

      if (typeof this.options.trigger !== 'function') {
        throw new Error('trigger must be a function');
      }

      all_variants_have_weights = utils.validate_weights(this.options.variants);

      if (!all_variants_have_weights) {
        throw new Error('not all variants have weights');
      }
    };

    return Experiment;
  }.call(this);

  AlephBet.Goal =
  /*#__PURE__*/
  function () {
    function Goal(name) {
      var props1 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _classCallCheck(this, Goal);

      this.name = name;
      this.props = props1;
      utils.defaults(this.props, {
        unique: true
      });
      this.experiments = [];
    }

    _createClass(Goal, [{
      key: "add_experiment",
      value: function add_experiment(experiment) {
        return this.experiments.push(experiment);
      }
    }, {
      key: "add_experiments",
      value: function add_experiments(experiments) {
        var experiment, i, len, results;
        results = [];

        for (i = 0, len = experiments.length; i < len; i++) {
          experiment = experiments[i];
          results.push(this.add_experiment(experiment));
        }

        return results;
      }
    }, {
      key: "complete",
      value: function complete() {
        var experiment, i, len, ref, results;
        ref = this.experiments;
        results = [];

        for (i = 0, len = ref.length; i < len; i++) {
          experiment = ref[i];
          results.push(experiment.goal_complete(this.name, this.props));
        }

        return results;
      }
    }]);

    return Goal;
  }();

  return AlephBet;
}.call(this);

module.exports = AlephBet;

/***/ }),

/***/ "./src/options.coffee":
/*!****************************!*\
  !*** ./src/options.coffee ***!
  \****************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 1:0-14 */
/***/ ((module) => {

module.exports = {
  debug: false
};

/***/ }),

/***/ "./src/storage.coffee":
/*!****************************!*\
  !*** ./src/storage.coffee ***!
  \****************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 43:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Basil, Storage, store;
Basil = __webpack_require__(/*! basil.js */ "./node_modules/basil.js/build/basil.js");
store = new Basil({
  namespace: null
}); // a thin wrapper around basil.js for easy swapping

Storage =
/*#__PURE__*/
function () {
  function Storage() {
    var namespace = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'alephbet';

    _classCallCheck(this, Storage);

    this.namespace = namespace;
    this.storage = store.get(this.namespace) || {};
  }

  _createClass(Storage, [{
    key: "set",
    value: function set(key, value) {
      this.storage[key] = value;
      store.set(this.namespace, this.storage);
      return value;
    }
  }, {
    key: "get",
    value: function get(key) {
      return this.storage[key];
    }
  }]);

  return Storage;
}(); // store.get("#{@namespace}:#{key}")


module.exports = Storage;

/***/ }),

/***/ "./src/utils.coffee":
/*!**************************!*\
  !*** ./src/utils.coffee ***!
  \**************************/
/*! namespace exports */
/*! exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_require__, __webpack_require__.n, module.loaded, module.id, module, __webpack_require__.hmd, __webpack_require__.r, __webpack_exports__, __webpack_require__.* */
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var crypto_js_sha1__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! crypto-js/sha1 */ "./node_modules/crypto-js/sha1.js");
/* harmony import */ var crypto_js_sha1__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(crypto_js_sha1__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var uuid__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! uuid */ "./node_modules/uuid/dist/esm-browser/v4.js");
/* module decorator */ module = __webpack_require__.hmd(module);
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Utils, _, options;


 // NOTE: using a custom build of lodash, to save space

_ = __webpack_require__(/*! ../vendor/lodash.custom.min */ "./vendor/lodash.custom.min.js");
options = __webpack_require__(/*! ./options */ "./src/options.coffee");

Utils = function () {
  var Utils =
  /*#__PURE__*/
  function () {
    function Utils() {
      _classCallCheck(this, Utils);
    }

    _createClass(Utils, null, [{
      key: "log",
      value: function log(message) {
        if (options.debug) {
          return console.log(message);
        }
      }
    }, {
      key: "sha1",
      value: function sha1(text) {
        return crypto_js_sha1__WEBPACK_IMPORTED_MODULE_0___default()(text).toString();
      }
    }, {
      key: "random",
      value: function random(seed) {
        if (!seed) {
          return Math.random();
        } // a MUCH simplified version inspired by PlanOut.js


        return parseInt(this.sha1(seed).substr(0, 13), 16) / 0xFFFFFFFFFFFFF;
      }
    }, {
      key: "check_weights",
      value: function check_weights(variants) {
        var contains_weight, key, value;
        contains_weight = [];

        for (key in variants) {
          value = variants[key];
          contains_weight.push(value.weight != null);
        }

        return contains_weight.every(function (has_weight) {
          return has_weight;
        });
      }
    }, {
      key: "sum_weights",
      value: function sum_weights(variants) {
        var key, sum, value;
        sum = 0;

        for (key in variants) {
          value = variants[key];
          sum += value.weight || 0;
        }

        return sum;
      }
    }, {
      key: "validate_weights",
      value: function validate_weights(variants) {
        var contains_weight, key, value;
        contains_weight = [];

        for (key in variants) {
          value = variants[key];
          contains_weight.push(value.weight != null);
        }

        return contains_weight.every(function (has_weight) {
          return has_weight || contains_weight.every(function (has_weight) {
            return !has_weight;
          });
        });
      }
    }]);

    return Utils;
  }();

  ;
  Utils.defaults = _.defaults;
  Utils.keys = _.keys;
  Utils.remove = _.remove;
  Utils.omit = _.omit;
  Utils.uuid = uuid__WEBPACK_IMPORTED_MODULE_1__.default;
  return Utils;
}.call(undefined);

module.exports = Utils;

/***/ }),

/***/ "./node_modules/crypto-js/core.js":
/*!****************************************!*\
  !*** ./node_modules/crypto-js/core.js ***!
  \****************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_exports__, top-level-this-exports, __webpack_require__.g, __webpack_require__, __webpack_require__.* */
/*! CommonJS bailout: this is used directly at 14:2-6 */
/*! CommonJS bailout: exports is used directly at 4:19-26 */
/*! CommonJS bailout: module.exports is used directly at 4:2-16 */
/***/ (function(module, exports, __webpack_require__) {

;(function (root, factory) {
	if (true) {
		// CommonJS
		module.exports = exports = factory();
	}
	else {}
}(this, function () {

	/*globals window, global, require*/

	/**
	 * CryptoJS core components.
	 */
	var CryptoJS = CryptoJS || (function (Math, undefined) {

	    var crypto;

	    // Native crypto from window (Browser)
	    if (typeof window !== 'undefined' && window.crypto) {
	        crypto = window.crypto;
	    }

	    // Native (experimental IE 11) crypto from window (Browser)
	    if (!crypto && typeof window !== 'undefined' && window.msCrypto) {
	        crypto = window.msCrypto;
	    }

	    // Native crypto from global (NodeJS)
	    if (!crypto && typeof __webpack_require__.g !== 'undefined' && __webpack_require__.g.crypto) {
	        crypto = __webpack_require__.g.crypto;
	    }

	    // Native crypto import via require (NodeJS)
	    if (!crypto && "function" === 'function') {
	        try {
	            crypto = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'crypto'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	        } catch (err) {}
	    }

	    /*
	     * Cryptographically secure pseudorandom number generator
	     *
	     * As Math.random() is cryptographically not safe to use
	     */
	    var cryptoSecureRandomInt = function () {
	        if (crypto) {
	            // Use getRandomValues method (Browser)
	            if (typeof crypto.getRandomValues === 'function') {
	                try {
	                    return crypto.getRandomValues(new Uint32Array(1))[0];
	                } catch (err) {}
	            }

	            // Use randomBytes method (NodeJS)
	            if (typeof crypto.randomBytes === 'function') {
	                try {
	                    return crypto.randomBytes(4).readInt32LE();
	                } catch (err) {}
	            }
	        }

	        throw new Error('Native crypto module could not be used to get secure random number.');
	    };

	    /*
	     * Local polyfill of Object.create

	     */
	    var create = Object.create || (function () {
	        function F() {}

	        return function (obj) {
	            var subtype;

	            F.prototype = obj;

	            subtype = new F();

	            F.prototype = null;

	            return subtype;
	        };
	    }())

	    /**
	     * CryptoJS namespace.
	     */
	    var C = {};

	    /**
	     * Library namespace.
	     */
	    var C_lib = C.lib = {};

	    /**
	     * Base object for prototypal inheritance.
	     */
	    var Base = C_lib.Base = (function () {


	        return {
	            /**
	             * Creates a new object that inherits from this object.
	             *
	             * @param {Object} overrides Properties to copy into the new object.
	             *
	             * @return {Object} The new object.
	             *
	             * @static
	             *
	             * @example
	             *
	             *     var MyType = CryptoJS.lib.Base.extend({
	             *         field: 'value',
	             *
	             *         method: function () {
	             *         }
	             *     });
	             */
	            extend: function (overrides) {
	                // Spawn
	                var subtype = create(this);

	                // Augment
	                if (overrides) {
	                    subtype.mixIn(overrides);
	                }

	                // Create default initializer
	                if (!subtype.hasOwnProperty('init') || this.init === subtype.init) {
	                    subtype.init = function () {
	                        subtype.$super.init.apply(this, arguments);
	                    };
	                }

	                // Initializer's prototype is the subtype object
	                subtype.init.prototype = subtype;

	                // Reference supertype
	                subtype.$super = this;

	                return subtype;
	            },

	            /**
	             * Extends this object and runs the init method.
	             * Arguments to create() will be passed to init().
	             *
	             * @return {Object} The new object.
	             *
	             * @static
	             *
	             * @example
	             *
	             *     var instance = MyType.create();
	             */
	            create: function () {
	                var instance = this.extend();
	                instance.init.apply(instance, arguments);

	                return instance;
	            },

	            /**
	             * Initializes a newly created object.
	             * Override this method to add some logic when your objects are created.
	             *
	             * @example
	             *
	             *     var MyType = CryptoJS.lib.Base.extend({
	             *         init: function () {
	             *             // ...
	             *         }
	             *     });
	             */
	            init: function () {
	            },

	            /**
	             * Copies properties into this object.
	             *
	             * @param {Object} properties The properties to mix in.
	             *
	             * @example
	             *
	             *     MyType.mixIn({
	             *         field: 'value'
	             *     });
	             */
	            mixIn: function (properties) {
	                for (var propertyName in properties) {
	                    if (properties.hasOwnProperty(propertyName)) {
	                        this[propertyName] = properties[propertyName];
	                    }
	                }

	                // IE won't copy toString using the loop above
	                if (properties.hasOwnProperty('toString')) {
	                    this.toString = properties.toString;
	                }
	            },

	            /**
	             * Creates a copy of this object.
	             *
	             * @return {Object} The clone.
	             *
	             * @example
	             *
	             *     var clone = instance.clone();
	             */
	            clone: function () {
	                return this.init.prototype.extend(this);
	            }
	        };
	    }());

	    /**
	     * An array of 32-bit words.
	     *
	     * @property {Array} words The array of 32-bit words.
	     * @property {number} sigBytes The number of significant bytes in this word array.
	     */
	    var WordArray = C_lib.WordArray = Base.extend({
	        /**
	         * Initializes a newly created word array.
	         *
	         * @param {Array} words (Optional) An array of 32-bit words.
	         * @param {number} sigBytes (Optional) The number of significant bytes in the words.
	         *
	         * @example
	         *
	         *     var wordArray = CryptoJS.lib.WordArray.create();
	         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607]);
	         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607], 6);
	         */
	        init: function (words, sigBytes) {
	            words = this.words = words || [];

	            if (sigBytes != undefined) {
	                this.sigBytes = sigBytes;
	            } else {
	                this.sigBytes = words.length * 4;
	            }
	        },

	        /**
	         * Converts this word array to a string.
	         *
	         * @param {Encoder} encoder (Optional) The encoding strategy to use. Default: CryptoJS.enc.Hex
	         *
	         * @return {string} The stringified word array.
	         *
	         * @example
	         *
	         *     var string = wordArray + '';
	         *     var string = wordArray.toString();
	         *     var string = wordArray.toString(CryptoJS.enc.Utf8);
	         */
	        toString: function (encoder) {
	            return (encoder || Hex).stringify(this);
	        },

	        /**
	         * Concatenates a word array to this word array.
	         *
	         * @param {WordArray} wordArray The word array to append.
	         *
	         * @return {WordArray} This word array.
	         *
	         * @example
	         *
	         *     wordArray1.concat(wordArray2);
	         */
	        concat: function (wordArray) {
	            // Shortcuts
	            var thisWords = this.words;
	            var thatWords = wordArray.words;
	            var thisSigBytes = this.sigBytes;
	            var thatSigBytes = wordArray.sigBytes;

	            // Clamp excess bits
	            this.clamp();

	            // Concat
	            if (thisSigBytes % 4) {
	                // Copy one byte at a time
	                for (var i = 0; i < thatSigBytes; i++) {
	                    var thatByte = (thatWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
	                    thisWords[(thisSigBytes + i) >>> 2] |= thatByte << (24 - ((thisSigBytes + i) % 4) * 8);
	                }
	            } else {
	                // Copy one word at a time
	                for (var i = 0; i < thatSigBytes; i += 4) {
	                    thisWords[(thisSigBytes + i) >>> 2] = thatWords[i >>> 2];
	                }
	            }
	            this.sigBytes += thatSigBytes;

	            // Chainable
	            return this;
	        },

	        /**
	         * Removes insignificant bits.
	         *
	         * @example
	         *
	         *     wordArray.clamp();
	         */
	        clamp: function () {
	            // Shortcuts
	            var words = this.words;
	            var sigBytes = this.sigBytes;

	            // Clamp
	            words[sigBytes >>> 2] &= 0xffffffff << (32 - (sigBytes % 4) * 8);
	            words.length = Math.ceil(sigBytes / 4);
	        },

	        /**
	         * Creates a copy of this word array.
	         *
	         * @return {WordArray} The clone.
	         *
	         * @example
	         *
	         *     var clone = wordArray.clone();
	         */
	        clone: function () {
	            var clone = Base.clone.call(this);
	            clone.words = this.words.slice(0);

	            return clone;
	        },

	        /**
	         * Creates a word array filled with random bytes.
	         *
	         * @param {number} nBytes The number of random bytes to generate.
	         *
	         * @return {WordArray} The random word array.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var wordArray = CryptoJS.lib.WordArray.random(16);
	         */
	        random: function (nBytes) {
	            var words = [];

	            for (var i = 0; i < nBytes; i += 4) {
	                words.push(cryptoSecureRandomInt());
	            }

	            return new WordArray.init(words, nBytes);
	        }
	    });

	    /**
	     * Encoder namespace.
	     */
	    var C_enc = C.enc = {};

	    /**
	     * Hex encoding strategy.
	     */
	    var Hex = C_enc.Hex = {
	        /**
	         * Converts a word array to a hex string.
	         *
	         * @param {WordArray} wordArray The word array.
	         *
	         * @return {string} The hex string.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var hexString = CryptoJS.enc.Hex.stringify(wordArray);
	         */
	        stringify: function (wordArray) {
	            // Shortcuts
	            var words = wordArray.words;
	            var sigBytes = wordArray.sigBytes;

	            // Convert
	            var hexChars = [];
	            for (var i = 0; i < sigBytes; i++) {
	                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
	                hexChars.push((bite >>> 4).toString(16));
	                hexChars.push((bite & 0x0f).toString(16));
	            }

	            return hexChars.join('');
	        },

	        /**
	         * Converts a hex string to a word array.
	         *
	         * @param {string} hexStr The hex string.
	         *
	         * @return {WordArray} The word array.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var wordArray = CryptoJS.enc.Hex.parse(hexString);
	         */
	        parse: function (hexStr) {
	            // Shortcut
	            var hexStrLength = hexStr.length;

	            // Convert
	            var words = [];
	            for (var i = 0; i < hexStrLength; i += 2) {
	                words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << (24 - (i % 8) * 4);
	            }

	            return new WordArray.init(words, hexStrLength / 2);
	        }
	    };

	    /**
	     * Latin1 encoding strategy.
	     */
	    var Latin1 = C_enc.Latin1 = {
	        /**
	         * Converts a word array to a Latin1 string.
	         *
	         * @param {WordArray} wordArray The word array.
	         *
	         * @return {string} The Latin1 string.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var latin1String = CryptoJS.enc.Latin1.stringify(wordArray);
	         */
	        stringify: function (wordArray) {
	            // Shortcuts
	            var words = wordArray.words;
	            var sigBytes = wordArray.sigBytes;

	            // Convert
	            var latin1Chars = [];
	            for (var i = 0; i < sigBytes; i++) {
	                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
	                latin1Chars.push(String.fromCharCode(bite));
	            }

	            return latin1Chars.join('');
	        },

	        /**
	         * Converts a Latin1 string to a word array.
	         *
	         * @param {string} latin1Str The Latin1 string.
	         *
	         * @return {WordArray} The word array.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var wordArray = CryptoJS.enc.Latin1.parse(latin1String);
	         */
	        parse: function (latin1Str) {
	            // Shortcut
	            var latin1StrLength = latin1Str.length;

	            // Convert
	            var words = [];
	            for (var i = 0; i < latin1StrLength; i++) {
	                words[i >>> 2] |= (latin1Str.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
	            }

	            return new WordArray.init(words, latin1StrLength);
	        }
	    };

	    /**
	     * UTF-8 encoding strategy.
	     */
	    var Utf8 = C_enc.Utf8 = {
	        /**
	         * Converts a word array to a UTF-8 string.
	         *
	         * @param {WordArray} wordArray The word array.
	         *
	         * @return {string} The UTF-8 string.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var utf8String = CryptoJS.enc.Utf8.stringify(wordArray);
	         */
	        stringify: function (wordArray) {
	            try {
	                return decodeURIComponent(escape(Latin1.stringify(wordArray)));
	            } catch (e) {
	                throw new Error('Malformed UTF-8 data');
	            }
	        },

	        /**
	         * Converts a UTF-8 string to a word array.
	         *
	         * @param {string} utf8Str The UTF-8 string.
	         *
	         * @return {WordArray} The word array.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var wordArray = CryptoJS.enc.Utf8.parse(utf8String);
	         */
	        parse: function (utf8Str) {
	            return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
	        }
	    };

	    /**
	     * Abstract buffered block algorithm template.
	     *
	     * The property blockSize must be implemented in a concrete subtype.
	     *
	     * @property {number} _minBufferSize The number of blocks that should be kept unprocessed in the buffer. Default: 0
	     */
	    var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm = Base.extend({
	        /**
	         * Resets this block algorithm's data buffer to its initial state.
	         *
	         * @example
	         *
	         *     bufferedBlockAlgorithm.reset();
	         */
	        reset: function () {
	            // Initial values
	            this._data = new WordArray.init();
	            this._nDataBytes = 0;
	        },

	        /**
	         * Adds new data to this block algorithm's buffer.
	         *
	         * @param {WordArray|string} data The data to append. Strings are converted to a WordArray using UTF-8.
	         *
	         * @example
	         *
	         *     bufferedBlockAlgorithm._append('data');
	         *     bufferedBlockAlgorithm._append(wordArray);
	         */
	        _append: function (data) {
	            // Convert string to WordArray, else assume WordArray already
	            if (typeof data == 'string') {
	                data = Utf8.parse(data);
	            }

	            // Append
	            this._data.concat(data);
	            this._nDataBytes += data.sigBytes;
	        },

	        /**
	         * Processes available data blocks.
	         *
	         * This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
	         *
	         * @param {boolean} doFlush Whether all blocks and partial blocks should be processed.
	         *
	         * @return {WordArray} The processed data.
	         *
	         * @example
	         *
	         *     var processedData = bufferedBlockAlgorithm._process();
	         *     var processedData = bufferedBlockAlgorithm._process(!!'flush');
	         */
	        _process: function (doFlush) {
	            var processedWords;

	            // Shortcuts
	            var data = this._data;
	            var dataWords = data.words;
	            var dataSigBytes = data.sigBytes;
	            var blockSize = this.blockSize;
	            var blockSizeBytes = blockSize * 4;

	            // Count blocks ready
	            var nBlocksReady = dataSigBytes / blockSizeBytes;
	            if (doFlush) {
	                // Round up to include partial blocks
	                nBlocksReady = Math.ceil(nBlocksReady);
	            } else {
	                // Round down to include only full blocks,
	                // less the number of blocks that must remain in the buffer
	                nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
	            }

	            // Count words ready
	            var nWordsReady = nBlocksReady * blockSize;

	            // Count bytes ready
	            var nBytesReady = Math.min(nWordsReady * 4, dataSigBytes);

	            // Process blocks
	            if (nWordsReady) {
	                for (var offset = 0; offset < nWordsReady; offset += blockSize) {
	                    // Perform concrete-algorithm logic
	                    this._doProcessBlock(dataWords, offset);
	                }

	                // Remove processed words
	                processedWords = dataWords.splice(0, nWordsReady);
	                data.sigBytes -= nBytesReady;
	            }

	            // Return processed words
	            return new WordArray.init(processedWords, nBytesReady);
	        },

	        /**
	         * Creates a copy of this object.
	         *
	         * @return {Object} The clone.
	         *
	         * @example
	         *
	         *     var clone = bufferedBlockAlgorithm.clone();
	         */
	        clone: function () {
	            var clone = Base.clone.call(this);
	            clone._data = this._data.clone();

	            return clone;
	        },

	        _minBufferSize: 0
	    });

	    /**
	     * Abstract hasher template.
	     *
	     * @property {number} blockSize The number of 32-bit words this hasher operates on. Default: 16 (512 bits)
	     */
	    var Hasher = C_lib.Hasher = BufferedBlockAlgorithm.extend({
	        /**
	         * Configuration options.
	         */
	        cfg: Base.extend(),

	        /**
	         * Initializes a newly created hasher.
	         *
	         * @param {Object} cfg (Optional) The configuration options to use for this hash computation.
	         *
	         * @example
	         *
	         *     var hasher = CryptoJS.algo.SHA256.create();
	         */
	        init: function (cfg) {
	            // Apply config defaults
	            this.cfg = this.cfg.extend(cfg);

	            // Set initial values
	            this.reset();
	        },

	        /**
	         * Resets this hasher to its initial state.
	         *
	         * @example
	         *
	         *     hasher.reset();
	         */
	        reset: function () {
	            // Reset data buffer
	            BufferedBlockAlgorithm.reset.call(this);

	            // Perform concrete-hasher logic
	            this._doReset();
	        },

	        /**
	         * Updates this hasher with a message.
	         *
	         * @param {WordArray|string} messageUpdate The message to append.
	         *
	         * @return {Hasher} This hasher.
	         *
	         * @example
	         *
	         *     hasher.update('message');
	         *     hasher.update(wordArray);
	         */
	        update: function (messageUpdate) {
	            // Append
	            this._append(messageUpdate);

	            // Update the hash
	            this._process();

	            // Chainable
	            return this;
	        },

	        /**
	         * Finalizes the hash computation.
	         * Note that the finalize operation is effectively a destructive, read-once operation.
	         *
	         * @param {WordArray|string} messageUpdate (Optional) A final message update.
	         *
	         * @return {WordArray} The hash.
	         *
	         * @example
	         *
	         *     var hash = hasher.finalize();
	         *     var hash = hasher.finalize('message');
	         *     var hash = hasher.finalize(wordArray);
	         */
	        finalize: function (messageUpdate) {
	            // Final message update
	            if (messageUpdate) {
	                this._append(messageUpdate);
	            }

	            // Perform concrete-hasher logic
	            var hash = this._doFinalize();

	            return hash;
	        },

	        blockSize: 512/32,

	        /**
	         * Creates a shortcut function to a hasher's object interface.
	         *
	         * @param {Hasher} hasher The hasher to create a helper for.
	         *
	         * @return {Function} The shortcut function.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var SHA256 = CryptoJS.lib.Hasher._createHelper(CryptoJS.algo.SHA256);
	         */
	        _createHelper: function (hasher) {
	            return function (message, cfg) {
	                return new hasher.init(cfg).finalize(message);
	            };
	        },

	        /**
	         * Creates a shortcut function to the HMAC's object interface.
	         *
	         * @param {Hasher} hasher The hasher to use in this HMAC helper.
	         *
	         * @return {Function} The shortcut function.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
	         */
	        _createHmacHelper: function (hasher) {
	            return function (message, key) {
	                return new C_algo.HMAC.init(hasher, key).finalize(message);
	            };
	        }
	    });

	    /**
	     * Algorithm namespace.
	     */
	    var C_algo = C.algo = {};

	    return C;
	}(Math));


	return CryptoJS;

}));

/***/ }),

/***/ "./node_modules/crypto-js/sha1.js":
/*!****************************************!*\
  !*** ./node_modules/crypto-js/sha1.js ***!
  \****************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_exports__, top-level-this-exports, __webpack_require__ */
/*! CommonJS bailout: this is used directly at 14:2-6 */
/*! CommonJS bailout: exports is used directly at 4:19-26 */
/*! CommonJS bailout: module.exports is used directly at 4:2-16 */
/***/ (function(module, exports, __webpack_require__) {

;(function (root, factory) {
	if (true) {
		// CommonJS
		module.exports = exports = factory(__webpack_require__(/*! ./core */ "./node_modules/crypto-js/core.js"));
	}
	else {}
}(this, function (CryptoJS) {

	(function () {
	    // Shortcuts
	    var C = CryptoJS;
	    var C_lib = C.lib;
	    var WordArray = C_lib.WordArray;
	    var Hasher = C_lib.Hasher;
	    var C_algo = C.algo;

	    // Reusable object
	    var W = [];

	    /**
	     * SHA-1 hash algorithm.
	     */
	    var SHA1 = C_algo.SHA1 = Hasher.extend({
	        _doReset: function () {
	            this._hash = new WordArray.init([
	                0x67452301, 0xefcdab89,
	                0x98badcfe, 0x10325476,
	                0xc3d2e1f0
	            ]);
	        },

	        _doProcessBlock: function (M, offset) {
	            // Shortcut
	            var H = this._hash.words;

	            // Working variables
	            var a = H[0];
	            var b = H[1];
	            var c = H[2];
	            var d = H[3];
	            var e = H[4];

	            // Computation
	            for (var i = 0; i < 80; i++) {
	                if (i < 16) {
	                    W[i] = M[offset + i] | 0;
	                } else {
	                    var n = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
	                    W[i] = (n << 1) | (n >>> 31);
	                }

	                var t = ((a << 5) | (a >>> 27)) + e + W[i];
	                if (i < 20) {
	                    t += ((b & c) | (~b & d)) + 0x5a827999;
	                } else if (i < 40) {
	                    t += (b ^ c ^ d) + 0x6ed9eba1;
	                } else if (i < 60) {
	                    t += ((b & c) | (b & d) | (c & d)) - 0x70e44324;
	                } else /* if (i < 80) */ {
	                    t += (b ^ c ^ d) - 0x359d3e2a;
	                }

	                e = d;
	                d = c;
	                c = (b << 30) | (b >>> 2);
	                b = a;
	                a = t;
	            }

	            // Intermediate hash value
	            H[0] = (H[0] + a) | 0;
	            H[1] = (H[1] + b) | 0;
	            H[2] = (H[2] + c) | 0;
	            H[3] = (H[3] + d) | 0;
	            H[4] = (H[4] + e) | 0;
	        },

	        _doFinalize: function () {
	            // Shortcuts
	            var data = this._data;
	            var dataWords = data.words;

	            var nBitsTotal = this._nDataBytes * 8;
	            var nBitsLeft = data.sigBytes * 8;

	            // Add padding
	            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
	            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(nBitsTotal / 0x100000000);
	            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
	            data.sigBytes = dataWords.length * 4;

	            // Hash final blocks
	            this._process();

	            // Return final computed hash
	            return this._hash;
	        },

	        clone: function () {
	            var clone = Hasher.clone.call(this);
	            clone._hash = this._hash.clone();

	            return clone;
	        }
	    });

	    /**
	     * Shortcut function to the hasher's object interface.
	     *
	     * @param {WordArray|string} message The message to hash.
	     *
	     * @return {WordArray} The hash.
	     *
	     * @static
	     *
	     * @example
	     *
	     *     var hash = CryptoJS.SHA1('message');
	     *     var hash = CryptoJS.SHA1(wordArray);
	     */
	    C.SHA1 = Hasher._createHelper(SHA1);

	    /**
	     * Shortcut function to the HMAC's object interface.
	     *
	     * @param {WordArray|string} message The message to hash.
	     * @param {WordArray|string} key The secret key.
	     *
	     * @return {WordArray} The HMAC.
	     *
	     * @static
	     *
	     * @example
	     *
	     *     var hmac = CryptoJS.HmacSHA1(message, key);
	     */
	    C.HmacSHA1 = Hasher._createHmacHelper(SHA1);
	}());


	return CryptoJS.SHA1;

}));

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/regex.js":
/*!*****************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/regex.js ***!
  \*****************************************************/
/*! namespace exports */
/*! export default [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__, __webpack_require__.r, __webpack_require__.d, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (/^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i);

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/rng.js":
/*!***************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/rng.js ***!
  \***************************************************/
/*! namespace exports */
/*! export default [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_require__.r, __webpack_exports__, __webpack_require__.d, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => /* binding */ rng
/* harmony export */ });
// Unique ID creation requires a high quality random # generator. In the browser we therefore
// require the crypto API and do not support built-in fallback to lower quality random number
// generators (like Math.random()).
// getRandomValues needs to be invoked in a context where "this" is a Crypto implementation. Also,
// find the complete implementation of crypto (msCrypto) on IE11.
var getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto !== 'undefined' && typeof msCrypto.getRandomValues === 'function' && msCrypto.getRandomValues.bind(msCrypto);
var rnds8 = new Uint8Array(16);
function rng() {
  if (!getRandomValues) {
    throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
  }

  return getRandomValues(rnds8);
}

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/stringify.js":
/*!*********************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/stringify.js ***!
  \*********************************************************/
/*! namespace exports */
/*! export default [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_require__, __webpack_exports__, __webpack_require__.r, __webpack_require__.d, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ });
/* harmony import */ var _validate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./validate.js */ "./node_modules/uuid/dist/esm-browser/validate.js");
;
/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */

var byteToHex = [];

for (var i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).substr(1));
}

function stringify(arr) {
  var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  // Note: Be careful editing this code!  It's been tuned for performance
  // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
  var uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase(); // Consistency check for valid UUID.  If this throws, it's likely due to one
  // of the following:
  // - One or more input array values don't map to a hex octet (leading to
  // "undefined" in the uuid)
  // - Invalid input values for the RFC `version` or `variant` fields

  if (!(0,_validate_js__WEBPACK_IMPORTED_MODULE_0__.default)(uuid)) {
    throw TypeError('Stringified UUID is invalid');
  }

  return uuid;
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (stringify);

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/v4.js":
/*!**************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/v4.js ***!
  \**************************************************/
/*! namespace exports */
/*! export default [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_require__, __webpack_exports__, __webpack_require__.r, __webpack_require__.d, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ });
/* harmony import */ var _rng_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./rng.js */ "./node_modules/uuid/dist/esm-browser/rng.js");
/* harmony import */ var _stringify_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./stringify.js */ "./node_modules/uuid/dist/esm-browser/stringify.js");
;


function v4(options, buf, offset) {
  options = options || {};
  var rnds = options.random || (options.rng || _rng_js__WEBPACK_IMPORTED_MODULE_0__.default)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

  rnds[6] = rnds[6] & 0x0f | 0x40;
  rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

  if (buf) {
    offset = offset || 0;

    for (var i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }

    return buf;
  }

  return (0,_stringify_js__WEBPACK_IMPORTED_MODULE_1__.default)(rnds);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (v4);

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/validate.js":
/*!********************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/validate.js ***!
  \********************************************************/
/*! namespace exports */
/*! export default [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_require__, __webpack_exports__, __webpack_require__.r, __webpack_require__.d, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ });
/* harmony import */ var _regex_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./regex.js */ "./node_modules/uuid/dist/esm-browser/regex.js");
;

function validate(uuid) {
  return typeof uuid === 'string' && _regex_js__WEBPACK_IMPORTED_MODULE_0__.default.test(uuid);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (validate);

/***/ }),

/***/ "./vendor/lodash.custom.min.js":
/*!*************************************!*\
  !*** ./vendor/lodash.custom.min.js ***!
  \*************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: __webpack_exports__, module.loaded, module.id, module, __webpack_require__.nmd, top-level-this-exports, __webpack_require__.g, __webpack_require__.* */
/*! CommonJS bailout: this is used directly at 43:15-19 */
/*! CommonJS bailout: exports is used directly at 31:273-280 */
/*! CommonJS bailout: exports is used directly at 31:301-308 */
/***/ (function(module, exports, __webpack_require__) {

/* module decorator */ module = __webpack_require__.nmd(module);
/**
 * @license
 * Lodash (Custom Build) lodash.com/license | Underscore.js 1.8.3 underscorejs.org/LICENSE
 * Build: `lodash -p include="keys,defaults,remove,omit" exports="node" -o ./vendor/lodash.custom.min.js`
 */
;(function(){function t(t,e,r){switch(r.length){case 0:return t.call(e);case 1:return t.call(e,r[0]);case 2:return t.call(e,r[0],r[1]);case 3:return t.call(e,r[0],r[1],r[2])}return t.apply(e,r)}function e(t,e){for(var r=-1,n=null==t?0:t.length;++r<n&&false!==e(t[r],r,t););}function r(t,e){for(var r=-1,n=null==t?0:t.length,o=0,c=[];++r<n;){var u=t[r];e(u,r,t)&&(c[o++]=u)}return c}function n(t,e){for(var r=-1,n=null==t?0:t.length,o=Array(n);++r<n;)o[r]=e(t[r],r,t);return o}function o(t,e){for(var r=-1,n=e.length,o=t.length;++r<n;)t[o+r]=e[r];
return t}function c(t,e){for(var r=-1,n=null==t?0:t.length;++r<n;)if(e(t[r],r,t))return true;return false}function u(t){return function(e){return null==e?Bt:e[t]}}function a(t){return function(e){return t(e)}}function i(t){var e=-1,r=Array(t.size);return t.forEach(function(t,n){r[++e]=[n,t]}),r}function f(t){var e=Object;return function(r){return t(e(r))}}function l(t){var e=-1,r=Array(t.size);return t.forEach(function(t){r[++e]=t}),r}function s(){}function b(t){var e=-1,r=null==t?0:t.length;for(this.clear();++e<r;){
var n=t[e];this.set(n[0],n[1])}}function h(t){var e=-1,r=null==t?0:t.length;for(this.clear();++e<r;){var n=t[e];this.set(n[0],n[1])}}function p(t){var e=-1,r=null==t?0:t.length;for(this.clear();++e<r;){var n=t[e];this.set(n[0],n[1])}}function y(t){var e=-1,r=null==t?0:t.length;for(this.__data__=new p;++e<r;)this.add(t[e])}function j(t){this.size=(this.__data__=new h(t)).size}function _(t,e){var r=Ke(t),n=!r&&Je(t),o=!r&&!n&&Qe(t),c=!r&&!n&&!o&&Ze(t);if(r=r||n||o||c){for(var n=t.length,u=String,a=-1,i=Array(n);++a<n;)i[a]=u(a);
n=i}else n=[];var f,u=n.length;for(f in t)!e&&!ue.call(t,f)||r&&("length"==f||o&&("offset"==f||"parent"==f)||c&&("buffer"==f||"byteLength"==f||"byteOffset"==f)||ct(f,u))||n.push(f);return n}function g(t,e,r){var n=t[e];ue.call(t,e)&&yt(n,r)&&(r!==Bt||e in t)||w(t,e,r)}function v(t,e){for(var r=t.length;r--;)if(yt(t[r][0],e))return r;return-1}function d(t,e){return t&&W(e,zt(e),t)}function A(t,e){return t&&W(e,kt(e),t)}function w(t,e,r){"__proto__"==e&&Ae?Ae(t,e,{configurable:true,enumerable:true,value:r,
writable:true}):t[e]=r}function m(t,r,n,o,c,u){var a,i=1&r,f=2&r,l=4&r;if(n&&(a=c?n(t,o,c,u):n(t)),a!==Bt)return a;if(!vt(t))return t;if(o=Ke(t)){if(a=rt(t),!i)return N(t,a)}else{var s=Ge(t),b="[object Function]"==s||"[object GeneratorFunction]"==s;if(Qe(t))return R(t,i);if("[object Object]"==s||"[object Arguments]"==s||b&&!c){if(a=f||b?{}:typeof t.constructor!="function"||at(t)?{}:Re(ye(t)),!i)return f?q(t,A(a,t)):G(t,d(a,t))}else{if(!Wt[s])return c?t:{};a=nt(t,s,i)}}if(u||(u=new j),c=u.get(t))return c;
if(u.set(t,a),Ye(t))return t.forEach(function(e){a.add(m(e,r,n,e,t,u))}),a;if(Xe(t))return t.forEach(function(e,o){a.set(o,m(e,r,n,o,t,u))}),a;var f=l?f?X:Q:f?kt:zt,h=o?Bt:f(t);return e(h||t,function(e,o){h&&(o=e,e=t[o]),g(a,o,m(e,r,n,o,t,u))}),a}function O(t,e,r,n,c){var u=-1,a=t.length;for(r||(r=ot),c||(c=[]);++u<a;){var i=t[u];0<e&&r(i)?1<e?O(i,e-1,r,n,c):o(c,i):n||(c[c.length]=i)}return c}function S(t,e){e=V(e,t);for(var r=0,n=e.length;null!=t&&r<n;)t=t[lt(e[r++])];return r&&r==n?t:Bt}function z(t,e,r){
return e=e(t),Ke(t)?e:o(e,r(t))}function k(t){if(null==t)t=t===Bt?"[object Undefined]":"[object Null]";else if(de&&de in Object(t)){var e=ue.call(t,de),r=t[de];try{t[de]=Bt;var n=true}catch(t){}var o=ie.call(t);n&&(e?t[de]=r:delete t[de]),t=o}else t=ie.call(t);return t}function x(t){return dt(t)&&"[object Arguments]"==k(t)}function E(t,e,r,n,o){if(t===e)e=true;else if(null==t||null==e||!dt(t)&&!dt(e))e=t!==t&&e!==e;else t:{var c=Ke(t),u=Ke(e),a=c?"[object Array]":Ge(t),i=u?"[object Array]":Ge(e),a="[object Arguments]"==a?"[object Object]":a,i="[object Arguments]"==i?"[object Object]":i,f="[object Object]"==a,u="[object Object]"==i;
if((i=a==i)&&Qe(t)){if(!Qe(e)){e=false;break t}c=true,f=false}if(i&&!f)o||(o=new j),e=c||Ze(t)?J(t,e,r,n,E,o):K(t,e,a,r,n,E,o);else{if(!(1&r)&&(c=f&&ue.call(t,"__wrapped__"),a=u&&ue.call(e,"__wrapped__"),c||a)){t=c?t.value():t,e=a?e.value():e,o||(o=new j),e=E(t,e,r,n,o);break t}if(i)e:if(o||(o=new j),c=1&r,a=Q(t),u=a.length,i=Q(e).length,u==i||c){for(f=u;f--;){var l=a[f];if(!(c?l in e:ue.call(e,l))){e=false;break e}}if((i=o.get(t))&&o.get(e))e=i==e;else{i=true,o.set(t,e),o.set(e,t);for(var s=c;++f<u;){var l=a[f],b=t[l],h=e[l];
if(n)var p=c?n(h,b,l,e,t,o):n(b,h,l,t,e,o);if(p===Bt?b!==h&&!E(b,h,r,n,o):!p){i=false;break}s||(s="constructor"==l)}i&&!s&&(r=t.constructor,n=e.constructor,r!=n&&"constructor"in t&&"constructor"in e&&!(typeof r=="function"&&r instanceof r&&typeof n=="function"&&n instanceof n)&&(i=false)),o.delete(t),o.delete(e),e=i}}else e=false;else e=false}}return e}function F(t){return dt(t)&&"[object Map]"==Ge(t)}function I(t,e){var r=e.length,n=r;if(null==t)return!n;for(t=Object(t);r--;){var o=e[r];if(o[2]?o[1]!==t[o[0]]:!(o[0]in t))return false;
}for(;++r<n;){var o=e[r],c=o[0],u=t[c],a=o[1];if(o[2]){if(u===Bt&&!(c in t))return false}else if(o=new j,void 0===Bt?!E(a,u,3,void 0,o):1)return false}return true}function M(t){return dt(t)&&"[object Set]"==Ge(t)}function U(t){return dt(t)&&gt(t.length)&&!!Nt[k(t)]}function B(t){return typeof t=="function"?t:null==t?Et:typeof t=="object"?Ke(t)?P(t[0],t[1]):D(t):It(t)}function D(t){var e=tt(t);return 1==e.length&&e[0][2]?it(e[0][0],e[0][1]):function(r){return r===t||I(r,e)}}function P(t,e){return ut(t)&&e===e&&!vt(e)?it(lt(t),e):function(r){
var n=Ot(r,t);return n===Bt&&n===e?St(r,t):E(e,n,3)}}function $(t){return function(e){return S(e,t)}}function L(t){if(typeof t=="string")return t;if(Ke(t))return n(t,L)+"";if(wt(t))return Ve?Ve.call(t):"";var e=t+"";return"0"==e&&1/t==-Dt?"-0":e}function C(t,e){e=V(e,t);var r;if(2>e.length)r=t;else{r=e;var n=0,o=-1,c=-1,u=r.length;for(0>n&&(n=-n>u?0:u+n),o=o>u?u:o,0>o&&(o+=u),u=n>o?0:o-n>>>0,n>>>=0,o=Array(u);++c<u;)o[c]=r[c+n];r=S(t,o)}t=r,null==t||delete t[lt(ht(e))]}function V(t,e){return Ke(t)?t:ut(t,e)?[t]:He(mt(t));
}function R(t,e){if(e)return t.slice();var r=t.length,r=pe?pe(r):new t.constructor(r);return t.copy(r),r}function T(t){var e=new t.constructor(t.byteLength);return new he(e).set(new he(t)),e}function N(t,e){var r=-1,n=t.length;for(e||(e=Array(n));++r<n;)e[r]=t[r];return e}function W(t,e,r){var n=!r;r||(r={});for(var o=-1,c=e.length;++o<c;){var u=e[o],a=Bt;a===Bt&&(a=t[u]),n?w(r,u,a):g(r,u,a)}return r}function G(t,e){return W(t,Ne(t),e)}function q(t,e){return W(t,We(t),e)}function H(t){return At(t)?Bt:t;
}function J(t,e,r,n,o,u){var a=1&r,i=t.length,f=e.length;if(i!=f&&!(a&&f>i))return false;if((f=u.get(t))&&u.get(e))return f==e;var f=-1,l=true,s=2&r?new y:Bt;for(u.set(t,e),u.set(e,t);++f<i;){var b=t[f],h=e[f];if(n)var p=a?n(h,b,f,e,t,u):n(b,h,f,t,e,u);if(p!==Bt){if(p)continue;l=false;break}if(s){if(!c(e,function(t,e){if(!s.has(e)&&(b===t||o(b,t,r,n,u)))return s.push(e)})){l=false;break}}else if(b!==h&&!o(b,h,r,n,u)){l=false;break}}return u.delete(t),u.delete(e),l}function K(t,e,r,n,o,c,u){switch(r){case"[object DataView]":
if(t.byteLength!=e.byteLength||t.byteOffset!=e.byteOffset)break;t=t.buffer,e=e.buffer;case"[object ArrayBuffer]":if(t.byteLength!=e.byteLength||!c(new he(t),new he(e)))break;return true;case"[object Boolean]":case"[object Date]":case"[object Number]":return yt(+t,+e);case"[object Error]":return t.name==e.name&&t.message==e.message;case"[object RegExp]":case"[object String]":return t==e+"";case"[object Map]":var a=i;case"[object Set]":if(a||(a=l),t.size!=e.size&&!(1&n))break;return(r=u.get(t))?r==e:(n|=2,
u.set(t,e),e=J(a(t),a(e),n,o,c,u),u.delete(t),e);case"[object Symbol]":if(Ce)return Ce.call(t)==Ce.call(e)}return false}function Q(t){return z(t,zt,Ne)}function X(t){return z(t,kt,We)}function Y(){var t=s.iteratee||Ft,t=t===Ft?B:t;return arguments.length?t(arguments[0],arguments[1]):t}function Z(t,e){var r=t.__data__,n=typeof e;return("string"==n||"number"==n||"symbol"==n||"boolean"==n?"__proto__"!==e:null===e)?r[typeof e=="string"?"string":"hash"]:r.map}function tt(t){for(var e=zt(t),r=e.length;r--;){
var n=e[r],o=t[n];e[r]=[n,o,o===o&&!vt(o)]}return e}function et(t,e){var r=null==t?Bt:t[e];return(!vt(r)||ae&&ae in r?0:(_t(r)?le:Rt).test(st(r)))?r:Bt}function rt(t){var e=t.length,r=new t.constructor(e);return e&&"string"==typeof t[0]&&ue.call(t,"index")&&(r.index=t.index,r.input=t.input),r}function nt(t,e,r){var n=t.constructor;switch(e){case"[object ArrayBuffer]":return T(t);case"[object Boolean]":case"[object Date]":return new n(+t);case"[object DataView]":return e=r?T(t.buffer):t.buffer,new t.constructor(e,t.byteOffset,t.byteLength);
case"[object Float32Array]":case"[object Float64Array]":case"[object Int8Array]":case"[object Int16Array]":case"[object Int32Array]":case"[object Uint8Array]":case"[object Uint8ClampedArray]":case"[object Uint16Array]":case"[object Uint32Array]":return e=r?T(t.buffer):t.buffer,new t.constructor(e,t.byteOffset,t.length);case"[object Map]":return new n;case"[object Number]":case"[object String]":return new n(t);case"[object RegExp]":return e=new t.constructor(t.source,Vt.exec(t)),e.lastIndex=t.lastIndex,
e;case"[object Set]":return new n;case"[object Symbol]":return Ce?Object(Ce.call(t)):{}}}function ot(t){return Ke(t)||Je(t)||!!(ve&&t&&t[ve])}function ct(t,e){var r=typeof t;return e=null==e?9007199254740991:e,!!e&&("number"==r||"symbol"!=r&&Tt.test(t))&&-1<t&&0==t%1&&t<e}function ut(t,e){if(Ke(t))return false;var r=typeof t;return!("number"!=r&&"symbol"!=r&&"boolean"!=r&&null!=t&&!wt(t))||($t.test(t)||!Pt.test(t)||null!=e&&t in Object(e))}function at(t){var e=t&&t.constructor;return t===(typeof e=="function"&&e.prototype||ne);
}function it(t,e){return function(r){return null!=r&&(r[t]===e&&(e!==Bt||t in Object(r)))}}function ft(e,r,n){return r=Se(r===Bt?e.length-1:r,0),function(){for(var o=arguments,c=-1,u=Se(o.length-r,0),a=Array(u);++c<u;)a[c]=o[r+c];for(c=-1,u=Array(r+1);++c<r;)u[c]=o[c];return u[r]=n(a),t(e,this,u)}}function lt(t){if(typeof t=="string"||wt(t))return t;var e=t+"";return"0"==e&&1/t==-Dt?"-0":e}function st(t){if(null!=t){try{return ce.call(t)}catch(t){}return t+""}return""}function bt(t){return(null==t?0:t.length)?O(t,1):[];
}function ht(t){var e=null==t?0:t.length;return e?t[e-1]:Bt}function pt(t,e){function r(){var n=arguments,o=e?e.apply(this,n):n[0],c=r.cache;return c.has(o)?c.get(o):(n=t.apply(this,n),r.cache=c.set(o,n)||c,n)}if(typeof t!="function"||null!=e&&typeof e!="function")throw new TypeError("Expected a function");return r.cache=new(pt.Cache||p),r}function yt(t,e){return t===e||t!==t&&e!==e}function jt(t){return null!=t&&gt(t.length)&&!_t(t)}function _t(t){return!!vt(t)&&(t=k(t),"[object Function]"==t||"[object GeneratorFunction]"==t||"[object AsyncFunction]"==t||"[object Proxy]"==t);
}function gt(t){return typeof t=="number"&&-1<t&&0==t%1&&9007199254740991>=t}function vt(t){var e=typeof t;return null!=t&&("object"==e||"function"==e)}function dt(t){return null!=t&&typeof t=="object"}function At(t){return!(!dt(t)||"[object Object]"!=k(t))&&(t=ye(t),null===t||(t=ue.call(t,"constructor")&&t.constructor,typeof t=="function"&&t instanceof t&&ce.call(t)==fe))}function wt(t){return typeof t=="symbol"||dt(t)&&"[object Symbol]"==k(t)}function mt(t){return null==t?"":L(t)}function Ot(t,e,r){
return t=null==t?Bt:S(t,e),t===Bt?r:t}function St(t,e){var r;if(r=null!=t){r=t;var n;n=V(e,r);for(var o=-1,c=n.length,u=false;++o<c;){var a=lt(n[o]);if(!(u=null!=r&&null!=r&&a in Object(r)))break;r=r[a]}u||++o!=c?r=u:(c=null==r?0:r.length,r=!!c&&gt(c)&&ct(a,c)&&(Ke(r)||Je(r)))}return r}function zt(t){if(jt(t))t=_(t);else if(at(t)){var e,r=[];for(e in Object(t))ue.call(t,e)&&"constructor"!=e&&r.push(e);t=r}else t=Oe(t);return t}function kt(t){if(jt(t))t=_(t,true);else if(vt(t)){var e,r=at(t),n=[];for(e in t)("constructor"!=e||!r&&ue.call(t,e))&&n.push(e);
t=n}else{if(e=[],null!=t)for(r in Object(t))e.push(r);t=e}return t}function xt(t){return function(){return t}}function Et(t){return t}function Ft(t){return B(typeof t=="function"?t:m(t,1))}function It(t){return ut(t)?u(lt(t)):$(t)}function Mt(){return[]}function Ut(){return false}var Bt,Dt=1/0,Pt=/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,$t=/^\w*$/,Lt=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,Ct=/\\(\\)?/g,Vt=/\w*$/,Rt=/^\[object .+?Constructor\]$/,Tt=/^(?:0|[1-9]\d*)$/,Nt={};
Nt["[object Float32Array]"]=Nt["[object Float64Array]"]=Nt["[object Int8Array]"]=Nt["[object Int16Array]"]=Nt["[object Int32Array]"]=Nt["[object Uint8Array]"]=Nt["[object Uint8ClampedArray]"]=Nt["[object Uint16Array]"]=Nt["[object Uint32Array]"]=true,Nt["[object Arguments]"]=Nt["[object Array]"]=Nt["[object ArrayBuffer]"]=Nt["[object Boolean]"]=Nt["[object DataView]"]=Nt["[object Date]"]=Nt["[object Error]"]=Nt["[object Function]"]=Nt["[object Map]"]=Nt["[object Number]"]=Nt["[object Object]"]=Nt["[object RegExp]"]=Nt["[object Set]"]=Nt["[object String]"]=Nt["[object WeakMap]"]=false;
var Wt={};Wt["[object Arguments]"]=Wt["[object Array]"]=Wt["[object ArrayBuffer]"]=Wt["[object DataView]"]=Wt["[object Boolean]"]=Wt["[object Date]"]=Wt["[object Float32Array]"]=Wt["[object Float64Array]"]=Wt["[object Int8Array]"]=Wt["[object Int16Array]"]=Wt["[object Int32Array]"]=Wt["[object Map]"]=Wt["[object Number]"]=Wt["[object Object]"]=Wt["[object RegExp]"]=Wt["[object Set]"]=Wt["[object String]"]=Wt["[object Symbol]"]=Wt["[object Uint8Array]"]=Wt["[object Uint8ClampedArray]"]=Wt["[object Uint16Array]"]=Wt["[object Uint32Array]"]=true,
Wt["[object Error]"]=Wt["[object Function]"]=Wt["[object WeakMap]"]=false;var Gt,qt=typeof __webpack_require__.g=="object"&&__webpack_require__.g&&__webpack_require__.g.Object===Object&&__webpack_require__.g,Ht=typeof self=="object"&&self&&self.Object===Object&&self,Jt=qt||Ht||Function("return this")(),Kt= true&&exports&&!exports.nodeType&&exports,Qt=Kt&&"object"=="object"&&module&&!module.nodeType&&module,Xt=Qt&&Qt.exports===Kt,Yt=Xt&&qt.process;t:{try{Gt=Yt&&Yt.binding&&Yt.binding("util");break t}catch(t){}Gt=void 0}var Zt=Gt&&Gt.isMap,te=Gt&&Gt.isSet,ee=Gt&&Gt.isTypedArray,re=Array.prototype,ne=Object.prototype,oe=Jt["__core-js_shared__"],ce=Function.prototype.toString,ue=ne.hasOwnProperty,ae=function(){
var t=/[^.]+$/.exec(oe&&oe.keys&&oe.keys.IE_PROTO||"");return t?"Symbol(src)_1."+t:""}(),ie=ne.toString,fe=ce.call(Object),le=RegExp("^"+ce.call(ue).replace(/[\\^$.*+?()[\]{}|]/g,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$"),se=Xt?Jt.Buffer:Bt,be=Jt.Symbol,he=Jt.Uint8Array,pe=se?se.a:Bt,ye=f(Object.getPrototypeOf),je=Object.create,_e=ne.propertyIsEnumerable,ge=re.splice,ve=be?be.isConcatSpreadable:Bt,de=be?be.toStringTag:Bt,Ae=function(){try{var t=et(Object,"defineProperty");
return t({},"",{}),t}catch(t){}}(),we=Object.getOwnPropertySymbols,me=se?se.isBuffer:Bt,Oe=f(Object.keys),Se=Math.max,ze=Date.now,ke=et(Jt,"DataView"),xe=et(Jt,"Map"),Ee=et(Jt,"Promise"),Fe=et(Jt,"Set"),Ie=et(Jt,"WeakMap"),Me=et(Object,"create"),Ue=st(ke),Be=st(xe),De=st(Ee),Pe=st(Fe),$e=st(Ie),Le=be?be.prototype:Bt,Ce=Le?Le.valueOf:Bt,Ve=Le?Le.toString:Bt,Re=function(){function t(){}return function(e){return vt(e)?je?je(e):(t.prototype=e,e=new t,t.prototype=Bt,e):{}}}();b.prototype.clear=function(){
this.__data__=Me?Me(null):{},this.size=0},b.prototype.delete=function(t){return t=this.has(t)&&delete this.__data__[t],this.size-=t?1:0,t},b.prototype.get=function(t){var e=this.__data__;return Me?(t=e[t],"__lodash_hash_undefined__"===t?Bt:t):ue.call(e,t)?e[t]:Bt},b.prototype.has=function(t){var e=this.__data__;return Me?e[t]!==Bt:ue.call(e,t)},b.prototype.set=function(t,e){var r=this.__data__;return this.size+=this.has(t)?0:1,r[t]=Me&&e===Bt?"__lodash_hash_undefined__":e,this},h.prototype.clear=function(){
this.__data__=[],this.size=0},h.prototype.delete=function(t){var e=this.__data__;return t=v(e,t),!(0>t)&&(t==e.length-1?e.pop():ge.call(e,t,1),--this.size,true)},h.prototype.get=function(t){var e=this.__data__;return t=v(e,t),0>t?Bt:e[t][1]},h.prototype.has=function(t){return-1<v(this.__data__,t)},h.prototype.set=function(t,e){var r=this.__data__,n=v(r,t);return 0>n?(++this.size,r.push([t,e])):r[n][1]=e,this},p.prototype.clear=function(){this.size=0,this.__data__={hash:new b,map:new(xe||h),string:new b
}},p.prototype.delete=function(t){return t=Z(this,t).delete(t),this.size-=t?1:0,t},p.prototype.get=function(t){return Z(this,t).get(t)},p.prototype.has=function(t){return Z(this,t).has(t)},p.prototype.set=function(t,e){var r=Z(this,t),n=r.size;return r.set(t,e),this.size+=r.size==n?0:1,this},y.prototype.add=y.prototype.push=function(t){return this.__data__.set(t,"__lodash_hash_undefined__"),this},y.prototype.has=function(t){return this.__data__.has(t)},j.prototype.clear=function(){this.__data__=new h,
this.size=0},j.prototype.delete=function(t){var e=this.__data__;return t=e.delete(t),this.size=e.size,t},j.prototype.get=function(t){return this.__data__.get(t)},j.prototype.has=function(t){return this.__data__.has(t)},j.prototype.set=function(t,e){var r=this.__data__;if(r instanceof h){var n=r.__data__;if(!xe||199>n.length)return n.push([t,e]),this.size=++r.size,this;r=this.__data__=new p(n)}return r.set(t,e),this.size=r.size,this};var Te=Ae?function(t,e){return Ae(t,"toString",{configurable:true,
enumerable:false,value:xt(e),writable:true})}:Et,Ne=we?function(t){return null==t?[]:(t=Object(t),r(we(t),function(e){return _e.call(t,e)}))}:Mt,We=we?function(t){for(var e=[];t;)o(e,Ne(t)),t=ye(t);return e}:Mt,Ge=k;(ke&&"[object DataView]"!=Ge(new ke(new ArrayBuffer(1)))||xe&&"[object Map]"!=Ge(new xe)||Ee&&"[object Promise]"!=Ge(Ee.resolve())||Fe&&"[object Set]"!=Ge(new Fe)||Ie&&"[object WeakMap]"!=Ge(new Ie))&&(Ge=function(t){var e=k(t);if(t=(t="[object Object]"==e?t.constructor:Bt)?st(t):"")switch(t){
case Ue:return"[object DataView]";case Be:return"[object Map]";case De:return"[object Promise]";case Pe:return"[object Set]";case $e:return"[object WeakMap]"}return e});var qe=function(t){var e=0,r=0;return function(){var n=ze(),o=16-(n-r);if(r=n,0<o){if(800<=++e)return arguments[0]}else e=0;return t.apply(Bt,arguments)}}(Te),He=function(t){t=pt(t,function(t){return 500===e.size&&e.clear(),t});var e=t.cache;return t}(function(t){var e=[];return 46===t.charCodeAt(0)&&e.push(""),t.replace(Lt,function(t,r,n,o){
e.push(n?o.replace(Ct,"$1"):r||t)}),e});pt.Cache=p;var Je=x(function(){return arguments}())?x:function(t){return dt(t)&&ue.call(t,"callee")&&!_e.call(t,"callee")},Ke=Array.isArray,Qe=me||Ut,Xe=Zt?a(Zt):F,Ye=te?a(te):M,Ze=ee?a(ee):U,tr=function(t,e){return qe(ft(t,e,Et),t+"")}(function(t,e){t=Object(t);var r,n=-1,o=e.length,c=2<o?e[2]:Bt;if(r=c){r=e[0];var u=e[1];if(vt(c)){var a=typeof u;r=!!("number"==a?jt(c)&&ct(u,c.length):"string"==a&&u in c)&&yt(c[u],r)}else r=false}for(r&&(o=1);++n<o;)for(c=e[n],
r=kt(c),u=-1,a=r.length;++u<a;){var i=r[u],f=t[i];(f===Bt||yt(f,ne[i])&&!ue.call(t,i))&&(t[i]=c[i])}return t}),er=function(t){return qe(ft(t,Bt,bt),t+"")}(function(t,e){var r={};if(null==t)return r;var o=false;e=n(e,function(e){return e=V(e,t),o||(o=1<e.length),e}),W(t,X(t),r),o&&(r=m(r,7,H));for(var c=e.length;c--;)C(r,e[c]);return r});s.constant=xt,s.defaults=tr,s.flatten=bt,s.iteratee=Ft,s.keys=zt,s.keysIn=kt,s.memoize=pt,s.omit=er,s.property=It,s.remove=function(t,e){var r=[];if(!t||!t.length)return r;
var n=-1,o=[],c=t.length;for(e=Y(e,3);++n<c;){var u=t[n];e(u,n,t)&&(r.push(u),o.push(n))}for(n=t?o.length:0,c=n-1;n--;)if(u=o[n],n==c||u!==a){var a=u;ct(u)?ge.call(t,u,1):C(t,u)}return r},s.eq=yt,s.get=Ot,s.hasIn=St,s.identity=Et,s.isArguments=Je,s.isArray=Ke,s.isArrayLike=jt,s.isBuffer=Qe,s.isFunction=_t,s.isLength=gt,s.isMap=Xe,s.isObject=vt,s.isObjectLike=dt,s.isPlainObject=At,s.isSet=Ye,s.isSymbol=wt,s.isTypedArray=Ze,s.last=ht,s.stubArray=Mt,s.stubFalse=Ut,s.toString=mt,s.VERSION="4.17.5",Qt&&((Qt.exports=s)._=s,
Kt._=s)}).call(this);

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => module['default'] :
/******/ 				() => module;
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/harmony module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.hmd = (module) => {
/******/ 			module = Object.create(module);
/******/ 			if (!module.children) module.children = [];
/******/ 			Object.defineProperty(module, 'exports', {
/******/ 				enumerable: true,
/******/ 				set: () => {
/******/ 					throw new Error('ES Modules may not assign module.exports or exports.*, Use ESM export syntax, instead: ' + module.id);
/******/ 				}
/******/ 			});
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__("./src/alephbet.coffee");
/******/ })()
;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9BbGVwaEJldC93ZWJwYWNrL3VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24iLCJ3ZWJwYWNrOi8vQWxlcGhCZXQvLi9ub2RlX21vZHVsZXMvYmFzaWwuanMvYnVpbGQvYmFzaWwuanMiLCJ3ZWJwYWNrOi8vQWxlcGhCZXQvLi9zcmMvYWRhcHRlcnMuY29mZmVlIiwid2VicGFjazovL0FsZXBoQmV0Ly4vc3JjL2FsZXBoYmV0LmNvZmZlZSIsIndlYnBhY2s6Ly9BbGVwaEJldC8uL3NyYy9vcHRpb25zLmNvZmZlZSIsIndlYnBhY2s6Ly9BbGVwaEJldC8uL3NyYy9zdG9yYWdlLmNvZmZlZSIsIndlYnBhY2s6Ly9BbGVwaEJldC8uL3NyYy91dGlscy5jb2ZmZWUiLCJ3ZWJwYWNrOi8vQWxlcGhCZXQvLi9ub2RlX21vZHVsZXMvY3J5cHRvLWpzL2NvcmUuanMiLCJ3ZWJwYWNrOi8vQWxlcGhCZXQvLi9ub2RlX21vZHVsZXMvY3J5cHRvLWpzL3NoYTEuanMiLCJ3ZWJwYWNrOi8vQWxlcGhCZXQvLi9ub2RlX21vZHVsZXMvdXVpZC9kaXN0L2VzbS1icm93c2VyL3JlZ2V4LmpzIiwid2VicGFjazovL0FsZXBoQmV0Ly4vbm9kZV9tb2R1bGVzL3V1aWQvZGlzdC9lc20tYnJvd3Nlci9ybmcuanMiLCJ3ZWJwYWNrOi8vQWxlcGhCZXQvLi9ub2RlX21vZHVsZXMvdXVpZC9kaXN0L2VzbS1icm93c2VyL3N0cmluZ2lmeS5qcyIsIndlYnBhY2s6Ly9BbGVwaEJldC8uL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvdjQuanMiLCJ3ZWJwYWNrOi8vQWxlcGhCZXQvLi9ub2RlX21vZHVsZXMvdXVpZC9kaXN0L2VzbS1icm93c2VyL3ZhbGlkYXRlLmpzIiwid2VicGFjazovL0FsZXBoQmV0Ly4vdmVuZG9yL2xvZGFzaC5jdXN0b20ubWluLmpzIiwid2VicGFjazovL0FsZXBoQmV0L3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL0FsZXBoQmV0L3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovL0FsZXBoQmV0L3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9BbGVwaEJldC93ZWJwYWNrL3J1bnRpbWUvZ2xvYmFsIiwid2VicGFjazovL0FsZXBoQmV0L3dlYnBhY2svcnVudGltZS9oYXJtb255IG1vZHVsZSBkZWNvcmF0b3IiLCJ3ZWJwYWNrOi8vQWxlcGhCZXQvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9BbGVwaEJldC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL0FsZXBoQmV0L3dlYnBhY2svcnVudGltZS9ub2RlIG1vZHVsZSBkZWNvcmF0b3IiLCJ3ZWJwYWNrOi8vQWxlcGhCZXQvd2VicGFjay9zdGFydHVwIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCxPOzs7Ozs7Ozs7OztBQ1ZBO0FBQ0E7QUFDQTtBQUNBLDhCQUE4QjtBQUM5Qjs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCLHNCQUFzQjtBQUN4QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxtQkFBbUIsZ0JBQWdCO0FBQ25DO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBLElBQUk7QUFDSixHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSwrRkFBK0YseUJBQXlCLEVBQUU7QUFDMUg7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsZ0JBQWdCLGtCQUFr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QUFrQix3REFBd0QsdUZBQXVGLDJCQUEyQixlQUFlLFlBQVksb0NBQW9DLFFBQVEsT0FBTyxXQUFXLFVBQVUsZUFBZSx3RUFBd0UsYUFBYSxhQUFhLE1BQU07QUFDOWUsd0JBQXdCLE1BQU0sRUFBRSxrQkFBa0Isa0RBQWtELFNBQVMsaUJBQWlCLDRCQUE0QixlQUFlLFNBQVMsb0JBQW9CLFlBQVksa0JBQWtCLG9DQUFvQyw4QkFBOEIsbUJBQW1CLElBQUksV0FBVyxTQUFTLEVBQUUseUlBQXlJLFNBQVM7QUFDcmUseUJBQXlCLGFBQWEsTUFBTSxFQUFFLFdBQVcsZ0NBQWdDLHlCQUF5QixJQUFJLHdCQUF3QixRQUFRLDRCQUE0QixTQUFTO0FBQzNMLFFBQVEsYTs7Ozs7O1VDMUNSO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDeEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxnQ0FBZ0MsWUFBWTtXQUM1QztXQUNBLEU7Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx3Q0FBd0MseUNBQXlDO1dBQ2pGO1dBQ0E7V0FDQSxFOzs7OztXQ1BBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsRUFBRTtXQUNGO1dBQ0E7V0FDQSxDQUFDLEk7Ozs7O1dDUEQ7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLEVBQUU7V0FDRjtXQUNBLEU7Ozs7O1dDVkEsc0Y7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0Esc0RBQXNELGtCQUFrQjtXQUN4RTtXQUNBLCtDQUErQyxjQUFjO1dBQzdELEU7Ozs7O1dDTkE7V0FDQTtXQUNBO1dBQ0E7V0FDQSxFOzs7O1VDSkE7VUFDQTtVQUNBO1VBQ0EiLCJmaWxlIjoiYWxlcGhiZXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShbXSwgZmFjdG9yeSk7XG5cdGVsc2UgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKVxuXHRcdGV4cG9ydHNbXCJBbGVwaEJldFwiXSA9IGZhY3RvcnkoKTtcblx0ZWxzZVxuXHRcdHJvb3RbXCJBbGVwaEJldFwiXSA9IGZhY3RvcnkoKTtcbn0pKHNlbGYsIGZ1bmN0aW9uKCkge1xucmV0dXJuICIsIihmdW5jdGlvbiAoKSB7XG5cdC8vIEJhc2lsXG5cdHZhciBCYXNpbCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG5cdFx0cmV0dXJuIEJhc2lsLnV0aWxzLmV4dGVuZCh7fSwgQmFzaWwucGx1Z2lucywgbmV3IEJhc2lsLlN0b3JhZ2UoKS5pbml0KG9wdGlvbnMpKTtcblx0fTtcblxuXHQvLyBWZXJzaW9uXG5cdEJhc2lsLnZlcnNpb24gPSAnMC40LjExJztcblxuXHQvLyBVdGlsc1xuXHRCYXNpbC51dGlscyA9IHtcblx0XHRleHRlbmQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdHZhciBkZXN0aW5hdGlvbiA9IHR5cGVvZiBhcmd1bWVudHNbMF0gPT09ICdvYmplY3QnID8gYXJndW1lbnRzWzBdIDoge307XG5cdFx0XHRmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZiAoYXJndW1lbnRzW2ldICYmIHR5cGVvZiBhcmd1bWVudHNbaV0gPT09ICdvYmplY3QnKVxuXHRcdFx0XHRcdGZvciAodmFyIHByb3BlcnR5IGluIGFyZ3VtZW50c1tpXSlcblx0XHRcdFx0XHRcdGRlc3RpbmF0aW9uW3Byb3BlcnR5XSA9IGFyZ3VtZW50c1tpXVtwcm9wZXJ0eV07XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZGVzdGluYXRpb247XG5cdFx0fSxcblx0XHRlYWNoOiBmdW5jdGlvbiAob2JqLCBmbkl0ZXJhdG9yLCBjb250ZXh0KSB7XG5cdFx0XHRpZiAodGhpcy5pc0FycmF5KG9iaikpIHtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBvYmoubGVuZ3RoOyBpKyspXG5cdFx0XHRcdFx0aWYgKGZuSXRlcmF0b3IuY2FsbChjb250ZXh0LCBvYmpbaV0sIGkpID09PSBmYWxzZSkgcmV0dXJuO1xuXHRcdFx0fSBlbHNlIGlmIChvYmopIHtcblx0XHRcdFx0Zm9yICh2YXIga2V5IGluIG9iailcblx0XHRcdFx0XHRpZiAoZm5JdGVyYXRvci5jYWxsKGNvbnRleHQsIG9ialtrZXldLCBrZXkpID09PSBmYWxzZSkgcmV0dXJuO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0dHJ5RWFjaDogZnVuY3Rpb24gKG9iaiwgZm5JdGVyYXRvciwgZm5FcnJvciwgY29udGV4dCkge1xuXHRcdFx0dGhpcy5lYWNoKG9iaiwgZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRyZXR1cm4gZm5JdGVyYXRvci5jYWxsKGNvbnRleHQsIHZhbHVlLCBrZXkpO1xuXHRcdFx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0XHRcdGlmICh0aGlzLmlzRnVuY3Rpb24oZm5FcnJvcikpIHtcblx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdGZuRXJyb3IuY2FsbChjb250ZXh0LCB2YWx1ZSwga2V5LCBlcnJvcik7XG5cdFx0XHRcdFx0XHR9IGNhdGNoIChlcnJvcikge31cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0sIHRoaXMpO1xuXHRcdH0sXG5cdFx0cmVnaXN0ZXJQbHVnaW46IGZ1bmN0aW9uIChtZXRob2RzKSB7XG5cdFx0XHRCYXNpbC5wbHVnaW5zID0gdGhpcy5leHRlbmQobWV0aG9kcywgQmFzaWwucGx1Z2lucyk7XG5cdFx0fSxcblx0XHRnZXRUeXBlT2Y6IGZ1bmN0aW9uIChvYmopIHtcblx0XHRcdGlmICh0eXBlb2Ygb2JqID09PSAndW5kZWZpbmVkJyB8fCBvYmogPT09IG51bGwpXG5cdFx0XHRcdHJldHVybiAnJyArIG9iajtcblx0XHRcdHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKS5yZXBsYWNlKC9eXFxbb2JqZWN0XFxzKC4qKVxcXSQvLCBmdW5jdGlvbiAoJDAsICQxKSB7IHJldHVybiAkMS50b0xvd2VyQ2FzZSgpOyB9KTtcblx0XHR9XG5cdH07XG5cblx0Ly8gQWRkIHNvbWUgaXNUeXBlIG1ldGhvZHM6IGlzQXJndW1lbnRzLCBpc0Jvb2xlYW4sIGlzRnVuY3Rpb24sIGlzU3RyaW5nLCBpc0FycmF5LCBpc051bWJlciwgaXNEYXRlLCBpc1JlZ0V4cCwgaXNVbmRlZmluZWQsIGlzTnVsbC5cblx0dmFyIHR5cGVzID0gWydBcmd1bWVudHMnLCAnQm9vbGVhbicsICdGdW5jdGlvbicsICdTdHJpbmcnLCAnQXJyYXknLCAnTnVtYmVyJywgJ0RhdGUnLCAnUmVnRXhwJywgJ1VuZGVmaW5lZCcsICdOdWxsJ107XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgdHlwZXMubGVuZ3RoOyBpKyspIHtcblx0XHRCYXNpbC51dGlsc1snaXMnICsgdHlwZXNbaV1dID0gKGZ1bmN0aW9uICh0eXBlKSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24gKG9iaikge1xuXHRcdFx0XHRyZXR1cm4gQmFzaWwudXRpbHMuZ2V0VHlwZU9mKG9iaikgPT09IHR5cGUudG9Mb3dlckNhc2UoKTtcblx0XHRcdH07XG5cdFx0fSkodHlwZXNbaV0pO1xuXHR9XG5cblx0Ly8gUGx1Z2luc1xuXHRCYXNpbC5wbHVnaW5zID0ge307XG5cblx0Ly8gT3B0aW9uc1xuXHRCYXNpbC5vcHRpb25zID0gQmFzaWwudXRpbHMuZXh0ZW5kKHtcblx0XHRuYW1lc3BhY2U6ICdiNDVpMScsXG5cdFx0c3RvcmFnZXM6IFsnbG9jYWwnLCAnY29va2llJywgJ3Nlc3Npb24nLCAnbWVtb3J5J10sXG5cdFx0ZXhwaXJlRGF5czogMzY1LFxuXHRcdGtleURlbGltaXRlcjogJy4nXG5cdH0sIHdpbmRvdy5CYXNpbCA/IHdpbmRvdy5CYXNpbC5vcHRpb25zIDoge30pO1xuXG5cdC8vIFN0b3JhZ2Vcblx0QmFzaWwuU3RvcmFnZSA9IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgX3NhbHQgPSAnYjQ1aTEnICsgKE1hdGgucmFuZG9tKCkgKyAxKVxuXHRcdFx0XHQudG9TdHJpbmcoMzYpXG5cdFx0XHRcdC5zdWJzdHJpbmcoNyksXG5cdFx0XHRfc3RvcmFnZXMgPSB7fSxcblx0XHRcdF9pc1ZhbGlkS2V5ID0gZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0XHR2YXIgdHlwZSA9IEJhc2lsLnV0aWxzLmdldFR5cGVPZihrZXkpO1xuXHRcdFx0XHRyZXR1cm4gKHR5cGUgPT09ICdzdHJpbmcnICYmIGtleSkgfHwgdHlwZSA9PT0gJ251bWJlcicgfHwgdHlwZSA9PT0gJ2Jvb2xlYW4nO1xuXHRcdFx0fSxcblx0XHRcdF90b1N0b3JhZ2VzQXJyYXkgPSBmdW5jdGlvbiAoc3RvcmFnZXMpIHtcblx0XHRcdFx0aWYgKEJhc2lsLnV0aWxzLmlzQXJyYXkoc3RvcmFnZXMpKVxuXHRcdFx0XHRcdHJldHVybiBzdG9yYWdlcztcblx0XHRcdFx0cmV0dXJuIEJhc2lsLnV0aWxzLmlzU3RyaW5nKHN0b3JhZ2VzKSA/IFtzdG9yYWdlc10gOiBbXTtcblx0XHRcdH0sXG5cdFx0XHRfdG9TdG9yZWRLZXkgPSBmdW5jdGlvbiAobmFtZXNwYWNlLCBwYXRoLCBkZWxpbWl0ZXIpIHtcblx0XHRcdFx0dmFyIGtleSA9ICcnO1xuXHRcdFx0XHRpZiAoX2lzVmFsaWRLZXkocGF0aCkpIHtcblx0XHRcdFx0XHRrZXkgKz0gcGF0aDtcblx0XHRcdFx0fSBlbHNlIGlmIChCYXNpbC51dGlscy5pc0FycmF5KHBhdGgpKSB7XG5cdFx0XHRcdFx0cGF0aCA9IEJhc2lsLnV0aWxzLmlzRnVuY3Rpb24ocGF0aC5maWx0ZXIpID8gcGF0aC5maWx0ZXIoX2lzVmFsaWRLZXkpIDogcGF0aDtcblx0XHRcdFx0XHRrZXkgPSBwYXRoLmpvaW4oZGVsaW1pdGVyKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4ga2V5ICYmIF9pc1ZhbGlkS2V5KG5hbWVzcGFjZSkgPyBuYW1lc3BhY2UgKyBkZWxpbWl0ZXIgKyBrZXkgOiBrZXk7XG4gXHRcdFx0fSxcblx0XHRcdF90b0tleU5hbWUgPSBmdW5jdGlvbiAobmFtZXNwYWNlLCBrZXksIGRlbGltaXRlcikge1xuXHRcdFx0XHRpZiAoIV9pc1ZhbGlkS2V5KG5hbWVzcGFjZSkpXG5cdFx0XHRcdFx0cmV0dXJuIGtleTtcblx0XHRcdFx0cmV0dXJuIGtleS5yZXBsYWNlKG5ldyBSZWdFeHAoJ14nICsgbmFtZXNwYWNlICsgZGVsaW1pdGVyKSwgJycpO1xuXHRcdFx0fSxcblx0XHRcdF90b1N0b3JlZFZhbHVlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG5cdFx0XHRcdHJldHVybiBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG5cdFx0XHR9LFxuXHRcdFx0X2Zyb21TdG9yZWRWYWx1ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuXHRcdFx0XHRyZXR1cm4gdmFsdWUgPyBKU09OLnBhcnNlKHZhbHVlKSA6IG51bGw7XG5cdFx0XHR9O1xuXG5cdFx0Ly8gSFRNTDUgd2ViIHN0b3JhZ2UgaW50ZXJmYWNlXG5cdFx0dmFyIHdlYlN0b3JhZ2VJbnRlcmZhY2UgPSB7XG5cdFx0XHRlbmdpbmU6IG51bGwsXG5cdFx0XHRjaGVjazogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdHdpbmRvd1t0aGlzLmVuZ2luZV0uc2V0SXRlbShfc2FsdCwgdHJ1ZSk7XG5cdFx0XHRcdFx0d2luZG93W3RoaXMuZW5naW5lXS5yZW1vdmVJdGVtKF9zYWx0KTtcblx0XHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH0sXG5cdFx0XHRzZXQ6IGZ1bmN0aW9uIChrZXksIHZhbHVlLCBvcHRpb25zKSB7XG5cdFx0XHRcdGlmICgha2V5KVxuXHRcdFx0XHRcdHRocm93IEVycm9yKCdpbnZhbGlkIGtleScpO1xuXHRcdFx0XHR3aW5kb3dbdGhpcy5lbmdpbmVdLnNldEl0ZW0oa2V5LCB2YWx1ZSk7XG5cdFx0XHR9LFxuXHRcdFx0Z2V0OiBmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHRcdHJldHVybiB3aW5kb3dbdGhpcy5lbmdpbmVdLmdldEl0ZW0oa2V5KTtcblx0XHRcdH0sXG5cdFx0XHRyZW1vdmU6IGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdFx0d2luZG93W3RoaXMuZW5naW5lXS5yZW1vdmVJdGVtKGtleSk7XG5cdFx0XHR9LFxuXHRcdFx0cmVzZXQ6IGZ1bmN0aW9uIChuYW1lc3BhY2UpIHtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDAsIGtleTsgaSA8IHdpbmRvd1t0aGlzLmVuZ2luZV0ubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRrZXkgPSB3aW5kb3dbdGhpcy5lbmdpbmVdLmtleShpKTtcblx0XHRcdFx0XHRpZiAoIW5hbWVzcGFjZSB8fCBrZXkuaW5kZXhPZihuYW1lc3BhY2UpID09PSAwKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnJlbW92ZShrZXkpO1xuXHRcdFx0XHRcdFx0aS0tO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdGtleXM6IGZ1bmN0aW9uIChuYW1lc3BhY2UsIGRlbGltaXRlcikge1xuXHRcdFx0XHR2YXIga2V5cyA9IFtdO1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMCwga2V5OyBpIDwgd2luZG93W3RoaXMuZW5naW5lXS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdGtleSA9IHdpbmRvd1t0aGlzLmVuZ2luZV0ua2V5KGkpO1xuXHRcdFx0XHRcdGlmICghbmFtZXNwYWNlIHx8IGtleS5pbmRleE9mKG5hbWVzcGFjZSkgPT09IDApXG5cdFx0XHRcdFx0XHRrZXlzLnB1c2goX3RvS2V5TmFtZShuYW1lc3BhY2UsIGtleSwgZGVsaW1pdGVyKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIGtleXM7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdC8vIGxvY2FsIHN0b3JhZ2Vcblx0XHRfc3RvcmFnZXMubG9jYWwgPSBCYXNpbC51dGlscy5leHRlbmQoe30sIHdlYlN0b3JhZ2VJbnRlcmZhY2UsIHtcblx0XHRcdGVuZ2luZTogJ2xvY2FsU3RvcmFnZSdcblx0XHR9KTtcblx0XHQvLyBzZXNzaW9uIHN0b3JhZ2Vcblx0XHRfc3RvcmFnZXMuc2Vzc2lvbiA9IEJhc2lsLnV0aWxzLmV4dGVuZCh7fSwgd2ViU3RvcmFnZUludGVyZmFjZSwge1xuXHRcdFx0ZW5naW5lOiAnc2Vzc2lvblN0b3JhZ2UnXG5cdFx0fSk7XG5cblx0XHQvLyBtZW1vcnkgc3RvcmFnZVxuXHRcdF9zdG9yYWdlcy5tZW1vcnkgPSB7XG5cdFx0XHRfaGFzaDoge30sXG5cdFx0XHRjaGVjazogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH0sXG5cdFx0XHRzZXQ6IGZ1bmN0aW9uIChrZXksIHZhbHVlLCBvcHRpb25zKSB7XG5cdFx0XHRcdGlmICgha2V5KVxuXHRcdFx0XHRcdHRocm93IEVycm9yKCdpbnZhbGlkIGtleScpO1xuXHRcdFx0XHR0aGlzLl9oYXNoW2tleV0gPSB2YWx1ZTtcblx0XHRcdH0sXG5cdFx0XHRnZXQ6IGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuX2hhc2hba2V5XSB8fCBudWxsO1xuXHRcdFx0fSxcblx0XHRcdHJlbW92ZTogZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0XHRkZWxldGUgdGhpcy5faGFzaFtrZXldO1xuXHRcdFx0fSxcblx0XHRcdHJlc2V0OiBmdW5jdGlvbiAobmFtZXNwYWNlKSB7XG5cdFx0XHRcdGZvciAodmFyIGtleSBpbiB0aGlzLl9oYXNoKSB7XG5cdFx0XHRcdFx0aWYgKCFuYW1lc3BhY2UgfHwga2V5LmluZGV4T2YobmFtZXNwYWNlKSA9PT0gMClcblx0XHRcdFx0XHRcdHRoaXMucmVtb3ZlKGtleSk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRrZXlzOiBmdW5jdGlvbiAobmFtZXNwYWNlLCBkZWxpbWl0ZXIpIHtcblx0XHRcdFx0dmFyIGtleXMgPSBbXTtcblx0XHRcdFx0Zm9yICh2YXIga2V5IGluIHRoaXMuX2hhc2gpXG5cdFx0XHRcdFx0aWYgKCFuYW1lc3BhY2UgfHwga2V5LmluZGV4T2YobmFtZXNwYWNlKSA9PT0gMClcblx0XHRcdFx0XHRcdGtleXMucHVzaChfdG9LZXlOYW1lKG5hbWVzcGFjZSwga2V5LCBkZWxpbWl0ZXIpKTtcblx0XHRcdFx0cmV0dXJuIGtleXM7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdC8vIGNvb2tpZSBzdG9yYWdlXG5cdFx0X3N0b3JhZ2VzLmNvb2tpZSA9IHtcblx0XHRcdGNoZWNrOiBmdW5jdGlvbiAob3B0aW9ucykge1xuXHRcdFx0XHRpZiAoIW5hdmlnYXRvci5jb29raWVFbmFibGVkKVxuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0aWYgKHdpbmRvdy5zZWxmICE9PSB3aW5kb3cudG9wKSB7XG5cdFx0XHRcdFx0Ly8gd2UgbmVlZCB0byBjaGVjayB0aGlyZC1wYXJ0eSBjb29raWVzO1xuXHRcdFx0XHRcdHZhciBjb29raWUgPSAndGhpcmRwYXJ0eS5jaGVjaz0nICsgTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogMTAwMCk7XG5cdFx0XHRcdFx0ZG9jdW1lbnQuY29va2llID0gY29va2llICsgJzsgcGF0aD0vJztcblx0XHRcdFx0XHRyZXR1cm4gZG9jdW1lbnQuY29va2llLmluZGV4T2YoY29va2llKSAhPT0gLTE7XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gaWYgY29va2llIHNlY3VyZSBhY3RpdmF0ZWQsIGVuc3VyZSBpdCB3b3JrcyAobm90IHRoZSBjYXNlIGlmIHdlIGFyZSBpbiBodHRwIG9ubHkpXG5cdFx0XHRcdGlmIChvcHRpb25zICYmIG9wdGlvbnMuc2VjdXJlKSB7XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdHRoaXMuc2V0KF9zYWx0LCBfc2FsdCwgb3B0aW9ucyk7XG5cdFx0XHRcdFx0XHR2YXIgaGFzU2VjdXJlbHlQZXJzaXRlZCA9IHRoaXMuZ2V0KF9zYWx0KSA9PT0gX3NhbHQ7XG5cdFx0XHRcdFx0XHR0aGlzLnJlbW92ZShfc2FsdCk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gaGFzU2VjdXJlbHlQZXJzaXRlZDtcblx0XHRcdFx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH0sXG5cdFx0XHRzZXQ6IGZ1bmN0aW9uIChrZXksIHZhbHVlLCBvcHRpb25zKSB7XG5cdFx0XHRcdGlmICghdGhpcy5jaGVjaygpKVxuXHRcdFx0XHRcdHRocm93IEVycm9yKCdjb29raWVzIGFyZSBkaXNhYmxlZCcpO1xuXHRcdFx0XHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0XHRcdFx0aWYgKCFrZXkpXG5cdFx0XHRcdFx0dGhyb3cgRXJyb3IoJ2ludmFsaWQga2V5Jyk7XG5cdFx0XHRcdHZhciBjb29raWUgPSBlbmNvZGVVUklDb21wb25lbnQoa2V5KSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSk7XG5cdFx0XHRcdC8vIGhhbmRsZSBleHBpcmF0aW9uIGRheXNcblx0XHRcdFx0aWYgKG9wdGlvbnMuZXhwaXJlRGF5cykge1xuXHRcdFx0XHRcdHZhciBkYXRlID0gbmV3IERhdGUoKTtcblx0XHRcdFx0XHRkYXRlLnNldFRpbWUoZGF0ZS5nZXRUaW1lKCkgKyAob3B0aW9ucy5leHBpcmVEYXlzICogMjQgKiA2MCAqIDYwICogMTAwMCkpO1xuXHRcdFx0XHRcdGNvb2tpZSArPSAnOyBleHBpcmVzPScgKyBkYXRlLnRvR01UU3RyaW5nKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gaGFuZGxlIGRvbWFpblxuXHRcdFx0XHRpZiAob3B0aW9ucy5kb21haW4gJiYgb3B0aW9ucy5kb21haW4gIT09IGRvY3VtZW50LmRvbWFpbikge1xuXHRcdFx0XHRcdHZhciBfZG9tYWluID0gb3B0aW9ucy5kb21haW4ucmVwbGFjZSgvXlxcLi8sICcnKTtcblx0XHRcdFx0XHRpZiAoZG9jdW1lbnQuZG9tYWluLmluZGV4T2YoX2RvbWFpbikgPT09IC0xIHx8IF9kb21haW4uc3BsaXQoJy4nKS5sZW5ndGggPD0gMSlcblx0XHRcdFx0XHRcdHRocm93IEVycm9yKCdpbnZhbGlkIGRvbWFpbicpO1xuXHRcdFx0XHRcdGNvb2tpZSArPSAnOyBkb21haW49JyArIG9wdGlvbnMuZG9tYWluO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIGhhbmRsZSBzYW1lIHNpdGVcblx0XHRcdFx0aWYgKG9wdGlvbnMuc2FtZVNpdGUgJiYgWydsYXgnLCdzdHJpY3QnLCdub25lJ10uaW5jbHVkZXMob3B0aW9ucy5zYW1lU2l0ZS50b0xvd2VyQ2FzZSgpKSkge1xuXHRcdFx0XHRcdGNvb2tpZSArPSAnOyBTYW1lU2l0ZT0nICsgb3B0aW9ucy5zYW1lU2l0ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBoYW5kbGUgc2VjdXJlXG5cdFx0XHRcdGlmIChvcHRpb25zLnNlY3VyZSA9PT0gdHJ1ZSkge1xuXHRcdFx0XHRcdGNvb2tpZSArPSAnOyBTZWN1cmUnO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGRvY3VtZW50LmNvb2tpZSA9IGNvb2tpZSArICc7IHBhdGg9Lyc7XG5cdFx0XHR9LFxuXHRcdFx0Z2V0OiBmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHRcdGlmICghdGhpcy5jaGVjaygpKVxuXHRcdFx0XHRcdHRocm93IEVycm9yKCdjb29raWVzIGFyZSBkaXNhYmxlZCcpO1xuXHRcdFx0XHR2YXIgZW5jb2RlZEtleSA9IGVuY29kZVVSSUNvbXBvbmVudChrZXkpO1xuXHRcdFx0XHR2YXIgY29va2llcyA9IGRvY3VtZW50LmNvb2tpZSA/IGRvY3VtZW50LmNvb2tpZS5zcGxpdCgnOycpIDogW107XG5cdFx0XHRcdC8vIHJldHJpZXZlIGxhc3QgdXBkYXRlZCBjb29raWUgZmlyc3Rcblx0XHRcdFx0Zm9yICh2YXIgaSA9IGNvb2tpZXMubGVuZ3RoIC0gMSwgY29va2llOyBpID49IDA7IGktLSkge1xuXHRcdFx0XHRcdGNvb2tpZSA9IGNvb2tpZXNbaV0ucmVwbGFjZSgvXlxccyovLCAnJyk7XG5cdFx0XHRcdFx0aWYgKGNvb2tpZS5pbmRleE9mKGVuY29kZWRLZXkgKyAnPScpID09PSAwKVxuXHRcdFx0XHRcdFx0cmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChjb29raWUuc3Vic3RyaW5nKGVuY29kZWRLZXkubGVuZ3RoICsgMSwgY29va2llLmxlbmd0aCkpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0fSxcblx0XHRcdHJlbW92ZTogZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0XHQvLyByZW1vdmUgY29va2llIGZyb20gbWFpbiBkb21haW5cblx0XHRcdFx0dGhpcy5zZXQoa2V5LCAnJywgeyBleHBpcmVEYXlzOiAtMSB9KTtcblx0XHRcdFx0Ly8gcmVtb3ZlIGNvb2tpZSBmcm9tIHVwcGVyIGRvbWFpbnNcblx0XHRcdFx0dmFyIGRvbWFpblBhcnRzID0gZG9jdW1lbnQuZG9tYWluLnNwbGl0KCcuJyk7XG5cdFx0XHRcdGZvciAodmFyIGkgPSBkb21haW5QYXJ0cy5sZW5ndGg7IGkgPiAxOyBpLS0pIHtcblx0XHRcdFx0XHR0aGlzLnNldChrZXksICcnLCB7IGV4cGlyZURheXM6IC0xLCBkb21haW46ICcuJyArIGRvbWFpblBhcnRzLnNsaWNlKC0gaSkuam9pbignLicpIH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0cmVzZXQ6IGZ1bmN0aW9uIChuYW1lc3BhY2UpIHtcblx0XHRcdFx0dmFyIGNvb2tpZXMgPSBkb2N1bWVudC5jb29raWUgPyBkb2N1bWVudC5jb29raWUuc3BsaXQoJzsnKSA6IFtdO1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMCwgY29va2llLCBrZXk7IGkgPCBjb29raWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0Y29va2llID0gY29va2llc1tpXS5yZXBsYWNlKC9eXFxzKi8sICcnKTtcblx0XHRcdFx0XHRrZXkgPSBjb29raWUuc3Vic3RyKDAsIGNvb2tpZS5pbmRleE9mKCc9JykpO1xuXHRcdFx0XHRcdGlmICghbmFtZXNwYWNlIHx8IGtleS5pbmRleE9mKG5hbWVzcGFjZSkgPT09IDApXG5cdFx0XHRcdFx0XHR0aGlzLnJlbW92ZShrZXkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0a2V5czogZnVuY3Rpb24gKG5hbWVzcGFjZSwgZGVsaW1pdGVyKSB7XG5cdFx0XHRcdGlmICghdGhpcy5jaGVjaygpKVxuXHRcdFx0XHRcdHRocm93IEVycm9yKCdjb29raWVzIGFyZSBkaXNhYmxlZCcpO1xuXHRcdFx0XHR2YXIga2V5cyA9IFtdLFxuXHRcdFx0XHRcdGNvb2tpZXMgPSBkb2N1bWVudC5jb29raWUgPyBkb2N1bWVudC5jb29raWUuc3BsaXQoJzsnKSA6IFtdO1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMCwgY29va2llLCBrZXk7IGkgPCBjb29raWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0Y29va2llID0gY29va2llc1tpXS5yZXBsYWNlKC9eXFxzKi8sICcnKTtcblx0XHRcdFx0XHRrZXkgPSBkZWNvZGVVUklDb21wb25lbnQoY29va2llLnN1YnN0cigwLCBjb29raWUuaW5kZXhPZignPScpKSk7XG5cdFx0XHRcdFx0aWYgKCFuYW1lc3BhY2UgfHwga2V5LmluZGV4T2YobmFtZXNwYWNlKSA9PT0gMClcblx0XHRcdFx0XHRcdGtleXMucHVzaChfdG9LZXlOYW1lKG5hbWVzcGFjZSwga2V5LCBkZWxpbWl0ZXIpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4ga2V5cztcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdGluaXQ6IGZ1bmN0aW9uIChvcHRpb25zKSB7XG5cdFx0XHRcdHRoaXMuc2V0T3B0aW9ucyhvcHRpb25zKTtcblx0XHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0XHR9LFxuXHRcdFx0c2V0T3B0aW9uczogZnVuY3Rpb24gKG9wdGlvbnMpIHtcblx0XHRcdFx0dGhpcy5vcHRpb25zID0gQmFzaWwudXRpbHMuZXh0ZW5kKHt9LCB0aGlzLm9wdGlvbnMgfHwgQmFzaWwub3B0aW9ucywgb3B0aW9ucyk7XG5cdFx0XHR9LFxuXHRcdFx0c3VwcG9ydDogZnVuY3Rpb24gKHN0b3JhZ2UpIHtcblx0XHRcdFx0cmV0dXJuIF9zdG9yYWdlcy5oYXNPd25Qcm9wZXJ0eShzdG9yYWdlKTtcblx0XHRcdH0sXG5cdFx0XHRjaGVjazogZnVuY3Rpb24gKHN0b3JhZ2UpIHtcblx0XHRcdFx0aWYgKHRoaXMuc3VwcG9ydChzdG9yYWdlKSlcblx0XHRcdFx0XHRyZXR1cm4gX3N0b3JhZ2VzW3N0b3JhZ2VdLmNoZWNrKHRoaXMub3B0aW9ucyk7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH0sXG5cdFx0XHRzZXQ6IGZ1bmN0aW9uIChrZXksIHZhbHVlLCBvcHRpb25zKSB7XG5cdFx0XHRcdG9wdGlvbnMgPSBCYXNpbC51dGlscy5leHRlbmQoe30sIHRoaXMub3B0aW9ucywgb3B0aW9ucyk7XG5cdFx0XHRcdGlmICghKGtleSA9IF90b1N0b3JlZEtleShvcHRpb25zLm5hbWVzcGFjZSwga2V5LCBvcHRpb25zLmtleURlbGltaXRlcikpKVxuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0dmFsdWUgPSBvcHRpb25zLnJhdyA9PT0gdHJ1ZSA/IHZhbHVlIDogX3RvU3RvcmVkVmFsdWUodmFsdWUpO1xuXHRcdFx0XHR2YXIgd2hlcmUgPSBudWxsO1xuXHRcdFx0XHQvLyB0cnkgdG8gc2V0IGtleS92YWx1ZSBpbiBmaXJzdCBhdmFpbGFibGUgc3RvcmFnZVxuXHRcdFx0XHRCYXNpbC51dGlscy50cnlFYWNoKF90b1N0b3JhZ2VzQXJyYXkob3B0aW9ucy5zdG9yYWdlcyksIGZ1bmN0aW9uIChzdG9yYWdlLCBpbmRleCkge1xuXHRcdFx0XHRcdF9zdG9yYWdlc1tzdG9yYWdlXS5zZXQoa2V5LCB2YWx1ZSwgb3B0aW9ucyk7XG5cdFx0XHRcdFx0d2hlcmUgPSBzdG9yYWdlO1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTsgLy8gYnJlYWs7XG5cdFx0XHRcdH0sIG51bGwsIHRoaXMpO1xuXHRcdFx0XHRpZiAoIXdoZXJlKSB7XG5cdFx0XHRcdFx0Ly8ga2V5IGhhcyBub3QgYmVlbiBzZXQgYW55d2hlcmVcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gcmVtb3ZlIGtleSBmcm9tIGFsbCBvdGhlciBzdG9yYWdlc1xuXHRcdFx0XHRCYXNpbC51dGlscy50cnlFYWNoKF90b1N0b3JhZ2VzQXJyYXkob3B0aW9ucy5zdG9yYWdlcyksIGZ1bmN0aW9uIChzdG9yYWdlLCBpbmRleCkge1xuXHRcdFx0XHRcdGlmIChzdG9yYWdlICE9PSB3aGVyZSlcblx0XHRcdFx0XHRcdF9zdG9yYWdlc1tzdG9yYWdlXS5yZW1vdmUoa2V5KTtcblx0XHRcdFx0fSwgbnVsbCwgdGhpcyk7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fSxcblx0XHRcdGdldDogZnVuY3Rpb24gKGtleSwgb3B0aW9ucykge1xuXHRcdFx0XHRvcHRpb25zID0gQmFzaWwudXRpbHMuZXh0ZW5kKHt9LCB0aGlzLm9wdGlvbnMsIG9wdGlvbnMpO1xuXHRcdFx0XHRpZiAoIShrZXkgPSBfdG9TdG9yZWRLZXkob3B0aW9ucy5uYW1lc3BhY2UsIGtleSwgb3B0aW9ucy5rZXlEZWxpbWl0ZXIpKSlcblx0XHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdFx0dmFyIHZhbHVlID0gbnVsbDtcblx0XHRcdFx0QmFzaWwudXRpbHMudHJ5RWFjaChfdG9TdG9yYWdlc0FycmF5KG9wdGlvbnMuc3RvcmFnZXMpLCBmdW5jdGlvbiAoc3RvcmFnZSwgaW5kZXgpIHtcblx0XHRcdFx0XHRpZiAodmFsdWUgIT09IG51bGwpXG5cdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7IC8vIGJyZWFrIGlmIGEgdmFsdWUgaGFzIGFscmVhZHkgYmVlbiBmb3VuZC5cblx0XHRcdFx0XHR2YWx1ZSA9IF9zdG9yYWdlc1tzdG9yYWdlXS5nZXQoa2V5LCBvcHRpb25zKSB8fCBudWxsO1xuXHRcdFx0XHRcdHZhbHVlID0gb3B0aW9ucy5yYXcgPT09IHRydWUgPyB2YWx1ZSA6IF9mcm9tU3RvcmVkVmFsdWUodmFsdWUpO1xuXHRcdFx0XHR9LCBmdW5jdGlvbiAoc3RvcmFnZSwgaW5kZXgsIGVycm9yKSB7XG5cdFx0XHRcdFx0dmFsdWUgPSBudWxsO1xuXHRcdFx0XHR9LCB0aGlzKTtcblx0XHRcdFx0cmV0dXJuIHZhbHVlO1xuXHRcdFx0fSxcblx0XHRcdHJlbW92ZTogZnVuY3Rpb24gKGtleSwgb3B0aW9ucykge1xuXHRcdFx0XHRvcHRpb25zID0gQmFzaWwudXRpbHMuZXh0ZW5kKHt9LCB0aGlzLm9wdGlvbnMsIG9wdGlvbnMpO1xuXHRcdFx0XHRpZiAoIShrZXkgPSBfdG9TdG9yZWRLZXkob3B0aW9ucy5uYW1lc3BhY2UsIGtleSwgb3B0aW9ucy5rZXlEZWxpbWl0ZXIpKSlcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdEJhc2lsLnV0aWxzLnRyeUVhY2goX3RvU3RvcmFnZXNBcnJheShvcHRpb25zLnN0b3JhZ2VzKSwgZnVuY3Rpb24gKHN0b3JhZ2UpIHtcblx0XHRcdFx0XHRfc3RvcmFnZXNbc3RvcmFnZV0ucmVtb3ZlKGtleSk7XG5cdFx0XHRcdH0sIG51bGwsIHRoaXMpO1xuXHRcdFx0fSxcblx0XHRcdHJlc2V0OiBmdW5jdGlvbiAob3B0aW9ucykge1xuXHRcdFx0XHRvcHRpb25zID0gQmFzaWwudXRpbHMuZXh0ZW5kKHt9LCB0aGlzLm9wdGlvbnMsIG9wdGlvbnMpO1xuXHRcdFx0XHRCYXNpbC51dGlscy50cnlFYWNoKF90b1N0b3JhZ2VzQXJyYXkob3B0aW9ucy5zdG9yYWdlcyksIGZ1bmN0aW9uIChzdG9yYWdlKSB7XG5cdFx0XHRcdFx0X3N0b3JhZ2VzW3N0b3JhZ2VdLnJlc2V0KG9wdGlvbnMubmFtZXNwYWNlKTtcblx0XHRcdFx0fSwgbnVsbCwgdGhpcyk7XG5cdFx0XHR9LFxuXHRcdFx0a2V5czogZnVuY3Rpb24gKG9wdGlvbnMpIHtcblx0XHRcdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdFx0XHRcdHZhciBrZXlzID0gW107XG5cdFx0XHRcdGZvciAodmFyIGtleSBpbiB0aGlzLmtleXNNYXAob3B0aW9ucykpXG5cdFx0XHRcdFx0a2V5cy5wdXNoKGtleSk7XG5cdFx0XHRcdHJldHVybiBrZXlzO1xuXHRcdFx0fSxcblx0XHRcdGtleXNNYXA6IGZ1bmN0aW9uIChvcHRpb25zKSB7XG5cdFx0XHRcdG9wdGlvbnMgPSBCYXNpbC51dGlscy5leHRlbmQoe30sIHRoaXMub3B0aW9ucywgb3B0aW9ucyk7XG5cdFx0XHRcdHZhciBtYXAgPSB7fTtcblx0XHRcdFx0QmFzaWwudXRpbHMudHJ5RWFjaChfdG9TdG9yYWdlc0FycmF5KG9wdGlvbnMuc3RvcmFnZXMpLCBmdW5jdGlvbiAoc3RvcmFnZSkge1xuXHRcdFx0XHRcdEJhc2lsLnV0aWxzLmVhY2goX3N0b3JhZ2VzW3N0b3JhZ2VdLmtleXMob3B0aW9ucy5uYW1lc3BhY2UsIG9wdGlvbnMua2V5RGVsaW1pdGVyKSwgZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0XHRcdFx0bWFwW2tleV0gPSBCYXNpbC51dGlscy5pc0FycmF5KG1hcFtrZXldKSA/IG1hcFtrZXldIDogW107XG5cdFx0XHRcdFx0XHRtYXBba2V5XS5wdXNoKHN0b3JhZ2UpO1xuXHRcdFx0XHRcdH0sIHRoaXMpO1xuXHRcdFx0XHR9LCBudWxsLCB0aGlzKTtcblx0XHRcdFx0cmV0dXJuIG1hcDtcblx0XHRcdH1cblx0XHR9O1xuXHR9O1xuXG5cdC8vIEFjY2VzcyB0byBuYXRpdmUgc3RvcmFnZXMsIHdpdGhvdXQgbmFtZXNwYWNlIG9yIGJhc2lsIHZhbHVlIGRlY29yYXRpb25cblx0QmFzaWwubWVtb3J5ID0gbmV3IEJhc2lsLlN0b3JhZ2UoKS5pbml0KHsgc3RvcmFnZXM6ICdtZW1vcnknLCBuYW1lc3BhY2U6IG51bGwsIHJhdzogdHJ1ZSB9KTtcblx0QmFzaWwuY29va2llID0gbmV3IEJhc2lsLlN0b3JhZ2UoKS5pbml0KHsgc3RvcmFnZXM6ICdjb29raWUnLCBuYW1lc3BhY2U6IG51bGwsIHJhdzogdHJ1ZSB9KTtcblx0QmFzaWwubG9jYWxTdG9yYWdlID0gbmV3IEJhc2lsLlN0b3JhZ2UoKS5pbml0KHsgc3RvcmFnZXM6ICdsb2NhbCcsIG5hbWVzcGFjZTogbnVsbCwgcmF3OiB0cnVlIH0pO1xuXHRCYXNpbC5zZXNzaW9uU3RvcmFnZSA9IG5ldyBCYXNpbC5TdG9yYWdlKCkuaW5pdCh7IHN0b3JhZ2VzOiAnc2Vzc2lvbicsIG5hbWVzcGFjZTogbnVsbCwgcmF3OiB0cnVlIH0pO1xuXG5cdC8vIGJyb3dzZXIgZXhwb3J0XG5cdHdpbmRvdy5CYXNpbCA9IEJhc2lsO1xuXG5cdC8vIEFNRCBleHBvcnRcblx0aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuXHRcdGRlZmluZShmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiBCYXNpbDtcblx0XHR9KTtcblx0Ly8gY29tbW9uanMgZXhwb3J0XG5cdH0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcblx0XHRtb2R1bGUuZXhwb3J0cyA9IEJhc2lsO1xuXHR9XG5cbn0pKCk7XG4iLCJ1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKVxuU3RvcmFnZSA9IHJlcXVpcmUoJy4vc3RvcmFnZScpXG5cbmNsYXNzIEFkYXB0ZXJzXG5cbiAgIyMgQWRhcHRlciBmb3IgdXNpbmcgdGhlIGdpbWVsIGJhY2tlbmQuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vQWxlcGhiZXQvZ2ltZWxcbiAgIyMgdXNlcyBqUXVlcnkgdG8gc2VuZCBkYXRhIGlmIGAkLmFqYXhgIGlzIGZvdW5kLiBGYWxscyBiYWNrIG9uIHBsYWluIGpzIHhoclxuICAjIyBwYXJhbXM6XG4gICMjIC0gdXJsOiBHaW1lbCB0cmFjayBVUkwgdG8gcG9zdCBldmVudHMgdG9cbiAgIyMgLSBuYW1lcHNhY2U6IG5hbWVzcGFjZSBmb3IgR2ltZWwgKGFsbG93cyBzZXR0aW5nIGRpZmZlcmVudCBlbnZpcm9ubWVudHMgZXRjKVxuICAjIyAtIHN0b3JhZ2UgKG9wdGlvbmFsKSAtIHN0b3JhZ2UgYWRhcHRlciBmb3IgdGhlIHF1ZXVlXG4gIGNsYXNzIEBHaW1lbEFkYXB0ZXJcbiAgICBxdWV1ZV9uYW1lOiAnX2dpbWVsX3F1ZXVlJ1xuXG4gICAgY29uc3RydWN0b3I6ICh1cmwsIG5hbWVzcGFjZSwgc3RvcmFnZSA9IEFkYXB0ZXJzLkxvY2FsU3RvcmFnZUFkYXB0ZXIpIC0+XG4gICAgICBAX3N0b3JhZ2UgPSBzdG9yYWdlXG4gICAgICBAdXJsID0gdXJsXG4gICAgICBAbmFtZXNwYWNlID0gbmFtZXNwYWNlXG4gICAgICBAX3F1ZXVlID0gSlNPTi5wYXJzZShAX3N0b3JhZ2UuZ2V0KEBxdWV1ZV9uYW1lKSB8fCAnW10nKVxuICAgICAgQF9mbHVzaCgpXG5cbiAgICBfcmVtb3ZlX3F1dWlkOiAocXV1aWQpIC0+XG4gICAgICAoZXJyLCByZXMpID0+XG4gICAgICAgIHJldHVybiBpZiBlcnJcbiAgICAgICAgdXRpbHMucmVtb3ZlKEBfcXVldWUsIChlbCkgLT4gZWwucHJvcGVydGllcy5fcXV1aWQgPT0gcXV1aWQpXG4gICAgICAgIEBfc3RvcmFnZS5zZXQoQHF1ZXVlX25hbWUsIEpTT04uc3RyaW5naWZ5KEBfcXVldWUpKVxuXG4gICAgX2pxdWVyeV9nZXQ6ICh1cmwsIGRhdGEsIGNhbGxiYWNrKSAtPlxuICAgICAgdXRpbHMubG9nKCdzZW5kIHJlcXVlc3QgdXNpbmcgalF1ZXJ5JylcbiAgICAgIHdpbmRvdy5qUXVlcnkuYWpheFxuICAgICAgICBtZXRob2Q6ICdHRVQnXG4gICAgICAgIHVybDogdXJsXG4gICAgICAgIGRhdGE6IGRhdGFcbiAgICAgICAgc3VjY2VzczogY2FsbGJhY2tcblxuICAgIF9wbGFpbl9qc19nZXQ6ICh1cmwsIGRhdGEsIGNhbGxiYWNrKSAtPlxuICAgICAgdXRpbHMubG9nKCdmYWxsYmFjayBvbiBwbGFpbiBqcyB4aHInKVxuICAgICAgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcbiAgICAgIHBhcmFtcyA9IChcIiN7ZW5jb2RlVVJJQ29tcG9uZW50KGspfT0je2VuY29kZVVSSUNvbXBvbmVudCh2KX1cIiBmb3Igayx2IG9mIGRhdGEpXG4gICAgICBwYXJhbXMgPSBwYXJhbXMuam9pbignJicpLnJlcGxhY2UoLyUyMC9nLCAnKycpXG4gICAgICB4aHIub3BlbignR0VUJywgXCIje3VybH0/I3twYXJhbXN9XCIpXG4gICAgICB4aHIub25sb2FkID0gLT5cbiAgICAgICAgaWYgeGhyLnN0YXR1cyA9PSAyMDBcbiAgICAgICAgICBjYWxsYmFjaygpXG4gICAgICB4aHIuc2VuZCgpXG5cbiAgICBfYWpheF9nZXQ6ICh1cmwsIGRhdGEsIGNhbGxiYWNrKSAtPlxuICAgICAgaWYgd2luZG93LmpRdWVyeT8uYWpheFxuICAgICAgICBAX2pxdWVyeV9nZXQodXJsLCBkYXRhLCBjYWxsYmFjaylcbiAgICAgIGVsc2VcbiAgICAgICAgQF9wbGFpbl9qc19nZXQodXJsLCBkYXRhLCBjYWxsYmFjaylcblxuICAgIF9mbHVzaDogLT5cbiAgICAgIGZvciBpdGVtIGluIEBfcXVldWVcbiAgICAgICAgY2FsbGJhY2sgPSBAX3JlbW92ZV9xdXVpZChpdGVtLnByb3BlcnRpZXMuX3F1dWlkKVxuICAgICAgICBAX2FqYXhfZ2V0KEB1cmwsIHV0aWxzLm9taXQoaXRlbS5wcm9wZXJ0aWVzLCAnX3F1dWlkJyksIGNhbGxiYWNrKVxuICAgICAgICBudWxsXG5cbiAgICBfdXNlcl91dWlkOiAoZXhwZXJpbWVudCwgZ29hbCkgLT5cbiAgICAgIHJldHVybiB1dGlscy51dWlkKCkgdW5sZXNzIGV4cGVyaW1lbnQudXNlcl9pZFxuICAgICAgIyBpZiBnb2FsIGlzIG5vdCB1bmlxdWUsIHdlIHRyYWNrIGl0IGV2ZXJ5IHRpbWUuIHJldHVybiBhIG5ldyByYW5kb20gdXVpZFxuICAgICAgcmV0dXJuIHV0aWxzLnV1aWQoKSB1bmxlc3MgZ29hbC51bmlxdWVcbiAgICAgICMgZm9yIGEgZ2l2ZW4gdXNlciBpZCwgbmFtZXNwYWNlIGFuZCBleHBlcmltZW50LCB0aGUgdXVpZCB3aWxsIGFsd2F5cyBiZSB0aGUgc2FtZVxuICAgICAgIyB0aGlzIGF2b2lkcyBjb3VudGluZyBnb2FscyB0d2ljZSBmb3IgdGhlIHNhbWUgdXNlciBhY3Jvc3MgZGlmZmVyZW50IGRldmljZXNcbiAgICAgIHV0aWxzLnNoYTEoXCIje0BuYW1lc3BhY2V9LiN7ZXhwZXJpbWVudC5uYW1lfS4je2V4cGVyaW1lbnQudXNlcl9pZH1cIilcblxuICAgIF90cmFjazogKGV4cGVyaW1lbnQsIHZhcmlhbnQsIGdvYWwpIC0+XG4gICAgICB1dGlscy5sb2coXCJQZXJzaXN0ZW50IFF1ZXVlIEdpbWVsIHRyYWNrOiAje0BuYW1lc3BhY2V9LCAje2V4cGVyaW1lbnQubmFtZX0sICN7dmFyaWFudH0sICN7Z29hbC5uYW1lfVwiKVxuICAgICAgQF9xdWV1ZS5zaGlmdCgpIGlmIEBfcXVldWUubGVuZ3RoID4gMTAwXG4gICAgICBAX3F1ZXVlLnB1c2hcbiAgICAgICAgcHJvcGVydGllczpcbiAgICAgICAgICBleHBlcmltZW50OiBleHBlcmltZW50Lm5hbWVcbiAgICAgICAgICBfcXV1aWQ6IHV0aWxzLnV1aWQoKSAgIyBxdWV1ZSB1dWlkICh1c2VkIG9ubHkgaW50ZXJuYWxseSlcbiAgICAgICAgICB1dWlkOiBAX3VzZXJfdXVpZChleHBlcmltZW50LCBnb2FsKVxuICAgICAgICAgIHZhcmlhbnQ6IHZhcmlhbnRcbiAgICAgICAgICBldmVudDogZ29hbC5uYW1lXG4gICAgICAgICAgbmFtZXNwYWNlOiBAbmFtZXNwYWNlXG4gICAgICBAX3N0b3JhZ2Uuc2V0KEBxdWV1ZV9uYW1lLCBKU09OLnN0cmluZ2lmeShAX3F1ZXVlKSlcbiAgICAgIEBfZmx1c2goKVxuXG4gICAgZXhwZXJpbWVudF9zdGFydDogKGV4cGVyaW1lbnQsIHZhcmlhbnQpIC0+XG4gICAgICBAX3RyYWNrKGV4cGVyaW1lbnQsIHZhcmlhbnQsIHtuYW1lOiAncGFydGljaXBhdGUnLCB1bmlxdWU6IHRydWV9KVxuXG4gICAgZ29hbF9jb21wbGV0ZTogKGV4cGVyaW1lbnQsIHZhcmlhbnQsIGdvYWxfbmFtZSwgcHJvcHMpIC0+XG4gICAgICBAX3RyYWNrKGV4cGVyaW1lbnQsIHZhcmlhbnQsIHV0aWxzLmRlZmF1bHRzKHtuYW1lOiBnb2FsX25hbWV9LCBwcm9wcykpXG5cblxuICBjbGFzcyBAUGVyc2lzdGVudFF1ZXVlR29vZ2xlQW5hbHl0aWNzQWRhcHRlclxuICAgIG5hbWVzcGFjZTogJ2FsZXBoYmV0J1xuICAgIHF1ZXVlX25hbWU6ICdfZ2FfcXVldWUnXG5cbiAgICBjb25zdHJ1Y3RvcjogKHN0b3JhZ2UgPSBBZGFwdGVycy5Mb2NhbFN0b3JhZ2VBZGFwdGVyKSAtPlxuICAgICAgQF9zdG9yYWdlID0gc3RvcmFnZVxuICAgICAgQF9xdWV1ZSA9IEpTT04ucGFyc2UoQF9zdG9yYWdlLmdldChAcXVldWVfbmFtZSkgfHwgJ1tdJylcbiAgICAgIEBfZmx1c2goKVxuXG4gICAgX3JlbW92ZV91dWlkOiAodXVpZCkgLT5cbiAgICAgID0+XG4gICAgICAgIHV0aWxzLnJlbW92ZShAX3F1ZXVlLCAoZWwpIC0+IGVsLnV1aWQgPT0gdXVpZClcbiAgICAgICAgQF9zdG9yYWdlLnNldChAcXVldWVfbmFtZSwgSlNPTi5zdHJpbmdpZnkoQF9xdWV1ZSkpXG5cbiAgICBfZmx1c2g6IC0+XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2dhIG5vdCBkZWZpbmVkLiBQbGVhc2UgbWFrZSBzdXJlIHlvdXIgVW5pdmVyc2FsIGFuYWx5dGljcyBpcyBzZXQgdXAgY29ycmVjdGx5JykgaWYgdHlwZW9mIGdhIGlzbnQgJ2Z1bmN0aW9uJ1xuICAgICAgZm9yIGl0ZW0gaW4gQF9xdWV1ZVxuICAgICAgICBjYWxsYmFjayA9IEBfcmVtb3ZlX3V1aWQoaXRlbS51dWlkKVxuICAgICAgICBnYSgnc2VuZCcsICdldmVudCcsIGl0ZW0uY2F0ZWdvcnksIGl0ZW0uYWN0aW9uLCBpdGVtLmxhYmVsLCB7J2hpdENhbGxiYWNrJzogY2FsbGJhY2ssICdub25JbnRlcmFjdGlvbic6IDF9KVxuXG4gICAgX3RyYWNrOiAoY2F0ZWdvcnksIGFjdGlvbiwgbGFiZWwpIC0+XG4gICAgICB1dGlscy5sb2coXCJQZXJzaXN0ZW50IFF1ZXVlIEdvb2dsZSBVbml2ZXJzYWwgQW5hbHl0aWNzIHRyYWNrOiAje2NhdGVnb3J5fSwgI3thY3Rpb259LCAje2xhYmVsfVwiKVxuICAgICAgQF9xdWV1ZS5zaGlmdCgpIGlmIEBfcXVldWUubGVuZ3RoID4gMTAwXG4gICAgICBAX3F1ZXVlLnB1c2goe3V1aWQ6IHV0aWxzLnV1aWQoKSwgY2F0ZWdvcnk6IGNhdGVnb3J5LCBhY3Rpb246IGFjdGlvbiwgbGFiZWw6IGxhYmVsfSlcbiAgICAgIEBfc3RvcmFnZS5zZXQoQHF1ZXVlX25hbWUsIEpTT04uc3RyaW5naWZ5KEBfcXVldWUpKVxuICAgICAgQF9mbHVzaCgpXG5cbiAgICBleHBlcmltZW50X3N0YXJ0OiAoZXhwZXJpbWVudCwgdmFyaWFudCkgLT5cbiAgICAgIEBfdHJhY2soQG5hbWVzcGFjZSwgXCIje2V4cGVyaW1lbnQubmFtZX0gfCAje3ZhcmlhbnR9XCIsICdWaXNpdG9ycycpXG5cbiAgICBnb2FsX2NvbXBsZXRlOiAoZXhwZXJpbWVudCwgdmFyaWFudCwgZ29hbF9uYW1lLCBfcHJvcHMpIC0+XG4gICAgICBAX3RyYWNrKEBuYW1lc3BhY2UsIFwiI3tleHBlcmltZW50Lm5hbWV9IHwgI3t2YXJpYW50fVwiLCBnb2FsX25hbWUpXG5cblxuICBjbGFzcyBAUGVyc2lzdGVudFF1ZXVlS2VlbkFkYXB0ZXJcbiAgICBxdWV1ZV9uYW1lOiAnX2tlZW5fcXVldWUnXG5cbiAgICBjb25zdHJ1Y3RvcjogKGtlZW5fY2xpZW50LCBzdG9yYWdlID0gQWRhcHRlcnMuTG9jYWxTdG9yYWdlQWRhcHRlcikgLT5cbiAgICAgIEBjbGllbnQgPSBrZWVuX2NsaWVudFxuICAgICAgQF9zdG9yYWdlID0gc3RvcmFnZVxuICAgICAgQF9xdWV1ZSA9IEpTT04ucGFyc2UoQF9zdG9yYWdlLmdldChAcXVldWVfbmFtZSkgfHwgJ1tdJylcbiAgICAgIEBfZmx1c2goKVxuXG4gICAgX3JlbW92ZV9xdXVpZDogKHF1dWlkKSAtPlxuICAgICAgKGVyciwgcmVzKSA9PlxuICAgICAgICByZXR1cm4gaWYgZXJyXG4gICAgICAgIHV0aWxzLnJlbW92ZShAX3F1ZXVlLCAoZWwpIC0+IGVsLnByb3BlcnRpZXMuX3F1dWlkID09IHF1dWlkKVxuICAgICAgICBAX3N0b3JhZ2Uuc2V0KEBxdWV1ZV9uYW1lLCBKU09OLnN0cmluZ2lmeShAX3F1ZXVlKSlcblxuICAgIF9mbHVzaDogLT5cbiAgICAgIGZvciBpdGVtIGluIEBfcXVldWVcbiAgICAgICAgY2FsbGJhY2sgPSBAX3JlbW92ZV9xdXVpZChpdGVtLnByb3BlcnRpZXMuX3F1dWlkKVxuICAgICAgICBAY2xpZW50LmFkZEV2ZW50KGl0ZW0uZXhwZXJpbWVudF9uYW1lLCB1dGlscy5vbWl0KGl0ZW0ucHJvcGVydGllcywgJ19xdXVpZCcpLCBjYWxsYmFjaylcblxuICAgIF91c2VyX3V1aWQ6IChleHBlcmltZW50LCBnb2FsKSAtPlxuICAgICAgcmV0dXJuIHV0aWxzLnV1aWQoKSB1bmxlc3MgZXhwZXJpbWVudC51c2VyX2lkXG4gICAgICAjIGlmIGdvYWwgaXMgbm90IHVuaXF1ZSwgd2UgdHJhY2sgaXQgZXZlcnkgdGltZS4gcmV0dXJuIGEgbmV3IHJhbmRvbSB1dWlkXG4gICAgICByZXR1cm4gdXRpbHMudXVpZCgpIHVubGVzcyBnb2FsLnVuaXF1ZVxuICAgICAgIyBmb3IgYSBnaXZlbiB1c2VyIGlkLCBuYW1lc3BhY2UgYW5kIGV4cGVyaW1lbnQsIHRoZSB1dWlkIHdpbGwgYWx3YXlzIGJlIHRoZSBzYW1lXG4gICAgICAjIHRoaXMgYXZvaWRzIGNvdW50aW5nIGdvYWxzIHR3aWNlIGZvciB0aGUgc2FtZSB1c2VyIGFjcm9zcyBkaWZmZXJlbnQgZGV2aWNlc1xuICAgICAgdXRpbHMuc2hhMShcIiN7QG5hbWVzcGFjZX0uI3tleHBlcmltZW50Lm5hbWV9LiN7ZXhwZXJpbWVudC51c2VyX2lkfVwiKVxuXG4gICAgX3RyYWNrOiAoZXhwZXJpbWVudCwgdmFyaWFudCwgZ29hbCkgLT5cbiAgICAgIHV0aWxzLmxvZyhcIlBlcnNpc3RlbnQgUXVldWUgS2VlbiB0cmFjazogI3tleHBlcmltZW50Lm5hbWV9LCAje3ZhcmlhbnR9LCAje2V2ZW50fVwiKVxuICAgICAgQF9xdWV1ZS5zaGlmdCgpIGlmIEBfcXVldWUubGVuZ3RoID4gMTAwXG4gICAgICBAX3F1ZXVlLnB1c2hcbiAgICAgICAgZXhwZXJpbWVudF9uYW1lOiBleHBlcmltZW50Lm5hbWVcbiAgICAgICAgcHJvcGVydGllczpcbiAgICAgICAgICBfcXV1aWQ6IHV0aWxzLnV1aWQoKSAgIyBxdWV1ZSB1dWlkICh1c2VkIG9ubHkgaW50ZXJuYWxseSlcbiAgICAgICAgICB1dWlkOiBAX3VzZXJfdXVpZChleHBlcmltZW50LCBnb2FsKVxuICAgICAgICAgIHZhcmlhbnQ6IHZhcmlhbnRcbiAgICAgICAgICBldmVudDogZ29hbC5uYW1lXG4gICAgICBAX3N0b3JhZ2Uuc2V0KEBxdWV1ZV9uYW1lLCBKU09OLnN0cmluZ2lmeShAX3F1ZXVlKSlcbiAgICAgIEBfZmx1c2goKVxuXG4gICAgZXhwZXJpbWVudF9zdGFydDogKGV4cGVyaW1lbnQsIHZhcmlhbnQpIC0+XG4gICAgICBAX3RyYWNrKGV4cGVyaW1lbnQsIHZhcmlhbnQsIHtuYW1lOiAncGFydGljaXBhdGUnLCB1bmlxdWU6IHRydWV9KVxuXG4gICAgZ29hbF9jb21wbGV0ZTogKGV4cGVyaW1lbnQsIHZhcmlhbnQsIGdvYWxfbmFtZSwgcHJvcHMpIC0+XG4gICAgICBAX3RyYWNrKGV4cGVyaW1lbnQsIHZhcmlhbnQsIHV0aWxzLmRlZmF1bHRzKHtuYW1lOiBnb2FsX25hbWV9LCBwcm9wcykpXG5cblxuICBjbGFzcyBAR29vZ2xlVW5pdmVyc2FsQW5hbHl0aWNzQWRhcHRlclxuICAgIEBuYW1lc3BhY2U6ICdhbGVwaGJldCdcblxuICAgIEBfdHJhY2s6IChjYXRlZ29yeSwgYWN0aW9uLCBsYWJlbCkgLT5cbiAgICAgIHV0aWxzLmxvZyhcIkdvb2dsZSBVbml2ZXJzYWwgQW5hbHl0aWNzIHRyYWNrOiAje2NhdGVnb3J5fSwgI3thY3Rpb259LCAje2xhYmVsfVwiKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdnYSBub3QgZGVmaW5lZC4gUGxlYXNlIG1ha2Ugc3VyZSB5b3VyIFVuaXZlcnNhbCBhbmFseXRpY3MgaXMgc2V0IHVwIGNvcnJlY3RseScpIGlmIHR5cGVvZiBnYSBpc250ICdmdW5jdGlvbidcbiAgICAgIGdhKCdzZW5kJywgJ2V2ZW50JywgY2F0ZWdvcnksIGFjdGlvbiwgbGFiZWwsIHsnbm9uSW50ZXJhY3Rpb24nOiAxfSlcblxuICAgIEBleHBlcmltZW50X3N0YXJ0OiAoZXhwZXJpbWVudCwgdmFyaWFudCkgLT5cbiAgICAgIEBfdHJhY2soQG5hbWVzcGFjZSwgXCIje2V4cGVyaW1lbnQubmFtZX0gfCAje3ZhcmlhbnR9XCIsICdWaXNpdG9ycycpXG5cbiAgICBAZ29hbF9jb21wbGV0ZTogKGV4cGVyaW1lbnQsIHZhcmlhbnQsIGdvYWxfbmFtZSwgX3Byb3BzKSAtPlxuICAgICAgQF90cmFjayhAbmFtZXNwYWNlLCBcIiN7ZXhwZXJpbWVudC5uYW1lfSB8ICN7dmFyaWFudH1cIiwgZ29hbF9uYW1lKVxuXG5cbiAgY2xhc3MgQExvY2FsU3RvcmFnZUFkYXB0ZXJcbiAgICBAbmFtZXNwYWNlOiAnYWxlcGhiZXQnXG4gICAgQHNldDogKGtleSwgdmFsdWUpIC0+XG4gICAgICBuZXcgU3RvcmFnZShAbmFtZXNwYWNlKS5zZXQoa2V5LCB2YWx1ZSlcbiAgICBAZ2V0OiAoa2V5KSAtPlxuICAgICAgbmV3IFN0b3JhZ2UoQG5hbWVzcGFjZSkuZ2V0KGtleSlcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEFkYXB0ZXJzXG4iLCJ1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKVxuYWRhcHRlcnMgPSByZXF1aXJlKCcuL2FkYXB0ZXJzJylcbm9wdGlvbnMgPSByZXF1aXJlKCcuL29wdGlvbnMnKVxuXG5jbGFzcyBBbGVwaEJldFxuICBAb3B0aW9ucyA9IG9wdGlvbnNcbiAgQHV0aWxzID0gdXRpbHNcblxuICBAR2ltZWxBZGFwdGVyID0gYWRhcHRlcnMuR2ltZWxBZGFwdGVyXG4gIEBQZXJzaXN0ZW50UXVldWVHb29nbGVBbmFseXRpY3NBZGFwdGVyID0gYWRhcHRlcnMuUGVyc2lzdGVudFF1ZXVlR29vZ2xlQW5hbHl0aWNzQWRhcHRlclxuICBAUGVyc2lzdGVudFF1ZXVlS2VlbkFkYXB0ZXIgPSBhZGFwdGVycy5QZXJzaXN0ZW50UXVldWVLZWVuQWRhcHRlclxuXG4gIGNsYXNzIEBFeHBlcmltZW50XG4gICAgQF9vcHRpb25zOlxuICAgICAgbmFtZTogbnVsbFxuICAgICAgdmFyaWFudHM6IG51bGxcbiAgICAgIHVzZXJfaWQ6IG51bGxcbiAgICAgIHNhbXBsZTogMS4wXG4gICAgICB0cmlnZ2VyOiAtPiB0cnVlXG4gICAgICB0cmFja2luZ19hZGFwdGVyOiBhZGFwdGVycy5Hb29nbGVVbml2ZXJzYWxBbmFseXRpY3NBZGFwdGVyXG4gICAgICBzdG9yYWdlX2FkYXB0ZXI6IGFkYXB0ZXJzLkxvY2FsU3RvcmFnZUFkYXB0ZXJcblxuICAgIGNvbnN0cnVjdG9yOiAoQG9wdGlvbnM9e30pIC0+XG4gICAgICB1dGlscy5kZWZhdWx0cyhAb3B0aW9ucywgRXhwZXJpbWVudC5fb3B0aW9ucylcbiAgICAgIF92YWxpZGF0ZS5jYWxsKHRoaXMpXG4gICAgICBAbmFtZSA9IEBvcHRpb25zLm5hbWVcbiAgICAgIEB2YXJpYW50cyA9IEBvcHRpb25zLnZhcmlhbnRzXG4gICAgICBAdXNlcl9pZCA9IEBvcHRpb25zLnVzZXJfaWRcbiAgICAgIEB2YXJpYW50X25hbWVzID0gdXRpbHMua2V5cyhAdmFyaWFudHMpXG4gICAgICBfcnVuLmNhbGwodGhpcylcblxuICAgIHJ1bjogLT5cbiAgICAgIHV0aWxzLmxvZyhcInJ1bm5pbmcgd2l0aCBvcHRpb25zOiAje0pTT04uc3RyaW5naWZ5KEBvcHRpb25zKX1cIilcbiAgICAgIGlmIHZhcmlhbnQgPSBAZ2V0X3N0b3JlZF92YXJpYW50KClcbiAgICAgICAgIyBhIHZhcmlhbnQgd2FzIGFscmVhZHkgY2hvc2VuLiBhY3RpdmF0ZSBpdFxuICAgICAgICB1dGlscy5sb2coXCIje3ZhcmlhbnR9IGFjdGl2ZVwiKVxuICAgICAgICBAYWN0aXZhdGVfdmFyaWFudCh2YXJpYW50KVxuICAgICAgZWxzZVxuICAgICAgICBAY29uZGl0aW9uYWxseV9hY3RpdmF0ZV92YXJpYW50KClcblxuICAgIF9ydW4gPSAtPiBAcnVuKClcblxuICAgIGFjdGl2YXRlX3ZhcmlhbnQ6ICh2YXJpYW50KSAtPlxuICAgICAgQHZhcmlhbnRzW3ZhcmlhbnRdPy5hY3RpdmF0ZSh0aGlzKVxuICAgICAgQHN0b3JhZ2UoKS5zZXQoXCIje0BvcHRpb25zLm5hbWV9OnZhcmlhbnRcIiwgdmFyaWFudClcblxuICAgICMgaWYgZXhwZXJpbWVudCBjb25kaXRpb25zIG1hdGNoLCBwaWNrIGFuZCBhY3RpdmF0ZSBhIHZhcmlhbnQsIHRyYWNrIGV4cGVyaW1lbnQgc3RhcnRcbiAgICBjb25kaXRpb25hbGx5X2FjdGl2YXRlX3ZhcmlhbnQ6IC0+XG4gICAgICByZXR1cm4gdW5sZXNzIEBvcHRpb25zLnRyaWdnZXIoKVxuICAgICAgdXRpbHMubG9nKCd0cmlnZ2VyIHNldCcpXG4gICAgICByZXR1cm4gdW5sZXNzIEBpbl9zYW1wbGUoKVxuICAgICAgdXRpbHMubG9nKCdpbiBzYW1wbGUnKVxuICAgICAgdmFyaWFudCA9IEBwaWNrX3ZhcmlhbnQoKVxuICAgICAgQHRyYWNraW5nKCkuZXhwZXJpbWVudF9zdGFydCh0aGlzLCB2YXJpYW50KVxuICAgICAgQGFjdGl2YXRlX3ZhcmlhbnQodmFyaWFudClcblxuICAgIGdvYWxfY29tcGxldGU6IChnb2FsX25hbWUsIHByb3BzPXt9KSAtPlxuICAgICAgdXRpbHMuZGVmYXVsdHMocHJvcHMsIHt1bmlxdWU6IHRydWV9KVxuICAgICAgcmV0dXJuIGlmIHByb3BzLnVuaXF1ZSAmJiBAc3RvcmFnZSgpLmdldChcIiN7QG9wdGlvbnMubmFtZX06I3tnb2FsX25hbWV9XCIpXG4gICAgICB2YXJpYW50ID0gQGdldF9zdG9yZWRfdmFyaWFudCgpXG4gICAgICByZXR1cm4gdW5sZXNzIHZhcmlhbnRcbiAgICAgIEBzdG9yYWdlKCkuc2V0KFwiI3tAb3B0aW9ucy5uYW1lfToje2dvYWxfbmFtZX1cIiwgdHJ1ZSkgaWYgcHJvcHMudW5pcXVlXG4gICAgICB1dGlscy5sb2coXCJleHBlcmltZW50OiAje0BvcHRpb25zLm5hbWV9IHZhcmlhbnQ6I3t2YXJpYW50fSBnb2FsOiN7Z29hbF9uYW1lfSBjb21wbGV0ZVwiKVxuICAgICAgQHRyYWNraW5nKCkuZ29hbF9jb21wbGV0ZSh0aGlzLCB2YXJpYW50LCBnb2FsX25hbWUsIHByb3BzKVxuXG4gICAgZ2V0X3N0b3JlZF92YXJpYW50OiAtPlxuICAgICAgQHN0b3JhZ2UoKS5nZXQoXCIje0BvcHRpb25zLm5hbWV9OnZhcmlhbnRcIilcblxuICAgIHBpY2tfdmFyaWFudDogLT5cbiAgICAgIGFsbF92YXJpYW50c19oYXZlX3dlaWdodHMgPSB1dGlscy5jaGVja193ZWlnaHRzKEB2YXJpYW50cylcbiAgICAgIHV0aWxzLmxvZyhcImFsbCB2YXJpYW50cyBoYXZlIHdlaWdodHM6ICN7YWxsX3ZhcmlhbnRzX2hhdmVfd2VpZ2h0c31cIilcbiAgICAgIGlmIGFsbF92YXJpYW50c19oYXZlX3dlaWdodHMgdGhlbiBAcGlja193ZWlnaHRlZF92YXJpYW50KCkgZWxzZSBAcGlja191bndlaWdodGVkX3ZhcmlhbnQoKVxuXG4gICAgcGlja193ZWlnaHRlZF92YXJpYW50OiAtPlxuXG4gICAgICAjIENob29zaW5nIGEgd2VpZ2h0ZWQgdmFyaWFudDpcbiAgICAgICMgRm9yIEEsIEIsIEMgd2l0aCB3ZWlnaHRzIDEsIDMsIDZcbiAgICAgICMgdmFyaWFudHMgPSBBLCBCLCBDXG4gICAgICAjIHdlaWdodHMgPSAxLCAzLCA2XG4gICAgICAjIHdlaWdodHNfc3VtID0gMTAgKHN1bSBvZiB3ZWlnaHRzKVxuICAgICAgIyB3ZWlnaHRlZF9pbmRleCA9IDIuMSAocmFuZG9tIG51bWJlciBiZXR3ZWVuIDAgYW5kIHdlaWdodCBzdW0pXG4gICAgICAjIEFCQkJDQ0NDQ0NcbiAgICAgICMgPT1eXG4gICAgICAjIFNlbGVjdCBCXG4gICAgICB3ZWlnaHRzX3N1bSA9IHV0aWxzLnN1bV93ZWlnaHRzKEB2YXJpYW50cylcbiAgICAgIHdlaWdodGVkX2luZGV4ID0gTWF0aC5jZWlsKChAX3JhbmRvbSgndmFyaWFudCcpICogd2VpZ2h0c19zdW0pKVxuICAgICAgZm9yIGtleSwgdmFsdWUgb2YgQHZhcmlhbnRzXG4gICAgICAgICMgdGhlbiB3ZSBhcmUgc3Vic3RyYWN0aW5nIHZhcmlhbnQgd2VpZ2h0IGZyb20gc2VsZWN0ZWQgbnVtYmVyXG4gICAgICAgICMgYW5kIGl0IGl0IHJlYWNoZXMgMCAob3IgYmVsb3cpIHdlIGFyZSBzZWxlY3RpbmcgdGhpcyB2YXJpYW50XG4gICAgICAgIHdlaWdodGVkX2luZGV4IC09IHZhbHVlLndlaWdodFxuICAgICAgICByZXR1cm4ga2V5IGlmIHdlaWdodGVkX2luZGV4IDw9IDBcblxuICAgIHBpY2tfdW53ZWlnaHRlZF92YXJpYW50OiAtPlxuICAgICAgcGFydGl0aW9ucyA9IDEuMCAvIEB2YXJpYW50X25hbWVzLmxlbmd0aFxuICAgICAgY2hvc2VuX3BhcnRpdGlvbiA9IE1hdGguZmxvb3IoQF9yYW5kb20oJ3ZhcmlhbnQnKSAvIHBhcnRpdGlvbnMpXG4gICAgICB2YXJpYW50ID0gQHZhcmlhbnRfbmFtZXNbY2hvc2VuX3BhcnRpdGlvbl1cbiAgICAgIHV0aWxzLmxvZyhcIiN7dmFyaWFudH0gcGlja2VkXCIpXG4gICAgICB2YXJpYW50XG5cbiAgICBpbl9zYW1wbGU6IC0+XG4gICAgICBhY3RpdmUgPSBAc3RvcmFnZSgpLmdldChcIiN7QG9wdGlvbnMubmFtZX06aW5fc2FtcGxlXCIpXG4gICAgICByZXR1cm4gYWN0aXZlIHVubGVzcyB0eXBlb2YgYWN0aXZlIGlzICd1bmRlZmluZWQnXG4gICAgICBhY3RpdmUgPSBAX3JhbmRvbSgnc2FtcGxlJykgPD0gQG9wdGlvbnMuc2FtcGxlXG4gICAgICBAc3RvcmFnZSgpLnNldChcIiN7QG9wdGlvbnMubmFtZX06aW5fc2FtcGxlXCIsIGFjdGl2ZSlcbiAgICAgIGFjdGl2ZVxuXG4gICAgX3JhbmRvbTogKHNhbHQpIC0+XG4gICAgICByZXR1cm4gdXRpbHMucmFuZG9tKCkgdW5sZXNzIEB1c2VyX2lkXG4gICAgICBzZWVkID0gXCIje0BuYW1lfS4je3NhbHR9LiN7QHVzZXJfaWR9XCJcbiAgICAgIHV0aWxzLnJhbmRvbShzZWVkKVxuXG4gICAgYWRkX2dvYWw6IChnb2FsKSAtPlxuICAgICAgZ29hbC5hZGRfZXhwZXJpbWVudCh0aGlzKVxuXG4gICAgYWRkX2dvYWxzOiAoZ29hbHMpIC0+XG4gICAgICBAYWRkX2dvYWwoZ29hbCkgZm9yIGdvYWwgaW4gZ29hbHNcblxuICAgIHN0b3JhZ2U6IC0+IEBvcHRpb25zLnN0b3JhZ2VfYWRhcHRlclxuXG4gICAgdHJhY2tpbmc6IC0+IEBvcHRpb25zLnRyYWNraW5nX2FkYXB0ZXJcblxuICAgIF92YWxpZGF0ZSA9IC0+XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2FuIGV4cGVyaW1lbnQgbmFtZSBtdXN0IGJlIHNwZWNpZmllZCcpIGlmIEBvcHRpb25zLm5hbWUgaXMgbnVsbFxuICAgICAgdGhyb3cgbmV3IEVycm9yKCd2YXJpYW50cyBtdXN0IGJlIHByb3ZpZGVkJykgaWYgQG9wdGlvbnMudmFyaWFudHMgaXMgbnVsbFxuICAgICAgdGhyb3cgbmV3IEVycm9yKCd0cmlnZ2VyIG11c3QgYmUgYSBmdW5jdGlvbicpIGlmIHR5cGVvZiBAb3B0aW9ucy50cmlnZ2VyIGlzbnQgJ2Z1bmN0aW9uJ1xuICAgICAgYWxsX3ZhcmlhbnRzX2hhdmVfd2VpZ2h0cyA9IHV0aWxzLnZhbGlkYXRlX3dlaWdodHMgQG9wdGlvbnMudmFyaWFudHNcbiAgICAgIHRocm93IG5ldyBFcnJvcignbm90IGFsbCB2YXJpYW50cyBoYXZlIHdlaWdodHMnKSBpZiAhYWxsX3ZhcmlhbnRzX2hhdmVfd2VpZ2h0c1xuXG4gIGNsYXNzIEBHb2FsXG4gICAgY29uc3RydWN0b3I6IChAbmFtZSwgQHByb3BzPXt9KSAtPlxuICAgICAgdXRpbHMuZGVmYXVsdHMoQHByb3BzLCB7dW5pcXVlOiB0cnVlfSlcbiAgICAgIEBleHBlcmltZW50cyA9IFtdXG5cbiAgICBhZGRfZXhwZXJpbWVudDogKGV4cGVyaW1lbnQpIC0+XG4gICAgICBAZXhwZXJpbWVudHMucHVzaChleHBlcmltZW50KVxuXG4gICAgYWRkX2V4cGVyaW1lbnRzOiAoZXhwZXJpbWVudHMpIC0+XG4gICAgICBAYWRkX2V4cGVyaW1lbnQoZXhwZXJpbWVudCkgZm9yIGV4cGVyaW1lbnQgaW4gZXhwZXJpbWVudHNcblxuICAgIGNvbXBsZXRlOiAtPlxuICAgICAgZm9yIGV4cGVyaW1lbnQgaW4gQGV4cGVyaW1lbnRzXG4gICAgICAgIGV4cGVyaW1lbnQuZ29hbF9jb21wbGV0ZShAbmFtZSwgQHByb3BzKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gQWxlcGhCZXRcbiIsIm1vZHVsZS5leHBvcnRzID1cbiAgZGVidWc6IGZhbHNlXG4iLCJCYXNpbCA9IHJlcXVpcmUoJ2Jhc2lsLmpzJylcbnN0b3JlID0gbmV3IEJhc2lsKG5hbWVzcGFjZTogbnVsbClcblxuIyBhIHRoaW4gd3JhcHBlciBhcm91bmQgYmFzaWwuanMgZm9yIGVhc3kgc3dhcHBpbmdcbmNsYXNzIFN0b3JhZ2VcbiAgY29uc3RydWN0b3I6IChAbmFtZXNwYWNlPSdhbGVwaGJldCcpIC0+XG4gICAgQHN0b3JhZ2UgPSBzdG9yZS5nZXQoQG5hbWVzcGFjZSkgfHwge31cbiAgc2V0OiAoa2V5LCB2YWx1ZSkgLT5cbiAgICBAc3RvcmFnZVtrZXldID0gdmFsdWVcbiAgICBzdG9yZS5zZXQoQG5hbWVzcGFjZSwgQHN0b3JhZ2UpXG4gICAgcmV0dXJuIHZhbHVlXG4gIGdldDogKGtleSkgLT5cbiAgICBAc3RvcmFnZVtrZXldXG4gICAgIyBzdG9yZS5nZXQoXCIje0BuYW1lc3BhY2V9OiN7a2V5fVwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFN0b3JhZ2VcbiIsImltcG9ydCBzaGExIGZyb20gJ2NyeXB0by1qcy9zaGExJ1xuaW1wb3J0IHt2NH0gZnJvbSAndXVpZCdcblxuIyBOT1RFOiB1c2luZyBhIGN1c3RvbSBidWlsZCBvZiBsb2Rhc2gsIHRvIHNhdmUgc3BhY2Vcbl8gPSByZXF1aXJlKCcuLi92ZW5kb3IvbG9kYXNoLmN1c3RvbS5taW4nKVxub3B0aW9ucyA9IHJlcXVpcmUoJy4vb3B0aW9ucycpXG5cbmNsYXNzIFV0aWxzXG4gIEBkZWZhdWx0czogXy5kZWZhdWx0c1xuICBAa2V5czogXy5rZXlzXG4gIEByZW1vdmU6IF8ucmVtb3ZlXG4gIEBvbWl0OiBfLm9taXRcbiAgQGxvZzogKG1lc3NhZ2UpIC0+XG4gICAgY29uc29sZS5sb2cobWVzc2FnZSkgaWYgb3B0aW9ucy5kZWJ1Z1xuICBAdXVpZDogdjRcbiAgQHNoYTE6ICh0ZXh0KSAtPlxuICAgIHNoYTEodGV4dCkudG9TdHJpbmcoKVxuICBAcmFuZG9tOiAoc2VlZCkgLT5cbiAgICByZXR1cm4gTWF0aC5yYW5kb20oKSB1bmxlc3Mgc2VlZFxuICAgICMgYSBNVUNIIHNpbXBsaWZpZWQgdmVyc2lvbiBpbnNwaXJlZCBieSBQbGFuT3V0LmpzXG4gICAgcGFyc2VJbnQoQHNoYTEoc2VlZCkuc3Vic3RyKDAsIDEzKSwgMTYpIC8gMHhGRkZGRkZGRkZGRkZGXG4gIEBjaGVja193ZWlnaHRzOiAodmFyaWFudHMpIC0+XG4gICAgY29udGFpbnNfd2VpZ2h0ID0gW11cbiAgICBjb250YWluc193ZWlnaHQucHVzaCh2YWx1ZS53ZWlnaHQ/KSBmb3Iga2V5LCB2YWx1ZSBvZiB2YXJpYW50c1xuICAgIGNvbnRhaW5zX3dlaWdodC5ldmVyeSAoaGFzX3dlaWdodCkgLT4gaGFzX3dlaWdodFxuICBAc3VtX3dlaWdodHM6ICh2YXJpYW50cykgLT5cbiAgICBzdW0gPSAwXG4gICAgZm9yIGtleSwgdmFsdWUgb2YgdmFyaWFudHNcbiAgICAgIHN1bSArPSB2YWx1ZS53ZWlnaHQgfHwgMFxuICAgIHN1bVxuICBAdmFsaWRhdGVfd2VpZ2h0czogKHZhcmlhbnRzKSAtPlxuICAgIGNvbnRhaW5zX3dlaWdodCA9IFtdXG4gICAgY29udGFpbnNfd2VpZ2h0LnB1c2godmFsdWUud2VpZ2h0PykgZm9yIGtleSwgdmFsdWUgb2YgdmFyaWFudHNcbiAgICBjb250YWluc193ZWlnaHQuZXZlcnkgKGhhc193ZWlnaHQpIC0+IGhhc193ZWlnaHQgb3IgY29udGFpbnNfd2VpZ2h0LmV2ZXJ5IChoYXNfd2VpZ2h0KSAtPiAhaGFzX3dlaWdodFxubW9kdWxlLmV4cG9ydHMgPSBVdGlsc1xuIiwiOyhmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuXHRpZiAodHlwZW9mIGV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcblx0XHQvLyBDb21tb25KU1xuXHRcdG1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IGZhY3RvcnkoKTtcblx0fVxuXHRlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuXHRcdC8vIEFNRFxuXHRcdGRlZmluZShbXSwgZmFjdG9yeSk7XG5cdH1cblx0ZWxzZSB7XG5cdFx0Ly8gR2xvYmFsIChicm93c2VyKVxuXHRcdHJvb3QuQ3J5cHRvSlMgPSBmYWN0b3J5KCk7XG5cdH1cbn0odGhpcywgZnVuY3Rpb24gKCkge1xuXG5cdC8qZ2xvYmFscyB3aW5kb3csIGdsb2JhbCwgcmVxdWlyZSovXG5cblx0LyoqXG5cdCAqIENyeXB0b0pTIGNvcmUgY29tcG9uZW50cy5cblx0ICovXG5cdHZhciBDcnlwdG9KUyA9IENyeXB0b0pTIHx8IChmdW5jdGlvbiAoTWF0aCwgdW5kZWZpbmVkKSB7XG5cblx0ICAgIHZhciBjcnlwdG87XG5cblx0ICAgIC8vIE5hdGl2ZSBjcnlwdG8gZnJvbSB3aW5kb3cgKEJyb3dzZXIpXG5cdCAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmNyeXB0bykge1xuXHQgICAgICAgIGNyeXB0byA9IHdpbmRvdy5jcnlwdG87XG5cdCAgICB9XG5cblx0ICAgIC8vIE5hdGl2ZSAoZXhwZXJpbWVudGFsIElFIDExKSBjcnlwdG8gZnJvbSB3aW5kb3cgKEJyb3dzZXIpXG5cdCAgICBpZiAoIWNyeXB0byAmJiB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cubXNDcnlwdG8pIHtcblx0ICAgICAgICBjcnlwdG8gPSB3aW5kb3cubXNDcnlwdG87XG5cdCAgICB9XG5cblx0ICAgIC8vIE5hdGl2ZSBjcnlwdG8gZnJvbSBnbG9iYWwgKE5vZGVKUylcblx0ICAgIGlmICghY3J5cHRvICYmIHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnICYmIGdsb2JhbC5jcnlwdG8pIHtcblx0ICAgICAgICBjcnlwdG8gPSBnbG9iYWwuY3J5cHRvO1xuXHQgICAgfVxuXG5cdCAgICAvLyBOYXRpdmUgY3J5cHRvIGltcG9ydCB2aWEgcmVxdWlyZSAoTm9kZUpTKVxuXHQgICAgaWYgKCFjcnlwdG8gJiYgdHlwZW9mIHJlcXVpcmUgPT09ICdmdW5jdGlvbicpIHtcblx0ICAgICAgICB0cnkge1xuXHQgICAgICAgICAgICBjcnlwdG8gPSByZXF1aXJlKCdjcnlwdG8nKTtcblx0ICAgICAgICB9IGNhdGNoIChlcnIpIHt9XG5cdCAgICB9XG5cblx0ICAgIC8qXG5cdCAgICAgKiBDcnlwdG9ncmFwaGljYWxseSBzZWN1cmUgcHNldWRvcmFuZG9tIG51bWJlciBnZW5lcmF0b3Jcblx0ICAgICAqXG5cdCAgICAgKiBBcyBNYXRoLnJhbmRvbSgpIGlzIGNyeXB0b2dyYXBoaWNhbGx5IG5vdCBzYWZlIHRvIHVzZVxuXHQgICAgICovXG5cdCAgICB2YXIgY3J5cHRvU2VjdXJlUmFuZG9tSW50ID0gZnVuY3Rpb24gKCkge1xuXHQgICAgICAgIGlmIChjcnlwdG8pIHtcblx0ICAgICAgICAgICAgLy8gVXNlIGdldFJhbmRvbVZhbHVlcyBtZXRob2QgKEJyb3dzZXIpXG5cdCAgICAgICAgICAgIGlmICh0eXBlb2YgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyA9PT0gJ2Z1bmN0aW9uJykge1xuXHQgICAgICAgICAgICAgICAgdHJ5IHtcblx0ICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDMyQXJyYXkoMSkpWzBdO1xuXHQgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7fVxuXHQgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgLy8gVXNlIHJhbmRvbUJ5dGVzIG1ldGhvZCAoTm9kZUpTKVxuXHQgICAgICAgICAgICBpZiAodHlwZW9mIGNyeXB0by5yYW5kb21CeXRlcyA9PT0gJ2Z1bmN0aW9uJykge1xuXHQgICAgICAgICAgICAgICAgdHJ5IHtcblx0ICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3J5cHRvLnJhbmRvbUJ5dGVzKDQpLnJlYWRJbnQzMkxFKCk7XG5cdCAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHt9XG5cdCAgICAgICAgICAgIH1cblx0ICAgICAgICB9XG5cblx0ICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05hdGl2ZSBjcnlwdG8gbW9kdWxlIGNvdWxkIG5vdCBiZSB1c2VkIHRvIGdldCBzZWN1cmUgcmFuZG9tIG51bWJlci4nKTtcblx0ICAgIH07XG5cblx0ICAgIC8qXG5cdCAgICAgKiBMb2NhbCBwb2x5ZmlsbCBvZiBPYmplY3QuY3JlYXRlXG5cblx0ICAgICAqL1xuXHQgICAgdmFyIGNyZWF0ZSA9IE9iamVjdC5jcmVhdGUgfHwgKGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICBmdW5jdGlvbiBGKCkge31cblxuXHQgICAgICAgIHJldHVybiBmdW5jdGlvbiAob2JqKSB7XG5cdCAgICAgICAgICAgIHZhciBzdWJ0eXBlO1xuXG5cdCAgICAgICAgICAgIEYucHJvdG90eXBlID0gb2JqO1xuXG5cdCAgICAgICAgICAgIHN1YnR5cGUgPSBuZXcgRigpO1xuXG5cdCAgICAgICAgICAgIEYucHJvdG90eXBlID0gbnVsbDtcblxuXHQgICAgICAgICAgICByZXR1cm4gc3VidHlwZTtcblx0ICAgICAgICB9O1xuXHQgICAgfSgpKVxuXG5cdCAgICAvKipcblx0ICAgICAqIENyeXB0b0pTIG5hbWVzcGFjZS5cblx0ICAgICAqL1xuXHQgICAgdmFyIEMgPSB7fTtcblxuXHQgICAgLyoqXG5cdCAgICAgKiBMaWJyYXJ5IG5hbWVzcGFjZS5cblx0ICAgICAqL1xuXHQgICAgdmFyIENfbGliID0gQy5saWIgPSB7fTtcblxuXHQgICAgLyoqXG5cdCAgICAgKiBCYXNlIG9iamVjdCBmb3IgcHJvdG90eXBhbCBpbmhlcml0YW5jZS5cblx0ICAgICAqL1xuXHQgICAgdmFyIEJhc2UgPSBDX2xpYi5CYXNlID0gKGZ1bmN0aW9uICgpIHtcblxuXG5cdCAgICAgICAgcmV0dXJuIHtcblx0ICAgICAgICAgICAgLyoqXG5cdCAgICAgICAgICAgICAqIENyZWF0ZXMgYSBuZXcgb2JqZWN0IHRoYXQgaW5oZXJpdHMgZnJvbSB0aGlzIG9iamVjdC5cblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IG92ZXJyaWRlcyBQcm9wZXJ0aWVzIHRvIGNvcHkgaW50byB0aGUgbmV3IG9iamVjdC5cblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogQHJldHVybiB7T2JqZWN0fSBUaGUgbmV3IG9iamVjdC5cblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogQHN0YXRpY1xuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiAgICAgdmFyIE15VHlwZSA9IENyeXB0b0pTLmxpYi5CYXNlLmV4dGVuZCh7XG5cdCAgICAgICAgICAgICAqICAgICAgICAgZmllbGQ6ICd2YWx1ZScsXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqICAgICAgICAgbWV0aG9kOiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgICAqICAgICAgICAgfVxuXHQgICAgICAgICAgICAgKiAgICAgfSk7XG5cdCAgICAgICAgICAgICAqL1xuXHQgICAgICAgICAgICBleHRlbmQ6IGZ1bmN0aW9uIChvdmVycmlkZXMpIHtcblx0ICAgICAgICAgICAgICAgIC8vIFNwYXduXG5cdCAgICAgICAgICAgICAgICB2YXIgc3VidHlwZSA9IGNyZWF0ZSh0aGlzKTtcblxuXHQgICAgICAgICAgICAgICAgLy8gQXVnbWVudFxuXHQgICAgICAgICAgICAgICAgaWYgKG92ZXJyaWRlcykge1xuXHQgICAgICAgICAgICAgICAgICAgIHN1YnR5cGUubWl4SW4ob3ZlcnJpZGVzKTtcblx0ICAgICAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGRlZmF1bHQgaW5pdGlhbGl6ZXJcblx0ICAgICAgICAgICAgICAgIGlmICghc3VidHlwZS5oYXNPd25Qcm9wZXJ0eSgnaW5pdCcpIHx8IHRoaXMuaW5pdCA9PT0gc3VidHlwZS5pbml0KSB7XG5cdCAgICAgICAgICAgICAgICAgICAgc3VidHlwZS5pbml0ID0gZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICAgICAgICAgICAgICBzdWJ0eXBlLiRzdXBlci5pbml0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdCAgICAgICAgICAgICAgICAgICAgfTtcblx0ICAgICAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICAgICAgLy8gSW5pdGlhbGl6ZXIncyBwcm90b3R5cGUgaXMgdGhlIHN1YnR5cGUgb2JqZWN0XG5cdCAgICAgICAgICAgICAgICBzdWJ0eXBlLmluaXQucHJvdG90eXBlID0gc3VidHlwZTtcblxuXHQgICAgICAgICAgICAgICAgLy8gUmVmZXJlbmNlIHN1cGVydHlwZVxuXHQgICAgICAgICAgICAgICAgc3VidHlwZS4kc3VwZXIgPSB0aGlzO1xuXG5cdCAgICAgICAgICAgICAgICByZXR1cm4gc3VidHlwZTtcblx0ICAgICAgICAgICAgfSxcblxuXHQgICAgICAgICAgICAvKipcblx0ICAgICAgICAgICAgICogRXh0ZW5kcyB0aGlzIG9iamVjdCBhbmQgcnVucyB0aGUgaW5pdCBtZXRob2QuXG5cdCAgICAgICAgICAgICAqIEFyZ3VtZW50cyB0byBjcmVhdGUoKSB3aWxsIGJlIHBhc3NlZCB0byBpbml0KCkuXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqIEByZXR1cm4ge09iamVjdH0gVGhlIG5ldyBvYmplY3QuXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqIEBzdGF0aWNcblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogICAgIHZhciBpbnN0YW5jZSA9IE15VHlwZS5jcmVhdGUoKTtcblx0ICAgICAgICAgICAgICovXG5cdCAgICAgICAgICAgIGNyZWF0ZTogZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICAgICAgdmFyIGluc3RhbmNlID0gdGhpcy5leHRlbmQoKTtcblx0ICAgICAgICAgICAgICAgIGluc3RhbmNlLmluaXQuYXBwbHkoaW5zdGFuY2UsIGFyZ3VtZW50cyk7XG5cblx0ICAgICAgICAgICAgICAgIHJldHVybiBpbnN0YW5jZTtcblx0ICAgICAgICAgICAgfSxcblxuXHQgICAgICAgICAgICAvKipcblx0ICAgICAgICAgICAgICogSW5pdGlhbGl6ZXMgYSBuZXdseSBjcmVhdGVkIG9iamVjdC5cblx0ICAgICAgICAgICAgICogT3ZlcnJpZGUgdGhpcyBtZXRob2QgdG8gYWRkIHNvbWUgbG9naWMgd2hlbiB5b3VyIG9iamVjdHMgYXJlIGNyZWF0ZWQuXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqICAgICB2YXIgTXlUeXBlID0gQ3J5cHRvSlMubGliLkJhc2UuZXh0ZW5kKHtcblx0ICAgICAgICAgICAgICogICAgICAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgICAqICAgICAgICAgICAgIC8vIC4uLlxuXHQgICAgICAgICAgICAgKiAgICAgICAgIH1cblx0ICAgICAgICAgICAgICogICAgIH0pO1xuXHQgICAgICAgICAgICAgKi9cblx0ICAgICAgICAgICAgaW5pdDogZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICB9LFxuXG5cdCAgICAgICAgICAgIC8qKlxuXHQgICAgICAgICAgICAgKiBDb3BpZXMgcHJvcGVydGllcyBpbnRvIHRoaXMgb2JqZWN0LlxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gcHJvcGVydGllcyBUaGUgcHJvcGVydGllcyB0byBtaXggaW4uXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqICAgICBNeVR5cGUubWl4SW4oe1xuXHQgICAgICAgICAgICAgKiAgICAgICAgIGZpZWxkOiAndmFsdWUnXG5cdCAgICAgICAgICAgICAqICAgICB9KTtcblx0ICAgICAgICAgICAgICovXG5cdCAgICAgICAgICAgIG1peEluOiBmdW5jdGlvbiAocHJvcGVydGllcykge1xuXHQgICAgICAgICAgICAgICAgZm9yICh2YXIgcHJvcGVydHlOYW1lIGluIHByb3BlcnRpZXMpIHtcblx0ICAgICAgICAgICAgICAgICAgICBpZiAocHJvcGVydGllcy5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eU5hbWUpKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNbcHJvcGVydHlOYW1lXSA9IHByb3BlcnRpZXNbcHJvcGVydHlOYW1lXTtcblx0ICAgICAgICAgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgICAgIC8vIElFIHdvbid0IGNvcHkgdG9TdHJpbmcgdXNpbmcgdGhlIGxvb3AgYWJvdmVcblx0ICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0aWVzLmhhc093blByb3BlcnR5KCd0b1N0cmluZycpKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgdGhpcy50b1N0cmluZyA9IHByb3BlcnRpZXMudG9TdHJpbmc7XG5cdCAgICAgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgIH0sXG5cblx0ICAgICAgICAgICAgLyoqXG5cdCAgICAgICAgICAgICAqIENyZWF0ZXMgYSBjb3B5IG9mIHRoaXMgb2JqZWN0LlxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBjbG9uZS5cblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogICAgIHZhciBjbG9uZSA9IGluc3RhbmNlLmNsb25lKCk7XG5cdCAgICAgICAgICAgICAqL1xuXHQgICAgICAgICAgICBjbG9uZTogZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaW5pdC5wcm90b3R5cGUuZXh0ZW5kKHRoaXMpO1xuXHQgICAgICAgICAgICB9XG5cdCAgICAgICAgfTtcblx0ICAgIH0oKSk7XG5cblx0ICAgIC8qKlxuXHQgICAgICogQW4gYXJyYXkgb2YgMzItYml0IHdvcmRzLlxuXHQgICAgICpcblx0ICAgICAqIEBwcm9wZXJ0eSB7QXJyYXl9IHdvcmRzIFRoZSBhcnJheSBvZiAzMi1iaXQgd29yZHMuXG5cdCAgICAgKiBAcHJvcGVydHkge251bWJlcn0gc2lnQnl0ZXMgVGhlIG51bWJlciBvZiBzaWduaWZpY2FudCBieXRlcyBpbiB0aGlzIHdvcmQgYXJyYXkuXG5cdCAgICAgKi9cblx0ICAgIHZhciBXb3JkQXJyYXkgPSBDX2xpYi5Xb3JkQXJyYXkgPSBCYXNlLmV4dGVuZCh7XG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogSW5pdGlhbGl6ZXMgYSBuZXdseSBjcmVhdGVkIHdvcmQgYXJyYXkuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge0FycmF5fSB3b3JkcyAoT3B0aW9uYWwpIEFuIGFycmF5IG9mIDMyLWJpdCB3b3Jkcy5cblx0ICAgICAgICAgKiBAcGFyYW0ge251bWJlcn0gc2lnQnl0ZXMgKE9wdGlvbmFsKSBUaGUgbnVtYmVyIG9mIHNpZ25pZmljYW50IGJ5dGVzIGluIHRoZSB3b3Jkcy5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIHdvcmRBcnJheSA9IENyeXB0b0pTLmxpYi5Xb3JkQXJyYXkuY3JlYXRlKCk7XG5cdCAgICAgICAgICogICAgIHZhciB3b3JkQXJyYXkgPSBDcnlwdG9KUy5saWIuV29yZEFycmF5LmNyZWF0ZShbMHgwMDAxMDIwMywgMHgwNDA1MDYwN10pO1xuXHQgICAgICAgICAqICAgICB2YXIgd29yZEFycmF5ID0gQ3J5cHRvSlMubGliLldvcmRBcnJheS5jcmVhdGUoWzB4MDAwMTAyMDMsIDB4MDQwNTA2MDddLCA2KTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBpbml0OiBmdW5jdGlvbiAod29yZHMsIHNpZ0J5dGVzKSB7XG5cdCAgICAgICAgICAgIHdvcmRzID0gdGhpcy53b3JkcyA9IHdvcmRzIHx8IFtdO1xuXG5cdCAgICAgICAgICAgIGlmIChzaWdCeXRlcyAhPSB1bmRlZmluZWQpIHtcblx0ICAgICAgICAgICAgICAgIHRoaXMuc2lnQnl0ZXMgPSBzaWdCeXRlcztcblx0ICAgICAgICAgICAgfSBlbHNlIHtcblx0ICAgICAgICAgICAgICAgIHRoaXMuc2lnQnl0ZXMgPSB3b3Jkcy5sZW5ndGggKiA0O1xuXHQgICAgICAgICAgICB9XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIENvbnZlcnRzIHRoaXMgd29yZCBhcnJheSB0byBhIHN0cmluZy5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7RW5jb2Rlcn0gZW5jb2RlciAoT3B0aW9uYWwpIFRoZSBlbmNvZGluZyBzdHJhdGVneSB0byB1c2UuIERlZmF1bHQ6IENyeXB0b0pTLmVuYy5IZXhcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge3N0cmluZ30gVGhlIHN0cmluZ2lmaWVkIHdvcmQgYXJyYXkuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciBzdHJpbmcgPSB3b3JkQXJyYXkgKyAnJztcblx0ICAgICAgICAgKiAgICAgdmFyIHN0cmluZyA9IHdvcmRBcnJheS50b1N0cmluZygpO1xuXHQgICAgICAgICAqICAgICB2YXIgc3RyaW5nID0gd29yZEFycmF5LnRvU3RyaW5nKENyeXB0b0pTLmVuYy5VdGY4KTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICB0b1N0cmluZzogZnVuY3Rpb24gKGVuY29kZXIpIHtcblx0ICAgICAgICAgICAgcmV0dXJuIChlbmNvZGVyIHx8IEhleCkuc3RyaW5naWZ5KHRoaXMpO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBDb25jYXRlbmF0ZXMgYSB3b3JkIGFycmF5IHRvIHRoaXMgd29yZCBhcnJheS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7V29yZEFycmF5fSB3b3JkQXJyYXkgVGhlIHdvcmQgYXJyYXkgdG8gYXBwZW5kLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7V29yZEFycmF5fSBUaGlzIHdvcmQgYXJyYXkuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHdvcmRBcnJheTEuY29uY2F0KHdvcmRBcnJheTIpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIGNvbmNhdDogZnVuY3Rpb24gKHdvcmRBcnJheSkge1xuXHQgICAgICAgICAgICAvLyBTaG9ydGN1dHNcblx0ICAgICAgICAgICAgdmFyIHRoaXNXb3JkcyA9IHRoaXMud29yZHM7XG5cdCAgICAgICAgICAgIHZhciB0aGF0V29yZHMgPSB3b3JkQXJyYXkud29yZHM7XG5cdCAgICAgICAgICAgIHZhciB0aGlzU2lnQnl0ZXMgPSB0aGlzLnNpZ0J5dGVzO1xuXHQgICAgICAgICAgICB2YXIgdGhhdFNpZ0J5dGVzID0gd29yZEFycmF5LnNpZ0J5dGVzO1xuXG5cdCAgICAgICAgICAgIC8vIENsYW1wIGV4Y2VzcyBiaXRzXG5cdCAgICAgICAgICAgIHRoaXMuY2xhbXAoKTtcblxuXHQgICAgICAgICAgICAvLyBDb25jYXRcblx0ICAgICAgICAgICAgaWYgKHRoaXNTaWdCeXRlcyAlIDQpIHtcblx0ICAgICAgICAgICAgICAgIC8vIENvcHkgb25lIGJ5dGUgYXQgYSB0aW1lXG5cdCAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoYXRTaWdCeXRlczsgaSsrKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgdmFyIHRoYXRCeXRlID0gKHRoYXRXb3Jkc1tpID4+PiAyXSA+Pj4gKDI0IC0gKGkgJSA0KSAqIDgpKSAmIDB4ZmY7XG5cdCAgICAgICAgICAgICAgICAgICAgdGhpc1dvcmRzWyh0aGlzU2lnQnl0ZXMgKyBpKSA+Pj4gMl0gfD0gdGhhdEJ5dGUgPDwgKDI0IC0gKCh0aGlzU2lnQnl0ZXMgKyBpKSAlIDQpICogOCk7XG5cdCAgICAgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgIH0gZWxzZSB7XG5cdCAgICAgICAgICAgICAgICAvLyBDb3B5IG9uZSB3b3JkIGF0IGEgdGltZVxuXHQgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGF0U2lnQnl0ZXM7IGkgKz0gNCkge1xuXHQgICAgICAgICAgICAgICAgICAgIHRoaXNXb3Jkc1sodGhpc1NpZ0J5dGVzICsgaSkgPj4+IDJdID0gdGhhdFdvcmRzW2kgPj4+IDJdO1xuXHQgICAgICAgICAgICAgICAgfVxuXHQgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgIHRoaXMuc2lnQnl0ZXMgKz0gdGhhdFNpZ0J5dGVzO1xuXG5cdCAgICAgICAgICAgIC8vIENoYWluYWJsZVxuXHQgICAgICAgICAgICByZXR1cm4gdGhpcztcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogUmVtb3ZlcyBpbnNpZ25pZmljYW50IGJpdHMuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHdvcmRBcnJheS5jbGFtcCgpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIGNsYW1wOiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgIC8vIFNob3J0Y3V0c1xuXHQgICAgICAgICAgICB2YXIgd29yZHMgPSB0aGlzLndvcmRzO1xuXHQgICAgICAgICAgICB2YXIgc2lnQnl0ZXMgPSB0aGlzLnNpZ0J5dGVzO1xuXG5cdCAgICAgICAgICAgIC8vIENsYW1wXG5cdCAgICAgICAgICAgIHdvcmRzW3NpZ0J5dGVzID4+PiAyXSAmPSAweGZmZmZmZmZmIDw8ICgzMiAtIChzaWdCeXRlcyAlIDQpICogOCk7XG5cdCAgICAgICAgICAgIHdvcmRzLmxlbmd0aCA9IE1hdGguY2VpbChzaWdCeXRlcyAvIDQpO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBDcmVhdGVzIGEgY29weSBvZiB0aGlzIHdvcmQgYXJyYXkuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtXb3JkQXJyYXl9IFRoZSBjbG9uZS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIGNsb25lID0gd29yZEFycmF5LmNsb25lKCk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgY2xvbmU6IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgdmFyIGNsb25lID0gQmFzZS5jbG9uZS5jYWxsKHRoaXMpO1xuXHQgICAgICAgICAgICBjbG9uZS53b3JkcyA9IHRoaXMud29yZHMuc2xpY2UoMCk7XG5cblx0ICAgICAgICAgICAgcmV0dXJuIGNsb25lO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBDcmVhdGVzIGEgd29yZCBhcnJheSBmaWxsZWQgd2l0aCByYW5kb20gYnl0ZXMuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge251bWJlcn0gbkJ5dGVzIFRoZSBudW1iZXIgb2YgcmFuZG9tIGJ5dGVzIHRvIGdlbmVyYXRlLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7V29yZEFycmF5fSBUaGUgcmFuZG9tIHdvcmQgYXJyYXkuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAc3RhdGljXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciB3b3JkQXJyYXkgPSBDcnlwdG9KUy5saWIuV29yZEFycmF5LnJhbmRvbSgxNik7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgcmFuZG9tOiBmdW5jdGlvbiAobkJ5dGVzKSB7XG5cdCAgICAgICAgICAgIHZhciB3b3JkcyA9IFtdO1xuXG5cdCAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbkJ5dGVzOyBpICs9IDQpIHtcblx0ICAgICAgICAgICAgICAgIHdvcmRzLnB1c2goY3J5cHRvU2VjdXJlUmFuZG9tSW50KCkpO1xuXHQgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgcmV0dXJuIG5ldyBXb3JkQXJyYXkuaW5pdCh3b3JkcywgbkJ5dGVzKTtcblx0ICAgICAgICB9XG5cdCAgICB9KTtcblxuXHQgICAgLyoqXG5cdCAgICAgKiBFbmNvZGVyIG5hbWVzcGFjZS5cblx0ICAgICAqL1xuXHQgICAgdmFyIENfZW5jID0gQy5lbmMgPSB7fTtcblxuXHQgICAgLyoqXG5cdCAgICAgKiBIZXggZW5jb2Rpbmcgc3RyYXRlZ3kuXG5cdCAgICAgKi9cblx0ICAgIHZhciBIZXggPSBDX2VuYy5IZXggPSB7XG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogQ29udmVydHMgYSB3b3JkIGFycmF5IHRvIGEgaGV4IHN0cmluZy5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7V29yZEFycmF5fSB3b3JkQXJyYXkgVGhlIHdvcmQgYXJyYXkuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBoZXggc3RyaW5nLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHN0YXRpY1xuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgaGV4U3RyaW5nID0gQ3J5cHRvSlMuZW5jLkhleC5zdHJpbmdpZnkod29yZEFycmF5KTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBzdHJpbmdpZnk6IGZ1bmN0aW9uICh3b3JkQXJyYXkpIHtcblx0ICAgICAgICAgICAgLy8gU2hvcnRjdXRzXG5cdCAgICAgICAgICAgIHZhciB3b3JkcyA9IHdvcmRBcnJheS53b3Jkcztcblx0ICAgICAgICAgICAgdmFyIHNpZ0J5dGVzID0gd29yZEFycmF5LnNpZ0J5dGVzO1xuXG5cdCAgICAgICAgICAgIC8vIENvbnZlcnRcblx0ICAgICAgICAgICAgdmFyIGhleENoYXJzID0gW107XG5cdCAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2lnQnl0ZXM7IGkrKykge1xuXHQgICAgICAgICAgICAgICAgdmFyIGJpdGUgPSAod29yZHNbaSA+Pj4gMl0gPj4+ICgyNCAtIChpICUgNCkgKiA4KSkgJiAweGZmO1xuXHQgICAgICAgICAgICAgICAgaGV4Q2hhcnMucHVzaCgoYml0ZSA+Pj4gNCkudG9TdHJpbmcoMTYpKTtcblx0ICAgICAgICAgICAgICAgIGhleENoYXJzLnB1c2goKGJpdGUgJiAweDBmKS50b1N0cmluZygxNikpO1xuXHQgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgcmV0dXJuIGhleENoYXJzLmpvaW4oJycpO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBDb252ZXJ0cyBhIGhleCBzdHJpbmcgdG8gYSB3b3JkIGFycmF5LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGhleFN0ciBUaGUgaGV4IHN0cmluZy5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge1dvcmRBcnJheX0gVGhlIHdvcmQgYXJyYXkuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAc3RhdGljXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciB3b3JkQXJyYXkgPSBDcnlwdG9KUy5lbmMuSGV4LnBhcnNlKGhleFN0cmluZyk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgcGFyc2U6IGZ1bmN0aW9uIChoZXhTdHIpIHtcblx0ICAgICAgICAgICAgLy8gU2hvcnRjdXRcblx0ICAgICAgICAgICAgdmFyIGhleFN0ckxlbmd0aCA9IGhleFN0ci5sZW5ndGg7XG5cblx0ICAgICAgICAgICAgLy8gQ29udmVydFxuXHQgICAgICAgICAgICB2YXIgd29yZHMgPSBbXTtcblx0ICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBoZXhTdHJMZW5ndGg7IGkgKz0gMikge1xuXHQgICAgICAgICAgICAgICAgd29yZHNbaSA+Pj4gM10gfD0gcGFyc2VJbnQoaGV4U3RyLnN1YnN0cihpLCAyKSwgMTYpIDw8ICgyNCAtIChpICUgOCkgKiA0KTtcblx0ICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgIHJldHVybiBuZXcgV29yZEFycmF5LmluaXQod29yZHMsIGhleFN0ckxlbmd0aCAvIDIpO1xuXHQgICAgICAgIH1cblx0ICAgIH07XG5cblx0ICAgIC8qKlxuXHQgICAgICogTGF0aW4xIGVuY29kaW5nIHN0cmF0ZWd5LlxuXHQgICAgICovXG5cdCAgICB2YXIgTGF0aW4xID0gQ19lbmMuTGF0aW4xID0ge1xuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIENvbnZlcnRzIGEgd29yZCBhcnJheSB0byBhIExhdGluMSBzdHJpbmcuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge1dvcmRBcnJheX0gd29yZEFycmF5IFRoZSB3b3JkIGFycmF5LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7c3RyaW5nfSBUaGUgTGF0aW4xIHN0cmluZy5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBzdGF0aWNcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIGxhdGluMVN0cmluZyA9IENyeXB0b0pTLmVuYy5MYXRpbjEuc3RyaW5naWZ5KHdvcmRBcnJheSk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgc3RyaW5naWZ5OiBmdW5jdGlvbiAod29yZEFycmF5KSB7XG5cdCAgICAgICAgICAgIC8vIFNob3J0Y3V0c1xuXHQgICAgICAgICAgICB2YXIgd29yZHMgPSB3b3JkQXJyYXkud29yZHM7XG5cdCAgICAgICAgICAgIHZhciBzaWdCeXRlcyA9IHdvcmRBcnJheS5zaWdCeXRlcztcblxuXHQgICAgICAgICAgICAvLyBDb252ZXJ0XG5cdCAgICAgICAgICAgIHZhciBsYXRpbjFDaGFycyA9IFtdO1xuXHQgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNpZ0J5dGVzOyBpKyspIHtcblx0ICAgICAgICAgICAgICAgIHZhciBiaXRlID0gKHdvcmRzW2kgPj4+IDJdID4+PiAoMjQgLSAoaSAlIDQpICogOCkpICYgMHhmZjtcblx0ICAgICAgICAgICAgICAgIGxhdGluMUNoYXJzLnB1c2goU3RyaW5nLmZyb21DaGFyQ29kZShiaXRlKSk7XG5cdCAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICByZXR1cm4gbGF0aW4xQ2hhcnMuam9pbignJyk7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIENvbnZlcnRzIGEgTGF0aW4xIHN0cmluZyB0byBhIHdvcmQgYXJyYXkuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gbGF0aW4xU3RyIFRoZSBMYXRpbjEgc3RyaW5nLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7V29yZEFycmF5fSBUaGUgd29yZCBhcnJheS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBzdGF0aWNcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIHdvcmRBcnJheSA9IENyeXB0b0pTLmVuYy5MYXRpbjEucGFyc2UobGF0aW4xU3RyaW5nKTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBwYXJzZTogZnVuY3Rpb24gKGxhdGluMVN0cikge1xuXHQgICAgICAgICAgICAvLyBTaG9ydGN1dFxuXHQgICAgICAgICAgICB2YXIgbGF0aW4xU3RyTGVuZ3RoID0gbGF0aW4xU3RyLmxlbmd0aDtcblxuXHQgICAgICAgICAgICAvLyBDb252ZXJ0XG5cdCAgICAgICAgICAgIHZhciB3b3JkcyA9IFtdO1xuXHQgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxhdGluMVN0ckxlbmd0aDsgaSsrKSB7XG5cdCAgICAgICAgICAgICAgICB3b3Jkc1tpID4+PiAyXSB8PSAobGF0aW4xU3RyLmNoYXJDb2RlQXQoaSkgJiAweGZmKSA8PCAoMjQgLSAoaSAlIDQpICogOCk7XG5cdCAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICByZXR1cm4gbmV3IFdvcmRBcnJheS5pbml0KHdvcmRzLCBsYXRpbjFTdHJMZW5ndGgpO1xuXHQgICAgICAgIH1cblx0ICAgIH07XG5cblx0ICAgIC8qKlxuXHQgICAgICogVVRGLTggZW5jb2Rpbmcgc3RyYXRlZ3kuXG5cdCAgICAgKi9cblx0ICAgIHZhciBVdGY4ID0gQ19lbmMuVXRmOCA9IHtcblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBDb252ZXJ0cyBhIHdvcmQgYXJyYXkgdG8gYSBVVEYtOCBzdHJpbmcuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge1dvcmRBcnJheX0gd29yZEFycmF5IFRoZSB3b3JkIGFycmF5LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7c3RyaW5nfSBUaGUgVVRGLTggc3RyaW5nLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHN0YXRpY1xuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgdXRmOFN0cmluZyA9IENyeXB0b0pTLmVuYy5VdGY4LnN0cmluZ2lmeSh3b3JkQXJyYXkpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIHN0cmluZ2lmeTogZnVuY3Rpb24gKHdvcmRBcnJheSkge1xuXHQgICAgICAgICAgICB0cnkge1xuXHQgICAgICAgICAgICAgICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChlc2NhcGUoTGF0aW4xLnN0cmluZ2lmeSh3b3JkQXJyYXkpKSk7XG5cdCAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcblx0ICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTWFsZm9ybWVkIFVURi04IGRhdGEnKTtcblx0ICAgICAgICAgICAgfVxuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBDb252ZXJ0cyBhIFVURi04IHN0cmluZyB0byBhIHdvcmQgYXJyYXkuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gdXRmOFN0ciBUaGUgVVRGLTggc3RyaW5nLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7V29yZEFycmF5fSBUaGUgd29yZCBhcnJheS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBzdGF0aWNcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIHdvcmRBcnJheSA9IENyeXB0b0pTLmVuYy5VdGY4LnBhcnNlKHV0ZjhTdHJpbmcpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIHBhcnNlOiBmdW5jdGlvbiAodXRmOFN0cikge1xuXHQgICAgICAgICAgICByZXR1cm4gTGF0aW4xLnBhcnNlKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudCh1dGY4U3RyKSkpO1xuXHQgICAgICAgIH1cblx0ICAgIH07XG5cblx0ICAgIC8qKlxuXHQgICAgICogQWJzdHJhY3QgYnVmZmVyZWQgYmxvY2sgYWxnb3JpdGhtIHRlbXBsYXRlLlxuXHQgICAgICpcblx0ICAgICAqIFRoZSBwcm9wZXJ0eSBibG9ja1NpemUgbXVzdCBiZSBpbXBsZW1lbnRlZCBpbiBhIGNvbmNyZXRlIHN1YnR5cGUuXG5cdCAgICAgKlxuXHQgICAgICogQHByb3BlcnR5IHtudW1iZXJ9IF9taW5CdWZmZXJTaXplIFRoZSBudW1iZXIgb2YgYmxvY2tzIHRoYXQgc2hvdWxkIGJlIGtlcHQgdW5wcm9jZXNzZWQgaW4gdGhlIGJ1ZmZlci4gRGVmYXVsdDogMFxuXHQgICAgICovXG5cdCAgICB2YXIgQnVmZmVyZWRCbG9ja0FsZ29yaXRobSA9IENfbGliLkJ1ZmZlcmVkQmxvY2tBbGdvcml0aG0gPSBCYXNlLmV4dGVuZCh7XG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogUmVzZXRzIHRoaXMgYmxvY2sgYWxnb3JpdGhtJ3MgZGF0YSBidWZmZXIgdG8gaXRzIGluaXRpYWwgc3RhdGUuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIGJ1ZmZlcmVkQmxvY2tBbGdvcml0aG0ucmVzZXQoKTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICByZXNldDogZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICAvLyBJbml0aWFsIHZhbHVlc1xuXHQgICAgICAgICAgICB0aGlzLl9kYXRhID0gbmV3IFdvcmRBcnJheS5pbml0KCk7XG5cdCAgICAgICAgICAgIHRoaXMuX25EYXRhQnl0ZXMgPSAwO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBBZGRzIG5ldyBkYXRhIHRvIHRoaXMgYmxvY2sgYWxnb3JpdGhtJ3MgYnVmZmVyLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtXb3JkQXJyYXl8c3RyaW5nfSBkYXRhIFRoZSBkYXRhIHRvIGFwcGVuZC4gU3RyaW5ncyBhcmUgY29udmVydGVkIHRvIGEgV29yZEFycmF5IHVzaW5nIFVURi04LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICBidWZmZXJlZEJsb2NrQWxnb3JpdGhtLl9hcHBlbmQoJ2RhdGEnKTtcblx0ICAgICAgICAgKiAgICAgYnVmZmVyZWRCbG9ja0FsZ29yaXRobS5fYXBwZW5kKHdvcmRBcnJheSk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgX2FwcGVuZDogZnVuY3Rpb24gKGRhdGEpIHtcblx0ICAgICAgICAgICAgLy8gQ29udmVydCBzdHJpbmcgdG8gV29yZEFycmF5LCBlbHNlIGFzc3VtZSBXb3JkQXJyYXkgYWxyZWFkeVxuXHQgICAgICAgICAgICBpZiAodHlwZW9mIGRhdGEgPT0gJ3N0cmluZycpIHtcblx0ICAgICAgICAgICAgICAgIGRhdGEgPSBVdGY4LnBhcnNlKGRhdGEpO1xuXHQgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgLy8gQXBwZW5kXG5cdCAgICAgICAgICAgIHRoaXMuX2RhdGEuY29uY2F0KGRhdGEpO1xuXHQgICAgICAgICAgICB0aGlzLl9uRGF0YUJ5dGVzICs9IGRhdGEuc2lnQnl0ZXM7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIFByb2Nlc3NlcyBhdmFpbGFibGUgZGF0YSBibG9ja3MuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBUaGlzIG1ldGhvZCBpbnZva2VzIF9kb1Byb2Nlc3NCbG9jayhvZmZzZXQpLCB3aGljaCBtdXN0IGJlIGltcGxlbWVudGVkIGJ5IGEgY29uY3JldGUgc3VidHlwZS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gZG9GbHVzaCBXaGV0aGVyIGFsbCBibG9ja3MgYW5kIHBhcnRpYWwgYmxvY2tzIHNob3VsZCBiZSBwcm9jZXNzZWQuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtXb3JkQXJyYXl9IFRoZSBwcm9jZXNzZWQgZGF0YS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIHByb2Nlc3NlZERhdGEgPSBidWZmZXJlZEJsb2NrQWxnb3JpdGhtLl9wcm9jZXNzKCk7XG5cdCAgICAgICAgICogICAgIHZhciBwcm9jZXNzZWREYXRhID0gYnVmZmVyZWRCbG9ja0FsZ29yaXRobS5fcHJvY2VzcyghISdmbHVzaCcpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIF9wcm9jZXNzOiBmdW5jdGlvbiAoZG9GbHVzaCkge1xuXHQgICAgICAgICAgICB2YXIgcHJvY2Vzc2VkV29yZHM7XG5cblx0ICAgICAgICAgICAgLy8gU2hvcnRjdXRzXG5cdCAgICAgICAgICAgIHZhciBkYXRhID0gdGhpcy5fZGF0YTtcblx0ICAgICAgICAgICAgdmFyIGRhdGFXb3JkcyA9IGRhdGEud29yZHM7XG5cdCAgICAgICAgICAgIHZhciBkYXRhU2lnQnl0ZXMgPSBkYXRhLnNpZ0J5dGVzO1xuXHQgICAgICAgICAgICB2YXIgYmxvY2tTaXplID0gdGhpcy5ibG9ja1NpemU7XG5cdCAgICAgICAgICAgIHZhciBibG9ja1NpemVCeXRlcyA9IGJsb2NrU2l6ZSAqIDQ7XG5cblx0ICAgICAgICAgICAgLy8gQ291bnQgYmxvY2tzIHJlYWR5XG5cdCAgICAgICAgICAgIHZhciBuQmxvY2tzUmVhZHkgPSBkYXRhU2lnQnl0ZXMgLyBibG9ja1NpemVCeXRlcztcblx0ICAgICAgICAgICAgaWYgKGRvRmx1c2gpIHtcblx0ICAgICAgICAgICAgICAgIC8vIFJvdW5kIHVwIHRvIGluY2x1ZGUgcGFydGlhbCBibG9ja3Ncblx0ICAgICAgICAgICAgICAgIG5CbG9ja3NSZWFkeSA9IE1hdGguY2VpbChuQmxvY2tzUmVhZHkpO1xuXHQgICAgICAgICAgICB9IGVsc2Uge1xuXHQgICAgICAgICAgICAgICAgLy8gUm91bmQgZG93biB0byBpbmNsdWRlIG9ubHkgZnVsbCBibG9ja3MsXG5cdCAgICAgICAgICAgICAgICAvLyBsZXNzIHRoZSBudW1iZXIgb2YgYmxvY2tzIHRoYXQgbXVzdCByZW1haW4gaW4gdGhlIGJ1ZmZlclxuXHQgICAgICAgICAgICAgICAgbkJsb2Nrc1JlYWR5ID0gTWF0aC5tYXgoKG5CbG9ja3NSZWFkeSB8IDApIC0gdGhpcy5fbWluQnVmZmVyU2l6ZSwgMCk7XG5cdCAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICAvLyBDb3VudCB3b3JkcyByZWFkeVxuXHQgICAgICAgICAgICB2YXIgbldvcmRzUmVhZHkgPSBuQmxvY2tzUmVhZHkgKiBibG9ja1NpemU7XG5cblx0ICAgICAgICAgICAgLy8gQ291bnQgYnl0ZXMgcmVhZHlcblx0ICAgICAgICAgICAgdmFyIG5CeXRlc1JlYWR5ID0gTWF0aC5taW4obldvcmRzUmVhZHkgKiA0LCBkYXRhU2lnQnl0ZXMpO1xuXG5cdCAgICAgICAgICAgIC8vIFByb2Nlc3MgYmxvY2tzXG5cdCAgICAgICAgICAgIGlmIChuV29yZHNSZWFkeSkge1xuXHQgICAgICAgICAgICAgICAgZm9yICh2YXIgb2Zmc2V0ID0gMDsgb2Zmc2V0IDwgbldvcmRzUmVhZHk7IG9mZnNldCArPSBibG9ja1NpemUpIHtcblx0ICAgICAgICAgICAgICAgICAgICAvLyBQZXJmb3JtIGNvbmNyZXRlLWFsZ29yaXRobSBsb2dpY1xuXHQgICAgICAgICAgICAgICAgICAgIHRoaXMuX2RvUHJvY2Vzc0Jsb2NrKGRhdGFXb3Jkcywgb2Zmc2V0KTtcblx0ICAgICAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICAgICAgLy8gUmVtb3ZlIHByb2Nlc3NlZCB3b3Jkc1xuXHQgICAgICAgICAgICAgICAgcHJvY2Vzc2VkV29yZHMgPSBkYXRhV29yZHMuc3BsaWNlKDAsIG5Xb3Jkc1JlYWR5KTtcblx0ICAgICAgICAgICAgICAgIGRhdGEuc2lnQnl0ZXMgLT0gbkJ5dGVzUmVhZHk7XG5cdCAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICAvLyBSZXR1cm4gcHJvY2Vzc2VkIHdvcmRzXG5cdCAgICAgICAgICAgIHJldHVybiBuZXcgV29yZEFycmF5LmluaXQocHJvY2Vzc2VkV29yZHMsIG5CeXRlc1JlYWR5KTtcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogQ3JlYXRlcyBhIGNvcHkgb2YgdGhpcyBvYmplY3QuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBjbG9uZS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIGNsb25lID0gYnVmZmVyZWRCbG9ja0FsZ29yaXRobS5jbG9uZSgpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIGNsb25lOiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgIHZhciBjbG9uZSA9IEJhc2UuY2xvbmUuY2FsbCh0aGlzKTtcblx0ICAgICAgICAgICAgY2xvbmUuX2RhdGEgPSB0aGlzLl9kYXRhLmNsb25lKCk7XG5cblx0ICAgICAgICAgICAgcmV0dXJuIGNsb25lO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICBfbWluQnVmZmVyU2l6ZTogMFxuXHQgICAgfSk7XG5cblx0ICAgIC8qKlxuXHQgICAgICogQWJzdHJhY3QgaGFzaGVyIHRlbXBsYXRlLlxuXHQgICAgICpcblx0ICAgICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBibG9ja1NpemUgVGhlIG51bWJlciBvZiAzMi1iaXQgd29yZHMgdGhpcyBoYXNoZXIgb3BlcmF0ZXMgb24uIERlZmF1bHQ6IDE2ICg1MTIgYml0cylcblx0ICAgICAqL1xuXHQgICAgdmFyIEhhc2hlciA9IENfbGliLkhhc2hlciA9IEJ1ZmZlcmVkQmxvY2tBbGdvcml0aG0uZXh0ZW5kKHtcblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBDb25maWd1cmF0aW9uIG9wdGlvbnMuXG5cdCAgICAgICAgICovXG5cdCAgICAgICAgY2ZnOiBCYXNlLmV4dGVuZCgpLFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogSW5pdGlhbGl6ZXMgYSBuZXdseSBjcmVhdGVkIGhhc2hlci5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBjZmcgKE9wdGlvbmFsKSBUaGUgY29uZmlndXJhdGlvbiBvcHRpb25zIHRvIHVzZSBmb3IgdGhpcyBoYXNoIGNvbXB1dGF0aW9uLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgaGFzaGVyID0gQ3J5cHRvSlMuYWxnby5TSEEyNTYuY3JlYXRlKCk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgaW5pdDogZnVuY3Rpb24gKGNmZykge1xuXHQgICAgICAgICAgICAvLyBBcHBseSBjb25maWcgZGVmYXVsdHNcblx0ICAgICAgICAgICAgdGhpcy5jZmcgPSB0aGlzLmNmZy5leHRlbmQoY2ZnKTtcblxuXHQgICAgICAgICAgICAvLyBTZXQgaW5pdGlhbCB2YWx1ZXNcblx0ICAgICAgICAgICAgdGhpcy5yZXNldCgpO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBSZXNldHMgdGhpcyBoYXNoZXIgdG8gaXRzIGluaXRpYWwgc3RhdGUuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIGhhc2hlci5yZXNldCgpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIHJlc2V0OiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgIC8vIFJlc2V0IGRhdGEgYnVmZmVyXG5cdCAgICAgICAgICAgIEJ1ZmZlcmVkQmxvY2tBbGdvcml0aG0ucmVzZXQuY2FsbCh0aGlzKTtcblxuXHQgICAgICAgICAgICAvLyBQZXJmb3JtIGNvbmNyZXRlLWhhc2hlciBsb2dpY1xuXHQgICAgICAgICAgICB0aGlzLl9kb1Jlc2V0KCk7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIFVwZGF0ZXMgdGhpcyBoYXNoZXIgd2l0aCBhIG1lc3NhZ2UuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge1dvcmRBcnJheXxzdHJpbmd9IG1lc3NhZ2VVcGRhdGUgVGhlIG1lc3NhZ2UgdG8gYXBwZW5kLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7SGFzaGVyfSBUaGlzIGhhc2hlci5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgaGFzaGVyLnVwZGF0ZSgnbWVzc2FnZScpO1xuXHQgICAgICAgICAqICAgICBoYXNoZXIudXBkYXRlKHdvcmRBcnJheSk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgdXBkYXRlOiBmdW5jdGlvbiAobWVzc2FnZVVwZGF0ZSkge1xuXHQgICAgICAgICAgICAvLyBBcHBlbmRcblx0ICAgICAgICAgICAgdGhpcy5fYXBwZW5kKG1lc3NhZ2VVcGRhdGUpO1xuXG5cdCAgICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgaGFzaFxuXHQgICAgICAgICAgICB0aGlzLl9wcm9jZXNzKCk7XG5cblx0ICAgICAgICAgICAgLy8gQ2hhaW5hYmxlXG5cdCAgICAgICAgICAgIHJldHVybiB0aGlzO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBGaW5hbGl6ZXMgdGhlIGhhc2ggY29tcHV0YXRpb24uXG5cdCAgICAgICAgICogTm90ZSB0aGF0IHRoZSBmaW5hbGl6ZSBvcGVyYXRpb24gaXMgZWZmZWN0aXZlbHkgYSBkZXN0cnVjdGl2ZSwgcmVhZC1vbmNlIG9wZXJhdGlvbi5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7V29yZEFycmF5fHN0cmluZ30gbWVzc2FnZVVwZGF0ZSAoT3B0aW9uYWwpIEEgZmluYWwgbWVzc2FnZSB1cGRhdGUuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtXb3JkQXJyYXl9IFRoZSBoYXNoLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgaGFzaCA9IGhhc2hlci5maW5hbGl6ZSgpO1xuXHQgICAgICAgICAqICAgICB2YXIgaGFzaCA9IGhhc2hlci5maW5hbGl6ZSgnbWVzc2FnZScpO1xuXHQgICAgICAgICAqICAgICB2YXIgaGFzaCA9IGhhc2hlci5maW5hbGl6ZSh3b3JkQXJyYXkpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIGZpbmFsaXplOiBmdW5jdGlvbiAobWVzc2FnZVVwZGF0ZSkge1xuXHQgICAgICAgICAgICAvLyBGaW5hbCBtZXNzYWdlIHVwZGF0ZVxuXHQgICAgICAgICAgICBpZiAobWVzc2FnZVVwZGF0ZSkge1xuXHQgICAgICAgICAgICAgICAgdGhpcy5fYXBwZW5kKG1lc3NhZ2VVcGRhdGUpO1xuXHQgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgLy8gUGVyZm9ybSBjb25jcmV0ZS1oYXNoZXIgbG9naWNcblx0ICAgICAgICAgICAgdmFyIGhhc2ggPSB0aGlzLl9kb0ZpbmFsaXplKCk7XG5cblx0ICAgICAgICAgICAgcmV0dXJuIGhhc2g7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIGJsb2NrU2l6ZTogNTEyLzMyLFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogQ3JlYXRlcyBhIHNob3J0Y3V0IGZ1bmN0aW9uIHRvIGEgaGFzaGVyJ3Mgb2JqZWN0IGludGVyZmFjZS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7SGFzaGVyfSBoYXNoZXIgVGhlIGhhc2hlciB0byBjcmVhdGUgYSBoZWxwZXIgZm9yLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7RnVuY3Rpb259IFRoZSBzaG9ydGN1dCBmdW5jdGlvbi5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBzdGF0aWNcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIFNIQTI1NiA9IENyeXB0b0pTLmxpYi5IYXNoZXIuX2NyZWF0ZUhlbHBlcihDcnlwdG9KUy5hbGdvLlNIQTI1Nik7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgX2NyZWF0ZUhlbHBlcjogZnVuY3Rpb24gKGhhc2hlcikge1xuXHQgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKG1lc3NhZ2UsIGNmZykge1xuXHQgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBoYXNoZXIuaW5pdChjZmcpLmZpbmFsaXplKG1lc3NhZ2UpO1xuXHQgICAgICAgICAgICB9O1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBDcmVhdGVzIGEgc2hvcnRjdXQgZnVuY3Rpb24gdG8gdGhlIEhNQUMncyBvYmplY3QgaW50ZXJmYWNlLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtIYXNoZXJ9IGhhc2hlciBUaGUgaGFzaGVyIHRvIHVzZSBpbiB0aGlzIEhNQUMgaGVscGVyLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7RnVuY3Rpb259IFRoZSBzaG9ydGN1dCBmdW5jdGlvbi5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBzdGF0aWNcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIEhtYWNTSEEyNTYgPSBDcnlwdG9KUy5saWIuSGFzaGVyLl9jcmVhdGVIbWFjSGVscGVyKENyeXB0b0pTLmFsZ28uU0hBMjU2KTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBfY3JlYXRlSG1hY0hlbHBlcjogZnVuY3Rpb24gKGhhc2hlcikge1xuXHQgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKG1lc3NhZ2UsIGtleSkge1xuXHQgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBDX2FsZ28uSE1BQy5pbml0KGhhc2hlciwga2V5KS5maW5hbGl6ZShtZXNzYWdlKTtcblx0ICAgICAgICAgICAgfTtcblx0ICAgICAgICB9XG5cdCAgICB9KTtcblxuXHQgICAgLyoqXG5cdCAgICAgKiBBbGdvcml0aG0gbmFtZXNwYWNlLlxuXHQgICAgICovXG5cdCAgICB2YXIgQ19hbGdvID0gQy5hbGdvID0ge307XG5cblx0ICAgIHJldHVybiBDO1xuXHR9KE1hdGgpKTtcblxuXG5cdHJldHVybiBDcnlwdG9KUztcblxufSkpOyIsIjsoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYgKHR5cGVvZiBleHBvcnRzID09PSBcIm9iamVjdFwiKSB7XG5cdFx0Ly8gQ29tbW9uSlNcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUoXCIuL2NvcmVcIikpO1xuXHR9XG5cdGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG5cdFx0Ly8gQU1EXG5cdFx0ZGVmaW5lKFtcIi4vY29yZVwiXSwgZmFjdG9yeSk7XG5cdH1cblx0ZWxzZSB7XG5cdFx0Ly8gR2xvYmFsIChicm93c2VyKVxuXHRcdGZhY3Rvcnkocm9vdC5DcnlwdG9KUyk7XG5cdH1cbn0odGhpcywgZnVuY3Rpb24gKENyeXB0b0pTKSB7XG5cblx0KGZ1bmN0aW9uICgpIHtcblx0ICAgIC8vIFNob3J0Y3V0c1xuXHQgICAgdmFyIEMgPSBDcnlwdG9KUztcblx0ICAgIHZhciBDX2xpYiA9IEMubGliO1xuXHQgICAgdmFyIFdvcmRBcnJheSA9IENfbGliLldvcmRBcnJheTtcblx0ICAgIHZhciBIYXNoZXIgPSBDX2xpYi5IYXNoZXI7XG5cdCAgICB2YXIgQ19hbGdvID0gQy5hbGdvO1xuXG5cdCAgICAvLyBSZXVzYWJsZSBvYmplY3Rcblx0ICAgIHZhciBXID0gW107XG5cblx0ICAgIC8qKlxuXHQgICAgICogU0hBLTEgaGFzaCBhbGdvcml0aG0uXG5cdCAgICAgKi9cblx0ICAgIHZhciBTSEExID0gQ19hbGdvLlNIQTEgPSBIYXNoZXIuZXh0ZW5kKHtcblx0ICAgICAgICBfZG9SZXNldDogZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICB0aGlzLl9oYXNoID0gbmV3IFdvcmRBcnJheS5pbml0KFtcblx0ICAgICAgICAgICAgICAgIDB4Njc0NTIzMDEsIDB4ZWZjZGFiODksXG5cdCAgICAgICAgICAgICAgICAweDk4YmFkY2ZlLCAweDEwMzI1NDc2LFxuXHQgICAgICAgICAgICAgICAgMHhjM2QyZTFmMFxuXHQgICAgICAgICAgICBdKTtcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgX2RvUHJvY2Vzc0Jsb2NrOiBmdW5jdGlvbiAoTSwgb2Zmc2V0KSB7XG5cdCAgICAgICAgICAgIC8vIFNob3J0Y3V0XG5cdCAgICAgICAgICAgIHZhciBIID0gdGhpcy5faGFzaC53b3JkcztcblxuXHQgICAgICAgICAgICAvLyBXb3JraW5nIHZhcmlhYmxlc1xuXHQgICAgICAgICAgICB2YXIgYSA9IEhbMF07XG5cdCAgICAgICAgICAgIHZhciBiID0gSFsxXTtcblx0ICAgICAgICAgICAgdmFyIGMgPSBIWzJdO1xuXHQgICAgICAgICAgICB2YXIgZCA9IEhbM107XG5cdCAgICAgICAgICAgIHZhciBlID0gSFs0XTtcblxuXHQgICAgICAgICAgICAvLyBDb21wdXRhdGlvblxuXHQgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDgwOyBpKyspIHtcblx0ICAgICAgICAgICAgICAgIGlmIChpIDwgMTYpIHtcblx0ICAgICAgICAgICAgICAgICAgICBXW2ldID0gTVtvZmZzZXQgKyBpXSB8IDA7XG5cdCAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXHQgICAgICAgICAgICAgICAgICAgIHZhciBuID0gV1tpIC0gM10gXiBXW2kgLSA4XSBeIFdbaSAtIDE0XSBeIFdbaSAtIDE2XTtcblx0ICAgICAgICAgICAgICAgICAgICBXW2ldID0gKG4gPDwgMSkgfCAobiA+Pj4gMzEpO1xuXHQgICAgICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgICAgICB2YXIgdCA9ICgoYSA8PCA1KSB8IChhID4+PiAyNykpICsgZSArIFdbaV07XG5cdCAgICAgICAgICAgICAgICBpZiAoaSA8IDIwKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgdCArPSAoKGIgJiBjKSB8ICh+YiAmIGQpKSArIDB4NWE4Mjc5OTk7XG5cdCAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGkgPCA0MCkge1xuXHQgICAgICAgICAgICAgICAgICAgIHQgKz0gKGIgXiBjIF4gZCkgKyAweDZlZDllYmExO1xuXHQgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpIDwgNjApIHtcblx0ICAgICAgICAgICAgICAgICAgICB0ICs9ICgoYiAmIGMpIHwgKGIgJiBkKSB8IChjICYgZCkpIC0gMHg3MGU0NDMyNDtcblx0ICAgICAgICAgICAgICAgIH0gZWxzZSAvKiBpZiAoaSA8IDgwKSAqLyB7XG5cdCAgICAgICAgICAgICAgICAgICAgdCArPSAoYiBeIGMgXiBkKSAtIDB4MzU5ZDNlMmE7XG5cdCAgICAgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgICAgIGUgPSBkO1xuXHQgICAgICAgICAgICAgICAgZCA9IGM7XG5cdCAgICAgICAgICAgICAgICBjID0gKGIgPDwgMzApIHwgKGIgPj4+IDIpO1xuXHQgICAgICAgICAgICAgICAgYiA9IGE7XG5cdCAgICAgICAgICAgICAgICBhID0gdDtcblx0ICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgIC8vIEludGVybWVkaWF0ZSBoYXNoIHZhbHVlXG5cdCAgICAgICAgICAgIEhbMF0gPSAoSFswXSArIGEpIHwgMDtcblx0ICAgICAgICAgICAgSFsxXSA9IChIWzFdICsgYikgfCAwO1xuXHQgICAgICAgICAgICBIWzJdID0gKEhbMl0gKyBjKSB8IDA7XG5cdCAgICAgICAgICAgIEhbM10gPSAoSFszXSArIGQpIHwgMDtcblx0ICAgICAgICAgICAgSFs0XSA9IChIWzRdICsgZSkgfCAwO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICBfZG9GaW5hbGl6ZTogZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICAvLyBTaG9ydGN1dHNcblx0ICAgICAgICAgICAgdmFyIGRhdGEgPSB0aGlzLl9kYXRhO1xuXHQgICAgICAgICAgICB2YXIgZGF0YVdvcmRzID0gZGF0YS53b3JkcztcblxuXHQgICAgICAgICAgICB2YXIgbkJpdHNUb3RhbCA9IHRoaXMuX25EYXRhQnl0ZXMgKiA4O1xuXHQgICAgICAgICAgICB2YXIgbkJpdHNMZWZ0ID0gZGF0YS5zaWdCeXRlcyAqIDg7XG5cblx0ICAgICAgICAgICAgLy8gQWRkIHBhZGRpbmdcblx0ICAgICAgICAgICAgZGF0YVdvcmRzW25CaXRzTGVmdCA+Pj4gNV0gfD0gMHg4MCA8PCAoMjQgLSBuQml0c0xlZnQgJSAzMik7XG5cdCAgICAgICAgICAgIGRhdGFXb3Jkc1soKChuQml0c0xlZnQgKyA2NCkgPj4+IDkpIDw8IDQpICsgMTRdID0gTWF0aC5mbG9vcihuQml0c1RvdGFsIC8gMHgxMDAwMDAwMDApO1xuXHQgICAgICAgICAgICBkYXRhV29yZHNbKCgobkJpdHNMZWZ0ICsgNjQpID4+PiA5KSA8PCA0KSArIDE1XSA9IG5CaXRzVG90YWw7XG5cdCAgICAgICAgICAgIGRhdGEuc2lnQnl0ZXMgPSBkYXRhV29yZHMubGVuZ3RoICogNDtcblxuXHQgICAgICAgICAgICAvLyBIYXNoIGZpbmFsIGJsb2Nrc1xuXHQgICAgICAgICAgICB0aGlzLl9wcm9jZXNzKCk7XG5cblx0ICAgICAgICAgICAgLy8gUmV0dXJuIGZpbmFsIGNvbXB1dGVkIGhhc2hcblx0ICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2hhc2g7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIGNsb25lOiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgIHZhciBjbG9uZSA9IEhhc2hlci5jbG9uZS5jYWxsKHRoaXMpO1xuXHQgICAgICAgICAgICBjbG9uZS5faGFzaCA9IHRoaXMuX2hhc2guY2xvbmUoKTtcblxuXHQgICAgICAgICAgICByZXR1cm4gY2xvbmU7XG5cdCAgICAgICAgfVxuXHQgICAgfSk7XG5cblx0ICAgIC8qKlxuXHQgICAgICogU2hvcnRjdXQgZnVuY3Rpb24gdG8gdGhlIGhhc2hlcidzIG9iamVjdCBpbnRlcmZhY2UuXG5cdCAgICAgKlxuXHQgICAgICogQHBhcmFtIHtXb3JkQXJyYXl8c3RyaW5nfSBtZXNzYWdlIFRoZSBtZXNzYWdlIHRvIGhhc2guXG5cdCAgICAgKlxuXHQgICAgICogQHJldHVybiB7V29yZEFycmF5fSBUaGUgaGFzaC5cblx0ICAgICAqXG5cdCAgICAgKiBAc3RhdGljXG5cdCAgICAgKlxuXHQgICAgICogQGV4YW1wbGVcblx0ICAgICAqXG5cdCAgICAgKiAgICAgdmFyIGhhc2ggPSBDcnlwdG9KUy5TSEExKCdtZXNzYWdlJyk7XG5cdCAgICAgKiAgICAgdmFyIGhhc2ggPSBDcnlwdG9KUy5TSEExKHdvcmRBcnJheSk7XG5cdCAgICAgKi9cblx0ICAgIEMuU0hBMSA9IEhhc2hlci5fY3JlYXRlSGVscGVyKFNIQTEpO1xuXG5cdCAgICAvKipcblx0ICAgICAqIFNob3J0Y3V0IGZ1bmN0aW9uIHRvIHRoZSBITUFDJ3Mgb2JqZWN0IGludGVyZmFjZS5cblx0ICAgICAqXG5cdCAgICAgKiBAcGFyYW0ge1dvcmRBcnJheXxzdHJpbmd9IG1lc3NhZ2UgVGhlIG1lc3NhZ2UgdG8gaGFzaC5cblx0ICAgICAqIEBwYXJhbSB7V29yZEFycmF5fHN0cmluZ30ga2V5IFRoZSBzZWNyZXQga2V5LlxuXHQgICAgICpcblx0ICAgICAqIEByZXR1cm4ge1dvcmRBcnJheX0gVGhlIEhNQUMuXG5cdCAgICAgKlxuXHQgICAgICogQHN0YXRpY1xuXHQgICAgICpcblx0ICAgICAqIEBleGFtcGxlXG5cdCAgICAgKlxuXHQgICAgICogICAgIHZhciBobWFjID0gQ3J5cHRvSlMuSG1hY1NIQTEobWVzc2FnZSwga2V5KTtcblx0ICAgICAqL1xuXHQgICAgQy5IbWFjU0hBMSA9IEhhc2hlci5fY3JlYXRlSG1hY0hlbHBlcihTSEExKTtcblx0fSgpKTtcblxuXG5cdHJldHVybiBDcnlwdG9KUy5TSEExO1xuXG59KSk7IiwiZXhwb3J0IGRlZmF1bHQgL14oPzpbMC05YS1mXXs4fS1bMC05YS1mXXs0fS1bMS01XVswLTlhLWZdezN9LVs4OWFiXVswLTlhLWZdezN9LVswLTlhLWZdezEyfXwwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDApJC9pOyIsIi8vIFVuaXF1ZSBJRCBjcmVhdGlvbiByZXF1aXJlcyBhIGhpZ2ggcXVhbGl0eSByYW5kb20gIyBnZW5lcmF0b3IuIEluIHRoZSBicm93c2VyIHdlIHRoZXJlZm9yZVxuLy8gcmVxdWlyZSB0aGUgY3J5cHRvIEFQSSBhbmQgZG8gbm90IHN1cHBvcnQgYnVpbHQtaW4gZmFsbGJhY2sgdG8gbG93ZXIgcXVhbGl0eSByYW5kb20gbnVtYmVyXG4vLyBnZW5lcmF0b3JzIChsaWtlIE1hdGgucmFuZG9tKCkpLlxuLy8gZ2V0UmFuZG9tVmFsdWVzIG5lZWRzIHRvIGJlIGludm9rZWQgaW4gYSBjb250ZXh0IHdoZXJlIFwidGhpc1wiIGlzIGEgQ3J5cHRvIGltcGxlbWVudGF0aW9uLiBBbHNvLFxuLy8gZmluZCB0aGUgY29tcGxldGUgaW1wbGVtZW50YXRpb24gb2YgY3J5cHRvIChtc0NyeXB0bykgb24gSUUxMS5cbnZhciBnZXRSYW5kb21WYWx1ZXMgPSB0eXBlb2YgY3J5cHRvICE9PSAndW5kZWZpbmVkJyAmJiBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzICYmIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMuYmluZChjcnlwdG8pIHx8IHR5cGVvZiBtc0NyeXB0byAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIG1zQ3J5cHRvLmdldFJhbmRvbVZhbHVlcyA9PT0gJ2Z1bmN0aW9uJyAmJiBtc0NyeXB0by5nZXRSYW5kb21WYWx1ZXMuYmluZChtc0NyeXB0byk7XG52YXIgcm5kczggPSBuZXcgVWludDhBcnJheSgxNik7XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBybmcoKSB7XG4gIGlmICghZ2V0UmFuZG9tVmFsdWVzKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKCkgbm90IHN1cHBvcnRlZC4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS91dWlkanMvdXVpZCNnZXRyYW5kb212YWx1ZXMtbm90LXN1cHBvcnRlZCcpO1xuICB9XG5cbiAgcmV0dXJuIGdldFJhbmRvbVZhbHVlcyhybmRzOCk7XG59IiwiaW1wb3J0IHZhbGlkYXRlIGZyb20gJy4vdmFsaWRhdGUuanMnO1xuLyoqXG4gKiBDb252ZXJ0IGFycmF5IG9mIDE2IGJ5dGUgdmFsdWVzIHRvIFVVSUQgc3RyaW5nIGZvcm1hdCBvZiB0aGUgZm9ybTpcbiAqIFhYWFhYWFhYLVhYWFgtWFhYWC1YWFhYLVhYWFhYWFhYWFhYWFxuICovXG5cbnZhciBieXRlVG9IZXggPSBbXTtcblxuZm9yICh2YXIgaSA9IDA7IGkgPCAyNTY7ICsraSkge1xuICBieXRlVG9IZXgucHVzaCgoaSArIDB4MTAwKS50b1N0cmluZygxNikuc3Vic3RyKDEpKTtcbn1cblxuZnVuY3Rpb24gc3RyaW5naWZ5KGFycikge1xuICB2YXIgb2Zmc2V0ID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiAwO1xuICAvLyBOb3RlOiBCZSBjYXJlZnVsIGVkaXRpbmcgdGhpcyBjb2RlISAgSXQncyBiZWVuIHR1bmVkIGZvciBwZXJmb3JtYW5jZVxuICAvLyBhbmQgd29ya3MgaW4gd2F5cyB5b3UgbWF5IG5vdCBleHBlY3QuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vdXVpZGpzL3V1aWQvcHVsbC80MzRcbiAgdmFyIHV1aWQgPSAoYnl0ZVRvSGV4W2FycltvZmZzZXQgKyAwXV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDFdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgMl1dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyAzXV0gKyAnLScgKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDRdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgNV1dICsgJy0nICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyA2XV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDddXSArICctJyArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgOF1dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyA5XV0gKyAnLScgKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDEwXV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDExXV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDEyXV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDEzXV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDE0XV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDE1XV0pLnRvTG93ZXJDYXNlKCk7IC8vIENvbnNpc3RlbmN5IGNoZWNrIGZvciB2YWxpZCBVVUlELiAgSWYgdGhpcyB0aHJvd3MsIGl0J3MgbGlrZWx5IGR1ZSB0byBvbmVcbiAgLy8gb2YgdGhlIGZvbGxvd2luZzpcbiAgLy8gLSBPbmUgb3IgbW9yZSBpbnB1dCBhcnJheSB2YWx1ZXMgZG9uJ3QgbWFwIHRvIGEgaGV4IG9jdGV0IChsZWFkaW5nIHRvXG4gIC8vIFwidW5kZWZpbmVkXCIgaW4gdGhlIHV1aWQpXG4gIC8vIC0gSW52YWxpZCBpbnB1dCB2YWx1ZXMgZm9yIHRoZSBSRkMgYHZlcnNpb25gIG9yIGB2YXJpYW50YCBmaWVsZHNcblxuICBpZiAoIXZhbGlkYXRlKHV1aWQpKSB7XG4gICAgdGhyb3cgVHlwZUVycm9yKCdTdHJpbmdpZmllZCBVVUlEIGlzIGludmFsaWQnKTtcbiAgfVxuXG4gIHJldHVybiB1dWlkO1xufVxuXG5leHBvcnQgZGVmYXVsdCBzdHJpbmdpZnk7IiwiaW1wb3J0IHJuZyBmcm9tICcuL3JuZy5qcyc7XG5pbXBvcnQgc3RyaW5naWZ5IGZyb20gJy4vc3RyaW5naWZ5LmpzJztcblxuZnVuY3Rpb24gdjQob3B0aW9ucywgYnVmLCBvZmZzZXQpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHZhciBybmRzID0gb3B0aW9ucy5yYW5kb20gfHwgKG9wdGlvbnMucm5nIHx8IHJuZykoKTsgLy8gUGVyIDQuNCwgc2V0IGJpdHMgZm9yIHZlcnNpb24gYW5kIGBjbG9ja19zZXFfaGlfYW5kX3Jlc2VydmVkYFxuXG4gIHJuZHNbNl0gPSBybmRzWzZdICYgMHgwZiB8IDB4NDA7XG4gIHJuZHNbOF0gPSBybmRzWzhdICYgMHgzZiB8IDB4ODA7IC8vIENvcHkgYnl0ZXMgdG8gYnVmZmVyLCBpZiBwcm92aWRlZFxuXG4gIGlmIChidWYpIHtcbiAgICBvZmZzZXQgPSBvZmZzZXQgfHwgMDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTY7ICsraSkge1xuICAgICAgYnVmW29mZnNldCArIGldID0gcm5kc1tpXTtcbiAgICB9XG5cbiAgICByZXR1cm4gYnVmO1xuICB9XG5cbiAgcmV0dXJuIHN0cmluZ2lmeShybmRzKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgdjQ7IiwiaW1wb3J0IFJFR0VYIGZyb20gJy4vcmVnZXguanMnO1xuXG5mdW5jdGlvbiB2YWxpZGF0ZSh1dWlkKSB7XG4gIHJldHVybiB0eXBlb2YgdXVpZCA9PT0gJ3N0cmluZycgJiYgUkVHRVgudGVzdCh1dWlkKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgdmFsaWRhdGU7IiwiLyoqXG4gKiBAbGljZW5zZVxuICogTG9kYXNoIChDdXN0b20gQnVpbGQpIGxvZGFzaC5jb20vbGljZW5zZSB8IFVuZGVyc2NvcmUuanMgMS44LjMgdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFXG4gKiBCdWlsZDogYGxvZGFzaCAtcCBpbmNsdWRlPVwia2V5cyxkZWZhdWx0cyxyZW1vdmUsb21pdFwiIGV4cG9ydHM9XCJub2RlXCIgLW8gLi92ZW5kb3IvbG9kYXNoLmN1c3RvbS5taW4uanNgXG4gKi9cbjsoZnVuY3Rpb24oKXtmdW5jdGlvbiB0KHQsZSxyKXtzd2l0Y2goci5sZW5ndGgpe2Nhc2UgMDpyZXR1cm4gdC5jYWxsKGUpO2Nhc2UgMTpyZXR1cm4gdC5jYWxsKGUsclswXSk7Y2FzZSAyOnJldHVybiB0LmNhbGwoZSxyWzBdLHJbMV0pO2Nhc2UgMzpyZXR1cm4gdC5jYWxsKGUsclswXSxyWzFdLHJbMl0pfXJldHVybiB0LmFwcGx5KGUscil9ZnVuY3Rpb24gZSh0LGUpe2Zvcih2YXIgcj0tMSxuPW51bGw9PXQ/MDp0Lmxlbmd0aDsrK3I8biYmZmFsc2UhPT1lKHRbcl0scix0KTspO31mdW5jdGlvbiByKHQsZSl7Zm9yKHZhciByPS0xLG49bnVsbD09dD8wOnQubGVuZ3RoLG89MCxjPVtdOysrcjxuOyl7dmFyIHU9dFtyXTtlKHUscix0KSYmKGNbbysrXT11KX1yZXR1cm4gY31mdW5jdGlvbiBuKHQsZSl7Zm9yKHZhciByPS0xLG49bnVsbD09dD8wOnQubGVuZ3RoLG89QXJyYXkobik7KytyPG47KW9bcl09ZSh0W3JdLHIsdCk7cmV0dXJuIG99ZnVuY3Rpb24gbyh0LGUpe2Zvcih2YXIgcj0tMSxuPWUubGVuZ3RoLG89dC5sZW5ndGg7KytyPG47KXRbbytyXT1lW3JdO1xucmV0dXJuIHR9ZnVuY3Rpb24gYyh0LGUpe2Zvcih2YXIgcj0tMSxuPW51bGw9PXQ/MDp0Lmxlbmd0aDsrK3I8bjspaWYoZSh0W3JdLHIsdCkpcmV0dXJuIHRydWU7cmV0dXJuIGZhbHNlfWZ1bmN0aW9uIHUodCl7cmV0dXJuIGZ1bmN0aW9uKGUpe3JldHVybiBudWxsPT1lP0J0OmVbdF19fWZ1bmN0aW9uIGEodCl7cmV0dXJuIGZ1bmN0aW9uKGUpe3JldHVybiB0KGUpfX1mdW5jdGlvbiBpKHQpe3ZhciBlPS0xLHI9QXJyYXkodC5zaXplKTtyZXR1cm4gdC5mb3JFYWNoKGZ1bmN0aW9uKHQsbil7clsrK2VdPVtuLHRdfSkscn1mdW5jdGlvbiBmKHQpe3ZhciBlPU9iamVjdDtyZXR1cm4gZnVuY3Rpb24ocil7cmV0dXJuIHQoZShyKSl9fWZ1bmN0aW9uIGwodCl7dmFyIGU9LTEscj1BcnJheSh0LnNpemUpO3JldHVybiB0LmZvckVhY2goZnVuY3Rpb24odCl7clsrK2VdPXR9KSxyfWZ1bmN0aW9uIHMoKXt9ZnVuY3Rpb24gYih0KXt2YXIgZT0tMSxyPW51bGw9PXQ/MDp0Lmxlbmd0aDtmb3IodGhpcy5jbGVhcigpOysrZTxyOyl7XG52YXIgbj10W2VdO3RoaXMuc2V0KG5bMF0sblsxXSl9fWZ1bmN0aW9uIGgodCl7dmFyIGU9LTEscj1udWxsPT10PzA6dC5sZW5ndGg7Zm9yKHRoaXMuY2xlYXIoKTsrK2U8cjspe3ZhciBuPXRbZV07dGhpcy5zZXQoblswXSxuWzFdKX19ZnVuY3Rpb24gcCh0KXt2YXIgZT0tMSxyPW51bGw9PXQ/MDp0Lmxlbmd0aDtmb3IodGhpcy5jbGVhcigpOysrZTxyOyl7dmFyIG49dFtlXTt0aGlzLnNldChuWzBdLG5bMV0pfX1mdW5jdGlvbiB5KHQpe3ZhciBlPS0xLHI9bnVsbD09dD8wOnQubGVuZ3RoO2Zvcih0aGlzLl9fZGF0YV9fPW5ldyBwOysrZTxyOyl0aGlzLmFkZCh0W2VdKX1mdW5jdGlvbiBqKHQpe3RoaXMuc2l6ZT0odGhpcy5fX2RhdGFfXz1uZXcgaCh0KSkuc2l6ZX1mdW5jdGlvbiBfKHQsZSl7dmFyIHI9S2UodCksbj0hciYmSmUodCksbz0hciYmIW4mJlFlKHQpLGM9IXImJiFuJiYhbyYmWmUodCk7aWYocj1yfHxufHxvfHxjKXtmb3IodmFyIG49dC5sZW5ndGgsdT1TdHJpbmcsYT0tMSxpPUFycmF5KG4pOysrYTxuOylpW2FdPXUoYSk7XG5uPWl9ZWxzZSBuPVtdO3ZhciBmLHU9bi5sZW5ndGg7Zm9yKGYgaW4gdCkhZSYmIXVlLmNhbGwodCxmKXx8ciYmKFwibGVuZ3RoXCI9PWZ8fG8mJihcIm9mZnNldFwiPT1mfHxcInBhcmVudFwiPT1mKXx8YyYmKFwiYnVmZmVyXCI9PWZ8fFwiYnl0ZUxlbmd0aFwiPT1mfHxcImJ5dGVPZmZzZXRcIj09Zil8fGN0KGYsdSkpfHxuLnB1c2goZik7cmV0dXJuIG59ZnVuY3Rpb24gZyh0LGUscil7dmFyIG49dFtlXTt1ZS5jYWxsKHQsZSkmJnl0KG4scikmJihyIT09QnR8fGUgaW4gdCl8fHcodCxlLHIpfWZ1bmN0aW9uIHYodCxlKXtmb3IodmFyIHI9dC5sZW5ndGg7ci0tOylpZih5dCh0W3JdWzBdLGUpKXJldHVybiByO3JldHVybi0xfWZ1bmN0aW9uIGQodCxlKXtyZXR1cm4gdCYmVyhlLHp0KGUpLHQpfWZ1bmN0aW9uIEEodCxlKXtyZXR1cm4gdCYmVyhlLGt0KGUpLHQpfWZ1bmN0aW9uIHcodCxlLHIpe1wiX19wcm90b19fXCI9PWUmJkFlP0FlKHQsZSx7Y29uZmlndXJhYmxlOnRydWUsZW51bWVyYWJsZTp0cnVlLHZhbHVlOnIsXG53cml0YWJsZTp0cnVlfSk6dFtlXT1yfWZ1bmN0aW9uIG0odCxyLG4sbyxjLHUpe3ZhciBhLGk9MSZyLGY9MiZyLGw9NCZyO2lmKG4mJihhPWM/bih0LG8sYyx1KTpuKHQpKSxhIT09QnQpcmV0dXJuIGE7aWYoIXZ0KHQpKXJldHVybiB0O2lmKG89S2UodCkpe2lmKGE9cnQodCksIWkpcmV0dXJuIE4odCxhKX1lbHNle3ZhciBzPUdlKHQpLGI9XCJbb2JqZWN0IEZ1bmN0aW9uXVwiPT1zfHxcIltvYmplY3QgR2VuZXJhdG9yRnVuY3Rpb25dXCI9PXM7aWYoUWUodCkpcmV0dXJuIFIodCxpKTtpZihcIltvYmplY3QgT2JqZWN0XVwiPT1zfHxcIltvYmplY3QgQXJndW1lbnRzXVwiPT1zfHxiJiYhYyl7aWYoYT1mfHxiP3t9OnR5cGVvZiB0LmNvbnN0cnVjdG9yIT1cImZ1bmN0aW9uXCJ8fGF0KHQpP3t9OlJlKHllKHQpKSwhaSlyZXR1cm4gZj9xKHQsQShhLHQpKTpHKHQsZChhLHQpKX1lbHNle2lmKCFXdFtzXSlyZXR1cm4gYz90Ont9O2E9bnQodCxzLGkpfX1pZih1fHwodT1uZXcgaiksYz11LmdldCh0KSlyZXR1cm4gYztcbmlmKHUuc2V0KHQsYSksWWUodCkpcmV0dXJuIHQuZm9yRWFjaChmdW5jdGlvbihlKXthLmFkZChtKGUscixuLGUsdCx1KSl9KSxhO2lmKFhlKHQpKXJldHVybiB0LmZvckVhY2goZnVuY3Rpb24oZSxvKXthLnNldChvLG0oZSxyLG4sbyx0LHUpKX0pLGE7dmFyIGY9bD9mP1g6UTpmP2t0Onp0LGg9bz9CdDpmKHQpO3JldHVybiBlKGh8fHQsZnVuY3Rpb24oZSxvKXtoJiYobz1lLGU9dFtvXSksZyhhLG8sbShlLHIsbixvLHQsdSkpfSksYX1mdW5jdGlvbiBPKHQsZSxyLG4sYyl7dmFyIHU9LTEsYT10Lmxlbmd0aDtmb3Iocnx8KHI9b3QpLGN8fChjPVtdKTsrK3U8YTspe3ZhciBpPXRbdV07MDxlJiZyKGkpPzE8ZT9PKGksZS0xLHIsbixjKTpvKGMsaSk6bnx8KGNbYy5sZW5ndGhdPWkpfXJldHVybiBjfWZ1bmN0aW9uIFModCxlKXtlPVYoZSx0KTtmb3IodmFyIHI9MCxuPWUubGVuZ3RoO251bGwhPXQmJnI8bjspdD10W2x0KGVbcisrXSldO3JldHVybiByJiZyPT1uP3Q6QnR9ZnVuY3Rpb24geih0LGUscil7XG5yZXR1cm4gZT1lKHQpLEtlKHQpP2U6byhlLHIodCkpfWZ1bmN0aW9uIGsodCl7aWYobnVsbD09dCl0PXQ9PT1CdD9cIltvYmplY3QgVW5kZWZpbmVkXVwiOlwiW29iamVjdCBOdWxsXVwiO2Vsc2UgaWYoZGUmJmRlIGluIE9iamVjdCh0KSl7dmFyIGU9dWUuY2FsbCh0LGRlKSxyPXRbZGVdO3RyeXt0W2RlXT1CdDt2YXIgbj10cnVlfWNhdGNoKHQpe312YXIgbz1pZS5jYWxsKHQpO24mJihlP3RbZGVdPXI6ZGVsZXRlIHRbZGVdKSx0PW99ZWxzZSB0PWllLmNhbGwodCk7cmV0dXJuIHR9ZnVuY3Rpb24geCh0KXtyZXR1cm4gZHQodCkmJlwiW29iamVjdCBBcmd1bWVudHNdXCI9PWsodCl9ZnVuY3Rpb24gRSh0LGUscixuLG8pe2lmKHQ9PT1lKWU9dHJ1ZTtlbHNlIGlmKG51bGw9PXR8fG51bGw9PWV8fCFkdCh0KSYmIWR0KGUpKWU9dCE9PXQmJmUhPT1lO2Vsc2UgdDp7dmFyIGM9S2UodCksdT1LZShlKSxhPWM/XCJbb2JqZWN0IEFycmF5XVwiOkdlKHQpLGk9dT9cIltvYmplY3QgQXJyYXldXCI6R2UoZSksYT1cIltvYmplY3QgQXJndW1lbnRzXVwiPT1hP1wiW29iamVjdCBPYmplY3RdXCI6YSxpPVwiW29iamVjdCBBcmd1bWVudHNdXCI9PWk/XCJbb2JqZWN0IE9iamVjdF1cIjppLGY9XCJbb2JqZWN0IE9iamVjdF1cIj09YSx1PVwiW29iamVjdCBPYmplY3RdXCI9PWk7XG5pZigoaT1hPT1pKSYmUWUodCkpe2lmKCFRZShlKSl7ZT1mYWxzZTticmVhayB0fWM9dHJ1ZSxmPWZhbHNlfWlmKGkmJiFmKW98fChvPW5ldyBqKSxlPWN8fFplKHQpP0oodCxlLHIsbixFLG8pOksodCxlLGEscixuLEUsbyk7ZWxzZXtpZighKDEmcikmJihjPWYmJnVlLmNhbGwodCxcIl9fd3JhcHBlZF9fXCIpLGE9dSYmdWUuY2FsbChlLFwiX193cmFwcGVkX19cIiksY3x8YSkpe3Q9Yz90LnZhbHVlKCk6dCxlPWE/ZS52YWx1ZSgpOmUsb3x8KG89bmV3IGopLGU9RSh0LGUscixuLG8pO2JyZWFrIHR9aWYoaSllOmlmKG98fChvPW5ldyBqKSxjPTEmcixhPVEodCksdT1hLmxlbmd0aCxpPVEoZSkubGVuZ3RoLHU9PWl8fGMpe2ZvcihmPXU7Zi0tOyl7dmFyIGw9YVtmXTtpZighKGM/bCBpbiBlOnVlLmNhbGwoZSxsKSkpe2U9ZmFsc2U7YnJlYWsgZX19aWYoKGk9by5nZXQodCkpJiZvLmdldChlKSllPWk9PWU7ZWxzZXtpPXRydWUsby5zZXQodCxlKSxvLnNldChlLHQpO2Zvcih2YXIgcz1jOysrZjx1Oyl7dmFyIGw9YVtmXSxiPXRbbF0saD1lW2xdO1xuaWYobil2YXIgcD1jP24oaCxiLGwsZSx0LG8pOm4oYixoLGwsdCxlLG8pO2lmKHA9PT1CdD9iIT09aCYmIUUoYixoLHIsbixvKTohcCl7aT1mYWxzZTticmVha31zfHwocz1cImNvbnN0cnVjdG9yXCI9PWwpfWkmJiFzJiYocj10LmNvbnN0cnVjdG9yLG49ZS5jb25zdHJ1Y3RvcixyIT1uJiZcImNvbnN0cnVjdG9yXCJpbiB0JiZcImNvbnN0cnVjdG9yXCJpbiBlJiYhKHR5cGVvZiByPT1cImZ1bmN0aW9uXCImJnIgaW5zdGFuY2VvZiByJiZ0eXBlb2Ygbj09XCJmdW5jdGlvblwiJiZuIGluc3RhbmNlb2YgbikmJihpPWZhbHNlKSksby5kZWxldGUodCksby5kZWxldGUoZSksZT1pfX1lbHNlIGU9ZmFsc2U7ZWxzZSBlPWZhbHNlfX1yZXR1cm4gZX1mdW5jdGlvbiBGKHQpe3JldHVybiBkdCh0KSYmXCJbb2JqZWN0IE1hcF1cIj09R2UodCl9ZnVuY3Rpb24gSSh0LGUpe3ZhciByPWUubGVuZ3RoLG49cjtpZihudWxsPT10KXJldHVybiFuO2Zvcih0PU9iamVjdCh0KTtyLS07KXt2YXIgbz1lW3JdO2lmKG9bMl0/b1sxXSE9PXRbb1swXV06IShvWzBdaW4gdCkpcmV0dXJuIGZhbHNlO1xufWZvcig7KytyPG47KXt2YXIgbz1lW3JdLGM9b1swXSx1PXRbY10sYT1vWzFdO2lmKG9bMl0pe2lmKHU9PT1CdCYmIShjIGluIHQpKXJldHVybiBmYWxzZX1lbHNlIGlmKG89bmV3IGosdm9pZCAwPT09QnQ/IUUoYSx1LDMsdm9pZCAwLG8pOjEpcmV0dXJuIGZhbHNlfXJldHVybiB0cnVlfWZ1bmN0aW9uIE0odCl7cmV0dXJuIGR0KHQpJiZcIltvYmplY3QgU2V0XVwiPT1HZSh0KX1mdW5jdGlvbiBVKHQpe3JldHVybiBkdCh0KSYmZ3QodC5sZW5ndGgpJiYhIU50W2sodCldfWZ1bmN0aW9uIEIodCl7cmV0dXJuIHR5cGVvZiB0PT1cImZ1bmN0aW9uXCI/dDpudWxsPT10P0V0OnR5cGVvZiB0PT1cIm9iamVjdFwiP0tlKHQpP1AodFswXSx0WzFdKTpEKHQpOkl0KHQpfWZ1bmN0aW9uIEQodCl7dmFyIGU9dHQodCk7cmV0dXJuIDE9PWUubGVuZ3RoJiZlWzBdWzJdP2l0KGVbMF1bMF0sZVswXVsxXSk6ZnVuY3Rpb24ocil7cmV0dXJuIHI9PT10fHxJKHIsZSl9fWZ1bmN0aW9uIFAodCxlKXtyZXR1cm4gdXQodCkmJmU9PT1lJiYhdnQoZSk/aXQobHQodCksZSk6ZnVuY3Rpb24ocil7XG52YXIgbj1PdChyLHQpO3JldHVybiBuPT09QnQmJm49PT1lP1N0KHIsdCk6RShlLG4sMyl9fWZ1bmN0aW9uICQodCl7cmV0dXJuIGZ1bmN0aW9uKGUpe3JldHVybiBTKGUsdCl9fWZ1bmN0aW9uIEwodCl7aWYodHlwZW9mIHQ9PVwic3RyaW5nXCIpcmV0dXJuIHQ7aWYoS2UodCkpcmV0dXJuIG4odCxMKStcIlwiO2lmKHd0KHQpKXJldHVybiBWZT9WZS5jYWxsKHQpOlwiXCI7dmFyIGU9dCtcIlwiO3JldHVyblwiMFwiPT1lJiYxL3Q9PS1EdD9cIi0wXCI6ZX1mdW5jdGlvbiBDKHQsZSl7ZT1WKGUsdCk7dmFyIHI7aWYoMj5lLmxlbmd0aClyPXQ7ZWxzZXtyPWU7dmFyIG49MCxvPS0xLGM9LTEsdT1yLmxlbmd0aDtmb3IoMD5uJiYobj0tbj51PzA6dStuKSxvPW8+dT91Om8sMD5vJiYobys9dSksdT1uPm8/MDpvLW4+Pj4wLG4+Pj49MCxvPUFycmF5KHUpOysrYzx1OylvW2NdPXJbYytuXTtyPVModCxvKX10PXIsbnVsbD09dHx8ZGVsZXRlIHRbbHQoaHQoZSkpXX1mdW5jdGlvbiBWKHQsZSl7cmV0dXJuIEtlKHQpP3Q6dXQodCxlKT9bdF06SGUobXQodCkpO1xufWZ1bmN0aW9uIFIodCxlKXtpZihlKXJldHVybiB0LnNsaWNlKCk7dmFyIHI9dC5sZW5ndGgscj1wZT9wZShyKTpuZXcgdC5jb25zdHJ1Y3RvcihyKTtyZXR1cm4gdC5jb3B5KHIpLHJ9ZnVuY3Rpb24gVCh0KXt2YXIgZT1uZXcgdC5jb25zdHJ1Y3Rvcih0LmJ5dGVMZW5ndGgpO3JldHVybiBuZXcgaGUoZSkuc2V0KG5ldyBoZSh0KSksZX1mdW5jdGlvbiBOKHQsZSl7dmFyIHI9LTEsbj10Lmxlbmd0aDtmb3IoZXx8KGU9QXJyYXkobikpOysrcjxuOyllW3JdPXRbcl07cmV0dXJuIGV9ZnVuY3Rpb24gVyh0LGUscil7dmFyIG49IXI7cnx8KHI9e30pO2Zvcih2YXIgbz0tMSxjPWUubGVuZ3RoOysrbzxjOyl7dmFyIHU9ZVtvXSxhPUJ0O2E9PT1CdCYmKGE9dFt1XSksbj93KHIsdSxhKTpnKHIsdSxhKX1yZXR1cm4gcn1mdW5jdGlvbiBHKHQsZSl7cmV0dXJuIFcodCxOZSh0KSxlKX1mdW5jdGlvbiBxKHQsZSl7cmV0dXJuIFcodCxXZSh0KSxlKX1mdW5jdGlvbiBIKHQpe3JldHVybiBBdCh0KT9CdDp0O1xufWZ1bmN0aW9uIEoodCxlLHIsbixvLHUpe3ZhciBhPTEmcixpPXQubGVuZ3RoLGY9ZS5sZW5ndGg7aWYoaSE9ZiYmIShhJiZmPmkpKXJldHVybiBmYWxzZTtpZigoZj11LmdldCh0KSkmJnUuZ2V0KGUpKXJldHVybiBmPT1lO3ZhciBmPS0xLGw9dHJ1ZSxzPTImcj9uZXcgeTpCdDtmb3IodS5zZXQodCxlKSx1LnNldChlLHQpOysrZjxpOyl7dmFyIGI9dFtmXSxoPWVbZl07aWYobil2YXIgcD1hP24oaCxiLGYsZSx0LHUpOm4oYixoLGYsdCxlLHUpO2lmKHAhPT1CdCl7aWYocCljb250aW51ZTtsPWZhbHNlO2JyZWFrfWlmKHMpe2lmKCFjKGUsZnVuY3Rpb24odCxlKXtpZighcy5oYXMoZSkmJihiPT09dHx8byhiLHQscixuLHUpKSlyZXR1cm4gcy5wdXNoKGUpfSkpe2w9ZmFsc2U7YnJlYWt9fWVsc2UgaWYoYiE9PWgmJiFvKGIsaCxyLG4sdSkpe2w9ZmFsc2U7YnJlYWt9fXJldHVybiB1LmRlbGV0ZSh0KSx1LmRlbGV0ZShlKSxsfWZ1bmN0aW9uIEsodCxlLHIsbixvLGMsdSl7c3dpdGNoKHIpe2Nhc2VcIltvYmplY3QgRGF0YVZpZXddXCI6XG5pZih0LmJ5dGVMZW5ndGghPWUuYnl0ZUxlbmd0aHx8dC5ieXRlT2Zmc2V0IT1lLmJ5dGVPZmZzZXQpYnJlYWs7dD10LmJ1ZmZlcixlPWUuYnVmZmVyO2Nhc2VcIltvYmplY3QgQXJyYXlCdWZmZXJdXCI6aWYodC5ieXRlTGVuZ3RoIT1lLmJ5dGVMZW5ndGh8fCFjKG5ldyBoZSh0KSxuZXcgaGUoZSkpKWJyZWFrO3JldHVybiB0cnVlO2Nhc2VcIltvYmplY3QgQm9vbGVhbl1cIjpjYXNlXCJbb2JqZWN0IERhdGVdXCI6Y2FzZVwiW29iamVjdCBOdW1iZXJdXCI6cmV0dXJuIHl0KCt0LCtlKTtjYXNlXCJbb2JqZWN0IEVycm9yXVwiOnJldHVybiB0Lm5hbWU9PWUubmFtZSYmdC5tZXNzYWdlPT1lLm1lc3NhZ2U7Y2FzZVwiW29iamVjdCBSZWdFeHBdXCI6Y2FzZVwiW29iamVjdCBTdHJpbmddXCI6cmV0dXJuIHQ9PWUrXCJcIjtjYXNlXCJbb2JqZWN0IE1hcF1cIjp2YXIgYT1pO2Nhc2VcIltvYmplY3QgU2V0XVwiOmlmKGF8fChhPWwpLHQuc2l6ZSE9ZS5zaXplJiYhKDEmbikpYnJlYWs7cmV0dXJuKHI9dS5nZXQodCkpP3I9PWU6KG58PTIsXG51LnNldCh0LGUpLGU9SihhKHQpLGEoZSksbixvLGMsdSksdS5kZWxldGUodCksZSk7Y2FzZVwiW29iamVjdCBTeW1ib2xdXCI6aWYoQ2UpcmV0dXJuIENlLmNhbGwodCk9PUNlLmNhbGwoZSl9cmV0dXJuIGZhbHNlfWZ1bmN0aW9uIFEodCl7cmV0dXJuIHoodCx6dCxOZSl9ZnVuY3Rpb24gWCh0KXtyZXR1cm4geih0LGt0LFdlKX1mdW5jdGlvbiBZKCl7dmFyIHQ9cy5pdGVyYXRlZXx8RnQsdD10PT09RnQ/Qjp0O3JldHVybiBhcmd1bWVudHMubGVuZ3RoP3QoYXJndW1lbnRzWzBdLGFyZ3VtZW50c1sxXSk6dH1mdW5jdGlvbiBaKHQsZSl7dmFyIHI9dC5fX2RhdGFfXyxuPXR5cGVvZiBlO3JldHVybihcInN0cmluZ1wiPT1ufHxcIm51bWJlclwiPT1ufHxcInN5bWJvbFwiPT1ufHxcImJvb2xlYW5cIj09bj9cIl9fcHJvdG9fX1wiIT09ZTpudWxsPT09ZSk/clt0eXBlb2YgZT09XCJzdHJpbmdcIj9cInN0cmluZ1wiOlwiaGFzaFwiXTpyLm1hcH1mdW5jdGlvbiB0dCh0KXtmb3IodmFyIGU9enQodCkscj1lLmxlbmd0aDtyLS07KXtcbnZhciBuPWVbcl0sbz10W25dO2Vbcl09W24sbyxvPT09byYmIXZ0KG8pXX1yZXR1cm4gZX1mdW5jdGlvbiBldCh0LGUpe3ZhciByPW51bGw9PXQ/QnQ6dFtlXTtyZXR1cm4oIXZ0KHIpfHxhZSYmYWUgaW4gcj8wOihfdChyKT9sZTpSdCkudGVzdChzdChyKSkpP3I6QnR9ZnVuY3Rpb24gcnQodCl7dmFyIGU9dC5sZW5ndGgscj1uZXcgdC5jb25zdHJ1Y3RvcihlKTtyZXR1cm4gZSYmXCJzdHJpbmdcIj09dHlwZW9mIHRbMF0mJnVlLmNhbGwodCxcImluZGV4XCIpJiYoci5pbmRleD10LmluZGV4LHIuaW5wdXQ9dC5pbnB1dCkscn1mdW5jdGlvbiBudCh0LGUscil7dmFyIG49dC5jb25zdHJ1Y3Rvcjtzd2l0Y2goZSl7Y2FzZVwiW29iamVjdCBBcnJheUJ1ZmZlcl1cIjpyZXR1cm4gVCh0KTtjYXNlXCJbb2JqZWN0IEJvb2xlYW5dXCI6Y2FzZVwiW29iamVjdCBEYXRlXVwiOnJldHVybiBuZXcgbigrdCk7Y2FzZVwiW29iamVjdCBEYXRhVmlld11cIjpyZXR1cm4gZT1yP1QodC5idWZmZXIpOnQuYnVmZmVyLG5ldyB0LmNvbnN0cnVjdG9yKGUsdC5ieXRlT2Zmc2V0LHQuYnl0ZUxlbmd0aCk7XG5jYXNlXCJbb2JqZWN0IEZsb2F0MzJBcnJheV1cIjpjYXNlXCJbb2JqZWN0IEZsb2F0NjRBcnJheV1cIjpjYXNlXCJbb2JqZWN0IEludDhBcnJheV1cIjpjYXNlXCJbb2JqZWN0IEludDE2QXJyYXldXCI6Y2FzZVwiW29iamVjdCBJbnQzMkFycmF5XVwiOmNhc2VcIltvYmplY3QgVWludDhBcnJheV1cIjpjYXNlXCJbb2JqZWN0IFVpbnQ4Q2xhbXBlZEFycmF5XVwiOmNhc2VcIltvYmplY3QgVWludDE2QXJyYXldXCI6Y2FzZVwiW29iamVjdCBVaW50MzJBcnJheV1cIjpyZXR1cm4gZT1yP1QodC5idWZmZXIpOnQuYnVmZmVyLG5ldyB0LmNvbnN0cnVjdG9yKGUsdC5ieXRlT2Zmc2V0LHQubGVuZ3RoKTtjYXNlXCJbb2JqZWN0IE1hcF1cIjpyZXR1cm4gbmV3IG47Y2FzZVwiW29iamVjdCBOdW1iZXJdXCI6Y2FzZVwiW29iamVjdCBTdHJpbmddXCI6cmV0dXJuIG5ldyBuKHQpO2Nhc2VcIltvYmplY3QgUmVnRXhwXVwiOnJldHVybiBlPW5ldyB0LmNvbnN0cnVjdG9yKHQuc291cmNlLFZ0LmV4ZWModCkpLGUubGFzdEluZGV4PXQubGFzdEluZGV4LFxuZTtjYXNlXCJbb2JqZWN0IFNldF1cIjpyZXR1cm4gbmV3IG47Y2FzZVwiW29iamVjdCBTeW1ib2xdXCI6cmV0dXJuIENlP09iamVjdChDZS5jYWxsKHQpKTp7fX19ZnVuY3Rpb24gb3QodCl7cmV0dXJuIEtlKHQpfHxKZSh0KXx8ISEodmUmJnQmJnRbdmVdKX1mdW5jdGlvbiBjdCh0LGUpe3ZhciByPXR5cGVvZiB0O3JldHVybiBlPW51bGw9PWU/OTAwNzE5OTI1NDc0MDk5MTplLCEhZSYmKFwibnVtYmVyXCI9PXJ8fFwic3ltYm9sXCIhPXImJlR0LnRlc3QodCkpJiYtMTx0JiYwPT10JTEmJnQ8ZX1mdW5jdGlvbiB1dCh0LGUpe2lmKEtlKHQpKXJldHVybiBmYWxzZTt2YXIgcj10eXBlb2YgdDtyZXR1cm4hKFwibnVtYmVyXCIhPXImJlwic3ltYm9sXCIhPXImJlwiYm9vbGVhblwiIT1yJiZudWxsIT10JiYhd3QodCkpfHwoJHQudGVzdCh0KXx8IVB0LnRlc3QodCl8fG51bGwhPWUmJnQgaW4gT2JqZWN0KGUpKX1mdW5jdGlvbiBhdCh0KXt2YXIgZT10JiZ0LmNvbnN0cnVjdG9yO3JldHVybiB0PT09KHR5cGVvZiBlPT1cImZ1bmN0aW9uXCImJmUucHJvdG90eXBlfHxuZSk7XG59ZnVuY3Rpb24gaXQodCxlKXtyZXR1cm4gZnVuY3Rpb24ocil7cmV0dXJuIG51bGwhPXImJihyW3RdPT09ZSYmKGUhPT1CdHx8dCBpbiBPYmplY3QocikpKX19ZnVuY3Rpb24gZnQoZSxyLG4pe3JldHVybiByPVNlKHI9PT1CdD9lLmxlbmd0aC0xOnIsMCksZnVuY3Rpb24oKXtmb3IodmFyIG89YXJndW1lbnRzLGM9LTEsdT1TZShvLmxlbmd0aC1yLDApLGE9QXJyYXkodSk7KytjPHU7KWFbY109b1tyK2NdO2ZvcihjPS0xLHU9QXJyYXkocisxKTsrK2M8cjspdVtjXT1vW2NdO3JldHVybiB1W3JdPW4oYSksdChlLHRoaXMsdSl9fWZ1bmN0aW9uIGx0KHQpe2lmKHR5cGVvZiB0PT1cInN0cmluZ1wifHx3dCh0KSlyZXR1cm4gdDt2YXIgZT10K1wiXCI7cmV0dXJuXCIwXCI9PWUmJjEvdD09LUR0P1wiLTBcIjplfWZ1bmN0aW9uIHN0KHQpe2lmKG51bGwhPXQpe3RyeXtyZXR1cm4gY2UuY2FsbCh0KX1jYXRjaCh0KXt9cmV0dXJuIHQrXCJcIn1yZXR1cm5cIlwifWZ1bmN0aW9uIGJ0KHQpe3JldHVybihudWxsPT10PzA6dC5sZW5ndGgpP08odCwxKTpbXTtcbn1mdW5jdGlvbiBodCh0KXt2YXIgZT1udWxsPT10PzA6dC5sZW5ndGg7cmV0dXJuIGU/dFtlLTFdOkJ0fWZ1bmN0aW9uIHB0KHQsZSl7ZnVuY3Rpb24gcigpe3ZhciBuPWFyZ3VtZW50cyxvPWU/ZS5hcHBseSh0aGlzLG4pOm5bMF0sYz1yLmNhY2hlO3JldHVybiBjLmhhcyhvKT9jLmdldChvKToobj10LmFwcGx5KHRoaXMsbiksci5jYWNoZT1jLnNldChvLG4pfHxjLG4pfWlmKHR5cGVvZiB0IT1cImZ1bmN0aW9uXCJ8fG51bGwhPWUmJnR5cGVvZiBlIT1cImZ1bmN0aW9uXCIpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkV4cGVjdGVkIGEgZnVuY3Rpb25cIik7cmV0dXJuIHIuY2FjaGU9bmV3KHB0LkNhY2hlfHxwKSxyfWZ1bmN0aW9uIHl0KHQsZSl7cmV0dXJuIHQ9PT1lfHx0IT09dCYmZSE9PWV9ZnVuY3Rpb24ganQodCl7cmV0dXJuIG51bGwhPXQmJmd0KHQubGVuZ3RoKSYmIV90KHQpfWZ1bmN0aW9uIF90KHQpe3JldHVybiEhdnQodCkmJih0PWsodCksXCJbb2JqZWN0IEZ1bmN0aW9uXVwiPT10fHxcIltvYmplY3QgR2VuZXJhdG9yRnVuY3Rpb25dXCI9PXR8fFwiW29iamVjdCBBc3luY0Z1bmN0aW9uXVwiPT10fHxcIltvYmplY3QgUHJveHldXCI9PXQpO1xufWZ1bmN0aW9uIGd0KHQpe3JldHVybiB0eXBlb2YgdD09XCJudW1iZXJcIiYmLTE8dCYmMD09dCUxJiY5MDA3MTk5MjU0NzQwOTkxPj10fWZ1bmN0aW9uIHZ0KHQpe3ZhciBlPXR5cGVvZiB0O3JldHVybiBudWxsIT10JiYoXCJvYmplY3RcIj09ZXx8XCJmdW5jdGlvblwiPT1lKX1mdW5jdGlvbiBkdCh0KXtyZXR1cm4gbnVsbCE9dCYmdHlwZW9mIHQ9PVwib2JqZWN0XCJ9ZnVuY3Rpb24gQXQodCl7cmV0dXJuISghZHQodCl8fFwiW29iamVjdCBPYmplY3RdXCIhPWsodCkpJiYodD15ZSh0KSxudWxsPT09dHx8KHQ9dWUuY2FsbCh0LFwiY29uc3RydWN0b3JcIikmJnQuY29uc3RydWN0b3IsdHlwZW9mIHQ9PVwiZnVuY3Rpb25cIiYmdCBpbnN0YW5jZW9mIHQmJmNlLmNhbGwodCk9PWZlKSl9ZnVuY3Rpb24gd3QodCl7cmV0dXJuIHR5cGVvZiB0PT1cInN5bWJvbFwifHxkdCh0KSYmXCJbb2JqZWN0IFN5bWJvbF1cIj09ayh0KX1mdW5jdGlvbiBtdCh0KXtyZXR1cm4gbnVsbD09dD9cIlwiOkwodCl9ZnVuY3Rpb24gT3QodCxlLHIpe1xucmV0dXJuIHQ9bnVsbD09dD9CdDpTKHQsZSksdD09PUJ0P3I6dH1mdW5jdGlvbiBTdCh0LGUpe3ZhciByO2lmKHI9bnVsbCE9dCl7cj10O3ZhciBuO249VihlLHIpO2Zvcih2YXIgbz0tMSxjPW4ubGVuZ3RoLHU9ZmFsc2U7KytvPGM7KXt2YXIgYT1sdChuW29dKTtpZighKHU9bnVsbCE9ciYmbnVsbCE9ciYmYSBpbiBPYmplY3QocikpKWJyZWFrO3I9clthXX11fHwrK28hPWM/cj11OihjPW51bGw9PXI/MDpyLmxlbmd0aCxyPSEhYyYmZ3QoYykmJmN0KGEsYykmJihLZShyKXx8SmUocikpKX1yZXR1cm4gcn1mdW5jdGlvbiB6dCh0KXtpZihqdCh0KSl0PV8odCk7ZWxzZSBpZihhdCh0KSl7dmFyIGUscj1bXTtmb3IoZSBpbiBPYmplY3QodCkpdWUuY2FsbCh0LGUpJiZcImNvbnN0cnVjdG9yXCIhPWUmJnIucHVzaChlKTt0PXJ9ZWxzZSB0PU9lKHQpO3JldHVybiB0fWZ1bmN0aW9uIGt0KHQpe2lmKGp0KHQpKXQ9Xyh0LHRydWUpO2Vsc2UgaWYodnQodCkpe3ZhciBlLHI9YXQodCksbj1bXTtmb3IoZSBpbiB0KShcImNvbnN0cnVjdG9yXCIhPWV8fCFyJiZ1ZS5jYWxsKHQsZSkpJiZuLnB1c2goZSk7XG50PW59ZWxzZXtpZihlPVtdLG51bGwhPXQpZm9yKHIgaW4gT2JqZWN0KHQpKWUucHVzaChyKTt0PWV9cmV0dXJuIHR9ZnVuY3Rpb24geHQodCl7cmV0dXJuIGZ1bmN0aW9uKCl7cmV0dXJuIHR9fWZ1bmN0aW9uIEV0KHQpe3JldHVybiB0fWZ1bmN0aW9uIEZ0KHQpe3JldHVybiBCKHR5cGVvZiB0PT1cImZ1bmN0aW9uXCI/dDptKHQsMSkpfWZ1bmN0aW9uIEl0KHQpe3JldHVybiB1dCh0KT91KGx0KHQpKTokKHQpfWZ1bmN0aW9uIE10KCl7cmV0dXJuW119ZnVuY3Rpb24gVXQoKXtyZXR1cm4gZmFsc2V9dmFyIEJ0LER0PTEvMCxQdD0vXFwufFxcWyg/OlteW1xcXV0qfChbXCInXSkoPzooPyFcXDEpW15cXFxcXXxcXFxcLikqP1xcMSlcXF0vLCR0PS9eXFx3KiQvLEx0PS9bXi5bXFxdXSt8XFxbKD86KC0/XFxkKyg/OlxcLlxcZCspPyl8KFtcIiddKSgoPzooPyFcXDIpW15cXFxcXXxcXFxcLikqPylcXDIpXFxdfCg/PSg/OlxcLnxcXFtcXF0pKD86XFwufFxcW1xcXXwkKSkvZyxDdD0vXFxcXChcXFxcKT8vZyxWdD0vXFx3KiQvLFJ0PS9eXFxbb2JqZWN0IC4rP0NvbnN0cnVjdG9yXFxdJC8sVHQ9L14oPzowfFsxLTldXFxkKikkLyxOdD17fTtcbk50W1wiW29iamVjdCBGbG9hdDMyQXJyYXldXCJdPU50W1wiW29iamVjdCBGbG9hdDY0QXJyYXldXCJdPU50W1wiW29iamVjdCBJbnQ4QXJyYXldXCJdPU50W1wiW29iamVjdCBJbnQxNkFycmF5XVwiXT1OdFtcIltvYmplY3QgSW50MzJBcnJheV1cIl09TnRbXCJbb2JqZWN0IFVpbnQ4QXJyYXldXCJdPU50W1wiW29iamVjdCBVaW50OENsYW1wZWRBcnJheV1cIl09TnRbXCJbb2JqZWN0IFVpbnQxNkFycmF5XVwiXT1OdFtcIltvYmplY3QgVWludDMyQXJyYXldXCJdPXRydWUsTnRbXCJbb2JqZWN0IEFyZ3VtZW50c11cIl09TnRbXCJbb2JqZWN0IEFycmF5XVwiXT1OdFtcIltvYmplY3QgQXJyYXlCdWZmZXJdXCJdPU50W1wiW29iamVjdCBCb29sZWFuXVwiXT1OdFtcIltvYmplY3QgRGF0YVZpZXddXCJdPU50W1wiW29iamVjdCBEYXRlXVwiXT1OdFtcIltvYmplY3QgRXJyb3JdXCJdPU50W1wiW29iamVjdCBGdW5jdGlvbl1cIl09TnRbXCJbb2JqZWN0IE1hcF1cIl09TnRbXCJbb2JqZWN0IE51bWJlcl1cIl09TnRbXCJbb2JqZWN0IE9iamVjdF1cIl09TnRbXCJbb2JqZWN0IFJlZ0V4cF1cIl09TnRbXCJbb2JqZWN0IFNldF1cIl09TnRbXCJbb2JqZWN0IFN0cmluZ11cIl09TnRbXCJbb2JqZWN0IFdlYWtNYXBdXCJdPWZhbHNlO1xudmFyIFd0PXt9O1d0W1wiW29iamVjdCBBcmd1bWVudHNdXCJdPVd0W1wiW29iamVjdCBBcnJheV1cIl09V3RbXCJbb2JqZWN0IEFycmF5QnVmZmVyXVwiXT1XdFtcIltvYmplY3QgRGF0YVZpZXddXCJdPVd0W1wiW29iamVjdCBCb29sZWFuXVwiXT1XdFtcIltvYmplY3QgRGF0ZV1cIl09V3RbXCJbb2JqZWN0IEZsb2F0MzJBcnJheV1cIl09V3RbXCJbb2JqZWN0IEZsb2F0NjRBcnJheV1cIl09V3RbXCJbb2JqZWN0IEludDhBcnJheV1cIl09V3RbXCJbb2JqZWN0IEludDE2QXJyYXldXCJdPVd0W1wiW29iamVjdCBJbnQzMkFycmF5XVwiXT1XdFtcIltvYmplY3QgTWFwXVwiXT1XdFtcIltvYmplY3QgTnVtYmVyXVwiXT1XdFtcIltvYmplY3QgT2JqZWN0XVwiXT1XdFtcIltvYmplY3QgUmVnRXhwXVwiXT1XdFtcIltvYmplY3QgU2V0XVwiXT1XdFtcIltvYmplY3QgU3RyaW5nXVwiXT1XdFtcIltvYmplY3QgU3ltYm9sXVwiXT1XdFtcIltvYmplY3QgVWludDhBcnJheV1cIl09V3RbXCJbb2JqZWN0IFVpbnQ4Q2xhbXBlZEFycmF5XVwiXT1XdFtcIltvYmplY3QgVWludDE2QXJyYXldXCJdPVd0W1wiW29iamVjdCBVaW50MzJBcnJheV1cIl09dHJ1ZSxcbld0W1wiW29iamVjdCBFcnJvcl1cIl09V3RbXCJbb2JqZWN0IEZ1bmN0aW9uXVwiXT1XdFtcIltvYmplY3QgV2Vha01hcF1cIl09ZmFsc2U7dmFyIEd0LHF0PXR5cGVvZiBnbG9iYWw9PVwib2JqZWN0XCImJmdsb2JhbCYmZ2xvYmFsLk9iamVjdD09PU9iamVjdCYmZ2xvYmFsLEh0PXR5cGVvZiBzZWxmPT1cIm9iamVjdFwiJiZzZWxmJiZzZWxmLk9iamVjdD09PU9iamVjdCYmc2VsZixKdD1xdHx8SHR8fEZ1bmN0aW9uKFwicmV0dXJuIHRoaXNcIikoKSxLdD10eXBlb2YgZXhwb3J0cz09XCJvYmplY3RcIiYmZXhwb3J0cyYmIWV4cG9ydHMubm9kZVR5cGUmJmV4cG9ydHMsUXQ9S3QmJnR5cGVvZiBtb2R1bGU9PVwib2JqZWN0XCImJm1vZHVsZSYmIW1vZHVsZS5ub2RlVHlwZSYmbW9kdWxlLFh0PVF0JiZRdC5leHBvcnRzPT09S3QsWXQ9WHQmJnF0LnByb2Nlc3M7dDp7dHJ5e0d0PVl0JiZZdC5iaW5kaW5nJiZZdC5iaW5kaW5nKFwidXRpbFwiKTticmVhayB0fWNhdGNoKHQpe31HdD12b2lkIDB9dmFyIFp0PUd0JiZHdC5pc01hcCx0ZT1HdCYmR3QuaXNTZXQsZWU9R3QmJkd0LmlzVHlwZWRBcnJheSxyZT1BcnJheS5wcm90b3R5cGUsbmU9T2JqZWN0LnByb3RvdHlwZSxvZT1KdFtcIl9fY29yZS1qc19zaGFyZWRfX1wiXSxjZT1GdW5jdGlvbi5wcm90b3R5cGUudG9TdHJpbmcsdWU9bmUuaGFzT3duUHJvcGVydHksYWU9ZnVuY3Rpb24oKXtcbnZhciB0PS9bXi5dKyQvLmV4ZWMob2UmJm9lLmtleXMmJm9lLmtleXMuSUVfUFJPVE98fFwiXCIpO3JldHVybiB0P1wiU3ltYm9sKHNyYylfMS5cIit0OlwiXCJ9KCksaWU9bmUudG9TdHJpbmcsZmU9Y2UuY2FsbChPYmplY3QpLGxlPVJlZ0V4cChcIl5cIitjZS5jYWxsKHVlKS5yZXBsYWNlKC9bXFxcXF4kLiorPygpW1xcXXt9fF0vZyxcIlxcXFwkJlwiKS5yZXBsYWNlKC9oYXNPd25Qcm9wZXJ0eXwoZnVuY3Rpb24pLio/KD89XFxcXFxcKCl8IGZvciAuKz8oPz1cXFxcXFxdKS9nLFwiJDEuKj9cIikrXCIkXCIpLHNlPVh0P0p0LkJ1ZmZlcjpCdCxiZT1KdC5TeW1ib2wsaGU9SnQuVWludDhBcnJheSxwZT1zZT9zZS5hOkJ0LHllPWYoT2JqZWN0LmdldFByb3RvdHlwZU9mKSxqZT1PYmplY3QuY3JlYXRlLF9lPW5lLnByb3BlcnR5SXNFbnVtZXJhYmxlLGdlPXJlLnNwbGljZSx2ZT1iZT9iZS5pc0NvbmNhdFNwcmVhZGFibGU6QnQsZGU9YmU/YmUudG9TdHJpbmdUYWc6QnQsQWU9ZnVuY3Rpb24oKXt0cnl7dmFyIHQ9ZXQoT2JqZWN0LFwiZGVmaW5lUHJvcGVydHlcIik7XG5yZXR1cm4gdCh7fSxcIlwiLHt9KSx0fWNhdGNoKHQpe319KCksd2U9T2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyxtZT1zZT9zZS5pc0J1ZmZlcjpCdCxPZT1mKE9iamVjdC5rZXlzKSxTZT1NYXRoLm1heCx6ZT1EYXRlLm5vdyxrZT1ldChKdCxcIkRhdGFWaWV3XCIpLHhlPWV0KEp0LFwiTWFwXCIpLEVlPWV0KEp0LFwiUHJvbWlzZVwiKSxGZT1ldChKdCxcIlNldFwiKSxJZT1ldChKdCxcIldlYWtNYXBcIiksTWU9ZXQoT2JqZWN0LFwiY3JlYXRlXCIpLFVlPXN0KGtlKSxCZT1zdCh4ZSksRGU9c3QoRWUpLFBlPXN0KEZlKSwkZT1zdChJZSksTGU9YmU/YmUucHJvdG90eXBlOkJ0LENlPUxlP0xlLnZhbHVlT2Y6QnQsVmU9TGU/TGUudG9TdHJpbmc6QnQsUmU9ZnVuY3Rpb24oKXtmdW5jdGlvbiB0KCl7fXJldHVybiBmdW5jdGlvbihlKXtyZXR1cm4gdnQoZSk/amU/amUoZSk6KHQucHJvdG90eXBlPWUsZT1uZXcgdCx0LnByb3RvdHlwZT1CdCxlKTp7fX19KCk7Yi5wcm90b3R5cGUuY2xlYXI9ZnVuY3Rpb24oKXtcbnRoaXMuX19kYXRhX189TWU/TWUobnVsbCk6e30sdGhpcy5zaXplPTB9LGIucHJvdG90eXBlLmRlbGV0ZT1mdW5jdGlvbih0KXtyZXR1cm4gdD10aGlzLmhhcyh0KSYmZGVsZXRlIHRoaXMuX19kYXRhX19bdF0sdGhpcy5zaXplLT10PzE6MCx0fSxiLnByb3RvdHlwZS5nZXQ9ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5fX2RhdGFfXztyZXR1cm4gTWU/KHQ9ZVt0XSxcIl9fbG9kYXNoX2hhc2hfdW5kZWZpbmVkX19cIj09PXQ/QnQ6dCk6dWUuY2FsbChlLHQpP2VbdF06QnR9LGIucHJvdG90eXBlLmhhcz1mdW5jdGlvbih0KXt2YXIgZT10aGlzLl9fZGF0YV9fO3JldHVybiBNZT9lW3RdIT09QnQ6dWUuY2FsbChlLHQpfSxiLnByb3RvdHlwZS5zZXQ9ZnVuY3Rpb24odCxlKXt2YXIgcj10aGlzLl9fZGF0YV9fO3JldHVybiB0aGlzLnNpemUrPXRoaXMuaGFzKHQpPzA6MSxyW3RdPU1lJiZlPT09QnQ/XCJfX2xvZGFzaF9oYXNoX3VuZGVmaW5lZF9fXCI6ZSx0aGlzfSxoLnByb3RvdHlwZS5jbGVhcj1mdW5jdGlvbigpe1xudGhpcy5fX2RhdGFfXz1bXSx0aGlzLnNpemU9MH0saC5wcm90b3R5cGUuZGVsZXRlPWZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuX19kYXRhX187cmV0dXJuIHQ9dihlLHQpLCEoMD50KSYmKHQ9PWUubGVuZ3RoLTE/ZS5wb3AoKTpnZS5jYWxsKGUsdCwxKSwtLXRoaXMuc2l6ZSx0cnVlKX0saC5wcm90b3R5cGUuZ2V0PWZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuX19kYXRhX187cmV0dXJuIHQ9dihlLHQpLDA+dD9CdDplW3RdWzFdfSxoLnByb3RvdHlwZS5oYXM9ZnVuY3Rpb24odCl7cmV0dXJuLTE8dih0aGlzLl9fZGF0YV9fLHQpfSxoLnByb3RvdHlwZS5zZXQ9ZnVuY3Rpb24odCxlKXt2YXIgcj10aGlzLl9fZGF0YV9fLG49dihyLHQpO3JldHVybiAwPm4/KCsrdGhpcy5zaXplLHIucHVzaChbdCxlXSkpOnJbbl1bMV09ZSx0aGlzfSxwLnByb3RvdHlwZS5jbGVhcj1mdW5jdGlvbigpe3RoaXMuc2l6ZT0wLHRoaXMuX19kYXRhX189e2hhc2g6bmV3IGIsbWFwOm5ldyh4ZXx8aCksc3RyaW5nOm5ldyBiXG59fSxwLnByb3RvdHlwZS5kZWxldGU9ZnVuY3Rpb24odCl7cmV0dXJuIHQ9Wih0aGlzLHQpLmRlbGV0ZSh0KSx0aGlzLnNpemUtPXQ/MTowLHR9LHAucHJvdG90eXBlLmdldD1mdW5jdGlvbih0KXtyZXR1cm4gWih0aGlzLHQpLmdldCh0KX0scC5wcm90b3R5cGUuaGFzPWZ1bmN0aW9uKHQpe3JldHVybiBaKHRoaXMsdCkuaGFzKHQpfSxwLnByb3RvdHlwZS5zZXQ9ZnVuY3Rpb24odCxlKXt2YXIgcj1aKHRoaXMsdCksbj1yLnNpemU7cmV0dXJuIHIuc2V0KHQsZSksdGhpcy5zaXplKz1yLnNpemU9PW4/MDoxLHRoaXN9LHkucHJvdG90eXBlLmFkZD15LnByb3RvdHlwZS5wdXNoPWZ1bmN0aW9uKHQpe3JldHVybiB0aGlzLl9fZGF0YV9fLnNldCh0LFwiX19sb2Rhc2hfaGFzaF91bmRlZmluZWRfX1wiKSx0aGlzfSx5LnByb3RvdHlwZS5oYXM9ZnVuY3Rpb24odCl7cmV0dXJuIHRoaXMuX19kYXRhX18uaGFzKHQpfSxqLnByb3RvdHlwZS5jbGVhcj1mdW5jdGlvbigpe3RoaXMuX19kYXRhX189bmV3IGgsXG50aGlzLnNpemU9MH0sai5wcm90b3R5cGUuZGVsZXRlPWZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuX19kYXRhX187cmV0dXJuIHQ9ZS5kZWxldGUodCksdGhpcy5zaXplPWUuc2l6ZSx0fSxqLnByb3RvdHlwZS5nZXQ9ZnVuY3Rpb24odCl7cmV0dXJuIHRoaXMuX19kYXRhX18uZ2V0KHQpfSxqLnByb3RvdHlwZS5oYXM9ZnVuY3Rpb24odCl7cmV0dXJuIHRoaXMuX19kYXRhX18uaGFzKHQpfSxqLnByb3RvdHlwZS5zZXQ9ZnVuY3Rpb24odCxlKXt2YXIgcj10aGlzLl9fZGF0YV9fO2lmKHIgaW5zdGFuY2VvZiBoKXt2YXIgbj1yLl9fZGF0YV9fO2lmKCF4ZXx8MTk5Pm4ubGVuZ3RoKXJldHVybiBuLnB1c2goW3QsZV0pLHRoaXMuc2l6ZT0rK3Iuc2l6ZSx0aGlzO3I9dGhpcy5fX2RhdGFfXz1uZXcgcChuKX1yZXR1cm4gci5zZXQodCxlKSx0aGlzLnNpemU9ci5zaXplLHRoaXN9O3ZhciBUZT1BZT9mdW5jdGlvbih0LGUpe3JldHVybiBBZSh0LFwidG9TdHJpbmdcIix7Y29uZmlndXJhYmxlOnRydWUsXG5lbnVtZXJhYmxlOmZhbHNlLHZhbHVlOnh0KGUpLHdyaXRhYmxlOnRydWV9KX06RXQsTmU9d2U/ZnVuY3Rpb24odCl7cmV0dXJuIG51bGw9PXQ/W106KHQ9T2JqZWN0KHQpLHIod2UodCksZnVuY3Rpb24oZSl7cmV0dXJuIF9lLmNhbGwodCxlKX0pKX06TXQsV2U9d2U/ZnVuY3Rpb24odCl7Zm9yKHZhciBlPVtdO3Q7KW8oZSxOZSh0KSksdD15ZSh0KTtyZXR1cm4gZX06TXQsR2U9azsoa2UmJlwiW29iamVjdCBEYXRhVmlld11cIiE9R2UobmV3IGtlKG5ldyBBcnJheUJ1ZmZlcigxKSkpfHx4ZSYmXCJbb2JqZWN0IE1hcF1cIiE9R2UobmV3IHhlKXx8RWUmJlwiW29iamVjdCBQcm9taXNlXVwiIT1HZShFZS5yZXNvbHZlKCkpfHxGZSYmXCJbb2JqZWN0IFNldF1cIiE9R2UobmV3IEZlKXx8SWUmJlwiW29iamVjdCBXZWFrTWFwXVwiIT1HZShuZXcgSWUpKSYmKEdlPWZ1bmN0aW9uKHQpe3ZhciBlPWsodCk7aWYodD0odD1cIltvYmplY3QgT2JqZWN0XVwiPT1lP3QuY29uc3RydWN0b3I6QnQpP3N0KHQpOlwiXCIpc3dpdGNoKHQpe1xuY2FzZSBVZTpyZXR1cm5cIltvYmplY3QgRGF0YVZpZXddXCI7Y2FzZSBCZTpyZXR1cm5cIltvYmplY3QgTWFwXVwiO2Nhc2UgRGU6cmV0dXJuXCJbb2JqZWN0IFByb21pc2VdXCI7Y2FzZSBQZTpyZXR1cm5cIltvYmplY3QgU2V0XVwiO2Nhc2UgJGU6cmV0dXJuXCJbb2JqZWN0IFdlYWtNYXBdXCJ9cmV0dXJuIGV9KTt2YXIgcWU9ZnVuY3Rpb24odCl7dmFyIGU9MCxyPTA7cmV0dXJuIGZ1bmN0aW9uKCl7dmFyIG49emUoKSxvPTE2LShuLXIpO2lmKHI9biwwPG8pe2lmKDgwMDw9KytlKXJldHVybiBhcmd1bWVudHNbMF19ZWxzZSBlPTA7cmV0dXJuIHQuYXBwbHkoQnQsYXJndW1lbnRzKX19KFRlKSxIZT1mdW5jdGlvbih0KXt0PXB0KHQsZnVuY3Rpb24odCl7cmV0dXJuIDUwMD09PWUuc2l6ZSYmZS5jbGVhcigpLHR9KTt2YXIgZT10LmNhY2hlO3JldHVybiB0fShmdW5jdGlvbih0KXt2YXIgZT1bXTtyZXR1cm4gNDY9PT10LmNoYXJDb2RlQXQoMCkmJmUucHVzaChcIlwiKSx0LnJlcGxhY2UoTHQsZnVuY3Rpb24odCxyLG4sbyl7XG5lLnB1c2gobj9vLnJlcGxhY2UoQ3QsXCIkMVwiKTpyfHx0KX0pLGV9KTtwdC5DYWNoZT1wO3ZhciBKZT14KGZ1bmN0aW9uKCl7cmV0dXJuIGFyZ3VtZW50c30oKSk/eDpmdW5jdGlvbih0KXtyZXR1cm4gZHQodCkmJnVlLmNhbGwodCxcImNhbGxlZVwiKSYmIV9lLmNhbGwodCxcImNhbGxlZVwiKX0sS2U9QXJyYXkuaXNBcnJheSxRZT1tZXx8VXQsWGU9WnQ/YShadCk6RixZZT10ZT9hKHRlKTpNLFplPWVlP2EoZWUpOlUsdHI9ZnVuY3Rpb24odCxlKXtyZXR1cm4gcWUoZnQodCxlLEV0KSx0K1wiXCIpfShmdW5jdGlvbih0LGUpe3Q9T2JqZWN0KHQpO3ZhciByLG49LTEsbz1lLmxlbmd0aCxjPTI8bz9lWzJdOkJ0O2lmKHI9Yyl7cj1lWzBdO3ZhciB1PWVbMV07aWYodnQoYykpe3ZhciBhPXR5cGVvZiB1O3I9ISEoXCJudW1iZXJcIj09YT9qdChjKSYmY3QodSxjLmxlbmd0aCk6XCJzdHJpbmdcIj09YSYmdSBpbiBjKSYmeXQoY1t1XSxyKX1lbHNlIHI9ZmFsc2V9Zm9yKHImJihvPTEpOysrbjxvOylmb3IoYz1lW25dLFxucj1rdChjKSx1PS0xLGE9ci5sZW5ndGg7Kyt1PGE7KXt2YXIgaT1yW3VdLGY9dFtpXTsoZj09PUJ0fHx5dChmLG5lW2ldKSYmIXVlLmNhbGwodCxpKSkmJih0W2ldPWNbaV0pfXJldHVybiB0fSksZXI9ZnVuY3Rpb24odCl7cmV0dXJuIHFlKGZ0KHQsQnQsYnQpLHQrXCJcIil9KGZ1bmN0aW9uKHQsZSl7dmFyIHI9e307aWYobnVsbD09dClyZXR1cm4gcjt2YXIgbz1mYWxzZTtlPW4oZSxmdW5jdGlvbihlKXtyZXR1cm4gZT1WKGUsdCksb3x8KG89MTxlLmxlbmd0aCksZX0pLFcodCxYKHQpLHIpLG8mJihyPW0ociw3LEgpKTtmb3IodmFyIGM9ZS5sZW5ndGg7Yy0tOylDKHIsZVtjXSk7cmV0dXJuIHJ9KTtzLmNvbnN0YW50PXh0LHMuZGVmYXVsdHM9dHIscy5mbGF0dGVuPWJ0LHMuaXRlcmF0ZWU9RnQscy5rZXlzPXp0LHMua2V5c0luPWt0LHMubWVtb2l6ZT1wdCxzLm9taXQ9ZXIscy5wcm9wZXJ0eT1JdCxzLnJlbW92ZT1mdW5jdGlvbih0LGUpe3ZhciByPVtdO2lmKCF0fHwhdC5sZW5ndGgpcmV0dXJuIHI7XG52YXIgbj0tMSxvPVtdLGM9dC5sZW5ndGg7Zm9yKGU9WShlLDMpOysrbjxjOyl7dmFyIHU9dFtuXTtlKHUsbix0KSYmKHIucHVzaCh1KSxvLnB1c2gobikpfWZvcihuPXQ/by5sZW5ndGg6MCxjPW4tMTtuLS07KWlmKHU9b1tuXSxuPT1jfHx1IT09YSl7dmFyIGE9dTtjdCh1KT9nZS5jYWxsKHQsdSwxKTpDKHQsdSl9cmV0dXJuIHJ9LHMuZXE9eXQscy5nZXQ9T3Qscy5oYXNJbj1TdCxzLmlkZW50aXR5PUV0LHMuaXNBcmd1bWVudHM9SmUscy5pc0FycmF5PUtlLHMuaXNBcnJheUxpa2U9anQscy5pc0J1ZmZlcj1RZSxzLmlzRnVuY3Rpb249X3Qscy5pc0xlbmd0aD1ndCxzLmlzTWFwPVhlLHMuaXNPYmplY3Q9dnQscy5pc09iamVjdExpa2U9ZHQscy5pc1BsYWluT2JqZWN0PUF0LHMuaXNTZXQ9WWUscy5pc1N5bWJvbD13dCxzLmlzVHlwZWRBcnJheT1aZSxzLmxhc3Q9aHQscy5zdHViQXJyYXk9TXQscy5zdHViRmFsc2U9VXQscy50b1N0cmluZz1tdCxzLlZFUlNJT049XCI0LjE3LjVcIixRdCYmKChRdC5leHBvcnRzPXMpLl89cyxcbkt0Ll89cyl9KS5jYWxsKHRoaXMpOyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdGlmKF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0pIHtcblx0XHRyZXR1cm4gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdGlkOiBtb2R1bGVJZCxcblx0XHRsb2FkZWQ6IGZhbHNlLFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcblx0bW9kdWxlLmxvYWRlZCA9IHRydWU7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHQoKSA9PiBtb2R1bGVbJ2RlZmF1bHQnXSA6XG5cdFx0KCkgPT4gbW9kdWxlO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5nID0gKGZ1bmN0aW9uKCkge1xuXHRpZiAodHlwZW9mIGdsb2JhbFRoaXMgPT09ICdvYmplY3QnKSByZXR1cm4gZ2xvYmFsVGhpcztcblx0dHJ5IHtcblx0XHRyZXR1cm4gdGhpcyB8fCBuZXcgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JykgcmV0dXJuIHdpbmRvdztcblx0fVxufSkoKTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLmhtZCA9IChtb2R1bGUpID0+IHtcblx0bW9kdWxlID0gT2JqZWN0LmNyZWF0ZShtb2R1bGUpO1xuXHRpZiAoIW1vZHVsZS5jaGlsZHJlbikgbW9kdWxlLmNoaWxkcmVuID0gW107XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShtb2R1bGUsICdleHBvcnRzJywge1xuXHRcdGVudW1lcmFibGU6IHRydWUsXG5cdFx0c2V0OiAoKSA9PiB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0VTIE1vZHVsZXMgbWF5IG5vdCBhc3NpZ24gbW9kdWxlLmV4cG9ydHMgb3IgZXhwb3J0cy4qLCBVc2UgRVNNIGV4cG9ydCBzeW50YXgsIGluc3RlYWQ6ICcgKyBtb2R1bGUuaWQpO1xuXHRcdH1cblx0fSk7XG5cdHJldHVybiBtb2R1bGU7XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5ubWQgPSAobW9kdWxlKSA9PiB7XG5cdG1vZHVsZS5wYXRocyA9IFtdO1xuXHRpZiAoIW1vZHVsZS5jaGlsZHJlbikgbW9kdWxlLmNoaWxkcmVuID0gW107XG5cdHJldHVybiBtb2R1bGU7XG59OyIsIi8vIG1vZHVsZSBleHBvcnRzIG11c3QgYmUgcmV0dXJuZWQgZnJvbSBydW50aW1lIHNvIGVudHJ5IGlubGluaW5nIGlzIGRpc2FibGVkXG4vLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbnJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvYWxlcGhiZXQuY29mZmVlXCIpO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==