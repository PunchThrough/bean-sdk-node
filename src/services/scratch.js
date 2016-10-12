'use strict'


const BleService = require ('./base')

const UUID_SERVICE_SCRATCH = 'a495ff20-c5b1-4b44-b512-1370f02d74de'
const UUID_CHAR_SCRATCH_BANK_1 = 'a495ff21-c5b1-4b44-b512-1370f02d74de'
const UUID_CHAR_SCRATCH_BANK_2 = 'a495ff22-c5b1-4b44-b512-1370f02d74de'
const UUID_CHAR_SCRATCH_BANK_3 = 'a495ff23-c5b1-4b44-b512-1370f02d74de'
const UUID_CHAR_SCRATCH_BANK_4 = 'a495ff24-c5b1-4b44-b512-1370f02d74de'
const UUID_CHAR_SCRATCH_BANK_5 = 'a495ff25-c5b1-4b44-b512-1370f02d74de'

const BANK_MAP = {
  1: UUID_CHAR_SCRATCH_BANK_1,
  2: UUID_CHAR_SCRATCH_BANK_2,
  3: UUID_CHAR_SCRATCH_BANK_3,
  4: UUID_CHAR_SCRATCH_BANK_4,
  5: UUID_CHAR_SCRATCH_BANK_5
}


/**
 * LightBlue Scratch Service
 */
class ScratchService extends BleService {

  readScratch(bank, callback) {
    let bank_char_uuid = BANK_MAP[bank]
    if (bank_char_uuid) {
      this._performCachedLookup(bank_char_uuid, (err, buf)=> {
        callback(err, buf)
      })
    } else {
      callback(`Invalid bank: ${bank}`)
    }
  }

  writeScratch(bank, data, callback) {
    let bank_char_uuid = BANK_MAP[bank]
    if (bank_char_uuid) {
      this._characteristics[bank_char_uuid].write(data, true, (err)=> {
        callback(err)
      })
      } else {
      callback(`Invalid bank: ${bank}`)
    }

  }
}


module.exports = {
  ScratchService: ScratchService,
  UUID: UUID_SERVICE_SCRATCH
}
