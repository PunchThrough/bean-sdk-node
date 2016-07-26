'use strict'


const program = require('commander')
const commands = require('./commands/commands.js')
const LightBlueSDK = require('../lightblue.js')
const winston = require('winston')


function initSdk(logLevel='error') {
  // We want the SDK to be as silent as possible from the CLI, hence error level
  let loggingOpts = {
    level: logLevel,
    transports: [
      new (winston.transports.Console)()
    ]
  }
  return new LightBlueSDK(loggingOpts)
}


function quit(rc, message) {
  console.log(message)
  process.exit(rc)
}


function commandComplete(error) {
  if (error) {
    quit(1, error)
  } else {
    quit(0, "Command completed successfully")
  }
}


program
  .version('0.0.1')
  .action(()=> {
    // Default handler
    console.log('Invalid command.')
    program.help()
  })


program
  .command('scan')
  .description('Scan for LightBlue devices')
  .action((options)=> {
    commands.startScan(initSdk())
  })


program
  .command('program_firmware')
  .description('Program bean firmware')
  .option('-n, --name [name]', 'Bean name')
  .option('-a, --address [address]', 'Bean address')
  .action((options)=> {
    commands.programFirmware(initSdk('info'), options.name, options.address, commandComplete)
  })


program
  .command('program_sketch [hexfile]')
  .description('Program a single sketch to the Bean')
  .option('-n, --name [name]', 'Bean name')
  .option('-a, --address [address]', 'Bean address')
  .action((hexFile, options)=> {
    commands.programSketch(initSdk('info'), hexFile, options.name, options.address, commandComplete)
  })


program
  .command('blink_led')
  .description('Blink on-board Bean LED')
  .option('-n, --name [name]', 'Bean name')
  .option('-a, --address [address]', 'Bean address')
  .action((options)=> {
    commands.blinkLed(initSdk(), options.name, options.address, commandComplete)
  })


program
  .command('read_accel')
  .description('Read accelerometer data')
  .option('-n, --name [name]', 'Bean name')
  .option('-a, --address [address]', 'Bean address')
  .action((options)=> {
    commands.readAccel(initSdk(), options.name, options.address, commandComplete)
  })


program
  .command('read_ble_config')
  .description('Read BLE config')
  .option('-n, --name [bean]', 'Bean name')
  .option('-a, --address [address]', 'Bean address')
  .action((options)=> {
    commands.readConfig(initSdk(), options.name, options.address, commandComplete)
  })


program
  .command('read_device_info')
  .description('Read Device Information')
  .option('-n, --name [bean]', 'Bean name')
  .option('-a, --address [address]', 'Bean address')
  .action((options)=> {
    commands.readDeviceInfo(initSdk(), options.name, options.address, commandComplete)
  })


if (!process.argv.slice(2).length) {
  console.log("Please provide a command as the first argument.")
  program.help()
}


program.parse(process.argv)
