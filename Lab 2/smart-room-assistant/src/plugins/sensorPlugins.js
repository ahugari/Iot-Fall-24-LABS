const pool = require('../db');

// Function to log temperature every 5 seconds
const logTemperature = async (roomId) => {
    try {
        const temperature = Math.floor(Math.random() * (26 - 18 + 1)) + 18; // Random temperature between 18 and 26
        const timestamp = new Date();

        await pool.query(`INSERT INTO temperature_logs(room_id, temperature, timestamp) VALUES ($1, $2, $3)`,
            [roomId, temperature, timestamp]
        );
        console.log(`Logged temperature for room ${roomId} with temperature ${temperature} at time ${timestamp}`);
    } catch (err) {
        console.error(`Error logging temperature:`, err);
    }
};


// Start logging temperature every 10 seconds
const startLogging = () => {
    setInterval(async () => {
        const res = await pool.query(`SELECT id FROM rooms`);
        for (const row of res.rows) {
            logTemperature(row.id);
        }
    }, 10000); // Every 10 seconds
};


module.exports = { startLogging };