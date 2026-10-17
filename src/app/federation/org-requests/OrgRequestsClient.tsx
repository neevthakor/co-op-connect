"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Building2, School } from "lucide-react";
import { assignRequestToCooperative } from "./actions";

export default function OrgRequestsClient({ requests, cooperatives }: { requests: any[], cooperatives: any[] }) {
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleAssignSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await assignRequestToCooperative(formData);
      if (res.error) {
        alert(res.error);
      } else {
        setAssigningId(null);
      }
    } catch (err) {
      alert("Failed to assign request");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Organization Requests</h2>
          <p className="text-muted-foreground">OPEN requests that can be claimed by your federation.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {requests.map(req => (
          <Card key={req.id} className="flex flex-col hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <Badge variant="outline" className="mb-2 w-fit">{req.category?.name || 'General'}</Badge>
                  <CardTitle className="text-lg">{req.title}</CardTitle>
                </div>
                <Badge variant="destructive">{req.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4 text-sm">
              <p className="text-muted-foreground">{req.description}</p>
              
              <div className="space-y-2 text-slate-500 bg-secondary/50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  {req.type === "SOCIETY" ? <Building2 className="w-4 h-4" /> : <School className="w-4 h-4" />}
                  <span className="font-semibold text-foreground">{req.orgName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> {req.orgAddress || "No location provided"}
                </div>
              </div>

              {req.cooperativeId ? (
                <div className="text-sm font-semibold text-primary">
                  Currently assigned to: {req.cooperative?.name}
                </div>
              ) : null}

              {assigningId === req.id ? (
                <form onSubmit={handleAssignSubmit} className="space-y-3 pt-4 border-t">
                  <input type="hidden" name="requestId" value={req.id} />
                  <input type="hidden" name="type" value={req.type} />
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Select Cooperative</label>
                    <select name="cooperativeId" required className="w-full px-3 py-2 border rounded-md text-sm bg-background">
                      <option value="">-- Select Cooperative --</option>
                      {cooperatives.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isSubmitting} size="sm" className="w-full">Confirm</Button>
                    <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => setAssigningId(null)}>Cancel</Button>
                  </div>
                </form>
              ) : null}
            </CardContent>

            {!assigningId && (
              <CardFooter className="pt-3 border-t">
                <Button 
                  className="w-full" 
                  size="sm" 
                  variant={req.cooperativeId ? "secondary" : "default"}
                  onClick={() => setAssigningId(req.id)}
                >
                  {req.cooperativeId ? "Reassign to Cooperative" : "Assign to Cooperative"}
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}

        {requests.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground border rounded-lg border-dashed">
            No OPEN organization requests available.
          </div>
        )}
      </div>
    </div>
  );
}
