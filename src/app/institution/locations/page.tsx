import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddLocationDialog } from "@/components/organization/AddLocationDialog";
import { MapPin, Plus } from "lucide-react";
import { getOrganizationLocations } from "@/services/organization";

export const metadata = {
  title: "Institution Locations - Co-opConnect",
};

export default async function InstitutionLocationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const institutionId = (session.user as any).institutionId;
  if (!institutionId) redirect("/login");

  const locations = await getOrganizationLocations(institutionId, "INSTITUTION");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Institution Locations</h2>
          <p className="text-muted-foreground">Manage service areas within your institution.</p>
        </div>
        <AddLocationDialog type="INSTITUTION" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {locations.map((loc) => (
          <Card key={loc.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-500" />
                {loc.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              {loc.address && <p className="text-muted-foreground">{loc.address}</p>}
              <div className="pt-2 flex gap-2">
                <Button variant="outline" size="sm" className="w-full">Edit</Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {locations.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground border rounded-lg border-dashed">
            No locations added yet. Create locations like "Science Block", "Main Gate", etc.
          </div>
        )}
      </div>
    </div>
  );
}
