import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

function CreateRectangles({ regions }) {
  const mountRef = useRef(null); // Canvas'ı yerleştirmek için bir referans

  useEffect(() => {
    // Sahne, kamera ve işleyici (renderer) oluşturulur.
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement); // Renderer'ı DOM'a bağla

    // Dikdörtgenler için malzeme tanımlanır.
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });

    regions.forEach((region) => {
      // Her region için dikdörtgenin genişliği ve yüksekliği hesaplanır.
      const width = region.region_end.x - region.region_start.x;
      const height = region.region_end.y - region.region_start.y;

      // PlaneGeometry ile dikdörtgenin geometrisi oluşturulur.
      const geometry = new THREE.PlaneGeometry(width, height);
      const mesh = new THREE.Mesh(geometry, material);

      // Mesh'in pozisyonunu ayarlayarak dikdörtgeni doğru konuma yerleştiririz.
      mesh.position.x = region.region_start.x + width / 2 - window.innerWidth / 2;
      mesh.position.y = -(region.region_start.y + height / 2 - window.innerHeight / 2);
      mesh.position.z = 0;

      // Dikdörtgeni sahneye ekler.
      scene.add(mesh);
    });

    // Kameranın sahneye bakmasını sağlar.
    camera.position.z = 500;

    // Sahneyi render eder.
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    animate();

    // Component unmount olduğunda, oluşturulan canvas'ı temizle
    return () => {
      mountRef.current.removeChild(renderer.domElement);
    };
  }, [regions]); // useEffect bağımlılıkları içerisinde regions'ı izle

  return <div ref={mountRef} />; // Canvas için bir div döndür
}

export default CreateRectangles;
