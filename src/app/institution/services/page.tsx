import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Clock, Plus, ClipboardList } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export const metadata = {
  title: "Institution Requests - Co-opConnect",
};

export default async function InstitutionServicesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const institutionId = session.user.institutionId;
  if (!institutionId) redirect("/login");

  const requests = await prisma.institutionServiceRequest.findMany({
    where: { institutionId },
    include: {
      location: true,
      category: true,
      bookings: {
        include: { worker: { include: { user: true } } }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Service Requests</h2>
          <p className="text-muted-foreground">Manage and track service requests for your institution.</p>
        </div>
        <Link href="/institution/requests/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {requests.map(req => (
          <Card key={req.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {req.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{req.category?.name}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={req.priority === "URGENT" || req.priority === "HIGH" ? "destructive" : "secondary"}>
                    {req.priority}
                  </Badge>
                  <Badge variant={req.status === "OPEN" ? "default" : req.status === "SCHEDULED" ? "secondary" : "outline"}>
                    {req.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>{req.description}</p>
              <div className="flex items-center gap-4 text-muted-foreground mt-4">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {req.location?.name || "Location not specified"}</span>
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(req.createdAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
            <CardFooter className="pt-3 border-t flex justify-between items-center">
              <div>
                {req.bookings?.length > 0 ? (
                  <p className="text-sm font-medium flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs">
                      {req.bookings[0].worker.user.name.charAt(0)}
                    </span>
                    Assigned: {req.bookings[0].worker.user.name} ({req.bookings[0].status})
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No worker assigned yet</p>
                )}
              </div>
              
              <Link href={`/institution/services/${req.id}`}>
                <Button size="sm" variant={req.status === "OPEN" ? "default" : "outline"}>
                  {req.status === "OPEN" ? "Find Workers" : "View Details"}
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}

        {requests.length === 0 && (
          <div className="py-12 text-center text-muted-foreground border rounded-lg border-dashed">
            <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No service requests found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
