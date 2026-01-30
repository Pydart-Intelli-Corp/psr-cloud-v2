using System.Security.Cryptography;
using System.Text;
using System.IO.Compression;

namespace MachineAPI.Services
{
    public interface IEncryptionService
    {
        string Encrypt(string plainText);
        string Decrypt(string cipherText);
    }

    public class EncryptionService : IEncryptionService
    {
        // Internal encryption key - hardcoded for security (not exposed in config files)
        private const string INTERNAL_KEY = "PSR-2026-POORNASREE-SECRET-KEY-32CHARS!";

        /// <summary>
        /// Encrypts plain text using AES-256 encryption with internal key
        /// </summary>
        public string Encrypt(string plainText)
        {
            return Encrypt(plainText, INTERNAL_KEY);
        }

        /// <summary>
        /// Decrypts cipher text using AES-256 decryption with internal key
        /// </summary>
        public string Decrypt(string cipherText)
        {
            return Decrypt(cipherText, INTERNAL_KEY);
        }

        /// <summary>
        /// Encrypts plain text using AES-256 encryption with GZIP compression and Base85 encoding
        /// Ultra-compact: Max GZIP + AES-256 + Base85 (20% smaller than Base64)
        /// </summary>
        private string Encrypt(string plainText, string key)
        {
            if (string.IsNullOrEmpty(plainText))
                throw new ArgumentNullException(nameof(plainText));
            
            if (string.IsNullOrEmpty(key))
                throw new ArgumentNullException(nameof(key));

            // Ensure key is 32 bytes (256 bits) for AES-256
            byte[] keyBytes = GetKeyBytes(key);
            
            // Compress data first using maximum GZIP compression
            byte[] compressedData;
            using (var output = new MemoryStream())
            {
                using (var gzip = new GZipStream(output, CompressionLevel.SmallestSize))
                {
                    byte[] inputBytes = Encoding.UTF8.GetBytes(plainText);
                    gzip.Write(inputBytes, 0, inputBytes.Length);
                }
                compressedData = output.ToArray();
            }
            
            using (Aes aes = Aes.Create())
            {
                aes.Key = keyBytes;
                aes.Mode = CipherMode.CBC;
                aes.Padding = PaddingMode.PKCS7;
                
                // Use fixed IV for deterministic encryption
                aes.IV = new byte[16]; // All zeros

                using (var encryptor = aes.CreateEncryptor(aes.Key, aes.IV))
                using (var msEncrypt = new MemoryStream())
                using (var csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
                {
                    csEncrypt.Write(compressedData, 0, compressedData.Length);
                    csEncrypt.FlushFinalBlock();
                    
                    // Return as Base85 (20% smaller than Base64)
                    return Base85Encoder.Encode(msEncrypt.ToArray());
                }
            }
        }

        /// <summary>
        /// Decrypts cipher text using AES-256 decryption with GZIP decompression and Base85 decoding
        /// </summary>
        private string Decrypt(string cipherText, string key)
        {
            if (string.IsNullOrEmpty(cipherText))
                throw new ArgumentNullException(nameof(cipherText));
            
            if (string.IsNullOrEmpty(key))
                throw new ArgumentNullException(nameof(key));

            byte[] keyBytes = GetKeyBytes(key);
            
            // Convert from Base85
            byte[] cipherBytes = Base85Encoder.Decode(cipherText);

            using (Aes aes = Aes.Create())
            {
                aes.Key = keyBytes;
                aes.Mode = CipherMode.CBC;
                aes.Padding = PaddingMode.PKCS7;
                aes.IV = new byte[16]; // Same fixed IV as encryption

                using (var decryptor = aes.CreateDecryptor(aes.Key, aes.IV))
                using (var msDecrypt = new MemoryStream(cipherBytes))
                using (var csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read))
                using (var output = new MemoryStream())
                {
                    csDecrypt.CopyTo(output);
                    byte[] compressedData = output.ToArray();
                    
                    // Decompress the data
                    using (var input = new MemoryStream(compressedData))
                    using (var gzip = new GZipStream(input, CompressionMode.Decompress))
                    using (var decompressed = new MemoryStream())
                    {
                        gzip.CopyTo(decompressed);
                        return Encoding.UTF8.GetString(decompressed.ToArray());
                    }
                }
            }
        }

        /// <summary>
        /// Converts key string to 32-byte array for AES-256
        /// </summary>
        private byte[] GetKeyBytes(string key)
        {
            using (var sha256 = SHA256.Create())
            {
                // Hash the key to always get 32 bytes (256 bits)
                return sha256.ComputeHash(Encoding.UTF8.GetBytes(key));
            }
        }
    }
}
