import React, { useMemo, useRef } from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";

function RacingLine({ points, translation, rotation }) {
  const lineRef = useRef();

  const rotationAngleDegrees = 74;
  const rotationAngleRadians = rotationAngleDegrees * (Math.PI / 180);

  const rotationMatrix = new THREE.Matrix4();
  rotationMatrix.makeRotationY(rotationAngleRadians);

  const customRotationMatrix = new THREE.Matrix4();
  customRotationMatrix.makeRotationFromEuler(new THREE.Euler(
    0,
    THREE.MathUtils.degToRad(rotation.y),
    0
  ));

  const rotatedVertices = useMemo(
    () =>
      points.map((p) => {
        const vector = new THREE.Vector3(p.x - 47.5, p.y + 0.1, -p.z + 19.5);
        vector.applyMatrix4(rotationMatrix);
        vector.applyMatrix4(customRotationMatrix);
        vector.add(new THREE.Vector3(translation.x, translation.y, translation.z));
        return vector;
      }),
    [points, rotationMatrix, customRotationMatrix, translation]
  );

  return <Line ref={lineRef} points={rotatedVertices} color={"red"} lineWidth={5} />;
}

export default RacingLine;