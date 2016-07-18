const program = require('./program.js')
const scan = require('./scan.js')
const bean = require('./bean')


module.exports = {
  programFirmware: program.programFirmware,
  programSketch: program.programSketch,
  startScan: scan.startScan,
  blinkLed: bean.blinkLed,
  readAccel: bean.readAccel
}
