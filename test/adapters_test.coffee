test = require('tape')
sinon = require('sinon')
Adapters = require('../src/adapters')
utils = require('../src/utils')

storage = null
tracking = null
gimel = null
lamed = null
url = null
keen = null
keen_client =
  addEvent: sinon.spy()
utils.uuid = sinon.stub().returns('uuid')
remove_quuid = sinon.stub().returns('callback')

class TestStorage
  @namespace: 'alephbet'
  constructor: ->
    @storage = {}
  set: (key, value) ->
    @storage[key] = value
  get: (key) ->
    @storage[key]

setup = ->
  storage = new TestStorage
  url = 'http://url.com'
  gimel = new Adapters.GimelAdapter(url, 'gimel', storage)
  lamed = new Adapters.LamedAdapter(url, 'lamed', storage)
  keen = new Adapters.PersistentQueueKeenAdapter(keen_client, storage)
  gimel._remove_quuid = keen._remove_quuid = lamed._remove_quuid = remove_quuid

describe = (description, fn) ->
  test description, (t) ->
    setup()
    fn(t)

describe 'gimel : experiment_start', (t) ->
  gimel._ajax_get = sinon.spy()
  t.plan(1)
  gimel.experiment_start({name: 'experiment'}, 'blue')
  # console.log(gimel._ajax_get.getCall(0).args)
  t.assert(gimel._ajax_get.calledWith(url,
                                      experiment: 'experiment'
                                      uuid: 'uuid'
                                      variant: 'blue'
                                      event: 'participate'
                                      namespace: 'gimel',
                                      'callback'
                                     ), 'uses a random uuid, with participate event')

describe 'gimel : experiment_start with user_id', (t) ->
  gimel._ajax_get = sinon.spy()
  t.plan(1)
  gimel.experiment_start({name: 'experiment', user_id: 'yuzu'}, 'blue')
  t.assert(gimel._ajax_get.calledWith(url,
                                      experiment: 'experiment'
                                      uuid: 'bd602047286a161da01f2c938461edde4e467a63'
                                      variant: 'blue'
                                      event: 'participate'
                                      namespace: 'gimel',
                                      'callback'
                                     ), 'uses a consistent hash based on user_id, with participate event')

describe 'gimel : goal_complete', (t) ->
  gimel._ajax_get = sinon.spy()
  t.plan(1)
  gimel.goal_complete({name: 'experiment'}, 'red', 'goal', {unique: true})
  t.assert(gimel._ajax_get.calledWith(url,
                                      experiment: 'experiment'
                                      uuid: 'uuid'
                                      variant: 'red'
                                      event: 'goal'
                                      namespace: 'gimel',
                                      'callback'
                                     ), 'uses a random uuid, with the goal name')

describe 'gimel : goal_complete with user_id', (t) ->
  gimel._ajax_get = sinon.spy()
  t.plan(1)
  gimel.goal_complete({name: 'experiment', user_id: 'yuzu'}, 'red', 'goal', {unique: true})
  t.assert(gimel._ajax_get.calledWith(url,
                                      experiment: 'experiment'
                                      uuid: 'bd602047286a161da01f2c938461edde4e467a63'
                                      variant: 'red'
                                      event: 'goal'
                                      namespace: 'gimel',
                                      'callback'
                                     ), 'uses a consistent hash based on user_id, with the goal name')

describe 'lamed : experiment_start', (t) ->
  lamed._ajax_get = sinon.spy()
  t.plan(1)
  lamed.experiment_start({name: 'experiment'}, 'blue')
  t.assert(lamed._ajax_get.calledWith(url,
                                      experiment: 'experiment'
                                      uuid: 'uuid'
                                      variant: 'blue'
                                      event: 'participate'
                                      namespace: 'lamed',
                                      'callback'
                                     ), 'uses a random uuid, with participate event')

describe 'lamed : experiment_start with user_id', (t) ->
  lamed._ajax_get = sinon.spy()
  t.plan(1)
  lamed.experiment_start({name: 'experiment', user_id: 'yuzu'}, 'blue')
  # console.log(lamed._ajax_get.getCall(0).args)
  t.assert(lamed._ajax_get.calledWith(url,
                                      experiment: 'experiment'
                                      uuid: '6bb0da99203847d88ce20dabf3d822f49f156734'
                                      variant: 'blue'
                                      event: 'participate'
                                      namespace: 'lamed',
                                      'callback'
                                     ), 'uses a consistent hash based on user_id, with participate event')

describe 'lamed : goal_complete', (t) ->
  lamed._ajax_get = sinon.spy()
  t.plan(1)
  lamed.goal_complete({name: 'experiment'}, 'red', 'goal', {unique: true})
  t.assert(lamed._ajax_get.calledWith(url,
                                      experiment: 'experiment'
                                      uuid: 'uuid'
                                      variant: 'red'
                                      event: 'goal'
                                      namespace: 'lamed',
                                      'callback'
                                     ), 'uses a random uuid, with the goal name')

describe 'lamed : goal_complete with user_id', (t) ->
  lamed._ajax_get = sinon.spy()
  t.plan(1)
  lamed.goal_complete({name: 'experiment', user_id: 'yuzu'}, 'red', 'goal', {unique: true})
  # console.log(lamed._ajax_get.getCall(0).args)
  t.assert(lamed._ajax_get.calledWith(url,
                                      experiment: 'experiment'
                                      uuid: 'e69f2e0ab65fec7136f1c2f17b98df35e39c91be'
                                      variant: 'red'
                                      event: 'goal'
                                      namespace: 'lamed',
                                      'callback'
                                     ), 'uses a consistent hash based on user_id, with the goal name')

describe 'keen : experiment_start', (t) ->
  t.plan(1)
  keen.experiment_start({name: 'experiment'}, 'blue')
  t.assert(keen_client.addEvent.calledWith('experiment',
                                           uuid: 'uuid'
                                           variant: 'blue'
                                           event: 'participate',
                                           'callback'
                                          ), 'uses a random uuid, with participate event')
