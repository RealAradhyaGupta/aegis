// Handles emergency SOS triggers
const express = require('express');
const router = express.Router();

// POST SOS trigger
router.post('/', (req, res) => {
    res.json({ message: 'SOS triggered' });
});

module.exports = router;
