import React, { useEffect, useState } from "react";
import Select from "react-select";
import useStore from "../utils/store";
import axios from "axios";
import "../assets/styles/simulationControls.scss";
import FlagIndicator from "./FlagIndicator";
import RacingLineControls from "./RacingLineControls";

function SimulationControls({ translation, setTranslation, rotation, setRotation, scale, setScale }) {
  const {
    selectedYear,
    setSelectedYear,
    drivers,
    selectedDriver,
    setSelectedDriver,
    laps,
    selectedLap,
    setSelectedLap,
    isDriverSelectDisabled,
    isLapSelectDisabled,
    setCameraMode,
    toggleRacingLineVisibility,
    setDrivers,
    setIsDriverSelectDisabled,
    setIsLapSelectDisabled,
    setLaps,
    setLoading,
    setTelemetryData,
    setLapDuration,
    lapDuration,
    currentLapTime,
    setSpeedData,
    setBrakeData,
    currentSpeed,
    selectedType,
    setSelectedType,
    isYearSelectDisabled,
    setIsYearSelectDisabled,
    setIsRaining,
    setRpmData,
  } = useStore();

  const [flags, setFlags] = useState([]);
  const [currentFlag, setCurrentFlag] = useState(null);
  const [speedMultiplier, setSpeedMultiplier] = useState(3);
  const [showRacingLineControls, setShowRacingLineControls] = useState(false); // Add this line

  const years = [
    { value: 2018, label: 2018 },
    { value: 2019, label: 2019 },
    { value: 2020, label: 2020 },
    { value: 2021, label: 2021 },
    { value: 2022, label: 2022 },
    { value: 2023, label: 2023 },
  ];

  const typeOptions = [
    { value: "race", label: "Race"},
    { value: "qualifying", label: "Qualifying"},
  ];

  useEffect(() => {
    //Reset year, driver, lap, and flags when changing type
    setSelectedYear(null);
    setSelectedDriver(null);
    setSelectedLap(null);
    setFlags([]);
    setDrivers([]);
    setLaps([]);
    setIsDriverSelectDisabled(true);
    setIsLapSelectDisabled(true);
    setIsYearSelectDisabled(true);

    if (selectedType) {
      setIsYearSelectDisabled(false);
    }
  }, [selectedType]);

  useEffect(() => {
    if (selectedYear) {
      setLoading(true);
      axios
        .get(`http://localhost:8000/drivers/${selectedYear.value}/${selectedType.value}`)
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
        .get(`http://localhost:8000/laps/${selectedYear.value}/${selectedType.value}/${selectedDriver.value}`)
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
        .get(`http://localhost:8000/telemetry/${selectedYear.value}/${selectedType.value}/${selectedDriver.value}/${selectedLap.value}`)
        .then((response) => {
          const telemetryData = response.data.telemetry;
          setTelemetryData(telemetryData);
          setLapDuration(response.data.lap_duration / speedMultiplier); // Adjust lap duration
          setSpeedData(response.data.speed);
          setFlags(
            response.data.flags.map((flag) => ({
              ...flag,
              start_time: flag.start_time / speedMultiplier,
              end_time: flag.end_time / speedMultiplier,
            })),
          ); // Adjust flag times
          setBrakeData(response.data.brake);
          setRpmData(response.data.rpm);
          setIsRaining(response.data.is_rain);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching telemetry data:", error);
          setLoading(false);
        });
    }
  }, [selectedYear, selectedDriver, selectedLap, setTelemetryData, setLoading, setLapDuration, setSpeedData, speedMultiplier]);

  useEffect(() => {
    const determineCurrentFlag = (flags, currentTime) => {
      const flag = flags.find((flag) => currentTime >= flag.start_time && currentTime <= flag.end_time);

      if (flag) {
        switch (flag.flag) {
          case "1":
            return "green";
          case "2":
            return "yellow";
          case "4":
            return "safety-car";
          case "5":
            return "red";
          case "6":
            return "virtual-safety-car";
          case "7":
            return "virtual-safety-car-ending";
          default:
            return null;
        }
      }
      return null;
    };

    if (flags.length > 0) {
      const currentFlag = determineCurrentFlag(flags, currentLapTime);
      setCurrentFlag(currentFlag);
    } else {
      setCurrentFlag(null);
    }
  }, [flags, currentLapTime]);

  const formatLapTime = (duration) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    const milliseconds = Math.floor((duration * 1000) % 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}:${milliseconds.toString().padStart(3, "0")}`;
  };

  return (
    <div>
      {showRacingLineControls && (
        <RacingLineControls translation={translation} setTranslation={setTranslation} rotation={rotation} setRotation={setRotation} scale={scale} setScale={setScale}/>
      )}
      <div className="controls">
        <button onClick={() => setCameraMode("free")}>Free Camera</button>
        <button onClick={() => setCameraMode("follow")}>Follow Camera</button>
        <Select
          className="select-box"
          classNamePrefix="select"
          options={typeOptions}
          placeholder="Select Type"
          onChange={setSelectedType}
          value={selectedType}
        />
        <Select
          className="select-box"
          classNamePrefix="select"
          options={years}
          placeholder="Select Year"
          onChange={setSelectedYear}
          isDisabled={isYearSelectDisabled}
          value={selectedYear}
        />
        <Select
          className="select-box"
          classNamePrefix="select"
          options={drivers}
          placeholder="Select Driver"
          onChange={setSelectedDriver}
          isDisabled={isDriverSelectDisabled}
          value={selectedDriver}
        />
        <Select
          className="select-box"
          classNamePrefix="select"
          options={laps}
          placeholder="Select Lap"
          onChange={setSelectedLap}
          isDisabled={isLapSelectDisabled}
          value={selectedLap}
        />
        <button onClick={toggleRacingLineVisibility}>Toggle Racing Line</button>
        <button onClick={() => setShowRacingLineControls(!showRacingLineControls)}>Toggle Racing Line Controls</button>
        {/* <input
          type="number"
          value={speedMultiplier}
          onChange={(e) => setSpeedMultiplier(e.target.value)}
          placeholder="Speed Multiplier"
        /> Add this input */}
      </div>

      <div className="live-info">
        <div className="info-box">
          <span className="label">Lap Time</span>
          <span className="value">{formatLapTime(currentLapTime)}</span>
        </div>

        <div className="info-box">
          <span className="label">Speed</span>
          <span className="value">{currentSpeed}</span>
        </div>

        
      </div>
      {currentFlag ? <FlagIndicator type={currentFlag} /> : null}
    </div>
  );
}

export default SimulationControls;