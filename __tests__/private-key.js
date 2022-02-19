/* eslint-env jest */
const crypto = require('crypto')
const assert = require('assert')
const PrivateKey = require('../secp256k1/private-key')
const EC = require('elliptic').ec
const ec = new EC('secp256k1')

describe('private-key', function () {
  it('check public key', function () {
    const privateKeyHex = 'f000000000000000000000000000000000000000000000000000000000000000'
    const key = new PrivateKey(privateKeyHex)
    assert.strictEqual(key.publicKey.toSec(false), '043bc6bc6446bf520136358eb0958dc4aa9e733164dd2d62e151f946107427bacc8e305cc07176c305cdb62ee226d6c02bd71b75a5228beb4714c33fd5ead6fda6')

    const keyPair = ec.keyFromPrivate(privateKeyHex, 'hex')
    assert.strictEqual(key.getPublic().x.toString('hex', 64), keyPair.getPublic().getX().toString(16))
    assert.strictEqual(key.getPublic().y.toString('hex', 64), keyPair.getPublic().getY().toString(16))
  })

  it('sign', function () {
    const privateKeyHex = 'f000000000000000000000000000000000000000000000000000000000000000'
    const key = new PrivateKey(privateKeyHex)
    const msgHash = '000000000000000000000000000000000000000000000000000000000000000f'
    const signature = key.sign(msgHash)

    const keyPair = ec.keyFromPrivate(privateKeyHex, 'hex')

    assert(keyPair.verify(msgHash, signature))
    const p = ec.recoverPubKey(msgHash, signature, signature.recoveryParam)
    assert.strictEqual(p.x.toString('hex', 64), '3bc6bc6446bf520136358eb0958dc4aa9e733164dd2d62e151f946107427bacc')
    assert.strictEqual(p.y.toString('hex', 64), '8e305cc07176c305cdb62ee226d6c02bd71b75a5228beb4714c33fd5ead6fda6')
  })

  it('ecdhSecret', function () {
    const alice = new PrivateKey('f000000000000000000000000000000000000000000000000000000000000000')
    const bob = crypto.createECDH('secp256k1')
    bob.generateKeys()
    const aliceSecret = alice.ecdhSecret(bob.getPublicKey())
    const bobSecret = bob.computeSecret(alice.publicKey.toBuffer(), null, 'hex')
    assert.strictEqual(aliceSecret, bobSecret)
  })
})
