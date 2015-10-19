'use strict'

import Dispatcher from 'dispatcher'
import events from 'events'
import assign from 'object-assign'
import SERVER_DEVICE_FOUND from '../lightblue/devices'

let EventEmitter = events.EventEmitter

const CHANGE_EVENT = 'change'

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

}


Dispatcher.register(function (action) {

  switch (action.actionType) {
    case SERVER_DEVICE_FOUND:
      console.log('store thing')
      break

    default:
    // none
  }
});

module.exports = Store
