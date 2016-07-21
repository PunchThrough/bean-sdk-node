'use strict'


const common = require('./common')
const sleep = require('sleep')
const async = require('async')
const sprintf = require('sprintf-js').sprintf


function blinkLed(sdk, beanName, beanUUID, completedCallback) {

  common.connectToBean(sdk, beanName, beanUUID, (device)=> {
    device.setLed(255, 0, 255)
    sleep.sleep(1)
    device.setLed(0, 0, 0)

  }, completedCallback)

}


function readAccel(sdk, beanName, beanUUID, completedCallback) {

  common.connectToBean(sdk, beanName, beanUUID, (device)=> {



    async.timesSeries(30, (n, next)=> {
      device.readAccelerometer((xAxis, yAxis, zAxis, sensitivity)=> {
        let xOut = sprintf("X: %-10s", xAxis)
        let yOut = sprintf("Y: %-10s", yAxis)
        let zOut = sprintf("Z: %-10s", zAxis)
        let out = `${xOut}${yOut}${zOut}`
        console.log(out)
        sleep.usleep(500000)
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
