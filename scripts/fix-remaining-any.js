const fs = require('fs');

function replaceStr(file, findStr, replaceStr) {
  try {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes(findStr)) {
      content = content.replace(findStr, replaceStr);
      fs.writeFileSync(file, content, 'utf8');
      console.log('Fixed', file);
    } else {
      console.log('Pattern not found in', file);
    }
  } catch (e) {
    console.error('Error with', file, e.message);
  }
}

replaceStr('src/app/admin/finance/page.tsx', '{ name: string; value: any }', '{ name: string; value: number }');
replaceStr('src/app/admin/impact/impact-client.tsx', '{ initialStats: any; initialRecent: any[] }', '{ initialStats: Record<string, number>; initialRecent: Record<string, unknown>[] }');
replaceStr('src/app/admin/organization-requests/[id]/assign/page.tsx', '(w: any)', '(w: { id: string; user: { name: string; phone: string; }; rating: number; })');
replaceStr('src/app/admin/workers/page.tsx', '(ws: any)', '(ws: { skill: { name: string } })');
replaceStr('src/app/customer/bookings/page.tsx', 'useState<any[]>', 'useState<Record<string, unknown>[]>');
replaceStr('src/app/customer/notifications/page.tsx', '(n: any)', '(n: { id: string, isRead: boolean })');
replaceStr('src/app/institution/services/[id]/page.tsx', 'useState<any>(null)', 'useState<Record<string, unknown> | null>(null)');
replaceStr('src/app/society/requests/[id]/page.tsx', 'useState<any>(null)', 'useState<Record<string, unknown> | null>(null)');
replaceStr('src/app/worker/helpers/page.tsx', '{ initialRequests: any[], initialStats: any }', '{ initialRequests: Record<string, unknown>[], initialStats: Record<string, number> }');
replaceStr('src/app/worker/jobs/page.tsx', 'useState<any[]>', 'useState<Record<string, unknown>[]>');
replaceStr('src/components/customer/customer-booking-actions.tsx', '{ booking: any, invoice: any }', '{ booking: Record<string, unknown>, invoice: Record<string, unknown> | null }');
replaceStr('src/components/shared/booking-card.tsx', '{ booking }: { booking: any }', '{ booking }: { booking: Record<string, unknown> }');
replaceStr('src/components/shared/charts.tsx', '{ data: any[] }', '{ data: Record<string, string | number>[] }');
replaceStr('src/components/shared/invoice-view.tsx', '{ invoice: any }', '{ invoice: { id: string; status: string; totalAmount: number; breakdown: unknown; } }');
replaceStr('src/components/shared/payment-summary.tsx', '{ invoice: any }', '{ invoice: { totalAmount: number; subtotal: number; platformFee: number; status: string; } }');
replaceStr('src/components/shared/proof-gallery.tsx', '{ proofs: any[] }', '{ proofs: Array<{ id: string; url: string; type: string; createdAt: Date; }> }');

console.log("Done");
