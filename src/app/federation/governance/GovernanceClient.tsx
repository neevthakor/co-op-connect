"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileSignature, ThumbsUp, ThumbsDown, Minus } from "lucide-react";
import { createProposal, castVote } from "./actions";

export default function GovernanceClient({ proposals, cooperatives }: { proposals: any[], cooperatives: any[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleProposalSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await createProposal(formData);
      if (res.error) {
        alert(res.error);
      } else {
        (e.target as HTMLFormElement).reset();
      }
    } catch (err) {
      alert("Failed to submit proposal");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVote(proposalId: string, vote: string) {
    const formData = new FormData();
    formData.append("proposalId", proposalId);
    formData.append("vote", vote);
    try {
      const res = await castVote(formData);
      if (res.error) alert(res.error);
    } catch (err) {
      alert("Failed to cast vote");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Federation Governance</h2>
          <p className="text-muted-foreground">Manage and vote on proposals for federation cooperatives.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Submit Proposal</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProposalSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold mb-1 block">Target Cooperative</label>
                  <select name="cooperativeId" required className="w-full px-3 py-2 border rounded-md text-sm bg-background">
                    <option value="">-- Select Cooperative --</option>
                    {cooperatives.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block">Proposal Title</label>
                  <input type="text" name="title" required placeholder="e.g. Subsidy for Safety Gear" className="w-full px-3 py-2 border rounded-md text-sm bg-background" />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block">Description</label>
                  <textarea name="description" required rows={4} className="w-full px-3 py-2 border rounded-md text-sm bg-background" placeholder="Details..."></textarea>
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Submitting..." : "Submit Proposal"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-4">
          {proposals.map(p => (
            <Card key={p.id} className="flex flex-col">
              <CardHeader className="pb-3 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1 text-muted-foreground">
                      <FileSignature className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase">{p.cooperative?.name}</span>
                    </div>
                    <CardTitle className="text-lg">{p.title}</CardTitle>
                  </div>
                  <Badge variant={p.status === "OPEN" ? "default" : "secondary"}>
                    {p.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 text-sm">
                <p className="text-muted-foreground">{p.description}</p>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Proposed by: {p.createdBy.name}</span>
                  <span>{format(new Date(p.createdAt), 'dd MMM yyyy')}</span>
                </div>
              </CardContent>
              <CardFooter className="pt-3 border-t bg-secondary/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex gap-4 text-sm font-semibold">
                  <div className="flex items-center gap-1 text-green-600"><ThumbsUp className="w-4 h-4"/> {p.tally.yes}</div>
                  <div className="flex items-center gap-1 text-red-600"><ThumbsDown className="w-4 h-4"/> {p.tally.no}</div>
                  <div className="flex items-center gap-1 text-slate-500"><Minus className="w-4 h-4"/> {p.tally.abstain}</div>
                </div>
                
                {p.status === "OPEN" && (
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button 
                      size="sm" 
                      variant={p.userVote === "YES" ? "default" : "outline"} 
                      className={p.userVote === "YES" ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                      onClick={() => handleVote(p.id, "YES")}
                    >
                      <ThumbsUp className="w-3.5 h-3.5 mr-1"/> Yes
                    </Button>
                    <Button 
                      size="sm" 
                      variant={p.userVote === "NO" ? "destructive" : "outline"}
                      onClick={() => handleVote(p.id, "NO")}
                    >
                      <ThumbsDown className="w-3.5 h-3.5 mr-1"/> No
                    </Button>
                    <Button 
                      size="sm" 
                      variant={p.userVote === "ABSTAIN" ? "secondary" : "outline"}
                      onClick={() => handleVote(p.id, "ABSTAIN")}
                    >
                      <Minus className="w-3.5 h-3.5 mr-1"/> Abstain
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
          {proposals.length === 0 && (
            <div className="py-12 text-center text-muted-foreground border rounded-lg border-dashed">
              No governance proposals found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
