"use client";
import { useState } from "react";

export default function AuthorityLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (password === "aegis-admin") {
      window.location.href = "/authority/dashboard";
    } else {
      setError("Incorrect password. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 w-full max-w-md shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">AEGIS</h1>
          <p className="text-gray-400 mt-2 text-sm">Authority Command Portal</p>
        </div>
        <div className="space-y-4">
          <input
            type="password"
            placeholder="Enter access password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Access Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}