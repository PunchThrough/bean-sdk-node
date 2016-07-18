'use strict'


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
  }

  resetCache() {
    this._charValueCache = {}
  }

  setup(complete) {
    complete(null)
  }

  getName() {
    return this._nobleService.name === null ? 'Unknown' : this._nobleService.name
  }

  getUUID() {
    return this._nobleService.uuid
  }

}

module.exports = BleService
