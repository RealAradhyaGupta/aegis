const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { markVerified } = require('../services/identityService');

const AUTHORITY_KEY = process.env.AUTHORITY_KEY || 'aegis-authority-2024';

// Middleware — every request to /authority must have the correct header
function requireAuthorityKey(req, res, next) {
    const key = req.headers['x-authority-key'];
    if (!key || key !== AUTHORITY_KEY) {
        return res.status(401).json({ error: 'Unauthorized — invalid or missing x-authority-key' });
    }
    next();
}

// Apply the middleware to ALL routes in this file
router.use(requireAuthorityKey);

// GET /authority/complaints — List complaints with optional filters and pagination
router.get('/complaints', async (req, res) => {
    try {
        const { status, type, page = 1, limit = 20 } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const conditions = [];
        const values = [];

        if (status) {
            values.push(status);
            conditions.push(`status = $${values.length}`);
        }

        if (type) {
            values.push(type);
            conditions.push(`type = $${values.length}`);
        }

        const whereClause = conditions.length > 0
            ? 'WHERE ' + conditions.join(' AND ')
            : '';

        values.push(parseInt(limit));
        values.push(offset);

        const result = await db.query(
            `SELECT id, type, description, latitude, longitude,
                    location_name, status, risk_score, created_at, updated_at
             FROM complaints
             ${whereClause}
             ORDER BY created_at DESC
             LIMIT $${values.length - 1} OFFSET $${values.length}`,
            values
        );

        const countResult = await db.query(
            `SELECT COUNT(*) FROM complaints ${whereClause}`,
            conditions.length > 0 ? values.slice(0, -2) : []
        );

        return res.status(200).json({
            total: parseInt(countResult.rows[0].count),
            page: parseInt(page),
            limit: parseInt(limit),
            complaints: result.rows
        });

    } catch (error) {
        console.error('GET /authority/complaints error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /authority/stats — Aggregate dashboard statistics
router.get('/stats', async (req, res) => {
    try {
        const total = await db.query(`SELECT COUNT(*) FROM complaints`);
        const byStatus = await db.query(
            `SELECT status, COUNT(*) as count FROM complaints GROUP BY status`
        );
        const byType = await db.query(
            `SELECT type, COUNT(*) as count FROM complaints GROUP BY type`
        );
        const avgRisk = await db.query(
            `SELECT ROUND(AVG(risk_score), 1) as avg_risk_score FROM complaints`
        );
        const last24h = await db.query(
            `SELECT COUNT(*) FROM complaints WHERE created_at >= NOW() - INTERVAL '24 hours'`
        );

        return res.status(200).json({
            total_complaints: parseInt(total.rows[0].count),
            last_24h: parseInt(last24h.rows[0].count),
            avg_risk_score: parseFloat(avgRisk.rows[0].avg_risk_score) || 0,
            by_status: byStatus.rows,
            by_type: byType.rows
        });

    } catch (error) {
        console.error('GET /authority/stats error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// PATCH /authority/complaints/:id/review — Mark a complaint as under review
router.patch('/complaints/:id/review', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            `UPDATE complaints
             SET status = 'reviewing', updated_at = NOW()
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Complaint not found' });
        }

        return res.status(200).json({
            message: 'Complaint marked as reviewing',
            complaint: result.rows[0]
        });

    } catch (error) {
        console.error('PATCH /authority/complaints/:id/review error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// PATCH /authority/complaints/:id/resolve — Mark a complaint as resolved
// Also rewards the submitter's trust score
router.patch('/complaints/:id/resolve', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            `UPDATE complaints
             SET status = 'resolved', updated_at = NOW(), resolved_at = NOW()
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Complaint not found' });
        }

        const complaint = result.rows[0];

        // Reward the submitter's trust score for a genuine complaint
        if (complaint.device_id) {
            await markVerified(complaint.device_id);
        }

        return res.status(200).json({
            message: 'Complaint resolved and submitter trust score updated',
            complaint
        });

    } catch (error) {
        console.error('PATCH /authority/complaints/:id/resolve error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;