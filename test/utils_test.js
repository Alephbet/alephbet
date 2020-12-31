import Utils from "../src/utils"
import _ from "lodash"

describe("AlephBet", () => {
  describe("#omit", () => {
    it("behaves like lodash.omit", () => {
      expect.assertions(3)
      const obj = {a: 1, b: 2, c: 3}
      const new_obj = Utils.omit(obj, "a")
      expect(new_obj).not.toStrictEqual(obj)
      expect(new_obj).toStrictEqual(_.omit(obj, "a"))
      expect(Utils.omit(obj, ["a", "b"]))
        .toStrictEqual(_.omit(obj, ["a", "b"]))
    })
  })

  describe("#remove", () => {
    it("behaves like lodash.remove", () => {
      expect.assertions(2)
      const list = [1, 2, 3, 4, 5]
      Utils.remove(list, el => el === 2)
      expect(list).toStrictEqual([1, 3, 4, 5])
      Utils.remove(list, el => (el === 3) || (el === 5))
      expect(list).toStrictEqual([1, 4])
    })
  })

  describe("#defaults", () => {
    it("behaves like lodash.defaults", () => {
      expect.assertions(1)
      const defaults = {a: 1, b: 2, c: 3}
      const obj = {a: 5}
      Utils.defaults(obj, defaults)
      expect(obj).toStrictEqual({a: 5, b: 2, c: 3})
    })
  })

  describe("#check_weights", () => {
    it("is true when all have weights", () => {
      expect.assertions(1)
      const variants = {
        a: {
          weight: 50
        },
        b: {
          weight: 50
        }
      }
      const all_have_weights = Utils.check_weights(variants)
      expect(all_have_weights).toBeTruthy()
    })

    it("is false when none have weights", () => {
      expect.assertions(1)
      const variants = {
        a: {},
        b: {}
      }
      const none_have_weights = Utils.check_weights(variants)
      expect(none_have_weights).toBeFalsy()
    })

    it("is false when some have weights", () => {
      expect.assertions(1)
      const variants = {
        a: {
          weight: 20
        },
        b: {}
      }
      const some_have_weights = Utils.check_weights(variants)
      expect(some_have_weights).toBeFalsy()
    })
  })

  describe("#sum_weights", () => {
    it("calculates the sum of the weights", () => {
      expect.assertions(3)
      const default_sum = Utils.sum_weights({})
      const variants = {
        a: {
          weight: 55
        },
        b: {
          weight: 35
        }
      }
      const sum_with_weights = Utils.sum_weights(variants)
      variants.b = {}
      const sum_with_missing_weights = Utils.sum_weights(variants)
      expect(default_sum).toBe(0)
      expect(sum_with_weights).toBe(90)
      expect(sum_with_missing_weights).toBe(55)
    })
  })

  describe("#validate_weights", () => {
    it("validates the weights", () => {
      expect.assertions(3)
      let variants = {
        a: {
          weight: 55
        },
        b: {
          weight: 35
        }
      }
      const all_have_weights = Utils.validate_weights(variants)
      variants = {
        a: {
          weight: 55
        },
        b: {}
      }
      const some_have_weights = Utils.validate_weights(variants)
      variants = {
        a: {},
        b: {}
      }
      const none_have_weights = Utils.validate_weights(variants)
      expect(all_have_weights).toBeTruthy()
      expect(some_have_weights).toBeFalsy()
      expect(none_have_weights).toBeTruthy()
    })
  })
})
