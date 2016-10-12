'use strict'


const buffer = require('buffer')
const BleService = require('./base')
const util = require('../util/util')
const async = require('async')
const logger = require('../util/logs').logger


const UUID_SERVICE_OAD = util.normalizeUUID('F000FFC004514000B000000000000000')
const UUID_CHAR_OAD_IDENTIFY = util.normalizeUUID('F000FFC104514000B000000000000000')
const UUID_CHAR_OAD_BLOCK = util.normalizeUUID('F000FFC204514000B000000000000000')


class OADService extends BleService {
  /**
   * Custom LightBlue OAD Service
   *
   * @param characteristics
   * @param nobleService
   */

  constructor(characteristics, nobleService) {
    super(characteristics, nobleService)
  }

  _writeZerosToIdentify() {
    let zeros = new buffer.Buffer(16).fill(0)
    this._characteristics[UUID_CHAR_OAD_IDENTIFY].write(zeros, true, (err)=> {
      if (err) {
        logger.info(`Error: ${err}`)
      } else {
        logger.info('Triggered a notification on Identify char')
      }
    })
  }

  getName() {
    return 'OAD Service'
  }

  setup(setupCallback) {
    logger.info('Setting up IDENTIFY and BLOCK notifications')

    async.parallel([
      (callback)=> {
        this._setupNotification(UUID_CHAR_OAD_IDENTIFY, callback)
      },

      (callback)=> {
        this._setupNotification(UUID_CHAR_OAD_BLOCK, callback)
      }
    ], function (error, results) {
      setupCallback(error)
    })
  }

  triggerIdentifyHeaderNotification() {
    this._writeZerosToIdentify()
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
