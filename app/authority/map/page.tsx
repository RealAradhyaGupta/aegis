"use client";
import { useEffect } from "react";
import Link from "next/link";

const complaints = [
  { id: "RPT-001", type: "Harassment", location: "Andheri, Mumbai", lat: 19.1136, lng: 72.8697, risk: "High" },
  { id: "RPT-002", type: "Poor Lighting", location: "Dharavi, Mumbai", lat: 19.0422, lng: 72.8538, risk: "Medium" },
  { id: "RPT-003", type: "Vandalism", location: "Bandra, Mumbai", lat: 19.0596, lng: 72.8295, risk: "Low" },
  { id: "RPT-004", type: "Suspicious Activity", location: "Connaught Place, Delhi", lat: 28.6315, lng: 77.2167, risk: "High" },
  { id: "RPT-005", type: "Harassment", location: "Lajpat Nagar, Delhi", lat: 28.5700, lng: 77.2433, risk: "High" },
  { id: "RPT-006", type: "Poor Lighting", location: "Rohini, Delhi", lat: 28.7041, lng: 77.1025, risk: "Medium" },
  { id: "RPT-007", type: "Vandalism", location: "Koramangala, Bangalore", lat: 12.9352, lng: 77.6245, risk: "Low" },
  { id: "RPT-008", type: "Suspicious Activity", location: "Whitefield, Bangalore", lat: 12.9698, lng: 77.7500, risk: "High" },
  { id: "RPT-009", type: "Harassment", location: "T. Nagar, Chennai", lat: 13.0418, lng: 80.2341, risk: "High" },
  { id: "RPT-010", type: "Poor Lighting", location: "Velachery, Chennai", lat: 12.9815, lng: 80.2180, risk: "Medium" },
  { id: "RPT-011", type: "Vandalism", location: "Banjara Hills, Hyderabad", lat: 17.4156, lng: 78.4347, risk: "Low" },
  { id: "RPT-012", type: "Suspicious Activity", location: "Secunderabad, Hyderabad", lat: 17.4399, lng: 78.4983, risk: "High" },
];

const riskColor = (risk: string) => {
  if (risk === "High") return "#ef4444";
  if (risk === "Medium") return "#f59e0b";
  return "#22c55e";
};

export default function AuthorityMap() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    import("leaflet").then((L) => {
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      const container = document.getElementById("map") as HTMLElement & { _leaflet_id?: number };
      if (container._leaflet_id) return;

      // Centred on India
      const map = L.map("map").setView([20.5937, 78.9629], 5);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: "© OpenStreetMap © CARTO",
        maxZoom: 19,
      }).addTo(map);

      complaints.forEach((c) => {
        const marker = L.circleMarker([c.lat, c.lng], {
          radius: 10,
          fillColor: riskColor(c.risk),
          color: "#fff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.85,
        }).addTo(map);

        marker.bindPopup(`
          <div style="font-family: sans-serif; min-width: 180px;">
            <strong style="color: #111">${c.id}</strong><br/>
            <span style="color: #555">${c.type}</span><br/>
            <span style="color: #555">${c.location}</span><br/>
            <span style="color: ${riskColor(c.risk)}; font-weight: bold;">${c.risk} Risk</span>
          </div>
        `);
      });
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AEGIS Command Portal</h1>
          <p className="text-gray-400 mt-1 text-sm">Live Incident Map — India</p>
        </div>
        <Link
          href="/authority/dashboard"
          className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Legend */}
      <div className="flex gap-6 mb-4 text-sm">
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> High Risk</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span> Medium Risk</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span> Low Risk</div>
      </div>

      {/* Map */}
      <div id="map" className="w-full h-[600px] rounded-xl overflow-hidden border border-gray-800" />
    </div>
  );
}