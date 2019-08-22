var AlephBet =
/******/ (function(modules) { // webpackBootstrap
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
;(function(){function t(t,r,n){switch(n.length){case 0:return t.call(r);case 1:return t.call(r,n[0]);case 2:return t.call(r,n[0],n[1]);case 3:return t.call(r,n[0],n[1],n[2])}return t.apply(r,n)}function r(t,r){for(var n=-1,e=null==t?0:t.length;++n<e&&r(t[n],n,t)!==false;);return t}function n(t,r){for(var n=-1,e=null==t?0:t.length,u=0,o=[];++n<e;){var i=t[n];r(i,n,t)&&(o[u++]=i)}return o}function e(t,r){for(var n=-1,e=null==t?0:t.length,u=Array(e);++n<e;)u[n]=r(t[n],n,t);return u}function u(t,r){for(var n=-1,e=r.length,u=t.length;++n<e;)t[u+n]=r[n];
return t}function o(t,r){for(var n=-1,e=null==t?0:t.length;++n<e;)if(r(t[n],n,t))return true;return false}function i(t){return function(r){return null==r?Lr:r[t]}}function c(t,r){for(var n=-1,e=Array(t);++n<t;)e[n]=r(n);return e}function a(t){return function(r){return t(r)}}function f(t,r){return t.has(r)}function l(t,r){return null==t?Lr:t[r]}function s(t){var r=-1,n=Array(t.size);return t.forEach(function(t,e){n[++r]=[e,t]}),n}function h(t,r){return function(n){return t(r(n))}}function p(t){var r=-1,n=Array(t.size);
return t.forEach(function(t){n[++r]=t}),n}function v(){}function y(t){var r=-1,n=null==t?0:t.length;for(this.clear();++r<n;){var e=t[r];this.set(e[0],e[1])}}function b(){this.__data__=me?me(null):{},this.size=0}function _(t){var r=this.has(t)&&delete this.__data__[t];return this.size-=r?1:0,r}function g(t){var r=this.__data__;if(me){var n=r[t];return n===Tr?Lr:n}return Xn.call(r,t)?r[t]:Lr}function d(t){var r=this.__data__;return me?r[t]!==Lr:Xn.call(r,t)}function j(t,r){var n=this.__data__;return this.size+=this.has(t)?0:1,
n[t]=me&&r===Lr?Tr:r,this}function w(t){var r=-1,n=null==t?0:t.length;for(this.clear();++r<n;){var e=t[r];this.set(e[0],e[1])}}function O(){this.__data__=[],this.size=0}function m(t){var r=this.__data__,n=W(r,t);return!(n<0)&&(n==r.length-1?r.pop():fe.call(r,n,1),--this.size,true)}function A(t){var r=this.__data__,n=W(r,t);return n<0?Lr:r[n][1]}function z(t){return W(this.__data__,t)>-1}function S(t,r){var n=this.__data__,e=W(n,t);return e<0?(++this.size,n.push([t,r])):n[e][1]=r,this}function x(t){
var r=-1,n=null==t?0:t.length;for(this.clear();++r<n;){var e=t[r];this.set(e[0],e[1])}}function k(){this.size=0,this.__data__={hash:new y,map:new(de||w),string:new y}}function E(t){var r=Bt(this,t).delete(t);return this.size-=r?1:0,r}function $(t){return Bt(this,t).get(t)}function I(t){return Bt(this,t).has(t)}function L(t,r){var n=Bt(this,t),e=n.size;return n.set(t,r),this.size+=n.size==e?0:1,this}function P(t){var r=-1,n=null==t?0:t.length;for(this.__data__=new x;++r<n;)this.add(t[r])}function F(t){
return this.__data__.set(t,Tr),this}function M(t){return this.__data__.has(t)}function T(t){this.size=(this.__data__=new w(t)).size}function U(){this.__data__=new w,this.size=0}function B(t){var r=this.__data__,n=r.delete(t);return this.size=r.size,n}function C(t){return this.__data__.get(t)}function D(t){return this.__data__.has(t)}function R(t,r){var n=this.__data__;if(n instanceof w){var e=n.__data__;if(!de||e.length<Fr-1)return e.push([t,r]),this.size=++n.size,this;n=this.__data__=new x(e)}return n.set(t,r),
this.size=n.size,this}function N(t,r){var n=De(t),e=!n&&Ce(t),u=!n&&!e&&Re(t),o=!n&&!e&&!u&&We(t),i=n||e||u||o,a=i?c(t.length,String):[],f=a.length;for(var l in t)!r&&!Xn.call(t,l)||i&&("length"==l||u&&("offset"==l||"parent"==l)||o&&("buffer"==l||"byteLength"==l||"byteOffset"==l)||Ht(l,f))||a.push(l);return a}function V(t,r,n){var e=t[r];Xn.call(t,r)&&pr(e,n)&&(n!==Lr||r in t)||H(t,r,n)}function W(t,r){for(var n=t.length;n--;)if(pr(t[n][0],r))return n;return-1}function q(t,r){return t&&xt(r,Ar(r),t);
}function G(t,r){return t&&xt(r,zr(r),t)}function H(t,r,n){"__proto__"==r&&he?he(t,r,{configurable:true,enumerable:true,value:n,writable:true}):t[r]=n}function J(t,n,e,u,o,i){var c,a=n&Br,f=n&Cr,l=n&Dr;if(e&&(c=o?e(t,u,o,i):e(t)),c!==Lr)return c;if(!_r(t))return t;var s=De(t);if(s){if(c=Vt(t),!a)return St(t,c)}else{var h=Te(t),p=h==Zr||h==tn;if(Re(t))return jt(t,a);if(h==un||h==Hr||p&&!o){if(c=f||p?{}:Wt(t),!a)return f?Et(t,G(c,t)):kt(t,q(c,t))}else{if(!Fn[h])return o?t:{};c=qt(t,h,a)}}i||(i=new T);var v=i.get(t);
if(v)return v;if(i.set(t,c),Ve(t))return t.forEach(function(r){c.add(J(r,n,e,r,t,i))}),c;if(Ne(t))return t.forEach(function(r,u){c.set(u,J(r,n,e,u,t,i))}),c;var y=l?f?Tt:Mt:f?zr:Ar,b=s?Lr:y(t);return r(b||t,function(r,u){b&&(u=r,r=t[u]),V(c,u,J(r,n,e,u,t,i))}),c}function K(t,r,n,e,o){var i=-1,c=t.length;for(n||(n=Gt),o||(o=[]);++i<c;){var a=t[i];r>0&&n(a)?r>1?K(a,r-1,n,e,o):u(o,a):e||(o[o.length]=a)}return o}function Q(t,r){r=dt(r,t);for(var n=0,e=r.length;null!=t&&n<e;)t=t[cr(r[n++])];return n&&n==e?t:Lr;
}function X(t,r,n){var e=r(t);return De(t)?e:u(e,n(t))}function Y(t){return null==t?t===Lr?hn:en:se&&se in Object(t)?Rt(t):er(t)}function Z(t,r){return null!=t&&r in Object(t)}function tt(t){return gr(t)&&Y(t)==Hr}function rt(t,r,n,e,u){return t===r||(null==t||null==r||!gr(t)&&!gr(r)?t!==t&&r!==r:nt(t,r,n,e,rt,u))}function nt(t,r,n,e,u,o){var i=De(t),c=De(r),a=i?Jr:Te(t),f=c?Jr:Te(r);a=a==Hr?un:a,f=f==Hr?un:f;var l=a==un,s=f==un,h=a==f;if(h&&Re(t)){if(!Re(r))return false;i=true,l=false}if(h&&!l)return o||(o=new T),
i||We(t)?It(t,r,n,e,u,o):Lt(t,r,a,n,e,u,o);if(!(n&Rr)){var p=l&&Xn.call(t,"__wrapped__"),v=s&&Xn.call(r,"__wrapped__");if(p||v){var y=p?t.value():t,b=v?r.value():r;return o||(o=new T),u(y,b,n,e,o)}}return!!h&&(o||(o=new T),Pt(t,r,n,e,u,o))}function et(t){return gr(t)&&Te(t)==rn}function ut(t,r,n,e){var u=n.length,o=u,i=!e;if(null==t)return!o;for(t=Object(t);u--;){var c=n[u];if(i&&c[2]?c[1]!==t[c[0]]:!(c[0]in t))return false}for(;++u<o;){c=n[u];var a=c[0],f=t[a],l=c[1];if(i&&c[2]){if(f===Lr&&!(a in t))return false;
}else{var s=new T;if(e)var h=e(f,l,a,t,r,s);if(!(h===Lr?rt(l,f,Rr|Nr,e,s):h))return false}}return true}function ot(t){return!(!_r(t)||Xt(t))&&(yr(t)?re:In).test(ar(t))}function it(t){return gr(t)&&Te(t)==fn}function ct(t){return gr(t)&&br(t.length)&&!!Pn[Y(t)]}function at(t){return typeof t=="function"?t:null==t?xr:typeof t=="object"?De(t)?ht(t[0],t[1]):st(t):Er(t)}function ft(t){if(!Yt(t))return ye(t);var r=[];for(var n in Object(t))Xn.call(t,n)&&"constructor"!=n&&r.push(n);return r}function lt(t){if(!_r(t))return nr(t);
var r=Yt(t),n=[];for(var e in t)("constructor"!=e||!r&&Xn.call(t,e))&&n.push(e);return n}function st(t){var r=Ct(t);return 1==r.length&&r[0][2]?tr(r[0][0],r[0][1]):function(n){return n===t||ut(n,t,r)}}function ht(t,r){return Kt(t)&&Zt(r)?tr(cr(t),r):function(n){var e=Or(n,t);return e===Lr&&e===r?mr(n,t):rt(r,e,Rr|Nr)}}function pt(t){return function(r){return Q(r,t)}}function vt(t,r){for(var n=t?r.length:0,e=n-1;n--;){var u=r[n];if(n==e||u!==o){var o=u;Ht(u)?fe.call(t,u,1):gt(t,u)}}return t}function yt(t,r){
return Ue(ur(t,r,xr),t+"")}function bt(t,r,n){var e=-1,u=t.length;r<0&&(r=-r>u?0:u+r),n=n>u?u:n,n<0&&(n+=u),u=r>n?0:n-r>>>0,r>>>=0;for(var o=Array(u);++e<u;)o[e]=t[e+r];return o}function _t(t){if(typeof t=="string")return t;if(De(t))return e(t,_t)+"";if(jr(t))return Ie?Ie.call(t):"";var r=t+"";return"0"==r&&1/t==-qr?"-0":r}function gt(t,r){return r=dt(r,t),t=or(t,r),null==t||delete t[cr(lr(r))]}function dt(t,r){return De(t)?t:Kt(t,r)?[t]:Be(wr(t))}function jt(t,r){if(r)return t.slice();var n=t.length,e=oe?oe(n):new t.constructor(n);
return t.copy(e),e}function wt(t){var r=new t.constructor(t.byteLength);return new ue(r).set(new ue(t)),r}function Ot(t,r){return new t.constructor(r?wt(t.buffer):t.buffer,t.byteOffset,t.byteLength)}function mt(t){var r=new t.constructor(t.source,$n.exec(t));return r.lastIndex=t.lastIndex,r}function At(t){return $e?Object($e.call(t)):{}}function zt(t,r){return new t.constructor(r?wt(t.buffer):t.buffer,t.byteOffset,t.length)}function St(t,r){var n=-1,e=t.length;for(r||(r=Array(e));++n<e;)r[n]=t[n];
return r}function xt(t,r,n,e){var u=!n;n||(n={});for(var o=-1,i=r.length;++o<i;){var c=r[o],a=e?e(n[c],t[c],c,n,t):Lr;a===Lr&&(a=t[c]),u?H(n,c,a):V(n,c,a)}return n}function kt(t,r){return xt(t,Fe(t),r)}function Et(t,r){return xt(t,Me(t),r)}function $t(t){return dr(t)?Lr:t}function It(t,r,n,e,u,i){var c=n&Rr,a=t.length,l=r.length;if(a!=l&&!(c&&l>a))return false;var s=i.get(t);if(s&&i.get(r))return s==r;var h=-1,p=true,v=n&Nr?new P:Lr;for(i.set(t,r),i.set(r,t);++h<a;){var y=t[h],b=r[h];if(e)var _=c?e(b,y,h,r,t,i):e(y,b,h,t,r,i);
if(_!==Lr){if(_)continue;p=false;break}if(v){if(!o(r,function(t,r){if(!f(v,r)&&(y===t||u(y,t,n,e,i)))return v.push(r)})){p=false;break}}else if(y!==b&&!u(y,b,n,e,i)){p=false;break}}return i.delete(t),i.delete(r),p}function Lt(t,r,n,e,u,o,i){switch(n){case yn:if(t.byteLength!=r.byteLength||t.byteOffset!=r.byteOffset)return false;t=t.buffer,r=r.buffer;case vn:return!(t.byteLength!=r.byteLength||!o(new ue(t),new ue(r)));case Qr:case Xr:case nn:return pr(+t,+r);case Yr:return t.name==r.name&&t.message==r.message;case an:
case ln:return t==r+"";case rn:var c=s;case fn:var a=e&Rr;if(c||(c=p),t.size!=r.size&&!a)return false;var f=i.get(t);if(f)return f==r;e|=Nr,i.set(t,r);var l=It(c(t),c(r),e,u,o,i);return i.delete(t),l;case sn:if($e)return $e.call(t)==$e.call(r)}return false}function Pt(t,r,n,e,u,o){var i=n&Rr,c=Mt(t),a=c.length;if(a!=Mt(r).length&&!i)return false;for(var f=a;f--;){var l=c[f];if(!(i?l in r:Xn.call(r,l)))return false}var s=o.get(t);if(s&&o.get(r))return s==r;var h=true;o.set(t,r),o.set(r,t);for(var p=i;++f<a;){l=c[f];
var v=t[l],y=r[l];if(e)var b=i?e(y,v,l,r,t,o):e(v,y,l,t,r,o);if(!(b===Lr?v===y||u(v,y,n,e,o):b)){h=false;break}p||(p="constructor"==l)}if(h&&!p){var _=t.constructor,g=r.constructor;_!=g&&"constructor"in t&&"constructor"in r&&!(typeof _=="function"&&_ instanceof _&&typeof g=="function"&&g instanceof g)&&(h=false)}return o.delete(t),o.delete(r),h}function Ft(t){return Ue(ur(t,Lr,fr),t+"")}function Mt(t){return X(t,Ar,Fe)}function Tt(t){return X(t,zr,Me)}function Ut(){var t=v.iteratee||kr;return t=t===kr?at:t,
arguments.length?t(arguments[0],arguments[1]):t}function Bt(t,r){var n=t.__data__;return Qt(r)?n[typeof r=="string"?"string":"hash"]:n.map}function Ct(t){for(var r=Ar(t),n=r.length;n--;){var e=r[n],u=t[e];r[n]=[e,u,Zt(u)]}return r}function Dt(t,r){var n=l(t,r);return ot(n)?n:Lr}function Rt(t){var r=Xn.call(t,se),n=t[se];try{t[se]=Lr;var e=true}catch(t){}var u=Zn.call(t);return e&&(r?t[se]=n:delete t[se]),u}function Nt(t,r,n){r=dt(r,t);for(var e=-1,u=r.length,o=false;++e<u;){var i=cr(r[e]);if(!(o=null!=t&&n(t,i)))break;
t=t[i]}return o||++e!=u?o:(u=null==t?0:t.length,!!u&&br(u)&&Ht(i,u)&&(De(t)||Ce(t)))}function Vt(t){var r=t.length,n=new t.constructor(r);return r&&"string"==typeof t[0]&&Xn.call(t,"index")&&(n.index=t.index,n.input=t.input),n}function Wt(t){return typeof t.constructor!="function"||Yt(t)?{}:Le(ie(t))}function qt(t,r,n){var e=t.constructor;switch(r){case vn:return wt(t);case Qr:case Xr:return new e(+t);case yn:return Ot(t,n);case bn:case _n:case gn:case dn:case jn:case wn:case On:case mn:case An:return zt(t,n);
case rn:return new e;case nn:case ln:return new e(t);case an:return mt(t);case fn:return new e;case sn:return At(t)}}function Gt(t){return De(t)||Ce(t)||!!(le&&t&&t[le])}function Ht(t,r){var n=typeof t;return r=null==r?Gr:r,!!r&&("number"==n||"symbol"!=n&&Ln.test(t))&&t>-1&&t%1==0&&t<r}function Jt(t,r,n){if(!_r(n))return false;var e=typeof r;return!!("number"==e?vr(n)&&Ht(r,n.length):"string"==e&&r in n)&&pr(n[r],t)}function Kt(t,r){if(De(t))return false;var n=typeof t;return!("number"!=n&&"symbol"!=n&&"boolean"!=n&&null!=t&&!jr(t))||(Sn.test(t)||!zn.test(t)||null!=r&&t in Object(r));
}function Qt(t){var r=typeof t;return"string"==r||"number"==r||"symbol"==r||"boolean"==r?"__proto__"!==t:null===t}function Xt(t){return!!Yn&&Yn in t}function Yt(t){var r=t&&t.constructor;return t===(typeof r=="function"&&r.prototype||Jn)}function Zt(t){return t===t&&!_r(t)}function tr(t,r){return function(n){return null!=n&&(n[t]===r&&(r!==Lr||t in Object(n)))}}function rr(t){var r=hr(t,function(t){return n.size===Ur&&n.clear(),t}),n=r.cache;return r}function nr(t){var r=[];if(null!=t)for(var n in Object(t))r.push(n);
return r}function er(t){return Zn.call(t)}function ur(r,n,e){return n=be(n===Lr?r.length-1:n,0),function(){for(var u=arguments,o=-1,i=be(u.length-n,0),c=Array(i);++o<i;)c[o]=u[n+o];o=-1;for(var a=Array(n+1);++o<n;)a[o]=u[o];return a[n]=e(c),t(r,this,a)}}function or(t,r){return r.length<2?t:Q(t,bt(r,0,-1))}function ir(t){var r=0,n=0;return function(){var e=_e(),u=Wr-(e-n);if(n=e,u>0){if(++r>=Vr)return arguments[0]}else r=0;return t.apply(Lr,arguments)}}function cr(t){if(typeof t=="string"||jr(t))return t;
var r=t+"";return"0"==r&&1/t==-qr?"-0":r}function ar(t){if(null!=t){try{return Qn.call(t)}catch(t){}try{return t+""}catch(t){}}return""}function fr(t){return(null==t?0:t.length)?K(t,1):[]}function lr(t){var r=null==t?0:t.length;return r?t[r-1]:Lr}function sr(t,r){var n=[];if(!t||!t.length)return n;var e=-1,u=[],o=t.length;for(r=Ut(r,3);++e<o;){var i=t[e];r(i,e,t)&&(n.push(i),u.push(e))}return vt(t,u),n}function hr(t,r){if(typeof t!="function"||null!=r&&typeof r!="function")throw new TypeError(Mr);
var n=function(){var e=arguments,u=r?r.apply(this,e):e[0],o=n.cache;if(o.has(u))return o.get(u);var i=t.apply(this,e);return n.cache=o.set(u,i)||o,i};return n.cache=new(hr.Cache||x),n}function pr(t,r){return t===r||t!==t&&r!==r}function vr(t){return null!=t&&br(t.length)&&!yr(t)}function yr(t){if(!_r(t))return false;var r=Y(t);return r==Zr||r==tn||r==Kr||r==cn}function br(t){return typeof t=="number"&&t>-1&&t%1==0&&t<=Gr}function _r(t){var r=typeof t;return null!=t&&("object"==r||"function"==r)}function gr(t){
return null!=t&&typeof t=="object"}function dr(t){if(!gr(t)||Y(t)!=un)return false;var r=ie(t);if(null===r)return true;var n=Xn.call(r,"constructor")&&r.constructor;return typeof n=="function"&&n instanceof n&&Qn.call(n)==te}function jr(t){return typeof t=="symbol"||gr(t)&&Y(t)==sn}function wr(t){return null==t?"":_t(t)}function Or(t,r,n){var e=null==t?Lr:Q(t,r);return e===Lr?n:e}function mr(t,r){return null!=t&&Nt(t,r,Z)}function Ar(t){return vr(t)?N(t):ft(t)}function zr(t){return vr(t)?N(t,true):lt(t)}function Sr(t){
return function(){return t}}function xr(t){return t}function kr(t){return at(typeof t=="function"?t:J(t,Br))}function Er(t){return Kt(t)?i(cr(t)):pt(t)}function $r(){return[]}function Ir(){return false}var Lr,Pr="4.17.5",Fr=200,Mr="Expected a function",Tr="__lodash_hash_undefined__",Ur=500,Br=1,Cr=2,Dr=4,Rr=1,Nr=2,Vr=800,Wr=16,qr=1/0,Gr=9007199254740991,Hr="[object Arguments]",Jr="[object Array]",Kr="[object AsyncFunction]",Qr="[object Boolean]",Xr="[object Date]",Yr="[object Error]",Zr="[object Function]",tn="[object GeneratorFunction]",rn="[object Map]",nn="[object Number]",en="[object Null]",un="[object Object]",on="[object Promise]",cn="[object Proxy]",an="[object RegExp]",fn="[object Set]",ln="[object String]",sn="[object Symbol]",hn="[object Undefined]",pn="[object WeakMap]",vn="[object ArrayBuffer]",yn="[object DataView]",bn="[object Float32Array]",_n="[object Float64Array]",gn="[object Int8Array]",dn="[object Int16Array]",jn="[object Int32Array]",wn="[object Uint8Array]",On="[object Uint8ClampedArray]",mn="[object Uint16Array]",An="[object Uint32Array]",zn=/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,Sn=/^\w*$/,xn=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,kn=/[\\^$.*+?()[\]{}|]/g,En=/\\(\\)?/g,$n=/\w*$/,In=/^\[object .+?Constructor\]$/,Ln=/^(?:0|[1-9]\d*)$/,Pn={};
Pn[bn]=Pn[_n]=Pn[gn]=Pn[dn]=Pn[jn]=Pn[wn]=Pn[On]=Pn[mn]=Pn[An]=true,Pn[Hr]=Pn[Jr]=Pn[vn]=Pn[Qr]=Pn[yn]=Pn[Xr]=Pn[Yr]=Pn[Zr]=Pn[rn]=Pn[nn]=Pn[un]=Pn[an]=Pn[fn]=Pn[ln]=Pn[pn]=false;var Fn={};Fn[Hr]=Fn[Jr]=Fn[vn]=Fn[yn]=Fn[Qr]=Fn[Xr]=Fn[bn]=Fn[_n]=Fn[gn]=Fn[dn]=Fn[jn]=Fn[rn]=Fn[nn]=Fn[un]=Fn[an]=Fn[fn]=Fn[ln]=Fn[sn]=Fn[wn]=Fn[On]=Fn[mn]=Fn[An]=true,Fn[Yr]=Fn[Zr]=Fn[pn]=false;var Mn=typeof global=="object"&&global&&global.Object===Object&&global,Tn=typeof self=="object"&&self&&self.Object===Object&&self,Un=Mn||Tn||Function("return this")(),Bn= true&&exports&&!exports.nodeType&&exports,Cn=Bn&&typeof module=="object"&&module&&!module.nodeType&&module,Dn=Cn&&Cn.exports===Bn,Rn=Dn&&Mn.process,Nn=function(){
try{return Rn&&Rn.binding&&Rn.binding("util")}catch(t){}}(),Vn=Nn&&Nn.isMap,Wn=Nn&&Nn.isSet,qn=Nn&&Nn.isTypedArray,Gn=Array.prototype,Hn=Function.prototype,Jn=Object.prototype,Kn=Un["__core-js_shared__"],Qn=Hn.toString,Xn=Jn.hasOwnProperty,Yn=function(){var t=/[^.]+$/.exec(Kn&&Kn.keys&&Kn.keys.IE_PROTO||"");return t?"Symbol(src)_1."+t:""}(),Zn=Jn.toString,te=Qn.call(Object),re=RegExp("^"+Qn.call(Xn).replace(kn,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$"),ne=Dn?Un.Buffer:Lr,ee=Un.Symbol,ue=Un.Uint8Array,oe=ne?ne.allocUnsafe:Lr,ie=h(Object.getPrototypeOf,Object),ce=Object.create,ae=Jn.propertyIsEnumerable,fe=Gn.splice,le=ee?ee.isConcatSpreadable:Lr,se=ee?ee.toStringTag:Lr,he=function(){
try{var t=Dt(Object,"defineProperty");return t({},"",{}),t}catch(t){}}(),pe=Object.getOwnPropertySymbols,ve=ne?ne.isBuffer:Lr,ye=h(Object.keys,Object),be=Math.max,_e=Date.now,ge=Dt(Un,"DataView"),de=Dt(Un,"Map"),je=Dt(Un,"Promise"),we=Dt(Un,"Set"),Oe=Dt(Un,"WeakMap"),me=Dt(Object,"create"),Ae=ar(ge),ze=ar(de),Se=ar(je),xe=ar(we),ke=ar(Oe),Ee=ee?ee.prototype:Lr,$e=Ee?Ee.valueOf:Lr,Ie=Ee?Ee.toString:Lr,Le=function(){function t(){}return function(r){if(!_r(r))return{};if(ce)return ce(r);t.prototype=r;
var n=new t;return t.prototype=Lr,n}}();y.prototype.clear=b,y.prototype.delete=_,y.prototype.get=g,y.prototype.has=d,y.prototype.set=j,w.prototype.clear=O,w.prototype.delete=m,w.prototype.get=A,w.prototype.has=z,w.prototype.set=S,x.prototype.clear=k,x.prototype.delete=E,x.prototype.get=$,x.prototype.has=I,x.prototype.set=L,P.prototype.add=P.prototype.push=F,P.prototype.has=M,T.prototype.clear=U,T.prototype.delete=B,T.prototype.get=C,T.prototype.has=D,T.prototype.set=R;var Pe=he?function(t,r){return he(t,"toString",{
configurable:true,enumerable:false,value:Sr(r),writable:true})}:xr,Fe=pe?function(t){return null==t?[]:(t=Object(t),n(pe(t),function(r){return ae.call(t,r)}))}:$r,Me=pe?function(t){for(var r=[];t;)u(r,Fe(t)),t=ie(t);return r}:$r,Te=Y;(ge&&Te(new ge(new ArrayBuffer(1)))!=yn||de&&Te(new de)!=rn||je&&Te(je.resolve())!=on||we&&Te(new we)!=fn||Oe&&Te(new Oe)!=pn)&&(Te=function(t){var r=Y(t),n=r==un?t.constructor:Lr,e=n?ar(n):"";if(e)switch(e){case Ae:return yn;case ze:return rn;case Se:return on;case xe:return fn;
case ke:return pn}return r});var Ue=ir(Pe),Be=rr(function(t){var r=[];return 46===t.charCodeAt(0)&&r.push(""),t.replace(xn,function(t,n,e,u){r.push(e?u.replace(En,"$1"):n||t)}),r});hr.Cache=x;var Ce=tt(function(){return arguments}())?tt:function(t){return gr(t)&&Xn.call(t,"callee")&&!ae.call(t,"callee")},De=Array.isArray,Re=ve||Ir,Ne=Vn?a(Vn):et,Ve=Wn?a(Wn):it,We=qn?a(qn):ct,qe=yt(function(t,r){t=Object(t);var n=-1,e=r.length,u=e>2?r[2]:Lr;for(u&&Jt(r[0],r[1],u)&&(e=1);++n<e;)for(var o=r[n],i=zr(o),c=-1,a=i.length;++c<a;){
var f=i[c],l=t[f];(l===Lr||pr(l,Jn[f])&&!Xn.call(t,f))&&(t[f]=o[f])}return t}),Ge=Ft(function(t,r){var n={};if(null==t)return n;var u=false;r=e(r,function(r){return r=dt(r,t),u||(u=r.length>1),r}),xt(t,Tt(t),n),u&&(n=J(n,Br|Cr|Dr,$t));for(var o=r.length;o--;)gt(n,r[o]);return n});v.constant=Sr,v.defaults=qe,v.flatten=fr,v.iteratee=kr,v.keys=Ar,v.keysIn=zr,v.memoize=hr,v.omit=Ge,v.property=Er,v.remove=sr,v.eq=pr,v.get=Or,v.hasIn=mr,v.identity=xr,v.isArguments=Ce,v.isArray=De,v.isArrayLike=vr,v.isBuffer=Re,
v.isFunction=yr,v.isLength=br,v.isMap=Ne,v.isObject=_r,v.isObjectLike=gr,v.isPlainObject=dr,v.isSet=Ve,v.isSymbol=jr,v.isTypedArray=We,v.last=lr,v.stubArray=$r,v.stubFalse=Ir,v.toString=wr,v.VERSION=Pr,Cn&&((Cn.exports=v)._=v,Bn._=v)}).call(this);
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../node_modules/webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js"), __webpack_require__(/*! ./../node_modules/webpack/buildin/module.js */ "./node_modules/webpack/buildin/module.js")(module)))

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9BbGVwaEJldC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9BbGVwaEJldC8uL25vZGVfbW9kdWxlcy9iYXNpbC5qcy9idWlsZC9iYXNpbC5qcyIsIndlYnBhY2s6Ly9BbGVwaEJldC8uL25vZGVfbW9kdWxlcy9jcnlwdG8tanMvY29yZS5qcyIsIndlYnBhY2s6Ly9BbGVwaEJldC8uL25vZGVfbW9kdWxlcy9jcnlwdG8tanMvc2hhMS5qcyIsIndlYnBhY2s6Ly9BbGVwaEJldC8uL25vZGVfbW9kdWxlcy9ub2RlLXV1aWQvdXVpZC5qcyIsIndlYnBhY2s6Ly9BbGVwaEJldC8od2VicGFjaykvYnVpbGRpbi9nbG9iYWwuanMiLCJ3ZWJwYWNrOi8vQWxlcGhCZXQvKHdlYnBhY2spL2J1aWxkaW4vbW9kdWxlLmpzIiwid2VicGFjazovL0FsZXBoQmV0Ly4vc3JjL2FkYXB0ZXJzLmNvZmZlZSIsIndlYnBhY2s6Ly9BbGVwaEJldC8uL3NyYy9hbGVwaGJldC5jb2ZmZWUiLCJ3ZWJwYWNrOi8vQWxlcGhCZXQvLi9zcmMvb3B0aW9ucy5jb2ZmZWUiLCJ3ZWJwYWNrOi8vQWxlcGhCZXQvLi9zcmMvc3RvcmFnZS5jb2ZmZWUiLCJ3ZWJwYWNrOi8vQWxlcGhCZXQvLi9zcmMvdXRpbHMuY29mZmVlIiwid2VicGFjazovL0FsZXBoQmV0Ly4vdmVuZG9yL2xvZGFzaC5jdXN0b20ubWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O1FBQUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7OztRQUdBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwwQ0FBMEMsZ0NBQWdDO1FBQzFFO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0Esd0RBQXdELGtCQUFrQjtRQUMxRTtRQUNBLGlEQUFp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QUF1QixXQUFXLGtDQUFrQyxlQUFlLCtDQUErQyxlQUFlLGVBQWUsNkNBQTZDO0FBQ3BmLG1DQUFtQyxlQUFlLGlDQUFpQyxZQUFZLHdCQUF3Qiw4Q0FBOEMsNERBQTRELGVBQWUsMkNBQTJDLGVBQWUsd0JBQXdCLG1CQUFtQix3QkFBd0Isa0JBQWtCLGlCQUFpQiwwQkFBMEIsZUFBZSx3QkFBd0IsZUFBZSw2QkFBNkI7QUFDN2Ysa0JBQWtCLFVBQVUsZUFBZSxTQUFTLGVBQWUsMENBQTBDLGVBQWUsNEJBQTRCLGNBQWMsU0FBUyxjQUFjLGFBQWEsdWlDQUF1aUM7QUFDanZDLG1MQUFtTCxVQUFVLDBMQUEwTCwwS0FBMEssS0FBd0I7QUFDempCLElBQUksMENBQTBDLFdBQVcscU1BQXFNLHVEQUF1RCwrQkFBK0I7QUFDcFYsSUFBSSxrQ0FBa0MsV0FBVyxNQUFNLElBQUksV0FBVyw0VkFBNFYsY0FBYyxtQkFBbUIsbUJBQW1CLG1CQUFtQjtBQUN6ZSxZQUFZLHlCQUF5QixHQUFHLGliQUFpYix3QkFBd0I7QUFDamYsNkRBQTZELEVBQUUsc0JBQXNCLG1EQUFtRCxvQkFBb0IsR0FBRyxzQkFBc0IsYUFBYSxFQUFFLG9CQUFvQixTQUFTLFNBQVMsZ0pBQWdKLGlEQUFpRCxlQUFlLGtCQUFrQixrQkFBa0Isa0JBQWtCO0FBQ2hmLGtCQUFrQixTQUFTLEVBQUUsZ0NBQWdDLFNBQVMsdUVBQXVFLGtDQUFrQyxJQUFJLEVBQUUsV0FBVyxxQkFBcUIsaUJBQWlCLG1CQUFtQix3REFBd0QsNkZBQTZGLFlBQVksa0NBQWtDLDhCQUE4QixNQUFNLHdDQUF3QyxNQUFNO0FBQzlnQixrQkFBa0Isa0RBQWtELFNBQVMsc0JBQXNCLFNBQVMsb0JBQW9CLFlBQVksa0JBQWtCLHFDQUFxQyx3Q0FBd0MsbUJBQW1CLElBQUksWUFBWSxTQUFTLEVBQUU7QUFDelIsME9BQTBPLGEiLCJmaWxlIjoiYWxlcGhiZXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NyYy9hbGVwaGJldC5jb2ZmZWVcIik7XG4iLCIoZnVuY3Rpb24gKCkge1xuXHQvLyBCYXNpbFxuXHR2YXIgQmFzaWwgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuXHRcdHJldHVybiBCYXNpbC51dGlscy5leHRlbmQoe30sIEJhc2lsLnBsdWdpbnMsIG5ldyBCYXNpbC5TdG9yYWdlKCkuaW5pdChvcHRpb25zKSk7XG5cdH07XG5cblx0Ly8gVmVyc2lvblxuXHRCYXNpbC52ZXJzaW9uID0gJzAuNC4xMCc7XG5cblx0Ly8gVXRpbHNcblx0QmFzaWwudXRpbHMgPSB7XG5cdFx0ZXh0ZW5kOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHR2YXIgZGVzdGluYXRpb24gPSB0eXBlb2YgYXJndW1lbnRzWzBdID09PSAnb2JqZWN0JyA/IGFyZ3VtZW50c1swXSA6IHt9O1xuXHRcdFx0Zm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKGFyZ3VtZW50c1tpXSAmJiB0eXBlb2YgYXJndW1lbnRzW2ldID09PSAnb2JqZWN0Jylcblx0XHRcdFx0XHRmb3IgKHZhciBwcm9wZXJ0eSBpbiBhcmd1bWVudHNbaV0pXG5cdFx0XHRcdFx0XHRkZXN0aW5hdGlvbltwcm9wZXJ0eV0gPSBhcmd1bWVudHNbaV1bcHJvcGVydHldO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGRlc3RpbmF0aW9uO1xuXHRcdH0sXG5cdFx0ZWFjaDogZnVuY3Rpb24gKG9iaiwgZm5JdGVyYXRvciwgY29udGV4dCkge1xuXHRcdFx0aWYgKHRoaXMuaXNBcnJheShvYmopKSB7XG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgb2JqLmxlbmd0aDsgaSsrKVxuXHRcdFx0XHRcdGlmIChmbkl0ZXJhdG9yLmNhbGwoY29udGV4dCwgb2JqW2ldLCBpKSA9PT0gZmFsc2UpIHJldHVybjtcblx0XHRcdH0gZWxzZSBpZiAob2JqKSB7XG5cdFx0XHRcdGZvciAodmFyIGtleSBpbiBvYmopXG5cdFx0XHRcdFx0aWYgKGZuSXRlcmF0b3IuY2FsbChjb250ZXh0LCBvYmpba2V5XSwga2V5KSA9PT0gZmFsc2UpIHJldHVybjtcblx0XHRcdH1cblx0XHR9LFxuXHRcdHRyeUVhY2g6IGZ1bmN0aW9uIChvYmosIGZuSXRlcmF0b3IsIGZuRXJyb3IsIGNvbnRleHQpIHtcblx0XHRcdHRoaXMuZWFjaChvYmosIGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZuSXRlcmF0b3IuY2FsbChjb250ZXh0LCB2YWx1ZSwga2V5KTtcblx0XHRcdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdFx0XHRpZiAodGhpcy5pc0Z1bmN0aW9uKGZuRXJyb3IpKSB7XG5cdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRmbkVycm9yLmNhbGwoY29udGV4dCwgdmFsdWUsIGtleSwgZXJyb3IpO1xuXHRcdFx0XHRcdFx0fSBjYXRjaCAoZXJyb3IpIHt9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9LCB0aGlzKTtcblx0XHR9LFxuXHRcdHJlZ2lzdGVyUGx1Z2luOiBmdW5jdGlvbiAobWV0aG9kcykge1xuXHRcdFx0QmFzaWwucGx1Z2lucyA9IHRoaXMuZXh0ZW5kKG1ldGhvZHMsIEJhc2lsLnBsdWdpbnMpO1xuXHRcdH0sXG5cdFx0Z2V0VHlwZU9mOiBmdW5jdGlvbiAob2JqKSB7XG5cdFx0XHRpZiAodHlwZW9mIG9iaiA9PT0gJ3VuZGVmaW5lZCcgfHwgb2JqID09PSBudWxsKVxuXHRcdFx0XHRyZXR1cm4gJycgKyBvYmo7XG5cdFx0XHRyZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikucmVwbGFjZSgvXlxcW29iamVjdFxccyguKilcXF0kLywgZnVuY3Rpb24gKCQwLCAkMSkgeyByZXR1cm4gJDEudG9Mb3dlckNhc2UoKTsgfSk7XG5cdFx0fVxuXHR9O1xuXG5cdC8vIEFkZCBzb21lIGlzVHlwZSBtZXRob2RzOiBpc0FyZ3VtZW50cywgaXNCb29sZWFuLCBpc0Z1bmN0aW9uLCBpc1N0cmluZywgaXNBcnJheSwgaXNOdW1iZXIsIGlzRGF0ZSwgaXNSZWdFeHAsIGlzVW5kZWZpbmVkLCBpc051bGwuXG5cdHZhciB0eXBlcyA9IFsnQXJndW1lbnRzJywgJ0Jvb2xlYW4nLCAnRnVuY3Rpb24nLCAnU3RyaW5nJywgJ0FycmF5JywgJ051bWJlcicsICdEYXRlJywgJ1JlZ0V4cCcsICdVbmRlZmluZWQnLCAnTnVsbCddO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IHR5cGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0QmFzaWwudXRpbHNbJ2lzJyArIHR5cGVzW2ldXSA9IChmdW5jdGlvbiAodHlwZSkge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uIChvYmopIHtcblx0XHRcdFx0cmV0dXJuIEJhc2lsLnV0aWxzLmdldFR5cGVPZihvYmopID09PSB0eXBlLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHR9O1xuXHRcdH0pKHR5cGVzW2ldKTtcblx0fVxuXG5cdC8vIFBsdWdpbnNcblx0QmFzaWwucGx1Z2lucyA9IHt9O1xuXG5cdC8vIE9wdGlvbnNcblx0QmFzaWwub3B0aW9ucyA9IEJhc2lsLnV0aWxzLmV4dGVuZCh7XG5cdFx0bmFtZXNwYWNlOiAnYjQ1aTEnLFxuXHRcdHN0b3JhZ2VzOiBbJ2xvY2FsJywgJ2Nvb2tpZScsICdzZXNzaW9uJywgJ21lbW9yeSddLFxuXHRcdGV4cGlyZURheXM6IDM2NSxcblx0XHRrZXlEZWxpbWl0ZXI6ICcuJ1xuXHR9LCB3aW5kb3cuQmFzaWwgPyB3aW5kb3cuQmFzaWwub3B0aW9ucyA6IHt9KTtcblxuXHQvLyBTdG9yYWdlXG5cdEJhc2lsLlN0b3JhZ2UgPSBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIF9zYWx0ID0gJ2I0NWkxJyArIChNYXRoLnJhbmRvbSgpICsgMSlcblx0XHRcdFx0LnRvU3RyaW5nKDM2KVxuXHRcdFx0XHQuc3Vic3RyaW5nKDcpLFxuXHRcdFx0X3N0b3JhZ2VzID0ge30sXG5cdFx0XHRfaXNWYWxpZEtleSA9IGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdFx0dmFyIHR5cGUgPSBCYXNpbC51dGlscy5nZXRUeXBlT2Yoa2V5KTtcblx0XHRcdFx0cmV0dXJuICh0eXBlID09PSAnc3RyaW5nJyAmJiBrZXkpIHx8IHR5cGUgPT09ICdudW1iZXInIHx8IHR5cGUgPT09ICdib29sZWFuJztcblx0XHRcdH0sXG5cdFx0XHRfdG9TdG9yYWdlc0FycmF5ID0gZnVuY3Rpb24gKHN0b3JhZ2VzKSB7XG5cdFx0XHRcdGlmIChCYXNpbC51dGlscy5pc0FycmF5KHN0b3JhZ2VzKSlcblx0XHRcdFx0XHRyZXR1cm4gc3RvcmFnZXM7XG5cdFx0XHRcdHJldHVybiBCYXNpbC51dGlscy5pc1N0cmluZyhzdG9yYWdlcykgPyBbc3RvcmFnZXNdIDogW107XG5cdFx0XHR9LFxuXHRcdFx0X3RvU3RvcmVkS2V5ID0gZnVuY3Rpb24gKG5hbWVzcGFjZSwgcGF0aCwgZGVsaW1pdGVyKSB7XG5cdFx0XHRcdHZhciBrZXkgPSAnJztcblx0XHRcdFx0aWYgKF9pc1ZhbGlkS2V5KHBhdGgpKSB7XG5cdFx0XHRcdFx0a2V5ICs9IHBhdGg7XG5cdFx0XHRcdH0gZWxzZSBpZiAoQmFzaWwudXRpbHMuaXNBcnJheShwYXRoKSkge1xuXHRcdFx0XHRcdHBhdGggPSBCYXNpbC51dGlscy5pc0Z1bmN0aW9uKHBhdGguZmlsdGVyKSA/IHBhdGguZmlsdGVyKF9pc1ZhbGlkS2V5KSA6IHBhdGg7XG5cdFx0XHRcdFx0a2V5ID0gcGF0aC5qb2luKGRlbGltaXRlcik7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIGtleSAmJiBfaXNWYWxpZEtleShuYW1lc3BhY2UpID8gbmFtZXNwYWNlICsgZGVsaW1pdGVyICsga2V5IDoga2V5O1xuIFx0XHRcdH0sXG5cdFx0XHRfdG9LZXlOYW1lID0gZnVuY3Rpb24gKG5hbWVzcGFjZSwga2V5LCBkZWxpbWl0ZXIpIHtcblx0XHRcdFx0aWYgKCFfaXNWYWxpZEtleShuYW1lc3BhY2UpKVxuXHRcdFx0XHRcdHJldHVybiBrZXk7XG5cdFx0XHRcdHJldHVybiBrZXkucmVwbGFjZShuZXcgUmVnRXhwKCdeJyArIG5hbWVzcGFjZSArIGRlbGltaXRlciksICcnKTtcblx0XHRcdH0sXG5cdFx0XHRfdG9TdG9yZWRWYWx1ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuXHRcdFx0XHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuXHRcdFx0fSxcblx0XHRcdF9mcm9tU3RvcmVkVmFsdWUgPSBmdW5jdGlvbiAodmFsdWUpIHtcblx0XHRcdFx0cmV0dXJuIHZhbHVlID8gSlNPTi5wYXJzZSh2YWx1ZSkgOiBudWxsO1xuXHRcdFx0fTtcblxuXHRcdC8vIEhUTUw1IHdlYiBzdG9yYWdlIGludGVyZmFjZVxuXHRcdHZhciB3ZWJTdG9yYWdlSW50ZXJmYWNlID0ge1xuXHRcdFx0ZW5naW5lOiBudWxsLFxuXHRcdFx0Y2hlY2s6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHR3aW5kb3dbdGhpcy5lbmdpbmVdLnNldEl0ZW0oX3NhbHQsIHRydWUpO1xuXHRcdFx0XHRcdHdpbmRvd1t0aGlzLmVuZ2luZV0ucmVtb3ZlSXRlbShfc2FsdCk7XG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9LFxuXHRcdFx0c2V0OiBmdW5jdGlvbiAoa2V5LCB2YWx1ZSwgb3B0aW9ucykge1xuXHRcdFx0XHRpZiAoIWtleSlcblx0XHRcdFx0XHR0aHJvdyBFcnJvcignaW52YWxpZCBrZXknKTtcblx0XHRcdFx0d2luZG93W3RoaXMuZW5naW5lXS5zZXRJdGVtKGtleSwgdmFsdWUpO1xuXHRcdFx0fSxcblx0XHRcdGdldDogZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0XHRyZXR1cm4gd2luZG93W3RoaXMuZW5naW5lXS5nZXRJdGVtKGtleSk7XG5cdFx0XHR9LFxuXHRcdFx0cmVtb3ZlOiBmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHRcdHdpbmRvd1t0aGlzLmVuZ2luZV0ucmVtb3ZlSXRlbShrZXkpO1xuXHRcdFx0fSxcblx0XHRcdHJlc2V0OiBmdW5jdGlvbiAobmFtZXNwYWNlKSB7XG5cdFx0XHRcdGZvciAodmFyIGkgPSAwLCBrZXk7IGkgPCB3aW5kb3dbdGhpcy5lbmdpbmVdLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0a2V5ID0gd2luZG93W3RoaXMuZW5naW5lXS5rZXkoaSk7XG5cdFx0XHRcdFx0aWYgKCFuYW1lc3BhY2UgfHwga2V5LmluZGV4T2YobmFtZXNwYWNlKSA9PT0gMCkge1xuXHRcdFx0XHRcdFx0dGhpcy5yZW1vdmUoa2V5KTtcblx0XHRcdFx0XHRcdGktLTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRrZXlzOiBmdW5jdGlvbiAobmFtZXNwYWNlLCBkZWxpbWl0ZXIpIHtcblx0XHRcdFx0dmFyIGtleXMgPSBbXTtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDAsIGtleTsgaSA8IHdpbmRvd1t0aGlzLmVuZ2luZV0ubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRrZXkgPSB3aW5kb3dbdGhpcy5lbmdpbmVdLmtleShpKTtcblx0XHRcdFx0XHRpZiAoIW5hbWVzcGFjZSB8fCBrZXkuaW5kZXhPZihuYW1lc3BhY2UpID09PSAwKVxuXHRcdFx0XHRcdFx0a2V5cy5wdXNoKF90b0tleU5hbWUobmFtZXNwYWNlLCBrZXksIGRlbGltaXRlcikpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBrZXlzO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHQvLyBsb2NhbCBzdG9yYWdlXG5cdFx0X3N0b3JhZ2VzLmxvY2FsID0gQmFzaWwudXRpbHMuZXh0ZW5kKHt9LCB3ZWJTdG9yYWdlSW50ZXJmYWNlLCB7XG5cdFx0XHRlbmdpbmU6ICdsb2NhbFN0b3JhZ2UnXG5cdFx0fSk7XG5cdFx0Ly8gc2Vzc2lvbiBzdG9yYWdlXG5cdFx0X3N0b3JhZ2VzLnNlc3Npb24gPSBCYXNpbC51dGlscy5leHRlbmQoe30sIHdlYlN0b3JhZ2VJbnRlcmZhY2UsIHtcblx0XHRcdGVuZ2luZTogJ3Nlc3Npb25TdG9yYWdlJ1xuXHRcdH0pO1xuXG5cdFx0Ly8gbWVtb3J5IHN0b3JhZ2Vcblx0XHRfc3RvcmFnZXMubWVtb3J5ID0ge1xuXHRcdFx0X2hhc2g6IHt9LFxuXHRcdFx0Y2hlY2s6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9LFxuXHRcdFx0c2V0OiBmdW5jdGlvbiAoa2V5LCB2YWx1ZSwgb3B0aW9ucykge1xuXHRcdFx0XHRpZiAoIWtleSlcblx0XHRcdFx0XHR0aHJvdyBFcnJvcignaW52YWxpZCBrZXknKTtcblx0XHRcdFx0dGhpcy5faGFzaFtrZXldID0gdmFsdWU7XG5cdFx0XHR9LFxuXHRcdFx0Z2V0OiBmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLl9oYXNoW2tleV0gfHwgbnVsbDtcblx0XHRcdH0sXG5cdFx0XHRyZW1vdmU6IGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdFx0ZGVsZXRlIHRoaXMuX2hhc2hba2V5XTtcblx0XHRcdH0sXG5cdFx0XHRyZXNldDogZnVuY3Rpb24gKG5hbWVzcGFjZSkge1xuXHRcdFx0XHRmb3IgKHZhciBrZXkgaW4gdGhpcy5faGFzaCkge1xuXHRcdFx0XHRcdGlmICghbmFtZXNwYWNlIHx8IGtleS5pbmRleE9mKG5hbWVzcGFjZSkgPT09IDApXG5cdFx0XHRcdFx0XHR0aGlzLnJlbW92ZShrZXkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0a2V5czogZnVuY3Rpb24gKG5hbWVzcGFjZSwgZGVsaW1pdGVyKSB7XG5cdFx0XHRcdHZhciBrZXlzID0gW107XG5cdFx0XHRcdGZvciAodmFyIGtleSBpbiB0aGlzLl9oYXNoKVxuXHRcdFx0XHRcdGlmICghbmFtZXNwYWNlIHx8IGtleS5pbmRleE9mKG5hbWVzcGFjZSkgPT09IDApXG5cdFx0XHRcdFx0XHRrZXlzLnB1c2goX3RvS2V5TmFtZShuYW1lc3BhY2UsIGtleSwgZGVsaW1pdGVyKSk7XG5cdFx0XHRcdHJldHVybiBrZXlzO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHQvLyBjb29raWUgc3RvcmFnZVxuXHRcdF9zdG9yYWdlcy5jb29raWUgPSB7XG5cdFx0XHRjaGVjazogZnVuY3Rpb24gKG9wdGlvbnMpIHtcblx0XHRcdFx0aWYgKCFuYXZpZ2F0b3IuY29va2llRW5hYmxlZClcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdGlmICh3aW5kb3cuc2VsZiAhPT0gd2luZG93LnRvcCkge1xuXHRcdFx0XHRcdC8vIHdlIG5lZWQgdG8gY2hlY2sgdGhpcmQtcGFydHkgY29va2llcztcblx0XHRcdFx0XHR2YXIgY29va2llID0gJ3RoaXJkcGFydHkuY2hlY2s9JyArIE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIDEwMDApO1xuXHRcdFx0XHRcdGRvY3VtZW50LmNvb2tpZSA9IGNvb2tpZSArICc7IHBhdGg9Lyc7XG5cdFx0XHRcdFx0cmV0dXJuIGRvY3VtZW50LmNvb2tpZS5pbmRleE9mKGNvb2tpZSkgIT09IC0xO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIGlmIGNvb2tpZSBzZWN1cmUgYWN0aXZhdGVkLCBlbnN1cmUgaXQgd29ya3MgKG5vdCB0aGUgY2FzZSBpZiB3ZSBhcmUgaW4gaHR0cCBvbmx5KVxuXHRcdFx0XHRpZiAob3B0aW9ucyAmJiBvcHRpb25zLnNlY3VyZSkge1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHR0aGlzLnNldChfc2FsdCwgX3NhbHQsIG9wdGlvbnMpO1xuXHRcdFx0XHRcdFx0dmFyIGhhc1NlY3VyZWx5UGVyc2l0ZWQgPSB0aGlzLmdldChfc2FsdCkgPT09IF9zYWx0O1xuXHRcdFx0XHRcdFx0dGhpcy5yZW1vdmUoX3NhbHQpO1xuXHRcdFx0XHRcdFx0cmV0dXJuIGhhc1NlY3VyZWx5UGVyc2l0ZWQ7XG5cdFx0XHRcdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9LFxuXHRcdFx0c2V0OiBmdW5jdGlvbiAoa2V5LCB2YWx1ZSwgb3B0aW9ucykge1xuXHRcdFx0XHRpZiAoIXRoaXMuY2hlY2soKSlcblx0XHRcdFx0XHR0aHJvdyBFcnJvcignY29va2llcyBhcmUgZGlzYWJsZWQnKTtcblx0XHRcdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdFx0XHRcdGlmICgha2V5KVxuXHRcdFx0XHRcdHRocm93IEVycm9yKCdpbnZhbGlkIGtleScpO1xuXHRcdFx0XHR2YXIgY29va2llID0gZW5jb2RlVVJJQ29tcG9uZW50KGtleSkgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpO1xuXHRcdFx0XHQvLyBoYW5kbGUgZXhwaXJhdGlvbiBkYXlzXG5cdFx0XHRcdGlmIChvcHRpb25zLmV4cGlyZURheXMpIHtcblx0XHRcdFx0XHR2YXIgZGF0ZSA9IG5ldyBEYXRlKCk7XG5cdFx0XHRcdFx0ZGF0ZS5zZXRUaW1lKGRhdGUuZ2V0VGltZSgpICsgKG9wdGlvbnMuZXhwaXJlRGF5cyAqIDI0ICogNjAgKiA2MCAqIDEwMDApKTtcblx0XHRcdFx0XHRjb29raWUgKz0gJzsgZXhwaXJlcz0nICsgZGF0ZS50b0dNVFN0cmluZygpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIGhhbmRsZSBkb21haW5cblx0XHRcdFx0aWYgKG9wdGlvbnMuZG9tYWluICYmIG9wdGlvbnMuZG9tYWluICE9PSBkb2N1bWVudC5kb21haW4pIHtcblx0XHRcdFx0XHR2YXIgX2RvbWFpbiA9IG9wdGlvbnMuZG9tYWluLnJlcGxhY2UoL15cXC4vLCAnJyk7XG5cdFx0XHRcdFx0aWYgKGRvY3VtZW50LmRvbWFpbi5pbmRleE9mKF9kb21haW4pID09PSAtMSB8fCBfZG9tYWluLnNwbGl0KCcuJykubGVuZ3RoIDw9IDEpXG5cdFx0XHRcdFx0XHR0aHJvdyBFcnJvcignaW52YWxpZCBkb21haW4nKTtcblx0XHRcdFx0XHRjb29raWUgKz0gJzsgZG9tYWluPScgKyBvcHRpb25zLmRvbWFpbjtcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBoYW5kbGUgc2VjdXJlXG5cdFx0XHRcdGlmIChvcHRpb25zLnNlY3VyZSA9PT0gdHJ1ZSkge1xuXHRcdFx0XHRcdGNvb2tpZSArPSAnOyBTZWN1cmUnO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGRvY3VtZW50LmNvb2tpZSA9IGNvb2tpZSArICc7IHBhdGg9Lyc7XG5cdFx0XHR9LFxuXHRcdFx0Z2V0OiBmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHRcdGlmICghdGhpcy5jaGVjaygpKVxuXHRcdFx0XHRcdHRocm93IEVycm9yKCdjb29raWVzIGFyZSBkaXNhYmxlZCcpO1xuXHRcdFx0XHR2YXIgZW5jb2RlZEtleSA9IGVuY29kZVVSSUNvbXBvbmVudChrZXkpO1xuXHRcdFx0XHR2YXIgY29va2llcyA9IGRvY3VtZW50LmNvb2tpZSA/IGRvY3VtZW50LmNvb2tpZS5zcGxpdCgnOycpIDogW107XG5cdFx0XHRcdC8vIHJldHJpZXZlIGxhc3QgdXBkYXRlZCBjb29raWUgZmlyc3Rcblx0XHRcdFx0Zm9yICh2YXIgaSA9IGNvb2tpZXMubGVuZ3RoIC0gMSwgY29va2llOyBpID49IDA7IGktLSkge1xuXHRcdFx0XHRcdGNvb2tpZSA9IGNvb2tpZXNbaV0ucmVwbGFjZSgvXlxccyovLCAnJyk7XG5cdFx0XHRcdFx0aWYgKGNvb2tpZS5pbmRleE9mKGVuY29kZWRLZXkgKyAnPScpID09PSAwKVxuXHRcdFx0XHRcdFx0cmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChjb29raWUuc3Vic3RyaW5nKGVuY29kZWRLZXkubGVuZ3RoICsgMSwgY29va2llLmxlbmd0aCkpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0fSxcblx0XHRcdHJlbW92ZTogZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0XHQvLyByZW1vdmUgY29va2llIGZyb20gbWFpbiBkb21haW5cblx0XHRcdFx0dGhpcy5zZXQoa2V5LCAnJywgeyBleHBpcmVEYXlzOiAtMSB9KTtcblx0XHRcdFx0Ly8gcmVtb3ZlIGNvb2tpZSBmcm9tIHVwcGVyIGRvbWFpbnNcblx0XHRcdFx0dmFyIGRvbWFpblBhcnRzID0gZG9jdW1lbnQuZG9tYWluLnNwbGl0KCcuJyk7XG5cdFx0XHRcdGZvciAodmFyIGkgPSBkb21haW5QYXJ0cy5sZW5ndGg7IGkgPiAxOyBpLS0pIHtcblx0XHRcdFx0XHR0aGlzLnNldChrZXksICcnLCB7IGV4cGlyZURheXM6IC0xLCBkb21haW46ICcuJyArIGRvbWFpblBhcnRzLnNsaWNlKC0gaSkuam9pbignLicpIH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0cmVzZXQ6IGZ1bmN0aW9uIChuYW1lc3BhY2UpIHtcblx0XHRcdFx0dmFyIGNvb2tpZXMgPSBkb2N1bWVudC5jb29raWUgPyBkb2N1bWVudC5jb29raWUuc3BsaXQoJzsnKSA6IFtdO1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMCwgY29va2llLCBrZXk7IGkgPCBjb29raWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0Y29va2llID0gY29va2llc1tpXS5yZXBsYWNlKC9eXFxzKi8sICcnKTtcblx0XHRcdFx0XHRrZXkgPSBjb29raWUuc3Vic3RyKDAsIGNvb2tpZS5pbmRleE9mKCc9JykpO1xuXHRcdFx0XHRcdGlmICghbmFtZXNwYWNlIHx8IGtleS5pbmRleE9mKG5hbWVzcGFjZSkgPT09IDApXG5cdFx0XHRcdFx0XHR0aGlzLnJlbW92ZShrZXkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0a2V5czogZnVuY3Rpb24gKG5hbWVzcGFjZSwgZGVsaW1pdGVyKSB7XG5cdFx0XHRcdGlmICghdGhpcy5jaGVjaygpKVxuXHRcdFx0XHRcdHRocm93IEVycm9yKCdjb29raWVzIGFyZSBkaXNhYmxlZCcpO1xuXHRcdFx0XHR2YXIga2V5cyA9IFtdLFxuXHRcdFx0XHRcdGNvb2tpZXMgPSBkb2N1bWVudC5jb29raWUgPyBkb2N1bWVudC5jb29raWUuc3BsaXQoJzsnKSA6IFtdO1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMCwgY29va2llLCBrZXk7IGkgPCBjb29raWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0Y29va2llID0gY29va2llc1tpXS5yZXBsYWNlKC9eXFxzKi8sICcnKTtcblx0XHRcdFx0XHRrZXkgPSBkZWNvZGVVUklDb21wb25lbnQoY29va2llLnN1YnN0cigwLCBjb29raWUuaW5kZXhPZignPScpKSk7XG5cdFx0XHRcdFx0aWYgKCFuYW1lc3BhY2UgfHwga2V5LmluZGV4T2YobmFtZXNwYWNlKSA9PT0gMClcblx0XHRcdFx0XHRcdGtleXMucHVzaChfdG9LZXlOYW1lKG5hbWVzcGFjZSwga2V5LCBkZWxpbWl0ZXIpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4ga2V5cztcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdGluaXQ6IGZ1bmN0aW9uIChvcHRpb25zKSB7XG5cdFx0XHRcdHRoaXMuc2V0T3B0aW9ucyhvcHRpb25zKTtcblx0XHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0XHR9LFxuXHRcdFx0c2V0T3B0aW9uczogZnVuY3Rpb24gKG9wdGlvbnMpIHtcblx0XHRcdFx0dGhpcy5vcHRpb25zID0gQmFzaWwudXRpbHMuZXh0ZW5kKHt9LCB0aGlzLm9wdGlvbnMgfHwgQmFzaWwub3B0aW9ucywgb3B0aW9ucyk7XG5cdFx0XHR9LFxuXHRcdFx0c3VwcG9ydDogZnVuY3Rpb24gKHN0b3JhZ2UpIHtcblx0XHRcdFx0cmV0dXJuIF9zdG9yYWdlcy5oYXNPd25Qcm9wZXJ0eShzdG9yYWdlKTtcblx0XHRcdH0sXG5cdFx0XHRjaGVjazogZnVuY3Rpb24gKHN0b3JhZ2UpIHtcblx0XHRcdFx0aWYgKHRoaXMuc3VwcG9ydChzdG9yYWdlKSlcblx0XHRcdFx0XHRyZXR1cm4gX3N0b3JhZ2VzW3N0b3JhZ2VdLmNoZWNrKHRoaXMub3B0aW9ucyk7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH0sXG5cdFx0XHRzZXQ6IGZ1bmN0aW9uIChrZXksIHZhbHVlLCBvcHRpb25zKSB7XG5cdFx0XHRcdG9wdGlvbnMgPSBCYXNpbC51dGlscy5leHRlbmQoe30sIHRoaXMub3B0aW9ucywgb3B0aW9ucyk7XG5cdFx0XHRcdGlmICghKGtleSA9IF90b1N0b3JlZEtleShvcHRpb25zLm5hbWVzcGFjZSwga2V5LCBvcHRpb25zLmtleURlbGltaXRlcikpKVxuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0dmFsdWUgPSBvcHRpb25zLnJhdyA9PT0gdHJ1ZSA/IHZhbHVlIDogX3RvU3RvcmVkVmFsdWUodmFsdWUpO1xuXHRcdFx0XHR2YXIgd2hlcmUgPSBudWxsO1xuXHRcdFx0XHQvLyB0cnkgdG8gc2V0IGtleS92YWx1ZSBpbiBmaXJzdCBhdmFpbGFibGUgc3RvcmFnZVxuXHRcdFx0XHRCYXNpbC51dGlscy50cnlFYWNoKF90b1N0b3JhZ2VzQXJyYXkob3B0aW9ucy5zdG9yYWdlcyksIGZ1bmN0aW9uIChzdG9yYWdlLCBpbmRleCkge1xuXHRcdFx0XHRcdF9zdG9yYWdlc1tzdG9yYWdlXS5zZXQoa2V5LCB2YWx1ZSwgb3B0aW9ucyk7XG5cdFx0XHRcdFx0d2hlcmUgPSBzdG9yYWdlO1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTsgLy8gYnJlYWs7XG5cdFx0XHRcdH0sIG51bGwsIHRoaXMpO1xuXHRcdFx0XHRpZiAoIXdoZXJlKSB7XG5cdFx0XHRcdFx0Ly8ga2V5IGhhcyBub3QgYmVlbiBzZXQgYW55d2hlcmVcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gcmVtb3ZlIGtleSBmcm9tIGFsbCBvdGhlciBzdG9yYWdlc1xuXHRcdFx0XHRCYXNpbC51dGlscy50cnlFYWNoKF90b1N0b3JhZ2VzQXJyYXkob3B0aW9ucy5zdG9yYWdlcyksIGZ1bmN0aW9uIChzdG9yYWdlLCBpbmRleCkge1xuXHRcdFx0XHRcdGlmIChzdG9yYWdlICE9PSB3aGVyZSlcblx0XHRcdFx0XHRcdF9zdG9yYWdlc1tzdG9yYWdlXS5yZW1vdmUoa2V5KTtcblx0XHRcdFx0fSwgbnVsbCwgdGhpcyk7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fSxcblx0XHRcdGdldDogZnVuY3Rpb24gKGtleSwgb3B0aW9ucykge1xuXHRcdFx0XHRvcHRpb25zID0gQmFzaWwudXRpbHMuZXh0ZW5kKHt9LCB0aGlzLm9wdGlvbnMsIG9wdGlvbnMpO1xuXHRcdFx0XHRpZiAoIShrZXkgPSBfdG9TdG9yZWRLZXkob3B0aW9ucy5uYW1lc3BhY2UsIGtleSwgb3B0aW9ucy5rZXlEZWxpbWl0ZXIpKSlcblx0XHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdFx0dmFyIHZhbHVlID0gbnVsbDtcblx0XHRcdFx0QmFzaWwudXRpbHMudHJ5RWFjaChfdG9TdG9yYWdlc0FycmF5KG9wdGlvbnMuc3RvcmFnZXMpLCBmdW5jdGlvbiAoc3RvcmFnZSwgaW5kZXgpIHtcblx0XHRcdFx0XHRpZiAodmFsdWUgIT09IG51bGwpXG5cdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7IC8vIGJyZWFrIGlmIGEgdmFsdWUgaGFzIGFscmVhZHkgYmVlbiBmb3VuZC5cblx0XHRcdFx0XHR2YWx1ZSA9IF9zdG9yYWdlc1tzdG9yYWdlXS5nZXQoa2V5LCBvcHRpb25zKSB8fCBudWxsO1xuXHRcdFx0XHRcdHZhbHVlID0gb3B0aW9ucy5yYXcgPT09IHRydWUgPyB2YWx1ZSA6IF9mcm9tU3RvcmVkVmFsdWUodmFsdWUpO1xuXHRcdFx0XHR9LCBmdW5jdGlvbiAoc3RvcmFnZSwgaW5kZXgsIGVycm9yKSB7XG5cdFx0XHRcdFx0dmFsdWUgPSBudWxsO1xuXHRcdFx0XHR9LCB0aGlzKTtcblx0XHRcdFx0cmV0dXJuIHZhbHVlO1xuXHRcdFx0fSxcblx0XHRcdHJlbW92ZTogZnVuY3Rpb24gKGtleSwgb3B0aW9ucykge1xuXHRcdFx0XHRvcHRpb25zID0gQmFzaWwudXRpbHMuZXh0ZW5kKHt9LCB0aGlzLm9wdGlvbnMsIG9wdGlvbnMpO1xuXHRcdFx0XHRpZiAoIShrZXkgPSBfdG9TdG9yZWRLZXkob3B0aW9ucy5uYW1lc3BhY2UsIGtleSwgb3B0aW9ucy5rZXlEZWxpbWl0ZXIpKSlcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdEJhc2lsLnV0aWxzLnRyeUVhY2goX3RvU3RvcmFnZXNBcnJheShvcHRpb25zLnN0b3JhZ2VzKSwgZnVuY3Rpb24gKHN0b3JhZ2UpIHtcblx0XHRcdFx0XHRfc3RvcmFnZXNbc3RvcmFnZV0ucmVtb3ZlKGtleSk7XG5cdFx0XHRcdH0sIG51bGwsIHRoaXMpO1xuXHRcdFx0fSxcblx0XHRcdHJlc2V0OiBmdW5jdGlvbiAob3B0aW9ucykge1xuXHRcdFx0XHRvcHRpb25zID0gQmFzaWwudXRpbHMuZXh0ZW5kKHt9LCB0aGlzLm9wdGlvbnMsIG9wdGlvbnMpO1xuXHRcdFx0XHRCYXNpbC51dGlscy50cnlFYWNoKF90b1N0b3JhZ2VzQXJyYXkob3B0aW9ucy5zdG9yYWdlcyksIGZ1bmN0aW9uIChzdG9yYWdlKSB7XG5cdFx0XHRcdFx0X3N0b3JhZ2VzW3N0b3JhZ2VdLnJlc2V0KG9wdGlvbnMubmFtZXNwYWNlKTtcblx0XHRcdFx0fSwgbnVsbCwgdGhpcyk7XG5cdFx0XHR9LFxuXHRcdFx0a2V5czogZnVuY3Rpb24gKG9wdGlvbnMpIHtcblx0XHRcdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdFx0XHRcdHZhciBrZXlzID0gW107XG5cdFx0XHRcdGZvciAodmFyIGtleSBpbiB0aGlzLmtleXNNYXAob3B0aW9ucykpXG5cdFx0XHRcdFx0a2V5cy5wdXNoKGtleSk7XG5cdFx0XHRcdHJldHVybiBrZXlzO1xuXHRcdFx0fSxcblx0XHRcdGtleXNNYXA6IGZ1bmN0aW9uIChvcHRpb25zKSB7XG5cdFx0XHRcdG9wdGlvbnMgPSBCYXNpbC51dGlscy5leHRlbmQoe30sIHRoaXMub3B0aW9ucywgb3B0aW9ucyk7XG5cdFx0XHRcdHZhciBtYXAgPSB7fTtcblx0XHRcdFx0QmFzaWwudXRpbHMudHJ5RWFjaChfdG9TdG9yYWdlc0FycmF5KG9wdGlvbnMuc3RvcmFnZXMpLCBmdW5jdGlvbiAoc3RvcmFnZSkge1xuXHRcdFx0XHRcdEJhc2lsLnV0aWxzLmVhY2goX3N0b3JhZ2VzW3N0b3JhZ2VdLmtleXMob3B0aW9ucy5uYW1lc3BhY2UsIG9wdGlvbnMua2V5RGVsaW1pdGVyKSwgZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0XHRcdFx0bWFwW2tleV0gPSBCYXNpbC51dGlscy5pc0FycmF5KG1hcFtrZXldKSA/IG1hcFtrZXldIDogW107XG5cdFx0XHRcdFx0XHRtYXBba2V5XS5wdXNoKHN0b3JhZ2UpO1xuXHRcdFx0XHRcdH0sIHRoaXMpO1xuXHRcdFx0XHR9LCBudWxsLCB0aGlzKTtcblx0XHRcdFx0cmV0dXJuIG1hcDtcblx0XHRcdH1cblx0XHR9O1xuXHR9O1xuXG5cdC8vIEFjY2VzcyB0byBuYXRpdmUgc3RvcmFnZXMsIHdpdGhvdXQgbmFtZXNwYWNlIG9yIGJhc2lsIHZhbHVlIGRlY29yYXRpb25cblx0QmFzaWwubWVtb3J5ID0gbmV3IEJhc2lsLlN0b3JhZ2UoKS5pbml0KHsgc3RvcmFnZXM6ICdtZW1vcnknLCBuYW1lc3BhY2U6IG51bGwsIHJhdzogdHJ1ZSB9KTtcblx0QmFzaWwuY29va2llID0gbmV3IEJhc2lsLlN0b3JhZ2UoKS5pbml0KHsgc3RvcmFnZXM6ICdjb29raWUnLCBuYW1lc3BhY2U6IG51bGwsIHJhdzogdHJ1ZSB9KTtcblx0QmFzaWwubG9jYWxTdG9yYWdlID0gbmV3IEJhc2lsLlN0b3JhZ2UoKS5pbml0KHsgc3RvcmFnZXM6ICdsb2NhbCcsIG5hbWVzcGFjZTogbnVsbCwgcmF3OiB0cnVlIH0pO1xuXHRCYXNpbC5zZXNzaW9uU3RvcmFnZSA9IG5ldyBCYXNpbC5TdG9yYWdlKCkuaW5pdCh7IHN0b3JhZ2VzOiAnc2Vzc2lvbicsIG5hbWVzcGFjZTogbnVsbCwgcmF3OiB0cnVlIH0pO1xuXG5cdC8vIGJyb3dzZXIgZXhwb3J0XG5cdHdpbmRvdy5CYXNpbCA9IEJhc2lsO1xuXG5cdC8vIEFNRCBleHBvcnRcblx0aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuXHRcdGRlZmluZShmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiBCYXNpbDtcblx0XHR9KTtcblx0Ly8gY29tbW9uanMgZXhwb3J0XG5cdH0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcblx0XHRtb2R1bGUuZXhwb3J0cyA9IEJhc2lsO1xuXHR9XG5cbn0pKCk7XG4iLCI7KGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG5cdGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xuXHRcdC8vIENvbW1vbkpTXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gZmFjdG9yeSgpO1xuXHR9XG5cdGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG5cdFx0Ly8gQU1EXG5cdFx0ZGVmaW5lKFtdLCBmYWN0b3J5KTtcblx0fVxuXHRlbHNlIHtcblx0XHQvLyBHbG9iYWwgKGJyb3dzZXIpXG5cdFx0cm9vdC5DcnlwdG9KUyA9IGZhY3RvcnkoKTtcblx0fVxufSh0aGlzLCBmdW5jdGlvbiAoKSB7XG5cblx0LyoqXG5cdCAqIENyeXB0b0pTIGNvcmUgY29tcG9uZW50cy5cblx0ICovXG5cdHZhciBDcnlwdG9KUyA9IENyeXB0b0pTIHx8IChmdW5jdGlvbiAoTWF0aCwgdW5kZWZpbmVkKSB7XG5cdCAgICAvKlxuXHQgICAgICogTG9jYWwgcG9seWZpbCBvZiBPYmplY3QuY3JlYXRlXG5cdCAgICAgKi9cblx0ICAgIHZhciBjcmVhdGUgPSBPYmplY3QuY3JlYXRlIHx8IChmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgZnVuY3Rpb24gRigpIHt9O1xuXG5cdCAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChvYmopIHtcblx0ICAgICAgICAgICAgdmFyIHN1YnR5cGU7XG5cblx0ICAgICAgICAgICAgRi5wcm90b3R5cGUgPSBvYmo7XG5cblx0ICAgICAgICAgICAgc3VidHlwZSA9IG5ldyBGKCk7XG5cblx0ICAgICAgICAgICAgRi5wcm90b3R5cGUgPSBudWxsO1xuXG5cdCAgICAgICAgICAgIHJldHVybiBzdWJ0eXBlO1xuXHQgICAgICAgIH07XG5cdCAgICB9KCkpXG5cblx0ICAgIC8qKlxuXHQgICAgICogQ3J5cHRvSlMgbmFtZXNwYWNlLlxuXHQgICAgICovXG5cdCAgICB2YXIgQyA9IHt9O1xuXG5cdCAgICAvKipcblx0ICAgICAqIExpYnJhcnkgbmFtZXNwYWNlLlxuXHQgICAgICovXG5cdCAgICB2YXIgQ19saWIgPSBDLmxpYiA9IHt9O1xuXG5cdCAgICAvKipcblx0ICAgICAqIEJhc2Ugb2JqZWN0IGZvciBwcm90b3R5cGFsIGluaGVyaXRhbmNlLlxuXHQgICAgICovXG5cdCAgICB2YXIgQmFzZSA9IENfbGliLkJhc2UgPSAoZnVuY3Rpb24gKCkge1xuXG5cblx0ICAgICAgICByZXR1cm4ge1xuXHQgICAgICAgICAgICAvKipcblx0ICAgICAgICAgICAgICogQ3JlYXRlcyBhIG5ldyBvYmplY3QgdGhhdCBpbmhlcml0cyBmcm9tIHRoaXMgb2JqZWN0LlxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gb3ZlcnJpZGVzIFByb3BlcnRpZXMgdG8gY29weSBpbnRvIHRoZSBuZXcgb2JqZWN0LlxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBuZXcgb2JqZWN0LlxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiBAc3RhdGljXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqICAgICB2YXIgTXlUeXBlID0gQ3J5cHRvSlMubGliLkJhc2UuZXh0ZW5kKHtcblx0ICAgICAgICAgICAgICogICAgICAgICBmaWVsZDogJ3ZhbHVlJyxcblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogICAgICAgICBtZXRob2Q6IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgICogICAgICAgICB9XG5cdCAgICAgICAgICAgICAqICAgICB9KTtcblx0ICAgICAgICAgICAgICovXG5cdCAgICAgICAgICAgIGV4dGVuZDogZnVuY3Rpb24gKG92ZXJyaWRlcykge1xuXHQgICAgICAgICAgICAgICAgLy8gU3Bhd25cblx0ICAgICAgICAgICAgICAgIHZhciBzdWJ0eXBlID0gY3JlYXRlKHRoaXMpO1xuXG5cdCAgICAgICAgICAgICAgICAvLyBBdWdtZW50XG5cdCAgICAgICAgICAgICAgICBpZiAob3ZlcnJpZGVzKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgc3VidHlwZS5taXhJbihvdmVycmlkZXMpO1xuXHQgICAgICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgICAgICAvLyBDcmVhdGUgZGVmYXVsdCBpbml0aWFsaXplclxuXHQgICAgICAgICAgICAgICAgaWYgKCFzdWJ0eXBlLmhhc093blByb3BlcnR5KCdpbml0JykgfHwgdGhpcy5pbml0ID09PSBzdWJ0eXBlLmluaXQpIHtcblx0ICAgICAgICAgICAgICAgICAgICBzdWJ0eXBlLmluaXQgPSBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIHN1YnR5cGUuJHN1cGVyLmluaXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0ICAgICAgICAgICAgICAgICAgICB9O1xuXHQgICAgICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgICAgICAvLyBJbml0aWFsaXplcidzIHByb3RvdHlwZSBpcyB0aGUgc3VidHlwZSBvYmplY3Rcblx0ICAgICAgICAgICAgICAgIHN1YnR5cGUuaW5pdC5wcm90b3R5cGUgPSBzdWJ0eXBlO1xuXG5cdCAgICAgICAgICAgICAgICAvLyBSZWZlcmVuY2Ugc3VwZXJ0eXBlXG5cdCAgICAgICAgICAgICAgICBzdWJ0eXBlLiRzdXBlciA9IHRoaXM7XG5cblx0ICAgICAgICAgICAgICAgIHJldHVybiBzdWJ0eXBlO1xuXHQgICAgICAgICAgICB9LFxuXG5cdCAgICAgICAgICAgIC8qKlxuXHQgICAgICAgICAgICAgKiBFeHRlbmRzIHRoaXMgb2JqZWN0IGFuZCBydW5zIHRoZSBpbml0IG1ldGhvZC5cblx0ICAgICAgICAgICAgICogQXJndW1lbnRzIHRvIGNyZWF0ZSgpIHdpbGwgYmUgcGFzc2VkIHRvIGluaXQoKS5cblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogQHJldHVybiB7T2JqZWN0fSBUaGUgbmV3IG9iamVjdC5cblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogQHN0YXRpY1xuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiAgICAgdmFyIGluc3RhbmNlID0gTXlUeXBlLmNyZWF0ZSgpO1xuXHQgICAgICAgICAgICAgKi9cblx0ICAgICAgICAgICAgY3JlYXRlOiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgICAgICB2YXIgaW5zdGFuY2UgPSB0aGlzLmV4dGVuZCgpO1xuXHQgICAgICAgICAgICAgICAgaW5zdGFuY2UuaW5pdC5hcHBseShpbnN0YW5jZSwgYXJndW1lbnRzKTtcblxuXHQgICAgICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlO1xuXHQgICAgICAgICAgICB9LFxuXG5cdCAgICAgICAgICAgIC8qKlxuXHQgICAgICAgICAgICAgKiBJbml0aWFsaXplcyBhIG5ld2x5IGNyZWF0ZWQgb2JqZWN0LlxuXHQgICAgICAgICAgICAgKiBPdmVycmlkZSB0aGlzIG1ldGhvZCB0byBhZGQgc29tZSBsb2dpYyB3aGVuIHlvdXIgb2JqZWN0cyBhcmUgY3JlYXRlZC5cblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogICAgIHZhciBNeVR5cGUgPSBDcnlwdG9KUy5saWIuQmFzZS5leHRlbmQoe1xuXHQgICAgICAgICAgICAgKiAgICAgICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgICogICAgICAgICAgICAgLy8gLi4uXG5cdCAgICAgICAgICAgICAqICAgICAgICAgfVxuXHQgICAgICAgICAgICAgKiAgICAgfSk7XG5cdCAgICAgICAgICAgICAqL1xuXHQgICAgICAgICAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgIH0sXG5cblx0ICAgICAgICAgICAgLyoqXG5cdCAgICAgICAgICAgICAqIENvcGllcyBwcm9wZXJ0aWVzIGludG8gdGhpcyBvYmplY3QuXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBwcm9wZXJ0aWVzIFRoZSBwcm9wZXJ0aWVzIHRvIG1peCBpbi5cblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogICAgIE15VHlwZS5taXhJbih7XG5cdCAgICAgICAgICAgICAqICAgICAgICAgZmllbGQ6ICd2YWx1ZSdcblx0ICAgICAgICAgICAgICogICAgIH0pO1xuXHQgICAgICAgICAgICAgKi9cblx0ICAgICAgICAgICAgbWl4SW46IGZ1bmN0aW9uIChwcm9wZXJ0aWVzKSB7XG5cdCAgICAgICAgICAgICAgICBmb3IgKHZhciBwcm9wZXJ0eU5hbWUgaW4gcHJvcGVydGllcykge1xuXHQgICAgICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0aWVzLmhhc093blByb3BlcnR5KHByb3BlcnR5TmFtZSkpIHtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgdGhpc1twcm9wZXJ0eU5hbWVdID0gcHJvcGVydGllc1twcm9wZXJ0eU5hbWVdO1xuXHQgICAgICAgICAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICAgICAgLy8gSUUgd29uJ3QgY29weSB0b1N0cmluZyB1c2luZyB0aGUgbG9vcCBhYm92ZVxuXHQgICAgICAgICAgICAgICAgaWYgKHByb3BlcnRpZXMuaGFzT3duUHJvcGVydHkoJ3RvU3RyaW5nJykpIHtcblx0ICAgICAgICAgICAgICAgICAgICB0aGlzLnRvU3RyaW5nID0gcHJvcGVydGllcy50b1N0cmluZztcblx0ICAgICAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgfSxcblxuXHQgICAgICAgICAgICAvKipcblx0ICAgICAgICAgICAgICogQ3JlYXRlcyBhIGNvcHkgb2YgdGhpcyBvYmplY3QuXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqIEByZXR1cm4ge09iamVjdH0gVGhlIGNsb25lLlxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiAgICAgdmFyIGNsb25lID0gaW5zdGFuY2UuY2xvbmUoKTtcblx0ICAgICAgICAgICAgICovXG5cdCAgICAgICAgICAgIGNsb25lOiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5pbml0LnByb3RvdHlwZS5leHRlbmQodGhpcyk7XG5cdCAgICAgICAgICAgIH1cblx0ICAgICAgICB9O1xuXHQgICAgfSgpKTtcblxuXHQgICAgLyoqXG5cdCAgICAgKiBBbiBhcnJheSBvZiAzMi1iaXQgd29yZHMuXG5cdCAgICAgKlxuXHQgICAgICogQHByb3BlcnR5IHtBcnJheX0gd29yZHMgVGhlIGFycmF5IG9mIDMyLWJpdCB3b3Jkcy5cblx0ICAgICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBzaWdCeXRlcyBUaGUgbnVtYmVyIG9mIHNpZ25pZmljYW50IGJ5dGVzIGluIHRoaXMgd29yZCBhcnJheS5cblx0ICAgICAqL1xuXHQgICAgdmFyIFdvcmRBcnJheSA9IENfbGliLldvcmRBcnJheSA9IEJhc2UuZXh0ZW5kKHtcblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBJbml0aWFsaXplcyBhIG5ld2x5IGNyZWF0ZWQgd29yZCBhcnJheS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7QXJyYXl9IHdvcmRzIChPcHRpb25hbCkgQW4gYXJyYXkgb2YgMzItYml0IHdvcmRzLlxuXHQgICAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzaWdCeXRlcyAoT3B0aW9uYWwpIFRoZSBudW1iZXIgb2Ygc2lnbmlmaWNhbnQgYnl0ZXMgaW4gdGhlIHdvcmRzLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgd29yZEFycmF5ID0gQ3J5cHRvSlMubGliLldvcmRBcnJheS5jcmVhdGUoKTtcblx0ICAgICAgICAgKiAgICAgdmFyIHdvcmRBcnJheSA9IENyeXB0b0pTLmxpYi5Xb3JkQXJyYXkuY3JlYXRlKFsweDAwMDEwMjAzLCAweDA0MDUwNjA3XSk7XG5cdCAgICAgICAgICogICAgIHZhciB3b3JkQXJyYXkgPSBDcnlwdG9KUy5saWIuV29yZEFycmF5LmNyZWF0ZShbMHgwMDAxMDIwMywgMHgwNDA1MDYwN10sIDYpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIGluaXQ6IGZ1bmN0aW9uICh3b3Jkcywgc2lnQnl0ZXMpIHtcblx0ICAgICAgICAgICAgd29yZHMgPSB0aGlzLndvcmRzID0gd29yZHMgfHwgW107XG5cblx0ICAgICAgICAgICAgaWYgKHNpZ0J5dGVzICE9IHVuZGVmaW5lZCkge1xuXHQgICAgICAgICAgICAgICAgdGhpcy5zaWdCeXRlcyA9IHNpZ0J5dGVzO1xuXHQgICAgICAgICAgICB9IGVsc2Uge1xuXHQgICAgICAgICAgICAgICAgdGhpcy5zaWdCeXRlcyA9IHdvcmRzLmxlbmd0aCAqIDQ7XG5cdCAgICAgICAgICAgIH1cblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogQ29udmVydHMgdGhpcyB3b3JkIGFycmF5IHRvIGEgc3RyaW5nLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtFbmNvZGVyfSBlbmNvZGVyIChPcHRpb25hbCkgVGhlIGVuY29kaW5nIHN0cmF0ZWd5IHRvIHVzZS4gRGVmYXVsdDogQ3J5cHRvSlMuZW5jLkhleFxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7c3RyaW5nfSBUaGUgc3RyaW5naWZpZWQgd29yZCBhcnJheS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIHN0cmluZyA9IHdvcmRBcnJheSArICcnO1xuXHQgICAgICAgICAqICAgICB2YXIgc3RyaW5nID0gd29yZEFycmF5LnRvU3RyaW5nKCk7XG5cdCAgICAgICAgICogICAgIHZhciBzdHJpbmcgPSB3b3JkQXJyYXkudG9TdHJpbmcoQ3J5cHRvSlMuZW5jLlV0ZjgpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIHRvU3RyaW5nOiBmdW5jdGlvbiAoZW5jb2Rlcikge1xuXHQgICAgICAgICAgICByZXR1cm4gKGVuY29kZXIgfHwgSGV4KS5zdHJpbmdpZnkodGhpcyk7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIENvbmNhdGVuYXRlcyBhIHdvcmQgYXJyYXkgdG8gdGhpcyB3b3JkIGFycmF5LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtXb3JkQXJyYXl9IHdvcmRBcnJheSBUaGUgd29yZCBhcnJheSB0byBhcHBlbmQuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtXb3JkQXJyYXl9IFRoaXMgd29yZCBhcnJheS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgd29yZEFycmF5MS5jb25jYXQod29yZEFycmF5Mik7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgY29uY2F0OiBmdW5jdGlvbiAod29yZEFycmF5KSB7XG5cdCAgICAgICAgICAgIC8vIFNob3J0Y3V0c1xuXHQgICAgICAgICAgICB2YXIgdGhpc1dvcmRzID0gdGhpcy53b3Jkcztcblx0ICAgICAgICAgICAgdmFyIHRoYXRXb3JkcyA9IHdvcmRBcnJheS53b3Jkcztcblx0ICAgICAgICAgICAgdmFyIHRoaXNTaWdCeXRlcyA9IHRoaXMuc2lnQnl0ZXM7XG5cdCAgICAgICAgICAgIHZhciB0aGF0U2lnQnl0ZXMgPSB3b3JkQXJyYXkuc2lnQnl0ZXM7XG5cblx0ICAgICAgICAgICAgLy8gQ2xhbXAgZXhjZXNzIGJpdHNcblx0ICAgICAgICAgICAgdGhpcy5jbGFtcCgpO1xuXG5cdCAgICAgICAgICAgIC8vIENvbmNhdFxuXHQgICAgICAgICAgICBpZiAodGhpc1NpZ0J5dGVzICUgNCkge1xuXHQgICAgICAgICAgICAgICAgLy8gQ29weSBvbmUgYnl0ZSBhdCBhIHRpbWVcblx0ICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhhdFNpZ0J5dGVzOyBpKyspIHtcblx0ICAgICAgICAgICAgICAgICAgICB2YXIgdGhhdEJ5dGUgPSAodGhhdFdvcmRzW2kgPj4+IDJdID4+PiAoMjQgLSAoaSAlIDQpICogOCkpICYgMHhmZjtcblx0ICAgICAgICAgICAgICAgICAgICB0aGlzV29yZHNbKHRoaXNTaWdCeXRlcyArIGkpID4+PiAyXSB8PSB0aGF0Qnl0ZSA8PCAoMjQgLSAoKHRoaXNTaWdCeXRlcyArIGkpICUgNCkgKiA4KTtcblx0ICAgICAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgfSBlbHNlIHtcblx0ICAgICAgICAgICAgICAgIC8vIENvcHkgb25lIHdvcmQgYXQgYSB0aW1lXG5cdCAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoYXRTaWdCeXRlczsgaSArPSA0KSB7XG5cdCAgICAgICAgICAgICAgICAgICAgdGhpc1dvcmRzWyh0aGlzU2lnQnl0ZXMgKyBpKSA+Pj4gMl0gPSB0aGF0V29yZHNbaSA+Pj4gMl07XG5cdCAgICAgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgdGhpcy5zaWdCeXRlcyArPSB0aGF0U2lnQnl0ZXM7XG5cblx0ICAgICAgICAgICAgLy8gQ2hhaW5hYmxlXG5cdCAgICAgICAgICAgIHJldHVybiB0aGlzO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBSZW1vdmVzIGluc2lnbmlmaWNhbnQgYml0cy5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgd29yZEFycmF5LmNsYW1wKCk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgY2xhbXA6IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgLy8gU2hvcnRjdXRzXG5cdCAgICAgICAgICAgIHZhciB3b3JkcyA9IHRoaXMud29yZHM7XG5cdCAgICAgICAgICAgIHZhciBzaWdCeXRlcyA9IHRoaXMuc2lnQnl0ZXM7XG5cblx0ICAgICAgICAgICAgLy8gQ2xhbXBcblx0ICAgICAgICAgICAgd29yZHNbc2lnQnl0ZXMgPj4+IDJdICY9IDB4ZmZmZmZmZmYgPDwgKDMyIC0gKHNpZ0J5dGVzICUgNCkgKiA4KTtcblx0ICAgICAgICAgICAgd29yZHMubGVuZ3RoID0gTWF0aC5jZWlsKHNpZ0J5dGVzIC8gNCk7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIENyZWF0ZXMgYSBjb3B5IG9mIHRoaXMgd29yZCBhcnJheS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge1dvcmRBcnJheX0gVGhlIGNsb25lLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgY2xvbmUgPSB3b3JkQXJyYXkuY2xvbmUoKTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBjbG9uZTogZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICB2YXIgY2xvbmUgPSBCYXNlLmNsb25lLmNhbGwodGhpcyk7XG5cdCAgICAgICAgICAgIGNsb25lLndvcmRzID0gdGhpcy53b3Jkcy5zbGljZSgwKTtcblxuXHQgICAgICAgICAgICByZXR1cm4gY2xvbmU7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIENyZWF0ZXMgYSB3b3JkIGFycmF5IGZpbGxlZCB3aXRoIHJhbmRvbSBieXRlcy5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSBuQnl0ZXMgVGhlIG51bWJlciBvZiByYW5kb20gYnl0ZXMgdG8gZ2VuZXJhdGUuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtXb3JkQXJyYXl9IFRoZSByYW5kb20gd29yZCBhcnJheS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBzdGF0aWNcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIHdvcmRBcnJheSA9IENyeXB0b0pTLmxpYi5Xb3JkQXJyYXkucmFuZG9tKDE2KTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICByYW5kb206IGZ1bmN0aW9uIChuQnl0ZXMpIHtcblx0ICAgICAgICAgICAgdmFyIHdvcmRzID0gW107XG5cblx0ICAgICAgICAgICAgdmFyIHIgPSAoZnVuY3Rpb24gKG1fdykge1xuXHQgICAgICAgICAgICAgICAgdmFyIG1fdyA9IG1fdztcblx0ICAgICAgICAgICAgICAgIHZhciBtX3ogPSAweDNhZGU2OGIxO1xuXHQgICAgICAgICAgICAgICAgdmFyIG1hc2sgPSAweGZmZmZmZmZmO1xuXG5cdCAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICAgICAgICAgIG1feiA9ICgweDkwNjkgKiAobV96ICYgMHhGRkZGKSArIChtX3ogPj4gMHgxMCkpICYgbWFzaztcblx0ICAgICAgICAgICAgICAgICAgICBtX3cgPSAoMHg0NjUwICogKG1fdyAmIDB4RkZGRikgKyAobV93ID4+IDB4MTApKSAmIG1hc2s7XG5cdCAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9ICgobV96IDw8IDB4MTApICsgbV93KSAmIG1hc2s7XG5cdCAgICAgICAgICAgICAgICAgICAgcmVzdWx0IC89IDB4MTAwMDAwMDAwO1xuXHQgICAgICAgICAgICAgICAgICAgIHJlc3VsdCArPSAwLjU7XG5cdCAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdCAqIChNYXRoLnJhbmRvbSgpID4gLjUgPyAxIDogLTEpO1xuXHQgICAgICAgICAgICAgICAgfVxuXHQgICAgICAgICAgICB9KTtcblxuXHQgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgcmNhY2hlOyBpIDwgbkJ5dGVzOyBpICs9IDQpIHtcblx0ICAgICAgICAgICAgICAgIHZhciBfciA9IHIoKHJjYWNoZSB8fCBNYXRoLnJhbmRvbSgpKSAqIDB4MTAwMDAwMDAwKTtcblxuXHQgICAgICAgICAgICAgICAgcmNhY2hlID0gX3IoKSAqIDB4M2FkZTY3Yjc7XG5cdCAgICAgICAgICAgICAgICB3b3Jkcy5wdXNoKChfcigpICogMHgxMDAwMDAwMDApIHwgMCk7XG5cdCAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICByZXR1cm4gbmV3IFdvcmRBcnJheS5pbml0KHdvcmRzLCBuQnl0ZXMpO1xuXHQgICAgICAgIH1cblx0ICAgIH0pO1xuXG5cdCAgICAvKipcblx0ICAgICAqIEVuY29kZXIgbmFtZXNwYWNlLlxuXHQgICAgICovXG5cdCAgICB2YXIgQ19lbmMgPSBDLmVuYyA9IHt9O1xuXG5cdCAgICAvKipcblx0ICAgICAqIEhleCBlbmNvZGluZyBzdHJhdGVneS5cblx0ICAgICAqL1xuXHQgICAgdmFyIEhleCA9IENfZW5jLkhleCA9IHtcblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBDb252ZXJ0cyBhIHdvcmQgYXJyYXkgdG8gYSBoZXggc3RyaW5nLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtXb3JkQXJyYXl9IHdvcmRBcnJheSBUaGUgd29yZCBhcnJheS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge3N0cmluZ30gVGhlIGhleCBzdHJpbmcuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAc3RhdGljXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciBoZXhTdHJpbmcgPSBDcnlwdG9KUy5lbmMuSGV4LnN0cmluZ2lmeSh3b3JkQXJyYXkpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIHN0cmluZ2lmeTogZnVuY3Rpb24gKHdvcmRBcnJheSkge1xuXHQgICAgICAgICAgICAvLyBTaG9ydGN1dHNcblx0ICAgICAgICAgICAgdmFyIHdvcmRzID0gd29yZEFycmF5LndvcmRzO1xuXHQgICAgICAgICAgICB2YXIgc2lnQnl0ZXMgPSB3b3JkQXJyYXkuc2lnQnl0ZXM7XG5cblx0ICAgICAgICAgICAgLy8gQ29udmVydFxuXHQgICAgICAgICAgICB2YXIgaGV4Q2hhcnMgPSBbXTtcblx0ICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzaWdCeXRlczsgaSsrKSB7XG5cdCAgICAgICAgICAgICAgICB2YXIgYml0ZSA9ICh3b3Jkc1tpID4+PiAyXSA+Pj4gKDI0IC0gKGkgJSA0KSAqIDgpKSAmIDB4ZmY7XG5cdCAgICAgICAgICAgICAgICBoZXhDaGFycy5wdXNoKChiaXRlID4+PiA0KS50b1N0cmluZygxNikpO1xuXHQgICAgICAgICAgICAgICAgaGV4Q2hhcnMucHVzaCgoYml0ZSAmIDB4MGYpLnRvU3RyaW5nKDE2KSk7XG5cdCAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICByZXR1cm4gaGV4Q2hhcnMuam9pbignJyk7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIENvbnZlcnRzIGEgaGV4IHN0cmluZyB0byBhIHdvcmQgYXJyYXkuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gaGV4U3RyIFRoZSBoZXggc3RyaW5nLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7V29yZEFycmF5fSBUaGUgd29yZCBhcnJheS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBzdGF0aWNcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIHdvcmRBcnJheSA9IENyeXB0b0pTLmVuYy5IZXgucGFyc2UoaGV4U3RyaW5nKTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBwYXJzZTogZnVuY3Rpb24gKGhleFN0cikge1xuXHQgICAgICAgICAgICAvLyBTaG9ydGN1dFxuXHQgICAgICAgICAgICB2YXIgaGV4U3RyTGVuZ3RoID0gaGV4U3RyLmxlbmd0aDtcblxuXHQgICAgICAgICAgICAvLyBDb252ZXJ0XG5cdCAgICAgICAgICAgIHZhciB3b3JkcyA9IFtdO1xuXHQgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhleFN0ckxlbmd0aDsgaSArPSAyKSB7XG5cdCAgICAgICAgICAgICAgICB3b3Jkc1tpID4+PiAzXSB8PSBwYXJzZUludChoZXhTdHIuc3Vic3RyKGksIDIpLCAxNikgPDwgKDI0IC0gKGkgJSA4KSAqIDQpO1xuXHQgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgcmV0dXJuIG5ldyBXb3JkQXJyYXkuaW5pdCh3b3JkcywgaGV4U3RyTGVuZ3RoIC8gMik7XG5cdCAgICAgICAgfVxuXHQgICAgfTtcblxuXHQgICAgLyoqXG5cdCAgICAgKiBMYXRpbjEgZW5jb2Rpbmcgc3RyYXRlZ3kuXG5cdCAgICAgKi9cblx0ICAgIHZhciBMYXRpbjEgPSBDX2VuYy5MYXRpbjEgPSB7XG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogQ29udmVydHMgYSB3b3JkIGFycmF5IHRvIGEgTGF0aW4xIHN0cmluZy5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7V29yZEFycmF5fSB3b3JkQXJyYXkgVGhlIHdvcmQgYXJyYXkuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBMYXRpbjEgc3RyaW5nLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHN0YXRpY1xuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgbGF0aW4xU3RyaW5nID0gQ3J5cHRvSlMuZW5jLkxhdGluMS5zdHJpbmdpZnkod29yZEFycmF5KTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBzdHJpbmdpZnk6IGZ1bmN0aW9uICh3b3JkQXJyYXkpIHtcblx0ICAgICAgICAgICAgLy8gU2hvcnRjdXRzXG5cdCAgICAgICAgICAgIHZhciB3b3JkcyA9IHdvcmRBcnJheS53b3Jkcztcblx0ICAgICAgICAgICAgdmFyIHNpZ0J5dGVzID0gd29yZEFycmF5LnNpZ0J5dGVzO1xuXG5cdCAgICAgICAgICAgIC8vIENvbnZlcnRcblx0ICAgICAgICAgICAgdmFyIGxhdGluMUNoYXJzID0gW107XG5cdCAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2lnQnl0ZXM7IGkrKykge1xuXHQgICAgICAgICAgICAgICAgdmFyIGJpdGUgPSAod29yZHNbaSA+Pj4gMl0gPj4+ICgyNCAtIChpICUgNCkgKiA4KSkgJiAweGZmO1xuXHQgICAgICAgICAgICAgICAgbGF0aW4xQ2hhcnMucHVzaChTdHJpbmcuZnJvbUNoYXJDb2RlKGJpdGUpKTtcblx0ICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgIHJldHVybiBsYXRpbjFDaGFycy5qb2luKCcnKTtcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogQ29udmVydHMgYSBMYXRpbjEgc3RyaW5nIHRvIGEgd29yZCBhcnJheS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBsYXRpbjFTdHIgVGhlIExhdGluMSBzdHJpbmcuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtXb3JkQXJyYXl9IFRoZSB3b3JkIGFycmF5LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHN0YXRpY1xuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgd29yZEFycmF5ID0gQ3J5cHRvSlMuZW5jLkxhdGluMS5wYXJzZShsYXRpbjFTdHJpbmcpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIHBhcnNlOiBmdW5jdGlvbiAobGF0aW4xU3RyKSB7XG5cdCAgICAgICAgICAgIC8vIFNob3J0Y3V0XG5cdCAgICAgICAgICAgIHZhciBsYXRpbjFTdHJMZW5ndGggPSBsYXRpbjFTdHIubGVuZ3RoO1xuXG5cdCAgICAgICAgICAgIC8vIENvbnZlcnRcblx0ICAgICAgICAgICAgdmFyIHdvcmRzID0gW107XG5cdCAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGF0aW4xU3RyTGVuZ3RoOyBpKyspIHtcblx0ICAgICAgICAgICAgICAgIHdvcmRzW2kgPj4+IDJdIHw9IChsYXRpbjFTdHIuY2hhckNvZGVBdChpKSAmIDB4ZmYpIDw8ICgyNCAtIChpICUgNCkgKiA4KTtcblx0ICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgIHJldHVybiBuZXcgV29yZEFycmF5LmluaXQod29yZHMsIGxhdGluMVN0ckxlbmd0aCk7XG5cdCAgICAgICAgfVxuXHQgICAgfTtcblxuXHQgICAgLyoqXG5cdCAgICAgKiBVVEYtOCBlbmNvZGluZyBzdHJhdGVneS5cblx0ICAgICAqL1xuXHQgICAgdmFyIFV0ZjggPSBDX2VuYy5VdGY4ID0ge1xuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIENvbnZlcnRzIGEgd29yZCBhcnJheSB0byBhIFVURi04IHN0cmluZy5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7V29yZEFycmF5fSB3b3JkQXJyYXkgVGhlIHdvcmQgYXJyYXkuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBVVEYtOCBzdHJpbmcuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAc3RhdGljXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciB1dGY4U3RyaW5nID0gQ3J5cHRvSlMuZW5jLlV0Zjguc3RyaW5naWZ5KHdvcmRBcnJheSk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgc3RyaW5naWZ5OiBmdW5jdGlvbiAod29yZEFycmF5KSB7XG5cdCAgICAgICAgICAgIHRyeSB7XG5cdCAgICAgICAgICAgICAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KGVzY2FwZShMYXRpbjEuc3RyaW5naWZ5KHdvcmRBcnJheSkpKTtcblx0ICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuXHQgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNYWxmb3JtZWQgVVRGLTggZGF0YScpO1xuXHQgICAgICAgICAgICB9XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIENvbnZlcnRzIGEgVVRGLTggc3RyaW5nIHRvIGEgd29yZCBhcnJheS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB1dGY4U3RyIFRoZSBVVEYtOCBzdHJpbmcuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtXb3JkQXJyYXl9IFRoZSB3b3JkIGFycmF5LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHN0YXRpY1xuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgd29yZEFycmF5ID0gQ3J5cHRvSlMuZW5jLlV0ZjgucGFyc2UodXRmOFN0cmluZyk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgcGFyc2U6IGZ1bmN0aW9uICh1dGY4U3RyKSB7XG5cdCAgICAgICAgICAgIHJldHVybiBMYXRpbjEucGFyc2UodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KHV0ZjhTdHIpKSk7XG5cdCAgICAgICAgfVxuXHQgICAgfTtcblxuXHQgICAgLyoqXG5cdCAgICAgKiBBYnN0cmFjdCBidWZmZXJlZCBibG9jayBhbGdvcml0aG0gdGVtcGxhdGUuXG5cdCAgICAgKlxuXHQgICAgICogVGhlIHByb3BlcnR5IGJsb2NrU2l6ZSBtdXN0IGJlIGltcGxlbWVudGVkIGluIGEgY29uY3JldGUgc3VidHlwZS5cblx0ICAgICAqXG5cdCAgICAgKiBAcHJvcGVydHkge251bWJlcn0gX21pbkJ1ZmZlclNpemUgVGhlIG51bWJlciBvZiBibG9ja3MgdGhhdCBzaG91bGQgYmUga2VwdCB1bnByb2Nlc3NlZCBpbiB0aGUgYnVmZmVyLiBEZWZhdWx0OiAwXG5cdCAgICAgKi9cblx0ICAgIHZhciBCdWZmZXJlZEJsb2NrQWxnb3JpdGhtID0gQ19saWIuQnVmZmVyZWRCbG9ja0FsZ29yaXRobSA9IEJhc2UuZXh0ZW5kKHtcblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBSZXNldHMgdGhpcyBibG9jayBhbGdvcml0aG0ncyBkYXRhIGJ1ZmZlciB0byBpdHMgaW5pdGlhbCBzdGF0ZS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgYnVmZmVyZWRCbG9ja0FsZ29yaXRobS5yZXNldCgpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIHJlc2V0OiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgIC8vIEluaXRpYWwgdmFsdWVzXG5cdCAgICAgICAgICAgIHRoaXMuX2RhdGEgPSBuZXcgV29yZEFycmF5LmluaXQoKTtcblx0ICAgICAgICAgICAgdGhpcy5fbkRhdGFCeXRlcyA9IDA7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIEFkZHMgbmV3IGRhdGEgdG8gdGhpcyBibG9jayBhbGdvcml0aG0ncyBidWZmZXIuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge1dvcmRBcnJheXxzdHJpbmd9IGRhdGEgVGhlIGRhdGEgdG8gYXBwZW5kLiBTdHJpbmdzIGFyZSBjb252ZXJ0ZWQgdG8gYSBXb3JkQXJyYXkgdXNpbmcgVVRGLTguXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIGJ1ZmZlcmVkQmxvY2tBbGdvcml0aG0uX2FwcGVuZCgnZGF0YScpO1xuXHQgICAgICAgICAqICAgICBidWZmZXJlZEJsb2NrQWxnb3JpdGhtLl9hcHBlbmQod29yZEFycmF5KTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBfYXBwZW5kOiBmdW5jdGlvbiAoZGF0YSkge1xuXHQgICAgICAgICAgICAvLyBDb252ZXJ0IHN0cmluZyB0byBXb3JkQXJyYXksIGVsc2UgYXNzdW1lIFdvcmRBcnJheSBhbHJlYWR5XG5cdCAgICAgICAgICAgIGlmICh0eXBlb2YgZGF0YSA9PSAnc3RyaW5nJykge1xuXHQgICAgICAgICAgICAgICAgZGF0YSA9IFV0ZjgucGFyc2UoZGF0YSk7XG5cdCAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICAvLyBBcHBlbmRcblx0ICAgICAgICAgICAgdGhpcy5fZGF0YS5jb25jYXQoZGF0YSk7XG5cdCAgICAgICAgICAgIHRoaXMuX25EYXRhQnl0ZXMgKz0gZGF0YS5zaWdCeXRlcztcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogUHJvY2Vzc2VzIGF2YWlsYWJsZSBkYXRhIGJsb2Nrcy5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIFRoaXMgbWV0aG9kIGludm9rZXMgX2RvUHJvY2Vzc0Jsb2NrKG9mZnNldCksIHdoaWNoIG11c3QgYmUgaW1wbGVtZW50ZWQgYnkgYSBjb25jcmV0ZSBzdWJ0eXBlLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtib29sZWFufSBkb0ZsdXNoIFdoZXRoZXIgYWxsIGJsb2NrcyBhbmQgcGFydGlhbCBibG9ja3Mgc2hvdWxkIGJlIHByb2Nlc3NlZC5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge1dvcmRBcnJheX0gVGhlIHByb2Nlc3NlZCBkYXRhLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgcHJvY2Vzc2VkRGF0YSA9IGJ1ZmZlcmVkQmxvY2tBbGdvcml0aG0uX3Byb2Nlc3MoKTtcblx0ICAgICAgICAgKiAgICAgdmFyIHByb2Nlc3NlZERhdGEgPSBidWZmZXJlZEJsb2NrQWxnb3JpdGhtLl9wcm9jZXNzKCEhJ2ZsdXNoJyk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgX3Byb2Nlc3M6IGZ1bmN0aW9uIChkb0ZsdXNoKSB7XG5cdCAgICAgICAgICAgIC8vIFNob3J0Y3V0c1xuXHQgICAgICAgICAgICB2YXIgZGF0YSA9IHRoaXMuX2RhdGE7XG5cdCAgICAgICAgICAgIHZhciBkYXRhV29yZHMgPSBkYXRhLndvcmRzO1xuXHQgICAgICAgICAgICB2YXIgZGF0YVNpZ0J5dGVzID0gZGF0YS5zaWdCeXRlcztcblx0ICAgICAgICAgICAgdmFyIGJsb2NrU2l6ZSA9IHRoaXMuYmxvY2tTaXplO1xuXHQgICAgICAgICAgICB2YXIgYmxvY2tTaXplQnl0ZXMgPSBibG9ja1NpemUgKiA0O1xuXG5cdCAgICAgICAgICAgIC8vIENvdW50IGJsb2NrcyByZWFkeVxuXHQgICAgICAgICAgICB2YXIgbkJsb2Nrc1JlYWR5ID0gZGF0YVNpZ0J5dGVzIC8gYmxvY2tTaXplQnl0ZXM7XG5cdCAgICAgICAgICAgIGlmIChkb0ZsdXNoKSB7XG5cdCAgICAgICAgICAgICAgICAvLyBSb3VuZCB1cCB0byBpbmNsdWRlIHBhcnRpYWwgYmxvY2tzXG5cdCAgICAgICAgICAgICAgICBuQmxvY2tzUmVhZHkgPSBNYXRoLmNlaWwobkJsb2Nrc1JlYWR5KTtcblx0ICAgICAgICAgICAgfSBlbHNlIHtcblx0ICAgICAgICAgICAgICAgIC8vIFJvdW5kIGRvd24gdG8gaW5jbHVkZSBvbmx5IGZ1bGwgYmxvY2tzLFxuXHQgICAgICAgICAgICAgICAgLy8gbGVzcyB0aGUgbnVtYmVyIG9mIGJsb2NrcyB0aGF0IG11c3QgcmVtYWluIGluIHRoZSBidWZmZXJcblx0ICAgICAgICAgICAgICAgIG5CbG9ja3NSZWFkeSA9IE1hdGgubWF4KChuQmxvY2tzUmVhZHkgfCAwKSAtIHRoaXMuX21pbkJ1ZmZlclNpemUsIDApO1xuXHQgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgLy8gQ291bnQgd29yZHMgcmVhZHlcblx0ICAgICAgICAgICAgdmFyIG5Xb3Jkc1JlYWR5ID0gbkJsb2Nrc1JlYWR5ICogYmxvY2tTaXplO1xuXG5cdCAgICAgICAgICAgIC8vIENvdW50IGJ5dGVzIHJlYWR5XG5cdCAgICAgICAgICAgIHZhciBuQnl0ZXNSZWFkeSA9IE1hdGgubWluKG5Xb3Jkc1JlYWR5ICogNCwgZGF0YVNpZ0J5dGVzKTtcblxuXHQgICAgICAgICAgICAvLyBQcm9jZXNzIGJsb2Nrc1xuXHQgICAgICAgICAgICBpZiAobldvcmRzUmVhZHkpIHtcblx0ICAgICAgICAgICAgICAgIGZvciAodmFyIG9mZnNldCA9IDA7IG9mZnNldCA8IG5Xb3Jkc1JlYWR5OyBvZmZzZXQgKz0gYmxvY2tTaXplKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgLy8gUGVyZm9ybSBjb25jcmV0ZS1hbGdvcml0aG0gbG9naWNcblx0ICAgICAgICAgICAgICAgICAgICB0aGlzLl9kb1Byb2Nlc3NCbG9jayhkYXRhV29yZHMsIG9mZnNldCk7XG5cdCAgICAgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgICAgIC8vIFJlbW92ZSBwcm9jZXNzZWQgd29yZHNcblx0ICAgICAgICAgICAgICAgIHZhciBwcm9jZXNzZWRXb3JkcyA9IGRhdGFXb3Jkcy5zcGxpY2UoMCwgbldvcmRzUmVhZHkpO1xuXHQgICAgICAgICAgICAgICAgZGF0YS5zaWdCeXRlcyAtPSBuQnl0ZXNSZWFkeTtcblx0ICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgIC8vIFJldHVybiBwcm9jZXNzZWQgd29yZHNcblx0ICAgICAgICAgICAgcmV0dXJuIG5ldyBXb3JkQXJyYXkuaW5pdChwcm9jZXNzZWRXb3JkcywgbkJ5dGVzUmVhZHkpO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBDcmVhdGVzIGEgY29weSBvZiB0aGlzIG9iamVjdC5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge09iamVjdH0gVGhlIGNsb25lLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgY2xvbmUgPSBidWZmZXJlZEJsb2NrQWxnb3JpdGhtLmNsb25lKCk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgY2xvbmU6IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgdmFyIGNsb25lID0gQmFzZS5jbG9uZS5jYWxsKHRoaXMpO1xuXHQgICAgICAgICAgICBjbG9uZS5fZGF0YSA9IHRoaXMuX2RhdGEuY2xvbmUoKTtcblxuXHQgICAgICAgICAgICByZXR1cm4gY2xvbmU7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIF9taW5CdWZmZXJTaXplOiAwXG5cdCAgICB9KTtcblxuXHQgICAgLyoqXG5cdCAgICAgKiBBYnN0cmFjdCBoYXNoZXIgdGVtcGxhdGUuXG5cdCAgICAgKlxuXHQgICAgICogQHByb3BlcnR5IHtudW1iZXJ9IGJsb2NrU2l6ZSBUaGUgbnVtYmVyIG9mIDMyLWJpdCB3b3JkcyB0aGlzIGhhc2hlciBvcGVyYXRlcyBvbi4gRGVmYXVsdDogMTYgKDUxMiBiaXRzKVxuXHQgICAgICovXG5cdCAgICB2YXIgSGFzaGVyID0gQ19saWIuSGFzaGVyID0gQnVmZmVyZWRCbG9ja0FsZ29yaXRobS5leHRlbmQoe1xuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIENvbmZpZ3VyYXRpb24gb3B0aW9ucy5cblx0ICAgICAgICAgKi9cblx0ICAgICAgICBjZmc6IEJhc2UuZXh0ZW5kKCksXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBJbml0aWFsaXplcyBhIG5ld2x5IGNyZWF0ZWQgaGFzaGVyLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGNmZyAoT3B0aW9uYWwpIFRoZSBjb25maWd1cmF0aW9uIG9wdGlvbnMgdG8gdXNlIGZvciB0aGlzIGhhc2ggY29tcHV0YXRpb24uXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciBoYXNoZXIgPSBDcnlwdG9KUy5hbGdvLlNIQTI1Ni5jcmVhdGUoKTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBpbml0OiBmdW5jdGlvbiAoY2ZnKSB7XG5cdCAgICAgICAgICAgIC8vIEFwcGx5IGNvbmZpZyBkZWZhdWx0c1xuXHQgICAgICAgICAgICB0aGlzLmNmZyA9IHRoaXMuY2ZnLmV4dGVuZChjZmcpO1xuXG5cdCAgICAgICAgICAgIC8vIFNldCBpbml0aWFsIHZhbHVlc1xuXHQgICAgICAgICAgICB0aGlzLnJlc2V0KCk7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIFJlc2V0cyB0aGlzIGhhc2hlciB0byBpdHMgaW5pdGlhbCBzdGF0ZS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgaGFzaGVyLnJlc2V0KCk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgcmVzZXQ6IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgLy8gUmVzZXQgZGF0YSBidWZmZXJcblx0ICAgICAgICAgICAgQnVmZmVyZWRCbG9ja0FsZ29yaXRobS5yZXNldC5jYWxsKHRoaXMpO1xuXG5cdCAgICAgICAgICAgIC8vIFBlcmZvcm0gY29uY3JldGUtaGFzaGVyIGxvZ2ljXG5cdCAgICAgICAgICAgIHRoaXMuX2RvUmVzZXQoKTtcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogVXBkYXRlcyB0aGlzIGhhc2hlciB3aXRoIGEgbWVzc2FnZS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7V29yZEFycmF5fHN0cmluZ30gbWVzc2FnZVVwZGF0ZSBUaGUgbWVzc2FnZSB0byBhcHBlbmQuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtIYXNoZXJ9IFRoaXMgaGFzaGVyLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICBoYXNoZXIudXBkYXRlKCdtZXNzYWdlJyk7XG5cdCAgICAgICAgICogICAgIGhhc2hlci51cGRhdGUod29yZEFycmF5KTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uIChtZXNzYWdlVXBkYXRlKSB7XG5cdCAgICAgICAgICAgIC8vIEFwcGVuZFxuXHQgICAgICAgICAgICB0aGlzLl9hcHBlbmQobWVzc2FnZVVwZGF0ZSk7XG5cblx0ICAgICAgICAgICAgLy8gVXBkYXRlIHRoZSBoYXNoXG5cdCAgICAgICAgICAgIHRoaXMuX3Byb2Nlc3MoKTtcblxuXHQgICAgICAgICAgICAvLyBDaGFpbmFibGVcblx0ICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIEZpbmFsaXplcyB0aGUgaGFzaCBjb21wdXRhdGlvbi5cblx0ICAgICAgICAgKiBOb3RlIHRoYXQgdGhlIGZpbmFsaXplIG9wZXJhdGlvbiBpcyBlZmZlY3RpdmVseSBhIGRlc3RydWN0aXZlLCByZWFkLW9uY2Ugb3BlcmF0aW9uLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtXb3JkQXJyYXl8c3RyaW5nfSBtZXNzYWdlVXBkYXRlIChPcHRpb25hbCkgQSBmaW5hbCBtZXNzYWdlIHVwZGF0ZS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge1dvcmRBcnJheX0gVGhlIGhhc2guXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciBoYXNoID0gaGFzaGVyLmZpbmFsaXplKCk7XG5cdCAgICAgICAgICogICAgIHZhciBoYXNoID0gaGFzaGVyLmZpbmFsaXplKCdtZXNzYWdlJyk7XG5cdCAgICAgICAgICogICAgIHZhciBoYXNoID0gaGFzaGVyLmZpbmFsaXplKHdvcmRBcnJheSk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgZmluYWxpemU6IGZ1bmN0aW9uIChtZXNzYWdlVXBkYXRlKSB7XG5cdCAgICAgICAgICAgIC8vIEZpbmFsIG1lc3NhZ2UgdXBkYXRlXG5cdCAgICAgICAgICAgIGlmIChtZXNzYWdlVXBkYXRlKSB7XG5cdCAgICAgICAgICAgICAgICB0aGlzLl9hcHBlbmQobWVzc2FnZVVwZGF0ZSk7XG5cdCAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICAvLyBQZXJmb3JtIGNvbmNyZXRlLWhhc2hlciBsb2dpY1xuXHQgICAgICAgICAgICB2YXIgaGFzaCA9IHRoaXMuX2RvRmluYWxpemUoKTtcblxuXHQgICAgICAgICAgICByZXR1cm4gaGFzaDtcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgYmxvY2tTaXplOiA1MTIvMzIsXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBDcmVhdGVzIGEgc2hvcnRjdXQgZnVuY3Rpb24gdG8gYSBoYXNoZXIncyBvYmplY3QgaW50ZXJmYWNlLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtIYXNoZXJ9IGhhc2hlciBUaGUgaGFzaGVyIHRvIGNyZWF0ZSBhIGhlbHBlciBmb3IuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtGdW5jdGlvbn0gVGhlIHNob3J0Y3V0IGZ1bmN0aW9uLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHN0YXRpY1xuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgU0hBMjU2ID0gQ3J5cHRvSlMubGliLkhhc2hlci5fY3JlYXRlSGVscGVyKENyeXB0b0pTLmFsZ28uU0hBMjU2KTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBfY3JlYXRlSGVscGVyOiBmdW5jdGlvbiAoaGFzaGVyKSB7XG5cdCAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAobWVzc2FnZSwgY2ZnKSB7XG5cdCAgICAgICAgICAgICAgICByZXR1cm4gbmV3IGhhc2hlci5pbml0KGNmZykuZmluYWxpemUobWVzc2FnZSk7XG5cdCAgICAgICAgICAgIH07XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIENyZWF0ZXMgYSBzaG9ydGN1dCBmdW5jdGlvbiB0byB0aGUgSE1BQydzIG9iamVjdCBpbnRlcmZhY2UuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge0hhc2hlcn0gaGFzaGVyIFRoZSBoYXNoZXIgdG8gdXNlIGluIHRoaXMgSE1BQyBoZWxwZXIuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtGdW5jdGlvbn0gVGhlIHNob3J0Y3V0IGZ1bmN0aW9uLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHN0YXRpY1xuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgSG1hY1NIQTI1NiA9IENyeXB0b0pTLmxpYi5IYXNoZXIuX2NyZWF0ZUhtYWNIZWxwZXIoQ3J5cHRvSlMuYWxnby5TSEEyNTYpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIF9jcmVhdGVIbWFjSGVscGVyOiBmdW5jdGlvbiAoaGFzaGVyKSB7XG5cdCAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAobWVzc2FnZSwga2V5KSB7XG5cdCAgICAgICAgICAgICAgICByZXR1cm4gbmV3IENfYWxnby5ITUFDLmluaXQoaGFzaGVyLCBrZXkpLmZpbmFsaXplKG1lc3NhZ2UpO1xuXHQgICAgICAgICAgICB9O1xuXHQgICAgICAgIH1cblx0ICAgIH0pO1xuXG5cdCAgICAvKipcblx0ICAgICAqIEFsZ29yaXRobSBuYW1lc3BhY2UuXG5cdCAgICAgKi9cblx0ICAgIHZhciBDX2FsZ28gPSBDLmFsZ28gPSB7fTtcblxuXHQgICAgcmV0dXJuIEM7XG5cdH0oTWF0aCkpO1xuXG5cblx0cmV0dXJuIENyeXB0b0pTO1xuXG59KSk7IiwiOyhmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuXHRpZiAodHlwZW9mIGV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcblx0XHQvLyBDb21tb25KU1xuXHRcdG1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IGZhY3RvcnkocmVxdWlyZShcIi4vY29yZVwiKSk7XG5cdH1cblx0ZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcblx0XHQvLyBBTURcblx0XHRkZWZpbmUoW1wiLi9jb3JlXCJdLCBmYWN0b3J5KTtcblx0fVxuXHRlbHNlIHtcblx0XHQvLyBHbG9iYWwgKGJyb3dzZXIpXG5cdFx0ZmFjdG9yeShyb290LkNyeXB0b0pTKTtcblx0fVxufSh0aGlzLCBmdW5jdGlvbiAoQ3J5cHRvSlMpIHtcblxuXHQoZnVuY3Rpb24gKCkge1xuXHQgICAgLy8gU2hvcnRjdXRzXG5cdCAgICB2YXIgQyA9IENyeXB0b0pTO1xuXHQgICAgdmFyIENfbGliID0gQy5saWI7XG5cdCAgICB2YXIgV29yZEFycmF5ID0gQ19saWIuV29yZEFycmF5O1xuXHQgICAgdmFyIEhhc2hlciA9IENfbGliLkhhc2hlcjtcblx0ICAgIHZhciBDX2FsZ28gPSBDLmFsZ287XG5cblx0ICAgIC8vIFJldXNhYmxlIG9iamVjdFxuXHQgICAgdmFyIFcgPSBbXTtcblxuXHQgICAgLyoqXG5cdCAgICAgKiBTSEEtMSBoYXNoIGFsZ29yaXRobS5cblx0ICAgICAqL1xuXHQgICAgdmFyIFNIQTEgPSBDX2FsZ28uU0hBMSA9IEhhc2hlci5leHRlbmQoe1xuXHQgICAgICAgIF9kb1Jlc2V0OiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgIHRoaXMuX2hhc2ggPSBuZXcgV29yZEFycmF5LmluaXQoW1xuXHQgICAgICAgICAgICAgICAgMHg2NzQ1MjMwMSwgMHhlZmNkYWI4OSxcblx0ICAgICAgICAgICAgICAgIDB4OThiYWRjZmUsIDB4MTAzMjU0NzYsXG5cdCAgICAgICAgICAgICAgICAweGMzZDJlMWYwXG5cdCAgICAgICAgICAgIF0pO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICBfZG9Qcm9jZXNzQmxvY2s6IGZ1bmN0aW9uIChNLCBvZmZzZXQpIHtcblx0ICAgICAgICAgICAgLy8gU2hvcnRjdXRcblx0ICAgICAgICAgICAgdmFyIEggPSB0aGlzLl9oYXNoLndvcmRzO1xuXG5cdCAgICAgICAgICAgIC8vIFdvcmtpbmcgdmFyaWFibGVzXG5cdCAgICAgICAgICAgIHZhciBhID0gSFswXTtcblx0ICAgICAgICAgICAgdmFyIGIgPSBIWzFdO1xuXHQgICAgICAgICAgICB2YXIgYyA9IEhbMl07XG5cdCAgICAgICAgICAgIHZhciBkID0gSFszXTtcblx0ICAgICAgICAgICAgdmFyIGUgPSBIWzRdO1xuXG5cdCAgICAgICAgICAgIC8vIENvbXB1dGF0aW9uXG5cdCAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgODA7IGkrKykge1xuXHQgICAgICAgICAgICAgICAgaWYgKGkgPCAxNikge1xuXHQgICAgICAgICAgICAgICAgICAgIFdbaV0gPSBNW29mZnNldCArIGldIHwgMDtcblx0ICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cdCAgICAgICAgICAgICAgICAgICAgdmFyIG4gPSBXW2kgLSAzXSBeIFdbaSAtIDhdIF4gV1tpIC0gMTRdIF4gV1tpIC0gMTZdO1xuXHQgICAgICAgICAgICAgICAgICAgIFdbaV0gPSAobiA8PCAxKSB8IChuID4+PiAzMSk7XG5cdCAgICAgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgICAgIHZhciB0ID0gKChhIDw8IDUpIHwgKGEgPj4+IDI3KSkgKyBlICsgV1tpXTtcblx0ICAgICAgICAgICAgICAgIGlmIChpIDwgMjApIHtcblx0ICAgICAgICAgICAgICAgICAgICB0ICs9ICgoYiAmIGMpIHwgKH5iICYgZCkpICsgMHg1YTgyNzk5OTtcblx0ICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaSA8IDQwKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgdCArPSAoYiBeIGMgXiBkKSArIDB4NmVkOWViYTE7XG5cdCAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGkgPCA2MCkge1xuXHQgICAgICAgICAgICAgICAgICAgIHQgKz0gKChiICYgYykgfCAoYiAmIGQpIHwgKGMgJiBkKSkgLSAweDcwZTQ0MzI0O1xuXHQgICAgICAgICAgICAgICAgfSBlbHNlIC8qIGlmIChpIDwgODApICovIHtcblx0ICAgICAgICAgICAgICAgICAgICB0ICs9IChiIF4gYyBeIGQpIC0gMHgzNTlkM2UyYTtcblx0ICAgICAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICAgICAgZSA9IGQ7XG5cdCAgICAgICAgICAgICAgICBkID0gYztcblx0ICAgICAgICAgICAgICAgIGMgPSAoYiA8PCAzMCkgfCAoYiA+Pj4gMik7XG5cdCAgICAgICAgICAgICAgICBiID0gYTtcblx0ICAgICAgICAgICAgICAgIGEgPSB0O1xuXHQgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgLy8gSW50ZXJtZWRpYXRlIGhhc2ggdmFsdWVcblx0ICAgICAgICAgICAgSFswXSA9IChIWzBdICsgYSkgfCAwO1xuXHQgICAgICAgICAgICBIWzFdID0gKEhbMV0gKyBiKSB8IDA7XG5cdCAgICAgICAgICAgIEhbMl0gPSAoSFsyXSArIGMpIHwgMDtcblx0ICAgICAgICAgICAgSFszXSA9IChIWzNdICsgZCkgfCAwO1xuXHQgICAgICAgICAgICBIWzRdID0gKEhbNF0gKyBlKSB8IDA7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIF9kb0ZpbmFsaXplOiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgIC8vIFNob3J0Y3V0c1xuXHQgICAgICAgICAgICB2YXIgZGF0YSA9IHRoaXMuX2RhdGE7XG5cdCAgICAgICAgICAgIHZhciBkYXRhV29yZHMgPSBkYXRhLndvcmRzO1xuXG5cdCAgICAgICAgICAgIHZhciBuQml0c1RvdGFsID0gdGhpcy5fbkRhdGFCeXRlcyAqIDg7XG5cdCAgICAgICAgICAgIHZhciBuQml0c0xlZnQgPSBkYXRhLnNpZ0J5dGVzICogODtcblxuXHQgICAgICAgICAgICAvLyBBZGQgcGFkZGluZ1xuXHQgICAgICAgICAgICBkYXRhV29yZHNbbkJpdHNMZWZ0ID4+PiA1XSB8PSAweDgwIDw8ICgyNCAtIG5CaXRzTGVmdCAlIDMyKTtcblx0ICAgICAgICAgICAgZGF0YVdvcmRzWygoKG5CaXRzTGVmdCArIDY0KSA+Pj4gOSkgPDwgNCkgKyAxNF0gPSBNYXRoLmZsb29yKG5CaXRzVG90YWwgLyAweDEwMDAwMDAwMCk7XG5cdCAgICAgICAgICAgIGRhdGFXb3Jkc1soKChuQml0c0xlZnQgKyA2NCkgPj4+IDkpIDw8IDQpICsgMTVdID0gbkJpdHNUb3RhbDtcblx0ICAgICAgICAgICAgZGF0YS5zaWdCeXRlcyA9IGRhdGFXb3Jkcy5sZW5ndGggKiA0O1xuXG5cdCAgICAgICAgICAgIC8vIEhhc2ggZmluYWwgYmxvY2tzXG5cdCAgICAgICAgICAgIHRoaXMuX3Byb2Nlc3MoKTtcblxuXHQgICAgICAgICAgICAvLyBSZXR1cm4gZmluYWwgY29tcHV0ZWQgaGFzaFxuXHQgICAgICAgICAgICByZXR1cm4gdGhpcy5faGFzaDtcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgY2xvbmU6IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgdmFyIGNsb25lID0gSGFzaGVyLmNsb25lLmNhbGwodGhpcyk7XG5cdCAgICAgICAgICAgIGNsb25lLl9oYXNoID0gdGhpcy5faGFzaC5jbG9uZSgpO1xuXG5cdCAgICAgICAgICAgIHJldHVybiBjbG9uZTtcblx0ICAgICAgICB9XG5cdCAgICB9KTtcblxuXHQgICAgLyoqXG5cdCAgICAgKiBTaG9ydGN1dCBmdW5jdGlvbiB0byB0aGUgaGFzaGVyJ3Mgb2JqZWN0IGludGVyZmFjZS5cblx0ICAgICAqXG5cdCAgICAgKiBAcGFyYW0ge1dvcmRBcnJheXxzdHJpbmd9IG1lc3NhZ2UgVGhlIG1lc3NhZ2UgdG8gaGFzaC5cblx0ICAgICAqXG5cdCAgICAgKiBAcmV0dXJuIHtXb3JkQXJyYXl9IFRoZSBoYXNoLlxuXHQgICAgICpcblx0ICAgICAqIEBzdGF0aWNcblx0ICAgICAqXG5cdCAgICAgKiBAZXhhbXBsZVxuXHQgICAgICpcblx0ICAgICAqICAgICB2YXIgaGFzaCA9IENyeXB0b0pTLlNIQTEoJ21lc3NhZ2UnKTtcblx0ICAgICAqICAgICB2YXIgaGFzaCA9IENyeXB0b0pTLlNIQTEod29yZEFycmF5KTtcblx0ICAgICAqL1xuXHQgICAgQy5TSEExID0gSGFzaGVyLl9jcmVhdGVIZWxwZXIoU0hBMSk7XG5cblx0ICAgIC8qKlxuXHQgICAgICogU2hvcnRjdXQgZnVuY3Rpb24gdG8gdGhlIEhNQUMncyBvYmplY3QgaW50ZXJmYWNlLlxuXHQgICAgICpcblx0ICAgICAqIEBwYXJhbSB7V29yZEFycmF5fHN0cmluZ30gbWVzc2FnZSBUaGUgbWVzc2FnZSB0byBoYXNoLlxuXHQgICAgICogQHBhcmFtIHtXb3JkQXJyYXl8c3RyaW5nfSBrZXkgVGhlIHNlY3JldCBrZXkuXG5cdCAgICAgKlxuXHQgICAgICogQHJldHVybiB7V29yZEFycmF5fSBUaGUgSE1BQy5cblx0ICAgICAqXG5cdCAgICAgKiBAc3RhdGljXG5cdCAgICAgKlxuXHQgICAgICogQGV4YW1wbGVcblx0ICAgICAqXG5cdCAgICAgKiAgICAgdmFyIGhtYWMgPSBDcnlwdG9KUy5IbWFjU0hBMShtZXNzYWdlLCBrZXkpO1xuXHQgICAgICovXG5cdCAgICBDLkhtYWNTSEExID0gSGFzaGVyLl9jcmVhdGVIbWFjSGVscGVyKFNIQTEpO1xuXHR9KCkpO1xuXG5cblx0cmV0dXJuIENyeXB0b0pTLlNIQTE7XG5cbn0pKTsiLCIvLyAgICAgdXVpZC5qc1xuLy9cbi8vICAgICBDb3B5cmlnaHQgKGMpIDIwMTAtMjAxMiBSb2JlcnQgS2llZmZlclxuLy8gICAgIE1JVCBMaWNlbnNlIC0gaHR0cDovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBfZ2xvYmFsID0gdGhpcztcblxuICAvLyBVbmlxdWUgSUQgY3JlYXRpb24gcmVxdWlyZXMgYSBoaWdoIHF1YWxpdHkgcmFuZG9tICMgZ2VuZXJhdG9yLiAgV2UgZmVhdHVyZVxuICAvLyBkZXRlY3QgdG8gZGV0ZXJtaW5lIHRoZSBiZXN0IFJORyBzb3VyY2UsIG5vcm1hbGl6aW5nIHRvIGEgZnVuY3Rpb24gdGhhdFxuICAvLyByZXR1cm5zIDEyOC1iaXRzIG9mIHJhbmRvbW5lc3MsIHNpbmNlIHRoYXQncyB3aGF0J3MgdXN1YWxseSByZXF1aXJlZFxuICB2YXIgX3JuZztcblxuICAvLyBOb2RlLmpzIGNyeXB0by1iYXNlZCBSTkcgLSBodHRwOi8vbm9kZWpzLm9yZy9kb2NzL3YwLjYuMi9hcGkvY3J5cHRvLmh0bWxcbiAgLy9cbiAgLy8gTW9kZXJhdGVseSBmYXN0LCBoaWdoIHF1YWxpdHlcbiAgaWYgKHR5cGVvZihfZ2xvYmFsLnJlcXVpcmUpID09ICdmdW5jdGlvbicpIHtcbiAgICB0cnkge1xuICAgICAgdmFyIF9yYiA9IF9nbG9iYWwucmVxdWlyZSgnY3J5cHRvJykucmFuZG9tQnl0ZXM7XG4gICAgICBfcm5nID0gX3JiICYmIGZ1bmN0aW9uKCkge3JldHVybiBfcmIoMTYpO307XG4gICAgfSBjYXRjaChlKSB7fVxuICB9XG5cbiAgaWYgKCFfcm5nICYmIF9nbG9iYWwuY3J5cHRvICYmIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMpIHtcbiAgICAvLyBXSEFUV0cgY3J5cHRvLWJhc2VkIFJORyAtIGh0dHA6Ly93aWtpLndoYXR3Zy5vcmcvd2lraS9DcnlwdG9cbiAgICAvL1xuICAgIC8vIE1vZGVyYXRlbHkgZmFzdCwgaGlnaCBxdWFsaXR5XG4gICAgdmFyIF9ybmRzOCA9IG5ldyBVaW50OEFycmF5KDE2KTtcbiAgICBfcm5nID0gZnVuY3Rpb24gd2hhdHdnUk5HKCkge1xuICAgICAgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhfcm5kczgpO1xuICAgICAgcmV0dXJuIF9ybmRzODtcbiAgICB9O1xuICB9XG5cbiAgaWYgKCFfcm5nKSB7XG4gICAgLy8gTWF0aC5yYW5kb20oKS1iYXNlZCAoUk5HKVxuICAgIC8vXG4gICAgLy8gSWYgYWxsIGVsc2UgZmFpbHMsIHVzZSBNYXRoLnJhbmRvbSgpLiAgSXQncyBmYXN0LCBidXQgaXMgb2YgdW5zcGVjaWZpZWRcbiAgICAvLyBxdWFsaXR5LlxuICAgIHZhciAgX3JuZHMgPSBuZXcgQXJyYXkoMTYpO1xuICAgIF9ybmcgPSBmdW5jdGlvbigpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwLCByOyBpIDwgMTY7IGkrKykge1xuICAgICAgICBpZiAoKGkgJiAweDAzKSA9PT0gMCkgciA9IE1hdGgucmFuZG9tKCkgKiAweDEwMDAwMDAwMDtcbiAgICAgICAgX3JuZHNbaV0gPSByID4+PiAoKGkgJiAweDAzKSA8PCAzKSAmIDB4ZmY7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBfcm5kcztcbiAgICB9O1xuICB9XG5cbiAgLy8gQnVmZmVyIGNsYXNzIHRvIHVzZVxuICB2YXIgQnVmZmVyQ2xhc3MgPSB0eXBlb2YoX2dsb2JhbC5CdWZmZXIpID09ICdmdW5jdGlvbicgPyBfZ2xvYmFsLkJ1ZmZlciA6IEFycmF5O1xuXG4gIC8vIE1hcHMgZm9yIG51bWJlciA8LT4gaGV4IHN0cmluZyBjb252ZXJzaW9uXG4gIHZhciBfYnl0ZVRvSGV4ID0gW107XG4gIHZhciBfaGV4VG9CeXRlID0ge307XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgMjU2OyBpKyspIHtcbiAgICBfYnl0ZVRvSGV4W2ldID0gKGkgKyAweDEwMCkudG9TdHJpbmcoMTYpLnN1YnN0cigxKTtcbiAgICBfaGV4VG9CeXRlW19ieXRlVG9IZXhbaV1dID0gaTtcbiAgfVxuXG4gIC8vICoqYHBhcnNlKClgIC0gUGFyc2UgYSBVVUlEIGludG8gaXQncyBjb21wb25lbnQgYnl0ZXMqKlxuICBmdW5jdGlvbiBwYXJzZShzLCBidWYsIG9mZnNldCkge1xuICAgIHZhciBpID0gKGJ1ZiAmJiBvZmZzZXQpIHx8IDAsIGlpID0gMDtcblxuICAgIGJ1ZiA9IGJ1ZiB8fCBbXTtcbiAgICBzLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvWzAtOWEtZl17Mn0vZywgZnVuY3Rpb24ob2N0KSB7XG4gICAgICBpZiAoaWkgPCAxNikgeyAvLyBEb24ndCBvdmVyZmxvdyFcbiAgICAgICAgYnVmW2kgKyBpaSsrXSA9IF9oZXhUb0J5dGVbb2N0XTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFplcm8gb3V0IHJlbWFpbmluZyBieXRlcyBpZiBzdHJpbmcgd2FzIHNob3J0XG4gICAgd2hpbGUgKGlpIDwgMTYpIHtcbiAgICAgIGJ1ZltpICsgaWkrK10gPSAwO1xuICAgIH1cblxuICAgIHJldHVybiBidWY7XG4gIH1cblxuICAvLyAqKmB1bnBhcnNlKClgIC0gQ29udmVydCBVVUlEIGJ5dGUgYXJyYXkgKGFsYSBwYXJzZSgpKSBpbnRvIGEgc3RyaW5nKipcbiAgZnVuY3Rpb24gdW5wYXJzZShidWYsIG9mZnNldCkge1xuICAgIHZhciBpID0gb2Zmc2V0IHx8IDAsIGJ0aCA9IF9ieXRlVG9IZXg7XG4gICAgcmV0dXJuICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXSArXG4gICAgICAgICAgICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXSArICctJyArXG4gICAgICAgICAgICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXSArICctJyArXG4gICAgICAgICAgICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXSArICctJyArXG4gICAgICAgICAgICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXSArICctJyArXG4gICAgICAgICAgICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXSArXG4gICAgICAgICAgICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXSArXG4gICAgICAgICAgICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXTtcbiAgfVxuXG4gIC8vICoqYHYxKClgIC0gR2VuZXJhdGUgdGltZS1iYXNlZCBVVUlEKipcbiAgLy9cbiAgLy8gSW5zcGlyZWQgYnkgaHR0cHM6Ly9naXRodWIuY29tL0xpb3NLL1VVSUQuanNcbiAgLy8gYW5kIGh0dHA6Ly9kb2NzLnB5dGhvbi5vcmcvbGlicmFyeS91dWlkLmh0bWxcblxuICAvLyByYW5kb20gIydzIHdlIG5lZWQgdG8gaW5pdCBub2RlIGFuZCBjbG9ja3NlcVxuICB2YXIgX3NlZWRCeXRlcyA9IF9ybmcoKTtcblxuICAvLyBQZXIgNC41LCBjcmVhdGUgYW5kIDQ4LWJpdCBub2RlIGlkLCAoNDcgcmFuZG9tIGJpdHMgKyBtdWx0aWNhc3QgYml0ID0gMSlcbiAgdmFyIF9ub2RlSWQgPSBbXG4gICAgX3NlZWRCeXRlc1swXSB8IDB4MDEsXG4gICAgX3NlZWRCeXRlc1sxXSwgX3NlZWRCeXRlc1syXSwgX3NlZWRCeXRlc1szXSwgX3NlZWRCeXRlc1s0XSwgX3NlZWRCeXRlc1s1XVxuICBdO1xuXG4gIC8vIFBlciA0LjIuMiwgcmFuZG9taXplICgxNCBiaXQpIGNsb2Nrc2VxXG4gIHZhciBfY2xvY2tzZXEgPSAoX3NlZWRCeXRlc1s2XSA8PCA4IHwgX3NlZWRCeXRlc1s3XSkgJiAweDNmZmY7XG5cbiAgLy8gUHJldmlvdXMgdXVpZCBjcmVhdGlvbiB0aW1lXG4gIHZhciBfbGFzdE1TZWNzID0gMCwgX2xhc3ROU2VjcyA9IDA7XG5cbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9icm9vZmEvbm9kZS11dWlkIGZvciBBUEkgZGV0YWlsc1xuICBmdW5jdGlvbiB2MShvcHRpb25zLCBidWYsIG9mZnNldCkge1xuICAgIHZhciBpID0gYnVmICYmIG9mZnNldCB8fCAwO1xuICAgIHZhciBiID0gYnVmIHx8IFtdO1xuXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICB2YXIgY2xvY2tzZXEgPSBvcHRpb25zLmNsb2Nrc2VxICE9IG51bGwgPyBvcHRpb25zLmNsb2Nrc2VxIDogX2Nsb2Nrc2VxO1xuXG4gICAgLy8gVVVJRCB0aW1lc3RhbXBzIGFyZSAxMDAgbmFuby1zZWNvbmQgdW5pdHMgc2luY2UgdGhlIEdyZWdvcmlhbiBlcG9jaCxcbiAgICAvLyAoMTU4Mi0xMC0xNSAwMDowMCkuICBKU051bWJlcnMgYXJlbid0IHByZWNpc2UgZW5vdWdoIGZvciB0aGlzLCBzb1xuICAgIC8vIHRpbWUgaXMgaGFuZGxlZCBpbnRlcm5hbGx5IGFzICdtc2VjcycgKGludGVnZXIgbWlsbGlzZWNvbmRzKSBhbmQgJ25zZWNzJ1xuICAgIC8vICgxMDAtbmFub3NlY29uZHMgb2Zmc2V0IGZyb20gbXNlY3MpIHNpbmNlIHVuaXggZXBvY2gsIDE5NzAtMDEtMDEgMDA6MDAuXG4gICAgdmFyIG1zZWNzID0gb3B0aW9ucy5tc2VjcyAhPSBudWxsID8gb3B0aW9ucy5tc2VjcyA6IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXG4gICAgLy8gUGVyIDQuMi4xLjIsIHVzZSBjb3VudCBvZiB1dWlkJ3MgZ2VuZXJhdGVkIGR1cmluZyB0aGUgY3VycmVudCBjbG9ja1xuICAgIC8vIGN5Y2xlIHRvIHNpbXVsYXRlIGhpZ2hlciByZXNvbHV0aW9uIGNsb2NrXG4gICAgdmFyIG5zZWNzID0gb3B0aW9ucy5uc2VjcyAhPSBudWxsID8gb3B0aW9ucy5uc2VjcyA6IF9sYXN0TlNlY3MgKyAxO1xuXG4gICAgLy8gVGltZSBzaW5jZSBsYXN0IHV1aWQgY3JlYXRpb24gKGluIG1zZWNzKVxuICAgIHZhciBkdCA9IChtc2VjcyAtIF9sYXN0TVNlY3MpICsgKG5zZWNzIC0gX2xhc3ROU2VjcykvMTAwMDA7XG5cbiAgICAvLyBQZXIgNC4yLjEuMiwgQnVtcCBjbG9ja3NlcSBvbiBjbG9jayByZWdyZXNzaW9uXG4gICAgaWYgKGR0IDwgMCAmJiBvcHRpb25zLmNsb2Nrc2VxID09IG51bGwpIHtcbiAgICAgIGNsb2Nrc2VxID0gY2xvY2tzZXEgKyAxICYgMHgzZmZmO1xuICAgIH1cblxuICAgIC8vIFJlc2V0IG5zZWNzIGlmIGNsb2NrIHJlZ3Jlc3NlcyAobmV3IGNsb2Nrc2VxKSBvciB3ZSd2ZSBtb3ZlZCBvbnRvIGEgbmV3XG4gICAgLy8gdGltZSBpbnRlcnZhbFxuICAgIGlmICgoZHQgPCAwIHx8IG1zZWNzID4gX2xhc3RNU2VjcykgJiYgb3B0aW9ucy5uc2VjcyA9PSBudWxsKSB7XG4gICAgICBuc2VjcyA9IDA7XG4gICAgfVxuXG4gICAgLy8gUGVyIDQuMi4xLjIgVGhyb3cgZXJyb3IgaWYgdG9vIG1hbnkgdXVpZHMgYXJlIHJlcXVlc3RlZFxuICAgIGlmIChuc2VjcyA+PSAxMDAwMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCd1dWlkLnYxKCk6IENhblxcJ3QgY3JlYXRlIG1vcmUgdGhhbiAxME0gdXVpZHMvc2VjJyk7XG4gICAgfVxuXG4gICAgX2xhc3RNU2VjcyA9IG1zZWNzO1xuICAgIF9sYXN0TlNlY3MgPSBuc2VjcztcbiAgICBfY2xvY2tzZXEgPSBjbG9ja3NlcTtcblxuICAgIC8vIFBlciA0LjEuNCAtIENvbnZlcnQgZnJvbSB1bml4IGVwb2NoIHRvIEdyZWdvcmlhbiBlcG9jaFxuICAgIG1zZWNzICs9IDEyMjE5MjkyODAwMDAwO1xuXG4gICAgLy8gYHRpbWVfbG93YFxuICAgIHZhciB0bCA9ICgobXNlY3MgJiAweGZmZmZmZmYpICogMTAwMDAgKyBuc2VjcykgJSAweDEwMDAwMDAwMDtcbiAgICBiW2krK10gPSB0bCA+Pj4gMjQgJiAweGZmO1xuICAgIGJbaSsrXSA9IHRsID4+PiAxNiAmIDB4ZmY7XG4gICAgYltpKytdID0gdGwgPj4+IDggJiAweGZmO1xuICAgIGJbaSsrXSA9IHRsICYgMHhmZjtcblxuICAgIC8vIGB0aW1lX21pZGBcbiAgICB2YXIgdG1oID0gKG1zZWNzIC8gMHgxMDAwMDAwMDAgKiAxMDAwMCkgJiAweGZmZmZmZmY7XG4gICAgYltpKytdID0gdG1oID4+PiA4ICYgMHhmZjtcbiAgICBiW2krK10gPSB0bWggJiAweGZmO1xuXG4gICAgLy8gYHRpbWVfaGlnaF9hbmRfdmVyc2lvbmBcbiAgICBiW2krK10gPSB0bWggPj4+IDI0ICYgMHhmIHwgMHgxMDsgLy8gaW5jbHVkZSB2ZXJzaW9uXG4gICAgYltpKytdID0gdG1oID4+PiAxNiAmIDB4ZmY7XG5cbiAgICAvLyBgY2xvY2tfc2VxX2hpX2FuZF9yZXNlcnZlZGAgKFBlciA0LjIuMiAtIGluY2x1ZGUgdmFyaWFudClcbiAgICBiW2krK10gPSBjbG9ja3NlcSA+Pj4gOCB8IDB4ODA7XG5cbiAgICAvLyBgY2xvY2tfc2VxX2xvd2BcbiAgICBiW2krK10gPSBjbG9ja3NlcSAmIDB4ZmY7XG5cbiAgICAvLyBgbm9kZWBcbiAgICB2YXIgbm9kZSA9IG9wdGlvbnMubm9kZSB8fCBfbm9kZUlkO1xuICAgIGZvciAodmFyIG4gPSAwOyBuIDwgNjsgbisrKSB7XG4gICAgICBiW2kgKyBuXSA9IG5vZGVbbl07XG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1ZiA/IGJ1ZiA6IHVucGFyc2UoYik7XG4gIH1cblxuICAvLyAqKmB2NCgpYCAtIEdlbmVyYXRlIHJhbmRvbSBVVUlEKipcblxuICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2Jyb29mYS9ub2RlLXV1aWQgZm9yIEFQSSBkZXRhaWxzXG4gIGZ1bmN0aW9uIHY0KG9wdGlvbnMsIGJ1Ziwgb2Zmc2V0KSB7XG4gICAgLy8gRGVwcmVjYXRlZCAtICdmb3JtYXQnIGFyZ3VtZW50LCBhcyBzdXBwb3J0ZWQgaW4gdjEuMlxuICAgIHZhciBpID0gYnVmICYmIG9mZnNldCB8fCAwO1xuXG4gICAgaWYgKHR5cGVvZihvcHRpb25zKSA9PSAnc3RyaW5nJykge1xuICAgICAgYnVmID0gb3B0aW9ucyA9PSAnYmluYXJ5JyA/IG5ldyBCdWZmZXJDbGFzcygxNikgOiBudWxsO1xuICAgICAgb3B0aW9ucyA9IG51bGw7XG4gICAgfVxuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgdmFyIHJuZHMgPSBvcHRpb25zLnJhbmRvbSB8fCAob3B0aW9ucy5ybmcgfHwgX3JuZykoKTtcblxuICAgIC8vIFBlciA0LjQsIHNldCBiaXRzIGZvciB2ZXJzaW9uIGFuZCBgY2xvY2tfc2VxX2hpX2FuZF9yZXNlcnZlZGBcbiAgICBybmRzWzZdID0gKHJuZHNbNl0gJiAweDBmKSB8IDB4NDA7XG4gICAgcm5kc1s4XSA9IChybmRzWzhdICYgMHgzZikgfCAweDgwO1xuXG4gICAgLy8gQ29weSBieXRlcyB0byBidWZmZXIsIGlmIHByb3ZpZGVkXG4gICAgaWYgKGJ1Zikge1xuICAgICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IDE2OyBpaSsrKSB7XG4gICAgICAgIGJ1ZltpICsgaWldID0gcm5kc1tpaV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1ZiB8fCB1bnBhcnNlKHJuZHMpO1xuICB9XG5cbiAgLy8gRXhwb3J0IHB1YmxpYyBBUElcbiAgdmFyIHV1aWQgPSB2NDtcbiAgdXVpZC52MSA9IHYxO1xuICB1dWlkLnY0ID0gdjQ7XG4gIHV1aWQucGFyc2UgPSBwYXJzZTtcbiAgdXVpZC51bnBhcnNlID0gdW5wYXJzZTtcbiAgdXVpZC5CdWZmZXJDbGFzcyA9IEJ1ZmZlckNsYXNzO1xuXG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAvLyBQdWJsaXNoIGFzIEFNRCBtb2R1bGVcbiAgICBkZWZpbmUoZnVuY3Rpb24oKSB7cmV0dXJuIHV1aWQ7fSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mKG1vZHVsZSkgIT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAvLyBQdWJsaXNoIGFzIG5vZGUuanMgbW9kdWxlXG4gICAgbW9kdWxlLmV4cG9ydHMgPSB1dWlkO1xuICB9IGVsc2Uge1xuICAgIC8vIFB1Ymxpc2ggYXMgZ2xvYmFsIChpbiBicm93c2VycylcbiAgICB2YXIgX3ByZXZpb3VzUm9vdCA9IF9nbG9iYWwudXVpZDtcblxuICAgIC8vICoqYG5vQ29uZmxpY3QoKWAgLSAoYnJvd3NlciBvbmx5KSB0byByZXNldCBnbG9iYWwgJ3V1aWQnIHZhcioqXG4gICAgdXVpZC5ub0NvbmZsaWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgICBfZ2xvYmFsLnV1aWQgPSBfcHJldmlvdXNSb290O1xuICAgICAgcmV0dXJuIHV1aWQ7XG4gICAgfTtcblxuICAgIF9nbG9iYWwudXVpZCA9IHV1aWQ7XG4gIH1cbn0pLmNhbGwodGhpcyk7XG4iLCJ2YXIgZztcblxuLy8gVGhpcyB3b3JrcyBpbiBub24tc3RyaWN0IG1vZGVcbmcgPSAoZnVuY3Rpb24oKSB7XG5cdHJldHVybiB0aGlzO1xufSkoKTtcblxudHJ5IHtcblx0Ly8gVGhpcyB3b3JrcyBpZiBldmFsIGlzIGFsbG93ZWQgKHNlZSBDU1ApXG5cdGcgPSBnIHx8IG5ldyBGdW5jdGlvbihcInJldHVybiB0aGlzXCIpKCk7XG59IGNhdGNoIChlKSB7XG5cdC8vIFRoaXMgd29ya3MgaWYgdGhlIHdpbmRvdyByZWZlcmVuY2UgaXMgYXZhaWxhYmxlXG5cdGlmICh0eXBlb2Ygd2luZG93ID09PSBcIm9iamVjdFwiKSBnID0gd2luZG93O1xufVxuXG4vLyBnIGNhbiBzdGlsbCBiZSB1bmRlZmluZWQsIGJ1dCBub3RoaW5nIHRvIGRvIGFib3V0IGl0Li4uXG4vLyBXZSByZXR1cm4gdW5kZWZpbmVkLCBpbnN0ZWFkIG9mIG5vdGhpbmcgaGVyZSwgc28gaXQnc1xuLy8gZWFzaWVyIHRvIGhhbmRsZSB0aGlzIGNhc2UuIGlmKCFnbG9iYWwpIHsgLi4ufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGc7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuXHRpZiAoIW1vZHVsZS53ZWJwYWNrUG9seWZpbGwpIHtcblx0XHRtb2R1bGUuZGVwcmVjYXRlID0gZnVuY3Rpb24oKSB7fTtcblx0XHRtb2R1bGUucGF0aHMgPSBbXTtcblx0XHQvLyBtb2R1bGUucGFyZW50ID0gdW5kZWZpbmVkIGJ5IGRlZmF1bHRcblx0XHRpZiAoIW1vZHVsZS5jaGlsZHJlbikgbW9kdWxlLmNoaWxkcmVuID0gW107XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG1vZHVsZSwgXCJsb2FkZWRcIiwge1xuXHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcblx0XHRcdGdldDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiBtb2R1bGUubDtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobW9kdWxlLCBcImlkXCIsIHtcblx0XHRcdGVudW1lcmFibGU6IHRydWUsXG5cdFx0XHRnZXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyZXR1cm4gbW9kdWxlLmk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0bW9kdWxlLndlYnBhY2tQb2x5ZmlsbCA9IDE7XG5cdH1cblx0cmV0dXJuIG1vZHVsZTtcbn07XG4iLCJ1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKVxuU3RvcmFnZSA9IHJlcXVpcmUoJy4vc3RvcmFnZScpXG5cbmNsYXNzIEFkYXB0ZXJzXG5cbiAgIyMgQWRhcHRlciBmb3IgdXNpbmcgdGhlIGdpbWVsIGJhY2tlbmQuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vQWxlcGhiZXQvZ2ltZWxcbiAgIyMgdXNlcyBqUXVlcnkgdG8gc2VuZCBkYXRhIGlmIGAkLmFqYXhgIGlzIGZvdW5kLiBGYWxscyBiYWNrIG9uIHBsYWluIGpzIHhoclxuICAjIyBwYXJhbXM6XG4gICMjIC0gdXJsOiBHaW1lbCB0cmFjayBVUkwgdG8gcG9zdCBldmVudHMgdG9cbiAgIyMgLSBuYW1lcHNhY2U6IG5hbWVzcGFjZSBmb3IgR2ltZWwgKGFsbG93cyBzZXR0aW5nIGRpZmZlcmVudCBlbnZpcm9ubWVudHMgZXRjKVxuICAjIyAtIHN0b3JhZ2UgKG9wdGlvbmFsKSAtIHN0b3JhZ2UgYWRhcHRlciBmb3IgdGhlIHF1ZXVlXG4gIGNsYXNzIEBHaW1lbEFkYXB0ZXJcbiAgICBxdWV1ZV9uYW1lOiAnX2dpbWVsX3F1ZXVlJ1xuXG4gICAgY29uc3RydWN0b3I6ICh1cmwsIG5hbWVzcGFjZSwgc3RvcmFnZSA9IEFkYXB0ZXJzLkxvY2FsU3RvcmFnZUFkYXB0ZXIpIC0+XG4gICAgICBAX3N0b3JhZ2UgPSBzdG9yYWdlXG4gICAgICBAdXJsID0gdXJsXG4gICAgICBAbmFtZXNwYWNlID0gbmFtZXNwYWNlXG4gICAgICBAX3F1ZXVlID0gSlNPTi5wYXJzZShAX3N0b3JhZ2UuZ2V0KEBxdWV1ZV9uYW1lKSB8fCAnW10nKVxuICAgICAgQF9mbHVzaCgpXG5cbiAgICBfcmVtb3ZlX3F1dWlkOiAocXV1aWQpIC0+XG4gICAgICAoZXJyLCByZXMpID0+XG4gICAgICAgIHJldHVybiBpZiBlcnJcbiAgICAgICAgdXRpbHMucmVtb3ZlKEBfcXVldWUsIChlbCkgLT4gZWwucHJvcGVydGllcy5fcXV1aWQgPT0gcXV1aWQpXG4gICAgICAgIEBfc3RvcmFnZS5zZXQoQHF1ZXVlX25hbWUsIEpTT04uc3RyaW5naWZ5KEBfcXVldWUpKVxuXG4gICAgX2pxdWVyeV9nZXQ6ICh1cmwsIGRhdGEsIGNhbGxiYWNrKSAtPlxuICAgICAgdXRpbHMubG9nKCdzZW5kIHJlcXVlc3QgdXNpbmcgalF1ZXJ5JylcbiAgICAgIHdpbmRvdy5qUXVlcnkuYWpheFxuICAgICAgICBtZXRob2Q6ICdHRVQnXG4gICAgICAgIHVybDogdXJsXG4gICAgICAgIGRhdGE6IGRhdGFcbiAgICAgICAgc3VjY2VzczogY2FsbGJhY2tcblxuICAgIF9wbGFpbl9qc19nZXQ6ICh1cmwsIGRhdGEsIGNhbGxiYWNrKSAtPlxuICAgICAgdXRpbHMubG9nKCdmYWxsYmFjayBvbiBwbGFpbiBqcyB4aHInKVxuICAgICAgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcbiAgICAgIHBhcmFtcyA9IChcIiN7ZW5jb2RlVVJJQ29tcG9uZW50KGspfT0je2VuY29kZVVSSUNvbXBvbmVudCh2KX1cIiBmb3Igayx2IG9mIGRhdGEpXG4gICAgICBwYXJhbXMgPSBwYXJhbXMuam9pbignJicpLnJlcGxhY2UoLyUyMC9nLCAnKycpXG4gICAgICB4aHIub3BlbignR0VUJywgXCIje3VybH0/I3twYXJhbXN9XCIpXG4gICAgICB4aHIub25sb2FkID0gLT5cbiAgICAgICAgaWYgeGhyLnN0YXR1cyA9PSAyMDBcbiAgICAgICAgICBjYWxsYmFjaygpXG4gICAgICB4aHIuc2VuZCgpXG5cbiAgICBfYWpheF9nZXQ6ICh1cmwsIGRhdGEsIGNhbGxiYWNrKSAtPlxuICAgICAgaWYgd2luZG93LmpRdWVyeT8uYWpheFxuICAgICAgICBAX2pxdWVyeV9nZXQodXJsLCBkYXRhLCBjYWxsYmFjaylcbiAgICAgIGVsc2VcbiAgICAgICAgQF9wbGFpbl9qc19nZXQodXJsLCBkYXRhLCBjYWxsYmFjaylcblxuICAgIF9mbHVzaDogLT5cbiAgICAgIGZvciBpdGVtIGluIEBfcXVldWVcbiAgICAgICAgY2FsbGJhY2sgPSBAX3JlbW92ZV9xdXVpZChpdGVtLnByb3BlcnRpZXMuX3F1dWlkKVxuICAgICAgICBAX2FqYXhfZ2V0KEB1cmwsIHV0aWxzLm9taXQoaXRlbS5wcm9wZXJ0aWVzLCAnX3F1dWlkJyksIGNhbGxiYWNrKVxuICAgICAgICBudWxsXG5cbiAgICBfdXNlcl91dWlkOiAoZXhwZXJpbWVudCwgZ29hbCkgLT5cbiAgICAgIHJldHVybiB1dGlscy51dWlkKCkgdW5sZXNzIGV4cGVyaW1lbnQudXNlcl9pZFxuICAgICAgIyBpZiBnb2FsIGlzIG5vdCB1bmlxdWUsIHdlIHRyYWNrIGl0IGV2ZXJ5IHRpbWUuIHJldHVybiBhIG5ldyByYW5kb20gdXVpZFxuICAgICAgcmV0dXJuIHV0aWxzLnV1aWQoKSB1bmxlc3MgZ29hbC51bmlxdWVcbiAgICAgICMgZm9yIGEgZ2l2ZW4gdXNlciBpZCwgbmFtZXNwYWNlIGFuZCBleHBlcmltZW50LCB0aGUgdXVpZCB3aWxsIGFsd2F5cyBiZSB0aGUgc2FtZVxuICAgICAgIyB0aGlzIGF2b2lkcyBjb3VudGluZyBnb2FscyB0d2ljZSBmb3IgdGhlIHNhbWUgdXNlciBhY3Jvc3MgZGlmZmVyZW50IGRldmljZXNcbiAgICAgIHV0aWxzLnNoYTEoXCIje0BuYW1lc3BhY2V9LiN7ZXhwZXJpbWVudC5uYW1lfS4je2V4cGVyaW1lbnQudXNlcl9pZH1cIilcblxuICAgIF90cmFjazogKGV4cGVyaW1lbnQsIHZhcmlhbnQsIGdvYWwpIC0+XG4gICAgICB1dGlscy5sb2coXCJQZXJzaXN0ZW50IFF1ZXVlIEdpbWVsIHRyYWNrOiAje0BuYW1lc3BhY2V9LCAje2V4cGVyaW1lbnQubmFtZX0sICN7dmFyaWFudH0sICN7Z29hbC5uYW1lfVwiKVxuICAgICAgQF9xdWV1ZS5zaGlmdCgpIGlmIEBfcXVldWUubGVuZ3RoID4gMTAwXG4gICAgICBAX3F1ZXVlLnB1c2hcbiAgICAgICAgcHJvcGVydGllczpcbiAgICAgICAgICBleHBlcmltZW50OiBleHBlcmltZW50Lm5hbWVcbiAgICAgICAgICBfcXV1aWQ6IHV0aWxzLnV1aWQoKSAgIyBxdWV1ZSB1dWlkICh1c2VkIG9ubHkgaW50ZXJuYWxseSlcbiAgICAgICAgICB1dWlkOiBAX3VzZXJfdXVpZChleHBlcmltZW50LCBnb2FsKVxuICAgICAgICAgIHZhcmlhbnQ6IHZhcmlhbnRcbiAgICAgICAgICBldmVudDogZ29hbC5uYW1lXG4gICAgICAgICAgbmFtZXNwYWNlOiBAbmFtZXNwYWNlXG4gICAgICBAX3N0b3JhZ2Uuc2V0KEBxdWV1ZV9uYW1lLCBKU09OLnN0cmluZ2lmeShAX3F1ZXVlKSlcbiAgICAgIEBfZmx1c2goKVxuXG4gICAgZXhwZXJpbWVudF9zdGFydDogKGV4cGVyaW1lbnQsIHZhcmlhbnQpIC0+XG4gICAgICBAX3RyYWNrKGV4cGVyaW1lbnQsIHZhcmlhbnQsIHtuYW1lOiAncGFydGljaXBhdGUnLCB1bmlxdWU6IHRydWV9KVxuXG4gICAgZ29hbF9jb21wbGV0ZTogKGV4cGVyaW1lbnQsIHZhcmlhbnQsIGdvYWxfbmFtZSwgcHJvcHMpIC0+XG4gICAgICBAX3RyYWNrKGV4cGVyaW1lbnQsIHZhcmlhbnQsIHV0aWxzLmRlZmF1bHRzKHtuYW1lOiBnb2FsX25hbWV9LCBwcm9wcykpXG5cblxuICBjbGFzcyBAUGVyc2lzdGVudFF1ZXVlR29vZ2xlQW5hbHl0aWNzQWRhcHRlclxuICAgIG5hbWVzcGFjZTogJ2FsZXBoYmV0J1xuICAgIHF1ZXVlX25hbWU6ICdfZ2FfcXVldWUnXG5cbiAgICBjb25zdHJ1Y3RvcjogKHN0b3JhZ2UgPSBBZGFwdGVycy5Mb2NhbFN0b3JhZ2VBZGFwdGVyKSAtPlxuICAgICAgQF9zdG9yYWdlID0gc3RvcmFnZVxuICAgICAgQF9xdWV1ZSA9IEpTT04ucGFyc2UoQF9zdG9yYWdlLmdldChAcXVldWVfbmFtZSkgfHwgJ1tdJylcbiAgICAgIEBfZmx1c2goKVxuXG4gICAgX3JlbW92ZV91dWlkOiAodXVpZCkgLT5cbiAgICAgID0+XG4gICAgICAgIHV0aWxzLnJlbW92ZShAX3F1ZXVlLCAoZWwpIC0+IGVsLnV1aWQgPT0gdXVpZClcbiAgICAgICAgQF9zdG9yYWdlLnNldChAcXVldWVfbmFtZSwgSlNPTi5zdHJpbmdpZnkoQF9xdWV1ZSkpXG5cbiAgICBfZmx1c2g6IC0+XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2dhIG5vdCBkZWZpbmVkLiBQbGVhc2UgbWFrZSBzdXJlIHlvdXIgVW5pdmVyc2FsIGFuYWx5dGljcyBpcyBzZXQgdXAgY29ycmVjdGx5JykgaWYgdHlwZW9mIGdhIGlzbnQgJ2Z1bmN0aW9uJ1xuICAgICAgZm9yIGl0ZW0gaW4gQF9xdWV1ZVxuICAgICAgICBjYWxsYmFjayA9IEBfcmVtb3ZlX3V1aWQoaXRlbS51dWlkKVxuICAgICAgICBnYSgnc2VuZCcsICdldmVudCcsIGl0ZW0uY2F0ZWdvcnksIGl0ZW0uYWN0aW9uLCBpdGVtLmxhYmVsLCB7J2hpdENhbGxiYWNrJzogY2FsbGJhY2ssICdub25JbnRlcmFjdGlvbic6IDF9KVxuXG4gICAgX3RyYWNrOiAoY2F0ZWdvcnksIGFjdGlvbiwgbGFiZWwpIC0+XG4gICAgICB1dGlscy5sb2coXCJQZXJzaXN0ZW50IFF1ZXVlIEdvb2dsZSBVbml2ZXJzYWwgQW5hbHl0aWNzIHRyYWNrOiAje2NhdGVnb3J5fSwgI3thY3Rpb259LCAje2xhYmVsfVwiKVxuICAgICAgQF9xdWV1ZS5zaGlmdCgpIGlmIEBfcXVldWUubGVuZ3RoID4gMTAwXG4gICAgICBAX3F1ZXVlLnB1c2goe3V1aWQ6IHV0aWxzLnV1aWQoKSwgY2F0ZWdvcnk6IGNhdGVnb3J5LCBhY3Rpb246IGFjdGlvbiwgbGFiZWw6IGxhYmVsfSlcbiAgICAgIEBfc3RvcmFnZS5zZXQoQHF1ZXVlX25hbWUsIEpTT04uc3RyaW5naWZ5KEBfcXVldWUpKVxuICAgICAgQF9mbHVzaCgpXG5cbiAgICBleHBlcmltZW50X3N0YXJ0OiAoZXhwZXJpbWVudCwgdmFyaWFudCkgLT5cbiAgICAgIEBfdHJhY2soQG5hbWVzcGFjZSwgXCIje2V4cGVyaW1lbnQubmFtZX0gfCAje3ZhcmlhbnR9XCIsICdWaXNpdG9ycycpXG5cbiAgICBnb2FsX2NvbXBsZXRlOiAoZXhwZXJpbWVudCwgdmFyaWFudCwgZ29hbF9uYW1lLCBfcHJvcHMpIC0+XG4gICAgICBAX3RyYWNrKEBuYW1lc3BhY2UsIFwiI3tleHBlcmltZW50Lm5hbWV9IHwgI3t2YXJpYW50fVwiLCBnb2FsX25hbWUpXG5cblxuICBjbGFzcyBAUGVyc2lzdGVudFF1ZXVlS2VlbkFkYXB0ZXJcbiAgICBxdWV1ZV9uYW1lOiAnX2tlZW5fcXVldWUnXG5cbiAgICBjb25zdHJ1Y3RvcjogKGtlZW5fY2xpZW50LCBzdG9yYWdlID0gQWRhcHRlcnMuTG9jYWxTdG9yYWdlQWRhcHRlcikgLT5cbiAgICAgIEBjbGllbnQgPSBrZWVuX2NsaWVudFxuICAgICAgQF9zdG9yYWdlID0gc3RvcmFnZVxuICAgICAgQF9xdWV1ZSA9IEpTT04ucGFyc2UoQF9zdG9yYWdlLmdldChAcXVldWVfbmFtZSkgfHwgJ1tdJylcbiAgICAgIEBfZmx1c2goKVxuXG4gICAgX3JlbW92ZV9xdXVpZDogKHF1dWlkKSAtPlxuICAgICAgKGVyciwgcmVzKSA9PlxuICAgICAgICByZXR1cm4gaWYgZXJyXG4gICAgICAgIHV0aWxzLnJlbW92ZShAX3F1ZXVlLCAoZWwpIC0+IGVsLnByb3BlcnRpZXMuX3F1dWlkID09IHF1dWlkKVxuICAgICAgICBAX3N0b3JhZ2Uuc2V0KEBxdWV1ZV9uYW1lLCBKU09OLnN0cmluZ2lmeShAX3F1ZXVlKSlcblxuICAgIF9mbHVzaDogLT5cbiAgICAgIGZvciBpdGVtIGluIEBfcXVldWVcbiAgICAgICAgY2FsbGJhY2sgPSBAX3JlbW92ZV9xdXVpZChpdGVtLnByb3BlcnRpZXMuX3F1dWlkKVxuICAgICAgICBAY2xpZW50LmFkZEV2ZW50KGl0ZW0uZXhwZXJpbWVudF9uYW1lLCB1dGlscy5vbWl0KGl0ZW0ucHJvcGVydGllcywgJ19xdXVpZCcpLCBjYWxsYmFjaylcblxuICAgIF91c2VyX3V1aWQ6IChleHBlcmltZW50LCBnb2FsKSAtPlxuICAgICAgcmV0dXJuIHV0aWxzLnV1aWQoKSB1bmxlc3MgZXhwZXJpbWVudC51c2VyX2lkXG4gICAgICAjIGlmIGdvYWwgaXMgbm90IHVuaXF1ZSwgd2UgdHJhY2sgaXQgZXZlcnkgdGltZS4gcmV0dXJuIGEgbmV3IHJhbmRvbSB1dWlkXG4gICAgICByZXR1cm4gdXRpbHMudXVpZCgpIHVubGVzcyBnb2FsLnVuaXF1ZVxuICAgICAgIyBmb3IgYSBnaXZlbiB1c2VyIGlkLCBuYW1lc3BhY2UgYW5kIGV4cGVyaW1lbnQsIHRoZSB1dWlkIHdpbGwgYWx3YXlzIGJlIHRoZSBzYW1lXG4gICAgICAjIHRoaXMgYXZvaWRzIGNvdW50aW5nIGdvYWxzIHR3aWNlIGZvciB0aGUgc2FtZSB1c2VyIGFjcm9zcyBkaWZmZXJlbnQgZGV2aWNlc1xuICAgICAgdXRpbHMuc2hhMShcIiN7QG5hbWVzcGFjZX0uI3tleHBlcmltZW50Lm5hbWV9LiN7ZXhwZXJpbWVudC51c2VyX2lkfVwiKVxuXG4gICAgX3RyYWNrOiAoZXhwZXJpbWVudCwgdmFyaWFudCwgZ29hbCkgLT5cbiAgICAgIHV0aWxzLmxvZyhcIlBlcnNpc3RlbnQgUXVldWUgS2VlbiB0cmFjazogI3tleHBlcmltZW50Lm5hbWV9LCAje3ZhcmlhbnR9LCAje2V2ZW50fVwiKVxuICAgICAgQF9xdWV1ZS5zaGlmdCgpIGlmIEBfcXVldWUubGVuZ3RoID4gMTAwXG4gICAgICBAX3F1ZXVlLnB1c2hcbiAgICAgICAgZXhwZXJpbWVudF9uYW1lOiBleHBlcmltZW50Lm5hbWVcbiAgICAgICAgcHJvcGVydGllczpcbiAgICAgICAgICBfcXV1aWQ6IHV0aWxzLnV1aWQoKSAgIyBxdWV1ZSB1dWlkICh1c2VkIG9ubHkgaW50ZXJuYWxseSlcbiAgICAgICAgICB1dWlkOiBAX3VzZXJfdXVpZChleHBlcmltZW50LCBnb2FsKVxuICAgICAgICAgIHZhcmlhbnQ6IHZhcmlhbnRcbiAgICAgICAgICBldmVudDogZ29hbC5uYW1lXG4gICAgICBAX3N0b3JhZ2Uuc2V0KEBxdWV1ZV9uYW1lLCBKU09OLnN0cmluZ2lmeShAX3F1ZXVlKSlcbiAgICAgIEBfZmx1c2goKVxuXG4gICAgZXhwZXJpbWVudF9zdGFydDogKGV4cGVyaW1lbnQsIHZhcmlhbnQpIC0+XG4gICAgICBAX3RyYWNrKGV4cGVyaW1lbnQsIHZhcmlhbnQsIHtuYW1lOiAncGFydGljaXBhdGUnLCB1bmlxdWU6IHRydWV9KVxuXG4gICAgZ29hbF9jb21wbGV0ZTogKGV4cGVyaW1lbnQsIHZhcmlhbnQsIGdvYWxfbmFtZSwgcHJvcHMpIC0+XG4gICAgICBAX3RyYWNrKGV4cGVyaW1lbnQsIHZhcmlhbnQsIHV0aWxzLmRlZmF1bHRzKHtuYW1lOiBnb2FsX25hbWV9LCBwcm9wcykpXG5cblxuICBjbGFzcyBAR29vZ2xlVW5pdmVyc2FsQW5hbHl0aWNzQWRhcHRlclxuICAgIEBuYW1lc3BhY2U6ICdhbGVwaGJldCdcblxuICAgIEBfdHJhY2s6IChjYXRlZ29yeSwgYWN0aW9uLCBsYWJlbCkgLT5cbiAgICAgIHV0aWxzLmxvZyhcIkdvb2dsZSBVbml2ZXJzYWwgQW5hbHl0aWNzIHRyYWNrOiAje2NhdGVnb3J5fSwgI3thY3Rpb259LCAje2xhYmVsfVwiKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdnYSBub3QgZGVmaW5lZC4gUGxlYXNlIG1ha2Ugc3VyZSB5b3VyIFVuaXZlcnNhbCBhbmFseXRpY3MgaXMgc2V0IHVwIGNvcnJlY3RseScpIGlmIHR5cGVvZiBnYSBpc250ICdmdW5jdGlvbidcbiAgICAgIGdhKCdzZW5kJywgJ2V2ZW50JywgY2F0ZWdvcnksIGFjdGlvbiwgbGFiZWwsIHsnbm9uSW50ZXJhY3Rpb24nOiAxfSlcblxuICAgIEBleHBlcmltZW50X3N0YXJ0OiAoZXhwZXJpbWVudCwgdmFyaWFudCkgLT5cbiAgICAgIEBfdHJhY2soQG5hbWVzcGFjZSwgXCIje2V4cGVyaW1lbnQubmFtZX0gfCAje3ZhcmlhbnR9XCIsICdWaXNpdG9ycycpXG5cbiAgICBAZ29hbF9jb21wbGV0ZTogKGV4cGVyaW1lbnQsIHZhcmlhbnQsIGdvYWxfbmFtZSwgX3Byb3BzKSAtPlxuICAgICAgQF90cmFjayhAbmFtZXNwYWNlLCBcIiN7ZXhwZXJpbWVudC5uYW1lfSB8ICN7dmFyaWFudH1cIiwgZ29hbF9uYW1lKVxuXG5cbiAgY2xhc3MgQExvY2FsU3RvcmFnZUFkYXB0ZXJcbiAgICBAbmFtZXNwYWNlOiAnYWxlcGhiZXQnXG4gICAgQHNldDogKGtleSwgdmFsdWUpIC0+XG4gICAgICBuZXcgU3RvcmFnZShAbmFtZXNwYWNlKS5zZXQoa2V5LCB2YWx1ZSlcbiAgICBAZ2V0OiAoa2V5KSAtPlxuICAgICAgbmV3IFN0b3JhZ2UoQG5hbWVzcGFjZSkuZ2V0KGtleSlcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEFkYXB0ZXJzXG4iLCJ1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKVxuYWRhcHRlcnMgPSByZXF1aXJlKCcuL2FkYXB0ZXJzJylcbm9wdGlvbnMgPSByZXF1aXJlKCcuL29wdGlvbnMnKVxuXG5jbGFzcyBBbGVwaEJldFxuICBAb3B0aW9ucyA9IG9wdGlvbnNcbiAgQHV0aWxzID0gdXRpbHNcblxuICBAR2ltZWxBZGFwdGVyID0gYWRhcHRlcnMuR2ltZWxBZGFwdGVyXG4gIEBQZXJzaXN0ZW50UXVldWVHb29nbGVBbmFseXRpY3NBZGFwdGVyID0gYWRhcHRlcnMuUGVyc2lzdGVudFF1ZXVlR29vZ2xlQW5hbHl0aWNzQWRhcHRlclxuICBAUGVyc2lzdGVudFF1ZXVlS2VlbkFkYXB0ZXIgPSBhZGFwdGVycy5QZXJzaXN0ZW50UXVldWVLZWVuQWRhcHRlclxuXG4gIGNsYXNzIEBFeHBlcmltZW50XG4gICAgQF9vcHRpb25zOlxuICAgICAgbmFtZTogbnVsbFxuICAgICAgdmFyaWFudHM6IG51bGxcbiAgICAgIHVzZXJfaWQ6IG51bGxcbiAgICAgIHNhbXBsZTogMS4wXG4gICAgICB0cmlnZ2VyOiAtPiB0cnVlXG4gICAgICB0cmFja2luZ19hZGFwdGVyOiBhZGFwdGVycy5Hb29nbGVVbml2ZXJzYWxBbmFseXRpY3NBZGFwdGVyXG4gICAgICBzdG9yYWdlX2FkYXB0ZXI6IGFkYXB0ZXJzLkxvY2FsU3RvcmFnZUFkYXB0ZXJcblxuICAgIGNvbnN0cnVjdG9yOiAoQG9wdGlvbnM9e30pIC0+XG4gICAgICB1dGlscy5kZWZhdWx0cyhAb3B0aW9ucywgRXhwZXJpbWVudC5fb3B0aW9ucylcbiAgICAgIF92YWxpZGF0ZS5jYWxsKHRoaXMpXG4gICAgICBAbmFtZSA9IEBvcHRpb25zLm5hbWVcbiAgICAgIEB2YXJpYW50cyA9IEBvcHRpb25zLnZhcmlhbnRzXG4gICAgICBAdXNlcl9pZCA9IEBvcHRpb25zLnVzZXJfaWRcbiAgICAgIEB2YXJpYW50X25hbWVzID0gdXRpbHMua2V5cyhAdmFyaWFudHMpXG4gICAgICBfcnVuLmNhbGwodGhpcylcblxuICAgIHJ1bjogLT5cbiAgICAgIHV0aWxzLmxvZyhcInJ1bm5pbmcgd2l0aCBvcHRpb25zOiAje0pTT04uc3RyaW5naWZ5KEBvcHRpb25zKX1cIilcbiAgICAgIGlmIHZhcmlhbnQgPSBAZ2V0X3N0b3JlZF92YXJpYW50KClcbiAgICAgICAgIyBhIHZhcmlhbnQgd2FzIGFscmVhZHkgY2hvc2VuLiBhY3RpdmF0ZSBpdFxuICAgICAgICB1dGlscy5sb2coXCIje3ZhcmlhbnR9IGFjdGl2ZVwiKVxuICAgICAgICBAYWN0aXZhdGVfdmFyaWFudCh2YXJpYW50KVxuICAgICAgZWxzZVxuICAgICAgICBAY29uZGl0aW9uYWxseV9hY3RpdmF0ZV92YXJpYW50KClcblxuICAgIF9ydW4gPSAtPiBAcnVuKClcblxuICAgIGFjdGl2YXRlX3ZhcmlhbnQ6ICh2YXJpYW50KSAtPlxuICAgICAgQHZhcmlhbnRzW3ZhcmlhbnRdPy5hY3RpdmF0ZSh0aGlzKVxuICAgICAgQHN0b3JhZ2UoKS5zZXQoXCIje0BvcHRpb25zLm5hbWV9OnZhcmlhbnRcIiwgdmFyaWFudClcblxuICAgICMgaWYgZXhwZXJpbWVudCBjb25kaXRpb25zIG1hdGNoLCBwaWNrIGFuZCBhY3RpdmF0ZSBhIHZhcmlhbnQsIHRyYWNrIGV4cGVyaW1lbnQgc3RhcnRcbiAgICBjb25kaXRpb25hbGx5X2FjdGl2YXRlX3ZhcmlhbnQ6IC0+XG4gICAgICByZXR1cm4gdW5sZXNzIEBvcHRpb25zLnRyaWdnZXIoKVxuICAgICAgdXRpbHMubG9nKCd0cmlnZ2VyIHNldCcpXG4gICAgICByZXR1cm4gdW5sZXNzIEBpbl9zYW1wbGUoKVxuICAgICAgdXRpbHMubG9nKCdpbiBzYW1wbGUnKVxuICAgICAgdmFyaWFudCA9IEBwaWNrX3ZhcmlhbnQoKVxuICAgICAgQHRyYWNraW5nKCkuZXhwZXJpbWVudF9zdGFydCh0aGlzLCB2YXJpYW50KVxuICAgICAgQGFjdGl2YXRlX3ZhcmlhbnQodmFyaWFudClcblxuICAgIGdvYWxfY29tcGxldGU6IChnb2FsX25hbWUsIHByb3BzPXt9KSAtPlxuICAgICAgdXRpbHMuZGVmYXVsdHMocHJvcHMsIHt1bmlxdWU6IHRydWV9KVxuICAgICAgcmV0dXJuIGlmIHByb3BzLnVuaXF1ZSAmJiBAc3RvcmFnZSgpLmdldChcIiN7QG9wdGlvbnMubmFtZX06I3tnb2FsX25hbWV9XCIpXG4gICAgICB2YXJpYW50ID0gQGdldF9zdG9yZWRfdmFyaWFudCgpXG4gICAgICByZXR1cm4gdW5sZXNzIHZhcmlhbnRcbiAgICAgIEBzdG9yYWdlKCkuc2V0KFwiI3tAb3B0aW9ucy5uYW1lfToje2dvYWxfbmFtZX1cIiwgdHJ1ZSkgaWYgcHJvcHMudW5pcXVlXG4gICAgICB1dGlscy5sb2coXCJleHBlcmltZW50OiAje0BvcHRpb25zLm5hbWV9IHZhcmlhbnQ6I3t2YXJpYW50fSBnb2FsOiN7Z29hbF9uYW1lfSBjb21wbGV0ZVwiKVxuICAgICAgQHRyYWNraW5nKCkuZ29hbF9jb21wbGV0ZSh0aGlzLCB2YXJpYW50LCBnb2FsX25hbWUsIHByb3BzKVxuXG4gICAgZ2V0X3N0b3JlZF92YXJpYW50OiAtPlxuICAgICAgQHN0b3JhZ2UoKS5nZXQoXCIje0BvcHRpb25zLm5hbWV9OnZhcmlhbnRcIilcblxuICAgIHBpY2tfdmFyaWFudDogLT5cbiAgICAgIGFsbF92YXJpYW50c19oYXZlX3dlaWdodHMgPSB1dGlscy5jaGVja193ZWlnaHRzKEB2YXJpYW50cylcbiAgICAgIHV0aWxzLmxvZyhcImFsbCB2YXJpYW50cyBoYXZlIHdlaWdodHM6ICN7YWxsX3ZhcmlhbnRzX2hhdmVfd2VpZ2h0c31cIilcbiAgICAgIGlmIGFsbF92YXJpYW50c19oYXZlX3dlaWdodHMgdGhlbiBAcGlja193ZWlnaHRlZF92YXJpYW50KCkgZWxzZSBAcGlja191bndlaWdodGVkX3ZhcmlhbnQoKVxuXG4gICAgcGlja193ZWlnaHRlZF92YXJpYW50OiAtPlxuXG4gICAgICAjIENob29zaW5nIGEgd2VpZ2h0ZWQgdmFyaWFudDpcbiAgICAgICMgRm9yIEEsIEIsIEMgd2l0aCB3ZWlnaHRzIDEsIDMsIDZcbiAgICAgICMgdmFyaWFudHMgPSBBLCBCLCBDXG4gICAgICAjIHdlaWdodHMgPSAxLCAzLCA2XG4gICAgICAjIHdlaWdodHNfc3VtID0gMTAgKHN1bSBvZiB3ZWlnaHRzKVxuICAgICAgIyB3ZWlnaHRlZF9pbmRleCA9IDIuMSAocmFuZG9tIG51bWJlciBiZXR3ZWVuIDAgYW5kIHdlaWdodCBzdW0pXG4gICAgICAjIEFCQkJDQ0NDQ0NcbiAgICAgICMgPT1eXG4gICAgICAjIFNlbGVjdCBCXG4gICAgICB3ZWlnaHRzX3N1bSA9IHV0aWxzLnN1bV93ZWlnaHRzKEB2YXJpYW50cylcbiAgICAgIHdlaWdodGVkX2luZGV4ID0gTWF0aC5jZWlsKChAX3JhbmRvbSgndmFyaWFudCcpICogd2VpZ2h0c19zdW0pKVxuICAgICAgZm9yIGtleSwgdmFsdWUgb2YgQHZhcmlhbnRzXG4gICAgICAgICMgdGhlbiB3ZSBhcmUgc3Vic3RyYWN0aW5nIHZhcmlhbnQgd2VpZ2h0IGZyb20gc2VsZWN0ZWQgbnVtYmVyXG4gICAgICAgICMgYW5kIGl0IGl0IHJlYWNoZXMgMCAob3IgYmVsb3cpIHdlIGFyZSBzZWxlY3RpbmcgdGhpcyB2YXJpYW50XG4gICAgICAgIHdlaWdodGVkX2luZGV4IC09IHZhbHVlLndlaWdodFxuICAgICAgICByZXR1cm4ga2V5IGlmIHdlaWdodGVkX2luZGV4IDw9IDBcblxuICAgIHBpY2tfdW53ZWlnaHRlZF92YXJpYW50OiAtPlxuICAgICAgcGFydGl0aW9ucyA9IDEuMCAvIEB2YXJpYW50X25hbWVzLmxlbmd0aFxuICAgICAgY2hvc2VuX3BhcnRpdGlvbiA9IE1hdGguZmxvb3IoQF9yYW5kb20oJ3ZhcmlhbnQnKSAvIHBhcnRpdGlvbnMpXG4gICAgICB2YXJpYW50ID0gQHZhcmlhbnRfbmFtZXNbY2hvc2VuX3BhcnRpdGlvbl1cbiAgICAgIHV0aWxzLmxvZyhcIiN7dmFyaWFudH0gcGlja2VkXCIpXG4gICAgICB2YXJpYW50XG5cbiAgICBpbl9zYW1wbGU6IC0+XG4gICAgICBhY3RpdmUgPSBAc3RvcmFnZSgpLmdldChcIiN7QG9wdGlvbnMubmFtZX06aW5fc2FtcGxlXCIpXG4gICAgICByZXR1cm4gYWN0aXZlIHVubGVzcyB0eXBlb2YgYWN0aXZlIGlzICd1bmRlZmluZWQnXG4gICAgICBhY3RpdmUgPSBAX3JhbmRvbSgnc2FtcGxlJykgPD0gQG9wdGlvbnMuc2FtcGxlXG4gICAgICBAc3RvcmFnZSgpLnNldChcIiN7QG9wdGlvbnMubmFtZX06aW5fc2FtcGxlXCIsIGFjdGl2ZSlcbiAgICAgIGFjdGl2ZVxuXG4gICAgX3JhbmRvbTogKHNhbHQpIC0+XG4gICAgICByZXR1cm4gdXRpbHMucmFuZG9tKCkgdW5sZXNzIEB1c2VyX2lkXG4gICAgICBzZWVkID0gXCIje0BuYW1lfS4je3NhbHR9LiN7QHVzZXJfaWR9XCJcbiAgICAgIHV0aWxzLnJhbmRvbShzZWVkKVxuXG4gICAgYWRkX2dvYWw6IChnb2FsKSAtPlxuICAgICAgZ29hbC5hZGRfZXhwZXJpbWVudCh0aGlzKVxuXG4gICAgYWRkX2dvYWxzOiAoZ29hbHMpIC0+XG4gICAgICBAYWRkX2dvYWwoZ29hbCkgZm9yIGdvYWwgaW4gZ29hbHNcblxuICAgIHN0b3JhZ2U6IC0+IEBvcHRpb25zLnN0b3JhZ2VfYWRhcHRlclxuXG4gICAgdHJhY2tpbmc6IC0+IEBvcHRpb25zLnRyYWNraW5nX2FkYXB0ZXJcblxuICAgIF92YWxpZGF0ZSA9IC0+XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2FuIGV4cGVyaW1lbnQgbmFtZSBtdXN0IGJlIHNwZWNpZmllZCcpIGlmIEBvcHRpb25zLm5hbWUgaXMgbnVsbFxuICAgICAgdGhyb3cgbmV3IEVycm9yKCd2YXJpYW50cyBtdXN0IGJlIHByb3ZpZGVkJykgaWYgQG9wdGlvbnMudmFyaWFudHMgaXMgbnVsbFxuICAgICAgdGhyb3cgbmV3IEVycm9yKCd0cmlnZ2VyIG11c3QgYmUgYSBmdW5jdGlvbicpIGlmIHR5cGVvZiBAb3B0aW9ucy50cmlnZ2VyIGlzbnQgJ2Z1bmN0aW9uJ1xuICAgICAgYWxsX3ZhcmlhbnRzX2hhdmVfd2VpZ2h0cyA9IHV0aWxzLnZhbGlkYXRlX3dlaWdodHMgQG9wdGlvbnMudmFyaWFudHNcbiAgICAgIHRocm93IG5ldyBFcnJvcignbm90IGFsbCB2YXJpYW50cyBoYXZlIHdlaWdodHMnKSBpZiAhYWxsX3ZhcmlhbnRzX2hhdmVfd2VpZ2h0c1xuXG4gIGNsYXNzIEBHb2FsXG4gICAgY29uc3RydWN0b3I6IChAbmFtZSwgQHByb3BzPXt9KSAtPlxuICAgICAgdXRpbHMuZGVmYXVsdHMoQHByb3BzLCB7dW5pcXVlOiB0cnVlfSlcbiAgICAgIEBleHBlcmltZW50cyA9IFtdXG5cbiAgICBhZGRfZXhwZXJpbWVudDogKGV4cGVyaW1lbnQpIC0+XG4gICAgICBAZXhwZXJpbWVudHMucHVzaChleHBlcmltZW50KVxuXG4gICAgYWRkX2V4cGVyaW1lbnRzOiAoZXhwZXJpbWVudHMpIC0+XG4gICAgICBAYWRkX2V4cGVyaW1lbnQoZXhwZXJpbWVudCkgZm9yIGV4cGVyaW1lbnQgaW4gZXhwZXJpbWVudHNcblxuICAgIGNvbXBsZXRlOiAtPlxuICAgICAgZm9yIGV4cGVyaW1lbnQgaW4gQGV4cGVyaW1lbnRzXG4gICAgICAgIGV4cGVyaW1lbnQuZ29hbF9jb21wbGV0ZShAbmFtZSwgQHByb3BzKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gQWxlcGhCZXRcbiIsIm1vZHVsZS5leHBvcnRzID1cbiAgZGVidWc6IGZhbHNlXG4iLCJCYXNpbCA9IHJlcXVpcmUoJ2Jhc2lsLmpzJylcbnN0b3JlID0gbmV3IEJhc2lsKG5hbWVzcGFjZTogbnVsbClcblxuIyBhIHRoaW4gd3JhcHBlciBhcm91bmQgYmFzaWwuanMgZm9yIGVhc3kgc3dhcHBpbmdcbmNsYXNzIFN0b3JhZ2VcbiAgY29uc3RydWN0b3I6IChAbmFtZXNwYWNlPSdhbGVwaGJldCcpIC0+XG4gICAgQHN0b3JhZ2UgPSBzdG9yZS5nZXQoQG5hbWVzcGFjZSkgfHwge31cbiAgc2V0OiAoa2V5LCB2YWx1ZSkgLT5cbiAgICBAc3RvcmFnZVtrZXldID0gdmFsdWVcbiAgICBzdG9yZS5zZXQoQG5hbWVzcGFjZSwgQHN0b3JhZ2UpXG4gICAgcmV0dXJuIHZhbHVlXG4gIGdldDogKGtleSkgLT5cbiAgICBAc3RvcmFnZVtrZXldXG4gICAgIyBzdG9yZS5nZXQoXCIje0BuYW1lc3BhY2V9OiN7a2V5fVwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFN0b3JhZ2VcbiIsIiMgTk9URTogdXNpbmcgYSBjdXN0b20gYnVpbGQgb2YgbG9kYXNoLCB0byBzYXZlIHNwYWNlXG5fID0gcmVxdWlyZSgnLi4vdmVuZG9yL2xvZGFzaC5jdXN0b20ubWluJylcbnV1aWQgPSByZXF1aXJlKCdub2RlLXV1aWQnKVxuc2hhMSA9IHJlcXVpcmUoJ2NyeXB0by1qcy9zaGExJylcbm9wdGlvbnMgPSByZXF1aXJlKCcuL29wdGlvbnMnKVxuXG5jbGFzcyBVdGlsc1xuICBAZGVmYXVsdHM6IF8uZGVmYXVsdHNcbiAgQGtleXM6IF8ua2V5c1xuICBAcmVtb3ZlOiBfLnJlbW92ZVxuICBAb21pdDogXy5vbWl0XG4gIEBsb2c6IChtZXNzYWdlKSAtPlxuICAgIGNvbnNvbGUubG9nKG1lc3NhZ2UpIGlmIG9wdGlvbnMuZGVidWdcbiAgQHV1aWQ6IHV1aWQudjRcbiAgQHNoYTE6ICh0ZXh0KSAtPlxuICAgIHNoYTEodGV4dCkudG9TdHJpbmcoKVxuICBAcmFuZG9tOiAoc2VlZCkgLT5cbiAgICByZXR1cm4gTWF0aC5yYW5kb20oKSB1bmxlc3Mgc2VlZFxuICAgICMgYSBNVUNIIHNpbXBsaWZpZWQgdmVyc2lvbiBpbnNwaXJlZCBieSBQbGFuT3V0LmpzXG4gICAgcGFyc2VJbnQoQHNoYTEoc2VlZCkuc3Vic3RyKDAsIDEzKSwgMTYpIC8gMHhGRkZGRkZGRkZGRkZGXG4gIEBjaGVja193ZWlnaHRzOiAodmFyaWFudHMpIC0+XG4gICAgY29udGFpbnNfd2VpZ2h0ID0gW11cbiAgICBjb250YWluc193ZWlnaHQucHVzaCh2YWx1ZS53ZWlnaHQ/KSBmb3Iga2V5LCB2YWx1ZSBvZiB2YXJpYW50c1xuICAgIGNvbnRhaW5zX3dlaWdodC5ldmVyeSAoaGFzX3dlaWdodCkgLT4gaGFzX3dlaWdodFxuICBAc3VtX3dlaWdodHM6ICh2YXJpYW50cykgLT5cbiAgICBzdW0gPSAwXG4gICAgZm9yIGtleSwgdmFsdWUgb2YgdmFyaWFudHNcbiAgICAgIHN1bSArPSB2YWx1ZS53ZWlnaHQgfHwgMFxuICAgIHN1bVxuICBAdmFsaWRhdGVfd2VpZ2h0czogKHZhcmlhbnRzKSAtPlxuICAgIGNvbnRhaW5zX3dlaWdodCA9IFtdXG4gICAgY29udGFpbnNfd2VpZ2h0LnB1c2godmFsdWUud2VpZ2h0PykgZm9yIGtleSwgdmFsdWUgb2YgdmFyaWFudHNcbiAgICBjb250YWluc193ZWlnaHQuZXZlcnkgKGhhc193ZWlnaHQpIC0+IGhhc193ZWlnaHQgb3IgY29udGFpbnNfd2VpZ2h0LmV2ZXJ5IChoYXNfd2VpZ2h0KSAtPiAhaGFzX3dlaWdodFxubW9kdWxlLmV4cG9ydHMgPSBVdGlsc1xuIiwiLyoqXG4gKiBAbGljZW5zZVxuICogTG9kYXNoIChDdXN0b20gQnVpbGQpIGxvZGFzaC5jb20vbGljZW5zZSB8IFVuZGVyc2NvcmUuanMgMS44LjMgdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFXG4gKiBCdWlsZDogYGxvZGFzaCAtcCBpbmNsdWRlPVwia2V5cyxkZWZhdWx0cyxyZW1vdmUsb21pdFwiIGV4cG9ydHM9XCJub2RlXCIgLW8gLi92ZW5kb3IvbG9kYXNoLmN1c3RvbS5taW4uanNgXG4gKi9cbjsoZnVuY3Rpb24oKXtmdW5jdGlvbiB0KHQscixuKXtzd2l0Y2gobi5sZW5ndGgpe2Nhc2UgMDpyZXR1cm4gdC5jYWxsKHIpO2Nhc2UgMTpyZXR1cm4gdC5jYWxsKHIsblswXSk7Y2FzZSAyOnJldHVybiB0LmNhbGwocixuWzBdLG5bMV0pO2Nhc2UgMzpyZXR1cm4gdC5jYWxsKHIsblswXSxuWzFdLG5bMl0pfXJldHVybiB0LmFwcGx5KHIsbil9ZnVuY3Rpb24gcih0LHIpe2Zvcih2YXIgbj0tMSxlPW51bGw9PXQ/MDp0Lmxlbmd0aDsrK248ZSYmcih0W25dLG4sdCkhPT1mYWxzZTspO3JldHVybiB0fWZ1bmN0aW9uIG4odCxyKXtmb3IodmFyIG49LTEsZT1udWxsPT10PzA6dC5sZW5ndGgsdT0wLG89W107KytuPGU7KXt2YXIgaT10W25dO3IoaSxuLHQpJiYob1t1KytdPWkpfXJldHVybiBvfWZ1bmN0aW9uIGUodCxyKXtmb3IodmFyIG49LTEsZT1udWxsPT10PzA6dC5sZW5ndGgsdT1BcnJheShlKTsrK248ZTspdVtuXT1yKHRbbl0sbix0KTtyZXR1cm4gdX1mdW5jdGlvbiB1KHQscil7Zm9yKHZhciBuPS0xLGU9ci5sZW5ndGgsdT10Lmxlbmd0aDsrK248ZTspdFt1K25dPXJbbl07XG5yZXR1cm4gdH1mdW5jdGlvbiBvKHQscil7Zm9yKHZhciBuPS0xLGU9bnVsbD09dD8wOnQubGVuZ3RoOysrbjxlOylpZihyKHRbbl0sbix0KSlyZXR1cm4gdHJ1ZTtyZXR1cm4gZmFsc2V9ZnVuY3Rpb24gaSh0KXtyZXR1cm4gZnVuY3Rpb24ocil7cmV0dXJuIG51bGw9PXI/THI6clt0XX19ZnVuY3Rpb24gYyh0LHIpe2Zvcih2YXIgbj0tMSxlPUFycmF5KHQpOysrbjx0OyllW25dPXIobik7cmV0dXJuIGV9ZnVuY3Rpb24gYSh0KXtyZXR1cm4gZnVuY3Rpb24ocil7cmV0dXJuIHQocil9fWZ1bmN0aW9uIGYodCxyKXtyZXR1cm4gdC5oYXMocil9ZnVuY3Rpb24gbCh0LHIpe3JldHVybiBudWxsPT10P0xyOnRbcl19ZnVuY3Rpb24gcyh0KXt2YXIgcj0tMSxuPUFycmF5KHQuc2l6ZSk7cmV0dXJuIHQuZm9yRWFjaChmdW5jdGlvbih0LGUpe25bKytyXT1bZSx0XX0pLG59ZnVuY3Rpb24gaCh0LHIpe3JldHVybiBmdW5jdGlvbihuKXtyZXR1cm4gdChyKG4pKX19ZnVuY3Rpb24gcCh0KXt2YXIgcj0tMSxuPUFycmF5KHQuc2l6ZSk7XG5yZXR1cm4gdC5mb3JFYWNoKGZ1bmN0aW9uKHQpe25bKytyXT10fSksbn1mdW5jdGlvbiB2KCl7fWZ1bmN0aW9uIHkodCl7dmFyIHI9LTEsbj1udWxsPT10PzA6dC5sZW5ndGg7Zm9yKHRoaXMuY2xlYXIoKTsrK3I8bjspe3ZhciBlPXRbcl07dGhpcy5zZXQoZVswXSxlWzFdKX19ZnVuY3Rpb24gYigpe3RoaXMuX19kYXRhX189bWU/bWUobnVsbCk6e30sdGhpcy5zaXplPTB9ZnVuY3Rpb24gXyh0KXt2YXIgcj10aGlzLmhhcyh0KSYmZGVsZXRlIHRoaXMuX19kYXRhX19bdF07cmV0dXJuIHRoaXMuc2l6ZS09cj8xOjAscn1mdW5jdGlvbiBnKHQpe3ZhciByPXRoaXMuX19kYXRhX187aWYobWUpe3ZhciBuPXJbdF07cmV0dXJuIG49PT1Ucj9McjpufXJldHVybiBYbi5jYWxsKHIsdCk/clt0XTpMcn1mdW5jdGlvbiBkKHQpe3ZhciByPXRoaXMuX19kYXRhX187cmV0dXJuIG1lP3JbdF0hPT1McjpYbi5jYWxsKHIsdCl9ZnVuY3Rpb24gaih0LHIpe3ZhciBuPXRoaXMuX19kYXRhX187cmV0dXJuIHRoaXMuc2l6ZSs9dGhpcy5oYXModCk/MDoxLFxublt0XT1tZSYmcj09PUxyP1RyOnIsdGhpc31mdW5jdGlvbiB3KHQpe3ZhciByPS0xLG49bnVsbD09dD8wOnQubGVuZ3RoO2Zvcih0aGlzLmNsZWFyKCk7KytyPG47KXt2YXIgZT10W3JdO3RoaXMuc2V0KGVbMF0sZVsxXSl9fWZ1bmN0aW9uIE8oKXt0aGlzLl9fZGF0YV9fPVtdLHRoaXMuc2l6ZT0wfWZ1bmN0aW9uIG0odCl7dmFyIHI9dGhpcy5fX2RhdGFfXyxuPVcocix0KTtyZXR1cm4hKG48MCkmJihuPT1yLmxlbmd0aC0xP3IucG9wKCk6ZmUuY2FsbChyLG4sMSksLS10aGlzLnNpemUsdHJ1ZSl9ZnVuY3Rpb24gQSh0KXt2YXIgcj10aGlzLl9fZGF0YV9fLG49VyhyLHQpO3JldHVybiBuPDA/THI6cltuXVsxXX1mdW5jdGlvbiB6KHQpe3JldHVybiBXKHRoaXMuX19kYXRhX18sdCk+LTF9ZnVuY3Rpb24gUyh0LHIpe3ZhciBuPXRoaXMuX19kYXRhX18sZT1XKG4sdCk7cmV0dXJuIGU8MD8oKyt0aGlzLnNpemUsbi5wdXNoKFt0LHJdKSk6bltlXVsxXT1yLHRoaXN9ZnVuY3Rpb24geCh0KXtcbnZhciByPS0xLG49bnVsbD09dD8wOnQubGVuZ3RoO2Zvcih0aGlzLmNsZWFyKCk7KytyPG47KXt2YXIgZT10W3JdO3RoaXMuc2V0KGVbMF0sZVsxXSl9fWZ1bmN0aW9uIGsoKXt0aGlzLnNpemU9MCx0aGlzLl9fZGF0YV9fPXtoYXNoOm5ldyB5LG1hcDpuZXcoZGV8fHcpLHN0cmluZzpuZXcgeX19ZnVuY3Rpb24gRSh0KXt2YXIgcj1CdCh0aGlzLHQpLmRlbGV0ZSh0KTtyZXR1cm4gdGhpcy5zaXplLT1yPzE6MCxyfWZ1bmN0aW9uICQodCl7cmV0dXJuIEJ0KHRoaXMsdCkuZ2V0KHQpfWZ1bmN0aW9uIEkodCl7cmV0dXJuIEJ0KHRoaXMsdCkuaGFzKHQpfWZ1bmN0aW9uIEwodCxyKXt2YXIgbj1CdCh0aGlzLHQpLGU9bi5zaXplO3JldHVybiBuLnNldCh0LHIpLHRoaXMuc2l6ZSs9bi5zaXplPT1lPzA6MSx0aGlzfWZ1bmN0aW9uIFAodCl7dmFyIHI9LTEsbj1udWxsPT10PzA6dC5sZW5ndGg7Zm9yKHRoaXMuX19kYXRhX189bmV3IHg7KytyPG47KXRoaXMuYWRkKHRbcl0pfWZ1bmN0aW9uIEYodCl7XG5yZXR1cm4gdGhpcy5fX2RhdGFfXy5zZXQodCxUciksdGhpc31mdW5jdGlvbiBNKHQpe3JldHVybiB0aGlzLl9fZGF0YV9fLmhhcyh0KX1mdW5jdGlvbiBUKHQpe3RoaXMuc2l6ZT0odGhpcy5fX2RhdGFfXz1uZXcgdyh0KSkuc2l6ZX1mdW5jdGlvbiBVKCl7dGhpcy5fX2RhdGFfXz1uZXcgdyx0aGlzLnNpemU9MH1mdW5jdGlvbiBCKHQpe3ZhciByPXRoaXMuX19kYXRhX18sbj1yLmRlbGV0ZSh0KTtyZXR1cm4gdGhpcy5zaXplPXIuc2l6ZSxufWZ1bmN0aW9uIEModCl7cmV0dXJuIHRoaXMuX19kYXRhX18uZ2V0KHQpfWZ1bmN0aW9uIEQodCl7cmV0dXJuIHRoaXMuX19kYXRhX18uaGFzKHQpfWZ1bmN0aW9uIFIodCxyKXt2YXIgbj10aGlzLl9fZGF0YV9fO2lmKG4gaW5zdGFuY2VvZiB3KXt2YXIgZT1uLl9fZGF0YV9fO2lmKCFkZXx8ZS5sZW5ndGg8RnItMSlyZXR1cm4gZS5wdXNoKFt0LHJdKSx0aGlzLnNpemU9KytuLnNpemUsdGhpcztuPXRoaXMuX19kYXRhX189bmV3IHgoZSl9cmV0dXJuIG4uc2V0KHQsciksXG50aGlzLnNpemU9bi5zaXplLHRoaXN9ZnVuY3Rpb24gTih0LHIpe3ZhciBuPURlKHQpLGU9IW4mJkNlKHQpLHU9IW4mJiFlJiZSZSh0KSxvPSFuJiYhZSYmIXUmJldlKHQpLGk9bnx8ZXx8dXx8byxhPWk/Yyh0Lmxlbmd0aCxTdHJpbmcpOltdLGY9YS5sZW5ndGg7Zm9yKHZhciBsIGluIHQpIXImJiFYbi5jYWxsKHQsbCl8fGkmJihcImxlbmd0aFwiPT1sfHx1JiYoXCJvZmZzZXRcIj09bHx8XCJwYXJlbnRcIj09bCl8fG8mJihcImJ1ZmZlclwiPT1sfHxcImJ5dGVMZW5ndGhcIj09bHx8XCJieXRlT2Zmc2V0XCI9PWwpfHxIdChsLGYpKXx8YS5wdXNoKGwpO3JldHVybiBhfWZ1bmN0aW9uIFYodCxyLG4pe3ZhciBlPXRbcl07WG4uY2FsbCh0LHIpJiZwcihlLG4pJiYobiE9PUxyfHxyIGluIHQpfHxIKHQscixuKX1mdW5jdGlvbiBXKHQscil7Zm9yKHZhciBuPXQubGVuZ3RoO24tLTspaWYocHIodFtuXVswXSxyKSlyZXR1cm4gbjtyZXR1cm4tMX1mdW5jdGlvbiBxKHQscil7cmV0dXJuIHQmJnh0KHIsQXIociksdCk7XG59ZnVuY3Rpb24gRyh0LHIpe3JldHVybiB0JiZ4dChyLHpyKHIpLHQpfWZ1bmN0aW9uIEgodCxyLG4pe1wiX19wcm90b19fXCI9PXImJmhlP2hlKHQscix7Y29uZmlndXJhYmxlOnRydWUsZW51bWVyYWJsZTp0cnVlLHZhbHVlOm4sd3JpdGFibGU6dHJ1ZX0pOnRbcl09bn1mdW5jdGlvbiBKKHQsbixlLHUsbyxpKXt2YXIgYyxhPW4mQnIsZj1uJkNyLGw9biZEcjtpZihlJiYoYz1vP2UodCx1LG8saSk6ZSh0KSksYyE9PUxyKXJldHVybiBjO2lmKCFfcih0KSlyZXR1cm4gdDt2YXIgcz1EZSh0KTtpZihzKXtpZihjPVZ0KHQpLCFhKXJldHVybiBTdCh0LGMpfWVsc2V7dmFyIGg9VGUodCkscD1oPT1acnx8aD09dG47aWYoUmUodCkpcmV0dXJuIGp0KHQsYSk7aWYoaD09dW58fGg9PUhyfHxwJiYhbyl7aWYoYz1mfHxwP3t9Old0KHQpLCFhKXJldHVybiBmP0V0KHQsRyhjLHQpKTprdCh0LHEoYyx0KSl9ZWxzZXtpZighRm5baF0pcmV0dXJuIG8/dDp7fTtjPXF0KHQsaCxhKX19aXx8KGk9bmV3IFQpO3ZhciB2PWkuZ2V0KHQpO1xuaWYodilyZXR1cm4gdjtpZihpLnNldCh0LGMpLFZlKHQpKXJldHVybiB0LmZvckVhY2goZnVuY3Rpb24ocil7Yy5hZGQoSihyLG4sZSxyLHQsaSkpfSksYztpZihOZSh0KSlyZXR1cm4gdC5mb3JFYWNoKGZ1bmN0aW9uKHIsdSl7Yy5zZXQodSxKKHIsbixlLHUsdCxpKSl9KSxjO3ZhciB5PWw/Zj9UdDpNdDpmP3pyOkFyLGI9cz9Mcjp5KHQpO3JldHVybiByKGJ8fHQsZnVuY3Rpb24ocix1KXtiJiYodT1yLHI9dFt1XSksVihjLHUsSihyLG4sZSx1LHQsaSkpfSksY31mdW5jdGlvbiBLKHQscixuLGUsbyl7dmFyIGk9LTEsYz10Lmxlbmd0aDtmb3Iobnx8KG49R3QpLG98fChvPVtdKTsrK2k8Yzspe3ZhciBhPXRbaV07cj4wJiZuKGEpP3I+MT9LKGEsci0xLG4sZSxvKTp1KG8sYSk6ZXx8KG9bby5sZW5ndGhdPWEpfXJldHVybiBvfWZ1bmN0aW9uIFEodCxyKXtyPWR0KHIsdCk7Zm9yKHZhciBuPTAsZT1yLmxlbmd0aDtudWxsIT10JiZuPGU7KXQ9dFtjcihyW24rK10pXTtyZXR1cm4gbiYmbj09ZT90OkxyO1xufWZ1bmN0aW9uIFgodCxyLG4pe3ZhciBlPXIodCk7cmV0dXJuIERlKHQpP2U6dShlLG4odCkpfWZ1bmN0aW9uIFkodCl7cmV0dXJuIG51bGw9PXQ/dD09PUxyP2huOmVuOnNlJiZzZSBpbiBPYmplY3QodCk/UnQodCk6ZXIodCl9ZnVuY3Rpb24gWih0LHIpe3JldHVybiBudWxsIT10JiZyIGluIE9iamVjdCh0KX1mdW5jdGlvbiB0dCh0KXtyZXR1cm4gZ3IodCkmJlkodCk9PUhyfWZ1bmN0aW9uIHJ0KHQscixuLGUsdSl7cmV0dXJuIHQ9PT1yfHwobnVsbD09dHx8bnVsbD09cnx8IWdyKHQpJiYhZ3Iocik/dCE9PXQmJnIhPT1yOm50KHQscixuLGUscnQsdSkpfWZ1bmN0aW9uIG50KHQscixuLGUsdSxvKXt2YXIgaT1EZSh0KSxjPURlKHIpLGE9aT9KcjpUZSh0KSxmPWM/SnI6VGUocik7YT1hPT1Icj91bjphLGY9Zj09SHI/dW46Zjt2YXIgbD1hPT11bixzPWY9PXVuLGg9YT09ZjtpZihoJiZSZSh0KSl7aWYoIVJlKHIpKXJldHVybiBmYWxzZTtpPXRydWUsbD1mYWxzZX1pZihoJiYhbClyZXR1cm4gb3x8KG89bmV3IFQpLFxuaXx8V2UodCk/SXQodCxyLG4sZSx1LG8pOkx0KHQscixhLG4sZSx1LG8pO2lmKCEobiZScikpe3ZhciBwPWwmJlhuLmNhbGwodCxcIl9fd3JhcHBlZF9fXCIpLHY9cyYmWG4uY2FsbChyLFwiX193cmFwcGVkX19cIik7aWYocHx8dil7dmFyIHk9cD90LnZhbHVlKCk6dCxiPXY/ci52YWx1ZSgpOnI7cmV0dXJuIG98fChvPW5ldyBUKSx1KHksYixuLGUsbyl9fXJldHVybiEhaCYmKG98fChvPW5ldyBUKSxQdCh0LHIsbixlLHUsbykpfWZ1bmN0aW9uIGV0KHQpe3JldHVybiBncih0KSYmVGUodCk9PXJufWZ1bmN0aW9uIHV0KHQscixuLGUpe3ZhciB1PW4ubGVuZ3RoLG89dSxpPSFlO2lmKG51bGw9PXQpcmV0dXJuIW87Zm9yKHQ9T2JqZWN0KHQpO3UtLTspe3ZhciBjPW5bdV07aWYoaSYmY1syXT9jWzFdIT09dFtjWzBdXTohKGNbMF1pbiB0KSlyZXR1cm4gZmFsc2V9Zm9yKDsrK3U8bzspe2M9blt1XTt2YXIgYT1jWzBdLGY9dFthXSxsPWNbMV07aWYoaSYmY1syXSl7aWYoZj09PUxyJiYhKGEgaW4gdCkpcmV0dXJuIGZhbHNlO1xufWVsc2V7dmFyIHM9bmV3IFQ7aWYoZSl2YXIgaD1lKGYsbCxhLHQscixzKTtpZighKGg9PT1Mcj9ydChsLGYsUnJ8TnIsZSxzKTpoKSlyZXR1cm4gZmFsc2V9fXJldHVybiB0cnVlfWZ1bmN0aW9uIG90KHQpe3JldHVybiEoIV9yKHQpfHxYdCh0KSkmJih5cih0KT9yZTpJbikudGVzdChhcih0KSl9ZnVuY3Rpb24gaXQodCl7cmV0dXJuIGdyKHQpJiZUZSh0KT09Zm59ZnVuY3Rpb24gY3QodCl7cmV0dXJuIGdyKHQpJiZicih0Lmxlbmd0aCkmJiEhUG5bWSh0KV19ZnVuY3Rpb24gYXQodCl7cmV0dXJuIHR5cGVvZiB0PT1cImZ1bmN0aW9uXCI/dDpudWxsPT10P3hyOnR5cGVvZiB0PT1cIm9iamVjdFwiP0RlKHQpP2h0KHRbMF0sdFsxXSk6c3QodCk6RXIodCl9ZnVuY3Rpb24gZnQodCl7aWYoIVl0KHQpKXJldHVybiB5ZSh0KTt2YXIgcj1bXTtmb3IodmFyIG4gaW4gT2JqZWN0KHQpKVhuLmNhbGwodCxuKSYmXCJjb25zdHJ1Y3RvclwiIT1uJiZyLnB1c2gobik7cmV0dXJuIHJ9ZnVuY3Rpb24gbHQodCl7aWYoIV9yKHQpKXJldHVybiBucih0KTtcbnZhciByPVl0KHQpLG49W107Zm9yKHZhciBlIGluIHQpKFwiY29uc3RydWN0b3JcIiE9ZXx8IXImJlhuLmNhbGwodCxlKSkmJm4ucHVzaChlKTtyZXR1cm4gbn1mdW5jdGlvbiBzdCh0KXt2YXIgcj1DdCh0KTtyZXR1cm4gMT09ci5sZW5ndGgmJnJbMF1bMl0/dHIoclswXVswXSxyWzBdWzFdKTpmdW5jdGlvbihuKXtyZXR1cm4gbj09PXR8fHV0KG4sdCxyKX19ZnVuY3Rpb24gaHQodCxyKXtyZXR1cm4gS3QodCkmJlp0KHIpP3RyKGNyKHQpLHIpOmZ1bmN0aW9uKG4pe3ZhciBlPU9yKG4sdCk7cmV0dXJuIGU9PT1MciYmZT09PXI/bXIobix0KTpydChyLGUsUnJ8TnIpfX1mdW5jdGlvbiBwdCh0KXtyZXR1cm4gZnVuY3Rpb24ocil7cmV0dXJuIFEocix0KX19ZnVuY3Rpb24gdnQodCxyKXtmb3IodmFyIG49dD9yLmxlbmd0aDowLGU9bi0xO24tLTspe3ZhciB1PXJbbl07aWYobj09ZXx8dSE9PW8pe3ZhciBvPXU7SHQodSk/ZmUuY2FsbCh0LHUsMSk6Z3QodCx1KX19cmV0dXJuIHR9ZnVuY3Rpb24geXQodCxyKXtcbnJldHVybiBVZSh1cih0LHIseHIpLHQrXCJcIil9ZnVuY3Rpb24gYnQodCxyLG4pe3ZhciBlPS0xLHU9dC5sZW5ndGg7cjwwJiYocj0tcj51PzA6dStyKSxuPW4+dT91Om4sbjwwJiYobis9dSksdT1yPm4/MDpuLXI+Pj4wLHI+Pj49MDtmb3IodmFyIG89QXJyYXkodSk7KytlPHU7KW9bZV09dFtlK3JdO3JldHVybiBvfWZ1bmN0aW9uIF90KHQpe2lmKHR5cGVvZiB0PT1cInN0cmluZ1wiKXJldHVybiB0O2lmKERlKHQpKXJldHVybiBlKHQsX3QpK1wiXCI7aWYoanIodCkpcmV0dXJuIEllP0llLmNhbGwodCk6XCJcIjt2YXIgcj10K1wiXCI7cmV0dXJuXCIwXCI9PXImJjEvdD09LXFyP1wiLTBcIjpyfWZ1bmN0aW9uIGd0KHQscil7cmV0dXJuIHI9ZHQocix0KSx0PW9yKHQsciksbnVsbD09dHx8ZGVsZXRlIHRbY3IobHIocikpXX1mdW5jdGlvbiBkdCh0LHIpe3JldHVybiBEZSh0KT90Okt0KHQscik/W3RdOkJlKHdyKHQpKX1mdW5jdGlvbiBqdCh0LHIpe2lmKHIpcmV0dXJuIHQuc2xpY2UoKTt2YXIgbj10Lmxlbmd0aCxlPW9lP29lKG4pOm5ldyB0LmNvbnN0cnVjdG9yKG4pO1xucmV0dXJuIHQuY29weShlKSxlfWZ1bmN0aW9uIHd0KHQpe3ZhciByPW5ldyB0LmNvbnN0cnVjdG9yKHQuYnl0ZUxlbmd0aCk7cmV0dXJuIG5ldyB1ZShyKS5zZXQobmV3IHVlKHQpKSxyfWZ1bmN0aW9uIE90KHQscil7cmV0dXJuIG5ldyB0LmNvbnN0cnVjdG9yKHI/d3QodC5idWZmZXIpOnQuYnVmZmVyLHQuYnl0ZU9mZnNldCx0LmJ5dGVMZW5ndGgpfWZ1bmN0aW9uIG10KHQpe3ZhciByPW5ldyB0LmNvbnN0cnVjdG9yKHQuc291cmNlLCRuLmV4ZWModCkpO3JldHVybiByLmxhc3RJbmRleD10Lmxhc3RJbmRleCxyfWZ1bmN0aW9uIEF0KHQpe3JldHVybiAkZT9PYmplY3QoJGUuY2FsbCh0KSk6e319ZnVuY3Rpb24genQodCxyKXtyZXR1cm4gbmV3IHQuY29uc3RydWN0b3Iocj93dCh0LmJ1ZmZlcik6dC5idWZmZXIsdC5ieXRlT2Zmc2V0LHQubGVuZ3RoKX1mdW5jdGlvbiBTdCh0LHIpe3ZhciBuPS0xLGU9dC5sZW5ndGg7Zm9yKHJ8fChyPUFycmF5KGUpKTsrK248ZTspcltuXT10W25dO1xucmV0dXJuIHJ9ZnVuY3Rpb24geHQodCxyLG4sZSl7dmFyIHU9IW47bnx8KG49e30pO2Zvcih2YXIgbz0tMSxpPXIubGVuZ3RoOysrbzxpOyl7dmFyIGM9cltvXSxhPWU/ZShuW2NdLHRbY10sYyxuLHQpOkxyO2E9PT1MciYmKGE9dFtjXSksdT9IKG4sYyxhKTpWKG4sYyxhKX1yZXR1cm4gbn1mdW5jdGlvbiBrdCh0LHIpe3JldHVybiB4dCh0LEZlKHQpLHIpfWZ1bmN0aW9uIEV0KHQscil7cmV0dXJuIHh0KHQsTWUodCkscil9ZnVuY3Rpb24gJHQodCl7cmV0dXJuIGRyKHQpP0xyOnR9ZnVuY3Rpb24gSXQodCxyLG4sZSx1LGkpe3ZhciBjPW4mUnIsYT10Lmxlbmd0aCxsPXIubGVuZ3RoO2lmKGEhPWwmJiEoYyYmbD5hKSlyZXR1cm4gZmFsc2U7dmFyIHM9aS5nZXQodCk7aWYocyYmaS5nZXQocikpcmV0dXJuIHM9PXI7dmFyIGg9LTEscD10cnVlLHY9biZOcj9uZXcgUDpMcjtmb3IoaS5zZXQodCxyKSxpLnNldChyLHQpOysraDxhOyl7dmFyIHk9dFtoXSxiPXJbaF07aWYoZSl2YXIgXz1jP2UoYix5LGgscix0LGkpOmUoeSxiLGgsdCxyLGkpO1xuaWYoXyE9PUxyKXtpZihfKWNvbnRpbnVlO3A9ZmFsc2U7YnJlYWt9aWYodil7aWYoIW8ocixmdW5jdGlvbih0LHIpe2lmKCFmKHYscikmJih5PT09dHx8dSh5LHQsbixlLGkpKSlyZXR1cm4gdi5wdXNoKHIpfSkpe3A9ZmFsc2U7YnJlYWt9fWVsc2UgaWYoeSE9PWImJiF1KHksYixuLGUsaSkpe3A9ZmFsc2U7YnJlYWt9fXJldHVybiBpLmRlbGV0ZSh0KSxpLmRlbGV0ZShyKSxwfWZ1bmN0aW9uIEx0KHQscixuLGUsdSxvLGkpe3N3aXRjaChuKXtjYXNlIHluOmlmKHQuYnl0ZUxlbmd0aCE9ci5ieXRlTGVuZ3RofHx0LmJ5dGVPZmZzZXQhPXIuYnl0ZU9mZnNldClyZXR1cm4gZmFsc2U7dD10LmJ1ZmZlcixyPXIuYnVmZmVyO2Nhc2Ugdm46cmV0dXJuISh0LmJ5dGVMZW5ndGghPXIuYnl0ZUxlbmd0aHx8IW8obmV3IHVlKHQpLG5ldyB1ZShyKSkpO2Nhc2UgUXI6Y2FzZSBYcjpjYXNlIG5uOnJldHVybiBwcigrdCwrcik7Y2FzZSBZcjpyZXR1cm4gdC5uYW1lPT1yLm5hbWUmJnQubWVzc2FnZT09ci5tZXNzYWdlO2Nhc2UgYW46XG5jYXNlIGxuOnJldHVybiB0PT1yK1wiXCI7Y2FzZSBybjp2YXIgYz1zO2Nhc2UgZm46dmFyIGE9ZSZScjtpZihjfHwoYz1wKSx0LnNpemUhPXIuc2l6ZSYmIWEpcmV0dXJuIGZhbHNlO3ZhciBmPWkuZ2V0KHQpO2lmKGYpcmV0dXJuIGY9PXI7ZXw9TnIsaS5zZXQodCxyKTt2YXIgbD1JdChjKHQpLGMociksZSx1LG8saSk7cmV0dXJuIGkuZGVsZXRlKHQpLGw7Y2FzZSBzbjppZigkZSlyZXR1cm4gJGUuY2FsbCh0KT09JGUuY2FsbChyKX1yZXR1cm4gZmFsc2V9ZnVuY3Rpb24gUHQodCxyLG4sZSx1LG8pe3ZhciBpPW4mUnIsYz1NdCh0KSxhPWMubGVuZ3RoO2lmKGEhPU10KHIpLmxlbmd0aCYmIWkpcmV0dXJuIGZhbHNlO2Zvcih2YXIgZj1hO2YtLTspe3ZhciBsPWNbZl07aWYoIShpP2wgaW4gcjpYbi5jYWxsKHIsbCkpKXJldHVybiBmYWxzZX12YXIgcz1vLmdldCh0KTtpZihzJiZvLmdldChyKSlyZXR1cm4gcz09cjt2YXIgaD10cnVlO28uc2V0KHQsciksby5zZXQocix0KTtmb3IodmFyIHA9aTsrK2Y8YTspe2w9Y1tmXTtcbnZhciB2PXRbbF0seT1yW2xdO2lmKGUpdmFyIGI9aT9lKHksdixsLHIsdCxvKTplKHYseSxsLHQscixvKTtpZighKGI9PT1Mcj92PT09eXx8dSh2LHksbixlLG8pOmIpKXtoPWZhbHNlO2JyZWFrfXB8fChwPVwiY29uc3RydWN0b3JcIj09bCl9aWYoaCYmIXApe3ZhciBfPXQuY29uc3RydWN0b3IsZz1yLmNvbnN0cnVjdG9yO18hPWcmJlwiY29uc3RydWN0b3JcImluIHQmJlwiY29uc3RydWN0b3JcImluIHImJiEodHlwZW9mIF89PVwiZnVuY3Rpb25cIiYmXyBpbnN0YW5jZW9mIF8mJnR5cGVvZiBnPT1cImZ1bmN0aW9uXCImJmcgaW5zdGFuY2VvZiBnKSYmKGg9ZmFsc2UpfXJldHVybiBvLmRlbGV0ZSh0KSxvLmRlbGV0ZShyKSxofWZ1bmN0aW9uIEZ0KHQpe3JldHVybiBVZSh1cih0LExyLGZyKSx0K1wiXCIpfWZ1bmN0aW9uIE10KHQpe3JldHVybiBYKHQsQXIsRmUpfWZ1bmN0aW9uIFR0KHQpe3JldHVybiBYKHQsenIsTWUpfWZ1bmN0aW9uIFV0KCl7dmFyIHQ9di5pdGVyYXRlZXx8a3I7cmV0dXJuIHQ9dD09PWtyP2F0OnQsXG5hcmd1bWVudHMubGVuZ3RoP3QoYXJndW1lbnRzWzBdLGFyZ3VtZW50c1sxXSk6dH1mdW5jdGlvbiBCdCh0LHIpe3ZhciBuPXQuX19kYXRhX187cmV0dXJuIFF0KHIpP25bdHlwZW9mIHI9PVwic3RyaW5nXCI/XCJzdHJpbmdcIjpcImhhc2hcIl06bi5tYXB9ZnVuY3Rpb24gQ3QodCl7Zm9yKHZhciByPUFyKHQpLG49ci5sZW5ndGg7bi0tOyl7dmFyIGU9cltuXSx1PXRbZV07cltuXT1bZSx1LFp0KHUpXX1yZXR1cm4gcn1mdW5jdGlvbiBEdCh0LHIpe3ZhciBuPWwodCxyKTtyZXR1cm4gb3Qobik/bjpMcn1mdW5jdGlvbiBSdCh0KXt2YXIgcj1Ybi5jYWxsKHQsc2UpLG49dFtzZV07dHJ5e3Rbc2VdPUxyO3ZhciBlPXRydWV9Y2F0Y2godCl7fXZhciB1PVpuLmNhbGwodCk7cmV0dXJuIGUmJihyP3Rbc2VdPW46ZGVsZXRlIHRbc2VdKSx1fWZ1bmN0aW9uIE50KHQscixuKXtyPWR0KHIsdCk7Zm9yKHZhciBlPS0xLHU9ci5sZW5ndGgsbz1mYWxzZTsrK2U8dTspe3ZhciBpPWNyKHJbZV0pO2lmKCEobz1udWxsIT10JiZuKHQsaSkpKWJyZWFrO1xudD10W2ldfXJldHVybiBvfHwrK2UhPXU/bzoodT1udWxsPT10PzA6dC5sZW5ndGgsISF1JiZicih1KSYmSHQoaSx1KSYmKERlKHQpfHxDZSh0KSkpfWZ1bmN0aW9uIFZ0KHQpe3ZhciByPXQubGVuZ3RoLG49bmV3IHQuY29uc3RydWN0b3Iocik7cmV0dXJuIHImJlwic3RyaW5nXCI9PXR5cGVvZiB0WzBdJiZYbi5jYWxsKHQsXCJpbmRleFwiKSYmKG4uaW5kZXg9dC5pbmRleCxuLmlucHV0PXQuaW5wdXQpLG59ZnVuY3Rpb24gV3QodCl7cmV0dXJuIHR5cGVvZiB0LmNvbnN0cnVjdG9yIT1cImZ1bmN0aW9uXCJ8fFl0KHQpP3t9OkxlKGllKHQpKX1mdW5jdGlvbiBxdCh0LHIsbil7dmFyIGU9dC5jb25zdHJ1Y3Rvcjtzd2l0Y2gocil7Y2FzZSB2bjpyZXR1cm4gd3QodCk7Y2FzZSBRcjpjYXNlIFhyOnJldHVybiBuZXcgZSgrdCk7Y2FzZSB5bjpyZXR1cm4gT3QodCxuKTtjYXNlIGJuOmNhc2UgX246Y2FzZSBnbjpjYXNlIGRuOmNhc2Ugam46Y2FzZSB3bjpjYXNlIE9uOmNhc2UgbW46Y2FzZSBBbjpyZXR1cm4genQodCxuKTtcbmNhc2Ugcm46cmV0dXJuIG5ldyBlO2Nhc2Ugbm46Y2FzZSBsbjpyZXR1cm4gbmV3IGUodCk7Y2FzZSBhbjpyZXR1cm4gbXQodCk7Y2FzZSBmbjpyZXR1cm4gbmV3IGU7Y2FzZSBzbjpyZXR1cm4gQXQodCl9fWZ1bmN0aW9uIEd0KHQpe3JldHVybiBEZSh0KXx8Q2UodCl8fCEhKGxlJiZ0JiZ0W2xlXSl9ZnVuY3Rpb24gSHQodCxyKXt2YXIgbj10eXBlb2YgdDtyZXR1cm4gcj1udWxsPT1yP0dyOnIsISFyJiYoXCJudW1iZXJcIj09bnx8XCJzeW1ib2xcIiE9biYmTG4udGVzdCh0KSkmJnQ+LTEmJnQlMT09MCYmdDxyfWZ1bmN0aW9uIEp0KHQscixuKXtpZighX3IobikpcmV0dXJuIGZhbHNlO3ZhciBlPXR5cGVvZiByO3JldHVybiEhKFwibnVtYmVyXCI9PWU/dnIobikmJkh0KHIsbi5sZW5ndGgpOlwic3RyaW5nXCI9PWUmJnIgaW4gbikmJnByKG5bcl0sdCl9ZnVuY3Rpb24gS3QodCxyKXtpZihEZSh0KSlyZXR1cm4gZmFsc2U7dmFyIG49dHlwZW9mIHQ7cmV0dXJuIShcIm51bWJlclwiIT1uJiZcInN5bWJvbFwiIT1uJiZcImJvb2xlYW5cIiE9biYmbnVsbCE9dCYmIWpyKHQpKXx8KFNuLnRlc3QodCl8fCF6bi50ZXN0KHQpfHxudWxsIT1yJiZ0IGluIE9iamVjdChyKSk7XG59ZnVuY3Rpb24gUXQodCl7dmFyIHI9dHlwZW9mIHQ7cmV0dXJuXCJzdHJpbmdcIj09cnx8XCJudW1iZXJcIj09cnx8XCJzeW1ib2xcIj09cnx8XCJib29sZWFuXCI9PXI/XCJfX3Byb3RvX19cIiE9PXQ6bnVsbD09PXR9ZnVuY3Rpb24gWHQodCl7cmV0dXJuISFZbiYmWW4gaW4gdH1mdW5jdGlvbiBZdCh0KXt2YXIgcj10JiZ0LmNvbnN0cnVjdG9yO3JldHVybiB0PT09KHR5cGVvZiByPT1cImZ1bmN0aW9uXCImJnIucHJvdG90eXBlfHxKbil9ZnVuY3Rpb24gWnQodCl7cmV0dXJuIHQ9PT10JiYhX3IodCl9ZnVuY3Rpb24gdHIodCxyKXtyZXR1cm4gZnVuY3Rpb24obil7cmV0dXJuIG51bGwhPW4mJihuW3RdPT09ciYmKHIhPT1Mcnx8dCBpbiBPYmplY3QobikpKX19ZnVuY3Rpb24gcnIodCl7dmFyIHI9aHIodCxmdW5jdGlvbih0KXtyZXR1cm4gbi5zaXplPT09VXImJm4uY2xlYXIoKSx0fSksbj1yLmNhY2hlO3JldHVybiByfWZ1bmN0aW9uIG5yKHQpe3ZhciByPVtdO2lmKG51bGwhPXQpZm9yKHZhciBuIGluIE9iamVjdCh0KSlyLnB1c2gobik7XG5yZXR1cm4gcn1mdW5jdGlvbiBlcih0KXtyZXR1cm4gWm4uY2FsbCh0KX1mdW5jdGlvbiB1cihyLG4sZSl7cmV0dXJuIG49YmUobj09PUxyP3IubGVuZ3RoLTE6biwwKSxmdW5jdGlvbigpe2Zvcih2YXIgdT1hcmd1bWVudHMsbz0tMSxpPWJlKHUubGVuZ3RoLW4sMCksYz1BcnJheShpKTsrK288aTspY1tvXT11W24rb107bz0tMTtmb3IodmFyIGE9QXJyYXkobisxKTsrK288bjspYVtvXT11W29dO3JldHVybiBhW25dPWUoYyksdChyLHRoaXMsYSl9fWZ1bmN0aW9uIG9yKHQscil7cmV0dXJuIHIubGVuZ3RoPDI/dDpRKHQsYnQociwwLC0xKSl9ZnVuY3Rpb24gaXIodCl7dmFyIHI9MCxuPTA7cmV0dXJuIGZ1bmN0aW9uKCl7dmFyIGU9X2UoKSx1PVdyLShlLW4pO2lmKG49ZSx1PjApe2lmKCsrcj49VnIpcmV0dXJuIGFyZ3VtZW50c1swXX1lbHNlIHI9MDtyZXR1cm4gdC5hcHBseShMcixhcmd1bWVudHMpfX1mdW5jdGlvbiBjcih0KXtpZih0eXBlb2YgdD09XCJzdHJpbmdcInx8anIodCkpcmV0dXJuIHQ7XG52YXIgcj10K1wiXCI7cmV0dXJuXCIwXCI9PXImJjEvdD09LXFyP1wiLTBcIjpyfWZ1bmN0aW9uIGFyKHQpe2lmKG51bGwhPXQpe3RyeXtyZXR1cm4gUW4uY2FsbCh0KX1jYXRjaCh0KXt9dHJ5e3JldHVybiB0K1wiXCJ9Y2F0Y2godCl7fX1yZXR1cm5cIlwifWZ1bmN0aW9uIGZyKHQpe3JldHVybihudWxsPT10PzA6dC5sZW5ndGgpP0sodCwxKTpbXX1mdW5jdGlvbiBscih0KXt2YXIgcj1udWxsPT10PzA6dC5sZW5ndGg7cmV0dXJuIHI/dFtyLTFdOkxyfWZ1bmN0aW9uIHNyKHQscil7dmFyIG49W107aWYoIXR8fCF0Lmxlbmd0aClyZXR1cm4gbjt2YXIgZT0tMSx1PVtdLG89dC5sZW5ndGg7Zm9yKHI9VXQociwzKTsrK2U8bzspe3ZhciBpPXRbZV07cihpLGUsdCkmJihuLnB1c2goaSksdS5wdXNoKGUpKX1yZXR1cm4gdnQodCx1KSxufWZ1bmN0aW9uIGhyKHQscil7aWYodHlwZW9mIHQhPVwiZnVuY3Rpb25cInx8bnVsbCE9ciYmdHlwZW9mIHIhPVwiZnVuY3Rpb25cIil0aHJvdyBuZXcgVHlwZUVycm9yKE1yKTtcbnZhciBuPWZ1bmN0aW9uKCl7dmFyIGU9YXJndW1lbnRzLHU9cj9yLmFwcGx5KHRoaXMsZSk6ZVswXSxvPW4uY2FjaGU7aWYoby5oYXModSkpcmV0dXJuIG8uZ2V0KHUpO3ZhciBpPXQuYXBwbHkodGhpcyxlKTtyZXR1cm4gbi5jYWNoZT1vLnNldCh1LGkpfHxvLGl9O3JldHVybiBuLmNhY2hlPW5ldyhoci5DYWNoZXx8eCksbn1mdW5jdGlvbiBwcih0LHIpe3JldHVybiB0PT09cnx8dCE9PXQmJnIhPT1yfWZ1bmN0aW9uIHZyKHQpe3JldHVybiBudWxsIT10JiZicih0Lmxlbmd0aCkmJiF5cih0KX1mdW5jdGlvbiB5cih0KXtpZighX3IodCkpcmV0dXJuIGZhbHNlO3ZhciByPVkodCk7cmV0dXJuIHI9PVpyfHxyPT10bnx8cj09S3J8fHI9PWNufWZ1bmN0aW9uIGJyKHQpe3JldHVybiB0eXBlb2YgdD09XCJudW1iZXJcIiYmdD4tMSYmdCUxPT0wJiZ0PD1Hcn1mdW5jdGlvbiBfcih0KXt2YXIgcj10eXBlb2YgdDtyZXR1cm4gbnVsbCE9dCYmKFwib2JqZWN0XCI9PXJ8fFwiZnVuY3Rpb25cIj09cil9ZnVuY3Rpb24gZ3IodCl7XG5yZXR1cm4gbnVsbCE9dCYmdHlwZW9mIHQ9PVwib2JqZWN0XCJ9ZnVuY3Rpb24gZHIodCl7aWYoIWdyKHQpfHxZKHQpIT11bilyZXR1cm4gZmFsc2U7dmFyIHI9aWUodCk7aWYobnVsbD09PXIpcmV0dXJuIHRydWU7dmFyIG49WG4uY2FsbChyLFwiY29uc3RydWN0b3JcIikmJnIuY29uc3RydWN0b3I7cmV0dXJuIHR5cGVvZiBuPT1cImZ1bmN0aW9uXCImJm4gaW5zdGFuY2VvZiBuJiZRbi5jYWxsKG4pPT10ZX1mdW5jdGlvbiBqcih0KXtyZXR1cm4gdHlwZW9mIHQ9PVwic3ltYm9sXCJ8fGdyKHQpJiZZKHQpPT1zbn1mdW5jdGlvbiB3cih0KXtyZXR1cm4gbnVsbD09dD9cIlwiOl90KHQpfWZ1bmN0aW9uIE9yKHQscixuKXt2YXIgZT1udWxsPT10P0xyOlEodCxyKTtyZXR1cm4gZT09PUxyP246ZX1mdW5jdGlvbiBtcih0LHIpe3JldHVybiBudWxsIT10JiZOdCh0LHIsWil9ZnVuY3Rpb24gQXIodCl7cmV0dXJuIHZyKHQpP04odCk6ZnQodCl9ZnVuY3Rpb24genIodCl7cmV0dXJuIHZyKHQpP04odCx0cnVlKTpsdCh0KX1mdW5jdGlvbiBTcih0KXtcbnJldHVybiBmdW5jdGlvbigpe3JldHVybiB0fX1mdW5jdGlvbiB4cih0KXtyZXR1cm4gdH1mdW5jdGlvbiBrcih0KXtyZXR1cm4gYXQodHlwZW9mIHQ9PVwiZnVuY3Rpb25cIj90OkoodCxCcikpfWZ1bmN0aW9uIEVyKHQpe3JldHVybiBLdCh0KT9pKGNyKHQpKTpwdCh0KX1mdW5jdGlvbiAkcigpe3JldHVybltdfWZ1bmN0aW9uIElyKCl7cmV0dXJuIGZhbHNlfXZhciBMcixQcj1cIjQuMTcuNVwiLEZyPTIwMCxNcj1cIkV4cGVjdGVkIGEgZnVuY3Rpb25cIixUcj1cIl9fbG9kYXNoX2hhc2hfdW5kZWZpbmVkX19cIixVcj01MDAsQnI9MSxDcj0yLERyPTQsUnI9MSxOcj0yLFZyPTgwMCxXcj0xNixxcj0xLzAsR3I9OTAwNzE5OTI1NDc0MDk5MSxIcj1cIltvYmplY3QgQXJndW1lbnRzXVwiLEpyPVwiW29iamVjdCBBcnJheV1cIixLcj1cIltvYmplY3QgQXN5bmNGdW5jdGlvbl1cIixRcj1cIltvYmplY3QgQm9vbGVhbl1cIixYcj1cIltvYmplY3QgRGF0ZV1cIixZcj1cIltvYmplY3QgRXJyb3JdXCIsWnI9XCJbb2JqZWN0IEZ1bmN0aW9uXVwiLHRuPVwiW29iamVjdCBHZW5lcmF0b3JGdW5jdGlvbl1cIixybj1cIltvYmplY3QgTWFwXVwiLG5uPVwiW29iamVjdCBOdW1iZXJdXCIsZW49XCJbb2JqZWN0IE51bGxdXCIsdW49XCJbb2JqZWN0IE9iamVjdF1cIixvbj1cIltvYmplY3QgUHJvbWlzZV1cIixjbj1cIltvYmplY3QgUHJveHldXCIsYW49XCJbb2JqZWN0IFJlZ0V4cF1cIixmbj1cIltvYmplY3QgU2V0XVwiLGxuPVwiW29iamVjdCBTdHJpbmddXCIsc249XCJbb2JqZWN0IFN5bWJvbF1cIixobj1cIltvYmplY3QgVW5kZWZpbmVkXVwiLHBuPVwiW29iamVjdCBXZWFrTWFwXVwiLHZuPVwiW29iamVjdCBBcnJheUJ1ZmZlcl1cIix5bj1cIltvYmplY3QgRGF0YVZpZXddXCIsYm49XCJbb2JqZWN0IEZsb2F0MzJBcnJheV1cIixfbj1cIltvYmplY3QgRmxvYXQ2NEFycmF5XVwiLGduPVwiW29iamVjdCBJbnQ4QXJyYXldXCIsZG49XCJbb2JqZWN0IEludDE2QXJyYXldXCIsam49XCJbb2JqZWN0IEludDMyQXJyYXldXCIsd249XCJbb2JqZWN0IFVpbnQ4QXJyYXldXCIsT249XCJbb2JqZWN0IFVpbnQ4Q2xhbXBlZEFycmF5XVwiLG1uPVwiW29iamVjdCBVaW50MTZBcnJheV1cIixBbj1cIltvYmplY3QgVWludDMyQXJyYXldXCIsem49L1xcLnxcXFsoPzpbXltcXF1dKnwoW1wiJ10pKD86KD8hXFwxKVteXFxcXF18XFxcXC4pKj9cXDEpXFxdLyxTbj0vXlxcdyokLyx4bj0vW14uW1xcXV0rfFxcWyg/OigtP1xcZCsoPzpcXC5cXGQrKT8pfChbXCInXSkoKD86KD8hXFwyKVteXFxcXF18XFxcXC4pKj8pXFwyKVxcXXwoPz0oPzpcXC58XFxbXFxdKSg/OlxcLnxcXFtcXF18JCkpL2csa249L1tcXFxcXiQuKis/KClbXFxde318XS9nLEVuPS9cXFxcKFxcXFwpPy9nLCRuPS9cXHcqJC8sSW49L15cXFtvYmplY3QgLis/Q29uc3RydWN0b3JcXF0kLyxMbj0vXig/OjB8WzEtOV1cXGQqKSQvLFBuPXt9O1xuUG5bYm5dPVBuW19uXT1Qbltnbl09UG5bZG5dPVBuW2puXT1Qblt3bl09UG5bT25dPVBuW21uXT1QbltBbl09dHJ1ZSxQbltIcl09UG5bSnJdPVBuW3ZuXT1QbltRcl09UG5beW5dPVBuW1hyXT1QbltZcl09UG5bWnJdPVBuW3JuXT1Qbltubl09UG5bdW5dPVBuW2FuXT1Qbltmbl09UG5bbG5dPVBuW3BuXT1mYWxzZTt2YXIgRm49e307Rm5bSHJdPUZuW0pyXT1Gblt2bl09Rm5beW5dPUZuW1FyXT1GbltYcl09Rm5bYm5dPUZuW19uXT1Gbltnbl09Rm5bZG5dPUZuW2puXT1Gbltybl09Rm5bbm5dPUZuW3VuXT1Gblthbl09Rm5bZm5dPUZuW2xuXT1Gbltzbl09Rm5bd25dPUZuW09uXT1Gblttbl09Rm5bQW5dPXRydWUsRm5bWXJdPUZuW1pyXT1Gbltwbl09ZmFsc2U7dmFyIE1uPXR5cGVvZiBnbG9iYWw9PVwib2JqZWN0XCImJmdsb2JhbCYmZ2xvYmFsLk9iamVjdD09PU9iamVjdCYmZ2xvYmFsLFRuPXR5cGVvZiBzZWxmPT1cIm9iamVjdFwiJiZzZWxmJiZzZWxmLk9iamVjdD09PU9iamVjdCYmc2VsZixVbj1Nbnx8VG58fEZ1bmN0aW9uKFwicmV0dXJuIHRoaXNcIikoKSxCbj10eXBlb2YgZXhwb3J0cz09XCJvYmplY3RcIiYmZXhwb3J0cyYmIWV4cG9ydHMubm9kZVR5cGUmJmV4cG9ydHMsQ249Qm4mJnR5cGVvZiBtb2R1bGU9PVwib2JqZWN0XCImJm1vZHVsZSYmIW1vZHVsZS5ub2RlVHlwZSYmbW9kdWxlLERuPUNuJiZDbi5leHBvcnRzPT09Qm4sUm49RG4mJk1uLnByb2Nlc3MsTm49ZnVuY3Rpb24oKXtcbnRyeXtyZXR1cm4gUm4mJlJuLmJpbmRpbmcmJlJuLmJpbmRpbmcoXCJ1dGlsXCIpfWNhdGNoKHQpe319KCksVm49Tm4mJk5uLmlzTWFwLFduPU5uJiZObi5pc1NldCxxbj1ObiYmTm4uaXNUeXBlZEFycmF5LEduPUFycmF5LnByb3RvdHlwZSxIbj1GdW5jdGlvbi5wcm90b3R5cGUsSm49T2JqZWN0LnByb3RvdHlwZSxLbj1VbltcIl9fY29yZS1qc19zaGFyZWRfX1wiXSxRbj1Ibi50b1N0cmluZyxYbj1Kbi5oYXNPd25Qcm9wZXJ0eSxZbj1mdW5jdGlvbigpe3ZhciB0PS9bXi5dKyQvLmV4ZWMoS24mJktuLmtleXMmJktuLmtleXMuSUVfUFJPVE98fFwiXCIpO3JldHVybiB0P1wiU3ltYm9sKHNyYylfMS5cIit0OlwiXCJ9KCksWm49Sm4udG9TdHJpbmcsdGU9UW4uY2FsbChPYmplY3QpLHJlPVJlZ0V4cChcIl5cIitRbi5jYWxsKFhuKS5yZXBsYWNlKGtuLFwiXFxcXCQmXCIpLnJlcGxhY2UoL2hhc093blByb3BlcnR5fChmdW5jdGlvbikuKj8oPz1cXFxcXFwoKXwgZm9yIC4rPyg/PVxcXFxcXF0pL2csXCIkMS4qP1wiKStcIiRcIiksbmU9RG4/VW4uQnVmZmVyOkxyLGVlPVVuLlN5bWJvbCx1ZT1Vbi5VaW50OEFycmF5LG9lPW5lP25lLmFsbG9jVW5zYWZlOkxyLGllPWgoT2JqZWN0LmdldFByb3RvdHlwZU9mLE9iamVjdCksY2U9T2JqZWN0LmNyZWF0ZSxhZT1Kbi5wcm9wZXJ0eUlzRW51bWVyYWJsZSxmZT1Hbi5zcGxpY2UsbGU9ZWU/ZWUuaXNDb25jYXRTcHJlYWRhYmxlOkxyLHNlPWVlP2VlLnRvU3RyaW5nVGFnOkxyLGhlPWZ1bmN0aW9uKCl7XG50cnl7dmFyIHQ9RHQoT2JqZWN0LFwiZGVmaW5lUHJvcGVydHlcIik7cmV0dXJuIHQoe30sXCJcIix7fSksdH1jYXRjaCh0KXt9fSgpLHBlPU9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMsdmU9bmU/bmUuaXNCdWZmZXI6THIseWU9aChPYmplY3Qua2V5cyxPYmplY3QpLGJlPU1hdGgubWF4LF9lPURhdGUubm93LGdlPUR0KFVuLFwiRGF0YVZpZXdcIiksZGU9RHQoVW4sXCJNYXBcIiksamU9RHQoVW4sXCJQcm9taXNlXCIpLHdlPUR0KFVuLFwiU2V0XCIpLE9lPUR0KFVuLFwiV2Vha01hcFwiKSxtZT1EdChPYmplY3QsXCJjcmVhdGVcIiksQWU9YXIoZ2UpLHplPWFyKGRlKSxTZT1hcihqZSkseGU9YXIod2UpLGtlPWFyKE9lKSxFZT1lZT9lZS5wcm90b3R5cGU6THIsJGU9RWU/RWUudmFsdWVPZjpMcixJZT1FZT9FZS50b1N0cmluZzpMcixMZT1mdW5jdGlvbigpe2Z1bmN0aW9uIHQoKXt9cmV0dXJuIGZ1bmN0aW9uKHIpe2lmKCFfcihyKSlyZXR1cm57fTtpZihjZSlyZXR1cm4gY2Uocik7dC5wcm90b3R5cGU9cjtcbnZhciBuPW5ldyB0O3JldHVybiB0LnByb3RvdHlwZT1McixufX0oKTt5LnByb3RvdHlwZS5jbGVhcj1iLHkucHJvdG90eXBlLmRlbGV0ZT1fLHkucHJvdG90eXBlLmdldD1nLHkucHJvdG90eXBlLmhhcz1kLHkucHJvdG90eXBlLnNldD1qLHcucHJvdG90eXBlLmNsZWFyPU8sdy5wcm90b3R5cGUuZGVsZXRlPW0sdy5wcm90b3R5cGUuZ2V0PUEsdy5wcm90b3R5cGUuaGFzPXosdy5wcm90b3R5cGUuc2V0PVMseC5wcm90b3R5cGUuY2xlYXI9ayx4LnByb3RvdHlwZS5kZWxldGU9RSx4LnByb3RvdHlwZS5nZXQ9JCx4LnByb3RvdHlwZS5oYXM9SSx4LnByb3RvdHlwZS5zZXQ9TCxQLnByb3RvdHlwZS5hZGQ9UC5wcm90b3R5cGUucHVzaD1GLFAucHJvdG90eXBlLmhhcz1NLFQucHJvdG90eXBlLmNsZWFyPVUsVC5wcm90b3R5cGUuZGVsZXRlPUIsVC5wcm90b3R5cGUuZ2V0PUMsVC5wcm90b3R5cGUuaGFzPUQsVC5wcm90b3R5cGUuc2V0PVI7dmFyIFBlPWhlP2Z1bmN0aW9uKHQscil7cmV0dXJuIGhlKHQsXCJ0b1N0cmluZ1wiLHtcbmNvbmZpZ3VyYWJsZTp0cnVlLGVudW1lcmFibGU6ZmFsc2UsdmFsdWU6U3Iociksd3JpdGFibGU6dHJ1ZX0pfTp4cixGZT1wZT9mdW5jdGlvbih0KXtyZXR1cm4gbnVsbD09dD9bXToodD1PYmplY3QodCksbihwZSh0KSxmdW5jdGlvbihyKXtyZXR1cm4gYWUuY2FsbCh0LHIpfSkpfTokcixNZT1wZT9mdW5jdGlvbih0KXtmb3IodmFyIHI9W107dDspdShyLEZlKHQpKSx0PWllKHQpO3JldHVybiByfTokcixUZT1ZOyhnZSYmVGUobmV3IGdlKG5ldyBBcnJheUJ1ZmZlcigxKSkpIT15bnx8ZGUmJlRlKG5ldyBkZSkhPXJufHxqZSYmVGUoamUucmVzb2x2ZSgpKSE9b258fHdlJiZUZShuZXcgd2UpIT1mbnx8T2UmJlRlKG5ldyBPZSkhPXBuKSYmKFRlPWZ1bmN0aW9uKHQpe3ZhciByPVkodCksbj1yPT11bj90LmNvbnN0cnVjdG9yOkxyLGU9bj9hcihuKTpcIlwiO2lmKGUpc3dpdGNoKGUpe2Nhc2UgQWU6cmV0dXJuIHluO2Nhc2UgemU6cmV0dXJuIHJuO2Nhc2UgU2U6cmV0dXJuIG9uO2Nhc2UgeGU6cmV0dXJuIGZuO1xuY2FzZSBrZTpyZXR1cm4gcG59cmV0dXJuIHJ9KTt2YXIgVWU9aXIoUGUpLEJlPXJyKGZ1bmN0aW9uKHQpe3ZhciByPVtdO3JldHVybiA0Nj09PXQuY2hhckNvZGVBdCgwKSYmci5wdXNoKFwiXCIpLHQucmVwbGFjZSh4bixmdW5jdGlvbih0LG4sZSx1KXtyLnB1c2goZT91LnJlcGxhY2UoRW4sXCIkMVwiKTpufHx0KX0pLHJ9KTtoci5DYWNoZT14O3ZhciBDZT10dChmdW5jdGlvbigpe3JldHVybiBhcmd1bWVudHN9KCkpP3R0OmZ1bmN0aW9uKHQpe3JldHVybiBncih0KSYmWG4uY2FsbCh0LFwiY2FsbGVlXCIpJiYhYWUuY2FsbCh0LFwiY2FsbGVlXCIpfSxEZT1BcnJheS5pc0FycmF5LFJlPXZlfHxJcixOZT1Wbj9hKFZuKTpldCxWZT1Xbj9hKFduKTppdCxXZT1xbj9hKHFuKTpjdCxxZT15dChmdW5jdGlvbih0LHIpe3Q9T2JqZWN0KHQpO3ZhciBuPS0xLGU9ci5sZW5ndGgsdT1lPjI/clsyXTpMcjtmb3IodSYmSnQoclswXSxyWzFdLHUpJiYoZT0xKTsrK248ZTspZm9yKHZhciBvPXJbbl0saT16cihvKSxjPS0xLGE9aS5sZW5ndGg7KytjPGE7KXtcbnZhciBmPWlbY10sbD10W2ZdOyhsPT09THJ8fHByKGwsSm5bZl0pJiYhWG4uY2FsbCh0LGYpKSYmKHRbZl09b1tmXSl9cmV0dXJuIHR9KSxHZT1GdChmdW5jdGlvbih0LHIpe3ZhciBuPXt9O2lmKG51bGw9PXQpcmV0dXJuIG47dmFyIHU9ZmFsc2U7cj1lKHIsZnVuY3Rpb24ocil7cmV0dXJuIHI9ZHQocix0KSx1fHwodT1yLmxlbmd0aD4xKSxyfSkseHQodCxUdCh0KSxuKSx1JiYobj1KKG4sQnJ8Q3J8RHIsJHQpKTtmb3IodmFyIG89ci5sZW5ndGg7by0tOylndChuLHJbb10pO3JldHVybiBufSk7di5jb25zdGFudD1Tcix2LmRlZmF1bHRzPXFlLHYuZmxhdHRlbj1mcix2Lml0ZXJhdGVlPWtyLHYua2V5cz1Bcix2LmtleXNJbj16cix2Lm1lbW9pemU9aHIsdi5vbWl0PUdlLHYucHJvcGVydHk9RXIsdi5yZW1vdmU9c3Isdi5lcT1wcix2LmdldD1Pcix2Lmhhc0luPW1yLHYuaWRlbnRpdHk9eHIsdi5pc0FyZ3VtZW50cz1DZSx2LmlzQXJyYXk9RGUsdi5pc0FycmF5TGlrZT12cix2LmlzQnVmZmVyPVJlLFxudi5pc0Z1bmN0aW9uPXlyLHYuaXNMZW5ndGg9YnIsdi5pc01hcD1OZSx2LmlzT2JqZWN0PV9yLHYuaXNPYmplY3RMaWtlPWdyLHYuaXNQbGFpbk9iamVjdD1kcix2LmlzU2V0PVZlLHYuaXNTeW1ib2w9anIsdi5pc1R5cGVkQXJyYXk9V2Usdi5sYXN0PWxyLHYuc3R1YkFycmF5PSRyLHYuc3R1YkZhbHNlPUlyLHYudG9TdHJpbmc9d3Isdi5WRVJTSU9OPVByLENuJiYoKENuLmV4cG9ydHM9dikuXz12LEJuLl89dil9KS5jYWxsKHRoaXMpOyJdLCJzb3VyY2VSb290IjoiIn0=