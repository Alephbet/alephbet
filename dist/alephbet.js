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

/***/ "./node_modules/charenc/charenc.js":
/*!*****************************************!*\
  !*** ./node_modules/charenc/charenc.js ***!
  \*****************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 33:0-14 */
/***/ ((module) => {

var charenc = {
  // UTF-8 encoding
  utf8: {
    // Convert a string to a byte array
    stringToBytes: function(str) {
      return charenc.bin.stringToBytes(unescape(encodeURIComponent(str)));
    },

    // Convert a byte array to a string
    bytesToString: function(bytes) {
      return decodeURIComponent(escape(charenc.bin.bytesToString(bytes)));
    }
  },

  // Binary encoding
  bin: {
    // Convert a string to a byte array
    stringToBytes: function(str) {
      for (var bytes = [], i = 0; i < str.length; i++)
        bytes.push(str.charCodeAt(i) & 0xFF);
      return bytes;
    },

    // Convert a byte array to a string
    bytesToString: function(bytes) {
      for (var str = [], i = 0; i < bytes.length; i++)
        str.push(String.fromCharCode(bytes[i]));
      return str.join('');
    }
  }
};

module.exports = charenc;


/***/ }),

/***/ "./src/adapters.coffee":
/*!*****************************!*\
  !*** ./src/adapters.coffee ***!
  \*****************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: top-level-this-exports, module, __webpack_require__ */
/*! CommonJS bailout: this is used directly at 604:7-11 */
/*! CommonJS bailout: module.exports is used directly at 606:0-14 */
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) {
  function isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  return function () {
    var Super = _getPrototypeOf(Derived),
        result;

    if (isNativeReflectConstruct()) {
      var NewTarget = _getPrototypeOf(this).constructor;

      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }

    return _possibleConstructorReturn(this, result);
  };
}

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

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

  ; //# A parent class Adapter for using the Alephbet backend API.
  //# uses jQuery to send data if `$.ajax` is found. Falls back on plain js xhr
  //# params:
  //# - url: track URL to post events to
  //# - namepsace (optional): allows setting different environments etc
  //# - storage (optional): storage adapter for the queue

  Adapters.AlephbetAdapter = function () {
    var AlephbetAdapter =
    /*#__PURE__*/
    function () {
      function AlephbetAdapter(url) {
        var namespace = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'alephbet';
        var storage = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Adapters.LocalStorageAdapter;

        _classCallCheck(this, AlephbetAdapter);

        this._storage = storage;
        this.url = url;
        this.namespace = namespace;
        this._queue = JSON.parse(this._storage.get(this.queue_name) || '[]');

        this._flush();
      }

      _createClass(AlephbetAdapter, [{
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
          } // for a given user id, namespace, goal and experiment, the uuid will always be the same
          // this avoids counting goals twice for the same user across different devices


          return utils.sha1("".concat(this.namespace, ".").concat(experiment.name, ".").concat(goal.name, ".").concat(experiment.user_id));
        }
      }, {
        key: "_track",
        value: function _track(experiment, variant, goal) {
          utils.log("Persistent Queue track: ".concat(this.namespace, ", ").concat(experiment.name, ", ").concat(variant, ", ").concat(goal.name));

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

      return AlephbetAdapter;
    }();

    ;
    AlephbetAdapter.prototype.queue_name = '_alephbet_queue';
    return AlephbetAdapter;
  }.call(this); //# Adapter for using the lamed backend. See https://github.com/Alephbet/lamed
  //# inherits from AlephbetAdapter which uses the same backend API
  //#


  Adapters.LamedAdapter = function () {
    var LamedAdapter =
    /*#__PURE__*/
    function (_Adapters$AlephbetAda) {
      _inherits(LamedAdapter, _Adapters$AlephbetAda);

      var _super = _createSuper(LamedAdapter);

      function LamedAdapter() {
        _classCallCheck(this, LamedAdapter);

        return _super.apply(this, arguments);
      }

      return LamedAdapter;
    }(Adapters.AlephbetAdapter);

    ;
    LamedAdapter.prototype.queue_name = '_lamed_queue';
    return LamedAdapter;
  }.call(this); //# Adapter for using the gimel backend. See https://github.com/Alephbet/gimel
  //# The main difference is the user_uuid generation (for backwards compatibility)
  //# params:
  //# - url: Gimel track URL to post events to
  //# - namepsace: namespace for Gimel (allows setting different environments etc)
  //# - storage (optional) - storage adapter for the queue


  Adapters.GimelAdapter = function () {
    var GimelAdapter =
    /*#__PURE__*/
    function (_Adapters$AlephbetAda2) {
      _inherits(GimelAdapter, _Adapters$AlephbetAda2);

      var _super2 = _createSuper(GimelAdapter);

      function GimelAdapter() {
        _classCallCheck(this, GimelAdapter);

        return _super2.apply(this, arguments);
      }

      _createClass(GimelAdapter, [{
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
      }]);

      return GimelAdapter;
    }(Adapters.AlephbetAdapter);

    ;
    GimelAdapter.prototype.queue_name = '_lamed_queue';
    return GimelAdapter;
  }.call(this); //# Adapter for using the lamed backend. See https://github.com/Alephbet/lamed
  //# inherits from AlephbetAdapter which uses the same backend API
  //#


  Adapters.RailsAdapter = function () {
    var RailsAdapter =
    /*#__PURE__*/
    function (_Adapters$AlephbetAda3) {
      _inherits(RailsAdapter, _Adapters$AlephbetAda3);

      var _super3 = _createSuper(RailsAdapter);

      function RailsAdapter() {
        _classCallCheck(this, RailsAdapter);

        return _super3.apply(this, arguments);
      }

      return RailsAdapter;
    }(Adapters.AlephbetAdapter);

    ;
    RailsAdapter.prototype.queue_name = '_rails_queue';
    return RailsAdapter;
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
          utils.log("Persistent Queue Keen track: ".concat(experiment.name, ", ").concat(variant, ", ").concat(goal.name));

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
/*! CommonJS bailout: this is used directly at 333:7-11 */
/*! CommonJS bailout: module.exports is used directly at 335:0-14 */
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
  AlephBet.LamedAdapter = adapters.LamedAdapter;
  AlephBet.RailsAdapter = adapters.RailsAdapter;
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
/*! runtime requirements: __webpack_require__, module.loaded, module.id, module, __webpack_require__.hmd, __webpack_require__.r, __webpack_exports__, __webpack_require__.* */
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var uuid__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! uuid */ "./node_modules/uuid/dist/esm-browser/v4.js");
/* module decorator */ module = __webpack_require__.hmd(module);
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Utils, options, _sha;


_sha = __webpack_require__(/*! sha1 */ "./node_modules/sha1/sha1.js");
options = __webpack_require__(/*! ./options */ "./src/options.coffee");

Utils = function () {
  var Utils =
  /*#__PURE__*/
  function () {
    function Utils() {
      _classCallCheck(this, Utils);
    }

    _createClass(Utils, null, [{
      key: "defaults",
      value: function defaults(obj, _defaults) {
        var key, value;

        for (key in _defaults) {
          value = _defaults[key];

          if (obj[key] === void 0) {
            obj[key] = value;
          }
        }

        return obj;
      }
    }, {
      key: "remove",
      value: function remove(list, callback) {
        var deletions, el, i, index, len, ref;
        deletions = [];
        ref = _toConsumableArray(list);

        for (index = i = 0, len = ref.length; i < len; index = ++i) {
          el = ref[index];

          if (callback(el, index)) {
            list.splice(list.indexOf(el), 1);
            deletions.push(el);
          }
        }

        return deletions;
      }
    }, {
      key: "omit",
      value: function omit(obj) {
        var i, key, len, ref, results;
        results = _objectSpread({}, obj);

        for (var _len = arguments.length, keys = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          keys[_key - 1] = arguments[_key];
        }

        ref = [].concat.apply([], keys);

        for (i = 0, len = ref.length; i < len; i++) {
          key = ref[i];
          delete results[key];
        }

        return results;
      }
    }, {
      key: "log",
      value: function log(message) {
        if (options.debug) {
          return console.log(message);
        }
      }
    }, {
      key: "sha1",
      value: function sha1(text) {
        return _sha(text).toString();
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
  Utils.keys = Object.keys;
  Utils.uuid = uuid__WEBPACK_IMPORTED_MODULE_0__.default;
  return Utils;
}.call(undefined);

module.exports = Utils;

/***/ }),

/***/ "./node_modules/crypt/crypt.js":
/*!*************************************!*\
  !*** ./node_modules/crypt/crypt.js ***!
  \*************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 95:2-16 */
/***/ ((module) => {

(function() {
  var base64map
      = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',

  crypt = {
    // Bit-wise rotation left
    rotl: function(n, b) {
      return (n << b) | (n >>> (32 - b));
    },

    // Bit-wise rotation right
    rotr: function(n, b) {
      return (n << (32 - b)) | (n >>> b);
    },

    // Swap big-endian to little-endian and vice versa
    endian: function(n) {
      // If number given, swap endian
      if (n.constructor == Number) {
        return crypt.rotl(n, 8) & 0x00FF00FF | crypt.rotl(n, 24) & 0xFF00FF00;
      }

      // Else, assume array and swap all items
      for (var i = 0; i < n.length; i++)
        n[i] = crypt.endian(n[i]);
      return n;
    },

    // Generate an array of any length of random bytes
    randomBytes: function(n) {
      for (var bytes = []; n > 0; n--)
        bytes.push(Math.floor(Math.random() * 256));
      return bytes;
    },

    // Convert a byte array to big-endian 32-bit words
    bytesToWords: function(bytes) {
      for (var words = [], i = 0, b = 0; i < bytes.length; i++, b += 8)
        words[b >>> 5] |= bytes[i] << (24 - b % 32);
      return words;
    },

    // Convert big-endian 32-bit words to a byte array
    wordsToBytes: function(words) {
      for (var bytes = [], b = 0; b < words.length * 32; b += 8)
        bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF);
      return bytes;
    },

    // Convert a byte array to a hex string
    bytesToHex: function(bytes) {
      for (var hex = [], i = 0; i < bytes.length; i++) {
        hex.push((bytes[i] >>> 4).toString(16));
        hex.push((bytes[i] & 0xF).toString(16));
      }
      return hex.join('');
    },

    // Convert a hex string to a byte array
    hexToBytes: function(hex) {
      for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
      return bytes;
    },

    // Convert a byte array to a base-64 string
    bytesToBase64: function(bytes) {
      for (var base64 = [], i = 0; i < bytes.length; i += 3) {
        var triplet = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
        for (var j = 0; j < 4; j++)
          if (i * 8 + j * 6 <= bytes.length * 8)
            base64.push(base64map.charAt((triplet >>> 6 * (3 - j)) & 0x3F));
          else
            base64.push('=');
      }
      return base64.join('');
    },

    // Convert a base-64 string to a byte array
    base64ToBytes: function(base64) {
      // Remove non-base-64 characters
      base64 = base64.replace(/[^A-Z0-9+\/]/ig, '');

      for (var bytes = [], i = 0, imod4 = 0; i < base64.length;
          imod4 = ++i % 4) {
        if (imod4 == 0) continue;
        bytes.push(((base64map.indexOf(base64.charAt(i - 1))
            & (Math.pow(2, -2 * imod4 + 8) - 1)) << (imod4 * 2))
            | (base64map.indexOf(base64.charAt(i)) >>> (6 - imod4 * 2)));
      }
      return bytes;
    }
  };

  module.exports = crypt;
})();


/***/ }),

/***/ "./node_modules/sha1/sha1.js":
/*!***********************************!*\
  !*** ./node_modules/sha1/sha1.js ***!
  \***********************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: __webpack_require__, module */
/*! CommonJS bailout: module.exports is used directly at 81:2-16 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

(function() {
  var crypt = __webpack_require__(/*! crypt */ "./node_modules/crypt/crypt.js"),
      utf8 = __webpack_require__(/*! charenc */ "./node_modules/charenc/charenc.js").utf8,
      bin = __webpack_require__(/*! charenc */ "./node_modules/charenc/charenc.js").bin,

  // The core
  sha1 = function (message) {
    // Convert to byte array
    if (message.constructor == String)
      message = utf8.stringToBytes(message);
    else if (typeof Buffer !== 'undefined' && typeof Buffer.isBuffer == 'function' && Buffer.isBuffer(message))
      message = Array.prototype.slice.call(message, 0);
    else if (!Array.isArray(message))
      message = message.toString();

    // otherwise assume byte array

    var m  = crypt.bytesToWords(message),
        l  = message.length * 8,
        w  = [],
        H0 =  1732584193,
        H1 = -271733879,
        H2 = -1732584194,
        H3 =  271733878,
        H4 = -1009589776;

    // Padding
    m[l >> 5] |= 0x80 << (24 - l % 32);
    m[((l + 64 >>> 9) << 4) + 15] = l;

    for (var i = 0; i < m.length; i += 16) {
      var a = H0,
          b = H1,
          c = H2,
          d = H3,
          e = H4;

      for (var j = 0; j < 80; j++) {

        if (j < 16)
          w[j] = m[i + j];
        else {
          var n = w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16];
          w[j] = (n << 1) | (n >>> 31);
        }

        var t = ((H0 << 5) | (H0 >>> 27)) + H4 + (w[j] >>> 0) + (
                j < 20 ? (H1 & H2 | ~H1 & H3) + 1518500249 :
                j < 40 ? (H1 ^ H2 ^ H3) + 1859775393 :
                j < 60 ? (H1 & H2 | H1 & H3 | H2 & H3) - 1894007588 :
                         (H1 ^ H2 ^ H3) - 899497514);

        H4 = H3;
        H3 = H2;
        H2 = (H1 << 30) | (H1 >>> 2);
        H1 = H0;
        H0 = t;
      }

      H0 += a;
      H1 += b;
      H2 += c;
      H3 += d;
      H4 += e;
    }

    return [H0, H1, H2, H3, H4];
  },

  // Public API
  api = function (message, options) {
    var digestbytes = crypt.wordsToBytes(sha1(message));
    return options && options.asBytes ? digestbytes :
        options && options.asString ? bin.bytesToString(digestbytes) :
        crypt.bytesToHex(digestbytes);
  };

  api._blocksize = 16;
  api._digestsize = 20;

  module.exports = api;
})();


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
/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__("./src/alephbet.coffee");
/******/ })()
;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9BbGVwaEJldC93ZWJwYWNrL3VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24iLCJ3ZWJwYWNrOi8vQWxlcGhCZXQvLi9ub2RlX21vZHVsZXMvYmFzaWwuanMvYnVpbGQvYmFzaWwuanMiLCJ3ZWJwYWNrOi8vQWxlcGhCZXQvLi9ub2RlX21vZHVsZXMvY2hhcmVuYy9jaGFyZW5jLmpzIiwid2VicGFjazovL0FsZXBoQmV0Ly4vc3JjL2FkYXB0ZXJzLmNvZmZlZSIsIndlYnBhY2s6Ly9BbGVwaEJldC8uL3NyYy9hbGVwaGJldC5jb2ZmZWUiLCJ3ZWJwYWNrOi8vQWxlcGhCZXQvLi9zcmMvb3B0aW9ucy5jb2ZmZWUiLCJ3ZWJwYWNrOi8vQWxlcGhCZXQvLi9zcmMvc3RvcmFnZS5jb2ZmZWUiLCJ3ZWJwYWNrOi8vQWxlcGhCZXQvLi9zcmMvdXRpbHMuY29mZmVlIiwid2VicGFjazovL0FsZXBoQmV0Ly4vbm9kZV9tb2R1bGVzL2NyeXB0L2NyeXB0LmpzIiwid2VicGFjazovL0FsZXBoQmV0Ly4vbm9kZV9tb2R1bGVzL3NoYTEvc2hhMS5qcyIsIndlYnBhY2s6Ly9BbGVwaEJldC8uL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvcmVnZXguanMiLCJ3ZWJwYWNrOi8vQWxlcGhCZXQvLi9ub2RlX21vZHVsZXMvdXVpZC9kaXN0L2VzbS1icm93c2VyL3JuZy5qcyIsIndlYnBhY2s6Ly9BbGVwaEJldC8uL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvc3RyaW5naWZ5LmpzIiwid2VicGFjazovL0FsZXBoQmV0Ly4vbm9kZV9tb2R1bGVzL3V1aWQvZGlzdC9lc20tYnJvd3Nlci92NC5qcyIsIndlYnBhY2s6Ly9BbGVwaEJldC8uL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvdmFsaWRhdGUuanMiLCJ3ZWJwYWNrOi8vQWxlcGhCZXQvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vQWxlcGhCZXQvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL0FsZXBoQmV0L3dlYnBhY2svcnVudGltZS9oYXJtb255IG1vZHVsZSBkZWNvcmF0b3IiLCJ3ZWJwYWNrOi8vQWxlcGhCZXQvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9BbGVwaEJldC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL0FsZXBoQmV0L3dlYnBhY2svc3RhcnR1cCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0QsTzs7Ozs7Ozs7Ozs7QUNWQTtBQUNBO0FBQ0E7QUFDQSw4QkFBOEI7QUFDOUI7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQixzQkFBc0I7QUFDeEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsbUJBQW1CLGdCQUFnQjtBQUNuQztBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQSxJQUFJO0FBQ0osR0FBRztBQUNIO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0EsK0ZBQStGLHlCQUF5QixFQUFFO0FBQzFIO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGdCQUFnQixrQkFBa0I7QUFDbEM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFLDBDQUEwQzs7QUFFNUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFD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Ozs7Ozs7Ozs7QUM3QnhCLENBQTJCO0FBQ1k7O0FBRXZDO0FBQ0E7QUFDQSwrQ0FBK0MsNENBQUcsSUFBSTs7QUFFdEQ7QUFDQSxrQ0FBa0M7O0FBRWxDO0FBQ0E7O0FBRUEsbUJBQW1CLFFBQVE7QUFDM0I7QUFDQTs7QUFFQTtBQUNBOztBQUVBLFNBQVMsc0RBQVM7QUFDbEI7O0FBRUEsaUVBQWUsRUFBRSxFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3ZCakIsQ0FBK0I7O0FBRS9CO0FBQ0EscUNBQXFDLG1EQUFVO0FBQy9DOztBQUVBLGlFQUFlLFFBQVEsRTs7Ozs7O1VDTnZCO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDeEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0Esd0NBQXdDLHlDQUF5QztXQUNqRjtXQUNBO1dBQ0EsRTs7Ozs7V0NQQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsRUFBRTtXQUNGO1dBQ0EsRTs7Ozs7V0NWQSxzRjs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSxzREFBc0Qsa0JBQWtCO1dBQ3hFO1dBQ0EsK0NBQStDLGNBQWM7V0FDN0QsRTs7OztVQ05BO1VBQ0E7VUFDQTtVQUNBIiwiZmlsZSI6ImFsZXBoYmV0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoW10sIGZhY3RvcnkpO1xuXHRlbHNlIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jylcblx0XHRleHBvcnRzW1wiQWxlcGhCZXRcIl0gPSBmYWN0b3J5KCk7XG5cdGVsc2Vcblx0XHRyb290W1wiQWxlcGhCZXRcIl0gPSBmYWN0b3J5KCk7XG59KShzZWxmLCBmdW5jdGlvbigpIHtcbnJldHVybiAiLCIoZnVuY3Rpb24gKCkge1xuXHQvLyBCYXNpbFxuXHR2YXIgQmFzaWwgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuXHRcdHJldHVybiBCYXNpbC51dGlscy5leHRlbmQoe30sIEJhc2lsLnBsdWdpbnMsIG5ldyBCYXNpbC5TdG9yYWdlKCkuaW5pdChvcHRpb25zKSk7XG5cdH07XG5cblx0Ly8gVmVyc2lvblxuXHRCYXNpbC52ZXJzaW9uID0gJzAuNC4xMSc7XG5cblx0Ly8gVXRpbHNcblx0QmFzaWwudXRpbHMgPSB7XG5cdFx0ZXh0ZW5kOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHR2YXIgZGVzdGluYXRpb24gPSB0eXBlb2YgYXJndW1lbnRzWzBdID09PSAnb2JqZWN0JyA/IGFyZ3VtZW50c1swXSA6IHt9O1xuXHRcdFx0Zm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKGFyZ3VtZW50c1tpXSAmJiB0eXBlb2YgYXJndW1lbnRzW2ldID09PSAnb2JqZWN0Jylcblx0XHRcdFx0XHRmb3IgKHZhciBwcm9wZXJ0eSBpbiBhcmd1bWVudHNbaV0pXG5cdFx0XHRcdFx0XHRkZXN0aW5hdGlvbltwcm9wZXJ0eV0gPSBhcmd1bWVudHNbaV1bcHJvcGVydHldO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGRlc3RpbmF0aW9uO1xuXHRcdH0sXG5cdFx0ZWFjaDogZnVuY3Rpb24gKG9iaiwgZm5JdGVyYXRvciwgY29udGV4dCkge1xuXHRcdFx0aWYgKHRoaXMuaXNBcnJheShvYmopKSB7XG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgb2JqLmxlbmd0aDsgaSsrKVxuXHRcdFx0XHRcdGlmIChmbkl0ZXJhdG9yLmNhbGwoY29udGV4dCwgb2JqW2ldLCBpKSA9PT0gZmFsc2UpIHJldHVybjtcblx0XHRcdH0gZWxzZSBpZiAob2JqKSB7XG5cdFx0XHRcdGZvciAodmFyIGtleSBpbiBvYmopXG5cdFx0XHRcdFx0aWYgKGZuSXRlcmF0b3IuY2FsbChjb250ZXh0LCBvYmpba2V5XSwga2V5KSA9PT0gZmFsc2UpIHJldHVybjtcblx0XHRcdH1cblx0XHR9LFxuXHRcdHRyeUVhY2g6IGZ1bmN0aW9uIChvYmosIGZuSXRlcmF0b3IsIGZuRXJyb3IsIGNvbnRleHQpIHtcblx0XHRcdHRoaXMuZWFjaChvYmosIGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZuSXRlcmF0b3IuY2FsbChjb250ZXh0LCB2YWx1ZSwga2V5KTtcblx0XHRcdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdFx0XHRpZiAodGhpcy5pc0Z1bmN0aW9uKGZuRXJyb3IpKSB7XG5cdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRmbkVycm9yLmNhbGwoY29udGV4dCwgdmFsdWUsIGtleSwgZXJyb3IpO1xuXHRcdFx0XHRcdFx0fSBjYXRjaCAoZXJyb3IpIHt9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9LCB0aGlzKTtcblx0XHR9LFxuXHRcdHJlZ2lzdGVyUGx1Z2luOiBmdW5jdGlvbiAobWV0aG9kcykge1xuXHRcdFx0QmFzaWwucGx1Z2lucyA9IHRoaXMuZXh0ZW5kKG1ldGhvZHMsIEJhc2lsLnBsdWdpbnMpO1xuXHRcdH0sXG5cdFx0Z2V0VHlwZU9mOiBmdW5jdGlvbiAob2JqKSB7XG5cdFx0XHRpZiAodHlwZW9mIG9iaiA9PT0gJ3VuZGVmaW5lZCcgfHwgb2JqID09PSBudWxsKVxuXHRcdFx0XHRyZXR1cm4gJycgKyBvYmo7XG5cdFx0XHRyZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikucmVwbGFjZSgvXlxcW29iamVjdFxccyguKilcXF0kLywgZnVuY3Rpb24gKCQwLCAkMSkgeyByZXR1cm4gJDEudG9Mb3dlckNhc2UoKTsgfSk7XG5cdFx0fVxuXHR9O1xuXG5cdC8vIEFkZCBzb21lIGlzVHlwZSBtZXRob2RzOiBpc0FyZ3VtZW50cywgaXNCb29sZWFuLCBpc0Z1bmN0aW9uLCBpc1N0cmluZywgaXNBcnJheSwgaXNOdW1iZXIsIGlzRGF0ZSwgaXNSZWdFeHAsIGlzVW5kZWZpbmVkLCBpc051bGwuXG5cdHZhciB0eXBlcyA9IFsnQXJndW1lbnRzJywgJ0Jvb2xlYW4nLCAnRnVuY3Rpb24nLCAnU3RyaW5nJywgJ0FycmF5JywgJ051bWJlcicsICdEYXRlJywgJ1JlZ0V4cCcsICdVbmRlZmluZWQnLCAnTnVsbCddO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IHR5cGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0QmFzaWwudXRpbHNbJ2lzJyArIHR5cGVzW2ldXSA9IChmdW5jdGlvbiAodHlwZSkge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uIChvYmopIHtcblx0XHRcdFx0cmV0dXJuIEJhc2lsLnV0aWxzLmdldFR5cGVPZihvYmopID09PSB0eXBlLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHR9O1xuXHRcdH0pKHR5cGVzW2ldKTtcblx0fVxuXG5cdC8vIFBsdWdpbnNcblx0QmFzaWwucGx1Z2lucyA9IHt9O1xuXG5cdC8vIE9wdGlvbnNcblx0QmFzaWwub3B0aW9ucyA9IEJhc2lsLnV0aWxzLmV4dGVuZCh7XG5cdFx0bmFtZXNwYWNlOiAnYjQ1aTEnLFxuXHRcdHN0b3JhZ2VzOiBbJ2xvY2FsJywgJ2Nvb2tpZScsICdzZXNzaW9uJywgJ21lbW9yeSddLFxuXHRcdGV4cGlyZURheXM6IDM2NSxcblx0XHRrZXlEZWxpbWl0ZXI6ICcuJ1xuXHR9LCB3aW5kb3cuQmFzaWwgPyB3aW5kb3cuQmFzaWwub3B0aW9ucyA6IHt9KTtcblxuXHQvLyBTdG9yYWdlXG5cdEJhc2lsLlN0b3JhZ2UgPSBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIF9zYWx0ID0gJ2I0NWkxJyArIChNYXRoLnJhbmRvbSgpICsgMSlcblx0XHRcdFx0LnRvU3RyaW5nKDM2KVxuXHRcdFx0XHQuc3Vic3RyaW5nKDcpLFxuXHRcdFx0X3N0b3JhZ2VzID0ge30sXG5cdFx0XHRfaXNWYWxpZEtleSA9IGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdFx0dmFyIHR5cGUgPSBCYXNpbC51dGlscy5nZXRUeXBlT2Yoa2V5KTtcblx0XHRcdFx0cmV0dXJuICh0eXBlID09PSAnc3RyaW5nJyAmJiBrZXkpIHx8IHR5cGUgPT09ICdudW1iZXInIHx8IHR5cGUgPT09ICdib29sZWFuJztcblx0XHRcdH0sXG5cdFx0XHRfdG9TdG9yYWdlc0FycmF5ID0gZnVuY3Rpb24gKHN0b3JhZ2VzKSB7XG5cdFx0XHRcdGlmIChCYXNpbC51dGlscy5pc0FycmF5KHN0b3JhZ2VzKSlcblx0XHRcdFx0XHRyZXR1cm4gc3RvcmFnZXM7XG5cdFx0XHRcdHJldHVybiBCYXNpbC51dGlscy5pc1N0cmluZyhzdG9yYWdlcykgPyBbc3RvcmFnZXNdIDogW107XG5cdFx0XHR9LFxuXHRcdFx0X3RvU3RvcmVkS2V5ID0gZnVuY3Rpb24gKG5hbWVzcGFjZSwgcGF0aCwgZGVsaW1pdGVyKSB7XG5cdFx0XHRcdHZhciBrZXkgPSAnJztcblx0XHRcdFx0aWYgKF9pc1ZhbGlkS2V5KHBhdGgpKSB7XG5cdFx0XHRcdFx0a2V5ICs9IHBhdGg7XG5cdFx0XHRcdH0gZWxzZSBpZiAoQmFzaWwudXRpbHMuaXNBcnJheShwYXRoKSkge1xuXHRcdFx0XHRcdHBhdGggPSBCYXNpbC51dGlscy5pc0Z1bmN0aW9uKHBhdGguZmlsdGVyKSA/IHBhdGguZmlsdGVyKF9pc1ZhbGlkS2V5KSA6IHBhdGg7XG5cdFx0XHRcdFx0a2V5ID0gcGF0aC5qb2luKGRlbGltaXRlcik7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIGtleSAmJiBfaXNWYWxpZEtleShuYW1lc3BhY2UpID8gbmFtZXNwYWNlICsgZGVsaW1pdGVyICsga2V5IDoga2V5O1xuIFx0XHRcdH0sXG5cdFx0XHRfdG9LZXlOYW1lID0gZnVuY3Rpb24gKG5hbWVzcGFjZSwga2V5LCBkZWxpbWl0ZXIpIHtcblx0XHRcdFx0aWYgKCFfaXNWYWxpZEtleShuYW1lc3BhY2UpKVxuXHRcdFx0XHRcdHJldHVybiBrZXk7XG5cdFx0XHRcdHJldHVybiBrZXkucmVwbGFjZShuZXcgUmVnRXhwKCdeJyArIG5hbWVzcGFjZSArIGRlbGltaXRlciksICcnKTtcblx0XHRcdH0sXG5cdFx0XHRfdG9TdG9yZWRWYWx1ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuXHRcdFx0XHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuXHRcdFx0fSxcblx0XHRcdF9mcm9tU3RvcmVkVmFsdWUgPSBmdW5jdGlvbiAodmFsdWUpIHtcblx0XHRcdFx0cmV0dXJuIHZhbHVlID8gSlNPTi5wYXJzZSh2YWx1ZSkgOiBudWxsO1xuXHRcdFx0fTtcblxuXHRcdC8vIEhUTUw1IHdlYiBzdG9yYWdlIGludGVyZmFjZVxuXHRcdHZhciB3ZWJTdG9yYWdlSW50ZXJmYWNlID0ge1xuXHRcdFx0ZW5naW5lOiBudWxsLFxuXHRcdFx0Y2hlY2s6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHR3aW5kb3dbdGhpcy5lbmdpbmVdLnNldEl0ZW0oX3NhbHQsIHRydWUpO1xuXHRcdFx0XHRcdHdpbmRvd1t0aGlzLmVuZ2luZV0ucmVtb3ZlSXRlbShfc2FsdCk7XG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9LFxuXHRcdFx0c2V0OiBmdW5jdGlvbiAoa2V5LCB2YWx1ZSwgb3B0aW9ucykge1xuXHRcdFx0XHRpZiAoIWtleSlcblx0XHRcdFx0XHR0aHJvdyBFcnJvcignaW52YWxpZCBrZXknKTtcblx0XHRcdFx0d2luZG93W3RoaXMuZW5naW5lXS5zZXRJdGVtKGtleSwgdmFsdWUpO1xuXHRcdFx0fSxcblx0XHRcdGdldDogZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0XHRyZXR1cm4gd2luZG93W3RoaXMuZW5naW5lXS5nZXRJdGVtKGtleSk7XG5cdFx0XHR9LFxuXHRcdFx0cmVtb3ZlOiBmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHRcdHdpbmRvd1t0aGlzLmVuZ2luZV0ucmVtb3ZlSXRlbShrZXkpO1xuXHRcdFx0fSxcblx0XHRcdHJlc2V0OiBmdW5jdGlvbiAobmFtZXNwYWNlKSB7XG5cdFx0XHRcdGZvciAodmFyIGkgPSAwLCBrZXk7IGkgPCB3aW5kb3dbdGhpcy5lbmdpbmVdLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0a2V5ID0gd2luZG93W3RoaXMuZW5naW5lXS5rZXkoaSk7XG5cdFx0XHRcdFx0aWYgKCFuYW1lc3BhY2UgfHwga2V5LmluZGV4T2YobmFtZXNwYWNlKSA9PT0gMCkge1xuXHRcdFx0XHRcdFx0dGhpcy5yZW1vdmUoa2V5KTtcblx0XHRcdFx0XHRcdGktLTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRrZXlzOiBmdW5jdGlvbiAobmFtZXNwYWNlLCBkZWxpbWl0ZXIpIHtcblx0XHRcdFx0dmFyIGtleXMgPSBbXTtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDAsIGtleTsgaSA8IHdpbmRvd1t0aGlzLmVuZ2luZV0ubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRrZXkgPSB3aW5kb3dbdGhpcy5lbmdpbmVdLmtleShpKTtcblx0XHRcdFx0XHRpZiAoIW5hbWVzcGFjZSB8fCBrZXkuaW5kZXhPZihuYW1lc3BhY2UpID09PSAwKVxuXHRcdFx0XHRcdFx0a2V5cy5wdXNoKF90b0tleU5hbWUobmFtZXNwYWNlLCBrZXksIGRlbGltaXRlcikpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBrZXlzO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHQvLyBsb2NhbCBzdG9yYWdlXG5cdFx0X3N0b3JhZ2VzLmxvY2FsID0gQmFzaWwudXRpbHMuZXh0ZW5kKHt9LCB3ZWJTdG9yYWdlSW50ZXJmYWNlLCB7XG5cdFx0XHRlbmdpbmU6ICdsb2NhbFN0b3JhZ2UnXG5cdFx0fSk7XG5cdFx0Ly8gc2Vzc2lvbiBzdG9yYWdlXG5cdFx0X3N0b3JhZ2VzLnNlc3Npb24gPSBCYXNpbC51dGlscy5leHRlbmQoe30sIHdlYlN0b3JhZ2VJbnRlcmZhY2UsIHtcblx0XHRcdGVuZ2luZTogJ3Nlc3Npb25TdG9yYWdlJ1xuXHRcdH0pO1xuXG5cdFx0Ly8gbWVtb3J5IHN0b3JhZ2Vcblx0XHRfc3RvcmFnZXMubWVtb3J5ID0ge1xuXHRcdFx0X2hhc2g6IHt9LFxuXHRcdFx0Y2hlY2s6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9LFxuXHRcdFx0c2V0OiBmdW5jdGlvbiAoa2V5LCB2YWx1ZSwgb3B0aW9ucykge1xuXHRcdFx0XHRpZiAoIWtleSlcblx0XHRcdFx0XHR0aHJvdyBFcnJvcignaW52YWxpZCBrZXknKTtcblx0XHRcdFx0dGhpcy5faGFzaFtrZXldID0gdmFsdWU7XG5cdFx0XHR9LFxuXHRcdFx0Z2V0OiBmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLl9oYXNoW2tleV0gfHwgbnVsbDtcblx0XHRcdH0sXG5cdFx0XHRyZW1vdmU6IGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdFx0ZGVsZXRlIHRoaXMuX2hhc2hba2V5XTtcblx0XHRcdH0sXG5cdFx0XHRyZXNldDogZnVuY3Rpb24gKG5hbWVzcGFjZSkge1xuXHRcdFx0XHRmb3IgKHZhciBrZXkgaW4gdGhpcy5faGFzaCkge1xuXHRcdFx0XHRcdGlmICghbmFtZXNwYWNlIHx8IGtleS5pbmRleE9mKG5hbWVzcGFjZSkgPT09IDApXG5cdFx0XHRcdFx0XHR0aGlzLnJlbW92ZShrZXkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0a2V5czogZnVuY3Rpb24gKG5hbWVzcGFjZSwgZGVsaW1pdGVyKSB7XG5cdFx0XHRcdHZhciBrZXlzID0gW107XG5cdFx0XHRcdGZvciAodmFyIGtleSBpbiB0aGlzLl9oYXNoKVxuXHRcdFx0XHRcdGlmICghbmFtZXNwYWNlIHx8IGtleS5pbmRleE9mKG5hbWVzcGFjZSkgPT09IDApXG5cdFx0XHRcdFx0XHRrZXlzLnB1c2goX3RvS2V5TmFtZShuYW1lc3BhY2UsIGtleSwgZGVsaW1pdGVyKSk7XG5cdFx0XHRcdHJldHVybiBrZXlzO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHQvLyBjb29raWUgc3RvcmFnZVxuXHRcdF9zdG9yYWdlcy5jb29raWUgPSB7XG5cdFx0XHRjaGVjazogZnVuY3Rpb24gKG9wdGlvbnMpIHtcblx0XHRcdFx0aWYgKCFuYXZpZ2F0b3IuY29va2llRW5hYmxlZClcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdGlmICh3aW5kb3cuc2VsZiAhPT0gd2luZG93LnRvcCkge1xuXHRcdFx0XHRcdC8vIHdlIG5lZWQgdG8gY2hlY2sgdGhpcmQtcGFydHkgY29va2llcztcblx0XHRcdFx0XHR2YXIgY29va2llID0gJ3RoaXJkcGFydHkuY2hlY2s9JyArIE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIDEwMDApO1xuXHRcdFx0XHRcdGRvY3VtZW50LmNvb2tpZSA9IGNvb2tpZSArICc7IHBhdGg9Lyc7XG5cdFx0XHRcdFx0cmV0dXJuIGRvY3VtZW50LmNvb2tpZS5pbmRleE9mKGNvb2tpZSkgIT09IC0xO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIGlmIGNvb2tpZSBzZWN1cmUgYWN0aXZhdGVkLCBlbnN1cmUgaXQgd29ya3MgKG5vdCB0aGUgY2FzZSBpZiB3ZSBhcmUgaW4gaHR0cCBvbmx5KVxuXHRcdFx0XHRpZiAob3B0aW9ucyAmJiBvcHRpb25zLnNlY3VyZSkge1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHR0aGlzLnNldChfc2FsdCwgX3NhbHQsIG9wdGlvbnMpO1xuXHRcdFx0XHRcdFx0dmFyIGhhc1NlY3VyZWx5UGVyc2l0ZWQgPSB0aGlzLmdldChfc2FsdCkgPT09IF9zYWx0O1xuXHRcdFx0XHRcdFx0dGhpcy5yZW1vdmUoX3NhbHQpO1xuXHRcdFx0XHRcdFx0cmV0dXJuIGhhc1NlY3VyZWx5UGVyc2l0ZWQ7XG5cdFx0XHRcdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9LFxuXHRcdFx0c2V0OiBmdW5jdGlvbiAoa2V5LCB2YWx1ZSwgb3B0aW9ucykge1xuXHRcdFx0XHRpZiAoIXRoaXMuY2hlY2soKSlcblx0XHRcdFx0XHR0aHJvdyBFcnJvcignY29va2llcyBhcmUgZGlzYWJsZWQnKTtcblx0XHRcdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdFx0XHRcdGlmICgha2V5KVxuXHRcdFx0XHRcdHRocm93IEVycm9yKCdpbnZhbGlkIGtleScpO1xuXHRcdFx0XHR2YXIgY29va2llID0gZW5jb2RlVVJJQ29tcG9uZW50KGtleSkgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpO1xuXHRcdFx0XHQvLyBoYW5kbGUgZXhwaXJhdGlvbiBkYXlzXG5cdFx0XHRcdGlmIChvcHRpb25zLmV4cGlyZURheXMpIHtcblx0XHRcdFx0XHR2YXIgZGF0ZSA9IG5ldyBEYXRlKCk7XG5cdFx0XHRcdFx0ZGF0ZS5zZXRUaW1lKGRhdGUuZ2V0VGltZSgpICsgKG9wdGlvbnMuZXhwaXJlRGF5cyAqIDI0ICogNjAgKiA2MCAqIDEwMDApKTtcblx0XHRcdFx0XHRjb29raWUgKz0gJzsgZXhwaXJlcz0nICsgZGF0ZS50b0dNVFN0cmluZygpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIGhhbmRsZSBkb21haW5cblx0XHRcdFx0aWYgKG9wdGlvbnMuZG9tYWluICYmIG9wdGlvbnMuZG9tYWluICE9PSBkb2N1bWVudC5kb21haW4pIHtcblx0XHRcdFx0XHR2YXIgX2RvbWFpbiA9IG9wdGlvbnMuZG9tYWluLnJlcGxhY2UoL15cXC4vLCAnJyk7XG5cdFx0XHRcdFx0aWYgKGRvY3VtZW50LmRvbWFpbi5pbmRleE9mKF9kb21haW4pID09PSAtMSB8fCBfZG9tYWluLnNwbGl0KCcuJykubGVuZ3RoIDw9IDEpXG5cdFx0XHRcdFx0XHR0aHJvdyBFcnJvcignaW52YWxpZCBkb21haW4nKTtcblx0XHRcdFx0XHRjb29raWUgKz0gJzsgZG9tYWluPScgKyBvcHRpb25zLmRvbWFpbjtcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBoYW5kbGUgc2FtZSBzaXRlXG5cdFx0XHRcdGlmIChvcHRpb25zLnNhbWVTaXRlICYmIFsnbGF4Jywnc3RyaWN0Jywnbm9uZSddLmluY2x1ZGVzKG9wdGlvbnMuc2FtZVNpdGUudG9Mb3dlckNhc2UoKSkpIHtcblx0XHRcdFx0XHRjb29raWUgKz0gJzsgU2FtZVNpdGU9JyArIG9wdGlvbnMuc2FtZVNpdGU7XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gaGFuZGxlIHNlY3VyZVxuXHRcdFx0XHRpZiAob3B0aW9ucy5zZWN1cmUgPT09IHRydWUpIHtcblx0XHRcdFx0XHRjb29raWUgKz0gJzsgU2VjdXJlJztcblx0XHRcdFx0fVxuXHRcdFx0XHRkb2N1bWVudC5jb29raWUgPSBjb29raWUgKyAnOyBwYXRoPS8nO1xuXHRcdFx0fSxcblx0XHRcdGdldDogZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0XHRpZiAoIXRoaXMuY2hlY2soKSlcblx0XHRcdFx0XHR0aHJvdyBFcnJvcignY29va2llcyBhcmUgZGlzYWJsZWQnKTtcblx0XHRcdFx0dmFyIGVuY29kZWRLZXkgPSBlbmNvZGVVUklDb21wb25lbnQoa2V5KTtcblx0XHRcdFx0dmFyIGNvb2tpZXMgPSBkb2N1bWVudC5jb29raWUgPyBkb2N1bWVudC5jb29raWUuc3BsaXQoJzsnKSA6IFtdO1xuXHRcdFx0XHQvLyByZXRyaWV2ZSBsYXN0IHVwZGF0ZWQgY29va2llIGZpcnN0XG5cdFx0XHRcdGZvciAodmFyIGkgPSBjb29raWVzLmxlbmd0aCAtIDEsIGNvb2tpZTsgaSA+PSAwOyBpLS0pIHtcblx0XHRcdFx0XHRjb29raWUgPSBjb29raWVzW2ldLnJlcGxhY2UoL15cXHMqLywgJycpO1xuXHRcdFx0XHRcdGlmIChjb29raWUuaW5kZXhPZihlbmNvZGVkS2V5ICsgJz0nKSA9PT0gMClcblx0XHRcdFx0XHRcdHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoY29va2llLnN1YnN0cmluZyhlbmNvZGVkS2V5Lmxlbmd0aCArIDEsIGNvb2tpZS5sZW5ndGgpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdH0sXG5cdFx0XHRyZW1vdmU6IGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdFx0Ly8gcmVtb3ZlIGNvb2tpZSBmcm9tIG1haW4gZG9tYWluXG5cdFx0XHRcdHRoaXMuc2V0KGtleSwgJycsIHsgZXhwaXJlRGF5czogLTEgfSk7XG5cdFx0XHRcdC8vIHJlbW92ZSBjb29raWUgZnJvbSB1cHBlciBkb21haW5zXG5cdFx0XHRcdHZhciBkb21haW5QYXJ0cyA9IGRvY3VtZW50LmRvbWFpbi5zcGxpdCgnLicpO1xuXHRcdFx0XHRmb3IgKHZhciBpID0gZG9tYWluUGFydHMubGVuZ3RoOyBpID4gMTsgaS0tKSB7XG5cdFx0XHRcdFx0dGhpcy5zZXQoa2V5LCAnJywgeyBleHBpcmVEYXlzOiAtMSwgZG9tYWluOiAnLicgKyBkb21haW5QYXJ0cy5zbGljZSgtIGkpLmpvaW4oJy4nKSB9KTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdHJlc2V0OiBmdW5jdGlvbiAobmFtZXNwYWNlKSB7XG5cdFx0XHRcdHZhciBjb29raWVzID0gZG9jdW1lbnQuY29va2llID8gZG9jdW1lbnQuY29va2llLnNwbGl0KCc7JykgOiBbXTtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDAsIGNvb2tpZSwga2V5OyBpIDwgY29va2llcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdGNvb2tpZSA9IGNvb2tpZXNbaV0ucmVwbGFjZSgvXlxccyovLCAnJyk7XG5cdFx0XHRcdFx0a2V5ID0gY29va2llLnN1YnN0cigwLCBjb29raWUuaW5kZXhPZignPScpKTtcblx0XHRcdFx0XHRpZiAoIW5hbWVzcGFjZSB8fCBrZXkuaW5kZXhPZihuYW1lc3BhY2UpID09PSAwKVxuXHRcdFx0XHRcdFx0dGhpcy5yZW1vdmUoa2V5KTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdGtleXM6IGZ1bmN0aW9uIChuYW1lc3BhY2UsIGRlbGltaXRlcikge1xuXHRcdFx0XHRpZiAoIXRoaXMuY2hlY2soKSlcblx0XHRcdFx0XHR0aHJvdyBFcnJvcignY29va2llcyBhcmUgZGlzYWJsZWQnKTtcblx0XHRcdFx0dmFyIGtleXMgPSBbXSxcblx0XHRcdFx0XHRjb29raWVzID0gZG9jdW1lbnQuY29va2llID8gZG9jdW1lbnQuY29va2llLnNwbGl0KCc7JykgOiBbXTtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDAsIGNvb2tpZSwga2V5OyBpIDwgY29va2llcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdGNvb2tpZSA9IGNvb2tpZXNbaV0ucmVwbGFjZSgvXlxccyovLCAnJyk7XG5cdFx0XHRcdFx0a2V5ID0gZGVjb2RlVVJJQ29tcG9uZW50KGNvb2tpZS5zdWJzdHIoMCwgY29va2llLmluZGV4T2YoJz0nKSkpO1xuXHRcdFx0XHRcdGlmICghbmFtZXNwYWNlIHx8IGtleS5pbmRleE9mKG5hbWVzcGFjZSkgPT09IDApXG5cdFx0XHRcdFx0XHRrZXlzLnB1c2goX3RvS2V5TmFtZShuYW1lc3BhY2UsIGtleSwgZGVsaW1pdGVyKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIGtleXM7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHJldHVybiB7XG5cdFx0XHRpbml0OiBmdW5jdGlvbiAob3B0aW9ucykge1xuXHRcdFx0XHR0aGlzLnNldE9wdGlvbnMob3B0aW9ucyk7XG5cdFx0XHRcdHJldHVybiB0aGlzO1xuXHRcdFx0fSxcblx0XHRcdHNldE9wdGlvbnM6IGZ1bmN0aW9uIChvcHRpb25zKSB7XG5cdFx0XHRcdHRoaXMub3B0aW9ucyA9IEJhc2lsLnV0aWxzLmV4dGVuZCh7fSwgdGhpcy5vcHRpb25zIHx8IEJhc2lsLm9wdGlvbnMsIG9wdGlvbnMpO1xuXHRcdFx0fSxcblx0XHRcdHN1cHBvcnQ6IGZ1bmN0aW9uIChzdG9yYWdlKSB7XG5cdFx0XHRcdHJldHVybiBfc3RvcmFnZXMuaGFzT3duUHJvcGVydHkoc3RvcmFnZSk7XG5cdFx0XHR9LFxuXHRcdFx0Y2hlY2s6IGZ1bmN0aW9uIChzdG9yYWdlKSB7XG5cdFx0XHRcdGlmICh0aGlzLnN1cHBvcnQoc3RvcmFnZSkpXG5cdFx0XHRcdFx0cmV0dXJuIF9zdG9yYWdlc1tzdG9yYWdlXS5jaGVjayh0aGlzLm9wdGlvbnMpO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9LFxuXHRcdFx0c2V0OiBmdW5jdGlvbiAoa2V5LCB2YWx1ZSwgb3B0aW9ucykge1xuXHRcdFx0XHRvcHRpb25zID0gQmFzaWwudXRpbHMuZXh0ZW5kKHt9LCB0aGlzLm9wdGlvbnMsIG9wdGlvbnMpO1xuXHRcdFx0XHRpZiAoIShrZXkgPSBfdG9TdG9yZWRLZXkob3B0aW9ucy5uYW1lc3BhY2UsIGtleSwgb3B0aW9ucy5rZXlEZWxpbWl0ZXIpKSlcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdHZhbHVlID0gb3B0aW9ucy5yYXcgPT09IHRydWUgPyB2YWx1ZSA6IF90b1N0b3JlZFZhbHVlKHZhbHVlKTtcblx0XHRcdFx0dmFyIHdoZXJlID0gbnVsbDtcblx0XHRcdFx0Ly8gdHJ5IHRvIHNldCBrZXkvdmFsdWUgaW4gZmlyc3QgYXZhaWxhYmxlIHN0b3JhZ2Vcblx0XHRcdFx0QmFzaWwudXRpbHMudHJ5RWFjaChfdG9TdG9yYWdlc0FycmF5KG9wdGlvbnMuc3RvcmFnZXMpLCBmdW5jdGlvbiAoc3RvcmFnZSwgaW5kZXgpIHtcblx0XHRcdFx0XHRfc3RvcmFnZXNbc3RvcmFnZV0uc2V0KGtleSwgdmFsdWUsIG9wdGlvbnMpO1xuXHRcdFx0XHRcdHdoZXJlID0gc3RvcmFnZTtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7IC8vIGJyZWFrO1xuXHRcdFx0XHR9LCBudWxsLCB0aGlzKTtcblx0XHRcdFx0aWYgKCF3aGVyZSkge1xuXHRcdFx0XHRcdC8vIGtleSBoYXMgbm90IGJlZW4gc2V0IGFueXdoZXJlXG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIHJlbW92ZSBrZXkgZnJvbSBhbGwgb3RoZXIgc3RvcmFnZXNcblx0XHRcdFx0QmFzaWwudXRpbHMudHJ5RWFjaChfdG9TdG9yYWdlc0FycmF5KG9wdGlvbnMuc3RvcmFnZXMpLCBmdW5jdGlvbiAoc3RvcmFnZSwgaW5kZXgpIHtcblx0XHRcdFx0XHRpZiAoc3RvcmFnZSAhPT0gd2hlcmUpXG5cdFx0XHRcdFx0XHRfc3RvcmFnZXNbc3RvcmFnZV0ucmVtb3ZlKGtleSk7XG5cdFx0XHRcdH0sIG51bGwsIHRoaXMpO1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH0sXG5cdFx0XHRnZXQ6IGZ1bmN0aW9uIChrZXksIG9wdGlvbnMpIHtcblx0XHRcdFx0b3B0aW9ucyA9IEJhc2lsLnV0aWxzLmV4dGVuZCh7fSwgdGhpcy5vcHRpb25zLCBvcHRpb25zKTtcblx0XHRcdFx0aWYgKCEoa2V5ID0gX3RvU3RvcmVkS2V5KG9wdGlvbnMubmFtZXNwYWNlLCBrZXksIG9wdGlvbnMua2V5RGVsaW1pdGVyKSkpXG5cdFx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHRcdHZhciB2YWx1ZSA9IG51bGw7XG5cdFx0XHRcdEJhc2lsLnV0aWxzLnRyeUVhY2goX3RvU3RvcmFnZXNBcnJheShvcHRpb25zLnN0b3JhZ2VzKSwgZnVuY3Rpb24gKHN0b3JhZ2UsIGluZGV4KSB7XG5cdFx0XHRcdFx0aWYgKHZhbHVlICE9PSBudWxsKVxuXHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlOyAvLyBicmVhayBpZiBhIHZhbHVlIGhhcyBhbHJlYWR5IGJlZW4gZm91bmQuXG5cdFx0XHRcdFx0dmFsdWUgPSBfc3RvcmFnZXNbc3RvcmFnZV0uZ2V0KGtleSwgb3B0aW9ucykgfHwgbnVsbDtcblx0XHRcdFx0XHR2YWx1ZSA9IG9wdGlvbnMucmF3ID09PSB0cnVlID8gdmFsdWUgOiBfZnJvbVN0b3JlZFZhbHVlKHZhbHVlKTtcblx0XHRcdFx0fSwgZnVuY3Rpb24gKHN0b3JhZ2UsIGluZGV4LCBlcnJvcikge1xuXHRcdFx0XHRcdHZhbHVlID0gbnVsbDtcblx0XHRcdFx0fSwgdGhpcyk7XG5cdFx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHRcdH0sXG5cdFx0XHRyZW1vdmU6IGZ1bmN0aW9uIChrZXksIG9wdGlvbnMpIHtcblx0XHRcdFx0b3B0aW9ucyA9IEJhc2lsLnV0aWxzLmV4dGVuZCh7fSwgdGhpcy5vcHRpb25zLCBvcHRpb25zKTtcblx0XHRcdFx0aWYgKCEoa2V5ID0gX3RvU3RvcmVkS2V5KG9wdGlvbnMubmFtZXNwYWNlLCBrZXksIG9wdGlvbnMua2V5RGVsaW1pdGVyKSkpXG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRCYXNpbC51dGlscy50cnlFYWNoKF90b1N0b3JhZ2VzQXJyYXkob3B0aW9ucy5zdG9yYWdlcyksIGZ1bmN0aW9uIChzdG9yYWdlKSB7XG5cdFx0XHRcdFx0X3N0b3JhZ2VzW3N0b3JhZ2VdLnJlbW92ZShrZXkpO1xuXHRcdFx0XHR9LCBudWxsLCB0aGlzKTtcblx0XHRcdH0sXG5cdFx0XHRyZXNldDogZnVuY3Rpb24gKG9wdGlvbnMpIHtcblx0XHRcdFx0b3B0aW9ucyA9IEJhc2lsLnV0aWxzLmV4dGVuZCh7fSwgdGhpcy5vcHRpb25zLCBvcHRpb25zKTtcblx0XHRcdFx0QmFzaWwudXRpbHMudHJ5RWFjaChfdG9TdG9yYWdlc0FycmF5KG9wdGlvbnMuc3RvcmFnZXMpLCBmdW5jdGlvbiAoc3RvcmFnZSkge1xuXHRcdFx0XHRcdF9zdG9yYWdlc1tzdG9yYWdlXS5yZXNldChvcHRpb25zLm5hbWVzcGFjZSk7XG5cdFx0XHRcdH0sIG51bGwsIHRoaXMpO1xuXHRcdFx0fSxcblx0XHRcdGtleXM6IGZ1bmN0aW9uIChvcHRpb25zKSB7XG5cdFx0XHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHRcdFx0XHR2YXIga2V5cyA9IFtdO1xuXHRcdFx0XHRmb3IgKHZhciBrZXkgaW4gdGhpcy5rZXlzTWFwKG9wdGlvbnMpKVxuXHRcdFx0XHRcdGtleXMucHVzaChrZXkpO1xuXHRcdFx0XHRyZXR1cm4ga2V5cztcblx0XHRcdH0sXG5cdFx0XHRrZXlzTWFwOiBmdW5jdGlvbiAob3B0aW9ucykge1xuXHRcdFx0XHRvcHRpb25zID0gQmFzaWwudXRpbHMuZXh0ZW5kKHt9LCB0aGlzLm9wdGlvbnMsIG9wdGlvbnMpO1xuXHRcdFx0XHR2YXIgbWFwID0ge307XG5cdFx0XHRcdEJhc2lsLnV0aWxzLnRyeUVhY2goX3RvU3RvcmFnZXNBcnJheShvcHRpb25zLnN0b3JhZ2VzKSwgZnVuY3Rpb24gKHN0b3JhZ2UpIHtcblx0XHRcdFx0XHRCYXNpbC51dGlscy5lYWNoKF9zdG9yYWdlc1tzdG9yYWdlXS5rZXlzKG9wdGlvbnMubmFtZXNwYWNlLCBvcHRpb25zLmtleURlbGltaXRlciksIGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdFx0XHRcdG1hcFtrZXldID0gQmFzaWwudXRpbHMuaXNBcnJheShtYXBba2V5XSkgPyBtYXBba2V5XSA6IFtdO1xuXHRcdFx0XHRcdFx0bWFwW2tleV0ucHVzaChzdG9yYWdlKTtcblx0XHRcdFx0XHR9LCB0aGlzKTtcblx0XHRcdFx0fSwgbnVsbCwgdGhpcyk7XG5cdFx0XHRcdHJldHVybiBtYXA7XG5cdFx0XHR9XG5cdFx0fTtcblx0fTtcblxuXHQvLyBBY2Nlc3MgdG8gbmF0aXZlIHN0b3JhZ2VzLCB3aXRob3V0IG5hbWVzcGFjZSBvciBiYXNpbCB2YWx1ZSBkZWNvcmF0aW9uXG5cdEJhc2lsLm1lbW9yeSA9IG5ldyBCYXNpbC5TdG9yYWdlKCkuaW5pdCh7IHN0b3JhZ2VzOiAnbWVtb3J5JywgbmFtZXNwYWNlOiBudWxsLCByYXc6IHRydWUgfSk7XG5cdEJhc2lsLmNvb2tpZSA9IG5ldyBCYXNpbC5TdG9yYWdlKCkuaW5pdCh7IHN0b3JhZ2VzOiAnY29va2llJywgbmFtZXNwYWNlOiBudWxsLCByYXc6IHRydWUgfSk7XG5cdEJhc2lsLmxvY2FsU3RvcmFnZSA9IG5ldyBCYXNpbC5TdG9yYWdlKCkuaW5pdCh7IHN0b3JhZ2VzOiAnbG9jYWwnLCBuYW1lc3BhY2U6IG51bGwsIHJhdzogdHJ1ZSB9KTtcblx0QmFzaWwuc2Vzc2lvblN0b3JhZ2UgPSBuZXcgQmFzaWwuU3RvcmFnZSgpLmluaXQoeyBzdG9yYWdlczogJ3Nlc3Npb24nLCBuYW1lc3BhY2U6IG51bGwsIHJhdzogdHJ1ZSB9KTtcblxuXHQvLyBicm93c2VyIGV4cG9ydFxuXHR3aW5kb3cuQmFzaWwgPSBCYXNpbDtcblxuXHQvLyBBTUQgZXhwb3J0XG5cdGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcblx0XHRkZWZpbmUoZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gQmFzaWw7XG5cdFx0fSk7XG5cdC8vIGNvbW1vbmpzIGV4cG9ydFxuXHR9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBCYXNpbDtcblx0fVxuXG59KSgpO1xuIiwidmFyIGNoYXJlbmMgPSB7XG4gIC8vIFVURi04IGVuY29kaW5nXG4gIHV0Zjg6IHtcbiAgICAvLyBDb252ZXJ0IGEgc3RyaW5nIHRvIGEgYnl0ZSBhcnJheVxuICAgIHN0cmluZ1RvQnl0ZXM6IGZ1bmN0aW9uKHN0cikge1xuICAgICAgcmV0dXJuIGNoYXJlbmMuYmluLnN0cmluZ1RvQnl0ZXModW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KHN0cikpKTtcbiAgICB9LFxuXG4gICAgLy8gQ29udmVydCBhIGJ5dGUgYXJyYXkgdG8gYSBzdHJpbmdcbiAgICBieXRlc1RvU3RyaW5nOiBmdW5jdGlvbihieXRlcykge1xuICAgICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChlc2NhcGUoY2hhcmVuYy5iaW4uYnl0ZXNUb1N0cmluZyhieXRlcykpKTtcbiAgICB9XG4gIH0sXG5cbiAgLy8gQmluYXJ5IGVuY29kaW5nXG4gIGJpbjoge1xuICAgIC8vIENvbnZlcnQgYSBzdHJpbmcgdG8gYSBieXRlIGFycmF5XG4gICAgc3RyaW5nVG9CeXRlczogZnVuY3Rpb24oc3RyKSB7XG4gICAgICBmb3IgKHZhciBieXRlcyA9IFtdLCBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKylcbiAgICAgICAgYnl0ZXMucHVzaChzdHIuY2hhckNvZGVBdChpKSAmIDB4RkYpO1xuICAgICAgcmV0dXJuIGJ5dGVzO1xuICAgIH0sXG5cbiAgICAvLyBDb252ZXJ0IGEgYnl0ZSBhcnJheSB0byBhIHN0cmluZ1xuICAgIGJ5dGVzVG9TdHJpbmc6IGZ1bmN0aW9uKGJ5dGVzKSB7XG4gICAgICBmb3IgKHZhciBzdHIgPSBbXSwgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkrKylcbiAgICAgICAgc3RyLnB1c2goU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSkpO1xuICAgICAgcmV0dXJuIHN0ci5qb2luKCcnKTtcbiAgICB9XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gY2hhcmVuYztcbiIsInV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpXG5TdG9yYWdlID0gcmVxdWlyZSgnLi9zdG9yYWdlJylcblxuY2xhc3MgQWRhcHRlcnNcblxuICAjIyBBIHBhcmVudCBjbGFzcyBBZGFwdGVyIGZvciB1c2luZyB0aGUgQWxlcGhiZXQgYmFja2VuZCBBUEkuXG4gICMjIHVzZXMgalF1ZXJ5IHRvIHNlbmQgZGF0YSBpZiBgJC5hamF4YCBpcyBmb3VuZC4gRmFsbHMgYmFjayBvbiBwbGFpbiBqcyB4aHJcbiAgIyMgcGFyYW1zOlxuICAjIyAtIHVybDogdHJhY2sgVVJMIHRvIHBvc3QgZXZlbnRzIHRvXG4gICMjIC0gbmFtZXBzYWNlIChvcHRpb25hbCk6IGFsbG93cyBzZXR0aW5nIGRpZmZlcmVudCBlbnZpcm9ubWVudHMgZXRjXG4gICMjIC0gc3RvcmFnZSAob3B0aW9uYWwpOiBzdG9yYWdlIGFkYXB0ZXIgZm9yIHRoZSBxdWV1ZVxuICBjbGFzcyBAQWxlcGhiZXRBZGFwdGVyXG4gICAgcXVldWVfbmFtZTogJ19hbGVwaGJldF9xdWV1ZSdcblxuICAgIGNvbnN0cnVjdG9yOiAodXJsLCBuYW1lc3BhY2UgPSAnYWxlcGhiZXQnLCBzdG9yYWdlID0gQWRhcHRlcnMuTG9jYWxTdG9yYWdlQWRhcHRlcikgLT5cbiAgICAgIEBfc3RvcmFnZSA9IHN0b3JhZ2VcbiAgICAgIEB1cmwgPSB1cmxcbiAgICAgIEBuYW1lc3BhY2UgPSBuYW1lc3BhY2VcbiAgICAgIEBfcXVldWUgPSBKU09OLnBhcnNlKEBfc3RvcmFnZS5nZXQoQHF1ZXVlX25hbWUpIHx8ICdbXScpXG4gICAgICBAX2ZsdXNoKClcblxuICAgIF9yZW1vdmVfcXV1aWQ6IChxdXVpZCkgLT5cbiAgICAgIChlcnIsIHJlcykgPT5cbiAgICAgICAgcmV0dXJuIGlmIGVyclxuICAgICAgICB1dGlscy5yZW1vdmUoQF9xdWV1ZSwgKGVsKSAtPiBlbC5wcm9wZXJ0aWVzLl9xdXVpZCA9PSBxdXVpZClcbiAgICAgICAgQF9zdG9yYWdlLnNldChAcXVldWVfbmFtZSwgSlNPTi5zdHJpbmdpZnkoQF9xdWV1ZSkpXG5cbiAgICBfanF1ZXJ5X2dldDogKHVybCwgZGF0YSwgY2FsbGJhY2spIC0+XG4gICAgICB1dGlscy5sb2coJ3NlbmQgcmVxdWVzdCB1c2luZyBqUXVlcnknKVxuICAgICAgd2luZG93LmpRdWVyeS5hamF4XG4gICAgICAgIG1ldGhvZDogJ0dFVCdcbiAgICAgICAgdXJsOiB1cmxcbiAgICAgICAgZGF0YTogZGF0YVxuICAgICAgICBzdWNjZXNzOiBjYWxsYmFja1xuXG4gICAgX3BsYWluX2pzX2dldDogKHVybCwgZGF0YSwgY2FsbGJhY2spIC0+XG4gICAgICB1dGlscy5sb2coJ2ZhbGxiYWNrIG9uIHBsYWluIGpzIHhocicpXG4gICAgICB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuICAgICAgcGFyYW1zID0gKFwiI3tlbmNvZGVVUklDb21wb25lbnQoayl9PSN7ZW5jb2RlVVJJQ29tcG9uZW50KHYpfVwiIGZvciBrLHYgb2YgZGF0YSlcbiAgICAgIHBhcmFtcyA9IHBhcmFtcy5qb2luKCcmJykucmVwbGFjZSgvJTIwL2csICcrJylcbiAgICAgIHhoci5vcGVuKCdHRVQnLCBcIiN7dXJsfT8je3BhcmFtc31cIilcbiAgICAgIHhoci5vbmxvYWQgPSAtPlxuICAgICAgICBpZiB4aHIuc3RhdHVzID09IDIwMFxuICAgICAgICAgIGNhbGxiYWNrKClcbiAgICAgIHhoci5zZW5kKClcblxuICAgIF9hamF4X2dldDogKHVybCwgZGF0YSwgY2FsbGJhY2spIC0+XG4gICAgICBpZiB3aW5kb3cualF1ZXJ5Py5hamF4XG4gICAgICAgIEBfanF1ZXJ5X2dldCh1cmwsIGRhdGEsIGNhbGxiYWNrKVxuICAgICAgZWxzZVxuICAgICAgICBAX3BsYWluX2pzX2dldCh1cmwsIGRhdGEsIGNhbGxiYWNrKVxuXG4gICAgX2ZsdXNoOiAtPlxuICAgICAgZm9yIGl0ZW0gaW4gQF9xdWV1ZVxuICAgICAgICBjYWxsYmFjayA9IEBfcmVtb3ZlX3F1dWlkKGl0ZW0ucHJvcGVydGllcy5fcXV1aWQpXG4gICAgICAgIEBfYWpheF9nZXQoQHVybCwgdXRpbHMub21pdChpdGVtLnByb3BlcnRpZXMsICdfcXV1aWQnKSwgY2FsbGJhY2spXG4gICAgICAgIG51bGxcblxuICAgIF91c2VyX3V1aWQ6IChleHBlcmltZW50LCBnb2FsKSAtPlxuICAgICAgcmV0dXJuIHV0aWxzLnV1aWQoKSB1bmxlc3MgZXhwZXJpbWVudC51c2VyX2lkXG4gICAgICAjIGlmIGdvYWwgaXMgbm90IHVuaXF1ZSwgd2UgdHJhY2sgaXQgZXZlcnkgdGltZS4gcmV0dXJuIGEgbmV3IHJhbmRvbSB1dWlkXG4gICAgICByZXR1cm4gdXRpbHMudXVpZCgpIHVubGVzcyBnb2FsLnVuaXF1ZVxuICAgICAgIyBmb3IgYSBnaXZlbiB1c2VyIGlkLCBuYW1lc3BhY2UsIGdvYWwgYW5kIGV4cGVyaW1lbnQsIHRoZSB1dWlkIHdpbGwgYWx3YXlzIGJlIHRoZSBzYW1lXG4gICAgICAjIHRoaXMgYXZvaWRzIGNvdW50aW5nIGdvYWxzIHR3aWNlIGZvciB0aGUgc2FtZSB1c2VyIGFjcm9zcyBkaWZmZXJlbnQgZGV2aWNlc1xuICAgICAgdXRpbHMuc2hhMShcIiN7QG5hbWVzcGFjZX0uI3tleHBlcmltZW50Lm5hbWV9LiN7Z29hbC5uYW1lfS4je2V4cGVyaW1lbnQudXNlcl9pZH1cIilcblxuICAgIF90cmFjazogKGV4cGVyaW1lbnQsIHZhcmlhbnQsIGdvYWwpIC0+XG4gICAgICB1dGlscy5sb2coXCJQZXJzaXN0ZW50IFF1ZXVlIHRyYWNrOiAje0BuYW1lc3BhY2V9LCAje2V4cGVyaW1lbnQubmFtZX0sICN7dmFyaWFudH0sICN7Z29hbC5uYW1lfVwiKVxuICAgICAgQF9xdWV1ZS5zaGlmdCgpIGlmIEBfcXVldWUubGVuZ3RoID4gMTAwXG4gICAgICBAX3F1ZXVlLnB1c2hcbiAgICAgICAgcHJvcGVydGllczpcbiAgICAgICAgICBleHBlcmltZW50OiBleHBlcmltZW50Lm5hbWVcbiAgICAgICAgICBfcXV1aWQ6IHV0aWxzLnV1aWQoKSAgIyBxdWV1ZSB1dWlkICh1c2VkIG9ubHkgaW50ZXJuYWxseSlcbiAgICAgICAgICB1dWlkOiBAX3VzZXJfdXVpZChleHBlcmltZW50LCBnb2FsKVxuICAgICAgICAgIHZhcmlhbnQ6IHZhcmlhbnRcbiAgICAgICAgICBldmVudDogZ29hbC5uYW1lXG4gICAgICAgICAgbmFtZXNwYWNlOiBAbmFtZXNwYWNlXG4gICAgICBAX3N0b3JhZ2Uuc2V0KEBxdWV1ZV9uYW1lLCBKU09OLnN0cmluZ2lmeShAX3F1ZXVlKSlcbiAgICAgIEBfZmx1c2goKVxuXG4gICAgZXhwZXJpbWVudF9zdGFydDogKGV4cGVyaW1lbnQsIHZhcmlhbnQpIC0+XG4gICAgICBAX3RyYWNrKGV4cGVyaW1lbnQsIHZhcmlhbnQsIHtuYW1lOiAncGFydGljaXBhdGUnLCB1bmlxdWU6IHRydWV9KVxuXG4gICAgZ29hbF9jb21wbGV0ZTogKGV4cGVyaW1lbnQsIHZhcmlhbnQsIGdvYWxfbmFtZSwgcHJvcHMpIC0+XG4gICAgICBAX3RyYWNrKGV4cGVyaW1lbnQsIHZhcmlhbnQsIHV0aWxzLmRlZmF1bHRzKHtuYW1lOiBnb2FsX25hbWV9LCBwcm9wcykpXG5cbiAgIyMgQWRhcHRlciBmb3IgdXNpbmcgdGhlIGxhbWVkIGJhY2tlbmQuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vQWxlcGhiZXQvbGFtZWRcbiAgIyMgaW5oZXJpdHMgZnJvbSBBbGVwaGJldEFkYXB0ZXIgd2hpY2ggdXNlcyB0aGUgc2FtZSBiYWNrZW5kIEFQSVxuICAjI1xuICBjbGFzcyBATGFtZWRBZGFwdGVyIGV4dGVuZHMgQEFsZXBoYmV0QWRhcHRlclxuICAgIHF1ZXVlX25hbWU6ICdfbGFtZWRfcXVldWUnXG5cbiAgIyMgQWRhcHRlciBmb3IgdXNpbmcgdGhlIGdpbWVsIGJhY2tlbmQuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vQWxlcGhiZXQvZ2ltZWxcbiAgIyMgVGhlIG1haW4gZGlmZmVyZW5jZSBpcyB0aGUgdXNlcl91dWlkIGdlbmVyYXRpb24gKGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eSlcbiAgIyMgcGFyYW1zOlxuICAjIyAtIHVybDogR2ltZWwgdHJhY2sgVVJMIHRvIHBvc3QgZXZlbnRzIHRvXG4gICMjIC0gbmFtZXBzYWNlOiBuYW1lc3BhY2UgZm9yIEdpbWVsIChhbGxvd3Mgc2V0dGluZyBkaWZmZXJlbnQgZW52aXJvbm1lbnRzIGV0YylcbiAgIyMgLSBzdG9yYWdlIChvcHRpb25hbCkgLSBzdG9yYWdlIGFkYXB0ZXIgZm9yIHRoZSBxdWV1ZVxuICBjbGFzcyBAR2ltZWxBZGFwdGVyIGV4dGVuZHMgQEFsZXBoYmV0QWRhcHRlclxuICAgIHF1ZXVlX25hbWU6ICdfbGFtZWRfcXVldWUnXG5cbiAgICBfdXNlcl91dWlkOiAoZXhwZXJpbWVudCwgZ29hbCkgLT5cbiAgICAgIHJldHVybiB1dGlscy51dWlkKCkgdW5sZXNzIGV4cGVyaW1lbnQudXNlcl9pZFxuICAgICAgIyBpZiBnb2FsIGlzIG5vdCB1bmlxdWUsIHdlIHRyYWNrIGl0IGV2ZXJ5IHRpbWUuIHJldHVybiBhIG5ldyByYW5kb20gdXVpZFxuICAgICAgcmV0dXJuIHV0aWxzLnV1aWQoKSB1bmxlc3MgZ29hbC51bmlxdWVcbiAgICAgICMgZm9yIGEgZ2l2ZW4gdXNlciBpZCwgbmFtZXNwYWNlIGFuZCBleHBlcmltZW50LCB0aGUgdXVpZCB3aWxsIGFsd2F5cyBiZSB0aGUgc2FtZVxuICAgICAgIyB0aGlzIGF2b2lkcyBjb3VudGluZyBnb2FscyB0d2ljZSBmb3IgdGhlIHNhbWUgdXNlciBhY3Jvc3MgZGlmZmVyZW50IGRldmljZXNcbiAgICAgIHV0aWxzLnNoYTEoXCIje0BuYW1lc3BhY2V9LiN7ZXhwZXJpbWVudC5uYW1lfS4je2V4cGVyaW1lbnQudXNlcl9pZH1cIilcblxuICAjIyBBZGFwdGVyIGZvciB1c2luZyB0aGUgbGFtZWQgYmFja2VuZC4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9BbGVwaGJldC9sYW1lZFxuICAjIyBpbmhlcml0cyBmcm9tIEFsZXBoYmV0QWRhcHRlciB3aGljaCB1c2VzIHRoZSBzYW1lIGJhY2tlbmQgQVBJXG4gICMjXG4gIGNsYXNzIEBSYWlsc0FkYXB0ZXIgZXh0ZW5kcyBAQWxlcGhiZXRBZGFwdGVyXG4gICAgcXVldWVfbmFtZTogJ19yYWlsc19xdWV1ZSdcblxuXG4gIGNsYXNzIEBQZXJzaXN0ZW50UXVldWVHb29nbGVBbmFseXRpY3NBZGFwdGVyXG4gICAgbmFtZXNwYWNlOiAnYWxlcGhiZXQnXG4gICAgcXVldWVfbmFtZTogJ19nYV9xdWV1ZSdcblxuICAgIGNvbnN0cnVjdG9yOiAoc3RvcmFnZSA9IEFkYXB0ZXJzLkxvY2FsU3RvcmFnZUFkYXB0ZXIpIC0+XG4gICAgICBAX3N0b3JhZ2UgPSBzdG9yYWdlXG4gICAgICBAX3F1ZXVlID0gSlNPTi5wYXJzZShAX3N0b3JhZ2UuZ2V0KEBxdWV1ZV9uYW1lKSB8fCAnW10nKVxuICAgICAgQF9mbHVzaCgpXG5cbiAgICBfcmVtb3ZlX3V1aWQ6ICh1dWlkKSAtPlxuICAgICAgPT5cbiAgICAgICAgdXRpbHMucmVtb3ZlKEBfcXVldWUsIChlbCkgLT4gZWwudXVpZCA9PSB1dWlkKVxuICAgICAgICBAX3N0b3JhZ2Uuc2V0KEBxdWV1ZV9uYW1lLCBKU09OLnN0cmluZ2lmeShAX3F1ZXVlKSlcblxuICAgIF9mbHVzaDogLT5cbiAgICAgIHRocm93IG5ldyBFcnJvcignZ2Egbm90IGRlZmluZWQuIFBsZWFzZSBtYWtlIHN1cmUgeW91ciBVbml2ZXJzYWwgYW5hbHl0aWNzIGlzIHNldCB1cCBjb3JyZWN0bHknKSBpZiB0eXBlb2YgZ2EgaXNudCAnZnVuY3Rpb24nXG4gICAgICBmb3IgaXRlbSBpbiBAX3F1ZXVlXG4gICAgICAgIGNhbGxiYWNrID0gQF9yZW1vdmVfdXVpZChpdGVtLnV1aWQpXG4gICAgICAgIGdhKCdzZW5kJywgJ2V2ZW50JywgaXRlbS5jYXRlZ29yeSwgaXRlbS5hY3Rpb24sIGl0ZW0ubGFiZWwsIHsnaGl0Q2FsbGJhY2snOiBjYWxsYmFjaywgJ25vbkludGVyYWN0aW9uJzogMX0pXG5cbiAgICBfdHJhY2s6IChjYXRlZ29yeSwgYWN0aW9uLCBsYWJlbCkgLT5cbiAgICAgIHV0aWxzLmxvZyhcIlBlcnNpc3RlbnQgUXVldWUgR29vZ2xlIFVuaXZlcnNhbCBBbmFseXRpY3MgdHJhY2s6ICN7Y2F0ZWdvcnl9LCAje2FjdGlvbn0sICN7bGFiZWx9XCIpXG4gICAgICBAX3F1ZXVlLnNoaWZ0KCkgaWYgQF9xdWV1ZS5sZW5ndGggPiAxMDBcbiAgICAgIEBfcXVldWUucHVzaCh7dXVpZDogdXRpbHMudXVpZCgpLCBjYXRlZ29yeTogY2F0ZWdvcnksIGFjdGlvbjogYWN0aW9uLCBsYWJlbDogbGFiZWx9KVxuICAgICAgQF9zdG9yYWdlLnNldChAcXVldWVfbmFtZSwgSlNPTi5zdHJpbmdpZnkoQF9xdWV1ZSkpXG4gICAgICBAX2ZsdXNoKClcblxuICAgIGV4cGVyaW1lbnRfc3RhcnQ6IChleHBlcmltZW50LCB2YXJpYW50KSAtPlxuICAgICAgQF90cmFjayhAbmFtZXNwYWNlLCBcIiN7ZXhwZXJpbWVudC5uYW1lfSB8ICN7dmFyaWFudH1cIiwgJ1Zpc2l0b3JzJylcblxuICAgIGdvYWxfY29tcGxldGU6IChleHBlcmltZW50LCB2YXJpYW50LCBnb2FsX25hbWUsIF9wcm9wcykgLT5cbiAgICAgIEBfdHJhY2soQG5hbWVzcGFjZSwgXCIje2V4cGVyaW1lbnQubmFtZX0gfCAje3ZhcmlhbnR9XCIsIGdvYWxfbmFtZSlcblxuXG4gIGNsYXNzIEBQZXJzaXN0ZW50UXVldWVLZWVuQWRhcHRlclxuICAgIHF1ZXVlX25hbWU6ICdfa2Vlbl9xdWV1ZSdcblxuICAgIGNvbnN0cnVjdG9yOiAoa2Vlbl9jbGllbnQsIHN0b3JhZ2UgPSBBZGFwdGVycy5Mb2NhbFN0b3JhZ2VBZGFwdGVyKSAtPlxuICAgICAgQGNsaWVudCA9IGtlZW5fY2xpZW50XG4gICAgICBAX3N0b3JhZ2UgPSBzdG9yYWdlXG4gICAgICBAX3F1ZXVlID0gSlNPTi5wYXJzZShAX3N0b3JhZ2UuZ2V0KEBxdWV1ZV9uYW1lKSB8fCAnW10nKVxuICAgICAgQF9mbHVzaCgpXG5cbiAgICBfcmVtb3ZlX3F1dWlkOiAocXV1aWQpIC0+XG4gICAgICAoZXJyLCByZXMpID0+XG4gICAgICAgIHJldHVybiBpZiBlcnJcbiAgICAgICAgdXRpbHMucmVtb3ZlKEBfcXVldWUsIChlbCkgLT4gZWwucHJvcGVydGllcy5fcXV1aWQgPT0gcXV1aWQpXG4gICAgICAgIEBfc3RvcmFnZS5zZXQoQHF1ZXVlX25hbWUsIEpTT04uc3RyaW5naWZ5KEBfcXVldWUpKVxuXG4gICAgX2ZsdXNoOiAtPlxuICAgICAgZm9yIGl0ZW0gaW4gQF9xdWV1ZVxuICAgICAgICBjYWxsYmFjayA9IEBfcmVtb3ZlX3F1dWlkKGl0ZW0ucHJvcGVydGllcy5fcXV1aWQpXG4gICAgICAgIEBjbGllbnQuYWRkRXZlbnQoaXRlbS5leHBlcmltZW50X25hbWUsIHV0aWxzLm9taXQoaXRlbS5wcm9wZXJ0aWVzLCAnX3F1dWlkJyksIGNhbGxiYWNrKVxuXG4gICAgX3VzZXJfdXVpZDogKGV4cGVyaW1lbnQsIGdvYWwpIC0+XG4gICAgICByZXR1cm4gdXRpbHMudXVpZCgpIHVubGVzcyBleHBlcmltZW50LnVzZXJfaWRcbiAgICAgICMgaWYgZ29hbCBpcyBub3QgdW5pcXVlLCB3ZSB0cmFjayBpdCBldmVyeSB0aW1lLiByZXR1cm4gYSBuZXcgcmFuZG9tIHV1aWRcbiAgICAgIHJldHVybiB1dGlscy51dWlkKCkgdW5sZXNzIGdvYWwudW5pcXVlXG4gICAgICAjIGZvciBhIGdpdmVuIHVzZXIgaWQsIG5hbWVzcGFjZSBhbmQgZXhwZXJpbWVudCwgdGhlIHV1aWQgd2lsbCBhbHdheXMgYmUgdGhlIHNhbWVcbiAgICAgICMgdGhpcyBhdm9pZHMgY291bnRpbmcgZ29hbHMgdHdpY2UgZm9yIHRoZSBzYW1lIHVzZXIgYWNyb3NzIGRpZmZlcmVudCBkZXZpY2VzXG4gICAgICB1dGlscy5zaGExKFwiI3tAbmFtZXNwYWNlfS4je2V4cGVyaW1lbnQubmFtZX0uI3tleHBlcmltZW50LnVzZXJfaWR9XCIpXG5cbiAgICBfdHJhY2s6IChleHBlcmltZW50LCB2YXJpYW50LCBnb2FsKSAtPlxuICAgICAgdXRpbHMubG9nKFwiUGVyc2lzdGVudCBRdWV1ZSBLZWVuIHRyYWNrOiAje2V4cGVyaW1lbnQubmFtZX0sICN7dmFyaWFudH0sICN7Z29hbC5uYW1lfVwiKVxuICAgICAgQF9xdWV1ZS5zaGlmdCgpIGlmIEBfcXVldWUubGVuZ3RoID4gMTAwXG4gICAgICBAX3F1ZXVlLnB1c2hcbiAgICAgICAgZXhwZXJpbWVudF9uYW1lOiBleHBlcmltZW50Lm5hbWVcbiAgICAgICAgcHJvcGVydGllczpcbiAgICAgICAgICBfcXV1aWQ6IHV0aWxzLnV1aWQoKSAgIyBxdWV1ZSB1dWlkICh1c2VkIG9ubHkgaW50ZXJuYWxseSlcbiAgICAgICAgICB1dWlkOiBAX3VzZXJfdXVpZChleHBlcmltZW50LCBnb2FsKVxuICAgICAgICAgIHZhcmlhbnQ6IHZhcmlhbnRcbiAgICAgICAgICBldmVudDogZ29hbC5uYW1lXG4gICAgICBAX3N0b3JhZ2Uuc2V0KEBxdWV1ZV9uYW1lLCBKU09OLnN0cmluZ2lmeShAX3F1ZXVlKSlcbiAgICAgIEBfZmx1c2goKVxuXG4gICAgZXhwZXJpbWVudF9zdGFydDogKGV4cGVyaW1lbnQsIHZhcmlhbnQpIC0+XG4gICAgICBAX3RyYWNrKGV4cGVyaW1lbnQsIHZhcmlhbnQsIHtuYW1lOiAncGFydGljaXBhdGUnLCB1bmlxdWU6IHRydWV9KVxuXG4gICAgZ29hbF9jb21wbGV0ZTogKGV4cGVyaW1lbnQsIHZhcmlhbnQsIGdvYWxfbmFtZSwgcHJvcHMpIC0+XG4gICAgICBAX3RyYWNrKGV4cGVyaW1lbnQsIHZhcmlhbnQsIHV0aWxzLmRlZmF1bHRzKHtuYW1lOiBnb2FsX25hbWV9LCBwcm9wcykpXG5cblxuICBjbGFzcyBAR29vZ2xlVW5pdmVyc2FsQW5hbHl0aWNzQWRhcHRlclxuICAgIEBuYW1lc3BhY2U6ICdhbGVwaGJldCdcblxuICAgIEBfdHJhY2s6IChjYXRlZ29yeSwgYWN0aW9uLCBsYWJlbCkgLT5cbiAgICAgIHV0aWxzLmxvZyhcIkdvb2dsZSBVbml2ZXJzYWwgQW5hbHl0aWNzIHRyYWNrOiAje2NhdGVnb3J5fSwgI3thY3Rpb259LCAje2xhYmVsfVwiKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdnYSBub3QgZGVmaW5lZC4gUGxlYXNlIG1ha2Ugc3VyZSB5b3VyIFVuaXZlcnNhbCBhbmFseXRpY3MgaXMgc2V0IHVwIGNvcnJlY3RseScpIGlmIHR5cGVvZiBnYSBpc250ICdmdW5jdGlvbidcbiAgICAgIGdhKCdzZW5kJywgJ2V2ZW50JywgY2F0ZWdvcnksIGFjdGlvbiwgbGFiZWwsIHsnbm9uSW50ZXJhY3Rpb24nOiAxfSlcblxuICAgIEBleHBlcmltZW50X3N0YXJ0OiAoZXhwZXJpbWVudCwgdmFyaWFudCkgLT5cbiAgICAgIEBfdHJhY2soQG5hbWVzcGFjZSwgXCIje2V4cGVyaW1lbnQubmFtZX0gfCAje3ZhcmlhbnR9XCIsICdWaXNpdG9ycycpXG5cbiAgICBAZ29hbF9jb21wbGV0ZTogKGV4cGVyaW1lbnQsIHZhcmlhbnQsIGdvYWxfbmFtZSwgX3Byb3BzKSAtPlxuICAgICAgQF90cmFjayhAbmFtZXNwYWNlLCBcIiN7ZXhwZXJpbWVudC5uYW1lfSB8ICN7dmFyaWFudH1cIiwgZ29hbF9uYW1lKVxuXG5cbiAgY2xhc3MgQExvY2FsU3RvcmFnZUFkYXB0ZXJcbiAgICBAbmFtZXNwYWNlOiAnYWxlcGhiZXQnXG4gICAgQHNldDogKGtleSwgdmFsdWUpIC0+XG4gICAgICBuZXcgU3RvcmFnZShAbmFtZXNwYWNlKS5zZXQoa2V5LCB2YWx1ZSlcbiAgICBAZ2V0OiAoa2V5KSAtPlxuICAgICAgbmV3IFN0b3JhZ2UoQG5hbWVzcGFjZSkuZ2V0KGtleSlcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEFkYXB0ZXJzXG4iLCJ1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKVxuYWRhcHRlcnMgPSByZXF1aXJlKCcuL2FkYXB0ZXJzJylcbm9wdGlvbnMgPSByZXF1aXJlKCcuL29wdGlvbnMnKVxuXG5jbGFzcyBBbGVwaEJldFxuICBAb3B0aW9ucyA9IG9wdGlvbnNcbiAgQHV0aWxzID0gdXRpbHNcblxuICBAR2ltZWxBZGFwdGVyID0gYWRhcHRlcnMuR2ltZWxBZGFwdGVyXG4gIEBMYW1lZEFkYXB0ZXIgPSBhZGFwdGVycy5MYW1lZEFkYXB0ZXJcbiAgQFJhaWxzQWRhcHRlciA9IGFkYXB0ZXJzLlJhaWxzQWRhcHRlclxuICBAUGVyc2lzdGVudFF1ZXVlR29vZ2xlQW5hbHl0aWNzQWRhcHRlciA9IGFkYXB0ZXJzLlBlcnNpc3RlbnRRdWV1ZUdvb2dsZUFuYWx5dGljc0FkYXB0ZXJcbiAgQFBlcnNpc3RlbnRRdWV1ZUtlZW5BZGFwdGVyID0gYWRhcHRlcnMuUGVyc2lzdGVudFF1ZXVlS2VlbkFkYXB0ZXJcblxuICBjbGFzcyBARXhwZXJpbWVudFxuICAgIEBfb3B0aW9uczpcbiAgICAgIG5hbWU6IG51bGxcbiAgICAgIHZhcmlhbnRzOiBudWxsXG4gICAgICB1c2VyX2lkOiBudWxsXG4gICAgICBzYW1wbGU6IDEuMFxuICAgICAgdHJpZ2dlcjogLT4gdHJ1ZVxuICAgICAgdHJhY2tpbmdfYWRhcHRlcjogYWRhcHRlcnMuR29vZ2xlVW5pdmVyc2FsQW5hbHl0aWNzQWRhcHRlclxuICAgICAgc3RvcmFnZV9hZGFwdGVyOiBhZGFwdGVycy5Mb2NhbFN0b3JhZ2VBZGFwdGVyXG5cbiAgICBjb25zdHJ1Y3RvcjogKEBvcHRpb25zPXt9KSAtPlxuICAgICAgdXRpbHMuZGVmYXVsdHMoQG9wdGlvbnMsIEV4cGVyaW1lbnQuX29wdGlvbnMpXG4gICAgICBfdmFsaWRhdGUuY2FsbCh0aGlzKVxuICAgICAgQG5hbWUgPSBAb3B0aW9ucy5uYW1lXG4gICAgICBAdmFyaWFudHMgPSBAb3B0aW9ucy52YXJpYW50c1xuICAgICAgQHVzZXJfaWQgPSBAb3B0aW9ucy51c2VyX2lkXG4gICAgICBAdmFyaWFudF9uYW1lcyA9IHV0aWxzLmtleXMoQHZhcmlhbnRzKVxuICAgICAgX3J1bi5jYWxsKHRoaXMpXG5cbiAgICBydW46IC0+XG4gICAgICB1dGlscy5sb2coXCJydW5uaW5nIHdpdGggb3B0aW9uczogI3tKU09OLnN0cmluZ2lmeShAb3B0aW9ucyl9XCIpXG4gICAgICBpZiB2YXJpYW50ID0gQGdldF9zdG9yZWRfdmFyaWFudCgpXG4gICAgICAgICMgYSB2YXJpYW50IHdhcyBhbHJlYWR5IGNob3Nlbi4gYWN0aXZhdGUgaXRcbiAgICAgICAgdXRpbHMubG9nKFwiI3t2YXJpYW50fSBhY3RpdmVcIilcbiAgICAgICAgQGFjdGl2YXRlX3ZhcmlhbnQodmFyaWFudClcbiAgICAgIGVsc2VcbiAgICAgICAgQGNvbmRpdGlvbmFsbHlfYWN0aXZhdGVfdmFyaWFudCgpXG5cbiAgICBfcnVuID0gLT4gQHJ1bigpXG5cbiAgICBhY3RpdmF0ZV92YXJpYW50OiAodmFyaWFudCkgLT5cbiAgICAgIEB2YXJpYW50c1t2YXJpYW50XT8uYWN0aXZhdGUodGhpcylcbiAgICAgIEBzdG9yYWdlKCkuc2V0KFwiI3tAb3B0aW9ucy5uYW1lfTp2YXJpYW50XCIsIHZhcmlhbnQpXG5cbiAgICAjIGlmIGV4cGVyaW1lbnQgY29uZGl0aW9ucyBtYXRjaCwgcGljayBhbmQgYWN0aXZhdGUgYSB2YXJpYW50LCB0cmFjayBleHBlcmltZW50IHN0YXJ0XG4gICAgY29uZGl0aW9uYWxseV9hY3RpdmF0ZV92YXJpYW50OiAtPlxuICAgICAgcmV0dXJuIHVubGVzcyBAb3B0aW9ucy50cmlnZ2VyKClcbiAgICAgIHV0aWxzLmxvZygndHJpZ2dlciBzZXQnKVxuICAgICAgcmV0dXJuIHVubGVzcyBAaW5fc2FtcGxlKClcbiAgICAgIHV0aWxzLmxvZygnaW4gc2FtcGxlJylcbiAgICAgIHZhcmlhbnQgPSBAcGlja192YXJpYW50KClcbiAgICAgIEB0cmFja2luZygpLmV4cGVyaW1lbnRfc3RhcnQodGhpcywgdmFyaWFudClcbiAgICAgIEBhY3RpdmF0ZV92YXJpYW50KHZhcmlhbnQpXG5cbiAgICBnb2FsX2NvbXBsZXRlOiAoZ29hbF9uYW1lLCBwcm9wcz17fSkgLT5cbiAgICAgIHV0aWxzLmRlZmF1bHRzKHByb3BzLCB7dW5pcXVlOiB0cnVlfSlcbiAgICAgIHJldHVybiBpZiBwcm9wcy51bmlxdWUgJiYgQHN0b3JhZ2UoKS5nZXQoXCIje0BvcHRpb25zLm5hbWV9OiN7Z29hbF9uYW1lfVwiKVxuICAgICAgdmFyaWFudCA9IEBnZXRfc3RvcmVkX3ZhcmlhbnQoKVxuICAgICAgcmV0dXJuIHVubGVzcyB2YXJpYW50XG4gICAgICBAc3RvcmFnZSgpLnNldChcIiN7QG9wdGlvbnMubmFtZX06I3tnb2FsX25hbWV9XCIsIHRydWUpIGlmIHByb3BzLnVuaXF1ZVxuICAgICAgdXRpbHMubG9nKFwiZXhwZXJpbWVudDogI3tAb3B0aW9ucy5uYW1lfSB2YXJpYW50OiN7dmFyaWFudH0gZ29hbDoje2dvYWxfbmFtZX0gY29tcGxldGVcIilcbiAgICAgIEB0cmFja2luZygpLmdvYWxfY29tcGxldGUodGhpcywgdmFyaWFudCwgZ29hbF9uYW1lLCBwcm9wcylcblxuICAgIGdldF9zdG9yZWRfdmFyaWFudDogLT5cbiAgICAgIEBzdG9yYWdlKCkuZ2V0KFwiI3tAb3B0aW9ucy5uYW1lfTp2YXJpYW50XCIpXG5cbiAgICBwaWNrX3ZhcmlhbnQ6IC0+XG4gICAgICBhbGxfdmFyaWFudHNfaGF2ZV93ZWlnaHRzID0gdXRpbHMuY2hlY2tfd2VpZ2h0cyhAdmFyaWFudHMpXG4gICAgICB1dGlscy5sb2coXCJhbGwgdmFyaWFudHMgaGF2ZSB3ZWlnaHRzOiAje2FsbF92YXJpYW50c19oYXZlX3dlaWdodHN9XCIpXG4gICAgICBpZiBhbGxfdmFyaWFudHNfaGF2ZV93ZWlnaHRzIHRoZW4gQHBpY2tfd2VpZ2h0ZWRfdmFyaWFudCgpIGVsc2UgQHBpY2tfdW53ZWlnaHRlZF92YXJpYW50KClcblxuICAgIHBpY2tfd2VpZ2h0ZWRfdmFyaWFudDogLT5cblxuICAgICAgIyBDaG9vc2luZyBhIHdlaWdodGVkIHZhcmlhbnQ6XG4gICAgICAjIEZvciBBLCBCLCBDIHdpdGggd2VpZ2h0cyAxLCAzLCA2XG4gICAgICAjIHZhcmlhbnRzID0gQSwgQiwgQ1xuICAgICAgIyB3ZWlnaHRzID0gMSwgMywgNlxuICAgICAgIyB3ZWlnaHRzX3N1bSA9IDEwIChzdW0gb2Ygd2VpZ2h0cylcbiAgICAgICMgd2VpZ2h0ZWRfaW5kZXggPSAyLjEgKHJhbmRvbSBudW1iZXIgYmV0d2VlbiAwIGFuZCB3ZWlnaHQgc3VtKVxuICAgICAgIyBBQkJCQ0NDQ0NDXG4gICAgICAjID09XlxuICAgICAgIyBTZWxlY3QgQlxuICAgICAgd2VpZ2h0c19zdW0gPSB1dGlscy5zdW1fd2VpZ2h0cyhAdmFyaWFudHMpXG4gICAgICB3ZWlnaHRlZF9pbmRleCA9IE1hdGguY2VpbCgoQF9yYW5kb20oJ3ZhcmlhbnQnKSAqIHdlaWdodHNfc3VtKSlcbiAgICAgIGZvciBrZXksIHZhbHVlIG9mIEB2YXJpYW50c1xuICAgICAgICAjIHRoZW4gd2UgYXJlIHN1YnN0cmFjdGluZyB2YXJpYW50IHdlaWdodCBmcm9tIHNlbGVjdGVkIG51bWJlclxuICAgICAgICAjIGFuZCBpdCBpdCByZWFjaGVzIDAgKG9yIGJlbG93KSB3ZSBhcmUgc2VsZWN0aW5nIHRoaXMgdmFyaWFudFxuICAgICAgICB3ZWlnaHRlZF9pbmRleCAtPSB2YWx1ZS53ZWlnaHRcbiAgICAgICAgcmV0dXJuIGtleSBpZiB3ZWlnaHRlZF9pbmRleCA8PSAwXG5cbiAgICBwaWNrX3Vud2VpZ2h0ZWRfdmFyaWFudDogLT5cbiAgICAgIHBhcnRpdGlvbnMgPSAxLjAgLyBAdmFyaWFudF9uYW1lcy5sZW5ndGhcbiAgICAgIGNob3Nlbl9wYXJ0aXRpb24gPSBNYXRoLmZsb29yKEBfcmFuZG9tKCd2YXJpYW50JykgLyBwYXJ0aXRpb25zKVxuICAgICAgdmFyaWFudCA9IEB2YXJpYW50X25hbWVzW2Nob3Nlbl9wYXJ0aXRpb25dXG4gICAgICB1dGlscy5sb2coXCIje3ZhcmlhbnR9IHBpY2tlZFwiKVxuICAgICAgdmFyaWFudFxuXG4gICAgaW5fc2FtcGxlOiAtPlxuICAgICAgYWN0aXZlID0gQHN0b3JhZ2UoKS5nZXQoXCIje0BvcHRpb25zLm5hbWV9OmluX3NhbXBsZVwiKVxuICAgICAgcmV0dXJuIGFjdGl2ZSB1bmxlc3MgdHlwZW9mIGFjdGl2ZSBpcyAndW5kZWZpbmVkJ1xuICAgICAgYWN0aXZlID0gQF9yYW5kb20oJ3NhbXBsZScpIDw9IEBvcHRpb25zLnNhbXBsZVxuICAgICAgQHN0b3JhZ2UoKS5zZXQoXCIje0BvcHRpb25zLm5hbWV9OmluX3NhbXBsZVwiLCBhY3RpdmUpXG4gICAgICBhY3RpdmVcblxuICAgIF9yYW5kb206IChzYWx0KSAtPlxuICAgICAgcmV0dXJuIHV0aWxzLnJhbmRvbSgpIHVubGVzcyBAdXNlcl9pZFxuICAgICAgc2VlZCA9IFwiI3tAbmFtZX0uI3tzYWx0fS4je0B1c2VyX2lkfVwiXG4gICAgICB1dGlscy5yYW5kb20oc2VlZClcblxuICAgIGFkZF9nb2FsOiAoZ29hbCkgLT5cbiAgICAgIGdvYWwuYWRkX2V4cGVyaW1lbnQodGhpcylcblxuICAgIGFkZF9nb2FsczogKGdvYWxzKSAtPlxuICAgICAgQGFkZF9nb2FsKGdvYWwpIGZvciBnb2FsIGluIGdvYWxzXG5cbiAgICBzdG9yYWdlOiAtPiBAb3B0aW9ucy5zdG9yYWdlX2FkYXB0ZXJcblxuICAgIHRyYWNraW5nOiAtPiBAb3B0aW9ucy50cmFja2luZ19hZGFwdGVyXG5cbiAgICBfdmFsaWRhdGUgPSAtPlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdhbiBleHBlcmltZW50IG5hbWUgbXVzdCBiZSBzcGVjaWZpZWQnKSBpZiBAb3B0aW9ucy5uYW1lIGlzIG51bGxcbiAgICAgIHRocm93IG5ldyBFcnJvcigndmFyaWFudHMgbXVzdCBiZSBwcm92aWRlZCcpIGlmIEBvcHRpb25zLnZhcmlhbnRzIGlzIG51bGxcbiAgICAgIHRocm93IG5ldyBFcnJvcigndHJpZ2dlciBtdXN0IGJlIGEgZnVuY3Rpb24nKSBpZiB0eXBlb2YgQG9wdGlvbnMudHJpZ2dlciBpc250ICdmdW5jdGlvbidcbiAgICAgIGFsbF92YXJpYW50c19oYXZlX3dlaWdodHMgPSB1dGlscy52YWxpZGF0ZV93ZWlnaHRzIEBvcHRpb25zLnZhcmlhbnRzXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ25vdCBhbGwgdmFyaWFudHMgaGF2ZSB3ZWlnaHRzJykgaWYgIWFsbF92YXJpYW50c19oYXZlX3dlaWdodHNcblxuICBjbGFzcyBAR29hbFxuICAgIGNvbnN0cnVjdG9yOiAoQG5hbWUsIEBwcm9wcz17fSkgLT5cbiAgICAgIHV0aWxzLmRlZmF1bHRzKEBwcm9wcywge3VuaXF1ZTogdHJ1ZX0pXG4gICAgICBAZXhwZXJpbWVudHMgPSBbXVxuXG4gICAgYWRkX2V4cGVyaW1lbnQ6IChleHBlcmltZW50KSAtPlxuICAgICAgQGV4cGVyaW1lbnRzLnB1c2goZXhwZXJpbWVudClcblxuICAgIGFkZF9leHBlcmltZW50czogKGV4cGVyaW1lbnRzKSAtPlxuICAgICAgQGFkZF9leHBlcmltZW50KGV4cGVyaW1lbnQpIGZvciBleHBlcmltZW50IGluIGV4cGVyaW1lbnRzXG5cbiAgICBjb21wbGV0ZTogLT5cbiAgICAgIGZvciBleHBlcmltZW50IGluIEBleHBlcmltZW50c1xuICAgICAgICBleHBlcmltZW50LmdvYWxfY29tcGxldGUoQG5hbWUsIEBwcm9wcylcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEFsZXBoQmV0XG4iLCJtb2R1bGUuZXhwb3J0cyA9XG4gIGRlYnVnOiBmYWxzZVxuIiwiQmFzaWwgPSByZXF1aXJlKCdiYXNpbC5qcycpXG5zdG9yZSA9IG5ldyBCYXNpbChuYW1lc3BhY2U6IG51bGwpXG5cbiMgYSB0aGluIHdyYXBwZXIgYXJvdW5kIGJhc2lsLmpzIGZvciBlYXN5IHN3YXBwaW5nXG5jbGFzcyBTdG9yYWdlXG4gIGNvbnN0cnVjdG9yOiAoQG5hbWVzcGFjZT0nYWxlcGhiZXQnKSAtPlxuICAgIEBzdG9yYWdlID0gc3RvcmUuZ2V0KEBuYW1lc3BhY2UpIHx8IHt9XG4gIHNldDogKGtleSwgdmFsdWUpIC0+XG4gICAgQHN0b3JhZ2Vba2V5XSA9IHZhbHVlXG4gICAgc3RvcmUuc2V0KEBuYW1lc3BhY2UsIEBzdG9yYWdlKVxuICAgIHJldHVybiB2YWx1ZVxuICBnZXQ6IChrZXkpIC0+XG4gICAgQHN0b3JhZ2Vba2V5XVxuICAgICMgc3RvcmUuZ2V0KFwiI3tAbmFtZXNwYWNlfToje2tleX1cIilcblxubW9kdWxlLmV4cG9ydHMgPSBTdG9yYWdlXG4iLCJpbXBvcnQge3Y0fSBmcm9tICd1dWlkJ1xuXG5zaGExID0gcmVxdWlyZSgnc2hhMScpXG5vcHRpb25zID0gcmVxdWlyZSgnLi9vcHRpb25zJylcblxuY2xhc3MgVXRpbHNcbiAgQGRlZmF1bHRzOiAob2JqLCBkZWZhdWx0cykgLT5cbiAgICBmb3Iga2V5LCB2YWx1ZSBvZiBkZWZhdWx0c1xuICAgICAgaWYgb2JqW2tleV0gPT0gdW5kZWZpbmVkXG4gICAgICAgIG9ialtrZXldID0gdmFsdWVcbiAgICByZXR1cm4gb2JqXG4gIEBrZXlzOiBPYmplY3Qua2V5c1xuICBAcmVtb3ZlOiAobGlzdCwgY2FsbGJhY2spIC0+XG4gICAgZGVsZXRpb25zID0gW11cbiAgICBmb3IgZWwsIGluZGV4IGluIFsuLi5saXN0XVxuICAgICAgaWYgY2FsbGJhY2soZWwsIGluZGV4KVxuICAgICAgICBsaXN0LnNwbGljZShsaXN0LmluZGV4T2YoZWwpLCAxKVxuICAgICAgICBkZWxldGlvbnMucHVzaChlbClcbiAgICByZXR1cm4gZGVsZXRpb25zXG4gIEBvbWl0OiAob2JqLCAuLi5rZXlzKSAtPlxuICAgIHJlc3VsdHMgPSB7Li4ub2JqfVxuICAgIGZvciBrZXkgaW4gW10uY29uY2F0LmFwcGx5KFtdLCBrZXlzKVxuICAgICAgZGVsZXRlIHJlc3VsdHNba2V5XVxuICAgIHJldHVybiByZXN1bHRzXG4gIEBsb2c6IChtZXNzYWdlKSAtPlxuICAgIGNvbnNvbGUubG9nKG1lc3NhZ2UpIGlmIG9wdGlvbnMuZGVidWdcbiAgQHV1aWQ6IHY0XG4gIEBzaGExOiAodGV4dCkgLT5cbiAgICBzaGExKHRleHQpLnRvU3RyaW5nKClcbiAgQHJhbmRvbTogKHNlZWQpIC0+XG4gICAgcmV0dXJuIE1hdGgucmFuZG9tKCkgdW5sZXNzIHNlZWRcbiAgICAjIGEgTVVDSCBzaW1wbGlmaWVkIHZlcnNpb24gaW5zcGlyZWQgYnkgUGxhbk91dC5qc1xuICAgIHBhcnNlSW50KEBzaGExKHNlZWQpLnN1YnN0cigwLCAxMyksIDE2KSAvIDB4RkZGRkZGRkZGRkZGRlxuICBAY2hlY2tfd2VpZ2h0czogKHZhcmlhbnRzKSAtPlxuICAgIGNvbnRhaW5zX3dlaWdodCA9IFtdXG4gICAgY29udGFpbnNfd2VpZ2h0LnB1c2godmFsdWUud2VpZ2h0PykgZm9yIGtleSwgdmFsdWUgb2YgdmFyaWFudHNcbiAgICBjb250YWluc193ZWlnaHQuZXZlcnkgKGhhc193ZWlnaHQpIC0+IGhhc193ZWlnaHRcbiAgQHN1bV93ZWlnaHRzOiAodmFyaWFudHMpIC0+XG4gICAgc3VtID0gMFxuICAgIGZvciBrZXksIHZhbHVlIG9mIHZhcmlhbnRzXG4gICAgICBzdW0gKz0gdmFsdWUud2VpZ2h0IHx8IDBcbiAgICBzdW1cbiAgQHZhbGlkYXRlX3dlaWdodHM6ICh2YXJpYW50cykgLT5cbiAgICBjb250YWluc193ZWlnaHQgPSBbXVxuICAgIGNvbnRhaW5zX3dlaWdodC5wdXNoKHZhbHVlLndlaWdodD8pIGZvciBrZXksIHZhbHVlIG9mIHZhcmlhbnRzXG4gICAgY29udGFpbnNfd2VpZ2h0LmV2ZXJ5IChoYXNfd2VpZ2h0KSAtPiBoYXNfd2VpZ2h0IG9yIGNvbnRhaW5zX3dlaWdodC5ldmVyeSAoaGFzX3dlaWdodCkgLT4gIWhhc193ZWlnaHRcbm1vZHVsZS5leHBvcnRzID0gVXRpbHNcbiIsIihmdW5jdGlvbigpIHtcbiAgdmFyIGJhc2U2NG1hcFxuICAgICAgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLycsXG5cbiAgY3J5cHQgPSB7XG4gICAgLy8gQml0LXdpc2Ugcm90YXRpb24gbGVmdFxuICAgIHJvdGw6IGZ1bmN0aW9uKG4sIGIpIHtcbiAgICAgIHJldHVybiAobiA8PCBiKSB8IChuID4+PiAoMzIgLSBiKSk7XG4gICAgfSxcblxuICAgIC8vIEJpdC13aXNlIHJvdGF0aW9uIHJpZ2h0XG4gICAgcm90cjogZnVuY3Rpb24obiwgYikge1xuICAgICAgcmV0dXJuIChuIDw8ICgzMiAtIGIpKSB8IChuID4+PiBiKTtcbiAgICB9LFxuXG4gICAgLy8gU3dhcCBiaWctZW5kaWFuIHRvIGxpdHRsZS1lbmRpYW4gYW5kIHZpY2UgdmVyc2FcbiAgICBlbmRpYW46IGZ1bmN0aW9uKG4pIHtcbiAgICAgIC8vIElmIG51bWJlciBnaXZlbiwgc3dhcCBlbmRpYW5cbiAgICAgIGlmIChuLmNvbnN0cnVjdG9yID09IE51bWJlcikge1xuICAgICAgICByZXR1cm4gY3J5cHQucm90bChuLCA4KSAmIDB4MDBGRjAwRkYgfCBjcnlwdC5yb3RsKG4sIDI0KSAmIDB4RkYwMEZGMDA7XG4gICAgICB9XG5cbiAgICAgIC8vIEVsc2UsIGFzc3VtZSBhcnJheSBhbmQgc3dhcCBhbGwgaXRlbXNcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbi5sZW5ndGg7IGkrKylcbiAgICAgICAgbltpXSA9IGNyeXB0LmVuZGlhbihuW2ldKTtcbiAgICAgIHJldHVybiBuO1xuICAgIH0sXG5cbiAgICAvLyBHZW5lcmF0ZSBhbiBhcnJheSBvZiBhbnkgbGVuZ3RoIG9mIHJhbmRvbSBieXRlc1xuICAgIHJhbmRvbUJ5dGVzOiBmdW5jdGlvbihuKSB7XG4gICAgICBmb3IgKHZhciBieXRlcyA9IFtdOyBuID4gMDsgbi0tKVxuICAgICAgICBieXRlcy5wdXNoKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDI1NikpO1xuICAgICAgcmV0dXJuIGJ5dGVzO1xuICAgIH0sXG5cbiAgICAvLyBDb252ZXJ0IGEgYnl0ZSBhcnJheSB0byBiaWctZW5kaWFuIDMyLWJpdCB3b3Jkc1xuICAgIGJ5dGVzVG9Xb3JkczogZnVuY3Rpb24oYnl0ZXMpIHtcbiAgICAgIGZvciAodmFyIHdvcmRzID0gW10sIGkgPSAwLCBiID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSsrLCBiICs9IDgpXG4gICAgICAgIHdvcmRzW2IgPj4+IDVdIHw9IGJ5dGVzW2ldIDw8ICgyNCAtIGIgJSAzMik7XG4gICAgICByZXR1cm4gd29yZHM7XG4gICAgfSxcblxuICAgIC8vIENvbnZlcnQgYmlnLWVuZGlhbiAzMi1iaXQgd29yZHMgdG8gYSBieXRlIGFycmF5XG4gICAgd29yZHNUb0J5dGVzOiBmdW5jdGlvbih3b3Jkcykge1xuICAgICAgZm9yICh2YXIgYnl0ZXMgPSBbXSwgYiA9IDA7IGIgPCB3b3Jkcy5sZW5ndGggKiAzMjsgYiArPSA4KVxuICAgICAgICBieXRlcy5wdXNoKCh3b3Jkc1tiID4+PiA1XSA+Pj4gKDI0IC0gYiAlIDMyKSkgJiAweEZGKTtcbiAgICAgIHJldHVybiBieXRlcztcbiAgICB9LFxuXG4gICAgLy8gQ29udmVydCBhIGJ5dGUgYXJyYXkgdG8gYSBoZXggc3RyaW5nXG4gICAgYnl0ZXNUb0hleDogZnVuY3Rpb24oYnl0ZXMpIHtcbiAgICAgIGZvciAodmFyIGhleCA9IFtdLCBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGhleC5wdXNoKChieXRlc1tpXSA+Pj4gNCkudG9TdHJpbmcoMTYpKTtcbiAgICAgICAgaGV4LnB1c2goKGJ5dGVzW2ldICYgMHhGKS50b1N0cmluZygxNikpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGhleC5qb2luKCcnKTtcbiAgICB9LFxuXG4gICAgLy8gQ29udmVydCBhIGhleCBzdHJpbmcgdG8gYSBieXRlIGFycmF5XG4gICAgaGV4VG9CeXRlczogZnVuY3Rpb24oaGV4KSB7XG4gICAgICBmb3IgKHZhciBieXRlcyA9IFtdLCBjID0gMDsgYyA8IGhleC5sZW5ndGg7IGMgKz0gMilcbiAgICAgICAgYnl0ZXMucHVzaChwYXJzZUludChoZXguc3Vic3RyKGMsIDIpLCAxNikpO1xuICAgICAgcmV0dXJuIGJ5dGVzO1xuICAgIH0sXG5cbiAgICAvLyBDb252ZXJ0IGEgYnl0ZSBhcnJheSB0byBhIGJhc2UtNjQgc3RyaW5nXG4gICAgYnl0ZXNUb0Jhc2U2NDogZnVuY3Rpb24oYnl0ZXMpIHtcbiAgICAgIGZvciAodmFyIGJhc2U2NCA9IFtdLCBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSArPSAzKSB7XG4gICAgICAgIHZhciB0cmlwbGV0ID0gKGJ5dGVzW2ldIDw8IDE2KSB8IChieXRlc1tpICsgMV0gPDwgOCkgfCBieXRlc1tpICsgMl07XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgNDsgaisrKVxuICAgICAgICAgIGlmIChpICogOCArIGogKiA2IDw9IGJ5dGVzLmxlbmd0aCAqIDgpXG4gICAgICAgICAgICBiYXNlNjQucHVzaChiYXNlNjRtYXAuY2hhckF0KCh0cmlwbGV0ID4+PiA2ICogKDMgLSBqKSkgJiAweDNGKSk7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgYmFzZTY0LnB1c2goJz0nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBiYXNlNjQuam9pbignJyk7XG4gICAgfSxcblxuICAgIC8vIENvbnZlcnQgYSBiYXNlLTY0IHN0cmluZyB0byBhIGJ5dGUgYXJyYXlcbiAgICBiYXNlNjRUb0J5dGVzOiBmdW5jdGlvbihiYXNlNjQpIHtcbiAgICAgIC8vIFJlbW92ZSBub24tYmFzZS02NCBjaGFyYWN0ZXJzXG4gICAgICBiYXNlNjQgPSBiYXNlNjQucmVwbGFjZSgvW15BLVowLTkrXFwvXS9pZywgJycpO1xuXG4gICAgICBmb3IgKHZhciBieXRlcyA9IFtdLCBpID0gMCwgaW1vZDQgPSAwOyBpIDwgYmFzZTY0Lmxlbmd0aDtcbiAgICAgICAgICBpbW9kNCA9ICsraSAlIDQpIHtcbiAgICAgICAgaWYgKGltb2Q0ID09IDApIGNvbnRpbnVlO1xuICAgICAgICBieXRlcy5wdXNoKCgoYmFzZTY0bWFwLmluZGV4T2YoYmFzZTY0LmNoYXJBdChpIC0gMSkpXG4gICAgICAgICAgICAmIChNYXRoLnBvdygyLCAtMiAqIGltb2Q0ICsgOCkgLSAxKSkgPDwgKGltb2Q0ICogMikpXG4gICAgICAgICAgICB8IChiYXNlNjRtYXAuaW5kZXhPZihiYXNlNjQuY2hhckF0KGkpKSA+Pj4gKDYgLSBpbW9kNCAqIDIpKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYnl0ZXM7XG4gICAgfVxuICB9O1xuXG4gIG1vZHVsZS5leHBvcnRzID0gY3J5cHQ7XG59KSgpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgY3J5cHQgPSByZXF1aXJlKCdjcnlwdCcpLFxuICAgICAgdXRmOCA9IHJlcXVpcmUoJ2NoYXJlbmMnKS51dGY4LFxuICAgICAgYmluID0gcmVxdWlyZSgnY2hhcmVuYycpLmJpbixcblxuICAvLyBUaGUgY29yZVxuICBzaGExID0gZnVuY3Rpb24gKG1lc3NhZ2UpIHtcbiAgICAvLyBDb252ZXJ0IHRvIGJ5dGUgYXJyYXlcbiAgICBpZiAobWVzc2FnZS5jb25zdHJ1Y3RvciA9PSBTdHJpbmcpXG4gICAgICBtZXNzYWdlID0gdXRmOC5zdHJpbmdUb0J5dGVzKG1lc3NhZ2UpO1xuICAgIGVsc2UgaWYgKHR5cGVvZiBCdWZmZXIgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBCdWZmZXIuaXNCdWZmZXIgPT0gJ2Z1bmN0aW9uJyAmJiBCdWZmZXIuaXNCdWZmZXIobWVzc2FnZSkpXG4gICAgICBtZXNzYWdlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwobWVzc2FnZSwgMCk7XG4gICAgZWxzZSBpZiAoIUFycmF5LmlzQXJyYXkobWVzc2FnZSkpXG4gICAgICBtZXNzYWdlID0gbWVzc2FnZS50b1N0cmluZygpO1xuXG4gICAgLy8gb3RoZXJ3aXNlIGFzc3VtZSBieXRlIGFycmF5XG5cbiAgICB2YXIgbSAgPSBjcnlwdC5ieXRlc1RvV29yZHMobWVzc2FnZSksXG4gICAgICAgIGwgID0gbWVzc2FnZS5sZW5ndGggKiA4LFxuICAgICAgICB3ICA9IFtdLFxuICAgICAgICBIMCA9ICAxNzMyNTg0MTkzLFxuICAgICAgICBIMSA9IC0yNzE3MzM4NzksXG4gICAgICAgIEgyID0gLTE3MzI1ODQxOTQsXG4gICAgICAgIEgzID0gIDI3MTczMzg3OCxcbiAgICAgICAgSDQgPSAtMTAwOTU4OTc3NjtcblxuICAgIC8vIFBhZGRpbmdcbiAgICBtW2wgPj4gNV0gfD0gMHg4MCA8PCAoMjQgLSBsICUgMzIpO1xuICAgIG1bKChsICsgNjQgPj4+IDkpIDw8IDQpICsgMTVdID0gbDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbS5sZW5ndGg7IGkgKz0gMTYpIHtcbiAgICAgIHZhciBhID0gSDAsXG4gICAgICAgICAgYiA9IEgxLFxuICAgICAgICAgIGMgPSBIMixcbiAgICAgICAgICBkID0gSDMsXG4gICAgICAgICAgZSA9IEg0O1xuXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IDgwOyBqKyspIHtcblxuICAgICAgICBpZiAoaiA8IDE2KVxuICAgICAgICAgIHdbal0gPSBtW2kgKyBqXTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgdmFyIG4gPSB3W2ogLSAzXSBeIHdbaiAtIDhdIF4gd1tqIC0gMTRdIF4gd1tqIC0gMTZdO1xuICAgICAgICAgIHdbal0gPSAobiA8PCAxKSB8IChuID4+PiAzMSk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdCA9ICgoSDAgPDwgNSkgfCAoSDAgPj4+IDI3KSkgKyBINCArICh3W2pdID4+PiAwKSArIChcbiAgICAgICAgICAgICAgICBqIDwgMjAgPyAoSDEgJiBIMiB8IH5IMSAmIEgzKSArIDE1MTg1MDAyNDkgOlxuICAgICAgICAgICAgICAgIGogPCA0MCA/IChIMSBeIEgyIF4gSDMpICsgMTg1OTc3NTM5MyA6XG4gICAgICAgICAgICAgICAgaiA8IDYwID8gKEgxICYgSDIgfCBIMSAmIEgzIHwgSDIgJiBIMykgLSAxODk0MDA3NTg4IDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAoSDEgXiBIMiBeIEgzKSAtIDg5OTQ5NzUxNCk7XG5cbiAgICAgICAgSDQgPSBIMztcbiAgICAgICAgSDMgPSBIMjtcbiAgICAgICAgSDIgPSAoSDEgPDwgMzApIHwgKEgxID4+PiAyKTtcbiAgICAgICAgSDEgPSBIMDtcbiAgICAgICAgSDAgPSB0O1xuICAgICAgfVxuXG4gICAgICBIMCArPSBhO1xuICAgICAgSDEgKz0gYjtcbiAgICAgIEgyICs9IGM7XG4gICAgICBIMyArPSBkO1xuICAgICAgSDQgKz0gZTtcbiAgICB9XG5cbiAgICByZXR1cm4gW0gwLCBIMSwgSDIsIEgzLCBINF07XG4gIH0sXG5cbiAgLy8gUHVibGljIEFQSVxuICBhcGkgPSBmdW5jdGlvbiAobWVzc2FnZSwgb3B0aW9ucykge1xuICAgIHZhciBkaWdlc3RieXRlcyA9IGNyeXB0LndvcmRzVG9CeXRlcyhzaGExKG1lc3NhZ2UpKTtcbiAgICByZXR1cm4gb3B0aW9ucyAmJiBvcHRpb25zLmFzQnl0ZXMgPyBkaWdlc3RieXRlcyA6XG4gICAgICAgIG9wdGlvbnMgJiYgb3B0aW9ucy5hc1N0cmluZyA/IGJpbi5ieXRlc1RvU3RyaW5nKGRpZ2VzdGJ5dGVzKSA6XG4gICAgICAgIGNyeXB0LmJ5dGVzVG9IZXgoZGlnZXN0Ynl0ZXMpO1xuICB9O1xuXG4gIGFwaS5fYmxvY2tzaXplID0gMTY7XG4gIGFwaS5fZGlnZXN0c2l6ZSA9IDIwO1xuXG4gIG1vZHVsZS5leHBvcnRzID0gYXBpO1xufSkoKTtcbiIsImV4cG9ydCBkZWZhdWx0IC9eKD86WzAtOWEtZl17OH0tWzAtOWEtZl17NH0tWzEtNV1bMC05YS1mXXszfS1bODlhYl1bMC05YS1mXXszfS1bMC05YS1mXXsxMn18MDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAwKSQvaTsiLCIvLyBVbmlxdWUgSUQgY3JlYXRpb24gcmVxdWlyZXMgYSBoaWdoIHF1YWxpdHkgcmFuZG9tICMgZ2VuZXJhdG9yLiBJbiB0aGUgYnJvd3NlciB3ZSB0aGVyZWZvcmVcbi8vIHJlcXVpcmUgdGhlIGNyeXB0byBBUEkgYW5kIGRvIG5vdCBzdXBwb3J0IGJ1aWx0LWluIGZhbGxiYWNrIHRvIGxvd2VyIHF1YWxpdHkgcmFuZG9tIG51bWJlclxuLy8gZ2VuZXJhdG9ycyAobGlrZSBNYXRoLnJhbmRvbSgpKS5cbi8vIGdldFJhbmRvbVZhbHVlcyBuZWVkcyB0byBiZSBpbnZva2VkIGluIGEgY29udGV4dCB3aGVyZSBcInRoaXNcIiBpcyBhIENyeXB0byBpbXBsZW1lbnRhdGlvbi4gQWxzbyxcbi8vIGZpbmQgdGhlIGNvbXBsZXRlIGltcGxlbWVudGF0aW9uIG9mIGNyeXB0byAobXNDcnlwdG8pIG9uIElFMTEuXG52YXIgZ2V0UmFuZG9tVmFsdWVzID0gdHlwZW9mIGNyeXB0byAhPT0gJ3VuZGVmaW5lZCcgJiYgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyAmJiBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzLmJpbmQoY3J5cHRvKSB8fCB0eXBlb2YgbXNDcnlwdG8gIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBtc0NyeXB0by5nZXRSYW5kb21WYWx1ZXMgPT09ICdmdW5jdGlvbicgJiYgbXNDcnlwdG8uZ2V0UmFuZG9tVmFsdWVzLmJpbmQobXNDcnlwdG8pO1xudmFyIHJuZHM4ID0gbmV3IFVpbnQ4QXJyYXkoMTYpO1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcm5nKCkge1xuICBpZiAoIWdldFJhbmRvbVZhbHVlcykge1xuICAgIHRocm93IG5ldyBFcnJvcignY3J5cHRvLmdldFJhbmRvbVZhbHVlcygpIG5vdCBzdXBwb3J0ZWQuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vdXVpZGpzL3V1aWQjZ2V0cmFuZG9tdmFsdWVzLW5vdC1zdXBwb3J0ZWQnKTtcbiAgfVxuXG4gIHJldHVybiBnZXRSYW5kb21WYWx1ZXMocm5kczgpO1xufSIsImltcG9ydCB2YWxpZGF0ZSBmcm9tICcuL3ZhbGlkYXRlLmpzJztcbi8qKlxuICogQ29udmVydCBhcnJheSBvZiAxNiBieXRlIHZhbHVlcyB0byBVVUlEIHN0cmluZyBmb3JtYXQgb2YgdGhlIGZvcm06XG4gKiBYWFhYWFhYWC1YWFhYLVhYWFgtWFhYWC1YWFhYWFhYWFhYWFhcbiAqL1xuXG52YXIgYnl0ZVRvSGV4ID0gW107XG5cbmZvciAodmFyIGkgPSAwOyBpIDwgMjU2OyArK2kpIHtcbiAgYnl0ZVRvSGV4LnB1c2goKGkgKyAweDEwMCkudG9TdHJpbmcoMTYpLnN1YnN0cigxKSk7XG59XG5cbmZ1bmN0aW9uIHN0cmluZ2lmeShhcnIpIHtcbiAgdmFyIG9mZnNldCA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogMDtcbiAgLy8gTm90ZTogQmUgY2FyZWZ1bCBlZGl0aW5nIHRoaXMgY29kZSEgIEl0J3MgYmVlbiB0dW5lZCBmb3IgcGVyZm9ybWFuY2VcbiAgLy8gYW5kIHdvcmtzIGluIHdheXMgeW91IG1heSBub3QgZXhwZWN0LiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3V1aWRqcy91dWlkL3B1bGwvNDM0XG4gIHZhciB1dWlkID0gKGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgMF1dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyAxXV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDJdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgM11dICsgJy0nICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyA0XV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDVdXSArICctJyArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgNl1dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyA3XV0gKyAnLScgKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDhdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgOV1dICsgJy0nICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyAxMF1dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyAxMV1dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyAxMl1dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyAxM11dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyAxNF1dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyAxNV1dKS50b0xvd2VyQ2FzZSgpOyAvLyBDb25zaXN0ZW5jeSBjaGVjayBmb3IgdmFsaWQgVVVJRC4gIElmIHRoaXMgdGhyb3dzLCBpdCdzIGxpa2VseSBkdWUgdG8gb25lXG4gIC8vIG9mIHRoZSBmb2xsb3dpbmc6XG4gIC8vIC0gT25lIG9yIG1vcmUgaW5wdXQgYXJyYXkgdmFsdWVzIGRvbid0IG1hcCB0byBhIGhleCBvY3RldCAobGVhZGluZyB0b1xuICAvLyBcInVuZGVmaW5lZFwiIGluIHRoZSB1dWlkKVxuICAvLyAtIEludmFsaWQgaW5wdXQgdmFsdWVzIGZvciB0aGUgUkZDIGB2ZXJzaW9uYCBvciBgdmFyaWFudGAgZmllbGRzXG5cbiAgaWYgKCF2YWxpZGF0ZSh1dWlkKSkge1xuICAgIHRocm93IFR5cGVFcnJvcignU3RyaW5naWZpZWQgVVVJRCBpcyBpbnZhbGlkJyk7XG4gIH1cblxuICByZXR1cm4gdXVpZDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgc3RyaW5naWZ5OyIsImltcG9ydCBybmcgZnJvbSAnLi9ybmcuanMnO1xuaW1wb3J0IHN0cmluZ2lmeSBmcm9tICcuL3N0cmluZ2lmeS5qcyc7XG5cbmZ1bmN0aW9uIHY0KG9wdGlvbnMsIGJ1Ziwgb2Zmc2V0KSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICB2YXIgcm5kcyA9IG9wdGlvbnMucmFuZG9tIHx8IChvcHRpb25zLnJuZyB8fCBybmcpKCk7IC8vIFBlciA0LjQsIHNldCBiaXRzIGZvciB2ZXJzaW9uIGFuZCBgY2xvY2tfc2VxX2hpX2FuZF9yZXNlcnZlZGBcblxuICBybmRzWzZdID0gcm5kc1s2XSAmIDB4MGYgfCAweDQwO1xuICBybmRzWzhdID0gcm5kc1s4XSAmIDB4M2YgfCAweDgwOyAvLyBDb3B5IGJ5dGVzIHRvIGJ1ZmZlciwgaWYgcHJvdmlkZWRcblxuICBpZiAoYnVmKSB7XG4gICAgb2Zmc2V0ID0gb2Zmc2V0IHx8IDA7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDE2OyArK2kpIHtcbiAgICAgIGJ1ZltvZmZzZXQgKyBpXSA9IHJuZHNbaV07XG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1ZjtcbiAgfVxuXG4gIHJldHVybiBzdHJpbmdpZnkocm5kcyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHY0OyIsImltcG9ydCBSRUdFWCBmcm9tICcuL3JlZ2V4LmpzJztcblxuZnVuY3Rpb24gdmFsaWRhdGUodXVpZCkge1xuICByZXR1cm4gdHlwZW9mIHV1aWQgPT09ICdzdHJpbmcnICYmIFJFR0VYLnRlc3QodXVpZCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHZhbGlkYXRlOyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdGlmKF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0pIHtcblx0XHRyZXR1cm4gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdGlkOiBtb2R1bGVJZCxcblx0XHRsb2FkZWQ6IGZhbHNlLFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcblx0bW9kdWxlLmxvYWRlZCA9IHRydWU7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLmhtZCA9IChtb2R1bGUpID0+IHtcblx0bW9kdWxlID0gT2JqZWN0LmNyZWF0ZShtb2R1bGUpO1xuXHRpZiAoIW1vZHVsZS5jaGlsZHJlbikgbW9kdWxlLmNoaWxkcmVuID0gW107XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShtb2R1bGUsICdleHBvcnRzJywge1xuXHRcdGVudW1lcmFibGU6IHRydWUsXG5cdFx0c2V0OiAoKSA9PiB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0VTIE1vZHVsZXMgbWF5IG5vdCBhc3NpZ24gbW9kdWxlLmV4cG9ydHMgb3IgZXhwb3J0cy4qLCBVc2UgRVNNIGV4cG9ydCBzeW50YXgsIGluc3RlYWQ6ICcgKyBtb2R1bGUuaWQpO1xuXHRcdH1cblx0fSk7XG5cdHJldHVybiBtb2R1bGU7XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiLy8gbW9kdWxlIGV4cG9ydHMgbXVzdCBiZSByZXR1cm5lZCBmcm9tIHJ1bnRpbWUgc28gZW50cnkgaW5saW5pbmcgaXMgZGlzYWJsZWRcbi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xucmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9hbGVwaGJldC5jb2ZmZWVcIik7XG4iXSwic291cmNlUm9vdCI6IiJ9