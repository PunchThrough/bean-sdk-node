'use static'


const buffer = require('buffer')


class BinaryField {

  static fromBuffer(buf, offset, definition) {
    throw new Error("Subclasses must implement .fromBuffer(buf, offset, definition)")
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
    return new UInt8(buf.readUInt8(offset), definition)
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
    return new UInt16(buf.readUInt16LE(offset), definition)
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


class UInt32 extends BinaryField {

  static fromBuffer(buf, offset, definition) {
    return new UInt32(buf.readUInt32LE(offset), definition)
  }

  pack() {
    let buf = new buffer.Buffer(4)
    buf.writeUInt32LE(this._value, 0)
    return buf
  }

  size() {
    return 4
  }

}


class Int16 extends BinaryField {
  static fromBuffer(buf, offset, definition) {
    return new Int16(buf.readInt16LE(offset), definition)
  }

  pack() {
    let buf = new buffer.Buffer(2)
    buf.writeInt16LE(this._value, 0)
    return buf
  }

  size() {
    return 2
  }
}


class PaddedString extends BinaryField {

  static fromBuffer(buf, offset, definition) {
    let strBuf = buf.slice(offset, definition.length + offset)
    return new PaddedString(strBuf.toString('ascii'), definition)
  }

  pack() {
    let buf = new buffer.Buffer(this._defn.length)
    if (this._defn.pad_char) {
      buf.fill(this._defn.pad_char)
    } else {
      buf.fill(0)
    }
    buf.write(this._value, 0, this._defn.length)
    return buf
  }

  size() {
    return this._defn.length
  }
}


class VariableLengthBytes extends BinaryField {

  static fromBuffer(buf, offset, definition) {
    return new VariableLengthBytes(buf, definition)
  }

  pack() {
    return this._value
  }

  size() {
    return this._value.length
  }
}


class FixedLengthBytes extends BinaryField {

  static fromBuffer(buf, offset, definition) {
    let binBuf = buf.slice(offset, definition.length + offset)
    return new FixedLengthBytes(binBuf, definition)
  }

  pack() {
    return this._value  // Already a buffer!
  }

  size() {
    return this._defn.length
  }
}


module.exports = {
  UInt8: UInt8,
  UInt16: UInt16,
  UInt32: UInt32,
  Int16: Int16,
  PaddedString: PaddedString,
  FixedLengthBytes: FixedLengthBytes,
  VariableLengthBytes: VariableLengthBytes
}
