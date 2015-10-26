'use strict'

import util from './util'
import async from 'async'

// Services
const UUID_DEVICE_INFORMATION = 0x180A
const UUID_OAD = 0x0000

// Chars
const UUID_SOFTWARE_VERSION = 0x2A28
const UUID_FIRMWARE_VERSION = 0x2A26
const UUID_HARDWARE_VERSION = 0x2A27
const UUID_MFG_NAME = 0x2A29
const UUID_MODEL_NUMBER = 0x2A24


function fromNobleService(nobleService) {
  if (util.normalizeUUID(nobleService.uuid) === UUID_DEVICE_INFORMATION) {

    // Convert chars from array to object
    let chars = {}
    for (let i in nobleService.characteristics) {
      let c = nobleService.characteristics[i]
      chars[util.normalizeUUID(c.uuid)] = c
    }

    return new DeviceInformationService(chars, nobleService)

  } else {
    return new BleService([], nobleService)
  }
}


class BleService {
  /**
   * Base class for all BLE services
   */

  constructor(characteristics, nobleService) {
    this._characteristics = characteristics
    this._nobleService = nobleService
    this._charValueCache = {}
  }

  resetCache() {
    this._charValueCache = {}
  }

  getName() {
    return this._nobleService.name == null ? 'Unknown' : this._nobleService.name
  }

  getUUID() {
    return this._nobleService.uuid
  }

}

class DeviceInformationService extends BleService {
  /**
   * Standard Device Information service for BLE devices
   */

  constructor(characteristics, nobleService) {
    super(characteristics, nobleService)
  }

  _performCachedLookup(key, callback) {
    if (this._charValueCache[key])
      callback(null, this._charValueCache[key])

    let char = this._characteristics[key]
    this._charValueCache[key] = char.read((err, data)=> {
      if (err)
        console.log(`Error reading characteristic(${key}): ${err}`)
      else
        console.log(`Char read success(${key}): ${data}`)
      callback(err, data)
    })
  }

  getManufacturerName(callback) {
    this._performCachedLookup(UUID_MFG_NAME, callback)
  }

  getModelNumber(callback) {
    this._performCachedLookup(UUID_MODEL_NUMBER, callback)
  }

  getHardwareVersion(callback) {
    this._performCachedLookup(UUID_HARDWARE_VERSION, callback)
  }

  getFirmwareVersion(callback) {
    this._performCachedLookup(UUID_FIRMWARE_VERSION, callback)
  }

  getSoftwareVersion(callback) {
    this._performCachedLookup(UUID_SOFTWARE_VERSION, callback)
  }

  serialize(finalCallback) {
    async.parallel([
      // Have to wrap these with fat arrows to conserve `this` context
      (cb) => this.getManufacturerName(cb),
      (cb) => this.getModelNumber(cb),
      (cb) => this.getHardwareVersion(cb),
      (cb) => this.getFirmwareVersion(cb),
      (cb)=> this.getSoftwareVersion(cb)
    ], (err, results) => {
      if (err) {
        console.log(err)
        finalCallback(err, null)
      } else {
        finalCallback(null, {
          manufacturer_name: results[0].toString('utf8'),
          model_number: results[1].toString('utf8'),
          hardware_version: results[2].toString('utf8'),
          firmware_version: results[3].toString('utf8'),
          software_version: results[4].toString('utf8')
        })
      }
    });
  }
}

module.exports = {
  fromNobleService: fromNobleService,
  UUID_DEVICE_INFORMATION: UUID_DEVICE_INFORMATION
}
