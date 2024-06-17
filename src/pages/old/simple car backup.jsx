import React, { useState, useEffect, useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line, OrbitControls, Sky, useGLTF } from "@react-three/drei";
import "../assets/styles/homepage.scss";
import * as THREE from "three";
import { ham_positions } from "../../utils/constants";
import { OBJExporter } from "three/examples/jsm/exporters/OBJExporter";
const exporter = new OBJExporter();

function Homepage() {
  const [points, setPoints] = useState(ham_positions);
  const [cameraMode, setCameraMode] = useState("free");
  const modelRef = useRef();

  function MovingCar({ path, duration }) {
    const carRef = useRef();
    const elapsedTimeRef = useRef(0);

    // Dönüş açısını ve dönüşüm matrisini tanımla
    const rotationAngleDegrees = 75;
    const rotationAngleRadians = rotationAngleDegrees * (Math.PI / 180);
    const rotationMatrix = new THREE.Matrix4().makeRotationY(rotationAngleRadians);

    // Koordinatları dönüştür
    const points = useMemo(
      () =>
        path.map((p) => {
          const vector = new THREE.Vector3(p[0] - 73, p[1] + 0, -p[2] + 230); // İlk dönüşümü uygula
          vector.applyMatrix4(rotationMatrix); // Y ekseni etrafında dönüşümü uygula
          return new THREE.Vector3(vector.x, vector.y, vector.z);
        }),
      [path],
    );

    // Catmull-Rom spline oluştur ve daha fazla nokta oluştur
    const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);
    const spacedPoints = useMemo(() => curve.getSpacedPoints(2500), [curve]); // Daha fazla nokta oluştur

    useFrame((state, delta) => {
      elapsedTimeRef.current += delta;

      const t = (elapsedTimeRef.current % duration) / duration;
      const index = Math.floor(t * (spacedPoints.length - 1));
      const pointOnCurve = spacedPoints[index];
      const nextPointOnCurve = spacedPoints[(index + 1) % spacedPoints.length]; // Bir sonraki nokta için küçük bir adım

      // Arabanın pozisyonunu güncelle
      carRef.current.position.copy(pointOnCurve);

      // Arabanın yönünü ayarla
      const currentQuaternion = carRef.current.quaternion.clone();
      carRef.current.lookAt(nextPointOnCurve);
      const targetQuaternion = carRef.current.quaternion.clone();
      carRef.current.quaternion.copy(currentQuaternion);
      carRef.current.quaternion.slerp(targetQuaternion, 0.3);

      // Araba kamerasını güncelle
      if (cameraMode === "follow" && carRef.current) {
        const cameraPosition = new THREE.Vector3().copy(carRef.current.position);
        cameraPosition.y += 10;
        cameraPosition.z -= 20;
        state.camera.position.copy(cameraPosition);
        state.camera.lookAt(carRef.current.position);
      }
    });

    const gltf = useGLTF("/assets/simplecar.glb", true);

    return <primitive ref={carRef} object={gltf.scene} scale={0.5} />;
  }

  function RaceTrackModel() {
    const gltf = useGLTF("/assets/track.glb", true); // Modelin yolu

    gltf.scene.scale.set(0.25, 0.25, 0.25);

    return <primitive ref={modelRef} object={gltf.scene} />;
  }

  //Just green grass color
  function Ground() {
    return (
      <mesh position={[0, -50.5, 0]} receiveShadow>
        <boxGeometry attach="geometry" args={[1000, 100, 1000]} />
        <meshStandardMaterial attach="material" color="#5C875A" flatShading roughness={1} metalness={0} />
      </mesh>
    );
  }

  const RaceTrack = ({ points }) => {
    const lineRef = useRef();

    const rotationAngleDegrees = 74;
    const rotationAngleRadians = rotationAngleDegrees * (Math.PI / 180);

    const rotationMatrix = new THREE.Matrix4();
    rotationMatrix.makeRotationY(rotationAngleRadians);

    const rotatedVertices = useMemo(
      () =>
        points.map((p) => {
          const vector = new THREE.Vector3(p[0] - 73, p[1] + 0.25, -p[2] + 230);
          vector.applyMatrix4(rotationMatrix);
          return vector;
        }),
      [points, rotationMatrix],
    );

    return <Line ref={lineRef} points={rotatedVertices} color="red" lineWidth={5} />;
  };

  return (
    <div className="homepage">
      <div className="controls">
        <button onClick={() => setCameraMode("free")}>Free Camera</button>
        <button onClick={() => setCameraMode("follow")}>Follow Camera</button>
      </div>
      <Canvas camera={{ position: [0, 300, 0], fov: 50 }}>
        <ambientLight intensity={2} />
        <OrbitControls enabled={cameraMode === "free"} />
        <axesHelper args={[50]} />

        <MovingCar path={points} duration={25} />

        <Sky sunPosition={[100, 10, 100]} turbidity={10} rayleigh={2} />
        <RaceTrackModel />
        <RaceTrack points={points} />
        <Ground />
      </Canvas>
    </div>
  );
}

export default Homepage;
