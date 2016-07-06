'use strict'

const oad = require('../../oad.js')


function programFirmware(sdk, beanName, completedCallback) {
  console.log('Programming Bean (%s) with firmware (%s).', beanName, oad.bakedFirmwareVersion())

  if (!beanName) {
    completedCallback("Please provide bean name and FW version")
  }

  sdk.startScanning()

  sdk.on('discover', (device)=> {
    if (device.getName() === beanName) {
      console.log("Found Bean (%s)", device.getName())

      sdk.connectToDevice(device.getUUID(), (err)=> {
        device.lookupServices((err)=> {
          if (err) {
            console.log("Service lookup FAILED!")
          } else {
            if (err) {
              console.log("Bean connect FAILED!")
            } else {
              sdk.updateFirmware(device, (error)=> {
                if (error) {
                  console.log("FW Update FAILED: %s", error)
                } else {
                  console.log("FW Success!")
                }
              })
            }
          }
        })
      })
    }
  })

}


function programSketch() {

}


module.exports = {
  programFirmware: programFirmware,
  programSketch: programSketch
}
