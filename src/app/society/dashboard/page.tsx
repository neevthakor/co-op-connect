import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ClipboardList, CheckCircle, Clock, DollarSign, Wrench, Plus, AlertTriangle } from "lucide-react";

export default async function SocietyDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const societyId = (session.user as any).societyId;
  if (!societyId) redirect("/login");

  const society = await prisma.housingSociety.findUnique({
    where: { id: societyId },
    include: {
      serviceRequests: { orderBy: { createdAt: "desc" }, take: 10 },
      maintenanceContracts: { where: { status: "ACTIVE" } },
    },
  });

  if (!society) redirect("/login");

  const openRequests = society.serviceRequests.filter(r => r.status === "OPEN").length;
  const scheduledRequests = society.serviceRequests.filter(r => r.status === "SCHEDULED").length;
  const completedRequests = society.serviceRequests.filter(r => r.status === "COMPLETED").length;
  const activeContracts = society.maintenanceContracts.length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{society.name}</h1>
        <p className="text-sm text-gray-500">{society.address} • {society.units} units</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
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
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{scheduledRequests}</p>
              <p className="text-xs text-gray-500">Scheduled</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{completedRequests}</p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Wrench className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeContracts}</p>
              <p className="text-xs text-gray-500">Active AMCs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Link
          href="/society/requests/create"
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-amber-300 transition-colors"
        >
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <Plus className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <p className="font-medium text-gray-900">New Service Request</p>
            <p className="text-xs text-gray-500">Request maintenance or repair</p>
          </div>
        </Link>
        <Link
          href="/society/locations"
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-amber-300 transition-colors"
        >
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-green-700" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Manage Locations</p>
            <p className="text-xs text-gray-500">Add or edit society areas</p>
          </div>
        </Link>
        <Link
          href="/society/maintenance"
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-amber-300 transition-colors"
        >
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Wrench className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Manage AMC</p>
            <p className="text-xs text-gray-500">View recurring maintenance contracts</p>
          </div>
        </Link>
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Service Requests</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {society.serviceRequests.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <ClipboardList className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No service requests yet</p>
            </div>
          ) : (
            society.serviceRequests.map((req) => (
              <div key={req.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{req.title}</p>
                  <p className="text-xs text-gray-500">{req.area || "General"} • {new Date(req.createdAt).toLocaleDateString("en-IN")}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  req.status === "OPEN" ? "bg-blue-100 text-blue-700" :
                  req.status === "SCHEDULED" ? "bg-amber-100 text-amber-700" :
                  req.status === "IN_PROGRESS" ? "bg-orange-100 text-orange-700" :
                  "bg-green-100 text-green-700"
                }`}>
                  {req.status.replace("_", " ")}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Maintenance Contracts */}
      {society.maintenanceContracts.length > 0 && (
        <div className="mt-6 bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Active Maintenance Contracts</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {society.maintenanceContracts.map((contract) => (
              <div key={contract.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{contract.title}</p>
                  <p className="text-xs text-gray-500">
                    {contract.frequency} • Next: {contract.nextService ? new Date(contract.nextService).toLocaleDateString("en-IN") : "TBD"}
                  </p>
                </div>
                <span className="text-sm font-medium text-gray-900">₹{contract.cost.toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
