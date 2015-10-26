'use strict'

import services from './services'


class FirmwareUpdater{
  constructor(device) {
    this._device = device
  }

  start(finishedCb) {
    console.log(`Updating firmware for LightBlue device: ${this._device.getName()}`)
    this._device.setAutoReconnect(true)
    let oad = this._device.getOADService()
    oad.registerForNotifications(services.UUID_CHAR_OAD_IDENTIFY, (data)=> {
      console.log(data)
    })
    oad.triggerIdentifyHeaderNotification()
  }
}


class FirmwareUpdateProcess {

}

module.exports = FirmwareUpdater
