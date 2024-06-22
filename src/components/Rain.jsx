import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferGeometry, Float32BufferAttribute, Points, PointsMaterial, AdditiveBlending } from 'three';

export default function Rain() {
  const rainRef = useRef();
  const count = 5000;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 850; // X position spread
    positions[i * 3 + 1] = Math.random() * 500;     // Y position higher
    positions[i * 3 + 2] = (Math.random() - 0.5) * 850; // Z position spread
  }

  useFrame(() => {
    if (rainRef.current) {
      const positions = rainRef.current.geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] -= 2; // Faster fall
        if (positions[i * 3 + 1] < -50) { // Allow falling below ground level
          positions[i * 3 + 1] = 500; // Reset position higher
        }
      }
      rainRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={rainRef}>
      <bufferGeometry attach="geometry">
        <bufferAttribute attach="attributes-position" array={positions} itemSize={3} count={count} />
      </bufferGeometry>
      <pointsMaterial attach="material" color="blue" size={3} sizeAttenuation={false} />
    </points>
  );
}
