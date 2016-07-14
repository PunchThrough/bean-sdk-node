'use strict'

let assert = require('assert')
let devices = require('../../app/lightblue/devices')
const SerialTransportService = require('../../app/lightblue/services/serial-transport')


class MockSerialTransportService extends SerialTransportService.init {
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

    it('create BLE Device', ()=> {
      let d = devices.fromNoblePeripheral(mockBlePeripheral)
      assert.equal(d.getType(), devices.DEVICE_TYPE_BLE)
    })

    it('create LightBlue Device', ()=> {
      let d = devices.fromNoblePeripheral(mockLightBluePeripheral)
      assert.equal(d.getType(), devices.DEVICE_TYPE_LIGHT_BLUE)
    })

    it('setLed', ()=> {
      let d = devices.fromNoblePeripheral(mockLightBluePeripheral)
    })

  })
})
