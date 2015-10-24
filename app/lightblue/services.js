'use strict'

import util from './util'

// Services
const UUID_DEVICE_INFORMATION = 0x180A
const UUID_OAD = 0x0000

function fromNobleService(nobleService) {
  if (util.normalizeUUID(nobleService.uuid) === UUID_DEVICE_INFORMATION) {

    // Convert chars from array to object
    let chars = {}
    for (let i in nobleService.characteristics) {
      let c = nobleService.characteristics[i]
      chars[c.uuid] = c
    }

    return new DeviceInformationService(chars, nobleService)

  } else {

    return 'Service Not Yet Supported'
  }
}

class BleService {
  /**
   * Base class for all BLE services
   */

  constructor(characteristics, nobleService) {
    this._characteristics = characteristics
    this._nobleService = nobleService
  }

}

class DeviceInformationService extends BleService {
  /**
   * Standard Device Information service for BLE devices
   */

  //const CHARACTERISTICS_MAP = {
  //  UUID_FIRMWARE_VERSION: 0x2A26,
  //  UUID_SOFTWARE_VERSION: 0x2A28,
  //  UUID_HARDWARE_VERSION: 0x2A27,
  //  UUID_MFG_NAME: 0x2A29,
  //  UUID_MODEL_NUMBER: 0x2A24
  //}

  //const UUID_DIS_CHARACTERISTIC_FIRMWARE_VERSION = 0x2A26
  //const UUID_DIS_CHARACTERISTIC_SOFTWARE_VERSION = 0x2A28
  //const UUID_DIS_CHARACTERISTIC_HARDWARE_VERSION = 0x2A27
  //const UUID_DIS_CHARACTERISTIC_MFG_NAME = 0x2A29
  //const UUID_DIS_CHARACTERISTIC_MODEL_NUMBER = 0x2A24


  getManufacturerName() {
    return 1
  }

  getModelNumber() {
    return 2
  }

  getHardwareVersion() {
    return 3
  }

  getFirmwareVersion() {
    return 4
  }

  getSoftwareVersion() {
    return 5
  }

  serialize() {
    return {
      mfg_name: this.getManufacturerName(),
      model_number: this.getModelNumber(),
      hardware_version: this.getHardwareVersion(),
      firmware_version: this.getFirmwareVersion(),
      software_version: this.getSoftwareVersion()
    }
  }

}

module.exports = {
  fromNobleService: fromNobleService,
  UUID_DEVICE_INFORMATION: UUID_DEVICE_INFORMATION
}
