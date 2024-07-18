import React from "react";
import { Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";

// import Homepage from "../pages/old/Homepage";
import Simulation from "../pages/Simulation";

const RouterHandler = () => {
  return (
    <Routes>
      <Route path="/" element={<Simulation />} />
    </Routes>
  );
};

export default RouterHandler;
