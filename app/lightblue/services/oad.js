'use strict'


let buffer = require('buffer')
let BleService = require ('./base')
let util = require('../util/util')


const UUID_SERVICE_OAD = util.normalizeUUID('F000FFC004514000B000000000000000', 16)

const UUID_CHAR_OAD_IDENTIFY = util.normalizeUUID('F000FFC104514000B000000000000000', 16)
const UUID_CHAR_OAD_BLOCK = util.normalizeUUID('F000FFC204514000B000000000000000', 16)


class OADService extends BleService {
  /**
   * Custom LightBlue OAD Service
   *
   * @param characteristics
   * @param nobleService
   */

  constructor(characteristics, nobleService) {
    super(characteristics, nobleService)

    // Object that holds arrays of callbacks, keyed by the attribute value (UUID)
    this._registeredNotificationCallbacks = {}
    this._registeredNotificationCallbacks[UUID_CHAR_OAD_BLOCK] = []     // default empty array
    this._registeredNotificationCallbacks[UUID_CHAR_OAD_IDENTIFY] = []  // default empty array

    this._notificationsReady = false
    this._triggerIdentifyNotification = false
    this.setupNotifications()
  }

  _fireCBs(key, data) {
    for (let i in this._registeredNotificationCallbacks[key]) {
      let cb = this._registeredNotificationCallbacks[key][i]
      cb(data)
    }
  }

  _onIdentifyNotification(data) {
    this._fireCBs(UUID_CHAR_OAD_IDENTIFY, data)
  }

  _onBlockNotification(data) {
    this._fireCBs(UUID_CHAR_OAD_BLOCK, data)
  }

  _writeZerosToIdentify() {
    let zeros = new buffer.Buffer(16).fill(0)
    this._characteristics[UUID_CHAR_OAD_IDENTIFY].write(zeros, true, (err)=> {
      if (err) {
        console.log(`Error: ${err}`)
      } else {
        console.log('Triggered a notification on Identify char')
      }
    })
  }

  getName() {
    return 'OAD Service'
  }

  setupNotifications() {
    console.log('Setting up IDENTIFY and BLOCK notifications')

    // Setup notifications IDENTIFY
    this._characteristics[UUID_CHAR_OAD_IDENTIFY].notify(true, (err)=> {
      if (err) {
        console.log(err)
      } else {
        console.log('IDENTIFY notifications ready')
        this._notificationsReady = true
        if (this._triggerIdentifyNotification) {
          this._writeZerosToIdentify()
          this._triggerIdentifyNotification = false
        }
      }
    })

    this._characteristics[UUID_CHAR_OAD_IDENTIFY].on('read', (data, isNotification)=> {
      if (isNotification) this._onIdentifyNotification(data)
    })

    // Setup notifications BLOCK
    this._characteristics[UUID_CHAR_OAD_BLOCK].notify(true, (err)=> {
      if (err) {
        console.log(err)
      } else {
        console.log('BLOCK notifications ready')
      }
    })

    this._characteristics[UUID_CHAR_OAD_BLOCK].on('read', (data, isNotification)=> {
      if (isNotification) this._onBlockNotification(data)
    })
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

  triggerIdentifyHeaderNotification() {
    if (this._notificationsReady) {
      this._writeZerosToIdentify()
    } else {
      this._triggerIdentifyNotification = true
    }
  }

  writeToIdentify(buf, callback) {
    this._characteristics[UUID_CHAR_OAD_IDENTIFY].write(buf, true, callback)
  }

  writeToBlock(buf, callback) {
    this._characteristics[UUID_CHAR_OAD_BLOCK].write(buf, true, callback)
  }

}

module.exports = {
  OADService: OADService,
  UUID: UUID_SERVICE_OAD,
  characteristics: {
    IDENTIFY: UUID_CHAR_OAD_IDENTIFY,
    BLOCK: UUID_CHAR_OAD_BLOCK
  }
}
