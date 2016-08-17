const winston = require('winston')


function timestamp() {
  let d = new Date()
  return d.toISOString()
}


function formatter(options) {
  return '' +
    options.timestamp() + ' '+
    options.level.toUpperCase() + ' ' +
    (undefined !== options.message ? options.message : '') +
    (options.meta && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : '' )
}


let logger = new winston.Logger({

  level: 'info',

  transports: [
    new (winston.transports.Console)({
      timestamp: timestamp,
      formatter: formatter,
    })

  ]
})


function configure(opts) {
  logger.configure(opts)
}


module.exports = {
  logger: logger,
  configure: configure,
  timestamp: timestamp,
  formatter: formatter
}
