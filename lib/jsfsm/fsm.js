'use strict'


class Context {
  constructor() {
    this.states = {}  // override in constructor
    this.state = null
  }

  setState(stateKey) {
    if (!this.states[stateKey]) {
      console.log(`No such state: ${stateKey}`)
      return
    }

    if (this.state) {
      // Make sure this.state is not null, this happens when initializing the first state
      this.state.exitState()
    }

    let nextState = new this.states[stateKey](stateKey, this)  // Initialize new state
    nextState.enterState()
    let oldStateKey = this.state != null ? this.state.key : 'None'
    console.log(`State change: ${oldStateKey} -> ${stateKey}`)
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
