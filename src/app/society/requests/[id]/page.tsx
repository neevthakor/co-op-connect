import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Clock, AlertTriangle } from "lucide-react";
import { findWorkersForOrganizationRequest, assignWorkerToOrganizationRequest } from "@/services/organization";
import { revalidatePath } from "next/cache";

export default async function SocietyRequestDetailsPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const societyId = session.user.societyId;
  if (!societyId) redirect("/login");

  const requestId = params.id;

  const request = await prisma.societyServiceRequest.findUnique({
    where: { id: requestId, societyId },
    include: {
      location: true,
      category: true,
      bookings: {
        include: { worker: { include: { user: true, cooperative: true } } }
      }
    }
  });

  if (!request) {
    return <div className="p-8 text-center text-red-500">Request not found or access denied.</div>;
  }

  // Find workers if still open
  let matches: any[] = [];
  let error = "";
  if (request.status === "OPEN") {
    try {
      matches = await findWorkersForOrganizationRequest(requestId, "SOCIETY", request.priority as 'NORMAL' | 'URGENT' | 'EMERGENCY');
    } catch (e) {
      error = (e instanceof Error ? e.message : "Unknown error");
    }
  }

  async function handleAssign(formData: FormData) {
    "use server";
    const workerId = formData.get("workerId") as string;
    if (!workerId) return;

    try {
      const session = await auth();
      if (!session?.user) throw new Error("Unauthorized");

      await assignWorkerToOrganizationRequest({
        requestId,
        type: "SOCIETY",
        workerId,
        assignedByUserId: session.user.id as string,
      });
      revalidatePath(`/society/requests/${requestId}`);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Request #{request.id.slice(-6)}</h2>
          <p className="text-muted-foreground">{request.title}</p>
        </div>
        <Badge variant={request.status === "OPEN" ? "destructive" : "default"} className="text-sm px-3 py-1">
          {request.status}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Category</p>
              <p>{request.category?.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Location</p>
              <p className="flex items-center gap-1 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                {request.location?.name || request.area}
              </p>
            </div>
            <div className="col-span-full">
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p className="text-sm">{request.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {request.status === "OPEN" && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            Nearby Workers
            <Badge variant="secondary" className="text-xs">FairMatch Recommended</Badge>
          </h3>
          {error && <div className="p-4 bg-red-500/10 text-red-500 rounded-lg">{error}</div>}
          
          <div className="grid gap-4 md:grid-cols-2">
            {matches.map((match, i) => (
              <Card key={match.worker.id} className={i === 0 ? "border-amber-500 shadow-md" : ""}>
                <CardContent className="p-4 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-secondary rounded-full overflow-hidden flex items-center justify-center">
                        {match.worker.user.avatar ? (
                          <img src={match.worker.user.avatar} alt={match.worker.user.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-medium">{match.worker.user.name.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold">{match.worker.user.name}</div>
                        <p className="text-xs text-muted-foreground">{match.worker.primaryTrade}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-200">
                      Score: {match.match_score}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm mb-4 flex-1">
                    <p className="text-xs text-muted-foreground italic">
                      {match.worker.cooperative?.name ? `From ${match.worker.cooperative.name}` : "Independent Worker"}
                    </p>
                    <p className="text-xs bg-muted p-2 rounded-md">{match.explanation}</p>
                  </div>
                  
                  <form action={handleAssign} className="w-full mt-auto">
                    <input type="hidden" name="workerId" value={match.worker.id} />
                    <Button type="submit" className="w-full" variant={i === 0 ? "default" : "secondary"}>
                      Assign Worker
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ))}
            {matches.length === 0 && !error && (
              <div className="col-span-full p-8 text-center border rounded-lg border-dashed">
                <AlertTriangle className="w-8 h-8 mx-auto text-amber-500 mb-2" />
                <p className="font-medium">No eligible workers found nearby</p>
                <p className="text-sm text-muted-foreground">This request might be too far from our worker network, or no workers are available.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {request.status !== "OPEN" && request.bookings?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Assigned Job</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                  {request.bookings[0].worker.user.avatar ? (
                    <img src={request.bookings[0].worker.user.avatar} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    request.bookings[0].worker.user.name.charAt(0)
                  )}
                </div>
                <div>
                  <p className="font-semibold">{request.bookings[0].worker.user.name}</p>
                  <p className="text-sm text-muted-foreground">{request.bookings[0].worker.cooperative?.name}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge>{request.bookings[0].status}</Badge>
                <p className="text-xs text-muted-foreground mt-1">Booking #{request.bookings[0].id.slice(0,6)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
