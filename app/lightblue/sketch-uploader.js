const fsm = require('../../lib/jsfsm/fsm')
const logger = require('./util/logs').logger
const util = require('./util/util')
const commandIds = require('./command-definitions').commandIds


const STATE_INACTIVE = 'STATE_INACTIVE'
const STATE_AWAIT_READY = 'STATE_AWAIT_READY'
const STATE_BLOCK_TRANSFER = 'STATE_BLOCK_TRANSFER'
const STATE_AWAIT_COMPLETED = 'STATE_AWAIT_COMPLETED'
const STATE_COMPLETED = 'STATE_COMPLETED'


class SketchUploader {
  constructor() {
    this._process = null
  }

  beginUpload(device, sketchBuf, sketchName, callback) {
    this._process = new UploadProcess(device, sketchBuf, sketchName, callback)
    this._process.start()
  }

}


class UploadProcess extends fsm.Context {
  constructor(device, sketchBuf, sketchName, callback) {
    super()

    this._device = device
    this._sketchBuf = sketchBuf
    this._sketchName = sketchName
    this._callback = callback

    this.states = {
      STATE_INACTIVE: StateInactive,
      STATE_AWAIT_READY: StateAwaitReady,
      STATE_BLOCK_TRANSFER: StateBlockTransfer,
      STATE_AWAIT_COMPLETED: StateAwaitCompleted,
      STATE_COMPLETED: StateCompleted
    }

    this.setState(STATE_INACTIVE)
  }

  start() {
    logger.info(`Beginning sketch upload of sketch: ${this._sketchName}`)
    this.setState(STATE_AWAIT_READY)
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
}


class SketchUploadState extends fsm.State {

  enterState() {}  // Override if needed

  exitState() {}  // Override if needed

}


class StateInactive extends SketchUploadState {

}


class StateAwaitReady extends SketchUploadState {
  enterState() {
    let sketchBuf = this.ctx.getSketchBuffer()
    let sketchName = this.ctx.getSketchName()
    let serialTransport = this.ctx.getDevice().getSerialTransportService()
    let cmdArgs = [
      sketchBuf.length,              // hex size
      util.crc16(sketchBuf),         // hex crc
      new Date().getTime() / 1000,   // unix timestamp
      sketchName.length,             // sketch name size
      sketchName                     // sketch name
    ]
    serialTransport.sendCommand(commandIds.BL_CMD_START, cmdArgs)
  }
}


class StateBlockTransfer extends SketchUploadState {

}


class StateAwaitCompleted extends SketchUploadState {

}


class StateCompleted extends SketchUploadState {

}


module.exports = {
  SketchUploader: SketchUploader
}
