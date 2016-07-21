const buffer = require('buffer')


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


module.exports = {
  normalizeUUID: normalizeUUID,
  concatBuffers: concatBuffers
}
