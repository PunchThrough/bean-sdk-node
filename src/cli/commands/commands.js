const program = require('./program')
const ble = require('./ble')
const bean = require('./bean')
const install = require('./install')


function cmd(fn) {
  function _closure(...args) {
    let callback = args[args.length - 1]
    try {
      fn.apply(fn, args)
    } catch (error) {
      callback(`There was an error: ${error.message}`)
    }
  }
  return _closure
}


module.exports = {
  programFirmware: cmd(program.programFirmware),
  programSketch: cmd(program.programSketch),
  startScan: cmd(ble.startScan),
  blinkLed: cmd(bean.blinkLed),
  readAccel: cmd(bean.readAccel),
  readConfig: cmd(bean.readConfig),
  readDeviceInfo: cmd(bean.readDeviceInfo),
  installBeanArduinoCore: cmd(install.installBeanArduinoCore),
  listCompiledSketches: cmd(program.listCompiledSketches),
  logSerial: cmd(bean.logSerial),
  sendSerial: cmd(bean.sendSerial),
  rename: cmd(bean.rename),
  readScratch: cmd(bean.readScratch),
  writeScratch: cmd(bean.writeScratch),
  listGATT: cmd(ble.listGATT)
}
