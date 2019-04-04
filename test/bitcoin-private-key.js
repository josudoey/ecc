
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
    assert.strictEqual(hex(keyPair.getPublic().getX().toString(16)), key.point.x.hex())
    assert.strictEqual(hex(keyPair.getPublic().getY().toString(16)), key.point.y.hex())
  })

  it('ecRecover', function () {
    const msgHash = '000000000000000000000000000000000000000000000000000000000000000f'
    const expectSignature = keyPair.sign(msgHash)
    const rHex = '0x' + expectSignature.r.toString(16)

    const r = key.ecRecover(
      '0x' + msgHash,
      '0x' + expectSignature.r.toString(16),
      '0x' + expectSignature.s.toString(16)
    )
    assert.strictEqual(r, rHex)
    assert(keyPair.verify(msgHash, {
      r: expectSignature.r.toString(16),
      s: expectSignature.s.toString(16)
    }))
  }).timeout(10000)

  it('sign', function () {
    const msgHash = '000000000000000000000000000000000000000000000000000000000000000f'
    const signature = key.sign('0x' + msgHash)
    assert(keyPair.verify(msgHash, signature))
  }).timeout(10000)
})
