'use strict'

let services = require('./services')
let fs = require('fs')
let path = require('path')
let buffer = require('buffer')

const FW_FILES = path.join(__dirname, '..', 'resources')
const BLOCK_LENGTH = 16
const FW_HEADER_LENGTH = 12


// TODO: The following commented out code is a WIP ... may or may not implement
//class FirmwareUpdateProcess {
//  /**
//   * Encapsulation of a single firmware update procedure for a single device
//   */
//
//  constructor(device, files, onComplete) {
//    this._device = device
//    this._files = files
//    this._onComplete = onComplete
//
//    // Some more state
//    this._storedFwVersion = this._fwfiles[0].split('_')[0]
//    this._acceptedFile = null
//    this._fileOfferedIndex = -1
//
//  }
//}

class FirmwareUpdater{

  constructor() {
    this._fwfiles = fs.readdirSync(FW_FILES).sort()  // alphabetized
    this._storedFwVersion = this._fwfiles[0].split('_')[0]

    this.resetState()
  }

  resetState(){
    /**
     * Reset or instantiate all FW state
     * TODO: this state is obviously for ONE device, and this class was designed to update many devices
     */
    console.log('Resetting FW State')
    this._deviceInProgress = null
    this._completionCallback = null
    this._fileOfferedIndex = -1
    this._currentFwFile = null
    this._lastBlock = 0
    this._totalBlocks = null
    this._fwBeginTime = null
  }

  _fail(err) {
    /**
     * Helper function: call when an error occurs
     */

    console.log(err)
    this._completionCallback(err)
    fs.closeSync(this._currentFwFile)
  }

  _registerNotifications(device) {
    /**
     * Register for notifications on *Block* and *Identify* characteristics
     */

    let oad = device.getOADService()
    oad.registerForNotifications(services.UUID_CHAR_OAD_IDENTIFY, (data)=> {this._notificationIdentify(data)})
    oad.registerForNotifications(services.UUID_CHAR_OAD_BLOCK, (data)=> {this._notificationBlock(data)})
  }

  _notificationBlock(buf) {
    /**
     * Callback: received a notification on Block characteristic
     *
     * A notification to this characteristic means the Bean has accepted the most recent
     * firmware file we have offered, which is stored as `this._currentFwFile`. It is now
     * time to start sending blocks of FW to the device.
     *
     * @param buf 2 byte Buffer containing the block number
     */

    let blkNo = buf.readUInt16LE(0, 2)
    this._lastBlock = blkNo

    if (blkNo % 200 === 0)
      console.log(`Got request for FW block #${blkNo}`)

    if (blkNo === 0) {
      console.log('Got request for the first BLOCK of FW')
      // calculate size of image to get total blocks
      let fwFileStats = fs.statSync(path.join(FW_FILES, this._fwfiles[this._fileOfferedIndex]))
      this._totalBlocks = (fwFileStats.size / BLOCK_LENGTH) - 1
      this._fwBeginTime = Math.round(+new Date() / 1000)
      console.log(`First block @ ${this._fwBeginTime}`)
      console.log(`Total blocks: ${this._totalBlocks}`)
      console.log(`FW file size: ${fwFileStats.size}`)
    }

    // read block from open file
    let fileOffset = blkNo * BLOCK_LENGTH
    let blkBuf = new buffer.Buffer(BLOCK_LENGTH)
    let bytesRead = fs.readSync(this._currentFwFile, blkBuf, 0, BLOCK_LENGTH, fileOffset)
    if (bytesRead != BLOCK_LENGTH) {
      return this._fail('Internal error: failed to read FW file')
    }

    let finalBuf = buffer.Buffer.concat([buf, blkBuf])
    this._deviceInProgress.getOADService().writeToBlock(finalBuf, (err)=> {
      if (err)
        console.log(`Error writing to block char: ${err}`)
    })

    if (blkNo === this._totalBlocks) {
      console.log('Last block!!!!!!!')
      let end = Math.round(+new Date() / 1000)
      let sum = end - this._fwBeginTime
      console.log(`Transferred ${this._totalBlocks} in ${sum} seconds`)

      // reset fileOfferedIndex
      this._fileOfferedIndex = -1

      console.log(`Waiting for device to reset: ${this._deviceInProgress.toString()}`)
    }
  }

  _notificationIdentify(buf) {
    /**
     * Callback: received a notification on Identify characteristic
     *
     * Any notification to this characteristic means we should offer the next firmware file
     * in the list. If it accepts, the next notification will be on the Block char.
     *
     * @param buf Unused
     */

    console.log('Notification on IDENTIFY!')

    this._fileOfferedIndex++

    let filename = this._fwfiles[this._fileOfferedIndex]
    let filepath = path.join(FW_FILES, filename)
    let hdrBuf = new buffer.Buffer(FW_HEADER_LENGTH)

    // Read bytes 4-16 from the file (12 bytes total)
    this._currentFwFile = fs.openSync(filepath, 'r')
    let bytesRead = fs.readSync(this._currentFwFile, hdrBuf, 0, FW_HEADER_LENGTH, 4)
    if (bytesRead != FW_HEADER_LENGTH) {
      return this._fail('Internal error: failed to read FW file')
    }

    console.log(`Offering file: ${filename}`)

    this._deviceInProgress.getOADService().writeToIdentify(hdrBuf, (err)=> {
      if (err)
        console.log(`Error writing to identify char: ${err}`)
    })
  }

  _checkFirmwareVersion(device, callback) {
    /**
     * Check that the device needs a FW update by checking it's FW version
     *
     * @param device A LightBlue device object
     * @param callback A callback function that takes one param, an error
     */

    let dis = device.getDeviceInformationService()
    dis.resetCache()
    dis.getFirmwareVersion((err, fwVersion)=> {
      if (err) {
        callback(err)
      } else {
        let v = ''
        if (buffer.Buffer.isBuffer(fwVersion))
          v = fwVersion.toString('utf8').split(' ')[0]
        console.log(`Comparing firmware versions ${this._storedFwVersion} and ${v}`)
        if (this._storedFwVersion === v) {
          callback('Versions are the same, no update needed')
        } else {
          callback(null)
        }
      }
    })
  }

  getState() {
    return {
      accepted_fw_file: this._fwfiles[this._fileOfferedIndex],
      last_block: this._lastBlock,
      total_blocks: this._totalBlocks
    }
  }

  isInProgress(device) {
    /**
     * Determine if `device` is in the middle of a FW update procedure
     *
     * @param device a LB Device object
     */

    console.log('Checking if device is in progress...')
     
    if (this._deviceInProgress === null) {
      console.log('No device is in progress!')
      return false
    }

    console.log(`Current device in progress: ${this._deviceInProgress.toString()}`)
    console.log(`Questionable device: ${device.toString()}`)
    return device.getUUID() === this._deviceInProgress.getUUID();

  }

  continueUpdate() {
    /**
     * Continue an update procedure for `device` assuming it passes FW version check
     */

    console.log('Continue update called')

    this._checkFirmwareVersion(this._deviceInProgress, (err)=> {
      if (err) {
        console.log(`Checking FW version: ${err}`)
        if (this._completionCallback) {
          console.log(`FW update COMPLETED for ${this._deviceInProgress.toString()}`)
          this._deviceInProgress = null
          this._completionCallback(null, err)  // This should mean we are done!!
        }

      } else {
        console.log(`Continuing FW update for device ${this._deviceInProgress.toString()}`)
        this._deviceInProgress.getOADService().triggerIdentifyHeaderNotification()
      }
    })
  }

  beginUpdate(device, callback) {
    /**
     * Begin an update procedure for `device` assuming it passes FW version check
     *
     * @param device A LightBlue device object
     * @param callback A callback function that takes one param, an error
     */

    console.log('Begin update called')

    this._checkFirmwareVersion(device, (err)=> {
      if (err) {
        console.log(`Error checking FW version: ${err}`)
        callback(err)
      } else {
        console.log(`Starting FW update for device ${device.toString()}`)
        this._deviceInProgress = device
        this._completionCallback = callbackwa
        device.setAutoReconnect(true)
        this._registerNotifications(device)
        device.getOADService().triggerIdentifyHeaderNotification()
      }
    })
  }
}

module.exports = FirmwareUpdater
