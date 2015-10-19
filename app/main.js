// Electron entry point and Main Process

import ElectronApp from 'app'
import BrowserWindow from 'browser-window'
import LB from './lightblue/lightblue.js'
import ipc from 'ipc'


// Constants
const INDEX = 'index.html'
const GUI_WIDTH = 440
const GUI_HEIGHT = 500

let mainWindow = null

LB.startScanning()

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

  LB.on('discover', (device)=> {
    mainWindow.webContents.send('deviceFound', device.serialize())
  })

  mainWindow.loadUrl(`file://${__dirname}/frontend/${INDEX}`)

  mainWindow.on('closed', function () {
    quit()
  })
})
