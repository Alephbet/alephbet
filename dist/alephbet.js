(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["AlephBet"] = factory();
	else
		root["AlephBet"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/alephbet.coffee");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/basil.js/build/basil.js":
/*!**********************************************!*\
  !*** ./node_modules/basil.js/build/basil.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

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

/***/ "./node_modules/crypto-js/core.js":
/*!****************************************!*\
  !*** ./node_modules/crypto-js/core.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

;(function (root, factory) {
	if (true) {
		// CommonJS
		module.exports = exports = factory();
	}
	else {}
}(this, function () {

	/**
	 * CryptoJS core components.
	 */
	var CryptoJS = CryptoJS || (function (Math, undefined) {
	    /*
	     * Local polyfil of Object.create
	     */
	    var create = Object.create || (function () {
	        function F() {};

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

	            var r = (function (m_w) {
	                var m_w = m_w;
	                var m_z = 0x3ade68b1;
	                var mask = 0xffffffff;

	                return function () {
	                    m_z = (0x9069 * (m_z & 0xFFFF) + (m_z >> 0x10)) & mask;
	                    m_w = (0x4650 * (m_w & 0xFFFF) + (m_w >> 0x10)) & mask;
	                    var result = ((m_z << 0x10) + m_w) & mask;
	                    result /= 0x100000000;
	                    result += 0.5;
	                    return result * (Math.random() > .5 ? 1 : -1);
	                }
	            });

	            for (var i = 0, rcache; i < nBytes; i += 4) {
	                var _r = r((rcache || Math.random()) * 0x100000000);

	                rcache = _r() * 0x3ade67b7;
	                words.push((_r() * 0x100000000) | 0);
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
	                var processedWords = dataWords.splice(0, nWordsReady);
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
/*! no static exports found */
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

/***/ "./node_modules/uuid/dist/esm-browser/bytesToUuid.js":
/*!***********************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/bytesToUuid.js ***!
  \***********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
var byteToHex = [];

for (var i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

function bytesToUuid(buf, offset) {
  var i = offset || 0;
  var bth = byteToHex; // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4

  return [bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]]].join('');
}

/* harmony default export */ __webpack_exports__["default"] = (bytesToUuid);

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/index.js":
/*!*****************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/index.js ***!
  \*****************************************************/
/*! exports provided: v1, v3, v4, v5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _v1_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./v1.js */ "./node_modules/uuid/dist/esm-browser/v1.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "v1", function() { return _v1_js__WEBPACK_IMPORTED_MODULE_0__["default"]; });

/* harmony import */ var _v3_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./v3.js */ "./node_modules/uuid/dist/esm-browser/v3.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "v3", function() { return _v3_js__WEBPACK_IMPORTED_MODULE_1__["default"]; });

/* harmony import */ var _v4_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./v4.js */ "./node_modules/uuid/dist/esm-browser/v4.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "v4", function() { return _v4_js__WEBPACK_IMPORTED_MODULE_2__["default"]; });

/* harmony import */ var _v5_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./v5.js */ "./node_modules/uuid/dist/esm-browser/v5.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "v5", function() { return _v5_js__WEBPACK_IMPORTED_MODULE_3__["default"]; });






/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/md5.js":
/*!***************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/md5.js ***!
  \***************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/*
 * Browser-compatible JavaScript MD5
 *
 * Modification of JavaScript MD5
 * https://github.com/blueimp/JavaScript-MD5
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * https://opensource.org/licenses/MIT
 *
 * Based on
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */
function md5(bytes) {
  if (typeof bytes == 'string') {
    var msg = unescape(encodeURIComponent(bytes)); // UTF8 escape

    bytes = new Array(msg.length);

    for (var i = 0; i < msg.length; i++) {
      bytes[i] = msg.charCodeAt(i);
    }
  }

  return md5ToHexEncodedArray(wordsToMd5(bytesToWords(bytes), bytes.length * 8));
}
/*
 * Convert an array of little-endian words to an array of bytes
 */


function md5ToHexEncodedArray(input) {
  var i;
  var x;
  var output = [];
  var length32 = input.length * 32;
  var hexTab = '0123456789abcdef';
  var hex;

  for (i = 0; i < length32; i += 8) {
    x = input[i >> 5] >>> i % 32 & 0xff;
    hex = parseInt(hexTab.charAt(x >>> 4 & 0x0f) + hexTab.charAt(x & 0x0f), 16);
    output.push(hex);
  }

  return output;
}
/*
 * Calculate the MD5 of an array of little-endian words, and a bit length.
 */


function wordsToMd5(x, len) {
  /* append padding */
  x[len >> 5] |= 0x80 << len % 32;
  x[(len + 64 >>> 9 << 4) + 14] = len;
  var i;
  var olda;
  var oldb;
  var oldc;
  var oldd;
  var a = 1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d = 271733878;

  for (i = 0; i < x.length; i += 16) {
    olda = a;
    oldb = b;
    oldc = c;
    oldd = d;
    a = md5ff(a, b, c, d, x[i], 7, -680876936);
    d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
    c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
    b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
    a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
    d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
    c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
    b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
    a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
    d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
    c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
    b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
    a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
    d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
    c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
    b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);
    a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
    d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
    c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
    b = md5gg(b, c, d, a, x[i], 20, -373897302);
    a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
    d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
    c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
    b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
    a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
    d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
    c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
    b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
    a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
    d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
    c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
    b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);
    a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
    d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
    c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
    b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
    a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
    d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
    c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
    b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
    a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
    d = md5hh(d, a, b, c, x[i], 11, -358537222);
    c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
    b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
    a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
    d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
    c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
    b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);
    a = md5ii(a, b, c, d, x[i], 6, -198630844);
    d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
    c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
    b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
    a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
    d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
    c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
    b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
    a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
    d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
    c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
    b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
    a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
    d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
    c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
    b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);
    a = safeAdd(a, olda);
    b = safeAdd(b, oldb);
    c = safeAdd(c, oldc);
    d = safeAdd(d, oldd);
  }

  return [a, b, c, d];
}
/*
 * Convert an array bytes to an array of little-endian words
 * Characters >255 have their high-byte silently ignored.
 */


function bytesToWords(input) {
  var i;
  var output = [];
  output[(input.length >> 2) - 1] = undefined;

  for (i = 0; i < output.length; i += 1) {
    output[i] = 0;
  }

  var length8 = input.length * 8;

  for (i = 0; i < length8; i += 8) {
    output[i >> 5] |= (input[i / 8] & 0xff) << i % 32;
  }

  return output;
}
/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */


function safeAdd(x, y) {
  var lsw = (x & 0xffff) + (y & 0xffff);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return msw << 16 | lsw & 0xffff;
}
/*
 * Bitwise rotate a 32-bit number to the left.
 */


function bitRotateLeft(num, cnt) {
  return num << cnt | num >>> 32 - cnt;
}
/*
 * These functions implement the four basic operations the algorithm uses.
 */


function md5cmn(q, a, b, x, s, t) {
  return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
}

function md5ff(a, b, c, d, x, s, t) {
  return md5cmn(b & c | ~b & d, a, b, x, s, t);
}

function md5gg(a, b, c, d, x, s, t) {
  return md5cmn(b & d | c & ~d, a, b, x, s, t);
}

function md5hh(a, b, c, d, x, s, t) {
  return md5cmn(b ^ c ^ d, a, b, x, s, t);
}

function md5ii(a, b, c, d, x, s, t) {
  return md5cmn(c ^ (b | ~d), a, b, x, s, t);
}

/* harmony default export */ __webpack_exports__["default"] = (md5);

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/rng.js":
/*!***************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/rng.js ***!
  \***************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return rng; });
// Unique ID creation requires a high quality random # generator. In the browser we therefore
// require the crypto API and do not support built-in fallback to lower quality random number
// generators (like Math.random()).
// getRandomValues needs to be invoked in a context where "this" is a Crypto implementation. Also,
// find the complete implementation of crypto (msCrypto) on IE11.
var getRandomValues = typeof crypto != 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto != 'undefined' && typeof msCrypto.getRandomValues == 'function' && msCrypto.getRandomValues.bind(msCrypto);
var rnds8 = new Uint8Array(16); // eslint-disable-line no-undef

function rng() {
  if (!getRandomValues) {
    throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
  }

  return getRandomValues(rnds8);
}

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/sha1.js":
/*!****************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/sha1.js ***!
  \****************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
// Adapted from Chris Veness' SHA1 code at
// http://www.movable-type.co.uk/scripts/sha1.html
function f(s, x, y, z) {
  switch (s) {
    case 0:
      return x & y ^ ~x & z;

    case 1:
      return x ^ y ^ z;

    case 2:
      return x & y ^ x & z ^ y & z;

    case 3:
      return x ^ y ^ z;
  }
}

function ROTL(x, n) {
  return x << n | x >>> 32 - n;
}

function sha1(bytes) {
  var K = [0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6];
  var H = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0];

  if (typeof bytes == 'string') {
    var msg = unescape(encodeURIComponent(bytes)); // UTF8 escape

    bytes = new Array(msg.length);

    for (var i = 0; i < msg.length; i++) {
      bytes[i] = msg.charCodeAt(i);
    }
  }

  bytes.push(0x80);
  var l = bytes.length / 4 + 2;
  var N = Math.ceil(l / 16);
  var M = new Array(N);

  for (var i = 0; i < N; i++) {
    M[i] = new Array(16);

    for (var j = 0; j < 16; j++) {
      M[i][j] = bytes[i * 64 + j * 4] << 24 | bytes[i * 64 + j * 4 + 1] << 16 | bytes[i * 64 + j * 4 + 2] << 8 | bytes[i * 64 + j * 4 + 3];
    }
  }

  M[N - 1][14] = (bytes.length - 1) * 8 / Math.pow(2, 32);
  M[N - 1][14] = Math.floor(M[N - 1][14]);
  M[N - 1][15] = (bytes.length - 1) * 8 & 0xffffffff;

  for (var i = 0; i < N; i++) {
    var W = new Array(80);

    for (var t = 0; t < 16; t++) {
      W[t] = M[i][t];
    }

    for (var t = 16; t < 80; t++) {
      W[t] = ROTL(W[t - 3] ^ W[t - 8] ^ W[t - 14] ^ W[t - 16], 1);
    }

    var a = H[0];
    var b = H[1];
    var c = H[2];
    var d = H[3];
    var e = H[4];

    for (var t = 0; t < 80; t++) {
      var s = Math.floor(t / 20);
      var T = ROTL(a, 5) + f(s, b, c, d) + e + K[s] + W[t] >>> 0;
      e = d;
      d = c;
      c = ROTL(b, 30) >>> 0;
      b = a;
      a = T;
    }

    H[0] = H[0] + a >>> 0;
    H[1] = H[1] + b >>> 0;
    H[2] = H[2] + c >>> 0;
    H[3] = H[3] + d >>> 0;
    H[4] = H[4] + e >>> 0;
  }

  return [H[0] >> 24 & 0xff, H[0] >> 16 & 0xff, H[0] >> 8 & 0xff, H[0] & 0xff, H[1] >> 24 & 0xff, H[1] >> 16 & 0xff, H[1] >> 8 & 0xff, H[1] & 0xff, H[2] >> 24 & 0xff, H[2] >> 16 & 0xff, H[2] >> 8 & 0xff, H[2] & 0xff, H[3] >> 24 & 0xff, H[3] >> 16 & 0xff, H[3] >> 8 & 0xff, H[3] & 0xff, H[4] >> 24 & 0xff, H[4] >> 16 & 0xff, H[4] >> 8 & 0xff, H[4] & 0xff];
}

/* harmony default export */ __webpack_exports__["default"] = (sha1);

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/v1.js":
/*!**************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/v1.js ***!
  \**************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _rng_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./rng.js */ "./node_modules/uuid/dist/esm-browser/rng.js");
/* harmony import */ var _bytesToUuid_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./bytesToUuid.js */ "./node_modules/uuid/dist/esm-browser/bytesToUuid.js");

 // **`v1()` - Generate time-based UUID**
//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html

var _nodeId;

var _clockseq; // Previous uuid creation time


var _lastMSecs = 0;
var _lastNSecs = 0; // See https://github.com/uuidjs/uuid for API details

function v1(options, buf, offset) {
  var i = buf && offset || 0;
  var b = buf || [];
  options = options || {};
  var node = options.node || _nodeId;
  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq; // node and clockseq need to be initialized to random values if they're not
  // specified.  We do this lazily to minimize issues related to insufficient
  // system entropy.  See #189

  if (node == null || clockseq == null) {
    var seedBytes = options.random || (options.rng || _rng_js__WEBPACK_IMPORTED_MODULE_0__["default"])();

    if (node == null) {
      // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
      node = _nodeId = [seedBytes[0] | 0x01, seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
    }

    if (clockseq == null) {
      // Per 4.2.2, randomize (14 bit) clockseq
      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
    }
  } // UUID timestamps are 100 nano-second units since the Gregorian epoch,
  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.


  var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime(); // Per 4.2.1.2, use count of uuid's generated during the current clock
  // cycle to simulate higher resolution clock

  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1; // Time since last uuid creation (in msecs)

  var dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 10000; // Per 4.2.1.2, Bump clockseq on clock regression

  if (dt < 0 && options.clockseq === undefined) {
    clockseq = clockseq + 1 & 0x3fff;
  } // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
  // time interval


  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  } // Per 4.2.1.2 Throw error if too many uuids are requested


  if (nsecs >= 10000) {
    throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
  }

  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq; // Per 4.1.4 - Convert from unix epoch to Gregorian epoch

  msecs += 12219292800000; // `time_low`

  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = tl >>> 24 & 0xff;
  b[i++] = tl >>> 16 & 0xff;
  b[i++] = tl >>> 8 & 0xff;
  b[i++] = tl & 0xff; // `time_mid`

  var tmh = msecs / 0x100000000 * 10000 & 0xfffffff;
  b[i++] = tmh >>> 8 & 0xff;
  b[i++] = tmh & 0xff; // `time_high_and_version`

  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version

  b[i++] = tmh >>> 16 & 0xff; // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)

  b[i++] = clockseq >>> 8 | 0x80; // `clock_seq_low`

  b[i++] = clockseq & 0xff; // `node`

  for (var n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }

  return buf ? buf : Object(_bytesToUuid_js__WEBPACK_IMPORTED_MODULE_1__["default"])(b);
}

/* harmony default export */ __webpack_exports__["default"] = (v1);

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/v3.js":
/*!**************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/v3.js ***!
  \**************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _v35_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./v35.js */ "./node_modules/uuid/dist/esm-browser/v35.js");
/* harmony import */ var _md5_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./md5.js */ "./node_modules/uuid/dist/esm-browser/md5.js");


var v3 = Object(_v35_js__WEBPACK_IMPORTED_MODULE_0__["default"])('v3', 0x30, _md5_js__WEBPACK_IMPORTED_MODULE_1__["default"]);
/* harmony default export */ __webpack_exports__["default"] = (v3);

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/v35.js":
/*!***************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/v35.js ***!
  \***************************************************/
/*! exports provided: DNS, URL, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DNS", function() { return DNS; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "URL", function() { return URL; });
/* harmony import */ var _bytesToUuid_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./bytesToUuid.js */ "./node_modules/uuid/dist/esm-browser/bytesToUuid.js");


function uuidToBytes(uuid) {
  // Note: We assume we're being passed a valid uuid string
  var bytes = [];
  uuid.replace(/[a-fA-F0-9]{2}/g, function (hex) {
    bytes.push(parseInt(hex, 16));
  });
  return bytes;
}

function stringToBytes(str) {
  str = unescape(encodeURIComponent(str)); // UTF8 escape

  var bytes = new Array(str.length);

  for (var i = 0; i < str.length; i++) {
    bytes[i] = str.charCodeAt(i);
  }

  return bytes;
}

var DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
var URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
/* harmony default export */ __webpack_exports__["default"] = (function (name, version, hashfunc) {
  var generateUUID = function generateUUID(value, namespace, buf, offset) {
    var off = buf && offset || 0;
    if (typeof value == 'string') value = stringToBytes(value);
    if (typeof namespace == 'string') namespace = uuidToBytes(namespace);
    if (!Array.isArray(value)) throw TypeError('value must be an array of bytes');
    if (!Array.isArray(namespace) || namespace.length !== 16) throw TypeError('namespace must be uuid string or an Array of 16 byte values'); // Per 4.3

    var bytes = hashfunc(namespace.concat(value));
    bytes[6] = bytes[6] & 0x0f | version;
    bytes[8] = bytes[8] & 0x3f | 0x80;

    if (buf) {
      for (var idx = 0; idx < 16; ++idx) {
        buf[off + idx] = bytes[idx];
      }
    }

    return buf || Object(_bytesToUuid_js__WEBPACK_IMPORTED_MODULE_0__["default"])(bytes);
  }; // Function#name is not settable on some platforms (#270)


  try {
    generateUUID.name = name;
  } catch (err) {} // For CommonJS default export support


  generateUUID.DNS = DNS;
  generateUUID.URL = URL;
  return generateUUID;
});

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/v4.js":
/*!**************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/v4.js ***!
  \**************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _rng_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./rng.js */ "./node_modules/uuid/dist/esm-browser/rng.js");
/* harmony import */ var _bytesToUuid_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./bytesToUuid.js */ "./node_modules/uuid/dist/esm-browser/bytesToUuid.js");



function v4(options, buf, offset) {
  var i = buf && offset || 0;

  if (typeof options == 'string') {
    buf = options === 'binary' ? new Array(16) : null;
    options = null;
  }

  options = options || {};
  var rnds = options.random || (options.rng || _rng_js__WEBPACK_IMPORTED_MODULE_0__["default"])(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

  rnds[6] = rnds[6] & 0x0f | 0x40;
  rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

  if (buf) {
    for (var ii = 0; ii < 16; ++ii) {
      buf[i + ii] = rnds[ii];
    }
  }

  return buf || Object(_bytesToUuid_js__WEBPACK_IMPORTED_MODULE_1__["default"])(rnds);
}

/* harmony default export */ __webpack_exports__["default"] = (v4);

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/v5.js":
/*!**************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/v5.js ***!
  \**************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _v35_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./v35.js */ "./node_modules/uuid/dist/esm-browser/v35.js");
/* harmony import */ var _sha1_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./sha1.js */ "./node_modules/uuid/dist/esm-browser/sha1.js");


var v5 = Object(_v35_js__WEBPACK_IMPORTED_MODULE_0__["default"])('v5', 0x50, _sha1_js__WEBPACK_IMPORTED_MODULE_1__["default"]);
/* harmony default export */ __webpack_exports__["default"] = (v5);

/***/ }),

/***/ "./node_modules/webpack/buildin/global.js":
/*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || new Function("return this")();
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),

/***/ "./node_modules/webpack/buildin/module.js":
/*!***********************************!*\
  !*** (webpack)/buildin/module.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function(module) {
	if (!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if (!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),

/***/ "./src/adapters.coffee":
/*!*****************************!*\
  !*** ./src/adapters.coffee ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

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
    var AlephbetAdapter = /*#__PURE__*/function () {
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

      return AlephbetAdapter;
    }();

    ;
    AlephbetAdapter.prototype.queue_name = '_alephbet_queue';
    return AlephbetAdapter;
  }.call(this); //# Adapter for using the lamed backend. See https://github.com/Alephbet/lamed
  //# inherits from AlephbetAdapter which uses the same backend API
  //#


  Adapters.LamedAdapter = function () {
    var LamedAdapter = /*#__PURE__*/function (_Adapters$AlephbetAda) {
      _inherits(LamedAdapter, _Adapters$AlephbetAda);

      function LamedAdapter() {
        _classCallCheck(this, LamedAdapter);

        return _possibleConstructorReturn(this, _getPrototypeOf(LamedAdapter).apply(this, arguments));
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
    var GimelAdapter = /*#__PURE__*/function (_Adapters$AlephbetAda2) {
      _inherits(GimelAdapter, _Adapters$AlephbetAda2);

      function GimelAdapter() {
        _classCallCheck(this, GimelAdapter);

        return _possibleConstructorReturn(this, _getPrototypeOf(GimelAdapter).apply(this, arguments));
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
    var RailsAdapter = /*#__PURE__*/function (_Adapters$AlephbetAda3) {
      _inherits(RailsAdapter, _Adapters$AlephbetAda3);

      function RailsAdapter() {
        _classCallCheck(this, RailsAdapter);

        return _possibleConstructorReturn(this, _getPrototypeOf(RailsAdapter).apply(this, arguments));
      }

      return RailsAdapter;
    }(Adapters.AlephbetAdapter);

    ;
    RailsAdapter.prototype.queue_name = '_rails_queue';
    return RailsAdapter;
  }.call(this);

  Adapters.PersistentQueueGoogleAnalyticsAdapter = function () {
    var PersistentQueueGoogleAnalyticsAdapter = /*#__PURE__*/function () {
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
    var PersistentQueueKeenAdapter = /*#__PURE__*/function () {
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
    var GoogleUniversalAnalyticsAdapter = /*#__PURE__*/function () {
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
    var LocalStorageAdapter = /*#__PURE__*/function () {
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
}.call(void 0);

module.exports = Adapters;

/***/ }),

/***/ "./src/alephbet.coffee":
/*!*****************************!*\
  !*** ./src/alephbet.coffee ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

    var Experiment = /*#__PURE__*/function () {
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

  AlephBet.Goal = /*#__PURE__*/function () {
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
}.call(void 0);

module.exports = AlephBet;

/***/ }),

/***/ "./src/options.coffee":
/*!****************************!*\
  !*** ./src/options.coffee ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
  debug: false
};

/***/ }),

/***/ "./src/storage.coffee":
/*!****************************!*\
  !*** ./src/storage.coffee ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Basil, Storage, store;
Basil = __webpack_require__(/*! basil.js */ "./node_modules/basil.js/build/basil.js");
store = new Basil({
  namespace: null
}); // a thin wrapper around basil.js for easy swapping

Storage = /*#__PURE__*/function () {
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
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// NOTE: using a custom build of lodash, to save space
var Utils, _, options, _sha, uuid;

_ = __webpack_require__(/*! ../vendor/lodash.custom.min */ "./vendor/lodash.custom.min.js");
uuid = __webpack_require__(/*! uuid */ "./node_modules/uuid/dist/esm-browser/index.js");
_sha = __webpack_require__(/*! crypto-js/sha1 */ "./node_modules/crypto-js/sha1.js");
options = __webpack_require__(/*! ./options */ "./src/options.coffee");

Utils = function () {
  var Utils = /*#__PURE__*/function () {
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
  Utils.defaults = _.defaults;
  Utils.keys = _.keys;
  Utils.remove = _.remove;
  Utils.omit = _.omit;
  Utils.uuid = uuid.v4;
  return Utils;
}.call(void 0);

module.exports = Utils;

/***/ }),

/***/ "./vendor/lodash.custom.min.js":
/*!*************************************!*\
  !*** ./vendor/lodash.custom.min.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global, module) {/**
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
Wt["[object Error]"]=Wt["[object Function]"]=Wt["[object WeakMap]"]=false;var Gt,qt=typeof global=="object"&&global&&global.Object===Object&&global,Ht=typeof self=="object"&&self&&self.Object===Object&&self,Jt=qt||Ht||Function("return this")(),Kt= true&&exports&&!exports.nodeType&&exports,Qt=Kt&&typeof module=="object"&&module&&!module.nodeType&&module,Xt=Qt&&Qt.exports===Kt,Yt=Xt&&qt.process;t:{try{Gt=Yt&&Yt.binding&&Yt.binding("util");break t}catch(t){}Gt=void 0}var Zt=Gt&&Gt.isMap,te=Gt&&Gt.isSet,ee=Gt&&Gt.isTypedArray,re=Array.prototype,ne=Object.prototype,oe=Jt["__core-js_shared__"],ce=Function.prototype.toString,ue=ne.hasOwnProperty,ae=function(){
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
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../node_modules/webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js"), __webpack_require__(/*! ./../node_modules/webpack/buildin/module.js */ "./node_modules/webpack/buildin/module.js")(module)))

/***/ })

/******/ });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9BbGVwaEJldC93ZWJwYWNrL3VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24iLCJ3ZWJwYWNrOi8vQWxlcGhCZXQvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vQWxlcGhCZXQvLi9ub2RlX21vZHVsZXMvYmFzaWwuanMvYnVpbGQvYmFzaWwuanMiLCJ3ZWJwYWNrOi8vQWxlcGhCZXQvLi9ub2RlX21vZHVsZXMvY3J5cHRvLWpzL2NvcmUuanMiLCJ3ZWJwYWNrOi8vQWxlcGhCZXQvLi9ub2RlX21vZHVsZXMvY3J5cHRvLWpzL3NoYTEuanMiLCJ3ZWJwYWNrOi8vQWxlcGhCZXQvLi9ub2RlX21vZHVsZXMvdXVpZC9kaXN0L2VzbS1icm93c2VyL2J5dGVzVG9VdWlkLmpzIiwid2VicGFjazovL0FsZXBoQmV0Ly4vbm9kZV9tb2R1bGVzL3V1aWQvZGlzdC9lc20tYnJvd3Nlci9pbmRleC5qcyIsIndlYnBhY2s6Ly9BbGVwaEJldC8uL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvbWQ1LmpzIiwid2VicGFjazovL0FsZXBoQmV0Ly4vbm9kZV9tb2R1bGVzL3V1aWQvZGlzdC9lc20tYnJvd3Nlci9ybmcuanMiLCJ3ZWJwYWNrOi8vQWxlcGhCZXQvLi9ub2RlX21vZHVsZXMvdXVpZC9kaXN0L2VzbS1icm93c2VyL3NoYTEuanMiLCJ3ZWJwYWNrOi8vQWxlcGhCZXQvLi9ub2RlX21vZHVsZXMvdXVpZC9kaXN0L2VzbS1icm93c2VyL3YxLmpzIiwid2VicGFjazovL0FsZXBoQmV0Ly4vbm9kZV9tb2R1bGVzL3V1aWQvZGlzdC9lc20tYnJvd3Nlci92My5qcyIsIndlYnBhY2s6Ly9BbGVwaEJldC8uL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvdjM1LmpzIiwid2VicGFjazovL0FsZXBoQmV0Ly4vbm9kZV9tb2R1bGVzL3V1aWQvZGlzdC9lc20tYnJvd3Nlci92NC5qcyIsIndlYnBhY2s6Ly9BbGVwaEJldC8uL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvdjUuanMiLCJ3ZWJwYWNrOi8vQWxlcGhCZXQvKHdlYnBhY2spL2J1aWxkaW4vZ2xvYmFsLmpzIiwid2VicGFjazovL0FsZXBoQmV0Lyh3ZWJwYWNrKS9idWlsZGluL21vZHVsZS5qcyIsIndlYnBhY2s6Ly9BbGVwaEJldC8uL3NyYy9hZGFwdGVycy5jb2ZmZWUiLCJ3ZWJwYWNrOi8vQWxlcGhCZXQvLi9zcmMvYWxlcGhiZXQuY29mZmVlIiwid2VicGFjazovL0FsZXBoQmV0Ly4vc3JjL29wdGlvbnMuY29mZmVlIiwid2VicGFjazovL0FsZXBoQmV0Ly4vc3JjL3N0b3JhZ2UuY29mZmVlIiwid2VicGFjazovL0FsZXBoQmV0Ly4vc3JjL3V0aWxzLmNvZmZlZSIsIndlYnBhY2s6Ly9BbGVwaEJldC8uL3ZlbmRvci9sb2Rhc2guY3VzdG9tLm1pbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0QsTztRQ1ZBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FBYztRQUMvRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EseUNBQXlDLGlDQUFpQztRQUMxRSxnSEFBZ0gsbUJBQW1CLEVBQUU7UUFDckk7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwyQkFBMkIsMEJBQTBCLEVBQUU7UUFDdkQsaUNBQWlDLGVBQWU7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QTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBd0M7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDRnhDO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrREFBa0Q7O0FBRWxEOztBQUVBLG1CQUFtQixnQkFBZ0I7QUFDbkM7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGFBQWEsY0FBYztBQUMzQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxhQUFhLGNBQWM7QUFDM0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxhQUFhLG1CQUFtQjtBQUNoQztBQUNBOztB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UyxhQUFhLFNBQVM7QUFDMWIsa0NBQWtDLElBQUksRUFBRSxXQUFXLG9CQUFvQixpQkFBaUIsa0JBQWtCLHdEQUF3RCx1RkFBdUYsMkJBQTJCLGVBQWUsWUFBWSxvQ0FBb0MsUUFBUSxPQUFPLFdBQVcsVUFBVSxlQUFlLHdFQUF3RSxhQUFhLGFBQWEsTUFBTTtBQUM5ZSx3QkFBd0IsTUFBTSxFQUFFLGtCQUFrQixrREFBa0QsU0FBUyxpQkFBaUIsNEJBQTRCLGVBQWUsU0FBUyxvQkFBb0IsWUFBWSxrQkFBa0Isb0NBQW9DLDhCQUE4QixtQkFBbUIsSUFBSSxXQUFXLFNBQVMsRUFBRSx5SUFBeUksU0FBUztBQUNyZSx5QkFBeUIsYUFBYSxNQUFNLEVBQUUsV0FBVyxnQ0FBZ0MseUJBQXlCLElBQUksd0JBQXdCLFFBQVEsNEJBQTRCLFNBQVM7QUFDM0wsUUFBUSxhIiwiZmlsZSI6ImFsZXBoYmV0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoW10sIGZhY3RvcnkpO1xuXHRlbHNlIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jylcblx0XHRleHBvcnRzW1wiQWxlcGhCZXRcIl0gPSBmYWN0b3J5KCk7XG5cdGVsc2Vcblx0XHRyb290W1wiQWxlcGhCZXRcIl0gPSBmYWN0b3J5KCk7XG59KSh3aW5kb3csIGZ1bmN0aW9uKCkge1xucmV0dXJuICIsIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL2FsZXBoYmV0LmNvZmZlZVwiKTtcbiIsIihmdW5jdGlvbiAoKSB7XG5cdC8vIEJhc2lsXG5cdHZhciBCYXNpbCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG5cdFx0cmV0dXJuIEJhc2lsLnV0aWxzLmV4dGVuZCh7fSwgQmFzaWwucGx1Z2lucywgbmV3IEJhc2lsLlN0b3JhZ2UoKS5pbml0KG9wdGlvbnMpKTtcblx0fTtcblxuXHQvLyBWZXJzaW9uXG5cdEJhc2lsLnZlcnNpb24gPSAnMC40LjExJztcblxuXHQvLyBVdGlsc1xuXHRCYXNpbC51dGlscyA9IHtcblx0XHRleHRlbmQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdHZhciBkZXN0aW5hdGlvbiA9IHR5cGVvZiBhcmd1bWVudHNbMF0gPT09ICdvYmplY3QnID8gYXJndW1lbnRzWzBdIDoge307XG5cdFx0XHRmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZiAoYXJndW1lbnRzW2ldICYmIHR5cGVvZiBhcmd1bWVudHNbaV0gPT09ICdvYmplY3QnKVxuXHRcdFx0XHRcdGZvciAodmFyIHByb3BlcnR5IGluIGFyZ3VtZW50c1tpXSlcblx0XHRcdFx0XHRcdGRlc3RpbmF0aW9uW3Byb3BlcnR5XSA9IGFyZ3VtZW50c1tpXVtwcm9wZXJ0eV07XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZGVzdGluYXRpb247XG5cdFx0fSxcblx0XHRlYWNoOiBmdW5jdGlvbiAob2JqLCBmbkl0ZXJhdG9yLCBjb250ZXh0KSB7XG5cdFx0XHRpZiAodGhpcy5pc0FycmF5KG9iaikpIHtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBvYmoubGVuZ3RoOyBpKyspXG5cdFx0XHRcdFx0aWYgKGZuSXRlcmF0b3IuY2FsbChjb250ZXh0LCBvYmpbaV0sIGkpID09PSBmYWxzZSkgcmV0dXJuO1xuXHRcdFx0fSBlbHNlIGlmIChvYmopIHtcblx0XHRcdFx0Zm9yICh2YXIga2V5IGluIG9iailcblx0XHRcdFx0XHRpZiAoZm5JdGVyYXRvci5jYWxsKGNvbnRleHQsIG9ialtrZXldLCBrZXkpID09PSBmYWxzZSkgcmV0dXJuO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0dHJ5RWFjaDogZnVuY3Rpb24gKG9iaiwgZm5JdGVyYXRvciwgZm5FcnJvciwgY29udGV4dCkge1xuXHRcdFx0dGhpcy5lYWNoKG9iaiwgZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRyZXR1cm4gZm5JdGVyYXRvci5jYWxsKGNvbnRleHQsIHZhbHVlLCBrZXkpO1xuXHRcdFx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0XHRcdGlmICh0aGlzLmlzRnVuY3Rpb24oZm5FcnJvcikpIHtcblx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdGZuRXJyb3IuY2FsbChjb250ZXh0LCB2YWx1ZSwga2V5LCBlcnJvcik7XG5cdFx0XHRcdFx0XHR9IGNhdGNoIChlcnJvcikge31cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0sIHRoaXMpO1xuXHRcdH0sXG5cdFx0cmVnaXN0ZXJQbHVnaW46IGZ1bmN0aW9uIChtZXRob2RzKSB7XG5cdFx0XHRCYXNpbC5wbHVnaW5zID0gdGhpcy5leHRlbmQobWV0aG9kcywgQmFzaWwucGx1Z2lucyk7XG5cdFx0fSxcblx0XHRnZXRUeXBlT2Y6IGZ1bmN0aW9uIChvYmopIHtcblx0XHRcdGlmICh0eXBlb2Ygb2JqID09PSAndW5kZWZpbmVkJyB8fCBvYmogPT09IG51bGwpXG5cdFx0XHRcdHJldHVybiAnJyArIG9iajtcblx0XHRcdHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKS5yZXBsYWNlKC9eXFxbb2JqZWN0XFxzKC4qKVxcXSQvLCBmdW5jdGlvbiAoJDAsICQxKSB7IHJldHVybiAkMS50b0xvd2VyQ2FzZSgpOyB9KTtcblx0XHR9XG5cdH07XG5cblx0Ly8gQWRkIHNvbWUgaXNUeXBlIG1ldGhvZHM6IGlzQXJndW1lbnRzLCBpc0Jvb2xlYW4sIGlzRnVuY3Rpb24sIGlzU3RyaW5nLCBpc0FycmF5LCBpc051bWJlciwgaXNEYXRlLCBpc1JlZ0V4cCwgaXNVbmRlZmluZWQsIGlzTnVsbC5cblx0dmFyIHR5cGVzID0gWydBcmd1bWVudHMnLCAnQm9vbGVhbicsICdGdW5jdGlvbicsICdTdHJpbmcnLCAnQXJyYXknLCAnTnVtYmVyJywgJ0RhdGUnLCAnUmVnRXhwJywgJ1VuZGVmaW5lZCcsICdOdWxsJ107XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgdHlwZXMubGVuZ3RoOyBpKyspIHtcblx0XHRCYXNpbC51dGlsc1snaXMnICsgdHlwZXNbaV1dID0gKGZ1bmN0aW9uICh0eXBlKSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24gKG9iaikge1xuXHRcdFx0XHRyZXR1cm4gQmFzaWwudXRpbHMuZ2V0VHlwZU9mKG9iaikgPT09IHR5cGUudG9Mb3dlckNhc2UoKTtcblx0XHRcdH07XG5cdFx0fSkodHlwZXNbaV0pO1xuXHR9XG5cblx0Ly8gUGx1Z2luc1xuXHRCYXNpbC5wbHVnaW5zID0ge307XG5cblx0Ly8gT3B0aW9uc1xuXHRCYXNpbC5vcHRpb25zID0gQmFzaWwudXRpbHMuZXh0ZW5kKHtcblx0XHRuYW1lc3BhY2U6ICdiNDVpMScsXG5cdFx0c3RvcmFnZXM6IFsnbG9jYWwnLCAnY29va2llJywgJ3Nlc3Npb24nLCAnbWVtb3J5J10sXG5cdFx0ZXhwaXJlRGF5czogMzY1LFxuXHRcdGtleURlbGltaXRlcjogJy4nXG5cdH0sIHdpbmRvdy5CYXNpbCA/IHdpbmRvdy5CYXNpbC5vcHRpb25zIDoge30pO1xuXG5cdC8vIFN0b3JhZ2Vcblx0QmFzaWwuU3RvcmFnZSA9IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgX3NhbHQgPSAnYjQ1aTEnICsgKE1hdGgucmFuZG9tKCkgKyAxKVxuXHRcdFx0XHQudG9TdHJpbmcoMzYpXG5cdFx0XHRcdC5zdWJzdHJpbmcoNyksXG5cdFx0XHRfc3RvcmFnZXMgPSB7fSxcblx0XHRcdF9pc1ZhbGlkS2V5ID0gZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0XHR2YXIgdHlwZSA9IEJhc2lsLnV0aWxzLmdldFR5cGVPZihrZXkpO1xuXHRcdFx0XHRyZXR1cm4gKHR5cGUgPT09ICdzdHJpbmcnICYmIGtleSkgfHwgdHlwZSA9PT0gJ251bWJlcicgfHwgdHlwZSA9PT0gJ2Jvb2xlYW4nO1xuXHRcdFx0fSxcblx0XHRcdF90b1N0b3JhZ2VzQXJyYXkgPSBmdW5jdGlvbiAoc3RvcmFnZXMpIHtcblx0XHRcdFx0aWYgKEJhc2lsLnV0aWxzLmlzQXJyYXkoc3RvcmFnZXMpKVxuXHRcdFx0XHRcdHJldHVybiBzdG9yYWdlcztcblx0XHRcdFx0cmV0dXJuIEJhc2lsLnV0aWxzLmlzU3RyaW5nKHN0b3JhZ2VzKSA/IFtzdG9yYWdlc10gOiBbXTtcblx0XHRcdH0sXG5cdFx0XHRfdG9TdG9yZWRLZXkgPSBmdW5jdGlvbiAobmFtZXNwYWNlLCBwYXRoLCBkZWxpbWl0ZXIpIHtcblx0XHRcdFx0dmFyIGtleSA9ICcnO1xuXHRcdFx0XHRpZiAoX2lzVmFsaWRLZXkocGF0aCkpIHtcblx0XHRcdFx0XHRrZXkgKz0gcGF0aDtcblx0XHRcdFx0fSBlbHNlIGlmIChCYXNpbC51dGlscy5pc0FycmF5KHBhdGgpKSB7XG5cdFx0XHRcdFx0cGF0aCA9IEJhc2lsLnV0aWxzLmlzRnVuY3Rpb24ocGF0aC5maWx0ZXIpID8gcGF0aC5maWx0ZXIoX2lzVmFsaWRLZXkpIDogcGF0aDtcblx0XHRcdFx0XHRrZXkgPSBwYXRoLmpvaW4oZGVsaW1pdGVyKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4ga2V5ICYmIF9pc1ZhbGlkS2V5KG5hbWVzcGFjZSkgPyBuYW1lc3BhY2UgKyBkZWxpbWl0ZXIgKyBrZXkgOiBrZXk7XG4gXHRcdFx0fSxcblx0XHRcdF90b0tleU5hbWUgPSBmdW5jdGlvbiAobmFtZXNwYWNlLCBrZXksIGRlbGltaXRlcikge1xuXHRcdFx0XHRpZiAoIV9pc1ZhbGlkS2V5KG5hbWVzcGFjZSkpXG5cdFx0XHRcdFx0cmV0dXJuIGtleTtcblx0XHRcdFx0cmV0dXJuIGtleS5yZXBsYWNlKG5ldyBSZWdFeHAoJ14nICsgbmFtZXNwYWNlICsgZGVsaW1pdGVyKSwgJycpO1xuXHRcdFx0fSxcblx0XHRcdF90b1N0b3JlZFZhbHVlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG5cdFx0XHRcdHJldHVybiBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG5cdFx0XHR9LFxuXHRcdFx0X2Zyb21TdG9yZWRWYWx1ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuXHRcdFx0XHRyZXR1cm4gdmFsdWUgPyBKU09OLnBhcnNlKHZhbHVlKSA6IG51bGw7XG5cdFx0XHR9O1xuXG5cdFx0Ly8gSFRNTDUgd2ViIHN0b3JhZ2UgaW50ZXJmYWNlXG5cdFx0dmFyIHdlYlN0b3JhZ2VJbnRlcmZhY2UgPSB7XG5cdFx0XHRlbmdpbmU6IG51bGwsXG5cdFx0XHRjaGVjazogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdHdpbmRvd1t0aGlzLmVuZ2luZV0uc2V0SXRlbShfc2FsdCwgdHJ1ZSk7XG5cdFx0XHRcdFx0d2luZG93W3RoaXMuZW5naW5lXS5yZW1vdmVJdGVtKF9zYWx0KTtcblx0XHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH0sXG5cdFx0XHRzZXQ6IGZ1bmN0aW9uIChrZXksIHZhbHVlLCBvcHRpb25zKSB7XG5cdFx0XHRcdGlmICgha2V5KVxuXHRcdFx0XHRcdHRocm93IEVycm9yKCdpbnZhbGlkIGtleScpO1xuXHRcdFx0XHR3aW5kb3dbdGhpcy5lbmdpbmVdLnNldEl0ZW0oa2V5LCB2YWx1ZSk7XG5cdFx0XHR9LFxuXHRcdFx0Z2V0OiBmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHRcdHJldHVybiB3aW5kb3dbdGhpcy5lbmdpbmVdLmdldEl0ZW0oa2V5KTtcblx0XHRcdH0sXG5cdFx0XHRyZW1vdmU6IGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdFx0d2luZG93W3RoaXMuZW5naW5lXS5yZW1vdmVJdGVtKGtleSk7XG5cdFx0XHR9LFxuXHRcdFx0cmVzZXQ6IGZ1bmN0aW9uIChuYW1lc3BhY2UpIHtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDAsIGtleTsgaSA8IHdpbmRvd1t0aGlzLmVuZ2luZV0ubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRrZXkgPSB3aW5kb3dbdGhpcy5lbmdpbmVdLmtleShpKTtcblx0XHRcdFx0XHRpZiAoIW5hbWVzcGFjZSB8fCBrZXkuaW5kZXhPZihuYW1lc3BhY2UpID09PSAwKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnJlbW92ZShrZXkpO1xuXHRcdFx0XHRcdFx0aS0tO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdGtleXM6IGZ1bmN0aW9uIChuYW1lc3BhY2UsIGRlbGltaXRlcikge1xuXHRcdFx0XHR2YXIga2V5cyA9IFtdO1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMCwga2V5OyBpIDwgd2luZG93W3RoaXMuZW5naW5lXS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdGtleSA9IHdpbmRvd1t0aGlzLmVuZ2luZV0ua2V5KGkpO1xuXHRcdFx0XHRcdGlmICghbmFtZXNwYWNlIHx8IGtleS5pbmRleE9mKG5hbWVzcGFjZSkgPT09IDApXG5cdFx0XHRcdFx0XHRrZXlzLnB1c2goX3RvS2V5TmFtZShuYW1lc3BhY2UsIGtleSwgZGVsaW1pdGVyKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIGtleXM7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdC8vIGxvY2FsIHN0b3JhZ2Vcblx0XHRfc3RvcmFnZXMubG9jYWwgPSBCYXNpbC51dGlscy5leHRlbmQoe30sIHdlYlN0b3JhZ2VJbnRlcmZhY2UsIHtcblx0XHRcdGVuZ2luZTogJ2xvY2FsU3RvcmFnZSdcblx0XHR9KTtcblx0XHQvLyBzZXNzaW9uIHN0b3JhZ2Vcblx0XHRfc3RvcmFnZXMuc2Vzc2lvbiA9IEJhc2lsLnV0aWxzLmV4dGVuZCh7fSwgd2ViU3RvcmFnZUludGVyZmFjZSwge1xuXHRcdFx0ZW5naW5lOiAnc2Vzc2lvblN0b3JhZ2UnXG5cdFx0fSk7XG5cblx0XHQvLyBtZW1vcnkgc3RvcmFnZVxuXHRcdF9zdG9yYWdlcy5tZW1vcnkgPSB7XG5cdFx0XHRfaGFzaDoge30sXG5cdFx0XHRjaGVjazogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH0sXG5cdFx0XHRzZXQ6IGZ1bmN0aW9uIChrZXksIHZhbHVlLCBvcHRpb25zKSB7XG5cdFx0XHRcdGlmICgha2V5KVxuXHRcdFx0XHRcdHRocm93IEVycm9yKCdpbnZhbGlkIGtleScpO1xuXHRcdFx0XHR0aGlzLl9oYXNoW2tleV0gPSB2YWx1ZTtcblx0XHRcdH0sXG5cdFx0XHRnZXQ6IGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuX2hhc2hba2V5XSB8fCBudWxsO1xuXHRcdFx0fSxcblx0XHRcdHJlbW92ZTogZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0XHRkZWxldGUgdGhpcy5faGFzaFtrZXldO1xuXHRcdFx0fSxcblx0XHRcdHJlc2V0OiBmdW5jdGlvbiAobmFtZXNwYWNlKSB7XG5cdFx0XHRcdGZvciAodmFyIGtleSBpbiB0aGlzLl9oYXNoKSB7XG5cdFx0XHRcdFx0aWYgKCFuYW1lc3BhY2UgfHwga2V5LmluZGV4T2YobmFtZXNwYWNlKSA9PT0gMClcblx0XHRcdFx0XHRcdHRoaXMucmVtb3ZlKGtleSk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRrZXlzOiBmdW5jdGlvbiAobmFtZXNwYWNlLCBkZWxpbWl0ZXIpIHtcblx0XHRcdFx0dmFyIGtleXMgPSBbXTtcblx0XHRcdFx0Zm9yICh2YXIga2V5IGluIHRoaXMuX2hhc2gpXG5cdFx0XHRcdFx0aWYgKCFuYW1lc3BhY2UgfHwga2V5LmluZGV4T2YobmFtZXNwYWNlKSA9PT0gMClcblx0XHRcdFx0XHRcdGtleXMucHVzaChfdG9LZXlOYW1lKG5hbWVzcGFjZSwga2V5LCBkZWxpbWl0ZXIpKTtcblx0XHRcdFx0cmV0dXJuIGtleXM7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdC8vIGNvb2tpZSBzdG9yYWdlXG5cdFx0X3N0b3JhZ2VzLmNvb2tpZSA9IHtcblx0XHRcdGNoZWNrOiBmdW5jdGlvbiAob3B0aW9ucykge1xuXHRcdFx0XHRpZiAoIW5hdmlnYXRvci5jb29raWVFbmFibGVkKVxuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0aWYgKHdpbmRvdy5zZWxmICE9PSB3aW5kb3cudG9wKSB7XG5cdFx0XHRcdFx0Ly8gd2UgbmVlZCB0byBjaGVjayB0aGlyZC1wYXJ0eSBjb29raWVzO1xuXHRcdFx0XHRcdHZhciBjb29raWUgPSAndGhpcmRwYXJ0eS5jaGVjaz0nICsgTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogMTAwMCk7XG5cdFx0XHRcdFx0ZG9jdW1lbnQuY29va2llID0gY29va2llICsgJzsgcGF0aD0vJztcblx0XHRcdFx0XHRyZXR1cm4gZG9jdW1lbnQuY29va2llLmluZGV4T2YoY29va2llKSAhPT0gLTE7XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gaWYgY29va2llIHNlY3VyZSBhY3RpdmF0ZWQsIGVuc3VyZSBpdCB3b3JrcyAobm90IHRoZSBjYXNlIGlmIHdlIGFyZSBpbiBodHRwIG9ubHkpXG5cdFx0XHRcdGlmIChvcHRpb25zICYmIG9wdGlvbnMuc2VjdXJlKSB7XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdHRoaXMuc2V0KF9zYWx0LCBfc2FsdCwgb3B0aW9ucyk7XG5cdFx0XHRcdFx0XHR2YXIgaGFzU2VjdXJlbHlQZXJzaXRlZCA9IHRoaXMuZ2V0KF9zYWx0KSA9PT0gX3NhbHQ7XG5cdFx0XHRcdFx0XHR0aGlzLnJlbW92ZShfc2FsdCk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gaGFzU2VjdXJlbHlQZXJzaXRlZDtcblx0XHRcdFx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH0sXG5cdFx0XHRzZXQ6IGZ1bmN0aW9uIChrZXksIHZhbHVlLCBvcHRpb25zKSB7XG5cdFx0XHRcdGlmICghdGhpcy5jaGVjaygpKVxuXHRcdFx0XHRcdHRocm93IEVycm9yKCdjb29raWVzIGFyZSBkaXNhYmxlZCcpO1xuXHRcdFx0XHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0XHRcdFx0aWYgKCFrZXkpXG5cdFx0XHRcdFx0dGhyb3cgRXJyb3IoJ2ludmFsaWQga2V5Jyk7XG5cdFx0XHRcdHZhciBjb29raWUgPSBlbmNvZGVVUklDb21wb25lbnQoa2V5KSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSk7XG5cdFx0XHRcdC8vIGhhbmRsZSBleHBpcmF0aW9uIGRheXNcblx0XHRcdFx0aWYgKG9wdGlvbnMuZXhwaXJlRGF5cykge1xuXHRcdFx0XHRcdHZhciBkYXRlID0gbmV3IERhdGUoKTtcblx0XHRcdFx0XHRkYXRlLnNldFRpbWUoZGF0ZS5nZXRUaW1lKCkgKyAob3B0aW9ucy5leHBpcmVEYXlzICogMjQgKiA2MCAqIDYwICogMTAwMCkpO1xuXHRcdFx0XHRcdGNvb2tpZSArPSAnOyBleHBpcmVzPScgKyBkYXRlLnRvR01UU3RyaW5nKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gaGFuZGxlIGRvbWFpblxuXHRcdFx0XHRpZiAob3B0aW9ucy5kb21haW4gJiYgb3B0aW9ucy5kb21haW4gIT09IGRvY3VtZW50LmRvbWFpbikge1xuXHRcdFx0XHRcdHZhciBfZG9tYWluID0gb3B0aW9ucy5kb21haW4ucmVwbGFjZSgvXlxcLi8sICcnKTtcblx0XHRcdFx0XHRpZiAoZG9jdW1lbnQuZG9tYWluLmluZGV4T2YoX2RvbWFpbikgPT09IC0xIHx8IF9kb21haW4uc3BsaXQoJy4nKS5sZW5ndGggPD0gMSlcblx0XHRcdFx0XHRcdHRocm93IEVycm9yKCdpbnZhbGlkIGRvbWFpbicpO1xuXHRcdFx0XHRcdGNvb2tpZSArPSAnOyBkb21haW49JyArIG9wdGlvbnMuZG9tYWluO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIGhhbmRsZSBzYW1lIHNpdGVcblx0XHRcdFx0aWYgKG9wdGlvbnMuc2FtZVNpdGUgJiYgWydsYXgnLCdzdHJpY3QnLCdub25lJ10uaW5jbHVkZXMob3B0aW9ucy5zYW1lU2l0ZS50b0xvd2VyQ2FzZSgpKSkge1xuXHRcdFx0XHRcdGNvb2tpZSArPSAnOyBTYW1lU2l0ZT0nICsgb3B0aW9ucy5zYW1lU2l0ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBoYW5kbGUgc2VjdXJlXG5cdFx0XHRcdGlmIChvcHRpb25zLnNlY3VyZSA9PT0gdHJ1ZSkge1xuXHRcdFx0XHRcdGNvb2tpZSArPSAnOyBTZWN1cmUnO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGRvY3VtZW50LmNvb2tpZSA9IGNvb2tpZSArICc7IHBhdGg9Lyc7XG5cdFx0XHR9LFxuXHRcdFx0Z2V0OiBmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHRcdGlmICghdGhpcy5jaGVjaygpKVxuXHRcdFx0XHRcdHRocm93IEVycm9yKCdjb29raWVzIGFyZSBkaXNhYmxlZCcpO1xuXHRcdFx0XHR2YXIgZW5jb2RlZEtleSA9IGVuY29kZVVSSUNvbXBvbmVudChrZXkpO1xuXHRcdFx0XHR2YXIgY29va2llcyA9IGRvY3VtZW50LmNvb2tpZSA/IGRvY3VtZW50LmNvb2tpZS5zcGxpdCgnOycpIDogW107XG5cdFx0XHRcdC8vIHJldHJpZXZlIGxhc3QgdXBkYXRlZCBjb29raWUgZmlyc3Rcblx0XHRcdFx0Zm9yICh2YXIgaSA9IGNvb2tpZXMubGVuZ3RoIC0gMSwgY29va2llOyBpID49IDA7IGktLSkge1xuXHRcdFx0XHRcdGNvb2tpZSA9IGNvb2tpZXNbaV0ucmVwbGFjZSgvXlxccyovLCAnJyk7XG5cdFx0XHRcdFx0aWYgKGNvb2tpZS5pbmRleE9mKGVuY29kZWRLZXkgKyAnPScpID09PSAwKVxuXHRcdFx0XHRcdFx0cmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChjb29raWUuc3Vic3RyaW5nKGVuY29kZWRLZXkubGVuZ3RoICsgMSwgY29va2llLmxlbmd0aCkpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0fSxcblx0XHRcdHJlbW92ZTogZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0XHQvLyByZW1vdmUgY29va2llIGZyb20gbWFpbiBkb21haW5cblx0XHRcdFx0dGhpcy5zZXQoa2V5LCAnJywgeyBleHBpcmVEYXlzOiAtMSB9KTtcblx0XHRcdFx0Ly8gcmVtb3ZlIGNvb2tpZSBmcm9tIHVwcGVyIGRvbWFpbnNcblx0XHRcdFx0dmFyIGRvbWFpblBhcnRzID0gZG9jdW1lbnQuZG9tYWluLnNwbGl0KCcuJyk7XG5cdFx0XHRcdGZvciAodmFyIGkgPSBkb21haW5QYXJ0cy5sZW5ndGg7IGkgPiAxOyBpLS0pIHtcblx0XHRcdFx0XHR0aGlzLnNldChrZXksICcnLCB7IGV4cGlyZURheXM6IC0xLCBkb21haW46ICcuJyArIGRvbWFpblBhcnRzLnNsaWNlKC0gaSkuam9pbignLicpIH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0cmVzZXQ6IGZ1bmN0aW9uIChuYW1lc3BhY2UpIHtcblx0XHRcdFx0dmFyIGNvb2tpZXMgPSBkb2N1bWVudC5jb29raWUgPyBkb2N1bWVudC5jb29raWUuc3BsaXQoJzsnKSA6IFtdO1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMCwgY29va2llLCBrZXk7IGkgPCBjb29raWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0Y29va2llID0gY29va2llc1tpXS5yZXBsYWNlKC9eXFxzKi8sICcnKTtcblx0XHRcdFx0XHRrZXkgPSBjb29raWUuc3Vic3RyKDAsIGNvb2tpZS5pbmRleE9mKCc9JykpO1xuXHRcdFx0XHRcdGlmICghbmFtZXNwYWNlIHx8IGtleS5pbmRleE9mKG5hbWVzcGFjZSkgPT09IDApXG5cdFx0XHRcdFx0XHR0aGlzLnJlbW92ZShrZXkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0a2V5czogZnVuY3Rpb24gKG5hbWVzcGFjZSwgZGVsaW1pdGVyKSB7XG5cdFx0XHRcdGlmICghdGhpcy5jaGVjaygpKVxuXHRcdFx0XHRcdHRocm93IEVycm9yKCdjb29raWVzIGFyZSBkaXNhYmxlZCcpO1xuXHRcdFx0XHR2YXIga2V5cyA9IFtdLFxuXHRcdFx0XHRcdGNvb2tpZXMgPSBkb2N1bWVudC5jb29raWUgPyBkb2N1bWVudC5jb29raWUuc3BsaXQoJzsnKSA6IFtdO1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMCwgY29va2llLCBrZXk7IGkgPCBjb29raWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0Y29va2llID0gY29va2llc1tpXS5yZXBsYWNlKC9eXFxzKi8sICcnKTtcblx0XHRcdFx0XHRrZXkgPSBkZWNvZGVVUklDb21wb25lbnQoY29va2llLnN1YnN0cigwLCBjb29raWUuaW5kZXhPZignPScpKSk7XG5cdFx0XHRcdFx0aWYgKCFuYW1lc3BhY2UgfHwga2V5LmluZGV4T2YobmFtZXNwYWNlKSA9PT0gMClcblx0XHRcdFx0XHRcdGtleXMucHVzaChfdG9LZXlOYW1lKG5hbWVzcGFjZSwga2V5LCBkZWxpbWl0ZXIpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4ga2V5cztcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdGluaXQ6IGZ1bmN0aW9uIChvcHRpb25zKSB7XG5cdFx0XHRcdHRoaXMuc2V0T3B0aW9ucyhvcHRpb25zKTtcblx0XHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0XHR9LFxuXHRcdFx0c2V0T3B0aW9uczogZnVuY3Rpb24gKG9wdGlvbnMpIHtcblx0XHRcdFx0dGhpcy5vcHRpb25zID0gQmFzaWwudXRpbHMuZXh0ZW5kKHt9LCB0aGlzLm9wdGlvbnMgfHwgQmFzaWwub3B0aW9ucywgb3B0aW9ucyk7XG5cdFx0XHR9LFxuXHRcdFx0c3VwcG9ydDogZnVuY3Rpb24gKHN0b3JhZ2UpIHtcblx0XHRcdFx0cmV0dXJuIF9zdG9yYWdlcy5oYXNPd25Qcm9wZXJ0eShzdG9yYWdlKTtcblx0XHRcdH0sXG5cdFx0XHRjaGVjazogZnVuY3Rpb24gKHN0b3JhZ2UpIHtcblx0XHRcdFx0aWYgKHRoaXMuc3VwcG9ydChzdG9yYWdlKSlcblx0XHRcdFx0XHRyZXR1cm4gX3N0b3JhZ2VzW3N0b3JhZ2VdLmNoZWNrKHRoaXMub3B0aW9ucyk7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH0sXG5cdFx0XHRzZXQ6IGZ1bmN0aW9uIChrZXksIHZhbHVlLCBvcHRpb25zKSB7XG5cdFx0XHRcdG9wdGlvbnMgPSBCYXNpbC51dGlscy5leHRlbmQoe30sIHRoaXMub3B0aW9ucywgb3B0aW9ucyk7XG5cdFx0XHRcdGlmICghKGtleSA9IF90b1N0b3JlZEtleShvcHRpb25zLm5hbWVzcGFjZSwga2V5LCBvcHRpb25zLmtleURlbGltaXRlcikpKVxuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0dmFsdWUgPSBvcHRpb25zLnJhdyA9PT0gdHJ1ZSA/IHZhbHVlIDogX3RvU3RvcmVkVmFsdWUodmFsdWUpO1xuXHRcdFx0XHR2YXIgd2hlcmUgPSBudWxsO1xuXHRcdFx0XHQvLyB0cnkgdG8gc2V0IGtleS92YWx1ZSBpbiBmaXJzdCBhdmFpbGFibGUgc3RvcmFnZVxuXHRcdFx0XHRCYXNpbC51dGlscy50cnlFYWNoKF90b1N0b3JhZ2VzQXJyYXkob3B0aW9ucy5zdG9yYWdlcyksIGZ1bmN0aW9uIChzdG9yYWdlLCBpbmRleCkge1xuXHRcdFx0XHRcdF9zdG9yYWdlc1tzdG9yYWdlXS5zZXQoa2V5LCB2YWx1ZSwgb3B0aW9ucyk7XG5cdFx0XHRcdFx0d2hlcmUgPSBzdG9yYWdlO1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTsgLy8gYnJlYWs7XG5cdFx0XHRcdH0sIG51bGwsIHRoaXMpO1xuXHRcdFx0XHRpZiAoIXdoZXJlKSB7XG5cdFx0XHRcdFx0Ly8ga2V5IGhhcyBub3QgYmVlbiBzZXQgYW55d2hlcmVcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gcmVtb3ZlIGtleSBmcm9tIGFsbCBvdGhlciBzdG9yYWdlc1xuXHRcdFx0XHRCYXNpbC51dGlscy50cnlFYWNoKF90b1N0b3JhZ2VzQXJyYXkob3B0aW9ucy5zdG9yYWdlcyksIGZ1bmN0aW9uIChzdG9yYWdlLCBpbmRleCkge1xuXHRcdFx0XHRcdGlmIChzdG9yYWdlICE9PSB3aGVyZSlcblx0XHRcdFx0XHRcdF9zdG9yYWdlc1tzdG9yYWdlXS5yZW1vdmUoa2V5KTtcblx0XHRcdFx0fSwgbnVsbCwgdGhpcyk7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fSxcblx0XHRcdGdldDogZnVuY3Rpb24gKGtleSwgb3B0aW9ucykge1xuXHRcdFx0XHRvcHRpb25zID0gQmFzaWwudXRpbHMuZXh0ZW5kKHt9LCB0aGlzLm9wdGlvbnMsIG9wdGlvbnMpO1xuXHRcdFx0XHRpZiAoIShrZXkgPSBfdG9TdG9yZWRLZXkob3B0aW9ucy5uYW1lc3BhY2UsIGtleSwgb3B0aW9ucy5rZXlEZWxpbWl0ZXIpKSlcblx0XHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdFx0dmFyIHZhbHVlID0gbnVsbDtcblx0XHRcdFx0QmFzaWwudXRpbHMudHJ5RWFjaChfdG9TdG9yYWdlc0FycmF5KG9wdGlvbnMuc3RvcmFnZXMpLCBmdW5jdGlvbiAoc3RvcmFnZSwgaW5kZXgpIHtcblx0XHRcdFx0XHRpZiAodmFsdWUgIT09IG51bGwpXG5cdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7IC8vIGJyZWFrIGlmIGEgdmFsdWUgaGFzIGFscmVhZHkgYmVlbiBmb3VuZC5cblx0XHRcdFx0XHR2YWx1ZSA9IF9zdG9yYWdlc1tzdG9yYWdlXS5nZXQoa2V5LCBvcHRpb25zKSB8fCBudWxsO1xuXHRcdFx0XHRcdHZhbHVlID0gb3B0aW9ucy5yYXcgPT09IHRydWUgPyB2YWx1ZSA6IF9mcm9tU3RvcmVkVmFsdWUodmFsdWUpO1xuXHRcdFx0XHR9LCBmdW5jdGlvbiAoc3RvcmFnZSwgaW5kZXgsIGVycm9yKSB7XG5cdFx0XHRcdFx0dmFsdWUgPSBudWxsO1xuXHRcdFx0XHR9LCB0aGlzKTtcblx0XHRcdFx0cmV0dXJuIHZhbHVlO1xuXHRcdFx0fSxcblx0XHRcdHJlbW92ZTogZnVuY3Rpb24gKGtleSwgb3B0aW9ucykge1xuXHRcdFx0XHRvcHRpb25zID0gQmFzaWwudXRpbHMuZXh0ZW5kKHt9LCB0aGlzLm9wdGlvbnMsIG9wdGlvbnMpO1xuXHRcdFx0XHRpZiAoIShrZXkgPSBfdG9TdG9yZWRLZXkob3B0aW9ucy5uYW1lc3BhY2UsIGtleSwgb3B0aW9ucy5rZXlEZWxpbWl0ZXIpKSlcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdEJhc2lsLnV0aWxzLnRyeUVhY2goX3RvU3RvcmFnZXNBcnJheShvcHRpb25zLnN0b3JhZ2VzKSwgZnVuY3Rpb24gKHN0b3JhZ2UpIHtcblx0XHRcdFx0XHRfc3RvcmFnZXNbc3RvcmFnZV0ucmVtb3ZlKGtleSk7XG5cdFx0XHRcdH0sIG51bGwsIHRoaXMpO1xuXHRcdFx0fSxcblx0XHRcdHJlc2V0OiBmdW5jdGlvbiAob3B0aW9ucykge1xuXHRcdFx0XHRvcHRpb25zID0gQmFzaWwudXRpbHMuZXh0ZW5kKHt9LCB0aGlzLm9wdGlvbnMsIG9wdGlvbnMpO1xuXHRcdFx0XHRCYXNpbC51dGlscy50cnlFYWNoKF90b1N0b3JhZ2VzQXJyYXkob3B0aW9ucy5zdG9yYWdlcyksIGZ1bmN0aW9uIChzdG9yYWdlKSB7XG5cdFx0XHRcdFx0X3N0b3JhZ2VzW3N0b3JhZ2VdLnJlc2V0KG9wdGlvbnMubmFtZXNwYWNlKTtcblx0XHRcdFx0fSwgbnVsbCwgdGhpcyk7XG5cdFx0XHR9LFxuXHRcdFx0a2V5czogZnVuY3Rpb24gKG9wdGlvbnMpIHtcblx0XHRcdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdFx0XHRcdHZhciBrZXlzID0gW107XG5cdFx0XHRcdGZvciAodmFyIGtleSBpbiB0aGlzLmtleXNNYXAob3B0aW9ucykpXG5cdFx0XHRcdFx0a2V5cy5wdXNoKGtleSk7XG5cdFx0XHRcdHJldHVybiBrZXlzO1xuXHRcdFx0fSxcblx0XHRcdGtleXNNYXA6IGZ1bmN0aW9uIChvcHRpb25zKSB7XG5cdFx0XHRcdG9wdGlvbnMgPSBCYXNpbC51dGlscy5leHRlbmQoe30sIHRoaXMub3B0aW9ucywgb3B0aW9ucyk7XG5cdFx0XHRcdHZhciBtYXAgPSB7fTtcblx0XHRcdFx0QmFzaWwudXRpbHMudHJ5RWFjaChfdG9TdG9yYWdlc0FycmF5KG9wdGlvbnMuc3RvcmFnZXMpLCBmdW5jdGlvbiAoc3RvcmFnZSkge1xuXHRcdFx0XHRcdEJhc2lsLnV0aWxzLmVhY2goX3N0b3JhZ2VzW3N0b3JhZ2VdLmtleXMob3B0aW9ucy5uYW1lc3BhY2UsIG9wdGlvbnMua2V5RGVsaW1pdGVyKSwgZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0XHRcdFx0bWFwW2tleV0gPSBCYXNpbC51dGlscy5pc0FycmF5KG1hcFtrZXldKSA/IG1hcFtrZXldIDogW107XG5cdFx0XHRcdFx0XHRtYXBba2V5XS5wdXNoKHN0b3JhZ2UpO1xuXHRcdFx0XHRcdH0sIHRoaXMpO1xuXHRcdFx0XHR9LCBudWxsLCB0aGlzKTtcblx0XHRcdFx0cmV0dXJuIG1hcDtcblx0XHRcdH1cblx0XHR9O1xuXHR9O1xuXG5cdC8vIEFjY2VzcyB0byBuYXRpdmUgc3RvcmFnZXMsIHdpdGhvdXQgbmFtZXNwYWNlIG9yIGJhc2lsIHZhbHVlIGRlY29yYXRpb25cblx0QmFzaWwubWVtb3J5ID0gbmV3IEJhc2lsLlN0b3JhZ2UoKS5pbml0KHsgc3RvcmFnZXM6ICdtZW1vcnknLCBuYW1lc3BhY2U6IG51bGwsIHJhdzogdHJ1ZSB9KTtcblx0QmFzaWwuY29va2llID0gbmV3IEJhc2lsLlN0b3JhZ2UoKS5pbml0KHsgc3RvcmFnZXM6ICdjb29raWUnLCBuYW1lc3BhY2U6IG51bGwsIHJhdzogdHJ1ZSB9KTtcblx0QmFzaWwubG9jYWxTdG9yYWdlID0gbmV3IEJhc2lsLlN0b3JhZ2UoKS5pbml0KHsgc3RvcmFnZXM6ICdsb2NhbCcsIG5hbWVzcGFjZTogbnVsbCwgcmF3OiB0cnVlIH0pO1xuXHRCYXNpbC5zZXNzaW9uU3RvcmFnZSA9IG5ldyBCYXNpbC5TdG9yYWdlKCkuaW5pdCh7IHN0b3JhZ2VzOiAnc2Vzc2lvbicsIG5hbWVzcGFjZTogbnVsbCwgcmF3OiB0cnVlIH0pO1xuXG5cdC8vIGJyb3dzZXIgZXhwb3J0XG5cdHdpbmRvdy5CYXNpbCA9IEJhc2lsO1xuXG5cdC8vIEFNRCBleHBvcnRcblx0aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuXHRcdGRlZmluZShmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiBCYXNpbDtcblx0XHR9KTtcblx0Ly8gY29tbW9uanMgZXhwb3J0XG5cdH0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcblx0XHRtb2R1bGUuZXhwb3J0cyA9IEJhc2lsO1xuXHR9XG5cbn0pKCk7XG4iLCI7KGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG5cdGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xuXHRcdC8vIENvbW1vbkpTXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gZmFjdG9yeSgpO1xuXHR9XG5cdGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG5cdFx0Ly8gQU1EXG5cdFx0ZGVmaW5lKFtdLCBmYWN0b3J5KTtcblx0fVxuXHRlbHNlIHtcblx0XHQvLyBHbG9iYWwgKGJyb3dzZXIpXG5cdFx0cm9vdC5DcnlwdG9KUyA9IGZhY3RvcnkoKTtcblx0fVxufSh0aGlzLCBmdW5jdGlvbiAoKSB7XG5cblx0LyoqXG5cdCAqIENyeXB0b0pTIGNvcmUgY29tcG9uZW50cy5cblx0ICovXG5cdHZhciBDcnlwdG9KUyA9IENyeXB0b0pTIHx8IChmdW5jdGlvbiAoTWF0aCwgdW5kZWZpbmVkKSB7XG5cdCAgICAvKlxuXHQgICAgICogTG9jYWwgcG9seWZpbCBvZiBPYmplY3QuY3JlYXRlXG5cdCAgICAgKi9cblx0ICAgIHZhciBjcmVhdGUgPSBPYmplY3QuY3JlYXRlIHx8IChmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgZnVuY3Rpb24gRigpIHt9O1xuXG5cdCAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChvYmopIHtcblx0ICAgICAgICAgICAgdmFyIHN1YnR5cGU7XG5cblx0ICAgICAgICAgICAgRi5wcm90b3R5cGUgPSBvYmo7XG5cblx0ICAgICAgICAgICAgc3VidHlwZSA9IG5ldyBGKCk7XG5cblx0ICAgICAgICAgICAgRi5wcm90b3R5cGUgPSBudWxsO1xuXG5cdCAgICAgICAgICAgIHJldHVybiBzdWJ0eXBlO1xuXHQgICAgICAgIH07XG5cdCAgICB9KCkpXG5cblx0ICAgIC8qKlxuXHQgICAgICogQ3J5cHRvSlMgbmFtZXNwYWNlLlxuXHQgICAgICovXG5cdCAgICB2YXIgQyA9IHt9O1xuXG5cdCAgICAvKipcblx0ICAgICAqIExpYnJhcnkgbmFtZXNwYWNlLlxuXHQgICAgICovXG5cdCAgICB2YXIgQ19saWIgPSBDLmxpYiA9IHt9O1xuXG5cdCAgICAvKipcblx0ICAgICAqIEJhc2Ugb2JqZWN0IGZvciBwcm90b3R5cGFsIGluaGVyaXRhbmNlLlxuXHQgICAgICovXG5cdCAgICB2YXIgQmFzZSA9IENfbGliLkJhc2UgPSAoZnVuY3Rpb24gKCkge1xuXG5cblx0ICAgICAgICByZXR1cm4ge1xuXHQgICAgICAgICAgICAvKipcblx0ICAgICAgICAgICAgICogQ3JlYXRlcyBhIG5ldyBvYmplY3QgdGhhdCBpbmhlcml0cyBmcm9tIHRoaXMgb2JqZWN0LlxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gb3ZlcnJpZGVzIFByb3BlcnRpZXMgdG8gY29weSBpbnRvIHRoZSBuZXcgb2JqZWN0LlxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBuZXcgb2JqZWN0LlxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiBAc3RhdGljXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqICAgICB2YXIgTXlUeXBlID0gQ3J5cHRvSlMubGliLkJhc2UuZXh0ZW5kKHtcblx0ICAgICAgICAgICAgICogICAgICAgICBmaWVsZDogJ3ZhbHVlJyxcblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogICAgICAgICBtZXRob2Q6IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgICogICAgICAgICB9XG5cdCAgICAgICAgICAgICAqICAgICB9KTtcblx0ICAgICAgICAgICAgICovXG5cdCAgICAgICAgICAgIGV4dGVuZDogZnVuY3Rpb24gKG92ZXJyaWRlcykge1xuXHQgICAgICAgICAgICAgICAgLy8gU3Bhd25cblx0ICAgICAgICAgICAgICAgIHZhciBzdWJ0eXBlID0gY3JlYXRlKHRoaXMpO1xuXG5cdCAgICAgICAgICAgICAgICAvLyBBdWdtZW50XG5cdCAgICAgICAgICAgICAgICBpZiAob3ZlcnJpZGVzKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgc3VidHlwZS5taXhJbihvdmVycmlkZXMpO1xuXHQgICAgICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgICAgICAvLyBDcmVhdGUgZGVmYXVsdCBpbml0aWFsaXplclxuXHQgICAgICAgICAgICAgICAgaWYgKCFzdWJ0eXBlLmhhc093blByb3BlcnR5KCdpbml0JykgfHwgdGhpcy5pbml0ID09PSBzdWJ0eXBlLmluaXQpIHtcblx0ICAgICAgICAgICAgICAgICAgICBzdWJ0eXBlLmluaXQgPSBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIHN1YnR5cGUuJHN1cGVyLmluaXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0ICAgICAgICAgICAgICAgICAgICB9O1xuXHQgICAgICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgICAgICAvLyBJbml0aWFsaXplcidzIHByb3RvdHlwZSBpcyB0aGUgc3VidHlwZSBvYmplY3Rcblx0ICAgICAgICAgICAgICAgIHN1YnR5cGUuaW5pdC5wcm90b3R5cGUgPSBzdWJ0eXBlO1xuXG5cdCAgICAgICAgICAgICAgICAvLyBSZWZlcmVuY2Ugc3VwZXJ0eXBlXG5cdCAgICAgICAgICAgICAgICBzdWJ0eXBlLiRzdXBlciA9IHRoaXM7XG5cblx0ICAgICAgICAgICAgICAgIHJldHVybiBzdWJ0eXBlO1xuXHQgICAgICAgICAgICB9LFxuXG5cdCAgICAgICAgICAgIC8qKlxuXHQgICAgICAgICAgICAgKiBFeHRlbmRzIHRoaXMgb2JqZWN0IGFuZCBydW5zIHRoZSBpbml0IG1ldGhvZC5cblx0ICAgICAgICAgICAgICogQXJndW1lbnRzIHRvIGNyZWF0ZSgpIHdpbGwgYmUgcGFzc2VkIHRvIGluaXQoKS5cblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogQHJldHVybiB7T2JqZWN0fSBUaGUgbmV3IG9iamVjdC5cblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogQHN0YXRpY1xuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiAgICAgdmFyIGluc3RhbmNlID0gTXlUeXBlLmNyZWF0ZSgpO1xuXHQgICAgICAgICAgICAgKi9cblx0ICAgICAgICAgICAgY3JlYXRlOiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgICAgICB2YXIgaW5zdGFuY2UgPSB0aGlzLmV4dGVuZCgpO1xuXHQgICAgICAgICAgICAgICAgaW5zdGFuY2UuaW5pdC5hcHBseShpbnN0YW5jZSwgYXJndW1lbnRzKTtcblxuXHQgICAgICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlO1xuXHQgICAgICAgICAgICB9LFxuXG5cdCAgICAgICAgICAgIC8qKlxuXHQgICAgICAgICAgICAgKiBJbml0aWFsaXplcyBhIG5ld2x5IGNyZWF0ZWQgb2JqZWN0LlxuXHQgICAgICAgICAgICAgKiBPdmVycmlkZSB0aGlzIG1ldGhvZCB0byBhZGQgc29tZSBsb2dpYyB3aGVuIHlvdXIgb2JqZWN0cyBhcmUgY3JlYXRlZC5cblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogICAgIHZhciBNeVR5cGUgPSBDcnlwdG9KUy5saWIuQmFzZS5leHRlbmQoe1xuXHQgICAgICAgICAgICAgKiAgICAgICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgICogICAgICAgICAgICAgLy8gLi4uXG5cdCAgICAgICAgICAgICAqICAgICAgICAgfVxuXHQgICAgICAgICAgICAgKiAgICAgfSk7XG5cdCAgICAgICAgICAgICAqL1xuXHQgICAgICAgICAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgIH0sXG5cblx0ICAgICAgICAgICAgLyoqXG5cdCAgICAgICAgICAgICAqIENvcGllcyBwcm9wZXJ0aWVzIGludG8gdGhpcyBvYmplY3QuXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBwcm9wZXJ0aWVzIFRoZSBwcm9wZXJ0aWVzIHRvIG1peCBpbi5cblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogICAgIE15VHlwZS5taXhJbih7XG5cdCAgICAgICAgICAgICAqICAgICAgICAgZmllbGQ6ICd2YWx1ZSdcblx0ICAgICAgICAgICAgICogICAgIH0pO1xuXHQgICAgICAgICAgICAgKi9cblx0ICAgICAgICAgICAgbWl4SW46IGZ1bmN0aW9uIChwcm9wZXJ0aWVzKSB7XG5cdCAgICAgICAgICAgICAgICBmb3IgKHZhciBwcm9wZXJ0eU5hbWUgaW4gcHJvcGVydGllcykge1xuXHQgICAgICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0aWVzLmhhc093blByb3BlcnR5KHByb3BlcnR5TmFtZSkpIHtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgdGhpc1twcm9wZXJ0eU5hbWVdID0gcHJvcGVydGllc1twcm9wZXJ0eU5hbWVdO1xuXHQgICAgICAgICAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICAgICAgLy8gSUUgd29uJ3QgY29weSB0b1N0cmluZyB1c2luZyB0aGUgbG9vcCBhYm92ZVxuXHQgICAgICAgICAgICAgICAgaWYgKHByb3BlcnRpZXMuaGFzT3duUHJvcGVydHkoJ3RvU3RyaW5nJykpIHtcblx0ICAgICAgICAgICAgICAgICAgICB0aGlzLnRvU3RyaW5nID0gcHJvcGVydGllcy50b1N0cmluZztcblx0ICAgICAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgfSxcblxuXHQgICAgICAgICAgICAvKipcblx0ICAgICAgICAgICAgICogQ3JlYXRlcyBhIGNvcHkgb2YgdGhpcyBvYmplY3QuXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqIEByZXR1cm4ge09iamVjdH0gVGhlIGNsb25lLlxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiAgICAgdmFyIGNsb25lID0gaW5zdGFuY2UuY2xvbmUoKTtcblx0ICAgICAgICAgICAgICovXG5cdCAgICAgICAgICAgIGNsb25lOiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5pbml0LnByb3RvdHlwZS5leHRlbmQodGhpcyk7XG5cdCAgICAgICAgICAgIH1cblx0ICAgICAgICB9O1xuXHQgICAgfSgpKTtcblxuXHQgICAgLyoqXG5cdCAgICAgKiBBbiBhcnJheSBvZiAzMi1iaXQgd29yZHMuXG5cdCAgICAgKlxuXHQgICAgICogQHByb3BlcnR5IHtBcnJheX0gd29yZHMgVGhlIGFycmF5IG9mIDMyLWJpdCB3b3Jkcy5cblx0ICAgICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBzaWdCeXRlcyBUaGUgbnVtYmVyIG9mIHNpZ25pZmljYW50IGJ5dGVzIGluIHRoaXMgd29yZCBhcnJheS5cblx0ICAgICAqL1xuXHQgICAgdmFyIFdvcmRBcnJheSA9IENfbGliLldvcmRBcnJheSA9IEJhc2UuZXh0ZW5kKHtcblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBJbml0aWFsaXplcyBhIG5ld2x5IGNyZWF0ZWQgd29yZCBhcnJheS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7QXJyYXl9IHdvcmRzIChPcHRpb25hbCkgQW4gYXJyYXkgb2YgMzItYml0IHdvcmRzLlxuXHQgICAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzaWdCeXRlcyAoT3B0aW9uYWwpIFRoZSBudW1iZXIgb2Ygc2lnbmlmaWNhbnQgYnl0ZXMgaW4gdGhlIHdvcmRzLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgd29yZEFycmF5ID0gQ3J5cHRvSlMubGliLldvcmRBcnJheS5jcmVhdGUoKTtcblx0ICAgICAgICAgKiAgICAgdmFyIHdvcmRBcnJheSA9IENyeXB0b0pTLmxpYi5Xb3JkQXJyYXkuY3JlYXRlKFsweDAwMDEwMjAzLCAweDA0MDUwNjA3XSk7XG5cdCAgICAgICAgICogICAgIHZhciB3b3JkQXJyYXkgPSBDcnlwdG9KUy5saWIuV29yZEFycmF5LmNyZWF0ZShbMHgwMDAxMDIwMywgMHgwNDA1MDYwN10sIDYpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIGluaXQ6IGZ1bmN0aW9uICh3b3Jkcywgc2lnQnl0ZXMpIHtcblx0ICAgICAgICAgICAgd29yZHMgPSB0aGlzLndvcmRzID0gd29yZHMgfHwgW107XG5cblx0ICAgICAgICAgICAgaWYgKHNpZ0J5dGVzICE9IHVuZGVmaW5lZCkge1xuXHQgICAgICAgICAgICAgICAgdGhpcy5zaWdCeXRlcyA9IHNpZ0J5dGVzO1xuXHQgICAgICAgICAgICB9IGVsc2Uge1xuXHQgICAgICAgICAgICAgICAgdGhpcy5zaWdCeXRlcyA9IHdvcmRzLmxlbmd0aCAqIDQ7XG5cdCAgICAgICAgICAgIH1cblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogQ29udmVydHMgdGhpcyB3b3JkIGFycmF5IHRvIGEgc3RyaW5nLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtFbmNvZGVyfSBlbmNvZGVyIChPcHRpb25hbCkgVGhlIGVuY29kaW5nIHN0cmF0ZWd5IHRvIHVzZS4gRGVmYXVsdDogQ3J5cHRvSlMuZW5jLkhleFxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7c3RyaW5nfSBUaGUgc3RyaW5naWZpZWQgd29yZCBhcnJheS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIHN0cmluZyA9IHdvcmRBcnJheSArICcnO1xuXHQgICAgICAgICAqICAgICB2YXIgc3RyaW5nID0gd29yZEFycmF5LnRvU3RyaW5nKCk7XG5cdCAgICAgICAgICogICAgIHZhciBzdHJpbmcgPSB3b3JkQXJyYXkudG9TdHJpbmcoQ3J5cHRvSlMuZW5jLlV0ZjgpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIHRvU3RyaW5nOiBmdW5jdGlvbiAoZW5jb2Rlcikge1xuXHQgICAgICAgICAgICByZXR1cm4gKGVuY29kZXIgfHwgSGV4KS5zdHJpbmdpZnkodGhpcyk7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIENvbmNhdGVuYXRlcyBhIHdvcmQgYXJyYXkgdG8gdGhpcyB3b3JkIGFycmF5LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtXb3JkQXJyYXl9IHdvcmRBcnJheSBUaGUgd29yZCBhcnJheSB0byBhcHBlbmQuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtXb3JkQXJyYXl9IFRoaXMgd29yZCBhcnJheS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgd29yZEFycmF5MS5jb25jYXQod29yZEFycmF5Mik7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgY29uY2F0OiBmdW5jdGlvbiAod29yZEFycmF5KSB7XG5cdCAgICAgICAgICAgIC8vIFNob3J0Y3V0c1xuXHQgICAgICAgICAgICB2YXIgdGhpc1dvcmRzID0gdGhpcy53b3Jkcztcblx0ICAgICAgICAgICAgdmFyIHRoYXRXb3JkcyA9IHdvcmRBcnJheS53b3Jkcztcblx0ICAgICAgICAgICAgdmFyIHRoaXNTaWdCeXRlcyA9IHRoaXMuc2lnQnl0ZXM7XG5cdCAgICAgICAgICAgIHZhciB0aGF0U2lnQnl0ZXMgPSB3b3JkQXJyYXkuc2lnQnl0ZXM7XG5cblx0ICAgICAgICAgICAgLy8gQ2xhbXAgZXhjZXNzIGJpdHNcblx0ICAgICAgICAgICAgdGhpcy5jbGFtcCgpO1xuXG5cdCAgICAgICAgICAgIC8vIENvbmNhdFxuXHQgICAgICAgICAgICBpZiAodGhpc1NpZ0J5dGVzICUgNCkge1xuXHQgICAgICAgICAgICAgICAgLy8gQ29weSBvbmUgYnl0ZSBhdCBhIHRpbWVcblx0ICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhhdFNpZ0J5dGVzOyBpKyspIHtcblx0ICAgICAgICAgICAgICAgICAgICB2YXIgdGhhdEJ5dGUgPSAodGhhdFdvcmRzW2kgPj4+IDJdID4+PiAoMjQgLSAoaSAlIDQpICogOCkpICYgMHhmZjtcblx0ICAgICAgICAgICAgICAgICAgICB0aGlzV29yZHNbKHRoaXNTaWdCeXRlcyArIGkpID4+PiAyXSB8PSB0aGF0Qnl0ZSA8PCAoMjQgLSAoKHRoaXNTaWdCeXRlcyArIGkpICUgNCkgKiA4KTtcblx0ICAgICAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgfSBlbHNlIHtcblx0ICAgICAgICAgICAgICAgIC8vIENvcHkgb25lIHdvcmQgYXQgYSB0aW1lXG5cdCAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoYXRTaWdCeXRlczsgaSArPSA0KSB7XG5cdCAgICAgICAgICAgICAgICAgICAgdGhpc1dvcmRzWyh0aGlzU2lnQnl0ZXMgKyBpKSA+Pj4gMl0gPSB0aGF0V29yZHNbaSA+Pj4gMl07XG5cdCAgICAgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgdGhpcy5zaWdCeXRlcyArPSB0aGF0U2lnQnl0ZXM7XG5cblx0ICAgICAgICAgICAgLy8gQ2hhaW5hYmxlXG5cdCAgICAgICAgICAgIHJldHVybiB0aGlzO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBSZW1vdmVzIGluc2lnbmlmaWNhbnQgYml0cy5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgd29yZEFycmF5LmNsYW1wKCk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgY2xhbXA6IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgLy8gU2hvcnRjdXRzXG5cdCAgICAgICAgICAgIHZhciB3b3JkcyA9IHRoaXMud29yZHM7XG5cdCAgICAgICAgICAgIHZhciBzaWdCeXRlcyA9IHRoaXMuc2lnQnl0ZXM7XG5cblx0ICAgICAgICAgICAgLy8gQ2xhbXBcblx0ICAgICAgICAgICAgd29yZHNbc2lnQnl0ZXMgPj4+IDJdICY9IDB4ZmZmZmZmZmYgPDwgKDMyIC0gKHNpZ0J5dGVzICUgNCkgKiA4KTtcblx0ICAgICAgICAgICAgd29yZHMubGVuZ3RoID0gTWF0aC5jZWlsKHNpZ0J5dGVzIC8gNCk7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIENyZWF0ZXMgYSBjb3B5IG9mIHRoaXMgd29yZCBhcnJheS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge1dvcmRBcnJheX0gVGhlIGNsb25lLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgY2xvbmUgPSB3b3JkQXJyYXkuY2xvbmUoKTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBjbG9uZTogZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICB2YXIgY2xvbmUgPSBCYXNlLmNsb25lLmNhbGwodGhpcyk7XG5cdCAgICAgICAgICAgIGNsb25lLndvcmRzID0gdGhpcy53b3Jkcy5zbGljZSgwKTtcblxuXHQgICAgICAgICAgICByZXR1cm4gY2xvbmU7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIENyZWF0ZXMgYSB3b3JkIGFycmF5IGZpbGxlZCB3aXRoIHJhbmRvbSBieXRlcy5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSBuQnl0ZXMgVGhlIG51bWJlciBvZiByYW5kb20gYnl0ZXMgdG8gZ2VuZXJhdGUuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtXb3JkQXJyYXl9IFRoZSByYW5kb20gd29yZCBhcnJheS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBzdGF0aWNcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIHdvcmRBcnJheSA9IENyeXB0b0pTLmxpYi5Xb3JkQXJyYXkucmFuZG9tKDE2KTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICByYW5kb206IGZ1bmN0aW9uIChuQnl0ZXMpIHtcblx0ICAgICAgICAgICAgdmFyIHdvcmRzID0gW107XG5cblx0ICAgICAgICAgICAgdmFyIHIgPSAoZnVuY3Rpb24gKG1fdykge1xuXHQgICAgICAgICAgICAgICAgdmFyIG1fdyA9IG1fdztcblx0ICAgICAgICAgICAgICAgIHZhciBtX3ogPSAweDNhZGU2OGIxO1xuXHQgICAgICAgICAgICAgICAgdmFyIG1hc2sgPSAweGZmZmZmZmZmO1xuXG5cdCAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICAgICAgICAgIG1feiA9ICgweDkwNjkgKiAobV96ICYgMHhGRkZGKSArIChtX3ogPj4gMHgxMCkpICYgbWFzaztcblx0ICAgICAgICAgICAgICAgICAgICBtX3cgPSAoMHg0NjUwICogKG1fdyAmIDB4RkZGRikgKyAobV93ID4+IDB4MTApKSAmIG1hc2s7XG5cdCAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9ICgobV96IDw8IDB4MTApICsgbV93KSAmIG1hc2s7XG5cdCAgICAgICAgICAgICAgICAgICAgcmVzdWx0IC89IDB4MTAwMDAwMDAwO1xuXHQgICAgICAgICAgICAgICAgICAgIHJlc3VsdCArPSAwLjU7XG5cdCAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdCAqIChNYXRoLnJhbmRvbSgpID4gLjUgPyAxIDogLTEpO1xuXHQgICAgICAgICAgICAgICAgfVxuXHQgICAgICAgICAgICB9KTtcblxuXHQgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgcmNhY2hlOyBpIDwgbkJ5dGVzOyBpICs9IDQpIHtcblx0ICAgICAgICAgICAgICAgIHZhciBfciA9IHIoKHJjYWNoZSB8fCBNYXRoLnJhbmRvbSgpKSAqIDB4MTAwMDAwMDAwKTtcblxuXHQgICAgICAgICAgICAgICAgcmNhY2hlID0gX3IoKSAqIDB4M2FkZTY3Yjc7XG5cdCAgICAgICAgICAgICAgICB3b3Jkcy5wdXNoKChfcigpICogMHgxMDAwMDAwMDApIHwgMCk7XG5cdCAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICByZXR1cm4gbmV3IFdvcmRBcnJheS5pbml0KHdvcmRzLCBuQnl0ZXMpO1xuXHQgICAgICAgIH1cblx0ICAgIH0pO1xuXG5cdCAgICAvKipcblx0ICAgICAqIEVuY29kZXIgbmFtZXNwYWNlLlxuXHQgICAgICovXG5cdCAgICB2YXIgQ19lbmMgPSBDLmVuYyA9IHt9O1xuXG5cdCAgICAvKipcblx0ICAgICAqIEhleCBlbmNvZGluZyBzdHJhdGVneS5cblx0ICAgICAqL1xuXHQgICAgdmFyIEhleCA9IENfZW5jLkhleCA9IHtcblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBDb252ZXJ0cyBhIHdvcmQgYXJyYXkgdG8gYSBoZXggc3RyaW5nLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtXb3JkQXJyYXl9IHdvcmRBcnJheSBUaGUgd29yZCBhcnJheS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge3N0cmluZ30gVGhlIGhleCBzdHJpbmcuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAc3RhdGljXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciBoZXhTdHJpbmcgPSBDcnlwdG9KUy5lbmMuSGV4LnN0cmluZ2lmeSh3b3JkQXJyYXkpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIHN0cmluZ2lmeTogZnVuY3Rpb24gKHdvcmRBcnJheSkge1xuXHQgICAgICAgICAgICAvLyBTaG9ydGN1dHNcblx0ICAgICAgICAgICAgdmFyIHdvcmRzID0gd29yZEFycmF5LndvcmRzO1xuXHQgICAgICAgICAgICB2YXIgc2lnQnl0ZXMgPSB3b3JkQXJyYXkuc2lnQnl0ZXM7XG5cblx0ICAgICAgICAgICAgLy8gQ29udmVydFxuXHQgICAgICAgICAgICB2YXIgaGV4Q2hhcnMgPSBbXTtcblx0ICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzaWdCeXRlczsgaSsrKSB7XG5cdCAgICAgICAgICAgICAgICB2YXIgYml0ZSA9ICh3b3Jkc1tpID4+PiAyXSA+Pj4gKDI0IC0gKGkgJSA0KSAqIDgpKSAmIDB4ZmY7XG5cdCAgICAgICAgICAgICAgICBoZXhDaGFycy5wdXNoKChiaXRlID4+PiA0KS50b1N0cmluZygxNikpO1xuXHQgICAgICAgICAgICAgICAgaGV4Q2hhcnMucHVzaCgoYml0ZSAmIDB4MGYpLnRvU3RyaW5nKDE2KSk7XG5cdCAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICByZXR1cm4gaGV4Q2hhcnMuam9pbignJyk7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIENvbnZlcnRzIGEgaGV4IHN0cmluZyB0byBhIHdvcmQgYXJyYXkuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gaGV4U3RyIFRoZSBoZXggc3RyaW5nLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7V29yZEFycmF5fSBUaGUgd29yZCBhcnJheS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBzdGF0aWNcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIHdvcmRBcnJheSA9IENyeXB0b0pTLmVuYy5IZXgucGFyc2UoaGV4U3RyaW5nKTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBwYXJzZTogZnVuY3Rpb24gKGhleFN0cikge1xuXHQgICAgICAgICAgICAvLyBTaG9ydGN1dFxuXHQgICAgICAgICAgICB2YXIgaGV4U3RyTGVuZ3RoID0gaGV4U3RyLmxlbmd0aDtcblxuXHQgICAgICAgICAgICAvLyBDb252ZXJ0XG5cdCAgICAgICAgICAgIHZhciB3b3JkcyA9IFtdO1xuXHQgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhleFN0ckxlbmd0aDsgaSArPSAyKSB7XG5cdCAgICAgICAgICAgICAgICB3b3Jkc1tpID4+PiAzXSB8PSBwYXJzZUludChoZXhTdHIuc3Vic3RyKGksIDIpLCAxNikgPDwgKDI0IC0gKGkgJSA4KSAqIDQpO1xuXHQgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgcmV0dXJuIG5ldyBXb3JkQXJyYXkuaW5pdCh3b3JkcywgaGV4U3RyTGVuZ3RoIC8gMik7XG5cdCAgICAgICAgfVxuXHQgICAgfTtcblxuXHQgICAgLyoqXG5cdCAgICAgKiBMYXRpbjEgZW5jb2Rpbmcgc3RyYXRlZ3kuXG5cdCAgICAgKi9cblx0ICAgIHZhciBMYXRpbjEgPSBDX2VuYy5MYXRpbjEgPSB7XG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogQ29udmVydHMgYSB3b3JkIGFycmF5IHRvIGEgTGF0aW4xIHN0cmluZy5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7V29yZEFycmF5fSB3b3JkQXJyYXkgVGhlIHdvcmQgYXJyYXkuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBMYXRpbjEgc3RyaW5nLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHN0YXRpY1xuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgbGF0aW4xU3RyaW5nID0gQ3J5cHRvSlMuZW5jLkxhdGluMS5zdHJpbmdpZnkod29yZEFycmF5KTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBzdHJpbmdpZnk6IGZ1bmN0aW9uICh3b3JkQXJyYXkpIHtcblx0ICAgICAgICAgICAgLy8gU2hvcnRjdXRzXG5cdCAgICAgICAgICAgIHZhciB3b3JkcyA9IHdvcmRBcnJheS53b3Jkcztcblx0ICAgICAgICAgICAgdmFyIHNpZ0J5dGVzID0gd29yZEFycmF5LnNpZ0J5dGVzO1xuXG5cdCAgICAgICAgICAgIC8vIENvbnZlcnRcblx0ICAgICAgICAgICAgdmFyIGxhdGluMUNoYXJzID0gW107XG5cdCAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2lnQnl0ZXM7IGkrKykge1xuXHQgICAgICAgICAgICAgICAgdmFyIGJpdGUgPSAod29yZHNbaSA+Pj4gMl0gPj4+ICgyNCAtIChpICUgNCkgKiA4KSkgJiAweGZmO1xuXHQgICAgICAgICAgICAgICAgbGF0aW4xQ2hhcnMucHVzaChTdHJpbmcuZnJvbUNoYXJDb2RlKGJpdGUpKTtcblx0ICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgIHJldHVybiBsYXRpbjFDaGFycy5qb2luKCcnKTtcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogQ29udmVydHMgYSBMYXRpbjEgc3RyaW5nIHRvIGEgd29yZCBhcnJheS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBsYXRpbjFTdHIgVGhlIExhdGluMSBzdHJpbmcuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtXb3JkQXJyYXl9IFRoZSB3b3JkIGFycmF5LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHN0YXRpY1xuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgd29yZEFycmF5ID0gQ3J5cHRvSlMuZW5jLkxhdGluMS5wYXJzZShsYXRpbjFTdHJpbmcpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIHBhcnNlOiBmdW5jdGlvbiAobGF0aW4xU3RyKSB7XG5cdCAgICAgICAgICAgIC8vIFNob3J0Y3V0XG5cdCAgICAgICAgICAgIHZhciBsYXRpbjFTdHJMZW5ndGggPSBsYXRpbjFTdHIubGVuZ3RoO1xuXG5cdCAgICAgICAgICAgIC8vIENvbnZlcnRcblx0ICAgICAgICAgICAgdmFyIHdvcmRzID0gW107XG5cdCAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGF0aW4xU3RyTGVuZ3RoOyBpKyspIHtcblx0ICAgICAgICAgICAgICAgIHdvcmRzW2kgPj4+IDJdIHw9IChsYXRpbjFTdHIuY2hhckNvZGVBdChpKSAmIDB4ZmYpIDw8ICgyNCAtIChpICUgNCkgKiA4KTtcblx0ICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgIHJldHVybiBuZXcgV29yZEFycmF5LmluaXQod29yZHMsIGxhdGluMVN0ckxlbmd0aCk7XG5cdCAgICAgICAgfVxuXHQgICAgfTtcblxuXHQgICAgLyoqXG5cdCAgICAgKiBVVEYtOCBlbmNvZGluZyBzdHJhdGVneS5cblx0ICAgICAqL1xuXHQgICAgdmFyIFV0ZjggPSBDX2VuYy5VdGY4ID0ge1xuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIENvbnZlcnRzIGEgd29yZCBhcnJheSB0byBhIFVURi04IHN0cmluZy5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7V29yZEFycmF5fSB3b3JkQXJyYXkgVGhlIHdvcmQgYXJyYXkuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBVVEYtOCBzdHJpbmcuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAc3RhdGljXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciB1dGY4U3RyaW5nID0gQ3J5cHRvSlMuZW5jLlV0Zjguc3RyaW5naWZ5KHdvcmRBcnJheSk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgc3RyaW5naWZ5OiBmdW5jdGlvbiAod29yZEFycmF5KSB7XG5cdCAgICAgICAgICAgIHRyeSB7XG5cdCAgICAgICAgICAgICAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KGVzY2FwZShMYXRpbjEuc3RyaW5naWZ5KHdvcmRBcnJheSkpKTtcblx0ICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuXHQgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNYWxmb3JtZWQgVVRGLTggZGF0YScpO1xuXHQgICAgICAgICAgICB9XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIENvbnZlcnRzIGEgVVRGLTggc3RyaW5nIHRvIGEgd29yZCBhcnJheS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB1dGY4U3RyIFRoZSBVVEYtOCBzdHJpbmcuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtXb3JkQXJyYXl9IFRoZSB3b3JkIGFycmF5LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHN0YXRpY1xuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgd29yZEFycmF5ID0gQ3J5cHRvSlMuZW5jLlV0ZjgucGFyc2UodXRmOFN0cmluZyk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgcGFyc2U6IGZ1bmN0aW9uICh1dGY4U3RyKSB7XG5cdCAgICAgICAgICAgIHJldHVybiBMYXRpbjEucGFyc2UodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KHV0ZjhTdHIpKSk7XG5cdCAgICAgICAgfVxuXHQgICAgfTtcblxuXHQgICAgLyoqXG5cdCAgICAgKiBBYnN0cmFjdCBidWZmZXJlZCBibG9jayBhbGdvcml0aG0gdGVtcGxhdGUuXG5cdCAgICAgKlxuXHQgICAgICogVGhlIHByb3BlcnR5IGJsb2NrU2l6ZSBtdXN0IGJlIGltcGxlbWVudGVkIGluIGEgY29uY3JldGUgc3VidHlwZS5cblx0ICAgICAqXG5cdCAgICAgKiBAcHJvcGVydHkge251bWJlcn0gX21pbkJ1ZmZlclNpemUgVGhlIG51bWJlciBvZiBibG9ja3MgdGhhdCBzaG91bGQgYmUga2VwdCB1bnByb2Nlc3NlZCBpbiB0aGUgYnVmZmVyLiBEZWZhdWx0OiAwXG5cdCAgICAgKi9cblx0ICAgIHZhciBCdWZmZXJlZEJsb2NrQWxnb3JpdGhtID0gQ19saWIuQnVmZmVyZWRCbG9ja0FsZ29yaXRobSA9IEJhc2UuZXh0ZW5kKHtcblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBSZXNldHMgdGhpcyBibG9jayBhbGdvcml0aG0ncyBkYXRhIGJ1ZmZlciB0byBpdHMgaW5pdGlhbCBzdGF0ZS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgYnVmZmVyZWRCbG9ja0FsZ29yaXRobS5yZXNldCgpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIHJlc2V0OiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgIC8vIEluaXRpYWwgdmFsdWVzXG5cdCAgICAgICAgICAgIHRoaXMuX2RhdGEgPSBuZXcgV29yZEFycmF5LmluaXQoKTtcblx0ICAgICAgICAgICAgdGhpcy5fbkRhdGFCeXRlcyA9IDA7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIEFkZHMgbmV3IGRhdGEgdG8gdGhpcyBibG9jayBhbGdvcml0aG0ncyBidWZmZXIuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge1dvcmRBcnJheXxzdHJpbmd9IGRhdGEgVGhlIGRhdGEgdG8gYXBwZW5kLiBTdHJpbmdzIGFyZSBjb252ZXJ0ZWQgdG8gYSBXb3JkQXJyYXkgdXNpbmcgVVRGLTguXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIGJ1ZmZlcmVkQmxvY2tBbGdvcml0aG0uX2FwcGVuZCgnZGF0YScpO1xuXHQgICAgICAgICAqICAgICBidWZmZXJlZEJsb2NrQWxnb3JpdGhtLl9hcHBlbmQod29yZEFycmF5KTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBfYXBwZW5kOiBmdW5jdGlvbiAoZGF0YSkge1xuXHQgICAgICAgICAgICAvLyBDb252ZXJ0IHN0cmluZyB0byBXb3JkQXJyYXksIGVsc2UgYXNzdW1lIFdvcmRBcnJheSBhbHJlYWR5XG5cdCAgICAgICAgICAgIGlmICh0eXBlb2YgZGF0YSA9PSAnc3RyaW5nJykge1xuXHQgICAgICAgICAgICAgICAgZGF0YSA9IFV0ZjgucGFyc2UoZGF0YSk7XG5cdCAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICAvLyBBcHBlbmRcblx0ICAgICAgICAgICAgdGhpcy5fZGF0YS5jb25jYXQoZGF0YSk7XG5cdCAgICAgICAgICAgIHRoaXMuX25EYXRhQnl0ZXMgKz0gZGF0YS5zaWdCeXRlcztcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogUHJvY2Vzc2VzIGF2YWlsYWJsZSBkYXRhIGJsb2Nrcy5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIFRoaXMgbWV0aG9kIGludm9rZXMgX2RvUHJvY2Vzc0Jsb2NrKG9mZnNldCksIHdoaWNoIG11c3QgYmUgaW1wbGVtZW50ZWQgYnkgYSBjb25jcmV0ZSBzdWJ0eXBlLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtib29sZWFufSBkb0ZsdXNoIFdoZXRoZXIgYWxsIGJsb2NrcyBhbmQgcGFydGlhbCBibG9ja3Mgc2hvdWxkIGJlIHByb2Nlc3NlZC5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge1dvcmRBcnJheX0gVGhlIHByb2Nlc3NlZCBkYXRhLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgcHJvY2Vzc2VkRGF0YSA9IGJ1ZmZlcmVkQmxvY2tBbGdvcml0aG0uX3Byb2Nlc3MoKTtcblx0ICAgICAgICAgKiAgICAgdmFyIHByb2Nlc3NlZERhdGEgPSBidWZmZXJlZEJsb2NrQWxnb3JpdGhtLl9wcm9jZXNzKCEhJ2ZsdXNoJyk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgX3Byb2Nlc3M6IGZ1bmN0aW9uIChkb0ZsdXNoKSB7XG5cdCAgICAgICAgICAgIC8vIFNob3J0Y3V0c1xuXHQgICAgICAgICAgICB2YXIgZGF0YSA9IHRoaXMuX2RhdGE7XG5cdCAgICAgICAgICAgIHZhciBkYXRhV29yZHMgPSBkYXRhLndvcmRzO1xuXHQgICAgICAgICAgICB2YXIgZGF0YVNpZ0J5dGVzID0gZGF0YS5zaWdCeXRlcztcblx0ICAgICAgICAgICAgdmFyIGJsb2NrU2l6ZSA9IHRoaXMuYmxvY2tTaXplO1xuXHQgICAgICAgICAgICB2YXIgYmxvY2tTaXplQnl0ZXMgPSBibG9ja1NpemUgKiA0O1xuXG5cdCAgICAgICAgICAgIC8vIENvdW50IGJsb2NrcyByZWFkeVxuXHQgICAgICAgICAgICB2YXIgbkJsb2Nrc1JlYWR5ID0gZGF0YVNpZ0J5dGVzIC8gYmxvY2tTaXplQnl0ZXM7XG5cdCAgICAgICAgICAgIGlmIChkb0ZsdXNoKSB7XG5cdCAgICAgICAgICAgICAgICAvLyBSb3VuZCB1cCB0byBpbmNsdWRlIHBhcnRpYWwgYmxvY2tzXG5cdCAgICAgICAgICAgICAgICBuQmxvY2tzUmVhZHkgPSBNYXRoLmNlaWwobkJsb2Nrc1JlYWR5KTtcblx0ICAgICAgICAgICAgfSBlbHNlIHtcblx0ICAgICAgICAgICAgICAgIC8vIFJvdW5kIGRvd24gdG8gaW5jbHVkZSBvbmx5IGZ1bGwgYmxvY2tzLFxuXHQgICAgICAgICAgICAgICAgLy8gbGVzcyB0aGUgbnVtYmVyIG9mIGJsb2NrcyB0aGF0IG11c3QgcmVtYWluIGluIHRoZSBidWZmZXJcblx0ICAgICAgICAgICAgICAgIG5CbG9ja3NSZWFkeSA9IE1hdGgubWF4KChuQmxvY2tzUmVhZHkgfCAwKSAtIHRoaXMuX21pbkJ1ZmZlclNpemUsIDApO1xuXHQgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgLy8gQ291bnQgd29yZHMgcmVhZHlcblx0ICAgICAgICAgICAgdmFyIG5Xb3Jkc1JlYWR5ID0gbkJsb2Nrc1JlYWR5ICogYmxvY2tTaXplO1xuXG5cdCAgICAgICAgICAgIC8vIENvdW50IGJ5dGVzIHJlYWR5XG5cdCAgICAgICAgICAgIHZhciBuQnl0ZXNSZWFkeSA9IE1hdGgubWluKG5Xb3Jkc1JlYWR5ICogNCwgZGF0YVNpZ0J5dGVzKTtcblxuXHQgICAgICAgICAgICAvLyBQcm9jZXNzIGJsb2Nrc1xuXHQgICAgICAgICAgICBpZiAobldvcmRzUmVhZHkpIHtcblx0ICAgICAgICAgICAgICAgIGZvciAodmFyIG9mZnNldCA9IDA7IG9mZnNldCA8IG5Xb3Jkc1JlYWR5OyBvZmZzZXQgKz0gYmxvY2tTaXplKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgLy8gUGVyZm9ybSBjb25jcmV0ZS1hbGdvcml0aG0gbG9naWNcblx0ICAgICAgICAgICAgICAgICAgICB0aGlzLl9kb1Byb2Nlc3NCbG9jayhkYXRhV29yZHMsIG9mZnNldCk7XG5cdCAgICAgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgICAgIC8vIFJlbW92ZSBwcm9jZXNzZWQgd29yZHNcblx0ICAgICAgICAgICAgICAgIHZhciBwcm9jZXNzZWRXb3JkcyA9IGRhdGFXb3Jkcy5zcGxpY2UoMCwgbldvcmRzUmVhZHkpO1xuXHQgICAgICAgICAgICAgICAgZGF0YS5zaWdCeXRlcyAtPSBuQnl0ZXNSZWFkeTtcblx0ICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgIC8vIFJldHVybiBwcm9jZXNzZWQgd29yZHNcblx0ICAgICAgICAgICAgcmV0dXJuIG5ldyBXb3JkQXJyYXkuaW5pdChwcm9jZXNzZWRXb3JkcywgbkJ5dGVzUmVhZHkpO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBDcmVhdGVzIGEgY29weSBvZiB0aGlzIG9iamVjdC5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge09iamVjdH0gVGhlIGNsb25lLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgY2xvbmUgPSBidWZmZXJlZEJsb2NrQWxnb3JpdGhtLmNsb25lKCk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgY2xvbmU6IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgdmFyIGNsb25lID0gQmFzZS5jbG9uZS5jYWxsKHRoaXMpO1xuXHQgICAgICAgICAgICBjbG9uZS5fZGF0YSA9IHRoaXMuX2RhdGEuY2xvbmUoKTtcblxuXHQgICAgICAgICAgICByZXR1cm4gY2xvbmU7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIF9taW5CdWZmZXJTaXplOiAwXG5cdCAgICB9KTtcblxuXHQgICAgLyoqXG5cdCAgICAgKiBBYnN0cmFjdCBoYXNoZXIgdGVtcGxhdGUuXG5cdCAgICAgKlxuXHQgICAgICogQHByb3BlcnR5IHtudW1iZXJ9IGJsb2NrU2l6ZSBUaGUgbnVtYmVyIG9mIDMyLWJpdCB3b3JkcyB0aGlzIGhhc2hlciBvcGVyYXRlcyBvbi4gRGVmYXVsdDogMTYgKDUxMiBiaXRzKVxuXHQgICAgICovXG5cdCAgICB2YXIgSGFzaGVyID0gQ19saWIuSGFzaGVyID0gQnVmZmVyZWRCbG9ja0FsZ29yaXRobS5leHRlbmQoe1xuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIENvbmZpZ3VyYXRpb24gb3B0aW9ucy5cblx0ICAgICAgICAgKi9cblx0ICAgICAgICBjZmc6IEJhc2UuZXh0ZW5kKCksXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBJbml0aWFsaXplcyBhIG5ld2x5IGNyZWF0ZWQgaGFzaGVyLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGNmZyAoT3B0aW9uYWwpIFRoZSBjb25maWd1cmF0aW9uIG9wdGlvbnMgdG8gdXNlIGZvciB0aGlzIGhhc2ggY29tcHV0YXRpb24uXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciBoYXNoZXIgPSBDcnlwdG9KUy5hbGdvLlNIQTI1Ni5jcmVhdGUoKTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBpbml0OiBmdW5jdGlvbiAoY2ZnKSB7XG5cdCAgICAgICAgICAgIC8vIEFwcGx5IGNvbmZpZyBkZWZhdWx0c1xuXHQgICAgICAgICAgICB0aGlzLmNmZyA9IHRoaXMuY2ZnLmV4dGVuZChjZmcpO1xuXG5cdCAgICAgICAgICAgIC8vIFNldCBpbml0aWFsIHZhbHVlc1xuXHQgICAgICAgICAgICB0aGlzLnJlc2V0KCk7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIFJlc2V0cyB0aGlzIGhhc2hlciB0byBpdHMgaW5pdGlhbCBzdGF0ZS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgaGFzaGVyLnJlc2V0KCk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgcmVzZXQ6IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgLy8gUmVzZXQgZGF0YSBidWZmZXJcblx0ICAgICAgICAgICAgQnVmZmVyZWRCbG9ja0FsZ29yaXRobS5yZXNldC5jYWxsKHRoaXMpO1xuXG5cdCAgICAgICAgICAgIC8vIFBlcmZvcm0gY29uY3JldGUtaGFzaGVyIGxvZ2ljXG5cdCAgICAgICAgICAgIHRoaXMuX2RvUmVzZXQoKTtcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogVXBkYXRlcyB0aGlzIGhhc2hlciB3aXRoIGEgbWVzc2FnZS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7V29yZEFycmF5fHN0cmluZ30gbWVzc2FnZVVwZGF0ZSBUaGUgbWVzc2FnZSB0byBhcHBlbmQuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtIYXNoZXJ9IFRoaXMgaGFzaGVyLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICBoYXNoZXIudXBkYXRlKCdtZXNzYWdlJyk7XG5cdCAgICAgICAgICogICAgIGhhc2hlci51cGRhdGUod29yZEFycmF5KTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uIChtZXNzYWdlVXBkYXRlKSB7XG5cdCAgICAgICAgICAgIC8vIEFwcGVuZFxuXHQgICAgICAgICAgICB0aGlzLl9hcHBlbmQobWVzc2FnZVVwZGF0ZSk7XG5cblx0ICAgICAgICAgICAgLy8gVXBkYXRlIHRoZSBoYXNoXG5cdCAgICAgICAgICAgIHRoaXMuX3Byb2Nlc3MoKTtcblxuXHQgICAgICAgICAgICAvLyBDaGFpbmFibGVcblx0ICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIEZpbmFsaXplcyB0aGUgaGFzaCBjb21wdXRhdGlvbi5cblx0ICAgICAgICAgKiBOb3RlIHRoYXQgdGhlIGZpbmFsaXplIG9wZXJhdGlvbiBpcyBlZmZlY3RpdmVseSBhIGRlc3RydWN0aXZlLCByZWFkLW9uY2Ugb3BlcmF0aW9uLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtXb3JkQXJyYXl8c3RyaW5nfSBtZXNzYWdlVXBkYXRlIChPcHRpb25hbCkgQSBmaW5hbCBtZXNzYWdlIHVwZGF0ZS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge1dvcmRBcnJheX0gVGhlIGhhc2guXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciBoYXNoID0gaGFzaGVyLmZpbmFsaXplKCk7XG5cdCAgICAgICAgICogICAgIHZhciBoYXNoID0gaGFzaGVyLmZpbmFsaXplKCdtZXNzYWdlJyk7XG5cdCAgICAgICAgICogICAgIHZhciBoYXNoID0gaGFzaGVyLmZpbmFsaXplKHdvcmRBcnJheSk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgZmluYWxpemU6IGZ1bmN0aW9uIChtZXNzYWdlVXBkYXRlKSB7XG5cdCAgICAgICAgICAgIC8vIEZpbmFsIG1lc3NhZ2UgdXBkYXRlXG5cdCAgICAgICAgICAgIGlmIChtZXNzYWdlVXBkYXRlKSB7XG5cdCAgICAgICAgICAgICAgICB0aGlzLl9hcHBlbmQobWVzc2FnZVVwZGF0ZSk7XG5cdCAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICAvLyBQZXJmb3JtIGNvbmNyZXRlLWhhc2hlciBsb2dpY1xuXHQgICAgICAgICAgICB2YXIgaGFzaCA9IHRoaXMuX2RvRmluYWxpemUoKTtcblxuXHQgICAgICAgICAgICByZXR1cm4gaGFzaDtcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgYmxvY2tTaXplOiA1MTIvMzIsXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBDcmVhdGVzIGEgc2hvcnRjdXQgZnVuY3Rpb24gdG8gYSBoYXNoZXIncyBvYmplY3QgaW50ZXJmYWNlLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtIYXNoZXJ9IGhhc2hlciBUaGUgaGFzaGVyIHRvIGNyZWF0ZSBhIGhlbHBlciBmb3IuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtGdW5jdGlvbn0gVGhlIHNob3J0Y3V0IGZ1bmN0aW9uLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHN0YXRpY1xuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgU0hBMjU2ID0gQ3J5cHRvSlMubGliLkhhc2hlci5fY3JlYXRlSGVscGVyKENyeXB0b0pTLmFsZ28uU0hBMjU2KTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBfY3JlYXRlSGVscGVyOiBmdW5jdGlvbiAoaGFzaGVyKSB7XG5cdCAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAobWVzc2FnZSwgY2ZnKSB7XG5cdCAgICAgICAgICAgICAgICByZXR1cm4gbmV3IGhhc2hlci5pbml0KGNmZykuZmluYWxpemUobWVzc2FnZSk7XG5cdCAgICAgICAgICAgIH07XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIENyZWF0ZXMgYSBzaG9ydGN1dCBmdW5jdGlvbiB0byB0aGUgSE1BQydzIG9iamVjdCBpbnRlcmZhY2UuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge0hhc2hlcn0gaGFzaGVyIFRoZSBoYXNoZXIgdG8gdXNlIGluIHRoaXMgSE1BQyBoZWxwZXIuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtGdW5jdGlvbn0gVGhlIHNob3J0Y3V0IGZ1bmN0aW9uLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHN0YXRpY1xuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgSG1hY1NIQTI1NiA9IENyeXB0b0pTLmxpYi5IYXNoZXIuX2NyZWF0ZUhtYWNIZWxwZXIoQ3J5cHRvSlMuYWxnby5TSEEyNTYpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIF9jcmVhdGVIbWFjSGVscGVyOiBmdW5jdGlvbiAoaGFzaGVyKSB7XG5cdCAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAobWVzc2FnZSwga2V5KSB7XG5cdCAgICAgICAgICAgICAgICByZXR1cm4gbmV3IENfYWxnby5ITUFDLmluaXQoaGFzaGVyLCBrZXkpLmZpbmFsaXplKG1lc3NhZ2UpO1xuXHQgICAgICAgICAgICB9O1xuXHQgICAgICAgIH1cblx0ICAgIH0pO1xuXG5cdCAgICAvKipcblx0ICAgICAqIEFsZ29yaXRobSBuYW1lc3BhY2UuXG5cdCAgICAgKi9cblx0ICAgIHZhciBDX2FsZ28gPSBDLmFsZ28gPSB7fTtcblxuXHQgICAgcmV0dXJuIEM7XG5cdH0oTWF0aCkpO1xuXG5cblx0cmV0dXJuIENyeXB0b0pTO1xuXG59KSk7IiwiOyhmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuXHRpZiAodHlwZW9mIGV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcblx0XHQvLyBDb21tb25KU1xuXHRcdG1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IGZhY3RvcnkocmVxdWlyZShcIi4vY29yZVwiKSk7XG5cdH1cblx0ZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcblx0XHQvLyBBTURcblx0XHRkZWZpbmUoW1wiLi9jb3JlXCJdLCBmYWN0b3J5KTtcblx0fVxuXHRlbHNlIHtcblx0XHQvLyBHbG9iYWwgKGJyb3dzZXIpXG5cdFx0ZmFjdG9yeShyb290LkNyeXB0b0pTKTtcblx0fVxufSh0aGlzLCBmdW5jdGlvbiAoQ3J5cHRvSlMpIHtcblxuXHQoZnVuY3Rpb24gKCkge1xuXHQgICAgLy8gU2hvcnRjdXRzXG5cdCAgICB2YXIgQyA9IENyeXB0b0pTO1xuXHQgICAgdmFyIENfbGliID0gQy5saWI7XG5cdCAgICB2YXIgV29yZEFycmF5ID0gQ19saWIuV29yZEFycmF5O1xuXHQgICAgdmFyIEhhc2hlciA9IENfbGliLkhhc2hlcjtcblx0ICAgIHZhciBDX2FsZ28gPSBDLmFsZ287XG5cblx0ICAgIC8vIFJldXNhYmxlIG9iamVjdFxuXHQgICAgdmFyIFcgPSBbXTtcblxuXHQgICAgLyoqXG5cdCAgICAgKiBTSEEtMSBoYXNoIGFsZ29yaXRobS5cblx0ICAgICAqL1xuXHQgICAgdmFyIFNIQTEgPSBDX2FsZ28uU0hBMSA9IEhhc2hlci5leHRlbmQoe1xuXHQgICAgICAgIF9kb1Jlc2V0OiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgIHRoaXMuX2hhc2ggPSBuZXcgV29yZEFycmF5LmluaXQoW1xuXHQgICAgICAgICAgICAgICAgMHg2NzQ1MjMwMSwgMHhlZmNkYWI4OSxcblx0ICAgICAgICAgICAgICAgIDB4OThiYWRjZmUsIDB4MTAzMjU0NzYsXG5cdCAgICAgICAgICAgICAgICAweGMzZDJlMWYwXG5cdCAgICAgICAgICAgIF0pO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICBfZG9Qcm9jZXNzQmxvY2s6IGZ1bmN0aW9uIChNLCBvZmZzZXQpIHtcblx0ICAgICAgICAgICAgLy8gU2hvcnRjdXRcblx0ICAgICAgICAgICAgdmFyIEggPSB0aGlzLl9oYXNoLndvcmRzO1xuXG5cdCAgICAgICAgICAgIC8vIFdvcmtpbmcgdmFyaWFibGVzXG5cdCAgICAgICAgICAgIHZhciBhID0gSFswXTtcblx0ICAgICAgICAgICAgdmFyIGIgPSBIWzFdO1xuXHQgICAgICAgICAgICB2YXIgYyA9IEhbMl07XG5cdCAgICAgICAgICAgIHZhciBkID0gSFszXTtcblx0ICAgICAgICAgICAgdmFyIGUgPSBIWzRdO1xuXG5cdCAgICAgICAgICAgIC8vIENvbXB1dGF0aW9uXG5cdCAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgODA7IGkrKykge1xuXHQgICAgICAgICAgICAgICAgaWYgKGkgPCAxNikge1xuXHQgICAgICAgICAgICAgICAgICAgIFdbaV0gPSBNW29mZnNldCArIGldIHwgMDtcblx0ICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cdCAgICAgICAgICAgICAgICAgICAgdmFyIG4gPSBXW2kgLSAzXSBeIFdbaSAtIDhdIF4gV1tpIC0gMTRdIF4gV1tpIC0gMTZdO1xuXHQgICAgICAgICAgICAgICAgICAgIFdbaV0gPSAobiA8PCAxKSB8IChuID4+PiAzMSk7XG5cdCAgICAgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgICAgIHZhciB0ID0gKChhIDw8IDUpIHwgKGEgPj4+IDI3KSkgKyBlICsgV1tpXTtcblx0ICAgICAgICAgICAgICAgIGlmIChpIDwgMjApIHtcblx0ICAgICAgICAgICAgICAgICAgICB0ICs9ICgoYiAmIGMpIHwgKH5iICYgZCkpICsgMHg1YTgyNzk5OTtcblx0ICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaSA8IDQwKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgdCArPSAoYiBeIGMgXiBkKSArIDB4NmVkOWViYTE7XG5cdCAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGkgPCA2MCkge1xuXHQgICAgICAgICAgICAgICAgICAgIHQgKz0gKChiICYgYykgfCAoYiAmIGQpIHwgKGMgJiBkKSkgLSAweDcwZTQ0MzI0O1xuXHQgICAgICAgICAgICAgICAgfSBlbHNlIC8qIGlmIChpIDwgODApICovIHtcblx0ICAgICAgICAgICAgICAgICAgICB0ICs9IChiIF4gYyBeIGQpIC0gMHgzNTlkM2UyYTtcblx0ICAgICAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICAgICAgZSA9IGQ7XG5cdCAgICAgICAgICAgICAgICBkID0gYztcblx0ICAgICAgICAgICAgICAgIGMgPSAoYiA8PCAzMCkgfCAoYiA+Pj4gMik7XG5cdCAgICAgICAgICAgICAgICBiID0gYTtcblx0ICAgICAgICAgICAgICAgIGEgPSB0O1xuXHQgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgLy8gSW50ZXJtZWRpYXRlIGhhc2ggdmFsdWVcblx0ICAgICAgICAgICAgSFswXSA9IChIWzBdICsgYSkgfCAwO1xuXHQgICAgICAgICAgICBIWzFdID0gKEhbMV0gKyBiKSB8IDA7XG5cdCAgICAgICAgICAgIEhbMl0gPSAoSFsyXSArIGMpIHwgMDtcblx0ICAgICAgICAgICAgSFszXSA9IChIWzNdICsgZCkgfCAwO1xuXHQgICAgICAgICAgICBIWzRdID0gKEhbNF0gKyBlKSB8IDA7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIF9kb0ZpbmFsaXplOiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgIC8vIFNob3J0Y3V0c1xuXHQgICAgICAgICAgICB2YXIgZGF0YSA9IHRoaXMuX2RhdGE7XG5cdCAgICAgICAgICAgIHZhciBkYXRhV29yZHMgPSBkYXRhLndvcmRzO1xuXG5cdCAgICAgICAgICAgIHZhciBuQml0c1RvdGFsID0gdGhpcy5fbkRhdGFCeXRlcyAqIDg7XG5cdCAgICAgICAgICAgIHZhciBuQml0c0xlZnQgPSBkYXRhLnNpZ0J5dGVzICogODtcblxuXHQgICAgICAgICAgICAvLyBBZGQgcGFkZGluZ1xuXHQgICAgICAgICAgICBkYXRhV29yZHNbbkJpdHNMZWZ0ID4+PiA1XSB8PSAweDgwIDw8ICgyNCAtIG5CaXRzTGVmdCAlIDMyKTtcblx0ICAgICAgICAgICAgZGF0YVdvcmRzWygoKG5CaXRzTGVmdCArIDY0KSA+Pj4gOSkgPDwgNCkgKyAxNF0gPSBNYXRoLmZsb29yKG5CaXRzVG90YWwgLyAweDEwMDAwMDAwMCk7XG5cdCAgICAgICAgICAgIGRhdGFXb3Jkc1soKChuQml0c0xlZnQgKyA2NCkgPj4+IDkpIDw8IDQpICsgMTVdID0gbkJpdHNUb3RhbDtcblx0ICAgICAgICAgICAgZGF0YS5zaWdCeXRlcyA9IGRhdGFXb3Jkcy5sZW5ndGggKiA0O1xuXG5cdCAgICAgICAgICAgIC8vIEhhc2ggZmluYWwgYmxvY2tzXG5cdCAgICAgICAgICAgIHRoaXMuX3Byb2Nlc3MoKTtcblxuXHQgICAgICAgICAgICAvLyBSZXR1cm4gZmluYWwgY29tcHV0ZWQgaGFzaFxuXHQgICAgICAgICAgICByZXR1cm4gdGhpcy5faGFzaDtcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgY2xvbmU6IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgdmFyIGNsb25lID0gSGFzaGVyLmNsb25lLmNhbGwodGhpcyk7XG5cdCAgICAgICAgICAgIGNsb25lLl9oYXNoID0gdGhpcy5faGFzaC5jbG9uZSgpO1xuXG5cdCAgICAgICAgICAgIHJldHVybiBjbG9uZTtcblx0ICAgICAgICB9XG5cdCAgICB9KTtcblxuXHQgICAgLyoqXG5cdCAgICAgKiBTaG9ydGN1dCBmdW5jdGlvbiB0byB0aGUgaGFzaGVyJ3Mgb2JqZWN0IGludGVyZmFjZS5cblx0ICAgICAqXG5cdCAgICAgKiBAcGFyYW0ge1dvcmRBcnJheXxzdHJpbmd9IG1lc3NhZ2UgVGhlIG1lc3NhZ2UgdG8gaGFzaC5cblx0ICAgICAqXG5cdCAgICAgKiBAcmV0dXJuIHtXb3JkQXJyYXl9IFRoZSBoYXNoLlxuXHQgICAgICpcblx0ICAgICAqIEBzdGF0aWNcblx0ICAgICAqXG5cdCAgICAgKiBAZXhhbXBsZVxuXHQgICAgICpcblx0ICAgICAqICAgICB2YXIgaGFzaCA9IENyeXB0b0pTLlNIQTEoJ21lc3NhZ2UnKTtcblx0ICAgICAqICAgICB2YXIgaGFzaCA9IENyeXB0b0pTLlNIQTEod29yZEFycmF5KTtcblx0ICAgICAqL1xuXHQgICAgQy5TSEExID0gSGFzaGVyLl9jcmVhdGVIZWxwZXIoU0hBMSk7XG5cblx0ICAgIC8qKlxuXHQgICAgICogU2hvcnRjdXQgZnVuY3Rpb24gdG8gdGhlIEhNQUMncyBvYmplY3QgaW50ZXJmYWNlLlxuXHQgICAgICpcblx0ICAgICAqIEBwYXJhbSB7V29yZEFycmF5fHN0cmluZ30gbWVzc2FnZSBUaGUgbWVzc2FnZSB0byBoYXNoLlxuXHQgICAgICogQHBhcmFtIHtXb3JkQXJyYXl8c3RyaW5nfSBrZXkgVGhlIHNlY3JldCBrZXkuXG5cdCAgICAgKlxuXHQgICAgICogQHJldHVybiB7V29yZEFycmF5fSBUaGUgSE1BQy5cblx0ICAgICAqXG5cdCAgICAgKiBAc3RhdGljXG5cdCAgICAgKlxuXHQgICAgICogQGV4YW1wbGVcblx0ICAgICAqXG5cdCAgICAgKiAgICAgdmFyIGhtYWMgPSBDcnlwdG9KUy5IbWFjU0hBMShtZXNzYWdlLCBrZXkpO1xuXHQgICAgICovXG5cdCAgICBDLkhtYWNTSEExID0gSGFzaGVyLl9jcmVhdGVIbWFjSGVscGVyKFNIQTEpO1xuXHR9KCkpO1xuXG5cblx0cmV0dXJuIENyeXB0b0pTLlNIQTE7XG5cbn0pKTsiLCIvKipcbiAqIENvbnZlcnQgYXJyYXkgb2YgMTYgYnl0ZSB2YWx1ZXMgdG8gVVVJRCBzdHJpbmcgZm9ybWF0IG9mIHRoZSBmb3JtOlxuICogWFhYWFhYWFgtWFhYWC1YWFhYLVhYWFgtWFhYWFhYWFhYWFhYXG4gKi9cbnZhciBieXRlVG9IZXggPSBbXTtcblxuZm9yICh2YXIgaSA9IDA7IGkgPCAyNTY7ICsraSkge1xuICBieXRlVG9IZXhbaV0gPSAoaSArIDB4MTAwKS50b1N0cmluZygxNikuc3Vic3RyKDEpO1xufVxuXG5mdW5jdGlvbiBieXRlc1RvVXVpZChidWYsIG9mZnNldCkge1xuICB2YXIgaSA9IG9mZnNldCB8fCAwO1xuICB2YXIgYnRoID0gYnl0ZVRvSGV4OyAvLyBqb2luIHVzZWQgdG8gZml4IG1lbW9yeSBpc3N1ZSBjYXVzZWQgYnkgY29uY2F0ZW5hdGlvbjogaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9MzE3NSNjNFxuXG4gIHJldHVybiBbYnRoW2J1ZltpKytdXSwgYnRoW2J1ZltpKytdXSwgYnRoW2J1ZltpKytdXSwgYnRoW2J1ZltpKytdXSwgJy0nLCBidGhbYnVmW2krK11dLCBidGhbYnVmW2krK11dLCAnLScsIGJ0aFtidWZbaSsrXV0sIGJ0aFtidWZbaSsrXV0sICctJywgYnRoW2J1ZltpKytdXSwgYnRoW2J1ZltpKytdXSwgJy0nLCBidGhbYnVmW2krK11dLCBidGhbYnVmW2krK11dLCBidGhbYnVmW2krK11dLCBidGhbYnVmW2krK11dLCBidGhbYnVmW2krK11dLCBidGhbYnVmW2krK11dXS5qb2luKCcnKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYnl0ZXNUb1V1aWQ7IiwiZXhwb3J0IHsgZGVmYXVsdCBhcyB2MSB9IGZyb20gJy4vdjEuanMnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyB2MyB9IGZyb20gJy4vdjMuanMnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyB2NCB9IGZyb20gJy4vdjQuanMnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyB2NSB9IGZyb20gJy4vdjUuanMnOyIsIi8qXG4gKiBCcm93c2VyLWNvbXBhdGlibGUgSmF2YVNjcmlwdCBNRDVcbiAqXG4gKiBNb2RpZmljYXRpb24gb2YgSmF2YVNjcmlwdCBNRDVcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9ibHVlaW1wL0phdmFTY3JpcHQtTUQ1XG4gKlxuICogQ29weXJpZ2h0IDIwMTEsIFNlYmFzdGlhbiBUc2NoYW5cbiAqIGh0dHBzOi8vYmx1ZWltcC5uZXRcbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XG4gKiBodHRwczovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxuICpcbiAqIEJhc2VkIG9uXG4gKiBBIEphdmFTY3JpcHQgaW1wbGVtZW50YXRpb24gb2YgdGhlIFJTQSBEYXRhIFNlY3VyaXR5LCBJbmMuIE1ENSBNZXNzYWdlXG4gKiBEaWdlc3QgQWxnb3JpdGhtLCBhcyBkZWZpbmVkIGluIFJGQyAxMzIxLlxuICogVmVyc2lvbiAyLjIgQ29weXJpZ2h0IChDKSBQYXVsIEpvaG5zdG9uIDE5OTkgLSAyMDA5XG4gKiBPdGhlciBjb250cmlidXRvcnM6IEdyZWcgSG9sdCwgQW5kcmV3IEtlcGVydCwgWWRuYXIsIExvc3RpbmV0XG4gKiBEaXN0cmlidXRlZCB1bmRlciB0aGUgQlNEIExpY2Vuc2VcbiAqIFNlZSBodHRwOi8vcGFqaG9tZS5vcmcudWsvY3J5cHQvbWQ1IGZvciBtb3JlIGluZm8uXG4gKi9cbmZ1bmN0aW9uIG1kNShieXRlcykge1xuICBpZiAodHlwZW9mIGJ5dGVzID09ICdzdHJpbmcnKSB7XG4gICAgdmFyIG1zZyA9IHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChieXRlcykpOyAvLyBVVEY4IGVzY2FwZVxuXG4gICAgYnl0ZXMgPSBuZXcgQXJyYXkobXNnLmxlbmd0aCk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1zZy5sZW5ndGg7IGkrKykge1xuICAgICAgYnl0ZXNbaV0gPSBtc2cuY2hhckNvZGVBdChpKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbWQ1VG9IZXhFbmNvZGVkQXJyYXkod29yZHNUb01kNShieXRlc1RvV29yZHMoYnl0ZXMpLCBieXRlcy5sZW5ndGggKiA4KSk7XG59XG4vKlxuICogQ29udmVydCBhbiBhcnJheSBvZiBsaXR0bGUtZW5kaWFuIHdvcmRzIHRvIGFuIGFycmF5IG9mIGJ5dGVzXG4gKi9cblxuXG5mdW5jdGlvbiBtZDVUb0hleEVuY29kZWRBcnJheShpbnB1dCkge1xuICB2YXIgaTtcbiAgdmFyIHg7XG4gIHZhciBvdXRwdXQgPSBbXTtcbiAgdmFyIGxlbmd0aDMyID0gaW5wdXQubGVuZ3RoICogMzI7XG4gIHZhciBoZXhUYWIgPSAnMDEyMzQ1Njc4OWFiY2RlZic7XG4gIHZhciBoZXg7XG5cbiAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDMyOyBpICs9IDgpIHtcbiAgICB4ID0gaW5wdXRbaSA+PiA1XSA+Pj4gaSAlIDMyICYgMHhmZjtcbiAgICBoZXggPSBwYXJzZUludChoZXhUYWIuY2hhckF0KHggPj4+IDQgJiAweDBmKSArIGhleFRhYi5jaGFyQXQoeCAmIDB4MGYpLCAxNik7XG4gICAgb3V0cHV0LnB1c2goaGV4KTtcbiAgfVxuXG4gIHJldHVybiBvdXRwdXQ7XG59XG4vKlxuICogQ2FsY3VsYXRlIHRoZSBNRDUgb2YgYW4gYXJyYXkgb2YgbGl0dGxlLWVuZGlhbiB3b3JkcywgYW5kIGEgYml0IGxlbmd0aC5cbiAqL1xuXG5cbmZ1bmN0aW9uIHdvcmRzVG9NZDUoeCwgbGVuKSB7XG4gIC8qIGFwcGVuZCBwYWRkaW5nICovXG4gIHhbbGVuID4+IDVdIHw9IDB4ODAgPDwgbGVuICUgMzI7XG4gIHhbKGxlbiArIDY0ID4+PiA5IDw8IDQpICsgMTRdID0gbGVuO1xuICB2YXIgaTtcbiAgdmFyIG9sZGE7XG4gIHZhciBvbGRiO1xuICB2YXIgb2xkYztcbiAgdmFyIG9sZGQ7XG4gIHZhciBhID0gMTczMjU4NDE5MztcbiAgdmFyIGIgPSAtMjcxNzMzODc5O1xuICB2YXIgYyA9IC0xNzMyNTg0MTk0O1xuICB2YXIgZCA9IDI3MTczMzg3ODtcblxuICBmb3IgKGkgPSAwOyBpIDwgeC5sZW5ndGg7IGkgKz0gMTYpIHtcbiAgICBvbGRhID0gYTtcbiAgICBvbGRiID0gYjtcbiAgICBvbGRjID0gYztcbiAgICBvbGRkID0gZDtcbiAgICBhID0gbWQ1ZmYoYSwgYiwgYywgZCwgeFtpXSwgNywgLTY4MDg3NjkzNik7XG4gICAgZCA9IG1kNWZmKGQsIGEsIGIsIGMsIHhbaSArIDFdLCAxMiwgLTM4OTU2NDU4Nik7XG4gICAgYyA9IG1kNWZmKGMsIGQsIGEsIGIsIHhbaSArIDJdLCAxNywgNjA2MTA1ODE5KTtcbiAgICBiID0gbWQ1ZmYoYiwgYywgZCwgYSwgeFtpICsgM10sIDIyLCAtMTA0NDUyNTMzMCk7XG4gICAgYSA9IG1kNWZmKGEsIGIsIGMsIGQsIHhbaSArIDRdLCA3LCAtMTc2NDE4ODk3KTtcbiAgICBkID0gbWQ1ZmYoZCwgYSwgYiwgYywgeFtpICsgNV0sIDEyLCAxMjAwMDgwNDI2KTtcbiAgICBjID0gbWQ1ZmYoYywgZCwgYSwgYiwgeFtpICsgNl0sIDE3LCAtMTQ3MzIzMTM0MSk7XG4gICAgYiA9IG1kNWZmKGIsIGMsIGQsIGEsIHhbaSArIDddLCAyMiwgLTQ1NzA1OTgzKTtcbiAgICBhID0gbWQ1ZmYoYSwgYiwgYywgZCwgeFtpICsgOF0sIDcsIDE3NzAwMzU0MTYpO1xuICAgIGQgPSBtZDVmZihkLCBhLCBiLCBjLCB4W2kgKyA5XSwgMTIsIC0xOTU4NDE0NDE3KTtcbiAgICBjID0gbWQ1ZmYoYywgZCwgYSwgYiwgeFtpICsgMTBdLCAxNywgLTQyMDYzKTtcbiAgICBiID0gbWQ1ZmYoYiwgYywgZCwgYSwgeFtpICsgMTFdLCAyMiwgLTE5OTA0MDQxNjIpO1xuICAgIGEgPSBtZDVmZihhLCBiLCBjLCBkLCB4W2kgKyAxMl0sIDcsIDE4MDQ2MDM2ODIpO1xuICAgIGQgPSBtZDVmZihkLCBhLCBiLCBjLCB4W2kgKyAxM10sIDEyLCAtNDAzNDExMDEpO1xuICAgIGMgPSBtZDVmZihjLCBkLCBhLCBiLCB4W2kgKyAxNF0sIDE3LCAtMTUwMjAwMjI5MCk7XG4gICAgYiA9IG1kNWZmKGIsIGMsIGQsIGEsIHhbaSArIDE1XSwgMjIsIDEyMzY1MzUzMjkpO1xuICAgIGEgPSBtZDVnZyhhLCBiLCBjLCBkLCB4W2kgKyAxXSwgNSwgLTE2NTc5NjUxMCk7XG4gICAgZCA9IG1kNWdnKGQsIGEsIGIsIGMsIHhbaSArIDZdLCA5LCAtMTA2OTUwMTYzMik7XG4gICAgYyA9IG1kNWdnKGMsIGQsIGEsIGIsIHhbaSArIDExXSwgMTQsIDY0MzcxNzcxMyk7XG4gICAgYiA9IG1kNWdnKGIsIGMsIGQsIGEsIHhbaV0sIDIwLCAtMzczODk3MzAyKTtcbiAgICBhID0gbWQ1Z2coYSwgYiwgYywgZCwgeFtpICsgNV0sIDUsIC03MDE1NTg2OTEpO1xuICAgIGQgPSBtZDVnZyhkLCBhLCBiLCBjLCB4W2kgKyAxMF0sIDksIDM4MDE2MDgzKTtcbiAgICBjID0gbWQ1Z2coYywgZCwgYSwgYiwgeFtpICsgMTVdLCAxNCwgLTY2MDQ3ODMzNSk7XG4gICAgYiA9IG1kNWdnKGIsIGMsIGQsIGEsIHhbaSArIDRdLCAyMCwgLTQwNTUzNzg0OCk7XG4gICAgYSA9IG1kNWdnKGEsIGIsIGMsIGQsIHhbaSArIDldLCA1LCA1Njg0NDY0MzgpO1xuICAgIGQgPSBtZDVnZyhkLCBhLCBiLCBjLCB4W2kgKyAxNF0sIDksIC0xMDE5ODAzNjkwKTtcbiAgICBjID0gbWQ1Z2coYywgZCwgYSwgYiwgeFtpICsgM10sIDE0LCAtMTg3MzYzOTYxKTtcbiAgICBiID0gbWQ1Z2coYiwgYywgZCwgYSwgeFtpICsgOF0sIDIwLCAxMTYzNTMxNTAxKTtcbiAgICBhID0gbWQ1Z2coYSwgYiwgYywgZCwgeFtpICsgMTNdLCA1LCAtMTQ0NDY4MTQ2Nyk7XG4gICAgZCA9IG1kNWdnKGQsIGEsIGIsIGMsIHhbaSArIDJdLCA5LCAtNTE0MDM3ODQpO1xuICAgIGMgPSBtZDVnZyhjLCBkLCBhLCBiLCB4W2kgKyA3XSwgMTQsIDE3MzUzMjg0NzMpO1xuICAgIGIgPSBtZDVnZyhiLCBjLCBkLCBhLCB4W2kgKyAxMl0sIDIwLCAtMTkyNjYwNzczNCk7XG4gICAgYSA9IG1kNWhoKGEsIGIsIGMsIGQsIHhbaSArIDVdLCA0LCAtMzc4NTU4KTtcbiAgICBkID0gbWQ1aGgoZCwgYSwgYiwgYywgeFtpICsgOF0sIDExLCAtMjAyMjU3NDQ2Myk7XG4gICAgYyA9IG1kNWhoKGMsIGQsIGEsIGIsIHhbaSArIDExXSwgMTYsIDE4MzkwMzA1NjIpO1xuICAgIGIgPSBtZDVoaChiLCBjLCBkLCBhLCB4W2kgKyAxNF0sIDIzLCAtMzUzMDk1NTYpO1xuICAgIGEgPSBtZDVoaChhLCBiLCBjLCBkLCB4W2kgKyAxXSwgNCwgLTE1MzA5OTIwNjApO1xuICAgIGQgPSBtZDVoaChkLCBhLCBiLCBjLCB4W2kgKyA0XSwgMTEsIDEyNzI4OTMzNTMpO1xuICAgIGMgPSBtZDVoaChjLCBkLCBhLCBiLCB4W2kgKyA3XSwgMTYsIC0xNTU0OTc2MzIpO1xuICAgIGIgPSBtZDVoaChiLCBjLCBkLCBhLCB4W2kgKyAxMF0sIDIzLCAtMTA5NDczMDY0MCk7XG4gICAgYSA9IG1kNWhoKGEsIGIsIGMsIGQsIHhbaSArIDEzXSwgNCwgNjgxMjc5MTc0KTtcbiAgICBkID0gbWQ1aGgoZCwgYSwgYiwgYywgeFtpXSwgMTEsIC0zNTg1MzcyMjIpO1xuICAgIGMgPSBtZDVoaChjLCBkLCBhLCBiLCB4W2kgKyAzXSwgMTYsIC03MjI1MjE5NzkpO1xuICAgIGIgPSBtZDVoaChiLCBjLCBkLCBhLCB4W2kgKyA2XSwgMjMsIDc2MDI5MTg5KTtcbiAgICBhID0gbWQ1aGgoYSwgYiwgYywgZCwgeFtpICsgOV0sIDQsIC02NDAzNjQ0ODcpO1xuICAgIGQgPSBtZDVoaChkLCBhLCBiLCBjLCB4W2kgKyAxMl0sIDExLCAtNDIxODE1ODM1KTtcbiAgICBjID0gbWQ1aGgoYywgZCwgYSwgYiwgeFtpICsgMTVdLCAxNiwgNTMwNzQyNTIwKTtcbiAgICBiID0gbWQ1aGgoYiwgYywgZCwgYSwgeFtpICsgMl0sIDIzLCAtOTk1MzM4NjUxKTtcbiAgICBhID0gbWQ1aWkoYSwgYiwgYywgZCwgeFtpXSwgNiwgLTE5ODYzMDg0NCk7XG4gICAgZCA9IG1kNWlpKGQsIGEsIGIsIGMsIHhbaSArIDddLCAxMCwgMTEyNjg5MTQxNSk7XG4gICAgYyA9IG1kNWlpKGMsIGQsIGEsIGIsIHhbaSArIDE0XSwgMTUsIC0xNDE2MzU0OTA1KTtcbiAgICBiID0gbWQ1aWkoYiwgYywgZCwgYSwgeFtpICsgNV0sIDIxLCAtNTc0MzQwNTUpO1xuICAgIGEgPSBtZDVpaShhLCBiLCBjLCBkLCB4W2kgKyAxMl0sIDYsIDE3MDA0ODU1NzEpO1xuICAgIGQgPSBtZDVpaShkLCBhLCBiLCBjLCB4W2kgKyAzXSwgMTAsIC0xODk0OTg2NjA2KTtcbiAgICBjID0gbWQ1aWkoYywgZCwgYSwgYiwgeFtpICsgMTBdLCAxNSwgLTEwNTE1MjMpO1xuICAgIGIgPSBtZDVpaShiLCBjLCBkLCBhLCB4W2kgKyAxXSwgMjEsIC0yMDU0OTIyNzk5KTtcbiAgICBhID0gbWQ1aWkoYSwgYiwgYywgZCwgeFtpICsgOF0sIDYsIDE4NzMzMTMzNTkpO1xuICAgIGQgPSBtZDVpaShkLCBhLCBiLCBjLCB4W2kgKyAxNV0sIDEwLCAtMzA2MTE3NDQpO1xuICAgIGMgPSBtZDVpaShjLCBkLCBhLCBiLCB4W2kgKyA2XSwgMTUsIC0xNTYwMTk4MzgwKTtcbiAgICBiID0gbWQ1aWkoYiwgYywgZCwgYSwgeFtpICsgMTNdLCAyMSwgMTMwOTE1MTY0OSk7XG4gICAgYSA9IG1kNWlpKGEsIGIsIGMsIGQsIHhbaSArIDRdLCA2LCAtMTQ1NTIzMDcwKTtcbiAgICBkID0gbWQ1aWkoZCwgYSwgYiwgYywgeFtpICsgMTFdLCAxMCwgLTExMjAyMTAzNzkpO1xuICAgIGMgPSBtZDVpaShjLCBkLCBhLCBiLCB4W2kgKyAyXSwgMTUsIDcxODc4NzI1OSk7XG4gICAgYiA9IG1kNWlpKGIsIGMsIGQsIGEsIHhbaSArIDldLCAyMSwgLTM0MzQ4NTU1MSk7XG4gICAgYSA9IHNhZmVBZGQoYSwgb2xkYSk7XG4gICAgYiA9IHNhZmVBZGQoYiwgb2xkYik7XG4gICAgYyA9IHNhZmVBZGQoYywgb2xkYyk7XG4gICAgZCA9IHNhZmVBZGQoZCwgb2xkZCk7XG4gIH1cblxuICByZXR1cm4gW2EsIGIsIGMsIGRdO1xufVxuLypcbiAqIENvbnZlcnQgYW4gYXJyYXkgYnl0ZXMgdG8gYW4gYXJyYXkgb2YgbGl0dGxlLWVuZGlhbiB3b3Jkc1xuICogQ2hhcmFjdGVycyA+MjU1IGhhdmUgdGhlaXIgaGlnaC1ieXRlIHNpbGVudGx5IGlnbm9yZWQuXG4gKi9cblxuXG5mdW5jdGlvbiBieXRlc1RvV29yZHMoaW5wdXQpIHtcbiAgdmFyIGk7XG4gIHZhciBvdXRwdXQgPSBbXTtcbiAgb3V0cHV0WyhpbnB1dC5sZW5ndGggPj4gMikgLSAxXSA9IHVuZGVmaW5lZDtcblxuICBmb3IgKGkgPSAwOyBpIDwgb3V0cHV0Lmxlbmd0aDsgaSArPSAxKSB7XG4gICAgb3V0cHV0W2ldID0gMDtcbiAgfVxuXG4gIHZhciBsZW5ndGg4ID0gaW5wdXQubGVuZ3RoICogODtcblxuICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoODsgaSArPSA4KSB7XG4gICAgb3V0cHV0W2kgPj4gNV0gfD0gKGlucHV0W2kgLyA4XSAmIDB4ZmYpIDw8IGkgJSAzMjtcbiAgfVxuXG4gIHJldHVybiBvdXRwdXQ7XG59XG4vKlxuICogQWRkIGludGVnZXJzLCB3cmFwcGluZyBhdCAyXjMyLiBUaGlzIHVzZXMgMTYtYml0IG9wZXJhdGlvbnMgaW50ZXJuYWxseVxuICogdG8gd29yayBhcm91bmQgYnVncyBpbiBzb21lIEpTIGludGVycHJldGVycy5cbiAqL1xuXG5cbmZ1bmN0aW9uIHNhZmVBZGQoeCwgeSkge1xuICB2YXIgbHN3ID0gKHggJiAweGZmZmYpICsgKHkgJiAweGZmZmYpO1xuICB2YXIgbXN3ID0gKHggPj4gMTYpICsgKHkgPj4gMTYpICsgKGxzdyA+PiAxNik7XG4gIHJldHVybiBtc3cgPDwgMTYgfCBsc3cgJiAweGZmZmY7XG59XG4vKlxuICogQml0d2lzZSByb3RhdGUgYSAzMi1iaXQgbnVtYmVyIHRvIHRoZSBsZWZ0LlxuICovXG5cblxuZnVuY3Rpb24gYml0Um90YXRlTGVmdChudW0sIGNudCkge1xuICByZXR1cm4gbnVtIDw8IGNudCB8IG51bSA+Pj4gMzIgLSBjbnQ7XG59XG4vKlxuICogVGhlc2UgZnVuY3Rpb25zIGltcGxlbWVudCB0aGUgZm91ciBiYXNpYyBvcGVyYXRpb25zIHRoZSBhbGdvcml0aG0gdXNlcy5cbiAqL1xuXG5cbmZ1bmN0aW9uIG1kNWNtbihxLCBhLCBiLCB4LCBzLCB0KSB7XG4gIHJldHVybiBzYWZlQWRkKGJpdFJvdGF0ZUxlZnQoc2FmZUFkZChzYWZlQWRkKGEsIHEpLCBzYWZlQWRkKHgsIHQpKSwgcyksIGIpO1xufVxuXG5mdW5jdGlvbiBtZDVmZihhLCBiLCBjLCBkLCB4LCBzLCB0KSB7XG4gIHJldHVybiBtZDVjbW4oYiAmIGMgfCB+YiAmIGQsIGEsIGIsIHgsIHMsIHQpO1xufVxuXG5mdW5jdGlvbiBtZDVnZyhhLCBiLCBjLCBkLCB4LCBzLCB0KSB7XG4gIHJldHVybiBtZDVjbW4oYiAmIGQgfCBjICYgfmQsIGEsIGIsIHgsIHMsIHQpO1xufVxuXG5mdW5jdGlvbiBtZDVoaChhLCBiLCBjLCBkLCB4LCBzLCB0KSB7XG4gIHJldHVybiBtZDVjbW4oYiBeIGMgXiBkLCBhLCBiLCB4LCBzLCB0KTtcbn1cblxuZnVuY3Rpb24gbWQ1aWkoYSwgYiwgYywgZCwgeCwgcywgdCkge1xuICByZXR1cm4gbWQ1Y21uKGMgXiAoYiB8IH5kKSwgYSwgYiwgeCwgcywgdCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IG1kNTsiLCIvLyBVbmlxdWUgSUQgY3JlYXRpb24gcmVxdWlyZXMgYSBoaWdoIHF1YWxpdHkgcmFuZG9tICMgZ2VuZXJhdG9yLiBJbiB0aGUgYnJvd3NlciB3ZSB0aGVyZWZvcmVcbi8vIHJlcXVpcmUgdGhlIGNyeXB0byBBUEkgYW5kIGRvIG5vdCBzdXBwb3J0IGJ1aWx0LWluIGZhbGxiYWNrIHRvIGxvd2VyIHF1YWxpdHkgcmFuZG9tIG51bWJlclxuLy8gZ2VuZXJhdG9ycyAobGlrZSBNYXRoLnJhbmRvbSgpKS5cbi8vIGdldFJhbmRvbVZhbHVlcyBuZWVkcyB0byBiZSBpbnZva2VkIGluIGEgY29udGV4dCB3aGVyZSBcInRoaXNcIiBpcyBhIENyeXB0byBpbXBsZW1lbnRhdGlvbi4gQWxzbyxcbi8vIGZpbmQgdGhlIGNvbXBsZXRlIGltcGxlbWVudGF0aW9uIG9mIGNyeXB0byAobXNDcnlwdG8pIG9uIElFMTEuXG52YXIgZ2V0UmFuZG9tVmFsdWVzID0gdHlwZW9mIGNyeXB0byAhPSAndW5kZWZpbmVkJyAmJiBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzICYmIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMuYmluZChjcnlwdG8pIHx8IHR5cGVvZiBtc0NyeXB0byAhPSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgbXNDcnlwdG8uZ2V0UmFuZG9tVmFsdWVzID09ICdmdW5jdGlvbicgJiYgbXNDcnlwdG8uZ2V0UmFuZG9tVmFsdWVzLmJpbmQobXNDcnlwdG8pO1xudmFyIHJuZHM4ID0gbmV3IFVpbnQ4QXJyYXkoMTYpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVuZGVmXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJuZygpIHtcbiAgaWYgKCFnZXRSYW5kb21WYWx1ZXMpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NyeXB0by5nZXRSYW5kb21WYWx1ZXMoKSBub3Qgc3VwcG9ydGVkLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3V1aWRqcy91dWlkI2dldHJhbmRvbXZhbHVlcy1ub3Qtc3VwcG9ydGVkJyk7XG4gIH1cblxuICByZXR1cm4gZ2V0UmFuZG9tVmFsdWVzKHJuZHM4KTtcbn0iLCIvLyBBZGFwdGVkIGZyb20gQ2hyaXMgVmVuZXNzJyBTSEExIGNvZGUgYXRcbi8vIGh0dHA6Ly93d3cubW92YWJsZS10eXBlLmNvLnVrL3NjcmlwdHMvc2hhMS5odG1sXG5mdW5jdGlvbiBmKHMsIHgsIHksIHopIHtcbiAgc3dpdGNoIChzKSB7XG4gICAgY2FzZSAwOlxuICAgICAgcmV0dXJuIHggJiB5IF4gfnggJiB6O1xuXG4gICAgY2FzZSAxOlxuICAgICAgcmV0dXJuIHggXiB5IF4gejtcblxuICAgIGNhc2UgMjpcbiAgICAgIHJldHVybiB4ICYgeSBeIHggJiB6IF4geSAmIHo7XG5cbiAgICBjYXNlIDM6XG4gICAgICByZXR1cm4geCBeIHkgXiB6O1xuICB9XG59XG5cbmZ1bmN0aW9uIFJPVEwoeCwgbikge1xuICByZXR1cm4geCA8PCBuIHwgeCA+Pj4gMzIgLSBuO1xufVxuXG5mdW5jdGlvbiBzaGExKGJ5dGVzKSB7XG4gIHZhciBLID0gWzB4NWE4Mjc5OTksIDB4NmVkOWViYTEsIDB4OGYxYmJjZGMsIDB4Y2E2MmMxZDZdO1xuICB2YXIgSCA9IFsweDY3NDUyMzAxLCAweGVmY2RhYjg5LCAweDk4YmFkY2ZlLCAweDEwMzI1NDc2LCAweGMzZDJlMWYwXTtcblxuICBpZiAodHlwZW9mIGJ5dGVzID09ICdzdHJpbmcnKSB7XG4gICAgdmFyIG1zZyA9IHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChieXRlcykpOyAvLyBVVEY4IGVzY2FwZVxuXG4gICAgYnl0ZXMgPSBuZXcgQXJyYXkobXNnLmxlbmd0aCk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1zZy5sZW5ndGg7IGkrKykge1xuICAgICAgYnl0ZXNbaV0gPSBtc2cuY2hhckNvZGVBdChpKTtcbiAgICB9XG4gIH1cblxuICBieXRlcy5wdXNoKDB4ODApO1xuICB2YXIgbCA9IGJ5dGVzLmxlbmd0aCAvIDQgKyAyO1xuICB2YXIgTiA9IE1hdGguY2VpbChsIC8gMTYpO1xuICB2YXIgTSA9IG5ldyBBcnJheShOKTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IE47IGkrKykge1xuICAgIE1baV0gPSBuZXcgQXJyYXkoMTYpO1xuXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCAxNjsgaisrKSB7XG4gICAgICBNW2ldW2pdID0gYnl0ZXNbaSAqIDY0ICsgaiAqIDRdIDw8IDI0IHwgYnl0ZXNbaSAqIDY0ICsgaiAqIDQgKyAxXSA8PCAxNiB8IGJ5dGVzW2kgKiA2NCArIGogKiA0ICsgMl0gPDwgOCB8IGJ5dGVzW2kgKiA2NCArIGogKiA0ICsgM107XG4gICAgfVxuICB9XG5cbiAgTVtOIC0gMV1bMTRdID0gKGJ5dGVzLmxlbmd0aCAtIDEpICogOCAvIE1hdGgucG93KDIsIDMyKTtcbiAgTVtOIC0gMV1bMTRdID0gTWF0aC5mbG9vcihNW04gLSAxXVsxNF0pO1xuICBNW04gLSAxXVsxNV0gPSAoYnl0ZXMubGVuZ3RoIC0gMSkgKiA4ICYgMHhmZmZmZmZmZjtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IE47IGkrKykge1xuICAgIHZhciBXID0gbmV3IEFycmF5KDgwKTtcblxuICAgIGZvciAodmFyIHQgPSAwOyB0IDwgMTY7IHQrKykge1xuICAgICAgV1t0XSA9IE1baV1bdF07XG4gICAgfVxuXG4gICAgZm9yICh2YXIgdCA9IDE2OyB0IDwgODA7IHQrKykge1xuICAgICAgV1t0XSA9IFJPVEwoV1t0IC0gM10gXiBXW3QgLSA4XSBeIFdbdCAtIDE0XSBeIFdbdCAtIDE2XSwgMSk7XG4gICAgfVxuXG4gICAgdmFyIGEgPSBIWzBdO1xuICAgIHZhciBiID0gSFsxXTtcbiAgICB2YXIgYyA9IEhbMl07XG4gICAgdmFyIGQgPSBIWzNdO1xuICAgIHZhciBlID0gSFs0XTtcblxuICAgIGZvciAodmFyIHQgPSAwOyB0IDwgODA7IHQrKykge1xuICAgICAgdmFyIHMgPSBNYXRoLmZsb29yKHQgLyAyMCk7XG4gICAgICB2YXIgVCA9IFJPVEwoYSwgNSkgKyBmKHMsIGIsIGMsIGQpICsgZSArIEtbc10gKyBXW3RdID4+PiAwO1xuICAgICAgZSA9IGQ7XG4gICAgICBkID0gYztcbiAgICAgIGMgPSBST1RMKGIsIDMwKSA+Pj4gMDtcbiAgICAgIGIgPSBhO1xuICAgICAgYSA9IFQ7XG4gICAgfVxuXG4gICAgSFswXSA9IEhbMF0gKyBhID4+PiAwO1xuICAgIEhbMV0gPSBIWzFdICsgYiA+Pj4gMDtcbiAgICBIWzJdID0gSFsyXSArIGMgPj4+IDA7XG4gICAgSFszXSA9IEhbM10gKyBkID4+PiAwO1xuICAgIEhbNF0gPSBIWzRdICsgZSA+Pj4gMDtcbiAgfVxuXG4gIHJldHVybiBbSFswXSA+PiAyNCAmIDB4ZmYsIEhbMF0gPj4gMTYgJiAweGZmLCBIWzBdID4+IDggJiAweGZmLCBIWzBdICYgMHhmZiwgSFsxXSA+PiAyNCAmIDB4ZmYsIEhbMV0gPj4gMTYgJiAweGZmLCBIWzFdID4+IDggJiAweGZmLCBIWzFdICYgMHhmZiwgSFsyXSA+PiAyNCAmIDB4ZmYsIEhbMl0gPj4gMTYgJiAweGZmLCBIWzJdID4+IDggJiAweGZmLCBIWzJdICYgMHhmZiwgSFszXSA+PiAyNCAmIDB4ZmYsIEhbM10gPj4gMTYgJiAweGZmLCBIWzNdID4+IDggJiAweGZmLCBIWzNdICYgMHhmZiwgSFs0XSA+PiAyNCAmIDB4ZmYsIEhbNF0gPj4gMTYgJiAweGZmLCBIWzRdID4+IDggJiAweGZmLCBIWzRdICYgMHhmZl07XG59XG5cbmV4cG9ydCBkZWZhdWx0IHNoYTE7IiwiaW1wb3J0IHJuZyBmcm9tICcuL3JuZy5qcyc7XG5pbXBvcnQgYnl0ZXNUb1V1aWQgZnJvbSAnLi9ieXRlc1RvVXVpZC5qcyc7IC8vICoqYHYxKClgIC0gR2VuZXJhdGUgdGltZS1iYXNlZCBVVUlEKipcbi8vXG4vLyBJbnNwaXJlZCBieSBodHRwczovL2dpdGh1Yi5jb20vTGlvc0svVVVJRC5qc1xuLy8gYW5kIGh0dHA6Ly9kb2NzLnB5dGhvbi5vcmcvbGlicmFyeS91dWlkLmh0bWxcblxudmFyIF9ub2RlSWQ7XG5cbnZhciBfY2xvY2tzZXE7IC8vIFByZXZpb3VzIHV1aWQgY3JlYXRpb24gdGltZVxuXG5cbnZhciBfbGFzdE1TZWNzID0gMDtcbnZhciBfbGFzdE5TZWNzID0gMDsgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS91dWlkanMvdXVpZCBmb3IgQVBJIGRldGFpbHNcblxuZnVuY3Rpb24gdjEob3B0aW9ucywgYnVmLCBvZmZzZXQpIHtcbiAgdmFyIGkgPSBidWYgJiYgb2Zmc2V0IHx8IDA7XG4gIHZhciBiID0gYnVmIHx8IFtdO1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdmFyIG5vZGUgPSBvcHRpb25zLm5vZGUgfHwgX25vZGVJZDtcbiAgdmFyIGNsb2Nrc2VxID0gb3B0aW9ucy5jbG9ja3NlcSAhPT0gdW5kZWZpbmVkID8gb3B0aW9ucy5jbG9ja3NlcSA6IF9jbG9ja3NlcTsgLy8gbm9kZSBhbmQgY2xvY2tzZXEgbmVlZCB0byBiZSBpbml0aWFsaXplZCB0byByYW5kb20gdmFsdWVzIGlmIHRoZXkncmUgbm90XG4gIC8vIHNwZWNpZmllZC4gIFdlIGRvIHRoaXMgbGF6aWx5IHRvIG1pbmltaXplIGlzc3VlcyByZWxhdGVkIHRvIGluc3VmZmljaWVudFxuICAvLyBzeXN0ZW0gZW50cm9weS4gIFNlZSAjMTg5XG5cbiAgaWYgKG5vZGUgPT0gbnVsbCB8fCBjbG9ja3NlcSA9PSBudWxsKSB7XG4gICAgdmFyIHNlZWRCeXRlcyA9IG9wdGlvbnMucmFuZG9tIHx8IChvcHRpb25zLnJuZyB8fCBybmcpKCk7XG5cbiAgICBpZiAobm9kZSA9PSBudWxsKSB7XG4gICAgICAvLyBQZXIgNC41LCBjcmVhdGUgYW5kIDQ4LWJpdCBub2RlIGlkLCAoNDcgcmFuZG9tIGJpdHMgKyBtdWx0aWNhc3QgYml0ID0gMSlcbiAgICAgIG5vZGUgPSBfbm9kZUlkID0gW3NlZWRCeXRlc1swXSB8IDB4MDEsIHNlZWRCeXRlc1sxXSwgc2VlZEJ5dGVzWzJdLCBzZWVkQnl0ZXNbM10sIHNlZWRCeXRlc1s0XSwgc2VlZEJ5dGVzWzVdXTtcbiAgICB9XG5cbiAgICBpZiAoY2xvY2tzZXEgPT0gbnVsbCkge1xuICAgICAgLy8gUGVyIDQuMi4yLCByYW5kb21pemUgKDE0IGJpdCkgY2xvY2tzZXFcbiAgICAgIGNsb2Nrc2VxID0gX2Nsb2Nrc2VxID0gKHNlZWRCeXRlc1s2XSA8PCA4IHwgc2VlZEJ5dGVzWzddKSAmIDB4M2ZmZjtcbiAgICB9XG4gIH0gLy8gVVVJRCB0aW1lc3RhbXBzIGFyZSAxMDAgbmFuby1zZWNvbmQgdW5pdHMgc2luY2UgdGhlIEdyZWdvcmlhbiBlcG9jaCxcbiAgLy8gKDE1ODItMTAtMTUgMDA6MDApLiAgSlNOdW1iZXJzIGFyZW4ndCBwcmVjaXNlIGVub3VnaCBmb3IgdGhpcywgc29cbiAgLy8gdGltZSBpcyBoYW5kbGVkIGludGVybmFsbHkgYXMgJ21zZWNzJyAoaW50ZWdlciBtaWxsaXNlY29uZHMpIGFuZCAnbnNlY3MnXG4gIC8vICgxMDAtbmFub3NlY29uZHMgb2Zmc2V0IGZyb20gbXNlY3MpIHNpbmNlIHVuaXggZXBvY2gsIDE5NzAtMDEtMDEgMDA6MDAuXG5cblxuICB2YXIgbXNlY3MgPSBvcHRpb25zLm1zZWNzICE9PSB1bmRlZmluZWQgPyBvcHRpb25zLm1zZWNzIDogbmV3IERhdGUoKS5nZXRUaW1lKCk7IC8vIFBlciA0LjIuMS4yLCB1c2UgY291bnQgb2YgdXVpZCdzIGdlbmVyYXRlZCBkdXJpbmcgdGhlIGN1cnJlbnQgY2xvY2tcbiAgLy8gY3ljbGUgdG8gc2ltdWxhdGUgaGlnaGVyIHJlc29sdXRpb24gY2xvY2tcblxuICB2YXIgbnNlY3MgPSBvcHRpb25zLm5zZWNzICE9PSB1bmRlZmluZWQgPyBvcHRpb25zLm5zZWNzIDogX2xhc3ROU2VjcyArIDE7IC8vIFRpbWUgc2luY2UgbGFzdCB1dWlkIGNyZWF0aW9uIChpbiBtc2VjcylcblxuICB2YXIgZHQgPSBtc2VjcyAtIF9sYXN0TVNlY3MgKyAobnNlY3MgLSBfbGFzdE5TZWNzKSAvIDEwMDAwOyAvLyBQZXIgNC4yLjEuMiwgQnVtcCBjbG9ja3NlcSBvbiBjbG9jayByZWdyZXNzaW9uXG5cbiAgaWYgKGR0IDwgMCAmJiBvcHRpb25zLmNsb2Nrc2VxID09PSB1bmRlZmluZWQpIHtcbiAgICBjbG9ja3NlcSA9IGNsb2Nrc2VxICsgMSAmIDB4M2ZmZjtcbiAgfSAvLyBSZXNldCBuc2VjcyBpZiBjbG9jayByZWdyZXNzZXMgKG5ldyBjbG9ja3NlcSkgb3Igd2UndmUgbW92ZWQgb250byBhIG5ld1xuICAvLyB0aW1lIGludGVydmFsXG5cblxuICBpZiAoKGR0IDwgMCB8fCBtc2VjcyA+IF9sYXN0TVNlY3MpICYmIG9wdGlvbnMubnNlY3MgPT09IHVuZGVmaW5lZCkge1xuICAgIG5zZWNzID0gMDtcbiAgfSAvLyBQZXIgNC4yLjEuMiBUaHJvdyBlcnJvciBpZiB0b28gbWFueSB1dWlkcyBhcmUgcmVxdWVzdGVkXG5cblxuICBpZiAobnNlY3MgPj0gMTAwMDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJ1dWlkLnYxKCk6IENhbid0IGNyZWF0ZSBtb3JlIHRoYW4gMTBNIHV1aWRzL3NlY1wiKTtcbiAgfVxuXG4gIF9sYXN0TVNlY3MgPSBtc2VjcztcbiAgX2xhc3ROU2VjcyA9IG5zZWNzO1xuICBfY2xvY2tzZXEgPSBjbG9ja3NlcTsgLy8gUGVyIDQuMS40IC0gQ29udmVydCBmcm9tIHVuaXggZXBvY2ggdG8gR3JlZ29yaWFuIGVwb2NoXG5cbiAgbXNlY3MgKz0gMTIyMTkyOTI4MDAwMDA7IC8vIGB0aW1lX2xvd2BcblxuICB2YXIgdGwgPSAoKG1zZWNzICYgMHhmZmZmZmZmKSAqIDEwMDAwICsgbnNlY3MpICUgMHgxMDAwMDAwMDA7XG4gIGJbaSsrXSA9IHRsID4+PiAyNCAmIDB4ZmY7XG4gIGJbaSsrXSA9IHRsID4+PiAxNiAmIDB4ZmY7XG4gIGJbaSsrXSA9IHRsID4+PiA4ICYgMHhmZjtcbiAgYltpKytdID0gdGwgJiAweGZmOyAvLyBgdGltZV9taWRgXG5cbiAgdmFyIHRtaCA9IG1zZWNzIC8gMHgxMDAwMDAwMDAgKiAxMDAwMCAmIDB4ZmZmZmZmZjtcbiAgYltpKytdID0gdG1oID4+PiA4ICYgMHhmZjtcbiAgYltpKytdID0gdG1oICYgMHhmZjsgLy8gYHRpbWVfaGlnaF9hbmRfdmVyc2lvbmBcblxuICBiW2krK10gPSB0bWggPj4+IDI0ICYgMHhmIHwgMHgxMDsgLy8gaW5jbHVkZSB2ZXJzaW9uXG5cbiAgYltpKytdID0gdG1oID4+PiAxNiAmIDB4ZmY7IC8vIGBjbG9ja19zZXFfaGlfYW5kX3Jlc2VydmVkYCAoUGVyIDQuMi4yIC0gaW5jbHVkZSB2YXJpYW50KVxuXG4gIGJbaSsrXSA9IGNsb2Nrc2VxID4+PiA4IHwgMHg4MDsgLy8gYGNsb2NrX3NlcV9sb3dgXG5cbiAgYltpKytdID0gY2xvY2tzZXEgJiAweGZmOyAvLyBgbm9kZWBcblxuICBmb3IgKHZhciBuID0gMDsgbiA8IDY7ICsrbikge1xuICAgIGJbaSArIG5dID0gbm9kZVtuXTtcbiAgfVxuXG4gIHJldHVybiBidWYgPyBidWYgOiBieXRlc1RvVXVpZChiKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgdjE7IiwiaW1wb3J0IHYzNSBmcm9tICcuL3YzNS5qcyc7XG5pbXBvcnQgbWQ1IGZyb20gJy4vbWQ1LmpzJztcbnZhciB2MyA9IHYzNSgndjMnLCAweDMwLCBtZDUpO1xuZXhwb3J0IGRlZmF1bHQgdjM7IiwiaW1wb3J0IGJ5dGVzVG9VdWlkIGZyb20gJy4vYnl0ZXNUb1V1aWQuanMnO1xuXG5mdW5jdGlvbiB1dWlkVG9CeXRlcyh1dWlkKSB7XG4gIC8vIE5vdGU6IFdlIGFzc3VtZSB3ZSdyZSBiZWluZyBwYXNzZWQgYSB2YWxpZCB1dWlkIHN0cmluZ1xuICB2YXIgYnl0ZXMgPSBbXTtcbiAgdXVpZC5yZXBsYWNlKC9bYS1mQS1GMC05XXsyfS9nLCBmdW5jdGlvbiAoaGV4KSB7XG4gICAgYnl0ZXMucHVzaChwYXJzZUludChoZXgsIDE2KSk7XG4gIH0pO1xuICByZXR1cm4gYnl0ZXM7XG59XG5cbmZ1bmN0aW9uIHN0cmluZ1RvQnl0ZXMoc3RyKSB7XG4gIHN0ciA9IHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChzdHIpKTsgLy8gVVRGOCBlc2NhcGVcblxuICB2YXIgYnl0ZXMgPSBuZXcgQXJyYXkoc3RyLmxlbmd0aCk7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICBieXRlc1tpXSA9IHN0ci5jaGFyQ29kZUF0KGkpO1xuICB9XG5cbiAgcmV0dXJuIGJ5dGVzO1xufVxuXG5leHBvcnQgdmFyIEROUyA9ICc2YmE3YjgxMC05ZGFkLTExZDEtODBiNC0wMGMwNGZkNDMwYzgnO1xuZXhwb3J0IHZhciBVUkwgPSAnNmJhN2I4MTEtOWRhZC0xMWQxLTgwYjQtMDBjMDRmZDQzMGM4JztcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChuYW1lLCB2ZXJzaW9uLCBoYXNoZnVuYykge1xuICB2YXIgZ2VuZXJhdGVVVUlEID0gZnVuY3Rpb24gZ2VuZXJhdGVVVUlEKHZhbHVlLCBuYW1lc3BhY2UsIGJ1Ziwgb2Zmc2V0KSB7XG4gICAgdmFyIG9mZiA9IGJ1ZiAmJiBvZmZzZXQgfHwgMDtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09ICdzdHJpbmcnKSB2YWx1ZSA9IHN0cmluZ1RvQnl0ZXModmFsdWUpO1xuICAgIGlmICh0eXBlb2YgbmFtZXNwYWNlID09ICdzdHJpbmcnKSBuYW1lc3BhY2UgPSB1dWlkVG9CeXRlcyhuYW1lc3BhY2UpO1xuICAgIGlmICghQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHRocm93IFR5cGVFcnJvcigndmFsdWUgbXVzdCBiZSBhbiBhcnJheSBvZiBieXRlcycpO1xuICAgIGlmICghQXJyYXkuaXNBcnJheShuYW1lc3BhY2UpIHx8IG5hbWVzcGFjZS5sZW5ndGggIT09IDE2KSB0aHJvdyBUeXBlRXJyb3IoJ25hbWVzcGFjZSBtdXN0IGJlIHV1aWQgc3RyaW5nIG9yIGFuIEFycmF5IG9mIDE2IGJ5dGUgdmFsdWVzJyk7IC8vIFBlciA0LjNcblxuICAgIHZhciBieXRlcyA9IGhhc2hmdW5jKG5hbWVzcGFjZS5jb25jYXQodmFsdWUpKTtcbiAgICBieXRlc1s2XSA9IGJ5dGVzWzZdICYgMHgwZiB8IHZlcnNpb247XG4gICAgYnl0ZXNbOF0gPSBieXRlc1s4XSAmIDB4M2YgfCAweDgwO1xuXG4gICAgaWYgKGJ1Zikge1xuICAgICAgZm9yICh2YXIgaWR4ID0gMDsgaWR4IDwgMTY7ICsraWR4KSB7XG4gICAgICAgIGJ1ZltvZmYgKyBpZHhdID0gYnl0ZXNbaWR4XTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYnVmIHx8IGJ5dGVzVG9VdWlkKGJ5dGVzKTtcbiAgfTsgLy8gRnVuY3Rpb24jbmFtZSBpcyBub3Qgc2V0dGFibGUgb24gc29tZSBwbGF0Zm9ybXMgKCMyNzApXG5cblxuICB0cnkge1xuICAgIGdlbmVyYXRlVVVJRC5uYW1lID0gbmFtZTtcbiAgfSBjYXRjaCAoZXJyKSB7fSAvLyBGb3IgQ29tbW9uSlMgZGVmYXVsdCBleHBvcnQgc3VwcG9ydFxuXG5cbiAgZ2VuZXJhdGVVVUlELkROUyA9IEROUztcbiAgZ2VuZXJhdGVVVUlELlVSTCA9IFVSTDtcbiAgcmV0dXJuIGdlbmVyYXRlVVVJRDtcbn0iLCJpbXBvcnQgcm5nIGZyb20gJy4vcm5nLmpzJztcbmltcG9ydCBieXRlc1RvVXVpZCBmcm9tICcuL2J5dGVzVG9VdWlkLmpzJztcblxuZnVuY3Rpb24gdjQob3B0aW9ucywgYnVmLCBvZmZzZXQpIHtcbiAgdmFyIGkgPSBidWYgJiYgb2Zmc2V0IHx8IDA7XG5cbiAgaWYgKHR5cGVvZiBvcHRpb25zID09ICdzdHJpbmcnKSB7XG4gICAgYnVmID0gb3B0aW9ucyA9PT0gJ2JpbmFyeScgPyBuZXcgQXJyYXkoMTYpIDogbnVsbDtcbiAgICBvcHRpb25zID0gbnVsbDtcbiAgfVxuXG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICB2YXIgcm5kcyA9IG9wdGlvbnMucmFuZG9tIHx8IChvcHRpb25zLnJuZyB8fCBybmcpKCk7IC8vIFBlciA0LjQsIHNldCBiaXRzIGZvciB2ZXJzaW9uIGFuZCBgY2xvY2tfc2VxX2hpX2FuZF9yZXNlcnZlZGBcblxuICBybmRzWzZdID0gcm5kc1s2XSAmIDB4MGYgfCAweDQwO1xuICBybmRzWzhdID0gcm5kc1s4XSAmIDB4M2YgfCAweDgwOyAvLyBDb3B5IGJ5dGVzIHRvIGJ1ZmZlciwgaWYgcHJvdmlkZWRcblxuICBpZiAoYnVmKSB7XG4gICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IDE2OyArK2lpKSB7XG4gICAgICBidWZbaSArIGlpXSA9IHJuZHNbaWldO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBidWYgfHwgYnl0ZXNUb1V1aWQocm5kcyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHY0OyIsImltcG9ydCB2MzUgZnJvbSAnLi92MzUuanMnO1xuaW1wb3J0IHNoYTEgZnJvbSAnLi9zaGExLmpzJztcbnZhciB2NSA9IHYzNSgndjUnLCAweDUwLCBzaGExKTtcbmV4cG9ydCBkZWZhdWx0IHY1OyIsInZhciBnO1xuXG4vLyBUaGlzIHdvcmtzIGluIG5vbi1zdHJpY3QgbW9kZVxuZyA9IChmdW5jdGlvbigpIHtcblx0cmV0dXJuIHRoaXM7XG59KSgpO1xuXG50cnkge1xuXHQvLyBUaGlzIHdvcmtzIGlmIGV2YWwgaXMgYWxsb3dlZCAoc2VlIENTUClcblx0ZyA9IGcgfHwgbmV3IEZ1bmN0aW9uKFwicmV0dXJuIHRoaXNcIikoKTtcbn0gY2F0Y2ggKGUpIHtcblx0Ly8gVGhpcyB3b3JrcyBpZiB0aGUgd2luZG93IHJlZmVyZW5jZSBpcyBhdmFpbGFibGVcblx0aWYgKHR5cGVvZiB3aW5kb3cgPT09IFwib2JqZWN0XCIpIGcgPSB3aW5kb3c7XG59XG5cbi8vIGcgY2FuIHN0aWxsIGJlIHVuZGVmaW5lZCwgYnV0IG5vdGhpbmcgdG8gZG8gYWJvdXQgaXQuLi5cbi8vIFdlIHJldHVybiB1bmRlZmluZWQsIGluc3RlYWQgb2Ygbm90aGluZyBoZXJlLCBzbyBpdCdzXG4vLyBlYXNpZXIgdG8gaGFuZGxlIHRoaXMgY2FzZS4gaWYoIWdsb2JhbCkgeyAuLi59XG5cbm1vZHVsZS5leHBvcnRzID0gZztcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obW9kdWxlKSB7XG5cdGlmICghbW9kdWxlLndlYnBhY2tQb2x5ZmlsbCkge1xuXHRcdG1vZHVsZS5kZXByZWNhdGUgPSBmdW5jdGlvbigpIHt9O1xuXHRcdG1vZHVsZS5wYXRocyA9IFtdO1xuXHRcdC8vIG1vZHVsZS5wYXJlbnQgPSB1bmRlZmluZWQgYnkgZGVmYXVsdFxuXHRcdGlmICghbW9kdWxlLmNoaWxkcmVuKSBtb2R1bGUuY2hpbGRyZW4gPSBbXTtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobW9kdWxlLCBcImxvYWRlZFwiLCB7XG5cdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuXHRcdFx0Z2V0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuIG1vZHVsZS5sO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShtb2R1bGUsIFwiaWRcIiwge1xuXHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcblx0XHRcdGdldDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiBtb2R1bGUuaTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRtb2R1bGUud2VicGFja1BvbHlmaWxsID0gMTtcblx0fVxuXHRyZXR1cm4gbW9kdWxlO1xufTtcbiIsInV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpXG5TdG9yYWdlID0gcmVxdWlyZSgnLi9zdG9yYWdlJylcblxuY2xhc3MgQWRhcHRlcnNcblxuICAjIyBBIHBhcmVudCBjbGFzcyBBZGFwdGVyIGZvciB1c2luZyB0aGUgQWxlcGhiZXQgYmFja2VuZCBBUEkuXG4gICMjIHVzZXMgalF1ZXJ5IHRvIHNlbmQgZGF0YSBpZiBgJC5hamF4YCBpcyBmb3VuZC4gRmFsbHMgYmFjayBvbiBwbGFpbiBqcyB4aHJcbiAgIyMgcGFyYW1zOlxuICAjIyAtIHVybDogdHJhY2sgVVJMIHRvIHBvc3QgZXZlbnRzIHRvXG4gICMjIC0gbmFtZXBzYWNlIChvcHRpb25hbCk6IGFsbG93cyBzZXR0aW5nIGRpZmZlcmVudCBlbnZpcm9ubWVudHMgZXRjXG4gICMjIC0gc3RvcmFnZSAob3B0aW9uYWwpOiBzdG9yYWdlIGFkYXB0ZXIgZm9yIHRoZSBxdWV1ZVxuICBjbGFzcyBAQWxlcGhiZXRBZGFwdGVyXG4gICAgcXVldWVfbmFtZTogJ19hbGVwaGJldF9xdWV1ZSdcblxuICAgIGNvbnN0cnVjdG9yOiAodXJsLCBuYW1lc3BhY2UgPSAnYWxlcGhiZXQnLCBzdG9yYWdlID0gQWRhcHRlcnMuTG9jYWxTdG9yYWdlQWRhcHRlcikgLT5cbiAgICAgIEBfc3RvcmFnZSA9IHN0b3JhZ2VcbiAgICAgIEB1cmwgPSB1cmxcbiAgICAgIEBuYW1lc3BhY2UgPSBuYW1lc3BhY2VcbiAgICAgIEBfcXVldWUgPSBKU09OLnBhcnNlKEBfc3RvcmFnZS5nZXQoQHF1ZXVlX25hbWUpIHx8ICdbXScpXG4gICAgICBAX2ZsdXNoKClcblxuICAgIF9yZW1vdmVfcXV1aWQ6IChxdXVpZCkgLT5cbiAgICAgIChlcnIsIHJlcykgPT5cbiAgICAgICAgcmV0dXJuIGlmIGVyclxuICAgICAgICB1dGlscy5yZW1vdmUoQF9xdWV1ZSwgKGVsKSAtPiBlbC5wcm9wZXJ0aWVzLl9xdXVpZCA9PSBxdXVpZClcbiAgICAgICAgQF9zdG9yYWdlLnNldChAcXVldWVfbmFtZSwgSlNPTi5zdHJpbmdpZnkoQF9xdWV1ZSkpXG5cbiAgICBfanF1ZXJ5X2dldDogKHVybCwgZGF0YSwgY2FsbGJhY2spIC0+XG4gICAgICB1dGlscy5sb2coJ3NlbmQgcmVxdWVzdCB1c2luZyBqUXVlcnknKVxuICAgICAgd2luZG93LmpRdWVyeS5hamF4XG4gICAgICAgIG1ldGhvZDogJ0dFVCdcbiAgICAgICAgdXJsOiB1cmxcbiAgICAgICAgZGF0YTogZGF0YVxuICAgICAgICBzdWNjZXNzOiBjYWxsYmFja1xuXG4gICAgX3BsYWluX2pzX2dldDogKHVybCwgZGF0YSwgY2FsbGJhY2spIC0+XG4gICAgICB1dGlscy5sb2coJ2ZhbGxiYWNrIG9uIHBsYWluIGpzIHhocicpXG4gICAgICB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuICAgICAgcGFyYW1zID0gKFwiI3tlbmNvZGVVUklDb21wb25lbnQoayl9PSN7ZW5jb2RlVVJJQ29tcG9uZW50KHYpfVwiIGZvciBrLHYgb2YgZGF0YSlcbiAgICAgIHBhcmFtcyA9IHBhcmFtcy5qb2luKCcmJykucmVwbGFjZSgvJTIwL2csICcrJylcbiAgICAgIHhoci5vcGVuKCdHRVQnLCBcIiN7dXJsfT8je3BhcmFtc31cIilcbiAgICAgIHhoci5vbmxvYWQgPSAtPlxuICAgICAgICBpZiB4aHIuc3RhdHVzID09IDIwMFxuICAgICAgICAgIGNhbGxiYWNrKClcbiAgICAgIHhoci5zZW5kKClcblxuICAgIF9hamF4X2dldDogKHVybCwgZGF0YSwgY2FsbGJhY2spIC0+XG4gICAgICBpZiB3aW5kb3cualF1ZXJ5Py5hamF4XG4gICAgICAgIEBfanF1ZXJ5X2dldCh1cmwsIGRhdGEsIGNhbGxiYWNrKVxuICAgICAgZWxzZVxuICAgICAgICBAX3BsYWluX2pzX2dldCh1cmwsIGRhdGEsIGNhbGxiYWNrKVxuXG4gICAgX2ZsdXNoOiAtPlxuICAgICAgZm9yIGl0ZW0gaW4gQF9xdWV1ZVxuICAgICAgICBjYWxsYmFjayA9IEBfcmVtb3ZlX3F1dWlkKGl0ZW0ucHJvcGVydGllcy5fcXV1aWQpXG4gICAgICAgIEBfYWpheF9nZXQoQHVybCwgdXRpbHMub21pdChpdGVtLnByb3BlcnRpZXMsICdfcXV1aWQnKSwgY2FsbGJhY2spXG4gICAgICAgIG51bGxcblxuICAgIF91c2VyX3V1aWQ6IChleHBlcmltZW50LCBnb2FsKSAtPlxuICAgICAgcmV0dXJuIHV0aWxzLnV1aWQoKSB1bmxlc3MgZXhwZXJpbWVudC51c2VyX2lkXG4gICAgICAjIGlmIGdvYWwgaXMgbm90IHVuaXF1ZSwgd2UgdHJhY2sgaXQgZXZlcnkgdGltZS4gcmV0dXJuIGEgbmV3IHJhbmRvbSB1dWlkXG4gICAgICByZXR1cm4gdXRpbHMudXVpZCgpIHVubGVzcyBnb2FsLnVuaXF1ZVxuICAgICAgIyBmb3IgYSBnaXZlbiB1c2VyIGlkLCBuYW1lc3BhY2UsIGdvYWwgYW5kIGV4cGVyaW1lbnQsIHRoZSB1dWlkIHdpbGwgYWx3YXlzIGJlIHRoZSBzYW1lXG4gICAgICAjIHRoaXMgYXZvaWRzIGNvdW50aW5nIGdvYWxzIHR3aWNlIGZvciB0aGUgc2FtZSB1c2VyIGFjcm9zcyBkaWZmZXJlbnQgZGV2aWNlc1xuICAgICAgdXRpbHMuc2hhMShcIiN7QG5hbWVzcGFjZX0uI3tleHBlcmltZW50Lm5hbWV9LiN7Z29hbC5uYW1lfS4je2V4cGVyaW1lbnQudXNlcl9pZH1cIilcblxuICAgIF90cmFjazogKGV4cGVyaW1lbnQsIHZhcmlhbnQsIGdvYWwpIC0+XG4gICAgICB1dGlscy5sb2coXCJQZXJzaXN0ZW50IFF1ZXVlIEdpbWVsIHRyYWNrOiAje0BuYW1lc3BhY2V9LCAje2V4cGVyaW1lbnQubmFtZX0sICN7dmFyaWFudH0sICN7Z29hbC5uYW1lfVwiKVxuICAgICAgQF9xdWV1ZS5zaGlmdCgpIGlmIEBfcXVldWUubGVuZ3RoID4gMTAwXG4gICAgICBAX3F1ZXVlLnB1c2hcbiAgICAgICAgcHJvcGVydGllczpcbiAgICAgICAgICBleHBlcmltZW50OiBleHBlcmltZW50Lm5hbWVcbiAgICAgICAgICBfcXV1aWQ6IHV0aWxzLnV1aWQoKSAgIyBxdWV1ZSB1dWlkICh1c2VkIG9ubHkgaW50ZXJuYWxseSlcbiAgICAgICAgICB1dWlkOiBAX3VzZXJfdXVpZChleHBlcmltZW50LCBnb2FsKVxuICAgICAgICAgIHZhcmlhbnQ6IHZhcmlhbnRcbiAgICAgICAgICBldmVudDogZ29hbC5uYW1lXG4gICAgICAgICAgbmFtZXNwYWNlOiBAbmFtZXNwYWNlXG4gICAgICBAX3N0b3JhZ2Uuc2V0KEBxdWV1ZV9uYW1lLCBKU09OLnN0cmluZ2lmeShAX3F1ZXVlKSlcbiAgICAgIEBfZmx1c2goKVxuXG4gICAgZXhwZXJpbWVudF9zdGFydDogKGV4cGVyaW1lbnQsIHZhcmlhbnQpIC0+XG4gICAgICBAX3RyYWNrKGV4cGVyaW1lbnQsIHZhcmlhbnQsIHtuYW1lOiAncGFydGljaXBhdGUnLCB1bmlxdWU6IHRydWV9KVxuXG4gICAgZ29hbF9jb21wbGV0ZTogKGV4cGVyaW1lbnQsIHZhcmlhbnQsIGdvYWxfbmFtZSwgcHJvcHMpIC0+XG4gICAgICBAX3RyYWNrKGV4cGVyaW1lbnQsIHZhcmlhbnQsIHV0aWxzLmRlZmF1bHRzKHtuYW1lOiBnb2FsX25hbWV9LCBwcm9wcykpXG5cbiAgIyMgQWRhcHRlciBmb3IgdXNpbmcgdGhlIGxhbWVkIGJhY2tlbmQuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vQWxlcGhiZXQvbGFtZWRcbiAgIyMgaW5oZXJpdHMgZnJvbSBBbGVwaGJldEFkYXB0ZXIgd2hpY2ggdXNlcyB0aGUgc2FtZSBiYWNrZW5kIEFQSVxuICAjI1xuICBjbGFzcyBATGFtZWRBZGFwdGVyIGV4dGVuZHMgQEFsZXBoYmV0QWRhcHRlclxuICAgIHF1ZXVlX25hbWU6ICdfbGFtZWRfcXVldWUnXG5cbiAgIyMgQWRhcHRlciBmb3IgdXNpbmcgdGhlIGdpbWVsIGJhY2tlbmQuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vQWxlcGhiZXQvZ2ltZWxcbiAgIyMgVGhlIG1haW4gZGlmZmVyZW5jZSBpcyB0aGUgdXNlcl91dWlkIGdlbmVyYXRpb24gKGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eSlcbiAgIyMgcGFyYW1zOlxuICAjIyAtIHVybDogR2ltZWwgdHJhY2sgVVJMIHRvIHBvc3QgZXZlbnRzIHRvXG4gICMjIC0gbmFtZXBzYWNlOiBuYW1lc3BhY2UgZm9yIEdpbWVsIChhbGxvd3Mgc2V0dGluZyBkaWZmZXJlbnQgZW52aXJvbm1lbnRzIGV0YylcbiAgIyMgLSBzdG9yYWdlIChvcHRpb25hbCkgLSBzdG9yYWdlIGFkYXB0ZXIgZm9yIHRoZSBxdWV1ZVxuICBjbGFzcyBAR2ltZWxBZGFwdGVyIGV4dGVuZHMgQEFsZXBoYmV0QWRhcHRlclxuICAgIHF1ZXVlX25hbWU6ICdfbGFtZWRfcXVldWUnXG5cbiAgICBfdXNlcl91dWlkOiAoZXhwZXJpbWVudCwgZ29hbCkgLT5cbiAgICAgIHJldHVybiB1dGlscy51dWlkKCkgdW5sZXNzIGV4cGVyaW1lbnQudXNlcl9pZFxuICAgICAgIyBpZiBnb2FsIGlzIG5vdCB1bmlxdWUsIHdlIHRyYWNrIGl0IGV2ZXJ5IHRpbWUuIHJldHVybiBhIG5ldyByYW5kb20gdXVpZFxuICAgICAgcmV0dXJuIHV0aWxzLnV1aWQoKSB1bmxlc3MgZ29hbC51bmlxdWVcbiAgICAgICMgZm9yIGEgZ2l2ZW4gdXNlciBpZCwgbmFtZXNwYWNlIGFuZCBleHBlcmltZW50LCB0aGUgdXVpZCB3aWxsIGFsd2F5cyBiZSB0aGUgc2FtZVxuICAgICAgIyB0aGlzIGF2b2lkcyBjb3VudGluZyBnb2FscyB0d2ljZSBmb3IgdGhlIHNhbWUgdXNlciBhY3Jvc3MgZGlmZmVyZW50IGRldmljZXNcbiAgICAgIHV0aWxzLnNoYTEoXCIje0BuYW1lc3BhY2V9LiN7ZXhwZXJpbWVudC5uYW1lfS4je2V4cGVyaW1lbnQudXNlcl9pZH1cIilcblxuICAjIyBBZGFwdGVyIGZvciB1c2luZyB0aGUgbGFtZWQgYmFja2VuZC4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9BbGVwaGJldC9sYW1lZFxuICAjIyBpbmhlcml0cyBmcm9tIEFsZXBoYmV0QWRhcHRlciB3aGljaCB1c2VzIHRoZSBzYW1lIGJhY2tlbmQgQVBJXG4gICMjXG4gIGNsYXNzIEBSYWlsc0FkYXB0ZXIgZXh0ZW5kcyBAQWxlcGhiZXRBZGFwdGVyXG4gICAgcXVldWVfbmFtZTogJ19yYWlsc19xdWV1ZSdcblxuXG4gIGNsYXNzIEBQZXJzaXN0ZW50UXVldWVHb29nbGVBbmFseXRpY3NBZGFwdGVyXG4gICAgbmFtZXNwYWNlOiAnYWxlcGhiZXQnXG4gICAgcXVldWVfbmFtZTogJ19nYV9xdWV1ZSdcblxuICAgIGNvbnN0cnVjdG9yOiAoc3RvcmFnZSA9IEFkYXB0ZXJzLkxvY2FsU3RvcmFnZUFkYXB0ZXIpIC0+XG4gICAgICBAX3N0b3JhZ2UgPSBzdG9yYWdlXG4gICAgICBAX3F1ZXVlID0gSlNPTi5wYXJzZShAX3N0b3JhZ2UuZ2V0KEBxdWV1ZV9uYW1lKSB8fCAnW10nKVxuICAgICAgQF9mbHVzaCgpXG5cbiAgICBfcmVtb3ZlX3V1aWQ6ICh1dWlkKSAtPlxuICAgICAgPT5cbiAgICAgICAgdXRpbHMucmVtb3ZlKEBfcXVldWUsIChlbCkgLT4gZWwudXVpZCA9PSB1dWlkKVxuICAgICAgICBAX3N0b3JhZ2Uuc2V0KEBxdWV1ZV9uYW1lLCBKU09OLnN0cmluZ2lmeShAX3F1ZXVlKSlcblxuICAgIF9mbHVzaDogLT5cbiAgICAgIHRocm93IG5ldyBFcnJvcignZ2Egbm90IGRlZmluZWQuIFBsZWFzZSBtYWtlIHN1cmUgeW91ciBVbml2ZXJzYWwgYW5hbHl0aWNzIGlzIHNldCB1cCBjb3JyZWN0bHknKSBpZiB0eXBlb2YgZ2EgaXNudCAnZnVuY3Rpb24nXG4gICAgICBmb3IgaXRlbSBpbiBAX3F1ZXVlXG4gICAgICAgIGNhbGxiYWNrID0gQF9yZW1vdmVfdXVpZChpdGVtLnV1aWQpXG4gICAgICAgIGdhKCdzZW5kJywgJ2V2ZW50JywgaXRlbS5jYXRlZ29yeSwgaXRlbS5hY3Rpb24sIGl0ZW0ubGFiZWwsIHsnaGl0Q2FsbGJhY2snOiBjYWxsYmFjaywgJ25vbkludGVyYWN0aW9uJzogMX0pXG5cbiAgICBfdHJhY2s6IChjYXRlZ29yeSwgYWN0aW9uLCBsYWJlbCkgLT5cbiAgICAgIHV0aWxzLmxvZyhcIlBlcnNpc3RlbnQgUXVldWUgR29vZ2xlIFVuaXZlcnNhbCBBbmFseXRpY3MgdHJhY2s6ICN7Y2F0ZWdvcnl9LCAje2FjdGlvbn0sICN7bGFiZWx9XCIpXG4gICAgICBAX3F1ZXVlLnNoaWZ0KCkgaWYgQF9xdWV1ZS5sZW5ndGggPiAxMDBcbiAgICAgIEBfcXVldWUucHVzaCh7dXVpZDogdXRpbHMudXVpZCgpLCBjYXRlZ29yeTogY2F0ZWdvcnksIGFjdGlvbjogYWN0aW9uLCBsYWJlbDogbGFiZWx9KVxuICAgICAgQF9zdG9yYWdlLnNldChAcXVldWVfbmFtZSwgSlNPTi5zdHJpbmdpZnkoQF9xdWV1ZSkpXG4gICAgICBAX2ZsdXNoKClcblxuICAgIGV4cGVyaW1lbnRfc3RhcnQ6IChleHBlcmltZW50LCB2YXJpYW50KSAtPlxuICAgICAgQF90cmFjayhAbmFtZXNwYWNlLCBcIiN7ZXhwZXJpbWVudC5uYW1lfSB8ICN7dmFyaWFudH1cIiwgJ1Zpc2l0b3JzJylcblxuICAgIGdvYWxfY29tcGxldGU6IChleHBlcmltZW50LCB2YXJpYW50LCBnb2FsX25hbWUsIF9wcm9wcykgLT5cbiAgICAgIEBfdHJhY2soQG5hbWVzcGFjZSwgXCIje2V4cGVyaW1lbnQubmFtZX0gfCAje3ZhcmlhbnR9XCIsIGdvYWxfbmFtZSlcblxuXG4gIGNsYXNzIEBQZXJzaXN0ZW50UXVldWVLZWVuQWRhcHRlclxuICAgIHF1ZXVlX25hbWU6ICdfa2Vlbl9xdWV1ZSdcblxuICAgIGNvbnN0cnVjdG9yOiAoa2Vlbl9jbGllbnQsIHN0b3JhZ2UgPSBBZGFwdGVycy5Mb2NhbFN0b3JhZ2VBZGFwdGVyKSAtPlxuICAgICAgQGNsaWVudCA9IGtlZW5fY2xpZW50XG4gICAgICBAX3N0b3JhZ2UgPSBzdG9yYWdlXG4gICAgICBAX3F1ZXVlID0gSlNPTi5wYXJzZShAX3N0b3JhZ2UuZ2V0KEBxdWV1ZV9uYW1lKSB8fCAnW10nKVxuICAgICAgQF9mbHVzaCgpXG5cbiAgICBfcmVtb3ZlX3F1dWlkOiAocXV1aWQpIC0+XG4gICAgICAoZXJyLCByZXMpID0+XG4gICAgICAgIHJldHVybiBpZiBlcnJcbiAgICAgICAgdXRpbHMucmVtb3ZlKEBfcXVldWUsIChlbCkgLT4gZWwucHJvcGVydGllcy5fcXV1aWQgPT0gcXV1aWQpXG4gICAgICAgIEBfc3RvcmFnZS5zZXQoQHF1ZXVlX25hbWUsIEpTT04uc3RyaW5naWZ5KEBfcXVldWUpKVxuXG4gICAgX2ZsdXNoOiAtPlxuICAgICAgZm9yIGl0ZW0gaW4gQF9xdWV1ZVxuICAgICAgICBjYWxsYmFjayA9IEBfcmVtb3ZlX3F1dWlkKGl0ZW0ucHJvcGVydGllcy5fcXV1aWQpXG4gICAgICAgIEBjbGllbnQuYWRkRXZlbnQoaXRlbS5leHBlcmltZW50X25hbWUsIHV0aWxzLm9taXQoaXRlbS5wcm9wZXJ0aWVzLCAnX3F1dWlkJyksIGNhbGxiYWNrKVxuXG4gICAgX3VzZXJfdXVpZDogKGV4cGVyaW1lbnQsIGdvYWwpIC0+XG4gICAgICByZXR1cm4gdXRpbHMudXVpZCgpIHVubGVzcyBleHBlcmltZW50LnVzZXJfaWRcbiAgICAgICMgaWYgZ29hbCBpcyBub3QgdW5pcXVlLCB3ZSB0cmFjayBpdCBldmVyeSB0aW1lLiByZXR1cm4gYSBuZXcgcmFuZG9tIHV1aWRcbiAgICAgIHJldHVybiB1dGlscy51dWlkKCkgdW5sZXNzIGdvYWwudW5pcXVlXG4gICAgICAjIGZvciBhIGdpdmVuIHVzZXIgaWQsIG5hbWVzcGFjZSBhbmQgZXhwZXJpbWVudCwgdGhlIHV1aWQgd2lsbCBhbHdheXMgYmUgdGhlIHNhbWVcbiAgICAgICMgdGhpcyBhdm9pZHMgY291bnRpbmcgZ29hbHMgdHdpY2UgZm9yIHRoZSBzYW1lIHVzZXIgYWNyb3NzIGRpZmZlcmVudCBkZXZpY2VzXG4gICAgICB1dGlscy5zaGExKFwiI3tAbmFtZXNwYWNlfS4je2V4cGVyaW1lbnQubmFtZX0uI3tleHBlcmltZW50LnVzZXJfaWR9XCIpXG5cbiAgICBfdHJhY2s6IChleHBlcmltZW50LCB2YXJpYW50LCBnb2FsKSAtPlxuICAgICAgdXRpbHMubG9nKFwiUGVyc2lzdGVudCBRdWV1ZSBLZWVuIHRyYWNrOiAje2V4cGVyaW1lbnQubmFtZX0sICN7dmFyaWFudH0sICN7ZXZlbnR9XCIpXG4gICAgICBAX3F1ZXVlLnNoaWZ0KCkgaWYgQF9xdWV1ZS5sZW5ndGggPiAxMDBcbiAgICAgIEBfcXVldWUucHVzaFxuICAgICAgICBleHBlcmltZW50X25hbWU6IGV4cGVyaW1lbnQubmFtZVxuICAgICAgICBwcm9wZXJ0aWVzOlxuICAgICAgICAgIF9xdXVpZDogdXRpbHMudXVpZCgpICAjIHF1ZXVlIHV1aWQgKHVzZWQgb25seSBpbnRlcm5hbGx5KVxuICAgICAgICAgIHV1aWQ6IEBfdXNlcl91dWlkKGV4cGVyaW1lbnQsIGdvYWwpXG4gICAgICAgICAgdmFyaWFudDogdmFyaWFudFxuICAgICAgICAgIGV2ZW50OiBnb2FsLm5hbWVcbiAgICAgIEBfc3RvcmFnZS5zZXQoQHF1ZXVlX25hbWUsIEpTT04uc3RyaW5naWZ5KEBfcXVldWUpKVxuICAgICAgQF9mbHVzaCgpXG5cbiAgICBleHBlcmltZW50X3N0YXJ0OiAoZXhwZXJpbWVudCwgdmFyaWFudCkgLT5cbiAgICAgIEBfdHJhY2soZXhwZXJpbWVudCwgdmFyaWFudCwge25hbWU6ICdwYXJ0aWNpcGF0ZScsIHVuaXF1ZTogdHJ1ZX0pXG5cbiAgICBnb2FsX2NvbXBsZXRlOiAoZXhwZXJpbWVudCwgdmFyaWFudCwgZ29hbF9uYW1lLCBwcm9wcykgLT5cbiAgICAgIEBfdHJhY2soZXhwZXJpbWVudCwgdmFyaWFudCwgdXRpbHMuZGVmYXVsdHMoe25hbWU6IGdvYWxfbmFtZX0sIHByb3BzKSlcblxuXG4gIGNsYXNzIEBHb29nbGVVbml2ZXJzYWxBbmFseXRpY3NBZGFwdGVyXG4gICAgQG5hbWVzcGFjZTogJ2FsZXBoYmV0J1xuXG4gICAgQF90cmFjazogKGNhdGVnb3J5LCBhY3Rpb24sIGxhYmVsKSAtPlxuICAgICAgdXRpbHMubG9nKFwiR29vZ2xlIFVuaXZlcnNhbCBBbmFseXRpY3MgdHJhY2s6ICN7Y2F0ZWdvcnl9LCAje2FjdGlvbn0sICN7bGFiZWx9XCIpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2dhIG5vdCBkZWZpbmVkLiBQbGVhc2UgbWFrZSBzdXJlIHlvdXIgVW5pdmVyc2FsIGFuYWx5dGljcyBpcyBzZXQgdXAgY29ycmVjdGx5JykgaWYgdHlwZW9mIGdhIGlzbnQgJ2Z1bmN0aW9uJ1xuICAgICAgZ2EoJ3NlbmQnLCAnZXZlbnQnLCBjYXRlZ29yeSwgYWN0aW9uLCBsYWJlbCwgeydub25JbnRlcmFjdGlvbic6IDF9KVxuXG4gICAgQGV4cGVyaW1lbnRfc3RhcnQ6IChleHBlcmltZW50LCB2YXJpYW50KSAtPlxuICAgICAgQF90cmFjayhAbmFtZXNwYWNlLCBcIiN7ZXhwZXJpbWVudC5uYW1lfSB8ICN7dmFyaWFudH1cIiwgJ1Zpc2l0b3JzJylcblxuICAgIEBnb2FsX2NvbXBsZXRlOiAoZXhwZXJpbWVudCwgdmFyaWFudCwgZ29hbF9uYW1lLCBfcHJvcHMpIC0+XG4gICAgICBAX3RyYWNrKEBuYW1lc3BhY2UsIFwiI3tleHBlcmltZW50Lm5hbWV9IHwgI3t2YXJpYW50fVwiLCBnb2FsX25hbWUpXG5cblxuICBjbGFzcyBATG9jYWxTdG9yYWdlQWRhcHRlclxuICAgIEBuYW1lc3BhY2U6ICdhbGVwaGJldCdcbiAgICBAc2V0OiAoa2V5LCB2YWx1ZSkgLT5cbiAgICAgIG5ldyBTdG9yYWdlKEBuYW1lc3BhY2UpLnNldChrZXksIHZhbHVlKVxuICAgIEBnZXQ6IChrZXkpIC0+XG4gICAgICBuZXcgU3RvcmFnZShAbmFtZXNwYWNlKS5nZXQoa2V5KVxuXG5cbm1vZHVsZS5leHBvcnRzID0gQWRhcHRlcnNcbiIsInV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpXG5hZGFwdGVycyA9IHJlcXVpcmUoJy4vYWRhcHRlcnMnKVxub3B0aW9ucyA9IHJlcXVpcmUoJy4vb3B0aW9ucycpXG5cbmNsYXNzIEFsZXBoQmV0XG4gIEBvcHRpb25zID0gb3B0aW9uc1xuICBAdXRpbHMgPSB1dGlsc1xuXG4gIEBHaW1lbEFkYXB0ZXIgPSBhZGFwdGVycy5HaW1lbEFkYXB0ZXJcbiAgQExhbWVkQWRhcHRlciA9IGFkYXB0ZXJzLkxhbWVkQWRhcHRlclxuICBAUmFpbHNBZGFwdGVyID0gYWRhcHRlcnMuUmFpbHNBZGFwdGVyXG4gIEBQZXJzaXN0ZW50UXVldWVHb29nbGVBbmFseXRpY3NBZGFwdGVyID0gYWRhcHRlcnMuUGVyc2lzdGVudFF1ZXVlR29vZ2xlQW5hbHl0aWNzQWRhcHRlclxuICBAUGVyc2lzdGVudFF1ZXVlS2VlbkFkYXB0ZXIgPSBhZGFwdGVycy5QZXJzaXN0ZW50UXVldWVLZWVuQWRhcHRlclxuXG4gIGNsYXNzIEBFeHBlcmltZW50XG4gICAgQF9vcHRpb25zOlxuICAgICAgbmFtZTogbnVsbFxuICAgICAgdmFyaWFudHM6IG51bGxcbiAgICAgIHVzZXJfaWQ6IG51bGxcbiAgICAgIHNhbXBsZTogMS4wXG4gICAgICB0cmlnZ2VyOiAtPiB0cnVlXG4gICAgICB0cmFja2luZ19hZGFwdGVyOiBhZGFwdGVycy5Hb29nbGVVbml2ZXJzYWxBbmFseXRpY3NBZGFwdGVyXG4gICAgICBzdG9yYWdlX2FkYXB0ZXI6IGFkYXB0ZXJzLkxvY2FsU3RvcmFnZUFkYXB0ZXJcblxuICAgIGNvbnN0cnVjdG9yOiAoQG9wdGlvbnM9e30pIC0+XG4gICAgICB1dGlscy5kZWZhdWx0cyhAb3B0aW9ucywgRXhwZXJpbWVudC5fb3B0aW9ucylcbiAgICAgIF92YWxpZGF0ZS5jYWxsKHRoaXMpXG4gICAgICBAbmFtZSA9IEBvcHRpb25zLm5hbWVcbiAgICAgIEB2YXJpYW50cyA9IEBvcHRpb25zLnZhcmlhbnRzXG4gICAgICBAdXNlcl9pZCA9IEBvcHRpb25zLnVzZXJfaWRcbiAgICAgIEB2YXJpYW50X25hbWVzID0gdXRpbHMua2V5cyhAdmFyaWFudHMpXG4gICAgICBfcnVuLmNhbGwodGhpcylcblxuICAgIHJ1bjogLT5cbiAgICAgIHV0aWxzLmxvZyhcInJ1bm5pbmcgd2l0aCBvcHRpb25zOiAje0pTT04uc3RyaW5naWZ5KEBvcHRpb25zKX1cIilcbiAgICAgIGlmIHZhcmlhbnQgPSBAZ2V0X3N0b3JlZF92YXJpYW50KClcbiAgICAgICAgIyBhIHZhcmlhbnQgd2FzIGFscmVhZHkgY2hvc2VuLiBhY3RpdmF0ZSBpdFxuICAgICAgICB1dGlscy5sb2coXCIje3ZhcmlhbnR9IGFjdGl2ZVwiKVxuICAgICAgICBAYWN0aXZhdGVfdmFyaWFudCh2YXJpYW50KVxuICAgICAgZWxzZVxuICAgICAgICBAY29uZGl0aW9uYWxseV9hY3RpdmF0ZV92YXJpYW50KClcblxuICAgIF9ydW4gPSAtPiBAcnVuKClcblxuICAgIGFjdGl2YXRlX3ZhcmlhbnQ6ICh2YXJpYW50KSAtPlxuICAgICAgQHZhcmlhbnRzW3ZhcmlhbnRdPy5hY3RpdmF0ZSh0aGlzKVxuICAgICAgQHN0b3JhZ2UoKS5zZXQoXCIje0BvcHRpb25zLm5hbWV9OnZhcmlhbnRcIiwgdmFyaWFudClcblxuICAgICMgaWYgZXhwZXJpbWVudCBjb25kaXRpb25zIG1hdGNoLCBwaWNrIGFuZCBhY3RpdmF0ZSBhIHZhcmlhbnQsIHRyYWNrIGV4cGVyaW1lbnQgc3RhcnRcbiAgICBjb25kaXRpb25hbGx5X2FjdGl2YXRlX3ZhcmlhbnQ6IC0+XG4gICAgICByZXR1cm4gdW5sZXNzIEBvcHRpb25zLnRyaWdnZXIoKVxuICAgICAgdXRpbHMubG9nKCd0cmlnZ2VyIHNldCcpXG4gICAgICByZXR1cm4gdW5sZXNzIEBpbl9zYW1wbGUoKVxuICAgICAgdXRpbHMubG9nKCdpbiBzYW1wbGUnKVxuICAgICAgdmFyaWFudCA9IEBwaWNrX3ZhcmlhbnQoKVxuICAgICAgQHRyYWNraW5nKCkuZXhwZXJpbWVudF9zdGFydCh0aGlzLCB2YXJpYW50KVxuICAgICAgQGFjdGl2YXRlX3ZhcmlhbnQodmFyaWFudClcblxuICAgIGdvYWxfY29tcGxldGU6IChnb2FsX25hbWUsIHByb3BzPXt9KSAtPlxuICAgICAgdXRpbHMuZGVmYXVsdHMocHJvcHMsIHt1bmlxdWU6IHRydWV9KVxuICAgICAgcmV0dXJuIGlmIHByb3BzLnVuaXF1ZSAmJiBAc3RvcmFnZSgpLmdldChcIiN7QG9wdGlvbnMubmFtZX06I3tnb2FsX25hbWV9XCIpXG4gICAgICB2YXJpYW50ID0gQGdldF9zdG9yZWRfdmFyaWFudCgpXG4gICAgICByZXR1cm4gdW5sZXNzIHZhcmlhbnRcbiAgICAgIEBzdG9yYWdlKCkuc2V0KFwiI3tAb3B0aW9ucy5uYW1lfToje2dvYWxfbmFtZX1cIiwgdHJ1ZSkgaWYgcHJvcHMudW5pcXVlXG4gICAgICB1dGlscy5sb2coXCJleHBlcmltZW50OiAje0BvcHRpb25zLm5hbWV9IHZhcmlhbnQ6I3t2YXJpYW50fSBnb2FsOiN7Z29hbF9uYW1lfSBjb21wbGV0ZVwiKVxuICAgICAgQHRyYWNraW5nKCkuZ29hbF9jb21wbGV0ZSh0aGlzLCB2YXJpYW50LCBnb2FsX25hbWUsIHByb3BzKVxuXG4gICAgZ2V0X3N0b3JlZF92YXJpYW50OiAtPlxuICAgICAgQHN0b3JhZ2UoKS5nZXQoXCIje0BvcHRpb25zLm5hbWV9OnZhcmlhbnRcIilcblxuICAgIHBpY2tfdmFyaWFudDogLT5cbiAgICAgIGFsbF92YXJpYW50c19oYXZlX3dlaWdodHMgPSB1dGlscy5jaGVja193ZWlnaHRzKEB2YXJpYW50cylcbiAgICAgIHV0aWxzLmxvZyhcImFsbCB2YXJpYW50cyBoYXZlIHdlaWdodHM6ICN7YWxsX3ZhcmlhbnRzX2hhdmVfd2VpZ2h0c31cIilcbiAgICAgIGlmIGFsbF92YXJpYW50c19oYXZlX3dlaWdodHMgdGhlbiBAcGlja193ZWlnaHRlZF92YXJpYW50KCkgZWxzZSBAcGlja191bndlaWdodGVkX3ZhcmlhbnQoKVxuXG4gICAgcGlja193ZWlnaHRlZF92YXJpYW50OiAtPlxuXG4gICAgICAjIENob29zaW5nIGEgd2VpZ2h0ZWQgdmFyaWFudDpcbiAgICAgICMgRm9yIEEsIEIsIEMgd2l0aCB3ZWlnaHRzIDEsIDMsIDZcbiAgICAgICMgdmFyaWFudHMgPSBBLCBCLCBDXG4gICAgICAjIHdlaWdodHMgPSAxLCAzLCA2XG4gICAgICAjIHdlaWdodHNfc3VtID0gMTAgKHN1bSBvZiB3ZWlnaHRzKVxuICAgICAgIyB3ZWlnaHRlZF9pbmRleCA9IDIuMSAocmFuZG9tIG51bWJlciBiZXR3ZWVuIDAgYW5kIHdlaWdodCBzdW0pXG4gICAgICAjIEFCQkJDQ0NDQ0NcbiAgICAgICMgPT1eXG4gICAgICAjIFNlbGVjdCBCXG4gICAgICB3ZWlnaHRzX3N1bSA9IHV0aWxzLnN1bV93ZWlnaHRzKEB2YXJpYW50cylcbiAgICAgIHdlaWdodGVkX2luZGV4ID0gTWF0aC5jZWlsKChAX3JhbmRvbSgndmFyaWFudCcpICogd2VpZ2h0c19zdW0pKVxuICAgICAgZm9yIGtleSwgdmFsdWUgb2YgQHZhcmlhbnRzXG4gICAgICAgICMgdGhlbiB3ZSBhcmUgc3Vic3RyYWN0aW5nIHZhcmlhbnQgd2VpZ2h0IGZyb20gc2VsZWN0ZWQgbnVtYmVyXG4gICAgICAgICMgYW5kIGl0IGl0IHJlYWNoZXMgMCAob3IgYmVsb3cpIHdlIGFyZSBzZWxlY3RpbmcgdGhpcyB2YXJpYW50XG4gICAgICAgIHdlaWdodGVkX2luZGV4IC09IHZhbHVlLndlaWdodFxuICAgICAgICByZXR1cm4ga2V5IGlmIHdlaWdodGVkX2luZGV4IDw9IDBcblxuICAgIHBpY2tfdW53ZWlnaHRlZF92YXJpYW50OiAtPlxuICAgICAgcGFydGl0aW9ucyA9IDEuMCAvIEB2YXJpYW50X25hbWVzLmxlbmd0aFxuICAgICAgY2hvc2VuX3BhcnRpdGlvbiA9IE1hdGguZmxvb3IoQF9yYW5kb20oJ3ZhcmlhbnQnKSAvIHBhcnRpdGlvbnMpXG4gICAgICB2YXJpYW50ID0gQHZhcmlhbnRfbmFtZXNbY2hvc2VuX3BhcnRpdGlvbl1cbiAgICAgIHV0aWxzLmxvZyhcIiN7dmFyaWFudH0gcGlja2VkXCIpXG4gICAgICB2YXJpYW50XG5cbiAgICBpbl9zYW1wbGU6IC0+XG4gICAgICBhY3RpdmUgPSBAc3RvcmFnZSgpLmdldChcIiN7QG9wdGlvbnMubmFtZX06aW5fc2FtcGxlXCIpXG4gICAgICByZXR1cm4gYWN0aXZlIHVubGVzcyB0eXBlb2YgYWN0aXZlIGlzICd1bmRlZmluZWQnXG4gICAgICBhY3RpdmUgPSBAX3JhbmRvbSgnc2FtcGxlJykgPD0gQG9wdGlvbnMuc2FtcGxlXG4gICAgICBAc3RvcmFnZSgpLnNldChcIiN7QG9wdGlvbnMubmFtZX06aW5fc2FtcGxlXCIsIGFjdGl2ZSlcbiAgICAgIGFjdGl2ZVxuXG4gICAgX3JhbmRvbTogKHNhbHQpIC0+XG4gICAgICByZXR1cm4gdXRpbHMucmFuZG9tKCkgdW5sZXNzIEB1c2VyX2lkXG4gICAgICBzZWVkID0gXCIje0BuYW1lfS4je3NhbHR9LiN7QHVzZXJfaWR9XCJcbiAgICAgIHV0aWxzLnJhbmRvbShzZWVkKVxuXG4gICAgYWRkX2dvYWw6IChnb2FsKSAtPlxuICAgICAgZ29hbC5hZGRfZXhwZXJpbWVudCh0aGlzKVxuXG4gICAgYWRkX2dvYWxzOiAoZ29hbHMpIC0+XG4gICAgICBAYWRkX2dvYWwoZ29hbCkgZm9yIGdvYWwgaW4gZ29hbHNcblxuICAgIHN0b3JhZ2U6IC0+IEBvcHRpb25zLnN0b3JhZ2VfYWRhcHRlclxuXG4gICAgdHJhY2tpbmc6IC0+IEBvcHRpb25zLnRyYWNraW5nX2FkYXB0ZXJcblxuICAgIF92YWxpZGF0ZSA9IC0+XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2FuIGV4cGVyaW1lbnQgbmFtZSBtdXN0IGJlIHNwZWNpZmllZCcpIGlmIEBvcHRpb25zLm5hbWUgaXMgbnVsbFxuICAgICAgdGhyb3cgbmV3IEVycm9yKCd2YXJpYW50cyBtdXN0IGJlIHByb3ZpZGVkJykgaWYgQG9wdGlvbnMudmFyaWFudHMgaXMgbnVsbFxuICAgICAgdGhyb3cgbmV3IEVycm9yKCd0cmlnZ2VyIG11c3QgYmUgYSBmdW5jdGlvbicpIGlmIHR5cGVvZiBAb3B0aW9ucy50cmlnZ2VyIGlzbnQgJ2Z1bmN0aW9uJ1xuICAgICAgYWxsX3ZhcmlhbnRzX2hhdmVfd2VpZ2h0cyA9IHV0aWxzLnZhbGlkYXRlX3dlaWdodHMgQG9wdGlvbnMudmFyaWFudHNcbiAgICAgIHRocm93IG5ldyBFcnJvcignbm90IGFsbCB2YXJpYW50cyBoYXZlIHdlaWdodHMnKSBpZiAhYWxsX3ZhcmlhbnRzX2hhdmVfd2VpZ2h0c1xuXG4gIGNsYXNzIEBHb2FsXG4gICAgY29uc3RydWN0b3I6IChAbmFtZSwgQHByb3BzPXt9KSAtPlxuICAgICAgdXRpbHMuZGVmYXVsdHMoQHByb3BzLCB7dW5pcXVlOiB0cnVlfSlcbiAgICAgIEBleHBlcmltZW50cyA9IFtdXG5cbiAgICBhZGRfZXhwZXJpbWVudDogKGV4cGVyaW1lbnQpIC0+XG4gICAgICBAZXhwZXJpbWVudHMucHVzaChleHBlcmltZW50KVxuXG4gICAgYWRkX2V4cGVyaW1lbnRzOiAoZXhwZXJpbWVudHMpIC0+XG4gICAgICBAYWRkX2V4cGVyaW1lbnQoZXhwZXJpbWVudCkgZm9yIGV4cGVyaW1lbnQgaW4gZXhwZXJpbWVudHNcblxuICAgIGNvbXBsZXRlOiAtPlxuICAgICAgZm9yIGV4cGVyaW1lbnQgaW4gQGV4cGVyaW1lbnRzXG4gICAgICAgIGV4cGVyaW1lbnQuZ29hbF9jb21wbGV0ZShAbmFtZSwgQHByb3BzKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gQWxlcGhCZXRcbiIsIm1vZHVsZS5leHBvcnRzID1cbiAgZGVidWc6IGZhbHNlXG4iLCJCYXNpbCA9IHJlcXVpcmUoJ2Jhc2lsLmpzJylcbnN0b3JlID0gbmV3IEJhc2lsKG5hbWVzcGFjZTogbnVsbClcblxuIyBhIHRoaW4gd3JhcHBlciBhcm91bmQgYmFzaWwuanMgZm9yIGVhc3kgc3dhcHBpbmdcbmNsYXNzIFN0b3JhZ2VcbiAgY29uc3RydWN0b3I6IChAbmFtZXNwYWNlPSdhbGVwaGJldCcpIC0+XG4gICAgQHN0b3JhZ2UgPSBzdG9yZS5nZXQoQG5hbWVzcGFjZSkgfHwge31cbiAgc2V0OiAoa2V5LCB2YWx1ZSkgLT5cbiAgICBAc3RvcmFnZVtrZXldID0gdmFsdWVcbiAgICBzdG9yZS5zZXQoQG5hbWVzcGFjZSwgQHN0b3JhZ2UpXG4gICAgcmV0dXJuIHZhbHVlXG4gIGdldDogKGtleSkgLT5cbiAgICBAc3RvcmFnZVtrZXldXG4gICAgIyBzdG9yZS5nZXQoXCIje0BuYW1lc3BhY2V9OiN7a2V5fVwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFN0b3JhZ2VcbiIsIiMgTk9URTogdXNpbmcgYSBjdXN0b20gYnVpbGQgb2YgbG9kYXNoLCB0byBzYXZlIHNwYWNlXG5fID0gcmVxdWlyZSgnLi4vdmVuZG9yL2xvZGFzaC5jdXN0b20ubWluJylcbnV1aWQgPSByZXF1aXJlKCd1dWlkJylcbnNoYTEgPSByZXF1aXJlKCdjcnlwdG8tanMvc2hhMScpXG5vcHRpb25zID0gcmVxdWlyZSgnLi9vcHRpb25zJylcblxuY2xhc3MgVXRpbHNcbiAgQGRlZmF1bHRzOiBfLmRlZmF1bHRzXG4gIEBrZXlzOiBfLmtleXNcbiAgQHJlbW92ZTogXy5yZW1vdmVcbiAgQG9taXQ6IF8ub21pdFxuICBAbG9nOiAobWVzc2FnZSkgLT5cbiAgICBjb25zb2xlLmxvZyhtZXNzYWdlKSBpZiBvcHRpb25zLmRlYnVnXG4gIEB1dWlkOiB1dWlkLnY0XG4gIEBzaGExOiAodGV4dCkgLT5cbiAgICBzaGExKHRleHQpLnRvU3RyaW5nKClcbiAgQHJhbmRvbTogKHNlZWQpIC0+XG4gICAgcmV0dXJuIE1hdGgucmFuZG9tKCkgdW5sZXNzIHNlZWRcbiAgICAjIGEgTVVDSCBzaW1wbGlmaWVkIHZlcnNpb24gaW5zcGlyZWQgYnkgUGxhbk91dC5qc1xuICAgIHBhcnNlSW50KEBzaGExKHNlZWQpLnN1YnN0cigwLCAxMyksIDE2KSAvIDB4RkZGRkZGRkZGRkZGRlxuICBAY2hlY2tfd2VpZ2h0czogKHZhcmlhbnRzKSAtPlxuICAgIGNvbnRhaW5zX3dlaWdodCA9IFtdXG4gICAgY29udGFpbnNfd2VpZ2h0LnB1c2godmFsdWUud2VpZ2h0PykgZm9yIGtleSwgdmFsdWUgb2YgdmFyaWFudHNcbiAgICBjb250YWluc193ZWlnaHQuZXZlcnkgKGhhc193ZWlnaHQpIC0+IGhhc193ZWlnaHRcbiAgQHN1bV93ZWlnaHRzOiAodmFyaWFudHMpIC0+XG4gICAgc3VtID0gMFxuICAgIGZvciBrZXksIHZhbHVlIG9mIHZhcmlhbnRzXG4gICAgICBzdW0gKz0gdmFsdWUud2VpZ2h0IHx8IDBcbiAgICBzdW1cbiAgQHZhbGlkYXRlX3dlaWdodHM6ICh2YXJpYW50cykgLT5cbiAgICBjb250YWluc193ZWlnaHQgPSBbXVxuICAgIGNvbnRhaW5zX3dlaWdodC5wdXNoKHZhbHVlLndlaWdodD8pIGZvciBrZXksIHZhbHVlIG9mIHZhcmlhbnRzXG4gICAgY29udGFpbnNfd2VpZ2h0LmV2ZXJ5IChoYXNfd2VpZ2h0KSAtPiBoYXNfd2VpZ2h0IG9yIGNvbnRhaW5zX3dlaWdodC5ldmVyeSAoaGFzX3dlaWdodCkgLT4gIWhhc193ZWlnaHRcbm1vZHVsZS5leHBvcnRzID0gVXRpbHNcbiIsIi8qKlxuICogQGxpY2Vuc2VcbiAqIExvZGFzaCAoQ3VzdG9tIEJ1aWxkKSBsb2Rhc2guY29tL2xpY2Vuc2UgfCBVbmRlcnNjb3JlLmpzIDEuOC4zIHVuZGVyc2NvcmVqcy5vcmcvTElDRU5TRVxuICogQnVpbGQ6IGBsb2Rhc2ggLXAgaW5jbHVkZT1cImtleXMsZGVmYXVsdHMscmVtb3ZlLG9taXRcIiBleHBvcnRzPVwibm9kZVwiIC1vIC4vdmVuZG9yL2xvZGFzaC5jdXN0b20ubWluLmpzYFxuICovXG47KGZ1bmN0aW9uKCl7ZnVuY3Rpb24gdCh0LGUscil7c3dpdGNoKHIubGVuZ3RoKXtjYXNlIDA6cmV0dXJuIHQuY2FsbChlKTtjYXNlIDE6cmV0dXJuIHQuY2FsbChlLHJbMF0pO2Nhc2UgMjpyZXR1cm4gdC5jYWxsKGUsclswXSxyWzFdKTtjYXNlIDM6cmV0dXJuIHQuY2FsbChlLHJbMF0sclsxXSxyWzJdKX1yZXR1cm4gdC5hcHBseShlLHIpfWZ1bmN0aW9uIGUodCxlKXtmb3IodmFyIHI9LTEsbj1udWxsPT10PzA6dC5sZW5ndGg7KytyPG4mJmZhbHNlIT09ZSh0W3JdLHIsdCk7KTt9ZnVuY3Rpb24gcih0LGUpe2Zvcih2YXIgcj0tMSxuPW51bGw9PXQ/MDp0Lmxlbmd0aCxvPTAsYz1bXTsrK3I8bjspe3ZhciB1PXRbcl07ZSh1LHIsdCkmJihjW28rK109dSl9cmV0dXJuIGN9ZnVuY3Rpb24gbih0LGUpe2Zvcih2YXIgcj0tMSxuPW51bGw9PXQ/MDp0Lmxlbmd0aCxvPUFycmF5KG4pOysrcjxuOylvW3JdPWUodFtyXSxyLHQpO3JldHVybiBvfWZ1bmN0aW9uIG8odCxlKXtmb3IodmFyIHI9LTEsbj1lLmxlbmd0aCxvPXQubGVuZ3RoOysrcjxuOyl0W28rcl09ZVtyXTtcbnJldHVybiB0fWZ1bmN0aW9uIGModCxlKXtmb3IodmFyIHI9LTEsbj1udWxsPT10PzA6dC5sZW5ndGg7KytyPG47KWlmKGUodFtyXSxyLHQpKXJldHVybiB0cnVlO3JldHVybiBmYWxzZX1mdW5jdGlvbiB1KHQpe3JldHVybiBmdW5jdGlvbihlKXtyZXR1cm4gbnVsbD09ZT9CdDplW3RdfX1mdW5jdGlvbiBhKHQpe3JldHVybiBmdW5jdGlvbihlKXtyZXR1cm4gdChlKX19ZnVuY3Rpb24gaSh0KXt2YXIgZT0tMSxyPUFycmF5KHQuc2l6ZSk7cmV0dXJuIHQuZm9yRWFjaChmdW5jdGlvbih0LG4pe3JbKytlXT1bbix0XX0pLHJ9ZnVuY3Rpb24gZih0KXt2YXIgZT1PYmplY3Q7cmV0dXJuIGZ1bmN0aW9uKHIpe3JldHVybiB0KGUocikpfX1mdW5jdGlvbiBsKHQpe3ZhciBlPS0xLHI9QXJyYXkodC5zaXplKTtyZXR1cm4gdC5mb3JFYWNoKGZ1bmN0aW9uKHQpe3JbKytlXT10fSkscn1mdW5jdGlvbiBzKCl7fWZ1bmN0aW9uIGIodCl7dmFyIGU9LTEscj1udWxsPT10PzA6dC5sZW5ndGg7Zm9yKHRoaXMuY2xlYXIoKTsrK2U8cjspe1xudmFyIG49dFtlXTt0aGlzLnNldChuWzBdLG5bMV0pfX1mdW5jdGlvbiBoKHQpe3ZhciBlPS0xLHI9bnVsbD09dD8wOnQubGVuZ3RoO2Zvcih0aGlzLmNsZWFyKCk7KytlPHI7KXt2YXIgbj10W2VdO3RoaXMuc2V0KG5bMF0sblsxXSl9fWZ1bmN0aW9uIHAodCl7dmFyIGU9LTEscj1udWxsPT10PzA6dC5sZW5ndGg7Zm9yKHRoaXMuY2xlYXIoKTsrK2U8cjspe3ZhciBuPXRbZV07dGhpcy5zZXQoblswXSxuWzFdKX19ZnVuY3Rpb24geSh0KXt2YXIgZT0tMSxyPW51bGw9PXQ/MDp0Lmxlbmd0aDtmb3IodGhpcy5fX2RhdGFfXz1uZXcgcDsrK2U8cjspdGhpcy5hZGQodFtlXSl9ZnVuY3Rpb24gaih0KXt0aGlzLnNpemU9KHRoaXMuX19kYXRhX189bmV3IGgodCkpLnNpemV9ZnVuY3Rpb24gXyh0LGUpe3ZhciByPUtlKHQpLG49IXImJkplKHQpLG89IXImJiFuJiZRZSh0KSxjPSFyJiYhbiYmIW8mJlplKHQpO2lmKHI9cnx8bnx8b3x8Yyl7Zm9yKHZhciBuPXQubGVuZ3RoLHU9U3RyaW5nLGE9LTEsaT1BcnJheShuKTsrK2E8bjspaVthXT11KGEpO1xubj1pfWVsc2Ugbj1bXTt2YXIgZix1PW4ubGVuZ3RoO2ZvcihmIGluIHQpIWUmJiF1ZS5jYWxsKHQsZil8fHImJihcImxlbmd0aFwiPT1mfHxvJiYoXCJvZmZzZXRcIj09Znx8XCJwYXJlbnRcIj09Zil8fGMmJihcImJ1ZmZlclwiPT1mfHxcImJ5dGVMZW5ndGhcIj09Znx8XCJieXRlT2Zmc2V0XCI9PWYpfHxjdChmLHUpKXx8bi5wdXNoKGYpO3JldHVybiBufWZ1bmN0aW9uIGcodCxlLHIpe3ZhciBuPXRbZV07dWUuY2FsbCh0LGUpJiZ5dChuLHIpJiYociE9PUJ0fHxlIGluIHQpfHx3KHQsZSxyKX1mdW5jdGlvbiB2KHQsZSl7Zm9yKHZhciByPXQubGVuZ3RoO3ItLTspaWYoeXQodFtyXVswXSxlKSlyZXR1cm4gcjtyZXR1cm4tMX1mdW5jdGlvbiBkKHQsZSl7cmV0dXJuIHQmJlcoZSx6dChlKSx0KX1mdW5jdGlvbiBBKHQsZSl7cmV0dXJuIHQmJlcoZSxrdChlKSx0KX1mdW5jdGlvbiB3KHQsZSxyKXtcIl9fcHJvdG9fX1wiPT1lJiZBZT9BZSh0LGUse2NvbmZpZ3VyYWJsZTp0cnVlLGVudW1lcmFibGU6dHJ1ZSx2YWx1ZTpyLFxud3JpdGFibGU6dHJ1ZX0pOnRbZV09cn1mdW5jdGlvbiBtKHQscixuLG8sYyx1KXt2YXIgYSxpPTEmcixmPTImcixsPTQmcjtpZihuJiYoYT1jP24odCxvLGMsdSk6bih0KSksYSE9PUJ0KXJldHVybiBhO2lmKCF2dCh0KSlyZXR1cm4gdDtpZihvPUtlKHQpKXtpZihhPXJ0KHQpLCFpKXJldHVybiBOKHQsYSl9ZWxzZXt2YXIgcz1HZSh0KSxiPVwiW29iamVjdCBGdW5jdGlvbl1cIj09c3x8XCJbb2JqZWN0IEdlbmVyYXRvckZ1bmN0aW9uXVwiPT1zO2lmKFFlKHQpKXJldHVybiBSKHQsaSk7aWYoXCJbb2JqZWN0IE9iamVjdF1cIj09c3x8XCJbb2JqZWN0IEFyZ3VtZW50c11cIj09c3x8YiYmIWMpe2lmKGE9Znx8Yj97fTp0eXBlb2YgdC5jb25zdHJ1Y3RvciE9XCJmdW5jdGlvblwifHxhdCh0KT97fTpSZSh5ZSh0KSksIWkpcmV0dXJuIGY/cSh0LEEoYSx0KSk6Ryh0LGQoYSx0KSl9ZWxzZXtpZighV3Rbc10pcmV0dXJuIGM/dDp7fTthPW50KHQscyxpKX19aWYodXx8KHU9bmV3IGopLGM9dS5nZXQodCkpcmV0dXJuIGM7XG5pZih1LnNldCh0LGEpLFllKHQpKXJldHVybiB0LmZvckVhY2goZnVuY3Rpb24oZSl7YS5hZGQobShlLHIsbixlLHQsdSkpfSksYTtpZihYZSh0KSlyZXR1cm4gdC5mb3JFYWNoKGZ1bmN0aW9uKGUsbyl7YS5zZXQobyxtKGUscixuLG8sdCx1KSl9KSxhO3ZhciBmPWw/Zj9YOlE6Zj9rdDp6dCxoPW8/QnQ6Zih0KTtyZXR1cm4gZShofHx0LGZ1bmN0aW9uKGUsbyl7aCYmKG89ZSxlPXRbb10pLGcoYSxvLG0oZSxyLG4sbyx0LHUpKX0pLGF9ZnVuY3Rpb24gTyh0LGUscixuLGMpe3ZhciB1PS0xLGE9dC5sZW5ndGg7Zm9yKHJ8fChyPW90KSxjfHwoYz1bXSk7Kyt1PGE7KXt2YXIgaT10W3VdOzA8ZSYmcihpKT8xPGU/TyhpLGUtMSxyLG4sYyk6byhjLGkpOm58fChjW2MubGVuZ3RoXT1pKX1yZXR1cm4gY31mdW5jdGlvbiBTKHQsZSl7ZT1WKGUsdCk7Zm9yKHZhciByPTAsbj1lLmxlbmd0aDtudWxsIT10JiZyPG47KXQ9dFtsdChlW3IrK10pXTtyZXR1cm4gciYmcj09bj90OkJ0fWZ1bmN0aW9uIHoodCxlLHIpe1xucmV0dXJuIGU9ZSh0KSxLZSh0KT9lOm8oZSxyKHQpKX1mdW5jdGlvbiBrKHQpe2lmKG51bGw9PXQpdD10PT09QnQ/XCJbb2JqZWN0IFVuZGVmaW5lZF1cIjpcIltvYmplY3QgTnVsbF1cIjtlbHNlIGlmKGRlJiZkZSBpbiBPYmplY3QodCkpe3ZhciBlPXVlLmNhbGwodCxkZSkscj10W2RlXTt0cnl7dFtkZV09QnQ7dmFyIG49dHJ1ZX1jYXRjaCh0KXt9dmFyIG89aWUuY2FsbCh0KTtuJiYoZT90W2RlXT1yOmRlbGV0ZSB0W2RlXSksdD1vfWVsc2UgdD1pZS5jYWxsKHQpO3JldHVybiB0fWZ1bmN0aW9uIHgodCl7cmV0dXJuIGR0KHQpJiZcIltvYmplY3QgQXJndW1lbnRzXVwiPT1rKHQpfWZ1bmN0aW9uIEUodCxlLHIsbixvKXtpZih0PT09ZSllPXRydWU7ZWxzZSBpZihudWxsPT10fHxudWxsPT1lfHwhZHQodCkmJiFkdChlKSllPXQhPT10JiZlIT09ZTtlbHNlIHQ6e3ZhciBjPUtlKHQpLHU9S2UoZSksYT1jP1wiW29iamVjdCBBcnJheV1cIjpHZSh0KSxpPXU/XCJbb2JqZWN0IEFycmF5XVwiOkdlKGUpLGE9XCJbb2JqZWN0IEFyZ3VtZW50c11cIj09YT9cIltvYmplY3QgT2JqZWN0XVwiOmEsaT1cIltvYmplY3QgQXJndW1lbnRzXVwiPT1pP1wiW29iamVjdCBPYmplY3RdXCI6aSxmPVwiW29iamVjdCBPYmplY3RdXCI9PWEsdT1cIltvYmplY3QgT2JqZWN0XVwiPT1pO1xuaWYoKGk9YT09aSkmJlFlKHQpKXtpZighUWUoZSkpe2U9ZmFsc2U7YnJlYWsgdH1jPXRydWUsZj1mYWxzZX1pZihpJiYhZilvfHwobz1uZXcgaiksZT1jfHxaZSh0KT9KKHQsZSxyLG4sRSxvKTpLKHQsZSxhLHIsbixFLG8pO2Vsc2V7aWYoISgxJnIpJiYoYz1mJiZ1ZS5jYWxsKHQsXCJfX3dyYXBwZWRfX1wiKSxhPXUmJnVlLmNhbGwoZSxcIl9fd3JhcHBlZF9fXCIpLGN8fGEpKXt0PWM/dC52YWx1ZSgpOnQsZT1hP2UudmFsdWUoKTplLG98fChvPW5ldyBqKSxlPUUodCxlLHIsbixvKTticmVhayB0fWlmKGkpZTppZihvfHwobz1uZXcgaiksYz0xJnIsYT1RKHQpLHU9YS5sZW5ndGgsaT1RKGUpLmxlbmd0aCx1PT1pfHxjKXtmb3IoZj11O2YtLTspe3ZhciBsPWFbZl07aWYoIShjP2wgaW4gZTp1ZS5jYWxsKGUsbCkpKXtlPWZhbHNlO2JyZWFrIGV9fWlmKChpPW8uZ2V0KHQpKSYmby5nZXQoZSkpZT1pPT1lO2Vsc2V7aT10cnVlLG8uc2V0KHQsZSksby5zZXQoZSx0KTtmb3IodmFyIHM9YzsrK2Y8dTspe3ZhciBsPWFbZl0sYj10W2xdLGg9ZVtsXTtcbmlmKG4pdmFyIHA9Yz9uKGgsYixsLGUsdCxvKTpuKGIsaCxsLHQsZSxvKTtpZihwPT09QnQ/YiE9PWgmJiFFKGIsaCxyLG4sbyk6IXApe2k9ZmFsc2U7YnJlYWt9c3x8KHM9XCJjb25zdHJ1Y3RvclwiPT1sKX1pJiYhcyYmKHI9dC5jb25zdHJ1Y3RvcixuPWUuY29uc3RydWN0b3IsciE9biYmXCJjb25zdHJ1Y3RvclwiaW4gdCYmXCJjb25zdHJ1Y3RvclwiaW4gZSYmISh0eXBlb2Ygcj09XCJmdW5jdGlvblwiJiZyIGluc3RhbmNlb2YgciYmdHlwZW9mIG49PVwiZnVuY3Rpb25cIiYmbiBpbnN0YW5jZW9mIG4pJiYoaT1mYWxzZSkpLG8uZGVsZXRlKHQpLG8uZGVsZXRlKGUpLGU9aX19ZWxzZSBlPWZhbHNlO2Vsc2UgZT1mYWxzZX19cmV0dXJuIGV9ZnVuY3Rpb24gRih0KXtyZXR1cm4gZHQodCkmJlwiW29iamVjdCBNYXBdXCI9PUdlKHQpfWZ1bmN0aW9uIEkodCxlKXt2YXIgcj1lLmxlbmd0aCxuPXI7aWYobnVsbD09dClyZXR1cm4hbjtmb3IodD1PYmplY3QodCk7ci0tOyl7dmFyIG89ZVtyXTtpZihvWzJdP29bMV0hPT10W29bMF1dOiEob1swXWluIHQpKXJldHVybiBmYWxzZTtcbn1mb3IoOysrcjxuOyl7dmFyIG89ZVtyXSxjPW9bMF0sdT10W2NdLGE9b1sxXTtpZihvWzJdKXtpZih1PT09QnQmJiEoYyBpbiB0KSlyZXR1cm4gZmFsc2V9ZWxzZSBpZihvPW5ldyBqLHZvaWQgMD09PUJ0PyFFKGEsdSwzLHZvaWQgMCxvKToxKXJldHVybiBmYWxzZX1yZXR1cm4gdHJ1ZX1mdW5jdGlvbiBNKHQpe3JldHVybiBkdCh0KSYmXCJbb2JqZWN0IFNldF1cIj09R2UodCl9ZnVuY3Rpb24gVSh0KXtyZXR1cm4gZHQodCkmJmd0KHQubGVuZ3RoKSYmISFOdFtrKHQpXX1mdW5jdGlvbiBCKHQpe3JldHVybiB0eXBlb2YgdD09XCJmdW5jdGlvblwiP3Q6bnVsbD09dD9FdDp0eXBlb2YgdD09XCJvYmplY3RcIj9LZSh0KT9QKHRbMF0sdFsxXSk6RCh0KTpJdCh0KX1mdW5jdGlvbiBEKHQpe3ZhciBlPXR0KHQpO3JldHVybiAxPT1lLmxlbmd0aCYmZVswXVsyXT9pdChlWzBdWzBdLGVbMF1bMV0pOmZ1bmN0aW9uKHIpe3JldHVybiByPT09dHx8SShyLGUpfX1mdW5jdGlvbiBQKHQsZSl7cmV0dXJuIHV0KHQpJiZlPT09ZSYmIXZ0KGUpP2l0KGx0KHQpLGUpOmZ1bmN0aW9uKHIpe1xudmFyIG49T3Qocix0KTtyZXR1cm4gbj09PUJ0JiZuPT09ZT9TdChyLHQpOkUoZSxuLDMpfX1mdW5jdGlvbiAkKHQpe3JldHVybiBmdW5jdGlvbihlKXtyZXR1cm4gUyhlLHQpfX1mdW5jdGlvbiBMKHQpe2lmKHR5cGVvZiB0PT1cInN0cmluZ1wiKXJldHVybiB0O2lmKEtlKHQpKXJldHVybiBuKHQsTCkrXCJcIjtpZih3dCh0KSlyZXR1cm4gVmU/VmUuY2FsbCh0KTpcIlwiO3ZhciBlPXQrXCJcIjtyZXR1cm5cIjBcIj09ZSYmMS90PT0tRHQ/XCItMFwiOmV9ZnVuY3Rpb24gQyh0LGUpe2U9VihlLHQpO3ZhciByO2lmKDI+ZS5sZW5ndGgpcj10O2Vsc2V7cj1lO3ZhciBuPTAsbz0tMSxjPS0xLHU9ci5sZW5ndGg7Zm9yKDA+biYmKG49LW4+dT8wOnUrbiksbz1vPnU/dTpvLDA+byYmKG8rPXUpLHU9bj5vPzA6by1uPj4+MCxuPj4+PTAsbz1BcnJheSh1KTsrK2M8dTspb1tjXT1yW2Mrbl07cj1TKHQsbyl9dD1yLG51bGw9PXR8fGRlbGV0ZSB0W2x0KGh0KGUpKV19ZnVuY3Rpb24gVih0LGUpe3JldHVybiBLZSh0KT90OnV0KHQsZSk/W3RdOkhlKG10KHQpKTtcbn1mdW5jdGlvbiBSKHQsZSl7aWYoZSlyZXR1cm4gdC5zbGljZSgpO3ZhciByPXQubGVuZ3RoLHI9cGU/cGUocik6bmV3IHQuY29uc3RydWN0b3Iocik7cmV0dXJuIHQuY29weShyKSxyfWZ1bmN0aW9uIFQodCl7dmFyIGU9bmV3IHQuY29uc3RydWN0b3IodC5ieXRlTGVuZ3RoKTtyZXR1cm4gbmV3IGhlKGUpLnNldChuZXcgaGUodCkpLGV9ZnVuY3Rpb24gTih0LGUpe3ZhciByPS0xLG49dC5sZW5ndGg7Zm9yKGV8fChlPUFycmF5KG4pKTsrK3I8bjspZVtyXT10W3JdO3JldHVybiBlfWZ1bmN0aW9uIFcodCxlLHIpe3ZhciBuPSFyO3J8fChyPXt9KTtmb3IodmFyIG89LTEsYz1lLmxlbmd0aDsrK288Yzspe3ZhciB1PWVbb10sYT1CdDthPT09QnQmJihhPXRbdV0pLG4/dyhyLHUsYSk6ZyhyLHUsYSl9cmV0dXJuIHJ9ZnVuY3Rpb24gRyh0LGUpe3JldHVybiBXKHQsTmUodCksZSl9ZnVuY3Rpb24gcSh0LGUpe3JldHVybiBXKHQsV2UodCksZSl9ZnVuY3Rpb24gSCh0KXtyZXR1cm4gQXQodCk/QnQ6dDtcbn1mdW5jdGlvbiBKKHQsZSxyLG4sbyx1KXt2YXIgYT0xJnIsaT10Lmxlbmd0aCxmPWUubGVuZ3RoO2lmKGkhPWYmJiEoYSYmZj5pKSlyZXR1cm4gZmFsc2U7aWYoKGY9dS5nZXQodCkpJiZ1LmdldChlKSlyZXR1cm4gZj09ZTt2YXIgZj0tMSxsPXRydWUscz0yJnI/bmV3IHk6QnQ7Zm9yKHUuc2V0KHQsZSksdS5zZXQoZSx0KTsrK2Y8aTspe3ZhciBiPXRbZl0saD1lW2ZdO2lmKG4pdmFyIHA9YT9uKGgsYixmLGUsdCx1KTpuKGIsaCxmLHQsZSx1KTtpZihwIT09QnQpe2lmKHApY29udGludWU7bD1mYWxzZTticmVha31pZihzKXtpZighYyhlLGZ1bmN0aW9uKHQsZSl7aWYoIXMuaGFzKGUpJiYoYj09PXR8fG8oYix0LHIsbix1KSkpcmV0dXJuIHMucHVzaChlKX0pKXtsPWZhbHNlO2JyZWFrfX1lbHNlIGlmKGIhPT1oJiYhbyhiLGgscixuLHUpKXtsPWZhbHNlO2JyZWFrfX1yZXR1cm4gdS5kZWxldGUodCksdS5kZWxldGUoZSksbH1mdW5jdGlvbiBLKHQsZSxyLG4sbyxjLHUpe3N3aXRjaChyKXtjYXNlXCJbb2JqZWN0IERhdGFWaWV3XVwiOlxuaWYodC5ieXRlTGVuZ3RoIT1lLmJ5dGVMZW5ndGh8fHQuYnl0ZU9mZnNldCE9ZS5ieXRlT2Zmc2V0KWJyZWFrO3Q9dC5idWZmZXIsZT1lLmJ1ZmZlcjtjYXNlXCJbb2JqZWN0IEFycmF5QnVmZmVyXVwiOmlmKHQuYnl0ZUxlbmd0aCE9ZS5ieXRlTGVuZ3RofHwhYyhuZXcgaGUodCksbmV3IGhlKGUpKSlicmVhaztyZXR1cm4gdHJ1ZTtjYXNlXCJbb2JqZWN0IEJvb2xlYW5dXCI6Y2FzZVwiW29iamVjdCBEYXRlXVwiOmNhc2VcIltvYmplY3QgTnVtYmVyXVwiOnJldHVybiB5dCgrdCwrZSk7Y2FzZVwiW29iamVjdCBFcnJvcl1cIjpyZXR1cm4gdC5uYW1lPT1lLm5hbWUmJnQubWVzc2FnZT09ZS5tZXNzYWdlO2Nhc2VcIltvYmplY3QgUmVnRXhwXVwiOmNhc2VcIltvYmplY3QgU3RyaW5nXVwiOnJldHVybiB0PT1lK1wiXCI7Y2FzZVwiW29iamVjdCBNYXBdXCI6dmFyIGE9aTtjYXNlXCJbb2JqZWN0IFNldF1cIjppZihhfHwoYT1sKSx0LnNpemUhPWUuc2l6ZSYmISgxJm4pKWJyZWFrO3JldHVybihyPXUuZ2V0KHQpKT9yPT1lOihufD0yLFxudS5zZXQodCxlKSxlPUooYSh0KSxhKGUpLG4sbyxjLHUpLHUuZGVsZXRlKHQpLGUpO2Nhc2VcIltvYmplY3QgU3ltYm9sXVwiOmlmKENlKXJldHVybiBDZS5jYWxsKHQpPT1DZS5jYWxsKGUpfXJldHVybiBmYWxzZX1mdW5jdGlvbiBRKHQpe3JldHVybiB6KHQsenQsTmUpfWZ1bmN0aW9uIFgodCl7cmV0dXJuIHoodCxrdCxXZSl9ZnVuY3Rpb24gWSgpe3ZhciB0PXMuaXRlcmF0ZWV8fEZ0LHQ9dD09PUZ0P0I6dDtyZXR1cm4gYXJndW1lbnRzLmxlbmd0aD90KGFyZ3VtZW50c1swXSxhcmd1bWVudHNbMV0pOnR9ZnVuY3Rpb24gWih0LGUpe3ZhciByPXQuX19kYXRhX18sbj10eXBlb2YgZTtyZXR1cm4oXCJzdHJpbmdcIj09bnx8XCJudW1iZXJcIj09bnx8XCJzeW1ib2xcIj09bnx8XCJib29sZWFuXCI9PW4/XCJfX3Byb3RvX19cIiE9PWU6bnVsbD09PWUpP3JbdHlwZW9mIGU9PVwic3RyaW5nXCI/XCJzdHJpbmdcIjpcImhhc2hcIl06ci5tYXB9ZnVuY3Rpb24gdHQodCl7Zm9yKHZhciBlPXp0KHQpLHI9ZS5sZW5ndGg7ci0tOyl7XG52YXIgbj1lW3JdLG89dFtuXTtlW3JdPVtuLG8sbz09PW8mJiF2dChvKV19cmV0dXJuIGV9ZnVuY3Rpb24gZXQodCxlKXt2YXIgcj1udWxsPT10P0J0OnRbZV07cmV0dXJuKCF2dChyKXx8YWUmJmFlIGluIHI/MDooX3Qocik/bGU6UnQpLnRlc3Qoc3QocikpKT9yOkJ0fWZ1bmN0aW9uIHJ0KHQpe3ZhciBlPXQubGVuZ3RoLHI9bmV3IHQuY29uc3RydWN0b3IoZSk7cmV0dXJuIGUmJlwic3RyaW5nXCI9PXR5cGVvZiB0WzBdJiZ1ZS5jYWxsKHQsXCJpbmRleFwiKSYmKHIuaW5kZXg9dC5pbmRleCxyLmlucHV0PXQuaW5wdXQpLHJ9ZnVuY3Rpb24gbnQodCxlLHIpe3ZhciBuPXQuY29uc3RydWN0b3I7c3dpdGNoKGUpe2Nhc2VcIltvYmplY3QgQXJyYXlCdWZmZXJdXCI6cmV0dXJuIFQodCk7Y2FzZVwiW29iamVjdCBCb29sZWFuXVwiOmNhc2VcIltvYmplY3QgRGF0ZV1cIjpyZXR1cm4gbmV3IG4oK3QpO2Nhc2VcIltvYmplY3QgRGF0YVZpZXddXCI6cmV0dXJuIGU9cj9UKHQuYnVmZmVyKTp0LmJ1ZmZlcixuZXcgdC5jb25zdHJ1Y3RvcihlLHQuYnl0ZU9mZnNldCx0LmJ5dGVMZW5ndGgpO1xuY2FzZVwiW29iamVjdCBGbG9hdDMyQXJyYXldXCI6Y2FzZVwiW29iamVjdCBGbG9hdDY0QXJyYXldXCI6Y2FzZVwiW29iamVjdCBJbnQ4QXJyYXldXCI6Y2FzZVwiW29iamVjdCBJbnQxNkFycmF5XVwiOmNhc2VcIltvYmplY3QgSW50MzJBcnJheV1cIjpjYXNlXCJbb2JqZWN0IFVpbnQ4QXJyYXldXCI6Y2FzZVwiW29iamVjdCBVaW50OENsYW1wZWRBcnJheV1cIjpjYXNlXCJbb2JqZWN0IFVpbnQxNkFycmF5XVwiOmNhc2VcIltvYmplY3QgVWludDMyQXJyYXldXCI6cmV0dXJuIGU9cj9UKHQuYnVmZmVyKTp0LmJ1ZmZlcixuZXcgdC5jb25zdHJ1Y3RvcihlLHQuYnl0ZU9mZnNldCx0Lmxlbmd0aCk7Y2FzZVwiW29iamVjdCBNYXBdXCI6cmV0dXJuIG5ldyBuO2Nhc2VcIltvYmplY3QgTnVtYmVyXVwiOmNhc2VcIltvYmplY3QgU3RyaW5nXVwiOnJldHVybiBuZXcgbih0KTtjYXNlXCJbb2JqZWN0IFJlZ0V4cF1cIjpyZXR1cm4gZT1uZXcgdC5jb25zdHJ1Y3Rvcih0LnNvdXJjZSxWdC5leGVjKHQpKSxlLmxhc3RJbmRleD10Lmxhc3RJbmRleCxcbmU7Y2FzZVwiW29iamVjdCBTZXRdXCI6cmV0dXJuIG5ldyBuO2Nhc2VcIltvYmplY3QgU3ltYm9sXVwiOnJldHVybiBDZT9PYmplY3QoQ2UuY2FsbCh0KSk6e319fWZ1bmN0aW9uIG90KHQpe3JldHVybiBLZSh0KXx8SmUodCl8fCEhKHZlJiZ0JiZ0W3ZlXSl9ZnVuY3Rpb24gY3QodCxlKXt2YXIgcj10eXBlb2YgdDtyZXR1cm4gZT1udWxsPT1lPzkwMDcxOTkyNTQ3NDA5OTE6ZSwhIWUmJihcIm51bWJlclwiPT1yfHxcInN5bWJvbFwiIT1yJiZUdC50ZXN0KHQpKSYmLTE8dCYmMD09dCUxJiZ0PGV9ZnVuY3Rpb24gdXQodCxlKXtpZihLZSh0KSlyZXR1cm4gZmFsc2U7dmFyIHI9dHlwZW9mIHQ7cmV0dXJuIShcIm51bWJlclwiIT1yJiZcInN5bWJvbFwiIT1yJiZcImJvb2xlYW5cIiE9ciYmbnVsbCE9dCYmIXd0KHQpKXx8KCR0LnRlc3QodCl8fCFQdC50ZXN0KHQpfHxudWxsIT1lJiZ0IGluIE9iamVjdChlKSl9ZnVuY3Rpb24gYXQodCl7dmFyIGU9dCYmdC5jb25zdHJ1Y3RvcjtyZXR1cm4gdD09PSh0eXBlb2YgZT09XCJmdW5jdGlvblwiJiZlLnByb3RvdHlwZXx8bmUpO1xufWZ1bmN0aW9uIGl0KHQsZSl7cmV0dXJuIGZ1bmN0aW9uKHIpe3JldHVybiBudWxsIT1yJiYoclt0XT09PWUmJihlIT09QnR8fHQgaW4gT2JqZWN0KHIpKSl9fWZ1bmN0aW9uIGZ0KGUscixuKXtyZXR1cm4gcj1TZShyPT09QnQ/ZS5sZW5ndGgtMTpyLDApLGZ1bmN0aW9uKCl7Zm9yKHZhciBvPWFyZ3VtZW50cyxjPS0xLHU9U2Uoby5sZW5ndGgtciwwKSxhPUFycmF5KHUpOysrYzx1OylhW2NdPW9bcitjXTtmb3IoYz0tMSx1PUFycmF5KHIrMSk7KytjPHI7KXVbY109b1tjXTtyZXR1cm4gdVtyXT1uKGEpLHQoZSx0aGlzLHUpfX1mdW5jdGlvbiBsdCh0KXtpZih0eXBlb2YgdD09XCJzdHJpbmdcInx8d3QodCkpcmV0dXJuIHQ7dmFyIGU9dCtcIlwiO3JldHVyblwiMFwiPT1lJiYxL3Q9PS1EdD9cIi0wXCI6ZX1mdW5jdGlvbiBzdCh0KXtpZihudWxsIT10KXt0cnl7cmV0dXJuIGNlLmNhbGwodCl9Y2F0Y2godCl7fXJldHVybiB0K1wiXCJ9cmV0dXJuXCJcIn1mdW5jdGlvbiBidCh0KXtyZXR1cm4obnVsbD09dD8wOnQubGVuZ3RoKT9PKHQsMSk6W107XG59ZnVuY3Rpb24gaHQodCl7dmFyIGU9bnVsbD09dD8wOnQubGVuZ3RoO3JldHVybiBlP3RbZS0xXTpCdH1mdW5jdGlvbiBwdCh0LGUpe2Z1bmN0aW9uIHIoKXt2YXIgbj1hcmd1bWVudHMsbz1lP2UuYXBwbHkodGhpcyxuKTpuWzBdLGM9ci5jYWNoZTtyZXR1cm4gYy5oYXMobyk/Yy5nZXQobyk6KG49dC5hcHBseSh0aGlzLG4pLHIuY2FjaGU9Yy5zZXQobyxuKXx8YyxuKX1pZih0eXBlb2YgdCE9XCJmdW5jdGlvblwifHxudWxsIT1lJiZ0eXBlb2YgZSE9XCJmdW5jdGlvblwiKXRocm93IG5ldyBUeXBlRXJyb3IoXCJFeHBlY3RlZCBhIGZ1bmN0aW9uXCIpO3JldHVybiByLmNhY2hlPW5ldyhwdC5DYWNoZXx8cCkscn1mdW5jdGlvbiB5dCh0LGUpe3JldHVybiB0PT09ZXx8dCE9PXQmJmUhPT1lfWZ1bmN0aW9uIGp0KHQpe3JldHVybiBudWxsIT10JiZndCh0Lmxlbmd0aCkmJiFfdCh0KX1mdW5jdGlvbiBfdCh0KXtyZXR1cm4hIXZ0KHQpJiYodD1rKHQpLFwiW29iamVjdCBGdW5jdGlvbl1cIj09dHx8XCJbb2JqZWN0IEdlbmVyYXRvckZ1bmN0aW9uXVwiPT10fHxcIltvYmplY3QgQXN5bmNGdW5jdGlvbl1cIj09dHx8XCJbb2JqZWN0IFByb3h5XVwiPT10KTtcbn1mdW5jdGlvbiBndCh0KXtyZXR1cm4gdHlwZW9mIHQ9PVwibnVtYmVyXCImJi0xPHQmJjA9PXQlMSYmOTAwNzE5OTI1NDc0MDk5MT49dH1mdW5jdGlvbiB2dCh0KXt2YXIgZT10eXBlb2YgdDtyZXR1cm4gbnVsbCE9dCYmKFwib2JqZWN0XCI9PWV8fFwiZnVuY3Rpb25cIj09ZSl9ZnVuY3Rpb24gZHQodCl7cmV0dXJuIG51bGwhPXQmJnR5cGVvZiB0PT1cIm9iamVjdFwifWZ1bmN0aW9uIEF0KHQpe3JldHVybiEoIWR0KHQpfHxcIltvYmplY3QgT2JqZWN0XVwiIT1rKHQpKSYmKHQ9eWUodCksbnVsbD09PXR8fCh0PXVlLmNhbGwodCxcImNvbnN0cnVjdG9yXCIpJiZ0LmNvbnN0cnVjdG9yLHR5cGVvZiB0PT1cImZ1bmN0aW9uXCImJnQgaW5zdGFuY2VvZiB0JiZjZS5jYWxsKHQpPT1mZSkpfWZ1bmN0aW9uIHd0KHQpe3JldHVybiB0eXBlb2YgdD09XCJzeW1ib2xcInx8ZHQodCkmJlwiW29iamVjdCBTeW1ib2xdXCI9PWsodCl9ZnVuY3Rpb24gbXQodCl7cmV0dXJuIG51bGw9PXQ/XCJcIjpMKHQpfWZ1bmN0aW9uIE90KHQsZSxyKXtcbnJldHVybiB0PW51bGw9PXQ/QnQ6Uyh0LGUpLHQ9PT1CdD9yOnR9ZnVuY3Rpb24gU3QodCxlKXt2YXIgcjtpZihyPW51bGwhPXQpe3I9dDt2YXIgbjtuPVYoZSxyKTtmb3IodmFyIG89LTEsYz1uLmxlbmd0aCx1PWZhbHNlOysrbzxjOyl7dmFyIGE9bHQobltvXSk7aWYoISh1PW51bGwhPXImJm51bGwhPXImJmEgaW4gT2JqZWN0KHIpKSlicmVhaztyPXJbYV19dXx8KytvIT1jP3I9dTooYz1udWxsPT1yPzA6ci5sZW5ndGgscj0hIWMmJmd0KGMpJiZjdChhLGMpJiYoS2Uocil8fEplKHIpKSl9cmV0dXJuIHJ9ZnVuY3Rpb24genQodCl7aWYoanQodCkpdD1fKHQpO2Vsc2UgaWYoYXQodCkpe3ZhciBlLHI9W107Zm9yKGUgaW4gT2JqZWN0KHQpKXVlLmNhbGwodCxlKSYmXCJjb25zdHJ1Y3RvclwiIT1lJiZyLnB1c2goZSk7dD1yfWVsc2UgdD1PZSh0KTtyZXR1cm4gdH1mdW5jdGlvbiBrdCh0KXtpZihqdCh0KSl0PV8odCx0cnVlKTtlbHNlIGlmKHZ0KHQpKXt2YXIgZSxyPWF0KHQpLG49W107Zm9yKGUgaW4gdCkoXCJjb25zdHJ1Y3RvclwiIT1lfHwhciYmdWUuY2FsbCh0LGUpKSYmbi5wdXNoKGUpO1xudD1ufWVsc2V7aWYoZT1bXSxudWxsIT10KWZvcihyIGluIE9iamVjdCh0KSllLnB1c2gocik7dD1lfXJldHVybiB0fWZ1bmN0aW9uIHh0KHQpe3JldHVybiBmdW5jdGlvbigpe3JldHVybiB0fX1mdW5jdGlvbiBFdCh0KXtyZXR1cm4gdH1mdW5jdGlvbiBGdCh0KXtyZXR1cm4gQih0eXBlb2YgdD09XCJmdW5jdGlvblwiP3Q6bSh0LDEpKX1mdW5jdGlvbiBJdCh0KXtyZXR1cm4gdXQodCk/dShsdCh0KSk6JCh0KX1mdW5jdGlvbiBNdCgpe3JldHVybltdfWZ1bmN0aW9uIFV0KCl7cmV0dXJuIGZhbHNlfXZhciBCdCxEdD0xLzAsUHQ9L1xcLnxcXFsoPzpbXltcXF1dKnwoW1wiJ10pKD86KD8hXFwxKVteXFxcXF18XFxcXC4pKj9cXDEpXFxdLywkdD0vXlxcdyokLyxMdD0vW14uW1xcXV0rfFxcWyg/OigtP1xcZCsoPzpcXC5cXGQrKT8pfChbXCInXSkoKD86KD8hXFwyKVteXFxcXF18XFxcXC4pKj8pXFwyKVxcXXwoPz0oPzpcXC58XFxbXFxdKSg/OlxcLnxcXFtcXF18JCkpL2csQ3Q9L1xcXFwoXFxcXCk/L2csVnQ9L1xcdyokLyxSdD0vXlxcW29iamVjdCAuKz9Db25zdHJ1Y3RvclxcXSQvLFR0PS9eKD86MHxbMS05XVxcZCopJC8sTnQ9e307XG5OdFtcIltvYmplY3QgRmxvYXQzMkFycmF5XVwiXT1OdFtcIltvYmplY3QgRmxvYXQ2NEFycmF5XVwiXT1OdFtcIltvYmplY3QgSW50OEFycmF5XVwiXT1OdFtcIltvYmplY3QgSW50MTZBcnJheV1cIl09TnRbXCJbb2JqZWN0IEludDMyQXJyYXldXCJdPU50W1wiW29iamVjdCBVaW50OEFycmF5XVwiXT1OdFtcIltvYmplY3QgVWludDhDbGFtcGVkQXJyYXldXCJdPU50W1wiW29iamVjdCBVaW50MTZBcnJheV1cIl09TnRbXCJbb2JqZWN0IFVpbnQzMkFycmF5XVwiXT10cnVlLE50W1wiW29iamVjdCBBcmd1bWVudHNdXCJdPU50W1wiW29iamVjdCBBcnJheV1cIl09TnRbXCJbb2JqZWN0IEFycmF5QnVmZmVyXVwiXT1OdFtcIltvYmplY3QgQm9vbGVhbl1cIl09TnRbXCJbb2JqZWN0IERhdGFWaWV3XVwiXT1OdFtcIltvYmplY3QgRGF0ZV1cIl09TnRbXCJbb2JqZWN0IEVycm9yXVwiXT1OdFtcIltvYmplY3QgRnVuY3Rpb25dXCJdPU50W1wiW29iamVjdCBNYXBdXCJdPU50W1wiW29iamVjdCBOdW1iZXJdXCJdPU50W1wiW29iamVjdCBPYmplY3RdXCJdPU50W1wiW29iamVjdCBSZWdFeHBdXCJdPU50W1wiW29iamVjdCBTZXRdXCJdPU50W1wiW29iamVjdCBTdHJpbmddXCJdPU50W1wiW29iamVjdCBXZWFrTWFwXVwiXT1mYWxzZTtcbnZhciBXdD17fTtXdFtcIltvYmplY3QgQXJndW1lbnRzXVwiXT1XdFtcIltvYmplY3QgQXJyYXldXCJdPVd0W1wiW29iamVjdCBBcnJheUJ1ZmZlcl1cIl09V3RbXCJbb2JqZWN0IERhdGFWaWV3XVwiXT1XdFtcIltvYmplY3QgQm9vbGVhbl1cIl09V3RbXCJbb2JqZWN0IERhdGVdXCJdPVd0W1wiW29iamVjdCBGbG9hdDMyQXJyYXldXCJdPVd0W1wiW29iamVjdCBGbG9hdDY0QXJyYXldXCJdPVd0W1wiW29iamVjdCBJbnQ4QXJyYXldXCJdPVd0W1wiW29iamVjdCBJbnQxNkFycmF5XVwiXT1XdFtcIltvYmplY3QgSW50MzJBcnJheV1cIl09V3RbXCJbb2JqZWN0IE1hcF1cIl09V3RbXCJbb2JqZWN0IE51bWJlcl1cIl09V3RbXCJbb2JqZWN0IE9iamVjdF1cIl09V3RbXCJbb2JqZWN0IFJlZ0V4cF1cIl09V3RbXCJbb2JqZWN0IFNldF1cIl09V3RbXCJbb2JqZWN0IFN0cmluZ11cIl09V3RbXCJbb2JqZWN0IFN5bWJvbF1cIl09V3RbXCJbb2JqZWN0IFVpbnQ4QXJyYXldXCJdPVd0W1wiW29iamVjdCBVaW50OENsYW1wZWRBcnJheV1cIl09V3RbXCJbb2JqZWN0IFVpbnQxNkFycmF5XVwiXT1XdFtcIltvYmplY3QgVWludDMyQXJyYXldXCJdPXRydWUsXG5XdFtcIltvYmplY3QgRXJyb3JdXCJdPVd0W1wiW29iamVjdCBGdW5jdGlvbl1cIl09V3RbXCJbb2JqZWN0IFdlYWtNYXBdXCJdPWZhbHNlO3ZhciBHdCxxdD10eXBlb2YgZ2xvYmFsPT1cIm9iamVjdFwiJiZnbG9iYWwmJmdsb2JhbC5PYmplY3Q9PT1PYmplY3QmJmdsb2JhbCxIdD10eXBlb2Ygc2VsZj09XCJvYmplY3RcIiYmc2VsZiYmc2VsZi5PYmplY3Q9PT1PYmplY3QmJnNlbGYsSnQ9cXR8fEh0fHxGdW5jdGlvbihcInJldHVybiB0aGlzXCIpKCksS3Q9dHlwZW9mIGV4cG9ydHM9PVwib2JqZWN0XCImJmV4cG9ydHMmJiFleHBvcnRzLm5vZGVUeXBlJiZleHBvcnRzLFF0PUt0JiZ0eXBlb2YgbW9kdWxlPT1cIm9iamVjdFwiJiZtb2R1bGUmJiFtb2R1bGUubm9kZVR5cGUmJm1vZHVsZSxYdD1RdCYmUXQuZXhwb3J0cz09PUt0LFl0PVh0JiZxdC5wcm9jZXNzO3Q6e3RyeXtHdD1ZdCYmWXQuYmluZGluZyYmWXQuYmluZGluZyhcInV0aWxcIik7YnJlYWsgdH1jYXRjaCh0KXt9R3Q9dm9pZCAwfXZhciBadD1HdCYmR3QuaXNNYXAsdGU9R3QmJkd0LmlzU2V0LGVlPUd0JiZHdC5pc1R5cGVkQXJyYXkscmU9QXJyYXkucHJvdG90eXBlLG5lPU9iamVjdC5wcm90b3R5cGUsb2U9SnRbXCJfX2NvcmUtanNfc2hhcmVkX19cIl0sY2U9RnVuY3Rpb24ucHJvdG90eXBlLnRvU3RyaW5nLHVlPW5lLmhhc093blByb3BlcnR5LGFlPWZ1bmN0aW9uKCl7XG52YXIgdD0vW14uXSskLy5leGVjKG9lJiZvZS5rZXlzJiZvZS5rZXlzLklFX1BST1RPfHxcIlwiKTtyZXR1cm4gdD9cIlN5bWJvbChzcmMpXzEuXCIrdDpcIlwifSgpLGllPW5lLnRvU3RyaW5nLGZlPWNlLmNhbGwoT2JqZWN0KSxsZT1SZWdFeHAoXCJeXCIrY2UuY2FsbCh1ZSkucmVwbGFjZSgvW1xcXFxeJC4qKz8oKVtcXF17fXxdL2csXCJcXFxcJCZcIikucmVwbGFjZSgvaGFzT3duUHJvcGVydHl8KGZ1bmN0aW9uKS4qPyg/PVxcXFxcXCgpfCBmb3IgLis/KD89XFxcXFxcXSkvZyxcIiQxLio/XCIpK1wiJFwiKSxzZT1YdD9KdC5CdWZmZXI6QnQsYmU9SnQuU3ltYm9sLGhlPUp0LlVpbnQ4QXJyYXkscGU9c2U/c2UuYTpCdCx5ZT1mKE9iamVjdC5nZXRQcm90b3R5cGVPZiksamU9T2JqZWN0LmNyZWF0ZSxfZT1uZS5wcm9wZXJ0eUlzRW51bWVyYWJsZSxnZT1yZS5zcGxpY2UsdmU9YmU/YmUuaXNDb25jYXRTcHJlYWRhYmxlOkJ0LGRlPWJlP2JlLnRvU3RyaW5nVGFnOkJ0LEFlPWZ1bmN0aW9uKCl7dHJ5e3ZhciB0PWV0KE9iamVjdCxcImRlZmluZVByb3BlcnR5XCIpO1xucmV0dXJuIHQoe30sXCJcIix7fSksdH1jYXRjaCh0KXt9fSgpLHdlPU9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMsbWU9c2U/c2UuaXNCdWZmZXI6QnQsT2U9ZihPYmplY3Qua2V5cyksU2U9TWF0aC5tYXgsemU9RGF0ZS5ub3csa2U9ZXQoSnQsXCJEYXRhVmlld1wiKSx4ZT1ldChKdCxcIk1hcFwiKSxFZT1ldChKdCxcIlByb21pc2VcIiksRmU9ZXQoSnQsXCJTZXRcIiksSWU9ZXQoSnQsXCJXZWFrTWFwXCIpLE1lPWV0KE9iamVjdCxcImNyZWF0ZVwiKSxVZT1zdChrZSksQmU9c3QoeGUpLERlPXN0KEVlKSxQZT1zdChGZSksJGU9c3QoSWUpLExlPWJlP2JlLnByb3RvdHlwZTpCdCxDZT1MZT9MZS52YWx1ZU9mOkJ0LFZlPUxlP0xlLnRvU3RyaW5nOkJ0LFJlPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdCgpe31yZXR1cm4gZnVuY3Rpb24oZSl7cmV0dXJuIHZ0KGUpP2plP2plKGUpOih0LnByb3RvdHlwZT1lLGU9bmV3IHQsdC5wcm90b3R5cGU9QnQsZSk6e319fSgpO2IucHJvdG90eXBlLmNsZWFyPWZ1bmN0aW9uKCl7XG50aGlzLl9fZGF0YV9fPU1lP01lKG51bGwpOnt9LHRoaXMuc2l6ZT0wfSxiLnByb3RvdHlwZS5kZWxldGU9ZnVuY3Rpb24odCl7cmV0dXJuIHQ9dGhpcy5oYXModCkmJmRlbGV0ZSB0aGlzLl9fZGF0YV9fW3RdLHRoaXMuc2l6ZS09dD8xOjAsdH0sYi5wcm90b3R5cGUuZ2V0PWZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuX19kYXRhX187cmV0dXJuIE1lPyh0PWVbdF0sXCJfX2xvZGFzaF9oYXNoX3VuZGVmaW5lZF9fXCI9PT10P0J0OnQpOnVlLmNhbGwoZSx0KT9lW3RdOkJ0fSxiLnByb3RvdHlwZS5oYXM9ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5fX2RhdGFfXztyZXR1cm4gTWU/ZVt0XSE9PUJ0OnVlLmNhbGwoZSx0KX0sYi5wcm90b3R5cGUuc2V0PWZ1bmN0aW9uKHQsZSl7dmFyIHI9dGhpcy5fX2RhdGFfXztyZXR1cm4gdGhpcy5zaXplKz10aGlzLmhhcyh0KT8wOjEsclt0XT1NZSYmZT09PUJ0P1wiX19sb2Rhc2hfaGFzaF91bmRlZmluZWRfX1wiOmUsdGhpc30saC5wcm90b3R5cGUuY2xlYXI9ZnVuY3Rpb24oKXtcbnRoaXMuX19kYXRhX189W10sdGhpcy5zaXplPTB9LGgucHJvdG90eXBlLmRlbGV0ZT1mdW5jdGlvbih0KXt2YXIgZT10aGlzLl9fZGF0YV9fO3JldHVybiB0PXYoZSx0KSwhKDA+dCkmJih0PT1lLmxlbmd0aC0xP2UucG9wKCk6Z2UuY2FsbChlLHQsMSksLS10aGlzLnNpemUsdHJ1ZSl9LGgucHJvdG90eXBlLmdldD1mdW5jdGlvbih0KXt2YXIgZT10aGlzLl9fZGF0YV9fO3JldHVybiB0PXYoZSx0KSwwPnQ/QnQ6ZVt0XVsxXX0saC5wcm90b3R5cGUuaGFzPWZ1bmN0aW9uKHQpe3JldHVybi0xPHYodGhpcy5fX2RhdGFfXyx0KX0saC5wcm90b3R5cGUuc2V0PWZ1bmN0aW9uKHQsZSl7dmFyIHI9dGhpcy5fX2RhdGFfXyxuPXYocix0KTtyZXR1cm4gMD5uPygrK3RoaXMuc2l6ZSxyLnB1c2goW3QsZV0pKTpyW25dWzFdPWUsdGhpc30scC5wcm90b3R5cGUuY2xlYXI9ZnVuY3Rpb24oKXt0aGlzLnNpemU9MCx0aGlzLl9fZGF0YV9fPXtoYXNoOm5ldyBiLG1hcDpuZXcoeGV8fGgpLHN0cmluZzpuZXcgYlxufX0scC5wcm90b3R5cGUuZGVsZXRlPWZ1bmN0aW9uKHQpe3JldHVybiB0PVoodGhpcyx0KS5kZWxldGUodCksdGhpcy5zaXplLT10PzE6MCx0fSxwLnByb3RvdHlwZS5nZXQ9ZnVuY3Rpb24odCl7cmV0dXJuIFoodGhpcyx0KS5nZXQodCl9LHAucHJvdG90eXBlLmhhcz1mdW5jdGlvbih0KXtyZXR1cm4gWih0aGlzLHQpLmhhcyh0KX0scC5wcm90b3R5cGUuc2V0PWZ1bmN0aW9uKHQsZSl7dmFyIHI9Wih0aGlzLHQpLG49ci5zaXplO3JldHVybiByLnNldCh0LGUpLHRoaXMuc2l6ZSs9ci5zaXplPT1uPzA6MSx0aGlzfSx5LnByb3RvdHlwZS5hZGQ9eS5wcm90b3R5cGUucHVzaD1mdW5jdGlvbih0KXtyZXR1cm4gdGhpcy5fX2RhdGFfXy5zZXQodCxcIl9fbG9kYXNoX2hhc2hfdW5kZWZpbmVkX19cIiksdGhpc30seS5wcm90b3R5cGUuaGFzPWZ1bmN0aW9uKHQpe3JldHVybiB0aGlzLl9fZGF0YV9fLmhhcyh0KX0sai5wcm90b3R5cGUuY2xlYXI9ZnVuY3Rpb24oKXt0aGlzLl9fZGF0YV9fPW5ldyBoLFxudGhpcy5zaXplPTB9LGoucHJvdG90eXBlLmRlbGV0ZT1mdW5jdGlvbih0KXt2YXIgZT10aGlzLl9fZGF0YV9fO3JldHVybiB0PWUuZGVsZXRlKHQpLHRoaXMuc2l6ZT1lLnNpemUsdH0sai5wcm90b3R5cGUuZ2V0PWZ1bmN0aW9uKHQpe3JldHVybiB0aGlzLl9fZGF0YV9fLmdldCh0KX0sai5wcm90b3R5cGUuaGFzPWZ1bmN0aW9uKHQpe3JldHVybiB0aGlzLl9fZGF0YV9fLmhhcyh0KX0sai5wcm90b3R5cGUuc2V0PWZ1bmN0aW9uKHQsZSl7dmFyIHI9dGhpcy5fX2RhdGFfXztpZihyIGluc3RhbmNlb2YgaCl7dmFyIG49ci5fX2RhdGFfXztpZigheGV8fDE5OT5uLmxlbmd0aClyZXR1cm4gbi5wdXNoKFt0LGVdKSx0aGlzLnNpemU9KytyLnNpemUsdGhpcztyPXRoaXMuX19kYXRhX189bmV3IHAobil9cmV0dXJuIHIuc2V0KHQsZSksdGhpcy5zaXplPXIuc2l6ZSx0aGlzfTt2YXIgVGU9QWU/ZnVuY3Rpb24odCxlKXtyZXR1cm4gQWUodCxcInRvU3RyaW5nXCIse2NvbmZpZ3VyYWJsZTp0cnVlLFxuZW51bWVyYWJsZTpmYWxzZSx2YWx1ZTp4dChlKSx3cml0YWJsZTp0cnVlfSl9OkV0LE5lPXdlP2Z1bmN0aW9uKHQpe3JldHVybiBudWxsPT10P1tdOih0PU9iamVjdCh0KSxyKHdlKHQpLGZ1bmN0aW9uKGUpe3JldHVybiBfZS5jYWxsKHQsZSl9KSl9Ok10LFdlPXdlP2Z1bmN0aW9uKHQpe2Zvcih2YXIgZT1bXTt0OylvKGUsTmUodCkpLHQ9eWUodCk7cmV0dXJuIGV9Ok10LEdlPWs7KGtlJiZcIltvYmplY3QgRGF0YVZpZXddXCIhPUdlKG5ldyBrZShuZXcgQXJyYXlCdWZmZXIoMSkpKXx8eGUmJlwiW29iamVjdCBNYXBdXCIhPUdlKG5ldyB4ZSl8fEVlJiZcIltvYmplY3QgUHJvbWlzZV1cIiE9R2UoRWUucmVzb2x2ZSgpKXx8RmUmJlwiW29iamVjdCBTZXRdXCIhPUdlKG5ldyBGZSl8fEllJiZcIltvYmplY3QgV2Vha01hcF1cIiE9R2UobmV3IEllKSkmJihHZT1mdW5jdGlvbih0KXt2YXIgZT1rKHQpO2lmKHQ9KHQ9XCJbb2JqZWN0IE9iamVjdF1cIj09ZT90LmNvbnN0cnVjdG9yOkJ0KT9zdCh0KTpcIlwiKXN3aXRjaCh0KXtcbmNhc2UgVWU6cmV0dXJuXCJbb2JqZWN0IERhdGFWaWV3XVwiO2Nhc2UgQmU6cmV0dXJuXCJbb2JqZWN0IE1hcF1cIjtjYXNlIERlOnJldHVyblwiW29iamVjdCBQcm9taXNlXVwiO2Nhc2UgUGU6cmV0dXJuXCJbb2JqZWN0IFNldF1cIjtjYXNlICRlOnJldHVyblwiW29iamVjdCBXZWFrTWFwXVwifXJldHVybiBlfSk7dmFyIHFlPWZ1bmN0aW9uKHQpe3ZhciBlPTAscj0wO3JldHVybiBmdW5jdGlvbigpe3ZhciBuPXplKCksbz0xNi0obi1yKTtpZihyPW4sMDxvKXtpZig4MDA8PSsrZSlyZXR1cm4gYXJndW1lbnRzWzBdfWVsc2UgZT0wO3JldHVybiB0LmFwcGx5KEJ0LGFyZ3VtZW50cyl9fShUZSksSGU9ZnVuY3Rpb24odCl7dD1wdCh0LGZ1bmN0aW9uKHQpe3JldHVybiA1MDA9PT1lLnNpemUmJmUuY2xlYXIoKSx0fSk7dmFyIGU9dC5jYWNoZTtyZXR1cm4gdH0oZnVuY3Rpb24odCl7dmFyIGU9W107cmV0dXJuIDQ2PT09dC5jaGFyQ29kZUF0KDApJiZlLnB1c2goXCJcIiksdC5yZXBsYWNlKEx0LGZ1bmN0aW9uKHQscixuLG8pe1xuZS5wdXNoKG4/by5yZXBsYWNlKEN0LFwiJDFcIik6cnx8dCl9KSxlfSk7cHQuQ2FjaGU9cDt2YXIgSmU9eChmdW5jdGlvbigpe3JldHVybiBhcmd1bWVudHN9KCkpP3g6ZnVuY3Rpb24odCl7cmV0dXJuIGR0KHQpJiZ1ZS5jYWxsKHQsXCJjYWxsZWVcIikmJiFfZS5jYWxsKHQsXCJjYWxsZWVcIil9LEtlPUFycmF5LmlzQXJyYXksUWU9bWV8fFV0LFhlPVp0P2EoWnQpOkYsWWU9dGU/YSh0ZSk6TSxaZT1lZT9hKGVlKTpVLHRyPWZ1bmN0aW9uKHQsZSl7cmV0dXJuIHFlKGZ0KHQsZSxFdCksdCtcIlwiKX0oZnVuY3Rpb24odCxlKXt0PU9iamVjdCh0KTt2YXIgcixuPS0xLG89ZS5sZW5ndGgsYz0yPG8/ZVsyXTpCdDtpZihyPWMpe3I9ZVswXTt2YXIgdT1lWzFdO2lmKHZ0KGMpKXt2YXIgYT10eXBlb2YgdTtyPSEhKFwibnVtYmVyXCI9PWE/anQoYykmJmN0KHUsYy5sZW5ndGgpOlwic3RyaW5nXCI9PWEmJnUgaW4gYykmJnl0KGNbdV0scil9ZWxzZSByPWZhbHNlfWZvcihyJiYobz0xKTsrK248bzspZm9yKGM9ZVtuXSxcbnI9a3QoYyksdT0tMSxhPXIubGVuZ3RoOysrdTxhOyl7dmFyIGk9clt1XSxmPXRbaV07KGY9PT1CdHx8eXQoZixuZVtpXSkmJiF1ZS5jYWxsKHQsaSkpJiYodFtpXT1jW2ldKX1yZXR1cm4gdH0pLGVyPWZ1bmN0aW9uKHQpe3JldHVybiBxZShmdCh0LEJ0LGJ0KSx0K1wiXCIpfShmdW5jdGlvbih0LGUpe3ZhciByPXt9O2lmKG51bGw9PXQpcmV0dXJuIHI7dmFyIG89ZmFsc2U7ZT1uKGUsZnVuY3Rpb24oZSl7cmV0dXJuIGU9VihlLHQpLG98fChvPTE8ZS5sZW5ndGgpLGV9KSxXKHQsWCh0KSxyKSxvJiYocj1tKHIsNyxIKSk7Zm9yKHZhciBjPWUubGVuZ3RoO2MtLTspQyhyLGVbY10pO3JldHVybiByfSk7cy5jb25zdGFudD14dCxzLmRlZmF1bHRzPXRyLHMuZmxhdHRlbj1idCxzLml0ZXJhdGVlPUZ0LHMua2V5cz16dCxzLmtleXNJbj1rdCxzLm1lbW9pemU9cHQscy5vbWl0PWVyLHMucHJvcGVydHk9SXQscy5yZW1vdmU9ZnVuY3Rpb24odCxlKXt2YXIgcj1bXTtpZighdHx8IXQubGVuZ3RoKXJldHVybiByO1xudmFyIG49LTEsbz1bXSxjPXQubGVuZ3RoO2ZvcihlPVkoZSwzKTsrK248Yzspe3ZhciB1PXRbbl07ZSh1LG4sdCkmJihyLnB1c2godSksby5wdXNoKG4pKX1mb3Iobj10P28ubGVuZ3RoOjAsYz1uLTE7bi0tOylpZih1PW9bbl0sbj09Y3x8dSE9PWEpe3ZhciBhPXU7Y3QodSk/Z2UuY2FsbCh0LHUsMSk6Qyh0LHUpfXJldHVybiByfSxzLmVxPXl0LHMuZ2V0PU90LHMuaGFzSW49U3Qscy5pZGVudGl0eT1FdCxzLmlzQXJndW1lbnRzPUplLHMuaXNBcnJheT1LZSxzLmlzQXJyYXlMaWtlPWp0LHMuaXNCdWZmZXI9UWUscy5pc0Z1bmN0aW9uPV90LHMuaXNMZW5ndGg9Z3Qscy5pc01hcD1YZSxzLmlzT2JqZWN0PXZ0LHMuaXNPYmplY3RMaWtlPWR0LHMuaXNQbGFpbk9iamVjdD1BdCxzLmlzU2V0PVllLHMuaXNTeW1ib2w9d3Qscy5pc1R5cGVkQXJyYXk9WmUscy5sYXN0PWh0LHMuc3R1YkFycmF5PU10LHMuc3R1YkZhbHNlPVV0LHMudG9TdHJpbmc9bXQscy5WRVJTSU9OPVwiNC4xNy41XCIsUXQmJigoUXQuZXhwb3J0cz1zKS5fPXMsXG5LdC5fPXMpfSkuY2FsbCh0aGlzKTsiXSwic291cmNlUm9vdCI6IiJ9