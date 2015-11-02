'use strict'

import services from './services'
import fs from 'fs'
import path from 'path'
import buffer from 'buffer'

const FW_FILES = path.join(__dirname, '..', 'resources')

class FirmwareUpdater{

  constructor() {
    this._fwfiles = fs.readdirSync(FW_FILES).sort()  // alphabetized
    this._storedFwVersion = this._fwfiles[0].split('_')[0]

    // State
    // TODO: this state is obviously for ONE device, and this class was designed to update many devices
    this._deviceInProgress = null
    this._completionCallback = null
    this._fileOfferedIndex = -1
  }

  _loadFwFiles() {
    /**
     * Load all of the files into Buffers in memory
     */
  }

  _registerNotifications(device) {
    let oad = device.getOADService()
    oad.registerForNotifications(services.UUID_CHAR_OAD_IDENTIFY, (data)=> {this._notificationIdentify(data)})
    oad.registerForNotifications(services.UUID_CHAR_OAD_BLOCK, (data)=> {this._notificationBlock(data)})
  }

  _openAndReadFile

  _getNextBlock(blkNo) {
    let offset = blkNo * 16

  }

  _notificationBlock(buf) {
    //let blkNo = buf.readUInt16LE(0, 2)

  }

  _notificationIdentify(buf) {
    // Any notification on this attribute means offer the next file
    this._fileOfferedIndex++
    this._offerFile(this._deviceInProgress, this._fileOfferedIndex)
  }

  _checkFirmwareVersion(device, callback) {
    /**
     * Check that the device needs a FW update by checking it's FW version
     *
     * @param device A LightBlue device object
     * @param callback A callback function that takes one param, an error
     */

    let dis = device.getDeviceInformationService()
    dis.getFirmwareVersion((err, fwVersion)=> {
      if (err) {
        callback(err)
      } else {
        if (this._storedFwVersion == fwVersion) {
          let err = 'Versions are the same, no update needed'
          callback(err)
        } else {
          callback(null)
        }
      }
    })
  }

  _offerFile(device, idx) {
    let filename = this._fwfiles[idx]
    let filepath = path.join(FW_FILES, filename)
    let fd = fs.openSync(filepath, 'r')
    let buf = new buffer.Buffer(12)

    // Read bytes 4-16 from the file (12 bytes total)
    let bytesRead = fs.readSync(fd, buf, 0, 12, 4)
    if (bytesRead != 12) {
      this._completionCallback('Internal error: failed to read FW file')
      return
    }
    fs.closeSync(fd)

    console.log(`Offering file: ${filename}`)

    let oad = device.getOADService()
    oad.writeToIdentify(buf, ()=> {
      console.log('Write CB!!')
    })
  }

  _begin(device, callback) {
    console.log(`Updating firmware for LightBlue device: ${device.getName()}`)

    // Remember that this device is in the middle of a FW update
    this._deviceInProgress = device
    this._completionCallback = callback

    // Auto reconnect to this device when it reboots
    device.setAutoReconnect(true)

    // Register for notifications
    this._registerNotifications(device)

    // Start update process
    let oad = device.getOADService()
    oad.triggerIdentifyHeaderNotification()
  }

  update(device, callback) {
    /**
     * Potentially start or continue updating a devices firmware
     *
     * @param device A LightBlue device object
     * @param callback A callback function that takes one param, an error
     */

    console.log(`Starting FW update process for device: ${device.getName()}`)
    this._checkFirmwareVersion(device, (err)=> {
      if (err) {
        console.log(`Error checking FW version: ${err}`)
        callback(err)
      } else {
        this._begin(device, callback)
      }
    })
  }
}


module.exports = FirmwareUpdater
