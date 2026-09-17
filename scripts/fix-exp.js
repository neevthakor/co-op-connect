const fs = require('fs');

let file = 'src/app/admin/workers/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/ \{ws\.experienceYears \? `\| Exp: \$\{ws\.experienceYears\} yrs` : ''\}/g, '');
content = content.replace(/\{ws\.experienceDescription && \([\s\S]*?\}\)/g, '');

fs.writeFileSync(file, content, 'utf8');

let apiSosFile = 'src/app/api/sos/route.ts';
let sosContent = fs.readFileSync(apiSosFile, 'utf8');
sosContent = sosContent.replace(/const incident = await prisma.incident.create/g, `const incident = await prisma.notification.create({ data: { userId, type: 'EMERGENCY', title: 'SOS Alert', body: 'SOS Button Activated ' + JSON.stringify(location) } });\n    await prisma.complaint.create({ data: { customerId: userId, bookingId: bookingId || "", category: 'SAFETY', description: 'SOS Button Activated ' + JSON.stringify(location), status: 'OPEN' } });\n    //`);
sosContent = sosContent.replace(/\{\s*data: \{\s*userId,\s*bookingId,\s*type: 'EMERGENCY',\s*description: 'SOS Button Activated',\s*location: JSON\.stringify\(location\),\s*status: 'OPEN'\s*\}\s*\}/g, '');
fs.writeFileSync(apiSosFile, sosContent, 'utf8');

let verifyPubFile = 'src/app/verify/worker/[publicId]/page.tsx';
let vpContent = fs.readFileSync(verifyPubFile, 'utf8');
vpContent = vpContent.replace(/where: \{ publicId \}/g, 'where: { id: publicId }');
vpContent = vpContent.replace(/\{worker\.user\.name\}/g, '{worker?.userId}');
vpContent = vpContent.replace(/\{worker\.cooperative\.name\}/g, '{worker?.cooperativeId}');
vpContent = vpContent.replace(/worker\.verificationMethod === "DIGILOCKER"/g, 'worker?.identityVerified');
vpContent = vpContent.replace(/worker\.verificationMethod === 'DIGILOCKER'/g, 'worker?.identityVerified');
vpContent = vpContent.replace(/worker\."DIGILOCKER"/g, 'worker?.identityVerified');
fs.writeFileSync(verifyPubFile, vpContent, 'utf8');

console.log('Fixed');
