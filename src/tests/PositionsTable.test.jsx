import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PositionsTable from "../components/PositionsTable";
import { useStore } from "../utils/store";
import { formatTime } from "../components/PositionsTable";

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
  beforeEach(() => {
    vi.clearAllMocks();
    useStore.mockReturnValue(mockStore);
  });

  it("renders the component correctly", () => {
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

  it("toggles driver visibility when eye icon is clicked", () => {
    const mockToggleDriverVisibility = vi.fn();
    const mockDriverPositions = [{ DriverName: "driver1" }];

    useStore.mockReturnValue({
      ...mockStore,
      toggleDriverVisibility: mockToggleDriverVisibility,
      driverPositions: mockDriverPositions,
      driversVisibility: ["driver1"],
    });

    render(<PositionsTable />);

    const eyeSlashIcon = screen.getByTestId("eye-slash-icon");
    fireEvent.click(eyeSlashIcon);

    expect(mockToggleDriverVisibility).toHaveBeenCalledWith("driver1");
  });

  it("updates timer correctly based on elapsed time", async () => {
    const mockSetTime = vi.fn();
    const mockStartTimestamp = { current: Date.now() - 5000 };
    const mockSessionEndTime = { current: Date.now() + 10000 };

    useStore.mockReturnValue({
      ...mockStore,
      setTime: mockSetTime,
      startTimestamp: mockStartTimestamp,
      sessionEndTime: mockSessionEndTime,
      dataLoaded: true,
    });

    render(<PositionsTable />);

    await waitFor(() => {
      expect(mockSetTime).toHaveBeenCalled();
    });
  });

  it("formats time correctly", () => {
    expect(formatTime(0)).toBe("00:00:00");
    expect(formatTime(3661)).toBe("01:01:01");
    expect(formatTime(86399)).toBe("23:59:59");
  });

  it("gets current position data correctly", async () => {
    const mockStreamData = [
      { Driver: "driver1", Time: "5", Position: 1, Lap: 1 },
      { Driver: "driver1", Time: "10", Position: 2, Lap: 1 },
      { Driver: "driver2", Time: "15", Position: 1, Lap: 1 },
    ];
    const mockCompletedLapsData = { driver1: 1, driver2: 1 };
    const mockDriverStatusData = { driver1: "Finished", driver2: "DNF" };
    const mockSetDriverPositions = vi.fn();

    useStore.mockReturnValue({
      ...mockStore,
      streamData: mockStreamData,
      completedLapsData: mockCompletedLapsData,
      driverStatusData: mockDriverStatusData,
      setDriverPositions: mockSetDriverPositions,
      lapsData: [
        { Driver: "driver1", NumberOfLaps: 1, Time: "10", Position: 1, TeamColor: "red" },
        { Driver: "driver2", NumberOfLaps: 1, Time: "20", Position: 2, TeamColor: "blue" },
      ],
      currentLap: 1,
      dataLoaded: true,
    });

    render(<PositionsTable />);

    // Wait for the useEffect to trigger and update the state
    await waitFor(() => {
      expect(mockSetDriverPositions).toHaveBeenCalled();
    });

    // Check if the function was called with the correct arguments
    const expectedCallArgs = [
      {
        Driver: "driver1",
        NumberOfLaps: 1,
        Time: "10",
        Position: 3,
        TeamColor: "red",
        GapToLeader: "Finished",
        IntervalToPositionAhead: "Finished",
      },
      {
        Driver: "driver2",
        NumberOfLaps: 1,
        Time: "20",
        Position: "DNF",
        TeamColor: "blue",
        GapToLeader: "DNF",
        IntervalToPositionAhead: "DNF",
      },
    ];

    expect(mockSetDriverPositions).toHaveBeenCalledWith(expect.arrayContaining(expectedCallArgs));
  });
});
