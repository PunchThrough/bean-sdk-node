// Electron entry point and Main Process

import ElectronApp from 'app'
import BrowserWindow from 'browser-window'
import LB from './lightblue/lightblue'
import devices from './lightblue/devices'
import FirmwareUpdater from './lightblue/oad'
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

  ipc.on('startScanning', (event, args)=> {
    LB.startScanning()
  })

  ipc.on('stopScanning', (event, args)=> {
    LB.stopScanning()
  })

  ipc.on('clearDevices', (event, args)=> {
    LB.reset()
  })

  ipc.on('connectToDevice', (event, uuid)=> {
    let device = LB.getDeviceForUUID(uuid)
    LB.connectToDevice(uuid, (err)=> {
      if (err) {
        console.log(`There was a failure while connecting ${err}`)
      } else {
        console.log(`Connected to Bean (${device.getName()}) successfully`)
        device.lookupServices((err)=> {
          device.getDeviceInformationService().serialize((error, deviceInformation)=> {
            // TODO: Callback hell is occurring, how do we fix the API?!
            mainWindow.webContents.send('deviceInformationReady', deviceInformation)
          })
        })
      }
    })
  })

  ipc.on('performFirmwareUpdate', (event, uuid)=> {
    let device = LB.getDeviceForUUID(uuid)
    let fwUpdater = new FirmwareUpdater()
    fwUpdater.update(device, (error)=> {
      // callback for fw complete
      console.log('fw update called back!?')
    })
  })

  LB.on('discover', (device)=> {
    if (device.getType() === devices.DEVICE_TYPE_LIGHT_BLUE) {
      mainWindow.webContents.send('deviceFound', device.serialize())
    }
  })

  mainWindow.loadUrl(`file://${__dirname}/frontend/${INDEX}`)

  mainWindow.on('closed', function () {
    quit()
  })

})
