import AlephbetAdapter from "../src/adapters/alephbet_adapter"
import GimelAdapter from "../src/adapters/gimel_adapter"
import utils from "../src/utils"
import TestStorage from "./test_storage"

const url = "http://url.com"
let gimel
let storage

describe("GimelAdapters", () => {
  beforeEach(() => {
    jest.spyOn(utils, "uuid").mockImplementation(() => "uuid")
    storage = new TestStorage()
    gimel = new GimelAdapter(url, "gimel", storage)
    jest.spyOn(gimel, "_remove_quuid").mockImplementation(() => "callback")
  })

  it("doesn't include the goal in the hash calculation", () => {
    expect.assertions(2)
    const experiment = {name: "experiment", user_id: "yuzu"}
    const goal = {name: "participate", unique: true}
    const uuid = gimel._user_uuid(experiment, goal)
    expect(uuid).toStrictEqual("bd602047286a161da01f2c938461edde4e467a63")
    const adapter = new AlephbetAdapter(url, "alephbet", storage)
    expect(uuid).not.toStrictEqual(adapter._user_uuid(experiment, goal))
  })
})
