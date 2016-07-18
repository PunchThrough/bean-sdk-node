'use strict'


const common = require('./common')
const sleep = require('sleep')


function blinkLed(sdk, beanName, beanUUID, completedCallback) {

  common.connectToBean(sdk, beanName, beanUUID, (device)=> {
    device.setLed(255, 0, 255)
    sleep.sleep(1)
    device.setLed(0, 0, 0)

  }, completedCallback)

}


function readAccel(sdk, beanName, beanUUID, completedCallback) {

  common.connectToBean(sdk, beanName, beanUUID, (device)=> {
    device.readAccelerometer((reading)=> {
      console.log(reading)
    })
  }, completedCallback)

}


module.exports = {
  blinkLed: blinkLed,
  readAccel: readAccel
}
