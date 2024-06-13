import React from "react";
import Select from "react-select";
import useStore from "../utils/store";

function SimulationControls() {
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
    toggleRacingLineVisibility
  } = useStore();

  const years = [
    { value: 2018, label: 2018 },
    { value: 2019, label: 2019 },
    { value: 2020, label: 2020 },
    { value: 2021, label: 2021 },
    { value: 2022, label: 2022 },
    { value: 2023, label: 2023 },
  ];

  return (
    <div className="controls">
      <button onClick={() => setCameraMode("free")}>Free Camera</button>
      <button onClick={() => setCameraMode("follow")}>Follow Camera</button>
      <Select
        className="select-box"
        classNamePrefix="select"
        options={years}
        placeholder="Select Year"
        onChange={setSelectedYear}
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
    </div>
  );
}

export default SimulationControls;