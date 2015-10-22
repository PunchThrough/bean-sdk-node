"use strict"

// Device types
const DEVICE_TYPE_LIGHT_BLUE = 'DEVICE_TYPE_LIGHT_BLUE'
const DEVICE_TYPE_BLE = 'DEVICE_TYPE_BLE'

const BEAN_UUID = 'a495ff10c5b14b44b5121370f02d74de'


function fromPeripheral(peripheral) {
  var adv = peripheral.advertisement
  var name = adv.localName ? adv.localName : ''
  if (adv.serviceUuids.indexOf(BEAN_UUID) == -1) {
    return new BleDevice(peripheral.uuid, name, adv.serviceUuids, peripheral)
  } else {
    return new LightBlueDevice(peripheral.uuid, name, adv.serviceUuids, peripheral)
  }
}


class BleDevice {

  constructor(uuid, name, services, noble_peripheral) {
    this._uuid = uuid
    this._name = name
    this._services = services
    this._noble_peripheral = noble_peripheral
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

  connect(cb) {
    console.log(`Connecting to device: ${this._name}`)
    this._noble_peripheral.connect(cb)
  }

  disconnect() {
    this._noble_peripheral.disconnect()
  }

  getServices(cb) {
    this._noble_peripheral.discoverAllServicesAndCharacteristics((err, services) => {
      if (err) {
        console.log(`There was an error getting services: ${err}`)
      } else {
        cb(services)
      }
    })
  }

  isConnected() {
    return this._noble_peripheral.state === 'connected'
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

  getFirmwareVersion() {

  }
}

module.exports = {
  fromPeripheral: fromPeripheral,
  BleDevice: BleDevice,
  LightBlueDevice: LightBlueDevice,
  DEVICE_TYPE_LIGHT_BLUE: DEVICE_TYPE_LIGHT_BLUE,
  DEVICE_TYPE_BLE: DEVICE_TYPE_BLE
}
