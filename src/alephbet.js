import options from "./options"

export {default as Goal} from "./goal"
export {default as Experiment} from "./experiment"
export {default as utils} from "./utils"
export {default as options} from "./options"
export {default as GimelAdapter} from "./adapters/gimel_adapter"
export {default as TrackingAdapter} from "./adapters/tracking_adapter"
export {default as LocalStorageAdapter} from "./adapters/local_storage_adapter"
export {
  default as PersistentQueueGoogleAnalyticsAdapter
} from "./adapters/persistent_queue_google_analytics_adapter"
export {
  default as GoogleUniversalAnalyticsAdapter
} from "./adapters/google_universal_analytics_adapter"

export default {options}
