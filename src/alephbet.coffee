utils = require('./utils')
adapters = require('./adapters')
options = require('./options')

class AlephBet
  @options = options
  @utils = utils

  @GimelAdapter = adapters.GimelAdapter
  @PersistentQueueGoogleAnalyticsAdapter = adapters.PersistentQueueGoogleAnalyticsAdapter
  @PersistentQueueKeenAdapter = adapters.PersistentQueueKeenAdapter

  class @Experiment
    @_options:
      name: null
      variants: null
      user_id: null
      sample: 1.0
      trigger: -> true
      tracking_adapter: adapters.GoogleUniversalAnalyticsAdapter
      storage_adapter: adapters.LocalStorageAdapter

    constructor: (@options={}) ->
      utils.defaults(@options, Experiment._options)
      _validate.call(this)
      @name = @options.name
      @variants = @options.variants
      @user_id = @options.user_id
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
      @tracking().experiment_start(this, variant)
      @activate_variant(variant)

    goal_complete: (goal_name, props={}) ->
      utils.defaults(props, {unique: true})
      return if props.unique && @storage().get("#{@options.name}:#{goal_name}")
      variant = @get_stored_variant()
      return unless variant
      @storage().set("#{@options.name}:#{goal_name}", true) if props.unique
      utils.log("experiment: #{@options.name} variant:#{variant} goal:#{goal_name} complete")
      @tracking().goal_complete(this, variant, goal_name, props)

    get_stored_variant: ->
      @storage().get("#{@options.name}:variant")

    pick_variant: ->
      # we are checking that all variants of experiment has weights
      all_variants_have_weights = utils.checkWeights(@variants)
      utils.log("all variants has weight: #{all_variants_have_weights}")
      # if all variants has weights than we should fire version for variants with weight
      if all_variants_have_weights then @pick_weighted_variant() else @pick_unweighted_variant()

    pick_weighted_variant: ->

      # Choosing a weighted variant:
      # For A, B, C with weights 10, 30, 60
      # variants = A, B, C
      # weights = 10, 30, 60
      # weights_sum = 100 (sum of weights)
      # weighted_index = 21 (random number between 0 and weight sum)
      # ABBBCCCCCC - (every letter occurence should by multiplied by 10)
      # =======^
      # Select C
      weights_sum = utils.sumWeights(@variants)
      weighted_index = Math.floor((@_random('variant') * 100) + 1 )
      for key, value of @variants
        # then we are substracting variant weight from selected number
        # and it it reaches 0 (or below) we are selecting this variant
        weighted_index -= value.weight
        return key if weighted_index <= 0

    pick_unweighted_variant: ->
      partitions = 1.0 / @variant_names.length
      chosen_partition = Math.floor(@_random('variant') / partitions)
      variant = @variant_names[chosen_partition]
      utils.log("#{variant} picked")
      variant

    in_sample: ->
      active = @storage().get("#{@options.name}:in_sample")
      return active unless typeof active is 'undefined'
      active = @_random('sample') <= @options.sample
      @storage().set("#{@options.name}:in_sample", active)
      active

    _random: (salt) ->
      return utils.random() unless @user_id
      seed = "#{@name}.#{salt}.#{@user_id}"
      utils.random(seed)

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
      every_variant_has_weight = utils.validateWeights @options.variants
      throw 'not all variants contains weight' if !every_variant_has_weight

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
