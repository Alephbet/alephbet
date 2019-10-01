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
	Basil.version = '0.4.10';

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

/***/ "./node_modules/node-uuid/uuid.js":
/*!****************************************!*\
  !*** ./node_modules/node-uuid/uuid.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_RESULT__;//     uuid.js
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

  if (true) {
    // Publish as AMD module
    !(__WEBPACK_AMD_DEFINE_RESULT__ = (function() {return uuid;}).call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else { var _previousRoot; }
}).call(this);


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
    Experiment.property('user_id', {
      get: function get() {
        if (typeof this._user_id === 'function') {
          return this._user_id();
        }

        return this._user_id;
      },
      set: function set(value) {
        return this._user_id = value;
      }
    });

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
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// NOTE: using a custom build of lodash, to save space
var Utils, _, options, _sha, uuid;

_ = __webpack_require__(/*! ../vendor/lodash.custom.min */ "./vendor/lodash.custom.min.js");
uuid = __webpack_require__(/*! node-uuid */ "./node_modules/node-uuid/uuid.js");
_sha = __webpack_require__(/*! crypto-js/sha1 */ "./node_modules/crypto-js/sha1.js");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9BbGVwaEJldC93ZWJwYWNrL3VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24iLCJ3ZWJwYWNrOi8vQWxlcGhCZXQvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vQWxlcGhCZXQvLi9ub2RlX21vZHVsZXMvYmFzaWwuanMvYnVpbGQvYmFzaWwuanMiLCJ3ZWJwYWNrOi8vQWxlcGhCZXQvLi9ub2RlX21vZHVsZXMvY3J5cHRvLWpzL2NvcmUuanMiLCJ3ZWJwYWNrOi8vQWxlcGhCZXQvLi9ub2RlX21vZHVsZXMvY3J5cHRvLWpzL3NoYTEuanMiLCJ3ZWJwYWNrOi8vQWxlcGhCZXQvLi9ub2RlX21vZHVsZXMvbm9kZS11dWlkL3V1aWQuanMiLCJ3ZWJwYWNrOi8vQWxlcGhCZXQvKHdlYnBhY2spL2J1aWxkaW4vZ2xvYmFsLmpzIiwid2VicGFjazovL0FsZXBoQmV0Lyh3ZWJwYWNrKS9idWlsZGluL21vZHVsZS5qcyIsIndlYnBhY2s6Ly9BbGVwaEJldC8uL3NyYy9hZGFwdGVycy5jb2ZmZWUiLCJ3ZWJwYWNrOi8vQWxlcGhCZXQvLi9zcmMvYWxlcGhiZXQuY29mZmVlIiwid2VicGFjazovL0FsZXBoQmV0Ly4vc3JjL29wdGlvbnMuY29mZmVlIiwid2VicGFjazovL0FsZXBoQmV0Ly4vc3JjL3N0b3JhZ2UuY29mZmVlIiwid2VicGFjazovL0FsZXBoQmV0Ly4vc3JjL3V0aWxzLmNvZmZlZSIsIndlYnBhY2s6Ly9BbGVwaEJldC8uL3ZlbmRvci9sb2Rhc2guY3VzdG9tLm1pbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0QsTztRQ1ZBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFH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REFBNkQsNkJBQTZCLDRCQUE0Qiw4QkFBOEI7QUFDdGUsWUFBWSxnQ0FBZ0Msb0JBQW9CLHdDQUF3Qyw2QkFBNkIsNEJBQTRCLDZCQUE2Qiw0QkFBNEIsK0JBQStCLG9CQUFvQixtQkFBbUIsaUJBQWlCLGtFQUFrRSx5QkFBeUIseUNBQXlDLHdCQUF3Qix3QkFBd0I7QUFDcmUsMkNBQTJDLEVBQUUsc0JBQXNCLG1EQUFtRCxvQkFBb0IsR0FBRyxzQkFBc0IsYUFBYSxFQUFFLG9CQUFvQixTQUFTLFNBQVMseU5BQXlOLFdBQVc7QUFDNWIsa0NBQWtDLDZCQUE2QixpQ0FBaUMsNkJBQTZCLGlDQUFpQyxTQUFTLEVBQUUsbUJBQW1CLFlBQVksa0JBQWtCLHNCQUFzQixZQUFZLGdDQUFnQyxTQUFTLDhCQUE4QixvQkFBb0IsbUJBQW1CLGlDQUFpQyxFQUFFLGNBQWMsU0FBUyxhQUFhLFNBQVM7QUFDMWIsa0NBQWtDLElBQUksRUFBRSxXQUFXLG9CQUFvQixpQkFBaUIsa0JBQWtCLHdEQUF3RCx1RkFBdUYsMkJBQTJCLGVBQWUsWUFBWSxvQ0FBb0MsUUFBUSxPQUFPLFdBQVcsVUFBVSxlQUFlLHdFQUF3RSxhQUFhLGFBQWEsTUFBTTtBQUM5ZSx3QkFBd0IsTUFBTSxFQUFFLGtCQUFrQixrREFBa0QsU0FBUyxpQkFBaUIsNEJBQTRCLGVBQWUsU0FBUyxvQkFBb0IsWUFBWSxrQkFBa0Isb0NBQW9DLDhCQUE4QixtQkFBbUIsSUFBSSxXQUFXLFNBQVMsRUFBRSx5SUFBeUksU0FBUztBQUNyZSx5QkFBeUIsYUFBYSxNQUFNLEVBQUUsV0FBVyxnQ0FBZ0MseUJBQXlCLElBQUksd0JBQXdCLFFBQVEsNEJBQTRCLFNBQVM7QUFDM0wsUUFBUSxhIiwiZmlsZSI6ImFsZXBoYmV0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoW10sIGZhY3RvcnkpO1xuXHRlbHNlIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jylcblx0XHRleHBvcnRzW1wiQWxlcGhCZXRcIl0gPSBmYWN0b3J5KCk7XG5cdGVsc2Vcblx0XHRyb290W1wiQWxlcGhCZXRcIl0gPSBmYWN0b3J5KCk7XG59KSh3aW5kb3csIGZ1bmN0aW9uKCkge1xucmV0dXJuICIsIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL2FsZXBoYmV0LmNvZmZlZVwiKTtcbiIsIihmdW5jdGlvbiAoKSB7XG5cdC8vIEJhc2lsXG5cdHZhciBCYXNpbCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG5cdFx0cmV0dXJuIEJhc2lsLnV0aWxzLmV4dGVuZCh7fSwgQmFzaWwucGx1Z2lucywgbmV3IEJhc2lsLlN0b3JhZ2UoKS5pbml0KG9wdGlvbnMpKTtcblx0fTtcblxuXHQvLyBWZXJzaW9uXG5cdEJhc2lsLnZlcnNpb24gPSAnMC40LjEwJztcblxuXHQvLyBVdGlsc1xuXHRCYXNpbC51dGlscyA9IHtcblx0XHRleHRlbmQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdHZhciBkZXN0aW5hdGlvbiA9IHR5cGVvZiBhcmd1bWVudHNbMF0gPT09ICdvYmplY3QnID8gYXJndW1lbnRzWzBdIDoge307XG5cdFx0XHRmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZiAoYXJndW1lbnRzW2ldICYmIHR5cGVvZiBhcmd1bWVudHNbaV0gPT09ICdvYmplY3QnKVxuXHRcdFx0XHRcdGZvciAodmFyIHByb3BlcnR5IGluIGFyZ3VtZW50c1tpXSlcblx0XHRcdFx0XHRcdGRlc3RpbmF0aW9uW3Byb3BlcnR5XSA9IGFyZ3VtZW50c1tpXVtwcm9wZXJ0eV07XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZGVzdGluYXRpb247XG5cdFx0fSxcblx0XHRlYWNoOiBmdW5jdGlvbiAob2JqLCBmbkl0ZXJhdG9yLCBjb250ZXh0KSB7XG5cdFx0XHRpZiAodGhpcy5pc0FycmF5KG9iaikpIHtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBvYmoubGVuZ3RoOyBpKyspXG5cdFx0XHRcdFx0aWYgKGZuSXRlcmF0b3IuY2FsbChjb250ZXh0LCBvYmpbaV0sIGkpID09PSBmYWxzZSkgcmV0dXJuO1xuXHRcdFx0fSBlbHNlIGlmIChvYmopIHtcblx0XHRcdFx0Zm9yICh2YXIga2V5IGluIG9iailcblx0XHRcdFx0XHRpZiAoZm5JdGVyYXRvci5jYWxsKGNvbnRleHQsIG9ialtrZXldLCBrZXkpID09PSBmYWxzZSkgcmV0dXJuO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0dHJ5RWFjaDogZnVuY3Rpb24gKG9iaiwgZm5JdGVyYXRvciwgZm5FcnJvciwgY29udGV4dCkge1xuXHRcdFx0dGhpcy5lYWNoKG9iaiwgZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRyZXR1cm4gZm5JdGVyYXRvci5jYWxsKGNvbnRleHQsIHZhbHVlLCBrZXkpO1xuXHRcdFx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0XHRcdGlmICh0aGlzLmlzRnVuY3Rpb24oZm5FcnJvcikpIHtcblx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdGZuRXJyb3IuY2FsbChjb250ZXh0LCB2YWx1ZSwga2V5LCBlcnJvcik7XG5cdFx0XHRcdFx0XHR9IGNhdGNoIChlcnJvcikge31cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0sIHRoaXMpO1xuXHRcdH0sXG5cdFx0cmVnaXN0ZXJQbHVnaW46IGZ1bmN0aW9uIChtZXRob2RzKSB7XG5cdFx0XHRCYXNpbC5wbHVnaW5zID0gdGhpcy5leHRlbmQobWV0aG9kcywgQmFzaWwucGx1Z2lucyk7XG5cdFx0fSxcblx0XHRnZXRUeXBlT2Y6IGZ1bmN0aW9uIChvYmopIHtcblx0XHRcdGlmICh0eXBlb2Ygb2JqID09PSAndW5kZWZpbmVkJyB8fCBvYmogPT09IG51bGwpXG5cdFx0XHRcdHJldHVybiAnJyArIG9iajtcblx0XHRcdHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKS5yZXBsYWNlKC9eXFxbb2JqZWN0XFxzKC4qKVxcXSQvLCBmdW5jdGlvbiAoJDAsICQxKSB7IHJldHVybiAkMS50b0xvd2VyQ2FzZSgpOyB9KTtcblx0XHR9XG5cdH07XG5cblx0Ly8gQWRkIHNvbWUgaXNUeXBlIG1ldGhvZHM6IGlzQXJndW1lbnRzLCBpc0Jvb2xlYW4sIGlzRnVuY3Rpb24sIGlzU3RyaW5nLCBpc0FycmF5LCBpc051bWJlciwgaXNEYXRlLCBpc1JlZ0V4cCwgaXNVbmRlZmluZWQsIGlzTnVsbC5cblx0dmFyIHR5cGVzID0gWydBcmd1bWVudHMnLCAnQm9vbGVhbicsICdGdW5jdGlvbicsICdTdHJpbmcnLCAnQXJyYXknLCAnTnVtYmVyJywgJ0RhdGUnLCAnUmVnRXhwJywgJ1VuZGVmaW5lZCcsICdOdWxsJ107XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgdHlwZXMubGVuZ3RoOyBpKyspIHtcblx0XHRCYXNpbC51dGlsc1snaXMnICsgdHlwZXNbaV1dID0gKGZ1bmN0aW9uICh0eXBlKSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24gKG9iaikge1xuXHRcdFx0XHRyZXR1cm4gQmFzaWwudXRpbHMuZ2V0VHlwZU9mKG9iaikgPT09IHR5cGUudG9Mb3dlckNhc2UoKTtcblx0XHRcdH07XG5cdFx0fSkodHlwZXNbaV0pO1xuXHR9XG5cblx0Ly8gUGx1Z2luc1xuXHRCYXNpbC5wbHVnaW5zID0ge307XG5cblx0Ly8gT3B0aW9uc1xuXHRCYXNpbC5vcHRpb25zID0gQmFzaWwudXRpbHMuZXh0ZW5kKHtcblx0XHRuYW1lc3BhY2U6ICdiNDVpMScsXG5cdFx0c3RvcmFnZXM6IFsnbG9jYWwnLCAnY29va2llJywgJ3Nlc3Npb24nLCAnbWVtb3J5J10sXG5cdFx0ZXhwaXJlRGF5czogMzY1LFxuXHRcdGtleURlbGltaXRlcjogJy4nXG5cdH0sIHdpbmRvdy5CYXNpbCA/IHdpbmRvdy5CYXNpbC5vcHRpb25zIDoge30pO1xuXG5cdC8vIFN0b3JhZ2Vcblx0QmFzaWwuU3RvcmFnZSA9IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgX3NhbHQgPSAnYjQ1aTEnICsgKE1hdGgucmFuZG9tKCkgKyAxKVxuXHRcdFx0XHQudG9TdHJpbmcoMzYpXG5cdFx0XHRcdC5zdWJzdHJpbmcoNyksXG5cdFx0XHRfc3RvcmFnZXMgPSB7fSxcblx0XHRcdF9pc1ZhbGlkS2V5ID0gZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0XHR2YXIgdHlwZSA9IEJhc2lsLnV0aWxzLmdldFR5cGVPZihrZXkpO1xuXHRcdFx0XHRyZXR1cm4gKHR5cGUgPT09ICdzdHJpbmcnICYmIGtleSkgfHwgdHlwZSA9PT0gJ251bWJlcicgfHwgdHlwZSA9PT0gJ2Jvb2xlYW4nO1xuXHRcdFx0fSxcblx0XHRcdF90b1N0b3JhZ2VzQXJyYXkgPSBmdW5jdGlvbiAoc3RvcmFnZXMpIHtcblx0XHRcdFx0aWYgKEJhc2lsLnV0aWxzLmlzQXJyYXkoc3RvcmFnZXMpKVxuXHRcdFx0XHRcdHJldHVybiBzdG9yYWdlcztcblx0XHRcdFx0cmV0dXJuIEJhc2lsLnV0aWxzLmlzU3RyaW5nKHN0b3JhZ2VzKSA/IFtzdG9yYWdlc10gOiBbXTtcblx0XHRcdH0sXG5cdFx0XHRfdG9TdG9yZWRLZXkgPSBmdW5jdGlvbiAobmFtZXNwYWNlLCBwYXRoLCBkZWxpbWl0ZXIpIHtcblx0XHRcdFx0dmFyIGtleSA9ICcnO1xuXHRcdFx0XHRpZiAoX2lzVmFsaWRLZXkocGF0aCkpIHtcblx0XHRcdFx0XHRrZXkgKz0gcGF0aDtcblx0XHRcdFx0fSBlbHNlIGlmIChCYXNpbC51dGlscy5pc0FycmF5KHBhdGgpKSB7XG5cdFx0XHRcdFx0cGF0aCA9IEJhc2lsLnV0aWxzLmlzRnVuY3Rpb24ocGF0aC5maWx0ZXIpID8gcGF0aC5maWx0ZXIoX2lzVmFsaWRLZXkpIDogcGF0aDtcblx0XHRcdFx0XHRrZXkgPSBwYXRoLmpvaW4oZGVsaW1pdGVyKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4ga2V5ICYmIF9pc1ZhbGlkS2V5KG5hbWVzcGFjZSkgPyBuYW1lc3BhY2UgKyBkZWxpbWl0ZXIgKyBrZXkgOiBrZXk7XG4gXHRcdFx0fSxcblx0XHRcdF90b0tleU5hbWUgPSBmdW5jdGlvbiAobmFtZXNwYWNlLCBrZXksIGRlbGltaXRlcikge1xuXHRcdFx0XHRpZiAoIV9pc1ZhbGlkS2V5KG5hbWVzcGFjZSkpXG5cdFx0XHRcdFx0cmV0dXJuIGtleTtcblx0XHRcdFx0cmV0dXJuIGtleS5yZXBsYWNlKG5ldyBSZWdFeHAoJ14nICsgbmFtZXNwYWNlICsgZGVsaW1pdGVyKSwgJycpO1xuXHRcdFx0fSxcblx0XHRcdF90b1N0b3JlZFZhbHVlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG5cdFx0XHRcdHJldHVybiBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG5cdFx0XHR9LFxuXHRcdFx0X2Zyb21TdG9yZWRWYWx1ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuXHRcdFx0XHRyZXR1cm4gdmFsdWUgPyBKU09OLnBhcnNlKHZhbHVlKSA6IG51bGw7XG5cdFx0XHR9O1xuXG5cdFx0Ly8gSFRNTDUgd2ViIHN0b3JhZ2UgaW50ZXJmYWNlXG5cdFx0dmFyIHdlYlN0b3JhZ2VJbnRlcmZhY2UgPSB7XG5cdFx0XHRlbmdpbmU6IG51bGwsXG5cdFx0XHRjaGVjazogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdHdpbmRvd1t0aGlzLmVuZ2luZV0uc2V0SXRlbShfc2FsdCwgdHJ1ZSk7XG5cdFx0XHRcdFx0d2luZG93W3RoaXMuZW5naW5lXS5yZW1vdmVJdGVtKF9zYWx0KTtcblx0XHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH0sXG5cdFx0XHRzZXQ6IGZ1bmN0aW9uIChrZXksIHZhbHVlLCBvcHRpb25zKSB7XG5cdFx0XHRcdGlmICgha2V5KVxuXHRcdFx0XHRcdHRocm93IEVycm9yKCdpbnZhbGlkIGtleScpO1xuXHRcdFx0XHR3aW5kb3dbdGhpcy5lbmdpbmVdLnNldEl0ZW0oa2V5LCB2YWx1ZSk7XG5cdFx0XHR9LFxuXHRcdFx0Z2V0OiBmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHRcdHJldHVybiB3aW5kb3dbdGhpcy5lbmdpbmVdLmdldEl0ZW0oa2V5KTtcblx0XHRcdH0sXG5cdFx0XHRyZW1vdmU6IGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdFx0d2luZG93W3RoaXMuZW5naW5lXS5yZW1vdmVJdGVtKGtleSk7XG5cdFx0XHR9LFxuXHRcdFx0cmVzZXQ6IGZ1bmN0aW9uIChuYW1lc3BhY2UpIHtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDAsIGtleTsgaSA8IHdpbmRvd1t0aGlzLmVuZ2luZV0ubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRrZXkgPSB3aW5kb3dbdGhpcy5lbmdpbmVdLmtleShpKTtcblx0XHRcdFx0XHRpZiAoIW5hbWVzcGFjZSB8fCBrZXkuaW5kZXhPZihuYW1lc3BhY2UpID09PSAwKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnJlbW92ZShrZXkpO1xuXHRcdFx0XHRcdFx0aS0tO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdGtleXM6IGZ1bmN0aW9uIChuYW1lc3BhY2UsIGRlbGltaXRlcikge1xuXHRcdFx0XHR2YXIga2V5cyA9IFtdO1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMCwga2V5OyBpIDwgd2luZG93W3RoaXMuZW5naW5lXS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdGtleSA9IHdpbmRvd1t0aGlzLmVuZ2luZV0ua2V5KGkpO1xuXHRcdFx0XHRcdGlmICghbmFtZXNwYWNlIHx8IGtleS5pbmRleE9mKG5hbWVzcGFjZSkgPT09IDApXG5cdFx0XHRcdFx0XHRrZXlzLnB1c2goX3RvS2V5TmFtZShuYW1lc3BhY2UsIGtleSwgZGVsaW1pdGVyKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIGtleXM7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdC8vIGxvY2FsIHN0b3JhZ2Vcblx0XHRfc3RvcmFnZXMubG9jYWwgPSBCYXNpbC51dGlscy5leHRlbmQoe30sIHdlYlN0b3JhZ2VJbnRlcmZhY2UsIHtcblx0XHRcdGVuZ2luZTogJ2xvY2FsU3RvcmFnZSdcblx0XHR9KTtcblx0XHQvLyBzZXNzaW9uIHN0b3JhZ2Vcblx0XHRfc3RvcmFnZXMuc2Vzc2lvbiA9IEJhc2lsLnV0aWxzLmV4dGVuZCh7fSwgd2ViU3RvcmFnZUludGVyZmFjZSwge1xuXHRcdFx0ZW5naW5lOiAnc2Vzc2lvblN0b3JhZ2UnXG5cdFx0fSk7XG5cblx0XHQvLyBtZW1vcnkgc3RvcmFnZVxuXHRcdF9zdG9yYWdlcy5tZW1vcnkgPSB7XG5cdFx0XHRfaGFzaDoge30sXG5cdFx0XHRjaGVjazogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH0sXG5cdFx0XHRzZXQ6IGZ1bmN0aW9uIChrZXksIHZhbHVlLCBvcHRpb25zKSB7XG5cdFx0XHRcdGlmICgha2V5KVxuXHRcdFx0XHRcdHRocm93IEVycm9yKCdpbnZhbGlkIGtleScpO1xuXHRcdFx0XHR0aGlzLl9oYXNoW2tleV0gPSB2YWx1ZTtcblx0XHRcdH0sXG5cdFx0XHRnZXQ6IGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuX2hhc2hba2V5XSB8fCBudWxsO1xuXHRcdFx0fSxcblx0XHRcdHJlbW92ZTogZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0XHRkZWxldGUgdGhpcy5faGFzaFtrZXldO1xuXHRcdFx0fSxcblx0XHRcdHJlc2V0OiBmdW5jdGlvbiAobmFtZXNwYWNlKSB7XG5cdFx0XHRcdGZvciAodmFyIGtleSBpbiB0aGlzLl9oYXNoKSB7XG5cdFx0XHRcdFx0aWYgKCFuYW1lc3BhY2UgfHwga2V5LmluZGV4T2YobmFtZXNwYWNlKSA9PT0gMClcblx0XHRcdFx0XHRcdHRoaXMucmVtb3ZlKGtleSk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRrZXlzOiBmdW5jdGlvbiAobmFtZXNwYWNlLCBkZWxpbWl0ZXIpIHtcblx0XHRcdFx0dmFyIGtleXMgPSBbXTtcblx0XHRcdFx0Zm9yICh2YXIga2V5IGluIHRoaXMuX2hhc2gpXG5cdFx0XHRcdFx0aWYgKCFuYW1lc3BhY2UgfHwga2V5LmluZGV4T2YobmFtZXNwYWNlKSA9PT0gMClcblx0XHRcdFx0XHRcdGtleXMucHVzaChfdG9LZXlOYW1lKG5hbWVzcGFjZSwga2V5LCBkZWxpbWl0ZXIpKTtcblx0XHRcdFx0cmV0dXJuIGtleXM7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdC8vIGNvb2tpZSBzdG9yYWdlXG5cdFx0X3N0b3JhZ2VzLmNvb2tpZSA9IHtcblx0XHRcdGNoZWNrOiBmdW5jdGlvbiAob3B0aW9ucykge1xuXHRcdFx0XHRpZiAoIW5hdmlnYXRvci5jb29raWVFbmFibGVkKVxuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0aWYgKHdpbmRvdy5zZWxmICE9PSB3aW5kb3cudG9wKSB7XG5cdFx0XHRcdFx0Ly8gd2UgbmVlZCB0byBjaGVjayB0aGlyZC1wYXJ0eSBjb29raWVzO1xuXHRcdFx0XHRcdHZhciBjb29raWUgPSAndGhpcmRwYXJ0eS5jaGVjaz0nICsgTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogMTAwMCk7XG5cdFx0XHRcdFx0ZG9jdW1lbnQuY29va2llID0gY29va2llICsgJzsgcGF0aD0vJztcblx0XHRcdFx0XHRyZXR1cm4gZG9jdW1lbnQuY29va2llLmluZGV4T2YoY29va2llKSAhPT0gLTE7XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gaWYgY29va2llIHNlY3VyZSBhY3RpdmF0ZWQsIGVuc3VyZSBpdCB3b3JrcyAobm90IHRoZSBjYXNlIGlmIHdlIGFyZSBpbiBodHRwIG9ubHkpXG5cdFx0XHRcdGlmIChvcHRpb25zICYmIG9wdGlvbnMuc2VjdXJlKSB7XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdHRoaXMuc2V0KF9zYWx0LCBfc2FsdCwgb3B0aW9ucyk7XG5cdFx0XHRcdFx0XHR2YXIgaGFzU2VjdXJlbHlQZXJzaXRlZCA9IHRoaXMuZ2V0KF9zYWx0KSA9PT0gX3NhbHQ7XG5cdFx0XHRcdFx0XHR0aGlzLnJlbW92ZShfc2FsdCk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gaGFzU2VjdXJlbHlQZXJzaXRlZDtcblx0XHRcdFx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH0sXG5cdFx0XHRzZXQ6IGZ1bmN0aW9uIChrZXksIHZhbHVlLCBvcHRpb25zKSB7XG5cdFx0XHRcdGlmICghdGhpcy5jaGVjaygpKVxuXHRcdFx0XHRcdHRocm93IEVycm9yKCdjb29raWVzIGFyZSBkaXNhYmxlZCcpO1xuXHRcdFx0XHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0XHRcdFx0aWYgKCFrZXkpXG5cdFx0XHRcdFx0dGhyb3cgRXJyb3IoJ2ludmFsaWQga2V5Jyk7XG5cdFx0XHRcdHZhciBjb29raWUgPSBlbmNvZGVVUklDb21wb25lbnQoa2V5KSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSk7XG5cdFx0XHRcdC8vIGhhbmRsZSBleHBpcmF0aW9uIGRheXNcblx0XHRcdFx0aWYgKG9wdGlvbnMuZXhwaXJlRGF5cykge1xuXHRcdFx0XHRcdHZhciBkYXRlID0gbmV3IERhdGUoKTtcblx0XHRcdFx0XHRkYXRlLnNldFRpbWUoZGF0ZS5nZXRUaW1lKCkgKyAob3B0aW9ucy5leHBpcmVEYXlzICogMjQgKiA2MCAqIDYwICogMTAwMCkpO1xuXHRcdFx0XHRcdGNvb2tpZSArPSAnOyBleHBpcmVzPScgKyBkYXRlLnRvR01UU3RyaW5nKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gaGFuZGxlIGRvbWFpblxuXHRcdFx0XHRpZiAob3B0aW9ucy5kb21haW4gJiYgb3B0aW9ucy5kb21haW4gIT09IGRvY3VtZW50LmRvbWFpbikge1xuXHRcdFx0XHRcdHZhciBfZG9tYWluID0gb3B0aW9ucy5kb21haW4ucmVwbGFjZSgvXlxcLi8sICcnKTtcblx0XHRcdFx0XHRpZiAoZG9jdW1lbnQuZG9tYWluLmluZGV4T2YoX2RvbWFpbikgPT09IC0xIHx8IF9kb21haW4uc3BsaXQoJy4nKS5sZW5ndGggPD0gMSlcblx0XHRcdFx0XHRcdHRocm93IEVycm9yKCdpbnZhbGlkIGRvbWFpbicpO1xuXHRcdFx0XHRcdGNvb2tpZSArPSAnOyBkb21haW49JyArIG9wdGlvbnMuZG9tYWluO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIGhhbmRsZSBzZWN1cmVcblx0XHRcdFx0aWYgKG9wdGlvbnMuc2VjdXJlID09PSB0cnVlKSB7XG5cdFx0XHRcdFx0Y29va2llICs9ICc7IFNlY3VyZSc7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZG9jdW1lbnQuY29va2llID0gY29va2llICsgJzsgcGF0aD0vJztcblx0XHRcdH0sXG5cdFx0XHRnZXQ6IGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdFx0aWYgKCF0aGlzLmNoZWNrKCkpXG5cdFx0XHRcdFx0dGhyb3cgRXJyb3IoJ2Nvb2tpZXMgYXJlIGRpc2FibGVkJyk7XG5cdFx0XHRcdHZhciBlbmNvZGVkS2V5ID0gZW5jb2RlVVJJQ29tcG9uZW50KGtleSk7XG5cdFx0XHRcdHZhciBjb29raWVzID0gZG9jdW1lbnQuY29va2llID8gZG9jdW1lbnQuY29va2llLnNwbGl0KCc7JykgOiBbXTtcblx0XHRcdFx0Ly8gcmV0cmlldmUgbGFzdCB1cGRhdGVkIGNvb2tpZSBmaXJzdFxuXHRcdFx0XHRmb3IgKHZhciBpID0gY29va2llcy5sZW5ndGggLSAxLCBjb29raWU7IGkgPj0gMDsgaS0tKSB7XG5cdFx0XHRcdFx0Y29va2llID0gY29va2llc1tpXS5yZXBsYWNlKC9eXFxzKi8sICcnKTtcblx0XHRcdFx0XHRpZiAoY29va2llLmluZGV4T2YoZW5jb2RlZEtleSArICc9JykgPT09IDApXG5cdFx0XHRcdFx0XHRyZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KGNvb2tpZS5zdWJzdHJpbmcoZW5jb2RlZEtleS5sZW5ndGggKyAxLCBjb29raWUubGVuZ3RoKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHR9LFxuXHRcdFx0cmVtb3ZlOiBmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHRcdC8vIHJlbW92ZSBjb29raWUgZnJvbSBtYWluIGRvbWFpblxuXHRcdFx0XHR0aGlzLnNldChrZXksICcnLCB7IGV4cGlyZURheXM6IC0xIH0pO1xuXHRcdFx0XHQvLyByZW1vdmUgY29va2llIGZyb20gdXBwZXIgZG9tYWluc1xuXHRcdFx0XHR2YXIgZG9tYWluUGFydHMgPSBkb2N1bWVudC5kb21haW4uc3BsaXQoJy4nKTtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IGRvbWFpblBhcnRzLmxlbmd0aDsgaSA+IDE7IGktLSkge1xuXHRcdFx0XHRcdHRoaXMuc2V0KGtleSwgJycsIHsgZXhwaXJlRGF5czogLTEsIGRvbWFpbjogJy4nICsgZG9tYWluUGFydHMuc2xpY2UoLSBpKS5qb2luKCcuJykgfSk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRyZXNldDogZnVuY3Rpb24gKG5hbWVzcGFjZSkge1xuXHRcdFx0XHR2YXIgY29va2llcyA9IGRvY3VtZW50LmNvb2tpZSA/IGRvY3VtZW50LmNvb2tpZS5zcGxpdCgnOycpIDogW107XG5cdFx0XHRcdGZvciAodmFyIGkgPSAwLCBjb29raWUsIGtleTsgaSA8IGNvb2tpZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRjb29raWUgPSBjb29raWVzW2ldLnJlcGxhY2UoL15cXHMqLywgJycpO1xuXHRcdFx0XHRcdGtleSA9IGNvb2tpZS5zdWJzdHIoMCwgY29va2llLmluZGV4T2YoJz0nKSk7XG5cdFx0XHRcdFx0aWYgKCFuYW1lc3BhY2UgfHwga2V5LmluZGV4T2YobmFtZXNwYWNlKSA9PT0gMClcblx0XHRcdFx0XHRcdHRoaXMucmVtb3ZlKGtleSk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRrZXlzOiBmdW5jdGlvbiAobmFtZXNwYWNlLCBkZWxpbWl0ZXIpIHtcblx0XHRcdFx0aWYgKCF0aGlzLmNoZWNrKCkpXG5cdFx0XHRcdFx0dGhyb3cgRXJyb3IoJ2Nvb2tpZXMgYXJlIGRpc2FibGVkJyk7XG5cdFx0XHRcdHZhciBrZXlzID0gW10sXG5cdFx0XHRcdFx0Y29va2llcyA9IGRvY3VtZW50LmNvb2tpZSA/IGRvY3VtZW50LmNvb2tpZS5zcGxpdCgnOycpIDogW107XG5cdFx0XHRcdGZvciAodmFyIGkgPSAwLCBjb29raWUsIGtleTsgaSA8IGNvb2tpZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRjb29raWUgPSBjb29raWVzW2ldLnJlcGxhY2UoL15cXHMqLywgJycpO1xuXHRcdFx0XHRcdGtleSA9IGRlY29kZVVSSUNvbXBvbmVudChjb29raWUuc3Vic3RyKDAsIGNvb2tpZS5pbmRleE9mKCc9JykpKTtcblx0XHRcdFx0XHRpZiAoIW5hbWVzcGFjZSB8fCBrZXkuaW5kZXhPZihuYW1lc3BhY2UpID09PSAwKVxuXHRcdFx0XHRcdFx0a2V5cy5wdXNoKF90b0tleU5hbWUobmFtZXNwYWNlLCBrZXksIGRlbGltaXRlcikpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBrZXlzO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0aW5pdDogZnVuY3Rpb24gKG9wdGlvbnMpIHtcblx0XHRcdFx0dGhpcy5zZXRPcHRpb25zKG9wdGlvbnMpO1xuXHRcdFx0XHRyZXR1cm4gdGhpcztcblx0XHRcdH0sXG5cdFx0XHRzZXRPcHRpb25zOiBmdW5jdGlvbiAob3B0aW9ucykge1xuXHRcdFx0XHR0aGlzLm9wdGlvbnMgPSBCYXNpbC51dGlscy5leHRlbmQoe30sIHRoaXMub3B0aW9ucyB8fCBCYXNpbC5vcHRpb25zLCBvcHRpb25zKTtcblx0XHRcdH0sXG5cdFx0XHRzdXBwb3J0OiBmdW5jdGlvbiAoc3RvcmFnZSkge1xuXHRcdFx0XHRyZXR1cm4gX3N0b3JhZ2VzLmhhc093blByb3BlcnR5KHN0b3JhZ2UpO1xuXHRcdFx0fSxcblx0XHRcdGNoZWNrOiBmdW5jdGlvbiAoc3RvcmFnZSkge1xuXHRcdFx0XHRpZiAodGhpcy5zdXBwb3J0KHN0b3JhZ2UpKVxuXHRcdFx0XHRcdHJldHVybiBfc3RvcmFnZXNbc3RvcmFnZV0uY2hlY2sodGhpcy5vcHRpb25zKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fSxcblx0XHRcdHNldDogZnVuY3Rpb24gKGtleSwgdmFsdWUsIG9wdGlvbnMpIHtcblx0XHRcdFx0b3B0aW9ucyA9IEJhc2lsLnV0aWxzLmV4dGVuZCh7fSwgdGhpcy5vcHRpb25zLCBvcHRpb25zKTtcblx0XHRcdFx0aWYgKCEoa2V5ID0gX3RvU3RvcmVkS2V5KG9wdGlvbnMubmFtZXNwYWNlLCBrZXksIG9wdGlvbnMua2V5RGVsaW1pdGVyKSkpXG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR2YWx1ZSA9IG9wdGlvbnMucmF3ID09PSB0cnVlID8gdmFsdWUgOiBfdG9TdG9yZWRWYWx1ZSh2YWx1ZSk7XG5cdFx0XHRcdHZhciB3aGVyZSA9IG51bGw7XG5cdFx0XHRcdC8vIHRyeSB0byBzZXQga2V5L3ZhbHVlIGluIGZpcnN0IGF2YWlsYWJsZSBzdG9yYWdlXG5cdFx0XHRcdEJhc2lsLnV0aWxzLnRyeUVhY2goX3RvU3RvcmFnZXNBcnJheShvcHRpb25zLnN0b3JhZ2VzKSwgZnVuY3Rpb24gKHN0b3JhZ2UsIGluZGV4KSB7XG5cdFx0XHRcdFx0X3N0b3JhZ2VzW3N0b3JhZ2VdLnNldChrZXksIHZhbHVlLCBvcHRpb25zKTtcblx0XHRcdFx0XHR3aGVyZSA9IHN0b3JhZ2U7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlOyAvLyBicmVhaztcblx0XHRcdFx0fSwgbnVsbCwgdGhpcyk7XG5cdFx0XHRcdGlmICghd2hlcmUpIHtcblx0XHRcdFx0XHQvLyBrZXkgaGFzIG5vdCBiZWVuIHNldCBhbnl3aGVyZVxuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyByZW1vdmUga2V5IGZyb20gYWxsIG90aGVyIHN0b3JhZ2VzXG5cdFx0XHRcdEJhc2lsLnV0aWxzLnRyeUVhY2goX3RvU3RvcmFnZXNBcnJheShvcHRpb25zLnN0b3JhZ2VzKSwgZnVuY3Rpb24gKHN0b3JhZ2UsIGluZGV4KSB7XG5cdFx0XHRcdFx0aWYgKHN0b3JhZ2UgIT09IHdoZXJlKVxuXHRcdFx0XHRcdFx0X3N0b3JhZ2VzW3N0b3JhZ2VdLnJlbW92ZShrZXkpO1xuXHRcdFx0XHR9LCBudWxsLCB0aGlzKTtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9LFxuXHRcdFx0Z2V0OiBmdW5jdGlvbiAoa2V5LCBvcHRpb25zKSB7XG5cdFx0XHRcdG9wdGlvbnMgPSBCYXNpbC51dGlscy5leHRlbmQoe30sIHRoaXMub3B0aW9ucywgb3B0aW9ucyk7XG5cdFx0XHRcdGlmICghKGtleSA9IF90b1N0b3JlZEtleShvcHRpb25zLm5hbWVzcGFjZSwga2V5LCBvcHRpb25zLmtleURlbGltaXRlcikpKVxuXHRcdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0XHR2YXIgdmFsdWUgPSBudWxsO1xuXHRcdFx0XHRCYXNpbC51dGlscy50cnlFYWNoKF90b1N0b3JhZ2VzQXJyYXkob3B0aW9ucy5zdG9yYWdlcyksIGZ1bmN0aW9uIChzdG9yYWdlLCBpbmRleCkge1xuXHRcdFx0XHRcdGlmICh2YWx1ZSAhPT0gbnVsbClcblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTsgLy8gYnJlYWsgaWYgYSB2YWx1ZSBoYXMgYWxyZWFkeSBiZWVuIGZvdW5kLlxuXHRcdFx0XHRcdHZhbHVlID0gX3N0b3JhZ2VzW3N0b3JhZ2VdLmdldChrZXksIG9wdGlvbnMpIHx8IG51bGw7XG5cdFx0XHRcdFx0dmFsdWUgPSBvcHRpb25zLnJhdyA9PT0gdHJ1ZSA/IHZhbHVlIDogX2Zyb21TdG9yZWRWYWx1ZSh2YWx1ZSk7XG5cdFx0XHRcdH0sIGZ1bmN0aW9uIChzdG9yYWdlLCBpbmRleCwgZXJyb3IpIHtcblx0XHRcdFx0XHR2YWx1ZSA9IG51bGw7XG5cdFx0XHRcdH0sIHRoaXMpO1xuXHRcdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0XHR9LFxuXHRcdFx0cmVtb3ZlOiBmdW5jdGlvbiAoa2V5LCBvcHRpb25zKSB7XG5cdFx0XHRcdG9wdGlvbnMgPSBCYXNpbC51dGlscy5leHRlbmQoe30sIHRoaXMub3B0aW9ucywgb3B0aW9ucyk7XG5cdFx0XHRcdGlmICghKGtleSA9IF90b1N0b3JlZEtleShvcHRpb25zLm5hbWVzcGFjZSwga2V5LCBvcHRpb25zLmtleURlbGltaXRlcikpKVxuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0QmFzaWwudXRpbHMudHJ5RWFjaChfdG9TdG9yYWdlc0FycmF5KG9wdGlvbnMuc3RvcmFnZXMpLCBmdW5jdGlvbiAoc3RvcmFnZSkge1xuXHRcdFx0XHRcdF9zdG9yYWdlc1tzdG9yYWdlXS5yZW1vdmUoa2V5KTtcblx0XHRcdFx0fSwgbnVsbCwgdGhpcyk7XG5cdFx0XHR9LFxuXHRcdFx0cmVzZXQ6IGZ1bmN0aW9uIChvcHRpb25zKSB7XG5cdFx0XHRcdG9wdGlvbnMgPSBCYXNpbC51dGlscy5leHRlbmQoe30sIHRoaXMub3B0aW9ucywgb3B0aW9ucyk7XG5cdFx0XHRcdEJhc2lsLnV0aWxzLnRyeUVhY2goX3RvU3RvcmFnZXNBcnJheShvcHRpb25zLnN0b3JhZ2VzKSwgZnVuY3Rpb24gKHN0b3JhZ2UpIHtcblx0XHRcdFx0XHRfc3RvcmFnZXNbc3RvcmFnZV0ucmVzZXQob3B0aW9ucy5uYW1lc3BhY2UpO1xuXHRcdFx0XHR9LCBudWxsLCB0aGlzKTtcblx0XHRcdH0sXG5cdFx0XHRrZXlzOiBmdW5jdGlvbiAob3B0aW9ucykge1xuXHRcdFx0XHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0XHRcdFx0dmFyIGtleXMgPSBbXTtcblx0XHRcdFx0Zm9yICh2YXIga2V5IGluIHRoaXMua2V5c01hcChvcHRpb25zKSlcblx0XHRcdFx0XHRrZXlzLnB1c2goa2V5KTtcblx0XHRcdFx0cmV0dXJuIGtleXM7XG5cdFx0XHR9LFxuXHRcdFx0a2V5c01hcDogZnVuY3Rpb24gKG9wdGlvbnMpIHtcblx0XHRcdFx0b3B0aW9ucyA9IEJhc2lsLnV0aWxzLmV4dGVuZCh7fSwgdGhpcy5vcHRpb25zLCBvcHRpb25zKTtcblx0XHRcdFx0dmFyIG1hcCA9IHt9O1xuXHRcdFx0XHRCYXNpbC51dGlscy50cnlFYWNoKF90b1N0b3JhZ2VzQXJyYXkob3B0aW9ucy5zdG9yYWdlcyksIGZ1bmN0aW9uIChzdG9yYWdlKSB7XG5cdFx0XHRcdFx0QmFzaWwudXRpbHMuZWFjaChfc3RvcmFnZXNbc3RvcmFnZV0ua2V5cyhvcHRpb25zLm5hbWVzcGFjZSwgb3B0aW9ucy5rZXlEZWxpbWl0ZXIpLCBmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHRcdFx0XHRtYXBba2V5XSA9IEJhc2lsLnV0aWxzLmlzQXJyYXkobWFwW2tleV0pID8gbWFwW2tleV0gOiBbXTtcblx0XHRcdFx0XHRcdG1hcFtrZXldLnB1c2goc3RvcmFnZSk7XG5cdFx0XHRcdFx0fSwgdGhpcyk7XG5cdFx0XHRcdH0sIG51bGwsIHRoaXMpO1xuXHRcdFx0XHRyZXR1cm4gbWFwO1xuXHRcdFx0fVxuXHRcdH07XG5cdH07XG5cblx0Ly8gQWNjZXNzIHRvIG5hdGl2ZSBzdG9yYWdlcywgd2l0aG91dCBuYW1lc3BhY2Ugb3IgYmFzaWwgdmFsdWUgZGVjb3JhdGlvblxuXHRCYXNpbC5tZW1vcnkgPSBuZXcgQmFzaWwuU3RvcmFnZSgpLmluaXQoeyBzdG9yYWdlczogJ21lbW9yeScsIG5hbWVzcGFjZTogbnVsbCwgcmF3OiB0cnVlIH0pO1xuXHRCYXNpbC5jb29raWUgPSBuZXcgQmFzaWwuU3RvcmFnZSgpLmluaXQoeyBzdG9yYWdlczogJ2Nvb2tpZScsIG5hbWVzcGFjZTogbnVsbCwgcmF3OiB0cnVlIH0pO1xuXHRCYXNpbC5sb2NhbFN0b3JhZ2UgPSBuZXcgQmFzaWwuU3RvcmFnZSgpLmluaXQoeyBzdG9yYWdlczogJ2xvY2FsJywgbmFtZXNwYWNlOiBudWxsLCByYXc6IHRydWUgfSk7XG5cdEJhc2lsLnNlc3Npb25TdG9yYWdlID0gbmV3IEJhc2lsLlN0b3JhZ2UoKS5pbml0KHsgc3RvcmFnZXM6ICdzZXNzaW9uJywgbmFtZXNwYWNlOiBudWxsLCByYXc6IHRydWUgfSk7XG5cblx0Ly8gYnJvd3NlciBleHBvcnRcblx0d2luZG93LkJhc2lsID0gQmFzaWw7XG5cblx0Ly8gQU1EIGV4cG9ydFxuXHRpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG5cdFx0ZGVmaW5lKGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIEJhc2lsO1xuXHRcdH0pO1xuXHQvLyBjb21tb25qcyBleHBvcnRcblx0fSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuXHRcdG1vZHVsZS5leHBvcnRzID0gQmFzaWw7XG5cdH1cblxufSkoKTtcbiIsIjsoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYgKHR5cGVvZiBleHBvcnRzID09PSBcIm9iamVjdFwiKSB7XG5cdFx0Ly8gQ29tbW9uSlNcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdH1cblx0ZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcblx0XHQvLyBBTURcblx0XHRkZWZpbmUoW10sIGZhY3RvcnkpO1xuXHR9XG5cdGVsc2Uge1xuXHRcdC8vIEdsb2JhbCAoYnJvd3Nlcilcblx0XHRyb290LkNyeXB0b0pTID0gZmFjdG9yeSgpO1xuXHR9XG59KHRoaXMsIGZ1bmN0aW9uICgpIHtcblxuXHQvKipcblx0ICogQ3J5cHRvSlMgY29yZSBjb21wb25lbnRzLlxuXHQgKi9cblx0dmFyIENyeXB0b0pTID0gQ3J5cHRvSlMgfHwgKGZ1bmN0aW9uIChNYXRoLCB1bmRlZmluZWQpIHtcblx0ICAgIC8qXG5cdCAgICAgKiBMb2NhbCBwb2x5ZmlsIG9mIE9iamVjdC5jcmVhdGVcblx0ICAgICAqL1xuXHQgICAgdmFyIGNyZWF0ZSA9IE9iamVjdC5jcmVhdGUgfHwgKGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICBmdW5jdGlvbiBGKCkge307XG5cblx0ICAgICAgICByZXR1cm4gZnVuY3Rpb24gKG9iaikge1xuXHQgICAgICAgICAgICB2YXIgc3VidHlwZTtcblxuXHQgICAgICAgICAgICBGLnByb3RvdHlwZSA9IG9iajtcblxuXHQgICAgICAgICAgICBzdWJ0eXBlID0gbmV3IEYoKTtcblxuXHQgICAgICAgICAgICBGLnByb3RvdHlwZSA9IG51bGw7XG5cblx0ICAgICAgICAgICAgcmV0dXJuIHN1YnR5cGU7XG5cdCAgICAgICAgfTtcblx0ICAgIH0oKSlcblxuXHQgICAgLyoqXG5cdCAgICAgKiBDcnlwdG9KUyBuYW1lc3BhY2UuXG5cdCAgICAgKi9cblx0ICAgIHZhciBDID0ge307XG5cblx0ICAgIC8qKlxuXHQgICAgICogTGlicmFyeSBuYW1lc3BhY2UuXG5cdCAgICAgKi9cblx0ICAgIHZhciBDX2xpYiA9IEMubGliID0ge307XG5cblx0ICAgIC8qKlxuXHQgICAgICogQmFzZSBvYmplY3QgZm9yIHByb3RvdHlwYWwgaW5oZXJpdGFuY2UuXG5cdCAgICAgKi9cblx0ICAgIHZhciBCYXNlID0gQ19saWIuQmFzZSA9IChmdW5jdGlvbiAoKSB7XG5cblxuXHQgICAgICAgIHJldHVybiB7XG5cdCAgICAgICAgICAgIC8qKlxuXHQgICAgICAgICAgICAgKiBDcmVhdGVzIGEgbmV3IG9iamVjdCB0aGF0IGluaGVyaXRzIGZyb20gdGhpcyBvYmplY3QuXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvdmVycmlkZXMgUHJvcGVydGllcyB0byBjb3B5IGludG8gdGhlIG5ldyBvYmplY3QuXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqIEByZXR1cm4ge09iamVjdH0gVGhlIG5ldyBvYmplY3QuXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqIEBzdGF0aWNcblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogICAgIHZhciBNeVR5cGUgPSBDcnlwdG9KUy5saWIuQmFzZS5leHRlbmQoe1xuXHQgICAgICAgICAgICAgKiAgICAgICAgIGZpZWxkOiAndmFsdWUnLFxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiAgICAgICAgIG1ldGhvZDogZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICAgKiAgICAgICAgIH1cblx0ICAgICAgICAgICAgICogICAgIH0pO1xuXHQgICAgICAgICAgICAgKi9cblx0ICAgICAgICAgICAgZXh0ZW5kOiBmdW5jdGlvbiAob3ZlcnJpZGVzKSB7XG5cdCAgICAgICAgICAgICAgICAvLyBTcGF3blxuXHQgICAgICAgICAgICAgICAgdmFyIHN1YnR5cGUgPSBjcmVhdGUodGhpcyk7XG5cblx0ICAgICAgICAgICAgICAgIC8vIEF1Z21lbnRcblx0ICAgICAgICAgICAgICAgIGlmIChvdmVycmlkZXMpIHtcblx0ICAgICAgICAgICAgICAgICAgICBzdWJ0eXBlLm1peEluKG92ZXJyaWRlcyk7XG5cdCAgICAgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBkZWZhdWx0IGluaXRpYWxpemVyXG5cdCAgICAgICAgICAgICAgICBpZiAoIXN1YnR5cGUuaGFzT3duUHJvcGVydHkoJ2luaXQnKSB8fCB0aGlzLmluaXQgPT09IHN1YnR5cGUuaW5pdCkge1xuXHQgICAgICAgICAgICAgICAgICAgIHN1YnR5cGUuaW5pdCA9IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgc3VidHlwZS4kc3VwZXIuaW5pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHQgICAgICAgICAgICAgICAgICAgIH07XG5cdCAgICAgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgICAgIC8vIEluaXRpYWxpemVyJ3MgcHJvdG90eXBlIGlzIHRoZSBzdWJ0eXBlIG9iamVjdFxuXHQgICAgICAgICAgICAgICAgc3VidHlwZS5pbml0LnByb3RvdHlwZSA9IHN1YnR5cGU7XG5cblx0ICAgICAgICAgICAgICAgIC8vIFJlZmVyZW5jZSBzdXBlcnR5cGVcblx0ICAgICAgICAgICAgICAgIHN1YnR5cGUuJHN1cGVyID0gdGhpcztcblxuXHQgICAgICAgICAgICAgICAgcmV0dXJuIHN1YnR5cGU7XG5cdCAgICAgICAgICAgIH0sXG5cblx0ICAgICAgICAgICAgLyoqXG5cdCAgICAgICAgICAgICAqIEV4dGVuZHMgdGhpcyBvYmplY3QgYW5kIHJ1bnMgdGhlIGluaXQgbWV0aG9kLlxuXHQgICAgICAgICAgICAgKiBBcmd1bWVudHMgdG8gY3JlYXRlKCkgd2lsbCBiZSBwYXNzZWQgdG8gaW5pdCgpLlxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBuZXcgb2JqZWN0LlxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiBAc3RhdGljXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqICAgICB2YXIgaW5zdGFuY2UgPSBNeVR5cGUuY3JlYXRlKCk7XG5cdCAgICAgICAgICAgICAqL1xuXHQgICAgICAgICAgICBjcmVhdGU6IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgICAgIHZhciBpbnN0YW5jZSA9IHRoaXMuZXh0ZW5kKCk7XG5cdCAgICAgICAgICAgICAgICBpbnN0YW5jZS5pbml0LmFwcGx5KGluc3RhbmNlLCBhcmd1bWVudHMpO1xuXG5cdCAgICAgICAgICAgICAgICByZXR1cm4gaW5zdGFuY2U7XG5cdCAgICAgICAgICAgIH0sXG5cblx0ICAgICAgICAgICAgLyoqXG5cdCAgICAgICAgICAgICAqIEluaXRpYWxpemVzIGEgbmV3bHkgY3JlYXRlZCBvYmplY3QuXG5cdCAgICAgICAgICAgICAqIE92ZXJyaWRlIHRoaXMgbWV0aG9kIHRvIGFkZCBzb21lIGxvZ2ljIHdoZW4geW91ciBvYmplY3RzIGFyZSBjcmVhdGVkLlxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiAgICAgdmFyIE15VHlwZSA9IENyeXB0b0pTLmxpYi5CYXNlLmV4dGVuZCh7XG5cdCAgICAgICAgICAgICAqICAgICAgICAgaW5pdDogZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICAgKiAgICAgICAgICAgICAvLyAuLi5cblx0ICAgICAgICAgICAgICogICAgICAgICB9XG5cdCAgICAgICAgICAgICAqICAgICB9KTtcblx0ICAgICAgICAgICAgICovXG5cdCAgICAgICAgICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgfSxcblxuXHQgICAgICAgICAgICAvKipcblx0ICAgICAgICAgICAgICogQ29waWVzIHByb3BlcnRpZXMgaW50byB0aGlzIG9iamVjdC5cblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IHByb3BlcnRpZXMgVGhlIHByb3BlcnRpZXMgdG8gbWl4IGluLlxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiAgICAgTXlUeXBlLm1peEluKHtcblx0ICAgICAgICAgICAgICogICAgICAgICBmaWVsZDogJ3ZhbHVlJ1xuXHQgICAgICAgICAgICAgKiAgICAgfSk7XG5cdCAgICAgICAgICAgICAqL1xuXHQgICAgICAgICAgICBtaXhJbjogZnVuY3Rpb24gKHByb3BlcnRpZXMpIHtcblx0ICAgICAgICAgICAgICAgIGZvciAodmFyIHByb3BlcnR5TmFtZSBpbiBwcm9wZXJ0aWVzKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgaWYgKHByb3BlcnRpZXMuaGFzT3duUHJvcGVydHkocHJvcGVydHlOYW1lKSkge1xuXHQgICAgICAgICAgICAgICAgICAgICAgICB0aGlzW3Byb3BlcnR5TmFtZV0gPSBwcm9wZXJ0aWVzW3Byb3BlcnR5TmFtZV07XG5cdCAgICAgICAgICAgICAgICAgICAgfVxuXHQgICAgICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgICAgICAvLyBJRSB3b24ndCBjb3B5IHRvU3RyaW5nIHVzaW5nIHRoZSBsb29wIGFib3ZlXG5cdCAgICAgICAgICAgICAgICBpZiAocHJvcGVydGllcy5oYXNPd25Qcm9wZXJ0eSgndG9TdHJpbmcnKSkge1xuXHQgICAgICAgICAgICAgICAgICAgIHRoaXMudG9TdHJpbmcgPSBwcm9wZXJ0aWVzLnRvU3RyaW5nO1xuXHQgICAgICAgICAgICAgICAgfVxuXHQgICAgICAgICAgICB9LFxuXG5cdCAgICAgICAgICAgIC8qKlxuXHQgICAgICAgICAgICAgKiBDcmVhdGVzIGEgY29weSBvZiB0aGlzIG9iamVjdC5cblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogQHJldHVybiB7T2JqZWN0fSBUaGUgY2xvbmUuXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqICAgICB2YXIgY2xvbmUgPSBpbnN0YW5jZS5jbG9uZSgpO1xuXHQgICAgICAgICAgICAgKi9cblx0ICAgICAgICAgICAgY2xvbmU6IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmluaXQucHJvdG90eXBlLmV4dGVuZCh0aGlzKTtcblx0ICAgICAgICAgICAgfVxuXHQgICAgICAgIH07XG5cdCAgICB9KCkpO1xuXG5cdCAgICAvKipcblx0ICAgICAqIEFuIGFycmF5IG9mIDMyLWJpdCB3b3Jkcy5cblx0ICAgICAqXG5cdCAgICAgKiBAcHJvcGVydHkge0FycmF5fSB3b3JkcyBUaGUgYXJyYXkgb2YgMzItYml0IHdvcmRzLlxuXHQgICAgICogQHByb3BlcnR5IHtudW1iZXJ9IHNpZ0J5dGVzIFRoZSBudW1iZXIgb2Ygc2lnbmlmaWNhbnQgYnl0ZXMgaW4gdGhpcyB3b3JkIGFycmF5LlxuXHQgICAgICovXG5cdCAgICB2YXIgV29yZEFycmF5ID0gQ19saWIuV29yZEFycmF5ID0gQmFzZS5leHRlbmQoe1xuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIEluaXRpYWxpemVzIGEgbmV3bHkgY3JlYXRlZCB3b3JkIGFycmF5LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtBcnJheX0gd29yZHMgKE9wdGlvbmFsKSBBbiBhcnJheSBvZiAzMi1iaXQgd29yZHMuXG5cdCAgICAgICAgICogQHBhcmFtIHtudW1iZXJ9IHNpZ0J5dGVzIChPcHRpb25hbCkgVGhlIG51bWJlciBvZiBzaWduaWZpY2FudCBieXRlcyBpbiB0aGUgd29yZHMuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciB3b3JkQXJyYXkgPSBDcnlwdG9KUy5saWIuV29yZEFycmF5LmNyZWF0ZSgpO1xuXHQgICAgICAgICAqICAgICB2YXIgd29yZEFycmF5ID0gQ3J5cHRvSlMubGliLldvcmRBcnJheS5jcmVhdGUoWzB4MDAwMTAyMDMsIDB4MDQwNTA2MDddKTtcblx0ICAgICAgICAgKiAgICAgdmFyIHdvcmRBcnJheSA9IENyeXB0b0pTLmxpYi5Xb3JkQXJyYXkuY3JlYXRlKFsweDAwMDEwMjAzLCAweDA0MDUwNjA3XSwgNik7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgaW5pdDogZnVuY3Rpb24gKHdvcmRzLCBzaWdCeXRlcykge1xuXHQgICAgICAgICAgICB3b3JkcyA9IHRoaXMud29yZHMgPSB3b3JkcyB8fCBbXTtcblxuXHQgICAgICAgICAgICBpZiAoc2lnQnl0ZXMgIT0gdW5kZWZpbmVkKSB7XG5cdCAgICAgICAgICAgICAgICB0aGlzLnNpZ0J5dGVzID0gc2lnQnl0ZXM7XG5cdCAgICAgICAgICAgIH0gZWxzZSB7XG5cdCAgICAgICAgICAgICAgICB0aGlzLnNpZ0J5dGVzID0gd29yZHMubGVuZ3RoICogNDtcblx0ICAgICAgICAgICAgfVxuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBDb252ZXJ0cyB0aGlzIHdvcmQgYXJyYXkgdG8gYSBzdHJpbmcuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge0VuY29kZXJ9IGVuY29kZXIgKE9wdGlvbmFsKSBUaGUgZW5jb2Rpbmcgc3RyYXRlZ3kgdG8gdXNlLiBEZWZhdWx0OiBDcnlwdG9KUy5lbmMuSGV4XG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBzdHJpbmdpZmllZCB3b3JkIGFycmF5LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgc3RyaW5nID0gd29yZEFycmF5ICsgJyc7XG5cdCAgICAgICAgICogICAgIHZhciBzdHJpbmcgPSB3b3JkQXJyYXkudG9TdHJpbmcoKTtcblx0ICAgICAgICAgKiAgICAgdmFyIHN0cmluZyA9IHdvcmRBcnJheS50b1N0cmluZyhDcnlwdG9KUy5lbmMuVXRmOCk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgdG9TdHJpbmc6IGZ1bmN0aW9uIChlbmNvZGVyKSB7XG5cdCAgICAgICAgICAgIHJldHVybiAoZW5jb2RlciB8fCBIZXgpLnN0cmluZ2lmeSh0aGlzKTtcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogQ29uY2F0ZW5hdGVzIGEgd29yZCBhcnJheSB0byB0aGlzIHdvcmQgYXJyYXkuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge1dvcmRBcnJheX0gd29yZEFycmF5IFRoZSB3b3JkIGFycmF5IHRvIGFwcGVuZC5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge1dvcmRBcnJheX0gVGhpcyB3b3JkIGFycmF5LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB3b3JkQXJyYXkxLmNvbmNhdCh3b3JkQXJyYXkyKTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBjb25jYXQ6IGZ1bmN0aW9uICh3b3JkQXJyYXkpIHtcblx0ICAgICAgICAgICAgLy8gU2hvcnRjdXRzXG5cdCAgICAgICAgICAgIHZhciB0aGlzV29yZHMgPSB0aGlzLndvcmRzO1xuXHQgICAgICAgICAgICB2YXIgdGhhdFdvcmRzID0gd29yZEFycmF5LndvcmRzO1xuXHQgICAgICAgICAgICB2YXIgdGhpc1NpZ0J5dGVzID0gdGhpcy5zaWdCeXRlcztcblx0ICAgICAgICAgICAgdmFyIHRoYXRTaWdCeXRlcyA9IHdvcmRBcnJheS5zaWdCeXRlcztcblxuXHQgICAgICAgICAgICAvLyBDbGFtcCBleGNlc3MgYml0c1xuXHQgICAgICAgICAgICB0aGlzLmNsYW1wKCk7XG5cblx0ICAgICAgICAgICAgLy8gQ29uY2F0XG5cdCAgICAgICAgICAgIGlmICh0aGlzU2lnQnl0ZXMgJSA0KSB7XG5cdCAgICAgICAgICAgICAgICAvLyBDb3B5IG9uZSBieXRlIGF0IGEgdGltZVxuXHQgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGF0U2lnQnl0ZXM7IGkrKykge1xuXHQgICAgICAgICAgICAgICAgICAgIHZhciB0aGF0Qnl0ZSA9ICh0aGF0V29yZHNbaSA+Pj4gMl0gPj4+ICgyNCAtIChpICUgNCkgKiA4KSkgJiAweGZmO1xuXHQgICAgICAgICAgICAgICAgICAgIHRoaXNXb3Jkc1sodGhpc1NpZ0J5dGVzICsgaSkgPj4+IDJdIHw9IHRoYXRCeXRlIDw8ICgyNCAtICgodGhpc1NpZ0J5dGVzICsgaSkgJSA0KSAqIDgpO1xuXHQgICAgICAgICAgICAgICAgfVxuXHQgICAgICAgICAgICB9IGVsc2Uge1xuXHQgICAgICAgICAgICAgICAgLy8gQ29weSBvbmUgd29yZCBhdCBhIHRpbWVcblx0ICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhhdFNpZ0J5dGVzOyBpICs9IDQpIHtcblx0ICAgICAgICAgICAgICAgICAgICB0aGlzV29yZHNbKHRoaXNTaWdCeXRlcyArIGkpID4+PiAyXSA9IHRoYXRXb3Jkc1tpID4+PiAyXTtcblx0ICAgICAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgfVxuXHQgICAgICAgICAgICB0aGlzLnNpZ0J5dGVzICs9IHRoYXRTaWdCeXRlcztcblxuXHQgICAgICAgICAgICAvLyBDaGFpbmFibGVcblx0ICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIFJlbW92ZXMgaW5zaWduaWZpY2FudCBiaXRzLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB3b3JkQXJyYXkuY2xhbXAoKTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBjbGFtcDogZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICAvLyBTaG9ydGN1dHNcblx0ICAgICAgICAgICAgdmFyIHdvcmRzID0gdGhpcy53b3Jkcztcblx0ICAgICAgICAgICAgdmFyIHNpZ0J5dGVzID0gdGhpcy5zaWdCeXRlcztcblxuXHQgICAgICAgICAgICAvLyBDbGFtcFxuXHQgICAgICAgICAgICB3b3Jkc1tzaWdCeXRlcyA+Pj4gMl0gJj0gMHhmZmZmZmZmZiA8PCAoMzIgLSAoc2lnQnl0ZXMgJSA0KSAqIDgpO1xuXHQgICAgICAgICAgICB3b3Jkcy5sZW5ndGggPSBNYXRoLmNlaWwoc2lnQnl0ZXMgLyA0KTtcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogQ3JlYXRlcyBhIGNvcHkgb2YgdGhpcyB3b3JkIGFycmF5LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7V29yZEFycmF5fSBUaGUgY2xvbmUuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciBjbG9uZSA9IHdvcmRBcnJheS5jbG9uZSgpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIGNsb25lOiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgIHZhciBjbG9uZSA9IEJhc2UuY2xvbmUuY2FsbCh0aGlzKTtcblx0ICAgICAgICAgICAgY2xvbmUud29yZHMgPSB0aGlzLndvcmRzLnNsaWNlKDApO1xuXG5cdCAgICAgICAgICAgIHJldHVybiBjbG9uZTtcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogQ3JlYXRlcyBhIHdvcmQgYXJyYXkgZmlsbGVkIHdpdGggcmFuZG9tIGJ5dGVzLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtudW1iZXJ9IG5CeXRlcyBUaGUgbnVtYmVyIG9mIHJhbmRvbSBieXRlcyB0byBnZW5lcmF0ZS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge1dvcmRBcnJheX0gVGhlIHJhbmRvbSB3b3JkIGFycmF5LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHN0YXRpY1xuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgd29yZEFycmF5ID0gQ3J5cHRvSlMubGliLldvcmRBcnJheS5yYW5kb20oMTYpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIHJhbmRvbTogZnVuY3Rpb24gKG5CeXRlcykge1xuXHQgICAgICAgICAgICB2YXIgd29yZHMgPSBbXTtcblxuXHQgICAgICAgICAgICB2YXIgciA9IChmdW5jdGlvbiAobV93KSB7XG5cdCAgICAgICAgICAgICAgICB2YXIgbV93ID0gbV93O1xuXHQgICAgICAgICAgICAgICAgdmFyIG1feiA9IDB4M2FkZTY4YjE7XG5cdCAgICAgICAgICAgICAgICB2YXIgbWFzayA9IDB4ZmZmZmZmZmY7XG5cblx0ICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgbV96ID0gKDB4OTA2OSAqIChtX3ogJiAweEZGRkYpICsgKG1feiA+PiAweDEwKSkgJiBtYXNrO1xuXHQgICAgICAgICAgICAgICAgICAgIG1fdyA9ICgweDQ2NTAgKiAobV93ICYgMHhGRkZGKSArIChtX3cgPj4gMHgxMCkpICYgbWFzaztcblx0ICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gKChtX3ogPDwgMHgxMCkgKyBtX3cpICYgbWFzaztcblx0ICAgICAgICAgICAgICAgICAgICByZXN1bHQgLz0gMHgxMDAwMDAwMDA7XG5cdCAgICAgICAgICAgICAgICAgICAgcmVzdWx0ICs9IDAuNTtcblx0ICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0ICogKE1hdGgucmFuZG9tKCkgPiAuNSA/IDEgOiAtMSk7XG5cdCAgICAgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgIH0pO1xuXG5cdCAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCByY2FjaGU7IGkgPCBuQnl0ZXM7IGkgKz0gNCkge1xuXHQgICAgICAgICAgICAgICAgdmFyIF9yID0gcigocmNhY2hlIHx8IE1hdGgucmFuZG9tKCkpICogMHgxMDAwMDAwMDApO1xuXG5cdCAgICAgICAgICAgICAgICByY2FjaGUgPSBfcigpICogMHgzYWRlNjdiNztcblx0ICAgICAgICAgICAgICAgIHdvcmRzLnB1c2goKF9yKCkgKiAweDEwMDAwMDAwMCkgfCAwKTtcblx0ICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgIHJldHVybiBuZXcgV29yZEFycmF5LmluaXQod29yZHMsIG5CeXRlcyk7XG5cdCAgICAgICAgfVxuXHQgICAgfSk7XG5cblx0ICAgIC8qKlxuXHQgICAgICogRW5jb2RlciBuYW1lc3BhY2UuXG5cdCAgICAgKi9cblx0ICAgIHZhciBDX2VuYyA9IEMuZW5jID0ge307XG5cblx0ICAgIC8qKlxuXHQgICAgICogSGV4IGVuY29kaW5nIHN0cmF0ZWd5LlxuXHQgICAgICovXG5cdCAgICB2YXIgSGV4ID0gQ19lbmMuSGV4ID0ge1xuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIENvbnZlcnRzIGEgd29yZCBhcnJheSB0byBhIGhleCBzdHJpbmcuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge1dvcmRBcnJheX0gd29yZEFycmF5IFRoZSB3b3JkIGFycmF5LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7c3RyaW5nfSBUaGUgaGV4IHN0cmluZy5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBzdGF0aWNcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIGhleFN0cmluZyA9IENyeXB0b0pTLmVuYy5IZXguc3RyaW5naWZ5KHdvcmRBcnJheSk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgc3RyaW5naWZ5OiBmdW5jdGlvbiAod29yZEFycmF5KSB7XG5cdCAgICAgICAgICAgIC8vIFNob3J0Y3V0c1xuXHQgICAgICAgICAgICB2YXIgd29yZHMgPSB3b3JkQXJyYXkud29yZHM7XG5cdCAgICAgICAgICAgIHZhciBzaWdCeXRlcyA9IHdvcmRBcnJheS5zaWdCeXRlcztcblxuXHQgICAgICAgICAgICAvLyBDb252ZXJ0XG5cdCAgICAgICAgICAgIHZhciBoZXhDaGFycyA9IFtdO1xuXHQgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNpZ0J5dGVzOyBpKyspIHtcblx0ICAgICAgICAgICAgICAgIHZhciBiaXRlID0gKHdvcmRzW2kgPj4+IDJdID4+PiAoMjQgLSAoaSAlIDQpICogOCkpICYgMHhmZjtcblx0ICAgICAgICAgICAgICAgIGhleENoYXJzLnB1c2goKGJpdGUgPj4+IDQpLnRvU3RyaW5nKDE2KSk7XG5cdCAgICAgICAgICAgICAgICBoZXhDaGFycy5wdXNoKChiaXRlICYgMHgwZikudG9TdHJpbmcoMTYpKTtcblx0ICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgIHJldHVybiBoZXhDaGFycy5qb2luKCcnKTtcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogQ29udmVydHMgYSBoZXggc3RyaW5nIHRvIGEgd29yZCBhcnJheS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBoZXhTdHIgVGhlIGhleCBzdHJpbmcuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtXb3JkQXJyYXl9IFRoZSB3b3JkIGFycmF5LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHN0YXRpY1xuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgd29yZEFycmF5ID0gQ3J5cHRvSlMuZW5jLkhleC5wYXJzZShoZXhTdHJpbmcpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIHBhcnNlOiBmdW5jdGlvbiAoaGV4U3RyKSB7XG5cdCAgICAgICAgICAgIC8vIFNob3J0Y3V0XG5cdCAgICAgICAgICAgIHZhciBoZXhTdHJMZW5ndGggPSBoZXhTdHIubGVuZ3RoO1xuXG5cdCAgICAgICAgICAgIC8vIENvbnZlcnRcblx0ICAgICAgICAgICAgdmFyIHdvcmRzID0gW107XG5cdCAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaGV4U3RyTGVuZ3RoOyBpICs9IDIpIHtcblx0ICAgICAgICAgICAgICAgIHdvcmRzW2kgPj4+IDNdIHw9IHBhcnNlSW50KGhleFN0ci5zdWJzdHIoaSwgMiksIDE2KSA8PCAoMjQgLSAoaSAlIDgpICogNCk7XG5cdCAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICByZXR1cm4gbmV3IFdvcmRBcnJheS5pbml0KHdvcmRzLCBoZXhTdHJMZW5ndGggLyAyKTtcblx0ICAgICAgICB9XG5cdCAgICB9O1xuXG5cdCAgICAvKipcblx0ICAgICAqIExhdGluMSBlbmNvZGluZyBzdHJhdGVneS5cblx0ICAgICAqL1xuXHQgICAgdmFyIExhdGluMSA9IENfZW5jLkxhdGluMSA9IHtcblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBDb252ZXJ0cyBhIHdvcmQgYXJyYXkgdG8gYSBMYXRpbjEgc3RyaW5nLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtXb3JkQXJyYXl9IHdvcmRBcnJheSBUaGUgd29yZCBhcnJheS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge3N0cmluZ30gVGhlIExhdGluMSBzdHJpbmcuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAc3RhdGljXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciBsYXRpbjFTdHJpbmcgPSBDcnlwdG9KUy5lbmMuTGF0aW4xLnN0cmluZ2lmeSh3b3JkQXJyYXkpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIHN0cmluZ2lmeTogZnVuY3Rpb24gKHdvcmRBcnJheSkge1xuXHQgICAgICAgICAgICAvLyBTaG9ydGN1dHNcblx0ICAgICAgICAgICAgdmFyIHdvcmRzID0gd29yZEFycmF5LndvcmRzO1xuXHQgICAgICAgICAgICB2YXIgc2lnQnl0ZXMgPSB3b3JkQXJyYXkuc2lnQnl0ZXM7XG5cblx0ICAgICAgICAgICAgLy8gQ29udmVydFxuXHQgICAgICAgICAgICB2YXIgbGF0aW4xQ2hhcnMgPSBbXTtcblx0ICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzaWdCeXRlczsgaSsrKSB7XG5cdCAgICAgICAgICAgICAgICB2YXIgYml0ZSA9ICh3b3Jkc1tpID4+PiAyXSA+Pj4gKDI0IC0gKGkgJSA0KSAqIDgpKSAmIDB4ZmY7XG5cdCAgICAgICAgICAgICAgICBsYXRpbjFDaGFycy5wdXNoKFN0cmluZy5mcm9tQ2hhckNvZGUoYml0ZSkpO1xuXHQgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgcmV0dXJuIGxhdGluMUNoYXJzLmpvaW4oJycpO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBDb252ZXJ0cyBhIExhdGluMSBzdHJpbmcgdG8gYSB3b3JkIGFycmF5LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGxhdGluMVN0ciBUaGUgTGF0aW4xIHN0cmluZy5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge1dvcmRBcnJheX0gVGhlIHdvcmQgYXJyYXkuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAc3RhdGljXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciB3b3JkQXJyYXkgPSBDcnlwdG9KUy5lbmMuTGF0aW4xLnBhcnNlKGxhdGluMVN0cmluZyk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgcGFyc2U6IGZ1bmN0aW9uIChsYXRpbjFTdHIpIHtcblx0ICAgICAgICAgICAgLy8gU2hvcnRjdXRcblx0ICAgICAgICAgICAgdmFyIGxhdGluMVN0ckxlbmd0aCA9IGxhdGluMVN0ci5sZW5ndGg7XG5cblx0ICAgICAgICAgICAgLy8gQ29udmVydFxuXHQgICAgICAgICAgICB2YXIgd29yZHMgPSBbXTtcblx0ICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsYXRpbjFTdHJMZW5ndGg7IGkrKykge1xuXHQgICAgICAgICAgICAgICAgd29yZHNbaSA+Pj4gMl0gfD0gKGxhdGluMVN0ci5jaGFyQ29kZUF0KGkpICYgMHhmZikgPDwgKDI0IC0gKGkgJSA0KSAqIDgpO1xuXHQgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgcmV0dXJuIG5ldyBXb3JkQXJyYXkuaW5pdCh3b3JkcywgbGF0aW4xU3RyTGVuZ3RoKTtcblx0ICAgICAgICB9XG5cdCAgICB9O1xuXG5cdCAgICAvKipcblx0ICAgICAqIFVURi04IGVuY29kaW5nIHN0cmF0ZWd5LlxuXHQgICAgICovXG5cdCAgICB2YXIgVXRmOCA9IENfZW5jLlV0ZjggPSB7XG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogQ29udmVydHMgYSB3b3JkIGFycmF5IHRvIGEgVVRGLTggc3RyaW5nLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtXb3JkQXJyYXl9IHdvcmRBcnJheSBUaGUgd29yZCBhcnJheS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge3N0cmluZ30gVGhlIFVURi04IHN0cmluZy5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBzdGF0aWNcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIHV0ZjhTdHJpbmcgPSBDcnlwdG9KUy5lbmMuVXRmOC5zdHJpbmdpZnkod29yZEFycmF5KTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBzdHJpbmdpZnk6IGZ1bmN0aW9uICh3b3JkQXJyYXkpIHtcblx0ICAgICAgICAgICAgdHJ5IHtcblx0ICAgICAgICAgICAgICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoZXNjYXBlKExhdGluMS5zdHJpbmdpZnkod29yZEFycmF5KSkpO1xuXHQgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG5cdCAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ01hbGZvcm1lZCBVVEYtOCBkYXRhJyk7XG5cdCAgICAgICAgICAgIH1cblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogQ29udmVydHMgYSBVVEYtOCBzdHJpbmcgdG8gYSB3b3JkIGFycmF5LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHV0ZjhTdHIgVGhlIFVURi04IHN0cmluZy5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge1dvcmRBcnJheX0gVGhlIHdvcmQgYXJyYXkuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAc3RhdGljXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciB3b3JkQXJyYXkgPSBDcnlwdG9KUy5lbmMuVXRmOC5wYXJzZSh1dGY4U3RyaW5nKTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBwYXJzZTogZnVuY3Rpb24gKHV0ZjhTdHIpIHtcblx0ICAgICAgICAgICAgcmV0dXJuIExhdGluMS5wYXJzZSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQodXRmOFN0cikpKTtcblx0ICAgICAgICB9XG5cdCAgICB9O1xuXG5cdCAgICAvKipcblx0ICAgICAqIEFic3RyYWN0IGJ1ZmZlcmVkIGJsb2NrIGFsZ29yaXRobSB0ZW1wbGF0ZS5cblx0ICAgICAqXG5cdCAgICAgKiBUaGUgcHJvcGVydHkgYmxvY2tTaXplIG11c3QgYmUgaW1wbGVtZW50ZWQgaW4gYSBjb25jcmV0ZSBzdWJ0eXBlLlxuXHQgICAgICpcblx0ICAgICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBfbWluQnVmZmVyU2l6ZSBUaGUgbnVtYmVyIG9mIGJsb2NrcyB0aGF0IHNob3VsZCBiZSBrZXB0IHVucHJvY2Vzc2VkIGluIHRoZSBidWZmZXIuIERlZmF1bHQ6IDBcblx0ICAgICAqL1xuXHQgICAgdmFyIEJ1ZmZlcmVkQmxvY2tBbGdvcml0aG0gPSBDX2xpYi5CdWZmZXJlZEJsb2NrQWxnb3JpdGhtID0gQmFzZS5leHRlbmQoe1xuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIFJlc2V0cyB0aGlzIGJsb2NrIGFsZ29yaXRobSdzIGRhdGEgYnVmZmVyIHRvIGl0cyBpbml0aWFsIHN0YXRlLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICBidWZmZXJlZEJsb2NrQWxnb3JpdGhtLnJlc2V0KCk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgcmVzZXQ6IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgLy8gSW5pdGlhbCB2YWx1ZXNcblx0ICAgICAgICAgICAgdGhpcy5fZGF0YSA9IG5ldyBXb3JkQXJyYXkuaW5pdCgpO1xuXHQgICAgICAgICAgICB0aGlzLl9uRGF0YUJ5dGVzID0gMDtcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogQWRkcyBuZXcgZGF0YSB0byB0aGlzIGJsb2NrIGFsZ29yaXRobSdzIGJ1ZmZlci5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7V29yZEFycmF5fHN0cmluZ30gZGF0YSBUaGUgZGF0YSB0byBhcHBlbmQuIFN0cmluZ3MgYXJlIGNvbnZlcnRlZCB0byBhIFdvcmRBcnJheSB1c2luZyBVVEYtOC5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgYnVmZmVyZWRCbG9ja0FsZ29yaXRobS5fYXBwZW5kKCdkYXRhJyk7XG5cdCAgICAgICAgICogICAgIGJ1ZmZlcmVkQmxvY2tBbGdvcml0aG0uX2FwcGVuZCh3b3JkQXJyYXkpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIF9hcHBlbmQ6IGZ1bmN0aW9uIChkYXRhKSB7XG5cdCAgICAgICAgICAgIC8vIENvbnZlcnQgc3RyaW5nIHRvIFdvcmRBcnJheSwgZWxzZSBhc3N1bWUgV29yZEFycmF5IGFscmVhZHlcblx0ICAgICAgICAgICAgaWYgKHR5cGVvZiBkYXRhID09ICdzdHJpbmcnKSB7XG5cdCAgICAgICAgICAgICAgICBkYXRhID0gVXRmOC5wYXJzZShkYXRhKTtcblx0ICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgIC8vIEFwcGVuZFxuXHQgICAgICAgICAgICB0aGlzLl9kYXRhLmNvbmNhdChkYXRhKTtcblx0ICAgICAgICAgICAgdGhpcy5fbkRhdGFCeXRlcyArPSBkYXRhLnNpZ0J5dGVzO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBQcm9jZXNzZXMgYXZhaWxhYmxlIGRhdGEgYmxvY2tzLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogVGhpcyBtZXRob2QgaW52b2tlcyBfZG9Qcm9jZXNzQmxvY2sob2Zmc2V0KSwgd2hpY2ggbXVzdCBiZSBpbXBsZW1lbnRlZCBieSBhIGNvbmNyZXRlIHN1YnR5cGUuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGRvRmx1c2ggV2hldGhlciBhbGwgYmxvY2tzIGFuZCBwYXJ0aWFsIGJsb2NrcyBzaG91bGQgYmUgcHJvY2Vzc2VkLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7V29yZEFycmF5fSBUaGUgcHJvY2Vzc2VkIGRhdGEuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciBwcm9jZXNzZWREYXRhID0gYnVmZmVyZWRCbG9ja0FsZ29yaXRobS5fcHJvY2VzcygpO1xuXHQgICAgICAgICAqICAgICB2YXIgcHJvY2Vzc2VkRGF0YSA9IGJ1ZmZlcmVkQmxvY2tBbGdvcml0aG0uX3Byb2Nlc3MoISEnZmx1c2gnKTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBfcHJvY2VzczogZnVuY3Rpb24gKGRvRmx1c2gpIHtcblx0ICAgICAgICAgICAgLy8gU2hvcnRjdXRzXG5cdCAgICAgICAgICAgIHZhciBkYXRhID0gdGhpcy5fZGF0YTtcblx0ICAgICAgICAgICAgdmFyIGRhdGFXb3JkcyA9IGRhdGEud29yZHM7XG5cdCAgICAgICAgICAgIHZhciBkYXRhU2lnQnl0ZXMgPSBkYXRhLnNpZ0J5dGVzO1xuXHQgICAgICAgICAgICB2YXIgYmxvY2tTaXplID0gdGhpcy5ibG9ja1NpemU7XG5cdCAgICAgICAgICAgIHZhciBibG9ja1NpemVCeXRlcyA9IGJsb2NrU2l6ZSAqIDQ7XG5cblx0ICAgICAgICAgICAgLy8gQ291bnQgYmxvY2tzIHJlYWR5XG5cdCAgICAgICAgICAgIHZhciBuQmxvY2tzUmVhZHkgPSBkYXRhU2lnQnl0ZXMgLyBibG9ja1NpemVCeXRlcztcblx0ICAgICAgICAgICAgaWYgKGRvRmx1c2gpIHtcblx0ICAgICAgICAgICAgICAgIC8vIFJvdW5kIHVwIHRvIGluY2x1ZGUgcGFydGlhbCBibG9ja3Ncblx0ICAgICAgICAgICAgICAgIG5CbG9ja3NSZWFkeSA9IE1hdGguY2VpbChuQmxvY2tzUmVhZHkpO1xuXHQgICAgICAgICAgICB9IGVsc2Uge1xuXHQgICAgICAgICAgICAgICAgLy8gUm91bmQgZG93biB0byBpbmNsdWRlIG9ubHkgZnVsbCBibG9ja3MsXG5cdCAgICAgICAgICAgICAgICAvLyBsZXNzIHRoZSBudW1iZXIgb2YgYmxvY2tzIHRoYXQgbXVzdCByZW1haW4gaW4gdGhlIGJ1ZmZlclxuXHQgICAgICAgICAgICAgICAgbkJsb2Nrc1JlYWR5ID0gTWF0aC5tYXgoKG5CbG9ja3NSZWFkeSB8IDApIC0gdGhpcy5fbWluQnVmZmVyU2l6ZSwgMCk7XG5cdCAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICAvLyBDb3VudCB3b3JkcyByZWFkeVxuXHQgICAgICAgICAgICB2YXIgbldvcmRzUmVhZHkgPSBuQmxvY2tzUmVhZHkgKiBibG9ja1NpemU7XG5cblx0ICAgICAgICAgICAgLy8gQ291bnQgYnl0ZXMgcmVhZHlcblx0ICAgICAgICAgICAgdmFyIG5CeXRlc1JlYWR5ID0gTWF0aC5taW4obldvcmRzUmVhZHkgKiA0LCBkYXRhU2lnQnl0ZXMpO1xuXG5cdCAgICAgICAgICAgIC8vIFByb2Nlc3MgYmxvY2tzXG5cdCAgICAgICAgICAgIGlmIChuV29yZHNSZWFkeSkge1xuXHQgICAgICAgICAgICAgICAgZm9yICh2YXIgb2Zmc2V0ID0gMDsgb2Zmc2V0IDwgbldvcmRzUmVhZHk7IG9mZnNldCArPSBibG9ja1NpemUpIHtcblx0ICAgICAgICAgICAgICAgICAgICAvLyBQZXJmb3JtIGNvbmNyZXRlLWFsZ29yaXRobSBsb2dpY1xuXHQgICAgICAgICAgICAgICAgICAgIHRoaXMuX2RvUHJvY2Vzc0Jsb2NrKGRhdGFXb3Jkcywgb2Zmc2V0KTtcblx0ICAgICAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICAgICAgLy8gUmVtb3ZlIHByb2Nlc3NlZCB3b3Jkc1xuXHQgICAgICAgICAgICAgICAgdmFyIHByb2Nlc3NlZFdvcmRzID0gZGF0YVdvcmRzLnNwbGljZSgwLCBuV29yZHNSZWFkeSk7XG5cdCAgICAgICAgICAgICAgICBkYXRhLnNpZ0J5dGVzIC09IG5CeXRlc1JlYWR5O1xuXHQgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgLy8gUmV0dXJuIHByb2Nlc3NlZCB3b3Jkc1xuXHQgICAgICAgICAgICByZXR1cm4gbmV3IFdvcmRBcnJheS5pbml0KHByb2Nlc3NlZFdvcmRzLCBuQnl0ZXNSZWFkeSk7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIENyZWF0ZXMgYSBjb3B5IG9mIHRoaXMgb2JqZWN0LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7T2JqZWN0fSBUaGUgY2xvbmUuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciBjbG9uZSA9IGJ1ZmZlcmVkQmxvY2tBbGdvcml0aG0uY2xvbmUoKTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBjbG9uZTogZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICB2YXIgY2xvbmUgPSBCYXNlLmNsb25lLmNhbGwodGhpcyk7XG5cdCAgICAgICAgICAgIGNsb25lLl9kYXRhID0gdGhpcy5fZGF0YS5jbG9uZSgpO1xuXG5cdCAgICAgICAgICAgIHJldHVybiBjbG9uZTtcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgX21pbkJ1ZmZlclNpemU6IDBcblx0ICAgIH0pO1xuXG5cdCAgICAvKipcblx0ICAgICAqIEFic3RyYWN0IGhhc2hlciB0ZW1wbGF0ZS5cblx0ICAgICAqXG5cdCAgICAgKiBAcHJvcGVydHkge251bWJlcn0gYmxvY2tTaXplIFRoZSBudW1iZXIgb2YgMzItYml0IHdvcmRzIHRoaXMgaGFzaGVyIG9wZXJhdGVzIG9uLiBEZWZhdWx0OiAxNiAoNTEyIGJpdHMpXG5cdCAgICAgKi9cblx0ICAgIHZhciBIYXNoZXIgPSBDX2xpYi5IYXNoZXIgPSBCdWZmZXJlZEJsb2NrQWxnb3JpdGhtLmV4dGVuZCh7XG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogQ29uZmlndXJhdGlvbiBvcHRpb25zLlxuXHQgICAgICAgICAqL1xuXHQgICAgICAgIGNmZzogQmFzZS5leHRlbmQoKSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIEluaXRpYWxpemVzIGEgbmV3bHkgY3JlYXRlZCBoYXNoZXIuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gY2ZnIChPcHRpb25hbCkgVGhlIGNvbmZpZ3VyYXRpb24gb3B0aW9ucyB0byB1c2UgZm9yIHRoaXMgaGFzaCBjb21wdXRhdGlvbi5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIGhhc2hlciA9IENyeXB0b0pTLmFsZ28uU0hBMjU2LmNyZWF0ZSgpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIGluaXQ6IGZ1bmN0aW9uIChjZmcpIHtcblx0ICAgICAgICAgICAgLy8gQXBwbHkgY29uZmlnIGRlZmF1bHRzXG5cdCAgICAgICAgICAgIHRoaXMuY2ZnID0gdGhpcy5jZmcuZXh0ZW5kKGNmZyk7XG5cblx0ICAgICAgICAgICAgLy8gU2V0IGluaXRpYWwgdmFsdWVzXG5cdCAgICAgICAgICAgIHRoaXMucmVzZXQoKTtcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogUmVzZXRzIHRoaXMgaGFzaGVyIHRvIGl0cyBpbml0aWFsIHN0YXRlLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICBoYXNoZXIucmVzZXQoKTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICByZXNldDogZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICAvLyBSZXNldCBkYXRhIGJ1ZmZlclxuXHQgICAgICAgICAgICBCdWZmZXJlZEJsb2NrQWxnb3JpdGhtLnJlc2V0LmNhbGwodGhpcyk7XG5cblx0ICAgICAgICAgICAgLy8gUGVyZm9ybSBjb25jcmV0ZS1oYXNoZXIgbG9naWNcblx0ICAgICAgICAgICAgdGhpcy5fZG9SZXNldCgpO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBVcGRhdGVzIHRoaXMgaGFzaGVyIHdpdGggYSBtZXNzYWdlLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtXb3JkQXJyYXl8c3RyaW5nfSBtZXNzYWdlVXBkYXRlIFRoZSBtZXNzYWdlIHRvIGFwcGVuZC5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge0hhc2hlcn0gVGhpcyBoYXNoZXIuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIGhhc2hlci51cGRhdGUoJ21lc3NhZ2UnKTtcblx0ICAgICAgICAgKiAgICAgaGFzaGVyLnVwZGF0ZSh3b3JkQXJyYXkpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIHVwZGF0ZTogZnVuY3Rpb24gKG1lc3NhZ2VVcGRhdGUpIHtcblx0ICAgICAgICAgICAgLy8gQXBwZW5kXG5cdCAgICAgICAgICAgIHRoaXMuX2FwcGVuZChtZXNzYWdlVXBkYXRlKTtcblxuXHQgICAgICAgICAgICAvLyBVcGRhdGUgdGhlIGhhc2hcblx0ICAgICAgICAgICAgdGhpcy5fcHJvY2VzcygpO1xuXG5cdCAgICAgICAgICAgIC8vIENoYWluYWJsZVxuXHQgICAgICAgICAgICByZXR1cm4gdGhpcztcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogRmluYWxpemVzIHRoZSBoYXNoIGNvbXB1dGF0aW9uLlxuXHQgICAgICAgICAqIE5vdGUgdGhhdCB0aGUgZmluYWxpemUgb3BlcmF0aW9uIGlzIGVmZmVjdGl2ZWx5IGEgZGVzdHJ1Y3RpdmUsIHJlYWQtb25jZSBvcGVyYXRpb24uXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge1dvcmRBcnJheXxzdHJpbmd9IG1lc3NhZ2VVcGRhdGUgKE9wdGlvbmFsKSBBIGZpbmFsIG1lc3NhZ2UgdXBkYXRlLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7V29yZEFycmF5fSBUaGUgaGFzaC5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIGhhc2ggPSBoYXNoZXIuZmluYWxpemUoKTtcblx0ICAgICAgICAgKiAgICAgdmFyIGhhc2ggPSBoYXNoZXIuZmluYWxpemUoJ21lc3NhZ2UnKTtcblx0ICAgICAgICAgKiAgICAgdmFyIGhhc2ggPSBoYXNoZXIuZmluYWxpemUod29yZEFycmF5KTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBmaW5hbGl6ZTogZnVuY3Rpb24gKG1lc3NhZ2VVcGRhdGUpIHtcblx0ICAgICAgICAgICAgLy8gRmluYWwgbWVzc2FnZSB1cGRhdGVcblx0ICAgICAgICAgICAgaWYgKG1lc3NhZ2VVcGRhdGUpIHtcblx0ICAgICAgICAgICAgICAgIHRoaXMuX2FwcGVuZChtZXNzYWdlVXBkYXRlKTtcblx0ICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgIC8vIFBlcmZvcm0gY29uY3JldGUtaGFzaGVyIGxvZ2ljXG5cdCAgICAgICAgICAgIHZhciBoYXNoID0gdGhpcy5fZG9GaW5hbGl6ZSgpO1xuXG5cdCAgICAgICAgICAgIHJldHVybiBoYXNoO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICBibG9ja1NpemU6IDUxMi8zMixcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIENyZWF0ZXMgYSBzaG9ydGN1dCBmdW5jdGlvbiB0byBhIGhhc2hlcidzIG9iamVjdCBpbnRlcmZhY2UuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge0hhc2hlcn0gaGFzaGVyIFRoZSBoYXNoZXIgdG8gY3JlYXRlIGEgaGVscGVyIGZvci5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge0Z1bmN0aW9ufSBUaGUgc2hvcnRjdXQgZnVuY3Rpb24uXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAc3RhdGljXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciBTSEEyNTYgPSBDcnlwdG9KUy5saWIuSGFzaGVyLl9jcmVhdGVIZWxwZXIoQ3J5cHRvSlMuYWxnby5TSEEyNTYpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIF9jcmVhdGVIZWxwZXI6IGZ1bmN0aW9uIChoYXNoZXIpIHtcblx0ICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChtZXNzYWdlLCBjZmcpIHtcblx0ICAgICAgICAgICAgICAgIHJldHVybiBuZXcgaGFzaGVyLmluaXQoY2ZnKS5maW5hbGl6ZShtZXNzYWdlKTtcblx0ICAgICAgICAgICAgfTtcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogQ3JlYXRlcyBhIHNob3J0Y3V0IGZ1bmN0aW9uIHRvIHRoZSBITUFDJ3Mgb2JqZWN0IGludGVyZmFjZS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7SGFzaGVyfSBoYXNoZXIgVGhlIGhhc2hlciB0byB1c2UgaW4gdGhpcyBITUFDIGhlbHBlci5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge0Z1bmN0aW9ufSBUaGUgc2hvcnRjdXQgZnVuY3Rpb24uXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAc3RhdGljXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciBIbWFjU0hBMjU2ID0gQ3J5cHRvSlMubGliLkhhc2hlci5fY3JlYXRlSG1hY0hlbHBlcihDcnlwdG9KUy5hbGdvLlNIQTI1Nik7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgX2NyZWF0ZUhtYWNIZWxwZXI6IGZ1bmN0aW9uIChoYXNoZXIpIHtcblx0ICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChtZXNzYWdlLCBrZXkpIHtcblx0ICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQ19hbGdvLkhNQUMuaW5pdChoYXNoZXIsIGtleSkuZmluYWxpemUobWVzc2FnZSk7XG5cdCAgICAgICAgICAgIH07XG5cdCAgICAgICAgfVxuXHQgICAgfSk7XG5cblx0ICAgIC8qKlxuXHQgICAgICogQWxnb3JpdGhtIG5hbWVzcGFjZS5cblx0ICAgICAqL1xuXHQgICAgdmFyIENfYWxnbyA9IEMuYWxnbyA9IHt9O1xuXG5cdCAgICByZXR1cm4gQztcblx0fShNYXRoKSk7XG5cblxuXHRyZXR1cm4gQ3J5cHRvSlM7XG5cbn0pKTsiLCI7KGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG5cdGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xuXHRcdC8vIENvbW1vbkpTXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gZmFjdG9yeShyZXF1aXJlKFwiLi9jb3JlXCIpKTtcblx0fVxuXHRlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuXHRcdC8vIEFNRFxuXHRcdGRlZmluZShbXCIuL2NvcmVcIl0sIGZhY3RvcnkpO1xuXHR9XG5cdGVsc2Uge1xuXHRcdC8vIEdsb2JhbCAoYnJvd3Nlcilcblx0XHRmYWN0b3J5KHJvb3QuQ3J5cHRvSlMpO1xuXHR9XG59KHRoaXMsIGZ1bmN0aW9uIChDcnlwdG9KUykge1xuXG5cdChmdW5jdGlvbiAoKSB7XG5cdCAgICAvLyBTaG9ydGN1dHNcblx0ICAgIHZhciBDID0gQ3J5cHRvSlM7XG5cdCAgICB2YXIgQ19saWIgPSBDLmxpYjtcblx0ICAgIHZhciBXb3JkQXJyYXkgPSBDX2xpYi5Xb3JkQXJyYXk7XG5cdCAgICB2YXIgSGFzaGVyID0gQ19saWIuSGFzaGVyO1xuXHQgICAgdmFyIENfYWxnbyA9IEMuYWxnbztcblxuXHQgICAgLy8gUmV1c2FibGUgb2JqZWN0XG5cdCAgICB2YXIgVyA9IFtdO1xuXG5cdCAgICAvKipcblx0ICAgICAqIFNIQS0xIGhhc2ggYWxnb3JpdGhtLlxuXHQgICAgICovXG5cdCAgICB2YXIgU0hBMSA9IENfYWxnby5TSEExID0gSGFzaGVyLmV4dGVuZCh7XG5cdCAgICAgICAgX2RvUmVzZXQ6IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgdGhpcy5faGFzaCA9IG5ldyBXb3JkQXJyYXkuaW5pdChbXG5cdCAgICAgICAgICAgICAgICAweDY3NDUyMzAxLCAweGVmY2RhYjg5LFxuXHQgICAgICAgICAgICAgICAgMHg5OGJhZGNmZSwgMHgxMDMyNTQ3Nixcblx0ICAgICAgICAgICAgICAgIDB4YzNkMmUxZjBcblx0ICAgICAgICAgICAgXSk7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIF9kb1Byb2Nlc3NCbG9jazogZnVuY3Rpb24gKE0sIG9mZnNldCkge1xuXHQgICAgICAgICAgICAvLyBTaG9ydGN1dFxuXHQgICAgICAgICAgICB2YXIgSCA9IHRoaXMuX2hhc2gud29yZHM7XG5cblx0ICAgICAgICAgICAgLy8gV29ya2luZyB2YXJpYWJsZXNcblx0ICAgICAgICAgICAgdmFyIGEgPSBIWzBdO1xuXHQgICAgICAgICAgICB2YXIgYiA9IEhbMV07XG5cdCAgICAgICAgICAgIHZhciBjID0gSFsyXTtcblx0ICAgICAgICAgICAgdmFyIGQgPSBIWzNdO1xuXHQgICAgICAgICAgICB2YXIgZSA9IEhbNF07XG5cblx0ICAgICAgICAgICAgLy8gQ29tcHV0YXRpb25cblx0ICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA4MDsgaSsrKSB7XG5cdCAgICAgICAgICAgICAgICBpZiAoaSA8IDE2KSB7XG5cdCAgICAgICAgICAgICAgICAgICAgV1tpXSA9IE1bb2Zmc2V0ICsgaV0gfCAwO1xuXHQgICAgICAgICAgICAgICAgfSBlbHNlIHtcblx0ICAgICAgICAgICAgICAgICAgICB2YXIgbiA9IFdbaSAtIDNdIF4gV1tpIC0gOF0gXiBXW2kgLSAxNF0gXiBXW2kgLSAxNl07XG5cdCAgICAgICAgICAgICAgICAgICAgV1tpXSA9IChuIDw8IDEpIHwgKG4gPj4+IDMxKTtcblx0ICAgICAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICAgICAgdmFyIHQgPSAoKGEgPDwgNSkgfCAoYSA+Pj4gMjcpKSArIGUgKyBXW2ldO1xuXHQgICAgICAgICAgICAgICAgaWYgKGkgPCAyMCkge1xuXHQgICAgICAgICAgICAgICAgICAgIHQgKz0gKChiICYgYykgfCAofmIgJiBkKSkgKyAweDVhODI3OTk5O1xuXHQgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpIDwgNDApIHtcblx0ICAgICAgICAgICAgICAgICAgICB0ICs9IChiIF4gYyBeIGQpICsgMHg2ZWQ5ZWJhMTtcblx0ICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaSA8IDYwKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgdCArPSAoKGIgJiBjKSB8IChiICYgZCkgfCAoYyAmIGQpKSAtIDB4NzBlNDQzMjQ7XG5cdCAgICAgICAgICAgICAgICB9IGVsc2UgLyogaWYgKGkgPCA4MCkgKi8ge1xuXHQgICAgICAgICAgICAgICAgICAgIHQgKz0gKGIgXiBjIF4gZCkgLSAweDM1OWQzZTJhO1xuXHQgICAgICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgICAgICBlID0gZDtcblx0ICAgICAgICAgICAgICAgIGQgPSBjO1xuXHQgICAgICAgICAgICAgICAgYyA9IChiIDw8IDMwKSB8IChiID4+PiAyKTtcblx0ICAgICAgICAgICAgICAgIGIgPSBhO1xuXHQgICAgICAgICAgICAgICAgYSA9IHQ7XG5cdCAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICAvLyBJbnRlcm1lZGlhdGUgaGFzaCB2YWx1ZVxuXHQgICAgICAgICAgICBIWzBdID0gKEhbMF0gKyBhKSB8IDA7XG5cdCAgICAgICAgICAgIEhbMV0gPSAoSFsxXSArIGIpIHwgMDtcblx0ICAgICAgICAgICAgSFsyXSA9IChIWzJdICsgYykgfCAwO1xuXHQgICAgICAgICAgICBIWzNdID0gKEhbM10gKyBkKSB8IDA7XG5cdCAgICAgICAgICAgIEhbNF0gPSAoSFs0XSArIGUpIHwgMDtcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgX2RvRmluYWxpemU6IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgLy8gU2hvcnRjdXRzXG5cdCAgICAgICAgICAgIHZhciBkYXRhID0gdGhpcy5fZGF0YTtcblx0ICAgICAgICAgICAgdmFyIGRhdGFXb3JkcyA9IGRhdGEud29yZHM7XG5cblx0ICAgICAgICAgICAgdmFyIG5CaXRzVG90YWwgPSB0aGlzLl9uRGF0YUJ5dGVzICogODtcblx0ICAgICAgICAgICAgdmFyIG5CaXRzTGVmdCA9IGRhdGEuc2lnQnl0ZXMgKiA4O1xuXG5cdCAgICAgICAgICAgIC8vIEFkZCBwYWRkaW5nXG5cdCAgICAgICAgICAgIGRhdGFXb3Jkc1tuQml0c0xlZnQgPj4+IDVdIHw9IDB4ODAgPDwgKDI0IC0gbkJpdHNMZWZ0ICUgMzIpO1xuXHQgICAgICAgICAgICBkYXRhV29yZHNbKCgobkJpdHNMZWZ0ICsgNjQpID4+PiA5KSA8PCA0KSArIDE0XSA9IE1hdGguZmxvb3IobkJpdHNUb3RhbCAvIDB4MTAwMDAwMDAwKTtcblx0ICAgICAgICAgICAgZGF0YVdvcmRzWygoKG5CaXRzTGVmdCArIDY0KSA+Pj4gOSkgPDwgNCkgKyAxNV0gPSBuQml0c1RvdGFsO1xuXHQgICAgICAgICAgICBkYXRhLnNpZ0J5dGVzID0gZGF0YVdvcmRzLmxlbmd0aCAqIDQ7XG5cblx0ICAgICAgICAgICAgLy8gSGFzaCBmaW5hbCBibG9ja3Ncblx0ICAgICAgICAgICAgdGhpcy5fcHJvY2VzcygpO1xuXG5cdCAgICAgICAgICAgIC8vIFJldHVybiBmaW5hbCBjb21wdXRlZCBoYXNoXG5cdCAgICAgICAgICAgIHJldHVybiB0aGlzLl9oYXNoO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICBjbG9uZTogZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICB2YXIgY2xvbmUgPSBIYXNoZXIuY2xvbmUuY2FsbCh0aGlzKTtcblx0ICAgICAgICAgICAgY2xvbmUuX2hhc2ggPSB0aGlzLl9oYXNoLmNsb25lKCk7XG5cblx0ICAgICAgICAgICAgcmV0dXJuIGNsb25lO1xuXHQgICAgICAgIH1cblx0ICAgIH0pO1xuXG5cdCAgICAvKipcblx0ICAgICAqIFNob3J0Y3V0IGZ1bmN0aW9uIHRvIHRoZSBoYXNoZXIncyBvYmplY3QgaW50ZXJmYWNlLlxuXHQgICAgICpcblx0ICAgICAqIEBwYXJhbSB7V29yZEFycmF5fHN0cmluZ30gbWVzc2FnZSBUaGUgbWVzc2FnZSB0byBoYXNoLlxuXHQgICAgICpcblx0ICAgICAqIEByZXR1cm4ge1dvcmRBcnJheX0gVGhlIGhhc2guXG5cdCAgICAgKlxuXHQgICAgICogQHN0YXRpY1xuXHQgICAgICpcblx0ICAgICAqIEBleGFtcGxlXG5cdCAgICAgKlxuXHQgICAgICogICAgIHZhciBoYXNoID0gQ3J5cHRvSlMuU0hBMSgnbWVzc2FnZScpO1xuXHQgICAgICogICAgIHZhciBoYXNoID0gQ3J5cHRvSlMuU0hBMSh3b3JkQXJyYXkpO1xuXHQgICAgICovXG5cdCAgICBDLlNIQTEgPSBIYXNoZXIuX2NyZWF0ZUhlbHBlcihTSEExKTtcblxuXHQgICAgLyoqXG5cdCAgICAgKiBTaG9ydGN1dCBmdW5jdGlvbiB0byB0aGUgSE1BQydzIG9iamVjdCBpbnRlcmZhY2UuXG5cdCAgICAgKlxuXHQgICAgICogQHBhcmFtIHtXb3JkQXJyYXl8c3RyaW5nfSBtZXNzYWdlIFRoZSBtZXNzYWdlIHRvIGhhc2guXG5cdCAgICAgKiBAcGFyYW0ge1dvcmRBcnJheXxzdHJpbmd9IGtleSBUaGUgc2VjcmV0IGtleS5cblx0ICAgICAqXG5cdCAgICAgKiBAcmV0dXJuIHtXb3JkQXJyYXl9IFRoZSBITUFDLlxuXHQgICAgICpcblx0ICAgICAqIEBzdGF0aWNcblx0ICAgICAqXG5cdCAgICAgKiBAZXhhbXBsZVxuXHQgICAgICpcblx0ICAgICAqICAgICB2YXIgaG1hYyA9IENyeXB0b0pTLkhtYWNTSEExKG1lc3NhZ2UsIGtleSk7XG5cdCAgICAgKi9cblx0ICAgIEMuSG1hY1NIQTEgPSBIYXNoZXIuX2NyZWF0ZUhtYWNIZWxwZXIoU0hBMSk7XG5cdH0oKSk7XG5cblxuXHRyZXR1cm4gQ3J5cHRvSlMuU0hBMTtcblxufSkpOyIsIi8vICAgICB1dWlkLmpzXG4vL1xuLy8gICAgIENvcHlyaWdodCAoYykgMjAxMC0yMDEyIFJvYmVydCBLaWVmZmVyXG4vLyAgICAgTUlUIExpY2Vuc2UgLSBodHRwOi8vb3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIF9nbG9iYWwgPSB0aGlzO1xuXG4gIC8vIFVuaXF1ZSBJRCBjcmVhdGlvbiByZXF1aXJlcyBhIGhpZ2ggcXVhbGl0eSByYW5kb20gIyBnZW5lcmF0b3IuICBXZSBmZWF0dXJlXG4gIC8vIGRldGVjdCB0byBkZXRlcm1pbmUgdGhlIGJlc3QgUk5HIHNvdXJjZSwgbm9ybWFsaXppbmcgdG8gYSBmdW5jdGlvbiB0aGF0XG4gIC8vIHJldHVybnMgMTI4LWJpdHMgb2YgcmFuZG9tbmVzcywgc2luY2UgdGhhdCdzIHdoYXQncyB1c3VhbGx5IHJlcXVpcmVkXG4gIHZhciBfcm5nO1xuXG4gIC8vIE5vZGUuanMgY3J5cHRvLWJhc2VkIFJORyAtIGh0dHA6Ly9ub2RlanMub3JnL2RvY3MvdjAuNi4yL2FwaS9jcnlwdG8uaHRtbFxuICAvL1xuICAvLyBNb2RlcmF0ZWx5IGZhc3QsIGhpZ2ggcXVhbGl0eVxuICBpZiAodHlwZW9mKF9nbG9iYWwucmVxdWlyZSkgPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRyeSB7XG4gICAgICB2YXIgX3JiID0gX2dsb2JhbC5yZXF1aXJlKCdjcnlwdG8nKS5yYW5kb21CeXRlcztcbiAgICAgIF9ybmcgPSBfcmIgJiYgZnVuY3Rpb24oKSB7cmV0dXJuIF9yYigxNik7fTtcbiAgICB9IGNhdGNoKGUpIHt9XG4gIH1cblxuICBpZiAoIV9ybmcgJiYgX2dsb2JhbC5jcnlwdG8gJiYgY3J5cHRvLmdldFJhbmRvbVZhbHVlcykge1xuICAgIC8vIFdIQVRXRyBjcnlwdG8tYmFzZWQgUk5HIC0gaHR0cDovL3dpa2kud2hhdHdnLm9yZy93aWtpL0NyeXB0b1xuICAgIC8vXG4gICAgLy8gTW9kZXJhdGVseSBmYXN0LCBoaWdoIHF1YWxpdHlcbiAgICB2YXIgX3JuZHM4ID0gbmV3IFVpbnQ4QXJyYXkoMTYpO1xuICAgIF9ybmcgPSBmdW5jdGlvbiB3aGF0d2dSTkcoKSB7XG4gICAgICBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKF9ybmRzOCk7XG4gICAgICByZXR1cm4gX3JuZHM4O1xuICAgIH07XG4gIH1cblxuICBpZiAoIV9ybmcpIHtcbiAgICAvLyBNYXRoLnJhbmRvbSgpLWJhc2VkIChSTkcpXG4gICAgLy9cbiAgICAvLyBJZiBhbGwgZWxzZSBmYWlscywgdXNlIE1hdGgucmFuZG9tKCkuICBJdCdzIGZhc3QsIGJ1dCBpcyBvZiB1bnNwZWNpZmllZFxuICAgIC8vIHF1YWxpdHkuXG4gICAgdmFyICBfcm5kcyA9IG5ldyBBcnJheSgxNik7XG4gICAgX3JuZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIHI7IGkgPCAxNjsgaSsrKSB7XG4gICAgICAgIGlmICgoaSAmIDB4MDMpID09PSAwKSByID0gTWF0aC5yYW5kb20oKSAqIDB4MTAwMDAwMDAwO1xuICAgICAgICBfcm5kc1tpXSA9IHIgPj4+ICgoaSAmIDB4MDMpIDw8IDMpICYgMHhmZjtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIF9ybmRzO1xuICAgIH07XG4gIH1cblxuICAvLyBCdWZmZXIgY2xhc3MgdG8gdXNlXG4gIHZhciBCdWZmZXJDbGFzcyA9IHR5cGVvZihfZ2xvYmFsLkJ1ZmZlcikgPT0gJ2Z1bmN0aW9uJyA/IF9nbG9iYWwuQnVmZmVyIDogQXJyYXk7XG5cbiAgLy8gTWFwcyBmb3IgbnVtYmVyIDwtPiBoZXggc3RyaW5nIGNvbnZlcnNpb25cbiAgdmFyIF9ieXRlVG9IZXggPSBbXTtcbiAgdmFyIF9oZXhUb0J5dGUgPSB7fTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCAyNTY7IGkrKykge1xuICAgIF9ieXRlVG9IZXhbaV0gPSAoaSArIDB4MTAwKS50b1N0cmluZygxNikuc3Vic3RyKDEpO1xuICAgIF9oZXhUb0J5dGVbX2J5dGVUb0hleFtpXV0gPSBpO1xuICB9XG5cbiAgLy8gKipgcGFyc2UoKWAgLSBQYXJzZSBhIFVVSUQgaW50byBpdCdzIGNvbXBvbmVudCBieXRlcyoqXG4gIGZ1bmN0aW9uIHBhcnNlKHMsIGJ1Ziwgb2Zmc2V0KSB7XG4gICAgdmFyIGkgPSAoYnVmICYmIG9mZnNldCkgfHwgMCwgaWkgPSAwO1xuXG4gICAgYnVmID0gYnVmIHx8IFtdO1xuICAgIHMudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9bMC05YS1mXXsyfS9nLCBmdW5jdGlvbihvY3QpIHtcbiAgICAgIGlmIChpaSA8IDE2KSB7IC8vIERvbid0IG92ZXJmbG93IVxuICAgICAgICBidWZbaSArIGlpKytdID0gX2hleFRvQnl0ZVtvY3RdO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gWmVybyBvdXQgcmVtYWluaW5nIGJ5dGVzIGlmIHN0cmluZyB3YXMgc2hvcnRcbiAgICB3aGlsZSAoaWkgPCAxNikge1xuICAgICAgYnVmW2kgKyBpaSsrXSA9IDA7XG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1ZjtcbiAgfVxuXG4gIC8vICoqYHVucGFyc2UoKWAgLSBDb252ZXJ0IFVVSUQgYnl0ZSBhcnJheSAoYWxhIHBhcnNlKCkpIGludG8gYSBzdHJpbmcqKlxuICBmdW5jdGlvbiB1bnBhcnNlKGJ1Ziwgb2Zmc2V0KSB7XG4gICAgdmFyIGkgPSBvZmZzZXQgfHwgMCwgYnRoID0gX2J5dGVUb0hleDtcbiAgICByZXR1cm4gIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICtcbiAgICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICsgJy0nICtcbiAgICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICsgJy0nICtcbiAgICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICsgJy0nICtcbiAgICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICsgJy0nICtcbiAgICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICtcbiAgICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICtcbiAgICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dO1xuICB9XG5cbiAgLy8gKipgdjEoKWAgLSBHZW5lcmF0ZSB0aW1lLWJhc2VkIFVVSUQqKlxuICAvL1xuICAvLyBJbnNwaXJlZCBieSBodHRwczovL2dpdGh1Yi5jb20vTGlvc0svVVVJRC5qc1xuICAvLyBhbmQgaHR0cDovL2RvY3MucHl0aG9uLm9yZy9saWJyYXJ5L3V1aWQuaHRtbFxuXG4gIC8vIHJhbmRvbSAjJ3Mgd2UgbmVlZCB0byBpbml0IG5vZGUgYW5kIGNsb2Nrc2VxXG4gIHZhciBfc2VlZEJ5dGVzID0gX3JuZygpO1xuXG4gIC8vIFBlciA0LjUsIGNyZWF0ZSBhbmQgNDgtYml0IG5vZGUgaWQsICg0NyByYW5kb20gYml0cyArIG11bHRpY2FzdCBiaXQgPSAxKVxuICB2YXIgX25vZGVJZCA9IFtcbiAgICBfc2VlZEJ5dGVzWzBdIHwgMHgwMSxcbiAgICBfc2VlZEJ5dGVzWzFdLCBfc2VlZEJ5dGVzWzJdLCBfc2VlZEJ5dGVzWzNdLCBfc2VlZEJ5dGVzWzRdLCBfc2VlZEJ5dGVzWzVdXG4gIF07XG5cbiAgLy8gUGVyIDQuMi4yLCByYW5kb21pemUgKDE0IGJpdCkgY2xvY2tzZXFcbiAgdmFyIF9jbG9ja3NlcSA9IChfc2VlZEJ5dGVzWzZdIDw8IDggfCBfc2VlZEJ5dGVzWzddKSAmIDB4M2ZmZjtcblxuICAvLyBQcmV2aW91cyB1dWlkIGNyZWF0aW9uIHRpbWVcbiAgdmFyIF9sYXN0TVNlY3MgPSAwLCBfbGFzdE5TZWNzID0gMDtcblxuICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2Jyb29mYS9ub2RlLXV1aWQgZm9yIEFQSSBkZXRhaWxzXG4gIGZ1bmN0aW9uIHYxKG9wdGlvbnMsIGJ1Ziwgb2Zmc2V0KSB7XG4gICAgdmFyIGkgPSBidWYgJiYgb2Zmc2V0IHx8IDA7XG4gICAgdmFyIGIgPSBidWYgfHwgW107XG5cbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHZhciBjbG9ja3NlcSA9IG9wdGlvbnMuY2xvY2tzZXEgIT0gbnVsbCA/IG9wdGlvbnMuY2xvY2tzZXEgOiBfY2xvY2tzZXE7XG5cbiAgICAvLyBVVUlEIHRpbWVzdGFtcHMgYXJlIDEwMCBuYW5vLXNlY29uZCB1bml0cyBzaW5jZSB0aGUgR3JlZ29yaWFuIGVwb2NoLFxuICAgIC8vICgxNTgyLTEwLTE1IDAwOjAwKS4gIEpTTnVtYmVycyBhcmVuJ3QgcHJlY2lzZSBlbm91Z2ggZm9yIHRoaXMsIHNvXG4gICAgLy8gdGltZSBpcyBoYW5kbGVkIGludGVybmFsbHkgYXMgJ21zZWNzJyAoaW50ZWdlciBtaWxsaXNlY29uZHMpIGFuZCAnbnNlY3MnXG4gICAgLy8gKDEwMC1uYW5vc2Vjb25kcyBvZmZzZXQgZnJvbSBtc2Vjcykgc2luY2UgdW5peCBlcG9jaCwgMTk3MC0wMS0wMSAwMDowMC5cbiAgICB2YXIgbXNlY3MgPSBvcHRpb25zLm1zZWNzICE9IG51bGwgPyBvcHRpb25zLm1zZWNzIDogbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cbiAgICAvLyBQZXIgNC4yLjEuMiwgdXNlIGNvdW50IG9mIHV1aWQncyBnZW5lcmF0ZWQgZHVyaW5nIHRoZSBjdXJyZW50IGNsb2NrXG4gICAgLy8gY3ljbGUgdG8gc2ltdWxhdGUgaGlnaGVyIHJlc29sdXRpb24gY2xvY2tcbiAgICB2YXIgbnNlY3MgPSBvcHRpb25zLm5zZWNzICE9IG51bGwgPyBvcHRpb25zLm5zZWNzIDogX2xhc3ROU2VjcyArIDE7XG5cbiAgICAvLyBUaW1lIHNpbmNlIGxhc3QgdXVpZCBjcmVhdGlvbiAoaW4gbXNlY3MpXG4gICAgdmFyIGR0ID0gKG1zZWNzIC0gX2xhc3RNU2VjcykgKyAobnNlY3MgLSBfbGFzdE5TZWNzKS8xMDAwMDtcblxuICAgIC8vIFBlciA0LjIuMS4yLCBCdW1wIGNsb2Nrc2VxIG9uIGNsb2NrIHJlZ3Jlc3Npb25cbiAgICBpZiAoZHQgPCAwICYmIG9wdGlvbnMuY2xvY2tzZXEgPT0gbnVsbCkge1xuICAgICAgY2xvY2tzZXEgPSBjbG9ja3NlcSArIDEgJiAweDNmZmY7XG4gICAgfVxuXG4gICAgLy8gUmVzZXQgbnNlY3MgaWYgY2xvY2sgcmVncmVzc2VzIChuZXcgY2xvY2tzZXEpIG9yIHdlJ3ZlIG1vdmVkIG9udG8gYSBuZXdcbiAgICAvLyB0aW1lIGludGVydmFsXG4gICAgaWYgKChkdCA8IDAgfHwgbXNlY3MgPiBfbGFzdE1TZWNzKSAmJiBvcHRpb25zLm5zZWNzID09IG51bGwpIHtcbiAgICAgIG5zZWNzID0gMDtcbiAgICB9XG5cbiAgICAvLyBQZXIgNC4yLjEuMiBUaHJvdyBlcnJvciBpZiB0b28gbWFueSB1dWlkcyBhcmUgcmVxdWVzdGVkXG4gICAgaWYgKG5zZWNzID49IDEwMDAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3V1aWQudjEoKTogQ2FuXFwndCBjcmVhdGUgbW9yZSB0aGFuIDEwTSB1dWlkcy9zZWMnKTtcbiAgICB9XG5cbiAgICBfbGFzdE1TZWNzID0gbXNlY3M7XG4gICAgX2xhc3ROU2VjcyA9IG5zZWNzO1xuICAgIF9jbG9ja3NlcSA9IGNsb2Nrc2VxO1xuXG4gICAgLy8gUGVyIDQuMS40IC0gQ29udmVydCBmcm9tIHVuaXggZXBvY2ggdG8gR3JlZ29yaWFuIGVwb2NoXG4gICAgbXNlY3MgKz0gMTIyMTkyOTI4MDAwMDA7XG5cbiAgICAvLyBgdGltZV9sb3dgXG4gICAgdmFyIHRsID0gKChtc2VjcyAmIDB4ZmZmZmZmZikgKiAxMDAwMCArIG5zZWNzKSAlIDB4MTAwMDAwMDAwO1xuICAgIGJbaSsrXSA9IHRsID4+PiAyNCAmIDB4ZmY7XG4gICAgYltpKytdID0gdGwgPj4+IDE2ICYgMHhmZjtcbiAgICBiW2krK10gPSB0bCA+Pj4gOCAmIDB4ZmY7XG4gICAgYltpKytdID0gdGwgJiAweGZmO1xuXG4gICAgLy8gYHRpbWVfbWlkYFxuICAgIHZhciB0bWggPSAobXNlY3MgLyAweDEwMDAwMDAwMCAqIDEwMDAwKSAmIDB4ZmZmZmZmZjtcbiAgICBiW2krK10gPSB0bWggPj4+IDggJiAweGZmO1xuICAgIGJbaSsrXSA9IHRtaCAmIDB4ZmY7XG5cbiAgICAvLyBgdGltZV9oaWdoX2FuZF92ZXJzaW9uYFxuICAgIGJbaSsrXSA9IHRtaCA+Pj4gMjQgJiAweGYgfCAweDEwOyAvLyBpbmNsdWRlIHZlcnNpb25cbiAgICBiW2krK10gPSB0bWggPj4+IDE2ICYgMHhmZjtcblxuICAgIC8vIGBjbG9ja19zZXFfaGlfYW5kX3Jlc2VydmVkYCAoUGVyIDQuMi4yIC0gaW5jbHVkZSB2YXJpYW50KVxuICAgIGJbaSsrXSA9IGNsb2Nrc2VxID4+PiA4IHwgMHg4MDtcblxuICAgIC8vIGBjbG9ja19zZXFfbG93YFxuICAgIGJbaSsrXSA9IGNsb2Nrc2VxICYgMHhmZjtcblxuICAgIC8vIGBub2RlYFxuICAgIHZhciBub2RlID0gb3B0aW9ucy5ub2RlIHx8IF9ub2RlSWQ7XG4gICAgZm9yICh2YXIgbiA9IDA7IG4gPCA2OyBuKyspIHtcbiAgICAgIGJbaSArIG5dID0gbm9kZVtuXTtcbiAgICB9XG5cbiAgICByZXR1cm4gYnVmID8gYnVmIDogdW5wYXJzZShiKTtcbiAgfVxuXG4gIC8vICoqYHY0KClgIC0gR2VuZXJhdGUgcmFuZG9tIFVVSUQqKlxuXG4gIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vYnJvb2ZhL25vZGUtdXVpZCBmb3IgQVBJIGRldGFpbHNcbiAgZnVuY3Rpb24gdjQob3B0aW9ucywgYnVmLCBvZmZzZXQpIHtcbiAgICAvLyBEZXByZWNhdGVkIC0gJ2Zvcm1hdCcgYXJndW1lbnQsIGFzIHN1cHBvcnRlZCBpbiB2MS4yXG4gICAgdmFyIGkgPSBidWYgJiYgb2Zmc2V0IHx8IDA7XG5cbiAgICBpZiAodHlwZW9mKG9wdGlvbnMpID09ICdzdHJpbmcnKSB7XG4gICAgICBidWYgPSBvcHRpb25zID09ICdiaW5hcnknID8gbmV3IEJ1ZmZlckNsYXNzKDE2KSA6IG51bGw7XG4gICAgICBvcHRpb25zID0gbnVsbDtcbiAgICB9XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICB2YXIgcm5kcyA9IG9wdGlvbnMucmFuZG9tIHx8IChvcHRpb25zLnJuZyB8fCBfcm5nKSgpO1xuXG4gICAgLy8gUGVyIDQuNCwgc2V0IGJpdHMgZm9yIHZlcnNpb24gYW5kIGBjbG9ja19zZXFfaGlfYW5kX3Jlc2VydmVkYFxuICAgIHJuZHNbNl0gPSAocm5kc1s2XSAmIDB4MGYpIHwgMHg0MDtcbiAgICBybmRzWzhdID0gKHJuZHNbOF0gJiAweDNmKSB8IDB4ODA7XG5cbiAgICAvLyBDb3B5IGJ5dGVzIHRvIGJ1ZmZlciwgaWYgcHJvdmlkZWRcbiAgICBpZiAoYnVmKSB7XG4gICAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgMTY7IGlpKyspIHtcbiAgICAgICAgYnVmW2kgKyBpaV0gPSBybmRzW2lpXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYnVmIHx8IHVucGFyc2Uocm5kcyk7XG4gIH1cblxuICAvLyBFeHBvcnQgcHVibGljIEFQSVxuICB2YXIgdXVpZCA9IHY0O1xuICB1dWlkLnYxID0gdjE7XG4gIHV1aWQudjQgPSB2NDtcbiAgdXVpZC5wYXJzZSA9IHBhcnNlO1xuICB1dWlkLnVucGFyc2UgPSB1bnBhcnNlO1xuICB1dWlkLkJ1ZmZlckNsYXNzID0gQnVmZmVyQ2xhc3M7XG5cbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIC8vIFB1Ymxpc2ggYXMgQU1EIG1vZHVsZVxuICAgIGRlZmluZShmdW5jdGlvbigpIHtyZXR1cm4gdXVpZDt9KTtcbiAgfSBlbHNlIGlmICh0eXBlb2YobW9kdWxlKSAhPSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgIC8vIFB1Ymxpc2ggYXMgbm9kZS5qcyBtb2R1bGVcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHV1aWQ7XG4gIH0gZWxzZSB7XG4gICAgLy8gUHVibGlzaCBhcyBnbG9iYWwgKGluIGJyb3dzZXJzKVxuICAgIHZhciBfcHJldmlvdXNSb290ID0gX2dsb2JhbC51dWlkO1xuXG4gICAgLy8gKipgbm9Db25mbGljdCgpYCAtIChicm93c2VyIG9ubHkpIHRvIHJlc2V0IGdsb2JhbCAndXVpZCcgdmFyKipcbiAgICB1dWlkLm5vQ29uZmxpY3QgPSBmdW5jdGlvbigpIHtcbiAgICAgIF9nbG9iYWwudXVpZCA9IF9wcmV2aW91c1Jvb3Q7XG4gICAgICByZXR1cm4gdXVpZDtcbiAgICB9O1xuXG4gICAgX2dsb2JhbC51dWlkID0gdXVpZDtcbiAgfVxufSkuY2FsbCh0aGlzKTtcbiIsInZhciBnO1xuXG4vLyBUaGlzIHdvcmtzIGluIG5vbi1zdHJpY3QgbW9kZVxuZyA9IChmdW5jdGlvbigpIHtcblx0cmV0dXJuIHRoaXM7XG59KSgpO1xuXG50cnkge1xuXHQvLyBUaGlzIHdvcmtzIGlmIGV2YWwgaXMgYWxsb3dlZCAoc2VlIENTUClcblx0ZyA9IGcgfHwgbmV3IEZ1bmN0aW9uKFwicmV0dXJuIHRoaXNcIikoKTtcbn0gY2F0Y2ggKGUpIHtcblx0Ly8gVGhpcyB3b3JrcyBpZiB0aGUgd2luZG93IHJlZmVyZW5jZSBpcyBhdmFpbGFibGVcblx0aWYgKHR5cGVvZiB3aW5kb3cgPT09IFwib2JqZWN0XCIpIGcgPSB3aW5kb3c7XG59XG5cbi8vIGcgY2FuIHN0aWxsIGJlIHVuZGVmaW5lZCwgYnV0IG5vdGhpbmcgdG8gZG8gYWJvdXQgaXQuLi5cbi8vIFdlIHJldHVybiB1bmRlZmluZWQsIGluc3RlYWQgb2Ygbm90aGluZyBoZXJlLCBzbyBpdCdzXG4vLyBlYXNpZXIgdG8gaGFuZGxlIHRoaXMgY2FzZS4gaWYoIWdsb2JhbCkgeyAuLi59XG5cbm1vZHVsZS5leHBvcnRzID0gZztcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obW9kdWxlKSB7XG5cdGlmICghbW9kdWxlLndlYnBhY2tQb2x5ZmlsbCkge1xuXHRcdG1vZHVsZS5kZXByZWNhdGUgPSBmdW5jdGlvbigpIHt9O1xuXHRcdG1vZHVsZS5wYXRocyA9IFtdO1xuXHRcdC8vIG1vZHVsZS5wYXJlbnQgPSB1bmRlZmluZWQgYnkgZGVmYXVsdFxuXHRcdGlmICghbW9kdWxlLmNoaWxkcmVuKSBtb2R1bGUuY2hpbGRyZW4gPSBbXTtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobW9kdWxlLCBcImxvYWRlZFwiLCB7XG5cdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuXHRcdFx0Z2V0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuIG1vZHVsZS5sO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShtb2R1bGUsIFwiaWRcIiwge1xuXHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcblx0XHRcdGdldDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiBtb2R1bGUuaTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRtb2R1bGUud2VicGFja1BvbHlmaWxsID0gMTtcblx0fVxuXHRyZXR1cm4gbW9kdWxlO1xufTtcbiIsInV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpXG5TdG9yYWdlID0gcmVxdWlyZSgnLi9zdG9yYWdlJylcblxuY2xhc3MgQWRhcHRlcnNcblxuICAjIyBBZGFwdGVyIGZvciB1c2luZyB0aGUgZ2ltZWwgYmFja2VuZC4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9BbGVwaGJldC9naW1lbFxuICAjIyB1c2VzIGpRdWVyeSB0byBzZW5kIGRhdGEgaWYgYCQuYWpheGAgaXMgZm91bmQuIEZhbGxzIGJhY2sgb24gcGxhaW4ganMgeGhyXG4gICMjIHBhcmFtczpcbiAgIyMgLSB1cmw6IEdpbWVsIHRyYWNrIFVSTCB0byBwb3N0IGV2ZW50cyB0b1xuICAjIyAtIG5hbWVwc2FjZTogbmFtZXNwYWNlIGZvciBHaW1lbCAoYWxsb3dzIHNldHRpbmcgZGlmZmVyZW50IGVudmlyb25tZW50cyBldGMpXG4gICMjIC0gc3RvcmFnZSAob3B0aW9uYWwpIC0gc3RvcmFnZSBhZGFwdGVyIGZvciB0aGUgcXVldWVcbiAgY2xhc3MgQEdpbWVsQWRhcHRlclxuICAgIHF1ZXVlX25hbWU6ICdfZ2ltZWxfcXVldWUnXG5cbiAgICBjb25zdHJ1Y3RvcjogKHVybCwgbmFtZXNwYWNlLCBzdG9yYWdlID0gQWRhcHRlcnMuTG9jYWxTdG9yYWdlQWRhcHRlcikgLT5cbiAgICAgIEBfc3RvcmFnZSA9IHN0b3JhZ2VcbiAgICAgIEB1cmwgPSB1cmxcbiAgICAgIEBuYW1lc3BhY2UgPSBuYW1lc3BhY2VcbiAgICAgIEBfcXVldWUgPSBKU09OLnBhcnNlKEBfc3RvcmFnZS5nZXQoQHF1ZXVlX25hbWUpIHx8ICdbXScpXG4gICAgICBAX2ZsdXNoKClcblxuICAgIF9yZW1vdmVfcXV1aWQ6IChxdXVpZCkgLT5cbiAgICAgIChlcnIsIHJlcykgPT5cbiAgICAgICAgcmV0dXJuIGlmIGVyclxuICAgICAgICB1dGlscy5yZW1vdmUoQF9xdWV1ZSwgKGVsKSAtPiBlbC5wcm9wZXJ0aWVzLl9xdXVpZCA9PSBxdXVpZClcbiAgICAgICAgQF9zdG9yYWdlLnNldChAcXVldWVfbmFtZSwgSlNPTi5zdHJpbmdpZnkoQF9xdWV1ZSkpXG5cbiAgICBfanF1ZXJ5X2dldDogKHVybCwgZGF0YSwgY2FsbGJhY2spIC0+XG4gICAgICB1dGlscy5sb2coJ3NlbmQgcmVxdWVzdCB1c2luZyBqUXVlcnknKVxuICAgICAgd2luZG93LmpRdWVyeS5hamF4XG4gICAgICAgIG1ldGhvZDogJ0dFVCdcbiAgICAgICAgdXJsOiB1cmxcbiAgICAgICAgZGF0YTogZGF0YVxuICAgICAgICBzdWNjZXNzOiBjYWxsYmFja1xuXG4gICAgX3BsYWluX2pzX2dldDogKHVybCwgZGF0YSwgY2FsbGJhY2spIC0+XG4gICAgICB1dGlscy5sb2coJ2ZhbGxiYWNrIG9uIHBsYWluIGpzIHhocicpXG4gICAgICB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuICAgICAgcGFyYW1zID0gKFwiI3tlbmNvZGVVUklDb21wb25lbnQoayl9PSN7ZW5jb2RlVVJJQ29tcG9uZW50KHYpfVwiIGZvciBrLHYgb2YgZGF0YSlcbiAgICAgIHBhcmFtcyA9IHBhcmFtcy5qb2luKCcmJykucmVwbGFjZSgvJTIwL2csICcrJylcbiAgICAgIHhoci5vcGVuKCdHRVQnLCBcIiN7dXJsfT8je3BhcmFtc31cIilcbiAgICAgIHhoci5vbmxvYWQgPSAtPlxuICAgICAgICBpZiB4aHIuc3RhdHVzID09IDIwMFxuICAgICAgICAgIGNhbGxiYWNrKClcbiAgICAgIHhoci5zZW5kKClcblxuICAgIF9hamF4X2dldDogKHVybCwgZGF0YSwgY2FsbGJhY2spIC0+XG4gICAgICBpZiB3aW5kb3cualF1ZXJ5Py5hamF4XG4gICAgICAgIEBfanF1ZXJ5X2dldCh1cmwsIGRhdGEsIGNhbGxiYWNrKVxuICAgICAgZWxzZVxuICAgICAgICBAX3BsYWluX2pzX2dldCh1cmwsIGRhdGEsIGNhbGxiYWNrKVxuXG4gICAgX2ZsdXNoOiAtPlxuICAgICAgZm9yIGl0ZW0gaW4gQF9xdWV1ZVxuICAgICAgICBjYWxsYmFjayA9IEBfcmVtb3ZlX3F1dWlkKGl0ZW0ucHJvcGVydGllcy5fcXV1aWQpXG4gICAgICAgIEBfYWpheF9nZXQoQHVybCwgdXRpbHMub21pdChpdGVtLnByb3BlcnRpZXMsICdfcXV1aWQnKSwgY2FsbGJhY2spXG4gICAgICAgIG51bGxcblxuICAgIF91c2VyX3V1aWQ6IChleHBlcmltZW50LCBnb2FsKSAtPlxuICAgICAgcmV0dXJuIHV0aWxzLnV1aWQoKSB1bmxlc3MgZXhwZXJpbWVudC51c2VyX2lkXG4gICAgICAjIGlmIGdvYWwgaXMgbm90IHVuaXF1ZSwgd2UgdHJhY2sgaXQgZXZlcnkgdGltZS4gcmV0dXJuIGEgbmV3IHJhbmRvbSB1dWlkXG4gICAgICByZXR1cm4gdXRpbHMudXVpZCgpIHVubGVzcyBnb2FsLnVuaXF1ZVxuICAgICAgIyBmb3IgYSBnaXZlbiB1c2VyIGlkLCBuYW1lc3BhY2UgYW5kIGV4cGVyaW1lbnQsIHRoZSB1dWlkIHdpbGwgYWx3YXlzIGJlIHRoZSBzYW1lXG4gICAgICAjIHRoaXMgYXZvaWRzIGNvdW50aW5nIGdvYWxzIHR3aWNlIGZvciB0aGUgc2FtZSB1c2VyIGFjcm9zcyBkaWZmZXJlbnQgZGV2aWNlc1xuICAgICAgdXRpbHMuc2hhMShcIiN7QG5hbWVzcGFjZX0uI3tleHBlcmltZW50Lm5hbWV9LiN7ZXhwZXJpbWVudC51c2VyX2lkfVwiKVxuXG4gICAgX3RyYWNrOiAoZXhwZXJpbWVudCwgdmFyaWFudCwgZ29hbCkgLT5cbiAgICAgIHV0aWxzLmxvZyhcIlBlcnNpc3RlbnQgUXVldWUgR2ltZWwgdHJhY2s6ICN7QG5hbWVzcGFjZX0sICN7ZXhwZXJpbWVudC5uYW1lfSwgI3t2YXJpYW50fSwgI3tnb2FsLm5hbWV9XCIpXG4gICAgICBAX3F1ZXVlLnNoaWZ0KCkgaWYgQF9xdWV1ZS5sZW5ndGggPiAxMDBcbiAgICAgIEBfcXVldWUucHVzaFxuICAgICAgICBwcm9wZXJ0aWVzOlxuICAgICAgICAgIGV4cGVyaW1lbnQ6IGV4cGVyaW1lbnQubmFtZVxuICAgICAgICAgIF9xdXVpZDogdXRpbHMudXVpZCgpICAjIHF1ZXVlIHV1aWQgKHVzZWQgb25seSBpbnRlcm5hbGx5KVxuICAgICAgICAgIHV1aWQ6IEBfdXNlcl91dWlkKGV4cGVyaW1lbnQsIGdvYWwpXG4gICAgICAgICAgdmFyaWFudDogdmFyaWFudFxuICAgICAgICAgIGV2ZW50OiBnb2FsLm5hbWVcbiAgICAgICAgICBuYW1lc3BhY2U6IEBuYW1lc3BhY2VcbiAgICAgIEBfc3RvcmFnZS5zZXQoQHF1ZXVlX25hbWUsIEpTT04uc3RyaW5naWZ5KEBfcXVldWUpKVxuICAgICAgQF9mbHVzaCgpXG5cbiAgICBleHBlcmltZW50X3N0YXJ0OiAoZXhwZXJpbWVudCwgdmFyaWFudCkgLT5cbiAgICAgIEBfdHJhY2soZXhwZXJpbWVudCwgdmFyaWFudCwge25hbWU6ICdwYXJ0aWNpcGF0ZScsIHVuaXF1ZTogdHJ1ZX0pXG5cbiAgICBnb2FsX2NvbXBsZXRlOiAoZXhwZXJpbWVudCwgdmFyaWFudCwgZ29hbF9uYW1lLCBwcm9wcykgLT5cbiAgICAgIEBfdHJhY2soZXhwZXJpbWVudCwgdmFyaWFudCwgdXRpbHMuZGVmYXVsdHMoe25hbWU6IGdvYWxfbmFtZX0sIHByb3BzKSlcblxuXG4gIGNsYXNzIEBQZXJzaXN0ZW50UXVldWVHb29nbGVBbmFseXRpY3NBZGFwdGVyXG4gICAgbmFtZXNwYWNlOiAnYWxlcGhiZXQnXG4gICAgcXVldWVfbmFtZTogJ19nYV9xdWV1ZSdcblxuICAgIGNvbnN0cnVjdG9yOiAoc3RvcmFnZSA9IEFkYXB0ZXJzLkxvY2FsU3RvcmFnZUFkYXB0ZXIpIC0+XG4gICAgICBAX3N0b3JhZ2UgPSBzdG9yYWdlXG4gICAgICBAX3F1ZXVlID0gSlNPTi5wYXJzZShAX3N0b3JhZ2UuZ2V0KEBxdWV1ZV9uYW1lKSB8fCAnW10nKVxuICAgICAgQF9mbHVzaCgpXG5cbiAgICBfcmVtb3ZlX3V1aWQ6ICh1dWlkKSAtPlxuICAgICAgPT5cbiAgICAgICAgdXRpbHMucmVtb3ZlKEBfcXVldWUsIChlbCkgLT4gZWwudXVpZCA9PSB1dWlkKVxuICAgICAgICBAX3N0b3JhZ2Uuc2V0KEBxdWV1ZV9uYW1lLCBKU09OLnN0cmluZ2lmeShAX3F1ZXVlKSlcblxuICAgIF9mbHVzaDogLT5cbiAgICAgIHRocm93IG5ldyBFcnJvcignZ2Egbm90IGRlZmluZWQuIFBsZWFzZSBtYWtlIHN1cmUgeW91ciBVbml2ZXJzYWwgYW5hbHl0aWNzIGlzIHNldCB1cCBjb3JyZWN0bHknKSBpZiB0eXBlb2YgZ2EgaXNudCAnZnVuY3Rpb24nXG4gICAgICBmb3IgaXRlbSBpbiBAX3F1ZXVlXG4gICAgICAgIGNhbGxiYWNrID0gQF9yZW1vdmVfdXVpZChpdGVtLnV1aWQpXG4gICAgICAgIGdhKCdzZW5kJywgJ2V2ZW50JywgaXRlbS5jYXRlZ29yeSwgaXRlbS5hY3Rpb24sIGl0ZW0ubGFiZWwsIHsnaGl0Q2FsbGJhY2snOiBjYWxsYmFjaywgJ25vbkludGVyYWN0aW9uJzogMX0pXG5cbiAgICBfdHJhY2s6IChjYXRlZ29yeSwgYWN0aW9uLCBsYWJlbCkgLT5cbiAgICAgIHV0aWxzLmxvZyhcIlBlcnNpc3RlbnQgUXVldWUgR29vZ2xlIFVuaXZlcnNhbCBBbmFseXRpY3MgdHJhY2s6ICN7Y2F0ZWdvcnl9LCAje2FjdGlvbn0sICN7bGFiZWx9XCIpXG4gICAgICBAX3F1ZXVlLnNoaWZ0KCkgaWYgQF9xdWV1ZS5sZW5ndGggPiAxMDBcbiAgICAgIEBfcXVldWUucHVzaCh7dXVpZDogdXRpbHMudXVpZCgpLCBjYXRlZ29yeTogY2F0ZWdvcnksIGFjdGlvbjogYWN0aW9uLCBsYWJlbDogbGFiZWx9KVxuICAgICAgQF9zdG9yYWdlLnNldChAcXVldWVfbmFtZSwgSlNPTi5zdHJpbmdpZnkoQF9xdWV1ZSkpXG4gICAgICBAX2ZsdXNoKClcblxuICAgIGV4cGVyaW1lbnRfc3RhcnQ6IChleHBlcmltZW50LCB2YXJpYW50KSAtPlxuICAgICAgQF90cmFjayhAbmFtZXNwYWNlLCBcIiN7ZXhwZXJpbWVudC5uYW1lfSB8ICN7dmFyaWFudH1cIiwgJ1Zpc2l0b3JzJylcblxuICAgIGdvYWxfY29tcGxldGU6IChleHBlcmltZW50LCB2YXJpYW50LCBnb2FsX25hbWUsIF9wcm9wcykgLT5cbiAgICAgIEBfdHJhY2soQG5hbWVzcGFjZSwgXCIje2V4cGVyaW1lbnQubmFtZX0gfCAje3ZhcmlhbnR9XCIsIGdvYWxfbmFtZSlcblxuXG4gIGNsYXNzIEBQZXJzaXN0ZW50UXVldWVLZWVuQWRhcHRlclxuICAgIHF1ZXVlX25hbWU6ICdfa2Vlbl9xdWV1ZSdcblxuICAgIGNvbnN0cnVjdG9yOiAoa2Vlbl9jbGllbnQsIHN0b3JhZ2UgPSBBZGFwdGVycy5Mb2NhbFN0b3JhZ2VBZGFwdGVyKSAtPlxuICAgICAgQGNsaWVudCA9IGtlZW5fY2xpZW50XG4gICAgICBAX3N0b3JhZ2UgPSBzdG9yYWdlXG4gICAgICBAX3F1ZXVlID0gSlNPTi5wYXJzZShAX3N0b3JhZ2UuZ2V0KEBxdWV1ZV9uYW1lKSB8fCAnW10nKVxuICAgICAgQF9mbHVzaCgpXG5cbiAgICBfcmVtb3ZlX3F1dWlkOiAocXV1aWQpIC0+XG4gICAgICAoZXJyLCByZXMpID0+XG4gICAgICAgIHJldHVybiBpZiBlcnJcbiAgICAgICAgdXRpbHMucmVtb3ZlKEBfcXVldWUsIChlbCkgLT4gZWwucHJvcGVydGllcy5fcXV1aWQgPT0gcXV1aWQpXG4gICAgICAgIEBfc3RvcmFnZS5zZXQoQHF1ZXVlX25hbWUsIEpTT04uc3RyaW5naWZ5KEBfcXVldWUpKVxuXG4gICAgX2ZsdXNoOiAtPlxuICAgICAgZm9yIGl0ZW0gaW4gQF9xdWV1ZVxuICAgICAgICBjYWxsYmFjayA9IEBfcmVtb3ZlX3F1dWlkKGl0ZW0ucHJvcGVydGllcy5fcXV1aWQpXG4gICAgICAgIEBjbGllbnQuYWRkRXZlbnQoaXRlbS5leHBlcmltZW50X25hbWUsIHV0aWxzLm9taXQoaXRlbS5wcm9wZXJ0aWVzLCAnX3F1dWlkJyksIGNhbGxiYWNrKVxuXG4gICAgX3VzZXJfdXVpZDogKGV4cGVyaW1lbnQsIGdvYWwpIC0+XG4gICAgICByZXR1cm4gdXRpbHMudXVpZCgpIHVubGVzcyBleHBlcmltZW50LnVzZXJfaWRcbiAgICAgICMgaWYgZ29hbCBpcyBub3QgdW5pcXVlLCB3ZSB0cmFjayBpdCBldmVyeSB0aW1lLiByZXR1cm4gYSBuZXcgcmFuZG9tIHV1aWRcbiAgICAgIHJldHVybiB1dGlscy51dWlkKCkgdW5sZXNzIGdvYWwudW5pcXVlXG4gICAgICAjIGZvciBhIGdpdmVuIHVzZXIgaWQsIG5hbWVzcGFjZSBhbmQgZXhwZXJpbWVudCwgdGhlIHV1aWQgd2lsbCBhbHdheXMgYmUgdGhlIHNhbWVcbiAgICAgICMgdGhpcyBhdm9pZHMgY291bnRpbmcgZ29hbHMgdHdpY2UgZm9yIHRoZSBzYW1lIHVzZXIgYWNyb3NzIGRpZmZlcmVudCBkZXZpY2VzXG4gICAgICB1dGlscy5zaGExKFwiI3tAbmFtZXNwYWNlfS4je2V4cGVyaW1lbnQubmFtZX0uI3tleHBlcmltZW50LnVzZXJfaWR9XCIpXG5cbiAgICBfdHJhY2s6IChleHBlcmltZW50LCB2YXJpYW50LCBnb2FsKSAtPlxuICAgICAgdXRpbHMubG9nKFwiUGVyc2lzdGVudCBRdWV1ZSBLZWVuIHRyYWNrOiAje2V4cGVyaW1lbnQubmFtZX0sICN7dmFyaWFudH0sICN7ZXZlbnR9XCIpXG4gICAgICBAX3F1ZXVlLnNoaWZ0KCkgaWYgQF9xdWV1ZS5sZW5ndGggPiAxMDBcbiAgICAgIEBfcXVldWUucHVzaFxuICAgICAgICBleHBlcmltZW50X25hbWU6IGV4cGVyaW1lbnQubmFtZVxuICAgICAgICBwcm9wZXJ0aWVzOlxuICAgICAgICAgIF9xdXVpZDogdXRpbHMudXVpZCgpICAjIHF1ZXVlIHV1aWQgKHVzZWQgb25seSBpbnRlcm5hbGx5KVxuICAgICAgICAgIHV1aWQ6IEBfdXNlcl91dWlkKGV4cGVyaW1lbnQsIGdvYWwpXG4gICAgICAgICAgdmFyaWFudDogdmFyaWFudFxuICAgICAgICAgIGV2ZW50OiBnb2FsLm5hbWVcbiAgICAgIEBfc3RvcmFnZS5zZXQoQHF1ZXVlX25hbWUsIEpTT04uc3RyaW5naWZ5KEBfcXVldWUpKVxuICAgICAgQF9mbHVzaCgpXG5cbiAgICBleHBlcmltZW50X3N0YXJ0OiAoZXhwZXJpbWVudCwgdmFyaWFudCkgLT5cbiAgICAgIEBfdHJhY2soZXhwZXJpbWVudCwgdmFyaWFudCwge25hbWU6ICdwYXJ0aWNpcGF0ZScsIHVuaXF1ZTogdHJ1ZX0pXG5cbiAgICBnb2FsX2NvbXBsZXRlOiAoZXhwZXJpbWVudCwgdmFyaWFudCwgZ29hbF9uYW1lLCBwcm9wcykgLT5cbiAgICAgIEBfdHJhY2soZXhwZXJpbWVudCwgdmFyaWFudCwgdXRpbHMuZGVmYXVsdHMoe25hbWU6IGdvYWxfbmFtZX0sIHByb3BzKSlcblxuXG4gIGNsYXNzIEBHb29nbGVVbml2ZXJzYWxBbmFseXRpY3NBZGFwdGVyXG4gICAgQG5hbWVzcGFjZTogJ2FsZXBoYmV0J1xuXG4gICAgQF90cmFjazogKGNhdGVnb3J5LCBhY3Rpb24sIGxhYmVsKSAtPlxuICAgICAgdXRpbHMubG9nKFwiR29vZ2xlIFVuaXZlcnNhbCBBbmFseXRpY3MgdHJhY2s6ICN7Y2F0ZWdvcnl9LCAje2FjdGlvbn0sICN7bGFiZWx9XCIpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2dhIG5vdCBkZWZpbmVkLiBQbGVhc2UgbWFrZSBzdXJlIHlvdXIgVW5pdmVyc2FsIGFuYWx5dGljcyBpcyBzZXQgdXAgY29ycmVjdGx5JykgaWYgdHlwZW9mIGdhIGlzbnQgJ2Z1bmN0aW9uJ1xuICAgICAgZ2EoJ3NlbmQnLCAnZXZlbnQnLCBjYXRlZ29yeSwgYWN0aW9uLCBsYWJlbCwgeydub25JbnRlcmFjdGlvbic6IDF9KVxuXG4gICAgQGV4cGVyaW1lbnRfc3RhcnQ6IChleHBlcmltZW50LCB2YXJpYW50KSAtPlxuICAgICAgQF90cmFjayhAbmFtZXNwYWNlLCBcIiN7ZXhwZXJpbWVudC5uYW1lfSB8ICN7dmFyaWFudH1cIiwgJ1Zpc2l0b3JzJylcblxuICAgIEBnb2FsX2NvbXBsZXRlOiAoZXhwZXJpbWVudCwgdmFyaWFudCwgZ29hbF9uYW1lLCBfcHJvcHMpIC0+XG4gICAgICBAX3RyYWNrKEBuYW1lc3BhY2UsIFwiI3tleHBlcmltZW50Lm5hbWV9IHwgI3t2YXJpYW50fVwiLCBnb2FsX25hbWUpXG5cblxuICBjbGFzcyBATG9jYWxTdG9yYWdlQWRhcHRlclxuICAgIEBuYW1lc3BhY2U6ICdhbGVwaGJldCdcbiAgICBAc2V0OiAoa2V5LCB2YWx1ZSkgLT5cbiAgICAgIG5ldyBTdG9yYWdlKEBuYW1lc3BhY2UpLnNldChrZXksIHZhbHVlKVxuICAgIEBnZXQ6IChrZXkpIC0+XG4gICAgICBuZXcgU3RvcmFnZShAbmFtZXNwYWNlKS5nZXQoa2V5KVxuXG5cbm1vZHVsZS5leHBvcnRzID0gQWRhcHRlcnNcbiIsInV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpXG5hZGFwdGVycyA9IHJlcXVpcmUoJy4vYWRhcHRlcnMnKVxub3B0aW9ucyA9IHJlcXVpcmUoJy4vb3B0aW9ucycpXG5cbmNsYXNzIEFsZXBoQmV0XG4gIEBvcHRpb25zID0gb3B0aW9uc1xuICBAdXRpbHMgPSB1dGlsc1xuXG4gIEBHaW1lbEFkYXB0ZXIgPSBhZGFwdGVycy5HaW1lbEFkYXB0ZXJcbiAgQFBlcnNpc3RlbnRRdWV1ZUdvb2dsZUFuYWx5dGljc0FkYXB0ZXIgPSBhZGFwdGVycy5QZXJzaXN0ZW50UXVldWVHb29nbGVBbmFseXRpY3NBZGFwdGVyXG4gIEBQZXJzaXN0ZW50UXVldWVLZWVuQWRhcHRlciA9IGFkYXB0ZXJzLlBlcnNpc3RlbnRRdWV1ZUtlZW5BZGFwdGVyXG5cbiAgY2xhc3MgQEV4cGVyaW1lbnRcbiAgICBAX29wdGlvbnM6XG4gICAgICBuYW1lOiBudWxsXG4gICAgICB2YXJpYW50czogbnVsbFxuICAgICAgdXNlcl9pZDogbnVsbFxuICAgICAgc2FtcGxlOiAxLjBcbiAgICAgIHRyaWdnZXI6IC0+IHRydWVcbiAgICAgIHRyYWNraW5nX2FkYXB0ZXI6IGFkYXB0ZXJzLkdvb2dsZVVuaXZlcnNhbEFuYWx5dGljc0FkYXB0ZXJcbiAgICAgIHN0b3JhZ2VfYWRhcHRlcjogYWRhcHRlcnMuTG9jYWxTdG9yYWdlQWRhcHRlclxuXG4gICAgY29uc3RydWN0b3I6IChAb3B0aW9ucyA9IHt9KSAtPlxuICAgICAgdXRpbHMuZGVmYXVsdHMoQG9wdGlvbnMsIEV4cGVyaW1lbnQuX29wdGlvbnMpXG4gICAgICBfdmFsaWRhdGUuY2FsbCh0aGlzKVxuICAgICAgQG5hbWUgPSBAb3B0aW9ucy5uYW1lXG4gICAgICBAdmFyaWFudHMgPSBAb3B0aW9ucy52YXJpYW50c1xuICAgICAgQHVzZXJfaWQgPSBAb3B0aW9ucy51c2VyX2lkXG4gICAgICBAdmFyaWFudF9uYW1lcyA9IHV0aWxzLmtleXMoQHZhcmlhbnRzKVxuICAgICAgX3J1bi5jYWxsKHRoaXMpXG5cbiAgICBAcHJvcGVydHkgJ3VzZXJfaWQnLFxuICAgICAgZ2V0OiAtPlxuICAgICAgICBpZiB0eXBlb2YgQF91c2VyX2lkIGlzICdmdW5jdGlvbicgdGhlbiByZXR1cm4gQF91c2VyX2lkKCk7XG4gICAgICAgIHJldHVybiBAX3VzZXJfaWQ7XG4gICAgICBzZXQ6ICh2YWx1ZSkgLT5cbiAgICAgICAgQF91c2VyX2lkID0gdmFsdWVcblxuICAgIHJ1bjogLT5cbiAgICAgIHV0aWxzLmxvZyhcInJ1bm5pbmcgd2l0aCBvcHRpb25zOiAje0pTT04uc3RyaW5naWZ5KEBvcHRpb25zKX1cIilcbiAgICAgIGlmIHZhcmlhbnQgPSBAZ2V0X3N0b3JlZF92YXJpYW50KClcbiMgYSB2YXJpYW50IHdhcyBhbHJlYWR5IGNob3Nlbi4gYWN0aXZhdGUgaXRcbiAgICAgICAgdXRpbHMubG9nKFwiI3t2YXJpYW50fSBhY3RpdmVcIilcbiAgICAgICAgQGFjdGl2YXRlX3ZhcmlhbnQodmFyaWFudClcbiAgICAgIGVsc2VcbiAgICAgICAgQGNvbmRpdGlvbmFsbHlfYWN0aXZhdGVfdmFyaWFudCgpXG5cbiAgICBfcnVuID0gLT4gQHJ1bigpXG5cbiAgICBhY3RpdmF0ZV92YXJpYW50OiAodmFyaWFudCkgLT5cbiAgICAgIEB2YXJpYW50c1t2YXJpYW50XT8uYWN0aXZhdGUodGhpcylcbiAgICAgIEBzdG9yYWdlKCkuc2V0KFwiI3tAb3B0aW9ucy5uYW1lfTp2YXJpYW50XCIsIHZhcmlhbnQpXG5cbiMgaWYgZXhwZXJpbWVudCBjb25kaXRpb25zIG1hdGNoLCBwaWNrIGFuZCBhY3RpdmF0ZSBhIHZhcmlhbnQsIHRyYWNrIGV4cGVyaW1lbnQgc3RhcnRcbiAgICBjb25kaXRpb25hbGx5X2FjdGl2YXRlX3ZhcmlhbnQ6IC0+XG4gICAgICByZXR1cm4gdW5sZXNzIEBvcHRpb25zLnRyaWdnZXIoKVxuICAgICAgdXRpbHMubG9nKCd0cmlnZ2VyIHNldCcpXG4gICAgICByZXR1cm4gdW5sZXNzIEBpbl9zYW1wbGUoKVxuICAgICAgdXRpbHMubG9nKCdpbiBzYW1wbGUnKVxuICAgICAgdmFyaWFudCA9IEBwaWNrX3ZhcmlhbnQoKVxuICAgICAgQHRyYWNraW5nKCkuZXhwZXJpbWVudF9zdGFydCh0aGlzLCB2YXJpYW50KVxuICAgICAgQGFjdGl2YXRlX3ZhcmlhbnQodmFyaWFudClcblxuICAgIGdvYWxfY29tcGxldGU6IChnb2FsX25hbWUsIHByb3BzID0ge30pIC0+XG4gICAgICB1dGlscy5kZWZhdWx0cyhwcm9wcywge3VuaXF1ZTogdHJ1ZX0pXG4gICAgICByZXR1cm4gaWYgcHJvcHMudW5pcXVlICYmIEBzdG9yYWdlKCkuZ2V0KFwiI3tAb3B0aW9ucy5uYW1lfToje2dvYWxfbmFtZX1cIilcbiAgICAgIHZhcmlhbnQgPSBAZ2V0X3N0b3JlZF92YXJpYW50KClcbiAgICAgIHJldHVybiB1bmxlc3MgdmFyaWFudFxuICAgICAgQHN0b3JhZ2UoKS5zZXQoXCIje0BvcHRpb25zLm5hbWV9OiN7Z29hbF9uYW1lfVwiLCB0cnVlKSBpZiBwcm9wcy51bmlxdWVcbiAgICAgIHV0aWxzLmxvZyhcImV4cGVyaW1lbnQ6ICN7QG9wdGlvbnMubmFtZX0gdmFyaWFudDoje3ZhcmlhbnR9IGdvYWw6I3tnb2FsX25hbWV9IGNvbXBsZXRlXCIpXG4gICAgICBAdHJhY2tpbmcoKS5nb2FsX2NvbXBsZXRlKHRoaXMsIHZhcmlhbnQsIGdvYWxfbmFtZSwgcHJvcHMpXG5cbiAgICBnZXRfc3RvcmVkX3ZhcmlhbnQ6IC0+XG4gICAgICBAc3RvcmFnZSgpLmdldChcIiN7QG9wdGlvbnMubmFtZX06dmFyaWFudFwiKVxuXG4gICAgcGlja192YXJpYW50OiAtPlxuICAgICAgYWxsX3ZhcmlhbnRzX2hhdmVfd2VpZ2h0cyA9IHV0aWxzLmNoZWNrX3dlaWdodHMoQHZhcmlhbnRzKVxuICAgICAgdXRpbHMubG9nKFwiYWxsIHZhcmlhbnRzIGhhdmUgd2VpZ2h0czogI3thbGxfdmFyaWFudHNfaGF2ZV93ZWlnaHRzfVwiKVxuICAgICAgaWYgYWxsX3ZhcmlhbnRzX2hhdmVfd2VpZ2h0cyB0aGVuIEBwaWNrX3dlaWdodGVkX3ZhcmlhbnQoKSBlbHNlIEBwaWNrX3Vud2VpZ2h0ZWRfdmFyaWFudCgpXG5cbiAgICBwaWNrX3dlaWdodGVkX3ZhcmlhbnQ6IC0+XG5cbiMgQ2hvb3NpbmcgYSB3ZWlnaHRlZCB2YXJpYW50OlxuIyBGb3IgQSwgQiwgQyB3aXRoIHdlaWdodHMgMSwgMywgNlxuIyB2YXJpYW50cyA9IEEsIEIsIENcbiMgd2VpZ2h0cyA9IDEsIDMsIDZcbiMgd2VpZ2h0c19zdW0gPSAxMCAoc3VtIG9mIHdlaWdodHMpXG4jIHdlaWdodGVkX2luZGV4ID0gMi4xIChyYW5kb20gbnVtYmVyIGJldHdlZW4gMCBhbmQgd2VpZ2h0IHN1bSlcbiMgQUJCQkNDQ0NDQ1xuIyA9PV5cbiMgU2VsZWN0IEJcbiAgICAgIHdlaWdodHNfc3VtID0gdXRpbHMuc3VtX3dlaWdodHMoQHZhcmlhbnRzKVxuICAgICAgd2VpZ2h0ZWRfaW5kZXggPSBNYXRoLmNlaWwoKEBfcmFuZG9tKCd2YXJpYW50JykgKiB3ZWlnaHRzX3N1bSkpXG4gICAgICBmb3Iga2V5LCB2YWx1ZSBvZiBAdmFyaWFudHNcbiMgdGhlbiB3ZSBhcmUgc3Vic3RyYWN0aW5nIHZhcmlhbnQgd2VpZ2h0IGZyb20gc2VsZWN0ZWQgbnVtYmVyXG4jIGFuZCBpdCBpdCByZWFjaGVzIDAgKG9yIGJlbG93KSB3ZSBhcmUgc2VsZWN0aW5nIHRoaXMgdmFyaWFudFxuICAgICAgICB3ZWlnaHRlZF9pbmRleCAtPSB2YWx1ZS53ZWlnaHRcbiAgICAgICAgcmV0dXJuIGtleSBpZiB3ZWlnaHRlZF9pbmRleCA8PSAwXG5cbiAgICBwaWNrX3Vud2VpZ2h0ZWRfdmFyaWFudDogLT5cbiAgICAgIHBhcnRpdGlvbnMgPSAxLjAgLyBAdmFyaWFudF9uYW1lcy5sZW5ndGhcbiAgICAgIGNob3Nlbl9wYXJ0aXRpb24gPSBNYXRoLmZsb29yKEBfcmFuZG9tKCd2YXJpYW50JykgLyBwYXJ0aXRpb25zKVxuICAgICAgdmFyaWFudCA9IEB2YXJpYW50X25hbWVzW2Nob3Nlbl9wYXJ0aXRpb25dXG4gICAgICB1dGlscy5sb2coXCIje3ZhcmlhbnR9IHBpY2tlZFwiKVxuICAgICAgdmFyaWFudFxuXG4gICAgaW5fc2FtcGxlOiAtPlxuICAgICAgYWN0aXZlID0gQHN0b3JhZ2UoKS5nZXQoXCIje0BvcHRpb25zLm5hbWV9OmluX3NhbXBsZVwiKVxuICAgICAgcmV0dXJuIGFjdGl2ZSB1bmxlc3MgdHlwZW9mIGFjdGl2ZSBpcyAndW5kZWZpbmVkJ1xuICAgICAgYWN0aXZlID0gQF9yYW5kb20oJ3NhbXBsZScpIDw9IEBvcHRpb25zLnNhbXBsZVxuICAgICAgQHN0b3JhZ2UoKS5zZXQoXCIje0BvcHRpb25zLm5hbWV9OmluX3NhbXBsZVwiLCBhY3RpdmUpXG4gICAgICBhY3RpdmVcblxuICAgIF9yYW5kb206IChzYWx0KSAtPlxuICAgICAgcmV0dXJuIHV0aWxzLnJhbmRvbSgpIHVubGVzcyBAdXNlcl9pZFxuICAgICAgc2VlZCA9IFwiI3tAbmFtZX0uI3tzYWx0fS4je0B1c2VyX2lkfVwiXG4gICAgICB1dGlscy5yYW5kb20oc2VlZClcblxuICAgIGFkZF9nb2FsOiAoZ29hbCkgLT5cbiAgICAgIGdvYWwuYWRkX2V4cGVyaW1lbnQodGhpcylcblxuICAgIGFkZF9nb2FsczogKGdvYWxzKSAtPlxuICAgICAgQGFkZF9nb2FsKGdvYWwpIGZvciBnb2FsIGluIGdvYWxzXG5cbiAgICBzdG9yYWdlOiAtPiBAb3B0aW9ucy5zdG9yYWdlX2FkYXB0ZXJcblxuICAgIHRyYWNraW5nOiAtPiBAb3B0aW9ucy50cmFja2luZ19hZGFwdGVyXG5cbiAgICBfdmFsaWRhdGUgPSAtPlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdhbiBleHBlcmltZW50IG5hbWUgbXVzdCBiZSBzcGVjaWZpZWQnKSBpZiBAb3B0aW9ucy5uYW1lIGlzIG51bGxcbiAgICAgIHRocm93IG5ldyBFcnJvcigndmFyaWFudHMgbXVzdCBiZSBwcm92aWRlZCcpIGlmIEBvcHRpb25zLnZhcmlhbnRzIGlzIG51bGxcbiAgICAgIHRocm93IG5ldyBFcnJvcigndHJpZ2dlciBtdXN0IGJlIGEgZnVuY3Rpb24nKSBpZiB0eXBlb2YgQG9wdGlvbnMudHJpZ2dlciBpc250ICdmdW5jdGlvbidcbiAgICAgIGFsbF92YXJpYW50c19oYXZlX3dlaWdodHMgPSB1dGlscy52YWxpZGF0ZV93ZWlnaHRzIEBvcHRpb25zLnZhcmlhbnRzXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ25vdCBhbGwgdmFyaWFudHMgaGF2ZSB3ZWlnaHRzJykgaWYgIWFsbF92YXJpYW50c19oYXZlX3dlaWdodHNcblxuICBjbGFzcyBAR29hbFxuICAgIGNvbnN0cnVjdG9yOiAoQG5hbWUsIEBwcm9wcyA9IHt9KSAtPlxuICAgICAgdXRpbHMuZGVmYXVsdHMoQHByb3BzLCB7dW5pcXVlOiB0cnVlfSlcbiAgICAgIEBleHBlcmltZW50cyA9IFtdXG5cbiAgICBhZGRfZXhwZXJpbWVudDogKGV4cGVyaW1lbnQpIC0+XG4gICAgICBAZXhwZXJpbWVudHMucHVzaChleHBlcmltZW50KVxuXG4gICAgYWRkX2V4cGVyaW1lbnRzOiAoZXhwZXJpbWVudHMpIC0+XG4gICAgICBAYWRkX2V4cGVyaW1lbnQoZXhwZXJpbWVudCkgZm9yIGV4cGVyaW1lbnQgaW4gZXhwZXJpbWVudHNcblxuICAgIGNvbXBsZXRlOiAtPlxuICAgICAgZm9yIGV4cGVyaW1lbnQgaW4gQGV4cGVyaW1lbnRzXG4gICAgICAgIGV4cGVyaW1lbnQuZ29hbF9jb21wbGV0ZShAbmFtZSwgQHByb3BzKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gQWxlcGhCZXRcbiIsIm1vZHVsZS5leHBvcnRzID1cbiAgZGVidWc6IGZhbHNlXG4iLCJCYXNpbCA9IHJlcXVpcmUoJ2Jhc2lsLmpzJylcbnN0b3JlID0gbmV3IEJhc2lsKG5hbWVzcGFjZTogbnVsbClcblxuIyBhIHRoaW4gd3JhcHBlciBhcm91bmQgYmFzaWwuanMgZm9yIGVhc3kgc3dhcHBpbmdcbmNsYXNzIFN0b3JhZ2VcbiAgY29uc3RydWN0b3I6IChAbmFtZXNwYWNlPSdhbGVwaGJldCcpIC0+XG4gICAgQHN0b3JhZ2UgPSBzdG9yZS5nZXQoQG5hbWVzcGFjZSkgfHwge31cbiAgc2V0OiAoa2V5LCB2YWx1ZSkgLT5cbiAgICBAc3RvcmFnZVtrZXldID0gdmFsdWVcbiAgICBzdG9yZS5zZXQoQG5hbWVzcGFjZSwgQHN0b3JhZ2UpXG4gICAgcmV0dXJuIHZhbHVlXG4gIGdldDogKGtleSkgLT5cbiAgICBAc3RvcmFnZVtrZXldXG4gICAgIyBzdG9yZS5nZXQoXCIje0BuYW1lc3BhY2V9OiN7a2V5fVwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFN0b3JhZ2VcbiIsIiMgTk9URTogdXNpbmcgYSBjdXN0b20gYnVpbGQgb2YgbG9kYXNoLCB0byBzYXZlIHNwYWNlXG5fID0gcmVxdWlyZSgnLi4vdmVuZG9yL2xvZGFzaC5jdXN0b20ubWluJylcbnV1aWQgPSByZXF1aXJlKCdub2RlLXV1aWQnKVxuc2hhMSA9IHJlcXVpcmUoJ2NyeXB0by1qcy9zaGExJylcbm9wdGlvbnMgPSByZXF1aXJlKCcuL29wdGlvbnMnKVxuXG5jbGFzcyBVdGlsc1xuICBAZGVmYXVsdHM6IF8uZGVmYXVsdHNcbiAgQGtleXM6IF8ua2V5c1xuICBAcmVtb3ZlOiBfLnJlbW92ZVxuICBAb21pdDogXy5vbWl0XG4gIEBsb2c6IChtZXNzYWdlKSAtPlxuICAgIGNvbnNvbGUubG9nKG1lc3NhZ2UpIGlmIG9wdGlvbnMuZGVidWdcbiAgQHV1aWQ6IHV1aWQudjRcbiAgQHNoYTE6ICh0ZXh0KSAtPlxuICAgIHNoYTEodGV4dCkudG9TdHJpbmcoKVxuICBAcmFuZG9tOiAoc2VlZCkgLT5cbiAgICByZXR1cm4gTWF0aC5yYW5kb20oKSB1bmxlc3Mgc2VlZFxuICAgICMgYSBNVUNIIHNpbXBsaWZpZWQgdmVyc2lvbiBpbnNwaXJlZCBieSBQbGFuT3V0LmpzXG4gICAgcGFyc2VJbnQoQHNoYTEoc2VlZCkuc3Vic3RyKDAsIDEzKSwgMTYpIC8gMHhGRkZGRkZGRkZGRkZGXG4gIEBjaGVja193ZWlnaHRzOiAodmFyaWFudHMpIC0+XG4gICAgY29udGFpbnNfd2VpZ2h0ID0gW11cbiAgICBjb250YWluc193ZWlnaHQucHVzaCh2YWx1ZS53ZWlnaHQ/KSBmb3Iga2V5LCB2YWx1ZSBvZiB2YXJpYW50c1xuICAgIGNvbnRhaW5zX3dlaWdodC5ldmVyeSAoaGFzX3dlaWdodCkgLT4gaGFzX3dlaWdodFxuICBAc3VtX3dlaWdodHM6ICh2YXJpYW50cykgLT5cbiAgICBzdW0gPSAwXG4gICAgZm9yIGtleSwgdmFsdWUgb2YgdmFyaWFudHNcbiAgICAgIHN1bSArPSB2YWx1ZS53ZWlnaHQgfHwgMFxuICAgIHN1bVxuICBAdmFsaWRhdGVfd2VpZ2h0czogKHZhcmlhbnRzKSAtPlxuICAgIGNvbnRhaW5zX3dlaWdodCA9IFtdXG4gICAgY29udGFpbnNfd2VpZ2h0LnB1c2godmFsdWUud2VpZ2h0PykgZm9yIGtleSwgdmFsdWUgb2YgdmFyaWFudHNcbiAgICBjb250YWluc193ZWlnaHQuZXZlcnkgKGhhc193ZWlnaHQpIC0+IGhhc193ZWlnaHQgb3IgY29udGFpbnNfd2VpZ2h0LmV2ZXJ5IChoYXNfd2VpZ2h0KSAtPiAhaGFzX3dlaWdodFxubW9kdWxlLmV4cG9ydHMgPSBVdGlsc1xuIiwiLyoqXG4gKiBAbGljZW5zZVxuICogTG9kYXNoIChDdXN0b20gQnVpbGQpIGxvZGFzaC5jb20vbGljZW5zZSB8IFVuZGVyc2NvcmUuanMgMS44LjMgdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFXG4gKiBCdWlsZDogYGxvZGFzaCAtcCBpbmNsdWRlPVwia2V5cyxkZWZhdWx0cyxyZW1vdmUsb21pdFwiIGV4cG9ydHM9XCJub2RlXCIgLW8gLi92ZW5kb3IvbG9kYXNoLmN1c3RvbS5taW4uanNgXG4gKi9cbjsoZnVuY3Rpb24oKXtmdW5jdGlvbiB0KHQsZSxyKXtzd2l0Y2goci5sZW5ndGgpe2Nhc2UgMDpyZXR1cm4gdC5jYWxsKGUpO2Nhc2UgMTpyZXR1cm4gdC5jYWxsKGUsclswXSk7Y2FzZSAyOnJldHVybiB0LmNhbGwoZSxyWzBdLHJbMV0pO2Nhc2UgMzpyZXR1cm4gdC5jYWxsKGUsclswXSxyWzFdLHJbMl0pfXJldHVybiB0LmFwcGx5KGUscil9ZnVuY3Rpb24gZSh0LGUpe2Zvcih2YXIgcj0tMSxuPW51bGw9PXQ/MDp0Lmxlbmd0aDsrK3I8biYmZmFsc2UhPT1lKHRbcl0scix0KTspO31mdW5jdGlvbiByKHQsZSl7Zm9yKHZhciByPS0xLG49bnVsbD09dD8wOnQubGVuZ3RoLG89MCxjPVtdOysrcjxuOyl7dmFyIHU9dFtyXTtlKHUscix0KSYmKGNbbysrXT11KX1yZXR1cm4gY31mdW5jdGlvbiBuKHQsZSl7Zm9yKHZhciByPS0xLG49bnVsbD09dD8wOnQubGVuZ3RoLG89QXJyYXkobik7KytyPG47KW9bcl09ZSh0W3JdLHIsdCk7cmV0dXJuIG99ZnVuY3Rpb24gbyh0LGUpe2Zvcih2YXIgcj0tMSxuPWUubGVuZ3RoLG89dC5sZW5ndGg7KytyPG47KXRbbytyXT1lW3JdO1xucmV0dXJuIHR9ZnVuY3Rpb24gYyh0LGUpe2Zvcih2YXIgcj0tMSxuPW51bGw9PXQ/MDp0Lmxlbmd0aDsrK3I8bjspaWYoZSh0W3JdLHIsdCkpcmV0dXJuIHRydWU7cmV0dXJuIGZhbHNlfWZ1bmN0aW9uIHUodCl7cmV0dXJuIGZ1bmN0aW9uKGUpe3JldHVybiBudWxsPT1lP0J0OmVbdF19fWZ1bmN0aW9uIGEodCl7cmV0dXJuIGZ1bmN0aW9uKGUpe3JldHVybiB0KGUpfX1mdW5jdGlvbiBpKHQpe3ZhciBlPS0xLHI9QXJyYXkodC5zaXplKTtyZXR1cm4gdC5mb3JFYWNoKGZ1bmN0aW9uKHQsbil7clsrK2VdPVtuLHRdfSkscn1mdW5jdGlvbiBmKHQpe3ZhciBlPU9iamVjdDtyZXR1cm4gZnVuY3Rpb24ocil7cmV0dXJuIHQoZShyKSl9fWZ1bmN0aW9uIGwodCl7dmFyIGU9LTEscj1BcnJheSh0LnNpemUpO3JldHVybiB0LmZvckVhY2goZnVuY3Rpb24odCl7clsrK2VdPXR9KSxyfWZ1bmN0aW9uIHMoKXt9ZnVuY3Rpb24gYih0KXt2YXIgZT0tMSxyPW51bGw9PXQ/MDp0Lmxlbmd0aDtmb3IodGhpcy5jbGVhcigpOysrZTxyOyl7XG52YXIgbj10W2VdO3RoaXMuc2V0KG5bMF0sblsxXSl9fWZ1bmN0aW9uIGgodCl7dmFyIGU9LTEscj1udWxsPT10PzA6dC5sZW5ndGg7Zm9yKHRoaXMuY2xlYXIoKTsrK2U8cjspe3ZhciBuPXRbZV07dGhpcy5zZXQoblswXSxuWzFdKX19ZnVuY3Rpb24gcCh0KXt2YXIgZT0tMSxyPW51bGw9PXQ/MDp0Lmxlbmd0aDtmb3IodGhpcy5jbGVhcigpOysrZTxyOyl7dmFyIG49dFtlXTt0aGlzLnNldChuWzBdLG5bMV0pfX1mdW5jdGlvbiB5KHQpe3ZhciBlPS0xLHI9bnVsbD09dD8wOnQubGVuZ3RoO2Zvcih0aGlzLl9fZGF0YV9fPW5ldyBwOysrZTxyOyl0aGlzLmFkZCh0W2VdKX1mdW5jdGlvbiBqKHQpe3RoaXMuc2l6ZT0odGhpcy5fX2RhdGFfXz1uZXcgaCh0KSkuc2l6ZX1mdW5jdGlvbiBfKHQsZSl7dmFyIHI9S2UodCksbj0hciYmSmUodCksbz0hciYmIW4mJlFlKHQpLGM9IXImJiFuJiYhbyYmWmUodCk7aWYocj1yfHxufHxvfHxjKXtmb3IodmFyIG49dC5sZW5ndGgsdT1TdHJpbmcsYT0tMSxpPUFycmF5KG4pOysrYTxuOylpW2FdPXUoYSk7XG5uPWl9ZWxzZSBuPVtdO3ZhciBmLHU9bi5sZW5ndGg7Zm9yKGYgaW4gdCkhZSYmIXVlLmNhbGwodCxmKXx8ciYmKFwibGVuZ3RoXCI9PWZ8fG8mJihcIm9mZnNldFwiPT1mfHxcInBhcmVudFwiPT1mKXx8YyYmKFwiYnVmZmVyXCI9PWZ8fFwiYnl0ZUxlbmd0aFwiPT1mfHxcImJ5dGVPZmZzZXRcIj09Zil8fGN0KGYsdSkpfHxuLnB1c2goZik7cmV0dXJuIG59ZnVuY3Rpb24gZyh0LGUscil7dmFyIG49dFtlXTt1ZS5jYWxsKHQsZSkmJnl0KG4scikmJihyIT09QnR8fGUgaW4gdCl8fHcodCxlLHIpfWZ1bmN0aW9uIHYodCxlKXtmb3IodmFyIHI9dC5sZW5ndGg7ci0tOylpZih5dCh0W3JdWzBdLGUpKXJldHVybiByO3JldHVybi0xfWZ1bmN0aW9uIGQodCxlKXtyZXR1cm4gdCYmVyhlLHp0KGUpLHQpfWZ1bmN0aW9uIEEodCxlKXtyZXR1cm4gdCYmVyhlLGt0KGUpLHQpfWZ1bmN0aW9uIHcodCxlLHIpe1wiX19wcm90b19fXCI9PWUmJkFlP0FlKHQsZSx7Y29uZmlndXJhYmxlOnRydWUsZW51bWVyYWJsZTp0cnVlLHZhbHVlOnIsXG53cml0YWJsZTp0cnVlfSk6dFtlXT1yfWZ1bmN0aW9uIG0odCxyLG4sbyxjLHUpe3ZhciBhLGk9MSZyLGY9MiZyLGw9NCZyO2lmKG4mJihhPWM/bih0LG8sYyx1KTpuKHQpKSxhIT09QnQpcmV0dXJuIGE7aWYoIXZ0KHQpKXJldHVybiB0O2lmKG89S2UodCkpe2lmKGE9cnQodCksIWkpcmV0dXJuIE4odCxhKX1lbHNle3ZhciBzPUdlKHQpLGI9XCJbb2JqZWN0IEZ1bmN0aW9uXVwiPT1zfHxcIltvYmplY3QgR2VuZXJhdG9yRnVuY3Rpb25dXCI9PXM7aWYoUWUodCkpcmV0dXJuIFIodCxpKTtpZihcIltvYmplY3QgT2JqZWN0XVwiPT1zfHxcIltvYmplY3QgQXJndW1lbnRzXVwiPT1zfHxiJiYhYyl7aWYoYT1mfHxiP3t9OnR5cGVvZiB0LmNvbnN0cnVjdG9yIT1cImZ1bmN0aW9uXCJ8fGF0KHQpP3t9OlJlKHllKHQpKSwhaSlyZXR1cm4gZj9xKHQsQShhLHQpKTpHKHQsZChhLHQpKX1lbHNle2lmKCFXdFtzXSlyZXR1cm4gYz90Ont9O2E9bnQodCxzLGkpfX1pZih1fHwodT1uZXcgaiksYz11LmdldCh0KSlyZXR1cm4gYztcbmlmKHUuc2V0KHQsYSksWWUodCkpcmV0dXJuIHQuZm9yRWFjaChmdW5jdGlvbihlKXthLmFkZChtKGUscixuLGUsdCx1KSl9KSxhO2lmKFhlKHQpKXJldHVybiB0LmZvckVhY2goZnVuY3Rpb24oZSxvKXthLnNldChvLG0oZSxyLG4sbyx0LHUpKX0pLGE7dmFyIGY9bD9mP1g6UTpmP2t0Onp0LGg9bz9CdDpmKHQpO3JldHVybiBlKGh8fHQsZnVuY3Rpb24oZSxvKXtoJiYobz1lLGU9dFtvXSksZyhhLG8sbShlLHIsbixvLHQsdSkpfSksYX1mdW5jdGlvbiBPKHQsZSxyLG4sYyl7dmFyIHU9LTEsYT10Lmxlbmd0aDtmb3Iocnx8KHI9b3QpLGN8fChjPVtdKTsrK3U8YTspe3ZhciBpPXRbdV07MDxlJiZyKGkpPzE8ZT9PKGksZS0xLHIsbixjKTpvKGMsaSk6bnx8KGNbYy5sZW5ndGhdPWkpfXJldHVybiBjfWZ1bmN0aW9uIFModCxlKXtlPVYoZSx0KTtmb3IodmFyIHI9MCxuPWUubGVuZ3RoO251bGwhPXQmJnI8bjspdD10W2x0KGVbcisrXSldO3JldHVybiByJiZyPT1uP3Q6QnR9ZnVuY3Rpb24geih0LGUscil7XG5yZXR1cm4gZT1lKHQpLEtlKHQpP2U6byhlLHIodCkpfWZ1bmN0aW9uIGsodCl7aWYobnVsbD09dCl0PXQ9PT1CdD9cIltvYmplY3QgVW5kZWZpbmVkXVwiOlwiW29iamVjdCBOdWxsXVwiO2Vsc2UgaWYoZGUmJmRlIGluIE9iamVjdCh0KSl7dmFyIGU9dWUuY2FsbCh0LGRlKSxyPXRbZGVdO3RyeXt0W2RlXT1CdDt2YXIgbj10cnVlfWNhdGNoKHQpe312YXIgbz1pZS5jYWxsKHQpO24mJihlP3RbZGVdPXI6ZGVsZXRlIHRbZGVdKSx0PW99ZWxzZSB0PWllLmNhbGwodCk7cmV0dXJuIHR9ZnVuY3Rpb24geCh0KXtyZXR1cm4gZHQodCkmJlwiW29iamVjdCBBcmd1bWVudHNdXCI9PWsodCl9ZnVuY3Rpb24gRSh0LGUscixuLG8pe2lmKHQ9PT1lKWU9dHJ1ZTtlbHNlIGlmKG51bGw9PXR8fG51bGw9PWV8fCFkdCh0KSYmIWR0KGUpKWU9dCE9PXQmJmUhPT1lO2Vsc2UgdDp7dmFyIGM9S2UodCksdT1LZShlKSxhPWM/XCJbb2JqZWN0IEFycmF5XVwiOkdlKHQpLGk9dT9cIltvYmplY3QgQXJyYXldXCI6R2UoZSksYT1cIltvYmplY3QgQXJndW1lbnRzXVwiPT1hP1wiW29iamVjdCBPYmplY3RdXCI6YSxpPVwiW29iamVjdCBBcmd1bWVudHNdXCI9PWk/XCJbb2JqZWN0IE9iamVjdF1cIjppLGY9XCJbb2JqZWN0IE9iamVjdF1cIj09YSx1PVwiW29iamVjdCBPYmplY3RdXCI9PWk7XG5pZigoaT1hPT1pKSYmUWUodCkpe2lmKCFRZShlKSl7ZT1mYWxzZTticmVhayB0fWM9dHJ1ZSxmPWZhbHNlfWlmKGkmJiFmKW98fChvPW5ldyBqKSxlPWN8fFplKHQpP0oodCxlLHIsbixFLG8pOksodCxlLGEscixuLEUsbyk7ZWxzZXtpZighKDEmcikmJihjPWYmJnVlLmNhbGwodCxcIl9fd3JhcHBlZF9fXCIpLGE9dSYmdWUuY2FsbChlLFwiX193cmFwcGVkX19cIiksY3x8YSkpe3Q9Yz90LnZhbHVlKCk6dCxlPWE/ZS52YWx1ZSgpOmUsb3x8KG89bmV3IGopLGU9RSh0LGUscixuLG8pO2JyZWFrIHR9aWYoaSllOmlmKG98fChvPW5ldyBqKSxjPTEmcixhPVEodCksdT1hLmxlbmd0aCxpPVEoZSkubGVuZ3RoLHU9PWl8fGMpe2ZvcihmPXU7Zi0tOyl7dmFyIGw9YVtmXTtpZighKGM/bCBpbiBlOnVlLmNhbGwoZSxsKSkpe2U9ZmFsc2U7YnJlYWsgZX19aWYoKGk9by5nZXQodCkpJiZvLmdldChlKSllPWk9PWU7ZWxzZXtpPXRydWUsby5zZXQodCxlKSxvLnNldChlLHQpO2Zvcih2YXIgcz1jOysrZjx1Oyl7dmFyIGw9YVtmXSxiPXRbbF0saD1lW2xdO1xuaWYobil2YXIgcD1jP24oaCxiLGwsZSx0LG8pOm4oYixoLGwsdCxlLG8pO2lmKHA9PT1CdD9iIT09aCYmIUUoYixoLHIsbixvKTohcCl7aT1mYWxzZTticmVha31zfHwocz1cImNvbnN0cnVjdG9yXCI9PWwpfWkmJiFzJiYocj10LmNvbnN0cnVjdG9yLG49ZS5jb25zdHJ1Y3RvcixyIT1uJiZcImNvbnN0cnVjdG9yXCJpbiB0JiZcImNvbnN0cnVjdG9yXCJpbiBlJiYhKHR5cGVvZiByPT1cImZ1bmN0aW9uXCImJnIgaW5zdGFuY2VvZiByJiZ0eXBlb2Ygbj09XCJmdW5jdGlvblwiJiZuIGluc3RhbmNlb2YgbikmJihpPWZhbHNlKSksby5kZWxldGUodCksby5kZWxldGUoZSksZT1pfX1lbHNlIGU9ZmFsc2U7ZWxzZSBlPWZhbHNlfX1yZXR1cm4gZX1mdW5jdGlvbiBGKHQpe3JldHVybiBkdCh0KSYmXCJbb2JqZWN0IE1hcF1cIj09R2UodCl9ZnVuY3Rpb24gSSh0LGUpe3ZhciByPWUubGVuZ3RoLG49cjtpZihudWxsPT10KXJldHVybiFuO2Zvcih0PU9iamVjdCh0KTtyLS07KXt2YXIgbz1lW3JdO2lmKG9bMl0/b1sxXSE9PXRbb1swXV06IShvWzBdaW4gdCkpcmV0dXJuIGZhbHNlO1xufWZvcig7KytyPG47KXt2YXIgbz1lW3JdLGM9b1swXSx1PXRbY10sYT1vWzFdO2lmKG9bMl0pe2lmKHU9PT1CdCYmIShjIGluIHQpKXJldHVybiBmYWxzZX1lbHNlIGlmKG89bmV3IGosdm9pZCAwPT09QnQ/IUUoYSx1LDMsdm9pZCAwLG8pOjEpcmV0dXJuIGZhbHNlfXJldHVybiB0cnVlfWZ1bmN0aW9uIE0odCl7cmV0dXJuIGR0KHQpJiZcIltvYmplY3QgU2V0XVwiPT1HZSh0KX1mdW5jdGlvbiBVKHQpe3JldHVybiBkdCh0KSYmZ3QodC5sZW5ndGgpJiYhIU50W2sodCldfWZ1bmN0aW9uIEIodCl7cmV0dXJuIHR5cGVvZiB0PT1cImZ1bmN0aW9uXCI/dDpudWxsPT10P0V0OnR5cGVvZiB0PT1cIm9iamVjdFwiP0tlKHQpP1AodFswXSx0WzFdKTpEKHQpOkl0KHQpfWZ1bmN0aW9uIEQodCl7dmFyIGU9dHQodCk7cmV0dXJuIDE9PWUubGVuZ3RoJiZlWzBdWzJdP2l0KGVbMF1bMF0sZVswXVsxXSk6ZnVuY3Rpb24ocil7cmV0dXJuIHI9PT10fHxJKHIsZSl9fWZ1bmN0aW9uIFAodCxlKXtyZXR1cm4gdXQodCkmJmU9PT1lJiYhdnQoZSk/aXQobHQodCksZSk6ZnVuY3Rpb24ocil7XG52YXIgbj1PdChyLHQpO3JldHVybiBuPT09QnQmJm49PT1lP1N0KHIsdCk6RShlLG4sMyl9fWZ1bmN0aW9uICQodCl7cmV0dXJuIGZ1bmN0aW9uKGUpe3JldHVybiBTKGUsdCl9fWZ1bmN0aW9uIEwodCl7aWYodHlwZW9mIHQ9PVwic3RyaW5nXCIpcmV0dXJuIHQ7aWYoS2UodCkpcmV0dXJuIG4odCxMKStcIlwiO2lmKHd0KHQpKXJldHVybiBWZT9WZS5jYWxsKHQpOlwiXCI7dmFyIGU9dCtcIlwiO3JldHVyblwiMFwiPT1lJiYxL3Q9PS1EdD9cIi0wXCI6ZX1mdW5jdGlvbiBDKHQsZSl7ZT1WKGUsdCk7dmFyIHI7aWYoMj5lLmxlbmd0aClyPXQ7ZWxzZXtyPWU7dmFyIG49MCxvPS0xLGM9LTEsdT1yLmxlbmd0aDtmb3IoMD5uJiYobj0tbj51PzA6dStuKSxvPW8+dT91Om8sMD5vJiYobys9dSksdT1uPm8/MDpvLW4+Pj4wLG4+Pj49MCxvPUFycmF5KHUpOysrYzx1OylvW2NdPXJbYytuXTtyPVModCxvKX10PXIsbnVsbD09dHx8ZGVsZXRlIHRbbHQoaHQoZSkpXX1mdW5jdGlvbiBWKHQsZSl7cmV0dXJuIEtlKHQpP3Q6dXQodCxlKT9bdF06SGUobXQodCkpO1xufWZ1bmN0aW9uIFIodCxlKXtpZihlKXJldHVybiB0LnNsaWNlKCk7dmFyIHI9dC5sZW5ndGgscj1wZT9wZShyKTpuZXcgdC5jb25zdHJ1Y3RvcihyKTtyZXR1cm4gdC5jb3B5KHIpLHJ9ZnVuY3Rpb24gVCh0KXt2YXIgZT1uZXcgdC5jb25zdHJ1Y3Rvcih0LmJ5dGVMZW5ndGgpO3JldHVybiBuZXcgaGUoZSkuc2V0KG5ldyBoZSh0KSksZX1mdW5jdGlvbiBOKHQsZSl7dmFyIHI9LTEsbj10Lmxlbmd0aDtmb3IoZXx8KGU9QXJyYXkobikpOysrcjxuOyllW3JdPXRbcl07cmV0dXJuIGV9ZnVuY3Rpb24gVyh0LGUscil7dmFyIG49IXI7cnx8KHI9e30pO2Zvcih2YXIgbz0tMSxjPWUubGVuZ3RoOysrbzxjOyl7dmFyIHU9ZVtvXSxhPUJ0O2E9PT1CdCYmKGE9dFt1XSksbj93KHIsdSxhKTpnKHIsdSxhKX1yZXR1cm4gcn1mdW5jdGlvbiBHKHQsZSl7cmV0dXJuIFcodCxOZSh0KSxlKX1mdW5jdGlvbiBxKHQsZSl7cmV0dXJuIFcodCxXZSh0KSxlKX1mdW5jdGlvbiBIKHQpe3JldHVybiBBdCh0KT9CdDp0O1xufWZ1bmN0aW9uIEoodCxlLHIsbixvLHUpe3ZhciBhPTEmcixpPXQubGVuZ3RoLGY9ZS5sZW5ndGg7aWYoaSE9ZiYmIShhJiZmPmkpKXJldHVybiBmYWxzZTtpZigoZj11LmdldCh0KSkmJnUuZ2V0KGUpKXJldHVybiBmPT1lO3ZhciBmPS0xLGw9dHJ1ZSxzPTImcj9uZXcgeTpCdDtmb3IodS5zZXQodCxlKSx1LnNldChlLHQpOysrZjxpOyl7dmFyIGI9dFtmXSxoPWVbZl07aWYobil2YXIgcD1hP24oaCxiLGYsZSx0LHUpOm4oYixoLGYsdCxlLHUpO2lmKHAhPT1CdCl7aWYocCljb250aW51ZTtsPWZhbHNlO2JyZWFrfWlmKHMpe2lmKCFjKGUsZnVuY3Rpb24odCxlKXtpZighcy5oYXMoZSkmJihiPT09dHx8byhiLHQscixuLHUpKSlyZXR1cm4gcy5wdXNoKGUpfSkpe2w9ZmFsc2U7YnJlYWt9fWVsc2UgaWYoYiE9PWgmJiFvKGIsaCxyLG4sdSkpe2w9ZmFsc2U7YnJlYWt9fXJldHVybiB1LmRlbGV0ZSh0KSx1LmRlbGV0ZShlKSxsfWZ1bmN0aW9uIEsodCxlLHIsbixvLGMsdSl7c3dpdGNoKHIpe2Nhc2VcIltvYmplY3QgRGF0YVZpZXddXCI6XG5pZih0LmJ5dGVMZW5ndGghPWUuYnl0ZUxlbmd0aHx8dC5ieXRlT2Zmc2V0IT1lLmJ5dGVPZmZzZXQpYnJlYWs7dD10LmJ1ZmZlcixlPWUuYnVmZmVyO2Nhc2VcIltvYmplY3QgQXJyYXlCdWZmZXJdXCI6aWYodC5ieXRlTGVuZ3RoIT1lLmJ5dGVMZW5ndGh8fCFjKG5ldyBoZSh0KSxuZXcgaGUoZSkpKWJyZWFrO3JldHVybiB0cnVlO2Nhc2VcIltvYmplY3QgQm9vbGVhbl1cIjpjYXNlXCJbb2JqZWN0IERhdGVdXCI6Y2FzZVwiW29iamVjdCBOdW1iZXJdXCI6cmV0dXJuIHl0KCt0LCtlKTtjYXNlXCJbb2JqZWN0IEVycm9yXVwiOnJldHVybiB0Lm5hbWU9PWUubmFtZSYmdC5tZXNzYWdlPT1lLm1lc3NhZ2U7Y2FzZVwiW29iamVjdCBSZWdFeHBdXCI6Y2FzZVwiW29iamVjdCBTdHJpbmddXCI6cmV0dXJuIHQ9PWUrXCJcIjtjYXNlXCJbb2JqZWN0IE1hcF1cIjp2YXIgYT1pO2Nhc2VcIltvYmplY3QgU2V0XVwiOmlmKGF8fChhPWwpLHQuc2l6ZSE9ZS5zaXplJiYhKDEmbikpYnJlYWs7cmV0dXJuKHI9dS5nZXQodCkpP3I9PWU6KG58PTIsXG51LnNldCh0LGUpLGU9SihhKHQpLGEoZSksbixvLGMsdSksdS5kZWxldGUodCksZSk7Y2FzZVwiW29iamVjdCBTeW1ib2xdXCI6aWYoQ2UpcmV0dXJuIENlLmNhbGwodCk9PUNlLmNhbGwoZSl9cmV0dXJuIGZhbHNlfWZ1bmN0aW9uIFEodCl7cmV0dXJuIHoodCx6dCxOZSl9ZnVuY3Rpb24gWCh0KXtyZXR1cm4geih0LGt0LFdlKX1mdW5jdGlvbiBZKCl7dmFyIHQ9cy5pdGVyYXRlZXx8RnQsdD10PT09RnQ/Qjp0O3JldHVybiBhcmd1bWVudHMubGVuZ3RoP3QoYXJndW1lbnRzWzBdLGFyZ3VtZW50c1sxXSk6dH1mdW5jdGlvbiBaKHQsZSl7dmFyIHI9dC5fX2RhdGFfXyxuPXR5cGVvZiBlO3JldHVybihcInN0cmluZ1wiPT1ufHxcIm51bWJlclwiPT1ufHxcInN5bWJvbFwiPT1ufHxcImJvb2xlYW5cIj09bj9cIl9fcHJvdG9fX1wiIT09ZTpudWxsPT09ZSk/clt0eXBlb2YgZT09XCJzdHJpbmdcIj9cInN0cmluZ1wiOlwiaGFzaFwiXTpyLm1hcH1mdW5jdGlvbiB0dCh0KXtmb3IodmFyIGU9enQodCkscj1lLmxlbmd0aDtyLS07KXtcbnZhciBuPWVbcl0sbz10W25dO2Vbcl09W24sbyxvPT09byYmIXZ0KG8pXX1yZXR1cm4gZX1mdW5jdGlvbiBldCh0LGUpe3ZhciByPW51bGw9PXQ/QnQ6dFtlXTtyZXR1cm4oIXZ0KHIpfHxhZSYmYWUgaW4gcj8wOihfdChyKT9sZTpSdCkudGVzdChzdChyKSkpP3I6QnR9ZnVuY3Rpb24gcnQodCl7dmFyIGU9dC5sZW5ndGgscj1uZXcgdC5jb25zdHJ1Y3RvcihlKTtyZXR1cm4gZSYmXCJzdHJpbmdcIj09dHlwZW9mIHRbMF0mJnVlLmNhbGwodCxcImluZGV4XCIpJiYoci5pbmRleD10LmluZGV4LHIuaW5wdXQ9dC5pbnB1dCkscn1mdW5jdGlvbiBudCh0LGUscil7dmFyIG49dC5jb25zdHJ1Y3Rvcjtzd2l0Y2goZSl7Y2FzZVwiW29iamVjdCBBcnJheUJ1ZmZlcl1cIjpyZXR1cm4gVCh0KTtjYXNlXCJbb2JqZWN0IEJvb2xlYW5dXCI6Y2FzZVwiW29iamVjdCBEYXRlXVwiOnJldHVybiBuZXcgbigrdCk7Y2FzZVwiW29iamVjdCBEYXRhVmlld11cIjpyZXR1cm4gZT1yP1QodC5idWZmZXIpOnQuYnVmZmVyLG5ldyB0LmNvbnN0cnVjdG9yKGUsdC5ieXRlT2Zmc2V0LHQuYnl0ZUxlbmd0aCk7XG5jYXNlXCJbb2JqZWN0IEZsb2F0MzJBcnJheV1cIjpjYXNlXCJbb2JqZWN0IEZsb2F0NjRBcnJheV1cIjpjYXNlXCJbb2JqZWN0IEludDhBcnJheV1cIjpjYXNlXCJbb2JqZWN0IEludDE2QXJyYXldXCI6Y2FzZVwiW29iamVjdCBJbnQzMkFycmF5XVwiOmNhc2VcIltvYmplY3QgVWludDhBcnJheV1cIjpjYXNlXCJbb2JqZWN0IFVpbnQ4Q2xhbXBlZEFycmF5XVwiOmNhc2VcIltvYmplY3QgVWludDE2QXJyYXldXCI6Y2FzZVwiW29iamVjdCBVaW50MzJBcnJheV1cIjpyZXR1cm4gZT1yP1QodC5idWZmZXIpOnQuYnVmZmVyLG5ldyB0LmNvbnN0cnVjdG9yKGUsdC5ieXRlT2Zmc2V0LHQubGVuZ3RoKTtjYXNlXCJbb2JqZWN0IE1hcF1cIjpyZXR1cm4gbmV3IG47Y2FzZVwiW29iamVjdCBOdW1iZXJdXCI6Y2FzZVwiW29iamVjdCBTdHJpbmddXCI6cmV0dXJuIG5ldyBuKHQpO2Nhc2VcIltvYmplY3QgUmVnRXhwXVwiOnJldHVybiBlPW5ldyB0LmNvbnN0cnVjdG9yKHQuc291cmNlLFZ0LmV4ZWModCkpLGUubGFzdEluZGV4PXQubGFzdEluZGV4LFxuZTtjYXNlXCJbb2JqZWN0IFNldF1cIjpyZXR1cm4gbmV3IG47Y2FzZVwiW29iamVjdCBTeW1ib2xdXCI6cmV0dXJuIENlP09iamVjdChDZS5jYWxsKHQpKTp7fX19ZnVuY3Rpb24gb3QodCl7cmV0dXJuIEtlKHQpfHxKZSh0KXx8ISEodmUmJnQmJnRbdmVdKX1mdW5jdGlvbiBjdCh0LGUpe3ZhciByPXR5cGVvZiB0O3JldHVybiBlPW51bGw9PWU/OTAwNzE5OTI1NDc0MDk5MTplLCEhZSYmKFwibnVtYmVyXCI9PXJ8fFwic3ltYm9sXCIhPXImJlR0LnRlc3QodCkpJiYtMTx0JiYwPT10JTEmJnQ8ZX1mdW5jdGlvbiB1dCh0LGUpe2lmKEtlKHQpKXJldHVybiBmYWxzZTt2YXIgcj10eXBlb2YgdDtyZXR1cm4hKFwibnVtYmVyXCIhPXImJlwic3ltYm9sXCIhPXImJlwiYm9vbGVhblwiIT1yJiZudWxsIT10JiYhd3QodCkpfHwoJHQudGVzdCh0KXx8IVB0LnRlc3QodCl8fG51bGwhPWUmJnQgaW4gT2JqZWN0KGUpKX1mdW5jdGlvbiBhdCh0KXt2YXIgZT10JiZ0LmNvbnN0cnVjdG9yO3JldHVybiB0PT09KHR5cGVvZiBlPT1cImZ1bmN0aW9uXCImJmUucHJvdG90eXBlfHxuZSk7XG59ZnVuY3Rpb24gaXQodCxlKXtyZXR1cm4gZnVuY3Rpb24ocil7cmV0dXJuIG51bGwhPXImJihyW3RdPT09ZSYmKGUhPT1CdHx8dCBpbiBPYmplY3QocikpKX19ZnVuY3Rpb24gZnQoZSxyLG4pe3JldHVybiByPVNlKHI9PT1CdD9lLmxlbmd0aC0xOnIsMCksZnVuY3Rpb24oKXtmb3IodmFyIG89YXJndW1lbnRzLGM9LTEsdT1TZShvLmxlbmd0aC1yLDApLGE9QXJyYXkodSk7KytjPHU7KWFbY109b1tyK2NdO2ZvcihjPS0xLHU9QXJyYXkocisxKTsrK2M8cjspdVtjXT1vW2NdO3JldHVybiB1W3JdPW4oYSksdChlLHRoaXMsdSl9fWZ1bmN0aW9uIGx0KHQpe2lmKHR5cGVvZiB0PT1cInN0cmluZ1wifHx3dCh0KSlyZXR1cm4gdDt2YXIgZT10K1wiXCI7cmV0dXJuXCIwXCI9PWUmJjEvdD09LUR0P1wiLTBcIjplfWZ1bmN0aW9uIHN0KHQpe2lmKG51bGwhPXQpe3RyeXtyZXR1cm4gY2UuY2FsbCh0KX1jYXRjaCh0KXt9cmV0dXJuIHQrXCJcIn1yZXR1cm5cIlwifWZ1bmN0aW9uIGJ0KHQpe3JldHVybihudWxsPT10PzA6dC5sZW5ndGgpP08odCwxKTpbXTtcbn1mdW5jdGlvbiBodCh0KXt2YXIgZT1udWxsPT10PzA6dC5sZW5ndGg7cmV0dXJuIGU/dFtlLTFdOkJ0fWZ1bmN0aW9uIHB0KHQsZSl7ZnVuY3Rpb24gcigpe3ZhciBuPWFyZ3VtZW50cyxvPWU/ZS5hcHBseSh0aGlzLG4pOm5bMF0sYz1yLmNhY2hlO3JldHVybiBjLmhhcyhvKT9jLmdldChvKToobj10LmFwcGx5KHRoaXMsbiksci5jYWNoZT1jLnNldChvLG4pfHxjLG4pfWlmKHR5cGVvZiB0IT1cImZ1bmN0aW9uXCJ8fG51bGwhPWUmJnR5cGVvZiBlIT1cImZ1bmN0aW9uXCIpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkV4cGVjdGVkIGEgZnVuY3Rpb25cIik7cmV0dXJuIHIuY2FjaGU9bmV3KHB0LkNhY2hlfHxwKSxyfWZ1bmN0aW9uIHl0KHQsZSl7cmV0dXJuIHQ9PT1lfHx0IT09dCYmZSE9PWV9ZnVuY3Rpb24ganQodCl7cmV0dXJuIG51bGwhPXQmJmd0KHQubGVuZ3RoKSYmIV90KHQpfWZ1bmN0aW9uIF90KHQpe3JldHVybiEhdnQodCkmJih0PWsodCksXCJbb2JqZWN0IEZ1bmN0aW9uXVwiPT10fHxcIltvYmplY3QgR2VuZXJhdG9yRnVuY3Rpb25dXCI9PXR8fFwiW29iamVjdCBBc3luY0Z1bmN0aW9uXVwiPT10fHxcIltvYmplY3QgUHJveHldXCI9PXQpO1xufWZ1bmN0aW9uIGd0KHQpe3JldHVybiB0eXBlb2YgdD09XCJudW1iZXJcIiYmLTE8dCYmMD09dCUxJiY5MDA3MTk5MjU0NzQwOTkxPj10fWZ1bmN0aW9uIHZ0KHQpe3ZhciBlPXR5cGVvZiB0O3JldHVybiBudWxsIT10JiYoXCJvYmplY3RcIj09ZXx8XCJmdW5jdGlvblwiPT1lKX1mdW5jdGlvbiBkdCh0KXtyZXR1cm4gbnVsbCE9dCYmdHlwZW9mIHQ9PVwib2JqZWN0XCJ9ZnVuY3Rpb24gQXQodCl7cmV0dXJuISghZHQodCl8fFwiW29iamVjdCBPYmplY3RdXCIhPWsodCkpJiYodD15ZSh0KSxudWxsPT09dHx8KHQ9dWUuY2FsbCh0LFwiY29uc3RydWN0b3JcIikmJnQuY29uc3RydWN0b3IsdHlwZW9mIHQ9PVwiZnVuY3Rpb25cIiYmdCBpbnN0YW5jZW9mIHQmJmNlLmNhbGwodCk9PWZlKSl9ZnVuY3Rpb24gd3QodCl7cmV0dXJuIHR5cGVvZiB0PT1cInN5bWJvbFwifHxkdCh0KSYmXCJbb2JqZWN0IFN5bWJvbF1cIj09ayh0KX1mdW5jdGlvbiBtdCh0KXtyZXR1cm4gbnVsbD09dD9cIlwiOkwodCl9ZnVuY3Rpb24gT3QodCxlLHIpe1xucmV0dXJuIHQ9bnVsbD09dD9CdDpTKHQsZSksdD09PUJ0P3I6dH1mdW5jdGlvbiBTdCh0LGUpe3ZhciByO2lmKHI9bnVsbCE9dCl7cj10O3ZhciBuO249VihlLHIpO2Zvcih2YXIgbz0tMSxjPW4ubGVuZ3RoLHU9ZmFsc2U7KytvPGM7KXt2YXIgYT1sdChuW29dKTtpZighKHU9bnVsbCE9ciYmbnVsbCE9ciYmYSBpbiBPYmplY3QocikpKWJyZWFrO3I9clthXX11fHwrK28hPWM/cj11OihjPW51bGw9PXI/MDpyLmxlbmd0aCxyPSEhYyYmZ3QoYykmJmN0KGEsYykmJihLZShyKXx8SmUocikpKX1yZXR1cm4gcn1mdW5jdGlvbiB6dCh0KXtpZihqdCh0KSl0PV8odCk7ZWxzZSBpZihhdCh0KSl7dmFyIGUscj1bXTtmb3IoZSBpbiBPYmplY3QodCkpdWUuY2FsbCh0LGUpJiZcImNvbnN0cnVjdG9yXCIhPWUmJnIucHVzaChlKTt0PXJ9ZWxzZSB0PU9lKHQpO3JldHVybiB0fWZ1bmN0aW9uIGt0KHQpe2lmKGp0KHQpKXQ9Xyh0LHRydWUpO2Vsc2UgaWYodnQodCkpe3ZhciBlLHI9YXQodCksbj1bXTtmb3IoZSBpbiB0KShcImNvbnN0cnVjdG9yXCIhPWV8fCFyJiZ1ZS5jYWxsKHQsZSkpJiZuLnB1c2goZSk7XG50PW59ZWxzZXtpZihlPVtdLG51bGwhPXQpZm9yKHIgaW4gT2JqZWN0KHQpKWUucHVzaChyKTt0PWV9cmV0dXJuIHR9ZnVuY3Rpb24geHQodCl7cmV0dXJuIGZ1bmN0aW9uKCl7cmV0dXJuIHR9fWZ1bmN0aW9uIEV0KHQpe3JldHVybiB0fWZ1bmN0aW9uIEZ0KHQpe3JldHVybiBCKHR5cGVvZiB0PT1cImZ1bmN0aW9uXCI/dDptKHQsMSkpfWZ1bmN0aW9uIEl0KHQpe3JldHVybiB1dCh0KT91KGx0KHQpKTokKHQpfWZ1bmN0aW9uIE10KCl7cmV0dXJuW119ZnVuY3Rpb24gVXQoKXtyZXR1cm4gZmFsc2V9dmFyIEJ0LER0PTEvMCxQdD0vXFwufFxcWyg/OlteW1xcXV0qfChbXCInXSkoPzooPyFcXDEpW15cXFxcXXxcXFxcLikqP1xcMSlcXF0vLCR0PS9eXFx3KiQvLEx0PS9bXi5bXFxdXSt8XFxbKD86KC0/XFxkKyg/OlxcLlxcZCspPyl8KFtcIiddKSgoPzooPyFcXDIpW15cXFxcXXxcXFxcLikqPylcXDIpXFxdfCg/PSg/OlxcLnxcXFtcXF0pKD86XFwufFxcW1xcXXwkKSkvZyxDdD0vXFxcXChcXFxcKT8vZyxWdD0vXFx3KiQvLFJ0PS9eXFxbb2JqZWN0IC4rP0NvbnN0cnVjdG9yXFxdJC8sVHQ9L14oPzowfFsxLTldXFxkKikkLyxOdD17fTtcbk50W1wiW29iamVjdCBGbG9hdDMyQXJyYXldXCJdPU50W1wiW29iamVjdCBGbG9hdDY0QXJyYXldXCJdPU50W1wiW29iamVjdCBJbnQ4QXJyYXldXCJdPU50W1wiW29iamVjdCBJbnQxNkFycmF5XVwiXT1OdFtcIltvYmplY3QgSW50MzJBcnJheV1cIl09TnRbXCJbb2JqZWN0IFVpbnQ4QXJyYXldXCJdPU50W1wiW29iamVjdCBVaW50OENsYW1wZWRBcnJheV1cIl09TnRbXCJbb2JqZWN0IFVpbnQxNkFycmF5XVwiXT1OdFtcIltvYmplY3QgVWludDMyQXJyYXldXCJdPXRydWUsTnRbXCJbb2JqZWN0IEFyZ3VtZW50c11cIl09TnRbXCJbb2JqZWN0IEFycmF5XVwiXT1OdFtcIltvYmplY3QgQXJyYXlCdWZmZXJdXCJdPU50W1wiW29iamVjdCBCb29sZWFuXVwiXT1OdFtcIltvYmplY3QgRGF0YVZpZXddXCJdPU50W1wiW29iamVjdCBEYXRlXVwiXT1OdFtcIltvYmplY3QgRXJyb3JdXCJdPU50W1wiW29iamVjdCBGdW5jdGlvbl1cIl09TnRbXCJbb2JqZWN0IE1hcF1cIl09TnRbXCJbb2JqZWN0IE51bWJlcl1cIl09TnRbXCJbb2JqZWN0IE9iamVjdF1cIl09TnRbXCJbb2JqZWN0IFJlZ0V4cF1cIl09TnRbXCJbb2JqZWN0IFNldF1cIl09TnRbXCJbb2JqZWN0IFN0cmluZ11cIl09TnRbXCJbb2JqZWN0IFdlYWtNYXBdXCJdPWZhbHNlO1xudmFyIFd0PXt9O1d0W1wiW29iamVjdCBBcmd1bWVudHNdXCJdPVd0W1wiW29iamVjdCBBcnJheV1cIl09V3RbXCJbb2JqZWN0IEFycmF5QnVmZmVyXVwiXT1XdFtcIltvYmplY3QgRGF0YVZpZXddXCJdPVd0W1wiW29iamVjdCBCb29sZWFuXVwiXT1XdFtcIltvYmplY3QgRGF0ZV1cIl09V3RbXCJbb2JqZWN0IEZsb2F0MzJBcnJheV1cIl09V3RbXCJbb2JqZWN0IEZsb2F0NjRBcnJheV1cIl09V3RbXCJbb2JqZWN0IEludDhBcnJheV1cIl09V3RbXCJbb2JqZWN0IEludDE2QXJyYXldXCJdPVd0W1wiW29iamVjdCBJbnQzMkFycmF5XVwiXT1XdFtcIltvYmplY3QgTWFwXVwiXT1XdFtcIltvYmplY3QgTnVtYmVyXVwiXT1XdFtcIltvYmplY3QgT2JqZWN0XVwiXT1XdFtcIltvYmplY3QgUmVnRXhwXVwiXT1XdFtcIltvYmplY3QgU2V0XVwiXT1XdFtcIltvYmplY3QgU3RyaW5nXVwiXT1XdFtcIltvYmplY3QgU3ltYm9sXVwiXT1XdFtcIltvYmplY3QgVWludDhBcnJheV1cIl09V3RbXCJbb2JqZWN0IFVpbnQ4Q2xhbXBlZEFycmF5XVwiXT1XdFtcIltvYmplY3QgVWludDE2QXJyYXldXCJdPVd0W1wiW29iamVjdCBVaW50MzJBcnJheV1cIl09dHJ1ZSxcbld0W1wiW29iamVjdCBFcnJvcl1cIl09V3RbXCJbb2JqZWN0IEZ1bmN0aW9uXVwiXT1XdFtcIltvYmplY3QgV2Vha01hcF1cIl09ZmFsc2U7dmFyIEd0LHF0PXR5cGVvZiBnbG9iYWw9PVwib2JqZWN0XCImJmdsb2JhbCYmZ2xvYmFsLk9iamVjdD09PU9iamVjdCYmZ2xvYmFsLEh0PXR5cGVvZiBzZWxmPT1cIm9iamVjdFwiJiZzZWxmJiZzZWxmLk9iamVjdD09PU9iamVjdCYmc2VsZixKdD1xdHx8SHR8fEZ1bmN0aW9uKFwicmV0dXJuIHRoaXNcIikoKSxLdD10eXBlb2YgZXhwb3J0cz09XCJvYmplY3RcIiYmZXhwb3J0cyYmIWV4cG9ydHMubm9kZVR5cGUmJmV4cG9ydHMsUXQ9S3QmJnR5cGVvZiBtb2R1bGU9PVwib2JqZWN0XCImJm1vZHVsZSYmIW1vZHVsZS5ub2RlVHlwZSYmbW9kdWxlLFh0PVF0JiZRdC5leHBvcnRzPT09S3QsWXQ9WHQmJnF0LnByb2Nlc3M7dDp7dHJ5e0d0PVl0JiZZdC5iaW5kaW5nJiZZdC5iaW5kaW5nKFwidXRpbFwiKTticmVhayB0fWNhdGNoKHQpe31HdD12b2lkIDB9dmFyIFp0PUd0JiZHdC5pc01hcCx0ZT1HdCYmR3QuaXNTZXQsZWU9R3QmJkd0LmlzVHlwZWRBcnJheSxyZT1BcnJheS5wcm90b3R5cGUsbmU9T2JqZWN0LnByb3RvdHlwZSxvZT1KdFtcIl9fY29yZS1qc19zaGFyZWRfX1wiXSxjZT1GdW5jdGlvbi5wcm90b3R5cGUudG9TdHJpbmcsdWU9bmUuaGFzT3duUHJvcGVydHksYWU9ZnVuY3Rpb24oKXtcbnZhciB0PS9bXi5dKyQvLmV4ZWMob2UmJm9lLmtleXMmJm9lLmtleXMuSUVfUFJPVE98fFwiXCIpO3JldHVybiB0P1wiU3ltYm9sKHNyYylfMS5cIit0OlwiXCJ9KCksaWU9bmUudG9TdHJpbmcsZmU9Y2UuY2FsbChPYmplY3QpLGxlPVJlZ0V4cChcIl5cIitjZS5jYWxsKHVlKS5yZXBsYWNlKC9bXFxcXF4kLiorPygpW1xcXXt9fF0vZyxcIlxcXFwkJlwiKS5yZXBsYWNlKC9oYXNPd25Qcm9wZXJ0eXwoZnVuY3Rpb24pLio/KD89XFxcXFxcKCl8IGZvciAuKz8oPz1cXFxcXFxdKS9nLFwiJDEuKj9cIikrXCIkXCIpLHNlPVh0P0p0LkJ1ZmZlcjpCdCxiZT1KdC5TeW1ib2wsaGU9SnQuVWludDhBcnJheSxwZT1zZT9zZS5hOkJ0LHllPWYoT2JqZWN0LmdldFByb3RvdHlwZU9mKSxqZT1PYmplY3QuY3JlYXRlLF9lPW5lLnByb3BlcnR5SXNFbnVtZXJhYmxlLGdlPXJlLnNwbGljZSx2ZT1iZT9iZS5pc0NvbmNhdFNwcmVhZGFibGU6QnQsZGU9YmU/YmUudG9TdHJpbmdUYWc6QnQsQWU9ZnVuY3Rpb24oKXt0cnl7dmFyIHQ9ZXQoT2JqZWN0LFwiZGVmaW5lUHJvcGVydHlcIik7XG5yZXR1cm4gdCh7fSxcIlwiLHt9KSx0fWNhdGNoKHQpe319KCksd2U9T2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyxtZT1zZT9zZS5pc0J1ZmZlcjpCdCxPZT1mKE9iamVjdC5rZXlzKSxTZT1NYXRoLm1heCx6ZT1EYXRlLm5vdyxrZT1ldChKdCxcIkRhdGFWaWV3XCIpLHhlPWV0KEp0LFwiTWFwXCIpLEVlPWV0KEp0LFwiUHJvbWlzZVwiKSxGZT1ldChKdCxcIlNldFwiKSxJZT1ldChKdCxcIldlYWtNYXBcIiksTWU9ZXQoT2JqZWN0LFwiY3JlYXRlXCIpLFVlPXN0KGtlKSxCZT1zdCh4ZSksRGU9c3QoRWUpLFBlPXN0KEZlKSwkZT1zdChJZSksTGU9YmU/YmUucHJvdG90eXBlOkJ0LENlPUxlP0xlLnZhbHVlT2Y6QnQsVmU9TGU/TGUudG9TdHJpbmc6QnQsUmU9ZnVuY3Rpb24oKXtmdW5jdGlvbiB0KCl7fXJldHVybiBmdW5jdGlvbihlKXtyZXR1cm4gdnQoZSk/amU/amUoZSk6KHQucHJvdG90eXBlPWUsZT1uZXcgdCx0LnByb3RvdHlwZT1CdCxlKTp7fX19KCk7Yi5wcm90b3R5cGUuY2xlYXI9ZnVuY3Rpb24oKXtcbnRoaXMuX19kYXRhX189TWU/TWUobnVsbCk6e30sdGhpcy5zaXplPTB9LGIucHJvdG90eXBlLmRlbGV0ZT1mdW5jdGlvbih0KXtyZXR1cm4gdD10aGlzLmhhcyh0KSYmZGVsZXRlIHRoaXMuX19kYXRhX19bdF0sdGhpcy5zaXplLT10PzE6MCx0fSxiLnByb3RvdHlwZS5nZXQ9ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5fX2RhdGFfXztyZXR1cm4gTWU/KHQ9ZVt0XSxcIl9fbG9kYXNoX2hhc2hfdW5kZWZpbmVkX19cIj09PXQ/QnQ6dCk6dWUuY2FsbChlLHQpP2VbdF06QnR9LGIucHJvdG90eXBlLmhhcz1mdW5jdGlvbih0KXt2YXIgZT10aGlzLl9fZGF0YV9fO3JldHVybiBNZT9lW3RdIT09QnQ6dWUuY2FsbChlLHQpfSxiLnByb3RvdHlwZS5zZXQ9ZnVuY3Rpb24odCxlKXt2YXIgcj10aGlzLl9fZGF0YV9fO3JldHVybiB0aGlzLnNpemUrPXRoaXMuaGFzKHQpPzA6MSxyW3RdPU1lJiZlPT09QnQ/XCJfX2xvZGFzaF9oYXNoX3VuZGVmaW5lZF9fXCI6ZSx0aGlzfSxoLnByb3RvdHlwZS5jbGVhcj1mdW5jdGlvbigpe1xudGhpcy5fX2RhdGFfXz1bXSx0aGlzLnNpemU9MH0saC5wcm90b3R5cGUuZGVsZXRlPWZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuX19kYXRhX187cmV0dXJuIHQ9dihlLHQpLCEoMD50KSYmKHQ9PWUubGVuZ3RoLTE/ZS5wb3AoKTpnZS5jYWxsKGUsdCwxKSwtLXRoaXMuc2l6ZSx0cnVlKX0saC5wcm90b3R5cGUuZ2V0PWZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuX19kYXRhX187cmV0dXJuIHQ9dihlLHQpLDA+dD9CdDplW3RdWzFdfSxoLnByb3RvdHlwZS5oYXM9ZnVuY3Rpb24odCl7cmV0dXJuLTE8dih0aGlzLl9fZGF0YV9fLHQpfSxoLnByb3RvdHlwZS5zZXQ9ZnVuY3Rpb24odCxlKXt2YXIgcj10aGlzLl9fZGF0YV9fLG49dihyLHQpO3JldHVybiAwPm4/KCsrdGhpcy5zaXplLHIucHVzaChbdCxlXSkpOnJbbl1bMV09ZSx0aGlzfSxwLnByb3RvdHlwZS5jbGVhcj1mdW5jdGlvbigpe3RoaXMuc2l6ZT0wLHRoaXMuX19kYXRhX189e2hhc2g6bmV3IGIsbWFwOm5ldyh4ZXx8aCksc3RyaW5nOm5ldyBiXG59fSxwLnByb3RvdHlwZS5kZWxldGU9ZnVuY3Rpb24odCl7cmV0dXJuIHQ9Wih0aGlzLHQpLmRlbGV0ZSh0KSx0aGlzLnNpemUtPXQ/MTowLHR9LHAucHJvdG90eXBlLmdldD1mdW5jdGlvbih0KXtyZXR1cm4gWih0aGlzLHQpLmdldCh0KX0scC5wcm90b3R5cGUuaGFzPWZ1bmN0aW9uKHQpe3JldHVybiBaKHRoaXMsdCkuaGFzKHQpfSxwLnByb3RvdHlwZS5zZXQ9ZnVuY3Rpb24odCxlKXt2YXIgcj1aKHRoaXMsdCksbj1yLnNpemU7cmV0dXJuIHIuc2V0KHQsZSksdGhpcy5zaXplKz1yLnNpemU9PW4/MDoxLHRoaXN9LHkucHJvdG90eXBlLmFkZD15LnByb3RvdHlwZS5wdXNoPWZ1bmN0aW9uKHQpe3JldHVybiB0aGlzLl9fZGF0YV9fLnNldCh0LFwiX19sb2Rhc2hfaGFzaF91bmRlZmluZWRfX1wiKSx0aGlzfSx5LnByb3RvdHlwZS5oYXM9ZnVuY3Rpb24odCl7cmV0dXJuIHRoaXMuX19kYXRhX18uaGFzKHQpfSxqLnByb3RvdHlwZS5jbGVhcj1mdW5jdGlvbigpe3RoaXMuX19kYXRhX189bmV3IGgsXG50aGlzLnNpemU9MH0sai5wcm90b3R5cGUuZGVsZXRlPWZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuX19kYXRhX187cmV0dXJuIHQ9ZS5kZWxldGUodCksdGhpcy5zaXplPWUuc2l6ZSx0fSxqLnByb3RvdHlwZS5nZXQ9ZnVuY3Rpb24odCl7cmV0dXJuIHRoaXMuX19kYXRhX18uZ2V0KHQpfSxqLnByb3RvdHlwZS5oYXM9ZnVuY3Rpb24odCl7cmV0dXJuIHRoaXMuX19kYXRhX18uaGFzKHQpfSxqLnByb3RvdHlwZS5zZXQ9ZnVuY3Rpb24odCxlKXt2YXIgcj10aGlzLl9fZGF0YV9fO2lmKHIgaW5zdGFuY2VvZiBoKXt2YXIgbj1yLl9fZGF0YV9fO2lmKCF4ZXx8MTk5Pm4ubGVuZ3RoKXJldHVybiBuLnB1c2goW3QsZV0pLHRoaXMuc2l6ZT0rK3Iuc2l6ZSx0aGlzO3I9dGhpcy5fX2RhdGFfXz1uZXcgcChuKX1yZXR1cm4gci5zZXQodCxlKSx0aGlzLnNpemU9ci5zaXplLHRoaXN9O3ZhciBUZT1BZT9mdW5jdGlvbih0LGUpe3JldHVybiBBZSh0LFwidG9TdHJpbmdcIix7Y29uZmlndXJhYmxlOnRydWUsXG5lbnVtZXJhYmxlOmZhbHNlLHZhbHVlOnh0KGUpLHdyaXRhYmxlOnRydWV9KX06RXQsTmU9d2U/ZnVuY3Rpb24odCl7cmV0dXJuIG51bGw9PXQ/W106KHQ9T2JqZWN0KHQpLHIod2UodCksZnVuY3Rpb24oZSl7cmV0dXJuIF9lLmNhbGwodCxlKX0pKX06TXQsV2U9d2U/ZnVuY3Rpb24odCl7Zm9yKHZhciBlPVtdO3Q7KW8oZSxOZSh0KSksdD15ZSh0KTtyZXR1cm4gZX06TXQsR2U9azsoa2UmJlwiW29iamVjdCBEYXRhVmlld11cIiE9R2UobmV3IGtlKG5ldyBBcnJheUJ1ZmZlcigxKSkpfHx4ZSYmXCJbb2JqZWN0IE1hcF1cIiE9R2UobmV3IHhlKXx8RWUmJlwiW29iamVjdCBQcm9taXNlXVwiIT1HZShFZS5yZXNvbHZlKCkpfHxGZSYmXCJbb2JqZWN0IFNldF1cIiE9R2UobmV3IEZlKXx8SWUmJlwiW29iamVjdCBXZWFrTWFwXVwiIT1HZShuZXcgSWUpKSYmKEdlPWZ1bmN0aW9uKHQpe3ZhciBlPWsodCk7aWYodD0odD1cIltvYmplY3QgT2JqZWN0XVwiPT1lP3QuY29uc3RydWN0b3I6QnQpP3N0KHQpOlwiXCIpc3dpdGNoKHQpe1xuY2FzZSBVZTpyZXR1cm5cIltvYmplY3QgRGF0YVZpZXddXCI7Y2FzZSBCZTpyZXR1cm5cIltvYmplY3QgTWFwXVwiO2Nhc2UgRGU6cmV0dXJuXCJbb2JqZWN0IFByb21pc2VdXCI7Y2FzZSBQZTpyZXR1cm5cIltvYmplY3QgU2V0XVwiO2Nhc2UgJGU6cmV0dXJuXCJbb2JqZWN0IFdlYWtNYXBdXCJ9cmV0dXJuIGV9KTt2YXIgcWU9ZnVuY3Rpb24odCl7dmFyIGU9MCxyPTA7cmV0dXJuIGZ1bmN0aW9uKCl7dmFyIG49emUoKSxvPTE2LShuLXIpO2lmKHI9biwwPG8pe2lmKDgwMDw9KytlKXJldHVybiBhcmd1bWVudHNbMF19ZWxzZSBlPTA7cmV0dXJuIHQuYXBwbHkoQnQsYXJndW1lbnRzKX19KFRlKSxIZT1mdW5jdGlvbih0KXt0PXB0KHQsZnVuY3Rpb24odCl7cmV0dXJuIDUwMD09PWUuc2l6ZSYmZS5jbGVhcigpLHR9KTt2YXIgZT10LmNhY2hlO3JldHVybiB0fShmdW5jdGlvbih0KXt2YXIgZT1bXTtyZXR1cm4gNDY9PT10LmNoYXJDb2RlQXQoMCkmJmUucHVzaChcIlwiKSx0LnJlcGxhY2UoTHQsZnVuY3Rpb24odCxyLG4sbyl7XG5lLnB1c2gobj9vLnJlcGxhY2UoQ3QsXCIkMVwiKTpyfHx0KX0pLGV9KTtwdC5DYWNoZT1wO3ZhciBKZT14KGZ1bmN0aW9uKCl7cmV0dXJuIGFyZ3VtZW50c30oKSk/eDpmdW5jdGlvbih0KXtyZXR1cm4gZHQodCkmJnVlLmNhbGwodCxcImNhbGxlZVwiKSYmIV9lLmNhbGwodCxcImNhbGxlZVwiKX0sS2U9QXJyYXkuaXNBcnJheSxRZT1tZXx8VXQsWGU9WnQ/YShadCk6RixZZT10ZT9hKHRlKTpNLFplPWVlP2EoZWUpOlUsdHI9ZnVuY3Rpb24odCxlKXtyZXR1cm4gcWUoZnQodCxlLEV0KSx0K1wiXCIpfShmdW5jdGlvbih0LGUpe3Q9T2JqZWN0KHQpO3ZhciByLG49LTEsbz1lLmxlbmd0aCxjPTI8bz9lWzJdOkJ0O2lmKHI9Yyl7cj1lWzBdO3ZhciB1PWVbMV07aWYodnQoYykpe3ZhciBhPXR5cGVvZiB1O3I9ISEoXCJudW1iZXJcIj09YT9qdChjKSYmY3QodSxjLmxlbmd0aCk6XCJzdHJpbmdcIj09YSYmdSBpbiBjKSYmeXQoY1t1XSxyKX1lbHNlIHI9ZmFsc2V9Zm9yKHImJihvPTEpOysrbjxvOylmb3IoYz1lW25dLFxucj1rdChjKSx1PS0xLGE9ci5sZW5ndGg7Kyt1PGE7KXt2YXIgaT1yW3VdLGY9dFtpXTsoZj09PUJ0fHx5dChmLG5lW2ldKSYmIXVlLmNhbGwodCxpKSkmJih0W2ldPWNbaV0pfXJldHVybiB0fSksZXI9ZnVuY3Rpb24odCl7cmV0dXJuIHFlKGZ0KHQsQnQsYnQpLHQrXCJcIil9KGZ1bmN0aW9uKHQsZSl7dmFyIHI9e307aWYobnVsbD09dClyZXR1cm4gcjt2YXIgbz1mYWxzZTtlPW4oZSxmdW5jdGlvbihlKXtyZXR1cm4gZT1WKGUsdCksb3x8KG89MTxlLmxlbmd0aCksZX0pLFcodCxYKHQpLHIpLG8mJihyPW0ociw3LEgpKTtmb3IodmFyIGM9ZS5sZW5ndGg7Yy0tOylDKHIsZVtjXSk7cmV0dXJuIHJ9KTtzLmNvbnN0YW50PXh0LHMuZGVmYXVsdHM9dHIscy5mbGF0dGVuPWJ0LHMuaXRlcmF0ZWU9RnQscy5rZXlzPXp0LHMua2V5c0luPWt0LHMubWVtb2l6ZT1wdCxzLm9taXQ9ZXIscy5wcm9wZXJ0eT1JdCxzLnJlbW92ZT1mdW5jdGlvbih0LGUpe3ZhciByPVtdO2lmKCF0fHwhdC5sZW5ndGgpcmV0dXJuIHI7XG52YXIgbj0tMSxvPVtdLGM9dC5sZW5ndGg7Zm9yKGU9WShlLDMpOysrbjxjOyl7dmFyIHU9dFtuXTtlKHUsbix0KSYmKHIucHVzaCh1KSxvLnB1c2gobikpfWZvcihuPXQ/by5sZW5ndGg6MCxjPW4tMTtuLS07KWlmKHU9b1tuXSxuPT1jfHx1IT09YSl7dmFyIGE9dTtjdCh1KT9nZS5jYWxsKHQsdSwxKTpDKHQsdSl9cmV0dXJuIHJ9LHMuZXE9eXQscy5nZXQ9T3Qscy5oYXNJbj1TdCxzLmlkZW50aXR5PUV0LHMuaXNBcmd1bWVudHM9SmUscy5pc0FycmF5PUtlLHMuaXNBcnJheUxpa2U9anQscy5pc0J1ZmZlcj1RZSxzLmlzRnVuY3Rpb249X3Qscy5pc0xlbmd0aD1ndCxzLmlzTWFwPVhlLHMuaXNPYmplY3Q9dnQscy5pc09iamVjdExpa2U9ZHQscy5pc1BsYWluT2JqZWN0PUF0LHMuaXNTZXQ9WWUscy5pc1N5bWJvbD13dCxzLmlzVHlwZWRBcnJheT1aZSxzLmxhc3Q9aHQscy5zdHViQXJyYXk9TXQscy5zdHViRmFsc2U9VXQscy50b1N0cmluZz1tdCxzLlZFUlNJT049XCI0LjE3LjVcIixRdCYmKChRdC5leHBvcnRzPXMpLl89cyxcbkt0Ll89cyl9KS5jYWxsKHRoaXMpOyJdLCJzb3VyY2VSb290IjoiIn0=