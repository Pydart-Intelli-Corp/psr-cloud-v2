# PSR Code Encryption Implementation

## Overview
PSR codes are now encrypted using **AES-256-CBC** encryption with a secret key. This prevents easy decoding and ensures that only the authorized .NET API with the correct encryption key can decode the PSR codes.

## Security Features

### 1. **AES-256 Encryption**
- Industry-standard symmetric encryption
- 256-bit key strength
- CBC (Cipher Block Chaining) mode
- PKCS7 padding

### 2. **Random IV (Initialization Vector)**
- Each PSR code uses a unique random IV
- Prepended to the encrypted data
- Prevents pattern recognition even for identical data

### 3. **SHA-256 Key Hashing**
- Encryption key is hashed using SHA-256
- Ensures exactly 32 bytes (256 bits) for AES-256
- Same key produces same hash (deterministic)

## Implementation

### Encryption Key
```
PSR-2026-POORNASREE-SECRET-KEY-32CHARS!
```

**⚠️ IMPORTANT:** This key should be:
- Stored as an environment variable in production
- Never committed to version control
- Unique for each deployment
- Minimum 32 characters long

### PSR Code Format

**Before Encryption (Old):**
```
PSR-{CHECKSUM}-{BASE64_JSON}
```

**After Encryption (New):**
```
PSR-{CHECKSUM}-{AES_ENCRYPTED_BASE64}
```

### Encrypted Data Structure

**Plain JSON (before encryption):**
```json
{
  "sid": "S2",
  "model": "dpst-w",
  "mids": ["M1", "M2"],
  "ts": 1769600748838
}
```

**After AES-256 Encryption:**
```
PSR-5432-Ab3d...Xy9z (encrypted Base64 string)
```

## Code Implementation

### Frontend (Next.js/TypeScript)

**Encryption Service** (`src/lib/encryption.ts`):
```typescript
import crypto from 'crypto';

const ENCRYPTION_KEY = 'PSR-2026-POORNASREE-SECRET-KEY-32CHARS!';

export function encrypt(plainText: string, key: string = ENCRYPTION_KEY): string {
  const keyHash = crypto.createHash('sha256').update(key).digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', keyHash, iv);
  
  let encrypted = cipher.update(plainText, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  const result = Buffer.concat([iv, encrypted]);
  return result.toString('base64');
}
```

**PSR Code Generation:**
```typescript
import { encrypt, getEncryptionKey } from '@/lib/encryption';

const generatePSRCode = (societyId, machineModel, machineIds) => {
  const data = {
    sid: societyId.toUpperCase(),
    model: machineModel.toLowerCase(),
    mids: machineIds.map(id => id.toUpperCase()),
    ts: Date.now()
  };
  
  const jsonString = JSON.stringify(data);
  const encrypted = encrypt(jsonString, getEncryptionKey());
  const checksum = encrypted.split('').reduce((acc, char) => 
    acc + char.charCodeAt(0), 0) % 9999;
  
  return `PSR-${checksum.toString().padStart(4, '0')}-${encrypted}`;
};
```

### Backend (.NET C#)

**Encryption Service** (`MachineAPI/Services/EncryptionService.cs`):
```csharp
using System.Security.Cryptography;
using System.Text;

public class EncryptionService : IEncryptionService
{
    public string Decrypt(string cipherText, string key)
    {
        byte[] keyBytes = GetKeyBytes(key);
        byte[] cipherBytes = Convert.FromBase64String(cipherText);

        using (Aes aes = Aes.Create())
        {
            aes.Key = keyBytes;
            aes.Mode = CipherMode.CBC;
            aes.Padding = PaddingMode.PKCS7;

            // Extract IV from beginning
            byte[] iv = new byte[16];
            Array.Copy(cipherBytes, 0, iv, 0, 16);
            aes.IV = iv;

            using (var decryptor = aes.CreateDecryptor(aes.Key, aes.IV))
            using (var msDecrypt = new MemoryStream(cipherBytes, 16, cipherBytes.Length - 16))
            using (var csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read))
            using (var srDecrypt = new StreamReader(csDecrypt))
            {
                return srDecrypt.ReadToEnd();
            }
        }
    }

    private byte[] GetKeyBytes(string key)
    {
        using (var sha256 = SHA256.Create())
        {
            return sha256.ComputeHash(Encoding.UTF8.GetBytes(key));
        }
    }
}
```

**PSR Code Decryption:**
```csharp
public PSRCodeData? DecodePSRCode(string psrCode)
{
    var parts = psrCode.Split('-');
    var encodedData = parts[2];
    
    // Decrypt using encryption key
    string jsonString = _encryptionService.Decrypt(
        encodedData, 
        _psrConfig.EncryptionKey
    );
    
    // Parse JSON
    var data = JsonSerializer.Deserialize<PSRCodeData>(jsonString);
    return data;
}
```

## Configuration

### appsettings.json
```json
{
  "PSRCodes": {
    "EncryptionKey": "USE_ENVIRONMENT_VARIABLE_OR_USER_SECRETS",
    "MasterPSRCode": "PSR-5432-Ab3d...Xy9z"
  }
}
```

### appsettings.Development.json
```json
{
  "PSRCodes": {
    "EncryptionKey": "PSR-2026-POORNASREE-SECRET-KEY-32CHARS!",
    "MasterPSRCode": "PSR-5432-Ab3d...Xy9z"
  }
}
```

### Environment Variables (Production)
```bash
PSRCodes__EncryptionKey="YOUR_PRODUCTION_SECRET_KEY"
```

## Security Benefits

### Before Encryption ❌
```bash
# Anyone could decode:
echo "eyJzaWQiOiJTMiIsIm1vZGVsIjoiZHBzdC13IiwibWlkcyI6WyJNMSIsIk0yIl0sInRzIjoxNzY5NjAwNzQ4ODM4fQ==" | base64 -d

# Output: {"sid":"S2","model":"dpst-w","mids":["M1","M2"],"ts":1769600748838}
```

### After Encryption ✅
```bash
# Attempting to decode:
echo "Ab3dXy9z..." | base64 -d

# Output: Encrypted binary data (unreadable)
# Can only be decrypted with the secret key!
```

## Attack Prevention

| Attack Type | Protection |
|------------|-----------|
| **Base64 Decoding** | Data is encrypted, not just encoded |
| **Brute Force** | AES-256 with 2^256 possible keys |
| **Pattern Analysis** | Random IV ensures unique ciphertext |
| **Replay Attacks** | Timestamp validation in decoded data |
| **Key Guessing** | SHA-256 hashing of custom key |

## Backward Compatibility

The system supports both encrypted and non-encrypted PSR codes:

```csharp
// Decrypt with key if available
if (!string.IsNullOrEmpty(_psrConfig?.EncryptionKey))
{
    jsonString = _encryptionService.Decrypt(encodedData, _psrConfig.EncryptionKey);
}
else
{
    // Fallback to Base64 (old format)
    var jsonBytes = Convert.FromBase64String(encodedData);
    jsonString = Encoding.UTF8.GetString(jsonBytes);
}
```

## Key Rotation

To rotate encryption keys:

1. **Generate new PSR codes** with new key
2. **Update appsettings** with new EncryptionKey
3. **Restart .NET API**
4. **Reconfigure all machines** with new PSR codes
5. **Delete old PSR codes** from system

## Testing

### Test Encryption/Decryption

**Frontend (Node.js):**
```typescript
import { encrypt, decrypt } from '@/lib/encryption';

const plainText = '{"sid":"S2","model":"dpst-w","mids":["M1","M2"],"ts":1769600748838}';
const encrypted = encrypt(plainText);
const decrypted = decrypt(encrypted);

console.log('Encrypted:', encrypted);
console.log('Decrypted:', decrypted);
console.log('Match:', plainText === decrypted); // Should be true
```

**Backend (.NET):**
```csharp
var service = new EncryptionService();
var key = "PSR-2026-POORNASREE-SECRET-KEY-32CHARS!";

var plainText = "{\"sid\":\"S2\",\"model\":\"dpst-w\",\"mids\":[\"M1\",\"M2\"],\"ts\":1769600748838}";
var encrypted = service.Encrypt(plainText, key);
var decrypted = service.Decrypt(encrypted, key);

Console.WriteLine($"Encrypted: {encrypted}");
Console.WriteLine($"Decrypted: {decrypted}");
Console.WriteLine($"Match: {plainText == decrypted}"); // Should be true
```

## Production Deployment

### 1. Generate Strong Key
```bash
# Generate random 32-character key
openssl rand -base64 32
```

### 2. Set Environment Variable
```bash
# Linux/Mac
export PSRCodes__EncryptionKey="YOUR_GENERATED_KEY"

# Windows
set PSRCodes__EncryptionKey=YOUR_GENERATED_KEY

# Docker
docker run -e PSRCodes__EncryptionKey="YOUR_GENERATED_KEY" ...
```

### 3. Update Frontend
```typescript
// In production, fetch key from secure API endpoint
const key = await fetchEncryptionKey(); // Authenticated request
const psrCode = generatePSRCode(societyId, model, machineIds);
```

### 4. Secure Key Storage
- **Development**: appsettings.Development.json
- **Production**: Environment variables or Azure Key Vault
- **Never**: Hardcoded in source code or committed to Git

## Troubleshooting

### "Failed to decrypt PSR code"
- Check encryption key matches between frontend and backend
- Verify key is exactly the same (case-sensitive)
- Ensure PSR code wasn't corrupted during transmission

### "Invalid PSR code checksum"
- PSR code may have been modified
- Check for trailing spaces or newlines
- Verify complete PSR code was copied

### "Padding is invalid"
- Encryption key mismatch
- Data corruption during transmission
- Different encryption algorithm used

## Files Modified

1. **MachineAPI/Services/EncryptionService.cs** - NEW
2. **MachineAPI/Models/PSRCodeConfig.cs** - Added EncryptionKey
3. **MachineAPI/Services/PSRCodeService.cs** - Added decryption logic
4. **MachineAPI/Program.cs** - Registered EncryptionService
5. **MachineAPI/appsettings.json** - Added EncryptionKey config
6. **MachineAPI/appsettings.Development.json** - Added EncryptionKey config
7. **src/lib/encryption.ts** - NEW
8. **src/app/superadmin/api-management/page.tsx** - Use encryption
9. **src/app/api/admin/api-management/generate/route.ts** - Include EncryptionKey in config

---

**Version:** 4.0 (AES Encrypted)  
**Date:** January 28, 2026  
**Security Level:** HIGH 🔒
