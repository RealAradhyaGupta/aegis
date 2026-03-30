import os

base_dir = "/Users/aradhyagupta/projects/aegis"

files = {
    "backend/src/routes/report.js": """// Handles incoming safety reports
const express = require('express');
const router = express.Router();

// POST a new report
router.post('/', (req, res) => {
    res.json({ message: 'Report created' });
});

module.exports = router;
""",
    "backend/src/routes/risk.js": """// Handles risk zone calculations and retrieval
const express = require('express');
const router = express.Router();

// GET risk data
router.get('/', (req, res) => {
    res.json({ message: 'Risk data' });
});

module.exports = router;
""",
    "backend/src/routes/route.js": """// Handles safe routing calculations
const express = require('express');
const router = express.Router();

// GET safe route
router.get('/', (req, res) => {
    res.json({ message: 'Safe route' });
});

module.exports = router;
""",
    "backend/src/routes/sos.js": """// Handles emergency SOS triggers
const express = require('express');
const router = express.Router();

// POST SOS trigger
router.post('/', (req, res) => {
    res.json({ message: 'SOS triggered' });
});

module.exports = router;
""",
    "backend/src/routes/authority.js": """// Handles communication with authorities
const express = require('express');
const router = express.Router();

// GET authority data
router.get('/', (req, res) => {
    res.json({ message: 'Authority data' });
});

module.exports = router;
""",
    "backend/src/services/evidenceService.js": """// Service for managing and securely storing evidence
class EvidenceService {
    async processEvidence(data) {
        // TODO: Implement evidence processing
        return true;
    }
}
module.exports = new EvidenceService();
""",
    "backend/src/services/riskEngine.js": """// Core engine for calculating safety risks based on data
class RiskEngine {
    calculateRisk(location) {
        // TODO: Implement risk calculation
        return 0;
    }
}
module.exports = new RiskEngine();
""",
    "backend/src/services/identityService.js": """// Service for handling user identity and authentication
class IdentityService {
    verifyUser(token) {
        // TODO: Implement user verification
        return true;
    }
}
module.exports = new IdentityService();
""",
    "backend/src/services/routingService.js": """// Service to calculate the safest paths for users
class RoutingService {
    getSafePath(start, end) {
        // TODO: Implement routing logic
        return [];
    }
}
module.exports = new RoutingService();
""",
    "backend/src/db/schema.sql": """-- Database schema for AEGIS

CREATE TABLE complaints (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    description TEXT NOT NULL,
    location_lat DECIMAL(9,6),
    location_lng DECIMAL(9,6),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE evidence_ledger (
    id SERIAL PRIMARY KEY,
    complaint_id INT REFERENCES complaints(id),
    file_url VARCHAR(255) NOT NULL,
    hash VARCHAR(255) NOT NULL, -- For cryptographic verification
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE risk_zones (
    id SERIAL PRIMARY KEY,
    location_lat DECIMAL(9,6) NOT NULL,
    location_lng DECIMAL(9,6) NOT NULL,
    radius_meters INT NOT NULL,
    risk_level INT NOT NULL, -- 1 to 10
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_trust (
    user_id INT PRIMARY KEY,
    trust_score INT DEFAULT 50, -- 0 to 100
    reports_verified INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
""",
    "backend/src/db/connection.js": """// PostgreSQL database connection pool setup
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};
""",
    "backend/src/index.js": """// Main entry point for the AEGIS backend Express app
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const reportRoutes = require('./routes/report');
const riskRoutes = require('./routes/risk');
const routeRoutes = require('./routes/route');
const sosRoutes = require('./routes/sos');
const authorityRoutes = require('./routes/authority');

const app = express();
app.use(cors());
app.use(express.json());

// Mount routes
app.use('/api/reports', reportRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/authorities', authorityRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
""",
    "backend/.env.example": """# Server port configuration
PORT=3000

# PostgreSQL database connection string
DATABASE_URL=postgres://user:password@localhost:5432/aegis

# Secret key for signing JWTs
JWT_SECRET=your_jwt_secret_here
""",
    "backend/package.json": """{
  "name": "aegis-backend",
  "version": "1.0.0",
  "description": "Backend API for AEGIS Platform",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "node src/index.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "pg": "^8.11.3"
  }
}
""",
    "frontend/app/page.jsx": """// Main landing page for the frontend application
import React from 'react';

export default function HomePage() {
    return (
        <main className="min-h-screen p-8 bg-slate-900 text-white">
            <h1 className="text-4xl font-bold mb-4">AEGIS Platform</h1>
            <p>Welcome to your personal safety intelligence platform.</p>
        </main>
    );
}
""",
    "frontend/app/report/page.jsx": """// Page for users to submit a new safety report or complaint
import React from 'react';
import ReportForm from '../../components/ReportForm';

export default function ReportPage() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">File a Report</h1>
            <ReportForm />
        </div>
    );
}
""",
    "frontend/app/certificate/page.jsx": """// Page displaying the user's secure certificate or trust score
import React from 'react';
import Certificate from '../../components/Certificate';

export default function CertificatePage() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">Your Certificates</h1>
            <Certificate />
        </div>
    );
}
""",
    "frontend/app/sos/page.jsx": """// Emergency SOS page for immediate assistance
import React from 'react';
import SOSButton from '../../components/SOSButton';

export default function SOSPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900">
            <SOSButton />
        </div>
    );
}
""",
    "frontend/components/Map.jsx": """// Component for rendering interactive maps (e.g., Mapbox/Leaflet)
import React from 'react';

export default function Map() {
    return <div className="w-full h-64 bg-slate-800 rounded">Map Placeholder</div>;
}
""",
    "frontend/components/HeatmapLayer.jsx": """// Overlay component for displaying risk zones on the Map
import React from 'react';

export default function HeatmapLayer() {
    return <div>Heatmap Layer Loaded</div>;
}
""",
    "frontend/components/RouteOverlay.jsx": """// Overlay for showing the safest calculated path
import React from 'react';

export default function RouteOverlay() {
    return <div>Route Overlay Loaded</div>;
}
""",
    "frontend/components/ReportForm.jsx": """// Form component for incident reporting
import React from 'react';

export default function ReportForm() {
    return (
        <form className="flex flex-col gap-4">
            <textarea placeholder="Describe the incident..." className="p-2 border rounded" />
            <button type="submit" className="bg-navy-900 text-white p-2 rounded">Submit</button>
        </form>
    );
}
""",
    "frontend/components/Certificate.jsx": """// UI component showing cryptographic proof of a report
import React from 'react';

export default function Certificate() {
    return <div className="border p-4 rounded bg-green-50">Verified Certificate</div>;
}
""",
    "frontend/components/SOSButton.jsx": """// Large, accessible red button for triggering emergency alerts
import React from 'react';

export default function SOSButton() {
    return (
        <button className="bg-red-500 hover:bg-red-600 text-white w-48 h-48 rounded-full text-2xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg">
            SOS
        </button>
    );
}
""",
    "frontend/.env.local.example": """# Next.js frontend environment variables

# URL for the backend API
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Map service token (e.g., Mapbox)
NEXT_PUBLIC_MAP_TOKEN=your_map_token_here
""",
    "frontend/package.json": """{
  "name": "aegis-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tailwindcss": "^3.3.0"
  }
}
""",
    "dashboard/app/page.jsx": """// Main entry for the dashboard application
import React from 'react';

export default function DashboardRoot() {
    return (
        <div className="min-h-screen bg-slate-100 p-8">
            <h1 className="text-4xl text-slate-800 font-bold">Authority Dashboard</h1>
        </div>
    );
}
""",
    "dashboard/app/home/page.jsx": """// Dashboard homepage showing high-level stats and overviews
import React from 'react';
import StatsBar from '../../components/StatsBar';

export default function DashboardHomePage() {
    return (
        <div>
            <h2 className="text-2xl mb-4">Overview</h2>
            <StatsBar />
        </div>
    );
}
""",
    "dashboard/app/complaints/page.jsx": """// Page listing all complaints for authority review
import React from 'react';
import ComplaintTable from '../../components/ComplaintTable';

export default function ComplaintsPage() {
    return (
        <div>
            <h2 className="text-2xl mb-4">Recent Complaints</h2>
            <ComplaintTable />
        </div>
    );
}
""",
    "dashboard/components/StatsBar.jsx": """// Component displaying key metrics (e.g., total active alerts)
import React from 'react';

export default function StatsBar() {
    return (
        <div className="flex gap-4">
            <div className="bg-white p-4 rounded shadow flex-1">Total Alerts: 12</div>
            <div className="bg-white p-4 rounded shadow flex-1">High Risk Areas: 3</div>
        </div>
    );
}
""",
    "dashboard/components/ComplaintTable.jsx": """// Data table for reviewing and managing complaints
import React from 'react';

export default function ComplaintTable() {
    return (
        <table className="w-full bg-white rounded shadow text-left">
            <thead>
                <tr className="border-b"><th className="p-4">ID</th><th className="p-4">Status</th></tr>
            </thead>
            <tbody>
                <tr><td className="p-4">#102</td><td className="p-4 text-red-500">Pending</td></tr>
            </tbody>
        </table>
    );
}
""",
    "dashboard/components/ComplaintPanel.jsx": """// Detail panel showing specific info about a selected complaint
import React from 'react';

export default function ComplaintPanel() {
    return <div className="p-4 bg-slate-50 border rounded">Select a complaint to view details.</div>;
}
""",
    "dashboard/package.json": """{
  "name": "aegis-dashboard",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tailwindcss": "^3.3.0"
  }
}
""",
    "scripts/seedData.js": """// Script to seed the database with initial test data
const pool = require('../backend/src/db/connection');

async function seed() {
    console.log('Seeding database...');
    // TODO: Add actual seed queries here
    console.log('Done!');
    process.exit(0);
}

seed();
""",
    "docs/PITCH_DECK.md": """# AEGIS Pitch Deck Outline

1. **Title Slide**: AEGIS — Personal Safety Intelligence Platform.
2. **The Problem**: Public safety is reactive; people feel unsafe and lack real-time risk awareness.
3. **The Solution**: A proactive, data-driven platform providing safe routes and instant alerts.
4. **How it Works (Pillar 1)**: User App - SOS, reporting, safe routing.
5. **How it Works (Pillar 2)**: AI Risk Engine - Real-time heatmaps and predictive safety.
6. **How it Works (Pillar 3)**: Authority Dashboard - Streamlined incident management.
7. **Market Validation**: Target audience size, growth potential, and current alternatives.
8. **Business Model**: B2B (Gov/Enterprise) Licensing + Freemium B2C.
9. **Competitive Advantage**: Decentralised evidence, predictive AI, seamless UI.
10. **The Team & Ask**: Who we are, what we built, roadmap.
""",
    "docs/DEMO_SCRIPT.md": """# AEGIS 3-Minute Demo Script

**0:00 - 0:30 | Introduction & The Problem**
"Hi, we are team AEGIS. Today, personal safety is too often an afterthought. We're changing that."

**0:30 - 1:30 | The User Frontend (App)**
"Let's look at the mobile experience. Here is our interactive map showing real-time risk zones. Watch what happens when I hit the SOS button..."

**1:30 - 2:00 | The Backend & AI Risk Engine**
"Under the hood, our Node.js and Postgres backend processes this alert immediately, updating the heatmap for all users in the vicinity."

**2:00 - 2:45 | The Authority Dashboard**
"Meanwhile, on the Authority Dashboard, dispatchers see the alert pop up instantly with exact coordinates and user trust scores."

**2:45 - 3:00 | Conclusion**
"AEGIS isn't just an app; it's a proactive intelligence platform. Thank you."
""",
    "docs/DESIGN_SYSTEM.md": """# AEGIS Design System

## Colors
- **Primary**: Navy `#0F172A` (Used for headers, main buttons)
- **Secondary Text**: Slate `#64748B` (Used for body copy, lighter text)
- **Safe**: Green `#22C55E` (Used for safe zones, success states)
- **Danger**: Red `#EF4444` (Used for SOS, high risk zones, errors)
- **Background**: White `#FFFFFF`

## Typography
- **Font Family**: Inter (sans-serif)
- **Headings**: 32px
- **Body**: 16px
- **Labels/Tiny info**: 12px

## Components
- **Buttons**: Rounded corners, bold text, slight shadow.
- **Cards**: White background, faint border, subtle drop shadow.
- **Alerts**: Color-coded borders based on severity (Red/Green).
""",
    ".gitignore": """# OS Junk
.DS_Store
Thumbs.db

# Node
node_modules/
npm-debug.log
yarn-error.log

# Next.js
.next/
out/
build/

# Environment Variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
""",
    "README.md": """# AEGIS
**Personal Safety Intelligence Platform**

AEGIS is a full-stack intelligence platform designed to proactively protect users by providing real-time risk assessment, secure reporting, and instant emergency alerts. It bridges the gap between citizens and authorities through predictive heatmaps and transparent communication.

## The Three Pillars
1. **User Application**: A frontend designed for citizens to view safe routes, report incidents, and trigger SOS alerts.
2. **AI Risk Engine (Backend)**: Processes reports, updates risk zone heatmaps securely, and calculates safest paths.
3. **Authority Dashboard**: A dedicated portal for law enforcement and emergency responders to manage and verify incoming incidents.

## Setup Instructions

### Backend
`npm install`
# Copy .env.example to .env and configure your DB setup
`npm run dev`

### Frontend
`npm install`
`npm run dev`

### Dashboard
`npm install`
`npm run dev`

## Team
- **[Name 1]** - Role
- **[Name 2]** - Role
- **[Name 3]** - Role
- **[Name 4]** - Role
"""
}

for filepath, content in files.items():
    full_path = os.path.join(base_dir, filepath)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w") as f:
        f.write(content)

print("Setup complete")
