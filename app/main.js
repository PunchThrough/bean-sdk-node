// Electron entry point and Main Process

import ElectronApp from 'app'

var electronApp = require('app')
var BrowserWindow = require('browser-window')

var sdk = require('./lightblue/lightblue')

var mainWindow = null

electronApp.on('window-all-closed', function () {
  if (process.platform != 'darwin') {
    electronApp.quit()
  }
})

electronApp.on('ready', function () {
  mainWindow = new BrowserWindow({width: 800, height: 600})
  mainWindow.loadUrl('file://' + __dirname + '/index.html')
  mainWindow.openDevTools()
  mainWindow.on('closed', function () {
    mainWindow = null
  })
})
