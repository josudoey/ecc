
/* eslint-env mocha */
const assert = require('assert')
const FieldElemet = require('../secp256k1/field-element')
describe('field element', function () {
  it('init', function () {
    const zero = FieldElemet('0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f')
    assert.strictEqual(zero.toString(), '0x0000000000000000000000000000000000000000000000000000000000000000')
    const one = FieldElemet('0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc30')
    assert.strictEqual(one.toString(), '0x0000000000000000000000000000000000000000000000000000000000000001')

    const n1 = FieldElemet('-1')
    assert.strictEqual(n1.toString(), '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2e')
  })

  it('add', function () {
    const n2 = FieldElemet('2')
    const n3 = FieldElemet('3')
    assert.strictEqual(n2.add(3).toString(), '0x0000000000000000000000000000000000000000000000000000000000000005')
    assert.strictEqual(n2.add(n3).toString(), '0x0000000000000000000000000000000000000000000000000000000000000005')
  })

  it('mul', function () {
    const n2 = FieldElemet('2')
    const n3 = FieldElemet('3')
    assert.strictEqual(n2.mul(3).toString(), '0x0000000000000000000000000000000000000000000000000000000000000006')
    assert.strictEqual(n2.mul(n3).toString(), '0x0000000000000000000000000000000000000000000000000000000000000006')
  })

  it('pow', function () {
    const n2 = FieldElemet('2')
    const n3 = FieldElemet('3')
    assert.strictEqual(n2.pow(3).toString(), '0x0000000000000000000000000000000000000000000000000000000000000008')
    assert.strictEqual(n2.pow(n3).toString(), '0x0000000000000000000000000000000000000000000000000000000000000008')
  })

  it('div', function () {
    const n8 = FieldElemet('8')
    const n2 = FieldElemet('2')
    assert.strictEqual(n8.div(2).toString(), '0x0000000000000000000000000000000000000000000000000000000000000004')
    assert.strictEqual(n8.div(n2).toString(), '0x0000000000000000000000000000000000000000000000000000000000000004')
  })

  it('hex', function () {
    const n8 = FieldElemet('8')
    assert.strictEqual(n8.toString(), '0x0000000000000000000000000000000000000000000000000000000000000008')
  })
})
