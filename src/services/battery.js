'use strict'


const BleService = require ('./base')
const logger = require('../util/logs').logger


const UUID_SERVICE_BATTERY = 0x180F
const UUID_CHAR_BATTERY = 0x2A19


/**
 * Standard BLE Battery Service
 */
class BatteryService extends BleService {

  getVoltage(callback) {
    this._performCachedLookup(UUID_CHAR_BATTERY, callback)
  }
}


module.exports = {
  DeviceInformationService: DeviceInformationService,
  UUID: UUID_SERVICE_DEVICE_INFORMATION
}
