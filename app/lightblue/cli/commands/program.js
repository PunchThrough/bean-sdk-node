'use strict'

const FirmwareUpdater = require('../../firmware-updater')
const common = require('./common')
const buffer = require('buffer')
const fs = require('fs')


function programFirmware(sdk, beanName, beanUUID, completedCallback) {
  console.log('Programming Bean (%s) with firmware (%s).', beanName, FirmwareUpdater.bakedFirmwareVersion())

  common.connectToBean(sdk, beanName, beanUUID, (device)=> {
    sdk.updateFirmware(device, (err)=> {

      if (err) {
        completedCallback(`FW update failed: ${err}`)
      } else {
        completedCallback(null)
      }

    })
  }, completedCallback)
}


function programSketch(sdk, hexFile, beanName, beanUUID, completedCallback) {

  common.connectToBean(sdk, beanName, beanUUID, (device)=> {
    sdk.uploadSketch(device, fs.readFileSync(hexFile), (err)=> {

    })
  }, completedCallback)

}


module.exports = {
  programFirmware: programFirmware,
  programSketch: programSketch
}
