let React = require('react')
let BeanList = require('./BeanList')
let DeviceView = require('./DeviceView')

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
