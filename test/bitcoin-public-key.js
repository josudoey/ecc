
/* eslint-env mocha */
const assert = require('assert')
const PrivateKey = require('../secp256k1/bitcoin/private-key')
const PublicKey = require('../secp256k1/bitcoin/public-key')
const G = require('../secp256k1/g-multiplier')
const EC = require('elliptic').ec
const ec = new EC('secp256k1')

const hex = function (n) {
  const hex = `0000000000000000000000000000000000000000000000000000000000000000${n.toString(16)}`.slice(-64)
  return `${hex}`
}

describe('public-key', function () {
  it('sec for 2G ', function () {
    const p = G(2)
    const key = new PublicKey(p)
    const uncompressed = '04c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee51ae168fea63dc339a3c58419466ceaeef7f632653266d0e1236431a950cfe52a'
    const compressed = '02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5'
    assert.strictEqual(key.toSec(false), uncompressed)
    assert.strictEqual(key.toSec(true), compressed)
  })

  it('sec for 16G', function () {
    const p = G(16)
    const key = new PublicKey(p)
    const uncompressed = '04e60fce93b59e9ec53011aabc21c23e97b2a31369b87a5ae9c44ee89e2a6dec0af7e3507399e595929db99f34f57937101296891e44d23f0be1f32cce69616821'
    const compressed = '03e60fce93b59e9ec53011aabc21c23e97b2a31369b87a5ae9c44ee89e2a6dec0a'
    assert.strictEqual(key.toSec(false), uncompressed)
    assert.strictEqual(key.toSec(true), compressed)
  })

  it('p2pkh address for 1G', function () {
    const p = G(1)
    const key = new PublicKey(p)

    const mainnet = '1BgGZ9tcN4rm9KBzDn7KprQz87SZ26SAMH'
    const testnet = 'mrCDrCybB6J1vRfbwM5hemdJz73FwDBC8r'
    assert.strictEqual(key.toAddress(), mainnet)
    assert.strictEqual(key.toAddress(true), testnet)
  })
})
