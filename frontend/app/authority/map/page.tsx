"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";

type Complaint = {
  id: string;
  type: string;
  location: string;
  latitude: number;
  longitude: number;
  risk: string;
  status: string;
  time: string;
};

const riskColor = (risk: string) => {
  if (risk === "High") return "#ef4444";
  if (risk === "Medium") return "#f59e0b";
  return "#22c55e";
};

export default function AuthorityMap() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    fetch('/api/map-complaints')
      .then((res) => res.json())
      .then((data) => {
        setComplaints(data.complaints || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading || complaints.length === 0) return;
    if (typeof window === "undefined") return;

    // Destroy any existing map instance before creating a new one
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    import("leaflet").then((L) => {
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      const map = L.map("map").setView([20.5937, 78.9629], 5);
      mapRef.current = map;

      // Light OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      complaints.forEach((c) => {
        const marker = L.circleMarker([Number(c.latitude), Number(c.longitude)], {
          radius: 8,
          fillColor: riskColor(c.risk),
          color: "#fff",
          weight: 1.5,
          opacity: 1,
          fillOpacity: 0.8,
        }).addTo(map);

        marker.bindPopup(`
          <div style="font-family: sans-serif; min-width: 180px;">
            <strong style="color: #111">${c.id}</strong><br/>
            <span style="color: #555">${c.type}</span><br/>
            <span style="color: #555">${c.location}</span><br/>
            <span style="color: #555">${c.time}</span><br/>
            <span style="color: ${riskColor(c.risk)}; font-weight: bold;">${c.risk} Risk</span>
          </div>
        `);
      });
    });
  }, [loading, complaints]);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AEGIS Command Portal</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Live Incident Map — India
            {!loading && <span className="ml-2 text-blue-400">({complaints.length} incidents loaded)</span>}
          </p>
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

      {/* Loading */}
      {loading && (
        <div className="w-full h-[600px] rounded-xl border border-gray-800 flex items-center justify-center text-gray-400">
          Loading map data from database...
        </div>
      )}

      {/* Map */}
      {!loading && (
        <div id="map" className="w-full h-[600px] rounded-xl overflow-hidden border border-gray-800" />
      )}
    </div>
  );
}