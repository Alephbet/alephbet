class TestStorage {
  static namespace = "alephbet"

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

export default TestStorage
