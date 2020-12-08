import {v4} from 'uuid'

sha1 = require('sha1')
options = require('./options')

class Utils
  @defaults: (obj, defaults) ->
    for key, value of defaults
      if obj[key] == undefined
        obj[key] = value
    return object
  @keys: Object.keys
  @remove: (list, callback) ->
    index = -1
    list.some((el, i) ->
      index = i if callback(e, i)
      return index > -1
    )
    if (index > -1) then list.splice(index, 1) else []
  @omit: (obj, ...keys) ->
    results = {...obj}
    for key in [].concat.apply([], keys)
      delete results[key]
    return results
  @log: (message) ->
    console.log(message) if options.debug
  @uuid: v4
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
  @sum_weights: (variants) ->
    sum = 0
    for key, value of variants
      sum += value.weight || 0
    sum
  @validate_weights: (variants) ->
    contains_weight = []
    contains_weight.push(value.weight?) for key, value of variants
    contains_weight.every (has_weight) -> has_weight or contains_weight.every (has_weight) -> !has_weight
module.exports = Utils
