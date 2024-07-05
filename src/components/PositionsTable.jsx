import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import accurateInterval from "accurate-interval";
import "../assets/styles/positionsTable.scss";
import { FaAngleDoubleRight } from "react-icons/fa";
import { Tooltip } from "react-tooltip";

const formatTime = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
};

const PositionsTable = () => {
  const [lapsData, setLapsData] = useState([]);
  const [streamData, setStreamData] = useState([]);
  const [currentLap, setCurrentLap] = useState(0);
  const [maxLaps, setMaxLaps] = useState(0);
  const [time, setTime] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [manualStartTime, setManualStartTime] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const requestMade = useRef(false);
  const startTimestamp = useRef(0);
  const sessionEndTime = useRef(0);

  useEffect(() => {
    if (!requestMade.current) {
      requestMade.current = true;

      axios
        .get("http://localhost:8000/timing/2021/R")
        .then((response) => {
          const data = response.data.laps_data;
          setLapsData(data);
          setStreamData(response.data.stream_data);
          setCurrentLap(1);
          setMaxLaps(response.data.total_laps);

          if (data.length > 0) {
            const sessionStartTime = parseFloat(response.data.session_start_time);
            const endTime = parseFloat(response.data.session_end_time);
            setStartTime(sessionStartTime);
            setTime(sessionStartTime);
            sessionEndTime.current = endTime;
            setDataLoaded(true);
            startTimestamp.current = Date.now();
          }
        })
        .catch((error) => {
          console.error("Error fetching the data:", error);
        });
    }
  }, []);

  useEffect(() => {
    let interval;
    if (dataLoaded) {
      interval = accurateInterval(
        () => {
          const now = Date.now();
          const elapsedTime = Math.floor((now - startTimestamp.current) / 1000);
          let newTime = (manualStartTime !== null ? manualStartTime : startTime) + elapsedTime;

          if (newTime > sessionEndTime.current) {
            newTime = sessionEndTime.current;
          }

          setTime(newTime);

          const nextLap = lapsData.find((lap) => parseFloat(lap.Time) > time);
          if (nextLap) {
            const lapIndex = lapsData.indexOf(nextLap);
            if (currentLap !== lapIndex + 1 && lapIndex + 1 <= maxLaps) {
              setCurrentLap(lapIndex + 1);
            }
          } else if (currentLap !== lapsData.length + 1 && lapsData.length + 1 <= maxLaps) {
            setCurrentLap(lapsData.length + 1);
          }
        },
        1000,
        { aligned: true, immediate: true },
      );
    }

    return () => {
      if (interval) {
        interval.clear();
      }
    };
  }, [dataLoaded, startTime, manualStartTime, lapsData, currentLap, time, maxLaps]);

  const getCurrentPositionData = (driver) => {
    const currentTimeData = streamData
      .filter((entry) => entry.Driver === driver)
      .reduce((closest, entry) => {
        const entryTime = parseFloat(entry.Time);
        if (entryTime <= time && (!closest || entryTime > parseFloat(closest.Time))) {
          return entry;
        }
        return closest;
      }, null);

    if (!currentTimeData) {
      return { Position: "DNF", GapToLeader: "DNF", IntervalToPositionAhead: "DNF" };
    }

    if (currentLap === maxLaps && lapsData.some((lap) => lap.Driver === driver && lap.NumberOfLaps === maxLaps)) {
      return { ...currentTimeData, GapToLeader: "Finished", IntervalToPositionAhead: "Finished" };
    }

    return currentTimeData;
  };

  const handleSkipNextLap = () => {
    if (currentLap < maxLaps) {
      const currentLapData = lapsData.find((lap) => lap.NumberOfLaps === currentLap);
      if (currentLapData) {
        const nextLapTime = parseFloat(currentLapData.Time);
        setManualStartTime(nextLapTime);
        setTime(nextLapTime);
        setCurrentLap(currentLap + 1);
        startTimestamp.current = Date.now();
      }
    }
  };

  const combinedData = lapsData.map((lap) => {
    const positionData = getCurrentPositionData(lap.Driver);
    return { ...lap, ...positionData };
  });

  const allDrivers = combinedData.reduce((acc, lap) => {
    if (!acc.some((driver) => driver.Driver === lap.Driver)) {
      acc.push(lap);
    }
    return acc;
  }, []);

  const sortedLapsData = allDrivers.sort((a, b) => {
    if (a.Position === "DNF") return 1;
    if (b.Position === "DNF") return -1;
    return a.Position - b.Position;
  });

  const uniquePositions = new Set();
  sortedLapsData.forEach((lap, index) => {
    if (uniquePositions.has(lap.Position)) {
      lap.Position = index + 1;
    }
    uniquePositions.add(lap.Position);
  });

  return (
    <div className="positions-table">
      <FaAngleDoubleRight
        className="skip-next-lap"
        onClick={handleSkipNextLap}
        size={24}
        data-tooltip-content="Skip Next Lap"
        data-tooltip-id="my-tooltip"
      />
      <div className="lap-info">
        <div className="lap-title">LAP</div>
        <div className="lap-count">
          {currentLap} / {maxLaps}
        </div>
        <div className="lap-time">{formatTime(time)}</div>
      </div>
      <div className="separator"></div>
      <div className="drivers">
        {sortedLapsData.map((driver, index) => {
          const isDnf = !lapsData.some((l) => {

            if (l.Driver === "63") {
              // console.log(l);
            }

            return l.Driver === driver.Driver && l.NumberOfLaps === currentLap;
          });

          return (
            <div className="driver" key={index}>
              <div className="position-container">
                <div className="position">{driver.Position}</div>
              </div>
              <div className="team-color" style={{ background: driver.TeamColor }}></div>
              <div className="abbreviation">{driver.DriverName}</div>
              <div className="interval-to-position-ahead">
                {driver.Position === 1 ? "Leader" : isDnf ? "DNF" : driver.IntervalToPositionAhead}
              </div>
            </div>
          );
        })}
      </div>

      <Tooltip id="my-tooltip" place="bottom" />
    </div>
  );
};

export default PositionsTable;
