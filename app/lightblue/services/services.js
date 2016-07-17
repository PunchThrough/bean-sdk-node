'use strict'


const util = require('../util/util')
const BleService = require('./base')
const DeviceInformationService = require('./device-information').DeviceInformationService
const OADService = require('./oad').OADService
const SerialTransportService = require('./serial-transport').SerialTransportService


function _charListToObject(charList) {
  let chars = {}
  for (let i in charList) {
    let c = charList[i]
    chars[util.normalizeUUID(c.uuid)] = c
  }
  return chars
}


function fromExistingService(existingService, nobleService) {
  /**
   * Update an existing service
   */

  existingService._characteristics = _charListToObject(nobleService.characteristics)
  existingService._nobleService = nobleService
  existingService._notificationsReady = false
  return existingService
}


function fromNobleService(nobleService) {
  /**
   * Given a noble service object, translate it into one of our BleServices
   */

  let s = null
  switch (util.normalizeUUID(nobleService.uuid)) {
    case DeviceInformationService.UUID:
      s = new DeviceInformationService(_charListToObject(nobleService.characteristics), nobleService)
      break
    case OADService.UUID:
      s = new OADService(_charListToObject(nobleService.characteristics), nobleService)
      break
    case SerialTransportService.UUID:
      s = new SerialTransportService(_charListToObject(nobleService.characteristics), nobleService)
      break
    default:
      s = new BleService([], nobleService)
      break
  }
  return s
}


module.exports = {

  fromNobleService: fromNobleService,
  fromExistingService: fromExistingService,

  DeviceInformationService: DeviceInformationService,
  OADService: OADService,
  SerialTransportService: SerialTransportService

}
