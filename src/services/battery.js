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
    this._performCachedLookup(UUID_CHAR_BATTERY, (err, buf)=> {
      callback(err, buf.readUInt8(0))
    })
  }
}


module.exports = {
  BatteryService: BatteryService,
  UUID: UUID_SERVICE_BATTERY,
  characteristics: {
    UUID_CHAR_BATTERY: UUID_CHAR_BATTERY
  }
}
