const fs = require('fs');

let c = fs.readFileSync('src/app/admin/workers/[id]/page.tsx', 'utf8');

c = c.replace(/ws\.skillVerificationStatus === 'SKILL_ASSESSED'/g, 'ws.verified === true')
     .replace(/ws\.skillVerificationStatus === 'ASSESSMENT_PENDING'/g, 'ws.verified === false')
     .replace(/ws\.skillVerificationStatus === 'REJECTED'/g, 'false')
     .replace(/ws\.skillVerificationStatus\?\.replace\('_', ' '\) \|\| 'SELF DECLARED'/g, "ws.verified ? 'VERIFIED' : 'SELF DECLARED'")
     .replace(/currentStatus=\{ws\.skillVerificationStatus\}/g, "currentStatus={ws.verified ? 'SKILL_ASSESSED' : 'ASSESSMENT_PENDING'}")
     .replace(/ws\.experienceYears/g, '0 /* missing schema field */')
     .replace(/ws\.experienceDescription/g, '"" /* missing schema field */');

fs.writeFileSync('src/app/admin/workers/[id]/page.tsx', c, 'utf8');

let c2 = fs.readFileSync('src/app/admin/workers/page.tsx', 'utf8');

c2 = c2.replace(/ws\.skillVerificationStatus === 'SKILL_ASSESSED'/g, 'ws.verified === true')
       .replace(/ws\.skillVerificationStatus === 'ASSESSMENT_PENDING'/g, 'ws.verified === false')
       .replace(/ws\.skillVerificationStatus === 'REJECTED'/g, 'false')
       .replace(/ws\.skillVerificationStatus\?\.replace\('_', ' '\) \|\| 'Self Declared'/g, "ws.verified ? 'VERIFIED' : 'Self Declared'");

fs.writeFileSync('src/app/admin/workers/page.tsx', c2, 'utf8');

console.log("Success");
