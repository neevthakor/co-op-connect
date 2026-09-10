import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Wrench, Calendar, DollarSign } from "lucide-react";

export default async function SocietyMaintenancePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const societyId = session.user.societyId;
  if (!societyId) redirect("/login");

  const contracts = await prisma.maintenanceContract.findMany({
    where: { societyId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Maintenance Contracts (AMC)</h1>

      {contracts.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center">
          <Wrench className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-gray-500">No maintenance contracts</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {contracts.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{c.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {c.frequency}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      ₹{c.cost.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  c.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                  c.status === "PAUSED" ? "bg-amber-100 text-amber-700" :
                  "bg-gray-100 text-gray-700"
                }`}>
                  {c.status}
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Last Service</p>
                  <p className="font-medium text-gray-900">
                    {c.lastService ? new Date(c.lastService).toLocaleDateString("en-IN") : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Next Service</p>
                  <p className="font-medium text-gray-900">
                    {c.nextService ? new Date(c.nextService).toLocaleDateString("en-IN") : "—"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
