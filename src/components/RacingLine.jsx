import React, { useEffect, useRef, useState } from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";

function RacingLine({ driverName, color, laps, translation, rotation, scale }) {
  const lapIndexRef = useRef(0);
  const lineRef = useRef();
  const elapsedTimeRef = useRef(0);
  const distanceTraveledRef = useRef(0);

  const [currentLapData, setCurrentLapData] = useState(laps[lapIndexRef.current]);


  const rotationAngleDegrees = 74;
  const rotationAngleRadians = rotationAngleDegrees * (Math.PI / 180);

  const rotationMatrix = new THREE.Matrix4();
  rotationMatrix.makeRotationY(rotationAngleRadians);

  useEffect(() => {
    if (laps[lapIndexRef.current]) {
      setCurrentLapData(laps[lapIndexRef.current]);
      elapsedTimeRef.current = 0;
      distanceTraveledRef.current = 0;
    }
  }, [laps]);

  const customRotationMatrix = new THREE.Matrix4();
  customRotationMatrix.makeRotationFromEuler(new THREE.Euler(0, THREE.MathUtils.degToRad(rotation.y), 0));

  const newPoints = currentLapData.Telemetry.GPS_Coordinates.map((p) => {
    const vector = new THREE.Vector3(p[0] * scale - 47.5, p[1] * scale + 0.1, -p[2] * scale + 19.5);
    vector.applyMatrix4(rotationMatrix);
    vector.applyMatrix4(customRotationMatrix); 
    vector.add(new THREE.Vector3(translation.x, translation.y, translation.z));
    return vector;
  });

  return <Line ref={lineRef} points={newPoints} color={color} lineWidth={3} />;
}

export default RacingLine;
