import AlephbetAdapter from "./alephbet_adapter"
import utils from "../utils"

// # Adapter for using the gimel backend. See https://github.com/Alephbet/gimel
// # The main difference is the user_uuid generation (for backwards compatibility)
// # params:
// # - url: Gimel track URL to post events to
// # - namepsace: namespace for Gimel (allows setting different environments etc)
// # - storage (optional) - storage adapter for the queue
class GimelAdapter extends AlephbetAdapter {
  queue_name = "_gimel_queue"

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

export default GimelAdapter
