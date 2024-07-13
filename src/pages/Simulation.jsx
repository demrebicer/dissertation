import React, { useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sky } from "@react-three/drei";
import axios from "axios";
import { useStore } from "../utils/store";
import "../assets/styles/simulation.scss";

import RaceTrack from "../components/RaceTrack";
import PositionsTable from "../components/PositionsTable";
import MovingCar from "../components/MovingCar";
import FullPageLoader from "../components/FullPageLoader";
import SimulationControls from "../components/SimulationControls";
import Rain from "../components/Rain";

export default function LapBoard() {
  const [telemetryData, setTelemetryData] = useState({});
  const [loading, setLoading] = useState(true);
  const requestMade = useRef(false);
  const {
    currentLap, setLapsData, setStreamData, setCompletedLapsData,
    setDriverStatusData, setCurrentLap, setMaxLaps, setStartTime,
    setTime, setDataLoaded, startTimestamp, sessionEndTime,
    setSkipNextLap, driverList, currentWeather, cameraMode
  } = useStore();

  useEffect(() => {
    const fetchTelemetryData = async () => {
      try {
        const [telemetryResponse, timingResponse] = await Promise.all([
          axios.get("http://localhost:8000/new-telemetry/2021/R"),
          axios.get("http://localhost:8000/timing/2021/R")
        ]);

        // Set telemetry data
        setTelemetryData(telemetryResponse.data);

        // Set timing data
        const timingData = timingResponse.data.laps_data;
        setLapsData(timingData);
        setStreamData(timingResponse.data.stream_data);
        setCompletedLapsData(timingResponse.data.completed_laps);
        setDriverStatusData(timingResponse.data.driver_status);
        setCurrentLap(1);
        setMaxLaps(timingResponse.data.total_laps);

        if (timingData.length > 0) {
          const sessionStartTime = parseFloat(timingResponse.data.session_start_time);
          const endTime = parseFloat(timingResponse.data.session_end_time);
          setStartTime(sessionStartTime);
          setTime(sessionStartTime);
          sessionEndTime.current = endTime;
          setDataLoaded(true);
          startTimestamp.current = Date.now();
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    if (!requestMade.current) {
      requestMade.current = true;
      fetchTelemetryData();
    }
  }, []);

  const [translation, setTranslation] = useState({ x: 0, y: 0, z: 0 });
  const [rotation, setRotation] = useState({ y: 0 });
  const [scale, setScale] = useState(1);

  return (
    <div className="homepage">
      {loading && <FullPageLoader />}

      <SimulationControls
        translation={translation}
        setTranslation={setTranslation}
        rotation={rotation}
        setRotation={setRotation}
        scale={scale}
        setScale={setScale}
      />

      <PositionsTable />

      <Canvas camera={{ position: [0, 200, 300], fov: 50 }}>

      {currentWeather === "rainy" ? (
          // <Sky sunPosition={[5, 1, 8]} inclination={0.6} azimuth={0.25} />
          <Sky
            sunPosition={[5, 1, 8]}
            inclination={0.6}
            azimuth={0.1}
            mieCoefficient={0.01}
            mieDirectionalG={0.7}
            rayleigh={1}
            turbidity={250}
          />
        ) : currentWeather === "cloudy" ? (
          <Sky
            sunPosition={[5, 1, 8]}
            inclination={0.6}
            azimuth={0.1}
            mieCoefficient={0.01}
            mieDirectionalG={0.7}
            rayleigh={1}
            turbidity={250}
          />
        ) : (
          <Sky sunPosition={[20, 50, 20]} />
        )}

        <ambientLight intensity={currentWeather === "sunny" ? 3 : 1.5} />
        <directionalLight
          castShadow
          position={[20, 50, 20]}
          intensity={3}
          shadow-mapSize-width={512}
          shadow-mapSize-height={512}
          shadow-camera-far={500}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
        />

        <RaceTrack />

        {!loading &&
          Object.keys(telemetryData).map((driverCode) => {
            if (driverList[driverCode] === true){
              return (
                <MovingCar
                  key={driverCode}
                  driverName={driverCode}
                  laps={telemetryData[driverCode]}
                  color={telemetryData[driverCode][0].TeamColor}
                />
              );
            }
          })}

        <OrbitControls enabled={cameraMode === "free"} maxDistance={850} />

        {currentWeather === "rainy" && <Rain />}
      </Canvas>
    </div>
  );
}