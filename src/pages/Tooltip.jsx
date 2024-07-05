import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import { a, useSpring } from '@react-spring/three';

const Ground = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="lightblue" />
    </mesh>
  );
}

const Box = ({ position, label }) => {
  const mesh = useRef();
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);

  // Küpü sol taraftan sağa doğru hareket ettirmek için animasyon
  useFrame(() => {
    if (mesh.current) {
      mesh.current.position.x += 0.01;
      if (mesh.current.position.x > 5) {
        mesh.current.position.x = -5;
      }
    }
  });

  const props = useSpring({
    scale: active ? 1.5 : 1,
    config: { tension: 200, friction: 10 },
  });

  return (
    <a.mesh
      ref={mesh}
      position={position}
      onPointerOver={(e) => setHovered(true)}
      onPointerOut={(e) => setHovered(false)}
      onClick={(e) => setActive(!active)}
      scale={props.scale}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
      <Html distanceFactor={10} position={[0, 1.5, 0]}>
        <div
          style={{
            background: 'white',
            padding: '5px',
            borderRadius: '5px',
            boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
            transform: 'translate3d(-50%, -50%, 0)',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </div>
      </Html>
    </a.mesh>
  );
};

const TooltipScene = () => {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      
      <Box position={[-3, 0, 0]} label="Box 1" />
      <Box position={[-1, 0, 0]} label="Box 2" />
      <Box position={[1, 0, 0]} label="Box 3" />
      <Box position={[3, 0, 0]} label="Box 4" />

      <Ground />

      <OrbitControls />
    </Canvas>
  );
};

const Tooltip = () => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <TooltipScene />
    </div>
  );
};

export default Tooltip;
