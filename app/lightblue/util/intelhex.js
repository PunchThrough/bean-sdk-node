let buffer = require('buffer')

const INTEL_HEX_DATA = 0
const INTEL_HEX_END_OF_FILE = 1
const INTEL_HEX_EXTENDED_SEGMENT_ADDRESS = 2
const INTEL_HEX_START_SEGMENT_ADDRESS = 3
const INTEL_HEX_EXTENDED_LINEAR_ADDRESS = 4
const INTEL_HEX_START_LINEAR_ADDRESS = 5


/**
 * Extract the "data" from an Intel hex line
 *
 * An Intel hex line looks like this
 *
 * :100000005CC000000C9450080C947D087EC0000079
 *
 * Once the ':' character is removed, each set of two characters represent a
 * Hexadecimal octet, or byte. However, not every byte in the string is considered
 * data, here is what the bytes mean:
 *
 *     Byte(s) [  0]    = Byte count
 *     Byte(s) [1:2]    = Address
 *     Byte(s) [  3]    = Record type
 *     Byte(s) [  n]    = Data
 *     Byte(s) [n+1]    = Checksum
 *
 * @param intelHexLine Ascii Intel hex line
 * @returns
 */
function extractDataFromIntelHexLine(intelHexLine) {
  if (!intelHexLine.startsWith(':')) {
    throw new Error(`Intel hex lines need to start with ':'`)
  }

  let asciiHex = intelHexLine.slice(1, intelHexLine.length)

  if (asciiHex.length === 0) {
    throw new Error(`Length of ascii hex string needs to be greater than 0`)
  }

  if (asciiHex.length % 2 !== 0) {
    throw new Error(`Length of ascii hex string needs to be even`)
  }

  let rawBytes = []

  for (let i = 0; i < asciiHex.length; i += 2) {
    let asciiByte = asciiHex.slice(i, i + 2)
    rawBytes.push(parseInt(asciiByte, 16))
  }

  if (rawBytes[3] === INTEL_HEX_DATA) {
    let dataBytes = rawBytes.slice(4, rawBytes.length - 1)
    let bytes = new buffer.Buffer(dataBytes.length)
    for (let i = 0; i < dataBytes.length; i++) {
      bytes.writeUInt8(dataBytes[i], i)
    }
    return bytes
  } else {
    return null
  }

}

/**
 * Encapsulation of an Intel hex file which provides a method to extract data
 */
class IntelHexFile {

  constructor(ascii) {
    this._ascii = ascii
  }

  /**
   * Parse the raw ascii data from an Intel hex file
   *
   * This method will check for errors and return the binary data.
   *
   */
  parse() {
    let dataBuffers = []
    let lines = this._ascii.split('\r\n')

    if (lines[lines.length -1] !== '') {
      throw new Error('Intel hex files should end with a newline')
    }

    for (let l of lines.slice(0, lines.length - 1)) {
      let data = extractDataFromIntelHexLine(l)
      if (data !== null) {
        dataBuffers.push(data)
      }
    }

    let totalByteLength = 0
    for (let b of dataBuffers) {
      totalByteLength += b.length
    }

    return buffer.Buffer.concat(dataBuffers, totalByteLength)
  }

}


module.exports = {
  IntelHexFile: IntelHexFile
}
