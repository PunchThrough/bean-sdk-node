'use strict'


const binary = require('./util/binary')
const util = require('./util/util')
const buffer = require('buffer')
const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')
const crc = require('crc')
const logger = require('./util/logs').logger

const DEFINITIONS_FILE = path.join(__dirname, '..', 'resources', 'command-definitions.yaml')
const MESSAGE_RESPONSE_BIT = 0x80

let _defns = null


function _loadDefinitions() {
  try {
    let rawDefs = yaml.safeLoad(fs.readFileSync(DEFINITIONS_FILE, 'utf8'))
    _defns = rawDefs.commands
  } catch (e) {
    logger.info(`Failed to load definitions: ${e}`)
  }
}


function _binaryField(type) {

  let binaryField = null

  switch (type) {
    case 'uint8':
      binaryField = binary.UInt8
      break
    case 'uint16':
      binaryField = binary.UInt16
      break
    case 'uint32':
      binaryField = binary.UInt32
      break
    case 'string':
      binaryField = binary.VariableLengthString
      break
    default:
      logger.info(`No binary type found: ${type}`)
  }

  return binaryField

}


class Message {

  /**
   * Represents a LightBlue Serial Transport Message
   *
   * Defined as:
   *
   *    [1 byte]         - Length     (Message ID + Payload)
   *    [1 byte]         - Reserved
   *    [2 byte]      BE - Message ID
   *    [0-64 bytes]  LE - Payload
   *    [2 bytes]     LE - CRC        (Everything before CRC)
   *
   * @param messageId
   * @param definition
   */

  constructor(messageId, args, definition) {
    this._msgId = messageId
    this._args = args
    this._definition = definition
  }

  getMessageId() {
    return this._msgId
  }

  getArguments() {
    return this._args
  }

  getDefinition() {
    return this._definition
  }

}


class Response extends Message {

  static fromBuffer(buf) {
    let crcValue = buf.readUInt16LE(buf.length - 2)
    let crcBuf = buf.slice(0, buf.length - 2)
    let calcedCrc = crc.crc16ccitt(crcBuf)
    if (crcValue != calcedCrc) {
      throw new Error(`CRC Mismatch: ${crcValue} != ${calcedCrc}`)
    }
    let length = buf.readUInt8(0)
    let reserved = buf.readUInt8(1)
    let responseMessageId = buf.readUInt16BE(2)
    if (!(responseMessageId & MESSAGE_RESPONSE_BIT)) {
      throw new Error(`Response bit not set: ${responseMessageId}`)
    }
    let messageId = responseMessageId & ~MESSAGE_RESPONSE_BIT
    let defn = definitionForCommand(messageId)
    let payloadLength = length - 2  // Subtract message ID from length
    let payloadBuf = buf.slice(4, 4 + payloadLength)
    let offset = 0
    let argValues = []
    for (let fieldDefinition of defn.response) {
      let Field = _binaryField(fieldDefinition.type)
      let binaryField = Field.fromBuffer(payloadBuf, offset, fieldDefinition)
      offset += binaryField.size()
      argValues.push(binaryField.getValue())
    }

    return new Response(messageId, argValues, defn)
  }

  asObject() {
    let obj = {}
    for (let idx in this._definition.response) {
      let fieldDefn = this._definition.response[idx]
      let fieldVal = this._args[idx]
      obj[fieldDefn.name] = fieldVal
    }
    return obj
  }

}


class Command extends Message {

  _packLengthAndReserved(payloadLength) {
    let buf = new buffer.Buffer(2)
    buf.writeUInt8(payloadLength + 2, 0)  // Length = payload + msg ID
    buf.writeUInt8(0, 1)
    return buf
  }

  _packMessageId() {
    let buf = new buffer.Buffer(2)
    buf.writeUInt16BE(this._msgId)
    return buf
  }

  _packPayload(args) {
    let packedArgs = []
    let totalLength = 0
    for (let index in args) {
      let fieldDefinition = this._definition.arguments[index]
      let value = args[index]
      let Field = _binaryField(fieldDefinition.type)
      let binaryField = new Field(value, fieldDefinition)
      packedArgs.push(binaryField.pack())
      totalLength += binaryField.size()
    }
    return buffer.Buffer.concat(packedArgs, totalLength)
  }

  _packCRC(crcBuf) {
    let crcValue = crc.crc16ccitt(crcBuf)
    let buf = new buffer.Buffer(2)
    buf.writeUInt16LE(crcValue)
    return buf
  }

  pack() {
    let messageId = this._packMessageId()
    let payload = this._packPayload(this._args)
    let lengthAndReserved = this._packLengthAndReserved(payload.length)
    let crc = this._packCRC(util.concatBuffers([lengthAndReserved, messageId, payload]))
    return util.concatBuffers([lengthAndReserved, messageId, payload, crc])
  }

}


function definitionForCommand(cmdId) {
  if (!_defns) {
    _loadDefinitions()
  }

  return _defns[cmdId]
}


const commandIds = {
  SERIAL_DATA: 0x0000,
  BT_SET_ADV: 0x0500,
  BT_SET_CONN: 0x0502,
  BT_SET_LOCAL_NAME: 0x0504,
  BT_SET_PIN: 0x0506,
  BT_SET_TX_PWR: 0x0508,
  BT_GET_CONFIG: 0x0510,
  BT_SET_CONFIG: 0x0511,
  BT_SET_CONFIG_NOSAVE: 0x0540,
  BT_END_GATE: 0x0550,
  BT_ADV_ONOFF: 0x0512,
  BT_SET_SCRATCH: 0x0514,
  BT_GET_SCRATCH: 0x0515,
  BT_RESTART: 0x0520,
  BL_CMD_START: 0x1000,
  BL_FW_BLOCK: 0x1001,
  BL_STATUS: 0x1002,
  BL_GET_META: 0x1003,
  CC_LED_WRITE: 0x2000,
  CC_LED_WRITE_ALL: 0x2001,
  CC_LED_READ_ALL: 0x2002,
  CC_ACCEL_READ: 0x2010,
  CC_TEMP_READ: 0x2011,
  CC_BATT_READ: 0x2015,
  CC_POWER_ARDUINO: 0x2020,
  CC_GET_AR_POWER: 0x2021,
  CC_ACCEL_GET_RANGE: 0x2030,
  CC_ACCEL_SET_RANGE: 0x2035,
  AR_SLEEP: 0x3000,
  ERROR_CC: 0x4000,
  DB_LOOPBACK: 0xFE00,
  DB_COUNTER: 0xFE01,
  DB_E2E_LOOPBACK: 0xFE02,
  DB_PTM: 0xFE03
}


module.exports = {
  commandIds: commandIds,
  definitionForCommand: definitionForCommand,
  Command: Command,
  Response: Response
}