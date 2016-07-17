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

  write (buf) {
    this._writes.push(buf)
  }

  read () {

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

    it('CC_LED_WRITE_ALL', ()=> {
      let completedCallback = sinon.spy()
      transportService.sendCommand(commandIds.CC_LED_WRITE_ALL, [1, 2, 3], completedCallback)
      let writes = mockNobleCharacteristic.getWrites()
      assert.equal(writes.length, 1)
      let value = writes[0]
      assert.equal(value.length, 10)
      assert.equal(value[0], 160)  // packet header
    })

  })
})
