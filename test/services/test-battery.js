'use strict'

const assert = require('assert')
const sinon = require('sinon')

const chars = require('../../src/services/battery').characteristics
const BatteryService = require('../../src/services/battery').BatteryService


class MockNobleCharacteristic {
    constructor() {
        this._voltage = 0
    }

    getVoltage() {
        return this._voltage
    }

    read(cb) {
        let buf = Buffer.from([3])
        cb(null, buf)
    }

}


describe('Battery Service', ()=> {
    describe('methods', ()=> {

        let batteryService
        let mockNobleCharacteristic

        beforeEach(()=> {
            mockNobleCharacteristic = new MockNobleCharacteristic()
            let mockChars = {}
            mockChars[chars.UUID_CHAR_BATTERY] = mockNobleCharacteristic
            batteryService = new BatteryService(mockChars, null)
        })

        it('get voltage', ()=> {
            batteryService.getVoltage((err, voltage)=> {
                assert.equal(voltage, 3)
            })
        })

        it('get voltage cached', ()=> {
            batteryService._charValueCache[chars.UUID_CHAR_BATTERY] = Buffer.from([5])
            batteryService.getVoltage((err, voltage)=> {
                assert.equal(voltage, 5)
            })
        })

    })
})
