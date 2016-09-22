utils = require('./utils')
Storage = require('./storage')

class Adapters

  ## Adapter for using the gimel backend. See https://github.com/Alephbet/gimel
  ## uses jQuery to send data if `$.ajax` is found. Falls back on plain js xhr
  ## params:
  ## - url: Gimel track URL to post events to
  ## - namepsace: namespace for Gimel (allows setting different environments etc)
  ## - storage (optional) - storage adapter for the queue
  class @GimelAdapter
    queue_name: '_gimel_queue'

    constructor: (url, namespace, storage = Adapters.LocalStorageAdapter) ->
      @_storage = storage
      @url = url
      @namespace = namespace
      @_queue = JSON.parse(@_storage.get(@queue_name) || '[]')
      @_flush()

    _remove_uuid: (uuid) ->
      (err, res) =>
        return if err
        utils.remove(@_queue, (el) -> el.properties.uuid == uuid)
        @_storage.set(@queue_name, JSON.stringify(@_queue))

    _jquery_get: (url, data, callback) ->
      utils.log('send request using jQuery')
      window.jQuery.ajax
        method: 'GET'
        url: url
        data: data
        success: callback

    _plain_js_get: (url, data, callback) ->
      utils.log('fallback on plain js xhr')
      xhr = new XMLHttpRequest()
      params = ("#{encodeURIComponent(k)}=#{encodeURIComponent(v)}" for k,v of data)
      params = params.join('&').replace(/%20/g, '+')
      xhr.open('GET', "#{url}?#{params}")
      xhr.onload = ->
        if xhr.status == 200
          callback()
      xhr.send()

    _ajax_get: (url, data, callback) ->
      if window.jQuery?.ajax
        @_jquery_get(url, data, callback)
      else
        @_plain_js_get(url, data, callback)

    _flush: ->
      for item in @_queue
        callback = @_remove_uuid(item.properties.uuid)
        @_ajax_get(@url, item.properties, callback)
        null

    _track: (experiment_name, variant, event) ->
      utils.log("Persistent Queue Gimel track: #{@namespace}, #{experiment_name}, #{variant}, #{event}")
      @_queue.shift() if @_queue.length > 100
      @_queue.push
        properties:
          experiment: experiment_name
          uuid: utils.uuid()
          variant: variant
          event: event
          namespace: @namespace
      @_storage.set(@queue_name, JSON.stringify(@_queue))
      @_flush()

    experiment_start: (experiment_name, variant) =>
      @_track(experiment_name, variant, 'participate')

    goal_complete: (experiment_name, variant, goal) =>
      @_track(experiment_name, variant, goal)


  class @PersistentQueueGoogleAnalyticsAdapter
    namespace: 'alephbet'
    queue_name: '_ga_queue'

    constructor: (storage = Adapters.LocalStorageAdapter) ->
      @_storage = storage
      @_queue = JSON.parse(@_storage.get(@queue_name) || '[]')
      @_flush()

    _remove_uuid: (uuid) ->
      =>
        utils.remove(@_queue, (el) -> el.uuid == uuid)
        @_storage.set(@queue_name, JSON.stringify(@_queue))

    _flush: ->
      throw 'ga not defined. Please make sure your Universal analytics is set up correctly' if typeof ga isnt 'function'
      for item in @_queue
        callback = @_remove_uuid(item.uuid)
        ga('send', 'event', item.category, item.action, item.label, {'hitCallback': callback, 'nonInteraction': 1})

    _track: (category, action, label) ->
      utils.log("Persistent Queue Google Universal Analytics track: #{category}, #{action}, #{label}")
      @_queue.shift() if @_queue.length > 100
      @_queue.push({uuid: utils.uuid(), category: category, action: action, label: label})
      @_storage.set(@queue_name, JSON.stringify(@_queue))
      @_flush()

    experiment_start: (experiment_name, variant) =>
      @_track(@namespace, "#{experiment_name} | #{variant}", 'Visitors')

    goal_complete: (experiment_name, variant, goal) =>
      @_track(@namespace, "#{experiment_name} | #{variant}", goal)


  class @PersistentQueueKeenAdapter
    queue_name: '_keen_queue'

    constructor: (keen_client, storage = Adapters.LocalStorageAdapter) ->
      @client = keen_client
      @_storage = storage
      @_queue = JSON.parse(@_storage.get(@queue_name) || '[]')
      @_flush()

    _remove_uuid: (uuid) ->
      (err, res) =>
        return if err
        utils.remove(@_queue, (el) -> el.properties.uuid == uuid)
        @_storage.set(@queue_name, JSON.stringify(@_queue))

    _flush: ->
      for item in @_queue
        callback = @_remove_uuid(item.properties.uuid)
        @client.addEvent(item.experiment_name, item.properties, callback)

    _track: (experiment_name, variant, event) ->
      utils.log("Persistent Queue Keen track: #{experiment_name}, #{variant}, #{event}")
      @_queue.shift() if @_queue.length > 100
      @_queue.push
        experiment_name: experiment_name
        properties:
          uuid: utils.uuid()
          variant: variant
          event: event
      @_storage.set(@queue_name, JSON.stringify(@_queue))
      @_flush()

    experiment_start: (experiment_name, variant) =>
      @_track(experiment_name, variant, 'participate')

    goal_complete: (experiment_name, variant, goal) =>
      @_track(experiment_name, variant, goal)


  class @GoogleUniversalAnalyticsAdapter
    @namespace: 'alephbet'

    @_track: (category, action, label) ->
      utils.log("Google Universal Analytics track: #{category}, #{action}, #{label}")
      throw 'ga not defined. Please make sure your Universal analytics is set up correctly' if typeof ga isnt 'function'
      ga('send', 'event', category, action, label, {'nonInteraction': 1})

    @experiment_start: (experiment_name, variant) =>
      @_track(@namespace, "#{experiment_name} | #{variant}", 'Visitors')

    @goal_complete: (experiment_name, variant, goal) =>
      @_track(@namespace, "#{experiment_name} | #{variant}", goal)


  class @LocalStorageAdapter
    @namespace: 'alephbet'
    @set: (key, value) ->
      new Storage(@namespace).set(key, value)
    @get: (key) ->
      new Storage(@namespace).get(key)


module.exports = Adapters
