const fs = require('fs');
['src/app/cooperative/requests/[type]/[id]/page.tsx', 'src/app/institution/services/[id]/page.tsx', 'src/app/society/requests/[id]/page.tsx'].forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/\(err instanceof Error \? err\.message : "Unknown error"\)/g, '(e instanceof Error ? e.message : "Unknown error")');
  fs.writeFileSync(f, c);
});
