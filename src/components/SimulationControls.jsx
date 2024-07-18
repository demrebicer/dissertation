import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useStore } from "../utils/store";
import { Tooltip } from "react-tooltip";

import CloudIcon from "../assets/images/cloud_icon.png";
import RainIcon from "../assets/images/rain_icon.png";
import SunIcon from "../assets/images/sun_icon.png";
import TrackIcon from "../assets/images/track_icon.png";

import FlagIndicator from "./FlagIndicator";
import RacingLineControls from "./RacingLineControls";

import { FaVideo, FaCarSide, FaTv, FaExpand, FaExpandArrowsAlt, FaVolumeUp, FaVolumeMute } from "react-icons/fa";
import "../assets/styles/simulationControls.scss";

function SimulationControls({ translation, setTranslation, rotation, setRotation, scale, setScale }) {
  const {
    selectedYear,
    setSelectedYear,
    selectedType,
    setSelectedType,
    cameraMode,
    setCameraMode,
    toggleRacingLineVisibility,
    isRacingLineVisible,
    isYearSelectDisabled,
    setIsYearSelectDisabled,
    currentWeather,
    setCurrentWeather,
    isSoundMuted,
    setIsSoundMuted,
    loading,
  } = useStore();

  const [showRacingLineControls, setShowRacingLineControls] = useState(false);

  const years = [
    { value: 2018, label: 2018 },
    { value: 2019, label: 2019 },
    { value: 2020, label: 2020 },
    { value: 2021, label: 2021 },
    { value: 2022, label: 2022 },
    { value: 2023, label: 2023 },
    { value: 2024, label: 2024 },
  ];

  const typeOptions = [
    { value: "race", label: "Race" },
    { value: "qualifying", label: "Qualifying" },
  ];

  const resetAfterType = () => {
    setSelectedYear(null);
    setIsYearSelectDisabled(true);
  };

  useEffect(() => {
    resetAfterType();
    if (selectedType) {
      setIsYearSelectDisabled(false);
    }
  }, [selectedType]);

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
            isDisabled={loading}
          />
          <Select
            className="select-box"
            classNamePrefix="select"
            options={years}
            placeholder="Select Year"
            onChange={setSelectedYear}
            isDisabled={isYearSelectDisabled || loading}
            value={selectedYear}
          />
        </div>

        <div className="section-title">Camera Modes</div>

        <div className="camera-modes">
          <button
            className={`icon-button ${cameraMode === "free" ? "selected" : ""}`}
            onClick={() => setCameraMode("free")}
            data-tooltip-id="my-tooltip"
            data-tooltip-content="Free Camera"
          >
            <FaVideo size={24} />
          </button>
          <button
            className={`icon-button ${cameraMode === "follow" ? "selected" : ""}`}
            onClick={() => setCameraMode("follow")}
            data-tooltip-id="my-tooltip"
            data-tooltip-content="Follow Camera"
          >
            <FaCarSide size={24} />
          </button>
          <button
            className={`icon-button ${cameraMode === "tv" ? "selected" : ""}`}
            onClick={() => setCameraMode("tv")}
            data-tooltip-id="my-tooltip"
            data-tooltip-content="TV Camera"
          >
            <FaTv size={24} />
          </button>
        </div>

        <div className="section-title">Tools</div>
        <div className="tools">
          <button
            className={`icon-button ${showRacingLineControls ? "selected" : ""}`}
            onClick={() => setShowRacingLineControls(!showRacingLineControls)}
            data-tooltip-id="my-tooltip"
            data-tooltip-content="Toggle Racing Line Controls"
          >
            <FaExpandArrowsAlt />
          </button>
          <button
            className={`icon-button ${isRacingLineVisible ? "selected" : ""}`}
            onClick={toggleRacingLineVisibility}
            data-tooltip-id="my-tooltip"
            data-tooltip-content="Toggle Racing Line"
          >
            <img src={TrackIcon} alt="Track" />
          </button>
          <button
            className="icon-button"
            onClick={() => {
              // FullScreen Toggle
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

        <div className="tools tools-row">
          <button
            className="icon-button"
            onClick={() => setIsSoundMuted(!isSoundMuted)}
            data-tooltip-id="my-tooltip"
            data-tooltip-content="Toggle Mute Sound"
          >
            {isSoundMuted ? <FaVolumeMute size={24} /> : <FaVolumeUp size={24} />}
          </button>
        </div>

        <div className="section-title">Weather</div>
        <div className="weather">
          <button
            className={`icon-button ${currentWeather === "sunny" ? "selected" : ""}`}
            onClick={() => setCurrentWeather("sunny")}
            data-tooltip-id="my-tooltip"
            data-tooltip-content="Sunny Weather"
          >
            <img src={SunIcon} alt="Sun" />
          </button>
          <button
            className={`icon-button ${currentWeather === "cloudy" ? "selected" : ""}`}
            onClick={() => setCurrentWeather("cloudy")}
            data-tooltip-id="my-tooltip"
            data-tooltip-content="Cloudy Weather"
          >
            <img src={CloudIcon} alt="Cloud" />
          </button>
          <button
            className={`icon-button ${currentWeather === "rainy" ? "selected" : ""}`}
            onClick={() => setCurrentWeather("rainy")}
            data-tooltip-id="my-tooltip"
            data-tooltip-content="Rainy Weather"
          >
            <img src={RainIcon} alt="Rain" />
          </button>
        </div>

        <Tooltip id="my-tooltip" place="bottom" />
      </div>

      <FlagIndicator />
    </div>
  );
}

export default SimulationControls;
