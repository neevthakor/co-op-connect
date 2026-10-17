"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { updateCooperative } from "./actions";
import { Building2, MapPin, Users, ShieldCheck, AlertCircle, Phone, FileText } from "lucide-react";

export default function CooperativesClient({ cooperatives }: { cooperatives: any[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await updateCooperative(formData);
      if (res.error) {
        alert(res.error);
      } else {
        setEditingId(null);
      }
    } catch (err) {
      alert("Failed to update cooperative");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Cooperatives</h2>
          <p className="text-muted-foreground">Manage cooperatives within your federation.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cooperatives.map(c => (
          <Card key={c.id} className="flex flex-col">
            {editingId === c.id ? (
              <form onSubmit={handleEditSubmit} className="flex flex-col h-full">
                <input type="hidden" name="cooperativeId" value={c.id} />
                <CardHeader className="pb-3">
                  <input name="name" defaultValue={c.name} required className="w-full px-3 py-2 border rounded-md text-sm font-semibold mb-2" />
                  <input name="city" defaultValue={c.city || ""} placeholder="City" className="w-full px-3 py-2 border rounded-md text-sm mb-2" />
                  <input name="registrationNo" defaultValue={c.registrationNo || ""} placeholder="Registration No" className="w-full px-3 py-2 border rounded-md text-sm mb-2" />
                  <input name="emergencyPhone" defaultValue={c.emergencyPhone || ""} placeholder="Emergency Phone" className="w-full px-3 py-2 border rounded-md text-sm mb-2" />
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="isActive" value="true" defaultChecked={c.isActive} />
                    Active Status
                  </label>
                </CardHeader>
                <CardFooter className="mt-auto pt-4 flex gap-2">
                  <Button type="submit" disabled={isSubmitting} size="sm" className="w-full">Save</Button>
                  <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => setEditingId(null)}>Cancel</Button>
                </CardFooter>
              </form>
            ) : (
              <>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-primary" />
                      <CardTitle className="text-lg">{c.name}</CardTitle>
                    </div>
                    <Badge variant={c.isActive ? "default" : "destructive"}>
                      {c.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4 text-sm">
                  <div className="space-y-2 text-muted-foreground">
                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {c.city || "N/A"}</div>
                    <div className="flex items-center gap-2"><FileText className="w-4 h-4" /> {c.registrationNo || "No Reg No"}</div>
                    <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {c.emergencyPhone || "No Emergency Phone"}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                    <div className="bg-secondary/50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1"><Users className="w-3.5 h-3.5" /> Workers</div>
                      <div className="font-semibold text-lg">{c._count.workers}</div>
                    </div>
                    <div className="bg-secondary/50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1"><ShieldCheck className="w-3.5 h-3.5" /> Verified</div>
                      <div className="font-semibold text-lg">{c.verifiedWorkerCount}</div>
                    </div>
                    <div className="bg-secondary/50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1"><AlertCircle className="w-3.5 h-3.5" /> Complaints</div>
                      <div className="font-semibold text-lg">{c.openComplaintsCount}</div>
                    </div>
                    <div className="bg-secondary/50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">Rating</div>
                      <div className="font-semibold text-lg">{c.averageRating > 0 ? c.averageRating.toFixed(1) : "N/A"}</div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-3 border-t">
                  <Button variant="outline" size="sm" className="w-full" onClick={() => setEditingId(c.id)}>
                    Edit Details
                  </Button>
                </CardFooter>
              </>
            )}
          </Card>
        ))}
        {cooperatives.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground border rounded-lg border-dashed">
            No cooperatives found in this federation.
          </div>
        )}
      </div>
    </div>
  );
}
