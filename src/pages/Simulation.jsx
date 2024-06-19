import React, { useState, useEffect, useMemo } from "react";
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
  const { telemetryData, lapDuration, loading, cameraMode, isRacingLineVisible } = useStore();

  const points = useMemo(() => telemetryData?.map((p) => new THREE.Vector3(p[0], p[1], p[2])), [telemetryData]);

  // State for translation and rotation controls
  const [translation, setTranslation] = useState({ x: 0, y: 0, z: 0 });
  const [rotation, setRotation] = useState({ y: 0 });
  const [scale, setScale] = useState(1);

  return (
    <div className="homepage">
      {loading && <FullPageLoader />}
      <SimulationControls translation={translation} setTranslation={setTranslation} rotation={rotation} setRotation={setRotation} scale={scale} setScale={setScale}/>
      <Canvas camera={{ position: [0, 100, 130], fov: 50 }}>
        <Environment files={EnvMap} background={"both"} />
        <ambientLight intensity={2} />
        <OrbitControls enabled={cameraMode === "free"} />
        {/* <axesHelper args={[20]} /> */}

        {telemetryData && <MovingCar path={points} translation={translation} rotation={rotation} duration={lapDuration} scale={scale}/>}
        <RaceTrack />
        <Ground />
        {telemetryData && isRacingLineVisible && <RacingLine points={points} translation={translation} rotation={rotation} scale={scale} />}
      </Canvas>
    </div>
  );
}

export default Simulation;
