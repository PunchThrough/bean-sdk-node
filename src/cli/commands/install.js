'use strict'

const fs = require('fs-extra')
const os = require('os')
const spawn = require('child_process').spawn
const paths = require('../../util/paths')
const path = require('path')
const readline = require('readline')

const PLATFORM_OSX = 'darwin'
const PLATFORM_FREEBSD = 'freebsd'
const PLATFORM_LINUX = 'linux'
const PLATFORM_SUNOS = 'sunos'
const PLATFORM_WINDOWS = 'win32'


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})


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


function openArduinoApp(arduinoInstallPath, callback) {

  if (arduinoInstallPath.endsWith('/')) {
    arduinoInstallPath = arduinoInstallPath.slice(0, -1)
  }

  let fnMap = {}
  fnMap[PLATFORM_OSX] = ()=> {return ['open', [arduinoInstallPath]]}
  let result = platformSpecificFn(fnMap)
  let program = result[0]
  let args = result[1]

  runCli(program, args, ()=> {
    console.log('Arduino app opened successfully')
    callback()
  })
}


function unzip(tarball, location, callback) {
  let fnMap = {}
  fnMap[PLATFORM_OSX] = ()=> {return ['tar', ['-xzvf', tarball, '-C', location]]}
  let result = platformSpecificFn(fnMap)
  let program = result[0]
  let args = result[1]

  runCli(program, args, ()=> {
    callback(path.join(location, 'bean-arduino-core'))
  })
}


function installBeanArduinoCore(completedCallback) {

  let fnMap = {}
  fnMap[PLATFORM_OSX] = ()=> {return '/Applications/Arduino.app/'}
  fnMap[PLATFORM_WINDOWS] = ()=> {return 'C://Program Files(x86)/Arduino/'}
  let example = platformSpecificFn(fnMap)

  rl.question(`Where is Arduino core installed? (ex. ${example})\nPath:`, (arduinoInstallPath) => {
    rl.question(`Where should compiled sketches be stored?\nPath:`, (compiledSketchLocation) => {
      openArduinoApp(arduinoInstallPath, ()=> {
        let beanArduinoCoreTarball = paths.getResource('bean-arduino-core-2.0.0.tar.gz')
        unzip(beanArduinoCoreTarball, os.tmpdir(), (unzippedPath)=> {
          let arduinoHardwareFolder = path.join(arduinoInstallPath, 'Contents', 'java', 'hardware', 'LightBlue-Bean')
          let arduinoExamplesFolder = path.join(arduinoInstallPath, 'Contents', 'java', 'examples', 'LightBlue-Bean')
          let beanCoreHardwareFolder = path.join(unzippedPath, 'hardware', 'LightBlue-Bean')
          let beanCoreExamplesFolder = path.join(unzippedPath, 'examples', 'LightBlue-Bean')

          fs.mkdirsSync(arduinoHardwareFolder)
          fs.copySync(beanCoreHardwareFolder, arduinoHardwareFolder)

          fs.mkdirsSync(arduinoExamplesFolder)
          fs.copySync(beanCoreExamplesFolder, arduinoExamplesFolder)

          console.log('Bean Arduino core installed.')
          completedCallback(null)
        })
      })

      rl.close()
    })
  })


}


module.exports = {
  installBeanArduinoCore: installBeanArduinoCore
}
