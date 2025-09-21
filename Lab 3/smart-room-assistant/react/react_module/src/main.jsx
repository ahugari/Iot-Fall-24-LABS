import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("react-target")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
