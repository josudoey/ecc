const BigNumber = require('bignumber.js')

const P = new BigNumber('0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f', 16)

class FieldElemnt {
  constructor (i) {
    let num = new BigNumber(i.toString()).modulo(P)
    if (!num.gt(0)) {
      this.num = num.plus(P).modulo(P)
      return
    }
    this.num = num
  }

  get P () {
    return P
  }

  hex () {
    return `0000000000000000000000000000000000000000000000000000000000000000${this.num.toString(16)}`.slice(-64)
  }

  eq (other) {
    if (isNaN(this.num) && isNaN(other.toString())) {
      return true
    }
    return this.num.isEqualTo(other.toString())
  }

  add (other) {
    const num = this.num.plus(other.toString())
    return new FieldElemnt(num)
  }

  sub (other) {
    const num = this.num.minus(other.toString())
    return new FieldElemnt(num)
  }

  mul (other) {
    const num = this.num.times(other.toString())
    return new FieldElemnt(num)
  }

  div (other) {
    const inv = new BigNumber(other.toString()).pow(P.minus(2), P)
    return this.mul(new FieldElemnt(inv))
  }

  pow (n) {
    const num = this.num.pow(n, P)
    return new FieldElemnt(num)
  }

  toString () {
    if (isNaN(this.num)) {
      return 'NaN'
    }
    return `0x${this.hex()}`
  }
}

exports = module.exports = function (num) {
  return new FieldElemnt(num)
}

exports.P = P
