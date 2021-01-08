// a thin wrapper around localStorage checking if localStorage is available
class Storage {
  constructor(namespace = "alephbet") {
    this.namespace = namespace
    try {
      const check = "localstorage_check"
      localStorage.setItem(check, check)
      localStorage.removeItem(check)
    } catch {
      throw new Error("localStorage is not available")
    }
  }

  set(key, value) {
    let storage = JSON.parse(localStorage.getItem(this.namespace) || "{}")
    storage[key] = value
    localStorage.setItem(this.namespace, JSON.stringify(storage))
    return value
  }

  get(key) {
    return JSON.parse(localStorage.getItem(this.namespace) || "{}")[key]
  }
}

export default Storage
