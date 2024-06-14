import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import useStore from "../utils/store";

function MovingCar({ path, translation, rotation, duration }) {
  const carRef = useRef();
  const elapsedTimeRef = useRef(0);
  const previousTRef = useRef(0); // To keep track of the previous t
  const { cameraMode, setCurrentLapTime } = useStore();

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
  const spacedPoints = useMemo(() => curve.getSpacedPoints(1000), [curve]);

  useFrame((state, delta) => {
    elapsedTimeRef.current += delta;

    const t = (elapsedTimeRef.current % duration) / duration;
    const index = Math.floor(t * (spacedPoints.length - 1));
    const pointOnCurve = spacedPoints[index];
    const nextPointOnCurve = spacedPoints[(index + 1) % spacedPoints.length];

    carRef.current.position.copy(pointOnCurve);

    const forwardDirection = new THREE.Vector3().subVectors(nextPointOnCurve, pointOnCurve).normalize();
    const targetQuaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), forwardDirection);

    carRef.current.quaternion.slerp(targetQuaternion, 0.05); // Daha yumuşak dönüş için slerp hızını düşürdük

    // Tekerlek dönüşü için hesaplama
    const wheelRotationSpeed = 10; // Tekerleklerin ne kadar hızlı döneceğini belirleyin
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

    // Reset the timer when a lap is completed
    if (t < previousTRef.current) {
      elapsedTimeRef.current = 0;
    }

    previousTRef.current = t;
  });

  const gltf = useGLTF("/assets/simplecar.glb", true);

  return <primitive ref={carRef} object={gltf.scene} scale={0.5} />;
}

export default MovingCar;
