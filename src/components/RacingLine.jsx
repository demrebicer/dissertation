import React, { useMemo, useRef } from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";

function RacingLine({ points }) {
  const lineRef = useRef();

  const rotationAngleDegrees = 74;
  const rotationAngleRadians = rotationAngleDegrees * (Math.PI / 180);

  const rotationMatrix = new THREE.Matrix4();
  rotationMatrix.makeRotationY(rotationAngleRadians);

  const rotatedVertices = useMemo(
    () =>
      points.map((p) => {
        const vector = new THREE.Vector3(p.x - 47.5, p.y + 1, -p.z + 19.5);
        vector.applyMatrix4(rotationMatrix);
        return vector;
      }),
    [points, rotationMatrix]
  );

  return <Line ref={lineRef} points={rotatedVertices} color={"red"} lineWidth={5} />;
}

export default RacingLine;
