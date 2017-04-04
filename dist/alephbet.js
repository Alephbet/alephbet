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


},{"./adapters":5,"./options":7,"./utils":9}],7:[function(require,module,exports){
module.exports = {
  debug: false
};


},{}],8:[function(require,module,exports){
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


},{"store":4}],9:[function(require,module,exports){
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

  return Utils;

})();

module.exports = Utils;


},{"./options":7,"crypto-js/sha1":2,"lodash.custom":10,"node-uuid":3}],10:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY3J5cHRvLWpzL2NvcmUuanMiLCJub2RlX21vZHVsZXMvY3J5cHRvLWpzL3NoYTEuanMiLCJub2RlX21vZHVsZXMvbm9kZS11dWlkL3V1aWQuanMiLCJub2RlX21vZHVsZXMvc3RvcmUvc3RvcmUuanMiLCJzcmMvYWRhcHRlcnMuY29mZmVlIiwic3JjL2FsZXBoYmV0LmNvZmZlZSIsInNyYy9vcHRpb25zLmNvZmZlZSIsInNyYy9zdG9yYWdlLmNvZmZlZSIsInNyYy91dGlscy5jb2ZmZWUiLCJ2ZW5kb3IvbG9kYXNoLmN1c3RvbS5taW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2dkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNyUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDL0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiOyhmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuXHRpZiAodHlwZW9mIGV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcblx0XHQvLyBDb21tb25KU1xuXHRcdG1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IGZhY3RvcnkoKTtcblx0fVxuXHRlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuXHRcdC8vIEFNRFxuXHRcdGRlZmluZShbXSwgZmFjdG9yeSk7XG5cdH1cblx0ZWxzZSB7XG5cdFx0Ly8gR2xvYmFsIChicm93c2VyKVxuXHRcdHJvb3QuQ3J5cHRvSlMgPSBmYWN0b3J5KCk7XG5cdH1cbn0odGhpcywgZnVuY3Rpb24gKCkge1xuXG5cdC8qKlxuXHQgKiBDcnlwdG9KUyBjb3JlIGNvbXBvbmVudHMuXG5cdCAqL1xuXHR2YXIgQ3J5cHRvSlMgPSBDcnlwdG9KUyB8fCAoZnVuY3Rpb24gKE1hdGgsIHVuZGVmaW5lZCkge1xuXHQgICAgLypcblx0ICAgICAqIExvY2FsIHBvbHlmaWwgb2YgT2JqZWN0LmNyZWF0ZVxuXHQgICAgICovXG5cdCAgICB2YXIgY3JlYXRlID0gT2JqZWN0LmNyZWF0ZSB8fCAoZnVuY3Rpb24gKCkge1xuXHQgICAgICAgIGZ1bmN0aW9uIEYoKSB7fTtcblxuXHQgICAgICAgIHJldHVybiBmdW5jdGlvbiAob2JqKSB7XG5cdCAgICAgICAgICAgIHZhciBzdWJ0eXBlO1xuXG5cdCAgICAgICAgICAgIEYucHJvdG90eXBlID0gb2JqO1xuXG5cdCAgICAgICAgICAgIHN1YnR5cGUgPSBuZXcgRigpO1xuXG5cdCAgICAgICAgICAgIEYucHJvdG90eXBlID0gbnVsbDtcblxuXHQgICAgICAgICAgICByZXR1cm4gc3VidHlwZTtcblx0ICAgICAgICB9O1xuXHQgICAgfSgpKVxuXG5cdCAgICAvKipcblx0ICAgICAqIENyeXB0b0pTIG5hbWVzcGFjZS5cblx0ICAgICAqL1xuXHQgICAgdmFyIEMgPSB7fTtcblxuXHQgICAgLyoqXG5cdCAgICAgKiBMaWJyYXJ5IG5hbWVzcGFjZS5cblx0ICAgICAqL1xuXHQgICAgdmFyIENfbGliID0gQy5saWIgPSB7fTtcblxuXHQgICAgLyoqXG5cdCAgICAgKiBCYXNlIG9iamVjdCBmb3IgcHJvdG90eXBhbCBpbmhlcml0YW5jZS5cblx0ICAgICAqL1xuXHQgICAgdmFyIEJhc2UgPSBDX2xpYi5CYXNlID0gKGZ1bmN0aW9uICgpIHtcblxuXG5cdCAgICAgICAgcmV0dXJuIHtcblx0ICAgICAgICAgICAgLyoqXG5cdCAgICAgICAgICAgICAqIENyZWF0ZXMgYSBuZXcgb2JqZWN0IHRoYXQgaW5oZXJpdHMgZnJvbSB0aGlzIG9iamVjdC5cblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IG92ZXJyaWRlcyBQcm9wZXJ0aWVzIHRvIGNvcHkgaW50byB0aGUgbmV3IG9iamVjdC5cblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogQHJldHVybiB7T2JqZWN0fSBUaGUgbmV3IG9iamVjdC5cblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogQHN0YXRpY1xuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiAgICAgdmFyIE15VHlwZSA9IENyeXB0b0pTLmxpYi5CYXNlLmV4dGVuZCh7XG5cdCAgICAgICAgICAgICAqICAgICAgICAgZmllbGQ6ICd2YWx1ZScsXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqICAgICAgICAgbWV0aG9kOiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgICAqICAgICAgICAgfVxuXHQgICAgICAgICAgICAgKiAgICAgfSk7XG5cdCAgICAgICAgICAgICAqL1xuXHQgICAgICAgICAgICBleHRlbmQ6IGZ1bmN0aW9uIChvdmVycmlkZXMpIHtcblx0ICAgICAgICAgICAgICAgIC8vIFNwYXduXG5cdCAgICAgICAgICAgICAgICB2YXIgc3VidHlwZSA9IGNyZWF0ZSh0aGlzKTtcblxuXHQgICAgICAgICAgICAgICAgLy8gQXVnbWVudFxuXHQgICAgICAgICAgICAgICAgaWYgKG92ZXJyaWRlcykge1xuXHQgICAgICAgICAgICAgICAgICAgIHN1YnR5cGUubWl4SW4ob3ZlcnJpZGVzKTtcblx0ICAgICAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGRlZmF1bHQgaW5pdGlhbGl6ZXJcblx0ICAgICAgICAgICAgICAgIGlmICghc3VidHlwZS5oYXNPd25Qcm9wZXJ0eSgnaW5pdCcpIHx8IHRoaXMuaW5pdCA9PT0gc3VidHlwZS5pbml0KSB7XG5cdCAgICAgICAgICAgICAgICAgICAgc3VidHlwZS5pbml0ID0gZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICAgICAgICAgICAgICBzdWJ0eXBlLiRzdXBlci5pbml0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdCAgICAgICAgICAgICAgICAgICAgfTtcblx0ICAgICAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICAgICAgLy8gSW5pdGlhbGl6ZXIncyBwcm90b3R5cGUgaXMgdGhlIHN1YnR5cGUgb2JqZWN0XG5cdCAgICAgICAgICAgICAgICBzdWJ0eXBlLmluaXQucHJvdG90eXBlID0gc3VidHlwZTtcblxuXHQgICAgICAgICAgICAgICAgLy8gUmVmZXJlbmNlIHN1cGVydHlwZVxuXHQgICAgICAgICAgICAgICAgc3VidHlwZS4kc3VwZXIgPSB0aGlzO1xuXG5cdCAgICAgICAgICAgICAgICByZXR1cm4gc3VidHlwZTtcblx0ICAgICAgICAgICAgfSxcblxuXHQgICAgICAgICAgICAvKipcblx0ICAgICAgICAgICAgICogRXh0ZW5kcyB0aGlzIG9iamVjdCBhbmQgcnVucyB0aGUgaW5pdCBtZXRob2QuXG5cdCAgICAgICAgICAgICAqIEFyZ3VtZW50cyB0byBjcmVhdGUoKSB3aWxsIGJlIHBhc3NlZCB0byBpbml0KCkuXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqIEByZXR1cm4ge09iamVjdH0gVGhlIG5ldyBvYmplY3QuXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqIEBzdGF0aWNcblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogICAgIHZhciBpbnN0YW5jZSA9IE15VHlwZS5jcmVhdGUoKTtcblx0ICAgICAgICAgICAgICovXG5cdCAgICAgICAgICAgIGNyZWF0ZTogZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICAgICAgdmFyIGluc3RhbmNlID0gdGhpcy5leHRlbmQoKTtcblx0ICAgICAgICAgICAgICAgIGluc3RhbmNlLmluaXQuYXBwbHkoaW5zdGFuY2UsIGFyZ3VtZW50cyk7XG5cblx0ICAgICAgICAgICAgICAgIHJldHVybiBpbnN0YW5jZTtcblx0ICAgICAgICAgICAgfSxcblxuXHQgICAgICAgICAgICAvKipcblx0ICAgICAgICAgICAgICogSW5pdGlhbGl6ZXMgYSBuZXdseSBjcmVhdGVkIG9iamVjdC5cblx0ICAgICAgICAgICAgICogT3ZlcnJpZGUgdGhpcyBtZXRob2QgdG8gYWRkIHNvbWUgbG9naWMgd2hlbiB5b3VyIG9iamVjdHMgYXJlIGNyZWF0ZWQuXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqICAgICB2YXIgTXlUeXBlID0gQ3J5cHRvSlMubGliLkJhc2UuZXh0ZW5kKHtcblx0ICAgICAgICAgICAgICogICAgICAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgICAqICAgICAgICAgICAgIC8vIC4uLlxuXHQgICAgICAgICAgICAgKiAgICAgICAgIH1cblx0ICAgICAgICAgICAgICogICAgIH0pO1xuXHQgICAgICAgICAgICAgKi9cblx0ICAgICAgICAgICAgaW5pdDogZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICB9LFxuXG5cdCAgICAgICAgICAgIC8qKlxuXHQgICAgICAgICAgICAgKiBDb3BpZXMgcHJvcGVydGllcyBpbnRvIHRoaXMgb2JqZWN0LlxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gcHJvcGVydGllcyBUaGUgcHJvcGVydGllcyB0byBtaXggaW4uXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICAgICAqXG5cdCAgICAgICAgICAgICAqICAgICBNeVR5cGUubWl4SW4oe1xuXHQgICAgICAgICAgICAgKiAgICAgICAgIGZpZWxkOiAndmFsdWUnXG5cdCAgICAgICAgICAgICAqICAgICB9KTtcblx0ICAgICAgICAgICAgICovXG5cdCAgICAgICAgICAgIG1peEluOiBmdW5jdGlvbiAocHJvcGVydGllcykge1xuXHQgICAgICAgICAgICAgICAgZm9yICh2YXIgcHJvcGVydHlOYW1lIGluIHByb3BlcnRpZXMpIHtcblx0ICAgICAgICAgICAgICAgICAgICBpZiAocHJvcGVydGllcy5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eU5hbWUpKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNbcHJvcGVydHlOYW1lXSA9IHByb3BlcnRpZXNbcHJvcGVydHlOYW1lXTtcblx0ICAgICAgICAgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgICAgIC8vIElFIHdvbid0IGNvcHkgdG9TdHJpbmcgdXNpbmcgdGhlIGxvb3AgYWJvdmVcblx0ICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0aWVzLmhhc093blByb3BlcnR5KCd0b1N0cmluZycpKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgdGhpcy50b1N0cmluZyA9IHByb3BlcnRpZXMudG9TdHJpbmc7XG5cdCAgICAgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgIH0sXG5cblx0ICAgICAgICAgICAgLyoqXG5cdCAgICAgICAgICAgICAqIENyZWF0ZXMgYSBjb3B5IG9mIHRoaXMgb2JqZWN0LlxuXHQgICAgICAgICAgICAgKlxuXHQgICAgICAgICAgICAgKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBjbG9uZS5cblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgICAgICpcblx0ICAgICAgICAgICAgICogICAgIHZhciBjbG9uZSA9IGluc3RhbmNlLmNsb25lKCk7XG5cdCAgICAgICAgICAgICAqL1xuXHQgICAgICAgICAgICBjbG9uZTogZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaW5pdC5wcm90b3R5cGUuZXh0ZW5kKHRoaXMpO1xuXHQgICAgICAgICAgICB9XG5cdCAgICAgICAgfTtcblx0ICAgIH0oKSk7XG5cblx0ICAgIC8qKlxuXHQgICAgICogQW4gYXJyYXkgb2YgMzItYml0IHdvcmRzLlxuXHQgICAgICpcblx0ICAgICAqIEBwcm9wZXJ0eSB7QXJyYXl9IHdvcmRzIFRoZSBhcnJheSBvZiAzMi1iaXQgd29yZHMuXG5cdCAgICAgKiBAcHJvcGVydHkge251bWJlcn0gc2lnQnl0ZXMgVGhlIG51bWJlciBvZiBzaWduaWZpY2FudCBieXRlcyBpbiB0aGlzIHdvcmQgYXJyYXkuXG5cdCAgICAgKi9cblx0ICAgIHZhciBXb3JkQXJyYXkgPSBDX2xpYi5Xb3JkQXJyYXkgPSBCYXNlLmV4dGVuZCh7XG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogSW5pdGlhbGl6ZXMgYSBuZXdseSBjcmVhdGVkIHdvcmQgYXJyYXkuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge0FycmF5fSB3b3JkcyAoT3B0aW9uYWwpIEFuIGFycmF5IG9mIDMyLWJpdCB3b3Jkcy5cblx0ICAgICAgICAgKiBAcGFyYW0ge251bWJlcn0gc2lnQnl0ZXMgKE9wdGlvbmFsKSBUaGUgbnVtYmVyIG9mIHNpZ25pZmljYW50IGJ5dGVzIGluIHRoZSB3b3Jkcy5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIHdvcmRBcnJheSA9IENyeXB0b0pTLmxpYi5Xb3JkQXJyYXkuY3JlYXRlKCk7XG5cdCAgICAgICAgICogICAgIHZhciB3b3JkQXJyYXkgPSBDcnlwdG9KUy5saWIuV29yZEFycmF5LmNyZWF0ZShbMHgwMDAxMDIwMywgMHgwNDA1MDYwN10pO1xuXHQgICAgICAgICAqICAgICB2YXIgd29yZEFycmF5ID0gQ3J5cHRvSlMubGliLldvcmRBcnJheS5jcmVhdGUoWzB4MDAwMTAyMDMsIDB4MDQwNTA2MDddLCA2KTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBpbml0OiBmdW5jdGlvbiAod29yZHMsIHNpZ0J5dGVzKSB7XG5cdCAgICAgICAgICAgIHdvcmRzID0gdGhpcy53b3JkcyA9IHdvcmRzIHx8IFtdO1xuXG5cdCAgICAgICAgICAgIGlmIChzaWdCeXRlcyAhPSB1bmRlZmluZWQpIHtcblx0ICAgICAgICAgICAgICAgIHRoaXMuc2lnQnl0ZXMgPSBzaWdCeXRlcztcblx0ICAgICAgICAgICAgfSBlbHNlIHtcblx0ICAgICAgICAgICAgICAgIHRoaXMuc2lnQnl0ZXMgPSB3b3Jkcy5sZW5ndGggKiA0O1xuXHQgICAgICAgICAgICB9XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIENvbnZlcnRzIHRoaXMgd29yZCBhcnJheSB0byBhIHN0cmluZy5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7RW5jb2Rlcn0gZW5jb2RlciAoT3B0aW9uYWwpIFRoZSBlbmNvZGluZyBzdHJhdGVneSB0byB1c2UuIERlZmF1bHQ6IENyeXB0b0pTLmVuYy5IZXhcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge3N0cmluZ30gVGhlIHN0cmluZ2lmaWVkIHdvcmQgYXJyYXkuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciBzdHJpbmcgPSB3b3JkQXJyYXkgKyAnJztcblx0ICAgICAgICAgKiAgICAgdmFyIHN0cmluZyA9IHdvcmRBcnJheS50b1N0cmluZygpO1xuXHQgICAgICAgICAqICAgICB2YXIgc3RyaW5nID0gd29yZEFycmF5LnRvU3RyaW5nKENyeXB0b0pTLmVuYy5VdGY4KTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICB0b1N0cmluZzogZnVuY3Rpb24gKGVuY29kZXIpIHtcblx0ICAgICAgICAgICAgcmV0dXJuIChlbmNvZGVyIHx8IEhleCkuc3RyaW5naWZ5KHRoaXMpO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBDb25jYXRlbmF0ZXMgYSB3b3JkIGFycmF5IHRvIHRoaXMgd29yZCBhcnJheS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7V29yZEFycmF5fSB3b3JkQXJyYXkgVGhlIHdvcmQgYXJyYXkgdG8gYXBwZW5kLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7V29yZEFycmF5fSBUaGlzIHdvcmQgYXJyYXkuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHdvcmRBcnJheTEuY29uY2F0KHdvcmRBcnJheTIpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIGNvbmNhdDogZnVuY3Rpb24gKHdvcmRBcnJheSkge1xuXHQgICAgICAgICAgICAvLyBTaG9ydGN1dHNcblx0ICAgICAgICAgICAgdmFyIHRoaXNXb3JkcyA9IHRoaXMud29yZHM7XG5cdCAgICAgICAgICAgIHZhciB0aGF0V29yZHMgPSB3b3JkQXJyYXkud29yZHM7XG5cdCAgICAgICAgICAgIHZhciB0aGlzU2lnQnl0ZXMgPSB0aGlzLnNpZ0J5dGVzO1xuXHQgICAgICAgICAgICB2YXIgdGhhdFNpZ0J5dGVzID0gd29yZEFycmF5LnNpZ0J5dGVzO1xuXG5cdCAgICAgICAgICAgIC8vIENsYW1wIGV4Y2VzcyBiaXRzXG5cdCAgICAgICAgICAgIHRoaXMuY2xhbXAoKTtcblxuXHQgICAgICAgICAgICAvLyBDb25jYXRcblx0ICAgICAgICAgICAgaWYgKHRoaXNTaWdCeXRlcyAlIDQpIHtcblx0ICAgICAgICAgICAgICAgIC8vIENvcHkgb25lIGJ5dGUgYXQgYSB0aW1lXG5cdCAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoYXRTaWdCeXRlczsgaSsrKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgdmFyIHRoYXRCeXRlID0gKHRoYXRXb3Jkc1tpID4+PiAyXSA+Pj4gKDI0IC0gKGkgJSA0KSAqIDgpKSAmIDB4ZmY7XG5cdCAgICAgICAgICAgICAgICAgICAgdGhpc1dvcmRzWyh0aGlzU2lnQnl0ZXMgKyBpKSA+Pj4gMl0gfD0gdGhhdEJ5dGUgPDwgKDI0IC0gKCh0aGlzU2lnQnl0ZXMgKyBpKSAlIDQpICogOCk7XG5cdCAgICAgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgIH0gZWxzZSB7XG5cdCAgICAgICAgICAgICAgICAvLyBDb3B5IG9uZSB3b3JkIGF0IGEgdGltZVxuXHQgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGF0U2lnQnl0ZXM7IGkgKz0gNCkge1xuXHQgICAgICAgICAgICAgICAgICAgIHRoaXNXb3Jkc1sodGhpc1NpZ0J5dGVzICsgaSkgPj4+IDJdID0gdGhhdFdvcmRzW2kgPj4+IDJdO1xuXHQgICAgICAgICAgICAgICAgfVxuXHQgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgIHRoaXMuc2lnQnl0ZXMgKz0gdGhhdFNpZ0J5dGVzO1xuXG5cdCAgICAgICAgICAgIC8vIENoYWluYWJsZVxuXHQgICAgICAgICAgICByZXR1cm4gdGhpcztcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogUmVtb3ZlcyBpbnNpZ25pZmljYW50IGJpdHMuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHdvcmRBcnJheS5jbGFtcCgpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIGNsYW1wOiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgIC8vIFNob3J0Y3V0c1xuXHQgICAgICAgICAgICB2YXIgd29yZHMgPSB0aGlzLndvcmRzO1xuXHQgICAgICAgICAgICB2YXIgc2lnQnl0ZXMgPSB0aGlzLnNpZ0J5dGVzO1xuXG5cdCAgICAgICAgICAgIC8vIENsYW1wXG5cdCAgICAgICAgICAgIHdvcmRzW3NpZ0J5dGVzID4+PiAyXSAmPSAweGZmZmZmZmZmIDw8ICgzMiAtIChzaWdCeXRlcyAlIDQpICogOCk7XG5cdCAgICAgICAgICAgIHdvcmRzLmxlbmd0aCA9IE1hdGguY2VpbChzaWdCeXRlcyAvIDQpO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBDcmVhdGVzIGEgY29weSBvZiB0aGlzIHdvcmQgYXJyYXkuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtXb3JkQXJyYXl9IFRoZSBjbG9uZS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIGNsb25lID0gd29yZEFycmF5LmNsb25lKCk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgY2xvbmU6IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgdmFyIGNsb25lID0gQmFzZS5jbG9uZS5jYWxsKHRoaXMpO1xuXHQgICAgICAgICAgICBjbG9uZS53b3JkcyA9IHRoaXMud29yZHMuc2xpY2UoMCk7XG5cblx0ICAgICAgICAgICAgcmV0dXJuIGNsb25lO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBDcmVhdGVzIGEgd29yZCBhcnJheSBmaWxsZWQgd2l0aCByYW5kb20gYnl0ZXMuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge251bWJlcn0gbkJ5dGVzIFRoZSBudW1iZXIgb2YgcmFuZG9tIGJ5dGVzIHRvIGdlbmVyYXRlLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7V29yZEFycmF5fSBUaGUgcmFuZG9tIHdvcmQgYXJyYXkuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAc3RhdGljXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciB3b3JkQXJyYXkgPSBDcnlwdG9KUy5saWIuV29yZEFycmF5LnJhbmRvbSgxNik7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgcmFuZG9tOiBmdW5jdGlvbiAobkJ5dGVzKSB7XG5cdCAgICAgICAgICAgIHZhciB3b3JkcyA9IFtdO1xuXG5cdCAgICAgICAgICAgIHZhciByID0gKGZ1bmN0aW9uIChtX3cpIHtcblx0ICAgICAgICAgICAgICAgIHZhciBtX3cgPSBtX3c7XG5cdCAgICAgICAgICAgICAgICB2YXIgbV96ID0gMHgzYWRlNjhiMTtcblx0ICAgICAgICAgICAgICAgIHZhciBtYXNrID0gMHhmZmZmZmZmZjtcblxuXHQgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgICAgICAgICBtX3ogPSAoMHg5MDY5ICogKG1feiAmIDB4RkZGRikgKyAobV96ID4+IDB4MTApKSAmIG1hc2s7XG5cdCAgICAgICAgICAgICAgICAgICAgbV93ID0gKDB4NDY1MCAqIChtX3cgJiAweEZGRkYpICsgKG1fdyA+PiAweDEwKSkgJiBtYXNrO1xuXHQgICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSAoKG1feiA8PCAweDEwKSArIG1fdykgJiBtYXNrO1xuXHQgICAgICAgICAgICAgICAgICAgIHJlc3VsdCAvPSAweDEwMDAwMDAwMDtcblx0ICAgICAgICAgICAgICAgICAgICByZXN1bHQgKz0gMC41O1xuXHQgICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQgKiAoTWF0aC5yYW5kb20oKSA+IC41ID8gMSA6IC0xKTtcblx0ICAgICAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgfSk7XG5cblx0ICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIHJjYWNoZTsgaSA8IG5CeXRlczsgaSArPSA0KSB7XG5cdCAgICAgICAgICAgICAgICB2YXIgX3IgPSByKChyY2FjaGUgfHwgTWF0aC5yYW5kb20oKSkgKiAweDEwMDAwMDAwMCk7XG5cblx0ICAgICAgICAgICAgICAgIHJjYWNoZSA9IF9yKCkgKiAweDNhZGU2N2I3O1xuXHQgICAgICAgICAgICAgICAgd29yZHMucHVzaCgoX3IoKSAqIDB4MTAwMDAwMDAwKSB8IDApO1xuXHQgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgcmV0dXJuIG5ldyBXb3JkQXJyYXkuaW5pdCh3b3JkcywgbkJ5dGVzKTtcblx0ICAgICAgICB9XG5cdCAgICB9KTtcblxuXHQgICAgLyoqXG5cdCAgICAgKiBFbmNvZGVyIG5hbWVzcGFjZS5cblx0ICAgICAqL1xuXHQgICAgdmFyIENfZW5jID0gQy5lbmMgPSB7fTtcblxuXHQgICAgLyoqXG5cdCAgICAgKiBIZXggZW5jb2Rpbmcgc3RyYXRlZ3kuXG5cdCAgICAgKi9cblx0ICAgIHZhciBIZXggPSBDX2VuYy5IZXggPSB7XG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogQ29udmVydHMgYSB3b3JkIGFycmF5IHRvIGEgaGV4IHN0cmluZy5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7V29yZEFycmF5fSB3b3JkQXJyYXkgVGhlIHdvcmQgYXJyYXkuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBoZXggc3RyaW5nLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHN0YXRpY1xuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgaGV4U3RyaW5nID0gQ3J5cHRvSlMuZW5jLkhleC5zdHJpbmdpZnkod29yZEFycmF5KTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBzdHJpbmdpZnk6IGZ1bmN0aW9uICh3b3JkQXJyYXkpIHtcblx0ICAgICAgICAgICAgLy8gU2hvcnRjdXRzXG5cdCAgICAgICAgICAgIHZhciB3b3JkcyA9IHdvcmRBcnJheS53b3Jkcztcblx0ICAgICAgICAgICAgdmFyIHNpZ0J5dGVzID0gd29yZEFycmF5LnNpZ0J5dGVzO1xuXG5cdCAgICAgICAgICAgIC8vIENvbnZlcnRcblx0ICAgICAgICAgICAgdmFyIGhleENoYXJzID0gW107XG5cdCAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2lnQnl0ZXM7IGkrKykge1xuXHQgICAgICAgICAgICAgICAgdmFyIGJpdGUgPSAod29yZHNbaSA+Pj4gMl0gPj4+ICgyNCAtIChpICUgNCkgKiA4KSkgJiAweGZmO1xuXHQgICAgICAgICAgICAgICAgaGV4Q2hhcnMucHVzaCgoYml0ZSA+Pj4gNCkudG9TdHJpbmcoMTYpKTtcblx0ICAgICAgICAgICAgICAgIGhleENoYXJzLnB1c2goKGJpdGUgJiAweDBmKS50b1N0cmluZygxNikpO1xuXHQgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgcmV0dXJuIGhleENoYXJzLmpvaW4oJycpO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBDb252ZXJ0cyBhIGhleCBzdHJpbmcgdG8gYSB3b3JkIGFycmF5LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGhleFN0ciBUaGUgaGV4IHN0cmluZy5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEByZXR1cm4ge1dvcmRBcnJheX0gVGhlIHdvcmQgYXJyYXkuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAc3RhdGljXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIHZhciB3b3JkQXJyYXkgPSBDcnlwdG9KUy5lbmMuSGV4LnBhcnNlKGhleFN0cmluZyk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgcGFyc2U6IGZ1bmN0aW9uIChoZXhTdHIpIHtcblx0ICAgICAgICAgICAgLy8gU2hvcnRjdXRcblx0ICAgICAgICAgICAgdmFyIGhleFN0ckxlbmd0aCA9IGhleFN0ci5sZW5ndGg7XG5cblx0ICAgICAgICAgICAgLy8gQ29udmVydFxuXHQgICAgICAgICAgICB2YXIgd29yZHMgPSBbXTtcblx0ICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBoZXhTdHJMZW5ndGg7IGkgKz0gMikge1xuXHQgICAgICAgICAgICAgICAgd29yZHNbaSA+Pj4gM10gfD0gcGFyc2VJbnQoaGV4U3RyLnN1YnN0cihpLCAyKSwgMTYpIDw8ICgyNCAtIChpICUgOCkgKiA0KTtcblx0ICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgIHJldHVybiBuZXcgV29yZEFycmF5LmluaXQod29yZHMsIGhleFN0ckxlbmd0aCAvIDIpO1xuXHQgICAgICAgIH1cblx0ICAgIH07XG5cblx0ICAgIC8qKlxuXHQgICAgICogTGF0aW4xIGVuY29kaW5nIHN0cmF0ZWd5LlxuXHQgICAgICovXG5cdCAgICB2YXIgTGF0aW4xID0gQ19lbmMuTGF0aW4xID0ge1xuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIENvbnZlcnRzIGEgd29yZCBhcnJheSB0byBhIExhdGluMSBzdHJpbmcuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge1dvcmRBcnJheX0gd29yZEFycmF5IFRoZSB3b3JkIGFycmF5LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7c3RyaW5nfSBUaGUgTGF0aW4xIHN0cmluZy5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBzdGF0aWNcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIGxhdGluMVN0cmluZyA9IENyeXB0b0pTLmVuYy5MYXRpbjEuc3RyaW5naWZ5KHdvcmRBcnJheSk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgc3RyaW5naWZ5OiBmdW5jdGlvbiAod29yZEFycmF5KSB7XG5cdCAgICAgICAgICAgIC8vIFNob3J0Y3V0c1xuXHQgICAgICAgICAgICB2YXIgd29yZHMgPSB3b3JkQXJyYXkud29yZHM7XG5cdCAgICAgICAgICAgIHZhciBzaWdCeXRlcyA9IHdvcmRBcnJheS5zaWdCeXRlcztcblxuXHQgICAgICAgICAgICAvLyBDb252ZXJ0XG5cdCAgICAgICAgICAgIHZhciBsYXRpbjFDaGFycyA9IFtdO1xuXHQgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNpZ0J5dGVzOyBpKyspIHtcblx0ICAgICAgICAgICAgICAgIHZhciBiaXRlID0gKHdvcmRzW2kgPj4+IDJdID4+PiAoMjQgLSAoaSAlIDQpICogOCkpICYgMHhmZjtcblx0ICAgICAgICAgICAgICAgIGxhdGluMUNoYXJzLnB1c2goU3RyaW5nLmZyb21DaGFyQ29kZShiaXRlKSk7XG5cdCAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICByZXR1cm4gbGF0aW4xQ2hhcnMuam9pbignJyk7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIENvbnZlcnRzIGEgTGF0aW4xIHN0cmluZyB0byBhIHdvcmQgYXJyYXkuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gbGF0aW4xU3RyIFRoZSBMYXRpbjEgc3RyaW5nLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7V29yZEFycmF5fSBUaGUgd29yZCBhcnJheS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBzdGF0aWNcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIHdvcmRBcnJheSA9IENyeXB0b0pTLmVuYy5MYXRpbjEucGFyc2UobGF0aW4xU3RyaW5nKTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBwYXJzZTogZnVuY3Rpb24gKGxhdGluMVN0cikge1xuXHQgICAgICAgICAgICAvLyBTaG9ydGN1dFxuXHQgICAgICAgICAgICB2YXIgbGF0aW4xU3RyTGVuZ3RoID0gbGF0aW4xU3RyLmxlbmd0aDtcblxuXHQgICAgICAgICAgICAvLyBDb252ZXJ0XG5cdCAgICAgICAgICAgIHZhciB3b3JkcyA9IFtdO1xuXHQgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxhdGluMVN0ckxlbmd0aDsgaSsrKSB7XG5cdCAgICAgICAgICAgICAgICB3b3Jkc1tpID4+PiAyXSB8PSAobGF0aW4xU3RyLmNoYXJDb2RlQXQoaSkgJiAweGZmKSA8PCAoMjQgLSAoaSAlIDQpICogOCk7XG5cdCAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICByZXR1cm4gbmV3IFdvcmRBcnJheS5pbml0KHdvcmRzLCBsYXRpbjFTdHJMZW5ndGgpO1xuXHQgICAgICAgIH1cblx0ICAgIH07XG5cblx0ICAgIC8qKlxuXHQgICAgICogVVRGLTggZW5jb2Rpbmcgc3RyYXRlZ3kuXG5cdCAgICAgKi9cblx0ICAgIHZhciBVdGY4ID0gQ19lbmMuVXRmOCA9IHtcblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBDb252ZXJ0cyBhIHdvcmQgYXJyYXkgdG8gYSBVVEYtOCBzdHJpbmcuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge1dvcmRBcnJheX0gd29yZEFycmF5IFRoZSB3b3JkIGFycmF5LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7c3RyaW5nfSBUaGUgVVRGLTggc3RyaW5nLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHN0YXRpY1xuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgdXRmOFN0cmluZyA9IENyeXB0b0pTLmVuYy5VdGY4LnN0cmluZ2lmeSh3b3JkQXJyYXkpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIHN0cmluZ2lmeTogZnVuY3Rpb24gKHdvcmRBcnJheSkge1xuXHQgICAgICAgICAgICB0cnkge1xuXHQgICAgICAgICAgICAgICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChlc2NhcGUoTGF0aW4xLnN0cmluZ2lmeSh3b3JkQXJyYXkpKSk7XG5cdCAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcblx0ICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTWFsZm9ybWVkIFVURi04IGRhdGEnKTtcblx0ICAgICAgICAgICAgfVxuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBDb252ZXJ0cyBhIFVURi04IHN0cmluZyB0byBhIHdvcmQgYXJyYXkuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gdXRmOFN0ciBUaGUgVVRGLTggc3RyaW5nLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7V29yZEFycmF5fSBUaGUgd29yZCBhcnJheS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBzdGF0aWNcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIHdvcmRBcnJheSA9IENyeXB0b0pTLmVuYy5VdGY4LnBhcnNlKHV0ZjhTdHJpbmcpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIHBhcnNlOiBmdW5jdGlvbiAodXRmOFN0cikge1xuXHQgICAgICAgICAgICByZXR1cm4gTGF0aW4xLnBhcnNlKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudCh1dGY4U3RyKSkpO1xuXHQgICAgICAgIH1cblx0ICAgIH07XG5cblx0ICAgIC8qKlxuXHQgICAgICogQWJzdHJhY3QgYnVmZmVyZWQgYmxvY2sgYWxnb3JpdGhtIHRlbXBsYXRlLlxuXHQgICAgICpcblx0ICAgICAqIFRoZSBwcm9wZXJ0eSBibG9ja1NpemUgbXVzdCBiZSBpbXBsZW1lbnRlZCBpbiBhIGNvbmNyZXRlIHN1YnR5cGUuXG5cdCAgICAgKlxuXHQgICAgICogQHByb3BlcnR5IHtudW1iZXJ9IF9taW5CdWZmZXJTaXplIFRoZSBudW1iZXIgb2YgYmxvY2tzIHRoYXQgc2hvdWxkIGJlIGtlcHQgdW5wcm9jZXNzZWQgaW4gdGhlIGJ1ZmZlci4gRGVmYXVsdDogMFxuXHQgICAgICovXG5cdCAgICB2YXIgQnVmZmVyZWRCbG9ja0FsZ29yaXRobSA9IENfbGliLkJ1ZmZlcmVkQmxvY2tBbGdvcml0aG0gPSBCYXNlLmV4dGVuZCh7XG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogUmVzZXRzIHRoaXMgYmxvY2sgYWxnb3JpdGhtJ3MgZGF0YSBidWZmZXIgdG8gaXRzIGluaXRpYWwgc3RhdGUuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIGJ1ZmZlcmVkQmxvY2tBbGdvcml0aG0ucmVzZXQoKTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICByZXNldDogZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICAvLyBJbml0aWFsIHZhbHVlc1xuXHQgICAgICAgICAgICB0aGlzLl9kYXRhID0gbmV3IFdvcmRBcnJheS5pbml0KCk7XG5cdCAgICAgICAgICAgIHRoaXMuX25EYXRhQnl0ZXMgPSAwO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBBZGRzIG5ldyBkYXRhIHRvIHRoaXMgYmxvY2sgYWxnb3JpdGhtJ3MgYnVmZmVyLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtXb3JkQXJyYXl8c3RyaW5nfSBkYXRhIFRoZSBkYXRhIHRvIGFwcGVuZC4gU3RyaW5ncyBhcmUgY29udmVydGVkIHRvIGEgV29yZEFycmF5IHVzaW5nIFVURi04LlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICBidWZmZXJlZEJsb2NrQWxnb3JpdGhtLl9hcHBlbmQoJ2RhdGEnKTtcblx0ICAgICAgICAgKiAgICAgYnVmZmVyZWRCbG9ja0FsZ29yaXRobS5fYXBwZW5kKHdvcmRBcnJheSk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgX2FwcGVuZDogZnVuY3Rpb24gKGRhdGEpIHtcblx0ICAgICAgICAgICAgLy8gQ29udmVydCBzdHJpbmcgdG8gV29yZEFycmF5LCBlbHNlIGFzc3VtZSBXb3JkQXJyYXkgYWxyZWFkeVxuXHQgICAgICAgICAgICBpZiAodHlwZW9mIGRhdGEgPT0gJ3N0cmluZycpIHtcblx0ICAgICAgICAgICAgICAgIGRhdGEgPSBVdGY4LnBhcnNlKGRhdGEpO1xuXHQgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgLy8gQXBwZW5kXG5cdCAgICAgICAgICAgIHRoaXMuX2RhdGEuY29uY2F0KGRhdGEpO1xuXHQgICAgICAgICAgICB0aGlzLl9uRGF0YUJ5dGVzICs9IGRhdGEuc2lnQnl0ZXM7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIFByb2Nlc3NlcyBhdmFpbGFibGUgZGF0YSBibG9ja3MuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBUaGlzIG1ldGhvZCBpbnZva2VzIF9kb1Byb2Nlc3NCbG9jayhvZmZzZXQpLCB3aGljaCBtdXN0IGJlIGltcGxlbWVudGVkIGJ5IGEgY29uY3JldGUgc3VidHlwZS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gZG9GbHVzaCBXaGV0aGVyIGFsbCBibG9ja3MgYW5kIHBhcnRpYWwgYmxvY2tzIHNob3VsZCBiZSBwcm9jZXNzZWQuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtXb3JkQXJyYXl9IFRoZSBwcm9jZXNzZWQgZGF0YS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIHByb2Nlc3NlZERhdGEgPSBidWZmZXJlZEJsb2NrQWxnb3JpdGhtLl9wcm9jZXNzKCk7XG5cdCAgICAgICAgICogICAgIHZhciBwcm9jZXNzZWREYXRhID0gYnVmZmVyZWRCbG9ja0FsZ29yaXRobS5fcHJvY2VzcyghISdmbHVzaCcpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIF9wcm9jZXNzOiBmdW5jdGlvbiAoZG9GbHVzaCkge1xuXHQgICAgICAgICAgICAvLyBTaG9ydGN1dHNcblx0ICAgICAgICAgICAgdmFyIGRhdGEgPSB0aGlzLl9kYXRhO1xuXHQgICAgICAgICAgICB2YXIgZGF0YVdvcmRzID0gZGF0YS53b3Jkcztcblx0ICAgICAgICAgICAgdmFyIGRhdGFTaWdCeXRlcyA9IGRhdGEuc2lnQnl0ZXM7XG5cdCAgICAgICAgICAgIHZhciBibG9ja1NpemUgPSB0aGlzLmJsb2NrU2l6ZTtcblx0ICAgICAgICAgICAgdmFyIGJsb2NrU2l6ZUJ5dGVzID0gYmxvY2tTaXplICogNDtcblxuXHQgICAgICAgICAgICAvLyBDb3VudCBibG9ja3MgcmVhZHlcblx0ICAgICAgICAgICAgdmFyIG5CbG9ja3NSZWFkeSA9IGRhdGFTaWdCeXRlcyAvIGJsb2NrU2l6ZUJ5dGVzO1xuXHQgICAgICAgICAgICBpZiAoZG9GbHVzaCkge1xuXHQgICAgICAgICAgICAgICAgLy8gUm91bmQgdXAgdG8gaW5jbHVkZSBwYXJ0aWFsIGJsb2Nrc1xuXHQgICAgICAgICAgICAgICAgbkJsb2Nrc1JlYWR5ID0gTWF0aC5jZWlsKG5CbG9ja3NSZWFkeSk7XG5cdCAgICAgICAgICAgIH0gZWxzZSB7XG5cdCAgICAgICAgICAgICAgICAvLyBSb3VuZCBkb3duIHRvIGluY2x1ZGUgb25seSBmdWxsIGJsb2Nrcyxcblx0ICAgICAgICAgICAgICAgIC8vIGxlc3MgdGhlIG51bWJlciBvZiBibG9ja3MgdGhhdCBtdXN0IHJlbWFpbiBpbiB0aGUgYnVmZmVyXG5cdCAgICAgICAgICAgICAgICBuQmxvY2tzUmVhZHkgPSBNYXRoLm1heCgobkJsb2Nrc1JlYWR5IHwgMCkgLSB0aGlzLl9taW5CdWZmZXJTaXplLCAwKTtcblx0ICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgIC8vIENvdW50IHdvcmRzIHJlYWR5XG5cdCAgICAgICAgICAgIHZhciBuV29yZHNSZWFkeSA9IG5CbG9ja3NSZWFkeSAqIGJsb2NrU2l6ZTtcblxuXHQgICAgICAgICAgICAvLyBDb3VudCBieXRlcyByZWFkeVxuXHQgICAgICAgICAgICB2YXIgbkJ5dGVzUmVhZHkgPSBNYXRoLm1pbihuV29yZHNSZWFkeSAqIDQsIGRhdGFTaWdCeXRlcyk7XG5cblx0ICAgICAgICAgICAgLy8gUHJvY2VzcyBibG9ja3Ncblx0ICAgICAgICAgICAgaWYgKG5Xb3Jkc1JlYWR5KSB7XG5cdCAgICAgICAgICAgICAgICBmb3IgKHZhciBvZmZzZXQgPSAwOyBvZmZzZXQgPCBuV29yZHNSZWFkeTsgb2Zmc2V0ICs9IGJsb2NrU2l6ZSkge1xuXHQgICAgICAgICAgICAgICAgICAgIC8vIFBlcmZvcm0gY29uY3JldGUtYWxnb3JpdGhtIGxvZ2ljXG5cdCAgICAgICAgICAgICAgICAgICAgdGhpcy5fZG9Qcm9jZXNzQmxvY2soZGF0YVdvcmRzLCBvZmZzZXQpO1xuXHQgICAgICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgICAgICAvLyBSZW1vdmUgcHJvY2Vzc2VkIHdvcmRzXG5cdCAgICAgICAgICAgICAgICB2YXIgcHJvY2Vzc2VkV29yZHMgPSBkYXRhV29yZHMuc3BsaWNlKDAsIG5Xb3Jkc1JlYWR5KTtcblx0ICAgICAgICAgICAgICAgIGRhdGEuc2lnQnl0ZXMgLT0gbkJ5dGVzUmVhZHk7XG5cdCAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICAvLyBSZXR1cm4gcHJvY2Vzc2VkIHdvcmRzXG5cdCAgICAgICAgICAgIHJldHVybiBuZXcgV29yZEFycmF5LmluaXQocHJvY2Vzc2VkV29yZHMsIG5CeXRlc1JlYWR5KTtcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogQ3JlYXRlcyBhIGNvcHkgb2YgdGhpcyBvYmplY3QuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBjbG9uZS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIGNsb25lID0gYnVmZmVyZWRCbG9ja0FsZ29yaXRobS5jbG9uZSgpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIGNsb25lOiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgIHZhciBjbG9uZSA9IEJhc2UuY2xvbmUuY2FsbCh0aGlzKTtcblx0ICAgICAgICAgICAgY2xvbmUuX2RhdGEgPSB0aGlzLl9kYXRhLmNsb25lKCk7XG5cblx0ICAgICAgICAgICAgcmV0dXJuIGNsb25lO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICBfbWluQnVmZmVyU2l6ZTogMFxuXHQgICAgfSk7XG5cblx0ICAgIC8qKlxuXHQgICAgICogQWJzdHJhY3QgaGFzaGVyIHRlbXBsYXRlLlxuXHQgICAgICpcblx0ICAgICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBibG9ja1NpemUgVGhlIG51bWJlciBvZiAzMi1iaXQgd29yZHMgdGhpcyBoYXNoZXIgb3BlcmF0ZXMgb24uIERlZmF1bHQ6IDE2ICg1MTIgYml0cylcblx0ICAgICAqL1xuXHQgICAgdmFyIEhhc2hlciA9IENfbGliLkhhc2hlciA9IEJ1ZmZlcmVkQmxvY2tBbGdvcml0aG0uZXh0ZW5kKHtcblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBDb25maWd1cmF0aW9uIG9wdGlvbnMuXG5cdCAgICAgICAgICovXG5cdCAgICAgICAgY2ZnOiBCYXNlLmV4dGVuZCgpLFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogSW5pdGlhbGl6ZXMgYSBuZXdseSBjcmVhdGVkIGhhc2hlci5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBjZmcgKE9wdGlvbmFsKSBUaGUgY29uZmlndXJhdGlvbiBvcHRpb25zIHRvIHVzZSBmb3IgdGhpcyBoYXNoIGNvbXB1dGF0aW9uLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgaGFzaGVyID0gQ3J5cHRvSlMuYWxnby5TSEEyNTYuY3JlYXRlKCk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgaW5pdDogZnVuY3Rpb24gKGNmZykge1xuXHQgICAgICAgICAgICAvLyBBcHBseSBjb25maWcgZGVmYXVsdHNcblx0ICAgICAgICAgICAgdGhpcy5jZmcgPSB0aGlzLmNmZy5leHRlbmQoY2ZnKTtcblxuXHQgICAgICAgICAgICAvLyBTZXQgaW5pdGlhbCB2YWx1ZXNcblx0ICAgICAgICAgICAgdGhpcy5yZXNldCgpO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBSZXNldHMgdGhpcyBoYXNoZXIgdG8gaXRzIGluaXRpYWwgc3RhdGUuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAZXhhbXBsZVxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogICAgIGhhc2hlci5yZXNldCgpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIHJlc2V0OiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgIC8vIFJlc2V0IGRhdGEgYnVmZmVyXG5cdCAgICAgICAgICAgIEJ1ZmZlcmVkQmxvY2tBbGdvcml0aG0ucmVzZXQuY2FsbCh0aGlzKTtcblxuXHQgICAgICAgICAgICAvLyBQZXJmb3JtIGNvbmNyZXRlLWhhc2hlciBsb2dpY1xuXHQgICAgICAgICAgICB0aGlzLl9kb1Jlc2V0KCk7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIC8qKlxuXHQgICAgICAgICAqIFVwZGF0ZXMgdGhpcyBoYXNoZXIgd2l0aCBhIG1lc3NhZ2UuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcGFyYW0ge1dvcmRBcnJheXxzdHJpbmd9IG1lc3NhZ2VVcGRhdGUgVGhlIG1lc3NhZ2UgdG8gYXBwZW5kLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7SGFzaGVyfSBUaGlzIGhhc2hlci5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgaGFzaGVyLnVwZGF0ZSgnbWVzc2FnZScpO1xuXHQgICAgICAgICAqICAgICBoYXNoZXIudXBkYXRlKHdvcmRBcnJheSk7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgdXBkYXRlOiBmdW5jdGlvbiAobWVzc2FnZVVwZGF0ZSkge1xuXHQgICAgICAgICAgICAvLyBBcHBlbmRcblx0ICAgICAgICAgICAgdGhpcy5fYXBwZW5kKG1lc3NhZ2VVcGRhdGUpO1xuXG5cdCAgICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgaGFzaFxuXHQgICAgICAgICAgICB0aGlzLl9wcm9jZXNzKCk7XG5cblx0ICAgICAgICAgICAgLy8gQ2hhaW5hYmxlXG5cdCAgICAgICAgICAgIHJldHVybiB0aGlzO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBGaW5hbGl6ZXMgdGhlIGhhc2ggY29tcHV0YXRpb24uXG5cdCAgICAgICAgICogTm90ZSB0aGF0IHRoZSBmaW5hbGl6ZSBvcGVyYXRpb24gaXMgZWZmZWN0aXZlbHkgYSBkZXN0cnVjdGl2ZSwgcmVhZC1vbmNlIG9wZXJhdGlvbi5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7V29yZEFycmF5fHN0cmluZ30gbWVzc2FnZVVwZGF0ZSAoT3B0aW9uYWwpIEEgZmluYWwgbWVzc2FnZSB1cGRhdGUuXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiBAcmV0dXJuIHtXb3JkQXJyYXl9IFRoZSBoYXNoLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQGV4YW1wbGVcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqICAgICB2YXIgaGFzaCA9IGhhc2hlci5maW5hbGl6ZSgpO1xuXHQgICAgICAgICAqICAgICB2YXIgaGFzaCA9IGhhc2hlci5maW5hbGl6ZSgnbWVzc2FnZScpO1xuXHQgICAgICAgICAqICAgICB2YXIgaGFzaCA9IGhhc2hlci5maW5hbGl6ZSh3b3JkQXJyYXkpO1xuXHQgICAgICAgICAqL1xuXHQgICAgICAgIGZpbmFsaXplOiBmdW5jdGlvbiAobWVzc2FnZVVwZGF0ZSkge1xuXHQgICAgICAgICAgICAvLyBGaW5hbCBtZXNzYWdlIHVwZGF0ZVxuXHQgICAgICAgICAgICBpZiAobWVzc2FnZVVwZGF0ZSkge1xuXHQgICAgICAgICAgICAgICAgdGhpcy5fYXBwZW5kKG1lc3NhZ2VVcGRhdGUpO1xuXHQgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgLy8gUGVyZm9ybSBjb25jcmV0ZS1oYXNoZXIgbG9naWNcblx0ICAgICAgICAgICAgdmFyIGhhc2ggPSB0aGlzLl9kb0ZpbmFsaXplKCk7XG5cblx0ICAgICAgICAgICAgcmV0dXJuIGhhc2g7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIGJsb2NrU2l6ZTogNTEyLzMyLFxuXG5cdCAgICAgICAgLyoqXG5cdCAgICAgICAgICogQ3JlYXRlcyBhIHNob3J0Y3V0IGZ1bmN0aW9uIHRvIGEgaGFzaGVyJ3Mgb2JqZWN0IGludGVyZmFjZS5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBwYXJhbSB7SGFzaGVyfSBoYXNoZXIgVGhlIGhhc2hlciB0byBjcmVhdGUgYSBoZWxwZXIgZm9yLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7RnVuY3Rpb259IFRoZSBzaG9ydGN1dCBmdW5jdGlvbi5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBzdGF0aWNcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIFNIQTI1NiA9IENyeXB0b0pTLmxpYi5IYXNoZXIuX2NyZWF0ZUhlbHBlcihDcnlwdG9KUy5hbGdvLlNIQTI1Nik7XG5cdCAgICAgICAgICovXG5cdCAgICAgICAgX2NyZWF0ZUhlbHBlcjogZnVuY3Rpb24gKGhhc2hlcikge1xuXHQgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKG1lc3NhZ2UsIGNmZykge1xuXHQgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBoYXNoZXIuaW5pdChjZmcpLmZpbmFsaXplKG1lc3NhZ2UpO1xuXHQgICAgICAgICAgICB9O1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICAvKipcblx0ICAgICAgICAgKiBDcmVhdGVzIGEgc2hvcnRjdXQgZnVuY3Rpb24gdG8gdGhlIEhNQUMncyBvYmplY3QgaW50ZXJmYWNlLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHBhcmFtIHtIYXNoZXJ9IGhhc2hlciBUaGUgaGFzaGVyIHRvIHVzZSBpbiB0aGlzIEhNQUMgaGVscGVyLlxuXHQgICAgICAgICAqXG5cdCAgICAgICAgICogQHJldHVybiB7RnVuY3Rpb259IFRoZSBzaG9ydGN1dCBmdW5jdGlvbi5cblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBzdGF0aWNcblx0ICAgICAgICAgKlxuXHQgICAgICAgICAqIEBleGFtcGxlXG5cdCAgICAgICAgICpcblx0ICAgICAgICAgKiAgICAgdmFyIEhtYWNTSEEyNTYgPSBDcnlwdG9KUy5saWIuSGFzaGVyLl9jcmVhdGVIbWFjSGVscGVyKENyeXB0b0pTLmFsZ28uU0hBMjU2KTtcblx0ICAgICAgICAgKi9cblx0ICAgICAgICBfY3JlYXRlSG1hY0hlbHBlcjogZnVuY3Rpb24gKGhhc2hlcikge1xuXHQgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKG1lc3NhZ2UsIGtleSkge1xuXHQgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBDX2FsZ28uSE1BQy5pbml0KGhhc2hlciwga2V5KS5maW5hbGl6ZShtZXNzYWdlKTtcblx0ICAgICAgICAgICAgfTtcblx0ICAgICAgICB9XG5cdCAgICB9KTtcblxuXHQgICAgLyoqXG5cdCAgICAgKiBBbGdvcml0aG0gbmFtZXNwYWNlLlxuXHQgICAgICovXG5cdCAgICB2YXIgQ19hbGdvID0gQy5hbGdvID0ge307XG5cblx0ICAgIHJldHVybiBDO1xuXHR9KE1hdGgpKTtcblxuXG5cdHJldHVybiBDcnlwdG9KUztcblxufSkpOyIsIjsoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYgKHR5cGVvZiBleHBvcnRzID09PSBcIm9iamVjdFwiKSB7XG5cdFx0Ly8gQ29tbW9uSlNcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUoXCIuL2NvcmVcIikpO1xuXHR9XG5cdGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG5cdFx0Ly8gQU1EXG5cdFx0ZGVmaW5lKFtcIi4vY29yZVwiXSwgZmFjdG9yeSk7XG5cdH1cblx0ZWxzZSB7XG5cdFx0Ly8gR2xvYmFsIChicm93c2VyKVxuXHRcdGZhY3Rvcnkocm9vdC5DcnlwdG9KUyk7XG5cdH1cbn0odGhpcywgZnVuY3Rpb24gKENyeXB0b0pTKSB7XG5cblx0KGZ1bmN0aW9uICgpIHtcblx0ICAgIC8vIFNob3J0Y3V0c1xuXHQgICAgdmFyIEMgPSBDcnlwdG9KUztcblx0ICAgIHZhciBDX2xpYiA9IEMubGliO1xuXHQgICAgdmFyIFdvcmRBcnJheSA9IENfbGliLldvcmRBcnJheTtcblx0ICAgIHZhciBIYXNoZXIgPSBDX2xpYi5IYXNoZXI7XG5cdCAgICB2YXIgQ19hbGdvID0gQy5hbGdvO1xuXG5cdCAgICAvLyBSZXVzYWJsZSBvYmplY3Rcblx0ICAgIHZhciBXID0gW107XG5cblx0ICAgIC8qKlxuXHQgICAgICogU0hBLTEgaGFzaCBhbGdvcml0aG0uXG5cdCAgICAgKi9cblx0ICAgIHZhciBTSEExID0gQ19hbGdvLlNIQTEgPSBIYXNoZXIuZXh0ZW5kKHtcblx0ICAgICAgICBfZG9SZXNldDogZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICB0aGlzLl9oYXNoID0gbmV3IFdvcmRBcnJheS5pbml0KFtcblx0ICAgICAgICAgICAgICAgIDB4Njc0NTIzMDEsIDB4ZWZjZGFiODksXG5cdCAgICAgICAgICAgICAgICAweDk4YmFkY2ZlLCAweDEwMzI1NDc2LFxuXHQgICAgICAgICAgICAgICAgMHhjM2QyZTFmMFxuXHQgICAgICAgICAgICBdKTtcblx0ICAgICAgICB9LFxuXG5cdCAgICAgICAgX2RvUHJvY2Vzc0Jsb2NrOiBmdW5jdGlvbiAoTSwgb2Zmc2V0KSB7XG5cdCAgICAgICAgICAgIC8vIFNob3J0Y3V0XG5cdCAgICAgICAgICAgIHZhciBIID0gdGhpcy5faGFzaC53b3JkcztcblxuXHQgICAgICAgICAgICAvLyBXb3JraW5nIHZhcmlhYmxlc1xuXHQgICAgICAgICAgICB2YXIgYSA9IEhbMF07XG5cdCAgICAgICAgICAgIHZhciBiID0gSFsxXTtcblx0ICAgICAgICAgICAgdmFyIGMgPSBIWzJdO1xuXHQgICAgICAgICAgICB2YXIgZCA9IEhbM107XG5cdCAgICAgICAgICAgIHZhciBlID0gSFs0XTtcblxuXHQgICAgICAgICAgICAvLyBDb21wdXRhdGlvblxuXHQgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDgwOyBpKyspIHtcblx0ICAgICAgICAgICAgICAgIGlmIChpIDwgMTYpIHtcblx0ICAgICAgICAgICAgICAgICAgICBXW2ldID0gTVtvZmZzZXQgKyBpXSB8IDA7XG5cdCAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXHQgICAgICAgICAgICAgICAgICAgIHZhciBuID0gV1tpIC0gM10gXiBXW2kgLSA4XSBeIFdbaSAtIDE0XSBeIFdbaSAtIDE2XTtcblx0ICAgICAgICAgICAgICAgICAgICBXW2ldID0gKG4gPDwgMSkgfCAobiA+Pj4gMzEpO1xuXHQgICAgICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgICAgICB2YXIgdCA9ICgoYSA8PCA1KSB8IChhID4+PiAyNykpICsgZSArIFdbaV07XG5cdCAgICAgICAgICAgICAgICBpZiAoaSA8IDIwKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgdCArPSAoKGIgJiBjKSB8ICh+YiAmIGQpKSArIDB4NWE4Mjc5OTk7XG5cdCAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGkgPCA0MCkge1xuXHQgICAgICAgICAgICAgICAgICAgIHQgKz0gKGIgXiBjIF4gZCkgKyAweDZlZDllYmExO1xuXHQgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpIDwgNjApIHtcblx0ICAgICAgICAgICAgICAgICAgICB0ICs9ICgoYiAmIGMpIHwgKGIgJiBkKSB8IChjICYgZCkpIC0gMHg3MGU0NDMyNDtcblx0ICAgICAgICAgICAgICAgIH0gZWxzZSAvKiBpZiAoaSA8IDgwKSAqLyB7XG5cdCAgICAgICAgICAgICAgICAgICAgdCArPSAoYiBeIGMgXiBkKSAtIDB4MzU5ZDNlMmE7XG5cdCAgICAgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgICAgIGUgPSBkO1xuXHQgICAgICAgICAgICAgICAgZCA9IGM7XG5cdCAgICAgICAgICAgICAgICBjID0gKGIgPDwgMzApIHwgKGIgPj4+IDIpO1xuXHQgICAgICAgICAgICAgICAgYiA9IGE7XG5cdCAgICAgICAgICAgICAgICBhID0gdDtcblx0ICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgIC8vIEludGVybWVkaWF0ZSBoYXNoIHZhbHVlXG5cdCAgICAgICAgICAgIEhbMF0gPSAoSFswXSArIGEpIHwgMDtcblx0ICAgICAgICAgICAgSFsxXSA9IChIWzFdICsgYikgfCAwO1xuXHQgICAgICAgICAgICBIWzJdID0gKEhbMl0gKyBjKSB8IDA7XG5cdCAgICAgICAgICAgIEhbM10gPSAoSFszXSArIGQpIHwgMDtcblx0ICAgICAgICAgICAgSFs0XSA9IChIWzRdICsgZSkgfCAwO1xuXHQgICAgICAgIH0sXG5cblx0ICAgICAgICBfZG9GaW5hbGl6ZTogZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICAvLyBTaG9ydGN1dHNcblx0ICAgICAgICAgICAgdmFyIGRhdGEgPSB0aGlzLl9kYXRhO1xuXHQgICAgICAgICAgICB2YXIgZGF0YVdvcmRzID0gZGF0YS53b3JkcztcblxuXHQgICAgICAgICAgICB2YXIgbkJpdHNUb3RhbCA9IHRoaXMuX25EYXRhQnl0ZXMgKiA4O1xuXHQgICAgICAgICAgICB2YXIgbkJpdHNMZWZ0ID0gZGF0YS5zaWdCeXRlcyAqIDg7XG5cblx0ICAgICAgICAgICAgLy8gQWRkIHBhZGRpbmdcblx0ICAgICAgICAgICAgZGF0YVdvcmRzW25CaXRzTGVmdCA+Pj4gNV0gfD0gMHg4MCA8PCAoMjQgLSBuQml0c0xlZnQgJSAzMik7XG5cdCAgICAgICAgICAgIGRhdGFXb3Jkc1soKChuQml0c0xlZnQgKyA2NCkgPj4+IDkpIDw8IDQpICsgMTRdID0gTWF0aC5mbG9vcihuQml0c1RvdGFsIC8gMHgxMDAwMDAwMDApO1xuXHQgICAgICAgICAgICBkYXRhV29yZHNbKCgobkJpdHNMZWZ0ICsgNjQpID4+PiA5KSA8PCA0KSArIDE1XSA9IG5CaXRzVG90YWw7XG5cdCAgICAgICAgICAgIGRhdGEuc2lnQnl0ZXMgPSBkYXRhV29yZHMubGVuZ3RoICogNDtcblxuXHQgICAgICAgICAgICAvLyBIYXNoIGZpbmFsIGJsb2Nrc1xuXHQgICAgICAgICAgICB0aGlzLl9wcm9jZXNzKCk7XG5cblx0ICAgICAgICAgICAgLy8gUmV0dXJuIGZpbmFsIGNvbXB1dGVkIGhhc2hcblx0ICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2hhc2g7XG5cdCAgICAgICAgfSxcblxuXHQgICAgICAgIGNsb25lOiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgIHZhciBjbG9uZSA9IEhhc2hlci5jbG9uZS5jYWxsKHRoaXMpO1xuXHQgICAgICAgICAgICBjbG9uZS5faGFzaCA9IHRoaXMuX2hhc2guY2xvbmUoKTtcblxuXHQgICAgICAgICAgICByZXR1cm4gY2xvbmU7XG5cdCAgICAgICAgfVxuXHQgICAgfSk7XG5cblx0ICAgIC8qKlxuXHQgICAgICogU2hvcnRjdXQgZnVuY3Rpb24gdG8gdGhlIGhhc2hlcidzIG9iamVjdCBpbnRlcmZhY2UuXG5cdCAgICAgKlxuXHQgICAgICogQHBhcmFtIHtXb3JkQXJyYXl8c3RyaW5nfSBtZXNzYWdlIFRoZSBtZXNzYWdlIHRvIGhhc2guXG5cdCAgICAgKlxuXHQgICAgICogQHJldHVybiB7V29yZEFycmF5fSBUaGUgaGFzaC5cblx0ICAgICAqXG5cdCAgICAgKiBAc3RhdGljXG5cdCAgICAgKlxuXHQgICAgICogQGV4YW1wbGVcblx0ICAgICAqXG5cdCAgICAgKiAgICAgdmFyIGhhc2ggPSBDcnlwdG9KUy5TSEExKCdtZXNzYWdlJyk7XG5cdCAgICAgKiAgICAgdmFyIGhhc2ggPSBDcnlwdG9KUy5TSEExKHdvcmRBcnJheSk7XG5cdCAgICAgKi9cblx0ICAgIEMuU0hBMSA9IEhhc2hlci5fY3JlYXRlSGVscGVyKFNIQTEpO1xuXG5cdCAgICAvKipcblx0ICAgICAqIFNob3J0Y3V0IGZ1bmN0aW9uIHRvIHRoZSBITUFDJ3Mgb2JqZWN0IGludGVyZmFjZS5cblx0ICAgICAqXG5cdCAgICAgKiBAcGFyYW0ge1dvcmRBcnJheXxzdHJpbmd9IG1lc3NhZ2UgVGhlIG1lc3NhZ2UgdG8gaGFzaC5cblx0ICAgICAqIEBwYXJhbSB7V29yZEFycmF5fHN0cmluZ30ga2V5IFRoZSBzZWNyZXQga2V5LlxuXHQgICAgICpcblx0ICAgICAqIEByZXR1cm4ge1dvcmRBcnJheX0gVGhlIEhNQUMuXG5cdCAgICAgKlxuXHQgICAgICogQHN0YXRpY1xuXHQgICAgICpcblx0ICAgICAqIEBleGFtcGxlXG5cdCAgICAgKlxuXHQgICAgICogICAgIHZhciBobWFjID0gQ3J5cHRvSlMuSG1hY1NIQTEobWVzc2FnZSwga2V5KTtcblx0ICAgICAqL1xuXHQgICAgQy5IbWFjU0hBMSA9IEhhc2hlci5fY3JlYXRlSG1hY0hlbHBlcihTSEExKTtcblx0fSgpKTtcblxuXG5cdHJldHVybiBDcnlwdG9KUy5TSEExO1xuXG59KSk7IiwiLy8gICAgIHV1aWQuanNcbi8vXG4vLyAgICAgQ29weXJpZ2h0IChjKSAyMDEwLTIwMTIgUm9iZXJ0IEtpZWZmZXJcbi8vICAgICBNSVQgTGljZW5zZSAtIGh0dHA6Ly9vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcblxuKGZ1bmN0aW9uKCkge1xuICB2YXIgX2dsb2JhbCA9IHRoaXM7XG5cbiAgLy8gVW5pcXVlIElEIGNyZWF0aW9uIHJlcXVpcmVzIGEgaGlnaCBxdWFsaXR5IHJhbmRvbSAjIGdlbmVyYXRvci4gIFdlIGZlYXR1cmVcbiAgLy8gZGV0ZWN0IHRvIGRldGVybWluZSB0aGUgYmVzdCBSTkcgc291cmNlLCBub3JtYWxpemluZyB0byBhIGZ1bmN0aW9uIHRoYXRcbiAgLy8gcmV0dXJucyAxMjgtYml0cyBvZiByYW5kb21uZXNzLCBzaW5jZSB0aGF0J3Mgd2hhdCdzIHVzdWFsbHkgcmVxdWlyZWRcbiAgdmFyIF9ybmc7XG5cbiAgLy8gTm9kZS5qcyBjcnlwdG8tYmFzZWQgUk5HIC0gaHR0cDovL25vZGVqcy5vcmcvZG9jcy92MC42LjIvYXBpL2NyeXB0by5odG1sXG4gIC8vXG4gIC8vIE1vZGVyYXRlbHkgZmFzdCwgaGlnaCBxdWFsaXR5XG4gIGlmICh0eXBlb2YoX2dsb2JhbC5yZXF1aXJlKSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgdHJ5IHtcbiAgICAgIHZhciBfcmIgPSBfZ2xvYmFsLnJlcXVpcmUoJ2NyeXB0bycpLnJhbmRvbUJ5dGVzO1xuICAgICAgX3JuZyA9IF9yYiAmJiBmdW5jdGlvbigpIHtyZXR1cm4gX3JiKDE2KTt9O1xuICAgIH0gY2F0Y2goZSkge31cbiAgfVxuXG4gIGlmICghX3JuZyAmJiBfZ2xvYmFsLmNyeXB0byAmJiBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKSB7XG4gICAgLy8gV0hBVFdHIGNyeXB0by1iYXNlZCBSTkcgLSBodHRwOi8vd2lraS53aGF0d2cub3JnL3dpa2kvQ3J5cHRvXG4gICAgLy9cbiAgICAvLyBNb2RlcmF0ZWx5IGZhc3QsIGhpZ2ggcXVhbGl0eVxuICAgIHZhciBfcm5kczggPSBuZXcgVWludDhBcnJheSgxNik7XG4gICAgX3JuZyA9IGZ1bmN0aW9uIHdoYXR3Z1JORygpIHtcbiAgICAgIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMoX3JuZHM4KTtcbiAgICAgIHJldHVybiBfcm5kczg7XG4gICAgfTtcbiAgfVxuXG4gIGlmICghX3JuZykge1xuICAgIC8vIE1hdGgucmFuZG9tKCktYmFzZWQgKFJORylcbiAgICAvL1xuICAgIC8vIElmIGFsbCBlbHNlIGZhaWxzLCB1c2UgTWF0aC5yYW5kb20oKS4gIEl0J3MgZmFzdCwgYnV0IGlzIG9mIHVuc3BlY2lmaWVkXG4gICAgLy8gcXVhbGl0eS5cbiAgICB2YXIgIF9ybmRzID0gbmV3IEFycmF5KDE2KTtcbiAgICBfcm5nID0gZnVuY3Rpb24oKSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgcjsgaSA8IDE2OyBpKyspIHtcbiAgICAgICAgaWYgKChpICYgMHgwMykgPT09IDApIHIgPSBNYXRoLnJhbmRvbSgpICogMHgxMDAwMDAwMDA7XG4gICAgICAgIF9ybmRzW2ldID0gciA+Pj4gKChpICYgMHgwMykgPDwgMykgJiAweGZmO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gX3JuZHM7XG4gICAgfTtcbiAgfVxuXG4gIC8vIEJ1ZmZlciBjbGFzcyB0byB1c2VcbiAgdmFyIEJ1ZmZlckNsYXNzID0gdHlwZW9mKF9nbG9iYWwuQnVmZmVyKSA9PSAnZnVuY3Rpb24nID8gX2dsb2JhbC5CdWZmZXIgOiBBcnJheTtcblxuICAvLyBNYXBzIGZvciBudW1iZXIgPC0+IGhleCBzdHJpbmcgY29udmVyc2lvblxuICB2YXIgX2J5dGVUb0hleCA9IFtdO1xuICB2YXIgX2hleFRvQnl0ZSA9IHt9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IDI1NjsgaSsrKSB7XG4gICAgX2J5dGVUb0hleFtpXSA9IChpICsgMHgxMDApLnRvU3RyaW5nKDE2KS5zdWJzdHIoMSk7XG4gICAgX2hleFRvQnl0ZVtfYnl0ZVRvSGV4W2ldXSA9IGk7XG4gIH1cblxuICAvLyAqKmBwYXJzZSgpYCAtIFBhcnNlIGEgVVVJRCBpbnRvIGl0J3MgY29tcG9uZW50IGJ5dGVzKipcbiAgZnVuY3Rpb24gcGFyc2UocywgYnVmLCBvZmZzZXQpIHtcbiAgICB2YXIgaSA9IChidWYgJiYgb2Zmc2V0KSB8fCAwLCBpaSA9IDA7XG5cbiAgICBidWYgPSBidWYgfHwgW107XG4gICAgcy50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1swLTlhLWZdezJ9L2csIGZ1bmN0aW9uKG9jdCkge1xuICAgICAgaWYgKGlpIDwgMTYpIHsgLy8gRG9uJ3Qgb3ZlcmZsb3chXG4gICAgICAgIGJ1ZltpICsgaWkrK10gPSBfaGV4VG9CeXRlW29jdF07XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBaZXJvIG91dCByZW1haW5pbmcgYnl0ZXMgaWYgc3RyaW5nIHdhcyBzaG9ydFxuICAgIHdoaWxlIChpaSA8IDE2KSB7XG4gICAgICBidWZbaSArIGlpKytdID0gMDtcbiAgICB9XG5cbiAgICByZXR1cm4gYnVmO1xuICB9XG5cbiAgLy8gKipgdW5wYXJzZSgpYCAtIENvbnZlcnQgVVVJRCBieXRlIGFycmF5IChhbGEgcGFyc2UoKSkgaW50byBhIHN0cmluZyoqXG4gIGZ1bmN0aW9uIHVucGFyc2UoYnVmLCBvZmZzZXQpIHtcbiAgICB2YXIgaSA9IG9mZnNldCB8fCAwLCBidGggPSBfYnl0ZVRvSGV4O1xuICAgIHJldHVybiAgYnRoW2J1ZltpKytdXSArIGJ0aFtidWZbaSsrXV0gK1xuICAgICAgICAgICAgYnRoW2J1ZltpKytdXSArIGJ0aFtidWZbaSsrXV0gKyAnLScgK1xuICAgICAgICAgICAgYnRoW2J1ZltpKytdXSArIGJ0aFtidWZbaSsrXV0gKyAnLScgK1xuICAgICAgICAgICAgYnRoW2J1ZltpKytdXSArIGJ0aFtidWZbaSsrXV0gKyAnLScgK1xuICAgICAgICAgICAgYnRoW2J1ZltpKytdXSArIGJ0aFtidWZbaSsrXV0gKyAnLScgK1xuICAgICAgICAgICAgYnRoW2J1ZltpKytdXSArIGJ0aFtidWZbaSsrXV0gK1xuICAgICAgICAgICAgYnRoW2J1ZltpKytdXSArIGJ0aFtidWZbaSsrXV0gK1xuICAgICAgICAgICAgYnRoW2J1ZltpKytdXSArIGJ0aFtidWZbaSsrXV07XG4gIH1cblxuICAvLyAqKmB2MSgpYCAtIEdlbmVyYXRlIHRpbWUtYmFzZWQgVVVJRCoqXG4gIC8vXG4gIC8vIEluc3BpcmVkIGJ5IGh0dHBzOi8vZ2l0aHViLmNvbS9MaW9zSy9VVUlELmpzXG4gIC8vIGFuZCBodHRwOi8vZG9jcy5weXRob24ub3JnL2xpYnJhcnkvdXVpZC5odG1sXG5cbiAgLy8gcmFuZG9tICMncyB3ZSBuZWVkIHRvIGluaXQgbm9kZSBhbmQgY2xvY2tzZXFcbiAgdmFyIF9zZWVkQnl0ZXMgPSBfcm5nKCk7XG5cbiAgLy8gUGVyIDQuNSwgY3JlYXRlIGFuZCA0OC1iaXQgbm9kZSBpZCwgKDQ3IHJhbmRvbSBiaXRzICsgbXVsdGljYXN0IGJpdCA9IDEpXG4gIHZhciBfbm9kZUlkID0gW1xuICAgIF9zZWVkQnl0ZXNbMF0gfCAweDAxLFxuICAgIF9zZWVkQnl0ZXNbMV0sIF9zZWVkQnl0ZXNbMl0sIF9zZWVkQnl0ZXNbM10sIF9zZWVkQnl0ZXNbNF0sIF9zZWVkQnl0ZXNbNV1cbiAgXTtcblxuICAvLyBQZXIgNC4yLjIsIHJhbmRvbWl6ZSAoMTQgYml0KSBjbG9ja3NlcVxuICB2YXIgX2Nsb2Nrc2VxID0gKF9zZWVkQnl0ZXNbNl0gPDwgOCB8IF9zZWVkQnl0ZXNbN10pICYgMHgzZmZmO1xuXG4gIC8vIFByZXZpb3VzIHV1aWQgY3JlYXRpb24gdGltZVxuICB2YXIgX2xhc3RNU2VjcyA9IDAsIF9sYXN0TlNlY3MgPSAwO1xuXG4gIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vYnJvb2ZhL25vZGUtdXVpZCBmb3IgQVBJIGRldGFpbHNcbiAgZnVuY3Rpb24gdjEob3B0aW9ucywgYnVmLCBvZmZzZXQpIHtcbiAgICB2YXIgaSA9IGJ1ZiAmJiBvZmZzZXQgfHwgMDtcbiAgICB2YXIgYiA9IGJ1ZiB8fCBbXTtcblxuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgdmFyIGNsb2Nrc2VxID0gb3B0aW9ucy5jbG9ja3NlcSAhPSBudWxsID8gb3B0aW9ucy5jbG9ja3NlcSA6IF9jbG9ja3NlcTtcblxuICAgIC8vIFVVSUQgdGltZXN0YW1wcyBhcmUgMTAwIG5hbm8tc2Vjb25kIHVuaXRzIHNpbmNlIHRoZSBHcmVnb3JpYW4gZXBvY2gsXG4gICAgLy8gKDE1ODItMTAtMTUgMDA6MDApLiAgSlNOdW1iZXJzIGFyZW4ndCBwcmVjaXNlIGVub3VnaCBmb3IgdGhpcywgc29cbiAgICAvLyB0aW1lIGlzIGhhbmRsZWQgaW50ZXJuYWxseSBhcyAnbXNlY3MnIChpbnRlZ2VyIG1pbGxpc2Vjb25kcykgYW5kICduc2VjcydcbiAgICAvLyAoMTAwLW5hbm9zZWNvbmRzIG9mZnNldCBmcm9tIG1zZWNzKSBzaW5jZSB1bml4IGVwb2NoLCAxOTcwLTAxLTAxIDAwOjAwLlxuICAgIHZhciBtc2VjcyA9IG9wdGlvbnMubXNlY3MgIT0gbnVsbCA/IG9wdGlvbnMubXNlY3MgOiBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuICAgIC8vIFBlciA0LjIuMS4yLCB1c2UgY291bnQgb2YgdXVpZCdzIGdlbmVyYXRlZCBkdXJpbmcgdGhlIGN1cnJlbnQgY2xvY2tcbiAgICAvLyBjeWNsZSB0byBzaW11bGF0ZSBoaWdoZXIgcmVzb2x1dGlvbiBjbG9ja1xuICAgIHZhciBuc2VjcyA9IG9wdGlvbnMubnNlY3MgIT0gbnVsbCA/IG9wdGlvbnMubnNlY3MgOiBfbGFzdE5TZWNzICsgMTtcblxuICAgIC8vIFRpbWUgc2luY2UgbGFzdCB1dWlkIGNyZWF0aW9uIChpbiBtc2VjcylcbiAgICB2YXIgZHQgPSAobXNlY3MgLSBfbGFzdE1TZWNzKSArIChuc2VjcyAtIF9sYXN0TlNlY3MpLzEwMDAwO1xuXG4gICAgLy8gUGVyIDQuMi4xLjIsIEJ1bXAgY2xvY2tzZXEgb24gY2xvY2sgcmVncmVzc2lvblxuICAgIGlmIChkdCA8IDAgJiYgb3B0aW9ucy5jbG9ja3NlcSA9PSBudWxsKSB7XG4gICAgICBjbG9ja3NlcSA9IGNsb2Nrc2VxICsgMSAmIDB4M2ZmZjtcbiAgICB9XG5cbiAgICAvLyBSZXNldCBuc2VjcyBpZiBjbG9jayByZWdyZXNzZXMgKG5ldyBjbG9ja3NlcSkgb3Igd2UndmUgbW92ZWQgb250byBhIG5ld1xuICAgIC8vIHRpbWUgaW50ZXJ2YWxcbiAgICBpZiAoKGR0IDwgMCB8fCBtc2VjcyA+IF9sYXN0TVNlY3MpICYmIG9wdGlvbnMubnNlY3MgPT0gbnVsbCkge1xuICAgICAgbnNlY3MgPSAwO1xuICAgIH1cblxuICAgIC8vIFBlciA0LjIuMS4yIFRocm93IGVycm9yIGlmIHRvbyBtYW55IHV1aWRzIGFyZSByZXF1ZXN0ZWRcbiAgICBpZiAobnNlY3MgPj0gMTAwMDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcigndXVpZC52MSgpOiBDYW5cXCd0IGNyZWF0ZSBtb3JlIHRoYW4gMTBNIHV1aWRzL3NlYycpO1xuICAgIH1cblxuICAgIF9sYXN0TVNlY3MgPSBtc2VjcztcbiAgICBfbGFzdE5TZWNzID0gbnNlY3M7XG4gICAgX2Nsb2Nrc2VxID0gY2xvY2tzZXE7XG5cbiAgICAvLyBQZXIgNC4xLjQgLSBDb252ZXJ0IGZyb20gdW5peCBlcG9jaCB0byBHcmVnb3JpYW4gZXBvY2hcbiAgICBtc2VjcyArPSAxMjIxOTI5MjgwMDAwMDtcblxuICAgIC8vIGB0aW1lX2xvd2BcbiAgICB2YXIgdGwgPSAoKG1zZWNzICYgMHhmZmZmZmZmKSAqIDEwMDAwICsgbnNlY3MpICUgMHgxMDAwMDAwMDA7XG4gICAgYltpKytdID0gdGwgPj4+IDI0ICYgMHhmZjtcbiAgICBiW2krK10gPSB0bCA+Pj4gMTYgJiAweGZmO1xuICAgIGJbaSsrXSA9IHRsID4+PiA4ICYgMHhmZjtcbiAgICBiW2krK10gPSB0bCAmIDB4ZmY7XG5cbiAgICAvLyBgdGltZV9taWRgXG4gICAgdmFyIHRtaCA9IChtc2VjcyAvIDB4MTAwMDAwMDAwICogMTAwMDApICYgMHhmZmZmZmZmO1xuICAgIGJbaSsrXSA9IHRtaCA+Pj4gOCAmIDB4ZmY7XG4gICAgYltpKytdID0gdG1oICYgMHhmZjtcblxuICAgIC8vIGB0aW1lX2hpZ2hfYW5kX3ZlcnNpb25gXG4gICAgYltpKytdID0gdG1oID4+PiAyNCAmIDB4ZiB8IDB4MTA7IC8vIGluY2x1ZGUgdmVyc2lvblxuICAgIGJbaSsrXSA9IHRtaCA+Pj4gMTYgJiAweGZmO1xuXG4gICAgLy8gYGNsb2NrX3NlcV9oaV9hbmRfcmVzZXJ2ZWRgIChQZXIgNC4yLjIgLSBpbmNsdWRlIHZhcmlhbnQpXG4gICAgYltpKytdID0gY2xvY2tzZXEgPj4+IDggfCAweDgwO1xuXG4gICAgLy8gYGNsb2NrX3NlcV9sb3dgXG4gICAgYltpKytdID0gY2xvY2tzZXEgJiAweGZmO1xuXG4gICAgLy8gYG5vZGVgXG4gICAgdmFyIG5vZGUgPSBvcHRpb25zLm5vZGUgfHwgX25vZGVJZDtcbiAgICBmb3IgKHZhciBuID0gMDsgbiA8IDY7IG4rKykge1xuICAgICAgYltpICsgbl0gPSBub2RlW25dO1xuICAgIH1cblxuICAgIHJldHVybiBidWYgPyBidWYgOiB1bnBhcnNlKGIpO1xuICB9XG5cbiAgLy8gKipgdjQoKWAgLSBHZW5lcmF0ZSByYW5kb20gVVVJRCoqXG5cbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9icm9vZmEvbm9kZS11dWlkIGZvciBBUEkgZGV0YWlsc1xuICBmdW5jdGlvbiB2NChvcHRpb25zLCBidWYsIG9mZnNldCkge1xuICAgIC8vIERlcHJlY2F0ZWQgLSAnZm9ybWF0JyBhcmd1bWVudCwgYXMgc3VwcG9ydGVkIGluIHYxLjJcbiAgICB2YXIgaSA9IGJ1ZiAmJiBvZmZzZXQgfHwgMDtcblxuICAgIGlmICh0eXBlb2Yob3B0aW9ucykgPT0gJ3N0cmluZycpIHtcbiAgICAgIGJ1ZiA9IG9wdGlvbnMgPT0gJ2JpbmFyeScgPyBuZXcgQnVmZmVyQ2xhc3MoMTYpIDogbnVsbDtcbiAgICAgIG9wdGlvbnMgPSBudWxsO1xuICAgIH1cbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHZhciBybmRzID0gb3B0aW9ucy5yYW5kb20gfHwgKG9wdGlvbnMucm5nIHx8IF9ybmcpKCk7XG5cbiAgICAvLyBQZXIgNC40LCBzZXQgYml0cyBmb3IgdmVyc2lvbiBhbmQgYGNsb2NrX3NlcV9oaV9hbmRfcmVzZXJ2ZWRgXG4gICAgcm5kc1s2XSA9IChybmRzWzZdICYgMHgwZikgfCAweDQwO1xuICAgIHJuZHNbOF0gPSAocm5kc1s4XSAmIDB4M2YpIHwgMHg4MDtcblxuICAgIC8vIENvcHkgYnl0ZXMgdG8gYnVmZmVyLCBpZiBwcm92aWRlZFxuICAgIGlmIChidWYpIHtcbiAgICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCAxNjsgaWkrKykge1xuICAgICAgICBidWZbaSArIGlpXSA9IHJuZHNbaWldO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBidWYgfHwgdW5wYXJzZShybmRzKTtcbiAgfVxuXG4gIC8vIEV4cG9ydCBwdWJsaWMgQVBJXG4gIHZhciB1dWlkID0gdjQ7XG4gIHV1aWQudjEgPSB2MTtcbiAgdXVpZC52NCA9IHY0O1xuICB1dWlkLnBhcnNlID0gcGFyc2U7XG4gIHV1aWQudW5wYXJzZSA9IHVucGFyc2U7XG4gIHV1aWQuQnVmZmVyQ2xhc3MgPSBCdWZmZXJDbGFzcztcblxuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgLy8gUHVibGlzaCBhcyBBTUQgbW9kdWxlXG4gICAgZGVmaW5lKGZ1bmN0aW9uKCkge3JldHVybiB1dWlkO30pO1xuICB9IGVsc2UgaWYgKHR5cGVvZihtb2R1bGUpICE9ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgLy8gUHVibGlzaCBhcyBub2RlLmpzIG1vZHVsZVxuICAgIG1vZHVsZS5leHBvcnRzID0gdXVpZDtcbiAgfSBlbHNlIHtcbiAgICAvLyBQdWJsaXNoIGFzIGdsb2JhbCAoaW4gYnJvd3NlcnMpXG4gICAgdmFyIF9wcmV2aW91c1Jvb3QgPSBfZ2xvYmFsLnV1aWQ7XG5cbiAgICAvLyAqKmBub0NvbmZsaWN0KClgIC0gKGJyb3dzZXIgb25seSkgdG8gcmVzZXQgZ2xvYmFsICd1dWlkJyB2YXIqKlxuICAgIHV1aWQubm9Db25mbGljdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgX2dsb2JhbC51dWlkID0gX3ByZXZpb3VzUm9vdDtcbiAgICAgIHJldHVybiB1dWlkO1xuICAgIH07XG5cbiAgICBfZ2xvYmFsLnV1aWQgPSB1dWlkO1xuICB9XG59KS5jYWxsKHRoaXMpO1xuIiwiXCJ1c2Ugc3RyaWN0XCJcbi8vIE1vZHVsZSBleHBvcnQgcGF0dGVybiBmcm9tXG4vLyBodHRwczovL2dpdGh1Yi5jb20vdW1kanMvdW1kL2Jsb2IvbWFzdGVyL3JldHVybkV4cG9ydHMuanNcbjsoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cbiAgICAgICAgZGVmaW5lKFtdLCBmYWN0b3J5KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICAvLyBOb2RlLiBEb2VzIG5vdCB3b3JrIHdpdGggc3RyaWN0IENvbW1vbkpTLCBidXRcbiAgICAgICAgLy8gb25seSBDb21tb25KUy1saWtlIGVudmlyb25tZW50cyB0aGF0IHN1cHBvcnQgbW9kdWxlLmV4cG9ydHMsXG4gICAgICAgIC8vIGxpa2UgTm9kZS5cbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQnJvd3NlciBnbG9iYWxzIChyb290IGlzIHdpbmRvdylcbiAgICAgICAgcm9vdC5zdG9yZSA9IGZhY3RvcnkoKTtcbiAgfVxufSh0aGlzLCBmdW5jdGlvbiAoKSB7XG5cdFxuXHQvLyBTdG9yZS5qc1xuXHR2YXIgc3RvcmUgPSB7fSxcblx0XHR3aW4gPSAodHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IGdsb2JhbCksXG5cdFx0ZG9jID0gd2luLmRvY3VtZW50LFxuXHRcdGxvY2FsU3RvcmFnZU5hbWUgPSAnbG9jYWxTdG9yYWdlJyxcblx0XHRzY3JpcHRUYWcgPSAnc2NyaXB0Jyxcblx0XHRzdG9yYWdlXG5cblx0c3RvcmUuZGlzYWJsZWQgPSBmYWxzZVxuXHRzdG9yZS52ZXJzaW9uID0gJzEuMy4yMCdcblx0c3RvcmUuc2V0ID0gZnVuY3Rpb24oa2V5LCB2YWx1ZSkge31cblx0c3RvcmUuZ2V0ID0gZnVuY3Rpb24oa2V5LCBkZWZhdWx0VmFsKSB7fVxuXHRzdG9yZS5oYXMgPSBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHN0b3JlLmdldChrZXkpICE9PSB1bmRlZmluZWQgfVxuXHRzdG9yZS5yZW1vdmUgPSBmdW5jdGlvbihrZXkpIHt9XG5cdHN0b3JlLmNsZWFyID0gZnVuY3Rpb24oKSB7fVxuXHRzdG9yZS50cmFuc2FjdCA9IGZ1bmN0aW9uKGtleSwgZGVmYXVsdFZhbCwgdHJhbnNhY3Rpb25Gbikge1xuXHRcdGlmICh0cmFuc2FjdGlvbkZuID09IG51bGwpIHtcblx0XHRcdHRyYW5zYWN0aW9uRm4gPSBkZWZhdWx0VmFsXG5cdFx0XHRkZWZhdWx0VmFsID0gbnVsbFxuXHRcdH1cblx0XHRpZiAoZGVmYXVsdFZhbCA9PSBudWxsKSB7XG5cdFx0XHRkZWZhdWx0VmFsID0ge31cblx0XHR9XG5cdFx0dmFyIHZhbCA9IHN0b3JlLmdldChrZXksIGRlZmF1bHRWYWwpXG5cdFx0dHJhbnNhY3Rpb25Gbih2YWwpXG5cdFx0c3RvcmUuc2V0KGtleSwgdmFsKVxuXHR9XG5cdHN0b3JlLmdldEFsbCA9IGZ1bmN0aW9uKCkge31cblx0c3RvcmUuZm9yRWFjaCA9IGZ1bmN0aW9uKCkge31cblxuXHRzdG9yZS5zZXJpYWxpemUgPSBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdHJldHVybiBKU09OLnN0cmluZ2lmeSh2YWx1ZSlcblx0fVxuXHRzdG9yZS5kZXNlcmlhbGl6ZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0aWYgKHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgeyByZXR1cm4gdW5kZWZpbmVkIH1cblx0XHR0cnkgeyByZXR1cm4gSlNPTi5wYXJzZSh2YWx1ZSkgfVxuXHRcdGNhdGNoKGUpIHsgcmV0dXJuIHZhbHVlIHx8IHVuZGVmaW5lZCB9XG5cdH1cblxuXHQvLyBGdW5jdGlvbnMgdG8gZW5jYXBzdWxhdGUgcXVlc3Rpb25hYmxlIEZpcmVGb3ggMy42LjEzIGJlaGF2aW9yXG5cdC8vIHdoZW4gYWJvdXQuY29uZmlnOjpkb20uc3RvcmFnZS5lbmFibGVkID09PSBmYWxzZVxuXHQvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL21hcmN1c3dlc3Rpbi9zdG9yZS5qcy9pc3N1ZXMjaXNzdWUvMTNcblx0ZnVuY3Rpb24gaXNMb2NhbFN0b3JhZ2VOYW1lU3VwcG9ydGVkKCkge1xuXHRcdHRyeSB7IHJldHVybiAobG9jYWxTdG9yYWdlTmFtZSBpbiB3aW4gJiYgd2luW2xvY2FsU3RvcmFnZU5hbWVdKSB9XG5cdFx0Y2F0Y2goZXJyKSB7IHJldHVybiBmYWxzZSB9XG5cdH1cblxuXHRpZiAoaXNMb2NhbFN0b3JhZ2VOYW1lU3VwcG9ydGVkKCkpIHtcblx0XHRzdG9yYWdlID0gd2luW2xvY2FsU3RvcmFnZU5hbWVdXG5cdFx0c3RvcmUuc2V0ID0gZnVuY3Rpb24oa2V5LCB2YWwpIHtcblx0XHRcdGlmICh2YWwgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gc3RvcmUucmVtb3ZlKGtleSkgfVxuXHRcdFx0c3RvcmFnZS5zZXRJdGVtKGtleSwgc3RvcmUuc2VyaWFsaXplKHZhbCkpXG5cdFx0XHRyZXR1cm4gdmFsXG5cdFx0fVxuXHRcdHN0b3JlLmdldCA9IGZ1bmN0aW9uKGtleSwgZGVmYXVsdFZhbCkge1xuXHRcdFx0dmFyIHZhbCA9IHN0b3JlLmRlc2VyaWFsaXplKHN0b3JhZ2UuZ2V0SXRlbShrZXkpKVxuXHRcdFx0cmV0dXJuICh2YWwgPT09IHVuZGVmaW5lZCA/IGRlZmF1bHRWYWwgOiB2YWwpXG5cdFx0fVxuXHRcdHN0b3JlLnJlbW92ZSA9IGZ1bmN0aW9uKGtleSkgeyBzdG9yYWdlLnJlbW92ZUl0ZW0oa2V5KSB9XG5cdFx0c3RvcmUuY2xlYXIgPSBmdW5jdGlvbigpIHsgc3RvcmFnZS5jbGVhcigpIH1cblx0XHRzdG9yZS5nZXRBbGwgPSBmdW5jdGlvbigpIHtcblx0XHRcdHZhciByZXQgPSB7fVxuXHRcdFx0c3RvcmUuZm9yRWFjaChmdW5jdGlvbihrZXksIHZhbCkge1xuXHRcdFx0XHRyZXRba2V5XSA9IHZhbFxuXHRcdFx0fSlcblx0XHRcdHJldHVybiByZXRcblx0XHR9XG5cdFx0c3RvcmUuZm9yRWFjaCA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG5cdFx0XHRmb3IgKHZhciBpPTA7IGk8c3RvcmFnZS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIga2V5ID0gc3RvcmFnZS5rZXkoaSlcblx0XHRcdFx0Y2FsbGJhY2soa2V5LCBzdG9yZS5nZXQoa2V5KSlcblx0XHRcdH1cblx0XHR9XG5cdH0gZWxzZSBpZiAoZG9jICYmIGRvYy5kb2N1bWVudEVsZW1lbnQuYWRkQmVoYXZpb3IpIHtcblx0XHR2YXIgc3RvcmFnZU93bmVyLFxuXHRcdFx0c3RvcmFnZUNvbnRhaW5lclxuXHRcdC8vIFNpbmNlICN1c2VyRGF0YSBzdG9yYWdlIGFwcGxpZXMgb25seSB0byBzcGVjaWZpYyBwYXRocywgd2UgbmVlZCB0b1xuXHRcdC8vIHNvbWVob3cgbGluayBvdXIgZGF0YSB0byBhIHNwZWNpZmljIHBhdGguICBXZSBjaG9vc2UgL2Zhdmljb24uaWNvXG5cdFx0Ly8gYXMgYSBwcmV0dHkgc2FmZSBvcHRpb24sIHNpbmNlIGFsbCBicm93c2VycyBhbHJlYWR5IG1ha2UgYSByZXF1ZXN0IHRvXG5cdFx0Ly8gdGhpcyBVUkwgYW55d2F5IGFuZCBiZWluZyBhIDQwNCB3aWxsIG5vdCBodXJ0IHVzIGhlcmUuICBXZSB3cmFwIGFuXG5cdFx0Ly8gaWZyYW1lIHBvaW50aW5nIHRvIHRoZSBmYXZpY29uIGluIGFuIEFjdGl2ZVhPYmplY3QoaHRtbGZpbGUpIG9iamVjdFxuXHRcdC8vIChzZWU6IGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9hYTc1MjU3NCh2PVZTLjg1KS5hc3B4KVxuXHRcdC8vIHNpbmNlIHRoZSBpZnJhbWUgYWNjZXNzIHJ1bGVzIGFwcGVhciB0byBhbGxvdyBkaXJlY3QgYWNjZXNzIGFuZFxuXHRcdC8vIG1hbmlwdWxhdGlvbiBvZiB0aGUgZG9jdW1lbnQgZWxlbWVudCwgZXZlbiBmb3IgYSA0MDQgcGFnZS4gIFRoaXNcblx0XHQvLyBkb2N1bWVudCBjYW4gYmUgdXNlZCBpbnN0ZWFkIG9mIHRoZSBjdXJyZW50IGRvY3VtZW50ICh3aGljaCB3b3VsZFxuXHRcdC8vIGhhdmUgYmVlbiBsaW1pdGVkIHRvIHRoZSBjdXJyZW50IHBhdGgpIHRvIHBlcmZvcm0gI3VzZXJEYXRhIHN0b3JhZ2UuXG5cdFx0dHJ5IHtcblx0XHRcdHN0b3JhZ2VDb250YWluZXIgPSBuZXcgQWN0aXZlWE9iamVjdCgnaHRtbGZpbGUnKVxuXHRcdFx0c3RvcmFnZUNvbnRhaW5lci5vcGVuKClcblx0XHRcdHN0b3JhZ2VDb250YWluZXIud3JpdGUoJzwnK3NjcmlwdFRhZysnPmRvY3VtZW50Lnc9d2luZG93PC8nK3NjcmlwdFRhZysnPjxpZnJhbWUgc3JjPVwiL2Zhdmljb24uaWNvXCI+PC9pZnJhbWU+Jylcblx0XHRcdHN0b3JhZ2VDb250YWluZXIuY2xvc2UoKVxuXHRcdFx0c3RvcmFnZU93bmVyID0gc3RvcmFnZUNvbnRhaW5lci53LmZyYW1lc1swXS5kb2N1bWVudFxuXHRcdFx0c3RvcmFnZSA9IHN0b3JhZ2VPd25lci5jcmVhdGVFbGVtZW50KCdkaXYnKVxuXHRcdH0gY2F0Y2goZSkge1xuXHRcdFx0Ly8gc29tZWhvdyBBY3RpdmVYT2JqZWN0IGluc3RhbnRpYXRpb24gZmFpbGVkIChwZXJoYXBzIHNvbWUgc3BlY2lhbFxuXHRcdFx0Ly8gc2VjdXJpdHkgc2V0dGluZ3Mgb3Igb3RoZXJ3c2UpLCBmYWxsIGJhY2sgdG8gcGVyLXBhdGggc3RvcmFnZVxuXHRcdFx0c3RvcmFnZSA9IGRvYy5jcmVhdGVFbGVtZW50KCdkaXYnKVxuXHRcdFx0c3RvcmFnZU93bmVyID0gZG9jLmJvZHlcblx0XHR9XG5cdFx0dmFyIHdpdGhJRVN0b3JhZ2UgPSBmdW5jdGlvbihzdG9yZUZ1bmN0aW9uKSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKVxuXHRcdFx0XHRhcmdzLnVuc2hpZnQoc3RvcmFnZSlcblx0XHRcdFx0Ly8gU2VlIGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9tczUzMTA4MSh2PVZTLjg1KS5hc3B4XG5cdFx0XHRcdC8vIGFuZCBodHRwOi8vbXNkbi5taWNyb3NvZnQuY29tL2VuLXVzL2xpYnJhcnkvbXM1MzE0MjQodj1WUy44NSkuYXNweFxuXHRcdFx0XHRzdG9yYWdlT3duZXIuYXBwZW5kQ2hpbGQoc3RvcmFnZSlcblx0XHRcdFx0c3RvcmFnZS5hZGRCZWhhdmlvcignI2RlZmF1bHQjdXNlckRhdGEnKVxuXHRcdFx0XHRzdG9yYWdlLmxvYWQobG9jYWxTdG9yYWdlTmFtZSlcblx0XHRcdFx0dmFyIHJlc3VsdCA9IHN0b3JlRnVuY3Rpb24uYXBwbHkoc3RvcmUsIGFyZ3MpXG5cdFx0XHRcdHN0b3JhZ2VPd25lci5yZW1vdmVDaGlsZChzdG9yYWdlKVxuXHRcdFx0XHRyZXR1cm4gcmVzdWx0XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gSW4gSUU3LCBrZXlzIGNhbm5vdCBzdGFydCB3aXRoIGEgZGlnaXQgb3IgY29udGFpbiBjZXJ0YWluIGNoYXJzLlxuXHRcdC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vbWFyY3Vzd2VzdGluL3N0b3JlLmpzL2lzc3Vlcy80MFxuXHRcdC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vbWFyY3Vzd2VzdGluL3N0b3JlLmpzL2lzc3Vlcy84M1xuXHRcdHZhciBmb3JiaWRkZW5DaGFyc1JlZ2V4ID0gbmV3IFJlZ0V4cChcIlshXFxcIiMkJSYnKCkqKywvXFxcXFxcXFw6Ozw9Pj9AW1xcXFxdXmB7fH1+XVwiLCBcImdcIilcblx0XHR2YXIgaWVLZXlGaXggPSBmdW5jdGlvbihrZXkpIHtcblx0XHRcdHJldHVybiBrZXkucmVwbGFjZSgvXmQvLCAnX19fJCYnKS5yZXBsYWNlKGZvcmJpZGRlbkNoYXJzUmVnZXgsICdfX18nKVxuXHRcdH1cblx0XHRzdG9yZS5zZXQgPSB3aXRoSUVTdG9yYWdlKGZ1bmN0aW9uKHN0b3JhZ2UsIGtleSwgdmFsKSB7XG5cdFx0XHRrZXkgPSBpZUtleUZpeChrZXkpXG5cdFx0XHRpZiAodmFsID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHN0b3JlLnJlbW92ZShrZXkpIH1cblx0XHRcdHN0b3JhZ2Uuc2V0QXR0cmlidXRlKGtleSwgc3RvcmUuc2VyaWFsaXplKHZhbCkpXG5cdFx0XHRzdG9yYWdlLnNhdmUobG9jYWxTdG9yYWdlTmFtZSlcblx0XHRcdHJldHVybiB2YWxcblx0XHR9KVxuXHRcdHN0b3JlLmdldCA9IHdpdGhJRVN0b3JhZ2UoZnVuY3Rpb24oc3RvcmFnZSwga2V5LCBkZWZhdWx0VmFsKSB7XG5cdFx0XHRrZXkgPSBpZUtleUZpeChrZXkpXG5cdFx0XHR2YXIgdmFsID0gc3RvcmUuZGVzZXJpYWxpemUoc3RvcmFnZS5nZXRBdHRyaWJ1dGUoa2V5KSlcblx0XHRcdHJldHVybiAodmFsID09PSB1bmRlZmluZWQgPyBkZWZhdWx0VmFsIDogdmFsKVxuXHRcdH0pXG5cdFx0c3RvcmUucmVtb3ZlID0gd2l0aElFU3RvcmFnZShmdW5jdGlvbihzdG9yYWdlLCBrZXkpIHtcblx0XHRcdGtleSA9IGllS2V5Rml4KGtleSlcblx0XHRcdHN0b3JhZ2UucmVtb3ZlQXR0cmlidXRlKGtleSlcblx0XHRcdHN0b3JhZ2Uuc2F2ZShsb2NhbFN0b3JhZ2VOYW1lKVxuXHRcdH0pXG5cdFx0c3RvcmUuY2xlYXIgPSB3aXRoSUVTdG9yYWdlKGZ1bmN0aW9uKHN0b3JhZ2UpIHtcblx0XHRcdHZhciBhdHRyaWJ1dGVzID0gc3RvcmFnZS5YTUxEb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuYXR0cmlidXRlc1xuXHRcdFx0c3RvcmFnZS5sb2FkKGxvY2FsU3RvcmFnZU5hbWUpXG5cdFx0XHRmb3IgKHZhciBpPWF0dHJpYnV0ZXMubGVuZ3RoLTE7IGk+PTA7IGktLSkge1xuXHRcdFx0XHRzdG9yYWdlLnJlbW92ZUF0dHJpYnV0ZShhdHRyaWJ1dGVzW2ldLm5hbWUpXG5cdFx0XHR9XG5cdFx0XHRzdG9yYWdlLnNhdmUobG9jYWxTdG9yYWdlTmFtZSlcblx0XHR9KVxuXHRcdHN0b3JlLmdldEFsbCA9IGZ1bmN0aW9uKHN0b3JhZ2UpIHtcblx0XHRcdHZhciByZXQgPSB7fVxuXHRcdFx0c3RvcmUuZm9yRWFjaChmdW5jdGlvbihrZXksIHZhbCkge1xuXHRcdFx0XHRyZXRba2V5XSA9IHZhbFxuXHRcdFx0fSlcblx0XHRcdHJldHVybiByZXRcblx0XHR9XG5cdFx0c3RvcmUuZm9yRWFjaCA9IHdpdGhJRVN0b3JhZ2UoZnVuY3Rpb24oc3RvcmFnZSwgY2FsbGJhY2spIHtcblx0XHRcdHZhciBhdHRyaWJ1dGVzID0gc3RvcmFnZS5YTUxEb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuYXR0cmlidXRlc1xuXHRcdFx0Zm9yICh2YXIgaT0wLCBhdHRyOyBhdHRyPWF0dHJpYnV0ZXNbaV07ICsraSkge1xuXHRcdFx0XHRjYWxsYmFjayhhdHRyLm5hbWUsIHN0b3JlLmRlc2VyaWFsaXplKHN0b3JhZ2UuZ2V0QXR0cmlidXRlKGF0dHIubmFtZSkpKVxuXHRcdFx0fVxuXHRcdH0pXG5cdH1cblxuXHR0cnkge1xuXHRcdHZhciB0ZXN0S2V5ID0gJ19fc3RvcmVqc19fJ1xuXHRcdHN0b3JlLnNldCh0ZXN0S2V5LCB0ZXN0S2V5KVxuXHRcdGlmIChzdG9yZS5nZXQodGVzdEtleSkgIT0gdGVzdEtleSkgeyBzdG9yZS5kaXNhYmxlZCA9IHRydWUgfVxuXHRcdHN0b3JlLnJlbW92ZSh0ZXN0S2V5KVxuXHR9IGNhdGNoKGUpIHtcblx0XHRzdG9yZS5kaXNhYmxlZCA9IHRydWVcblx0fVxuXHRzdG9yZS5lbmFibGVkID0gIXN0b3JlLmRpc2FibGVkXG5cdFxuXHRyZXR1cm4gc3RvcmVcbn0pKTtcbiIsInZhciBBZGFwdGVycywgU3RvcmFnZSwgdXRpbHMsXG4gIGJpbmQgPSBmdW5jdGlvbihmbiwgbWUpeyByZXR1cm4gZnVuY3Rpb24oKXsgcmV0dXJuIGZuLmFwcGx5KG1lLCBhcmd1bWVudHMpOyB9OyB9O1xuXG51dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxuU3RvcmFnZSA9IHJlcXVpcmUoJy4vc3RvcmFnZScpO1xuXG5BZGFwdGVycyA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gQWRhcHRlcnMoKSB7fVxuXG4gIEFkYXB0ZXJzLkdpbWVsQWRhcHRlciA9IChmdW5jdGlvbigpIHtcbiAgICBHaW1lbEFkYXB0ZXIucHJvdG90eXBlLnF1ZXVlX25hbWUgPSAnX2dpbWVsX3F1ZXVlJztcblxuICAgIGZ1bmN0aW9uIEdpbWVsQWRhcHRlcih1cmwsIG5hbWVzcGFjZSwgc3RvcmFnZSkge1xuICAgICAgaWYgKHN0b3JhZ2UgPT0gbnVsbCkge1xuICAgICAgICBzdG9yYWdlID0gQWRhcHRlcnMuTG9jYWxTdG9yYWdlQWRhcHRlcjtcbiAgICAgIH1cbiAgICAgIHRoaXMuZ29hbF9jb21wbGV0ZSA9IGJpbmQodGhpcy5nb2FsX2NvbXBsZXRlLCB0aGlzKTtcbiAgICAgIHRoaXMuZXhwZXJpbWVudF9zdGFydCA9IGJpbmQodGhpcy5leHBlcmltZW50X3N0YXJ0LCB0aGlzKTtcbiAgICAgIHRoaXMuX3N0b3JhZ2UgPSBzdG9yYWdlO1xuICAgICAgdGhpcy51cmwgPSB1cmw7XG4gICAgICB0aGlzLm5hbWVzcGFjZSA9IG5hbWVzcGFjZTtcbiAgICAgIHRoaXMuX3F1ZXVlID0gSlNPTi5wYXJzZSh0aGlzLl9zdG9yYWdlLmdldCh0aGlzLnF1ZXVlX25hbWUpIHx8ICdbXScpO1xuICAgICAgdGhpcy5fZmx1c2goKTtcbiAgICB9XG5cbiAgICBHaW1lbEFkYXB0ZXIucHJvdG90eXBlLl9yZW1vdmVfcXV1aWQgPSBmdW5jdGlvbihxdXVpZCkge1xuICAgICAgcmV0dXJuIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZXJyLCByZXMpIHtcbiAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIHV0aWxzLnJlbW92ZShfdGhpcy5fcXVldWUsIGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgICAgICByZXR1cm4gZWwucHJvcGVydGllcy5fcXV1aWQgPT09IHF1dWlkO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBfdGhpcy5fc3RvcmFnZS5zZXQoX3RoaXMucXVldWVfbmFtZSwgSlNPTi5zdHJpbmdpZnkoX3RoaXMuX3F1ZXVlKSk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKTtcbiAgICB9O1xuXG4gICAgR2ltZWxBZGFwdGVyLnByb3RvdHlwZS5fanF1ZXJ5X2dldCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgIHV0aWxzLmxvZygnc2VuZCByZXF1ZXN0IHVzaW5nIGpRdWVyeScpO1xuICAgICAgcmV0dXJuIHdpbmRvdy5qUXVlcnkuYWpheCh7XG4gICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgIHVybDogdXJsLFxuICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICBzdWNjZXNzOiBjYWxsYmFja1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIEdpbWVsQWRhcHRlci5wcm90b3R5cGUuX3BsYWluX2pzX2dldCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgIHZhciBrLCBwYXJhbXMsIHYsIHhocjtcbiAgICAgIHV0aWxzLmxvZygnZmFsbGJhY2sgb24gcGxhaW4ganMgeGhyJyk7XG4gICAgICB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgIHBhcmFtcyA9IChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlc3VsdHM7XG4gICAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgICAgZm9yIChrIGluIGRhdGEpIHtcbiAgICAgICAgICB2ID0gZGF0YVtrXTtcbiAgICAgICAgICByZXN1bHRzLnB1c2goKGVuY29kZVVSSUNvbXBvbmVudChrKSkgKyBcIj1cIiArIChlbmNvZGVVUklDb21wb25lbnQodikpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgIH0pKCk7XG4gICAgICBwYXJhbXMgPSBwYXJhbXMuam9pbignJicpLnJlcGxhY2UoLyUyMC9nLCAnKycpO1xuICAgICAgeGhyLm9wZW4oJ0dFVCcsIHVybCArIFwiP1wiICsgcGFyYW1zKTtcbiAgICAgIHhoci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHhoci5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgIHJldHVybiBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgcmV0dXJuIHhoci5zZW5kKCk7XG4gICAgfTtcblxuICAgIEdpbWVsQWRhcHRlci5wcm90b3R5cGUuX2FqYXhfZ2V0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBjYWxsYmFjaykge1xuICAgICAgdmFyIHJlZjtcbiAgICAgIGlmICgocmVmID0gd2luZG93LmpRdWVyeSkgIT0gbnVsbCA/IHJlZi5hamF4IDogdm9pZCAwKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9qcXVlcnlfZ2V0KHVybCwgZGF0YSwgY2FsbGJhY2spO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BsYWluX2pzX2dldCh1cmwsIGRhdGEsIGNhbGxiYWNrKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgR2ltZWxBZGFwdGVyLnByb3RvdHlwZS5fZmx1c2ggPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjYWxsYmFjaywgaSwgaXRlbSwgbGVuLCByZWYsIHJlc3VsdHM7XG4gICAgICByZWYgPSB0aGlzLl9xdWV1ZTtcbiAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoaSA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBpdGVtID0gcmVmW2ldO1xuICAgICAgICBjYWxsYmFjayA9IHRoaXMuX3JlbW92ZV9xdXVpZChpdGVtLnByb3BlcnRpZXMuX3F1dWlkKTtcbiAgICAgICAgdGhpcy5fYWpheF9nZXQodGhpcy51cmwsIHV0aWxzLm9taXQoaXRlbS5wcm9wZXJ0aWVzLCAnX3F1dWlkJyksIGNhbGxiYWNrKTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKG51bGwpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfTtcblxuICAgIEdpbWVsQWRhcHRlci5wcm90b3R5cGUuX3VzZXJfdXVpZCA9IGZ1bmN0aW9uKGV4cGVyaW1lbnQsIGdvYWwpIHtcbiAgICAgIGlmICghZXhwZXJpbWVudC51c2VyX2lkKSB7XG4gICAgICAgIHJldHVybiB1dGlscy51dWlkKCk7XG4gICAgICB9XG4gICAgICBpZiAoIWdvYWwudW5pcXVlKSB7XG4gICAgICAgIHJldHVybiB1dGlscy51dWlkKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdXRpbHMuc2hhMSh0aGlzLm5hbWVzcGFjZSArIFwiLlwiICsgZXhwZXJpbWVudC5uYW1lICsgXCIuXCIgKyBleHBlcmltZW50LnVzZXJfaWQpO1xuICAgIH07XG5cbiAgICBHaW1lbEFkYXB0ZXIucHJvdG90eXBlLl90cmFjayA9IGZ1bmN0aW9uKGV4cGVyaW1lbnQsIHZhcmlhbnQsIGdvYWwpIHtcbiAgICAgIHV0aWxzLmxvZyhcIlBlcnNpc3RlbnQgUXVldWUgR2ltZWwgdHJhY2s6IFwiICsgdGhpcy5uYW1lc3BhY2UgKyBcIiwgXCIgKyBleHBlcmltZW50Lm5hbWUgKyBcIiwgXCIgKyB2YXJpYW50ICsgXCIsIFwiICsgZ29hbC5uYW1lKTtcbiAgICAgIGlmICh0aGlzLl9xdWV1ZS5sZW5ndGggPiAxMDApIHtcbiAgICAgICAgdGhpcy5fcXVldWUuc2hpZnQoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3F1ZXVlLnB1c2goe1xuICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgZXhwZXJpbWVudDogZXhwZXJpbWVudC5uYW1lLFxuICAgICAgICAgIF9xdXVpZDogdXRpbHMudXVpZCgpLFxuICAgICAgICAgIHV1aWQ6IHRoaXMuX3VzZXJfdXVpZChleHBlcmltZW50LCBnb2FsKSxcbiAgICAgICAgICB2YXJpYW50OiB2YXJpYW50LFxuICAgICAgICAgIGV2ZW50OiBnb2FsLm5hbWUsXG4gICAgICAgICAgbmFtZXNwYWNlOiB0aGlzLm5hbWVzcGFjZVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX3N0b3JhZ2Uuc2V0KHRoaXMucXVldWVfbmFtZSwgSlNPTi5zdHJpbmdpZnkodGhpcy5fcXVldWUpKTtcbiAgICAgIHJldHVybiB0aGlzLl9mbHVzaCgpO1xuICAgIH07XG5cbiAgICBHaW1lbEFkYXB0ZXIucHJvdG90eXBlLmV4cGVyaW1lbnRfc3RhcnQgPSBmdW5jdGlvbihleHBlcmltZW50LCB2YXJpYW50KSB7XG4gICAgICByZXR1cm4gdGhpcy5fdHJhY2soZXhwZXJpbWVudCwgdmFyaWFudCwge1xuICAgICAgICBuYW1lOiAncGFydGljaXBhdGUnLFxuICAgICAgICB1bmlxdWU6IHRydWVcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBHaW1lbEFkYXB0ZXIucHJvdG90eXBlLmdvYWxfY29tcGxldGUgPSBmdW5jdGlvbihleHBlcmltZW50LCB2YXJpYW50LCBnb2FsX25hbWUsIHByb3BzKSB7XG4gICAgICByZXR1cm4gdGhpcy5fdHJhY2soZXhwZXJpbWVudCwgdmFyaWFudCwgdXRpbHMuZGVmYXVsdHMoe1xuICAgICAgICBuYW1lOiBnb2FsX25hbWVcbiAgICAgIH0sIHByb3BzKSk7XG4gICAgfTtcblxuICAgIHJldHVybiBHaW1lbEFkYXB0ZXI7XG5cbiAgfSkoKTtcblxuICBBZGFwdGVycy5QZXJzaXN0ZW50UXVldWVHb29nbGVBbmFseXRpY3NBZGFwdGVyID0gKGZ1bmN0aW9uKCkge1xuICAgIFBlcnNpc3RlbnRRdWV1ZUdvb2dsZUFuYWx5dGljc0FkYXB0ZXIucHJvdG90eXBlLm5hbWVzcGFjZSA9ICdhbGVwaGJldCc7XG5cbiAgICBQZXJzaXN0ZW50UXVldWVHb29nbGVBbmFseXRpY3NBZGFwdGVyLnByb3RvdHlwZS5xdWV1ZV9uYW1lID0gJ19nYV9xdWV1ZSc7XG5cbiAgICBmdW5jdGlvbiBQZXJzaXN0ZW50UXVldWVHb29nbGVBbmFseXRpY3NBZGFwdGVyKHN0b3JhZ2UpIHtcbiAgICAgIGlmIChzdG9yYWdlID09IG51bGwpIHtcbiAgICAgICAgc3RvcmFnZSA9IEFkYXB0ZXJzLkxvY2FsU3RvcmFnZUFkYXB0ZXI7XG4gICAgICB9XG4gICAgICB0aGlzLmdvYWxfY29tcGxldGUgPSBiaW5kKHRoaXMuZ29hbF9jb21wbGV0ZSwgdGhpcyk7XG4gICAgICB0aGlzLmV4cGVyaW1lbnRfc3RhcnQgPSBiaW5kKHRoaXMuZXhwZXJpbWVudF9zdGFydCwgdGhpcyk7XG4gICAgICB0aGlzLl9zdG9yYWdlID0gc3RvcmFnZTtcbiAgICAgIHRoaXMuX3F1ZXVlID0gSlNPTi5wYXJzZSh0aGlzLl9zdG9yYWdlLmdldCh0aGlzLnF1ZXVlX25hbWUpIHx8ICdbXScpO1xuICAgICAgdGhpcy5fZmx1c2goKTtcbiAgICB9XG5cbiAgICBQZXJzaXN0ZW50UXVldWVHb29nbGVBbmFseXRpY3NBZGFwdGVyLnByb3RvdHlwZS5fcmVtb3ZlX3V1aWQgPSBmdW5jdGlvbih1dWlkKSB7XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICB1dGlscy5yZW1vdmUoX3RoaXMuX3F1ZXVlLCBmdW5jdGlvbihlbCkge1xuICAgICAgICAgICAgcmV0dXJuIGVsLnV1aWQgPT09IHV1aWQ7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLl9zdG9yYWdlLnNldChfdGhpcy5xdWV1ZV9uYW1lLCBKU09OLnN0cmluZ2lmeShfdGhpcy5fcXVldWUpKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpO1xuICAgIH07XG5cbiAgICBQZXJzaXN0ZW50UXVldWVHb29nbGVBbmFseXRpY3NBZGFwdGVyLnByb3RvdHlwZS5fZmx1c2ggPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjYWxsYmFjaywgaSwgaXRlbSwgbGVuLCByZWYsIHJlc3VsdHM7XG4gICAgICBpZiAodHlwZW9mIGdhICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRocm93ICdnYSBub3QgZGVmaW5lZC4gUGxlYXNlIG1ha2Ugc3VyZSB5b3VyIFVuaXZlcnNhbCBhbmFseXRpY3MgaXMgc2V0IHVwIGNvcnJlY3RseSc7XG4gICAgICB9XG4gICAgICByZWYgPSB0aGlzLl9xdWV1ZTtcbiAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoaSA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBpdGVtID0gcmVmW2ldO1xuICAgICAgICBjYWxsYmFjayA9IHRoaXMuX3JlbW92ZV91dWlkKGl0ZW0udXVpZCk7XG4gICAgICAgIHJlc3VsdHMucHVzaChnYSgnc2VuZCcsICdldmVudCcsIGl0ZW0uY2F0ZWdvcnksIGl0ZW0uYWN0aW9uLCBpdGVtLmxhYmVsLCB7XG4gICAgICAgICAgJ2hpdENhbGxiYWNrJzogY2FsbGJhY2ssXG4gICAgICAgICAgJ25vbkludGVyYWN0aW9uJzogMVxuICAgICAgICB9KSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9O1xuXG4gICAgUGVyc2lzdGVudFF1ZXVlR29vZ2xlQW5hbHl0aWNzQWRhcHRlci5wcm90b3R5cGUuX3RyYWNrID0gZnVuY3Rpb24oY2F0ZWdvcnksIGFjdGlvbiwgbGFiZWwpIHtcbiAgICAgIHV0aWxzLmxvZyhcIlBlcnNpc3RlbnQgUXVldWUgR29vZ2xlIFVuaXZlcnNhbCBBbmFseXRpY3MgdHJhY2s6IFwiICsgY2F0ZWdvcnkgKyBcIiwgXCIgKyBhY3Rpb24gKyBcIiwgXCIgKyBsYWJlbCk7XG4gICAgICBpZiAodGhpcy5fcXVldWUubGVuZ3RoID4gMTAwKSB7XG4gICAgICAgIHRoaXMuX3F1ZXVlLnNoaWZ0KCk7XG4gICAgICB9XG4gICAgICB0aGlzLl9xdWV1ZS5wdXNoKHtcbiAgICAgICAgdXVpZDogdXRpbHMudXVpZCgpLFxuICAgICAgICBjYXRlZ29yeTogY2F0ZWdvcnksXG4gICAgICAgIGFjdGlvbjogYWN0aW9uLFxuICAgICAgICBsYWJlbDogbGFiZWxcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fc3RvcmFnZS5zZXQodGhpcy5xdWV1ZV9uYW1lLCBKU09OLnN0cmluZ2lmeSh0aGlzLl9xdWV1ZSkpO1xuICAgICAgcmV0dXJuIHRoaXMuX2ZsdXNoKCk7XG4gICAgfTtcblxuICAgIFBlcnNpc3RlbnRRdWV1ZUdvb2dsZUFuYWx5dGljc0FkYXB0ZXIucHJvdG90eXBlLmV4cGVyaW1lbnRfc3RhcnQgPSBmdW5jdGlvbihleHBlcmltZW50LCB2YXJpYW50KSB7XG4gICAgICByZXR1cm4gdGhpcy5fdHJhY2sodGhpcy5uYW1lc3BhY2UsIGV4cGVyaW1lbnQubmFtZSArIFwiIHwgXCIgKyB2YXJpYW50LCAnVmlzaXRvcnMnKTtcbiAgICB9O1xuXG4gICAgUGVyc2lzdGVudFF1ZXVlR29vZ2xlQW5hbHl0aWNzQWRhcHRlci5wcm90b3R5cGUuZ29hbF9jb21wbGV0ZSA9IGZ1bmN0aW9uKGV4cGVyaW1lbnQsIHZhcmlhbnQsIGdvYWxfbmFtZSwgX3Byb3BzKSB7XG4gICAgICByZXR1cm4gdGhpcy5fdHJhY2sodGhpcy5uYW1lc3BhY2UsIGV4cGVyaW1lbnQubmFtZSArIFwiIHwgXCIgKyB2YXJpYW50LCBnb2FsX25hbWUpO1xuICAgIH07XG5cbiAgICByZXR1cm4gUGVyc2lzdGVudFF1ZXVlR29vZ2xlQW5hbHl0aWNzQWRhcHRlcjtcblxuICB9KSgpO1xuXG4gIEFkYXB0ZXJzLlBlcnNpc3RlbnRRdWV1ZUtlZW5BZGFwdGVyID0gKGZ1bmN0aW9uKCkge1xuICAgIFBlcnNpc3RlbnRRdWV1ZUtlZW5BZGFwdGVyLnByb3RvdHlwZS5xdWV1ZV9uYW1lID0gJ19rZWVuX3F1ZXVlJztcblxuICAgIGZ1bmN0aW9uIFBlcnNpc3RlbnRRdWV1ZUtlZW5BZGFwdGVyKGtlZW5fY2xpZW50LCBzdG9yYWdlKSB7XG4gICAgICBpZiAoc3RvcmFnZSA9PSBudWxsKSB7XG4gICAgICAgIHN0b3JhZ2UgPSBBZGFwdGVycy5Mb2NhbFN0b3JhZ2VBZGFwdGVyO1xuICAgICAgfVxuICAgICAgdGhpcy5nb2FsX2NvbXBsZXRlID0gYmluZCh0aGlzLmdvYWxfY29tcGxldGUsIHRoaXMpO1xuICAgICAgdGhpcy5leHBlcmltZW50X3N0YXJ0ID0gYmluZCh0aGlzLmV4cGVyaW1lbnRfc3RhcnQsIHRoaXMpO1xuICAgICAgdGhpcy5jbGllbnQgPSBrZWVuX2NsaWVudDtcbiAgICAgIHRoaXMuX3N0b3JhZ2UgPSBzdG9yYWdlO1xuICAgICAgdGhpcy5fcXVldWUgPSBKU09OLnBhcnNlKHRoaXMuX3N0b3JhZ2UuZ2V0KHRoaXMucXVldWVfbmFtZSkgfHwgJ1tdJyk7XG4gICAgICB0aGlzLl9mbHVzaCgpO1xuICAgIH1cblxuICAgIFBlcnNpc3RlbnRRdWV1ZUtlZW5BZGFwdGVyLnByb3RvdHlwZS5fcmVtb3ZlX3F1dWlkID0gZnVuY3Rpb24ocXV1aWQpIHtcbiAgICAgIHJldHVybiAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGVyciwgcmVzKSB7XG4gICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICB1dGlscy5yZW1vdmUoX3RoaXMuX3F1ZXVlLCBmdW5jdGlvbihlbCkge1xuICAgICAgICAgICAgcmV0dXJuIGVsLnByb3BlcnRpZXMuX3F1dWlkID09PSBxdXVpZDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gX3RoaXMuX3N0b3JhZ2Uuc2V0KF90aGlzLnF1ZXVlX25hbWUsIEpTT04uc3RyaW5naWZ5KF90aGlzLl9xdWV1ZSkpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcyk7XG4gICAgfTtcblxuICAgIFBlcnNpc3RlbnRRdWV1ZUtlZW5BZGFwdGVyLnByb3RvdHlwZS5fZmx1c2ggPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjYWxsYmFjaywgaSwgaXRlbSwgbGVuLCByZWYsIHJlc3VsdHM7XG4gICAgICByZWYgPSB0aGlzLl9xdWV1ZTtcbiAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoaSA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBpdGVtID0gcmVmW2ldO1xuICAgICAgICBjYWxsYmFjayA9IHRoaXMuX3JlbW92ZV9xdXVpZChpdGVtLnByb3BlcnRpZXMuX3F1dWlkKTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKHRoaXMuY2xpZW50LmFkZEV2ZW50KGl0ZW0uZXhwZXJpbWVudF9uYW1lLCB1dGlscy5vbWl0KGl0ZW0ucHJvcGVydGllcywgJ19xdXVpZCcpLCBjYWxsYmFjaykpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfTtcblxuICAgIFBlcnNpc3RlbnRRdWV1ZUtlZW5BZGFwdGVyLnByb3RvdHlwZS5fdXNlcl91dWlkID0gZnVuY3Rpb24oZXhwZXJpbWVudCwgZ29hbCkge1xuICAgICAgaWYgKCFleHBlcmltZW50LnVzZXJfaWQpIHtcbiAgICAgICAgcmV0dXJuIHV0aWxzLnV1aWQoKTtcbiAgICAgIH1cbiAgICAgIGlmICghZ29hbC51bmlxdWUpIHtcbiAgICAgICAgcmV0dXJuIHV0aWxzLnV1aWQoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB1dGlscy5zaGExKHRoaXMubmFtZXNwYWNlICsgXCIuXCIgKyBleHBlcmltZW50Lm5hbWUgKyBcIi5cIiArIGV4cGVyaW1lbnQudXNlcl9pZCk7XG4gICAgfTtcblxuICAgIFBlcnNpc3RlbnRRdWV1ZUtlZW5BZGFwdGVyLnByb3RvdHlwZS5fdHJhY2sgPSBmdW5jdGlvbihleHBlcmltZW50LCB2YXJpYW50LCBnb2FsKSB7XG4gICAgICB1dGlscy5sb2coXCJQZXJzaXN0ZW50IFF1ZXVlIEtlZW4gdHJhY2s6IFwiICsgZXhwZXJpbWVudC5uYW1lICsgXCIsIFwiICsgdmFyaWFudCArIFwiLCBcIiArIGV2ZW50KTtcbiAgICAgIGlmICh0aGlzLl9xdWV1ZS5sZW5ndGggPiAxMDApIHtcbiAgICAgICAgdGhpcy5fcXVldWUuc2hpZnQoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3F1ZXVlLnB1c2goe1xuICAgICAgICBleHBlcmltZW50X25hbWU6IGV4cGVyaW1lbnQubmFtZSxcbiAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgIF9xdXVpZDogdXRpbHMudXVpZCgpLFxuICAgICAgICAgIHV1aWQ6IHRoaXMuX3VzZXJfdXVpZChleHBlcmltZW50LCBnb2FsKSxcbiAgICAgICAgICB2YXJpYW50OiB2YXJpYW50LFxuICAgICAgICAgIGV2ZW50OiBnb2FsLm5hbWVcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB0aGlzLl9zdG9yYWdlLnNldCh0aGlzLnF1ZXVlX25hbWUsIEpTT04uc3RyaW5naWZ5KHRoaXMuX3F1ZXVlKSk7XG4gICAgICByZXR1cm4gdGhpcy5fZmx1c2goKTtcbiAgICB9O1xuXG4gICAgUGVyc2lzdGVudFF1ZXVlS2VlbkFkYXB0ZXIucHJvdG90eXBlLmV4cGVyaW1lbnRfc3RhcnQgPSBmdW5jdGlvbihleHBlcmltZW50LCB2YXJpYW50KSB7XG4gICAgICByZXR1cm4gdGhpcy5fdHJhY2soZXhwZXJpbWVudCwgdmFyaWFudCwge1xuICAgICAgICBuYW1lOiAncGFydGljaXBhdGUnLFxuICAgICAgICB1bmlxdWU6IHRydWVcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBQZXJzaXN0ZW50UXVldWVLZWVuQWRhcHRlci5wcm90b3R5cGUuZ29hbF9jb21wbGV0ZSA9IGZ1bmN0aW9uKGV4cGVyaW1lbnQsIHZhcmlhbnQsIGdvYWxfbmFtZSwgcHJvcHMpIHtcbiAgICAgIHJldHVybiB0aGlzLl90cmFjayhleHBlcmltZW50LCB2YXJpYW50LCB1dGlscy5kZWZhdWx0cyh7XG4gICAgICAgIG5hbWU6IGdvYWxfbmFtZVxuICAgICAgfSwgcHJvcHMpKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIFBlcnNpc3RlbnRRdWV1ZUtlZW5BZGFwdGVyO1xuXG4gIH0pKCk7XG5cbiAgQWRhcHRlcnMuR29vZ2xlVW5pdmVyc2FsQW5hbHl0aWNzQWRhcHRlciA9IChmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBHb29nbGVVbml2ZXJzYWxBbmFseXRpY3NBZGFwdGVyKCkge31cblxuICAgIEdvb2dsZVVuaXZlcnNhbEFuYWx5dGljc0FkYXB0ZXIubmFtZXNwYWNlID0gJ2FsZXBoYmV0JztcblxuICAgIEdvb2dsZVVuaXZlcnNhbEFuYWx5dGljc0FkYXB0ZXIuX3RyYWNrID0gZnVuY3Rpb24oY2F0ZWdvcnksIGFjdGlvbiwgbGFiZWwpIHtcbiAgICAgIHV0aWxzLmxvZyhcIkdvb2dsZSBVbml2ZXJzYWwgQW5hbHl0aWNzIHRyYWNrOiBcIiArIGNhdGVnb3J5ICsgXCIsIFwiICsgYWN0aW9uICsgXCIsIFwiICsgbGFiZWwpO1xuICAgICAgaWYgKHR5cGVvZiBnYSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aHJvdyAnZ2Egbm90IGRlZmluZWQuIFBsZWFzZSBtYWtlIHN1cmUgeW91ciBVbml2ZXJzYWwgYW5hbHl0aWNzIGlzIHNldCB1cCBjb3JyZWN0bHknO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGdhKCdzZW5kJywgJ2V2ZW50JywgY2F0ZWdvcnksIGFjdGlvbiwgbGFiZWwsIHtcbiAgICAgICAgJ25vbkludGVyYWN0aW9uJzogMVxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIEdvb2dsZVVuaXZlcnNhbEFuYWx5dGljc0FkYXB0ZXIuZXhwZXJpbWVudF9zdGFydCA9IGZ1bmN0aW9uKGV4cGVyaW1lbnQsIHZhcmlhbnQpIHtcbiAgICAgIHJldHVybiBHb29nbGVVbml2ZXJzYWxBbmFseXRpY3NBZGFwdGVyLl90cmFjayhHb29nbGVVbml2ZXJzYWxBbmFseXRpY3NBZGFwdGVyLm5hbWVzcGFjZSwgZXhwZXJpbWVudC5uYW1lICsgXCIgfCBcIiArIHZhcmlhbnQsICdWaXNpdG9ycycpO1xuICAgIH07XG5cbiAgICBHb29nbGVVbml2ZXJzYWxBbmFseXRpY3NBZGFwdGVyLmdvYWxfY29tcGxldGUgPSBmdW5jdGlvbihleHBlcmltZW50LCB2YXJpYW50LCBnb2FsX25hbWUsIF9wcm9wcykge1xuICAgICAgcmV0dXJuIEdvb2dsZVVuaXZlcnNhbEFuYWx5dGljc0FkYXB0ZXIuX3RyYWNrKEdvb2dsZVVuaXZlcnNhbEFuYWx5dGljc0FkYXB0ZXIubmFtZXNwYWNlLCBleHBlcmltZW50Lm5hbWUgKyBcIiB8IFwiICsgdmFyaWFudCwgZ29hbF9uYW1lKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIEdvb2dsZVVuaXZlcnNhbEFuYWx5dGljc0FkYXB0ZXI7XG5cbiAgfSkoKTtcblxuICBBZGFwdGVycy5Mb2NhbFN0b3JhZ2VBZGFwdGVyID0gKGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIExvY2FsU3RvcmFnZUFkYXB0ZXIoKSB7fVxuXG4gICAgTG9jYWxTdG9yYWdlQWRhcHRlci5uYW1lc3BhY2UgPSAnYWxlcGhiZXQnO1xuXG4gICAgTG9jYWxTdG9yYWdlQWRhcHRlci5zZXQgPSBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgICByZXR1cm4gbmV3IFN0b3JhZ2UodGhpcy5uYW1lc3BhY2UpLnNldChrZXksIHZhbHVlKTtcbiAgICB9O1xuXG4gICAgTG9jYWxTdG9yYWdlQWRhcHRlci5nZXQgPSBmdW5jdGlvbihrZXkpIHtcbiAgICAgIHJldHVybiBuZXcgU3RvcmFnZSh0aGlzLm5hbWVzcGFjZSkuZ2V0KGtleSk7XG4gICAgfTtcblxuICAgIHJldHVybiBMb2NhbFN0b3JhZ2VBZGFwdGVyO1xuXG4gIH0pKCk7XG5cbiAgcmV0dXJuIEFkYXB0ZXJzO1xuXG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFkYXB0ZXJzO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lMMmh2YldVdmVXOWhkaTlqYjJSbEwyRnNaWEJvWW1WMEwzTnlZeTloWkdGd2RHVnljeTVqYjJabVpXVWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUl2YUc5dFpTOTViMkYyTDJOdlpHVXZZV3hsY0doaVpYUXZjM0pqTDJGa1lYQjBaWEp6TG1OdlptWmxaU0pkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZCUVN4SlFVRkJMSGRDUVVGQk8wVkJRVUU3TzBGQlFVRXNTMEZCUVN4SFFVRlJMRTlCUVVFc1EwRkJVU3hUUVVGU096dEJRVU5TTEU5QlFVRXNSMEZCVlN4UFFVRkJMRU5CUVZFc1YwRkJVanM3UVVGRlNqczdPMFZCVVVVc1VVRkJReXhEUVVGQk96SkNRVU5NTEZWQlFVRXNSMEZCV1RzN1NVRkZReXh6UWtGQlF5eEhRVUZFTEVWQlFVMHNVMEZCVGl4RlFVRnBRaXhQUVVGcVFqczdVVUZCYVVJc1ZVRkJWU3hSUVVGUkxFTkJRVU03T3pzN1RVRkRMME1zU1VGQlF5eERRVUZCTEZGQlFVUXNSMEZCV1R0TlFVTmFMRWxCUVVNc1EwRkJRU3hIUVVGRUxFZEJRVTg3VFVGRFVDeEpRVUZETEVOQlFVRXNVMEZCUkN4SFFVRmhPMDFCUTJJc1NVRkJReXhEUVVGQkxFMUJRVVFzUjBGQlZTeEpRVUZKTEVOQlFVTXNTMEZCVEN4RFFVRlhMRWxCUVVNc1EwRkJRU3hSUVVGUkxFTkJRVU1zUjBGQlZpeERRVUZqTEVsQlFVTXNRMEZCUVN4VlFVRm1MRU5CUVVFc1NVRkJPRUlzU1VGQmVrTTdUVUZEVml4SlFVRkRMRU5CUVVFc1RVRkJSQ3hEUVVGQk8wbEJURmM3T3pKQ1FVOWlMR0ZCUVVFc1IwRkJaU3hUUVVGRExFdEJRVVE3WVVGRFlpeERRVUZCTEZOQlFVRXNTMEZCUVR0bFFVRkJMRk5CUVVNc1IwRkJSQ3hGUVVGTkxFZEJRVTQ3VlVGRFJTeEpRVUZWTEVkQlFWWTdRVUZCUVN4dFFrRkJRVHM3VlVGRFFTeExRVUZMTEVOQlFVTXNUVUZCVGl4RFFVRmhMRXRCUVVNc1EwRkJRU3hOUVVGa0xFVkJRWE5DTEZOQlFVTXNSVUZCUkR0dFFrRkJVU3hGUVVGRkxFTkJRVU1zVlVGQlZTeERRVUZETEUxQlFXUXNTMEZCZDBJN1ZVRkJhRU1zUTBGQmRFSTdhVUpCUTBFc1MwRkJReXhEUVVGQkxGRkJRVkVzUTBGQlF5eEhRVUZXTEVOQlFXTXNTMEZCUXl4RFFVRkJMRlZCUVdZc1JVRkJNa0lzU1VGQlNTeERRVUZETEZOQlFVd3NRMEZCWlN4TFFVRkRMRU5CUVVFc1RVRkJhRUlzUTBGQk0wSTdVVUZJUmp0TlFVRkJMRU5CUVVFc1EwRkJRU3hEUVVGQkxFbEJRVUU3U1VGRVlUczdNa0pCVFdZc1YwRkJRU3hIUVVGaExGTkJRVU1zUjBGQlJDeEZRVUZOTEVsQlFVNHNSVUZCV1N4UlFVRmFPMDFCUTFnc1MwRkJTeXhEUVVGRExFZEJRVTRzUTBGQlZTd3lRa0ZCVmp0aFFVTkJMRTFCUVUwc1EwRkJReXhOUVVGTkxFTkJRVU1zU1VGQlpDeERRVU5GTzFGQlFVRXNUVUZCUVN4RlFVRlJMRXRCUVZJN1VVRkRRU3hIUVVGQkxFVkJRVXNzUjBGRVREdFJRVVZCTEVsQlFVRXNSVUZCVFN4SlFVWk9PMUZCUjBFc1QwRkJRU3hGUVVGVExGRkJTRlE3VDBGRVJqdEpRVVpYT3pzeVFrRlJZaXhoUVVGQkxFZEJRV1VzVTBGQlF5eEhRVUZFTEVWQlFVMHNTVUZCVGl4RlFVRlpMRkZCUVZvN1FVRkRZaXhWUVVGQk8wMUJRVUVzUzBGQlN5eERRVUZETEVkQlFVNHNRMEZCVlN3d1FrRkJWanROUVVOQkxFZEJRVUVzUjBGQlRTeEpRVUZKTEdOQlFVb3NRMEZCUVR0TlFVTk9MRTFCUVVFN08wRkJRVlU3WVVGQlFTeFRRVUZCT3p0MVFrRkJSU3hEUVVGRExHdENRVUZCTEVOQlFXMUNMRU5CUVc1Q0xFTkJRVVFzUTBGQlFTeEhRVUYxUWl4SFFVRjJRaXhIUVVGNVFpeERRVUZETEd0Q1FVRkJMRU5CUVcxQ0xFTkJRVzVDTEVOQlFVUTdRVUZCTTBJN096dE5RVU5XTEUxQlFVRXNSMEZCVXl4TlFVRk5MRU5CUVVNc1NVRkJVQ3hEUVVGWkxFZEJRVm9zUTBGQlowSXNRMEZCUXl4UFFVRnFRaXhEUVVGNVFpeE5RVUY2UWl4RlFVRnBReXhIUVVGcVF6dE5RVU5VTEVkQlFVY3NRMEZCUXl4SlFVRktMRU5CUVZNc1MwRkJWQ3hGUVVGdFFpeEhRVUZFTEVkQlFVc3NSMEZCVEN4SFFVRlJMRTFCUVRGQ08wMUJRMEVzUjBGQlJ5eERRVUZETEUxQlFVb3NSMEZCWVN4VFFVRkJPMUZCUTFnc1NVRkJSeXhIUVVGSExFTkJRVU1zVFVGQlNpeExRVUZqTEVkQlFXcENPMmxDUVVORkxGRkJRVUVzUTBGQlFTeEZRVVJHT3p0TlFVUlhPMkZCUjJJc1IwRkJSeXhEUVVGRExFbEJRVW9zUTBGQlFUdEpRVlJoT3pzeVFrRlhaaXhUUVVGQkxFZEJRVmNzVTBGQlF5eEhRVUZFTEVWQlFVMHNTVUZCVGl4RlFVRlpMRkZCUVZvN1FVRkRWQ3hWUVVGQk8wMUJRVUVzZFVOQlFXZENMRU5CUVVVc1lVRkJiRUk3WlVGRFJTeEpRVUZETEVOQlFVRXNWMEZCUkN4RFFVRmhMRWRCUVdJc1JVRkJhMElzU1VGQmJFSXNSVUZCZDBJc1VVRkJlRUlzUlVGRVJqdFBRVUZCTEUxQlFVRTdaVUZIUlN4SlFVRkRMRU5CUVVFc1lVRkJSQ3hEUVVGbExFZEJRV1lzUlVGQmIwSXNTVUZCY0VJc1JVRkJNRUlzVVVGQk1VSXNSVUZJUmpzN1NVRkVVenM3TWtKQlRWZ3NUVUZCUVN4SFFVRlJMRk5CUVVFN1FVRkRUaXhWUVVGQk8wRkJRVUU3UVVGQlFUdFhRVUZCTEhGRFFVRkJPenRSUVVORkxGRkJRVUVzUjBGQlZ5eEpRVUZETEVOQlFVRXNZVUZCUkN4RFFVRmxMRWxCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU1zVFVGQkwwSTdVVUZEV0N4SlFVRkRMRU5CUVVFc1UwRkJSQ3hEUVVGWExFbEJRVU1zUTBGQlFTeEhRVUZhTEVWQlFXbENMRXRCUVVzc1EwRkJReXhKUVVGT0xFTkJRVmNzU1VGQlNTeERRVUZETEZWQlFXaENMRVZCUVRSQ0xGRkJRVFZDTEVOQlFXcENMRVZCUVhkRUxGRkJRWGhFTzNGQ1FVTkJPMEZCU0VZN08wbEJSRTA3T3pKQ1FVMVNMRlZCUVVFc1IwRkJXU3hUUVVGRExGVkJRVVFzUlVGQllTeEpRVUZpTzAxQlExWXNTVUZCUVN4RFFVRXlRaXhWUVVGVkxFTkJRVU1zVDBGQmRFTTdRVUZCUVN4bFFVRlBMRXRCUVVzc1EwRkJReXhKUVVGT0xFTkJRVUVzUlVGQlVEczdUVUZGUVN4SlFVRkJMRU5CUVRKQ0xFbEJRVWtzUTBGQlF5eE5RVUZvUXp0QlFVRkJMR1ZCUVU4c1MwRkJTeXhEUVVGRExFbEJRVTRzUTBGQlFTeEZRVUZRT3p0aFFVZEJMRXRCUVVzc1EwRkJReXhKUVVGT0xFTkJRV01zU1VGQlF5eERRVUZCTEZOQlFVWXNSMEZCV1N4SFFVRmFMRWRCUVdVc1ZVRkJWU3hEUVVGRExFbEJRVEZDTEVkQlFTdENMRWRCUVM5Q0xFZEJRV3RETEZWQlFWVXNRMEZCUXl4UFFVRXhSRHRKUVU1Vk96c3lRa0ZSV2l4TlFVRkJMRWRCUVZFc1UwRkJReXhWUVVGRUxFVkJRV0VzVDBGQllpeEZRVUZ6UWl4SlFVRjBRanROUVVOT0xFdEJRVXNzUTBGQlF5eEhRVUZPTEVOQlFWVXNaME5CUVVFc1IwRkJhVU1zU1VGQlF5eERRVUZCTEZOQlFXeERMRWRCUVRSRExFbEJRVFZETEVkQlFXZEVMRlZCUVZVc1EwRkJReXhKUVVFelJDeEhRVUZuUlN4SlFVRm9SU3hIUVVGdlJTeFBRVUZ3UlN4SFFVRTBSU3hKUVVFMVJTeEhRVUZuUml4SlFVRkpMRU5CUVVNc1NVRkJMMFk3VFVGRFFTeEpRVUZ0UWl4SlFVRkRMRU5CUVVFc1RVRkJUU3hEUVVGRExFMUJRVklzUjBGQmFVSXNSMEZCY0VNN1VVRkJRU3hKUVVGRExFTkJRVUVzVFVGQlRTeERRVUZETEV0QlFWSXNRMEZCUVN4RlFVRkJPenROUVVOQkxFbEJRVU1zUTBGQlFTeE5RVUZOTEVOQlFVTXNTVUZCVWl4RFFVTkZPMUZCUVVFc1ZVRkJRU3hGUVVORk8xVkJRVUVzVlVGQlFTeEZRVUZaTEZWQlFWVXNRMEZCUXl4SlFVRjJRanRWUVVOQkxFMUJRVUVzUlVGQlVTeExRVUZMTEVOQlFVTXNTVUZCVGl4RFFVRkJMRU5CUkZJN1ZVRkZRU3hKUVVGQkxFVkJRVTBzU1VGQlF5eERRVUZCTEZWQlFVUXNRMEZCV1N4VlFVRmFMRVZCUVhkQ0xFbEJRWGhDTEVOQlJrNDdWVUZIUVN4UFFVRkJMRVZCUVZNc1QwRklWRHRWUVVsQkxFdEJRVUVzUlVGQlR5eEpRVUZKTEVOQlFVTXNTVUZLV2p0VlFVdEJMRk5CUVVFc1JVRkJWeXhKUVVGRExFTkJRVUVzVTBGTVdqdFRRVVJHTzA5QlJFWTdUVUZSUVN4SlFVRkRMRU5CUVVFc1VVRkJVU3hEUVVGRExFZEJRVllzUTBGQll5eEpRVUZETEVOQlFVRXNWVUZCWml4RlFVRXlRaXhKUVVGSkxFTkJRVU1zVTBGQlRDeERRVUZsTEVsQlFVTXNRMEZCUVN4TlFVRm9RaXhEUVVFelFqdGhRVU5CTEVsQlFVTXNRMEZCUVN4TlFVRkVMRU5CUVVFN1NVRmFUVHM3TWtKQlkxSXNaMEpCUVVFc1IwRkJhMElzVTBGQlF5eFZRVUZFTEVWQlFXRXNUMEZCWWp0aFFVTm9RaXhKUVVGRExFTkJRVUVzVFVGQlJDeERRVUZSTEZWQlFWSXNSVUZCYjBJc1QwRkJjRUlzUlVGQk5rSTdVVUZCUXl4SlFVRkJMRVZCUVUwc1lVRkJVRHRSUVVGelFpeE5RVUZCTEVWQlFWRXNTVUZCT1VJN1QwRkJOMEk3U1VGRVowSTdPekpDUVVkc1FpeGhRVUZCTEVkQlFXVXNVMEZCUXl4VlFVRkVMRVZCUVdFc1QwRkJZaXhGUVVGelFpeFRRVUYwUWl4RlFVRnBReXhMUVVGcVF6dGhRVU5pTEVsQlFVTXNRMEZCUVN4TlFVRkVMRU5CUVZFc1ZVRkJVaXhGUVVGdlFpeFBRVUZ3UWl4RlFVRTJRaXhMUVVGTExFTkJRVU1zVVVGQlRpeERRVUZsTzFGQlFVTXNTVUZCUVN4RlFVRk5MRk5CUVZBN1QwRkJaaXhGUVVGclF5eExRVUZzUXl4RFFVRTNRanRKUVVSaE96czdPenM3UlVGSldDeFJRVUZETEVOQlFVRTdiMFJCUTB3c1UwRkJRU3hIUVVGWE96dHZSRUZEV0N4VlFVRkJMRWRCUVZrN08wbEJSVU1zSzBOQlFVTXNUMEZCUkRzN1VVRkJReXhWUVVGVkxGRkJRVkVzUTBGQlF6czdPenROUVVNdlFpeEpRVUZETEVOQlFVRXNVVUZCUkN4SFFVRlpPMDFCUTFvc1NVRkJReXhEUVVGQkxFMUJRVVFzUjBGQlZTeEpRVUZKTEVOQlFVTXNTMEZCVEN4RFFVRlhMRWxCUVVNc1EwRkJRU3hSUVVGUkxFTkJRVU1zUjBGQlZpeERRVUZqTEVsQlFVTXNRMEZCUVN4VlFVRm1MRU5CUVVFc1NVRkJPRUlzU1VGQmVrTTdUVUZEVml4SlFVRkRMRU5CUVVFc1RVRkJSQ3hEUVVGQk8wbEJTRmM3TzI5RVFVdGlMRmxCUVVFc1IwRkJZeXhUUVVGRExFbEJRVVE3WVVGRFdpeERRVUZCTEZOQlFVRXNTMEZCUVR0bFFVRkJMRk5CUVVFN1ZVRkRSU3hMUVVGTExFTkJRVU1zVFVGQlRpeERRVUZoTEV0QlFVTXNRMEZCUVN4TlFVRmtMRVZCUVhOQ0xGTkJRVU1zUlVGQlJEdHRRa0ZCVVN4RlFVRkZMRU5CUVVNc1NVRkJTQ3hMUVVGWE8xVkJRVzVDTEVOQlFYUkNPMmxDUVVOQkxFdEJRVU1zUTBGQlFTeFJRVUZSTEVOQlFVTXNSMEZCVml4RFFVRmpMRXRCUVVNc1EwRkJRU3hWUVVGbUxFVkJRVEpDTEVsQlFVa3NRMEZCUXl4VFFVRk1MRU5CUVdVc1MwRkJReXhEUVVGQkxFMUJRV2hDTEVOQlFUTkNPMUZCUmtZN1RVRkJRU3hEUVVGQkxFTkJRVUVzUTBGQlFTeEpRVUZCTzBsQlJGazdPMjlFUVV0a0xFMUJRVUVzUjBGQlVTeFRRVUZCTzBGQlEwNHNWVUZCUVR0TlFVRkJMRWxCUVhsR0xFOUJRVThzUlVGQlVDeExRVUZsTEZWQlFYaEhPMEZCUVVFc1kwRkJUU3huUmtGQlRqczdRVUZEUVR0QlFVRkJPMWRCUVVFc2NVTkJRVUU3TzFGQlEwVXNVVUZCUVN4SFFVRlhMRWxCUVVNc1EwRkJRU3haUVVGRUxFTkJRV01zU1VGQlNTeERRVUZETEVsQlFXNUNPM0ZDUVVOWUxFVkJRVUVzUTBGQlJ5eE5RVUZJTEVWQlFWY3NUMEZCV0N4RlFVRnZRaXhKUVVGSkxFTkJRVU1zVVVGQmVrSXNSVUZCYlVNc1NVRkJTU3hEUVVGRExFMUJRWGhETEVWQlFXZEVMRWxCUVVrc1EwRkJReXhMUVVGeVJDeEZRVUUwUkR0VlFVRkRMR0ZCUVVFc1JVRkJaU3hSUVVGb1FqdFZRVUV3UWl4blFrRkJRU3hGUVVGclFpeERRVUUxUXp0VFFVRTFSRHRCUVVaR096dEpRVVpOT3p0dlJFRk5VaXhOUVVGQkxFZEJRVkVzVTBGQlF5eFJRVUZFTEVWQlFWY3NUVUZCV0N4RlFVRnRRaXhMUVVGdVFqdE5RVU5PTEV0QlFVc3NRMEZCUXl4SFFVRk9MRU5CUVZVc2NVUkJRVUVzUjBGQmMwUXNVVUZCZEVRc1IwRkJLMFFzU1VGQkwwUXNSMEZCYlVVc1RVRkJia1VzUjBGQk1FVXNTVUZCTVVVc1IwRkJPRVVzUzBGQmVFWTdUVUZEUVN4SlFVRnRRaXhKUVVGRExFTkJRVUVzVFVGQlRTeERRVUZETEUxQlFWSXNSMEZCYVVJc1IwRkJjRU03VVVGQlFTeEpRVUZETEVOQlFVRXNUVUZCVFN4RFFVRkRMRXRCUVZJc1EwRkJRU3hGUVVGQk96dE5RVU5CTEVsQlFVTXNRMEZCUVN4TlFVRk5MRU5CUVVNc1NVRkJVaXhEUVVGaE8xRkJRVU1zU1VGQlFTeEZRVUZOTEV0QlFVc3NRMEZCUXl4SlFVRk9MRU5CUVVFc1EwRkJVRHRSUVVGeFFpeFJRVUZCTEVWQlFWVXNVVUZCTDBJN1VVRkJlVU1zVFVGQlFTeEZRVUZSTEUxQlFXcEVPMUZCUVhsRUxFdEJRVUVzUlVGQlR5eExRVUZvUlR0UFFVRmlPMDFCUTBFc1NVRkJReXhEUVVGQkxGRkJRVkVzUTBGQlF5eEhRVUZXTEVOQlFXTXNTVUZCUXl4RFFVRkJMRlZCUVdZc1JVRkJNa0lzU1VGQlNTeERRVUZETEZOQlFVd3NRMEZCWlN4SlFVRkRMRU5CUVVFc1RVRkJhRUlzUTBGQk0wSTdZVUZEUVN4SlFVRkRMRU5CUVVFc1RVRkJSQ3hEUVVGQk8wbEJURTA3TzI5RVFVOVNMR2RDUVVGQkxFZEJRV3RDTEZOQlFVTXNWVUZCUkN4RlFVRmhMRTlCUVdJN1lVRkRhRUlzU1VGQlF5eERRVUZCTEUxQlFVUXNRMEZCVVN4SlFVRkRMRU5CUVVFc1UwRkJWQ3hGUVVGMVFpeFZRVUZWTEVOQlFVTXNTVUZCV2l4SFFVRnBRaXhMUVVGcVFpeEhRVUZ6UWl4UFFVRTFReXhGUVVGMVJDeFZRVUYyUkR0SlFVUm5RanM3YjBSQlIyeENMR0ZCUVVFc1IwRkJaU3hUUVVGRExGVkJRVVFzUlVGQllTeFBRVUZpTEVWQlFYTkNMRk5CUVhSQ0xFVkJRV2xETEUxQlFXcERPMkZCUTJJc1NVRkJReXhEUVVGQkxFMUJRVVFzUTBGQlVTeEpRVUZETEVOQlFVRXNVMEZCVkN4RlFVRjFRaXhWUVVGVkxFTkJRVU1zU1VGQldpeEhRVUZwUWl4TFFVRnFRaXhIUVVGelFpeFBRVUUxUXl4RlFVRjFSQ3hUUVVGMlJEdEpRVVJoT3pzN096czdSVUZKV0N4UlFVRkRMRU5CUVVFN2VVTkJRMHdzVlVGQlFTeEhRVUZaT3p0SlFVVkRMRzlEUVVGRExGZEJRVVFzUlVGQll5eFBRVUZrT3p0UlFVRmpMRlZCUVZVc1VVRkJVU3hEUVVGRE96czdPMDFCUXpWRExFbEJRVU1zUTBGQlFTeE5RVUZFTEVkQlFWVTdUVUZEVml4SlFVRkRMRU5CUVVFc1VVRkJSQ3hIUVVGWk8wMUJRMW9zU1VGQlF5eERRVUZCTEUxQlFVUXNSMEZCVlN4SlFVRkpMRU5CUVVNc1MwRkJUQ3hEUVVGWExFbEJRVU1zUTBGQlFTeFJRVUZSTEVOQlFVTXNSMEZCVml4RFFVRmpMRWxCUVVNc1EwRkJRU3hWUVVGbUxFTkJRVUVzU1VGQk9FSXNTVUZCZWtNN1RVRkRWaXhKUVVGRExFTkJRVUVzVFVGQlJDeERRVUZCTzBsQlNsYzdPM2xEUVUxaUxHRkJRVUVzUjBGQlpTeFRRVUZETEV0QlFVUTdZVUZEWWl4RFFVRkJMRk5CUVVFc1MwRkJRVHRsUVVGQkxGTkJRVU1zUjBGQlJDeEZRVUZOTEVkQlFVNDdWVUZEUlN4SlFVRlZMRWRCUVZZN1FVRkJRU3h0UWtGQlFUczdWVUZEUVN4TFFVRkxMRU5CUVVNc1RVRkJUaXhEUVVGaExFdEJRVU1zUTBGQlFTeE5RVUZrTEVWQlFYTkNMRk5CUVVNc1JVRkJSRHR0UWtGQlVTeEZRVUZGTEVOQlFVTXNWVUZCVlN4RFFVRkRMRTFCUVdRc1MwRkJkMEk3VlVGQmFFTXNRMEZCZEVJN2FVSkJRMEVzUzBGQlF5eERRVUZCTEZGQlFWRXNRMEZCUXl4SFFVRldMRU5CUVdNc1MwRkJReXhEUVVGQkxGVkJRV1lzUlVGQk1rSXNTVUZCU1N4RFFVRkRMRk5CUVV3c1EwRkJaU3hMUVVGRExFTkJRVUVzVFVGQmFFSXNRMEZCTTBJN1VVRklSanROUVVGQkxFTkJRVUVzUTBGQlFTeERRVUZCTEVsQlFVRTdTVUZFWVRzN2VVTkJUV1lzVFVGQlFTeEhRVUZSTEZOQlFVRTdRVUZEVGl4VlFVRkJPMEZCUVVFN1FVRkJRVHRYUVVGQkxIRkRRVUZCT3p0UlFVTkZMRkZCUVVFc1IwRkJWeXhKUVVGRExFTkJRVUVzWVVGQlJDeERRVUZsTEVsQlFVa3NRMEZCUXl4VlFVRlZMRU5CUVVNc1RVRkJMMEk3Y1VKQlExZ3NTVUZCUXl4RFFVRkJMRTFCUVUwc1EwRkJReXhSUVVGU0xFTkJRV2xDTEVsQlFVa3NRMEZCUXl4bFFVRjBRaXhGUVVGMVF5eExRVUZMTEVOQlFVTXNTVUZCVGl4RFFVRlhMRWxCUVVrc1EwRkJReXhWUVVGb1FpeEZRVUUwUWl4UlFVRTFRaXhEUVVGMlF5eEZRVUU0UlN4UlFVRTVSVHRCUVVaR096dEpRVVJOT3p0NVEwRkxVaXhWUVVGQkxFZEJRVmtzVTBGQlF5eFZRVUZFTEVWQlFXRXNTVUZCWWp0TlFVTldMRWxCUVVFc1EwRkJNa0lzVlVGQlZTeERRVUZETEU5QlFYUkRPMEZCUVVFc1pVRkJUeXhMUVVGTExFTkJRVU1zU1VGQlRpeERRVUZCTEVWQlFWQTdPMDFCUlVFc1NVRkJRU3hEUVVFeVFpeEpRVUZKTEVOQlFVTXNUVUZCYUVNN1FVRkJRU3hsUVVGUExFdEJRVXNzUTBGQlF5eEpRVUZPTEVOQlFVRXNSVUZCVURzN1lVRkhRU3hMUVVGTExFTkJRVU1zU1VGQlRpeERRVUZqTEVsQlFVTXNRMEZCUVN4VFFVRkdMRWRCUVZrc1IwRkJXaXhIUVVGbExGVkJRVlVzUTBGQlF5eEpRVUV4UWl4SFFVRXJRaXhIUVVFdlFpeEhRVUZyUXl4VlFVRlZMRU5CUVVNc1QwRkJNVVE3U1VGT1ZUczdlVU5CVVZvc1RVRkJRU3hIUVVGUkxGTkJRVU1zVlVGQlJDeEZRVUZoTEU5QlFXSXNSVUZCYzBJc1NVRkJkRUk3VFVGRFRpeExRVUZMTEVOQlFVTXNSMEZCVGl4RFFVRlZMQ3RDUVVGQkxFZEJRV2RETEZWQlFWVXNRMEZCUXl4SlFVRXpReXhIUVVGblJDeEpRVUZvUkN4SFFVRnZSQ3hQUVVGd1JDeEhRVUUwUkN4SlFVRTFSQ3hIUVVGblJTeExRVUV4UlR0TlFVTkJMRWxCUVcxQ0xFbEJRVU1zUTBGQlFTeE5RVUZOTEVOQlFVTXNUVUZCVWl4SFFVRnBRaXhIUVVGd1F6dFJRVUZCTEVsQlFVTXNRMEZCUVN4TlFVRk5MRU5CUVVNc1MwRkJVaXhEUVVGQkxFVkJRVUU3TzAxQlEwRXNTVUZCUXl4RFFVRkJMRTFCUVUwc1EwRkJReXhKUVVGU0xFTkJRMFU3VVVGQlFTeGxRVUZCTEVWQlFXbENMRlZCUVZVc1EwRkJReXhKUVVFMVFqdFJRVU5CTEZWQlFVRXNSVUZEUlR0VlFVRkJMRTFCUVVFc1JVRkJVU3hMUVVGTExFTkJRVU1zU1VGQlRpeERRVUZCTEVOQlFWSTdWVUZEUVN4SlFVRkJMRVZCUVUwc1NVRkJReXhEUVVGQkxGVkJRVVFzUTBGQldTeFZRVUZhTEVWQlFYZENMRWxCUVhoQ0xFTkJSRTQ3VlVGRlFTeFBRVUZCTEVWQlFWTXNUMEZHVkR0VlFVZEJMRXRCUVVFc1JVRkJUeXhKUVVGSkxFTkJRVU1zU1VGSVdqdFRRVVpHTzA5QlJFWTdUVUZQUVN4SlFVRkRMRU5CUVVFc1VVRkJVU3hEUVVGRExFZEJRVllzUTBGQll5eEpRVUZETEVOQlFVRXNWVUZCWml4RlFVRXlRaXhKUVVGSkxFTkJRVU1zVTBGQlRDeERRVUZsTEVsQlFVTXNRMEZCUVN4TlFVRm9RaXhEUVVFelFqdGhRVU5CTEVsQlFVTXNRMEZCUVN4TlFVRkVMRU5CUVVFN1NVRllUVHM3ZVVOQllWSXNaMEpCUVVFc1IwRkJhMElzVTBGQlF5eFZRVUZFTEVWQlFXRXNUMEZCWWp0aFFVTm9RaXhKUVVGRExFTkJRVUVzVFVGQlJDeERRVUZSTEZWQlFWSXNSVUZCYjBJc1QwRkJjRUlzUlVGQk5rSTdVVUZCUXl4SlFVRkJMRVZCUVUwc1lVRkJVRHRSUVVGelFpeE5RVUZCTEVWQlFWRXNTVUZCT1VJN1QwRkJOMEk3U1VGRVowSTdPM2xEUVVkc1FpeGhRVUZCTEVkQlFXVXNVMEZCUXl4VlFVRkVMRVZCUVdFc1QwRkJZaXhGUVVGelFpeFRRVUYwUWl4RlFVRnBReXhMUVVGcVF6dGhRVU5pTEVsQlFVTXNRMEZCUVN4TlFVRkVMRU5CUVZFc1ZVRkJVaXhGUVVGdlFpeFBRVUZ3UWl4RlFVRTJRaXhMUVVGTExFTkJRVU1zVVVGQlRpeERRVUZsTzFGQlFVTXNTVUZCUVN4RlFVRk5MRk5CUVZBN1QwRkJaaXhGUVVGclF5eExRVUZzUXl4RFFVRTNRanRKUVVSaE96czdPenM3UlVGSldDeFJRVUZETEVOQlFVRTdPenRKUVVOTUxDdENRVUZETEVOQlFVRXNVMEZCUkN4SFFVRlpPenRKUVVWYUxDdENRVUZETEVOQlFVRXNUVUZCUkN4SFFVRlRMRk5CUVVNc1VVRkJSQ3hGUVVGWExFMUJRVmdzUlVGQmJVSXNTMEZCYmtJN1RVRkRVQ3hMUVVGTExFTkJRVU1zUjBGQlRpeERRVUZWTEc5RFFVRkJMRWRCUVhGRExGRkJRWEpETEVkQlFUaERMRWxCUVRsRExFZEJRV3RFTEUxQlFXeEVMRWRCUVhsRUxFbEJRWHBFTEVkQlFUWkVMRXRCUVhaRk8wMUJRMEVzU1VGQmVVWXNUMEZCVHl4RlFVRlFMRXRCUVdVc1ZVRkJlRWM3UVVGQlFTeGpRVUZOTEdkR1FVRk9PenRoUVVOQkxFVkJRVUVzUTBGQlJ5eE5RVUZJTEVWQlFWY3NUMEZCV0N4RlFVRnZRaXhSUVVGd1FpeEZRVUU0UWl4TlFVRTVRaXhGUVVGelF5eExRVUYwUXl4RlFVRTJRenRSUVVGRExHZENRVUZCTEVWQlFXdENMRU5CUVc1Q08wOUJRVGRETzBsQlNFODdPMGxCUzFRc0swSkJRVU1zUTBGQlFTeG5Ra0ZCUkN4SFFVRnRRaXhUUVVGRExGVkJRVVFzUlVGQllTeFBRVUZpTzJGQlEycENMQ3RDUVVGRExFTkJRVUVzVFVGQlJDeERRVUZSTEN0Q1FVRkRMRU5CUVVFc1UwRkJWQ3hGUVVGMVFpeFZRVUZWTEVOQlFVTXNTVUZCV2l4SFFVRnBRaXhMUVVGcVFpeEhRVUZ6UWl4UFFVRTFReXhGUVVGMVJDeFZRVUYyUkR0SlFVUnBRanM3U1VGSGJrSXNLMEpCUVVNc1EwRkJRU3hoUVVGRUxFZEJRV2RDTEZOQlFVTXNWVUZCUkN4RlFVRmhMRTlCUVdJc1JVRkJjMElzVTBGQmRFSXNSVUZCYVVNc1RVRkJha003WVVGRFpDd3JRa0ZCUXl4RFFVRkJMRTFCUVVRc1EwRkJVU3dyUWtGQlF5eERRVUZCTEZOQlFWUXNSVUZCZFVJc1ZVRkJWU3hEUVVGRExFbEJRVm9zUjBGQmFVSXNTMEZCYWtJc1IwRkJjMElzVDBGQk5VTXNSVUZCZFVRc1UwRkJka1E3U1VGRVl6czdPenM3TzBWQlNWb3NVVUZCUXl4RFFVRkJPenM3U1VGRFRDeHRRa0ZCUXl4RFFVRkJMRk5CUVVRc1IwRkJXVHM3U1VGRFdpeHRRa0ZCUXl4RFFVRkJMRWRCUVVRc1IwRkJUU3hUUVVGRExFZEJRVVFzUlVGQlRTeExRVUZPTzJGQlEwb3NTVUZCU1N4UFFVRktMRU5CUVZrc1NVRkJReXhEUVVGQkxGTkJRV0lzUTBGQmRVSXNRMEZCUXl4SFFVRjRRaXhEUVVFMFFpeEhRVUUxUWl4RlFVRnBReXhMUVVGcVF6dEpRVVJKT3p0SlFVVk9MRzFDUVVGRExFTkJRVUVzUjBGQlJDeEhRVUZOTEZOQlFVTXNSMEZCUkR0aFFVTktMRWxCUVVrc1QwRkJTaXhEUVVGWkxFbEJRVU1zUTBGQlFTeFRRVUZpTEVOQlFYVkNMRU5CUVVNc1IwRkJlRUlzUTBGQk5FSXNSMEZCTlVJN1NVRkVTVHM3T3pzN096czdPenRCUVVsV0xFMUJRVTBzUTBGQlF5eFBRVUZRTEVkQlFXbENJbjA9XG4iLCJ2YXIgQWxlcGhCZXQsIGFkYXB0ZXJzLCBvcHRpb25zLCB1dGlscyxcbiAgYmluZCA9IGZ1bmN0aW9uKGZuLCBtZSl7IHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gZm4uYXBwbHkobWUsIGFyZ3VtZW50cyk7IH07IH07XG5cbnV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG5hZGFwdGVycyA9IHJlcXVpcmUoJy4vYWRhcHRlcnMnKTtcblxub3B0aW9ucyA9IHJlcXVpcmUoJy4vb3B0aW9ucycpO1xuXG5BbGVwaEJldCA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gQWxlcGhCZXQoKSB7fVxuXG4gIEFsZXBoQmV0Lm9wdGlvbnMgPSBvcHRpb25zO1xuXG4gIEFsZXBoQmV0LnV0aWxzID0gdXRpbHM7XG5cbiAgQWxlcGhCZXQuR2ltZWxBZGFwdGVyID0gYWRhcHRlcnMuR2ltZWxBZGFwdGVyO1xuXG4gIEFsZXBoQmV0LlBlcnNpc3RlbnRRdWV1ZUdvb2dsZUFuYWx5dGljc0FkYXB0ZXIgPSBhZGFwdGVycy5QZXJzaXN0ZW50UXVldWVHb29nbGVBbmFseXRpY3NBZGFwdGVyO1xuXG4gIEFsZXBoQmV0LlBlcnNpc3RlbnRRdWV1ZUtlZW5BZGFwdGVyID0gYWRhcHRlcnMuUGVyc2lzdGVudFF1ZXVlS2VlbkFkYXB0ZXI7XG5cbiAgQWxlcGhCZXQuRXhwZXJpbWVudCA9IChmdW5jdGlvbigpIHtcbiAgICB2YXIgX3J1biwgX3ZhbGlkYXRlO1xuXG4gICAgRXhwZXJpbWVudC5fb3B0aW9ucyA9IHtcbiAgICAgIG5hbWU6IG51bGwsXG4gICAgICB2YXJpYW50czogbnVsbCxcbiAgICAgIHVzZXJfaWQ6IG51bGwsXG4gICAgICBzYW1wbGU6IDEuMCxcbiAgICAgIHRyaWdnZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0sXG4gICAgICB0cmFja2luZ19hZGFwdGVyOiBhZGFwdGVycy5Hb29nbGVVbml2ZXJzYWxBbmFseXRpY3NBZGFwdGVyLFxuICAgICAgc3RvcmFnZV9hZGFwdGVyOiBhZGFwdGVycy5Mb2NhbFN0b3JhZ2VBZGFwdGVyXG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIEV4cGVyaW1lbnQob3B0aW9uczEpIHtcbiAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMxICE9IG51bGwgPyBvcHRpb25zMSA6IHt9O1xuICAgICAgdGhpcy5hZGRfZ29hbHMgPSBiaW5kKHRoaXMuYWRkX2dvYWxzLCB0aGlzKTtcbiAgICAgIHRoaXMuYWRkX2dvYWwgPSBiaW5kKHRoaXMuYWRkX2dvYWwsIHRoaXMpO1xuICAgICAgdXRpbHMuZGVmYXVsdHModGhpcy5vcHRpb25zLCBFeHBlcmltZW50Ll9vcHRpb25zKTtcbiAgICAgIF92YWxpZGF0ZS5jYWxsKHRoaXMpO1xuICAgICAgdGhpcy5uYW1lID0gdGhpcy5vcHRpb25zLm5hbWU7XG4gICAgICB0aGlzLnZhcmlhbnRzID0gdGhpcy5vcHRpb25zLnZhcmlhbnRzO1xuICAgICAgdGhpcy51c2VyX2lkID0gdGhpcy5vcHRpb25zLnVzZXJfaWQ7XG4gICAgICB0aGlzLnZhcmlhbnRfbmFtZXMgPSB1dGlscy5rZXlzKHRoaXMudmFyaWFudHMpO1xuICAgICAgX3J1bi5jYWxsKHRoaXMpO1xuICAgIH1cblxuICAgIEV4cGVyaW1lbnQucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHZhcmlhbnQ7XG4gICAgICB1dGlscy5sb2coXCJydW5uaW5nIHdpdGggb3B0aW9uczogXCIgKyAoSlNPTi5zdHJpbmdpZnkodGhpcy5vcHRpb25zKSkpO1xuICAgICAgaWYgKHZhcmlhbnQgPSB0aGlzLmdldF9zdG9yZWRfdmFyaWFudCgpKSB7XG4gICAgICAgIHV0aWxzLmxvZyh2YXJpYW50ICsgXCIgYWN0aXZlXCIpO1xuICAgICAgICByZXR1cm4gdGhpcy5hY3RpdmF0ZV92YXJpYW50KHZhcmlhbnQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZGl0aW9uYWxseV9hY3RpdmF0ZV92YXJpYW50KCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIF9ydW4gPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnJ1bigpO1xuICAgIH07XG5cbiAgICBFeHBlcmltZW50LnByb3RvdHlwZS5hY3RpdmF0ZV92YXJpYW50ID0gZnVuY3Rpb24odmFyaWFudCkge1xuICAgICAgdmFyIHJlZjtcbiAgICAgIGlmICgocmVmID0gdGhpcy52YXJpYW50c1t2YXJpYW50XSkgIT0gbnVsbCkge1xuICAgICAgICByZWYuYWN0aXZhdGUodGhpcyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5zdG9yYWdlKCkuc2V0KHRoaXMub3B0aW9ucy5uYW1lICsgXCI6dmFyaWFudFwiLCB2YXJpYW50KTtcbiAgICB9O1xuXG4gICAgRXhwZXJpbWVudC5wcm90b3R5cGUuY29uZGl0aW9uYWxseV9hY3RpdmF0ZV92YXJpYW50ID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdmFyaWFudDtcbiAgICAgIGlmICghdGhpcy5vcHRpb25zLnRyaWdnZXIoKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB1dGlscy5sb2coJ3RyaWdnZXIgc2V0Jyk7XG4gICAgICBpZiAoIXRoaXMuaW5fc2FtcGxlKCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdXRpbHMubG9nKCdpbiBzYW1wbGUnKTtcbiAgICAgIHZhcmlhbnQgPSB0aGlzLnBpY2tfdmFyaWFudCgpO1xuICAgICAgdGhpcy50cmFja2luZygpLmV4cGVyaW1lbnRfc3RhcnQodGhpcywgdmFyaWFudCk7XG4gICAgICByZXR1cm4gdGhpcy5hY3RpdmF0ZV92YXJpYW50KHZhcmlhbnQpO1xuICAgIH07XG5cbiAgICBFeHBlcmltZW50LnByb3RvdHlwZS5nb2FsX2NvbXBsZXRlID0gZnVuY3Rpb24oZ29hbF9uYW1lLCBwcm9wcykge1xuICAgICAgdmFyIHZhcmlhbnQ7XG4gICAgICBpZiAocHJvcHMgPT0gbnVsbCkge1xuICAgICAgICBwcm9wcyA9IHt9O1xuICAgICAgfVxuICAgICAgdXRpbHMuZGVmYXVsdHMocHJvcHMsIHtcbiAgICAgICAgdW5pcXVlOiB0cnVlXG4gICAgICB9KTtcbiAgICAgIGlmIChwcm9wcy51bmlxdWUgJiYgdGhpcy5zdG9yYWdlKCkuZ2V0KHRoaXMub3B0aW9ucy5uYW1lICsgXCI6XCIgKyBnb2FsX25hbWUpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHZhcmlhbnQgPSB0aGlzLmdldF9zdG9yZWRfdmFyaWFudCgpO1xuICAgICAgaWYgKCF2YXJpYW50KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChwcm9wcy51bmlxdWUpIHtcbiAgICAgICAgdGhpcy5zdG9yYWdlKCkuc2V0KHRoaXMub3B0aW9ucy5uYW1lICsgXCI6XCIgKyBnb2FsX25hbWUsIHRydWUpO1xuICAgICAgfVxuICAgICAgdXRpbHMubG9nKFwiZXhwZXJpbWVudDogXCIgKyB0aGlzLm9wdGlvbnMubmFtZSArIFwiIHZhcmlhbnQ6XCIgKyB2YXJpYW50ICsgXCIgZ29hbDpcIiArIGdvYWxfbmFtZSArIFwiIGNvbXBsZXRlXCIpO1xuICAgICAgcmV0dXJuIHRoaXMudHJhY2tpbmcoKS5nb2FsX2NvbXBsZXRlKHRoaXMsIHZhcmlhbnQsIGdvYWxfbmFtZSwgcHJvcHMpO1xuICAgIH07XG5cbiAgICBFeHBlcmltZW50LnByb3RvdHlwZS5nZXRfc3RvcmVkX3ZhcmlhbnQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnN0b3JhZ2UoKS5nZXQodGhpcy5vcHRpb25zLm5hbWUgKyBcIjp2YXJpYW50XCIpO1xuICAgIH07XG5cbiAgICBFeHBlcmltZW50LnByb3RvdHlwZS5waWNrX3ZhcmlhbnQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjaG9zZW5fcGFydGl0aW9uLCBwYXJ0aXRpb25zLCB2YXJpYW50O1xuICAgICAgcGFydGl0aW9ucyA9IDEuMCAvIHRoaXMudmFyaWFudF9uYW1lcy5sZW5ndGg7XG4gICAgICBjaG9zZW5fcGFydGl0aW9uID0gTWF0aC5mbG9vcih0aGlzLl9yYW5kb20oJ3ZhcmlhbnQnKSAvIHBhcnRpdGlvbnMpO1xuICAgICAgdmFyaWFudCA9IHRoaXMudmFyaWFudF9uYW1lc1tjaG9zZW5fcGFydGl0aW9uXTtcbiAgICAgIHV0aWxzLmxvZyh2YXJpYW50ICsgXCIgcGlja2VkXCIpO1xuICAgICAgcmV0dXJuIHZhcmlhbnQ7XG4gICAgfTtcblxuICAgIEV4cGVyaW1lbnQucHJvdG90eXBlLmluX3NhbXBsZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGFjdGl2ZTtcbiAgICAgIGFjdGl2ZSA9IHRoaXMuc3RvcmFnZSgpLmdldCh0aGlzLm9wdGlvbnMubmFtZSArIFwiOmluX3NhbXBsZVwiKTtcbiAgICAgIGlmICh0eXBlb2YgYWN0aXZlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm4gYWN0aXZlO1xuICAgICAgfVxuICAgICAgYWN0aXZlID0gdGhpcy5fcmFuZG9tKCdzYW1wbGUnKSA8PSB0aGlzLm9wdGlvbnMuc2FtcGxlO1xuICAgICAgdGhpcy5zdG9yYWdlKCkuc2V0KHRoaXMub3B0aW9ucy5uYW1lICsgXCI6aW5fc2FtcGxlXCIsIGFjdGl2ZSk7XG4gICAgICByZXR1cm4gYWN0aXZlO1xuICAgIH07XG5cbiAgICBFeHBlcmltZW50LnByb3RvdHlwZS5fcmFuZG9tID0gZnVuY3Rpb24oc2FsdCkge1xuICAgICAgdmFyIHNlZWQ7XG4gICAgICBpZiAoIXRoaXMudXNlcl9pZCkge1xuICAgICAgICByZXR1cm4gdXRpbHMucmFuZG9tKCk7XG4gICAgICB9XG4gICAgICBzZWVkID0gdGhpcy5uYW1lICsgXCIuXCIgKyBzYWx0ICsgXCIuXCIgKyB0aGlzLnVzZXJfaWQ7XG4gICAgICByZXR1cm4gdXRpbHMucmFuZG9tKHNlZWQpO1xuICAgIH07XG5cbiAgICBFeHBlcmltZW50LnByb3RvdHlwZS5hZGRfZ29hbCA9IGZ1bmN0aW9uKGdvYWwpIHtcbiAgICAgIHJldHVybiBnb2FsLmFkZF9leHBlcmltZW50KHRoaXMpO1xuICAgIH07XG5cbiAgICBFeHBlcmltZW50LnByb3RvdHlwZS5hZGRfZ29hbHMgPSBmdW5jdGlvbihnb2Fscykge1xuICAgICAgdmFyIGdvYWwsIGksIGxlbiwgcmVzdWx0cztcbiAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoaSA9IDAsIGxlbiA9IGdvYWxzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGdvYWwgPSBnb2Fsc1tpXTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKHRoaXMuYWRkX2dvYWwoZ29hbCkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfTtcblxuICAgIEV4cGVyaW1lbnQucHJvdG90eXBlLnN0b3JhZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMuc3RvcmFnZV9hZGFwdGVyO1xuICAgIH07XG5cbiAgICBFeHBlcmltZW50LnByb3RvdHlwZS50cmFja2luZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy50cmFja2luZ19hZGFwdGVyO1xuICAgIH07XG5cbiAgICBfdmFsaWRhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMubmFtZSA9PT0gbnVsbCkge1xuICAgICAgICB0aHJvdyAnYW4gZXhwZXJpbWVudCBuYW1lIG11c3QgYmUgc3BlY2lmaWVkJztcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMudmFyaWFudHMgPT09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgJ3ZhcmlhbnRzIG11c3QgYmUgcHJvdmlkZWQnO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMudHJpZ2dlciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aHJvdyAndHJpZ2dlciBtdXN0IGJlIGEgZnVuY3Rpb24nO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gRXhwZXJpbWVudDtcblxuICB9KSgpO1xuXG4gIEFsZXBoQmV0LkdvYWwgPSAoZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gR29hbChuYW1lLCBwcm9wczEpIHtcbiAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICB0aGlzLnByb3BzID0gcHJvcHMxICE9IG51bGwgPyBwcm9wczEgOiB7fTtcbiAgICAgIHV0aWxzLmRlZmF1bHRzKHRoaXMucHJvcHMsIHtcbiAgICAgICAgdW5pcXVlOiB0cnVlXG4gICAgICB9KTtcbiAgICAgIHRoaXMuZXhwZXJpbWVudHMgPSBbXTtcbiAgICB9XG5cbiAgICBHb2FsLnByb3RvdHlwZS5hZGRfZXhwZXJpbWVudCA9IGZ1bmN0aW9uKGV4cGVyaW1lbnQpIHtcbiAgICAgIHJldHVybiB0aGlzLmV4cGVyaW1lbnRzLnB1c2goZXhwZXJpbWVudCk7XG4gICAgfTtcblxuICAgIEdvYWwucHJvdG90eXBlLmFkZF9leHBlcmltZW50cyA9IGZ1bmN0aW9uKGV4cGVyaW1lbnRzKSB7XG4gICAgICB2YXIgZXhwZXJpbWVudCwgaSwgbGVuLCByZXN1bHRzO1xuICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChpID0gMCwgbGVuID0gZXhwZXJpbWVudHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgZXhwZXJpbWVudCA9IGV4cGVyaW1lbnRzW2ldO1xuICAgICAgICByZXN1bHRzLnB1c2godGhpcy5hZGRfZXhwZXJpbWVudChleHBlcmltZW50KSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9O1xuXG4gICAgR29hbC5wcm90b3R5cGUuY29tcGxldGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBleHBlcmltZW50LCBpLCBsZW4sIHJlZiwgcmVzdWx0cztcbiAgICAgIHJlZiA9IHRoaXMuZXhwZXJpbWVudHM7XG4gICAgICByZXN1bHRzID0gW107XG4gICAgICBmb3IgKGkgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgZXhwZXJpbWVudCA9IHJlZltpXTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKGV4cGVyaW1lbnQuZ29hbF9jb21wbGV0ZSh0aGlzLm5hbWUsIHRoaXMucHJvcHMpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH07XG5cbiAgICByZXR1cm4gR29hbDtcblxuICB9KSgpO1xuXG4gIHJldHVybiBBbGVwaEJldDtcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBBbGVwaEJldDtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pTDJodmJXVXZlVzloZGk5amIyUmxMMkZzWlhCb1ltVjBMM055WXk5aGJHVndhR0psZEM1amIyWm1aV1VpTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lJdmFHOXRaUzk1YjJGMkwyTnZaR1V2WVd4bGNHaGlaWFF2YzNKakwyRnNaWEJvWW1WMExtTnZabVpsWlNKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFTeEpRVUZCTEd0RFFVRkJPMFZCUVVFN08wRkJRVUVzUzBGQlFTeEhRVUZSTEU5QlFVRXNRMEZCVVN4VFFVRlNPenRCUVVOU0xGRkJRVUVzUjBGQlZ5eFBRVUZCTEVOQlFWRXNXVUZCVWpzN1FVRkRXQ3hQUVVGQkxFZEJRVlVzVDBGQlFTeERRVUZSTEZkQlFWSTdPMEZCUlVvN096dEZRVU5LTEZGQlFVTXNRMEZCUVN4UFFVRkVMRWRCUVZjN08wVkJRMWdzVVVGQlF5eERRVUZCTEV0QlFVUXNSMEZCVXpzN1JVRkZWQ3hSUVVGRExFTkJRVUVzV1VGQlJDeEhRVUZuUWl4UlFVRlJMRU5CUVVNN08wVkJRM3BDTEZGQlFVTXNRMEZCUVN4eFEwRkJSQ3hIUVVGNVF5eFJRVUZSTEVOQlFVTTdPMFZCUTJ4RUxGRkJRVU1zUTBGQlFTd3dRa0ZCUkN4SFFVRTRRaXhSUVVGUkxFTkJRVU03TzBWQlJXcERMRkZCUVVNc1EwRkJRVHRCUVVOTUxGRkJRVUU3TzBsQlFVRXNWVUZCUXl4RFFVRkJMRkZCUVVRc1IwRkRSVHROUVVGQkxFbEJRVUVzUlVGQlRTeEpRVUZPTzAxQlEwRXNVVUZCUVN4RlFVRlZMRWxCUkZZN1RVRkZRU3hQUVVGQkxFVkJRVk1zU1VGR1ZEdE5RVWRCTEUxQlFVRXNSVUZCVVN4SFFVaFNPMDFCU1VFc1QwRkJRU3hGUVVGVExGTkJRVUU3WlVGQlJ6dE5RVUZJTEVOQlNsUTdUVUZMUVN4blFrRkJRU3hGUVVGclFpeFJRVUZSTEVOQlFVTXNLMEpCVEROQ08wMUJUVUVzWlVGQlFTeEZRVUZwUWl4UlFVRlJMRU5CUVVNc2JVSkJUakZDT3pzN1NVRlJWeXh2UWtGQlF5eFJRVUZFTzAxQlFVTXNTVUZCUXl4RFFVRkJMRFpDUVVGRUxGZEJRVk03T3p0TlFVTnlRaXhMUVVGTExFTkJRVU1zVVVGQlRpeERRVUZsTEVsQlFVTXNRMEZCUVN4UFFVRm9RaXhGUVVGNVFpeFZRVUZWTEVOQlFVTXNVVUZCY0VNN1RVRkRRU3hUUVVGVExFTkJRVU1zU1VGQlZpeERRVUZsTEVsQlFXWTdUVUZEUVN4SlFVRkRMRU5CUVVFc1NVRkJSQ3hIUVVGUkxFbEJRVU1zUTBGQlFTeFBRVUZQTEVOQlFVTTdUVUZEYWtJc1NVRkJReXhEUVVGQkxGRkJRVVFzUjBGQldTeEpRVUZETEVOQlFVRXNUMEZCVHl4RFFVRkRPMDFCUTNKQ0xFbEJRVU1zUTBGQlFTeFBRVUZFTEVkQlFWY3NTVUZCUXl4RFFVRkJMRTlCUVU4c1EwRkJRenROUVVOd1FpeEpRVUZETEVOQlFVRXNZVUZCUkN4SFFVRnBRaXhMUVVGTExFTkJRVU1zU1VGQlRpeERRVUZYTEVsQlFVTXNRMEZCUVN4UlFVRmFPMDFCUTJwQ0xFbEJRVWtzUTBGQlF5eEpRVUZNTEVOQlFWVXNTVUZCVmp0SlFWQlhPenQ1UWtGVFlpeEhRVUZCTEVkQlFVc3NVMEZCUVR0QlFVTklMRlZCUVVFN1RVRkJRU3hMUVVGTExFTkJRVU1zUjBGQlRpeERRVUZWTEhkQ1FVRkJMRWRCUVhkQ0xFTkJRVU1zU1VGQlNTeERRVUZETEZOQlFVd3NRMEZCWlN4SlFVRkRMRU5CUVVFc1QwRkJhRUlzUTBGQlJDeERRVUZzUXp0TlFVTkJMRWxCUVVjc1QwRkJRU3hIUVVGVkxFbEJRVU1zUTBGQlFTeHJRa0ZCUkN4RFFVRkJMRU5CUVdJN1VVRkZSU3hMUVVGTExFTkJRVU1zUjBGQlRpeERRVUZoTEU5QlFVUXNSMEZCVXl4VFFVRnlRanRsUVVOQkxFbEJRVU1zUTBGQlFTeG5Ra0ZCUkN4RFFVRnJRaXhQUVVGc1FpeEZRVWhHTzA5QlFVRXNUVUZCUVR0bFFVdEZMRWxCUVVNc1EwRkJRU3c0UWtGQlJDeERRVUZCTEVWQlRFWTdPMGxCUmtjN08wbEJVMHdzU1VGQlFTeEhRVUZQTEZOQlFVRTdZVUZCUnl4SlFVRkRMRU5CUVVFc1IwRkJSQ3hEUVVGQk8wbEJRVWc3TzNsQ1FVVlFMR2RDUVVGQkxFZEJRV3RDTEZOQlFVTXNUMEZCUkR0QlFVTm9RaXhWUVVGQk96dFhRVUZyUWl4RFFVRkZMRkZCUVhCQ0xFTkJRVFpDTEVsQlFUZENPenRoUVVOQkxFbEJRVU1zUTBGQlFTeFBRVUZFTEVOQlFVRXNRMEZCVlN4RFFVRkRMRWRCUVZnc1EwRkJhMElzU1VGQlF5eERRVUZCTEU5QlFVOHNRMEZCUXl4SlFVRldMRWRCUVdVc1ZVRkJhRU1zUlVGQk1rTXNUMEZCTTBNN1NVRkdaMEk3TzNsQ1FVdHNRaXc0UWtGQlFTeEhRVUZuUXl4VFFVRkJPMEZCUXpsQ0xGVkJRVUU3VFVGQlFTeEpRVUZCTEVOQlFXTXNTVUZCUXl4RFFVRkJMRTlCUVU4c1EwRkJReXhQUVVGVUxFTkJRVUVzUTBGQlpEdEJRVUZCTEdWQlFVRTdPMDFCUTBFc1MwRkJTeXhEUVVGRExFZEJRVTRzUTBGQlZTeGhRVUZXTzAxQlEwRXNTVUZCUVN4RFFVRmpMRWxCUVVNc1EwRkJRU3hUUVVGRUxFTkJRVUVzUTBGQlpEdEJRVUZCTEdWQlFVRTdPMDFCUTBFc1MwRkJTeXhEUVVGRExFZEJRVTRzUTBGQlZTeFhRVUZXTzAxQlEwRXNUMEZCUVN4SFFVRlZMRWxCUVVNc1EwRkJRU3haUVVGRUxFTkJRVUU3VFVGRFZpeEpRVUZETEVOQlFVRXNVVUZCUkN4RFFVRkJMRU5CUVZjc1EwRkJReXhuUWtGQldpeERRVUUyUWl4SlFVRTNRaXhGUVVGdFF5eFBRVUZ1UXp0aFFVTkJMRWxCUVVNc1EwRkJRU3huUWtGQlJDeERRVUZyUWl4UFFVRnNRanRKUVZBNFFqczdlVUpCVTJoRExHRkJRVUVzUjBGQlpTeFRRVUZETEZOQlFVUXNSVUZCV1N4TFFVRmFPMEZCUTJJc1ZVRkJRVHM3VVVGRWVVSXNVVUZCVFRzN1RVRkRMMElzUzBGQlN5eERRVUZETEZGQlFVNHNRMEZCWlN4TFFVRm1MRVZCUVhOQ08xRkJRVU1zVFVGQlFTeEZRVUZSTEVsQlFWUTdUMEZCZEVJN1RVRkRRU3hKUVVGVkxFdEJRVXNzUTBGQlF5eE5RVUZPTEVsQlFXZENMRWxCUVVNc1EwRkJRU3hQUVVGRUxFTkJRVUVzUTBGQlZTeERRVUZETEVkQlFWZ3NRMEZCYTBJc1NVRkJReXhEUVVGQkxFOUJRVThzUTBGQlF5eEpRVUZXTEVkQlFXVXNSMEZCWml4SFFVRnJRaXhUUVVGdVF5eERRVUV4UWp0QlFVRkJMR1ZCUVVFN08wMUJRMEVzVDBGQlFTeEhRVUZWTEVsQlFVTXNRMEZCUVN4clFrRkJSQ3hEUVVGQk8wMUJRMVlzU1VGQlFTeERRVUZqTEU5QlFXUTdRVUZCUVN4bFFVRkJPenROUVVOQkxFbEJRWGxFTEV0QlFVc3NRMEZCUXl4TlFVRXZSRHRSUVVGQkxFbEJRVU1zUTBGQlFTeFBRVUZFTEVOQlFVRXNRMEZCVlN4RFFVRkRMRWRCUVZnc1EwRkJhMElzU1VGQlF5eERRVUZCTEU5QlFVOHNRMEZCUXl4SlFVRldMRWRCUVdVc1IwRkJaaXhIUVVGclFpeFRRVUZ1UXl4RlFVRm5SQ3hKUVVGb1JDeEZRVUZCT3p0TlFVTkJMRXRCUVVzc1EwRkJReXhIUVVGT0xFTkJRVlVzWTBGQlFTeEhRVUZsTEVsQlFVTXNRMEZCUVN4UFFVRlBMRU5CUVVNc1NVRkJlRUlzUjBGQk5rSXNWMEZCTjBJc1IwRkJkME1zVDBGQmVFTXNSMEZCWjBRc1VVRkJhRVFzUjBGQmQwUXNVMEZCZUVRc1IwRkJhMFVzVjBGQk5VVTdZVUZEUVN4SlFVRkRMRU5CUVVFc1VVRkJSQ3hEUVVGQkxFTkJRVmNzUTBGQlF5eGhRVUZhTEVOQlFUQkNMRWxCUVRGQ0xFVkJRV2RETEU5QlFXaERMRVZCUVhsRExGTkJRWHBETEVWQlFXOUVMRXRCUVhCRU8wbEJVR0U3TzNsQ1FWTm1MR3RDUVVGQkxFZEJRVzlDTEZOQlFVRTdZVUZEYkVJc1NVRkJReXhEUVVGQkxFOUJRVVFzUTBGQlFTeERRVUZWTEVOQlFVTXNSMEZCV0N4RFFVRnJRaXhKUVVGRExFTkJRVUVzVDBGQlR5eERRVUZETEVsQlFWWXNSMEZCWlN4VlFVRm9RenRKUVVSclFqczdlVUpCUjNCQ0xGbEJRVUVzUjBGQll5eFRRVUZCTzBGQlExb3NWVUZCUVR0TlFVRkJMRlZCUVVFc1IwRkJZU3hIUVVGQkxFZEJRVTBzU1VGQlF5eERRVUZCTEdGQlFXRXNRMEZCUXp0TlFVTnNReXhuUWtGQlFTeEhRVUZ0UWl4SlFVRkpMRU5CUVVNc1MwRkJUQ3hEUVVGWExFbEJRVU1zUTBGQlFTeFBRVUZFTEVOQlFWTXNVMEZCVkN4RFFVRkJMRWRCUVhOQ0xGVkJRV3BETzAxQlEyNUNMRTlCUVVFc1IwRkJWU3hKUVVGRExFTkJRVUVzWVVGQll5eERRVUZCTEdkQ1FVRkJPMDFCUTNwQ0xFdEJRVXNzUTBGQlF5eEhRVUZPTEVOQlFXRXNUMEZCUkN4SFFVRlRMRk5CUVhKQ08yRkJRMEU3U1VGTVdUczdlVUpCVDJRc1UwRkJRU3hIUVVGWExGTkJRVUU3UVVGRFZDeFZRVUZCTzAxQlFVRXNUVUZCUVN4SFFVRlRMRWxCUVVNc1EwRkJRU3hQUVVGRUxFTkJRVUVzUTBGQlZTeERRVUZETEVkQlFWZ3NRMEZCYTBJc1NVRkJReXhEUVVGQkxFOUJRVThzUTBGQlF5eEpRVUZXTEVkQlFXVXNXVUZCYUVNN1RVRkRWQ3hKUVVGeFFpeFBRVUZQTEUxQlFWQXNTMEZCYVVJc1YwRkJkRU03UVVGQlFTeGxRVUZQTEU5QlFWQTdPMDFCUTBFc1RVRkJRU3hIUVVGVExFbEJRVU1zUTBGQlFTeFBRVUZFTEVOQlFWTXNVVUZCVkN4RFFVRkJMRWxCUVhOQ0xFbEJRVU1zUTBGQlFTeFBRVUZQTEVOQlFVTTdUVUZEZUVNc1NVRkJReXhEUVVGQkxFOUJRVVFzUTBGQlFTeERRVUZWTEVOQlFVTXNSMEZCV0N4RFFVRnJRaXhKUVVGRExFTkJRVUVzVDBGQlR5eERRVUZETEVsQlFWWXNSMEZCWlN4WlFVRm9ReXhGUVVFMlF5eE5RVUUzUXp0aFFVTkJPMGxCVEZNN08zbENRVTlZTEU5QlFVRXNSMEZCVXl4VFFVRkRMRWxCUVVRN1FVRkRVQ3hWUVVGQk8wMUJRVUVzU1VGQlFTeERRVUUyUWl4SlFVRkRMRU5CUVVFc1QwRkJPVUk3UVVGQlFTeGxRVUZQTEV0QlFVc3NRMEZCUXl4TlFVRk9MRU5CUVVFc1JVRkJVRHM3VFVGRFFTeEpRVUZCTEVkQlFWVXNTVUZCUXl4RFFVRkJMRWxCUVVZc1IwRkJUeXhIUVVGUUxFZEJRVlVzU1VGQlZpeEhRVUZsTEVkQlFXWXNSMEZCYTBJc1NVRkJReXhEUVVGQk8yRkJRelZDTEV0QlFVc3NRMEZCUXl4TlFVRk9MRU5CUVdFc1NVRkJZanRKUVVoUE96dDVRa0ZMVkN4UlFVRkJMRWRCUVZVc1UwRkJReXhKUVVGRU8yRkJRMUlzU1VGQlNTeERRVUZETEdOQlFVd3NRMEZCYjBJc1NVRkJjRUk3U1VGRVVUczdlVUpCUjFZc1UwRkJRU3hIUVVGWExGTkJRVU1zUzBGQlJEdEJRVU5VTEZWQlFVRTdRVUZCUVR0WFFVRkJMSFZEUVVGQk96dHhRa0ZCUVN4SlFVRkRMRU5CUVVFc1VVRkJSQ3hEUVVGVkxFbEJRVlk3UVVGQlFUczdTVUZFVXpzN2VVSkJSMWdzVDBGQlFTeEhRVUZUTEZOQlFVRTdZVUZCUnl4SlFVRkRMRU5CUVVFc1QwRkJUeXhEUVVGRE8wbEJRVm83TzNsQ1FVVlVMRkZCUVVFc1IwRkJWU3hUUVVGQk8yRkJRVWNzU1VGQlF5eERRVUZCTEU5QlFVOHNRMEZCUXp0SlFVRmFPenRKUVVWV0xGTkJRVUVzUjBGQldTeFRRVUZCTzAxQlExWXNTVUZCWjBRc1NVRkJReXhEUVVGQkxFOUJRVThzUTBGQlF5eEpRVUZVTEV0QlFXbENMRWxCUVdwRk8wRkJRVUVzWTBGQlRTeDFRMEZCVGpzN1RVRkRRU3hKUVVGeFF5eEpRVUZETEVOQlFVRXNUMEZCVHl4RFFVRkRMRkZCUVZRc1MwRkJjVUlzU1VGQk1VUTdRVUZCUVN4alFVRk5MRFJDUVVGT096dE5RVU5CTEVsQlFYTkRMRTlCUVU4c1NVRkJReXhEUVVGQkxFOUJRVThzUTBGQlF5eFBRVUZvUWl4TFFVRTJRaXhWUVVGdVJUdEJRVUZCTEdOQlFVMHNOa0pCUVU0N08wbEJTRlU3T3pzN096dEZRVTFTTEZGQlFVTXNRMEZCUVR0SlFVTlJMR05CUVVNc1NVRkJSQ3hGUVVGUkxFMUJRVkk3VFVGQlF5eEpRVUZETEVOQlFVRXNUMEZCUkR0TlFVRlBMRWxCUVVNc1EwRkJRU3g1UWtGQlJDeFRRVUZQTzAxQlF6RkNMRXRCUVVzc1EwRkJReXhSUVVGT0xFTkJRV1VzU1VGQlF5eERRVUZCTEV0QlFXaENMRVZCUVhWQ08xRkJRVU1zVFVGQlFTeEZRVUZSTEVsQlFWUTdUMEZCZGtJN1RVRkRRU3hKUVVGRExFTkJRVUVzVjBGQlJDeEhRVUZsTzBsQlJrbzdPMjFDUVVsaUxHTkJRVUVzUjBGQlowSXNVMEZCUXl4VlFVRkVPMkZCUTJRc1NVRkJReXhEUVVGQkxGZEJRVmNzUTBGQlF5eEpRVUZpTEVOQlFXdENMRlZCUVd4Q08wbEJSR003TzIxQ1FVZG9RaXhsUVVGQkxFZEJRV2xDTEZOQlFVTXNWMEZCUkR0QlFVTm1MRlZCUVVFN1FVRkJRVHRYUVVGQkxEWkRRVUZCT3p0eFFrRkJRU3hKUVVGRExFTkJRVUVzWTBGQlJDeERRVUZuUWl4VlFVRm9RanRCUVVGQk96dEpRVVJsT3p0dFFrRkhha0lzVVVGQlFTeEhRVUZWTEZOQlFVRTdRVUZEVWl4VlFVRkJPMEZCUVVFN1FVRkJRVHRYUVVGQkxIRkRRVUZCT3p0eFFrRkRSU3hWUVVGVkxFTkJRVU1zWVVGQldDeERRVUY1UWl4SlFVRkRMRU5CUVVFc1NVRkJNVUlzUlVGQlowTXNTVUZCUXl4RFFVRkJMRXRCUVdwRE8wRkJSRVk3TzBsQlJGRTdPenM3T3pzN096czdRVUZMWkN4TlFVRk5MRU5CUVVNc1QwRkJVQ3hIUVVGcFFpSjlcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBkZWJ1ZzogZmFsc2Vcbn07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaUwyaHZiV1V2ZVc5aGRpOWpiMlJsTDJGc1pYQm9ZbVYwTDNOeVl5OXZjSFJwYjI1ekxtTnZabVpsWlNJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6SWpwYklpOW9iMjFsTDNsdllYWXZZMjlrWlM5aGJHVndhR0psZEM5emNtTXZiM0IwYVc5dWN5NWpiMlptWldVaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWtGQlFVRXNUVUZCVFN4RFFVRkRMRTlCUVZBc1IwRkRSVHRGUVVGQkxFdEJRVUVzUlVGQlR5eExRVUZRSW4wPVxuIiwidmFyIFN0b3JhZ2UsIHN0b3JlO1xuXG5zdG9yZSA9IHJlcXVpcmUoJ3N0b3JlJyk7XG5cblN0b3JhZ2UgPSAoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIFN0b3JhZ2UobmFtZXNwYWNlKSB7XG4gICAgdGhpcy5uYW1lc3BhY2UgPSBuYW1lc3BhY2UgIT0gbnVsbCA/IG5hbWVzcGFjZSA6ICdhbGVwaGJldCc7XG4gICAgaWYgKCFzdG9yZS5lbmFibGVkKSB7XG4gICAgICB0aHJvdyAnbG9jYWwgc3RvcmFnZSBub3Qgc3VwcG9ydGVkJztcbiAgICB9XG4gICAgdGhpcy5zdG9yYWdlID0gc3RvcmUuZ2V0KHRoaXMubmFtZXNwYWNlKSB8fCB7fTtcbiAgfVxuXG4gIFN0b3JhZ2UucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICB0aGlzLnN0b3JhZ2Vba2V5XSA9IHZhbHVlO1xuICAgIHN0b3JlLnNldCh0aGlzLm5hbWVzcGFjZSwgdGhpcy5zdG9yYWdlKTtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG5cbiAgU3RvcmFnZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgcmV0dXJuIHRoaXMuc3RvcmFnZVtrZXldO1xuICB9O1xuXG4gIHJldHVybiBTdG9yYWdlO1xuXG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN0b3JhZ2U7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaUwyaHZiV1V2ZVc5aGRpOWpiMlJsTDJGc1pYQm9ZbVYwTDNOeVl5OXpkRzl5WVdkbExtTnZabVpsWlNJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6SWpwYklpOW9iMjFsTDNsdllYWXZZMjlrWlM5aGJHVndhR0psZEM5emNtTXZjM1J2Y21GblpTNWpiMlptWldVaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWtGQlFVRXNTVUZCUVRzN1FVRkJRU3hMUVVGQkxFZEJRVkVzVDBGQlFTeERRVUZSTEU5QlFWSTdPMEZCUjBZN1JVRkRVeXhwUWtGQlF5eFRRVUZFTzBsQlFVTXNTVUZCUXl4RFFVRkJMR2REUVVGRUxGbEJRVmM3U1VGRGRrSXNTVUZCUVN4RFFVRXlReXhMUVVGTExFTkJRVU1zVDBGQmFrUTdRVUZCUVN4WlFVRk5MRGhDUVVGT096dEpRVU5CTEVsQlFVTXNRMEZCUVN4UFFVRkVMRWRCUVZjc1MwRkJTeXhEUVVGRExFZEJRVTRzUTBGQlZTeEpRVUZETEVOQlFVRXNVMEZCV0N4RFFVRkJMRWxCUVhsQ08wVkJSbnBDT3p0dlFrRkhZaXhIUVVGQkxFZEJRVXNzVTBGQlF5eEhRVUZFTEVWQlFVMHNTMEZCVGp0SlFVTklMRWxCUVVNc1EwRkJRU3hQUVVGUkxFTkJRVUVzUjBGQlFTeERRVUZVTEVkQlFXZENPMGxCUTJoQ0xFdEJRVXNzUTBGQlF5eEhRVUZPTEVOQlFWVXNTVUZCUXl4RFFVRkJMRk5CUVZnc1JVRkJjMElzU1VGQlF5eERRVUZCTEU5QlFYWkNPMEZCUTBFc1YwRkJUenRGUVVoS096dHZRa0ZKVEN4SFFVRkJMRWRCUVVzc1UwRkJReXhIUVVGRU8xZEJRMGdzU1VGQlF5eERRVUZCTEU5QlFWRXNRMEZCUVN4SFFVRkJPMFZCUkU0N096czdPenRCUVVsUUxFMUJRVTBzUTBGQlF5eFBRVUZRTEVkQlFXbENJbjA9XG4iLCJ2YXIgVXRpbHMsIF8sIG9wdGlvbnMsIHNoYTEsIHV1aWQ7XG5cbl8gPSByZXF1aXJlKCdsb2Rhc2guY3VzdG9tJyk7XG5cbnV1aWQgPSByZXF1aXJlKCdub2RlLXV1aWQnKTtcblxuc2hhMSA9IHJlcXVpcmUoJ2NyeXB0by1qcy9zaGExJyk7XG5cbm9wdGlvbnMgPSByZXF1aXJlKCcuL29wdGlvbnMnKTtcblxuVXRpbHMgPSAoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIFV0aWxzKCkge31cblxuICBVdGlscy5kZWZhdWx0cyA9IF8uZGVmYXVsdHM7XG5cbiAgVXRpbHMua2V5cyA9IF8ua2V5cztcblxuICBVdGlscy5yZW1vdmUgPSBfLnJlbW92ZTtcblxuICBVdGlscy5vbWl0ID0gXy5vbWl0O1xuXG4gIFV0aWxzLmxvZyA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgICBpZiAob3B0aW9ucy5kZWJ1Zykge1xuICAgICAgcmV0dXJuIGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xuICAgIH1cbiAgfTtcblxuICBVdGlscy51dWlkID0gdXVpZC52NDtcblxuICBVdGlscy5zaGExID0gZnVuY3Rpb24odGV4dCkge1xuICAgIHJldHVybiBzaGExKHRleHQpLnRvU3RyaW5nKCk7XG4gIH07XG5cbiAgVXRpbHMucmFuZG9tID0gZnVuY3Rpb24oc2VlZCkge1xuICAgIGlmICghc2VlZCkge1xuICAgICAgcmV0dXJuIE1hdGgucmFuZG9tKCk7XG4gICAgfVxuICAgIHJldHVybiBwYXJzZUludCh0aGlzLnNoYTEoc2VlZCkuc3Vic3RyKDAsIDEzKSwgMTYpIC8gMHhGRkZGRkZGRkZGRkZGO1xuICB9O1xuXG4gIHJldHVybiBVdGlscztcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBVdGlscztcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pTDJodmJXVXZlVzloZGk5amIyUmxMMkZzWlhCb1ltVjBMM055WXk5MWRHbHNjeTVqYjJabVpXVWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUl2YUc5dFpTOTViMkYyTDJOdlpHVXZZV3hsY0doaVpYUXZjM0pqTDNWMGFXeHpMbU52Wm1abFpTSmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaVFVRkRRU3hKUVVGQk96dEJRVUZCTEVOQlFVRXNSMEZCU1N4UFFVRkJMRU5CUVZFc1pVRkJVanM3UVVGRFNpeEpRVUZCTEVkQlFVOHNUMEZCUVN4RFFVRlJMRmRCUVZJN08wRkJRMUFzU1VGQlFTeEhRVUZQTEU5QlFVRXNRMEZCVVN4blFrRkJVanM3UVVGRFVDeFBRVUZCTEVkQlFWVXNUMEZCUVN4RFFVRlJMRmRCUVZJN08wRkJSVW83T3p0RlFVTktMRXRCUVVNc1EwRkJRU3hSUVVGRUxFZEJRVmNzUTBGQlF5eERRVUZET3p0RlFVTmlMRXRCUVVNc1EwRkJRU3hKUVVGRUxFZEJRVThzUTBGQlF5eERRVUZET3p0RlFVTlVMRXRCUVVNc1EwRkJRU3hOUVVGRUxFZEJRVk1zUTBGQlF5eERRVUZET3p0RlFVTllMRXRCUVVNc1EwRkJRU3hKUVVGRUxFZEJRVThzUTBGQlF5eERRVUZET3p0RlFVTlVMRXRCUVVNc1EwRkJRU3hIUVVGRUxFZEJRVTBzVTBGQlF5eFBRVUZFTzBsQlEwb3NTVUZCZDBJc1QwRkJUeXhEUVVGRExFdEJRV2hETzJGQlFVRXNUMEZCVHl4RFFVRkRMRWRCUVZJc1EwRkJXU3hQUVVGYUxFVkJRVUU3TzBWQlJFazdPMFZCUlU0c1MwRkJReXhEUVVGQkxFbEJRVVFzUjBGQlR5eEpRVUZKTEVOQlFVTTdPMFZCUTFvc1MwRkJReXhEUVVGQkxFbEJRVVFzUjBGQlR5eFRRVUZETEVsQlFVUTdWMEZEVEN4SlFVRkJMRU5CUVVzc1NVRkJUQ3hEUVVGVkxFTkJRVU1zVVVGQldDeERRVUZCTzBWQlJFczdPMFZCUlZBc1MwRkJReXhEUVVGQkxFMUJRVVFzUjBGQlV5eFRRVUZETEVsQlFVUTdTVUZEVUN4SlFVRkJMRU5CUVRSQ0xFbEJRVFZDTzBGQlFVRXNZVUZCVHl4SlFVRkpMRU5CUVVNc1RVRkJUQ3hEUVVGQkxFVkJRVkE3TzFkQlJVRXNVVUZCUVN4RFFVRlRMRWxCUVVNc1EwRkJRU3hKUVVGRUxFTkJRVTBzU1VGQlRpeERRVUZYTEVOQlFVTXNUVUZCV2l4RFFVRnRRaXhEUVVGdVFpeEZRVUZ6UWl4RlFVRjBRaXhEUVVGVUxFVkJRVzlETEVWQlFYQkRMRU5CUVVFc1IwRkJNRU03UlVGSWJrTTdPenM3T3p0QlFVbFlMRTFCUVUwc1EwRkJReXhQUVVGUUxFZEJRV2xDSW4wPVxuIiwiLyoqXG4gKiBAbGljZW5zZVxuICogbG9kYXNoIDMuMTAuMSAoQ3VzdG9tIEJ1aWxkKSBsb2Rhc2guY29tL2xpY2Vuc2UgfCBVbmRlcnNjb3JlLmpzIDEuOC4zIHVuZGVyc2NvcmVqcy5vcmcvTElDRU5TRVxuICogQnVpbGQ6IGBsb2Rhc2ggLXAgaW5jbHVkZT1cImtleXMsZGVmYXVsdHMscmVtb3ZlLG9taXRcIiBleHBvcnRzPVwibm9kZVwiIC1vIC4vdmVuZG9yL2xvZGFzaC5jdXN0b20ubWluLmpzYFxuICovXG47KGZ1bmN0aW9uKCl7ZnVuY3Rpb24gbmEoYSxiLGMpe2lmKGIhPT1iKXthOntiPWEubGVuZ3RoO2ZvcihjKz0tMTsrK2M8Yjspe3ZhciBlPWFbY107aWYoZSE9PWUpe2E9YzticmVhayBhfX1hPS0xfXJldHVybiBhfWMtPTE7Zm9yKGU9YS5sZW5ndGg7KytjPGU7KWlmKGFbY109PT1iKXJldHVybiBjO3JldHVybi0xfWZ1bmN0aW9uIEEoYSl7cmV0dXJuISFhJiZ0eXBlb2YgYT09XCJvYmplY3RcIn1mdW5jdGlvbiBtKCl7fWZ1bmN0aW9uIHhhKGEpe3ZhciBiPWE/YS5sZW5ndGg6MDtmb3IodGhpcy5kYXRhPXtoYXNoOnlhKG51bGwpLHNldDpuZXcgemF9O2ItLTspdGhpcy5wdXNoKGFbYl0pfWZ1bmN0aW9uIFphKGEsYil7dmFyIGM9YS5kYXRhO3JldHVybih0eXBlb2YgYj09XCJzdHJpbmdcInx8dChiKT9jLnNldC5oYXMoYik6Yy5oYXNoW2JdKT8wOi0xfWZ1bmN0aW9uICRhKGEsYil7dmFyIGM9LTEsZT1hLmxlbmd0aDtmb3IoYnx8KGI9QXJyYXkoZSkpOysrYzxlOyliW2NdPWFbY107XG5yZXR1cm4gYn1mdW5jdGlvbiBBYShhLGIpe2Zvcih2YXIgYz0tMSxlPWEubGVuZ3RoOysrYzxlJiZmYWxzZSE9PWIoYVtjXSxjLGEpOyk7cmV0dXJuIGF9ZnVuY3Rpb24gYWIoYSl7Zm9yKHZhciBiPVN0cmluZyxjPS0xLGU9YS5sZW5ndGgsZD1BcnJheShlKTsrK2M8ZTspZFtjXT1iKGFbY10sYyxhKTtyZXR1cm4gZH1mdW5jdGlvbiBiYihhLGIpe2Zvcih2YXIgYz0tMSxlPWEubGVuZ3RoOysrYzxlOylpZihiKGFbY10sYyxhKSlyZXR1cm4gdHJ1ZTtyZXR1cm4gZmFsc2V9ZnVuY3Rpb24gQmEoYSxiKXt2YXIgYztpZihudWxsPT1iKWM9YTtlbHNle2M9QyhiKTt2YXIgZT1hO2V8fChlPXt9KTtmb3IodmFyIGQ9LTEsZj1jLmxlbmd0aDsrK2Q8Zjspe3ZhciBoPWNbZF07ZVtoXT1iW2hdfWM9ZX1yZXR1cm4gY31mdW5jdGlvbiBDYShhLGIsYyl7dmFyIGU9dHlwZW9mIGE7cmV0dXJuXCJmdW5jdGlvblwiPT1lP2I9PT1wP2E6b2EoYSxiLGMpOm51bGw9PWE/UTpcIm9iamVjdFwiPT1lP0RhKGEpOmI9PT1wP0VhKGEpOlxuY2IoYSxiKX1mdW5jdGlvbiBGYShhLGIsYyxlLGQsZixoKXt2YXIgZztjJiYoZz1kP2MoYSxlLGQpOmMoYSkpO2lmKGchPT1wKXJldHVybiBnO2lmKCF0KGEpKXJldHVybiBhO2lmKGU9eChhKSl7aWYoZz1kYihhKSwhYilyZXR1cm4gJGEoYSxnKX1lbHNle3ZhciBsPUIuY2FsbChhKSxuPWw9PUc7aWYobD09dXx8bD09SHx8biYmIWQpe2lmKFIoYSkpcmV0dXJuIGQ/YTp7fTtnPWViKG4/e306YSk7aWYoIWIpcmV0dXJuIEJhKGcsYSl9ZWxzZSByZXR1cm4gcltsXT9mYihhLGwsYik6ZD9hOnt9fWZ8fChmPVtdKTtofHwoaD1bXSk7Zm9yKGQ9Zi5sZW5ndGg7ZC0tOylpZihmW2RdPT1hKXJldHVybiBoW2RdO2YucHVzaChhKTtoLnB1c2goZyk7KGU/QWE6Z2IpKGEsZnVuY3Rpb24oZSxkKXtnW2RdPUZhKGUsYixjLGQsYSxmLGgpfSk7cmV0dXJuIGd9ZnVuY3Rpb24gaGIoYSxiKXt2YXIgYz1hP2EubGVuZ3RoOjAsZT1bXTtpZighYylyZXR1cm4gZTt2YXIgZD0tMSxmO2Y9bS5pbmRleE9mfHxcbnBhO2Y9Zj09PXBhP25hOmY7dmFyIGg9Zj09PW5hLGc9aCYmYi5sZW5ndGg+PWliP3lhJiZ6YT9uZXcgeGEoYik6bnVsbDpudWxsLGw9Yi5sZW5ndGg7ZyYmKGY9WmEsaD1mYWxzZSxiPWcpO2E6Zm9yKDsrK2Q8YzspaWYoZz1hW2RdLGgmJmc9PT1nKXtmb3IodmFyIG49bDtuLS07KWlmKGJbbl09PT1nKWNvbnRpbnVlIGE7ZS5wdXNoKGcpfWVsc2UgMD5mKGIsZywwKSYmZS5wdXNoKGcpO3JldHVybiBlfWZ1bmN0aW9uIEdhKGEsYixjLGUpe2V8fChlPVtdKTtmb3IodmFyIGQ9LTEsZj1hLmxlbmd0aDsrK2Q8Zjspe3ZhciBoPWFbZF07aWYoQShoKSYmUyhoKSYmKGN8fHgoaCl8fFQoaCkpKWlmKGIpR2EoaCxiLGMsZSk7ZWxzZSBmb3IodmFyIGc9ZSxsPS0xLG49aC5sZW5ndGgsaz1nLmxlbmd0aDsrK2w8bjspZ1trK2xdPWhbbF07ZWxzZSBjfHwoZVtlLmxlbmd0aF09aCl9cmV0dXJuIGV9ZnVuY3Rpb24gamIoYSxiKXtIYShhLGIsVSl9ZnVuY3Rpb24gZ2IoYSxiKXtyZXR1cm4gSGEoYSxiLFxuQyl9ZnVuY3Rpb24gSWEoYSxiLGMpe2lmKG51bGwhPWEpe2E9eShhKTtjIT09cCYmYyBpbiBhJiYoYj1bY10pO2M9MDtmb3IodmFyIGU9Yi5sZW5ndGg7bnVsbCE9YSYmYzxlOylhPXkoYSlbYltjKytdXTtyZXR1cm4gYyYmYz09ZT9hOnB9fWZ1bmN0aW9uIHFhKGEsYixjLGUsZCxmKXtpZihhPT09YilhPXRydWU7ZWxzZSBpZihudWxsPT1hfHxudWxsPT1ifHwhdChhKSYmIUEoYikpYT1hIT09YSYmYiE9PWI7ZWxzZSBhOnt2YXIgaD1xYSxnPXgoYSksbD14KGIpLG49RSxrPUU7Z3x8KG49Qi5jYWxsKGEpLG49PUg/bj11Om4hPXUmJihnPXJhKGEpKSk7bHx8KGs9Qi5jYWxsKGIpLGs9PUg/az11OmshPXUmJnJhKGIpKTt2YXIgcD1uPT11JiYhUihhKSxsPWs9PXUmJiFSKGIpLGs9bj09aztpZigha3x8Z3x8cCl7aWYoIWUmJihuPXAmJnYuY2FsbChhLFwiX193cmFwcGVkX19cIiksbD1sJiZ2LmNhbGwoYixcIl9fd3JhcHBlZF9fXCIpLG58fGwpKXthPWgobj9hLnZhbHVlKCk6YSxsP2IudmFsdWUoKTpcbmIsYyxlLGQsZik7YnJlYWsgYX1pZihrKXtkfHwoZD1bXSk7Znx8KGY9W10pO2ZvcihuPWQubGVuZ3RoO24tLTspaWYoZFtuXT09YSl7YT1mW25dPT1iO2JyZWFrIGF9ZC5wdXNoKGEpO2YucHVzaChiKTthPShnP2tiOmxiKShhLGIsaCxjLGUsZCxmKTtkLnBvcCgpO2YucG9wKCl9ZWxzZSBhPWZhbHNlfWVsc2UgYT1tYihhLGIsbil9cmV0dXJuIGF9ZnVuY3Rpb24gbmIoYSxiKXt2YXIgYz1iLmxlbmd0aCxlPWM7aWYobnVsbD09YSlyZXR1cm4hZTtmb3IoYT15KGEpO2MtLTspe3ZhciBkPWJbY107aWYoZFsyXT9kWzFdIT09YVtkWzBdXTohKGRbMF1pbiBhKSlyZXR1cm4gZmFsc2V9Zm9yKDsrK2M8ZTspe3ZhciBkPWJbY10sZj1kWzBdLGg9YVtmXSxnPWRbMV07aWYoZFsyXSl7aWYoaD09PXAmJiEoZiBpbiBhKSlyZXR1cm4gZmFsc2V9ZWxzZSBpZihkPXAsZD09PXA/IXFhKGcsaCx2b2lkIDAsdHJ1ZSk6IWQpcmV0dXJuIGZhbHNlfXJldHVybiB0cnVlfWZ1bmN0aW9uIERhKGEpe3ZhciBiPW9iKGEpO2lmKDE9PWIubGVuZ3RoJiZcbmJbMF1bMl0pe3ZhciBjPWJbMF1bMF0sZT1iWzBdWzFdO3JldHVybiBmdW5jdGlvbihhKXtpZihudWxsPT1hKXJldHVybiBmYWxzZTthPXkoYSk7cmV0dXJuIGFbY109PT1lJiYoZSE9PXB8fGMgaW4gYSl9fXJldHVybiBmdW5jdGlvbihhKXtyZXR1cm4gbmIoYSxiKX19ZnVuY3Rpb24gY2IoYSxiKXt2YXIgYz14KGEpLGU9SmEoYSkmJmI9PT1iJiYhdChiKSxkPWErXCJcIjthPUthKGEpO3JldHVybiBmdW5jdGlvbihmKXtpZihudWxsPT1mKXJldHVybiBmYWxzZTt2YXIgaD1kO2Y9eShmKTtpZighKCFjJiZlfHxoIGluIGYpKXtpZigxIT1hLmxlbmd0aCl7dmFyIGg9YSxnPTAsbD0tMSxuPS0xLGs9aC5sZW5ndGgsZz1udWxsPT1nPzA6K2d8fDA7MD5nJiYoZz0tZz5rPzA6aytnKTtsPWw9PT1wfHxsPms/azorbHx8MDswPmwmJihsKz1rKTtrPWc+bD8wOmwtZz4+PjA7Zz4+Pj0wO2ZvcihsPUFycmF5KGspOysrbjxrOylsW25dPWhbbitnXTtmPUlhKGYsbCl9aWYobnVsbD09ZilyZXR1cm4gZmFsc2U7aD1MYShhKTtcbmY9eShmKX1yZXR1cm4gZltoXT09PWI/YiE9PXB8fGggaW4gZjpxYShiLGZbaF0scCx0cnVlKX19ZnVuY3Rpb24gTWEoYSl7cmV0dXJuIGZ1bmN0aW9uKGIpe3JldHVybiBudWxsPT1iP3A6eShiKVthXX19ZnVuY3Rpb24gcGIoYSl7dmFyIGI9YStcIlwiO2E9S2EoYSk7cmV0dXJuIGZ1bmN0aW9uKGMpe3JldHVybiBJYShjLGEsYil9fWZ1bmN0aW9uIG9hKGEsYixjKXtpZih0eXBlb2YgYSE9XCJmdW5jdGlvblwiKXJldHVybiBRO2lmKGI9PT1wKXJldHVybiBhO3N3aXRjaChjKXtjYXNlIDE6cmV0dXJuIGZ1bmN0aW9uKGMpe3JldHVybiBhLmNhbGwoYixjKX07Y2FzZSAzOnJldHVybiBmdW5jdGlvbihjLGQsZil7cmV0dXJuIGEuY2FsbChiLGMsZCxmKX07Y2FzZSA0OnJldHVybiBmdW5jdGlvbihjLGQsZixoKXtyZXR1cm4gYS5jYWxsKGIsYyxkLGYsaCl9O2Nhc2UgNTpyZXR1cm4gZnVuY3Rpb24oYyxkLGYsaCxnKXtyZXR1cm4gYS5jYWxsKGIsYyxkLGYsaCxnKX19cmV0dXJuIGZ1bmN0aW9uKCl7cmV0dXJuIGEuYXBwbHkoYixcbmFyZ3VtZW50cyl9fWZ1bmN0aW9uIE5hKGEpe3ZhciBiPW5ldyBxYihhLmJ5dGVMZW5ndGgpOyhuZXcgc2EoYikpLnNldChuZXcgc2EoYSkpO3JldHVybiBifWZ1bmN0aW9uIGtiKGEsYixjLGUsZCxmLGgpe3ZhciBnPS0xLGw9YS5sZW5ndGgsbj1iLmxlbmd0aDtpZihsIT1uJiYhKGQmJm4+bCkpcmV0dXJuIGZhbHNlO2Zvcig7KytnPGw7KXt2YXIgaz1hW2ddLG49YltnXSxtPWU/ZShkP246ayxkP2s6bixnKTpwO2lmKG0hPT1wKXtpZihtKWNvbnRpbnVlO3JldHVybiBmYWxzZX1pZihkKXtpZighYmIoYixmdW5jdGlvbihhKXtyZXR1cm4gaz09PWF8fGMoayxhLGUsZCxmLGgpfSkpcmV0dXJuIGZhbHNlfWVsc2UgaWYoayE9PW4mJiFjKGssbixlLGQsZixoKSlyZXR1cm4gZmFsc2V9cmV0dXJuIHRydWV9ZnVuY3Rpb24gbWIoYSxiLGMpe3N3aXRjaChjKXtjYXNlIEk6Y2FzZSBKOnJldHVybithPT0rYjtjYXNlIEs6cmV0dXJuIGEubmFtZT09Yi5uYW1lJiZhLm1lc3NhZ2U9PWIubWVzc2FnZTtjYXNlIEw6cmV0dXJuIGEhPVxuK2E/YiE9K2I6YT09K2I7Y2FzZSBNOmNhc2UgRDpyZXR1cm4gYT09YitcIlwifXJldHVybiBmYWxzZX1mdW5jdGlvbiBsYihhLGIsYyxlLGQsZixoKXt2YXIgZz1DKGEpLGw9Zy5sZW5ndGgsbj1DKGIpLmxlbmd0aDtpZihsIT1uJiYhZClyZXR1cm4gZmFsc2U7Zm9yKG49bDtuLS07KXt2YXIgaz1nW25dO2lmKCEoZD9rIGluIGI6di5jYWxsKGIsaykpKXJldHVybiBmYWxzZX1mb3IodmFyIG09ZDsrK248bDspe3ZhciBrPWdbbl0scj1hW2tdLHE9YltrXSxzPWU/ZShkP3E6cixkP3I6cSxrKTpwO2lmKHM9PT1wPyFjKHIscSxlLGQsZixoKTohcylyZXR1cm4gZmFsc2U7bXx8KG09XCJjb25zdHJ1Y3RvclwiPT1rKX1yZXR1cm4gbXx8KGM9YS5jb25zdHJ1Y3RvcixlPWIuY29uc3RydWN0b3IsIShjIT1lJiZcImNvbnN0cnVjdG9yXCJpbiBhJiZcImNvbnN0cnVjdG9yXCJpbiBiKXx8dHlwZW9mIGM9PVwiZnVuY3Rpb25cIiYmYyBpbnN0YW5jZW9mIGMmJnR5cGVvZiBlPT1cImZ1bmN0aW9uXCImJmUgaW5zdGFuY2VvZiBlKT90cnVlOmZhbHNlfWZ1bmN0aW9uIG9iKGEpe2E9XG5PYShhKTtmb3IodmFyIGI9YS5sZW5ndGg7Yi0tOyl7dmFyIGM9YVtiXVsxXTthW2JdWzJdPWM9PT1jJiYhdChjKX1yZXR1cm4gYX1mdW5jdGlvbiBWKGEsYil7dmFyIGM9bnVsbD09YT9wOmFbYl07cmV0dXJuIFBhKGMpP2M6cH1mdW5jdGlvbiBkYihhKXt2YXIgYj1hLmxlbmd0aCxjPW5ldyBhLmNvbnN0cnVjdG9yKGIpO2ImJlwic3RyaW5nXCI9PXR5cGVvZiBhWzBdJiZ2LmNhbGwoYSxcImluZGV4XCIpJiYoYy5pbmRleD1hLmluZGV4LGMuaW5wdXQ9YS5pbnB1dCk7cmV0dXJuIGN9ZnVuY3Rpb24gZWIoYSl7YT1hLmNvbnN0cnVjdG9yO3R5cGVvZiBhPT1cImZ1bmN0aW9uXCImJmEgaW5zdGFuY2VvZiBhfHwoYT1PYmplY3QpO3JldHVybiBuZXcgYX1mdW5jdGlvbiBmYihhLGIsYyl7dmFyIGU9YS5jb25zdHJ1Y3Rvcjtzd2l0Y2goYil7Y2FzZSB0YTpyZXR1cm4gTmEoYSk7Y2FzZSBJOmNhc2UgSjpyZXR1cm4gbmV3IGUoK2EpO2Nhc2UgVzpjYXNlIFg6Y2FzZSBZOmNhc2UgWjpjYXNlICQ6Y2FzZSBhYTpjYXNlIGJhOmNhc2UgY2E6Y2FzZSBkYTpyZXR1cm4gZSBpbnN0YW5jZW9mXG5lJiYoZT16W2JdKSxiPWEuYnVmZmVyLG5ldyBlKGM/TmEoYik6YixhLmJ5dGVPZmZzZXQsYS5sZW5ndGgpO2Nhc2UgTDpjYXNlIEQ6cmV0dXJuIG5ldyBlKGEpO2Nhc2UgTTp2YXIgZD1uZXcgZShhLnNvdXJjZSxyYi5leGVjKGEpKTtkLmxhc3RJbmRleD1hLmxhc3RJbmRleH1yZXR1cm4gZH1mdW5jdGlvbiBTKGEpe3JldHVybiBudWxsIT1hJiZOKHNiKGEpKX1mdW5jdGlvbiBlYShhLGIpe2E9dHlwZW9mIGE9PVwibnVtYmVyXCJ8fHRiLnRlc3QoYSk/K2E6LTE7Yj1udWxsPT1iP1FhOmI7cmV0dXJuLTE8YSYmMD09YSUxJiZhPGJ9ZnVuY3Rpb24gUmEoYSxiLGMpe2lmKCF0KGMpKXJldHVybiBmYWxzZTt2YXIgZT10eXBlb2YgYjtyZXR1cm4oXCJudW1iZXJcIj09ZT9TKGMpJiZlYShiLGMubGVuZ3RoKTpcInN0cmluZ1wiPT1lJiZiIGluIGMpPyhiPWNbYl0sYT09PWE/YT09PWI6YiE9PWIpOmZhbHNlfWZ1bmN0aW9uIEphKGEpe3ZhciBiPXR5cGVvZiBhO3JldHVyblwic3RyaW5nXCI9PWImJnViLnRlc3QoYSl8fFxuXCJudW1iZXJcIj09Yj90cnVlOngoYSk/ZmFsc2U6IXZiLnRlc3QoYSl8fGZhbHNlfWZ1bmN0aW9uIE4oYSl7cmV0dXJuIHR5cGVvZiBhPT1cIm51bWJlclwiJiYtMTxhJiYwPT1hJTEmJmE8PVFhfWZ1bmN0aW9uIHdiKGEsYil7YT15KGEpO2Zvcih2YXIgYz0tMSxlPWIubGVuZ3RoLGQ9e307KytjPGU7KXt2YXIgZj1iW2NdO2YgaW4gYSYmKGRbZl09YVtmXSl9cmV0dXJuIGR9ZnVuY3Rpb24geGIoYSxiKXt2YXIgYz17fTtqYihhLGZ1bmN0aW9uKGEsZCxmKXtiKGEsZCxmKSYmKGNbZF09YSl9KTtyZXR1cm4gY31mdW5jdGlvbiBTYShhKXtmb3IodmFyIGI9VShhKSxjPWIubGVuZ3RoLGU9YyYmYS5sZW5ndGgsZD0hIWUmJk4oZSkmJih4KGEpfHxUKGEpfHxmYShhKSksZj0tMSxoPVtdOysrZjxjOyl7dmFyIGc9YltmXTsoZCYmZWEoZyxlKXx8di5jYWxsKGEsZykpJiZoLnB1c2goZyl9cmV0dXJuIGh9ZnVuY3Rpb24geShhKXtpZihtLnN1cHBvcnQudW5pbmRleGVkQ2hhcnMmJmZhKGEpKXtmb3IodmFyIGI9LTEsXG5jPWEubGVuZ3RoLGU9T2JqZWN0KGEpOysrYjxjOyllW2JdPWEuY2hhckF0KGIpO3JldHVybiBlfXJldHVybiB0KGEpP2E6T2JqZWN0KGEpfWZ1bmN0aW9uIEthKGEpe2lmKHgoYSkpcmV0dXJuIGE7dmFyIGI9W107KG51bGw9PWE/XCJcIjphK1wiXCIpLnJlcGxhY2UoeWIsZnVuY3Rpb24oYSxlLGQsZil7Yi5wdXNoKGQ/Zi5yZXBsYWNlKHpiLFwiJDFcIik6ZXx8YSl9KTtyZXR1cm4gYn1mdW5jdGlvbiBwYShhLGIsYyl7dmFyIGU9YT9hLmxlbmd0aDowO2lmKCFlKXJldHVybi0xO2lmKHR5cGVvZiBjPT1cIm51bWJlclwiKWM9MD5jP3VhKGUrYywwKTpjO2Vsc2UgaWYoYyl7Yz0wO3ZhciBkPWE/YS5sZW5ndGg6YztpZih0eXBlb2YgYj09XCJudW1iZXJcIiYmYj09PWImJmQ8PUFiKXtmb3IoO2M8ZDspe3ZhciBmPWMrZD4+PjEsaD1hW2ZdO2g8YiYmbnVsbCE9PWg/Yz1mKzE6ZD1mfWM9ZH1lbHNle2Q9UTtjPWQoYik7Zm9yKHZhciBmPTAsaD1hP2EubGVuZ3RoOjAsZz1jIT09YyxsPW51bGw9PT1jLG49XG5jPT09cDtmPGg7KXt2YXIgaz1CYigoZitoKS8yKSxtPWQoYVtrXSkscj1tIT09cCxxPW09PT1tOyhnP3E6bD9xJiZyJiZudWxsIT1tOm4/cSYmcjpudWxsPT1tPzA6bTxjKT9mPWsrMTpoPWt9Yz1DYihoLERiKX1yZXR1cm4gYzxlJiYoYj09PWI/Yj09PWFbY106YVtjXSE9PWFbY10pP2M6LTF9cmV0dXJuIG5hKGEsYixjfHwwKX1mdW5jdGlvbiBMYShhKXt2YXIgYj1hP2EubGVuZ3RoOjA7cmV0dXJuIGI/YVtiLTFdOnB9ZnVuY3Rpb24gZ2EoYSxiKXtpZih0eXBlb2YgYSE9XCJmdW5jdGlvblwiKXRocm93IG5ldyBUeXBlRXJyb3IoRWIpO2I9dWEoYj09PXA/YS5sZW5ndGgtMTorYnx8MCwwKTtyZXR1cm4gZnVuY3Rpb24oKXtmb3IodmFyIGM9YXJndW1lbnRzLGU9LTEsZD11YShjLmxlbmd0aC1iLDApLGY9QXJyYXkoZCk7KytlPGQ7KWZbZV09Y1tiK2VdO3N3aXRjaChiKXtjYXNlIDA6cmV0dXJuIGEuY2FsbCh0aGlzLGYpO2Nhc2UgMTpyZXR1cm4gYS5jYWxsKHRoaXMsY1swXSxmKTtjYXNlIDI6cmV0dXJuIGEuY2FsbCh0aGlzLFxuY1swXSxjWzFdLGYpfWQ9QXJyYXkoYisxKTtmb3IoZT0tMTsrK2U8YjspZFtlXT1jW2VdO2RbYl09ZjtyZXR1cm4gYS5hcHBseSh0aGlzLGQpfX1mdW5jdGlvbiBUKGEpe3JldHVybiBBKGEpJiZTKGEpJiZ2LmNhbGwoYSxcImNhbGxlZVwiKSYmIWhhLmNhbGwoYSxcImNhbGxlZVwiKX1mdW5jdGlvbiBpYShhKXtyZXR1cm4gdChhKSYmQi5jYWxsKGEpPT1HfWZ1bmN0aW9uIHQoYSl7dmFyIGI9dHlwZW9mIGE7cmV0dXJuISFhJiYoXCJvYmplY3RcIj09Ynx8XCJmdW5jdGlvblwiPT1iKX1mdW5jdGlvbiBQYShhKXtyZXR1cm4gbnVsbD09YT9mYWxzZTppYShhKT9UYS50ZXN0KFVhLmNhbGwoYSkpOkEoYSkmJihSKGEpP1RhOkZiKS50ZXN0KGEpfWZ1bmN0aW9uIGZhKGEpe3JldHVybiB0eXBlb2YgYT09XCJzdHJpbmdcInx8QShhKSYmQi5jYWxsKGEpPT1EfWZ1bmN0aW9uIHJhKGEpe3JldHVybiBBKGEpJiZOKGEubGVuZ3RoKSYmISFxW0IuY2FsbChhKV19ZnVuY3Rpb24gVShhKXtpZihudWxsPT1hKXJldHVybltdO1xudChhKXx8KGE9T2JqZWN0KGEpKTtmb3IodmFyIGI9YS5sZW5ndGgsYz1tLnN1cHBvcnQsYj1iJiZOKGIpJiYoeChhKXx8VChhKXx8ZmEoYSkpJiZifHwwLGU9YS5jb25zdHJ1Y3RvcixkPS0xLGU9aWEoZSkmJmUucHJvdG90eXBlfHxGLGY9ZT09PWEsaD1BcnJheShiKSxnPTA8YixsPWMuZW51bUVycm9yUHJvcHMmJihhPT09amF8fGEgaW5zdGFuY2VvZiBFcnJvciksbj1jLmVudW1Qcm90b3R5cGVzJiZpYShhKTsrK2Q8YjspaFtkXT1kK1wiXCI7Zm9yKHZhciBrIGluIGEpbiYmXCJwcm90b3R5cGVcIj09a3x8bCYmKFwibWVzc2FnZVwiPT1rfHxcIm5hbWVcIj09ayl8fGcmJmVhKGssYil8fFwiY29uc3RydWN0b3JcIj09ayYmKGZ8fCF2LmNhbGwoYSxrKSl8fGgucHVzaChrKTtpZihjLm5vbkVudW1TaGFkb3dzJiZhIT09Rilmb3IoYj1hPT09R2I/RDphPT09amE/SzpCLmNhbGwoYSksYz1zW2JdfHxzW3VdLGI9PXUmJihlPUYpLGI9dmEubGVuZ3RoO2ItLTspaz12YVtiXSxkPWNba10sZiYmZHx8KGQ/IXYuY2FsbChhLFxuayk6YVtrXT09PWVba10pfHxoLnB1c2goayk7cmV0dXJuIGh9ZnVuY3Rpb24gT2EoYSl7YT15KGEpO2Zvcih2YXIgYj0tMSxjPUMoYSksZT1jLmxlbmd0aCxkPUFycmF5KGUpOysrYjxlOyl7dmFyIGY9Y1tiXTtkW2JdPVtmLGFbZl1dfXJldHVybiBkfWZ1bmN0aW9uIGthKGEsYixjKXtjJiZSYShhLGIsYykmJihiPXApO3JldHVybiBBKGEpP1ZhKGEpOkNhKGEsYil9ZnVuY3Rpb24gUShhKXtyZXR1cm4gYX1mdW5jdGlvbiBWYShhKXtyZXR1cm4gRGEoRmEoYSx0cnVlKSl9ZnVuY3Rpb24gRWEoYSl7cmV0dXJuIEphKGEpP01hKGEpOnBiKGEpfXZhciBwLGliPTIwMCxFYj1cIkV4cGVjdGVkIGEgZnVuY3Rpb25cIixIPVwiW29iamVjdCBBcmd1bWVudHNdXCIsRT1cIltvYmplY3QgQXJyYXldXCIsST1cIltvYmplY3QgQm9vbGVhbl1cIixKPVwiW29iamVjdCBEYXRlXVwiLEs9XCJbb2JqZWN0IEVycm9yXVwiLEc9XCJbb2JqZWN0IEZ1bmN0aW9uXVwiLEw9XCJbb2JqZWN0IE51bWJlcl1cIix1PVwiW29iamVjdCBPYmplY3RdXCIsXG5NPVwiW29iamVjdCBSZWdFeHBdXCIsRD1cIltvYmplY3QgU3RyaW5nXVwiLHRhPVwiW29iamVjdCBBcnJheUJ1ZmZlcl1cIixXPVwiW29iamVjdCBGbG9hdDMyQXJyYXldXCIsWD1cIltvYmplY3QgRmxvYXQ2NEFycmF5XVwiLFk9XCJbb2JqZWN0IEludDhBcnJheV1cIixaPVwiW29iamVjdCBJbnQxNkFycmF5XVwiLCQ9XCJbb2JqZWN0IEludDMyQXJyYXldXCIsYWE9XCJbb2JqZWN0IFVpbnQ4QXJyYXldXCIsYmE9XCJbb2JqZWN0IFVpbnQ4Q2xhbXBlZEFycmF5XVwiLGNhPVwiW29iamVjdCBVaW50MTZBcnJheV1cIixkYT1cIltvYmplY3QgVWludDMyQXJyYXldXCIsdmI9L1xcLnxcXFsoPzpbXltcXF1dKnwoW1wiJ10pKD86KD8hXFwxKVteXFxuXFxcXF18XFxcXC4pKj9cXDEpXFxdLyx1Yj0vXlxcdyokLyx5Yj0vW14uW1xcXV0rfFxcWyg/OigtP1xcZCsoPzpcXC5cXGQrKT8pfChbXCInXSkoKD86KD8hXFwyKVteXFxuXFxcXF18XFxcXC4pKj8pXFwyKVxcXS9nLHpiPS9cXFxcKFxcXFwpPy9nLHJiPS9cXHcqJC8sRmI9L15cXFtvYmplY3QgLis/Q29uc3RydWN0b3JcXF0kLyx0Yj0vXlxcZCskLyxcbnZhPVwiY29uc3RydWN0b3IgaGFzT3duUHJvcGVydHkgaXNQcm90b3R5cGVPZiBwcm9wZXJ0eUlzRW51bWVyYWJsZSB0b0xvY2FsZVN0cmluZyB0b1N0cmluZyB2YWx1ZU9mXCIuc3BsaXQoXCIgXCIpLHE9e307cVtXXT1xW1hdPXFbWV09cVtaXT1xWyRdPXFbYWFdPXFbYmFdPXFbY2FdPXFbZGFdPXRydWU7cVtIXT1xW0VdPXFbdGFdPXFbSV09cVtKXT1xW0tdPXFbR109cVtcIltvYmplY3QgTWFwXVwiXT1xW0xdPXFbdV09cVtNXT1xW1wiW29iamVjdCBTZXRdXCJdPXFbRF09cVtcIltvYmplY3QgV2Vha01hcF1cIl09ZmFsc2U7dmFyIHI9e307cltIXT1yW0VdPXJbdGFdPXJbSV09cltKXT1yW1ddPXJbWF09cltZXT1yW1pdPXJbJF09cltMXT1yW3VdPXJbTV09cltEXT1yW2FhXT1yW2JhXT1yW2NhXT1yW2RhXT10cnVlO3JbS109cltHXT1yW1wiW29iamVjdCBNYXBdXCJdPXJbXCJbb2JqZWN0IFNldF1cIl09cltcIltvYmplY3QgV2Vha01hcF1cIl09ZmFsc2U7dmFyIGxhPXtcImZ1bmN0aW9uXCI6dHJ1ZSxvYmplY3Q6dHJ1ZX0sbWE9bGFbdHlwZW9mIGV4cG9ydHNdJiZcbmV4cG9ydHMmJiFleHBvcnRzLm5vZGVUeXBlJiZleHBvcnRzLE89bGFbdHlwZW9mIG1vZHVsZV0mJm1vZHVsZSYmIW1vZHVsZS5ub2RlVHlwZSYmbW9kdWxlLEhiPWxhW3R5cGVvZiBzZWxmXSYmc2VsZiYmc2VsZi5PYmplY3QmJnNlbGYsV2E9bGFbdHlwZW9mIHdpbmRvd10mJndpbmRvdyYmd2luZG93Lk9iamVjdCYmd2luZG93LEliPU8mJk8uZXhwb3J0cz09PW1hJiZtYSx3PW1hJiZPJiZ0eXBlb2YgZ2xvYmFsPT1cIm9iamVjdFwiJiZnbG9iYWwmJmdsb2JhbC5PYmplY3QmJmdsb2JhbHx8V2EhPT0odGhpcyYmdGhpcy53aW5kb3cpJiZXYXx8SGJ8fHRoaXMsUj1mdW5jdGlvbigpe3RyeXtPYmplY3Qoe3RvU3RyaW5nOjB9K1wiXCIpfWNhdGNoKGEpe3JldHVybiBmdW5jdGlvbigpe3JldHVybiBmYWxzZX19cmV0dXJuIGZ1bmN0aW9uKGEpe3JldHVybiB0eXBlb2YgYS50b1N0cmluZyE9XCJmdW5jdGlvblwiJiZ0eXBlb2YoYStcIlwiKT09XCJzdHJpbmdcIn19KCksSmI9QXJyYXkucHJvdG90eXBlLGphPUVycm9yLnByb3RvdHlwZSxcbkY9T2JqZWN0LnByb3RvdHlwZSxHYj1TdHJpbmcucHJvdG90eXBlLFVhPUZ1bmN0aW9uLnByb3RvdHlwZS50b1N0cmluZyx2PUYuaGFzT3duUHJvcGVydHksQj1GLnRvU3RyaW5nLFRhPVJlZ0V4cChcIl5cIitVYS5jYWxsKHYpLnJlcGxhY2UoL1tcXFxcXiQuKis/KClbXFxde318XS9nLFwiXFxcXCQmXCIpLnJlcGxhY2UoL2hhc093blByb3BlcnR5fChmdW5jdGlvbikuKj8oPz1cXFxcXFwoKXwgZm9yIC4rPyg/PVxcXFxcXF0pL2csXCIkMS4qP1wiKStcIiRcIikscWI9dy5BcnJheUJ1ZmZlcixoYT1GLnByb3BlcnR5SXNFbnVtZXJhYmxlLHphPVYodyxcIlNldFwiKSxYYT1KYi5zcGxpY2Usc2E9dy5VaW50OEFycmF5LHlhPVYoT2JqZWN0LFwiY3JlYXRlXCIpLEJiPU1hdGguZmxvb3IsS2I9VihBcnJheSxcImlzQXJyYXlcIiksWWE9VihPYmplY3QsXCJrZXlzXCIpLHVhPU1hdGgubWF4LENiPU1hdGgubWluLERiPTQyOTQ5NjcyOTQsQWI9MjE0NzQ4MzY0NyxRYT05MDA3MTk5MjU0NzQwOTkxLHo9e307eltXXT13LkZsb2F0MzJBcnJheTtcbnpbWF09dy5GbG9hdDY0QXJyYXk7eltZXT13LkludDhBcnJheTt6W1pdPXcuSW50MTZBcnJheTt6WyRdPXcuSW50MzJBcnJheTt6W2FhXT1zYTt6W2JhXT13LlVpbnQ4Q2xhbXBlZEFycmF5O3pbY2FdPXcuVWludDE2QXJyYXk7eltkYV09dy5VaW50MzJBcnJheTt2YXIgcz17fTtzW0VdPXNbSl09c1tMXT17Y29uc3RydWN0b3I6dHJ1ZSx0b0xvY2FsZVN0cmluZzp0cnVlLHRvU3RyaW5nOnRydWUsdmFsdWVPZjp0cnVlfTtzW0ldPXNbRF09e2NvbnN0cnVjdG9yOnRydWUsdG9TdHJpbmc6dHJ1ZSx2YWx1ZU9mOnRydWV9O3NbS109c1tHXT1zW01dPXtjb25zdHJ1Y3Rvcjp0cnVlLHRvU3RyaW5nOnRydWV9O3NbdV09e2NvbnN0cnVjdG9yOnRydWV9O0FhKHZhLGZ1bmN0aW9uKGEpe2Zvcih2YXIgYiBpbiBzKWlmKHYuY2FsbChzLGIpKXt2YXIgYz1zW2JdO2NbYV09di5jYWxsKGMsYSl9fSk7dmFyIFA9bS5zdXBwb3J0PXt9OyhmdW5jdGlvbihhKXtmdW5jdGlvbiBiKCl7dGhpcy54PWF9dmFyIGM9ezA6YSxsZW5ndGg6YX0sXG5lPVtdO2IucHJvdG90eXBlPXt2YWx1ZU9mOmEseTphfTtmb3IodmFyIGQgaW4gbmV3IGIpZS5wdXNoKGQpO1AuZW51bUVycm9yUHJvcHM9aGEuY2FsbChqYSxcIm1lc3NhZ2VcIil8fGhhLmNhbGwoamEsXCJuYW1lXCIpO1AuZW51bVByb3RvdHlwZXM9aGEuY2FsbChiLFwicHJvdG90eXBlXCIpO1Aubm9uRW51bVNoYWRvd3M9IS92YWx1ZU9mLy50ZXN0KGUpO1Auc3BsaWNlT2JqZWN0cz0oWGEuY2FsbChjLDAsMSksIWNbMF0pO1AudW5pbmRleGVkQ2hhcnM9XCJ4eFwiIT1cInhcIlswXStPYmplY3QoXCJ4XCIpWzBdfSkoMSwwKTt2YXIgSGE9ZnVuY3Rpb24oYSl7cmV0dXJuIGZ1bmN0aW9uKGIsYyxlKXt2YXIgZD15KGIpO2U9ZShiKTtmb3IodmFyIGY9ZS5sZW5ndGgsaD1hP2Y6LTE7YT9oLS06KytoPGY7KXt2YXIgZz1lW2hdO2lmKGZhbHNlPT09YyhkW2ddLGcsZCkpYnJlYWt9cmV0dXJuIGJ9fSgpLHNiPU1hKFwibGVuZ3RoXCIpLHg9S2J8fGZ1bmN0aW9uKGEpe3JldHVybiBBKGEpJiZOKGEubGVuZ3RoKSYmQi5jYWxsKGEpPT1cbkV9LHdhPWZ1bmN0aW9uKGEpe3JldHVybiBnYShmdW5jdGlvbihiLGMpe3ZhciBlPS0xLGQ9bnVsbD09Yj8wOmMubGVuZ3RoLGY9MjxkP2NbZC0yXTpwLGg9MjxkP2NbMl06cCxnPTE8ZD9jW2QtMV06cDt0eXBlb2YgZj09XCJmdW5jdGlvblwiPyhmPW9hKGYsZyw1KSxkLT0yKTooZj10eXBlb2YgZz09XCJmdW5jdGlvblwiP2c6cCxkLT1mPzE6MCk7aCYmUmEoY1swXSxjWzFdLGgpJiYoZj0zPmQ/cDpmLGQ9MSk7Zm9yKDsrK2U8ZDspKGg9Y1tlXSkmJmEoYixoLGYpO3JldHVybiBifSl9KGZ1bmN0aW9uKGEsYixjKXtpZihjKWZvcih2YXIgZT0tMSxkPUMoYiksZj1kLmxlbmd0aDsrK2U8Zjspe3ZhciBoPWRbZV0sZz1hW2hdLGw9YyhnLGJbaF0saCxhLGIpOyhsPT09bD9sPT09ZzpnIT09ZykmJihnIT09cHx8aCBpbiBhKXx8KGFbaF09bCl9ZWxzZSBhPUJhKGEsYik7cmV0dXJuIGF9KSxMYj1mdW5jdGlvbihhLGIpe3JldHVybiBnYShmdW5jdGlvbihjKXt2YXIgZT1jWzBdO2lmKG51bGw9PWUpcmV0dXJuIGU7XG5jLnB1c2goYik7cmV0dXJuIGEuYXBwbHkocCxjKX0pfSh3YSxmdW5jdGlvbihhLGIpe3JldHVybiBhPT09cD9iOmF9KSxDPVlhP2Z1bmN0aW9uKGEpe3ZhciBiPW51bGw9PWE/cDphLmNvbnN0cnVjdG9yO3JldHVybiB0eXBlb2YgYj09XCJmdW5jdGlvblwiJiZiLnByb3RvdHlwZT09PWF8fCh0eXBlb2YgYT09XCJmdW5jdGlvblwiP20uc3VwcG9ydC5lbnVtUHJvdG90eXBlczpTKGEpKT9TYShhKTp0KGEpP1lhKGEpOltdfTpTYSxNYj1nYShmdW5jdGlvbihhLGIpe2lmKG51bGw9PWEpcmV0dXJue307aWYoXCJmdW5jdGlvblwiIT10eXBlb2YgYlswXSlyZXR1cm4gYj1hYihHYShiKSksd2IoYSxoYihVKGEpLGIpKTt2YXIgYz1vYShiWzBdLGJbMV0sMyk7cmV0dXJuIHhiKGEsZnVuY3Rpb24oYSxiLGYpe3JldHVybiFjKGEsYixmKX0pfSk7eGEucHJvdG90eXBlLnB1c2g9ZnVuY3Rpb24oYSl7dmFyIGI9dGhpcy5kYXRhO3R5cGVvZiBhPT1cInN0cmluZ1wifHx0KGEpP2Iuc2V0LmFkZChhKTpiLmhhc2hbYV09XG4hMH07bS5hc3NpZ249d2E7bS5jYWxsYmFjaz1rYTttLmRlZmF1bHRzPUxiO20ua2V5cz1DO20ua2V5c0luPVU7bS5tYXRjaGVzPVZhO20ub21pdD1NYjttLnBhaXJzPU9hO20ucHJvcGVydHk9RWE7bS5yZW1vdmU9ZnVuY3Rpb24oYSxiLGMpe3ZhciBlPVtdO2lmKCFhfHwhYS5sZW5ndGgpcmV0dXJuIGU7dmFyIGQ9LTEsZj1bXSxoPWEubGVuZ3RoLGc9bS5jYWxsYmFja3x8a2EsZz1nPT09a2E/Q2E6Zztmb3IoYj1nKGIsYywzKTsrK2Q8aDspYz1hW2RdLGIoYyxkLGEpJiYoZS5wdXNoKGMpLGYucHVzaChkKSk7Zm9yKGI9YT9mLmxlbmd0aDowO2ItLTspaWYoZD1mW2JdLGQhPWwmJmVhKGQpKXt2YXIgbD1kO1hhLmNhbGwoYSxkLDEpfXJldHVybiBlfTttLnJlc3RQYXJhbT1nYTttLmV4dGVuZD13YTttLml0ZXJhdGVlPWthO20uaWRlbnRpdHk9UTttLmluZGV4T2Y9cGE7bS5pc0FyZ3VtZW50cz1UO20uaXNBcnJheT14O20uaXNGdW5jdGlvbj1pYTttLmlzTmF0aXZlPVBhO20uaXNPYmplY3Q9XG50O20uaXNTdHJpbmc9ZmE7bS5pc1R5cGVkQXJyYXk9cmE7bS5sYXN0PUxhO20uVkVSU0lPTj1cIjMuMTAuMVwiO21hJiZPJiZJYiYmKChPLmV4cG9ydHM9bSkuXz1tKX0uY2FsbCh0aGlzKSk7Il19
