import utils from "./utils"
import options from "./options"

import {
  LocalStorageAdapter,
  GoogleUniversalAnalyticsAdapter
} from "./adapters"

export class Experiment {
  static _options = {
    name: null,
    variants: null,
    user_id: null,
    sample: 1.0,
    trigger() {
      return true
    },
    tracking_adapter: GoogleUniversalAnalyticsAdapter,
    storage_adapter: LocalStorageAdapter
  }

  constructor(options = {}) {
    this.options = options
    utils.defaults(this.options, Experiment._options)
    validate(this.options)
    this.name = this.options.name
    this.variants = this.options.variants
    this.user_id = this.options.user_id
    this.variant_names = utils.keys(this.variants)
    this.run()
  }

  run() {
    utils.log("running...", this.options)
    const variant = this.get_stored_variant()
    if (variant) {
      // a variant was already chosen. activate it
      utils.log(`${variant} active`)
      this.activate_variant(variant)
    } else {
      this.conditionally_activate_variant()
    }
  }

  activate_variant(variant) {
    this.variants[variant]?.activate(this)
    this.storage().set(`${this.options.name}:variant`, variant)
  }

  // if experiment conditions match, pick and activate a variant, track experiment start
  conditionally_activate_variant() {
    if (!this.options.trigger()) return
    utils.log("trigger set")
    if (!this.in_sample()) return
    utils.log("in sample")
    const variant = this.pick_variant()
    utils.log(`${variant} picked`)
    this.tracking().experiment_start(this, variant)
    this.activate_variant(variant)
  }

  goal_complete(goal_name, props = {}) {
    utils.defaults(props, {unique: true})
    if (
      props.unique &&
      this.storage().get(`${this.options.name}:${goal_name}`)
    ) return
    const variant = this.get_stored_variant()
    if (!variant) return
    if (props.unique) {
      this.storage().set(`${this.options.name}:${goal_name}`, true)
    }
    utils.log(
      "experiment goal complete", {
        name: this.options.name,
        variant,
        goal: goal_name
      }
    )
    this.tracking().goal_complete(this, variant, goal_name, props)
  }

  get_stored_variant() {
    return this.storage().get(`${this.options.name}:variant`)
  }

  pick_variant() {
    const all_variants_have_weights = utils.check_weights(this.variants)
    if (all_variants_have_weights) {
      return this.pick_weighted_variant()
    }
    return this.pick_unweighted_variant()
  }

  pick_weighted_variant() {
    // Choosing a weighted variant:
    // For A, B, C with weights 1, 3, 6
    // variants = A, B, C
    // weights = 1, 3, 6
    // weights_sum = 10 (sum of weights)
    // weighted_index = 2.1 (random number between 0 and weight sum)
    // ABBBCCCCCC
    // ==^
    // Select B
    utils.log("picking weighted variant")
    const weights_sum = utils.sum_weights(this.variants)
    let weighted_index = Math.ceil((this._random("variant") * weights_sum))
    for (const [key, value] of Object.entries(this.variants)) {
      // then we are substracting variant weight from selected number
      // and it it reaches 0 (or below) we are selecting this variant
      weighted_index -= value.weight
      if (weighted_index <= 0) return key
    }
  }

  pick_unweighted_variant() {
    utils.log("picking unweighted variant")
    const partitions = 1.0 / this.variant_names.length
    const chosen_partition = Math.floor(this._random("variant") / partitions)
    return this.variant_names[chosen_partition]
  }

  in_sample() {
    let active = this.storage().get(`${this.options.name}:in_sample`)
    if (typeof active !== "undefined") return active
    active = this._random("sample") <= this.options.sample
    this.storage().set(`${this.options.name}:in_sample`, active)
    return active
  }

  _random(salt) {
    if (!this.user_id) return utils.random()
    const seed = `${this.name}.${salt}.${this.user_id}`
    return utils.random(seed)
  }

  add_goal(goal) {
    goal.add_experiment(this)
  }

  add_goals(goals) {
    for (const goal of goals) this.add_goal(goal)
  }

  storage() {
    return this.options.storage_adapter
  }

  tracking() {
    return this.options.tracking_adapter
  }
}

const validate = (options) => {
  if (options.name === null) {
    throw new Error("an experiment name must be specified")
  }
  if (options.variants === null) {
    throw new Error("variants must be provided")
  }
  if (typeof options.trigger !== "function") {
    throw new Error("trigger must be a function")
  }
  const all_variants_have_weights = utils.validate_weights(options.variants)
  if (!all_variants_have_weights) {
    throw new Error("not all variants have weights")
  }
}

export class Goal {
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

export * from "./adapters"
export {default as utils} from "./utils"
export {default as options} from "./options"

export default {options}
