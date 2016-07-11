let LightBlueSDK = require('../app/lightblue/lightblue.js')

sdk = new LightBlueSDK()

sdk.startScanning()

sdk.on('discover', (device)=> {

  sdk.connectToDevice(device.getUUID(), (err)=> {
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
