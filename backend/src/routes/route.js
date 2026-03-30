// Handles safe routing calculations
const express = require('express');
const router = express.Router();

// GET safe route
router.get('/', (req, res) => {
    res.json({ message: 'Safe route' });
});

module.exports = router;
