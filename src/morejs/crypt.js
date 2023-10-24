import { KJUR, RSAKey, hextob64u, b64utohex } from 'jsrsasign'
import CryptoJS from 'crypto-js'

/**
 * RSA 加密
 *
 * @param publicKeyB64U {string}
 * @param text {string}
 * @return {string}
 */
function rsaEncrypt (publicKeyB64U, text) {
  const pk = new RSAKey()
  pk.readPKCS8PubKeyHex(b64utohex(publicKeyB64U))

  const encrypted = KJUR.crypto.Cipher.encrypt(text, pk)

  return hextob64u(encrypted)
}

/**
 * AES 加密
 *
 * @param keyB64U {string}
 * @param text {string}
 * @return {string}
 */
function aesEncrypt (keyB64U, text) {
  const aesKey = CryptoJS.enc.Hex.parse(b64utohex(keyB64U))
  const encrypted = CryptoJS.AES.encrypt(text, aesKey, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  }).ciphertext.toString()

  return hextob64u(encrypted)
}

/**
 * AES 解密
 *
 * @param keyB64U {string}
 * @param encryptedB64U {string}
 * @return {string}
 */
function aesDecrypt (keyB64U, encryptedB64U) {
  const aesKey = CryptoJS.enc.Hex.parse(b64utohex(keyB64U))
  const encryptedHex = b64utohex(encryptedB64U)
  const encrypted = CryptoJS.enc.Hex.parse(encryptedHex)
  const decrypted = CryptoJS.AES.decrypt({ ciphertext: encrypted }, aesKey, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  })

  return CryptoJS.enc.Utf8.stringify(decrypted)
}

/**
 * 生成登录用的随机 key
 *
 * @return {string}
 */
function generateRandomKey () {
  let key = KJUR.crypto.Util.getRandomHexOfNbits(128)
  // 上面那个方法出来的结果长度会过长, 前面会有个 '00'
  key = key.substr(key.length - 32)
  key = hextob64u(key)

  return key
}

export default { rsaEncrypt, aesEncrypt, aesDecrypt, generateRandomKey }
