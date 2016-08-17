const buffer = require('buffer')
const crc = require('crc')


function normalizeUUID(uuid) {
  return parseInt(uuid, 16)
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
  crc16: crc16
}
