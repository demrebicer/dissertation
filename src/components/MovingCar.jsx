import React, { useRef, useMemo, useEffect } from "react";
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

const adjustCoordinates = (coordinates) => {
  return coordinates.map((p) => {
    const vector = new THREE.Vector3(p[0] - 47.5, p[1] + 0.2, -p[2] + 19.5);
    vector.applyMatrix4(rotationMatrix);
    return [vector.x, vector.y, vector.z];
  });
};

function MovingCar({ driverName, path, color }) {
  const carRef = useRef();
  const cameraRef = useRef();

  // Sound effects
  const accelerationSoundRef = useRef();
  const cruiseSoundRef = useRef();
  const decelerationSoundRef = useRef();

  const { time, skipNextLap, setSkipNextLap, driversVisibility, selectedDriver, cameraMode, isSoundMuted, speedMultiplierOverride } =
    useStore((state) => state);

  const adjustedPath = useMemo(() => adjustCoordinates(path.map((p) => p.coordinates)), [path]);

  const gltf = useGLTF("/assets/f1_car.glb", true);

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
    const currentTimestamp = time;
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
  
      carRef.current.position.set(x, y, z);
  
      // Adjust car orientation
      const forwardDirection = new THREE.Vector3(
        adjustedPath[nextIndex][0] - adjustedPath[prevIndex][0],
        adjustedPath[nextIndex][1] - adjustedPath[prevIndex][1],
        adjustedPath[nextIndex][2] - adjustedPath[prevIndex][2],
      ).normalize();
      const targetQuaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), forwardDirection);
      carRef.current.quaternion.slerp(targetQuaternion, 0.1);
  
      if (cameraMode === "follow" && cameraRef.current && selectedDriver === driverName) {
        const cameraOffsetDistance = 5;
        const cameraHeight = 2; // Sabit yükseklik
        const cameraPosition = new THREE.Vector3().copy(carRef.current.position)
          .add(forwardDirection.multiplyScalar(-cameraOffsetDistance))
          .setY(cameraHeight); // Sabit yükseklik kullanımı
  
        cameraRef.current.position.lerp(cameraPosition, 0.05); // Daha yumuşak geçiş için lerp faktörü
  
        state.camera.position.lerp(cameraRef.current.position, 0.05); // Daha yumuşak geçiş için lerp faktörü
        state.camera.lookAt(carRef.current.position.x, cameraHeight, carRef.current.position.z); // Sabit yükseklikle bakış noktası
      }
  
      if (cameraMode === "tv" && carRef.current && selectedDriver === driverName) {
        const cameraPosition = new THREE.Vector3().copy(carRef.current.position);
        cameraPosition.y = 5; // Sabit yükseklik
        cameraPosition.z -= 10;
        state.camera.position.copy(cameraPosition);
        state.camera.lookAt(carRef.current.position);
      }
  
      // Handle sound playback based on RPM data and isSoundMuted flag
      if (selectedDriver === driverName) {
        // Ensure sound only for selected driver
        const currentRpm = (prevPoint.RPM + nextPoint.RPM) / 2;
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
  
      const wheelRotationSpeed = 10;
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
  
      // Adjust brake light intensity based on brake status
      const isBraking = prevPoint.Brake || nextPoint.Brake;
      applyBrakeLightIntensity(carRef.current, isBraking ? 5 : 0);
    }
  });
  

  const isVisible = !driversVisibility.includes(driverName);

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
  };

  const applyColorToBase = (gltfScene, color) => {
    const baseMesh = gltfScene.getObjectByName("Base");
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

  const clonedScene = useMemo(() => {
    if (gltf.scene) {
      const scene = gltf.scene.clone();
      applyColorToBase(scene, color);
      applyBrakeLightIntensity(scene, 0); // Initialize with brake light off
      const opacity = selectedDriver === driverName ? 1 : 0.2;
      adjustOpacity(scene, opacity);
      return scene;
    }
  }, [gltf.scene, color, selectedDriver]);

  return (
    <group ref={carRef} visible={isVisible} position={[0, 0, 0]}>
      {clonedScene && <primitive object={clonedScene} scale={0.65} />}
      <group ref={cameraRef} />

      {isVisible && (
        <Html distanceFactor={8} position={[0, 1.5, 0]}>
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
            }}
          >
            {driverName}
          </div>
        </Html>
      )}
    </group>
  );
}

useGLTF.preload("/assets/f1_car.glb");

export default MovingCar;
