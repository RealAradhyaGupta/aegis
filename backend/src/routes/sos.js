const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../db/connection');

// POST /sos — Lock an emergency evidence package with SHA-256
router.post('/', async (req, res) => {
    try {
        const {
            description,
            latitude,
            longitude,
            device_id,
            emergency_contacts,
            audio_url,
            photo_url
        } = req.body;

        if (!description || !latitude || !longitude || !device_id) {
            return res.status(400).json({
                error: 'description, latitude, longitude, and device_id are required'
            });
        }

        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        if (isNaN(lat) || isNaN(lng)) {
            return res.status(400).json({ error: 'latitude and longitude must be numbers' });
        }

        // Build the evidence package
        const evidencePackage = {
            description,
            latitude: lat,
            longitude: lng,
            device_id,
            emergency_contacts: emergency_contacts || [],
            audio_url: audio_url || null,
            photo_url: photo_url || null,
            locked_at: new Date().toISOString()
        };

        // Sort keys and SHA-256 hash the entire package
        const sorted = Object.keys(evidencePackage)
            .sort()
            .reduce((obj, key) => { obj[key] = evidencePackage[key]; return obj; }, {});

        const hash = crypto
            .createHash('sha256')
            .update(JSON.stringify(sorted))
            .digest('hex');

        const certificate = {
            hash,
            locked_at: evidencePackage.locked_at,
            issuer: 'AEGIS SOS Lockbox v1'
        };

        // Write complaint + ledger in a transaction
        const client = await db.getClient();

        try {
            await client.query('BEGIN');

            const complaintResult = await client.query(
                `INSERT INTO complaints
                    (type, description, latitude, longitude, device_id, status, risk_score)
                 VALUES ('harassment', $1, $2, $3, $4, 'pending', 100)
                 RETURNING *`,
                [description, lat, lng, device_id]
            );

            const complaint = complaintResult.rows[0];

            await client.query(
                `INSERT INTO evidence_ledger
                    (complaint_id, sha256_hash, metadata_json, certificate)
                 VALUES ($1, $2, $3, $4)`,
                [
                    complaint.id,
                    hash,
                    JSON.stringify(evidencePackage),
                    JSON.stringify(certificate)
                ]
            );

            await client.query('COMMIT');

            return res.status(201).json({
                message: 'SOS evidence package locked successfully',
                complaint_id: complaint.id,
                certificate
            });

        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('POST /sos error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
