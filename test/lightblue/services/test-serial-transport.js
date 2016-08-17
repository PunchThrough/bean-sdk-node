'use strict'

const assert = require('assert')
const buffer = require('buffer')
const sinon = require('sinon')

const chars = require('../../../src/services/serial-transport').characteristics
const commandIds = require('../../../src/services/serial-transport').commandIds
const SerialTransportService = require('../../../src/services/serial-transport').SerialTransportService


class MockNobleCharacteristic {
  constructor() {
    this._writes = []
  }

  getWrites() {
    return this._writes
  }

  write(buf, withoutResponse, callback) {
    this._writes.push(buf)
    callback(false)
  }

  read() {

  }

}


describe('Serial Transport Service', ()=> {
  describe('commands', ()=> {

    let transportService
    let mockNobleCharacteristic

    beforeEach(()=> {
      mockNobleCharacteristic = new MockNobleCharacteristic()
      let mockChars = {}
      mockChars[chars.UUID_CHAR_SERIAL_TRANSPORT] = mockNobleCharacteristic
      transportService = new SerialTransportService(mockChars, null)
    })

    it('CC_LED_WRITE_ALL command', ()=> {
      let completedCallback = sinon.spy()
      transportService.sendCommand(commandIds.CC_LED_WRITE_ALL, [1, 2, 3], completedCallback)
      let writes = mockNobleCharacteristic.getWrites()
      assert.equal(writes.length, 1)
      let packet = writes[0]
      assert.equal(packet.length, 10)
    })

    it('BT_SET_CONFIG command', ()=> {
      let completedCallback = sinon.spy()
      let args = [
        20,            // adv interval
        30,            // connection interval
        16,            // tx power
        0,             // advertising mode
        500,           // iBeacon UUID
        20,            // iBeacon major ID
        40,            // iBeacon minor ID
        "foobarbaz",   // local name
        9,             // local name length
      ]
      transportService.sendCommand(commandIds.BT_SET_CONFIG, args, completedCallback)
      let writes = mockNobleCharacteristic.getWrites()
      assert.equal(writes.length, 3)
    })

    it('CC_READ_ACCEL response', ()=> {
      let responseRaw = new buffer.Buffer(14)
      responseRaw[0] = 160
      responseRaw[0] = 9
      responseRaw[0] = 0
      responseRaw[0] = 32
      responseRaw[0] = 144
      responseRaw[0] = 96
      responseRaw[0] = 255
      responseRaw[0] = 2
      responseRaw[0] = 0
      responseRaw[0] = 186
      responseRaw[0] = 0
      responseRaw[0] = 2
      responseRaw[0] = 91
      responseRaw[0] = 115
      transportService._packetReceived(responseRaw)
    })

  })
})
