import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ClipboardList, CheckCircle, Clock, Wrench, Plus } from "lucide-react";

export default async function SocietyDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const societyId = (session.user as { societyId?: string }).societyId;
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
    <div className="page-container space-y-6 py-5 md:py-8">
      <div className="mb-2">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700 dark:text-amber-300">Society workspace</p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{society.name}</h1>
        <p className="text-sm text-muted-foreground">{society.address} • {society.units} units</p>
      </div>

      {/* Stats */}
      <div className="mb-2 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-xl border border-border/80 bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10">
              <ClipboardList className="size-5 text-blue-700 dark:text-blue-300" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{openRequests}</p>
              <p className="text-xs text-muted-foreground">Open requests</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border/80 bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
              <Clock className="size-5 text-amber-700 dark:text-amber-300" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{scheduledRequests}</p>
              <p className="text-xs text-muted-foreground">Scheduled</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border/80 bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <CheckCircle className="size-5 text-emerald-700 dark:text-emerald-300" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{completedRequests}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border/80 bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-violet-500/10">
              <Wrench className="size-5 text-violet-700 dark:text-violet-300" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{activeContracts}</p>
              <p className="text-xs text-muted-foreground">Active AMCs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-2 grid gap-3 sm:grid-cols-3">
        <Link
          href="/society/requests/create"
          className="flex min-h-20 items-center gap-3 rounded-xl border border-border/80 bg-card p-4 transition-colors hover:border-amber-500/50"
        >
          <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
            <Plus className="size-5 text-amber-700 dark:text-amber-300" />
          </div>
          <div>
            <p className="font-medium text-foreground">New service request</p>
            <p className="text-xs text-muted-foreground">Request maintenance or repair</p>
          </div>
        </Link>
        <Link
          href="/society/locations"
          className="flex min-h-20 items-center gap-3 rounded-xl border border-border/80 bg-card p-4 transition-colors hover:border-amber-500/50"
        >
          <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
            <ClipboardList className="size-5 text-emerald-700 dark:text-emerald-300" />
          </div>
          <div>
            <p className="font-medium text-foreground">Manage locations</p>
            <p className="text-xs text-muted-foreground">Add or edit society areas</p>
          </div>
        </Link>
        <Link
          href="/society/maintenance"
          className="flex min-h-20 items-center gap-3 rounded-xl border border-border/80 bg-card p-4 transition-colors hover:border-amber-500/50"
        >
          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10">
            <Wrench className="size-5 text-blue-700 dark:text-blue-300" />
          </div>
          <div>
            <p className="font-medium text-foreground">Manage AMC</p>
            <p className="text-xs text-muted-foreground">View recurring maintenance contracts</p>
          </div>
        </Link>
      </div>

      {/* Recent Requests */}
      <div className="rounded-xl border border-border/80 bg-card">
        <div className="border-b border-border/70 p-4">
          <h2 className="font-semibold text-foreground">Recent service requests</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {society.serviceRequests.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <ClipboardList className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
              <p>No service requests yet</p>
            </div>
          ) : (
            society.serviceRequests.map((req) => (
              <div key={req.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{req.title}</p>
                  <p className="text-xs text-muted-foreground">{req.area || "General"} • {new Date(req.createdAt).toLocaleDateString("en-IN")}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  req.status === "OPEN" ? "bg-blue-500/10 text-blue-700 dark:text-blue-300" :
                  req.status === "SCHEDULED" ? "bg-amber-500/10 text-amber-700 dark:text-amber-300" :
                  req.status === "IN_PROGRESS" ? "bg-orange-500/10 text-orange-700 dark:text-orange-300" :
                  "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
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
        <div className="rounded-xl border border-border/80 bg-card">
          <div className="border-b border-border/70 p-4">
            <h2 className="font-semibold text-foreground">Active maintenance contracts</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {society.maintenanceContracts.map((contract) => (
              <div key={contract.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{contract.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {contract.frequency} • Next: {contract.nextService ? new Date(contract.nextService).toLocaleDateString("en-IN") : "TBD"}
                  </p>
                </div>
                <span className="text-sm font-medium text-foreground">₹{contract.cost.toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
