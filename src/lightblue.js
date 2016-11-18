'use strict'


const devices = require('./devices')
const FirmwareUpdater = require('./firmware-updater').FirmwareUpdater
const SketchUploader = require('./sketch-uploader').SketchUploader
const events = require('events')
const logger = require('./util/logs').logger
const async = require('async')

const NOBLE_STATE_READY = 'poweredOn'


class LightBlueSDK extends events.EventEmitter {
  /**
   * Core LightBlue SDK class
   *
   * This class implements the EventEmitter which allows clients to register
   * for events using the .on() method. Events include:
   *
   *    - "discover"
   *
   */

  constructor() {
    super()

    // Dependencies
    this._noble = require('noble')
    this._fwUpdater = new FirmwareUpdater(this)
    this._sketchUploader = new SketchUploader()

    // State
    this._devices = {}
    this._scannedDevices = {}
    this._scanning = false
    this._scanTimeout = null
    this._filter = false  // filter on lightblue devices only

    this._noble.on('discover', (peripheral)=> {
      this._discover(peripheral)
    })
  }

  _discover(peripheral) {
    /**
     * A new BLE peripheral device has been discovered (from Noble)
     */

    let address = peripheral.uuid
    let scannedDevice = this._scannedDevices[address]
    if (!scannedDevice) {
      scannedDevice = new devices.ScannedDevice(peripheral)
      this._scannedDevices[address] = scannedDevice
    }

    let updated = scannedDevice.update(peripheral)

    if (this._checkForUpdateInProgress(scannedDevice)) {
      return  // Don't emit any events during fw update for this device
    }

    if ((scannedDevice.getType() === devices.DEVICE_TYPE_LIGHT_BLUE && updated) ||
      (this._filter === false && updated)) {
      this.emit('discover', scannedDevice)
    }
  }

  _checkForUpdateInProgress(scannedDevice) {
    let updateInProgress = false
    let device = this._devices[scannedDevice.getAddress()]
    if (device) {
      device.update(scannedDevice.getPeripheral())
      if (this._fwUpdater.isInProgress(device)) {
        updateInProgress = true
        if (!device.isConnectedOrConnecting()) {
          device.connect((err, device)=> {
            device.lookupServices((err)=> {
              this._fwUpdater.continueUpdate()
            })
          })
        }
      }
    }
    return updateInProgress
  }

  quitGracefully(callback) {
    let disconnects = []

    this.stopScanning()

    Object.keys(this._devices).forEach((key)=> {
      let d = this._devices[key]
      disconnects.push((disconnectCallback)=> {
        d.disconnect(disconnectCallback)
      })
    })

    async.parallel(disconnects, function (error, results) {
      logger.info('All devices have disconnected')
      callback(error)
    })
  }

  reset() {
    logger.info('Disconnected all devices!')
    this._disconnectDevices()
    logger.info('Clearing device cache!')
    this._devices = {}
    this._fwUpdater.resetState()
  }

  startScanning(timeoutSeconds=30, filter=false, timeoutCallback=null) {
    /**
     * Start a BLE scan for a given period of time
     *
     * @param timeout int Number of seconds to scan
     * @param timeoutCallback Function called back after scan timeout
     */

    let _ctx = this
    let _noble = this._noble
    this._filter = filter

    if (_noble.state === NOBLE_STATE_READY) {
      logger.info('Starting to scan...')
      _noble.startScanning([], true)
      this._scanning = true
    } else {
      _noble.on('stateChange', function (state) {
        if (state === NOBLE_STATE_READY) {
          logger.info('Starting to scan...')
          _noble.startScanning([], true)
          _ctx._scanning = true
        }
      })
    }

    logger.info(`Setting scan timeout: ${timeoutSeconds} seconds`)
    this._scanTimeout = setTimeout(()=> {
      logger.info("Scan timeout!")
      _ctx.stopScanning()
      if (timeoutCallback) {
        timeoutCallback()
      }
    }, timeoutSeconds * 1000)
  }

  stopScanning() {
    logger.info('No longer scanning...')
    clearTimeout(this._scanTimeout)
    this._noble.stopScanning()
    this._scanning = false
  }

  getDeviceForUUID(uuid) {
    return this._devices[uuid]
  }

  /**
   * Update a devices firmware
   *
   * @param device LightBlue Device object
   * @param bundle an array of firmware images
   */
  updateFirmware(device, bundle, force, callback) {
    this._fwUpdater.beginUpdate(device, bundle, force, callback)
  }

  uploadSketch(device, sketchBuf, sketchName, promptUser, callback) {
    this.stopScanning()
    this._sketchUploader.beginUpload(device, sketchBuf, sketchName, promptUser, callback)
  }

  connectScannedDevice(scannedDevice, callback) {
    let device = this._devices[scannedDevice.getAddress()]
    if (device) {
      device.update(scannedDevice.getPeripheral())
    } else {
      if (scannedDevice.getType() === devices.DEVICE_TYPE_LIGHT_BLUE) {
        device = new devices.LightBlueDevice(scannedDevice.getPeripheral())
      } else {
        device = new devices.BleDevice(scannedDevice.getPeripheral())
      }
      this._devices[device.getAddress()] = device
    }

    device.connect(callback)
  }
}


let sdk = null


function getSdk() {
  if (!sdk) {
    sdk = new LightBlueSDK()
  }

  return sdk
}


module.exports = {
  sdk: getSdk
}
