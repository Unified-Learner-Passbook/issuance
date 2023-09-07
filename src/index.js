import React from "react";
import ReactDOM from "react-dom/client";
import "./assets/css/AppDesign.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
