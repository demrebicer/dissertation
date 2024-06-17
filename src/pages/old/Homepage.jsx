import React, { useEffect } from "react";
import Select from "react-select";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FullPageLoader from "../../components/FullPageLoader";
import "../assets/styles/homepage.scss";
import useStore from "../../utils/store";

const Homepage = () => {
  const {
    selectedYear,
    setSelectedYear,
    drivers,
    setDrivers,
    selectedDriver,
    setSelectedDriver,
    laps,
    setLaps,
    selectedLap,
    setSelectedLap,
    isDriverSelectDisabled,
    setIsDriverSelectDisabled,
    isLapSelectDisabled,
    setIsLapSelectDisabled,
    loading,
    setLoading,
    setTelemetryData,
  } = useStore();

  const navigate = useNavigate();

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

  const handleButtonClick = () => {
    if (selectedYear && selectedDriver && selectedLap) {
      setLoading(true);
      const url = `http://localhost:8000/telemetry/${selectedYear.value}/${selectedDriver.value}/${selectedLap.value}`;
      axios
        .get(url)
        .then((response) => {
          setTelemetryData(response.data);
          setLoading(false);
          navigate("/simulation");
        })
        .catch((error) => {
          console.error("Error fetching telemetry data:", error);
          setLoading(false);
        });
    } else {
      console.log("Please select a year, driver, and lap to run the simulation.");
    }
  };

  return (
    <div className="overlay">
      {loading && <FullPageLoader />}
      <div className="container">
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
        <button className="run-simulation-button" onClick={handleButtonClick}>
          Run simulation
        </button>
      </div>
    </div>
  );
};

export default Homepage;
