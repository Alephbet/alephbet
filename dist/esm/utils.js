function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

import { v4 } from "uuid";
import options from "./options";

var _sha = require("sha1");

var Utils = {
  keys: Object.keys,
  uuid: v4,
  defaults: function defaults(obj, _defaults) {
    for (var key in _defaults) {
      var value = _defaults[key];

      if (obj[key] === undefined) {
        obj[key] = value;
      }
    }

    return obj;
  },
  remove: function remove(list, callback) {
    var deletions = [];

    var iterable = _toConsumableArray(list);

    for (var index = 0; index < iterable.length; index++) {
      var el = iterable[index];

      if (callback(el, index)) {
        list.splice(list.indexOf(el), 1);
        deletions.push(el);
      }
    }

    return deletions;
  },
  omit: function omit(obj) {
    var results = _objectSpread({}, obj);

    for (var _len = arguments.length, keys = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      keys[_key - 1] = arguments[_key];
    }

    for (var _i = 0, _Array$from = Array.from([].concat.apply([], keys)); _i < _Array$from.length; _i++) {
      var key = _Array$from[_i];
      delete results[key];
    }

    return results;
  },
  log: function log(message) {
    if (options.debug) {
      // eslint-disable-next-line no-console
      console.log(message);
    }
  },
  sha1: function sha1(text) {
    return _sha(text).toString();
  },
  random: function random(seed) {
    if (!seed) return Math.random(); // a MUCH simplified version inspired by PlanOut.js

    return parseInt(this.sha1(seed).substr(0, 13), 16) / 0xFFFFFFFFFFFFF;
  },
  check_weights: function check_weights(variants) {
    var contains_weight = [];

    for (var key in variants) {
      var value = variants[key];
      contains_weight.push(value.weight != null);
    }

    return contains_weight.every(function (has_weight) {
      return has_weight;
    });
  },
  sum_weights: function sum_weights(variants) {
    var sum = 0;

    for (var key in variants) {
      var value = variants[key];
      sum += value.weight || 0;
    }

    return sum;
  },
  validate_weights: function validate_weights(variants) {
    var contains_weight = [];

    for (var _i2 = 0, _Object$values = Object.values(variants); _i2 < _Object$values.length; _i2++) {
      var value = _Object$values[_i2];
      contains_weight.push(value.weight != null);
    }

    return contains_weight.every(function (has_weight) {
      return has_weight || contains_weight.every(function (has_weight) {
        return !has_weight;
      });
    });
  }
};
export default Utils;