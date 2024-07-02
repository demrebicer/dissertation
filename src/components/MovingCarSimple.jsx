import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import useStore from "../utils/store";

const rotationAngleDegrees = 75;
const rotationAngleRadians = rotationAngleDegrees * (Math.PI / 180);

const rotationMatrix = new THREE.Matrix4();
rotationMatrix.makeRotationY(rotationAngleRadians);

function MovingCarSimple({ path, translation, rotation, duration, scale, isGhost }) {
  const carRef = useRef();
  const cameraRef = useRef();
  const elapsedTimeRef = useRef(0);
  const distanceTraveledRef = useRef(0);
  const { cameraMode, setCurrentLapTime } = useStore();

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

  useFrame((state, delta) => {
    elapsedTimeRef.current += delta;

    const normalizedTime = elapsedTimeRef.current / duration;
    const distanceTraveled = normalizedTime * totalDistance;
    distanceTraveledRef.current = distanceTraveled;

    let pointIndex = distances.findIndex((distance) => distance >= distanceTraveled);
    if (pointIndex === -1) pointIndex = distances.length - 1;

    const pointOnCurve = spacedPoints[pointIndex];
    const nextPointOnCurve = spacedPoints[(pointIndex + 1) % spacedPoints.length];

    carRef.current.position.copy(pointOnCurve);

    const forwardDirection = new THREE.Vector3().subVectors(nextPointOnCurve, pointOnCurve).normalize();
    const targetQuaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), forwardDirection);

    carRef.current.quaternion.slerp(targetQuaternion, 0.1);

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

    if (cameraMode === "tv" && carRef.current) {
      const cameraPosition = new THREE.Vector3().copy(carRef.current.position);
      cameraPosition.y += 5; //5
      cameraPosition.z -= 10; //10
      state.camera.position.copy(cameraPosition);
      state.camera.lookAt(carRef.current.position);
    }

    setCurrentLapTime(elapsedTimeRef.current);

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

export default MovingCarSimple;
