"use strict"

import BleServices from './services'
import util from './util'

// Device types
const DEVICE_TYPE_LIGHT_BLUE = 'DEVICE_TYPE_LIGHT_BLUE'
const DEVICE_TYPE_BLE = 'DEVICE_TYPE_BLE'

const BEAN_UUID = 'a495ff10c5b14b44b5121370f02d74de'


function fromPeripheral(peripheral) {
  var adv = peripheral.advertisement
  var name = adv.localName ? adv.localName : ''
  if (adv.serviceUuids.indexOf(BEAN_UUID) == -1) {
    return new BleDevice(peripheral.uuid, name, peripheral)
  } else {
    return new LightBlueDevice(peripheral.uuid, name, peripheral)
  }
}


class BleDevice {

  constructor(uuid, name, noble_peripheral) {
    this._uuid = uuid
    this._name = name
    this._noble_peripheral = noble_peripheral
    this._services = {}
  }

  _lookupService(serviceKey) {
    /**
     * Helper function to look up a service based on a key, with error logging
     */

    let s = this._services[serviceKey]
    if (s)
      return s

    console.log(`No such service: ${serviceKey}`)
    return null
  }

  getType() {
    return DEVICE_TYPE_BLE
  }

  getUUID() {
    return this._uuid
  }

  getName() {
    return this._name
  }

  getDeviceInformationService() {
    return this._lookupService(BleServices.UUID_SERVICE_DEVICE_INFORMATION)
  }

  getOADService() {
    return this._lookupService(BleServices.UUID_SERVICE_OAD)
  }

  toString() {
    var out = `${this.getType()}:\n`
    out += `    Name: ${this._name}\n`
    out += `    UUID: ${this._uuid}\n`
    out += `    Services:\n`
    for (var i in this._services) {
      out += `        ${this._services[i]}`
    }
    out += '\n'
    return out
  }

  serialize() {
    return {
      name: this._name,
      uuid: this._uuid,
      device_type: this.getType()
    }
  }

  isConnected() {
    return this._noble_peripheral.state === 'connected'
  }

  connect(cb) {
    console.log(`Connecting to device: ${this._name}`)
    this._noble_peripheral.connect(cb)
  }

  disconnect() {
    this._noble_peripheral.disconnect()
  }

  lookupServices(completionCallback) {
    console.log(`Looking up services for device: ${this._name}`)
    this._noble_peripheral.discoverAllServicesAndCharacteristics((err, services) => {
      if (err) {
        console.log(`There was an error getting services: ${err}`)
        completionCallback(err)
      } else {
        for (let i in services) {
          let s = BleServices.fromNobleService(services[i])
          this._services[util.normalizeUUID(s.getUUID())] = s
          console.log(`Found service: ${s.getName()}`)
        }
        completionCallback()
      }
    })
  }

}


class LightBlueDevice extends BleDevice {
  constructor(uuid, name, services, noble_peripheral) {
    super(uuid, name, services, noble_peripheral)
  }

  getType() {
    return DEVICE_TYPE_LIGHT_BLUE
  }

  toString() {
    var out = `${this.getType()}:\n`
    out += `    Name: ${this._name}\n`
    out += `    UUID: ${this._uuid}\n`
    out += `    Services:\n`
    for (var i in this._services) {
      out += `        ${this._services[i]}`
    }
    out += '\n'
    return out
  }

}

module.exports = {
  fromPeripheral: fromPeripheral,
  BleDevice: BleDevice,
  LightBlueDevice: LightBlueDevice,
  DEVICE_TYPE_LIGHT_BLUE: DEVICE_TYPE_LIGHT_BLUE,
  DEVICE_TYPE_BLE: DEVICE_TYPE_BLE
}
