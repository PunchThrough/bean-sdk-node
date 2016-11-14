'use strict'

const SCAN_DURATION = 30

function startScan(sdk, all, completedCallback) {

  let filter = true
  let msg = 'LightBlue'
  if (all) {
    filter = false
    msg = 'ALL'
  }

  console.log(`\nScanning for ${msg} devices for ${SCAN_DURATION} seconds...\n`)

  sdk.on('discover', (device)=> {
    console.log("New LightBlue device discovered!\n%s", device.describe())
  })

  sdk.startScanning(SCAN_DURATION, filter, completedCallback)

}


module.exports = {
  startScan: startScan
}
