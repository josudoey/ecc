const crypto = require('crypto')
const PublicKey = require('./public-key')
const BN = require('bn.js')
const Ber = require('asn1').Ber
const N = new BN('fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141', 'hex')
const redN = BN.red(N)
const G = PublicKey.G

class PrivateKey {
  constructor (secret) {
    this.secret = new BN(secret, 'hex')
    this.publicKey = G(this.secret)
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
    const privateKey = new PrivateKey(reader.readString(Ber.OctetString, true))

    reader.readSequence()
    if (reader.peek() !== Ber.OID) {
      return privateKey
    }
    // see https://oid-info.com/get/1.3.132.0.10
    reader.readOID() // 1.3.132.0.10 (ansip256k1)
    reader.readSequence()
    if (reader.peek() !== Ber.BitString) {
      return privateKey
    }

    const publicKeyString = reader.readString(Ber.BitString, true)
    const publicKey = PublicKey.from(
      publicKeyString.slice(1)
    )

    if (privateKey.getPublic().toSec() !== publicKey.toSec()) {
      throw new Error('invalid private key')
    }
    return privateKey
  }

  toPEM () {
    const privateKey = this.secret.toBuffer()
    const publicKey = Buffer.concat(
      [Buffer.from([0x00]), this.getPublic().toBuffer(false)]
    )

    const writer = new Ber.Writer()
    writer.startSequence()
    writer.writeInt(1, Ber.Integer) // version
    writer.writeBuffer(privateKey, Ber.OctetString)

    writer.startSequence(0xa0) // OPTIONAL 0
    writer.writeOID('1.3.132.0.10', Ber.OID)
    writer.endSequence()

    writer.startSequence(0xa1) // OPTIONAL 1
    writer.writeBuffer(publicKey, Ber.BitString)
    writer.endSequence()

    writer.endSequence()

    const base64text = writer.buffer.toString('base64').split(/(.{64})/g).filter(v => v).join('\n')
    return `-----BEGIN EC PRIVATE KEY-----\n${base64text}\n-----END EC PRIVATE KEY-----\n`
  }

  getPublic () {
    return this.publicKey
  }

  getPublicKey () {
    return Buffer.from(this.publicKey.toBuffer(false), 'hex')
  }

  ecdhSecret (otherPublicKey) {
    const otherKey = PublicKey.from(otherPublicKey.toString('hex'), 'hex')
    const secret = otherKey.mul(this.secret).x
    return secret.toString('hex', 64)
  }

  sign (msgHash) {
    const z = new BN(msgHash, 'hex').toRed(redN)
    const k = new BN(crypto.randomBytes(32).toString('hex'), 'hex').toRed(redN)
    // def k = random n
    // def P = eG
    // def kG = uG + vP
    // =>  kG = uG + zeG

    // def r = kG.x
    // def u = z/s
    // def v = r/s

    //     kG = uG + vP
    // =>  kG = (z/s)G + (r/s)P
    // => skG = zG + rP
    // =>  sG = (z/k)G + (r/k)P
    // =>  sG = (z/k)G + (r/k)P
    // =>  sG = (z/k)G + (r/k)eG
    // =>  sG = (z/k)G + (re/k)G
    // =>  sG = ((z+re)/k)G
    // s = (z+re) / k

    const kG = G(k)
    const r = new BN(kG.x).toRed(redN)
    const s = r.redMul(this.secret.toRed(redN)).redAdd(z).redMul(k.redInvm())
    const recoveryParam = (kG.y.isOdd()) ? 1 : 0
    return {
      r: r.toString('hex', 64),
      s: s.toString('hex', 64),
      recoveryParam: recoveryParam
    }
  }
}

exports = module.exports = PrivateKey
