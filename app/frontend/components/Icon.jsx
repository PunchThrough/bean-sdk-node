'use strict'

require("babel/register")

import React from 'react'

const DEVICE_TYPE_BEAN = require('../../lightblue/devices').consts.DEVICE_TYPE_BEAN
const DEVICE_TYPE_BLE = require('../../lightblue/devices').consts.DEVICE_TYPE_BLE

class Icon extends React.Component {
  constructor() {
    super()
  }

  render() {
    let icon_classes = 'img-circle media-object pull-left'

    switch (this.props.device_type) {
      case DEVICE_TYPE_BEAN:
        icon_classes += ' icon-bean'
        return (
          <img className={icon_classes} src="assets/img/bean-full.png"></img>
        )
        break
      default:
        icon_classes += ' icon-ble'
          return (
            <img className={icon_classes} src="assets/img/ble-full.png"></img>
          )
        break
    }
  }
}

module.exports = Icon
