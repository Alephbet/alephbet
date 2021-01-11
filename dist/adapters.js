"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.LocalStorageAdapter = exports.GoogleUniversalAnalyticsAdapter = exports.PersistentQueueKeenAdapter = exports.PersistentQueueGoogleAnalyticsAdapter = exports.RailsAdapter = exports.GimelAdapter = exports.LamedAdapter = exports.AlephbetAdapter = void 0;

var _storage = _interopRequireDefault(require("./storage"));

var _utils = _interopRequireDefault(require("./utils"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// # A parent class Adapter for using the Alephbet backend API.
// # uses jQuery to send data if `$.ajax` is found. Falls back on plain js xhr
// # params:
// # - url: track URL to post events to
// # - namepsace (optional): allows setting different environments etc
// # - storage (optional): storage adapter for the queue
class AlephbetAdapter {
  constructor(url, namespace = "alephbet", storage = LocalStorageAdapter) {
    this._storage = storage;
    this.url = url;
    this.namespace = namespace;
    this._queue = JSON.parse(this._storage.get(this.queue_name) || "[]");

    this._flush();
  }

  _remove_quuid(quuid) {
    return (err, _res) => {
      if (err) return;

      _utils.default.remove(this._queue, el => el.properties._quuid === quuid);

      this._storage.set(this.queue_name, JSON.stringify(this._queue));
    };
  }

  _jquery_get(url, data, callback) {
    _utils.default.log("send request using jQuery");

    return window.jQuery.ajax({
      method: "GET",
      url,
      data,
      success: callback
    });
  }

  _plain_js_get(url, data, callback) {
    _utils.default.log("fallback on plain js xhr");

    const xhr = new XMLHttpRequest();
    let params = [];

    for (const key of Object.keys(data)) {
      params.push(`${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`);
    }

    params = params.join("&").replace(/%20/g, "+");
    xhr.open("GET", `${url}?${params}`);

    xhr.onload = () => {
      if (xhr.status === 200) callback();
    };

    return xhr.send();
  }

  _ajax_get(url, data, callback) {
    var _window$jQuery;

    if ((_window$jQuery = window.jQuery) !== null && _window$jQuery !== void 0 && _window$jQuery.ajax) {
      return this._jquery_get(url, data, callback);
    }

    return this._plain_js_get(url, data, callback);
  }

  _flush() {
    for (const item of this._queue) {
      const callback = this._remove_quuid(item.properties._quuid);

      this._ajax_get(this.url, _utils.default.omit(item.properties, "_quuid"), callback);
    }
  }

  _user_uuid(experiment, goal) {
    if (!experiment.user_id) return _utils.default.uuid(); // if goal is not unique, we track it every time. return a new random uuid

    if (!goal.unique) return _utils.default.uuid(); // for a given user id, namespace, goal and experiment, the uuid will always be the same
    // this avoids counting goals twice for the same user across different devices

    return _utils.default.sha1(`${this.namespace}.${experiment.name}.${goal.name}.${experiment.user_id}`);
  }

  _track(experiment, variant, goal) {
    _utils.default.log("Persistent Queue track: " + `${this.namespace}, ${experiment.name}, ${variant}, ${goal.name}`);

    if (this._queue.length > 100) this._queue.shift();

    this._queue.push({
      properties: {
        experiment: experiment.name,
        _quuid: _utils.default.uuid(),
        // queue uuid (used only internally)
        uuid: this._user_uuid(experiment, goal),
        variant,
        event: goal.name,
        namespace: this.namespace
      }
    });

    this._storage.set(this.queue_name, JSON.stringify(this._queue));

    this._flush();
  }

  experiment_start(experiment, variant) {
    this._track(experiment, variant, {
      name: "participate",
      unique: true
    });
  }

  goal_complete(experiment, variant, goal_name, props) {
    this._track(experiment, variant, _utils.default.defaults({
      name: goal_name
    }, props));
  }

} // # Adapter for using the lamed backend. See https://github.com/Alephbet/lamed
// # inherits from AlephbetAdapter which uses the same backend API
// #


exports.AlephbetAdapter = AlephbetAdapter;

_defineProperty(AlephbetAdapter, "queue_name", "_alephbet_queue");

class LamedAdapter extends AlephbetAdapter {} // # Adapter for using the gimel backend. See https://github.com/Alephbet/gimel
// # The main difference is the user_uuid generation (for backwards compatibility)
// # params:
// # - url: Gimel track URL to post events to
// # - namepsace: namespace for Gimel (allows setting different environments etc)
// # - storage (optional) - storage adapter for the queue


exports.LamedAdapter = LamedAdapter;

_defineProperty(LamedAdapter, "queue_name", "_lamed_queue");

class GimelAdapter extends AlephbetAdapter {
  _user_uuid(experiment, goal) {
    if (!experiment.user_id) return _utils.default.uuid(); // if goal is not unique, we track it every time. return a new random uuid

    if (!goal.unique) return _utils.default.uuid(); // for a given user id, namespace and experiment, the uuid will always be the same
    // this avoids counting goals twice for the same user across different devices

    return _utils.default.sha1(`${this.namespace}.${experiment.name}.${experiment.user_id}`);
  }

} // # Adapter for using the lamed backend. See https://github.com/Alephbet/lamed
// # inherits from AlephbetAdapter which uses the same backend API
// #


exports.GimelAdapter = GimelAdapter;

_defineProperty(GimelAdapter, "queue_name", "_lamed_queue");

class RailsAdapter extends AlephbetAdapter {}

exports.RailsAdapter = RailsAdapter;

_defineProperty(RailsAdapter, "queue_name", "_rails_queue");

class PersistentQueueGoogleAnalyticsAdapter {
  constructor(storage = LocalStorageAdapter) {
    this._storage = storage;
    this._queue = JSON.parse(this._storage.get(this.queue_name) || "[]");

    this._flush();
  }

  _remove_uuid(uuid) {
    return () => {
      _utils.default.remove(this._queue, el => el.uuid === uuid);

      this._storage.set(this.queue_name, JSON.stringify(this._queue));
    };
  }

  _flush() {
    if (typeof global.ga !== "function") {
      throw new Error("ga not defined. " + "Please make sure your Universal analytics is set up correctly");
    }

    for (const item of this._queue) {
      const callback = this._remove_uuid(item.uuid);

      global.ga("send", "event", item.category, item.action, item.label, {
        hitCallback: callback,
        nonInteraction: 1
      });
    }
  }

  _track(category, action, label) {
    _utils.default.log("Persistent Queue Google Universal Analytics track: " + `${category}, ${action}, ${label}`);

    if (this._queue.length > 100) this._queue.shift();

    this._queue.push({
      uuid: _utils.default.uuid(),
      category,
      action,
      label
    });

    this._storage.set(this.queue_name, JSON.stringify(this._queue));

    this._flush();
  }

  experiment_start(experiment, variant) {
    this._track(this.namespace, `${experiment.name} | ${variant}`, "Visitors");
  }

  goal_complete(experiment, variant, goal_name, _props) {
    this._track(this.namespace, `${experiment.name} | ${variant}`, goal_name);
  }

}

exports.PersistentQueueGoogleAnalyticsAdapter = PersistentQueueGoogleAnalyticsAdapter;

_defineProperty(PersistentQueueGoogleAnalyticsAdapter, "namespace", "alephbet");

_defineProperty(PersistentQueueGoogleAnalyticsAdapter, "queue_name", "_ga_queue");

class PersistentQueueKeenAdapter {
  constructor(keen_client, storage = LocalStorageAdapter) {
    this.client = keen_client;
    this._storage = storage;
    this._queue = JSON.parse(this._storage.get(this.queue_name) || "[]");

    this._flush();
  }

  _remove_quuid(quuid) {
    return (err, _res) => {
      if (err) return;

      _utils.default.remove(this._queue, el => el.properties._quuid === quuid);

      this._storage.set(this.queue_name, JSON.stringify(this._queue));
    };
  }

  _flush() {
    for (const item of Array.from(this._queue)) {
      const callback = this._remove_quuid(item.properties._quuid);

      this.client.addEvent(item.experiment_name, _utils.default.omit(item.properties, "_quuid"), callback);
    }
  }

  _user_uuid(experiment, goal) {
    if (!experiment.user_id) return _utils.default.uuid(); // if goal is not unique, we track it every time. return a new random uuid

    if (!goal.unique) return _utils.default.uuid(); // for a given user id, namespace and experiment, the uuid will always be the same
    // this avoids counting goals twice for the same user across different devices

    return _utils.default.sha1(`${this.namespace}.${experiment.name}.${experiment.user_id}`);
  }

  _track(experiment, variant, goal) {
    _utils.default.log("Persistent Queue Keen track: " + `${experiment.name}, ${variant}, ${goal.name}`);

    if (this._queue.length > 100) this._queue.shift();

    this._queue.push({
      experiment_name: experiment.name,
      properties: {
        _quuid: _utils.default.uuid(),
        // queue uuid (used only internally)
        uuid: this._user_uuid(experiment, goal),
        variant,
        event: goal.name
      }
    });

    this._storage.set(this.queue_name, JSON.stringify(this._queue));

    this._flush();
  }

  experiment_start(experiment, variant) {
    this._track(experiment, variant, {
      name: "participate",
      unique: true
    });
  }

  goal_complete(experiment, variant, goal_name, props) {
    this._track(experiment, variant, _utils.default.defaults({
      name: goal_name
    }, props));
  }

}

exports.PersistentQueueKeenAdapter = PersistentQueueKeenAdapter;

_defineProperty(PersistentQueueKeenAdapter, "queue_name", "_keen_queue");

class GoogleUniversalAnalyticsAdapter {
  static _track(category, action, label) {
    _utils.default.log(`Google Universal Analytics track: ${category}, ${action}, ${label}`);

    if (typeof global.ga !== "function") {
      throw new Error("ga not defined. Please make sure " + "your Universal analytics is set up correctly");
    }

    global.ga("send", "event", category, action, label, {
      nonInteraction: 1
    });
  }

  static experiment_start(experiment, variant) {
    this._track(this.namespace, `${experiment.name} | ${variant}`, "Visitors");
  }

  static goal_complete(experiment, variant, goal_name, _props) {
    this._track(this.namespace, `${experiment.name} | ${variant}`, goal_name);
  }

}

exports.GoogleUniversalAnalyticsAdapter = GoogleUniversalAnalyticsAdapter;

_defineProperty(GoogleUniversalAnalyticsAdapter, "namespace", "alephbet");

const LocalStorageAdapter = {
  namespace: "alephbet",

  set(key, value) {
    return new _storage.default(this.namespace).set(key, value);
  },

  get(key) {
    return new _storage.default(this.namespace).get(key);
  }

};
exports.LocalStorageAdapter = LocalStorageAdapter;
var _default = {
  AlephbetAdapter,
  LamedAdapter,
  GimelAdapter,
  RailsAdapter,
  PersistentQueueGoogleAnalyticsAdapter,
  PersistentQueueKeenAdapter,
  GoogleUniversalAnalyticsAdapter,
  LocalStorageAdapter
};
exports.default = _default;