test = require('tape')
sinon = require('sinon')
Adapters = require('../src/adapters')
utils = require('../src/utils')

storage = null
tracking = null
gimel = null
url = null
namespace = null
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
  namespace = 'gimel'
  gimel = new Adapters.GimelAdapter(url, namespace, storage)
  keen = new Adapters.PersistentQueueKeenAdapter(keen_client, storage)
  gimel._remove_quuid = keen._remove_quuid = remove_quuid

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

describe 'keen : experiment_start', (t) ->
  t.plan(1)
  keen.experiment_start({name: 'experiment'}, 'blue')
  t.assert(keen_client.addEvent.calledWith('experiment',
                                           uuid: 'uuid'
                                           variant: 'blue'
                                           event: 'participate',
                                           'callback'
                                          ), 'uses a random uuid, with participate event')
