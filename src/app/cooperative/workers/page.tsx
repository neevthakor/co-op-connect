import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star } from "lucide-react";

export const metadata = {
  title: "Workers - Cooperative - Co-opConnect",
};

export default async function CooperativeWorkersPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "COOPERATIVE_ADMIN") {
    redirect("/login");
  }

  const admin = await prisma.cooperativeAdmin.findUnique({
    where: { userId: session.user.id },
  });

  if (!admin) {
    redirect("/login");
  }

  const workers = await prisma.worker.findMany({
    where: { cooperativeId: admin.cooperativeId },
    include: {
      user: true,
      skills: {
        include: { skill: true }
      }
    },
    orderBy: { joinedAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Cooperative Workers</h2>
        <p className="text-muted-foreground">Manage and view all workers in your cooperative.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workers.map(worker => (
          <Card key={worker.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-secondary rounded-full overflow-hidden flex items-center justify-center">
                    {worker.user.avatar ? (
                      <img src={worker.user.avatar} alt={worker.user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-medium">{worker.user.name.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{worker.user.name}</h3>
                    <p className="text-sm text-muted-foreground">{worker.primaryTrade || "Multi-skilled"}</p>
                  </div>
                </div>
                <Badge variant={worker.availabilityStatus === "AVAILABLE" ? "default" : "secondary"}>
                  {worker.availabilityStatus}
                </Badge>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{worker.address || worker.city}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>{worker.averageRating.toFixed(1)} ({worker.totalJobs} jobs)</span>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex flex-wrap gap-1">
                  {worker.skills.slice(0, 3).map(ws => (
                    <Badge key={ws.id} variant="outline" className="text-xs font-normal">
                      {ws.skill.name}
                    </Badge>
                  ))}
                  {worker.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs font-normal">
                      +{worker.skills.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {workers.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No workers found in this cooperative.
          </div>
        )}
      </div>
    </div>
  );
}
