'use strict'


const binary = require('./util/binary')
const buffer = require('buffer')
const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')
const crc = require('crc')

const DEFINITIONS_FILE = path.join(__dirname, '..', 'resources', 'command-definitions.yaml')


let _defns = null


function _loadDefinitions() {
  try {
    let rawDefs = yaml.safeLoad(fs.readFileSync(DEFINITIONS_FILE, 'utf8'))
    _defns = rawDefs.commands
  } catch (e) {
    console.log(`Failed to load definitions: ${e}`)
  }
}


function _binaryHelperForType(type) {

  let binaryHelper = null

  switch (type) {
    case 'uint8':
      binaryHelper = binary.UInt8
      break
    case 'uint16':
      binaryHelper = binary.UInt16
      break
    default:
      console.log(`No binary type found: ${type}`)
  }

  return binaryHelper

}


class Command {
  /**
   * Represents a LightBlue Serial Transport command
   *
   * Defined as:
   *
   *    [1 byte]       - Length
   *    [1 byte]       - Reserved
   *    [2 byte]       - Message ID
   *    [0-64 bytes]   - Payload
   *    [2 bytes]      - CRC
   *
   * @param messageId
   * @param definition
   */

  constructor(messageId, definition) {
    this._msgId = messageId
    this._definition = definition
  }

  _calculatePayloadSize() {
    let payloadSize = 0
    for (var argDefn of this._definition.arguments) {
      let BinaryArgument = _binaryHelperForType(argDefn.type)
      payloadSize += BinaryArgument.size()
    }
    return payloadSize
  }

  _calculateCRC(data) {
    let bufCopy = new buffer.Buffer(data.length - 2)  // 2 is length of CRC
    data.copy(bufCopy, 0, 0, data.length - 2)
    return crc.crc16ccitt(bufCopy)
  }

  pack(...args) {
    let length = 1 + 1 + 2 + this._calculatePayloadSize() + 2
    let packed = new buffer.Buffer(length)

    // Pack length
    packed.writeUInt8(length, 0)

    // Pack reserved
    packed.writeUInt8(0, 1)

    // Pack message ID
    packed.writeUInt16LE(this._msgId, 2)

    // Pack payload
    let offset = 4
    for (var index in args) {
      let argDefn = this._definition.arguments[index]
      let rawArg = args[index]
      let BinaryArgument = _binaryHelperForType(argDefn.type)
      BinaryArgument.pack(packed, rawArg, offset)
      offset += BinaryArgument.size()
    }

    // Pack CRC
    packed.writeUInt16LE(this._calculateCRC(packed), offset)

    return packed
  }

  unpack(buf) {

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
  Command: Command
}