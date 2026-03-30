const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const evidenceService = require('../services/evidenceService');

// POST /api/reports - Submit a new safety report
router.post('/', async (req, res) => {
    try {
        const {
            type,
            description,
            latitude,
            longitude,
            location,
            risk_level
        } = req.body;

        // Generate a unique report ID
        const reportId = 'RPT-' + Date.now();

        // Hash the report data for evidence integrity
        const hash = evidenceService.generateHash({
            reportId,
            type,
            description,
            latitude,
            longitude,
            timestamp: new Date().toISOString()
        });

        // Generate proof of originality certificate
        const certificateId = evidenceService.generateCertificateId();

        // Save complaint to database
        const result = await db.query(
            `INSERT INTO complaints 
                (report_id, type, description, latitude, longitude,
                 geom, location, risk_level, evidence_hash, 
                 certificate_id, reported_at)
             VALUES ($1, $2, $3, $4, $5,
                 ST_SetSRID(ST_MakePoint($5, $4), 4326),
                 $6, $7, $8, $9, NOW())
             RETURNING *`,
            [reportId, type, description, latitude, longitude,
                location, risk_level, hash, certificateId]
        );

        const complaint = result.rows[0];

        // Save to evidence ledger
        await evidenceService.saveToLedger(
            complaint.id,
            hash,
            certificateId,
            { reportId, type, latitude, longitude }
        );

        res.status(201).json({
            success: true,
            report_id: reportId,
            certificate_id: certificateId,
            evidence_hash: hash,
            message: 'Report submitted and evidence chain created'
        });

    } catch (err) {
        console.error('Report error:', err);
        res.status(500).json({ error: 'Failed to submit report' });
    }
});

// GET /api/reports - Get all reports
router.get('/', async (req, res) => {
    try {
        const result = await db.query(
            `SELECT * FROM complaints ORDER BY created_at DESC LIMIT 100`
        );
        res.json({ success: true, reports: result.rows });
    } catch (err) {
        console.error('Fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
});

module.exports = router;