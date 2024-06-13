import React from "react";

function Ground() {
  return (
    <mesh position={[0, -50.5, 0]} receiveShadow>
      <boxGeometry attach="geometry" args={[1000, 100, 1000]} />
      <meshStandardMaterial attach="material" color="#5C875A" flatShading roughness={1} metalness={0} />
    </mesh>
  );
}

export default Ground;
