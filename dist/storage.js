"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

// a thin wrapper around localStorage checking if localStorage is available
class Storage {
  constructor(namespace = "alephbet") {
    this.namespace = namespace;

    try {
      const check = "localstorage_check";
      localStorage.setItem(check, check);
      localStorage.removeItem(check);
      this.storage = JSON.parse(localStorage.getItem(this.namespace) || "{}");
    } catch (_unused) {
      throw new Error("localStorage is not available");
    }
  }

  set(key, value) {
    this.storage[key] = value;
    localStorage.setItem(this.namespace, JSON.stringify(this.storage));
    return value;
  }

  get(key) {
    return this.storage[key];
  }

}

var _default = Storage;
exports.default = _default;