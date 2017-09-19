# NOTE: using a custom build of lodash, to save space
_ = require('lodash.custom')
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
  @checkWeights: (variants) ->
    @weightExists value for key, value of variants
  @weightExists: (variant) ->
    @log("variant.weight: #{variant.weight}")
    variant.weight
module.exports = Utils
