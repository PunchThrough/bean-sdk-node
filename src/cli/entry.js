#!/usr/bin/env node

'use strict'


const program = require('commander')
const commands = require('./commands/commands.js')
const lightblue = require('../lightblue.js')
const winston = require('winston')
const logging = require('../util/logs')
const platform = require('../util/platform')
const pkg = require('../../package.json')


function sdk(logLevel='error') {
  // We want the SDK to be as silent as possible from the CLI, hence error level

  logging.configure({
    level: logLevel,
    transports: [
      new (winston.transports.Console)({
        timestamp: logging.timestamp,
        formatter: logging.formatter,
      })
    ]
  })

  try {
    return lightblue.sdk()
  } catch (error) {
    let msg = error.message
    if(msg.indexOf("LIBUSB") > -1) {
      msg = "Failed to find LIBUSB device. Please use the Zadig tool to install libusb/WinUSB driver for your BLE device."
    }
    console.log(`\nERROR: ${msg}`)
    process.exit(1)
  }
}


function quit(rc) {
  console.log('')
  console.log('Quitting gracefully...')
  lightblue.sdk().quitGracefully((err)=> {
    console.log("Done.")
    process.exit(rc)
  })
}


function commandComplete(error) {
  console.log('')
  if (error) {
    console.log(`Command completed with error(s): ${error}`)
    quit(1)
  } else {
    console.log('Command completed.')
    quit(0)
  }
}


process.on('SIGINT', function() {
  quit(0)
})


program
  .version(pkg.version)
  .option('-v, --version', 'Get SDK version')
  .action((options)=> {
    // Default handler
    console.log('Invalid command.')
    program.help()
  })


program
  .command('scan')
  .description('Scan for LightBlue devices')
  .option('--all', 'Remove all filters on scan results')
  .action((options)=> {
    commands.startScan(sdk(), options.all, commandComplete)
  })


program
  .command('program_firmware')
  .description('Program bean firmware')
  .option('-n, --name [name]', 'Bean name')
  .option('-a, --address [address]', 'Bean address')
  .option('-f, --force', 'Program firmware even if versions are the same')
  .action((options)=> {
    console.log('')
    commands.programFirmware(sdk('info'), options.name, options.address, options.force === true, commandComplete)
  })


program
  .command('program_sketch [sketch]')
  .on('--help', ()=> {
    console.log('  Example 1 (using sketch name):')
    console.log('')
    console.log('    $ program_sketch setLed -n Bean')
    console.log('')

    console.log('  Example 2 (using a path):')
    console.log('')
    console.log('    $ program_sketch /Users/me/my_sketches/custom_sketch.hex -n Bean')
  })
  .description('Program a sketch to the Bean (sketch name or path ending in .hex)')
  .option('-n, --name [name]', 'Bean name')
  .option('-a, --address [address]', 'Bean address')
  .option('-o, --oops', 'Assists in reprogramming a malicious sketch')
  .action((sketchName, options)=> {
    console.log('')
    commands.programSketch(sdk('info'), sketchName, options.name, options.address, options.oops, commandComplete)
  })


program
  .command('blink_led')
  .description('Blink on-board Bean LED')
  .option('-n, --name [name]', 'Bean name')
  .option('-a, --address [address]', 'Bean address')
  .action((options)=> {
    commands.blinkLed(sdk(), options.name, options.address, commandComplete)
  })


program
  .command('rename [new_name]')
  .description('Rename Bean')
  .option('-n, --name [name]', 'Bean name')
  .option('-a, --address [address]', 'Bean address')
  .action((newName, options)=> {
    commands.rename(sdk(), newName, options.name, options.address, commandComplete)
  })


program
  .command('read_accel')
  .description('Read accelerometer data')
  .option('-n, --name [name]', 'Bean name')
  .option('-a, --address [address]', 'Bean address')
  .action((options)=> {
    commands.readAccel(sdk(), options.name, options.address, commandComplete)
  })


program
  .command('read_ble_config')
  .description('Read BLE config')
  .option('-n, --name [bean]', 'Bean name')
  .option('-a, --address [address]', 'Bean address')
  .action((options)=> {
    commands.readConfig(sdk(), options.name, options.address, commandComplete)
  })


program
  .command('read_device_info')
  .description('Read Device Information')
  .option('-n, --name [bean]', 'Bean name')
  .option('-a, --address [address]', 'Bean address')
  .action((options)=> {
    commands.readDeviceInfo(sdk(), options.name, options.address, commandComplete)
  })


program
  .command('install_bean_arduino_core')
  .description('Installs Bean Arduino core (https://github.com/punchthrough/bean-arduino-core)')
  .action((options)=> {
    commands.installBeanArduinoCore(commandComplete)
  })


program
  .command('list_compiled_sketches')
  .option('-c, --clean', 'Delete all compiled sketches')
  .description('Lists compiled sketches (/homedir/.beansketches)')
  .action((options)=> {
    sdk()  // configure logger
    commands.listCompiledSketches(options.clean, (err)=> {
      if (err)
        console.log(err)
      process.exit(0)
    })
  })


program
  .command('log_serial')
  .description('Log any serial output from the Bean')
  .option('-n, --name [bean]', 'Bean name')
  .option('-a, --address [address]', 'Bean address')
  .action((options)=> {
    commands.logSerial(sdk(), options.name, options.address, commandComplete)
  })


program
  .command('send_serial [data]')
  .description('Send serial data to the Bean (default ascii)')
  .option('-n, --name [bean]', 'Bean name')
  .option('-a, --address [address]', 'Bean address')
  .option('-b, --binary', 'Interpret data as hex digits')
  .action((data, options)=> {
    commands.sendSerial(sdk(), data, options.binary, options.name, options.address, commandComplete)
  })


program
  .command('write_scratch [bank] [data]')
  .description('Write data to a scratch characteristic')
  .option('-n, --name [bean]', 'Bean name')
  .option('-a, --address [address]', 'Bean address')
  .option('-b, --binary', 'Interpret data as hex digits')
  .action((bank, data, options)=> {
    commands.writeScratch(sdk(), bank, data, options.binary, options.name, options.address, commandComplete)
  })


program
  .command('read_scratch [bank]')
  .description('Read value of scratch characteristic')
  .option('-n, --name [bean]', 'Bean name')
  .option('-a, --address [address]', 'Bean address')
  .action((bank, options)=> {
    commands.readScratch(sdk(), bank, options.name, options.address, commandComplete)
  })


program
  .command('list_gatt')
  .description('List all BLE services and characteristics')
  .option('-n, --name [bean]', 'Bean name')
  .option('-a, --address [address]', 'Bean address')
  .action((options)=> {
    commands.listGATT(sdk(), options.name, options.address, commandComplete)
  })


if (!process.argv.slice(2).length) {
  console.log("Please provide a command as the first argument.")
  program.help()
}


program.parse(process.argv)
