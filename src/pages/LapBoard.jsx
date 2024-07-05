import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Box as DreiBox, OrbitControls, Sky, Html } from "@react-three/drei";
import axios from "axios";
import RaceTrack from "../components/RaceTrack";

import PositionsTable from "../components/PositionsTable";

export default function LapBoard() {
  return (
    <div className="homepage">
      <PositionsTable />

      <Canvas camera={{ position: [0, 200, 300], fov: 50 }}>
        <ambientLight intensity={2} />
        <directionalLight
          castShadow
          position={[20, 50, 20]}
          intensity={3}
          shadow-mapSize-width={512}
          shadow-mapSize-height={512}
          shadow-camera-far={500}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
        />

        <RaceTrack />

        <Sky sunPosition={[20, 50, 20]} />
        <OrbitControls maxDistance={850} />
      </Canvas>
    </div>
  );
}
