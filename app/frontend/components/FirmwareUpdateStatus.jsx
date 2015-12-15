'use strict'

let React = require('react')
let actions = require('../actions')

class FirmwareUpdateStatus extends React.Component {

  constructor() {
    super()

    this._updateFirmware = ()=> {
      actions.Actions.performFirmwareUpdate(this.props.device.uuid)
    }
  }

  render() {
    return (
      <div className="pull-down fw-update-status">
        No Update In Progress

        <div className="text-center pull-down">
          <button
            className="btn btn-primary"
            onClick={this._updateFirmware}
          >
            Update Firmware
          </button>
        </div>
      </div>
    )
  }
}

module.exports = FirmwareUpdateStatus
