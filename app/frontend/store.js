'use strict'

import Dispatcher from './dispatcher'
import events from 'events'
import actions from './actions'

const CHANGE_EVENT = 'change'

let EventEmitter = events.EventEmitter
let _devices = []

class Store extends EventEmitter {
  constructor() {
    super()
  }

  emitChange() {
    this.emit(CHANGE_EVENT)
  }

  addChangeListener(callback) {
    this.on(CHANGE_EVENT, callback)
  }

  removeChangeListener(callback) {
    this.removeListener(CHANGE_EVENT, callback)
  }

  getDevices() {
    return _devices
  }

}

Dispatcher.register(function (action) {

  switch (action.actionType) {
    case actions.SERVER_DEVICE_FOUND:
      _devices.push(action.device)
      store.emitChange()
      break

    default:
      console.log(`No registered handler for ${action.actionType}`)
  }
});

let store = new Store()
module.exports = store
