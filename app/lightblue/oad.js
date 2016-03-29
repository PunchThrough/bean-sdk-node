'use strict'

let services = require('./services')
let fs = require('fs')
let path = require('path')
let buffer = require('buffer')

const FW_VERSION = '20160328'
const FW_FILES = path.join(__dirname, '..', 'resources', 'firmware_bundles', FW_VERSION)
const BLOCK_LENGTH = 16
const FW_HEADER_LENGTH = 12

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

const PKT_DIFF_PER_SENT_AND_REQUESTED = 8


class FirmwareUpdater {

  constructor(lb) {
    this._lb = lb  // Dirty hack, this is technically a circular dependency
    this._fwfiles = fs.readdirSync(FW_FILES).sort()  // alphabetized
    this._storedFwVersion = this._fwfiles[0].split('_')[0]

    this.resetState()
  }

  resetState() {
    /**
     * Reset or instantiate all FW state
     * TODO: This state is for ONE device, eventually this class should be
     *       capable of updating many devices simultaneously
     */
    console.log('Resetting FW State')
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
    this._nextBlockNoToSent = 0
  }

  _fail(err) {
    /**
     * Helper function: call when an error occurs
     */

    console.log(err)
    this._completionCallback(err)
    fs.closeSync(this._currentFwFile)
    this.resetState()
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

    let blkNoRequested = buf.readUInt16LE(0, 2)

    while (this._nextBlockNoToSent < (blkNoRequested + PKT_DIFF_PER_SENT_AND_REQUESTED) && this._stateStep != OAD_STEP_STATE_REBOOTING )
    {
      let blkDifference = PKT_DIFF_PER_SENT_AND_REQUESTED - (this._nextBlockNoToSent - blkNoRequested)
      //console.log('_nextBlockNoToSent = %s, block requested = %s, block diff = %s',this._nextBlockNoToSent, blkNoRequested,  blkDifference )
      let blkNo = this._nextBlockNoToSent

      if (blkNo % 512 === 0)
        console.log(`Got request for FW block #${blkNo} or %s`, blkNo*BLOCK_LENGTH)

      if (blkNo === 0) {
        console.log('ACCEPTED IMAGE: %s', this._fwfiles[this._fileOfferedIndex])
        console.log('Got request for the first BLOCK of FW')
        this._stateStep = OAD_STEP_STATE_BLOCK_XFER

        // calculate size of image to get total blocks
        let fwFileStats = fs.statSync(path.join(FW_FILES, this._fwfiles[this._fileOfferedIndex]))
        this._totalBlocks = (fwFileStats.size / BLOCK_LENGTH) - 1
        console.log(`Total blocks: ${this._totalBlocks}`)
        console.log(`FW file size: ${fwFileStats.size}`)
        this._step += 1
        console.log(`Starting step #${this._step}!`)
        this._lb.stopScanning()
      }
      else {
          //console.log('FAILE--D IMAGE: %s', this._currentFwFile)
      }

      // read block from open file
      let fileOffset = blkNo * BLOCK_LENGTH
      let blkBuf = new buffer.Buffer(BLOCK_LENGTH)
      let bytesRead = fs.readSync(this._currentFwFile, blkBuf, 0, BLOCK_LENGTH, fileOffset)
      if (bytesRead != BLOCK_LENGTH) {
        return this._fail('Internal error: failed to read FW file...')
      }
      //Kianoosh: Begin
      let blockAddr = new buffer.Buffer(2)
      blockAddr[0] =  blkNo & 0xFF
      blockAddr[1] = (blkNo >> 8) & 0xFF
      let finalBuf = buffer.Buffer.concat([blockAddr, blkBuf])
      this._deviceInProgress.getOADService().writeToBlock(finalBuf, (err)=> {
        if (err)
          console.log(`Error writing to block char: ${err}`)
      })

      if (blkNo === this._totalBlocks) {
        console.log('Last block!')
        this._nextBlockNoToSent = 0 // Reset Back to 0 for new file or done FWU!
        // reset fileOfferedIndex
        this._fileOfferedIndex = -1

        this._lb.startScanning()
        this._stateStep = OAD_STEP_STATE_REBOOTING
        console.log(`Waiting for device to reset: ${this._deviceInProgress.toString()}`)
      }
      else {
        this._nextBlockNoToSent += 1
      }
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
      console.log('REJECTED IMAGE: %s', this._fwfiles[this._fileOfferedIndex])
    }

    this._stateStep = OAD_STEP_STATE_OFFERING_FILES

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

    console.log(`Offering image: ${filename}`)
    //Kianoosh: Begin
    console.log(hdrBuf.toString('hex'))
    console.log('Kianoosh: Header[0]: %s', hdrBuf[0])
    console.log('Kianoosh: Header[1]: %x', hdrBuf[1])
    console.log('Kianoosh: Header[2]: %x', hdrBuf[2])
    console.log('Kianoosh: Header[3]: %x', hdrBuf[3])
    console.log('Kianoosh: Header[4]: %s', hdrBuf[4])
    console.log('Kianoosh: Header[5]: %x', hdrBuf[5])
    console.log('Kianoosh: Header[6]: %x', hdrBuf[6])
    console.log('Kianoosh: Header[7]: %x', hdrBuf[7])

    //Kianoosh: End
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
    this._stateStep = OAD_STEP_STATE_CHECKING_FW
    dis.getFirmwareVersion((err, fwVersion)=> {
      if (err) {
        callback(err)
      } else {
        let v = ''
        if (buffer.Buffer.isBuffer(fwVersion))
          v = fwVersion.toString('utf8').split(' ')[0]
        console.log(`Comparing firmware versions stored version ${this._storedFwVersion} and Read Version ${v}`)
        if (this._storedFwVersion === v && this._deviceInProgress != null) {
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

    console.log('Checking if device is in progress...')

    if (this._deviceInProgress === null) {
      console.log('No device is in progress!')
      return false
    }

    console.log(`Current device in progress: ${this._deviceInProgress.toString()}`)
    console.log(`Questionable device: ${device.toString()}`)
    return device.getUUID() === this._deviceInProgress.getUUID()

  }

  continueUpdate() {
    /**
     * Continue an update procedure for `device` assuming it passes FW version check
     */

    console.log('Continue update called')

    this._checkFirmwareVersion(this._deviceInProgress, (err)=> {
      if (err) {
        if (this._completionCallback) {
          console.log(`${err}`)
          console.log(`FW update COMPLETED for ${this._deviceInProgress.toString()}`)
          let end = Math.round(+new Date() / 1000)
          let sum = end - this._fwBeginTime
          console.log(`FW update process took ${sum} seconds`)
          this._completionCallback(null, err)  // This should mean we are done!!
          this.resetState()
        } else {
          console.log(`FW Version Error: ${err}`)
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
        console.log(`FW Version Error: ${err}`)
        callback(err)
      } else {
        console.log(`Starting FW update for device ${device.toString()}`)
        this._stateGlobal = OAD_STATE_IN_PROGRESS
        this._deviceInProgress = device
        this._completionCallback = callback
        device.setAutoReconnect(true)
        this._registerNotifications(device)
        this._fwBeginTime = Math.round(+new Date() / 1000)
        console.log(`Begin FW @ ${this._fwBeginTime}`)
        device.getOADService().triggerIdentifyHeaderNotification()
      }
    })
  }
}

module.exports = FirmwareUpdater
