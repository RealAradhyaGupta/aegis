const express = require('express');
const router = express.Router();
const { getSafeRoute } = require('../services/routingService');

// GET /route?origin_lat=&origin_lng=&dest_lat=&dest_lng=
router.get('/', async (req, res) => {
    try {
        const { origin_lat, origin_lng, dest_lat, dest_lng } = req.query;

        if (!origin_lat || !origin_lng || !dest_lat || !dest_lng) {
            return res.status(400).json({
                error: 'Missing required query params: origin_lat, origin_lng, dest_lat, dest_lng'
            });
        }

        const oLat = parseFloat(origin_lat);
        const oLng = parseFloat(origin_lng);
        const dLat = parseFloat(dest_lat);
        const dLng = parseFloat(dest_lng);

        if ([oLat, oLng, dLat, dLng].some(isNaN)) {
            return res.status(400).json({ error: 'All coordinates must be numbers' });
        }

        if (oLat < -90 || oLat > 90 || dLat < -90 || dLat > 90) {
            return res.status(400).json({ error: 'Latitudes must be between -90 and 90' });
        }

        if (oLng < -180 || oLng > 180 || dLng < -180 || dLng > 180) {
            return res.status(400).json({ error: 'Longitudes must be between -180 and 180' });
        }

        const routes = await getSafeRoute(oLat, oLng, dLat, dLng);

        return res.status(200).json(routes);

    } catch (error) {
        console.error('GET /route error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;