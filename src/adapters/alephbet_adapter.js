import LocalStorageAdapter from "./local_storage_adapter"
import utils from "../utils"

// # A parent class Adapter for using the Alephbet backend API.
// # uses fetch to send data with keepalive. Falls back on plain js xhr
// # params:
// # - url: track URL to post events to
// # - namepsace (optional): allows setting different environments etc
// # - storage (optional): storage adapter for the queue
class AlephbetAdapter {
  queue_name = "_alephbet_queue"

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

  _merge_url_data(url, data) {
    let params = []
    for (const key of Object.keys(data)) {
      params.push(`${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
    }
    params = params.join("&").replace(/%20/g, "+")
    return `${url}?${params}`
  }

  _fetch_get(url, data, callback) {
    utils.log("send request using fetch", {url, data})
    return window.fetch(this._merge_url_data(url, data), {
      method: "GET",
      keepalive: true
    }).then((result) => { if (result.status === 200) { callback() } })
  }

  _plain_js_get(url, data, callback) {
    utils.log("fallback on plain js xhr", {url, data})
    const xhr = new XMLHttpRequest()

    xhr.open("GET", this._merge_url_data(url, data))
    xhr.onload = () => {
      if (xhr.status === 200) callback()
    }
    return xhr.send()
  }

  _ajax_get(url, data, callback) {
    if (window.fetch) {
      return this._fetch_get(url, data, callback)
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
      "Persistent Queue track", {
        namespace: this.namespace,
        experiment: experiment.name,
        variant,
        goal: goal.name
      }
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

export default AlephbetAdapter
