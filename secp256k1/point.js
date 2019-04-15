const FieldElemet = require('./field-element')

const bitIsTrue = function (hex, bitIndex) {
  const byteIndex = parseInt(bitIndex / 8) + 1
  const byte = parseInt(hex.substr(byteIndex * -2, 2), 16)
  const offset = bitIndex % 8
  return !!(1 << offset & byte)
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
      // x = (s^2 - x1) - x2
      // y = s(x1-x) - y1
      const s = other.y.sub(this.y).div(other.x.sub(this.x))
      const x = s.pow(2).sub(this.x).sub(other.x)
      const y = s.mul(this.x.sub(x)).sub(this.y)
      return new Point(x, y)
    }

    if (!this.y.eq(other.y)) {
      return new Point(NaN, NaN)
    }
    // a = 0
    // s = 3(x^2 +a) / 2y
    // x = s^2 - 2x1
    // y = s(x1 - x) - y1
    const s = this.x.pow(2).mul(3).div(this.y.mul(2))
    const x = s.pow(2).sub(this.x.mul(2))
    const y = s.mul(this.x.sub(x)).sub(this.y)
    return new Point(x, y)
  }

  mul (coefficient) {
    const hex = FieldElemet(coefficient).hex()
    let now = this
    let result = new Point(NaN, NaN)
    for (let i = 0; i < 256; i++) {
      if (bitIsTrue(hex, i)) {
        result = result.add(now)
      }
      now = now.add(now)
    }
    return result
  }
}

exports = module.exports = function (x, y) {
  return new Point(x, y)
}
