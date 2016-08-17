'use strict'

const assert = require('assert')
const commands = require('../../src/command-definitions')


describe('Serial Transport Command Definitions', ()=> {
  describe('LED_WRITE_ALL', ()=> {

    it('should pack', ()=> {
      let cmdId = commands.commandIds.CC_LED_WRITE_ALL
      let defn = commands.definitionForCommand(cmdId)
      let red = 20
      let green = 30
      let blue = 40
      let args = [red, green, blue]
      let command = new commands.Command(cmdId, args, defn)
      let packed = command.pack()
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

  describe('BT_SET_CONFIG', ()=> {

    it('should pack', ()=> {
      let cmdId = commands.commandIds.BT_SET_CONFIG
      let defn = commands.definitionForCommand(cmdId)
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
      let command = new commands.Command(cmdId, args, defn)
      let packed = command.pack()
      assert.equal(packed.length, 39)

      // Header
      assert.equal(packed[0], 35)       // length
      assert.equal(packed[1], 0)        // reserved
      assert.equal(packed[2], 5)        // command ID (MSB)
      assert.equal(packed[3], 17)       // command ID (LSB)

      // Payload
      assert.equal(packed[4], 20)       // adv interval (LSB)
      assert.equal(packed[5], 0)        // adv interval (MSB)
      assert.equal(packed[6], 30)       // connection interval (LSB)
      assert.equal(packed[7], 0)        // connection interval (MSB)
      assert.equal(packed[8], 16)       // tx power
      assert.equal(packed[9], 0)        // advertising mode
      assert.equal(packed[10],  244)    // iBeacon UUID (LSB)
      assert.equal(packed[11], 1)       // iBeacon UUID (MSB)
      assert.equal(packed[12], 20)      // iBeacon major ID (LSB)
      assert.equal(packed[13], 0)       // iBeacon major ID (MSB)
      assert.equal(packed[14], 40)      // iBeacon minor ID (LSB)
      assert.equal(packed[15], 0)       // iBeacon minor ID (MSB)
      assert.equal(String.fromCharCode(packed[16]), 'f')
      assert.equal(String.fromCharCode(packed[17]), 'o')
      assert.equal(String.fromCharCode(packed[18]), 'o')
      assert.equal(String.fromCharCode(packed[19]), 'b')
      assert.equal(String.fromCharCode(packed[20]), 'a')
      assert.equal(String.fromCharCode(packed[21]), 'r')
      assert.equal(String.fromCharCode(packed[22]), 'b')
      assert.equal(String.fromCharCode(packed[23]), 'a')
      assert.equal(String.fromCharCode(packed[24]), 'z')

      assert.equal(packed[packed.length - 3], 9)  // Length
    })
  })

  describe('CC_ACCEL_READ', ()=> {
    it('should pack', ()=> {
      let cmdId = commands.commandIds.CC_ACCEL_READ
      let defn = commands.definitionForCommand(cmdId)
      let command = new commands.Command(cmdId, [], defn)
      let packed = command.pack()
      assert.equal(packed[0], 2)        // length
      assert.equal(packed[1], 0)        // reserved
      assert.equal(packed[2], 32)       // command ID (MSB) - Command ID big endian
      assert.equal(packed[3], 16)       // command ID (LSB)
      assert.equal(packed[4], 127)       // CRC (LSB)
      assert.equal(packed[5], 125)       // CRC (MSB)

    })
  })

})
