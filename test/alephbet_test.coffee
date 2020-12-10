import AlephBet from '../src/alephbet'
import _ from 'lodash'

storage = null
tracking = null
experiment = null
activate = null

class TestStorage
  @namespace: 'alephbet'
  constructor: ->
    @storage = {}
  set: (key, value) ->
    @storage[key] = value
  get: (key) ->
    @storage[key]

class TestTracking
  experiment_start: jest.fn()
  goal_complete: jest.fn()

beforeEach ->
  jest.resetAllMocks()
  storage = new TestStorage
  tracking = new TestTracking
  activate = jest.fn()

  default_options =
    name: 'experiment'
    variants:
      blue:
        activate: activate
      red:
        activate: activate
    storage_adapter: storage
    tracking_adapter: tracking
  experiment = (options={}) ->
    new AlephBet.Experiment(_.defaults(options, default_options))

test 'starts the experiment', () ->
  ex = experiment({name: 'my-experiment'})
  expect(storage.get('my-experiment:in_sample')).toBeTruthy()
  variant = ex.get_stored_variant()
  expect(variant).toEqual(storage.get('my-experiment:variant'))
  expect(variant == 'blue' || variant == 'red').toBeTruthy()
  expect(activate).toHaveBeenCalledTimes(1)
  expect(activate).toHaveBeenCalledWith(ex)
  expect(tracking.experiment_start).toHaveBeenCalledTimes(1)

test 'validates experiment parameters', () ->
  expect(->
    new AlephBet.Experiment()
  ).toThrowError(
    new Error('an experiment name must be specified')
  )
  expect(->
    new AlephBet.Experiment(name: 'Test')
  ).toThrowError(
    new Error('variants must be provided')
  )
  expect(->
    new AlephBet.Experiment(name: 'Test', variants: {}, trigger: "")
  ).toThrowError(
    new Error('trigger must be a function')
  )

test 'deterministic variant with a given user_id', () ->
  ex = experiment({user_id: 'yuzu'})
  expect(ex.pick_variant()).toBe('blue')
  ex = experiment({user_id: 'gosho'})
  expect(ex.pick_variant()).toBe('red')

test 'sticks to the same variant after choosing it', () ->
  ex = experiment({name: 'variant test'})
  variant = ex.get_stored_variant()
  experiment({name: 'variant test'})
  experiment({name: 'variant test'})
  expect(activate).toHaveBeenCalledTimes(3)

test 'not in sample', () ->
  experiment({sample: 0.0})
  expect(storage.get('experiment:in_sample')).toBeFalsy()
  expect(tracking.experiment_start).not.toHaveBeenCalled()

test 'trigger is false', () ->
  experiment({trigger: -> false})
  expect(tracking.experiment_start).not.toHaveBeenCalled()

test 'trigger is false after participating', () ->
  experiment({trigger: -> true})
  experiment({trigger: -> false})
  expect(activate).toHaveBeenCalledTimes(2)

test 'tracks goals', () ->
  ex = experiment({name: 'with-goals'})
  ex.goal_complete('my goal')
  ex.goal_complete('my goal')
  expect(tracking.goal_complete).toHaveBeenCalledTimes(1)
  expect(storage.get('with-goals:my goal')).toBeTruthy()

test 'tracks non unique goals', () ->
  ex = experiment({name: 'with-goals'})
  ex.goal_complete('my goal', unique: false)
  ex.goal_complete('my goal', unique: false)
  expect(tracking.goal_complete).toHaveBeenCalledTimes(2)
  expect(storage.get('with-goals:my goal')).toBeFalsy()

test 'when all variants have weights', () ->
  ex = experiment({
    name: 'with-weights'
    variants:
      blue:
        weight: 0
        activate: activate
      green:
        weight: 100
        activate: activate
  })
  expect(ex.pick_variant()).toBe('green')
  expect(ex.pick_variant()).not.toBe('blue')

test 'when all variants have weights (with user_id)', () ->
  ex = experiment({
    user_id: 'yuzu'
    variants:
      blue:
        weight: 20
        activate: activate
      red:
        weight: 80
        activate: activate
  })
  expect(ex.pick_variant()).toBe('blue')
  ex.user_id = 'gosho'
  expect(ex.pick_variant()).toBe('red')

test 'when only some variants have weights', () ->
  expect(->
    experiment({
      name: 'not-all-weights'
      variants:
        blue:
          activate: activate
        green:
          weight: 100
          activate: activate
    })
  ).toThrow()
  expect(activate).not.toHaveBeenCalled()
