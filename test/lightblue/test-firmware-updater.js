'use strict'

let assert = require('assert')
let FirmwareUpdater = require('../../app/lightblue/firmware-updater')


let mockOADService = {
  registerForNotifications: (key, cb)=> {

  }
}


let mockLightBlueDevice = {
  getName: ()=> {return 'foo'},
  setAutoReconnect: (reconnect)=> {},
  getOADService: ()=> {
    return mockOADService
  }
}


describe('OAD', ()=> {
  describe('FirmwareUpdater', ()=> {

    it('should work', ()=> {
      let fwUpdater = new FirmwareUpdater.init()
      //fwUpdater.update(mockLightBlueDevice, ()=>{})
    })

  })
})
