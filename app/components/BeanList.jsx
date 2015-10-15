import React from 'react'
import BeanListItem from './BeanListItem.jsx'

var BeanList = React.createClass({

  render: function () {
    return (
      <div className='bean-list-table'>
        <ul className="list-group">
          <li className="list-group-header">
            Bean List
            <BeanListItem beanName="Amazing Bean" beanUUID="XXX-XXX-XXX-XXX" />
          </li>
        </ul>
      </div>
    )
  }

})

module.exports = BeanList
