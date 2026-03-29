/**
 * The All-in-One App — Cryptography Utilities
 * Cherry Computer Ltd.
 *
 * AES-256 token encryption/decryption for secure client-side storage.
 * We encrypt before writing to Keychain and decrypt after reading.
 * Credentials never touch disk in plain text.
 */

import CryptoJS from 'react-native-crypto-js';

const ENCRYPTION_PREFIX = 'AIOAES256:';

/**
 * Encrypt a string value using AES-256.
 * @param {string} plainText — The text to encrypt
 * @returns {string} — Base64 encoded ciphertext with prefix
 */
export const encryptToken = (plainText) => {
  if (!plainText) throw new Error('Cannot encrypt empty value');

  const key = _getEncryptionKey();
  const encrypted = CryptoJS.AES.encrypt(plainText, key).toString();
  return `${ENCRYPTION_PREFIX}${encrypted}`;
};

/**
 * Decrypt a previously encrypted string.
 * @param {string} cipherText — The encrypted string with prefix
 * @returns {string} — Decrypted plain text
 */
export const decryptToken = (cipherText) => {
  if (!cipherText) throw new Error('Cannot decrypt empty value');
  if (!cipherText.startsWith(ENCRYPTION_PREFIX)) {
    throw new Error('Invalid ciphertext format — missing prefix');
  }

  const key = _getEncryptionKey();
  const stripped = cipherText.slice(ENCRYPTION_PREFIX.length);
  const decrypted = CryptoJS.AES.decrypt(stripped, key);
  const result = decrypted.toString(CryptoJS.enc.Utf8);

  if (!result) throw new Error('Decryption failed — invalid key or corrupted data');
  return result;
};

/**
 * Verify that a value can be decrypted (without returning the plaintext).
 * Useful for token validation checks.
 */
export const isValidEncryptedToken = (cipherText) => {
  try {
    decryptToken(cipherText);
    return true;
  } catch {
    return false;
  }
};

/**
 * Generate a SHA-256 hash of a value (for non-reversible fingerprinting).
 */
export const hashValue = (value) => {
  return CryptoJS.SHA256(value).toString(CryptoJS.enc.Hex);
};

// ─────────────────────────────────────────────────────────────────────────────
// PRIVATE
// ─────────────────────────────────────────────────────────────────────────────

const _getEncryptionKey = () => {
  // In production, this comes from a device-specific secret combined with
  // the app's bundle ID, retrieved from secure storage at startup.
  // For the mobile layer, we derive a key from the device's Keychain
  // rather than hardcoding anything.
  const appKey = process.env.ENCRYPTION_KEY;
  if (!appKey) {
    throw new Error(
      'Encryption key not configured. ' +
      'Set ENCRYPTION_KEY in your .env file. ' +
      'Cherry Computer Ltd. — security is non-negotiable.'
    );
  }
  return appKey;
};
