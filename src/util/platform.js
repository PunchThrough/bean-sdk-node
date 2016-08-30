'use strict'


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


module.exports = {
  lineEnding: lineEnding,
  userHome: userHome,
  OSX: PLATFORM_OSX,
  FREEBSD: PLATFORM_FREEBSD,
  LINUX: PLATFORM_LINUX,
  SUNOS: PLATFORM_SUNOS,
  WINDOWS: PLATFORM_WINDOWS
}
