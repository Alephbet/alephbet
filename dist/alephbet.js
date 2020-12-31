"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  Experiment: true,
  Goal: true,
  utils: true,
  options: true
};
Object.defineProperty(exports, "utils", {
  enumerable: true,
  get: function () {
    return _utils.default;
  }
});
Object.defineProperty(exports, "options", {
  enumerable: true,
  get: function () {
    return _options.default;
  }
});
exports.default = exports.Goal = exports.Experiment = void 0;

var _utils = _interopRequireDefault(require("./utils"));

var _options = _interopRequireDefault(require("./options"));

var _adapters = require("./adapters");

Object.keys(_adapters).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _adapters[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _adapters[key];
    }
  });
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Experiment {
  constructor(options = {}) {
    this.options = options;

    _utils.default.defaults(this.options, Experiment._options);

    validate(this.options);
    this.name = this.options.name;
    this.variants = this.options.variants;
    this.user_id = this.options.user_id;
    this.variant_names = _utils.default.keys(this.variants);
    this.run();
  }

  run() {
    _utils.default.log(`running with options: ${JSON.stringify(this.options)}`);

    const variant = this.get_stored_variant();

    if (variant) {
      // a variant was already chosen. activate it
      _utils.default.log(`${variant} active`);

      this.activate_variant(variant);
    } else {
      this.conditionally_activate_variant();
    }
  }

  activate_variant(variant) {
    var _this$variants$varian;

    (_this$variants$varian = this.variants[variant]) === null || _this$variants$varian === void 0 ? void 0 : _this$variants$varian.activate(this);
    this.storage().set(`${this.options.name}:variant`, variant);
  } // if experiment conditions match, pick and activate a variant, track experiment start


  conditionally_activate_variant() {
    if (!this.options.trigger()) return;

    _utils.default.log("trigger set");

    if (!this.in_sample()) return;

    _utils.default.log("in sample");

    const variant = this.pick_variant();
    this.tracking().experiment_start(this, variant);
    this.activate_variant(variant);
  }

  goal_complete(goal_name, props = {}) {
    _utils.default.defaults(props, {
      unique: true
    });

    if (props.unique && this.storage().get(`${this.options.name}:${goal_name}`)) return;
    const variant = this.get_stored_variant();
    if (!variant) return;

    if (props.unique) {
      this.storage().set(`${this.options.name}:${goal_name}`, true);
    }

    _utils.default.log("experiment: " + `${this.options.name} variant:${variant} goal:${goal_name} complete`);

    this.tracking().goal_complete(this, variant, goal_name, props);
  }

  get_stored_variant() {
    return this.storage().get(`${this.options.name}:variant`);
  }

  pick_variant() {
    const all_variants_have_weights = _utils.default.check_weights(this.variants);

    _utils.default.log(`all variants have weights: ${all_variants_have_weights}`);

    if (all_variants_have_weights) {
      return this.pick_weighted_variant();
    }

    return this.pick_unweighted_variant();
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
    const weights_sum = _utils.default.sum_weights(this.variants);

    let weighted_index = Math.ceil(this._random("variant") * weights_sum);

    for (const [key, value] of Object.entries(this.variants)) {
      // then we are substracting variant weight from selected number
      // and it it reaches 0 (or below) we are selecting this variant
      weighted_index -= value.weight;
      if (weighted_index <= 0) return key;
    }
  }

  pick_unweighted_variant() {
    const partitions = 1.0 / this.variant_names.length;
    const chosen_partition = Math.floor(this._random("variant") / partitions);
    const variant = this.variant_names[chosen_partition];

    _utils.default.log(`${variant} picked`);

    return variant;
  }

  in_sample() {
    let active = this.storage().get(`${this.options.name}:in_sample`);
    if (typeof active !== "undefined") return active;
    active = this._random("sample") <= this.options.sample;
    this.storage().set(`${this.options.name}:in_sample`, active);
    return active;
  }

  _random(salt) {
    if (!this.user_id) return _utils.default.random();
    const seed = `${this.name}.${salt}.${this.user_id}`;
    return _utils.default.random(seed);
  }

  add_goal(goal) {
    goal.add_experiment(this);
  }

  add_goals(goals) {
    for (const goal of goals) this.add_goal(goal);
  }

  storage() {
    return this.options.storage_adapter;
  }

  tracking() {
    return this.options.tracking_adapter;
  }

}

exports.Experiment = Experiment;

_defineProperty(Experiment, "_options", {
  name: null,
  variants: null,
  user_id: null,
  sample: 1.0,

  trigger() {
    return true;
  },

  tracking_adapter: _adapters.GoogleUniversalAnalyticsAdapter,
  storage_adapter: _adapters.LocalStorageAdapter
});

const validate = options => {
  if (options.name === null) {
    throw new Error("an experiment name must be specified");
  }

  if (options.variants === null) {
    throw new Error("variants must be provided");
  }

  if (typeof options.trigger !== "function") {
    throw new Error("trigger must be a function");
  }

  const all_variants_have_weights = _utils.default.validate_weights(options.variants);

  if (!all_variants_have_weights) {
    throw new Error("not all variants have weights");
  }
};

class Goal {
  constructor(name, props = {}) {
    this.name = name;
    this.props = props;

    _utils.default.defaults(this.props, {
      unique: true
    });

    this.experiments = [];
  }

  add_experiment(experiment) {
    this.experiments.push(experiment);
  }

  add_experiments(experiments) {
    for (const experiment of experiments) this.add_experiment(experiment);
  }

  complete() {
    for (const experiment of this.experiments) {
      experiment.goal_complete(this.name, this.props);
    }
  }

}

exports.Goal = Goal;
var _default = {
  options: _options.default
};
exports.default = _default;