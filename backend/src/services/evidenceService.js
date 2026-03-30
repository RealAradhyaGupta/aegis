const crypto = require('crypto');
const db = require('../db/connection');

// Generates a SHA-256 hash from complaint data
// Keys are sorted alphabetically before hashing so the same data always produces the same hash
function generateHash(data) {
    const sorted = Object.keys(data)
        .sort()
        .reduce((obj, key) => {
            obj[key] = data[key];
            return obj;
        }, {});
    return crypto.createHash('sha256').update(JSON.stringify(sorted)).digest('hex');
}

// Main function — submits a complaint and writes an immutable evidence record
// Uses a database TRANSACTION: if anything fails, NOTHING is saved (all or nothing)
async function submitComplaint(complaintData) {
    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        // Step 1 — Insert the complaint into the complaints table
        const complaintResult = await client.query(
            `INSERT INTO complaints 
                (type, description, latitude, longitude, location_name, device_id, status, risk_score)
             VALUES ($1, $2, $3, $4, $5, $6, 'pending', 0)
             RETURNING *`,
            [
                complaintData.type,
                complaintData.description,
                complaintData.latitude,
                complaintData.longitude,
                complaintData.location_name || null,
                complaintData.device_id
            ]
        );

        const complaint = complaintResult.rows[0];

        // Step 2 — Build the object we will hash (only stable fields, no timestamps)
        const hashInput = {
            complaint_id: complaint.id,
            description: complaint.description,
            device_id: complaint.device_id,
            latitude: complaint.latitude,
            longitude: complaint.longitude,
            type: complaint.type
        };

        const hash = generateHash(hashInput);

        // Step 3 — Build the certificate object (this is what gets returned to the user)
        const certificate = {
            complaint_id: complaint.id,
            hash,
            issued_at: new Date().toISOString(),
            issuer: 'AEGIS Evidence Ledger v1'
        };

        // Step 4 — Write the immutable ledger record
        const ledgerResult = await client.query(
            `INSERT INTO evidence_ledger 
                (complaint_id, sha256_hash, metadata_json, certificate)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [
                complaint.id,
                hash,
                JSON.stringify(hashInput),
                JSON.stringify(certificate)
            ]
        );

        // Step 5 — Commit the transaction (save everything permanently)
        await client.query('COMMIT');

        return {
            success: true,
            complaint_id: complaint.id,
            certificate
        };

    } catch (error) {
        // If ANYTHING went wrong, undo all database writes
        await client.query('ROLLBACK');
        throw error;
    } finally {
        // Always release the database connection back to the pool
        client.release();
    }
}

// Fetches the certificate for a given complaint ID
async function getCertificate(complaintId) {
    const result = await db.query(
        `SELECT e.sha256_hash, e.certificate, e.created_at, c.type, c.status
         FROM evidence_ledger e
         JOIN complaints c ON c.id = e.complaint_id
         WHERE e.complaint_id = $1`,
        [complaintId]
    );

    if (result.rows.length === 0) return null;

    return result.rows[0];
}

module.exports = { submitComplaint, getCertificate };