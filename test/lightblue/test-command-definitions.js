'use strict'

const assert = require('assert')
const commands = require('../../app/lightblue/command-definitions')


describe('Serial Transport Command Definitions', ()=> {
  describe('LED_WRITE_ALL', ()=> {

    it('should pack', ()=> {
      let cmdId = commands.commandIds.CC_LED_WRITE_ALL
      let defn = commands.definitionForCommand(cmdId)
      let command = new commands.Command(cmdId, defn)

      let red = 20
      let green = 30
      let blue = 40
      let packed = command.pack(red, green, blue)
      assert.equal(packed.length, 9)
      assert(packed.length === 9)
      assert.equal(packed[0], 5)       // length
      assert.equal(packed[1], 0)       // reserved
      assert.equal(packed[2], 32)      // command ID (MSB) - Command ID big endian
      assert.equal(packed[3], 1)       // command ID (LSB)
      assert.equal(packed[4], red)     // payload
      assert.equal(packed[5], green)   // payload
      assert.equal(packed[6], blue)    // payload
      assert.equal(packed[7], 220)     // CRC (LSB) - CRC little endian
      assert.equal(packed[8], 236)     // CRC (MSB)
    })

  })
})
