const express = require('express');
const router = express.Router();
const { computeRisk } = require('../services/riskEngine');

// GET /risk?north=&south=&east=&west=
router.get('/', async (req, res) => {
    try {
        const { north, south, east, west } = req.query;

        if (!north || !south || !east || !west) {
            return res.status(400).json({
                error: 'Missing required query params: north, south, east, west'
            });
        }

        const n = parseFloat(north);
        const s = parseFloat(south);
        const e = parseFloat(east);
        const w = parseFloat(west);

        if ([n, s, e, w].some(isNaN)) {
            return res.status(400).json({ error: 'All bounding box values must be numbers' });
        }

        if (n <= s) {
            return res.status(400).json({ error: 'north must be greater than south' });
        }

        if (e <= w) {
            return res.status(400).json({ error: 'east must be greater than west' });
        }

        const zones = await computeRisk(n, s, e, w);

        return res.status(200).json({
            zone_count: zones.length,
            zones
        });

    } catch (error) {
        console.error('GET /risk error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;