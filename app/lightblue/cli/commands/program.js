'use strict'

const FirmwareUpdater = require('../../firmware-updater')
const common = require('./common')
const fs = require('fs')
const path = require('path')


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

  let sketchBuf = fs.readFileSync(hexFile)
  let sketchName = path.parse(hexFile).name

  common.connectToBean(sdk, beanName, beanUUID, (device)=> {
    sdk.uploadSketch(device, sketchBuf, sketchName, (err)=> {

    })
  }, completedCallback)

}


module.exports = {
  programFirmware: programFirmware,
  programSketch: programSketch
}
