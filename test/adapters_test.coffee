import Adapters from '../src/adapters'
import utils from '../src/utils'

storage = null
tracking = null
gimel = null
lamed = null
url = null
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
  gimel = new Adapters.GimelAdapter(url, 'gimel', storage)
  lamed = new Adapters.LamedAdapter(url, 'lamed', storage)
  keen = new Adapters.PersistentQueueKeenAdapter(keen_client, storage)
  gimel._remove_quuid = keen._remove_quuid = lamed._remove_quuid = remove_quuid


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

test 'lamed : experiment_start', () ->
  lamed._ajax_get = jest.fn()
  lamed.experiment_start({name: 'experiment'}, 'blue')
  expect(lamed._ajax_get).toHaveBeenCalledWith(
    url,
    experiment: 'experiment'
    uuid: 'uuid'
    variant: 'blue'
    event: 'participate'
    namespace: 'lamed',
    'callback'
  )

test 'lamed : experiment_start with user_id', () ->
  lamed._ajax_get = jest.fn()
  lamed.experiment_start({name: 'experiment', user_id: 'yuzu'}, 'blue')
  # console.log(lamed._ajax_get.getCall(0).args)
  expect(lamed._ajax_get).toHaveBeenCalledWith(
    url,
    experiment: 'experiment'
    uuid: '6bb0da99203847d88ce20dabf3d822f49f156734'
    variant: 'blue'
    event: 'participate'
    namespace: 'lamed',
    'callback'
  )

test 'lamed : goal_complete', () ->
  lamed._ajax_get = jest.fn()
  lamed.goal_complete({name: 'experiment'}, 'red', 'goal', {unique: true})
  expect(lamed._ajax_get).toHaveBeenCalledWith(
    url,
    experiment: 'experiment'
    uuid: 'uuid'
    variant: 'red'
    event: 'goal'
    namespace: 'lamed',
    'callback'
  )

test 'lamed : goal_complete with user_id', () ->
  lamed._ajax_get = jest.fn()
  lamed.goal_complete({name: 'experiment', user_id: 'yuzu'}, 'red', 'goal', {unique: true})
  # console.log(lamed._ajax_get.getCall(0).args)
  expect(lamed._ajax_get).toHaveBeenCalledWith(
    url,
    experiment: 'experiment'
    uuid: 'e69f2e0ab65fec7136f1c2f17b98df35e39c91be'
    variant: 'red'
    event: 'goal'
    namespace: 'lamed',
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
