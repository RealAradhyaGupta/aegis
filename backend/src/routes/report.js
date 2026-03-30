// Handles incoming safety reports
const express = require('express');
const router = express.Router();

// POST a new report
router.post('/', (req, res) => {
    res.json({ message: 'Report created' });
});

module.exports = router;
