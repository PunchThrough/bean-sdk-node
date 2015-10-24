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
      console.log('Starting to scan...')
      noble.startScanning()
    } else {
      noble.on('stateChange', function (state) {
        if (state === NOBLE_STATE_READY) {
          console.log('Starting to scan...')
          noble.startScanning()
        }
      })
    }
  }

  stopScanning() {
    console.log('No longer scanning...')
    noble.stopScanning()
  }

  getDeviceForUUID(uuid) {
    return this._devices[uuid]
  }

  on(event, callback) {
    this._events[event](callback)
  }

  quitGracefully() {
    console.log('Quitting LightBlue SDK...')
    this.stopScanning()
    for (let i in this._devices) {
      let d = this._devices[i]
      if (d.isConnected()) {
        d.disconnect()
        console.log(`Disconnected from Bean: ${d.getName()}`)
      }
    }
  }
}

module.exports = new LightBlueSDK()
