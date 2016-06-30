utils = require('./utils')
adapters = require('./adapters')
options = require('./options')
LocalStorageAdapter = require('./local_storage_adapter')

class AlephBet
  @options = options
  @utils = utils

  @GimelAdapter = adapters.GimelAdapter
  @PersistentQueueGoogleAnalyticsAdapter = adapters.PersistentQueueGoogleAnalyticsAdapter
  @PersistentQueueKeenAdapter = adapters.PersistentQueueKeenAdapter

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

  class @Experiment
    @_options:
      name: null
      variants: null
      sample: 1.0
      trigger: -> true
      tracking_adapter: AlephBet.GoogleUniversalAnalyticsAdapter
      storage_adapter: LocalStorageAdapter

    constructor: (@options={}) ->
      utils.defaults(@options, Experiment._options)
      _validate.call(this)
      @name = @options.name
      @variants = @options.variants
      @variant_names = utils.keys(@variants)
      _run.call(this)

    run: ->
      utils.log("running with options: #{JSON.stringify(@options)}")
      if variant = @get_stored_variant()
        # a variant was already chosen. activate it
        utils.log("#{variant} active")
        @activate_variant(variant)
      else
        @conditionally_activate_variant()

    _run = -> @run()

    activate_variant: (variant) ->
      @variants[variant]?.activate(this)
      @storage().set("#{@options.name}:variant", variant)

    # if experiment conditions match, pick and activate a variant, track experiment start
    conditionally_activate_variant: ->
      return unless @options.trigger()
      utils.log('trigger set')
      return unless @in_sample()
      utils.log('in sample')
      variant = @pick_variant()
      @tracking().experiment_start(@options.name, variant)
      @activate_variant(variant)

    goal_complete: (goal_name, props={}) ->
      utils.defaults(props, {unique: true})
      return if props.unique && @storage().get("#{@options.name}:#{goal_name}")
      variant = @get_stored_variant()
      return unless variant
      @storage().set("#{@options.name}:#{goal_name}", true) if props.unique
      utils.log("experiment: #{@options.name} variant:#{variant} goal:#{goal_name} complete")
      @tracking().goal_complete(@options.name, variant, goal_name)

    get_stored_variant: ->
      @storage().get("#{@options.name}:variant")

    pick_variant: ->
      partitions = 1.0 / @variant_names.length
      chosen_partition = Math.floor(Math.random() / partitions)
      variant = @variant_names[chosen_partition]
      utils.log("#{variant} picked")
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


module.exports = AlephBet
