/* eslint-env jest */
const assert = require('assert')
const PublicKey = require('../secp256k1/ethereum/public-key')

describe('public-key', function () {
  it('eth address for 1G', function () {
    const key = PublicKey.from(PublicKey.G(1))
    const address = '0x7e5f4552091a69125d5dfcb7b8c2659029395bdf'
    assert.strictEqual(key.toAddress(), address)
  })

  it('eth checksum address for 1G', function () {
    const key = PublicKey.from(PublicKey.G(1))
    const address = '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf'
    assert.strictEqual(key.toChecksumAddress(), address)
  })
})
