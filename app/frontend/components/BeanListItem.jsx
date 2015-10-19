import React from 'react'
import Icon from './Icon.js'

class BeanListItem extends React.Component {

  constructor() {
    super()
  }

  render() {
    return (
      <li className="list-group-item">
        <Icon device_type={this.props.device.device_type}/>

        <div className="media-body">
          <strong>{this.props.device.name}</strong>
          <p>{this.props.device.uuid}</p>
        </div>
      </li>
    )
  }

}

module.exports = BeanListItem
