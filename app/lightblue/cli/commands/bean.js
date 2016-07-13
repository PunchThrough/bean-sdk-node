'use strict'


const common = require('./common')


function blinkLed(sdk, beanName, beanUUID, completedCallback) {

  common.connectToBean(sdk, beanName, beanUUID, (device)=> {
    device.setLed(0, 0, 255)

  }, completedCallback)

}


function readAccel(sdk, beanName, beanUUID, completedCallback) {

  common.connectToBean(sdk, beanName, beanUUID, (device)=> {

  }, completedCallback)

}


module.exports = {
  blinkLed: blinkLed,
  readAccel: readAccel
}
