const BigNumber = require('bignumber.js')
const crypto = require('crypto')
const G = require('../g-multiplier')
const PublicKey = require('./public-key')
const N = new BigNumber('0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141')

const hex = function (n) {
  const hex = `0000000000000000000000000000000000000000000000000000000000000000${n.toString(16)}`.slice(-64)
  return `${hex}`
}

class PrivateKey {
  constructor (secret) {
    this.secret = new BigNumber(secret)
    this.point = G(this.secret)
    this.publicKey = new PublicKey(this.point)
  }

  sign (msgHash) {
    const z = new BigNumber(msgHash)
    const k = new BigNumber('0x' + crypto.randomBytes(32).toString('hex'))
    const r = new BigNumber(G(k).x.toString())
    // kG = uG + vP = uG + zeG
    // r = kG.x = (uG + vP).x
    // s = (z+re) / k
    const s = r.times(this.secret).plus(z).times(k.pow(N.minus(2), N)).modulo(N)
    return {
      r: hex(r),
      s: hex(s)
    }
  }

  ecRecover (msgHash, rHex, sHex) {
    return this.publicKey.ecRecover(msgHash, rHex, sHex)
  }
}

exports = module.exports = PrivateKey
