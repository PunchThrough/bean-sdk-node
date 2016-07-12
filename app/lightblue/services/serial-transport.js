'use strict'


let BleService = require ('./base')
let util = require('../util/util')
const commands = require('../command-definitions')


const BLE_MAX_PACKET_LENGTH = 20
const UUID_SERVICE_SERIAL_TRANSPORT = util.normalizeUUID('a495ff10c5b14b44b5121370f02d74de', 16)



class LightBluePacket {
  constructor() {

  }

}

class SerialTransportService extends BleService {
  /**
   * Custom LightBlue Serial Transport Service
   *
   * @param characteristics
   * @param nobleService
   */

  constructor(characteristics, nobleService) {
    super(characteristics, nobleService)
  }

  getName() {
    return 'Serial Transport Service'
  }

  sendCommand(commandId, payloadArguments, completedCallback) {
    let defn = commands.definitionForCommand(commandId)
    let command = new commands.Command(commandId, defn)
    let packed = command.pack.apply(command, payloadArguments)
  }

}


module.exports = {
  init: SerialTransportService,
  UUID: UUID_SERVICE_SERIAL_TRANSPORT,
  commandIds: commands.commandIds
}
