'use strict'

class FirmwareUpdater{
  constructor(device) {
    this._device = device
  }

  start(finishedCb) {
    console.log(`Updating firmware for LightBlue device: ${this._device.getName()}`)
  }
}

module.exports = FirmwareUpdater
