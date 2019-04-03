
/* eslint-env mocha */
const assert = require('assert')

const Point = require('../lib/point')

const Gx = '0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798'
const Gy = '0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8'

describe('point', function () {
  it('zero add', function () {
    const g0 = Point(NaN, NaN)
    const g1 = g0.add(Point(Gx, Gy))
    assert.strictEqual(g1.x.toString(), Gx)
    assert.strictEqual(g1.y.toString(), Gy)
  })

  it('G+G', function () {
    const g = Point(Gx, Gy)
    const g2 = g.add(g)
    assert.strictEqual(g2.x.toString(), '0xc6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5')
    assert.strictEqual(g2.y.toString(), '0x1ae168fea63dc339a3c58419466ceaeef7f632653266d0e1236431a950cfe52a')
  })

  it('7 * G', function () {
    const g = Point(Gx, Gy)
    const g1 = g.mul(1)
    assert.strictEqual(g1.x.toString(), '0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798')
    assert.strictEqual(g1.y.toString(), '0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8')

    const g2 = g.mul(2)
    assert.strictEqual(g2.x.toString(), '0xc6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5')
    assert.strictEqual(g2.y.toString(), '0x1ae168fea63dc339a3c58419466ceaeef7f632653266d0e1236431a950cfe52a')

    const g7 = g.mul(7)
    assert.strictEqual(g7.x.toString(), '0x5cbdf0646e5db4eaa398f365f2ea7a0e3d419b7e0330e39ce92bddedcac4f9bc')
    assert.strictEqual(g7.y.toString(), '0x6aebca40ba255960a3178d6d861a54dba813d0b813fde7b5a5082628087264da')
  })
})
