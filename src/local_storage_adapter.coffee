Storage = require('./storage')

class LocalStorageAdapter
  @namespace: 'alephbet'
  @set: (key, value) ->
    new Storage(@namespace).set(key, value)
  @get: (key) ->
    new Storage(@namespace).get(key)

module.exports = LocalStorageAdapter
