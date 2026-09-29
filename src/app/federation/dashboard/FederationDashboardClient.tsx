"use client";

import { useState } from "react";
import { format } from "date-fns";
import { 
  Building, Users, ShieldAlert, FileText, IndianRupee,
  Activity, CheckCircle, XCircle, Clock, LogOut
} from "lucide-react";
import { signOut } from "next-auth/react";
import { updateWorkerStatus, submitProposal, updateComplaintStatus } from "./actions";

export default function FederationDashboardClient({
  federation,
  welfareSummary,
  workers,
  demand,
  complaints,
  proposals,
  firstCoopId
}: any) {
  const [activeTab, setActiveTab] = useState("roster");

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  const handleWorkerStatus = async (workerId: string, status: string) => {
    try {
      await updateWorkerStatus(workerId, status);
    } catch (e) {
      alert("Failed to update status");
    }
  };

  const handleComplaintStatus = async (complaintId: string, status: string) => {
    try {
      await updateComplaintStatus(complaintId, status, status === 'RESOLVED' ? 'Resolved by Federation Admin' : undefined);
    } catch (e) {
      alert("Failed to update complaint status");
    }
  };

  return (
    <div className="min-h-screen bg-secondary/30 p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
              <Building className="w-8 h-8 text-primary" />
              {federation.name}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Federation Administration Dashboard
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/federation/login" })}
            className="flex items-center gap-2 px-4 py-2 bg-card text-card-foreground shadow-sm rounded-xl hover:bg-secondary transition-colors text-sm font-semibold border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* WELFARE FUND CENTERPIECE */}
        <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-3xl p-8 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
            <IndianRupee className="w-64 h-64" />
          </div>
          
          <div className="relative z-10">
            <h2 className="text-primary-foreground/80 font-bold tracking-wider text-sm uppercase mb-6 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              Welfare Fund Overview
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <p className="text-primary-foreground/70 text-sm font-medium mb-1">Current Balance</p>
                <p className="text-5xl font-black tracking-tight">{formatCurrency(welfareSummary.balance)}</p>
              </div>
              
              <div>
                <p className="text-primary-foreground/70 text-sm font-medium mb-1">Workers Covered</p>
                <p className="text-5xl font-black tracking-tight">{welfareSummary.workersCovered}</p>
              </div>

              <div>
                <p className="text-primary-foreground/70 text-sm font-medium mb-1">Payouts This Month</p>
                <p className="text-5xl font-black tracking-tight">{formatCurrency(welfareSummary.payoutsThisPeriod)}</p>
              </div>
            </div>

            {welfareSummary.transactions.length > 0 && (
              <div className="mt-8 pt-6 border-t border-primary-foreground/20">
                <h3 className="text-sm font-semibold mb-3 text-primary-foreground/90">Recent Transactions</h3>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {welfareSummary.transactions.slice(0, 4).map((t: any) => (
                    <div key={t.id} className="bg-white/10 backdrop-blur-md rounded-xl p-3 min-w-[200px] border border-white/5">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-medium uppercase px-2 py-1 bg-white/20 rounded-md">
                          {t.type.replace('_', ' ')}
                        </span>
                        <span className={`text-sm font-bold ${t.type === 'CONTRIBUTION' ? 'text-green-300' : 'text-red-300'}`}>
                          {t.type === 'CONTRIBUTION' ? '+' : '-'}{formatCurrency(t.amount)}
                        </span>
                      </div>
                      <p className="text-xs text-white/70 truncate" title={t.description}>{t.description || 'No description'}</p>
                      <p className="text-[10px] text-white/50 mt-1">{format(new Date(t.createdAt), 'dd MMM yyyy')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-2 overflow-x-auto border-b border-border pb-px">
          {[
            { id: "roster", label: "Worker Roster", icon: Users },
            { id: "demand", label: "Demand Overview", icon: Activity },
            { id: "disputes", label: "Dispute Oversight", icon: ShieldAlert },
            { id: "governance", label: "Governance", icon: FileText },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id 
                  ? "border-primary text-primary" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENTS */}
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          
          {/* ROSTER TAB */}
          {activeTab === "roster" && (
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">Affiliated Workers</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-secondary/50 text-muted-foreground font-semibold">
                    <tr>
                      <th className="p-3 rounded-tl-lg">Worker Name</th>
                      <th className="p-3">Cooperative</th>
                      <th className="p-3">Primary Trade</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 rounded-tr-lg text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {workers.map((w: any) => (
                      <tr key={w.id} className="hover:bg-secondary/30">
                        <td className="p-3">
                          <div className="font-semibold text-foreground">{w.user.name}</div>
                          <div className="text-xs text-muted-foreground">{w.user.email} • {w.user.phone}</div>
                        </td>
                        <td className="p-3">{w.cooperative?.name || 'Unassigned'}</td>
                        <td className="p-3">
                          <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
                            {w.primaryTrade || 'General'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                            w.verificationStatus === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                            w.verificationStatus === 'SUSPENDED' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {w.verificationStatus}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-2">
                          {w.verificationStatus !== 'VERIFIED' && (
                            <button onClick={() => handleWorkerStatus(w.id, 'VERIFIED')} className="text-green-600 hover:bg-green-50 p-1.5 rounded-lg transition" title="Approve">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {w.verificationStatus !== 'SUSPENDED' && (
                            <button onClick={() => handleWorkerStatus(w.id, 'SUSPENDED')} className="text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition" title="Suspend">
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {workers.length === 0 && (
                      <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No workers found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* DEMAND TAB */}
          {activeTab === "demand" && (
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">Booking Demand by Category</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {demand.map((d: any) => (
                  <div key={d.category} className="p-4 rounded-xl border border-border bg-secondary/20 flex flex-col justify-between">
                    <p className="text-sm font-semibold text-muted-foreground uppercase">{d.category}</p>
                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Total Bookings</p>
                        <p className="text-2xl font-black">{d.count}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Est. Revenue</p>
                        <p className="text-lg font-bold text-primary">{formatCurrency(d.revenue)}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {demand.length === 0 && <p className="text-muted-foreground">No demand data available yet.</p>}
              </div>
            </div>
          )}

          {/* DISPUTES TAB */}
          {activeTab === "disputes" && (
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">Escalated Complaints</h3>
              <div className="space-y-4">
                {complaints.map((c: any) => (
                  <div key={c.id} className="p-4 rounded-xl border border-red-200 bg-red-50/50 flex flex-col md:flex-row gap-4 justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-[10px] font-bold uppercase rounded">{c.category.replace('_', ' ')}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {format(new Date(c.createdAt), 'dd MMM yyyy')}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground mb-2">{c.description}</p>
                      <div className="text-xs text-muted-foreground">
                        Customer: <span className="font-semibold text-foreground">{c.customer.user.name}</span> • 
                        Worker: <span className="font-semibold text-foreground">{c.worker?.user.name || 'Unassigned'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1.5 text-white text-xs font-bold rounded-lg shadow-sm ${
                        c.status === 'RESOLVED' ? 'bg-green-600' :
                        c.status === 'UNDER_REVIEW' ? 'bg-amber-600' :
                        'bg-red-600'
                      }`}>
                        {c.status.replace('_', ' ')}
                      </span>
                      <div className="flex gap-2">
                        {c.status === 'OPEN' && (
                          <button
                            onClick={() => handleComplaintStatus(c.id, 'UNDER_REVIEW')}
                            className="px-3 py-1 text-[10px] font-bold bg-amber-100 text-amber-800 rounded hover:bg-amber-200 transition"
                          >
                            Mark Under Review
                          </button>
                        )}
                        {(c.status === 'OPEN' || c.status === 'UNDER_REVIEW') && (
                          <button
                            onClick={() => handleComplaintStatus(c.id, 'RESOLVED')}
                            className="px-3 py-1 text-[10px] font-bold bg-green-100 text-green-800 rounded hover:bg-green-200 transition"
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {complaints.length === 0 && <p className="text-muted-foreground">No complaints filed.</p>}
              </div>
            </div>
          )}

          {/* GOVERNANCE TAB */}
          {activeTab === "governance" && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1 border-r border-border pr-8">
                <h3 className="text-lg font-bold mb-4">Submit Proposal</h3>
                <form action={submitProposal} className="space-y-4">
                  <input type="hidden" name="cooperativeId" value={firstCoopId} />
                  <div>
                    <label className="block text-xs font-semibold mb-1">Proposal Title</label>
                    <input type="text" name="title" required placeholder="e.g. Review Platform Commission" className="w-full px-3 py-2 border rounded-xl text-sm bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Description</label>
                    <textarea name="description" required rows={4} className="w-full px-3 py-2 border rounded-xl text-sm bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Detail your proposal here..."></textarea>
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-foreground text-background font-bold text-sm rounded-xl hover:bg-foreground/90 transition-colors">
                    Submit Proposal
                  </button>
                </form>
              </div>
              <div className="md:col-span-2">
                <h3 className="text-lg font-bold mb-4">Recent Proposals</h3>
                <div className="space-y-3">
                  {proposals.map((p: any) => (
                    <div key={p.id} className="p-4 rounded-xl border border-border bg-card">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-foreground">{p.title}</h4>
                        <span className="text-[10px] font-bold uppercase px-2 py-1 bg-secondary rounded text-muted-foreground">{p.status}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{p.description}</p>
                      <div className="text-xs text-muted-foreground flex items-center justify-between border-t border-border/50 pt-2">
                        <span>Submitted by: <span className="font-semibold">{p.createdBy.name}</span></span>
                        <span>{format(new Date(p.createdAt), 'dd MMM yyyy')}</span>
                      </div>
                    </div>
                  ))}
                  {proposals.length === 0 && <p className="text-muted-foreground">No proposals exist.</p>}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
