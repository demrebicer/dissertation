import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import useStore from "../utils/store";

import AccelerationSound from "../assets/sounds/acceleration.mp3";
import CruiseSound from "../assets/sounds/cruise.mp3";
import DecelerationSound from "../assets/sounds/deceleration.mp3";

function MovingCar({ path, translation, rotation, duration, scale }) {
  const carRef = useRef();
  const elapsedTimeRef = useRef(0);
  const distanceTraveledRef = useRef(0);
  const { cameraMode, setCurrentLapTime, speedData, brakeData, setCurrentSpeed, rpmData } = useStore();

  const rotationAngleDegrees = 75;
  const rotationAngleRadians = rotationAngleDegrees * (Math.PI / 180);

  const rotationMatrix = new THREE.Matrix4();
  rotationMatrix.makeRotationY(rotationAngleRadians);

  const customRotationMatrix = new THREE.Matrix4();
  customRotationMatrix.makeRotationFromEuler(new THREE.Euler(0, THREE.MathUtils.degToRad(rotation.y), 0));

  const points = useMemo(
    () =>
      path.map((p) => {
        const vector = new THREE.Vector3(p.x * scale - 47.5, p.y * scale + 0, -p.z * scale + 19.5);
        vector.applyMatrix4(rotationMatrix);
        vector.applyMatrix4(customRotationMatrix);
        vector.add(new THREE.Vector3(translation.x, translation.y, translation.z));
        return new THREE.Vector3(vector.x, vector.y, vector.z);
      }),
    [path, rotationMatrix, customRotationMatrix, translation]
  );

  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);
  const spacedPoints = useMemo(() => curve.getSpacedPoints(5000), [curve]);

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

  const brakeLightMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("darkred"),
        emissive: new THREE.Color("darkred"),
        emissiveIntensity: 0,
      }),
    []
  );

  useEffect(() => {
    const brakeLightLeft = carRef.current.getObjectByName("Brake_Light_Left");
    const brakeLightRight = carRef.current.getObjectByName("Brake_Light_Right");

    if (brakeLightLeft) {
      brakeLightLeft.material = brakeLightMaterial;
    }

    if (brakeLightRight) {
      brakeLightRight.material = brakeLightMaterial;
    }
  }, [brakeLightMaterial]);

  // Sound effects
  const accelerationSoundRef = useRef();
  const cruiseSoundRef = useRef();
  const decelerationSoundRef = useRef();

  useEffect(() => {
    const listener = new THREE.AudioListener();
    carRef.current.add(listener);

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
    elapsedTimeRef.current += delta;
    const normalizedTime = elapsedTimeRef.current / duration;
    const speedIndex = Math.min(Math.floor(normalizedTime * adjustedSpeedData.length), adjustedSpeedData.length - 1);
    const currentSpeed = adjustedSpeedData[speedIndex];
    setCurrentSpeed(speedData[speedIndex]);

    const distanceTraveledInFrame = currentSpeed * delta;
    distanceTraveledRef.current += distanceTraveledInFrame;
    const distanceTraveled = Math.min(distanceTraveledRef.current, totalDistance);
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
      frontRightWheel.rotateX(wheelRotation);
    }

    if (frontLeftWheel) {
      frontLeftWheel.rotateX(wheelRotation);
    }

    if (backRightWheel) {
      backRightWheel.rotateX(wheelRotation);
    }

    if (backLeftWheel) {
      backLeftWheel.rotateX(wheelRotation);
    }

    if (cameraMode === "follow" && carRef.current) {
      const cameraPosition = new THREE.Vector3().copy(carRef.current.position);
      cameraPosition.y += 5;
      cameraPosition.z -= 10;
      state.camera.position.copy(cameraPosition);
      state.camera.lookAt(carRef.current.position);
    }

    setCurrentLapTime(elapsedTimeRef.current);
    const brakeIntensity = brakeData[speedIndex] ? 3 : 0;
    brakeLightMaterial.emissiveIntensity = brakeIntensity;

    // Handle sound playback based on RPM data
    const currentRpm = rpmData[speedIndex];
    if (currentRpm > 9000) {
      if (!accelerationSoundRef.current.isPlaying) {
        accelerationSoundRef.current.play();
        cruiseSoundRef.current.stop();
        decelerationSoundRef.current.stop();
      }
    } else if (currentRpm > 5000) {
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

    if (normalizedTime >= 1) {
      elapsedTimeRef.current = 0;
      distanceTraveledRef.current = 0;
    }
  });

  const gltf = useGLTF("/assets/simplecar.glb", true);

  return <primitive ref={carRef} object={gltf.scene} scale={0.5} />;
}

export default MovingCar;
