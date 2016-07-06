const program = require('./program.js')
const scan = require('./scan.js')


module.exports = {
  programFirmware: program.programFirmware,
  programSketch: program.programSketch,
  startScan: scan.startScan
}
