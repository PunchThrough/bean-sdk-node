'use strict'

const assert = require('assert')
const buffer = require('buffer')
const sinon = require('sinon')

const chars = require('../../../app/lightblue/services/serial-transport').characteristics
const commandIds = require('../../../app/lightblue/services/serial-transport').commandIds
const SerialTransportService = require('../../../app/lightblue/services/serial-transport').SerialTransportService


class MockNobleCharacteristic {
  constructor () {
    this._writes = []
  }

  getWrites() {
    return this._writes
  }

  write (buf, withoutResponse, callback) {
    this._writes.push(buf)
    callback(false)
  }

  read () {

  }

}


describe('Serial Transport Service', ()=> {
  describe('packets', ()=> {

    let transportService
    let mockNobleCharacteristic

    beforeEach(()=> {
      mockNobleCharacteristic = new MockNobleCharacteristic()
      let mockChars = {}
      mockChars[chars.UUID_CHAR_SERIAL_TRANSPORT] = mockNobleCharacteristic
      transportService = new SerialTransportService(mockChars, null)
    })

    it('CC_LED_WRITE_ALL', ()=> {
      let completedCallback = sinon.spy()
      transportService.sendCommand(commandIds.CC_LED_WRITE_ALL, [1, 2, 3], completedCallback)
      let writes = mockNobleCharacteristic.getWrites()
      assert.equal(writes.length, 1)
      let packet = writes[0]
      assert.equal(packet.length, 10)
    })

    it('BT_SET_CONFIG', ()=> {
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

  })
})
