const crypto = require('crypto');
const db = require('../db/connection');

class EvidenceService {
    // Generate a SHA-256 hash from report data
    generateHash(data) {
        return crypto
            .createHash('sha256')
            .update(JSON.stringify(data))
            .digest('hex');
    }

    // Generate a unique certificate ID
    generateCertificateId() {
        return crypto.randomBytes(32).toString('hex');
    }

    // Save evidence record to the ledger
    async saveToLedger(complaintId, hash, certificateId, metadata) {
        const result = await db.query(
            `INSERT INTO evidence_ledger 
                (complaint_id, hash, certificate_id, metadata) 
             VALUES ($1, $2, $3, $4) 
             RETURNING *`,
            [complaintId, hash, certificateId, JSON.stringify(metadata)]
        );
        return result.rows[0];
    }
}

module.exports = new EvidenceService();