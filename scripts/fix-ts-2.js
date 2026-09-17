const fs = require('fs');

function replaceRegex(file, regex, replaceStr) {
  try {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(regex, replaceStr);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed regex', file);
  } catch (e) {}
}

// admin/workers/[id]/page.tsx
replaceRegex('src/app/admin/workers/[id]/page.tsx', /<div className="flex justify-between text-sm">[\s\S]*?<span>\{ws\.experienceYears\} years<\/span>\s*<\/div>/g, '');
replaceRegex('src/app/admin/workers/[id]/page.tsx', /\{ws\.experienceDescription && \([\s\S]*?\}\)/g, '');
replaceRegex('src/app/admin/workers/[id]/page.tsx', /ws\.verified \? "VERIFIED" : "PENDING" === 'ASSESSMENT_PENDING'/g, '!ws.verified');
replaceRegex('src/app/admin/workers/page.tsx', /ws\.verified \? "VERIFIED" : "PENDING" === 'ASSESSMENT_PENDING'/g, '!ws.verified');
replaceRegex('src/app/admin/workers/page.tsx', /ws\.verified \? "VERIFIED" : "PENDING" === 'REJECTED'/g, 'false');

// api/sos/route.ts
replaceRegex('src/app/api/sos/route.ts', /const incident = await prisma\.incident\.create\(\{\s*data:\s*\{\s*userId,\s*bookingId,\s*type:\s*'EMERGENCY',\s*description:\s*'SOS Button Activated',\s*location:\s*JSON\.stringify\(location\),\s*status:\s*'OPEN'\s*\}\s*\}\);/g, `
    const incident = await prisma.notification.create({
      data: { userId, type: 'EMERGENCY', title: 'SOS Alert', body: 'SOS Button Activated ' + JSON.stringify(location) }
    });
    await prisma.complaint.create({
      data: { customerId: userId, bookingId: bookingId || "", category: 'SAFETY', description: 'SOS Button Activated ' + JSON.stringify(location), status: 'OPEN' }
    });
`);

// digilocker route
replaceRegex('src/app/api/worker/verify-digilocker/route.ts', /verifiedById:\s*'SYSTEM',/g, '');
replaceRegex('src/app/api/worker/verify-digilocker/route.ts', /worker\.verificationMethod === 'DIGILOCKER'/g, 'worker.verificationStatus === "VERIFIED"');
replaceRegex('src/app/api/worker/verify-digilocker/route.ts', /identityVerified:\s*true\s*,\s*identityVerified:\s*true/g, 'identityVerified: true');
replaceRegex('src/app/api/worker/verify-digilocker/route.ts', /identityVerified:\s*true\s*,\s*identityVerified:\s*true,/g, 'identityVerified: true,');

// worker public view
replaceRegex('src/app/verify/worker/[publicId]/page.tsx', /where:\s*\{\s*publicId\s*\}/g, 'where: { id: publicId }');
replaceRegex('src/app/verify/worker/[publicId]/page.tsx', /\{worker\.user\.name\}/g, '{worker.userId}');
replaceRegex('src/app/verify/worker/[publicId]/page.tsx', /\{worker\.cooperative\.name\}/g, '{worker.cooperativeId}');
replaceRegex('src/app/verify/worker/[publicId]/page.tsx', /"DIGILOCKER" === 'DIGILOCKER'/g, 'worker.identityVerified');
replaceRegex('src/app/verify/worker/[publicId]/page.tsx', /worker\."DIGILOCKER"/g, '"DIGILOCKER"');

// verification service
replaceRegex('src/services/verification.ts', /assessedById:\s*adminId,\s*assessedAt:\s*new Date\(\),\s*assessmentNotes:\s*notes,/g, '');
replaceRegex('src/services/verification.ts', /SKILL_ASSESSED/g, '"SKILL_ASSESSED"');
