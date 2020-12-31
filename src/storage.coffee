# a thin wrapper around localStorage checking if localStorage is available
class Storage
  constructor: (@namespace='alephbet') ->
    try
      check = 'localstorage_check'
      localStorage.setItem(check, check)
      localStorage.removeItem(check)
      @storage = JSON.parse(localStorage.getItem(@namespace) || "{}")
    catch
      throw new Error('localStorage is not available')
  set: (key, value) ->
    @storage[key] = value
    localStorage.setItem(@namespace, JSON.stringify(@storage))
    return value
  get: (key) ->
    @storage[key]

export default Storage
