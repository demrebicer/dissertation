import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import axios from "axios";
import RaceTrack from "../components/RaceTrack";
import accurateInterval from "accurate-interval";

const rotationAngleDegrees = 75;
const rotationAngleRadians = rotationAngleDegrees * (Math.PI / 180);
const rotationMatrix = new THREE.Matrix4().makeRotationY(rotationAngleRadians);

const adjustCoordinates = (coordinates) => {
  return coordinates.map((p) => {
    const vector = new THREE.Vector3(p[0] - 47.5, p[1] + 0.2, -p[2] + 19.5);
    vector.applyMatrix4(rotationMatrix);
    return [vector.x, vector.y, vector.z];
  });
};

const Car = React.memo(({ driverName, path, color, sessionTime }) => {
  const mesh = useRef();

  const adjustedPath = useMemo(() => adjustCoordinates(path.map((p) => p.coordinates)), [path, adjustCoordinates]);

  useFrame(() => {
    const currentTimestamp = sessionTime;
    let nextPoint = null;
    let prevPoint = null;

    for (let i = 1; i < path.length; i++) {
      if (path[i].timestamp > currentTimestamp) {
        nextPoint = path[i];
        prevPoint = path[i - 1];
        break;
      }
    }

    if (nextPoint && prevPoint) {
      const prevIndex = path.indexOf(prevPoint);
      const nextIndex = path.indexOf(nextPoint);

      const progress = (currentTimestamp - prevPoint.timestamp) / (nextPoint.timestamp - prevPoint.timestamp);

      const x = adjustedPath[prevIndex][0] + (adjustedPath[nextIndex][0] - adjustedPath[prevIndex][0]) * progress;
      const y = adjustedPath[prevIndex][1] + (adjustedPath[nextIndex][1] - adjustedPath[prevIndex][1]) * progress;
      const z = adjustedPath[prevIndex][2] + (adjustedPath[nextIndex][2] - adjustedPath[prevIndex][2]) * progress;

      mesh.current.position.set(x, y, z);
    }
  });

  return (
    <group ref={mesh} position={[0, 0, 0]}>
      <mesh>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Html distanceFactor={10} position={[0, 1.5, 0]}>
        <div
          style={{
            background: "rgba(0, 0, 0, 0.5)",
            padding: "5px 25px",
            fontSize: "48px",
            color: "white",
            borderRadius: "5px",
            boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
            transform: "translate3d(-50%, -50%, 0)",
            whiteSpace: "nowrap",
            zIndex: 0,
          }}
        >
          {driverName}
        </div>
      </Html>
    </group>
  );
});

const Test = () => {
  const [sessionTime, setSessionTime] = useState(3740);
  const [loading, setLoading] = useState(true);
  const [carsData, setCarsData] = useState([]);

  const fetchCalled = useRef(false);

  const fetchTelemetryData = useCallback(async (year, type) => {
    try {
      const response = await axios.get("http://localhost:8000/test/2021/R");
      setCarsData(response.data.cars);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);

  useEffect(() => {
    if (!fetchCalled.current) {
      console.log("Fetch");
      fetchTelemetryData(2021, "R");
      fetchCalled.current = true;
    }
  }, [fetchTelemetryData]);

  useEffect(() => {
    let interval;
    if (!loading) {
      interval = accurateInterval(() => {
        setSessionTime((prev) => prev + 0.02); // Daha az sıklıkta güncelleme
      }, 20); // Her 20 milisaniyede bir güncelleme
    }

    return () => {
      if (interval) interval.clear();
    };
  }, [loading]);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          padding: "10px",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          zIndex: 1,
        }}
      >
        Session Time: {sessionTime.toFixed(2)}s
      </div>
      <Canvas camera={{ position: [0, 200, 300], fov: 50 }}>
        <ambientLight intensity={5} />
        <pointLight position={[10, 10, 10]} />
        {carsData.map((car, index) => (
          <Car key={car.id} driverName={car.id} path={car.path} color={index === 0 ? "red" : "blue"} sessionTime={sessionTime} />
        ))}
        <RaceTrack />
        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default Test;
