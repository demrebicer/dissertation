import React, { useRef, useState, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Html, useGLTF } from "@react-three/drei";
import { useStore } from "../utils/store";

import AccelerationSound from "../assets/sounds/acceleration.mp3";
import CruiseSound from "../assets/sounds/cruise.mp3";
import DecelerationSound from "../assets/sounds/deceleration.mp3";

const rotationAngleDegrees = 75;
const rotationAngleRadians = rotationAngleDegrees * (Math.PI / 180);
const rotationMatrix = new THREE.Matrix4().makeRotationY(rotationAngleRadians);

function MovingCar({ driverName, laps, color }) {
  const carRef = useRef();
  const cameraRef = useRef();
  const elapsedTimeRef = useRef(0);
  const distanceTraveledRef = useRef(0);
  const lapIndexRef = useRef(0);

  // Sound effects
  const accelerationSoundRef = useRef();
  const cruiseSoundRef = useRef();
  const decelerationSoundRef = useRef();

  const [currentLapData, setCurrentLapData] = useState(laps[lapIndexRef.current]);
  const [points, setPoints] = useState([]);
  const [spacedPoints, setSpacedPoints] = useState([]);
  const [distances, setDistances] = useState([]);
  const [adjustedSpeedData, setAdjustedSpeedData] = useState([]);
  const brakeData = useMemo(() => currentLapData?.Telemetry?.Brake || [], [currentLapData]);

  const gltf = useGLTF('/assets/f1_car.glb', true);

  const {
    time,
    skipNextLap,
    setSkipNextLap,
    driversVisibility,
    selectedDriver,
    cameraMode,
    isSoundMuted,
    speedMultiplierOverride,
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
      const newPoints = currentLapData.Telemetry.GPS_Coordinates.map((p) => {
        const vector = new THREE.Vector3(p[0] - 47.5, p[1] - 0.055, -p[2] + 19.5);
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

      const adjustedLapDuration = currentLapData.LapDuration / speedMultiplierOverride; // Adjust the lap duration
  
      const averageSpeed = totalDistance / adjustedLapDuration;

      const totalSpeed = currentLapData.Telemetry.Speed.reduce((acc, speed) => acc + speed, 0);
      const speedMultiplier = averageSpeed / (totalSpeed / currentLapData.Telemetry.Speed.length);
      const newAdjustedSpeedData = currentLapData.Telemetry.Speed.map((speed) => speed * speedMultiplier);

      setPoints(newPoints);
      setSpacedPoints(newSpacedPoints);
      setDistances(newDistances);
      setAdjustedSpeedData(newAdjustedSpeedData);
    }
  }, [currentLapData]);

  useEffect(() => {
    const listener = new THREE.AudioListener();
    if (carRef.current) {
      carRef.current.add(listener);
    }

    const accelerationSound = new THREE.Audio(listener);
    const cruiseSound = new THREE.Audio(listener);
    const decelerationSound = new THREE.Audio(listener);

    const audioLoader = new THREE.AudioLoader();
    audioLoader.load(AccelerationSound, (buffer) => {
      accelerationSound.setBuffer(buffer);
      accelerationSound.setLoop(true);
      accelerationSound.setVolume(0.5);
    });
    audioLoader.load(CruiseSound, (buffer) => {
      cruiseSound.setBuffer(buffer);
      cruiseSound.setLoop(true);
      cruiseSound.setVolume(0.5);
    });
    audioLoader.load(DecelerationSound, (buffer) => {
      decelerationSound.setBuffer(buffer);
      decelerationSound.setLoop(true);
      decelerationSound.setVolume(0.5);
    });

    accelerationSoundRef.current = accelerationSound;
    cruiseSoundRef.current = cruiseSound;
    decelerationSoundRef.current = decelerationSound;

    return () => {
      accelerationSound.stop();
      cruiseSound.stop();
      decelerationSound.stop();
    };
  }, []);

  useFrame((state, delta) => {
    if (!currentLapData || !points.length) return;

    const currentSessionTime = time - currentLapData.LapStartTime;

    if (currentSessionTime < 0) {
      return;
    }

    if (skipNextLap) {
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

      carRef.current.position.copy(pointOnCurve);

      const forwardDirection = new THREE.Vector3().subVectors(nextPointOnCurve, pointOnCurve).normalize();
      const targetQuaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), forwardDirection);

      carRef.current.quaternion.slerp(targetQuaternion, 0.1);

      const wheelRotationSpeed = currentSpeed / 1;
      const wheelRotation = delta * wheelRotationSpeed;

      const frontRightWheel = carRef.current.getObjectByName("Front_Right");
      const frontLeftWheel = carRef.current.getObjectByName("Front_Left");
      const backRightWheel = carRef.current.getObjectByName("Back_Right");
      const backLeftWheel = carRef.current.getObjectByName("Back_Left");

      if (frontRightWheel) {
        frontRightWheel.rotateZ(wheelRotation);
      }

      if (frontLeftWheel) {
        frontLeftWheel.rotateZ(wheelRotation);
      }

      if (backRightWheel) {
        backRightWheel.rotateZ(wheelRotation);
      }

      if (backLeftWheel) {
        backLeftWheel.rotateZ(wheelRotation);
      }

      const brakeIntensity = brakeData[speedIndex] ? 3 : 0;
      brakeLightMaterial.emissiveIntensity = brakeIntensity;

      if (cameraMode === "follow" && cameraRef.current && selectedDriver === driverName) {
        const cameraOffset = 150;
        const cameraHeightOffset = 2;
        const cameraPointIndex = Math.max(0, (pointIndex - cameraOffset) % spacedPoints.length);
        const cameraPoint = spacedPoints[cameraPointIndex];
  
        cameraRef.current.position.lerp(cameraPoint, 0.1);
        cameraRef.current.position.y = cameraHeightOffset;
  
        state.camera.position.lerp(cameraRef.current.position, 0.1);
        state.camera.lookAt(carRef.current.position.x, cameraHeightOffset, carRef.current.position.z);
      }

      if (cameraMode === "tv" && carRef.current && selectedDriver === driverName) {
        const cameraPosition = new THREE.Vector3().copy(carRef.current.position);
        cameraPosition.y += 5; //5
        cameraPosition.z -= 10; //10
        state.camera.position.copy(cameraPosition);
        state.camera.lookAt(carRef.current.position);
      }

      // Handle sound playback based on RPM data and isSoundMuted flag
      if (selectedDriver === driverName) { // Ensure sound only for selected driver
        const currentRpm = currentLapData?.Telemetry?.RPM[speedIndex] || 0;
        if (!isSoundMuted && currentRpm > 0) {
          if (currentRpm > 9000) {
            if (!accelerationSoundRef.current.isPlaying) {
              accelerationSoundRef.current.play();
              cruiseSoundRef.current.stop();
              decelerationSoundRef.current.stop();
            }
          } else if (currentRpm > 4000) {
            if (!cruiseSoundRef.current.isPlaying) {
              cruiseSoundRef.current.play();
              accelerationSoundRef.current.stop();
              decelerationSoundRef.current.stop();
            }
          } else {
            if (!decelerationSoundRef.current.isPlaying) {
              decelerationSoundRef.current.play();
              accelerationSoundRef.current.stop();
              cruiseSoundRef.current.stop();
            }
          }
        } else {
          accelerationSoundRef.current.stop();
          cruiseSoundRef.current.stop();
          decelerationSoundRef.current.stop();
        }
      } else {
        accelerationSoundRef.current.stop();
        cruiseSoundRef.current.stop();
        decelerationSoundRef.current.stop();
      }
    }
  });

  const brakeLightMaterial = useMemo(() => {
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color("darkred"),
      emissive: new THREE.Color("darkred"),
      emissiveIntensity: 0,
    });
    return material;
  }, []);

  const applyBrakeLightIntensity = (gltfScene, intensity) => {
    const brakeLight = gltfScene.getObjectByName("Brake_Light");
    if (brakeLight) {
      brakeLight.material = brakeLightMaterial;
      brakeLight.material.emissiveIntensity = intensity;
    }
  }

  const applyColorToBase = (gltfScene, color) => {
    const baseMesh = gltfScene.getObjectByName('Base');
    if (baseMesh) {
      baseMesh.material = baseMesh.material.clone(); // Clone the material to ensure each car has a unique material
      baseMesh.material.color = new THREE.Color(color);
    }
  };

  const adjustOpacity = (gltfScene, opacity) => {
    gltfScene.traverse((child) => {
      if (child.material) {
        child.material = child.material.clone();
        child.material.transparent = true;
        child.material.opacity = opacity;
      }
    });
  };

  useEffect(() => {
    if (gltf.scene) {
      const clonedScene = gltf.scene.clone();
      applyColorToBase(clonedScene, color);
      applyBrakeLightIntensity(clonedScene, 5);
      const opacity = selectedDriver === driverName ? 1 : 0.2;
      adjustOpacity(clonedScene, opacity);
    }
  }, [gltf, color, brakeLightMaterial, selectedDriver, driverName]);

  if (!currentLapData || !points.length) {
    return null;
  }

  const isVisible = !driversVisibility.includes(driverName);

  const clonedScene = gltf.scene.clone();
  applyColorToBase(clonedScene, color);
  applyBrakeLightIntensity(clonedScene, 5);
  const opacity = selectedDriver === driverName ? 1 : 0.2;
  adjustOpacity(clonedScene, opacity);

  return (
    <group ref={carRef} visible={isVisible} position={[points[0]?.x || 0, points[0]?.y || 0, points[0]?.z || 0]}>
      <primitive object={clonedScene} scale={0.65}/>
      <group ref={cameraRef} />

      {isVisible && (
        <Html distanceFactor={10} position={[0, 1.5, 0]}>
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.5)',
              padding: '5px 25px',
              fontSize: '48px',
              color: 'white',
              borderRadius: '5px',
              boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
              transform: 'translate3d(-50%, -50%, 0)',
              whiteSpace: 'nowrap',
              zIndex: 0,
            }}
          >
            {driverName}
          </div>
        </Html>
      )}
    </group>
  );
}

useGLTF.preload('/assets/f1_car.glb');

export default MovingCar;
