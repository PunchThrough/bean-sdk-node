'use strict'

let BleServices = require('./services/services')
let fs = require('fs')
let path = require('path')
let buffer = require('buffer')
const logger = require('./util/logs').logger

const BLOCK_LENGTH = 16
const FW_HEADER_LENGTH = 12
const MAX_BLOCKS_IN_AIR = 8
const DEBUG = false

// OAD state machine
// - These are states related the "global" OAD state
const OAD_STATE_IN_PROGRESS = 'OAD_STATE_IN_PROGRESS'
const OAD_STATE_NOT_IN_PROGRESS = 'OAD_STATE_NOT_IN_PROGRESS'

// OAD step state machine
// - These are states related to a given "step" of the OAD update process.
//   A new step begins when the Bean power-cycles.
const OAD_STEP_STATE_CHECKING_FW = 'OAD_STEP_STATE_CHECKING_FW'
const OAD_STEP_STATE_OFFERING_FILES = 'OAD_STEP_STATE_OFFERING_FILES'
const OAD_STEP_STATE_BLOCK_XFER = 'OAD_STEP_STATE_BLOCK_XFER'
const OAD_STEP_STATE_REBOOTING = 'OAD_STEP_STATE_REBOOTING'


class FirmwareUpdater {

  constructor(lb) {
    this._lb = lb
    this._fwfiles = []
    this._storedFwVersion = null

    this.resetState(true)
  }

  resetState(init=false) {
    /**
     * Reset or instantiate all FW state
     * TODO: This state is for ONE device, eventually this class should be
     *       capable of updating many devices simultaneously
     */

    this._deviceInProgress = null
    this._completionCallback = null
    this._fileOfferedIndex = -1
    this._currentFwFile = null
    this._lastBlock = 0
    this._totalBlocks = null
    this._fwBeginTime = null
    this._step = null
    this._stateGlobal = OAD_STATE_NOT_IN_PROGRESS
    this._stateStep = null
    this._nextBlock = 0
    this._blockTransferStartTime = null;
    this._force = false

    if (!init) {
      // We don't want to log anything from the constructor
      logger.info("OAD State Machine reset!")
    }

  }

  _fail(err) {
    /**
     * Helper function: call when an error occurs
     */

    logger.info(err)
    this._completionCallback(err)
    fs.closeSync(this._currentFwFile)
    this.resetState()
  }

  _registerNotifications(device) {
    /**
     * Register for notifications on *Block* and *Identify* characteristics
     */

    let oad = device.getOADService()
    oad.registerForNotifications(BleServices.oad.characteristics.IDENTIFY, (data)=> {this._notificationIdentify(data)})
    oad.registerForNotifications(BleServices.oad.characteristics.BLOCK, (data)=> {this._notificationBlock(data)})
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

    let blkNoRequested = buf.readUInt16LE(0, 2)

    if (blkNoRequested === 0) {
      let filename = path.parse(this._fwfiles[this._fileOfferedIndex]).name
      logger.info(`ACCEPTED IMAGE: ${filename}`)
      logger.info('Got request for the first BLOCK of FW')
      this._stateStep = OAD_STEP_STATE_BLOCK_XFER

      // calculate size of image to get total blocks
      let fwFileStats = fs.statSync(this._fwfiles[this._fileOfferedIndex])
      this._totalBlocks = (fwFileStats.size / BLOCK_LENGTH) - 1
      logger.info(`Total blocks: ${this._totalBlocks}`)
      logger.info(`FW file size: ${fwFileStats.size}`)
      this._step += 1
      logger.info(`Starting step #${this._step}!`)
      this._lb.stopScanning()
      this._blockTransferStartTime = Math.round(+new Date() / 1000)
    }

    if (blkNoRequested % 512 === 0)
      logger.info(`Got request for FW block ${blkNoRequested}`)

    if (DEBUG)
      logger.info(`${Math.round(+new Date())} - REQUESTED: ${blkNoRequested}`)

    while (this._stateStep == OAD_STEP_STATE_BLOCK_XFER &&
           this._nextBlock <= this._totalBlocks &&
           this._nextBlock < (blkNoRequested + MAX_BLOCKS_IN_AIR)) {

      // read block from open file
      let fileOffset = this._nextBlock * BLOCK_LENGTH
      let blkBuf = new buffer.Buffer(BLOCK_LENGTH)
      let bytesRead = fs.readSync(this._currentFwFile, blkBuf, 0, BLOCK_LENGTH, fileOffset)
      if (bytesRead != BLOCK_LENGTH) {
        return this._fail('Internal error: failed to read FW file...')
      }

      let blockAddr = new buffer.Buffer(2)
      blockAddr[0] =  this._nextBlock & 0xFF
      blockAddr[1] = (this._nextBlock >> 8) & 0xFF
      let finalBuf = buffer.Buffer.concat([blockAddr, blkBuf])
      this._deviceInProgress.getOADService().writeToBlock(finalBuf, (err)=> {
        if (err)
          logger.info(`Error writing to block char: ${err}`)
      })

      if (DEBUG)
        logger.info(`${Math.round(+new Date())} - SENT: ${this._nextBlock}`)

      this._nextBlock += 1
    }

    if (this._nextBlock > this._totalBlocks) {
      logger.info('Last block Sent')
      let blockEndTime = Math.round(+new Date() / 1000)
      logger.info(`Sent ${this._totalBlocks} in ${blockEndTime - this._blockTransferStartTime} seconds`)
      this._nextBlock = 0  // Reset Back to 0 for new file or done FWU!
      this._fileOfferedIndex = -1  // reset fileOfferedIndex

      this._lb.startScanning()
      this._stateStep = OAD_STEP_STATE_REBOOTING
      logger.info(`Waiting for device to reset: ${this._deviceInProgress.toString()}`)
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

    if (this._fileOfferedIndex != -1) {
      let filepath = this._fwfiles[this._fileOfferedIndex]
      let filename = path.parse(filepath).name
      logger.info('REJECTED IMAGE: %s', filename)
    }

    this._stateStep = OAD_STEP_STATE_OFFERING_FILES

    this._fileOfferedIndex++

    if (this._fileOfferedIndex >= this._fwfiles.length) {
      this._fail("All firmware images have been rejected")
    }

    let filepath = this._fwfiles[this._fileOfferedIndex]
    let filename = path.parse(filepath).name

    let hdrBuf = new buffer.Buffer(FW_HEADER_LENGTH)

    // Read bytes 4-16 from the file (12 bytes total)
    this._currentFwFile = fs.openSync(filepath, 'r')
    let bytesRead = fs.readSync(this._currentFwFile, hdrBuf, 0, FW_HEADER_LENGTH, 4)
    if (bytesRead != FW_HEADER_LENGTH) {
      return this._fail('Internal error: failed to read FW file')
    }

    logger.info(`Offering image: ${filename}`)

    this._deviceInProgress.getOADService().writeToIdentify(hdrBuf, (err)=> {
      if (err)
        logger.info(`Error writing to identify char: ${err}`)
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
    this._stateStep = OAD_STEP_STATE_CHECKING_FW
    dis.getFirmwareVersion((err, fwVersion)=> {
      if (err) {
        callback(err)
      } else {
        let v = fwVersion.toString('utf8').split(' ')[0]
        logger.info(`Comparing firmware versions: Bundle version (${this._storedFwVersion}), Bean version (${v})`)

        if (this._storedFwVersion === v) {
          if (this._force && this._stateGlobal === OAD_STATE_NOT_IN_PROGRESS) {
            logger.info('Versions are the same, but updating anyway')
            callback(null)
          } else {
            callback('Versions are the same, no update needed')
          }
        } else {
          callback(null)
        }

      }
    })
  }

  failedToReconnect() {
    this._fail("Failed to reconnect to device!")
  }

  getState() {
    return {
      accepted_fw_file: this._fwfiles[this._fileOfferedIndex],
      last_block: this._lastBlock,
      total_blocks: this._totalBlocks,
      step: this._step
    }
  }

  isInProgress(device) {
    /**
     * Determine if `device` is in the middle of a FW update procedure
     *
     * @param device a LB Device object
     */

    logger.info('Checking if device is in progress...')

    if (this._deviceInProgress === null) {
      logger.info('No device is in progress!')
      return false
    }

    logger.info(`Current device in progress: ${this._deviceInProgress.toString()}`)
    logger.info(`Questionable device: ${device.toString()}`)
    return device.getAddress() === this._deviceInProgress.getAddress()

  }

  continueUpdate() {
    /**
     * Continue an update procedure for `device` assuming it passes FW version check
     */

    logger.info('Continue update called')

    this._checkFirmwareVersion(this._deviceInProgress, (err)=> {
      if (err) {
        if (this._completionCallback) {
          logger.info(`${err}`)
          logger.info(`FW update COMPLETED for ${this._deviceInProgress.toString()}`)
          let end = Math.round(+new Date() / 1000)
          let sum = end - this._fwBeginTime
          logger.info(`FW update process took ${sum} seconds`)
          this._completionCallback(null, err)  // This should mean we are done!!
          this.resetState()
        } else {
          logger.info(`FW Version Error: ${err}`)
        }

      } else {
        logger.info(`Continuing FW update for device ${this._deviceInProgress.toString()}`)
        this._registerNotifications(this._deviceInProgress)
        this._deviceInProgress.getOADService().triggerIdentifyHeaderNotification()
      }
    })
  }

  beginUpdate(device, bundle, force, callback) {
    /**
     * Begin an update procedure for `device` assuming it passes FW version check
     *
     * @param device A LightBlue device object
     * @param callback A callback function that takes one param, an error
     */

    logger.info('Begin update called')
    this._fwfiles = bundle
    this._force = force
    let filename = path.parse(this._fwfiles[0]).name
    this._storedFwVersion = filename.split('_')[0]

    this._checkFirmwareVersion(device, (err)=> {
      if (err) {
        logger.info(`FW Version Error: ${err}`)
        callback(err)
      } else {
        logger.info(`Starting FW update for device ${device.toString()}`)
        this._stateGlobal = OAD_STATE_IN_PROGRESS
        this._deviceInProgress = device
        this._completionCallback = callback
        this._registerNotifications(device)
        this._fwBeginTime = Math.round(+new Date() / 1000)
        logger.info(`Begin FW @ ${this._fwBeginTime}`)
        device.getOADService().triggerIdentifyHeaderNotification()
      }
    })
  }
}

module.exports = {
  FirmwareUpdater: FirmwareUpdater,
}
