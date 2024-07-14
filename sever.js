const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// MySQL Connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'markxwyo_laserteam',
    password: 'Homiez@420',
    database: 'markxwyo_player_stats_LaserGame'
});

connection.connect(err => {
    if (err) {
        console.error('Database connection error:', err.stack);
        return;
    }
    console.log('Connected to MySQL database');
});

// API Routes
app.post('/api/stats', (req, res) => {
    const { playerId, score, tokens, roundsPlayed } = req.body;

    const sql = `INSERT INTO player_stats (player_id, score, tokens, rounds_played) VALUES (?, ?, ?, ?)`;
    const values = [playerId, score, tokens, roundsPlayed];

    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting stats:', err.stack);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        console.log('Stats inserted successfully');
        res.status(200).json({ message: 'Stats inserted successfully' });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
