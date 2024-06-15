import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import useStore from "../utils/store";

function MovingCar({ path, translation, rotation, duration }) {
  const carRef = useRef();
  const elapsedTimeRef = useRef(0);
  const distanceTraveledRef = useRef(0);
  const { cameraMode, setCurrentLapTime, speedData } = useStore();

  const rotationAngleDegrees = 75;
  const rotationAngleRadians = rotationAngleDegrees * (Math.PI / 180);

  const rotationMatrix = new THREE.Matrix4();
  rotationMatrix.makeRotationY(rotationAngleRadians);

  const customRotationMatrix = new THREE.Matrix4();
  customRotationMatrix.makeRotationFromEuler(new THREE.Euler(
    0,
    THREE.MathUtils.degToRad(rotation.y),
    0
  ));

  const points = useMemo(
    () =>
      path.map((p) => {
        const vector = new THREE.Vector3(p.x - 47.5, p.y + 0, -p.z + 19.5);
        vector.applyMatrix4(rotationMatrix);
        vector.applyMatrix4(customRotationMatrix);
        vector.add(new THREE.Vector3(translation.x, translation.y, translation.z));
        return new THREE.Vector3(vector.x, vector.y, vector.z);
      }),
    [path, rotationMatrix, customRotationMatrix, translation],
  );

  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);
  const spacedPoints = useMemo(() => curve.getSpacedPoints(5000), [curve]);

  // Calculate distances between each point
  const distances = useMemo(() => {
    let totalDistance = 0;
    return spacedPoints.map((point, index) => {
      if (index === 0) return 0;
      totalDistance += point.distanceTo(spacedPoints[index - 1]);
      return totalDistance;
    });
  }, [spacedPoints]);

  // Calculate total distance
  const totalDistance = distances[distances.length - 1];

  // Calculate the average speed needed to complete the lap in the given duration
  const averageSpeed = totalDistance / duration;

  // Adjust speed data to match the average speed
  const adjustedSpeedData = useMemo(() => {
    const totalSpeed = speedData.reduce((acc, speed) => acc + speed, 0);
    const speedMultiplier = averageSpeed / (totalSpeed / speedData.length);
    return speedData.map(speed => speed * speedMultiplier);
  }, [speedData, averageSpeed]);

  useFrame((state, delta) => {
    elapsedTimeRef.current += delta;

    // Calculate the normalized time (0 to 1)
    const normalizedTime = elapsedTimeRef.current / duration;

    // Find the corresponding speed for the current normalized time
    const speedIndex = Math.min(Math.floor(normalizedTime * adjustedSpeedData.length), adjustedSpeedData.length - 1);
    const currentSpeed = adjustedSpeedData[speedIndex];

    // Calculate the distance traveled in this frame
    const distanceTraveledInFrame = currentSpeed * delta;
    distanceTraveledRef.current += distanceTraveledInFrame;

    // Make sure we don't exceed the total distance
    const distanceTraveled = Math.min(distanceTraveledRef.current, totalDistance);

    // Find the point on the curve corresponding to the total distance traveled
    let pointIndex = distances.findIndex((distance) => distance >= distanceTraveled);
    if (pointIndex === -1) pointIndex = distances.length - 1;

    const pointOnCurve = spacedPoints[pointIndex];
    const nextPointOnCurve = spacedPoints[(pointIndex + 1) % spacedPoints.length];

    carRef.current.position.copy(pointOnCurve);

    const forwardDirection = new THREE.Vector3().subVectors(nextPointOnCurve, pointOnCurve).normalize();
    const targetQuaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), forwardDirection);

    carRef.current.quaternion.slerp(targetQuaternion, 0.1); // Daha yumuşak dönüş için slerp hızını düşürdük

    // Tekerlek dönüşü için hesaplama
    const wheelRotationSpeed = currentSpeed / 1; // Tekerleklerin ne kadar hızlı döneceğini belirleyin
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
      cameraPosition.y += 10;
      cameraPosition.z -= 20;
      state.camera.position.copy(cameraPosition);
      state.camera.lookAt(carRef.current.position);
    }

    // Update the current lap time
    setCurrentLapTime(elapsedTimeRef.current);

    // Reset the timer and distance when a lap is completed
    if (normalizedTime >= 1) {
      elapsedTimeRef.current = 0;
      distanceTraveledRef.current = 0;
    }
  });

  const gltf = useGLTF("/assets/simplecar.glb", true);

  return <primitive ref={carRef} object={gltf.scene} scale={0.5} />;
}

export default MovingCar;