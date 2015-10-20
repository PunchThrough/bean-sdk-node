import React from 'react'
import BeanList from './BeanList'
import actions from '../actions'

class App extends React.Component {

  constructor() {
    super()
  }

  _refreshDeviceList() {
    actions.Actions.refreshDeviceList()
  }

  render() {
    return (
      <div className="window">

        <div className="window-content">
          <BeanList />
        </div>

        <footer className="toolbar toolbar-footer">
          <div className="toolbar-actions">
            <button className="btn btn-default" onClick={this._refreshDeviceList}>
              Refresh
            </button>

            <button className="btn btn-primary pull-right">
              Update Firmware
            </button>
          </div>
        </footer>
      </div>
    )
  }
}

module.exports = App
