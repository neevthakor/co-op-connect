import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Clock, AlertTriangle } from "lucide-react";
import { findWorkersForOrganizationRequest, assignWorkerToOrganizationRequest } from "@/services/organization";
import { revalidatePath } from "next/cache";

export default async function CooperativeRequestMatchPage({ 
  params 
}: { 
  params: { type: string, id: string } 
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "COOPERATIVE_ADMIN") {
    redirect("/login");
  }

  const admin = await prisma.cooperativeAdmin.findUnique({
    where: { userId: session.user.id },
  });

  if (!admin) redirect("/login");

  const type = params.type.toUpperCase() as "SOCIETY" | "INSTITUTION";
  const requestId = params.id;

  let request: any;

  if (type === "SOCIETY") {
    request = await prisma.societyServiceRequest.findUnique({
      where: { id: requestId, cooperativeId: admin.cooperativeId },
      include: {
        society: true,
        location: true,
        category: true,
        bookings: {
          include: { worker: { include: { user: true } } }
        }
      }
    });
  } else {
    request = await prisma.institutionServiceRequest.findUnique({
      where: { id: requestId, cooperativeId: admin.cooperativeId },
      include: {
        institution: true,
        location: true,
        category: true,
        bookings: {
          include: { worker: { include: { user: true } } }
        }
      }
    });
  }

  if (!request) {
    return <div className="p-8 text-center text-red-500">Request not found or access denied.</div>;
  }

  const orgName = type === "SOCIETY" ? request.society.name : request.institution.name;
  
  // Find workers if still open
  let matches: any[] = [];
  let error = "";
  if (request.status === "OPEN") {
    try {
      matches = await findWorkersForOrganizationRequest(requestId, type, request.priority as 'NORMAL' | 'URGENT' | 'EMERGENCY');
      // Filter for this cooperative only
      matches = matches.filter(m => m.worker.cooperativeId === admin.cooperativeId);
    } catch (e: any) {
      error = e.message;
    }
  }

  async function handleAssign(formData: FormData) {
    "use server";
    const workerId = formData.get("workerId") as string;
    if (!workerId) return;

    try {
      const formSession = await auth();
      if (!formSession?.user) throw new Error("Unauthorized");

      await assignWorkerToOrganizationRequest({
        requestId,
        type,
        workerId,
        assignedByUserId: formSession.user.id as string,
      });
      revalidatePath(`/cooperative/requests/${type.toLowerCase()}/${requestId}`);
    } catch (e: any) {
      console.error(e);
      // Handle error gracefully in real app
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Request #{request.id.slice(-6)}</h2>
          <p className="text-muted-foreground">From {orgName}</p>
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
              <p className="text-sm font-medium text-muted-foreground">Title</p>
              <p>{request.title}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Category</p>
              <p>{request.category?.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p className="text-sm">{request.description}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Location</p>
              <p className="flex items-center gap-1 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                {request.location?.name || request.area}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {request.status === "OPEN" && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Available Workers from your Cooperative</h3>
          {error && <div className="p-4 bg-red-500/10 text-red-500 rounded-lg">{error}</div>}
          
          <div className="grid gap-4 md:grid-cols-2">
            {matches.map((match, i) => (
              <Card key={match.worker.id} className={i === 0 ? "border-amber-500 shadow-md" : ""}>
                <CardContent className="p-4 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold">{match.worker.user.name}</div>
                    <Badge variant="outline">Score: {match.match_score}</Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm mb-4 flex-1">
                    <p className="text-muted-foreground">{match.worker.primaryTrade}</p>
                    <p className="text-xs">{match.explanation}</p>
                  </div>
                  
                  <form action={handleAssign} className="w-full mt-auto">
                    <input type="hidden" name="workerId" value={match.worker.id} />
                    <Button type="submit" className="w-full" variant={i === 0 ? "default" : "secondary"}>
                      Assign this worker
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ))}
            {matches.length === 0 && !error && (
              <div className="col-span-full p-8 text-center border rounded-lg border-dashed">
                <AlertTriangle className="w-8 h-8 mx-auto text-amber-500 mb-2" />
                <p className="font-medium">No eligible workers found</p>
                <p className="text-sm text-muted-foreground">Try adjusting workers' availability or wait for more workers to join.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {request.status !== "OPEN" && request.bookings?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Assigned Worker</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                {request.bookings[0].worker.user.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold">{request.bookings[0].worker.user.name}</p>
                <p className="text-sm text-muted-foreground">Booking Status: {request.bookings[0].status}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
