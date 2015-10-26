'use strict'

import React from 'react'
import Store from '../store'

class DeviceView extends React.Component {

  constructor() {
    super()
    this.state = {
      state: Store.store.getDeviceState(),
      device: Store.store.getSelectedDevice(),
      device_information: Store.store.getDeviceInformation()
    }

    // Have to use a fat-arrow so that `this` is bound correctly...
    this._onDeviceStateChange = ()=> {
      this.setState({
        state: Store.store.getDeviceState(),
        device: Store.store.getSelectedDevice(),
        device_information: Store.store.getDeviceInformation()
      })
    }
  }

  componentDidMount() {
    Store.store.addChangeListener(Store.DEVICE_STATE, this._onDeviceStateChange)
  }

  componentWillUnmount() {
    Store.store.removeChangeListener(Store.DEVICE_STATE, this._onDeviceStateChange)
  }

  render() {
    return (
      <div>
        {(() => {
          switch (this.state.state) {
            case Store.STATE_DEVICE_SELECTED:
              return(
                <div className="text-center">
                  <h3>Loading Information...</h3>
                </div>
              )
            case Store.STATE_DEVICE_INFORMATION_READY:
              return(
                <div className="text-center">
                  <h3>Connected!</h3>
                </div>
              )
            default:
              return(
                <div className="text-center">
                  <h3>No Device Selected.</h3>
                </div>
              )
          }
        })()}

        <div className="pull-down">
          <div className="text-center">
            <button className="btn btn-primary">
              Update Firmware
            </button>
          </div>
        </div>
      </div>
    )
  }
}

module.exports = DeviceView
