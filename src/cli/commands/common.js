'use strict'


function connectToBean(sdk, name, address, successCallback, errorCallback) {

  if (!name && !address) {
    errorCallback("Please provide bean name or address")
  }

  let found = false

  sdk.startScanning(15, ()=> {
    // Scan timeout
    if (!found) {
      let errMsg
      if (name) {
        errMsg = `No Bean found with name: ${name}`
      } else {
        errMsg = `No Bean found with address: ${address}`
      }
      errorCallback(errMsg)
    }
  })

  sdk.on('discover', (device)=> {
    if (device.getName() === name || device.getAddress() === address) {

      console.log(`\nFound Bean with name/address: ${device.getName()}/${device.getAddress()}`)
      found = true

      sdk.connectToDevice(device.getAddress(), (err)=> {

        if (err) {
          errorCallback(`Bean connection failed: ${err}`)
          return
        }

        device.lookupServices((err)=> {

          if (err) {
            errorCallback(`Service lookup FAILED: ${err}`)
          } else {
            console.log('Connected!')
            successCallback(device)
          }

        })
      })
    }
  })
}

module.exports = {
  connectToBean: connectToBean,
}
