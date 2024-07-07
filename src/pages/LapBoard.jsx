import React, { useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sky } from "@react-three/drei";
import axios from "axios";
import RaceTrack from "../components/RaceTrack";
import PositionsTable from "../components/PositionsTable";
import { useStore } from "../utils/newStore";
import MovingBox from "../components/MovingBox";

export default function LapBoard() {
  const [telemetryData, setTelemetryData] = useState({});
  const [loading, setLoading] = useState(true);
  const requestMade = useRef(false);
  const { setLapsData, setStreamData, setCompletedLapsData, setDriverStatusData, setCurrentLap, setMaxLaps, setStartTime, setTime, setDataLoaded, startTimestamp, sessionEndTime } = useStore();

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

  return (
    <div className="homepage">
      <PositionsTable />

      <Canvas camera={{ position: [0, 200, 300], fov: 50 }}>
        <ambientLight intensity={2} />
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
            return (
              <MovingBox
                key={driverCode}
                driverName={driverCode}
                laps={telemetryData[driverCode]}
                color={telemetryData[driverCode][0].TeamColor}
              />
            );
          })
        }

        <Sky sunPosition={[20, 50, 20]} />
        <OrbitControls maxDistance={850} />
      </Canvas>
    </div>
  );
}
