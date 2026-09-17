const fs = require('fs');

let f1 = 'src/app/admin/workers/[id]/page.tsx';
let c1 = fs.readFileSync(f1, 'utf8');

c1 = c1.replace(/ws\.skillVerificationStatus/g, 'ws.verified ? "VERIFIED" : "PENDING"');
c1 = c1.replace(/ws\.verified \? "VERIFIED" : "PENDING" === 'ASSESSMENT_PENDING'/g, '!ws.verified');
c1 = c1.replace(/ws\.verified \? "VERIFIED" : "PENDING" === 'REJECTED'/g, '!ws.verified');

// Fix experience lines properly!
c1 = c1.replace(/\{ws\.experienceYears \? `\| Exp: \$\{ws\.experienceYears\} yrs` : ''\}/g, '');
c1 = c1.replace(/\{ws\.experienceDescription && \(\s*<p className="text-xs text-gray-500 mt-1 italic">"\{ws\.experienceDescription\}"<\/p>\s*\)\}/g, '');

fs.writeFileSync(f1, c1, 'utf8');
console.log('Fixed');
