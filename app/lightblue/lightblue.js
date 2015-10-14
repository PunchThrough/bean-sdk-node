"use strict"

import noble from 'noble'
import devices from './devices.js'

class LightBlueSDK {
  constructor() {
    this._events = {
      discover: this._discover
    }
  }

  _discover(cb) {
    noble.on('discover', (peripheral) => {
      cb(devices.fromPeripheral(peripheral))
    })
  }

  startScanning() {
    noble.on('stateChange', function (state) {
      if (state === 'poweredOn') {
        noble.startScanning();
      }
    })
  }

  stopScanning() {
    noble.stopScanning()
  }

  on(event, callback) {
    this._events[event](callback)
  }

}

module.exports.sdk = new LightBlueSDK()
