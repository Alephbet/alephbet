# NOTE: using a custom build of lodash, to save space
_ = require('lodash.custom')
uuid = require('node-uuid')

class Utils
  @defaults: _.defaults
  @keys: _.keys
  @remove: _.remove
  @set_debug: (@debug) ->
  @log: (message) ->
    console.log(message) if @debug
  @uuid: uuid.v4

module.exports = Utils
