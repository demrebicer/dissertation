import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferGeometry, Float32BufferAttribute, LineSegments, LineBasicMaterial, AdditiveBlending } from 'three';

export default function Rain() {
  const rainRef = useRef();
  const count = 3500;
  const positions = new Float32Array(count * 6); // Start and end points for each line segment

  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * 850;
    const y = Math.random() * 500;
    const z = (Math.random() - 0.5) * 850;
    positions[i * 6] = x;
    positions[i * 6 + 1] = y;
    positions[i * 6 + 2] = z;
    positions[i * 6 + 3] = x;
    positions[i * 6 + 4] = y - 10; // Length of the rain drop
    positions[i * 6 + 5] = z;
  }

  useFrame(() => {
    if (rainRef.current) {
      const positions = rainRef.current.geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        positions[i * 6 + 1] -= 2;
        positions[i * 6 + 4] -= 2; // Move both start and end points
        if (positions[i * 6 + 1] < -50) {
          positions[i * 6 + 1] = 500;
          positions[i * 6 + 4] = 490; // Reset both start and end points
        }
      }
      rainRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <lineSegments ref={rainRef}>
      <bufferGeometry attach="geometry">
        <bufferAttribute attach="attributes-position" array={positions} itemSize={3} count={count * 2} />
      </bufferGeometry>
      <lineBasicMaterial attach="material" color="#214081" linewidth={2} blending={AdditiveBlending} transparent />
    </lineSegments>
  );
}
