import React from "react";

function Ground() {
  return (
    <mesh position={[-15, -0.5, 15]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry attach="geometry" args={[120, 120]} />
      <meshStandardMaterial attach="material" color="#5C875A" flatShading roughness={1} metalness={0} />
    </mesh>
  );
}

export default Ground;
