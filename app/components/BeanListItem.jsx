import React from 'react'

var BeanListItem = React.createClass({

  render: function () {
    return (
      <li className="list-group-item">
        <span className="icon icon-upload media-object pull-left"></span>
        <div className="media-body">
          <strong>{this.props.beanName}</strong>
          <p>{this.props.beanUUID}</p>
        </div>
      </li>
    )
  }

})

module.exports = BeanListItem
