/*
  App.js - main React component for Smart Room Setup Assistant dashboard
  ========================================================================
  This program is for Lab 04-645 A: Internet of Things (IoT) at Carnegie Mellon University Africa.
  Functionality:
  --------------
  This React component implements the front-end dashboard for managing smart home rooms.
  It provides room temperature displays, light status toggles for individual rooms and all rooms,
  and real-time temperature charts using Chart.js.
  Features include fetching data from back-end API endpoints, state management for rooms and charts,
  and periodic updates of temperature data and average temperature.

  Input:
  ------
  - API endpoints providing JSON data:
    - /api/rooms: list of rooms
    - /api/rooms/:id/light: updates light status
    - /api/rooms/lights/:status: update all lights
    - /api/rooms/average-temperature: average room temperature
    - /api/rooms/temperature_logs: temperature logs for chart

  Output:
  -------
  - Dashboard UI with room cards displaying temperature and light status
  - Interactive toggle switches to control lights
  - Live updating temperature chart with zoom and pan features
  - Display of real-time average temperature

  Design Strategy:
  ----------------
  - React hooks (useState, useEffect, useRef) manage component state and lifecycle
  - Periodic refreshes via setInterval fetch latest data and update states
  - Modular functions handle data fetching, toggling lights, and processing temperature logs
  - Chart display managed with Chart.js and configured for interactivity (zoom, pan)
  - Responsive layout and Bootstrap styling for UI elements

  Author:
  -------
  Mark Iraguha, Carnegie Mellon University Africa
  Date: 09/24/2025

  Audit Trail:
  ------------
  Initial version created for IoT lab assignment.
*/
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import "bootstrap/dist/css/bootstrap.min.css";

createRoot(document.getElementById("react-target")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
