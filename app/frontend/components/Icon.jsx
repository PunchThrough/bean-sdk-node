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
    let iconClasses = 'img-circle media-object pull-left'

    switch (this.props.device_type) {
      case DEVICE_TYPE_BEAN:
        iconClasses += ' icon-bean'
        return (
          <img className={iconClasses} src="assets/img/bean-full.png"></img>
        )
        break
      default:
        iconClasses += ' icon-ble'
          return (
            <img className={iconClasses} src="assets/img/ble-full.png"></img>
          )
        break
    }
  }
}

module.exports = Icon
