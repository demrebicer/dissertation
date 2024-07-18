import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sky, BakeShadows } from "@react-three/drei";
import axios from "axios";
import { useStore } from "../utils/store";
import "../assets/styles/simulation.scss";

import RaceTrack from "../components/RaceTrack";
import PositionsTable from "../components/PositionsTable";
import MovingCar from "../components/MovingCar";
import FullPageLoader from "../components/FullPageLoader";
import SimulationControls from "../components/SimulationControls";
import Rain from "../components/Rain";
import RacingLine from "../components/RacingLine";

export default function Simulation() {
  const [carsData, setCarsData] = useState([]);

  const {
    setLapsData,
    setStreamData,
    setCompletedLapsData,
    setDriverStatusData,
    setCurrentLap,
    setMaxLaps,
    setStartTime,
    setTime,
    setDataLoaded,
    startTimestamp,
    sessionEndTime,
    driverList,
    currentWeather,
    cameraMode,
    selectedYear,
    selectedType,
    loading,
    setLoading,
    setFlags,
    setWeatherData,
    selectedDriver,
    isRacingLineVisible,
  } = useStore();

  const fetchTelemetryData = async (year, type) => {
    try {
      setLoading(true);
      const [telemetryResponse, timingResponse] = await Promise.all([
        axios.get(`http://localhost:8000/telemetry/${year}/${type}`),
        axios.get(`http://localhost:8000/timing/${year}/${type}`),
      ]);

      // Set telemetry data
      setCarsData(telemetryResponse.data.cars);

      // Set timing data
      const timingData = timingResponse.data.laps_data;
      setLapsData(timingData);
      setStreamData(timingResponse.data.stream_data);
      setCompletedLapsData(timingResponse.data.completed_laps);
      setDriverStatusData(timingResponse.data.driver_status);
      setCurrentLap(1);
      setMaxLaps(timingResponse.data.total_laps);
      setFlags(timingResponse.data.track_status);
      setWeatherData(timingResponse.data.weather_data);

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
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedYear && selectedType) {
      fetchTelemetryData(selectedYear.value, selectedType.value);
    }
  }, [selectedYear, selectedType]);

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
        fetchTelemetryData={fetchTelemetryData}
      />

      <PositionsTable />

      <Canvas shadows camera={{ position: [0, 200, 300], fov: 50 }}>
        {currentWeather === "rainy" ? (
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

        <ambientLight intensity={currentWeather === "sunny" ? 2 : 1} />
        <directionalLight
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

        <RaceTrack />

        {!loading &&
          carsData.map((car, index) => {
            if (driverList[car.id] === true) {
              return (
                <MovingCar
                  key={car.id}
                  driverName={car.id}
                  path={car.path}
                  color={car.teamColor}
                  translation={translation}
                  rotation={rotation}
                  scale={scale}
                />
              );
            }
          })}

        {!loading &&
          carsData.map((car, index) => {
            if (isRacingLineVisible && driverList[car.id] === true && selectedDriver === car.id) {
              return (
                <RacingLine
                  key={car.id}
                  driverName={car.id}
                  path={car.path}
                  color={car.teamColor}
                  translation={translation}
                  rotation={rotation}
                  scale={scale}
                />
              );
            }
          })}

        <OrbitControls enabled={cameraMode === "free"} maxDistance={850} />

        <Rain />

        <BakeShadows />
      </Canvas>
    </div>
  );
}
