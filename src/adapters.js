import Storage from "./storage"
import utils from "./utils"

// # A parent class Adapter for using the Alephbet backend API.
// # uses jQuery to send data if `$.ajax` is found. Falls back on plain js xhr
// # params:
// # - url: track URL to post events to
// # - namepsace (optional): allows setting different environments etc
// # - storage (optional): storage adapter for the queue
export class AlephbetAdapter {
  static queue_name = "_alephbet_queue"

  constructor(url, namespace = "alephbet", storage = LocalStorageAdapter) {
    this._storage = storage
    this.url = url
    this.namespace = namespace
    this._queue = JSON.parse(this._storage.get(this.queue_name) || "[]")
    this._flush()
  }

  _remove_quuid(quuid) {
    return (err, _res) => {
      if (err) return
      utils.remove(this._queue, el => el.properties._quuid === quuid)
      this._storage.set(this.queue_name, JSON.stringify(this._queue))
    }
  }

  _jquery_get(url, data, callback) {
    utils.log("send request using jQuery")
    return window.jQuery.ajax({
      method: "GET",
      url,
      data,
      success: callback
    })
  }

  _plain_js_get(url, data, callback) {
    utils.log("fallback on plain js xhr")
    const xhr = new XMLHttpRequest()
    let params = []
    for (const [k, v] in Object.entries(data)) {
      params.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    }
    params = params.join("&").replace(/%20/g, "+")
    xhr.open("GET", `${url}?${params}`)
    xhr.onload = () => {
      if (xhr.status === 200) callback()
    }
    return xhr.send()
  }

  _ajax_get(url, data, callback) {
    if (window.jQuery?.ajax) {
      return this._jquery_get(url, data, callback)
    }
    return this._plain_js_get(url, data, callback)
  }

  _flush() {
    for (const item of this._queue) {
      const callback = this._remove_quuid(item.properties._quuid)
      this._ajax_get(this.url, utils.omit(item.properties, "_quuid"), callback)
    }
  }

  _user_uuid(experiment, goal) {
    if (!experiment.user_id) return utils.uuid()
    // if goal is not unique, we track it every time. return a new random uuid
    if (!goal.unique) return utils.uuid()
    // for a given user id, namespace, goal and experiment, the uuid will always be the same
    // this avoids counting goals twice for the same user across different devices
    return utils.sha1(
      `${this.namespace}.${experiment.name}.${goal.name}.${experiment.user_id}`
    )
  }

  _track(experiment, variant, goal) {
    utils.log(
      "Persistent Queue track: " +
      `${this.namespace}, ${experiment.name}, ${variant}, ${goal.name}`
    )
    if (this._queue.length > 100) this._queue.shift()
    this._queue.push({
      properties: {
        experiment: experiment.name,
        _quuid: utils.uuid(), // queue uuid (used only internally)
        uuid: this._user_uuid(experiment, goal),
        variant,
        event: goal.name,
        namespace: this.namespace
      }
    })
    this._storage.set(this.queue_name, JSON.stringify(this._queue))
    this._flush()
  }

  experiment_start(experiment, variant) {
    this._track(experiment, variant, {name: "participate", unique: true})
  }

  goal_complete(experiment, variant, goal_name, props) {
    this._track(experiment, variant, utils.defaults({name: goal_name}, props))
  }
}

// # Adapter for using the lamed backend. See https://github.com/Alephbet/lamed
// # inherits from AlephbetAdapter which uses the same backend API
// #
export class LamedAdapter extends AlephbetAdapter {
  static queue_name = "_lamed_queue"
}

// # Adapter for using the gimel backend. See https://github.com/Alephbet/gimel
// # The main difference is the user_uuid generation (for backwards compatibility)
// # params:
// # - url: Gimel track URL to post events to
// # - namepsace: namespace for Gimel (allows setting different environments etc)
// # - storage (optional) - storage adapter for the queue
export class GimelAdapter extends AlephbetAdapter {
  static queue_name = "_lamed_queue"

  _user_uuid(experiment, goal) {
    if (!experiment.user_id) return utils.uuid()
    // if goal is not unique, we track it every time. return a new random uuid
    if (!goal.unique) return utils.uuid()
    // for a given user id, namespace and experiment, the uuid will always be the same
    // this avoids counting goals twice for the same user across different devices
    return utils.sha1(
      `${this.namespace}.${experiment.name}.${experiment.user_id}`
    )
  }
}

// # Adapter for using the lamed backend. See https://github.com/Alephbet/lamed
// # inherits from AlephbetAdapter which uses the same backend API
// #
export class RailsAdapter extends AlephbetAdapter {
  static queue_name = "_rails_queue"
}

export class PersistentQueueGoogleAnalyticsAdapter {
  static namespace = "alephbet"
  static queue_name = "_ga_queue"

  constructor(storage = LocalStorageAdapter) {
    this._storage = storage
    this._queue = JSON.parse(this._storage.get(this.queue_name) || "[]")
    this._flush()
  }

  _remove_uuid(uuid) {
    return () => {
      utils.remove(this._queue, el => el.uuid === uuid)
      this._storage.set(this.queue_name, JSON.stringify(this._queue))
    }
  }

  _flush() {
    if (typeof global.ga !== "function") {
      throw new Error(
        "ga not defined. " +
        "Please make sure your Universal analytics is set up correctly"
      )
    }
    for (const item of this._queue) {
      const callback = this._remove_uuid(item.uuid)
      global.ga("send", "event", item.category, item.action, item.label, {
        hitCallback: callback,
        nonInteraction: 1
      })
    }
  }

  _track(category, action, label) {
    utils.log(
      "Persistent Queue Google Universal Analytics track: " +
      `${category}, ${action}, ${label}`
    )
    if (this._queue.length > 100) this._queue.shift()
    this._queue.push({uuid: utils.uuid(), category, action, label})
    this._storage.set(this.queue_name, JSON.stringify(this._queue))
    this._flush()
  }

  experiment_start(experiment, variant) {
    this._track(this.namespace, `${experiment.name} | ${variant}`, "Visitors")
  }

  goal_complete(experiment, variant, goal_name, _props) {
    this._track(this.namespace, `${experiment.name} | ${variant}`, goal_name)
  }
}

export class PersistentQueueKeenAdapter {
  static queue_name = "_keen_queue"

  constructor(keen_client, storage = LocalStorageAdapter) {
    this.client = keen_client
    this._storage = storage
    this._queue = JSON.parse(this._storage.get(this.queue_name) || "[]")
    this._flush()
  }

  _remove_quuid(quuid) {
    return (err, _res) => {
      if (err) return
      utils.remove(this._queue, el => el.properties._quuid === quuid)
      this._storage.set(this.queue_name, JSON.stringify(this._queue))
    }
  }

  _flush() {
    for (const item of Array.from(this._queue)) {
      const callback = this._remove_quuid(item.properties._quuid)
      this.client.addEvent(
        item.experiment_name,
        utils.omit(item.properties, "_quuid"),
        callback
      )
    }
  }

  _user_uuid(experiment, goal) {
    if (!experiment.user_id) return utils.uuid()
    // if goal is not unique, we track it every time. return a new random uuid
    if (!goal.unique) return utils.uuid()
    // for a given user id, namespace and experiment, the uuid will always be the same
    // this avoids counting goals twice for the same user across different devices
    return utils.sha1(
      `${this.namespace}.${experiment.name}.${experiment.user_id}`
    )
  }

  _track(experiment, variant, goal) {
    utils.log(
      "Persistent Queue Keen track: " +
      `${experiment.name}, ${variant}, ${goal.name}`
    )
    if (this._queue.length > 100) this._queue.shift()
    this._queue.push({
      experiment_name: experiment.name,
      properties: {
        _quuid: utils.uuid(), // queue uuid (used only internally)
        uuid: this._user_uuid(experiment, goal),
        variant,
        event: goal.name
      }
    })
    this._storage.set(this.queue_name, JSON.stringify(this._queue))
    this._flush()
  }

  experiment_start(experiment, variant) {
    this._track(experiment, variant, {name: "participate", unique: true})
  }

  goal_complete(experiment, variant, goal_name, props) {
    this._track(experiment, variant, utils.defaults({name: goal_name}, props))
  }
}

export class GoogleUniversalAnalyticsAdapter {
  static namespace = "alephbet"

  static _track(category, action, label) {
    utils.log(
      `Google Universal Analytics track: ${category}, ${action}, ${label}`
    )
    if (typeof global.ga !== "function") {
      throw new Error(
        "ga not defined. Please make sure " +
        "your Universal analytics is set up correctly"
      )
    }
    global.ga("send", "event", category, action, label, {nonInteraction: 1})
  }

  static experiment_start(experiment, variant) {
    this._track(this.namespace, `${experiment.name} | ${variant}`, "Visitors")
  }

  static goal_complete(experiment, variant, goal_name, _props) {
    this._track(this.namespace, `${experiment.name} | ${variant}`, goal_name)
  }
}

export const LocalStorageAdapter = {
  namespace: "alephbet",

  set(key, value) {
    return new Storage(this.namespace).set(key, value)
  },

  get(key) {
    return new Storage(this.namespace).get(key)
  }
}

export default {
  AlephbetAdapter,
  LamedAdapter,
  GimelAdapter,
  RailsAdapter,
  PersistentQueueGoogleAnalyticsAdapter,
  PersistentQueueKeenAdapter,
  GoogleUniversalAnalyticsAdapter,
  LocalStorageAdapter
}
