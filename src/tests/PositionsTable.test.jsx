import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import PositionsTable from "../components/PositionsTable";
import { useStore } from "../utils/store";

vi.mock("../utils/store", () => ({
  useStore: vi.fn(),
}));

const mockStore = {
  lapsData: [],
  streamData: [],
  completedLapsData: {},
  driverStatusData: {},
  currentLap: 1,
  setCurrentLap: vi.fn(),
  maxLaps: 10,
  time: 0,
  setTime: vi.fn(),
  startTime: 0,
  manualStartTime: null,
  setManualStartTime: vi.fn(),
  dataLoaded: true,
  driverPositions: [],
  setDriverPositions: vi.fn(),
  startTimestamp: { current: Date.now() },
  sessionEndTime: { current: Date.now() + 10000 },
  setSkipNextLap: vi.fn(),
  setDriverList: vi.fn(),
  driversVisibility: [],
  toggleDriverVisibility: vi.fn(),
  selectedDriver: null,
  setSelectedDriver: vi.fn(),
};

describe("PositionsTable", () => {
  it("renders the component correctly", () => {
    useStore.mockReturnValue(mockStore);

    render(<PositionsTable />);

    expect(screen.getByText("LAP")).toBeTruthy();
    expect(screen.getByText("1 / 10")).toBeTruthy();
    expect(screen.getByText("00:00:00")).toBeTruthy();
  });

  it("calls handleSkipNextLap on button click", () => {
    const mockSetManualStartTime = vi.fn();
    const mockSetTime = vi.fn();
    const mockSetCurrentLap = vi.fn();
    const mockSetSkipNextLap = vi.fn();
    const mockStartTimestamp = { current: Date.now() };

    useStore.mockReturnValue({
      ...mockStore,
      setCurrentLap: mockSetCurrentLap,
      setTime: mockSetTime,
      setManualStartTime: mockSetManualStartTime,
      setSkipNextLap: mockSetSkipNextLap,
      startTimestamp: mockStartTimestamp,
      lapsData: [
        { NumberOfLaps: 1, Time: "10" },
        { NumberOfLaps: 2, Time: "20" },
      ],
    });

    render(<PositionsTable />);

    const skipButton = screen.getByTestId("skip-next-lap");
    fireEvent.click(skipButton);

    expect(mockSetManualStartTime).toHaveBeenCalledWith(10);
    expect(mockSetTime).toHaveBeenCalledWith(10);
    expect(mockSetCurrentLap).toHaveBeenCalledWith(2);
    expect(mockSetSkipNextLap).toHaveBeenCalledWith(true);
  });

  it("selects driver when clicked", () => {
    const mockSetSelectedDriver = vi.fn();

    useStore.mockReturnValue({
      ...mockStore,
      setSelectedDriver: mockSetSelectedDriver,
      driverPositions: [{ DriverName: "driver1" }],
    });

    render(<PositionsTable />);

    const driverElement = screen.getByText("driver1");
    fireEvent.click(driverElement);

    expect(mockSetSelectedDriver).toHaveBeenCalledWith("driver1");
  });
});
