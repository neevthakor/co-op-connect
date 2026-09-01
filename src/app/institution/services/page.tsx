"use client";

import { useState, useEffect } from "react";
import { Plus, ClipboardList } from "lucide-react";

interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  createdAt: string;
}

export default function InstitutionServicesPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", priority: "NORMAL" });

  useEffect(() => {
    fetch("/api/institution/services")
      .then(r => r.ok ? r.json() : [])
      .then(setRequests)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/institution/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      setShowForm(false);
      setFormData({ title: "", description: "", priority: "NORMAL" });
      const data = await fetch("/api/institution/services").then(r => r.json());
      setRequests(data);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Service Requests</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New Request
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium">Submit</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center">
            <ClipboardList className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-gray-500">No service requests</p>
          </div>
        ) : (
          <div className="divide-y">
            {requests.map((req) => (
              <div key={req.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{req.title}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{req.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(req.createdAt).toLocaleDateString("en-IN")}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  req.status === "OPEN" ? "bg-blue-100 text-blue-700" :
                  req.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                  "bg-amber-100 text-amber-700"
                }`}>{req.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
