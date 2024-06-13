import { create } from "zustand";

const useStore = create((set) => ({
  telemetryData: null,
  selectedYear: null,
  selectedDriver: null,
  selectedLap: null,
  drivers: [],
  laps: [],
  isDriverSelectDisabled: true,
  isLapSelectDisabled: true,
  loading: false,
  cameraMode: "free",
  setTelemetryData: (data) => set({ telemetryData: data }),
  setSelectedYear: (year) => set({ selectedYear: year }),
  setSelectedDriver: (driver) => set({ selectedDriver: driver }),
  setSelectedLap: (lap) => set({ selectedLap: lap }),
  setDrivers: (drivers) => set({ drivers }),
  setLaps: (laps) => set({ laps }),
  setIsDriverSelectDisabled: (isDisabled) => set({ isDriverSelectDisabled: isDisabled }),
  setIsLapSelectDisabled: (isDisabled) => set({ isLapSelectDisabled: isDisabled }),
  setLoading: (isLoading) => set({ loading: isLoading }),
  setCameraMode: (mode) => set({ cameraMode: mode }),
  isRacingLineVisible: true,
  toggleRacingLineVisibility: () => set((state) => ({ isRacingLineVisible: !state.isRacingLineVisible })),
}));

export default useStore;
