const fsm = require('./util/fsm')
const logger = require('./util/logs').logger
const util = require('./util/util')
const commandIds = require('./command-definitions').commandIds
const buffer = require('buffer')
const timers = require('timers')


const BLOCK_SIZE = 64

// Sketch Uploader states
const STATE_INACTIVE = 'STATE_INACTIVE'
const STATE_AWAIT_READY = 'STATE_AWAIT_READY'
const STATE_BLOCK_TRANSFER = 'STATE_BLOCK_TRANSFER'
const STATE_COMPLETED = 'STATE_COMPLETED'

// Bean States
const BEAN_STATE_READY = 2
const BEAN_STATE_PROGRAMMING = 3
const BEAN_STATE_VERIFY = 4
const BEAN_STATE_COMPLETE = 5
const BEAN_STATE_ERROR = 6

// Bean Sub-state
const BEAN_SUBSTATE_INIT = 0
const BEAN_SUBSTATE_WRITE_ADDRESS = 1
const BEAN_SUBSTATE_WRITE_ADDRESS_ACK = 2
const BEAN_SUBSTATE_WRITE_CHUNK = 3
const BEAN_SUBSTATE_WRITE_CHUNK_ACK = 4
const BEAN_SUBSTATE_READ_ADDRESS = 5
const BEAN_SUBSTATE_READ_ADDRESS_ACK = 6
const BEAN_SUBSTATE_READ_CHUNK = 7
const BEAN_SUBSTATE_READ_CHUNK_ACK = 8
const BEAN_SUBSTATE_VERIFY = 9
const BEAN_SUBSTATE_DONE = 10
const BEAN_SUBSTATE_DONE_ACK = 11
const BEAN_SUBSTATE_START = 12
const BEAN_SUBSTATE_START_ACK = 13
const BEAN_SUBSTATE_HELLO = 14
const BEAN_SUBSTATE_HELLO_ACK = 15
const BEAN_SUBSTATE_START_RSTAGAIN = 16
const BEAN_SUBSTATE_DONE_RESET = 17
const BEAN_SUBSTATE_PROG_MODE = 18
const BEAN_SUBSTATE_PROG_MODE_ACK = 19
const BEAN_SUBSTATE_DEVICE_SIG = 20
const BEAN_SUBSTATE_DEVICE_SIG_ACK = 21
const BEAN_SUBSTATE_WRITE_CHUNK_TWO = 22
const BEAN_SUBSTATE_ERROR = 23


class SketchUploader {
  constructor() {
    this._process = null
  }

  beginUpload(device, sketchBuf, sketchName, promptUser, callback) {
    this._process = new UploadProcess(device, sketchBuf, sketchName, promptUser, callback)
    this._process.start()
  }

}


class UploadProcess extends fsm.Context {
  constructor(device, sketchBuf, sketchName, promptUser, callback) {
    super()

    this._device = device
    this._sketchBuf = sketchBuf
    this._sketchName = sketchName
    this._promptUser = promptUser
    this._callback = callback

    this.initStates({
      STATE_INACTIVE: StateInactive,
      STATE_AWAIT_READY: StateAwaitReady,
      STATE_BLOCK_TRANSFER: StateBlockTransfer,
      STATE_COMPLETED: StateCompleted
    })

    this.setState(STATE_INACTIVE)
  }

  _statusCommandReceived(status) {
    logger.debug(`New Bean State: ${status.state}`)
    if (status.state === BEAN_STATE_ERROR) {
      let out = `Bean sketch upload error!\n`
      out += `    Sub state: ${status.substate}\n`
      out += `    Blocks sent: ${status.blocks_sent}\n`
      out += `    Bytes sent: ${status.bytes_sent}`
      logger.error(out)
      this.state.eventBeanError(status.substate)
    } else {
      this.state.eventBeanState(status.state)
    }

  }

  start() {
    logger.info(`Beginning sketch upload of sketch: ${this._sketchName}`)
    let serialTransport = this._device.getSerialTransportService()
    serialTransport.registerForCommandNotification(
      commandIds.BL_STATUS,
      (statusCommand) => this._statusCommandReceived(statusCommand))
    this.setState(STATE_AWAIT_READY)
  }

  shouldPromptUser() {
    return this._promptUser
  }

  getDevice() {
    return this._device
  }

  getSketchBuffer() {
    return this._sketchBuf
  }

  getSketchName() {
    return this._sketchName
  }

  complete(error) {
    this._callback(error)
  }
}


class SketchUploadState extends fsm.State {

  // Override any methods in subclasses
  enterState(previousState) {}
  exitState() {}
  eventBeanState(state) {}
  eventBeanError(substate) {}

}


class StateInactive extends SketchUploadState {
  enterState(previousState) {
    if (previousState) {
      if (previousState === STATE_COMPLETED) {
        // Sketch completed successfully
        logger.info('Sketch completed successfully!')
        this.ctx.complete(null)
      } else {
        // Sketch upload error
        logger.error('Sketch upload error!')
        this.ctx.complete('Sketch upload failed')
      }
    }
  }
}


class StateAwaitReady extends SketchUploadState {

  enterState(previousState) {
    let serialTransport = this.ctx.getDevice().getSerialTransportService()
    let sketchBuf = this.ctx.getSketchBuffer()
    let sketchName = this.ctx.getSketchName()

    let cmdArgs = [
      sketchBuf.length,              // hex size
      util.crc16(sketchBuf),         // hex crc
      new Date().getTime() / 1000,   // unix timestamp
      sketchName.length,             // sketch name size
      sketchName                     // sketch name
    ]

    if (this.ctx.shouldPromptUser()) {
      util.userInput.question(`Press ENTER to begin upload:\n`, () => {
        logger.info('Sketch upload started!')
        serialTransport.sendCommand(commandIds.BL_CMD_START, cmdArgs)
      })
    } else {
      logger.info('Sketch upload started!')
      serialTransport.sendCommand(commandIds.BL_CMD_START, cmdArgs)
    }

  }

  eventBeanState(state) {
    if (state == BEAN_STATE_READY) {
      this.ctx.setState(STATE_BLOCK_TRANSFER)
    } else {
      logger.error(`Unexpected Bean sketch state: ${state}`)
      this.ctx.setState(STATE_INACTIVE)
    }
  }

}


class StateBlockTransfer extends SketchUploadState {

  _sendBlock() {
    logger.info(`Sending Bean sketch block: ${this._blocksSent}/${this._totalBlocks - 1}`)
    let blockStart = this._blocksSent * BLOCK_SIZE
    let blockEnd = blockStart + BLOCK_SIZE
    if (blockEnd > this._sketchBuffer.length) {
      blockEnd = this._sketchBuffer.length
    }
    let blockBuffer = this._sketchBuffer.slice(blockStart, blockEnd)
    this._serialTransport.sendCommand(commandIds.BL_FW_BLOCK, [blockBuffer])
    if (blockEnd == this._sketchBuffer.length) {
      clearInterval(this._blockTimer)
    } else {
      this._blocksSent++
    }
  }

  enterState(previousState) {
    this._serialTransport = this.ctx.getDevice().getSerialTransportService()
    this._sketchBuffer = this.ctx.getSketchBuffer()
    this._totalBlocks = Math.ceil(this._sketchBuffer.length / BLOCK_SIZE)
    this._blocksSent = 0
    this._blockTimer = timers.setInterval(()=> {this._sendBlock()}, 200)
  }

  eventBeanState(state) {
    if (state === BEAN_STATE_COMPLETE) {
      this.ctx.setState(STATE_COMPLETED)
      return
    }

    if (state !== BEAN_STATE_PROGRAMMING) {
      logger.error(`Unexpected Bean sketch state: ${state}`)
      this.ctx.setState(STATE_INACTIVE)
    }
  }

  eventBeanError(substate) {
    clearInterval(this._blockTimer)
    this.ctx.setState(STATE_INACTIVE)
  }

}


class StateCompleted extends SketchUploadState {
  enterState(previousState) {
    logger.info('Sketch upload complete!')
    this.ctx.setState(STATE_INACTIVE)
  }
}


module.exports = {
  SketchUploader: SketchUploader
}
