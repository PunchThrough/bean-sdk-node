'use strict'

let util = require('./util')
let async = require('async')
let buffer = require('buffer')

// Services
const UUID_SERVICE_DEVICE_INFORMATION = 0x180A
const UUID_SERVICE_BATTERY = 0x180F
const UUID_SERVICE_OAD = util.normalizeUUID('F000FFC004514000B000000000000000', 16)

// Chars
const UUID_CHAR_SOFTWARE_VERSION = 0x2A28
const UUID_CHAR_FIRMWARE_VERSION = 0x2A26
const UUID_CHAR_HARDWARE_VERSION = 0x2A27
const UUID_CHAR_MFG_NAME = 0x2A29
const UUID_CHAR_MODEL_NUMBER = 0x2A24

const UUID_CHAR_OAD_IDENTIFY = util.normalizeUUID('F000FFC104514000B000000000000000', 16)
const UUID_CHAR_OAD_BLOCK = util.normalizeUUID('F000FFC204514000B000000000000000', 16)


function _charListToObject(charList) {
  let chars = {}
  for (let i in charList) {
    let c = charList[i]
    chars[util.normalizeUUID(c.uuid)] = c
  }
  return chars
}

function fromNobleService(nobleService) {
  /**
   * Given a noble service object, translate it into one of our services
   */

  let s = null
  switch (util.normalizeUUID(nobleService.uuid)) {
    case UUID_SERVICE_DEVICE_INFORMATION:
      s = new DeviceInformationService(_charListToObject(nobleService.characteristics), nobleService)
      break
    case UUID_SERVICE_OAD:
      s = new OADService(_charListToObject(nobleService.characteristics), nobleService)
      break
    default:
      s = new BleService([], nobleService)
      break
  }
  return s
}


class BleService {
  /**
   * Generic BLE Service and base class for all BLE services
   *
   * @param characteristics
   * @param nobleService
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

class OADService extends BleService {
  /**
   * Custom LightBlue OAD Service
   *
   * @param characteristics
   * @param nobleService
   */

  constructor(characteristics, nobleService) {
    super(characteristics, nobleService)

    // Object that holds arrays of callbacks, keyed by the attribute value
    this._registeredNotificationCallbacks = {}
    this._registeredNotificationCallbacks[UUID_CHAR_OAD_BLOCK] = []     // default empty array
    this._registeredNotificationCallbacks[UUID_CHAR_OAD_IDENTIFY] = []  // default empty array

    // Setup notifications IDENTIFY
    this._characteristics[UUID_CHAR_OAD_IDENTIFY].notify(true, (err)=> {
      if (err) console.log(err)
    })
    this._characteristics[UUID_CHAR_OAD_IDENTIFY].on('read', (data, isNotification)=> {
      if (isNotification) this._onIdentifyNotification(data)
    })

    // Setup notifications BLOCK
    this._characteristics[UUID_CHAR_OAD_BLOCK].notify(true, (err)=> {
      if (err) console.log(err)
    })
    this._characteristics[UUID_CHAR_OAD_BLOCK].on('read', (data, isNotification)=> {
      if (isNotification) this._onBlockNotification(data)
    })
  }

  _fireCBs(key, data) {
    for (let i in this._registeredNotificationCallbacks[key]) {
      let cb = this._registeredNotificationCallbacks[key][i]
      cb(data)
    }
  }

  _onIdentifyNotification(data) {
    console.log('Got Notification - IDENTIFY')
    console.log(data)
    this._fireCBs(UUID_CHAR_OAD_IDENTIFY, data)
  }

  _onBlockNotification(data) {
    console.log('Got Notification - BLOCK')
    console.log(data)
    this._fireCBs(UUID_CHAR_OAD_BLOCK, data)
  }

  registerForNotifications(key, cb) {
    this._registeredNotificationCallbacks[key].push(cb)
  }

  getName() {
    return 'OAD Service'
  }

  triggerIdentifyHeaderNotification() {
    let zeros = new buffer.Buffer(16).fill(0)
    this._characteristics[UUID_CHAR_OAD_IDENTIFY].write(zeros, true, (err)=> {
      if (err)
        console.log(`Error: ${err}`)
    })
  }

  writeToIdentify(buf, callback) {
    this._characteristics[UUID_CHAR_OAD_IDENTIFY].write(buf, true, callback)
  }

  writeToBlock(buf, callback) {
    this._characteristics[UUID_CHAR_OAD_BLOCK].write(buf, true, callback)
  }

}

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
          manufacturer_name: results[0] == undefined ? '' : results[0].toString('utf8'),
          model_number: results[1] == undefined ? '' : results[1].toString('utf8'),
          hardware_version: results[2] == undefined ? '' : results[2].toString('utf8'),
          firmware_version: results[3] == undefined ? '' : results[3].toString('utf8'),
          software_version: results[4] == undefined ? '' : results[4].toString('utf8')
        })
      }
    });
  }
}

module.exports = {
  fromNobleService: fromNobleService,
  UUID_SERVICE_DEVICE_INFORMATION: UUID_SERVICE_DEVICE_INFORMATION,
  UUID_SERVICE_OAD: UUID_SERVICE_OAD,
  UUID_CHAR_OAD_IDENTIFY: UUID_CHAR_OAD_IDENTIFY,
  UUID_CHAR_OAD_BLOCK: UUID_CHAR_OAD_BLOCK
}
