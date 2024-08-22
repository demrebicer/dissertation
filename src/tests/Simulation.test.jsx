import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi } from "vitest";
import { useStore } from "../utils/store";
import Simulation from "../pages/Simulation";

vi.mock("@react-three/fiber", () => ({
  Canvas: ({ children }) => <div>{children}</div>,
  useFrame: vi.fn(),
}));
vi.mock("@react-three/drei", () => {
  const useGLTF = vi.fn(() => ({
    nodes: {},
    materials: {},
    scene: {
      scale: {
        set: vi.fn(),
      },
      traverse: vi.fn(),
    },
  }));
  useGLTF.preload = vi.fn();
  return { useGLTF, OrbitControls: () => null, Sky: () => null, BakeShadows: () => null };
});
vi.mock("../utils/store");
vi.mock("axios");

global.AudioContext = vi.fn().mockImplementation(() => ({
  createGain: () => ({
    connect: vi.fn(),
    gain: {
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
      setTargetAtTime: vi.fn(),
      value: 1,
    },
  }),
  createOscillator: () => ({
    connect: vi.fn(),
    start: vi.fn(),
  }),
  createBufferSource: () => ({
    connect: vi.fn(),
    start: vi.fn(),
  }),
  destination: {},
}));

vi.mock("three", async () => {
  const actualThree = await vi.importActual("three");
  return {
    ...actualThree,
    AudioLoader: vi.fn().mockImplementation(() => ({
      load: vi.fn((url, callback) => {
        callback(null);
      }),
    })),
  };
});

describe("Simulation Component", () => {
  let mockUseStore;

  beforeEach(() => {
    mockUseStore = {
      setLapsData: vi.fn(),
      setStreamData: vi.fn(),
      setCompletedLapsData: vi.fn(),
      setDriverStatusData: vi.fn(),
      setCurrentLap: vi.fn(),
      setMaxLaps: vi.fn(),
      setStartTime: vi.fn(),
      setTime: vi.fn(),
      setDataLoaded: vi.fn(),
      startTimestamp: { current: 0 },
      sessionEndTime: { current: 0 },
      driverList: { 1: true },
      currentWeather: "sunny",
      cameraMode: "free",
      selectedYear: { value: 2023 },
      setSelectedYear: vi.fn(),
      selectedType: { value: "R" },
      setSelectedType: vi.fn(),
      loading: false,
      setLoading: vi.fn(),
      setFlags: vi.fn(),
      setWeatherData: vi.fn(),
      selectedDriver: 1,
      isRacingLineVisible: true,
      driverPositions: [{ DriverName: "driver1" }],
      driverStatusData: {},
      driversVisibility: [],
      toggleDriverVisibility: vi.fn(),
      weatherData: [],
      lapsData: [],
      isYearSelectDisabled: false,
      setIsYearSelectDisabled: vi.fn(),
    };
    useStore.mockReturnValue(mockUseStore);
  });

  it("renders the Simulation component", () => {
    render(<Simulation />);
    expect(screen.getByText("BRITISH GRAND PRIX")).toBeInTheDocument();
    expect(screen.getByText("LAP")).toBeInTheDocument();
  });
});
