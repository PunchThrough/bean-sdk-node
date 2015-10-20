import React from 'react'
import BeanList from './BeanList'
import DeviceView from './DeviceView'
import actions from '../actions'

class App extends React.Component {

  constructor() {
    super()
  }

  render() {
    return (
      <div className="window">

        <div className="window-content">
          <div className="pane pane-sm sidebar">
            <BeanList />
          </div>
          <div className="pane">
            <DeviceView />
          </div>
        </div>
      </div>
    )
  }
}

module.exports = App
