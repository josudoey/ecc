# ECC 實作範例（secp256k1）

本專案旨在幫助理解橢圓曲線加密（Elliptic Curve Cryptography, ECC）的實作，以常見的 secp256k1 曲線為例，這也是比特幣與以太坊等區塊鏈常用的密碼學基礎。

## 目標

- 了解 ECC 的基本原理與運算
- 實作私鑰、公鑰、簽章與驗證
- 學習比特幣、以太坊地址的產生方式
- 透過單元測試驗證每個步驟

## 專案結構

```
secp256k1/
  ├── public-key.js         # 公鑰運算與驗證
  ├── private-key.js        # 私鑰產生、簽章、ECDH
  ├── signature.js          # DER 格式簽章編解碼
  ├── bitcoin/public-key.js # 比特幣地址產生
  └── ethereum/public-key.js# 以太坊地址產生
__tests__/
  ├── public-key.js         # 公鑰相關測試
  ├── private-key.js        # 私鑰與簽章測試
  ├── bitcoin.js            # 比特幣地址測試
  └── ethereum.js           # 以太坊地址測試
```


## 如何使用

### 1. 產生私鑰與公鑰

```js
const PrivateKey = require('./secp256k1/private-key')
const key = new PrivateKey('<private hex>')
console.log('public key:', key.getPublic().toSec())
```

### 2. 簽章與驗證

```js
const msgHash = '訊息雜湊hex'
const signature = key.sign(msgHash)
const PublicKey = require('./secp256k1/public-key')
const pub = key.getPublic()
console.log('驗證:', pub.verify(msgHash, signature.r, signature.s))
```

### 3. 比特幣/以太坊地址產生

```js
const BTCKey = require('./secp256k1/bitcoin/public-key')
const ETHKey = require('./secp256k1/ethereum/public-key')
const btcPub = BTCKey.from(pub)
console.log('BTC 地址:', btcPub.toAddress())
const ethPub = ETHKey.from(pub)
console.log('ETH 地址:', ethPub.toAddress())
```

## 學習重點

- 橢圓曲線純量加法、橢圓曲線純量乘法
- 私鑰、公鑰、簽章、驗證的數學原理
- 比特幣、以太坊地址的產生流程
- ECDH 共識密鑰產生

## 參考資源

- [secp256k1 curve](https://en.bitcoin.it/wiki/Secp256k1)
- [比特幣開發文件](https://developer.bitcoin.org/devguide/transactions.html#public-key-cryptography)
- [以太坊黃皮書](https://ethereum.github.io/yellowpaper/paper.pdf)
