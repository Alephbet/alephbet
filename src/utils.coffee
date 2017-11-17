# NOTE: using a custom build of lodash, to save space
_ = require('../vendor/lodash.custom.min')
uuid = require('node-uuid')
sha1 = require('crypto-js/sha1')
options = require('./options')

class Utils
  @defaults: _.defaults
  @keys: _.keys
  @remove: _.remove
  @omit: _.omit
  @log: (message) ->
    console.log(message) if options.debug
  @uuid: uuid.v4
  @sha1: (text) ->
    sha1(text).toString()
  @random: (seed) ->
    return Math.random() unless seed
    # a MUCH simplified version inspired by PlanOut.js
    parseInt(@sha1(seed).substr(0, 13), 16) / 0xFFFFFFFFFFFFF
  @check_weights: (variants) ->
    contains_weight = []
    contains_weight.push(value.weight?) for key, value of variants
    contains_weight.every (has_weight) -> has_weight
  @check_triggers: (variants) ->
    contains_trigger = []
    contains_trigger.push(value.trigger?) for key, value of variants
    contains_trigger.every (has_trigger) -> has_trigger
  @sum_weights: (variants) ->
    sum = 0
    for key, value of variants
      sum += value.weight || 0
    sum
  @validate_weights: (variants) ->
    contains_weight = []
    contains_weight.push(value.weight?) for key, value of variants
    contains_weight.every (has_weight) -> has_weight or contains_weight.every (has_weight) -> !has_weight
  @validate_triggers: (variants) ->
    contains_trigger = []
    contains_trigger.push(value.trigger?) for key, value of variants
    contains_trigger.every (has_trigger) -> has_trigger or contains_trigger.every (has_trigger) -> !has_trigger
module.exports = Utils
