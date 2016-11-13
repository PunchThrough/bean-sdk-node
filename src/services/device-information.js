'use strict'


const BleService = require ('./base')
const util = require('../util/util')

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

}


module.exports = {
  DeviceInformationService: DeviceInformationService,
  UUID: UUID_SERVICE_DEVICE_INFORMATION
}
