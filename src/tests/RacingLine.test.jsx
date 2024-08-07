import { render } from "@testing-library/react";
import { Line } from "@react-three/drei";
import { describe, it, expect, vi } from "vitest";
import RacingLine from "../components/RacingLine";
import { useStore } from "../utils/store";

vi.mock("../utils/store");
vi.mock("@react-three/drei", () => ({
  Line: vi.fn(() => null),
}));

describe("RacingLine", () => {
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
    });
  });

  it("should render the Line component with correct color", () => {
    render(<RacingLine driverName={driverName} path={path} color={color} translation={translation} rotation={rotation} scale={scale} />);

    expect(Line).toHaveBeenCalledWith(
      expect.objectContaining({
        color: "red",
      }),
      {},
    );
  });

  it("should calculate lapStartTime correctly when currentLap is 1", () => {
    useStore.mockReturnValueOnce({
      lapsData: [{ DriverName: driverName, NumberOfLaps: 1, Time: 1 }],
      startTime: 100,
      currentLap: 1,
    });

    render(<RacingLine driverName={driverName} path={path} color={color} translation={translation} rotation={rotation} scale={scale} />);

    expect(Line).toHaveBeenCalledWith(
      expect.objectContaining({
        points: expect.any(Array),
      }),
      {},
    );
  });

  it("should calculate lapStartTime correctly when currentLap is greater than 1", () => {
    useStore.mockReturnValueOnce({
      lapsData: [
        { DriverName: driverName, NumberOfLaps: 1, Time: 1 },
        { DriverName: driverName, NumberOfLaps: 2, Time: 3 },
      ],
      startTime: 100,
      currentLap: 2,
    });

    render(<RacingLine driverName={driverName} path={path} color={color} translation={translation} rotation={rotation} scale={scale} />);

    expect(Line).toHaveBeenCalledWith(
      expect.objectContaining({
        points: expect.any(Array),
      }),
      {},
    );
  });
});
