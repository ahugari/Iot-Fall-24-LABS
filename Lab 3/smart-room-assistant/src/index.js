/*
  index.js - main application file for Smart Room Management System API
  ========================================================================

  This program is for Lab 04-645 A: Internet of Things (IoT) at Carnegie Mellon University Africa.

  Functionality:
  --------------
  The application provides a RESTful API for managing smart home rooms using Node.js,
  Express.js, and PostgreSQL.  It allows users to create, retrieve, update, and delete rooms,
  control their light status, and (simulate) logging temperature data. The application exposes
  API endpoints for these operations, interacting with a PostgreSQL database to persist data.

  Input:
  ------
  - HTTP requests to the API endpoints with JSON payloads for creating/updating rooms.
  - Configuration data from the .env file (e.g., database credentials).

  Output:
  -------
  - JSON responses to HTTP requests, including room data, success/error messages.
  - Logs to the console for debugging and monitoring purposes.

  Dependencies:
  -------------
  - Node.js runtime environment
  - Express.js: Web application framework for creating the API.
  - pg: Node.js package for connecting to PostgreSQL.
  - dotenv: For loading environment variables from a .env file.
  - Body-parser (Express middleware): For parsing JSON request bodies. (Implicit, part of express)

  Usage:
  ------
  1.  Set up environment variables in a `.env` file (database credentials, port, etc.).
  2.  Install dependencies: `npm install`
  3.  Run the application: `node index.js`

  The application will start an Express server listening on the specified port.  Use API clients
  like Postman or Insomnia to interact with the API endpoints.

  Example API Endpoints:
    - POST /api/rooms: Creates a new room.
    - GET /api/rooms: Retrieves a list of all rooms.
    - GET /api/rooms/:id: Retrieves a specific room by ID.
    - PATCH /api/rooms/:id/light: Updates the light status of a room.
    - DELETE /api/rooms/:id: Deletes a room.
    - PATCH /api/rooms/lights/on: Turns all lights on.
    - PATCH /api/rooms/lights/off: Turns all lights off.
    - GET /api/rooms/average-temperature: Retrieves the average temperature.

  Design Strategy:
  ----------------
  The application follows a modular design:
    - `db.js`: Handles database connection and queries.
    - `roomRoutes.js`: Defines the API routes for room management.
    - `sensorPlugin.js`: Contains functions for logging temperature data (simulated).
    - `index.js`: Sets up the Express server, configures middleware, integrates routes,
                  and starts the server.

  The Express server handles HTTP requests, interacts with the database via the `pg` package,
  and returns JSON responses to the client. Middleware is used for parsing request bodies and
  handling errors.

  Author:
  -------
  Mark Iraguha, Carnegie Mellon University Africa
  Date: 09/19/2024

  Audit Trail:
  ------------
  Initial version created for IoT lab assignment.
*/
const express = require('express');
const pool = require('./db');
const app = express();
const roomRoutes = require('./routes/roomRoutes');
const { startLogging } = require('./plugins/sensorPlugins');
const path = require('path');
const utilities = require('./helpers/utilities');

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

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(express.json());
app.use('/api', roomRoutes);

const port = utilities.port;

app.listen(port, () => console.log(`Smart Room service started on port ${port}`));
