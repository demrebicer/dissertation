import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Box as DreiBox, OrbitControls, Sky, Html } from "@react-three/drei";
import axios from "axios";
import SimulationControls from "../components/SimulationControls";
import RaceTrack from "../components/RaceTrack";
import FullPageLoader from "../components/FullPageLoader";

function randomColor() {
  return `hsl(${Math.random() * 360}, 100%, 50%)`;
}

function MovingBox({ driverName, path, duration, speedData, color }) {
  console.log(driverName);
  const meshRef = useRef();
  const elapsedTimeRef = useRef(0);
  const distanceTraveledRef = useRef(0);

  const rotationAngleDegrees = 75;
  const rotationAngleRadians = rotationAngleDegrees * (Math.PI / 180);
  const rotationMatrix = new THREE.Matrix4().makeRotationY(rotationAngleRadians);

  const points = useMemo(
    () =>
      path.map((p) => {
        const vector = new THREE.Vector3(p[0] - 47.5, p[1] + 1, -p[2] + 19.5);
        vector.applyMatrix4(rotationMatrix);
        return vector;
      }),
    [path]
  );

  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);
  const spacedPoints = useMemo(() => curve.getSpacedPoints(15000), [curve]);

  const distances = useMemo(() => {
    let totalDistance = 0;
    return spacedPoints.map((point, index) => {
      if (index === 0) return 0;
      totalDistance += point.distanceTo(spacedPoints[index - 1]);
      return totalDistance;
    });
  }, [spacedPoints]);

  const totalDistance = distances[distances.length - 1];
  const averageSpeed = totalDistance / duration;

  const adjustedSpeedData = useMemo(() => {
    const totalSpeed = speedData.reduce((acc, speed) => acc + speed, 0);
    const speedMultiplier = averageSpeed / (totalSpeed / speedData.length);
    return speedData.map((speed) => speed * speedMultiplier);
  }, [speedData, averageSpeed]);

  useFrame((state, delta) => {
    elapsedTimeRef.current += delta;

    if (elapsedTimeRef.current >= duration) {
      elapsedTimeRef.current = 0;
      distanceTraveledRef.current = 0;
    }

    const normalizedTime = elapsedTimeRef.current / duration;
    const speedIndex = Math.min(Math.floor(normalizedTime * adjustedSpeedData.length), adjustedSpeedData.length - 1);
    const currentSpeed = adjustedSpeedData[speedIndex];

    const distanceTraveledInFrame = currentSpeed * delta;
    distanceTraveledRef.current += distanceTraveledInFrame;
    const distanceTraveled = Math.min(distanceTraveledRef.current, totalDistance);

    let pointIndex = distances.findIndex((distance) => distance >= distanceTraveled);
    if (pointIndex === -1) pointIndex = distances.length - 1;

    const pointOnCurve = spacedPoints[pointIndex];
    const nextPointOnCurve = spacedPoints[(pointIndex + 1) % spacedPoints.length];

    meshRef.current.position.copy(pointOnCurve);

    const forwardDirection = new THREE.Vector3().subVectors(nextPointOnCurve, pointOnCurve).normalize();
    const targetQuaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), forwardDirection);

    meshRef.current.quaternion.slerp(targetQuaternion, 0.1);
  });

  return (
    <DreiBox ref={meshRef} args={[1, 1, 1]} position={[points[0].x, points[0].y, points[0].z]}>
      <meshStandardMaterial attach="material" color={color} />
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
    </DreiBox>
  );
}

export default function Test() {
  const [telemetryData, setTelemetryData] = useState({});
  const [loading, setLoading] = useState(true);
  const requestMade = useRef(false);

  useEffect(() => {
    const fetchTelemetryData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/all-telemetry/2021/R/1');  // Update URL accordingly
        setTelemetryData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching telemetry data', error);
      }
    };

    if (!requestMade.current) {
      requestMade.current = true;
      fetchTelemetryData();
    }
  }, []);

  return (
    <div className="homepage">
      {loading && <FullPageLoader />}

      <Canvas camera={{ position: [0, 200, 300], fov: 50 }}>
        <ambientLight intensity={2} />
        <directionalLight
          castShadow
          position={[20, 50, 20]}
          intensity={3}
          shadow-mapSize-width={512}
          shadow-mapSize-height={512}
          shadow-camera-far={500}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
        />

        <RaceTrack />

        {Object.keys(telemetryData).map((driverCode) => (
          <MovingBox
            key={driverCode}
            driverName={driverCode}
            path={telemetryData[driverCode].telemetry}
            speedData={telemetryData[driverCode].speed}
            duration={telemetryData[driverCode].lap_duration / 3}
            color={randomColor()}
          />
        ))}

        <Sky sunPosition={[20, 50, 20]} />
        <OrbitControls maxDistance={850} />
      </Canvas>
    </div>
  );
}
