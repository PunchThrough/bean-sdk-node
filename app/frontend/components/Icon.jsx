'use strict'

require("babel/register")

import React from 'react'

const DEVICE_TYPE_BEAN = require('../../lightblue/devices').consts.DEVICE_TYPE_BEAN
const DEVICE_TYPE_BLE = require('../../lightblue/devices').consts.DEVICE_TYPE_BLE
let icon_classes = 'img-circle media-object pull-left'

class Icon extends React.Component {
  constructor() {
    super()
  }

  render() {

    return (
      <div>
        <p>
          {(() => {
            switch (this.props.device_type) {
              case DEVICE_TYPE_BEAN:
                icon_classes += ' icon-bean'
                return (
                  <img className={icon_classes} src="assets/images/bean.png" width="32" height="32">
                  </img>
                )
              break
              default:
                icon_classes += ' icon-ble'
                return (
                  <img className={icon_classes} src="assets/images/ble.png" width="32" height="32">
                  </img>
                )
              break
            }
          })()}
        </p>
      </div>
    )
  }
}

module.exports = Icon