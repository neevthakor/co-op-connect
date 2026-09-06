import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, ClipboardList, CheckCircle } from "lucide-react";

export const metadata = {
  title: "Cooperative Dashboard - Co-opConnect",
};

export default async function CooperativeDashboardPage() {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "COOPERATIVE_ADMIN") {
    redirect("/login");
  }

  const admin = await prisma.cooperativeAdmin.findUnique({
    where: { userId: session.user.id },
    include: { cooperative: true },
  });

  if (!admin) {
    redirect("/login");
  }

  const cooperativeId = admin.cooperativeId;

  const [
    totalWorkers,
    verifiedWorkers,
    availableWorkers,
    activeJobs,
    pendingSocietyRequests,
    pendingInstRequests,
    completedJobs,
  ] = await Promise.all([
    prisma.worker.count({ where: { cooperativeId } }),
    prisma.worker.count({ where: { cooperativeId, verificationStatus: "VERIFIED" } }),
    prisma.worker.count({ where: { cooperativeId, availabilityStatus: "AVAILABLE" } }),
    prisma.booking.count({ 
      where: { 
        worker: { cooperativeId }, 
        status: { in: ["REQUESTED", "ACCEPTED", "TRAVELLING", "ARRIVED", "IN_PROGRESS"] } 
      } 
    }),
    prisma.societyServiceRequest.count({ where: { cooperativeId, status: "OPEN" } }),
    prisma.institutionServiceRequest.count({ where: { cooperativeId, status: "OPEN" } }),
    prisma.booking.count({ 
      where: { 
        worker: { cooperativeId }, 
        status: "COMPLETED" 
      } 
    }),
  ]);

  const pendingRequests = pendingSocietyRequests + pendingInstRequests;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{admin.cooperative.name}</h2>
          <p className="text-muted-foreground">Overview of your cooperative's workforce and operations.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWorkers}</div>
            <p className="text-xs text-muted-foreground">{verifiedWorkers} verified members</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Available Workers</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableWorkers}</div>
            <p className="text-xs text-muted-foreground">Ready for dispatch</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Briefcase className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeJobs}</div>
            <p className="text-xs text-muted-foreground">Currently in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <ClipboardList className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests}</div>
            <p className="text-xs text-muted-foreground">From organizations</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cooperative Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Registration No</p>
              <p className="text-sm">{admin.cooperative.registrationNo || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Location</p>
              <p className="text-sm">{admin.cooperative.address}, {admin.cooperative.city}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p className="text-sm">{admin.cooperative.description || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed Jobs</p>
              <p className="text-sm">{completedJobs}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
