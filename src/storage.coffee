# a thin wrapper around localStorage checking if localStorage is available
class Storage
  constructor: (@namespace='alephbet') ->
    try
      check = 'localstorage_check'
      localStorage.setItem(check, check);
      localStorage.removeItem(check);
      @storage = JSON.parse(localStorage[@namespace] || "{}")
    catch
      throw new Error('localStorage is not available')
  set: (key, value) ->
    @storage[key] = value
    localStorage.set(@namespace, JSON.stringify(@storage))
    return value
  get: (key) ->
    @storage[key]
    # store.get("#{@namespace}:#{key}")

export default Storage
