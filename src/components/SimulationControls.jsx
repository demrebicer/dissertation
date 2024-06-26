import React, { useEffect, useState } from "react";
import Select from "react-select";
import useStore from "../utils/store";
import axios from "axios";
import FlagIndicator from "./FlagIndicator";
import RacingLineControls from "./RacingLineControls";
import { Tooltip } from "react-tooltip";

import CloudIcon from "../assets/images/cloud_icon.png";
import RainIcon from "../assets/images/rain_icon.png";
import SunIcon from "../assets/images/sun_icon.png";
import TrackIcon from "../assets/images/track_icon.png";

import { FaVideo, FaCarSide, FaTv, FaExpand, FaExpandArrowsAlt } from "react-icons/fa";
import "../assets/styles/newSimulationControls.scss";

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
    setCurrentLapTime,
    setCurrentSpeed,
  } = useStore();

  const [flags, setFlags] = useState([]);
  const [currentFlag, setCurrentFlag] = useState(null);
  const [speedMultiplier, setSpeedMultiplier] = useState(3);
  const [showRacingLineControls, setShowRacingLineControls] = useState(false);

  const years = [
    { value: 2018, label: 2018 },
    { value: 2019, label: 2019 },
    { value: 2020, label: 2020 },
    { value: 2021, label: 2021 },
    { value: 2022, label: 2022 },
    { value: 2023, label: 2023 },
  ];

  const typeOptions = [
    { value: "race", label: "Race" },
    { value: "qualifying", label: "Qualifying" },
  ];

  const resetAfterType = () => {
    setSelectedYear(null);
    resetAfterYear();
    setIsYearSelectDisabled(true);
  };

  const resetAfterYear = () => {
    setSelectedDriver(null);
    resetAfterDriver();
    setDrivers([]);
    setIsDriverSelectDisabled(true);
  };

  const resetAfterDriver = () => {
    setSelectedLap(null);
    setLaps([]);
    setCurrentLapTime(0);
    setCurrentSpeed(0);
    setIsLapSelectDisabled(true);
  };

  useEffect(() => {
    resetAfterType();
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
          setIsDriverSelectDisabled(false);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching drivers:", error);
          setIsDriverSelectDisabled(true);
          setLoading(false);
        });
    } else {
      resetAfterYear();
    }
  }, [selectedYear, selectedType]);

  useEffect(() => {
    if (selectedDriver) {
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
      resetAfterDriver();
    }
  }, [selectedDriver, selectedYear, selectedType]);

  useEffect(() => {
    console.log("Selected lap:", selectedLap);
    if (selectedLap && selectedYear && selectedDriver && selectedType) {
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
    } else {
      setTelemetryData(null);
      setLapDuration(null);
      setSpeedData(null);
      setFlags([]);
      setBrakeData(null);
      setRpmData(null);
      setIsRaining(null);
    }
  }, [selectedLap]);

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
    <RacingLineControls
      translation={translation}
      setTranslation={setTranslation}
      rotation={rotation}
      setRotation={setRotation}
      scale={scale}
      setScale={setScale}
    />
  )}
  <div className="race-configuration-container">
    <div className="race-configuration-title">Race Configuration</div>

    <div className="dropdowns">
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
    </div>

    <div className="section-title">Camera Modes</div>

    <div className="camera-modes">
      <button
        className="icon-button"
        onClick={() => setCameraMode("free")}
        data-tooltip-id="my-tooltip"
        data-tooltip-content="Free Camera"
      >
        <FaVideo size={24} />
      </button>
      <button
        className="icon-button"
        onClick={() => setCameraMode("follow")}
        data-tooltip-id="my-tooltip"
        data-tooltip-content="Follow Camera"
      >
        <FaCarSide size={24} />
      </button>
      <button className="icon-button" onClick={() => setCameraMode("tv")} data-tooltip-id="my-tooltip" data-tooltip-content="TV Camera">
        <FaTv size={24} />
      </button>
    </div>

    <div className="section-title">Tools</div>
    <div className="tools">
      <button
        className="icon-button"
        onClick={() => setShowRacingLineControls(!showRacingLineControls)}
        data-tooltip-id="my-tooltip"
        data-tooltip-content="Toggle Racing Line Controls"
      >
        <FaExpandArrowsAlt />
      </button>
      <button
        className="icon-button"
        onClick={toggleRacingLineVisibility}
        data-tooltip-id="my-tooltip"
        data-tooltip-content="Toggle Racing Line"
      >
        <img src={TrackIcon} alt="Track" />
      </button>
      <button
        className="icon-button"
        onClick={() => {
          //FullScreen Toggle
          const elem = document.documentElement;
          if (!document.fullscreenElement) {
            elem.requestFullscreen().then(() => {
              console.log("Entered fullscreen");
            });
          } else {
            document.exitFullscreen().then(() => {
              console.log("Exited fullscreen");
            });
          }
        }}
        data-tooltip-id="my-tooltip"
        data-tooltip-content="Toggle Fullscreen"
      >
        <FaExpand />
      </button>
    </div>

    <div className="section-title">Weather</div>
    <div className="weather">
      <button className="icon-button" data-tooltip-id="my-tooltip" data-tooltip-content="Sunny Weather">
        <img src={SunIcon} alt="Sun" />
      </button>
      <button className="icon-button" data-tooltip-id="my-tooltip" data-tooltip-content="Cloudy Weather">
        <img src={CloudIcon} alt="Cloud" />
      </button>
      <button className="icon-button" data-tooltip-id="my-tooltip" data-tooltip-content="Rainy Weather">
        <img src={RainIcon} alt="Rain" />
      </button>
    </div>

    <Tooltip id="my-tooltip" place="bottom" />
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
