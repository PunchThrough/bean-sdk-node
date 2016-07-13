'use strict'

const program = require('commander')
const commands = require('./commands/commands.js')
const LightBlueSDK = require('../lightblue.js')


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
    commands.startScan(new LightBlueSDK())
  })


program
  .command('program_firmware')
  .description('Program bean firmware')
  .option('-b, --bean [bean]', 'Bean name')
  .option('-u, --uuid [uuid]', 'Bean address (UUID)')
  .action((options)=> {
    commands.programFirmware(new LightBlueSDK(), options.bean, options.uuid, commandComplete)
  })


program
  .command('program_sketch [bean_name] [hexfile]')
  .description('Program a single sketch to the Bean')
  .action((beanName, hexFile)=> {
    commands.programSketch(new LightBlueSDK(), beanName, hexFile, commandComplete)
  })


program
  .command('blink_led')
  .description('Blink on-board Bean LED')
  .option('-b, --bean [bean]', 'Bean name')
  .option('-u, --uuid [uuid]', 'Bean address (UUID)')
  .action((options)=> {
    commands.blinkLed(new LightBlueSDK(), options.bean, options.uuid, commandComplete)
  })


if (!process.argv.slice(2).length) {
  console.log("Please provide a command as the first argument.")
  program.help()
}


program.parse(process.argv)
