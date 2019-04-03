
/* eslint-env mocha */
const assert = require('assert')
const FieldElemet = require('../lib/field-element')
describe('field element', function () {
  it('init', function () {
    const n = FieldElemet('0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141')
    assert.strictEqual(n.num.toString(16), '0')
    const n1 = FieldElemet('0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364142')
    assert.strictEqual(n1.num.toString(16), '1')

    const n2 = FieldElemet('-1')
    assert.strictEqual(n2.num.toString(16), 'fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364140')
  })

  it('add', function () {
    const n2 = FieldElemet('2')
    const n3 = FieldElemet('3')
    assert.strictEqual(n2.add(n3).num.toString(16), '5')
  })

  it('mul', function () {
    const n2 = FieldElemet('2')
    const n3 = FieldElemet('3')
    assert.strictEqual(n2.mul(n3).num.toString(16), '6')
  })

  it('pow', function () {
    const n2 = FieldElemet('2')
    const n3 = FieldElemet('3')
    assert.strictEqual(n2.pow(n3.num).num.toString(16), '8')
  })

  it('div', function () {
    const n4 = FieldElemet('8')
    const n2 = FieldElemet('2')
    assert.strictEqual(n4.div(n2).num.toString(16), '4')
  })
})
