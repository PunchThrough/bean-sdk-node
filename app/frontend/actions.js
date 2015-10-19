"use strict"

import Dispatcher from './dispatcher'
import ipc from 'ipc'

// Action constants
const SERVER_DEVICE_FOUND = 'SERVER_DEVICE_FOUND'

ipc.on('deviceFound', function (device) {
  Actions.deviceFound(device)
})

let Actions = {

  deviceFound: (device)=> {
    Dispatcher.dispatch({
      actionType: SERVER_DEVICE_FOUND,
      device: device
    });
  }

}

module.exports = {
  Actions: Actions,
  SERVER_DEVICE_FOUND: SERVER_DEVICE_FOUND
}
