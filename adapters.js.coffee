utils = require('./utils.js.coffee')

class Adapters

  class @PersistentQueueGoogleAnalyticsAdapter
    namespace: 'alephbet'
    queue_name: '_ga_queue'

    constructor: (storage = AlephBet.LocalStorageAdapter) ->
      @log = AlephBet.log
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
        ga('send', 'event', item.category, item.action, item.label, {'hitCallback': callback})

    _track: (category, action, label) ->
      @log("Persistent Queue Google Universal Analytics track: #{category}, #{action}, #{label}")
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

    constructor: (keen_client, storage = AlephBet.LocalStorageAdapter) ->
      @log = AlephBet.log
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
      @log("Persistent Queue Keen track: #{experiment_name}, #{variant}, #{event}")
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

module.exports = Adapters
