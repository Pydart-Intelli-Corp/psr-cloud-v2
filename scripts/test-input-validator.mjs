import { InputValidator } from '../src/lib/external-api/InputValidator.js';

const testMachineId = 'M000m1';

console.log(`Testing machine ID: ${testMachineId}\n`);

const result = InputValidator.validateMachineId(testMachineId);

console.log('Validation Result:');
console.log(JSON.stringify(result, null, 2));

console.log('\nVariants that will be searched:');
console.log(result.variants);
