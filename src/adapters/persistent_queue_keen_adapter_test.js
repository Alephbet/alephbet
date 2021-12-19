import PersistentQueueKeenAdapter from
  "../src/adapters/persistent_queue_keen_adapter"
import utils from "../src/utils"
import TestStorage from "./test_storage"

let keen
let keen_client

describe("PersistentQueueKeenAdapter", () => {
  beforeEach(() => {
    jest.spyOn(utils, "uuid").mockImplementation(() => "uuid")
    const storage = new TestStorage()
    keen_client = {addEvent: jest.fn()}
    keen = new PersistentQueueKeenAdapter(keen_client, storage)
    jest.spyOn(keen, "_remove_quuid").mockImplementation(() => "callback")
  })

  it("starts an experiment", () => {
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
