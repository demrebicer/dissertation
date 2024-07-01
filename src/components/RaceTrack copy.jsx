import React, { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

function RaceTrack() {
  const modelRef = useRef();
  const gltf = useGLTF("/assets/track.glb", true);
  gltf.scene.scale.set(0.25, 0.25, 0.25);

  useEffect(() => {
    if (gltf && gltf.scene) {
      const video = document.createElement('video');
      video.src = '/assets/race_highlights.mp4';
      video.crossOrigin = 'anonymous';
      video.loop = true;
      video.muted = true;
      video.play();

      const videoTexture = new THREE.VideoTexture(video);
      videoTexture.wrapS = THREE.ClampToEdgeWrapping;
      videoTexture.wrapT = THREE.ClampToEdgeWrapping;
      videoTexture.flipY = false;  // Flip the video texture vertically


      videoTexture.repeat.set(1, 1);
      videoTexture.offset.set(-0.1, -0.1);
      videoTexture.center.set(0, 0);
      videoTexture.rotation = 0;
      videoTexture.minFilter = THREE.LinearFilter;
      videoTexture.magFilter = THREE.LinearFilter;
      videoTexture.anisotropy = 1;
      videoTexture.format = THREE.RGBAFormat; // Format ve type özelliklerini uygun değerlerle değiştirmeniz gerekebilir
      videoTexture.type = THREE.UnsignedByteType;
      videoTexture.encoding = THREE.sRGBEncoding; // Color space 'srgb' için
    


      gltf.scene.traverse((child) => {
        if (child.isMesh && child.name === 'video_wall') {
          child.material = new THREE.MeshBasicMaterial({ map: videoTexture });
        }
      });
    }
  }, [gltf]);

  return <primitive ref={modelRef} object={gltf.scene} />;
}

export default RaceTrack;
