let LightBlueSDK = require('../src/lightblue')

let sdk = new LightBlueSDK()

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

sdk.startScanning()
