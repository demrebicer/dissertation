import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Box as DreiBox, Html } from "@react-three/drei";
import { useStore } from "../utils/newStore";

function MovingBox({ driverName, laps, color }) {
  const meshRef = useRef();
  const elapsedTimeRef = useRef(0);
  const distanceTraveledRef = useRef(0);
  const lapIndexRef = useRef(0);
  const [currentLapData, setCurrentLapData] = useState(laps[lapIndexRef.current]);
  const [points, setPoints] = useState([]);
  const [spacedPoints, setSpacedPoints] = useState([]);
  const [distances, setDistances] = useState([]);
  const [adjustedSpeedData, setAdjustedSpeedData] = useState([]);

  const {
    time,
    skipNextLap,
    setSkipNextLap,
    driversVisibility
  } = useStore((state) => state);

  useEffect(() => {
    if (laps[lapIndexRef.current]) {
      setCurrentLapData(laps[lapIndexRef.current]);
      elapsedTimeRef.current = 0;
      distanceTraveledRef.current = 0;
    }
  }, [laps]);

  useEffect(() => {
    if (currentLapData && currentLapData.Telemetry) {
      const rotationAngleDegrees = 75;
      const rotationAngleRadians = rotationAngleDegrees * (Math.PI / 180);
      const rotationMatrix = new THREE.Matrix4().makeRotationY(rotationAngleRadians);

      const newPoints = currentLapData.Telemetry.GPS_Coordinates.map((p) => {
        const vector = new THREE.Vector3(p[0] - 47.5, p[1] + 1, -p[2] + 19.5);
        vector.applyMatrix4(rotationMatrix);
        return vector;
      });

      const curve = new THREE.CatmullRomCurve3(newPoints);
      const newSpacedPoints = curve.getSpacedPoints(15000);

      let totalDistance = 0;
      const newDistances = newSpacedPoints.map((point, index) => {
        if (index === 0) return 0;
        totalDistance += point.distanceTo(newSpacedPoints[index - 1]);
        return totalDistance;
      });

      const averageSpeed = totalDistance / currentLapData.LapDuration;

      const totalSpeed = currentLapData.Telemetry.Speed.reduce((acc, speed) => acc + speed, 0);
      const speedMultiplier = averageSpeed / (totalSpeed / currentLapData.Telemetry.Speed.length);
      const newAdjustedSpeedData = currentLapData.Telemetry.Speed.map((speed) => speed * speedMultiplier);

      setPoints(newPoints);
      setSpacedPoints(newSpacedPoints);
      setDistances(newDistances);
      setAdjustedSpeedData(newAdjustedSpeedData);
    }
  }, [currentLapData]);

  useFrame((state, delta) => {
    if (!currentLapData || !points.length) return;

    const currentSessionTime = time - currentLapData.LapStartTime;

    if (currentSessionTime < 0) {
      return;
    }

    if (skipNextLap) {
      elapsedTimeRef.current = currentLapData.LapDuration;
      distanceTraveledRef.current = distances[distances.length - 1];
      setSkipNextLap(false); // Reset the skip flag
    } else {
      elapsedTimeRef.current = currentSessionTime;

      if (elapsedTimeRef.current >= currentLapData.LapDuration) {
        lapIndexRef.current = (lapIndexRef.current + 1) % laps.length;

        if (lapIndexRef.current < laps.length) {
          setCurrentLapData(laps[lapIndexRef.current]);
          elapsedTimeRef.current = 0;
          distanceTraveledRef.current = 0;
        }
      }

      const normalizedTime = elapsedTimeRef.current / currentLapData.LapDuration;
      const speedIndex = Math.min(Math.floor(normalizedTime * adjustedSpeedData.length), adjustedSpeedData.length - 1);
      const currentSpeed = adjustedSpeedData[speedIndex];

      const distanceTraveledInFrame = currentSpeed * delta;
      distanceTraveledRef.current += distanceTraveledInFrame;
      const distanceTraveled = Math.min(distanceTraveledRef.current, distances[distances.length - 1]);

      let pointIndex = distances.findIndex((distance) => distance >= distanceTraveled);
      if (pointIndex === -1) pointIndex = distances.length - 1;

      const pointOnCurve = spacedPoints[pointIndex];
      const nextPointOnCurve = spacedPoints[(pointIndex + 1) % spacedPoints.length];

      meshRef.current.position.copy(pointOnCurve);

      const forwardDirection = new THREE.Vector3().subVectors(nextPointOnCurve, pointOnCurve).normalize();
      const targetQuaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), forwardDirection);

      meshRef.current.quaternion.slerp(targetQuaternion, 0.1);
    }
  });

  if (!currentLapData || !points.length) {
    return null;
  }

  const isVisible = !driversVisibility.includes(driverName);

  return (
    <DreiBox visible={isVisible} ref={meshRef} args={[1, 1, 1]} position={[points[0]?.x || 0, points[0]?.y || 0, points[0]?.z || 0]}>
      <meshStandardMaterial attach="material" color={color} />
      {isVisible && (
        <Html distanceFactor={10} position={[0, 1.5, 0]}>
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.5)',
              padding: '5px 25px',
              fontSize: '128px',
              color: 'white',
              borderRadius: '5px',
              boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
              transform: 'translate3d(-50%, -50%, 0)',
              whiteSpace: 'nowrap',
            }}
          >
            {driverName}
          </div>
        </Html>
      )}
    </DreiBox>
  );
}

export default MovingBox;

