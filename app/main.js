// Electron entry point and Main Process

import ElectronApp from 'app'
import BrowserWindow from 'browser-window'
import LB from './lightblue/lightblue'
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
  ElectronApp.quit()
  LB.stopScanning()
}

ElectronApp.on('window-all-closed', function () {
  quit()
})

ElectronApp.on('ready', function () {

  mainWindow = new BrowserWindow({
    width: GUI_WIDTH,
    height: GUI_HEIGHT
  })

  ipc.on('startScanning', (event, args)=> {
    console.log('Starting to scan...')
    LB.startScanning()
  })

  ipc.on('stopScanning', (event, args)=> {
    console.log('No longer scanning...')
    LB.stopScanning()
  })

  LB.on('discover', (device)=> {
    console.log(device)
    mainWindow.webContents.send('deviceFound', device.serialize())
  })

  mainWindow.loadUrl(`file://${__dirname}/frontend/${INDEX}`)

  mainWindow.on('closed', function () {
    quit()
  })
})
