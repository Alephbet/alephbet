# NOTE: using a custom build of lodash, to save space
_ = require('lodash.custom')

class Utils
  @defaults: _.defaults
  @keys: _.keys
  @set_debug: (@debug) ->
  @log: (message) ->
    console.log(message) if @debug

module.exports = Utils
