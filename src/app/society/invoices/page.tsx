import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FileText } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function SocietyInvoicesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const societyId = session.user.societyId;
  if (!societyId) redirect("/login");

  const bookings = await prisma.booking.findMany({
    where: { societyRequestId: { not: null }, societyRequest: { societyId } },
    include: { invoice: true, category: true, worker: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const invoices = bookings.filter(b => b.invoice).map(b => ({
    ...b.invoice!,
    category: b.category.name,
    worker: b.worker.user.name,
    date: b.createdAt,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Invoices</h1>

      {invoices.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center">
          <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-gray-500">No invoices yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left p-4 font-medium text-gray-500">Invoice #</th>
                  <th className="text-left p-4 font-medium text-gray-500">Service</th>
                  <th className="text-left p-4 font-medium text-gray-500">Worker</th>
                  <th className="text-left p-4 font-medium text-gray-500">Date</th>
                  <th className="text-right p-4 font-medium text-gray-500">Total</th>
                  <th className="text-center p-4 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="p-4 font-mono text-xs">{inv.invoiceNumber}</td>
                    <td className="p-4">{inv.category}</td>
                    <td className="p-4">{inv.worker}</td>
                    <td className="p-4 text-gray-500">{formatDate(inv.date)}</td>
                    <td className="p-4 text-right font-medium">{formatCurrency(inv.total)}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        inv.status === "PAID" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
