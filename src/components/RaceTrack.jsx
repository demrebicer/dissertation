import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";

function RaceTrack() {
  const modelRef = useRef();
  const gltf = useGLTF("/assets/track.glb", true);
  gltf.scene.scale.set(0.25, 0.25, 0.25);

  gltf.scene.traverse((node) => {
    if (node.isMesh) {
      node.receiveShadow = true;
    }

    if (node.isMesh && node.name !== "terrain") {
      node.castShadow = true;
    }
  });

  return <primitive ref={modelRef} object={gltf.scene} />;
}

export default RaceTrack;
