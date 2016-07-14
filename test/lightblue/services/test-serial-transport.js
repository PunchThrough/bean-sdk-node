'use strict'

const assert = require('assert')
const buffer = require('buffer')
const LightBluePacket = require('../../../app/lightblue/services/serial-transport').LightBluePacket


describe('LightBlue Packet', ()=> {
  describe('should pack', ()=> {

    it('first packet', ()=> {
      let payload = new buffer.Buffer('010203', 'hex')
      let lbPacket = new LightBluePacket(true, 0, 0, payload)
      let packed = lbPacket.pack()
      assert.equal(packed[0], 128)
      assert.equal(packed[1], 1)
      assert.equal(packed[2], 2)
      assert.equal(packed[3], 3)
    })

  })
})
