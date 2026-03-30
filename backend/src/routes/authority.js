// Handles communication with authorities
const express = require('express');
const router = express.Router();

// GET authority data
router.get('/', (req, res) => {
    res.json({ message: 'Authority data' });
});

module.exports = router;
