import React, { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls, Sky } from "@react-three/drei";
import Ground from "../components/Ground";
import RaceTrack from "../components/RaceTrack";

function Rain() {
  const rainRef = useRef();
  const count = 5000;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 850; // X position spread
    positions[i * 3 + 1] = Math.random() * 500;     // Y position higher
    positions[i * 3 + 2] = (Math.random() - 0.5) * 850; // Z position spread
  }

  useFrame(() => {
    if (rainRef.current) {
      const positions = rainRef.current.geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] -= 2; // Faster fall
        if (positions[i * 3 + 1] < -50) { // Allow falling below ground level
          positions[i * 3 + 1] = 500; // Reset position higher
        }
      }
      rainRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={rainRef}>
      <bufferGeometry attach="geometry">
        <bufferAttribute attach="attributes-position" array={positions} itemSize={3} count={count} />
      </bufferGeometry>
      <pointsMaterial attach="material" color="blue" size={3} sizeAttenuation={false} />
    </points>
  );
}

export default function TestRain() {
  return (
    <div className="homepage">
      <Canvas camera={{ position: [0, 200, 300], fov: 50 }}> {/* Move camera back */}
        <ambientLight intensity={3} />
        <pointLight position={[100, 100, 100]} />
        <Rain />
        {/* <Ground /> */}
        <RaceTrack />

        <Sky distance={450000} sunPosition={[5, 1, 8]} inclination={0.6} azimuth={0.25} />
        <OrbitControls maxDistance={850} />
      </Canvas>
    </div>
  );
}
