const db = require('../db/connection');

// Returns the trust record for a device. If the device has never submitted
// a complaint before, it creates a fresh record with a neutral score of 50.
async function getOrCreateTrust(deviceId) {
    // First try to find an existing record
    const existing = await db.query(
        `SELECT * FROM user_trust WHERE device_id = $1`,
        [deviceId]
    );

    if (existing.rows.length > 0) {
        return existing.rows[0];
    }

    // No record found — create a new one with default values
    const created = await db.query(
        `INSERT INTO user_trust (device_id, trust_score, total_reports, verified_count, spam_count)
         VALUES ($1, 50, 0, 0, 0)
         RETURNING *`,
        [deviceId]
    );

    return created.rows[0];
}

// Called every time a device submits a complaint
// Bumps their total report count by 1
async function incrementReport(deviceId) {
    await getOrCreateTrust(deviceId);

    await db.query(
        `UPDATE user_trust
         SET total_reports = total_reports + 1,
             updated_at = NOW()
         WHERE device_id = $1`,
        [deviceId]
    );
}

// Called when a complaint is verified as genuine
// Increases trust score by 5, capped at a maximum of 100
async function markVerified(deviceId) {
    await getOrCreateTrust(deviceId);

    await db.query(
        `UPDATE user_trust
         SET trust_score = LEAST(trust_score + 5, 100),
             verified_count = verified_count + 1,
             updated_at = NOW()
         WHERE device_id = $1`,
        [deviceId]
    );
}

// Called when a complaint is marked as spam
// Decreases trust score by 15, floored at a minimum of 0
async function markSpam(deviceId) {
    await getOrCreateTrust(deviceId);

    await db.query(
        `UPDATE user_trust
         SET trust_score = GREATEST(trust_score - 15, 0),
             spam_count = spam_count + 1,
             updated_at = NOW()
         WHERE device_id = $1`,
        [deviceId]
    );
}

// Returns just the numeric trust score for a device
// Returns null if the device has never submitted anything
async function getTrustScore(deviceId) {
    const result = await db.query(
        `SELECT trust_score FROM user_trust WHERE device_id = $1`,
        [deviceId]
    );

    if (result.rows.length === 0) return null;

    return result.rows[0].trust_score;
}

module.exports = {
    getOrCreateTrust,
    incrementReport,
    markVerified,
    markSpam,
    getTrustScore
};