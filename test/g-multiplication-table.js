
/* eslint-env mocha */
const assert = require('assert')
const FieldElemet = require('../secp256k1/field-element')
const gTable = require('../secp256k1/g-multiplication-table')
const g = require('../secp256k1/g')()
describe('g-multipication-table', function () {
  it('data', function () {
    let now = g

    assert.deepStrictEqual(gTable[0], {
      n: FieldElemet(1).toString(),
      x: now.x.toString(),
      y: now.y.toString()
    })

    for (let i = 1; i < 256; i++) {
      now = now.add(now)
      assert.deepStrictEqual(gTable[i], {
        n: FieldElemet(2).pow(i).toString(),
        x: now.x.toString(),
        y: now.y.toString()
      })
    }
  }).timeout(10000)
})
