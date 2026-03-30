// Main entry point for the AEGIS backend Express app
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const reportRoutes = require('./routes/report');
const riskRoutes = require('./routes/risk');
const routeRoutes = require('./routes/route');
const sosRoutes = require('./routes/sos');
const authorityRoutes = require('./routes/authority');

const app = express();
app.use(cors());
app.use(express.json());

// Mount routes
app.use('/api/reports', reportRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/authorities', authorityRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
