'use strict'


const FirmwareUpdater = require('../../firmware-updater')
const intelhex = require('../../util/intelhex')
const common = require('./common')
const fs = require('fs')
const path = require('path')
const platform = require("../../util/platform")


const COMPILED_SKETCH_LOCATION = path.join(platform.userHome(), '.beansketches')


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

  let asciiData = fs.readFileSync(hexFile, 'ascii')
  let intelHex = new intelhex.IntelHexFile(asciiData)
  let binary = intelHex.parse()
  let sketchName = path.parse(hexFile).name

  common.connectToBean(sdk, beanName, beanUUID, (device)=> {
    sdk.uploadSketch(device, binary, sketchName, (err)=> {
      if (err) {
        completedCallback(`Sketch upload failed: ${err}`)
      } else {
        completedCallback(null)
      }
    })
  }, completedCallback)

}


function listCompiledSketches(completedCallback) {

  let dirFiles = fs.readdirSync(COMPILED_SKETCH_LOCATION)
  for (let i in dirFiles) {
    let f = dirFiles[i]
    console.log(`${i}: ${f}`)
  }

  completedCallback(null)
}


module.exports = {
  programFirmware: programFirmware,
  programSketch: programSketch,
  listCompiledSketches: listCompiledSketches
}
