'use strict'

const logger = require('../util/logs').logger


class BleService {
  /**
   * Generic BLE Service and base class for all BLE BleServices
   *
   * @param characteristics
   * @param nobleService
   */

  constructor(characteristics, nobleService) {
    this._characteristics = characteristics
    this._nobleService = nobleService
    this._charValueCache = {}
    this._registeredNotificationCallbacks = {}
  }

  _setupNotification(uuid, callback) {

    this._registeredNotificationCallbacks[uuid] = []

    this._characteristics[uuid].subscribe((err)=> {
      callback(err)
    })

    this._characteristics[uuid].on('read', (data, isNotification)=> {
      if (isNotification)
        this._fireNotificationCallbacks(uuid, data)
    })
  }

  _fireNotificationCallbacks(key, data) {
    for (let i in this._registeredNotificationCallbacks[key]) {
      let cb = this._registeredNotificationCallbacks[key][i]
      cb(data)
    }
  }

  _performCachedLookup(key, callback) {
    if (this._charValueCache[key]) {
      let cachedVal = this._charValueCache[key]
      logger.info(`Got cached value(${key}): ${cachedVal}`)
      callback(null, cachedVal)
      return
    }

    let char = this._characteristics[key]
    if (!char) {
      callback(`No such characteristic: ${key}`)
    } else {
      char.read((err, data)=> {
        if (err) {
          logger.info(`Error reading characteristic(${key.toString(16)}): ${err}`)
          callback(err, null)
        } else {
          this._charValueCache[key] = data
          logger.info(`Char read success(${key.toString(16)}): ${data}`)
          callback(null, data)
        }
      })
    }

  }

  resetCache() {
    this._charValueCache = {}
  }

  setup(callback) {
    callback(null)  // No error
  }

  getName() {
    return this._nobleService.name === null ? 'Unknown' : this._nobleService.name
  }

  getUUID() {
    return this._nobleService.uuid
  }

  getCharacteristics() {
    return this._characteristics
  }

  registerForNotifications(key, cb) {
    /**
     * Register to be called-back on receipt of a notification
     *
     * @param key The characteristic UUID
     * @param cb Function to be called back
     */

    this._registeredNotificationCallbacks[key].push(cb)
  }

}

module.exports = BleService
