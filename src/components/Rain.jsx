import React, { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending } from "three";
import { useStore } from "../utils/store";

export default function Rain() {
  const rainRef = useRef();
  const count = 3500;
  const positions = new Float32Array(count * 6);

  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * 850;
    const y = Math.random() * 500;
    const z = (Math.random() - 0.5) * 850;
    positions[i * 6] = x;
    positions[i * 6 + 1] = y;
    positions[i * 6 + 2] = z;
    positions[i * 6 + 3] = x;
    positions[i * 6 + 4] = y - 10;
    positions[i * 6 + 5] = z;
  }

  const { currentWeather, setCurrentWeather, weatherData, time } = useStore();
  const [initialLoadTime, setInitialLoadTime] = useState(null);
  const [isRaining, setIsRaining] = useState(false);
  const previousWeatherDataRef = useRef(weatherData);

  useEffect(() => {
    // Set the initial load time once time is not zero
    if (time !== 0 && initialLoadTime === null) {
      setInitialLoadTime(time);
    }
  }, [time]);

  useEffect(() => {
    const checkWeather = () => {
      // Find the latest weather data point up to the current time
      const currentData = weatherData.reduce((acc, data) => {
        if (data.Time <= time) {
          return data;
        }
        return acc;
      }, null);

      if (currentData && currentData !== previousWeatherDataRef.current) {
        if (currentData.Rainfall) {
          setIsRaining(true);
          setCurrentWeather("rainy");
        } else {
          setIsRaining(false);
          setCurrentWeather("sunny");
        }
        previousWeatherDataRef.current = currentData;
      }
    };

    checkWeather();
  }, [time, weatherData, setCurrentWeather]);

  useEffect(() => {
    if (currentWeather === "rainy") {
      setIsRaining(true);
    } else {
      setIsRaining(false);
    }
  }, [currentWeather]);

  useFrame(() => {
    if (rainRef.current && isRaining) {
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

  return isRaining ? (
    <lineSegments ref={rainRef}>
      <bufferGeometry attach="geometry">
        <bufferAttribute attach="attributes-position" array={positions} itemSize={3} count={count * 2} />
      </bufferGeometry>
      <lineBasicMaterial attach="material" color="#214081" linewidth={2} blending={AdditiveBlending} transparent />
    </lineSegments>
  ) : null;
}
