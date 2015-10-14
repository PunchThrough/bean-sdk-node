"use strict"

var BEAN_UUID = 'a495ff10c5b14b44b5121370f02d74de'

function fromPeripheral(peripheral) {
  var adv = peripheral.advertisement
  var name = adv.localName ? adv.localName : ''
  if (adv.serviceUuids.indexOf(BEAN_UUID) == -1) {
    return new BleDevice(peripheral.uuid, name, adv.serviceUuids)
  } else {
    return new LightBlueDevice(peripheral.uuid, name, adv.serviceUuids)
  }
}

class BleDevice {

  constructor(uuid, name, services) {
    this._uuid = uuid
    this._name = name
    this._services = services
  }

  toString() {
    var out = `BLE Device:\n`
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

class LightBlueDevice extends BleDevice {
  constructor(uuid, name, services) {
    super(uuid, name, services)
  }

  toString() {
    var out = `LightBlue Device:\n`
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
  LightBlueDevice: LightBlueDevice
}
