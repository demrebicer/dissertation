import React from "react";
import { Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";

// import Homepage from "../pages/old/Homepage";
import Simulation from "../pages/Simulation";
import useStore from "../utils/store";

const RouterHandler = () => {
  const telemetryData = useStore((state) => state.telemetryData);
  const setTelemetryData = useStore((state) => state.setTelemetryData);

  return (
    <Routes>
      <Route path="/" element={<Simulation telemetryData={telemetryData} />} />
      {/* <Route path="/simulation" element={<Simulation telemetryData={telemetryData} />} /> */}
    </Routes>
  );
};

export default RouterHandler;