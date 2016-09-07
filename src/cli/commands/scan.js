'use strict'


function startScan(sdk, completedCallback) {
  sdk.startScanning(30, function() {
    completedCallback(null)
  })
  console.log('\nScanning for 30 seconds...\n')

  sdk.on('discover', (device)=> {
    console.log("New LightBlue device discovered!\n%s", device.describe())
  })

}


module.exports = {
  startScan: startScan
}
