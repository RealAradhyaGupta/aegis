const db = require('../db/connection');

// Severity multipliers per complaint type
const TYPE_WEIGHTS = {
    harassment: 1.5,
    suspicious_activity: 1.3,
    vandalism: 1.0,
    poor_lighting: 0.7
};

// Returns a time-of-day multiplier based on the hour (0-23)
// Night hours (10pm to 5am) are more dangerous → higher weight
function getTimeWeight(hour) {
    if (hour >= 22 || hour < 5) return 1.5;  // Night
    if (hour >= 5 && hour < 9) return 1.0;   // Early morning
    if (hour >= 9 && hour < 18) return 0.7;  // Daytime
    return 1.1;                               // Evening
}

// Divides the bounding box into a 5x5 grid and returns 25 cell objects
// Each cell has its own north/south/east/west boundaries and a centre point
function buildGrid(north, south, east, west) {
    const latStep = (north - south) / 5;
    const lngStep = (east - west) / 5;
    const cells = [];

    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            const cellSouth = south + row * latStep;
            const cellNorth = cellSouth + latStep;
            const cellWest = west + col * lngStep;
            const cellEast = cellWest + lngStep;

            cells.push({
                cellNorth,
                cellSouth,
                cellEast,
                cellWest,
                centreLat: (cellNorth + cellSouth) / 2,
                centreLng: (cellEast + cellWest) / 2
            });
        }
    }

    return cells;
}

// Main function — computes risk scores for every cell in the bounding box
async function computeRisk(north, south, east, west) {
    // Fetch all complaints inside the bounding box from the last 30 days
    const result = await db.query(
        `SELECT type, latitude, longitude, created_at
         FROM complaints
         WHERE latitude BETWEEN $1 AND $2
           AND longitude BETWEEN $3 AND $4
           AND created_at >= NOW() - INTERVAL '30 days'`,
        [south, north, west, east]
    );

    const complaints = result.rows;
    const now = new Date();
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const grid = buildGrid(north, south, east, west);

    const zones = grid.map(cell => {
        // Find all complaints that fall inside this cell
        const cellComplaints = complaints.filter(c =>
            c.latitude >= cell.cellSouth &&
            c.latitude < cell.cellNorth &&
            c.longitude >= cell.cellWest &&
            c.longitude < cell.cellEast
        );

        if (cellComplaints.length === 0) {
            return {
                centre_lat: cell.centreLat,
                centre_lng: cell.centreLng,
                score: 0,
                factors: { complaint_count: 0, trend: 'stable' }
            };
        }

        // Compute weighted score for each complaint
        let totalScore = 0;
        let recentCount = 0;
        let olderCount = 0;

        cellComplaints.forEach(c => {
            const typeWeight = TYPE_WEIGHTS[c.type] || 1.0;
            const hour = new Date(c.created_at).getHours();
            const timeWeight = getTimeWeight(hour);
            totalScore += typeWeight * timeWeight * 10;

            // Split into recent (last 7 days) vs older for trend calculation
            if (new Date(c.created_at) >= sevenDaysAgo) {
                recentCount++;
            } else {
                olderCount++;
            }
        });

        // Trend velocity — if recent reports are spiking, add a bonus (capped at +15)
        let trendBonus = 0;
        if (olderCount > 0) {
            const velocity = (recentCount - olderCount) / olderCount;
            trendBonus = Math.min(velocity * 15, 15);
        } else if (recentCount > 0) {
            trendBonus = 10; // All complaints are recent — still a concern
        }

        // Raw score before normalisation
        const rawScore = totalScore + trendBonus;

        // Normalise to 0-100 (cap at 100)
        const score = Math.min(Math.round(rawScore), 100);

        const trend = recentCount > olderCount ? 'rising' : recentCount < olderCount ? 'falling' : 'stable';

        return {
            centre_lat: cell.centreLat,
            centre_lng: cell.centreLng,
            score,
            factors: {
                complaint_count: cellComplaints.length,
                recent_count: recentCount,
                older_count: olderCount,
                trend,
                trend_bonus: Math.round(trendBonus)
            }
        };
    });

    // Only return cells that actually have complaints (skip empty cells)
    return zones.filter(z => z.score > 0);
}

module.exports = { computeRisk };