'use strict'

const fs = require('fs')
const spawn = require('child_process').spawn;

const PLATFORM_OSX = 'darwin'
const PLATFORM_FREEBSD = 'freebsd'
const PLATFORM_LINUX = 'linux'
const PLATFORM_SUNOS = 'sunos'
const PLATFORM_WINDOWS = 'win32'


function openArduinoApp(arduinoInstallPath) {

  if (arduinoInstallPath.endsWith('/')) {
    arduinoInstallPath = arduinoInstallPath.slice(0, -1)
  }

  let program = null
  let args = null
  switch(process.platform) {
    case PLATFORM_OSX:
      if (!arduinoInstallPath.endsWith('.app')) {
        throw new Error('Mac Arduino path should end with .app')
      }
      program = 'open'
      args = [arduinoInstallPath]
      break
    case PLATFORM_WINDOWS:
      throw new Error('Platform not supported')
      break
    case PLATFORM_LINUX:
      throw new Error('Platform not supported')
      break
    default:
      throw new Error('Platform not supported')
      break
  }

  let cmd = spawn(program, args);

  cmd.stderr.on('data', (data) => {
    throw new Error(data)
  })

  cmd.on('close', (code) => {
    console.log('Arduino app opened successfully')
  })
}

function installBeanArduinoCore(arduinoInstallPath, completedCallback) {
  // arduinoInstallPath examples:
  //     osx: /Applications/Arduino.app/
  //     windows: c://Program Files(x86)/Arduino/
  //     linux: todo

  openArduinoApp(arduinoInstallPath)

}


module.exports = {
  installBeanArduinoCore: installBeanArduinoCore
}
