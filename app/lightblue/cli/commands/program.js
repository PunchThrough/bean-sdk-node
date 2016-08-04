'use strict'

const FirmwareUpdater = require('../../firmware-updater')
const common = require('./common')
const fs = require('fs')
const path = require('path')


function programFirmware(sdk, beanName, beanUUID, completedCallback) {
  console.log(`Programming Bean ${beanName}`)

  common.connectToBean(sdk, beanName, beanUUID, (device)=> {

    console.log(`Programming device ${device.getAddress()} with firmware version ${FirmwareUpdater.bakedFirmwareVersion()}`)
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
