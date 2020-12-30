"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _uuid = require("uuid");

var _options = _interopRequireDefault(require("./options"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const sha1 = require("sha1");

const Utils = {
  keys: Object.keys,
  uuid: _uuid.v4,
  defaults: (obj, defaults) => {
    for (const key in defaults) {
      const value = defaults[key];

      if (obj[key] === undefined) {
        obj[key] = value;
      }
    }

    return obj;
  },
  remove: (list, callback) => {
    const deletions = [];
    const iterable = [...list];

    for (let index = 0; index < iterable.length; index++) {
      const el = iterable[index];

      if (callback(el, index)) {
        list.splice(list.indexOf(el), 1);
        deletions.push(el);
      }
    }

    return deletions;
  },
  omit: (obj, ...keys) => {
    const results = _objectSpread({}, obj);

    for (const key of Array.from([].concat.apply([], keys))) {
      delete results[key];
    }

    return results;
  },
  log: message => {
    if (_options.default.debug) {
      // eslint-disable-next-line no-console
      console.log(message);
    }
  },
  sha1: text => sha1(text).toString(),

  random(seed) {
    if (!seed) return Math.random(); // a MUCH simplified version inspired by PlanOut.js

    return parseInt(this.sha1(seed).substr(0, 13), 16) / 0xFFFFFFFFFFFFF;
  },

  check_weights: variants => {
    const contains_weight = [];

    for (const key in variants) {
      const value = variants[key];
      contains_weight.push(value.weight != null);
    }

    return contains_weight.every(has_weight => has_weight);
  },
  sum_weights: variants => {
    let sum = 0;

    for (const key in variants) {
      const value = variants[key];
      sum += value.weight || 0;
    }

    return sum;
  },
  validate_weights: variants => {
    const contains_weight = [];

    for (const value of Object.values(variants)) {
      contains_weight.push(value.weight != null);
    }

    return contains_weight.every(has_weight => has_weight || contains_weight.every(has_weight => !has_weight));
  }
};
var _default = Utils;
exports.default = _default;