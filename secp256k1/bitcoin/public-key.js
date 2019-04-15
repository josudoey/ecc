const crypto = require('crypto')
const bs58 = require('bs58')

const BasePublicKey = require('../public-key')

const sha256 = function (data) {
  return crypto.createHash('sha256').update(data).digest()
}
const hash160 = function (data) {
  return crypto.createHash('ripemd160').update(sha256(data)).digest()
}

class PublicKey extends BasePublicKey {
  static from (data) {
    const p = BasePublicKey.from(data)
    return new PublicKey(p.x, p.y)
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
