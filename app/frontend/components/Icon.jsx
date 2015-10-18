'use strict'

require("babel/register")

import React from 'react'
import DEVICE_TYPE_BEAN from '../../lightblue/devices.js'
import DEVICE_TYPE_BLE from '../../lightblue/devices.js'

class Icon extends React.Component {
  constructor() {
    super()
  }

  render() {
    return (
      <div>
        <p>
          {(() => {
            switch (this.props.dType) {
              case DEVICE_TYPE_BEAN:
                return (
                  <img class="img-circle media-object pull-left" src="/assets/images/bean.png" width="32" height="32">
                  </img>
                )
              default:
                return (
                  <img class="img-circle media-object pull-left" src="/assets/images/ble.png" width="32" height="32">
                  </img>
                )
            }
          })()}
        </p>
      </div>
    )
  }
}