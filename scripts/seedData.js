const { Pool } = require('pg');
require('dotenv').config({ path: './backend/.env' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

const complaintTypes = [
    'Harassment', 'Theft', 'Assault', 'Vandalism',
    'Suspicious Activity', 'Poor Lighting', 'Unsafe Area'
];

const riskLevels = ['low', 'medium', 'high'];

const descriptions = [
    'Incident reported by local resident',
    'Multiple witnesses present',
    'Occurred late at night',
    'Repeat occurrence in this area',
    'Reported via mobile app',
    'CCTV footage available',
    'Suspect fled the scene'
];

// Chennai, India coordinates (center: 13.0827, 80.2707)
function randomCoordinate() {
    const lat = 13.0827 + (Math.random() - 0.5) * 0.15;
    const lng = 80.2707 + (Math.random() - 0.5) * 0.15;
    return { lat, lng };
}

function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate() {
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 90);
    now.setDate(now.getDate() - daysAgo);
    return now;
}

async function seed() {
    const client = await pool.connect();
    console.log('🌱 Seeding database with 200 complaints...');

    try {
        for (let i = 1; i <= 200; i++) {
            const { lat, lng } = randomCoordinate();
            const type = randomItem(complaintTypes);
            const riskLevel = randomItem(riskLevels);
            const description = randomItem(descriptions);
            const reportId = `RPT-SEED-${i}-${Date.now()}`;
            const hash = require('crypto')
                .createHash('sha256')
                .update(reportId + lat + lng)
                .digest('hex');
            const certId = require('crypto')
                .randomBytes(32).toString('hex');
            const reportedAt = randomDate();

            await client.query(
                `INSERT INTO complaints 
                    (report_id, type, description, latitude, longitude,
                     geom, location, risk_level, evidence_hash,
                     certificate_id, reported_at)
                 VALUES ($1, $2, $3, $4, $5,
                     ST_SetSRID(ST_MakePoint($6, $7), 4326),
                     $8, $9, $10, $11, $12)
                 ON CONFLICT (report_id) DO NOTHING`,
                [
                    reportId, type, description,
                    lat, lng,
                    lng, lat,
                    'Chennai, Tamil Nadu',
                    riskLevel, hash, certId, reportedAt
                ]
            );

            if (i % 50 === 0) console.log(`✅ ${i}/200 complaints seeded`);
        }

        console.log('🎉 Seeding complete! 200 complaints added.');
    } catch (err) {
        console.error('❌ Seed error:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

seed();