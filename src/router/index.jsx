import React from "react";
import { Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";

// import Homepage from "../pages/old/Homepage";
import Simulation from "../pages/Simulation";
import Test from "../pages/Test";
import Tooltip from "../pages/Tooltip";
import Timing from "../pages/Timing";
// import LapBoard from "../pages/Simulation";
import Shadow from "../pages/Shadow";

import useStore from "../pages/old/store";

const RouterHandler = () => {
  const telemetryData = useStore((state) => state.telemetryData);
  const setTelemetryData = useStore((state) => state.setTelemetryData);

  return (
    <Routes>
      <Route path="/" element={<Simulation telemetryData={telemetryData} />} />
      <Route path="/test" element={<Test />} />
      <Route path="/tooltip" element={<Tooltip />} />
      <Route path="/timing" element={<Timing />} />
      <Route path="/shadow" element={<Shadow />} />
      {/* <Route path="/lapboard" element={<LapBoard />} /> */}
    </Routes>
  );
};

export default RouterHandler;
