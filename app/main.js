// Electron entry point and Main Process

import ElectronApp from 'app'
import BrowserWindow from 'browser-window'
import LB from './lightblue/lightblue.js'

LB.startScanning()
LB.on('discover', (device)=> {
  console.log(device)
})

var mainWindow = null

ElectronApp.on('window-all-closed', function () {
  if (process.platform != 'darwin') {
    ElectronApp.quit()
  }
})

ElectronApp.on('ready', function () {
  mainWindow = new BrowserWindow({width: 800, height: 600})
  mainWindow.loadUrl('file://' + __dirname + '/index.html')
  mainWindow.on('closed', function () {
    mainWindow = null
  })
})
