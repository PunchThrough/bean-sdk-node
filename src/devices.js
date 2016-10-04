'use strict'


const util = require('./util/util')
const BleServices = require('./services/services')
const async = require('async')
const logger = require('./util/logs').logger

// Device types
const DEVICE_TYPE_LIGHT_BLUE = 'DEVICE_TYPE_LIGHT_BLUE'
const DEVICE_TYPE_BLE = 'DEVICE_TYPE_BLE'
const BEAN_UUID = 'a495ff10c5b14b44b5121370f02d74de'


function fromExistingDevice(existingDevice, peripheral) {
  /**
   * Return the same `existingDevice` instance, with updated info from peripheral
   */

    // Kind of hacky...altering "protected" state within the `existingDevice`
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

  constructor(address, name, noblePeripheral) {
    this._address = address
    this._name = name
    this._noblePeripheral = noblePeripheral

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

    logger.info(`No such service: ${serviceKey}`)
    return null
  }

  getType() {
    return DEVICE_TYPE_BLE
  }

  getAddress() {
    return this._address
  }

  getName() {
    return this._name
  }

  setAutoReconnect(state) {
    logger.info(`Set reconnect for ${this._name}: ${state}`)
    this._autoReconnect = state
  }

  autoReconnect() {
    return this._autoReconnect
  }

  getDeviceInformationService() {
    return this._lookupService(BleServices.deviceInformation.UUID)
  }

  describe() {
    let adv = this._noblePeripheral.advertisement
    let out = `${this.getType()}:\n`
    out += `    Name: ${this._name}\n`
    out += `    Address: ${this._address}\n`
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

  toString() {
    return `${this._name}(${this._address})`
  }

  serialize() {
    return {
      name: this._name,
      address: this._address,
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
    /**
     * Connect to the device
     *
     * @param callback Callback function that takes an error argument
     */
    logger.info(`Connecting to device: ${this._name}`)
    if (this.isConnected()) {
      logger.info('Already connected.')
      callback(null)
    } else {
      this._noblePeripheral.connect((err)=> {
        callback(err)
      })
    }
  }

  disconnect(callback) {
    if (this.isConnected()) {
      this._noblePeripheral.disconnect((error)=> {
        if (error) {
          logger.error(`Device disconnect ERROR (${this.toString()}: ${error}`)
        } else {
          logger.info(`Device disconnect success (${this.toString()})`)
        }
        callback(error)
      })
    } else {
      callback(null)
    }
  }

  lookupServices(callback) {
    logger.info(`Looking up services for device: ${this._name}`)

    this._services = []  // Clear services
    this._noblePeripheral.discoverAllServicesAndCharacteristics((err, services) => {
      if (err) {
        logger.info(`There was an error getting services: ${err}`)
        callback(err)
      } else {

        let setupFns = []

        for (let nobleService of services) {
          let sUUID = util.normalizeUUID(nobleService.uuid)
          let service = null
          if (this._services[sUUID]) {
            // Service exists
            service = BleServices.fromExistingService(this._services[sUUID], nobleService)
          } else {
            // New service
            service = BleServices.fromNobleService(nobleService)
          }
          logger.info(`Found service: ${service.getName()} / ${nobleService.uuid}`)
          this._services[sUUID] = service
        }

        for (let i in this._services) {
          let s = this._services[i]
          setupFns.push((setupCallback)=> {
            s.setup((setupError)=> {
              logger.info(`Service setup successfully: ${s.getName()}`)
              setupCallback(setupError)
            })
          })
        }

        async.parallel(setupFns, function (error, results) {
          logger.info('All services have been setup!')
          callback(error)
        })

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
    return this._lookupService(BleServices.oad.UUID)
  }

  getSerialTransportService() {
    return this._lookupService(BleServices.serialTransport.UUID)
  }

  getBatteryService() {
    return this._lookupService(BleServices.battery.UUID)
  }

  setLed(red, green, blue, callback) {
    let cmd = BleServices.serialTransport.commandIds.CC_LED_WRITE_ALL
    this.getSerialTransportService().sendCommand(cmd, [red, green, blue], callback)
  }

  readAccelerometer(callback) {
    let cmd = BleServices.serialTransport.commandIds.CC_ACCEL_READ
    this.getSerialTransportService().sendCommand(cmd, [], null, callback)
  }

  readSketchInfo(callback) {
    let cmd = BleServices.serialTransport.commandIds.BL_GET_META
    this.getSerialTransportService().sendCommand(cmd, [], null, callback)
  }

  readBleConfig(callback) {
    let cmd = BleServices.serialTransport.commandIds.BT_GET_CONFIG
    this.getSerialTransportService().sendCommand(cmd, [], null, callback)
  }

  sendSerial(dataBuffer, callback) {
    let cmd = BleServices.serialTransport.commandIds.SERIAL_DATA
    this.getSerialTransportService().sendCommand(cmd, [dataBuffer], callback)
  }

  rename(newName, callback) {
    this.readBleConfig((err, existingCfg)=> {
      let cmd = BleServices.serialTransport.commandIds.BT_SET_CONFIG

      let args = [
        existingCfg.advertising_interval,
        existingCfg.connection_interval,
        existingCfg.tx_power,
        existingCfg.advertising_mode,
        existingCfg.ibeacon_uuid,
        existingCfg.ibeacon_major_id,
        existingCfg.ibeacon_minor_id,
        newName,
        newName.length
      ]

      this.getSerialTransportService().sendCommand(cmd, args, callback)
    })
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
