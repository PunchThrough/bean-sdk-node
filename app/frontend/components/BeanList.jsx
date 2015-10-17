import React from 'react'
import BeanListItem from './BeanListItem'
import ipc from 'ipc'

class BeanList extends React.Component {
  constructor() {
    super()
    this.state = {devices: []}
  }

  componentDidMount() {
    ipc.on('deviceFound', (device) => {
      var newDevices = this.state.devices.slice()
      newDevices.push(device)
      this.setState({devices: newDevices})
    });
  }

  componentWillUnmount() {
    ipc.removeListener('deviceFound');
  }

  render() {
    return (
      <div className='bean-list-table bean-list'>
        <ul className="list-group">
          <li className="list-group-header">
            <h3>Beans</h3>
          </li>
          {this.state.devices.map((d, i)=> <BeanListItem key={i} beanName={d.name} beanUUID={d.uuid}/>)}
        </ul>
      </div>
    )
  }
}

module.exports = BeanList
