const BigNumber = require('bignumber.js')
const FieldElemet = require('./field-element')
const gTable = require('./g-table')
const cacheForMul = []

const bitIsTrue = function (hex, offset) {
  const byteIndex = parseInt(offset / 8) + 1
  const byte = parseInt(hex.substr(byteIndex * -2, 2), 16)
  const bitIndex = offset % 8
  return !!(1 << bitIndex & byte)
}

class Point {
  constructor (x, y) {
    this.x = FieldElemet(x)
    this.y = FieldElemet(y)
  }

  eq (other) {
    return this.x.eq(other.x) && this.y.eq(other.y)
  }

  add (other) {
    if (isNaN(this.x)) {
      return other
    }

    if (!this.x.eq(other.x)) {
      // s = (y2-y1)/(x2-x1)
      // x3 = (s^2 - x1) - x2
      // y3 = s(x1-x3) - y1
      const s = other.y.sub(this.y).div(other.x.sub(this.x))
      const x = s.pow(2).sub(this.x).sub(other.x)
      const y = s.mul(this.x.sub(x)).sub(this.y)
      return new Point(x, y)
    }

    if (!this.y.eq(other.y)) {
      return new Point(NaN, NaN)
    }
    // a = 0
    // s = 3(x^2 +a ) / 2y
    // x3 = s^2 - 2x1
    // y4 = s(x1 - x2) - y1
    const s = this.x.pow(2).mul(3).div(this.y.mul(2))
    const x = s.pow(2).sub(this.x.mul(2))
    const y = s.mul(this.x.sub(x)).sub(this.y)
    return new Point(x, y)
  }

  mul (coefficient) {
    const hex = FieldElemet(coefficient).hex()
    let result = new Point(NaN, NaN)
    for (let i = 0; i < 256; i++) {
      if (!bitIsTrue(hex, i)) {
        continue
      }
      result = result.add(cacheForMul[i])
    }

    return result
  }
}

for (let i = 0; i < 256; i++) {
  cacheForMul[i] = new Point(gTable[i].x, gTable[i].y)
}

exports = module.exports = function (x, y) {
  return new Point(x, y)
}
