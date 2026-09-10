import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, ClipboardList, CheckCircle, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default async function InstitutionDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const institutionId = (session.user as { institutionId?: string }).institutionId;
  if (!institutionId) redirect("/login");

  const institution = await prisma.institution.findUnique({
    where: { id: institutionId },
    include: {
      contracts: { where: { status: "ACTIVE" } },
      serviceRequests: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!institution) redirect("/login");

  const openRequests = institution.serviceRequests.filter((r) => r.status === "OPEN").length;
  const activeContracts = institution.contracts.length;
  const totalContractValue = institution.contracts.reduce((sum, c) => sum + c.totalValue, 0);
  const completedRequests = institution.serviceRequests.filter((r) => r.status === "COMPLETED").length;

  const stats = [
    { label: "Active contracts", value: activeContracts, icon: FileText, tone: "teal" },
    { label: "Open requests", value: openRequests, icon: ClipboardList, tone: "blue" },
    { label: "Contract value", value: formatCurrency(totalContractValue), icon: DollarSign, tone: "emerald" },
    { label: "Completed", value: completedRequests, icon: CheckCircle, tone: "violet" },
  ] as const;
  const toneStyles = {
    teal: "bg-teal-500/10 text-teal-700 dark:text-teal-300",
    blue: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
    emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    violet: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  };

  return (
    <div className="page-container space-y-6 py-5 md:py-8">
      <header>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300">Institution workspace</p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{institution.name}</h1>
        <p className="text-sm text-muted-foreground">{institution.type} • {institution.address}</p>
      </header>

      <section aria-label="Institution overview" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="rounded-xl border border-border/80 bg-card p-4">
            <div className="flex items-center gap-3">
              <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${toneStyles[tone].split(" ")[0]}`}>
                <Icon className={`size-5 ${toneStyles[tone].split(" ").slice(1).join(" ")}`} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-2xl font-bold text-foreground">{value}</p>
                <p className="truncate text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section aria-label="Quick actions" className="grid gap-3 sm:grid-cols-2">
        <Link href="/institution/requests/create" className="flex min-h-20 items-center gap-3 rounded-xl border border-border/80 bg-card p-4 transition-colors hover:border-teal-500/50">
          <div className="flex size-10 items-center justify-center rounded-lg bg-teal-500/10"><ClipboardList className="size-5 text-teal-700 dark:text-teal-300" /></div>
          <div><p className="font-medium text-foreground">New service request</p><p className="text-xs text-muted-foreground">Request service or repair</p></div>
        </Link>
        <Link href="/institution/locations" className="flex min-h-20 items-center gap-3 rounded-xl border border-border/80 bg-card p-4 transition-colors hover:border-teal-500/50">
          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10"><ClipboardList className="size-5 text-blue-700 dark:text-blue-300" /></div>
          <div><p className="font-medium text-foreground">Manage locations</p><p className="text-xs text-muted-foreground">Edit institution areas</p></div>
        </Link>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border/80 bg-card">
          <div className="border-b border-border/70 p-4"><h2 className="font-semibold text-foreground">Active contracts</h2></div>
          <div className="divide-y divide-border/70">
            {institution.contracts.length === 0 ? <div className="p-6 text-center text-muted-foreground">No active contracts</div> : institution.contracts.map((c) => (
              <div key={c.id} className="p-4">
                <p className="font-medium text-foreground">{c.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{c.startDate ? new Date(c.startDate).toLocaleDateString("en-IN") : "—"} — {c.endDate ? new Date(c.endDate).toLocaleDateString("en-IN") : "—"}</p>
                <p className="mt-1 text-sm font-medium text-teal-700 dark:text-teal-300">{formatCurrency(c.totalValue)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border/80 bg-card">
          <div className="border-b border-border/70 p-4"><h2 className="font-semibold text-foreground">Recent requests</h2></div>
          <div className="divide-y divide-border/70">
            {institution.serviceRequests.length === 0 ? <div className="p-6 text-center text-muted-foreground">No service requests</div> : institution.serviceRequests.map((req) => (
              <div key={req.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="text-sm font-medium text-foreground">{req.title}</p><p className="text-xs text-muted-foreground">{new Date(req.createdAt).toLocaleDateString("en-IN")}</p></div>
                <span className={`w-fit rounded px-2 py-1 text-xs font-medium ${req.status === "OPEN" ? "bg-blue-500/10 text-blue-700 dark:text-blue-300" : req.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-amber-500/10 text-amber-700 dark:text-amber-300"}`}>{req.status}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
