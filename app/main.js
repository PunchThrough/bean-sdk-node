// Electron entry point and Main Process

import ElectronApp from 'app'
import BrowserWindow from 'browser-window'
import LB from './lightblue/lightblue.js'
import ipc from 'ipc'

var mainWindow = null

LB.startScanning()

function quit() {
  console.log('Goodbye')
  mainWindow = null
  ElectronApp.quit()
  LB.stopScanning()
}

ElectronApp.on('window-all-closed', function () {
  quit()
})

ElectronApp.on('ready', function () {
  mainWindow = new BrowserWindow({width: 800, height: 600})

  LB.on('discover', (device)=> {
    mainWindow.webContents.send('deviceFound', device.serialize())
  })

  mainWindow.loadUrl('file://' + __dirname + '/index.html')

  mainWindow.on('closed', function () {
    quit()
  })
})
