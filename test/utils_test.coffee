test = require('tape')
sinon = require('sinon')
_ = require('lodash')
Utils = require('../src/utils')

setup = ->
  utils = new Utils();

describe = (description, fn) ->
  test description, (t) ->
    setup()
    fn(t)

describe 'utils - checkWeights', (t) ->
  variants = {
    a:
      weight: 50
    b:
      weight: 50
  }
  all_has_weight = Utils.checkWeights(variants);
  variants = {
    a: {}
    b: {}
  }
  none_has_weight = Utils.checkWeights(variants);
  variants = {
    a:
      weight: 20
    b: {}
  }
  some_has_weight = Utils.checkWeights(variants);
  t.plan(3)
  t.assert(all_has_weight == true, 'all variants contains weight')
  t.assert(none_has_weight == false, 'variants does not contain weights')
  t.assert(some_has_weight == false, 'only some variants does not have weight')

describe 'utils - sumWeights', (t) ->
  variants = {
    a:
      weight: 55
    b:
      weight: 35
  }
  sum = Utils.sumWeights(variants);
  t.plan(1)
  t.assert(sum == 90, 'sum should be equal 90')

describe 'utils - validateWeights', (t) ->
  variants = {
    a:
      weight: 55
    b:
      weight: 35
  }
  all_valid = Utils.validateWeights(variants);
  variants = {
    a:
      weight: 55
    b: {}
  }
  some_valid = Utils.validateWeights(variants);
  variants = {
    a: {}
    b: {}
  }
  all_not_have_weight = Utils.validateWeights(variants);
  t.plan(3)
  t.assert(all_valid == true, 'all should be valid')
  t.assert(some_valid == false, 'only some are valid')
  t.assert(all_not_have_weight == true, 'all does not contain weight but are valid')
