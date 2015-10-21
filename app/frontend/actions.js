"use strict"

import Dispatcher from './dispatcher'
import ipc from 'ipc'

// Action constants
const DEVICE_FOUND = 'DEVICE_FOUND'
const CLEAR_DEVICES = 'CLEAR_DEVICES'
const SELECT_DEVICE = 'SELECT_DEVICE'


ipc.on('deviceFound', function (device) {
  Actions.deviceFound(device)
})

let Actions = {

  deviceFound: (device) => {
    Dispatcher.dispatch({
      actionType: DEVICE_FOUND,
      device: device
    });
  },

  clearDevices: () => {
    Dispatcher.dispatch({
      actionType: CLEAR_DEVICES
    })
  },

  startScanning: () => {
    ipc.send('startScanning')
  },

  stopScanning: () => {
    ipc.send('stopScanning')
  },

  refreshDeviceList: () => {
    Actions.stopScanning()
    Actions.clearDevices()
    Actions.startScanning()
  },

  selectDevice: (uuid) => {
    ipc.send('connectToDevice', uuid)
    Dispatcher.dispatch({
      actionType: SELECT_DEVICE,
      uuid: uuid
    })
  }


}

module.exports = {
  Actions: Actions,
  DEVICE_FOUND: DEVICE_FOUND,
  CLEAR_DEVICES: CLEAR_DEVICES,
  SELECT_DEVICE: SELECT_DEVICE
}
