'use strict'


const spawn = require('child_process').spawn


const PLATFORM_OSX = 'darwin'
const PLATFORM_FREEBSD = 'freebsd'
const PLATFORM_LINUX = 'linux'
const PLATFORM_SUNOS = 'sunos'
const PLATFORM_WINDOWS = 'win32'


function lineEnding() {
  if (process.platform == PLATFORM_WINDOWS) {
    return '\r\n'
  } else {
    return '\n'
  }
}


function userHome() {
  return process.env[(process.platform == PLATFORM_WINDOWS) ? 'USERPROFILE' : 'HOME'];
}


function runCli(program, args, callback) {
  let cmd = spawn(program, args)

  cmd.on('close', (code) => {
    if (code != 0) {
      throw new Error(`CLI command failed: ${program}`)
    } else {
      callback()
    }
  })
}


function platformSpecificFn(functionMap, ...args) {
  let fn = functionMap[process.platform]
  if (fn) {
    return fn.apply(fn, args)
  }  else {
    throw new Error(`Platform not supported: ${process.platform}`)
  }
}



module.exports = {
  lineEnding: lineEnding,
  userHome: userHome,
  cli: runCli,
  runFunction: platformSpecificFn,
  OSX: PLATFORM_OSX,
  FREEBSD: PLATFORM_FREEBSD,
  LINUX: PLATFORM_LINUX,
  SUNOS: PLATFORM_SUNOS,
  WINDOWS: PLATFORM_WINDOWS
}
