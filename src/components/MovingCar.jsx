import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import useStore from "../utils/store";

const rotationAngleDegrees = 75;
const rotationAngleRadians = rotationAngleDegrees * (Math.PI / 180);

const rotationMatrix = new THREE.Matrix4();
rotationMatrix.makeRotationY(rotationAngleRadians);

function MovingCar({ path, translation, rotation, duration, scale }) {
  const carRef = useRef();
  const cameraRef = useRef();
  const elapsedTimeRef = useRef(0);
  const distanceTraveledRef = useRef(0);
  const { cameraMode, setCurrentLapTime, speedData, brakeData, setCurrentSpeed } = useStore();

  const customRotationMatrix = useMemo(() => {
    const matrix = new THREE.Matrix4();
    matrix.makeRotationFromEuler(new THREE.Euler(0, THREE.MathUtils.degToRad(rotation.y), 0));
    return matrix;
  }, [rotation.y]);

  const points = useMemo(
    () =>
      path.map((p) => {
        const vector = new THREE.Vector3(p.x * scale - 47.5, p.y * scale + 0, -p.z * scale + 19.5);
        vector.applyMatrix4(rotationMatrix);
        vector.applyMatrix4(customRotationMatrix);
        vector.add(new THREE.Vector3(translation.x, translation.y, translation.z));
        return new THREE.Vector3(vector.x, vector.y, vector.z);
      }),
    [path, customRotationMatrix, translation, scale]
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

  const brakeLightMaterial = useMemo(() => {
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color("darkred"),
      emissive: new THREE.Color("darkred"),
      emissiveIntensity: 0,
    });
    return material;
  }, []);

  useEffect(() => {
    const brakeLightLeft = carRef.current.getObjectByName("Brake_Light_Left");
    const brakeLightRight = carRef.current.getObjectByName("Brake_Light_Right");

    if (brakeLightLeft) {
      brakeLightLeft.material = brakeLightMaterial;
    }

    if (brakeLightRight) {
      brakeLightRight.material = brakeLightMaterial;
    }

    return () => {
      if (brakeLightLeft) {
        brakeLightLeft.material.dispose();
      }

      if (brakeLightRight) {
        brakeLightRight.material.dispose();
      }
    };
  }, [brakeLightMaterial]);

  function damp(current, target, lambda, delta) {
    return current + (target - current) * (1 - Math.exp(-lambda * delta));
  }

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

    if (cameraMode === "follow" && cameraRef.current) {
      const cameraOffset = 150;
      const cameraHeightOffset = 2;
      const cameraPointIndex = Math.max(0, (pointIndex - cameraOffset) % spacedPoints.length);
      const cameraPoint = spacedPoints[cameraPointIndex];

      cameraRef.current.position.lerp(cameraPoint, 0.1);
      cameraRef.current.position.y = cameraHeightOffset;

      state.camera.position.lerp(cameraRef.current.position, 0.1);
      state.camera.lookAt(carRef.current.position.x, cameraHeightOffset, carRef.current.position.z);
    }

    setCurrentLapTime(elapsedTimeRef.current);

    const brakeIntensity = brakeData[speedIndex] ? 3 : 0;
    brakeLightMaterial.emissiveIntensity = brakeIntensity;

    if (normalizedTime >= 1) {
      elapsedTimeRef.current = 0;
      distanceTraveledRef.current = 0;
    }
  });

  const gltf = useGLTF("/assets/f1_car.glb", true);

  return (
    <>
      <primitive ref={carRef} object={gltf.scene} scale={0.65} />
      <group ref={cameraRef} />
    </>
  );
}

export default MovingCar;
