'use strict'


const intelhex = require('../../util/intelhex')
const common = require('./common')
const fs = require('fs')
const path = require('path')
const paths = require('../../util/paths')
const platform = require("../../util/platform")


const COMPILED_SKETCH_LOCATION = path.join(platform.userHome(), '.beansketches')
const FIRMWARE_BUNDLES = paths.getResource('firmware_bundles')


function lookupFirmwareBundleForHardwareVersion(hardwareVersion) {
  let bundleDir
  if (hardwareVersion.startsWith('1') || hardwareVersion.startsWith('E')) {
    bundleDir = path.join(FIRMWARE_BUNDLES, 'bean')
  } else if (hardwareVersion.startsWith('2')) {
    bundleDir = path.join(FIRMWARE_BUNDLES, 'beanplus')
  } else {
    throw new Error(`Unrecognized hardware version: ${hardwareVersion}`)
  }

  let bundle = []
  for (let filename of fs.readdirSync(bundleDir).sort())
    bundle.push(path.join(bundleDir, filename))

  return bundle
}


function programFirmware(sdk, beanName, beanUUID, completedCallback) {

  common.connectToBean(sdk, beanName, beanUUID, (device)=> {

    device.getDeviceInformationService().getHardwareVersion((err, version)=> {
      if (err) {
        completedCallback(err)
      } else {

        let bundle = lookupFirmwareBundleForHardwareVersion(version.toString('utf8'))

        console.log(`Programming device firmware: ${device.getAddress()}`)

        sdk.updateFirmware(device, bundle, (err)=> {

          if (err) {
            completedCallback(`FW update failed: ${err}`)
          } else {
            completedCallback(null)
          }

        })
      }
    })

  }, completedCallback)
}


function programSketch(sdk, sketchName, beanName, beanUUID, completedCallback) {

  let hexFile = sketchName
  if (!sketchName.endsWith('.hex'))
    hexFile = `${sketchName}.hex`

  let hexPath = path.join(COMPILED_SKETCH_LOCATION, hexFile)
  if (!fs.existsSync(hexPath)) {
    throw new Error(`No sketch with name: ${sketchName}`)
  }

  let asciiData = fs.readFileSync(hexPath, 'ascii')
  let intelHex = new intelhex.IntelHexFile(asciiData)
  let binary = intelHex.parse()

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

  console.log('')
  let dirFiles = fs.readdirSync(COMPILED_SKETCH_LOCATION)
  for (let i in dirFiles) {
    let f = dirFiles[i]
    console.log(`${i}: ${f.split('.')[0]}`)
  }

  completedCallback(null)
}


module.exports = {
  programFirmware: programFirmware,
  programSketch: programSketch,
  listCompiledSketches: listCompiledSketches
}
