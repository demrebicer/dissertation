import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const formatTime = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
};

const Timing = () => {
  const [lapsData, setLapsData] = useState([]);
  const [streamData, setStreamData] = useState([]);
  const [currentLap, setCurrentLap] = useState(0);
  const [maxLaps, setMaxLaps] = useState(0);
  const [time, setTime] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);
  const requestMade = useRef(false);
  const startTimestamp = useRef(null);

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

          const driver33 = response.data.stream_data.filter((entry) => entry.Driver === "33");
          console.log(driver33);

          const driver33laps = response.data.laps_data.filter((entry) => entry.Driver === "33");
          console.log(driver33laps);

          const driverWithMaxLaps = data.reduce((prev, current) => {
            return prev.NumberOfLaps > current.NumberOfLaps ? prev : current;
          });

          setMaxLaps(driverWithMaxLaps.NumberOfLaps);

          if (data.length > 0) {
            const minStreamTime = Math.min(
              ...response.data.stream_data
                .filter((entry) => entry.GapToLeader !== null && entry.IntervalToPositionAhead !== null)
                .map((entry) => parseFloat(entry.Time))
            );

            setStartTime(parseFloat(response.data.session_start_time));
            setTime(parseFloat(response.data.session_start_time));

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
    if (dataLoaded) {
      const interval = setInterval(() => {
        setTime(startTime + Math.floor((Date.now() - startTimestamp.current) / 1000));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [dataLoaded, startTime]);

  useEffect(() => {
    const maxCompletedLap = lapsData.reduce((maxLap, lap) => {
      if (time >= parseFloat(lap.Time) && lap.NumberOfLaps > maxLap) {
        return lap.NumberOfLaps;
      }
      return maxLap;
    }, 0);

    if (maxCompletedLap > currentLap) {
      setCurrentLap(maxCompletedLap);
    }
  }, [time, lapsData]);

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
    const nextLap = lapsData.find((lap) => lap.NumberOfLaps === currentLap + 1);
    if (nextLap) {
      setTime(parseFloat(nextLap.Time));
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
    <div>
      <h1>Timing Page</h1>
      <h2>
        Current Lap: {currentLap}/{maxLaps}
      </h2>
      <p>
        Time: {formatTime(time)}
      </p>
      <button onClick={handleSkipNextLap}>Skip Next Lap</button>
      <table>
        <thead>
          <tr>
            <th>Position</th>
            <th>Driver</th>
            <th>Driver Name</th>
            <th>Lap Time</th>
            <th>Gap to Leader</th>
            <th>Interval to Position Ahead</th>
          </tr>
        </thead>
        <tbody>
          {sortedLapsData.map((lap, index) => {
            const lapTime = lap.LapTime ? formatTime(parseFloat(lap.LapTime)) : null;
            const isDnf = !lapsData.some((l) => l.Driver === lap.Driver && l.NumberOfLaps === currentLap);
            return (
              <tr key={index}>
                <td>{lap.Position}</td>
                <td>{lap.Driver}</td>
                <td>{lap.DriverName}</td>
                <td>{lapTime || (isDnf ? "DNF" : "")}</td>
                <td>{lap.Position === 1 ? "Interval" : isDnf ? "DNF" : lap.GapToLeader}</td>
                <td>{lap.Position === 1 ? "Interval" : isDnf ? "DNF" : lap.IntervalToPositionAhead}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Timing;
