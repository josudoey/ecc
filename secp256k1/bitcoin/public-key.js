const BigNumber = require('bignumber.js')
const G = require('../g-multiplier')
const Point = require('../point')
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

  static recover (msgHash, rHex, sHex, recoverParmas) {
    // kG = uG + vP
    // kG.x = r
    // skG = suG + svP
    // skG = zG + svP
    // skG +(n-z)G = svP
    // svP = (sk - z) G
    // (sv/r)P = ((sk -z)/r) G
    // v = r/s
    // r = sv
    // u = sz
    // P = (r**n-2) (s(kG) + (n-z)G)

    const z = new BigNumber(msgHash)
    const r = new BigNumber(rHex)
    const s = new BigNumber(sHex)
    const isOdd = recoverParmas % 2
    const kG = PublicKey.fromSec((isOdd ? '03' : '02') + rHex.slice(2)).point
    const p = kG.mul(s).add(G(N.minus(z.modulo(N)))).mul(r.pow(N.minus(2), N))
    return new PublicKey(p)
  }

  static fromSec (secStr) {
    const head = secStr.slice(0, 2)
    const x = secStr.slice(2, 66)
    const p = new Point('0x' + x, '0x00')
    if (head === '04') {
      const y = secStr.slice(66)
      p.y = p.y.add('0x' + y)
      return new PublicKey(p)
    }

    // y^2 = x^3 + 7

    const alpha = p.x.pow(3).add(7)
    p.y = alpha.sqrt()
    if (head === '03') {
      if (!p.y.isOdd()) {
        p.y = p.y.complement()
      }
      return new PublicKey(p)
    }

    if (p.y.isOdd()) {
      p.y = p.y.complement()
    }

    return new PublicKey(p)
  }

  verify (msgHash, rHex, sHex) {
    const z = new BigNumber(msgHash)
    const r = new BigNumber(rHex)
    const s = new BigNumber(sHex)
    // u = z/s
    // v = r/s
    const u = z.times(s.pow(N.minus(2), N)).modulo(N)
    const v = r.times(s.pow(N.minus(2), N)).modulo(N)
    return G(u).add(this.point.mul(v)).x.eq(r)
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
    // ref https://github.com/bitcoinjs/bs58check/blob/master/base.js#L8
    const h160 = hash160(Buffer.from(this.toSec(compressed), 'hex'))
    const prefix = (testnet) ? Buffer.from('6f', 'hex') : Buffer.from('00', 'hex')
    const concat = Buffer.concat([prefix, h160])
    const address = bs58.encode(Buffer.concat([concat, sha256(sha256(concat)).slice(0, 4)]))
    return address
  }
}

exports = module.exports = PublicKey
