'use strict'

import React from 'react'
import BeanListItem from './BeanListItem'
import Store from '../store'
import actions from '../actions'

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
    Store.addChangeListener(this._onChange)
    actions.Actions.startScanning()
  }

  componentWillUnmount() {
    Store.removeChangeListener(this._onChange)
  }

  _refreshDeviceList() {
    actions.Actions.refreshDeviceList()
  }

  render() {
    return (
      <div className='bean-list-table bean-list'>
        <ul className="list-group">
          <li className="list-group-header" style={{borderBottomWidth: 1, borderBottomColor: '#ddd'}}>
            <span className="pull-left">
              <h3>Devices</h3>
            </span>
            <button className="btn btn-default pull-right center-vertical" onClick={this._refreshDeviceList}>
              <span className="icon icon-arrows-ccw"></span>
            </button>
          </li>
          {this.state.devices.map((d, i)=> <BeanListItem key={i} device={d}/>)}
        </ul>
      </div>
    )
  }
}

module.exports = BeanList
