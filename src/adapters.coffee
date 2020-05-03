utils = require('./utils')
Storage = require('./storage')

class Adapters

  ## A parent class Adapter for using the Alephbet backend API.
  ## uses jQuery to send data if `$.ajax` is found. Falls back on plain js xhr
  ## params:
  ## - url: track URL to post events to
  ## - namepsace (optional): allows setting different environments etc
  ## - storage (optional): storage adapter for the queue
  class @AlephbetAdapter
    queue_name: '_alephbet_queue'

    constructor: (url, namespace = 'alephbet', storage = Adapters.LocalStorageAdapter) ->
      @_storage = storage
      @url = url
      @namespace = namespace
      @_queue = JSON.parse(@_storage.get(@queue_name) || '[]')
      @_flush()

    _remove_quuid: (quuid) ->
      (err, res) =>
        return if err
        utils.remove(@_queue, (el) -> el.properties._quuid == quuid)
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
        callback = @_remove_quuid(item.properties._quuid)
        @_ajax_get(@url, utils.omit(item.properties, '_quuid'), callback)
        null

    _user_uuid: (experiment, goal) ->
      return utils.uuid() unless experiment.user_id
      # if goal is not unique, we track it every time. return a new random uuid
      return utils.uuid() unless goal.unique
      # for a given user id, namespace, goal and experiment, the uuid will always be the same
      # this avoids counting goals twice for the same user across different devices
      utils.sha1("#{@namespace}.#{experiment.name}.#{goal.name}.#{experiment.user_id}")

    _track: (experiment, variant, goal) ->
      utils.log("Persistent Queue Gimel track: #{@namespace}, #{experiment.name}, #{variant}, #{goal.name}")
      @_queue.shift() if @_queue.length > 100
      @_queue.push
        properties:
          experiment: experiment.name
          _quuid: utils.uuid()  # queue uuid (used only internally)
          uuid: @_user_uuid(experiment, goal)
          variant: variant
          event: goal.name
          namespace: @namespace
      @_storage.set(@queue_name, JSON.stringify(@_queue))
      @_flush()

    experiment_start: (experiment, variant) ->
      @_track(experiment, variant, {name: 'participate', unique: true})

    goal_complete: (experiment, variant, goal_name, props) ->
      @_track(experiment, variant, utils.defaults({name: goal_name}, props))

  ## Adapter for using the lamed backend. See https://github.com/Alephbet/lamed
  ## inherits from AlephbetAdapter which uses the same backend API
  ##
  class @LamedAdapter extends @AlephbetAdapter
    queue_name: '_lamed_queue'

  ## Adapter for using the gimel backend. See https://github.com/Alephbet/gimel
  ## The main difference is the user_uuid generation (for backwards compatibility)
  ## params:
  ## - url: Gimel track URL to post events to
  ## - namepsace: namespace for Gimel (allows setting different environments etc)
  ## - storage (optional) - storage adapter for the queue
  class @GimelAdapter extends @AlephbetAdapter
    queue_name: '_lamed_queue'

    _user_uuid: (experiment, goal) ->
      return utils.uuid() unless experiment.user_id
      # if goal is not unique, we track it every time. return a new random uuid
      return utils.uuid() unless goal.unique
      # for a given user id, namespace and experiment, the uuid will always be the same
      # this avoids counting goals twice for the same user across different devices
      utils.sha1("#{@namespace}.#{experiment.name}.#{experiment.user_id}")

  ## Adapter for using the lamed backend. See https://github.com/Alephbet/lamed
  ## inherits from AlephbetAdapter which uses the same backend API
  ##
  class @RailsAdapter extends @AlephbetAdapter
    queue_name: '_rails_queue'


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
      throw new Error('ga not defined. Please make sure your Universal analytics is set up correctly') if typeof ga isnt 'function'
      for item in @_queue
        callback = @_remove_uuid(item.uuid)
        ga('send', 'event', item.category, item.action, item.label, {'hitCallback': callback, 'nonInteraction': 1})

    _track: (category, action, label) ->
      utils.log("Persistent Queue Google Universal Analytics track: #{category}, #{action}, #{label}")
      @_queue.shift() if @_queue.length > 100
      @_queue.push({uuid: utils.uuid(), category: category, action: action, label: label})
      @_storage.set(@queue_name, JSON.stringify(@_queue))
      @_flush()

    experiment_start: (experiment, variant) ->
      @_track(@namespace, "#{experiment.name} | #{variant}", 'Visitors')

    goal_complete: (experiment, variant, goal_name, _props) ->
      @_track(@namespace, "#{experiment.name} | #{variant}", goal_name)


  class @PersistentQueueKeenAdapter
    queue_name: '_keen_queue'

    constructor: (keen_client, storage = Adapters.LocalStorageAdapter) ->
      @client = keen_client
      @_storage = storage
      @_queue = JSON.parse(@_storage.get(@queue_name) || '[]')
      @_flush()

    _remove_quuid: (quuid) ->
      (err, res) =>
        return if err
        utils.remove(@_queue, (el) -> el.properties._quuid == quuid)
        @_storage.set(@queue_name, JSON.stringify(@_queue))

    _flush: ->
      for item in @_queue
        callback = @_remove_quuid(item.properties._quuid)
        @client.addEvent(item.experiment_name, utils.omit(item.properties, '_quuid'), callback)

    _user_uuid: (experiment, goal) ->
      return utils.uuid() unless experiment.user_id
      # if goal is not unique, we track it every time. return a new random uuid
      return utils.uuid() unless goal.unique
      # for a given user id, namespace and experiment, the uuid will always be the same
      # this avoids counting goals twice for the same user across different devices
      utils.sha1("#{@namespace}.#{experiment.name}.#{experiment.user_id}")

    _track: (experiment, variant, goal) ->
      utils.log("Persistent Queue Keen track: #{experiment.name}, #{variant}, #{event}")
      @_queue.shift() if @_queue.length > 100
      @_queue.push
        experiment_name: experiment.name
        properties:
          _quuid: utils.uuid()  # queue uuid (used only internally)
          uuid: @_user_uuid(experiment, goal)
          variant: variant
          event: goal.name
      @_storage.set(@queue_name, JSON.stringify(@_queue))
      @_flush()

    experiment_start: (experiment, variant) ->
      @_track(experiment, variant, {name: 'participate', unique: true})

    goal_complete: (experiment, variant, goal_name, props) ->
      @_track(experiment, variant, utils.defaults({name: goal_name}, props))


  class @GoogleUniversalAnalyticsAdapter
    @namespace: 'alephbet'

    @_track: (category, action, label) ->
      utils.log("Google Universal Analytics track: #{category}, #{action}, #{label}")
      throw new Error('ga not defined. Please make sure your Universal analytics is set up correctly') if typeof ga isnt 'function'
      ga('send', 'event', category, action, label, {'nonInteraction': 1})

    @experiment_start: (experiment, variant) ->
      @_track(@namespace, "#{experiment.name} | #{variant}", 'Visitors')

    @goal_complete: (experiment, variant, goal_name, _props) ->
      @_track(@namespace, "#{experiment.name} | #{variant}", goal_name)


  class @LocalStorageAdapter
    @namespace: 'alephbet'
    @set: (key, value) ->
      new Storage(@namespace).set(key, value)
    @get: (key) ->
      new Storage(@namespace).get(key)


module.exports = Adapters
