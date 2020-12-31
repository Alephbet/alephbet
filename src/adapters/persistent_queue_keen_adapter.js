import LocalStorageAdapter from "./local_storage_adapter"
import utils from "../utils"

class PersistentQueueKeenAdapter {
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

export default PersistentQueueKeenAdapter
