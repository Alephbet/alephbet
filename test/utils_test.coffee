_ = require('lodash')

Utils = require('../src/utils')

test 'omit', () ->
  obj = {a: 1, b: 2, c: 3}
  new_obj = Utils.omit(obj, "a")
  expect(new_obj).not.toEqual(obj)
  expect(new_obj).toEqual(_.omit(obj, "a"))
  expect(Utils.omit(obj, ["a", "b"]))
    .toEqual(_.omit(obj, ["a", "b"]))

test 'remove', () ->
  list = [1, 2, 3, 4, 5]
  Utils.remove(list, (el) -> el == 2)
  expect(list).toEqual([1, 3, 4, 5])
  Utils.remove(list, (el) -> el == 3 || el == 5)
  expect(list).toEqual([1, 4])

test 'defaults', () ->
  defaults = {a: 1, b: 2, c: 3}
  obj = {a: 5}
  Utils.defaults(obj, defaults)
  expect(obj).toEqual({a: 5, b: 2, c: 3})

test 'utils - check_weights', () ->
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
  expect(all_have_weights).toBeTruthy()
  expect(none_have_weights).toBeFalsy()
  expect(some_have_weights).toBeFalsy()

test 'utils - sum_weights', () ->
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
  expect(default_sum).toBe(0)
  expect(sum_with_weights).toBe(90)
  expect(sum_with_missing_weights).toBe(55)

test 'utils - validate_weights', () ->
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
  expect(all_have_weights).toBeTruthy()
  expect(some_have_weights).toBeFalsy()
  expect(none_have_weights).toBeTruthy()
