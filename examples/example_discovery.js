let LightBlueSDK = require('../src/lightblue')

sdk = new LightBlueSDK()

sdk.startScanning()

sdk.on('discover', (device)=> {

  sdk.connectToDevice(device.getAddress(), (err)=> {
    if (err) {
      console.log(`Bean connection failed: ${err}`)
    } else {
      device.lookupServices((err)=> {
        if (err) {
          console.log(`Service lookup FAILED: ${err}`)
        }
      })
    }
  })
})
