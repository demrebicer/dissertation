import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";

function RaceTrack() {
  const modelRef = useRef();
  const gltf = useGLTF("/assets/track.glb", true);
  gltf.scene.scale.set(0.25, 0.25, 0.25);

  return <primitive ref={modelRef} object={gltf.scene} />;
}

export default RaceTrack;
