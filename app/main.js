const electron = require('electron')
const {app} = electron
const {BrowserWindow} = electron
const {ipcMain} = electron
const LightBlueSDK = require('./lightblue/lightblue.js')
const devices = require('./lightblue/devices')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
let LB = new LightBlueSDK()

// Constants
const INDEX = 'frontend/index.html'
const WINDOW_WIDTH = 550
const WINDOW_HEIGHT = 400

function quit() {
  /**
   * Quit the application and cleanup
   */

  console.log('Goodbye')
  win = null
  LB.quitGracefully()
  app.quit()  // Call this last!!!
}

function createWindow() {

  win = new BrowserWindow({width: WINDOW_WIDTH, height: WINDOW_HEIGHT})
  win.loadURL(`file://${__dirname}/${INDEX}`)

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })

}

function setup() {
  ipcMain.on('startScanning', (event, args)=> {
    LB.startScanning()
  })

  ipcMain.on('stopScanning', (event, args)=> {
    LB.stopScanning()
  })

  ipcMain.on('clearDevices', (event, args)=> {
    LB.reset()
  })

  ipcMain.on('connectToDevice', (event, uuid)=> {
    let device = LB.getDeviceForUUID(uuid)
    LB.connectToDevice(uuid, (err)=> {
      if (err) {
        console.log(`There was a failure while connecting ${err}`)
      } else {
        console.log(`Connected to Bean (${device.getName()}) successfully`)
        device.lookupServices((err)=> {
          device.getDeviceInformationService().serialize((error, deviceInformation)=> {
            // TODO: Callback hell is occurring, how do we fix the API?!
            win.webContents.send('deviceInformationReady', deviceInformation)
          })
        })
      }
    })
  })

  ipcMain.on('performFirmwareUpdate', (event, uuid)=> {
    let device = LB.getDeviceForUUID(uuid)
    LB.updateFirmware(device, (error)=> {
      // callback for fw complete
      console.log('fw update called back!?')
    })
  })

  LB.on('discover', (device)=> {
    if (device.getType() === devices.DEVICE_TYPE_LIGHT_BLUE) {
      win.webContents.send('deviceFound', device.serialize())
      console.log(device.describe())
    }
  })
}

function startApp() {
  createWindow()
  setup()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', startApp)

// Quit when all windows are closed.
app.on('window-all-closed', () => {

  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    quit()
  }

})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

process.on('SIGINT', function() {
  console.log("Caught interrupt signal")
  quit()
})