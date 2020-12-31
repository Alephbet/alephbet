import Storage from "../storage"

const LocalStorageAdapter = {
  namespace: "alephbet",

  set(key, value) {
    return new Storage(this.namespace).set(key, value)
  },

  get(key) {
    return new Storage(this.namespace).get(key)
  }
}
export default LocalStorageAdapter
