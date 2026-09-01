import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, ClipboardList, Wrench, CheckCircle, Clock, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default async function InstitutionDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const institutionId = (session.user as any).institutionId;
  if (!institutionId) redirect("/login");

  const institution = await prisma.institution.findUnique({
    where: { id: institutionId },
    include: {
      contracts: { where: { status: "ACTIVE" } },
      serviceRequests: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!institution) redirect("/login");

  const openRequests = institution.serviceRequests.filter(r => r.status === "OPEN").length;
  const activeContracts = institution.contracts.length;
  const totalContractValue = institution.contracts.reduce((sum, c) => sum + c.totalValue, 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{institution.name}</h1>
        <p className="text-sm text-gray-500">{institution.type} • {institution.address}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeContracts}</p>
              <p className="text-xs text-gray-500">Active Contracts</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{openRequests}</p>
              <p className="text-xs text-gray-500">Open Requests</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalContractValue)}</p>
              <p className="text-xs text-gray-500">Contract Value</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {institution.serviceRequests.filter(r => r.status === "COMPLETED").length}
              </p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border">
          <div className="p-4 border-b"><h2 className="font-semibold text-gray-900">Active Contracts</h2></div>
          <div className="divide-y">
            {institution.contracts.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No active contracts</div>
            ) : (
              institution.contracts.map((c) => (
                <div key={c.id} className="p-4">
                  <p className="font-medium text-gray-900">{c.title}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {c.startDate ? new Date(c.startDate).toLocaleDateString("en-IN") : "—"} — {c.endDate ? new Date(c.endDate).toLocaleDateString("en-IN") : "—"}
                  </p>
                  <p className="text-sm font-medium text-teal-600 mt-1">{formatCurrency(c.totalValue)}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border">
          <div className="p-4 border-b"><h2 className="font-semibold text-gray-900">Recent Requests</h2></div>
          <div className="divide-y">
            {institution.serviceRequests.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No service requests</div>
            ) : (
              institution.serviceRequests.map((req) => (
                <div key={req.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{req.title}</p>
                    <p className="text-xs text-gray-500">{new Date(req.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    req.status === "OPEN" ? "bg-blue-100 text-blue-700" :
                    req.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                    "bg-amber-100 text-amber-700"
                  }`}>{req.status}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
