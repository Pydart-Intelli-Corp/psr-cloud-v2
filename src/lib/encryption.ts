import crypto from 'crypto';
import zlib from 'zlib';

const ENCRYPTION_KEY = 'PSR-2026-POORNASREE-SECRET-KEY-32CHARS!';

// Base85 encoding for 20% smaller output than Base64
function toBase85(buffer: Buffer): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!#$%&()*+-;<=>?@^_`{|}~';
  let result = '';
  
  for (let i = 0; i < buffer.length; i += 4) {
    let value = 0;
    const chunkSize = Math.min(4, buffer.length - i);
    
    for (let j = 0; j < chunkSize; j++) {
      value = value * 256 + buffer[i + j];
    }
    
    // Pad if needed
    for (let j = chunkSize; j < 4; j++) {
      value *= 256;
    }
    
    // Convert to base85
    const temp: string[] = [];
    for (let j = 0; j < 5; j++) {
      temp.unshift(chars[value % 85]);
      value = Math.floor(value / 85);
    }
    
    result += temp.slice(0, chunkSize + 1).join('');
  }
  
  return result;
}

function fromBase85(str: string): Buffer {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!#$%&()*+-;<=>?@^_`{|}~';
  const result: number[] = [];
  
  for (let i = 0; i < str.length; i += 5) {
    let value = 0;
    const chunkSize = Math.min(5, str.length - i);
    
    for (let j = 0; j < chunkSize; j++) {
      const c = str[i + j];
      const index = chars.indexOf(c);
      if (index === -1) throw new Error('Invalid base85 character');
      value = value * 85 + index;
    }
    
    // Extract bytes
    const bytes: number[] = [];
    for (let j = 0; j < 4; j++) {
      bytes.unshift(value & 0xFF);
      value >>= 8;
    }
    
    result.push(...bytes.slice(4 - chunkSize + 1));
  }
  
  return Buffer.from(result);
}

/**
 * Encrypts plain text using AES-256-CBC encryption with GZIP compression and Base85 encoding
 * Ultra-compact: Binary packing + GZIP + AES + Base85
 */
export function encrypt(plainText: string, key: string = ENCRYPTION_KEY): string {
  // Compress the data first using maximum GZIP compression
  const compressed = zlib.gzipSync(Buffer.from(plainText, 'utf8'), { level: 9 });
  
  // Hash the key to get exactly 32 bytes (256 bits) for AES-256
  const keyHash = crypto.createHash('sha256').update(key).digest();
  
  // Use fixed IV for deterministic encryption (smaller output)
  const iv = Buffer.alloc(16, 0);
  
  // Create cipher
  const cipher = crypto.createCipheriv('aes-256-cbc', keyHash, iv);
  
  // Encrypt the compressed data
  let encrypted = cipher.update(compressed);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  // Return as Base85 (20% smaller than Base64)
  return toBase85(encrypted);
}

/**
 * Decrypts cipher text using AES-256-CBC decryption with GZIP decompression and Base85 decoding
 */
export function decrypt(cipherText: string, key: string = ENCRYPTION_KEY): string {
  // Hash the key to get exactly 32 bytes
  const keyHash = crypto.createHash('sha256').update(key).digest();
  
  // Convert from Base85
  const encryptedData = fromBase85(cipherText);
  
  // Use same fixed IV as encryption
  const iv = Buffer.alloc(16, 0);
  
  // Create decipher
  const decipher = crypto.createDecipheriv('aes-256-cbc', keyHash, iv);
  
  // Decrypt the data
  let decrypted = decipher.update(encryptedData);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  
  // Decompress the data
  const decompressed = zlib.gunzipSync(decrypted);
  
  return decompressed.toString('utf8');
}

/**
 * Get the default encryption key
 */
export function getEncryptionKey(): string {
  return ENCRYPTION_KEY;
}
