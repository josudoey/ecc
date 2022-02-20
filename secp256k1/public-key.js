const BN = require('bn.js')
const Ber = require('asn1').Ber
const k256 = BN.red('k256')
const two = new BN(2).toRed(k256)
const three = new BN(3).toRed(k256)
const seven = new BN(7).toRed(k256)

const square = new BN(2)
const cube = new BN(3)
const N = new BN('fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141', 'hex')
const redN = BN.red(N)
const bitIsTrue = function (hex, bitIndex) {
  const byteIndex = parseInt(bitIndex / 8) + 1
  const byte = parseInt(hex.substr(byteIndex * -2, 2), 16)
  const offset = bitIndex % 8
  return !!(1 << offset & byte)
}

const gX = '79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798'
const gY = '483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8'

class PublicKey {
  constructor (bnX, bnY) {
    this.x = new BN(bnX, 'hex')
    this.y = new BN(bnY, 'hex')
  }

  static fromPEM (pem) {
    const buffer = Buffer.from(pem.split('\n').slice(1, -1).join(''), 'base64')

    // see https://datatracker.ietf.org/doc/html/rfc5915#section-3
    const reader = new Ber.Reader(buffer)
    reader.readSequence()
    if (reader.peek() !== Ber.Integer) {
      return
    }
    reader.readInt(Ber.Integer) // version
    reader.readString(Ber.OctetString, true)

    reader.readSequence()
    if (reader.peek() !== Ber.OID) {
      throw new Error('invalid pem format')
    }
    // see https://oid-info.com/get/1.3.132.0.10
    reader.readOID() // 1.3.132.0.10 (ansip256k1)
    reader.readSequence()
    if (reader.peek() !== Ber.BitString) {
      throw new Error('invalid pem format')
    }

    const publicKeyString = reader.readString(Ber.BitString, true)
    const publicKey = PublicKey.from(
      publicKeyString.slice(1)
    )

    return publicKey
  }

  isNaN () {
    return this.x.eq(new BN(null))
  }

  add (other) {
    if (this.isNaN()) {
      return new PublicKey(other.x, other.y)
    }

    if (!this.x.eq(other.x)) {
      // s = (y2-y1)/(x2-x1)
      // x = (s^2 - x1) - x2
      // y = s(x1-x3) - y1
      const y1 = this.y.toRed(k256)
      const x1 = this.x.toRed(k256)
      const x2 = other.x.toRed(k256)
      const y2 = other.y.toRed(k256)
      const s = y2.redSub(y1).redMul(x2.redSub(x1).redInvm())
      const x = s.redPow(square).redSub(x1).redSub(x2)
      const y = s.redMul(x1.redSub(x)).redSub(y1)
      return new PublicKey(x.fromRed(), y.fromRed())
    }

    if (!this.y.eq(other.y)) {
      return new PublicKey(null, null)
    }

    // a = 0
    // s = 3(x^2 +a) / 2y
    // x = s^2 - 2x1
    // y = s(x1 - x) - y1
    const y1 = this.y.toRed(k256)
    const x1 = this.x.toRed(k256)
    const s = x1.redPow(square).redMul(three).redMul(y1.redMul(two).redInvm())
    const x = s.redPow(square).redSub(x1.redMul(two))
    const y = s.redMul(x1.redSub(x)).redSub(y1)
    return new PublicKey(x.fromRed(), y.fromRed())
  }

  mul (coefficient) {
    const hex = new BN(coefficient, 'hex').toString('hex', 64)
    let now = this
    let result = new PublicKey(null, null)
    for (let i = 0; i < 256; i++) {
      if (bitIsTrue(hex, i)) {
        result = result.add(now)
      }
      now = now.add(now)
    }
    return result
  }

  verify (msgHash, rHex, sHex) {
    const z = new BN(msgHash, 'hex').toRed(redN)
    const r = new BN(rHex, 'hex').toRed(redN)
    const s = new BN(sHex, 'hex').toRed(redN)
    // def kG = uG + zeG
    // def kG = uG + vP
    // def u = z/s
    // def v = r/s
    // def s = (z+re) / k

    // def kG.x = r

    const u = z.redMul(s.redInvm())
    const v = r.redMul(s.redInvm())
    return PublicKey.G(u.fromRed()).add(this.mul(v.fromRed())).x.eq(r)
  }

  toSec (compressed = true) {
    if (!compressed) {
      return `04${this.x.toString('hex', 64)}${this.y.toString('hex', 64)}`
    }

    if (this.y.isOdd()) {
      return `03${this.x.toString('hex', 64)}`
    }

    return `02${this.x.toString('hex', 64)}`
  }

  toBuffer (compressed = true) {
    return Buffer.from(this.toSec(compressed), 'hex')
  }

  toString (compressed = true) {
    return this.toSec(compressed)
  }

  static G (coefficient) {
    const g = new PublicKey(gX, gY)
    return g.mul(coefficient)
  }

  static from (data) {
    const hex = data.toString('hex')
    const head = hex.slice(0, 2)
    const x = new BN(hex.slice(2, 66), 'hex').toRed(k256)
    if (head === '04') {
      const y = new BN(hex.slice(66), 'hex')
      return new PublicKey(x.fromRed(), y)
    }

    // def y^2 = x^3 + 7
    const alpha = x.redPow(cube).redAdd(seven)
    const y = alpha.redSqrt()
    if (head === '03') {
      if (!y.isOdd()) {
        return new PublicKey(x.fromRed(), y.redNeg().fromRed())
      }
      return new PublicKey(x.fromRed(), y.fromRed())
    }

    if (head === '02') {
      if (y.isOdd()) {
        return new PublicKey(x.fromRed(), y.redNeg().fromRed())
      }
      return new PublicKey(x.fromRed(), y.fromRed())
    }

    throw new Error('invalid format')
  }

  static recover (msgHash, rHex, sHex, recoverParmas) {
    // def kG.x = r
    // def r = sv
    // def u = sz

    // kG = uG + vP
    // skG = suG + svP
    // skG = zG + svP
    // skG +(-z)G = svP
    // svP = skG +(-z)G
    // (sv/r)P = ((s/r)kG) + (-z/r)G
    // P =  (s/r(kG) + (-z/r)G

    const z = new BN(msgHash, 'hex').toRed(redN)
    const r = new BN(rHex, 'hex').toRed(redN)
    const rInv = r.redInvm()
    const s = new BN(sHex, 'hex').toRed(redN)
    const isOdd = new BN(recoverParmas).isOdd()
    const kG = PublicKey.from((isOdd ? '03' : '02') + r.toString('hex', 64))
    const p = kG.mul(s.redMul(rInv)).add(PublicKey.G(z.redNeg().redMul(rInv)))
    return p
  }
}

exports = module.exports = PublicKey
