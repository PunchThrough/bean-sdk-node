'use strict'


function startScan(sdk) {
  sdk.startScanning()
  console.log('\n')

  sdk.on('discover', (device)=> {
    console.log("New LightBlue device discovered!\n%s", device.describe())
  })

}


module.exports = {
  startScan: startScan
}
