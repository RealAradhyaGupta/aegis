const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// GET /api/authorities/complaints - Fetch all complaints for dashboard
router.get('/complaints', async (req, res) => {
    try {
        const { status, limit = 50, offset = 0 } = req.query;

        let query = `
            SELECT 
                c.*,
                e.hash as evidence_hash,
                e.certificate_id,
                e.created_at as evidence_created_at
            FROM complaints c
            LEFT JOIN evidence_ledger e ON e.complaint_id = c.id
        `;

        const params = [];
        if (status) {
            params.push(status);
            query += ` WHERE c.status = $${params.length}`;
        }

        query += ` ORDER BY c.created_at DESC 
                   LIMIT $${params.length + 1} 
                   OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await db.query(query, params);
        res.json({ success: true, complaints: result.rows });

    } catch (err) {
        console.error('Authority fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch complaints' });
    }
});

// PATCH /api/authorities/complaints/:id/resolve - Resolve a complaint
router.patch('/complaints/:id/resolve', async (req, res) => {
    try {
        const { id } = req.params;
        const { resolution_note } = req.body;

        const result = await db.query(
            `UPDATE complaints 
             SET status = 'resolved'
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Complaint not found' });
        }

        res.json({
            success: true,
            message: 'Complaint resolved',
            complaint: result.rows[0]
        });

    } catch (err) {
        console.error('Resolve error:', err);
        res.status(500).json({ error: 'Failed to resolve complaint' });
    }
});

module.exports = router;