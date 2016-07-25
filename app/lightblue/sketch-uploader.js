const fsm = require('../../lib/jsfsm/fsm')
const logger = require('./util/logs').logger


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

    this._states = {
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
    let serialTransport = this.ctx.getDevice().getSerialTransportService()

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
