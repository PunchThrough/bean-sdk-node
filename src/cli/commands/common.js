'use strict'


const platform = require("../../util/platform")
const path = require('path')
const fs = require('fs-extra')


const SKETCH_LOCATION = path.join(platform.userHome(), '.beansketches')
const SKETCH_LOCATION_BEAN = path.join(SKETCH_LOCATION, 'bean')
const SKETCH_LOCATION_BEANPLUS = path.join(SKETCH_LOCATION, 'beanplus')


function cleanSketchFolder() {
  fs.emptyDirSync(SKETCH_LOCATION)
  fs.emptyDirSync(SKETCH_LOCATION_BEAN)
  fs.emptyDirSync(SKETCH_LOCATION_BEANPLUS)
}


function connectToDevice(sdk, name, address, successCallback, errorCallback, filter=false) {

  if (!name && !address) {
    errorCallback("Please provide bean name or address")
  }

  let found = false

  sdk.startScanning(15, filter, ()=> {
    // Scan timeout
    if (!found) {
      errorCallback('No bean found!')
    }
  })

  sdk.on('discover', (scannedDevice)=> {
    if (scannedDevice.getName() === name || scannedDevice.getAddress() === address) {

      console.log(`\nFound device with name/address: ${scannedDevice.getName()}/${scannedDevice.getAddress()}`)
      found = true
      sdk.stopScanning()
      sdk.connectScannedDevice(scannedDevice, (err, device)=> {

        if (err) {
          errorCallback(`Bean connection failed: ${err}`)
          return
        }

        device.lookupServices((err)=> {

          if (err) {
            errorCallback(`Service lookup FAILED: ${err}`)
          } else {
            console.log('Connected!\n')
            successCallback(device)
          }

        })
      })
    }
  })
}

module.exports = {
  connectToDevice: connectToDevice,
  cleanSketchFolder: cleanSketchFolder,
  SKETCH_LOCATION_BEAN: SKETCH_LOCATION_BEAN,
  SKETCH_LOCATION_BEANPLUS: SKETCH_LOCATION_BEANPLUS
}
