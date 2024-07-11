import { create } from "zustand";

const useStore = create((set) => ({
  lapsData: [],
  setLapsData: (data) => set({ lapsData: data }),
  streamData: [],
  setStreamData: (data) => set({ streamData: data }),
  completedLapsData: {},
  setCompletedLapsData: (data) => set({ completedLapsData: data }),
  driverStatusData: {},
  setDriverStatusData: (data) => set({ driverStatusData: data }),
  currentLap: 0,
  setCurrentLap: (lap) => set({ currentLap: lap }),
  maxLaps: 0,
  setMaxLaps: (laps) => set({ maxLaps: laps }),
  time: 0,
  setTime: (time) => set({ time: time }),
  startTime: 0,
  setStartTime: (time) => set({ startTime: time }),
  manualStartTime: null,
  setManualStartTime: (time) => set({ manualStartTime: time }),
  dataLoaded: false,
  setDataLoaded: (loaded) => set({ dataLoaded: loaded }),
  driverPositions: [],
  setDriverPositions: (positions) => set({ driverPositions: positions }),
  requestMade: { current: false },
  startTimestamp: { current: 0 },
  sessionEndTime: { current: 0 },
  manualSkip: false,
  setManualSkip: (skip) => set({ manualSkip: skip }),
  skipNextLap: false,
  setSkipNextLap: (value) => set({ skipNextLap: value }),
  driverList: [],
  setDriverList: (list) => set({ driverList: list }),
  driversVisibility: [],
  toggleDriverVisibility: (driver) => {
    set((state) => {
      if (state.driversVisibility.includes(driver)) {
        return { driversVisibility: state.driversVisibility.filter((d) => d !== driver) };
      } else {
        return { driversVisibility: [...state.driversVisibility, driver] };
      }
    });
  },
}));

export { useStore } 