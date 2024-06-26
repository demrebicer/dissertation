import React, { useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls, Sky } from "@react-three/drei";
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
import Rain from "../components/Rain";

import NewSimulationControls from "../components/NewSimulationControls";

function Simulation() {
  const { telemetryData, lapDuration, loading, cameraMode, isRacingLineVisible, isRaining } = useStore();

  const points = useMemo(() => telemetryData?.map((p) => new THREE.Vector3(p[0], p[1], p[2])), [telemetryData]);

  // State for translation and rotation controls
  const [translation, setTranslation] = useState({ x: 0, y: 0, z: 0 });
  const [rotation, setRotation] = useState({ y: 0 });
  const [scale, setScale] = useState(1);

  return (
    <div className="homepage">
      {loading && <FullPageLoader />}
      {/* < NewSimulationControls  
        translation={translation}
        setTranslation={setTranslation}
        rotation={rotation}
        setRotation={setRotation}
        scale={scale}
        setScale={setScale}
        /> */}
      <SimulationControls
        translation={translation}
        setTranslation={setTranslation}
        rotation={rotation}
        setRotation={setRotation}
        scale={scale}
        setScale={setScale}
      />
      <Canvas camera={{ position: [0, 100, 130], fov: 50 }}>
        {isRaining ? (
          <Sky sunPosition={[5, 1, 8]} inclination={0.6} azimuth={0.25} />
        ) : (
          <Sky sunPosition={[20, 50, 20]} />
        )}
        <Sky sunPosition={[20, 50, 20]} />
        {/* <ambientLight intensity={5} /> */}

        <ambientLight intensity={1.5} />
        <directionalLight
          castShadow
          position={[20, 50, 20]}
          intensity={3}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={500}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
        />

        <OrbitControls enabled={cameraMode === "free"} maxDistance={850} />
        {/* <axesHelper args={[20]} /> */}
        {/* {isRaining && <Rain />} */}
        {telemetryData && <MovingCar path={points} translation={translation} rotation={rotation} duration={lapDuration} scale={scale} />}
        <RaceTrack />
        {/* <Ground /> */}
        {telemetryData && isRacingLineVisible && <RacingLine points={points} translation={translation} rotation={rotation} scale={scale} />}
      </Canvas>
    </div>
  );
}

export default Simulation;
