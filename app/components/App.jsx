import React from 'react'
import BeanList from './BeanList.jsx'

var App = React.createClass({

  render: function () {
    return (
      <div className="window">

        <div className="window-content">
          <BeanList />
        </div>

        <footer className="toolbar toolbar-footer">
          <div className="toolbar-actions">
            <button className="btn btn-default">
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

})

module.exports = App
