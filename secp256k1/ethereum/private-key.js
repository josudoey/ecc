const BigNumber = require('bignumber.js')
const G = require('../g-multiplier')
const PublicKey = require('./public-key')

class PrivateKey {
  constructor (secret) {
    this.secret = new BigNumber(secret)
    this.point = G(this.secret)
    this.publicKey = new PublicKey(this.point)
  }
}

exports = module.exports = PrivateKey
