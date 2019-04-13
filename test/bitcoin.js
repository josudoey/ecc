
/* eslint-env mocha */
const crypto = require('crypto')
const assert = require('assert')
const PublicKey = require('../secp256k1/bitcoin/public-key')
const PrivateKey = require('../secp256k1/bitcoin/private-key')
const G = require('../secp256k1/g-multiplier')
const EC = require('elliptic').ec
const ec = new EC('secp256k1')
const Bolt11 = require('bolt11')
const Bech32 = require('bech32')
let hexToDecimal = (x) => ec.keyFromPrivate(x, 'hex').getPrivate().toString(10)

describe('private-key', function () {
  it('check public key', function () {
    const privateKeyHex = 'f000000000000000000000000000000000000000000000000000000000000000'
    const key = new PrivateKey('0x' + privateKeyHex)
    assert.strictEqual(key.publicKey.toSec(false), '043bc6bc6446bf520136358eb0958dc4aa9e733164dd2d62e151f946107427bacc8e305cc07176c305cdb62ee226d6c02bd71b75a5228beb4714c33fd5ead6fda6')

    const keyPair = ec.keyFromPrivate(privateKeyHex, 'hex')
    assert.strictEqual(key.point.x.hex(), keyPair.getPublic().getX().toString(16))
    assert.strictEqual(key.point.y.hex(), keyPair.getPublic().getY().toString(16))
  })

  it('sign', function () {
    const privateKeyHex = 'f000000000000000000000000000000000000000000000000000000000000000'
    const key = new PrivateKey('0x' + privateKeyHex)
    const msgHash = '000000000000000000000000000000000000000000000000000000000000000f'
    const signature = key.sign('0x' + msgHash)

    const keyPair = ec.keyFromPrivate(privateKeyHex, 'hex')
    assert(keyPair.verify(msgHash, signature))
    const p = ec.recoverPubKey(msgHash, signature, signature.recoveryParam)
    assert.strictEqual(p.x.toString('hex', 32), '3bc6bc6446bf520136358eb0958dc4aa9e733164dd2d62e151f946107427bacc')
    assert.strictEqual(p.y.toString('hex', 32), '8e305cc07176c305cdb62ee226d6c02bd71b75a5228beb4714c33fd5ead6fda6')
  }).timeout(10000)

  function convert (data, inBits, outBits) {
    let value = 0
    let bits = 0
    let maxV = (1 << outBits) - 1

    let result = []
    for (let i = 0; i < data.length; ++i) {
      value = (value << inBits) | data[i]
      bits += inBits

      while (bits >= outBits) {
        bits -= outBits
        result.push((value >> bits) & maxV)
      }
    }

    if (bits > 0) {
      result.push((value << (outBits - bits)) & maxV)
    }

    return result
  }

  function wordsToBuffer (words, trim) {
    let buffer = Buffer.from(convert(words, 5, 8, true))
    if (trim && words.length * 5 % 8 !== 0) {
      buffer = buffer.slice(0, -1)
    }
    return buffer
  }
})

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

  it('fromSec for 2G', function () {
    const uncompressed = '04c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee51ae168fea63dc339a3c58419466ceaeef7f632653266d0e1236431a950cfe52a'
    const uncompressedKey = PublicKey.fromSec(uncompressed)
    assert.strictEqual(uncompressedKey.point.x.hex(), 'c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5')
    assert.strictEqual(uncompressedKey.point.y.hex(), '1ae168fea63dc339a3c58419466ceaeef7f632653266d0e1236431a950cfe52a')

    const compressed = '02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5'
    const compressedKey = PublicKey.fromSec(compressed)
    assert.strictEqual(compressedKey.point.x.hex(), 'c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5')
    assert.strictEqual(compressedKey.point.y.hex(), '1ae168fea63dc339a3c58419466ceaeef7f632653266d0e1236431a950cfe52a')
  })

  it('fromSec for 16G', function () {
    const uncompressed = '04e60fce93b59e9ec53011aabc21c23e97b2a31369b87a5ae9c44ee89e2a6dec0af7e3507399e595929db99f34f57937101296891e44d23f0be1f32cce69616821'
    const uncompressedKey = PublicKey.fromSec(uncompressed)
    assert.strictEqual(uncompressedKey.point.x.hex(), 'e60fce93b59e9ec53011aabc21c23e97b2a31369b87a5ae9c44ee89e2a6dec0a')
    assert.strictEqual(uncompressedKey.point.y.hex(), 'f7e3507399e595929db99f34f57937101296891e44d23f0be1f32cce69616821')

    const compressed = '03e60fce93b59e9ec53011aabc21c23e97b2a31369b87a5ae9c44ee89e2a6dec0a'
    const compressedKey = PublicKey.fromSec(compressed)
    assert.strictEqual(compressedKey.point.x.hex(), 'e60fce93b59e9ec53011aabc21c23e97b2a31369b87a5ae9c44ee89e2a6dec0a')
    assert.strictEqual(compressedKey.point.y.hex(), 'f7e3507399e595929db99f34f57937101296891e44d23f0be1f32cce69616821')
  })

  it('verify', function () {
    const msgHash = '000000000000000000000000000000000000000000000000000000000000000f'
    const pubkeySec = '043bc6bc6446bf520136358eb0958dc4aa9e733164dd2d62e151f946107427bacc8e305cc07176c305cdb62ee226d6c02bd71b75a5228beb4714c33fd5ead6fda6'
    const key = PublicKey.fromSec(pubkeySec)
    const signature = {
      r: 'aba2626781daf2ab4073eeef3ce69245a7d3e6febbdeec5d946d47d07154e164',
      s: '7ec7f07518735f0b87927b0c06251fd6ab691f437226ba6f92d1d1f80dbc56db'
    }
    assert(key.verify('0x' + msgHash, '0x' + signature.r, '0x' + signature.s))

    const keyPair = ec.keyFromPrivate('f000000000000000000000000000000000000000000000000000000000000000', 'hex')
    assert(keyPair.verify(msgHash, signature))
    const sig = keyPair.sign(msgHash)
    assert(key.verify('0x' + msgHash, '0x' + sig.r.toString('hex', 32), '0x' + sig.s.toString('hex', 32)))
  }).timeout(20000)

  it('recover', function () {
    const msgHash = '000000000000000000000000000000000000000000000000000000000000000f'
    const signature = {
      r: 'aba2626781daf2ab4073eeef3ce69245a7d3e6febbdeec5d946d47d07154e164',
      s: '7ec7f07518735f0b87927b0c06251fd6ab691f437226ba6f92d1d1f80dbc56db',
      recoveryParam: 0
    }
    assert.strictEqual(
      PublicKey.recover('0x' + msgHash, '0x' + signature.r, '0x' + signature.s, signature.recoveryParam).toSec(false),
      '043bc6bc6446bf520136358eb0958dc4aa9e733164dd2d62e151f946107427bacc8e305cc07176c305cdb62ee226d6c02bd71b75a5228beb4714c33fd5ead6fda6'
    )

    const keyPair = ec.keyFromPrivate('f000000000000000000000000000000000000000000000000000000000000000', 'hex')
    assert(keyPair.verify(msgHash, signature))
    const sig = keyPair.sign(msgHash)

    assert.strictEqual(
      PublicKey.recover('0x' + msgHash, '0x' + sig.r.toString('hex', 32), '0x' + sig.s.toString('hex', 32), sig.recoveryParam).toSec(false),
      '043bc6bc6446bf520136358eb0958dc4aa9e733164dd2d62e151f946107427bacc8e305cc07176c305cdb62ee226d6c02bd71b75a5228beb4714c33fd5ead6fda6'
    )
  }).timeout(20000)

  it('ecdhSecret', function () {
    const alice = new PrivateKey('0xf000000000000000000000000000000000000000000000000000000000000000')
    const bob = crypto.createECDH('secp256k1')
    bob.generateKeys()
    const aliceSecret = alice.ecdhSecret(bob.getPublicKey())
    const bobSecret = bob.computeSecret(alice.getPublicKey(), null, 'hex')
    assert.strictEqual(aliceSecret, bobSecret)
  }).timeout(20000)

  it('p2pkh address for 1G', function () {
    const p = G(1)
    const key = new PublicKey(p)

    const mainnet = '1BgGZ9tcN4rm9KBzDn7KprQz87SZ26SAMH'
    const testnet = 'mrCDrCybB6J1vRfbwM5hemdJz73FwDBC8r'
    assert.strictEqual(key.toAddress(), mainnet)
    assert.strictEqual(key.toAddress(true), testnet)
  })
})
