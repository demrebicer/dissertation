import { create } from "zustand";

const useStore = create((set) => ({
  // General State
  dataLoaded: false,
  setDataLoaded: (loaded) => set({ dataLoaded: loaded }),

  loading: false,
  setLoading: (value) => set({ loading: value }),

  requestMade: { current: false },

  startTimestamp: { current: 0 },

  sessionEndTime: { current: 0 },

  manualSkip: false,
  setManualSkip: (skip) => set({ manualSkip: skip }),

  skipNextLap: false,
  setSkipNextLap: (value) => set({ skipNextLap: value }),

  // Time and Lap State
  time: 0,
  setTime: (time) => set({ time: time }),

  startTime: 0,
  setStartTime: (time) => set({ startTime: time }),

  manualStartTime: null,
  setManualStartTime: (time) => set({ manualStartTime: time }),

  currentLap: 0,
  setCurrentLap: (lap) => set({ currentLap: lap }),

  maxLaps: 0,
  setMaxLaps: (laps) => set({ maxLaps: laps }),

  currentLapTime: 0,
  setCurrentLapTime: (time) => set({ currentLapTime: time }),

  lapDuration: null,
  setLapDuration: (data) => set({ lapDuration: data }),

  // Driver and Lap Data
  lapsData: [],
  setLapsData: (data) => set({ lapsData: data }),

  streamData: [],
  setStreamData: (data) => set({ streamData: data }),

  completedLapsData: {},
  setCompletedLapsData: (data) => set({ completedLapsData: data }),

  driverStatusData: {},
  setDriverStatusData: (data) => set({ driverStatusData: data }),

  driverPositions: [],
  setDriverPositions: (positions) => set({ driverPositions: positions }),

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

  telemetryData: null,
  setTelemetryData: (data) => set({ telemetryData: data }),

  selectedDriver: "HAM",
  setSelectedDriver: (driver) => set({ selectedDriver: driver }),

  drivers: [],
  setDrivers: (drivers) => set({ drivers }),

  laps: [],
  setLaps: (laps) => set({ laps }),

  // Selection State
  selectedYear: null,
  setSelectedYear: (year) => set({ selectedYear: year }),

  selectedLap: null,
  setSelectedLap: (lap) => set({ selectedLap: lap }),

  selectedType: null,
  setSelectedType: (type) => set({ selectedType: type }),

  isDriverSelectDisabled: true,
  setIsDriverSelectDisabled: (isDisabled) => set({ isDriverSelectDisabled: isDisabled }),

  isLapSelectDisabled: true,
  setIsLapSelectDisabled: (isDisabled) => set({ isLapSelectDisabled: isDisabled }),

  isYearSelectDisabled: true,
  setIsYearSelectDisabled: (isDisabled) => set({ isYearSelectDisabled: isDisabled }),

  // Camera and View State
  cameraMode: "free",
  setCameraMode: (mode) => set({ cameraMode: mode }),

  isRacingLineVisible: false,
  toggleRacingLineVisibility: () => set((state) => ({ isRacingLineVisible: !state.isRacingLineVisible })),

  translation: { x: 0, z: 0 },
  setTranslation: (translation) => set({ translation }),

  rotation: { x: 0 },
  setRotation: (rotation) => set({ rotation }),

  // Telemetry Data
  speedData: null,
  setSpeedData: (data) => set({ speedData: data }),

  brakeData: null,
  setBrakeData: (data) => set({ brakeData: data }),

  rpmData: null,
  setRpmData: (data) => set({ rpmData: data }),

  // Speed and Weather State
  currentSpeed: 0,
  setCurrentSpeed: (speed) => set({ currentSpeed: speed }),

  speedMultiplierOverride: 1,
  setSpeedMultiplierOverride: (value) => set({ speedMultiplierOverride: value }),

  weatherData: [],
  setWeatherData: (data) => set({ weatherData: data }),

  currentWeather: "sunny",
  setCurrentWeather: (weather) => set({ currentWeather: weather }),

  isSoundMuted: true,
  setIsSoundMuted: (isMuted) => set({ isSoundMuted: isMuted }),

  // Flag Data
  flags: [],
  setFlags: (flags) => set({ flags }),
}));

export { useStore };
