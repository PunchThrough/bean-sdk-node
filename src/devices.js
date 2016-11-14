'use strict'


const util = require('./util/util')
const BleServices = require('./services/services')
const async = require('async')
const logger = require('./util/logs').logger

// Device types
const DEVICE_TYPE_LIGHT_BLUE = 'DEVICE_TYPE_LIGHT_BLUE'
const DEVICE_TYPE_BLE = 'DEVICE_TYPE_BLE'

const BEAN_UUID = util.normalizeUUID('a495ff10c5b14b44b5121370f02d74de');


class PeripheralMixin {
  constructor(peripheral) {
    this._peripheral = peripheral
  }

  update(peripheral) {
    this._peripheral = peripheral
    return true
  }

  getPeripheral() {
    return this._peripheral
  }

  getName() {
    let adv = this._peripheral.advertisement
    return adv.localName ? adv.localName : ''
  }

  getAddress() {
    return this._peripheral.uuid
  }
}


class ScannedDevice extends PeripheralMixin {
  constructor(peripheral) {
    super(peripheral)
    this._advertisedServices = []
    this._reportAtLeastOnce = false
  }

  print() {
    let out = `${this.getType()}:\n`
    out += `    Name: ${this.getName()}\n`
    out += `    Address: ${this.getAddress()}\n`
    out += `    Advertised Services:\n`
    if (this._advertisedServices.length > 0) {
      for (let i in this._advertisedServices) {
        out += `        ${this._advertisedServices[i]}\n`
      }
    } else {
      out += `        None\n`
    }
    return out
  }

  update(peripheral) {
    this._peripheral = peripheral

    let newServices = peripheral.advertisement.serviceUuids
    let updated = false
    for (let i in newServices) {
      let sUUID = newServices[i]
      if (this._advertisedServices.indexOf(sUUID) === -1) {
        updated = true
        this._advertisedServices.push(sUUID)
      }
    }

    if (!this._reportAtLeastOnce) {
      this._reportAtLeastOnce = true
      updated = true
    }

    return updated
  }

  getType() {
    if (this._advertisedServices.indexOf(BEAN_UUID) < 0) {
      return DEVICE_TYPE_BLE
    } else {
      return DEVICE_TYPE_LIGHT_BLUE
    }
  }

}


class BleDevice extends PeripheralMixin {

  constructor(peripheral) {
    super(peripheral)

    // State
    this._services = {}
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

  getServices() {
    return this._services
  }

  getDeviceInformationService() {
    return this._lookupService(BleServices.deviceInformation.UUID)
  }

  getBatteryService() {
    return this._lookupService(BleServices.battery.UUID)
  }

  getOADService() {
    return this._lookupService(BleServices.oad.UUID)
  }

  getSerialTransportService() {
    return this._lookupService(BleServices.serialTransport.UUID)
  }

  getScratchService() {
    return this._lookupService(BleServices.scratch.UUID)
  }

  toString() {
    return `${this.getName()}(${this.getAddress()})`
  }

  serialize() {
    return {
      name: this.getName(),
      address: this.getAddress(),
      device_type: this.getType()
    }
  }

  isConnected() {
    return this._peripheral.state === 'connected'
  }

  isConnectedOrConnecting() {
    return this._peripheral.state === 'connected' || this._peripheral.state === 'connecting'
  }

  connect(callback) {
    /**
     * Connect to the device
     *
     * @param callback Callback function that takes an error argument
     */
    logger.info(`Connecting to device: ${this.getName()}`)
    if (this.isConnected()) {
      logger.info('Already connected.')
      callback(null, this)
    } else {
      this._peripheral.connect((err)=> {
        callback(err, this)
      })
    }
  }

  disconnect(callback) {
    if (this.isConnected()) {
      this._peripheral.disconnect((error)=> {
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
    logger.info(`Looking up services for device: ${this.getName()}`)

    this._services = []  // Clear services
    this._peripheral.discoverAllServicesAndCharacteristics((err, services) => {
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
  constructor(peripheral) {
    super(peripheral)
  }

  getType() {
    return DEVICE_TYPE_LIGHT_BLUE
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
  ScannedDevice: ScannedDevice,
  BleDevice: BleDevice,
  LightBlueDevice: LightBlueDevice,
  DEVICE_TYPE_LIGHT_BLUE: DEVICE_TYPE_LIGHT_BLUE,
  DEVICE_TYPE_BLE: DEVICE_TYPE_BLE
}
