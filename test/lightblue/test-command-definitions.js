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
      assert(packed.length === 9)
    })

  })
})
