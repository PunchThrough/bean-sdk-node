import React from 'react'
import Icon from './Icon.js'

class BeanListItem extends React.Component {

  constructor() {
    super()
  }

  render() {
    return (
      <li className="list-group-item">
        <Icon dType={this.props.device.get_type()}/>

        <div className="media-body">
          <strong>{this.props.device.beanName}</strong>

          <p>{this.props.device.beanUUID}</p>
        </div>
      </li>
    )
  }

}

module.exports = BeanListItem
