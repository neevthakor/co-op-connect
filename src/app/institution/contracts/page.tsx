import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { FileText } from "lucide-react";

export default async function InstitutionContractsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const institutionId = (session.user as any).institutionId;
  if (!institutionId) redirect("/login");

  const contracts = await prisma.institutionContract.findMany({
    where: { institutionId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Contracts</h1>
      {contracts.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center">
          <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-gray-500">No contracts</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contracts.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{c.title}</h3>
                  {c.description && <p className="text-sm text-gray-600 mt-1">{c.description}</p>}
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span>Start: {c.startDate ? formatDate(c.startDate) : "—"}</span>
                    <span>End: {c.endDate ? formatDate(c.endDate) : "—"}</span>
                    <span className="font-medium text-teal-600">{formatCurrency(c.totalValue)}</span>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  c.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                  c.status === "EXPIRED" ? "bg-gray-100 text-gray-700" :
                  "bg-red-100 text-red-700"
                }`}>{c.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
