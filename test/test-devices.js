'use strict'

let assert = require('assert')
let devices = require('../src/devices')
const SerialTransportService = require('../src/services/serial-transport').SerialTransportService


class MockSerialTransportService extends SerialTransportService {
  constructor(characteristics, nobleService) {
    super(characteristics, nobleService)
  }
}

let mockBlePeripheral = {
  uuid: 'ble-uuid',
  advertisement: {
    localName: 'ble',
    serviceUuids: []
  }
}


let mockLightBluePeripheral = {
  uuid: 'lightblue-uuid',
  advertisement: {
    localName: 'lightblue',
    serviceUuids: [
      'a495ff10c5b14b44b5121370f02d74de'  // Bean GATT Serial Service
    ]
  },

  // Methods
  getSerialTransportService: ()=> {
    return new MockSerialTransportService(null, null)
  }
}



describe('LightBlue Devices', ()=> {
  describe('fromNoblePeripheral', ()=> {

  })
})
