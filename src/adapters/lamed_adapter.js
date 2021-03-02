import AlephbetAdapter from "./alephbet_adapter"

// Adapter for using the lamed backend. See https://github.com/Alephbet/lamed
// inherits from AlephbetAdapter which uses the same backend API
class LamedAdapter extends AlephbetAdapter {
  queue_name = "_lamed_queue"
}

export default LamedAdapter
