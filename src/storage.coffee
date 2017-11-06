store = require('store')

# a thin wrapper around store.js for easy swapping
class Storage
  constructor: (@namespace='alephbet') ->
    throw new Error('local storage not supported') unless store.enabled
    @storage = store.get(@namespace) || {}
  set: (key, value) ->
    @storage[key] = value
    store.set(@namespace, @storage)
    return value
  get: (key) ->
    @storage[key]
    # store.get("#{@namespace}:#{key}")

module.exports = Storage
