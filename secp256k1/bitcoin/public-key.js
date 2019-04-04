const BigNumber = require('bignumber.js')
const G = require('../g-multiplier')
const N = new BigNumber('0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141')

class PublicKey {
  constructor (point) {
    this.point = point
  }

  ecRecover (msgHash, rHex, sHex) {
    const z = new BigNumber(msgHash)
    const r = new BigNumber(rHex)
    const s = new BigNumber(sHex)
    // u = z/s
    // v = r/s
    const u = z.times(s.pow(N.minus(2), N)).modulo(N)
    const v = r.times(s.pow(N.minus(2), N)).modulo(N)
    return G(u).add(this.point.mul(v)).x.toString()
  }
}

exports = module.exports = PublicKey
