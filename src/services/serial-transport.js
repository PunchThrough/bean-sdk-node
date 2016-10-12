'use strict'


const BleService = require ('./base')
const util = require('../util/util')
const commands = require('../command-definitions')
const buffer = require('buffer')
const logger = require('../util/logs').logger


const LB_MAX_PACKET_LENGTH = 19

const UUID_SERVICE_SERIAL_TRANSPORT = util.normalizeUUID('a495ff10c5b14b44b5121370f02d74de')
const UUID_CHAR_SERIAL_TRANSPORT = util.normalizeUUID('A495FF11C5B14B44B5121370F02D74DE')


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
    return `LightBluePacket (First: ${this._first}) (Remaining: ${this._packetsRemaining})`
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
    this._commandCallbacks = {}
    this._responseCallbacks = {}
    this._sendCallbacks = {}
  }

  _packetReceived(buf) {
    let packet = LightBluePacket.fromBuffer(buf)
    this._incomingPackets.push(packet)
    logger.debug(`PACKET <<<: ${packet.toString()}`)

    if (packet.finalPacket()) {
      let packetPayloads = []
      for (let p of this._incomingPackets) {
        packetPayloads.push(p.getPayload())
      }

      let commandPayload = util.concatBuffers(packetPayloads)
      let incomingMessageId = commandPayload.readUInt16BE(2) & ~commands.MESSAGE_RESPONSE_BIT
      let incomingCommandDefn = commands.definitions().incoming[incomingMessageId]
      let outgoingCommandDefn = commands.definitions().outgoing[incomingMessageId]
      if (incomingCommandDefn) {
        this._handleIncomingCommand(commandPayload, incomingCommandDefn)
      } else if (outgoingCommandDefn) {
        this._handleIncomingResponse(commandPayload, outgoingCommandDefn)
      } else {
        logger.warn(`Couldn't find definition for command: ${incomingMessageId}`)
      }

      this._incomingPackets = []  // Clear incoming packets
    }
  }

  _handleIncomingCommand(buf, defn) {
    let command = commands.Command.fromBuffer(buf, defn)
    if (command.getMessageId() === commands.commandIds.LB_PROTOCOL_ERROR) {
      // Handle protocol errors here, nobody else should need to register for this error
      let err = command.asObject()
      logger.error(`LB PROTOCOL ERROR: expected ${err.expected_header} got ${err.received_header}`)
    } else {
      // Notify any registered callbacks of received command
      let commandCallback = this._commandCallbacks[command.getMessageId()]
      if (commandCallback) {
        commandCallback(command.asObject(command.getDefinition().arguments))
      }
    }

  }

  _handleIncomingResponse(buf, defn) {
    let response = commands.Response.fromBuffer(buf, defn)
    let callback = this._responseCallbacks[response.getMessageId()]
    if (callback) {
      callback(null, response.asObject(response.getDefinition().response))
    } else {
      logger.info(`Got serial response (${response.getMessageId()}) but no callback!`)
    }
  }

  _sendLightBluePackets(commandId) {
    let packet = this._outgoingPackets.shift()
    let packetData = packet.pack()
    logger.debug(`PACKET >>>: ${packet.toString()}`)
    this._characteristics[UUID_CHAR_SERIAL_TRANSPORT].write(packetData, true, (err)=> {
      if (err) {
        logger.error(`ERROR sending LightBlue Packet: ${err}`)
        this._sendCallbacks[commandId](err)
        this._outgoingPackets = []
      }

      if (this._outgoingPackets.length != 0) {
        this._sendLightBluePackets(commandId)
      } else {
        let cb = this._sendCallbacks[commandId]
        if (cb) {
          this._sendCallbacks[commandId] = null
          setTimeout(cb, 50, null)
        }
      }

    })
  }

  getName() {
    return 'Serial Transport Service'
  }

  setup(setupCallback) {
    logger.info('Setting up SERIAL notifications')

    this._setupNotification(UUID_CHAR_SERIAL_TRANSPORT, (err) => {
      setupCallback(err)
      this.registerForNotifications(UUID_CHAR_SERIAL_TRANSPORT, (data) => {
        this._packetReceived(data)
      })
    })

  }

  registerForCommandNotification(commandId, callback) {
    this._commandCallbacks[commandId] = callback
  }

  sendCommand(commandId, payloadArguments, sendCallback, responseCallback) {
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
    this._packetCount = (this._packetCount + 1) % 4

    for (let i = 0; i < numPackets; i++) {
      let offset = i * LB_MAX_PACKET_LENGTH
      let packetPayload = commandPayload.slice(offset, offset + LB_MAX_PACKET_LENGTH)

      let first = false
      if (i == 0)
        first = true

      let packet = new LightBluePacket(first, this._packetCount, numPackets - (i + 1), packetPayload)
      this._outgoingPackets.push(packet)
    }

    if (sendCallback) {
      this._sendCallbacks[commandId] = sendCallback
    }

    if (responseCallback) {
        this._responseCallbacks[commandId] = responseCallback
    }

    this._sendLightBluePackets(commandId)
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
