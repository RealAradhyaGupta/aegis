const express = require('express');
const router = express.Router();
const riskEngine = require('../services/riskEngine');

// GET /api/risk/heatmap - Get all complaint points for the heatmap
router.get('/heatmap', async (req, res) => {
    try {
        const data = await riskEngine.getHeatmapData();
        res.json({ success: true, points: data });
    } catch (err) {
        console.error('Heatmap error:', err);
        res.status(500).json({ error: 'Failed to fetch heatmap data' });
    }
});

// GET /api/risk/score - Get risk score for a specific location
router.get('/score', async (req, res) => {
    try {
        const { lat, lng, radius } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({
                error: 'lat and lng are required'
            });
        }

        const score = await riskEngine.computeZoneRisk(
            parseFloat(lat),
            parseFloat(lng),
            parseInt(radius) || 500
        );

        res.json({
            success: true,
            latitude: parseFloat(lat),
            longitude: parseFloat(lng),
            risk_score: score,
            label: score > 70 ? 'high' : score > 40 ? 'medium' : 'low'
        });

    } catch (err) {
        console.error('Score error:', err);
        res.status(500).json({ error: 'Failed to compute risk score' });
    }
});

module.exports = router;