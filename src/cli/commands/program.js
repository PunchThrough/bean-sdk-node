'use strict'


const intelhex = require('../../util/intelhex')
const common = require('./common')
const fs = require('fs-extra')
const path = require('path')
const paths = require('../../util/paths')
const platform = require("../../util/platform")
const util = require('../../util/util')


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
    // Sometimes there are hidden files we don't want to include (.DS_Store)
    if (!filename.startsWith('.'))
      bundle.push(path.join(bundleDir, filename))

  return bundle
}


function programFirmware(sdk, beanName, beanUUID, force, completedCallback) {

  common.connectToDevice(sdk, beanName, beanUUID, (device)=> {

    device.getDeviceInformationService().getHardwareVersion((err, version)=> {
      if (err) {
        completedCallback(err)
      } else {

        let bundle = lookupFirmwareBundleForHardwareVersion(version.toString('utf8'))

        console.log(`Programming device firmware: ${device.getAddress()}`)

        sdk.updateFirmware(device, bundle, force, (err)=> {

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


function _uploadSketch(sdk, device, sketchData, sketchName, oops, callback) {

  sdk.uploadSketch(device, sketchData, sketchName, oops === true, (err)=> {
    if (err) {
      callback(`Sketch upload failed: ${err}`)
    } else {
      callback(null)
    }
  })
}


function _getSketchData(device, sketch, callback) {

  device.getDeviceInformationService().getHardwareVersion((err, version)=> {
    if (err)
      callback(err)

    let hexPath
    let sketchName
    if (sketch.endsWith('.hex')) {
      hexPath = sketch
      if (!fs.existsSync(hexPath)) {
        callback(`Invalid hex file path: ${hexPath}`)
        return
      }

      sketchName = path.parse(hexPath).name
      console.log(`Found sketch at path: ${hexPath}`)

    } else {

      sketchName = sketch
      let hexFile = `${sketch}.hex`
      let hardwareVersion = version.toString('utf8')

      let sketchDir
      let boardName
      if (hardwareVersion.startsWith('1') || hardwareVersion.startsWith('E')) {
        sketchDir = common.SKETCH_LOCATION_BEAN
        boardName = 'Bean'
      } else if (hardwareVersion.startsWith('2')) {
        sketchDir = common.SKETCH_LOCATION_BEANPLUS
        boardName = 'Bean+'
      } else {
        callback(`Unrecognized hardware version: ${hardwareVersion}`)
        return
      }

      hexPath = path.join(sketchDir, hexFile)
      if (fs.existsSync(hexPath)) {
        console.log(`Found sketch ${sketch} for board ${boardName}`)
      } else {
        callback(`No sketch with name "${sketch}" for board ${boardName}`)
        return
      }
    }

    let asciiData = fs.readFileSync(hexPath, 'ascii')
    let intelHex = new intelhex.IntelHexFile(asciiData)
    let binarySketchData = intelHex.parse()
    callback(null, binarySketchData, sketchName)
  })
}


function programSketch(sdk, sketch, beanName, beanUUID, oops, completedCallback) {

  common.connectToDevice(sdk, beanName, beanUUID, (device)=> {
    _getSketchData(device, sketch, (error, binary, sketchName)=> {
      if (error) {
        completedCallback(error)
      } else {
        _uploadSketch(sdk, device, binary, sketchName, oops, completedCallback)
      }
    })

  }, completedCallback)

}


function listCompiledSketches(clean, completedCallback) {

  console.log('')

  let beanSketches = fs.readdirSync(common.SKETCH_LOCATION_BEAN)
  console.log('Bean Sketches:')
  if (beanSketches.length < 1) {
    console.log('    None.')
  } else {
    for (let i in beanSketches) {
      let f = beanSketches[i]
      console.log(`    ${i}: ${f.split('.')[0]}`)
    }
  }

  console.log('')

  let beanPlusSketches = fs.readdirSync(common.SKETCH_LOCATION_BEANPLUS)
  console.log('Bean+ Sketches:')
  if (beanPlusSketches.length < 1) {
    console.log('    None.')
  } else {
    for (let i in beanPlusSketches) {
      let f = beanPlusSketches[i]
      console.log(`    ${i}: ${f.split('.')[0]}`)
    }
  }

  if (clean === true) {
    util.userInput.question('Are you sure you want to delete compiled sketches? (y/n):', (input)=> {
      input.replace('\r\n', '')
      if (input.toLowerCase() === 'y') {
        common.cleanSketchFolder()
        console.log('Sketches have been deleted.')
      } else if (input.toLowerCase() !== 'y' || input.toLowerCase() !== 'n') {
        console.log('Sketches have NOT been deleted.')
      }
      completedCallback(null)
    })
  } else {
    completedCallback(null)
  }
}


module.exports = {
  programFirmware: programFirmware,
  programSketch: programSketch,
  listCompiledSketches: listCompiledSketches
}
