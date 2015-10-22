// Electron entry point and Main Process

import ElectronApp from 'app'
import BrowserWindow from 'browser-window'
import LB from './lightblue/lightblue'
import devices from './lightblue/devices'
import ipc from 'ipc'

// Constants
const INDEX = 'index.html'
const GUI_WIDTH = 550
const GUI_HEIGHT = 400

let mainWindow = null

function quit() {
  /**
   * Quit the application and cleanup
   */

  console.log('Goodbye')
  mainWindow = null
  LB.quitGracefully()
  ElectronApp.quit()  // Call this last!!!
}

ElectronApp.on('window-all-closed', function () {
  quit()
})

ElectronApp.on('ready', function () {

  mainWindow = new BrowserWindow({
    width: GUI_WIDTH,
    height: GUI_HEIGHT
  })

  ipc.on('startScanning', (event, args) => {
    console.log('Starting to scan...')
    LB.startScanning()
  })

  ipc.on('stopScanning', (event, args) => {
    console.log('No longer scanning...')
    LB.stopScanning()
  })

  ipc.on('connectToDevice', (event, uuid) => {
    LB.stopScanning()
    let device = LB.getDeviceForUUID(uuid)
    if (device) {
      device.connect((err)=> {
        if (err) {
          console.log(`There was a failure while connecting ${err}`)
        } else {
          console.log(`Connected to Bean (${device.getName()}) successfully`)
          device.getServices()
        }
      })
    }
  })

  LB.on('discover', (device) => {
    console.log(device.toString())
    if (device.getType() === devices.DEVICE_TYPE_LIGHT_BLUE) {
      mainWindow.webContents.send('deviceFound', device.serialize())
    } else {
    }
  })

  mainWindow.loadUrl(`file://${__dirname}/frontend/${INDEX}`)

  mainWindow.on('closed', function () {
    quit()
  })

})
