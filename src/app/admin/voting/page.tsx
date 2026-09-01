'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Vote, CheckCircle2, XCircle, Plus, Users, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function VotingPage() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const fetchProposals = async () => {
    try {
      const res = await fetch('/api/admin/voting');
      const data = await res.json();
      setProposals(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const handleVote = async (proposalId: string, vote: 'YES' | 'NO' | 'ABSTAIN') => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/voting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'VOTE', proposalId, vote }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Vote failed');

      toast.success(`Your vote (${vote}) has been recorded on the cooperative ledger!`);
      await fetchProposals();
    } catch (err: any) {
      toast.error(err.message || 'Vote failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return toast.error('Title and description required');

    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/voting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_PROPOSAL',
          title: newTitle.trim(),
          description: newDesc.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Proposal creation failed');

      toast.success('Democratic proposal created successfully!');
      setShowModal(false);
      setNewTitle('');
      setNewDesc('');
      await fetchProposals();
    } catch (err: any) {
      toast.error(err.message || 'Creation failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-5xl mx-auto w-full pb-20">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Cooperative Democratic Governance</h1>
            <Badge className="bg-primary/10 text-primary font-bold">1 Member, 1 Vote</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Democratic decision making on cooperative fee policies, welfare expansions, and wage floors.
          </p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-1.5 font-bold">
          <Plus className="h-4 w-4" /> New Proposal
        </Button>
      </div>

      <div className="space-y-4">
        {proposals.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground text-sm">
              No active cooperative proposals right now.
            </CardContent>
          </Card>
        ) : (
          proposals.map((p) => {
            const stats = p.stats || { yesVotes: 0, noVotes: 0, abstainVotes: 0, totalVotes: 0, yesPercent: 50, noPercent: 50 };
            return (
              <Card key={p.id} className="border shadow-xs">
                <CardContent className="p-6 space-y-4 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-base font-bold text-foreground">{p.title}</h3>
                      <p className="text-muted-foreground mt-0.5">
                        Proposed by {p.createdBy?.name || 'Cooperative Member'} • {p.cooperative?.name || 'Ahmedabad Cooperative'}
                      </p>
                    </div>
                    <Badge variant={p.status === 'OPEN' ? 'default' : 'secondary'}>{p.status}</Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">{p.description}</p>

                  {/* Vote Progress Bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs font-semibold text-foreground">
                      <span className="text-green-600">YES: {stats.yesVotes} ({stats.yesPercent}%)</span>
                      <span className="text-destructive">NO: {stats.noVotes} ({stats.noPercent}%)</span>
                    </div>
                    <div className="w-full bg-destructive/20 rounded-full h-3 flex overflow-hidden">
                      <div
                        className="bg-green-600 h-full transition-all duration-300"
                        style={{ width: `${stats.yesPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Vote Buttons */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={p.userVote === 'YES' ? 'default' : 'outline'}
                        className="text-green-600 border-green-600 hover:bg-green-50"
                        onClick={() => handleVote(p.id, 'YES')}
                        disabled={actionLoading}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1.5" /> Vote YES
                      </Button>
                      <Button
                        size="sm"
                        variant={p.userVote === 'NO' ? 'destructive' : 'outline'}
                        className="text-destructive border-destructive hover:bg-destructive/10"
                        onClick={() => handleVote(p.id, 'NO')}
                        disabled={actionLoading}
                      >
                        <XCircle className="h-4 w-4 mr-1.5" /> Vote NO
                      </Button>
                      <Button
                        size="sm"
                        variant={p.userVote === 'ABSTAIN' ? 'secondary' : 'outline'}
                        onClick={() => handleVote(p.id, 'ABSTAIN')}
                        disabled={actionLoading}
                      >
                        Abstain
                      </Button>
                    </div>

                    {p.userVote && (
                      <span className="text-xs font-bold text-primary flex items-center gap-1">
                        <ShieldCheck className="h-4 w-4" /> You voted {p.userVote}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* New Proposal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Vote className="h-5 w-5 text-primary" /> Create Cooperative Proposal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateProposal} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold block mb-1">Proposal Title *</label>
                  <Input
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Increase Worker Monsoon Tool Allowance"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Detailed Description & Justification *</label>
                  <Textarea
                    required
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Explain the proposed policy change and its impact on members..."
                    className="min-h-[100px]"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 font-bold"
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Publishing...' : 'Submit Proposal for Voting'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

