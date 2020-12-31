import utils from "../utils"
import LocalStorageAdapter from "./local_storage_adapter"

class PersistentQueueGoogleAnalyticsAdapter {
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

export default PersistentQueueGoogleAnalyticsAdapter
