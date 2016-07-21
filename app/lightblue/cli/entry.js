'use strict'


const program = require('commander')
const commands = require('./commands/commands.js')
const LightBlueSDK = require('../lightblue.js')
const winston = require('winston')


function initSdk() {
  // We want the SDK to be as silent as possible from the CLI, hence error level
  let loggingOpts = {
    level: 'error',
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
    commands.programFirmware(initSdk(), options.bean, options.address, commandComplete)
  })


program
  .command('program_sketch [bean_name] [hexfile]')
  .description('Program a single sketch to the Bean')
  .action((beanName, hexFile)=> {
    commands.programSketch(initSdk(), beanName, hexFile, commandComplete)
  })


program
  .command('blink_led')
  .description('Blink on-board Bean LED')
  .option('-n, --name [name]', 'Bean name')
  .option('-a, --address [address]', 'Bean address')
  .action((options)=> {
    commands.blinkLed(initSdk(), options.bean, options.address, commandComplete)
  })


program
  .command('read_accel')
  .description('Read accelerometer data')
  .option('-n, --name [name]', 'Bean name')
  .option('-a, --address [address]', 'Bean address')
  .action((options)=> {
    commands.readAccel(initSdk(), options.bean, options.address, commandComplete)
  })


program
  .command('read_config')
  .description('Read BLE config')
  .option('-n, --name [bean]', 'Bean name')
  .option('-a, --address [address]', 'Bean address')
  .action((options)=> {
    commands.readConfig(initSdk(), options.bean, options.address, commandComplete)
  })


if (!process.argv.slice(2).length) {
  console.log("Please provide a command as the first argument.")
  program.help()
}


program.parse(process.argv)
