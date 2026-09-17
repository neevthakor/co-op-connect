const fs = require('fs');

const replacements = [
  ['scripts/cleanup-demo-data.ts', 'user: any', 'user: { id: string; email: string; name: string | null; role: string; }'],
  ['src/app/admin/bookings/bookings-table.tsx', 'bookings: any[]', 'bookings: Array<{ id: string; status: string; customerId: string; workerId: string | null; createdAt: Date; }>'],
  ['src/app/admin/bookings/bookings-table.tsx', 'b: any', 'b: { id: string; status: string; customerId: string; workerId: string | null; createdAt: Date; }'],
  ['src/app/admin/capacity/page.tsx', 'useState<any[]>', 'useState<Array<{ id: string; name: string; capacity: number }>>'],
  ['src/app/admin/capacity/page.tsx', '(c: any)', '(c: { id: string; name: string; capacity: number })'],
  ['src/app/admin/complaints/page.tsx', 'useState<any[]>', 'useState<Array<{ id: string; subject: string; description: string; status: string; createdAt: string }>>'],
  ['src/app/admin/demand/page.tsx', 'useState<any>', 'useState<Record<string, unknown> | null>'],
  ['src/app/admin/demand/page.tsx', 'let chartData: any[]', 'let chartData: Array<{ date: string; count: number }>'],
  ['src/app/admin/demand/page.tsx', '(s: number, d: any)', '(s: number, d: { count: number })'],
  ['src/app/admin/demand/page.tsx', '(cat: any)', '(cat: { name: string; count: number })'],
  ['src/app/admin/finance/page.tsx', 'useState<any>', 'useState<Record<string, unknown> | null>'],
  ['src/app/admin/finance/page.tsx', 'value: any', 'value: number'],
  ['src/app/admin/finance/page.tsx', '(t: any)', '(t: { id: string; amount: number; type: string; status: string; createdAt: string })'],
  ['src/app/admin/forecast/page.tsx', 'useState<any[]>', 'useState<Array<{ date: string; expectedDemand: number; predictedShortfall: number }>>'],
  ['src/app/admin/forecast/page.tsx', '(d: any)', '(d: { date: string; expectedDemand: number; predictedShortfall: number })'],
  ['src/app/admin/impact/impact-client.tsx', 'initialStats: any', 'initialStats: Record<string, number>'],
  ['src/app/admin/impact/impact-client.tsx', 'initialRecent: any[]', 'initialRecent: Array<Record<string, unknown>>'],
  ['src/app/admin/impact/impact-client.tsx', '(s: any)', '(s: Record<string, unknown>)'],
  ['src/app/admin/organization-requests/[id]/assign/page.tsx', 'useState<any[]>', 'useState<Array<{ id: string; user: { name: string; phone: string; }; rating: number; distanceKm?: number; matchScore?: number }>>'],
  ['src/app/admin/organization-requests/[id]/assign/page.tsx', '(w: any)', '(w: { id: string; user: { name: string; phone: string; }; rating: number; distanceKm?: number; matchScore?: number })'],
  ['src/app/admin/workers/page.tsx', '(ws: any)', '(ws: { skill: { name: string } })'],
  ['src/app/customer/book/page.tsx', 'useState<any>', 'useState<Record<string, unknown> | null>'],
  ['src/app/customer/book/page.tsx', 'useState<any[]>', 'useState<Array<Record<string, unknown>>>'],
  ['src/app/customer/book/page.tsx', '(s: any)', '(s: Record<string, unknown>)'],
  ['src/app/customer/bookings/page.tsx', 'useState<any[]>', 'useState<Array<Record<string, unknown>>>'],
  ['src/app/customer/notifications/page.tsx', '(n: any)', '(n: { id: string; type: string; title: string; body: string; readAt: string | Date | null; createdAt: string | Date })'],
  ['src/app/institution/services/[id]/page.tsx', 'useState<any>', 'useState<Record<string, unknown> | null>'],
  ['src/app/society/requests/[id]/page.tsx', 'useState<any>', 'useState<Record<string, unknown> | null>'],
  ['src/app/worker/helpers/page.tsx', 'initialRequests: any[]', 'initialRequests: Array<Record<string, unknown>>'],
  ['src/app/worker/helpers/page.tsx', 'initialStats: any', 'initialStats: Record<string, number>'],
  ['src/app/worker/helpers/page.tsx', '(match: any)', '(match: { worker: { id: string; user: { name: string; }; primaryTrade: string; experience: number; averageRating: number; }; distanceKm: number; matchScore: number; })'],
  ['src/app/worker/jobs/page.tsx', 'useState<any[]>', 'useState<Array<Record<string, unknown>>>'],
  ['src/app/worker/notifications/page.tsx', '(n: any)', '(n: { id: string; type: string; title: string; body: string; readAt?: string | Date | null; createdAt: string | Date })'],
  ['src/components/customer/customer-booking-actions.tsx', 'booking: any', 'booking: Record<string, unknown>'],
  ['src/components/customer/customer-booking-actions.tsx', 'invoice: any', 'invoice: Record<string, unknown> | null'],
  ['src/components/shared/booking-card.tsx', 'booking: any', 'booking: { id: string; status: string; service: { title: string; }; customer: { user: { name: string; }; }; worker: { user: { name: string; }; } | null; scheduledAt: string | Date; }'],
  ['src/components/shared/booking-timeline.tsx', 'any[]', 'Array<{ id: string; status: string; note: string | null; createdAt: Date }>'],
  ['src/components/shared/charts.tsx', 'data: any[]', 'data: Array<Record<string, string | number>>'],
  ['src/components/shared/data-table.tsx', 'obj: any', 'obj: Record<string, unknown>'],
  ['src/components/shared/invoice-view.tsx', 'invoice: any', 'invoice: { id: string; status: string; totalAmount: number; breakdown: unknown; }'],
  ['src/components/shared/payment-summary.tsx', 'invoice: any', 'invoice: { totalAmount: number; subtotal: number; platformFee: number; status: string; }'],
  ['src/components/shared/proof-gallery.tsx', 'proofs: any[]', 'proofs: Array<{ id: string; url: string; type: string; createdAt: Date | string; caption?: string; }>'],
  ['src/components/shared/proof-gallery.tsx', '(p: any)', '(p: { id: string; url: string; type: string; createdAt: Date | string; caption?: string; })'],
  ['src/components/shared/trust-passport.tsx', '(s: any, idx: number)', '(s: { skill: { name: string; }; proficiencyLevel: string; verified: boolean; }, idx: number)'],
  ['src/components/shared/trust-passport.tsx', '(s: any)', '(s: { skill: { name: string; }; proficiencyLevel: string; verified: boolean; })'],
  ['src/components/shared/trust-passport.tsx', '(c: any, idx: number)', '(c: { name: string; issuingAuthority: string; verified: boolean; }, idx: number)'],
  ['src/components/shared/trust-passport.tsx', '(c: any)', '(c: { name: string; issuingAuthority: string; verified: boolean; })'],
  ['src/components/shared/trust-passport.tsx', 'worker: any', 'worker: { user: { name: string; }; primaryTrade: string; verified: boolean; averageRating: number; totalJobs: number; joinedAt: Date | string; skills: Array<{ skill: { name: string; }; proficiencyLevel: string; verified: boolean; }>; certifications: Array<{ name: string; issuingAuthority: string; verified: boolean; }>; }'],
  ['src/components/shared/worker-card.tsx', 'worker: any', 'worker: { id: string; user: { name: string; phone?: string; }; primaryTrade: string; averageRating?: number; totalJobs: number; verified?: boolean; distanceKm?: number; }']
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
    // console.log('Err', file);
  }
}

// Global generic replace for left-over useState<any>, etc.
const glob = require('glob');
const files = glob.sync('src/**/*.{ts,tsx}');
for (const file of files) {
  try {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    content = content.replace(/useState<any>/g, 'useState<Record<string, unknown> | null>');
    content = content.replace(/useState<any\[\]>/g, 'useState<Array<Record<string, unknown>>>');
    content = content.replace(/:\s*any\[\]/g, ': Array<Record<string, unknown>>');
    content = content.replace(/:\s*any/g, ': Record<string, unknown>');
    content = content.replace(/<\s*any\s*>/g, '<Record<string, unknown>>');
    content = content.replace(/<\s*any\s*\[\]\s*>/g, '<Array<Record<string, unknown>>>');
    
    // Fix the Record<string, unknown> properties issues in some files
    if (file.includes('job-execution-client.tsx')) {
       // already fixed this file manually hopefully, wait let's just make sure it's JobData
       content = content.replace(/initialJob: Record<string, unknown>/g, 'initialJob: JobData');
       content = content.replace(/useState<Record<string, unknown> \| null>\(initialJob\)/g, 'useState<JobData>(initialJob)');
       content = content.replace(/setJob\(\(prev: Record<string, unknown>\)/g, 'setJob((prev: JobData)');
    }

    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Generic replace in', file);
    }
  } catch (e) {}
}

console.log('Done');
