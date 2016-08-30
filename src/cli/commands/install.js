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

const COMPILED_SKETCH_LOCATION = path.join(getUserHome(), '.beansketches')


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

  if (!fs.existsSync(arduinoInstallPath)) {
    throw new Error(`Path does not exist: ${arduinoInstallPath}`)
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


function getUserHome() {
  return process.env[(process.platform == PLATFORM_WINDOWS) ? 'USERPROFILE' : 'HOME'];
}


function lineEnding() {
  if (process.platform == PLATFORM_WINDOWS) {
    return '\r\n'
  } else {
    return '\n'
  }
}


function createConfigFile(userHome, compiledSketchLocation) {

  // TODO: Finish me, for now we are hardcoding compiledSketchLocation
  let beanConfigFolder = path.join(userHome, 'bean')
  let beanConfigFile = path.join(beanConfigFolder, 'bean-sdk.cfg')
  fs.mkdirsSync(beanConfigFolder)
  let jsonOut = `{"arduino_config_file": "${compiledSketchLocation}"}${lineEnding()}`
  fs.writeFileSync(beanConfigFile, jsonOut)
}


function installBeanArduinoCore(completedCallback) {

  let fnMap = {}
  fnMap[PLATFORM_OSX] = ()=> {return '/Applications/Arduino.app/'}
  fnMap[PLATFORM_WINDOWS] = ()=> {return 'C://Program Files(x86)/Arduino/'}
  let example = platformSpecificFn(fnMap)

  rl.question(`Where is Arduino core installed? (ex. ${example})\nPath:`, (arduinoInstallPath) => {
    openArduinoApp(arduinoInstallPath, ()=> {
      let beanArduinoCoreTarball = paths.getResource('bean-arduino-core-2.0.0.tar.gz')
      unzip(beanArduinoCoreTarball, os.tmpdir(), (unzippedPath)=> {

        // Make sure COMPILED_BEAN_LOCATION exists
        fs.mkdirsSync(COMPILED_SKETCH_LOCATION)

        // Install bean-arduino-core
        let arduinoHardwareFolder = path.join(arduinoInstallPath, 'Contents', 'java', 'hardware', 'LightBlue-Bean')
        let beanCoreHardwareFolder = path.join(unzippedPath, 'hardware', 'LightBlue-Bean')
        fs.mkdirsSync(arduinoHardwareFolder)
        fs.copySync(beanCoreHardwareFolder, arduinoHardwareFolder)

        // Install examples
        let arduinoExamplesFolder = path.join(arduinoInstallPath, 'Contents', 'java', 'examples', 'LightBlue-Bean')
        let beanCoreExamplesFolder = path.join(unzippedPath, 'examples', 'LightBlue-Bean')
        fs.mkdirsSync(arduinoExamplesFolder)
        fs.copySync(beanCoreExamplesFolder, arduinoExamplesFolder)

        // Install post_compile script
        let arduinoToolsFolder = path.join(arduinoInstallPath, 'Contents', 'java', 'hardware', 'tools', 'bean')
        let arduinoPostCompilePath = path.join(arduinoToolsFolder, 'post_compile')
        let localPostCompilePath = paths.getResource('post_compile')
        fs.mkdirsSync(arduinoToolsFolder)
        fs.copySync(localPostCompilePath, arduinoPostCompilePath)

        console.log('Bean Arduino core installed.')
        completedCallback(null)
      })

      rl.close()
    })
  })


}


module.exports = {
  installBeanArduinoCore: installBeanArduinoCore
}
