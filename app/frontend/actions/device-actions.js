'use strict'

let Dispatcher = require('../dispatcher')
let ipc = require('ipc')

// Action constants
const DEVICE_FOUND = 'DEVICE_FOUND'
const CLEAR_DEVICES = 'CLEAR_DEVICES'
const SELECT_DEVICE = 'SELECT_DEVICE'
const DEVICE_INFORMATION_READY = 'DEVICE_INFORMATION_READY'
const PERFORM_FIRMWARE_UPDATE = 'PERFORM_FIRMWARE_UPDATE'


ipc.on('deviceFound', function (device) {
  Actions.deviceFound(device)
})

ipc.on('deviceInformationReady', function (deviceInformation) {
  Actions.deviceInformationReady(deviceInformation)
})

let Actions = {

  deviceFound: (device) => {
    Dispatcher.dispatch({
      actionType: DEVICE_FOUND,
      device: device
    });
  },

  clearDevices: () => {
    ipc.send('clearDevices')
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
  },

  deviceInformationReady: (deviceInformation) => {
    Dispatcher.dispatch({
      actionType: DEVICE_INFORMATION_READY,
      device_information: deviceInformation
    })
  },

  performFirmwareUpdate: (uuid) => {
    ipc.send('performFirmwareUpdate', uuid)
    Dispatcher.dispatch({
      actionType: PERFORM_FIRMWARE_UPDATE,
      uuid: uuid
    })
  }
}

module.exports = {
  Actions: Actions,
  DEVICE_FOUND: DEVICE_FOUND,
  CLEAR_DEVICES: CLEAR_DEVICES,
  SELECT_DEVICE: SELECT_DEVICE,
  DEVICE_INFORMATION_READY: DEVICE_INFORMATION_READY
}
