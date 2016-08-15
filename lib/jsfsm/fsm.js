'use strict'

const logger = require('../../app/lightblue/util/logs').logger


class Context {
  constructor() {
    this.states = {}  // override in constructor
    this.state = null
  }

  setState(stateKey) {
    if (!this.states[stateKey]) {
      logger.warn(`No such state: ${stateKey}`)
      return
    }

    if (this.state) {
      // Make sure this.state is not null, this happens when initializing the first state
      this.state.exitState()
    }

    let nextState = new this.states[stateKey](stateKey, this)  // Initialize new state
    let oldStateKey = this.state != null ? this.state.key : 'None'
    logger.info(`State change: ${oldStateKey} -> ${stateKey}`)
    nextState.enterState()
    this.state = nextState
  }

}


class State {
  constructor(key, context) {
    this.key = key
    this.ctx = context
  }

  enterState() {}
  exitState() {}

}


module.exports = {
  Context: Context,
  State: State
}
