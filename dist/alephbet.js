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

store = new Basil({
  namespace: null
});

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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYmFzaWwuanMvYnVpbGQvYmFzaWwuanMiLCJub2RlX21vZHVsZXMvY3J5cHRvLWpzL2NvcmUuanMiLCJub2RlX21vZHVsZXMvY3J5cHRvLWpzL3NoYTEuanMiLCJub2RlX21vZHVsZXMvbm9kZS11dWlkL3V1aWQuanMiLCJzcmMvYWRhcHRlcnMuY29mZmVlIiwic3JjL2FsZXBoYmV0LmNvZmZlZSIsInNyYy9vcHRpb25zLmNvZmZlZSIsInNyYy9zdG9yYWdlLmNvZmZlZSIsInNyYy91dGlscy5jb2ZmZWUiLCJ2ZW5kb3IvbG9kYXNoLmN1c3RvbS5taW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvWUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdnZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOVZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbiAoKSB7XG5cdC8vIEJhc2lsXG5cdHZhciBCYXNpbCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG5cdFx0cmV0dXJuIEJhc2lsLnV0aWxzLmV4dGVuZCh7fSwgQmFzaWwucGx1Z2lucywgbmV3IEJhc2lsLlN0b3JhZ2UoKS5pbml0KG9wdGlvbnMpKTtcblx0fTtcblxuXHQvLyBWZXJzaW9uXG5cdEJhc2lsLnZlcnNpb24gPSAnMC40LjEwJztcblxuXHQvLyBVdGlsc1xuXHRCYXNpbC51dGlscyA9IHtcblx0XHRleHRlbmQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdHZhciBkZXN0aW5hdGlvbiA9IHR5cGVvZiBhcmd1bWVudHNbMF0gPT09ICdvYmplY3QnID8gYXJndW1lbnRzWzBdIDoge307XG5cdFx0XHRmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZiAoYXJndW1lbnRzW2ldICYmIHR5cGVvZiBhcmd1bWVudHNbaV0gPT09ICdvYmplY3QnKVxuXHRcdFx0XHRcdGZvciAodmFyIHByb3BlcnR5IGluIGFyZ3VtZW50c1tpXSlcblx0XHRcdFx0XHRcdGRlc3RpbmF0aW9uW3Byb3BlcnR5XSA9IGFyZ3VtZW50c1tpXVtwcm9wZXJ0eV07XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZGVzdGluYXRpb247XG5cdFx0fSxcblx0XHRlYWNoOiBmdW5jdGlvbiAob2JqLCBmbkl0ZXJhdG9yLCBjb250ZXh0KSB7XG5cdFx0XHRpZiAodGhpcy5pc0FycmF5KG9iaikpIHtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBvYmoubGVuZ3RoOyBpKyspXG5cdFx0XHRcdFx0aWYgKGZuSXRlcmF0b3IuY2FsbChjb250ZXh0LCBvYmpbaV0sIGkpID09PSBmYWxzZSkgcmV0dXJuO1xuXHRcdFx0fSBlbHNlIGlmIChvYmopIHtcblx0XHRcdFx0Zm9yICh2YXIga2V5IGluIG9iailcblx0XHRcdFx0XHRpZiAoZm5JdGVyYXRvci5jYWxsKGNvbnRleHQsIG9ialtrZXldLCBrZXkpID09PSBmYWxzZSkgcmV0dXJuO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0dHJ5RWFjaDogZnVuY3Rpb24gKG9iaiwgZm5JdGVyYXRvciwgZm5FcnJvciwgY29udGV4dCkge1xuXHRcdFx0dGhpcy5lYWNoKG9iaiwgZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRyZXR1cm4gZm5JdGVyYXRvci5jYWxsKGNvbnRleHQsIHZhbHVlLCBrZXkpO1xuXHRcdFx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0XHRcdGlmICh0aGlzLmlzRnVuY3Rpb24oZm5FcnJvcikpIHtcblx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdGZuRXJyb3IuY2FsbChjb250ZXh0LCB2YWx1ZSwga2V5LCBlcnJvcik7XG5cdFx0XHRcdFx0XHR9IGNhdGNoIChlcnJvcikge31cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0sIHRoaXMpO1xuXHRcdH0sXG5cdFx0cmVnaXN0ZXJQbHVnaW46IGZ1bmN0aW9uIChtZXRob2RzKSB7XG5cdFx0XHRCYXNpbC5wbHVnaW5zID0gdGhpcy5leHRlbmQobWV0aG9kcywgQmFzaWwucGx1Z2lucyk7XG5cdFx0fSxcblx0XHRnZXRUeXBlT2Y6IGZ1bmN0aW9uIChvYmopIHtcblx0XHRcdGlmICh0eXBlb2Ygb2JqID09PSAndW5kZWZpbmVkJyB8fCBvYmogPT09IG51bGwpXG5cdFx0XHRcdHJldHVybiAnJyArIG9iajtcblx0XHRcdHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKS5yZXBsYWNlKC9eXFxbb2JqZWN0XFxzKC4qKVxcXSQvLCBmdW5jdGlvbiAoJDAsICQxKSB7IHJldHVybiAkMS50b0xvd2VyQ2FzZSgpOyB9KTtcblx0XHR9XG5cdH07XG5cblx0Ly8gQWRkIHNvbWUgaXNUeXBlIG1ldGhvZHM6IGlzQXJndW1lbnRzLCBpc0Jvb2xlYW4sIGlzRnVuY3Rpb24sIGlzU3RyaW5nLCBpc0FycmF5LCBpc051bWJlciwgaXNEYXRlLCBpc1JlZ0V4cCwgaXNVbmRlZmluZWQsIGlzTnVsbC5cblx0dmFyIHR5cGVzID0gWydBcmd1bWVudHMnLCAnQm9vbGVhbicsICdGdW5jdGlvbicsICdTdHJpbmcnLCAnQXJyYXknLCAnTnVtYmVyJywgJ0RhdGUnLCAnUmVnRXhwJywgJ1VuZGVmaW5lZCcsICdOdWxsJ107XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgdHlwZXMubGVuZ3RoOyBpKyspIHtcblx0XHRCYXNpbC51dGlsc1snaXMnICsgdHlwZXNbaV1dID0gKGZ1bmN0aW9uICh0eXBlKSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24gKG9iaikge1xuXHRcdFx0XHRyZXR1cm4gQmFzaWwudXRpbHMuZ2V0VHlwZU9mKG9iaikgPT09IHR5cGUudG9Mb3dlckNhc2UoKTtcblx0XHRcdH07XG5cdFx0fSkodHlwZXNbaV0pO1xuXHR9XG5cblx0Ly8gUGx1Z2luc1xuXHRCYXNpbC5wbHVnaW5zID0ge307XG5cblx0Ly8gT3B0aW9uc1xuXHRCYXNpbC5vcHRpb25zID0gQmFzaWwudXRpbHMuZXh0ZW5kKHtcblx0XHRuYW1lc3BhY2U6ICdiNDVpMScsXG5cdFx0c3RvcmFnZXM6IFsnbG9jYWwnLCAnY29va2llJywgJ3Nlc3Npb24nLCAnbWVtb3J5J10sXG5cdFx0ZXhwaXJlRGF5czogMzY1LFxuXHRcdGtleURlbGltaXRlcjogJy4nXG5cdH0sIHdpbmRvdy5CYXNpbCA/IHdpbmRvdy5CYXNpbC5vcHRpb25zIDoge30pO1xuXG5cdC8vIFN0b3JhZ2Vcblx0QmFzaWwuU3RvcmFnZSA9IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgX3NhbHQgPSAnYjQ1aTEnICsgKE1hdGgucmFuZG9tKCkgKyAxKVxuXHRcdFx0XHQudG9TdHJpbmcoMzYpXG5cdFx0XHRcdC5zdWJzdHJpbmcoNyksXG5cdFx0XHRfc3RvcmFnZXMgPSB7fSxcblx0XHRcdF9pc1ZhbGlkS2V5ID0gZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0XHR2YXIgdHlwZSA9IEJhc2lsLnV0aWxzLmdldFR5cGVPZihrZXkpO1xuXHRcdFx0XHRyZXR1cm4gKHR5cGUgPT09ICdzdHJpbmcnICYmIGtleSkgfHwgdHlwZSA9PT0gJ251bWJlcicgfHwgdHlwZSA9PT0gJ2Jvb2xlYW4nO1xuXHRcdFx0fSxcblx0XHRcdF90b1N0b3JhZ2VzQXJyYXkgPSBmdW5jdGlvbiAoc3RvcmFnZXMpIHtcblx0XHRcdFx0aWYgKEJhc2lsLnV0aWxzLmlzQXJyYXkoc3RvcmFnZXMpKVxuXHRcdFx0XHRcdHJldHVybiBzdG9yYWdlcztcblx0XHRcdFx0cmV0dXJuIEJhc2lsLnV0aWxzLmlzU3RyaW5nKHN0b3JhZ2VzKSA/IFtzdG9yYWdlc10gOiBbXTtcblx0XHRcdH0sXG5cdFx0XHRfdG9TdG9yZWRLZXkgPSBmdW5jdGlvbiAobmFtZXNwYWNlLCBwYXRoLCBkZWxpbWl0ZXIpIHtcblx0XHRcdFx0dmFyIGtleSA9ICcnO1xuXHRcdFx0XHRpZiAoX2lzVmFsaWRLZXkocGF0aCkpIHtcblx0XHRcdFx0XHRrZXkgKz0gcGF0aDtcblx0XHRcdFx0fSBlbHNlIGlmIChCYXNpbC51dGlscy5pc0FycmF5KHBhdGgpKSB7XG5cdFx0XHRcdFx0cGF0aCA9IEJhc2lsLnV0aWxzLmlzRnVuY3Rpb24ocGF0aC5maWx0ZXIpID8gcGF0aC5maWx0ZXIoX2lzVmFsaWRLZXkpIDogcGF0aDtcblx0XHRcdFx0XHRrZXkgPSBwYXRoLmpvaW4oZGVsaW1pdGVyKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4ga2V5ICYmIF9pc1ZhbGlkS2V5KG5hbWVzcGFjZSkgPyBuYW1lc3BhY2UgKyBkZWxpbWl0ZXIgKyBrZXkgOiBrZXk7XG4gXHRcdFx0fSxcblx0XHRcdF90b0tleU5hbWUgPSBmdW5jdGlvbiAobmFtZXNwYWNlLCBrZXksIGRlbGltaXRlcikge1xuXHRcdFx0XHRpZiAoIV9pc1ZhbGlkS2V5KG5hbWVzcGFjZSkpXG5cdFx0XHRcdFx0cmV0dXJuIGtleTtcblx0XHRcdFx0cmV0dXJuIGtleS5yZXBsYWNlKG5ldyBSZWdFeHAoJ14nICsgbmFtZXNwYWNlICsgZGVsaW1pdGVyKSwgJycpO1xuXHRcdFx0fSxcblx0XHRcdF90b1N0b3JlZFZhbHVlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG5cdFx0XHRcdHJldHVybiBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG5cdFx0XHR9LFxuXHRcdFx0X2Zyb21TdG9yZWRWYWx1ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuXHRcdFx0XHRyZXR1cm4gdmFsdWUgPyBKU09OLnBhcnNlKHZhbHVlKSA6IG51bGw7XG5cdFx0XHR9O1xuXG5cdFx0Ly8gSFRNTDUgd2ViIHN0b3JhZ2UgaW50ZXJmYWNlXG5cdFx0dmFyIHdlYlN0b3JhZ2VJbnRlcmZhY2UgPSB7XG5cdFx0XHRlbmdpbmU6IG51bGwsXG5cdFx0XHRjaGVjazogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdHdpbmRvd1t0aGlzLmVuZ2luZV0uc2V0SXRlbShfc2FsdCwgdHJ1ZSk7XG5cdFx0XHRcdFx0d2luZG93W3RoaXMuZW5naW5lXS5yZW1vdmVJdGVtKF9zYWx0KTtcblx0XHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH0sXG5cdFx0XHRzZXQ6IGZ1bmN0aW9uIChrZXksIHZhbHVlLCBvcHRpb25zKSB7XG5cdFx0XHRcdGlmICgha2V5KVxuXHRcdFx0XHRcdHRocm93IEVycm9yKCdpbnZhbGlkIGtleScpO1xuXHRcdFx0XHR3aW5kb3dbdGhpcy5lbmdpbmVdLnNldEl0ZW0oa2V5LCB2YWx1ZSk7XG5cdFx0XHR9LFxuXHRcdFx0Z2V0OiBmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHRcdHJldHVybiB3aW5kb3dbdGhpcy5lbmdpbmVdLmdldEl0ZW0oa2V5KTtcblx0XHRcdH0sXG5cdFx0XHRyZW1vdmU6IGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdFx0d2luZG93W3RoaXMuZW5naW5lXS5yZW1vdmVJdGVtKGtleSk7XG5cdFx0XHR9LFxuXHRcdFx0cmVzZXQ6IGZ1bmN0aW9uIChuYW1lc3BhY2UpIHtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDAsIGtleTsgaSA8IHdpbmRvd1t0aGlzLmVuZ2luZV0ubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRrZXkgPSB3aW5kb3dbdGhpcy5lbmdpbmVdLmtleShpKTtcblx0XHRcdFx0XHRpZiAoIW5hbWVzcGFjZSB8fCBrZXkuaW5kZXhPZihuYW1lc3BhY2UpID09PSAwKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnJlbW92ZShrZXkpO1xuXHRcdFx0XHRcdFx0aS0tO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdGtleXM6IGZ1bmN0aW9uIChuYW1lc3BhY2UsIGRlbGltaXRlcikge1xuXHRcdFx0XHR2YXIga2V5cyA9IFtdO1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMCwga2V5OyBpIDwgd2luZG93W3RoaXMuZW5naW5lXS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdGtleSA9IHdpbmRvd1t0aGlzLmVuZ2luZV0ua2V5KGkpO1xuXHRcdFx0XHRcdGlmICghbmFtZXNwYWNlIHx8IGtleS5pbmRleE9mKG5hbWVzcGFjZSkgPT09IDApXG5cdFx0XHRcdFx0XHRrZXlzLnB1c2goX3RvS2V5TmFtZShuYW1lc3BhY2UsIGtleSwgZGVsaW1pdGVyKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIGtleXM7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdC8vIGxvY2FsIHN0b3JhZ2Vcblx0XHRfc3RvcmFnZXMubG9jYWwgPSBCYXNpbC51dGlscy5leHRlbmQoe30sIHdlYlN0b3JhZ2VJbnRlcmZhY2UsIHtcblx0XHRcdGVuZ2luZTogJ2xvY2FsU3RvcmFnZSdcblx0XHR9KTtcblx0XHQvLyBzZXNzaW9uIHN0b3JhZ2Vcblx0XHRfc3RvcmFnZXMuc2Vzc2lvbiA9IEJhc2lsLnV0aWxzLmV4dGVuZCh7fSwgd2ViU3RvcmFnZUludGVyZmFjZSwge1xuXHRcdFx0ZW5naW5lOiAnc2Vzc2lvblN0b3JhZ2UnXG5cdFx0fSk7XG5cblx0XHQvLyBtZW1vcnkgc3RvcmFnZVxuXHRcdF9zdG9yYWdlcy5tZW1vcnkgPSB7XG5cdFx0XHRfaGFzaDoge30sXG5cdFx0XHRjaGVjazogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH0sXG5cdFx0XHRzZXQ6IGZ1bmN0aW9uIChrZXksIHZhbHVlLCBvcHRpb25zKSB7XG5cdFx0XHRcdGlmICgha2V5KVxuXHRcdFx0XHRcdHRocm93IEVycm9yKCdpbnZhbGlkIGtleScpO1xuXHRcdFx0XHR0aGlzLl9oYXNoW2tleV0gPSB2YWx1ZTtcblx0XHRcdH0sXG5cdFx0XHRnZXQ6IGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuX2hhc2hba2V5XSB8fCBudWxsO1xuXHRcdFx0fSxcblx0XHRcdHJlbW92ZTogZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0XHRkZWxldGUgdGhpcy5faGFzaFtrZXldO1xuXHRcdFx0fSxcblx0XHRcdHJlc2V0OiBmdW5jdGlvbiAobmFtZXNwYWNlKSB7XG5cdFx0XHRcdGZvciAodmFyIGtleSBpbiB0aGlzLl9oYXNoKSB7XG5cdFx0XHRcdFx0aWYgKCFuYW1lc3BhY2UgfHwga2V5LmluZGV4T2YobmFtZXNwYWNlKSA9PT0gMClcblx0XHRcdFx0XHRcdHRoaXMucmVtb3ZlKGtleSk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRrZXlzOiBmdW5jdGlvbiAobmFtZXNwYWNlLCBkZWxpbWl0ZXIpIHtcblx0XHRcdFx0dmFyIGtleXMgPSBbXTtcblx0XHRcdFx0Zm9yICh2YXIga2V5IGluIHRoaXMuX2hhc2gpXG5cdFx0XHRcdFx0aWYgKCFuYW1lc3BhY2UgfHwga2V5LmluZGV4T2YobmFtZXNwYWNlKSA9PT0gMClcblx0XHRcdFx0XHRcdGtleXMucHVzaChfdG9LZXlOYW1lKG5hbWVzcGFjZSwga2V5LCBkZWxpbWl0ZXIpKTtcblx0XHRcdFx0cmV0dXJuIGtleXM7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdC8vIGNvb2tpZSBzdG9yYWdlXG5cdFx0X3N0b3JhZ2VzLmNvb2tpZSA9IHtcblx0XHRcdGNoZWNrOiBmdW5jdGlvbiAob3B0aW9ucykge1xuXHRcdFx0XHRpZiAoIW5hdmlnYXRvci5jb29raWVFbmFibGVkKVxuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0aWYgKHdpbmRvdy5zZWxmICE9PSB3aW5kb3cudG9wKSB7XG5cdFx0XHRcdFx0Ly8gd2UgbmVlZCB0byBjaGVjayB0aGlyZC1wYXJ0eSBjb29raWVzO1xuXHRcdFx0XHRcdHZhciBjb29raWUgPSAndGhpcmRwYXJ0eS5jaGVjaz0nICsgTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogMTAwMCk7XG5cdFx0XHRcdFx0ZG9jdW1lbnQuY29va2llID0gY29va2llICsgJzsgcGF0aD0vJztcblx0XHRcdFx0XHRyZXR1cm4gZG9jdW1lbnQuY29va2llLmluZGV4T2YoY29va2llKSAhPT0gLTE7XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gaWYgY29va2llIHNlY3VyZSBhY3RpdmF0ZWQsIGVuc3VyZSBpdCB3b3JrcyAobm90IHRoZSBjYXNlIGlmIHdlIGFyZSBpbiBodHRwIG9ubHkpXG5cdFx0XHRcdGlmIChvcHRpb25zICYmIG9wdGlvbnMuc2VjdXJlKSB7XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdHRoaXMuc2V0KF9zYWx0LCBfc2FsdCwgb3B0aW9ucyk7XG5cdFx0XHRcdFx0XHR2YXIgaGFzU2VjdXJlbHlQZXJzaXRlZCA9IHRoaXMuZ2V0KF9zYWx0KSA9PT0gX3NhbHQ7XG5cdFx0XHRcdFx0XHR0aGlzLnJlbW92ZShfc2FsdCk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gaGFzU2VjdXJlbHlQZXJzaXRlZDtcblx0XHRcdFx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH0sXG5cdFx0XHRzZXQ6IGZ1bmN0aW9uIChrZXksIHZhbHVlLCBvcHRpb25zKSB7XG5cdFx0XHRcdGlmICghdGhpcy5jaGVjaygpKVxuXHRcdFx0XHRcdHRocm93IEVycm9yKCdjb29raWVzIGFyZSBkaXNhYmxlZCcpO1xuXHRcdFx0XHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0XHRcdFx0aWYgKCFrZXkpXG5cdFx0XHRcdFx0dGhyb3cgRXJyb3IoJ2ludmFsaWQga2V5Jyk7XG5cdFx0XHRcdHZhciBjb29raWUgPSBlbmNvZGVVUklDb21wb25lbnQoa2V5KSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSk7XG5cdFx0XHRcdC8vIGhhbmRsZSBleHBpcmF0aW9uIGRheXNcblx0XHRcdFx0aWYgKG9wdGlvbnMuZXhwaXJlRGF5cykge1xuXHRcdFx0XHRcdHZhciBkYXRlID0gbmV3IERhdGUoKTtcblx0XHRcdFx0XHRkYXRlLnNldFRpbWUoZGF0ZS5nZXRUaW1lKCkgKyAob3B0aW9ucy5leHBpcmVEYXlzICogMjQgKiA2MCAqIDYwICogMTAwMCkpO1xuXHRcdFx0XHRcdGNvb2tpZSArPSAnOyBleHBpcmVzPScgKyBkYXRlLnRvR01UU3RyaW5nKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gaGFuZGxlIGRvbWFpblxuXHRcdFx0XHRpZiAob3B0aW9ucy5kb21haW4gJiYgb3B0aW9ucy5kb21haW4gIT09IGRvY3VtZW50LmRvbWFpbikge1xuXHRcdFx0XHRcdHZhciBfZG9tYWluID0gb3B0aW9ucy5kb21haW4ucmVwbGFjZSgvXlxcLi8sICcnKTtcblx0XHRcdFx0XHRpZiAoZG9jdW1lbnQuZG9tYWluLmluZGV4T2YoX2RvbWFpbikgPT09IC0xIHx8IF9kb21haW4uc3BsaXQoJy4nKS5sZW5ndGggPD0gMSlcblx0XHRcdFx0XHRcdHRocm93IEVycm9yKCdpbnZhbGlkIGRvbWFpbicpO1xuXHRcdFx0XHRcdGNvb2tpZSArPSAnOyBkb21haW49JyArIG9wdGlvbnMuZG9tYWluO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIGhhbmRsZSBzZWN1cmVcblx0XHRcdFx0aWYgKG9wdGlvbnMuc2VjdXJlID09PSB0cnVlKSB7XG5cdFx0XHRcdFx0Y29va2llICs9ICc7IFNlY3VyZSc7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZG9jdW1lbnQuY29va2llID0gY29va2llICsgJzsgcGF0aD0vJztcblx0XHRcdH0sXG5cdFx0XHRnZXQ6IGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdFx0aWYgKCF0aGlzLmNoZWNrKCkpXG5cdFx0XHRcdFx0dGhyb3cgRXJyb3IoJ2Nvb2tpZXMgYXJlIGRpc2FibGVkJyk7XG5cdFx0XHRcdHZhciBlbmNvZGVkS2V5ID0gZW5jb2RlVVJJQ29tcG9uZW50KGtleSk7XG5cdFx0XHRcdHZhciBjb29raWVzID0gZG9jdW1lbnQuY29va2llID8gZG9jdW1lbnQuY29va2llLnNwbGl0KCc7JykgOiBbXTtcblx0XHRcdFx0Ly8gcmV0cmlldmUgbGFzdCB1cGRhdGVkIGNvb2tpZSBmaXJzdFxuXHRcdFx0XHRmb3IgKHZhciBpID0gY29va2llcy5sZW5ndGggLSAxLCBjb29raWU7IGkgPj0gMDsgaS0tKSB7XG5cdFx0XHRcdFx0Y29va2llID0gY29va2llc1tpXS5yZXBsYWNlKC9eXFxzKi8sICcnKTtcblx0XHRcdFx0XHRpZiAoY29va2llLmluZGV4T2YoZW5jb2RlZEtleSArICc9JykgPT09IDApXG5cdFx0XHRcdFx0XHRyZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KGNvb2tpZS5zdWJzdHJpbmcoZW5jb2RlZEtleS5sZW5ndGggKyAxLCBjb29raWUubGVuZ3RoKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHR9LFxuXHRcdFx0cmVtb3ZlOiBmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHRcdC8vIHJlbW92ZSBjb29raWUgZnJvbSBtYWluIGRvbWFpblxuXHRcdFx0XHR0aGlzLnNldChrZXksICcnLCB7IGV4cGlyZURheXM6IC0xIH0pO1xuXHRcdFx0XHQvLyByZW1vdmUgY29va2llIGZyb20gdXBwZXIgZG9tYWluc1xuXHRcdFx0XHR2YXIgZG9tYWluUGFydHMgPSBkb2N1bWVudC5kb21haW4uc3BsaXQoJy4nKTtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IGRvbWFpblBhcnRzLmxlbmd0aDsgaSA+IDE7IGktLSkge1xuXHRcdFx0XHRcdHRoaXMuc2V0KGtleSwgJycsIHsgZXhwaXJlRGF5czogLTEsIGRvbWFpbjogJy4nICsgZG9tYWluUGFydHMuc2xpY2UoLSBpKS5qb2luKCcuJykgfSk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRyZXNldDogZnVuY3Rpb24gKG5hbWVzcGFjZSkge1xuXHRcdFx0XHR2YXIgY29va2llcyA9IGRvY3VtZW50LmNvb2tpZSA/IGRvY3VtZW50LmNvb2tpZS5zcGxpdCgnOycpIDogW107XG5cdFx0XHRcdGZvciAodmFyIGkgPSAwLCBjb29raWUsIGtleTsgaSA8IGNvb2tpZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRjb29raWUgPSBjb29raWVzW2ldLnJlcGxhY2UoL15cXHMqLywgJycpO1xuXHRcdFx0XHRcdGtleSA9IGNvb2tpZS5zdWJzdHIoMCwgY29va2llLmluZGV4T2YoJz0nKSk7XG5cdFx0XHRcdFx0aWYgKCFuYW1lc3BhY2UgfHwga2V5LmluZGV4T2YobmFtZXNwYWNlKSA9PT0gMClcblx0XHRcdFx0XHRcdHRoaXMucmVtb3ZlKGtleSk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRrZXlzOiBmdW5jdGlvbiAobmFtZXNwYWNlLCBkZWxpbWl0ZXIpIHtcblx0XHRcdFx0aWYgKCF0aGlzLmNoZWNrKCkpXG5cdFx0XHRcdFx0dGhyb3cgRXJyb3IoJ2Nvb2tpZXMgYXJlIGRpc2FibGVkJyk7XG5cdFx0XHRcdHZhciBrZXlzID0gW10sXG5cdFx0XHRcdFx0Y29va2llcyA9IGRvY3VtZW50LmNvb2tpZSA/IGRvY3VtZW50LmNvb2tpZS5zcGxpdCgnOycpIDogW107XG5cdFx0XHRcdGZvciAodmFyIGkgPSAwLCBjb29raWUsIGtleTsgaSA8IGNvb2tpZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRjb29raWUgPSBjb29raWVzW2ldLnJlcGxhY2UoL15cXHMqLywgJycpO1xuXHRcdFx0XHRcdGtleSA9IGRlY29kZVVSSUNvbXBvbmVudChjb29raWUuc3Vic3RyKDAsIGNvb2tpZS5pbmRleE9mKCc9JykpKTtcblx0XHRcdFx0XHRpZiAoIW5hbWVzcGFjZSB8fCBrZXkuaW5kZXhPZihuYW1lc3BhY2UpID09PSAwKVxuXHRcdFx0XHRcdFx0a2V5cy5wdXNoKF90b0tleU5hbWUobmFtZXNwYWNlLCBrZXksIGRlbGltaXRlcikpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBrZXlzO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0aW5pdDogZnVuY3Rpb24gKG9wdGlvbnMpIHtcblx0XHRcdFx0dGhpcy5zZXRPcHRpb25zKG9wdGlvbnMpO1xuXHRcdFx0XHRyZXR1cm4gdGhpcztcblx0XHRcdH0sXG5cdFx0XHRzZXRPcHRpb25zOiBmdW5jdGlvbiAob3B0aW9ucykge1xuXHRcdFx0XHR0aGlzLm9wdGlvbnMgPSBCYXNpbC51dGlscy5leHRlbmQoe30sIHRoaXMub3B0aW9ucyB8fCBCYXNpbC5vcHRpb25zLCBvcHRpb25zKTtcblx0XHRcdH0sXG5cdFx0XHRzdXBwb3J0OiBmdW5jdGlvbiAoc3RvcmFnZSkge1xuXHRcdFx0XHRyZXR1cm4gX3N0b3JhZ2VzLmhhc093blByb3BlcnR5KHN0b3JhZ2UpO1xuXHRcdFx0fSxcblx0XHRcdGNoZWNrOiBmdW5jdGlvbiAoc3RvcmFnZSkge1xuXHRcdFx0XHRpZiAodGhpcy5zdXBwb3J0KHN0b3JhZ2UpKVxuXHRcdFx0XHRcdHJldHVybiBfc3RvcmFnZXNbc3RvcmFnZV0uY2hlY2sodGhpcy5vcHRpb25zKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fSxcblx0XHRcdHNldDogZnVuY3Rpb24gKGtleSwgdmFsdWUsIG9wdGlvbnMpIHtcblx0XHRcdFx0b3B0aW9ucyA9IEJhc2lsLnV0aWxzLmV4dGVuZCh7fSwgdGhpcy5vcHRpb25zLCBvcHRpb25zKTtcblx0XHRcdFx0aWYgKCEoa2V5ID0gX3RvU3RvcmVkS2V5KG9wdGlvbnMubmFtZXNwYWNlLCBrZXksIG9wdGlvbnMua2V5RGVsaW1pdGVyKSkpXG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR2YWx1ZSA9IG9wdGlvbnMucmF3ID09PSB0cnVlID8gdmFsdWUgOiBfdG9TdG9yZWRWYWx1ZSh2YWx1ZSk7XG5cdFx0XHRcdHZhciB3aGVyZSA9IG51bGw7XG5cdFx0XHRcdC8vIHRyeSB0byBzZXQga2V5L3ZhbHVlIGluIGZpcnN0IGF2YWlsYWJsZSBzdG9yYWdlXG5cdFx0XHRcdEJhc2lsLnV0aWxzLnRyeUVhY2goX3RvU3RvcmFnZXNBcnJheShvcHRpb25zLnN0b3JhZ2VzKSwgZnVuY3Rpb24gKHN0b3JhZ2UsIGluZGV4KSB7XG5cdFx0XHRcdFx0X3N0b3JhZ2VzW3N0b3JhZ2VdLnNldChrZXksIHZhbHVlLCBvcHRpb25zKTtcblx0XHRcdFx0XHR3aGVyZSA9IHN0b3JhZ2U7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlOyAvLyBicmVhaztcblx0XHRcdFx0fSwgbnVsbCwgdGhpcyk7XG5cdFx0XHRcdGlmICghd2hlcmUpIHtcblx0XHRcdFx0XHQvLyBrZXkgaGFzIG5vdCBiZWVuIHNldCBhbnl3aGVyZVxuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyByZW1vdmUga2V5IGZyb20gYWxsIG90aGVyIHN0b3JhZ2VzXG5cdFx0XHRcdEJhc2lsLnV0aWxzLnRyeUVhY2goX3RvU3RvcmFnZXNBcnJheShvcHRpb25zLnN0b3JhZ2VzKSwgZnVuY3Rpb24gKHN0b3JhZ2UsIGluZGV4KSB7XG5cdFx0XHRcdFx0aWYgKHN0b3JhZ2UgIT09IHdoZXJlKVxuXHRcdFx0XHRcdFx0X3N0b3JhZ2VzW3N0b3JhZ2VdLnJlbW92ZShrZXkpO1xuXHRcdFx0XHR9LCBudWxsLCB0aGlzKTtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9LFxuXHRcdFx0Z2V0OiBmdW5jdGlvbiAoa2V5LCBvcHRpb25zKSB7XG5cdFx0XHRcdG9wdGlvbnMgPSBCYXNpbC51dGlscy5leHRlbmQoe30sIHRoaXMub3B0aW9ucywgb3B0aW9ucyk7XG5cdFx0XHRcdGlmICghKGtleSA9IF90b1N0b3JlZEtleShvcHRpb25zLm5hbWVzcGFjZSwga2V5LCBvcHRpb25zLmtleURlbGltaXRlcikpKVxuXHRcdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0XHR2YXIgdmFsdWUgPSBudWxsO1xuXHRcdFx0XHRCYXNpbC51dGlscy50cnlFYWNoKF90b1N0b3JhZ2VzQXJyYXkob3B0aW9ucy5zdG9yYWdlcyksIGZ1bmN0aW9uIChzdG9yYWdlLCBpbmRleCkge1xuXHRcdFx0XHRcdGlmICh2YWx1ZSAhPT0gbnVsbClcblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTsgLy8gYnJlYWsgaWYgYSB2YWx1ZSBoYXMgYWxyZWFkeSBiZWVuIGZvdW5kLlxuXHRcdFx0XHRcdHZhbHVlID0gX3N0b3JhZ2VzW3N0b3JhZ2VdLmdldChrZXksIG9wdGlvbnMpIHx8IG51bGw7XG5cdFx0XHRcdFx0dmFsdWUgPSBvcHRpb25zLnJhdyA9PT0gdHJ1ZSA/IHZhbHVlIDogX2Zyb21TdG9yZWRWYWx1ZSh2YWx1ZSk7XG5cdFx0XHRcdH0sIGZ1bmN0aW9uIChzdG9yYWdlLCBpbmRleCwgZXJyb3IpIHtcblx0XHRcdFx0XHR2YWx1ZSA9IG51bGw7XG5cdFx0XHRcdH0sIHRoaXMpO1xuXHRcdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0XHR9LFxuXHRcdFx0cmVtb3ZlOiBmdW5jdGlvbiAoa2V5LCBvcHRpb25zKSB7XG5cdFx0XHRcdG9wdGlvbnMgPSBCYXNpbC51dGlscy5leHRlbmQoe30sIHRoaXMub3B0aW9ucywgb3B0aW9ucyk7XG5cdFx0XHRcdGlmICghKGtleSA9IF90b1N0b3JlZEtleShvcHRpb25zLm5hbWVzcGFjZSwga2V5LCBvcHRpb25zLmtleURlbGltaXRlcikpKVxuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0QmFzaWwudXRpbHMudHJ5RWFjaChfdG9TdG9yYWdlc0FycmF5KG9wdGlvbnMuc3RvcmFnZXMpLCBmdW5jdGlvbiAoc3RvcmFnZSkge1xuXHRcdFx0XHRcdF9zdG9yYWdlc1tzdG9yYWdlXS5yZW1vdmUoa2V5KTtcblx0XHRcdFx0fSwgbnVsbCwgdGhpcyk7XG5cdFx0XHR9LFxuXHRcdFx0cmVzZXQ6IGZ1bmN0aW9uIChvcHRpb25zKSB7XG5cdFx0XHRcdG9wdGlvbnMgPSBCYXNpbC51dGlscy5leHRlbmQoe30sIHRoaXMub3B0aW9ucywgb3B0aW9ucyk7XG5cdFx0XHRcdEJhc2lsLnV0aWxzLnRyeUVhY2goX3RvU3RvcmFnZXNBcnJheShvcHRpb25zLnN0b3JhZ2VzKSwgZnVuY3Rpb24gKHN0b3JhZ2UpIHtcblx0XHRcdFx0XHRfc3RvcmFnZXNbc3RvcmFnZV0ucmVzZXQob3B0aW9ucy5uYW1lc3BhY2UpO1xuXHRcdFx0XHR9LCBudWxsLCB0aGlzKTtcblx0XHRcdH0sXG5cdFx0XHRrZXlzOiBmdW5jdGlvbiAob3B0aW9ucykge1xuXHRcdFx0XHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0XHRcdFx0dmFyIGtleXMgPSBbXTtcblx0XHRcdFx0Zm9yICh2YXIga2V5IGluIHRoaXMua2V5c01hcChvcHRpb25zKSlcblx0XHRcdFx0XHRrZXlzLnB1c2goa2V5KTtcblx0XHRcdFx0cmV0dXJuIGtleXM7XG5cdFx0XHR9LFxuXHRcdFx0a2V5c01hcDogZnVuY3Rpb24gKG9wdGlvbnMpIHtcblx0XHRcdFx0b3B0aW9ucyA9IEJhc2lsLnV0aWxzLmV4dGVuZCh7fSwgdGhpcy5vcHRpb25zLCBvcHRpb25zKTtcblx0XHRcdFx0dmFyIG1hcCA9IHt9O1xuXHRcdFx0XHRCYXNpbC51dGlscy50cnlFYWNoKF90b1N0b3JhZ2VzQXJyYXkob3B0aW9ucy5zdG9yYWdlcyksIGZ1bmN0aW9uIChzdG9yYWdlKSB7XG5cdFx0XHRcdFx0QmFzaWwudXRpbHMuZWFjaChfc3RvcmFnZXNbc3RvcmFnZV0ua2V5cyhvcHRpb25zLm5hbWVzcGFjZSwgb3B0aW9ucy5rZXlEZWxpbWl0ZXIpLCBmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHRcdFx0XHRtYXBba2V5XSA9IEJhc2lsLnV0aWxzLmlzQXJyYXkobWFwW2tleV0pID8gbWFwW2tleV0gOiBbXTtcblx0XHRcdFx0XHRcdG1hcFtrZXldLnB1c2goc3RvcmFnZSk7XG5cdFx0XHRcdFx0fSwgdGhpcyk7XG5cdFx0XHRcdH0sIG51bGwsIHRoaXMpO1xuXHRcdFx0XHRyZXR1cm4gbWFwO1xuXHRcdFx0fVxuXHRcdH07XG5cdH07XG5cblx0Ly8gQWNjZXNzIHRvIG5hdGl2ZSBzdG9yYWdlcywgd2l0aG91dCBuYW1lc3BhY2Ugb3IgYmFzaWwgdmFsdWUgZGVjb3JhdGlvblxuXHRCYXNpbC5tZW1vcnkgPSBuZXcgQmFzaWwuU3RvcmFnZSgpLmluaXQoeyBzdG9yYWdlczogJ21lbW9yeScsIG5hbWVzcGFjZTogbnVsbCwgcmF3OiB0cnVlIH0pO1xuXHRCYXNpbC5jb29raWUgPSBuZXcgQmFzaWwuU3RvcmFnZSgpLmluaXQoeyBzdG9yYWdlczogJ2Nvb2tpZScsIG5hbWVzcGFjZTogbnVsbCwgcmF3OiB0cnVlIH0pO1xuXHRCYXNpbC5sb2NhbFN0b3JhZ2UgPSBuZXcgQmFzaWwuU3RvcmFnZSgpLmluaXQoeyBzdG9yYWdlczogJ2xvY2FsJywgbmFtZXNwYWNlOiBudWxsLCByYXc6IHRydWUgfSk7XG5cdEJhc2lsLnNlc3Npb25TdG9yYWdlID0gbmV3IEJhc2lsLlN0b3JhZ2UoKS5pbml0KHsgc3RvcmFnZXM6ICdzZXNzaW9uJywgbmFtZXNwYWNlOiBudWxsLCByYXc6IHRydWUgfSk7XG5cblx0Ly8gYnJvd3NlciBleHBvcnRcblx0d2luZG93LkJhc2lsID0gQmFzaWw7XG5cblx0Ly8gQU1EIGV4cG9ydFxuXHRpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG5cdFx0ZGVmaW5lKGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIEJhc2lsO1xuXHRcdH0pO1xuXHQvLyBjb21tb25qcyBleHBvcnRcblx0fSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuXHRcdG1vZHVsZS5leHBvcnRzID0gQmFzaWw7XG5cdH1cblxufSkoKTtcbiIsIjsoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYgKHR5cGVvZiBleHBvcnRzID09PSBcIm9iamVjdFwiKSB7XG5cdFx0Ly8gQ29tbW9uSlNcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdH1cblx0ZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcblx0XHQvLyBBTURcblx0XHRkZWZpbmUoW10sIGZhY3RvcnkpO1xuXHR9XG5cdGVsc2Uge1xuXHRcdC8vIEdsb2JhbCAoYnJvd3Nlcilcblx0XHRyb290LkNyeXB0b0pTID0gZmFjdG9yeSgpO1xuXHR9XG59KHRoaXMsIGZ1bmN0aW9uICgpIHtcblxuXHQvKipcblx0ICogQ3J5cHRvSlMgY29yZSBjb21wb25lbnRzLlxuXHQgKi9cblx0dmFyIENyeXB0b0pTID0gQ3J5cHRvSlMgfHwgKGZ1bmN0aW9uIChNYXRoLCB1bmRlZmluZWQpIHtcblx0ICAgIC8qXG5cdCAgICAgKiBMb2NhbCBwb2x5ZmlsIG9mIE9iamVjdC5jcmVhdGVcblx0ICAgICAqL1xuXHQgICAgdmFyIGNyZWF0ZSA9IE9iamVjdC5jcmVhdGUgfHwgKGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICBmdW5jdGlvbiBGKCkge307XG5cblx0ICAgICAgICByZXR1cm4gZnVuY3Rpb24gKG9iaikge1xuXHQgICAgICAgICAgICB2YXIgc3VidHlwZTtcblxuXHQgICAgICAgICAgICBGLnByb3RvdHlwZSA9IG9iajtcblxuXHQgICAgICAgICAgICBzdWJ0eXBlID0gbmV3IEYoKTtcblxuXHQgICAgICAgICAgICBGLnByb3RvdHlwZSA9IG51bGw7XG5cblx0ICAgICAgICAgICAgcmV0dXJuIHN1YnR5cGU7XG5cdCAgICAgICAgfTtcblx0ICAgIH0oKSlcblxuXHQgICAgLyoqXG5cdCAgICAgKiBDcnlwdG9KUyBuYW1lc3BhY2UuXG5cdCAgICAgKi9cblx0ICAgIHZhciBDID0ge307XG5cblx0ICAgIC8qKlxuXHQgICAgICogTGlicmFyeSBuYW1lc3BhY2UuXG5cdCAgICAgKi9cblx0ICAgIHZhciBDX2xpYiA9IEMubGliID0ge307XG5cblx0ICAgIC8qKlxuXHQgICAgICogQmFzZSBvYmplY3QgZm9yIHByb3RvdHlwYWwgaW5oZXJpdGFuY2UuXG5cdCAgICAgKi9cblx0ICAgIHZhciBCYXNlID0gQ19saWIuQmFzZSA9IChmdW5jdGlvbiAoKSB7XG5cblxuXHQgICAgICAgIHJldHVybiB7XG5cdCAgICAgICAgICAgIC8qKlxuXHQgICAgICAgICAgICAgKiBDcmVhdGVzIGEgbmV3IG9iamVjdCB0aGF0IGluaGVyaXRzIGZyb20gdGhpcyBvYmplY3QuXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvdmVycmlkZXMgUHJvcGVydGllcyB0byBjb3B5IGludG8gdGhlIG5ldyBvYmplY3QuXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqIEByZXR1cm4ge09iamVjdH0gVGhlIG5ldyBvYmplY3QuXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqIEBzdGF0aWNcblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogICAgIHZhciBNeVR5cGUgPSBDcnlwdG9KUy5saWIuQmFzZS5leHRlbmQoe1xuXHQgICAgICAgICAgICAgKiAgICAgICAgIGZpZWxkOiAndmFsdWUnLFxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiAgICAgICAgIG1ldGhvZDogZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICAgKiAgICAgICAgIH1cblx0ICAgICAgICAgICAgICogICAgIH0pO1xuXHQgICAgICAgICAgICAgKi9cblx0ICAgICAgICAgICAgZXh0ZW5kOiBmdW5jdGlvbiAob3ZlcnJpZGVzKSB7XG5cdCAgICAgICAgICAgICAgICAvLyBTcGF3blxuXHQgICAgICAgICAgICAgICAgdmFyIHN1YnR5cGUgPSBjcmVhdGUodGhpcyk7XG5cblx0ICAgICAgICAgICAgICAgIC8vIEF1Z21lbnRcblx0ICAgICAgICAgICAgICAgIGlmIChvdmVycmlkZXMpIHtcblx0ICAgICAgICAgICAgICAgICAgICBzdWJ0eXBlLm1peEluKG92ZXJyaWRlcyk7XG5cdCAgICAgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBkZWZhdWx0IGluaXRpYWxpemVyXG5cdCAgICAgICAgICAgICAgICBpZiAoIXN1YnR5cGUuaGFzT3duUHJvcGVydHkoJ2luaXQnKSB8fCB0aGlzLmluaXQgPT09IHN1YnR5cGUuaW5pdCkge1xuXHQgICAgICAgICAgICAgICAgICAgIHN1YnR5cGUuaW5pdCA9IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgc3VidHlwZS4kc3VwZXIuaW5pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHQgICAgICAgICAgICAgICAgICAgIH07XG5cdCAgICAgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgICAgIC8vIEluaXRpYWxpemVyJ3MgcHJvdG90eXBlIGlzIHRoZSBzdWJ0eXBlIG9iamVjdFxuXHQgICAgICAgICAgICAgICAgc3VidHlwZS5pbml0LnByb3RvdHlwZSA9IHN1YnR5cGU7XG5cblx0ICAgICAgICAgICAgICAgIC8vIFJlZmVyZW5jZSBzdXBlcnR5cGVcblx0ICAgICAgICAgICAgICAgIHN1YnR5cGUuJHN1cGVyID0gdGhpcztcblxuXHQgICAgICAgICAgICAgICAgcmV0dXJuIHN1YnR5cGU7XG5cdCAgICAgICAgICAgIH0sXG5cblx0ICAgICAgICAgICAgLyoqXG5cdCAgICAgICAgICAgICAqIEV4dGVuZHMgdGhpcyBvYmplY3QgYW5kIHJ1bnMgdGhlIGluaXQgbWV0aG9kLlxuXHQgICAgICAgICAgICAgKiBBcmd1bWVudHMgdG8gY3JlYXRlKCkgd2lsbCBiZSBwYXNzZWQgdG8gaW5pdCgpLlxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBuZXcgb2JqZWN0LlxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiBAc3RhdGljXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqICAgICB2YXIgaW5zdGFuY2UgPSBNeVR5cGUuY3JlYXRlKCk7XG5cdCAgICAgICAgICAgICAqL1xuXHQgICAgICAgICAgICBjcmVhdGU6IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgICAgIHZhciBpbnN0YW5jZSA9IHRoaXMuZXh0ZW5kKCk7XG5cdCAgICAgICAgICAgICAgICBpbnN0YW5jZS5pbml0LmFwcGx5KGluc3RhbmNlLCBhcmd1bWVudHMpO1xuXG5cdCAgICAgICAgICAgICAgICByZXR1cm4gaW5zdGFuY2U7XG5cdCAgICAgICAgICAgIH0sXG5cblx0ICAgICAgICAgICAgLyoqXG5cdCAgICAgICAgICAgICAqIEluaXRpYWxpemVzIGEgbmV3bHkgY3JlYXRlZCBvYmplY3QuXG5cdCAgICAgICAgICAgICAqIE92ZXJyaWRlIHRoaXMgbWV0aG9kIHRvIGFkZCBzb21lIGxvZ2ljIHdoZW4geW91ciBvYmplY3RzIGFyZSBjcmVhdGVkLlxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiAgICAgdmFyIE15VHlwZSA9IENyeXB0b0pTLmxpYi5CYXNlLmV4dGVuZCh7XG5cdCAgICAgICAgICAgICAqICAgICAgICAgaW5pdDogZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICAgKiAgICAgICAgICAgICAvLyAuLi5cblx0ICAgICAgICAgICAgICogICAgICAgICB9XG5cdCAgICAgICAgICAgICAqICAgICB9KTtcblx0ICAgICAgICAgICAgICovXG5cdCAgICAgICAgICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgfSxcblxuXHQgICAgICAgICAgICAvKipcblx0ICAgICAgICAgICAgICogQ29waWVzIHByb3BlcnRpZXMgaW50byB0aGlzIG9iamVjdC5cblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IHByb3BlcnRpZXMgVGhlIHByb3BlcnRpZXMgdG8gbWl4IGluLlxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiAgICAgTXlUeXBlLm1peEluKHtcblx0ICAgICAgICAgICAgICogICAgICAgICBmaWVsZDogJ3ZhbHVlJ1xuXHQgICAgICAgICAgICAgKiAgICAgfSk7XG5cdCAgICAgICAgICAgICAqL1xuXHQgICAgICAgICAgICBtaXhJbjogZnVuY3Rpb24gKHByb3BlcnRpZXMpIHtcblx0ICAgICAgICAgICAgICAgIGZvciAodmFyIHByb3BlcnR5TmFtZSBpbiBwcm9wZXJ0aWVzKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgaWYgKHByb3BlcnRpZXMuaGFzT3duUHJvcGVydHkocHJvcGVydHlOYW1lKSkge1xuXHQgICAgICAgICAgICAgICAgICAgICAgICB0aGlzW3Byb3BlcnR5TmFtZV0gPSBwcm9wZXJ0aWVzW3Byb3BlcnR5TmFtZV07XG5cdCAgICAgICAgICAgICAgICAgICAgfVxuXHQgICAgICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgICAgICAvLyBJRSB3b24ndCBjb3B5IHRvU3RyaW5nIHVzaW5nIHRoZSBsb29wIGFib3ZlXG5cdCAgICAgICAgICAgICAgICBpZiAocHJvcGVydGllcy5oYXNPd25Qcm9wZXJ0eSgndG9TdHJpbmcnKSkge1xuXHQgICAgICAgICAgICAgICAgICAgIHRoaXMudG9TdHJpbmcgPSBwcm9wZXJ0aWVzLnRvU3RyaW5nO1xuXHQgICAgICAgICAgICAgICAgfVxuXHQgICAgICAgICAgICB9LFxuXG5cdCAgICAgICAgICAgIC8qKlxuXHQgICAgICAgICAgICAgKiBDcmVhdGVzIGEgY29weSBvZiB0aGlzIG9iamVjdC5cblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogQHJldHVybiB7T2JqZWN0fSBUaGUgY2xvbmUuXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqICAgICB2YXIgY2xvbmUgPSBpbnN0YW5jZS5jbG9uZSgpO1xuXHQgICAgICAgICAgICAgKi9cblx0ICAgICAgICAgICAgY2xvbmU6IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmluaXQucHJvdG90eXBlLmV4dGVuZCh0aGlzKTtcblx0ICAgICAgICAgICAgfVxuXHQgICAgICAgIH07XG5cdCAgICB9KCkpO1xuXG5cdCAgICAvKipcblx0ICAgICAqIEFuIGFycmF5IG9mIDMyLWJpdCB3b3Jkcy5cblx0ICAgICAqXG5cdCAgICAgKiBAcHJvcGVydHkge0FycmF5fSB3b3JkcyBUaGUgYXJyYXkgb2YgMzItYml0IHdvcmRzLlxuXHQgICAgICogQHByb3BlcnR5IHtudW1iZXJ9IHNpZ0J5dGVzIFRoZSBudW1iZXIgb2Ygc2lnbmlmaWNhbnQgYnl0ZXMgaW4gdGhpcyB3b3JkIGFycmF5LlxuXHQgICAgICovXG5cdCAgICB2YXIgV29yZEFycmF5ID0gQ19saWIuV29yZEFycmF5ID0gQmFzZS5leHRlbmQoe1xuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIEluaXRpYWxpemVzIGEgbmV3bHkgY3JlYXRlZCB3b3JkIGFycmF5LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtBcnJheX0gd29yZHMgKE9wdGlvbmFsKSBBbiBhcnJheSBvZiAzMi1iaXQgd29yZHMuXG5cdCAgICAgICAgICogQHBhcmFtIHtudW1iZXJ9IHNpZ0J5dGVzIChPcHRpb25hbCkgVGhlIG51bWJlciBvZiBzaWduaWZpY2FudCBieXRlcyBpbiB0aGUgd29yZHMuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciB3b3JkQXJyYXkgPSBDcnlwdG9KUy5saWIuV29yZEFycmF5LmNyZWF0ZSgpO1xuXHQgICAgICAgICAqICAgICB2YXIgd29yZEFycmF5ID0gQ3J5cHRvSlMubGliLldvcmRBcnJheS5jcmVhdGUoWzB4MDAwMTAyMDMsIDB4MDQwNTA2MDddKTtcblx0ICAgICAgICAgKiAgICAgdmFyIHdvcmRBcnJheSA9IENyeXB0b0pTLmxpYi5Xb3JkQXJyYXkuY3JlYXRlKFsweDAwMDEwMjAzLCAweDA0MDUwNjA3XSwgNik7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgaW5pdDogZnVuY3Rpb24gKHdvcmRzLCBzaWdCeXRlcykge1xuXHQgICAgICAgICAgICB3b3JkcyA9IHRoaXMud29yZHMgPSB3b3JkcyB8fCBbXTtcblxuXHQgICAgICAgICAgICBpZiAoc2lnQnl0ZXMgIT0gdW5kZWZpbmVkKSB7XG5cdCAgICAgICAgICAgICAgICB0aGlzLnNpZ0J5dGVzID0gc2lnQnl0ZXM7XG5cdCAgICAgICAgICAgIH0gZWxzZSB7XG5cdCAgICAgICAgICAgICAgICB0aGlzLnNpZ0J5dGVzID0gd29yZHMubGVuZ3RoICogNDtcblx0ICAgICAgICAgICAgfVxuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBDb252ZXJ0cyB0aGlzIHdvcmQgYXJyYXkgdG8gYSBzdHJpbmcuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge0VuY29kZXJ9IGVuY29kZXIgKE9wdGlvbmFsKSBUaGUgZW5jb2Rpbmcgc3RyYXRlZ3kgdG8gdXNlLiBEZWZhdWx0OiBDcnlwdG9KUy5lbmMuSGV4XG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBzdHJpbmdpZmllZCB3b3JkIGFycmF5LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgc3RyaW5nID0gd29yZEFycmF5ICsgJyc7XG5cdCAgICAgICAgICogICAgIHZhciBzdHJpbmcgPSB3b3JkQXJyYXkudG9TdHJpbmcoKTtcblx0ICAgICAgICAgKiAgICAgdmFyIHN0cmluZyA9IHdvcmRBcnJheS50b1N0cmluZyhDcnlwdG9KUy5lbmMuVXRmOCk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgdG9TdHJpbmc6IGZ1bmN0aW9uIChlbmNvZGVyKSB7XG5cdCAgICAgICAgICAgIHJldHVybiAoZW5jb2RlciB8fCBIZXgpLnN0cmluZ2lmeSh0aGlzKTtcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogQ29uY2F0ZW5hdGVzIGEgd29yZCBhcnJheSB0byB0aGlzIHdvcmQgYXJyYXkuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge1dvcmRBcnJheX0gd29yZEFycmF5IFRoZSB3b3JkIGFycmF5IHRvIGFwcGVuZC5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge1dvcmRBcnJheX0gVGhpcyB3b3JkIGFycmF5LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB3b3JkQXJyYXkxLmNvbmNhdCh3b3JkQXJyYXkyKTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBjb25jYXQ6IGZ1bmN0aW9uICh3b3JkQXJyYXkpIHtcblx0ICAgICAgICAgICAgLy8gU2hvcnRjdXRzXG5cdCAgICAgICAgICAgIHZhciB0aGlzV29yZHMgPSB0aGlzLndvcmRzO1xuXHQgICAgICAgICAgICB2YXIgdGhhdFdvcmRzID0gd29yZEFycmF5LndvcmRzO1xuXHQgICAgICAgICAgICB2YXIgdGhpc1NpZ0J5dGVzID0gdGhpcy5zaWdCeXRlcztcblx0ICAgICAgICAgICAgdmFyIHRoYXRTaWdCeXRlcyA9IHdvcmRBcnJheS5zaWdCeXRlcztcblxuXHQgICAgICAgICAgICAvLyBDbGFtcCBleGNlc3MgYml0c1xuXHQgICAgICAgICAgICB0aGlzLmNsYW1wKCk7XG5cblx0ICAgICAgICAgICAgLy8gQ29uY2F0XG5cdCAgICAgICAgICAgIGlmICh0aGlzU2lnQnl0ZXMgJSA0KSB7XG5cdCAgICAgICAgICAgICAgICAvLyBDb3B5IG9uZSBieXRlIGF0IGEgdGltZVxuXHQgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGF0U2lnQnl0ZXM7IGkrKykge1xuXHQgICAgICAgICAgICAgICAgICAgIHZhciB0aGF0Qnl0ZSA9ICh0aGF0V29yZHNbaSA+Pj4gMl0gPj4+ICgyNCAtIChpICUgNCkgKiA4KSkgJiAweGZmO1xuXHQgICAgICAgICAgICAgICAgICAgIHRoaXNXb3Jkc1sodGhpc1NpZ0J5dGVzICsgaSkgPj4+IDJdIHw9IHRoYXRCeXRlIDw8ICgyNCAtICgodGhpc1NpZ0J5dGVzICsgaSkgJSA0KSAqIDgpO1xuXHQgICAgICAgICAgICAgICAgfVxuXHQgICAgICAgICAgICB9IGVsc2Uge1xuXHQgICAgICAgICAgICAgICAgLy8gQ29weSBvbmUgd29yZCBhdCBhIHRpbWVcblx0ICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhhdFNpZ0J5dGVzOyBpICs9IDQpIHtcblx0ICAgICAgICAgICAgICAgICAgICB0aGlzV29yZHNbKHRoaXNTaWdCeXRlcyArIGkpID4+PiAyXSA9IHRoYXRXb3Jkc1tpID4+PiAyXTtcblx0ICAgICAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgfVxuXHQgICAgICAgICAgICB0aGlzLnNpZ0J5dGVzICs9IHRoYXRTaWdCeXRlcztcblxuXHQgICAgICAgICAgICAvLyBDaGFpbmFibGVcblx0ICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIFJlbW92ZXMgaW5zaWduaWZpY2FudCBiaXRzLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB3b3JkQXJyYXkuY2xhbXAoKTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBjbGFtcDogZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICAvLyBTaG9ydGN1dHNcblx0ICAgICAgICAgICAgdmFyIHdvcmRzID0gdGhpcy53b3Jkcztcblx0ICAgICAgICAgICAgdmFyIHNpZ0J5dGVzID0gdGhpcy5zaWdCeXRlcztcblxuXHQgICAgICAgICAgICAvLyBDbGFtcFxuXHQgICAgICAgICAgICB3b3Jkc1tzaWdCeXRlcyA+Pj4gMl0gJj0gMHhmZmZmZmZmZiA8PCAoMzIgLSAoc2lnQnl0ZXMgJSA0KSAqIDgpO1xuXHQgICAgICAgICAgICB3b3Jkcy5sZW5ndGggPSBNYXRoLmNlaWwoc2lnQnl0ZXMgLyA0KTtcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogQ3JlYXRlcyBhIGNvcHkgb2YgdGhpcyB3b3JkIGFycmF5LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7V29yZEFycmF5fSBUaGUgY2xvbmUuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciBjbG9uZSA9IHdvcmRBcnJheS5jbG9uZSgpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIGNsb25lOiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgIHZhciBjbG9uZSA9IEJhc2UuY2xvbmUuY2FsbCh0aGlzKTtcblx0ICAgICAgICAgICAgY2xvbmUud29yZHMgPSB0aGlzLndvcmRzLnNsaWNlKDApO1xuXG5cdCAgICAgICAgICAgIHJldHVybiBjbG9uZTtcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogQ3JlYXRlcyBhIHdvcmQgYXJyYXkgZmlsbGVkIHdpdGggcmFuZG9tIGJ5dGVzLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtudW1iZXJ9IG5CeXRlcyBUaGUgbnVtYmVyIG9mIHJhbmRvbSBieXRlcyB0byBnZW5lcmF0ZS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge1dvcmRBcnJheX0gVGhlIHJhbmRvbSB3b3JkIGFycmF5LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHN0YXRpY1xuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgd29yZEFycmF5ID0gQ3J5cHRvSlMubGliLldvcmRBcnJheS5yYW5kb20oMTYpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIHJhbmRvbTogZnVuY3Rpb24gKG5CeXRlcykge1xuXHQgICAgICAgICAgICB2YXIgd29yZHMgPSBbXTtcblxuXHQgICAgICAgICAgICB2YXIgciA9IChmdW5jdGlvbiAobV93KSB7XG5cdCAgICAgICAgICAgICAgICB2YXIgbV93ID0gbV93O1xuXHQgICAgICAgICAgICAgICAgdmFyIG1feiA9IDB4M2FkZTY4YjE7XG5cdCAgICAgICAgICAgICAgICB2YXIgbWFzayA9IDB4ZmZmZmZmZmY7XG5cblx0ICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgbV96ID0gKDB4OTA2OSAqIChtX3ogJiAweEZGRkYpICsgKG1feiA+PiAweDEwKSkgJiBtYXNrO1xuXHQgICAgICAgICAgICAgICAgICAgIG1fdyA9ICgweDQ2NTAgKiAobV93ICYgMHhGRkZGKSArIChtX3cgPj4gMHgxMCkpICYgbWFzaztcblx0ICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gKChtX3ogPDwgMHgxMCkgKyBtX3cpICYgbWFzaztcblx0ICAgICAgICAgICAgICAgICAgICByZXN1bHQgLz0gMHgxMDAwMDAwMDA7XG5cdCAgICAgICAgICAgICAgICAgICAgcmVzdWx0ICs9IDAuNTtcblx0ICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0ICogKE1hdGgucmFuZG9tKCkgPiAuNSA/IDEgOiAtMSk7XG5cdCAgICAgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgIH0pO1xuXG5cdCAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCByY2FjaGU7IGkgPCBuQnl0ZXM7IGkgKz0gNCkge1xuXHQgICAgICAgICAgICAgICAgdmFyIF9yID0gcigocmNhY2hlIHx8IE1hdGgucmFuZG9tKCkpICogMHgxMDAwMDAwMDApO1xuXG5cdCAgICAgICAgICAgICAgICByY2FjaGUgPSBfcigpICogMHgzYWRlNjdiNztcblx0ICAgICAgICAgICAgICAgIHdvcmRzLnB1c2goKF9yKCkgKiAweDEwMDAwMDAwMCkgfCAwKTtcblx0ICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgIHJldHVybiBuZXcgV29yZEFycmF5LmluaXQod29yZHMsIG5CeXRlcyk7XG5cdCAgICAgICAgfVxuXHQgICAgfSk7XG5cblx0ICAgIC8qKlxuXHQgICAgICogRW5jb2RlciBuYW1lc3BhY2UuXG5cdCAgICAgKi9cblx0ICAgIHZhciBDX2VuYyA9IEMuZW5jID0ge307XG5cblx0ICAgIC8qKlxuXHQgICAgICogSGV4IGVuY29kaW5nIHN0cmF0ZWd5LlxuXHQgICAgICovXG5cdCAgICB2YXIgSGV4ID0gQ19lbmMuSGV4ID0ge1xuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIENvbnZlcnRzIGEgd29yZCBhcnJheSB0byBhIGhleCBzdHJpbmcuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge1dvcmRBcnJheX0gd29yZEFycmF5IFRoZSB3b3JkIGFycmF5LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7c3RyaW5nfSBUaGUgaGV4IHN0cmluZy5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBzdGF0aWNcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIGhleFN0cmluZyA9IENyeXB0b0pTLmVuYy5IZXguc3RyaW5naWZ5KHdvcmRBcnJheSk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgc3RyaW5naWZ5OiBmdW5jdGlvbiAod29yZEFycmF5KSB7XG5cdCAgICAgICAgICAgIC8vIFNob3J0Y3V0c1xuXHQgICAgICAgICAgICB2YXIgd29yZHMgPSB3b3JkQXJyYXkud29yZHM7XG5cdCAgICAgICAgICAgIHZhciBzaWdCeXRlcyA9IHdvcmRBcnJheS5zaWdCeXRlcztcblxuXHQgICAgICAgICAgICAvLyBDb252ZXJ0XG5cdCAgICAgICAgICAgIHZhciBoZXhDaGFycyA9IFtdO1xuXHQgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNpZ0J5dGVzOyBpKyspIHtcblx0ICAgICAgICAgICAgICAgIHZhciBiaXRlID0gKHdvcmRzW2kgPj4+IDJdID4+PiAoMjQgLSAoaSAlIDQpICogOCkpICYgMHhmZjtcblx0ICAgICAgICAgICAgICAgIGhleENoYXJzLnB1c2goKGJpdGUgPj4+IDQpLnRvU3RyaW5nKDE2KSk7XG5cdCAgICAgICAgICAgICAgICBoZXhDaGFycy5wdXNoKChiaXRlICYgMHgwZikudG9TdHJpbmcoMTYpKTtcblx0ICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgIHJldHVybiBoZXhDaGFycy5qb2luKCcnKTtcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogQ29udmVydHMgYSBoZXggc3RyaW5nIHRvIGEgd29yZCBhcnJheS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBoZXhTdHIgVGhlIGhleCBzdHJpbmcuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtXb3JkQXJyYXl9IFRoZSB3b3JkIGFycmF5LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHN0YXRpY1xuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgd29yZEFycmF5ID0gQ3J5cHRvSlMuZW5jLkhleC5wYXJzZShoZXhTdHJpbmcpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIHBhcnNlOiBmdW5jdGlvbiAoaGV4U3RyKSB7XG5cdCAgICAgICAgICAgIC8vIFNob3J0Y3V0XG5cdCAgICAgICAgICAgIHZhciBoZXhTdHJMZW5ndGggPSBoZXhTdHIubGVuZ3RoO1xuXG5cdCAgICAgICAgICAgIC8vIENvbnZlcnRcblx0ICAgICAgICAgICAgdmFyIHdvcmRzID0gW107XG5cdCAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaGV4U3RyTGVuZ3RoOyBpICs9IDIpIHtcblx0ICAgICAgICAgICAgICAgIHdvcmRzW2kgPj4+IDNdIHw9IHBhcnNlSW50KGhleFN0ci5zdWJzdHIoaSwgMiksIDE2KSA8PCAoMjQgLSAoaSAlIDgpICogNCk7XG5cdCAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICByZXR1cm4gbmV3IFdvcmRBcnJheS5pbml0KHdvcmRzLCBoZXhTdHJMZW5ndGggLyAyKTtcblx0ICAgICAgICB9XG5cdCAgICB9O1xuXG5cdCAgICAvKipcblx0ICAgICAqIExhdGluMSBlbmNvZGluZyBzdHJhdGVneS5cblx0ICAgICAqL1xuXHQgICAgdmFyIExhdGluMSA9IENfZW5jLkxhdGluMSA9IHtcblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBDb252ZXJ0cyBhIHdvcmQgYXJyYXkgdG8gYSBMYXRpbjEgc3RyaW5nLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtXb3JkQXJyYXl9IHdvcmRBcnJheSBUaGUgd29yZCBhcnJheS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge3N0cmluZ30gVGhlIExhdGluMSBzdHJpbmcuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAc3RhdGljXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciBsYXRpbjFTdHJpbmcgPSBDcnlwdG9KUy5lbmMuTGF0aW4xLnN0cmluZ2lmeSh3b3JkQXJyYXkpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIHN0cmluZ2lmeTogZnVuY3Rpb24gKHdvcmRBcnJheSkge1xuXHQgICAgICAgICAgICAvLyBTaG9ydGN1dHNcblx0ICAgICAgICAgICAgdmFyIHdvcmRzID0gd29yZEFycmF5LndvcmRzO1xuXHQgICAgICAgICAgICB2YXIgc2lnQnl0ZXMgPSB3b3JkQXJyYXkuc2lnQnl0ZXM7XG5cblx0ICAgICAgICAgICAgLy8gQ29udmVydFxuXHQgICAgICAgICAgICB2YXIgbGF0aW4xQ2hhcnMgPSBbXTtcblx0ICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzaWdCeXRlczsgaSsrKSB7XG5cdCAgICAgICAgICAgICAgICB2YXIgYml0ZSA9ICh3b3Jkc1tpID4+PiAyXSA+Pj4gKDI0IC0gKGkgJSA0KSAqIDgpKSAmIDB4ZmY7XG5cdCAgICAgICAgICAgICAgICBsYXRpbjFDaGFycy5wdXNoKFN0cmluZy5mcm9tQ2hhckNvZGUoYml0ZSkpO1xuXHQgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgcmV0dXJuIGxhdGluMUNoYXJzLmpvaW4oJycpO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBDb252ZXJ0cyBhIExhdGluMSBzdHJpbmcgdG8gYSB3b3JkIGFycmF5LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGxhdGluMVN0ciBUaGUgTGF0aW4xIHN0cmluZy5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge1dvcmRBcnJheX0gVGhlIHdvcmQgYXJyYXkuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAc3RhdGljXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciB3b3JkQXJyYXkgPSBDcnlwdG9KUy5lbmMuTGF0aW4xLnBhcnNlKGxhdGluMVN0cmluZyk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgcGFyc2U6IGZ1bmN0aW9uIChsYXRpbjFTdHIpIHtcblx0ICAgICAgICAgICAgLy8gU2hvcnRjdXRcblx0ICAgICAgICAgICAgdmFyIGxhdGluMVN0ckxlbmd0aCA9IGxhdGluMVN0ci5sZW5ndGg7XG5cblx0ICAgICAgICAgICAgLy8gQ29udmVydFxuXHQgICAgICAgICAgICB2YXIgd29yZHMgPSBbXTtcblx0ICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsYXRpbjFTdHJMZW5ndGg7IGkrKykge1xuXHQgICAgICAgICAgICAgICAgd29yZHNbaSA+Pj4gMl0gfD0gKGxhdGluMVN0ci5jaGFyQ29kZUF0KGkpICYgMHhmZikgPDwgKDI0IC0gKGkgJSA0KSAqIDgpO1xuXHQgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgcmV0dXJuIG5ldyBXb3JkQXJyYXkuaW5pdCh3b3JkcywgbGF0aW4xU3RyTGVuZ3RoKTtcblx0ICAgICAgICB9XG5cdCAgICB9O1xuXG5cdCAgICAvKipcblx0ICAgICAqIFVURi04IGVuY29kaW5nIHN0cmF0ZWd5LlxuXHQgICAgICovXG5cdCAgICB2YXIgVXRmOCA9IENfZW5jLlV0ZjggPSB7XG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogQ29udmVydHMgYSB3b3JkIGFycmF5IHRvIGEgVVRGLTggc3RyaW5nLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtXb3JkQXJyYXl9IHdvcmRBcnJheSBUaGUgd29yZCBhcnJheS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge3N0cmluZ30gVGhlIFVURi04IHN0cmluZy5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBzdGF0aWNcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIHV0ZjhTdHJpbmcgPSBDcnlwdG9KUy5lbmMuVXRmOC5zdHJpbmdpZnkod29yZEFycmF5KTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBzdHJpbmdpZnk6IGZ1bmN0aW9uICh3b3JkQXJyYXkpIHtcblx0ICAgICAgICAgICAgdHJ5IHtcblx0ICAgICAgICAgICAgICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoZXNjYXBlKExhdGluMS5zdHJpbmdpZnkod29yZEFycmF5KSkpO1xuXHQgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG5cdCAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ01hbGZvcm1lZCBVVEYtOCBkYXRhJyk7XG5cdCAgICAgICAgICAgIH1cblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogQ29udmVydHMgYSBVVEYtOCBzdHJpbmcgdG8gYSB3b3JkIGFycmF5LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHV0ZjhTdHIgVGhlIFVURi04IHN0cmluZy5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge1dvcmRBcnJheX0gVGhlIHdvcmQgYXJyYXkuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAc3RhdGljXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciB3b3JkQXJyYXkgPSBDcnlwdG9KUy5lbmMuVXRmOC5wYXJzZSh1dGY4U3RyaW5nKTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBwYXJzZTogZnVuY3Rpb24gKHV0ZjhTdHIpIHtcblx0ICAgICAgICAgICAgcmV0dXJuIExhdGluMS5wYXJzZSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQodXRmOFN0cikpKTtcblx0ICAgICAgICB9XG5cdCAgICB9O1xuXG5cdCAgICAvKipcblx0ICAgICAqIEFic3RyYWN0IGJ1ZmZlcmVkIGJsb2NrIGFsZ29yaXRobSB0ZW1wbGF0ZS5cblx0ICAgICAqXG5cdCAgICAgKiBUaGUgcHJvcGVydHkgYmxvY2tTaXplIG11c3QgYmUgaW1wbGVtZW50ZWQgaW4gYSBjb25jcmV0ZSBzdWJ0eXBlLlxuXHQgICAgICpcblx0ICAgICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBfbWluQnVmZmVyU2l6ZSBUaGUgbnVtYmVyIG9mIGJsb2NrcyB0aGF0IHNob3VsZCBiZSBrZXB0IHVucHJvY2Vzc2VkIGluIHRoZSBidWZmZXIuIERlZmF1bHQ6IDBcblx0ICAgICAqL1xuXHQgICAgdmFyIEJ1ZmZlcmVkQmxvY2tBbGdvcml0aG0gPSBDX2xpYi5CdWZmZXJlZEJsb2NrQWxnb3JpdGhtID0gQmFzZS5leHRlbmQoe1xuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIFJlc2V0cyB0aGlzIGJsb2NrIGFsZ29yaXRobSdzIGRhdGEgYnVmZmVyIHRvIGl0cyBpbml0aWFsIHN0YXRlLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICBidWZmZXJlZEJsb2NrQWxnb3JpdGhtLnJlc2V0KCk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgcmVzZXQ6IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgLy8gSW5pdGlhbCB2YWx1ZXNcblx0ICAgICAgICAgICAgdGhpcy5fZGF0YSA9IG5ldyBXb3JkQXJyYXkuaW5pdCgpO1xuXHQgICAgICAgICAgICB0aGlzLl9uRGF0YUJ5dGVzID0gMDtcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogQWRkcyBuZXcgZGF0YSB0byB0aGlzIGJsb2NrIGFsZ29yaXRobSdzIGJ1ZmZlci5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7V29yZEFycmF5fHN0cmluZ30gZGF0YSBUaGUgZGF0YSB0byBhcHBlbmQuIFN0cmluZ3MgYXJlIGNvbnZlcnRlZCB0byBhIFdvcmRBcnJheSB1c2luZyBVVEYtOC5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgYnVmZmVyZWRCbG9ja0FsZ29yaXRobS5fYXBwZW5kKCdkYXRhJyk7XG5cdCAgICAgICAgICogICAgIGJ1ZmZlcmVkQmxvY2tBbGdvcml0aG0uX2FwcGVuZCh3b3JkQXJyYXkpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIF9hcHBlbmQ6IGZ1bmN0aW9uIChkYXRhKSB7XG5cdCAgICAgICAgICAgIC8vIENvbnZlcnQgc3RyaW5nIHRvIFdvcmRBcnJheSwgZWxzZSBhc3N1bWUgV29yZEFycmF5IGFscmVhZHlcblx0ICAgICAgICAgICAgaWYgKHR5cGVvZiBkYXRhID09ICdzdHJpbmcnKSB7XG5cdCAgICAgICAgICAgICAgICBkYXRhID0gVXRmOC5wYXJzZShkYXRhKTtcblx0ICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgIC8vIEFwcGVuZFxuXHQgICAgICAgICAgICB0aGlzLl9kYXRhLmNvbmNhdChkYXRhKTtcblx0ICAgICAgICAgICAgdGhpcy5fbkRhdGFCeXRlcyArPSBkYXRhLnNpZ0J5dGVzO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBQcm9jZXNzZXMgYXZhaWxhYmxlIGRhdGEgYmxvY2tzLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogVGhpcyBtZXRob2QgaW52b2tlcyBfZG9Qcm9jZXNzQmxvY2sob2Zmc2V0KSwgd2hpY2ggbXVzdCBiZSBpbXBsZW1lbnRlZCBieSBhIGNvbmNyZXRlIHN1YnR5cGUuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGRvRmx1c2ggV2hldGhlciBhbGwgYmxvY2tzIGFuZCBwYXJ0aWFsIGJsb2NrcyBzaG91bGQgYmUgcHJvY2Vzc2VkLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7V29yZEFycmF5fSBUaGUgcHJvY2Vzc2VkIGRhdGEuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciBwcm9jZXNzZWREYXRhID0gYnVmZmVyZWRCbG9ja0FsZ29yaXRobS5fcHJvY2VzcygpO1xuXHQgICAgICAgICAqICAgICB2YXIgcHJvY2Vzc2VkRGF0YSA9IGJ1ZmZlcmVkQmxvY2tBbGdvcml0aG0uX3Byb2Nlc3MoISEnZmx1c2gnKTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBfcHJvY2VzczogZnVuY3Rpb24gKGRvRmx1c2gpIHtcblx0ICAgICAgICAgICAgLy8gU2hvcnRjdXRzXG5cdCAgICAgICAgICAgIHZhciBkYXRhID0gdGhpcy5fZGF0YTtcblx0ICAgICAgICAgICAgdmFyIGRhdGFXb3JkcyA9IGRhdGEud29yZHM7XG5cdCAgICAgICAgICAgIHZhciBkYXRhU2lnQnl0ZXMgPSBkYXRhLnNpZ0J5dGVzO1xuXHQgICAgICAgICAgICB2YXIgYmxvY2tTaXplID0gdGhpcy5ibG9ja1NpemU7XG5cdCAgICAgICAgICAgIHZhciBibG9ja1NpemVCeXRlcyA9IGJsb2NrU2l6ZSAqIDQ7XG5cblx0ICAgICAgICAgICAgLy8gQ291bnQgYmxvY2tzIHJlYWR5XG5cdCAgICAgICAgICAgIHZhciBuQmxvY2tzUmVhZHkgPSBkYXRhU2lnQnl0ZXMgLyBibG9ja1NpemVCeXRlcztcblx0ICAgICAgICAgICAgaWYgKGRvRmx1c2gpIHtcblx0ICAgICAgICAgICAgICAgIC8vIFJvdW5kIHVwIHRvIGluY2x1ZGUgcGFydGlhbCBibG9ja3Ncblx0ICAgICAgICAgICAgICAgIG5CbG9ja3NSZWFkeSA9IE1hdGguY2VpbChuQmxvY2tzUmVhZHkpO1xuXHQgICAgICAgICAgICB9IGVsc2Uge1xuXHQgICAgICAgICAgICAgICAgLy8gUm91bmQgZG93biB0byBpbmNsdWRlIG9ubHkgZnVsbCBibG9ja3MsXG5cdCAgICAgICAgICAgICAgICAvLyBsZXNzIHRoZSBudW1iZXIgb2YgYmxvY2tzIHRoYXQgbXVzdCByZW1haW4gaW4gdGhlIGJ1ZmZlclxuXHQgICAgICAgICAgICAgICAgbkJsb2Nrc1JlYWR5ID0gTWF0aC5tYXgoKG5CbG9ja3NSZWFkeSB8IDApIC0gdGhpcy5fbWluQnVmZmVyU2l6ZSwgMCk7XG5cdCAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICAvLyBDb3VudCB3b3JkcyByZWFkeVxuXHQgICAgICAgICAgICB2YXIgbldvcmRzUmVhZHkgPSBuQmxvY2tzUmVhZHkgKiBibG9ja1NpemU7XG5cblx0ICAgICAgICAgICAgLy8gQ291bnQgYnl0ZXMgcmVhZHlcblx0ICAgICAgICAgICAgdmFyIG5CeXRlc1JlYWR5ID0gTWF0aC5taW4obldvcmRzUmVhZHkgKiA0LCBkYXRhU2lnQnl0ZXMpO1xuXG5cdCAgICAgICAgICAgIC8vIFByb2Nlc3MgYmxvY2tzXG5cdCAgICAgICAgICAgIGlmIChuV29yZHNSZWFkeSkge1xuXHQgICAgICAgICAgICAgICAgZm9yICh2YXIgb2Zmc2V0ID0gMDsgb2Zmc2V0IDwgbldvcmRzUmVhZHk7IG9mZnNldCArPSBibG9ja1NpemUpIHtcblx0ICAgICAgICAgICAgICAgICAgICAvLyBQZXJmb3JtIGNvbmNyZXRlLWFsZ29yaXRobSBsb2dpY1xuXHQgICAgICAgICAgICAgICAgICAgIHRoaXMuX2RvUHJvY2Vzc0Jsb2NrKGRhdGFXb3Jkcywgb2Zmc2V0KTtcblx0ICAgICAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICAgICAgLy8gUmVtb3ZlIHByb2Nlc3NlZCB3b3Jkc1xuXHQgICAgICAgICAgICAgICAgdmFyIHByb2Nlc3NlZFdvcmRzID0gZGF0YVdvcmRzLnNwbGljZSgwLCBuV29yZHNSZWFkeSk7XG5cdCAgICAgICAgICAgICAgICBkYXRhLnNpZ0J5dGVzIC09IG5CeXRlc1JlYWR5O1xuXHQgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgLy8gUmV0dXJuIHByb2Nlc3NlZCB3b3Jkc1xuXHQgICAgICAgICAgICByZXR1cm4gbmV3IFdvcmRBcnJheS5pbml0KHByb2Nlc3NlZFdvcmRzLCBuQnl0ZXNSZWFkeSk7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIENyZWF0ZXMgYSBjb3B5IG9mIHRoaXMgb2JqZWN0LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7T2JqZWN0fSBUaGUgY2xvbmUuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciBjbG9uZSA9IGJ1ZmZlcmVkQmxvY2tBbGdvcml0aG0uY2xvbmUoKTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBjbG9uZTogZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICB2YXIgY2xvbmUgPSBCYXNlLmNsb25lLmNhbGwodGhpcyk7XG5cdCAgICAgICAgICAgIGNsb25lLl9kYXRhID0gdGhpcy5fZGF0YS5jbG9uZSgpO1xuXG5cdCAgICAgICAgICAgIHJldHVybiBjbG9uZTtcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgX21pbkJ1ZmZlclNpemU6IDBcblx0ICAgIH0pO1xuXG5cdCAgICAvKipcblx0ICAgICAqIEFic3RyYWN0IGhhc2hlciB0ZW1wbGF0ZS5cblx0ICAgICAqXG5cdCAgICAgKiBAcHJvcGVydHkge251bWJlcn0gYmxvY2tTaXplIFRoZSBudW1iZXIgb2YgMzItYml0IHdvcmRzIHRoaXMgaGFzaGVyIG9wZXJhdGVzIG9uLiBEZWZhdWx0OiAxNiAoNTEyIGJpdHMpXG5cdCAgICAgKi9cblx0ICAgIHZhciBIYXNoZXIgPSBDX2xpYi5IYXNoZXIgPSBCdWZmZXJlZEJsb2NrQWxnb3JpdGhtLmV4dGVuZCh7XG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogQ29uZmlndXJhdGlvbiBvcHRpb25zLlxuXHQgICAgICAgICAqL1xuXHQgICAgICAgIGNmZzogQmFzZS5leHRlbmQoKSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIEluaXRpYWxpemVzIGEgbmV3bHkgY3JlYXRlZCBoYXNoZXIuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gY2ZnIChPcHRpb25hbCkgVGhlIGNvbmZpZ3VyYXRpb24gb3B0aW9ucyB0byB1c2UgZm9yIHRoaXMgaGFzaCBjb21wdXRhdGlvbi5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIGhhc2hlciA9IENyeXB0b0pTLmFsZ28uU0hBMjU2LmNyZWF0ZSgpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIGluaXQ6IGZ1bmN0aW9uIChjZmcpIHtcblx0ICAgICAgICAgICAgLy8gQXBwbHkgY29uZmlnIGRlZmF1bHRzXG5cdCAgICAgICAgICAgIHRoaXMuY2ZnID0gdGhpcy5jZmcuZXh0ZW5kKGNmZyk7XG5cblx0ICAgICAgICAgICAgLy8gU2V0IGluaXRpYWwgdmFsdWVzXG5cdCAgICAgICAgICAgIHRoaXMucmVzZXQoKTtcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogUmVzZXRzIHRoaXMgaGFzaGVyIHRvIGl0cyBpbml0aWFsIHN0YXRlLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICBoYXNoZXIucmVzZXQoKTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICByZXNldDogZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICAvLyBSZXNldCBkYXRhIGJ1ZmZlclxuXHQgICAgICAgICAgICBCdWZmZXJlZEJsb2NrQWxnb3JpdGhtLnJlc2V0LmNhbGwodGhpcyk7XG5cblx0ICAgICAgICAgICAgLy8gUGVyZm9ybSBjb25jcmV0ZS1oYXNoZXIgbG9naWNcblx0ICAgICAgICAgICAgdGhpcy5fZG9SZXNldCgpO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBVcGRhdGVzIHRoaXMgaGFzaGVyIHdpdGggYSBtZXNzYWdlLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtXb3JkQXJyYXl8c3RyaW5nfSBtZXNzYWdlVXBkYXRlIFRoZSBtZXNzYWdlIHRvIGFwcGVuZC5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge0hhc2hlcn0gVGhpcyBoYXNoZXIuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIGhhc2hlci51cGRhdGUoJ21lc3NhZ2UnKTtcblx0ICAgICAgICAgKiAgICAgaGFzaGVyLnVwZGF0ZSh3b3JkQXJyYXkpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIHVwZGF0ZTogZnVuY3Rpb24gKG1lc3NhZ2VVcGRhdGUpIHtcblx0ICAgICAgICAgICAgLy8gQXBwZW5kXG5cdCAgICAgICAgICAgIHRoaXMuX2FwcGVuZChtZXNzYWdlVXBkYXRlKTtcblxuXHQgICAgICAgICAgICAvLyBVcGRhdGUgdGhlIGhhc2hcblx0ICAgICAgICAgICAgdGhpcy5fcHJvY2VzcygpO1xuXG5cdCAgICAgICAgICAgIC8vIENoYWluYWJsZVxuXHQgICAgICAgICAgICByZXR1cm4gdGhpcztcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogRmluYWxpemVzIHRoZSBoYXNoIGNvbXB1dGF0aW9uLlxuXHQgICAgICAgICAqIE5vdGUgdGhhdCB0aGUgZmluYWxpemUgb3BlcmF0aW9uIGlzIGVmZmVjdGl2ZWx5IGEgZGVzdHJ1Y3RpdmUsIHJlYWQtb25jZSBvcGVyYXRpb24uXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge1dvcmRBcnJheXxzdHJpbmd9IG1lc3NhZ2VVcGRhdGUgKE9wdGlvbmFsKSBBIGZpbmFsIG1lc3NhZ2UgdXBkYXRlLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7V29yZEFycmF5fSBUaGUgaGFzaC5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIGhhc2ggPSBoYXNoZXIuZmluYWxpemUoKTtcblx0ICAgICAgICAgKiAgICAgdmFyIGhhc2ggPSBoYXNoZXIuZmluYWxpemUoJ21lc3NhZ2UnKTtcblx0ICAgICAgICAgKiAgICAgdmFyIGhhc2ggPSBoYXNoZXIuZmluYWxpemUod29yZEFycmF5KTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBmaW5hbGl6ZTogZnVuY3Rpb24gKG1lc3NhZ2VVcGRhdGUpIHtcblx0ICAgICAgICAgICAgLy8gRmluYWwgbWVzc2FnZSB1cGRhdGVcblx0ICAgICAgICAgICAgaWYgKG1lc3NhZ2VVcGRhdGUpIHtcblx0ICAgICAgICAgICAgICAgIHRoaXMuX2FwcGVuZChtZXNzYWdlVXBkYXRlKTtcblx0ICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgIC8vIFBlcmZvcm0gY29uY3JldGUtaGFzaGVyIGxvZ2ljXG5cdCAgICAgICAgICAgIHZhciBoYXNoID0gdGhpcy5fZG9GaW5hbGl6ZSgpO1xuXG5cdCAgICAgICAgICAgIHJldHVybiBoYXNoO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICBibG9ja1NpemU6IDUxMi8zMixcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIENyZWF0ZXMgYSBzaG9ydGN1dCBmdW5jdGlvbiB0byBhIGhhc2hlcidzIG9iamVjdCBpbnRlcmZhY2UuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge0hhc2hlcn0gaGFzaGVyIFRoZSBoYXNoZXIgdG8gY3JlYXRlIGEgaGVscGVyIGZvci5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge0Z1bmN0aW9ufSBUaGUgc2hvcnRjdXQgZnVuY3Rpb24uXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAc3RhdGljXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciBTSEEyNTYgPSBDcnlwdG9KUy5saWIuSGFzaGVyLl9jcmVhdGVIZWxwZXIoQ3J5cHRvSlMuYWxnby5TSEEyNTYpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIF9jcmVhdGVIZWxwZXI6IGZ1bmN0aW9uIChoYXNoZXIpIHtcblx0ICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChtZXNzYWdlLCBjZmcpIHtcblx0ICAgICAgICAgICAgICAgIHJldHVybiBuZXcgaGFzaGVyLmluaXQoY2ZnKS5maW5hbGl6ZShtZXNzYWdlKTtcblx0ICAgICAgICAgICAgfTtcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogQ3JlYXRlcyBhIHNob3J0Y3V0IGZ1bmN0aW9uIHRvIHRoZSBITUFDJ3Mgb2JqZWN0IGludGVyZmFjZS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7SGFzaGVyfSBoYXNoZXIgVGhlIGhhc2hlciB0byB1c2UgaW4gdGhpcyBITUFDIGhlbHBlci5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge0Z1bmN0aW9ufSBUaGUgc2hvcnRjdXQgZnVuY3Rpb24uXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAc3RhdGljXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciBIbWFjU0hBMjU2ID0gQ3J5cHRvSlMubGliLkhhc2hlci5fY3JlYXRlSG1hY0hlbHBlcihDcnlwdG9KUy5hbGdvLlNIQTI1Nik7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgX2NyZWF0ZUhtYWNIZWxwZXI6IGZ1bmN0aW9uIChoYXNoZXIpIHtcblx0ICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChtZXNzYWdlLCBrZXkpIHtcblx0ICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQ19hbGdvLkhNQUMuaW5pdChoYXNoZXIsIGtleSkuZmluYWxpemUobWVzc2FnZSk7XG5cdCAgICAgICAgICAgIH07XG5cdCAgICAgICAgfVxuXHQgICAgfSk7XG5cblx0ICAgIC8qKlxuXHQgICAgICogQWxnb3JpdGhtIG5hbWVzcGFjZS5cblx0ICAgICAqL1xuXHQgICAgdmFyIENfYWxnbyA9IEMuYWxnbyA9IHt9O1xuXG5cdCAgICByZXR1cm4gQztcblx0fShNYXRoKSk7XG5cblxuXHRyZXR1cm4gQ3J5cHRvSlM7XG5cbn0pKTsiLCI7KGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG5cdGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xuXHRcdC8vIENvbW1vbkpTXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gZmFjdG9yeShyZXF1aXJlKFwiLi9jb3JlXCIpKTtcblx0fVxuXHRlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuXHRcdC8vIEFNRFxuXHRcdGRlZmluZShbXCIuL2NvcmVcIl0sIGZhY3RvcnkpO1xuXHR9XG5cdGVsc2Uge1xuXHRcdC8vIEdsb2JhbCAoYnJvd3Nlcilcblx0XHRmYWN0b3J5KHJvb3QuQ3J5cHRvSlMpO1xuXHR9XG59KHRoaXMsIGZ1bmN0aW9uIChDcnlwdG9KUykge1xuXG5cdChmdW5jdGlvbiAoKSB7XG5cdCAgICAvLyBTaG9ydGN1dHNcblx0ICAgIHZhciBDID0gQ3J5cHRvSlM7XG5cdCAgICB2YXIgQ19saWIgPSBDLmxpYjtcblx0ICAgIHZhciBXb3JkQXJyYXkgPSBDX2xpYi5Xb3JkQXJyYXk7XG5cdCAgICB2YXIgSGFzaGVyID0gQ19saWIuSGFzaGVyO1xuXHQgICAgdmFyIENfYWxnbyA9IEMuYWxnbztcblxuXHQgICAgLy8gUmV1c2FibGUgb2JqZWN0XG5cdCAgICB2YXIgVyA9IFtdO1xuXG5cdCAgICAvKipcblx0ICAgICAqIFNIQS0xIGhhc2ggYWxnb3JpdGhtLlxuXHQgICAgICovXG5cdCAgICB2YXIgU0hBMSA9IENfYWxnby5TSEExID0gSGFzaGVyLmV4dGVuZCh7XG5cdCAgICAgICAgX2RvUmVzZXQ6IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgdGhpcy5faGFzaCA9IG5ldyBXb3JkQXJyYXkuaW5pdChbXG5cdCAgICAgICAgICAgICAgICAweDY3NDUyMzAxLCAweGVmY2RhYjg5LFxuXHQgICAgICAgICAgICAgICAgMHg5OGJhZGNmZSwgMHgxMDMyNTQ3Nixcblx0ICAgICAgICAgICAgICAgIDB4YzNkMmUxZjBcblx0ICAgICAgICAgICAgXSk7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIF9kb1Byb2Nlc3NCbG9jazogZnVuY3Rpb24gKE0sIG9mZnNldCkge1xuXHQgICAgICAgICAgICAvLyBTaG9ydGN1dFxuXHQgICAgICAgICAgICB2YXIgSCA9IHRoaXMuX2hhc2gud29yZHM7XG5cblx0ICAgICAgICAgICAgLy8gV29ya2luZyB2YXJpYWJsZXNcblx0ICAgICAgICAgICAgdmFyIGEgPSBIWzBdO1xuXHQgICAgICAgICAgICB2YXIgYiA9IEhbMV07XG5cdCAgICAgICAgICAgIHZhciBjID0gSFsyXTtcblx0ICAgICAgICAgICAgdmFyIGQgPSBIWzNdO1xuXHQgICAgICAgICAgICB2YXIgZSA9IEhbNF07XG5cblx0ICAgICAgICAgICAgLy8gQ29tcHV0YXRpb25cblx0ICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA4MDsgaSsrKSB7XG5cdCAgICAgICAgICAgICAgICBpZiAoaSA8IDE2KSB7XG5cdCAgICAgICAgICAgICAgICAgICAgV1tpXSA9IE1bb2Zmc2V0ICsgaV0gfCAwO1xuXHQgICAgICAgICAgICAgICAgfSBlbHNlIHtcblx0ICAgICAgICAgICAgICAgICAgICB2YXIgbiA9IFdbaSAtIDNdIF4gV1tpIC0gOF0gXiBXW2kgLSAxNF0gXiBXW2kgLSAxNl07XG5cdCAgICAgICAgICAgICAgICAgICAgV1tpXSA9IChuIDw8IDEpIHwgKG4gPj4+IDMxKTtcblx0ICAgICAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICAgICAgdmFyIHQgPSAoKGEgPDwgNSkgfCAoYSA+Pj4gMjcpKSArIGUgKyBXW2ldO1xuXHQgICAgICAgICAgICAgICAgaWYgKGkgPCAyMCkge1xuXHQgICAgICAgICAgICAgICAgICAgIHQgKz0gKChiICYgYykgfCAofmIgJiBkKSkgKyAweDVhODI3OTk5O1xuXHQgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpIDwgNDApIHtcblx0ICAgICAgICAgICAgICAgICAgICB0ICs9IChiIF4gYyBeIGQpICsgMHg2ZWQ5ZWJhMTtcblx0ICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaSA8IDYwKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgdCArPSAoKGIgJiBjKSB8IChiICYgZCkgfCAoYyAmIGQpKSAtIDB4NzBlNDQzMjQ7XG5cdCAgICAgICAgICAgICAgICB9IGVsc2UgLyogaWYgKGkgPCA4MCkgKi8ge1xuXHQgICAgICAgICAgICAgICAgICAgIHQgKz0gKGIgXiBjIF4gZCkgLSAweDM1OWQzZTJhO1xuXHQgICAgICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgICAgICBlID0gZDtcblx0ICAgICAgICAgICAgICAgIGQgPSBjO1xuXHQgICAgICAgICAgICAgICAgYyA9IChiIDw8IDMwKSB8IChiID4+PiAyKTtcblx0ICAgICAgICAgICAgICAgIGIgPSBhO1xuXHQgICAgICAgICAgICAgICAgYSA9IHQ7XG5cdCAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICAvLyBJbnRlcm1lZGlhdGUgaGFzaCB2YWx1ZVxuXHQgICAgICAgICAgICBIWzBdID0gKEhbMF0gKyBhKSB8IDA7XG5cdCAgICAgICAgICAgIEhbMV0gPSAoSFsxXSArIGIpIHwgMDtcblx0ICAgICAgICAgICAgSFsyXSA9IChIWzJdICsgYykgfCAwO1xuXHQgICAgICAgICAgICBIWzNdID0gKEhbM10gKyBkKSB8IDA7XG5cdCAgICAgICAgICAgIEhbNF0gPSAoSFs0XSArIGUpIHwgMDtcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgX2RvRmluYWxpemU6IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgLy8gU2hvcnRjdXRzXG5cdCAgICAgICAgICAgIHZhciBkYXRhID0gdGhpcy5fZGF0YTtcblx0ICAgICAgICAgICAgdmFyIGRhdGFXb3JkcyA9IGRhdGEud29yZHM7XG5cblx0ICAgICAgICAgICAgdmFyIG5CaXRzVG90YWwgPSB0aGlzLl9uRGF0YUJ5dGVzICogODtcblx0ICAgICAgICAgICAgdmFyIG5CaXRzTGVmdCA9IGRhdGEuc2lnQnl0ZXMgKiA4O1xuXG5cdCAgICAgICAgICAgIC8vIEFkZCBwYWRkaW5nXG5cdCAgICAgICAgICAgIGRhdGFXb3Jkc1tuQml0c0xlZnQgPj4+IDVdIHw9IDB4ODAgPDwgKDI0IC0gbkJpdHNMZWZ0ICUgMzIpO1xuXHQgICAgICAgICAgICBkYXRhV29yZHNbKCgobkJpdHNMZWZ0ICsgNjQpID4+PiA5KSA8PCA0KSArIDE0XSA9IE1hdGguZmxvb3IobkJpdHNUb3RhbCAvIDB4MTAwMDAwMDAwKTtcblx0ICAgICAgICAgICAgZGF0YVdvcmRzWygoKG5CaXRzTGVmdCArIDY0KSA+Pj4gOSkgPDwgNCkgKyAxNV0gPSBuQml0c1RvdGFsO1xuXHQgICAgICAgICAgICBkYXRhLnNpZ0J5dGVzID0gZGF0YVdvcmRzLmxlbmd0aCAqIDQ7XG5cblx0ICAgICAgICAgICAgLy8gSGFzaCBmaW5hbCBibG9ja3Ncblx0ICAgICAgICAgICAgdGhpcy5fcHJvY2VzcygpO1xuXG5cdCAgICAgICAgICAgIC8vIFJldHVybiBmaW5hbCBjb21wdXRlZCBoYXNoXG5cdCAgICAgICAgICAgIHJldHVybiB0aGlzLl9oYXNoO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICBjbG9uZTogZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICB2YXIgY2xvbmUgPSBIYXNoZXIuY2xvbmUuY2FsbCh0aGlzKTtcblx0ICAgICAgICAgICAgY2xvbmUuX2hhc2ggPSB0aGlzLl9oYXNoLmNsb25lKCk7XG5cblx0ICAgICAgICAgICAgcmV0dXJuIGNsb25lO1xuXHQgICAgICAgIH1cblx0ICAgIH0pO1xuXG5cdCAgICAvKipcblx0ICAgICAqIFNob3J0Y3V0IGZ1bmN0aW9uIHRvIHRoZSBoYXNoZXIncyBvYmplY3QgaW50ZXJmYWNlLlxuXHQgICAgICpcblx0ICAgICAqIEBwYXJhbSB7V29yZEFycmF5fHN0cmluZ30gbWVzc2FnZSBUaGUgbWVzc2FnZSB0byBoYXNoLlxuXHQgICAgICpcblx0ICAgICAqIEByZXR1cm4ge1dvcmRBcnJheX0gVGhlIGhhc2guXG5cdCAgICAgKlxuXHQgICAgICogQHN0YXRpY1xuXHQgICAgICpcblx0ICAgICAqIEBleGFtcGxlXG5cdCAgICAgKlxuXHQgICAgICogICAgIHZhciBoYXNoID0gQ3J5cHRvSlMuU0hBMSgnbWVzc2FnZScpO1xuXHQgICAgICogICAgIHZhciBoYXNoID0gQ3J5cHRvSlMuU0hBMSh3b3JkQXJyYXkpO1xuXHQgICAgICovXG5cdCAgICBDLlNIQTEgPSBIYXNoZXIuX2NyZWF0ZUhlbHBlcihTSEExKTtcblxuXHQgICAgLyoqXG5cdCAgICAgKiBTaG9ydGN1dCBmdW5jdGlvbiB0byB0aGUgSE1BQydzIG9iamVjdCBpbnRlcmZhY2UuXG5cdCAgICAgKlxuXHQgICAgICogQHBhcmFtIHtXb3JkQXJyYXl8c3RyaW5nfSBtZXNzYWdlIFRoZSBtZXNzYWdlIHRvIGhhc2guXG5cdCAgICAgKiBAcGFyYW0ge1dvcmRBcnJheXxzdHJpbmd9IGtleSBUaGUgc2VjcmV0IGtleS5cblx0ICAgICAqXG5cdCAgICAgKiBAcmV0dXJuIHtXb3JkQXJyYXl9IFRoZSBITUFDLlxuXHQgICAgICpcblx0ICAgICAqIEBzdGF0aWNcblx0ICAgICAqXG5cdCAgICAgKiBAZXhhbXBsZVxuXHQgICAgICpcblx0ICAgICAqICAgICB2YXIgaG1hYyA9IENyeXB0b0pTLkhtYWNTSEExKG1lc3NhZ2UsIGtleSk7XG5cdCAgICAgKi9cblx0ICAgIEMuSG1hY1NIQTEgPSBIYXNoZXIuX2NyZWF0ZUhtYWNIZWxwZXIoU0hBMSk7XG5cdH0oKSk7XG5cblxuXHRyZXR1cm4gQ3J5cHRvSlMuU0hBMTtcblxufSkpOyIsIi8vICAgICB1dWlkLmpzXG4vL1xuLy8gICAgIENvcHlyaWdodCAoYykgMjAxMC0yMDEyIFJvYmVydCBLaWVmZmVyXG4vLyAgICAgTUlUIExpY2Vuc2UgLSBodHRwOi8vb3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIF9nbG9iYWwgPSB0aGlzO1xuXG4gIC8vIFVuaXF1ZSBJRCBjcmVhdGlvbiByZXF1aXJlcyBhIGhpZ2ggcXVhbGl0eSByYW5kb20gIyBnZW5lcmF0b3IuICBXZSBmZWF0dXJlXG4gIC8vIGRldGVjdCB0byBkZXRlcm1pbmUgdGhlIGJlc3QgUk5HIHNvdXJjZSwgbm9ybWFsaXppbmcgdG8gYSBmdW5jdGlvbiB0aGF0XG4gIC8vIHJldHVybnMgMTI4LWJpdHMgb2YgcmFuZG9tbmVzcywgc2luY2UgdGhhdCdzIHdoYXQncyB1c3VhbGx5IHJlcXVpcmVkXG4gIHZhciBfcm5nO1xuXG4gIC8vIE5vZGUuanMgY3J5cHRvLWJhc2VkIFJORyAtIGh0dHA6Ly9ub2RlanMub3JnL2RvY3MvdjAuNi4yL2FwaS9jcnlwdG8uaHRtbFxuICAvL1xuICAvLyBNb2RlcmF0ZWx5IGZhc3QsIGhpZ2ggcXVhbGl0eVxuICBpZiAodHlwZW9mKF9nbG9iYWwucmVxdWlyZSkgPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRyeSB7XG4gICAgICB2YXIgX3JiID0gX2dsb2JhbC5yZXF1aXJlKCdjcnlwdG8nKS5yYW5kb21CeXRlcztcbiAgICAgIF9ybmcgPSBfcmIgJiYgZnVuY3Rpb24oKSB7cmV0dXJuIF9yYigxNik7fTtcbiAgICB9IGNhdGNoKGUpIHt9XG4gIH1cblxuICBpZiAoIV9ybmcgJiYgX2dsb2JhbC5jcnlwdG8gJiYgY3J5cHRvLmdldFJhbmRvbVZhbHVlcykge1xuICAgIC8vIFdIQVRXRyBjcnlwdG8tYmFzZWQgUk5HIC0gaHR0cDovL3dpa2kud2hhdHdnLm9yZy93aWtpL0NyeXB0b1xuICAgIC8vXG4gICAgLy8gTW9kZXJhdGVseSBmYXN0LCBoaWdoIHF1YWxpdHlcbiAgICB2YXIgX3JuZHM4ID0gbmV3IFVpbnQ4QXJyYXkoMTYpO1xuICAgIF9ybmcgPSBmdW5jdGlvbiB3aGF0d2dSTkcoKSB7XG4gICAgICBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKF9ybmRzOCk7XG4gICAgICByZXR1cm4gX3JuZHM4O1xuICAgIH07XG4gIH1cblxuICBpZiAoIV9ybmcpIHtcbiAgICAvLyBNYXRoLnJhbmRvbSgpLWJhc2VkIChSTkcpXG4gICAgLy9cbiAgICAvLyBJZiBhbGwgZWxzZSBmYWlscywgdXNlIE1hdGgucmFuZG9tKCkuICBJdCdzIGZhc3QsIGJ1dCBpcyBvZiB1bnNwZWNpZmllZFxuICAgIC8vIHF1YWxpdHkuXG4gICAgdmFyICBfcm5kcyA9IG5ldyBBcnJheSgxNik7XG4gICAgX3JuZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIHI7IGkgPCAxNjsgaSsrKSB7XG4gICAgICAgIGlmICgoaSAmIDB4MDMpID09PSAwKSByID0gTWF0aC5yYW5kb20oKSAqIDB4MTAwMDAwMDAwO1xuICAgICAgICBfcm5kc1tpXSA9IHIgPj4+ICgoaSAmIDB4MDMpIDw8IDMpICYgMHhmZjtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIF9ybmRzO1xuICAgIH07XG4gIH1cblxuICAvLyBCdWZmZXIgY2xhc3MgdG8gdXNlXG4gIHZhciBCdWZmZXJDbGFzcyA9IHR5cGVvZihfZ2xvYmFsLkJ1ZmZlcikgPT0gJ2Z1bmN0aW9uJyA/IF9nbG9iYWwuQnVmZmVyIDogQXJyYXk7XG5cbiAgLy8gTWFwcyBmb3IgbnVtYmVyIDwtPiBoZXggc3RyaW5nIGNvbnZlcnNpb25cbiAgdmFyIF9ieXRlVG9IZXggPSBbXTtcbiAgdmFyIF9oZXhUb0J5dGUgPSB7fTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCAyNTY7IGkrKykge1xuICAgIF9ieXRlVG9IZXhbaV0gPSAoaSArIDB4MTAwKS50b1N0cmluZygxNikuc3Vic3RyKDEpO1xuICAgIF9oZXhUb0J5dGVbX2J5dGVUb0hleFtpXV0gPSBpO1xuICB9XG5cbiAgLy8gKipgcGFyc2UoKWAgLSBQYXJzZSBhIFVVSUQgaW50byBpdCdzIGNvbXBvbmVudCBieXRlcyoqXG4gIGZ1bmN0aW9uIHBhcnNlKHMsIGJ1Ziwgb2Zmc2V0KSB7XG4gICAgdmFyIGkgPSAoYnVmICYmIG9mZnNldCkgfHwgMCwgaWkgPSAwO1xuXG4gICAgYnVmID0gYnVmIHx8IFtdO1xuICAgIHMudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9bMC05YS1mXXsyfS9nLCBmdW5jdGlvbihvY3QpIHtcbiAgICAgIGlmIChpaSA8IDE2KSB7IC8vIERvbid0IG92ZXJmbG93IVxuICAgICAgICBidWZbaSArIGlpKytdID0gX2hleFRvQnl0ZVtvY3RdO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gWmVybyBvdXQgcmVtYWluaW5nIGJ5dGVzIGlmIHN0cmluZyB3YXMgc2hvcnRcbiAgICB3aGlsZSAoaWkgPCAxNikge1xuICAgICAgYnVmW2kgKyBpaSsrXSA9IDA7XG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1ZjtcbiAgfVxuXG4gIC8vICoqYHVucGFyc2UoKWAgLSBDb252ZXJ0IFVVSUQgYnl0ZSBhcnJheSAoYWxhIHBhcnNlKCkpIGludG8gYSBzdHJpbmcqKlxuICBmdW5jdGlvbiB1bnBhcnNlKGJ1Ziwgb2Zmc2V0KSB7XG4gICAgdmFyIGkgPSBvZmZzZXQgfHwgMCwgYnRoID0gX2J5dGVUb0hleDtcbiAgICByZXR1cm4gIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICtcbiAgICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICsgJy0nICtcbiAgICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICsgJy0nICtcbiAgICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICsgJy0nICtcbiAgICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICsgJy0nICtcbiAgICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICtcbiAgICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICtcbiAgICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dO1xuICB9XG5cbiAgLy8gKipgdjEoKWAgLSBHZW5lcmF0ZSB0aW1lLWJhc2VkIFVVSUQqKlxuICAvL1xuICAvLyBJbnNwaXJlZCBieSBodHRwczovL2dpdGh1Yi5jb20vTGlvc0svVVVJRC5qc1xuICAvLyBhbmQgaHR0cDovL2RvY3MucHl0aG9uLm9yZy9saWJyYXJ5L3V1aWQuaHRtbFxuXG4gIC8vIHJhbmRvbSAjJ3Mgd2UgbmVlZCB0byBpbml0IG5vZGUgYW5kIGNsb2Nrc2VxXG4gIHZhciBfc2VlZEJ5dGVzID0gX3JuZygpO1xuXG4gIC8vIFBlciA0LjUsIGNyZWF0ZSBhbmQgNDgtYml0IG5vZGUgaWQsICg0NyByYW5kb20gYml0cyArIG11bHRpY2FzdCBiaXQgPSAxKVxuICB2YXIgX25vZGVJZCA9IFtcbiAgICBfc2VlZEJ5dGVzWzBdIHwgMHgwMSxcbiAgICBfc2VlZEJ5dGVzWzFdLCBfc2VlZEJ5dGVzWzJdLCBfc2VlZEJ5dGVzWzNdLCBfc2VlZEJ5dGVzWzRdLCBfc2VlZEJ5dGVzWzVdXG4gIF07XG5cbiAgLy8gUGVyIDQuMi4yLCByYW5kb21pemUgKDE0IGJpdCkgY2xvY2tzZXFcbiAgdmFyIF9jbG9ja3NlcSA9IChfc2VlZEJ5dGVzWzZdIDw8IDggfCBfc2VlZEJ5dGVzWzddKSAmIDB4M2ZmZjtcblxuICAvLyBQcmV2aW91cyB1dWlkIGNyZWF0aW9uIHRpbWVcbiAgdmFyIF9sYXN0TVNlY3MgPSAwLCBfbGFzdE5TZWNzID0gMDtcblxuICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2Jyb29mYS9ub2RlLXV1aWQgZm9yIEFQSSBkZXRhaWxzXG4gIGZ1bmN0aW9uIHYxKG9wdGlvbnMsIGJ1Ziwgb2Zmc2V0KSB7XG4gICAgdmFyIGkgPSBidWYgJiYgb2Zmc2V0IHx8IDA7XG4gICAgdmFyIGIgPSBidWYgfHwgW107XG5cbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHZhciBjbG9ja3NlcSA9IG9wdGlvbnMuY2xvY2tzZXEgIT0gbnVsbCA/IG9wdGlvbnMuY2xvY2tzZXEgOiBfY2xvY2tzZXE7XG5cbiAgICAvLyBVVUlEIHRpbWVzdGFtcHMgYXJlIDEwMCBuYW5vLXNlY29uZCB1bml0cyBzaW5jZSB0aGUgR3JlZ29yaWFuIGVwb2NoLFxuICAgIC8vICgxNTgyLTEwLTE1IDAwOjAwKS4gIEpTTnVtYmVycyBhcmVuJ3QgcHJlY2lzZSBlbm91Z2ggZm9yIHRoaXMsIHNvXG4gICAgLy8gdGltZSBpcyBoYW5kbGVkIGludGVybmFsbHkgYXMgJ21zZWNzJyAoaW50ZWdlciBtaWxsaXNlY29uZHMpIGFuZCAnbnNlY3MnXG4gICAgLy8gKDEwMC1uYW5vc2Vjb25kcyBvZmZzZXQgZnJvbSBtc2Vjcykgc2luY2UgdW5peCBlcG9jaCwgMTk3MC0wMS0wMSAwMDowMC5cbiAgICB2YXIgbXNlY3MgPSBvcHRpb25zLm1zZWNzICE9IG51bGwgPyBvcHRpb25zLm1zZWNzIDogbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cbiAgICAvLyBQZXIgNC4yLjEuMiwgdXNlIGNvdW50IG9mIHV1aWQncyBnZW5lcmF0ZWQgZHVyaW5nIHRoZSBjdXJyZW50IGNsb2NrXG4gICAgLy8gY3ljbGUgdG8gc2ltdWxhdGUgaGlnaGVyIHJlc29sdXRpb24gY2xvY2tcbiAgICB2YXIgbnNlY3MgPSBvcHRpb25zLm5zZWNzICE9IG51bGwgPyBvcHRpb25zLm5zZWNzIDogX2xhc3ROU2VjcyArIDE7XG5cbiAgICAvLyBUaW1lIHNpbmNlIGxhc3QgdXVpZCBjcmVhdGlvbiAoaW4gbXNlY3MpXG4gICAgdmFyIGR0ID0gKG1zZWNzIC0gX2xhc3RNU2VjcykgKyAobnNlY3MgLSBfbGFzdE5TZWNzKS8xMDAwMDtcblxuICAgIC8vIFBlciA0LjIuMS4yLCBCdW1wIGNsb2Nrc2VxIG9uIGNsb2NrIHJlZ3Jlc3Npb25cbiAgICBpZiAoZHQgPCAwICYmIG9wdGlvbnMuY2xvY2tzZXEgPT0gbnVsbCkge1xuICAgICAgY2xvY2tzZXEgPSBjbG9ja3NlcSArIDEgJiAweDNmZmY7XG4gICAgfVxuXG4gICAgLy8gUmVzZXQgbnNlY3MgaWYgY2xvY2sgcmVncmVzc2VzIChuZXcgY2xvY2tzZXEpIG9yIHdlJ3ZlIG1vdmVkIG9udG8gYSBuZXdcbiAgICAvLyB0aW1lIGludGVydmFsXG4gICAgaWYgKChkdCA8IDAgfHwgbXNlY3MgPiBfbGFzdE1TZWNzKSAmJiBvcHRpb25zLm5zZWNzID09IG51bGwpIHtcbiAgICAgIG5zZWNzID0gMDtcbiAgICB9XG5cbiAgICAvLyBQZXIgNC4yLjEuMiBUaHJvdyBlcnJvciBpZiB0b28gbWFueSB1dWlkcyBhcmUgcmVxdWVzdGVkXG4gICAgaWYgKG5zZWNzID49IDEwMDAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3V1aWQudjEoKTogQ2FuXFwndCBjcmVhdGUgbW9yZSB0aGFuIDEwTSB1dWlkcy9zZWMnKTtcbiAgICB9XG5cbiAgICBfbGFzdE1TZWNzID0gbXNlY3M7XG4gICAgX2xhc3ROU2VjcyA9IG5zZWNzO1xuICAgIF9jbG9ja3NlcSA9IGNsb2Nrc2VxO1xuXG4gICAgLy8gUGVyIDQuMS40IC0gQ29udmVydCBmcm9tIHVuaXggZXBvY2ggdG8gR3JlZ29yaWFuIGVwb2NoXG4gICAgbXNlY3MgKz0gMTIyMTkyOTI4MDAwMDA7XG5cbiAgICAvLyBgdGltZV9sb3dgXG4gICAgdmFyIHRsID0gKChtc2VjcyAmIDB4ZmZmZmZmZikgKiAxMDAwMCArIG5zZWNzKSAlIDB4MTAwMDAwMDAwO1xuICAgIGJbaSsrXSA9IHRsID4+PiAyNCAmIDB4ZmY7XG4gICAgYltpKytdID0gdGwgPj4+IDE2ICYgMHhmZjtcbiAgICBiW2krK10gPSB0bCA+Pj4gOCAmIDB4ZmY7XG4gICAgYltpKytdID0gdGwgJiAweGZmO1xuXG4gICAgLy8gYHRpbWVfbWlkYFxuICAgIHZhciB0bWggPSAobXNlY3MgLyAweDEwMDAwMDAwMCAqIDEwMDAwKSAmIDB4ZmZmZmZmZjtcbiAgICBiW2krK10gPSB0bWggPj4+IDggJiAweGZmO1xuICAgIGJbaSsrXSA9IHRtaCAmIDB4ZmY7XG5cbiAgICAvLyBgdGltZV9oaWdoX2FuZF92ZXJzaW9uYFxuICAgIGJbaSsrXSA9IHRtaCA+Pj4gMjQgJiAweGYgfCAweDEwOyAvLyBpbmNsdWRlIHZlcnNpb25cbiAgICBiW2krK10gPSB0bWggPj4+IDE2ICYgMHhmZjtcblxuICAgIC8vIGBjbG9ja19zZXFfaGlfYW5kX3Jlc2VydmVkYCAoUGVyIDQuMi4yIC0gaW5jbHVkZSB2YXJpYW50KVxuICAgIGJbaSsrXSA9IGNsb2Nrc2VxID4+PiA4IHwgMHg4MDtcblxuICAgIC8vIGBjbG9ja19zZXFfbG93YFxuICAgIGJbaSsrXSA9IGNsb2Nrc2VxICYgMHhmZjtcblxuICAgIC8vIGBub2RlYFxuICAgIHZhciBub2RlID0gb3B0aW9ucy5ub2RlIHx8IF9ub2RlSWQ7XG4gICAgZm9yICh2YXIgbiA9IDA7IG4gPCA2OyBuKyspIHtcbiAgICAgIGJbaSArIG5dID0gbm9kZVtuXTtcbiAgICB9XG5cbiAgICByZXR1cm4gYnVmID8gYnVmIDogdW5wYXJzZShiKTtcbiAgfVxuXG4gIC8vICoqYHY0KClgIC0gR2VuZXJhdGUgcmFuZG9tIFVVSUQqKlxuXG4gIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vYnJvb2ZhL25vZGUtdXVpZCBmb3IgQVBJIGRldGFpbHNcbiAgZnVuY3Rpb24gdjQob3B0aW9ucywgYnVmLCBvZmZzZXQpIHtcbiAgICAvLyBEZXByZWNhdGVkIC0gJ2Zvcm1hdCcgYXJndW1lbnQsIGFzIHN1cHBvcnRlZCBpbiB2MS4yXG4gICAgdmFyIGkgPSBidWYgJiYgb2Zmc2V0IHx8IDA7XG5cbiAgICBpZiAodHlwZW9mKG9wdGlvbnMpID09ICdzdHJpbmcnKSB7XG4gICAgICBidWYgPSBvcHRpb25zID09ICdiaW5hcnknID8gbmV3IEJ1ZmZlckNsYXNzKDE2KSA6IG51bGw7XG4gICAgICBvcHRpb25zID0gbnVsbDtcbiAgICB9XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICB2YXIgcm5kcyA9IG9wdGlvbnMucmFuZG9tIHx8IChvcHRpb25zLnJuZyB8fCBfcm5nKSgpO1xuXG4gICAgLy8gUGVyIDQuNCwgc2V0IGJpdHMgZm9yIHZlcnNpb24gYW5kIGBjbG9ja19zZXFfaGlfYW5kX3Jlc2VydmVkYFxuICAgIHJuZHNbNl0gPSAocm5kc1s2XSAmIDB4MGYpIHwgMHg0MDtcbiAgICBybmRzWzhdID0gKHJuZHNbOF0gJiAweDNmKSB8IDB4ODA7XG5cbiAgICAvLyBDb3B5IGJ5dGVzIHRvIGJ1ZmZlciwgaWYgcHJvdmlkZWRcbiAgICBpZiAoYnVmKSB7XG4gICAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgMTY7IGlpKyspIHtcbiAgICAgICAgYnVmW2kgKyBpaV0gPSBybmRzW2lpXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYnVmIHx8IHVucGFyc2Uocm5kcyk7XG4gIH1cblxuICAvLyBFeHBvcnQgcHVibGljIEFQSVxuICB2YXIgdXVpZCA9IHY0O1xuICB1dWlkLnYxID0gdjE7XG4gIHV1aWQudjQgPSB2NDtcbiAgdXVpZC5wYXJzZSA9IHBhcnNlO1xuICB1dWlkLnVucGFyc2UgPSB1bnBhcnNlO1xuICB1dWlkLkJ1ZmZlckNsYXNzID0gQnVmZmVyQ2xhc3M7XG5cbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIC8vIFB1Ymxpc2ggYXMgQU1EIG1vZHVsZVxuICAgIGRlZmluZShmdW5jdGlvbigpIHtyZXR1cm4gdXVpZDt9KTtcbiAgfSBlbHNlIGlmICh0eXBlb2YobW9kdWxlKSAhPSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgIC8vIFB1Ymxpc2ggYXMgbm9kZS5qcyBtb2R1bGVcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHV1aWQ7XG4gIH0gZWxzZSB7XG4gICAgLy8gUHVibGlzaCBhcyBnbG9iYWwgKGluIGJyb3dzZXJzKVxuICAgIHZhciBfcHJldmlvdXNSb290ID0gX2dsb2JhbC51dWlkO1xuXG4gICAgLy8gKipgbm9Db25mbGljdCgpYCAtIChicm93c2VyIG9ubHkpIHRvIHJlc2V0IGdsb2JhbCAndXVpZCcgdmFyKipcbiAgICB1dWlkLm5vQ29uZmxpY3QgPSBmdW5jdGlvbigpIHtcbiAgICAgIF9nbG9iYWwudXVpZCA9IF9wcmV2aW91c1Jvb3Q7XG4gICAgICByZXR1cm4gdXVpZDtcbiAgICB9O1xuXG4gICAgX2dsb2JhbC51dWlkID0gdXVpZDtcbiAgfVxufSkuY2FsbCh0aGlzKTtcbiIsInZhciBBZGFwdGVycywgU3RvcmFnZSwgdXRpbHMsXG4gIGJpbmQgPSBmdW5jdGlvbihmbiwgbWUpeyByZXR1cm4gZnVuY3Rpb24oKXsgcmV0dXJuIGZuLmFwcGx5KG1lLCBhcmd1bWVudHMpOyB9OyB9O1xuXG51dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxuU3RvcmFnZSA9IHJlcXVpcmUoJy4vc3RvcmFnZScpO1xuXG5BZGFwdGVycyA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gQWRhcHRlcnMoKSB7fVxuXG4gIEFkYXB0ZXJzLkdpbWVsQWRhcHRlciA9IChmdW5jdGlvbigpIHtcbiAgICBHaW1lbEFkYXB0ZXIucHJvdG90eXBlLnF1ZXVlX25hbWUgPSAnX2dpbWVsX3F1ZXVlJztcblxuICAgIGZ1bmN0aW9uIEdpbWVsQWRhcHRlcih1cmwsIG5hbWVzcGFjZSwgc3RvcmFnZSkge1xuICAgICAgaWYgKHN0b3JhZ2UgPT0gbnVsbCkge1xuICAgICAgICBzdG9yYWdlID0gQWRhcHRlcnMuTG9jYWxTdG9yYWdlQWRhcHRlcjtcbiAgICAgIH1cbiAgICAgIHRoaXMuZ29hbF9jb21wbGV0ZSA9IGJpbmQodGhpcy5nb2FsX2NvbXBsZXRlLCB0aGlzKTtcbiAgICAgIHRoaXMuZXhwZXJpbWVudF9zdGFydCA9IGJpbmQodGhpcy5leHBlcmltZW50X3N0YXJ0LCB0aGlzKTtcbiAgICAgIHRoaXMuX3N0b3JhZ2UgPSBzdG9yYWdlO1xuICAgICAgdGhpcy51cmwgPSB1cmw7XG4gICAgICB0aGlzLm5hbWVzcGFjZSA9IG5hbWVzcGFjZTtcbiAgICAgIHRoaXMuX3F1ZXVlID0gSlNPTi5wYXJzZSh0aGlzLl9zdG9yYWdlLmdldCh0aGlzLnF1ZXVlX25hbWUpIHx8ICdbXScpO1xuICAgICAgdGhpcy5fZmx1c2goKTtcbiAgICB9XG5cbiAgICBHaW1lbEFkYXB0ZXIucHJvdG90eXBlLl9yZW1vdmVfcXV1aWQgPSBmdW5jdGlvbihxdXVpZCkge1xuICAgICAgcmV0dXJuIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZXJyLCByZXMpIHtcbiAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIHV0aWxzLnJlbW92ZShfdGhpcy5fcXVldWUsIGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgICAgICByZXR1cm4gZWwucHJvcGVydGllcy5fcXV1aWQgPT09IHF1dWlkO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBfdGhpcy5fc3RvcmFnZS5zZXQoX3RoaXMucXVldWVfbmFtZSwgSlNPTi5zdHJpbmdpZnkoX3RoaXMuX3F1ZXVlKSk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKTtcbiAgICB9O1xuXG4gICAgR2ltZWxBZGFwdGVyLnByb3RvdHlwZS5fanF1ZXJ5X2dldCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgIHV0aWxzLmxvZygnc2VuZCByZXF1ZXN0IHVzaW5nIGpRdWVyeScpO1xuICAgICAgcmV0dXJuIHdpbmRvdy5qUXVlcnkuYWpheCh7XG4gICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgIHVybDogdXJsLFxuICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICBzdWNjZXNzOiBjYWxsYmFja1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIEdpbWVsQWRhcHRlci5wcm90b3R5cGUuX3BsYWluX2pzX2dldCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgIHZhciBrLCBwYXJhbXMsIHYsIHhocjtcbiAgICAgIHV0aWxzLmxvZygnZmFsbGJhY2sgb24gcGxhaW4ganMgeGhyJyk7XG4gICAgICB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgIHBhcmFtcyA9IChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlc3VsdHM7XG4gICAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgICAgZm9yIChrIGluIGRhdGEpIHtcbiAgICAgICAgICB2ID0gZGF0YVtrXTtcbiAgICAgICAgICByZXN1bHRzLnB1c2goKGVuY29kZVVSSUNvbXBvbmVudChrKSkgKyBcIj1cIiArIChlbmNvZGVVUklDb21wb25lbnQodikpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgIH0pKCk7XG4gICAgICBwYXJhbXMgPSBwYXJhbXMuam9pbignJicpLnJlcGxhY2UoLyUyMC9nLCAnKycpO1xuICAgICAgeGhyLm9wZW4oJ0dFVCcsIHVybCArIFwiP1wiICsgcGFyYW1zKTtcbiAgICAgIHhoci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHhoci5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgIHJldHVybiBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgcmV0dXJuIHhoci5zZW5kKCk7XG4gICAgfTtcblxuICAgIEdpbWVsQWRhcHRlci5wcm90b3R5cGUuX2FqYXhfZ2V0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBjYWxsYmFjaykge1xuICAgICAgdmFyIHJlZjtcbiAgICAgIGlmICgocmVmID0gd2luZG93LmpRdWVyeSkgIT0gbnVsbCA/IHJlZi5hamF4IDogdm9pZCAwKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9qcXVlcnlfZ2V0KHVybCwgZGF0YSwgY2FsbGJhY2spO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BsYWluX2pzX2dldCh1cmwsIGRhdGEsIGNhbGxiYWNrKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgR2ltZWxBZGFwdGVyLnByb3RvdHlwZS5fZmx1c2ggPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjYWxsYmFjaywgaSwgaXRlbSwgbGVuLCByZWYsIHJlc3VsdHM7XG4gICAgICByZWYgPSB0aGlzLl9xdWV1ZTtcbiAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoaSA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBpdGVtID0gcmVmW2ldO1xuICAgICAgICBjYWxsYmFjayA9IHRoaXMuX3JlbW92ZV9xdXVpZChpdGVtLnByb3BlcnRpZXMuX3F1dWlkKTtcbiAgICAgICAgdGhpcy5fYWpheF9nZXQodGhpcy51cmwsIHV0aWxzLm9taXQoaXRlbS5wcm9wZXJ0aWVzLCAnX3F1dWlkJyksIGNhbGxiYWNrKTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKG51bGwpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfTtcblxuICAgIEdpbWVsQWRhcHRlci5wcm90b3R5cGUuX3VzZXJfdXVpZCA9IGZ1bmN0aW9uKGV4cGVyaW1lbnQsIGdvYWwpIHtcbiAgICAgIGlmICghZXhwZXJpbWVudC51c2VyX2lkKSB7XG4gICAgICAgIHJldHVybiB1dGlscy51dWlkKCk7XG4gICAgICB9XG4gICAgICBpZiAoIWdvYWwudW5pcXVlKSB7XG4gICAgICAgIHJldHVybiB1dGlscy51dWlkKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdXRpbHMuc2hhMSh0aGlzLm5hbWVzcGFjZSArIFwiLlwiICsgZXhwZXJpbWVudC5uYW1lICsgXCIuXCIgKyBleHBlcmltZW50LnVzZXJfaWQpO1xuICAgIH07XG5cbiAgICBHaW1lbEFkYXB0ZXIucHJvdG90eXBlLl90cmFjayA9IGZ1bmN0aW9uKGV4cGVyaW1lbnQsIHZhcmlhbnQsIGdvYWwpIHtcbiAgICAgIHV0aWxzLmxvZyhcIlBlcnNpc3RlbnQgUXVldWUgR2ltZWwgdHJhY2s6IFwiICsgdGhpcy5uYW1lc3BhY2UgKyBcIiwgXCIgKyBleHBlcmltZW50Lm5hbWUgKyBcIiwgXCIgKyB2YXJpYW50ICsgXCIsIFwiICsgZ29hbC5uYW1lKTtcbiAgICAgIGlmICh0aGlzLl9xdWV1ZS5sZW5ndGggPiAxMDApIHtcbiAgICAgICAgdGhpcy5fcXVldWUuc2hpZnQoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3F1ZXVlLnB1c2goe1xuICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgZXhwZXJpbWVudDogZXhwZXJpbWVudC5uYW1lLFxuICAgICAgICAgIF9xdXVpZDogdXRpbHMudXVpZCgpLFxuICAgICAgICAgIHV1aWQ6IHRoaXMuX3VzZXJfdXVpZChleHBlcmltZW50LCBnb2FsKSxcbiAgICAgICAgICB2YXJpYW50OiB2YXJpYW50LFxuICAgICAgICAgIGV2ZW50OiBnb2FsLm5hbWUsXG4gICAgICAgICAgbmFtZXNwYWNlOiB0aGlzLm5hbWVzcGFjZVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX3N0b3JhZ2Uuc2V0KHRoaXMucXVldWVfbmFtZSwgSlNPTi5zdHJpbmdpZnkodGhpcy5fcXVldWUpKTtcbiAgICAgIHJldHVybiB0aGlzLl9mbHVzaCgpO1xuICAgIH07XG5cbiAgICBHaW1lbEFkYXB0ZXIucHJvdG90eXBlLmV4cGVyaW1lbnRfc3RhcnQgPSBmdW5jdGlvbihleHBlcmltZW50LCB2YXJpYW50KSB7XG4gICAgICByZXR1cm4gdGhpcy5fdHJhY2soZXhwZXJpbWVudCwgdmFyaWFudCwge1xuICAgICAgICBuYW1lOiAncGFydGljaXBhdGUnLFxuICAgICAgICB1bmlxdWU6IHRydWVcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBHaW1lbEFkYXB0ZXIucHJvdG90eXBlLmdvYWxfY29tcGxldGUgPSBmdW5jdGlvbihleHBlcmltZW50LCB2YXJpYW50LCBnb2FsX25hbWUsIHByb3BzKSB7XG4gICAgICByZXR1cm4gdGhpcy5fdHJhY2soZXhwZXJpbWVudCwgdmFyaWFudCwgdXRpbHMuZGVmYXVsdHMoe1xuICAgICAgICBuYW1lOiBnb2FsX25hbWVcbiAgICAgIH0sIHByb3BzKSk7XG4gICAgfTtcblxuICAgIHJldHVybiBHaW1lbEFkYXB0ZXI7XG5cbiAgfSkoKTtcblxuICBBZGFwdGVycy5QZXJzaXN0ZW50UXVldWVHb29nbGVBbmFseXRpY3NBZGFwdGVyID0gKGZ1bmN0aW9uKCkge1xuICAgIFBlcnNpc3RlbnRRdWV1ZUdvb2dsZUFuYWx5dGljc0FkYXB0ZXIucHJvdG90eXBlLm5hbWVzcGFjZSA9ICdhbGVwaGJldCc7XG5cbiAgICBQZXJzaXN0ZW50UXVldWVHb29nbGVBbmFseXRpY3NBZGFwdGVyLnByb3RvdHlwZS5xdWV1ZV9uYW1lID0gJ19nYV9xdWV1ZSc7XG5cbiAgICBmdW5jdGlvbiBQZXJzaXN0ZW50UXVldWVHb29nbGVBbmFseXRpY3NBZGFwdGVyKHN0b3JhZ2UpIHtcbiAgICAgIGlmIChzdG9yYWdlID09IG51bGwpIHtcbiAgICAgICAgc3RvcmFnZSA9IEFkYXB0ZXJzLkxvY2FsU3RvcmFnZUFkYXB0ZXI7XG4gICAgICB9XG4gICAgICB0aGlzLmdvYWxfY29tcGxldGUgPSBiaW5kKHRoaXMuZ29hbF9jb21wbGV0ZSwgdGhpcyk7XG4gICAgICB0aGlzLmV4cGVyaW1lbnRfc3RhcnQgPSBiaW5kKHRoaXMuZXhwZXJpbWVudF9zdGFydCwgdGhpcyk7XG4gICAgICB0aGlzLl9zdG9yYWdlID0gc3RvcmFnZTtcbiAgICAgIHRoaXMuX3F1ZXVlID0gSlNPTi5wYXJzZSh0aGlzLl9zdG9yYWdlLmdldCh0aGlzLnF1ZXVlX25hbWUpIHx8ICdbXScpO1xuICAgICAgdGhpcy5fZmx1c2goKTtcbiAgICB9XG5cbiAgICBQZXJzaXN0ZW50UXVldWVHb29nbGVBbmFseXRpY3NBZGFwdGVyLnByb3RvdHlwZS5fcmVtb3ZlX3V1aWQgPSBmdW5jdGlvbih1dWlkKSB7XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICB1dGlscy5yZW1vdmUoX3RoaXMuX3F1ZXVlLCBmdW5jdGlvbihlbCkge1xuICAgICAgICAgICAgcmV0dXJuIGVsLnV1aWQgPT09IHV1aWQ7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLl9zdG9yYWdlLnNldChfdGhpcy5xdWV1ZV9uYW1lLCBKU09OLnN0cmluZ2lmeShfdGhpcy5fcXVldWUpKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpO1xuICAgIH07XG5cbiAgICBQZXJzaXN0ZW50UXVldWVHb29nbGVBbmFseXRpY3NBZGFwdGVyLnByb3RvdHlwZS5fZmx1c2ggPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjYWxsYmFjaywgaSwgaXRlbSwgbGVuLCByZWYsIHJlc3VsdHM7XG4gICAgICBpZiAodHlwZW9mIGdhICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignZ2Egbm90IGRlZmluZWQuIFBsZWFzZSBtYWtlIHN1cmUgeW91ciBVbml2ZXJzYWwgYW5hbHl0aWNzIGlzIHNldCB1cCBjb3JyZWN0bHknKTtcbiAgICAgIH1cbiAgICAgIHJlZiA9IHRoaXMuX3F1ZXVlO1xuICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGl0ZW0gPSByZWZbaV07XG4gICAgICAgIGNhbGxiYWNrID0gdGhpcy5fcmVtb3ZlX3V1aWQoaXRlbS51dWlkKTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKGdhKCdzZW5kJywgJ2V2ZW50JywgaXRlbS5jYXRlZ29yeSwgaXRlbS5hY3Rpb24sIGl0ZW0ubGFiZWwsIHtcbiAgICAgICAgICAnaGl0Q2FsbGJhY2snOiBjYWxsYmFjayxcbiAgICAgICAgICAnbm9uSW50ZXJhY3Rpb24nOiAxXG4gICAgICAgIH0pKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH07XG5cbiAgICBQZXJzaXN0ZW50UXVldWVHb29nbGVBbmFseXRpY3NBZGFwdGVyLnByb3RvdHlwZS5fdHJhY2sgPSBmdW5jdGlvbihjYXRlZ29yeSwgYWN0aW9uLCBsYWJlbCkge1xuICAgICAgdXRpbHMubG9nKFwiUGVyc2lzdGVudCBRdWV1ZSBHb29nbGUgVW5pdmVyc2FsIEFuYWx5dGljcyB0cmFjazogXCIgKyBjYXRlZ29yeSArIFwiLCBcIiArIGFjdGlvbiArIFwiLCBcIiArIGxhYmVsKTtcbiAgICAgIGlmICh0aGlzLl9xdWV1ZS5sZW5ndGggPiAxMDApIHtcbiAgICAgICAgdGhpcy5fcXVldWUuc2hpZnQoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3F1ZXVlLnB1c2goe1xuICAgICAgICB1dWlkOiB1dGlscy51dWlkKCksXG4gICAgICAgIGNhdGVnb3J5OiBjYXRlZ29yeSxcbiAgICAgICAgYWN0aW9uOiBhY3Rpb24sXG4gICAgICAgIGxhYmVsOiBsYWJlbFxuICAgICAgfSk7XG4gICAgICB0aGlzLl9zdG9yYWdlLnNldCh0aGlzLnF1ZXVlX25hbWUsIEpTT04uc3RyaW5naWZ5KHRoaXMuX3F1ZXVlKSk7XG4gICAgICByZXR1cm4gdGhpcy5fZmx1c2goKTtcbiAgICB9O1xuXG4gICAgUGVyc2lzdGVudFF1ZXVlR29vZ2xlQW5hbHl0aWNzQWRhcHRlci5wcm90b3R5cGUuZXhwZXJpbWVudF9zdGFydCA9IGZ1bmN0aW9uKGV4cGVyaW1lbnQsIHZhcmlhbnQpIHtcbiAgICAgIHJldHVybiB0aGlzLl90cmFjayh0aGlzLm5hbWVzcGFjZSwgZXhwZXJpbWVudC5uYW1lICsgXCIgfCBcIiArIHZhcmlhbnQsICdWaXNpdG9ycycpO1xuICAgIH07XG5cbiAgICBQZXJzaXN0ZW50UXVldWVHb29nbGVBbmFseXRpY3NBZGFwdGVyLnByb3RvdHlwZS5nb2FsX2NvbXBsZXRlID0gZnVuY3Rpb24oZXhwZXJpbWVudCwgdmFyaWFudCwgZ29hbF9uYW1lLCBfcHJvcHMpIHtcbiAgICAgIHJldHVybiB0aGlzLl90cmFjayh0aGlzLm5hbWVzcGFjZSwgZXhwZXJpbWVudC5uYW1lICsgXCIgfCBcIiArIHZhcmlhbnQsIGdvYWxfbmFtZSk7XG4gICAgfTtcblxuICAgIHJldHVybiBQZXJzaXN0ZW50UXVldWVHb29nbGVBbmFseXRpY3NBZGFwdGVyO1xuXG4gIH0pKCk7XG5cbiAgQWRhcHRlcnMuUGVyc2lzdGVudFF1ZXVlS2VlbkFkYXB0ZXIgPSAoZnVuY3Rpb24oKSB7XG4gICAgUGVyc2lzdGVudFF1ZXVlS2VlbkFkYXB0ZXIucHJvdG90eXBlLnF1ZXVlX25hbWUgPSAnX2tlZW5fcXVldWUnO1xuXG4gICAgZnVuY3Rpb24gUGVyc2lzdGVudFF1ZXVlS2VlbkFkYXB0ZXIoa2Vlbl9jbGllbnQsIHN0b3JhZ2UpIHtcbiAgICAgIGlmIChzdG9yYWdlID09IG51bGwpIHtcbiAgICAgICAgc3RvcmFnZSA9IEFkYXB0ZXJzLkxvY2FsU3RvcmFnZUFkYXB0ZXI7XG4gICAgICB9XG4gICAgICB0aGlzLmdvYWxfY29tcGxldGUgPSBiaW5kKHRoaXMuZ29hbF9jb21wbGV0ZSwgdGhpcyk7XG4gICAgICB0aGlzLmV4cGVyaW1lbnRfc3RhcnQgPSBiaW5kKHRoaXMuZXhwZXJpbWVudF9zdGFydCwgdGhpcyk7XG4gICAgICB0aGlzLmNsaWVudCA9IGtlZW5fY2xpZW50O1xuICAgICAgdGhpcy5fc3RvcmFnZSA9IHN0b3JhZ2U7XG4gICAgICB0aGlzLl9xdWV1ZSA9IEpTT04ucGFyc2UodGhpcy5fc3RvcmFnZS5nZXQodGhpcy5xdWV1ZV9uYW1lKSB8fCAnW10nKTtcbiAgICAgIHRoaXMuX2ZsdXNoKCk7XG4gICAgfVxuXG4gICAgUGVyc2lzdGVudFF1ZXVlS2VlbkFkYXB0ZXIucHJvdG90eXBlLl9yZW1vdmVfcXV1aWQgPSBmdW5jdGlvbihxdXVpZCkge1xuICAgICAgcmV0dXJuIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZXJyLCByZXMpIHtcbiAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIHV0aWxzLnJlbW92ZShfdGhpcy5fcXVldWUsIGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgICAgICByZXR1cm4gZWwucHJvcGVydGllcy5fcXV1aWQgPT09IHF1dWlkO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBfdGhpcy5fc3RvcmFnZS5zZXQoX3RoaXMucXVldWVfbmFtZSwgSlNPTi5zdHJpbmdpZnkoX3RoaXMuX3F1ZXVlKSk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKTtcbiAgICB9O1xuXG4gICAgUGVyc2lzdGVudFF1ZXVlS2VlbkFkYXB0ZXIucHJvdG90eXBlLl9mbHVzaCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGNhbGxiYWNrLCBpLCBpdGVtLCBsZW4sIHJlZiwgcmVzdWx0cztcbiAgICAgIHJlZiA9IHRoaXMuX3F1ZXVlO1xuICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGl0ZW0gPSByZWZbaV07XG4gICAgICAgIGNhbGxiYWNrID0gdGhpcy5fcmVtb3ZlX3F1dWlkKGl0ZW0ucHJvcGVydGllcy5fcXV1aWQpO1xuICAgICAgICByZXN1bHRzLnB1c2godGhpcy5jbGllbnQuYWRkRXZlbnQoaXRlbS5leHBlcmltZW50X25hbWUsIHV0aWxzLm9taXQoaXRlbS5wcm9wZXJ0aWVzLCAnX3F1dWlkJyksIGNhbGxiYWNrKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9O1xuXG4gICAgUGVyc2lzdGVudFF1ZXVlS2VlbkFkYXB0ZXIucHJvdG90eXBlLl91c2VyX3V1aWQgPSBmdW5jdGlvbihleHBlcmltZW50LCBnb2FsKSB7XG4gICAgICBpZiAoIWV4cGVyaW1lbnQudXNlcl9pZCkge1xuICAgICAgICByZXR1cm4gdXRpbHMudXVpZCgpO1xuICAgICAgfVxuICAgICAgaWYgKCFnb2FsLnVuaXF1ZSkge1xuICAgICAgICByZXR1cm4gdXRpbHMudXVpZCgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHV0aWxzLnNoYTEodGhpcy5uYW1lc3BhY2UgKyBcIi5cIiArIGV4cGVyaW1lbnQubmFtZSArIFwiLlwiICsgZXhwZXJpbWVudC51c2VyX2lkKTtcbiAgICB9O1xuXG4gICAgUGVyc2lzdGVudFF1ZXVlS2VlbkFkYXB0ZXIucHJvdG90eXBlLl90cmFjayA9IGZ1bmN0aW9uKGV4cGVyaW1lbnQsIHZhcmlhbnQsIGdvYWwpIHtcbiAgICAgIHV0aWxzLmxvZyhcIlBlcnNpc3RlbnQgUXVldWUgS2VlbiB0cmFjazogXCIgKyBleHBlcmltZW50Lm5hbWUgKyBcIiwgXCIgKyB2YXJpYW50ICsgXCIsIFwiICsgZXZlbnQpO1xuICAgICAgaWYgKHRoaXMuX3F1ZXVlLmxlbmd0aCA+IDEwMCkge1xuICAgICAgICB0aGlzLl9xdWV1ZS5zaGlmdCgpO1xuICAgICAgfVxuICAgICAgdGhpcy5fcXVldWUucHVzaCh7XG4gICAgICAgIGV4cGVyaW1lbnRfbmFtZTogZXhwZXJpbWVudC5uYW1lLFxuICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgX3F1dWlkOiB1dGlscy51dWlkKCksXG4gICAgICAgICAgdXVpZDogdGhpcy5fdXNlcl91dWlkKGV4cGVyaW1lbnQsIGdvYWwpLFxuICAgICAgICAgIHZhcmlhbnQ6IHZhcmlhbnQsXG4gICAgICAgICAgZXZlbnQ6IGdvYWwubmFtZVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX3N0b3JhZ2Uuc2V0KHRoaXMucXVldWVfbmFtZSwgSlNPTi5zdHJpbmdpZnkodGhpcy5fcXVldWUpKTtcbiAgICAgIHJldHVybiB0aGlzLl9mbHVzaCgpO1xuICAgIH07XG5cbiAgICBQZXJzaXN0ZW50UXVldWVLZWVuQWRhcHRlci5wcm90b3R5cGUuZXhwZXJpbWVudF9zdGFydCA9IGZ1bmN0aW9uKGV4cGVyaW1lbnQsIHZhcmlhbnQpIHtcbiAgICAgIHJldHVybiB0aGlzLl90cmFjayhleHBlcmltZW50LCB2YXJpYW50LCB7XG4gICAgICAgIG5hbWU6ICdwYXJ0aWNpcGF0ZScsXG4gICAgICAgIHVuaXF1ZTogdHJ1ZVxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIFBlcnNpc3RlbnRRdWV1ZUtlZW5BZGFwdGVyLnByb3RvdHlwZS5nb2FsX2NvbXBsZXRlID0gZnVuY3Rpb24oZXhwZXJpbWVudCwgdmFyaWFudCwgZ29hbF9uYW1lLCBwcm9wcykge1xuICAgICAgcmV0dXJuIHRoaXMuX3RyYWNrKGV4cGVyaW1lbnQsIHZhcmlhbnQsIHV0aWxzLmRlZmF1bHRzKHtcbiAgICAgICAgbmFtZTogZ29hbF9uYW1lXG4gICAgICB9LCBwcm9wcykpO1xuICAgIH07XG5cbiAgICByZXR1cm4gUGVyc2lzdGVudFF1ZXVlS2VlbkFkYXB0ZXI7XG5cbiAgfSkoKTtcblxuICBBZGFwdGVycy5Hb29nbGVVbml2ZXJzYWxBbmFseXRpY3NBZGFwdGVyID0gKGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIEdvb2dsZVVuaXZlcnNhbEFuYWx5dGljc0FkYXB0ZXIoKSB7fVxuXG4gICAgR29vZ2xlVW5pdmVyc2FsQW5hbHl0aWNzQWRhcHRlci5uYW1lc3BhY2UgPSAnYWxlcGhiZXQnO1xuXG4gICAgR29vZ2xlVW5pdmVyc2FsQW5hbHl0aWNzQWRhcHRlci5fdHJhY2sgPSBmdW5jdGlvbihjYXRlZ29yeSwgYWN0aW9uLCBsYWJlbCkge1xuICAgICAgdXRpbHMubG9nKFwiR29vZ2xlIFVuaXZlcnNhbCBBbmFseXRpY3MgdHJhY2s6IFwiICsgY2F0ZWdvcnkgKyBcIiwgXCIgKyBhY3Rpb24gKyBcIiwgXCIgKyBsYWJlbCk7XG4gICAgICBpZiAodHlwZW9mIGdhICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignZ2Egbm90IGRlZmluZWQuIFBsZWFzZSBtYWtlIHN1cmUgeW91ciBVbml2ZXJzYWwgYW5hbHl0aWNzIGlzIHNldCB1cCBjb3JyZWN0bHknKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBnYSgnc2VuZCcsICdldmVudCcsIGNhdGVnb3J5LCBhY3Rpb24sIGxhYmVsLCB7XG4gICAgICAgICdub25JbnRlcmFjdGlvbic6IDFcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBHb29nbGVVbml2ZXJzYWxBbmFseXRpY3NBZGFwdGVyLmV4cGVyaW1lbnRfc3RhcnQgPSBmdW5jdGlvbihleHBlcmltZW50LCB2YXJpYW50KSB7XG4gICAgICByZXR1cm4gR29vZ2xlVW5pdmVyc2FsQW5hbHl0aWNzQWRhcHRlci5fdHJhY2soR29vZ2xlVW5pdmVyc2FsQW5hbHl0aWNzQWRhcHRlci5uYW1lc3BhY2UsIGV4cGVyaW1lbnQubmFtZSArIFwiIHwgXCIgKyB2YXJpYW50LCAnVmlzaXRvcnMnKTtcbiAgICB9O1xuXG4gICAgR29vZ2xlVW5pdmVyc2FsQW5hbHl0aWNzQWRhcHRlci5nb2FsX2NvbXBsZXRlID0gZnVuY3Rpb24oZXhwZXJpbWVudCwgdmFyaWFudCwgZ29hbF9uYW1lLCBfcHJvcHMpIHtcbiAgICAgIHJldHVybiBHb29nbGVVbml2ZXJzYWxBbmFseXRpY3NBZGFwdGVyLl90cmFjayhHb29nbGVVbml2ZXJzYWxBbmFseXRpY3NBZGFwdGVyLm5hbWVzcGFjZSwgZXhwZXJpbWVudC5uYW1lICsgXCIgfCBcIiArIHZhcmlhbnQsIGdvYWxfbmFtZSk7XG4gICAgfTtcblxuICAgIHJldHVybiBHb29nbGVVbml2ZXJzYWxBbmFseXRpY3NBZGFwdGVyO1xuXG4gIH0pKCk7XG5cbiAgQWRhcHRlcnMuTG9jYWxTdG9yYWdlQWRhcHRlciA9IChmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBMb2NhbFN0b3JhZ2VBZGFwdGVyKCkge31cblxuICAgIExvY2FsU3RvcmFnZUFkYXB0ZXIubmFtZXNwYWNlID0gJ2FsZXBoYmV0JztcblxuICAgIExvY2FsU3RvcmFnZUFkYXB0ZXIuc2V0ID0gZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgcmV0dXJuIG5ldyBTdG9yYWdlKHRoaXMubmFtZXNwYWNlKS5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgfTtcblxuICAgIExvY2FsU3RvcmFnZUFkYXB0ZXIuZ2V0ID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgICByZXR1cm4gbmV3IFN0b3JhZ2UodGhpcy5uYW1lc3BhY2UpLmdldChrZXkpO1xuICAgIH07XG5cbiAgICByZXR1cm4gTG9jYWxTdG9yYWdlQWRhcHRlcjtcblxuICB9KSgpO1xuXG4gIHJldHVybiBBZGFwdGVycztcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBBZGFwdGVycztcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pTDJodmJXVXZlVzloZGk5amIyUmxMMkZzWlhCb1ltVjBMM055WXk5aFpHRndkR1Z5Y3k1amIyWm1aV1VpTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lJdmFHOXRaUzk1YjJGMkwyTnZaR1V2WVd4bGNHaGlaWFF2YzNKakwyRmtZWEIwWlhKekxtTnZabVpsWlNKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFTeEpRVUZCTEhkQ1FVRkJPMFZCUVVFN08wRkJRVUVzUzBGQlFTeEhRVUZSTEU5QlFVRXNRMEZCVVN4VFFVRlNPenRCUVVOU0xFOUJRVUVzUjBGQlZTeFBRVUZCTEVOQlFWRXNWMEZCVWpzN1FVRkZTanM3TzBWQlVVVXNVVUZCUXl4RFFVRkJPekpDUVVOTUxGVkJRVUVzUjBGQldUczdTVUZGUXl4elFrRkJReXhIUVVGRUxFVkJRVTBzVTBGQlRpeEZRVUZwUWl4UFFVRnFRanM3VVVGQmFVSXNWVUZCVlN4UlFVRlJMRU5CUVVNN096czdUVUZETDBNc1NVRkJReXhEUVVGQkxGRkJRVVFzUjBGQldUdE5RVU5hTEVsQlFVTXNRMEZCUVN4SFFVRkVMRWRCUVU4N1RVRkRVQ3hKUVVGRExFTkJRVUVzVTBGQlJDeEhRVUZoTzAxQlEySXNTVUZCUXl4RFFVRkJMRTFCUVVRc1IwRkJWU3hKUVVGSkxFTkJRVU1zUzBGQlRDeERRVUZYTEVsQlFVTXNRMEZCUVN4UlFVRlJMRU5CUVVNc1IwRkJWaXhEUVVGakxFbEJRVU1zUTBGQlFTeFZRVUZtTEVOQlFVRXNTVUZCT0VJc1NVRkJla003VFVGRFZpeEpRVUZETEVOQlFVRXNUVUZCUkN4RFFVRkJPMGxCVEZjN096SkNRVTlpTEdGQlFVRXNSMEZCWlN4VFFVRkRMRXRCUVVRN1lVRkRZaXhEUVVGQkxGTkJRVUVzUzBGQlFUdGxRVUZCTEZOQlFVTXNSMEZCUkN4RlFVRk5MRWRCUVU0N1ZVRkRSU3hKUVVGVkxFZEJRVlk3UVVGQlFTeHRRa0ZCUVRzN1ZVRkRRU3hMUVVGTExFTkJRVU1zVFVGQlRpeERRVUZoTEV0QlFVTXNRMEZCUVN4TlFVRmtMRVZCUVhOQ0xGTkJRVU1zUlVGQlJEdHRRa0ZCVVN4RlFVRkZMRU5CUVVNc1ZVRkJWU3hEUVVGRExFMUJRV1FzUzBGQmQwSTdWVUZCYUVNc1EwRkJkRUk3YVVKQlEwRXNTMEZCUXl4RFFVRkJMRkZCUVZFc1EwRkJReXhIUVVGV0xFTkJRV01zUzBGQlF5eERRVUZCTEZWQlFXWXNSVUZCTWtJc1NVRkJTU3hEUVVGRExGTkJRVXdzUTBGQlpTeExRVUZETEVOQlFVRXNUVUZCYUVJc1EwRkJNMEk3VVVGSVJqdE5RVUZCTEVOQlFVRXNRMEZCUVN4RFFVRkJMRWxCUVVFN1NVRkVZVHM3TWtKQlRXWXNWMEZCUVN4SFFVRmhMRk5CUVVNc1IwRkJSQ3hGUVVGTkxFbEJRVTRzUlVGQldTeFJRVUZhTzAxQlExZ3NTMEZCU3l4RFFVRkRMRWRCUVU0c1EwRkJWU3d5UWtGQlZqdGhRVU5CTEUxQlFVMHNRMEZCUXl4TlFVRk5MRU5CUVVNc1NVRkJaQ3hEUVVORk8xRkJRVUVzVFVGQlFTeEZRVUZSTEV0QlFWSTdVVUZEUVN4SFFVRkJMRVZCUVVzc1IwRkVURHRSUVVWQkxFbEJRVUVzUlVGQlRTeEpRVVpPTzFGQlIwRXNUMEZCUVN4RlFVRlRMRkZCU0ZRN1QwRkVSanRKUVVaWE96c3lRa0ZSWWl4aFFVRkJMRWRCUVdVc1UwRkJReXhIUVVGRUxFVkJRVTBzU1VGQlRpeEZRVUZaTEZGQlFWbzdRVUZEWWl4VlFVRkJPMDFCUVVFc1MwRkJTeXhEUVVGRExFZEJRVTRzUTBGQlZTd3dRa0ZCVmp0TlFVTkJMRWRCUVVFc1IwRkJUU3hKUVVGSkxHTkJRVW9zUTBGQlFUdE5RVU5PTEUxQlFVRTdPMEZCUVZVN1lVRkJRU3hUUVVGQk96dDFRa0ZCUlN4RFFVRkRMR3RDUVVGQkxFTkJRVzFDTEVOQlFXNUNMRU5CUVVRc1EwRkJRU3hIUVVGMVFpeEhRVUYyUWl4SFFVRjVRaXhEUVVGRExHdENRVUZCTEVOQlFXMUNMRU5CUVc1Q0xFTkJRVVE3UVVGQk0wSTdPenROUVVOV0xFMUJRVUVzUjBGQlV5eE5RVUZOTEVOQlFVTXNTVUZCVUN4RFFVRlpMRWRCUVZvc1EwRkJaMElzUTBGQlF5eFBRVUZxUWl4RFFVRjVRaXhOUVVGNlFpeEZRVUZwUXl4SFFVRnFRenROUVVOVUxFZEJRVWNzUTBGQlF5eEpRVUZLTEVOQlFWTXNTMEZCVkN4RlFVRnRRaXhIUVVGRUxFZEJRVXNzUjBGQlRDeEhRVUZSTEUxQlFURkNPMDFCUTBFc1IwRkJSeXhEUVVGRExFMUJRVW9zUjBGQllTeFRRVUZCTzFGQlExZ3NTVUZCUnl4SFFVRkhMRU5CUVVNc1RVRkJTaXhMUVVGakxFZEJRV3BDTzJsQ1FVTkZMRkZCUVVFc1EwRkJRU3hGUVVSR096dE5RVVJYTzJGQlIySXNSMEZCUnl4RFFVRkRMRWxCUVVvc1EwRkJRVHRKUVZSaE96c3lRa0ZYWml4VFFVRkJMRWRCUVZjc1UwRkJReXhIUVVGRUxFVkJRVTBzU1VGQlRpeEZRVUZaTEZGQlFWbzdRVUZEVkN4VlFVRkJPMDFCUVVFc2RVTkJRV2RDTEVOQlFVVXNZVUZCYkVJN1pVRkRSU3hKUVVGRExFTkJRVUVzVjBGQlJDeERRVUZoTEVkQlFXSXNSVUZCYTBJc1NVRkJiRUlzUlVGQmQwSXNVVUZCZUVJc1JVRkVSanRQUVVGQkxFMUJRVUU3WlVGSFJTeEpRVUZETEVOQlFVRXNZVUZCUkN4RFFVRmxMRWRCUVdZc1JVRkJiMElzU1VGQmNFSXNSVUZCTUVJc1VVRkJNVUlzUlVGSVJqczdTVUZFVXpzN01rSkJUVmdzVFVGQlFTeEhRVUZSTEZOQlFVRTdRVUZEVGl4VlFVRkJPMEZCUVVFN1FVRkJRVHRYUVVGQkxIRkRRVUZCT3p0UlFVTkZMRkZCUVVFc1IwRkJWeXhKUVVGRExFTkJRVUVzWVVGQlJDeERRVUZsTEVsQlFVa3NRMEZCUXl4VlFVRlZMRU5CUVVNc1RVRkJMMEk3VVVGRFdDeEpRVUZETEVOQlFVRXNVMEZCUkN4RFFVRlhMRWxCUVVNc1EwRkJRU3hIUVVGYUxFVkJRV2xDTEV0QlFVc3NRMEZCUXl4SlFVRk9MRU5CUVZjc1NVRkJTU3hEUVVGRExGVkJRV2hDTEVWQlFUUkNMRkZCUVRWQ0xFTkJRV3BDTEVWQlFYZEVMRkZCUVhoRU8zRkNRVU5CTzBGQlNFWTdPMGxCUkUwN096SkNRVTFTTEZWQlFVRXNSMEZCV1N4VFFVRkRMRlZCUVVRc1JVRkJZU3hKUVVGaU8wMUJRMVlzU1VGQlFTeERRVUV5UWl4VlFVRlZMRU5CUVVNc1QwRkJkRU03UVVGQlFTeGxRVUZQTEV0QlFVc3NRMEZCUXl4SlFVRk9MRU5CUVVFc1JVRkJVRHM3VFVGRlFTeEpRVUZCTEVOQlFUSkNMRWxCUVVrc1EwRkJReXhOUVVGb1F6dEJRVUZCTEdWQlFVOHNTMEZCU3l4RFFVRkRMRWxCUVU0c1EwRkJRU3hGUVVGUU96dGhRVWRCTEV0QlFVc3NRMEZCUXl4SlFVRk9MRU5CUVdNc1NVRkJReXhEUVVGQkxGTkJRVVlzUjBGQldTeEhRVUZhTEVkQlFXVXNWVUZCVlN4RFFVRkRMRWxCUVRGQ0xFZEJRU3RDTEVkQlFTOUNMRWRCUVd0RExGVkJRVlVzUTBGQlF5eFBRVUV4UkR0SlFVNVZPenN5UWtGUldpeE5RVUZCTEVkQlFWRXNVMEZCUXl4VlFVRkVMRVZCUVdFc1QwRkJZaXhGUVVGelFpeEpRVUYwUWp0TlFVTk9MRXRCUVVzc1EwRkJReXhIUVVGT0xFTkJRVlVzWjBOQlFVRXNSMEZCYVVNc1NVRkJReXhEUVVGQkxGTkJRV3hETEVkQlFUUkRMRWxCUVRWRExFZEJRV2RFTEZWQlFWVXNRMEZCUXl4SlFVRXpSQ3hIUVVGblJTeEpRVUZvUlN4SFFVRnZSU3hQUVVGd1JTeEhRVUUwUlN4SlFVRTFSU3hIUVVGblJpeEpRVUZKTEVOQlFVTXNTVUZCTDBZN1RVRkRRU3hKUVVGdFFpeEpRVUZETEVOQlFVRXNUVUZCVFN4RFFVRkRMRTFCUVZJc1IwRkJhVUlzUjBGQmNFTTdVVUZCUVN4SlFVRkRMRU5CUVVFc1RVRkJUU3hEUVVGRExFdEJRVklzUTBGQlFTeEZRVUZCT3p0TlFVTkJMRWxCUVVNc1EwRkJRU3hOUVVGTkxFTkJRVU1zU1VGQlVpeERRVU5GTzFGQlFVRXNWVUZCUVN4RlFVTkZPMVZCUVVFc1ZVRkJRU3hGUVVGWkxGVkJRVlVzUTBGQlF5eEpRVUYyUWp0VlFVTkJMRTFCUVVFc1JVRkJVU3hMUVVGTExFTkJRVU1zU1VGQlRpeERRVUZCTEVOQlJGSTdWVUZGUVN4SlFVRkJMRVZCUVUwc1NVRkJReXhEUVVGQkxGVkJRVVFzUTBGQldTeFZRVUZhTEVWQlFYZENMRWxCUVhoQ0xFTkJSazQ3VlVGSFFTeFBRVUZCTEVWQlFWTXNUMEZJVkR0VlFVbEJMRXRCUVVFc1JVRkJUeXhKUVVGSkxFTkJRVU1zU1VGS1dqdFZRVXRCTEZOQlFVRXNSVUZCVnl4SlFVRkRMRU5CUVVFc1UwRk1XanRUUVVSR08wOUJSRVk3VFVGUlFTeEpRVUZETEVOQlFVRXNVVUZCVVN4RFFVRkRMRWRCUVZZc1EwRkJZeXhKUVVGRExFTkJRVUVzVlVGQlppeEZRVUV5UWl4SlFVRkpMRU5CUVVNc1UwRkJUQ3hEUVVGbExFbEJRVU1zUTBGQlFTeE5RVUZvUWl4RFFVRXpRanRoUVVOQkxFbEJRVU1zUTBGQlFTeE5RVUZFTEVOQlFVRTdTVUZhVFRzN01rSkJZMUlzWjBKQlFVRXNSMEZCYTBJc1UwRkJReXhWUVVGRUxFVkJRV0VzVDBGQllqdGhRVU5vUWl4SlFVRkRMRU5CUVVFc1RVRkJSQ3hEUVVGUkxGVkJRVklzUlVGQmIwSXNUMEZCY0VJc1JVRkJOa0k3VVVGQlF5eEpRVUZCTEVWQlFVMHNZVUZCVUR0UlFVRnpRaXhOUVVGQkxFVkJRVkVzU1VGQk9VSTdUMEZCTjBJN1NVRkVaMEk3T3pKQ1FVZHNRaXhoUVVGQkxFZEJRV1VzVTBGQlF5eFZRVUZFTEVWQlFXRXNUMEZCWWl4RlFVRnpRaXhUUVVGMFFpeEZRVUZwUXl4TFFVRnFRenRoUVVOaUxFbEJRVU1zUTBGQlFTeE5RVUZFTEVOQlFWRXNWVUZCVWl4RlFVRnZRaXhQUVVGd1FpeEZRVUUyUWl4TFFVRkxMRU5CUVVNc1VVRkJUaXhEUVVGbE8xRkJRVU1zU1VGQlFTeEZRVUZOTEZOQlFWQTdUMEZCWml4RlFVRnJReXhMUVVGc1F5eERRVUUzUWp0SlFVUmhPenM3T3pzN1JVRkpXQ3hSUVVGRExFTkJRVUU3YjBSQlEwd3NVMEZCUVN4SFFVRlhPenR2UkVGRFdDeFZRVUZCTEVkQlFWazdPMGxCUlVNc0swTkJRVU1zVDBGQlJEczdVVUZCUXl4VlFVRlZMRkZCUVZFc1EwRkJRenM3T3p0TlFVTXZRaXhKUVVGRExFTkJRVUVzVVVGQlJDeEhRVUZaTzAxQlExb3NTVUZCUXl4RFFVRkJMRTFCUVVRc1IwRkJWU3hKUVVGSkxFTkJRVU1zUzBGQlRDeERRVUZYTEVsQlFVTXNRMEZCUVN4UlFVRlJMRU5CUVVNc1IwRkJWaXhEUVVGakxFbEJRVU1zUTBGQlFTeFZRVUZtTEVOQlFVRXNTVUZCT0VJc1NVRkJla003VFVGRFZpeEpRVUZETEVOQlFVRXNUVUZCUkN4RFFVRkJPMGxCU0ZjN08yOUVRVXRpTEZsQlFVRXNSMEZCWXl4VFFVRkRMRWxCUVVRN1lVRkRXaXhEUVVGQkxGTkJRVUVzUzBGQlFUdGxRVUZCTEZOQlFVRTdWVUZEUlN4TFFVRkxMRU5CUVVNc1RVRkJUaXhEUVVGaExFdEJRVU1zUTBGQlFTeE5RVUZrTEVWQlFYTkNMRk5CUVVNc1JVRkJSRHR0UWtGQlVTeEZRVUZGTEVOQlFVTXNTVUZCU0N4TFFVRlhPMVZCUVc1Q0xFTkJRWFJDTzJsQ1FVTkJMRXRCUVVNc1EwRkJRU3hSUVVGUkxFTkJRVU1zUjBGQlZpeERRVUZqTEV0QlFVTXNRMEZCUVN4VlFVRm1MRVZCUVRKQ0xFbEJRVWtzUTBGQlF5eFRRVUZNTEVOQlFXVXNTMEZCUXl4RFFVRkJMRTFCUVdoQ0xFTkJRVE5DTzFGQlJrWTdUVUZCUVN4RFFVRkJMRU5CUVVFc1EwRkJRU3hKUVVGQk8wbEJSRms3TzI5RVFVdGtMRTFCUVVFc1IwRkJVU3hUUVVGQk8wRkJRMDRzVlVGQlFUdE5RVUZCTEVsQlFXOUhMRTlCUVU4c1JVRkJVQ3hMUVVGbExGVkJRVzVJTzBGQlFVRXNZMEZCVFN4SlFVRkpMRXRCUVVvc1EwRkJWU3dyUlVGQlZpeEZRVUZPT3p0QlFVTkJPMEZCUVVFN1YwRkJRU3h4UTBGQlFUczdVVUZEUlN4UlFVRkJMRWRCUVZjc1NVRkJReXhEUVVGQkxGbEJRVVFzUTBGQll5eEpRVUZKTEVOQlFVTXNTVUZCYmtJN2NVSkJRMWdzUlVGQlFTeERRVUZITEUxQlFVZ3NSVUZCVnl4UFFVRllMRVZCUVc5Q0xFbEJRVWtzUTBGQlF5eFJRVUY2UWl4RlFVRnRReXhKUVVGSkxFTkJRVU1zVFVGQmVFTXNSVUZCWjBRc1NVRkJTU3hEUVVGRExFdEJRWEpFTEVWQlFUUkVPMVZCUVVNc1lVRkJRU3hGUVVGbExGRkJRV2hDTzFWQlFUQkNMR2RDUVVGQkxFVkJRV3RDTEVOQlFUVkRPMU5CUVRWRU8wRkJSa1k3TzBsQlJrMDdPMjlFUVUxU0xFMUJRVUVzUjBGQlVTeFRRVUZETEZGQlFVUXNSVUZCVnl4TlFVRllMRVZCUVcxQ0xFdEJRVzVDTzAxQlEwNHNTMEZCU3l4RFFVRkRMRWRCUVU0c1EwRkJWU3h4UkVGQlFTeEhRVUZ6UkN4UlFVRjBSQ3hIUVVFclJDeEpRVUV2UkN4SFFVRnRSU3hOUVVGdVJTeEhRVUV3UlN4SlFVRXhSU3hIUVVFNFJTeExRVUY0Ump0TlFVTkJMRWxCUVcxQ0xFbEJRVU1zUTBGQlFTeE5RVUZOTEVOQlFVTXNUVUZCVWl4SFFVRnBRaXhIUVVGd1F6dFJRVUZCTEVsQlFVTXNRMEZCUVN4TlFVRk5MRU5CUVVNc1MwRkJVaXhEUVVGQkxFVkJRVUU3TzAxQlEwRXNTVUZCUXl4RFFVRkJMRTFCUVUwc1EwRkJReXhKUVVGU0xFTkJRV0U3VVVGQlF5eEpRVUZCTEVWQlFVMHNTMEZCU3l4RFFVRkRMRWxCUVU0c1EwRkJRU3hEUVVGUU8xRkJRWEZDTEZGQlFVRXNSVUZCVlN4UlFVRXZRanRSUVVGNVF5eE5RVUZCTEVWQlFWRXNUVUZCYWtRN1VVRkJlVVFzUzBGQlFTeEZRVUZQTEV0QlFXaEZPMDlCUVdJN1RVRkRRU3hKUVVGRExFTkJRVUVzVVVGQlVTeERRVUZETEVkQlFWWXNRMEZCWXl4SlFVRkRMRU5CUVVFc1ZVRkJaaXhGUVVFeVFpeEpRVUZKTEVOQlFVTXNVMEZCVEN4RFFVRmxMRWxCUVVNc1EwRkJRU3hOUVVGb1FpeERRVUV6UWp0aFFVTkJMRWxCUVVNc1EwRkJRU3hOUVVGRUxFTkJRVUU3U1VGTVRUczdiMFJCVDFJc1owSkJRVUVzUjBGQmEwSXNVMEZCUXl4VlFVRkVMRVZCUVdFc1QwRkJZanRoUVVOb1FpeEpRVUZETEVOQlFVRXNUVUZCUkN4RFFVRlJMRWxCUVVNc1EwRkJRU3hUUVVGVUxFVkJRWFZDTEZWQlFWVXNRMEZCUXl4SlFVRmFMRWRCUVdsQ0xFdEJRV3BDTEVkQlFYTkNMRTlCUVRWRExFVkJRWFZFTEZWQlFYWkVPMGxCUkdkQ096dHZSRUZIYkVJc1lVRkJRU3hIUVVGbExGTkJRVU1zVlVGQlJDeEZRVUZoTEU5QlFXSXNSVUZCYzBJc1UwRkJkRUlzUlVGQmFVTXNUVUZCYWtNN1lVRkRZaXhKUVVGRExFTkJRVUVzVFVGQlJDeERRVUZSTEVsQlFVTXNRMEZCUVN4VFFVRlVMRVZCUVhWQ0xGVkJRVlVzUTBGQlF5eEpRVUZhTEVkQlFXbENMRXRCUVdwQ0xFZEJRWE5DTEU5QlFUVkRMRVZCUVhWRUxGTkJRWFpFTzBsQlJHRTdPenM3T3p0RlFVbFlMRkZCUVVNc1EwRkJRVHQ1UTBGRFRDeFZRVUZCTEVkQlFWazdPMGxCUlVNc2IwTkJRVU1zVjBGQlJDeEZRVUZqTEU5QlFXUTdPMUZCUVdNc1ZVRkJWU3hSUVVGUkxFTkJRVU03T3pzN1RVRkROVU1zU1VGQlF5eERRVUZCTEUxQlFVUXNSMEZCVlR0TlFVTldMRWxCUVVNc1EwRkJRU3hSUVVGRUxFZEJRVms3VFVGRFdpeEpRVUZETEVOQlFVRXNUVUZCUkN4SFFVRlZMRWxCUVVrc1EwRkJReXhMUVVGTUxFTkJRVmNzU1VGQlF5eERRVUZCTEZGQlFWRXNRMEZCUXl4SFFVRldMRU5CUVdNc1NVRkJReXhEUVVGQkxGVkJRV1lzUTBGQlFTeEpRVUU0UWl4SlFVRjZRenROUVVOV0xFbEJRVU1zUTBGQlFTeE5RVUZFTEVOQlFVRTdTVUZLVnpzN2VVTkJUV0lzWVVGQlFTeEhRVUZsTEZOQlFVTXNTMEZCUkR0aFFVTmlMRU5CUVVFc1UwRkJRU3hMUVVGQk8yVkJRVUVzVTBGQlF5eEhRVUZFTEVWQlFVMHNSMEZCVGp0VlFVTkZMRWxCUVZVc1IwRkJWanRCUVVGQkxHMUNRVUZCT3p0VlFVTkJMRXRCUVVzc1EwRkJReXhOUVVGT0xFTkJRV0VzUzBGQlF5eERRVUZCTEUxQlFXUXNSVUZCYzBJc1UwRkJReXhGUVVGRU8yMUNRVUZSTEVWQlFVVXNRMEZCUXl4VlFVRlZMRU5CUVVNc1RVRkJaQ3hMUVVGM1FqdFZRVUZvUXl4RFFVRjBRanRwUWtGRFFTeExRVUZETEVOQlFVRXNVVUZCVVN4RFFVRkRMRWRCUVZZc1EwRkJZeXhMUVVGRExFTkJRVUVzVlVGQlppeEZRVUV5UWl4SlFVRkpMRU5CUVVNc1UwRkJUQ3hEUVVGbExFdEJRVU1zUTBGQlFTeE5RVUZvUWl4RFFVRXpRanRSUVVoR08wMUJRVUVzUTBGQlFTeERRVUZCTEVOQlFVRXNTVUZCUVR0SlFVUmhPenQ1UTBGTlppeE5RVUZCTEVkQlFWRXNVMEZCUVR0QlFVTk9MRlZCUVVFN1FVRkJRVHRCUVVGQk8xZEJRVUVzY1VOQlFVRTdPMUZCUTBVc1VVRkJRU3hIUVVGWExFbEJRVU1zUTBGQlFTeGhRVUZFTEVOQlFXVXNTVUZCU1N4RFFVRkRMRlZCUVZVc1EwRkJReXhOUVVFdlFqdHhRa0ZEV0N4SlFVRkRMRU5CUVVFc1RVRkJUU3hEUVVGRExGRkJRVklzUTBGQmFVSXNTVUZCU1N4RFFVRkRMR1ZCUVhSQ0xFVkJRWFZETEV0QlFVc3NRMEZCUXl4SlFVRk9MRU5CUVZjc1NVRkJTU3hEUVVGRExGVkJRV2hDTEVWQlFUUkNMRkZCUVRWQ0xFTkJRWFpETEVWQlFUaEZMRkZCUVRsRk8wRkJSa1k3TzBsQlJFMDdPM2xEUVV0U0xGVkJRVUVzUjBGQldTeFRRVUZETEZWQlFVUXNSVUZCWVN4SlFVRmlPMDFCUTFZc1NVRkJRU3hEUVVFeVFpeFZRVUZWTEVOQlFVTXNUMEZCZEVNN1FVRkJRU3hsUVVGUExFdEJRVXNzUTBGQlF5eEpRVUZPTEVOQlFVRXNSVUZCVURzN1RVRkZRU3hKUVVGQkxFTkJRVEpDTEVsQlFVa3NRMEZCUXl4TlFVRm9RenRCUVVGQkxHVkJRVThzUzBGQlN5eERRVUZETEVsQlFVNHNRMEZCUVN4RlFVRlFPenRoUVVkQkxFdEJRVXNzUTBGQlF5eEpRVUZPTEVOQlFXTXNTVUZCUXl4RFFVRkJMRk5CUVVZc1IwRkJXU3hIUVVGYUxFZEJRV1VzVlVGQlZTeERRVUZETEVsQlFURkNMRWRCUVN0Q0xFZEJRUzlDTEVkQlFXdERMRlZCUVZVc1EwRkJReXhQUVVFeFJEdEpRVTVWT3p0NVEwRlJXaXhOUVVGQkxFZEJRVkVzVTBGQlF5eFZRVUZFTEVWQlFXRXNUMEZCWWl4RlFVRnpRaXhKUVVGMFFqdE5RVU5PTEV0QlFVc3NRMEZCUXl4SFFVRk9MRU5CUVZVc0swSkJRVUVzUjBGQlowTXNWVUZCVlN4RFFVRkRMRWxCUVRORExFZEJRV2RFTEVsQlFXaEVMRWRCUVc5RUxFOUJRWEJFTEVkQlFUUkVMRWxCUVRWRUxFZEJRV2RGTEV0QlFURkZPMDFCUTBFc1NVRkJiVUlzU1VGQlF5eERRVUZCTEUxQlFVMHNRMEZCUXl4TlFVRlNMRWRCUVdsQ0xFZEJRWEJETzFGQlFVRXNTVUZCUXl4RFFVRkJMRTFCUVUwc1EwRkJReXhMUVVGU0xFTkJRVUVzUlVGQlFUczdUVUZEUVN4SlFVRkRMRU5CUVVFc1RVRkJUU3hEUVVGRExFbEJRVklzUTBGRFJUdFJRVUZCTEdWQlFVRXNSVUZCYVVJc1ZVRkJWU3hEUVVGRExFbEJRVFZDTzFGQlEwRXNWVUZCUVN4RlFVTkZPMVZCUVVFc1RVRkJRU3hGUVVGUkxFdEJRVXNzUTBGQlF5eEpRVUZPTEVOQlFVRXNRMEZCVWp0VlFVTkJMRWxCUVVFc1JVRkJUU3hKUVVGRExFTkJRVUVzVlVGQlJDeERRVUZaTEZWQlFWb3NSVUZCZDBJc1NVRkJlRUlzUTBGRVRqdFZRVVZCTEU5QlFVRXNSVUZCVXl4UFFVWlVPMVZCUjBFc1MwRkJRU3hGUVVGUExFbEJRVWtzUTBGQlF5eEpRVWhhTzFOQlJrWTdUMEZFUmp0TlFVOUJMRWxCUVVNc1EwRkJRU3hSUVVGUkxFTkJRVU1zUjBGQlZpeERRVUZqTEVsQlFVTXNRMEZCUVN4VlFVRm1MRVZCUVRKQ0xFbEJRVWtzUTBGQlF5eFRRVUZNTEVOQlFXVXNTVUZCUXl4RFFVRkJMRTFCUVdoQ0xFTkJRVE5DTzJGQlEwRXNTVUZCUXl4RFFVRkJMRTFCUVVRc1EwRkJRVHRKUVZoTk96dDVRMEZoVWl4blFrRkJRU3hIUVVGclFpeFRRVUZETEZWQlFVUXNSVUZCWVN4UFFVRmlPMkZCUTJoQ0xFbEJRVU1zUTBGQlFTeE5RVUZFTEVOQlFWRXNWVUZCVWl4RlFVRnZRaXhQUVVGd1FpeEZRVUUyUWp0UlFVRkRMRWxCUVVFc1JVRkJUU3hoUVVGUU8xRkJRWE5DTEUxQlFVRXNSVUZCVVN4SlFVRTVRanRQUVVFM1FqdEpRVVJuUWpzN2VVTkJSMnhDTEdGQlFVRXNSMEZCWlN4VFFVRkRMRlZCUVVRc1JVRkJZU3hQUVVGaUxFVkJRWE5DTEZOQlFYUkNMRVZCUVdsRExFdEJRV3BETzJGQlEySXNTVUZCUXl4RFFVRkJMRTFCUVVRc1EwRkJVU3hWUVVGU0xFVkJRVzlDTEU5QlFYQkNMRVZCUVRaQ0xFdEJRVXNzUTBGQlF5eFJRVUZPTEVOQlFXVTdVVUZCUXl4SlFVRkJMRVZCUVUwc1UwRkJVRHRQUVVGbUxFVkJRV3RETEV0QlFXeERMRU5CUVRkQ08wbEJSR0U3T3pzN096dEZRVWxZTEZGQlFVTXNRMEZCUVRzN08wbEJRMHdzSzBKQlFVTXNRMEZCUVN4VFFVRkVMRWRCUVZrN08wbEJSVm9zSzBKQlFVTXNRMEZCUVN4TlFVRkVMRWRCUVZNc1UwRkJReXhSUVVGRUxFVkJRVmNzVFVGQldDeEZRVUZ0UWl4TFFVRnVRanROUVVOUUxFdEJRVXNzUTBGQlF5eEhRVUZPTEVOQlFWVXNiME5CUVVFc1IwRkJjVU1zVVVGQmNrTXNSMEZCT0VNc1NVRkJPVU1zUjBGQmEwUXNUVUZCYkVRc1IwRkJlVVFzU1VGQmVrUXNSMEZCTmtRc1MwRkJka1U3VFVGRFFTeEpRVUZ2Unl4UFFVRlBMRVZCUVZBc1MwRkJaU3hWUVVGdVNEdEJRVUZCTEdOQlFVMHNTVUZCU1N4TFFVRktMRU5CUVZVc0swVkJRVllzUlVGQlRqczdZVUZEUVN4RlFVRkJMRU5CUVVjc1RVRkJTQ3hGUVVGWExFOUJRVmdzUlVGQmIwSXNVVUZCY0VJc1JVRkJPRUlzVFVGQk9VSXNSVUZCYzBNc1MwRkJkRU1zUlVGQk5rTTdVVUZCUXl4blFrRkJRU3hGUVVGclFpeERRVUZ1UWp0UFFVRTNRenRKUVVoUE96dEpRVXRVTEN0Q1FVRkRMRU5CUVVFc1owSkJRVVFzUjBGQmJVSXNVMEZCUXl4VlFVRkVMRVZCUVdFc1QwRkJZanRoUVVOcVFpd3JRa0ZCUXl4RFFVRkJMRTFCUVVRc1EwRkJVU3dyUWtGQlF5eERRVUZCTEZOQlFWUXNSVUZCZFVJc1ZVRkJWU3hEUVVGRExFbEJRVm9zUjBGQmFVSXNTMEZCYWtJc1IwRkJjMElzVDBGQk5VTXNSVUZCZFVRc1ZVRkJka1E3U1VGRWFVSTdPMGxCUjI1Q0xDdENRVUZETEVOQlFVRXNZVUZCUkN4SFFVRm5RaXhUUVVGRExGVkJRVVFzUlVGQllTeFBRVUZpTEVWQlFYTkNMRk5CUVhSQ0xFVkJRV2xETEUxQlFXcERPMkZCUTJRc0swSkJRVU1zUTBGQlFTeE5RVUZFTEVOQlFWRXNLMEpCUVVNc1EwRkJRU3hUUVVGVUxFVkJRWFZDTEZWQlFWVXNRMEZCUXl4SlFVRmFMRWRCUVdsQ0xFdEJRV3BDTEVkQlFYTkNMRTlCUVRWRExFVkJRWFZFTEZOQlFYWkVPMGxCUkdNN096czdPenRGUVVsYUxGRkJRVU1zUTBGQlFUczdPMGxCUTB3c2JVSkJRVU1zUTBGQlFTeFRRVUZFTEVkQlFWazdPMGxCUTFvc2JVSkJRVU1zUTBGQlFTeEhRVUZFTEVkQlFVMHNVMEZCUXl4SFFVRkVMRVZCUVUwc1MwRkJUanRoUVVOS0xFbEJRVWtzVDBGQlNpeERRVUZaTEVsQlFVTXNRMEZCUVN4VFFVRmlMRU5CUVhWQ0xFTkJRVU1zUjBGQmVFSXNRMEZCTkVJc1IwRkJOVUlzUlVGQmFVTXNTMEZCYWtNN1NVRkVTVHM3U1VGRlRpeHRRa0ZCUXl4RFFVRkJMRWRCUVVRc1IwRkJUU3hUUVVGRExFZEJRVVE3WVVGRFNpeEpRVUZKTEU5QlFVb3NRMEZCV1N4SlFVRkRMRU5CUVVFc1UwRkJZaXhEUVVGMVFpeERRVUZETEVkQlFYaENMRU5CUVRSQ0xFZEJRVFZDTzBsQlJFazdPenM3T3pzN096czdRVUZKVml4TlFVRk5MRU5CUVVNc1QwRkJVQ3hIUVVGcFFpSjlcbiIsInZhciBBbGVwaEJldCwgYWRhcHRlcnMsIG9wdGlvbnMsIHV0aWxzLFxuICBiaW5kID0gZnVuY3Rpb24oZm4sIG1lKXsgcmV0dXJuIGZ1bmN0aW9uKCl7IHJldHVybiBmbi5hcHBseShtZSwgYXJndW1lbnRzKTsgfTsgfTtcblxudXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbmFkYXB0ZXJzID0gcmVxdWlyZSgnLi9hZGFwdGVycycpO1xuXG5vcHRpb25zID0gcmVxdWlyZSgnLi9vcHRpb25zJyk7XG5cbkFsZXBoQmV0ID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBBbGVwaEJldCgpIHt9XG5cbiAgQWxlcGhCZXQub3B0aW9ucyA9IG9wdGlvbnM7XG5cbiAgQWxlcGhCZXQudXRpbHMgPSB1dGlscztcblxuICBBbGVwaEJldC5HaW1lbEFkYXB0ZXIgPSBhZGFwdGVycy5HaW1lbEFkYXB0ZXI7XG5cbiAgQWxlcGhCZXQuUGVyc2lzdGVudFF1ZXVlR29vZ2xlQW5hbHl0aWNzQWRhcHRlciA9IGFkYXB0ZXJzLlBlcnNpc3RlbnRRdWV1ZUdvb2dsZUFuYWx5dGljc0FkYXB0ZXI7XG5cbiAgQWxlcGhCZXQuUGVyc2lzdGVudFF1ZXVlS2VlbkFkYXB0ZXIgPSBhZGFwdGVycy5QZXJzaXN0ZW50UXVldWVLZWVuQWRhcHRlcjtcblxuICBBbGVwaEJldC5FeHBlcmltZW50ID0gKGZ1bmN0aW9uKCkge1xuICAgIHZhciBfcnVuLCBfdmFsaWRhdGU7XG5cbiAgICBFeHBlcmltZW50Ll9vcHRpb25zID0ge1xuICAgICAgbmFtZTogbnVsbCxcbiAgICAgIHZhcmlhbnRzOiBudWxsLFxuICAgICAgdXNlcl9pZDogbnVsbCxcbiAgICAgIHNhbXBsZTogMS4wLFxuICAgICAgdHJpZ2dlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSxcbiAgICAgIHRyYWNraW5nX2FkYXB0ZXI6IGFkYXB0ZXJzLkdvb2dsZVVuaXZlcnNhbEFuYWx5dGljc0FkYXB0ZXIsXG4gICAgICBzdG9yYWdlX2FkYXB0ZXI6IGFkYXB0ZXJzLkxvY2FsU3RvcmFnZUFkYXB0ZXJcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gRXhwZXJpbWVudChvcHRpb25zMSkge1xuICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9uczEgIT0gbnVsbCA/IG9wdGlvbnMxIDoge307XG4gICAgICB0aGlzLmFkZF9nb2FscyA9IGJpbmQodGhpcy5hZGRfZ29hbHMsIHRoaXMpO1xuICAgICAgdGhpcy5hZGRfZ29hbCA9IGJpbmQodGhpcy5hZGRfZ29hbCwgdGhpcyk7XG4gICAgICB1dGlscy5kZWZhdWx0cyh0aGlzLm9wdGlvbnMsIEV4cGVyaW1lbnQuX29wdGlvbnMpO1xuICAgICAgX3ZhbGlkYXRlLmNhbGwodGhpcyk7XG4gICAgICB0aGlzLm5hbWUgPSB0aGlzLm9wdGlvbnMubmFtZTtcbiAgICAgIHRoaXMudmFyaWFudHMgPSB0aGlzLm9wdGlvbnMudmFyaWFudHM7XG4gICAgICB0aGlzLnVzZXJfaWQgPSB0aGlzLm9wdGlvbnMudXNlcl9pZDtcbiAgICAgIHRoaXMudmFyaWFudF9uYW1lcyA9IHV0aWxzLmtleXModGhpcy52YXJpYW50cyk7XG4gICAgICBfcnVuLmNhbGwodGhpcyk7XG4gICAgfVxuXG4gICAgRXhwZXJpbWVudC5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdmFyaWFudDtcbiAgICAgIHV0aWxzLmxvZyhcInJ1bm5pbmcgd2l0aCBvcHRpb25zOiBcIiArIChKU09OLnN0cmluZ2lmeSh0aGlzLm9wdGlvbnMpKSk7XG4gICAgICBpZiAodmFyaWFudCA9IHRoaXMuZ2V0X3N0b3JlZF92YXJpYW50KCkpIHtcbiAgICAgICAgdXRpbHMubG9nKHZhcmlhbnQgKyBcIiBhY3RpdmVcIik7XG4gICAgICAgIHJldHVybiB0aGlzLmFjdGl2YXRlX3ZhcmlhbnQodmFyaWFudCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25hbGx5X2FjdGl2YXRlX3ZhcmlhbnQoKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgX3J1biA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMucnVuKCk7XG4gICAgfTtcblxuICAgIEV4cGVyaW1lbnQucHJvdG90eXBlLmFjdGl2YXRlX3ZhcmlhbnQgPSBmdW5jdGlvbih2YXJpYW50KSB7XG4gICAgICB2YXIgcmVmO1xuICAgICAgaWYgKChyZWYgPSB0aGlzLnZhcmlhbnRzW3ZhcmlhbnRdKSAhPSBudWxsKSB7XG4gICAgICAgIHJlZi5hY3RpdmF0ZSh0aGlzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnN0b3JhZ2UoKS5zZXQodGhpcy5vcHRpb25zLm5hbWUgKyBcIjp2YXJpYW50XCIsIHZhcmlhbnQpO1xuICAgIH07XG5cbiAgICBFeHBlcmltZW50LnByb3RvdHlwZS5jb25kaXRpb25hbGx5X2FjdGl2YXRlX3ZhcmlhbnQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB2YXJpYW50O1xuICAgICAgaWYgKCF0aGlzLm9wdGlvbnMudHJpZ2dlcigpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHV0aWxzLmxvZygndHJpZ2dlciBzZXQnKTtcbiAgICAgIGlmICghdGhpcy5pbl9zYW1wbGUoKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB1dGlscy5sb2coJ2luIHNhbXBsZScpO1xuICAgICAgdmFyaWFudCA9IHRoaXMucGlja192YXJpYW50KCk7XG4gICAgICB0aGlzLnRyYWNraW5nKCkuZXhwZXJpbWVudF9zdGFydCh0aGlzLCB2YXJpYW50KTtcbiAgICAgIHJldHVybiB0aGlzLmFjdGl2YXRlX3ZhcmlhbnQodmFyaWFudCk7XG4gICAgfTtcblxuICAgIEV4cGVyaW1lbnQucHJvdG90eXBlLmdvYWxfY29tcGxldGUgPSBmdW5jdGlvbihnb2FsX25hbWUsIHByb3BzKSB7XG4gICAgICB2YXIgdmFyaWFudDtcbiAgICAgIGlmIChwcm9wcyA9PSBudWxsKSB7XG4gICAgICAgIHByb3BzID0ge307XG4gICAgICB9XG4gICAgICB1dGlscy5kZWZhdWx0cyhwcm9wcywge1xuICAgICAgICB1bmlxdWU6IHRydWVcbiAgICAgIH0pO1xuICAgICAgaWYgKHByb3BzLnVuaXF1ZSAmJiB0aGlzLnN0b3JhZ2UoKS5nZXQodGhpcy5vcHRpb25zLm5hbWUgKyBcIjpcIiArIGdvYWxfbmFtZSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdmFyaWFudCA9IHRoaXMuZ2V0X3N0b3JlZF92YXJpYW50KCk7XG4gICAgICBpZiAoIXZhcmlhbnQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKHByb3BzLnVuaXF1ZSkge1xuICAgICAgICB0aGlzLnN0b3JhZ2UoKS5zZXQodGhpcy5vcHRpb25zLm5hbWUgKyBcIjpcIiArIGdvYWxfbmFtZSwgdHJ1ZSk7XG4gICAgICB9XG4gICAgICB1dGlscy5sb2coXCJleHBlcmltZW50OiBcIiArIHRoaXMub3B0aW9ucy5uYW1lICsgXCIgdmFyaWFudDpcIiArIHZhcmlhbnQgKyBcIiBnb2FsOlwiICsgZ29hbF9uYW1lICsgXCIgY29tcGxldGVcIik7XG4gICAgICByZXR1cm4gdGhpcy50cmFja2luZygpLmdvYWxfY29tcGxldGUodGhpcywgdmFyaWFudCwgZ29hbF9uYW1lLCBwcm9wcyk7XG4gICAgfTtcblxuICAgIEV4cGVyaW1lbnQucHJvdG90eXBlLmdldF9zdG9yZWRfdmFyaWFudCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuc3RvcmFnZSgpLmdldCh0aGlzLm9wdGlvbnMubmFtZSArIFwiOnZhcmlhbnRcIik7XG4gICAgfTtcblxuICAgIEV4cGVyaW1lbnQucHJvdG90eXBlLnBpY2tfdmFyaWFudCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGFsbF92YXJpYW50c19oYXZlX3dlaWdodHM7XG4gICAgICBhbGxfdmFyaWFudHNfaGF2ZV93ZWlnaHRzID0gdXRpbHMuY2hlY2tfd2VpZ2h0cyh0aGlzLnZhcmlhbnRzKTtcbiAgICAgIHV0aWxzLmxvZyhcImFsbCB2YXJpYW50cyBoYXZlIHdlaWdodHM6IFwiICsgYWxsX3ZhcmlhbnRzX2hhdmVfd2VpZ2h0cyk7XG4gICAgICBpZiAoYWxsX3ZhcmlhbnRzX2hhdmVfd2VpZ2h0cykge1xuICAgICAgICByZXR1cm4gdGhpcy5waWNrX3dlaWdodGVkX3ZhcmlhbnQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBpY2tfdW53ZWlnaHRlZF92YXJpYW50KCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIEV4cGVyaW1lbnQucHJvdG90eXBlLnBpY2tfd2VpZ2h0ZWRfdmFyaWFudCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGtleSwgcmVmLCB2YWx1ZSwgd2VpZ2h0ZWRfaW5kZXgsIHdlaWdodHNfc3VtO1xuICAgICAgd2VpZ2h0c19zdW0gPSB1dGlscy5zdW1fd2VpZ2h0cyh0aGlzLnZhcmlhbnRzKTtcbiAgICAgIHdlaWdodGVkX2luZGV4ID0gTWF0aC5jZWlsKHRoaXMuX3JhbmRvbSgndmFyaWFudCcpICogd2VpZ2h0c19zdW0pO1xuICAgICAgcmVmID0gdGhpcy52YXJpYW50cztcbiAgICAgIGZvciAoa2V5IGluIHJlZikge1xuICAgICAgICB2YWx1ZSA9IHJlZltrZXldO1xuICAgICAgICB3ZWlnaHRlZF9pbmRleCAtPSB2YWx1ZS53ZWlnaHQ7XG4gICAgICAgIGlmICh3ZWlnaHRlZF9pbmRleCA8PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIGtleTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICBFeHBlcmltZW50LnByb3RvdHlwZS5waWNrX3Vud2VpZ2h0ZWRfdmFyaWFudCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGNob3Nlbl9wYXJ0aXRpb24sIHBhcnRpdGlvbnMsIHZhcmlhbnQ7XG4gICAgICBwYXJ0aXRpb25zID0gMS4wIC8gdGhpcy52YXJpYW50X25hbWVzLmxlbmd0aDtcbiAgICAgIGNob3Nlbl9wYXJ0aXRpb24gPSBNYXRoLmZsb29yKHRoaXMuX3JhbmRvbSgndmFyaWFudCcpIC8gcGFydGl0aW9ucyk7XG4gICAgICB2YXJpYW50ID0gdGhpcy52YXJpYW50X25hbWVzW2Nob3Nlbl9wYXJ0aXRpb25dO1xuICAgICAgdXRpbHMubG9nKHZhcmlhbnQgKyBcIiBwaWNrZWRcIik7XG4gICAgICByZXR1cm4gdmFyaWFudDtcbiAgICB9O1xuXG4gICAgRXhwZXJpbWVudC5wcm90b3R5cGUuaW5fc2FtcGxlID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYWN0aXZlO1xuICAgICAgYWN0aXZlID0gdGhpcy5zdG9yYWdlKCkuZ2V0KHRoaXMub3B0aW9ucy5uYW1lICsgXCI6aW5fc2FtcGxlXCIpO1xuICAgICAgaWYgKHR5cGVvZiBhY3RpdmUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybiBhY3RpdmU7XG4gICAgICB9XG4gICAgICBhY3RpdmUgPSB0aGlzLl9yYW5kb20oJ3NhbXBsZScpIDw9IHRoaXMub3B0aW9ucy5zYW1wbGU7XG4gICAgICB0aGlzLnN0b3JhZ2UoKS5zZXQodGhpcy5vcHRpb25zLm5hbWUgKyBcIjppbl9zYW1wbGVcIiwgYWN0aXZlKTtcbiAgICAgIHJldHVybiBhY3RpdmU7XG4gICAgfTtcblxuICAgIEV4cGVyaW1lbnQucHJvdG90eXBlLl9yYW5kb20gPSBmdW5jdGlvbihzYWx0KSB7XG4gICAgICB2YXIgc2VlZDtcbiAgICAgIGlmICghdGhpcy51c2VyX2lkKSB7XG4gICAgICAgIHJldHVybiB1dGlscy5yYW5kb20oKTtcbiAgICAgIH1cbiAgICAgIHNlZWQgPSB0aGlzLm5hbWUgKyBcIi5cIiArIHNhbHQgKyBcIi5cIiArIHRoaXMudXNlcl9pZDtcbiAgICAgIHJldHVybiB1dGlscy5yYW5kb20oc2VlZCk7XG4gICAgfTtcblxuICAgIEV4cGVyaW1lbnQucHJvdG90eXBlLmFkZF9nb2FsID0gZnVuY3Rpb24oZ29hbCkge1xuICAgICAgcmV0dXJuIGdvYWwuYWRkX2V4cGVyaW1lbnQodGhpcyk7XG4gICAgfTtcblxuICAgIEV4cGVyaW1lbnQucHJvdG90eXBlLmFkZF9nb2FscyA9IGZ1bmN0aW9uKGdvYWxzKSB7XG4gICAgICB2YXIgZ29hbCwgaSwgbGVuLCByZXN1bHRzO1xuICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChpID0gMCwgbGVuID0gZ29hbHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgZ29hbCA9IGdvYWxzW2ldO1xuICAgICAgICByZXN1bHRzLnB1c2godGhpcy5hZGRfZ29hbChnb2FsKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9O1xuXG4gICAgRXhwZXJpbWVudC5wcm90b3R5cGUuc3RvcmFnZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5zdG9yYWdlX2FkYXB0ZXI7XG4gICAgfTtcblxuICAgIEV4cGVyaW1lbnQucHJvdG90eXBlLnRyYWNraW5nID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5vcHRpb25zLnRyYWNraW5nX2FkYXB0ZXI7XG4gICAgfTtcblxuICAgIF92YWxpZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGFsbF92YXJpYW50c19oYXZlX3dlaWdodHM7XG4gICAgICBpZiAodGhpcy5vcHRpb25zLm5hbWUgPT09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdhbiBleHBlcmltZW50IG5hbWUgbXVzdCBiZSBzcGVjaWZpZWQnKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMudmFyaWFudHMgPT09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd2YXJpYW50cyBtdXN0IGJlIHByb3ZpZGVkJyk7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy50cmlnZ2VyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcigndHJpZ2dlciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcbiAgICAgIH1cbiAgICAgIGFsbF92YXJpYW50c19oYXZlX3dlaWdodHMgPSB1dGlscy52YWxpZGF0ZV93ZWlnaHRzKHRoaXMub3B0aW9ucy52YXJpYW50cyk7XG4gICAgICBpZiAoIWFsbF92YXJpYW50c19oYXZlX3dlaWdodHMpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdub3QgYWxsIHZhcmlhbnRzIGhhdmUgd2VpZ2h0cycpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gRXhwZXJpbWVudDtcblxuICB9KSgpO1xuXG4gIEFsZXBoQmV0LkdvYWwgPSAoZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gR29hbChuYW1lLCBwcm9wczEpIHtcbiAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICB0aGlzLnByb3BzID0gcHJvcHMxICE9IG51bGwgPyBwcm9wczEgOiB7fTtcbiAgICAgIHV0aWxzLmRlZmF1bHRzKHRoaXMucHJvcHMsIHtcbiAgICAgICAgdW5pcXVlOiB0cnVlXG4gICAgICB9KTtcbiAgICAgIHRoaXMuZXhwZXJpbWVudHMgPSBbXTtcbiAgICB9XG5cbiAgICBHb2FsLnByb3RvdHlwZS5hZGRfZXhwZXJpbWVudCA9IGZ1bmN0aW9uKGV4cGVyaW1lbnQpIHtcbiAgICAgIHJldHVybiB0aGlzLmV4cGVyaW1lbnRzLnB1c2goZXhwZXJpbWVudCk7XG4gICAgfTtcblxuICAgIEdvYWwucHJvdG90eXBlLmFkZF9leHBlcmltZW50cyA9IGZ1bmN0aW9uKGV4cGVyaW1lbnRzKSB7XG4gICAgICB2YXIgZXhwZXJpbWVudCwgaSwgbGVuLCByZXN1bHRzO1xuICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChpID0gMCwgbGVuID0gZXhwZXJpbWVudHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgZXhwZXJpbWVudCA9IGV4cGVyaW1lbnRzW2ldO1xuICAgICAgICByZXN1bHRzLnB1c2godGhpcy5hZGRfZXhwZXJpbWVudChleHBlcmltZW50KSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9O1xuXG4gICAgR29hbC5wcm90b3R5cGUuY29tcGxldGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBleHBlcmltZW50LCBpLCBsZW4sIHJlZiwgcmVzdWx0cztcbiAgICAgIHJlZiA9IHRoaXMuZXhwZXJpbWVudHM7XG4gICAgICByZXN1bHRzID0gW107XG4gICAgICBmb3IgKGkgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgZXhwZXJpbWVudCA9IHJlZltpXTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKGV4cGVyaW1lbnQuZ29hbF9jb21wbGV0ZSh0aGlzLm5hbWUsIHRoaXMucHJvcHMpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH07XG5cbiAgICByZXR1cm4gR29hbDtcblxuICB9KSgpO1xuXG4gIHJldHVybiBBbGVwaEJldDtcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBBbGVwaEJldDtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pTDJodmJXVXZlVzloZGk5amIyUmxMMkZzWlhCb1ltVjBMM055WXk5aGJHVndhR0psZEM1amIyWm1aV1VpTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lJdmFHOXRaUzk1YjJGMkwyTnZaR1V2WVd4bGNHaGlaWFF2YzNKakwyRnNaWEJvWW1WMExtTnZabVpsWlNKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFTeEpRVUZCTEd0RFFVRkJPMFZCUVVFN08wRkJRVUVzUzBGQlFTeEhRVUZSTEU5QlFVRXNRMEZCVVN4VFFVRlNPenRCUVVOU0xGRkJRVUVzUjBGQlZ5eFBRVUZCTEVOQlFWRXNXVUZCVWpzN1FVRkRXQ3hQUVVGQkxFZEJRVlVzVDBGQlFTeERRVUZSTEZkQlFWSTdPMEZCUlVvN096dEZRVU5LTEZGQlFVTXNRMEZCUVN4UFFVRkVMRWRCUVZjN08wVkJRMWdzVVVGQlF5eERRVUZCTEV0QlFVUXNSMEZCVXpzN1JVRkZWQ3hSUVVGRExFTkJRVUVzV1VGQlJDeEhRVUZuUWl4UlFVRlJMRU5CUVVNN08wVkJRM3BDTEZGQlFVTXNRMEZCUVN4eFEwRkJSQ3hIUVVGNVF5eFJRVUZSTEVOQlFVTTdPMFZCUTJ4RUxGRkJRVU1zUTBGQlFTd3dRa0ZCUkN4SFFVRTRRaXhSUVVGUkxFTkJRVU03TzBWQlJXcERMRkZCUVVNc1EwRkJRVHRCUVVOTUxGRkJRVUU3TzBsQlFVRXNWVUZCUXl4RFFVRkJMRkZCUVVRc1IwRkRSVHROUVVGQkxFbEJRVUVzUlVGQlRTeEpRVUZPTzAxQlEwRXNVVUZCUVN4RlFVRlZMRWxCUkZZN1RVRkZRU3hQUVVGQkxFVkJRVk1zU1VGR1ZEdE5RVWRCTEUxQlFVRXNSVUZCVVN4SFFVaFNPMDFCU1VFc1QwRkJRU3hGUVVGVExGTkJRVUU3WlVGQlJ6dE5RVUZJTEVOQlNsUTdUVUZMUVN4blFrRkJRU3hGUVVGclFpeFJRVUZSTEVOQlFVTXNLMEpCVEROQ08wMUJUVUVzWlVGQlFTeEZRVUZwUWl4UlFVRlJMRU5CUVVNc2JVSkJUakZDT3pzN1NVRlJWeXh2UWtGQlF5eFJRVUZFTzAxQlFVTXNTVUZCUXl4RFFVRkJMRFpDUVVGRUxGZEJRVk03T3p0TlFVTnlRaXhMUVVGTExFTkJRVU1zVVVGQlRpeERRVUZsTEVsQlFVTXNRMEZCUVN4UFFVRm9RaXhGUVVGNVFpeFZRVUZWTEVOQlFVTXNVVUZCY0VNN1RVRkRRU3hUUVVGVExFTkJRVU1zU1VGQlZpeERRVUZsTEVsQlFXWTdUVUZEUVN4SlFVRkRMRU5CUVVFc1NVRkJSQ3hIUVVGUkxFbEJRVU1zUTBGQlFTeFBRVUZQTEVOQlFVTTdUVUZEYWtJc1NVRkJReXhEUVVGQkxGRkJRVVFzUjBGQldTeEpRVUZETEVOQlFVRXNUMEZCVHl4RFFVRkRPMDFCUTNKQ0xFbEJRVU1zUTBGQlFTeFBRVUZFTEVkQlFWY3NTVUZCUXl4RFFVRkJMRTlCUVU4c1EwRkJRenROUVVOd1FpeEpRVUZETEVOQlFVRXNZVUZCUkN4SFFVRnBRaXhMUVVGTExFTkJRVU1zU1VGQlRpeERRVUZYTEVsQlFVTXNRMEZCUVN4UlFVRmFPMDFCUTJwQ0xFbEJRVWtzUTBGQlF5eEpRVUZNTEVOQlFWVXNTVUZCVmp0SlFWQlhPenQ1UWtGVFlpeEhRVUZCTEVkQlFVc3NVMEZCUVR0QlFVTklMRlZCUVVFN1RVRkJRU3hMUVVGTExFTkJRVU1zUjBGQlRpeERRVUZWTEhkQ1FVRkJMRWRCUVhkQ0xFTkJRVU1zU1VGQlNTeERRVUZETEZOQlFVd3NRMEZCWlN4SlFVRkRMRU5CUVVFc1QwRkJhRUlzUTBGQlJDeERRVUZzUXp0TlFVTkJMRWxCUVVjc1QwRkJRU3hIUVVGVkxFbEJRVU1zUTBGQlFTeHJRa0ZCUkN4RFFVRkJMRU5CUVdJN1VVRkZSU3hMUVVGTExFTkJRVU1zUjBGQlRpeERRVUZoTEU5QlFVUXNSMEZCVXl4VFFVRnlRanRsUVVOQkxFbEJRVU1zUTBGQlFTeG5Ra0ZCUkN4RFFVRnJRaXhQUVVGc1FpeEZRVWhHTzA5QlFVRXNUVUZCUVR0bFFVdEZMRWxCUVVNc1EwRkJRU3c0UWtGQlJDeERRVUZCTEVWQlRFWTdPMGxCUmtjN08wbEJVMHdzU1VGQlFTeEhRVUZQTEZOQlFVRTdZVUZCUnl4SlFVRkRMRU5CUVVFc1IwRkJSQ3hEUVVGQk8wbEJRVWc3TzNsQ1FVVlFMR2RDUVVGQkxFZEJRV3RDTEZOQlFVTXNUMEZCUkR0QlFVTm9RaXhWUVVGQk96dFhRVUZyUWl4RFFVRkZMRkZCUVhCQ0xFTkJRVFpDTEVsQlFUZENPenRoUVVOQkxFbEJRVU1zUTBGQlFTeFBRVUZFTEVOQlFVRXNRMEZCVlN4RFFVRkRMRWRCUVZnc1EwRkJhMElzU1VGQlF5eERRVUZCTEU5QlFVOHNRMEZCUXl4SlFVRldMRWRCUVdVc1ZVRkJhRU1zUlVGQk1rTXNUMEZCTTBNN1NVRkdaMEk3TzNsQ1FVdHNRaXc0UWtGQlFTeEhRVUZuUXl4VFFVRkJPMEZCUXpsQ0xGVkJRVUU3VFVGQlFTeEpRVUZCTEVOQlFXTXNTVUZCUXl4RFFVRkJMRTlCUVU4c1EwRkJReXhQUVVGVUxFTkJRVUVzUTBGQlpEdEJRVUZCTEdWQlFVRTdPMDFCUTBFc1MwRkJTeXhEUVVGRExFZEJRVTRzUTBGQlZTeGhRVUZXTzAxQlEwRXNTVUZCUVN4RFFVRmpMRWxCUVVNc1EwRkJRU3hUUVVGRUxFTkJRVUVzUTBGQlpEdEJRVUZCTEdWQlFVRTdPMDFCUTBFc1MwRkJTeXhEUVVGRExFZEJRVTRzUTBGQlZTeFhRVUZXTzAxQlEwRXNUMEZCUVN4SFFVRlZMRWxCUVVNc1EwRkJRU3haUVVGRUxFTkJRVUU3VFVGRFZpeEpRVUZETEVOQlFVRXNVVUZCUkN4RFFVRkJMRU5CUVZjc1EwRkJReXhuUWtGQldpeERRVUUyUWl4SlFVRTNRaXhGUVVGdFF5eFBRVUZ1UXp0aFFVTkJMRWxCUVVNc1EwRkJRU3huUWtGQlJDeERRVUZyUWl4UFFVRnNRanRKUVZBNFFqczdlVUpCVTJoRExHRkJRVUVzUjBGQlpTeFRRVUZETEZOQlFVUXNSVUZCV1N4TFFVRmFPMEZCUTJJc1ZVRkJRVHM3VVVGRWVVSXNVVUZCVFRzN1RVRkRMMElzUzBGQlN5eERRVUZETEZGQlFVNHNRMEZCWlN4TFFVRm1MRVZCUVhOQ08xRkJRVU1zVFVGQlFTeEZRVUZSTEVsQlFWUTdUMEZCZEVJN1RVRkRRU3hKUVVGVkxFdEJRVXNzUTBGQlF5eE5RVUZPTEVsQlFXZENMRWxCUVVNc1EwRkJRU3hQUVVGRUxFTkJRVUVzUTBGQlZTeERRVUZETEVkQlFWZ3NRMEZCYTBJc1NVRkJReXhEUVVGQkxFOUJRVThzUTBGQlF5eEpRVUZXTEVkQlFXVXNSMEZCWml4SFFVRnJRaXhUUVVGdVF5eERRVUV4UWp0QlFVRkJMR1ZCUVVFN08wMUJRMEVzVDBGQlFTeEhRVUZWTEVsQlFVTXNRMEZCUVN4clFrRkJSQ3hEUVVGQk8wMUJRMVlzU1VGQlFTeERRVUZqTEU5QlFXUTdRVUZCUVN4bFFVRkJPenROUVVOQkxFbEJRWGxFTEV0QlFVc3NRMEZCUXl4TlFVRXZSRHRSUVVGQkxFbEJRVU1zUTBGQlFTeFBRVUZFTEVOQlFVRXNRMEZCVlN4RFFVRkRMRWRCUVZnc1EwRkJhMElzU1VGQlF5eERRVUZCTEU5QlFVOHNRMEZCUXl4SlFVRldMRWRCUVdVc1IwRkJaaXhIUVVGclFpeFRRVUZ1UXl4RlFVRm5SQ3hKUVVGb1JDeEZRVUZCT3p0TlFVTkJMRXRCUVVzc1EwRkJReXhIUVVGT0xFTkJRVlVzWTBGQlFTeEhRVUZsTEVsQlFVTXNRMEZCUVN4UFFVRlBMRU5CUVVNc1NVRkJlRUlzUjBGQk5rSXNWMEZCTjBJc1IwRkJkME1zVDBGQmVFTXNSMEZCWjBRc1VVRkJhRVFzUjBGQmQwUXNVMEZCZUVRc1IwRkJhMFVzVjBGQk5VVTdZVUZEUVN4SlFVRkRMRU5CUVVFc1VVRkJSQ3hEUVVGQkxFTkJRVmNzUTBGQlF5eGhRVUZhTEVOQlFUQkNMRWxCUVRGQ0xFVkJRV2RETEU5QlFXaERMRVZCUVhsRExGTkJRWHBETEVWQlFXOUVMRXRCUVhCRU8wbEJVR0U3TzNsQ1FWTm1MR3RDUVVGQkxFZEJRVzlDTEZOQlFVRTdZVUZEYkVJc1NVRkJReXhEUVVGQkxFOUJRVVFzUTBGQlFTeERRVUZWTEVOQlFVTXNSMEZCV0N4RFFVRnJRaXhKUVVGRExFTkJRVUVzVDBGQlR5eERRVUZETEVsQlFWWXNSMEZCWlN4VlFVRm9RenRKUVVSclFqczdlVUpCUjNCQ0xGbEJRVUVzUjBGQll5eFRRVUZCTzBGQlExb3NWVUZCUVR0TlFVRkJMSGxDUVVGQkxFZEJRVFJDTEV0QlFVc3NRMEZCUXl4aFFVRk9MRU5CUVc5Q0xFbEJRVU1zUTBGQlFTeFJRVUZ5UWp0TlFVTTFRaXhMUVVGTExFTkJRVU1zUjBGQlRpeERRVUZWTERaQ1FVRkJMRWRCUVRoQ0xIbENRVUY0UXp0TlFVTkJMRWxCUVVjc2VVSkJRVWc3WlVGQmEwTXNTVUZCUXl4RFFVRkJMSEZDUVVGRUxFTkJRVUVzUlVGQmJFTTdUMEZCUVN4TlFVRkJPMlZCUVdkRkxFbEJRVU1zUTBGQlFTeDFRa0ZCUkN4RFFVRkJMRVZCUVdoRk96dEpRVWhaT3p0NVFrRkxaQ3h4UWtGQlFTeEhRVUYxUWl4VFFVRkJPMEZCVjNKQ0xGVkJRVUU3VFVGQlFTeFhRVUZCTEVkQlFXTXNTMEZCU3l4RFFVRkRMRmRCUVU0c1EwRkJhMElzU1VGQlF5eERRVUZCTEZGQlFXNUNPMDFCUTJRc1kwRkJRU3hIUVVGcFFpeEpRVUZKTEVOQlFVTXNTVUZCVEN4RFFVRlhMRWxCUVVNc1EwRkJRU3hQUVVGRUxFTkJRVk1zVTBGQlZDeERRVUZCTEVkQlFYTkNMRmRCUVdwRE8wRkJRMnBDTzBGQlFVRXNWMEZCUVN4VlFVRkJPenRSUVVkRkxHTkJRVUVzU1VGQmEwSXNTMEZCU3l4RFFVRkRPMUZCUTNoQ0xFbEJRV01zWTBGQlFTeEpRVUZyUWl4RFFVRm9RenRCUVVGQkxHbENRVUZQTEVsQlFWQTdPMEZCU2tZN1NVRmljVUk3TzNsQ1FXMUNka0lzZFVKQlFVRXNSMEZCZVVJc1UwRkJRVHRCUVVOMlFpeFZRVUZCTzAxQlFVRXNWVUZCUVN4SFFVRmhMRWRCUVVFc1IwRkJUU3hKUVVGRExFTkJRVUVzWVVGQllTeERRVUZETzAxQlEyeERMR2RDUVVGQkxFZEJRVzFDTEVsQlFVa3NRMEZCUXl4TFFVRk1MRU5CUVZjc1NVRkJReXhEUVVGQkxFOUJRVVFzUTBGQlV5eFRRVUZVTEVOQlFVRXNSMEZCYzBJc1ZVRkJha003VFVGRGJrSXNUMEZCUVN4SFFVRlZMRWxCUVVNc1EwRkJRU3hoUVVGakxFTkJRVUVzWjBKQlFVRTdUVUZEZWtJc1MwRkJTeXhEUVVGRExFZEJRVTRzUTBGQllTeFBRVUZFTEVkQlFWTXNVMEZCY2tJN1lVRkRRVHRKUVV4MVFqczdlVUpCVDNwQ0xGTkJRVUVzUjBGQlZ5eFRRVUZCTzBGQlExUXNWVUZCUVR0TlFVRkJMRTFCUVVFc1IwRkJVeXhKUVVGRExFTkJRVUVzVDBGQlJDeERRVUZCTEVOQlFWVXNRMEZCUXl4SFFVRllMRU5CUVd0Q0xFbEJRVU1zUTBGQlFTeFBRVUZQTEVOQlFVTXNTVUZCVml4SFFVRmxMRmxCUVdoRE8wMUJRMVFzU1VGQmNVSXNUMEZCVHl4TlFVRlFMRXRCUVdsQ0xGZEJRWFJETzBGQlFVRXNaVUZCVHl4UFFVRlFPenROUVVOQkxFMUJRVUVzUjBGQlV5eEpRVUZETEVOQlFVRXNUMEZCUkN4RFFVRlRMRkZCUVZRc1EwRkJRU3hKUVVGelFpeEpRVUZETEVOQlFVRXNUMEZCVHl4RFFVRkRPMDFCUTNoRExFbEJRVU1zUTBGQlFTeFBRVUZFTEVOQlFVRXNRMEZCVlN4RFFVRkRMRWRCUVZnc1EwRkJhMElzU1VGQlF5eERRVUZCTEU5QlFVOHNRMEZCUXl4SlFVRldMRWRCUVdVc1dVRkJhRU1zUlVGQk5rTXNUVUZCTjBNN1lVRkRRVHRKUVV4VE96dDVRa0ZQV0N4UFFVRkJMRWRCUVZNc1UwRkJReXhKUVVGRU8wRkJRMUFzVlVGQlFUdE5RVUZCTEVsQlFVRXNRMEZCTmtJc1NVRkJReXhEUVVGQkxFOUJRVGxDTzBGQlFVRXNaVUZCVHl4TFFVRkxMRU5CUVVNc1RVRkJUaXhEUVVGQkxFVkJRVkE3TzAxQlEwRXNTVUZCUVN4SFFVRlZMRWxCUVVNc1EwRkJRU3hKUVVGR0xFZEJRVThzUjBGQlVDeEhRVUZWTEVsQlFWWXNSMEZCWlN4SFFVRm1MRWRCUVd0Q0xFbEJRVU1zUTBGQlFUdGhRVU0xUWl4TFFVRkxMRU5CUVVNc1RVRkJUaXhEUVVGaExFbEJRV0k3U1VGSVR6czdlVUpCUzFRc1VVRkJRU3hIUVVGVkxGTkJRVU1zU1VGQlJEdGhRVU5TTEVsQlFVa3NRMEZCUXl4alFVRk1MRU5CUVc5Q0xFbEJRWEJDTzBsQlJGRTdPM2xDUVVkV0xGTkJRVUVzUjBGQlZ5eFRRVUZETEV0QlFVUTdRVUZEVkN4VlFVRkJPMEZCUVVFN1YwRkJRU3gxUTBGQlFUczdjVUpCUVVFc1NVRkJReXhEUVVGQkxGRkJRVVFzUTBGQlZTeEpRVUZXTzBGQlFVRTdPMGxCUkZNN08zbENRVWRZTEU5QlFVRXNSMEZCVXl4VFFVRkJPMkZCUVVjc1NVRkJReXhEUVVGQkxFOUJRVThzUTBGQlF6dEpRVUZhT3p0NVFrRkZWQ3hSUVVGQkxFZEJRVlVzVTBGQlFUdGhRVUZITEVsQlFVTXNRMEZCUVN4UFFVRlBMRU5CUVVNN1NVRkJXanM3U1VGRlZpeFRRVUZCTEVkQlFWa3NVMEZCUVR0QlFVTldMRlZCUVVFN1RVRkJRU3hKUVVFeVJDeEpRVUZETEVOQlFVRXNUMEZCVHl4RFFVRkRMRWxCUVZRc1MwRkJhVUlzU1VGQk5VVTdRVUZCUVN4alFVRk5MRWxCUVVrc1MwRkJTaXhEUVVGVkxITkRRVUZXTEVWQlFVNDdPMDFCUTBFc1NVRkJaMFFzU1VGQlF5eERRVUZCTEU5QlFVOHNRMEZCUXl4UlFVRlVMRXRCUVhGQ0xFbEJRWEpGTzBGQlFVRXNZMEZCVFN4SlFVRkpMRXRCUVVvc1EwRkJWU3d5UWtGQlZpeEZRVUZPT3p0TlFVTkJMRWxCUVdsRUxFOUJRVThzU1VGQlF5eERRVUZCTEU5QlFVOHNRMEZCUXl4UFFVRm9RaXhMUVVFMlFpeFZRVUU1UlR0QlFVRkJMR05CUVUwc1NVRkJTU3hMUVVGS0xFTkJRVlVzTkVKQlFWWXNSVUZCVGpzN1RVRkRRU3g1UWtGQlFTeEhRVUUwUWl4TFFVRkxMRU5CUVVNc1owSkJRVTRzUTBGQmRVSXNTVUZCUXl4RFFVRkJMRTlCUVU4c1EwRkJReXhSUVVGb1F6dE5RVU0xUWl4SlFVRnZSQ3hEUVVGRExIbENRVUZ5UkR0QlFVRkJMR05CUVUwc1NVRkJTU3hMUVVGS0xFTkJRVlVzSzBKQlFWWXNSVUZCVGpzN1NVRk1WVHM3T3pzN08wVkJUMUlzVVVGQlF5eERRVUZCTzBsQlExRXNZMEZCUXl4SlFVRkVMRVZCUVZFc1RVRkJVanROUVVGRExFbEJRVU1zUTBGQlFTeFBRVUZFTzAxQlFVOHNTVUZCUXl4RFFVRkJMSGxDUVVGRUxGTkJRVTg3VFVGRE1VSXNTMEZCU3l4RFFVRkRMRkZCUVU0c1EwRkJaU3hKUVVGRExFTkJRVUVzUzBGQmFFSXNSVUZCZFVJN1VVRkJReXhOUVVGQkxFVkJRVkVzU1VGQlZEdFBRVUYyUWp0TlFVTkJMRWxCUVVNc1EwRkJRU3hYUVVGRUxFZEJRV1U3U1VGR1NqczdiVUpCU1dJc1kwRkJRU3hIUVVGblFpeFRRVUZETEZWQlFVUTdZVUZEWkN4SlFVRkRMRU5CUVVFc1YwRkJWeXhEUVVGRExFbEJRV0lzUTBGQmEwSXNWVUZCYkVJN1NVRkVZenM3YlVKQlIyaENMR1ZCUVVFc1IwRkJhVUlzVTBGQlF5eFhRVUZFTzBGQlEyWXNWVUZCUVR0QlFVRkJPMWRCUVVFc05rTkJRVUU3TzNGQ1FVRkJMRWxCUVVNc1EwRkJRU3hqUVVGRUxFTkJRV2RDTEZWQlFXaENPMEZCUVVFN08wbEJSR1U3TzIxQ1FVZHFRaXhSUVVGQkxFZEJRVlVzVTBGQlFUdEJRVU5TTEZWQlFVRTdRVUZCUVR0QlFVRkJPMWRCUVVFc2NVTkJRVUU3TzNGQ1FVTkZMRlZCUVZVc1EwRkJReXhoUVVGWUxFTkJRWGxDTEVsQlFVTXNRMEZCUVN4SlFVRXhRaXhGUVVGblF5eEpRVUZETEVOQlFVRXNTMEZCYWtNN1FVRkVSanM3U1VGRVVUczdPenM3T3pzN096dEJRVXRrTEUxQlFVMHNRMEZCUXl4UFFVRlFMRWRCUVdsQ0luMD1cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBkZWJ1ZzogZmFsc2Vcbn07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaUwyaHZiV1V2ZVc5aGRpOWpiMlJsTDJGc1pYQm9ZbVYwTDNOeVl5OXZjSFJwYjI1ekxtTnZabVpsWlNJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6SWpwYklpOW9iMjFsTDNsdllYWXZZMjlrWlM5aGJHVndhR0psZEM5emNtTXZiM0IwYVc5dWN5NWpiMlptWldVaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWtGQlFVRXNUVUZCVFN4RFFVRkRMRTlCUVZBc1IwRkRSVHRGUVVGQkxFdEJRVUVzUlVGQlR5eExRVUZRSW4wPVxuIiwidmFyIEJhc2lsLCBTdG9yYWdlLCBzdG9yZTtcblxuQmFzaWwgPSByZXF1aXJlKCdiYXNpbC5qcycpO1xuXG5zdG9yZSA9IG5ldyBCYXNpbCh7XG4gIG5hbWVzcGFjZTogbnVsbFxufSk7XG5cblN0b3JhZ2UgPSAoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIFN0b3JhZ2UobmFtZXNwYWNlKSB7XG4gICAgdGhpcy5uYW1lc3BhY2UgPSBuYW1lc3BhY2UgIT0gbnVsbCA/IG5hbWVzcGFjZSA6ICdhbGVwaGJldCc7XG4gICAgdGhpcy5zdG9yYWdlID0gc3RvcmUuZ2V0KHRoaXMubmFtZXNwYWNlKSB8fCB7fTtcbiAgfVxuXG4gIFN0b3JhZ2UucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICB0aGlzLnN0b3JhZ2Vba2V5XSA9IHZhbHVlO1xuICAgIHN0b3JlLnNldCh0aGlzLm5hbWVzcGFjZSwgdGhpcy5zdG9yYWdlKTtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG5cbiAgU3RvcmFnZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgcmV0dXJuIHRoaXMuc3RvcmFnZVtrZXldO1xuICB9O1xuXG4gIHJldHVybiBTdG9yYWdlO1xuXG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN0b3JhZ2U7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaUwyaHZiV1V2ZVc5aGRpOWpiMlJsTDJGc1pYQm9ZbVYwTDNOeVl5OXpkRzl5WVdkbExtTnZabVpsWlNJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6SWpwYklpOW9iMjFsTDNsdllYWXZZMjlrWlM5aGJHVndhR0psZEM5emNtTXZjM1J2Y21GblpTNWpiMlptWldVaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWtGQlFVRXNTVUZCUVRzN1FVRkJRU3hMUVVGQkxFZEJRVkVzVDBGQlFTeERRVUZSTEZWQlFWSTdPMEZCUTFJc1MwRkJRU3hIUVVGUkxFbEJRVWtzUzBGQlNpeERRVUZWTzBWQlFVRXNVMEZCUVN4RlFVRlhMRWxCUVZnN1EwRkJWanM3UVVGSFJqdEZRVU5UTEdsQ1FVRkRMRk5CUVVRN1NVRkJReXhKUVVGRExFTkJRVUVzWjBOQlFVUXNXVUZCVnp0SlFVTjJRaXhKUVVGRExFTkJRVUVzVDBGQlJDeEhRVUZYTEV0QlFVc3NRMEZCUXl4SFFVRk9MRU5CUVZVc1NVRkJReXhEUVVGQkxGTkJRVmdzUTBGQlFTeEpRVUY1UWp0RlFVUjZRanM3YjBKQlJXSXNSMEZCUVN4SFFVRkxMRk5CUVVNc1IwRkJSQ3hGUVVGTkxFdEJRVTQ3U1VGRFNDeEpRVUZETEVOQlFVRXNUMEZCVVN4RFFVRkJMRWRCUVVFc1EwRkJWQ3hIUVVGblFqdEpRVU5vUWl4TFFVRkxMRU5CUVVNc1IwRkJUaXhEUVVGVkxFbEJRVU1zUTBGQlFTeFRRVUZZTEVWQlFYTkNMRWxCUVVNc1EwRkJRU3hQUVVGMlFqdEJRVU5CTEZkQlFVODdSVUZJU2pzN2IwSkJTVXdzUjBGQlFTeEhRVUZMTEZOQlFVTXNSMEZCUkR0WFFVTklMRWxCUVVNc1EwRkJRU3hQUVVGUkxFTkJRVUVzUjBGQlFUdEZRVVJPT3pzN096czdRVUZKVUN4TlFVRk5MRU5CUVVNc1QwRkJVQ3hIUVVGcFFpSjlcbiIsInZhciBVdGlscywgXywgb3B0aW9ucywgc2hhMSwgdXVpZDtcblxuXyA9IHJlcXVpcmUoJy4uL3ZlbmRvci9sb2Rhc2guY3VzdG9tLm1pbicpO1xuXG51dWlkID0gcmVxdWlyZSgnbm9kZS11dWlkJyk7XG5cbnNoYTEgPSByZXF1aXJlKCdjcnlwdG8tanMvc2hhMScpO1xuXG5vcHRpb25zID0gcmVxdWlyZSgnLi9vcHRpb25zJyk7XG5cblV0aWxzID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBVdGlscygpIHt9XG5cbiAgVXRpbHMuZGVmYXVsdHMgPSBfLmRlZmF1bHRzO1xuXG4gIFV0aWxzLmtleXMgPSBfLmtleXM7XG5cbiAgVXRpbHMucmVtb3ZlID0gXy5yZW1vdmU7XG5cbiAgVXRpbHMub21pdCA9IF8ub21pdDtcblxuICBVdGlscy5sb2cgPSBmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgaWYgKG9wdGlvbnMuZGVidWcpIHtcbiAgICAgIHJldHVybiBjb25zb2xlLmxvZyhtZXNzYWdlKTtcbiAgICB9XG4gIH07XG5cbiAgVXRpbHMudXVpZCA9IHV1aWQudjQ7XG5cbiAgVXRpbHMuc2hhMSA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgICByZXR1cm4gc2hhMSh0ZXh0KS50b1N0cmluZygpO1xuICB9O1xuXG4gIFV0aWxzLnJhbmRvbSA9IGZ1bmN0aW9uKHNlZWQpIHtcbiAgICBpZiAoIXNlZWQpIHtcbiAgICAgIHJldHVybiBNYXRoLnJhbmRvbSgpO1xuICAgIH1cbiAgICByZXR1cm4gcGFyc2VJbnQodGhpcy5zaGExKHNlZWQpLnN1YnN0cigwLCAxMyksIDE2KSAvIDB4RkZGRkZGRkZGRkZGRjtcbiAgfTtcblxuICBVdGlscy5jaGVja193ZWlnaHRzID0gZnVuY3Rpb24odmFyaWFudHMpIHtcbiAgICB2YXIgY29udGFpbnNfd2VpZ2h0LCBrZXksIHZhbHVlO1xuICAgIGNvbnRhaW5zX3dlaWdodCA9IFtdO1xuICAgIGZvciAoa2V5IGluIHZhcmlhbnRzKSB7XG4gICAgICB2YWx1ZSA9IHZhcmlhbnRzW2tleV07XG4gICAgICBjb250YWluc193ZWlnaHQucHVzaCh2YWx1ZS53ZWlnaHQgIT0gbnVsbCk7XG4gICAgfVxuICAgIHJldHVybiBjb250YWluc193ZWlnaHQuZXZlcnkoZnVuY3Rpb24oaGFzX3dlaWdodCkge1xuICAgICAgcmV0dXJuIGhhc193ZWlnaHQ7XG4gICAgfSk7XG4gIH07XG5cbiAgVXRpbHMuc3VtX3dlaWdodHMgPSBmdW5jdGlvbih2YXJpYW50cykge1xuICAgIHZhciBrZXksIHN1bSwgdmFsdWU7XG4gICAgc3VtID0gMDtcbiAgICBmb3IgKGtleSBpbiB2YXJpYW50cykge1xuICAgICAgdmFsdWUgPSB2YXJpYW50c1trZXldO1xuICAgICAgc3VtICs9IHZhbHVlLndlaWdodCB8fCAwO1xuICAgIH1cbiAgICByZXR1cm4gc3VtO1xuICB9O1xuXG4gIFV0aWxzLnZhbGlkYXRlX3dlaWdodHMgPSBmdW5jdGlvbih2YXJpYW50cykge1xuICAgIHZhciBjb250YWluc193ZWlnaHQsIGtleSwgdmFsdWU7XG4gICAgY29udGFpbnNfd2VpZ2h0ID0gW107XG4gICAgZm9yIChrZXkgaW4gdmFyaWFudHMpIHtcbiAgICAgIHZhbHVlID0gdmFyaWFudHNba2V5XTtcbiAgICAgIGNvbnRhaW5zX3dlaWdodC5wdXNoKHZhbHVlLndlaWdodCAhPSBudWxsKTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbnRhaW5zX3dlaWdodC5ldmVyeShmdW5jdGlvbihoYXNfd2VpZ2h0KSB7XG4gICAgICByZXR1cm4gaGFzX3dlaWdodCB8fCBjb250YWluc193ZWlnaHQuZXZlcnkoZnVuY3Rpb24oaGFzX3dlaWdodCkge1xuICAgICAgICByZXR1cm4gIWhhc193ZWlnaHQ7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcblxuICByZXR1cm4gVXRpbHM7XG5cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gVXRpbHM7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaUwyaHZiV1V2ZVc5aGRpOWpiMlJsTDJGc1pYQm9ZbVYwTDNOeVl5OTFkR2xzY3k1amIyWm1aV1VpTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lJdmFHOXRaUzk1YjJGMkwyTnZaR1V2WVd4bGNHaGlaWFF2YzNKakwzVjBhV3h6TG1OdlptWmxaU0pkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZEUVN4SlFVRkJPenRCUVVGQkxFTkJRVUVzUjBGQlNTeFBRVUZCTEVOQlFWRXNOa0pCUVZJN08wRkJRMG9zU1VGQlFTeEhRVUZQTEU5QlFVRXNRMEZCVVN4WFFVRlNPenRCUVVOUUxFbEJRVUVzUjBGQlR5eFBRVUZCTEVOQlFWRXNaMEpCUVZJN08wRkJRMUFzVDBGQlFTeEhRVUZWTEU5QlFVRXNRMEZCVVN4WFFVRlNPenRCUVVWS096czdSVUZEU2l4TFFVRkRMRU5CUVVFc1VVRkJSQ3hIUVVGWExFTkJRVU1zUTBGQlF6czdSVUZEWWl4TFFVRkRMRU5CUVVFc1NVRkJSQ3hIUVVGUExFTkJRVU1zUTBGQlF6czdSVUZEVkN4TFFVRkRMRU5CUVVFc1RVRkJSQ3hIUVVGVExFTkJRVU1zUTBGQlF6czdSVUZEV0N4TFFVRkRMRU5CUVVFc1NVRkJSQ3hIUVVGUExFTkJRVU1zUTBGQlF6czdSVUZEVkN4TFFVRkRMRU5CUVVFc1IwRkJSQ3hIUVVGTkxGTkJRVU1zVDBGQlJEdEpRVU5LTEVsQlFYZENMRTlCUVU4c1EwRkJReXhMUVVGb1F6dGhRVUZCTEU5QlFVOHNRMEZCUXl4SFFVRlNMRU5CUVZrc1QwRkJXaXhGUVVGQk96dEZRVVJKT3p0RlFVVk9MRXRCUVVNc1EwRkJRU3hKUVVGRUxFZEJRVThzU1VGQlNTeERRVUZET3p0RlFVTmFMRXRCUVVNc1EwRkJRU3hKUVVGRUxFZEJRVThzVTBGQlF5eEpRVUZFTzFkQlEwd3NTVUZCUVN4RFFVRkxMRWxCUVV3c1EwRkJWU3hEUVVGRExGRkJRVmdzUTBGQlFUdEZRVVJMT3p0RlFVVlFMRXRCUVVNc1EwRkJRU3hOUVVGRUxFZEJRVk1zVTBGQlF5eEpRVUZFTzBsQlExQXNTVUZCUVN4RFFVRTBRaXhKUVVFMVFqdEJRVUZCTEdGQlFVOHNTVUZCU1N4RFFVRkRMRTFCUVV3c1EwRkJRU3hGUVVGUU96dFhRVVZCTEZGQlFVRXNRMEZCVXl4SlFVRkRMRU5CUVVFc1NVRkJSQ3hEUVVGTkxFbEJRVTRzUTBGQlZ5eERRVUZETEUxQlFWb3NRMEZCYlVJc1EwRkJia0lzUlVGQmMwSXNSVUZCZEVJc1EwRkJWQ3hGUVVGdlF5eEZRVUZ3UXl4RFFVRkJMRWRCUVRCRE8wVkJTRzVET3p0RlFVbFVMRXRCUVVNc1EwRkJRU3hoUVVGRUxFZEJRV2RDTEZOQlFVTXNVVUZCUkR0QlFVTmtMRkZCUVVFN1NVRkJRU3hsUVVGQkxFZEJRV3RDTzBGQlEyeENMRk5CUVVFc1pVRkJRVHM3VFVGQlFTeGxRVUZsTEVOQlFVTXNTVUZCYUVJc1EwRkJjVUlzYjBKQlFYSkNPMEZCUVVFN1YwRkRRU3hsUVVGbExFTkJRVU1zUzBGQmFFSXNRMEZCYzBJc1UwRkJReXhWUVVGRU8yRkJRV2RDTzBsQlFXaENMRU5CUVhSQ08wVkJTR003TzBWQlNXaENMRXRCUVVNc1EwRkJRU3hYUVVGRUxFZEJRV01zVTBGQlF5eFJRVUZFTzBGQlExb3NVVUZCUVR0SlFVRkJMRWRCUVVFc1IwRkJUVHRCUVVOT0xGTkJRVUVzWlVGQlFUczdUVUZEUlN4SFFVRkJMRWxCUVU4c1MwRkJTeXhEUVVGRExFMUJRVTRzU1VGQlowSTdRVUZFZWtJN1YwRkZRVHRGUVVwWk96dEZRVXRrTEV0QlFVTXNRMEZCUVN4blFrRkJSQ3hIUVVGdFFpeFRRVUZETEZGQlFVUTdRVUZEYWtJc1VVRkJRVHRKUVVGQkxHVkJRVUVzUjBGQmEwSTdRVUZEYkVJc1UwRkJRU3hsUVVGQk96dE5RVUZCTEdWQlFXVXNRMEZCUXl4SlFVRm9RaXhEUVVGeFFpeHZRa0ZCY2tJN1FVRkJRVHRYUVVOQkxHVkJRV1VzUTBGQlF5eExRVUZvUWl4RFFVRnpRaXhUUVVGRExGVkJRVVE3WVVGQlowSXNWVUZCUVN4SlFVRmpMR1ZCUVdVc1EwRkJReXhMUVVGb1FpeERRVUZ6UWl4VFFVRkRMRlZCUVVRN1pVRkJaMElzUTBGQlF6dE5RVUZxUWl4RFFVRjBRanRKUVVFNVFpeERRVUYwUWp0RlFVaHBRanM3T3pzN08wRkJTWEpDTEUxQlFVMHNRMEZCUXl4UFFVRlFMRWRCUVdsQ0luMD1cbiIsIi8qKlxuICogQGxpY2Vuc2VcbiAqIGxvZGFzaCAzLjEwLjEgKEN1c3RvbSBCdWlsZCkgbG9kYXNoLmNvbS9saWNlbnNlIHwgVW5kZXJzY29yZS5qcyAxLjguMyB1bmRlcnNjb3JlanMub3JnL0xJQ0VOU0VcbiAqIEJ1aWxkOiBgbG9kYXNoIC1wIGluY2x1ZGU9XCJrZXlzLGRlZmF1bHRzLHJlbW92ZSxvbWl0XCIgZXhwb3J0cz1cIm5vZGVcIiAtbyAuL3ZlbmRvci9sb2Rhc2guY3VzdG9tLm1pbi5qc2BcbiAqL1xuOyhmdW5jdGlvbigpe2Z1bmN0aW9uIG5hKGEsYixjKXtpZihiIT09Yil7YTp7Yj1hLmxlbmd0aDtmb3IoYys9LTE7KytjPGI7KXt2YXIgZT1hW2NdO2lmKGUhPT1lKXthPWM7YnJlYWsgYX19YT0tMX1yZXR1cm4gYX1jLT0xO2ZvcihlPWEubGVuZ3RoOysrYzxlOylpZihhW2NdPT09YilyZXR1cm4gYztyZXR1cm4tMX1mdW5jdGlvbiBBKGEpe3JldHVybiEhYSYmdHlwZW9mIGE9PVwib2JqZWN0XCJ9ZnVuY3Rpb24gbSgpe31mdW5jdGlvbiB4YShhKXt2YXIgYj1hP2EubGVuZ3RoOjA7Zm9yKHRoaXMuZGF0YT17aGFzaDp5YShudWxsKSxzZXQ6bmV3IHphfTtiLS07KXRoaXMucHVzaChhW2JdKX1mdW5jdGlvbiBaYShhLGIpe3ZhciBjPWEuZGF0YTtyZXR1cm4odHlwZW9mIGI9PVwic3RyaW5nXCJ8fHQoYik/Yy5zZXQuaGFzKGIpOmMuaGFzaFtiXSk/MDotMX1mdW5jdGlvbiAkYShhLGIpe3ZhciBjPS0xLGU9YS5sZW5ndGg7Zm9yKGJ8fChiPUFycmF5KGUpKTsrK2M8ZTspYltjXT1hW2NdO1xucmV0dXJuIGJ9ZnVuY3Rpb24gQWEoYSxiKXtmb3IodmFyIGM9LTEsZT1hLmxlbmd0aDsrK2M8ZSYmZmFsc2UhPT1iKGFbY10sYyxhKTspO3JldHVybiBhfWZ1bmN0aW9uIGFiKGEpe2Zvcih2YXIgYj1TdHJpbmcsYz0tMSxlPWEubGVuZ3RoLGQ9QXJyYXkoZSk7KytjPGU7KWRbY109YihhW2NdLGMsYSk7cmV0dXJuIGR9ZnVuY3Rpb24gYmIoYSxiKXtmb3IodmFyIGM9LTEsZT1hLmxlbmd0aDsrK2M8ZTspaWYoYihhW2NdLGMsYSkpcmV0dXJuIHRydWU7cmV0dXJuIGZhbHNlfWZ1bmN0aW9uIEJhKGEsYil7dmFyIGM7aWYobnVsbD09YiljPWE7ZWxzZXtjPUMoYik7dmFyIGU9YTtlfHwoZT17fSk7Zm9yKHZhciBkPS0xLGY9Yy5sZW5ndGg7KytkPGY7KXt2YXIgaD1jW2RdO2VbaF09YltoXX1jPWV9cmV0dXJuIGN9ZnVuY3Rpb24gQ2EoYSxiLGMpe3ZhciBlPXR5cGVvZiBhO3JldHVyblwiZnVuY3Rpb25cIj09ZT9iPT09cD9hOm9hKGEsYixjKTpudWxsPT1hP1E6XCJvYmplY3RcIj09ZT9EYShhKTpiPT09cD9FYShhKTpcbmNiKGEsYil9ZnVuY3Rpb24gRmEoYSxiLGMsZSxkLGYsaCl7dmFyIGc7YyYmKGc9ZD9jKGEsZSxkKTpjKGEpKTtpZihnIT09cClyZXR1cm4gZztpZighdChhKSlyZXR1cm4gYTtpZihlPXgoYSkpe2lmKGc9ZGIoYSksIWIpcmV0dXJuICRhKGEsZyl9ZWxzZXt2YXIgbD1CLmNhbGwoYSksbj1sPT1HO2lmKGw9PXV8fGw9PUh8fG4mJiFkKXtpZihSKGEpKXJldHVybiBkP2E6e307Zz1lYihuP3t9OmEpO2lmKCFiKXJldHVybiBCYShnLGEpfWVsc2UgcmV0dXJuIHJbbF0/ZmIoYSxsLGIpOmQ/YTp7fX1mfHwoZj1bXSk7aHx8KGg9W10pO2ZvcihkPWYubGVuZ3RoO2QtLTspaWYoZltkXT09YSlyZXR1cm4gaFtkXTtmLnB1c2goYSk7aC5wdXNoKGcpOyhlP0FhOmdiKShhLGZ1bmN0aW9uKGUsZCl7Z1tkXT1GYShlLGIsYyxkLGEsZixoKX0pO3JldHVybiBnfWZ1bmN0aW9uIGhiKGEsYil7dmFyIGM9YT9hLmxlbmd0aDowLGU9W107aWYoIWMpcmV0dXJuIGU7dmFyIGQ9LTEsZjtmPW0uaW5kZXhPZnx8XG5wYTtmPWY9PT1wYT9uYTpmO3ZhciBoPWY9PT1uYSxnPWgmJmIubGVuZ3RoPj1pYj95YSYmemE/bmV3IHhhKGIpOm51bGw6bnVsbCxsPWIubGVuZ3RoO2cmJihmPVphLGg9ZmFsc2UsYj1nKTthOmZvcig7KytkPGM7KWlmKGc9YVtkXSxoJiZnPT09Zyl7Zm9yKHZhciBuPWw7bi0tOylpZihiW25dPT09Zyljb250aW51ZSBhO2UucHVzaChnKX1lbHNlIDA+ZihiLGcsMCkmJmUucHVzaChnKTtyZXR1cm4gZX1mdW5jdGlvbiBHYShhLGIsYyxlKXtlfHwoZT1bXSk7Zm9yKHZhciBkPS0xLGY9YS5sZW5ndGg7KytkPGY7KXt2YXIgaD1hW2RdO2lmKEEoaCkmJlMoaCkmJihjfHx4KGgpfHxUKGgpKSlpZihiKUdhKGgsYixjLGUpO2Vsc2UgZm9yKHZhciBnPWUsbD0tMSxuPWgubGVuZ3RoLGs9Zy5sZW5ndGg7KytsPG47KWdbaytsXT1oW2xdO2Vsc2UgY3x8KGVbZS5sZW5ndGhdPWgpfXJldHVybiBlfWZ1bmN0aW9uIGpiKGEsYil7SGEoYSxiLFUpfWZ1bmN0aW9uIGdiKGEsYil7cmV0dXJuIEhhKGEsYixcbkMpfWZ1bmN0aW9uIElhKGEsYixjKXtpZihudWxsIT1hKXthPXkoYSk7YyE9PXAmJmMgaW4gYSYmKGI9W2NdKTtjPTA7Zm9yKHZhciBlPWIubGVuZ3RoO251bGwhPWEmJmM8ZTspYT15KGEpW2JbYysrXV07cmV0dXJuIGMmJmM9PWU/YTpwfX1mdW5jdGlvbiBxYShhLGIsYyxlLGQsZil7aWYoYT09PWIpYT10cnVlO2Vsc2UgaWYobnVsbD09YXx8bnVsbD09Ynx8IXQoYSkmJiFBKGIpKWE9YSE9PWEmJmIhPT1iO2Vsc2UgYTp7dmFyIGg9cWEsZz14KGEpLGw9eChiKSxuPUUsaz1FO2d8fChuPUIuY2FsbChhKSxuPT1IP249dTpuIT11JiYoZz1yYShhKSkpO2x8fChrPUIuY2FsbChiKSxrPT1IP2s9dTprIT11JiZyYShiKSk7dmFyIHA9bj09dSYmIVIoYSksbD1rPT11JiYhUihiKSxrPW49PWs7aWYoIWt8fGd8fHApe2lmKCFlJiYobj1wJiZ2LmNhbGwoYSxcIl9fd3JhcHBlZF9fXCIpLGw9bCYmdi5jYWxsKGIsXCJfX3dyYXBwZWRfX1wiKSxufHxsKSl7YT1oKG4/YS52YWx1ZSgpOmEsbD9iLnZhbHVlKCk6XG5iLGMsZSxkLGYpO2JyZWFrIGF9aWYoayl7ZHx8KGQ9W10pO2Z8fChmPVtdKTtmb3Iobj1kLmxlbmd0aDtuLS07KWlmKGRbbl09PWEpe2E9ZltuXT09YjticmVhayBhfWQucHVzaChhKTtmLnB1c2goYik7YT0oZz9rYjpsYikoYSxiLGgsYyxlLGQsZik7ZC5wb3AoKTtmLnBvcCgpfWVsc2UgYT1mYWxzZX1lbHNlIGE9bWIoYSxiLG4pfXJldHVybiBhfWZ1bmN0aW9uIG5iKGEsYil7dmFyIGM9Yi5sZW5ndGgsZT1jO2lmKG51bGw9PWEpcmV0dXJuIWU7Zm9yKGE9eShhKTtjLS07KXt2YXIgZD1iW2NdO2lmKGRbMl0/ZFsxXSE9PWFbZFswXV06IShkWzBdaW4gYSkpcmV0dXJuIGZhbHNlfWZvcig7KytjPGU7KXt2YXIgZD1iW2NdLGY9ZFswXSxoPWFbZl0sZz1kWzFdO2lmKGRbMl0pe2lmKGg9PT1wJiYhKGYgaW4gYSkpcmV0dXJuIGZhbHNlfWVsc2UgaWYoZD1wLGQ9PT1wPyFxYShnLGgsdm9pZCAwLHRydWUpOiFkKXJldHVybiBmYWxzZX1yZXR1cm4gdHJ1ZX1mdW5jdGlvbiBEYShhKXt2YXIgYj1vYihhKTtpZigxPT1iLmxlbmd0aCYmXG5iWzBdWzJdKXt2YXIgYz1iWzBdWzBdLGU9YlswXVsxXTtyZXR1cm4gZnVuY3Rpb24oYSl7aWYobnVsbD09YSlyZXR1cm4gZmFsc2U7YT15KGEpO3JldHVybiBhW2NdPT09ZSYmKGUhPT1wfHxjIGluIGEpfX1yZXR1cm4gZnVuY3Rpb24oYSl7cmV0dXJuIG5iKGEsYil9fWZ1bmN0aW9uIGNiKGEsYil7dmFyIGM9eChhKSxlPUphKGEpJiZiPT09YiYmIXQoYiksZD1hK1wiXCI7YT1LYShhKTtyZXR1cm4gZnVuY3Rpb24oZil7aWYobnVsbD09ZilyZXR1cm4gZmFsc2U7dmFyIGg9ZDtmPXkoZik7aWYoISghYyYmZXx8aCBpbiBmKSl7aWYoMSE9YS5sZW5ndGgpe3ZhciBoPWEsZz0wLGw9LTEsbj0tMSxrPWgubGVuZ3RoLGc9bnVsbD09Zz8wOitnfHwwOzA+ZyYmKGc9LWc+az8wOmsrZyk7bD1sPT09cHx8bD5rP2s6K2x8fDA7MD5sJiYobCs9ayk7az1nPmw/MDpsLWc+Pj4wO2c+Pj49MDtmb3IobD1BcnJheShrKTsrK248azspbFtuXT1oW24rZ107Zj1JYShmLGwpfWlmKG51bGw9PWYpcmV0dXJuIGZhbHNlO2g9TGEoYSk7XG5mPXkoZil9cmV0dXJuIGZbaF09PT1iP2IhPT1wfHxoIGluIGY6cWEoYixmW2hdLHAsdHJ1ZSl9fWZ1bmN0aW9uIE1hKGEpe3JldHVybiBmdW5jdGlvbihiKXtyZXR1cm4gbnVsbD09Yj9wOnkoYilbYV19fWZ1bmN0aW9uIHBiKGEpe3ZhciBiPWErXCJcIjthPUthKGEpO3JldHVybiBmdW5jdGlvbihjKXtyZXR1cm4gSWEoYyxhLGIpfX1mdW5jdGlvbiBvYShhLGIsYyl7aWYodHlwZW9mIGEhPVwiZnVuY3Rpb25cIilyZXR1cm4gUTtpZihiPT09cClyZXR1cm4gYTtzd2l0Y2goYyl7Y2FzZSAxOnJldHVybiBmdW5jdGlvbihjKXtyZXR1cm4gYS5jYWxsKGIsYyl9O2Nhc2UgMzpyZXR1cm4gZnVuY3Rpb24oYyxkLGYpe3JldHVybiBhLmNhbGwoYixjLGQsZil9O2Nhc2UgNDpyZXR1cm4gZnVuY3Rpb24oYyxkLGYsaCl7cmV0dXJuIGEuY2FsbChiLGMsZCxmLGgpfTtjYXNlIDU6cmV0dXJuIGZ1bmN0aW9uKGMsZCxmLGgsZyl7cmV0dXJuIGEuY2FsbChiLGMsZCxmLGgsZyl9fXJldHVybiBmdW5jdGlvbigpe3JldHVybiBhLmFwcGx5KGIsXG5hcmd1bWVudHMpfX1mdW5jdGlvbiBOYShhKXt2YXIgYj1uZXcgcWIoYS5ieXRlTGVuZ3RoKTsobmV3IHNhKGIpKS5zZXQobmV3IHNhKGEpKTtyZXR1cm4gYn1mdW5jdGlvbiBrYihhLGIsYyxlLGQsZixoKXt2YXIgZz0tMSxsPWEubGVuZ3RoLG49Yi5sZW5ndGg7aWYobCE9biYmIShkJiZuPmwpKXJldHVybiBmYWxzZTtmb3IoOysrZzxsOyl7dmFyIGs9YVtnXSxuPWJbZ10sbT1lP2UoZD9uOmssZD9rOm4sZyk6cDtpZihtIT09cCl7aWYobSljb250aW51ZTtyZXR1cm4gZmFsc2V9aWYoZCl7aWYoIWJiKGIsZnVuY3Rpb24oYSl7cmV0dXJuIGs9PT1hfHxjKGssYSxlLGQsZixoKX0pKXJldHVybiBmYWxzZX1lbHNlIGlmKGshPT1uJiYhYyhrLG4sZSxkLGYsaCkpcmV0dXJuIGZhbHNlfXJldHVybiB0cnVlfWZ1bmN0aW9uIG1iKGEsYixjKXtzd2l0Y2goYyl7Y2FzZSBJOmNhc2UgSjpyZXR1cm4rYT09K2I7Y2FzZSBLOnJldHVybiBhLm5hbWU9PWIubmFtZSYmYS5tZXNzYWdlPT1iLm1lc3NhZ2U7Y2FzZSBMOnJldHVybiBhIT1cbithP2IhPStiOmE9PStiO2Nhc2UgTTpjYXNlIEQ6cmV0dXJuIGE9PWIrXCJcIn1yZXR1cm4gZmFsc2V9ZnVuY3Rpb24gbGIoYSxiLGMsZSxkLGYsaCl7dmFyIGc9QyhhKSxsPWcubGVuZ3RoLG49QyhiKS5sZW5ndGg7aWYobCE9biYmIWQpcmV0dXJuIGZhbHNlO2ZvcihuPWw7bi0tOyl7dmFyIGs9Z1tuXTtpZighKGQ/ayBpbiBiOnYuY2FsbChiLGspKSlyZXR1cm4gZmFsc2V9Zm9yKHZhciBtPWQ7KytuPGw7KXt2YXIgaz1nW25dLHI9YVtrXSxxPWJba10scz1lP2UoZD9xOnIsZD9yOnEsayk6cDtpZihzPT09cD8hYyhyLHEsZSxkLGYsaCk6IXMpcmV0dXJuIGZhbHNlO218fChtPVwiY29uc3RydWN0b3JcIj09ayl9cmV0dXJuIG18fChjPWEuY29uc3RydWN0b3IsZT1iLmNvbnN0cnVjdG9yLCEoYyE9ZSYmXCJjb25zdHJ1Y3RvclwiaW4gYSYmXCJjb25zdHJ1Y3RvclwiaW4gYil8fHR5cGVvZiBjPT1cImZ1bmN0aW9uXCImJmMgaW5zdGFuY2VvZiBjJiZ0eXBlb2YgZT09XCJmdW5jdGlvblwiJiZlIGluc3RhbmNlb2YgZSk/dHJ1ZTpmYWxzZX1mdW5jdGlvbiBvYihhKXthPVxuT2EoYSk7Zm9yKHZhciBiPWEubGVuZ3RoO2ItLTspe3ZhciBjPWFbYl1bMV07YVtiXVsyXT1jPT09YyYmIXQoYyl9cmV0dXJuIGF9ZnVuY3Rpb24gVihhLGIpe3ZhciBjPW51bGw9PWE/cDphW2JdO3JldHVybiBQYShjKT9jOnB9ZnVuY3Rpb24gZGIoYSl7dmFyIGI9YS5sZW5ndGgsYz1uZXcgYS5jb25zdHJ1Y3RvcihiKTtiJiZcInN0cmluZ1wiPT10eXBlb2YgYVswXSYmdi5jYWxsKGEsXCJpbmRleFwiKSYmKGMuaW5kZXg9YS5pbmRleCxjLmlucHV0PWEuaW5wdXQpO3JldHVybiBjfWZ1bmN0aW9uIGViKGEpe2E9YS5jb25zdHJ1Y3Rvcjt0eXBlb2YgYT09XCJmdW5jdGlvblwiJiZhIGluc3RhbmNlb2YgYXx8KGE9T2JqZWN0KTtyZXR1cm4gbmV3IGF9ZnVuY3Rpb24gZmIoYSxiLGMpe3ZhciBlPWEuY29uc3RydWN0b3I7c3dpdGNoKGIpe2Nhc2UgdGE6cmV0dXJuIE5hKGEpO2Nhc2UgSTpjYXNlIEo6cmV0dXJuIG5ldyBlKCthKTtjYXNlIFc6Y2FzZSBYOmNhc2UgWTpjYXNlIFo6Y2FzZSAkOmNhc2UgYWE6Y2FzZSBiYTpjYXNlIGNhOmNhc2UgZGE6cmV0dXJuIGUgaW5zdGFuY2VvZlxuZSYmKGU9eltiXSksYj1hLmJ1ZmZlcixuZXcgZShjP05hKGIpOmIsYS5ieXRlT2Zmc2V0LGEubGVuZ3RoKTtjYXNlIEw6Y2FzZSBEOnJldHVybiBuZXcgZShhKTtjYXNlIE06dmFyIGQ9bmV3IGUoYS5zb3VyY2UscmIuZXhlYyhhKSk7ZC5sYXN0SW5kZXg9YS5sYXN0SW5kZXh9cmV0dXJuIGR9ZnVuY3Rpb24gUyhhKXtyZXR1cm4gbnVsbCE9YSYmTihzYihhKSl9ZnVuY3Rpb24gZWEoYSxiKXthPXR5cGVvZiBhPT1cIm51bWJlclwifHx0Yi50ZXN0KGEpPythOi0xO2I9bnVsbD09Yj9RYTpiO3JldHVybi0xPGEmJjA9PWElMSYmYTxifWZ1bmN0aW9uIFJhKGEsYixjKXtpZighdChjKSlyZXR1cm4gZmFsc2U7dmFyIGU9dHlwZW9mIGI7cmV0dXJuKFwibnVtYmVyXCI9PWU/UyhjKSYmZWEoYixjLmxlbmd0aCk6XCJzdHJpbmdcIj09ZSYmYiBpbiBjKT8oYj1jW2JdLGE9PT1hP2E9PT1iOmIhPT1iKTpmYWxzZX1mdW5jdGlvbiBKYShhKXt2YXIgYj10eXBlb2YgYTtyZXR1cm5cInN0cmluZ1wiPT1iJiZ1Yi50ZXN0KGEpfHxcblwibnVtYmVyXCI9PWI/dHJ1ZTp4KGEpP2ZhbHNlOiF2Yi50ZXN0KGEpfHxmYWxzZX1mdW5jdGlvbiBOKGEpe3JldHVybiB0eXBlb2YgYT09XCJudW1iZXJcIiYmLTE8YSYmMD09YSUxJiZhPD1RYX1mdW5jdGlvbiB3YihhLGIpe2E9eShhKTtmb3IodmFyIGM9LTEsZT1iLmxlbmd0aCxkPXt9OysrYzxlOyl7dmFyIGY9YltjXTtmIGluIGEmJihkW2ZdPWFbZl0pfXJldHVybiBkfWZ1bmN0aW9uIHhiKGEsYil7dmFyIGM9e307amIoYSxmdW5jdGlvbihhLGQsZil7YihhLGQsZikmJihjW2RdPWEpfSk7cmV0dXJuIGN9ZnVuY3Rpb24gU2EoYSl7Zm9yKHZhciBiPVUoYSksYz1iLmxlbmd0aCxlPWMmJmEubGVuZ3RoLGQ9ISFlJiZOKGUpJiYoeChhKXx8VChhKXx8ZmEoYSkpLGY9LTEsaD1bXTsrK2Y8Yzspe3ZhciBnPWJbZl07KGQmJmVhKGcsZSl8fHYuY2FsbChhLGcpKSYmaC5wdXNoKGcpfXJldHVybiBofWZ1bmN0aW9uIHkoYSl7aWYobS5zdXBwb3J0LnVuaW5kZXhlZENoYXJzJiZmYShhKSl7Zm9yKHZhciBiPS0xLFxuYz1hLmxlbmd0aCxlPU9iamVjdChhKTsrK2I8YzspZVtiXT1hLmNoYXJBdChiKTtyZXR1cm4gZX1yZXR1cm4gdChhKT9hOk9iamVjdChhKX1mdW5jdGlvbiBLYShhKXtpZih4KGEpKXJldHVybiBhO3ZhciBiPVtdOyhudWxsPT1hP1wiXCI6YStcIlwiKS5yZXBsYWNlKHliLGZ1bmN0aW9uKGEsZSxkLGYpe2IucHVzaChkP2YucmVwbGFjZSh6YixcIiQxXCIpOmV8fGEpfSk7cmV0dXJuIGJ9ZnVuY3Rpb24gcGEoYSxiLGMpe3ZhciBlPWE/YS5sZW5ndGg6MDtpZighZSlyZXR1cm4tMTtpZih0eXBlb2YgYz09XCJudW1iZXJcIiljPTA+Yz91YShlK2MsMCk6YztlbHNlIGlmKGMpe2M9MDt2YXIgZD1hP2EubGVuZ3RoOmM7aWYodHlwZW9mIGI9PVwibnVtYmVyXCImJmI9PT1iJiZkPD1BYil7Zm9yKDtjPGQ7KXt2YXIgZj1jK2Q+Pj4xLGg9YVtmXTtoPGImJm51bGwhPT1oP2M9ZisxOmQ9Zn1jPWR9ZWxzZXtkPVE7Yz1kKGIpO2Zvcih2YXIgZj0wLGg9YT9hLmxlbmd0aDowLGc9YyE9PWMsbD1udWxsPT09YyxuPVxuYz09PXA7ZjxoOyl7dmFyIGs9QmIoKGYraCkvMiksbT1kKGFba10pLHI9bSE9PXAscT1tPT09bTsoZz9xOmw/cSYmciYmbnVsbCE9bTpuP3EmJnI6bnVsbD09bT8wOm08Yyk/Zj1rKzE6aD1rfWM9Q2IoaCxEYil9cmV0dXJuIGM8ZSYmKGI9PT1iP2I9PT1hW2NdOmFbY10hPT1hW2NdKT9jOi0xfXJldHVybiBuYShhLGIsY3x8MCl9ZnVuY3Rpb24gTGEoYSl7dmFyIGI9YT9hLmxlbmd0aDowO3JldHVybiBiP2FbYi0xXTpwfWZ1bmN0aW9uIGdhKGEsYil7aWYodHlwZW9mIGEhPVwiZnVuY3Rpb25cIil0aHJvdyBuZXcgVHlwZUVycm9yKEViKTtiPXVhKGI9PT1wP2EubGVuZ3RoLTE6K2J8fDAsMCk7cmV0dXJuIGZ1bmN0aW9uKCl7Zm9yKHZhciBjPWFyZ3VtZW50cyxlPS0xLGQ9dWEoYy5sZW5ndGgtYiwwKSxmPUFycmF5KGQpOysrZTxkOylmW2VdPWNbYitlXTtzd2l0Y2goYil7Y2FzZSAwOnJldHVybiBhLmNhbGwodGhpcyxmKTtjYXNlIDE6cmV0dXJuIGEuY2FsbCh0aGlzLGNbMF0sZik7Y2FzZSAyOnJldHVybiBhLmNhbGwodGhpcyxcbmNbMF0sY1sxXSxmKX1kPUFycmF5KGIrMSk7Zm9yKGU9LTE7KytlPGI7KWRbZV09Y1tlXTtkW2JdPWY7cmV0dXJuIGEuYXBwbHkodGhpcyxkKX19ZnVuY3Rpb24gVChhKXtyZXR1cm4gQShhKSYmUyhhKSYmdi5jYWxsKGEsXCJjYWxsZWVcIikmJiFoYS5jYWxsKGEsXCJjYWxsZWVcIil9ZnVuY3Rpb24gaWEoYSl7cmV0dXJuIHQoYSkmJkIuY2FsbChhKT09R31mdW5jdGlvbiB0KGEpe3ZhciBiPXR5cGVvZiBhO3JldHVybiEhYSYmKFwib2JqZWN0XCI9PWJ8fFwiZnVuY3Rpb25cIj09Yil9ZnVuY3Rpb24gUGEoYSl7cmV0dXJuIG51bGw9PWE/ZmFsc2U6aWEoYSk/VGEudGVzdChVYS5jYWxsKGEpKTpBKGEpJiYoUihhKT9UYTpGYikudGVzdChhKX1mdW5jdGlvbiBmYShhKXtyZXR1cm4gdHlwZW9mIGE9PVwic3RyaW5nXCJ8fEEoYSkmJkIuY2FsbChhKT09RH1mdW5jdGlvbiByYShhKXtyZXR1cm4gQShhKSYmTihhLmxlbmd0aCkmJiEhcVtCLmNhbGwoYSldfWZ1bmN0aW9uIFUoYSl7aWYobnVsbD09YSlyZXR1cm5bXTtcbnQoYSl8fChhPU9iamVjdChhKSk7Zm9yKHZhciBiPWEubGVuZ3RoLGM9bS5zdXBwb3J0LGI9YiYmTihiKSYmKHgoYSl8fFQoYSl8fGZhKGEpKSYmYnx8MCxlPWEuY29uc3RydWN0b3IsZD0tMSxlPWlhKGUpJiZlLnByb3RvdHlwZXx8RixmPWU9PT1hLGg9QXJyYXkoYiksZz0wPGIsbD1jLmVudW1FcnJvclByb3BzJiYoYT09PWphfHxhIGluc3RhbmNlb2YgRXJyb3IpLG49Yy5lbnVtUHJvdG90eXBlcyYmaWEoYSk7KytkPGI7KWhbZF09ZCtcIlwiO2Zvcih2YXIgayBpbiBhKW4mJlwicHJvdG90eXBlXCI9PWt8fGwmJihcIm1lc3NhZ2VcIj09a3x8XCJuYW1lXCI9PWspfHxnJiZlYShrLGIpfHxcImNvbnN0cnVjdG9yXCI9PWsmJihmfHwhdi5jYWxsKGEsaykpfHxoLnB1c2goayk7aWYoYy5ub25FbnVtU2hhZG93cyYmYSE9PUYpZm9yKGI9YT09PUdiP0Q6YT09PWphP0s6Qi5jYWxsKGEpLGM9c1tiXXx8c1t1XSxiPT11JiYoZT1GKSxiPXZhLmxlbmd0aDtiLS07KWs9dmFbYl0sZD1jW2tdLGYmJmR8fChkPyF2LmNhbGwoYSxcbmspOmFba109PT1lW2tdKXx8aC5wdXNoKGspO3JldHVybiBofWZ1bmN0aW9uIE9hKGEpe2E9eShhKTtmb3IodmFyIGI9LTEsYz1DKGEpLGU9Yy5sZW5ndGgsZD1BcnJheShlKTsrK2I8ZTspe3ZhciBmPWNbYl07ZFtiXT1bZixhW2ZdXX1yZXR1cm4gZH1mdW5jdGlvbiBrYShhLGIsYyl7YyYmUmEoYSxiLGMpJiYoYj1wKTtyZXR1cm4gQShhKT9WYShhKTpDYShhLGIpfWZ1bmN0aW9uIFEoYSl7cmV0dXJuIGF9ZnVuY3Rpb24gVmEoYSl7cmV0dXJuIERhKEZhKGEsdHJ1ZSkpfWZ1bmN0aW9uIEVhKGEpe3JldHVybiBKYShhKT9NYShhKTpwYihhKX12YXIgcCxpYj0yMDAsRWI9XCJFeHBlY3RlZCBhIGZ1bmN0aW9uXCIsSD1cIltvYmplY3QgQXJndW1lbnRzXVwiLEU9XCJbb2JqZWN0IEFycmF5XVwiLEk9XCJbb2JqZWN0IEJvb2xlYW5dXCIsSj1cIltvYmplY3QgRGF0ZV1cIixLPVwiW29iamVjdCBFcnJvcl1cIixHPVwiW29iamVjdCBGdW5jdGlvbl1cIixMPVwiW29iamVjdCBOdW1iZXJdXCIsdT1cIltvYmplY3QgT2JqZWN0XVwiLFxuTT1cIltvYmplY3QgUmVnRXhwXVwiLEQ9XCJbb2JqZWN0IFN0cmluZ11cIix0YT1cIltvYmplY3QgQXJyYXlCdWZmZXJdXCIsVz1cIltvYmplY3QgRmxvYXQzMkFycmF5XVwiLFg9XCJbb2JqZWN0IEZsb2F0NjRBcnJheV1cIixZPVwiW29iamVjdCBJbnQ4QXJyYXldXCIsWj1cIltvYmplY3QgSW50MTZBcnJheV1cIiwkPVwiW29iamVjdCBJbnQzMkFycmF5XVwiLGFhPVwiW29iamVjdCBVaW50OEFycmF5XVwiLGJhPVwiW29iamVjdCBVaW50OENsYW1wZWRBcnJheV1cIixjYT1cIltvYmplY3QgVWludDE2QXJyYXldXCIsZGE9XCJbb2JqZWN0IFVpbnQzMkFycmF5XVwiLHZiPS9cXC58XFxbKD86W15bXFxdXSp8KFtcIiddKSg/Oig/IVxcMSlbXlxcblxcXFxdfFxcXFwuKSo/XFwxKVxcXS8sdWI9L15cXHcqJC8seWI9L1teLltcXF1dK3xcXFsoPzooLT9cXGQrKD86XFwuXFxkKyk/KXwoW1wiJ10pKCg/Oig/IVxcMilbXlxcblxcXFxdfFxcXFwuKSo/KVxcMilcXF0vZyx6Yj0vXFxcXChcXFxcKT8vZyxyYj0vXFx3KiQvLEZiPS9eXFxbb2JqZWN0IC4rP0NvbnN0cnVjdG9yXFxdJC8sdGI9L15cXGQrJC8sXG52YT1cImNvbnN0cnVjdG9yIGhhc093blByb3BlcnR5IGlzUHJvdG90eXBlT2YgcHJvcGVydHlJc0VudW1lcmFibGUgdG9Mb2NhbGVTdHJpbmcgdG9TdHJpbmcgdmFsdWVPZlwiLnNwbGl0KFwiIFwiKSxxPXt9O3FbV109cVtYXT1xW1ldPXFbWl09cVskXT1xW2FhXT1xW2JhXT1xW2NhXT1xW2RhXT10cnVlO3FbSF09cVtFXT1xW3RhXT1xW0ldPXFbSl09cVtLXT1xW0ddPXFbXCJbb2JqZWN0IE1hcF1cIl09cVtMXT1xW3VdPXFbTV09cVtcIltvYmplY3QgU2V0XVwiXT1xW0RdPXFbXCJbb2JqZWN0IFdlYWtNYXBdXCJdPWZhbHNlO3ZhciByPXt9O3JbSF09cltFXT1yW3RhXT1yW0ldPXJbSl09cltXXT1yW1hdPXJbWV09cltaXT1yWyRdPXJbTF09clt1XT1yW01dPXJbRF09clthYV09cltiYV09cltjYV09cltkYV09dHJ1ZTtyW0tdPXJbR109cltcIltvYmplY3QgTWFwXVwiXT1yW1wiW29iamVjdCBTZXRdXCJdPXJbXCJbb2JqZWN0IFdlYWtNYXBdXCJdPWZhbHNlO3ZhciBsYT17XCJmdW5jdGlvblwiOnRydWUsb2JqZWN0OnRydWV9LG1hPWxhW3R5cGVvZiBleHBvcnRzXSYmXG5leHBvcnRzJiYhZXhwb3J0cy5ub2RlVHlwZSYmZXhwb3J0cyxPPWxhW3R5cGVvZiBtb2R1bGVdJiZtb2R1bGUmJiFtb2R1bGUubm9kZVR5cGUmJm1vZHVsZSxIYj1sYVt0eXBlb2Ygc2VsZl0mJnNlbGYmJnNlbGYuT2JqZWN0JiZzZWxmLFdhPWxhW3R5cGVvZiB3aW5kb3ddJiZ3aW5kb3cmJndpbmRvdy5PYmplY3QmJndpbmRvdyxJYj1PJiZPLmV4cG9ydHM9PT1tYSYmbWEsdz1tYSYmTyYmdHlwZW9mIGdsb2JhbD09XCJvYmplY3RcIiYmZ2xvYmFsJiZnbG9iYWwuT2JqZWN0JiZnbG9iYWx8fFdhIT09KHRoaXMmJnRoaXMud2luZG93KSYmV2F8fEhifHx0aGlzLFI9ZnVuY3Rpb24oKXt0cnl7T2JqZWN0KHt0b1N0cmluZzowfStcIlwiKX1jYXRjaChhKXtyZXR1cm4gZnVuY3Rpb24oKXtyZXR1cm4gZmFsc2V9fXJldHVybiBmdW5jdGlvbihhKXtyZXR1cm4gdHlwZW9mIGEudG9TdHJpbmchPVwiZnVuY3Rpb25cIiYmdHlwZW9mKGErXCJcIik9PVwic3RyaW5nXCJ9fSgpLEpiPUFycmF5LnByb3RvdHlwZSxqYT1FcnJvci5wcm90b3R5cGUsXG5GPU9iamVjdC5wcm90b3R5cGUsR2I9U3RyaW5nLnByb3RvdHlwZSxVYT1GdW5jdGlvbi5wcm90b3R5cGUudG9TdHJpbmcsdj1GLmhhc093blByb3BlcnR5LEI9Ri50b1N0cmluZyxUYT1SZWdFeHAoXCJeXCIrVWEuY2FsbCh2KS5yZXBsYWNlKC9bXFxcXF4kLiorPygpW1xcXXt9fF0vZyxcIlxcXFwkJlwiKS5yZXBsYWNlKC9oYXNPd25Qcm9wZXJ0eXwoZnVuY3Rpb24pLio/KD89XFxcXFxcKCl8IGZvciAuKz8oPz1cXFxcXFxdKS9nLFwiJDEuKj9cIikrXCIkXCIpLHFiPXcuQXJyYXlCdWZmZXIsaGE9Ri5wcm9wZXJ0eUlzRW51bWVyYWJsZSx6YT1WKHcsXCJTZXRcIiksWGE9SmIuc3BsaWNlLHNhPXcuVWludDhBcnJheSx5YT1WKE9iamVjdCxcImNyZWF0ZVwiKSxCYj1NYXRoLmZsb29yLEtiPVYoQXJyYXksXCJpc0FycmF5XCIpLFlhPVYoT2JqZWN0LFwia2V5c1wiKSx1YT1NYXRoLm1heCxDYj1NYXRoLm1pbixEYj00Mjk0OTY3Mjk0LEFiPTIxNDc0ODM2NDcsUWE9OTAwNzE5OTI1NDc0MDk5MSx6PXt9O3pbV109dy5GbG9hdDMyQXJyYXk7XG56W1hdPXcuRmxvYXQ2NEFycmF5O3pbWV09dy5JbnQ4QXJyYXk7eltaXT13LkludDE2QXJyYXk7elskXT13LkludDMyQXJyYXk7elthYV09c2E7eltiYV09dy5VaW50OENsYW1wZWRBcnJheTt6W2NhXT13LlVpbnQxNkFycmF5O3pbZGFdPXcuVWludDMyQXJyYXk7dmFyIHM9e307c1tFXT1zW0pdPXNbTF09e2NvbnN0cnVjdG9yOnRydWUsdG9Mb2NhbGVTdHJpbmc6dHJ1ZSx0b1N0cmluZzp0cnVlLHZhbHVlT2Y6dHJ1ZX07c1tJXT1zW0RdPXtjb25zdHJ1Y3Rvcjp0cnVlLHRvU3RyaW5nOnRydWUsdmFsdWVPZjp0cnVlfTtzW0tdPXNbR109c1tNXT17Y29uc3RydWN0b3I6dHJ1ZSx0b1N0cmluZzp0cnVlfTtzW3VdPXtjb25zdHJ1Y3Rvcjp0cnVlfTtBYSh2YSxmdW5jdGlvbihhKXtmb3IodmFyIGIgaW4gcylpZih2LmNhbGwocyxiKSl7dmFyIGM9c1tiXTtjW2FdPXYuY2FsbChjLGEpfX0pO3ZhciBQPW0uc3VwcG9ydD17fTsoZnVuY3Rpb24oYSl7ZnVuY3Rpb24gYigpe3RoaXMueD1hfXZhciBjPXswOmEsbGVuZ3RoOmF9LFxuZT1bXTtiLnByb3RvdHlwZT17dmFsdWVPZjphLHk6YX07Zm9yKHZhciBkIGluIG5ldyBiKWUucHVzaChkKTtQLmVudW1FcnJvclByb3BzPWhhLmNhbGwoamEsXCJtZXNzYWdlXCIpfHxoYS5jYWxsKGphLFwibmFtZVwiKTtQLmVudW1Qcm90b3R5cGVzPWhhLmNhbGwoYixcInByb3RvdHlwZVwiKTtQLm5vbkVudW1TaGFkb3dzPSEvdmFsdWVPZi8udGVzdChlKTtQLnNwbGljZU9iamVjdHM9KFhhLmNhbGwoYywwLDEpLCFjWzBdKTtQLnVuaW5kZXhlZENoYXJzPVwieHhcIiE9XCJ4XCJbMF0rT2JqZWN0KFwieFwiKVswXX0pKDEsMCk7dmFyIEhhPWZ1bmN0aW9uKGEpe3JldHVybiBmdW5jdGlvbihiLGMsZSl7dmFyIGQ9eShiKTtlPWUoYik7Zm9yKHZhciBmPWUubGVuZ3RoLGg9YT9mOi0xO2E/aC0tOisraDxmOyl7dmFyIGc9ZVtoXTtpZihmYWxzZT09PWMoZFtnXSxnLGQpKWJyZWFrfXJldHVybiBifX0oKSxzYj1NYShcImxlbmd0aFwiKSx4PUtifHxmdW5jdGlvbihhKXtyZXR1cm4gQShhKSYmTihhLmxlbmd0aCkmJkIuY2FsbChhKT09XG5FfSx3YT1mdW5jdGlvbihhKXtyZXR1cm4gZ2EoZnVuY3Rpb24oYixjKXt2YXIgZT0tMSxkPW51bGw9PWI/MDpjLmxlbmd0aCxmPTI8ZD9jW2QtMl06cCxoPTI8ZD9jWzJdOnAsZz0xPGQ/Y1tkLTFdOnA7dHlwZW9mIGY9PVwiZnVuY3Rpb25cIj8oZj1vYShmLGcsNSksZC09Mik6KGY9dHlwZW9mIGc9PVwiZnVuY3Rpb25cIj9nOnAsZC09Zj8xOjApO2gmJlJhKGNbMF0sY1sxXSxoKSYmKGY9Mz5kP3A6ZixkPTEpO2Zvcig7KytlPGQ7KShoPWNbZV0pJiZhKGIsaCxmKTtyZXR1cm4gYn0pfShmdW5jdGlvbihhLGIsYyl7aWYoYylmb3IodmFyIGU9LTEsZD1DKGIpLGY9ZC5sZW5ndGg7KytlPGY7KXt2YXIgaD1kW2VdLGc9YVtoXSxsPWMoZyxiW2hdLGgsYSxiKTsobD09PWw/bD09PWc6ZyE9PWcpJiYoZyE9PXB8fGggaW4gYSl8fChhW2hdPWwpfWVsc2UgYT1CYShhLGIpO3JldHVybiBhfSksTGI9ZnVuY3Rpb24oYSxiKXtyZXR1cm4gZ2EoZnVuY3Rpb24oYyl7dmFyIGU9Y1swXTtpZihudWxsPT1lKXJldHVybiBlO1xuYy5wdXNoKGIpO3JldHVybiBhLmFwcGx5KHAsYyl9KX0od2EsZnVuY3Rpb24oYSxiKXtyZXR1cm4gYT09PXA/YjphfSksQz1ZYT9mdW5jdGlvbihhKXt2YXIgYj1udWxsPT1hP3A6YS5jb25zdHJ1Y3RvcjtyZXR1cm4gdHlwZW9mIGI9PVwiZnVuY3Rpb25cIiYmYi5wcm90b3R5cGU9PT1hfHwodHlwZW9mIGE9PVwiZnVuY3Rpb25cIj9tLnN1cHBvcnQuZW51bVByb3RvdHlwZXM6UyhhKSk/U2EoYSk6dChhKT9ZYShhKTpbXX06U2EsTWI9Z2EoZnVuY3Rpb24oYSxiKXtpZihudWxsPT1hKXJldHVybnt9O2lmKFwiZnVuY3Rpb25cIiE9dHlwZW9mIGJbMF0pcmV0dXJuIGI9YWIoR2EoYikpLHdiKGEsaGIoVShhKSxiKSk7dmFyIGM9b2EoYlswXSxiWzFdLDMpO3JldHVybiB4YihhLGZ1bmN0aW9uKGEsYixmKXtyZXR1cm4hYyhhLGIsZil9KX0pO3hhLnByb3RvdHlwZS5wdXNoPWZ1bmN0aW9uKGEpe3ZhciBiPXRoaXMuZGF0YTt0eXBlb2YgYT09XCJzdHJpbmdcInx8dChhKT9iLnNldC5hZGQoYSk6Yi5oYXNoW2FdPVxuITB9O20uYXNzaWduPXdhO20uY2FsbGJhY2s9a2E7bS5kZWZhdWx0cz1MYjttLmtleXM9QzttLmtleXNJbj1VO20ubWF0Y2hlcz1WYTttLm9taXQ9TWI7bS5wYWlycz1PYTttLnByb3BlcnR5PUVhO20ucmVtb3ZlPWZ1bmN0aW9uKGEsYixjKXt2YXIgZT1bXTtpZighYXx8IWEubGVuZ3RoKXJldHVybiBlO3ZhciBkPS0xLGY9W10saD1hLmxlbmd0aCxnPW0uY2FsbGJhY2t8fGthLGc9Zz09PWthP0NhOmc7Zm9yKGI9ZyhiLGMsMyk7KytkPGg7KWM9YVtkXSxiKGMsZCxhKSYmKGUucHVzaChjKSxmLnB1c2goZCkpO2ZvcihiPWE/Zi5sZW5ndGg6MDtiLS07KWlmKGQ9ZltiXSxkIT1sJiZlYShkKSl7dmFyIGw9ZDtYYS5jYWxsKGEsZCwxKX1yZXR1cm4gZX07bS5yZXN0UGFyYW09Z2E7bS5leHRlbmQ9d2E7bS5pdGVyYXRlZT1rYTttLmlkZW50aXR5PVE7bS5pbmRleE9mPXBhO20uaXNBcmd1bWVudHM9VDttLmlzQXJyYXk9eDttLmlzRnVuY3Rpb249aWE7bS5pc05hdGl2ZT1QYTttLmlzT2JqZWN0PVxudDttLmlzU3RyaW5nPWZhO20uaXNUeXBlZEFycmF5PXJhO20ubGFzdD1MYTttLlZFUlNJT049XCIzLjEwLjFcIjttYSYmTyYmSWImJigoTy5leHBvcnRzPW0pLl89bSl9LmNhbGwodGhpcykpOyJdfQ==
