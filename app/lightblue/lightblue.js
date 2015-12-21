'use strict'

let noble = require('noble')
let devices = require('./devices')
let FirmwareUpdater = require('./oad')

const NOBLE_STATE_READY = 'poweredOn'

class LightBlueSDK {
  constructor() {
    this._fwUpdater = new FirmwareUpdater()
    this._devices = {}
    this._events = {
      discover: (cb) => this._discover(cb)
    }

    // State
    this._scanning = false
  }

  _disconnectDevices() {
    for (let i in this._devices) {
      let d = this._devices[i]
      if (d.isConnected()) {
        d.disconnect()
        console.log(`Disconnected from Bean: ${d.getName()}`)
      }
    }
  }

  _discover(cb) {
    /**
     * A new BLE peripheral device has been discovered (from Noble)
     */
    noble.on('discover', (peripheral) => {

      if (this._devices[peripheral.uuid]) {
        // We already have a record of this device

        let device = devices.fromExistingDevice(this._devices[peripheral.uuid], peripheral)

        // Check and handle Auto-reconnect cases
        if (device.autoReconnect() && !device.isConnectedOrConnecting()) {
          console.log(`Auto reconnecting to ${device.getName()}`)
          this.connectToDevice(peripheral.uuid, (err)=> {
            if (err) {
              console.log(`Error reconnecting to ${device.getName()}`)
            }
            else {
              console.log(`Auto reconnect to ${device.getName()} success`)
              if (this._fwUpdater.isInProgress(device)) {
                this._fwUpdater.continueUpdate()
              }
            }
          })
        }
      } else {
        // We don't have a record of this device

        let device = devices.fromNoblePeripheral(peripheral)
        if (device.getType() == devices.DEVICE_TYPE_LIGHT_BLUE) {
          this._devices[device.getUUID()] = device
          cb(device)
        }
      }
    })
  }

  reset() {
    console.log('Disconnected all devices!')
    this._disconnectDevices()
    console.log('Clearing device cache!')
    this._devices = {}
  }

  startScanning() {
    if (noble.state === NOBLE_STATE_READY) {
      console.log('Starting to scan...')
      noble.startScanning([], true)
      this._scanning = true
    } else {
      noble.on('stateChange', function (state) {
        if (state === NOBLE_STATE_READY) {
          console.log('Starting to scan...')
          noble.startScanning([], true)
          this._scanning = true
        }
      })
    }
  }

  stopScanning() {
    console.log('No longer scanning...')
    noble.stopScanning()
    this._scanning = false
  }

  getDeviceForUUID(uuid) {
    return this._devices[uuid]
  }

  on(event, callback) {
    this._events[event](callback)
  }

  updateFirmware(device, callback) {
    this._fwUpdater.beginUpdate(device, callback)
  }

  connectToDevice(uuid, callback) {
    /**
     * Connect to a device, preserving scanning state
     *
     * This method exists on the LB object by design, in addition to the Device object itself.
     * This is because Noble will not connect to a device while scanning is enabled, therefore
     * we stop scanning, connect to the device, and then set scanning back to it's original state.
     *
     * @param uuid string UUID of device
     * @param callback Function with one error param
     */

    let d = this._devices[uuid]
    if (d) {
      let originalScanningState = this._scanning
      this.stopScanning()
      d.connect((err)=> {
        if (originalScanningState == true)
          this.startScanning()
        callback(err)
      })
    } else {
      callback(`No device: ${uuid}`)
    }
  }

  quitGracefully() {
    console.log('Quitting LightBlue SDK...')
    this.stopScanning()
    this._disconnectDevices()
  }
}

module.exports = new LightBlueSDK()
