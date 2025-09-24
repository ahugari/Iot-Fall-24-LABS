import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import RoomsChart from "./components/roomsChart";

function App() {
  const [rooms, setRooms] = useState([]);
  const roomsRef = useRef([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [chartData, setChartData] = useState(null);
  const [avgTemp, setAvgTemp] = useState(0);

  useEffect(() => {
    fetchRooms();
    fetchChartData();
    fetchAvgTemp();

    const continuousChartUpdate = setInterval(async () => {
      const url = `/api/rooms/temperature_logs`;
      try {
        const { labels, datasets, newRooms } = await getChartData(
          url,
          groupRoomData,
          colorGenerator,
          roomsRef.current
        );

        setChartData({
          labels: labels,
          datasets: datasets,
        });

        console.log("new rooms", newRooms);
        setRooms(newRooms);
      } catch (error) {
        console.log("Error while fetching temperature logs", error);
      }
    }, 5000);

    const continuousAvgUpdate = setInterval(() => {
      fetchAvgTemp();
    }, 10000);

    return () => {
      clearInterval(continuousChartUpdate);
      clearInterval(continuousAvgUpdate);
    }; // clear continous refresh
  }, []);

  const fetchAvgTemp = async () => {
    try {
      // get avg temp of all rooms through api
      const response = await fetch(`/api/rooms/average-temperature`);
      if (!response.ok) {
        throw new Error(`HTTP error encountered: ${response.status}`);
      }

      const data = await response.json();
      console.log("avg", data.average_temperature);
      setAvgTemp(Math.round(data.average_temperature));
    } catch (error) {
      console.error("Error fetching average temperature: ", error);
    }
  };

  const fetchRooms = async () => {
    setRoomsLoading(true);

    try {
      // get exsiting rooms from database through api
      const response = await fetch("/api/rooms");
      if (!response.ok) {
        throw new Error(`HTTP error encountered: ${response.status}`);
      }

      const data = await response.json();
      setRooms(data);
      roomsRef.current = data;
    } catch (error) {
      console.error("Error fetching rooms: ", error);
    } finally {
      setRoomsLoading(false);
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
      roomsRef.current = rooms.map((room) =>
        room.id === updatedRoom.id ? updatedRoom : room
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

      // get exsiting rooms from database through api
      const roomsResponse = await fetch("/api/rooms");
      if (!roomsResponse.ok) {
        throw new Error(`HTTP error encountered: ${roomsResponse.status}`);
      }

      const data = await roomsResponse.json();
      setRooms(data);
    } catch (error) {
      console.error(`Error turnings lights ${lightStatus}: `, error);
    }
  };

  const fetchChartData = async () => {
    const url = `/api/rooms/temperature_logs`;
    setChartsLoading(true);
    try {
      const { labels, datasets, newRooms } = await getChartData(
        url,
        groupRoomData,
        colorGenerator,
        rooms
      );

      setChartData({
        labels: labels,
        datasets: datasets,
      });
    } catch (error) {
      console.log("Error while fetching temperature logs", error);
    } finally {
      setChartsLoading(false);
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
        suggestedMin: 14,
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

  return (
    <div className="container-fluid bg-dark text-white p-3">
      <div className="row">
        <div className="col-md-6 align-self-end">
          <div className="card bg-secondary text-white mb-2">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h5 className="card-title">Hi there!</h5>
                <p className="card-text">
                  Welcome to your smart home dashboard.
                </p>
              </div>
              <div className="display-temp text-end">
                <h1 className="temp-value">{avgTemp}°C</h1>
                <small className="text-muted">Avg Temp</small>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>Light Control</h4>
            <button
              className="btn btn-dark btn-sm"
              onClick={() => toggleAllLights("off")}
            >
              Turn off all lights
            </button>
            <button
              onClick={() => toggleAllLights("on")}
              className="btn btn-dark btn-sm"
            >
              Turn on all lights
            </button>
          </div>
          <div className="row row-cols-2">
            {!roomsLoading ? (
              rooms.map((room) => {
                const lightStatusName = room.light ? "On" : "Off";
                const lightNextStatusName = room.light ? "Off" : "On";

                return (
                  <div className="col mb-2" key={room.id}>
                    <div className="card bg-secondary text-white">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="me-3">
                            {lightStatusName == "Off" ? (
                              <img
                                src="/bulb-off.svg"
                                alt="bulb-light-off"
                                width="64"
                                height="64"
                              />
                            ) : (
                              <img
                                src="/bulb-on.svg"
                                alt="bulb-light-on"
                                width="64"
                                height="64"
                              />
                            )}
                          </div>

                          <div className="form-check form-switch">
                            <label
                              className="form-check-label"
                              htmlFor={room.id}
                            >
                              {lightStatusName == "On" ? "Turn Off" : "Turn On"}
                            </label>
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={room.id}
                              onChange={() =>
                                toggleLight(room.id, lightNextStatusName)
                              }
                              checked={lightStatusName == "On"}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="card-footer d-flex justify-content-between align-items-center px-3">
                        <span>{room.name}</span>
                        <span className="temp-readout">
                          {room.temperature}°C
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col mb-2">
                <div className="card bg-secondary text-white">
                  <div className="card-body"></div>
                  <div className="card-footer text-center">
                    Rooms loading...
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col">
          <h4>Room temperatures</h4>

          {!chartsLoading ? (
            <RoomsChart data={chartData} options={chartOptions}></RoomsChart>
          ) : (
            <p>Charts loading...</p>
          )}
        </div>
      </div>
    </div>
  );
}

async function getChartData(url, groupRoomData, colorGenerator, rooms) {
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

  //get last known values
  console.log("incoming rooms", rooms);
  console.log("chart data", chart_data);

  const newRooms = rooms.map((rm) => {
    const match = chart_data.find((room) => room.room_id === rm.id);
    return {
      id: rm.id,
      light: rm.light,
      name: rm.name,
      temperature: match?.data?.[0]?.temperature ?? 0,
    };
  });
  console.log("new data", newRooms);

  const labels = chart_data[0].data.map((item) => item.timestamp); // use the first room timestamps as chart label
  return { labels, datasets, newRooms };
}

export default App;
