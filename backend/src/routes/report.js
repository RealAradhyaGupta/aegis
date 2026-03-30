const express = require('express');
const router = express.Router();
const { submitComplaint, getCertificate } = require('../services/evidenceService');
const { incrementReport } = require('../services/identityService');

// Valid complaint types — anything else gets rejected
const VALID_TYPES = ['harassment', 'suspicious_activity', 'vandalism', 'poor_lighting'];

// POST /report — Submit a new anonymous complaint
router.post('/', async (req, res) => {
    try {
        const { type, description, latitude, longitude, location_name, device_id } = req.body;

        // --- Validation ---
        if (!type || !VALID_TYPES.includes(type)) {
            return res.status(400).json({
                error: 'Invalid type. Must be one of: harassment, suspicious_activity, vandalism, poor_lighting'
            });
        }

        if (!description || description.trim().length < 10) {
            return res.status(400).json({
                error: 'Description must be at least 10 characters'
            });
        }

        if (latitude === undefined || longitude === undefined) {
            return res.status(400).json({ error: 'latitude and longitude are required' });
        }

        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        if (isNaN(lat) || lat < -90 || lat > 90) {
            return res.status(400).json({ error: 'latitude must be a number between -90 and 90' });
        }

        if (isNaN(lng) || lng < -180 || lng > 180) {
            return res.status(400).json({ error: 'longitude must be a number between -180 and 180' });
        }

        if (!device_id || device_id.trim().length === 0) {
            return res.status(400).json({ error: 'device_id is required' });
        }

        // --- Submit the complaint and write to evidence ledger ---
        const result = await submitComplaint({
            type,
            description: description.trim(),
            latitude: lat,
            longitude: lng,
            location_name: location_name || null,
            device_id: device_id.trim()
        });

        // --- Update the submitter's trust record ---
        await incrementReport(device_id.trim());

        return res.status(201).json({
            message: 'Complaint submitted successfully',
            complaint_id: result.complaint_id,
            certificate: result.certificate
        });

    } catch (error) {
        console.error('POST /report error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /report/certificate/:id — Retrieve the proof-of-originality certificate
router.get('/certificate/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const certificate = await getCertificate(id);

        if (!certificate) {
            return res.status(404).json({ error: 'Certificate not found for this complaint ID' });
        }

        return res.status(200).json(certificate);

    } catch (error) {
        console.error('GET /report/certificate error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;