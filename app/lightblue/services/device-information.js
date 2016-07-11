'use strict'


let async = require('async')
let BleService = require ('./base')


const UUID_SERVICE_DEVICE_INFORMATION = 0x180A

const UUID_CHAR_SOFTWARE_VERSION = 0x2A28
const UUID_CHAR_FIRMWARE_VERSION = 0x2A26
const UUID_CHAR_HARDWARE_VERSION = 0x2A27
const UUID_CHAR_MFG_NAME = 0x2A29
const UUID_CHAR_MODEL_NUMBER = 0x2A24


class DeviceInformationService extends BleService {
  /**
   * Standard BLE Device Information Service
   *
   * @param characteristics
   * @param nobleService
   */

  constructor(characteristics, nobleService) {
    super(characteristics, nobleService)
  }

  _performCachedLookup(key, callback) {
    if (this._charValueCache[key]) {
      let cachedVal = this._charValueCache[key]
      console.log(`Got cached value(${key}): ${cachedVal}`)
      callback(null, cachedVal)
      return
    }

    let char = this._characteristics[key]
    char.read((err, data)=> {
      if (err) {
        console.log(`Error reading characteristic(${key.toString(16)}): ${err}`)
        callback(err, null)
      } else {
        this._charValueCache[key] = data
        console.log(`Char read success(${key.toString(16)}): ${data}`)
        callback(null, data)
      }
    })
  }

  getManufacturerName(callback) {
    this._performCachedLookup(UUID_CHAR_MFG_NAME, callback)
  }

  getModelNumber(callback) {
    this._performCachedLookup(UUID_CHAR_MODEL_NUMBER, callback)
  }

  getHardwareVersion(callback) {
    this._performCachedLookup(UUID_CHAR_HARDWARE_VERSION, callback)
  }

  getFirmwareVersion(callback) {
    this._performCachedLookup(UUID_CHAR_FIRMWARE_VERSION, callback)
  }

  getSoftwareVersion(callback) {
    this._performCachedLookup(UUID_CHAR_SOFTWARE_VERSION, callback)
  }

  serialize(finalCallback) {
    async.parallel([
      // Have to wrap these with fat arrows to conserve `this` context
      (cb) => this.getManufacturerName(cb),
      (cb) => this.getModelNumber(cb),
      (cb) => this.getHardwareVersion(cb),
      (cb) => this.getFirmwareVersion(cb),
      (cb) => this.getSoftwareVersion(cb)
    ], (err, results) => {
      if (err) {
        console.log(err)
        finalCallback(err, null)
      } else {
        finalCallback(null, {
          manufacturer_name: results[0] === undefined ? '' : results[0].toString('utf8'),
          model_number: results[1] === undefined ? '' : results[1].toString('utf8'),
          hardware_version: results[2] === undefined ? '' : results[2].toString('utf8'),
          firmware_version: results[3] === undefined ? '' : results[3].toString('utf8'),
          software_version: results[4] === undefined ? '' : results[4].toString('utf8')
        })
      }
    });
  }
}

module.exports = {
  init: DeviceInformationService,
  UUID: UUID_SERVICE_DEVICE_INFORMATION
}
