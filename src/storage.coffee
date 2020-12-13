client = typeof window isnt 'undefined'

# a thin wrapper for cases where window is not avaialble
class Storage
  constructor: (@namespace='alephbet') ->
    @storage = if client then window.localStorage else {}
  set: (key, value) ->
    @storage[key] = value
    return value
  get: (key) ->
    @storage[key]
    # store.get("#{@namespace}:#{key}")

export default Storage
