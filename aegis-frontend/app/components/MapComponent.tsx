"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Circle, Polyline, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default Leaflet icon paths in Next.js
const customIcon = typeof window !== "undefined" ? new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
}) : null;

interface HeatZone {
  lat: number;
  lng: number;
  intensity: number;
}

interface MapProps {
  center: [number, number];
  incidents: { lat: number; lng: number }[];
  heatZones: HeatZone[];
  fastRoute: [number, number][] | null;
  safeRoute: [number, number][] | null;
  onMapClick: (lat: number, lng: number) => void;
}

const MapClickHandler = ({ onClick }: { onClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export default function MapComponent({
  center,
  incidents,
  heatZones,
  fastRoute,
  safeRoute,
  onMapClick
}: MapProps) {
  // To avoid any hydration mismatch, we strictly render mapping when mounted
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-full w-full bg-[#0B1C2C] flex items-center justify-center text-white">Loading map...</div>;

  return (
    <MapContainer center={center} zoom={15} className="h-full w-full bg-[#0B1C2C]">
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      <MapClickHandler onClick={onMapClick} />
      
      {customIcon && <Marker position={center} icon={customIcon} />}

      {incidents.map((inc, i) => (
        customIcon && <Marker key={i} position={[inc.lat, inc.lng]} icon={customIcon} zIndexOffset={100} />
      ))}

      {heatZones.map((zone, i) => (
        <Circle
          key={i}
          center={[zone.lat, zone.lng]}
          radius={200 + zone.intensity * 60}
          pathOptions={{
            color: "#ef4444", // red-500
            fillColor: "#ef4444",
            fillOpacity: Math.min(0.2 + zone.intensity * 0.1, 0.7),
            weight: 0,
          }}
        />
      ))}

      {/* Rendering Routes */}
      {fastRoute && (
        <Polyline positions={fastRoute} pathOptions={{ color: "#3b82f6", weight: 4, dashArray: "10, 10" }} /> // Blue, dashed
      )}
      
      {safeRoute && (
        <Polyline positions={safeRoute} pathOptions={{ color: "#22c55e", weight: 6 }} /> // Green, solid
      )}

    </MapContainer>
  );
}
