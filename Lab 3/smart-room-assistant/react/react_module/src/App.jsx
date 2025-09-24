import React, { useState, useEffect } from "react";
import "./App.css";

function RoomsTable() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);

    try {
      // get exsiting rooms from database through api
      const response = await fetch("/api/rooms");
      if (!response.ok) {
        throw new Error(`HTTP error encountered: ${response.status}`);
      }

      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error("Error fetching rooms: ", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLight = async (roomId, lightStatus) => {
    try {
      const url = `/api/rooms/${roomId}/light`;

      const body = {
        light: lightStatus,
      };

      console.log(body);

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error encountered: ${response.status}`);
      }

      const getUpdatedRoom = await fetch(`/api/rooms/${roomId}`);
      const updatedRoom = await getUpdatedRoom.json();

      setRooms(
        rooms.map((room) => (room.id === updatedRoom.id ? updatedRoom : room))
      );
    } catch (error) {
      console.error("Error toggling light: ", error);
    }
  };

  const toggleAllLights = async (lightStatus) => {
    try {
      const url = `/api/rooms/lights/${lightStatus}`;

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error encountered: ${response.status}`);
      }

      fetchRooms();
    } catch (error) {
      console.error(`Error turnings lights ${lightStatus}: `, error);
    }
  };

  if (loading) {
    return <p>loading...</p>;
  }

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => {
            const lightStatusName = room.light ? "On" : "Off";
            const lightNextStatusName = room.light ? "Off" : "On";
            return (
              <tr key={room.id}>
                <td>{room.name}</td>
                <td>{lightStatusName}</td>
                <td>
                  <button
                    onClick={() => toggleLight(room.id, lightNextStatusName)}
                  >
                    Toggle Light
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <button onClick={() => toggleAllLights("off")}>
        Turn off all lights
      </button>
      <button onClick={() => toggleAllLights("on")}>Turn on all lights</button>
    </div>
  );
}

export default RoomsTable;
