const mysql = require('mysql');

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

module.exports = connection;