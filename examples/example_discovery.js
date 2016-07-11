let LB = require('../app/lightblue/lightblue.js')


LB.startScanning()

LB.on('discover', (device)=> {
  console.log(device.toString())
})
