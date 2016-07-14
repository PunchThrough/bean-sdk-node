'use static'


const buffer = require('buffer')


class UInt8 {

  static pack(buf, arg, offset) {
    buf.writeUInt8(arg, offset)
  }

  static unpack(buf) {
  }

  static size() {
    return 1
  }

}


class UInt16 {

  static pack(buf, arg) {
    buf.writeUInt16LE(arg)
  }

  static unpack(buf) {
  }

  static size() {
    return 2
  }

}



module.exports = {
  UInt8: UInt8,
  UInt16: UInt16
}