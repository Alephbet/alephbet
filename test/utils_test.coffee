test = require('tape')
sinon = require('sinon')
_ = require('lodash')
Utils = require('../src/utils')

setup = ->
  utils = new Utils()

describe = (description, fn) ->
  test description, (t) ->
    setup()
    fn(t)

describe 'utils - check_weights', (t) ->
  variants = {
    a:
      weight: 50
    b:
      weight: 50
  }
  all_have_weights = Utils.check_weights(variants)
  variants = {
    a: {}
    b: {}
  }
  none_have_weights = Utils.check_weights(variants)
  variants = {
    a:
      weight: 20
    b: {}
  }
  some_have_weights = Utils.check_weights(variants)
  t.plan(3)
  t.assert(all_have_weights == true, 'all variants have weight')
  t.assert(none_have_weights == false, 'no variants have weights')
  t.assert(some_have_weights == false, 'only some variants have weight')

describe 'utils - sum_weights', (t) ->
  default_sum = Utils.sum_weights({})
  variants = {
    a:
      weight: 55
    b:
      weight: 35
  }
  sum_with_weights = Utils.sum_weights(variants)
  variants.b = {}
  sum_with_missing_weights = Utils.sum_weights(variants)
  t.plan(3)
  t.assert(default_sum == 0, 'sum should be 0 with no weights')
  t.assert(sum_with_weights == 90, 'sum is 90 with all weights')
  t.assert(sum_with_missing_weights == 55, 'sum is 55 with some weights')

describe 'utils - validate_weights', (t) ->
  variants = {
    a:
      weight: 55
    b:
      weight: 35
  }
  all_have_weights = Utils.validate_weights(variants)
  variants = {
    a:
      weight: 55
    b: {}
  }
  some_have_weights = Utils.validate_weights(variants)
  variants = {
    a: {}
    b: {}
  }
  none_have_weights = Utils.validate_weights(variants)
  t.plan(3)
  t.assert(all_have_weights == true, 'all have weights is valid')
  t.assert(some_have_weights == false, 'only some have weights is invalid')
  t.assert(none_have_weights == true, 'none have weights is valid')
