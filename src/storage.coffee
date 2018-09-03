Basil = require('basil.js')
store = new Basil(namespace: null)

# a thin wrapper around basil.js for easy swapping
class Storage
  constructor: (@namespace='alephbet') ->
    @storage = store.get(@namespace) || {}
  set: (key, value) ->
    @storage[key] = value
    store.set(@namespace, @storage)
    return value
  get: (key) ->
    @storage[key]
    # store.get("#{@namespace}:#{key}")

module.exports = Storage
