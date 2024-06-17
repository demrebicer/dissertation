import React, { useState, useEffect, useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line, Box, OrbitControls, Sky, useGLTF } from "@react-three/drei";
import "../assets/styles/homepage.scss";
import * as THREE from "three";
import { ham_positions, max_positions, ham_lap_times } from "../../utils/constants";
import { OBJExporter } from "three/examples/jsm/exporters/OBJExporter";
const exporter = new OBJExporter();

function Homepage() {
  const [points, setPoints] = useState(ham_positions);
  const [points2, setPoints2] = useState(max_positions);
  const [lapTime, setLapTime] = useState("00:00.000");

  const modelRef = useRef();

  function MovingBoxHam({ path, duration }) {
    const meshRef = useRef();
    const elapsedTimeRef = useRef(0);

    // Dönüş açısını ve dönüşüm matrisini tanımla
    const rotationAngleDegrees = 75;
    const rotationAngleRadians = rotationAngleDegrees * (Math.PI / 180);
    const rotationMatrix = new THREE.Matrix4().makeRotationY(rotationAngleRadians);

    // Koordinatları dönüştür
    const points = useMemo(
      () =>
        path.map((p) => {
          const vector = new THREE.Vector3(p[0] - 225, p[1] + 2, -p[2] + 300); // İlk dönüşümü uygula
          vector.applyMatrix4(rotationMatrix); // Y ekseni etrafında dönüşümü uygula
          return [vector.x, vector.y, vector.z];
        }),
      [path],
    );

    useFrame((state, delta) => {
      elapsedTimeRef.current += delta;

      const t = (elapsedTimeRef.current % duration) / duration;
      const currentIndex = Math.floor(t * (points.length - 1));
      const nextIndex = (currentIndex + 1) % points.length;

      const currentPoint = points[currentIndex];
      const nextPoint = points[nextIndex];

      const interT = (t * (points.length - 1)) % 1; // İki nokta arasındaki interpolasyon faktörü

      // Dönüşüm sonrası koordinatları kullan
      meshRef.current.position.x = currentPoint[0];
      meshRef.current.position.y = currentPoint[1] + (nextPoint[1] - currentPoint[1]) * interT;
      meshRef.current.position.z = currentPoint[2];
    });

    return (
      <Box ref={meshRef} args={[5, 5, 5]} position={[points[0][0], points[0][1], points[0][2]]}>
        <meshStandardMaterial attach="material" color="hotpink" />
      </Box>
    );
  }

  function MovingBoxMax({ path, duration }) {
    const meshRef = useRef();
    const elapsedTimeRef = useRef(0);

    // Koordinatları yataydan dikeye çevir
    const points = useMemo(() => path.map((p) => [p[0], p[2], p[1] + 0.15]), [path]); // X koordinatını sabit tut, Y yerine Z'yi kullan

    useFrame((state, delta) => {
      elapsedTimeRef.current += delta;

      const t = (elapsedTimeRef.current % duration) / duration;
      const currentIndex = Math.floor(t * (points.length - 1));
      const nextIndex = (currentIndex + 1) % points.length;

      const currentPoint = points[currentIndex];
      const nextPoint = points[nextIndex];

      const interT = (t * (points.length - 1)) % 1; // İki nokta arasındaki interpolasyon faktörü

      meshRef.current.position.x = currentPoint[0]; // X pozisyonunu sabit tut
      meshRef.current.position.y = currentPoint[1] + (nextPoint[1] - currentPoint[1]) * interT; // Y pozisyonunu güncelle
      meshRef.current.position.z = currentPoint[2]; // Z pozisyonunu sabit tut
    });

    return (
      <Box ref={meshRef} args={[1, 1, 1]} position={points[0]}>
        <meshStandardMaterial attach="material" color="blue" />
      </Box>
    );
  }

  function RaceTrackModel() {
    const gltf = useGLTF("/assets/track.glb", true); // Modelin yolu

    return <primitive ref={modelRef} object={gltf.scene} />;
  }

  const RaceTrack = ({ points }) => {
    const lineRef = useRef();

    const rotationAngleDegrees = 75;
    const rotationAngleRadians = rotationAngleDegrees * (Math.PI / 180);

    const rotationMatrix = new THREE.Matrix4();
    rotationMatrix.makeRotationY(rotationAngleRadians);

    const rotatedVertices = useMemo(
      () =>
        points.map((p) => {
          const vector = new THREE.Vector3(p[0] - 227, p[1] + 2, -p[2] + 302);
          vector.applyMatrix4(rotationMatrix);
          return vector;
        }),
      [points, rotationMatrix],
    );

    return <Line ref={lineRef} points={rotatedVertices} color="red" lineWidth={5} />;
  };

  function CameraLogger() {
    const { camera } = useThree(); // React Three Fiber hook'u ile kamerayı al

    useFrame(() => {
      console.log(camera.position); // Her frame'de kameranın konumunu konsola yaz
    });

    return null; // Bu bileşen herhangi bir JSX render etmiyor
  }

  function SimpleBox() {
    const meshRef = useRef();

    useFrame(() => {});

    return (
      <Box ref={meshRef} args={[3, 3, 3]} position={[25, 0, 206]}>
        <meshStandardMaterial attach="material" color="hotpink" />
      </Box>
    );
  }

  //Just gree grass color
  function Ground() {
    return (
      <mesh position={[0, -50.5, 0]} receiveShadow>
        <boxGeometry attach="geometry" args={[1000, 100, 1000]} />
        <meshStandardMaterial attach="material" color="#5C875A" flatShading roughness={1} metalness={0} />
      </mesh>
    );
  }

  //Create a timer component hud text must like 00:00.000
  function Timer({ duration }) {
    return (
      <div className="timer">
        <h1 className="text">{lapTime}</h1>
      </div>
    );
  }

  return (
    <div className="homepage">
      <Timer />

      <Canvas camera={{ position: [0, 698, 0], fov: 50 }}>
        <ambientLight intensity={1.5} />
        <OrbitControls />
        <axesHelper args={[50]} />
        {/* <CameraLogger /> */}
        {/* <SimpleBox /> */}

        <MovingBoxHam path={points} duration={150} />
        {/* <MovingBoxMax path={points2} duration={122} /> */}

        {/*<Sky sunPosition={[100, 10, 100]} />*/}
        {/* <RaceTrack points={points} /> */}
        <RaceTrackModel />
        <Ground />
      </Canvas>
    </div>
  );
}

export default Homepage;
