client = typeof window isnt 'undefined'

# a thin wrapper for cases where window is not avaialble
class Storage
  constructor: (@namespace='alephbet') ->
    if !client || typeof window.localStorage is 'undefined'
      throw new Error('')
    @storage = JSON.parse(window.localStorage[@namespace])
  set: (key, value) ->
    @storage[key] = value
    window.localStorage.set(@namespace, JSON.stringify(@storage))
    return value
  get: (key) ->
    @storage[key]
    # store.get("#{@namespace}:#{key}")

export default Storage
