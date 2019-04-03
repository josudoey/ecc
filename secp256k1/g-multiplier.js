const FieldElemet = require('./field-element')
const Point = require('./point')
const gTable = require('./g-multiplication-table')
const mTable = []
for (let i = 0; i < 256; i++) {
  mTable[i] = new Point(gTable[i].x, gTable[i].y)
}

const bitIsTrue = function (hex, offset) {
  const byteIndex = parseInt(offset / 8) + 1
  const byte = parseInt(hex.substr(byteIndex * -2, 2), 16)
  const bitIndex = offset % 8
  return !!(1 << bitIndex & byte)
}

exports = module.exports = function (coefficient) {
  const hex = FieldElemet(coefficient).hex()
  let result = new Point(NaN, NaN)
  for (let i = 0; i < 256; i++) {
    if (!bitIsTrue(hex, i)) {
      continue
    }
    result = result.add(mTable[i])
  }
  return result
}
