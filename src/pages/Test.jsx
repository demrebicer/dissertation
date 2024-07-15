import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { data } from '../utils/constants'; // JSON verisini ve sabitleri buradan import edin
import RaceTrack from '../components/RaceTrack';

const rotationAngleDegrees = 75;
const rotationAngleRadians = rotationAngleDegrees * (Math.PI / 180);
const rotationMatrix = new THREE.Matrix4().makeRotationY(rotationAngleRadians);

const adjustCoordinates = (coordinates) => {
  return coordinates.map((p) => {
    const vector = new THREE.Vector3(p[0] - 47.5, p[1] - 0.055, -p[2] + 19.5);
    vector.applyMatrix4(rotationMatrix);
    return [vector.x, vector.y, vector.z];
  });
};

const Car = ({ path, color, sessionTime }) => {
  const mesh = useRef();

  const adjustedPath = adjustCoordinates(path.map(p => p.coordinates));

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
    <mesh ref={mesh} position={[0, 0, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

const Test = () => {
  const [sessionTime, setSessionTime] = useState(3740);

  useEffect(() => {
    const interval = setInterval(() => {
      setSessionTime((prevTime) => prevTime + 0.01); // Daha sık güncelleme
    }, 10); // Her 10 milisaniyede bir güncelleme
    return () => clearInterval(interval);
  }, []);

  const carsData = data.cars;

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, padding: '10px', backgroundColor: 'rgba(255, 255, 255, 0.8)', zIndex: 1
      }}>
        Session Time: {sessionTime.toFixed(2)}s
      </div>
      <Canvas>
        <ambientLight intensity={5}/>
        <pointLight position={[10, 10, 10]} />
        {carsData.map((car, index) => (
          <Car key={car.id} path={car.path} color={index === 0 ? 'red' : 'blue'} sessionTime={sessionTime} />
        ))}
        <RaceTrack />
        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default Test;
