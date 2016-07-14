# NOTE: using a custom build of lodash, to save space
_ = require('lodash.custom')
uuid = require('node-uuid')
options = require('./options')

class Utils
  @defaults: _.defaults
  @keys: _.keys
  @remove: _.remove
  @log: (message) ->
    console.log(message) if options.debug
  @uuid: uuid.v4

module.exports = Utils
