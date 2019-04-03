const BigNumber = require('bignumber.js')

const N = new BigNumber('0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141', 16)

class FieldElemnt {
  constructor (i) {
    let num = new BigNumber(i).modulo(N)
    if (!num.gt(0)) {
      this.num = N.plus(num).modulo(N)
      return
    }
    this.num = num.modulo(N)
  }

  add (other) {
    const num = this.num.plus(other.num)
    return new FieldElemnt(num)
  }

  sub (other) {
    const num = this.num.minus(other.num)
    return new FieldElemnt(num)
  }

  mul (other) {
    const num = this.num.times(other.num)
    return new FieldElemnt(num)
  }

  div (other) {
    const inv = other.num.pow(N.minus(2), N)
    return this.mul(new FieldElemnt(inv))
  }

  pow (n) {
    const num = this.num.pow(n, N)
    return new FieldElemnt(num)
  }
}

exports = module.exports = function (num) {
  return new FieldElemnt(num)
}
