'use strict'

const oad = require('../../oad.js')


function connectToBean(sdk, name, uuid, successCallback, errorCallback) {

  if (!name && !uuid) {
    errorCallback("Please provide bean name or UUID")
  }

  let found = false

  sdk.startScanning(15, ()=> {
    // Scan timeout
    if (!found) {
      errorCallback(`No Bean found with name/uuid: ${name}/${uuid}`)
    }
  })

  sdk.on('discover', (device)=> {
    if (device.getName() === name || device.getUUID() === uuid) {
      console.log(`Found Bean with name/uuid: ${device.getName()}/${device.getUUID()}`)
      found = true

      sdk.connectToDevice(device.getUUID(), (err)=> {

        if (err) {
          errorCallback(`Bean connection failed: ${err}`)
          return
        }

        device.lookupServices((err)=> {

          if (err) {
            errorCallback(`Service lookup FAILED: ${err}`)
          } else {
            successCallback(device)
          }

        })
      })
    }
  })
}


function programFirmware(sdk, beanName, beanUUID, completedCallback) {
  console.log('Programming Bean (%s) with firmware (%s).', beanName, oad.bakedFirmwareVersion())

  connectToBean(sdk, beanName, beanUUID, (device)=> {
    sdk.updateFirmware(device, (err)=> {

      if (err) {
        completedCallback(`FW update failed: ${err}`)
      } else {
        completedCallback(null)
      }

    })
  }, completedCallback)
}


function programSketch(sdk, beanName, beanUUID, hexFile, completedCallback) {

  connectToBean(sdk, beanName, beanUUID, (device)=> {

  }, completedCallback)

}


module.exports = {
  programFirmware: programFirmware,
  programSketch: programSketch
}
