'use strict'

let BleServices = require('./services')
let util = require('./util')

// Device types
const DEVICE_TYPE_LIGHT_BLUE = 'DEVICE_TYPE_LIGHT_BLUE'
const DEVICE_TYPE_BLE = 'DEVICE_TYPE_BLE'
const BEAN_UUID = 'a495ff10c5b14b44b5121370f02d74de'


function fromExistingDevice(existingDevice, peripheral) {
  /**
   * Return the same `existingDevice` instance, with updated info from peripheral
   */

  // Kind of hacky...altering "protected" state within the existingDevice
  let adv = peripheral.advertisement
  existingDevice._name = adv.localName ? adv.localName : ''
  existingDevice._noblePeripheral = peripheral
  return existingDevice
}

function fromNoblePeripheral(peripheral) {
  /**
   * Return a Device class given a Noble peripheral object
   */

  let adv = peripheral.advertisement
  let name = adv.localName ? adv.localName : ''
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
    this._noblePeripheral = noble_peripheral

    // State
    this._services = {}
    this._autoReconnect = false
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

  setAutoReconnect(state) {
    console.log(`Set reconnect for ${this._name}: ${state}`)
    this._autoReconnect = state
  }

  autoReconnect() {
    return this._autoReconnect
  }

  getDeviceInformationService() {
    return this._lookupService(BleServices.UUID_SERVICE_DEVICE_INFORMATION)
  }

  toString() {
    let adv = this._noblePeripheral.advertisement
    let out = `${this.getType()}:\n`
    out += `    Name: ${this._name}\n`
    out += `    UUID: ${this._uuid}\n`
    out += `    Advertised Services:\n`
    if (adv.serviceUuids.length > 0) {
      for (let i in adv.serviceUuids) {
        out += `        ${adv.serviceUuids[i]}\n`
      }
    } else {
      out += `        None\n`
    }
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
    return this._noblePeripheral.state === 'connected'
  }

  isConnectedOrConnecting() {
    return this._noblePeripheral.state === 'connected' || this._noblePeripheral.state === 'connecting'
  }

  connect(callback) {
    console.log(`Connecting to device: ${this._name}`)
    if (this.isConnected()) {
      console.log('Already connected.')
      callback(null)
    } else {
      this._noblePeripheral.connect((err)=> {
        callback(err)
      })
    }
  }

  disconnect() {
    this._noblePeripheral.disconnect()
  }

  lookupServices(completionCallback) {
    console.log(`Looking up services for device: ${this._name}`)
    this._noblePeripheral.discoverAllServicesAndCharacteristics((err, services) => {
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

  getOADService() {
    return this._lookupService(BleServices.UUID_SERVICE_OAD)
  }

}

module.exports = {
  fromNoblePeripheral: fromNoblePeripheral,
  fromExistingDevice: fromExistingDevice,
  BleDevice: BleDevice,
  LightBlueDevice: LightBlueDevice,
  DEVICE_TYPE_LIGHT_BLUE: DEVICE_TYPE_LIGHT_BLUE,
  DEVICE_TYPE_BLE: DEVICE_TYPE_BLE
}
