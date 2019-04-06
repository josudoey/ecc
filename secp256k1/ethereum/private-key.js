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
}

exports = module.exports = PrivateKey
