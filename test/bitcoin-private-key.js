
/* eslint-env mocha */
const assert = require('assert')
const PrivateKey = require('../secp256k1/bitcoin/private-key')
const EC = require('elliptic').ec
const ec = new EC('secp256k1')

const hex = function (n) {
  const hex = `0000000000000000000000000000000000000000000000000000000000000000${n.toString(16)}`.slice(-64)
  return `${hex}`
}

describe('private-key', function () {
  const keyPair = ec.genKeyPair()
  const s = keyPair.getPrivate().toString(16)
  const key = new PrivateKey('0x' + s)

  it('check public key', function () {
    assert.strictEqual(key.point.x.hex(), hex(keyPair.getPublic().getX().toString(16)))
    assert.strictEqual(key.point.y.hex(), hex(keyPair.getPublic().getY().toString(16)))
  })

  it('sign', function () {
    const msgHash = '000000000000000000000000000000000000000000000000000000000000000f'
    const signature = key.sign('0x' + msgHash)
    assert(keyPair.verify(msgHash, signature))
  }).timeout(10000)
})
