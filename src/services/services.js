'use strict'


const util = require('../util/util')
const BleService = require('./base')
const deviceInformation = require('./device-information')
const oad = require('./oad')
const serialTransport = require('./serial-transport')
const battery = require('./battery')
const scratch = require('./scratch')


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
    case deviceInformation.UUID:
      s = new deviceInformation.DeviceInformationService(_charListToObject(nobleService.characteristics), nobleService)
      break
    case oad.UUID:
      s = new oad.OADService(_charListToObject(nobleService.characteristics), nobleService)
      break
    case serialTransport.UUID:
      s = new serialTransport.SerialTransportService(_charListToObject(nobleService.characteristics), nobleService)
      break
    case battery.UUID:
      s = new battery.BatteryService(_charListToObject(nobleService.characteristics), nobleService)
      break
    case scratch.UUID:
      s = new scratch.ScratchService(_charListToObject(nobleService.characteristics), nobleService)
      break
    default:
      s = new BleService(nobleService.characteristics, nobleService)
      break
  }
  return s
}


module.exports = {

  fromNobleService: fromNobleService,
  fromExistingService: fromExistingService,

  serialTransport: serialTransport,
  oad: oad,
  deviceInformation: deviceInformation,
  battery: battery,
  scratch: scratch

}
