import utils from "../utils"

class GoogleUniversalAnalyticsAdapter {
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

export default GoogleUniversalAnalyticsAdapter
