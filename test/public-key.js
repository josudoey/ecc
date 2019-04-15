
/* eslint-env mocha */
const assert = require('assert')
const crypto = require('crypto')
const PublicKey = require('../secp256k1/public-key')
const EC = require('elliptic').ec
const ec = new EC('secp256k1')

const Gx = '79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798'
const Gy = '483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8'

describe('public-key', function () {
  it('from', function () {
    const keyPair = crypto.createECDH('secp256k1')
    keyPair.generateKeys()
    const key = PublicKey.from(keyPair.getPublicKey())
    assert.strictEqual(key.toBuffer(false).toString('hex'), keyPair.getPublicKey().toString('hex'))
  })

  it('zero add', function () {
    const g0 = new PublicKey(null, null)
    const g1 = g0.add(new PublicKey(Gx, Gy))
    assert.strictEqual(g1.x.toString('hex', 64), Gx)
    assert.strictEqual(g1.y.toString('hex', 64), Gy)
  })

  it('G+G', function () {
    const g = new PublicKey(Gx, Gy)
    const g2 = g.add(g)
    assert.strictEqual(g2.x.toString('hex', 64), 'c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5')
    assert.strictEqual(g2.y.toString('hex', 64), '1ae168fea63dc339a3c58419466ceaeef7f632653266d0e1236431a950cfe52a')
  })

  it('2 * G', function () {
    const g = new PublicKey(Gx, Gy)
    const g2 = g.mul(2)
    assert.strictEqual(g2.x.toString('hex', 64), 'c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5')
    assert.strictEqual(g2.y.toString('hex', 64), '1ae168fea63dc339a3c58419466ceaeef7f632653266d0e1236431a950cfe52a')
  }).timeout(10000)

  it('G', function () {
    const g1 = PublicKey.G(1)
    assert.strictEqual(g1.x.toString('hex', 64), '79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798')
    assert.strictEqual(g1.y.toString('hex', 64), '483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8')
  })

  it('2 * G', function () {
    const g2 = PublicKey.G(2)
    assert.strictEqual(g2.x.toString('hex', 64), 'c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5')
    assert.strictEqual(g2.y.toString('hex', 64), '1ae168fea63dc339a3c58419466ceaeef7f632653266d0e1236431a950cfe52a')
  })

  it('7 * G', function () {
    const g7 = PublicKey.G(7)
    assert.strictEqual(g7.x.toString('hex', 64), '5cbdf0646e5db4eaa398f365f2ea7a0e3d419b7e0330e39ce92bddedcac4f9bc')
    assert.strictEqual(g7.y.toString('hex', 64), '6aebca40ba255960a3178d6d861a54dba813d0b813fde7b5a5082628087264da')
  })

  it('1485 * G', function () {
    const p = PublicKey.G(1485)
    assert.strictEqual(p.x.toString('hex', 64), 'c982196a7466fbbbb0e27a940b6af926c1a74d5ad07128c82824a11b5398afda')
    assert.strictEqual(p.y.toString('hex', 64), '7a91f9eae64438afb9ce6448a1c133db2d8fb9254e4546b6f001637d50901f55')
  })

  it('2**128 * G', function () {
    const p = PublicKey.G('100000000000000000000000000000000')
    assert.strictEqual(p.x.toString('hex', 64), '8f68b9d2f63b5f339239c1ad981f162ee88c5678723ea3351b7b444c9ec4c0da')
    assert.strictEqual(p.y.toString('hex', 64), '662a9f2dba063986de1d90c2b6be215dbbea2cfe95510bfdf23cbf79501fff82')
  })

  it('2**240+2**31 * G', function () {
    const p = PublicKey.G('1000000000000000000000000000000000000000000000000000080000000')
    assert.strictEqual(p.x.toString('hex', 64), '9577ff57c8234558f293df502ca4f09cbc65a6572c842b39b366f21717945116')
    assert.strictEqual(p.y.toString('hex', 64), '10b49c67fa9365ad7b90dab070be339a1daf9052373ec30ffae4f72d5e66d053')
  })

  it('(N-1) * G', function () {
    const p = PublicKey.G('fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364140')
    assert.strictEqual(p.x.toString('hex', 64), '79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798')
    assert.strictEqual(p.y.toString('hex', 64), 'b7c52588d95c3b9aa25b0403f1eef75702e84bb7597aabe663b82f6f04ef2777')
  }).timeout(10000)

  it('N * G', function () {
    const p = PublicKey.G('fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141')
    assert.strictEqual(p.x.toString('hex', 64), '')
    assert.strictEqual(p.y.toString('hex', 64), '')
  }).timeout(10000)

  it('(N+1) * G', function () {
    const p = PublicKey.G('fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364142')
    assert.strictEqual(p.x.toString('hex', 64), '79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798')
    assert.strictEqual(p.y.toString('hex', 64), '483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8')
  }).timeout(10000)

  it('verify', function () {
    const msgHash = '000000000000000000000000000000000000000000000000000000000000000f'
    const key = new PublicKey(
      '3bc6bc6446bf520136358eb0958dc4aa9e733164dd2d62e151f946107427bacc',
      '8e305cc07176c305cdb62ee226d6c02bd71b75a5228beb4714c33fd5ead6fda6'
    )
    const signature = {
      r: 'aba2626781daf2ab4073eeef3ce69245a7d3e6febbdeec5d946d47d07154e164',
      s: '7ec7f07518735f0b87927b0c06251fd6ab691f437226ba6f92d1d1f80dbc56db'
    }
    assert(key.verify(msgHash, signature.r, signature.s))

    const keyPair = ec.keyFromPrivate('f000000000000000000000000000000000000000000000000000000000000000', 'hex')
    assert(keyPair.verify(msgHash, signature))
    const sig = keyPair.sign(msgHash)
    assert(key.verify(msgHash, sig.r.toString('hex', 32), sig.s.toString('hex', 32)))
  }).timeout(40000)

  it('recover', function () {
    const msgHash = '000000000000000000000000000000000000000000000000000000000000000f'
    const signature = {
      r: 'aba2626781daf2ab4073eeef3ce69245a7d3e6febbdeec5d946d47d07154e164',
      s: '7ec7f07518735f0b87927b0c06251fd6ab691f437226ba6f92d1d1f80dbc56db',
      recoveryParam: 0
    }
    assert.strictEqual(
      PublicKey.recover(msgHash, signature.r, signature.s, signature.recoveryParam).toSec(false),
      '043bc6bc6446bf520136358eb0958dc4aa9e733164dd2d62e151f946107427bacc8e305cc07176c305cdb62ee226d6c02bd71b75a5228beb4714c33fd5ead6fda6'
    )

    const keyPair = ec.keyFromPrivate('f000000000000000000000000000000000000000000000000000000000000000', 'hex')
    assert(keyPair.verify(msgHash, signature))
    const sig = keyPair.sign(msgHash)

    assert.strictEqual(
      PublicKey.recover(msgHash, sig.r.toString('hex', 64), sig.s.toString('hex', 64), sig.recoveryParam).toSec(false),
      '043bc6bc6446bf520136358eb0958dc4aa9e733164dd2d62e151f946107427bacc8e305cc07176c305cdb62ee226d6c02bd71b75a5228beb4714c33fd5ead6fda6'
    )
  }).timeout(40000)
})
