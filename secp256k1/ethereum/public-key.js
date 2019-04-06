const createKeccakHash = require('keccak')

const keccak256 = function (data) {
  return createKeccakHash('keccak256').update(data).digest()
}

class PublicKey {
  constructor (point) {
    this.point = point
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

  toAddress () {
    // ref https://github.com/ethereumjs/ethereumjs-util/blob/master/src/account.ts#L142
    const address = keccak256(Buffer.from(this.toSec(false), 'hex').slice(1)).slice(-20)
    return `0x${address.toString('hex')}`
  }

  toChecksumAddress () {
    const address = keccak256(Buffer.from(this.toSec(false), 'hex').slice(1)).slice(-20).toString('hex')
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
