function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import Storage from "./storage";
import utils from "./utils"; // # A parent class Adapter for using the Alephbet backend API.
// # uses jQuery to send data if `$.ajax` is found. Falls back on plain js xhr
// # params:
// # - url: track URL to post events to
// # - namepsace (optional): allows setting different environments etc
// # - storage (optional): storage adapter for the queue

export var AlephbetAdapter = /*#__PURE__*/function () {
  function AlephbetAdapter(url) {
    var namespace = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "alephbet";
    var storage = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : LocalStorageAdapter;

    _classCallCheck(this, AlephbetAdapter);

    this._storage = storage;
    this.url = url;
    this.namespace = namespace;
    this._queue = JSON.parse(this._storage.get(this.queue_name) || "[]");

    this._flush();
  }

  _createClass(AlephbetAdapter, [{
    key: "_remove_quuid",
    value: function _remove_quuid(quuid) {
      var _this = this;

      return function (err, _res) {
        if (err) return;
        utils.remove(_this._queue, function (el) {
          return el.properties._quuid === quuid;
        });

        _this._storage.set(_this.queue_name, JSON.stringify(_this._queue));
      };
    }
  }, {
    key: "_jquery_get",
    value: function _jquery_get(url, data, callback) {
      utils.log("send request using jQuery");
      return window.jQuery.ajax({
        method: "GET",
        url: url,
        data: data,
        success: callback
      });
    }
  }, {
    key: "_plain_js_get",
    value: function _plain_js_get(url, data, callback) {
      utils.log("fallback on plain js xhr");
      var xhr = new XMLHttpRequest();
      var params = [];

      for (var _i = 0, _Object$keys = Object.keys(data); _i < _Object$keys.length; _i++) {
        var key = _Object$keys[_i];
        params.push("".concat(encodeURIComponent(key), "=").concat(encodeURIComponent(data[key])));
      }

      params = params.join("&").replace(/%20/g, "+");
      xhr.open("GET", "".concat(url, "?").concat(params));

      xhr.onload = function () {
        if (xhr.status === 200) callback();
      };

      return xhr.send();
    }
  }, {
    key: "_ajax_get",
    value: function _ajax_get(url, data, callback) {
      var _window$jQuery;

      if ((_window$jQuery = window.jQuery) !== null && _window$jQuery !== void 0 && _window$jQuery.ajax) {
        return this._jquery_get(url, data, callback);
      }

      return this._plain_js_get(url, data, callback);
    }
  }, {
    key: "_flush",
    value: function _flush() {
      var _iterator = _createForOfIteratorHelper(this._queue),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var item = _step.value;

          var callback = this._remove_quuid(item.properties._quuid);

          this._ajax_get(this.url, utils.omit(item.properties, "_quuid"), callback);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }, {
    key: "_user_uuid",
    value: function _user_uuid(experiment, goal) {
      if (!experiment.user_id) return utils.uuid(); // if goal is not unique, we track it every time. return a new random uuid

      if (!goal.unique) return utils.uuid(); // for a given user id, namespace, goal and experiment, the uuid will always be the same
      // this avoids counting goals twice for the same user across different devices

      return utils.sha1("".concat(this.namespace, ".").concat(experiment.name, ".").concat(goal.name, ".").concat(experiment.user_id));
    }
  }, {
    key: "_track",
    value: function _track(experiment, variant, goal) {
      utils.log("Persistent Queue track: " + "".concat(this.namespace, ", ").concat(experiment.name, ", ").concat(variant, ", ").concat(goal.name));
      if (this._queue.length > 100) this._queue.shift();

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

      this._flush();
    }
  }, {
    key: "experiment_start",
    value: function experiment_start(experiment, variant) {
      this._track(experiment, variant, {
        name: "participate",
        unique: true
      });
    }
  }, {
    key: "goal_complete",
    value: function goal_complete(experiment, variant, goal_name, props) {
      this._track(experiment, variant, utils.defaults({
        name: goal_name
      }, props));
    }
  }]);

  return AlephbetAdapter;
}(); // # Adapter for using the lamed backend. See https://github.com/Alephbet/lamed
// # inherits from AlephbetAdapter which uses the same backend API
// #

_defineProperty(AlephbetAdapter, "queue_name", "_alephbet_queue");

export var LamedAdapter = /*#__PURE__*/function (_AlephbetAdapter) {
  _inherits(LamedAdapter, _AlephbetAdapter);

  var _super = _createSuper(LamedAdapter);

  function LamedAdapter() {
    _classCallCheck(this, LamedAdapter);

    return _super.apply(this, arguments);
  }

  return LamedAdapter;
}(AlephbetAdapter); // # Adapter for using the gimel backend. See https://github.com/Alephbet/gimel
// # The main difference is the user_uuid generation (for backwards compatibility)
// # params:
// # - url: Gimel track URL to post events to
// # - namepsace: namespace for Gimel (allows setting different environments etc)
// # - storage (optional) - storage adapter for the queue

_defineProperty(LamedAdapter, "queue_name", "_lamed_queue");

export var GimelAdapter = /*#__PURE__*/function (_AlephbetAdapter2) {
  _inherits(GimelAdapter, _AlephbetAdapter2);

  var _super2 = _createSuper(GimelAdapter);

  function GimelAdapter() {
    _classCallCheck(this, GimelAdapter);

    return _super2.apply(this, arguments);
  }

  _createClass(GimelAdapter, [{
    key: "_user_uuid",
    value: function _user_uuid(experiment, goal) {
      if (!experiment.user_id) return utils.uuid(); // if goal is not unique, we track it every time. return a new random uuid

      if (!goal.unique) return utils.uuid(); // for a given user id, namespace and experiment, the uuid will always be the same
      // this avoids counting goals twice for the same user across different devices

      return utils.sha1("".concat(this.namespace, ".").concat(experiment.name, ".").concat(experiment.user_id));
    }
  }]);

  return GimelAdapter;
}(AlephbetAdapter); // # Adapter for using the lamed backend. See https://github.com/Alephbet/lamed
// # inherits from AlephbetAdapter which uses the same backend API
// #

_defineProperty(GimelAdapter, "queue_name", "_lamed_queue");

export var RailsAdapter = /*#__PURE__*/function (_AlephbetAdapter3) {
  _inherits(RailsAdapter, _AlephbetAdapter3);

  var _super3 = _createSuper(RailsAdapter);

  function RailsAdapter() {
    _classCallCheck(this, RailsAdapter);

    return _super3.apply(this, arguments);
  }

  return RailsAdapter;
}(AlephbetAdapter);

_defineProperty(RailsAdapter, "queue_name", "_rails_queue");

export var PersistentQueueGoogleAnalyticsAdapter = /*#__PURE__*/function () {
  function PersistentQueueGoogleAnalyticsAdapter() {
    var storage = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : LocalStorageAdapter;

    _classCallCheck(this, PersistentQueueGoogleAnalyticsAdapter);

    this._storage = storage;
    this._queue = JSON.parse(this._storage.get(this.queue_name) || "[]");

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

        _this2._storage.set(_this2.queue_name, JSON.stringify(_this2._queue));
      };
    }
  }, {
    key: "_flush",
    value: function _flush() {
      if (typeof global.ga !== "function") {
        throw new Error("ga not defined. " + "Please make sure your Universal analytics is set up correctly");
      }

      var _iterator2 = _createForOfIteratorHelper(this._queue),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var item = _step2.value;

          var callback = this._remove_uuid(item.uuid);

          global.ga("send", "event", item.category, item.action, item.label, {
            hitCallback: callback,
            nonInteraction: 1
          });
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
  }, {
    key: "_track",
    value: function _track(category, action, label) {
      utils.log("Persistent Queue Google Universal Analytics track: " + "".concat(category, ", ").concat(action, ", ").concat(label));
      if (this._queue.length > 100) this._queue.shift();

      this._queue.push({
        uuid: utils.uuid(),
        category: category,
        action: action,
        label: label
      });

      this._storage.set(this.queue_name, JSON.stringify(this._queue));

      this._flush();
    }
  }, {
    key: "experiment_start",
    value: function experiment_start(experiment, variant) {
      this._track(this.namespace, "".concat(experiment.name, " | ").concat(variant), "Visitors");
    }
  }, {
    key: "goal_complete",
    value: function goal_complete(experiment, variant, goal_name, _props) {
      this._track(this.namespace, "".concat(experiment.name, " | ").concat(variant), goal_name);
    }
  }]);

  return PersistentQueueGoogleAnalyticsAdapter;
}();

_defineProperty(PersistentQueueGoogleAnalyticsAdapter, "namespace", "alephbet");

_defineProperty(PersistentQueueGoogleAnalyticsAdapter, "queue_name", "_ga_queue");

export var PersistentQueueKeenAdapter = /*#__PURE__*/function () {
  function PersistentQueueKeenAdapter(keen_client) {
    var storage = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : LocalStorageAdapter;

    _classCallCheck(this, PersistentQueueKeenAdapter);

    this.client = keen_client;
    this._storage = storage;
    this._queue = JSON.parse(this._storage.get(this.queue_name) || "[]");

    this._flush();
  }

  _createClass(PersistentQueueKeenAdapter, [{
    key: "_remove_quuid",
    value: function _remove_quuid(quuid) {
      var _this3 = this;

      return function (err, _res) {
        if (err) return;
        utils.remove(_this3._queue, function (el) {
          return el.properties._quuid === quuid;
        });

        _this3._storage.set(_this3.queue_name, JSON.stringify(_this3._queue));
      };
    }
  }, {
    key: "_flush",
    value: function _flush() {
      for (var _i2 = 0, _Array$from = Array.from(this._queue); _i2 < _Array$from.length; _i2++) {
        var item = _Array$from[_i2];

        var callback = this._remove_quuid(item.properties._quuid);

        this.client.addEvent(item.experiment_name, utils.omit(item.properties, "_quuid"), callback);
      }
    }
  }, {
    key: "_user_uuid",
    value: function _user_uuid(experiment, goal) {
      if (!experiment.user_id) return utils.uuid(); // if goal is not unique, we track it every time. return a new random uuid

      if (!goal.unique) return utils.uuid(); // for a given user id, namespace and experiment, the uuid will always be the same
      // this avoids counting goals twice for the same user across different devices

      return utils.sha1("".concat(this.namespace, ".").concat(experiment.name, ".").concat(experiment.user_id));
    }
  }, {
    key: "_track",
    value: function _track(experiment, variant, goal) {
      utils.log("Persistent Queue Keen track: " + "".concat(experiment.name, ", ").concat(variant, ", ").concat(goal.name));
      if (this._queue.length > 100) this._queue.shift();

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

      this._flush();
    }
  }, {
    key: "experiment_start",
    value: function experiment_start(experiment, variant) {
      this._track(experiment, variant, {
        name: "participate",
        unique: true
      });
    }
  }, {
    key: "goal_complete",
    value: function goal_complete(experiment, variant, goal_name, props) {
      this._track(experiment, variant, utils.defaults({
        name: goal_name
      }, props));
    }
  }]);

  return PersistentQueueKeenAdapter;
}();

_defineProperty(PersistentQueueKeenAdapter, "queue_name", "_keen_queue");

export var GoogleUniversalAnalyticsAdapter = /*#__PURE__*/function () {
  function GoogleUniversalAnalyticsAdapter() {
    _classCallCheck(this, GoogleUniversalAnalyticsAdapter);
  }

  _createClass(GoogleUniversalAnalyticsAdapter, null, [{
    key: "_track",
    value: function _track(category, action, label) {
      utils.log("Google Universal Analytics track: ".concat(category, ", ").concat(action, ", ").concat(label));

      if (typeof global.ga !== "function") {
        throw new Error("ga not defined. Please make sure " + "your Universal analytics is set up correctly");
      }

      global.ga("send", "event", category, action, label, {
        nonInteraction: 1
      });
    }
  }, {
    key: "experiment_start",
    value: function experiment_start(experiment, variant) {
      this._track(this.namespace, "".concat(experiment.name, " | ").concat(variant), "Visitors");
    }
  }, {
    key: "goal_complete",
    value: function goal_complete(experiment, variant, goal_name, _props) {
      this._track(this.namespace, "".concat(experiment.name, " | ").concat(variant), goal_name);
    }
  }]);

  return GoogleUniversalAnalyticsAdapter;
}();

_defineProperty(GoogleUniversalAnalyticsAdapter, "namespace", "alephbet");

export var LocalStorageAdapter = {
  namespace: "alephbet",
  set: function set(key, value) {
    return new Storage(this.namespace).set(key, value);
  },
  get: function get(key) {
    return new Storage(this.namespace).get(key);
  }
};
export default {
  AlephbetAdapter: AlephbetAdapter,
  LamedAdapter: LamedAdapter,
  GimelAdapter: GimelAdapter,
  RailsAdapter: RailsAdapter,
  PersistentQueueGoogleAnalyticsAdapter: PersistentQueueGoogleAnalyticsAdapter,
  PersistentQueueKeenAdapter: PersistentQueueKeenAdapter,
  GoogleUniversalAnalyticsAdapter: GoogleUniversalAnalyticsAdapter,
  LocalStorageAdapter: LocalStorageAdapter
};