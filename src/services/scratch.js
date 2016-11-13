'use strict'


const BleService = require ('./base')
const util = require('../util/util')

const UUID_SERVICE_SCRATCH = util.normalizeUUID('a495ff20c5b14b44b5121370f02d74de');
const UUID_CHAR_SCRATCH_BANK_1 = util.normalizeUUID('a495ff21c5b14b44b5121370f02d74de');
const UUID_CHAR_SCRATCH_BANK_2 = util.normalizeUUID('a495ff22c5b14b44b5121370f02d74de');
const UUID_CHAR_SCRATCH_BANK_3 = util.normalizeUUID('a495ff23c5b14b44b5121370f02d74de');
const UUID_CHAR_SCRATCH_BANK_4 = util.normalizeUUID('a495ff24c5b14b44b5121370f02d74de');
const UUID_CHAR_SCRATCH_BANK_5 = util.normalizeUUID('a495ff25c5b14b44b5121370f02d74de');

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
    let bankCharUUID = BANK_MAP[bank]
    if (bankCharUUID) {
      this._performCachedLookup(bankCharUUID, (err, buf)=> {
        callback(err, buf)
      })
    } else {
      callback(`Invalid bank: ${bank}`)
    }
  }

  writeScratch(bank, data, callback) {
    let bankCharUUID = BANK_MAP[bank]
    if (bankCharUUID) {
      this._characteristics[bankCharUUID].write(data, true, (err)=> {
        setTimeout(callback, 50, err)
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
