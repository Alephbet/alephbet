import Adapters from "../src/adapters"
import utils from "../src/utils"

let storage = null
let gimel = null
let lamed = null
let url = null
let keen = null
const keen_client =
  {addEvent: jest.fn()}
jest.spyOn(utils, "uuid").mockImplementation(() => "uuid")
const remove_quuid = jest.fn(() => "callback")

class TestStorage {
  static initClass() {
    this.namespace = "alephbet"
  }

  constructor() {
    this.storage = {}
  }

  set(key, value) {
    this.storage[key] = value
    return value
  }

  get(key) {
    return this.storage[key]
  }
}
TestStorage.initClass()

describe("Adapters", () => {
  beforeEach(() => {
    storage = new TestStorage()
    url = "http://url.com"
    gimel = new Adapters.GimelAdapter(url, "gimel", storage)
    lamed = new Adapters.LamedAdapter(url, "lamed", storage)
    keen = new Adapters.PersistentQueueKeenAdapter(keen_client, storage)
    lamed._remove_quuid = remove_quuid
    keen._remove_quuid = remove_quuid
    gimel._remove_quuid = remove_quuid
  })

  it("gimel : experiment_start", () => {
    expect.assertions(1)
    jest.spyOn(gimel, "_ajax_get").mockImplementation()
    gimel.experiment_start({name: "experiment"}, "blue")
    // console.log(gimel._ajax_get.getCall(0).args)
    expect(gimel._ajax_get).toHaveBeenCalledWith(
      url, {
        experiment: "experiment",
        uuid: "uuid",
        variant: "blue",
        event: "participate",
        namespace: "gimel"
      },
      "callback"
    )
  })

  it("gimel : experiment_start with user_id", () => {
    expect.assertions(1)
    jest.spyOn(gimel, "_ajax_get").mockImplementation()
    gimel.experiment_start({name: "experiment", user_id: "yuzu"}, "blue")
    expect(gimel._ajax_get).toHaveBeenCalledWith(
      url, {
        experiment: "experiment",
        uuid: "bd602047286a161da01f2c938461edde4e467a63",
        variant: "blue",
        event: "participate",
        namespace: "gimel"
      },
      "callback"
    )
  })

  it("gimel : goal_complete", () => {
    expect.assertions(1)
    jest.spyOn(gimel, "_ajax_get").mockImplementation()
    gimel.goal_complete({name: "experiment"}, "red", "goal", {unique: true})
    expect(gimel._ajax_get).toHaveBeenCalledWith(
      url, {
        experiment: "experiment",
        uuid: "uuid",
        variant: "red",
        event: "goal",
        namespace: "gimel"
      },
      "callback"
    )
  })

  it("gimel : goal_complete with user_id", () => {
    expect.assertions(1)
    jest.spyOn(gimel, "_ajax_get").mockImplementation()
    gimel.goal_complete(
      {name: "experiment", user_id: "yuzu"},
      "red",
      "goal",
      {unique: true}
    )
    expect(gimel._ajax_get).toHaveBeenCalledWith(
      url, {
        experiment: "experiment",
        uuid: "bd602047286a161da01f2c938461edde4e467a63",
        variant: "red",
        event: "goal",
        namespace: "gimel"
      },
      "callback"
    )
  })

  it("lamed : experiment_start", () => {
    expect.assertions(1)
    jest.spyOn(lamed, "_ajax_get").mockImplementation()
    lamed.experiment_start({name: "experiment"}, "blue")
    expect(lamed._ajax_get).toHaveBeenCalledWith(
      url, {
        experiment: "experiment",
        uuid: "uuid",
        variant: "blue",
        event: "participate",
        namespace: "lamed"
      },
      "callback"
    )
  })

  it("lamed : experiment_start with user_id", () => {
    expect.assertions(1)
    jest.spyOn(lamed, "_ajax_get").mockImplementation()
    lamed.experiment_start({name: "experiment", user_id: "yuzu"}, "blue")
    // console.log(lamed._ajax_get.getCall(0).args)
    expect(lamed._ajax_get).toHaveBeenCalledWith(
      url, {
        experiment: "experiment",
        uuid: "6bb0da99203847d88ce20dabf3d822f49f156734",
        variant: "blue",
        event: "participate",
        namespace: "lamed"
      },
      "callback"
    )
  })

  it("lamed : goal_complete", () => {
    expect.assertions(1)
    jest.spyOn(lamed, "_ajax_get").mockImplementation()
    lamed.goal_complete({name: "experiment"}, "red", "goal", {unique: true})
    expect(lamed._ajax_get).toHaveBeenCalledWith(
      url, {
        experiment: "experiment",
        uuid: "uuid",
        variant: "red",
        event: "goal",
        namespace: "lamed"
      },
      "callback"
    )
  })

  it("lamed : goal_complete with user_id", () => {
    expect.assertions(1)
    jest.spyOn(lamed, "_ajax_get").mockImplementation()
    lamed.goal_complete(
      {name: "experiment", user_id: "yuzu"},
      "red",
      "goal",
      {unique: true}
    )
    // console.log(lamed._ajax_get.getCall(0).args)
    expect(lamed._ajax_get).toHaveBeenCalledWith(
      url, {
        experiment: "experiment",
        uuid: "e69f2e0ab65fec7136f1c2f17b98df35e39c91be",
        variant: "red",
        event: "goal",
        namespace: "lamed"
      },
      "callback"
    )
  })

  it("keen : experiment_start", () => {
    expect.assertions(1)
    keen.experiment_start({name: "experiment"}, "blue")
    expect(keen_client.addEvent).toHaveBeenCalledWith(
      "experiment", {
        uuid: "uuid",
        variant: "blue",
        event: "participate"
      },
      "callback"
    )
  })
})
