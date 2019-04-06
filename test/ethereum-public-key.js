
/* eslint-env mocha */
const assert = require('assert')
const PrivateKey = require('../secp256k1/ethereum/private-key')
const PublicKey = require('../secp256k1/ethereum/public-key')
const G = require('../secp256k1/g-multiplier')
const EC = require('elliptic').ec
const ec = new EC('secp256k1')

const hex = function (n) {
  const hex = `0000000000000000000000000000000000000000000000000000000000000000${n.toString(16)}`.slice(-64)
  return `${hex}`
}

describe('public-key', function () {
  it('eth address for 1G', function () {
    const p = G(1)
    const key = new PublicKey(p)

    const address = '0x7e5f4552091a69125d5dfcb7b8c2659029395bdf'
    assert.strictEqual(key.toAddress(), address)
  })

  it('eth checksum address for 1G', function () {
    const p = G(1)
    const key = new PublicKey(p)

    const address = '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf'
    assert.strictEqual(key.toChecksumAddress(), address)
  })
})
