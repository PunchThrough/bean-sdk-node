const winston = require('winston')


let logger = new winston.Logger({
  level: 'info',
  transports: [
    new (winston.transports.Console)()
  ]
})


function configure(opts) {
  logger.configure(opts)
}


module.exports = {
  logger: logger,
  configure: configure
}
