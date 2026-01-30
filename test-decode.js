const crypto = require('crypto');
const zlib = require('zlib');

const ENCRYPTION_KEY = 'PSR-2026-POORNASREE-SECRET-KEY-32CHARS!';

// Base85 decoding
function fromBase85(str) {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!#$%&()*+-;<=>?@^_`{|}~';
  const result = [];
  
  for (let i = 0; i < str.length; i += 5) {
    let value = 0;
    const chunkSize = Math.min(5, str.length - i);
    
    for (let j = 0; j < chunkSize; j++) {
      const c = str[i + j];
      const index = chars.indexOf(c);
      if (index === -1) throw new Error(`Invalid base85 character: ${c}`);
      value = value * 85 + index;
    }
    
    // Extract bytes
    const bytes = [];
    for (let j = 0; j < 4; j++) {
      bytes.unshift(value & 0xFF);
      value >>= 8;
    }
    
    result.push(...bytes.slice(4 - chunkSize + 1));
  }
  
  return Buffer.from(result);
}

function decrypt(cipherText, key = ENCRYPTION_KEY) {
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

// Decode the PSR codes
const psrCodes = [
  'PSR-iE1y&2zgkrBqzw4x3I(ajD66^sQS&Mm^DnAIjcU_I=spjJ(3Uvw2^^VMV#p^wZcc3-L&Bq(sw+0%``Wa6=4vmH)U`xuPXeUA?XyK6|GgTgfb_N^<nCu`$LPhJH>hFnY8x~pPJ`p8~MTvrJ4;UPYhPOPWi^PjCx{j@uRz1LgPoWnQelnN7J9B<~4o7+$Lq=RQ|dE-epR3w@LmpGp1&@ILkP_N=3tQ',
  'PSR-<&+EVg%5W5Erz9?-^*LJkjkglp2U*XeMYkrx;t2)T%K)Merg;qbOktIX!bM`*rZFf;4iG+r%)*OTvxBok$Am^UW!zBV1md69N$k|iVR}z3J@f--#Z7b_<NGZoc7%EJ@XZ73a3pfE);;>'
];

console.log('\n' + '='.repeat(80));
console.log('DECODING MULTIPLE PSR CODES');
console.log('='.repeat(80) + '\n');

let allMachines = [];
let societyId = null;
let secretKey = null;

psrCodes.forEach((psrCode, index) => {
  console.log(`\n--- PSR CODE #${index + 1} (${psrCode.length} chars) ---\n`);
  const encoded = psrCode.replace('PSR-', '');

  try {
    const decrypted = decrypt(encoded);
    const data = JSON.parse(decrypted);
    
    console.log('Raw JSON:', decrypted);
    console.log('\nParsed Data:');
    console.log('  Society ID:', data.s);
    if (data.k) console.log('  Secret Key:', data.k);
    console.log('  Models:', data.m.length);
    
    data.m.forEach((model, i) => {
      console.log(`    Model ${i + 1}: ${model.t} (${model.i.length} machines)`);
      console.log(`      Machines: ${model.i.join(', ')}`);
    });
    
    // Collect data
    if (!societyId) societyId = data.s;
    if (!secretKey && data.k) secretKey = data.k;
    
    data.m.forEach(model => {
      allMachines.push(...model.i);
    });
    
  } catch (error) {
    console.error('Error decoding:', error.message);
  }
});

console.log('\n' + '='.repeat(80));
console.log('MERGED SUMMARY');
console.log('='.repeat(80));
console.log('Society ID:', societyId);
console.log('Secret Key:', secretKey);
console.log('Total PSR Codes:', psrCodes.length);
console.log('Total Machines:', allMachines.length);
console.log('Unique Machines:', [...new Set(allMachines)].length);
console.log('All Machine IDs:', allMachines.join(', '));
console.log('='.repeat(80) + '\n');
