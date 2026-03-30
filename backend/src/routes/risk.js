// Handles risk zone calculations and retrieval
const express = require('express');
const router = express.Router();

// GET risk data
router.get('/', (req, res) => {
    res.json({ message: 'Risk data' });
});

module.exports = router;
