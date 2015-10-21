"use strict"

import noble from 'noble'
import devices from './devices.js'

const NOBLE_STATE_READY = 'poweredOn'

class LightBlueSDK {
  constructor() {
    this._devices = {}
    this._events = {
      discover: (cb) => this._discover(cb)
    }
  }

  _discover(cb) {
    noble.on('discover', (peripheral) => {
      let device = devices.fromPeripheral(peripheral)
      this._devices[device.getUUID()] = device
      cb(device)
    })
  }

  startScanning() {
    if (noble.state === NOBLE_STATE_READY) {
      noble.startScanning()
    } else {
      noble.on('stateChange', function (state) {
        if (state === NOBLE_STATE_READY) {
          noble.startScanning()
        }
      })
    }
  }

  stopScanning() {
    noble.stopScanning()
  }

  getDeviceForUUID(uuid) {
    return this._devices[uuid]
  }

  on(event, callback) {
    this._events[event](callback)
  }

}

module.exports = new LightBlueSDK()
