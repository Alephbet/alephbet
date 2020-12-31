import GimelAdapter from "../src/adapters/gimel_adapter"
import utils from "../src/utils"
import TestStorage from "./test_storage"

const url = "http://url.com"
let gimel

describe("GimelAdapters", () => {
  beforeEach(() => {
    jest.spyOn(utils, "uuid").mockImplementation(() => "uuid")
    const storage = new TestStorage()
    gimel = new GimelAdapter(url, "gimel", storage)
    jest.spyOn(gimel, "_remove_quuid").mockImplementation(() => "callback")
  })

  it("start an experiment", () => {
    expect.assertions(1)
    jest.spyOn(gimel, "_ajax_get").mockImplementation()
    gimel.experiment_start({name: "experiment"}, "blue")
    // console.log(gimel._ajax_get.getCall(0).args)
    expect(gimel._ajax_get).toHaveBeenCalledWith(
      url,
      {
        experiment: "experiment",
        uuid: "uuid",
        variant: "blue",
        event: "participate",
        namespace: "gimel"
      },
      "callback"
    )
  })

  it("starts an experiment with user_id", () => {
    expect.assertions(1)
    jest.spyOn(gimel, "_ajax_get").mockImplementation()
    gimel.experiment_start({name: "experiment", user_id: "yuzu"}, "blue")
    expect(gimel._ajax_get).toHaveBeenCalledWith(
      url,
      {
        experiment: "experiment",
        uuid: "bd602047286a161da01f2c938461edde4e467a63",
        variant: "blue",
        event: "participate",
        namespace: "gimel"
      },
      "callback"
    )
  })

  it("completes a goal", () => {
    expect.assertions(1)
    jest.spyOn(gimel, "_ajax_get").mockImplementation()
    gimel.goal_complete(
      {name: "experiment"}, "red", "goal", {unique: true}
    )
    expect(gimel._ajax_get).toHaveBeenCalledWith(
      url,
      {
        experiment: "experiment",
        uuid: "uuid",
        variant: "red",
        event: "goal",
        namespace: "gimel"
      },
      "callback"
    )
  })

  it("completes a goal with user_id", () => {
    expect.assertions(1)
    jest.spyOn(gimel, "_ajax_get").mockImplementation()
    gimel.goal_complete(
      {name: "experiment", user_id: "yuzu"},
      "red",
      "goal",
      {unique: true}
    )
    expect(gimel._ajax_get).toHaveBeenCalledWith(
      url,
      {
        experiment: "experiment",
        uuid: "bd602047286a161da01f2c938461edde4e467a63",
        variant: "red",
        event: "goal",
        namespace: "gimel"
      },
      "callback"
    )
  })
})
