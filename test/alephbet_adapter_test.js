import AlephbetAdapter from "../src/adapters/alephbet_adapter"
import utils from "../src/utils"
import TestStorage from "./test_storage"

const url = "http://url.com"
let adapter

describe("AlephbetAdapter", () => {
  beforeEach(() => {
    jest.spyOn(utils, "uuid").mockImplementation(() => "uuid")
    const storage = new TestStorage()
    adapter = new AlephbetAdapter(url, "alephbet", storage)
    jest.spyOn(adapter, "_remove_quuid").mockImplementation(() => "callback")
  })

  it("uses the correct queue name", () => {
    expect.assertions(1)
    expect(adapter.queue_name).toBe("_alephbet_queue")
  })

  it("start an experiment", () => {
    expect.assertions(1)
    jest.spyOn(adapter, "_ajax_get").mockImplementation()
    adapter.experiment_start({name: "experiment"}, "blue")
    expect(adapter._ajax_get).toHaveBeenCalledWith(
      url,
      {
        experiment: "experiment",
        uuid: "uuid",
        variant: "blue",
        event: "participate",
        namespace: "alephbet"
      },
      "callback"
    )
  })

  it("starts an experiment with user_id", () => {
    expect.assertions(1)
    jest.spyOn(adapter, "_ajax_get").mockImplementation()
    adapter.experiment_start({name: "experiment", user_id: "yuzu"}, "blue")
    expect(adapter._ajax_get).toHaveBeenCalledWith(
      url,
      {
        experiment: "experiment",
        uuid: "464edeb5ba5fc24fc012784e676f22a1da1f9953",
        variant: "blue",
        event: "participate",
        namespace: "alephbet"
      },
      "callback"
    )
  })

  it("completes a goal", () => {
    expect.assertions(1)
    jest.spyOn(adapter, "_ajax_get").mockImplementation()
    adapter.goal_complete(
      {name: "experiment"}, "red", "goal", {unique: true}
    )
    expect(adapter._ajax_get).toHaveBeenCalledWith(
      url,
      {
        experiment: "experiment",
        uuid: "uuid",
        variant: "red",
        event: "goal",
        namespace: "alephbet"
      },
      "callback"
    )
  })

  it("completes a goal with user_id", () => {
    expect.assertions(1)
    jest.spyOn(adapter, "_ajax_get").mockImplementation()
    adapter.goal_complete(
      {name: "experiment", user_id: "yuzu"},
      "red",
      "goal",
      {unique: true}
    )
    expect(adapter._ajax_get).toHaveBeenCalledWith(
      url,
      {
        experiment: "experiment",
        uuid: "ef6f39573c0b0244bc3e7df063fe728d5c03ffa7",
        variant: "red",
        event: "goal",
        namespace: "alephbet"
      },
      "callback"
    )
  })
})
