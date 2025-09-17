const express = require('express');
const pool = require('./db');
const app = express();
const roomRoutes = require('./routes/roomRoutes');
const { startLogging } = require('./plugins/sensorPlugins');


async function initApp() {
    const result = await pool.query(`SELECT datname from pg_catalog.pg_database WHERE datname =$1`, [process.env.DATABASE]);

    //verify state of database and tables
    if (result.rows == 0) {
        console.log(`Database not found. Creating database...`);

        await pool.query(`CREATE DATABASE $1`, [process.env.DATABASE]);

        console.log(`Created database $1`, [process.env.DATABASE]);
    } else {
        console.log("Database found");
    }

    pool.query(`SELECT 1 FROM rooms`, async (err, res) => {
        if (err) {
            console.log(`Rooms table not found. Creating table...`);

            await pool.query(`CREATE TABLE rooms (id SERIAL PRIMARY KEY, name VARCHAR(255) UNIQUE NOT NULL, light BOOLEAN DEFAULT FALSE);`);

            console.log(`rooms table created`);
        } else {
            console.log(`rooms table found`);
        }
    });


    pool.query(`SELECT 1 FROM temperature_logs`, async (err, res) => {
        if (err) {
            console.log(`temperature_logs table not found. Creating table...`);

            await pool.query(`CREATE TABLE temperature_logs (id SERIAL PRIMARY KEY, room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE, temperature INTEGER CHECK (temperature >= -50 AND temperature <= 50), timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP);`);

            console.log(`temperature_logs table created`);
        } else {
            console.log(`temperature_logs table found`);
        }
    });


}

initApp();
startLogging();

app.use(express.json());
app.use('/api', roomRoutes);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Smart Room service started on port ${port}`));
