'use strict'


const BleService = require ('./base')
const util = require('../util/util')
const async = require('async')
const logger = require('../util/logs').logger

const UUID_SERVICE_DEVICE_INFORMATION = util.normalizeUUID('180A');

const UUID_CHAR_SOFTWARE_VERSION = util.normalizeUUID('2A28');
const UUID_CHAR_FIRMWARE_VERSION = util.normalizeUUID('2A26');
const UUID_CHAR_HARDWARE_VERSION = util.normalizeUUID('2A27');
const UUID_CHAR_MFG_NAME = util.normalizeUUID('2A29');
const UUID_CHAR_MODEL_NUMBER = util.normalizeUUID('2A24');


/**
 * Standard BLE Device Information Service
 */
class DeviceInformationService extends BleService {

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
        logger.info(err)
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
    })
  }

}


module.exports = {
  DeviceInformationService: DeviceInformationService,
  UUID: UUID_SERVICE_DEVICE_INFORMATION
}
