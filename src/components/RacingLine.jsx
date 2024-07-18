import React, { useRef, useMemo } from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { useStore } from "../utils/store";

function RacingLine({ driverName, path, color, translation, rotation, scale }) {
  const lapIndexRef = useRef(0);
  const lineRef = useRef();
  const elapsedTimeRef = useRef(0);
  const distanceTraveledRef = useRef(0);

  const { lapsData, startTime, currentLap } = useStore();

  const filteredLapsData = lapsData.filter(
    (lap) => lap.DriverName === driverName && lap.NumberOfLaps === currentLap
  );
  const lapStartTime =
    currentLap === 1
      ? startTime
      : lapsData.filter(
          (lap) =>
            lap.DriverName === driverName && lap.NumberOfLaps === currentLap - 1
        )[0].Time;
  const lapEndTime = filteredLapsData[0].Time;

  const filteredPath = path.filter(
    (point) => point.timestamp >= lapStartTime && point.timestamp <= lapEndTime
  );

  const rotationAngleDegrees = 75;
  const rotationAngleRadians = rotationAngleDegrees * (Math.PI / 180);
  const rotationMatrix = new THREE.Matrix4().makeRotationY(rotationAngleRadians);

  const customRotationMatrix = useMemo(() => {
    const matrix = new THREE.Matrix4();
    matrix.makeRotationFromEuler(new THREE.Euler(0, THREE.MathUtils.degToRad(rotation.y), 0));
    return matrix;
  }, [rotation.y]);

  const adjustCoordinates = (coordinates) => {
    return coordinates.map((p) => {
      const vector = new THREE.Vector3(p[0] * scale - 47.5, p[1] * scale + 0.2, -p[2] * scale + 19.5);
      vector.applyMatrix4(rotationMatrix);
      vector.applyMatrix4(customRotationMatrix);
      vector.add(new THREE.Vector3(translation.x, translation.y, translation.z));
      return new THREE.Vector3(vector.x, vector.y, vector.z);
    });
  };

  const points = adjustCoordinates(filteredPath.map((p) => p.coordinates));

  return (
    <Line ref={lineRef} points={points} color={color} lineWidth={3} />
  );
}

export default RacingLine;
