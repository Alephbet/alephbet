utils = require('./utils.js.coffee')
Storage = require('./storage.js.coffee')

class AlephBet
  @options = {debug: false}

  class @GoogleUniversalAnalyticsAdapter
    @namespace: 'alephbet'

    @_track: (category, action, label, value) ->
      log("Google Universal Analytics track: #{category}, #{action}, #{label}, #{value}")
      throw 'ga not defined. Please make sure your Universal analytics is set up correctly' if typeof ga isnt 'function'
      ga('send', 'event', category, action, label, value)

    @onInitialize: (experiment_name, variant) =>
      @_track(@namespace, experiment_name, "#{variant} | Visitors")

    @onEvent: (experiment_name, variant, event_name) =>
      @_track(@namespace, experiment_name, "#{variant} | #{event_name}")

  class @Experiment
    @_options:
      name: null
      variants: null
      sample: 1.0
      trigger: -> true
      tracking_adapter: AlephBet.GoogleUniversalAnalyticsAdapter

    constructor: (@options={}) ->
      utils.defaults(@options, Experiment._options)
      _validate.call(this)
      @variants = utils.keys(@options.variants)
      _run.call(this)

    run: ->
      log("running with options: #{@options}")
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
        @options.tracking_adapter.onInitialize(@options.name, variant)
      @options.variants[variant]?.activate()

    goal_complete: (goal_name, props={}) ->
      utils.defaults(props, {unique: true})
      return if props.unique && storage.get("#{@options.name}:#{goal_name}")
      variant = @get_stored_variant()
      return unless variant
      storage.set("#{@options.name}:#{goal_name}", true) if props.unique
      @options.tracking_adapter.onEvent(@options.name, variant, goal_name)

    get_stored_variant: ->
      storage.get("#{@options.name}:variant")

    pick_variant: ->
      partitions = 1.0 / @variants.length
      chosen_partition = Math.floor(Math.random() / partitions)
      variant = @variants[chosen_partition]
      log("#{variant} picked")
      storage.set("#{@options.name}:variant", variant)

    in_sample: ->
      active = storage.get("#{@options.name}:in_sample")
      return active unless typeof active is 'undefined'
      storage.set("#{@options.name}:in_sample", Math.random() <= @options.sample)

    add_goal: (goal) =>
      goal.add_experiment(this)

    _validate = ->
      throw 'an experiment name must be specified' if @options.name is null
      throw 'variants must be provided' if @options.variants is null
      throw 'trigger must be a function' if typeof @options.trigger isnt 'function'

  class @Goal
    constructor: (@name, @props={}) ->
      utils.defaults(@props, {unique: true})

    add_experiment: (experiment) ->
      @experiments ||= []
      @experiments.push(experiment)

    complete: ->
      for experiment in @experiments
        experiment.goal_complete(@name, @props)

log = (message) ->
  utils.set_debug(AlephBet.options.debug)
  utils.log(message)

storage = new Storage('alephbet')

module.exports = AlephBet
