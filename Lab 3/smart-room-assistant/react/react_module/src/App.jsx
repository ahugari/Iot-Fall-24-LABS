import React, { useState, useEffect } from "react";
import "./App.css";
import RoomsChart from "./components/roomsChart";

function App() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetchRooms();
    fetchChartData();
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

  const fetchChartData = async () => {
    const url = `/api/rooms/temperature_logs`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        console.log("Error while fetching temperature logs.");
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const temp_data = await response.json();

      const chart_data = groupRoomData(temp_data);
      console.log(chart_data);
      const datasets = chart_data.map((room) => ({
        label: room.name,
        data: room.data.map((item) => item.temperature),
        fill: false,
        borderColor: colorGenerator(),
        tension: 0.1,
      }));

      console.log(chart_data[0]);
      const labels = chart_data[0].data.map((item) => item.timestamp); // use the first room timestamps as chart label

      setChartData({
        labels: labels,
        datasets: datasets,
      });
    } catch (error) {
      console.log("Error while fetching temperature logs", error);
    }
  };

  const groupRoomData = (temp_data) => {
    const chart_data = {};
    const now = new Date();
    const cut_off = new Date(now.getTime() - 6 * 60 * 60 * 1000); // 6 hours ago

    // preparing data for chart
    temp_data.forEach((item) => {
      const room_id = item.room_id;

      const timestamp = new Date(item.timestamp);
      if (cut_off > timestamp) return; // skiping data older than 6 hours

      // if room is not in the chart data list, create it
      if (!chart_data[room_id]) {
        chart_data[room_id] = {
          name: item.name,
          room_id: room_id,
          data: [], // to store room temperature logs
        };
      }

      chart_data[room_id].data.push({
        timestamp: item.timestamp,
        temperature: item.temperature,
      });
    });

    return Object.values(chart_data);
  };

  const one_hour_ago = new Date(new Date().getTime() - 5 * 60 * 1000); // 1 hour ago
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Temperature data for all rooms",
      },
      zoom: {
        pan: {
          enabled: true,
          mode: "x",
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: "x",
        },
      },
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: "minute",
          displayFormats: {
            tooltipFormat: "MMM d, h:mm a",
            minute: "h:mm a",
            hour: "MMM d, hA",
          },
        },
        min: one_hour_ago.toISOString(), // setting the default zoom
        max: new Date().toISOString(),
        title: {
          display: true,
          text: "Time",
        },
      },
      y: {
        title: {
          display: true,
          text: "Temperature (°C)",
        },
        suggestedMin: 12,
        suggestedMax: 30,
      },
    },
  };

  function colorGenerator() {
    const letters = "0123456789ABCDEF";
    let color = "#";

    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }

    return color;
  }

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
      {chartData && (
        <RoomsChart data={chartData} options={chartOptions}></RoomsChart>
      )}
    </div>
  );
}

export default App;
