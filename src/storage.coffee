client = typeof window isnt 'undefined'

# a thin wrapper for cases where window is not avaialble
class Storage
  constructor: (@namespace='alephbet') ->
    @storage = if client and window.localStorage[@namespace] then JSON.parse(window.localStorage[@namespace]) else {}
  set: (key, value) ->
    @storage[key] = value
    if client
      window.localStorage.set(@namespace, JSON.stringify(@storage))
    return value
  get: (key) ->
    @storage[key]
    # store.get("#{@namespace}:#{key}")

export default Storage
