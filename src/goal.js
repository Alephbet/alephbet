import utils from "./utils"

class Goal {
  constructor(name, props = {}) {
    this.name = name
    this.props = props
    utils.defaults(this.props, {unique: true})
    this.experiments = []
  }

  add_experiment(experiment) {
    this.experiments.push(experiment)
  }

  add_experiments(experiments) {
    for (const experiment of experiments) this.add_experiment(experiment)
  }

  complete() {
    for (const experiment of this.experiments) {
      experiment.goal_complete(this.name, this.props)
    }
  }
}

export default Goal
