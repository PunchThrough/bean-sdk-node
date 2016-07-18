'use static'


const buffer = require('buffer')


class BinaryField {

  static fromBuffer(buf) {
    throw new Error("Subclasses must implement .fromBuffer(buf)")
  }

  constructor(value) {
    this._value = value
  }

  getValue() {
    return this._value
  }

  pack() {
    throw new Error("Subclasses must implement .pack()")
  }

  size() {
    throw new Error("Subclasses must implement .size()")
  }

}


class UInt8 extends BinaryField {

  pack() {
    let buf = new buffer.Buffer(1)
    buf.writeUInt8(this._value, 0)
    return buf
  }

  size() {
    return 1
  }

}


class UInt16 extends BinaryField {

  pack() {
    let buf = new buffer.Buffer(2)
    buf.writeUInt16LE(this._value, 0)
    return buf
  }

  size() {
    return 2
  }

}


class String extends BinaryField {

  constructor(value, length) {
    super(value)
    this._length = length
  }

  pack() {
    let buf = new buffer.Buffer(this._length)
    buf.fill(0)
    buf.write(this._value, 0, this._length)
    return buf
  }

  size() {
    return this._length
  }
}



module.exports = {
  UInt8: UInt8,
  UInt16: UInt16,
  String: String
}