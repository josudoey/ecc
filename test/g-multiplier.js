
/* eslint-env mocha */
const assert = require('assert')

const G = require('../secp256k1/g-multiplier')

describe('g-multiplier', function () {
  it('G', function () {
    const g1 = G(1)
    assert.strictEqual(g1.x.toString(), '0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798')
    assert.strictEqual(g1.y.toString(), '0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8')
  })

  it('2 * G', function () {
    const g2 = G(2)
    assert.strictEqual(g2.x.toString(), '0xc6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5')
    assert.strictEqual(g2.y.toString(), '0x1ae168fea63dc339a3c58419466ceaeef7f632653266d0e1236431a950cfe52a')
  })

  it('7 * G', function () {
    const g7 = G(7)
    assert.strictEqual(g7.x.toString(), '0x5cbdf0646e5db4eaa398f365f2ea7a0e3d419b7e0330e39ce92bddedcac4f9bc')
    assert.strictEqual(g7.y.toString(), '0x6aebca40ba255960a3178d6d861a54dba813d0b813fde7b5a5082628087264da')
  })

  it('1485 * G', function () {
    const p = G(1485)
    assert.strictEqual(p.x.toString(), '0xc982196a7466fbbbb0e27a940b6af926c1a74d5ad07128c82824a11b5398afda')
    assert.strictEqual(p.y.toString(), '0x7a91f9eae64438afb9ce6448a1c133db2d8fb9254e4546b6f001637d50901f55')
  })

  it('2**128 * G', function () {
    const p = G('0x100000000000000000000000000000000')
    assert.strictEqual(p.x.toString(), '0x8f68b9d2f63b5f339239c1ad981f162ee88c5678723ea3351b7b444c9ec4c0da')
    assert.strictEqual(p.y.toString(), '0x662a9f2dba063986de1d90c2b6be215dbbea2cfe95510bfdf23cbf79501fff82')
  })

  it('2**240+2**31 * G', function () {
    const p = G('0x1000000000000000000000000000000000000000000000000000080000000')
    assert.strictEqual(p.x.toString(), '0x9577ff57c8234558f293df502ca4f09cbc65a6572c842b39b366f21717945116')
    assert.strictEqual(p.y.toString(), '0x10b49c67fa9365ad7b90dab070be339a1daf9052373ec30ffae4f72d5e66d053')
  })

  it('(N-1) * G', function () {
    const p = G('0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364140')
    assert.strictEqual(p.x.toString(), '0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798')
    assert.strictEqual(p.y.toString(), '0xb7c52588d95c3b9aa25b0403f1eef75702e84bb7597aabe663b82f6f04ef2777')
  }).timeout(10000)

  it('N * G', function () {
    const p = G('0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141')
    assert.strictEqual(p.x.toString(), 'NaN')
    assert.strictEqual(p.y.toString(), 'NaN')
  }).timeout(10000)
})
