const program = require('./program.js')
const scan = require('./scan.js')
const bean = require('./bean')
const install = require('./install')


module.exports = {
  programFirmware: program.programFirmware,
  programSketch: program.programSketch,
  startScan: scan.startScan,
  blinkLed: bean.blinkLed,
  readAccel: bean.readAccel,
  readConfig: bean.readConfig,
  readDeviceInfo: bean.readDeviceInfo,
  installBeanArduinoCore: install.installBeanArduinoCore
}
