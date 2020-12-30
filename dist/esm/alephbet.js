function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import utils from "./utils";
import options from "./options";
import { LocalStorageAdapter, GoogleUniversalAnalyticsAdapter } from "./adapters";
export var Experiment = /*#__PURE__*/function () {
  function Experiment() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Experiment);

    this.options = options;
    utils.defaults(this.options, Experiment._options);
    validate(this.options);
    this.name = this.options.name;
    this.variants = this.options.variants;
    this.user_id = this.options.user_id;
    this.variant_names = utils.keys(this.variants);
    this.run();
  }

  _createClass(Experiment, [{
    key: "run",
    value: function run() {
      utils.log("running with options: ".concat(JSON.stringify(this.options)));
      var variant = this.get_stored_variant();

      if (variant) {
        // a variant was already chosen. activate it
        utils.log("".concat(variant, " active"));
        this.activate_variant(variant);
      } else {
        this.conditionally_activate_variant();
      }
    }
  }, {
    key: "activate_variant",
    value: function activate_variant(variant) {
      var _this$variants$varian;

      (_this$variants$varian = this.variants[variant]) === null || _this$variants$varian === void 0 ? void 0 : _this$variants$varian.activate(this);
      this.storage().set("".concat(this.options.name, ":variant"), variant);
    } // if experiment conditions match, pick and activate a variant, track experiment start

  }, {
    key: "conditionally_activate_variant",
    value: function conditionally_activate_variant() {
      if (!this.options.trigger()) return;
      utils.log("trigger set");
      if (!this.in_sample()) return;
      utils.log("in sample");
      var variant = this.pick_variant();
      this.tracking().experiment_start(this, variant);
      this.activate_variant(variant);
    }
  }, {
    key: "goal_complete",
    value: function goal_complete(goal_name) {
      var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      utils.defaults(props, {
        unique: true
      });
      if (props.unique && this.storage().get("".concat(this.options.name, ":").concat(goal_name))) return;
      var variant = this.get_stored_variant();
      if (!variant) return;

      if (props.unique) {
        this.storage().set("".concat(this.options.name, ":").concat(goal_name), true);
      }

      utils.log("experiment: " + "".concat(this.options.name, " variant:").concat(variant, " goal:").concat(goal_name, " complete"));
      this.tracking().goal_complete(this, variant, goal_name, props);
    }
  }, {
    key: "get_stored_variant",
    value: function get_stored_variant() {
      return this.storage().get("".concat(this.options.name, ":variant"));
    }
  }, {
    key: "pick_variant",
    value: function pick_variant() {
      var all_variants_have_weights = utils.check_weights(this.variants);
      utils.log("all variants have weights: ".concat(all_variants_have_weights));

      if (all_variants_have_weights) {
        return this.pick_weighted_variant();
      }

      return this.pick_unweighted_variant();
    }
  }, {
    key: "pick_weighted_variant",
    value: function pick_weighted_variant() {
      // Choosing a weighted variant:
      // For A, B, C with weights 1, 3, 6
      // variants = A, B, C
      // weights = 1, 3, 6
      // weights_sum = 10 (sum of weights)
      // weighted_index = 2.1 (random number between 0 and weight sum)
      // ABBBCCCCCC
      // ==^
      // Select B
      var weights_sum = utils.sum_weights(this.variants);
      var weighted_index = Math.ceil(this._random("variant") * weights_sum);

      for (var _i = 0, _Object$entries = Object.entries(this.variants); _i < _Object$entries.length; _i++) {
        var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
            key = _Object$entries$_i[0],
            value = _Object$entries$_i[1];

        // then we are substracting variant weight from selected number
        // and it it reaches 0 (or below) we are selecting this variant
        weighted_index -= value.weight;
        if (weighted_index <= 0) return key;
      }
    }
  }, {
    key: "pick_unweighted_variant",
    value: function pick_unweighted_variant() {
      var partitions = 1.0 / this.variant_names.length;
      var chosen_partition = Math.floor(this._random("variant") / partitions);
      var variant = this.variant_names[chosen_partition];
      utils.log("".concat(variant, " picked"));
      return variant;
    }
  }, {
    key: "in_sample",
    value: function in_sample() {
      var active = this.storage().get("".concat(this.options.name, ":in_sample"));
      if (typeof active !== "undefined") return active;
      active = this._random("sample") <= this.options.sample;
      this.storage().set("".concat(this.options.name, ":in_sample"), active);
      return active;
    }
  }, {
    key: "_random",
    value: function _random(salt) {
      if (!this.user_id) return utils.random();
      var seed = "".concat(this.name, ".").concat(salt, ".").concat(this.user_id);
      return utils.random(seed);
    }
  }, {
    key: "add_goal",
    value: function add_goal(goal) {
      goal.add_experiment(this);
    }
  }, {
    key: "add_goals",
    value: function add_goals(goals) {
      var _iterator = _createForOfIteratorHelper(goals),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var goal = _step.value;
          this.add_goal(goal);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }, {
    key: "storage",
    value: function storage() {
      return this.options.storage_adapter;
    }
  }, {
    key: "tracking",
    value: function tracking() {
      return this.options.tracking_adapter;
    }
  }]);

  return Experiment;
}();

_defineProperty(Experiment, "_options", {
  name: null,
  variants: null,
  user_id: null,
  sample: 1.0,
  trigger: function trigger() {
    return true;
  },
  tracking_adapter: GoogleUniversalAnalyticsAdapter,
  storage_adapter: LocalStorageAdapter
});

var validate = function validate(options) {
  if (options.name === null) {
    throw new Error("an experiment name must be specified");
  }

  if (options.variants === null) {
    throw new Error("variants must be provided");
  }

  if (typeof options.trigger !== "function") {
    throw new Error("trigger must be a function");
  }

  var all_variants_have_weights = utils.validate_weights(options.variants);

  if (!all_variants_have_weights) {
    throw new Error("not all variants have weights");
  }
};

export var Goal = /*#__PURE__*/function () {
  function Goal(name) {
    var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Goal);

    this.name = name;
    this.props = props;
    utils.defaults(this.props, {
      unique: true
    });
    this.experiments = [];
  }

  _createClass(Goal, [{
    key: "add_experiment",
    value: function add_experiment(experiment) {
      this.experiments.push(experiment);
    }
  }, {
    key: "add_experiments",
    value: function add_experiments(experiments) {
      var _iterator2 = _createForOfIteratorHelper(experiments),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var experiment = _step2.value;
          this.add_experiment(experiment);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
  }, {
    key: "complete",
    value: function complete() {
      var _iterator3 = _createForOfIteratorHelper(this.experiments),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var experiment = _step3.value;
          experiment.goal_complete(this.name, this.props);
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
    }
  }]);

  return Goal;
}();
export * from "./adapters";
export { default as utils } from "./utils";
export { default as options } from "./options";
export default {
  options: options
};