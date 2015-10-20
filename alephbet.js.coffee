utils = require('./utils.js.coffee')
Storage = require('./storage.js.coffee')
adapters = require('./adapters.js.coffee')

class AlephBet
  @options = {debug: false}

  @PersistentQueueGoogleAnalyticsAdapter = adapters.PersistentQueueGoogleAnalyticsAdapter
  @PersistentQueueKeenAdapter = adapters.PersistentQueueKeenAdapter

  class @GoogleUniversalAnalyticsAdapter
    @namespace: 'alephbet'

    @_track: (category, action, label) ->
      log("Google Universal Analytics track: #{category}, #{action}, #{label}")
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

  class @Experiment
    @_options:
      name: null
      variants: null
      sample: 1.0
      trigger: -> true
      tracking_adapter: AlephBet.GoogleUniversalAnalyticsAdapter
      storage_adapter: AlephBet.LocalStorageAdapter

    constructor: (@options={}) ->
      utils.defaults(@options, Experiment._options)
      _validate.call(this)
      @name = @options.name
      @variants = @options.variants
      @variant_names = utils.keys(@variants)
      _run.call(this)

    run: ->
      log("running with options: #{JSON.stringify(@options)}")
      _force_variant()
      @apply_variant()

    _run = -> @run()

    _force_variant = ->
      # TODO: get variant from URI

    apply_variant: ->
      return unless @options.trigger()
      log('trigger set')
      return unless @in_sample()
      log('in sample')
      if variant = @get_stored_variant()
        log("#{variant} active")
      else
        variant = @pick_variant()
        @tracking().experiment_start(@options.name, variant)
      @variants[variant]?.activate(this)
      @storage().set("#{@options.name}:variant", variant)

    goal_complete: (goal_name, props={}) ->
      utils.defaults(props, {unique: true})
      return if props.unique && @storage().get("#{@options.name}:#{goal_name}")
      variant = @get_stored_variant()
      return unless variant
      @storage().set("#{@options.name}:#{goal_name}", true) if props.unique
      log("experiment: #{@options.name} variant:#{variant} goal:#{goal_name} complete")
      @tracking().goal_complete(@options.name, variant, goal_name)

    get_stored_variant: ->
      @storage().get("#{@options.name}:variant")

    pick_variant: ->
      partitions = 1.0 / @variant_names.length
      chosen_partition = Math.floor(Math.random() / partitions)
      variant = @variant_names[chosen_partition]
      log("#{variant} picked")
      variant

    in_sample: ->
      active = @storage().get("#{@options.name}:in_sample")
      return active unless typeof active is 'undefined'
      active = Math.random() <= @options.sample
      @storage().set("#{@options.name}:in_sample", active)
      active

    add_goal: (goal) =>
      goal.add_experiment(this)

    add_goals: (goals) =>
      @add_goal(goal) for goal in goals

    storage: -> @options.storage_adapter

    tracking: -> @options.tracking_adapter

    _validate = ->
      throw 'an experiment name must be specified' if @options.name is null
      throw 'variants must be provided' if @options.variants is null
      throw 'trigger must be a function' if typeof @options.trigger isnt 'function'

  class @Goal
    constructor: (@name, @props={}) ->
      utils.defaults(@props, {unique: true})
      @experiments = []

    add_experiment: (experiment) ->
      @experiments.push(experiment)

    add_experiments: (experiments) ->
      @add_experiment(experiment) for experiment in experiments

    complete: ->
      for experiment in @experiments
        experiment.goal_complete(@name, @props)

  log = @log = (message) =>
    utils.set_debug(@options.debug)
    utils.log(message)

module.exports = AlephBet
