import {v4} from "uuid"
import options from "./options"

const sha1 = require("sha1")

const Utils = {
  keys: Object.keys,
  uuid: v4,

  defaults: (obj, defaults) => {
    for (const key in defaults) {
      const value = defaults[key]
      if (obj[key] === undefined) {
        obj[key] = value
      }
    }
    return obj
  },

  remove: (list, callback) => {
    const deletions = []
    const iterable = [...list]
    for (let index = 0; index < iterable.length; index++) {
      const el = iterable[index]
      if (callback(el, index)) {
        list.splice(list.indexOf(el), 1)
        deletions.push(el)
      }
    }
    return deletions
  },

  omit: (obj, ...keys) => {
    const results = {...obj}
    for (const key of Array.from([].concat.apply([], keys))) {
      delete results[key]
    }
    return results
  },

  log: (message, extra) => {
    if (options.debug) {
      // eslint-disable-next-line no-console
      if (!!extra) {
        // see https://developer.mozilla.org/en-US/docs/Web/API/Console/log#logging_objects
        console.log(`[Alephbet] ${message}`, JSON.parse(JSON.stringify(extra)))
      } else {
        console.log(`[Alephbet] ${message}`)
      }
    }
  },

  sha1: (text) => sha1(text).toString(),

  random(seed) {
    if (!seed) return Math.random()
    // a MUCH simplified version inspired by PlanOut.js
    return parseInt(this.sha1(seed).substr(0, 13), 16) / 0xFFFFFFFFFFFFF
  },

  check_weights: (variants) => {
    const contains_weight = []
    for (const key in variants) {
      const value = variants[key]; contains_weight.push(value.weight != null)
    }
    return contains_weight.every(has_weight => has_weight)
  },

  sum_weights: (variants) => {
    let sum = 0
    for (const key in variants) {
      const value = variants[key]
      sum += value.weight || 0
    }
    return sum
  },

  validate_weights: (variants) => {
    const contains_weight = []
    for (const value of Object.values(variants)) {
      contains_weight.push(value.weight != null)
    }
    return contains_weight.every(has_weight =>
      has_weight || contains_weight.every(has_weight => !has_weight)
    )
  }
}

export default Utils
