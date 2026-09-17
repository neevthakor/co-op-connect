const fs = require('fs');
let file = 'src/app/api/worker/verify-digilocker/route.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/identityVerified:\s*true,\s*verifiedById:\s*'SYSTEM_DIGILOCKER',\s*verificationNotes:\s*'Automatically verified via DigiLocker OAuth Mock adapter',/g, '');
content = content.replace(/verificationMethod:\s*updatedWorker\.verificationMethod,/g, '');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed route');
