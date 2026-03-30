# AEGIS

## Personal Safety Intelligence Platform

AEGIS is an end-to-end urban safety system that applies cryptographic evidence handling, real-time geospatial risk computation, and privacy-preserving identity management to solve reactive routing and provide secure reporting.

## WHAT IS AEGIS

AEGIS is a civic technology system that treats urban safety as a data infrastructure problem. Existing safety applications are reactive — they surface incident data after harm has occurred, provide no legally credible mechanism for evidence preservation, and offer no predictive capacity to help individuals avoid risk before they encounter it. AEGIS applies cryptographic evidence handling, real-time geospatial risk computation, and privacy-preserving identity management to construct an end-to-end urban safety system. Users can report incidents anonymously with full tamper-proof chain of custody while the platform computes live safety scores across the urban grid and routes users through lower-risk corridors. Governance stakeholders interact through a structured authority dashboard that closes the feedback loop most civic tech systems fail to provide.

## CORE PILLARS

### TRUST AND EVIDENCE INTEGRITY

Users submit safety and harassment complaints anonymously. The platform captures structured metadata, which is passed through a SHA-256 cryptographic hashing function client-side to generate an immutable proof of originality certificate. An emergency intelligence mode automatically locks a contextual evidence buffer representing buffered audio, live location data, and activity records when an SOS signal is activated.

### PREDICTION AND RISK-AWARE NAVIGATION

A dynamic geospatial risk engine computes real-time safety scores from 0 to 100 for granular geographic zones using complaint density, ambient mobility indicators, historical time-of-day weighting, and trend velocity. These safety scores are rendered as live heatmaps and consumed by the routing engine to recommend paths prioritising lower cumulative risk scores. Users receive proactive alerts when their planned or current path exceeds a configurable risk threshold.

### ECOSYSTEM INTEGRATION AND GOVERNANCE

A privacy-preserving identity layer balances anonymity with reporting credibility by assigning each user account a trust score derived from the validated accuracy of their past submissions. An authority dashboard provides governance stakeholders—including municipal agencies and verified institutional partners—with a structured interface to track, validate, and resolve these complaints. As complaints are validated or resolved, users receive updates on status without ever exposing their personal information.

## TECHNICAL ARCHITECTURE

### Frontend
- Framework: Next.js 14 using the App Router
- Map rendering: Mapbox GL JS with custom style for real-time risk heatmap layer
- Client-side SHA-256 hashing via the Web Crypto API before any network transmission
- Responsibilities: real-time heatmap rendering, safety-aware route display and dynamic rerouting, multi-step anonymous reporting flow with consent disclosures, SOS activation interface with automatic evidence buffer lock, trust score visibility and complaint status tracking

### Backend
- Runtime: Node.js with Express, stateless REST API
- Evidence Service: receives hashed evidence payloads, generates proof of originality certificates, writes immutable ledger records
- Risk Engine Service: runs on scheduled cadence to recompute zone-level safety scores, exposes real-time scoring endpoint for live client queries
- Identity Service: manages anonymous user accounts, computes and updates trust scores, enforces submission rate limits
- Authority Service: provides authenticated audit-logged endpoints for governance dashboard consumers to access, validate, and resolve complaints

### Data Layer
- Database: PostgreSQL with PostGIS extension
- Complaint records stored as point geometries with associated metadata
- Risk score computation uses ST_DWithin for proximity aggregation, indexed on spatial and temporal dimensions
- Immutable ledger: append-only PostgreSQL table with row-level security policies preventing modification or deletion
- Four schemas: spatial (complaints, zones, routes), ledger (append-only evidence chain), identity (anonymous trust accounts), authority (governance access layer)

```text
Client (Next.js / Mapbox GL JS)
|-- Web Crypto API (client-side SHA-256)
|-- Heatmap + Route Rendering
|
v
API Gateway (Node.js / Express)
|-- /report    Evidence ingest + ledger write
|-- /risk      Real-time zone score query
|-- /route     Safety-aware navigation compute
|-- /sos       Emergency evidence lock
|-- /authority MFA-gated governance access
|
v
PostgreSQL + PostGIS
|-- schema: spatial   (complaints, zones, routes)
|-- schema: ledger    (append-only evidence chain)
|-- schema: identity  (anonymous trust accounts)
|-- schema: authority (governance access layer)
```

## PATENTABLE INNOVATIONS

1. Cryptographic Evidence Chain Mechanism — the combination of client-side SHA-256 hashing, metadata-bound proof of originality generation, and append-only ledger recording applied to anonymous civic reporting, where the submitting identity is structurally decoupled from the evidence record while legal admissibility is preserved.
2. Real-Time Geospatial Risk Scoring Model — a multi-factor, temporally weighted zone scoring model operating on live complaint density, crowd signal, and trend velocity data, integrated into a navigable geospatial layer.
3. Anonymous Trust Scoring System — a mechanism by which user credibility is computed and applied to report weighting without linking to a persistent or identifiable account, applied to civic safety reporting where spam resistance and user protection are simultaneously required.
4. Safety-Aware Routing Engine — the integration of a live, complaint-derived risk score layer into a pedestrian routing cost function, producing routes optimised for safety rather than distance or time, combined with proactive zone threshold alerting.

## REPOSITORY STRUCTURE

```text
aegis/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── report.js
│   │   │   ├── risk.js
│   │   │   ├── route.js
│   │   │   ├── sos.js
│   │   │   └── authority.js
│   │   ├── services/
│   │   │   ├── evidenceService.js
│   │   │   ├── riskEngine.js
│   │   │   ├── identityService.js
│   │   │   └── routingService.js
│   │   ├── db/
│   │   │   ├── schema.sql
│   │   │   └── connection.js
│   │   └── index.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── page.jsx
│   │   ├── report/page.jsx
│   │   ├── certificate/page.jsx
│   │   └── sos/page.jsx
│   ├── components/
│   │   ├── Map.jsx
│   │   ├── HeatmapLayer.jsx
│   │   ├── RouteOverlay.jsx
│   │   ├── ReportForm.jsx
│   │   ├── Certificate.jsx
│   │   └── SOSButton.jsx
│   ├── .env.local.example
│   └── package.json
├── dashboard/
│   ├── app/
│   │   ├── page.jsx
│   │   ├── home/page.jsx
│   │   └── complaints/page.jsx
│   ├── components/
│   │   ├── StatsBar.jsx
│   │   ├── ComplaintTable.jsx
│   │   └── ComplaintPanel.jsx
│   └── package.json
├── scripts/
│   └── seedData.js
├── docs/
├── .gitignore
└── README.md
```

## GETTING STARTED

You will need Node.js, PostgreSQL, and a Mapbox API key before running any of these.

### Backend
```bash
cd backend
npm install
cp .env.example .env
node src/index.js
```

### Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

### Dashboard
```bash
cd dashboard
npm install
npm run dev
```

## TEAM

| Role | Responsible For |
|---|---|
| Backend & Database | API endpoints, evidence chain, risk engine, database schema |
| Frontend & Map UI | Map interface, heatmap layer, report flow, SOS screen |
| Authority Dashboard & Data | Governance dashboard, seed data, demo data |
| Product & Design | Design system, pitch deck, demo script, QA |

## BUILT FOR

Built for [HACKATHON NAME] — 36 hours.
