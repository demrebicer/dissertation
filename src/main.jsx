/* v8 ignore next */
import React from "react";
import ReactDOM from "react-dom/client";
import RouterHandler from "./router";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from 'react-hot-toast';

import "./assets/styles/index.scss";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <RouterHandler />
    <Toaster />
  </BrowserRouter>,
);
