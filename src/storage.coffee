client = typeof window isnt 'undefined'

# a thin wrapper for cases where window is not avaialble
class Storage
  constructor: (@namespace='alephbet') ->
    @storage = if client then store.get(@namespace) else {}
  set: (key, value) ->
    @storage[key] = value
    if client
      store.set(@namespace, @storage)
    return value
  get: (key) ->
    @storage[key]
    # store.get("#{@namespace}:#{key}")

export default Storage