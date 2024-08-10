import React, { useEffect, useCallback } from "react";
import accurateInterval from "accurate-interval";
import "../assets/styles/positionsTable.scss";
import { FaAngleDoubleRight, FaEye, FaEyeSlash } from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import { useStore } from "../utils/store";

export const formatTime = (timeInSeconds) => {
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = Math.floor(timeInSeconds % 60);

  const paddedHours = String(hours).padStart(2, "0");
  const paddedMinutes = String(minutes).padStart(2, "0");
  const paddedSeconds = String(seconds).padStart(2, "0");

  return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
};

const PositionsTable = () => {
  const {
    lapsData,
    streamData,
    completedLapsData,
    driverStatusData,
    currentLap,
    setCurrentLap,
    maxLaps,
    time,
    setTime,
    startTime,
    manualStartTime,
    setManualStartTime,
    dataLoaded,
    driverPositions,
    setDriverPositions,
    startTimestamp,
    sessionEndTime,
    setSkipNextLap,
    setDriverList,
    driversVisibility,
    toggleDriverVisibility,
    selectedDriver,
    setSelectedDriver,
  } = useStore((state) => state);

  useEffect(() => {
    let interval;
    if (dataLoaded) {
      interval = accurateInterval(
        () => {
          const now = Date.now();
          const elapsedTime = (now - startTimestamp.current) / 1000;
          let newTime = (manualStartTime !== null ? manualStartTime : startTime) + elapsedTime;

          if (newTime > sessionEndTime.current) {
            newTime = sessionEndTime.current;
          }

          setTime(parseFloat(newTime.toFixed(3)));

          const nextLap = lapsData.find((lap) => parseFloat(lap.Time) > newTime);
          if (nextLap) {
            const lapIndex = lapsData.indexOf(nextLap);
            if (currentLap !== lapIndex + 1 && lapIndex + 1 <= maxLaps) {
              setCurrentLap(lapIndex + 1);
            }
          } else if (currentLap !== lapsData.length + 1 && lapsData.length + 1 <= maxLaps) {
            setCurrentLap(lapsData.length + 1);
          }

          // Driver positions data update
          const updatedDriverPositions = getDriverPositions(newTime, currentLap);
          setDriverPositions(updatedDriverPositions);
        },
        1, // Update interval set to 20 milliseconds
        { aligned: true, immediate: true },
      );
    }

    return () => {
      if (interval) {
        interval.clear();
      }
    };
  }, [dataLoaded, startTime, manualStartTime, lapsData, currentLap, maxLaps]);

  const getDriverPositions = useCallback(
    (currentTime, currentLap) => {
      const currentLapData = lapsData.filter((lap) => lap.NumberOfLaps === currentLap);
      const driversInCurrentLap = new Set(currentLapData.map((lap) => lap.Driver));

      // Add DNF drivers to currentLapData
      const dnfDrivers = Object.keys(driverStatusData).filter(
        (driver) => driverStatusData[driver] === "DNF" && !driversInCurrentLap.has(driver),
      );

      dnfDrivers.forEach((driver) => {
        const teamColor = lapsData.find((lap) => lap.Driver === driver)?.TeamColor || "transparent";
        currentLapData.push({ Driver: driver, TeamColor: teamColor });
      });

      const updatedDriverPositions = currentLapData.map((lap) => {
        const positionData = getCurrentPositionData(lap.Driver, currentTime, currentLap);
        return { ...lap, ...positionData };
      });

      // Add +1 Lap drivers
      const plusOneLapDrivers = Object.keys(completedLapsData).filter(
        (driver) => completedLapsData[driver] === currentLap - 1 && !driversInCurrentLap.has(driver),
      );

      plusOneLapDrivers.forEach((driver) => {
        const teamColor = lapsData.find((lap) => lap.Driver === driver)?.TeamColor || "transparent";
        const driverData = getCurrentPositionData(driver, currentTime, currentLap);
        updatedDriverPositions.push({ Driver: driver, TeamColor: teamColor, ...driverData });
      });

      const allDrivers = updatedDriverPositions.reduce((acc, lap) => {
        if (!acc.some((driver) => driver.Driver === lap.Driver)) {
          acc.push(lap);
        }
        return acc;
      }, []);

      const sortedLapsData = allDrivers.sort((a, b) => {
        if (a.Position === "DNF") return 1;
        if (b.Position === "DNF") return -1;
        if (a.Position === "Finished") return -1;
        if (b.Position === "Finished") return 1;
        return a.Position - b.Position;
      });

      const uniquePositions = new Set();
      sortedLapsData.forEach((lap, index) => {
        if (uniquePositions.has(lap.Position)) {
          lap.Position = index + 1;
        }
        uniquePositions.add(lap.Position);
      });

      // Get driver names who have finished the race
      const finishedDrivers = updatedDriverPositions
        .filter((driver) => driver.GapToLeader === "Finished")
        .map((driver) => {
          const lap = lapsData.find((lap) => lap.Driver === driver.Driver);
          return lap ? lap.DriverName : driver.Driver;
        });

      // Get driver names for DNF drivers
      const dnfDriverNames = dnfDrivers.map((driver) => {
        const lap = lapsData.find((lap) => lap.Driver === driver);
        return lap ? lap.DriverName : driver;
      });

      // Get all driver names
      const allDriverNames = lapsData.filter((lap) => lap.NumberOfLaps === 1).map((lap) => lap.DriverName);

      // Create an object with driver names and their DNF status
      const driverList = {};
      allDriverNames.forEach((driver) => {
        driverList[driver] = !dnfDriverNames.includes(driver) && !finishedDrivers.includes(driver);
      });

      // console.log(driverList);
      setDriverList(driverList);

      return sortedLapsData;
    },
    [lapsData, driverStatusData, completedLapsData],
  );

  const getCurrentPositionData = useCallback(
    (driver, currentTime, currentLap) => {
      const currentTimeData = streamData
        .filter((entry) => entry.Driver === driver && parseFloat(entry.Time) <= currentTime)
        .reduce((closest, entry) => {
          const entryTime = parseFloat(entry.Time);
          if (!closest || entryTime > parseFloat(closest.Time)) {
            return entry;
          }
          return closest;
        }, null);

      const completedLaps = completedLapsData[driver];
      const driverStatus = driverStatusData[driver];

      if (!currentTimeData) {
        if (driverStatus === "DNF") {
          return { Position: "DNF", GapToLeader: "DNF", IntervalToPositionAhead: "DNF" };
        } else if (completedLaps === maxLaps - 1) {
          return { Position: lapsData.length + 1, GapToLeader: "+1 Lap", IntervalToPositionAhead: "+1 Lap" };
        } else {
          return { Position: lapsData.length + 1, GapToLeader: "Finished", IntervalToPositionAhead: "Finished" };
        }
      }

      if (currentLap === maxLaps) {
        if (currentTime >= sessionEndTime.current) {
          if (driverStatus !== "DNF") {
            return { ...currentTimeData, GapToLeader: "Finished", IntervalToPositionAhead: "Finished" };
          }
        }  else if (driverStatus === "Finished") {
          const lastStreamData = streamData
            .filter((entry) => entry.Driver === driver)
            .reduce((latest, entry) => {
              const entryTime = parseFloat(entry.Time);
              if (!latest || entryTime > parseFloat(latest.Time)) {
                return entry;
              }
              return latest;
            }, null);
      
          if (lastStreamData && parseFloat(lastStreamData.Time) <= currentTime) {
            return { ...currentTimeData, GapToLeader: "Finished", IntervalToPositionAhead: "Finished" };
          }
        } else if (driverStatus === "+1 Lap" && currentLap > completedLapsData[driver]) {
          return { ...currentTimeData, GapToLeader: "+1 Lap", IntervalToPositionAhead: "+1 Lap" };
        }
      }

      return currentTimeData;
    },
    [streamData, completedLapsData, driverStatusData, maxLaps, lapsData],
  );

  const handleSkipNextLap = () => {
    if (currentLap < maxLaps) {
      const currentLapData = lapsData.find((lap) => lap.NumberOfLaps === currentLap);
      if (currentLapData) {
        const nextLapTime = parseFloat(currentLapData.Time);
        setManualStartTime(nextLapTime);
        setTime(nextLapTime);
        setCurrentLap(currentLap + 1);
        startTimestamp.current = Date.now();
        setSkipNextLap(true); // Set the skip flag
      }
    }
  };

  return (
    <div className="positions-table">
      <FaAngleDoubleRight
        className="skip-next-lap"
        onClick={handleSkipNextLap}
        size={24}
        data-tooltip-content="Skip Next Lap"
        data-tooltip-id="my-tooltip"
        aria-label="Skip Next Lap"
        data-testid="skip-next-lap"
      />
      <div className="lap-info">
        <div className="lap-title">LAP</div>
        <div className="lap-count">
          {currentLap} / {maxLaps}
        </div>
        <div className="lap-time">{formatTime(time)}</div>
        {/* <div className="lap-time">{time.toFixed(3)}</div> */}
      </div>
      <div className="separator"></div>
      <div className="drivers">
        {driverPositions.map((driver, index) => {
          const isDnf = driverStatusData[driver.Driver] === "DNF" && completedLapsData[driver.Driver] < currentLap;

          return (
            <div
              className="driver"
              key={index}
              style={{
                background: driver.DriverName === selectedDriver ? "rgba(255, 255, 255, 0.2)" : "transparent",
              }}
              onClick={(e) => {
                if (!e.target.closest(".visible-toggle") && !driversVisibility.includes(driver.DriverName)) {
                  setSelectedDriver(driver.DriverName);
                }
              }}
            >
              <div className="position-container">
                <div className="position">{driver.Position}</div>
              </div>
              <div className="team-color" style={{ background: driver.TeamColor }}></div>
              <div className="abbreviation">{driver.DriverName}</div>
              <div className="interval-to-position-ahead">
                {driver.Position === 1 ? "Leader" : isDnf ? "DNF" : driver.IntervalToPositionAhead}
              </div>
              <div className="visible-toggle">
                {driversVisibility.includes(driver.DriverName) ? (
                  <FaEyeSlash
                    size={24}
                    onClick={() => {
                      toggleDriverVisibility(driver.DriverName);
                    }}
                    data-testid="eye-slash-icon"
                  />
                ) : (
                  <FaEye
                    size={24}
                    onClick={() => {
                      toggleDriverVisibility(driver.DriverName);
                    }}
                  />
                )}
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
