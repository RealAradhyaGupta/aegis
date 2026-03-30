"use client";
import { useState, useEffect } from "react";
import { X, ShieldCheck } from "lucide-react";
import Link from "next/link";

type Complaint = {
  id: string;
  type: string;
  location: string;
  time: string;
  risk: string;
  status: string;
  hash: string;
  description: string;
};

export default function AuthorityDashboard() {
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/complaints')
      .then((res) => res.json())
      .then((data) => {
        setComplaints(data.complaints || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleResolve = async (id: string) => {
    await fetch(`/api/complaints/${id}/resolve`, { method: 'PATCH' });
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "Resolved" } : c))
    );
    setSelected((prev) => (prev ? { ...prev, status: "Resolved" } : null));
  };

  const stats = [
    { label: "Total Reports This Week", value: complaints.length.toString(), color: "text-blue-400" },
    { label: "Resolved Reports", value: complaints.filter((c) => c.status === "Resolved").length.toString(), color: "text-green-400" },
    { label: "High Risk Zones", value: complaints.filter((c) => c.risk === "High").length.toString(), color: "text-red-400" },
    { label: "Avg Response Time", value: "2.4 hrs", color: "text-yellow-400" },
  ];

  const riskColor = (risk: string) => {
    if (risk === "High") return "bg-red-900 text-red-300";
    if (risk === "Medium") return "bg-yellow-900 text-yellow-300";
    return "bg-green-900 text-green-300";
  };

  const statusColor = (status: string) => {
    if (status === "Pending") return "bg-orange-900 text-orange-300";
    if (status === "Under Review") return "bg-blue-900 text-blue-300";
    return "bg-green-900 text-green-300";
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AEGIS Command Portal</h1>
          <p className="text-gray-400 mt-1 text-sm">Authority Dashboard — India Overview</p>
        </div>
        <Link
          href="/authority/map"
          className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          🗺 View Live Map
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
            <p className={`text-4xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center text-gray-400 py-20">Loading complaints from database...</div>
      )}

      {/* Table + Side Panel */}
      {!loading && (
        <div className="flex gap-6">
          {/* Complaints Table */}
          <div className={`bg-gray-900 border border-gray-800 rounded-xl overflow-hidden transition-all duration-300 ${selected ? "w-3/5" : "w-full"}`}>
            <div className="px-6 py-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold">Incident Reports <span className="text-gray-400 text-sm font-normal">({complaints.length} total)</span></h2>
            </div>
            <div className="overflow-y-auto max-h-[600px]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-900">
                  <tr className="text-gray-400 border-b border-gray-800">
                    <th className="text-left px-6 py-3">ID</th>
                    <th className="text-left px-6 py-3">Type</th>
                    <th className="text-left px-6 py-3">Location</th>
                    <th className="text-left px-6 py-3">Risk</th>
                    <th className="text-left px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => setSelected(c)}
                      className={`border-b border-gray-800 hover:bg-gray-800 cursor-pointer transition-colors ${selected?.id === c.id ? "bg-gray-800" : ""}`}
                    >
                      <td className="px-6 py-4 text-gray-400 font-mono">{c.id}</td>
                      <td className="px-6 py-4">{c.type}</td>
                      <td className="px-6 py-4 text-gray-300">{c.location}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${riskColor(c.risk)}`}>
                          {c.risk}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor(c.status)}`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Side Panel */}
          {selected && (
            <div className="w-2/5 bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold">{selected.type}</h3>
                  <p className="text-gray-400 text-sm">{selected.id}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Location</p>
                  <p>{selected.location}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Reported At</p>
                  <p>{selected.time}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Risk Level</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${riskColor(selected.risk)}`}>
                    {selected.risk}
                  </span>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor(selected.status)}`}>
                    {selected.status}
                  </span>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Description</p>
                  <p className="text-gray-300 leading-relaxed">{selected.description}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">SHA-256 Evidence Hash</p>
                  <p className="font-mono text-xs text-green-400 break-all bg-gray-800 p-3 rounded-lg">{selected.hash}</p>
                </div>
              </div>

              {selected.status !== "Resolved" && (
                <button
                  onClick={() => handleResolve(selected.id)}
                  className="w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  <ShieldCheck size={18} />
                  Mark as Resolved
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}