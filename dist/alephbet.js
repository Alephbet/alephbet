(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.AlephBet = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{}],2:[function(require,module,exports){
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
},{"./core":1}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
var engine = require('../src/store-engine')

var storages = require('../storages/all')
var plugins = [require('../plugins/json2')]

module.exports = engine.createStore(storages, plugins)

},{"../plugins/json2":5,"../src/store-engine":7,"../storages/all":9}],5:[function(require,module,exports){
module.exports = json2Plugin

function json2Plugin() {
	require('./lib/json2')
	return {}
}

},{"./lib/json2":6}],6:[function(require,module,exports){
/* eslint-disable */

//  json2.js
//  2016-10-28
//  Public Domain.
//  NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
//  See http://www.JSON.org/js.html
//  This code should be minified before deployment.
//  See http://javascript.crockford.com/jsmin.html

//  USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
//  NOT CONTROL.

//  This file creates a global JSON object containing two methods: stringify
//  and parse. This file provides the ES5 JSON capability to ES3 systems.
//  If a project might run on IE8 or earlier, then this file should be included.
//  This file does nothing on ES5 systems.

//      JSON.stringify(value, replacer, space)
//          value       any JavaScript value, usually an object or array.
//          replacer    an optional parameter that determines how object
//                      values are stringified for objects. It can be a
//                      function or an array of strings.
//          space       an optional parameter that specifies the indentation
//                      of nested structures. If it is omitted, the text will
//                      be packed without extra whitespace. If it is a number,
//                      it will specify the number of spaces to indent at each
//                      level. If it is a string (such as "\t" or "&nbsp;"),
//                      it contains the characters used to indent at each level.
//          This method produces a JSON text from a JavaScript value.
//          When an object value is found, if the object contains a toJSON
//          method, its toJSON method will be called and the result will be
//          stringified. A toJSON method does not serialize: it returns the
//          value represented by the name/value pair that should be serialized,
//          or undefined if nothing should be serialized. The toJSON method
//          will be passed the key associated with the value, and this will be
//          bound to the value.

//          For example, this would serialize Dates as ISO strings.

//              Date.prototype.toJSON = function (key) {
//                  function f(n) {
//                      // Format integers to have at least two digits.
//                      return (n < 10)
//                          ? "0" + n
//                          : n;
//                  }
//                  return this.getUTCFullYear()   + "-" +
//                       f(this.getUTCMonth() + 1) + "-" +
//                       f(this.getUTCDate())      + "T" +
//                       f(this.getUTCHours())     + ":" +
//                       f(this.getUTCMinutes())   + ":" +
//                       f(this.getUTCSeconds())   + "Z";
//              };

//          You can provide an optional replacer method. It will be passed the
//          key and value of each member, with this bound to the containing
//          object. The value that is returned from your method will be
//          serialized. If your method returns undefined, then the member will
//          be excluded from the serialization.

//          If the replacer parameter is an array of strings, then it will be
//          used to select the members to be serialized. It filters the results
//          such that only members with keys listed in the replacer array are
//          stringified.

//          Values that do not have JSON representations, such as undefined or
//          functions, will not be serialized. Such values in objects will be
//          dropped; in arrays they will be replaced with null. You can use
//          a replacer function to replace those with JSON values.

//          JSON.stringify(undefined) returns undefined.

//          The optional space parameter produces a stringification of the
//          value that is filled with line breaks and indentation to make it
//          easier to read.

//          If the space parameter is a non-empty string, then that string will
//          be used for indentation. If the space parameter is a number, then
//          the indentation will be that many spaces.

//          Example:

//          text = JSON.stringify(["e", {pluribus: "unum"}]);
//          // text is '["e",{"pluribus":"unum"}]'

//          text = JSON.stringify(["e", {pluribus: "unum"}], null, "\t");
//          // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

//          text = JSON.stringify([new Date()], function (key, value) {
//              return this[key] instanceof Date
//                  ? "Date(" + this[key] + ")"
//                  : value;
//          });
//          // text is '["Date(---current time---)"]'

//      JSON.parse(text, reviver)
//          This method parses a JSON text to produce an object or array.
//          It can throw a SyntaxError exception.

//          The optional reviver parameter is a function that can filter and
//          transform the results. It receives each of the keys and values,
//          and its return value is used instead of the original value.
//          If it returns what it received, then the structure is not modified.
//          If it returns undefined then the member is deleted.

//          Example:

//          // Parse the text. Values that look like ISO date strings will
//          // be converted to Date objects.

//          myData = JSON.parse(text, function (key, value) {
//              var a;
//              if (typeof value === "string") {
//                  a =
//   /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
//                  if (a) {
//                      return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
//                          +a[5], +a[6]));
//                  }
//              }
//              return value;
//          });

//          myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
//              var d;
//              if (typeof value === "string" &&
//                      value.slice(0, 5) === "Date(" &&
//                      value.slice(-1) === ")") {
//                  d = new Date(value.slice(5, -1));
//                  if (d) {
//                      return d;
//                  }
//              }
//              return value;
//          });

//  This is a reference implementation. You are free to copy, modify, or
//  redistribute.

/*jslint
    eval, for, this
*/

/*property
    JSON, apply, call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (typeof JSON !== "object") {
    JSON = {};
}

(function () {
    "use strict";

    var rx_one = /^[\],:{}\s]*$/;
    var rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
    var rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
    var rx_four = /(?:^|:|,)(?:\s*\[)+/g;
    var rx_escapable = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    var rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10
            ? "0" + n
            : n;
    }

    function this_value() {
        return this.valueOf();
    }

    if (typeof Date.prototype.toJSON !== "function") {

        Date.prototype.toJSON = function () {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear() + "-" +
                        f(this.getUTCMonth() + 1) + "-" +
                        f(this.getUTCDate()) + "T" +
                        f(this.getUTCHours()) + ":" +
                        f(this.getUTCMinutes()) + ":" +
                        f(this.getUTCSeconds()) + "Z"
                : null;
        };

        Boolean.prototype.toJSON = this_value;
        Number.prototype.toJSON = this_value;
        String.prototype.toJSON = this_value;
    }

    var gap;
    var indent;
    var meta;
    var rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        rx_escapable.lastIndex = 0;
        return rx_escapable.test(string)
            ? "\"" + string.replace(rx_escapable, function (a) {
                var c = meta[a];
                return typeof c === "string"
                    ? c
                    : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
            }) + "\""
            : "\"" + string + "\"";
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i;          // The loop counter.
        var k;          // The member key.
        var v;          // The member value.
        var length;
        var mind = gap;
        var partial;
        var value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === "object" &&
                typeof value.toJSON === "function") {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === "function") {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case "string":
            return quote(value);

        case "number":

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value)
                ? String(value)
                : "null";

        case "boolean":
        case "null":

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce "null". The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is "object", we might be dealing with an object or an array or
// null.

        case "object":

// Due to a specification blunder in ECMAScript, typeof null is "object",
// so watch out for that case.

            if (!value) {
                return "null";
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === "[object Array]") {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || "null";
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? "[]"
                    : gap
                        ? "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]"
                        : "[" + partial.join(",") + "]";
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === "object") {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === "string") {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (
                                gap
                                    ? ": "
                                    : ":"
                            ) + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (
                                gap
                                    ? ": "
                                    : ":"
                            ) + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? "{}"
                : gap
                    ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}"
                    : "{" + partial.join(",") + "}";
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== "function") {
        meta = {    // table of character substitutions
            "\b": "\\b",
            "\t": "\\t",
            "\n": "\\n",
            "\f": "\\f",
            "\r": "\\r",
            "\"": "\\\"",
            "\\": "\\\\"
        };
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = "";
            indent = "";

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === "number") {
                for (i = 0; i < space; i += 1) {
                    indent += " ";
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === "string") {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== "function" &&
                    (typeof replacer !== "object" ||
                    typeof replacer.length !== "number")) {
                throw new Error("JSON.stringify");
            }

// Make a fake root object containing our value under the key of "".
// Return the result of stringifying the value.

            return str("", {"": value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== "function") {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k;
                var v;
                var value = holder[key];
                if (value && typeof value === "object") {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            rx_dangerous.lastIndex = 0;
            if (rx_dangerous.test(text)) {
                text = text.replace(rx_dangerous, function (a) {
                    return "\\u" +
                            ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with "()" and "new"
// because they can cause invocation, and "=" because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with "@" (a non-JSON character). Second, we
// replace all simple value tokens with "]" characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or "]" or
// "," or ":" or "{" or "}". If that is so, then the text is safe for eval.

            if (
                rx_one.test(
                    text
                        .replace(rx_two, "@")
                        .replace(rx_three, "]")
                        .replace(rx_four, "")
                )
            ) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The "{" operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval("(" + text + ")");

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return (typeof reviver === "function")
                    ? walk({"": j}, "")
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError("JSON.parse");
        };
    }
}());
},{}],7:[function(require,module,exports){
var util = require('./util')
var slice = util.slice
var pluck = util.pluck
var each = util.each
var bind = util.bind
var create = util.create
var isList = util.isList
var isFunction = util.isFunction
var isObject = util.isObject

module.exports = {
	createStore: createStore
}

var storeAPI = {
	version: '2.0.12',
	enabled: false,
	
	// get returns the value of the given key. If that value
	// is undefined, it returns optionalDefaultValue instead.
	get: function(key, optionalDefaultValue) {
		var data = this.storage.read(this._namespacePrefix + key)
		return this._deserialize(data, optionalDefaultValue)
	},

	// set will store the given value at key and returns value.
	// Calling set with value === undefined is equivalent to calling remove.
	set: function(key, value) {
		if (value === undefined) {
			return this.remove(key)
		}
		this.storage.write(this._namespacePrefix + key, this._serialize(value))
		return value
	},

	// remove deletes the key and value stored at the given key.
	remove: function(key) {
		this.storage.remove(this._namespacePrefix + key)
	},

	// each will call the given callback once for each key-value pair
	// in this store.
	each: function(callback) {
		var self = this
		this.storage.each(function(val, namespacedKey) {
			callback.call(self, self._deserialize(val), (namespacedKey || '').replace(self._namespaceRegexp, ''))
		})
	},

	// clearAll will remove all the stored key-value pairs in this store.
	clearAll: function() {
		this.storage.clearAll()
	},

	// additional functionality that can't live in plugins
	// ---------------------------------------------------

	// hasNamespace returns true if this store instance has the given namespace.
	hasNamespace: function(namespace) {
		return (this._namespacePrefix == '__storejs_'+namespace+'_')
	},

	// createStore creates a store.js instance with the first
	// functioning storage in the list of storage candidates,
	// and applies the the given mixins to the instance.
	createStore: function() {
		return createStore.apply(this, arguments)
	},
	
	addPlugin: function(plugin) {
		this._addPlugin(plugin)
	},
	
	namespace: function(namespace) {
		return createStore(this.storage, this.plugins, namespace)
	}
}

function _warn() {
	var _console = (typeof console == 'undefined' ? null : console)
	if (!_console) { return }
	var fn = (_console.warn ? _console.warn : _console.log)
	fn.apply(_console, arguments)
}

function createStore(storages, plugins, namespace) {
	if (!namespace) {
		namespace = ''
	}
	if (storages && !isList(storages)) {
		storages = [storages]
	}
	if (plugins && !isList(plugins)) {
		plugins = [plugins]
	}

	var namespacePrefix = (namespace ? '__storejs_'+namespace+'_' : '')
	var namespaceRegexp = (namespace ? new RegExp('^'+namespacePrefix) : null)
	var legalNamespaces = /^[a-zA-Z0-9_\-]*$/ // alpha-numeric + underscore and dash
	if (!legalNamespaces.test(namespace)) {
		throw new Error('store.js namespaces can only have alphanumerics + underscores and dashes')
	}
	
	var _privateStoreProps = {
		_namespacePrefix: namespacePrefix,
		_namespaceRegexp: namespaceRegexp,

		_testStorage: function(storage) {
			try {
				var testStr = '__storejs__test__'
				storage.write(testStr, testStr)
				var ok = (storage.read(testStr) === testStr)
				storage.remove(testStr)
				return ok
			} catch(e) {
				return false
			}
		},

		_assignPluginFnProp: function(pluginFnProp, propName) {
			var oldFn = this[propName]
			this[propName] = function pluginFn() {
				var args = slice(arguments, 0)
				var self = this

				// super_fn calls the old function which was overwritten by
				// this mixin.
				function super_fn() {
					if (!oldFn) { return }
					each(arguments, function(arg, i) {
						args[i] = arg
					})
					return oldFn.apply(self, args)
				}

				// Give mixing function access to super_fn by prefixing all mixin function
				// arguments with super_fn.
				var newFnArgs = [super_fn].concat(args)

				return pluginFnProp.apply(self, newFnArgs)
			}
		},

		_serialize: function(obj) {
			return JSON.stringify(obj)
		},

		_deserialize: function(strVal, defaultVal) {
			if (!strVal) { return defaultVal }
			// It is possible that a raw string value has been previously stored
			// in a storage without using store.js, meaning it will be a raw
			// string value instead of a JSON serialized string. By defaulting
			// to the raw string value in case of a JSON parse error, we allow
			// for past stored values to be forwards-compatible with store.js
			var val = ''
			try { val = JSON.parse(strVal) }
			catch(e) { val = strVal }

			return (val !== undefined ? val : defaultVal)
		},
		
		_addStorage: function(storage) {
			if (this.enabled) { return }
			if (this._testStorage(storage)) {
				this.storage = storage
				this.enabled = true
			}
		},

		_addPlugin: function(plugin) {
			var self = this

			// If the plugin is an array, then add all plugins in the array.
			// This allows for a plugin to depend on other plugins.
			if (isList(plugin)) {
				each(plugin, function(plugin) {
					self._addPlugin(plugin)
				})
				return
			}

			// Keep track of all plugins we've seen so far, so that we
			// don't add any of them twice.
			var seenPlugin = pluck(this.plugins, function(seenPlugin) {
				return (plugin === seenPlugin)
			})
			if (seenPlugin) {
				return
			}
			this.plugins.push(plugin)

			// Check that the plugin is properly formed
			if (!isFunction(plugin)) {
				throw new Error('Plugins must be function values that return objects')
			}

			var pluginProperties = plugin.call(this)
			if (!isObject(pluginProperties)) {
				throw new Error('Plugins must return an object of function properties')
			}

			// Add the plugin function properties to this store instance.
			each(pluginProperties, function(pluginFnProp, propName) {
				if (!isFunction(pluginFnProp)) {
					throw new Error('Bad plugin property: '+propName+' from plugin '+plugin.name+'. Plugins should only return functions.')
				}
				self._assignPluginFnProp(pluginFnProp, propName)
			})
		},
		
		// Put deprecated properties in the private API, so as to not expose it to accidential
		// discovery through inspection of the store object.
		
		// Deprecated: addStorage
		addStorage: function(storage) {
			_warn('store.addStorage(storage) is deprecated. Use createStore([storages])')
			this._addStorage(storage)
		}
	}

	var store = create(_privateStoreProps, storeAPI, {
		plugins: []
	})
	store.raw = {}
	each(store, function(prop, propName) {
		if (isFunction(prop)) {
			store.raw[propName] = bind(store, prop)			
		}
	})
	each(storages, function(storage) {
		store._addStorage(storage)
	})
	each(plugins, function(plugin) {
		store._addPlugin(plugin)
	})
	return store
}

},{"./util":8}],8:[function(require,module,exports){
(function (global){
var assign = make_assign()
var create = make_create()
var trim = make_trim()
var Global = (typeof window !== 'undefined' ? window : global)

module.exports = {
	assign: assign,
	create: create,
	trim: trim,
	bind: bind,
	slice: slice,
	each: each,
	map: map,
	pluck: pluck,
	isList: isList,
	isFunction: isFunction,
	isObject: isObject,
	Global: Global
}

function make_assign() {
	if (Object.assign) {
		return Object.assign
	} else {
		return function shimAssign(obj, props1, props2, etc) {
			for (var i = 1; i < arguments.length; i++) {
				each(Object(arguments[i]), function(val, key) {
					obj[key] = val
				})
			}			
			return obj
		}
	}
}

function make_create() {
	if (Object.create) {
		return function create(obj, assignProps1, assignProps2, etc) {
			var assignArgsList = slice(arguments, 1)
			return assign.apply(this, [Object.create(obj)].concat(assignArgsList))
		}
	} else {
		function F() {} // eslint-disable-line no-inner-declarations
		return function create(obj, assignProps1, assignProps2, etc) {
			var assignArgsList = slice(arguments, 1)
			F.prototype = obj
			return assign.apply(this, [new F()].concat(assignArgsList))
		}
	}
}

function make_trim() {
	if (String.prototype.trim) {
		return function trim(str) {
			return String.prototype.trim.call(str)
		}
	} else {
		return function trim(str) {
			return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '')
		}
	}
}

function bind(obj, fn) {
	return function() {
		return fn.apply(obj, Array.prototype.slice.call(arguments, 0))
	}
}

function slice(arr, index) {
	return Array.prototype.slice.call(arr, index || 0)
}

function each(obj, fn) {
	pluck(obj, function(val, key) {
		fn(val, key)
		return false
	})
}

function map(obj, fn) {
	var res = (isList(obj) ? [] : {})
	pluck(obj, function(v, k) {
		res[k] = fn(v, k)
		return false
	})
	return res
}

function pluck(obj, fn) {
	if (isList(obj)) {
		for (var i=0; i<obj.length; i++) {
			if (fn(obj[i], i)) {
				return obj[i]
			}
		}
	} else {
		for (var key in obj) {
			if (obj.hasOwnProperty(key)) {
				if (fn(obj[key], key)) {
					return obj[key]
				}
			}
		}
	}
}

function isList(val) {
	return (val != null && typeof val != 'function' && typeof val.length == 'number')
}

function isFunction(val) {
	return val && {}.toString.call(val) === '[object Function]'
}

function isObject(val) {
	return val && {}.toString.call(val) === '[object Object]'
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],9:[function(require,module,exports){
module.exports = [
	// Listed in order of usage preference
	require('./localStorage'),
	require('./oldFF-globalStorage'),
	require('./oldIE-userDataStorage'),
	require('./cookieStorage'),
	require('./sessionStorage'),
	require('./memoryStorage')
]

},{"./cookieStorage":10,"./localStorage":11,"./memoryStorage":12,"./oldFF-globalStorage":13,"./oldIE-userDataStorage":14,"./sessionStorage":15}],10:[function(require,module,exports){
// cookieStorage is useful Safari private browser mode, where localStorage
// doesn't work but cookies do. This implementation is adopted from
// https://developer.mozilla.org/en-US/docs/Web/API/Storage/LocalStorage

var util = require('../src/util')
var Global = util.Global
var trim = util.trim

module.exports = {
	name: 'cookieStorage',
	read: read,
	write: write,
	each: each,
	remove: remove,
	clearAll: clearAll,
}

var doc = Global.document

function read(key) {
	if (!key || !_has(key)) { return null }
	var regexpStr = "(?:^|.*;\\s*)" +
		escape(key).replace(/[\-\.\+\*]/g, "\\$&") +
		"\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"
	return unescape(doc.cookie.replace(new RegExp(regexpStr), "$1"))
}

function each(callback) {
	var cookies = doc.cookie.split(/; ?/g)
	for (var i = cookies.length - 1; i >= 0; i--) {
		if (!trim(cookies[i])) {
			continue
		}
		var kvp = cookies[i].split('=')
		var key = unescape(kvp[0])
		var val = unescape(kvp[1])
		callback(val, key)
	}
}

function write(key, data) {
	if(!key) { return }
	doc.cookie = escape(key) + "=" + escape(data) + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/"
}

function remove(key) {
	if (!key || !_has(key)) {
		return
	}
	doc.cookie = escape(key) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/"
}

function clearAll() {
	each(function(_, key) {
		remove(key)
	})
}

function _has(key) {
	return (new RegExp("(?:^|;\\s*)" + escape(key).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(doc.cookie)
}

},{"../src/util":8}],11:[function(require,module,exports){
var util = require('../src/util')
var Global = util.Global

module.exports = {
	name: 'localStorage',
	read: read,
	write: write,
	each: each,
	remove: remove,
	clearAll: clearAll,
}

function localStorage() {
	return Global.localStorage
}

function read(key) {
	return localStorage().getItem(key)
}

function write(key, data) {
	return localStorage().setItem(key, data)
}

function each(fn) {
	for (var i = localStorage().length - 1; i >= 0; i--) {
		var key = localStorage().key(i)
		fn(read(key), key)
	}
}

function remove(key) {
	return localStorage().removeItem(key)
}

function clearAll() {
	return localStorage().clear()
}

},{"../src/util":8}],12:[function(require,module,exports){
// memoryStorage is a useful last fallback to ensure that the store
// is functions (meaning store.get(), store.set(), etc will all function).
// However, stored values will not persist when the browser navigates to
// a new page or reloads the current page.

module.exports = {
	name: 'memoryStorage',
	read: read,
	write: write,
	each: each,
	remove: remove,
	clearAll: clearAll,
}

var memoryStorage = {}

function read(key) {
	return memoryStorage[key]
}

function write(key, data) {
	memoryStorage[key] = data
}

function each(callback) {
	for (var key in memoryStorage) {
		if (memoryStorage.hasOwnProperty(key)) {
			callback(memoryStorage[key], key)
		}
	}
}

function remove(key) {
	delete memoryStorage[key]
}

function clearAll(key) {
	memoryStorage = {}
}

},{}],13:[function(require,module,exports){
// oldFF-globalStorage provides storage for Firefox
// versions 6 and 7, where no localStorage, etc
// is available.

var util = require('../src/util')
var Global = util.Global

module.exports = {
	name: 'oldFF-globalStorage',
	read: read,
	write: write,
	each: each,
	remove: remove,
	clearAll: clearAll,
}

var globalStorage = Global.globalStorage

function read(key) {
	return globalStorage[key]
}

function write(key, data) {
	globalStorage[key] = data
}

function each(fn) {
	for (var i = globalStorage.length - 1; i >= 0; i--) {
		var key = globalStorage.key(i)
		fn(globalStorage[key], key)
	}
}

function remove(key) {
	return globalStorage.removeItem(key)
}

function clearAll() {
	each(function(key, _) {
		delete globalStorage[key]
	})
}

},{"../src/util":8}],14:[function(require,module,exports){
// oldIE-userDataStorage provides storage for Internet Explorer
// versions 6 and 7, where no localStorage, sessionStorage, etc
// is available.

var util = require('../src/util')
var Global = util.Global

module.exports = {
	name: 'oldIE-userDataStorage',
	write: write,
	read: read,
	each: each,
	remove: remove,
	clearAll: clearAll,
}

var storageName = 'storejs'
var doc = Global.document
var _withStorageEl = _makeIEStorageElFunction()
var disable = (Global.navigator ? Global.navigator.userAgent : '').match(/ (MSIE 8|MSIE 9|MSIE 10)\./) // MSIE 9.x, MSIE 10.x

function write(unfixedKey, data) {
	if (disable) { return }
	var fixedKey = fixKey(unfixedKey)
	_withStorageEl(function(storageEl) {
		storageEl.setAttribute(fixedKey, data)
		storageEl.save(storageName)
	})
}

function read(unfixedKey) {
	if (disable) { return }
	var fixedKey = fixKey(unfixedKey)
	var res = null
	_withStorageEl(function(storageEl) {
		res = storageEl.getAttribute(fixedKey)
	})
	return res
}

function each(callback) {
	_withStorageEl(function(storageEl) {
		var attributes = storageEl.XMLDocument.documentElement.attributes
		for (var i=attributes.length-1; i>=0; i--) {
			var attr = attributes[i]
			callback(storageEl.getAttribute(attr.name), attr.name)
		}
	})
}

function remove(unfixedKey) {
	var fixedKey = fixKey(unfixedKey)
	_withStorageEl(function(storageEl) {
		storageEl.removeAttribute(fixedKey)
		storageEl.save(storageName)
	})
}

function clearAll() {
	_withStorageEl(function(storageEl) {
		var attributes = storageEl.XMLDocument.documentElement.attributes
		storageEl.load(storageName)
		for (var i=attributes.length-1; i>=0; i--) {
			storageEl.removeAttribute(attributes[i].name)
		}
		storageEl.save(storageName)
	})
}

// Helpers
//////////

// In IE7, keys cannot start with a digit or contain certain chars.
// See https://github.com/marcuswestin/store.js/issues/40
// See https://github.com/marcuswestin/store.js/issues/83
var forbiddenCharsRegex = new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]", "g")
function fixKey(key) {
	return key.replace(/^\d/, '___$&').replace(forbiddenCharsRegex, '___')
}

function _makeIEStorageElFunction() {
	if (!doc || !doc.documentElement || !doc.documentElement.addBehavior) {
		return null
	}
	var scriptTag = 'script',
		storageOwner,
		storageContainer,
		storageEl

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
		/* global ActiveXObject */
		storageContainer = new ActiveXObject('htmlfile')
		storageContainer.open()
		storageContainer.write('<'+scriptTag+'>document.w=window</'+scriptTag+'><iframe src="/favicon.ico"></iframe>')
		storageContainer.close()
		storageOwner = storageContainer.w.frames[0].document
		storageEl = storageOwner.createElement('div')
	} catch(e) {
		// somehow ActiveXObject instantiation failed (perhaps some special
		// security settings or otherwse), fall back to per-path storage
		storageEl = doc.createElement('div')
		storageOwner = doc.body
	}

	return function(storeFunction) {
		var args = [].slice.call(arguments, 0)
		args.unshift(storageEl)
		// See http://msdn.microsoft.com/en-us/library/ms531081(v=VS.85).aspx
		// and http://msdn.microsoft.com/en-us/library/ms531424(v=VS.85).aspx
		storageOwner.appendChild(storageEl)
		storageEl.addBehavior('#default#userData')
		storageEl.load(storageName)
		storeFunction.apply(this, args)
		storageOwner.removeChild(storageEl)
		return
	}
}

},{"../src/util":8}],15:[function(require,module,exports){
var util = require('../src/util')
var Global = util.Global

module.exports = {
	name: 'sessionStorage',
	read: read,
	write: write,
	each: each,
	remove: remove,
	clearAll: clearAll
}

function sessionStorage() {
	return Global.sessionStorage
}

function read(key) {
	return sessionStorage().getItem(key)
}

function write(key, data) {
	return sessionStorage().setItem(key, data)
}

function each(fn) {
	for (var i = sessionStorage().length - 1; i >= 0; i--) {
		var key = sessionStorage().key(i)
		fn(read(key), key)
	}
}

function remove(key) {
	return sessionStorage().removeItem(key)
}

function clearAll() {
	return sessionStorage().clear()
}

},{"../src/util":8}],16:[function(require,module,exports){
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
        throw 'ga not defined. Please make sure your Universal analytics is set up correctly';
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


},{"./storage":19,"./utils":20}],17:[function(require,module,exports){
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
        throw 'an experiment name must be specified';
      }
      if (this.options.variants === null) {
        throw 'variants must be provided';
      }
      if (typeof this.options.trigger !== 'function') {
        throw 'trigger must be a function';
      }
      all_variants_have_weights = utils.validate_weights(this.options.variants);
      if (!all_variants_have_weights) {
        throw 'not all variants have weights';
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


},{"./adapters":16,"./options":18,"./utils":20}],18:[function(require,module,exports){
module.exports = {
  debug: false
};


},{}],19:[function(require,module,exports){
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


},{"store":4}],20:[function(require,module,exports){
var Utils, _, options, sha1, uuid;

_ = require('lodash.custom');

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


},{"./options":18,"crypto-js/sha1":2,"lodash.custom":21,"node-uuid":3}],21:[function(require,module,exports){
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

},{}]},{},[17])(17)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY3J5cHRvLWpzL2NvcmUuanMiLCJub2RlX21vZHVsZXMvY3J5cHRvLWpzL3NoYTEuanMiLCJub2RlX21vZHVsZXMvbm9kZS11dWlkL3V1aWQuanMiLCJub2RlX21vZHVsZXMvc3RvcmUvZGlzdC9zdG9yZS5sZWdhY3kuanMiLCJub2RlX21vZHVsZXMvc3RvcmUvcGx1Z2lucy9qc29uMi5qcyIsIm5vZGVfbW9kdWxlcy9zdG9yZS9wbHVnaW5zL2xpYi9qc29uMi5qcyIsIm5vZGVfbW9kdWxlcy9zdG9yZS9zcmMvc3RvcmUtZW5naW5lLmpzIiwibm9kZV9tb2R1bGVzL3N0b3JlL3NyYy91dGlsLmpzIiwibm9kZV9tb2R1bGVzL3N0b3JlL3N0b3JhZ2VzL2FsbC5qcyIsIm5vZGVfbW9kdWxlcy9zdG9yZS9zdG9yYWdlcy9jb29raWVTdG9yYWdlLmpzIiwibm9kZV9tb2R1bGVzL3N0b3JlL3N0b3JhZ2VzL2xvY2FsU3RvcmFnZS5qcyIsIm5vZGVfbW9kdWxlcy9zdG9yZS9zdG9yYWdlcy9tZW1vcnlTdG9yYWdlLmpzIiwibm9kZV9tb2R1bGVzL3N0b3JlL3N0b3JhZ2VzL29sZEZGLWdsb2JhbFN0b3JhZ2UuanMiLCJub2RlX21vZHVsZXMvc3RvcmUvc3RvcmFnZXMvb2xkSUUtdXNlckRhdGFTdG9yYWdlLmpzIiwibm9kZV9tb2R1bGVzL3N0b3JlL3N0b3JhZ2VzL3Nlc3Npb25TdG9yYWdlLmpzIiwic3JjL2FkYXB0ZXJzLmNvZmZlZSIsInNyYy9hbGVwaGJldC5jb2ZmZWUiLCJzcmMvb3B0aW9ucy5jb2ZmZWUiLCJzcmMvc3RvcmFnZS5jb2ZmZWUiLCJzcmMvdXRpbHMuY29mZmVlIiwidmVuZG9yL2xvZGFzaC5jdXN0b20ubWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdnZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUM3T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3RIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5VkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDalFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIjsoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYgKHR5cGVvZiBleHBvcnRzID09PSBcIm9iamVjdFwiKSB7XG5cdFx0Ly8gQ29tbW9uSlNcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdH1cblx0ZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcblx0XHQvLyBBTURcblx0XHRkZWZpbmUoW10sIGZhY3RvcnkpO1xuXHR9XG5cdGVsc2Uge1xuXHRcdC8vIEdsb2JhbCAoYnJvd3Nlcilcblx0XHRyb290LkNyeXB0b0pTID0gZmFjdG9yeSgpO1xuXHR9XG59KHRoaXMsIGZ1bmN0aW9uICgpIHtcblxuXHQvKipcblx0ICogQ3J5cHRvSlMgY29yZSBjb21wb25lbnRzLlxuXHQgKi9cblx0dmFyIENyeXB0b0pTID0gQ3J5cHRvSlMgfHwgKGZ1bmN0aW9uIChNYXRoLCB1bmRlZmluZWQpIHtcblx0ICAgIC8qXG5cdCAgICAgKiBMb2NhbCBwb2x5ZmlsIG9mIE9iamVjdC5jcmVhdGVcblx0ICAgICAqL1xuXHQgICAgdmFyIGNyZWF0ZSA9IE9iamVjdC5jcmVhdGUgfHwgKGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICBmdW5jdGlvbiBGKCkge307XG5cblx0ICAgICAgICByZXR1cm4gZnVuY3Rpb24gKG9iaikge1xuXHQgICAgICAgICAgICB2YXIgc3VidHlwZTtcblxuXHQgICAgICAgICAgICBGLnByb3RvdHlwZSA9IG9iajtcblxuXHQgICAgICAgICAgICBzdWJ0eXBlID0gbmV3IEYoKTtcblxuXHQgICAgICAgICAgICBGLnByb3RvdHlwZSA9IG51bGw7XG5cblx0ICAgICAgICAgICAgcmV0dXJuIHN1YnR5cGU7XG5cdCAgICAgICAgfTtcblx0ICAgIH0oKSlcblxuXHQgICAgLyoqXG5cdCAgICAgKiBDcnlwdG9KUyBuYW1lc3BhY2UuXG5cdCAgICAgKi9cblx0ICAgIHZhciBDID0ge307XG5cblx0ICAgIC8qKlxuXHQgICAgICogTGlicmFyeSBuYW1lc3BhY2UuXG5cdCAgICAgKi9cblx0ICAgIHZhciBDX2xpYiA9IEMubGliID0ge307XG5cblx0ICAgIC8qKlxuXHQgICAgICogQmFzZSBvYmplY3QgZm9yIHByb3RvdHlwYWwgaW5oZXJpdGFuY2UuXG5cdCAgICAgKi9cblx0ICAgIHZhciBCYXNlID0gQ19saWIuQmFzZSA9IChmdW5jdGlvbiAoKSB7XG5cblxuXHQgICAgICAgIHJldHVybiB7XG5cdCAgICAgICAgICAgIC8qKlxuXHQgICAgICAgICAgICAgKiBDcmVhdGVzIGEgbmV3IG9iamVjdCB0aGF0IGluaGVyaXRzIGZyb20gdGhpcyBvYmplY3QuXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvdmVycmlkZXMgUHJvcGVydGllcyB0byBjb3B5IGludG8gdGhlIG5ldyBvYmplY3QuXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqIEByZXR1cm4ge09iamVjdH0gVGhlIG5ldyBvYmplY3QuXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqIEBzdGF0aWNcblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogICAgIHZhciBNeVR5cGUgPSBDcnlwdG9KUy5saWIuQmFzZS5leHRlbmQoe1xuXHQgICAgICAgICAgICAgKiAgICAgICAgIGZpZWxkOiAndmFsdWUnLFxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiAgICAgICAgIG1ldGhvZDogZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICAgKiAgICAgICAgIH1cblx0ICAgICAgICAgICAgICogICAgIH0pO1xuXHQgICAgICAgICAgICAgKi9cblx0ICAgICAgICAgICAgZXh0ZW5kOiBmdW5jdGlvbiAob3ZlcnJpZGVzKSB7XG5cdCAgICAgICAgICAgICAgICAvLyBTcGF3blxuXHQgICAgICAgICAgICAgICAgdmFyIHN1YnR5cGUgPSBjcmVhdGUodGhpcyk7XG5cblx0ICAgICAgICAgICAgICAgIC8vIEF1Z21lbnRcblx0ICAgICAgICAgICAgICAgIGlmIChvdmVycmlkZXMpIHtcblx0ICAgICAgICAgICAgICAgICAgICBzdWJ0eXBlLm1peEluKG92ZXJyaWRlcyk7XG5cdCAgICAgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBkZWZhdWx0IGluaXRpYWxpemVyXG5cdCAgICAgICAgICAgICAgICBpZiAoIXN1YnR5cGUuaGFzT3duUHJvcGVydHkoJ2luaXQnKSB8fCB0aGlzLmluaXQgPT09IHN1YnR5cGUuaW5pdCkge1xuXHQgICAgICAgICAgICAgICAgICAgIHN1YnR5cGUuaW5pdCA9IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgc3VidHlwZS4kc3VwZXIuaW5pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHQgICAgICAgICAgICAgICAgICAgIH07XG5cdCAgICAgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgICAgIC8vIEluaXRpYWxpemVyJ3MgcHJvdG90eXBlIGlzIHRoZSBzdWJ0eXBlIG9iamVjdFxuXHQgICAgICAgICAgICAgICAgc3VidHlwZS5pbml0LnByb3RvdHlwZSA9IHN1YnR5cGU7XG5cblx0ICAgICAgICAgICAgICAgIC8vIFJlZmVyZW5jZSBzdXBlcnR5cGVcblx0ICAgICAgICAgICAgICAgIHN1YnR5cGUuJHN1cGVyID0gdGhpcztcblxuXHQgICAgICAgICAgICAgICAgcmV0dXJuIHN1YnR5cGU7XG5cdCAgICAgICAgICAgIH0sXG5cblx0ICAgICAgICAgICAgLyoqXG5cdCAgICAgICAgICAgICAqIEV4dGVuZHMgdGhpcyBvYmplY3QgYW5kIHJ1bnMgdGhlIGluaXQgbWV0aG9kLlxuXHQgICAgICAgICAgICAgKiBBcmd1bWVudHMgdG8gY3JlYXRlKCkgd2lsbCBiZSBwYXNzZWQgdG8gaW5pdCgpLlxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBuZXcgb2JqZWN0LlxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiBAc3RhdGljXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqICAgICB2YXIgaW5zdGFuY2UgPSBNeVR5cGUuY3JlYXRlKCk7XG5cdCAgICAgICAgICAgICAqL1xuXHQgICAgICAgICAgICBjcmVhdGU6IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgICAgIHZhciBpbnN0YW5jZSA9IHRoaXMuZXh0ZW5kKCk7XG5cdCAgICAgICAgICAgICAgICBpbnN0YW5jZS5pbml0LmFwcGx5KGluc3RhbmNlLCBhcmd1bWVudHMpO1xuXG5cdCAgICAgICAgICAgICAgICByZXR1cm4gaW5zdGFuY2U7XG5cdCAgICAgICAgICAgIH0sXG5cblx0ICAgICAgICAgICAgLyoqXG5cdCAgICAgICAgICAgICAqIEluaXRpYWxpemVzIGEgbmV3bHkgY3JlYXRlZCBvYmplY3QuXG5cdCAgICAgICAgICAgICAqIE92ZXJyaWRlIHRoaXMgbWV0aG9kIHRvIGFkZCBzb21lIGxvZ2ljIHdoZW4geW91ciBvYmplY3RzIGFyZSBjcmVhdGVkLlxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiAgICAgdmFyIE15VHlwZSA9IENyeXB0b0pTLmxpYi5CYXNlLmV4dGVuZCh7XG5cdCAgICAgICAgICAgICAqICAgICAgICAgaW5pdDogZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICAgKiAgICAgICAgICAgICAvLyAuLi5cblx0ICAgICAgICAgICAgICogICAgICAgICB9XG5cdCAgICAgICAgICAgICAqICAgICB9KTtcblx0ICAgICAgICAgICAgICovXG5cdCAgICAgICAgICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgfSxcblxuXHQgICAgICAgICAgICAvKipcblx0ICAgICAgICAgICAgICogQ29waWVzIHByb3BlcnRpZXMgaW50byB0aGlzIG9iamVjdC5cblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IHByb3BlcnRpZXMgVGhlIHByb3BlcnRpZXMgdG8gbWl4IGluLlxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiAgICAgTXlUeXBlLm1peEluKHtcblx0ICAgICAgICAgICAgICogICAgICAgICBmaWVsZDogJ3ZhbHVlJ1xuXHQgICAgICAgICAgICAgKiAgICAgfSk7XG5cdCAgICAgICAgICAgICAqL1xuXHQgICAgICAgICAgICBtaXhJbjogZnVuY3Rpb24gKHByb3BlcnRpZXMpIHtcblx0ICAgICAgICAgICAgICAgIGZvciAodmFyIHByb3BlcnR5TmFtZSBpbiBwcm9wZXJ0aWVzKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgaWYgKHByb3BlcnRpZXMuaGFzT3duUHJvcGVydHkocHJvcGVydHlOYW1lKSkge1xuXHQgICAgICAgICAgICAgICAgICAgICAgICB0aGlzW3Byb3BlcnR5TmFtZV0gPSBwcm9wZXJ0aWVzW3Byb3BlcnR5TmFtZV07XG5cdCAgICAgICAgICAgICAgICAgICAgfVxuXHQgICAgICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgICAgICAvLyBJRSB3b24ndCBjb3B5IHRvU3RyaW5nIHVzaW5nIHRoZSBsb29wIGFib3ZlXG5cdCAgICAgICAgICAgICAgICBpZiAocHJvcGVydGllcy5oYXNPd25Qcm9wZXJ0eSgndG9TdHJpbmcnKSkge1xuXHQgICAgICAgICAgICAgICAgICAgIHRoaXMudG9TdHJpbmcgPSBwcm9wZXJ0aWVzLnRvU3RyaW5nO1xuXHQgICAgICAgICAgICAgICAgfVxuXHQgICAgICAgICAgICB9LFxuXG5cdCAgICAgICAgICAgIC8qKlxuXHQgICAgICAgICAgICAgKiBDcmVhdGVzIGEgY29weSBvZiB0aGlzIG9iamVjdC5cblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogQHJldHVybiB7T2JqZWN0fSBUaGUgY2xvbmUuXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqICAgICB2YXIgY2xvbmUgPSBpbnN0YW5jZS5jbG9uZSgpO1xuXHQgICAgICAgICAgICAgKi9cblx0ICAgICAgICAgICAgY2xvbmU6IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmluaXQucHJvdG90eXBlLmV4dGVuZCh0aGlzKTtcblx0ICAgICAgICAgICAgfVxuXHQgICAgICAgIH07XG5cdCAgICB9KCkpO1xuXG5cdCAgICAvKipcblx0ICAgICAqIEFuIGFycmF5IG9mIDMyLWJpdCB3b3Jkcy5cblx0ICAgICAqXG5cdCAgICAgKiBAcHJvcGVydHkge0FycmF5fSB3b3JkcyBUaGUgYXJyYXkgb2YgMzItYml0IHdvcmRzLlxuXHQgICAgICogQHByb3BlcnR5IHtudW1iZXJ9IHNpZ0J5dGVzIFRoZSBudW1iZXIgb2Ygc2lnbmlmaWNhbnQgYnl0ZXMgaW4gdGhpcyB3b3JkIGFycmF5LlxuXHQgICAgICovXG5cdCAgICB2YXIgV29yZEFycmF5ID0gQ19saWIuV29yZEFycmF5ID0gQmFzZS5leHRlbmQoe1xuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIEluaXRpYWxpemVzIGEgbmV3bHkgY3JlYXRlZCB3b3JkIGFycmF5LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtBcnJheX0gd29yZHMgKE9wdGlvbmFsKSBBbiBhcnJheSBvZiAzMi1iaXQgd29yZHMuXG5cdCAgICAgICAgICogQHBhcmFtIHtudW1iZXJ9IHNpZ0J5dGVzIChPcHRpb25hbCkgVGhlIG51bWJlciBvZiBzaWduaWZpY2FudCBieXRlcyBpbiB0aGUgd29yZHMuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciB3b3JkQXJyYXkgPSBDcnlwdG9KUy5saWIuV29yZEFycmF5LmNyZWF0ZSgpO1xuXHQgICAgICAgICAqICAgICB2YXIgd29yZEFycmF5ID0gQ3J5cHRvSlMubGliLldvcmRBcnJheS5jcmVhdGUoWzB4MDAwMTAyMDMsIDB4MDQwNTA2MDddKTtcblx0ICAgICAgICAgKiAgICAgdmFyIHdvcmRBcnJheSA9IENyeXB0b0pTLmxpYi5Xb3JkQXJyYXkuY3JlYXRlKFsweDAwMDEwMjAzLCAweDA0MDUwNjA3XSwgNik7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgaW5pdDogZnVuY3Rpb24gKHdvcmRzLCBzaWdCeXRlcykge1xuXHQgICAgICAgICAgICB3b3JkcyA9IHRoaXMud29yZHMgPSB3b3JkcyB8fCBbXTtcblxuXHQgICAgICAgICAgICBpZiAoc2lnQnl0ZXMgIT0gdW5kZWZpbmVkKSB7XG5cdCAgICAgICAgICAgICAgICB0aGlzLnNpZ0J5dGVzID0gc2lnQnl0ZXM7XG5cdCAgICAgICAgICAgIH0gZWxzZSB7XG5cdCAgICAgICAgICAgICAgICB0aGlzLnNpZ0J5dGVzID0gd29yZHMubGVuZ3RoICogNDtcblx0ICAgICAgICAgICAgfVxuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBDb252ZXJ0cyB0aGlzIHdvcmQgYXJyYXkgdG8gYSBzdHJpbmcuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge0VuY29kZXJ9IGVuY29kZXIgKE9wdGlvbmFsKSBUaGUgZW5jb2Rpbmcgc3RyYXRlZ3kgdG8gdXNlLiBEZWZhdWx0OiBDcnlwdG9KUy5lbmMuSGV4XG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBzdHJpbmdpZmllZCB3b3JkIGFycmF5LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgc3RyaW5nID0gd29yZEFycmF5ICsgJyc7XG5cdCAgICAgICAgICogICAgIHZhciBzdHJpbmcgPSB3b3JkQXJyYXkudG9TdHJpbmcoKTtcblx0ICAgICAgICAgKiAgICAgdmFyIHN0cmluZyA9IHdvcmRBcnJheS50b1N0cmluZyhDcnlwdG9KUy5lbmMuVXRmOCk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgdG9TdHJpbmc6IGZ1bmN0aW9uIChlbmNvZGVyKSB7XG5cdCAgICAgICAgICAgIHJldHVybiAoZW5jb2RlciB8fCBIZXgpLnN0cmluZ2lmeSh0aGlzKTtcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogQ29uY2F0ZW5hdGVzIGEgd29yZCBhcnJheSB0byB0aGlzIHdvcmQgYXJyYXkuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge1dvcmRBcnJheX0gd29yZEFycmF5IFRoZSB3b3JkIGFycmF5IHRvIGFwcGVuZC5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge1dvcmRBcnJheX0gVGhpcyB3b3JkIGFycmF5LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB3b3JkQXJyYXkxLmNvbmNhdCh3b3JkQXJyYXkyKTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBjb25jYXQ6IGZ1bmN0aW9uICh3b3JkQXJyYXkpIHtcblx0ICAgICAgICAgICAgLy8gU2hvcnRjdXRzXG5cdCAgICAgICAgICAgIHZhciB0aGlzV29yZHMgPSB0aGlzLndvcmRzO1xuXHQgICAgICAgICAgICB2YXIgdGhhdFdvcmRzID0gd29yZEFycmF5LndvcmRzO1xuXHQgICAgICAgICAgICB2YXIgdGhpc1NpZ0J5dGVzID0gdGhpcy5zaWdCeXRlcztcblx0ICAgICAgICAgICAgdmFyIHRoYXRTaWdCeXRlcyA9IHdvcmRBcnJheS5zaWdCeXRlcztcblxuXHQgICAgICAgICAgICAvLyBDbGFtcCBleGNlc3MgYml0c1xuXHQgICAgICAgICAgICB0aGlzLmNsYW1wKCk7XG5cblx0ICAgICAgICAgICAgLy8gQ29uY2F0XG5cdCAgICAgICAgICAgIGlmICh0aGlzU2lnQnl0ZXMgJSA0KSB7XG5cdCAgICAgICAgICAgICAgICAvLyBDb3B5IG9uZSBieXRlIGF0IGEgdGltZVxuXHQgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGF0U2lnQnl0ZXM7IGkrKykge1xuXHQgICAgICAgICAgICAgICAgICAgIHZhciB0aGF0Qnl0ZSA9ICh0aGF0V29yZHNbaSA+Pj4gMl0gPj4+ICgyNCAtIChpICUgNCkgKiA4KSkgJiAweGZmO1xuXHQgICAgICAgICAgICAgICAgICAgIHRoaXNXb3Jkc1sodGhpc1NpZ0J5dGVzICsgaSkgPj4+IDJdIHw9IHRoYXRCeXRlIDw8ICgyNCAtICgodGhpc1NpZ0J5dGVzICsgaSkgJSA0KSAqIDgpO1xuXHQgICAgICAgICAgICAgICAgfVxuXHQgICAgICAgICAgICB9IGVsc2Uge1xuXHQgICAgICAgICAgICAgICAgLy8gQ29weSBvbmUgd29yZCBhdCBhIHRpbWVcblx0ICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhhdFNpZ0J5dGVzOyBpICs9IDQpIHtcblx0ICAgICAgICAgICAgICAgICAgICB0aGlzV29yZHNbKHRoaXNTaWdCeXRlcyArIGkpID4+PiAyXSA9IHRoYXRXb3Jkc1tpID4+PiAyXTtcblx0ICAgICAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgfVxuXHQgICAgICAgICAgICB0aGlzLnNpZ0J5dGVzICs9IHRoYXRTaWdCeXRlcztcblxuXHQgICAgICAgICAgICAvLyBDaGFpbmFibGVcblx0ICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIFJlbW92ZXMgaW5zaWduaWZpY2FudCBiaXRzLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB3b3JkQXJyYXkuY2xhbXAoKTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBjbGFtcDogZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICAvLyBTaG9ydGN1dHNcblx0ICAgICAgICAgICAgdmFyIHdvcmRzID0gdGhpcy53b3Jkcztcblx0ICAgICAgICAgICAgdmFyIHNpZ0J5dGVzID0gdGhpcy5zaWdCeXRlcztcblxuXHQgICAgICAgICAgICAvLyBDbGFtcFxuXHQgICAgICAgICAgICB3b3Jkc1tzaWdCeXRlcyA+Pj4gMl0gJj0gMHhmZmZmZmZmZiA8PCAoMzIgLSAoc2lnQnl0ZXMgJSA0KSAqIDgpO1xuXHQgICAgICAgICAgICB3b3Jkcy5sZW5ndGggPSBNYXRoLmNlaWwoc2lnQnl0ZXMgLyA0KTtcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogQ3JlYXRlcyBhIGNvcHkgb2YgdGhpcyB3b3JkIGFycmF5LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7V29yZEFycmF5fSBUaGUgY2xvbmUuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciBjbG9uZSA9IHdvcmRBcnJheS5jbG9uZSgpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIGNsb25lOiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgIHZhciBjbG9uZSA9IEJhc2UuY2xvbmUuY2FsbCh0aGlzKTtcblx0ICAgICAgICAgICAgY2xvbmUud29yZHMgPSB0aGlzLndvcmRzLnNsaWNlKDApO1xuXG5cdCAgICAgICAgICAgIHJldHVybiBjbG9uZTtcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogQ3JlYXRlcyBhIHdvcmQgYXJyYXkgZmlsbGVkIHdpdGggcmFuZG9tIGJ5dGVzLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtudW1iZXJ9IG5CeXRlcyBUaGUgbnVtYmVyIG9mIHJhbmRvbSBieXRlcyB0byBnZW5lcmF0ZS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge1dvcmRBcnJheX0gVGhlIHJhbmRvbSB3b3JkIGFycmF5LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHN0YXRpY1xuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgd29yZEFycmF5ID0gQ3J5cHRvSlMubGliLldvcmRBcnJheS5yYW5kb20oMTYpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIHJhbmRvbTogZnVuY3Rpb24gKG5CeXRlcykge1xuXHQgICAgICAgICAgICB2YXIgd29yZHMgPSBbXTtcblxuXHQgICAgICAgICAgICB2YXIgciA9IChmdW5jdGlvbiAobV93KSB7XG5cdCAgICAgICAgICAgICAgICB2YXIgbV93ID0gbV93O1xuXHQgICAgICAgICAgICAgICAgdmFyIG1feiA9IDB4M2FkZTY4YjE7XG5cdCAgICAgICAgICAgICAgICB2YXIgbWFzayA9IDB4ZmZmZmZmZmY7XG5cblx0ICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgbV96ID0gKDB4OTA2OSAqIChtX3ogJiAweEZGRkYpICsgKG1feiA+PiAweDEwKSkgJiBtYXNrO1xuXHQgICAgICAgICAgICAgICAgICAgIG1fdyA9ICgweDQ2NTAgKiAobV93ICYgMHhGRkZGKSArIChtX3cgPj4gMHgxMCkpICYgbWFzaztcblx0ICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gKChtX3ogPDwgMHgxMCkgKyBtX3cpICYgbWFzaztcblx0ICAgICAgICAgICAgICAgICAgICByZXN1bHQgLz0gMHgxMDAwMDAwMDA7XG5cdCAgICAgICAgICAgICAgICAgICAgcmVzdWx0ICs9IDAuNTtcblx0ICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0ICogKE1hdGgucmFuZG9tKCkgPiAuNSA/IDEgOiAtMSk7XG5cdCAgICAgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgIH0pO1xuXG5cdCAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCByY2FjaGU7IGkgPCBuQnl0ZXM7IGkgKz0gNCkge1xuXHQgICAgICAgICAgICAgICAgdmFyIF9yID0gcigocmNhY2hlIHx8IE1hdGgucmFuZG9tKCkpICogMHgxMDAwMDAwMDApO1xuXG5cdCAgICAgICAgICAgICAgICByY2FjaGUgPSBfcigpICogMHgzYWRlNjdiNztcblx0ICAgICAgICAgICAgICAgIHdvcmRzLnB1c2goKF9yKCkgKiAweDEwMDAwMDAwMCkgfCAwKTtcblx0ICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgIHJldHVybiBuZXcgV29yZEFycmF5LmluaXQod29yZHMsIG5CeXRlcyk7XG5cdCAgICAgICAgfVxuXHQgICAgfSk7XG5cblx0ICAgIC8qKlxuXHQgICAgICogRW5jb2RlciBuYW1lc3BhY2UuXG5cdCAgICAgKi9cblx0ICAgIHZhciBDX2VuYyA9IEMuZW5jID0ge307XG5cblx0ICAgIC8qKlxuXHQgICAgICogSGV4IGVuY29kaW5nIHN0cmF0ZWd5LlxuXHQgICAgICovXG5cdCAgICB2YXIgSGV4ID0gQ19lbmMuSGV4ID0ge1xuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIENvbnZlcnRzIGEgd29yZCBhcnJheSB0byBhIGhleCBzdHJpbmcuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge1dvcmRBcnJheX0gd29yZEFycmF5IFRoZSB3b3JkIGFycmF5LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7c3RyaW5nfSBUaGUgaGV4IHN0cmluZy5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBzdGF0aWNcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIGhleFN0cmluZyA9IENyeXB0b0pTLmVuYy5IZXguc3RyaW5naWZ5KHdvcmRBcnJheSk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgc3RyaW5naWZ5OiBmdW5jdGlvbiAod29yZEFycmF5KSB7XG5cdCAgICAgICAgICAgIC8vIFNob3J0Y3V0c1xuXHQgICAgICAgICAgICB2YXIgd29yZHMgPSB3b3JkQXJyYXkud29yZHM7XG5cdCAgICAgICAgICAgIHZhciBzaWdCeXRlcyA9IHdvcmRBcnJheS5zaWdCeXRlcztcblxuXHQgICAgICAgICAgICAvLyBDb252ZXJ0XG5cdCAgICAgICAgICAgIHZhciBoZXhDaGFycyA9IFtdO1xuXHQgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNpZ0J5dGVzOyBpKyspIHtcblx0ICAgICAgICAgICAgICAgIHZhciBiaXRlID0gKHdvcmRzW2kgPj4+IDJdID4+PiAoMjQgLSAoaSAlIDQpICogOCkpICYgMHhmZjtcblx0ICAgICAgICAgICAgICAgIGhleENoYXJzLnB1c2goKGJpdGUgPj4+IDQpLnRvU3RyaW5nKDE2KSk7XG5cdCAgICAgICAgICAgICAgICBoZXhDaGFycy5wdXNoKChiaXRlICYgMHgwZikudG9TdHJpbmcoMTYpKTtcblx0ICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgIHJldHVybiBoZXhDaGFycy5qb2luKCcnKTtcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogQ29udmVydHMgYSBoZXggc3RyaW5nIHRvIGEgd29yZCBhcnJheS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBoZXhTdHIgVGhlIGhleCBzdHJpbmcuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtXb3JkQXJyYXl9IFRoZSB3b3JkIGFycmF5LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHN0YXRpY1xuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgd29yZEFycmF5ID0gQ3J5cHRvSlMuZW5jLkhleC5wYXJzZShoZXhTdHJpbmcpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIHBhcnNlOiBmdW5jdGlvbiAoaGV4U3RyKSB7XG5cdCAgICAgICAgICAgIC8vIFNob3J0Y3V0XG5cdCAgICAgICAgICAgIHZhciBoZXhTdHJMZW5ndGggPSBoZXhTdHIubGVuZ3RoO1xuXG5cdCAgICAgICAgICAgIC8vIENvbnZlcnRcblx0ICAgICAgICAgICAgdmFyIHdvcmRzID0gW107XG5cdCAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaGV4U3RyTGVuZ3RoOyBpICs9IDIpIHtcblx0ICAgICAgICAgICAgICAgIHdvcmRzW2kgPj4+IDNdIHw9IHBhcnNlSW50KGhleFN0ci5zdWJzdHIoaSwgMiksIDE2KSA8PCAoMjQgLSAoaSAlIDgpICogNCk7XG5cdCAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICByZXR1cm4gbmV3IFdvcmRBcnJheS5pbml0KHdvcmRzLCBoZXhTdHJMZW5ndGggLyAyKTtcblx0ICAgICAgICB9XG5cdCAgICB9O1xuXG5cdCAgICAvKipcblx0ICAgICAqIExhdGluMSBlbmNvZGluZyBzdHJhdGVneS5cblx0ICAgICAqL1xuXHQgICAgdmFyIExhdGluMSA9IENfZW5jLkxhdGluMSA9IHtcblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBDb252ZXJ0cyBhIHdvcmQgYXJyYXkgdG8gYSBMYXRpbjEgc3RyaW5nLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtXb3JkQXJyYXl9IHdvcmRBcnJheSBUaGUgd29yZCBhcnJheS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge3N0cmluZ30gVGhlIExhdGluMSBzdHJpbmcuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAc3RhdGljXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciBsYXRpbjFTdHJpbmcgPSBDcnlwdG9KUy5lbmMuTGF0aW4xLnN0cmluZ2lmeSh3b3JkQXJyYXkpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIHN0cmluZ2lmeTogZnVuY3Rpb24gKHdvcmRBcnJheSkge1xuXHQgICAgICAgICAgICAvLyBTaG9ydGN1dHNcblx0ICAgICAgICAgICAgdmFyIHdvcmRzID0gd29yZEFycmF5LndvcmRzO1xuXHQgICAgICAgICAgICB2YXIgc2lnQnl0ZXMgPSB3b3JkQXJyYXkuc2lnQnl0ZXM7XG5cblx0ICAgICAgICAgICAgLy8gQ29udmVydFxuXHQgICAgICAgICAgICB2YXIgbGF0aW4xQ2hhcnMgPSBbXTtcblx0ICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzaWdCeXRlczsgaSsrKSB7XG5cdCAgICAgICAgICAgICAgICB2YXIgYml0ZSA9ICh3b3Jkc1tpID4+PiAyXSA+Pj4gKDI0IC0gKGkgJSA0KSAqIDgpKSAmIDB4ZmY7XG5cdCAgICAgICAgICAgICAgICBsYXRpbjFDaGFycy5wdXNoKFN0cmluZy5mcm9tQ2hhckNvZGUoYml0ZSkpO1xuXHQgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgcmV0dXJuIGxhdGluMUNoYXJzLmpvaW4oJycpO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBDb252ZXJ0cyBhIExhdGluMSBzdHJpbmcgdG8gYSB3b3JkIGFycmF5LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGxhdGluMVN0ciBUaGUgTGF0aW4xIHN0cmluZy5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge1dvcmRBcnJheX0gVGhlIHdvcmQgYXJyYXkuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAc3RhdGljXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciB3b3JkQXJyYXkgPSBDcnlwdG9KUy5lbmMuTGF0aW4xLnBhcnNlKGxhdGluMVN0cmluZyk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgcGFyc2U6IGZ1bmN0aW9uIChsYXRpbjFTdHIpIHtcblx0ICAgICAgICAgICAgLy8gU2hvcnRjdXRcblx0ICAgICAgICAgICAgdmFyIGxhdGluMVN0ckxlbmd0aCA9IGxhdGluMVN0ci5sZW5ndGg7XG5cblx0ICAgICAgICAgICAgLy8gQ29udmVydFxuXHQgICAgICAgICAgICB2YXIgd29yZHMgPSBbXTtcblx0ICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsYXRpbjFTdHJMZW5ndGg7IGkrKykge1xuXHQgICAgICAgICAgICAgICAgd29yZHNbaSA+Pj4gMl0gfD0gKGxhdGluMVN0ci5jaGFyQ29kZUF0KGkpICYgMHhmZikgPDwgKDI0IC0gKGkgJSA0KSAqIDgpO1xuXHQgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgcmV0dXJuIG5ldyBXb3JkQXJyYXkuaW5pdCh3b3JkcywgbGF0aW4xU3RyTGVuZ3RoKTtcblx0ICAgICAgICB9XG5cdCAgICB9O1xuXG5cdCAgICAvKipcblx0ICAgICAqIFVURi04IGVuY29kaW5nIHN0cmF0ZWd5LlxuXHQgICAgICovXG5cdCAgICB2YXIgVXRmOCA9IENfZW5jLlV0ZjggPSB7XG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogQ29udmVydHMgYSB3b3JkIGFycmF5IHRvIGEgVVRGLTggc3RyaW5nLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtXb3JkQXJyYXl9IHdvcmRBcnJheSBUaGUgd29yZCBhcnJheS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge3N0cmluZ30gVGhlIFVURi04IHN0cmluZy5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBzdGF0aWNcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIHV0ZjhTdHJpbmcgPSBDcnlwdG9KUy5lbmMuVXRmOC5zdHJpbmdpZnkod29yZEFycmF5KTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBzdHJpbmdpZnk6IGZ1bmN0aW9uICh3b3JkQXJyYXkpIHtcblx0ICAgICAgICAgICAgdHJ5IHtcblx0ICAgICAgICAgICAgICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoZXNjYXBlKExhdGluMS5zdHJpbmdpZnkod29yZEFycmF5KSkpO1xuXHQgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG5cdCAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ01hbGZvcm1lZCBVVEYtOCBkYXRhJyk7XG5cdCAgICAgICAgICAgIH1cblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogQ29udmVydHMgYSBVVEYtOCBzdHJpbmcgdG8gYSB3b3JkIGFycmF5LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHV0ZjhTdHIgVGhlIFVURi04IHN0cmluZy5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge1dvcmRBcnJheX0gVGhlIHdvcmQgYXJyYXkuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAc3RhdGljXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciB3b3JkQXJyYXkgPSBDcnlwdG9KUy5lbmMuVXRmOC5wYXJzZSh1dGY4U3RyaW5nKTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBwYXJzZTogZnVuY3Rpb24gKHV0ZjhTdHIpIHtcblx0ICAgICAgICAgICAgcmV0dXJuIExhdGluMS5wYXJzZSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQodXRmOFN0cikpKTtcblx0ICAgICAgICB9XG5cdCAgICB9O1xuXG5cdCAgICAvKipcblx0ICAgICAqIEFic3RyYWN0IGJ1ZmZlcmVkIGJsb2NrIGFsZ29yaXRobSB0ZW1wbGF0ZS5cblx0ICAgICAqXG5cdCAgICAgKiBUaGUgcHJvcGVydHkgYmxvY2tTaXplIG11c3QgYmUgaW1wbGVtZW50ZWQgaW4gYSBjb25jcmV0ZSBzdWJ0eXBlLlxuXHQgICAgICpcblx0ICAgICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBfbWluQnVmZmVyU2l6ZSBUaGUgbnVtYmVyIG9mIGJsb2NrcyB0aGF0IHNob3VsZCBiZSBrZXB0IHVucHJvY2Vzc2VkIGluIHRoZSBidWZmZXIuIERlZmF1bHQ6IDBcblx0ICAgICAqL1xuXHQgICAgdmFyIEJ1ZmZlcmVkQmxvY2tBbGdvcml0aG0gPSBDX2xpYi5CdWZmZXJlZEJsb2NrQWxnb3JpdGhtID0gQmFzZS5leHRlbmQoe1xuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIFJlc2V0cyB0aGlzIGJsb2NrIGFsZ29yaXRobSdzIGRhdGEgYnVmZmVyIHRvIGl0cyBpbml0aWFsIHN0YXRlLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICBidWZmZXJlZEJsb2NrQWxnb3JpdGhtLnJlc2V0KCk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgcmVzZXQ6IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgLy8gSW5pdGlhbCB2YWx1ZXNcblx0ICAgICAgICAgICAgdGhpcy5fZGF0YSA9IG5ldyBXb3JkQXJyYXkuaW5pdCgpO1xuXHQgICAgICAgICAgICB0aGlzLl9uRGF0YUJ5dGVzID0gMDtcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogQWRkcyBuZXcgZGF0YSB0byB0aGlzIGJsb2NrIGFsZ29yaXRobSdzIGJ1ZmZlci5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7V29yZEFycmF5fHN0cmluZ30gZGF0YSBUaGUgZGF0YSB0byBhcHBlbmQuIFN0cmluZ3MgYXJlIGNvbnZlcnRlZCB0byBhIFdvcmRBcnJheSB1c2luZyBVVEYtOC5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgYnVmZmVyZWRCbG9ja0FsZ29yaXRobS5fYXBwZW5kKCdkYXRhJyk7XG5cdCAgICAgICAgICogICAgIGJ1ZmZlcmVkQmxvY2tBbGdvcml0aG0uX2FwcGVuZCh3b3JkQXJyYXkpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIF9hcHBlbmQ6IGZ1bmN0aW9uIChkYXRhKSB7XG5cdCAgICAgICAgICAgIC8vIENvbnZlcnQgc3RyaW5nIHRvIFdvcmRBcnJheSwgZWxzZSBhc3N1bWUgV29yZEFycmF5IGFscmVhZHlcblx0ICAgICAgICAgICAgaWYgKHR5cGVvZiBkYXRhID09ICdzdHJpbmcnKSB7XG5cdCAgICAgICAgICAgICAgICBkYXRhID0gVXRmOC5wYXJzZShkYXRhKTtcblx0ICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgIC8vIEFwcGVuZFxuXHQgICAgICAgICAgICB0aGlzLl9kYXRhLmNvbmNhdChkYXRhKTtcblx0ICAgICAgICAgICAgdGhpcy5fbkRhdGFCeXRlcyArPSBkYXRhLnNpZ0J5dGVzO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBQcm9jZXNzZXMgYXZhaWxhYmxlIGRhdGEgYmxvY2tzLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogVGhpcyBtZXRob2QgaW52b2tlcyBfZG9Qcm9jZXNzQmxvY2sob2Zmc2V0KSwgd2hpY2ggbXVzdCBiZSBpbXBsZW1lbnRlZCBieSBhIGNvbmNyZXRlIHN1YnR5cGUuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGRvRmx1c2ggV2hldGhlciBhbGwgYmxvY2tzIGFuZCBwYXJ0aWFsIGJsb2NrcyBzaG91bGQgYmUgcHJvY2Vzc2VkLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7V29yZEFycmF5fSBUaGUgcHJvY2Vzc2VkIGRhdGEuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciBwcm9jZXNzZWREYXRhID0gYnVmZmVyZWRCbG9ja0FsZ29yaXRobS5fcHJvY2VzcygpO1xuXHQgICAgICAgICAqICAgICB2YXIgcHJvY2Vzc2VkRGF0YSA9IGJ1ZmZlcmVkQmxvY2tBbGdvcml0aG0uX3Byb2Nlc3MoISEnZmx1c2gnKTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBfcHJvY2VzczogZnVuY3Rpb24gKGRvRmx1c2gpIHtcblx0ICAgICAgICAgICAgLy8gU2hvcnRjdXRzXG5cdCAgICAgICAgICAgIHZhciBkYXRhID0gdGhpcy5fZGF0YTtcblx0ICAgICAgICAgICAgdmFyIGRhdGFXb3JkcyA9IGRhdGEud29yZHM7XG5cdCAgICAgICAgICAgIHZhciBkYXRhU2lnQnl0ZXMgPSBkYXRhLnNpZ0J5dGVzO1xuXHQgICAgICAgICAgICB2YXIgYmxvY2tTaXplID0gdGhpcy5ibG9ja1NpemU7XG5cdCAgICAgICAgICAgIHZhciBibG9ja1NpemVCeXRlcyA9IGJsb2NrU2l6ZSAqIDQ7XG5cblx0ICAgICAgICAgICAgLy8gQ291bnQgYmxvY2tzIHJlYWR5XG5cdCAgICAgICAgICAgIHZhciBuQmxvY2tzUmVhZHkgPSBkYXRhU2lnQnl0ZXMgLyBibG9ja1NpemVCeXRlcztcblx0ICAgICAgICAgICAgaWYgKGRvRmx1c2gpIHtcblx0ICAgICAgICAgICAgICAgIC8vIFJvdW5kIHVwIHRvIGluY2x1ZGUgcGFydGlhbCBibG9ja3Ncblx0ICAgICAgICAgICAgICAgIG5CbG9ja3NSZWFkeSA9IE1hdGguY2VpbChuQmxvY2tzUmVhZHkpO1xuXHQgICAgICAgICAgICB9IGVsc2Uge1xuXHQgICAgICAgICAgICAgICAgLy8gUm91bmQgZG93biB0byBpbmNsdWRlIG9ubHkgZnVsbCBibG9ja3MsXG5cdCAgICAgICAgICAgICAgICAvLyBsZXNzIHRoZSBudW1iZXIgb2YgYmxvY2tzIHRoYXQgbXVzdCByZW1haW4gaW4gdGhlIGJ1ZmZlclxuXHQgICAgICAgICAgICAgICAgbkJsb2Nrc1JlYWR5ID0gTWF0aC5tYXgoKG5CbG9ja3NSZWFkeSB8IDApIC0gdGhpcy5fbWluQnVmZmVyU2l6ZSwgMCk7XG5cdCAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICAvLyBDb3VudCB3b3JkcyByZWFkeVxuXHQgICAgICAgICAgICB2YXIgbldvcmRzUmVhZHkgPSBuQmxvY2tzUmVhZHkgKiBibG9ja1NpemU7XG5cblx0ICAgICAgICAgICAgLy8gQ291bnQgYnl0ZXMgcmVhZHlcblx0ICAgICAgICAgICAgdmFyIG5CeXRlc1JlYWR5ID0gTWF0aC5taW4obldvcmRzUmVhZHkgKiA0LCBkYXRhU2lnQnl0ZXMpO1xuXG5cdCAgICAgICAgICAgIC8vIFByb2Nlc3MgYmxvY2tzXG5cdCAgICAgICAgICAgIGlmIChuV29yZHNSZWFkeSkge1xuXHQgICAgICAgICAgICAgICAgZm9yICh2YXIgb2Zmc2V0ID0gMDsgb2Zmc2V0IDwgbldvcmRzUmVhZHk7IG9mZnNldCArPSBibG9ja1NpemUpIHtcblx0ICAgICAgICAgICAgICAgICAgICAvLyBQZXJmb3JtIGNvbmNyZXRlLWFsZ29yaXRobSBsb2dpY1xuXHQgICAgICAgICAgICAgICAgICAgIHRoaXMuX2RvUHJvY2Vzc0Jsb2NrKGRhdGFXb3Jkcywgb2Zmc2V0KTtcblx0ICAgICAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICAgICAgLy8gUmVtb3ZlIHByb2Nlc3NlZCB3b3Jkc1xuXHQgICAgICAgICAgICAgICAgdmFyIHByb2Nlc3NlZFdvcmRzID0gZGF0YVdvcmRzLnNwbGljZSgwLCBuV29yZHNSZWFkeSk7XG5cdCAgICAgICAgICAgICAgICBkYXRhLnNpZ0J5dGVzIC09IG5CeXRlc1JlYWR5O1xuXHQgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgLy8gUmV0dXJuIHByb2Nlc3NlZCB3b3Jkc1xuXHQgICAgICAgICAgICByZXR1cm4gbmV3IFdvcmRBcnJheS5pbml0KHByb2Nlc3NlZFdvcmRzLCBuQnl0ZXNSZWFkeSk7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIENyZWF0ZXMgYSBjb3B5IG9mIHRoaXMgb2JqZWN0LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7T2JqZWN0fSBUaGUgY2xvbmUuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciBjbG9uZSA9IGJ1ZmZlcmVkQmxvY2tBbGdvcml0aG0uY2xvbmUoKTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBjbG9uZTogZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICB2YXIgY2xvbmUgPSBCYXNlLmNsb25lLmNhbGwodGhpcyk7XG5cdCAgICAgICAgICAgIGNsb25lLl9kYXRhID0gdGhpcy5fZGF0YS5jbG9uZSgpO1xuXG5cdCAgICAgICAgICAgIHJldHVybiBjbG9uZTtcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgX21pbkJ1ZmZlclNpemU6IDBcblx0ICAgIH0pO1xuXG5cdCAgICAvKipcblx0ICAgICAqIEFic3RyYWN0IGhhc2hlciB0ZW1wbGF0ZS5cblx0ICAgICAqXG5cdCAgICAgKiBAcHJvcGVydHkge251bWJlcn0gYmxvY2tTaXplIFRoZSBudW1iZXIgb2YgMzItYml0IHdvcmRzIHRoaXMgaGFzaGVyIG9wZXJhdGVzIG9uLiBEZWZhdWx0OiAxNiAoNTEyIGJpdHMpXG5cdCAgICAgKi9cblx0ICAgIHZhciBIYXNoZXIgPSBDX2xpYi5IYXNoZXIgPSBCdWZmZXJlZEJsb2NrQWxnb3JpdGhtLmV4dGVuZCh7XG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogQ29uZmlndXJhdGlvbiBvcHRpb25zLlxuXHQgICAgICAgICAqL1xuXHQgICAgICAgIGNmZzogQmFzZS5leHRlbmQoKSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIEluaXRpYWxpemVzIGEgbmV3bHkgY3JlYXRlZCBoYXNoZXIuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gY2ZnIChPcHRpb25hbCkgVGhlIGNvbmZpZ3VyYXRpb24gb3B0aW9ucyB0byB1c2UgZm9yIHRoaXMgaGFzaCBjb21wdXRhdGlvbi5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIGhhc2hlciA9IENyeXB0b0pTLmFsZ28uU0hBMjU2LmNyZWF0ZSgpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIGluaXQ6IGZ1bmN0aW9uIChjZmcpIHtcblx0ICAgICAgICAgICAgLy8gQXBwbHkgY29uZmlnIGRlZmF1bHRzXG5cdCAgICAgICAgICAgIHRoaXMuY2ZnID0gdGhpcy5jZmcuZXh0ZW5kKGNmZyk7XG5cblx0ICAgICAgICAgICAgLy8gU2V0IGluaXRpYWwgdmFsdWVzXG5cdCAgICAgICAgICAgIHRoaXMucmVzZXQoKTtcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogUmVzZXRzIHRoaXMgaGFzaGVyIHRvIGl0cyBpbml0aWFsIHN0YXRlLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICBoYXNoZXIucmVzZXQoKTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICByZXNldDogZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICAvLyBSZXNldCBkYXRhIGJ1ZmZlclxuXHQgICAgICAgICAgICBCdWZmZXJlZEJsb2NrQWxnb3JpdGhtLnJlc2V0LmNhbGwodGhpcyk7XG5cblx0ICAgICAgICAgICAgLy8gUGVyZm9ybSBjb25jcmV0ZS1oYXNoZXIgbG9naWNcblx0ICAgICAgICAgICAgdGhpcy5fZG9SZXNldCgpO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBVcGRhdGVzIHRoaXMgaGFzaGVyIHdpdGggYSBtZXNzYWdlLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtXb3JkQXJyYXl8c3RyaW5nfSBtZXNzYWdlVXBkYXRlIFRoZSBtZXNzYWdlIHRvIGFwcGVuZC5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge0hhc2hlcn0gVGhpcyBoYXNoZXIuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIGhhc2hlci51cGRhdGUoJ21lc3NhZ2UnKTtcblx0ICAgICAgICAgKiAgICAgaGFzaGVyLnVwZGF0ZSh3b3JkQXJyYXkpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIHVwZGF0ZTogZnVuY3Rpb24gKG1lc3NhZ2VVcGRhdGUpIHtcblx0ICAgICAgICAgICAgLy8gQXBwZW5kXG5cdCAgICAgICAgICAgIHRoaXMuX2FwcGVuZChtZXNzYWdlVXBkYXRlKTtcblxuXHQgICAgICAgICAgICAvLyBVcGRhdGUgdGhlIGhhc2hcblx0ICAgICAgICAgICAgdGhpcy5fcHJvY2VzcygpO1xuXG5cdCAgICAgICAgICAgIC8vIENoYWluYWJsZVxuXHQgICAgICAgICAgICByZXR1cm4gdGhpcztcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogRmluYWxpemVzIHRoZSBoYXNoIGNvbXB1dGF0aW9uLlxuXHQgICAgICAgICAqIE5vdGUgdGhhdCB0aGUgZmluYWxpemUgb3BlcmF0aW9uIGlzIGVmZmVjdGl2ZWx5IGEgZGVzdHJ1Y3RpdmUsIHJlYWQtb25jZSBvcGVyYXRpb24uXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge1dvcmRBcnJheXxzdHJpbmd9IG1lc3NhZ2VVcGRhdGUgKE9wdGlvbmFsKSBBIGZpbmFsIG1lc3NhZ2UgdXBkYXRlLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7V29yZEFycmF5fSBUaGUgaGFzaC5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIGhhc2ggPSBoYXNoZXIuZmluYWxpemUoKTtcblx0ICAgICAgICAgKiAgICAgdmFyIGhhc2ggPSBoYXNoZXIuZmluYWxpemUoJ21lc3NhZ2UnKTtcblx0ICAgICAgICAgKiAgICAgdmFyIGhhc2ggPSBoYXNoZXIuZmluYWxpemUod29yZEFycmF5KTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBmaW5hbGl6ZTogZnVuY3Rpb24gKG1lc3NhZ2VVcGRhdGUpIHtcblx0ICAgICAgICAgICAgLy8gRmluYWwgbWVzc2FnZSB1cGRhdGVcblx0ICAgICAgICAgICAgaWYgKG1lc3NhZ2VVcGRhdGUpIHtcblx0ICAgICAgICAgICAgICAgIHRoaXMuX2FwcGVuZChtZXNzYWdlVXBkYXRlKTtcblx0ICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgIC8vIFBlcmZvcm0gY29uY3JldGUtaGFzaGVyIGxvZ2ljXG5cdCAgICAgICAgICAgIHZhciBoYXNoID0gdGhpcy5fZG9GaW5hbGl6ZSgpO1xuXG5cdCAgICAgICAgICAgIHJldHVybiBoYXNoO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICBibG9ja1NpemU6IDUxMi8zMixcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIENyZWF0ZXMgYSBzaG9ydGN1dCBmdW5jdGlvbiB0byBhIGhhc2hlcidzIG9iamVjdCBpbnRlcmZhY2UuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge0hhc2hlcn0gaGFzaGVyIFRoZSBoYXNoZXIgdG8gY3JlYXRlIGEgaGVscGVyIGZvci5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge0Z1bmN0aW9ufSBUaGUgc2hvcnRjdXQgZnVuY3Rpb24uXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAc3RhdGljXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciBTSEEyNTYgPSBDcnlwdG9KUy5saWIuSGFzaGVyLl9jcmVhdGVIZWxwZXIoQ3J5cHRvSlMuYWxnby5TSEEyNTYpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIF9jcmVhdGVIZWxwZXI6IGZ1bmN0aW9uIChoYXNoZXIpIHtcblx0ICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChtZXNzYWdlLCBjZmcpIHtcblx0ICAgICAgICAgICAgICAgIHJldHVybiBuZXcgaGFzaGVyLmluaXQoY2ZnKS5maW5hbGl6ZShtZXNzYWdlKTtcblx0ICAgICAgICAgICAgfTtcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogQ3JlYXRlcyBhIHNob3J0Y3V0IGZ1bmN0aW9uIHRvIHRoZSBITUFDJ3Mgb2JqZWN0IGludGVyZmFjZS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7SGFzaGVyfSBoYXNoZXIgVGhlIGhhc2hlciB0byB1c2UgaW4gdGhpcyBITUFDIGhlbHBlci5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge0Z1bmN0aW9ufSBUaGUgc2hvcnRjdXQgZnVuY3Rpb24uXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAc3RhdGljXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciBIbWFjU0hBMjU2ID0gQ3J5cHRvSlMubGliLkhhc2hlci5fY3JlYXRlSG1hY0hlbHBlcihDcnlwdG9KUy5hbGdvLlNIQTI1Nik7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgX2NyZWF0ZUhtYWNIZWxwZXI6IGZ1bmN0aW9uIChoYXNoZXIpIHtcblx0ICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChtZXNzYWdlLCBrZXkpIHtcblx0ICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQ19hbGdvLkhNQUMuaW5pdChoYXNoZXIsIGtleSkuZmluYWxpemUobWVzc2FnZSk7XG5cdCAgICAgICAgICAgIH07XG5cdCAgICAgICAgfVxuXHQgICAgfSk7XG5cblx0ICAgIC8qKlxuXHQgICAgICogQWxnb3JpdGhtIG5hbWVzcGFjZS5cblx0ICAgICAqL1xuXHQgICAgdmFyIENfYWxnbyA9IEMuYWxnbyA9IHt9O1xuXG5cdCAgICByZXR1cm4gQztcblx0fShNYXRoKSk7XG5cblxuXHRyZXR1cm4gQ3J5cHRvSlM7XG5cbn0pKTsiLCI7KGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG5cdGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xuXHRcdC8vIENvbW1vbkpTXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gZmFjdG9yeShyZXF1aXJlKFwiLi9jb3JlXCIpKTtcblx0fVxuXHRlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuXHRcdC8vIEFNRFxuXHRcdGRlZmluZShbXCIuL2NvcmVcIl0sIGZhY3RvcnkpO1xuXHR9XG5cdGVsc2Uge1xuXHRcdC8vIEdsb2JhbCAoYnJvd3Nlcilcblx0XHRmYWN0b3J5KHJvb3QuQ3J5cHRvSlMpO1xuXHR9XG59KHRoaXMsIGZ1bmN0aW9uIChDcnlwdG9KUykge1xuXG5cdChmdW5jdGlvbiAoKSB7XG5cdCAgICAvLyBTaG9ydGN1dHNcblx0ICAgIHZhciBDID0gQ3J5cHRvSlM7XG5cdCAgICB2YXIgQ19saWIgPSBDLmxpYjtcblx0ICAgIHZhciBXb3JkQXJyYXkgPSBDX2xpYi5Xb3JkQXJyYXk7XG5cdCAgICB2YXIgSGFzaGVyID0gQ19saWIuSGFzaGVyO1xuXHQgICAgdmFyIENfYWxnbyA9IEMuYWxnbztcblxuXHQgICAgLy8gUmV1c2FibGUgb2JqZWN0XG5cdCAgICB2YXIgVyA9IFtdO1xuXG5cdCAgICAvKipcblx0ICAgICAqIFNIQS0xIGhhc2ggYWxnb3JpdGhtLlxuXHQgICAgICovXG5cdCAgICB2YXIgU0hBMSA9IENfYWxnby5TSEExID0gSGFzaGVyLmV4dGVuZCh7XG5cdCAgICAgICAgX2RvUmVzZXQ6IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgdGhpcy5faGFzaCA9IG5ldyBXb3JkQXJyYXkuaW5pdChbXG5cdCAgICAgICAgICAgICAgICAweDY3NDUyMzAxLCAweGVmY2RhYjg5LFxuXHQgICAgICAgICAgICAgICAgMHg5OGJhZGNmZSwgMHgxMDMyNTQ3Nixcblx0ICAgICAgICAgICAgICAgIDB4YzNkMmUxZjBcblx0ICAgICAgICAgICAgXSk7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIF9kb1Byb2Nlc3NCbG9jazogZnVuY3Rpb24gKE0sIG9mZnNldCkge1xuXHQgICAgICAgICAgICAvLyBTaG9ydGN1dFxuXHQgICAgICAgICAgICB2YXIgSCA9IHRoaXMuX2hhc2gud29yZHM7XG5cblx0ICAgICAgICAgICAgLy8gV29ya2luZyB2YXJpYWJsZXNcblx0ICAgICAgICAgICAgdmFyIGEgPSBIWzBdO1xuXHQgICAgICAgICAgICB2YXIgYiA9IEhbMV07XG5cdCAgICAgICAgICAgIHZhciBjID0gSFsyXTtcblx0ICAgICAgICAgICAgdmFyIGQgPSBIWzNdO1xuXHQgICAgICAgICAgICB2YXIgZSA9IEhbNF07XG5cblx0ICAgICAgICAgICAgLy8gQ29tcHV0YXRpb25cblx0ICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA4MDsgaSsrKSB7XG5cdCAgICAgICAgICAgICAgICBpZiAoaSA8IDE2KSB7XG5cdCAgICAgICAgICAgICAgICAgICAgV1tpXSA9IE1bb2Zmc2V0ICsgaV0gfCAwO1xuXHQgICAgICAgICAgICAgICAgfSBlbHNlIHtcblx0ICAgICAgICAgICAgICAgICAgICB2YXIgbiA9IFdbaSAtIDNdIF4gV1tpIC0gOF0gXiBXW2kgLSAxNF0gXiBXW2kgLSAxNl07XG5cdCAgICAgICAgICAgICAgICAgICAgV1tpXSA9IChuIDw8IDEpIHwgKG4gPj4+IDMxKTtcblx0ICAgICAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICAgICAgdmFyIHQgPSAoKGEgPDwgNSkgfCAoYSA+Pj4gMjcpKSArIGUgKyBXW2ldO1xuXHQgICAgICAgICAgICAgICAgaWYgKGkgPCAyMCkge1xuXHQgICAgICAgICAgICAgICAgICAgIHQgKz0gKChiICYgYykgfCAofmIgJiBkKSkgKyAweDVhODI3OTk5O1xuXHQgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpIDwgNDApIHtcblx0ICAgICAgICAgICAgICAgICAgICB0ICs9IChiIF4gYyBeIGQpICsgMHg2ZWQ5ZWJhMTtcblx0ICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaSA8IDYwKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgdCArPSAoKGIgJiBjKSB8IChiICYgZCkgfCAoYyAmIGQpKSAtIDB4NzBlNDQzMjQ7XG5cdCAgICAgICAgICAgICAgICB9IGVsc2UgLyogaWYgKGkgPCA4MCkgKi8ge1xuXHQgICAgICAgICAgICAgICAgICAgIHQgKz0gKGIgXiBjIF4gZCkgLSAweDM1OWQzZTJhO1xuXHQgICAgICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgICAgICBlID0gZDtcblx0ICAgICAgICAgICAgICAgIGQgPSBjO1xuXHQgICAgICAgICAgICAgICAgYyA9IChiIDw8IDMwKSB8IChiID4+PiAyKTtcblx0ICAgICAgICAgICAgICAgIGIgPSBhO1xuXHQgICAgICAgICAgICAgICAgYSA9IHQ7XG5cdCAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICAvLyBJbnRlcm1lZGlhdGUgaGFzaCB2YWx1ZVxuXHQgICAgICAgICAgICBIWzBdID0gKEhbMF0gKyBhKSB8IDA7XG5cdCAgICAgICAgICAgIEhbMV0gPSAoSFsxXSArIGIpIHwgMDtcblx0ICAgICAgICAgICAgSFsyXSA9IChIWzJdICsgYykgfCAwO1xuXHQgICAgICAgICAgICBIWzNdID0gKEhbM10gKyBkKSB8IDA7XG5cdCAgICAgICAgICAgIEhbNF0gPSAoSFs0XSArIGUpIHwgMDtcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgX2RvRmluYWxpemU6IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgLy8gU2hvcnRjdXRzXG5cdCAgICAgICAgICAgIHZhciBkYXRhID0gdGhpcy5fZGF0YTtcblx0ICAgICAgICAgICAgdmFyIGRhdGFXb3JkcyA9IGRhdGEud29yZHM7XG5cblx0ICAgICAgICAgICAgdmFyIG5CaXRzVG90YWwgPSB0aGlzLl9uRGF0YUJ5dGVzICogODtcblx0ICAgICAgICAgICAgdmFyIG5CaXRzTGVmdCA9IGRhdGEuc2lnQnl0ZXMgKiA4O1xuXG5cdCAgICAgICAgICAgIC8vIEFkZCBwYWRkaW5nXG5cdCAgICAgICAgICAgIGRhdGFXb3Jkc1tuQml0c0xlZnQgPj4+IDVdIHw9IDB4ODAgPDwgKDI0IC0gbkJpdHNMZWZ0ICUgMzIpO1xuXHQgICAgICAgICAgICBkYXRhV29yZHNbKCgobkJpdHNMZWZ0ICsgNjQpID4+PiA5KSA8PCA0KSArIDE0XSA9IE1hdGguZmxvb3IobkJpdHNUb3RhbCAvIDB4MTAwMDAwMDAwKTtcblx0ICAgICAgICAgICAgZGF0YVdvcmRzWygoKG5CaXRzTGVmdCArIDY0KSA+Pj4gOSkgPDwgNCkgKyAxNV0gPSBuQml0c1RvdGFsO1xuXHQgICAgICAgICAgICBkYXRhLnNpZ0J5dGVzID0gZGF0YVdvcmRzLmxlbmd0aCAqIDQ7XG5cblx0ICAgICAgICAgICAgLy8gSGFzaCBmaW5hbCBibG9ja3Ncblx0ICAgICAgICAgICAgdGhpcy5fcHJvY2VzcygpO1xuXG5cdCAgICAgICAgICAgIC8vIFJldHVybiBmaW5hbCBjb21wdXRlZCBoYXNoXG5cdCAgICAgICAgICAgIHJldHVybiB0aGlzLl9oYXNoO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICBjbG9uZTogZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICB2YXIgY2xvbmUgPSBIYXNoZXIuY2xvbmUuY2FsbCh0aGlzKTtcblx0ICAgICAgICAgICAgY2xvbmUuX2hhc2ggPSB0aGlzLl9oYXNoLmNsb25lKCk7XG5cblx0ICAgICAgICAgICAgcmV0dXJuIGNsb25lO1xuXHQgICAgICAgIH1cblx0ICAgIH0pO1xuXG5cdCAgICAvKipcblx0ICAgICAqIFNob3J0Y3V0IGZ1bmN0aW9uIHRvIHRoZSBoYXNoZXIncyBvYmplY3QgaW50ZXJmYWNlLlxuXHQgICAgICpcblx0ICAgICAqIEBwYXJhbSB7V29yZEFycmF5fHN0cmluZ30gbWVzc2FnZSBUaGUgbWVzc2FnZSB0byBoYXNoLlxuXHQgICAgICpcblx0ICAgICAqIEByZXR1cm4ge1dvcmRBcnJheX0gVGhlIGhhc2guXG5cdCAgICAgKlxuXHQgICAgICogQHN0YXRpY1xuXHQgICAgICpcblx0ICAgICAqIEBleGFtcGxlXG5cdCAgICAgKlxuXHQgICAgICogICAgIHZhciBoYXNoID0gQ3J5cHRvSlMuU0hBMSgnbWVzc2FnZScpO1xuXHQgICAgICogICAgIHZhciBoYXNoID0gQ3J5cHRvSlMuU0hBMSh3b3JkQXJyYXkpO1xuXHQgICAgICovXG5cdCAgICBDLlNIQTEgPSBIYXNoZXIuX2NyZWF0ZUhlbHBlcihTSEExKTtcblxuXHQgICAgLyoqXG5cdCAgICAgKiBTaG9ydGN1dCBmdW5jdGlvbiB0byB0aGUgSE1BQydzIG9iamVjdCBpbnRlcmZhY2UuXG5cdCAgICAgKlxuXHQgICAgICogQHBhcmFtIHtXb3JkQXJyYXl8c3RyaW5nfSBtZXNzYWdlIFRoZSBtZXNzYWdlIHRvIGhhc2guXG5cdCAgICAgKiBAcGFyYW0ge1dvcmRBcnJheXxzdHJpbmd9IGtleSBUaGUgc2VjcmV0IGtleS5cblx0ICAgICAqXG5cdCAgICAgKiBAcmV0dXJuIHtXb3JkQXJyYXl9IFRoZSBITUFDLlxuXHQgICAgICpcblx0ICAgICAqIEBzdGF0aWNcblx0ICAgICAqXG5cdCAgICAgKiBAZXhhbXBsZVxuXHQgICAgICpcblx0ICAgICAqICAgICB2YXIgaG1hYyA9IENyeXB0b0pTLkhtYWNTSEExKG1lc3NhZ2UsIGtleSk7XG5cdCAgICAgKi9cblx0ICAgIEMuSG1hY1NIQTEgPSBIYXNoZXIuX2NyZWF0ZUhtYWNIZWxwZXIoU0hBMSk7XG5cdH0oKSk7XG5cblxuXHRyZXR1cm4gQ3J5cHRvSlMuU0hBMTtcblxufSkpOyIsIi8vICAgICB1dWlkLmpzXG4vL1xuLy8gICAgIENvcHlyaWdodCAoYykgMjAxMC0yMDEyIFJvYmVydCBLaWVmZmVyXG4vLyAgICAgTUlUIExpY2Vuc2UgLSBodHRwOi8vb3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG5cbihmdW5jdGlvbigpIHtcbiAgdmFyIF9nbG9iYWwgPSB0aGlzO1xuXG4gIC8vIFVuaXF1ZSBJRCBjcmVhdGlvbiByZXF1aXJlcyBhIGhpZ2ggcXVhbGl0eSByYW5kb20gIyBnZW5lcmF0b3IuICBXZSBmZWF0dXJlXG4gIC8vIGRldGVjdCB0byBkZXRlcm1pbmUgdGhlIGJlc3QgUk5HIHNvdXJjZSwgbm9ybWFsaXppbmcgdG8gYSBmdW5jdGlvbiB0aGF0XG4gIC8vIHJldHVybnMgMTI4LWJpdHMgb2YgcmFuZG9tbmVzcywgc2luY2UgdGhhdCdzIHdoYXQncyB1c3VhbGx5IHJlcXVpcmVkXG4gIHZhciBfcm5nO1xuXG4gIC8vIE5vZGUuanMgY3J5cHRvLWJhc2VkIFJORyAtIGh0dHA6Ly9ub2RlanMub3JnL2RvY3MvdjAuNi4yL2FwaS9jcnlwdG8uaHRtbFxuICAvL1xuICAvLyBNb2RlcmF0ZWx5IGZhc3QsIGhpZ2ggcXVhbGl0eVxuICBpZiAodHlwZW9mKF9nbG9iYWwucmVxdWlyZSkgPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRyeSB7XG4gICAgICB2YXIgX3JiID0gX2dsb2JhbC5yZXF1aXJlKCdjcnlwdG8nKS5yYW5kb21CeXRlcztcbiAgICAgIF9ybmcgPSBfcmIgJiYgZnVuY3Rpb24oKSB7cmV0dXJuIF9yYigxNik7fTtcbiAgICB9IGNhdGNoKGUpIHt9XG4gIH1cblxuICBpZiAoIV9ybmcgJiYgX2dsb2JhbC5jcnlwdG8gJiYgY3J5cHRvLmdldFJhbmRvbVZhbHVlcykge1xuICAgIC8vIFdIQVRXRyBjcnlwdG8tYmFzZWQgUk5HIC0gaHR0cDovL3dpa2kud2hhdHdnLm9yZy93aWtpL0NyeXB0b1xuICAgIC8vXG4gICAgLy8gTW9kZXJhdGVseSBmYXN0LCBoaWdoIHF1YWxpdHlcbiAgICB2YXIgX3JuZHM4ID0gbmV3IFVpbnQ4QXJyYXkoMTYpO1xuICAgIF9ybmcgPSBmdW5jdGlvbiB3aGF0d2dSTkcoKSB7XG4gICAgICBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKF9ybmRzOCk7XG4gICAgICByZXR1cm4gX3JuZHM4O1xuICAgIH07XG4gIH1cblxuICBpZiAoIV9ybmcpIHtcbiAgICAvLyBNYXRoLnJhbmRvbSgpLWJhc2VkIChSTkcpXG4gICAgLy9cbiAgICAvLyBJZiBhbGwgZWxzZSBmYWlscywgdXNlIE1hdGgucmFuZG9tKCkuICBJdCdzIGZhc3QsIGJ1dCBpcyBvZiB1bnNwZWNpZmllZFxuICAgIC8vIHF1YWxpdHkuXG4gICAgdmFyICBfcm5kcyA9IG5ldyBBcnJheSgxNik7XG4gICAgX3JuZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIHI7IGkgPCAxNjsgaSsrKSB7XG4gICAgICAgIGlmICgoaSAmIDB4MDMpID09PSAwKSByID0gTWF0aC5yYW5kb20oKSAqIDB4MTAwMDAwMDAwO1xuICAgICAgICBfcm5kc1tpXSA9IHIgPj4+ICgoaSAmIDB4MDMpIDw8IDMpICYgMHhmZjtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIF9ybmRzO1xuICAgIH07XG4gIH1cblxuICAvLyBCdWZmZXIgY2xhc3MgdG8gdXNlXG4gIHZhciBCdWZmZXJDbGFzcyA9IHR5cGVvZihfZ2xvYmFsLkJ1ZmZlcikgPT0gJ2Z1bmN0aW9uJyA/IF9nbG9iYWwuQnVmZmVyIDogQXJyYXk7XG5cbiAgLy8gTWFwcyBmb3IgbnVtYmVyIDwtPiBoZXggc3RyaW5nIGNvbnZlcnNpb25cbiAgdmFyIF9ieXRlVG9IZXggPSBbXTtcbiAgdmFyIF9oZXhUb0J5dGUgPSB7fTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCAyNTY7IGkrKykge1xuICAgIF9ieXRlVG9IZXhbaV0gPSAoaSArIDB4MTAwKS50b1N0cmluZygxNikuc3Vic3RyKDEpO1xuICAgIF9oZXhUb0J5dGVbX2J5dGVUb0hleFtpXV0gPSBpO1xuICB9XG5cbiAgLy8gKipgcGFyc2UoKWAgLSBQYXJzZSBhIFVVSUQgaW50byBpdCdzIGNvbXBvbmVudCBieXRlcyoqXG4gIGZ1bmN0aW9uIHBhcnNlKHMsIGJ1Ziwgb2Zmc2V0KSB7XG4gICAgdmFyIGkgPSAoYnVmICYmIG9mZnNldCkgfHwgMCwgaWkgPSAwO1xuXG4gICAgYnVmID0gYnVmIHx8IFtdO1xuICAgIHMudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9bMC05YS1mXXsyfS9nLCBmdW5jdGlvbihvY3QpIHtcbiAgICAgIGlmIChpaSA8IDE2KSB7IC8vIERvbid0IG92ZXJmbG93IVxuICAgICAgICBidWZbaSArIGlpKytdID0gX2hleFRvQnl0ZVtvY3RdO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gWmVybyBvdXQgcmVtYWluaW5nIGJ5dGVzIGlmIHN0cmluZyB3YXMgc2hvcnRcbiAgICB3aGlsZSAoaWkgPCAxNikge1xuICAgICAgYnVmW2kgKyBpaSsrXSA9IDA7XG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1ZjtcbiAgfVxuXG4gIC8vICoqYHVucGFyc2UoKWAgLSBDb252ZXJ0IFVVSUQgYnl0ZSBhcnJheSAoYWxhIHBhcnNlKCkpIGludG8gYSBzdHJpbmcqKlxuICBmdW5jdGlvbiB1bnBhcnNlKGJ1Ziwgb2Zmc2V0KSB7XG4gICAgdmFyIGkgPSBvZmZzZXQgfHwgMCwgYnRoID0gX2J5dGVUb0hleDtcbiAgICByZXR1cm4gIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICtcbiAgICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICsgJy0nICtcbiAgICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICsgJy0nICtcbiAgICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICsgJy0nICtcbiAgICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICsgJy0nICtcbiAgICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICtcbiAgICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICtcbiAgICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dO1xuICB9XG5cbiAgLy8gKipgdjEoKWAgLSBHZW5lcmF0ZSB0aW1lLWJhc2VkIFVVSUQqKlxuICAvL1xuICAvLyBJbnNwaXJlZCBieSBodHRwczovL2dpdGh1Yi5jb20vTGlvc0svVVVJRC5qc1xuICAvLyBhbmQgaHR0cDovL2RvY3MucHl0aG9uLm9yZy9saWJyYXJ5L3V1aWQuaHRtbFxuXG4gIC8vIHJhbmRvbSAjJ3Mgd2UgbmVlZCB0byBpbml0IG5vZGUgYW5kIGNsb2Nrc2VxXG4gIHZhciBfc2VlZEJ5dGVzID0gX3JuZygpO1xuXG4gIC8vIFBlciA0LjUsIGNyZWF0ZSBhbmQgNDgtYml0IG5vZGUgaWQsICg0NyByYW5kb20gYml0cyArIG11bHRpY2FzdCBiaXQgPSAxKVxuICB2YXIgX25vZGVJZCA9IFtcbiAgICBfc2VlZEJ5dGVzWzBdIHwgMHgwMSxcbiAgICBfc2VlZEJ5dGVzWzFdLCBfc2VlZEJ5dGVzWzJdLCBfc2VlZEJ5dGVzWzNdLCBfc2VlZEJ5dGVzWzRdLCBfc2VlZEJ5dGVzWzVdXG4gIF07XG5cbiAgLy8gUGVyIDQuMi4yLCByYW5kb21pemUgKDE0IGJpdCkgY2xvY2tzZXFcbiAgdmFyIF9jbG9ja3NlcSA9IChfc2VlZEJ5dGVzWzZdIDw8IDggfCBfc2VlZEJ5dGVzWzddKSAmIDB4M2ZmZjtcblxuICAvLyBQcmV2aW91cyB1dWlkIGNyZWF0aW9uIHRpbWVcbiAgdmFyIF9sYXN0TVNlY3MgPSAwLCBfbGFzdE5TZWNzID0gMDtcblxuICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2Jyb29mYS9ub2RlLXV1aWQgZm9yIEFQSSBkZXRhaWxzXG4gIGZ1bmN0aW9uIHYxKG9wdGlvbnMsIGJ1Ziwgb2Zmc2V0KSB7XG4gICAgdmFyIGkgPSBidWYgJiYgb2Zmc2V0IHx8IDA7XG4gICAgdmFyIGIgPSBidWYgfHwgW107XG5cbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHZhciBjbG9ja3NlcSA9IG9wdGlvbnMuY2xvY2tzZXEgIT0gbnVsbCA/IG9wdGlvbnMuY2xvY2tzZXEgOiBfY2xvY2tzZXE7XG5cbiAgICAvLyBVVUlEIHRpbWVzdGFtcHMgYXJlIDEwMCBuYW5vLXNlY29uZCB1bml0cyBzaW5jZSB0aGUgR3JlZ29yaWFuIGVwb2NoLFxuICAgIC8vICgxNTgyLTEwLTE1IDAwOjAwKS4gIEpTTnVtYmVycyBhcmVuJ3QgcHJlY2lzZSBlbm91Z2ggZm9yIHRoaXMsIHNvXG4gICAgLy8gdGltZSBpcyBoYW5kbGVkIGludGVybmFsbHkgYXMgJ21zZWNzJyAoaW50ZWdlciBtaWxsaXNlY29uZHMpIGFuZCAnbnNlY3MnXG4gICAgLy8gKDEwMC1uYW5vc2Vjb25kcyBvZmZzZXQgZnJvbSBtc2Vjcykgc2luY2UgdW5peCBlcG9jaCwgMTk3MC0wMS0wMSAwMDowMC5cbiAgICB2YXIgbXNlY3MgPSBvcHRpb25zLm1zZWNzICE9IG51bGwgPyBvcHRpb25zLm1zZWNzIDogbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cbiAgICAvLyBQZXIgNC4yLjEuMiwgdXNlIGNvdW50IG9mIHV1aWQncyBnZW5lcmF0ZWQgZHVyaW5nIHRoZSBjdXJyZW50IGNsb2NrXG4gICAgLy8gY3ljbGUgdG8gc2ltdWxhdGUgaGlnaGVyIHJlc29sdXRpb24gY2xvY2tcbiAgICB2YXIgbnNlY3MgPSBvcHRpb25zLm5zZWNzICE9IG51bGwgPyBvcHRpb25zLm5zZWNzIDogX2xhc3ROU2VjcyArIDE7XG5cbiAgICAvLyBUaW1lIHNpbmNlIGxhc3QgdXVpZCBjcmVhdGlvbiAoaW4gbXNlY3MpXG4gICAgdmFyIGR0ID0gKG1zZWNzIC0gX2xhc3RNU2VjcykgKyAobnNlY3MgLSBfbGFzdE5TZWNzKS8xMDAwMDtcblxuICAgIC8vIFBlciA0LjIuMS4yLCBCdW1wIGNsb2Nrc2VxIG9uIGNsb2NrIHJlZ3Jlc3Npb25cbiAgICBpZiAoZHQgPCAwICYmIG9wdGlvbnMuY2xvY2tzZXEgPT0gbnVsbCkge1xuICAgICAgY2xvY2tzZXEgPSBjbG9ja3NlcSArIDEgJiAweDNmZmY7XG4gICAgfVxuXG4gICAgLy8gUmVzZXQgbnNlY3MgaWYgY2xvY2sgcmVncmVzc2VzIChuZXcgY2xvY2tzZXEpIG9yIHdlJ3ZlIG1vdmVkIG9udG8gYSBuZXdcbiAgICAvLyB0aW1lIGludGVydmFsXG4gICAgaWYgKChkdCA8IDAgfHwgbXNlY3MgPiBfbGFzdE1TZWNzKSAmJiBvcHRpb25zLm5zZWNzID09IG51bGwpIHtcbiAgICAgIG5zZWNzID0gMDtcbiAgICB9XG5cbiAgICAvLyBQZXIgNC4yLjEuMiBUaHJvdyBlcnJvciBpZiB0b28gbWFueSB1dWlkcyBhcmUgcmVxdWVzdGVkXG4gICAgaWYgKG5zZWNzID49IDEwMDAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3V1aWQudjEoKTogQ2FuXFwndCBjcmVhdGUgbW9yZSB0aGFuIDEwTSB1dWlkcy9zZWMnKTtcbiAgICB9XG5cbiAgICBfbGFzdE1TZWNzID0gbXNlY3M7XG4gICAgX2xhc3ROU2VjcyA9IG5zZWNzO1xuICAgIF9jbG9ja3NlcSA9IGNsb2Nrc2VxO1xuXG4gICAgLy8gUGVyIDQuMS40IC0gQ29udmVydCBmcm9tIHVuaXggZXBvY2ggdG8gR3JlZ29yaWFuIGVwb2NoXG4gICAgbXNlY3MgKz0gMTIyMTkyOTI4MDAwMDA7XG5cbiAgICAvLyBgdGltZV9sb3dgXG4gICAgdmFyIHRsID0gKChtc2VjcyAmIDB4ZmZmZmZmZikgKiAxMDAwMCArIG5zZWNzKSAlIDB4MTAwMDAwMDAwO1xuICAgIGJbaSsrXSA9IHRsID4+PiAyNCAmIDB4ZmY7XG4gICAgYltpKytdID0gdGwgPj4+IDE2ICYgMHhmZjtcbiAgICBiW2krK10gPSB0bCA+Pj4gOCAmIDB4ZmY7XG4gICAgYltpKytdID0gdGwgJiAweGZmO1xuXG4gICAgLy8gYHRpbWVfbWlkYFxuICAgIHZhciB0bWggPSAobXNlY3MgLyAweDEwMDAwMDAwMCAqIDEwMDAwKSAmIDB4ZmZmZmZmZjtcbiAgICBiW2krK10gPSB0bWggPj4+IDggJiAweGZmO1xuICAgIGJbaSsrXSA9IHRtaCAmIDB4ZmY7XG5cbiAgICAvLyBgdGltZV9oaWdoX2FuZF92ZXJzaW9uYFxuICAgIGJbaSsrXSA9IHRtaCA+Pj4gMjQgJiAweGYgfCAweDEwOyAvLyBpbmNsdWRlIHZlcnNpb25cbiAgICBiW2krK10gPSB0bWggPj4+IDE2ICYgMHhmZjtcblxuICAgIC8vIGBjbG9ja19zZXFfaGlfYW5kX3Jlc2VydmVkYCAoUGVyIDQuMi4yIC0gaW5jbHVkZSB2YXJpYW50KVxuICAgIGJbaSsrXSA9IGNsb2Nrc2VxID4+PiA4IHwgMHg4MDtcblxuICAgIC8vIGBjbG9ja19zZXFfbG93YFxuICAgIGJbaSsrXSA9IGNsb2Nrc2VxICYgMHhmZjtcblxuICAgIC8vIGBub2RlYFxuICAgIHZhciBub2RlID0gb3B0aW9ucy5ub2RlIHx8IF9ub2RlSWQ7XG4gICAgZm9yICh2YXIgbiA9IDA7IG4gPCA2OyBuKyspIHtcbiAgICAgIGJbaSArIG5dID0gbm9kZVtuXTtcbiAgICB9XG5cbiAgICByZXR1cm4gYnVmID8gYnVmIDogdW5wYXJzZShiKTtcbiAgfVxuXG4gIC8vICoqYHY0KClgIC0gR2VuZXJhdGUgcmFuZG9tIFVVSUQqKlxuXG4gIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vYnJvb2ZhL25vZGUtdXVpZCBmb3IgQVBJIGRldGFpbHNcbiAgZnVuY3Rpb24gdjQob3B0aW9ucywgYnVmLCBvZmZzZXQpIHtcbiAgICAvLyBEZXByZWNhdGVkIC0gJ2Zvcm1hdCcgYXJndW1lbnQsIGFzIHN1cHBvcnRlZCBpbiB2MS4yXG4gICAgdmFyIGkgPSBidWYgJiYgb2Zmc2V0IHx8IDA7XG5cbiAgICBpZiAodHlwZW9mKG9wdGlvbnMpID09ICdzdHJpbmcnKSB7XG4gICAgICBidWYgPSBvcHRpb25zID09ICdiaW5hcnknID8gbmV3IEJ1ZmZlckNsYXNzKDE2KSA6IG51bGw7XG4gICAgICBvcHRpb25zID0gbnVsbDtcbiAgICB9XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICB2YXIgcm5kcyA9IG9wdGlvbnMucmFuZG9tIHx8IChvcHRpb25zLnJuZyB8fCBfcm5nKSgpO1xuXG4gICAgLy8gUGVyIDQuNCwgc2V0IGJpdHMgZm9yIHZlcnNpb24gYW5kIGBjbG9ja19zZXFfaGlfYW5kX3Jlc2VydmVkYFxuICAgIHJuZHNbNl0gPSAocm5kc1s2XSAmIDB4MGYpIHwgMHg0MDtcbiAgICBybmRzWzhdID0gKHJuZHNbOF0gJiAweDNmKSB8IDB4ODA7XG5cbiAgICAvLyBDb3B5IGJ5dGVzIHRvIGJ1ZmZlciwgaWYgcHJvdmlkZWRcbiAgICBpZiAoYnVmKSB7XG4gICAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgMTY7IGlpKyspIHtcbiAgICAgICAgYnVmW2kgKyBpaV0gPSBybmRzW2lpXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYnVmIHx8IHVucGFyc2Uocm5kcyk7XG4gIH1cblxuICAvLyBFeHBvcnQgcHVibGljIEFQSVxuICB2YXIgdXVpZCA9IHY0O1xuICB1dWlkLnYxID0gdjE7XG4gIHV1aWQudjQgPSB2NDtcbiAgdXVpZC5wYXJzZSA9IHBhcnNlO1xuICB1dWlkLnVucGFyc2UgPSB1bnBhcnNlO1xuICB1dWlkLkJ1ZmZlckNsYXNzID0gQnVmZmVyQ2xhc3M7XG5cbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIC8vIFB1Ymxpc2ggYXMgQU1EIG1vZHVsZVxuICAgIGRlZmluZShmdW5jdGlvbigpIHtyZXR1cm4gdXVpZDt9KTtcbiAgfSBlbHNlIGlmICh0eXBlb2YobW9kdWxlKSAhPSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgIC8vIFB1Ymxpc2ggYXMgbm9kZS5qcyBtb2R1bGVcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHV1aWQ7XG4gIH0gZWxzZSB7XG4gICAgLy8gUHVibGlzaCBhcyBnbG9iYWwgKGluIGJyb3dzZXJzKVxuICAgIHZhciBfcHJldmlvdXNSb290ID0gX2dsb2JhbC51dWlkO1xuXG4gICAgLy8gKipgbm9Db25mbGljdCgpYCAtIChicm93c2VyIG9ubHkpIHRvIHJlc2V0IGdsb2JhbCAndXVpZCcgdmFyKipcbiAgICB1dWlkLm5vQ29uZmxpY3QgPSBmdW5jdGlvbigpIHtcbiAgICAgIF9nbG9iYWwudXVpZCA9IF9wcmV2aW91c1Jvb3Q7XG4gICAgICByZXR1cm4gdXVpZDtcbiAgICB9O1xuXG4gICAgX2dsb2JhbC51dWlkID0gdXVpZDtcbiAgfVxufSkuY2FsbCh0aGlzKTtcbiIsInZhciBlbmdpbmUgPSByZXF1aXJlKCcuLi9zcmMvc3RvcmUtZW5naW5lJylcblxudmFyIHN0b3JhZ2VzID0gcmVxdWlyZSgnLi4vc3RvcmFnZXMvYWxsJylcbnZhciBwbHVnaW5zID0gW3JlcXVpcmUoJy4uL3BsdWdpbnMvanNvbjInKV1cblxubW9kdWxlLmV4cG9ydHMgPSBlbmdpbmUuY3JlYXRlU3RvcmUoc3RvcmFnZXMsIHBsdWdpbnMpXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGpzb24yUGx1Z2luXG5cbmZ1bmN0aW9uIGpzb24yUGx1Z2luKCkge1xuXHRyZXF1aXJlKCcuL2xpYi9qc29uMicpXG5cdHJldHVybiB7fVxufVxuIiwiLyogZXNsaW50LWRpc2FibGUgKi9cblxuLy8gIGpzb24yLmpzXG4vLyAgMjAxNi0xMC0yOFxuLy8gIFB1YmxpYyBEb21haW4uXG4vLyAgTk8gV0FSUkFOVFkgRVhQUkVTU0VEIE9SIElNUExJRUQuIFVTRSBBVCBZT1VSIE9XTiBSSVNLLlxuLy8gIFNlZSBodHRwOi8vd3d3LkpTT04ub3JnL2pzLmh0bWxcbi8vICBUaGlzIGNvZGUgc2hvdWxkIGJlIG1pbmlmaWVkIGJlZm9yZSBkZXBsb3ltZW50LlxuLy8gIFNlZSBodHRwOi8vamF2YXNjcmlwdC5jcm9ja2ZvcmQuY29tL2pzbWluLmh0bWxcblxuLy8gIFVTRSBZT1VSIE9XTiBDT1BZLiBJVCBJUyBFWFRSRU1FTFkgVU5XSVNFIFRPIExPQUQgQ09ERSBGUk9NIFNFUlZFUlMgWU9VIERPXG4vLyAgTk9UIENPTlRST0wuXG5cbi8vICBUaGlzIGZpbGUgY3JlYXRlcyBhIGdsb2JhbCBKU09OIG9iamVjdCBjb250YWluaW5nIHR3byBtZXRob2RzOiBzdHJpbmdpZnlcbi8vICBhbmQgcGFyc2UuIFRoaXMgZmlsZSBwcm92aWRlcyB0aGUgRVM1IEpTT04gY2FwYWJpbGl0eSB0byBFUzMgc3lzdGVtcy5cbi8vICBJZiBhIHByb2plY3QgbWlnaHQgcnVuIG9uIElFOCBvciBlYXJsaWVyLCB0aGVuIHRoaXMgZmlsZSBzaG91bGQgYmUgaW5jbHVkZWQuXG4vLyAgVGhpcyBmaWxlIGRvZXMgbm90aGluZyBvbiBFUzUgc3lzdGVtcy5cblxuLy8gICAgICBKU09OLnN0cmluZ2lmeSh2YWx1ZSwgcmVwbGFjZXIsIHNwYWNlKVxuLy8gICAgICAgICAgdmFsdWUgICAgICAgYW55IEphdmFTY3JpcHQgdmFsdWUsIHVzdWFsbHkgYW4gb2JqZWN0IG9yIGFycmF5LlxuLy8gICAgICAgICAgcmVwbGFjZXIgICAgYW4gb3B0aW9uYWwgcGFyYW1ldGVyIHRoYXQgZGV0ZXJtaW5lcyBob3cgb2JqZWN0XG4vLyAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXMgYXJlIHN0cmluZ2lmaWVkIGZvciBvYmplY3RzLiBJdCBjYW4gYmUgYVxuLy8gICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gb3IgYW4gYXJyYXkgb2Ygc3RyaW5ncy5cbi8vICAgICAgICAgIHNwYWNlICAgICAgIGFuIG9wdGlvbmFsIHBhcmFtZXRlciB0aGF0IHNwZWNpZmllcyB0aGUgaW5kZW50YXRpb25cbi8vICAgICAgICAgICAgICAgICAgICAgIG9mIG5lc3RlZCBzdHJ1Y3R1cmVzLiBJZiBpdCBpcyBvbWl0dGVkLCB0aGUgdGV4dCB3aWxsXG4vLyAgICAgICAgICAgICAgICAgICAgICBiZSBwYWNrZWQgd2l0aG91dCBleHRyYSB3aGl0ZXNwYWNlLiBJZiBpdCBpcyBhIG51bWJlcixcbi8vICAgICAgICAgICAgICAgICAgICAgIGl0IHdpbGwgc3BlY2lmeSB0aGUgbnVtYmVyIG9mIHNwYWNlcyB0byBpbmRlbnQgYXQgZWFjaFxuLy8gICAgICAgICAgICAgICAgICAgICAgbGV2ZWwuIElmIGl0IGlzIGEgc3RyaW5nIChzdWNoIGFzIFwiXFx0XCIgb3IgXCImbmJzcDtcIiksXG4vLyAgICAgICAgICAgICAgICAgICAgICBpdCBjb250YWlucyB0aGUgY2hhcmFjdGVycyB1c2VkIHRvIGluZGVudCBhdCBlYWNoIGxldmVsLlxuLy8gICAgICAgICAgVGhpcyBtZXRob2QgcHJvZHVjZXMgYSBKU09OIHRleHQgZnJvbSBhIEphdmFTY3JpcHQgdmFsdWUuXG4vLyAgICAgICAgICBXaGVuIGFuIG9iamVjdCB2YWx1ZSBpcyBmb3VuZCwgaWYgdGhlIG9iamVjdCBjb250YWlucyBhIHRvSlNPTlxuLy8gICAgICAgICAgbWV0aG9kLCBpdHMgdG9KU09OIG1ldGhvZCB3aWxsIGJlIGNhbGxlZCBhbmQgdGhlIHJlc3VsdCB3aWxsIGJlXG4vLyAgICAgICAgICBzdHJpbmdpZmllZC4gQSB0b0pTT04gbWV0aG9kIGRvZXMgbm90IHNlcmlhbGl6ZTogaXQgcmV0dXJucyB0aGVcbi8vICAgICAgICAgIHZhbHVlIHJlcHJlc2VudGVkIGJ5IHRoZSBuYW1lL3ZhbHVlIHBhaXIgdGhhdCBzaG91bGQgYmUgc2VyaWFsaXplZCxcbi8vICAgICAgICAgIG9yIHVuZGVmaW5lZCBpZiBub3RoaW5nIHNob3VsZCBiZSBzZXJpYWxpemVkLiBUaGUgdG9KU09OIG1ldGhvZFxuLy8gICAgICAgICAgd2lsbCBiZSBwYXNzZWQgdGhlIGtleSBhc3NvY2lhdGVkIHdpdGggdGhlIHZhbHVlLCBhbmQgdGhpcyB3aWxsIGJlXG4vLyAgICAgICAgICBib3VuZCB0byB0aGUgdmFsdWUuXG5cbi8vICAgICAgICAgIEZvciBleGFtcGxlLCB0aGlzIHdvdWxkIHNlcmlhbGl6ZSBEYXRlcyBhcyBJU08gc3RyaW5ncy5cblxuLy8gICAgICAgICAgICAgIERhdGUucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uIChrZXkpIHtcbi8vICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gZihuKSB7XG4vLyAgICAgICAgICAgICAgICAgICAgICAvLyBGb3JtYXQgaW50ZWdlcnMgdG8gaGF2ZSBhdCBsZWFzdCB0d28gZGlnaXRzLlxuLy8gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChuIDwgMTApXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgPyBcIjBcIiArIG5cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICA6IG47XG4vLyAgICAgICAgICAgICAgICAgIH1cbi8vICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0VVRDRnVsbFllYXIoKSAgICsgXCItXCIgK1xuLy8gICAgICAgICAgICAgICAgICAgICAgIGYodGhpcy5nZXRVVENNb250aCgpICsgMSkgKyBcIi1cIiArXG4vLyAgICAgICAgICAgICAgICAgICAgICAgZih0aGlzLmdldFVUQ0RhdGUoKSkgICAgICArIFwiVFwiICtcbi8vICAgICAgICAgICAgICAgICAgICAgICBmKHRoaXMuZ2V0VVRDSG91cnMoKSkgICAgICsgXCI6XCIgK1xuLy8gICAgICAgICAgICAgICAgICAgICAgIGYodGhpcy5nZXRVVENNaW51dGVzKCkpICAgKyBcIjpcIiArXG4vLyAgICAgICAgICAgICAgICAgICAgICAgZih0aGlzLmdldFVUQ1NlY29uZHMoKSkgICArIFwiWlwiO1xuLy8gICAgICAgICAgICAgIH07XG5cbi8vICAgICAgICAgIFlvdSBjYW4gcHJvdmlkZSBhbiBvcHRpb25hbCByZXBsYWNlciBtZXRob2QuIEl0IHdpbGwgYmUgcGFzc2VkIHRoZVxuLy8gICAgICAgICAga2V5IGFuZCB2YWx1ZSBvZiBlYWNoIG1lbWJlciwgd2l0aCB0aGlzIGJvdW5kIHRvIHRoZSBjb250YWluaW5nXG4vLyAgICAgICAgICBvYmplY3QuIFRoZSB2YWx1ZSB0aGF0IGlzIHJldHVybmVkIGZyb20geW91ciBtZXRob2Qgd2lsbCBiZVxuLy8gICAgICAgICAgc2VyaWFsaXplZC4gSWYgeW91ciBtZXRob2QgcmV0dXJucyB1bmRlZmluZWQsIHRoZW4gdGhlIG1lbWJlciB3aWxsXG4vLyAgICAgICAgICBiZSBleGNsdWRlZCBmcm9tIHRoZSBzZXJpYWxpemF0aW9uLlxuXG4vLyAgICAgICAgICBJZiB0aGUgcmVwbGFjZXIgcGFyYW1ldGVyIGlzIGFuIGFycmF5IG9mIHN0cmluZ3MsIHRoZW4gaXQgd2lsbCBiZVxuLy8gICAgICAgICAgdXNlZCB0byBzZWxlY3QgdGhlIG1lbWJlcnMgdG8gYmUgc2VyaWFsaXplZC4gSXQgZmlsdGVycyB0aGUgcmVzdWx0c1xuLy8gICAgICAgICAgc3VjaCB0aGF0IG9ubHkgbWVtYmVycyB3aXRoIGtleXMgbGlzdGVkIGluIHRoZSByZXBsYWNlciBhcnJheSBhcmVcbi8vICAgICAgICAgIHN0cmluZ2lmaWVkLlxuXG4vLyAgICAgICAgICBWYWx1ZXMgdGhhdCBkbyBub3QgaGF2ZSBKU09OIHJlcHJlc2VudGF0aW9ucywgc3VjaCBhcyB1bmRlZmluZWQgb3Jcbi8vICAgICAgICAgIGZ1bmN0aW9ucywgd2lsbCBub3QgYmUgc2VyaWFsaXplZC4gU3VjaCB2YWx1ZXMgaW4gb2JqZWN0cyB3aWxsIGJlXG4vLyAgICAgICAgICBkcm9wcGVkOyBpbiBhcnJheXMgdGhleSB3aWxsIGJlIHJlcGxhY2VkIHdpdGggbnVsbC4gWW91IGNhbiB1c2Vcbi8vICAgICAgICAgIGEgcmVwbGFjZXIgZnVuY3Rpb24gdG8gcmVwbGFjZSB0aG9zZSB3aXRoIEpTT04gdmFsdWVzLlxuXG4vLyAgICAgICAgICBKU09OLnN0cmluZ2lmeSh1bmRlZmluZWQpIHJldHVybnMgdW5kZWZpbmVkLlxuXG4vLyAgICAgICAgICBUaGUgb3B0aW9uYWwgc3BhY2UgcGFyYW1ldGVyIHByb2R1Y2VzIGEgc3RyaW5naWZpY2F0aW9uIG9mIHRoZVxuLy8gICAgICAgICAgdmFsdWUgdGhhdCBpcyBmaWxsZWQgd2l0aCBsaW5lIGJyZWFrcyBhbmQgaW5kZW50YXRpb24gdG8gbWFrZSBpdFxuLy8gICAgICAgICAgZWFzaWVyIHRvIHJlYWQuXG5cbi8vICAgICAgICAgIElmIHRoZSBzcGFjZSBwYXJhbWV0ZXIgaXMgYSBub24tZW1wdHkgc3RyaW5nLCB0aGVuIHRoYXQgc3RyaW5nIHdpbGxcbi8vICAgICAgICAgIGJlIHVzZWQgZm9yIGluZGVudGF0aW9uLiBJZiB0aGUgc3BhY2UgcGFyYW1ldGVyIGlzIGEgbnVtYmVyLCB0aGVuXG4vLyAgICAgICAgICB0aGUgaW5kZW50YXRpb24gd2lsbCBiZSB0aGF0IG1hbnkgc3BhY2VzLlxuXG4vLyAgICAgICAgICBFeGFtcGxlOlxuXG4vLyAgICAgICAgICB0ZXh0ID0gSlNPTi5zdHJpbmdpZnkoW1wiZVwiLCB7cGx1cmlidXM6IFwidW51bVwifV0pO1xuLy8gICAgICAgICAgLy8gdGV4dCBpcyAnW1wiZVwiLHtcInBsdXJpYnVzXCI6XCJ1bnVtXCJ9XSdcblxuLy8gICAgICAgICAgdGV4dCA9IEpTT04uc3RyaW5naWZ5KFtcImVcIiwge3BsdXJpYnVzOiBcInVudW1cIn1dLCBudWxsLCBcIlxcdFwiKTtcbi8vICAgICAgICAgIC8vIHRleHQgaXMgJ1tcXG5cXHRcImVcIixcXG5cXHR7XFxuXFx0XFx0XCJwbHVyaWJ1c1wiOiBcInVudW1cIlxcblxcdH1cXG5dJ1xuXG4vLyAgICAgICAgICB0ZXh0ID0gSlNPTi5zdHJpbmdpZnkoW25ldyBEYXRlKCldLCBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuLy8gICAgICAgICAgICAgIHJldHVybiB0aGlzW2tleV0gaW5zdGFuY2VvZiBEYXRlXG4vLyAgICAgICAgICAgICAgICAgID8gXCJEYXRlKFwiICsgdGhpc1trZXldICsgXCIpXCJcbi8vICAgICAgICAgICAgICAgICAgOiB2YWx1ZTtcbi8vICAgICAgICAgIH0pO1xuLy8gICAgICAgICAgLy8gdGV4dCBpcyAnW1wiRGF0ZSgtLS1jdXJyZW50IHRpbWUtLS0pXCJdJ1xuXG4vLyAgICAgIEpTT04ucGFyc2UodGV4dCwgcmV2aXZlcilcbi8vICAgICAgICAgIFRoaXMgbWV0aG9kIHBhcnNlcyBhIEpTT04gdGV4dCB0byBwcm9kdWNlIGFuIG9iamVjdCBvciBhcnJheS5cbi8vICAgICAgICAgIEl0IGNhbiB0aHJvdyBhIFN5bnRheEVycm9yIGV4Y2VwdGlvbi5cblxuLy8gICAgICAgICAgVGhlIG9wdGlvbmFsIHJldml2ZXIgcGFyYW1ldGVyIGlzIGEgZnVuY3Rpb24gdGhhdCBjYW4gZmlsdGVyIGFuZFxuLy8gICAgICAgICAgdHJhbnNmb3JtIHRoZSByZXN1bHRzLiBJdCByZWNlaXZlcyBlYWNoIG9mIHRoZSBrZXlzIGFuZCB2YWx1ZXMsXG4vLyAgICAgICAgICBhbmQgaXRzIHJldHVybiB2YWx1ZSBpcyB1c2VkIGluc3RlYWQgb2YgdGhlIG9yaWdpbmFsIHZhbHVlLlxuLy8gICAgICAgICAgSWYgaXQgcmV0dXJucyB3aGF0IGl0IHJlY2VpdmVkLCB0aGVuIHRoZSBzdHJ1Y3R1cmUgaXMgbm90IG1vZGlmaWVkLlxuLy8gICAgICAgICAgSWYgaXQgcmV0dXJucyB1bmRlZmluZWQgdGhlbiB0aGUgbWVtYmVyIGlzIGRlbGV0ZWQuXG5cbi8vICAgICAgICAgIEV4YW1wbGU6XG5cbi8vICAgICAgICAgIC8vIFBhcnNlIHRoZSB0ZXh0LiBWYWx1ZXMgdGhhdCBsb29rIGxpa2UgSVNPIGRhdGUgc3RyaW5ncyB3aWxsXG4vLyAgICAgICAgICAvLyBiZSBjb252ZXJ0ZWQgdG8gRGF0ZSBvYmplY3RzLlxuXG4vLyAgICAgICAgICBteURhdGEgPSBKU09OLnBhcnNlKHRleHQsIGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4vLyAgICAgICAgICAgICAgdmFyIGE7XG4vLyAgICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIikge1xuLy8gICAgICAgICAgICAgICAgICBhID1cbi8vICAgL14oXFxkezR9KS0oXFxkezJ9KS0oXFxkezJ9KVQoXFxkezJ9KTooXFxkezJ9KTooXFxkezJ9KD86XFwuXFxkKik/KVokLy5leGVjKHZhbHVlKTtcbi8vICAgICAgICAgICAgICAgICAgaWYgKGEpIHtcbi8vICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZShEYXRlLlVUQygrYVsxXSwgK2FbMl0gLSAxLCArYVszXSwgK2FbNF0sXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgK2FbNV0sICthWzZdKSk7XG4vLyAgICAgICAgICAgICAgICAgIH1cbi8vICAgICAgICAgICAgICB9XG4vLyAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuLy8gICAgICAgICAgfSk7XG5cbi8vICAgICAgICAgIG15RGF0YSA9IEpTT04ucGFyc2UoJ1tcIkRhdGUoMDkvMDkvMjAwMSlcIl0nLCBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuLy8gICAgICAgICAgICAgIHZhciBkO1xuLy8gICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIgJiZcbi8vICAgICAgICAgICAgICAgICAgICAgIHZhbHVlLnNsaWNlKDAsIDUpID09PSBcIkRhdGUoXCIgJiZcbi8vICAgICAgICAgICAgICAgICAgICAgIHZhbHVlLnNsaWNlKC0xKSA9PT0gXCIpXCIpIHtcbi8vICAgICAgICAgICAgICAgICAgZCA9IG5ldyBEYXRlKHZhbHVlLnNsaWNlKDUsIC0xKSk7XG4vLyAgICAgICAgICAgICAgICAgIGlmIChkKSB7XG4vLyAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZDtcbi8vICAgICAgICAgICAgICAgICAgfVxuLy8gICAgICAgICAgICAgIH1cbi8vICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4vLyAgICAgICAgICB9KTtcblxuLy8gIFRoaXMgaXMgYSByZWZlcmVuY2UgaW1wbGVtZW50YXRpb24uIFlvdSBhcmUgZnJlZSB0byBjb3B5LCBtb2RpZnksIG9yXG4vLyAgcmVkaXN0cmlidXRlLlxuXG4vKmpzbGludFxuICAgIGV2YWwsIGZvciwgdGhpc1xuKi9cblxuLypwcm9wZXJ0eVxuICAgIEpTT04sIGFwcGx5LCBjYWxsLCBjaGFyQ29kZUF0LCBnZXRVVENEYXRlLCBnZXRVVENGdWxsWWVhciwgZ2V0VVRDSG91cnMsXG4gICAgZ2V0VVRDTWludXRlcywgZ2V0VVRDTW9udGgsIGdldFVUQ1NlY29uZHMsIGhhc093blByb3BlcnR5LCBqb2luLFxuICAgIGxhc3RJbmRleCwgbGVuZ3RoLCBwYXJzZSwgcHJvdG90eXBlLCBwdXNoLCByZXBsYWNlLCBzbGljZSwgc3RyaW5naWZ5LFxuICAgIHRlc3QsIHRvSlNPTiwgdG9TdHJpbmcsIHZhbHVlT2ZcbiovXG5cblxuLy8gQ3JlYXRlIGEgSlNPTiBvYmplY3Qgb25seSBpZiBvbmUgZG9lcyBub3QgYWxyZWFkeSBleGlzdC4gV2UgY3JlYXRlIHRoZVxuLy8gbWV0aG9kcyBpbiBhIGNsb3N1cmUgdG8gYXZvaWQgY3JlYXRpbmcgZ2xvYmFsIHZhcmlhYmxlcy5cblxuaWYgKHR5cGVvZiBKU09OICE9PSBcIm9iamVjdFwiKSB7XG4gICAgSlNPTiA9IHt9O1xufVxuXG4oZnVuY3Rpb24gKCkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgdmFyIHJ4X29uZSA9IC9eW1xcXSw6e31cXHNdKiQvO1xuICAgIHZhciByeF90d28gPSAvXFxcXCg/OltcIlxcXFxcXC9iZm5ydF18dVswLTlhLWZBLUZdezR9KS9nO1xuICAgIHZhciByeF90aHJlZSA9IC9cIlteXCJcXFxcXFxuXFxyXSpcInx0cnVlfGZhbHNlfG51bGx8LT9cXGQrKD86XFwuXFxkKik/KD86W2VFXVsrXFwtXT9cXGQrKT8vZztcbiAgICB2YXIgcnhfZm91ciA9IC8oPzpefDp8LCkoPzpcXHMqXFxbKSsvZztcbiAgICB2YXIgcnhfZXNjYXBhYmxlID0gL1tcXFxcXCJcXHUwMDAwLVxcdTAwMWZcXHUwMDdmLVxcdTAwOWZcXHUwMGFkXFx1MDYwMC1cXHUwNjA0XFx1MDcwZlxcdTE3YjRcXHUxN2I1XFx1MjAwYy1cXHUyMDBmXFx1MjAyOC1cXHUyMDJmXFx1MjA2MC1cXHUyMDZmXFx1ZmVmZlxcdWZmZjAtXFx1ZmZmZl0vZztcbiAgICB2YXIgcnhfZGFuZ2Vyb3VzID0gL1tcXHUwMDAwXFx1MDBhZFxcdTA2MDAtXFx1MDYwNFxcdTA3MGZcXHUxN2I0XFx1MTdiNVxcdTIwMGMtXFx1MjAwZlxcdTIwMjgtXFx1MjAyZlxcdTIwNjAtXFx1MjA2ZlxcdWZlZmZcXHVmZmYwLVxcdWZmZmZdL2c7XG5cbiAgICBmdW5jdGlvbiBmKG4pIHtcbiAgICAgICAgLy8gRm9ybWF0IGludGVnZXJzIHRvIGhhdmUgYXQgbGVhc3QgdHdvIGRpZ2l0cy5cbiAgICAgICAgcmV0dXJuIG4gPCAxMFxuICAgICAgICAgICAgPyBcIjBcIiArIG5cbiAgICAgICAgICAgIDogbjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0aGlzX3ZhbHVlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZU9mKCk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBEYXRlLnByb3RvdHlwZS50b0pTT04gIT09IFwiZnVuY3Rpb25cIikge1xuXG4gICAgICAgIERhdGUucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgcmV0dXJuIGlzRmluaXRlKHRoaXMudmFsdWVPZigpKVxuICAgICAgICAgICAgICAgID8gdGhpcy5nZXRVVENGdWxsWWVhcigpICsgXCItXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgZih0aGlzLmdldFVUQ01vbnRoKCkgKyAxKSArIFwiLVwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIGYodGhpcy5nZXRVVENEYXRlKCkpICsgXCJUXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgZih0aGlzLmdldFVUQ0hvdXJzKCkpICsgXCI6XCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgZih0aGlzLmdldFVUQ01pbnV0ZXMoKSkgKyBcIjpcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBmKHRoaXMuZ2V0VVRDU2Vjb25kcygpKSArIFwiWlwiXG4gICAgICAgICAgICAgICAgOiBudWxsO1xuICAgICAgICB9O1xuXG4gICAgICAgIEJvb2xlYW4ucHJvdG90eXBlLnRvSlNPTiA9IHRoaXNfdmFsdWU7XG4gICAgICAgIE51bWJlci5wcm90b3R5cGUudG9KU09OID0gdGhpc192YWx1ZTtcbiAgICAgICAgU3RyaW5nLnByb3RvdHlwZS50b0pTT04gPSB0aGlzX3ZhbHVlO1xuICAgIH1cblxuICAgIHZhciBnYXA7XG4gICAgdmFyIGluZGVudDtcbiAgICB2YXIgbWV0YTtcbiAgICB2YXIgcmVwO1xuXG5cbiAgICBmdW5jdGlvbiBxdW90ZShzdHJpbmcpIHtcblxuLy8gSWYgdGhlIHN0cmluZyBjb250YWlucyBubyBjb250cm9sIGNoYXJhY3RlcnMsIG5vIHF1b3RlIGNoYXJhY3RlcnMsIGFuZCBub1xuLy8gYmFja3NsYXNoIGNoYXJhY3RlcnMsIHRoZW4gd2UgY2FuIHNhZmVseSBzbGFwIHNvbWUgcXVvdGVzIGFyb3VuZCBpdC5cbi8vIE90aGVyd2lzZSB3ZSBtdXN0IGFsc28gcmVwbGFjZSB0aGUgb2ZmZW5kaW5nIGNoYXJhY3RlcnMgd2l0aCBzYWZlIGVzY2FwZVxuLy8gc2VxdWVuY2VzLlxuXG4gICAgICAgIHJ4X2VzY2FwYWJsZS5sYXN0SW5kZXggPSAwO1xuICAgICAgICByZXR1cm4gcnhfZXNjYXBhYmxlLnRlc3Qoc3RyaW5nKVxuICAgICAgICAgICAgPyBcIlxcXCJcIiArIHN0cmluZy5yZXBsYWNlKHJ4X2VzY2FwYWJsZSwgZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICAgICAgICB2YXIgYyA9IG1ldGFbYV07XG4gICAgICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiBjID09PSBcInN0cmluZ1wiXG4gICAgICAgICAgICAgICAgICAgID8gY1xuICAgICAgICAgICAgICAgICAgICA6IFwiXFxcXHVcIiArIChcIjAwMDBcIiArIGEuY2hhckNvZGVBdCgwKS50b1N0cmluZygxNikpLnNsaWNlKC00KTtcbiAgICAgICAgICAgIH0pICsgXCJcXFwiXCJcbiAgICAgICAgICAgIDogXCJcXFwiXCIgKyBzdHJpbmcgKyBcIlxcXCJcIjtcbiAgICB9XG5cblxuICAgIGZ1bmN0aW9uIHN0cihrZXksIGhvbGRlcikge1xuXG4vLyBQcm9kdWNlIGEgc3RyaW5nIGZyb20gaG9sZGVyW2tleV0uXG5cbiAgICAgICAgdmFyIGk7ICAgICAgICAgIC8vIFRoZSBsb29wIGNvdW50ZXIuXG4gICAgICAgIHZhciBrOyAgICAgICAgICAvLyBUaGUgbWVtYmVyIGtleS5cbiAgICAgICAgdmFyIHY7ICAgICAgICAgIC8vIFRoZSBtZW1iZXIgdmFsdWUuXG4gICAgICAgIHZhciBsZW5ndGg7XG4gICAgICAgIHZhciBtaW5kID0gZ2FwO1xuICAgICAgICB2YXIgcGFydGlhbDtcbiAgICAgICAgdmFyIHZhbHVlID0gaG9sZGVyW2tleV07XG5cbi8vIElmIHRoZSB2YWx1ZSBoYXMgYSB0b0pTT04gbWV0aG9kLCBjYWxsIGl0IHRvIG9idGFpbiBhIHJlcGxhY2VtZW50IHZhbHVlLlxuXG4gICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgJiZcbiAgICAgICAgICAgICAgICB0eXBlb2YgdmFsdWUudG9KU09OID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUudG9KU09OKGtleSk7XG4gICAgICAgIH1cblxuLy8gSWYgd2Ugd2VyZSBjYWxsZWQgd2l0aCBhIHJlcGxhY2VyIGZ1bmN0aW9uLCB0aGVuIGNhbGwgdGhlIHJlcGxhY2VyIHRvXG4vLyBvYnRhaW4gYSByZXBsYWNlbWVudCB2YWx1ZS5cblxuICAgICAgICBpZiAodHlwZW9mIHJlcCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHJlcC5jYWxsKGhvbGRlciwga2V5LCB2YWx1ZSk7XG4gICAgICAgIH1cblxuLy8gV2hhdCBoYXBwZW5zIG5leHQgZGVwZW5kcyBvbiB0aGUgdmFsdWUncyB0eXBlLlxuXG4gICAgICAgIHN3aXRjaCAodHlwZW9mIHZhbHVlKSB7XG4gICAgICAgIGNhc2UgXCJzdHJpbmdcIjpcbiAgICAgICAgICAgIHJldHVybiBxdW90ZSh2YWx1ZSk7XG5cbiAgICAgICAgY2FzZSBcIm51bWJlclwiOlxuXG4vLyBKU09OIG51bWJlcnMgbXVzdCBiZSBmaW5pdGUuIEVuY29kZSBub24tZmluaXRlIG51bWJlcnMgYXMgbnVsbC5cblxuICAgICAgICAgICAgcmV0dXJuIGlzRmluaXRlKHZhbHVlKVxuICAgICAgICAgICAgICAgID8gU3RyaW5nKHZhbHVlKVxuICAgICAgICAgICAgICAgIDogXCJudWxsXCI7XG5cbiAgICAgICAgY2FzZSBcImJvb2xlYW5cIjpcbiAgICAgICAgY2FzZSBcIm51bGxcIjpcblxuLy8gSWYgdGhlIHZhbHVlIGlzIGEgYm9vbGVhbiBvciBudWxsLCBjb252ZXJ0IGl0IHRvIGEgc3RyaW5nLiBOb3RlOlxuLy8gdHlwZW9mIG51bGwgZG9lcyBub3QgcHJvZHVjZSBcIm51bGxcIi4gVGhlIGNhc2UgaXMgaW5jbHVkZWQgaGVyZSBpblxuLy8gdGhlIHJlbW90ZSBjaGFuY2UgdGhhdCB0aGlzIGdldHMgZml4ZWQgc29tZWRheS5cblxuICAgICAgICAgICAgcmV0dXJuIFN0cmluZyh2YWx1ZSk7XG5cbi8vIElmIHRoZSB0eXBlIGlzIFwib2JqZWN0XCIsIHdlIG1pZ2h0IGJlIGRlYWxpbmcgd2l0aCBhbiBvYmplY3Qgb3IgYW4gYXJyYXkgb3Jcbi8vIG51bGwuXG5cbiAgICAgICAgY2FzZSBcIm9iamVjdFwiOlxuXG4vLyBEdWUgdG8gYSBzcGVjaWZpY2F0aW9uIGJsdW5kZXIgaW4gRUNNQVNjcmlwdCwgdHlwZW9mIG51bGwgaXMgXCJvYmplY3RcIixcbi8vIHNvIHdhdGNoIG91dCBmb3IgdGhhdCBjYXNlLlxuXG4gICAgICAgICAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwibnVsbFwiO1xuICAgICAgICAgICAgfVxuXG4vLyBNYWtlIGFuIGFycmF5IHRvIGhvbGQgdGhlIHBhcnRpYWwgcmVzdWx0cyBvZiBzdHJpbmdpZnlpbmcgdGhpcyBvYmplY3QgdmFsdWUuXG5cbiAgICAgICAgICAgIGdhcCArPSBpbmRlbnQ7XG4gICAgICAgICAgICBwYXJ0aWFsID0gW107XG5cbi8vIElzIHRoZSB2YWx1ZSBhbiBhcnJheT9cblxuICAgICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuYXBwbHkodmFsdWUpID09PSBcIltvYmplY3QgQXJyYXldXCIpIHtcblxuLy8gVGhlIHZhbHVlIGlzIGFuIGFycmF5LiBTdHJpbmdpZnkgZXZlcnkgZWxlbWVudC4gVXNlIG51bGwgYXMgYSBwbGFjZWhvbGRlclxuLy8gZm9yIG5vbi1KU09OIHZhbHVlcy5cblxuICAgICAgICAgICAgICAgIGxlbmd0aCA9IHZhbHVlLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgcGFydGlhbFtpXSA9IHN0cihpLCB2YWx1ZSkgfHwgXCJudWxsXCI7XG4gICAgICAgICAgICAgICAgfVxuXG4vLyBKb2luIGFsbCBvZiB0aGUgZWxlbWVudHMgdG9nZXRoZXIsIHNlcGFyYXRlZCB3aXRoIGNvbW1hcywgYW5kIHdyYXAgdGhlbSBpblxuLy8gYnJhY2tldHMuXG5cbiAgICAgICAgICAgICAgICB2ID0gcGFydGlhbC5sZW5ndGggPT09IDBcbiAgICAgICAgICAgICAgICAgICAgPyBcIltdXCJcbiAgICAgICAgICAgICAgICAgICAgOiBnYXBcbiAgICAgICAgICAgICAgICAgICAgICAgID8gXCJbXFxuXCIgKyBnYXAgKyBwYXJ0aWFsLmpvaW4oXCIsXFxuXCIgKyBnYXApICsgXCJcXG5cIiArIG1pbmQgKyBcIl1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgOiBcIltcIiArIHBhcnRpYWwuam9pbihcIixcIikgKyBcIl1cIjtcbiAgICAgICAgICAgICAgICBnYXAgPSBtaW5kO1xuICAgICAgICAgICAgICAgIHJldHVybiB2O1xuICAgICAgICAgICAgfVxuXG4vLyBJZiB0aGUgcmVwbGFjZXIgaXMgYW4gYXJyYXksIHVzZSBpdCB0byBzZWxlY3QgdGhlIG1lbWJlcnMgdG8gYmUgc3RyaW5naWZpZWQuXG5cbiAgICAgICAgICAgIGlmIChyZXAgJiYgdHlwZW9mIHJlcCA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgICAgIGxlbmd0aCA9IHJlcC5sZW5ndGg7XG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcmVwW2ldID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBrID0gcmVwW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgdiA9IHN0cihrLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpYWwucHVzaChxdW90ZShrKSArIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2FwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IFwiOiBcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBcIjpcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgKyB2KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbi8vIE90aGVyd2lzZSwgaXRlcmF0ZSB0aHJvdWdoIGFsbCBvZiB0aGUga2V5cyBpbiB0aGUgb2JqZWN0LlxuXG4gICAgICAgICAgICAgICAgZm9yIChrIGluIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodmFsdWUsIGspKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2ID0gc3RyKGssIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydGlhbC5wdXNoKHF1b3RlKGspICsgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnYXBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gXCI6IFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFwiOlwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSArIHYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4vLyBKb2luIGFsbCBvZiB0aGUgbWVtYmVyIHRleHRzIHRvZ2V0aGVyLCBzZXBhcmF0ZWQgd2l0aCBjb21tYXMsXG4vLyBhbmQgd3JhcCB0aGVtIGluIGJyYWNlcy5cblxuICAgICAgICAgICAgdiA9IHBhcnRpYWwubGVuZ3RoID09PSAwXG4gICAgICAgICAgICAgICAgPyBcInt9XCJcbiAgICAgICAgICAgICAgICA6IGdhcFxuICAgICAgICAgICAgICAgICAgICA/IFwie1xcblwiICsgZ2FwICsgcGFydGlhbC5qb2luKFwiLFxcblwiICsgZ2FwKSArIFwiXFxuXCIgKyBtaW5kICsgXCJ9XCJcbiAgICAgICAgICAgICAgICAgICAgOiBcIntcIiArIHBhcnRpYWwuam9pbihcIixcIikgKyBcIn1cIjtcbiAgICAgICAgICAgIGdhcCA9IG1pbmQ7XG4gICAgICAgICAgICByZXR1cm4gdjtcbiAgICAgICAgfVxuICAgIH1cblxuLy8gSWYgdGhlIEpTT04gb2JqZWN0IGRvZXMgbm90IHlldCBoYXZlIGEgc3RyaW5naWZ5IG1ldGhvZCwgZ2l2ZSBpdCBvbmUuXG5cbiAgICBpZiAodHlwZW9mIEpTT04uc3RyaW5naWZ5ICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgbWV0YSA9IHsgICAgLy8gdGFibGUgb2YgY2hhcmFjdGVyIHN1YnN0aXR1dGlvbnNcbiAgICAgICAgICAgIFwiXFxiXCI6IFwiXFxcXGJcIixcbiAgICAgICAgICAgIFwiXFx0XCI6IFwiXFxcXHRcIixcbiAgICAgICAgICAgIFwiXFxuXCI6IFwiXFxcXG5cIixcbiAgICAgICAgICAgIFwiXFxmXCI6IFwiXFxcXGZcIixcbiAgICAgICAgICAgIFwiXFxyXCI6IFwiXFxcXHJcIixcbiAgICAgICAgICAgIFwiXFxcIlwiOiBcIlxcXFxcXFwiXCIsXG4gICAgICAgICAgICBcIlxcXFxcIjogXCJcXFxcXFxcXFwiXG4gICAgICAgIH07XG4gICAgICAgIEpTT04uc3RyaW5naWZ5ID0gZnVuY3Rpb24gKHZhbHVlLCByZXBsYWNlciwgc3BhY2UpIHtcblxuLy8gVGhlIHN0cmluZ2lmeSBtZXRob2QgdGFrZXMgYSB2YWx1ZSBhbmQgYW4gb3B0aW9uYWwgcmVwbGFjZXIsIGFuZCBhbiBvcHRpb25hbFxuLy8gc3BhY2UgcGFyYW1ldGVyLCBhbmQgcmV0dXJucyBhIEpTT04gdGV4dC4gVGhlIHJlcGxhY2VyIGNhbiBiZSBhIGZ1bmN0aW9uXG4vLyB0aGF0IGNhbiByZXBsYWNlIHZhbHVlcywgb3IgYW4gYXJyYXkgb2Ygc3RyaW5ncyB0aGF0IHdpbGwgc2VsZWN0IHRoZSBrZXlzLlxuLy8gQSBkZWZhdWx0IHJlcGxhY2VyIG1ldGhvZCBjYW4gYmUgcHJvdmlkZWQuIFVzZSBvZiB0aGUgc3BhY2UgcGFyYW1ldGVyIGNhblxuLy8gcHJvZHVjZSB0ZXh0IHRoYXQgaXMgbW9yZSBlYXNpbHkgcmVhZGFibGUuXG5cbiAgICAgICAgICAgIHZhciBpO1xuICAgICAgICAgICAgZ2FwID0gXCJcIjtcbiAgICAgICAgICAgIGluZGVudCA9IFwiXCI7XG5cbi8vIElmIHRoZSBzcGFjZSBwYXJhbWV0ZXIgaXMgYSBudW1iZXIsIG1ha2UgYW4gaW5kZW50IHN0cmluZyBjb250YWluaW5nIHRoYXRcbi8vIG1hbnkgc3BhY2VzLlxuXG4gICAgICAgICAgICBpZiAodHlwZW9mIHNwYWNlID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IHNwYWNlOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5kZW50ICs9IFwiIFwiO1xuICAgICAgICAgICAgICAgIH1cblxuLy8gSWYgdGhlIHNwYWNlIHBhcmFtZXRlciBpcyBhIHN0cmluZywgaXQgd2lsbCBiZSB1c2VkIGFzIHRoZSBpbmRlbnQgc3RyaW5nLlxuXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBzcGFjZSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgIGluZGVudCA9IHNwYWNlO1xuICAgICAgICAgICAgfVxuXG4vLyBJZiB0aGVyZSBpcyBhIHJlcGxhY2VyLCBpdCBtdXN0IGJlIGEgZnVuY3Rpb24gb3IgYW4gYXJyYXkuXG4vLyBPdGhlcndpc2UsIHRocm93IGFuIGVycm9yLlxuXG4gICAgICAgICAgICByZXAgPSByZXBsYWNlcjtcbiAgICAgICAgICAgIGlmIChyZXBsYWNlciAmJiB0eXBlb2YgcmVwbGFjZXIgIT09IFwiZnVuY3Rpb25cIiAmJlxuICAgICAgICAgICAgICAgICAgICAodHlwZW9mIHJlcGxhY2VyICE9PSBcIm9iamVjdFwiIHx8XG4gICAgICAgICAgICAgICAgICAgIHR5cGVvZiByZXBsYWNlci5sZW5ndGggIT09IFwibnVtYmVyXCIpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSlNPTi5zdHJpbmdpZnlcIik7XG4gICAgICAgICAgICB9XG5cbi8vIE1ha2UgYSBmYWtlIHJvb3Qgb2JqZWN0IGNvbnRhaW5pbmcgb3VyIHZhbHVlIHVuZGVyIHRoZSBrZXkgb2YgXCJcIi5cbi8vIFJldHVybiB0aGUgcmVzdWx0IG9mIHN0cmluZ2lmeWluZyB0aGUgdmFsdWUuXG5cbiAgICAgICAgICAgIHJldHVybiBzdHIoXCJcIiwge1wiXCI6IHZhbHVlfSk7XG4gICAgICAgIH07XG4gICAgfVxuXG5cbi8vIElmIHRoZSBKU09OIG9iamVjdCBkb2VzIG5vdCB5ZXQgaGF2ZSBhIHBhcnNlIG1ldGhvZCwgZ2l2ZSBpdCBvbmUuXG5cbiAgICBpZiAodHlwZW9mIEpTT04ucGFyc2UgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBKU09OLnBhcnNlID0gZnVuY3Rpb24gKHRleHQsIHJldml2ZXIpIHtcblxuLy8gVGhlIHBhcnNlIG1ldGhvZCB0YWtlcyBhIHRleHQgYW5kIGFuIG9wdGlvbmFsIHJldml2ZXIgZnVuY3Rpb24sIGFuZCByZXR1cm5zXG4vLyBhIEphdmFTY3JpcHQgdmFsdWUgaWYgdGhlIHRleHQgaXMgYSB2YWxpZCBKU09OIHRleHQuXG5cbiAgICAgICAgICAgIHZhciBqO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiB3YWxrKGhvbGRlciwga2V5KSB7XG5cbi8vIFRoZSB3YWxrIG1ldGhvZCBpcyB1c2VkIHRvIHJlY3Vyc2l2ZWx5IHdhbGsgdGhlIHJlc3VsdGluZyBzdHJ1Y3R1cmUgc29cbi8vIHRoYXQgbW9kaWZpY2F0aW9ucyBjYW4gYmUgbWFkZS5cblxuICAgICAgICAgICAgICAgIHZhciBrO1xuICAgICAgICAgICAgICAgIHZhciB2O1xuICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IGhvbGRlcltrZXldO1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChrIGluIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCBrKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHYgPSB3YWxrKHZhbHVlLCBrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlW2tdID0gdjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgdmFsdWVba107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiByZXZpdmVyLmNhbGwoaG9sZGVyLCBrZXksIHZhbHVlKTtcbiAgICAgICAgICAgIH1cblxuXG4vLyBQYXJzaW5nIGhhcHBlbnMgaW4gZm91ciBzdGFnZXMuIEluIHRoZSBmaXJzdCBzdGFnZSwgd2UgcmVwbGFjZSBjZXJ0YWluXG4vLyBVbmljb2RlIGNoYXJhY3RlcnMgd2l0aCBlc2NhcGUgc2VxdWVuY2VzLiBKYXZhU2NyaXB0IGhhbmRsZXMgbWFueSBjaGFyYWN0ZXJzXG4vLyBpbmNvcnJlY3RseSwgZWl0aGVyIHNpbGVudGx5IGRlbGV0aW5nIHRoZW0sIG9yIHRyZWF0aW5nIHRoZW0gYXMgbGluZSBlbmRpbmdzLlxuXG4gICAgICAgICAgICB0ZXh0ID0gU3RyaW5nKHRleHQpO1xuICAgICAgICAgICAgcnhfZGFuZ2Vyb3VzLmxhc3RJbmRleCA9IDA7XG4gICAgICAgICAgICBpZiAocnhfZGFuZ2Vyb3VzLnRlc3QodGV4dCkpIHtcbiAgICAgICAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKHJ4X2Rhbmdlcm91cywgZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiXFxcXHVcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKFwiMDAwMFwiICsgYS5jaGFyQ29kZUF0KDApLnRvU3RyaW5nKDE2KSkuc2xpY2UoLTQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4vLyBJbiB0aGUgc2Vjb25kIHN0YWdlLCB3ZSBydW4gdGhlIHRleHQgYWdhaW5zdCByZWd1bGFyIGV4cHJlc3Npb25zIHRoYXQgbG9va1xuLy8gZm9yIG5vbi1KU09OIHBhdHRlcm5zLiBXZSBhcmUgZXNwZWNpYWxseSBjb25jZXJuZWQgd2l0aCBcIigpXCIgYW5kIFwibmV3XCJcbi8vIGJlY2F1c2UgdGhleSBjYW4gY2F1c2UgaW52b2NhdGlvbiwgYW5kIFwiPVwiIGJlY2F1c2UgaXQgY2FuIGNhdXNlIG11dGF0aW9uLlxuLy8gQnV0IGp1c3QgdG8gYmUgc2FmZSwgd2Ugd2FudCB0byByZWplY3QgYWxsIHVuZXhwZWN0ZWQgZm9ybXMuXG5cbi8vIFdlIHNwbGl0IHRoZSBzZWNvbmQgc3RhZ2UgaW50byA0IHJlZ2V4cCBvcGVyYXRpb25zIGluIG9yZGVyIHRvIHdvcmsgYXJvdW5kXG4vLyBjcmlwcGxpbmcgaW5lZmZpY2llbmNpZXMgaW4gSUUncyBhbmQgU2FmYXJpJ3MgcmVnZXhwIGVuZ2luZXMuIEZpcnN0IHdlXG4vLyByZXBsYWNlIHRoZSBKU09OIGJhY2tzbGFzaCBwYWlycyB3aXRoIFwiQFwiIChhIG5vbi1KU09OIGNoYXJhY3RlcikuIFNlY29uZCwgd2Vcbi8vIHJlcGxhY2UgYWxsIHNpbXBsZSB2YWx1ZSB0b2tlbnMgd2l0aCBcIl1cIiBjaGFyYWN0ZXJzLiBUaGlyZCwgd2UgZGVsZXRlIGFsbFxuLy8gb3BlbiBicmFja2V0cyB0aGF0IGZvbGxvdyBhIGNvbG9uIG9yIGNvbW1hIG9yIHRoYXQgYmVnaW4gdGhlIHRleHQuIEZpbmFsbHksXG4vLyB3ZSBsb29rIHRvIHNlZSB0aGF0IHRoZSByZW1haW5pbmcgY2hhcmFjdGVycyBhcmUgb25seSB3aGl0ZXNwYWNlIG9yIFwiXVwiIG9yXG4vLyBcIixcIiBvciBcIjpcIiBvciBcIntcIiBvciBcIn1cIi4gSWYgdGhhdCBpcyBzbywgdGhlbiB0aGUgdGV4dCBpcyBzYWZlIGZvciBldmFsLlxuXG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgcnhfb25lLnRlc3QoXG4gICAgICAgICAgICAgICAgICAgIHRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKHJ4X3R3bywgXCJAXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZShyeF90aHJlZSwgXCJdXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZShyeF9mb3VyLCBcIlwiKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICkge1xuXG4vLyBJbiB0aGUgdGhpcmQgc3RhZ2Ugd2UgdXNlIHRoZSBldmFsIGZ1bmN0aW9uIHRvIGNvbXBpbGUgdGhlIHRleHQgaW50byBhXG4vLyBKYXZhU2NyaXB0IHN0cnVjdHVyZS4gVGhlIFwie1wiIG9wZXJhdG9yIGlzIHN1YmplY3QgdG8gYSBzeW50YWN0aWMgYW1iaWd1aXR5XG4vLyBpbiBKYXZhU2NyaXB0OiBpdCBjYW4gYmVnaW4gYSBibG9jayBvciBhbiBvYmplY3QgbGl0ZXJhbC4gV2Ugd3JhcCB0aGUgdGV4dFxuLy8gaW4gcGFyZW5zIHRvIGVsaW1pbmF0ZSB0aGUgYW1iaWd1aXR5LlxuXG4gICAgICAgICAgICAgICAgaiA9IGV2YWwoXCIoXCIgKyB0ZXh0ICsgXCIpXCIpO1xuXG4vLyBJbiB0aGUgb3B0aW9uYWwgZm91cnRoIHN0YWdlLCB3ZSByZWN1cnNpdmVseSB3YWxrIHRoZSBuZXcgc3RydWN0dXJlLCBwYXNzaW5nXG4vLyBlYWNoIG5hbWUvdmFsdWUgcGFpciB0byBhIHJldml2ZXIgZnVuY3Rpb24gZm9yIHBvc3NpYmxlIHRyYW5zZm9ybWF0aW9uLlxuXG4gICAgICAgICAgICAgICAgcmV0dXJuICh0eXBlb2YgcmV2aXZlciA9PT0gXCJmdW5jdGlvblwiKVxuICAgICAgICAgICAgICAgICAgICA/IHdhbGsoe1wiXCI6IGp9LCBcIlwiKVxuICAgICAgICAgICAgICAgICAgICA6IGo7XG4gICAgICAgICAgICB9XG5cbi8vIElmIHRoZSB0ZXh0IGlzIG5vdCBKU09OIHBhcnNlYWJsZSwgdGhlbiBhIFN5bnRheEVycm9yIGlzIHRocm93bi5cblxuICAgICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFwiSlNPTi5wYXJzZVwiKTtcbiAgICAgICAgfTtcbiAgICB9XG59KCkpOyIsInZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJylcbnZhciBzbGljZSA9IHV0aWwuc2xpY2VcbnZhciBwbHVjayA9IHV0aWwucGx1Y2tcbnZhciBlYWNoID0gdXRpbC5lYWNoXG52YXIgYmluZCA9IHV0aWwuYmluZFxudmFyIGNyZWF0ZSA9IHV0aWwuY3JlYXRlXG52YXIgaXNMaXN0ID0gdXRpbC5pc0xpc3RcbnZhciBpc0Z1bmN0aW9uID0gdXRpbC5pc0Z1bmN0aW9uXG52YXIgaXNPYmplY3QgPSB1dGlsLmlzT2JqZWN0XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRjcmVhdGVTdG9yZTogY3JlYXRlU3RvcmVcbn1cblxudmFyIHN0b3JlQVBJID0ge1xuXHR2ZXJzaW9uOiAnMi4wLjEyJyxcblx0ZW5hYmxlZDogZmFsc2UsXG5cdFxuXHQvLyBnZXQgcmV0dXJucyB0aGUgdmFsdWUgb2YgdGhlIGdpdmVuIGtleS4gSWYgdGhhdCB2YWx1ZVxuXHQvLyBpcyB1bmRlZmluZWQsIGl0IHJldHVybnMgb3B0aW9uYWxEZWZhdWx0VmFsdWUgaW5zdGVhZC5cblx0Z2V0OiBmdW5jdGlvbihrZXksIG9wdGlvbmFsRGVmYXVsdFZhbHVlKSB7XG5cdFx0dmFyIGRhdGEgPSB0aGlzLnN0b3JhZ2UucmVhZCh0aGlzLl9uYW1lc3BhY2VQcmVmaXggKyBrZXkpXG5cdFx0cmV0dXJuIHRoaXMuX2Rlc2VyaWFsaXplKGRhdGEsIG9wdGlvbmFsRGVmYXVsdFZhbHVlKVxuXHR9LFxuXG5cdC8vIHNldCB3aWxsIHN0b3JlIHRoZSBnaXZlbiB2YWx1ZSBhdCBrZXkgYW5kIHJldHVybnMgdmFsdWUuXG5cdC8vIENhbGxpbmcgc2V0IHdpdGggdmFsdWUgPT09IHVuZGVmaW5lZCBpcyBlcXVpdmFsZW50IHRvIGNhbGxpbmcgcmVtb3ZlLlxuXHRzZXQ6IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcblx0XHRpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cmV0dXJuIHRoaXMucmVtb3ZlKGtleSlcblx0XHR9XG5cdFx0dGhpcy5zdG9yYWdlLndyaXRlKHRoaXMuX25hbWVzcGFjZVByZWZpeCArIGtleSwgdGhpcy5fc2VyaWFsaXplKHZhbHVlKSlcblx0XHRyZXR1cm4gdmFsdWVcblx0fSxcblxuXHQvLyByZW1vdmUgZGVsZXRlcyB0aGUga2V5IGFuZCB2YWx1ZSBzdG9yZWQgYXQgdGhlIGdpdmVuIGtleS5cblx0cmVtb3ZlOiBmdW5jdGlvbihrZXkpIHtcblx0XHR0aGlzLnN0b3JhZ2UucmVtb3ZlKHRoaXMuX25hbWVzcGFjZVByZWZpeCArIGtleSlcblx0fSxcblxuXHQvLyBlYWNoIHdpbGwgY2FsbCB0aGUgZ2l2ZW4gY2FsbGJhY2sgb25jZSBmb3IgZWFjaCBrZXktdmFsdWUgcGFpclxuXHQvLyBpbiB0aGlzIHN0b3JlLlxuXHRlYWNoOiBmdW5jdGlvbihjYWxsYmFjaykge1xuXHRcdHZhciBzZWxmID0gdGhpc1xuXHRcdHRoaXMuc3RvcmFnZS5lYWNoKGZ1bmN0aW9uKHZhbCwgbmFtZXNwYWNlZEtleSkge1xuXHRcdFx0Y2FsbGJhY2suY2FsbChzZWxmLCBzZWxmLl9kZXNlcmlhbGl6ZSh2YWwpLCAobmFtZXNwYWNlZEtleSB8fCAnJykucmVwbGFjZShzZWxmLl9uYW1lc3BhY2VSZWdleHAsICcnKSlcblx0XHR9KVxuXHR9LFxuXG5cdC8vIGNsZWFyQWxsIHdpbGwgcmVtb3ZlIGFsbCB0aGUgc3RvcmVkIGtleS12YWx1ZSBwYWlycyBpbiB0aGlzIHN0b3JlLlxuXHRjbGVhckFsbDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5zdG9yYWdlLmNsZWFyQWxsKClcblx0fSxcblxuXHQvLyBhZGRpdGlvbmFsIGZ1bmN0aW9uYWxpdHkgdGhhdCBjYW4ndCBsaXZlIGluIHBsdWdpbnNcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblx0Ly8gaGFzTmFtZXNwYWNlIHJldHVybnMgdHJ1ZSBpZiB0aGlzIHN0b3JlIGluc3RhbmNlIGhhcyB0aGUgZ2l2ZW4gbmFtZXNwYWNlLlxuXHRoYXNOYW1lc3BhY2U6IGZ1bmN0aW9uKG5hbWVzcGFjZSkge1xuXHRcdHJldHVybiAodGhpcy5fbmFtZXNwYWNlUHJlZml4ID09ICdfX3N0b3JlanNfJytuYW1lc3BhY2UrJ18nKVxuXHR9LFxuXG5cdC8vIGNyZWF0ZVN0b3JlIGNyZWF0ZXMgYSBzdG9yZS5qcyBpbnN0YW5jZSB3aXRoIHRoZSBmaXJzdFxuXHQvLyBmdW5jdGlvbmluZyBzdG9yYWdlIGluIHRoZSBsaXN0IG9mIHN0b3JhZ2UgY2FuZGlkYXRlcyxcblx0Ly8gYW5kIGFwcGxpZXMgdGhlIHRoZSBnaXZlbiBtaXhpbnMgdG8gdGhlIGluc3RhbmNlLlxuXHRjcmVhdGVTdG9yZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIGNyZWF0ZVN0b3JlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcblx0fSxcblx0XG5cdGFkZFBsdWdpbjogZnVuY3Rpb24ocGx1Z2luKSB7XG5cdFx0dGhpcy5fYWRkUGx1Z2luKHBsdWdpbilcblx0fSxcblx0XG5cdG5hbWVzcGFjZTogZnVuY3Rpb24obmFtZXNwYWNlKSB7XG5cdFx0cmV0dXJuIGNyZWF0ZVN0b3JlKHRoaXMuc3RvcmFnZSwgdGhpcy5wbHVnaW5zLCBuYW1lc3BhY2UpXG5cdH1cbn1cblxuZnVuY3Rpb24gX3dhcm4oKSB7XG5cdHZhciBfY29uc29sZSA9ICh0eXBlb2YgY29uc29sZSA9PSAndW5kZWZpbmVkJyA/IG51bGwgOiBjb25zb2xlKVxuXHRpZiAoIV9jb25zb2xlKSB7IHJldHVybiB9XG5cdHZhciBmbiA9IChfY29uc29sZS53YXJuID8gX2NvbnNvbGUud2FybiA6IF9jb25zb2xlLmxvZylcblx0Zm4uYXBwbHkoX2NvbnNvbGUsIGFyZ3VtZW50cylcbn1cblxuZnVuY3Rpb24gY3JlYXRlU3RvcmUoc3RvcmFnZXMsIHBsdWdpbnMsIG5hbWVzcGFjZSkge1xuXHRpZiAoIW5hbWVzcGFjZSkge1xuXHRcdG5hbWVzcGFjZSA9ICcnXG5cdH1cblx0aWYgKHN0b3JhZ2VzICYmICFpc0xpc3Qoc3RvcmFnZXMpKSB7XG5cdFx0c3RvcmFnZXMgPSBbc3RvcmFnZXNdXG5cdH1cblx0aWYgKHBsdWdpbnMgJiYgIWlzTGlzdChwbHVnaW5zKSkge1xuXHRcdHBsdWdpbnMgPSBbcGx1Z2luc11cblx0fVxuXG5cdHZhciBuYW1lc3BhY2VQcmVmaXggPSAobmFtZXNwYWNlID8gJ19fc3RvcmVqc18nK25hbWVzcGFjZSsnXycgOiAnJylcblx0dmFyIG5hbWVzcGFjZVJlZ2V4cCA9IChuYW1lc3BhY2UgPyBuZXcgUmVnRXhwKCdeJytuYW1lc3BhY2VQcmVmaXgpIDogbnVsbClcblx0dmFyIGxlZ2FsTmFtZXNwYWNlcyA9IC9eW2EtekEtWjAtOV9cXC1dKiQvIC8vIGFscGhhLW51bWVyaWMgKyB1bmRlcnNjb3JlIGFuZCBkYXNoXG5cdGlmICghbGVnYWxOYW1lc3BhY2VzLnRlc3QobmFtZXNwYWNlKSkge1xuXHRcdHRocm93IG5ldyBFcnJvcignc3RvcmUuanMgbmFtZXNwYWNlcyBjYW4gb25seSBoYXZlIGFscGhhbnVtZXJpY3MgKyB1bmRlcnNjb3JlcyBhbmQgZGFzaGVzJylcblx0fVxuXHRcblx0dmFyIF9wcml2YXRlU3RvcmVQcm9wcyA9IHtcblx0XHRfbmFtZXNwYWNlUHJlZml4OiBuYW1lc3BhY2VQcmVmaXgsXG5cdFx0X25hbWVzcGFjZVJlZ2V4cDogbmFtZXNwYWNlUmVnZXhwLFxuXG5cdFx0X3Rlc3RTdG9yYWdlOiBmdW5jdGlvbihzdG9yYWdlKSB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHR2YXIgdGVzdFN0ciA9ICdfX3N0b3JlanNfX3Rlc3RfXydcblx0XHRcdFx0c3RvcmFnZS53cml0ZSh0ZXN0U3RyLCB0ZXN0U3RyKVxuXHRcdFx0XHR2YXIgb2sgPSAoc3RvcmFnZS5yZWFkKHRlc3RTdHIpID09PSB0ZXN0U3RyKVxuXHRcdFx0XHRzdG9yYWdlLnJlbW92ZSh0ZXN0U3RyKVxuXHRcdFx0XHRyZXR1cm4gb2tcblx0XHRcdH0gY2F0Y2goZSkge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0X2Fzc2lnblBsdWdpbkZuUHJvcDogZnVuY3Rpb24ocGx1Z2luRm5Qcm9wLCBwcm9wTmFtZSkge1xuXHRcdFx0dmFyIG9sZEZuID0gdGhpc1twcm9wTmFtZV1cblx0XHRcdHRoaXNbcHJvcE5hbWVdID0gZnVuY3Rpb24gcGx1Z2luRm4oKSB7XG5cdFx0XHRcdHZhciBhcmdzID0gc2xpY2UoYXJndW1lbnRzLCAwKVxuXHRcdFx0XHR2YXIgc2VsZiA9IHRoaXNcblxuXHRcdFx0XHQvLyBzdXBlcl9mbiBjYWxscyB0aGUgb2xkIGZ1bmN0aW9uIHdoaWNoIHdhcyBvdmVyd3JpdHRlbiBieVxuXHRcdFx0XHQvLyB0aGlzIG1peGluLlxuXHRcdFx0XHRmdW5jdGlvbiBzdXBlcl9mbigpIHtcblx0XHRcdFx0XHRpZiAoIW9sZEZuKSB7IHJldHVybiB9XG5cdFx0XHRcdFx0ZWFjaChhcmd1bWVudHMsIGZ1bmN0aW9uKGFyZywgaSkge1xuXHRcdFx0XHRcdFx0YXJnc1tpXSA9IGFyZ1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0cmV0dXJuIG9sZEZuLmFwcGx5KHNlbGYsIGFyZ3MpXG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBHaXZlIG1peGluZyBmdW5jdGlvbiBhY2Nlc3MgdG8gc3VwZXJfZm4gYnkgcHJlZml4aW5nIGFsbCBtaXhpbiBmdW5jdGlvblxuXHRcdFx0XHQvLyBhcmd1bWVudHMgd2l0aCBzdXBlcl9mbi5cblx0XHRcdFx0dmFyIG5ld0ZuQXJncyA9IFtzdXBlcl9mbl0uY29uY2F0KGFyZ3MpXG5cblx0XHRcdFx0cmV0dXJuIHBsdWdpbkZuUHJvcC5hcHBseShzZWxmLCBuZXdGbkFyZ3MpXG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdF9zZXJpYWxpemU6IGZ1bmN0aW9uKG9iaikge1xuXHRcdFx0cmV0dXJuIEpTT04uc3RyaW5naWZ5KG9iailcblx0XHR9LFxuXG5cdFx0X2Rlc2VyaWFsaXplOiBmdW5jdGlvbihzdHJWYWwsIGRlZmF1bHRWYWwpIHtcblx0XHRcdGlmICghc3RyVmFsKSB7IHJldHVybiBkZWZhdWx0VmFsIH1cblx0XHRcdC8vIEl0IGlzIHBvc3NpYmxlIHRoYXQgYSByYXcgc3RyaW5nIHZhbHVlIGhhcyBiZWVuIHByZXZpb3VzbHkgc3RvcmVkXG5cdFx0XHQvLyBpbiBhIHN0b3JhZ2Ugd2l0aG91dCB1c2luZyBzdG9yZS5qcywgbWVhbmluZyBpdCB3aWxsIGJlIGEgcmF3XG5cdFx0XHQvLyBzdHJpbmcgdmFsdWUgaW5zdGVhZCBvZiBhIEpTT04gc2VyaWFsaXplZCBzdHJpbmcuIEJ5IGRlZmF1bHRpbmdcblx0XHRcdC8vIHRvIHRoZSByYXcgc3RyaW5nIHZhbHVlIGluIGNhc2Ugb2YgYSBKU09OIHBhcnNlIGVycm9yLCB3ZSBhbGxvd1xuXHRcdFx0Ly8gZm9yIHBhc3Qgc3RvcmVkIHZhbHVlcyB0byBiZSBmb3J3YXJkcy1jb21wYXRpYmxlIHdpdGggc3RvcmUuanNcblx0XHRcdHZhciB2YWwgPSAnJ1xuXHRcdFx0dHJ5IHsgdmFsID0gSlNPTi5wYXJzZShzdHJWYWwpIH1cblx0XHRcdGNhdGNoKGUpIHsgdmFsID0gc3RyVmFsIH1cblxuXHRcdFx0cmV0dXJuICh2YWwgIT09IHVuZGVmaW5lZCA/IHZhbCA6IGRlZmF1bHRWYWwpXG5cdFx0fSxcblx0XHRcblx0XHRfYWRkU3RvcmFnZTogZnVuY3Rpb24oc3RvcmFnZSkge1xuXHRcdFx0aWYgKHRoaXMuZW5hYmxlZCkgeyByZXR1cm4gfVxuXHRcdFx0aWYgKHRoaXMuX3Rlc3RTdG9yYWdlKHN0b3JhZ2UpKSB7XG5cdFx0XHRcdHRoaXMuc3RvcmFnZSA9IHN0b3JhZ2Vcblx0XHRcdFx0dGhpcy5lbmFibGVkID0gdHJ1ZVxuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRfYWRkUGx1Z2luOiBmdW5jdGlvbihwbHVnaW4pIHtcblx0XHRcdHZhciBzZWxmID0gdGhpc1xuXG5cdFx0XHQvLyBJZiB0aGUgcGx1Z2luIGlzIGFuIGFycmF5LCB0aGVuIGFkZCBhbGwgcGx1Z2lucyBpbiB0aGUgYXJyYXkuXG5cdFx0XHQvLyBUaGlzIGFsbG93cyBmb3IgYSBwbHVnaW4gdG8gZGVwZW5kIG9uIG90aGVyIHBsdWdpbnMuXG5cdFx0XHRpZiAoaXNMaXN0KHBsdWdpbikpIHtcblx0XHRcdFx0ZWFjaChwbHVnaW4sIGZ1bmN0aW9uKHBsdWdpbikge1xuXHRcdFx0XHRcdHNlbGYuX2FkZFBsdWdpbihwbHVnaW4pXG5cdFx0XHRcdH0pXG5cdFx0XHRcdHJldHVyblxuXHRcdFx0fVxuXG5cdFx0XHQvLyBLZWVwIHRyYWNrIG9mIGFsbCBwbHVnaW5zIHdlJ3ZlIHNlZW4gc28gZmFyLCBzbyB0aGF0IHdlXG5cdFx0XHQvLyBkb24ndCBhZGQgYW55IG9mIHRoZW0gdHdpY2UuXG5cdFx0XHR2YXIgc2VlblBsdWdpbiA9IHBsdWNrKHRoaXMucGx1Z2lucywgZnVuY3Rpb24oc2VlblBsdWdpbikge1xuXHRcdFx0XHRyZXR1cm4gKHBsdWdpbiA9PT0gc2VlblBsdWdpbilcblx0XHRcdH0pXG5cdFx0XHRpZiAoc2VlblBsdWdpbikge1xuXHRcdFx0XHRyZXR1cm5cblx0XHRcdH1cblx0XHRcdHRoaXMucGx1Z2lucy5wdXNoKHBsdWdpbilcblxuXHRcdFx0Ly8gQ2hlY2sgdGhhdCB0aGUgcGx1Z2luIGlzIHByb3Blcmx5IGZvcm1lZFxuXHRcdFx0aWYgKCFpc0Z1bmN0aW9uKHBsdWdpbikpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdQbHVnaW5zIG11c3QgYmUgZnVuY3Rpb24gdmFsdWVzIHRoYXQgcmV0dXJuIG9iamVjdHMnKVxuXHRcdFx0fVxuXG5cdFx0XHR2YXIgcGx1Z2luUHJvcGVydGllcyA9IHBsdWdpbi5jYWxsKHRoaXMpXG5cdFx0XHRpZiAoIWlzT2JqZWN0KHBsdWdpblByb3BlcnRpZXMpKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcignUGx1Z2lucyBtdXN0IHJldHVybiBhbiBvYmplY3Qgb2YgZnVuY3Rpb24gcHJvcGVydGllcycpXG5cdFx0XHR9XG5cblx0XHRcdC8vIEFkZCB0aGUgcGx1Z2luIGZ1bmN0aW9uIHByb3BlcnRpZXMgdG8gdGhpcyBzdG9yZSBpbnN0YW5jZS5cblx0XHRcdGVhY2gocGx1Z2luUHJvcGVydGllcywgZnVuY3Rpb24ocGx1Z2luRm5Qcm9wLCBwcm9wTmFtZSkge1xuXHRcdFx0XHRpZiAoIWlzRnVuY3Rpb24ocGx1Z2luRm5Qcm9wKSkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcignQmFkIHBsdWdpbiBwcm9wZXJ0eTogJytwcm9wTmFtZSsnIGZyb20gcGx1Z2luICcrcGx1Z2luLm5hbWUrJy4gUGx1Z2lucyBzaG91bGQgb25seSByZXR1cm4gZnVuY3Rpb25zLicpXG5cdFx0XHRcdH1cblx0XHRcdFx0c2VsZi5fYXNzaWduUGx1Z2luRm5Qcm9wKHBsdWdpbkZuUHJvcCwgcHJvcE5hbWUpXG5cdFx0XHR9KVxuXHRcdH0sXG5cdFx0XG5cdFx0Ly8gUHV0IGRlcHJlY2F0ZWQgcHJvcGVydGllcyBpbiB0aGUgcHJpdmF0ZSBBUEksIHNvIGFzIHRvIG5vdCBleHBvc2UgaXQgdG8gYWNjaWRlbnRpYWxcblx0XHQvLyBkaXNjb3ZlcnkgdGhyb3VnaCBpbnNwZWN0aW9uIG9mIHRoZSBzdG9yZSBvYmplY3QuXG5cdFx0XG5cdFx0Ly8gRGVwcmVjYXRlZDogYWRkU3RvcmFnZVxuXHRcdGFkZFN0b3JhZ2U6IGZ1bmN0aW9uKHN0b3JhZ2UpIHtcblx0XHRcdF93YXJuKCdzdG9yZS5hZGRTdG9yYWdlKHN0b3JhZ2UpIGlzIGRlcHJlY2F0ZWQuIFVzZSBjcmVhdGVTdG9yZShbc3RvcmFnZXNdKScpXG5cdFx0XHR0aGlzLl9hZGRTdG9yYWdlKHN0b3JhZ2UpXG5cdFx0fVxuXHR9XG5cblx0dmFyIHN0b3JlID0gY3JlYXRlKF9wcml2YXRlU3RvcmVQcm9wcywgc3RvcmVBUEksIHtcblx0XHRwbHVnaW5zOiBbXVxuXHR9KVxuXHRzdG9yZS5yYXcgPSB7fVxuXHRlYWNoKHN0b3JlLCBmdW5jdGlvbihwcm9wLCBwcm9wTmFtZSkge1xuXHRcdGlmIChpc0Z1bmN0aW9uKHByb3ApKSB7XG5cdFx0XHRzdG9yZS5yYXdbcHJvcE5hbWVdID0gYmluZChzdG9yZSwgcHJvcClcdFx0XHRcblx0XHR9XG5cdH0pXG5cdGVhY2goc3RvcmFnZXMsIGZ1bmN0aW9uKHN0b3JhZ2UpIHtcblx0XHRzdG9yZS5fYWRkU3RvcmFnZShzdG9yYWdlKVxuXHR9KVxuXHRlYWNoKHBsdWdpbnMsIGZ1bmN0aW9uKHBsdWdpbikge1xuXHRcdHN0b3JlLl9hZGRQbHVnaW4ocGx1Z2luKVxuXHR9KVxuXHRyZXR1cm4gc3RvcmVcbn1cbiIsInZhciBhc3NpZ24gPSBtYWtlX2Fzc2lnbigpXG52YXIgY3JlYXRlID0gbWFrZV9jcmVhdGUoKVxudmFyIHRyaW0gPSBtYWtlX3RyaW0oKVxudmFyIEdsb2JhbCA9ICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IGdsb2JhbClcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdGFzc2lnbjogYXNzaWduLFxuXHRjcmVhdGU6IGNyZWF0ZSxcblx0dHJpbTogdHJpbSxcblx0YmluZDogYmluZCxcblx0c2xpY2U6IHNsaWNlLFxuXHRlYWNoOiBlYWNoLFxuXHRtYXA6IG1hcCxcblx0cGx1Y2s6IHBsdWNrLFxuXHRpc0xpc3Q6IGlzTGlzdCxcblx0aXNGdW5jdGlvbjogaXNGdW5jdGlvbixcblx0aXNPYmplY3Q6IGlzT2JqZWN0LFxuXHRHbG9iYWw6IEdsb2JhbFxufVxuXG5mdW5jdGlvbiBtYWtlX2Fzc2lnbigpIHtcblx0aWYgKE9iamVjdC5hc3NpZ24pIHtcblx0XHRyZXR1cm4gT2JqZWN0LmFzc2lnblxuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBmdW5jdGlvbiBzaGltQXNzaWduKG9iaiwgcHJvcHMxLCBwcm9wczIsIGV0Yykge1xuXHRcdFx0Zm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0ZWFjaChPYmplY3QoYXJndW1lbnRzW2ldKSwgZnVuY3Rpb24odmFsLCBrZXkpIHtcblx0XHRcdFx0XHRvYmpba2V5XSA9IHZhbFxuXHRcdFx0XHR9KVxuXHRcdFx0fVx0XHRcdFxuXHRcdFx0cmV0dXJuIG9ialxuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBtYWtlX2NyZWF0ZSgpIHtcblx0aWYgKE9iamVjdC5jcmVhdGUpIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24gY3JlYXRlKG9iaiwgYXNzaWduUHJvcHMxLCBhc3NpZ25Qcm9wczIsIGV0Yykge1xuXHRcdFx0dmFyIGFzc2lnbkFyZ3NMaXN0ID0gc2xpY2UoYXJndW1lbnRzLCAxKVxuXHRcdFx0cmV0dXJuIGFzc2lnbi5hcHBseSh0aGlzLCBbT2JqZWN0LmNyZWF0ZShvYmopXS5jb25jYXQoYXNzaWduQXJnc0xpc3QpKVxuXHRcdH1cblx0fSBlbHNlIHtcblx0XHRmdW5jdGlvbiBGKCkge30gLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1pbm5lci1kZWNsYXJhdGlvbnNcblx0XHRyZXR1cm4gZnVuY3Rpb24gY3JlYXRlKG9iaiwgYXNzaWduUHJvcHMxLCBhc3NpZ25Qcm9wczIsIGV0Yykge1xuXHRcdFx0dmFyIGFzc2lnbkFyZ3NMaXN0ID0gc2xpY2UoYXJndW1lbnRzLCAxKVxuXHRcdFx0Ri5wcm90b3R5cGUgPSBvYmpcblx0XHRcdHJldHVybiBhc3NpZ24uYXBwbHkodGhpcywgW25ldyBGKCldLmNvbmNhdChhc3NpZ25BcmdzTGlzdCkpXG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIG1ha2VfdHJpbSgpIHtcblx0aWYgKFN0cmluZy5wcm90b3R5cGUudHJpbSkge1xuXHRcdHJldHVybiBmdW5jdGlvbiB0cmltKHN0cikge1xuXHRcdFx0cmV0dXJuIFN0cmluZy5wcm90b3R5cGUudHJpbS5jYWxsKHN0cilcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uIHRyaW0oc3RyKSB7XG5cdFx0XHRyZXR1cm4gc3RyLnJlcGxhY2UoL15bXFxzXFx1RkVGRlxceEEwXSt8W1xcc1xcdUZFRkZcXHhBMF0rJC9nLCAnJylcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gYmluZChvYmosIGZuKSB7XG5cdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gZm4uYXBwbHkob2JqLCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApKVxuXHR9XG59XG5cbmZ1bmN0aW9uIHNsaWNlKGFyciwgaW5kZXgpIHtcblx0cmV0dXJuIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyciwgaW5kZXggfHwgMClcbn1cblxuZnVuY3Rpb24gZWFjaChvYmosIGZuKSB7XG5cdHBsdWNrKG9iaiwgZnVuY3Rpb24odmFsLCBrZXkpIHtcblx0XHRmbih2YWwsIGtleSlcblx0XHRyZXR1cm4gZmFsc2Vcblx0fSlcbn1cblxuZnVuY3Rpb24gbWFwKG9iaiwgZm4pIHtcblx0dmFyIHJlcyA9IChpc0xpc3Qob2JqKSA/IFtdIDoge30pXG5cdHBsdWNrKG9iaiwgZnVuY3Rpb24odiwgaykge1xuXHRcdHJlc1trXSA9IGZuKHYsIGspXG5cdFx0cmV0dXJuIGZhbHNlXG5cdH0pXG5cdHJldHVybiByZXNcbn1cblxuZnVuY3Rpb24gcGx1Y2sob2JqLCBmbikge1xuXHRpZiAoaXNMaXN0KG9iaikpIHtcblx0XHRmb3IgKHZhciBpPTA7IGk8b2JqLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRpZiAoZm4ob2JqW2ldLCBpKSkge1xuXHRcdFx0XHRyZXR1cm4gb2JqW2ldXG5cdFx0XHR9XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdGZvciAodmFyIGtleSBpbiBvYmopIHtcblx0XHRcdGlmIChvYmouaGFzT3duUHJvcGVydHkoa2V5KSkge1xuXHRcdFx0XHRpZiAoZm4ob2JqW2tleV0sIGtleSkpIHtcblx0XHRcdFx0XHRyZXR1cm4gb2JqW2tleV1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBpc0xpc3QodmFsKSB7XG5cdHJldHVybiAodmFsICE9IG51bGwgJiYgdHlwZW9mIHZhbCAhPSAnZnVuY3Rpb24nICYmIHR5cGVvZiB2YWwubGVuZ3RoID09ICdudW1iZXInKVxufVxuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbCkge1xuXHRyZXR1cm4gdmFsICYmIHt9LnRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJ1xufVxuXG5mdW5jdGlvbiBpc09iamVjdCh2YWwpIHtcblx0cmV0dXJuIHZhbCAmJiB7fS50b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IE9iamVjdF0nXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IFtcblx0Ly8gTGlzdGVkIGluIG9yZGVyIG9mIHVzYWdlIHByZWZlcmVuY2Vcblx0cmVxdWlyZSgnLi9sb2NhbFN0b3JhZ2UnKSxcblx0cmVxdWlyZSgnLi9vbGRGRi1nbG9iYWxTdG9yYWdlJyksXG5cdHJlcXVpcmUoJy4vb2xkSUUtdXNlckRhdGFTdG9yYWdlJyksXG5cdHJlcXVpcmUoJy4vY29va2llU3RvcmFnZScpLFxuXHRyZXF1aXJlKCcuL3Nlc3Npb25TdG9yYWdlJyksXG5cdHJlcXVpcmUoJy4vbWVtb3J5U3RvcmFnZScpXG5dXG4iLCIvLyBjb29raWVTdG9yYWdlIGlzIHVzZWZ1bCBTYWZhcmkgcHJpdmF0ZSBicm93c2VyIG1vZGUsIHdoZXJlIGxvY2FsU3RvcmFnZVxuLy8gZG9lc24ndCB3b3JrIGJ1dCBjb29raWVzIGRvLiBUaGlzIGltcGxlbWVudGF0aW9uIGlzIGFkb3B0ZWQgZnJvbVxuLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1N0b3JhZ2UvTG9jYWxTdG9yYWdlXG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vc3JjL3V0aWwnKVxudmFyIEdsb2JhbCA9IHV0aWwuR2xvYmFsXG52YXIgdHJpbSA9IHV0aWwudHJpbVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0bmFtZTogJ2Nvb2tpZVN0b3JhZ2UnLFxuXHRyZWFkOiByZWFkLFxuXHR3cml0ZTogd3JpdGUsXG5cdGVhY2g6IGVhY2gsXG5cdHJlbW92ZTogcmVtb3ZlLFxuXHRjbGVhckFsbDogY2xlYXJBbGwsXG59XG5cbnZhciBkb2MgPSBHbG9iYWwuZG9jdW1lbnRcblxuZnVuY3Rpb24gcmVhZChrZXkpIHtcblx0aWYgKCFrZXkgfHwgIV9oYXMoa2V5KSkgeyByZXR1cm4gbnVsbCB9XG5cdHZhciByZWdleHBTdHIgPSBcIig/Ol58Lio7XFxcXHMqKVwiICtcblx0XHRlc2NhcGUoa2V5KS5yZXBsYWNlKC9bXFwtXFwuXFwrXFwqXS9nLCBcIlxcXFwkJlwiKSArXG5cdFx0XCJcXFxccypcXFxcPVxcXFxzKigoPzpbXjtdKD8hOykpKlteO10/KS4qXCJcblx0cmV0dXJuIHVuZXNjYXBlKGRvYy5jb29raWUucmVwbGFjZShuZXcgUmVnRXhwKHJlZ2V4cFN0ciksIFwiJDFcIikpXG59XG5cbmZ1bmN0aW9uIGVhY2goY2FsbGJhY2spIHtcblx0dmFyIGNvb2tpZXMgPSBkb2MuY29va2llLnNwbGl0KC87ID8vZylcblx0Zm9yICh2YXIgaSA9IGNvb2tpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcblx0XHRpZiAoIXRyaW0oY29va2llc1tpXSkpIHtcblx0XHRcdGNvbnRpbnVlXG5cdFx0fVxuXHRcdHZhciBrdnAgPSBjb29raWVzW2ldLnNwbGl0KCc9Jylcblx0XHR2YXIga2V5ID0gdW5lc2NhcGUoa3ZwWzBdKVxuXHRcdHZhciB2YWwgPSB1bmVzY2FwZShrdnBbMV0pXG5cdFx0Y2FsbGJhY2sodmFsLCBrZXkpXG5cdH1cbn1cblxuZnVuY3Rpb24gd3JpdGUoa2V5LCBkYXRhKSB7XG5cdGlmKCFrZXkpIHsgcmV0dXJuIH1cblx0ZG9jLmNvb2tpZSA9IGVzY2FwZShrZXkpICsgXCI9XCIgKyBlc2NhcGUoZGF0YSkgKyBcIjsgZXhwaXJlcz1UdWUsIDE5IEphbiAyMDM4IDAzOjE0OjA3IEdNVDsgcGF0aD0vXCJcbn1cblxuZnVuY3Rpb24gcmVtb3ZlKGtleSkge1xuXHRpZiAoIWtleSB8fCAhX2hhcyhrZXkpKSB7XG5cdFx0cmV0dXJuXG5cdH1cblx0ZG9jLmNvb2tpZSA9IGVzY2FwZShrZXkpICsgXCI9OyBleHBpcmVzPVRodSwgMDEgSmFuIDE5NzAgMDA6MDA6MDAgR01UOyBwYXRoPS9cIlxufVxuXG5mdW5jdGlvbiBjbGVhckFsbCgpIHtcblx0ZWFjaChmdW5jdGlvbihfLCBrZXkpIHtcblx0XHRyZW1vdmUoa2V5KVxuXHR9KVxufVxuXG5mdW5jdGlvbiBfaGFzKGtleSkge1xuXHRyZXR1cm4gKG5ldyBSZWdFeHAoXCIoPzpefDtcXFxccyopXCIgKyBlc2NhcGUoa2V5KS5yZXBsYWNlKC9bXFwtXFwuXFwrXFwqXS9nLCBcIlxcXFwkJlwiKSArIFwiXFxcXHMqXFxcXD1cIikpLnRlc3QoZG9jLmNvb2tpZSlcbn1cbiIsInZhciB1dGlsID0gcmVxdWlyZSgnLi4vc3JjL3V0aWwnKVxudmFyIEdsb2JhbCA9IHV0aWwuR2xvYmFsXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRuYW1lOiAnbG9jYWxTdG9yYWdlJyxcblx0cmVhZDogcmVhZCxcblx0d3JpdGU6IHdyaXRlLFxuXHRlYWNoOiBlYWNoLFxuXHRyZW1vdmU6IHJlbW92ZSxcblx0Y2xlYXJBbGw6IGNsZWFyQWxsLFxufVxuXG5mdW5jdGlvbiBsb2NhbFN0b3JhZ2UoKSB7XG5cdHJldHVybiBHbG9iYWwubG9jYWxTdG9yYWdlXG59XG5cbmZ1bmN0aW9uIHJlYWQoa2V5KSB7XG5cdHJldHVybiBsb2NhbFN0b3JhZ2UoKS5nZXRJdGVtKGtleSlcbn1cblxuZnVuY3Rpb24gd3JpdGUoa2V5LCBkYXRhKSB7XG5cdHJldHVybiBsb2NhbFN0b3JhZ2UoKS5zZXRJdGVtKGtleSwgZGF0YSlcbn1cblxuZnVuY3Rpb24gZWFjaChmbikge1xuXHRmb3IgKHZhciBpID0gbG9jYWxTdG9yYWdlKCkubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcblx0XHR2YXIga2V5ID0gbG9jYWxTdG9yYWdlKCkua2V5KGkpXG5cdFx0Zm4ocmVhZChrZXkpLCBrZXkpXG5cdH1cbn1cblxuZnVuY3Rpb24gcmVtb3ZlKGtleSkge1xuXHRyZXR1cm4gbG9jYWxTdG9yYWdlKCkucmVtb3ZlSXRlbShrZXkpXG59XG5cbmZ1bmN0aW9uIGNsZWFyQWxsKCkge1xuXHRyZXR1cm4gbG9jYWxTdG9yYWdlKCkuY2xlYXIoKVxufVxuIiwiLy8gbWVtb3J5U3RvcmFnZSBpcyBhIHVzZWZ1bCBsYXN0IGZhbGxiYWNrIHRvIGVuc3VyZSB0aGF0IHRoZSBzdG9yZVxuLy8gaXMgZnVuY3Rpb25zIChtZWFuaW5nIHN0b3JlLmdldCgpLCBzdG9yZS5zZXQoKSwgZXRjIHdpbGwgYWxsIGZ1bmN0aW9uKS5cbi8vIEhvd2V2ZXIsIHN0b3JlZCB2YWx1ZXMgd2lsbCBub3QgcGVyc2lzdCB3aGVuIHRoZSBicm93c2VyIG5hdmlnYXRlcyB0b1xuLy8gYSBuZXcgcGFnZSBvciByZWxvYWRzIHRoZSBjdXJyZW50IHBhZ2UuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRuYW1lOiAnbWVtb3J5U3RvcmFnZScsXG5cdHJlYWQ6IHJlYWQsXG5cdHdyaXRlOiB3cml0ZSxcblx0ZWFjaDogZWFjaCxcblx0cmVtb3ZlOiByZW1vdmUsXG5cdGNsZWFyQWxsOiBjbGVhckFsbCxcbn1cblxudmFyIG1lbW9yeVN0b3JhZ2UgPSB7fVxuXG5mdW5jdGlvbiByZWFkKGtleSkge1xuXHRyZXR1cm4gbWVtb3J5U3RvcmFnZVtrZXldXG59XG5cbmZ1bmN0aW9uIHdyaXRlKGtleSwgZGF0YSkge1xuXHRtZW1vcnlTdG9yYWdlW2tleV0gPSBkYXRhXG59XG5cbmZ1bmN0aW9uIGVhY2goY2FsbGJhY2spIHtcblx0Zm9yICh2YXIga2V5IGluIG1lbW9yeVN0b3JhZ2UpIHtcblx0XHRpZiAobWVtb3J5U3RvcmFnZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG5cdFx0XHRjYWxsYmFjayhtZW1vcnlTdG9yYWdlW2tleV0sIGtleSlcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gcmVtb3ZlKGtleSkge1xuXHRkZWxldGUgbWVtb3J5U3RvcmFnZVtrZXldXG59XG5cbmZ1bmN0aW9uIGNsZWFyQWxsKGtleSkge1xuXHRtZW1vcnlTdG9yYWdlID0ge31cbn1cbiIsIi8vIG9sZEZGLWdsb2JhbFN0b3JhZ2UgcHJvdmlkZXMgc3RvcmFnZSBmb3IgRmlyZWZveFxuLy8gdmVyc2lvbnMgNiBhbmQgNywgd2hlcmUgbm8gbG9jYWxTdG9yYWdlLCBldGNcbi8vIGlzIGF2YWlsYWJsZS5cblxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi9zcmMvdXRpbCcpXG52YXIgR2xvYmFsID0gdXRpbC5HbG9iYWxcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdG5hbWU6ICdvbGRGRi1nbG9iYWxTdG9yYWdlJyxcblx0cmVhZDogcmVhZCxcblx0d3JpdGU6IHdyaXRlLFxuXHRlYWNoOiBlYWNoLFxuXHRyZW1vdmU6IHJlbW92ZSxcblx0Y2xlYXJBbGw6IGNsZWFyQWxsLFxufVxuXG52YXIgZ2xvYmFsU3RvcmFnZSA9IEdsb2JhbC5nbG9iYWxTdG9yYWdlXG5cbmZ1bmN0aW9uIHJlYWQoa2V5KSB7XG5cdHJldHVybiBnbG9iYWxTdG9yYWdlW2tleV1cbn1cblxuZnVuY3Rpb24gd3JpdGUoa2V5LCBkYXRhKSB7XG5cdGdsb2JhbFN0b3JhZ2Vba2V5XSA9IGRhdGFcbn1cblxuZnVuY3Rpb24gZWFjaChmbikge1xuXHRmb3IgKHZhciBpID0gZ2xvYmFsU3RvcmFnZS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuXHRcdHZhciBrZXkgPSBnbG9iYWxTdG9yYWdlLmtleShpKVxuXHRcdGZuKGdsb2JhbFN0b3JhZ2Vba2V5XSwga2V5KVxuXHR9XG59XG5cbmZ1bmN0aW9uIHJlbW92ZShrZXkpIHtcblx0cmV0dXJuIGdsb2JhbFN0b3JhZ2UucmVtb3ZlSXRlbShrZXkpXG59XG5cbmZ1bmN0aW9uIGNsZWFyQWxsKCkge1xuXHRlYWNoKGZ1bmN0aW9uKGtleSwgXykge1xuXHRcdGRlbGV0ZSBnbG9iYWxTdG9yYWdlW2tleV1cblx0fSlcbn1cbiIsIi8vIG9sZElFLXVzZXJEYXRhU3RvcmFnZSBwcm92aWRlcyBzdG9yYWdlIGZvciBJbnRlcm5ldCBFeHBsb3JlclxuLy8gdmVyc2lvbnMgNiBhbmQgNywgd2hlcmUgbm8gbG9jYWxTdG9yYWdlLCBzZXNzaW9uU3RvcmFnZSwgZXRjXG4vLyBpcyBhdmFpbGFibGUuXG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vc3JjL3V0aWwnKVxudmFyIEdsb2JhbCA9IHV0aWwuR2xvYmFsXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRuYW1lOiAnb2xkSUUtdXNlckRhdGFTdG9yYWdlJyxcblx0d3JpdGU6IHdyaXRlLFxuXHRyZWFkOiByZWFkLFxuXHRlYWNoOiBlYWNoLFxuXHRyZW1vdmU6IHJlbW92ZSxcblx0Y2xlYXJBbGw6IGNsZWFyQWxsLFxufVxuXG52YXIgc3RvcmFnZU5hbWUgPSAnc3RvcmVqcydcbnZhciBkb2MgPSBHbG9iYWwuZG9jdW1lbnRcbnZhciBfd2l0aFN0b3JhZ2VFbCA9IF9tYWtlSUVTdG9yYWdlRWxGdW5jdGlvbigpXG52YXIgZGlzYWJsZSA9IChHbG9iYWwubmF2aWdhdG9yID8gR2xvYmFsLm5hdmlnYXRvci51c2VyQWdlbnQgOiAnJykubWF0Y2goLyAoTVNJRSA4fE1TSUUgOXxNU0lFIDEwKVxcLi8pIC8vIE1TSUUgOS54LCBNU0lFIDEwLnhcblxuZnVuY3Rpb24gd3JpdGUodW5maXhlZEtleSwgZGF0YSkge1xuXHRpZiAoZGlzYWJsZSkgeyByZXR1cm4gfVxuXHR2YXIgZml4ZWRLZXkgPSBmaXhLZXkodW5maXhlZEtleSlcblx0X3dpdGhTdG9yYWdlRWwoZnVuY3Rpb24oc3RvcmFnZUVsKSB7XG5cdFx0c3RvcmFnZUVsLnNldEF0dHJpYnV0ZShmaXhlZEtleSwgZGF0YSlcblx0XHRzdG9yYWdlRWwuc2F2ZShzdG9yYWdlTmFtZSlcblx0fSlcbn1cblxuZnVuY3Rpb24gcmVhZCh1bmZpeGVkS2V5KSB7XG5cdGlmIChkaXNhYmxlKSB7IHJldHVybiB9XG5cdHZhciBmaXhlZEtleSA9IGZpeEtleSh1bmZpeGVkS2V5KVxuXHR2YXIgcmVzID0gbnVsbFxuXHRfd2l0aFN0b3JhZ2VFbChmdW5jdGlvbihzdG9yYWdlRWwpIHtcblx0XHRyZXMgPSBzdG9yYWdlRWwuZ2V0QXR0cmlidXRlKGZpeGVkS2V5KVxuXHR9KVxuXHRyZXR1cm4gcmVzXG59XG5cbmZ1bmN0aW9uIGVhY2goY2FsbGJhY2spIHtcblx0X3dpdGhTdG9yYWdlRWwoZnVuY3Rpb24oc3RvcmFnZUVsKSB7XG5cdFx0dmFyIGF0dHJpYnV0ZXMgPSBzdG9yYWdlRWwuWE1MRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmF0dHJpYnV0ZXNcblx0XHRmb3IgKHZhciBpPWF0dHJpYnV0ZXMubGVuZ3RoLTE7IGk+PTA7IGktLSkge1xuXHRcdFx0dmFyIGF0dHIgPSBhdHRyaWJ1dGVzW2ldXG5cdFx0XHRjYWxsYmFjayhzdG9yYWdlRWwuZ2V0QXR0cmlidXRlKGF0dHIubmFtZSksIGF0dHIubmFtZSlcblx0XHR9XG5cdH0pXG59XG5cbmZ1bmN0aW9uIHJlbW92ZSh1bmZpeGVkS2V5KSB7XG5cdHZhciBmaXhlZEtleSA9IGZpeEtleSh1bmZpeGVkS2V5KVxuXHRfd2l0aFN0b3JhZ2VFbChmdW5jdGlvbihzdG9yYWdlRWwpIHtcblx0XHRzdG9yYWdlRWwucmVtb3ZlQXR0cmlidXRlKGZpeGVkS2V5KVxuXHRcdHN0b3JhZ2VFbC5zYXZlKHN0b3JhZ2VOYW1lKVxuXHR9KVxufVxuXG5mdW5jdGlvbiBjbGVhckFsbCgpIHtcblx0X3dpdGhTdG9yYWdlRWwoZnVuY3Rpb24oc3RvcmFnZUVsKSB7XG5cdFx0dmFyIGF0dHJpYnV0ZXMgPSBzdG9yYWdlRWwuWE1MRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmF0dHJpYnV0ZXNcblx0XHRzdG9yYWdlRWwubG9hZChzdG9yYWdlTmFtZSlcblx0XHRmb3IgKHZhciBpPWF0dHJpYnV0ZXMubGVuZ3RoLTE7IGk+PTA7IGktLSkge1xuXHRcdFx0c3RvcmFnZUVsLnJlbW92ZUF0dHJpYnV0ZShhdHRyaWJ1dGVzW2ldLm5hbWUpXG5cdFx0fVxuXHRcdHN0b3JhZ2VFbC5zYXZlKHN0b3JhZ2VOYW1lKVxuXHR9KVxufVxuXG4vLyBIZWxwZXJzXG4vLy8vLy8vLy8vXG5cbi8vIEluIElFNywga2V5cyBjYW5ub3Qgc3RhcnQgd2l0aCBhIGRpZ2l0IG9yIGNvbnRhaW4gY2VydGFpbiBjaGFycy5cbi8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vbWFyY3Vzd2VzdGluL3N0b3JlLmpzL2lzc3Vlcy80MFxuLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXJjdXN3ZXN0aW4vc3RvcmUuanMvaXNzdWVzLzgzXG52YXIgZm9yYmlkZGVuQ2hhcnNSZWdleCA9IG5ldyBSZWdFeHAoXCJbIVxcXCIjJCUmJygpKissL1xcXFxcXFxcOjs8PT4/QFtcXFxcXV5ge3x9fl1cIiwgXCJnXCIpXG5mdW5jdGlvbiBmaXhLZXkoa2V5KSB7XG5cdHJldHVybiBrZXkucmVwbGFjZSgvXlxcZC8sICdfX18kJicpLnJlcGxhY2UoZm9yYmlkZGVuQ2hhcnNSZWdleCwgJ19fXycpXG59XG5cbmZ1bmN0aW9uIF9tYWtlSUVTdG9yYWdlRWxGdW5jdGlvbigpIHtcblx0aWYgKCFkb2MgfHwgIWRvYy5kb2N1bWVudEVsZW1lbnQgfHwgIWRvYy5kb2N1bWVudEVsZW1lbnQuYWRkQmVoYXZpb3IpIHtcblx0XHRyZXR1cm4gbnVsbFxuXHR9XG5cdHZhciBzY3JpcHRUYWcgPSAnc2NyaXB0Jyxcblx0XHRzdG9yYWdlT3duZXIsXG5cdFx0c3RvcmFnZUNvbnRhaW5lcixcblx0XHRzdG9yYWdlRWxcblxuXHQvLyBTaW5jZSAjdXNlckRhdGEgc3RvcmFnZSBhcHBsaWVzIG9ubHkgdG8gc3BlY2lmaWMgcGF0aHMsIHdlIG5lZWQgdG9cblx0Ly8gc29tZWhvdyBsaW5rIG91ciBkYXRhIHRvIGEgc3BlY2lmaWMgcGF0aC4gIFdlIGNob29zZSAvZmF2aWNvbi5pY29cblx0Ly8gYXMgYSBwcmV0dHkgc2FmZSBvcHRpb24sIHNpbmNlIGFsbCBicm93c2VycyBhbHJlYWR5IG1ha2UgYSByZXF1ZXN0IHRvXG5cdC8vIHRoaXMgVVJMIGFueXdheSBhbmQgYmVpbmcgYSA0MDQgd2lsbCBub3QgaHVydCB1cyBoZXJlLiAgV2Ugd3JhcCBhblxuXHQvLyBpZnJhbWUgcG9pbnRpbmcgdG8gdGhlIGZhdmljb24gaW4gYW4gQWN0aXZlWE9iamVjdChodG1sZmlsZSkgb2JqZWN0XG5cdC8vIChzZWU6IGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9hYTc1MjU3NCh2PVZTLjg1KS5hc3B4KVxuXHQvLyBzaW5jZSB0aGUgaWZyYW1lIGFjY2VzcyBydWxlcyBhcHBlYXIgdG8gYWxsb3cgZGlyZWN0IGFjY2VzcyBhbmRcblx0Ly8gbWFuaXB1bGF0aW9uIG9mIHRoZSBkb2N1bWVudCBlbGVtZW50LCBldmVuIGZvciBhIDQwNCBwYWdlLiAgVGhpc1xuXHQvLyBkb2N1bWVudCBjYW4gYmUgdXNlZCBpbnN0ZWFkIG9mIHRoZSBjdXJyZW50IGRvY3VtZW50ICh3aGljaCB3b3VsZFxuXHQvLyBoYXZlIGJlZW4gbGltaXRlZCB0byB0aGUgY3VycmVudCBwYXRoKSB0byBwZXJmb3JtICN1c2VyRGF0YSBzdG9yYWdlLlxuXHR0cnkge1xuXHRcdC8qIGdsb2JhbCBBY3RpdmVYT2JqZWN0ICovXG5cdFx0c3RvcmFnZUNvbnRhaW5lciA9IG5ldyBBY3RpdmVYT2JqZWN0KCdodG1sZmlsZScpXG5cdFx0c3RvcmFnZUNvbnRhaW5lci5vcGVuKClcblx0XHRzdG9yYWdlQ29udGFpbmVyLndyaXRlKCc8JytzY3JpcHRUYWcrJz5kb2N1bWVudC53PXdpbmRvdzwvJytzY3JpcHRUYWcrJz48aWZyYW1lIHNyYz1cIi9mYXZpY29uLmljb1wiPjwvaWZyYW1lPicpXG5cdFx0c3RvcmFnZUNvbnRhaW5lci5jbG9zZSgpXG5cdFx0c3RvcmFnZU93bmVyID0gc3RvcmFnZUNvbnRhaW5lci53LmZyYW1lc1swXS5kb2N1bWVudFxuXHRcdHN0b3JhZ2VFbCA9IHN0b3JhZ2VPd25lci5jcmVhdGVFbGVtZW50KCdkaXYnKVxuXHR9IGNhdGNoKGUpIHtcblx0XHQvLyBzb21laG93IEFjdGl2ZVhPYmplY3QgaW5zdGFudGlhdGlvbiBmYWlsZWQgKHBlcmhhcHMgc29tZSBzcGVjaWFsXG5cdFx0Ly8gc2VjdXJpdHkgc2V0dGluZ3Mgb3Igb3RoZXJ3c2UpLCBmYWxsIGJhY2sgdG8gcGVyLXBhdGggc3RvcmFnZVxuXHRcdHN0b3JhZ2VFbCA9IGRvYy5jcmVhdGVFbGVtZW50KCdkaXYnKVxuXHRcdHN0b3JhZ2VPd25lciA9IGRvYy5ib2R5XG5cdH1cblxuXHRyZXR1cm4gZnVuY3Rpb24oc3RvcmVGdW5jdGlvbikge1xuXHRcdHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDApXG5cdFx0YXJncy51bnNoaWZ0KHN0b3JhZ2VFbClcblx0XHQvLyBTZWUgaHR0cDovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L21zNTMxMDgxKHY9VlMuODUpLmFzcHhcblx0XHQvLyBhbmQgaHR0cDovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L21zNTMxNDI0KHY9VlMuODUpLmFzcHhcblx0XHRzdG9yYWdlT3duZXIuYXBwZW5kQ2hpbGQoc3RvcmFnZUVsKVxuXHRcdHN0b3JhZ2VFbC5hZGRCZWhhdmlvcignI2RlZmF1bHQjdXNlckRhdGEnKVxuXHRcdHN0b3JhZ2VFbC5sb2FkKHN0b3JhZ2VOYW1lKVxuXHRcdHN0b3JlRnVuY3Rpb24uYXBwbHkodGhpcywgYXJncylcblx0XHRzdG9yYWdlT3duZXIucmVtb3ZlQ2hpbGQoc3RvcmFnZUVsKVxuXHRcdHJldHVyblxuXHR9XG59XG4iLCJ2YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3NyYy91dGlsJylcbnZhciBHbG9iYWwgPSB1dGlsLkdsb2JhbFxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0bmFtZTogJ3Nlc3Npb25TdG9yYWdlJyxcblx0cmVhZDogcmVhZCxcblx0d3JpdGU6IHdyaXRlLFxuXHRlYWNoOiBlYWNoLFxuXHRyZW1vdmU6IHJlbW92ZSxcblx0Y2xlYXJBbGw6IGNsZWFyQWxsXG59XG5cbmZ1bmN0aW9uIHNlc3Npb25TdG9yYWdlKCkge1xuXHRyZXR1cm4gR2xvYmFsLnNlc3Npb25TdG9yYWdlXG59XG5cbmZ1bmN0aW9uIHJlYWQoa2V5KSB7XG5cdHJldHVybiBzZXNzaW9uU3RvcmFnZSgpLmdldEl0ZW0oa2V5KVxufVxuXG5mdW5jdGlvbiB3cml0ZShrZXksIGRhdGEpIHtcblx0cmV0dXJuIHNlc3Npb25TdG9yYWdlKCkuc2V0SXRlbShrZXksIGRhdGEpXG59XG5cbmZ1bmN0aW9uIGVhY2goZm4pIHtcblx0Zm9yICh2YXIgaSA9IHNlc3Npb25TdG9yYWdlKCkubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcblx0XHR2YXIga2V5ID0gc2Vzc2lvblN0b3JhZ2UoKS5rZXkoaSlcblx0XHRmbihyZWFkKGtleSksIGtleSlcblx0fVxufVxuXG5mdW5jdGlvbiByZW1vdmUoa2V5KSB7XG5cdHJldHVybiBzZXNzaW9uU3RvcmFnZSgpLnJlbW92ZUl0ZW0oa2V5KVxufVxuXG5mdW5jdGlvbiBjbGVhckFsbCgpIHtcblx0cmV0dXJuIHNlc3Npb25TdG9yYWdlKCkuY2xlYXIoKVxufVxuIiwidmFyIEFkYXB0ZXJzLCBTdG9yYWdlLCB1dGlscyxcbiAgYmluZCA9IGZ1bmN0aW9uKGZuLCBtZSl7IHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gZm4uYXBwbHkobWUsIGFyZ3VtZW50cyk7IH07IH07XG5cbnV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG5TdG9yYWdlID0gcmVxdWlyZSgnLi9zdG9yYWdlJyk7XG5cbkFkYXB0ZXJzID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBBZGFwdGVycygpIHt9XG5cbiAgQWRhcHRlcnMuR2ltZWxBZGFwdGVyID0gKGZ1bmN0aW9uKCkge1xuICAgIEdpbWVsQWRhcHRlci5wcm90b3R5cGUucXVldWVfbmFtZSA9ICdfZ2ltZWxfcXVldWUnO1xuXG4gICAgZnVuY3Rpb24gR2ltZWxBZGFwdGVyKHVybCwgbmFtZXNwYWNlLCBzdG9yYWdlKSB7XG4gICAgICBpZiAoc3RvcmFnZSA9PSBudWxsKSB7XG4gICAgICAgIHN0b3JhZ2UgPSBBZGFwdGVycy5Mb2NhbFN0b3JhZ2VBZGFwdGVyO1xuICAgICAgfVxuICAgICAgdGhpcy5nb2FsX2NvbXBsZXRlID0gYmluZCh0aGlzLmdvYWxfY29tcGxldGUsIHRoaXMpO1xuICAgICAgdGhpcy5leHBlcmltZW50X3N0YXJ0ID0gYmluZCh0aGlzLmV4cGVyaW1lbnRfc3RhcnQsIHRoaXMpO1xuICAgICAgdGhpcy5fc3RvcmFnZSA9IHN0b3JhZ2U7XG4gICAgICB0aGlzLnVybCA9IHVybDtcbiAgICAgIHRoaXMubmFtZXNwYWNlID0gbmFtZXNwYWNlO1xuICAgICAgdGhpcy5fcXVldWUgPSBKU09OLnBhcnNlKHRoaXMuX3N0b3JhZ2UuZ2V0KHRoaXMucXVldWVfbmFtZSkgfHwgJ1tdJyk7XG4gICAgICB0aGlzLl9mbHVzaCgpO1xuICAgIH1cblxuICAgIEdpbWVsQWRhcHRlci5wcm90b3R5cGUuX3JlbW92ZV9xdXVpZCA9IGZ1bmN0aW9uKHF1dWlkKSB7XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihlcnIsIHJlcykge1xuICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgdXRpbHMucmVtb3ZlKF90aGlzLl9xdWV1ZSwgZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgICAgIHJldHVybiBlbC5wcm9wZXJ0aWVzLl9xdXVpZCA9PT0gcXV1aWQ7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLl9zdG9yYWdlLnNldChfdGhpcy5xdWV1ZV9uYW1lLCBKU09OLnN0cmluZ2lmeShfdGhpcy5fcXVldWUpKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpO1xuICAgIH07XG5cbiAgICBHaW1lbEFkYXB0ZXIucHJvdG90eXBlLl9qcXVlcnlfZ2V0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBjYWxsYmFjaykge1xuICAgICAgdXRpbHMubG9nKCdzZW5kIHJlcXVlc3QgdXNpbmcgalF1ZXJ5Jyk7XG4gICAgICByZXR1cm4gd2luZG93LmpRdWVyeS5hamF4KHtcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgIHN1Y2Nlc3M6IGNhbGxiYWNrXG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgR2ltZWxBZGFwdGVyLnByb3RvdHlwZS5fcGxhaW5fanNfZ2V0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBjYWxsYmFjaykge1xuICAgICAgdmFyIGssIHBhcmFtcywgdiwgeGhyO1xuICAgICAgdXRpbHMubG9nKCdmYWxsYmFjayBvbiBwbGFpbiBqcyB4aHInKTtcbiAgICAgIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgcGFyYW1zID0gKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVzdWx0cztcbiAgICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgICBmb3IgKGsgaW4gZGF0YSkge1xuICAgICAgICAgIHYgPSBkYXRhW2tdO1xuICAgICAgICAgIHJlc3VsdHMucHVzaCgoZW5jb2RlVVJJQ29tcG9uZW50KGspKSArIFwiPVwiICsgKGVuY29kZVVSSUNvbXBvbmVudCh2KSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgfSkoKTtcbiAgICAgIHBhcmFtcyA9IHBhcmFtcy5qb2luKCcmJykucmVwbGFjZSgvJTIwL2csICcrJyk7XG4gICAgICB4aHIub3BlbignR0VUJywgdXJsICsgXCI/XCIgKyBwYXJhbXMpO1xuICAgICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoeGhyLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICByZXR1cm4geGhyLnNlbmQoKTtcbiAgICB9O1xuXG4gICAgR2ltZWxBZGFwdGVyLnByb3RvdHlwZS5fYWpheF9nZXQgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICB2YXIgcmVmO1xuICAgICAgaWYgKChyZWYgPSB3aW5kb3cualF1ZXJ5KSAhPSBudWxsID8gcmVmLmFqYXggOiB2b2lkIDApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2pxdWVyeV9nZXQodXJsLCBkYXRhLCBjYWxsYmFjayk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5fcGxhaW5fanNfZ2V0KHVybCwgZGF0YSwgY2FsbGJhY2spO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBHaW1lbEFkYXB0ZXIucHJvdG90eXBlLl9mbHVzaCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGNhbGxiYWNrLCBpLCBpdGVtLCBsZW4sIHJlZiwgcmVzdWx0cztcbiAgICAgIHJlZiA9IHRoaXMuX3F1ZXVlO1xuICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGl0ZW0gPSByZWZbaV07XG4gICAgICAgIGNhbGxiYWNrID0gdGhpcy5fcmVtb3ZlX3F1dWlkKGl0ZW0ucHJvcGVydGllcy5fcXV1aWQpO1xuICAgICAgICB0aGlzLl9hamF4X2dldCh0aGlzLnVybCwgdXRpbHMub21pdChpdGVtLnByb3BlcnRpZXMsICdfcXV1aWQnKSwgY2FsbGJhY2spO1xuICAgICAgICByZXN1bHRzLnB1c2gobnVsbCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9O1xuXG4gICAgR2ltZWxBZGFwdGVyLnByb3RvdHlwZS5fdXNlcl91dWlkID0gZnVuY3Rpb24oZXhwZXJpbWVudCwgZ29hbCkge1xuICAgICAgaWYgKCFleHBlcmltZW50LnVzZXJfaWQpIHtcbiAgICAgICAgcmV0dXJuIHV0aWxzLnV1aWQoKTtcbiAgICAgIH1cbiAgICAgIGlmICghZ29hbC51bmlxdWUpIHtcbiAgICAgICAgcmV0dXJuIHV0aWxzLnV1aWQoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB1dGlscy5zaGExKHRoaXMubmFtZXNwYWNlICsgXCIuXCIgKyBleHBlcmltZW50Lm5hbWUgKyBcIi5cIiArIGV4cGVyaW1lbnQudXNlcl9pZCk7XG4gICAgfTtcblxuICAgIEdpbWVsQWRhcHRlci5wcm90b3R5cGUuX3RyYWNrID0gZnVuY3Rpb24oZXhwZXJpbWVudCwgdmFyaWFudCwgZ29hbCkge1xuICAgICAgdXRpbHMubG9nKFwiUGVyc2lzdGVudCBRdWV1ZSBHaW1lbCB0cmFjazogXCIgKyB0aGlzLm5hbWVzcGFjZSArIFwiLCBcIiArIGV4cGVyaW1lbnQubmFtZSArIFwiLCBcIiArIHZhcmlhbnQgKyBcIiwgXCIgKyBnb2FsLm5hbWUpO1xuICAgICAgaWYgKHRoaXMuX3F1ZXVlLmxlbmd0aCA+IDEwMCkge1xuICAgICAgICB0aGlzLl9xdWV1ZS5zaGlmdCgpO1xuICAgICAgfVxuICAgICAgdGhpcy5fcXVldWUucHVzaCh7XG4gICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICBleHBlcmltZW50OiBleHBlcmltZW50Lm5hbWUsXG4gICAgICAgICAgX3F1dWlkOiB1dGlscy51dWlkKCksXG4gICAgICAgICAgdXVpZDogdGhpcy5fdXNlcl91dWlkKGV4cGVyaW1lbnQsIGdvYWwpLFxuICAgICAgICAgIHZhcmlhbnQ6IHZhcmlhbnQsXG4gICAgICAgICAgZXZlbnQ6IGdvYWwubmFtZSxcbiAgICAgICAgICBuYW1lc3BhY2U6IHRoaXMubmFtZXNwYWNlXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgdGhpcy5fc3RvcmFnZS5zZXQodGhpcy5xdWV1ZV9uYW1lLCBKU09OLnN0cmluZ2lmeSh0aGlzLl9xdWV1ZSkpO1xuICAgICAgcmV0dXJuIHRoaXMuX2ZsdXNoKCk7XG4gICAgfTtcblxuICAgIEdpbWVsQWRhcHRlci5wcm90b3R5cGUuZXhwZXJpbWVudF9zdGFydCA9IGZ1bmN0aW9uKGV4cGVyaW1lbnQsIHZhcmlhbnQpIHtcbiAgICAgIHJldHVybiB0aGlzLl90cmFjayhleHBlcmltZW50LCB2YXJpYW50LCB7XG4gICAgICAgIG5hbWU6ICdwYXJ0aWNpcGF0ZScsXG4gICAgICAgIHVuaXF1ZTogdHJ1ZVxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIEdpbWVsQWRhcHRlci5wcm90b3R5cGUuZ29hbF9jb21wbGV0ZSA9IGZ1bmN0aW9uKGV4cGVyaW1lbnQsIHZhcmlhbnQsIGdvYWxfbmFtZSwgcHJvcHMpIHtcbiAgICAgIHJldHVybiB0aGlzLl90cmFjayhleHBlcmltZW50LCB2YXJpYW50LCB1dGlscy5kZWZhdWx0cyh7XG4gICAgICAgIG5hbWU6IGdvYWxfbmFtZVxuICAgICAgfSwgcHJvcHMpKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIEdpbWVsQWRhcHRlcjtcblxuICB9KSgpO1xuXG4gIEFkYXB0ZXJzLlBlcnNpc3RlbnRRdWV1ZUdvb2dsZUFuYWx5dGljc0FkYXB0ZXIgPSAoZnVuY3Rpb24oKSB7XG4gICAgUGVyc2lzdGVudFF1ZXVlR29vZ2xlQW5hbHl0aWNzQWRhcHRlci5wcm90b3R5cGUubmFtZXNwYWNlID0gJ2FsZXBoYmV0JztcblxuICAgIFBlcnNpc3RlbnRRdWV1ZUdvb2dsZUFuYWx5dGljc0FkYXB0ZXIucHJvdG90eXBlLnF1ZXVlX25hbWUgPSAnX2dhX3F1ZXVlJztcblxuICAgIGZ1bmN0aW9uIFBlcnNpc3RlbnRRdWV1ZUdvb2dsZUFuYWx5dGljc0FkYXB0ZXIoc3RvcmFnZSkge1xuICAgICAgaWYgKHN0b3JhZ2UgPT0gbnVsbCkge1xuICAgICAgICBzdG9yYWdlID0gQWRhcHRlcnMuTG9jYWxTdG9yYWdlQWRhcHRlcjtcbiAgICAgIH1cbiAgICAgIHRoaXMuZ29hbF9jb21wbGV0ZSA9IGJpbmQodGhpcy5nb2FsX2NvbXBsZXRlLCB0aGlzKTtcbiAgICAgIHRoaXMuZXhwZXJpbWVudF9zdGFydCA9IGJpbmQodGhpcy5leHBlcmltZW50X3N0YXJ0LCB0aGlzKTtcbiAgICAgIHRoaXMuX3N0b3JhZ2UgPSBzdG9yYWdlO1xuICAgICAgdGhpcy5fcXVldWUgPSBKU09OLnBhcnNlKHRoaXMuX3N0b3JhZ2UuZ2V0KHRoaXMucXVldWVfbmFtZSkgfHwgJ1tdJyk7XG4gICAgICB0aGlzLl9mbHVzaCgpO1xuICAgIH1cblxuICAgIFBlcnNpc3RlbnRRdWV1ZUdvb2dsZUFuYWx5dGljc0FkYXB0ZXIucHJvdG90eXBlLl9yZW1vdmVfdXVpZCA9IGZ1bmN0aW9uKHV1aWQpIHtcbiAgICAgIHJldHVybiAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHV0aWxzLnJlbW92ZShfdGhpcy5fcXVldWUsIGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgICAgICByZXR1cm4gZWwudXVpZCA9PT0gdXVpZDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gX3RoaXMuX3N0b3JhZ2Uuc2V0KF90aGlzLnF1ZXVlX25hbWUsIEpTT04uc3RyaW5naWZ5KF90aGlzLl9xdWV1ZSkpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcyk7XG4gICAgfTtcblxuICAgIFBlcnNpc3RlbnRRdWV1ZUdvb2dsZUFuYWx5dGljc0FkYXB0ZXIucHJvdG90eXBlLl9mbHVzaCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGNhbGxiYWNrLCBpLCBpdGVtLCBsZW4sIHJlZiwgcmVzdWx0cztcbiAgICAgIGlmICh0eXBlb2YgZ2EgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhyb3cgJ2dhIG5vdCBkZWZpbmVkLiBQbGVhc2UgbWFrZSBzdXJlIHlvdXIgVW5pdmVyc2FsIGFuYWx5dGljcyBpcyBzZXQgdXAgY29ycmVjdGx5JztcbiAgICAgIH1cbiAgICAgIHJlZiA9IHRoaXMuX3F1ZXVlO1xuICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGl0ZW0gPSByZWZbaV07XG4gICAgICAgIGNhbGxiYWNrID0gdGhpcy5fcmVtb3ZlX3V1aWQoaXRlbS51dWlkKTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKGdhKCdzZW5kJywgJ2V2ZW50JywgaXRlbS5jYXRlZ29yeSwgaXRlbS5hY3Rpb24sIGl0ZW0ubGFiZWwsIHtcbiAgICAgICAgICAnaGl0Q2FsbGJhY2snOiBjYWxsYmFjayxcbiAgICAgICAgICAnbm9uSW50ZXJhY3Rpb24nOiAxXG4gICAgICAgIH0pKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH07XG5cbiAgICBQZXJzaXN0ZW50UXVldWVHb29nbGVBbmFseXRpY3NBZGFwdGVyLnByb3RvdHlwZS5fdHJhY2sgPSBmdW5jdGlvbihjYXRlZ29yeSwgYWN0aW9uLCBsYWJlbCkge1xuICAgICAgdXRpbHMubG9nKFwiUGVyc2lzdGVudCBRdWV1ZSBHb29nbGUgVW5pdmVyc2FsIEFuYWx5dGljcyB0cmFjazogXCIgKyBjYXRlZ29yeSArIFwiLCBcIiArIGFjdGlvbiArIFwiLCBcIiArIGxhYmVsKTtcbiAgICAgIGlmICh0aGlzLl9xdWV1ZS5sZW5ndGggPiAxMDApIHtcbiAgICAgICAgdGhpcy5fcXVldWUuc2hpZnQoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3F1ZXVlLnB1c2goe1xuICAgICAgICB1dWlkOiB1dGlscy51dWlkKCksXG4gICAgICAgIGNhdGVnb3J5OiBjYXRlZ29yeSxcbiAgICAgICAgYWN0aW9uOiBhY3Rpb24sXG4gICAgICAgIGxhYmVsOiBsYWJlbFxuICAgICAgfSk7XG4gICAgICB0aGlzLl9zdG9yYWdlLnNldCh0aGlzLnF1ZXVlX25hbWUsIEpTT04uc3RyaW5naWZ5KHRoaXMuX3F1ZXVlKSk7XG4gICAgICByZXR1cm4gdGhpcy5fZmx1c2goKTtcbiAgICB9O1xuXG4gICAgUGVyc2lzdGVudFF1ZXVlR29vZ2xlQW5hbHl0aWNzQWRhcHRlci5wcm90b3R5cGUuZXhwZXJpbWVudF9zdGFydCA9IGZ1bmN0aW9uKGV4cGVyaW1lbnQsIHZhcmlhbnQpIHtcbiAgICAgIHJldHVybiB0aGlzLl90cmFjayh0aGlzLm5hbWVzcGFjZSwgZXhwZXJpbWVudC5uYW1lICsgXCIgfCBcIiArIHZhcmlhbnQsICdWaXNpdG9ycycpO1xuICAgIH07XG5cbiAgICBQZXJzaXN0ZW50UXVldWVHb29nbGVBbmFseXRpY3NBZGFwdGVyLnByb3RvdHlwZS5nb2FsX2NvbXBsZXRlID0gZnVuY3Rpb24oZXhwZXJpbWVudCwgdmFyaWFudCwgZ29hbF9uYW1lLCBfcHJvcHMpIHtcbiAgICAgIHJldHVybiB0aGlzLl90cmFjayh0aGlzLm5hbWVzcGFjZSwgZXhwZXJpbWVudC5uYW1lICsgXCIgfCBcIiArIHZhcmlhbnQsIGdvYWxfbmFtZSk7XG4gICAgfTtcblxuICAgIHJldHVybiBQZXJzaXN0ZW50UXVldWVHb29nbGVBbmFseXRpY3NBZGFwdGVyO1xuXG4gIH0pKCk7XG5cbiAgQWRhcHRlcnMuUGVyc2lzdGVudFF1ZXVlS2VlbkFkYXB0ZXIgPSAoZnVuY3Rpb24oKSB7XG4gICAgUGVyc2lzdGVudFF1ZXVlS2VlbkFkYXB0ZXIucHJvdG90eXBlLnF1ZXVlX25hbWUgPSAnX2tlZW5fcXVldWUnO1xuXG4gICAgZnVuY3Rpb24gUGVyc2lzdGVudFF1ZXVlS2VlbkFkYXB0ZXIoa2Vlbl9jbGllbnQsIHN0b3JhZ2UpIHtcbiAgICAgIGlmIChzdG9yYWdlID09IG51bGwpIHtcbiAgICAgICAgc3RvcmFnZSA9IEFkYXB0ZXJzLkxvY2FsU3RvcmFnZUFkYXB0ZXI7XG4gICAgICB9XG4gICAgICB0aGlzLmdvYWxfY29tcGxldGUgPSBiaW5kKHRoaXMuZ29hbF9jb21wbGV0ZSwgdGhpcyk7XG4gICAgICB0aGlzLmV4cGVyaW1lbnRfc3RhcnQgPSBiaW5kKHRoaXMuZXhwZXJpbWVudF9zdGFydCwgdGhpcyk7XG4gICAgICB0aGlzLmNsaWVudCA9IGtlZW5fY2xpZW50O1xuICAgICAgdGhpcy5fc3RvcmFnZSA9IHN0b3JhZ2U7XG4gICAgICB0aGlzLl9xdWV1ZSA9IEpTT04ucGFyc2UodGhpcy5fc3RvcmFnZS5nZXQodGhpcy5xdWV1ZV9uYW1lKSB8fCAnW10nKTtcbiAgICAgIHRoaXMuX2ZsdXNoKCk7XG4gICAgfVxuXG4gICAgUGVyc2lzdGVudFF1ZXVlS2VlbkFkYXB0ZXIucHJvdG90eXBlLl9yZW1vdmVfcXV1aWQgPSBmdW5jdGlvbihxdXVpZCkge1xuICAgICAgcmV0dXJuIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZXJyLCByZXMpIHtcbiAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIHV0aWxzLnJlbW92ZShfdGhpcy5fcXVldWUsIGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgICAgICByZXR1cm4gZWwucHJvcGVydGllcy5fcXV1aWQgPT09IHF1dWlkO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBfdGhpcy5fc3RvcmFnZS5zZXQoX3RoaXMucXVldWVfbmFtZSwgSlNPTi5zdHJpbmdpZnkoX3RoaXMuX3F1ZXVlKSk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKTtcbiAgICB9O1xuXG4gICAgUGVyc2lzdGVudFF1ZXVlS2VlbkFkYXB0ZXIucHJvdG90eXBlLl9mbHVzaCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGNhbGxiYWNrLCBpLCBpdGVtLCBsZW4sIHJlZiwgcmVzdWx0cztcbiAgICAgIHJlZiA9IHRoaXMuX3F1ZXVlO1xuICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGl0ZW0gPSByZWZbaV07XG4gICAgICAgIGNhbGxiYWNrID0gdGhpcy5fcmVtb3ZlX3F1dWlkKGl0ZW0ucHJvcGVydGllcy5fcXV1aWQpO1xuICAgICAgICByZXN1bHRzLnB1c2godGhpcy5jbGllbnQuYWRkRXZlbnQoaXRlbS5leHBlcmltZW50X25hbWUsIHV0aWxzLm9taXQoaXRlbS5wcm9wZXJ0aWVzLCAnX3F1dWlkJyksIGNhbGxiYWNrKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9O1xuXG4gICAgUGVyc2lzdGVudFF1ZXVlS2VlbkFkYXB0ZXIucHJvdG90eXBlLl91c2VyX3V1aWQgPSBmdW5jdGlvbihleHBlcmltZW50LCBnb2FsKSB7XG4gICAgICBpZiAoIWV4cGVyaW1lbnQudXNlcl9pZCkge1xuICAgICAgICByZXR1cm4gdXRpbHMudXVpZCgpO1xuICAgICAgfVxuICAgICAgaWYgKCFnb2FsLnVuaXF1ZSkge1xuICAgICAgICByZXR1cm4gdXRpbHMudXVpZCgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHV0aWxzLnNoYTEodGhpcy5uYW1lc3BhY2UgKyBcIi5cIiArIGV4cGVyaW1lbnQubmFtZSArIFwiLlwiICsgZXhwZXJpbWVudC51c2VyX2lkKTtcbiAgICB9O1xuXG4gICAgUGVyc2lzdGVudFF1ZXVlS2VlbkFkYXB0ZXIucHJvdG90eXBlLl90cmFjayA9IGZ1bmN0aW9uKGV4cGVyaW1lbnQsIHZhcmlhbnQsIGdvYWwpIHtcbiAgICAgIHV0aWxzLmxvZyhcIlBlcnNpc3RlbnQgUXVldWUgS2VlbiB0cmFjazogXCIgKyBleHBlcmltZW50Lm5hbWUgKyBcIiwgXCIgKyB2YXJpYW50ICsgXCIsIFwiICsgZXZlbnQpO1xuICAgICAgaWYgKHRoaXMuX3F1ZXVlLmxlbmd0aCA+IDEwMCkge1xuICAgICAgICB0aGlzLl9xdWV1ZS5zaGlmdCgpO1xuICAgICAgfVxuICAgICAgdGhpcy5fcXVldWUucHVzaCh7XG4gICAgICAgIGV4cGVyaW1lbnRfbmFtZTogZXhwZXJpbWVudC5uYW1lLFxuICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgX3F1dWlkOiB1dGlscy51dWlkKCksXG4gICAgICAgICAgdXVpZDogdGhpcy5fdXNlcl91dWlkKGV4cGVyaW1lbnQsIGdvYWwpLFxuICAgICAgICAgIHZhcmlhbnQ6IHZhcmlhbnQsXG4gICAgICAgICAgZXZlbnQ6IGdvYWwubmFtZVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX3N0b3JhZ2Uuc2V0KHRoaXMucXVldWVfbmFtZSwgSlNPTi5zdHJpbmdpZnkodGhpcy5fcXVldWUpKTtcbiAgICAgIHJldHVybiB0aGlzLl9mbHVzaCgpO1xuICAgIH07XG5cbiAgICBQZXJzaXN0ZW50UXVldWVLZWVuQWRhcHRlci5wcm90b3R5cGUuZXhwZXJpbWVudF9zdGFydCA9IGZ1bmN0aW9uKGV4cGVyaW1lbnQsIHZhcmlhbnQpIHtcbiAgICAgIHJldHVybiB0aGlzLl90cmFjayhleHBlcmltZW50LCB2YXJpYW50LCB7XG4gICAgICAgIG5hbWU6ICdwYXJ0aWNpcGF0ZScsXG4gICAgICAgIHVuaXF1ZTogdHJ1ZVxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIFBlcnNpc3RlbnRRdWV1ZUtlZW5BZGFwdGVyLnByb3RvdHlwZS5nb2FsX2NvbXBsZXRlID0gZnVuY3Rpb24oZXhwZXJpbWVudCwgdmFyaWFudCwgZ29hbF9uYW1lLCBwcm9wcykge1xuICAgICAgcmV0dXJuIHRoaXMuX3RyYWNrKGV4cGVyaW1lbnQsIHZhcmlhbnQsIHV0aWxzLmRlZmF1bHRzKHtcbiAgICAgICAgbmFtZTogZ29hbF9uYW1lXG4gICAgICB9LCBwcm9wcykpO1xuICAgIH07XG5cbiAgICByZXR1cm4gUGVyc2lzdGVudFF1ZXVlS2VlbkFkYXB0ZXI7XG5cbiAgfSkoKTtcblxuICBBZGFwdGVycy5Hb29nbGVVbml2ZXJzYWxBbmFseXRpY3NBZGFwdGVyID0gKGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIEdvb2dsZVVuaXZlcnNhbEFuYWx5dGljc0FkYXB0ZXIoKSB7fVxuXG4gICAgR29vZ2xlVW5pdmVyc2FsQW5hbHl0aWNzQWRhcHRlci5uYW1lc3BhY2UgPSAnYWxlcGhiZXQnO1xuXG4gICAgR29vZ2xlVW5pdmVyc2FsQW5hbHl0aWNzQWRhcHRlci5fdHJhY2sgPSBmdW5jdGlvbihjYXRlZ29yeSwgYWN0aW9uLCBsYWJlbCkge1xuICAgICAgdXRpbHMubG9nKFwiR29vZ2xlIFVuaXZlcnNhbCBBbmFseXRpY3MgdHJhY2s6IFwiICsgY2F0ZWdvcnkgKyBcIiwgXCIgKyBhY3Rpb24gKyBcIiwgXCIgKyBsYWJlbCk7XG4gICAgICBpZiAodHlwZW9mIGdhICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRocm93ICdnYSBub3QgZGVmaW5lZC4gUGxlYXNlIG1ha2Ugc3VyZSB5b3VyIFVuaXZlcnNhbCBhbmFseXRpY3MgaXMgc2V0IHVwIGNvcnJlY3RseSc7XG4gICAgICB9XG4gICAgICByZXR1cm4gZ2EoJ3NlbmQnLCAnZXZlbnQnLCBjYXRlZ29yeSwgYWN0aW9uLCBsYWJlbCwge1xuICAgICAgICAnbm9uSW50ZXJhY3Rpb24nOiAxXG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgR29vZ2xlVW5pdmVyc2FsQW5hbHl0aWNzQWRhcHRlci5leHBlcmltZW50X3N0YXJ0ID0gZnVuY3Rpb24oZXhwZXJpbWVudCwgdmFyaWFudCkge1xuICAgICAgcmV0dXJuIEdvb2dsZVVuaXZlcnNhbEFuYWx5dGljc0FkYXB0ZXIuX3RyYWNrKEdvb2dsZVVuaXZlcnNhbEFuYWx5dGljc0FkYXB0ZXIubmFtZXNwYWNlLCBleHBlcmltZW50Lm5hbWUgKyBcIiB8IFwiICsgdmFyaWFudCwgJ1Zpc2l0b3JzJyk7XG4gICAgfTtcblxuICAgIEdvb2dsZVVuaXZlcnNhbEFuYWx5dGljc0FkYXB0ZXIuZ29hbF9jb21wbGV0ZSA9IGZ1bmN0aW9uKGV4cGVyaW1lbnQsIHZhcmlhbnQsIGdvYWxfbmFtZSwgX3Byb3BzKSB7XG4gICAgICByZXR1cm4gR29vZ2xlVW5pdmVyc2FsQW5hbHl0aWNzQWRhcHRlci5fdHJhY2soR29vZ2xlVW5pdmVyc2FsQW5hbHl0aWNzQWRhcHRlci5uYW1lc3BhY2UsIGV4cGVyaW1lbnQubmFtZSArIFwiIHwgXCIgKyB2YXJpYW50LCBnb2FsX25hbWUpO1xuICAgIH07XG5cbiAgICByZXR1cm4gR29vZ2xlVW5pdmVyc2FsQW5hbHl0aWNzQWRhcHRlcjtcblxuICB9KSgpO1xuXG4gIEFkYXB0ZXJzLkxvY2FsU3RvcmFnZUFkYXB0ZXIgPSAoZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gTG9jYWxTdG9yYWdlQWRhcHRlcigpIHt9XG5cbiAgICBMb2NhbFN0b3JhZ2VBZGFwdGVyLm5hbWVzcGFjZSA9ICdhbGVwaGJldCc7XG5cbiAgICBMb2NhbFN0b3JhZ2VBZGFwdGVyLnNldCA9IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgIHJldHVybiBuZXcgU3RvcmFnZSh0aGlzLm5hbWVzcGFjZSkuc2V0KGtleSwgdmFsdWUpO1xuICAgIH07XG5cbiAgICBMb2NhbFN0b3JhZ2VBZGFwdGVyLmdldCA9IGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIG5ldyBTdG9yYWdlKHRoaXMubmFtZXNwYWNlKS5nZXQoa2V5KTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIExvY2FsU3RvcmFnZUFkYXB0ZXI7XG5cbiAgfSkoKTtcblxuICByZXR1cm4gQWRhcHRlcnM7XG5cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gQWRhcHRlcnM7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaUwyaHZiV1V2ZVc5aGRpOWpiMlJsTDJGc1pYQm9ZbVYwTDNOeVl5OWhaR0Z3ZEdWeWN5NWpiMlptWldVaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SXZhRzl0WlM5NWIyRjJMMk52WkdVdllXeGxjR2hpWlhRdmMzSmpMMkZrWVhCMFpYSnpMbU52Wm1abFpTSmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaVFVRkJRU3hKUVVGQkxIZENRVUZCTzBWQlFVRTdPMEZCUVVFc1MwRkJRU3hIUVVGUkxFOUJRVUVzUTBGQlVTeFRRVUZTT3p0QlFVTlNMRTlCUVVFc1IwRkJWU3hQUVVGQkxFTkJRVkVzVjBGQlVqczdRVUZGU2pzN08wVkJVVVVzVVVGQlF5eERRVUZCT3pKQ1FVTk1MRlZCUVVFc1IwRkJXVHM3U1VGRlF5eHpRa0ZCUXl4SFFVRkVMRVZCUVUwc1UwRkJUaXhGUVVGcFFpeFBRVUZxUWpzN1VVRkJhVUlzVlVGQlZTeFJRVUZSTEVOQlFVTTdPenM3VFVGREwwTXNTVUZCUXl4RFFVRkJMRkZCUVVRc1IwRkJXVHROUVVOYUxFbEJRVU1zUTBGQlFTeEhRVUZFTEVkQlFVODdUVUZEVUN4SlFVRkRMRU5CUVVFc1UwRkJSQ3hIUVVGaE8wMUJRMklzU1VGQlF5eERRVUZCTEUxQlFVUXNSMEZCVlN4SlFVRkpMRU5CUVVNc1MwRkJUQ3hEUVVGWExFbEJRVU1zUTBGQlFTeFJRVUZSTEVOQlFVTXNSMEZCVml4RFFVRmpMRWxCUVVNc1EwRkJRU3hWUVVGbUxFTkJRVUVzU1VGQk9FSXNTVUZCZWtNN1RVRkRWaXhKUVVGRExFTkJRVUVzVFVGQlJDeERRVUZCTzBsQlRGYzdPekpDUVU5aUxHRkJRVUVzUjBGQlpTeFRRVUZETEV0QlFVUTdZVUZEWWl4RFFVRkJMRk5CUVVFc1MwRkJRVHRsUVVGQkxGTkJRVU1zUjBGQlJDeEZRVUZOTEVkQlFVNDdWVUZEUlN4SlFVRlZMRWRCUVZZN1FVRkJRU3h0UWtGQlFUczdWVUZEUVN4TFFVRkxMRU5CUVVNc1RVRkJUaXhEUVVGaExFdEJRVU1zUTBGQlFTeE5RVUZrTEVWQlFYTkNMRk5CUVVNc1JVRkJSRHR0UWtGQlVTeEZRVUZGTEVOQlFVTXNWVUZCVlN4RFFVRkRMRTFCUVdRc1MwRkJkMEk3VlVGQmFFTXNRMEZCZEVJN2FVSkJRMEVzUzBGQlF5eERRVUZCTEZGQlFWRXNRMEZCUXl4SFFVRldMRU5CUVdNc1MwRkJReXhEUVVGQkxGVkJRV1lzUlVGQk1rSXNTVUZCU1N4RFFVRkRMRk5CUVV3c1EwRkJaU3hMUVVGRExFTkJRVUVzVFVGQmFFSXNRMEZCTTBJN1VVRklSanROUVVGQkxFTkJRVUVzUTBGQlFTeERRVUZCTEVsQlFVRTdTVUZFWVRzN01rSkJUV1lzVjBGQlFTeEhRVUZoTEZOQlFVTXNSMEZCUkN4RlFVRk5MRWxCUVU0c1JVRkJXU3hSUVVGYU8wMUJRMWdzUzBGQlN5eERRVUZETEVkQlFVNHNRMEZCVlN3eVFrRkJWanRoUVVOQkxFMUJRVTBzUTBGQlF5eE5RVUZOTEVOQlFVTXNTVUZCWkN4RFFVTkZPMUZCUVVFc1RVRkJRU3hGUVVGUkxFdEJRVkk3VVVGRFFTeEhRVUZCTEVWQlFVc3NSMEZFVER0UlFVVkJMRWxCUVVFc1JVRkJUU3hKUVVaT08xRkJSMEVzVDBGQlFTeEZRVUZUTEZGQlNGUTdUMEZFUmp0SlFVWlhPenN5UWtGUllpeGhRVUZCTEVkQlFXVXNVMEZCUXl4SFFVRkVMRVZCUVUwc1NVRkJUaXhGUVVGWkxGRkJRVm83UVVGRFlpeFZRVUZCTzAxQlFVRXNTMEZCU3l4RFFVRkRMRWRCUVU0c1EwRkJWU3d3UWtGQlZqdE5RVU5CTEVkQlFVRXNSMEZCVFN4SlFVRkpMR05CUVVvc1EwRkJRVHROUVVOT0xFMUJRVUU3TzBGQlFWVTdZVUZCUVN4VFFVRkJPenQxUWtGQlJTeERRVUZETEd0Q1FVRkJMRU5CUVcxQ0xFTkJRVzVDTEVOQlFVUXNRMEZCUVN4SFFVRjFRaXhIUVVGMlFpeEhRVUY1UWl4RFFVRkRMR3RDUVVGQkxFTkJRVzFDTEVOQlFXNUNMRU5CUVVRN1FVRkJNMEk3T3p0TlFVTldMRTFCUVVFc1IwRkJVeXhOUVVGTkxFTkJRVU1zU1VGQlVDeERRVUZaTEVkQlFWb3NRMEZCWjBJc1EwRkJReXhQUVVGcVFpeERRVUY1UWl4TlFVRjZRaXhGUVVGcFF5eEhRVUZxUXp0TlFVTlVMRWRCUVVjc1EwRkJReXhKUVVGS0xFTkJRVk1zUzBGQlZDeEZRVUZ0UWl4SFFVRkVMRWRCUVVzc1IwRkJUQ3hIUVVGUkxFMUJRVEZDTzAxQlEwRXNSMEZCUnl4RFFVRkRMRTFCUVVvc1IwRkJZU3hUUVVGQk8xRkJRMWdzU1VGQlJ5eEhRVUZITEVOQlFVTXNUVUZCU2l4TFFVRmpMRWRCUVdwQ08ybENRVU5GTEZGQlFVRXNRMEZCUVN4RlFVUkdPenROUVVSWE8yRkJSMklzUjBGQlJ5eERRVUZETEVsQlFVb3NRMEZCUVR0SlFWUmhPenN5UWtGWFppeFRRVUZCTEVkQlFWY3NVMEZCUXl4SFFVRkVMRVZCUVUwc1NVRkJUaXhGUVVGWkxGRkJRVm83UVVGRFZDeFZRVUZCTzAxQlFVRXNkVU5CUVdkQ0xFTkJRVVVzWVVGQmJFSTdaVUZEUlN4SlFVRkRMRU5CUVVFc1YwRkJSQ3hEUVVGaExFZEJRV0lzUlVGQmEwSXNTVUZCYkVJc1JVRkJkMElzVVVGQmVFSXNSVUZFUmp0UFFVRkJMRTFCUVVFN1pVRkhSU3hKUVVGRExFTkJRVUVzWVVGQlJDeERRVUZsTEVkQlFXWXNSVUZCYjBJc1NVRkJjRUlzUlVGQk1FSXNVVUZCTVVJc1JVRklSanM3U1VGRVV6czdNa0pCVFZnc1RVRkJRU3hIUVVGUkxGTkJRVUU3UVVGRFRpeFZRVUZCTzBGQlFVRTdRVUZCUVR0WFFVRkJMSEZEUVVGQk96dFJRVU5GTEZGQlFVRXNSMEZCVnl4SlFVRkRMRU5CUVVFc1lVRkJSQ3hEUVVGbExFbEJRVWtzUTBGQlF5eFZRVUZWTEVOQlFVTXNUVUZCTDBJN1VVRkRXQ3hKUVVGRExFTkJRVUVzVTBGQlJDeERRVUZYTEVsQlFVTXNRMEZCUVN4SFFVRmFMRVZCUVdsQ0xFdEJRVXNzUTBGQlF5eEpRVUZPTEVOQlFWY3NTVUZCU1N4RFFVRkRMRlZCUVdoQ0xFVkJRVFJDTEZGQlFUVkNMRU5CUVdwQ0xFVkJRWGRFTEZGQlFYaEVPM0ZDUVVOQk8wRkJTRVk3TzBsQlJFMDdPekpDUVUxU0xGVkJRVUVzUjBGQldTeFRRVUZETEZWQlFVUXNSVUZCWVN4SlFVRmlPMDFCUTFZc1NVRkJRU3hEUVVFeVFpeFZRVUZWTEVOQlFVTXNUMEZCZEVNN1FVRkJRU3hsUVVGUExFdEJRVXNzUTBGQlF5eEpRVUZPTEVOQlFVRXNSVUZCVURzN1RVRkZRU3hKUVVGQkxFTkJRVEpDTEVsQlFVa3NRMEZCUXl4TlFVRm9RenRCUVVGQkxHVkJRVThzUzBGQlN5eERRVUZETEVsQlFVNHNRMEZCUVN4RlFVRlFPenRoUVVkQkxFdEJRVXNzUTBGQlF5eEpRVUZPTEVOQlFXTXNTVUZCUXl4RFFVRkJMRk5CUVVZc1IwRkJXU3hIUVVGYUxFZEJRV1VzVlVGQlZTeERRVUZETEVsQlFURkNMRWRCUVN0Q0xFZEJRUzlDTEVkQlFXdERMRlZCUVZVc1EwRkJReXhQUVVFeFJEdEpRVTVWT3pzeVFrRlJXaXhOUVVGQkxFZEJRVkVzVTBGQlF5eFZRVUZFTEVWQlFXRXNUMEZCWWl4RlFVRnpRaXhKUVVGMFFqdE5RVU5PTEV0QlFVc3NRMEZCUXl4SFFVRk9MRU5CUVZVc1owTkJRVUVzUjBGQmFVTXNTVUZCUXl4RFFVRkJMRk5CUVd4RExFZEJRVFJETEVsQlFUVkRMRWRCUVdkRUxGVkJRVlVzUTBGQlF5eEpRVUV6UkN4SFFVRm5SU3hKUVVGb1JTeEhRVUZ2UlN4UFFVRndSU3hIUVVFMFJTeEpRVUUxUlN4SFFVRm5SaXhKUVVGSkxFTkJRVU1zU1VGQkwwWTdUVUZEUVN4SlFVRnRRaXhKUVVGRExFTkJRVUVzVFVGQlRTeERRVUZETEUxQlFWSXNSMEZCYVVJc1IwRkJjRU03VVVGQlFTeEpRVUZETEVOQlFVRXNUVUZCVFN4RFFVRkRMRXRCUVZJc1EwRkJRU3hGUVVGQk96dE5RVU5CTEVsQlFVTXNRMEZCUVN4TlFVRk5MRU5CUVVNc1NVRkJVaXhEUVVORk8xRkJRVUVzVlVGQlFTeEZRVU5GTzFWQlFVRXNWVUZCUVN4RlFVRlpMRlZCUVZVc1EwRkJReXhKUVVGMlFqdFZRVU5CTEUxQlFVRXNSVUZCVVN4TFFVRkxMRU5CUVVNc1NVRkJUaXhEUVVGQkxFTkJSRkk3VlVGRlFTeEpRVUZCTEVWQlFVMHNTVUZCUXl4RFFVRkJMRlZCUVVRc1EwRkJXU3hWUVVGYUxFVkJRWGRDTEVsQlFYaENMRU5CUms0N1ZVRkhRU3hQUVVGQkxFVkJRVk1zVDBGSVZEdFZRVWxCTEV0QlFVRXNSVUZCVHl4SlFVRkpMRU5CUVVNc1NVRktXanRWUVV0QkxGTkJRVUVzUlVGQlZ5eEpRVUZETEVOQlFVRXNVMEZNV2p0VFFVUkdPMDlCUkVZN1RVRlJRU3hKUVVGRExFTkJRVUVzVVVGQlVTeERRVUZETEVkQlFWWXNRMEZCWXl4SlFVRkRMRU5CUVVFc1ZVRkJaaXhGUVVFeVFpeEpRVUZKTEVOQlFVTXNVMEZCVEN4RFFVRmxMRWxCUVVNc1EwRkJRU3hOUVVGb1FpeERRVUV6UWp0aFFVTkJMRWxCUVVNc1EwRkJRU3hOUVVGRUxFTkJRVUU3U1VGYVRUczdNa0pCWTFJc1owSkJRVUVzUjBGQmEwSXNVMEZCUXl4VlFVRkVMRVZCUVdFc1QwRkJZanRoUVVOb1FpeEpRVUZETEVOQlFVRXNUVUZCUkN4RFFVRlJMRlZCUVZJc1JVRkJiMElzVDBGQmNFSXNSVUZCTmtJN1VVRkJReXhKUVVGQkxFVkJRVTBzWVVGQlVEdFJRVUZ6UWl4TlFVRkJMRVZCUVZFc1NVRkJPVUk3VDBGQk4wSTdTVUZFWjBJN096SkNRVWRzUWl4aFFVRkJMRWRCUVdVc1UwRkJReXhWUVVGRUxFVkJRV0VzVDBGQllpeEZRVUZ6UWl4VFFVRjBRaXhGUVVGcFF5eExRVUZxUXp0aFFVTmlMRWxCUVVNc1EwRkJRU3hOUVVGRUxFTkJRVkVzVlVGQlVpeEZRVUZ2UWl4UFFVRndRaXhGUVVFMlFpeExRVUZMTEVOQlFVTXNVVUZCVGl4RFFVRmxPMUZCUVVNc1NVRkJRU3hGUVVGTkxGTkJRVkE3VDBGQlppeEZRVUZyUXl4TFFVRnNReXhEUVVFM1FqdEpRVVJoT3pzN096czdSVUZKV0N4UlFVRkRMRU5CUVVFN2IwUkJRMHdzVTBGQlFTeEhRVUZYT3p0dlJFRkRXQ3hWUVVGQkxFZEJRVms3TzBsQlJVTXNLME5CUVVNc1QwRkJSRHM3VVVGQlF5eFZRVUZWTEZGQlFWRXNRMEZCUXpzN096dE5RVU12UWl4SlFVRkRMRU5CUVVFc1VVRkJSQ3hIUVVGWk8wMUJRMW9zU1VGQlF5eERRVUZCTEUxQlFVUXNSMEZCVlN4SlFVRkpMRU5CUVVNc1MwRkJUQ3hEUVVGWExFbEJRVU1zUTBGQlFTeFJRVUZSTEVOQlFVTXNSMEZCVml4RFFVRmpMRWxCUVVNc1EwRkJRU3hWUVVGbUxFTkJRVUVzU1VGQk9FSXNTVUZCZWtNN1RVRkRWaXhKUVVGRExFTkJRVUVzVFVGQlJDeERRVUZCTzBsQlNGYzdPMjlFUVV0aUxGbEJRVUVzUjBGQll5eFRRVUZETEVsQlFVUTdZVUZEV2l4RFFVRkJMRk5CUVVFc1MwRkJRVHRsUVVGQkxGTkJRVUU3VlVGRFJTeExRVUZMTEVOQlFVTXNUVUZCVGl4RFFVRmhMRXRCUVVNc1EwRkJRU3hOUVVGa0xFVkJRWE5DTEZOQlFVTXNSVUZCUkR0dFFrRkJVU3hGUVVGRkxFTkJRVU1zU1VGQlNDeExRVUZYTzFWQlFXNUNMRU5CUVhSQ08ybENRVU5CTEV0QlFVTXNRMEZCUVN4UlFVRlJMRU5CUVVNc1IwRkJWaXhEUVVGakxFdEJRVU1zUTBGQlFTeFZRVUZtTEVWQlFUSkNMRWxCUVVrc1EwRkJReXhUUVVGTUxFTkJRV1VzUzBGQlF5eERRVUZCTEUxQlFXaENMRU5CUVROQ08xRkJSa1k3VFVGQlFTeERRVUZCTEVOQlFVRXNRMEZCUVN4SlFVRkJPMGxCUkZrN08yOUVRVXRrTEUxQlFVRXNSMEZCVVN4VFFVRkJPMEZCUTA0c1ZVRkJRVHROUVVGQkxFbEJRWGxHTEU5QlFVOHNSVUZCVUN4TFFVRmxMRlZCUVhoSE8wRkJRVUVzWTBGQlRTeG5Sa0ZCVGpzN1FVRkRRVHRCUVVGQk8xZEJRVUVzY1VOQlFVRTdPMUZCUTBVc1VVRkJRU3hIUVVGWExFbEJRVU1zUTBGQlFTeFpRVUZFTEVOQlFXTXNTVUZCU1N4RFFVRkRMRWxCUVc1Q08zRkNRVU5ZTEVWQlFVRXNRMEZCUnl4TlFVRklMRVZCUVZjc1QwRkJXQ3hGUVVGdlFpeEpRVUZKTEVOQlFVTXNVVUZCZWtJc1JVRkJiVU1zU1VGQlNTeERRVUZETEUxQlFYaERMRVZCUVdkRUxFbEJRVWtzUTBGQlF5eExRVUZ5UkN4RlFVRTBSRHRWUVVGRExHRkJRVUVzUlVGQlpTeFJRVUZvUWp0VlFVRXdRaXhuUWtGQlFTeEZRVUZyUWl4RFFVRTFRenRUUVVFMVJEdEJRVVpHT3p0SlFVWk5PenR2UkVGTlVpeE5RVUZCTEVkQlFWRXNVMEZCUXl4UlFVRkVMRVZCUVZjc1RVRkJXQ3hGUVVGdFFpeExRVUZ1UWp0TlFVTk9MRXRCUVVzc1EwRkJReXhIUVVGT0xFTkJRVlVzY1VSQlFVRXNSMEZCYzBRc1VVRkJkRVFzUjBGQkswUXNTVUZCTDBRc1IwRkJiVVVzVFVGQmJrVXNSMEZCTUVVc1NVRkJNVVVzUjBGQk9FVXNTMEZCZUVZN1RVRkRRU3hKUVVGdFFpeEpRVUZETEVOQlFVRXNUVUZCVFN4RFFVRkRMRTFCUVZJc1IwRkJhVUlzUjBGQmNFTTdVVUZCUVN4SlFVRkRMRU5CUVVFc1RVRkJUU3hEUVVGRExFdEJRVklzUTBGQlFTeEZRVUZCT3p0TlFVTkJMRWxCUVVNc1EwRkJRU3hOUVVGTkxFTkJRVU1zU1VGQlVpeERRVUZoTzFGQlFVTXNTVUZCUVN4RlFVRk5MRXRCUVVzc1EwRkJReXhKUVVGT0xFTkJRVUVzUTBGQlVEdFJRVUZ4UWl4UlFVRkJMRVZCUVZVc1VVRkJMMEk3VVVGQmVVTXNUVUZCUVN4RlFVRlJMRTFCUVdwRU8xRkJRWGxFTEV0QlFVRXNSVUZCVHl4TFFVRm9SVHRQUVVGaU8wMUJRMEVzU1VGQlF5eERRVUZCTEZGQlFWRXNRMEZCUXl4SFFVRldMRU5CUVdNc1NVRkJReXhEUVVGQkxGVkJRV1lzUlVGQk1rSXNTVUZCU1N4RFFVRkRMRk5CUVV3c1EwRkJaU3hKUVVGRExFTkJRVUVzVFVGQmFFSXNRMEZCTTBJN1lVRkRRU3hKUVVGRExFTkJRVUVzVFVGQlJDeERRVUZCTzBsQlRFMDdPMjlFUVU5U0xHZENRVUZCTEVkQlFXdENMRk5CUVVNc1ZVRkJSQ3hGUVVGaExFOUJRV0k3WVVGRGFFSXNTVUZCUXl4RFFVRkJMRTFCUVVRc1EwRkJVU3hKUVVGRExFTkJRVUVzVTBGQlZDeEZRVUYxUWl4VlFVRlZMRU5CUVVNc1NVRkJXaXhIUVVGcFFpeExRVUZxUWl4SFFVRnpRaXhQUVVFMVF5eEZRVUYxUkN4VlFVRjJSRHRKUVVSblFqczdiMFJCUjJ4Q0xHRkJRVUVzUjBGQlpTeFRRVUZETEZWQlFVUXNSVUZCWVN4UFFVRmlMRVZCUVhOQ0xGTkJRWFJDTEVWQlFXbERMRTFCUVdwRE8yRkJRMklzU1VGQlF5eERRVUZCTEUxQlFVUXNRMEZCVVN4SlFVRkRMRU5CUVVFc1UwRkJWQ3hGUVVGMVFpeFZRVUZWTEVOQlFVTXNTVUZCV2l4SFFVRnBRaXhMUVVGcVFpeEhRVUZ6UWl4UFFVRTFReXhGUVVGMVJDeFRRVUYyUkR0SlFVUmhPenM3T3pzN1JVRkpXQ3hSUVVGRExFTkJRVUU3ZVVOQlEwd3NWVUZCUVN4SFFVRlpPenRKUVVWRExHOURRVUZETEZkQlFVUXNSVUZCWXl4UFFVRmtPenRSUVVGakxGVkJRVlVzVVVGQlVTeERRVUZET3pzN08wMUJRelZETEVsQlFVTXNRMEZCUVN4TlFVRkVMRWRCUVZVN1RVRkRWaXhKUVVGRExFTkJRVUVzVVVGQlJDeEhRVUZaTzAxQlExb3NTVUZCUXl4RFFVRkJMRTFCUVVRc1IwRkJWU3hKUVVGSkxFTkJRVU1zUzBGQlRDeERRVUZYTEVsQlFVTXNRMEZCUVN4UlFVRlJMRU5CUVVNc1IwRkJWaXhEUVVGakxFbEJRVU1zUTBGQlFTeFZRVUZtTEVOQlFVRXNTVUZCT0VJc1NVRkJla003VFVGRFZpeEpRVUZETEVOQlFVRXNUVUZCUkN4RFFVRkJPMGxCU2xjN08zbERRVTFpTEdGQlFVRXNSMEZCWlN4VFFVRkRMRXRCUVVRN1lVRkRZaXhEUVVGQkxGTkJRVUVzUzBGQlFUdGxRVUZCTEZOQlFVTXNSMEZCUkN4RlFVRk5MRWRCUVU0N1ZVRkRSU3hKUVVGVkxFZEJRVlk3UVVGQlFTeHRRa0ZCUVRzN1ZVRkRRU3hMUVVGTExFTkJRVU1zVFVGQlRpeERRVUZoTEV0QlFVTXNRMEZCUVN4TlFVRmtMRVZCUVhOQ0xGTkJRVU1zUlVGQlJEdHRRa0ZCVVN4RlFVRkZMRU5CUVVNc1ZVRkJWU3hEUVVGRExFMUJRV1FzUzBGQmQwSTdWVUZCYUVNc1EwRkJkRUk3YVVKQlEwRXNTMEZCUXl4RFFVRkJMRkZCUVZFc1EwRkJReXhIUVVGV0xFTkJRV01zUzBGQlF5eERRVUZCTEZWQlFXWXNSVUZCTWtJc1NVRkJTU3hEUVVGRExGTkJRVXdzUTBGQlpTeExRVUZETEVOQlFVRXNUVUZCYUVJc1EwRkJNMEk3VVVGSVJqdE5RVUZCTEVOQlFVRXNRMEZCUVN4RFFVRkJMRWxCUVVFN1NVRkVZVHM3ZVVOQlRXWXNUVUZCUVN4SFFVRlJMRk5CUVVFN1FVRkRUaXhWUVVGQk8wRkJRVUU3UVVGQlFUdFhRVUZCTEhGRFFVRkJPenRSUVVORkxGRkJRVUVzUjBGQlZ5eEpRVUZETEVOQlFVRXNZVUZCUkN4RFFVRmxMRWxCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU1zVFVGQkwwSTdjVUpCUTFnc1NVRkJReXhEUVVGQkxFMUJRVTBzUTBGQlF5eFJRVUZTTEVOQlFXbENMRWxCUVVrc1EwRkJReXhsUVVGMFFpeEZRVUYxUXl4TFFVRkxMRU5CUVVNc1NVRkJUaXhEUVVGWExFbEJRVWtzUTBGQlF5eFZRVUZvUWl4RlFVRTBRaXhSUVVFMVFpeERRVUYyUXl4RlFVRTRSU3hSUVVFNVJUdEJRVVpHT3p0SlFVUk5PenQ1UTBGTFVpeFZRVUZCTEVkQlFWa3NVMEZCUXl4VlFVRkVMRVZCUVdFc1NVRkJZanROUVVOV0xFbEJRVUVzUTBGQk1rSXNWVUZCVlN4RFFVRkRMRTlCUVhSRE8wRkJRVUVzWlVGQlR5eExRVUZMTEVOQlFVTXNTVUZCVGl4RFFVRkJMRVZCUVZBN08wMUJSVUVzU1VGQlFTeERRVUV5UWl4SlFVRkpMRU5CUVVNc1RVRkJhRU03UVVGQlFTeGxRVUZQTEV0QlFVc3NRMEZCUXl4SlFVRk9MRU5CUVVFc1JVRkJVRHM3WVVGSFFTeExRVUZMTEVOQlFVTXNTVUZCVGl4RFFVRmpMRWxCUVVNc1EwRkJRU3hUUVVGR0xFZEJRVmtzUjBGQldpeEhRVUZsTEZWQlFWVXNRMEZCUXl4SlFVRXhRaXhIUVVFclFpeEhRVUV2UWl4SFFVRnJReXhWUVVGVkxFTkJRVU1zVDBGQk1VUTdTVUZPVlRzN2VVTkJVVm9zVFVGQlFTeEhRVUZSTEZOQlFVTXNWVUZCUkN4RlFVRmhMRTlCUVdJc1JVRkJjMElzU1VGQmRFSTdUVUZEVGl4TFFVRkxMRU5CUVVNc1IwRkJUaXhEUVVGVkxDdENRVUZCTEVkQlFXZERMRlZCUVZVc1EwRkJReXhKUVVFelF5eEhRVUZuUkN4SlFVRm9SQ3hIUVVGdlJDeFBRVUZ3UkN4SFFVRTBSQ3hKUVVFMVJDeEhRVUZuUlN4TFFVRXhSVHROUVVOQkxFbEJRVzFDTEVsQlFVTXNRMEZCUVN4TlFVRk5MRU5CUVVNc1RVRkJVaXhIUVVGcFFpeEhRVUZ3UXp0UlFVRkJMRWxCUVVNc1EwRkJRU3hOUVVGTkxFTkJRVU1zUzBGQlVpeERRVUZCTEVWQlFVRTdPMDFCUTBFc1NVRkJReXhEUVVGQkxFMUJRVTBzUTBGQlF5eEpRVUZTTEVOQlEwVTdVVUZCUVN4bFFVRkJMRVZCUVdsQ0xGVkJRVlVzUTBGQlF5eEpRVUUxUWp0UlFVTkJMRlZCUVVFc1JVRkRSVHRWUVVGQkxFMUJRVUVzUlVGQlVTeExRVUZMTEVOQlFVTXNTVUZCVGl4RFFVRkJMRU5CUVZJN1ZVRkRRU3hKUVVGQkxFVkJRVTBzU1VGQlF5eERRVUZCTEZWQlFVUXNRMEZCV1N4VlFVRmFMRVZCUVhkQ0xFbEJRWGhDTEVOQlJFNDdWVUZGUVN4UFFVRkJMRVZCUVZNc1QwRkdWRHRWUVVkQkxFdEJRVUVzUlVGQlR5eEpRVUZKTEVOQlFVTXNTVUZJV2p0VFFVWkdPMDlCUkVZN1RVRlBRU3hKUVVGRExFTkJRVUVzVVVGQlVTeERRVUZETEVkQlFWWXNRMEZCWXl4SlFVRkRMRU5CUVVFc1ZVRkJaaXhGUVVFeVFpeEpRVUZKTEVOQlFVTXNVMEZCVEN4RFFVRmxMRWxCUVVNc1EwRkJRU3hOUVVGb1FpeERRVUV6UWp0aFFVTkJMRWxCUVVNc1EwRkJRU3hOUVVGRUxFTkJRVUU3U1VGWVRUczdlVU5CWVZJc1owSkJRVUVzUjBGQmEwSXNVMEZCUXl4VlFVRkVMRVZCUVdFc1QwRkJZanRoUVVOb1FpeEpRVUZETEVOQlFVRXNUVUZCUkN4RFFVRlJMRlZCUVZJc1JVRkJiMElzVDBGQmNFSXNSVUZCTmtJN1VVRkJReXhKUVVGQkxFVkJRVTBzWVVGQlVEdFJRVUZ6UWl4TlFVRkJMRVZCUVZFc1NVRkJPVUk3VDBGQk4wSTdTVUZFWjBJN08zbERRVWRzUWl4aFFVRkJMRWRCUVdVc1UwRkJReXhWUVVGRUxFVkJRV0VzVDBGQllpeEZRVUZ6UWl4VFFVRjBRaXhGUVVGcFF5eExRVUZxUXp0aFFVTmlMRWxCUVVNc1EwRkJRU3hOUVVGRUxFTkJRVkVzVlVGQlVpeEZRVUZ2UWl4UFFVRndRaXhGUVVFMlFpeExRVUZMTEVOQlFVTXNVVUZCVGl4RFFVRmxPMUZCUVVNc1NVRkJRU3hGUVVGTkxGTkJRVkE3VDBGQlppeEZRVUZyUXl4TFFVRnNReXhEUVVFM1FqdEpRVVJoT3pzN096czdSVUZKV0N4UlFVRkRMRU5CUVVFN096dEpRVU5NTEN0Q1FVRkRMRU5CUVVFc1UwRkJSQ3hIUVVGWk96dEpRVVZhTEN0Q1FVRkRMRU5CUVVFc1RVRkJSQ3hIUVVGVExGTkJRVU1zVVVGQlJDeEZRVUZYTEUxQlFWZ3NSVUZCYlVJc1MwRkJia0k3VFVGRFVDeExRVUZMTEVOQlFVTXNSMEZCVGl4RFFVRlZMRzlEUVVGQkxFZEJRWEZETEZGQlFYSkRMRWRCUVRoRExFbEJRVGxETEVkQlFXdEVMRTFCUVd4RUxFZEJRWGxFTEVsQlFYcEVMRWRCUVRaRUxFdEJRWFpGTzAxQlEwRXNTVUZCZVVZc1QwRkJUeXhGUVVGUUxFdEJRV1VzVlVGQmVFYzdRVUZCUVN4alFVRk5MR2RHUVVGT096dGhRVU5CTEVWQlFVRXNRMEZCUnl4TlFVRklMRVZCUVZjc1QwRkJXQ3hGUVVGdlFpeFJRVUZ3UWl4RlFVRTRRaXhOUVVFNVFpeEZRVUZ6UXl4TFFVRjBReXhGUVVFMlF6dFJRVUZETEdkQ1FVRkJMRVZCUVd0Q0xFTkJRVzVDTzA5QlFUZERPMGxCU0U4N08wbEJTMVFzSzBKQlFVTXNRMEZCUVN4blFrRkJSQ3hIUVVGdFFpeFRRVUZETEZWQlFVUXNSVUZCWVN4UFFVRmlPMkZCUTJwQ0xDdENRVUZETEVOQlFVRXNUVUZCUkN4RFFVRlJMQ3RDUVVGRExFTkJRVUVzVTBGQlZDeEZRVUYxUWl4VlFVRlZMRU5CUVVNc1NVRkJXaXhIUVVGcFFpeExRVUZxUWl4SFFVRnpRaXhQUVVFMVF5eEZRVUYxUkN4VlFVRjJSRHRKUVVScFFqczdTVUZIYmtJc0swSkJRVU1zUTBGQlFTeGhRVUZFTEVkQlFXZENMRk5CUVVNc1ZVRkJSQ3hGUVVGaExFOUJRV0lzUlVGQmMwSXNVMEZCZEVJc1JVRkJhVU1zVFVGQmFrTTdZVUZEWkN3clFrRkJReXhEUVVGQkxFMUJRVVFzUTBGQlVTd3JRa0ZCUXl4RFFVRkJMRk5CUVZRc1JVRkJkVUlzVlVGQlZTeERRVUZETEVsQlFWb3NSMEZCYVVJc1MwRkJha0lzUjBGQmMwSXNUMEZCTlVNc1JVRkJkVVFzVTBGQmRrUTdTVUZFWXpzN096czdPMFZCU1Zvc1VVRkJReXhEUVVGQk96czdTVUZEVEN4dFFrRkJReXhEUVVGQkxGTkJRVVFzUjBGQldUczdTVUZEV2l4dFFrRkJReXhEUVVGQkxFZEJRVVFzUjBGQlRTeFRRVUZETEVkQlFVUXNSVUZCVFN4TFFVRk9PMkZCUTBvc1NVRkJTU3hQUVVGS0xFTkJRVmtzU1VGQlF5eERRVUZCTEZOQlFXSXNRMEZCZFVJc1EwRkJReXhIUVVGNFFpeERRVUUwUWl4SFFVRTFRaXhGUVVGcFF5eExRVUZxUXp0SlFVUkpPenRKUVVWT0xHMUNRVUZETEVOQlFVRXNSMEZCUkN4SFFVRk5MRk5CUVVNc1IwRkJSRHRoUVVOS0xFbEJRVWtzVDBGQlNpeERRVUZaTEVsQlFVTXNRMEZCUVN4VFFVRmlMRU5CUVhWQ0xFTkJRVU1zUjBGQmVFSXNRMEZCTkVJc1IwRkJOVUk3U1VGRVNUczdPenM3T3pzN096dEJRVWxXTEUxQlFVMHNRMEZCUXl4UFFVRlFMRWRCUVdsQ0luMD1cbiIsInZhciBBbGVwaEJldCwgYWRhcHRlcnMsIG9wdGlvbnMsIHV0aWxzLFxuICBiaW5kID0gZnVuY3Rpb24oZm4sIG1lKXsgcmV0dXJuIGZ1bmN0aW9uKCl7IHJldHVybiBmbi5hcHBseShtZSwgYXJndW1lbnRzKTsgfTsgfTtcblxudXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbmFkYXB0ZXJzID0gcmVxdWlyZSgnLi9hZGFwdGVycycpO1xuXG5vcHRpb25zID0gcmVxdWlyZSgnLi9vcHRpb25zJyk7XG5cbkFsZXBoQmV0ID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBBbGVwaEJldCgpIHt9XG5cbiAgQWxlcGhCZXQub3B0aW9ucyA9IG9wdGlvbnM7XG5cbiAgQWxlcGhCZXQudXRpbHMgPSB1dGlscztcblxuICBBbGVwaEJldC5HaW1lbEFkYXB0ZXIgPSBhZGFwdGVycy5HaW1lbEFkYXB0ZXI7XG5cbiAgQWxlcGhCZXQuUGVyc2lzdGVudFF1ZXVlR29vZ2xlQW5hbHl0aWNzQWRhcHRlciA9IGFkYXB0ZXJzLlBlcnNpc3RlbnRRdWV1ZUdvb2dsZUFuYWx5dGljc0FkYXB0ZXI7XG5cbiAgQWxlcGhCZXQuUGVyc2lzdGVudFF1ZXVlS2VlbkFkYXB0ZXIgPSBhZGFwdGVycy5QZXJzaXN0ZW50UXVldWVLZWVuQWRhcHRlcjtcblxuICBBbGVwaEJldC5FeHBlcmltZW50ID0gKGZ1bmN0aW9uKCkge1xuICAgIHZhciBfcnVuLCBfdmFsaWRhdGU7XG5cbiAgICBFeHBlcmltZW50Ll9vcHRpb25zID0ge1xuICAgICAgbmFtZTogbnVsbCxcbiAgICAgIHZhcmlhbnRzOiBudWxsLFxuICAgICAgdXNlcl9pZDogbnVsbCxcbiAgICAgIHNhbXBsZTogMS4wLFxuICAgICAgdHJpZ2dlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSxcbiAgICAgIHRyYWNraW5nX2FkYXB0ZXI6IGFkYXB0ZXJzLkdvb2dsZVVuaXZlcnNhbEFuYWx5dGljc0FkYXB0ZXIsXG4gICAgICBzdG9yYWdlX2FkYXB0ZXI6IGFkYXB0ZXJzLkxvY2FsU3RvcmFnZUFkYXB0ZXJcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gRXhwZXJpbWVudChvcHRpb25zMSkge1xuICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9uczEgIT0gbnVsbCA/IG9wdGlvbnMxIDoge307XG4gICAgICB0aGlzLmFkZF9nb2FscyA9IGJpbmQodGhpcy5hZGRfZ29hbHMsIHRoaXMpO1xuICAgICAgdGhpcy5hZGRfZ29hbCA9IGJpbmQodGhpcy5hZGRfZ29hbCwgdGhpcyk7XG4gICAgICB1dGlscy5kZWZhdWx0cyh0aGlzLm9wdGlvbnMsIEV4cGVyaW1lbnQuX29wdGlvbnMpO1xuICAgICAgX3ZhbGlkYXRlLmNhbGwodGhpcyk7XG4gICAgICB0aGlzLm5hbWUgPSB0aGlzLm9wdGlvbnMubmFtZTtcbiAgICAgIHRoaXMudmFyaWFudHMgPSB0aGlzLm9wdGlvbnMudmFyaWFudHM7XG4gICAgICB0aGlzLnVzZXJfaWQgPSB0aGlzLm9wdGlvbnMudXNlcl9pZDtcbiAgICAgIHRoaXMudmFyaWFudF9uYW1lcyA9IHV0aWxzLmtleXModGhpcy52YXJpYW50cyk7XG4gICAgICBfcnVuLmNhbGwodGhpcyk7XG4gICAgfVxuXG4gICAgRXhwZXJpbWVudC5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdmFyaWFudDtcbiAgICAgIHV0aWxzLmxvZyhcInJ1bm5pbmcgd2l0aCBvcHRpb25zOiBcIiArIChKU09OLnN0cmluZ2lmeSh0aGlzLm9wdGlvbnMpKSk7XG4gICAgICBpZiAodmFyaWFudCA9IHRoaXMuZ2V0X3N0b3JlZF92YXJpYW50KCkpIHtcbiAgICAgICAgdXRpbHMubG9nKHZhcmlhbnQgKyBcIiBhY3RpdmVcIik7XG4gICAgICAgIHJldHVybiB0aGlzLmFjdGl2YXRlX3ZhcmlhbnQodmFyaWFudCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25hbGx5X2FjdGl2YXRlX3ZhcmlhbnQoKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgX3J1biA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMucnVuKCk7XG4gICAgfTtcblxuICAgIEV4cGVyaW1lbnQucHJvdG90eXBlLmFjdGl2YXRlX3ZhcmlhbnQgPSBmdW5jdGlvbih2YXJpYW50KSB7XG4gICAgICB2YXIgcmVmO1xuICAgICAgaWYgKChyZWYgPSB0aGlzLnZhcmlhbnRzW3ZhcmlhbnRdKSAhPSBudWxsKSB7XG4gICAgICAgIHJlZi5hY3RpdmF0ZSh0aGlzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnN0b3JhZ2UoKS5zZXQodGhpcy5vcHRpb25zLm5hbWUgKyBcIjp2YXJpYW50XCIsIHZhcmlhbnQpO1xuICAgIH07XG5cbiAgICBFeHBlcmltZW50LnByb3RvdHlwZS5jb25kaXRpb25hbGx5X2FjdGl2YXRlX3ZhcmlhbnQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB2YXJpYW50O1xuICAgICAgaWYgKCF0aGlzLm9wdGlvbnMudHJpZ2dlcigpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHV0aWxzLmxvZygndHJpZ2dlciBzZXQnKTtcbiAgICAgIGlmICghdGhpcy5pbl9zYW1wbGUoKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB1dGlscy5sb2coJ2luIHNhbXBsZScpO1xuICAgICAgdmFyaWFudCA9IHRoaXMucGlja192YXJpYW50KCk7XG4gICAgICB0aGlzLnRyYWNraW5nKCkuZXhwZXJpbWVudF9zdGFydCh0aGlzLCB2YXJpYW50KTtcbiAgICAgIHJldHVybiB0aGlzLmFjdGl2YXRlX3ZhcmlhbnQodmFyaWFudCk7XG4gICAgfTtcblxuICAgIEV4cGVyaW1lbnQucHJvdG90eXBlLmdvYWxfY29tcGxldGUgPSBmdW5jdGlvbihnb2FsX25hbWUsIHByb3BzKSB7XG4gICAgICB2YXIgdmFyaWFudDtcbiAgICAgIGlmIChwcm9wcyA9PSBudWxsKSB7XG4gICAgICAgIHByb3BzID0ge307XG4gICAgICB9XG4gICAgICB1dGlscy5kZWZhdWx0cyhwcm9wcywge1xuICAgICAgICB1bmlxdWU6IHRydWVcbiAgICAgIH0pO1xuICAgICAgaWYgKHByb3BzLnVuaXF1ZSAmJiB0aGlzLnN0b3JhZ2UoKS5nZXQodGhpcy5vcHRpb25zLm5hbWUgKyBcIjpcIiArIGdvYWxfbmFtZSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdmFyaWFudCA9IHRoaXMuZ2V0X3N0b3JlZF92YXJpYW50KCk7XG4gICAgICBpZiAoIXZhcmlhbnQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKHByb3BzLnVuaXF1ZSkge1xuICAgICAgICB0aGlzLnN0b3JhZ2UoKS5zZXQodGhpcy5vcHRpb25zLm5hbWUgKyBcIjpcIiArIGdvYWxfbmFtZSwgdHJ1ZSk7XG4gICAgICB9XG4gICAgICB1dGlscy5sb2coXCJleHBlcmltZW50OiBcIiArIHRoaXMub3B0aW9ucy5uYW1lICsgXCIgdmFyaWFudDpcIiArIHZhcmlhbnQgKyBcIiBnb2FsOlwiICsgZ29hbF9uYW1lICsgXCIgY29tcGxldGVcIik7XG4gICAgICByZXR1cm4gdGhpcy50cmFja2luZygpLmdvYWxfY29tcGxldGUodGhpcywgdmFyaWFudCwgZ29hbF9uYW1lLCBwcm9wcyk7XG4gICAgfTtcblxuICAgIEV4cGVyaW1lbnQucHJvdG90eXBlLmdldF9zdG9yZWRfdmFyaWFudCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuc3RvcmFnZSgpLmdldCh0aGlzLm9wdGlvbnMubmFtZSArIFwiOnZhcmlhbnRcIik7XG4gICAgfTtcblxuICAgIEV4cGVyaW1lbnQucHJvdG90eXBlLnBpY2tfdmFyaWFudCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGFsbF92YXJpYW50c19oYXZlX3dlaWdodHM7XG4gICAgICBhbGxfdmFyaWFudHNfaGF2ZV93ZWlnaHRzID0gdXRpbHMuY2hlY2tfd2VpZ2h0cyh0aGlzLnZhcmlhbnRzKTtcbiAgICAgIHV0aWxzLmxvZyhcImFsbCB2YXJpYW50cyBoYXZlIHdlaWdodHM6IFwiICsgYWxsX3ZhcmlhbnRzX2hhdmVfd2VpZ2h0cyk7XG4gICAgICBpZiAoYWxsX3ZhcmlhbnRzX2hhdmVfd2VpZ2h0cykge1xuICAgICAgICByZXR1cm4gdGhpcy5waWNrX3dlaWdodGVkX3ZhcmlhbnQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBpY2tfdW53ZWlnaHRlZF92YXJpYW50KCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIEV4cGVyaW1lbnQucHJvdG90eXBlLnBpY2tfd2VpZ2h0ZWRfdmFyaWFudCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGtleSwgcmVmLCB2YWx1ZSwgd2VpZ2h0ZWRfaW5kZXgsIHdlaWdodHNfc3VtO1xuICAgICAgd2VpZ2h0c19zdW0gPSB1dGlscy5zdW1fd2VpZ2h0cyh0aGlzLnZhcmlhbnRzKTtcbiAgICAgIHdlaWdodGVkX2luZGV4ID0gTWF0aC5jZWlsKHRoaXMuX3JhbmRvbSgndmFyaWFudCcpICogd2VpZ2h0c19zdW0pO1xuICAgICAgcmVmID0gdGhpcy52YXJpYW50cztcbiAgICAgIGZvciAoa2V5IGluIHJlZikge1xuICAgICAgICB2YWx1ZSA9IHJlZltrZXldO1xuICAgICAgICB3ZWlnaHRlZF9pbmRleCAtPSB2YWx1ZS53ZWlnaHQ7XG4gICAgICAgIGlmICh3ZWlnaHRlZF9pbmRleCA8PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIGtleTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICBFeHBlcmltZW50LnByb3RvdHlwZS5waWNrX3Vud2VpZ2h0ZWRfdmFyaWFudCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGNob3Nlbl9wYXJ0aXRpb24sIHBhcnRpdGlvbnMsIHZhcmlhbnQ7XG4gICAgICBwYXJ0aXRpb25zID0gMS4wIC8gdGhpcy52YXJpYW50X25hbWVzLmxlbmd0aDtcbiAgICAgIGNob3Nlbl9wYXJ0aXRpb24gPSBNYXRoLmZsb29yKHRoaXMuX3JhbmRvbSgndmFyaWFudCcpIC8gcGFydGl0aW9ucyk7XG4gICAgICB2YXJpYW50ID0gdGhpcy52YXJpYW50X25hbWVzW2Nob3Nlbl9wYXJ0aXRpb25dO1xuICAgICAgdXRpbHMubG9nKHZhcmlhbnQgKyBcIiBwaWNrZWRcIik7XG4gICAgICByZXR1cm4gdmFyaWFudDtcbiAgICB9O1xuXG4gICAgRXhwZXJpbWVudC5wcm90b3R5cGUuaW5fc2FtcGxlID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYWN0aXZlO1xuICAgICAgYWN0aXZlID0gdGhpcy5zdG9yYWdlKCkuZ2V0KHRoaXMub3B0aW9ucy5uYW1lICsgXCI6aW5fc2FtcGxlXCIpO1xuICAgICAgaWYgKHR5cGVvZiBhY3RpdmUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybiBhY3RpdmU7XG4gICAgICB9XG4gICAgICBhY3RpdmUgPSB0aGlzLl9yYW5kb20oJ3NhbXBsZScpIDw9IHRoaXMub3B0aW9ucy5zYW1wbGU7XG4gICAgICB0aGlzLnN0b3JhZ2UoKS5zZXQodGhpcy5vcHRpb25zLm5hbWUgKyBcIjppbl9zYW1wbGVcIiwgYWN0aXZlKTtcbiAgICAgIHJldHVybiBhY3RpdmU7XG4gICAgfTtcblxuICAgIEV4cGVyaW1lbnQucHJvdG90eXBlLl9yYW5kb20gPSBmdW5jdGlvbihzYWx0KSB7XG4gICAgICB2YXIgc2VlZDtcbiAgICAgIGlmICghdGhpcy51c2VyX2lkKSB7XG4gICAgICAgIHJldHVybiB1dGlscy5yYW5kb20oKTtcbiAgICAgIH1cbiAgICAgIHNlZWQgPSB0aGlzLm5hbWUgKyBcIi5cIiArIHNhbHQgKyBcIi5cIiArIHRoaXMudXNlcl9pZDtcbiAgICAgIHJldHVybiB1dGlscy5yYW5kb20oc2VlZCk7XG4gICAgfTtcblxuICAgIEV4cGVyaW1lbnQucHJvdG90eXBlLmFkZF9nb2FsID0gZnVuY3Rpb24oZ29hbCkge1xuICAgICAgcmV0dXJuIGdvYWwuYWRkX2V4cGVyaW1lbnQodGhpcyk7XG4gICAgfTtcblxuICAgIEV4cGVyaW1lbnQucHJvdG90eXBlLmFkZF9nb2FscyA9IGZ1bmN0aW9uKGdvYWxzKSB7XG4gICAgICB2YXIgZ29hbCwgaSwgbGVuLCByZXN1bHRzO1xuICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChpID0gMCwgbGVuID0gZ29hbHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgZ29hbCA9IGdvYWxzW2ldO1xuICAgICAgICByZXN1bHRzLnB1c2godGhpcy5hZGRfZ29hbChnb2FsKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9O1xuXG4gICAgRXhwZXJpbWVudC5wcm90b3R5cGUuc3RvcmFnZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5zdG9yYWdlX2FkYXB0ZXI7XG4gICAgfTtcblxuICAgIEV4cGVyaW1lbnQucHJvdG90eXBlLnRyYWNraW5nID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5vcHRpb25zLnRyYWNraW5nX2FkYXB0ZXI7XG4gICAgfTtcblxuICAgIF92YWxpZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGFsbF92YXJpYW50c19oYXZlX3dlaWdodHM7XG4gICAgICBpZiAodGhpcy5vcHRpb25zLm5hbWUgPT09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgJ2FuIGV4cGVyaW1lbnQgbmFtZSBtdXN0IGJlIHNwZWNpZmllZCc7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5vcHRpb25zLnZhcmlhbnRzID09PSBudWxsKSB7XG4gICAgICAgIHRocm93ICd2YXJpYW50cyBtdXN0IGJlIHByb3ZpZGVkJztcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLnRyaWdnZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhyb3cgJ3RyaWdnZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJztcbiAgICAgIH1cbiAgICAgIGFsbF92YXJpYW50c19oYXZlX3dlaWdodHMgPSB1dGlscy52YWxpZGF0ZV93ZWlnaHRzKHRoaXMub3B0aW9ucy52YXJpYW50cyk7XG4gICAgICBpZiAoIWFsbF92YXJpYW50c19oYXZlX3dlaWdodHMpIHtcbiAgICAgICAgdGhyb3cgJ25vdCBhbGwgdmFyaWFudHMgaGF2ZSB3ZWlnaHRzJztcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIEV4cGVyaW1lbnQ7XG5cbiAgfSkoKTtcblxuICBBbGVwaEJldC5Hb2FsID0gKGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIEdvYWwobmFtZSwgcHJvcHMxKSB7XG4gICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgdGhpcy5wcm9wcyA9IHByb3BzMSAhPSBudWxsID8gcHJvcHMxIDoge307XG4gICAgICB1dGlscy5kZWZhdWx0cyh0aGlzLnByb3BzLCB7XG4gICAgICAgIHVuaXF1ZTogdHJ1ZVxuICAgICAgfSk7XG4gICAgICB0aGlzLmV4cGVyaW1lbnRzID0gW107XG4gICAgfVxuXG4gICAgR29hbC5wcm90b3R5cGUuYWRkX2V4cGVyaW1lbnQgPSBmdW5jdGlvbihleHBlcmltZW50KSB7XG4gICAgICByZXR1cm4gdGhpcy5leHBlcmltZW50cy5wdXNoKGV4cGVyaW1lbnQpO1xuICAgIH07XG5cbiAgICBHb2FsLnByb3RvdHlwZS5hZGRfZXhwZXJpbWVudHMgPSBmdW5jdGlvbihleHBlcmltZW50cykge1xuICAgICAgdmFyIGV4cGVyaW1lbnQsIGksIGxlbiwgcmVzdWx0cztcbiAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoaSA9IDAsIGxlbiA9IGV4cGVyaW1lbnRzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGV4cGVyaW1lbnQgPSBleHBlcmltZW50c1tpXTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKHRoaXMuYWRkX2V4cGVyaW1lbnQoZXhwZXJpbWVudCkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfTtcblxuICAgIEdvYWwucHJvdG90eXBlLmNvbXBsZXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZXhwZXJpbWVudCwgaSwgbGVuLCByZWYsIHJlc3VsdHM7XG4gICAgICByZWYgPSB0aGlzLmV4cGVyaW1lbnRzO1xuICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGV4cGVyaW1lbnQgPSByZWZbaV07XG4gICAgICAgIHJlc3VsdHMucHVzaChleHBlcmltZW50LmdvYWxfY29tcGxldGUodGhpcy5uYW1lLCB0aGlzLnByb3BzKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9O1xuXG4gICAgcmV0dXJuIEdvYWw7XG5cbiAgfSkoKTtcblxuICByZXR1cm4gQWxlcGhCZXQ7XG5cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gQWxlcGhCZXQ7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaUwyaHZiV1V2ZVc5aGRpOWpiMlJsTDJGc1pYQm9ZbVYwTDNOeVl5OWhiR1Z3YUdKbGRDNWpiMlptWldVaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SXZhRzl0WlM5NWIyRjJMMk52WkdVdllXeGxjR2hpWlhRdmMzSmpMMkZzWlhCb1ltVjBMbU52Wm1abFpTSmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaVFVRkJRU3hKUVVGQkxHdERRVUZCTzBWQlFVRTdPMEZCUVVFc1MwRkJRU3hIUVVGUkxFOUJRVUVzUTBGQlVTeFRRVUZTT3p0QlFVTlNMRkZCUVVFc1IwRkJWeXhQUVVGQkxFTkJRVkVzV1VGQlVqczdRVUZEV0N4UFFVRkJMRWRCUVZVc1QwRkJRU3hEUVVGUkxGZEJRVkk3TzBGQlJVbzdPenRGUVVOS0xGRkJRVU1zUTBGQlFTeFBRVUZFTEVkQlFWYzdPMFZCUTFnc1VVRkJReXhEUVVGQkxFdEJRVVFzUjBGQlV6czdSVUZGVkN4UlFVRkRMRU5CUVVFc1dVRkJSQ3hIUVVGblFpeFJRVUZSTEVOQlFVTTdPMFZCUTNwQ0xGRkJRVU1zUTBGQlFTeHhRMEZCUkN4SFFVRjVReXhSUVVGUkxFTkJRVU03TzBWQlEyeEVMRkZCUVVNc1EwRkJRU3d3UWtGQlJDeEhRVUU0UWl4UlFVRlJMRU5CUVVNN08wVkJSV3BETEZGQlFVTXNRMEZCUVR0QlFVTk1MRkZCUVVFN08wbEJRVUVzVlVGQlF5eERRVUZCTEZGQlFVUXNSMEZEUlR0TlFVRkJMRWxCUVVFc1JVRkJUU3hKUVVGT08wMUJRMEVzVVVGQlFTeEZRVUZWTEVsQlJGWTdUVUZGUVN4UFFVRkJMRVZCUVZNc1NVRkdWRHROUVVkQkxFMUJRVUVzUlVGQlVTeEhRVWhTTzAxQlNVRXNUMEZCUVN4RlFVRlRMRk5CUVVFN1pVRkJSenROUVVGSUxFTkJTbFE3VFVGTFFTeG5Ra0ZCUVN4RlFVRnJRaXhSUVVGUkxFTkJRVU1zSzBKQlRETkNPMDFCVFVFc1pVRkJRU3hGUVVGcFFpeFJRVUZSTEVOQlFVTXNiVUpCVGpGQ096czdTVUZSVnl4dlFrRkJReXhSUVVGRU8wMUJRVU1zU1VGQlF5eERRVUZCTERaQ1FVRkVMRmRCUVZNN096dE5RVU55UWl4TFFVRkxMRU5CUVVNc1VVRkJUaXhEUVVGbExFbEJRVU1zUTBGQlFTeFBRVUZvUWl4RlFVRjVRaXhWUVVGVkxFTkJRVU1zVVVGQmNFTTdUVUZEUVN4VFFVRlRMRU5CUVVNc1NVRkJWaXhEUVVGbExFbEJRV1k3VFVGRFFTeEpRVUZETEVOQlFVRXNTVUZCUkN4SFFVRlJMRWxCUVVNc1EwRkJRU3hQUVVGUExFTkJRVU03VFVGRGFrSXNTVUZCUXl4RFFVRkJMRkZCUVVRc1IwRkJXU3hKUVVGRExFTkJRVUVzVDBGQlR5eERRVUZETzAxQlEzSkNMRWxCUVVNc1EwRkJRU3hQUVVGRUxFZEJRVmNzU1VGQlF5eERRVUZCTEU5QlFVOHNRMEZCUXp0TlFVTndRaXhKUVVGRExFTkJRVUVzWVVGQlJDeEhRVUZwUWl4TFFVRkxMRU5CUVVNc1NVRkJUaXhEUVVGWExFbEJRVU1zUTBGQlFTeFJRVUZhTzAxQlEycENMRWxCUVVrc1EwRkJReXhKUVVGTUxFTkJRVlVzU1VGQlZqdEpRVkJYT3p0NVFrRlRZaXhIUVVGQkxFZEJRVXNzVTBGQlFUdEJRVU5JTEZWQlFVRTdUVUZCUVN4TFFVRkxMRU5CUVVNc1IwRkJUaXhEUVVGVkxIZENRVUZCTEVkQlFYZENMRU5CUVVNc1NVRkJTU3hEUVVGRExGTkJRVXdzUTBGQlpTeEpRVUZETEVOQlFVRXNUMEZCYUVJc1EwRkJSQ3hEUVVGc1F6dE5RVU5CTEVsQlFVY3NUMEZCUVN4SFFVRlZMRWxCUVVNc1EwRkJRU3hyUWtGQlJDeERRVUZCTEVOQlFXSTdVVUZGUlN4TFFVRkxMRU5CUVVNc1IwRkJUaXhEUVVGaExFOUJRVVFzUjBGQlV5eFRRVUZ5UWp0bFFVTkJMRWxCUVVNc1EwRkJRU3huUWtGQlJDeERRVUZyUWl4UFFVRnNRaXhGUVVoR08wOUJRVUVzVFVGQlFUdGxRVXRGTEVsQlFVTXNRMEZCUVN3NFFrRkJSQ3hEUVVGQkxFVkJURVk3TzBsQlJrYzdPMGxCVTB3c1NVRkJRU3hIUVVGUExGTkJRVUU3WVVGQlJ5eEpRVUZETEVOQlFVRXNSMEZCUkN4RFFVRkJPMGxCUVVnN08zbENRVVZRTEdkQ1FVRkJMRWRCUVd0Q0xGTkJRVU1zVDBGQlJEdEJRVU5vUWl4VlFVRkJPenRYUVVGclFpeERRVUZGTEZGQlFYQkNMRU5CUVRaQ0xFbEJRVGRDT3p0aFFVTkJMRWxCUVVNc1EwRkJRU3hQUVVGRUxFTkJRVUVzUTBGQlZTeERRVUZETEVkQlFWZ3NRMEZCYTBJc1NVRkJReXhEUVVGQkxFOUJRVThzUTBGQlF5eEpRVUZXTEVkQlFXVXNWVUZCYUVNc1JVRkJNa01zVDBGQk0wTTdTVUZHWjBJN08zbENRVXRzUWl3NFFrRkJRU3hIUVVGblF5eFRRVUZCTzBGQlF6bENMRlZCUVVFN1RVRkJRU3hKUVVGQkxFTkJRV01zU1VGQlF5eERRVUZCTEU5QlFVOHNRMEZCUXl4UFFVRlVMRU5CUVVFc1EwRkJaRHRCUVVGQkxHVkJRVUU3TzAxQlEwRXNTMEZCU3l4RFFVRkRMRWRCUVU0c1EwRkJWU3hoUVVGV08wMUJRMEVzU1VGQlFTeERRVUZqTEVsQlFVTXNRMEZCUVN4VFFVRkVMRU5CUVVFc1EwRkJaRHRCUVVGQkxHVkJRVUU3TzAxQlEwRXNTMEZCU3l4RFFVRkRMRWRCUVU0c1EwRkJWU3hYUVVGV08wMUJRMEVzVDBGQlFTeEhRVUZWTEVsQlFVTXNRMEZCUVN4WlFVRkVMRU5CUVVFN1RVRkRWaXhKUVVGRExFTkJRVUVzVVVGQlJDeERRVUZCTEVOQlFWY3NRMEZCUXl4blFrRkJXaXhEUVVFMlFpeEpRVUUzUWl4RlFVRnRReXhQUVVGdVF6dGhRVU5CTEVsQlFVTXNRMEZCUVN4blFrRkJSQ3hEUVVGclFpeFBRVUZzUWp0SlFWQTRRanM3ZVVKQlUyaERMR0ZCUVVFc1IwRkJaU3hUUVVGRExGTkJRVVFzUlVGQldTeExRVUZhTzBGQlEySXNWVUZCUVRzN1VVRkVlVUlzVVVGQlRUczdUVUZETDBJc1MwRkJTeXhEUVVGRExGRkJRVTRzUTBGQlpTeExRVUZtTEVWQlFYTkNPMUZCUVVNc1RVRkJRU3hGUVVGUkxFbEJRVlE3VDBGQmRFSTdUVUZEUVN4SlFVRlZMRXRCUVVzc1EwRkJReXhOUVVGT0xFbEJRV2RDTEVsQlFVTXNRMEZCUVN4UFFVRkVMRU5CUVVFc1EwRkJWU3hEUVVGRExFZEJRVmdzUTBGQmEwSXNTVUZCUXl4RFFVRkJMRTlCUVU4c1EwRkJReXhKUVVGV0xFZEJRV1VzUjBGQlppeEhRVUZyUWl4VFFVRnVReXhEUVVFeFFqdEJRVUZCTEdWQlFVRTdPMDFCUTBFc1QwRkJRU3hIUVVGVkxFbEJRVU1zUTBGQlFTeHJRa0ZCUkN4RFFVRkJPMDFCUTFZc1NVRkJRU3hEUVVGakxFOUJRV1E3UVVGQlFTeGxRVUZCT3p0TlFVTkJMRWxCUVhsRUxFdEJRVXNzUTBGQlF5eE5RVUV2UkR0UlFVRkJMRWxCUVVNc1EwRkJRU3hQUVVGRUxFTkJRVUVzUTBGQlZTeERRVUZETEVkQlFWZ3NRMEZCYTBJc1NVRkJReXhEUVVGQkxFOUJRVThzUTBGQlF5eEpRVUZXTEVkQlFXVXNSMEZCWml4SFFVRnJRaXhUUVVGdVF5eEZRVUZuUkN4SlFVRm9SQ3hGUVVGQk96dE5RVU5CTEV0QlFVc3NRMEZCUXl4SFFVRk9MRU5CUVZVc1kwRkJRU3hIUVVGbExFbEJRVU1zUTBGQlFTeFBRVUZQTEVOQlFVTXNTVUZCZUVJc1IwRkJOa0lzVjBGQk4wSXNSMEZCZDBNc1QwRkJlRU1zUjBGQlowUXNVVUZCYUVRc1IwRkJkMFFzVTBGQmVFUXNSMEZCYTBVc1YwRkJOVVU3WVVGRFFTeEpRVUZETEVOQlFVRXNVVUZCUkN4RFFVRkJMRU5CUVZjc1EwRkJReXhoUVVGYUxFTkJRVEJDTEVsQlFURkNMRVZCUVdkRExFOUJRV2hETEVWQlFYbERMRk5CUVhwRExFVkJRVzlFTEV0QlFYQkVPMGxCVUdFN08zbENRVk5tTEd0Q1FVRkJMRWRCUVc5Q0xGTkJRVUU3WVVGRGJFSXNTVUZCUXl4RFFVRkJMRTlCUVVRc1EwRkJRU3hEUVVGVkxFTkJRVU1zUjBGQldDeERRVUZyUWl4SlFVRkRMRU5CUVVFc1QwRkJUeXhEUVVGRExFbEJRVllzUjBGQlpTeFZRVUZvUXp0SlFVUnJRanM3ZVVKQlIzQkNMRmxCUVVFc1IwRkJZeXhUUVVGQk8wRkJRMW9zVlVGQlFUdE5RVUZCTEhsQ1FVRkJMRWRCUVRSQ0xFdEJRVXNzUTBGQlF5eGhRVUZPTEVOQlFXOUNMRWxCUVVNc1EwRkJRU3hSUVVGeVFqdE5RVU0xUWl4TFFVRkxMRU5CUVVNc1IwRkJUaXhEUVVGVkxEWkNRVUZCTEVkQlFUaENMSGxDUVVGNFF6dE5RVU5CTEVsQlFVY3NlVUpCUVVnN1pVRkJhME1zU1VGQlF5eERRVUZCTEhGQ1FVRkVMRU5CUVVFc1JVRkJiRU03VDBGQlFTeE5RVUZCTzJWQlFXZEZMRWxCUVVNc1EwRkJRU3gxUWtGQlJDeERRVUZCTEVWQlFXaEZPenRKUVVoWk96dDVRa0ZMWkN4eFFrRkJRU3hIUVVGMVFpeFRRVUZCTzBGQlYzSkNMRlZCUVVFN1RVRkJRU3hYUVVGQkxFZEJRV01zUzBGQlN5eERRVUZETEZkQlFVNHNRMEZCYTBJc1NVRkJReXhEUVVGQkxGRkJRVzVDTzAxQlEyUXNZMEZCUVN4SFFVRnBRaXhKUVVGSkxFTkJRVU1zU1VGQlRDeERRVUZYTEVsQlFVTXNRMEZCUVN4UFFVRkVMRU5CUVZNc1UwRkJWQ3hEUVVGQkxFZEJRWE5DTEZkQlFXcERPMEZCUTJwQ08wRkJRVUVzVjBGQlFTeFZRVUZCT3p0UlFVZEZMR05CUVVFc1NVRkJhMElzUzBGQlN5eERRVUZETzFGQlEzaENMRWxCUVdNc1kwRkJRU3hKUVVGclFpeERRVUZvUXp0QlFVRkJMR2xDUVVGUExFbEJRVkE3TzBGQlNrWTdTVUZpY1VJN08zbENRVzFDZGtJc2RVSkJRVUVzUjBGQmVVSXNVMEZCUVR0QlFVTjJRaXhWUVVGQk8wMUJRVUVzVlVGQlFTeEhRVUZoTEVkQlFVRXNSMEZCVFN4SlFVRkRMRU5CUVVFc1lVRkJZU3hEUVVGRE8wMUJRMnhETEdkQ1FVRkJMRWRCUVcxQ0xFbEJRVWtzUTBGQlF5eExRVUZNTEVOQlFWY3NTVUZCUXl4RFFVRkJMRTlCUVVRc1EwRkJVeXhUUVVGVUxFTkJRVUVzUjBGQmMwSXNWVUZCYWtNN1RVRkRia0lzVDBGQlFTeEhRVUZWTEVsQlFVTXNRMEZCUVN4aFFVRmpMRU5CUVVFc1owSkJRVUU3VFVGRGVrSXNTMEZCU3l4RFFVRkRMRWRCUVU0c1EwRkJZU3hQUVVGRUxFZEJRVk1zVTBGQmNrSTdZVUZEUVR0SlFVeDFRanM3ZVVKQlQzcENMRk5CUVVFc1IwRkJWeXhUUVVGQk8wRkJRMVFzVlVGQlFUdE5RVUZCTEUxQlFVRXNSMEZCVXl4SlFVRkRMRU5CUVVFc1QwRkJSQ3hEUVVGQkxFTkJRVlVzUTBGQlF5eEhRVUZZTEVOQlFXdENMRWxCUVVNc1EwRkJRU3hQUVVGUExFTkJRVU1zU1VGQlZpeEhRVUZsTEZsQlFXaERPMDFCUTFRc1NVRkJjVUlzVDBGQlR5eE5RVUZRTEV0QlFXbENMRmRCUVhSRE8wRkJRVUVzWlVGQlR5eFBRVUZRT3p0TlFVTkJMRTFCUVVFc1IwRkJVeXhKUVVGRExFTkJRVUVzVDBGQlJDeERRVUZUTEZGQlFWUXNRMEZCUVN4SlFVRnpRaXhKUVVGRExFTkJRVUVzVDBGQlR5eERRVUZETzAxQlEzaERMRWxCUVVNc1EwRkJRU3hQUVVGRUxFTkJRVUVzUTBGQlZTeERRVUZETEVkQlFWZ3NRMEZCYTBJc1NVRkJReXhEUVVGQkxFOUJRVThzUTBGQlF5eEpRVUZXTEVkQlFXVXNXVUZCYUVNc1JVRkJOa01zVFVGQk4wTTdZVUZEUVR0SlFVeFRPenQ1UWtGUFdDeFBRVUZCTEVkQlFWTXNVMEZCUXl4SlFVRkVPMEZCUTFBc1ZVRkJRVHROUVVGQkxFbEJRVUVzUTBGQk5rSXNTVUZCUXl4RFFVRkJMRTlCUVRsQ08wRkJRVUVzWlVGQlR5eExRVUZMTEVOQlFVTXNUVUZCVGl4RFFVRkJMRVZCUVZBN08wMUJRMEVzU1VGQlFTeEhRVUZWTEVsQlFVTXNRMEZCUVN4SlFVRkdMRWRCUVU4c1IwRkJVQ3hIUVVGVkxFbEJRVllzUjBGQlpTeEhRVUZtTEVkQlFXdENMRWxCUVVNc1EwRkJRVHRoUVVNMVFpeExRVUZMTEVOQlFVTXNUVUZCVGl4RFFVRmhMRWxCUVdJN1NVRklUenM3ZVVKQlMxUXNVVUZCUVN4SFFVRlZMRk5CUVVNc1NVRkJSRHRoUVVOU0xFbEJRVWtzUTBGQlF5eGpRVUZNTEVOQlFXOUNMRWxCUVhCQ08wbEJSRkU3TzNsQ1FVZFdMRk5CUVVFc1IwRkJWeXhUUVVGRExFdEJRVVE3UVVGRFZDeFZRVUZCTzBGQlFVRTdWMEZCUVN4MVEwRkJRVHM3Y1VKQlFVRXNTVUZCUXl4RFFVRkJMRkZCUVVRc1EwRkJWU3hKUVVGV08wRkJRVUU3TzBsQlJGTTdPM2xDUVVkWUxFOUJRVUVzUjBGQlV5eFRRVUZCTzJGQlFVY3NTVUZCUXl4RFFVRkJMRTlCUVU4c1EwRkJRenRKUVVGYU96dDVRa0ZGVkN4UlFVRkJMRWRCUVZVc1UwRkJRVHRoUVVGSExFbEJRVU1zUTBGQlFTeFBRVUZQTEVOQlFVTTdTVUZCV2pzN1NVRkZWaXhUUVVGQkxFZEJRVmtzVTBGQlFUdEJRVU5XTEZWQlFVRTdUVUZCUVN4SlFVRm5SQ3hKUVVGRExFTkJRVUVzVDBGQlR5eERRVUZETEVsQlFWUXNTMEZCYVVJc1NVRkJha1U3UVVGQlFTeGpRVUZOTEhWRFFVRk9PenROUVVOQkxFbEJRWEZETEVsQlFVTXNRMEZCUVN4UFFVRlBMRU5CUVVNc1VVRkJWQ3hMUVVGeFFpeEpRVUV4UkR0QlFVRkJMR05CUVUwc05FSkJRVTQ3TzAxQlEwRXNTVUZCYzBNc1QwRkJUeXhKUVVGRExFTkJRVUVzVDBGQlR5eERRVUZETEU5QlFXaENMRXRCUVRaQ0xGVkJRVzVGTzBGQlFVRXNZMEZCVFN3MlFrRkJUanM3VFVGRFFTeDVRa0ZCUVN4SFFVRTBRaXhMUVVGTExFTkJRVU1zWjBKQlFVNHNRMEZCZFVJc1NVRkJReXhEUVVGQkxFOUJRVThzUTBGQlF5eFJRVUZvUXp0TlFVTTFRaXhKUVVGNVF5eERRVUZETEhsQ1FVRXhRenRCUVVGQkxHTkJRVTBzWjBOQlFVNDdPMGxCVEZVN096czdPenRGUVU5U0xGRkJRVU1zUTBGQlFUdEpRVU5STEdOQlFVTXNTVUZCUkN4RlFVRlJMRTFCUVZJN1RVRkJReXhKUVVGRExFTkJRVUVzVDBGQlJEdE5RVUZQTEVsQlFVTXNRMEZCUVN4NVFrRkJSQ3hUUVVGUE8wMUJRekZDTEV0QlFVc3NRMEZCUXl4UlFVRk9MRU5CUVdVc1NVRkJReXhEUVVGQkxFdEJRV2hDTEVWQlFYVkNPMUZCUVVNc1RVRkJRU3hGUVVGUkxFbEJRVlE3VDBGQmRrSTdUVUZEUVN4SlFVRkRMRU5CUVVFc1YwRkJSQ3hIUVVGbE8wbEJSa283TzIxQ1FVbGlMR05CUVVFc1IwRkJaMElzVTBGQlF5eFZRVUZFTzJGQlEyUXNTVUZCUXl4RFFVRkJMRmRCUVZjc1EwRkJReXhKUVVGaUxFTkJRV3RDTEZWQlFXeENPMGxCUkdNN08yMUNRVWRvUWl4bFFVRkJMRWRCUVdsQ0xGTkJRVU1zVjBGQlJEdEJRVU5tTEZWQlFVRTdRVUZCUVR0WFFVRkJMRFpEUVVGQk96dHhRa0ZCUVN4SlFVRkRMRU5CUVVFc1kwRkJSQ3hEUVVGblFpeFZRVUZvUWp0QlFVRkJPenRKUVVSbE96dHRRa0ZIYWtJc1VVRkJRU3hIUVVGVkxGTkJRVUU3UVVGRFVpeFZRVUZCTzBGQlFVRTdRVUZCUVR0WFFVRkJMSEZEUVVGQk96dHhRa0ZEUlN4VlFVRlZMRU5CUVVNc1lVRkJXQ3hEUVVGNVFpeEpRVUZETEVOQlFVRXNTVUZCTVVJc1JVRkJaME1zU1VGQlF5eERRVUZCTEV0QlFXcERPMEZCUkVZN08wbEJSRkU3T3pzN096czdPenM3UVVGTFpDeE5RVUZOTEVOQlFVTXNUMEZCVUN4SFFVRnBRaUo5XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgZGVidWc6IGZhbHNlXG59O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lMMmh2YldVdmVXOWhkaTlqYjJSbEwyRnNaWEJvWW1WMEwzTnlZeTl2Y0hScGIyNXpMbU52Wm1abFpTSXNJbk52ZFhKalpWSnZiM1FpT2lJaUxDSnpiM1Z5WTJWeklqcGJJaTlvYjIxbEwzbHZZWFl2WTI5a1pTOWhiR1Z3YUdKbGRDOXpjbU12YjNCMGFXOXVjeTVqYjJabVpXVWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklrRkJRVUVzVFVGQlRTeERRVUZETEU5QlFWQXNSMEZEUlR0RlFVRkJMRXRCUVVFc1JVRkJUeXhMUVVGUUluMD1cbiIsInZhciBTdG9yYWdlLCBzdG9yZTtcblxuc3RvcmUgPSByZXF1aXJlKCdzdG9yZScpO1xuXG5TdG9yYWdlID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBTdG9yYWdlKG5hbWVzcGFjZSkge1xuICAgIHRoaXMubmFtZXNwYWNlID0gbmFtZXNwYWNlICE9IG51bGwgPyBuYW1lc3BhY2UgOiAnYWxlcGhiZXQnO1xuICAgIGlmICghc3RvcmUuZW5hYmxlZCkge1xuICAgICAgdGhyb3cgJ2xvY2FsIHN0b3JhZ2Ugbm90IHN1cHBvcnRlZCc7XG4gICAgfVxuICAgIHRoaXMuc3RvcmFnZSA9IHN0b3JlLmdldCh0aGlzLm5hbWVzcGFjZSkgfHwge307XG4gIH1cblxuICBTdG9yYWdlLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgdGhpcy5zdG9yYWdlW2tleV0gPSB2YWx1ZTtcbiAgICBzdG9yZS5zZXQodGhpcy5uYW1lc3BhY2UsIHRoaXMuc3RvcmFnZSk7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xuXG4gIFN0b3JhZ2UucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKGtleSkge1xuICAgIHJldHVybiB0aGlzLnN0b3JhZ2Vba2V5XTtcbiAgfTtcblxuICByZXR1cm4gU3RvcmFnZTtcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBTdG9yYWdlO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lMMmh2YldVdmVXOWhkaTlqYjJSbEwyRnNaWEJvWW1WMEwzTnlZeTl6ZEc5eVlXZGxMbU52Wm1abFpTSXNJbk52ZFhKalpWSnZiM1FpT2lJaUxDSnpiM1Z5WTJWeklqcGJJaTlvYjIxbEwzbHZZWFl2WTI5a1pTOWhiR1Z3YUdKbGRDOXpjbU12YzNSdmNtRm5aUzVqYjJabVpXVWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklrRkJRVUVzU1VGQlFUczdRVUZCUVN4TFFVRkJMRWRCUVZFc1QwRkJRU3hEUVVGUkxFOUJRVkk3TzBGQlIwWTdSVUZEVXl4cFFrRkJReXhUUVVGRU8wbEJRVU1zU1VGQlF5eERRVUZCTEdkRFFVRkVMRmxCUVZjN1NVRkRka0lzU1VGQlFTeERRVUV5UXl4TFFVRkxMRU5CUVVNc1QwRkJha1E3UVVGQlFTeFpRVUZOTERoQ1FVRk9PenRKUVVOQkxFbEJRVU1zUTBGQlFTeFBRVUZFTEVkQlFWY3NTMEZCU3l4RFFVRkRMRWRCUVU0c1EwRkJWU3hKUVVGRExFTkJRVUVzVTBGQldDeERRVUZCTEVsQlFYbENPMFZCUm5wQ096dHZRa0ZIWWl4SFFVRkJMRWRCUVVzc1UwRkJReXhIUVVGRUxFVkJRVTBzUzBGQlRqdEpRVU5JTEVsQlFVTXNRMEZCUVN4UFFVRlJMRU5CUVVFc1IwRkJRU3hEUVVGVUxFZEJRV2RDTzBsQlEyaENMRXRCUVVzc1EwRkJReXhIUVVGT0xFTkJRVlVzU1VGQlF5eERRVUZCTEZOQlFWZ3NSVUZCYzBJc1NVRkJReXhEUVVGQkxFOUJRWFpDTzBGQlEwRXNWMEZCVHp0RlFVaEtPenR2UWtGSlRDeEhRVUZCTEVkQlFVc3NVMEZCUXl4SFFVRkVPMWRCUTBnc1NVRkJReXhEUVVGQkxFOUJRVkVzUTBGQlFTeEhRVUZCTzBWQlJFNDdPenM3T3p0QlFVbFFMRTFCUVUwc1EwRkJReXhQUVVGUUxFZEJRV2xDSW4wPVxuIiwidmFyIFV0aWxzLCBfLCBvcHRpb25zLCBzaGExLCB1dWlkO1xuXG5fID0gcmVxdWlyZSgnbG9kYXNoLmN1c3RvbScpO1xuXG51dWlkID0gcmVxdWlyZSgnbm9kZS11dWlkJyk7XG5cbnNoYTEgPSByZXF1aXJlKCdjcnlwdG8tanMvc2hhMScpO1xuXG5vcHRpb25zID0gcmVxdWlyZSgnLi9vcHRpb25zJyk7XG5cblV0aWxzID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBVdGlscygpIHt9XG5cbiAgVXRpbHMuZGVmYXVsdHMgPSBfLmRlZmF1bHRzO1xuXG4gIFV0aWxzLmtleXMgPSBfLmtleXM7XG5cbiAgVXRpbHMucmVtb3ZlID0gXy5yZW1vdmU7XG5cbiAgVXRpbHMub21pdCA9IF8ub21pdDtcblxuICBVdGlscy5sb2cgPSBmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgaWYgKG9wdGlvbnMuZGVidWcpIHtcbiAgICAgIHJldHVybiBjb25zb2xlLmxvZyhtZXNzYWdlKTtcbiAgICB9XG4gIH07XG5cbiAgVXRpbHMudXVpZCA9IHV1aWQudjQ7XG5cbiAgVXRpbHMuc2hhMSA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgICByZXR1cm4gc2hhMSh0ZXh0KS50b1N0cmluZygpO1xuICB9O1xuXG4gIFV0aWxzLnJhbmRvbSA9IGZ1bmN0aW9uKHNlZWQpIHtcbiAgICBpZiAoIXNlZWQpIHtcbiAgICAgIHJldHVybiBNYXRoLnJhbmRvbSgpO1xuICAgIH1cbiAgICByZXR1cm4gcGFyc2VJbnQodGhpcy5zaGExKHNlZWQpLnN1YnN0cigwLCAxMyksIDE2KSAvIDB4RkZGRkZGRkZGRkZGRjtcbiAgfTtcblxuICBVdGlscy5jaGVja193ZWlnaHRzID0gZnVuY3Rpb24odmFyaWFudHMpIHtcbiAgICB2YXIgY29udGFpbnNfd2VpZ2h0LCBrZXksIHZhbHVlO1xuICAgIGNvbnRhaW5zX3dlaWdodCA9IFtdO1xuICAgIGZvciAoa2V5IGluIHZhcmlhbnRzKSB7XG4gICAgICB2YWx1ZSA9IHZhcmlhbnRzW2tleV07XG4gICAgICBjb250YWluc193ZWlnaHQucHVzaCh2YWx1ZS53ZWlnaHQgIT0gbnVsbCk7XG4gICAgfVxuICAgIHJldHVybiBjb250YWluc193ZWlnaHQuZXZlcnkoZnVuY3Rpb24oaGFzX3dlaWdodCkge1xuICAgICAgcmV0dXJuIGhhc193ZWlnaHQ7XG4gICAgfSk7XG4gIH07XG5cbiAgVXRpbHMuc3VtX3dlaWdodHMgPSBmdW5jdGlvbih2YXJpYW50cykge1xuICAgIHZhciBrZXksIHN1bSwgdmFsdWU7XG4gICAgc3VtID0gMDtcbiAgICBmb3IgKGtleSBpbiB2YXJpYW50cykge1xuICAgICAgdmFsdWUgPSB2YXJpYW50c1trZXldO1xuICAgICAgc3VtICs9IHZhbHVlLndlaWdodCB8fCAwO1xuICAgIH1cbiAgICByZXR1cm4gc3VtO1xuICB9O1xuXG4gIFV0aWxzLnZhbGlkYXRlX3dlaWdodHMgPSBmdW5jdGlvbih2YXJpYW50cykge1xuICAgIHZhciBjb250YWluc193ZWlnaHQsIGtleSwgdmFsdWU7XG4gICAgY29udGFpbnNfd2VpZ2h0ID0gW107XG4gICAgZm9yIChrZXkgaW4gdmFyaWFudHMpIHtcbiAgICAgIHZhbHVlID0gdmFyaWFudHNba2V5XTtcbiAgICAgIGNvbnRhaW5zX3dlaWdodC5wdXNoKHZhbHVlLndlaWdodCAhPSBudWxsKTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbnRhaW5zX3dlaWdodC5ldmVyeShmdW5jdGlvbihoYXNfd2VpZ2h0KSB7XG4gICAgICByZXR1cm4gaGFzX3dlaWdodCB8fCBjb250YWluc193ZWlnaHQuZXZlcnkoZnVuY3Rpb24oaGFzX3dlaWdodCkge1xuICAgICAgICByZXR1cm4gIWhhc193ZWlnaHQ7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcblxuICByZXR1cm4gVXRpbHM7XG5cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gVXRpbHM7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaUwyaHZiV1V2ZVc5aGRpOWpiMlJsTDJGc1pYQm9ZbVYwTDNOeVl5OTFkR2xzY3k1amIyWm1aV1VpTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lJdmFHOXRaUzk1YjJGMkwyTnZaR1V2WVd4bGNHaGlaWFF2YzNKakwzVjBhV3h6TG1OdlptWmxaU0pkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZEUVN4SlFVRkJPenRCUVVGQkxFTkJRVUVzUjBGQlNTeFBRVUZCTEVOQlFWRXNaVUZCVWpzN1FVRkRTaXhKUVVGQkxFZEJRVThzVDBGQlFTeERRVUZSTEZkQlFWSTdPMEZCUTFBc1NVRkJRU3hIUVVGUExFOUJRVUVzUTBGQlVTeG5Ra0ZCVWpzN1FVRkRVQ3hQUVVGQkxFZEJRVlVzVDBGQlFTeERRVUZSTEZkQlFWSTdPMEZCUlVvN096dEZRVU5LTEV0QlFVTXNRMEZCUVN4UlFVRkVMRWRCUVZjc1EwRkJReXhEUVVGRE96dEZRVU5pTEV0QlFVTXNRMEZCUVN4SlFVRkVMRWRCUVU4c1EwRkJReXhEUVVGRE96dEZRVU5VTEV0QlFVTXNRMEZCUVN4TlFVRkVMRWRCUVZNc1EwRkJReXhEUVVGRE96dEZRVU5ZTEV0QlFVTXNRMEZCUVN4SlFVRkVMRWRCUVU4c1EwRkJReXhEUVVGRE96dEZRVU5VTEV0QlFVTXNRMEZCUVN4SFFVRkVMRWRCUVUwc1UwRkJReXhQUVVGRU8wbEJRMG9zU1VGQmQwSXNUMEZCVHl4RFFVRkRMRXRCUVdoRE8yRkJRVUVzVDBGQlR5eERRVUZETEVkQlFWSXNRMEZCV1N4UFFVRmFMRVZCUVVFN08wVkJSRWs3TzBWQlJVNHNTMEZCUXl4RFFVRkJMRWxCUVVRc1IwRkJUeXhKUVVGSkxFTkJRVU03TzBWQlExb3NTMEZCUXl4RFFVRkJMRWxCUVVRc1IwRkJUeXhUUVVGRExFbEJRVVE3VjBGRFRDeEpRVUZCTEVOQlFVc3NTVUZCVEN4RFFVRlZMRU5CUVVNc1VVRkJXQ3hEUVVGQk8wVkJSRXM3TzBWQlJWQXNTMEZCUXl4RFFVRkJMRTFCUVVRc1IwRkJVeXhUUVVGRExFbEJRVVE3U1VGRFVDeEpRVUZCTEVOQlFUUkNMRWxCUVRWQ08wRkJRVUVzWVVGQlR5eEpRVUZKTEVOQlFVTXNUVUZCVEN4RFFVRkJMRVZCUVZBN08xZEJSVUVzVVVGQlFTeERRVUZUTEVsQlFVTXNRMEZCUVN4SlFVRkVMRU5CUVUwc1NVRkJUaXhEUVVGWExFTkJRVU1zVFVGQldpeERRVUZ0UWl4RFFVRnVRaXhGUVVGelFpeEZRVUYwUWl4RFFVRlVMRVZCUVc5RExFVkJRWEJETEVOQlFVRXNSMEZCTUVNN1JVRklia003TzBWQlNWUXNTMEZCUXl4RFFVRkJMR0ZCUVVRc1IwRkJaMElzVTBGQlF5eFJRVUZFTzBGQlEyUXNVVUZCUVR0SlFVRkJMR1ZCUVVFc1IwRkJhMEk3UVVGRGJFSXNVMEZCUVN4bFFVRkJPenROUVVGQkxHVkJRV1VzUTBGQlF5eEpRVUZvUWl4RFFVRnhRaXh2UWtGQmNrSTdRVUZCUVR0WFFVTkJMR1ZCUVdVc1EwRkJReXhMUVVGb1FpeERRVUZ6UWl4VFFVRkRMRlZCUVVRN1lVRkJaMEk3U1VGQmFFSXNRMEZCZEVJN1JVRklZenM3UlVGSmFFSXNTMEZCUXl4RFFVRkJMRmRCUVVRc1IwRkJZeXhUUVVGRExGRkJRVVE3UVVGRFdpeFJRVUZCTzBsQlFVRXNSMEZCUVN4SFFVRk5PMEZCUTA0c1UwRkJRU3hsUVVGQk96dE5RVU5GTEVkQlFVRXNTVUZCVHl4TFFVRkxMRU5CUVVNc1RVRkJUaXhKUVVGblFqdEJRVVI2UWp0WFFVVkJPMFZCU2xrN08wVkJTMlFzUzBGQlF5eERRVUZCTEdkQ1FVRkVMRWRCUVcxQ0xGTkJRVU1zVVVGQlJEdEJRVU5xUWl4UlFVRkJPMGxCUVVFc1pVRkJRU3hIUVVGclFqdEJRVU5zUWl4VFFVRkJMR1ZCUVVFN08wMUJRVUVzWlVGQlpTeERRVUZETEVsQlFXaENMRU5CUVhGQ0xHOUNRVUZ5UWp0QlFVRkJPMWRCUTBFc1pVRkJaU3hEUVVGRExFdEJRV2hDTEVOQlFYTkNMRk5CUVVNc1ZVRkJSRHRoUVVGblFpeFZRVUZCTEVsQlFXTXNaVUZCWlN4RFFVRkRMRXRCUVdoQ0xFTkJRWE5DTEZOQlFVTXNWVUZCUkR0bFFVRm5RaXhEUVVGRE8wMUJRV3BDTEVOQlFYUkNPMGxCUVRsQ0xFTkJRWFJDTzBWQlNHbENPenM3T3pzN1FVRkpja0lzVFVGQlRTeERRVUZETEU5QlFWQXNSMEZCYVVJaWZRPT1cbiIsIi8qKlxuICogQGxpY2Vuc2VcbiAqIGxvZGFzaCAzLjEwLjEgKEN1c3RvbSBCdWlsZCkgbG9kYXNoLmNvbS9saWNlbnNlIHwgVW5kZXJzY29yZS5qcyAxLjguMyB1bmRlcnNjb3JlanMub3JnL0xJQ0VOU0VcbiAqIEJ1aWxkOiBgbG9kYXNoIC1wIGluY2x1ZGU9XCJrZXlzLGRlZmF1bHRzLHJlbW92ZSxvbWl0XCIgZXhwb3J0cz1cIm5vZGVcIiAtbyAuL3ZlbmRvci9sb2Rhc2guY3VzdG9tLm1pbi5qc2BcbiAqL1xuOyhmdW5jdGlvbigpe2Z1bmN0aW9uIG5hKGEsYixjKXtpZihiIT09Yil7YTp7Yj1hLmxlbmd0aDtmb3IoYys9LTE7KytjPGI7KXt2YXIgZT1hW2NdO2lmKGUhPT1lKXthPWM7YnJlYWsgYX19YT0tMX1yZXR1cm4gYX1jLT0xO2ZvcihlPWEubGVuZ3RoOysrYzxlOylpZihhW2NdPT09YilyZXR1cm4gYztyZXR1cm4tMX1mdW5jdGlvbiBBKGEpe3JldHVybiEhYSYmdHlwZW9mIGE9PVwib2JqZWN0XCJ9ZnVuY3Rpb24gbSgpe31mdW5jdGlvbiB4YShhKXt2YXIgYj1hP2EubGVuZ3RoOjA7Zm9yKHRoaXMuZGF0YT17aGFzaDp5YShudWxsKSxzZXQ6bmV3IHphfTtiLS07KXRoaXMucHVzaChhW2JdKX1mdW5jdGlvbiBaYShhLGIpe3ZhciBjPWEuZGF0YTtyZXR1cm4odHlwZW9mIGI9PVwic3RyaW5nXCJ8fHQoYik/Yy5zZXQuaGFzKGIpOmMuaGFzaFtiXSk/MDotMX1mdW5jdGlvbiAkYShhLGIpe3ZhciBjPS0xLGU9YS5sZW5ndGg7Zm9yKGJ8fChiPUFycmF5KGUpKTsrK2M8ZTspYltjXT1hW2NdO1xucmV0dXJuIGJ9ZnVuY3Rpb24gQWEoYSxiKXtmb3IodmFyIGM9LTEsZT1hLmxlbmd0aDsrK2M8ZSYmZmFsc2UhPT1iKGFbY10sYyxhKTspO3JldHVybiBhfWZ1bmN0aW9uIGFiKGEpe2Zvcih2YXIgYj1TdHJpbmcsYz0tMSxlPWEubGVuZ3RoLGQ9QXJyYXkoZSk7KytjPGU7KWRbY109YihhW2NdLGMsYSk7cmV0dXJuIGR9ZnVuY3Rpb24gYmIoYSxiKXtmb3IodmFyIGM9LTEsZT1hLmxlbmd0aDsrK2M8ZTspaWYoYihhW2NdLGMsYSkpcmV0dXJuIHRydWU7cmV0dXJuIGZhbHNlfWZ1bmN0aW9uIEJhKGEsYil7dmFyIGM7aWYobnVsbD09YiljPWE7ZWxzZXtjPUMoYik7dmFyIGU9YTtlfHwoZT17fSk7Zm9yKHZhciBkPS0xLGY9Yy5sZW5ndGg7KytkPGY7KXt2YXIgaD1jW2RdO2VbaF09YltoXX1jPWV9cmV0dXJuIGN9ZnVuY3Rpb24gQ2EoYSxiLGMpe3ZhciBlPXR5cGVvZiBhO3JldHVyblwiZnVuY3Rpb25cIj09ZT9iPT09cD9hOm9hKGEsYixjKTpudWxsPT1hP1E6XCJvYmplY3RcIj09ZT9EYShhKTpiPT09cD9FYShhKTpcbmNiKGEsYil9ZnVuY3Rpb24gRmEoYSxiLGMsZSxkLGYsaCl7dmFyIGc7YyYmKGc9ZD9jKGEsZSxkKTpjKGEpKTtpZihnIT09cClyZXR1cm4gZztpZighdChhKSlyZXR1cm4gYTtpZihlPXgoYSkpe2lmKGc9ZGIoYSksIWIpcmV0dXJuICRhKGEsZyl9ZWxzZXt2YXIgbD1CLmNhbGwoYSksbj1sPT1HO2lmKGw9PXV8fGw9PUh8fG4mJiFkKXtpZihSKGEpKXJldHVybiBkP2E6e307Zz1lYihuP3t9OmEpO2lmKCFiKXJldHVybiBCYShnLGEpfWVsc2UgcmV0dXJuIHJbbF0/ZmIoYSxsLGIpOmQ/YTp7fX1mfHwoZj1bXSk7aHx8KGg9W10pO2ZvcihkPWYubGVuZ3RoO2QtLTspaWYoZltkXT09YSlyZXR1cm4gaFtkXTtmLnB1c2goYSk7aC5wdXNoKGcpOyhlP0FhOmdiKShhLGZ1bmN0aW9uKGUsZCl7Z1tkXT1GYShlLGIsYyxkLGEsZixoKX0pO3JldHVybiBnfWZ1bmN0aW9uIGhiKGEsYil7dmFyIGM9YT9hLmxlbmd0aDowLGU9W107aWYoIWMpcmV0dXJuIGU7dmFyIGQ9LTEsZjtmPW0uaW5kZXhPZnx8XG5wYTtmPWY9PT1wYT9uYTpmO3ZhciBoPWY9PT1uYSxnPWgmJmIubGVuZ3RoPj1pYj95YSYmemE/bmV3IHhhKGIpOm51bGw6bnVsbCxsPWIubGVuZ3RoO2cmJihmPVphLGg9ZmFsc2UsYj1nKTthOmZvcig7KytkPGM7KWlmKGc9YVtkXSxoJiZnPT09Zyl7Zm9yKHZhciBuPWw7bi0tOylpZihiW25dPT09Zyljb250aW51ZSBhO2UucHVzaChnKX1lbHNlIDA+ZihiLGcsMCkmJmUucHVzaChnKTtyZXR1cm4gZX1mdW5jdGlvbiBHYShhLGIsYyxlKXtlfHwoZT1bXSk7Zm9yKHZhciBkPS0xLGY9YS5sZW5ndGg7KytkPGY7KXt2YXIgaD1hW2RdO2lmKEEoaCkmJlMoaCkmJihjfHx4KGgpfHxUKGgpKSlpZihiKUdhKGgsYixjLGUpO2Vsc2UgZm9yKHZhciBnPWUsbD0tMSxuPWgubGVuZ3RoLGs9Zy5sZW5ndGg7KytsPG47KWdbaytsXT1oW2xdO2Vsc2UgY3x8KGVbZS5sZW5ndGhdPWgpfXJldHVybiBlfWZ1bmN0aW9uIGpiKGEsYil7SGEoYSxiLFUpfWZ1bmN0aW9uIGdiKGEsYil7cmV0dXJuIEhhKGEsYixcbkMpfWZ1bmN0aW9uIElhKGEsYixjKXtpZihudWxsIT1hKXthPXkoYSk7YyE9PXAmJmMgaW4gYSYmKGI9W2NdKTtjPTA7Zm9yKHZhciBlPWIubGVuZ3RoO251bGwhPWEmJmM8ZTspYT15KGEpW2JbYysrXV07cmV0dXJuIGMmJmM9PWU/YTpwfX1mdW5jdGlvbiBxYShhLGIsYyxlLGQsZil7aWYoYT09PWIpYT10cnVlO2Vsc2UgaWYobnVsbD09YXx8bnVsbD09Ynx8IXQoYSkmJiFBKGIpKWE9YSE9PWEmJmIhPT1iO2Vsc2UgYTp7dmFyIGg9cWEsZz14KGEpLGw9eChiKSxuPUUsaz1FO2d8fChuPUIuY2FsbChhKSxuPT1IP249dTpuIT11JiYoZz1yYShhKSkpO2x8fChrPUIuY2FsbChiKSxrPT1IP2s9dTprIT11JiZyYShiKSk7dmFyIHA9bj09dSYmIVIoYSksbD1rPT11JiYhUihiKSxrPW49PWs7aWYoIWt8fGd8fHApe2lmKCFlJiYobj1wJiZ2LmNhbGwoYSxcIl9fd3JhcHBlZF9fXCIpLGw9bCYmdi5jYWxsKGIsXCJfX3dyYXBwZWRfX1wiKSxufHxsKSl7YT1oKG4/YS52YWx1ZSgpOmEsbD9iLnZhbHVlKCk6XG5iLGMsZSxkLGYpO2JyZWFrIGF9aWYoayl7ZHx8KGQ9W10pO2Z8fChmPVtdKTtmb3Iobj1kLmxlbmd0aDtuLS07KWlmKGRbbl09PWEpe2E9ZltuXT09YjticmVhayBhfWQucHVzaChhKTtmLnB1c2goYik7YT0oZz9rYjpsYikoYSxiLGgsYyxlLGQsZik7ZC5wb3AoKTtmLnBvcCgpfWVsc2UgYT1mYWxzZX1lbHNlIGE9bWIoYSxiLG4pfXJldHVybiBhfWZ1bmN0aW9uIG5iKGEsYil7dmFyIGM9Yi5sZW5ndGgsZT1jO2lmKG51bGw9PWEpcmV0dXJuIWU7Zm9yKGE9eShhKTtjLS07KXt2YXIgZD1iW2NdO2lmKGRbMl0/ZFsxXSE9PWFbZFswXV06IShkWzBdaW4gYSkpcmV0dXJuIGZhbHNlfWZvcig7KytjPGU7KXt2YXIgZD1iW2NdLGY9ZFswXSxoPWFbZl0sZz1kWzFdO2lmKGRbMl0pe2lmKGg9PT1wJiYhKGYgaW4gYSkpcmV0dXJuIGZhbHNlfWVsc2UgaWYoZD1wLGQ9PT1wPyFxYShnLGgsdm9pZCAwLHRydWUpOiFkKXJldHVybiBmYWxzZX1yZXR1cm4gdHJ1ZX1mdW5jdGlvbiBEYShhKXt2YXIgYj1vYihhKTtpZigxPT1iLmxlbmd0aCYmXG5iWzBdWzJdKXt2YXIgYz1iWzBdWzBdLGU9YlswXVsxXTtyZXR1cm4gZnVuY3Rpb24oYSl7aWYobnVsbD09YSlyZXR1cm4gZmFsc2U7YT15KGEpO3JldHVybiBhW2NdPT09ZSYmKGUhPT1wfHxjIGluIGEpfX1yZXR1cm4gZnVuY3Rpb24oYSl7cmV0dXJuIG5iKGEsYil9fWZ1bmN0aW9uIGNiKGEsYil7dmFyIGM9eChhKSxlPUphKGEpJiZiPT09YiYmIXQoYiksZD1hK1wiXCI7YT1LYShhKTtyZXR1cm4gZnVuY3Rpb24oZil7aWYobnVsbD09ZilyZXR1cm4gZmFsc2U7dmFyIGg9ZDtmPXkoZik7aWYoISghYyYmZXx8aCBpbiBmKSl7aWYoMSE9YS5sZW5ndGgpe3ZhciBoPWEsZz0wLGw9LTEsbj0tMSxrPWgubGVuZ3RoLGc9bnVsbD09Zz8wOitnfHwwOzA+ZyYmKGc9LWc+az8wOmsrZyk7bD1sPT09cHx8bD5rP2s6K2x8fDA7MD5sJiYobCs9ayk7az1nPmw/MDpsLWc+Pj4wO2c+Pj49MDtmb3IobD1BcnJheShrKTsrK248azspbFtuXT1oW24rZ107Zj1JYShmLGwpfWlmKG51bGw9PWYpcmV0dXJuIGZhbHNlO2g9TGEoYSk7XG5mPXkoZil9cmV0dXJuIGZbaF09PT1iP2IhPT1wfHxoIGluIGY6cWEoYixmW2hdLHAsdHJ1ZSl9fWZ1bmN0aW9uIE1hKGEpe3JldHVybiBmdW5jdGlvbihiKXtyZXR1cm4gbnVsbD09Yj9wOnkoYilbYV19fWZ1bmN0aW9uIHBiKGEpe3ZhciBiPWErXCJcIjthPUthKGEpO3JldHVybiBmdW5jdGlvbihjKXtyZXR1cm4gSWEoYyxhLGIpfX1mdW5jdGlvbiBvYShhLGIsYyl7aWYodHlwZW9mIGEhPVwiZnVuY3Rpb25cIilyZXR1cm4gUTtpZihiPT09cClyZXR1cm4gYTtzd2l0Y2goYyl7Y2FzZSAxOnJldHVybiBmdW5jdGlvbihjKXtyZXR1cm4gYS5jYWxsKGIsYyl9O2Nhc2UgMzpyZXR1cm4gZnVuY3Rpb24oYyxkLGYpe3JldHVybiBhLmNhbGwoYixjLGQsZil9O2Nhc2UgNDpyZXR1cm4gZnVuY3Rpb24oYyxkLGYsaCl7cmV0dXJuIGEuY2FsbChiLGMsZCxmLGgpfTtjYXNlIDU6cmV0dXJuIGZ1bmN0aW9uKGMsZCxmLGgsZyl7cmV0dXJuIGEuY2FsbChiLGMsZCxmLGgsZyl9fXJldHVybiBmdW5jdGlvbigpe3JldHVybiBhLmFwcGx5KGIsXG5hcmd1bWVudHMpfX1mdW5jdGlvbiBOYShhKXt2YXIgYj1uZXcgcWIoYS5ieXRlTGVuZ3RoKTsobmV3IHNhKGIpKS5zZXQobmV3IHNhKGEpKTtyZXR1cm4gYn1mdW5jdGlvbiBrYihhLGIsYyxlLGQsZixoKXt2YXIgZz0tMSxsPWEubGVuZ3RoLG49Yi5sZW5ndGg7aWYobCE9biYmIShkJiZuPmwpKXJldHVybiBmYWxzZTtmb3IoOysrZzxsOyl7dmFyIGs9YVtnXSxuPWJbZ10sbT1lP2UoZD9uOmssZD9rOm4sZyk6cDtpZihtIT09cCl7aWYobSljb250aW51ZTtyZXR1cm4gZmFsc2V9aWYoZCl7aWYoIWJiKGIsZnVuY3Rpb24oYSl7cmV0dXJuIGs9PT1hfHxjKGssYSxlLGQsZixoKX0pKXJldHVybiBmYWxzZX1lbHNlIGlmKGshPT1uJiYhYyhrLG4sZSxkLGYsaCkpcmV0dXJuIGZhbHNlfXJldHVybiB0cnVlfWZ1bmN0aW9uIG1iKGEsYixjKXtzd2l0Y2goYyl7Y2FzZSBJOmNhc2UgSjpyZXR1cm4rYT09K2I7Y2FzZSBLOnJldHVybiBhLm5hbWU9PWIubmFtZSYmYS5tZXNzYWdlPT1iLm1lc3NhZ2U7Y2FzZSBMOnJldHVybiBhIT1cbithP2IhPStiOmE9PStiO2Nhc2UgTTpjYXNlIEQ6cmV0dXJuIGE9PWIrXCJcIn1yZXR1cm4gZmFsc2V9ZnVuY3Rpb24gbGIoYSxiLGMsZSxkLGYsaCl7dmFyIGc9QyhhKSxsPWcubGVuZ3RoLG49QyhiKS5sZW5ndGg7aWYobCE9biYmIWQpcmV0dXJuIGZhbHNlO2ZvcihuPWw7bi0tOyl7dmFyIGs9Z1tuXTtpZighKGQ/ayBpbiBiOnYuY2FsbChiLGspKSlyZXR1cm4gZmFsc2V9Zm9yKHZhciBtPWQ7KytuPGw7KXt2YXIgaz1nW25dLHI9YVtrXSxxPWJba10scz1lP2UoZD9xOnIsZD9yOnEsayk6cDtpZihzPT09cD8hYyhyLHEsZSxkLGYsaCk6IXMpcmV0dXJuIGZhbHNlO218fChtPVwiY29uc3RydWN0b3JcIj09ayl9cmV0dXJuIG18fChjPWEuY29uc3RydWN0b3IsZT1iLmNvbnN0cnVjdG9yLCEoYyE9ZSYmXCJjb25zdHJ1Y3RvclwiaW4gYSYmXCJjb25zdHJ1Y3RvclwiaW4gYil8fHR5cGVvZiBjPT1cImZ1bmN0aW9uXCImJmMgaW5zdGFuY2VvZiBjJiZ0eXBlb2YgZT09XCJmdW5jdGlvblwiJiZlIGluc3RhbmNlb2YgZSk/dHJ1ZTpmYWxzZX1mdW5jdGlvbiBvYihhKXthPVxuT2EoYSk7Zm9yKHZhciBiPWEubGVuZ3RoO2ItLTspe3ZhciBjPWFbYl1bMV07YVtiXVsyXT1jPT09YyYmIXQoYyl9cmV0dXJuIGF9ZnVuY3Rpb24gVihhLGIpe3ZhciBjPW51bGw9PWE/cDphW2JdO3JldHVybiBQYShjKT9jOnB9ZnVuY3Rpb24gZGIoYSl7dmFyIGI9YS5sZW5ndGgsYz1uZXcgYS5jb25zdHJ1Y3RvcihiKTtiJiZcInN0cmluZ1wiPT10eXBlb2YgYVswXSYmdi5jYWxsKGEsXCJpbmRleFwiKSYmKGMuaW5kZXg9YS5pbmRleCxjLmlucHV0PWEuaW5wdXQpO3JldHVybiBjfWZ1bmN0aW9uIGViKGEpe2E9YS5jb25zdHJ1Y3Rvcjt0eXBlb2YgYT09XCJmdW5jdGlvblwiJiZhIGluc3RhbmNlb2YgYXx8KGE9T2JqZWN0KTtyZXR1cm4gbmV3IGF9ZnVuY3Rpb24gZmIoYSxiLGMpe3ZhciBlPWEuY29uc3RydWN0b3I7c3dpdGNoKGIpe2Nhc2UgdGE6cmV0dXJuIE5hKGEpO2Nhc2UgSTpjYXNlIEo6cmV0dXJuIG5ldyBlKCthKTtjYXNlIFc6Y2FzZSBYOmNhc2UgWTpjYXNlIFo6Y2FzZSAkOmNhc2UgYWE6Y2FzZSBiYTpjYXNlIGNhOmNhc2UgZGE6cmV0dXJuIGUgaW5zdGFuY2VvZlxuZSYmKGU9eltiXSksYj1hLmJ1ZmZlcixuZXcgZShjP05hKGIpOmIsYS5ieXRlT2Zmc2V0LGEubGVuZ3RoKTtjYXNlIEw6Y2FzZSBEOnJldHVybiBuZXcgZShhKTtjYXNlIE06dmFyIGQ9bmV3IGUoYS5zb3VyY2UscmIuZXhlYyhhKSk7ZC5sYXN0SW5kZXg9YS5sYXN0SW5kZXh9cmV0dXJuIGR9ZnVuY3Rpb24gUyhhKXtyZXR1cm4gbnVsbCE9YSYmTihzYihhKSl9ZnVuY3Rpb24gZWEoYSxiKXthPXR5cGVvZiBhPT1cIm51bWJlclwifHx0Yi50ZXN0KGEpPythOi0xO2I9bnVsbD09Yj9RYTpiO3JldHVybi0xPGEmJjA9PWElMSYmYTxifWZ1bmN0aW9uIFJhKGEsYixjKXtpZighdChjKSlyZXR1cm4gZmFsc2U7dmFyIGU9dHlwZW9mIGI7cmV0dXJuKFwibnVtYmVyXCI9PWU/UyhjKSYmZWEoYixjLmxlbmd0aCk6XCJzdHJpbmdcIj09ZSYmYiBpbiBjKT8oYj1jW2JdLGE9PT1hP2E9PT1iOmIhPT1iKTpmYWxzZX1mdW5jdGlvbiBKYShhKXt2YXIgYj10eXBlb2YgYTtyZXR1cm5cInN0cmluZ1wiPT1iJiZ1Yi50ZXN0KGEpfHxcblwibnVtYmVyXCI9PWI/dHJ1ZTp4KGEpP2ZhbHNlOiF2Yi50ZXN0KGEpfHxmYWxzZX1mdW5jdGlvbiBOKGEpe3JldHVybiB0eXBlb2YgYT09XCJudW1iZXJcIiYmLTE8YSYmMD09YSUxJiZhPD1RYX1mdW5jdGlvbiB3YihhLGIpe2E9eShhKTtmb3IodmFyIGM9LTEsZT1iLmxlbmd0aCxkPXt9OysrYzxlOyl7dmFyIGY9YltjXTtmIGluIGEmJihkW2ZdPWFbZl0pfXJldHVybiBkfWZ1bmN0aW9uIHhiKGEsYil7dmFyIGM9e307amIoYSxmdW5jdGlvbihhLGQsZil7YihhLGQsZikmJihjW2RdPWEpfSk7cmV0dXJuIGN9ZnVuY3Rpb24gU2EoYSl7Zm9yKHZhciBiPVUoYSksYz1iLmxlbmd0aCxlPWMmJmEubGVuZ3RoLGQ9ISFlJiZOKGUpJiYoeChhKXx8VChhKXx8ZmEoYSkpLGY9LTEsaD1bXTsrK2Y8Yzspe3ZhciBnPWJbZl07KGQmJmVhKGcsZSl8fHYuY2FsbChhLGcpKSYmaC5wdXNoKGcpfXJldHVybiBofWZ1bmN0aW9uIHkoYSl7aWYobS5zdXBwb3J0LnVuaW5kZXhlZENoYXJzJiZmYShhKSl7Zm9yKHZhciBiPS0xLFxuYz1hLmxlbmd0aCxlPU9iamVjdChhKTsrK2I8YzspZVtiXT1hLmNoYXJBdChiKTtyZXR1cm4gZX1yZXR1cm4gdChhKT9hOk9iamVjdChhKX1mdW5jdGlvbiBLYShhKXtpZih4KGEpKXJldHVybiBhO3ZhciBiPVtdOyhudWxsPT1hP1wiXCI6YStcIlwiKS5yZXBsYWNlKHliLGZ1bmN0aW9uKGEsZSxkLGYpe2IucHVzaChkP2YucmVwbGFjZSh6YixcIiQxXCIpOmV8fGEpfSk7cmV0dXJuIGJ9ZnVuY3Rpb24gcGEoYSxiLGMpe3ZhciBlPWE/YS5sZW5ndGg6MDtpZighZSlyZXR1cm4tMTtpZih0eXBlb2YgYz09XCJudW1iZXJcIiljPTA+Yz91YShlK2MsMCk6YztlbHNlIGlmKGMpe2M9MDt2YXIgZD1hP2EubGVuZ3RoOmM7aWYodHlwZW9mIGI9PVwibnVtYmVyXCImJmI9PT1iJiZkPD1BYil7Zm9yKDtjPGQ7KXt2YXIgZj1jK2Q+Pj4xLGg9YVtmXTtoPGImJm51bGwhPT1oP2M9ZisxOmQ9Zn1jPWR9ZWxzZXtkPVE7Yz1kKGIpO2Zvcih2YXIgZj0wLGg9YT9hLmxlbmd0aDowLGc9YyE9PWMsbD1udWxsPT09YyxuPVxuYz09PXA7ZjxoOyl7dmFyIGs9QmIoKGYraCkvMiksbT1kKGFba10pLHI9bSE9PXAscT1tPT09bTsoZz9xOmw/cSYmciYmbnVsbCE9bTpuP3EmJnI6bnVsbD09bT8wOm08Yyk/Zj1rKzE6aD1rfWM9Q2IoaCxEYil9cmV0dXJuIGM8ZSYmKGI9PT1iP2I9PT1hW2NdOmFbY10hPT1hW2NdKT9jOi0xfXJldHVybiBuYShhLGIsY3x8MCl9ZnVuY3Rpb24gTGEoYSl7dmFyIGI9YT9hLmxlbmd0aDowO3JldHVybiBiP2FbYi0xXTpwfWZ1bmN0aW9uIGdhKGEsYil7aWYodHlwZW9mIGEhPVwiZnVuY3Rpb25cIil0aHJvdyBuZXcgVHlwZUVycm9yKEViKTtiPXVhKGI9PT1wP2EubGVuZ3RoLTE6K2J8fDAsMCk7cmV0dXJuIGZ1bmN0aW9uKCl7Zm9yKHZhciBjPWFyZ3VtZW50cyxlPS0xLGQ9dWEoYy5sZW5ndGgtYiwwKSxmPUFycmF5KGQpOysrZTxkOylmW2VdPWNbYitlXTtzd2l0Y2goYil7Y2FzZSAwOnJldHVybiBhLmNhbGwodGhpcyxmKTtjYXNlIDE6cmV0dXJuIGEuY2FsbCh0aGlzLGNbMF0sZik7Y2FzZSAyOnJldHVybiBhLmNhbGwodGhpcyxcbmNbMF0sY1sxXSxmKX1kPUFycmF5KGIrMSk7Zm9yKGU9LTE7KytlPGI7KWRbZV09Y1tlXTtkW2JdPWY7cmV0dXJuIGEuYXBwbHkodGhpcyxkKX19ZnVuY3Rpb24gVChhKXtyZXR1cm4gQShhKSYmUyhhKSYmdi5jYWxsKGEsXCJjYWxsZWVcIikmJiFoYS5jYWxsKGEsXCJjYWxsZWVcIil9ZnVuY3Rpb24gaWEoYSl7cmV0dXJuIHQoYSkmJkIuY2FsbChhKT09R31mdW5jdGlvbiB0KGEpe3ZhciBiPXR5cGVvZiBhO3JldHVybiEhYSYmKFwib2JqZWN0XCI9PWJ8fFwiZnVuY3Rpb25cIj09Yil9ZnVuY3Rpb24gUGEoYSl7cmV0dXJuIG51bGw9PWE/ZmFsc2U6aWEoYSk/VGEudGVzdChVYS5jYWxsKGEpKTpBKGEpJiYoUihhKT9UYTpGYikudGVzdChhKX1mdW5jdGlvbiBmYShhKXtyZXR1cm4gdHlwZW9mIGE9PVwic3RyaW5nXCJ8fEEoYSkmJkIuY2FsbChhKT09RH1mdW5jdGlvbiByYShhKXtyZXR1cm4gQShhKSYmTihhLmxlbmd0aCkmJiEhcVtCLmNhbGwoYSldfWZ1bmN0aW9uIFUoYSl7aWYobnVsbD09YSlyZXR1cm5bXTtcbnQoYSl8fChhPU9iamVjdChhKSk7Zm9yKHZhciBiPWEubGVuZ3RoLGM9bS5zdXBwb3J0LGI9YiYmTihiKSYmKHgoYSl8fFQoYSl8fGZhKGEpKSYmYnx8MCxlPWEuY29uc3RydWN0b3IsZD0tMSxlPWlhKGUpJiZlLnByb3RvdHlwZXx8RixmPWU9PT1hLGg9QXJyYXkoYiksZz0wPGIsbD1jLmVudW1FcnJvclByb3BzJiYoYT09PWphfHxhIGluc3RhbmNlb2YgRXJyb3IpLG49Yy5lbnVtUHJvdG90eXBlcyYmaWEoYSk7KytkPGI7KWhbZF09ZCtcIlwiO2Zvcih2YXIgayBpbiBhKW4mJlwicHJvdG90eXBlXCI9PWt8fGwmJihcIm1lc3NhZ2VcIj09a3x8XCJuYW1lXCI9PWspfHxnJiZlYShrLGIpfHxcImNvbnN0cnVjdG9yXCI9PWsmJihmfHwhdi5jYWxsKGEsaykpfHxoLnB1c2goayk7aWYoYy5ub25FbnVtU2hhZG93cyYmYSE9PUYpZm9yKGI9YT09PUdiP0Q6YT09PWphP0s6Qi5jYWxsKGEpLGM9c1tiXXx8c1t1XSxiPT11JiYoZT1GKSxiPXZhLmxlbmd0aDtiLS07KWs9dmFbYl0sZD1jW2tdLGYmJmR8fChkPyF2LmNhbGwoYSxcbmspOmFba109PT1lW2tdKXx8aC5wdXNoKGspO3JldHVybiBofWZ1bmN0aW9uIE9hKGEpe2E9eShhKTtmb3IodmFyIGI9LTEsYz1DKGEpLGU9Yy5sZW5ndGgsZD1BcnJheShlKTsrK2I8ZTspe3ZhciBmPWNbYl07ZFtiXT1bZixhW2ZdXX1yZXR1cm4gZH1mdW5jdGlvbiBrYShhLGIsYyl7YyYmUmEoYSxiLGMpJiYoYj1wKTtyZXR1cm4gQShhKT9WYShhKTpDYShhLGIpfWZ1bmN0aW9uIFEoYSl7cmV0dXJuIGF9ZnVuY3Rpb24gVmEoYSl7cmV0dXJuIERhKEZhKGEsdHJ1ZSkpfWZ1bmN0aW9uIEVhKGEpe3JldHVybiBKYShhKT9NYShhKTpwYihhKX12YXIgcCxpYj0yMDAsRWI9XCJFeHBlY3RlZCBhIGZ1bmN0aW9uXCIsSD1cIltvYmplY3QgQXJndW1lbnRzXVwiLEU9XCJbb2JqZWN0IEFycmF5XVwiLEk9XCJbb2JqZWN0IEJvb2xlYW5dXCIsSj1cIltvYmplY3QgRGF0ZV1cIixLPVwiW29iamVjdCBFcnJvcl1cIixHPVwiW29iamVjdCBGdW5jdGlvbl1cIixMPVwiW29iamVjdCBOdW1iZXJdXCIsdT1cIltvYmplY3QgT2JqZWN0XVwiLFxuTT1cIltvYmplY3QgUmVnRXhwXVwiLEQ9XCJbb2JqZWN0IFN0cmluZ11cIix0YT1cIltvYmplY3QgQXJyYXlCdWZmZXJdXCIsVz1cIltvYmplY3QgRmxvYXQzMkFycmF5XVwiLFg9XCJbb2JqZWN0IEZsb2F0NjRBcnJheV1cIixZPVwiW29iamVjdCBJbnQ4QXJyYXldXCIsWj1cIltvYmplY3QgSW50MTZBcnJheV1cIiwkPVwiW29iamVjdCBJbnQzMkFycmF5XVwiLGFhPVwiW29iamVjdCBVaW50OEFycmF5XVwiLGJhPVwiW29iamVjdCBVaW50OENsYW1wZWRBcnJheV1cIixjYT1cIltvYmplY3QgVWludDE2QXJyYXldXCIsZGE9XCJbb2JqZWN0IFVpbnQzMkFycmF5XVwiLHZiPS9cXC58XFxbKD86W15bXFxdXSp8KFtcIiddKSg/Oig/IVxcMSlbXlxcblxcXFxdfFxcXFwuKSo/XFwxKVxcXS8sdWI9L15cXHcqJC8seWI9L1teLltcXF1dK3xcXFsoPzooLT9cXGQrKD86XFwuXFxkKyk/KXwoW1wiJ10pKCg/Oig/IVxcMilbXlxcblxcXFxdfFxcXFwuKSo/KVxcMilcXF0vZyx6Yj0vXFxcXChcXFxcKT8vZyxyYj0vXFx3KiQvLEZiPS9eXFxbb2JqZWN0IC4rP0NvbnN0cnVjdG9yXFxdJC8sdGI9L15cXGQrJC8sXG52YT1cImNvbnN0cnVjdG9yIGhhc093blByb3BlcnR5IGlzUHJvdG90eXBlT2YgcHJvcGVydHlJc0VudW1lcmFibGUgdG9Mb2NhbGVTdHJpbmcgdG9TdHJpbmcgdmFsdWVPZlwiLnNwbGl0KFwiIFwiKSxxPXt9O3FbV109cVtYXT1xW1ldPXFbWl09cVskXT1xW2FhXT1xW2JhXT1xW2NhXT1xW2RhXT10cnVlO3FbSF09cVtFXT1xW3RhXT1xW0ldPXFbSl09cVtLXT1xW0ddPXFbXCJbb2JqZWN0IE1hcF1cIl09cVtMXT1xW3VdPXFbTV09cVtcIltvYmplY3QgU2V0XVwiXT1xW0RdPXFbXCJbb2JqZWN0IFdlYWtNYXBdXCJdPWZhbHNlO3ZhciByPXt9O3JbSF09cltFXT1yW3RhXT1yW0ldPXJbSl09cltXXT1yW1hdPXJbWV09cltaXT1yWyRdPXJbTF09clt1XT1yW01dPXJbRF09clthYV09cltiYV09cltjYV09cltkYV09dHJ1ZTtyW0tdPXJbR109cltcIltvYmplY3QgTWFwXVwiXT1yW1wiW29iamVjdCBTZXRdXCJdPXJbXCJbb2JqZWN0IFdlYWtNYXBdXCJdPWZhbHNlO3ZhciBsYT17XCJmdW5jdGlvblwiOnRydWUsb2JqZWN0OnRydWV9LG1hPWxhW3R5cGVvZiBleHBvcnRzXSYmXG5leHBvcnRzJiYhZXhwb3J0cy5ub2RlVHlwZSYmZXhwb3J0cyxPPWxhW3R5cGVvZiBtb2R1bGVdJiZtb2R1bGUmJiFtb2R1bGUubm9kZVR5cGUmJm1vZHVsZSxIYj1sYVt0eXBlb2Ygc2VsZl0mJnNlbGYmJnNlbGYuT2JqZWN0JiZzZWxmLFdhPWxhW3R5cGVvZiB3aW5kb3ddJiZ3aW5kb3cmJndpbmRvdy5PYmplY3QmJndpbmRvdyxJYj1PJiZPLmV4cG9ydHM9PT1tYSYmbWEsdz1tYSYmTyYmdHlwZW9mIGdsb2JhbD09XCJvYmplY3RcIiYmZ2xvYmFsJiZnbG9iYWwuT2JqZWN0JiZnbG9iYWx8fFdhIT09KHRoaXMmJnRoaXMud2luZG93KSYmV2F8fEhifHx0aGlzLFI9ZnVuY3Rpb24oKXt0cnl7T2JqZWN0KHt0b1N0cmluZzowfStcIlwiKX1jYXRjaChhKXtyZXR1cm4gZnVuY3Rpb24oKXtyZXR1cm4gZmFsc2V9fXJldHVybiBmdW5jdGlvbihhKXtyZXR1cm4gdHlwZW9mIGEudG9TdHJpbmchPVwiZnVuY3Rpb25cIiYmdHlwZW9mKGErXCJcIik9PVwic3RyaW5nXCJ9fSgpLEpiPUFycmF5LnByb3RvdHlwZSxqYT1FcnJvci5wcm90b3R5cGUsXG5GPU9iamVjdC5wcm90b3R5cGUsR2I9U3RyaW5nLnByb3RvdHlwZSxVYT1GdW5jdGlvbi5wcm90b3R5cGUudG9TdHJpbmcsdj1GLmhhc093blByb3BlcnR5LEI9Ri50b1N0cmluZyxUYT1SZWdFeHAoXCJeXCIrVWEuY2FsbCh2KS5yZXBsYWNlKC9bXFxcXF4kLiorPygpW1xcXXt9fF0vZyxcIlxcXFwkJlwiKS5yZXBsYWNlKC9oYXNPd25Qcm9wZXJ0eXwoZnVuY3Rpb24pLio/KD89XFxcXFxcKCl8IGZvciAuKz8oPz1cXFxcXFxdKS9nLFwiJDEuKj9cIikrXCIkXCIpLHFiPXcuQXJyYXlCdWZmZXIsaGE9Ri5wcm9wZXJ0eUlzRW51bWVyYWJsZSx6YT1WKHcsXCJTZXRcIiksWGE9SmIuc3BsaWNlLHNhPXcuVWludDhBcnJheSx5YT1WKE9iamVjdCxcImNyZWF0ZVwiKSxCYj1NYXRoLmZsb29yLEtiPVYoQXJyYXksXCJpc0FycmF5XCIpLFlhPVYoT2JqZWN0LFwia2V5c1wiKSx1YT1NYXRoLm1heCxDYj1NYXRoLm1pbixEYj00Mjk0OTY3Mjk0LEFiPTIxNDc0ODM2NDcsUWE9OTAwNzE5OTI1NDc0MDk5MSx6PXt9O3pbV109dy5GbG9hdDMyQXJyYXk7XG56W1hdPXcuRmxvYXQ2NEFycmF5O3pbWV09dy5JbnQ4QXJyYXk7eltaXT13LkludDE2QXJyYXk7elskXT13LkludDMyQXJyYXk7elthYV09c2E7eltiYV09dy5VaW50OENsYW1wZWRBcnJheTt6W2NhXT13LlVpbnQxNkFycmF5O3pbZGFdPXcuVWludDMyQXJyYXk7dmFyIHM9e307c1tFXT1zW0pdPXNbTF09e2NvbnN0cnVjdG9yOnRydWUsdG9Mb2NhbGVTdHJpbmc6dHJ1ZSx0b1N0cmluZzp0cnVlLHZhbHVlT2Y6dHJ1ZX07c1tJXT1zW0RdPXtjb25zdHJ1Y3Rvcjp0cnVlLHRvU3RyaW5nOnRydWUsdmFsdWVPZjp0cnVlfTtzW0tdPXNbR109c1tNXT17Y29uc3RydWN0b3I6dHJ1ZSx0b1N0cmluZzp0cnVlfTtzW3VdPXtjb25zdHJ1Y3Rvcjp0cnVlfTtBYSh2YSxmdW5jdGlvbihhKXtmb3IodmFyIGIgaW4gcylpZih2LmNhbGwocyxiKSl7dmFyIGM9c1tiXTtjW2FdPXYuY2FsbChjLGEpfX0pO3ZhciBQPW0uc3VwcG9ydD17fTsoZnVuY3Rpb24oYSl7ZnVuY3Rpb24gYigpe3RoaXMueD1hfXZhciBjPXswOmEsbGVuZ3RoOmF9LFxuZT1bXTtiLnByb3RvdHlwZT17dmFsdWVPZjphLHk6YX07Zm9yKHZhciBkIGluIG5ldyBiKWUucHVzaChkKTtQLmVudW1FcnJvclByb3BzPWhhLmNhbGwoamEsXCJtZXNzYWdlXCIpfHxoYS5jYWxsKGphLFwibmFtZVwiKTtQLmVudW1Qcm90b3R5cGVzPWhhLmNhbGwoYixcInByb3RvdHlwZVwiKTtQLm5vbkVudW1TaGFkb3dzPSEvdmFsdWVPZi8udGVzdChlKTtQLnNwbGljZU9iamVjdHM9KFhhLmNhbGwoYywwLDEpLCFjWzBdKTtQLnVuaW5kZXhlZENoYXJzPVwieHhcIiE9XCJ4XCJbMF0rT2JqZWN0KFwieFwiKVswXX0pKDEsMCk7dmFyIEhhPWZ1bmN0aW9uKGEpe3JldHVybiBmdW5jdGlvbihiLGMsZSl7dmFyIGQ9eShiKTtlPWUoYik7Zm9yKHZhciBmPWUubGVuZ3RoLGg9YT9mOi0xO2E/aC0tOisraDxmOyl7dmFyIGc9ZVtoXTtpZihmYWxzZT09PWMoZFtnXSxnLGQpKWJyZWFrfXJldHVybiBifX0oKSxzYj1NYShcImxlbmd0aFwiKSx4PUtifHxmdW5jdGlvbihhKXtyZXR1cm4gQShhKSYmTihhLmxlbmd0aCkmJkIuY2FsbChhKT09XG5FfSx3YT1mdW5jdGlvbihhKXtyZXR1cm4gZ2EoZnVuY3Rpb24oYixjKXt2YXIgZT0tMSxkPW51bGw9PWI/MDpjLmxlbmd0aCxmPTI8ZD9jW2QtMl06cCxoPTI8ZD9jWzJdOnAsZz0xPGQ/Y1tkLTFdOnA7dHlwZW9mIGY9PVwiZnVuY3Rpb25cIj8oZj1vYShmLGcsNSksZC09Mik6KGY9dHlwZW9mIGc9PVwiZnVuY3Rpb25cIj9nOnAsZC09Zj8xOjApO2gmJlJhKGNbMF0sY1sxXSxoKSYmKGY9Mz5kP3A6ZixkPTEpO2Zvcig7KytlPGQ7KShoPWNbZV0pJiZhKGIsaCxmKTtyZXR1cm4gYn0pfShmdW5jdGlvbihhLGIsYyl7aWYoYylmb3IodmFyIGU9LTEsZD1DKGIpLGY9ZC5sZW5ndGg7KytlPGY7KXt2YXIgaD1kW2VdLGc9YVtoXSxsPWMoZyxiW2hdLGgsYSxiKTsobD09PWw/bD09PWc6ZyE9PWcpJiYoZyE9PXB8fGggaW4gYSl8fChhW2hdPWwpfWVsc2UgYT1CYShhLGIpO3JldHVybiBhfSksTGI9ZnVuY3Rpb24oYSxiKXtyZXR1cm4gZ2EoZnVuY3Rpb24oYyl7dmFyIGU9Y1swXTtpZihudWxsPT1lKXJldHVybiBlO1xuYy5wdXNoKGIpO3JldHVybiBhLmFwcGx5KHAsYyl9KX0od2EsZnVuY3Rpb24oYSxiKXtyZXR1cm4gYT09PXA/YjphfSksQz1ZYT9mdW5jdGlvbihhKXt2YXIgYj1udWxsPT1hP3A6YS5jb25zdHJ1Y3RvcjtyZXR1cm4gdHlwZW9mIGI9PVwiZnVuY3Rpb25cIiYmYi5wcm90b3R5cGU9PT1hfHwodHlwZW9mIGE9PVwiZnVuY3Rpb25cIj9tLnN1cHBvcnQuZW51bVByb3RvdHlwZXM6UyhhKSk/U2EoYSk6dChhKT9ZYShhKTpbXX06U2EsTWI9Z2EoZnVuY3Rpb24oYSxiKXtpZihudWxsPT1hKXJldHVybnt9O2lmKFwiZnVuY3Rpb25cIiE9dHlwZW9mIGJbMF0pcmV0dXJuIGI9YWIoR2EoYikpLHdiKGEsaGIoVShhKSxiKSk7dmFyIGM9b2EoYlswXSxiWzFdLDMpO3JldHVybiB4YihhLGZ1bmN0aW9uKGEsYixmKXtyZXR1cm4hYyhhLGIsZil9KX0pO3hhLnByb3RvdHlwZS5wdXNoPWZ1bmN0aW9uKGEpe3ZhciBiPXRoaXMuZGF0YTt0eXBlb2YgYT09XCJzdHJpbmdcInx8dChhKT9iLnNldC5hZGQoYSk6Yi5oYXNoW2FdPVxuITB9O20uYXNzaWduPXdhO20uY2FsbGJhY2s9a2E7bS5kZWZhdWx0cz1MYjttLmtleXM9QzttLmtleXNJbj1VO20ubWF0Y2hlcz1WYTttLm9taXQ9TWI7bS5wYWlycz1PYTttLnByb3BlcnR5PUVhO20ucmVtb3ZlPWZ1bmN0aW9uKGEsYixjKXt2YXIgZT1bXTtpZighYXx8IWEubGVuZ3RoKXJldHVybiBlO3ZhciBkPS0xLGY9W10saD1hLmxlbmd0aCxnPW0uY2FsbGJhY2t8fGthLGc9Zz09PWthP0NhOmc7Zm9yKGI9ZyhiLGMsMyk7KytkPGg7KWM9YVtkXSxiKGMsZCxhKSYmKGUucHVzaChjKSxmLnB1c2goZCkpO2ZvcihiPWE/Zi5sZW5ndGg6MDtiLS07KWlmKGQ9ZltiXSxkIT1sJiZlYShkKSl7dmFyIGw9ZDtYYS5jYWxsKGEsZCwxKX1yZXR1cm4gZX07bS5yZXN0UGFyYW09Z2E7bS5leHRlbmQ9d2E7bS5pdGVyYXRlZT1rYTttLmlkZW50aXR5PVE7bS5pbmRleE9mPXBhO20uaXNBcmd1bWVudHM9VDttLmlzQXJyYXk9eDttLmlzRnVuY3Rpb249aWE7bS5pc05hdGl2ZT1QYTttLmlzT2JqZWN0PVxudDttLmlzU3RyaW5nPWZhO20uaXNUeXBlZEFycmF5PXJhO20ubGFzdD1MYTttLlZFUlNJT049XCIzLjEwLjFcIjttYSYmTyYmSWImJigoTy5leHBvcnRzPW0pLl89bSl9LmNhbGwodGhpcykpOyJdfQ==
