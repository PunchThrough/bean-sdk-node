'use strict'


const BleService = require ('./base')
const util = require('../util/util')
const commands = require('../command-definitions')
const buffer = require('buffer')
const logger = require('../util/logs').logger


const LB_MAX_PACKET_LENGTH = 19

const UUID_SERVICE_SERIAL_TRANSPORT = util.normalizeUUID('a495ff10c5b14b44b5121370f02d74de', 16)
const UUID_CHAR_SERIAL_TRANSPORT = util.normalizeUUID('A495FF11C5B14B44B5121370F02D74DE', 16)


class LightBluePacket {

  static fromBuffer(buf) {
    let firstPacket = (buf[0] & 0x80) == 0x80;
    let packetCount = (((buf[0] & 0x60) >> 5));
    let packetsRemaining = (buf[0] & 0x1f);
    let payload = buf.slice(1, buf.length);
    return new LightBluePacket(firstPacket, packetCount, packetsRemaining, payload)
  }

  constructor(first, packetCount, packetsRemaining, payload) {
    if (payload.length > 19) {
      logger.info("Payload length cannot be greater than 19")
    }
    this._first = first
    this._packetCount = packetCount
    this._packetsRemaining = packetsRemaining
    this._payload = payload
  }

  toString() {
    let out = `LightBluePacket:\n`
    out += `    First: ${this._first}\n`
    out += `    Remaining: ${this._packetsRemaining}\n`
    out += `    Payload:${this._payload}\n`
    return out
  }

  pack() {
    let headerBuf = new buffer.Buffer(1)
    let header = (this._first ? 0x80 : 0) | ((this._packetCount << 5) & 0x60) | ((this._packetsRemaining & 0x1f))
    headerBuf.writeUInt8(header, 0)
    return buffer.Buffer.concat([headerBuf, this._payload], headerBuf.length + this._payload.length)
  }

  getPayload() {
    return this._payload
  }

  finalPacket() {
    return this._packetsRemaining == 0
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

    this._packetCount = 0
    this._outgoingPackets = []
    this._incomingPackets = []
    this._callbacks = {}
  }

  _packetReceived(buf) {
    let packet = LightBluePacket.fromBuffer(buf)
    this._incomingPackets.push(packet)
    logger.info(`Received LightBlue packet: ${packet.toString()}`)

    if (packet.finalPacket()) {
      let packetPayloads = []
      for (let p of this._incomingPackets) {
        packetPayloads.push(p.getPayload())
      }
      this._handleResponse(util.concatBuffers(packetPayloads))
      this._incomingPackets = []  // Clear incoming packets
    }
  }

  _sendLightBluePackets() {
    let packet = this._outgoingPackets.shift()
    let packed = packet.pack()
    logger.info(`Sending LightBlue Packet: ${packed.toString()}`)
    this._characteristics[UUID_CHAR_SERIAL_TRANSPORT].write(packed, true, (err)=> {
      if (err) {
        logger.info(`Error sending LightBlue Packet: ${err}`)
      }

      if (this._outgoingPackets.length == 0) {
        logger.info('Last LightBlue packet sent!')
      } else {
        this._sendLightBluePackets()
      }
    })
  }

  _handleResponse(buf) {
    let response = commands.Response.fromBuffer(buf)
    let callback = this._callbacks[response.getMessageId()]
    if (callback){
      callback.apply(callback, response.getArguments())
    } else {
      logger.info(`Got serial response (${response.getMessageId()}) but no callback!`)
    }
  }

  getName() {
    return 'Serial Transport Service'
  }

  setup(setupCallback) {
    logger.info('Setting up IDENTIFY and BLOCK notifications')

    this._characteristics[UUID_CHAR_SERIAL_TRANSPORT].notify(true, (err)=> {
      if (err) {
        logger.info(err)
      } else {
        logger.info('Serial Transport notifications ready')
      }

      setupCallback(err)
    })

    this._characteristics[UUID_CHAR_SERIAL_TRANSPORT].on('read', (data, isNotification)=> {
      if (isNotification) this._packetReceived(data)
    })

  }

  sendCommand(commandId, payloadArguments, responseCallback) {
    /**
     * Send a LightBlue Command
     *
     * @param commandId int command ID
     * @param payloadArguments list of command arguments
     * @param completedCallback function called back when command is sent
     */

    // Pack the binary command
    let defn = commands.definitionForCommand(commandId)
    let command = new commands.Command(commandId, payloadArguments, defn)
    let commandPayload = command.pack()

    // Split the command into 1 or more LightBlue packets and queue them
    let numPackets = Math.ceil(commandPayload.length / LB_MAX_PACKET_LENGTH)
    for (let i = 0; i < numPackets; i++) {
      let offset = i * LB_MAX_PACKET_LENGTH
      let packetPayload = commandPayload.slice(offset, offset + LB_MAX_PACKET_LENGTH)

      let first = false
      if (i == 0)
        first = true

      this._packetCount = (this._packetCount + 1) % 4
      let packet = new LightBluePacket(first, this._packetCount, numPackets - (i + 1), packetPayload)
      this._outgoingPackets.push(packet)
    }

    this._sendLightBluePackets()

    if (responseCallback) {
        this._callbacks[commandId] = responseCallback
    }
  }

}


module.exports = {
  SerialTransportService: SerialTransportService,
  UUID: UUID_SERVICE_SERIAL_TRANSPORT,
  characteristics: {
    UUID_CHAR_SERIAL_TRANSPORT: UUID_CHAR_SERIAL_TRANSPORT
  },
  commandIds: commands.commandIds,
}
