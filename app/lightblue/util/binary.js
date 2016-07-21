'use static'


const buffer = require('buffer')


class BinaryField {

  static fromBuffer(buf, offset, definition) {
    throw new Error("Subclasses must implement .fromBuffer(buf)")
  }

  constructor(value, defn) {
    this._value = value
    this._defn = defn
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

  static fromBuffer(buf, offset, definition) {
    return new UInt8(buf.readUInt8(buf, offset), definition)
  }

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

  static fromBuffer(buf, offset, definition) {
    return new UInt16(buf.readUInt16LE(buf, offset), definition)
  }

  pack() {
    let buf = new buffer.Buffer(2)
    buf.writeUInt16LE(this._value, 0)
    return buf
  }

  size() {
    return 2
  }

}


class VariableLengthString extends BinaryField {

  static fromBuffer(buf, offset, definition) {
    return new VariableLengthString('', definition)  // TODO: Implement me
  }

  pack() {
    let buf = new buffer.Buffer(this._defn.length)
    buf.fill(0)
    buf.write(this._value, 0, this._defn.length)
    return buf
  }

  size() {
    return this._defn.length
  }
}


module.exports = {
  UInt8: UInt8,
  UInt16: UInt16,
  VariableLengthString: VariableLengthString
}
