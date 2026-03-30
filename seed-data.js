const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'aegis',
  password: process.env.DB_PASSWORD,
  port: 5432,
});

const incidentTypes = ['Harassment', 'Poor Lighting', 'Vandalism', 'Suspicious Activity'];

const riskLevels = ['High', 'High', 'High', 'Medium', 'Medium', 'Low'];

const statuses = ['Pending', 'Pending', 'Pending', 'Under Review', 'Under Review', 'Resolved'];

// Hotspot clusters — more incidents in busy urban areas
const clusters = [
  // Mumbai
  { name: 'Andheri, Mumbai', lat: 19.1136, lng: 72.8697, weight: 15 },
  { name: 'Dharavi, Mumbai', lat: 19.0422, lng: 72.8538, weight: 12 },
  { name: 'Bandra, Mumbai', lat: 19.0596, lng: 72.8295, weight: 10 },
  { name: 'Kurla, Mumbai', lat: 19.0726, lng: 72.8796, weight: 10 },
  { name: 'Dadar, Mumbai', lat: 19.0178, lng: 72.8478, weight: 8 },
  // Delhi
  { name: 'Connaught Place, Delhi', lat: 28.6315, lng: 77.2167, weight: 14 },
  { name: 'Lajpat Nagar, Delhi', lat: 28.5700, lng: 77.2433, weight: 12 },
  { name: 'Rohini, Delhi', lat: 28.7041, lng: 77.1025, weight: 8 },
  { name: 'Saket, Delhi', lat: 28.5244, lng: 77.2066, weight: 8 },
  { name: 'Karol Bagh, Delhi', lat: 28.6514, lng: 77.1908, weight: 10 },
  // Bangalore
  { name: 'Koramangala, Bangalore', lat: 12.9352, lng: 77.6245, weight: 12 },
  { name: 'Whitefield, Bangalore', lat: 12.9698, lng: 77.7500, weight: 10 },
  { name: 'Indiranagar, Bangalore', lat: 12.9784, lng: 77.6408, weight: 10 },
  { name: 'Marathahalli, Bangalore', lat: 12.9591, lng: 77.6971, weight: 8 },
  // Chennai
  { name: 'T. Nagar, Chennai', lat: 13.0418, lng: 80.2341, weight: 12 },
  { name: 'Velachery, Chennai', lat: 12.9815, lng: 80.2180, weight: 8 },
  { name: 'Anna Nagar, Chennai', lat: 13.0850, lng: 80.2101, weight: 8 },
  // Hyderabad
  { name: 'Banjara Hills, Hyderabad', lat: 17.4156, lng: 78.4347, weight: 10 },
  { name: 'Secunderabad, Hyderabad', lat: 17.4399, lng: 78.4983, weight: 10 },
  { name: 'Hitech City, Hyderabad', lat: 17.4435, lng: 78.3772, weight: 8 },
];

const descriptions = {
  'Harassment': [
    'Individual followed and verbally threatened near the metro station exit.',
    'Woman harassed by group of men near the bus stop late at night.',
    'Female commuter followed from station to residential area.',
    'Verbal abuse and threatening behaviour reported near the market.',
    'User felt unsafe and followed for several blocks after midnight.',
  ],
  'Poor Lighting': [
    'Street lights non-functional for several days. Area unsafe after dark.',
    'Entire stretch of road has no working lights. Multiple residents complained.',
    'Underpass has no lighting. Commuters avoid it after 8pm.',
    'Flickering street lights near school causing safety concerns.',
    'Dark alleyway between two main roads with no lighting infrastructure.',
  ],
  'Vandalism': [
    'Graffiti sprayed on compound walls and shop shutters overnight.',
    'Bus shelter windows smashed. Second incident this month.',
    'Public benches and signage damaged in the park.',
    'Auto rickshaw stands vandalised. CCTV cameras also damaged.',
    'Walls of residential complex defaced with paint.',
  ],
  'Suspicious Activity': [
    'Group loitering near ATM for extended period. Possible skimming activity.',
    'Unattended bag left near station entrance for over 30 minutes.',
    'Individuals observed watching parked vehicles late at night.',
    'Possible drug dealing observed near the park.',
    'Unknown individuals photographing residential building entrances.',
  ],
};

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateHash() {
  const chars = '0123456789abcdef';
  return Array.from({ length: 64 }, () => chars[Math.floor(Math.random() * 16)]).join('');
}

function generateDate() {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 7);
  const hoursAgo = Math.floor(Math.random() * 24);
  const minutesAgo = Math.floor(Math.random() * 60);
  now.setDate(now.getDate() - daysAgo);
  now.setHours(now.getHours() - hoursAgo);
  now.setMinutes(now.getMinutes() - minutesAgo);
  return now;
}

// Build weighted cluster list
function buildWeightedClusters() {
  const weighted = [];
  clusters.forEach(c => {
    for (let i = 0; i < c.weight; i++) weighted.push(c);
  });
  return weighted;
}

async function seed() {
  const client = await pool.connect();
  const weightedClusters = buildWeightedClusters();

  try {
    console.log('Clearing existing data...');
    await client.query('DELETE FROM complaints');

    console.log('Seeding 200 complaints...');

    for (let i = 1; i <= 200; i++) {
      const cluster = randomItem(weightedClusters);
      const type = randomItem(incidentTypes);
      const risk = randomItem(riskLevels);
      const status = i <= 5 ? 'Resolved' : randomItem(statuses);
      const description = randomItem(descriptions[type]);
      const lat = cluster.lat + randomBetween(-0.015, 0.015);
      const lng = cluster.lng + randomBetween(-0.015, 0.015);
      const reportId = `RPT-${String(i).padStart(3, '0')}`;
      const hash = generateHash();
      const date = generateDate();

      await client.query(
        `INSERT INTO complaints 
          (report_id, type, location, latitude, longitude, description, risk_level, status, evidence_hash, reported_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [reportId, type, cluster.name, lat, lng, description, risk, status, hash, date]
      );
    }

    console.log('✅ 200 complaints seeded successfully!');
    console.log('✅ First 5 complaints marked as Resolved (success stories)');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();