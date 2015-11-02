'use strict'

import assert from 'assert'
import FirmwareUpdater from '../app/lightblue/oad'

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
      let fwUpdater = new FirmwareUpdater()
      fwUpdater.update(mockLightBlueDevice, ()=>{})
    })

  })
})
