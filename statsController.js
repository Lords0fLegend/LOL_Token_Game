const express = require('express');
const router = express.Router();
const db = require('./db'); // Import database connection

// POST /api/stats
router.post('/stats', (req, res) => {
    const { full_name, email_address, total_rounds_played, rounds_won, rounds_lost, tokens, highest_score, player_ip } = req.body;

    const sql = `INSERT INTO player_stats (full_name, email_address, total_rounds_played, rounds_won, rounds_lost, tokens, highest_score, player_ip) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [full_name, email_address, total_rounds_played, rounds_won, rounds_lost, tokens, highest_score, player_ip];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting stats:', err.stack);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        console.log('Stats inserted successfully');
        res.status(200).json({ message: 'Stats inserted successfully' });
    });
});

module.exports = router;
