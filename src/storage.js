// a thin wrapper around localStorage checking if localStorage is available
class Storage {
  constructor(namespace = "alephbet") {
    this.namespace = namespace
    try {
      const check = "localstorage_check"
      localStorage.setItem(check, check)
      localStorage.removeItem(check)
      this.storage = JSON.parse(localStorage[this.namespace] || "{}")
    } catch {
      throw new Error("localStorage is not available")
    }
  }

  set(key, value) {
    this.storage[key] = value
    localStorage.set(this.namespace, JSON.stringify(this.storage))
    return value
  }

  get(key) {
    return this.storage[key]
    // store.get("#{@namespace}:#{key}")
  }
}

export default Storage
