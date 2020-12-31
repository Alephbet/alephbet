import Experiment from "../src/experiment"
import _ from "lodash"

let storage = null
let tracking = null
let experiment = null
let activate = null

class TestStorage {
  static namespace = "alephbet"

  constructor() {
    this.storage = {}
  }

  set(key, value) {
    this.storage[key] = value
    return this.storage[key]
  }

  get(key) {
    return this.storage[key]
  }
}

class TestTracking {
  experiment_start() {
  }

  goal_complete() {
  }
}

describe("AlephBet", () => {
  beforeEach(() => {
    storage = new TestStorage()
    tracking = new TestTracking()
    jest.spyOn(tracking, "experiment_start")
    jest.spyOn(tracking, "goal_complete")
    activate = jest.fn()

    const default_options = {
      name: "experiment",
      variants: {
        blue: {
          activate
        },
        red: {
          activate
        }
      },
      storage_adapter: storage,
      tracking_adapter: tracking
    }
    experiment = (options = {}) =>
      new Experiment(_.defaults(options, default_options))
  })

  it("starts the experiment", () => {
    expect.assertions(6)
    const ex = experiment({name: "my-experiment"})
    expect(storage.get("my-experiment:in_sample")).toBeTruthy()
    const variant = ex.get_stored_variant()
    expect(variant).toStrictEqual(storage.get("my-experiment:variant"))
    expect((variant === "blue") || (variant === "red")).toBeTruthy()
    expect(activate).toHaveBeenCalledTimes(1)
    expect(activate).toHaveBeenCalledWith(ex)
    expect(tracking.experiment_start).toHaveBeenCalledTimes(1)
  })

  it("validates experiment parameters", () => {
    expect.assertions(3)
    expect(() => new Experiment()).toThrow(
      new Error("an experiment name must be specified")
    )
    expect(() => new Experiment({name: "Test"})).toThrow(
      new Error("variants must be provided")
    )
    expect(() =>
      new Experiment({name: "Test", variants: {}, trigger: ""})
    ).toThrow(
      new Error("trigger must be a function")
    )
  })

  it("picks deterministic variant with a given user_id", () => {
    expect.assertions(2)
    let ex = experiment({user_id: "yuzu"})
    expect(ex.pick_variant()).toBe("blue")
    ex = experiment({user_id: "gosho"})
    expect(ex.pick_variant()).toBe("red")
  })

  it("sticks to the same variant after choosing it", () => {
    expect.assertions(1)
    const ex = experiment({name: "variant test"})
    ex.get_stored_variant()
    experiment({name: "variant test"})
    experiment({name: "variant test"})
    expect(activate).toHaveBeenCalledTimes(3)
  })

  it("is not in sample", () => {
    expect.assertions(2)
    experiment({sample: 0.0})
    expect(storage.get("experiment:in_sample")).toBeFalsy()
    expect(tracking.experiment_start).not.toHaveBeenCalled()
  })

  it("doesn't start when trigger is false", () => {
    expect.assertions(1)
    experiment({trigger: () => false})
    expect(tracking.experiment_start).not.toHaveBeenCalled()
  })

  it("calls active twice when trigger is false", () => {
    expect.assertions(1)
    experiment({trigger: () => true})
    experiment({trigger: () => false})
    expect(activate).toHaveBeenCalledTimes(2)
  })

  it("tracks goals", () => {
    expect.assertions(2)
    experiment({trigger: () => true})
    const ex = experiment({name: "with-goals"})
    ex.goal_complete("my goal")
    ex.goal_complete("my goal")
    expect(tracking.goal_complete).toHaveBeenCalledTimes(1)
    expect(storage.get("with-goals:my goal")).toBeTruthy()
  })

  it("tracks non unique goals", () => {
    expect.assertions(2)
    const ex = experiment({name: "with-goals"})
    ex.goal_complete("my goal", {unique: false})
    ex.goal_complete("my goal", {unique: false})
    expect(tracking.goal_complete).toHaveBeenCalledTimes(2)
    expect(storage.get("with-goals:my goal")).toBeFalsy()
  })

  it("takes weight into account when picking variant", () => {
    expect.assertions(2)
    const ex = experiment({
      name: "with-weights",
      variants: {
        blue: {
          weight: 0,
          activate
        },
        green: {
          weight: 100,
          activate
        }
      }
    })
    expect(ex.pick_variant()).toBe("green")
    expect(ex.pick_variant()).not.toBe("blue")
  })

  it("takes weight into account when picking variant (with user_id)", () => {
    expect.assertions(2)
    const ex = experiment({
      user_id: "yuzu",
      variants: {
        blue: {
          weight: 20,
          activate
        },
        red: {
          weight: 80,
          activate
        }
      }
    })
    expect(ex.pick_variant()).toBe("blue")
    ex.user_id = "gosho"
    expect(ex.pick_variant()).toBe("red")
  })

  it("throws error when only some variants have weights", () => {
    expect.assertions(2)
    expect(() => experiment({
      name: "not-all-weights",
      variants: {
        blue: {
          activate
        },
        green: {
          weight: 100,
          activate
        }
      }
    })).toThrow(Error("not all variants have weights"))
    expect(activate).not.toHaveBeenCalled()
  })
})
