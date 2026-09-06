import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Building2, Building } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export const metadata = {
  title: "Requests - Cooperative - Co-opConnect",
};

export default async function CooperativeRequestsPage() {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "COOPERATIVE_ADMIN") {
    redirect("/login");
  }

  const admin = await prisma.cooperativeAdmin.findUnique({
    where: { userId: session.user.id },
  });

  if (!admin) {
    redirect("/login");
  }

  const societyRequests = await prisma.societyServiceRequest.findMany({
    where: { cooperativeId: admin.cooperativeId },
    include: {
      society: true,
      location: true,
      category: true,
    },
    orderBy: { createdAt: "desc" }
  });

  const institutionRequests = await prisma.institutionServiceRequest.findMany({
    where: { cooperativeId: admin.cooperativeId },
    include: {
      institution: true,
      location: true,
      category: true,
    },
    orderBy: { createdAt: "desc" }
  });

  const allRequests = [
    ...societyRequests.map(r => ({ ...r, type: "SOCIETY" as const, orgName: r.society.name, area: r.area })),
    ...institutionRequests.map(r => ({ ...r, type: "INSTITUTION" as const, orgName: r.institution.name, area: null }))
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Organization Requests</h2>
        <p className="text-muted-foreground">Service requests assigned to your cooperative.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {allRequests.map(req => (
          <Card key={`${req.type}-${req.id}`} className="flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant={req.type === "SOCIETY" ? "default" : "secondary"} className="mb-2">
                    {req.type === "SOCIETY" ? <Building className="w-3 h-3 mr-1" /> : <Building2 className="w-3 h-3 mr-1" />}
                    {req.orgName}
                  </Badge>
                  <CardTitle className="text-lg">{req.title}</CardTitle>
                </div>
                <Badge variant={req.status === "OPEN" ? "destructive" : req.status === "SCHEDULED" ? "default" : "outline"}>
                  {req.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-3 text-sm">
              <p className="text-muted-foreground line-clamp-2">{req.description}</p>
              
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{req.location?.name || req.area || "Location not specified"}</span>
              </div>
              
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{formatDistanceToNow(req.createdAt, { addSuffix: true })}</span>
              </div>
            </CardContent>
            <CardFooter className="pt-3 border-t">
              <div className="flex w-full justify-between items-center">
                <span className="text-sm font-medium">{req.category?.name || "Uncategorized"}</span>
                {req.status === "OPEN" ? (
                  <Link href={`/cooperative/requests/${req.type.toLowerCase()}/${req.id}`}>
                    <Button size="sm">Find Workers</Button>
                  </Link>
                ) : (
                  <Button size="sm" variant="outline" disabled>Processed</Button>
                )}
              </div>
            </CardFooter>
          </Card>
        ))}

        {allRequests.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground border rounded-lg border-dashed">
            No incoming requests found for your cooperative.
          </div>
        )}
      </div>
    </div>
  );
}
