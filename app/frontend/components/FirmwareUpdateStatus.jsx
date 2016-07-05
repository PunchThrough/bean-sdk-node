'use strict'

let React = require('react')
let actions = require('../actions/device-actions')

class FirmwareUpdateStatus extends React.Component {

  constructor() {
    super()

    this.state = {
      state: null,
      accepted_fw_file: null

    }

    this._updateFirmware = ()=> {
      actions.Actions.performFirmwareUpdate(this.props.device.uuid)
    }
  }

  render() {
    return (
      <div className="pull-down fw-update-status">
        No Update In Progress

        <div className="dropdown pull-down">
          <button className="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
            Actions
            <span className="caret"></span>
          </button>
          <ul className="dropdown-menu" aria-labelledby="dropdownMenu1">
            <li><a href="#">Update Firmware</a></li>
            <li><a href="#">Upload Sketch</a></li>
          </ul>
        </div>


      </div>
    )
  }
}

module.exports = FirmwareUpdateStatus
