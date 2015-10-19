'use strict'

import React from 'react'
import BeanListItem from './BeanListItem'
import Store from '../store'

function getDevices() {
  return {
    devices: Store.getDevices()
  }
}

class BeanList extends React.Component {

  constructor() {
    super()
    this.state = getDevices()

    // Have to use a fat-arrow so that `this` is bound correctly...
    this._onChange = () => {
      this.setState(getDevices())
    }
  }

  componentDidMount() {
    Store.addChangeListener(this._onChange);
  }

  componentWillUnmount() {
    Store.removeChangeListener(this._onChange);
  }

  render() {
    return (
      <div className='bean-list-table bean-list'>
        <ul className="list-group">
          <li className="list-group-header">
            <h3>Beans</h3>
          </li>
          {this.state.devices.map((d, i)=> <BeanListItem key={i} device={d}/>)}
        </ul>
      </div>
    )
  }
}

module.exports = BeanList
