import React from "react";
import ReactDOM from "react-dom/client";
import RouterHandler from "./router";
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <RouterHandler />
    </BrowserRouter>
  </React.StrictMode>,
);
