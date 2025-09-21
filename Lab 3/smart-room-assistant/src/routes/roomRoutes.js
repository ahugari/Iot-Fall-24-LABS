const express = require("express");
const router = express.Router();
const axios = require('axios');
const utilities = require('../helpers/utilities');
const db = require('../db');

// GET request to retrieve average temperature of all rooms
router.get('/rooms/dashboard', async (req, res) => {
    try {
        // get existing rooms
        console.log(`Getting rooms http://localhost:${utilities.port}/api/rooms`)
        const response = await axios.get(`http://localhost:${utilities.port}/api/rooms`);

        res.render(
            'dashboard',
            { rooms: response.data }
        );
    } catch (err) {
        console.log("Error while rending page." + err);
        return res.status(500).json({ 'error': 'could not complete request to render page' });
    };
});

// GET request to retrieve average temperature of all rooms
router.get('/rooms/average-temperature', async (req, res) => {
    try {

        const avg_temp = await getAverageTemperature();

        res.status(200).send(avg_temp);
    } catch (err) {
        console.log("Error while getting average temperature of all rooms. Verify database configuration and try again." + err);
        return res.status(500).json({ 'error': 'could not complete request to get average temperature of all rooms' });
    };
});

// GET request to retrieve all rooms
router.get('/rooms', async (req, res) => {
    try {
        const rooms = await getAllRooms();
        if (Array.isArray(rooms) && rooms.length == 0) return res.status(404).json({ 'message': "No rooms found" })

        res.status(200).send(rooms);
    } catch (err) {
        console.log("Error while getting rooms. Verify database configuration and try again." + err);
        return res.status(500).json({ 'error': 'could not complete request to get rooms' });
    };
});

// GET request to retrieve room by id
router.get('/rooms/:id', async (req, res) => {
    try {
        if (isInvalidRoomId(req.params.id)) {
            return res.status(400).json({ 'message': "Illegal, missing, or malformed input" });
        }

        const room = await getRoomById(req.params.id);
        if (Array.isArray(room) && room.length == 0) return res.status(404).json({ 'message': "Room not found" })

        res.status(200).send(room);
    } catch (err) {
        console.log("Error while getting room by isbn. Verify database configuration and try again." + err);
        return res.status(500).json({ 'error': 'could not complete request to get room by isbn' });
    };
});

// POST request to create a room
router.post('/rooms', async (req, res) => {
    try {
        if (!req.body.name || req.body.name.length == 0) {
            return res.status(400).json({ 'message': "Illegal, missing, or malformed input" });
        }

        const exists = await getRoomByName(req.body.name);
        if ((Array.isArray(exists) && exists.length != 0)
            || (!Array.isArray(exists) && exists != null)
        ) {
            return res.status(404).json({ 'message': "Room exists." });
        }

        const name = req.body.name.trim();

        const room = await createRoom(name);

        res.status(200).send(room);
    } catch {
        console.log("Error while updating light status. Verify database configuration and try again." + err);
        return res.status(500).json({ 'error': 'could not complete request to update light status' });
    }
});

// PATCH request to update room light status
router.patch('/rooms/:id/light', async (req, res) => {
    try {
        if (isInvalidRoomId(req.params.id)) {
            return res.status(400).json({ 'message': "Illegal, missing, or malformed input" });
        }

        if (!req.body.light || req.body.light.length == 0) {
            return res.status(400).json({ 'message': "Illegal, missing, or malformed input" });
        }

        if (req.body.light.toLowerCase() != "on" && req.body.light.toLowerCase() != "off") {
            return res.status(400).json({ 'message': "Illegal, missing, or malformed input" });
        }

        const exists = await getRoomById(req.params.id);
        if ((Array.isArray(exists) && exists.length == 0)
            || (!Array.isArray(exists) && exists == null)
        ) return res.status(404).json({ 'message': "Room not found" });

        console.log(req.body.light.toUpperCase());

        await updateLightStatus(req.params.id, req.body.light);

        // return updated id from database
        const roomUpdated = await getRoomById(req.params.id);

        res.status(200).send(roomUpdated);
    } catch {
        console.log("Error while updating light status. Verify database configuration and try again." + err);
        return res.status(500).json({ 'error': 'could not complete request to update light status' });
    }
});

// DELETE request to update room light status
router.delete('/rooms/:id', async (req, res) => {
    try {
        const exists = await getRoomById(req.params.id);
        if ((Array.isArray(exists) && exists.length == 0)
            || (!Array.isArray(exists) && exists == null)
        ) {
            return res.status(404).json({ 'message': "Room not found" });
        }

        const result = await deleteRoom(req.params.id);

        if (result) {
            return res.status(200).send(result);
        } else {
            console.log("Error while deleting room. Room might not exist." + err);
            return res.status(500).json({ 'error': 'room might not exist' });
        }
    } catch {
        console.log("Error while deleting room. Verify database configuration and try again." + err);
        return res.status(500).json({ 'error': 'could not complete request to update light status' });
    }
});

// PATCH request to turn all room lights on
router.patch('/rooms/lights/on', async (req, res) => {
    try {

        const result = await turnAllRoomLightsOn();

        if (result) {
            return res.status(200).send(result);
        } else {
            console.log("Error while deleting room. Room might not exist." + err);
            return res.status(500).json({ 'error': 'room might not exist' });
        }
    } catch {
        console.log("Error while updating light status. Verify database configuration and try again." + err);
        return res.status(500).json({ 'error': 'could not complete request to update light status' });
    }
});

// PATCH request to turn all room lights off
router.patch('/rooms/lights/off', async (req, res) => {
    try {

        const result = await turnAllRoomLightsOff();

        if (result) {
            return res.status(200).send(result);
        } else {
            console.log("Error while deleting room. Room might not exist." + err);
            return res.status(500).json({ 'error': 'room might not exist' });
        }
    } catch {
        console.log("Error while updating light status. Verify database configuration and try again." + err);
        return res.status(500).json({ 'error': 'could not complete request to update light status' });
    }
});



// helper functions to verify room id
function isInvalidRoomId(id) {
    return !/^\d+(\.\d+)?$/.test(id);
}

// helper functions to query the database
async function getRoomById(id) {
    const result = await db.query('SELECT * FROM rooms WHERE id = $1;', [id]);
    return result.rows[0];
}

async function getAllRooms() {
    const result = await db.query('SELECT * FROM rooms;');
    return result.rows;
}

async function deleteRoom(id) {
    const result = await db.query('DELETE FROM rooms WHERE id = $1 RETURNING *;', [id]);
    return result.rows[0];
}

async function getAverageTemperature() {
    const result = await db.query('SELECT AVG(temperature) AS average_temperature FROM temperature_logs;');
    return result.rows[0];
}

async function turnAllRoomLightsOn() {
    const result = await db.query('UPDATE rooms SET light = TRUE;');
    return result.rows;
}

async function turnAllRoomLightsOff() {
    const result = await db.query('UPDATE rooms SET light = FALSE;');
    return result.rows;
}

async function updateLightStatus(id, status) {
    const light_status = String(status)?.toLowerCase() === "on";

    const result = await db.query('UPDATE rooms SET light = $1 WHERE id = $2 RETURNING *;', [light_status, id]);

    return result.rows;
}

async function createRoom(name) {
    const result = await db.query('INSERT INTO rooms (name) VALUES ($1) RETURNING *;', [name]);
    return result.rows;
}

async function getRoomByName(name) {
    const result = await db.query('SELECT (name) FROM rooms WHERE name = $1;', [name]);
    return result.rows;
}

module.exports = router;        // export the router to be used in the app