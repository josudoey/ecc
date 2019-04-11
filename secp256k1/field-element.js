const BigNumber = require('bignumber.js')

const P = new BigNumber('0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f', 16)
const powForSqrt = P.plus(1).div(4)

class FieldElemnt {
  constructor (i) {
    let num = new BigNumber(i.toString()).modulo(P)
    if (!num.gt(0)) {
      this.number = num.plus(P).modulo(P)
      return
    }
    this.number = num
  }

  get P () {
    return P
  }

  hex () {
    return `0000000000000000000000000000000000000000000000000000000000000000${this.number.toString(16)}`.slice(-64)
  }

  eq (other) {
    if (isNaN(this.number) && isNaN(other.toString())) {
      return true
    }
    return this.number.isEqualTo(other.toString())
  }

  isOdd () {
    return this.number.modulo(2).eq(1)
  }

  add (other) {
    const num = this.number.plus(other.toString())
    return new FieldElemnt(num)
  }

  sub (other) {
    const num = this.number.minus(other.toString())
    return new FieldElemnt(num)
  }

  mul (other) {
    const num = this.number.times(other.toString())
    return new FieldElemnt(num)
  }

  div (other) {
    // Fermat's Little Theorem
    // #when mod P
    // n^(p-1) = 1
    // 1/n = n^(-1)
    // n^(-1) * 1 = n^(-1) * n^(p-1) = n^(p-2)
    const inv = new BigNumber(other.toString()).pow(P.minus(2), P)
    return this.mul(new FieldElemnt(inv))
  }

  complement () {
    const num = P.minus(this.number)
    return new FieldElemnt(num)
  }

  pow (n) {
    const num = this.number.pow(n, P)
    return new FieldElemnt(num)
  }

  sqrt () {
    // when n is mod p and p is prime
    // n = n^p
    // n^2 = n^(p+1)
    // n*n = n^((p+1)/2) * n^((p+1)/2)
    // n = n^((p+1)/2)
    // n^(1/2) * n^(1/2) = n^((p+1)/4) * n^((p+1)/4)
    // n^(1/2) = n^((p+1)/4)
    // thus powForSqrt = (p+1)/4
    return this.pow(powForSqrt)
  }

  toString () {
    if (isNaN(this.number)) {
      return 'NaN'
    }
    return `0x${this.hex()}`
  }
}

exports = module.exports = function (num) {
  return new FieldElemnt(num)
}

exports.P = P
