'use strict'


const common = require('./common')

const SCAN_DURATION = 30

function startScan(sdk, all, completedCallback) {

  let filter = true
  let msg = 'LightBlue'
  if (all) {
    filter = false
    msg = 'ALL'
  }

  console.log(`\nScanning for ${msg} devices for ${SCAN_DURATION} seconds...\n`)

  sdk.on('discover', (scannedDevice)=> {
    console.log(`New Device discovered or updated!\n${scannedDevice.print()}`)
  })

  sdk.startScanning(SCAN_DURATION, filter, completedCallback)

}


function listGATT(sdk, beanName, beanAddress, completedCallback) {

  common.connectToDevice(sdk, beanName, beanAddress, (device)=> {
    let services = device.getServices()
    for (let sUUID in services) {
      let s = services[sUUID]

      console.log(`Service: ${sUUID}`)
      console.log(`  Name: ${s.getName()}`)
      console.log('  Characteristics:')

      let characteristics = s.getCharacteristics()
      if (characteristics.length < 1) {
        console.log('    None.')
      } else {
        for (let cUUID in characteristics) {
          console.log(`    ${cUUID}`)
        }
      }
    }
    completedCallback(null)
  }, completedCallback, false)

}


module.exports = {
  startScan: startScan,
  listGATT: listGATT
}
