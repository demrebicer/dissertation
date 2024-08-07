import { describe, it, expect, vi, beforeEach } from "vitest";
import { create, act } from "@react-three/test-renderer";
import { useGLTF } from "@react-three/drei";
import MovingCar from "../components/MovingCar";
import { useStore } from "../utils/store";

vi.mock("@react-three/drei", () => {
  const useGLTF = vi.fn(() => ({
    nodes: {},
    materials: {},
  }));
  useGLTF.preload = vi.fn();
  return { useGLTF };
});

vi.mock("../utils/store", () => ({
  useStore: vi.fn(),
}));

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

vi.mock("../assets/sounds/acceleration.mp3", () => ({
  default: "/mocked/path/to/acceleration.mp3",
}));
vi.mock("../assets/sounds/cruise.mp3", () => ({
  default: "/mocked/path/to/cruise.mp3",
}));
vi.mock("../assets/sounds/deceleration.mp3", () => ({
  default: "/mocked/path/to/deceleration.mp3",
}));

describe("MovingCar component", () => {
  const driverName = "TestDriver";
  const color = "red";
  const path = [
    { timestamp: 1, coordinates: [1, 1, 1] },
    { timestamp: 2, coordinates: [2, 2, 2] },
    { timestamp: 3, coordinates: [3, 3, 3] },
  ];
  const translation = { x: 0, y: 0, z: 0 };
  const rotation = { y: 0 };
  const scale = 1;

  beforeEach(() => {
    useStore.mockReturnValue({
      lapsData: [
        { DriverName: driverName, NumberOfLaps: 1, Time: 1 },
        { DriverName: driverName, NumberOfLaps: 1, Time: 2 },
        { DriverName: driverName, NumberOfLaps: 2, Time: 3 },
      ],
      startTime: 0,
      currentLap: 1,
      driversVisibility: [],
      time: 0,
      selectedDriver: driverName,
      cameraMode: "follow",
      isSoundMuted: false,
    });
  });

  it("should render the car with correct color", async () => {
    const mockGLTF = {
      nodes: {},
      materials: {},
    };

    useGLTF.mockReturnValue(mockGLTF);

    let component;
    await act(async () => {
      component = await create(
        <MovingCar driverName={driverName} path={path} color={color} translation={translation} rotation={rotation} scale={scale} />,
      );
    });

    expect(useGLTF).toHaveBeenCalledWith("/assets/f1_car.glb", true);
    expect(useGLTF.preload).toHaveBeenCalledWith("/assets/f1_car.glb");

    expect(component).toBeDefined();
  });
});
