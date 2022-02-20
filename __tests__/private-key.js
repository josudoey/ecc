/* eslint-env jest */
const crypto = require('crypto')
const PrivateKey = require('../secp256k1/private-key')
const Signature = require('../secp256k1/signature')
const sha256 = (msg) => {
  return crypto.createHash('sha256').update(msg).digest()
}

describe('private-key', function () {
  let keyPair, pem
  beforeEach(() => {
    keyPair = crypto.generateKeyPairSync('ec', { namedCurve: 'secp256k1' })
    pem = keyPair.privateKey.export({ type: 'sec1', format: 'pem' })
  })

  test('fromPEM', function () {
    expect(PrivateKey.fromPEM(pem)).not.toBeUndefined()
  })

  test('toPEM', function () {
    expect(PrivateKey.fromPEM(pem).toPEM()).toStrictEqual(pem)
  })

  it('check public key', function () {
    const privateKeyHex = 'f000000000000000000000000000000000000000000000000000000000000000'
    const key = new PrivateKey(privateKeyHex)
    expect(key.publicKey.toSec(false))
      .toStrictEqual('043bc6bc6446bf520136358eb0958dc4aa9e733164dd2d62e151f946107427bacc8e305cc07176c305cdb62ee226d6c02bd71b75a5228beb4714c33fd5ead6fda6')
  })

  it('sign', function () {
    const key = PrivateKey.fromPEM(pem)
    const message = crypto.randomBytes(64).toString('hex')
    const signature = key.sign(sha256(message))

    const privateKey = crypto.createPrivateKey({
      key: key.toPEM(),
      format: 'pem'
    })

    expect(crypto.verify(null, message, privateKey, Signature.toDER(signature))).toBe(true)
  })

  it('ecdhSecret', function () {
    const alice = PrivateKey.fromPEM(pem)
    const bob = crypto.createECDH('secp256k1')
    bob.generateKeys()
    const aliceSecret = alice.ecdhSecret(bob.getPublicKey())
    const bobSecret = bob.computeSecret(alice.publicKey.toBuffer(), null, 'hex')
    expect(aliceSecret).toStrictEqual(bobSecret)
  })
})
