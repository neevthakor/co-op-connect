const fs = require('fs');
let c=fs.readFileSync('src/services/verification.ts','utf8');
c=c.replace(/""SKILL_ASSESSED""/g, '"SKILL_ASSESSED"');
fs.writeFileSync('src/services/verification.ts',c);
console.log('Fixed');
