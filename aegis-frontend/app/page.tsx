"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("./components/MapComponent"), { ssr: false });

type UIState = "idle" | "reporting" | "proof" | "sos";
type Location = { lat: number; lng: number };

export default function Home() {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [incidents, setIncidents] = useState<Location[]>([]);
  const [uiState, setUiState] = useState<UIState>("idle");
  const [proofData, setProofData] = useState<{ hash: string; timestamp: string } | null>(null);
  const [sosTime, setSosTime] = useState(0);

  // Form State
  const [formStep, setFormStep] = useState(1);
  const [reportType, setReportType] = useState("Other");
  const [reportDesc, setReportDesc] = useState("");

  // Routing State
  const [destination, setDestination] = useState("");
  const [isRouting, setIsRouting] = useState(false);
  const [fastRoute, setFastRoute] = useState<[number, number][] | null>(null);
  const [safeRoute, setSafeRoute] = useState<[number, number][] | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.error(err)
      );
    }
  }, []);

  // SOS Timer
  useEffect(() => {
    let interval: any;
    if (uiState === "sos") {
      interval = setInterval(() => setSosTime((t) => t + 1), 1000);
    } else {
      setSosTime(0);
    }
    return () => clearInterval(interval);
  }, [uiState]);

  const handleMapClick = (lat: number, lng: number) => {
    // If we're not routing and not reporting, we might drop a temporary pin or do nothing.
    // For demo purposes, we will just alert unless they're in a specific mode, or we can just 
    // add an incident directly if they want (the old behavior).
    // Let's stick to using the form to add incidents for better UX, but we can also allow direct dropping.
    // To match old behavior but keep it clean: if idle, click adds incident directly.
    if (uiState === "idle") {
      setIncidents((prev) => [...prev, { lat, lng }]);
    }
  };

  // 🔥 Heat Clustering
  const heatZones = incidents.reduce((acc: { lat: number; lng: number; intensity: number }[], point) => {
    // Find if point is close to an existing cluster
    const clusterIndex = acc.findIndex(
      (c) => Math.abs(c.lat - point.lat) < 0.005 && Math.abs(c.lng - point.lng) < 0.005
    );

    if (clusterIndex >= 0) {
      acc[clusterIndex].intensity += 1;
    } else {
      acc.push({ ...point, intensity: 1 });
    }
    return acc;
  }, []);

  // 🔥 Risk Engine
  const riskScore = Math.min(incidents.length * 15, 100);
  let riskLevel = "Safe";
  let riskColor = "text-green-500";
  let riskBg = "bg-green-500/10 border-green-500/50";

  if (riskScore >= 70) {
    riskLevel = "Dangerous";
    riskColor = "text-red-500";
    riskBg = "bg-red-500/10 border-red-500/50";
  } else if (riskScore >= 30) {
    riskLevel = "Moderate";
    riskColor = "text-yellow-500";
    riskBg = "bg-yellow-500/10 border-yellow-500/50";
  }

  // Routing Simulator
  const simulateRoute = () => {
    if (!position || !destination) return;

    // Create a mock destination ~0.02 deg away based on string length to simulate variety
    const destLat = position[0] + 0.02 * (destination.length % 2 === 0 ? 1 : -1);
    const destLng = position[1] + 0.02 * (destination.length % 3 === 0 ? 1 : -1);

    // Fast route: straight line
    setFastRoute([position, [destLat, destLng]]);

    // Safe route: curve around it
    const midPoint: [number, number] = [
      position[0] + (destLat - position[0]) / 2,
      position[1] + (destLng - position[1]) / 2 + 0.015, // offset curve
    ];
    setSafeRoute([position, midPoint, [destLat, destLng]]);
    setIsRouting(true);
  };

  const cancelRoute = () => {
    setFastRoute(null);
    setSafeRoute(null);
    setIsRouting(false);
    setDestination("");
  };

  const submitReport = () => {
    if (position) {
      const timestamp = new Date().toISOString();
      const hash = Math.random().toString(36).substring(2) + Date.now().toString(36);
      setProofData({ hash, timestamp });
      setIncidents((prev) => [...prev, { lat: position[0], lng: position[1] }]);
    }
    setUiState("proof");
    // Reset form
    setFormStep(1);
    setReportType("Other");
    setReportDesc("");
  };

  return (
    <div className="h-screen w-full relative bg-[#0B1C2C] text-slate-100 overflow-hidden font-sans">
      {/* BACKGROUND MAP */}
      {position && (
        <div className={`absolute inset-0 transition-opacity duration-500 ${uiState !== "idle" && uiState !== "reporting" ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
          <MapComponent
            center={position}
            incidents={incidents}
            heatZones={heatZones}
            fastRoute={fastRoute}
            safeRoute={safeRoute}
            onMapClick={handleMapClick}
          />
        </div>
      )}

      {/* TOP BAR: SEARCH & RISK */}
      {uiState === "idle" && (
        <div className="absolute top-0 inset-x-0 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 z-[1000] pointer-events-none">

          {/* Risk Card */}
          <div className={`pointer-events-auto backdrop-blur-md border px-5 py-3 rounded-2xl flex items-center gap-4 shadow-xl ${riskBg}`}>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Area Risk</p>
              <p className={`text-2xl font-bold ${riskColor}`}>{riskScore}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-semibold border ${riskBg} ${riskColor}`}>
              {riskLevel}
            </div>
          </div>

          {/* Routing Panel */}
          <div className="pointer-events-auto bg-[#1A2C3D]/90 backdrop-blur-md border border-slate-700 p-2 rounded-2xl flex items-center shadow-2xl max-w-sm w-full">
            <input
              type="text"
              placeholder="Where are you going?"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="bg-transparent border-none outline-none text-white px-4 py-2 w-full placeholder:text-slate-400"
              onKeyDown={(e) => e.key === "Enter" && simulateRoute()}
            />
            {isRouting ? (
              <button onClick={cancelRoute} className="bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-600 transition-colors">
                Clear
              </button>
            ) : (
              <button onClick={simulateRoute} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-500 transition-colors">
                Go
              </button>
            )}
          </div>
        </div>
      )}

      {/* ROUTING LEGEND */}
      {uiState === "idle" && isRouting && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-[1000] flex gap-4 bg-[#1A2C3D]/90 px-6 py-3 rounded-full border border-slate-700 backdrop-blur-sm shadow-2xl animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-green-500 rounded-full" />
            <span className="text-sm font-medium text-slate-200">Safest</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 border-b-2 border-dashed border-blue-500" />
            <span className="text-sm font-medium text-slate-200">Fastest</span>
          </div>
        </div>
      )}

      {/* REPORT FORM OVERLAY */}
      {uiState === "reporting" && (
        <div className="absolute inset-0 bg-[#0B1C2C]/80 backdrop-blur-sm flex items-center justify-center z-[2000]">
          <div className="bg-[#1A2C3D] border border-slate-700 p-8 rounded-3xl w-[90%] max-w-md shadow-2xl transition-all">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Report Incident</h2>
              <button onClick={() => setUiState("idle")} className="text-slate-400 hover:text-white transition-colors">
                ✕
              </button>
            </div>

            {/* Stepper Indicator */}
            <div className="flex gap-2 mb-8">
              {[1, 2, 3, 4, 5].map(step => (
                <div key={step} className={`h-1.5 flex-1 rounded-full ${step <= formStep ? 'bg-blue-500' : 'bg-slate-700'}`} />
              ))}
            </div>

            {/* Step 1: Type */}
            {formStep === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4">
                <p className="text-slate-300 mb-4 font-medium">What happened?</p>
                <div className="grid grid-cols-2 gap-3">
                  {["Theft", "Harassment", "Accident", "Other"].map(opt => (
                    <button
                      key={opt}
                      onClick={() => setReportType(opt)}
                      className={`p-4 rounded-xl border text-sm font-medium transition-all ${reportType === opt ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Description */}
            {formStep === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4">
                <p className="text-slate-300 mb-4 font-medium">Any details? (Optional)</p>
                <textarea
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  placeholder="Describe the person, vehicle, or event..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-blue-500 min-h-[120px]"
                />
              </div>
            )}

            {/* Step 3: Location */}
            {formStep === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 flex flex-col items-center py-6 text-center">
                <div className="w-16 h-16 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mb-4 border border-blue-500/50">
                  📍
                </div>
                <h3 className="font-semibold text-lg mb-2">Confirm Location</h3>
                <p className="text-slate-400 text-sm">We will use your device's current GPS location for this report.</p>
              </div>
            )}

            {/* Step 4: Photo */}
            {formStep === 4 && (
              <div className="animate-in fade-in slide-in-from-right-4">
                <p className="text-slate-300 mb-4 font-medium">Attach Evidence (Optional)</p>
                <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-800/50 hover:border-slate-500 transition-colors cursor-pointer">
                  <span className="text-2xl mb-2">📷</span>
                  <span className="text-sm">Tap to upload photo</span>
                </div>
              </div>
            )}

            {/* Step 5: Summary */}
            {formStep === 5 && (
              <div className="animate-in fade-in slide-in-from-right-4">
                <h3 className="font-semibold text-lg mb-4">Review Report</h3>
                <div className="bg-slate-800 rounded-xl p-4 space-y-3 text-sm">
                  <div className="flex justify-between border-b border-slate-700 pb-2">
                    <span className="text-slate-400">Type</span>
                    <span className="text-white font-medium">{reportType}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-700 pb-2">
                    <span className="text-slate-400">Location</span>
                    <span className="text-white font-medium">Verified GPS</span>
                  </div>
                  <div className="pt-2">
                    <span className="text-slate-400 block mb-1">Description</span>
                    <span className="text-slate-200 block italic">"{reportDesc || 'No description provided'}"</span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex gap-3">
              {formStep > 1 && (
                <button
                  onClick={() => setFormStep(f => f - 1)}
                  className="px-6 py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-colors"
                >
                  Back
                </button>
              )}

              {formStep < 5 ? (
                <button
                  onClick={() => setFormStep(f => f + 1)}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={submitReport}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-600/20 hover:bg-red-500 transition-colors"
                >
                  Submit Report
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 🔐 FIXED PROFESSIONAL PROOF SCREEN */}
      {uiState === "proof" && proofData && (
        <div className="absolute inset-0 bg-[#0B1C2C] flex items-center justify-center z-[3000]">
          <div className="bg-white text-black rounded-3xl shadow-2xl p-8 w-[90%] max-w-md border-4 border-slate-200">

            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>

            <h1 className="text-2xl font-black text-center mb-6 tracking-tight text-slate-800">
              Evidence Secured
            </h1>

            <div className="space-y-4 text-sm bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div>
                <p className="text-slate-500 font-medium mb-1">Status</p>
                <p className="font-semibold text-green-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Verified & Hashed
                </p>
              </div>

              <div>
                <p className="text-slate-500 font-medium mb-1">Timestamp</p>
                <p className="font-mono text-xs text-slate-700">{proofData.timestamp}</p>
              </div>

              <div>
                <p className="text-slate-500 font-medium mb-1">Cryptographic Hash</p>
                <div className="font-mono text-[10px] break-all bg-slate-200 p-2 rounded block text-slate-600">
                  {proofData.hash}
                </div>
              </div>
            </div>

            <button
              onClick={() => setUiState("idle")}
              className="w-full bg-black text-white py-4 rounded-xl mt-8 font-bold text-lg hover:bg-slate-800 transition-colors"
            >
              Back to Safety Map
            </button>
          </div>
        </div>
      )}

      {/* 🚨 PROFESSIONAL SOS SCREEN */}
      {uiState === "sos" && (
        <div className="absolute inset-0 bg-red-600 flex flex-col items-center justify-center z-[4000] text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-500/50 to-red-900/90 mix-blend-overlay"></div>

          <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center">

            <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center mb-8 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-red-600 font-bold text-xl">
                  SOS
                </div>
              </div>
            </div>

            <h1 className="text-4xl font-black mb-2 tracking-tight uppercase">
              Emergency
            </h1>
            <p className="text-red-200 font-medium mb-8 text-lg uppercase tracking-widest">
              Mode Activated
            </p>

            <div className="space-y-4 mb-12 text-left bg-black/20 p-6 rounded-2xl border border-white/10 backdrop-blur-md w-full">
              <p className="flex items-center gap-3">
                <span className="animate-pulse">📍</span> Live location sharing active
              </p>
              <p className="flex items-center gap-3">
                <span className="animate-pulse">🎙️</span> Ambient audio recording
              </p>
              <p className="flex items-center gap-3">
                <span className="animate-pulse">📸</span> Camera ready for evidence
              </p>
            </div>

            <div className="text-white/60 font-mono text-sm mb-8">
              Active for: {Math.floor(sosTime / 60).toString().padStart(2, '0')}:{(sosTime % 60).toString().padStart(2, '0')}
            </div>

            <button
              onClick={() => setUiState("idle")}
              className="w-full bg-white text-red-700 py-4 rounded-full font-bold text-lg shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:bg-red-50 transition-colors"
            >
              Cancel Emergency
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM ACTIONS */}
      {uiState === "idle" && (
        <div className="absolute bottom-8 inset-x-0 flex justify-between items-end px-6 pointer-events-none z-[1000]">

          <button
            onClick={() => setUiState("reporting")}
            className="pointer-events-auto bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all hover:-translate-y-1"
          >
            Report Incident
          </button>

          <button
            onClick={() => setUiState("sos")}
            className="pointer-events-auto bg-red-600 text-white w-20 h-20 rounded-full font-black text-xl shadow-[0_0_20px_rgba(220,38,38,0.5)] flex items-center justify-center hover:scale-105 transition-all border-4 border-red-500 hover:bg-red-500"
          >
            SOS
          </button>
        </div>
      )}

    </div>
  );
}