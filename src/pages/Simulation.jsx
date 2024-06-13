import React, { useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import "../assets/styles/simulation.scss";
import * as THREE from "three";
import axios from "axios";
import FullPageLoader from "../components/FullPageLoader";
import EnvMap from "../assets/textures/envmap.hdr";
import useStore from "../utils/store";

import SimulationControls from "../components/SimulationControls";
import MovingCar from "../components/MovingCar";
import Ground from "../components/Ground";
import RaceTrack from "../components/RaceTrack";
import RacingLine from "../components/RacingLine";

function Simulation() {
  const { telemetryData, loading, cameraMode, isRacingLineVisible } = useStore();

  const points = useMemo(() => telemetryData?.map((p) => new THREE.Vector3(p[0], p[1], p[2])), [telemetryData]);

  return (
    <div className="homepage">
      {loading && <FullPageLoader />}
      <SimulationControls />
      <Canvas camera={{ position: [0, 300, 0], fov: 50 }}>
        <Environment files={EnvMap} background={"both"} />
        <ambientLight intensity={2} />
        <OrbitControls enabled={cameraMode === "free"} />
        <axesHelper args={[20]} />

        {telemetryData && <MovingCar path={points} duration={30} />}
        <RaceTrack />
        <Ground />
        {telemetryData && isRacingLineVisible && <RacingLine points={points} />}
      </Canvas>
    </div>
  );
}

export default Simulation;
