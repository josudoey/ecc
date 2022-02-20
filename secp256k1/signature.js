const Ber = require('asn1').Ber

module.exports.toDER = function ({ r, s }) {
  const unsigned = (n) => {
    const buf = Buffer.from(n, 'hex')
    if (buf[0] < 0x80) {
      return buf
    }
    return Buffer.concat([
      Buffer.from([0x00]), buf
    ])
  }
  const writer = new Ber.Writer()
  writer.startSequence()
  writer.writeBuffer(unsigned(r), Ber.Integer)
  writer.writeBuffer(unsigned(s), Ber.Integer)
  writer.endSequence()
  return writer.buffer
}

module.exports.fromDER = function (buffer) {
  const reader = new Ber.Reader(buffer)
  reader.readSequence()
  if (reader.peek() !== Ber.Integer) {
    throw new Error('invalid der signature')
  }
  const r = reader.readString(Ber.Integer, true)
  if (reader.peek() !== Ber.Integer) {
    throw new Error('invalid der signature')
  }
  const s = reader.readString(Ber.Integer, true)
  return {
    r: r.toString('hex'),
    s: s.toString('hex')
  }
}
