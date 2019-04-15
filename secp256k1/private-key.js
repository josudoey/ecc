const crypto = require('crypto')
const PublicKey = require('./public-key')
const BN = require('bn.js')
const N = new BN('fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141', 'hex')
const redN = BN.red(N)
const G = PublicKey.G

class PrivateKey {
  constructor (secret) {
    this.secret = new BN(secret, 'hex')
    this.publicKey = G(this.secret)
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
