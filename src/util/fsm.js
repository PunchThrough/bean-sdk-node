'use strict'

const logger = require('./logs').logger


class Context {
  constructor() {
    this.states = {}
    this.state = null
  }

  initStates(states) {
    for (let key in states) {
      if (states.hasOwnProperty(key)) {
        let kls = states[key]
        this.states[key] = new kls(key, this)
      }
    }
  }

  setState(stateKey) {
    let oldState = this.state
    let newState = this.states[stateKey]

    if (oldState === newState) {
      logger.info('Same state transition')
    } else {
      this.state = newState
      let oldStateKey = oldState !== null ? oldState.key : null
      logger.info(`State transition: ${oldStateKey} -> ${newState.key}`)

      if (oldState) {
        oldState.exitState()
      }

      if (this.state) {
        this.state.enterState(oldStateKey)
      }

    }
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
