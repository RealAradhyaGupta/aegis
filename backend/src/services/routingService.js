const { computeRisk } = require('./riskEngine');
const HIGH_RISK_THRESHOLD = 60;

function interpolateLine(origin, destination, steps = 20) {
    const coords = [];
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        coords.push([
            origin[0] + (destination[0] - origin[0]) * t,
            origin[1] + (destination[1] - origin[1]) * t
        ]);
    }
    return { type: 'LineString', coordinates: coords };
}

function haversineMeters(a, b) {
    const R = 6371000;
    const dLat = (b[1] - a[1]) * Math.PI / 180;
    const dLng = (b[0] - a[0]) * Math.PI / 180;
    const x = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(a[1]*Math.PI/180) * Math.cos(b[1]*Math.PI/180) *
        Math.sin(dLng/2) * Math.sin(dLng/2);
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
}

function routeDistance(geometry) {
    const c = geometry.coordinates;
    let d = 0;
    for (let i = 1; i < c.length; i++) d += haversineMeters(c[i-1], c[i]);
    return d;
}

function getRouteBoundingBox(geometry) {
    const coords = geometry.coordinates;
    const lats = coords.map(c => c[1]);
    const lngs = coords.map(c => c[0]);
    return { north: Math.max(...lats)+0.005, south: Math.min(...lats)-0.005, east: Math.max(...lngs)+0.005, west: Math.min(...lngs)-0.005 };
}

function isZoneNearRoute(zone, geometry) {
    return geometry.coordinates.some(coord =>
        Math.abs(coord[1]-zone.centre_lat) < 0.005 &&
        Math.abs(coord[0]-zone.centre_lng) < 0.005
    );
}

function generateOffsetWaypoint(zone) {
    return [zone.centre_lng + 0.008, zone.centre_lat + 0.008];
}

async function getSafeRoute(originLat, originLng, destLat, destLng) {
    const origin = [originLng, originLat];
    const destination = [destLng, destLat];

    const fastGeometry = interpolateLine(origin, destination);
    const bbox = getRouteBoundingBox(fastGeometry);
    const riskZones = await computeRisk(bbox.north, bbox.south, bbox.east, bbox.west);
    const highRiskOnRoute = riskZones.filter(z =>
        z.score > HIGH_RISK_THRESHOLD && isZoneNearRoute(z, fastGeometry)
    );

    const fastDist = Math.round(routeDistance(fastGeometry));
    const fastRouteData = {
        type: 'fast',
        geometry: fastGeometry,
        duration_seconds: Math.round(fastDist / 1.4),
        distance_meters: fastDist,
        high_risk_zones: highRiskOnRoute.length,
        risk_zones: highRiskOnRoute
    };

    if (highRiskOnRoute.length === 0) {
        return {
            fast_route: fastRouteData,
            safe_route: { ...fastRouteData, type: 'safe', note: 'No high-risk zones detected - routes are identical' }
        };
    }

    const waypoints = highRiskOnRoute.map(generateOffsetWaypoint);
    const safePoints = [origin, ...waypoints, destination];
    const safeCoords = [];
    for (let i = 1; i < safePoints.length; i++) {
        const seg = interpolateLine(safePoints[i-1], safePoints[i], 10);
        if (i > 1) seg.coordinates.shift();
        safeCoords.push(...seg.coordinates);
    }
    const safeGeometry = { type: 'LineString', coordinates: safeCoords };

    const safeBbox = getRouteBoundingBox(safeGeometry);
    const safeRiskZones = await computeRisk(safeBbox.north, safeBbox.south, safeBbox.east, safeBbox.west);
    const highRiskOnSafe = safeRiskZones.filter(z =>
        z.score > HIGH_RISK_THRESHOLD && isZoneNearRoute(z, safeGeometry)
    );

    const safeDist = Math.round(routeDistance(safeGeometry));
    return {
        fast_route: fastRouteData,
        safe_route: {
            type: 'safe',
            geometry: safeGeometry,
            duration_seconds: Math.round(safeDist / 1.4),
            distance_meters: safeDist,
            high_risk_zones: highRiskOnSafe.length,
            risk_zones: highRiskOnSafe
        }
    };
}

module.exports = { getSafeRoute };