let lightblue = require('../src/lightblue')

let sdk = lightblue.sdk()

sdk.on('discover', (scannedDevice)=> {
  // We now have a `ScannedDevice` object, found in src/lightblue/devices.js

  sdk.connectScannedDevice(scannedDevice, (err, bean)=> {
    // We now have a `LightBlueDevice` object (named bean), found in src/lightblue/devices.js

    if (err) {
      console.log(`Bean connection failed: ${err}`)
    } else {
      bean.lookupServices((err)=> {
        // The bean is now ready to be used, you can either call the methods available
        // on the `LightBlueDevice` class, or grab the individual services objects which
        // provide their own API, for example: bean.getDeviceInformationService().

        if (err) {
          console.log(`Service lookup FAILED: ${err}`)
        } else {
          bean.setLed(255, 0, 0, (err)=> {
            if (err) {
              console.log('Error while setting Bean led!')
            } else {
              console.log('Successfully set Bean led to red!')
            }
          })
        }
      })
    }
  })
})

sdk.startScanning()
