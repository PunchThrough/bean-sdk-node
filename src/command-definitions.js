'use strict'


const binary = require('./util/binary')
const util = require('./util/util')
const buffer = require('buffer')
const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')
const logger = require('./util/logs').logger

const DEFINITIONS_FILE = path.join(__dirname, 'resources', 'command-definitions.yaml')
const MESSAGE_RESPONSE_BIT = 0x80

let _defns = null


function _loadDefinitions() {
  try {
    let commandDefs = yaml.safeLoad(fs.readFileSync(DEFINITIONS_FILE, 'utf8'))
    _defns = commandDefs
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
    case 'int16':
      binaryField = binary.Int16
      break
    case 'padded_string':
      binaryField = binary.PaddedString
      break
    case 'fixed_length_bytes':
      binaryField = binary.FixedLengthBytes
      break
    case 'variable_length_bytes':
      binaryField = binary.VariableLengthBytes
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

  static _unpackCRC(buf) {
    let crcValue = buf.readUInt16LE(buf.length - 2)
    let crcBuf = buf.slice(0, buf.length - 2)
    let calcedCrc = util.crc16(crcBuf)
    if (crcValue != calcedCrc) {
      throw new Error(`CRC Mismatch: ${crcValue} != ${calcedCrc}`)
    }
  }

  static _unpackLength(buf) {
    return buf.readUInt8(0)
  }

  static _unpackReserved(buf) {
    return buf.readUInt8(1)
  }

  static _unpackMessageId(buf) {
    let messageId = buf.readUInt16BE(2)
    return messageId & ~MESSAGE_RESPONSE_BIT
  }

  static _unpackPayload(buf, payloadLength, argDefn) {
    let argsLength = payloadLength - 2  // Subtract message ID from length
    let payloadBuf = buf.slice(4, 4 + argsLength)
    let offset = 0
    let argValues = []
    for (let fieldDefinition of argDefn) {
      let Field = _binaryField(fieldDefinition.type)
      let binaryField = Field.fromBuffer(payloadBuf, offset, fieldDefinition)
      offset += binaryField.size()
      argValues.push(binaryField.getValue())
    }
    return argValues
  }

  _packLength(payloadLength) {
    let buf = new buffer.Buffer(1)
    buf.writeUInt8(payloadLength + 2, 0)  // Length = payload + msg ID
    return buf
  }

  _packReserved() {
    let buf = new buffer.Buffer(1)
    buf.writeUInt8(0, 0)
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
    let crcValue = util.crc16(crcBuf)
    let buf = new buffer.Buffer(2)
    buf.writeUInt16LE(crcValue)
    return buf
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

  static fromBuffer(buf) {
    throw new Error("Subclasses must implement static method .fromBuffer(buf)")
  }

  pack() {
    throw new Error("Subclasses must implement method .pack()")
  }

  asObject(defn) {
    let obj = {}
    for (let idx in defn) {
      let fieldDefn = defn[idx]
      let fieldVal = this._args[idx]
      obj[fieldDefn.name] = fieldVal
    }
    return obj
  }

}


class Response extends Message {

  static fromBuffer(buf, defn) {
    let crc = this._unpackCRC(buf)
    let length = this._unpackLength(buf)
    let reserved = this._unpackReserved(buf)
    let messageId = this._unpackMessageId(buf)
    let payloadArgs = this._unpackPayload(buf, length, defn.response)
    return new Response(messageId, payloadArgs, defn)
  }

  pack() {
    throw new Error("Not Implemented!")
  }

}


class Command extends Message {

  static fromBuffer(buf, defn) {
    let crc = this._unpackCRC(buf)
    let length = this._unpackLength(buf)
    let reserved = this._unpackReserved(buf)
    let messageId = this._unpackMessageId(buf)
    let payloadArgs = this._unpackPayload(buf, length, defn.arguments)
    return new Command(messageId, payloadArgs, defn)
  }

  pack() {
    let messageId = this._packMessageId()
    let payload = this._packPayload(this._args)
    let length = this._packLength(payload.length)
    let reserved = this._packReserved()
    let crc = this._packCRC(util.concatBuffers([length, reserved, messageId, payload]))
    return util.concatBuffers([length, reserved, messageId, payload, crc])
  }

}


function definitionForCommand(cmdId) {
  if (!_defns) {
    _loadDefinitions()
  }

  if (_defns.incoming[cmdId])
    return _defns.incoming[cmdId]

  if (_defns.outgoing[cmdId])
    return _defns.outgoing[cmdId]

  throw new Error(`No definition for command ID: ${cmdId}`)
}


function definitions() {
  if (!_defns) {
    _loadDefinitions()
  }

  return _defns
}


const commandIds = {
  SERIAL_DATA:            0x0000,
  LB_PROTOCOL_ERROR:      0x0001,
  BT_SET_ADV:             0x0500,
  BT_SET_CONN:            0x0502,
  BT_SET_LOCAL_NAME:      0x0504,
  BT_SET_PIN:             0x0506,
  BT_SET_TX_PWR:          0x0508,
  BT_GET_CONFIG:          0x0510,
  BT_SET_CONFIG:          0x0511,
  BT_SET_CONFIG_NOSAVE:   0x0540,
  BT_END_GATE:            0x0550,
  BT_ADV_ONOFF:           0x0512,
  BT_SET_SCRATCH:         0x0514,
  BT_GET_SCRATCH:         0x0515,
  BT_RESTART:             0x0520,
  BL_CMD_START:           0x1000,
  BL_FW_BLOCK:            0x1001,
  BL_STATUS:              0x1002,
  BL_GET_META:            0x1003,
  CC_LED_WRITE:           0x2000,
  CC_LED_WRITE_ALL:       0x2001,
  CC_LED_READ_ALL:        0x2002,
  CC_ACCEL_READ:          0x2010,
  CC_TEMP_READ:           0x2011,
  CC_BATT_READ:           0x2015,
  CC_POWER_ARDUINO:       0x2020,
  CC_GET_AR_POWER:        0x2021,
  CC_ACCEL_GET_RANGE:     0x2030,
  CC_ACCEL_SET_RANGE:     0x2035,
  AR_SLEEP:               0x3000,
  ERROR_CC:               0x4000,
  DB_LOOPBACK:            0xFE00,
  DB_COUNTER:             0xFE01,
  DB_E2E_LOOPBACK:        0xFE02,
  DB_PTM:                 0xFE03
}


module.exports = {
  commandIds: commandIds,
  definitionForCommand: definitionForCommand,
  definitions: definitions,
  Command: Command,
  Response: Response,
  MESSAGE_RESPONSE_BIT: MESSAGE_RESPONSE_BIT
}
