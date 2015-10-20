'use strict'

import Dispatcher from './dispatcher'
import events from 'events'
import actions from './actions'

const CHANGE_EVENT = 'change'

let EventEmitter = events.EventEmitter
let _devices = {}

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

    case actions.DEVICE_FOUND:
      let d = action.device
      d.selected = false
      _devices[d.uuid] = d
      store.emitChange()
      break

    case actions.CLEAR_DEVICES:
      _devices = {}
      store.emitChange()
      break

    case actions.SELECT_DEVICE:
      for (let i in _devices) {
        _devices[i].selected = false
      }
      _devices[action.uuid].selected = true
      store.emitChange()
      break

    default:
      console.log(`No registered handler for ${action.actionType}`)
  }
});

let store = new Store()
module.exports = store
