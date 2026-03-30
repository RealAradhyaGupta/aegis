const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const reportRoutes = require('./routes/report');
const riskRoutes = require('./routes/risk');
const routeRoutes = require('./routes/route');
const sosRoutes = require('./routes/sos');
const authorityRoutes = require('./routes/authority');
const { getTrustScore } = require('./services/identityService');

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---

// Allow requests from frontend (port 3000) and dashboard (port 3002)
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3002'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'x-authority-key']
}));

// Parse incoming JSON request bodies
app.use(express.json());

// --- Health Check ---
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        project: 'AEGIS',
        timestamp: new Date().toISOString()
    });
});

// --- Routes ---
app.use('/report', reportRoutes);
app.use('/risk', riskRoutes);
app.use('/route', routeRoutes);
app.use('/sos', sosRoutes);
app.use('/authority', authorityRoutes);

// --- Trust Score Endpoint ---
app.get('/trust/:device_id', async (req, res) => {
    try {
        const { device_id } = req.params;

        if (!device_id || device_id.trim().length === 0) {
            return res.status(400).json({ error: 'device_id is required' });
        }

        const score = await getTrustScore(device_id.trim());

        if (score === null) {
            return res.status(404).json({ error: 'No trust record found for this device' });
        }

        return res.status(200).json({
            device_id: device_id.trim(),
            trust_score: score
        });

    } catch (error) {
        console.error('GET /trust/:device_id error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// --- Global Error Handler ---
// Catches any error that wasn't handled inside a route
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Something went wrong — please try again' });
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
