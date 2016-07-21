'use strict'


const common = require('./common')
const sleep = require('sleep')
const async = require('async')


function blinkLed(sdk, beanName, beanUUID, completedCallback) {

  common.connectToBean(sdk, beanName, beanUUID, (device)=> {
    device.setLed(255, 0, 255)
    sleep.sleep(1)
    device.setLed(0, 0, 0)

  }, completedCallback)

}


function readAccel(sdk, beanName, beanUUID, completedCallback) {

  common.connectToBean(sdk, beanName, beanUUID, (device)=> {



    async.timesSeries(20, (n, next)=> {
      device.readAccelerometer((xAxis, yAxis, zAxis, sensitivity)=> {
        let out = 'Accelerometer Reading:\n'
        out += `    X: ${xAxis}`
        out += `    Y: ${yAxis}`
        out += `    Z: ${zAxis}`
        console.log(out)
        sleep.usleep(500)
        next()
      })
    }, (err, results)=> {
      // All done
      completedCallback(null)
    })

  }, completedCallback)

}


module.exports = {
  blinkLed: blinkLed,
  readAccel: readAccel
}
