const BigNumber = require('bignumber.js')
const G = require('../g-multiplier')
const N = new BigNumber('0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141')
const crypto = require('crypto')
const bs58 = require('bs58')

const sha256 = function (data) {
  return crypto.createHash('sha256').update(data).digest()
}
const hash160 = function (data) {
  return crypto.createHash('ripemd160').update(sha256(data)).digest()
}

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

  toSec (compressed = true) {
    if (!compressed) {
      return `04${this.point.x.hex()}${this.point.y.hex()}`
    }

    const odd = this.point.y.number.modulo(2).eq(1)
    if (odd) {
      return `03${this.point.x.hex()}`
    }

    return `02${this.point.x.hex()}`
  }

  toAddress (testnet, compressed = true) {
    const h160 = hash160(Buffer.from(this.toSec(compressed), 'hex'))
    const prefix = (testnet) ? Buffer.from('6f', 'hex') : Buffer.from('00', 'hex')
    const concat = Buffer.concat([prefix, h160])
    const address = bs58.encode(Buffer.concat([concat, sha256(sha256(concat)).slice(0, 4)]))
    return address
  }
}

exports = module.exports = PublicKey
