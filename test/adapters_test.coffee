Adapters = require('../src/adapters')
utils = require('../src/utils')

storage = null
tracking = null
gimel = null
url = null
namespace = null
keen = null
keen_client =
  addEvent: jest.fn()
utils.uuid = jest.fn(() -> 'uuid')
remove_quuid = jest.fn(() -> 'callback')

class TestStorage
  @namespace: 'alephbet'
  constructor: ->
    @storage = {}
  set: (key, value) ->
    @storage[key] = value
  get: (key) ->
    @storage[key]

beforeEach ->
  storage = new TestStorage
  url = 'http://url.com'
  namespace = 'gimel'
  gimel = new Adapters.GimelAdapter(url, namespace, storage)
  keen = new Adapters.PersistentQueueKeenAdapter(keen_client, storage)
  gimel._remove_quuid = keen._remove_quuid = remove_quuid


test 'gimel : experiment_start', () ->
  gimel._ajax_get = jest.fn()
  gimel.experiment_start({name: 'experiment'}, 'blue')
  # console.log(gimel._ajax_get.getCall(0).args)
  expect(gimel._ajax_get).toHaveBeenCalledWith(
    url,
    experiment: 'experiment'
    uuid: 'uuid'
    variant: 'blue'
    event: 'participate'
    namespace: 'gimel',
    'callback'
  )

test 'gimel : experiment_start with user_id', () ->
  gimel._ajax_get = jest.fn()
  gimel.experiment_start({name: 'experiment', user_id: 'yuzu'}, 'blue')
  expect(gimel._ajax_get).toHaveBeenCalledWith(
    url,
    experiment: 'experiment'
    uuid: 'bd602047286a161da01f2c938461edde4e467a63'
    variant: 'blue'
    event: 'participate'
    namespace: 'gimel',
    'callback'
  )

test 'gimel : goal_complete', () ->
  gimel._ajax_get = jest.fn()
  gimel.goal_complete({name: 'experiment'}, 'red', 'goal', {unique: true})
  expect(gimel._ajax_get).toHaveBeenCalledWith(
    url,
    experiment: 'experiment'
    uuid: 'uuid'
    variant: 'red'
    event: 'goal'
    namespace: 'gimel',
    'callback'
  )

test 'gimel : goal_complete with user_id', () ->
  gimel._ajax_get = jest.fn()
  gimel.goal_complete({name: 'experiment', user_id: 'yuzu'}, 'red', 'goal', {unique: true})
  expect(gimel._ajax_get).toHaveBeenCalledWith(
    url,
    experiment: 'experiment'
    uuid: 'bd602047286a161da01f2c938461edde4e467a63'
    variant: 'red'
    event: 'goal'
    namespace: 'gimel',
    'callback'
  )

test 'keen : experiment_start', () ->
  keen.experiment_start({name: 'experiment'}, 'blue')
  expect(keen_client.addEvent).toHaveBeenCalledWith(
    'experiment',
    uuid: 'uuid'
    variant: 'blue'
    event: 'participate',
    'callback'
  )
