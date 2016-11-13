'use strict'


const buffer = require('buffer')
const crc = require('crc')
const readline = require('readline')


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function normalizeUUID(uuid) {
  // Noble stores UUIDs as lower case strings with no dashes
  // Note: the replace call isn't working...don't use dashes
  return uuid.replace('-', '').toLowerCase();
}


function concatBuffers(buffers) {
  let length = 0
  for (let b of buffers)
    length += b.length
  let buf = buffer.Buffer.concat(buffers, length)
  return buf
}


function crc16(buf) {
  return crc.crc16ccitt(buf)
}


module.exports = {
  normalizeUUID: normalizeUUID,
  concatBuffers: concatBuffers,
  crc16: crc16,
  userInput: rl
}
