const db = require('../db/connection');

class RiskEngine {
    // Compute risk score for a given location
    async computeZoneRisk(latitude, longitude, radiusMeters = 500) {
        const result = await db.query(
            `SELECT 
                COUNT(*) as complaint_count,
                AVG(CASE 
                    WHEN risk_level = 'high' THEN 100
                    WHEN risk_level = 'medium' THEN 50
                    WHEN risk_level = 'low' THEN 20
                    ELSE 10
                END) as avg_risk
             FROM complaints
             WHERE ST_DWithin(
                geom::geography,
                ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography,
                $3
             )
             AND reported_at > NOW() - INTERVAL '30 days'`,
            [latitude, longitude, radiusMeters]
        );

        const { complaint_count, avg_risk } = result.rows[0];
        const count = parseInt(complaint_count);
        const base = parseFloat(avg_risk) || 0;

        // Score formula: blend complaint density with average risk
        const score = Math.min(100, Math.round(base * 0.7 + count * 3));
        return score;
    }

    // Get all complaints as heatmap points
    async getHeatmapData() {
        const result = await db.query(
            `SELECT 
                latitude, longitude, risk_level,
                type, reported_at
             FROM complaints
             WHERE reported_at > NOW() - INTERVAL '90 days'
             ORDER BY reported_at DESC`
        );
        return result.rows;
    }
}

module.exports = new RiskEngine();
