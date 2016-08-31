'use strict'


const fs = require('fs-extra')
const os = require('os')
const spawn = require('child_process').spawn
const paths = require('../../util/paths')
const platform = require('../../util/platform')
const path = require('path')
const readline = require('readline')


const COMPILED_SKETCH_LOCATION = path.join(platform.userHome(), '.beansketches')


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})


function arduinoHardwarePath(arduinoFolder) {
  let fnMap = {}
  fnMap[platform.OSX] = ()=> {
    return path.join(arduinoFolder, 'Contents', 'java', 'hardware', 'LightBlue-Bean')
  }
  fnMap[platform.WINDOWS] = ()=> {
    return path.join(arduinoFolder, 'hardware', 'LightBlue-Bean')
  }
  return platform.runFunction(fnMap)
}



function arduinoExamplesPath(arduinoFolder) {
  let fnMap = {}
  fnMap[platform.OSX] = ()=> {
    return path.join(arduinoFolder, 'Contents', 'java', 'examples', 'LightBlue-Bean')
  }
  fnMap[platform.WINDOWS] = ()=> {
    return path.join(arduinoFolder, 'examples', 'LightBlue-Bean')
  }
  return platform.runFunction(fnMap)
}


function openArduinoApp(arduinoInstallPath, callback) {

  try {
    fs.accessSync(arduinoInstallPath)
  } catch (e) {
    throw new Error(`Path does not exist: ${arduinoInstallPath}`)
  }

  if (process.platform == platform.WINDOWS) {
    console.log(`Please manually open ${arduinoInstallPath}\\arduino.exe at least once`)
    callback()
    return
  }

  if (arduinoInstallPath.endsWith('/')) {
    arduinoInstallPath = arduinoInstallPath.slice(0, -1)
  }

  let fnMap = {}
  fnMap[platform.OSX] = ()=> {return ['open', [arduinoInstallPath]]}
  let result = platform.runFunction(fnMap)
  let program = result[0]
  let args = result[1]

  platform.cli(program, args, ()=> {
    console.log('Arduino app opened successfully')
    callback()
  })
}


function unzip(tarball, location, callback) {
  let fnMap = {}
  fnMap[platform.OSX] = ()=> {return ['tar', ['-xzvf', tarball, '-C', location]]}
  let result = platform.runFunction(fnMap)
  let program = result[0]
  let args = result[1]

  platform.cli(program, args, ()=> {
    callback(path.join(location, 'bean-arduino-core'))
  })
}


function createConfigFile(userHome, compiledSketchLocation) {

  // TODO: Finish me, for now we are hardcoding compiledSketchLocation
  let beanConfigFolder = path.join(userHome, 'bean')
  let beanConfigFile = path.join(beanConfigFolder, 'bean-sdk.cfg')
  fs.mkdirsSync(beanConfigFolder)
  let jsonOut = `{"arduino_config_file": "${compiledSketchLocation}"}${platform.lineEnding()}`
  fs.writeFileSync(beanConfigFile, jsonOut)
}


function installBeanArduinoCore(completedCallback) {

  let fnMap = {}
  fnMap[platform.OSX] = ()=> {return '/Applications/Arduino.app/'}
  fnMap[platform.WINDOWS] = ()=> {return 'C:\\Program Files(x86)\\Arduino\\'}
  let example = platform.runFunction(fnMap)

  rl.question(`Where is Arduino core installed? (ex. ${example})\nPath:`, (arduinoInstallPath) => {
    openArduinoApp(arduinoInstallPath, ()=> {
      let beanArduinoCore = paths.getResource('bean-arduino-core-2.0.0')

      // Make sure COMPILED_BEAN_LOCATION exists
      fs.mkdirsSync(COMPILED_SKETCH_LOCATION)

      // Install bean-arduino-core
      let arduinoHardwareFolder = arduinoHardwarePath(arduinoInstallPath)
      let beanCoreHardwareFolder = path.join(beanArduinoCore, 'hardware', 'LightBlue-Bean')
      fs.mkdirsSync(arduinoHardwareFolder)
      fs.copySync(beanCoreHardwareFolder, arduinoHardwareFolder)

      // Install examples
      let arduinoExamplesFolder = arduinoExamplesPath(arduinoInstallPath)
      let beanCoreExamplesFolder = path.join(beanArduinoCore, 'examples', 'LightBlue-Bean')
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
      rl.close()
    })
  })


}


module.exports = {
  installBeanArduinoCore: installBeanArduinoCore
}
