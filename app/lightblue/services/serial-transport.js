'use strict'


let BleService = require ('./base')
let util = require('../util')


const UUID_SERVICE_SERIAL_TRANSPORT = util.normalizeUUID('a495ff10c5b14b44b5121370f02d74de', 16)


class SerialTransportService extends BleService {
  /**
   * Custom LightBlue Serial Transport Service
   *
   * @param characteristics
   * @param nobleService
   */

  constructor(characteristics, nobleService) {
    super(characteristics, nobleService)
    let x = 3
  }

}

module.exports = {
  init: SerialTransportService,
  UUID: UUID_SERVICE_SERIAL_TRANSPORT
}
