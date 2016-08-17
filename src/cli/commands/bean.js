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
      device.readAccelerometer((err, response)=> {
        let xOut = sprintf("X: %-10s", response.x_axis)
        let yOut = sprintf("Y: %-10s", response.y_axis)
        let zOut = sprintf("Z: %-10s", response.z_axis)
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


function readConfig(sdk, beanName, beanUUID, completedCallback) {

  common.connectToBean(sdk, beanName, beanUUID, (device)=> {
    device.readBleConfig((err, response)=> {
      let out = "\n"
      out += `    Advertising Interval: ${response.advertising_interval}\n`
      out += `     Connection Interval: ${response.connection_interval}\n`
      out += `                Tx Power: ${response.tx_power}\n`
      out += `        Advertising Mode: ${response.advertising_mode}\n`
      out += `            iBeacon UUID: ${response.ibeacon_uuid}\n`
      out += `        iBeacon Major ID: ${response.ibeacon_major_id}\n`
      out += `        iBeacon Minor ID: ${response.ibeacon_minor_id}\n`
      out += `              Local Name: ${response.local_name}\n`
      console.log(out)
    })
  })
}


function readDeviceInfo(sdk, beanName, beanUUID, completedCallback) {

  common.connectToBean(sdk, beanName, beanUUID, (device)=> {
    let dis = device.getDeviceInformationService()
    dis.serialize((err, info) => {
      let out = "\n"
      out += `      Manufacturer: ${info.manufacturer_name}\n`
      out += `      Model Number: ${info.model_number}\n`
      out += `  Hardware Version: ${info.hardware_version}\n`
      out += `  Firmware Version: ${info.firmware_version}\n`
      out += `  Software Version: ${info.software_version}\n`
      console.log(out)
    })
  })
}


module.exports = {
  blinkLed: blinkLed,
  readAccel: readAccel,
  readConfig: readConfig,
  readDeviceInfo: readDeviceInfo
}