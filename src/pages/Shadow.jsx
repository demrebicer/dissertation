// App.js
import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useHelper, useGLTF, BakeShadows } from "@react-three/drei";
import * as THREE from "three";

function RaceTrack() {
  const modelRef = useRef();
  const gltf = useGLTF("/assets/track.glb", true);
  gltf.scene.traverse((node) => {
    if (node.isMesh) {
      node.receiveShadow = true;
    }

    if (node.isMesh && node.name !== "terrain") {
      node.castShadow = true;
    }
  });
  gltf.scene.scale.set(0.25, 0.25, 0.25);

  return <primitive ref={modelRef} object={gltf.scene} />;
}

function Box() {
  const boxRef = useRef();
  return (
    <mesh ref={boxRef} position={[0, 1, 0]} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}

function Ground() {
  return (
    <mesh castShadow receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color="darkgreen" />
    </mesh>
  );
}

function Lights() {
  const directionalLightRef = useRef();
  useHelper(directionalLightRef, THREE.DirectionalLightHelper, 1, "cyan");

  return (
    <>
      <ambientLight intensity={2} />
      <directionalLight
        ref={directionalLightRef}
        castShadow
        position={[10, 80, 100]}
        intensity={3}
        shadow-mapSize-width={10240}
        shadow-mapSize-height={10240}
        shadow-camera-far={500}
        shadow-camera-left={-150}
        shadow-camera-right={150}
        shadow-camera-top={75}
        shadow-camera-bottom={-100}
        shadow-bias={-0.0001} 
        shadow-radius={2} 
      />
    </>
  );
}

function Shadow() {
  return (
    <Canvas shadows camera={{ position: [3, 3, 5], fov: 50 }} style={{ height: "100vh" }}>
      <OrbitControls />
      <Lights />
      {/* <Box /> */}
      {/* <Ground /> */}
      <RaceTrack />

      <BakeShadows />

    </Canvas>
  );
}

export default Shadow;
