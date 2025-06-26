const BasePublicKey = require('../public-key')
const sha3 = require('js-sha3')

const keccak256 = function (data) {
  return Buffer.from(sha3.keccak256.create().update(data).digest())
}

class PublicKey extends BasePublicKey {
  static from (data) {
    const p = BasePublicKey.from(data)
    return new PublicKey(p.x, p.y)
  }

  toAddress () {
    // ref https://github.com/ethereumjs/ethereumjs-util/blob/master/src/account.ts#L142
    const address = keccak256(Buffer.from(this.toSec(false), 'hex').subarray(1)).subarray(-20)
    return `0x${address.toString('hex')}`
  }

  toChecksumAddress () {
    const address = keccak256(Buffer.from(this.toSec(false), 'hex').subarray(1)).subarray(-20).toString('hex')
    const hash = keccak256(address).toString('hex')
    let ret = '0x'

    for (let i = 0; i < address.length; i++) {
      if (parseInt(hash[i], 16) >= 8) {
        ret += address[i].toUpperCase()
      } else {
        ret += address[i]
      }
    }

    return ret
  }
}

exports = module.exports = PublicKey
