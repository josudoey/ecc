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

  getPublicKey () {
    return Buffer.from(this.publicKey.toSec(false), 'hex')
  }

  ecdhSecret (otherPublicKey) {
    const otherKey = PublicKey.fromSec(otherPublicKey.toString('hex'))
    const secret = otherKey.point.mul(this.secret).x
    return secret.hex()
  }

  sign (msgHash) {
    const z = new BigNumber(msgHash)
    const k = new BigNumber('0x' + crypto.randomBytes(32).toString('hex'))
    const kG = G(k)
    const r = new BigNumber(kG.x.toString())
    // kG = uG + vP = uG + zeG
    // r = kG.x = (uG + vP).x
    // s = (z+re) / k
    const s = r.times(this.secret).plus(z).times(k.pow(N.minus(2), N)).modulo(N)
    const recoveryParam = parseInt(kG.y.hex().slice(-2), 16) % 2
    return {
      r: hex(r),
      s: hex(s),
      recoveryParam: recoveryParam
    }
  }

  ecRecover (msgHash, rHex, sHex) {
    return this.publicKey.ecRecover(msgHash, rHex, sHex)
  }
}

exports = module.exports = PrivateKey
