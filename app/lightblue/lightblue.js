"use strict"

import noble from 'noble'
import devices from './devices.js'

const NOBLE_STATE_READY = 'poweredOn'

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

  on(event, callback) {
    this._events[event](callback)
  }

}

module.exports = new LightBlueSDK()
