const fs = require('fs');

const replacements = [
  ['src/app/admin/complaints/page.tsx', 'useState<Array<{ id: string; subject: string; description: string; status: string; createdAt: string | Date }>>', 'useState<Array<{ id: string; subject: string; description: string; status: string; createdAt: string | Date; type?: string; customer?: { user?: { name?: string } }; worker?: { user?: { name?: string } } }>>'],
  
  ['src/app/admin/demand/page.tsx', 'let chartData: Array<{ date: string; count: number }>', 'let chartData: Array<{ day: string; count: number }>'],
  ['src/app/admin/demand/page.tsx', 'Array<{ date: string; count: number }>', 'Array<{ day: string; count: number }>'],
  
  ['src/app/admin/finance/page.tsx', 'useState<Record<string, unknown> | null>', 'useState<{ grossRevenue?: number; netTakeHome?: number; cooperativeFund?: number; welfareFund?: number } | null>'],
  ['src/app/admin/finance/page.tsx', '(value: number) => string', '(value: number | undefined) => string'],
  
  ['src/app/admin/forecast/page.tsx', 'useState<Array<{ date: string; expectedDemand: number; predictedShortfall: number }>>', 'useState<Array<{ day: string; expectedDemand: number; predictedShortfall: number }>>'],
  ['src/app/admin/forecast/page.tsx', 'Array<{ date: string; expectedDemand: number; predictedShortfall: number }>', 'Array<{ day: string; expectedDemand: number; predictedShortfall: number }>'],
  
  ['src/app/customer/book/page.tsx', 'useState<Array<{ id: string; name: string }>>', 'useState<Array<{ id: string; name: string; address?: string; latitude?: number; longitude?: number; city?: string; state?: string; worker?: { user?: { name?: string; phone?: string; } }; estimatedPrice?: number; distanceKm?: number; compositeScore?: number; match_score?: number; }>>'],
  ['src/app/customer/book/page.tsx', '(s: { id: string; name: string })', '(s: { id: string; name: string; address?: string; latitude?: number; longitude?: number; city?: string; state?: string; worker?: { user?: { name?: string; phone?: string; } }; estimatedPrice?: number; distanceKm?: number; compositeScore?: number; match_score?: number; })'],
  
  ['src/components/shared/booking-card.tsx', 'customer: { user: { name: string; }; };', 'customer: { user?: { name: string; }; }; description?: string; scheduledDate?: string | Date; createdAt?: string | Date; finalPrice?: number; estimatedPrice?: number; category?: string; basePrice?: number;'],
  ['src/components/shared/data-table.tsx', 'obj: Record<string, unknown>', 'obj: any'],
  
  ['src/components/shared/proof-gallery.tsx', 'caption?: string;', 'caption?: string | null;'],
  
  ['src/components/shared/invoice-view.tsx', 'totalAmount: number; breakdown: unknown;', 'totalAmount: number; breakdown: unknown; invoiceNumber?: string; issuedAt?: string | Date; createdAt?: string | Date; labourCharge?: number; travelCharge?: number; materialCharge?: number; cooperativeContribution?: number; welfareContribution?: number; tax?: number; total?: number; items?: Array<{description: string; amount: number}>;']
];

for (const [file, from, to] of replacements) {
  try {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes(from)) {
      content = content.split(from).join(to);
      fs.writeFileSync(file, content, 'utf8');
      console.log('Fixed', file, from);
    }
  } catch (e) {
  }
}

// Special fixes
try {
  let file = 'src/app/admin/finance/page.tsx';
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/t: \{ id: string; amount: number; type: string; status: string; createdAt: string \| Date \}/g, 't: { id: string; amount: number; type: string; status: string; createdAt: string | Date; [key: string]: unknown }');
  fs.writeFileSync(file, content, 'utf8');
} catch (e) {}

try {
  let file = 'src/components/shared/data-table.tsx';
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/extends Record<string, unknown>/g, 'extends any');
  fs.writeFileSync(file, content, 'utf8');
} catch(e) {}
console.log('Done');
