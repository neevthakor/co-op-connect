const fs = require('fs');

function fix(file, from, to) {
  let c = fs.readFileSync(file, 'utf8');
  c = c.replace(from, to);
  fs.writeFileSync(file, c, 'utf8');
}

fix('scripts/cleanup-demo-data.ts', 'user: any', 'user: { id: string, name: string | null, email: string, role: string }');
fix('src/app/admin/demand/page.tsx', 'let chartData: any[] = [];', 'let chartData: Array<{ date: string; count: number; }> = [];');
fix('src/app/admin/demand/page.tsx', '(s: number, d: any)', '(s: number, d: { count: number })');
fix('src/app/admin/finance/page.tsx', '{ name: string; value: any }', '{ name: string; value: number }');
fix('src/app/admin/impact/impact-client.tsx', '{ initialStats: any; initialRecent: any[] }', '{ initialStats: Record<string, number>; initialRecent: Record<string, unknown>[] }');
fix('src/app/admin/organization-requests/[id]/assign/page.tsx', '(w: any)', '(w: { id: string; user: { name: string; phone: string; }; rating: number; })');
fix('src/app/admin/workers/page.tsx', '(ws: any)', '(ws: { skill: { name: string } })');
fix('src/app/customer/bookings/page.tsx', 'useState<any[]>', 'useState<Record<string, unknown>[]>');
fix('src/app/customer/notifications/page.tsx', '(n: any)', '(n: { id: string, isRead: boolean })');
fix('src/app/institution/services/[id]/page.tsx', 'useState<any>(null)', 'useState<Record<string, unknown> | null>(null)');
fix('src/app/society/requests/[id]/page.tsx', 'useState<any>(null)', 'useState<Record<string, unknown> | null>(null)');
fix('src/app/worker/helpers/page.tsx', '{ initialRequests: any[], initialStats: any }', '{ initialRequests: Record<string, unknown>[], initialStats: Record<string, number> }');
fix('src/app/worker/jobs/page.tsx', 'useState<any[]>', 'useState<Record<string, unknown>[]>');
fix('src/components/customer/customer-booking-actions.tsx', '{ booking: any, invoice: any }', '{ booking: Record<string, unknown>, invoice: Record<string, unknown> | null }');
fix('src/components/shared/booking-card.tsx', '{ booking }: { booking: any }', '{ booking }: { booking: Record<string, unknown> }');
fix('src/components/shared/booking-timeline.tsx', 'TimelineEvent[] | any[]', 'TimelineEvent[]');
fix('src/components/shared/charts.tsx', '{ data: any[] }', '{ data: Record<string, string | number>[] }');
fix('src/components/shared/data-table.tsx', 'obj: any', 'obj: Record<string, unknown>');
fix('src/components/shared/invoice-view.tsx', '{ invoice: any }', '{ invoice: { id: string; status: string; totalAmount: number; breakdown: any; } }');
fix('src/components/shared/payment-summary.tsx', '{ invoice: any }', '{ invoice: { totalAmount: number; subtotal: number; platformFee: number; status: string; } }');
fix('src/components/shared/proof-gallery.tsx', '{ proofs: any[] }', '{ proofs: Array<{ id: string; url: string; type: string; createdAt: Date; }> }');
fix('src/components/shared/proof-gallery.tsx', '(p: any)', '(p: { id: string; url: string; type: string; createdAt: Date; })');
fix('src/components/worker/job-execution-client.tsx', '{ initialJob: any }', '{ initialJob: JobData }');
fix('src/components/worker/job-execution-client.tsx', 'setJob((prev: any)', 'setJob((prev: JobData)');
fix('src/components/worker/job-execution-client.tsx', 'setJob((prev: any)', 'setJob((prev: JobData)'); // multiple matches
console.log('Fixed more any types');
