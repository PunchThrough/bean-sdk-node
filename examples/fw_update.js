'use strict'

let LB = require('../app/lightblue/lightblue.js')
let program = require('commander')

program
  .version('0.0.1')
  .option('-fw, --firmware [fw]', 'Firmware version')
  .option('-b, --bean [bean]', 'Bean name')
  .parse(process.argv);

console.log('Programming Bean (%s) with firmware (%s).', program.bean, program.firmware)

if (!program.bean || !program.version) {
  console.log('Please provide bean name and FW version')
  process.exit(1)
}

LB.startScanning()

LB.on('discover', (device)=> {
  if (device.getName() === program.bean) {
    console.log("Found Bean (%s)", device.getName())

    LB.connectToDevice(device.getUUID(), (err)=> {
      device.lookupServices((err)=> {
        if (err) {
          console.log("Service lookup FAILED!")
        } else {
          if (err) {
            console.log("Bean connect FAILED!")
          } else {
            LB.updateFirmware(device, (error)=> {
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
