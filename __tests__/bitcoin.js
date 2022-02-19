
/* eslint-env jest */
const assert = require('assert')
const PublicKey = require('../secp256k1/bitcoin/public-key')

describe('public-key', function () {
  it('p2pkh address for 1G', function () {
    const key = PublicKey.from(PublicKey.G(1))

    const mainnet = '1BgGZ9tcN4rm9KBzDn7KprQz87SZ26SAMH'
    const testnet = 'mrCDrCybB6J1vRfbwM5hemdJz73FwDBC8r'
    assert.strictEqual(key.toAddress(), mainnet)
    assert.strictEqual(key.toAddress(true), testnet)
  })
})
