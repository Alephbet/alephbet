(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.AlephBet = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function () {
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
	if (typeof define === 'function' && define.amd) {
		define(function() {
			return Basil;
		});
	// commonjs export
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = Basil;
	}

})();

},{}],2:[function(require,module,exports){
;(function (root, factory) {
	if (typeof exports === "object") {
		// CommonJS
		module.exports = exports = factory();
	}
	else if (typeof define === "function" && define.amd) {
		// AMD
		define([], factory);
	}
	else {
		// Global (browser)
		root.CryptoJS = factory();
	}
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
},{}],3:[function(require,module,exports){
;(function (root, factory) {
	if (typeof exports === "object") {
		// CommonJS
		module.exports = exports = factory(require("./core"));
	}
	else if (typeof define === "function" && define.amd) {
		// AMD
		define(["./core"], factory);
	}
	else {
		// Global (browser)
		factory(root.CryptoJS);
	}
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
},{"./core":2}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

    GimelAdapter.prototype._remove_quuid = function(quuid) {
      return (function(_this) {
        return function(err, res) {
          if (err) {
            return;
          }
          utils.remove(_this._queue, function(el) {
            return el.properties._quuid === quuid;
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
        callback = this._remove_quuid(item.properties._quuid);
        this._ajax_get(this.url, utils.omit(item.properties, '_quuid'), callback);
        results.push(null);
      }
      return results;
    };

    GimelAdapter.prototype._user_uuid = function(experiment, goal) {
      if (!experiment.user_id) {
        return utils.uuid();
      }
      if (!goal.unique) {
        return utils.uuid();
      }
      return utils.sha1(this.namespace + "." + experiment.name + "." + experiment.user_id);
    };

    GimelAdapter.prototype._track = function(experiment, variant, goal) {
      utils.log("Persistent Queue Gimel track: " + this.namespace + ", " + experiment.name + ", " + variant + ", " + goal.name);
      if (this._queue.length > 100) {
        this._queue.shift();
      }
      this._queue.push({
        properties: {
          experiment: experiment.name,
          _quuid: utils.uuid(),
          uuid: this._user_uuid(experiment, goal),
          variant: variant,
          event: goal.name,
          namespace: this.namespace
        }
      });
      this._storage.set(this.queue_name, JSON.stringify(this._queue));
      return this._flush();
    };

    GimelAdapter.prototype.experiment_start = function(experiment, variant) {
      return this._track(experiment, variant, {
        name: 'participate',
        unique: true
      });
    };

    GimelAdapter.prototype.goal_complete = function(experiment, variant, goal_name, props) {
      return this._track(experiment, variant, utils.defaults({
        name: goal_name
      }, props));
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

    PersistentQueueGoogleAnalyticsAdapter.prototype.experiment_start = function(experiment, variant) {
      return this._track(this.namespace, experiment.name + " | " + variant, 'Visitors');
    };

    PersistentQueueGoogleAnalyticsAdapter.prototype.goal_complete = function(experiment, variant, goal_name, _props) {
      return this._track(this.namespace, experiment.name + " | " + variant, goal_name);
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

    PersistentQueueKeenAdapter.prototype._remove_quuid = function(quuid) {
      return (function(_this) {
        return function(err, res) {
          if (err) {
            return;
          }
          utils.remove(_this._queue, function(el) {
            return el.properties._quuid === quuid;
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
        callback = this._remove_quuid(item.properties._quuid);
        results.push(this.client.addEvent(item.experiment_name, utils.omit(item.properties, '_quuid'), callback));
      }
      return results;
    };

    PersistentQueueKeenAdapter.prototype._user_uuid = function(experiment, goal) {
      if (!experiment.user_id) {
        return utils.uuid();
      }
      if (!goal.unique) {
        return utils.uuid();
      }
      return utils.sha1(this.namespace + "." + experiment.name + "." + experiment.user_id);
    };

    PersistentQueueKeenAdapter.prototype._track = function(experiment, variant, goal) {
      utils.log("Persistent Queue Keen track: " + experiment.name + ", " + variant + ", " + event);
      if (this._queue.length > 100) {
        this._queue.shift();
      }
      this._queue.push({
        experiment_name: experiment.name,
        properties: {
          _quuid: utils.uuid(),
          uuid: this._user_uuid(experiment, goal),
          variant: variant,
          event: goal.name
        }
      });
      this._storage.set(this.queue_name, JSON.stringify(this._queue));
      return this._flush();
    };

    PersistentQueueKeenAdapter.prototype.experiment_start = function(experiment, variant) {
      return this._track(experiment, variant, {
        name: 'participate',
        unique: true
      });
    };

    PersistentQueueKeenAdapter.prototype.goal_complete = function(experiment, variant, goal_name, props) {
      return this._track(experiment, variant, utils.defaults({
        name: goal_name
      }, props));
    };

    return PersistentQueueKeenAdapter;

  })();

  Adapters.GoogleUniversalAnalyticsAdapter = (function() {
    function GoogleUniversalAnalyticsAdapter() {}

    GoogleUniversalAnalyticsAdapter.namespace = 'alephbet';

    GoogleUniversalAnalyticsAdapter._track = function(category, action, label) {
      utils.log("Google Universal Analytics track: " + category + ", " + action + ", " + label);
      if (typeof ga !== 'function') {
        throw new Error('ga not defined. Please make sure your Universal analytics is set up correctly');
      }
      return ga('send', 'event', category, action, label, {
        'nonInteraction': 1
      });
    };

    GoogleUniversalAnalyticsAdapter.experiment_start = function(experiment, variant) {
      return GoogleUniversalAnalyticsAdapter._track(GoogleUniversalAnalyticsAdapter.namespace, experiment.name + " | " + variant, 'Visitors');
    };

    GoogleUniversalAnalyticsAdapter.goal_complete = function(experiment, variant, goal_name, _props) {
      return GoogleUniversalAnalyticsAdapter._track(GoogleUniversalAnalyticsAdapter.namespace, experiment.name + " | " + variant, goal_name);
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


},{"./storage":8,"./utils":9}],6:[function(require,module,exports){
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
      user_id: null,
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
      this.user_id = this.options.user_id;
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
      this.tracking().experiment_start(this, variant);
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
      return this.tracking().goal_complete(this, variant, goal_name, props);
    };

    Experiment.prototype.get_stored_variant = function() {
      return this.storage().get(this.options.name + ":variant");
    };

    Experiment.prototype.pick_variant = function() {
      var all_variants_have_weights;
      all_variants_have_weights = utils.check_weights(this.variants);
      utils.log("all variants have weights: " + all_variants_have_weights);
      if (all_variants_have_weights) {
        return this.pick_weighted_variant();
      } else {
        return this.pick_unweighted_variant();
      }
    };

    Experiment.prototype.pick_weighted_variant = function() {
      var key, ref, value, weighted_index, weights_sum;
      weights_sum = utils.sum_weights(this.variants);
      weighted_index = Math.ceil(this._random('variant') * weights_sum);
      ref = this.variants;
      for (key in ref) {
        value = ref[key];
        weighted_index -= value.weight;
        if (weighted_index <= 0) {
          return key;
        }
      }
    };

    Experiment.prototype.pick_unweighted_variant = function() {
      var chosen_partition, partitions, variant;
      partitions = 1.0 / this.variant_names.length;
      chosen_partition = Math.floor(this._random('variant') / partitions);
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
      active = this._random('sample') <= this.options.sample;
      this.storage().set(this.options.name + ":in_sample", active);
      return active;
    };

    Experiment.prototype._random = function(salt) {
      var seed;
      if (!this.user_id) {
        return utils.random();
      }
      seed = this.name + "." + salt + "." + this.user_id;
      return utils.random(seed);
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


},{"./adapters":5,"./options":7,"./utils":9}],7:[function(require,module,exports){
module.exports = {
  debug: false
};


},{}],8:[function(require,module,exports){
var Basil, Storage, store;

Basil = require('basil.js');

store = Basil["new"];

Storage = (function() {
  function Storage(namespace) {
    this.namespace = namespace != null ? namespace : 'alephbet';
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


},{"basil.js":1}],9:[function(require,module,exports){
var Utils, _, options, sha1, uuid;

_ = require('../vendor/lodash.custom.min');

uuid = require('node-uuid');

sha1 = require('crypto-js/sha1');

options = require('./options');

Utils = (function() {
  function Utils() {}

  Utils.defaults = _.defaults;

  Utils.keys = _.keys;

  Utils.remove = _.remove;

  Utils.omit = _.omit;

  Utils.log = function(message) {
    if (options.debug) {
      return console.log(message);
    }
  };

  Utils.uuid = uuid.v4;

  Utils.sha1 = function(text) {
    return sha1(text).toString();
  };

  Utils.random = function(seed) {
    if (!seed) {
      return Math.random();
    }
    return parseInt(this.sha1(seed).substr(0, 13), 16) / 0xFFFFFFFFFFFFF;
  };

  Utils.check_weights = function(variants) {
    var contains_weight, key, value;
    contains_weight = [];
    for (key in variants) {
      value = variants[key];
      contains_weight.push(value.weight != null);
    }
    return contains_weight.every(function(has_weight) {
      return has_weight;
    });
  };

  Utils.sum_weights = function(variants) {
    var key, sum, value;
    sum = 0;
    for (key in variants) {
      value = variants[key];
      sum += value.weight || 0;
    }
    return sum;
  };

  Utils.validate_weights = function(variants) {
    var contains_weight, key, value;
    contains_weight = [];
    for (key in variants) {
      value = variants[key];
      contains_weight.push(value.weight != null);
    }
    return contains_weight.every(function(has_weight) {
      return has_weight || contains_weight.every(function(has_weight) {
        return !has_weight;
      });
    });
  };

  return Utils;

})();

module.exports = Utils;


},{"../vendor/lodash.custom.min":10,"./options":7,"crypto-js/sha1":3,"node-uuid":4}],10:[function(require,module,exports){
(function (global){
/**
 * @license
 * lodash 3.10.1 (Custom Build) lodash.com/license | Underscore.js 1.8.3 underscorejs.org/LICENSE
 * Build: `lodash -p include="keys,defaults,remove,omit" exports="node" -o ./vendor/lodash.custom.min.js`
 */
;(function(){function na(a,b,c){if(b!==b){a:{b=a.length;for(c+=-1;++c<b;){var e=a[c];if(e!==e){a=c;break a}}a=-1}return a}c-=1;for(e=a.length;++c<e;)if(a[c]===b)return c;return-1}function A(a){return!!a&&typeof a=="object"}function m(){}function xa(a){var b=a?a.length:0;for(this.data={hash:ya(null),set:new za};b--;)this.push(a[b])}function Za(a,b){var c=a.data;return(typeof b=="string"||t(b)?c.set.has(b):c.hash[b])?0:-1}function $a(a,b){var c=-1,e=a.length;for(b||(b=Array(e));++c<e;)b[c]=a[c];
return b}function Aa(a,b){for(var c=-1,e=a.length;++c<e&&false!==b(a[c],c,a););return a}function ab(a){for(var b=String,c=-1,e=a.length,d=Array(e);++c<e;)d[c]=b(a[c],c,a);return d}function bb(a,b){for(var c=-1,e=a.length;++c<e;)if(b(a[c],c,a))return true;return false}function Ba(a,b){var c;if(null==b)c=a;else{c=C(b);var e=a;e||(e={});for(var d=-1,f=c.length;++d<f;){var h=c[d];e[h]=b[h]}c=e}return c}function Ca(a,b,c){var e=typeof a;return"function"==e?b===p?a:oa(a,b,c):null==a?Q:"object"==e?Da(a):b===p?Ea(a):
cb(a,b)}function Fa(a,b,c,e,d,f,h){var g;c&&(g=d?c(a,e,d):c(a));if(g!==p)return g;if(!t(a))return a;if(e=x(a)){if(g=db(a),!b)return $a(a,g)}else{var l=B.call(a),n=l==G;if(l==u||l==H||n&&!d){if(R(a))return d?a:{};g=eb(n?{}:a);if(!b)return Ba(g,a)}else return r[l]?fb(a,l,b):d?a:{}}f||(f=[]);h||(h=[]);for(d=f.length;d--;)if(f[d]==a)return h[d];f.push(a);h.push(g);(e?Aa:gb)(a,function(e,d){g[d]=Fa(e,b,c,d,a,f,h)});return g}function hb(a,b){var c=a?a.length:0,e=[];if(!c)return e;var d=-1,f;f=m.indexOf||
pa;f=f===pa?na:f;var h=f===na,g=h&&b.length>=ib?ya&&za?new xa(b):null:null,l=b.length;g&&(f=Za,h=false,b=g);a:for(;++d<c;)if(g=a[d],h&&g===g){for(var n=l;n--;)if(b[n]===g)continue a;e.push(g)}else 0>f(b,g,0)&&e.push(g);return e}function Ga(a,b,c,e){e||(e=[]);for(var d=-1,f=a.length;++d<f;){var h=a[d];if(A(h)&&S(h)&&(c||x(h)||T(h)))if(b)Ga(h,b,c,e);else for(var g=e,l=-1,n=h.length,k=g.length;++l<n;)g[k+l]=h[l];else c||(e[e.length]=h)}return e}function jb(a,b){Ha(a,b,U)}function gb(a,b){return Ha(a,b,
C)}function Ia(a,b,c){if(null!=a){a=y(a);c!==p&&c in a&&(b=[c]);c=0;for(var e=b.length;null!=a&&c<e;)a=y(a)[b[c++]];return c&&c==e?a:p}}function qa(a,b,c,e,d,f){if(a===b)a=true;else if(null==a||null==b||!t(a)&&!A(b))a=a!==a&&b!==b;else a:{var h=qa,g=x(a),l=x(b),n=E,k=E;g||(n=B.call(a),n==H?n=u:n!=u&&(g=ra(a)));l||(k=B.call(b),k==H?k=u:k!=u&&ra(b));var p=n==u&&!R(a),l=k==u&&!R(b),k=n==k;if(!k||g||p){if(!e&&(n=p&&v.call(a,"__wrapped__"),l=l&&v.call(b,"__wrapped__"),n||l)){a=h(n?a.value():a,l?b.value():
b,c,e,d,f);break a}if(k){d||(d=[]);f||(f=[]);for(n=d.length;n--;)if(d[n]==a){a=f[n]==b;break a}d.push(a);f.push(b);a=(g?kb:lb)(a,b,h,c,e,d,f);d.pop();f.pop()}else a=false}else a=mb(a,b,n)}return a}function nb(a,b){var c=b.length,e=c;if(null==a)return!e;for(a=y(a);c--;){var d=b[c];if(d[2]?d[1]!==a[d[0]]:!(d[0]in a))return false}for(;++c<e;){var d=b[c],f=d[0],h=a[f],g=d[1];if(d[2]){if(h===p&&!(f in a))return false}else if(d=p,d===p?!qa(g,h,void 0,true):!d)return false}return true}function Da(a){var b=ob(a);if(1==b.length&&
b[0][2]){var c=b[0][0],e=b[0][1];return function(a){if(null==a)return false;a=y(a);return a[c]===e&&(e!==p||c in a)}}return function(a){return nb(a,b)}}function cb(a,b){var c=x(a),e=Ja(a)&&b===b&&!t(b),d=a+"";a=Ka(a);return function(f){if(null==f)return false;var h=d;f=y(f);if(!(!c&&e||h in f)){if(1!=a.length){var h=a,g=0,l=-1,n=-1,k=h.length,g=null==g?0:+g||0;0>g&&(g=-g>k?0:k+g);l=l===p||l>k?k:+l||0;0>l&&(l+=k);k=g>l?0:l-g>>>0;g>>>=0;for(l=Array(k);++n<k;)l[n]=h[n+g];f=Ia(f,l)}if(null==f)return false;h=La(a);
f=y(f)}return f[h]===b?b!==p||h in f:qa(b,f[h],p,true)}}function Ma(a){return function(b){return null==b?p:y(b)[a]}}function pb(a){var b=a+"";a=Ka(a);return function(c){return Ia(c,a,b)}}function oa(a,b,c){if(typeof a!="function")return Q;if(b===p)return a;switch(c){case 1:return function(c){return a.call(b,c)};case 3:return function(c,d,f){return a.call(b,c,d,f)};case 4:return function(c,d,f,h){return a.call(b,c,d,f,h)};case 5:return function(c,d,f,h,g){return a.call(b,c,d,f,h,g)}}return function(){return a.apply(b,
arguments)}}function Na(a){var b=new qb(a.byteLength);(new sa(b)).set(new sa(a));return b}function kb(a,b,c,e,d,f,h){var g=-1,l=a.length,n=b.length;if(l!=n&&!(d&&n>l))return false;for(;++g<l;){var k=a[g],n=b[g],m=e?e(d?n:k,d?k:n,g):p;if(m!==p){if(m)continue;return false}if(d){if(!bb(b,function(a){return k===a||c(k,a,e,d,f,h)}))return false}else if(k!==n&&!c(k,n,e,d,f,h))return false}return true}function mb(a,b,c){switch(c){case I:case J:return+a==+b;case K:return a.name==b.name&&a.message==b.message;case L:return a!=
+a?b!=+b:a==+b;case M:case D:return a==b+""}return false}function lb(a,b,c,e,d,f,h){var g=C(a),l=g.length,n=C(b).length;if(l!=n&&!d)return false;for(n=l;n--;){var k=g[n];if(!(d?k in b:v.call(b,k)))return false}for(var m=d;++n<l;){var k=g[n],r=a[k],q=b[k],s=e?e(d?q:r,d?r:q,k):p;if(s===p?!c(r,q,e,d,f,h):!s)return false;m||(m="constructor"==k)}return m||(c=a.constructor,e=b.constructor,!(c!=e&&"constructor"in a&&"constructor"in b)||typeof c=="function"&&c instanceof c&&typeof e=="function"&&e instanceof e)?true:false}function ob(a){a=
Oa(a);for(var b=a.length;b--;){var c=a[b][1];a[b][2]=c===c&&!t(c)}return a}function V(a,b){var c=null==a?p:a[b];return Pa(c)?c:p}function db(a){var b=a.length,c=new a.constructor(b);b&&"string"==typeof a[0]&&v.call(a,"index")&&(c.index=a.index,c.input=a.input);return c}function eb(a){a=a.constructor;typeof a=="function"&&a instanceof a||(a=Object);return new a}function fb(a,b,c){var e=a.constructor;switch(b){case ta:return Na(a);case I:case J:return new e(+a);case W:case X:case Y:case Z:case $:case aa:case ba:case ca:case da:return e instanceof
e&&(e=z[b]),b=a.buffer,new e(c?Na(b):b,a.byteOffset,a.length);case L:case D:return new e(a);case M:var d=new e(a.source,rb.exec(a));d.lastIndex=a.lastIndex}return d}function S(a){return null!=a&&N(sb(a))}function ea(a,b){a=typeof a=="number"||tb.test(a)?+a:-1;b=null==b?Qa:b;return-1<a&&0==a%1&&a<b}function Ra(a,b,c){if(!t(c))return false;var e=typeof b;return("number"==e?S(c)&&ea(b,c.length):"string"==e&&b in c)?(b=c[b],a===a?a===b:b!==b):false}function Ja(a){var b=typeof a;return"string"==b&&ub.test(a)||
"number"==b?true:x(a)?false:!vb.test(a)||false}function N(a){return typeof a=="number"&&-1<a&&0==a%1&&a<=Qa}function wb(a,b){a=y(a);for(var c=-1,e=b.length,d={};++c<e;){var f=b[c];f in a&&(d[f]=a[f])}return d}function xb(a,b){var c={};jb(a,function(a,d,f){b(a,d,f)&&(c[d]=a)});return c}function Sa(a){for(var b=U(a),c=b.length,e=c&&a.length,d=!!e&&N(e)&&(x(a)||T(a)||fa(a)),f=-1,h=[];++f<c;){var g=b[f];(d&&ea(g,e)||v.call(a,g))&&h.push(g)}return h}function y(a){if(m.support.unindexedChars&&fa(a)){for(var b=-1,
c=a.length,e=Object(a);++b<c;)e[b]=a.charAt(b);return e}return t(a)?a:Object(a)}function Ka(a){if(x(a))return a;var b=[];(null==a?"":a+"").replace(yb,function(a,e,d,f){b.push(d?f.replace(zb,"$1"):e||a)});return b}function pa(a,b,c){var e=a?a.length:0;if(!e)return-1;if(typeof c=="number")c=0>c?ua(e+c,0):c;else if(c){c=0;var d=a?a.length:c;if(typeof b=="number"&&b===b&&d<=Ab){for(;c<d;){var f=c+d>>>1,h=a[f];h<b&&null!==h?c=f+1:d=f}c=d}else{d=Q;c=d(b);for(var f=0,h=a?a.length:0,g=c!==c,l=null===c,n=
c===p;f<h;){var k=Bb((f+h)/2),m=d(a[k]),r=m!==p,q=m===m;(g?q:l?q&&r&&null!=m:n?q&&r:null==m?0:m<c)?f=k+1:h=k}c=Cb(h,Db)}return c<e&&(b===b?b===a[c]:a[c]!==a[c])?c:-1}return na(a,b,c||0)}function La(a){var b=a?a.length:0;return b?a[b-1]:p}function ga(a,b){if(typeof a!="function")throw new TypeError(Eb);b=ua(b===p?a.length-1:+b||0,0);return function(){for(var c=arguments,e=-1,d=ua(c.length-b,0),f=Array(d);++e<d;)f[e]=c[b+e];switch(b){case 0:return a.call(this,f);case 1:return a.call(this,c[0],f);case 2:return a.call(this,
c[0],c[1],f)}d=Array(b+1);for(e=-1;++e<b;)d[e]=c[e];d[b]=f;return a.apply(this,d)}}function T(a){return A(a)&&S(a)&&v.call(a,"callee")&&!ha.call(a,"callee")}function ia(a){return t(a)&&B.call(a)==G}function t(a){var b=typeof a;return!!a&&("object"==b||"function"==b)}function Pa(a){return null==a?false:ia(a)?Ta.test(Ua.call(a)):A(a)&&(R(a)?Ta:Fb).test(a)}function fa(a){return typeof a=="string"||A(a)&&B.call(a)==D}function ra(a){return A(a)&&N(a.length)&&!!q[B.call(a)]}function U(a){if(null==a)return[];
t(a)||(a=Object(a));for(var b=a.length,c=m.support,b=b&&N(b)&&(x(a)||T(a)||fa(a))&&b||0,e=a.constructor,d=-1,e=ia(e)&&e.prototype||F,f=e===a,h=Array(b),g=0<b,l=c.enumErrorProps&&(a===ja||a instanceof Error),n=c.enumPrototypes&&ia(a);++d<b;)h[d]=d+"";for(var k in a)n&&"prototype"==k||l&&("message"==k||"name"==k)||g&&ea(k,b)||"constructor"==k&&(f||!v.call(a,k))||h.push(k);if(c.nonEnumShadows&&a!==F)for(b=a===Gb?D:a===ja?K:B.call(a),c=s[b]||s[u],b==u&&(e=F),b=va.length;b--;)k=va[b],d=c[k],f&&d||(d?!v.call(a,
k):a[k]===e[k])||h.push(k);return h}function Oa(a){a=y(a);for(var b=-1,c=C(a),e=c.length,d=Array(e);++b<e;){var f=c[b];d[b]=[f,a[f]]}return d}function ka(a,b,c){c&&Ra(a,b,c)&&(b=p);return A(a)?Va(a):Ca(a,b)}function Q(a){return a}function Va(a){return Da(Fa(a,true))}function Ea(a){return Ja(a)?Ma(a):pb(a)}var p,ib=200,Eb="Expected a function",H="[object Arguments]",E="[object Array]",I="[object Boolean]",J="[object Date]",K="[object Error]",G="[object Function]",L="[object Number]",u="[object Object]",
M="[object RegExp]",D="[object String]",ta="[object ArrayBuffer]",W="[object Float32Array]",X="[object Float64Array]",Y="[object Int8Array]",Z="[object Int16Array]",$="[object Int32Array]",aa="[object Uint8Array]",ba="[object Uint8ClampedArray]",ca="[object Uint16Array]",da="[object Uint32Array]",vb=/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\n\\]|\\.)*?\1)\]/,ub=/^\w*$/,yb=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\n\\]|\\.)*?)\2)\]/g,zb=/\\(\\)?/g,rb=/\w*$/,Fb=/^\[object .+?Constructor\]$/,tb=/^\d+$/,
va="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" "),q={};q[W]=q[X]=q[Y]=q[Z]=q[$]=q[aa]=q[ba]=q[ca]=q[da]=true;q[H]=q[E]=q[ta]=q[I]=q[J]=q[K]=q[G]=q["[object Map]"]=q[L]=q[u]=q[M]=q["[object Set]"]=q[D]=q["[object WeakMap]"]=false;var r={};r[H]=r[E]=r[ta]=r[I]=r[J]=r[W]=r[X]=r[Y]=r[Z]=r[$]=r[L]=r[u]=r[M]=r[D]=r[aa]=r[ba]=r[ca]=r[da]=true;r[K]=r[G]=r["[object Map]"]=r["[object Set]"]=r["[object WeakMap]"]=false;var la={"function":true,object:true},ma=la[typeof exports]&&
exports&&!exports.nodeType&&exports,O=la[typeof module]&&module&&!module.nodeType&&module,Hb=la[typeof self]&&self&&self.Object&&self,Wa=la[typeof window]&&window&&window.Object&&window,Ib=O&&O.exports===ma&&ma,w=ma&&O&&typeof global=="object"&&global&&global.Object&&global||Wa!==(this&&this.window)&&Wa||Hb||this,R=function(){try{Object({toString:0}+"")}catch(a){return function(){return false}}return function(a){return typeof a.toString!="function"&&typeof(a+"")=="string"}}(),Jb=Array.prototype,ja=Error.prototype,
F=Object.prototype,Gb=String.prototype,Ua=Function.prototype.toString,v=F.hasOwnProperty,B=F.toString,Ta=RegExp("^"+Ua.call(v).replace(/[\\^$.*+?()[\]{}|]/g,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$"),qb=w.ArrayBuffer,ha=F.propertyIsEnumerable,za=V(w,"Set"),Xa=Jb.splice,sa=w.Uint8Array,ya=V(Object,"create"),Bb=Math.floor,Kb=V(Array,"isArray"),Ya=V(Object,"keys"),ua=Math.max,Cb=Math.min,Db=4294967294,Ab=2147483647,Qa=9007199254740991,z={};z[W]=w.Float32Array;
z[X]=w.Float64Array;z[Y]=w.Int8Array;z[Z]=w.Int16Array;z[$]=w.Int32Array;z[aa]=sa;z[ba]=w.Uint8ClampedArray;z[ca]=w.Uint16Array;z[da]=w.Uint32Array;var s={};s[E]=s[J]=s[L]={constructor:true,toLocaleString:true,toString:true,valueOf:true};s[I]=s[D]={constructor:true,toString:true,valueOf:true};s[K]=s[G]=s[M]={constructor:true,toString:true};s[u]={constructor:true};Aa(va,function(a){for(var b in s)if(v.call(s,b)){var c=s[b];c[a]=v.call(c,a)}});var P=m.support={};(function(a){function b(){this.x=a}var c={0:a,length:a},
e=[];b.prototype={valueOf:a,y:a};for(var d in new b)e.push(d);P.enumErrorProps=ha.call(ja,"message")||ha.call(ja,"name");P.enumPrototypes=ha.call(b,"prototype");P.nonEnumShadows=!/valueOf/.test(e);P.spliceObjects=(Xa.call(c,0,1),!c[0]);P.unindexedChars="xx"!="x"[0]+Object("x")[0]})(1,0);var Ha=function(a){return function(b,c,e){var d=y(b);e=e(b);for(var f=e.length,h=a?f:-1;a?h--:++h<f;){var g=e[h];if(false===c(d[g],g,d))break}return b}}(),sb=Ma("length"),x=Kb||function(a){return A(a)&&N(a.length)&&B.call(a)==
E},wa=function(a){return ga(function(b,c){var e=-1,d=null==b?0:c.length,f=2<d?c[d-2]:p,h=2<d?c[2]:p,g=1<d?c[d-1]:p;typeof f=="function"?(f=oa(f,g,5),d-=2):(f=typeof g=="function"?g:p,d-=f?1:0);h&&Ra(c[0],c[1],h)&&(f=3>d?p:f,d=1);for(;++e<d;)(h=c[e])&&a(b,h,f);return b})}(function(a,b,c){if(c)for(var e=-1,d=C(b),f=d.length;++e<f;){var h=d[e],g=a[h],l=c(g,b[h],h,a,b);(l===l?l===g:g!==g)&&(g!==p||h in a)||(a[h]=l)}else a=Ba(a,b);return a}),Lb=function(a,b){return ga(function(c){var e=c[0];if(null==e)return e;
c.push(b);return a.apply(p,c)})}(wa,function(a,b){return a===p?b:a}),C=Ya?function(a){var b=null==a?p:a.constructor;return typeof b=="function"&&b.prototype===a||(typeof a=="function"?m.support.enumPrototypes:S(a))?Sa(a):t(a)?Ya(a):[]}:Sa,Mb=ga(function(a,b){if(null==a)return{};if("function"!=typeof b[0])return b=ab(Ga(b)),wb(a,hb(U(a),b));var c=oa(b[0],b[1],3);return xb(a,function(a,b,f){return!c(a,b,f)})});xa.prototype.push=function(a){var b=this.data;typeof a=="string"||t(a)?b.set.add(a):b.hash[a]=
!0};m.assign=wa;m.callback=ka;m.defaults=Lb;m.keys=C;m.keysIn=U;m.matches=Va;m.omit=Mb;m.pairs=Oa;m.property=Ea;m.remove=function(a,b,c){var e=[];if(!a||!a.length)return e;var d=-1,f=[],h=a.length,g=m.callback||ka,g=g===ka?Ca:g;for(b=g(b,c,3);++d<h;)c=a[d],b(c,d,a)&&(e.push(c),f.push(d));for(b=a?f.length:0;b--;)if(d=f[b],d!=l&&ea(d)){var l=d;Xa.call(a,d,1)}return e};m.restParam=ga;m.extend=wa;m.iteratee=ka;m.identity=Q;m.indexOf=pa;m.isArguments=T;m.isArray=x;m.isFunction=ia;m.isNative=Pa;m.isObject=
t;m.isString=fa;m.isTypedArray=ra;m.last=La;m.VERSION="3.10.1";ma&&O&&Ib&&((O.exports=m)._=m)}.call(this));
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},[6])(6)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYmFzaWwuanMvYnVpbGQvYmFzaWwuanMiLCJub2RlX21vZHVsZXMvY3J5cHRvLWpzL2NvcmUuanMiLCJub2RlX21vZHVsZXMvY3J5cHRvLWpzL3NoYTEuanMiLCJub2RlX21vZHVsZXMvbm9kZS11dWlkL3V1aWQuanMiLCJzcmMvYWRhcHRlcnMuY29mZmVlIiwic3JjL2FsZXBoYmV0LmNvZmZlZSIsInNyYy9vcHRpb25zLmNvZmZlZSIsInNyYy9zdG9yYWdlLmNvZmZlZSIsInNyYy91dGlscy5jb2ZmZWUiLCJ2ZW5kb3IvbG9kYXNoLmN1c3RvbS5taW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvWUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdnZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOVZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uICgpIHtcblx0Ly8gQmFzaWxcblx0dmFyIEJhc2lsID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcblx0XHRyZXR1cm4gQmFzaWwudXRpbHMuZXh0ZW5kKHt9LCBCYXNpbC5wbHVnaW5zLCBuZXcgQmFzaWwuU3RvcmFnZSgpLmluaXQob3B0aW9ucykpO1xuXHR9O1xuXG5cdC8vIFZlcnNpb25cblx0QmFzaWwudmVyc2lvbiA9ICcwLjQuMTAnO1xuXG5cdC8vIFV0aWxzXG5cdEJhc2lsLnV0aWxzID0ge1xuXHRcdGV4dGVuZDogZnVuY3Rpb24gKCkge1xuXHRcdFx0dmFyIGRlc3RpbmF0aW9uID0gdHlwZW9mIGFyZ3VtZW50c1swXSA9PT0gJ29iamVjdCcgPyBhcmd1bWVudHNbMF0gOiB7fTtcblx0XHRcdGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmIChhcmd1bWVudHNbaV0gJiYgdHlwZW9mIGFyZ3VtZW50c1tpXSA9PT0gJ29iamVjdCcpXG5cdFx0XHRcdFx0Zm9yICh2YXIgcHJvcGVydHkgaW4gYXJndW1lbnRzW2ldKVxuXHRcdFx0XHRcdFx0ZGVzdGluYXRpb25bcHJvcGVydHldID0gYXJndW1lbnRzW2ldW3Byb3BlcnR5XTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBkZXN0aW5hdGlvbjtcblx0XHR9LFxuXHRcdGVhY2g6IGZ1bmN0aW9uIChvYmosIGZuSXRlcmF0b3IsIGNvbnRleHQpIHtcblx0XHRcdGlmICh0aGlzLmlzQXJyYXkob2JqKSkge1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG9iai5sZW5ndGg7IGkrKylcblx0XHRcdFx0XHRpZiAoZm5JdGVyYXRvci5jYWxsKGNvbnRleHQsIG9ialtpXSwgaSkgPT09IGZhbHNlKSByZXR1cm47XG5cdFx0XHR9IGVsc2UgaWYgKG9iaikge1xuXHRcdFx0XHRmb3IgKHZhciBrZXkgaW4gb2JqKVxuXHRcdFx0XHRcdGlmIChmbkl0ZXJhdG9yLmNhbGwoY29udGV4dCwgb2JqW2tleV0sIGtleSkgPT09IGZhbHNlKSByZXR1cm47XG5cdFx0XHR9XG5cdFx0fSxcblx0XHR0cnlFYWNoOiBmdW5jdGlvbiAob2JqLCBmbkl0ZXJhdG9yLCBmbkVycm9yLCBjb250ZXh0KSB7XG5cdFx0XHR0aGlzLmVhY2gob2JqLCBmdW5jdGlvbiAodmFsdWUsIGtleSkge1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdHJldHVybiBmbkl0ZXJhdG9yLmNhbGwoY29udGV4dCwgdmFsdWUsIGtleSk7XG5cdFx0XHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRcdFx0aWYgKHRoaXMuaXNGdW5jdGlvbihmbkVycm9yKSkge1xuXHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0Zm5FcnJvci5jYWxsKGNvbnRleHQsIHZhbHVlLCBrZXksIGVycm9yKTtcblx0XHRcdFx0XHRcdH0gY2F0Y2ggKGVycm9yKSB7fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSwgdGhpcyk7XG5cdFx0fSxcblx0XHRyZWdpc3RlclBsdWdpbjogZnVuY3Rpb24gKG1ldGhvZHMpIHtcblx0XHRcdEJhc2lsLnBsdWdpbnMgPSB0aGlzLmV4dGVuZChtZXRob2RzLCBCYXNpbC5wbHVnaW5zKTtcblx0XHR9LFxuXHRcdGdldFR5cGVPZjogZnVuY3Rpb24gKG9iaikge1xuXHRcdFx0aWYgKHR5cGVvZiBvYmogPT09ICd1bmRlZmluZWQnIHx8IG9iaiA9PT0gbnVsbClcblx0XHRcdFx0cmV0dXJuICcnICsgb2JqO1xuXHRcdFx0cmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopLnJlcGxhY2UoL15cXFtvYmplY3RcXHMoLiopXFxdJC8sIGZ1bmN0aW9uICgkMCwgJDEpIHsgcmV0dXJuICQxLnRvTG93ZXJDYXNlKCk7IH0pO1xuXHRcdH1cblx0fTtcblxuXHQvLyBBZGQgc29tZSBpc1R5cGUgbWV0aG9kczogaXNBcmd1bWVudHMsIGlzQm9vbGVhbiwgaXNGdW5jdGlvbiwgaXNTdHJpbmcsIGlzQXJyYXksIGlzTnVtYmVyLCBpc0RhdGUsIGlzUmVnRXhwLCBpc1VuZGVmaW5lZCwgaXNOdWxsLlxuXHR2YXIgdHlwZXMgPSBbJ0FyZ3VtZW50cycsICdCb29sZWFuJywgJ0Z1bmN0aW9uJywgJ1N0cmluZycsICdBcnJheScsICdOdW1iZXInLCAnRGF0ZScsICdSZWdFeHAnLCAnVW5kZWZpbmVkJywgJ051bGwnXTtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0eXBlcy5sZW5ndGg7IGkrKykge1xuXHRcdEJhc2lsLnV0aWxzWydpcycgKyB0eXBlc1tpXV0gPSAoZnVuY3Rpb24gKHR5cGUpIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbiAob2JqKSB7XG5cdFx0XHRcdHJldHVybiBCYXNpbC51dGlscy5nZXRUeXBlT2Yob2JqKSA9PT0gdHlwZS50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0fTtcblx0XHR9KSh0eXBlc1tpXSk7XG5cdH1cblxuXHQvLyBQbHVnaW5zXG5cdEJhc2lsLnBsdWdpbnMgPSB7fTtcblxuXHQvLyBPcHRpb25zXG5cdEJhc2lsLm9wdGlvbnMgPSBCYXNpbC51dGlscy5leHRlbmQoe1xuXHRcdG5hbWVzcGFjZTogJ2I0NWkxJyxcblx0XHRzdG9yYWdlczogWydsb2NhbCcsICdjb29raWUnLCAnc2Vzc2lvbicsICdtZW1vcnknXSxcblx0XHRleHBpcmVEYXlzOiAzNjUsXG5cdFx0a2V5RGVsaW1pdGVyOiAnLidcblx0fSwgd2luZG93LkJhc2lsID8gd2luZG93LkJhc2lsLm9wdGlvbnMgOiB7fSk7XG5cblx0Ly8gU3RvcmFnZVxuXHRCYXNpbC5TdG9yYWdlID0gZnVuY3Rpb24gKCkge1xuXHRcdHZhciBfc2FsdCA9ICdiNDVpMScgKyAoTWF0aC5yYW5kb20oKSArIDEpXG5cdFx0XHRcdC50b1N0cmluZygzNilcblx0XHRcdFx0LnN1YnN0cmluZyg3KSxcblx0XHRcdF9zdG9yYWdlcyA9IHt9LFxuXHRcdFx0X2lzVmFsaWRLZXkgPSBmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHRcdHZhciB0eXBlID0gQmFzaWwudXRpbHMuZ2V0VHlwZU9mKGtleSk7XG5cdFx0XHRcdHJldHVybiAodHlwZSA9PT0gJ3N0cmluZycgJiYga2V5KSB8fCB0eXBlID09PSAnbnVtYmVyJyB8fCB0eXBlID09PSAnYm9vbGVhbic7XG5cdFx0XHR9LFxuXHRcdFx0X3RvU3RvcmFnZXNBcnJheSA9IGZ1bmN0aW9uIChzdG9yYWdlcykge1xuXHRcdFx0XHRpZiAoQmFzaWwudXRpbHMuaXNBcnJheShzdG9yYWdlcykpXG5cdFx0XHRcdFx0cmV0dXJuIHN0b3JhZ2VzO1xuXHRcdFx0XHRyZXR1cm4gQmFzaWwudXRpbHMuaXNTdHJpbmcoc3RvcmFnZXMpID8gW3N0b3JhZ2VzXSA6IFtdO1xuXHRcdFx0fSxcblx0XHRcdF90b1N0b3JlZEtleSA9IGZ1bmN0aW9uIChuYW1lc3BhY2UsIHBhdGgsIGRlbGltaXRlcikge1xuXHRcdFx0XHR2YXIga2V5ID0gJyc7XG5cdFx0XHRcdGlmIChfaXNWYWxpZEtleShwYXRoKSkge1xuXHRcdFx0XHRcdGtleSArPSBwYXRoO1xuXHRcdFx0XHR9IGVsc2UgaWYgKEJhc2lsLnV0aWxzLmlzQXJyYXkocGF0aCkpIHtcblx0XHRcdFx0XHRwYXRoID0gQmFzaWwudXRpbHMuaXNGdW5jdGlvbihwYXRoLmZpbHRlcikgPyBwYXRoLmZpbHRlcihfaXNWYWxpZEtleSkgOiBwYXRoO1xuXHRcdFx0XHRcdGtleSA9IHBhdGguam9pbihkZWxpbWl0ZXIpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBrZXkgJiYgX2lzVmFsaWRLZXkobmFtZXNwYWNlKSA/IG5hbWVzcGFjZSArIGRlbGltaXRlciArIGtleSA6IGtleTtcbiBcdFx0XHR9LFxuXHRcdFx0X3RvS2V5TmFtZSA9IGZ1bmN0aW9uIChuYW1lc3BhY2UsIGtleSwgZGVsaW1pdGVyKSB7XG5cdFx0XHRcdGlmICghX2lzVmFsaWRLZXkobmFtZXNwYWNlKSlcblx0XHRcdFx0XHRyZXR1cm4ga2V5O1xuXHRcdFx0XHRyZXR1cm4ga2V5LnJlcGxhY2UobmV3IFJlZ0V4cCgnXicgKyBuYW1lc3BhY2UgKyBkZWxpbWl0ZXIpLCAnJyk7XG5cdFx0XHR9LFxuXHRcdFx0X3RvU3RvcmVkVmFsdWUgPSBmdW5jdGlvbiAodmFsdWUpIHtcblx0XHRcdFx0cmV0dXJuIEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcblx0XHRcdH0sXG5cdFx0XHRfZnJvbVN0b3JlZFZhbHVlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG5cdFx0XHRcdHJldHVybiB2YWx1ZSA/IEpTT04ucGFyc2UodmFsdWUpIDogbnVsbDtcblx0XHRcdH07XG5cblx0XHQvLyBIVE1MNSB3ZWIgc3RvcmFnZSBpbnRlcmZhY2Vcblx0XHR2YXIgd2ViU3RvcmFnZUludGVyZmFjZSA9IHtcblx0XHRcdGVuZ2luZTogbnVsbCxcblx0XHRcdGNoZWNrOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0d2luZG93W3RoaXMuZW5naW5lXS5zZXRJdGVtKF9zYWx0LCB0cnVlKTtcblx0XHRcdFx0XHR3aW5kb3dbdGhpcy5lbmdpbmVdLnJlbW92ZUl0ZW0oX3NhbHQpO1xuXHRcdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fSxcblx0XHRcdHNldDogZnVuY3Rpb24gKGtleSwgdmFsdWUsIG9wdGlvbnMpIHtcblx0XHRcdFx0aWYgKCFrZXkpXG5cdFx0XHRcdFx0dGhyb3cgRXJyb3IoJ2ludmFsaWQga2V5Jyk7XG5cdFx0XHRcdHdpbmRvd1t0aGlzLmVuZ2luZV0uc2V0SXRlbShrZXksIHZhbHVlKTtcblx0XHRcdH0sXG5cdFx0XHRnZXQ6IGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdFx0cmV0dXJuIHdpbmRvd1t0aGlzLmVuZ2luZV0uZ2V0SXRlbShrZXkpO1xuXHRcdFx0fSxcblx0XHRcdHJlbW92ZTogZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0XHR3aW5kb3dbdGhpcy5lbmdpbmVdLnJlbW92ZUl0ZW0oa2V5KTtcblx0XHRcdH0sXG5cdFx0XHRyZXNldDogZnVuY3Rpb24gKG5hbWVzcGFjZSkge1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMCwga2V5OyBpIDwgd2luZG93W3RoaXMuZW5naW5lXS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdGtleSA9IHdpbmRvd1t0aGlzLmVuZ2luZV0ua2V5KGkpO1xuXHRcdFx0XHRcdGlmICghbmFtZXNwYWNlIHx8IGtleS5pbmRleE9mKG5hbWVzcGFjZSkgPT09IDApIHtcblx0XHRcdFx0XHRcdHRoaXMucmVtb3ZlKGtleSk7XG5cdFx0XHRcdFx0XHRpLS07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0a2V5czogZnVuY3Rpb24gKG5hbWVzcGFjZSwgZGVsaW1pdGVyKSB7XG5cdFx0XHRcdHZhciBrZXlzID0gW107XG5cdFx0XHRcdGZvciAodmFyIGkgPSAwLCBrZXk7IGkgPCB3aW5kb3dbdGhpcy5lbmdpbmVdLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0a2V5ID0gd2luZG93W3RoaXMuZW5naW5lXS5rZXkoaSk7XG5cdFx0XHRcdFx0aWYgKCFuYW1lc3BhY2UgfHwga2V5LmluZGV4T2YobmFtZXNwYWNlKSA9PT0gMClcblx0XHRcdFx0XHRcdGtleXMucHVzaChfdG9LZXlOYW1lKG5hbWVzcGFjZSwga2V5LCBkZWxpbWl0ZXIpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4ga2V5cztcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0Ly8gbG9jYWwgc3RvcmFnZVxuXHRcdF9zdG9yYWdlcy5sb2NhbCA9IEJhc2lsLnV0aWxzLmV4dGVuZCh7fSwgd2ViU3RvcmFnZUludGVyZmFjZSwge1xuXHRcdFx0ZW5naW5lOiAnbG9jYWxTdG9yYWdlJ1xuXHRcdH0pO1xuXHRcdC8vIHNlc3Npb24gc3RvcmFnZVxuXHRcdF9zdG9yYWdlcy5zZXNzaW9uID0gQmFzaWwudXRpbHMuZXh0ZW5kKHt9LCB3ZWJTdG9yYWdlSW50ZXJmYWNlLCB7XG5cdFx0XHRlbmdpbmU6ICdzZXNzaW9uU3RvcmFnZSdcblx0XHR9KTtcblxuXHRcdC8vIG1lbW9yeSBzdG9yYWdlXG5cdFx0X3N0b3JhZ2VzLm1lbW9yeSA9IHtcblx0XHRcdF9oYXNoOiB7fSxcblx0XHRcdGNoZWNrOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fSxcblx0XHRcdHNldDogZnVuY3Rpb24gKGtleSwgdmFsdWUsIG9wdGlvbnMpIHtcblx0XHRcdFx0aWYgKCFrZXkpXG5cdFx0XHRcdFx0dGhyb3cgRXJyb3IoJ2ludmFsaWQga2V5Jyk7XG5cdFx0XHRcdHRoaXMuX2hhc2hba2V5XSA9IHZhbHVlO1xuXHRcdFx0fSxcblx0XHRcdGdldDogZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5faGFzaFtrZXldIHx8IG51bGw7XG5cdFx0XHR9LFxuXHRcdFx0cmVtb3ZlOiBmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHRcdGRlbGV0ZSB0aGlzLl9oYXNoW2tleV07XG5cdFx0XHR9LFxuXHRcdFx0cmVzZXQ6IGZ1bmN0aW9uIChuYW1lc3BhY2UpIHtcblx0XHRcdFx0Zm9yICh2YXIga2V5IGluIHRoaXMuX2hhc2gpIHtcblx0XHRcdFx0XHRpZiAoIW5hbWVzcGFjZSB8fCBrZXkuaW5kZXhPZihuYW1lc3BhY2UpID09PSAwKVxuXHRcdFx0XHRcdFx0dGhpcy5yZW1vdmUoa2V5KTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdGtleXM6IGZ1bmN0aW9uIChuYW1lc3BhY2UsIGRlbGltaXRlcikge1xuXHRcdFx0XHR2YXIga2V5cyA9IFtdO1xuXHRcdFx0XHRmb3IgKHZhciBrZXkgaW4gdGhpcy5faGFzaClcblx0XHRcdFx0XHRpZiAoIW5hbWVzcGFjZSB8fCBrZXkuaW5kZXhPZihuYW1lc3BhY2UpID09PSAwKVxuXHRcdFx0XHRcdFx0a2V5cy5wdXNoKF90b0tleU5hbWUobmFtZXNwYWNlLCBrZXksIGRlbGltaXRlcikpO1xuXHRcdFx0XHRyZXR1cm4ga2V5cztcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0Ly8gY29va2llIHN0b3JhZ2Vcblx0XHRfc3RvcmFnZXMuY29va2llID0ge1xuXHRcdFx0Y2hlY2s6IGZ1bmN0aW9uIChvcHRpb25zKSB7XG5cdFx0XHRcdGlmICghbmF2aWdhdG9yLmNvb2tpZUVuYWJsZWQpXG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRpZiAod2luZG93LnNlbGYgIT09IHdpbmRvdy50b3ApIHtcblx0XHRcdFx0XHQvLyB3ZSBuZWVkIHRvIGNoZWNrIHRoaXJkLXBhcnR5IGNvb2tpZXM7XG5cdFx0XHRcdFx0dmFyIGNvb2tpZSA9ICd0aGlyZHBhcnR5LmNoZWNrPScgKyBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAxMDAwKTtcblx0XHRcdFx0XHRkb2N1bWVudC5jb29raWUgPSBjb29raWUgKyAnOyBwYXRoPS8nO1xuXHRcdFx0XHRcdHJldHVybiBkb2N1bWVudC5jb29raWUuaW5kZXhPZihjb29raWUpICE9PSAtMTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBpZiBjb29raWUgc2VjdXJlIGFjdGl2YXRlZCwgZW5zdXJlIGl0IHdvcmtzIChub3QgdGhlIGNhc2UgaWYgd2UgYXJlIGluIGh0dHAgb25seSlcblx0XHRcdFx0aWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5zZWN1cmUpIHtcblx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0dGhpcy5zZXQoX3NhbHQsIF9zYWx0LCBvcHRpb25zKTtcblx0XHRcdFx0XHRcdHZhciBoYXNTZWN1cmVseVBlcnNpdGVkID0gdGhpcy5nZXQoX3NhbHQpID09PSBfc2FsdDtcblx0XHRcdFx0XHRcdHRoaXMucmVtb3ZlKF9zYWx0KTtcblx0XHRcdFx0XHRcdHJldHVybiBoYXNTZWN1cmVseVBlcnNpdGVkO1xuXHRcdFx0XHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fSxcblx0XHRcdHNldDogZnVuY3Rpb24gKGtleSwgdmFsdWUsIG9wdGlvbnMpIHtcblx0XHRcdFx0aWYgKCF0aGlzLmNoZWNrKCkpXG5cdFx0XHRcdFx0dGhyb3cgRXJyb3IoJ2Nvb2tpZXMgYXJlIGRpc2FibGVkJyk7XG5cdFx0XHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHRcdFx0XHRpZiAoIWtleSlcblx0XHRcdFx0XHR0aHJvdyBFcnJvcignaW52YWxpZCBrZXknKTtcblx0XHRcdFx0dmFyIGNvb2tpZSA9IGVuY29kZVVSSUNvbXBvbmVudChrZXkpICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKTtcblx0XHRcdFx0Ly8gaGFuZGxlIGV4cGlyYXRpb24gZGF5c1xuXHRcdFx0XHRpZiAob3B0aW9ucy5leHBpcmVEYXlzKSB7XG5cdFx0XHRcdFx0dmFyIGRhdGUgPSBuZXcgRGF0ZSgpO1xuXHRcdFx0XHRcdGRhdGUuc2V0VGltZShkYXRlLmdldFRpbWUoKSArIChvcHRpb25zLmV4cGlyZURheXMgKiAyNCAqIDYwICogNjAgKiAxMDAwKSk7XG5cdFx0XHRcdFx0Y29va2llICs9ICc7IGV4cGlyZXM9JyArIGRhdGUudG9HTVRTdHJpbmcoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBoYW5kbGUgZG9tYWluXG5cdFx0XHRcdGlmIChvcHRpb25zLmRvbWFpbiAmJiBvcHRpb25zLmRvbWFpbiAhPT0gZG9jdW1lbnQuZG9tYWluKSB7XG5cdFx0XHRcdFx0dmFyIF9kb21haW4gPSBvcHRpb25zLmRvbWFpbi5yZXBsYWNlKC9eXFwuLywgJycpO1xuXHRcdFx0XHRcdGlmIChkb2N1bWVudC5kb21haW4uaW5kZXhPZihfZG9tYWluKSA9PT0gLTEgfHwgX2RvbWFpbi5zcGxpdCgnLicpLmxlbmd0aCA8PSAxKVxuXHRcdFx0XHRcdFx0dGhyb3cgRXJyb3IoJ2ludmFsaWQgZG9tYWluJyk7XG5cdFx0XHRcdFx0Y29va2llICs9ICc7IGRvbWFpbj0nICsgb3B0aW9ucy5kb21haW47XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gaGFuZGxlIHNlY3VyZVxuXHRcdFx0XHRpZiAob3B0aW9ucy5zZWN1cmUgPT09IHRydWUpIHtcblx0XHRcdFx0XHRjb29raWUgKz0gJzsgU2VjdXJlJztcblx0XHRcdFx0fVxuXHRcdFx0XHRkb2N1bWVudC5jb29raWUgPSBjb29raWUgKyAnOyBwYXRoPS8nO1xuXHRcdFx0fSxcblx0XHRcdGdldDogZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0XHRpZiAoIXRoaXMuY2hlY2soKSlcblx0XHRcdFx0XHR0aHJvdyBFcnJvcignY29va2llcyBhcmUgZGlzYWJsZWQnKTtcblx0XHRcdFx0dmFyIGVuY29kZWRLZXkgPSBlbmNvZGVVUklDb21wb25lbnQoa2V5KTtcblx0XHRcdFx0dmFyIGNvb2tpZXMgPSBkb2N1bWVudC5jb29raWUgPyBkb2N1bWVudC5jb29raWUuc3BsaXQoJzsnKSA6IFtdO1xuXHRcdFx0XHQvLyByZXRyaWV2ZSBsYXN0IHVwZGF0ZWQgY29va2llIGZpcnN0XG5cdFx0XHRcdGZvciAodmFyIGkgPSBjb29raWVzLmxlbmd0aCAtIDEsIGNvb2tpZTsgaSA+PSAwOyBpLS0pIHtcblx0XHRcdFx0XHRjb29raWUgPSBjb29raWVzW2ldLnJlcGxhY2UoL15cXHMqLywgJycpO1xuXHRcdFx0XHRcdGlmIChjb29raWUuaW5kZXhPZihlbmNvZGVkS2V5ICsgJz0nKSA9PT0gMClcblx0XHRcdFx0XHRcdHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoY29va2llLnN1YnN0cmluZyhlbmNvZGVkS2V5Lmxlbmd0aCArIDEsIGNvb2tpZS5sZW5ndGgpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdH0sXG5cdFx0XHRyZW1vdmU6IGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdFx0Ly8gcmVtb3ZlIGNvb2tpZSBmcm9tIG1haW4gZG9tYWluXG5cdFx0XHRcdHRoaXMuc2V0KGtleSwgJycsIHsgZXhwaXJlRGF5czogLTEgfSk7XG5cdFx0XHRcdC8vIHJlbW92ZSBjb29raWUgZnJvbSB1cHBlciBkb21haW5zXG5cdFx0XHRcdHZhciBkb21haW5QYXJ0cyA9IGRvY3VtZW50LmRvbWFpbi5zcGxpdCgnLicpO1xuXHRcdFx0XHRmb3IgKHZhciBpID0gZG9tYWluUGFydHMubGVuZ3RoOyBpID4gMTsgaS0tKSB7XG5cdFx0XHRcdFx0dGhpcy5zZXQoa2V5LCAnJywgeyBleHBpcmVEYXlzOiAtMSwgZG9tYWluOiAnLicgKyBkb21haW5QYXJ0cy5zbGljZSgtIGkpLmpvaW4oJy4nKSB9KTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdHJlc2V0OiBmdW5jdGlvbiAobmFtZXNwYWNlKSB7XG5cdFx0XHRcdHZhciBjb29raWVzID0gZG9jdW1lbnQuY29va2llID8gZG9jdW1lbnQuY29va2llLnNwbGl0KCc7JykgOiBbXTtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDAsIGNvb2tpZSwga2V5OyBpIDwgY29va2llcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdGNvb2tpZSA9IGNvb2tpZXNbaV0ucmVwbGFjZSgvXlxccyovLCAnJyk7XG5cdFx0XHRcdFx0a2V5ID0gY29va2llLnN1YnN0cigwLCBjb29raWUuaW5kZXhPZignPScpKTtcblx0XHRcdFx0XHRpZiAoIW5hbWVzcGFjZSB8fCBrZXkuaW5kZXhPZihuYW1lc3BhY2UpID09PSAwKVxuXHRcdFx0XHRcdFx0dGhpcy5yZW1vdmUoa2V5KTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdGtleXM6IGZ1bmN0aW9uIChuYW1lc3BhY2UsIGRlbGltaXRlcikge1xuXHRcdFx0XHRpZiAoIXRoaXMuY2hlY2soKSlcblx0XHRcdFx0XHR0aHJvdyBFcnJvcignY29va2llcyBhcmUgZGlzYWJsZWQnKTtcblx0XHRcdFx0dmFyIGtleXMgPSBbXSxcblx0XHRcdFx0XHRjb29raWVzID0gZG9jdW1lbnQuY29va2llID8gZG9jdW1lbnQuY29va2llLnNwbGl0KCc7JykgOiBbXTtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDAsIGNvb2tpZSwga2V5OyBpIDwgY29va2llcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdGNvb2tpZSA9IGNvb2tpZXNbaV0ucmVwbGFjZSgvXlxccyovLCAnJyk7XG5cdFx0XHRcdFx0a2V5ID0gZGVjb2RlVVJJQ29tcG9uZW50KGNvb2tpZS5zdWJzdHIoMCwgY29va2llLmluZGV4T2YoJz0nKSkpO1xuXHRcdFx0XHRcdGlmICghbmFtZXNwYWNlIHx8IGtleS5pbmRleE9mKG5hbWVzcGFjZSkgPT09IDApXG5cdFx0XHRcdFx0XHRrZXlzLnB1c2goX3RvS2V5TmFtZShuYW1lc3BhY2UsIGtleSwgZGVsaW1pdGVyKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIGtleXM7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHJldHVybiB7XG5cdFx0XHRpbml0OiBmdW5jdGlvbiAob3B0aW9ucykge1xuXHRcdFx0XHR0aGlzLnNldE9wdGlvbnMob3B0aW9ucyk7XG5cdFx0XHRcdHJldHVybiB0aGlzO1xuXHRcdFx0fSxcblx0XHRcdHNldE9wdGlvbnM6IGZ1bmN0aW9uIChvcHRpb25zKSB7XG5cdFx0XHRcdHRoaXMub3B0aW9ucyA9IEJhc2lsLnV0aWxzLmV4dGVuZCh7fSwgdGhpcy5vcHRpb25zIHx8IEJhc2lsLm9wdGlvbnMsIG9wdGlvbnMpO1xuXHRcdFx0fSxcblx0XHRcdHN1cHBvcnQ6IGZ1bmN0aW9uIChzdG9yYWdlKSB7XG5cdFx0XHRcdHJldHVybiBfc3RvcmFnZXMuaGFzT3duUHJvcGVydHkoc3RvcmFnZSk7XG5cdFx0XHR9LFxuXHRcdFx0Y2hlY2s6IGZ1bmN0aW9uIChzdG9yYWdlKSB7XG5cdFx0XHRcdGlmICh0aGlzLnN1cHBvcnQoc3RvcmFnZSkpXG5cdFx0XHRcdFx0cmV0dXJuIF9zdG9yYWdlc1tzdG9yYWdlXS5jaGVjayh0aGlzLm9wdGlvbnMpO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9LFxuXHRcdFx0c2V0OiBmdW5jdGlvbiAoa2V5LCB2YWx1ZSwgb3B0aW9ucykge1xuXHRcdFx0XHRvcHRpb25zID0gQmFzaWwudXRpbHMuZXh0ZW5kKHt9LCB0aGlzLm9wdGlvbnMsIG9wdGlvbnMpO1xuXHRcdFx0XHRpZiAoIShrZXkgPSBfdG9TdG9yZWRLZXkob3B0aW9ucy5uYW1lc3BhY2UsIGtleSwgb3B0aW9ucy5rZXlEZWxpbWl0ZXIpKSlcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdHZhbHVlID0gb3B0aW9ucy5yYXcgPT09IHRydWUgPyB2YWx1ZSA6IF90b1N0b3JlZFZhbHVlKHZhbHVlKTtcblx0XHRcdFx0dmFyIHdoZXJlID0gbnVsbDtcblx0XHRcdFx0Ly8gdHJ5IHRvIHNldCBrZXkvdmFsdWUgaW4gZmlyc3QgYXZhaWxhYmxlIHN0b3JhZ2Vcblx0XHRcdFx0QmFzaWwudXRpbHMudHJ5RWFjaChfdG9TdG9yYWdlc0FycmF5KG9wdGlvbnMuc3RvcmFnZXMpLCBmdW5jdGlvbiAoc3RvcmFnZSwgaW5kZXgpIHtcblx0XHRcdFx0XHRfc3RvcmFnZXNbc3RvcmFnZV0uc2V0KGtleSwgdmFsdWUsIG9wdGlvbnMpO1xuXHRcdFx0XHRcdHdoZXJlID0gc3RvcmFnZTtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7IC8vIGJyZWFrO1xuXHRcdFx0XHR9LCBudWxsLCB0aGlzKTtcblx0XHRcdFx0aWYgKCF3aGVyZSkge1xuXHRcdFx0XHRcdC8vIGtleSBoYXMgbm90IGJlZW4gc2V0IGFueXdoZXJlXG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIHJlbW92ZSBrZXkgZnJvbSBhbGwgb3RoZXIgc3RvcmFnZXNcblx0XHRcdFx0QmFzaWwudXRpbHMudHJ5RWFjaChfdG9TdG9yYWdlc0FycmF5KG9wdGlvbnMuc3RvcmFnZXMpLCBmdW5jdGlvbiAoc3RvcmFnZSwgaW5kZXgpIHtcblx0XHRcdFx0XHRpZiAoc3RvcmFnZSAhPT0gd2hlcmUpXG5cdFx0XHRcdFx0XHRfc3RvcmFnZXNbc3RvcmFnZV0ucmVtb3ZlKGtleSk7XG5cdFx0XHRcdH0sIG51bGwsIHRoaXMpO1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH0sXG5cdFx0XHRnZXQ6IGZ1bmN0aW9uIChrZXksIG9wdGlvbnMpIHtcblx0XHRcdFx0b3B0aW9ucyA9IEJhc2lsLnV0aWxzLmV4dGVuZCh7fSwgdGhpcy5vcHRpb25zLCBvcHRpb25zKTtcblx0XHRcdFx0aWYgKCEoa2V5ID0gX3RvU3RvcmVkS2V5KG9wdGlvbnMubmFtZXNwYWNlLCBrZXksIG9wdGlvbnMua2V5RGVsaW1pdGVyKSkpXG5cdFx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHRcdHZhciB2YWx1ZSA9IG51bGw7XG5cdFx0XHRcdEJhc2lsLnV0aWxzLnRyeUVhY2goX3RvU3RvcmFnZXNBcnJheShvcHRpb25zLnN0b3JhZ2VzKSwgZnVuY3Rpb24gKHN0b3JhZ2UsIGluZGV4KSB7XG5cdFx0XHRcdFx0aWYgKHZhbHVlICE9PSBudWxsKVxuXHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlOyAvLyBicmVhayBpZiBhIHZhbHVlIGhhcyBhbHJlYWR5IGJlZW4gZm91bmQuXG5cdFx0XHRcdFx0dmFsdWUgPSBfc3RvcmFnZXNbc3RvcmFnZV0uZ2V0KGtleSwgb3B0aW9ucykgfHwgbnVsbDtcblx0XHRcdFx0XHR2YWx1ZSA9IG9wdGlvbnMucmF3ID09PSB0cnVlID8gdmFsdWUgOiBfZnJvbVN0b3JlZFZhbHVlKHZhbHVlKTtcblx0XHRcdFx0fSwgZnVuY3Rpb24gKHN0b3JhZ2UsIGluZGV4LCBlcnJvcikge1xuXHRcdFx0XHRcdHZhbHVlID0gbnVsbDtcblx0XHRcdFx0fSwgdGhpcyk7XG5cdFx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHRcdH0sXG5cdFx0XHRyZW1vdmU6IGZ1bmN0aW9uIChrZXksIG9wdGlvbnMpIHtcblx0XHRcdFx0b3B0aW9ucyA9IEJhc2lsLnV0aWxzLmV4dGVuZCh7fSwgdGhpcy5vcHRpb25zLCBvcHRpb25zKTtcblx0XHRcdFx0aWYgKCEoa2V5ID0gX3RvU3RvcmVkS2V5KG9wdGlvbnMubmFtZXNwYWNlLCBrZXksIG9wdGlvbnMua2V5RGVsaW1pdGVyKSkpXG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRCYXNpbC51dGlscy50cnlFYWNoKF90b1N0b3JhZ2VzQXJyYXkob3B0aW9ucy5zdG9yYWdlcyksIGZ1bmN0aW9uIChzdG9yYWdlKSB7XG5cdFx0XHRcdFx0X3N0b3JhZ2VzW3N0b3JhZ2VdLnJlbW92ZShrZXkpO1xuXHRcdFx0XHR9LCBudWxsLCB0aGlzKTtcblx0XHRcdH0sXG5cdFx0XHRyZXNldDogZnVuY3Rpb24gKG9wdGlvbnMpIHtcblx0XHRcdFx0b3B0aW9ucyA9IEJhc2lsLnV0aWxzLmV4dGVuZCh7fSwgdGhpcy5vcHRpb25zLCBvcHRpb25zKTtcblx0XHRcdFx0QmFzaWwudXRpbHMudHJ5RWFjaChfdG9TdG9yYWdlc0FycmF5KG9wdGlvbnMuc3RvcmFnZXMpLCBmdW5jdGlvbiAoc3RvcmFnZSkge1xuXHRcdFx0XHRcdF9zdG9yYWdlc1tzdG9yYWdlXS5yZXNldChvcHRpb25zLm5hbWVzcGFjZSk7XG5cdFx0XHRcdH0sIG51bGwsIHRoaXMpO1xuXHRcdFx0fSxcblx0XHRcdGtleXM6IGZ1bmN0aW9uIChvcHRpb25zKSB7XG5cdFx0XHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHRcdFx0XHR2YXIga2V5cyA9IFtdO1xuXHRcdFx0XHRmb3IgKHZhciBrZXkgaW4gdGhpcy5rZXlzTWFwKG9wdGlvbnMpKVxuXHRcdFx0XHRcdGtleXMucHVzaChrZXkpO1xuXHRcdFx0XHRyZXR1cm4ga2V5cztcblx0XHRcdH0sXG5cdFx0XHRrZXlzTWFwOiBmdW5jdGlvbiAob3B0aW9ucykge1xuXHRcdFx0XHRvcHRpb25zID0gQmFzaWwudXRpbHMuZXh0ZW5kKHt9LCB0aGlzLm9wdGlvbnMsIG9wdGlvbnMpO1xuXHRcdFx0XHR2YXIgbWFwID0ge307XG5cdFx0XHRcdEJhc2lsLnV0aWxzLnRyeUVhY2goX3RvU3RvcmFnZXNBcnJheShvcHRpb25zLnN0b3JhZ2VzKSwgZnVuY3Rpb24gKHN0b3JhZ2UpIHtcblx0XHRcdFx0XHRCYXNpbC51dGlscy5lYWNoKF9zdG9yYWdlc1tzdG9yYWdlXS5rZXlzKG9wdGlvbnMubmFtZXNwYWNlLCBvcHRpb25zLmtleURlbGltaXRlciksIGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdFx0XHRcdG1hcFtrZXldID0gQmFzaWwudXRpbHMuaXNBcnJheShtYXBba2V5XSkgPyBtYXBba2V5XSA6IFtdO1xuXHRcdFx0XHRcdFx0bWFwW2tleV0ucHVzaChzdG9yYWdlKTtcblx0XHRcdFx0XHR9LCB0aGlzKTtcblx0XHRcdFx0fSwgbnVsbCwgdGhpcyk7XG5cdFx0XHRcdHJldHVybiBtYXA7XG5cdFx0XHR9XG5cdFx0fTtcblx0fTtcblxuXHQvLyBBY2Nlc3MgdG8gbmF0aXZlIHN0b3JhZ2VzLCB3aXRob3V0IG5hbWVzcGFjZSBvciBiYXNpbCB2YWx1ZSBkZWNvcmF0aW9uXG5cdEJhc2lsLm1lbW9yeSA9IG5ldyBCYXNpbC5TdG9yYWdlKCkuaW5pdCh7IHN0b3JhZ2VzOiAnbWVtb3J5JywgbmFtZXNwYWNlOiBudWxsLCByYXc6IHRydWUgfSk7XG5cdEJhc2lsLmNvb2tpZSA9IG5ldyBCYXNpbC5TdG9yYWdlKCkuaW5pdCh7IHN0b3JhZ2VzOiAnY29va2llJywgbmFtZXNwYWNlOiBudWxsLCByYXc6IHRydWUgfSk7XG5cdEJhc2lsLmxvY2FsU3RvcmFnZSA9IG5ldyBCYXNpbC5TdG9yYWdlKCkuaW5pdCh7IHN0b3JhZ2VzOiAnbG9jYWwnLCBuYW1lc3BhY2U6IG51bGwsIHJhdzogdHJ1ZSB9KTtcblx0QmFzaWwuc2Vzc2lvblN0b3JhZ2UgPSBuZXcgQmFzaWwuU3RvcmFnZSgpLmluaXQoeyBzdG9yYWdlczogJ3Nlc3Npb24nLCBuYW1lc3BhY2U6IG51bGwsIHJhdzogdHJ1ZSB9KTtcblxuXHQvLyBicm93c2VyIGV4cG9ydFxuXHR3aW5kb3cuQmFzaWwgPSBCYXNpbDtcblxuXHQvLyBBTUQgZXhwb3J0XG5cdGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcblx0XHRkZWZpbmUoZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gQmFzaWw7XG5cdFx0fSk7XG5cdC8vIGNvbW1vbmpzIGV4cG9ydFxuXHR9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBCYXNpbDtcblx0fVxuXG59KSgpO1xuIiwiOyhmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuXHRpZiAodHlwZW9mIGV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcblx0XHQvLyBDb21tb25KU1xuXHRcdG1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IGZhY3RvcnkoKTtcblx0fVxuXHRlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuXHRcdC8vIEFNRFxuXHRcdGRlZmluZShbXSwgZmFjdG9yeSk7XG5cdH1cblx0ZWxzZSB7XG5cdFx0Ly8gR2xvYmFsIChicm93c2VyKVxuXHRcdHJvb3QuQ3J5cHRvSlMgPSBmYWN0b3J5KCk7XG5cdH1cbn0odGhpcywgZnVuY3Rpb24gKCkge1xuXG5cdC8qKlxuXHQgKiBDcnlwdG9KUyBjb3JlIGNvbXBvbmVudHMuXG5cdCAqL1xuXHR2YXIgQ3J5cHRvSlMgPSBDcnlwdG9KUyB8fCAoZnVuY3Rpb24gKE1hdGgsIHVuZGVmaW5lZCkge1xuXHQgICAgLypcblx0ICAgICAqIExvY2FsIHBvbHlmaWwgb2YgT2JqZWN0LmNyZWF0ZVxuXHQgICAgICovXG5cdCAgICB2YXIgY3JlYXRlID0gT2JqZWN0LmNyZWF0ZSB8fCAoZnVuY3Rpb24gKCkge1xuXHQgICAgICAgIGZ1bmN0aW9uIEYoKSB7fTtcblxuXHQgICAgICAgIHJldHVybiBmdW5jdGlvbiAob2JqKSB7XG5cdCAgICAgICAgICAgIHZhciBzdWJ0eXBlO1xuXG5cdCAgICAgICAgICAgIEYucHJvdG90eXBlID0gb2JqO1xuXG5cdCAgICAgICAgICAgIHN1YnR5cGUgPSBuZXcgRigpO1xuXG5cdCAgICAgICAgICAgIEYucHJvdG90eXBlID0gbnVsbDtcblxuXHQgICAgICAgICAgICByZXR1cm4gc3VidHlwZTtcblx0ICAgICAgICB9O1xuXHQgICAgfSgpKVxuXG5cdCAgICAvKipcblx0ICAgICAqIENyeXB0b0pTIG5hbWVzcGFjZS5cblx0ICAgICAqL1xuXHQgICAgdmFyIEMgPSB7fTtcblxuXHQgICAgLyoqXG5cdCAgICAgKiBMaWJyYXJ5IG5hbWVzcGFjZS5cblx0ICAgICAqL1xuXHQgICAgdmFyIENfbGliID0gQy5saWIgPSB7fTtcblxuXHQgICAgLyoqXG5cdCAgICAgKiBCYXNlIG9iamVjdCBmb3IgcHJvdG90eXBhbCBpbmhlcml0YW5jZS5cblx0ICAgICAqL1xuXHQgICAgdmFyIEJhc2UgPSBDX2xpYi5CYXNlID0gKGZ1bmN0aW9uICgpIHtcblxuXG5cdCAgICAgICAgcmV0dXJuIHtcblx0ICAgICAgICAgICAgLyoqXG5cdCAgICAgICAgICAgICAqIENyZWF0ZXMgYSBuZXcgb2JqZWN0IHRoYXQgaW5oZXJpdHMgZnJvbSB0aGlzIG9iamVjdC5cblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IG92ZXJyaWRlcyBQcm9wZXJ0aWVzIHRvIGNvcHkgaW50byB0aGUgbmV3IG9iamVjdC5cblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogQHJldHVybiB7T2JqZWN0fSBUaGUgbmV3IG9iamVjdC5cblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogQHN0YXRpY1xuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiAgICAgdmFyIE15VHlwZSA9IENyeXB0b0pTLmxpYi5CYXNlLmV4dGVuZCh7XG5cdCAgICAgICAgICAgICAqICAgICAgICAgZmllbGQ6ICd2YWx1ZScsXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqICAgICAgICAgbWV0aG9kOiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgICAqICAgICAgICAgfVxuXHQgICAgICAgICAgICAgKiAgICAgfSk7XG5cdCAgICAgICAgICAgICAqL1xuXHQgICAgICAgICAgICBleHRlbmQ6IGZ1bmN0aW9uIChvdmVycmlkZXMpIHtcblx0ICAgICAgICAgICAgICAgIC8vIFNwYXduXG5cdCAgICAgICAgICAgICAgICB2YXIgc3VidHlwZSA9IGNyZWF0ZSh0aGlzKTtcblxuXHQgICAgICAgICAgICAgICAgLy8gQXVnbWVudFxuXHQgICAgICAgICAgICAgICAgaWYgKG92ZXJyaWRlcykge1xuXHQgICAgICAgICAgICAgICAgICAgIHN1YnR5cGUubWl4SW4ob3ZlcnJpZGVzKTtcblx0ICAgICAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGRlZmF1bHQgaW5pdGlhbGl6ZXJcblx0ICAgICAgICAgICAgICAgIGlmICghc3VidHlwZS5oYXNPd25Qcm9wZXJ0eSgnaW5pdCcpIHx8IHRoaXMuaW5pdCA9PT0gc3VidHlwZS5pbml0KSB7XG5cdCAgICAgICAgICAgICAgICAgICAgc3VidHlwZS5pbml0ID0gZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICAgICAgICAgICAgICBzdWJ0eXBlLiRzdXBlci5pbml0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdCAgICAgICAgICAgICAgICAgICAgfTtcblx0ICAgICAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICAgICAgLy8gSW5pdGlhbGl6ZXIncyBwcm90b3R5cGUgaXMgdGhlIHN1YnR5cGUgb2JqZWN0XG5cdCAgICAgICAgICAgICAgICBzdWJ0eXBlLmluaXQucHJvdG90eXBlID0gc3VidHlwZTtcblxuXHQgICAgICAgICAgICAgICAgLy8gUmVmZXJlbmNlIHN1cGVydHlwZVxuXHQgICAgICAgICAgICAgICAgc3VidHlwZS4kc3VwZXIgPSB0aGlzO1xuXG5cdCAgICAgICAgICAgICAgICByZXR1cm4gc3VidHlwZTtcblx0ICAgICAgICAgICAgfSxcblxuXHQgICAgICAgICAgICAvKipcblx0ICAgICAgICAgICAgICogRXh0ZW5kcyB0aGlzIG9iamVjdCBhbmQgcnVucyB0aGUgaW5pdCBtZXRob2QuXG5cdCAgICAgICAgICAgICAqIEFyZ3VtZW50cyB0byBjcmVhdGUoKSB3aWxsIGJlIHBhc3NlZCB0byBpbml0KCkuXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqIEByZXR1cm4ge09iamVjdH0gVGhlIG5ldyBvYmplY3QuXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqIEBzdGF0aWNcblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogICAgIHZhciBpbnN0YW5jZSA9IE15VHlwZS5jcmVhdGUoKTtcblx0ICAgICAgICAgICAgICovXG5cdCAgICAgICAgICAgIGNyZWF0ZTogZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICAgICAgdmFyIGluc3RhbmNlID0gdGhpcy5leHRlbmQoKTtcblx0ICAgICAgICAgICAgICAgIGluc3RhbmNlLmluaXQuYXBwbHkoaW5zdGFuY2UsIGFyZ3VtZW50cyk7XG5cblx0ICAgICAgICAgICAgICAgIHJldHVybiBpbnN0YW5jZTtcblx0ICAgICAgICAgICAgfSxcblxuXHQgICAgICAgICAgICAvKipcblx0ICAgICAgICAgICAgICogSW5pdGlhbGl6ZXMgYSBuZXdseSBjcmVhdGVkIG9iamVjdC5cblx0ICAgICAgICAgICAgICogT3ZlcnJpZGUgdGhpcyBtZXRob2QgdG8gYWRkIHNvbWUgbG9naWMgd2hlbiB5b3VyIG9iamVjdHMgYXJlIGNyZWF0ZWQuXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqICAgICB2YXIgTXlUeXBlID0gQ3J5cHRvSlMubGliLkJhc2UuZXh0ZW5kKHtcblx0ICAgICAgICAgICAgICogICAgICAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgICAqICAgICAgICAgICAgIC8vIC4uLlxuXHQgICAgICAgICAgICAgKiAgICAgICAgIH1cblx0ICAgICAgICAgICAgICogICAgIH0pO1xuXHQgICAgICAgICAgICAgKi9cblx0ICAgICAgICAgICAgaW5pdDogZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICB9LFxuXG5cdCAgICAgICAgICAgIC8qKlxuXHQgICAgICAgICAgICAgKiBDb3BpZXMgcHJvcGVydGllcyBpbnRvIHRoaXMgb2JqZWN0LlxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gcHJvcGVydGllcyBUaGUgcHJvcGVydGllcyB0byBtaXggaW4uXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqICAgICBNeVR5cGUubWl4SW4oe1xuXHQgICAgICAgICAgICAgKiAgICAgICAgIGZpZWxkOiAndmFsdWUnXG5cdCAgICAgICAgICAgICAqICAgICB9KTtcblx0ICAgICAgICAgICAgICovXG5cdCAgICAgICAgICAgIG1peEluOiBmdW5jdGlvbiAocHJvcGVydGllcykge1xuXHQgICAgICAgICAgICAgICAgZm9yICh2YXIgcHJvcGVydHlOYW1lIGluIHByb3BlcnRpZXMpIHtcblx0ICAgICAgICAgICAgICAgICAgICBpZiAocHJvcGVydGllcy5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eU5hbWUpKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNbcHJvcGVydHlOYW1lXSA9IHByb3BlcnRpZXNbcHJvcGVydHlOYW1lXTtcblx0ICAgICAgICAgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgICAgIC8vIElFIHdvbid0IGNvcHkgdG9TdHJpbmcgdXNpbmcgdGhlIGxvb3AgYWJvdmVcblx0ICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0aWVzLmhhc093blByb3BlcnR5KCd0b1N0cmluZycpKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgdGhpcy50b1N0cmluZyA9IHByb3BlcnRpZXMudG9TdHJpbmc7XG5cdCAgICAgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgIH0sXG5cblx0ICAgICAgICAgICAgLyoqXG5cdCAgICAgICAgICAgICAqIENyZWF0ZXMgYSBjb3B5IG9mIHRoaXMgb2JqZWN0LlxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBjbG9uZS5cblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogICAgIHZhciBjbG9uZSA9IGluc3RhbmNlLmNsb25lKCk7XG5cdCAgICAgICAgICAgICAqL1xuXHQgICAgICAgICAgICBjbG9uZTogZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaW5pdC5wcm90b3R5cGUuZXh0ZW5kKHRoaXMpO1xuXHQgICAgICAgICAgICB9XG5cdCAgICAgICAgfTtcblx0ICAgIH0oKSk7XG5cblx0ICAgIC8qKlxuXHQgICAgICogQW4gYXJyYXkgb2YgMzItYml0IHdvcmRzLlxuXHQgICAgICpcblx0ICAgICAqIEBwcm9wZXJ0eSB7QXJyYXl9IHdvcmRzIFRoZSBhcnJheSBvZiAzMi1iaXQgd29yZHMuXG5cdCAgICAgKiBAcHJvcGVydHkge251bWJlcn0gc2lnQnl0ZXMgVGhlIG51bWJlciBvZiBzaWduaWZpY2FudCBieXRlcyBpbiB0aGlzIHdvcmQgYXJyYXkuXG5cdCAgICAgKi9cblx0ICAgIHZhciBXb3JkQXJyYXkgPSBDX2xpYi5Xb3JkQXJyYXkgPSBCYXNlLmV4dGVuZCh7XG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogSW5pdGlhbGl6ZXMgYSBuZXdseSBjcmVhdGVkIHdvcmQgYXJyYXkuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge0FycmF5fSB3b3JkcyAoT3B0aW9uYWwpIEFuIGFycmF5IG9mIDMyLWJpdCB3b3Jkcy5cblx0ICAgICAgICAgKiBAcGFyYW0ge251bWJlcn0gc2lnQnl0ZXMgKE9wdGlvbmFsKSBUaGUgbnVtYmVyIG9mIHNpZ25pZmljYW50IGJ5dGVzIGluIHRoZSB3b3Jkcy5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIHdvcmRBcnJheSA9IENyeXB0b0pTLmxpYi5Xb3JkQXJyYXkuY3JlYXRlKCk7XG5cdCAgICAgICAgICogICAgIHZhciB3b3JkQXJyYXkgPSBDcnlwdG9KUy5saWIuV29yZEFycmF5LmNyZWF0ZShbMHgwMDAxMDIwMywgMHgwNDA1MDYwN10pO1xuXHQgICAgICAgICAqICAgICB2YXIgd29yZEFycmF5ID0gQ3J5cHRvSlMubGliLldvcmRBcnJheS5jcmVhdGUoWzB4MDAwMTAyMDMsIDB4MDQwNTA2MDddLCA2KTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBpbml0OiBmdW5jdGlvbiAod29yZHMsIHNpZ0J5dGVzKSB7XG5cdCAgICAgICAgICAgIHdvcmRzID0gdGhpcy53b3JkcyA9IHdvcmRzIHx8IFtdO1xuXG5cdCAgICAgICAgICAgIGlmIChzaWdCeXRlcyAhPSB1bmRlZmluZWQpIHtcblx0ICAgICAgICAgICAgICAgIHRoaXMuc2lnQnl0ZXMgPSBzaWdCeXRlcztcblx0ICAgICAgICAgICAgfSBlbHNlIHtcblx0ICAgICAgICAgICAgICAgIHRoaXMuc2lnQnl0ZXMgPSB3b3Jkcy5sZW5ndGggKiA0O1xuXHQgICAgICAgICAgICB9XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIENvbnZlcnRzIHRoaXMgd29yZCBhcnJheSB0byBhIHN0cmluZy5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7RW5jb2Rlcn0gZW5jb2RlciAoT3B0aW9uYWwpIFRoZSBlbmNvZGluZyBzdHJhdGVneSB0byB1c2UuIERlZmF1bHQ6IENyeXB0b0pTLmVuYy5IZXhcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge3N0cmluZ30gVGhlIHN0cmluZ2lmaWVkIHdvcmQgYXJyYXkuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciBzdHJpbmcgPSB3b3JkQXJyYXkgKyAnJztcblx0ICAgICAgICAgKiAgICAgdmFyIHN0cmluZyA9IHdvcmRBcnJheS50b1N0cmluZygpO1xuXHQgICAgICAgICAqICAgICB2YXIgc3RyaW5nID0gd29yZEFycmF5LnRvU3RyaW5nKENyeXB0b0pTLmVuYy5VdGY4KTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICB0b1N0cmluZzogZnVuY3Rpb24gKGVuY29kZXIpIHtcblx0ICAgICAgICAgICAgcmV0dXJuIChlbmNvZGVyIHx8IEhleCkuc3RyaW5naWZ5KHRoaXMpO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBDb25jYXRlbmF0ZXMgYSB3b3JkIGFycmF5IHRvIHRoaXMgd29yZCBhcnJheS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7V29yZEFycmF5fSB3b3JkQXJyYXkgVGhlIHdvcmQgYXJyYXkgdG8gYXBwZW5kLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7V29yZEFycmF5fSBUaGlzIHdvcmQgYXJyYXkuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHdvcmRBcnJheTEuY29uY2F0KHdvcmRBcnJheTIpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIGNvbmNhdDogZnVuY3Rpb24gKHdvcmRBcnJheSkge1xuXHQgICAgICAgICAgICAvLyBTaG9ydGN1dHNcblx0ICAgICAgICAgICAgdmFyIHRoaXNXb3JkcyA9IHRoaXMud29yZHM7XG5cdCAgICAgICAgICAgIHZhciB0aGF0V29yZHMgPSB3b3JkQXJyYXkud29yZHM7XG5cdCAgICAgICAgICAgIHZhciB0aGlzU2lnQnl0ZXMgPSB0aGlzLnNpZ0J5dGVzO1xuXHQgICAgICAgICAgICB2YXIgdGhhdFNpZ0J5dGVzID0gd29yZEFycmF5LnNpZ0J5dGVzO1xuXG5cdCAgICAgICAgICAgIC8vIENsYW1wIGV4Y2VzcyBiaXRzXG5cdCAgICAgICAgICAgIHRoaXMuY2xhbXAoKTtcblxuXHQgICAgICAgICAgICAvLyBDb25jYXRcblx0ICAgICAgICAgICAgaWYgKHRoaXNTaWdCeXRlcyAlIDQpIHtcblx0ICAgICAgICAgICAgICAgIC8vIENvcHkgb25lIGJ5dGUgYXQgYSB0aW1lXG5cdCAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoYXRTaWdCeXRlczsgaSsrKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgdmFyIHRoYXRCeXRlID0gKHRoYXRXb3Jkc1tpID4+PiAyXSA+Pj4gKDI0IC0gKGkgJSA0KSAqIDgpKSAmIDB4ZmY7XG5cdCAgICAgICAgICAgICAgICAgICAgdGhpc1dvcmRzWyh0aGlzU2lnQnl0ZXMgKyBpKSA+Pj4gMl0gfD0gdGhhdEJ5dGUgPDwgKDI0IC0gKCh0aGlzU2lnQnl0ZXMgKyBpKSAlIDQpICogOCk7XG5cdCAgICAgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgIH0gZWxzZSB7XG5cdCAgICAgICAgICAgICAgICAvLyBDb3B5IG9uZSB3b3JkIGF0IGEgdGltZVxuXHQgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGF0U2lnQnl0ZXM7IGkgKz0gNCkge1xuXHQgICAgICAgICAgICAgICAgICAgIHRoaXNXb3Jkc1sodGhpc1NpZ0J5dGVzICsgaSkgPj4+IDJdID0gdGhhdFdvcmRzW2kgPj4+IDJdO1xuXHQgICAgICAgICAgICAgICAgfVxuXHQgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgIHRoaXMuc2lnQnl0ZXMgKz0gdGhhdFNpZ0J5dGVzO1xuXG5cdCAgICAgICAgICAgIC8vIENoYWluYWJsZVxuXHQgICAgICAgICAgICByZXR1cm4gdGhpcztcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogUmVtb3ZlcyBpbnNpZ25pZmljYW50IGJpdHMuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHdvcmRBcnJheS5jbGFtcCgpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIGNsYW1wOiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgIC8vIFNob3J0Y3V0c1xuXHQgICAgICAgICAgICB2YXIgd29yZHMgPSB0aGlzLndvcmRzO1xuXHQgICAgICAgICAgICB2YXIgc2lnQnl0ZXMgPSB0aGlzLnNpZ0J5dGVzO1xuXG5cdCAgICAgICAgICAgIC8vIENsYW1wXG5cdCAgICAgICAgICAgIHdvcmRzW3NpZ0J5dGVzID4+PiAyXSAmPSAweGZmZmZmZmZmIDw8ICgzMiAtIChzaWdCeXRlcyAlIDQpICogOCk7XG5cdCAgICAgICAgICAgIHdvcmRzLmxlbmd0aCA9IE1hdGguY2VpbChzaWdCeXRlcyAvIDQpO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBDcmVhdGVzIGEgY29weSBvZiB0aGlzIHdvcmQgYXJyYXkuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtXb3JkQXJyYXl9IFRoZSBjbG9uZS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIGNsb25lID0gd29yZEFycmF5LmNsb25lKCk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgY2xvbmU6IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgdmFyIGNsb25lID0gQmFzZS5jbG9uZS5jYWxsKHRoaXMpO1xuXHQgICAgICAgICAgICBjbG9uZS53b3JkcyA9IHRoaXMud29yZHMuc2xpY2UoMCk7XG5cblx0ICAgICAgICAgICAgcmV0dXJuIGNsb25lO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBDcmVhdGVzIGEgd29yZCBhcnJheSBmaWxsZWQgd2l0aCByYW5kb20gYnl0ZXMuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge251bWJlcn0gbkJ5dGVzIFRoZSBudW1iZXIgb2YgcmFuZG9tIGJ5dGVzIHRvIGdlbmVyYXRlLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7V29yZEFycmF5fSBUaGUgcmFuZG9tIHdvcmQgYXJyYXkuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAc3RhdGljXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciB3b3JkQXJyYXkgPSBDcnlwdG9KUy5saWIuV29yZEFycmF5LnJhbmRvbSgxNik7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgcmFuZG9tOiBmdW5jdGlvbiAobkJ5dGVzKSB7XG5cdCAgICAgICAgICAgIHZhciB3b3JkcyA9IFtdO1xuXG5cdCAgICAgICAgICAgIHZhciByID0gKGZ1bmN0aW9uIChtX3cpIHtcblx0ICAgICAgICAgICAgICAgIHZhciBtX3cgPSBtX3c7XG5cdCAgICAgICAgICAgICAgICB2YXIgbV96ID0gMHgzYWRlNjhiMTtcblx0ICAgICAgICAgICAgICAgIHZhciBtYXNrID0gMHhmZmZmZmZmZjtcblxuXHQgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgICAgICAgICBtX3ogPSAoMHg5MDY5ICogKG1feiAmIDB4RkZGRikgKyAobV96ID4+IDB4MTApKSAmIG1hc2s7XG5cdCAgICAgICAgICAgICAgICAgICAgbV93ID0gKDB4NDY1MCAqIChtX3cgJiAweEZGRkYpICsgKG1fdyA+PiAweDEwKSkgJiBtYXNrO1xuXHQgICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSAoKG1feiA8PCAweDEwKSArIG1fdykgJiBtYXNrO1xuXHQgICAgICAgICAgICAgICAgICAgIHJlc3VsdCAvPSAweDEwMDAwMDAwMDtcblx0ICAgICAgICAgICAgICAgICAgICByZXN1bHQgKz0gMC41O1xuXHQgICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQgKiAoTWF0aC5yYW5kb20oKSA+IC41ID8gMSA6IC0xKTtcblx0ICAgICAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgfSk7XG5cblx0ICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIHJjYWNoZTsgaSA8IG5CeXRlczsgaSArPSA0KSB7XG5cdCAgICAgICAgICAgICAgICB2YXIgX3IgPSByKChyY2FjaGUgfHwgTWF0aC5yYW5kb20oKSkgKiAweDEwMDAwMDAwMCk7XG5cblx0ICAgICAgICAgICAgICAgIHJjYWNoZSA9IF9yKCkgKiAweDNhZGU2N2I3O1xuXHQgICAgICAgICAgICAgICAgd29yZHMucHVzaCgoX3IoKSAqIDB4MTAwMDAwMDAwKSB8IDApO1xuXHQgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgcmV0dXJuIG5ldyBXb3JkQXJyYXkuaW5pdCh3b3JkcywgbkJ5dGVzKTtcblx0ICAgICAgICB9XG5cdCAgICB9KTtcblxuXHQgICAgLyoqXG5cdCAgICAgKiBFbmNvZGVyIG5hbWVzcGFjZS5cblx0ICAgICAqL1xuXHQgICAgdmFyIENfZW5jID0gQy5lbmMgPSB7fTtcblxuXHQgICAgLyoqXG5cdCAgICAgKiBIZXggZW5jb2Rpbmcgc3RyYXRlZ3kuXG5cdCAgICAgKi9cblx0ICAgIHZhciBIZXggPSBDX2VuYy5IZXggPSB7XG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogQ29udmVydHMgYSB3b3JkIGFycmF5IHRvIGEgaGV4IHN0cmluZy5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7V29yZEFycmF5fSB3b3JkQXJyYXkgVGhlIHdvcmQgYXJyYXkuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBoZXggc3RyaW5nLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHN0YXRpY1xuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgaGV4U3RyaW5nID0gQ3J5cHRvSlMuZW5jLkhleC5zdHJpbmdpZnkod29yZEFycmF5KTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBzdHJpbmdpZnk6IGZ1bmN0aW9uICh3b3JkQXJyYXkpIHtcblx0ICAgICAgICAgICAgLy8gU2hvcnRjdXRzXG5cdCAgICAgICAgICAgIHZhciB3b3JkcyA9IHdvcmRBcnJheS53b3Jkcztcblx0ICAgICAgICAgICAgdmFyIHNpZ0J5dGVzID0gd29yZEFycmF5LnNpZ0J5dGVzO1xuXG5cdCAgICAgICAgICAgIC8vIENvbnZlcnRcblx0ICAgICAgICAgICAgdmFyIGhleENoYXJzID0gW107XG5cdCAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2lnQnl0ZXM7IGkrKykge1xuXHQgICAgICAgICAgICAgICAgdmFyIGJpdGUgPSAod29yZHNbaSA+Pj4gMl0gPj4+ICgyNCAtIChpICUgNCkgKiA4KSkgJiAweGZmO1xuXHQgICAgICAgICAgICAgICAgaGV4Q2hhcnMucHVzaCgoYml0ZSA+Pj4gNCkudG9TdHJpbmcoMTYpKTtcblx0ICAgICAgICAgICAgICAgIGhleENoYXJzLnB1c2goKGJpdGUgJiAweDBmKS50b1N0cmluZygxNikpO1xuXHQgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgcmV0dXJuIGhleENoYXJzLmpvaW4oJycpO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBDb252ZXJ0cyBhIGhleCBzdHJpbmcgdG8gYSB3b3JkIGFycmF5LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGhleFN0ciBUaGUgaGV4IHN0cmluZy5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge1dvcmRBcnJheX0gVGhlIHdvcmQgYXJyYXkuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAc3RhdGljXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciB3b3JkQXJyYXkgPSBDcnlwdG9KUy5lbmMuSGV4LnBhcnNlKGhleFN0cmluZyk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgcGFyc2U6IGZ1bmN0aW9uIChoZXhTdHIpIHtcblx0ICAgICAgICAgICAgLy8gU2hvcnRjdXRcblx0ICAgICAgICAgICAgdmFyIGhleFN0ckxlbmd0aCA9IGhleFN0ci5sZW5ndGg7XG5cblx0ICAgICAgICAgICAgLy8gQ29udmVydFxuXHQgICAgICAgICAgICB2YXIgd29yZHMgPSBbXTtcblx0ICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBoZXhTdHJMZW5ndGg7IGkgKz0gMikge1xuXHQgICAgICAgICAgICAgICAgd29yZHNbaSA+Pj4gM10gfD0gcGFyc2VJbnQoaGV4U3RyLnN1YnN0cihpLCAyKSwgMTYpIDw8ICgyNCAtIChpICUgOCkgKiA0KTtcblx0ICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgIHJldHVybiBuZXcgV29yZEFycmF5LmluaXQod29yZHMsIGhleFN0ckxlbmd0aCAvIDIpO1xuXHQgICAgICAgIH1cblx0ICAgIH07XG5cblx0ICAgIC8qKlxuXHQgICAgICogTGF0aW4xIGVuY29kaW5nIHN0cmF0ZWd5LlxuXHQgICAgICovXG5cdCAgICB2YXIgTGF0aW4xID0gQ19lbmMuTGF0aW4xID0ge1xuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIENvbnZlcnRzIGEgd29yZCBhcnJheSB0byBhIExhdGluMSBzdHJpbmcuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge1dvcmRBcnJheX0gd29yZEFycmF5IFRoZSB3b3JkIGFycmF5LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7c3RyaW5nfSBUaGUgTGF0aW4xIHN0cmluZy5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBzdGF0aWNcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIGxhdGluMVN0cmluZyA9IENyeXB0b0pTLmVuYy5MYXRpbjEuc3RyaW5naWZ5KHdvcmRBcnJheSk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgc3RyaW5naWZ5OiBmdW5jdGlvbiAod29yZEFycmF5KSB7XG5cdCAgICAgICAgICAgIC8vIFNob3J0Y3V0c1xuXHQgICAgICAgICAgICB2YXIgd29yZHMgPSB3b3JkQXJyYXkud29yZHM7XG5cdCAgICAgICAgICAgIHZhciBzaWdCeXRlcyA9IHdvcmRBcnJheS5zaWdCeXRlcztcblxuXHQgICAgICAgICAgICAvLyBDb252ZXJ0XG5cdCAgICAgICAgICAgIHZhciBsYXRpbjFDaGFycyA9IFtdO1xuXHQgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNpZ0J5dGVzOyBpKyspIHtcblx0ICAgICAgICAgICAgICAgIHZhciBiaXRlID0gKHdvcmRzW2kgPj4+IDJdID4+PiAoMjQgLSAoaSAlIDQpICogOCkpICYgMHhmZjtcblx0ICAgICAgICAgICAgICAgIGxhdGluMUNoYXJzLnB1c2goU3RyaW5nLmZyb21DaGFyQ29kZShiaXRlKSk7XG5cdCAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICByZXR1cm4gbGF0aW4xQ2hhcnMuam9pbignJyk7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIENvbnZlcnRzIGEgTGF0aW4xIHN0cmluZyB0byBhIHdvcmQgYXJyYXkuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gbGF0aW4xU3RyIFRoZSBMYXRpbjEgc3RyaW5nLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7V29yZEFycmF5fSBUaGUgd29yZCBhcnJheS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBzdGF0aWNcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIHdvcmRBcnJheSA9IENyeXB0b0pTLmVuYy5MYXRpbjEucGFyc2UobGF0aW4xU3RyaW5nKTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBwYXJzZTogZnVuY3Rpb24gKGxhdGluMVN0cikge1xuXHQgICAgICAgICAgICAvLyBTaG9ydGN1dFxuXHQgICAgICAgICAgICB2YXIgbGF0aW4xU3RyTGVuZ3RoID0gbGF0aW4xU3RyLmxlbmd0aDtcblxuXHQgICAgICAgICAgICAvLyBDb252ZXJ0XG5cdCAgICAgICAgICAgIHZhciB3b3JkcyA9IFtdO1xuXHQgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxhdGluMVN0ckxlbmd0aDsgaSsrKSB7XG5cdCAgICAgICAgICAgICAgICB3b3Jkc1tpID4+PiAyXSB8PSAobGF0aW4xU3RyLmNoYXJDb2RlQXQoaSkgJiAweGZmKSA8PCAoMjQgLSAoaSAlIDQpICogOCk7XG5cdCAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICByZXR1cm4gbmV3IFdvcmRBcnJheS5pbml0KHdvcmRzLCBsYXRpbjFTdHJMZW5ndGgpO1xuXHQgICAgICAgIH1cblx0ICAgIH07XG5cblx0ICAgIC8qKlxuXHQgICAgICogVVRGLTggZW5jb2Rpbmcgc3RyYXRlZ3kuXG5cdCAgICAgKi9cblx0ICAgIHZhciBVdGY4ID0gQ19lbmMuVXRmOCA9IHtcblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBDb252ZXJ0cyBhIHdvcmQgYXJyYXkgdG8gYSBVVEYtOCBzdHJpbmcuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge1dvcmRBcnJheX0gd29yZEFycmF5IFRoZSB3b3JkIGFycmF5LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7c3RyaW5nfSBUaGUgVVRGLTggc3RyaW5nLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHN0YXRpY1xuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgdXRmOFN0cmluZyA9IENyeXB0b0pTLmVuYy5VdGY4LnN0cmluZ2lmeSh3b3JkQXJyYXkpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIHN0cmluZ2lmeTogZnVuY3Rpb24gKHdvcmRBcnJheSkge1xuXHQgICAgICAgICAgICB0cnkge1xuXHQgICAgICAgICAgICAgICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChlc2NhcGUoTGF0aW4xLnN0cmluZ2lmeSh3b3JkQXJyYXkpKSk7XG5cdCAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcblx0ICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTWFsZm9ybWVkIFVURi04IGRhdGEnKTtcblx0ICAgICAgICAgICAgfVxuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBDb252ZXJ0cyBhIFVURi04IHN0cmluZyB0byBhIHdvcmQgYXJyYXkuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gdXRmOFN0ciBUaGUgVVRGLTggc3RyaW5nLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7V29yZEFycmF5fSBUaGUgd29yZCBhcnJheS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBzdGF0aWNcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIHdvcmRBcnJheSA9IENyeXB0b0pTLmVuYy5VdGY4LnBhcnNlKHV0ZjhTdHJpbmcpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIHBhcnNlOiBmdW5jdGlvbiAodXRmOFN0cikge1xuXHQgICAgICAgICAgICByZXR1cm4gTGF0aW4xLnBhcnNlKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudCh1dGY4U3RyKSkpO1xuXHQgICAgICAgIH1cblx0ICAgIH07XG5cblx0ICAgIC8qKlxuXHQgICAgICogQWJzdHJhY3QgYnVmZmVyZWQgYmxvY2sgYWxnb3JpdGhtIHRlbXBsYXRlLlxuXHQgICAgICpcblx0ICAgICAqIFRoZSBwcm9wZXJ0eSBibG9ja1NpemUgbXVzdCBiZSBpbXBsZW1lbnRlZCBpbiBhIGNvbmNyZXRlIHN1YnR5cGUuXG5cdCAgICAgKlxuXHQgICAgICogQHByb3BlcnR5IHtudW1iZXJ9IF9taW5CdWZmZXJTaXplIFRoZSBudW1iZXIgb2YgYmxvY2tzIHRoYXQgc2hvdWxkIGJlIGtlcHQgdW5wcm9jZXNzZWQgaW4gdGhlIGJ1ZmZlci4gRGVmYXVsdDogMFxuXHQgICAgICovXG5cdCAgICB2YXIgQnVmZmVyZWRCbG9ja0FsZ29yaXRobSA9IENfbGliLkJ1ZmZlcmVkQmxvY2tBbGdvcml0aG0gPSBCYXNlLmV4dGVuZCh7XG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogUmVzZXRzIHRoaXMgYmxvY2sgYWxnb3JpdGhtJ3MgZGF0YSBidWZmZXIgdG8gaXRzIGluaXRpYWwgc3RhdGUuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIGJ1ZmZlcmVkQmxvY2tBbGdvcml0aG0ucmVzZXQoKTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICByZXNldDogZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICAvLyBJbml0aWFsIHZhbHVlc1xuXHQgICAgICAgICAgICB0aGlzLl9kYXRhID0gbmV3IFdvcmRBcnJheS5pbml0KCk7XG5cdCAgICAgICAgICAgIHRoaXMuX25EYXRhQnl0ZXMgPSAwO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBBZGRzIG5ldyBkYXRhIHRvIHRoaXMgYmxvY2sgYWxnb3JpdGhtJ3MgYnVmZmVyLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtXb3JkQXJyYXl8c3RyaW5nfSBkYXRhIFRoZSBkYXRhIHRvIGFwcGVuZC4gU3RyaW5ncyBhcmUgY29udmVydGVkIHRvIGEgV29yZEFycmF5IHVzaW5nIFVURi04LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICBidWZmZXJlZEJsb2NrQWxnb3JpdGhtLl9hcHBlbmQoJ2RhdGEnKTtcblx0ICAgICAgICAgKiAgICAgYnVmZmVyZWRCbG9ja0FsZ29yaXRobS5fYXBwZW5kKHdvcmRBcnJheSk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgX2FwcGVuZDogZnVuY3Rpb24gKGRhdGEpIHtcblx0ICAgICAgICAgICAgLy8gQ29udmVydCBzdHJpbmcgdG8gV29yZEFycmF5LCBlbHNlIGFzc3VtZSBXb3JkQXJyYXkgYWxyZWFkeVxuXHQgICAgICAgICAgICBpZiAodHlwZW9mIGRhdGEgPT0gJ3N0cmluZycpIHtcblx0ICAgICAgICAgICAgICAgIGRhdGEgPSBVdGY4LnBhcnNlKGRhdGEpO1xuXHQgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgLy8gQXBwZW5kXG5cdCAgICAgICAgICAgIHRoaXMuX2RhdGEuY29uY2F0KGRhdGEpO1xuXHQgICAgICAgICAgICB0aGlzLl9uRGF0YUJ5dGVzICs9IGRhdGEuc2lnQnl0ZXM7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIFByb2Nlc3NlcyBhdmFpbGFibGUgZGF0YSBibG9ja3MuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBUaGlzIG1ldGhvZCBpbnZva2VzIF9kb1Byb2Nlc3NCbG9jayhvZmZzZXQpLCB3aGljaCBtdXN0IGJlIGltcGxlbWVudGVkIGJ5IGEgY29uY3JldGUgc3VidHlwZS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gZG9GbHVzaCBXaGV0aGVyIGFsbCBibG9ja3MgYW5kIHBhcnRpYWwgYmxvY2tzIHNob3VsZCBiZSBwcm9jZXNzZWQuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtXb3JkQXJyYXl9IFRoZSBwcm9jZXNzZWQgZGF0YS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIHByb2Nlc3NlZERhdGEgPSBidWZmZXJlZEJsb2NrQWxnb3JpdGhtLl9wcm9jZXNzKCk7XG5cdCAgICAgICAgICogICAgIHZhciBwcm9jZXNzZWREYXRhID0gYnVmZmVyZWRCbG9ja0FsZ29yaXRobS5fcHJvY2VzcyghISdmbHVzaCcpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIF9wcm9jZXNzOiBmdW5jdGlvbiAoZG9GbHVzaCkge1xuXHQgICAgICAgICAgICAvLyBTaG9ydGN1dHNcblx0ICAgICAgICAgICAgdmFyIGRhdGEgPSB0aGlzLl9kYXRhO1xuXHQgICAgICAgICAgICB2YXIgZGF0YVdvcmRzID0gZGF0YS53b3Jkcztcblx0ICAgICAgICAgICAgdmFyIGRhdGFTaWdCeXRlcyA9IGRhdGEuc2lnQnl0ZXM7XG5cdCAgICAgICAgICAgIHZhciBibG9ja1NpemUgPSB0aGlzLmJsb2NrU2l6ZTtcblx0ICAgICAgICAgICAgdmFyIGJsb2NrU2l6ZUJ5dGVzID0gYmxvY2tTaXplICogNDtcblxuXHQgICAgICAgICAgICAvLyBDb3VudCBibG9ja3MgcmVhZHlcblx0ICAgICAgICAgICAgdmFyIG5CbG9ja3NSZWFkeSA9IGRhdGFTaWdCeXRlcyAvIGJsb2NrU2l6ZUJ5dGVzO1xuXHQgICAgICAgICAgICBpZiAoZG9GbHVzaCkge1xuXHQgICAgICAgICAgICAgICAgLy8gUm91bmQgdXAgdG8gaW5jbHVkZSBwYXJ0aWFsIGJsb2Nrc1xuXHQgICAgICAgICAgICAgICAgbkJsb2Nrc1JlYWR5ID0gTWF0aC5jZWlsKG5CbG9ja3NSZWFkeSk7XG5cdCAgICAgICAgICAgIH0gZWxzZSB7XG5cdCAgICAgICAgICAgICAgICAvLyBSb3VuZCBkb3duIHRvIGluY2x1ZGUgb25seSBmdWxsIGJsb2Nrcyxcblx0ICAgICAgICAgICAgICAgIC8vIGxlc3MgdGhlIG51bWJlciBvZiBibG9ja3MgdGhhdCBtdXN0IHJlbWFpbiBpbiB0aGUgYnVmZmVyXG5cdCAgICAgICAgICAgICAgICBuQmxvY2tzUmVhZHkgPSBNYXRoLm1heCgobkJsb2Nrc1JlYWR5IHwgMCkgLSB0aGlzLl9taW5CdWZmZXJTaXplLCAwKTtcblx0ICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgIC8vIENvdW50IHdvcmRzIHJlYWR5XG5cdCAgICAgICAgICAgIHZhciBuV29yZHNSZWFkeSA9IG5CbG9ja3NSZWFkeSAqIGJsb2NrU2l6ZTtcblxuXHQgICAgICAgICAgICAvLyBDb3VudCBieXRlcyByZWFkeVxuXHQgICAgICAgICAgICB2YXIgbkJ5dGVzUmVhZHkgPSBNYXRoLm1pbihuV29yZHNSZWFkeSAqIDQsIGRhdGFTaWdCeXRlcyk7XG5cblx0ICAgICAgICAgICAgLy8gUHJvY2VzcyBibG9ja3Ncblx0ICAgICAgICAgICAgaWYgKG5Xb3Jkc1JlYWR5KSB7XG5cdCAgICAgICAgICAgICAgICBmb3IgKHZhciBvZmZzZXQgPSAwOyBvZmZzZXQgPCBuV29yZHNSZWFkeTsgb2Zmc2V0ICs9IGJsb2NrU2l6ZSkge1xuXHQgICAgICAgICAgICAgICAgICAgIC8vIFBlcmZvcm0gY29uY3JldGUtYWxnb3JpdGhtIGxvZ2ljXG5cdCAgICAgICAgICAgICAgICAgICAgdGhpcy5fZG9Qcm9jZXNzQmxvY2soZGF0YVdvcmRzLCBvZmZzZXQpO1xuXHQgICAgICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgICAgICAvLyBSZW1vdmUgcHJvY2Vzc2VkIHdvcmRzXG5cdCAgICAgICAgICAgICAgICB2YXIgcHJvY2Vzc2VkV29yZHMgPSBkYXRhV29yZHMuc3BsaWNlKDAsIG5Xb3Jkc1JlYWR5KTtcblx0ICAgICAgICAgICAgICAgIGRhdGEuc2lnQnl0ZXMgLT0gbkJ5dGVzUmVhZHk7XG5cdCAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICAvLyBSZXR1cm4gcHJvY2Vzc2VkIHdvcmRzXG5cdCAgICAgICAgICAgIHJldHVybiBuZXcgV29yZEFycmF5LmluaXQocHJvY2Vzc2VkV29yZHMsIG5CeXRlc1JlYWR5KTtcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogQ3JlYXRlcyBhIGNvcHkgb2YgdGhpcyBvYmplY3QuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBjbG9uZS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIGNsb25lID0gYnVmZmVyZWRCbG9ja0FsZ29yaXRobS5jbG9uZSgpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIGNsb25lOiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgIHZhciBjbG9uZSA9IEJhc2UuY2xvbmUuY2FsbCh0aGlzKTtcblx0ICAgICAgICAgICAgY2xvbmUuX2RhdGEgPSB0aGlzLl9kYXRhLmNsb25lKCk7XG5cblx0ICAgICAgICAgICAgcmV0dXJuIGNsb25lO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICBfbWluQnVmZmVyU2l6ZTogMFxuXHQgICAgfSk7XG5cblx0ICAgIC8qKlxuXHQgICAgICogQWJzdHJhY3QgaGFzaGVyIHRlbXBsYXRlLlxuXHQgICAgICpcblx0ICAgICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBibG9ja1NpemUgVGhlIG51bWJlciBvZiAzMi1iaXQgd29yZHMgdGhpcyBoYXNoZXIgb3BlcmF0ZXMgb24uIERlZmF1bHQ6IDE2ICg1MTIgYml0cylcblx0ICAgICAqL1xuXHQgICAgdmFyIEhhc2hlciA9IENfbGliLkhhc2hlciA9IEJ1ZmZlcmVkQmxvY2tBbGdvcml0aG0uZXh0ZW5kKHtcblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBDb25maWd1cmF0aW9uIG9wdGlvbnMuXG5cdCAgICAgICAgICovXG5cdCAgICAgICAgY2ZnOiBCYXNlLmV4dGVuZCgpLFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogSW5pdGlhbGl6ZXMgYSBuZXdseSBjcmVhdGVkIGhhc2hlci5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBjZmcgKE9wdGlvbmFsKSBUaGUgY29uZmlndXJhdGlvbiBvcHRpb25zIHRvIHVzZSBmb3IgdGhpcyBoYXNoIGNvbXB1dGF0aW9uLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgaGFzaGVyID0gQ3J5cHRvSlMuYWxnby5TSEEyNTYuY3JlYXRlKCk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgaW5pdDogZnVuY3Rpb24gKGNmZykge1xuXHQgICAgICAgICAgICAvLyBBcHBseSBjb25maWcgZGVmYXVsdHNcblx0ICAgICAgICAgICAgdGhpcy5jZmcgPSB0aGlzLmNmZy5leHRlbmQoY2ZnKTtcblxuXHQgICAgICAgICAgICAvLyBTZXQgaW5pdGlhbCB2YWx1ZXNcblx0ICAgICAgICAgICAgdGhpcy5yZXNldCgpO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBSZXNldHMgdGhpcyBoYXNoZXIgdG8gaXRzIGluaXRpYWwgc3RhdGUuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIGhhc2hlci5yZXNldCgpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIHJlc2V0OiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgIC8vIFJlc2V0IGRhdGEgYnVmZmVyXG5cdCAgICAgICAgICAgIEJ1ZmZlcmVkQmxvY2tBbGdvcml0aG0ucmVzZXQuY2FsbCh0aGlzKTtcblxuXHQgICAgICAgICAgICAvLyBQZXJmb3JtIGNvbmNyZXRlLWhhc2hlciBsb2dpY1xuXHQgICAgICAgICAgICB0aGlzLl9kb1Jlc2V0KCk7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIFVwZGF0ZXMgdGhpcyBoYXNoZXIgd2l0aCBhIG1lc3NhZ2UuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge1dvcmRBcnJheXxzdHJpbmd9IG1lc3NhZ2VVcGRhdGUgVGhlIG1lc3NhZ2UgdG8gYXBwZW5kLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7SGFzaGVyfSBUaGlzIGhhc2hlci5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgaGFzaGVyLnVwZGF0ZSgnbWVzc2FnZScpO1xuXHQgICAgICAgICAqICAgICBoYXNoZXIudXBkYXRlKHdvcmRBcnJheSk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgdXBkYXRlOiBmdW5jdGlvbiAobWVzc2FnZVVwZGF0ZSkge1xuXHQgICAgICAgICAgICAvLyBBcHBlbmRcblx0ICAgICAgICAgICAgdGhpcy5fYXBwZW5kKG1lc3NhZ2VVcGRhdGUpO1xuXG5cdCAgICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgaGFzaFxuXHQgICAgICAgICAgICB0aGlzLl9wcm9jZXNzKCk7XG5cblx0ICAgICAgICAgICAgLy8gQ2hhaW5hYmxlXG5cdCAgICAgICAgICAgIHJldHVybiB0aGlzO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBGaW5hbGl6ZXMgdGhlIGhhc2ggY29tcHV0YXRpb24uXG5cdCAgICAgICAgICogTm90ZSB0aGF0IHRoZSBmaW5hbGl6ZSBvcGVyYXRpb24gaXMgZWZmZWN0aXZlbHkgYSBkZXN0cnVjdGl2ZSwgcmVhZC1vbmNlIG9wZXJhdGlvbi5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7V29yZEFycmF5fHN0cmluZ30gbWVzc2FnZVVwZGF0ZSAoT3B0aW9uYWwpIEEgZmluYWwgbWVzc2FnZSB1cGRhdGUuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtXb3JkQXJyYXl9IFRoZSBoYXNoLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgaGFzaCA9IGhhc2hlci5maW5hbGl6ZSgpO1xuXHQgICAgICAgICAqICAgICB2YXIgaGFzaCA9IGhhc2hlci5maW5hbGl6ZSgnbWVzc2FnZScpO1xuXHQgICAgICAgICAqICAgICB2YXIgaGFzaCA9IGhhc2hlci5maW5hbGl6ZSh3b3JkQXJyYXkpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIGZpbmFsaXplOiBmdW5jdGlvbiAobWVzc2FnZVVwZGF0ZSkge1xuXHQgICAgICAgICAgICAvLyBGaW5hbCBtZXNzYWdlIHVwZGF0ZVxuXHQgICAgICAgICAgICBpZiAobWVzc2FnZVVwZGF0ZSkge1xuXHQgICAgICAgICAgICAgICAgdGhpcy5fYXBwZW5kKG1lc3NhZ2VVcGRhdGUpO1xuXHQgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgLy8gUGVyZm9ybSBjb25jcmV0ZS1oYXNoZXIgbG9naWNcblx0ICAgICAgICAgICAgdmFyIGhhc2ggPSB0aGlzLl9kb0ZpbmFsaXplKCk7XG5cblx0ICAgICAgICAgICAgcmV0dXJuIGhhc2g7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIGJsb2NrU2l6ZTogNTEyLzMyLFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogQ3JlYXRlcyBhIHNob3J0Y3V0IGZ1bmN0aW9uIHRvIGEgaGFzaGVyJ3Mgb2JqZWN0IGludGVyZmFjZS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7SGFzaGVyfSBoYXNoZXIgVGhlIGhhc2hlciB0byBjcmVhdGUgYSBoZWxwZXIgZm9yLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7RnVuY3Rpb259IFRoZSBzaG9ydGN1dCBmdW5jdGlvbi5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBzdGF0aWNcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIFNIQTI1NiA9IENyeXB0b0pTLmxpYi5IYXNoZXIuX2NyZWF0ZUhlbHBlcihDcnlwdG9KUy5hbGdvLlNIQTI1Nik7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgX2NyZWF0ZUhlbHBlcjogZnVuY3Rpb24gKGhhc2hlcikge1xuXHQgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKG1lc3NhZ2UsIGNmZykge1xuXHQgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBoYXNoZXIuaW5pdChjZmcpLmZpbmFsaXplKG1lc3NhZ2UpO1xuXHQgICAgICAgICAgICB9O1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBDcmVhdGVzIGEgc2hvcnRjdXQgZnVuY3Rpb24gdG8gdGhlIEhNQUMncyBvYmplY3QgaW50ZXJmYWNlLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtIYXNoZXJ9IGhhc2hlciBUaGUgaGFzaGVyIHRvIHVzZSBpbiB0aGlzIEhNQUMgaGVscGVyLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7RnVuY3Rpb259IFRoZSBzaG9ydGN1dCBmdW5jdGlvbi5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBzdGF0aWNcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIEhtYWNTSEEyNTYgPSBDcnlwdG9KUy5saWIuSGFzaGVyLl9jcmVhdGVIbWFjSGVscGVyKENyeXB0b0pTLmFsZ28uU0hBMjU2KTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBfY3JlYXRlSG1hY0hlbHBlcjogZnVuY3Rpb24gKGhhc2hlcikge1xuXHQgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKG1lc3NhZ2UsIGtleSkge1xuXHQgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBDX2FsZ28uSE1BQy5pbml0KGhhc2hlciwga2V5KS5maW5hbGl6ZShtZXNzYWdlKTtcblx0ICAgICAgICAgICAgfTtcblx0ICAgICAgICB9XG5cdCAgICB9KTtcblxuXHQgICAgLyoqXG5cdCAgICAgKiBBbGdvcml0aG0gbmFtZXNwYWNlLlxuXHQgICAgICovXG5cdCAgICB2YXIgQ19hbGdvID0gQy5hbGdvID0ge307XG5cblx0ICAgIHJldHVybiBDO1xuXHR9KE1hdGgpKTtcblxuXG5cdHJldHVybiBDcnlwdG9KUztcblxufSkpOyIsIjsoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYgKHR5cGVvZiBleHBvcnRzID09PSBcIm9iamVjdFwiKSB7XG5cdFx0Ly8gQ29tbW9uSlNcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUoXCIuL2NvcmVcIikpO1xuXHR9XG5cdGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG5cdFx0Ly8gQU1EXG5cdFx0ZGVmaW5lKFtcIi4vY29yZVwiXSwgZmFjdG9yeSk7XG5cdH1cblx0ZWxzZSB7XG5cdFx0Ly8gR2xvYmFsIChicm93c2VyKVxuXHRcdGZhY3Rvcnkocm9vdC5DcnlwdG9KUyk7XG5cdH1cbn0odGhpcywgZnVuY3Rpb24gKENyeXB0b0pTKSB7XG5cblx0KGZ1bmN0aW9uICgpIHtcblx0ICAgIC8vIFNob3J0Y3V0c1xuXHQgICAgdmFyIEMgPSBDcnlwdG9KUztcblx0ICAgIHZhciBDX2xpYiA9IEMubGliO1xuXHQgICAgdmFyIFdvcmRBcnJheSA9IENfbGliLldvcmRBcnJheTtcblx0ICAgIHZhciBIYXNoZXIgPSBDX2xpYi5IYXNoZXI7XG5cdCAgICB2YXIgQ19hbGdvID0gQy5hbGdvO1xuXG5cdCAgICAvLyBSZXVzYWJsZSBvYmplY3Rcblx0ICAgIHZhciBXID0gW107XG5cblx0ICAgIC8qKlxuXHQgICAgICogU0hBLTEgaGFzaCBhbGdvcml0aG0uXG5cdCAgICAgKi9cblx0ICAgIHZhciBTSEExID0gQ19hbGdvLlNIQTEgPSBIYXNoZXIuZXh0ZW5kKHtcblx0ICAgICAgICBfZG9SZXNldDogZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICB0aGlzLl9oYXNoID0gbmV3IFdvcmRBcnJheS5pbml0KFtcblx0ICAgICAgICAgICAgICAgIDB4Njc0NTIzMDEsIDB4ZWZjZGFiODksXG5cdCAgICAgICAgICAgICAgICAweDk4YmFkY2ZlLCAweDEwMzI1NDc2LFxuXHQgICAgICAgICAgICAgICAgMHhjM2QyZTFmMFxuXHQgICAgICAgICAgICBdKTtcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgX2RvUHJvY2Vzc0Jsb2NrOiBmdW5jdGlvbiAoTSwgb2Zmc2V0KSB7XG5cdCAgICAgICAgICAgIC8vIFNob3J0Y3V0XG5cdCAgICAgICAgICAgIHZhciBIID0gdGhpcy5faGFzaC53b3JkcztcblxuXHQgICAgICAgICAgICAvLyBXb3JraW5nIHZhcmlhYmxlc1xuXHQgICAgICAgICAgICB2YXIgYSA9IEhbMF07XG5cdCAgICAgICAgICAgIHZhciBiID0gSFsxXTtcblx0ICAgICAgICAgICAgdmFyIGMgPSBIWzJdO1xuXHQgICAgICAgICAgICB2YXIgZCA9IEhbM107XG5cdCAgICAgICAgICAgIHZhciBlID0gSFs0XTtcblxuXHQgICAgICAgICAgICAvLyBDb21wdXRhdGlvblxuXHQgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDgwOyBpKyspIHtcblx0ICAgICAgICAgICAgICAgIGlmIChpIDwgMTYpIHtcblx0ICAgICAgICAgICAgICAgICAgICBXW2ldID0gTVtvZmZzZXQgKyBpXSB8IDA7XG5cdCAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXHQgICAgICAgICAgICAgICAgICAgIHZhciBuID0gV1tpIC0gM10gXiBXW2kgLSA4XSBeIFdbaSAtIDE0XSBeIFdbaSAtIDE2XTtcblx0ICAgICAgICAgICAgICAgICAgICBXW2ldID0gKG4gPDwgMSkgfCAobiA+Pj4gMzEpO1xuXHQgICAgICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgICAgICB2YXIgdCA9ICgoYSA8PCA1KSB8IChhID4+PiAyNykpICsgZSArIFdbaV07XG5cdCAgICAgICAgICAgICAgICBpZiAoaSA8IDIwKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgdCArPSAoKGIgJiBjKSB8ICh+YiAmIGQpKSArIDB4NWE4Mjc5OTk7XG5cdCAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGkgPCA0MCkge1xuXHQgICAgICAgICAgICAgICAgICAgIHQgKz0gKGIgXiBjIF4gZCkgKyAweDZlZDllYmExO1xuXHQgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpIDwgNjApIHtcblx0ICAgICAgICAgICAgICAgICAgICB0ICs9ICgoYiAmIGMpIHwgKGIgJiBkKSB8IChjICYgZCkpIC0gMHg3MGU0NDMyNDtcblx0ICAgICAgICAgICAgICAgIH0gZWxzZSAvKiBpZiAoaSA8IDgwKSAqLyB7XG5cdCAgICAgICAgICAgICAgICAgICAgdCArPSAoYiBeIGMgXiBkKSAtIDB4MzU5ZDNlMmE7XG5cdCAgICAgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgICAgIGUgPSBkO1xuXHQgICAgICAgICAgICAgICAgZCA9IGM7XG5cdCAgICAgICAgICAgICAgICBjID0gKGIgPDwgMzApIHwgKGIgPj4+IDIpO1xuXHQgICAgICAgICAgICAgICAgYiA9IGE7XG5cdCAgICAgICAgICAgICAgICBhID0gdDtcblx0ICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgIC8vIEludGVybWVkaWF0ZSBoYXNoIHZhbHVlXG5cdCAgICAgICAgICAgIEhbMF0gPSAoSFswXSArIGEpIHwgMDtcblx0ICAgICAgICAgICAgSFsxXSA9IChIWzFdICsgYikgfCAwO1xuXHQgICAgICAgICAgICBIWzJdID0gKEhbMl0gKyBjKSB8IDA7XG5cdCAgICAgICAgICAgIEhbM10gPSAoSFszXSArIGQpIHwgMDtcblx0ICAgICAgICAgICAgSFs0XSA9IChIWzRdICsgZSkgfCAwO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICBfZG9GaW5hbGl6ZTogZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICAvLyBTaG9ydGN1dHNcblx0ICAgICAgICAgICAgdmFyIGRhdGEgPSB0aGlzLl9kYXRhO1xuXHQgICAgICAgICAgICB2YXIgZGF0YVdvcmRzID0gZGF0YS53b3JkcztcblxuXHQgICAgICAgICAgICB2YXIgbkJpdHNUb3RhbCA9IHRoaXMuX25EYXRhQnl0ZXMgKiA4O1xuXHQgICAgICAgICAgICB2YXIgbkJpdHNMZWZ0ID0gZGF0YS5zaWdCeXRlcyAqIDg7XG5cblx0ICAgICAgICAgICAgLy8gQWRkIHBhZGRpbmdcblx0ICAgICAgICAgICAgZGF0YVdvcmRzW25CaXRzTGVmdCA+Pj4gNV0gfD0gMHg4MCA8PCAoMjQgLSBuQml0c0xlZnQgJSAzMik7XG5cdCAgICAgICAgICAgIGRhdGFXb3Jkc1soKChuQml0c0xlZnQgKyA2NCkgPj4+IDkpIDw8IDQpICsgMTRdID0gTWF0aC5mbG9vcihuQml0c1RvdGFsIC8gMHgxMDAwMDAwMDApO1xuXHQgICAgICAgICAgICBkYXRhV29yZHNbKCgobkJpdHNMZWZ0ICsgNjQpID4+PiA5KSA8PCA0KSArIDE1XSA9IG5CaXRzVG90YWw7XG5cdCAgICAgICAgICAgIGRhdGEuc2lnQnl0ZXMgPSBkYXRhV29yZHMubGVuZ3RoICogNDtcblxuXHQgICAgICAgICAgICAvLyBIYXNoIGZpbmFsIGJsb2Nrc1xuXHQgICAgICAgICAgICB0aGlzLl9wcm9jZXNzKCk7XG5cblx0ICAgICAgICAgICAgLy8gUmV0dXJuIGZpbmFsIGNvbXB1dGVkIGhhc2hcblx0ICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2hhc2g7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIGNsb25lOiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgIHZhciBjbG9uZSA9IEhhc2hlci5jbG9uZS5jYWxsKHRoaXMpO1xuXHQgICAgICAgICAgICBjbG9uZS5faGFzaCA9IHRoaXMuX2hhc2guY2xvbmUoKTtcblxuXHQgICAgICAgICAgICByZXR1cm4gY2xvbmU7XG5cdCAgICAgICAgfVxuXHQgICAgfSk7XG5cblx0ICAgIC8qKlxuXHQgICAgICogU2hvcnRjdXQgZnVuY3Rpb24gdG8gdGhlIGhhc2hlcidzIG9iamVjdCBpbnRlcmZhY2UuXG5cdCAgICAgKlxuXHQgICAgICogQHBhcmFtIHtXb3JkQXJyYXl8c3RyaW5nfSBtZXNzYWdlIFRoZSBtZXNzYWdlIHRvIGhhc2guXG5cdCAgICAgKlxuXHQgICAgICogQHJldHVybiB7V29yZEFycmF5fSBUaGUgaGFzaC5cblx0ICAgICAqXG5cdCAgICAgKiBAc3RhdGljXG5cdCAgICAgKlxuXHQgICAgICogQGV4YW1wbGVcblx0ICAgICAqXG5cdCAgICAgKiAgICAgdmFyIGhhc2ggPSBDcnlwdG9KUy5TSEExKCdtZXNzYWdlJyk7XG5cdCAgICAgKiAgICAgdmFyIGhhc2ggPSBDcnlwdG9KUy5TSEExKHdvcmRBcnJheSk7XG5cdCAgICAgKi9cblx0ICAgIEMuU0hBMSA9IEhhc2hlci5fY3JlYXRlSGVscGVyKFNIQTEpO1xuXG5cdCAgICAvKipcblx0ICAgICAqIFNob3J0Y3V0IGZ1bmN0aW9uIHRvIHRoZSBITUFDJ3Mgb2JqZWN0IGludGVyZmFjZS5cblx0ICAgICAqXG5cdCAgICAgKiBAcGFyYW0ge1dvcmRBcnJheXxzdHJpbmd9IG1lc3NhZ2UgVGhlIG1lc3NhZ2UgdG8gaGFzaC5cblx0ICAgICAqIEBwYXJhbSB7V29yZEFycmF5fHN0cmluZ30ga2V5IFRoZSBzZWNyZXQga2V5LlxuXHQgICAgICpcblx0ICAgICAqIEByZXR1cm4ge1dvcmRBcnJheX0gVGhlIEhNQUMuXG5cdCAgICAgKlxuXHQgICAgICogQHN0YXRpY1xuXHQgICAgICpcblx0ICAgICAqIEBleGFtcGxlXG5cdCAgICAgKlxuXHQgICAgICogICAgIHZhciBobWFjID0gQ3J5cHRvSlMuSG1hY1NIQTEobWVzc2FnZSwga2V5KTtcblx0ICAgICAqL1xuXHQgICAgQy5IbWFjU0hBMSA9IEhhc2hlci5fY3JlYXRlSG1hY0hlbHBlcihTSEExKTtcblx0fSgpKTtcblxuXG5cdHJldHVybiBDcnlwdG9KUy5TSEExO1xuXG59KSk7IiwiLy8gICAgIHV1aWQuanNcbi8vXG4vLyAgICAgQ29weXJpZ2h0IChjKSAyMDEwLTIwMTIgUm9iZXJ0IEtpZWZmZXJcbi8vICAgICBNSVQgTGljZW5zZSAtIGh0dHA6Ly9vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcblxuKGZ1bmN0aW9uKCkge1xuICB2YXIgX2dsb2JhbCA9IHRoaXM7XG5cbiAgLy8gVW5pcXVlIElEIGNyZWF0aW9uIHJlcXVpcmVzIGEgaGlnaCBxdWFsaXR5IHJhbmRvbSAjIGdlbmVyYXRvci4gIFdlIGZlYXR1cmVcbiAgLy8gZGV0ZWN0IHRvIGRldGVybWluZSB0aGUgYmVzdCBSTkcgc291cmNlLCBub3JtYWxpemluZyB0byBhIGZ1bmN0aW9uIHRoYXRcbiAgLy8gcmV0dXJucyAxMjgtYml0cyBvZiByYW5kb21uZXNzLCBzaW5jZSB0aGF0J3Mgd2hhdCdzIHVzdWFsbHkgcmVxdWlyZWRcbiAgdmFyIF9ybmc7XG5cbiAgLy8gTm9kZS5qcyBjcnlwdG8tYmFzZWQgUk5HIC0gaHR0cDovL25vZGVqcy5vcmcvZG9jcy92MC42LjIvYXBpL2NyeXB0by5odG1sXG4gIC8vXG4gIC8vIE1vZGVyYXRlbHkgZmFzdCwgaGlnaCBxdWFsaXR5XG4gIGlmICh0eXBlb2YoX2dsb2JhbC5yZXF1aXJlKSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgdHJ5IHtcbiAgICAgIHZhciBfcmIgPSBfZ2xvYmFsLnJlcXVpcmUoJ2NyeXB0bycpLnJhbmRvbUJ5dGVzO1xuICAgICAgX3JuZyA9IF9yYiAmJiBmdW5jdGlvbigpIHtyZXR1cm4gX3JiKDE2KTt9O1xuICAgIH0gY2F0Y2goZSkge31cbiAgfVxuXG4gIGlmICghX3JuZyAmJiBfZ2xvYmFsLmNyeXB0byAmJiBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKSB7XG4gICAgLy8gV0hBVFdHIGNyeXB0by1iYXNlZCBSTkcgLSBodHRwOi8vd2lraS53aGF0d2cub3JnL3dpa2kvQ3J5cHRvXG4gICAgLy9cbiAgICAvLyBNb2RlcmF0ZWx5IGZhc3QsIGhpZ2ggcXVhbGl0eVxuICAgIHZhciBfcm5kczggPSBuZXcgVWludDhBcnJheSgxNik7XG4gICAgX3JuZyA9IGZ1bmN0aW9uIHdoYXR3Z1JORygpIHtcbiAgICAgIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMoX3JuZHM4KTtcbiAgICAgIHJldHVybiBfcm5kczg7XG4gICAgfTtcbiAgfVxuXG4gIGlmICghX3JuZykge1xuICAgIC8vIE1hdGgucmFuZG9tKCktYmFzZWQgKFJORylcbiAgICAvL1xuICAgIC8vIElmIGFsbCBlbHNlIGZhaWxzLCB1c2UgTWF0aC5yYW5kb20oKS4gIEl0J3MgZmFzdCwgYnV0IGlzIG9mIHVuc3BlY2lmaWVkXG4gICAgLy8gcXVhbGl0eS5cbiAgICB2YXIgIF9ybmRzID0gbmV3IEFycmF5KDE2KTtcbiAgICBfcm5nID0gZnVuY3Rpb24oKSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgcjsgaSA8IDE2OyBpKyspIHtcbiAgICAgICAgaWYgKChpICYgMHgwMykgPT09IDApIHIgPSBNYXRoLnJhbmRvbSgpICogMHgxMDAwMDAwMDA7XG4gICAgICAgIF9ybmRzW2ldID0gciA+Pj4gKChpICYgMHgwMykgPDwgMykgJiAweGZmO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gX3JuZHM7XG4gICAgfTtcbiAgfVxuXG4gIC8vIEJ1ZmZlciBjbGFzcyB0byB1c2VcbiAgdmFyIEJ1ZmZlckNsYXNzID0gdHlwZW9mKF9nbG9iYWwuQnVmZmVyKSA9PSAnZnVuY3Rpb24nID8gX2dsb2JhbC5CdWZmZXIgOiBBcnJheTtcblxuICAvLyBNYXBzIGZvciBudW1iZXIgPC0+IGhleCBzdHJpbmcgY29udmVyc2lvblxuICB2YXIgX2J5dGVUb0hleCA9IFtdO1xuICB2YXIgX2hleFRvQnl0ZSA9IHt9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IDI1NjsgaSsrKSB7XG4gICAgX2J5dGVUb0hleFtpXSA9IChpICsgMHgxMDApLnRvU3RyaW5nKDE2KS5zdWJzdHIoMSk7XG4gICAgX2hleFRvQnl0ZVtfYnl0ZVRvSGV4W2ldXSA9IGk7XG4gIH1cblxuICAvLyAqKmBwYXJzZSgpYCAtIFBhcnNlIGEgVVVJRCBpbnRvIGl0J3MgY29tcG9uZW50IGJ5dGVzKipcbiAgZnVuY3Rpb24gcGFyc2UocywgYnVmLCBvZmZzZXQpIHtcbiAgICB2YXIgaSA9IChidWYgJiYgb2Zmc2V0KSB8fCAwLCBpaSA9IDA7XG5cbiAgICBidWYgPSBidWYgfHwgW107XG4gICAgcy50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1swLTlhLWZdezJ9L2csIGZ1bmN0aW9uKG9jdCkge1xuICAgICAgaWYgKGlpIDwgMTYpIHsgLy8gRG9uJ3Qgb3ZlcmZsb3chXG4gICAgICAgIGJ1ZltpICsgaWkrK10gPSBfaGV4VG9CeXRlW29jdF07XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBaZXJvIG91dCByZW1haW5pbmcgYnl0ZXMgaWYgc3RyaW5nIHdhcyBzaG9ydFxuICAgIHdoaWxlIChpaSA8IDE2KSB7XG4gICAgICBidWZbaSArIGlpKytdID0gMDtcbiAgICB9XG5cbiAgICByZXR1cm4gYnVmO1xuICB9XG5cbiAgLy8gKipgdW5wYXJzZSgpYCAtIENvbnZlcnQgVVVJRCBieXRlIGFycmF5IChhbGEgcGFyc2UoKSkgaW50byBhIHN0cmluZyoqXG4gIGZ1bmN0aW9uIHVucGFyc2UoYnVmLCBvZmZzZXQpIHtcbiAgICB2YXIgaSA9IG9mZnNldCB8fCAwLCBidGggPSBfYnl0ZVRvSGV4O1xuICAgIHJldHVybiAgYnRoW2J1ZltpKytdXSArIGJ0aFtidWZbaSsrXV0gK1xuICAgICAgICAgICAgYnRoW2J1ZltpKytdXSArIGJ0aFtidWZbaSsrXV0gKyAnLScgK1xuICAgICAgICAgICAgYnRoW2J1ZltpKytdXSArIGJ0aFtidWZbaSsrXV0gKyAnLScgK1xuICAgICAgICAgICAgYnRoW2J1ZltpKytdXSArIGJ0aFtidWZbaSsrXV0gKyAnLScgK1xuICAgICAgICAgICAgYnRoW2J1ZltpKytdXSArIGJ0aFtidWZbaSsrXV0gKyAnLScgK1xuICAgICAgICAgICAgYnRoW2J1ZltpKytdXSArIGJ0aFtidWZbaSsrXV0gK1xuICAgICAgICAgICAgYnRoW2J1ZltpKytdXSArIGJ0aFtidWZbaSsrXV0gK1xuICAgICAgICAgICAgYnRoW2J1ZltpKytdXSArIGJ0aFtidWZbaSsrXV07XG4gIH1cblxuICAvLyAqKmB2MSgpYCAtIEdlbmVyYXRlIHRpbWUtYmFzZWQgVVVJRCoqXG4gIC8vXG4gIC8vIEluc3BpcmVkIGJ5IGh0dHBzOi8vZ2l0aHViLmNvbS9MaW9zSy9VVUlELmpzXG4gIC8vIGFuZCBodHRwOi8vZG9jcy5weXRob24ub3JnL2xpYnJhcnkvdXVpZC5odG1sXG5cbiAgLy8gcmFuZG9tICMncyB3ZSBuZWVkIHRvIGluaXQgbm9kZSBhbmQgY2xvY2tzZXFcbiAgdmFyIF9zZWVkQnl0ZXMgPSBfcm5nKCk7XG5cbiAgLy8gUGVyIDQuNSwgY3JlYXRlIGFuZCA0OC1iaXQgbm9kZSBpZCwgKDQ3IHJhbmRvbSBiaXRzICsgbXVsdGljYXN0IGJpdCA9IDEpXG4gIHZhciBfbm9kZUlkID0gW1xuICAgIF9zZWVkQnl0ZXNbMF0gfCAweDAxLFxuICAgIF9zZWVkQnl0ZXNbMV0sIF9zZWVkQnl0ZXNbMl0sIF9zZWVkQnl0ZXNbM10sIF9zZWVkQnl0ZXNbNF0sIF9zZWVkQnl0ZXNbNV1cbiAgXTtcblxuICAvLyBQZXIgNC4yLjIsIHJhbmRvbWl6ZSAoMTQgYml0KSBjbG9ja3NlcVxuICB2YXIgX2Nsb2Nrc2VxID0gKF9zZWVkQnl0ZXNbNl0gPDwgOCB8IF9zZWVkQnl0ZXNbN10pICYgMHgzZmZmO1xuXG4gIC8vIFByZXZpb3VzIHV1aWQgY3JlYXRpb24gdGltZVxuICB2YXIgX2xhc3RNU2VjcyA9IDAsIF9sYXN0TlNlY3MgPSAwO1xuXG4gIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vYnJvb2ZhL25vZGUtdXVpZCBmb3IgQVBJIGRldGFpbHNcbiAgZnVuY3Rpb24gdjEob3B0aW9ucywgYnVmLCBvZmZzZXQpIHtcbiAgICB2YXIgaSA9IGJ1ZiAmJiBvZmZzZXQgfHwgMDtcbiAgICB2YXIgYiA9IGJ1ZiB8fCBbXTtcblxuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgdmFyIGNsb2Nrc2VxID0gb3B0aW9ucy5jbG9ja3NlcSAhPSBudWxsID8gb3B0aW9ucy5jbG9ja3NlcSA6IF9jbG9ja3NlcTtcblxuICAgIC8vIFVVSUQgdGltZXN0YW1wcyBhcmUgMTAwIG5hbm8tc2Vjb25kIHVuaXRzIHNpbmNlIHRoZSBHcmVnb3JpYW4gZXBvY2gsXG4gICAgLy8gKDE1ODItMTAtMTUgMDA6MDApLiAgSlNOdW1iZXJzIGFyZW4ndCBwcmVjaXNlIGVub3VnaCBmb3IgdGhpcywgc29cbiAgICAvLyB0aW1lIGlzIGhhbmRsZWQgaW50ZXJuYWxseSBhcyAnbXNlY3MnIChpbnRlZ2VyIG1pbGxpc2Vjb25kcykgYW5kICduc2VjcydcbiAgICAvLyAoMTAwLW5hbm9zZWNvbmRzIG9mZnNldCBmcm9tIG1zZWNzKSBzaW5jZSB1bml4IGVwb2NoLCAxOTcwLTAxLTAxIDAwOjAwLlxuICAgIHZhciBtc2VjcyA9IG9wdGlvbnMubXNlY3MgIT0gbnVsbCA/IG9wdGlvbnMubXNlY3MgOiBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuICAgIC8vIFBlciA0LjIuMS4yLCB1c2UgY291bnQgb2YgdXVpZCdzIGdlbmVyYXRlZCBkdXJpbmcgdGhlIGN1cnJlbnQgY2xvY2tcbiAgICAvLyBjeWNsZSB0byBzaW11bGF0ZSBoaWdoZXIgcmVzb2x1dGlvbiBjbG9ja1xuICAgIHZhciBuc2VjcyA9IG9wdGlvbnMubnNlY3MgIT0gbnVsbCA/IG9wdGlvbnMubnNlY3MgOiBfbGFzdE5TZWNzICsgMTtcblxuICAgIC8vIFRpbWUgc2luY2UgbGFzdCB1dWlkIGNyZWF0aW9uIChpbiBtc2VjcylcbiAgICB2YXIgZHQgPSAobXNlY3MgLSBfbGFzdE1TZWNzKSArIChuc2VjcyAtIF9sYXN0TlNlY3MpLzEwMDAwO1xuXG4gICAgLy8gUGVyIDQuMi4xLjIsIEJ1bXAgY2xvY2tzZXEgb24gY2xvY2sgcmVncmVzc2lvblxuICAgIGlmIChkdCA8IDAgJiYgb3B0aW9ucy5jbG9ja3NlcSA9PSBudWxsKSB7XG4gICAgICBjbG9ja3NlcSA9IGNsb2Nrc2VxICsgMSAmIDB4M2ZmZjtcbiAgICB9XG5cbiAgICAvLyBSZXNldCBuc2VjcyBpZiBjbG9jayByZWdyZXNzZXMgKG5ldyBjbG9ja3NlcSkgb3Igd2UndmUgbW92ZWQgb250byBhIG5ld1xuICAgIC8vIHRpbWUgaW50ZXJ2YWxcbiAgICBpZiAoKGR0IDwgMCB8fCBtc2VjcyA+IF9sYXN0TVNlY3MpICYmIG9wdGlvbnMubnNlY3MgPT0gbnVsbCkge1xuICAgICAgbnNlY3MgPSAwO1xuICAgIH1cblxuICAgIC8vIFBlciA0LjIuMS4yIFRocm93IGVycm9yIGlmIHRvbyBtYW55IHV1aWRzIGFyZSByZXF1ZXN0ZWRcbiAgICBpZiAobnNlY3MgPj0gMTAwMDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcigndXVpZC52MSgpOiBDYW5cXCd0IGNyZWF0ZSBtb3JlIHRoYW4gMTBNIHV1aWRzL3NlYycpO1xuICAgIH1cblxuICAgIF9sYXN0TVNlY3MgPSBtc2VjcztcbiAgICBfbGFzdE5TZWNzID0gbnNlY3M7XG4gICAgX2Nsb2Nrc2VxID0gY2xvY2tzZXE7XG5cbiAgICAvLyBQZXIgNC4xLjQgLSBDb252ZXJ0IGZyb20gdW5peCBlcG9jaCB0byBHcmVnb3JpYW4gZXBvY2hcbiAgICBtc2VjcyArPSAxMjIxOTI5MjgwMDAwMDtcblxuICAgIC8vIGB0aW1lX2xvd2BcbiAgICB2YXIgdGwgPSAoKG1zZWNzICYgMHhmZmZmZmZmKSAqIDEwMDAwICsgbnNlY3MpICUgMHgxMDAwMDAwMDA7XG4gICAgYltpKytdID0gdGwgPj4+IDI0ICYgMHhmZjtcbiAgICBiW2krK10gPSB0bCA+Pj4gMTYgJiAweGZmO1xuICAgIGJbaSsrXSA9IHRsID4+PiA4ICYgMHhmZjtcbiAgICBiW2krK10gPSB0bCAmIDB4ZmY7XG5cbiAgICAvLyBgdGltZV9taWRgXG4gICAgdmFyIHRtaCA9IChtc2VjcyAvIDB4MTAwMDAwMDAwICogMTAwMDApICYgMHhmZmZmZmZmO1xuICAgIGJbaSsrXSA9IHRtaCA+Pj4gOCAmIDB4ZmY7XG4gICAgYltpKytdID0gdG1oICYgMHhmZjtcblxuICAgIC8vIGB0aW1lX2hpZ2hfYW5kX3ZlcnNpb25gXG4gICAgYltpKytdID0gdG1oID4+PiAyNCAmIDB4ZiB8IDB4MTA7IC8vIGluY2x1ZGUgdmVyc2lvblxuICAgIGJbaSsrXSA9IHRtaCA+Pj4gMTYgJiAweGZmO1xuXG4gICAgLy8gYGNsb2NrX3NlcV9oaV9hbmRfcmVzZXJ2ZWRgIChQZXIgNC4yLjIgLSBpbmNsdWRlIHZhcmlhbnQpXG4gICAgYltpKytdID0gY2xvY2tzZXEgPj4+IDggfCAweDgwO1xuXG4gICAgLy8gYGNsb2NrX3NlcV9sb3dgXG4gICAgYltpKytdID0gY2xvY2tzZXEgJiAweGZmO1xuXG4gICAgLy8gYG5vZGVgXG4gICAgdmFyIG5vZGUgPSBvcHRpb25zLm5vZGUgfHwgX25vZGVJZDtcbiAgICBmb3IgKHZhciBuID0gMDsgbiA8IDY7IG4rKykge1xuICAgICAgYltpICsgbl0gPSBub2RlW25dO1xuICAgIH1cblxuICAgIHJldHVybiBidWYgPyBidWYgOiB1bnBhcnNlKGIpO1xuICB9XG5cbiAgLy8gKipgdjQoKWAgLSBHZW5lcmF0ZSByYW5kb20gVVVJRCoqXG5cbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9icm9vZmEvbm9kZS11dWlkIGZvciBBUEkgZGV0YWlsc1xuICBmdW5jdGlvbiB2NChvcHRpb25zLCBidWYsIG9mZnNldCkge1xuICAgIC8vIERlcHJlY2F0ZWQgLSAnZm9ybWF0JyBhcmd1bWVudCwgYXMgc3VwcG9ydGVkIGluIHYxLjJcbiAgICB2YXIgaSA9IGJ1ZiAmJiBvZmZzZXQgfHwgMDtcblxuICAgIGlmICh0eXBlb2Yob3B0aW9ucykgPT0gJ3N0cmluZycpIHtcbiAgICAgIGJ1ZiA9IG9wdGlvbnMgPT0gJ2JpbmFyeScgPyBuZXcgQnVmZmVyQ2xhc3MoMTYpIDogbnVsbDtcbiAgICAgIG9wdGlvbnMgPSBudWxsO1xuICAgIH1cbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHZhciBybmRzID0gb3B0aW9ucy5yYW5kb20gfHwgKG9wdGlvbnMucm5nIHx8IF9ybmcpKCk7XG5cbiAgICAvLyBQZXIgNC40LCBzZXQgYml0cyBmb3IgdmVyc2lvbiBhbmQgYGNsb2NrX3NlcV9oaV9hbmRfcmVzZXJ2ZWRgXG4gICAgcm5kc1s2XSA9IChybmRzWzZdICYgMHgwZikgfCAweDQwO1xuICAgIHJuZHNbOF0gPSAocm5kc1s4XSAmIDB4M2YpIHwgMHg4MDtcblxuICAgIC8vIENvcHkgYnl0ZXMgdG8gYnVmZmVyLCBpZiBwcm92aWRlZFxuICAgIGlmIChidWYpIHtcbiAgICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCAxNjsgaWkrKykge1xuICAgICAgICBidWZbaSArIGlpXSA9IHJuZHNbaWldO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBidWYgfHwgdW5wYXJzZShybmRzKTtcbiAgfVxuXG4gIC8vIEV4cG9ydCBwdWJsaWMgQVBJXG4gIHZhciB1dWlkID0gdjQ7XG4gIHV1aWQudjEgPSB2MTtcbiAgdXVpZC52NCA9IHY0O1xuICB1dWlkLnBhcnNlID0gcGFyc2U7XG4gIHV1aWQudW5wYXJzZSA9IHVucGFyc2U7XG4gIHV1aWQuQnVmZmVyQ2xhc3MgPSBCdWZmZXJDbGFzcztcblxuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgLy8gUHVibGlzaCBhcyBBTUQgbW9kdWxlXG4gICAgZGVmaW5lKGZ1bmN0aW9uKCkge3JldHVybiB1dWlkO30pO1xuICB9IGVsc2UgaWYgKHR5cGVvZihtb2R1bGUpICE9ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgLy8gUHVibGlzaCBhcyBub2RlLmpzIG1vZHVsZVxuICAgIG1vZHVsZS5leHBvcnRzID0gdXVpZDtcbiAgfSBlbHNlIHtcbiAgICAvLyBQdWJsaXNoIGFzIGdsb2JhbCAoaW4gYnJvd3NlcnMpXG4gICAgdmFyIF9wcmV2aW91c1Jvb3QgPSBfZ2xvYmFsLnV1aWQ7XG5cbiAgICAvLyAqKmBub0NvbmZsaWN0KClgIC0gKGJyb3dzZXIgb25seSkgdG8gcmVzZXQgZ2xvYmFsICd1dWlkJyB2YXIqKlxuICAgIHV1aWQubm9Db25mbGljdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgX2dsb2JhbC51dWlkID0gX3ByZXZpb3VzUm9vdDtcbiAgICAgIHJldHVybiB1dWlkO1xuICAgIH07XG5cbiAgICBfZ2xvYmFsLnV1aWQgPSB1dWlkO1xuICB9XG59KS5jYWxsKHRoaXMpO1xuIiwidmFyIEFkYXB0ZXJzLCBTdG9yYWdlLCB1dGlscyxcbiAgYmluZCA9IGZ1bmN0aW9uKGZuLCBtZSl7IHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gZm4uYXBwbHkobWUsIGFyZ3VtZW50cyk7IH07IH07XG5cbnV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG5TdG9yYWdlID0gcmVxdWlyZSgnLi9zdG9yYWdlJyk7XG5cbkFkYXB0ZXJzID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBBZGFwdGVycygpIHt9XG5cbiAgQWRhcHRlcnMuR2ltZWxBZGFwdGVyID0gKGZ1bmN0aW9uKCkge1xuICAgIEdpbWVsQWRhcHRlci5wcm90b3R5cGUucXVldWVfbmFtZSA9ICdfZ2ltZWxfcXVldWUnO1xuXG4gICAgZnVuY3Rpb24gR2ltZWxBZGFwdGVyKHVybCwgbmFtZXNwYWNlLCBzdG9yYWdlKSB7XG4gICAgICBpZiAoc3RvcmFnZSA9PSBudWxsKSB7XG4gICAgICAgIHN0b3JhZ2UgPSBBZGFwdGVycy5Mb2NhbFN0b3JhZ2VBZGFwdGVyO1xuICAgICAgfVxuICAgICAgdGhpcy5nb2FsX2NvbXBsZXRlID0gYmluZCh0aGlzLmdvYWxfY29tcGxldGUsIHRoaXMpO1xuICAgICAgdGhpcy5leHBlcmltZW50X3N0YXJ0ID0gYmluZCh0aGlzLmV4cGVyaW1lbnRfc3RhcnQsIHRoaXMpO1xuICAgICAgdGhpcy5fc3RvcmFnZSA9IHN0b3JhZ2U7XG4gICAgICB0aGlzLnVybCA9IHVybDtcbiAgICAgIHRoaXMubmFtZXNwYWNlID0gbmFtZXNwYWNlO1xuICAgICAgdGhpcy5fcXVldWUgPSBKU09OLnBhcnNlKHRoaXMuX3N0b3JhZ2UuZ2V0KHRoaXMucXVldWVfbmFtZSkgfHwgJ1tdJyk7XG4gICAgICB0aGlzLl9mbHVzaCgpO1xuICAgIH1cblxuICAgIEdpbWVsQWRhcHRlci5wcm90b3R5cGUuX3JlbW92ZV9xdXVpZCA9IGZ1bmN0aW9uKHF1dWlkKSB7XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihlcnIsIHJlcykge1xuICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgdXRpbHMucmVtb3ZlKF90aGlzLl9xdWV1ZSwgZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgICAgIHJldHVybiBlbC5wcm9wZXJ0aWVzLl9xdXVpZCA9PT0gcXV1aWQ7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLl9zdG9yYWdlLnNldChfdGhpcy5xdWV1ZV9uYW1lLCBKU09OLnN0cmluZ2lmeShfdGhpcy5fcXVldWUpKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpO1xuICAgIH07XG5cbiAgICBHaW1lbEFkYXB0ZXIucHJvdG90eXBlLl9qcXVlcnlfZ2V0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBjYWxsYmFjaykge1xuICAgICAgdXRpbHMubG9nKCdzZW5kIHJlcXVlc3QgdXNpbmcgalF1ZXJ5Jyk7XG4gICAgICByZXR1cm4gd2luZG93LmpRdWVyeS5hamF4KHtcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgIHN1Y2Nlc3M6IGNhbGxiYWNrXG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgR2ltZWxBZGFwdGVyLnByb3RvdHlwZS5fcGxhaW5fanNfZ2V0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBjYWxsYmFjaykge1xuICAgICAgdmFyIGssIHBhcmFtcywgdiwgeGhyO1xuICAgICAgdXRpbHMubG9nKCdmYWxsYmFjayBvbiBwbGFpbiBqcyB4aHInKTtcbiAgICAgIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgcGFyYW1zID0gKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVzdWx0cztcbiAgICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgICBmb3IgKGsgaW4gZGF0YSkge1xuICAgICAgICAgIHYgPSBkYXRhW2tdO1xuICAgICAgICAgIHJlc3VsdHMucHVzaCgoZW5jb2RlVVJJQ29tcG9uZW50KGspKSArIFwiPVwiICsgKGVuY29kZVVSSUNvbXBvbmVudCh2KSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgfSkoKTtcbiAgICAgIHBhcmFtcyA9IHBhcmFtcy5qb2luKCcmJykucmVwbGFjZSgvJTIwL2csICcrJyk7XG4gICAgICB4aHIub3BlbignR0VUJywgdXJsICsgXCI/XCIgKyBwYXJhbXMpO1xuICAgICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoeGhyLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICByZXR1cm4geGhyLnNlbmQoKTtcbiAgICB9O1xuXG4gICAgR2ltZWxBZGFwdGVyLnByb3RvdHlwZS5fYWpheF9nZXQgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICB2YXIgcmVmO1xuICAgICAgaWYgKChyZWYgPSB3aW5kb3cualF1ZXJ5KSAhPSBudWxsID8gcmVmLmFqYXggOiB2b2lkIDApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2pxdWVyeV9nZXQodXJsLCBkYXRhLCBjYWxsYmFjayk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5fcGxhaW5fanNfZ2V0KHVybCwgZGF0YSwgY2FsbGJhY2spO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBHaW1lbEFkYXB0ZXIucHJvdG90eXBlLl9mbHVzaCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGNhbGxiYWNrLCBpLCBpdGVtLCBsZW4sIHJlZiwgcmVzdWx0cztcbiAgICAgIHJlZiA9IHRoaXMuX3F1ZXVlO1xuICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGl0ZW0gPSByZWZbaV07XG4gICAgICAgIGNhbGxiYWNrID0gdGhpcy5fcmVtb3ZlX3F1dWlkKGl0ZW0ucHJvcGVydGllcy5fcXV1aWQpO1xuICAgICAgICB0aGlzLl9hamF4X2dldCh0aGlzLnVybCwgdXRpbHMub21pdChpdGVtLnByb3BlcnRpZXMsICdfcXV1aWQnKSwgY2FsbGJhY2spO1xuICAgICAgICByZXN1bHRzLnB1c2gobnVsbCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9O1xuXG4gICAgR2ltZWxBZGFwdGVyLnByb3RvdHlwZS5fdXNlcl91dWlkID0gZnVuY3Rpb24oZXhwZXJpbWVudCwgZ29hbCkge1xuICAgICAgaWYgKCFleHBlcmltZW50LnVzZXJfaWQpIHtcbiAgICAgICAgcmV0dXJuIHV0aWxzLnV1aWQoKTtcbiAgICAgIH1cbiAgICAgIGlmICghZ29hbC51bmlxdWUpIHtcbiAgICAgICAgcmV0dXJuIHV0aWxzLnV1aWQoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB1dGlscy5zaGExKHRoaXMubmFtZXNwYWNlICsgXCIuXCIgKyBleHBlcmltZW50Lm5hbWUgKyBcIi5cIiArIGV4cGVyaW1lbnQudXNlcl9pZCk7XG4gICAgfTtcblxuICAgIEdpbWVsQWRhcHRlci5wcm90b3R5cGUuX3RyYWNrID0gZnVuY3Rpb24oZXhwZXJpbWVudCwgdmFyaWFudCwgZ29hbCkge1xuICAgICAgdXRpbHMubG9nKFwiUGVyc2lzdGVudCBRdWV1ZSBHaW1lbCB0cmFjazogXCIgKyB0aGlzLm5hbWVzcGFjZSArIFwiLCBcIiArIGV4cGVyaW1lbnQubmFtZSArIFwiLCBcIiArIHZhcmlhbnQgKyBcIiwgXCIgKyBnb2FsLm5hbWUpO1xuICAgICAgaWYgKHRoaXMuX3F1ZXVlLmxlbmd0aCA+IDEwMCkge1xuICAgICAgICB0aGlzLl9xdWV1ZS5zaGlmdCgpO1xuICAgICAgfVxuICAgICAgdGhpcy5fcXVldWUucHVzaCh7XG4gICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICBleHBlcmltZW50OiBleHBlcmltZW50Lm5hbWUsXG4gICAgICAgICAgX3F1dWlkOiB1dGlscy51dWlkKCksXG4gICAgICAgICAgdXVpZDogdGhpcy5fdXNlcl91dWlkKGV4cGVyaW1lbnQsIGdvYWwpLFxuICAgICAgICAgIHZhcmlhbnQ6IHZhcmlhbnQsXG4gICAgICAgICAgZXZlbnQ6IGdvYWwubmFtZSxcbiAgICAgICAgICBuYW1lc3BhY2U6IHRoaXMubmFtZXNwYWNlXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgdGhpcy5fc3RvcmFnZS5zZXQodGhpcy5xdWV1ZV9uYW1lLCBKU09OLnN0cmluZ2lmeSh0aGlzLl9xdWV1ZSkpO1xuICAgICAgcmV0dXJuIHRoaXMuX2ZsdXNoKCk7XG4gICAgfTtcblxuICAgIEdpbWVsQWRhcHRlci5wcm90b3R5cGUuZXhwZXJpbWVudF9zdGFydCA9IGZ1bmN0aW9uKGV4cGVyaW1lbnQsIHZhcmlhbnQpIHtcbiAgICAgIHJldHVybiB0aGlzLl90cmFjayhleHBlcmltZW50LCB2YXJpYW50LCB7XG4gICAgICAgIG5hbWU6ICdwYXJ0aWNpcGF0ZScsXG4gICAgICAgIHVuaXF1ZTogdHJ1ZVxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIEdpbWVsQWRhcHRlci5wcm90b3R5cGUuZ29hbF9jb21wbGV0ZSA9IGZ1bmN0aW9uKGV4cGVyaW1lbnQsIHZhcmlhbnQsIGdvYWxfbmFtZSwgcHJvcHMpIHtcbiAgICAgIHJldHVybiB0aGlzLl90cmFjayhleHBlcmltZW50LCB2YXJpYW50LCB1dGlscy5kZWZhdWx0cyh7XG4gICAgICAgIG5hbWU6IGdvYWxfbmFtZVxuICAgICAgfSwgcHJvcHMpKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIEdpbWVsQWRhcHRlcjtcblxuICB9KSgpO1xuXG4gIEFkYXB0ZXJzLlBlcnNpc3RlbnRRdWV1ZUdvb2dsZUFuYWx5dGljc0FkYXB0ZXIgPSAoZnVuY3Rpb24oKSB7XG4gICAgUGVyc2lzdGVudFF1ZXVlR29vZ2xlQW5hbHl0aWNzQWRhcHRlci5wcm90b3R5cGUubmFtZXNwYWNlID0gJ2FsZXBoYmV0JztcblxuICAgIFBlcnNpc3RlbnRRdWV1ZUdvb2dsZUFuYWx5dGljc0FkYXB0ZXIucHJvdG90eXBlLnF1ZXVlX25hbWUgPSAnX2dhX3F1ZXVlJztcblxuICAgIGZ1bmN0aW9uIFBlcnNpc3RlbnRRdWV1ZUdvb2dsZUFuYWx5dGljc0FkYXB0ZXIoc3RvcmFnZSkge1xuICAgICAgaWYgKHN0b3JhZ2UgPT0gbnVsbCkge1xuICAgICAgICBzdG9yYWdlID0gQWRhcHRlcnMuTG9jYWxTdG9yYWdlQWRhcHRlcjtcbiAgICAgIH1cbiAgICAgIHRoaXMuZ29hbF9jb21wbGV0ZSA9IGJpbmQodGhpcy5nb2FsX2NvbXBsZXRlLCB0aGlzKTtcbiAgICAgIHRoaXMuZXhwZXJpbWVudF9zdGFydCA9IGJpbmQodGhpcy5leHBlcmltZW50X3N0YXJ0LCB0aGlzKTtcbiAgICAgIHRoaXMuX3N0b3JhZ2UgPSBzdG9yYWdlO1xuICAgICAgdGhpcy5fcXVldWUgPSBKU09OLnBhcnNlKHRoaXMuX3N0b3JhZ2UuZ2V0KHRoaXMucXVldWVfbmFtZSkgfHwgJ1tdJyk7XG4gICAgICB0aGlzLl9mbHVzaCgpO1xuICAgIH1cblxuICAgIFBlcnNpc3RlbnRRdWV1ZUdvb2dsZUFuYWx5dGljc0FkYXB0ZXIucHJvdG90eXBlLl9yZW1vdmVfdXVpZCA9IGZ1bmN0aW9uKHV1aWQpIHtcbiAgICAgIHJldHVybiAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHV0aWxzLnJlbW92ZShfdGhpcy5fcXVldWUsIGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgICAgICByZXR1cm4gZWwudXVpZCA9PT0gdXVpZDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gX3RoaXMuX3N0b3JhZ2Uuc2V0KF90aGlzLnF1ZXVlX25hbWUsIEpTT04uc3RyaW5naWZ5KF90aGlzLl9xdWV1ZSkpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcyk7XG4gICAgfTtcblxuICAgIFBlcnNpc3RlbnRRdWV1ZUdvb2dsZUFuYWx5dGljc0FkYXB0ZXIucHJvdG90eXBlLl9mbHVzaCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGNhbGxiYWNrLCBpLCBpdGVtLCBsZW4sIHJlZiwgcmVzdWx0cztcbiAgICAgIGlmICh0eXBlb2YgZ2EgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdnYSBub3QgZGVmaW5lZC4gUGxlYXNlIG1ha2Ugc3VyZSB5b3VyIFVuaXZlcnNhbCBhbmFseXRpY3MgaXMgc2V0IHVwIGNvcnJlY3RseScpO1xuICAgICAgfVxuICAgICAgcmVmID0gdGhpcy5fcXVldWU7XG4gICAgICByZXN1bHRzID0gW107XG4gICAgICBmb3IgKGkgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgaXRlbSA9IHJlZltpXTtcbiAgICAgICAgY2FsbGJhY2sgPSB0aGlzLl9yZW1vdmVfdXVpZChpdGVtLnV1aWQpO1xuICAgICAgICByZXN1bHRzLnB1c2goZ2EoJ3NlbmQnLCAnZXZlbnQnLCBpdGVtLmNhdGVnb3J5LCBpdGVtLmFjdGlvbiwgaXRlbS5sYWJlbCwge1xuICAgICAgICAgICdoaXRDYWxsYmFjayc6IGNhbGxiYWNrLFxuICAgICAgICAgICdub25JbnRlcmFjdGlvbic6IDFcbiAgICAgICAgfSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfTtcblxuICAgIFBlcnNpc3RlbnRRdWV1ZUdvb2dsZUFuYWx5dGljc0FkYXB0ZXIucHJvdG90eXBlLl90cmFjayA9IGZ1bmN0aW9uKGNhdGVnb3J5LCBhY3Rpb24sIGxhYmVsKSB7XG4gICAgICB1dGlscy5sb2coXCJQZXJzaXN0ZW50IFF1ZXVlIEdvb2dsZSBVbml2ZXJzYWwgQW5hbHl0aWNzIHRyYWNrOiBcIiArIGNhdGVnb3J5ICsgXCIsIFwiICsgYWN0aW9uICsgXCIsIFwiICsgbGFiZWwpO1xuICAgICAgaWYgKHRoaXMuX3F1ZXVlLmxlbmd0aCA+IDEwMCkge1xuICAgICAgICB0aGlzLl9xdWV1ZS5zaGlmdCgpO1xuICAgICAgfVxuICAgICAgdGhpcy5fcXVldWUucHVzaCh7XG4gICAgICAgIHV1aWQ6IHV0aWxzLnV1aWQoKSxcbiAgICAgICAgY2F0ZWdvcnk6IGNhdGVnb3J5LFxuICAgICAgICBhY3Rpb246IGFjdGlvbixcbiAgICAgICAgbGFiZWw6IGxhYmVsXG4gICAgICB9KTtcbiAgICAgIHRoaXMuX3N0b3JhZ2Uuc2V0KHRoaXMucXVldWVfbmFtZSwgSlNPTi5zdHJpbmdpZnkodGhpcy5fcXVldWUpKTtcbiAgICAgIHJldHVybiB0aGlzLl9mbHVzaCgpO1xuICAgIH07XG5cbiAgICBQZXJzaXN0ZW50UXVldWVHb29nbGVBbmFseXRpY3NBZGFwdGVyLnByb3RvdHlwZS5leHBlcmltZW50X3N0YXJ0ID0gZnVuY3Rpb24oZXhwZXJpbWVudCwgdmFyaWFudCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3RyYWNrKHRoaXMubmFtZXNwYWNlLCBleHBlcmltZW50Lm5hbWUgKyBcIiB8IFwiICsgdmFyaWFudCwgJ1Zpc2l0b3JzJyk7XG4gICAgfTtcblxuICAgIFBlcnNpc3RlbnRRdWV1ZUdvb2dsZUFuYWx5dGljc0FkYXB0ZXIucHJvdG90eXBlLmdvYWxfY29tcGxldGUgPSBmdW5jdGlvbihleHBlcmltZW50LCB2YXJpYW50LCBnb2FsX25hbWUsIF9wcm9wcykge1xuICAgICAgcmV0dXJuIHRoaXMuX3RyYWNrKHRoaXMubmFtZXNwYWNlLCBleHBlcmltZW50Lm5hbWUgKyBcIiB8IFwiICsgdmFyaWFudCwgZ29hbF9uYW1lKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIFBlcnNpc3RlbnRRdWV1ZUdvb2dsZUFuYWx5dGljc0FkYXB0ZXI7XG5cbiAgfSkoKTtcblxuICBBZGFwdGVycy5QZXJzaXN0ZW50UXVldWVLZWVuQWRhcHRlciA9IChmdW5jdGlvbigpIHtcbiAgICBQZXJzaXN0ZW50UXVldWVLZWVuQWRhcHRlci5wcm90b3R5cGUucXVldWVfbmFtZSA9ICdfa2Vlbl9xdWV1ZSc7XG5cbiAgICBmdW5jdGlvbiBQZXJzaXN0ZW50UXVldWVLZWVuQWRhcHRlcihrZWVuX2NsaWVudCwgc3RvcmFnZSkge1xuICAgICAgaWYgKHN0b3JhZ2UgPT0gbnVsbCkge1xuICAgICAgICBzdG9yYWdlID0gQWRhcHRlcnMuTG9jYWxTdG9yYWdlQWRhcHRlcjtcbiAgICAgIH1cbiAgICAgIHRoaXMuZ29hbF9jb21wbGV0ZSA9IGJpbmQodGhpcy5nb2FsX2NvbXBsZXRlLCB0aGlzKTtcbiAgICAgIHRoaXMuZXhwZXJpbWVudF9zdGFydCA9IGJpbmQodGhpcy5leHBlcmltZW50X3N0YXJ0LCB0aGlzKTtcbiAgICAgIHRoaXMuY2xpZW50ID0ga2Vlbl9jbGllbnQ7XG4gICAgICB0aGlzLl9zdG9yYWdlID0gc3RvcmFnZTtcbiAgICAgIHRoaXMuX3F1ZXVlID0gSlNPTi5wYXJzZSh0aGlzLl9zdG9yYWdlLmdldCh0aGlzLnF1ZXVlX25hbWUpIHx8ICdbXScpO1xuICAgICAgdGhpcy5fZmx1c2goKTtcbiAgICB9XG5cbiAgICBQZXJzaXN0ZW50UXVldWVLZWVuQWRhcHRlci5wcm90b3R5cGUuX3JlbW92ZV9xdXVpZCA9IGZ1bmN0aW9uKHF1dWlkKSB7XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihlcnIsIHJlcykge1xuICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgdXRpbHMucmVtb3ZlKF90aGlzLl9xdWV1ZSwgZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgICAgIHJldHVybiBlbC5wcm9wZXJ0aWVzLl9xdXVpZCA9PT0gcXV1aWQ7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLl9zdG9yYWdlLnNldChfdGhpcy5xdWV1ZV9uYW1lLCBKU09OLnN0cmluZ2lmeShfdGhpcy5fcXVldWUpKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpO1xuICAgIH07XG5cbiAgICBQZXJzaXN0ZW50UXVldWVLZWVuQWRhcHRlci5wcm90b3R5cGUuX2ZsdXNoID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY2FsbGJhY2ssIGksIGl0ZW0sIGxlbiwgcmVmLCByZXN1bHRzO1xuICAgICAgcmVmID0gdGhpcy5fcXVldWU7XG4gICAgICByZXN1bHRzID0gW107XG4gICAgICBmb3IgKGkgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgaXRlbSA9IHJlZltpXTtcbiAgICAgICAgY2FsbGJhY2sgPSB0aGlzLl9yZW1vdmVfcXV1aWQoaXRlbS5wcm9wZXJ0aWVzLl9xdXVpZCk7XG4gICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLmNsaWVudC5hZGRFdmVudChpdGVtLmV4cGVyaW1lbnRfbmFtZSwgdXRpbHMub21pdChpdGVtLnByb3BlcnRpZXMsICdfcXV1aWQnKSwgY2FsbGJhY2spKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH07XG5cbiAgICBQZXJzaXN0ZW50UXVldWVLZWVuQWRhcHRlci5wcm90b3R5cGUuX3VzZXJfdXVpZCA9IGZ1bmN0aW9uKGV4cGVyaW1lbnQsIGdvYWwpIHtcbiAgICAgIGlmICghZXhwZXJpbWVudC51c2VyX2lkKSB7XG4gICAgICAgIHJldHVybiB1dGlscy51dWlkKCk7XG4gICAgICB9XG4gICAgICBpZiAoIWdvYWwudW5pcXVlKSB7XG4gICAgICAgIHJldHVybiB1dGlscy51dWlkKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdXRpbHMuc2hhMSh0aGlzLm5hbWVzcGFjZSArIFwiLlwiICsgZXhwZXJpbWVudC5uYW1lICsgXCIuXCIgKyBleHBlcmltZW50LnVzZXJfaWQpO1xuICAgIH07XG5cbiAgICBQZXJzaXN0ZW50UXVldWVLZWVuQWRhcHRlci5wcm90b3R5cGUuX3RyYWNrID0gZnVuY3Rpb24oZXhwZXJpbWVudCwgdmFyaWFudCwgZ29hbCkge1xuICAgICAgdXRpbHMubG9nKFwiUGVyc2lzdGVudCBRdWV1ZSBLZWVuIHRyYWNrOiBcIiArIGV4cGVyaW1lbnQubmFtZSArIFwiLCBcIiArIHZhcmlhbnQgKyBcIiwgXCIgKyBldmVudCk7XG4gICAgICBpZiAodGhpcy5fcXVldWUubGVuZ3RoID4gMTAwKSB7XG4gICAgICAgIHRoaXMuX3F1ZXVlLnNoaWZ0KCk7XG4gICAgICB9XG4gICAgICB0aGlzLl9xdWV1ZS5wdXNoKHtcbiAgICAgICAgZXhwZXJpbWVudF9uYW1lOiBleHBlcmltZW50Lm5hbWUsXG4gICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICBfcXV1aWQ6IHV0aWxzLnV1aWQoKSxcbiAgICAgICAgICB1dWlkOiB0aGlzLl91c2VyX3V1aWQoZXhwZXJpbWVudCwgZ29hbCksXG4gICAgICAgICAgdmFyaWFudDogdmFyaWFudCxcbiAgICAgICAgICBldmVudDogZ29hbC5uYW1lXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgdGhpcy5fc3RvcmFnZS5zZXQodGhpcy5xdWV1ZV9uYW1lLCBKU09OLnN0cmluZ2lmeSh0aGlzLl9xdWV1ZSkpO1xuICAgICAgcmV0dXJuIHRoaXMuX2ZsdXNoKCk7XG4gICAgfTtcblxuICAgIFBlcnNpc3RlbnRRdWV1ZUtlZW5BZGFwdGVyLnByb3RvdHlwZS5leHBlcmltZW50X3N0YXJ0ID0gZnVuY3Rpb24oZXhwZXJpbWVudCwgdmFyaWFudCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3RyYWNrKGV4cGVyaW1lbnQsIHZhcmlhbnQsIHtcbiAgICAgICAgbmFtZTogJ3BhcnRpY2lwYXRlJyxcbiAgICAgICAgdW5pcXVlOiB0cnVlXG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgUGVyc2lzdGVudFF1ZXVlS2VlbkFkYXB0ZXIucHJvdG90eXBlLmdvYWxfY29tcGxldGUgPSBmdW5jdGlvbihleHBlcmltZW50LCB2YXJpYW50LCBnb2FsX25hbWUsIHByb3BzKSB7XG4gICAgICByZXR1cm4gdGhpcy5fdHJhY2soZXhwZXJpbWVudCwgdmFyaWFudCwgdXRpbHMuZGVmYXVsdHMoe1xuICAgICAgICBuYW1lOiBnb2FsX25hbWVcbiAgICAgIH0sIHByb3BzKSk7XG4gICAgfTtcblxuICAgIHJldHVybiBQZXJzaXN0ZW50UXVldWVLZWVuQWRhcHRlcjtcblxuICB9KSgpO1xuXG4gIEFkYXB0ZXJzLkdvb2dsZVVuaXZlcnNhbEFuYWx5dGljc0FkYXB0ZXIgPSAoZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gR29vZ2xlVW5pdmVyc2FsQW5hbHl0aWNzQWRhcHRlcigpIHt9XG5cbiAgICBHb29nbGVVbml2ZXJzYWxBbmFseXRpY3NBZGFwdGVyLm5hbWVzcGFjZSA9ICdhbGVwaGJldCc7XG5cbiAgICBHb29nbGVVbml2ZXJzYWxBbmFseXRpY3NBZGFwdGVyLl90cmFjayA9IGZ1bmN0aW9uKGNhdGVnb3J5LCBhY3Rpb24sIGxhYmVsKSB7XG4gICAgICB1dGlscy5sb2coXCJHb29nbGUgVW5pdmVyc2FsIEFuYWx5dGljcyB0cmFjazogXCIgKyBjYXRlZ29yeSArIFwiLCBcIiArIGFjdGlvbiArIFwiLCBcIiArIGxhYmVsKTtcbiAgICAgIGlmICh0eXBlb2YgZ2EgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdnYSBub3QgZGVmaW5lZC4gUGxlYXNlIG1ha2Ugc3VyZSB5b3VyIFVuaXZlcnNhbCBhbmFseXRpY3MgaXMgc2V0IHVwIGNvcnJlY3RseScpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGdhKCdzZW5kJywgJ2V2ZW50JywgY2F0ZWdvcnksIGFjdGlvbiwgbGFiZWwsIHtcbiAgICAgICAgJ25vbkludGVyYWN0aW9uJzogMVxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIEdvb2dsZVVuaXZlcnNhbEFuYWx5dGljc0FkYXB0ZXIuZXhwZXJpbWVudF9zdGFydCA9IGZ1bmN0aW9uKGV4cGVyaW1lbnQsIHZhcmlhbnQpIHtcbiAgICAgIHJldHVybiBHb29nbGVVbml2ZXJzYWxBbmFseXRpY3NBZGFwdGVyLl90cmFjayhHb29nbGVVbml2ZXJzYWxBbmFseXRpY3NBZGFwdGVyLm5hbWVzcGFjZSwgZXhwZXJpbWVudC5uYW1lICsgXCIgfCBcIiArIHZhcmlhbnQsICdWaXNpdG9ycycpO1xuICAgIH07XG5cbiAgICBHb29nbGVVbml2ZXJzYWxBbmFseXRpY3NBZGFwdGVyLmdvYWxfY29tcGxldGUgPSBmdW5jdGlvbihleHBlcmltZW50LCB2YXJpYW50LCBnb2FsX25hbWUsIF9wcm9wcykge1xuICAgICAgcmV0dXJuIEdvb2dsZVVuaXZlcnNhbEFuYWx5dGljc0FkYXB0ZXIuX3RyYWNrKEdvb2dsZVVuaXZlcnNhbEFuYWx5dGljc0FkYXB0ZXIubmFtZXNwYWNlLCBleHBlcmltZW50Lm5hbWUgKyBcIiB8IFwiICsgdmFyaWFudCwgZ29hbF9uYW1lKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIEdvb2dsZVVuaXZlcnNhbEFuYWx5dGljc0FkYXB0ZXI7XG5cbiAgfSkoKTtcblxuICBBZGFwdGVycy5Mb2NhbFN0b3JhZ2VBZGFwdGVyID0gKGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIExvY2FsU3RvcmFnZUFkYXB0ZXIoKSB7fVxuXG4gICAgTG9jYWxTdG9yYWdlQWRhcHRlci5uYW1lc3BhY2UgPSAnYWxlcGhiZXQnO1xuXG4gICAgTG9jYWxTdG9yYWdlQWRhcHRlci5zZXQgPSBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgICByZXR1cm4gbmV3IFN0b3JhZ2UodGhpcy5uYW1lc3BhY2UpLnNldChrZXksIHZhbHVlKTtcbiAgICB9O1xuXG4gICAgTG9jYWxTdG9yYWdlQWRhcHRlci5nZXQgPSBmdW5jdGlvbihrZXkpIHtcbiAgICAgIHJldHVybiBuZXcgU3RvcmFnZSh0aGlzLm5hbWVzcGFjZSkuZ2V0KGtleSk7XG4gICAgfTtcblxuICAgIHJldHVybiBMb2NhbFN0b3JhZ2VBZGFwdGVyO1xuXG4gIH0pKCk7XG5cbiAgcmV0dXJuIEFkYXB0ZXJzO1xuXG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFkYXB0ZXJzO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lMMmh2YldVdmVXOWhkaTlqYjJSbEwyRnNaWEJvWW1WMEwzTnlZeTloWkdGd2RHVnljeTVqYjJabVpXVWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUl2YUc5dFpTOTViMkYyTDJOdlpHVXZZV3hsY0doaVpYUXZjM0pqTDJGa1lYQjBaWEp6TG1OdlptWmxaU0pkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZCUVN4SlFVRkJMSGRDUVVGQk8wVkJRVUU3TzBGQlFVRXNTMEZCUVN4SFFVRlJMRTlCUVVFc1EwRkJVU3hUUVVGU096dEJRVU5TTEU5QlFVRXNSMEZCVlN4UFFVRkJMRU5CUVZFc1YwRkJVanM3UVVGRlNqczdPMFZCVVVVc1VVRkJReXhEUVVGQk96SkNRVU5NTEZWQlFVRXNSMEZCV1RzN1NVRkZReXh6UWtGQlF5eEhRVUZFTEVWQlFVMHNVMEZCVGl4RlFVRnBRaXhQUVVGcVFqczdVVUZCYVVJc1ZVRkJWU3hSUVVGUkxFTkJRVU03T3pzN1RVRkRMME1zU1VGQlF5eERRVUZCTEZGQlFVUXNSMEZCV1R0TlFVTmFMRWxCUVVNc1EwRkJRU3hIUVVGRUxFZEJRVTg3VFVGRFVDeEpRVUZETEVOQlFVRXNVMEZCUkN4SFFVRmhPMDFCUTJJc1NVRkJReXhEUVVGQkxFMUJRVVFzUjBGQlZTeEpRVUZKTEVOQlFVTXNTMEZCVEN4RFFVRlhMRWxCUVVNc1EwRkJRU3hSUVVGUkxFTkJRVU1zUjBGQlZpeERRVUZqTEVsQlFVTXNRMEZCUVN4VlFVRm1MRU5CUVVFc1NVRkJPRUlzU1VGQmVrTTdUVUZEVml4SlFVRkRMRU5CUVVFc1RVRkJSQ3hEUVVGQk8wbEJURmM3T3pKQ1FVOWlMR0ZCUVVFc1IwRkJaU3hUUVVGRExFdEJRVVE3WVVGRFlpeERRVUZCTEZOQlFVRXNTMEZCUVR0bFFVRkJMRk5CUVVNc1IwRkJSQ3hGUVVGTkxFZEJRVTQ3VlVGRFJTeEpRVUZWTEVkQlFWWTdRVUZCUVN4dFFrRkJRVHM3VlVGRFFTeExRVUZMTEVOQlFVTXNUVUZCVGl4RFFVRmhMRXRCUVVNc1EwRkJRU3hOUVVGa0xFVkJRWE5DTEZOQlFVTXNSVUZCUkR0dFFrRkJVU3hGUVVGRkxFTkJRVU1zVlVGQlZTeERRVUZETEUxQlFXUXNTMEZCZDBJN1ZVRkJhRU1zUTBGQmRFSTdhVUpCUTBFc1MwRkJReXhEUVVGQkxGRkJRVkVzUTBGQlF5eEhRVUZXTEVOQlFXTXNTMEZCUXl4RFFVRkJMRlZCUVdZc1JVRkJNa0lzU1VGQlNTeERRVUZETEZOQlFVd3NRMEZCWlN4TFFVRkRMRU5CUVVFc1RVRkJhRUlzUTBGQk0wSTdVVUZJUmp0TlFVRkJMRU5CUVVFc1EwRkJRU3hEUVVGQkxFbEJRVUU3U1VGRVlUczdNa0pCVFdZc1YwRkJRU3hIUVVGaExGTkJRVU1zUjBGQlJDeEZRVUZOTEVsQlFVNHNSVUZCV1N4UlFVRmFPMDFCUTFnc1MwRkJTeXhEUVVGRExFZEJRVTRzUTBGQlZTd3lRa0ZCVmp0aFFVTkJMRTFCUVUwc1EwRkJReXhOUVVGTkxFTkJRVU1zU1VGQlpDeERRVU5GTzFGQlFVRXNUVUZCUVN4RlFVRlJMRXRCUVZJN1VVRkRRU3hIUVVGQkxFVkJRVXNzUjBGRVREdFJRVVZCTEVsQlFVRXNSVUZCVFN4SlFVWk9PMUZCUjBFc1QwRkJRU3hGUVVGVExGRkJTRlE3VDBGRVJqdEpRVVpYT3pzeVFrRlJZaXhoUVVGQkxFZEJRV1VzVTBGQlF5eEhRVUZFTEVWQlFVMHNTVUZCVGl4RlFVRlpMRkZCUVZvN1FVRkRZaXhWUVVGQk8wMUJRVUVzUzBGQlN5eERRVUZETEVkQlFVNHNRMEZCVlN3d1FrRkJWanROUVVOQkxFZEJRVUVzUjBGQlRTeEpRVUZKTEdOQlFVb3NRMEZCUVR0TlFVTk9MRTFCUVVFN08wRkJRVlU3WVVGQlFTeFRRVUZCT3p0MVFrRkJSU3hEUVVGRExHdENRVUZCTEVOQlFXMUNMRU5CUVc1Q0xFTkJRVVFzUTBGQlFTeEhRVUYxUWl4SFFVRjJRaXhIUVVGNVFpeERRVUZETEd0Q1FVRkJMRU5CUVcxQ0xFTkJRVzVDTEVOQlFVUTdRVUZCTTBJN096dE5RVU5XTEUxQlFVRXNSMEZCVXl4TlFVRk5MRU5CUVVNc1NVRkJVQ3hEUVVGWkxFZEJRVm9zUTBGQlowSXNRMEZCUXl4UFFVRnFRaXhEUVVGNVFpeE5RVUY2UWl4RlFVRnBReXhIUVVGcVF6dE5RVU5VTEVkQlFVY3NRMEZCUXl4SlFVRktMRU5CUVZNc1MwRkJWQ3hGUVVGdFFpeEhRVUZFTEVkQlFVc3NSMEZCVEN4SFFVRlJMRTFCUVRGQ08wMUJRMEVzUjBGQlJ5eERRVUZETEUxQlFVb3NSMEZCWVN4VFFVRkJPMUZCUTFnc1NVRkJSeXhIUVVGSExFTkJRVU1zVFVGQlNpeExRVUZqTEVkQlFXcENPMmxDUVVORkxGRkJRVUVzUTBGQlFTeEZRVVJHT3p0TlFVUlhPMkZCUjJJc1IwRkJSeXhEUVVGRExFbEJRVW9zUTBGQlFUdEpRVlJoT3pzeVFrRlhaaXhUUVVGQkxFZEJRVmNzVTBGQlF5eEhRVUZFTEVWQlFVMHNTVUZCVGl4RlFVRlpMRkZCUVZvN1FVRkRWQ3hWUVVGQk8wMUJRVUVzZFVOQlFXZENMRU5CUVVVc1lVRkJiRUk3WlVGRFJTeEpRVUZETEVOQlFVRXNWMEZCUkN4RFFVRmhMRWRCUVdJc1JVRkJhMElzU1VGQmJFSXNSVUZCZDBJc1VVRkJlRUlzUlVGRVJqdFBRVUZCTEUxQlFVRTdaVUZIUlN4SlFVRkRMRU5CUVVFc1lVRkJSQ3hEUVVGbExFZEJRV1lzUlVGQmIwSXNTVUZCY0VJc1JVRkJNRUlzVVVGQk1VSXNSVUZJUmpzN1NVRkVVenM3TWtKQlRWZ3NUVUZCUVN4SFFVRlJMRk5CUVVFN1FVRkRUaXhWUVVGQk8wRkJRVUU3UVVGQlFUdFhRVUZCTEhGRFFVRkJPenRSUVVORkxGRkJRVUVzUjBGQlZ5eEpRVUZETEVOQlFVRXNZVUZCUkN4RFFVRmxMRWxCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU1zVFVGQkwwSTdVVUZEV0N4SlFVRkRMRU5CUVVFc1UwRkJSQ3hEUVVGWExFbEJRVU1zUTBGQlFTeEhRVUZhTEVWQlFXbENMRXRCUVVzc1EwRkJReXhKUVVGT0xFTkJRVmNzU1VGQlNTeERRVUZETEZWQlFXaENMRVZCUVRSQ0xGRkJRVFZDTEVOQlFXcENMRVZCUVhkRUxGRkJRWGhFTzNGQ1FVTkJPMEZCU0VZN08wbEJSRTA3T3pKQ1FVMVNMRlZCUVVFc1IwRkJXU3hUUVVGRExGVkJRVVFzUlVGQllTeEpRVUZpTzAxQlExWXNTVUZCUVN4RFFVRXlRaXhWUVVGVkxFTkJRVU1zVDBGQmRFTTdRVUZCUVN4bFFVRlBMRXRCUVVzc1EwRkJReXhKUVVGT0xFTkJRVUVzUlVGQlVEczdUVUZGUVN4SlFVRkJMRU5CUVRKQ0xFbEJRVWtzUTBGQlF5eE5RVUZvUXp0QlFVRkJMR1ZCUVU4c1MwRkJTeXhEUVVGRExFbEJRVTRzUTBGQlFTeEZRVUZRT3p0aFFVZEJMRXRCUVVzc1EwRkJReXhKUVVGT0xFTkJRV01zU1VGQlF5eERRVUZCTEZOQlFVWXNSMEZCV1N4SFFVRmFMRWRCUVdVc1ZVRkJWU3hEUVVGRExFbEJRVEZDTEVkQlFTdENMRWRCUVM5Q0xFZEJRV3RETEZWQlFWVXNRMEZCUXl4UFFVRXhSRHRKUVU1Vk96c3lRa0ZSV2l4TlFVRkJMRWRCUVZFc1UwRkJReXhWUVVGRUxFVkJRV0VzVDBGQllpeEZRVUZ6UWl4SlFVRjBRanROUVVOT0xFdEJRVXNzUTBGQlF5eEhRVUZPTEVOQlFWVXNaME5CUVVFc1IwRkJhVU1zU1VGQlF5eERRVUZCTEZOQlFXeERMRWRCUVRSRExFbEJRVFZETEVkQlFXZEVMRlZCUVZVc1EwRkJReXhKUVVFelJDeEhRVUZuUlN4SlFVRm9SU3hIUVVGdlJTeFBRVUZ3UlN4SFFVRTBSU3hKUVVFMVJTeEhRVUZuUml4SlFVRkpMRU5CUVVNc1NVRkJMMFk3VFVGRFFTeEpRVUZ0UWl4SlFVRkRMRU5CUVVFc1RVRkJUU3hEUVVGRExFMUJRVklzUjBGQmFVSXNSMEZCY0VNN1VVRkJRU3hKUVVGRExFTkJRVUVzVFVGQlRTeERRVUZETEV0QlFWSXNRMEZCUVN4RlFVRkJPenROUVVOQkxFbEJRVU1zUTBGQlFTeE5RVUZOTEVOQlFVTXNTVUZCVWl4RFFVTkZPMUZCUVVFc1ZVRkJRU3hGUVVORk8xVkJRVUVzVlVGQlFTeEZRVUZaTEZWQlFWVXNRMEZCUXl4SlFVRjJRanRWUVVOQkxFMUJRVUVzUlVGQlVTeExRVUZMTEVOQlFVTXNTVUZCVGl4RFFVRkJMRU5CUkZJN1ZVRkZRU3hKUVVGQkxFVkJRVTBzU1VGQlF5eERRVUZCTEZWQlFVUXNRMEZCV1N4VlFVRmFMRVZCUVhkQ0xFbEJRWGhDTEVOQlJrNDdWVUZIUVN4UFFVRkJMRVZCUVZNc1QwRklWRHRWUVVsQkxFdEJRVUVzUlVGQlR5eEpRVUZKTEVOQlFVTXNTVUZLV2p0VlFVdEJMRk5CUVVFc1JVRkJWeXhKUVVGRExFTkJRVUVzVTBGTVdqdFRRVVJHTzA5QlJFWTdUVUZSUVN4SlFVRkRMRU5CUVVFc1VVRkJVU3hEUVVGRExFZEJRVllzUTBGQll5eEpRVUZETEVOQlFVRXNWVUZCWml4RlFVRXlRaXhKUVVGSkxFTkJRVU1zVTBGQlRDeERRVUZsTEVsQlFVTXNRMEZCUVN4TlFVRm9RaXhEUVVFelFqdGhRVU5CTEVsQlFVTXNRMEZCUVN4TlFVRkVMRU5CUVVFN1NVRmFUVHM3TWtKQlkxSXNaMEpCUVVFc1IwRkJhMElzVTBGQlF5eFZRVUZFTEVWQlFXRXNUMEZCWWp0aFFVTm9RaXhKUVVGRExFTkJRVUVzVFVGQlJDeERRVUZSTEZWQlFWSXNSVUZCYjBJc1QwRkJjRUlzUlVGQk5rSTdVVUZCUXl4SlFVRkJMRVZCUVUwc1lVRkJVRHRSUVVGelFpeE5RVUZCTEVWQlFWRXNTVUZCT1VJN1QwRkJOMEk3U1VGRVowSTdPekpDUVVkc1FpeGhRVUZCTEVkQlFXVXNVMEZCUXl4VlFVRkVMRVZCUVdFc1QwRkJZaXhGUVVGelFpeFRRVUYwUWl4RlFVRnBReXhMUVVGcVF6dGhRVU5pTEVsQlFVTXNRMEZCUVN4TlFVRkVMRU5CUVZFc1ZVRkJVaXhGUVVGdlFpeFBRVUZ3UWl4RlFVRTJRaXhMUVVGTExFTkJRVU1zVVVGQlRpeERRVUZsTzFGQlFVTXNTVUZCUVN4RlFVRk5MRk5CUVZBN1QwRkJaaXhGUVVGclF5eExRVUZzUXl4RFFVRTNRanRKUVVSaE96czdPenM3UlVGSldDeFJRVUZETEVOQlFVRTdiMFJCUTB3c1UwRkJRU3hIUVVGWE96dHZSRUZEV0N4VlFVRkJMRWRCUVZrN08wbEJSVU1zSzBOQlFVTXNUMEZCUkRzN1VVRkJReXhWUVVGVkxGRkJRVkVzUTBGQlF6czdPenROUVVNdlFpeEpRVUZETEVOQlFVRXNVVUZCUkN4SFFVRlpPMDFCUTFvc1NVRkJReXhEUVVGQkxFMUJRVVFzUjBGQlZTeEpRVUZKTEVOQlFVTXNTMEZCVEN4RFFVRlhMRWxCUVVNc1EwRkJRU3hSUVVGUkxFTkJRVU1zUjBGQlZpeERRVUZqTEVsQlFVTXNRMEZCUVN4VlFVRm1MRU5CUVVFc1NVRkJPRUlzU1VGQmVrTTdUVUZEVml4SlFVRkRMRU5CUVVFc1RVRkJSQ3hEUVVGQk8wbEJTRmM3TzI5RVFVdGlMRmxCUVVFc1IwRkJZeXhUUVVGRExFbEJRVVE3WVVGRFdpeERRVUZCTEZOQlFVRXNTMEZCUVR0bFFVRkJMRk5CUVVFN1ZVRkRSU3hMUVVGTExFTkJRVU1zVFVGQlRpeERRVUZoTEV0QlFVTXNRMEZCUVN4TlFVRmtMRVZCUVhOQ0xGTkJRVU1zUlVGQlJEdHRRa0ZCVVN4RlFVRkZMRU5CUVVNc1NVRkJTQ3hMUVVGWE8xVkJRVzVDTEVOQlFYUkNPMmxDUVVOQkxFdEJRVU1zUTBGQlFTeFJRVUZSTEVOQlFVTXNSMEZCVml4RFFVRmpMRXRCUVVNc1EwRkJRU3hWUVVGbUxFVkJRVEpDTEVsQlFVa3NRMEZCUXl4VFFVRk1MRU5CUVdVc1MwRkJReXhEUVVGQkxFMUJRV2hDTEVOQlFUTkNPMUZCUmtZN1RVRkJRU3hEUVVGQkxFTkJRVUVzUTBGQlFTeEpRVUZCTzBsQlJGazdPMjlFUVV0a0xFMUJRVUVzUjBGQlVTeFRRVUZCTzBGQlEwNHNWVUZCUVR0TlFVRkJMRWxCUVc5SExFOUJRVThzUlVGQlVDeExRVUZsTEZWQlFXNUlPMEZCUVVFc1kwRkJUU3hKUVVGSkxFdEJRVW9zUTBGQlZTd3JSVUZCVml4RlFVRk9PenRCUVVOQk8wRkJRVUU3VjBGQlFTeHhRMEZCUVRzN1VVRkRSU3hSUVVGQkxFZEJRVmNzU1VGQlF5eERRVUZCTEZsQlFVUXNRMEZCWXl4SlFVRkpMRU5CUVVNc1NVRkJia0k3Y1VKQlExZ3NSVUZCUVN4RFFVRkhMRTFCUVVnc1JVRkJWeXhQUVVGWUxFVkJRVzlDTEVsQlFVa3NRMEZCUXl4UlFVRjZRaXhGUVVGdFF5eEpRVUZKTEVOQlFVTXNUVUZCZUVNc1JVRkJaMFFzU1VGQlNTeERRVUZETEV0QlFYSkVMRVZCUVRSRU8xVkJRVU1zWVVGQlFTeEZRVUZsTEZGQlFXaENPMVZCUVRCQ0xHZENRVUZCTEVWQlFXdENMRU5CUVRWRE8xTkJRVFZFTzBGQlJrWTdPMGxCUmswN08yOUVRVTFTTEUxQlFVRXNSMEZCVVN4VFFVRkRMRkZCUVVRc1JVRkJWeXhOUVVGWUxFVkJRVzFDTEV0QlFXNUNPMDFCUTA0c1MwRkJTeXhEUVVGRExFZEJRVTRzUTBGQlZTeHhSRUZCUVN4SFFVRnpSQ3hSUVVGMFJDeEhRVUVyUkN4SlFVRXZSQ3hIUVVGdFJTeE5RVUZ1UlN4SFFVRXdSU3hKUVVFeFJTeEhRVUU0UlN4TFFVRjRSanROUVVOQkxFbEJRVzFDTEVsQlFVTXNRMEZCUVN4TlFVRk5MRU5CUVVNc1RVRkJVaXhIUVVGcFFpeEhRVUZ3UXp0UlFVRkJMRWxCUVVNc1EwRkJRU3hOUVVGTkxFTkJRVU1zUzBGQlVpeERRVUZCTEVWQlFVRTdPMDFCUTBFc1NVRkJReXhEUVVGQkxFMUJRVTBzUTBGQlF5eEpRVUZTTEVOQlFXRTdVVUZCUXl4SlFVRkJMRVZCUVUwc1MwRkJTeXhEUVVGRExFbEJRVTRzUTBGQlFTeERRVUZRTzFGQlFYRkNMRkZCUVVFc1JVRkJWU3hSUVVFdlFqdFJRVUY1UXl4TlFVRkJMRVZCUVZFc1RVRkJha1E3VVVGQmVVUXNTMEZCUVN4RlFVRlBMRXRCUVdoRk8wOUJRV0k3VFVGRFFTeEpRVUZETEVOQlFVRXNVVUZCVVN4RFFVRkRMRWRCUVZZc1EwRkJZeXhKUVVGRExFTkJRVUVzVlVGQlppeEZRVUV5UWl4SlFVRkpMRU5CUVVNc1UwRkJUQ3hEUVVGbExFbEJRVU1zUTBGQlFTeE5RVUZvUWl4RFFVRXpRanRoUVVOQkxFbEJRVU1zUTBGQlFTeE5RVUZFTEVOQlFVRTdTVUZNVFRzN2IwUkJUMUlzWjBKQlFVRXNSMEZCYTBJc1UwRkJReXhWUVVGRUxFVkJRV0VzVDBGQllqdGhRVU5vUWl4SlFVRkRMRU5CUVVFc1RVRkJSQ3hEUVVGUkxFbEJRVU1zUTBGQlFTeFRRVUZVTEVWQlFYVkNMRlZCUVZVc1EwRkJReXhKUVVGYUxFZEJRV2xDTEV0QlFXcENMRWRCUVhOQ0xFOUJRVFZETEVWQlFYVkVMRlZCUVhaRU8wbEJSR2RDT3p0dlJFRkhiRUlzWVVGQlFTeEhRVUZsTEZOQlFVTXNWVUZCUkN4RlFVRmhMRTlCUVdJc1JVRkJjMElzVTBGQmRFSXNSVUZCYVVNc1RVRkJha003WVVGRFlpeEpRVUZETEVOQlFVRXNUVUZCUkN4RFFVRlJMRWxCUVVNc1EwRkJRU3hUUVVGVUxFVkJRWFZDTEZWQlFWVXNRMEZCUXl4SlFVRmFMRWRCUVdsQ0xFdEJRV3BDTEVkQlFYTkNMRTlCUVRWRExFVkJRWFZFTEZOQlFYWkVPMGxCUkdFN096czdPenRGUVVsWUxGRkJRVU1zUTBGQlFUdDVRMEZEVEN4VlFVRkJMRWRCUVZrN08wbEJSVU1zYjBOQlFVTXNWMEZCUkN4RlFVRmpMRTlCUVdRN08xRkJRV01zVlVGQlZTeFJRVUZSTEVOQlFVTTdPenM3VFVGRE5VTXNTVUZCUXl4RFFVRkJMRTFCUVVRc1IwRkJWVHROUVVOV0xFbEJRVU1zUTBGQlFTeFJRVUZFTEVkQlFWazdUVUZEV2l4SlFVRkRMRU5CUVVFc1RVRkJSQ3hIUVVGVkxFbEJRVWtzUTBGQlF5eExRVUZNTEVOQlFWY3NTVUZCUXl4RFFVRkJMRkZCUVZFc1EwRkJReXhIUVVGV0xFTkJRV01zU1VGQlF5eERRVUZCTEZWQlFXWXNRMEZCUVN4SlFVRTRRaXhKUVVGNlF6dE5RVU5XTEVsQlFVTXNRMEZCUVN4TlFVRkVMRU5CUVVFN1NVRktWenM3ZVVOQlRXSXNZVUZCUVN4SFFVRmxMRk5CUVVNc1MwRkJSRHRoUVVOaUxFTkJRVUVzVTBGQlFTeExRVUZCTzJWQlFVRXNVMEZCUXl4SFFVRkVMRVZCUVUwc1IwRkJUanRWUVVORkxFbEJRVlVzUjBGQlZqdEJRVUZCTEcxQ1FVRkJPenRWUVVOQkxFdEJRVXNzUTBGQlF5eE5RVUZPTEVOQlFXRXNTMEZCUXl4RFFVRkJMRTFCUVdRc1JVRkJjMElzVTBGQlF5eEZRVUZFTzIxQ1FVRlJMRVZCUVVVc1EwRkJReXhWUVVGVkxFTkJRVU1zVFVGQlpDeExRVUYzUWp0VlFVRm9ReXhEUVVGMFFqdHBRa0ZEUVN4TFFVRkRMRU5CUVVFc1VVRkJVU3hEUVVGRExFZEJRVllzUTBGQll5eExRVUZETEVOQlFVRXNWVUZCWml4RlFVRXlRaXhKUVVGSkxFTkJRVU1zVTBGQlRDeERRVUZsTEV0QlFVTXNRMEZCUVN4TlFVRm9RaXhEUVVFelFqdFJRVWhHTzAxQlFVRXNRMEZCUVN4RFFVRkJMRU5CUVVFc1NVRkJRVHRKUVVSaE96dDVRMEZOWml4TlFVRkJMRWRCUVZFc1UwRkJRVHRCUVVOT0xGVkJRVUU3UVVGQlFUdEJRVUZCTzFkQlFVRXNjVU5CUVVFN08xRkJRMFVzVVVGQlFTeEhRVUZYTEVsQlFVTXNRMEZCUVN4aFFVRkVMRU5CUVdVc1NVRkJTU3hEUVVGRExGVkJRVlVzUTBGQlF5eE5RVUV2UWp0eFFrRkRXQ3hKUVVGRExFTkJRVUVzVFVGQlRTeERRVUZETEZGQlFWSXNRMEZCYVVJc1NVRkJTU3hEUVVGRExHVkJRWFJDTEVWQlFYVkRMRXRCUVVzc1EwRkJReXhKUVVGT0xFTkJRVmNzU1VGQlNTeERRVUZETEZWQlFXaENMRVZCUVRSQ0xGRkJRVFZDTEVOQlFYWkRMRVZCUVRoRkxGRkJRVGxGTzBGQlJrWTdPMGxCUkUwN08zbERRVXRTTEZWQlFVRXNSMEZCV1N4VFFVRkRMRlZCUVVRc1JVRkJZU3hKUVVGaU8wMUJRMVlzU1VGQlFTeERRVUV5UWl4VlFVRlZMRU5CUVVNc1QwRkJkRU03UVVGQlFTeGxRVUZQTEV0QlFVc3NRMEZCUXl4SlFVRk9MRU5CUVVFc1JVRkJVRHM3VFVGRlFTeEpRVUZCTEVOQlFUSkNMRWxCUVVrc1EwRkJReXhOUVVGb1F6dEJRVUZCTEdWQlFVOHNTMEZCU3l4RFFVRkRMRWxCUVU0c1EwRkJRU3hGUVVGUU96dGhRVWRCTEV0QlFVc3NRMEZCUXl4SlFVRk9MRU5CUVdNc1NVRkJReXhEUVVGQkxGTkJRVVlzUjBGQldTeEhRVUZhTEVkQlFXVXNWVUZCVlN4RFFVRkRMRWxCUVRGQ0xFZEJRU3RDTEVkQlFTOUNMRWRCUVd0RExGVkJRVlVzUTBGQlF5eFBRVUV4UkR0SlFVNVZPenQ1UTBGUldpeE5RVUZCTEVkQlFWRXNVMEZCUXl4VlFVRkVMRVZCUVdFc1QwRkJZaXhGUVVGelFpeEpRVUYwUWp0TlFVTk9MRXRCUVVzc1EwRkJReXhIUVVGT0xFTkJRVlVzSzBKQlFVRXNSMEZCWjBNc1ZVRkJWU3hEUVVGRExFbEJRVE5ETEVkQlFXZEVMRWxCUVdoRUxFZEJRVzlFTEU5QlFYQkVMRWRCUVRSRUxFbEJRVFZFTEVkQlFXZEZMRXRCUVRGRk8wMUJRMEVzU1VGQmJVSXNTVUZCUXl4RFFVRkJMRTFCUVUwc1EwRkJReXhOUVVGU0xFZEJRV2xDTEVkQlFYQkRPMUZCUVVFc1NVRkJReXhEUVVGQkxFMUJRVTBzUTBGQlF5eExRVUZTTEVOQlFVRXNSVUZCUVRzN1RVRkRRU3hKUVVGRExFTkJRVUVzVFVGQlRTeERRVUZETEVsQlFWSXNRMEZEUlR0UlFVRkJMR1ZCUVVFc1JVRkJhVUlzVlVGQlZTeERRVUZETEVsQlFUVkNPMUZCUTBFc1ZVRkJRU3hGUVVORk8xVkJRVUVzVFVGQlFTeEZRVUZSTEV0QlFVc3NRMEZCUXl4SlFVRk9MRU5CUVVFc1EwRkJVanRWUVVOQkxFbEJRVUVzUlVGQlRTeEpRVUZETEVOQlFVRXNWVUZCUkN4RFFVRlpMRlZCUVZvc1JVRkJkMElzU1VGQmVFSXNRMEZFVGp0VlFVVkJMRTlCUVVFc1JVRkJVeXhQUVVaVU8xVkJSMEVzUzBGQlFTeEZRVUZQTEVsQlFVa3NRMEZCUXl4SlFVaGFPMU5CUmtZN1QwRkVSanROUVU5QkxFbEJRVU1zUTBGQlFTeFJRVUZSTEVOQlFVTXNSMEZCVml4RFFVRmpMRWxCUVVNc1EwRkJRU3hWUVVGbUxFVkJRVEpDTEVsQlFVa3NRMEZCUXl4VFFVRk1MRU5CUVdVc1NVRkJReXhEUVVGQkxFMUJRV2hDTEVOQlFUTkNPMkZCUTBFc1NVRkJReXhEUVVGQkxFMUJRVVFzUTBGQlFUdEpRVmhOT3p0NVEwRmhVaXhuUWtGQlFTeEhRVUZyUWl4VFFVRkRMRlZCUVVRc1JVRkJZU3hQUVVGaU8yRkJRMmhDTEVsQlFVTXNRMEZCUVN4TlFVRkVMRU5CUVZFc1ZVRkJVaXhGUVVGdlFpeFBRVUZ3UWl4RlFVRTJRanRSUVVGRExFbEJRVUVzUlVGQlRTeGhRVUZRTzFGQlFYTkNMRTFCUVVFc1JVRkJVU3hKUVVFNVFqdFBRVUUzUWp0SlFVUm5RanM3ZVVOQlIyeENMR0ZCUVVFc1IwRkJaU3hUUVVGRExGVkJRVVFzUlVGQllTeFBRVUZpTEVWQlFYTkNMRk5CUVhSQ0xFVkJRV2xETEV0QlFXcERPMkZCUTJJc1NVRkJReXhEUVVGQkxFMUJRVVFzUTBGQlVTeFZRVUZTTEVWQlFXOUNMRTlCUVhCQ0xFVkJRVFpDTEV0QlFVc3NRMEZCUXl4UlFVRk9MRU5CUVdVN1VVRkJReXhKUVVGQkxFVkJRVTBzVTBGQlVEdFBRVUZtTEVWQlFXdERMRXRCUVd4RExFTkJRVGRDTzBsQlJHRTdPenM3T3p0RlFVbFlMRkZCUVVNc1EwRkJRVHM3TzBsQlEwd3NLMEpCUVVNc1EwRkJRU3hUUVVGRUxFZEJRVms3TzBsQlJWb3NLMEpCUVVNc1EwRkJRU3hOUVVGRUxFZEJRVk1zVTBGQlF5eFJRVUZFTEVWQlFWY3NUVUZCV0N4RlFVRnRRaXhMUVVGdVFqdE5RVU5RTEV0QlFVc3NRMEZCUXl4SFFVRk9MRU5CUVZVc2IwTkJRVUVzUjBGQmNVTXNVVUZCY2tNc1IwRkJPRU1zU1VGQk9VTXNSMEZCYTBRc1RVRkJiRVFzUjBGQmVVUXNTVUZCZWtRc1IwRkJOa1FzUzBGQmRrVTdUVUZEUVN4SlFVRnZSeXhQUVVGUExFVkJRVkFzUzBGQlpTeFZRVUZ1U0R0QlFVRkJMR05CUVUwc1NVRkJTU3hMUVVGS0xFTkJRVlVzSzBWQlFWWXNSVUZCVGpzN1lVRkRRU3hGUVVGQkxFTkJRVWNzVFVGQlNDeEZRVUZYTEU5QlFWZ3NSVUZCYjBJc1VVRkJjRUlzUlVGQk9FSXNUVUZCT1VJc1JVRkJjME1zUzBGQmRFTXNSVUZCTmtNN1VVRkJReXhuUWtGQlFTeEZRVUZyUWl4RFFVRnVRanRQUVVFM1F6dEpRVWhQT3p0SlFVdFVMQ3RDUVVGRExFTkJRVUVzWjBKQlFVUXNSMEZCYlVJc1UwRkJReXhWUVVGRUxFVkJRV0VzVDBGQllqdGhRVU5xUWl3clFrRkJReXhEUVVGQkxFMUJRVVFzUTBGQlVTd3JRa0ZCUXl4RFFVRkJMRk5CUVZRc1JVRkJkVUlzVlVGQlZTeERRVUZETEVsQlFWb3NSMEZCYVVJc1MwRkJha0lzUjBGQmMwSXNUMEZCTlVNc1JVRkJkVVFzVlVGQmRrUTdTVUZFYVVJN08wbEJSMjVDTEN0Q1FVRkRMRU5CUVVFc1lVRkJSQ3hIUVVGblFpeFRRVUZETEZWQlFVUXNSVUZCWVN4UFFVRmlMRVZCUVhOQ0xGTkJRWFJDTEVWQlFXbERMRTFCUVdwRE8yRkJRMlFzSzBKQlFVTXNRMEZCUVN4TlFVRkVMRU5CUVZFc0swSkJRVU1zUTBGQlFTeFRRVUZVTEVWQlFYVkNMRlZCUVZVc1EwRkJReXhKUVVGYUxFZEJRV2xDTEV0QlFXcENMRWRCUVhOQ0xFOUJRVFZETEVWQlFYVkVMRk5CUVhaRU8wbEJSR003T3pzN096dEZRVWxhTEZGQlFVTXNRMEZCUVRzN08wbEJRMHdzYlVKQlFVTXNRMEZCUVN4VFFVRkVMRWRCUVZrN08wbEJRMW9zYlVKQlFVTXNRMEZCUVN4SFFVRkVMRWRCUVUwc1UwRkJReXhIUVVGRUxFVkJRVTBzUzBGQlRqdGhRVU5LTEVsQlFVa3NUMEZCU2l4RFFVRlpMRWxCUVVNc1EwRkJRU3hUUVVGaUxFTkJRWFZDTEVOQlFVTXNSMEZCZUVJc1EwRkJORUlzUjBGQk5VSXNSVUZCYVVNc1MwRkJha003U1VGRVNUczdTVUZGVGl4dFFrRkJReXhEUVVGQkxFZEJRVVFzUjBGQlRTeFRRVUZETEVkQlFVUTdZVUZEU2l4SlFVRkpMRTlCUVVvc1EwRkJXU3hKUVVGRExFTkJRVUVzVTBGQllpeERRVUYxUWl4RFFVRkRMRWRCUVhoQ0xFTkJRVFJDTEVkQlFUVkNPMGxCUkVrN096czdPenM3T3pzN1FVRkpWaXhOUVVGTkxFTkJRVU1zVDBGQlVDeEhRVUZwUWlKOVxuIiwidmFyIEFsZXBoQmV0LCBhZGFwdGVycywgb3B0aW9ucywgdXRpbHMsXG4gIGJpbmQgPSBmdW5jdGlvbihmbiwgbWUpeyByZXR1cm4gZnVuY3Rpb24oKXsgcmV0dXJuIGZuLmFwcGx5KG1lLCBhcmd1bWVudHMpOyB9OyB9O1xuXG51dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxuYWRhcHRlcnMgPSByZXF1aXJlKCcuL2FkYXB0ZXJzJyk7XG5cbm9wdGlvbnMgPSByZXF1aXJlKCcuL29wdGlvbnMnKTtcblxuQWxlcGhCZXQgPSAoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIEFsZXBoQmV0KCkge31cblxuICBBbGVwaEJldC5vcHRpb25zID0gb3B0aW9ucztcblxuICBBbGVwaEJldC51dGlscyA9IHV0aWxzO1xuXG4gIEFsZXBoQmV0LkdpbWVsQWRhcHRlciA9IGFkYXB0ZXJzLkdpbWVsQWRhcHRlcjtcblxuICBBbGVwaEJldC5QZXJzaXN0ZW50UXVldWVHb29nbGVBbmFseXRpY3NBZGFwdGVyID0gYWRhcHRlcnMuUGVyc2lzdGVudFF1ZXVlR29vZ2xlQW5hbHl0aWNzQWRhcHRlcjtcblxuICBBbGVwaEJldC5QZXJzaXN0ZW50UXVldWVLZWVuQWRhcHRlciA9IGFkYXB0ZXJzLlBlcnNpc3RlbnRRdWV1ZUtlZW5BZGFwdGVyO1xuXG4gIEFsZXBoQmV0LkV4cGVyaW1lbnQgPSAoZnVuY3Rpb24oKSB7XG4gICAgdmFyIF9ydW4sIF92YWxpZGF0ZTtcblxuICAgIEV4cGVyaW1lbnQuX29wdGlvbnMgPSB7XG4gICAgICBuYW1lOiBudWxsLFxuICAgICAgdmFyaWFudHM6IG51bGwsXG4gICAgICB1c2VyX2lkOiBudWxsLFxuICAgICAgc2FtcGxlOiAxLjAsXG4gICAgICB0cmlnZ2VyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9LFxuICAgICAgdHJhY2tpbmdfYWRhcHRlcjogYWRhcHRlcnMuR29vZ2xlVW5pdmVyc2FsQW5hbHl0aWNzQWRhcHRlcixcbiAgICAgIHN0b3JhZ2VfYWRhcHRlcjogYWRhcHRlcnMuTG9jYWxTdG9yYWdlQWRhcHRlclxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBFeHBlcmltZW50KG9wdGlvbnMxKSB7XG4gICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zMSAhPSBudWxsID8gb3B0aW9uczEgOiB7fTtcbiAgICAgIHRoaXMuYWRkX2dvYWxzID0gYmluZCh0aGlzLmFkZF9nb2FscywgdGhpcyk7XG4gICAgICB0aGlzLmFkZF9nb2FsID0gYmluZCh0aGlzLmFkZF9nb2FsLCB0aGlzKTtcbiAgICAgIHV0aWxzLmRlZmF1bHRzKHRoaXMub3B0aW9ucywgRXhwZXJpbWVudC5fb3B0aW9ucyk7XG4gICAgICBfdmFsaWRhdGUuY2FsbCh0aGlzKTtcbiAgICAgIHRoaXMubmFtZSA9IHRoaXMub3B0aW9ucy5uYW1lO1xuICAgICAgdGhpcy52YXJpYW50cyA9IHRoaXMub3B0aW9ucy52YXJpYW50cztcbiAgICAgIHRoaXMudXNlcl9pZCA9IHRoaXMub3B0aW9ucy51c2VyX2lkO1xuICAgICAgdGhpcy52YXJpYW50X25hbWVzID0gdXRpbHMua2V5cyh0aGlzLnZhcmlhbnRzKTtcbiAgICAgIF9ydW4uY2FsbCh0aGlzKTtcbiAgICB9XG5cbiAgICBFeHBlcmltZW50LnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB2YXJpYW50O1xuICAgICAgdXRpbHMubG9nKFwicnVubmluZyB3aXRoIG9wdGlvbnM6IFwiICsgKEpTT04uc3RyaW5naWZ5KHRoaXMub3B0aW9ucykpKTtcbiAgICAgIGlmICh2YXJpYW50ID0gdGhpcy5nZXRfc3RvcmVkX3ZhcmlhbnQoKSkge1xuICAgICAgICB1dGlscy5sb2codmFyaWFudCArIFwiIGFjdGl2ZVwiKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWN0aXZhdGVfdmFyaWFudCh2YXJpYW50KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmRpdGlvbmFsbHlfYWN0aXZhdGVfdmFyaWFudCgpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBfcnVuID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5ydW4oKTtcbiAgICB9O1xuXG4gICAgRXhwZXJpbWVudC5wcm90b3R5cGUuYWN0aXZhdGVfdmFyaWFudCA9IGZ1bmN0aW9uKHZhcmlhbnQpIHtcbiAgICAgIHZhciByZWY7XG4gICAgICBpZiAoKHJlZiA9IHRoaXMudmFyaWFudHNbdmFyaWFudF0pICE9IG51bGwpIHtcbiAgICAgICAgcmVmLmFjdGl2YXRlKHRoaXMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuc3RvcmFnZSgpLnNldCh0aGlzLm9wdGlvbnMubmFtZSArIFwiOnZhcmlhbnRcIiwgdmFyaWFudCk7XG4gICAgfTtcblxuICAgIEV4cGVyaW1lbnQucHJvdG90eXBlLmNvbmRpdGlvbmFsbHlfYWN0aXZhdGVfdmFyaWFudCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHZhcmlhbnQ7XG4gICAgICBpZiAoIXRoaXMub3B0aW9ucy50cmlnZ2VyKCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdXRpbHMubG9nKCd0cmlnZ2VyIHNldCcpO1xuICAgICAgaWYgKCF0aGlzLmluX3NhbXBsZSgpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHV0aWxzLmxvZygnaW4gc2FtcGxlJyk7XG4gICAgICB2YXJpYW50ID0gdGhpcy5waWNrX3ZhcmlhbnQoKTtcbiAgICAgIHRoaXMudHJhY2tpbmcoKS5leHBlcmltZW50X3N0YXJ0KHRoaXMsIHZhcmlhbnQpO1xuICAgICAgcmV0dXJuIHRoaXMuYWN0aXZhdGVfdmFyaWFudCh2YXJpYW50KTtcbiAgICB9O1xuXG4gICAgRXhwZXJpbWVudC5wcm90b3R5cGUuZ29hbF9jb21wbGV0ZSA9IGZ1bmN0aW9uKGdvYWxfbmFtZSwgcHJvcHMpIHtcbiAgICAgIHZhciB2YXJpYW50O1xuICAgICAgaWYgKHByb3BzID09IG51bGwpIHtcbiAgICAgICAgcHJvcHMgPSB7fTtcbiAgICAgIH1cbiAgICAgIHV0aWxzLmRlZmF1bHRzKHByb3BzLCB7XG4gICAgICAgIHVuaXF1ZTogdHJ1ZVxuICAgICAgfSk7XG4gICAgICBpZiAocHJvcHMudW5pcXVlICYmIHRoaXMuc3RvcmFnZSgpLmdldCh0aGlzLm9wdGlvbnMubmFtZSArIFwiOlwiICsgZ29hbF9uYW1lKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB2YXJpYW50ID0gdGhpcy5nZXRfc3RvcmVkX3ZhcmlhbnQoKTtcbiAgICAgIGlmICghdmFyaWFudCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAocHJvcHMudW5pcXVlKSB7XG4gICAgICAgIHRoaXMuc3RvcmFnZSgpLnNldCh0aGlzLm9wdGlvbnMubmFtZSArIFwiOlwiICsgZ29hbF9uYW1lLCB0cnVlKTtcbiAgICAgIH1cbiAgICAgIHV0aWxzLmxvZyhcImV4cGVyaW1lbnQ6IFwiICsgdGhpcy5vcHRpb25zLm5hbWUgKyBcIiB2YXJpYW50OlwiICsgdmFyaWFudCArIFwiIGdvYWw6XCIgKyBnb2FsX25hbWUgKyBcIiBjb21wbGV0ZVwiKTtcbiAgICAgIHJldHVybiB0aGlzLnRyYWNraW5nKCkuZ29hbF9jb21wbGV0ZSh0aGlzLCB2YXJpYW50LCBnb2FsX25hbWUsIHByb3BzKTtcbiAgICB9O1xuXG4gICAgRXhwZXJpbWVudC5wcm90b3R5cGUuZ2V0X3N0b3JlZF92YXJpYW50ID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5zdG9yYWdlKCkuZ2V0KHRoaXMub3B0aW9ucy5uYW1lICsgXCI6dmFyaWFudFwiKTtcbiAgICB9O1xuXG4gICAgRXhwZXJpbWVudC5wcm90b3R5cGUucGlja192YXJpYW50ID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYWxsX3ZhcmlhbnRzX2hhdmVfd2VpZ2h0cztcbiAgICAgIGFsbF92YXJpYW50c19oYXZlX3dlaWdodHMgPSB1dGlscy5jaGVja193ZWlnaHRzKHRoaXMudmFyaWFudHMpO1xuICAgICAgdXRpbHMubG9nKFwiYWxsIHZhcmlhbnRzIGhhdmUgd2VpZ2h0czogXCIgKyBhbGxfdmFyaWFudHNfaGF2ZV93ZWlnaHRzKTtcbiAgICAgIGlmIChhbGxfdmFyaWFudHNfaGF2ZV93ZWlnaHRzKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBpY2tfd2VpZ2h0ZWRfdmFyaWFudCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGlja191bndlaWdodGVkX3ZhcmlhbnQoKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgRXhwZXJpbWVudC5wcm90b3R5cGUucGlja193ZWlnaHRlZF92YXJpYW50ID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIga2V5LCByZWYsIHZhbHVlLCB3ZWlnaHRlZF9pbmRleCwgd2VpZ2h0c19zdW07XG4gICAgICB3ZWlnaHRzX3N1bSA9IHV0aWxzLnN1bV93ZWlnaHRzKHRoaXMudmFyaWFudHMpO1xuICAgICAgd2VpZ2h0ZWRfaW5kZXggPSBNYXRoLmNlaWwodGhpcy5fcmFuZG9tKCd2YXJpYW50JykgKiB3ZWlnaHRzX3N1bSk7XG4gICAgICByZWYgPSB0aGlzLnZhcmlhbnRzO1xuICAgICAgZm9yIChrZXkgaW4gcmVmKSB7XG4gICAgICAgIHZhbHVlID0gcmVmW2tleV07XG4gICAgICAgIHdlaWdodGVkX2luZGV4IC09IHZhbHVlLndlaWdodDtcbiAgICAgICAgaWYgKHdlaWdodGVkX2luZGV4IDw9IDApIHtcbiAgICAgICAgICByZXR1cm4ga2V5O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIEV4cGVyaW1lbnQucHJvdG90eXBlLnBpY2tfdW53ZWlnaHRlZF92YXJpYW50ID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY2hvc2VuX3BhcnRpdGlvbiwgcGFydGl0aW9ucywgdmFyaWFudDtcbiAgICAgIHBhcnRpdGlvbnMgPSAxLjAgLyB0aGlzLnZhcmlhbnRfbmFtZXMubGVuZ3RoO1xuICAgICAgY2hvc2VuX3BhcnRpdGlvbiA9IE1hdGguZmxvb3IodGhpcy5fcmFuZG9tKCd2YXJpYW50JykgLyBwYXJ0aXRpb25zKTtcbiAgICAgIHZhcmlhbnQgPSB0aGlzLnZhcmlhbnRfbmFtZXNbY2hvc2VuX3BhcnRpdGlvbl07XG4gICAgICB1dGlscy5sb2codmFyaWFudCArIFwiIHBpY2tlZFwiKTtcbiAgICAgIHJldHVybiB2YXJpYW50O1xuICAgIH07XG5cbiAgICBFeHBlcmltZW50LnByb3RvdHlwZS5pbl9zYW1wbGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBhY3RpdmU7XG4gICAgICBhY3RpdmUgPSB0aGlzLnN0b3JhZ2UoKS5nZXQodGhpcy5vcHRpb25zLm5hbWUgKyBcIjppbl9zYW1wbGVcIik7XG4gICAgICBpZiAodHlwZW9mIGFjdGl2ZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuIGFjdGl2ZTtcbiAgICAgIH1cbiAgICAgIGFjdGl2ZSA9IHRoaXMuX3JhbmRvbSgnc2FtcGxlJykgPD0gdGhpcy5vcHRpb25zLnNhbXBsZTtcbiAgICAgIHRoaXMuc3RvcmFnZSgpLnNldCh0aGlzLm9wdGlvbnMubmFtZSArIFwiOmluX3NhbXBsZVwiLCBhY3RpdmUpO1xuICAgICAgcmV0dXJuIGFjdGl2ZTtcbiAgICB9O1xuXG4gICAgRXhwZXJpbWVudC5wcm90b3R5cGUuX3JhbmRvbSA9IGZ1bmN0aW9uKHNhbHQpIHtcbiAgICAgIHZhciBzZWVkO1xuICAgICAgaWYgKCF0aGlzLnVzZXJfaWQpIHtcbiAgICAgICAgcmV0dXJuIHV0aWxzLnJhbmRvbSgpO1xuICAgICAgfVxuICAgICAgc2VlZCA9IHRoaXMubmFtZSArIFwiLlwiICsgc2FsdCArIFwiLlwiICsgdGhpcy51c2VyX2lkO1xuICAgICAgcmV0dXJuIHV0aWxzLnJhbmRvbShzZWVkKTtcbiAgICB9O1xuXG4gICAgRXhwZXJpbWVudC5wcm90b3R5cGUuYWRkX2dvYWwgPSBmdW5jdGlvbihnb2FsKSB7XG4gICAgICByZXR1cm4gZ29hbC5hZGRfZXhwZXJpbWVudCh0aGlzKTtcbiAgICB9O1xuXG4gICAgRXhwZXJpbWVudC5wcm90b3R5cGUuYWRkX2dvYWxzID0gZnVuY3Rpb24oZ29hbHMpIHtcbiAgICAgIHZhciBnb2FsLCBpLCBsZW4sIHJlc3VsdHM7XG4gICAgICByZXN1bHRzID0gW107XG4gICAgICBmb3IgKGkgPSAwLCBsZW4gPSBnb2Fscy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBnb2FsID0gZ29hbHNbaV07XG4gICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLmFkZF9nb2FsKGdvYWwpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH07XG5cbiAgICBFeHBlcmltZW50LnByb3RvdHlwZS5zdG9yYWdlID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5vcHRpb25zLnN0b3JhZ2VfYWRhcHRlcjtcbiAgICB9O1xuXG4gICAgRXhwZXJpbWVudC5wcm90b3R5cGUudHJhY2tpbmcgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMudHJhY2tpbmdfYWRhcHRlcjtcbiAgICB9O1xuXG4gICAgX3ZhbGlkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYWxsX3ZhcmlhbnRzX2hhdmVfd2VpZ2h0cztcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMubmFtZSA9PT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2FuIGV4cGVyaW1lbnQgbmFtZSBtdXN0IGJlIHNwZWNpZmllZCcpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMub3B0aW9ucy52YXJpYW50cyA9PT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3ZhcmlhbnRzIG11c3QgYmUgcHJvdmlkZWQnKTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLnRyaWdnZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd0cmlnZ2VyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICAgICAgfVxuICAgICAgYWxsX3ZhcmlhbnRzX2hhdmVfd2VpZ2h0cyA9IHV0aWxzLnZhbGlkYXRlX3dlaWdodHModGhpcy5vcHRpb25zLnZhcmlhbnRzKTtcbiAgICAgIGlmICghYWxsX3ZhcmlhbnRzX2hhdmVfd2VpZ2h0cykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ25vdCBhbGwgdmFyaWFudHMgaGF2ZSB3ZWlnaHRzJyk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBFeHBlcmltZW50O1xuXG4gIH0pKCk7XG5cbiAgQWxlcGhCZXQuR29hbCA9IChmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBHb2FsKG5hbWUsIHByb3BzMSkge1xuICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgIHRoaXMucHJvcHMgPSBwcm9wczEgIT0gbnVsbCA/IHByb3BzMSA6IHt9O1xuICAgICAgdXRpbHMuZGVmYXVsdHModGhpcy5wcm9wcywge1xuICAgICAgICB1bmlxdWU6IHRydWVcbiAgICAgIH0pO1xuICAgICAgdGhpcy5leHBlcmltZW50cyA9IFtdO1xuICAgIH1cblxuICAgIEdvYWwucHJvdG90eXBlLmFkZF9leHBlcmltZW50ID0gZnVuY3Rpb24oZXhwZXJpbWVudCkge1xuICAgICAgcmV0dXJuIHRoaXMuZXhwZXJpbWVudHMucHVzaChleHBlcmltZW50KTtcbiAgICB9O1xuXG4gICAgR29hbC5wcm90b3R5cGUuYWRkX2V4cGVyaW1lbnRzID0gZnVuY3Rpb24oZXhwZXJpbWVudHMpIHtcbiAgICAgIHZhciBleHBlcmltZW50LCBpLCBsZW4sIHJlc3VsdHM7XG4gICAgICByZXN1bHRzID0gW107XG4gICAgICBmb3IgKGkgPSAwLCBsZW4gPSBleHBlcmltZW50cy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBleHBlcmltZW50ID0gZXhwZXJpbWVudHNbaV07XG4gICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLmFkZF9leHBlcmltZW50KGV4cGVyaW1lbnQpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH07XG5cbiAgICBHb2FsLnByb3RvdHlwZS5jb21wbGV0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGV4cGVyaW1lbnQsIGksIGxlbiwgcmVmLCByZXN1bHRzO1xuICAgICAgcmVmID0gdGhpcy5leHBlcmltZW50cztcbiAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoaSA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBleHBlcmltZW50ID0gcmVmW2ldO1xuICAgICAgICByZXN1bHRzLnB1c2goZXhwZXJpbWVudC5nb2FsX2NvbXBsZXRlKHRoaXMubmFtZSwgdGhpcy5wcm9wcykpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfTtcblxuICAgIHJldHVybiBHb2FsO1xuXG4gIH0pKCk7XG5cbiAgcmV0dXJuIEFsZXBoQmV0O1xuXG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFsZXBoQmV0O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lMMmh2YldVdmVXOWhkaTlqYjJSbEwyRnNaWEJvWW1WMEwzTnlZeTloYkdWd2FHSmxkQzVqYjJabVpXVWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUl2YUc5dFpTOTViMkYyTDJOdlpHVXZZV3hsY0doaVpYUXZjM0pqTDJGc1pYQm9ZbVYwTG1OdlptWmxaU0pkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZCUVN4SlFVRkJMR3REUVVGQk8wVkJRVUU3TzBGQlFVRXNTMEZCUVN4SFFVRlJMRTlCUVVFc1EwRkJVU3hUUVVGU096dEJRVU5TTEZGQlFVRXNSMEZCVnl4UFFVRkJMRU5CUVZFc1dVRkJVanM3UVVGRFdDeFBRVUZCTEVkQlFWVXNUMEZCUVN4RFFVRlJMRmRCUVZJN08wRkJSVW83T3p0RlFVTktMRkZCUVVNc1EwRkJRU3hQUVVGRUxFZEJRVmM3TzBWQlExZ3NVVUZCUXl4RFFVRkJMRXRCUVVRc1IwRkJVenM3UlVGRlZDeFJRVUZETEVOQlFVRXNXVUZCUkN4SFFVRm5RaXhSUVVGUkxFTkJRVU03TzBWQlEzcENMRkZCUVVNc1EwRkJRU3h4UTBGQlJDeEhRVUY1UXl4UlFVRlJMRU5CUVVNN08wVkJRMnhFTEZGQlFVTXNRMEZCUVN3d1FrRkJSQ3hIUVVFNFFpeFJRVUZSTEVOQlFVTTdPMFZCUldwRExGRkJRVU1zUTBGQlFUdEJRVU5NTEZGQlFVRTdPMGxCUVVFc1ZVRkJReXhEUVVGQkxGRkJRVVFzUjBGRFJUdE5RVUZCTEVsQlFVRXNSVUZCVFN4SlFVRk9PMDFCUTBFc1VVRkJRU3hGUVVGVkxFbEJSRlk3VFVGRlFTeFBRVUZCTEVWQlFWTXNTVUZHVkR0TlFVZEJMRTFCUVVFc1JVRkJVU3hIUVVoU08wMUJTVUVzVDBGQlFTeEZRVUZUTEZOQlFVRTdaVUZCUnp0TlFVRklMRU5CU2xRN1RVRkxRU3huUWtGQlFTeEZRVUZyUWl4UlFVRlJMRU5CUVVNc0swSkJURE5DTzAxQlRVRXNaVUZCUVN4RlFVRnBRaXhSUVVGUkxFTkJRVU1zYlVKQlRqRkNPenM3U1VGUlZ5eHZRa0ZCUXl4UlFVRkVPMDFCUVVNc1NVRkJReXhEUVVGQkxEWkNRVUZFTEZkQlFWTTdPenROUVVOeVFpeExRVUZMTEVOQlFVTXNVVUZCVGl4RFFVRmxMRWxCUVVNc1EwRkJRU3hQUVVGb1FpeEZRVUY1UWl4VlFVRlZMRU5CUVVNc1VVRkJjRU03VFVGRFFTeFRRVUZUTEVOQlFVTXNTVUZCVml4RFFVRmxMRWxCUVdZN1RVRkRRU3hKUVVGRExFTkJRVUVzU1VGQlJDeEhRVUZSTEVsQlFVTXNRMEZCUVN4UFFVRlBMRU5CUVVNN1RVRkRha0lzU1VGQlF5eERRVUZCTEZGQlFVUXNSMEZCV1N4SlFVRkRMRU5CUVVFc1QwRkJUeXhEUVVGRE8wMUJRM0pDTEVsQlFVTXNRMEZCUVN4UFFVRkVMRWRCUVZjc1NVRkJReXhEUVVGQkxFOUJRVThzUTBGQlF6dE5RVU53UWl4SlFVRkRMRU5CUVVFc1lVRkJSQ3hIUVVGcFFpeExRVUZMTEVOQlFVTXNTVUZCVGl4RFFVRlhMRWxCUVVNc1EwRkJRU3hSUVVGYU8wMUJRMnBDTEVsQlFVa3NRMEZCUXl4SlFVRk1MRU5CUVZVc1NVRkJWanRKUVZCWE96dDVRa0ZUWWl4SFFVRkJMRWRCUVVzc1UwRkJRVHRCUVVOSUxGVkJRVUU3VFVGQlFTeExRVUZMTEVOQlFVTXNSMEZCVGl4RFFVRlZMSGRDUVVGQkxFZEJRWGRDTEVOQlFVTXNTVUZCU1N4RFFVRkRMRk5CUVV3c1EwRkJaU3hKUVVGRExFTkJRVUVzVDBGQmFFSXNRMEZCUkN4RFFVRnNRenROUVVOQkxFbEJRVWNzVDBGQlFTeEhRVUZWTEVsQlFVTXNRMEZCUVN4clFrRkJSQ3hEUVVGQkxFTkJRV0k3VVVGRlJTeExRVUZMTEVOQlFVTXNSMEZCVGl4RFFVRmhMRTlCUVVRc1IwRkJVeXhUUVVGeVFqdGxRVU5CTEVsQlFVTXNRMEZCUVN4blFrRkJSQ3hEUVVGclFpeFBRVUZzUWl4RlFVaEdPMDlCUVVFc1RVRkJRVHRsUVV0RkxFbEJRVU1zUTBGQlFTdzRRa0ZCUkN4RFFVRkJMRVZCVEVZN08wbEJSa2M3TzBsQlUwd3NTVUZCUVN4SFFVRlBMRk5CUVVFN1lVRkJSeXhKUVVGRExFTkJRVUVzUjBGQlJDeERRVUZCTzBsQlFVZzdPM2xDUVVWUUxHZENRVUZCTEVkQlFXdENMRk5CUVVNc1QwRkJSRHRCUVVOb1FpeFZRVUZCT3p0WFFVRnJRaXhEUVVGRkxGRkJRWEJDTEVOQlFUWkNMRWxCUVRkQ096dGhRVU5CTEVsQlFVTXNRMEZCUVN4UFFVRkVMRU5CUVVFc1EwRkJWU3hEUVVGRExFZEJRVmdzUTBGQmEwSXNTVUZCUXl4RFFVRkJMRTlCUVU4c1EwRkJReXhKUVVGV0xFZEJRV1VzVlVGQmFFTXNSVUZCTWtNc1QwRkJNME03U1VGR1owSTdPM2xDUVV0c1FpdzRRa0ZCUVN4SFFVRm5ReXhUUVVGQk8wRkJRemxDTEZWQlFVRTdUVUZCUVN4SlFVRkJMRU5CUVdNc1NVRkJReXhEUVVGQkxFOUJRVThzUTBGQlF5eFBRVUZVTEVOQlFVRXNRMEZCWkR0QlFVRkJMR1ZCUVVFN08wMUJRMEVzUzBGQlN5eERRVUZETEVkQlFVNHNRMEZCVlN4aFFVRldPMDFCUTBFc1NVRkJRU3hEUVVGakxFbEJRVU1zUTBGQlFTeFRRVUZFTEVOQlFVRXNRMEZCWkR0QlFVRkJMR1ZCUVVFN08wMUJRMEVzUzBGQlN5eERRVUZETEVkQlFVNHNRMEZCVlN4WFFVRldPMDFCUTBFc1QwRkJRU3hIUVVGVkxFbEJRVU1zUTBGQlFTeFpRVUZFTEVOQlFVRTdUVUZEVml4SlFVRkRMRU5CUVVFc1VVRkJSQ3hEUVVGQkxFTkJRVmNzUTBGQlF5eG5Ra0ZCV2l4RFFVRTJRaXhKUVVFM1FpeEZRVUZ0UXl4UFFVRnVRenRoUVVOQkxFbEJRVU1zUTBGQlFTeG5Ra0ZCUkN4RFFVRnJRaXhQUVVGc1FqdEpRVkE0UWpzN2VVSkJVMmhETEdGQlFVRXNSMEZCWlN4VFFVRkRMRk5CUVVRc1JVRkJXU3hMUVVGYU8wRkJRMklzVlVGQlFUczdVVUZFZVVJc1VVRkJUVHM3VFVGREwwSXNTMEZCU3l4RFFVRkRMRkZCUVU0c1EwRkJaU3hMUVVGbUxFVkJRWE5DTzFGQlFVTXNUVUZCUVN4RlFVRlJMRWxCUVZRN1QwRkJkRUk3VFVGRFFTeEpRVUZWTEV0QlFVc3NRMEZCUXl4TlFVRk9MRWxCUVdkQ0xFbEJRVU1zUTBGQlFTeFBRVUZFTEVOQlFVRXNRMEZCVlN4RFFVRkRMRWRCUVZnc1EwRkJhMElzU1VGQlF5eERRVUZCTEU5QlFVOHNRMEZCUXl4SlFVRldMRWRCUVdVc1IwRkJaaXhIUVVGclFpeFRRVUZ1UXl4RFFVRXhRanRCUVVGQkxHVkJRVUU3TzAxQlEwRXNUMEZCUVN4SFFVRlZMRWxCUVVNc1EwRkJRU3hyUWtGQlJDeERRVUZCTzAxQlExWXNTVUZCUVN4RFFVRmpMRTlCUVdRN1FVRkJRU3hsUVVGQk96dE5RVU5CTEVsQlFYbEVMRXRCUVVzc1EwRkJReXhOUVVFdlJEdFJRVUZCTEVsQlFVTXNRMEZCUVN4UFFVRkVMRU5CUVVFc1EwRkJWU3hEUVVGRExFZEJRVmdzUTBGQmEwSXNTVUZCUXl4RFFVRkJMRTlCUVU4c1EwRkJReXhKUVVGV0xFZEJRV1VzUjBGQlppeEhRVUZyUWl4VFFVRnVReXhGUVVGblJDeEpRVUZvUkN4RlFVRkJPenROUVVOQkxFdEJRVXNzUTBGQlF5eEhRVUZPTEVOQlFWVXNZMEZCUVN4SFFVRmxMRWxCUVVNc1EwRkJRU3hQUVVGUExFTkJRVU1zU1VGQmVFSXNSMEZCTmtJc1YwRkJOMElzUjBGQmQwTXNUMEZCZUVNc1IwRkJaMFFzVVVGQmFFUXNSMEZCZDBRc1UwRkJlRVFzUjBGQmEwVXNWMEZCTlVVN1lVRkRRU3hKUVVGRExFTkJRVUVzVVVGQlJDeERRVUZCTEVOQlFWY3NRMEZCUXl4aFFVRmFMRU5CUVRCQ0xFbEJRVEZDTEVWQlFXZERMRTlCUVdoRExFVkJRWGxETEZOQlFYcERMRVZCUVc5RUxFdEJRWEJFTzBsQlVHRTdPM2xDUVZObUxHdENRVUZCTEVkQlFXOUNMRk5CUVVFN1lVRkRiRUlzU1VGQlF5eERRVUZCTEU5QlFVUXNRMEZCUVN4RFFVRlZMRU5CUVVNc1IwRkJXQ3hEUVVGclFpeEpRVUZETEVOQlFVRXNUMEZCVHl4RFFVRkRMRWxCUVZZc1IwRkJaU3hWUVVGb1F6dEpRVVJyUWpzN2VVSkJSM0JDTEZsQlFVRXNSMEZCWXl4VFFVRkJPMEZCUTFvc1ZVRkJRVHROUVVGQkxIbENRVUZCTEVkQlFUUkNMRXRCUVVzc1EwRkJReXhoUVVGT0xFTkJRVzlDTEVsQlFVTXNRMEZCUVN4UlFVRnlRanROUVVNMVFpeExRVUZMTEVOQlFVTXNSMEZCVGl4RFFVRlZMRFpDUVVGQkxFZEJRVGhDTEhsQ1FVRjRRenROUVVOQkxFbEJRVWNzZVVKQlFVZzdaVUZCYTBNc1NVRkJReXhEUVVGQkxIRkNRVUZFTEVOQlFVRXNSVUZCYkVNN1QwRkJRU3hOUVVGQk8yVkJRV2RGTEVsQlFVTXNRMEZCUVN4MVFrRkJSQ3hEUVVGQkxFVkJRV2hGT3p0SlFVaFpPenQ1UWtGTFpDeHhRa0ZCUVN4SFFVRjFRaXhUUVVGQk8wRkJWM0pDTEZWQlFVRTdUVUZCUVN4WFFVRkJMRWRCUVdNc1MwRkJTeXhEUVVGRExGZEJRVTRzUTBGQmEwSXNTVUZCUXl4RFFVRkJMRkZCUVc1Q08wMUJRMlFzWTBGQlFTeEhRVUZwUWl4SlFVRkpMRU5CUVVNc1NVRkJUQ3hEUVVGWExFbEJRVU1zUTBGQlFTeFBRVUZFTEVOQlFWTXNVMEZCVkN4RFFVRkJMRWRCUVhOQ0xGZEJRV3BETzBGQlEycENPMEZCUVVFc1YwRkJRU3hWUVVGQk96dFJRVWRGTEdOQlFVRXNTVUZCYTBJc1MwRkJTeXhEUVVGRE8xRkJRM2hDTEVsQlFXTXNZMEZCUVN4SlFVRnJRaXhEUVVGb1F6dEJRVUZCTEdsQ1FVRlBMRWxCUVZBN08wRkJTa1k3U1VGaWNVSTdPM2xDUVcxQ2RrSXNkVUpCUVVFc1IwRkJlVUlzVTBGQlFUdEJRVU4yUWl4VlFVRkJPMDFCUVVFc1ZVRkJRU3hIUVVGaExFZEJRVUVzUjBGQlRTeEpRVUZETEVOQlFVRXNZVUZCWVN4RFFVRkRPMDFCUTJ4RExHZENRVUZCTEVkQlFXMUNMRWxCUVVrc1EwRkJReXhMUVVGTUxFTkJRVmNzU1VGQlF5eERRVUZCTEU5QlFVUXNRMEZCVXl4VFFVRlVMRU5CUVVFc1IwRkJjMElzVlVGQmFrTTdUVUZEYmtJc1QwRkJRU3hIUVVGVkxFbEJRVU1zUTBGQlFTeGhRVUZqTEVOQlFVRXNaMEpCUVVFN1RVRkRla0lzUzBGQlN5eERRVUZETEVkQlFVNHNRMEZCWVN4UFFVRkVMRWRCUVZNc1UwRkJja0k3WVVGRFFUdEpRVXgxUWpzN2VVSkJUM3BDTEZOQlFVRXNSMEZCVnl4VFFVRkJPMEZCUTFRc1ZVRkJRVHROUVVGQkxFMUJRVUVzUjBGQlV5eEpRVUZETEVOQlFVRXNUMEZCUkN4RFFVRkJMRU5CUVZVc1EwRkJReXhIUVVGWUxFTkJRV3RDTEVsQlFVTXNRMEZCUVN4UFFVRlBMRU5CUVVNc1NVRkJWaXhIUVVGbExGbEJRV2hETzAxQlExUXNTVUZCY1VJc1QwRkJUeXhOUVVGUUxFdEJRV2xDTEZkQlFYUkRPMEZCUVVFc1pVRkJUeXhQUVVGUU96dE5RVU5CTEUxQlFVRXNSMEZCVXl4SlFVRkRMRU5CUVVFc1QwRkJSQ3hEUVVGVExGRkJRVlFzUTBGQlFTeEpRVUZ6UWl4SlFVRkRMRU5CUVVFc1QwRkJUeXhEUVVGRE8wMUJRM2hETEVsQlFVTXNRMEZCUVN4UFFVRkVMRU5CUVVFc1EwRkJWU3hEUVVGRExFZEJRVmdzUTBGQmEwSXNTVUZCUXl4RFFVRkJMRTlCUVU4c1EwRkJReXhKUVVGV0xFZEJRV1VzV1VGQmFFTXNSVUZCTmtNc1RVRkJOME03WVVGRFFUdEpRVXhUT3p0NVFrRlBXQ3hQUVVGQkxFZEJRVk1zVTBGQlF5eEpRVUZFTzBGQlExQXNWVUZCUVR0TlFVRkJMRWxCUVVFc1EwRkJOa0lzU1VGQlF5eERRVUZCTEU5QlFUbENPMEZCUVVFc1pVRkJUeXhMUVVGTExFTkJRVU1zVFVGQlRpeERRVUZCTEVWQlFWQTdPMDFCUTBFc1NVRkJRU3hIUVVGVkxFbEJRVU1zUTBGQlFTeEpRVUZHTEVkQlFVOHNSMEZCVUN4SFFVRlZMRWxCUVZZc1IwRkJaU3hIUVVGbUxFZEJRV3RDTEVsQlFVTXNRMEZCUVR0aFFVTTFRaXhMUVVGTExFTkJRVU1zVFVGQlRpeERRVUZoTEVsQlFXSTdTVUZJVHpzN2VVSkJTMVFzVVVGQlFTeEhRVUZWTEZOQlFVTXNTVUZCUkR0aFFVTlNMRWxCUVVrc1EwRkJReXhqUVVGTUxFTkJRVzlDTEVsQlFYQkNPMGxCUkZFN08zbENRVWRXTEZOQlFVRXNSMEZCVnl4VFFVRkRMRXRCUVVRN1FVRkRWQ3hWUVVGQk8wRkJRVUU3VjBGQlFTeDFRMEZCUVRzN2NVSkJRVUVzU1VGQlF5eERRVUZCTEZGQlFVUXNRMEZCVlN4SlFVRldPMEZCUVVFN08wbEJSRk03TzNsQ1FVZFlMRTlCUVVFc1IwRkJVeXhUUVVGQk8yRkJRVWNzU1VGQlF5eERRVUZCTEU5QlFVOHNRMEZCUXp0SlFVRmFPenQ1UWtGRlZDeFJRVUZCTEVkQlFWVXNVMEZCUVR0aFFVRkhMRWxCUVVNc1EwRkJRU3hQUVVGUExFTkJRVU03U1VGQldqczdTVUZGVml4VFFVRkJMRWRCUVZrc1UwRkJRVHRCUVVOV0xGVkJRVUU3VFVGQlFTeEpRVUV5UkN4SlFVRkRMRU5CUVVFc1QwRkJUeXhEUVVGRExFbEJRVlFzUzBGQmFVSXNTVUZCTlVVN1FVRkJRU3hqUVVGTkxFbEJRVWtzUzBGQlNpeERRVUZWTEhORFFVRldMRVZCUVU0N08wMUJRMEVzU1VGQlowUXNTVUZCUXl4RFFVRkJMRTlCUVU4c1EwRkJReXhSUVVGVUxFdEJRWEZDTEVsQlFYSkZPMEZCUVVFc1kwRkJUU3hKUVVGSkxFdEJRVW9zUTBGQlZTd3lRa0ZCVml4RlFVRk9PenROUVVOQkxFbEJRV2xFTEU5QlFVOHNTVUZCUXl4RFFVRkJMRTlCUVU4c1EwRkJReXhQUVVGb1FpeExRVUUyUWl4VlFVRTVSVHRCUVVGQkxHTkJRVTBzU1VGQlNTeExRVUZLTEVOQlFWVXNORUpCUVZZc1JVRkJUanM3VFVGRFFTeDVRa0ZCUVN4SFFVRTBRaXhMUVVGTExFTkJRVU1zWjBKQlFVNHNRMEZCZFVJc1NVRkJReXhEUVVGQkxFOUJRVThzUTBGQlF5eFJRVUZvUXp0TlFVTTFRaXhKUVVGdlJDeERRVUZETEhsQ1FVRnlSRHRCUVVGQkxHTkJRVTBzU1VGQlNTeExRVUZLTEVOQlFWVXNLMEpCUVZZc1JVRkJUanM3U1VGTVZUczdPenM3TzBWQlQxSXNVVUZCUXl4RFFVRkJPMGxCUTFFc1kwRkJReXhKUVVGRUxFVkJRVkVzVFVGQlVqdE5RVUZETEVsQlFVTXNRMEZCUVN4UFFVRkVPMDFCUVU4c1NVRkJReXhEUVVGQkxIbENRVUZFTEZOQlFVODdUVUZETVVJc1MwRkJTeXhEUVVGRExGRkJRVTRzUTBGQlpTeEpRVUZETEVOQlFVRXNTMEZCYUVJc1JVRkJkVUk3VVVGQlF5eE5RVUZCTEVWQlFWRXNTVUZCVkR0UFFVRjJRanROUVVOQkxFbEJRVU1zUTBGQlFTeFhRVUZFTEVkQlFXVTdTVUZHU2pzN2JVSkJTV0lzWTBGQlFTeEhRVUZuUWl4VFFVRkRMRlZCUVVRN1lVRkRaQ3hKUVVGRExFTkJRVUVzVjBGQlZ5eERRVUZETEVsQlFXSXNRMEZCYTBJc1ZVRkJiRUk3U1VGRVl6czdiVUpCUjJoQ0xHVkJRVUVzUjBGQmFVSXNVMEZCUXl4WFFVRkVPMEZCUTJZc1ZVRkJRVHRCUVVGQk8xZEJRVUVzTmtOQlFVRTdPM0ZDUVVGQkxFbEJRVU1zUTBGQlFTeGpRVUZFTEVOQlFXZENMRlZCUVdoQ08wRkJRVUU3TzBsQlJHVTdPMjFDUVVkcVFpeFJRVUZCTEVkQlFWVXNVMEZCUVR0QlFVTlNMRlZCUVVFN1FVRkJRVHRCUVVGQk8xZEJRVUVzY1VOQlFVRTdPM0ZDUVVORkxGVkJRVlVzUTBGQlF5eGhRVUZZTEVOQlFYbENMRWxCUVVNc1EwRkJRU3hKUVVFeFFpeEZRVUZuUXl4SlFVRkRMRU5CUVVFc1MwRkJha003UVVGRVJqczdTVUZFVVRzN096czdPenM3T3p0QlFVdGtMRTFCUVUwc1EwRkJReXhQUVVGUUxFZEJRV2xDSW4wPVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGRlYnVnOiBmYWxzZVxufTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pTDJodmJXVXZlVzloZGk5amIyUmxMMkZzWlhCb1ltVjBMM055WXk5dmNIUnBiMjV6TG1OdlptWmxaU0lzSW5OdmRYSmpaVkp2YjNRaU9pSWlMQ0p6YjNWeVkyVnpJanBiSWk5b2IyMWxMM2x2WVhZdlkyOWtaUzloYkdWd2FHSmxkQzl6Y21NdmIzQjBhVzl1Y3k1amIyWm1aV1VpWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJa0ZCUVVFc1RVRkJUU3hEUVVGRExFOUJRVkFzUjBGRFJUdEZRVUZCTEV0QlFVRXNSVUZCVHl4TFFVRlFJbjA9XG4iLCJ2YXIgQmFzaWwsIFN0b3JhZ2UsIHN0b3JlO1xuXG5CYXNpbCA9IHJlcXVpcmUoJ2Jhc2lsLmpzJyk7XG5cbnN0b3JlID0gQmFzaWxbXCJuZXdcIl07XG5cblN0b3JhZ2UgPSAoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIFN0b3JhZ2UobmFtZXNwYWNlKSB7XG4gICAgdGhpcy5uYW1lc3BhY2UgPSBuYW1lc3BhY2UgIT0gbnVsbCA/IG5hbWVzcGFjZSA6ICdhbGVwaGJldCc7XG4gICAgdGhpcy5zdG9yYWdlID0gc3RvcmUuZ2V0KHRoaXMubmFtZXNwYWNlKSB8fCB7fTtcbiAgfVxuXG4gIFN0b3JhZ2UucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICB0aGlzLnN0b3JhZ2Vba2V5XSA9IHZhbHVlO1xuICAgIHN0b3JlLnNldCh0aGlzLm5hbWVzcGFjZSwgdGhpcy5zdG9yYWdlKTtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG5cbiAgU3RvcmFnZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgcmV0dXJuIHRoaXMuc3RvcmFnZVtrZXldO1xuICB9O1xuXG4gIHJldHVybiBTdG9yYWdlO1xuXG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN0b3JhZ2U7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaUwyaHZiV1V2ZVc5aGRpOWpiMlJsTDJGc1pYQm9ZbVYwTDNOeVl5OXpkRzl5WVdkbExtTnZabVpsWlNJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6SWpwYklpOW9iMjFsTDNsdllYWXZZMjlrWlM5aGJHVndhR0psZEM5emNtTXZjM1J2Y21GblpTNWpiMlptWldVaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWtGQlFVRXNTVUZCUVRzN1FVRkJRU3hMUVVGQkxFZEJRVkVzVDBGQlFTeERRVUZSTEZWQlFWSTdPMEZCUTFJc1MwRkJRU3hIUVVGUkxFdEJRVXNzUlVGQlF5eEhRVUZFT3p0QlFVZFFPMFZCUTFNc2FVSkJRVU1zVTBGQlJEdEpRVUZETEVsQlFVTXNRMEZCUVN4blEwRkJSQ3haUVVGWE8wbEJRM1pDTEVsQlFVTXNRMEZCUVN4UFFVRkVMRWRCUVZjc1MwRkJTeXhEUVVGRExFZEJRVTRzUTBGQlZTeEpRVUZETEVOQlFVRXNVMEZCV0N4RFFVRkJMRWxCUVhsQ08wVkJSSHBDT3p0dlFrRkZZaXhIUVVGQkxFZEJRVXNzVTBGQlF5eEhRVUZFTEVWQlFVMHNTMEZCVGp0SlFVTklMRWxCUVVNc1EwRkJRU3hQUVVGUkxFTkJRVUVzUjBGQlFTeERRVUZVTEVkQlFXZENPMGxCUTJoQ0xFdEJRVXNzUTBGQlF5eEhRVUZPTEVOQlFWVXNTVUZCUXl4RFFVRkJMRk5CUVZnc1JVRkJjMElzU1VGQlF5eERRVUZCTEU5QlFYWkNPMEZCUTBFc1YwRkJUenRGUVVoS096dHZRa0ZKVEN4SFFVRkJMRWRCUVVzc1UwRkJReXhIUVVGRU8xZEJRMGdzU1VGQlF5eERRVUZCTEU5QlFWRXNRMEZCUVN4SFFVRkJPMFZCUkU0N096czdPenRCUVVsUUxFMUJRVTBzUTBGQlF5eFBRVUZRTEVkQlFXbENJbjA9XG4iLCJ2YXIgVXRpbHMsIF8sIG9wdGlvbnMsIHNoYTEsIHV1aWQ7XG5cbl8gPSByZXF1aXJlKCcuLi92ZW5kb3IvbG9kYXNoLmN1c3RvbS5taW4nKTtcblxudXVpZCA9IHJlcXVpcmUoJ25vZGUtdXVpZCcpO1xuXG5zaGExID0gcmVxdWlyZSgnY3J5cHRvLWpzL3NoYTEnKTtcblxub3B0aW9ucyA9IHJlcXVpcmUoJy4vb3B0aW9ucycpO1xuXG5VdGlscyA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gVXRpbHMoKSB7fVxuXG4gIFV0aWxzLmRlZmF1bHRzID0gXy5kZWZhdWx0cztcblxuICBVdGlscy5rZXlzID0gXy5rZXlzO1xuXG4gIFV0aWxzLnJlbW92ZSA9IF8ucmVtb3ZlO1xuXG4gIFV0aWxzLm9taXQgPSBfLm9taXQ7XG5cbiAgVXRpbHMubG9nID0gZnVuY3Rpb24obWVzc2FnZSkge1xuICAgIGlmIChvcHRpb25zLmRlYnVnKSB7XG4gICAgICByZXR1cm4gY29uc29sZS5sb2cobWVzc2FnZSk7XG4gICAgfVxuICB9O1xuXG4gIFV0aWxzLnV1aWQgPSB1dWlkLnY0O1xuXG4gIFV0aWxzLnNoYTEgPSBmdW5jdGlvbih0ZXh0KSB7XG4gICAgcmV0dXJuIHNoYTEodGV4dCkudG9TdHJpbmcoKTtcbiAgfTtcblxuICBVdGlscy5yYW5kb20gPSBmdW5jdGlvbihzZWVkKSB7XG4gICAgaWYgKCFzZWVkKSB7XG4gICAgICByZXR1cm4gTWF0aC5yYW5kb20oKTtcbiAgICB9XG4gICAgcmV0dXJuIHBhcnNlSW50KHRoaXMuc2hhMShzZWVkKS5zdWJzdHIoMCwgMTMpLCAxNikgLyAweEZGRkZGRkZGRkZGRkY7XG4gIH07XG5cbiAgVXRpbHMuY2hlY2tfd2VpZ2h0cyA9IGZ1bmN0aW9uKHZhcmlhbnRzKSB7XG4gICAgdmFyIGNvbnRhaW5zX3dlaWdodCwga2V5LCB2YWx1ZTtcbiAgICBjb250YWluc193ZWlnaHQgPSBbXTtcbiAgICBmb3IgKGtleSBpbiB2YXJpYW50cykge1xuICAgICAgdmFsdWUgPSB2YXJpYW50c1trZXldO1xuICAgICAgY29udGFpbnNfd2VpZ2h0LnB1c2godmFsdWUud2VpZ2h0ICE9IG51bGwpO1xuICAgIH1cbiAgICByZXR1cm4gY29udGFpbnNfd2VpZ2h0LmV2ZXJ5KGZ1bmN0aW9uKGhhc193ZWlnaHQpIHtcbiAgICAgIHJldHVybiBoYXNfd2VpZ2h0O1xuICAgIH0pO1xuICB9O1xuXG4gIFV0aWxzLnN1bV93ZWlnaHRzID0gZnVuY3Rpb24odmFyaWFudHMpIHtcbiAgICB2YXIga2V5LCBzdW0sIHZhbHVlO1xuICAgIHN1bSA9IDA7XG4gICAgZm9yIChrZXkgaW4gdmFyaWFudHMpIHtcbiAgICAgIHZhbHVlID0gdmFyaWFudHNba2V5XTtcbiAgICAgIHN1bSArPSB2YWx1ZS53ZWlnaHQgfHwgMDtcbiAgICB9XG4gICAgcmV0dXJuIHN1bTtcbiAgfTtcblxuICBVdGlscy52YWxpZGF0ZV93ZWlnaHRzID0gZnVuY3Rpb24odmFyaWFudHMpIHtcbiAgICB2YXIgY29udGFpbnNfd2VpZ2h0LCBrZXksIHZhbHVlO1xuICAgIGNvbnRhaW5zX3dlaWdodCA9IFtdO1xuICAgIGZvciAoa2V5IGluIHZhcmlhbnRzKSB7XG4gICAgICB2YWx1ZSA9IHZhcmlhbnRzW2tleV07XG4gICAgICBjb250YWluc193ZWlnaHQucHVzaCh2YWx1ZS53ZWlnaHQgIT0gbnVsbCk7XG4gICAgfVxuICAgIHJldHVybiBjb250YWluc193ZWlnaHQuZXZlcnkoZnVuY3Rpb24oaGFzX3dlaWdodCkge1xuICAgICAgcmV0dXJuIGhhc193ZWlnaHQgfHwgY29udGFpbnNfd2VpZ2h0LmV2ZXJ5KGZ1bmN0aW9uKGhhc193ZWlnaHQpIHtcbiAgICAgICAgcmV0dXJuICFoYXNfd2VpZ2h0O1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG5cbiAgcmV0dXJuIFV0aWxzO1xuXG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFV0aWxzO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lMMmh2YldVdmVXOWhkaTlqYjJSbEwyRnNaWEJvWW1WMEwzTnlZeTkxZEdsc2N5NWpiMlptWldVaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SXZhRzl0WlM5NWIyRjJMMk52WkdVdllXeGxjR2hpWlhRdmMzSmpMM1YwYVd4ekxtTnZabVpsWlNKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGRFFTeEpRVUZCT3p0QlFVRkJMRU5CUVVFc1IwRkJTU3hQUVVGQkxFTkJRVkVzTmtKQlFWSTdPMEZCUTBvc1NVRkJRU3hIUVVGUExFOUJRVUVzUTBGQlVTeFhRVUZTT3p0QlFVTlFMRWxCUVVFc1IwRkJUeXhQUVVGQkxFTkJRVkVzWjBKQlFWSTdPMEZCUTFBc1QwRkJRU3hIUVVGVkxFOUJRVUVzUTBGQlVTeFhRVUZTT3p0QlFVVktPenM3UlVGRFNpeExRVUZETEVOQlFVRXNVVUZCUkN4SFFVRlhMRU5CUVVNc1EwRkJRenM3UlVGRFlpeExRVUZETEVOQlFVRXNTVUZCUkN4SFFVRlBMRU5CUVVNc1EwRkJRenM3UlVGRFZDeExRVUZETEVOQlFVRXNUVUZCUkN4SFFVRlRMRU5CUVVNc1EwRkJRenM3UlVGRFdDeExRVUZETEVOQlFVRXNTVUZCUkN4SFFVRlBMRU5CUVVNc1EwRkJRenM3UlVGRFZDeExRVUZETEVOQlFVRXNSMEZCUkN4SFFVRk5MRk5CUVVNc1QwRkJSRHRKUVVOS0xFbEJRWGRDTEU5QlFVOHNRMEZCUXl4TFFVRm9RenRoUVVGQkxFOUJRVThzUTBGQlF5eEhRVUZTTEVOQlFWa3NUMEZCV2l4RlFVRkJPenRGUVVSSk96dEZRVVZPTEV0QlFVTXNRMEZCUVN4SlFVRkVMRWRCUVU4c1NVRkJTU3hEUVVGRE96dEZRVU5hTEV0QlFVTXNRMEZCUVN4SlFVRkVMRWRCUVU4c1UwRkJReXhKUVVGRU8xZEJRMHdzU1VGQlFTeERRVUZMTEVsQlFVd3NRMEZCVlN4RFFVRkRMRkZCUVZnc1EwRkJRVHRGUVVSTE96dEZRVVZRTEV0QlFVTXNRMEZCUVN4TlFVRkVMRWRCUVZNc1UwRkJReXhKUVVGRU8wbEJRMUFzU1VGQlFTeERRVUUwUWl4SlFVRTFRanRCUVVGQkxHRkJRVThzU1VGQlNTeERRVUZETEUxQlFVd3NRMEZCUVN4RlFVRlFPenRYUVVWQkxGRkJRVUVzUTBGQlV5eEpRVUZETEVOQlFVRXNTVUZCUkN4RFFVRk5MRWxCUVU0c1EwRkJWeXhEUVVGRExFMUJRVm9zUTBGQmJVSXNRMEZCYmtJc1JVRkJjMElzUlVGQmRFSXNRMEZCVkN4RlFVRnZReXhGUVVGd1F5eERRVUZCTEVkQlFUQkRPMFZCU0c1RE96dEZRVWxVTEV0QlFVTXNRMEZCUVN4aFFVRkVMRWRCUVdkQ0xGTkJRVU1zVVVGQlJEdEJRVU5rTEZGQlFVRTdTVUZCUVN4bFFVRkJMRWRCUVd0Q08wRkJRMnhDTEZOQlFVRXNaVUZCUVRzN1RVRkJRU3hsUVVGbExFTkJRVU1zU1VGQmFFSXNRMEZCY1VJc2IwSkJRWEpDTzBGQlFVRTdWMEZEUVN4bFFVRmxMRU5CUVVNc1MwRkJhRUlzUTBGQmMwSXNVMEZCUXl4VlFVRkVPMkZCUVdkQ08wbEJRV2hDTEVOQlFYUkNPMFZCU0dNN08wVkJTV2hDTEV0QlFVTXNRMEZCUVN4WFFVRkVMRWRCUVdNc1UwRkJReXhSUVVGRU8wRkJRMW9zVVVGQlFUdEpRVUZCTEVkQlFVRXNSMEZCVFR0QlFVTk9MRk5CUVVFc1pVRkJRVHM3VFVGRFJTeEhRVUZCTEVsQlFVOHNTMEZCU3l4RFFVRkRMRTFCUVU0c1NVRkJaMEk3UVVGRWVrSTdWMEZGUVR0RlFVcFpPenRGUVV0a0xFdEJRVU1zUTBGQlFTeG5Ra0ZCUkN4SFFVRnRRaXhUUVVGRExGRkJRVVE3UVVGRGFrSXNVVUZCUVR0SlFVRkJMR1ZCUVVFc1IwRkJhMEk3UVVGRGJFSXNVMEZCUVN4bFFVRkJPenROUVVGQkxHVkJRV1VzUTBGQlF5eEpRVUZvUWl4RFFVRnhRaXh2UWtGQmNrSTdRVUZCUVR0WFFVTkJMR1ZCUVdVc1EwRkJReXhMUVVGb1FpeERRVUZ6UWl4VFFVRkRMRlZCUVVRN1lVRkJaMElzVlVGQlFTeEpRVUZqTEdWQlFXVXNRMEZCUXl4TFFVRm9RaXhEUVVGelFpeFRRVUZETEZWQlFVUTdaVUZCWjBJc1EwRkJRenROUVVGcVFpeERRVUYwUWp0SlFVRTVRaXhEUVVGMFFqdEZRVWhwUWpzN096czdPMEZCU1hKQ0xFMUJRVTBzUTBGQlF5eFBRVUZRTEVkQlFXbENJbjA9XG4iLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBsb2Rhc2ggMy4xMC4xIChDdXN0b20gQnVpbGQpIGxvZGFzaC5jb20vbGljZW5zZSB8IFVuZGVyc2NvcmUuanMgMS44LjMgdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFXG4gKiBCdWlsZDogYGxvZGFzaCAtcCBpbmNsdWRlPVwia2V5cyxkZWZhdWx0cyxyZW1vdmUsb21pdFwiIGV4cG9ydHM9XCJub2RlXCIgLW8gLi92ZW5kb3IvbG9kYXNoLmN1c3RvbS5taW4uanNgXG4gKi9cbjsoZnVuY3Rpb24oKXtmdW5jdGlvbiBuYShhLGIsYyl7aWYoYiE9PWIpe2E6e2I9YS5sZW5ndGg7Zm9yKGMrPS0xOysrYzxiOyl7dmFyIGU9YVtjXTtpZihlIT09ZSl7YT1jO2JyZWFrIGF9fWE9LTF9cmV0dXJuIGF9Yy09MTtmb3IoZT1hLmxlbmd0aDsrK2M8ZTspaWYoYVtjXT09PWIpcmV0dXJuIGM7cmV0dXJuLTF9ZnVuY3Rpb24gQShhKXtyZXR1cm4hIWEmJnR5cGVvZiBhPT1cIm9iamVjdFwifWZ1bmN0aW9uIG0oKXt9ZnVuY3Rpb24geGEoYSl7dmFyIGI9YT9hLmxlbmd0aDowO2Zvcih0aGlzLmRhdGE9e2hhc2g6eWEobnVsbCksc2V0Om5ldyB6YX07Yi0tOyl0aGlzLnB1c2goYVtiXSl9ZnVuY3Rpb24gWmEoYSxiKXt2YXIgYz1hLmRhdGE7cmV0dXJuKHR5cGVvZiBiPT1cInN0cmluZ1wifHx0KGIpP2Muc2V0LmhhcyhiKTpjLmhhc2hbYl0pPzA6LTF9ZnVuY3Rpb24gJGEoYSxiKXt2YXIgYz0tMSxlPWEubGVuZ3RoO2ZvcihifHwoYj1BcnJheShlKSk7KytjPGU7KWJbY109YVtjXTtcbnJldHVybiBifWZ1bmN0aW9uIEFhKGEsYil7Zm9yKHZhciBjPS0xLGU9YS5sZW5ndGg7KytjPGUmJmZhbHNlIT09YihhW2NdLGMsYSk7KTtyZXR1cm4gYX1mdW5jdGlvbiBhYihhKXtmb3IodmFyIGI9U3RyaW5nLGM9LTEsZT1hLmxlbmd0aCxkPUFycmF5KGUpOysrYzxlOylkW2NdPWIoYVtjXSxjLGEpO3JldHVybiBkfWZ1bmN0aW9uIGJiKGEsYil7Zm9yKHZhciBjPS0xLGU9YS5sZW5ndGg7KytjPGU7KWlmKGIoYVtjXSxjLGEpKXJldHVybiB0cnVlO3JldHVybiBmYWxzZX1mdW5jdGlvbiBCYShhLGIpe3ZhciBjO2lmKG51bGw9PWIpYz1hO2Vsc2V7Yz1DKGIpO3ZhciBlPWE7ZXx8KGU9e30pO2Zvcih2YXIgZD0tMSxmPWMubGVuZ3RoOysrZDxmOyl7dmFyIGg9Y1tkXTtlW2hdPWJbaF19Yz1lfXJldHVybiBjfWZ1bmN0aW9uIENhKGEsYixjKXt2YXIgZT10eXBlb2YgYTtyZXR1cm5cImZ1bmN0aW9uXCI9PWU/Yj09PXA/YTpvYShhLGIsYyk6bnVsbD09YT9ROlwib2JqZWN0XCI9PWU/RGEoYSk6Yj09PXA/RWEoYSk6XG5jYihhLGIpfWZ1bmN0aW9uIEZhKGEsYixjLGUsZCxmLGgpe3ZhciBnO2MmJihnPWQ/YyhhLGUsZCk6YyhhKSk7aWYoZyE9PXApcmV0dXJuIGc7aWYoIXQoYSkpcmV0dXJuIGE7aWYoZT14KGEpKXtpZihnPWRiKGEpLCFiKXJldHVybiAkYShhLGcpfWVsc2V7dmFyIGw9Qi5jYWxsKGEpLG49bD09RztpZihsPT11fHxsPT1IfHxuJiYhZCl7aWYoUihhKSlyZXR1cm4gZD9hOnt9O2c9ZWIobj97fTphKTtpZighYilyZXR1cm4gQmEoZyxhKX1lbHNlIHJldHVybiByW2xdP2ZiKGEsbCxiKTpkP2E6e319Znx8KGY9W10pO2h8fChoPVtdKTtmb3IoZD1mLmxlbmd0aDtkLS07KWlmKGZbZF09PWEpcmV0dXJuIGhbZF07Zi5wdXNoKGEpO2gucHVzaChnKTsoZT9BYTpnYikoYSxmdW5jdGlvbihlLGQpe2dbZF09RmEoZSxiLGMsZCxhLGYsaCl9KTtyZXR1cm4gZ31mdW5jdGlvbiBoYihhLGIpe3ZhciBjPWE/YS5sZW5ndGg6MCxlPVtdO2lmKCFjKXJldHVybiBlO3ZhciBkPS0xLGY7Zj1tLmluZGV4T2Z8fFxucGE7Zj1mPT09cGE/bmE6Zjt2YXIgaD1mPT09bmEsZz1oJiZiLmxlbmd0aD49aWI/eWEmJnphP25ldyB4YShiKTpudWxsOm51bGwsbD1iLmxlbmd0aDtnJiYoZj1aYSxoPWZhbHNlLGI9Zyk7YTpmb3IoOysrZDxjOylpZihnPWFbZF0saCYmZz09PWcpe2Zvcih2YXIgbj1sO24tLTspaWYoYltuXT09PWcpY29udGludWUgYTtlLnB1c2goZyl9ZWxzZSAwPmYoYixnLDApJiZlLnB1c2goZyk7cmV0dXJuIGV9ZnVuY3Rpb24gR2EoYSxiLGMsZSl7ZXx8KGU9W10pO2Zvcih2YXIgZD0tMSxmPWEubGVuZ3RoOysrZDxmOyl7dmFyIGg9YVtkXTtpZihBKGgpJiZTKGgpJiYoY3x8eChoKXx8VChoKSkpaWYoYilHYShoLGIsYyxlKTtlbHNlIGZvcih2YXIgZz1lLGw9LTEsbj1oLmxlbmd0aCxrPWcubGVuZ3RoOysrbDxuOylnW2srbF09aFtsXTtlbHNlIGN8fChlW2UubGVuZ3RoXT1oKX1yZXR1cm4gZX1mdW5jdGlvbiBqYihhLGIpe0hhKGEsYixVKX1mdW5jdGlvbiBnYihhLGIpe3JldHVybiBIYShhLGIsXG5DKX1mdW5jdGlvbiBJYShhLGIsYyl7aWYobnVsbCE9YSl7YT15KGEpO2MhPT1wJiZjIGluIGEmJihiPVtjXSk7Yz0wO2Zvcih2YXIgZT1iLmxlbmd0aDtudWxsIT1hJiZjPGU7KWE9eShhKVtiW2MrK11dO3JldHVybiBjJiZjPT1lP2E6cH19ZnVuY3Rpb24gcWEoYSxiLGMsZSxkLGYpe2lmKGE9PT1iKWE9dHJ1ZTtlbHNlIGlmKG51bGw9PWF8fG51bGw9PWJ8fCF0KGEpJiYhQShiKSlhPWEhPT1hJiZiIT09YjtlbHNlIGE6e3ZhciBoPXFhLGc9eChhKSxsPXgoYiksbj1FLGs9RTtnfHwobj1CLmNhbGwoYSksbj09SD9uPXU6biE9dSYmKGc9cmEoYSkpKTtsfHwoaz1CLmNhbGwoYiksaz09SD9rPXU6ayE9dSYmcmEoYikpO3ZhciBwPW49PXUmJiFSKGEpLGw9az09dSYmIVIoYiksaz1uPT1rO2lmKCFrfHxnfHxwKXtpZighZSYmKG49cCYmdi5jYWxsKGEsXCJfX3dyYXBwZWRfX1wiKSxsPWwmJnYuY2FsbChiLFwiX193cmFwcGVkX19cIiksbnx8bCkpe2E9aChuP2EudmFsdWUoKTphLGw/Yi52YWx1ZSgpOlxuYixjLGUsZCxmKTticmVhayBhfWlmKGspe2R8fChkPVtdKTtmfHwoZj1bXSk7Zm9yKG49ZC5sZW5ndGg7bi0tOylpZihkW25dPT1hKXthPWZbbl09PWI7YnJlYWsgYX1kLnB1c2goYSk7Zi5wdXNoKGIpO2E9KGc/a2I6bGIpKGEsYixoLGMsZSxkLGYpO2QucG9wKCk7Zi5wb3AoKX1lbHNlIGE9ZmFsc2V9ZWxzZSBhPW1iKGEsYixuKX1yZXR1cm4gYX1mdW5jdGlvbiBuYihhLGIpe3ZhciBjPWIubGVuZ3RoLGU9YztpZihudWxsPT1hKXJldHVybiFlO2ZvcihhPXkoYSk7Yy0tOyl7dmFyIGQ9YltjXTtpZihkWzJdP2RbMV0hPT1hW2RbMF1dOiEoZFswXWluIGEpKXJldHVybiBmYWxzZX1mb3IoOysrYzxlOyl7dmFyIGQ9YltjXSxmPWRbMF0saD1hW2ZdLGc9ZFsxXTtpZihkWzJdKXtpZihoPT09cCYmIShmIGluIGEpKXJldHVybiBmYWxzZX1lbHNlIGlmKGQ9cCxkPT09cD8hcWEoZyxoLHZvaWQgMCx0cnVlKTohZClyZXR1cm4gZmFsc2V9cmV0dXJuIHRydWV9ZnVuY3Rpb24gRGEoYSl7dmFyIGI9b2IoYSk7aWYoMT09Yi5sZW5ndGgmJlxuYlswXVsyXSl7dmFyIGM9YlswXVswXSxlPWJbMF1bMV07cmV0dXJuIGZ1bmN0aW9uKGEpe2lmKG51bGw9PWEpcmV0dXJuIGZhbHNlO2E9eShhKTtyZXR1cm4gYVtjXT09PWUmJihlIT09cHx8YyBpbiBhKX19cmV0dXJuIGZ1bmN0aW9uKGEpe3JldHVybiBuYihhLGIpfX1mdW5jdGlvbiBjYihhLGIpe3ZhciBjPXgoYSksZT1KYShhKSYmYj09PWImJiF0KGIpLGQ9YStcIlwiO2E9S2EoYSk7cmV0dXJuIGZ1bmN0aW9uKGYpe2lmKG51bGw9PWYpcmV0dXJuIGZhbHNlO3ZhciBoPWQ7Zj15KGYpO2lmKCEoIWMmJmV8fGggaW4gZikpe2lmKDEhPWEubGVuZ3RoKXt2YXIgaD1hLGc9MCxsPS0xLG49LTEsaz1oLmxlbmd0aCxnPW51bGw9PWc/MDorZ3x8MDswPmcmJihnPS1nPms/MDprK2cpO2w9bD09PXB8fGw+az9rOitsfHwwOzA+bCYmKGwrPWspO2s9Zz5sPzA6bC1nPj4+MDtnPj4+PTA7Zm9yKGw9QXJyYXkoayk7KytuPGs7KWxbbl09aFtuK2ddO2Y9SWEoZixsKX1pZihudWxsPT1mKXJldHVybiBmYWxzZTtoPUxhKGEpO1xuZj15KGYpfXJldHVybiBmW2hdPT09Yj9iIT09cHx8aCBpbiBmOnFhKGIsZltoXSxwLHRydWUpfX1mdW5jdGlvbiBNYShhKXtyZXR1cm4gZnVuY3Rpb24oYil7cmV0dXJuIG51bGw9PWI/cDp5KGIpW2FdfX1mdW5jdGlvbiBwYihhKXt2YXIgYj1hK1wiXCI7YT1LYShhKTtyZXR1cm4gZnVuY3Rpb24oYyl7cmV0dXJuIElhKGMsYSxiKX19ZnVuY3Rpb24gb2EoYSxiLGMpe2lmKHR5cGVvZiBhIT1cImZ1bmN0aW9uXCIpcmV0dXJuIFE7aWYoYj09PXApcmV0dXJuIGE7c3dpdGNoKGMpe2Nhc2UgMTpyZXR1cm4gZnVuY3Rpb24oYyl7cmV0dXJuIGEuY2FsbChiLGMpfTtjYXNlIDM6cmV0dXJuIGZ1bmN0aW9uKGMsZCxmKXtyZXR1cm4gYS5jYWxsKGIsYyxkLGYpfTtjYXNlIDQ6cmV0dXJuIGZ1bmN0aW9uKGMsZCxmLGgpe3JldHVybiBhLmNhbGwoYixjLGQsZixoKX07Y2FzZSA1OnJldHVybiBmdW5jdGlvbihjLGQsZixoLGcpe3JldHVybiBhLmNhbGwoYixjLGQsZixoLGcpfX1yZXR1cm4gZnVuY3Rpb24oKXtyZXR1cm4gYS5hcHBseShiLFxuYXJndW1lbnRzKX19ZnVuY3Rpb24gTmEoYSl7dmFyIGI9bmV3IHFiKGEuYnl0ZUxlbmd0aCk7KG5ldyBzYShiKSkuc2V0KG5ldyBzYShhKSk7cmV0dXJuIGJ9ZnVuY3Rpb24ga2IoYSxiLGMsZSxkLGYsaCl7dmFyIGc9LTEsbD1hLmxlbmd0aCxuPWIubGVuZ3RoO2lmKGwhPW4mJiEoZCYmbj5sKSlyZXR1cm4gZmFsc2U7Zm9yKDsrK2c8bDspe3ZhciBrPWFbZ10sbj1iW2ddLG09ZT9lKGQ/bjprLGQ/azpuLGcpOnA7aWYobSE9PXApe2lmKG0pY29udGludWU7cmV0dXJuIGZhbHNlfWlmKGQpe2lmKCFiYihiLGZ1bmN0aW9uKGEpe3JldHVybiBrPT09YXx8YyhrLGEsZSxkLGYsaCl9KSlyZXR1cm4gZmFsc2V9ZWxzZSBpZihrIT09biYmIWMoayxuLGUsZCxmLGgpKXJldHVybiBmYWxzZX1yZXR1cm4gdHJ1ZX1mdW5jdGlvbiBtYihhLGIsYyl7c3dpdGNoKGMpe2Nhc2UgSTpjYXNlIEo6cmV0dXJuK2E9PStiO2Nhc2UgSzpyZXR1cm4gYS5uYW1lPT1iLm5hbWUmJmEubWVzc2FnZT09Yi5tZXNzYWdlO2Nhc2UgTDpyZXR1cm4gYSE9XG4rYT9iIT0rYjphPT0rYjtjYXNlIE06Y2FzZSBEOnJldHVybiBhPT1iK1wiXCJ9cmV0dXJuIGZhbHNlfWZ1bmN0aW9uIGxiKGEsYixjLGUsZCxmLGgpe3ZhciBnPUMoYSksbD1nLmxlbmd0aCxuPUMoYikubGVuZ3RoO2lmKGwhPW4mJiFkKXJldHVybiBmYWxzZTtmb3Iobj1sO24tLTspe3ZhciBrPWdbbl07aWYoIShkP2sgaW4gYjp2LmNhbGwoYixrKSkpcmV0dXJuIGZhbHNlfWZvcih2YXIgbT1kOysrbjxsOyl7dmFyIGs9Z1tuXSxyPWFba10scT1iW2tdLHM9ZT9lKGQ/cTpyLGQ/cjpxLGspOnA7aWYocz09PXA/IWMocixxLGUsZCxmLGgpOiFzKXJldHVybiBmYWxzZTttfHwobT1cImNvbnN0cnVjdG9yXCI9PWspfXJldHVybiBtfHwoYz1hLmNvbnN0cnVjdG9yLGU9Yi5jb25zdHJ1Y3RvciwhKGMhPWUmJlwiY29uc3RydWN0b3JcImluIGEmJlwiY29uc3RydWN0b3JcImluIGIpfHx0eXBlb2YgYz09XCJmdW5jdGlvblwiJiZjIGluc3RhbmNlb2YgYyYmdHlwZW9mIGU9PVwiZnVuY3Rpb25cIiYmZSBpbnN0YW5jZW9mIGUpP3RydWU6ZmFsc2V9ZnVuY3Rpb24gb2IoYSl7YT1cbk9hKGEpO2Zvcih2YXIgYj1hLmxlbmd0aDtiLS07KXt2YXIgYz1hW2JdWzFdO2FbYl1bMl09Yz09PWMmJiF0KGMpfXJldHVybiBhfWZ1bmN0aW9uIFYoYSxiKXt2YXIgYz1udWxsPT1hP3A6YVtiXTtyZXR1cm4gUGEoYyk/YzpwfWZ1bmN0aW9uIGRiKGEpe3ZhciBiPWEubGVuZ3RoLGM9bmV3IGEuY29uc3RydWN0b3IoYik7YiYmXCJzdHJpbmdcIj09dHlwZW9mIGFbMF0mJnYuY2FsbChhLFwiaW5kZXhcIikmJihjLmluZGV4PWEuaW5kZXgsYy5pbnB1dD1hLmlucHV0KTtyZXR1cm4gY31mdW5jdGlvbiBlYihhKXthPWEuY29uc3RydWN0b3I7dHlwZW9mIGE9PVwiZnVuY3Rpb25cIiYmYSBpbnN0YW5jZW9mIGF8fChhPU9iamVjdCk7cmV0dXJuIG5ldyBhfWZ1bmN0aW9uIGZiKGEsYixjKXt2YXIgZT1hLmNvbnN0cnVjdG9yO3N3aXRjaChiKXtjYXNlIHRhOnJldHVybiBOYShhKTtjYXNlIEk6Y2FzZSBKOnJldHVybiBuZXcgZSgrYSk7Y2FzZSBXOmNhc2UgWDpjYXNlIFk6Y2FzZSBaOmNhc2UgJDpjYXNlIGFhOmNhc2UgYmE6Y2FzZSBjYTpjYXNlIGRhOnJldHVybiBlIGluc3RhbmNlb2ZcbmUmJihlPXpbYl0pLGI9YS5idWZmZXIsbmV3IGUoYz9OYShiKTpiLGEuYnl0ZU9mZnNldCxhLmxlbmd0aCk7Y2FzZSBMOmNhc2UgRDpyZXR1cm4gbmV3IGUoYSk7Y2FzZSBNOnZhciBkPW5ldyBlKGEuc291cmNlLHJiLmV4ZWMoYSkpO2QubGFzdEluZGV4PWEubGFzdEluZGV4fXJldHVybiBkfWZ1bmN0aW9uIFMoYSl7cmV0dXJuIG51bGwhPWEmJk4oc2IoYSkpfWZ1bmN0aW9uIGVhKGEsYil7YT10eXBlb2YgYT09XCJudW1iZXJcInx8dGIudGVzdChhKT8rYTotMTtiPW51bGw9PWI/UWE6YjtyZXR1cm4tMTxhJiYwPT1hJTEmJmE8Yn1mdW5jdGlvbiBSYShhLGIsYyl7aWYoIXQoYykpcmV0dXJuIGZhbHNlO3ZhciBlPXR5cGVvZiBiO3JldHVybihcIm51bWJlclwiPT1lP1MoYykmJmVhKGIsYy5sZW5ndGgpOlwic3RyaW5nXCI9PWUmJmIgaW4gYyk/KGI9Y1tiXSxhPT09YT9hPT09YjpiIT09Yik6ZmFsc2V9ZnVuY3Rpb24gSmEoYSl7dmFyIGI9dHlwZW9mIGE7cmV0dXJuXCJzdHJpbmdcIj09YiYmdWIudGVzdChhKXx8XG5cIm51bWJlclwiPT1iP3RydWU6eChhKT9mYWxzZTohdmIudGVzdChhKXx8ZmFsc2V9ZnVuY3Rpb24gTihhKXtyZXR1cm4gdHlwZW9mIGE9PVwibnVtYmVyXCImJi0xPGEmJjA9PWElMSYmYTw9UWF9ZnVuY3Rpb24gd2IoYSxiKXthPXkoYSk7Zm9yKHZhciBjPS0xLGU9Yi5sZW5ndGgsZD17fTsrK2M8ZTspe3ZhciBmPWJbY107ZiBpbiBhJiYoZFtmXT1hW2ZdKX1yZXR1cm4gZH1mdW5jdGlvbiB4YihhLGIpe3ZhciBjPXt9O2piKGEsZnVuY3Rpb24oYSxkLGYpe2IoYSxkLGYpJiYoY1tkXT1hKX0pO3JldHVybiBjfWZ1bmN0aW9uIFNhKGEpe2Zvcih2YXIgYj1VKGEpLGM9Yi5sZW5ndGgsZT1jJiZhLmxlbmd0aCxkPSEhZSYmTihlKSYmKHgoYSl8fFQoYSl8fGZhKGEpKSxmPS0xLGg9W107KytmPGM7KXt2YXIgZz1iW2ZdOyhkJiZlYShnLGUpfHx2LmNhbGwoYSxnKSkmJmgucHVzaChnKX1yZXR1cm4gaH1mdW5jdGlvbiB5KGEpe2lmKG0uc3VwcG9ydC51bmluZGV4ZWRDaGFycyYmZmEoYSkpe2Zvcih2YXIgYj0tMSxcbmM9YS5sZW5ndGgsZT1PYmplY3QoYSk7KytiPGM7KWVbYl09YS5jaGFyQXQoYik7cmV0dXJuIGV9cmV0dXJuIHQoYSk/YTpPYmplY3QoYSl9ZnVuY3Rpb24gS2EoYSl7aWYoeChhKSlyZXR1cm4gYTt2YXIgYj1bXTsobnVsbD09YT9cIlwiOmErXCJcIikucmVwbGFjZSh5YixmdW5jdGlvbihhLGUsZCxmKXtiLnB1c2goZD9mLnJlcGxhY2UoemIsXCIkMVwiKTplfHxhKX0pO3JldHVybiBifWZ1bmN0aW9uIHBhKGEsYixjKXt2YXIgZT1hP2EubGVuZ3RoOjA7aWYoIWUpcmV0dXJuLTE7aWYodHlwZW9mIGM9PVwibnVtYmVyXCIpYz0wPmM/dWEoZStjLDApOmM7ZWxzZSBpZihjKXtjPTA7dmFyIGQ9YT9hLmxlbmd0aDpjO2lmKHR5cGVvZiBiPT1cIm51bWJlclwiJiZiPT09YiYmZDw9QWIpe2Zvcig7YzxkOyl7dmFyIGY9YytkPj4+MSxoPWFbZl07aDxiJiZudWxsIT09aD9jPWYrMTpkPWZ9Yz1kfWVsc2V7ZD1RO2M9ZChiKTtmb3IodmFyIGY9MCxoPWE/YS5sZW5ndGg6MCxnPWMhPT1jLGw9bnVsbD09PWMsbj1cbmM9PT1wO2Y8aDspe3ZhciBrPUJiKChmK2gpLzIpLG09ZChhW2tdKSxyPW0hPT1wLHE9bT09PW07KGc/cTpsP3EmJnImJm51bGwhPW06bj9xJiZyOm51bGw9PW0/MDptPGMpP2Y9aysxOmg9a31jPUNiKGgsRGIpfXJldHVybiBjPGUmJihiPT09Yj9iPT09YVtjXTphW2NdIT09YVtjXSk/YzotMX1yZXR1cm4gbmEoYSxiLGN8fDApfWZ1bmN0aW9uIExhKGEpe3ZhciBiPWE/YS5sZW5ndGg6MDtyZXR1cm4gYj9hW2ItMV06cH1mdW5jdGlvbiBnYShhLGIpe2lmKHR5cGVvZiBhIT1cImZ1bmN0aW9uXCIpdGhyb3cgbmV3IFR5cGVFcnJvcihFYik7Yj11YShiPT09cD9hLmxlbmd0aC0xOitifHwwLDApO3JldHVybiBmdW5jdGlvbigpe2Zvcih2YXIgYz1hcmd1bWVudHMsZT0tMSxkPXVhKGMubGVuZ3RoLWIsMCksZj1BcnJheShkKTsrK2U8ZDspZltlXT1jW2IrZV07c3dpdGNoKGIpe2Nhc2UgMDpyZXR1cm4gYS5jYWxsKHRoaXMsZik7Y2FzZSAxOnJldHVybiBhLmNhbGwodGhpcyxjWzBdLGYpO2Nhc2UgMjpyZXR1cm4gYS5jYWxsKHRoaXMsXG5jWzBdLGNbMV0sZil9ZD1BcnJheShiKzEpO2ZvcihlPS0xOysrZTxiOylkW2VdPWNbZV07ZFtiXT1mO3JldHVybiBhLmFwcGx5KHRoaXMsZCl9fWZ1bmN0aW9uIFQoYSl7cmV0dXJuIEEoYSkmJlMoYSkmJnYuY2FsbChhLFwiY2FsbGVlXCIpJiYhaGEuY2FsbChhLFwiY2FsbGVlXCIpfWZ1bmN0aW9uIGlhKGEpe3JldHVybiB0KGEpJiZCLmNhbGwoYSk9PUd9ZnVuY3Rpb24gdChhKXt2YXIgYj10eXBlb2YgYTtyZXR1cm4hIWEmJihcIm9iamVjdFwiPT1ifHxcImZ1bmN0aW9uXCI9PWIpfWZ1bmN0aW9uIFBhKGEpe3JldHVybiBudWxsPT1hP2ZhbHNlOmlhKGEpP1RhLnRlc3QoVWEuY2FsbChhKSk6QShhKSYmKFIoYSk/VGE6RmIpLnRlc3QoYSl9ZnVuY3Rpb24gZmEoYSl7cmV0dXJuIHR5cGVvZiBhPT1cInN0cmluZ1wifHxBKGEpJiZCLmNhbGwoYSk9PUR9ZnVuY3Rpb24gcmEoYSl7cmV0dXJuIEEoYSkmJk4oYS5sZW5ndGgpJiYhIXFbQi5jYWxsKGEpXX1mdW5jdGlvbiBVKGEpe2lmKG51bGw9PWEpcmV0dXJuW107XG50KGEpfHwoYT1PYmplY3QoYSkpO2Zvcih2YXIgYj1hLmxlbmd0aCxjPW0uc3VwcG9ydCxiPWImJk4oYikmJih4KGEpfHxUKGEpfHxmYShhKSkmJmJ8fDAsZT1hLmNvbnN0cnVjdG9yLGQ9LTEsZT1pYShlKSYmZS5wcm90b3R5cGV8fEYsZj1lPT09YSxoPUFycmF5KGIpLGc9MDxiLGw9Yy5lbnVtRXJyb3JQcm9wcyYmKGE9PT1qYXx8YSBpbnN0YW5jZW9mIEVycm9yKSxuPWMuZW51bVByb3RvdHlwZXMmJmlhKGEpOysrZDxiOyloW2RdPWQrXCJcIjtmb3IodmFyIGsgaW4gYSluJiZcInByb3RvdHlwZVwiPT1rfHxsJiYoXCJtZXNzYWdlXCI9PWt8fFwibmFtZVwiPT1rKXx8ZyYmZWEoayxiKXx8XCJjb25zdHJ1Y3RvclwiPT1rJiYoZnx8IXYuY2FsbChhLGspKXx8aC5wdXNoKGspO2lmKGMubm9uRW51bVNoYWRvd3MmJmEhPT1GKWZvcihiPWE9PT1HYj9EOmE9PT1qYT9LOkIuY2FsbChhKSxjPXNbYl18fHNbdV0sYj09dSYmKGU9RiksYj12YS5sZW5ndGg7Yi0tOylrPXZhW2JdLGQ9Y1trXSxmJiZkfHwoZD8hdi5jYWxsKGEsXG5rKTphW2tdPT09ZVtrXSl8fGgucHVzaChrKTtyZXR1cm4gaH1mdW5jdGlvbiBPYShhKXthPXkoYSk7Zm9yKHZhciBiPS0xLGM9QyhhKSxlPWMubGVuZ3RoLGQ9QXJyYXkoZSk7KytiPGU7KXt2YXIgZj1jW2JdO2RbYl09W2YsYVtmXV19cmV0dXJuIGR9ZnVuY3Rpb24ga2EoYSxiLGMpe2MmJlJhKGEsYixjKSYmKGI9cCk7cmV0dXJuIEEoYSk/VmEoYSk6Q2EoYSxiKX1mdW5jdGlvbiBRKGEpe3JldHVybiBhfWZ1bmN0aW9uIFZhKGEpe3JldHVybiBEYShGYShhLHRydWUpKX1mdW5jdGlvbiBFYShhKXtyZXR1cm4gSmEoYSk/TWEoYSk6cGIoYSl9dmFyIHAsaWI9MjAwLEViPVwiRXhwZWN0ZWQgYSBmdW5jdGlvblwiLEg9XCJbb2JqZWN0IEFyZ3VtZW50c11cIixFPVwiW29iamVjdCBBcnJheV1cIixJPVwiW29iamVjdCBCb29sZWFuXVwiLEo9XCJbb2JqZWN0IERhdGVdXCIsSz1cIltvYmplY3QgRXJyb3JdXCIsRz1cIltvYmplY3QgRnVuY3Rpb25dXCIsTD1cIltvYmplY3QgTnVtYmVyXVwiLHU9XCJbb2JqZWN0IE9iamVjdF1cIixcbk09XCJbb2JqZWN0IFJlZ0V4cF1cIixEPVwiW29iamVjdCBTdHJpbmddXCIsdGE9XCJbb2JqZWN0IEFycmF5QnVmZmVyXVwiLFc9XCJbb2JqZWN0IEZsb2F0MzJBcnJheV1cIixYPVwiW29iamVjdCBGbG9hdDY0QXJyYXldXCIsWT1cIltvYmplY3QgSW50OEFycmF5XVwiLFo9XCJbb2JqZWN0IEludDE2QXJyYXldXCIsJD1cIltvYmplY3QgSW50MzJBcnJheV1cIixhYT1cIltvYmplY3QgVWludDhBcnJheV1cIixiYT1cIltvYmplY3QgVWludDhDbGFtcGVkQXJyYXldXCIsY2E9XCJbb2JqZWN0IFVpbnQxNkFycmF5XVwiLGRhPVwiW29iamVjdCBVaW50MzJBcnJheV1cIix2Yj0vXFwufFxcWyg/OlteW1xcXV0qfChbXCInXSkoPzooPyFcXDEpW15cXG5cXFxcXXxcXFxcLikqP1xcMSlcXF0vLHViPS9eXFx3KiQvLHliPS9bXi5bXFxdXSt8XFxbKD86KC0/XFxkKyg/OlxcLlxcZCspPyl8KFtcIiddKSgoPzooPyFcXDIpW15cXG5cXFxcXXxcXFxcLikqPylcXDIpXFxdL2csemI9L1xcXFwoXFxcXCk/L2cscmI9L1xcdyokLyxGYj0vXlxcW29iamVjdCAuKz9Db25zdHJ1Y3RvclxcXSQvLHRiPS9eXFxkKyQvLFxudmE9XCJjb25zdHJ1Y3RvciBoYXNPd25Qcm9wZXJ0eSBpc1Byb3RvdHlwZU9mIHByb3BlcnR5SXNFbnVtZXJhYmxlIHRvTG9jYWxlU3RyaW5nIHRvU3RyaW5nIHZhbHVlT2ZcIi5zcGxpdChcIiBcIikscT17fTtxW1ddPXFbWF09cVtZXT1xW1pdPXFbJF09cVthYV09cVtiYV09cVtjYV09cVtkYV09dHJ1ZTtxW0hdPXFbRV09cVt0YV09cVtJXT1xW0pdPXFbS109cVtHXT1xW1wiW29iamVjdCBNYXBdXCJdPXFbTF09cVt1XT1xW01dPXFbXCJbb2JqZWN0IFNldF1cIl09cVtEXT1xW1wiW29iamVjdCBXZWFrTWFwXVwiXT1mYWxzZTt2YXIgcj17fTtyW0hdPXJbRV09clt0YV09cltJXT1yW0pdPXJbV109cltYXT1yW1ldPXJbWl09clskXT1yW0xdPXJbdV09cltNXT1yW0RdPXJbYWFdPXJbYmFdPXJbY2FdPXJbZGFdPXRydWU7cltLXT1yW0ddPXJbXCJbb2JqZWN0IE1hcF1cIl09cltcIltvYmplY3QgU2V0XVwiXT1yW1wiW29iamVjdCBXZWFrTWFwXVwiXT1mYWxzZTt2YXIgbGE9e1wiZnVuY3Rpb25cIjp0cnVlLG9iamVjdDp0cnVlfSxtYT1sYVt0eXBlb2YgZXhwb3J0c10mJlxuZXhwb3J0cyYmIWV4cG9ydHMubm9kZVR5cGUmJmV4cG9ydHMsTz1sYVt0eXBlb2YgbW9kdWxlXSYmbW9kdWxlJiYhbW9kdWxlLm5vZGVUeXBlJiZtb2R1bGUsSGI9bGFbdHlwZW9mIHNlbGZdJiZzZWxmJiZzZWxmLk9iamVjdCYmc2VsZixXYT1sYVt0eXBlb2Ygd2luZG93XSYmd2luZG93JiZ3aW5kb3cuT2JqZWN0JiZ3aW5kb3csSWI9TyYmTy5leHBvcnRzPT09bWEmJm1hLHc9bWEmJk8mJnR5cGVvZiBnbG9iYWw9PVwib2JqZWN0XCImJmdsb2JhbCYmZ2xvYmFsLk9iamVjdCYmZ2xvYmFsfHxXYSE9PSh0aGlzJiZ0aGlzLndpbmRvdykmJldhfHxIYnx8dGhpcyxSPWZ1bmN0aW9uKCl7dHJ5e09iamVjdCh7dG9TdHJpbmc6MH0rXCJcIil9Y2F0Y2goYSl7cmV0dXJuIGZ1bmN0aW9uKCl7cmV0dXJuIGZhbHNlfX1yZXR1cm4gZnVuY3Rpb24oYSl7cmV0dXJuIHR5cGVvZiBhLnRvU3RyaW5nIT1cImZ1bmN0aW9uXCImJnR5cGVvZihhK1wiXCIpPT1cInN0cmluZ1wifX0oKSxKYj1BcnJheS5wcm90b3R5cGUsamE9RXJyb3IucHJvdG90eXBlLFxuRj1PYmplY3QucHJvdG90eXBlLEdiPVN0cmluZy5wcm90b3R5cGUsVWE9RnVuY3Rpb24ucHJvdG90eXBlLnRvU3RyaW5nLHY9Ri5oYXNPd25Qcm9wZXJ0eSxCPUYudG9TdHJpbmcsVGE9UmVnRXhwKFwiXlwiK1VhLmNhbGwodikucmVwbGFjZSgvW1xcXFxeJC4qKz8oKVtcXF17fXxdL2csXCJcXFxcJCZcIikucmVwbGFjZSgvaGFzT3duUHJvcGVydHl8KGZ1bmN0aW9uKS4qPyg/PVxcXFxcXCgpfCBmb3IgLis/KD89XFxcXFxcXSkvZyxcIiQxLio/XCIpK1wiJFwiKSxxYj13LkFycmF5QnVmZmVyLGhhPUYucHJvcGVydHlJc0VudW1lcmFibGUsemE9Vih3LFwiU2V0XCIpLFhhPUpiLnNwbGljZSxzYT13LlVpbnQ4QXJyYXkseWE9VihPYmplY3QsXCJjcmVhdGVcIiksQmI9TWF0aC5mbG9vcixLYj1WKEFycmF5LFwiaXNBcnJheVwiKSxZYT1WKE9iamVjdCxcImtleXNcIiksdWE9TWF0aC5tYXgsQ2I9TWF0aC5taW4sRGI9NDI5NDk2NzI5NCxBYj0yMTQ3NDgzNjQ3LFFhPTkwMDcxOTkyNTQ3NDA5OTEsej17fTt6W1ddPXcuRmxvYXQzMkFycmF5O1xueltYXT13LkZsb2F0NjRBcnJheTt6W1ldPXcuSW50OEFycmF5O3pbWl09dy5JbnQxNkFycmF5O3pbJF09dy5JbnQzMkFycmF5O3pbYWFdPXNhO3pbYmFdPXcuVWludDhDbGFtcGVkQXJyYXk7eltjYV09dy5VaW50MTZBcnJheTt6W2RhXT13LlVpbnQzMkFycmF5O3ZhciBzPXt9O3NbRV09c1tKXT1zW0xdPXtjb25zdHJ1Y3Rvcjp0cnVlLHRvTG9jYWxlU3RyaW5nOnRydWUsdG9TdHJpbmc6dHJ1ZSx2YWx1ZU9mOnRydWV9O3NbSV09c1tEXT17Y29uc3RydWN0b3I6dHJ1ZSx0b1N0cmluZzp0cnVlLHZhbHVlT2Y6dHJ1ZX07c1tLXT1zW0ddPXNbTV09e2NvbnN0cnVjdG9yOnRydWUsdG9TdHJpbmc6dHJ1ZX07c1t1XT17Y29uc3RydWN0b3I6dHJ1ZX07QWEodmEsZnVuY3Rpb24oYSl7Zm9yKHZhciBiIGluIHMpaWYodi5jYWxsKHMsYikpe3ZhciBjPXNbYl07Y1thXT12LmNhbGwoYyxhKX19KTt2YXIgUD1tLnN1cHBvcnQ9e307KGZ1bmN0aW9uKGEpe2Z1bmN0aW9uIGIoKXt0aGlzLng9YX12YXIgYz17MDphLGxlbmd0aDphfSxcbmU9W107Yi5wcm90b3R5cGU9e3ZhbHVlT2Y6YSx5OmF9O2Zvcih2YXIgZCBpbiBuZXcgYillLnB1c2goZCk7UC5lbnVtRXJyb3JQcm9wcz1oYS5jYWxsKGphLFwibWVzc2FnZVwiKXx8aGEuY2FsbChqYSxcIm5hbWVcIik7UC5lbnVtUHJvdG90eXBlcz1oYS5jYWxsKGIsXCJwcm90b3R5cGVcIik7UC5ub25FbnVtU2hhZG93cz0hL3ZhbHVlT2YvLnRlc3QoZSk7UC5zcGxpY2VPYmplY3RzPShYYS5jYWxsKGMsMCwxKSwhY1swXSk7UC51bmluZGV4ZWRDaGFycz1cInh4XCIhPVwieFwiWzBdK09iamVjdChcInhcIilbMF19KSgxLDApO3ZhciBIYT1mdW5jdGlvbihhKXtyZXR1cm4gZnVuY3Rpb24oYixjLGUpe3ZhciBkPXkoYik7ZT1lKGIpO2Zvcih2YXIgZj1lLmxlbmd0aCxoPWE/ZjotMTthP2gtLTorK2g8Zjspe3ZhciBnPWVbaF07aWYoZmFsc2U9PT1jKGRbZ10sZyxkKSlicmVha31yZXR1cm4gYn19KCksc2I9TWEoXCJsZW5ndGhcIikseD1LYnx8ZnVuY3Rpb24oYSl7cmV0dXJuIEEoYSkmJk4oYS5sZW5ndGgpJiZCLmNhbGwoYSk9PVxuRX0sd2E9ZnVuY3Rpb24oYSl7cmV0dXJuIGdhKGZ1bmN0aW9uKGIsYyl7dmFyIGU9LTEsZD1udWxsPT1iPzA6Yy5sZW5ndGgsZj0yPGQ/Y1tkLTJdOnAsaD0yPGQ/Y1syXTpwLGc9MTxkP2NbZC0xXTpwO3R5cGVvZiBmPT1cImZ1bmN0aW9uXCI/KGY9b2EoZixnLDUpLGQtPTIpOihmPXR5cGVvZiBnPT1cImZ1bmN0aW9uXCI/ZzpwLGQtPWY/MTowKTtoJiZSYShjWzBdLGNbMV0saCkmJihmPTM+ZD9wOmYsZD0xKTtmb3IoOysrZTxkOykoaD1jW2VdKSYmYShiLGgsZik7cmV0dXJuIGJ9KX0oZnVuY3Rpb24oYSxiLGMpe2lmKGMpZm9yKHZhciBlPS0xLGQ9QyhiKSxmPWQubGVuZ3RoOysrZTxmOyl7dmFyIGg9ZFtlXSxnPWFbaF0sbD1jKGcsYltoXSxoLGEsYik7KGw9PT1sP2w9PT1nOmchPT1nKSYmKGchPT1wfHxoIGluIGEpfHwoYVtoXT1sKX1lbHNlIGE9QmEoYSxiKTtyZXR1cm4gYX0pLExiPWZ1bmN0aW9uKGEsYil7cmV0dXJuIGdhKGZ1bmN0aW9uKGMpe3ZhciBlPWNbMF07aWYobnVsbD09ZSlyZXR1cm4gZTtcbmMucHVzaChiKTtyZXR1cm4gYS5hcHBseShwLGMpfSl9KHdhLGZ1bmN0aW9uKGEsYil7cmV0dXJuIGE9PT1wP2I6YX0pLEM9WWE/ZnVuY3Rpb24oYSl7dmFyIGI9bnVsbD09YT9wOmEuY29uc3RydWN0b3I7cmV0dXJuIHR5cGVvZiBiPT1cImZ1bmN0aW9uXCImJmIucHJvdG90eXBlPT09YXx8KHR5cGVvZiBhPT1cImZ1bmN0aW9uXCI/bS5zdXBwb3J0LmVudW1Qcm90b3R5cGVzOlMoYSkpP1NhKGEpOnQoYSk/WWEoYSk6W119OlNhLE1iPWdhKGZ1bmN0aW9uKGEsYil7aWYobnVsbD09YSlyZXR1cm57fTtpZihcImZ1bmN0aW9uXCIhPXR5cGVvZiBiWzBdKXJldHVybiBiPWFiKEdhKGIpKSx3YihhLGhiKFUoYSksYikpO3ZhciBjPW9hKGJbMF0sYlsxXSwzKTtyZXR1cm4geGIoYSxmdW5jdGlvbihhLGIsZil7cmV0dXJuIWMoYSxiLGYpfSl9KTt4YS5wcm90b3R5cGUucHVzaD1mdW5jdGlvbihhKXt2YXIgYj10aGlzLmRhdGE7dHlwZW9mIGE9PVwic3RyaW5nXCJ8fHQoYSk/Yi5zZXQuYWRkKGEpOmIuaGFzaFthXT1cbiEwfTttLmFzc2lnbj13YTttLmNhbGxiYWNrPWthO20uZGVmYXVsdHM9TGI7bS5rZXlzPUM7bS5rZXlzSW49VTttLm1hdGNoZXM9VmE7bS5vbWl0PU1iO20ucGFpcnM9T2E7bS5wcm9wZXJ0eT1FYTttLnJlbW92ZT1mdW5jdGlvbihhLGIsYyl7dmFyIGU9W107aWYoIWF8fCFhLmxlbmd0aClyZXR1cm4gZTt2YXIgZD0tMSxmPVtdLGg9YS5sZW5ndGgsZz1tLmNhbGxiYWNrfHxrYSxnPWc9PT1rYT9DYTpnO2ZvcihiPWcoYixjLDMpOysrZDxoOyljPWFbZF0sYihjLGQsYSkmJihlLnB1c2goYyksZi5wdXNoKGQpKTtmb3IoYj1hP2YubGVuZ3RoOjA7Yi0tOylpZihkPWZbYl0sZCE9bCYmZWEoZCkpe3ZhciBsPWQ7WGEuY2FsbChhLGQsMSl9cmV0dXJuIGV9O20ucmVzdFBhcmFtPWdhO20uZXh0ZW5kPXdhO20uaXRlcmF0ZWU9a2E7bS5pZGVudGl0eT1RO20uaW5kZXhPZj1wYTttLmlzQXJndW1lbnRzPVQ7bS5pc0FycmF5PXg7bS5pc0Z1bmN0aW9uPWlhO20uaXNOYXRpdmU9UGE7bS5pc09iamVjdD1cbnQ7bS5pc1N0cmluZz1mYTttLmlzVHlwZWRBcnJheT1yYTttLmxhc3Q9TGE7bS5WRVJTSU9OPVwiMy4xMC4xXCI7bWEmJk8mJkliJiYoKE8uZXhwb3J0cz1tKS5fPW0pfS5jYWxsKHRoaXMpKTsiXX0=
