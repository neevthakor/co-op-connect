"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, MapPin, CheckCircle2, ClipboardList } from "lucide-react";

export default function OrganizationsClient({ organizations }: { organizations: any[] }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Partner Organizations</h2>
          <p className="text-muted-foreground">Institutions and societies working with your federation.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {organizations.map(org => (
          <Card key={org.id} className="flex flex-col hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg truncate" title={org.name}>{org.name}</CardTitle>
                </div>
                <Badge variant={org.type === "Institution" ? "default" : "secondary"}>
                  {org.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" /> {org.city || "Location unknown"}
              </div>

              <div className="bg-secondary/50 p-3 rounded-lg flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <ClipboardList className="w-4 h-4" /> Service Requests
                </span>
                <span className="font-semibold">{org.requestCount}</span>
              </div>

              {org.assignedCooperatives.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Assigned Cooperatives</span>
                  <div className="flex flex-wrap gap-2">
                    {org.assignedCooperatives.map((c: string) => (
                      <Badge key={c} variant="outline" className="text-xs bg-card">
                        <CheckCircle2 className="w-3 h-3 mr-1 text-green-500" />
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {organizations.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground border rounded-lg border-dashed">
            No partner organizations found for this federation yet.
          </div>
        )}
      </div>
    </div>
  );
}
