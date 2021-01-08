function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// a thin wrapper around localStorage checking if localStorage is available
var Storage = /*#__PURE__*/function () {
  function Storage() {
    var namespace = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "alephbet";

    _classCallCheck(this, Storage);

    this.namespace = namespace;

    try {
      var check = "localstorage_check";
      localStorage.setItem(check, check);
      localStorage.removeItem(check);
      this.storage = JSON.parse(localStorage.getItem(this.namespace) || "{}");
    } catch (_unused) {
      throw new Error("localStorage is not available");
    }
  }

  _createClass(Storage, [{
    key: "set",
    value: function set(key, value) {
      this.storage[key] = value;
      localStorage.setItem(this.namespace, JSON.stringify(this.storage));
      return value;
    }
  }, {
    key: "get",
    value: function get(key) {
      return this.storage[key];
    }
  }]);

  return Storage;
}();

export default Storage;