'use strict'

import React from 'react'

function getSelectedDevice() {
  
}


class DeviceView extends React.Component {

  constructor() {
    super()
    this.state = {
      activeDevice: null
    }
  }

  render() {
    return (
      <div>
        <div className="text-center">
          <h4>No Device Selected</h4>
        </div>

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
