import { useEffect } from "react";
import Select from "react-select";
import useStore from "../utils/store";
import axios from "axios";

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
    toggleRacingLineVisibility,
    setDrivers,
    setIsDriverSelectDisabled,
    setIsLapSelectDisabled,
    setLaps,
    setLoading,
    setTelemetryData,
    setLapDuration,
  } = useStore();

  const years = [
    { value: 2018, label: 2018 },
    { value: 2019, label: 2019 },
    { value: 2020, label: 2020 },
    { value: 2021, label: 2021 },
    { value: 2022, label: 2022 },
    { value: 2023, label: 2023 },
  ];

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
          setTelemetryData(response.data.telemetry);
          setLapDuration(response.data.lap_duration)
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching telemetry data:", error);
          setLoading(false);
        });
    }
  }, [selectedYear, selectedDriver, selectedLap, setTelemetryData, setLoading]);

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
