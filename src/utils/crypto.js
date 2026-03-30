/**
 * The All-in-One App — Crypto Utilities
 * Cherry Computer Ltd.
 *
 * AES-256 encryption/decryption for platform tokens.
 * Raw credentials are NEVER stored — they are always encrypted
 * before writing to MongoDB and decrypted only at request time.
 */

import CryptoJS from 'react-native-crypto-js';

const getKey = () => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length < 32) {
    throw new Error('ENCRYPTION_KEY must be at least 32 characters');
  }
  return key;
};

/**
 * Encrypts a plain-text string using AES-256.
 * Returns a base64-encoded cipher text string.
 */
export const encryptToken = (plaintext) => {
  if (!plaintext) return null;
  const encrypted = CryptoJS.AES.encrypt(plaintext, getKey()).toString();
  return encrypted;
};

/**
 * Decrypts an AES-256 encrypted string.
 * Returns the original plain-text value.
 */
export const decryptToken = (ciphertext) => {
  if (!ciphertext) return null;
  const bytes     = CryptoJS.AES.decrypt(ciphertext, getKey());
  const plaintext = bytes.toString(CryptoJS.enc.Utf8);
  if (!plaintext) throw new Error('Decryption failed — invalid key or corrupted data');
  return plaintext;
};
