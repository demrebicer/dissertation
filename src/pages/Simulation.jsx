import React, { useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import "../assets/styles/simulation.scss";
import * as THREE from "three";
import axios from "axios";
import FullPageLoader from "../components/FullPageLoader";
import EnvMap from "../assets/textures/envmap.hdr";
import useStore from "../utils/store";

import SimulationControls from "../components/SimulationControls";
import MovingCar from "../components/MovingCar";
import Ground from "../components/Ground";
import RaceTrack from "../components/RaceTrack";
import RacingLine from "../components/RacingLine";

function Simulation() {
  const {
    telemetryData,
    setTelemetryData,
    selectedYear,
    selectedDriver,
    selectedLap,
    setDrivers,
    setLaps,
    setIsDriverSelectDisabled,
    setIsLapSelectDisabled,
    loading,
    setLoading,
    setSelectedDriver,
    setSelectedLap,
    cameraMode,
    isRacingLineVisible
  } = useStore();

  const points = useMemo(() => telemetryData?.map((p) => new THREE.Vector3(p[0], p[1], p[2])), [telemetryData]);

  useEffect(() => {
    if (selectedYear) {
      setLoading(true);
      axios
        .get(`http://localhost:8000/drivers/${selectedYear.value}`)
        .then((response) => {
          const driverOptions = response.data.map((driver) => ({ value: driver, label: driver }));
          setDrivers(driverOptions);
          setSelectedDriver(null);
          setSelectedLap(null);
          setIsDriverSelectDisabled(false);
          setIsLapSelectDisabled(true);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching drivers:", error);
          setIsDriverSelectDisabled(true);
          setIsLapSelectDisabled(true);
          setLoading(false);
        });
    } else {
      setDrivers([]);
      setSelectedDriver(null);
      setLaps([]);
      setSelectedLap(null);
      setIsDriverSelectDisabled(true);
      setIsLapSelectDisabled(true);
    }
  }, [selectedYear, setDrivers, setIsDriverSelectDisabled, setIsLapSelectDisabled, setLaps, setLoading, setSelectedDriver, setSelectedLap]);

  useEffect(() => {
    if (selectedYear && selectedDriver) {
      setLoading(true);
      axios
        .get(`http://localhost:8000/laps/${selectedYear.value}/${selectedDriver.value}`)
        .then((response) => {
          const lapOptions = response.data.map((lap) => ({ value: lap, label: `Lap ${lap}` }));
          setLaps(lapOptions);
          setSelectedLap(null);
          setIsLapSelectDisabled(false);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching laps:", error);
          setIsLapSelectDisabled(true);
          setLoading(false);
        });
    } else {
      setLaps([]);
      setSelectedLap(null);
      setIsLapSelectDisabled(true);
    }
  }, [selectedDriver, selectedYear, setIsLapSelectDisabled, setLaps, setLoading, setSelectedLap]);

  useEffect(() => {
    if (selectedYear && selectedDriver && selectedLap) {
      setLoading(true);
      axios
        .get(`http://localhost:8000/telemetry/${selectedYear.value}/${selectedDriver.value}/${selectedLap.value}`)
        .then((response) => {
          setTelemetryData(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching telemetry data:", error);
          setLoading(false);
        });
    }
  }, [selectedYear, selectedDriver, selectedLap, setTelemetryData, setLoading]);

  return (
    <div className="homepage">
      {loading && <FullPageLoader />}
      <SimulationControls />
      <Canvas camera={{ position: [0, 300, 0], fov: 50 }}>
        <Environment files={EnvMap} background={"both"} />
        <ambientLight intensity={2} />
        <OrbitControls enabled={cameraMode === "free"} />
        <axesHelper args={[20]} />

        {telemetryData && <MovingCar path={points} duration={30} />}
        <RaceTrack />
        <Ground />
        {telemetryData && isRacingLineVisible && <RacingLine points={points} />}
      </Canvas>
    </div>
  );
}

export default Simulation;