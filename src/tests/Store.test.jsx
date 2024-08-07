import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '../utils/store';

describe('useStore Zustand store', () => {
  beforeEach(() => {
    useStore.setState({
      dataLoaded: false,
      loading: false,
      startTimestamp: { current: 0 },
      sessionEndTime: { current: 0 },
      skipNextLap: false,
      time: 0,
      startTime: 0,
      manualStartTime: null,
      currentLap: 0,
      maxLaps: 0,
      currentLapTime: 0,
      lapsData: [],
      streamData: [],
      completedLapsData: {},
      driverStatusData: {},
      driverPositions: [],
      driverList: [],
      driversVisibility: [],
      selectedDriver: "HAM",
      selectedYear: null,
      selectedType: "race",
      isYearSelectDisabled: true,
      cameraMode: "free",
      isRacingLineVisible: false,
      translation: { x: 0, z: 0 },
      rotation: { x: 0 },
      speedData: null,
      brakeData: null,
      rpmData: null,
      currentSpeed: 0,
      speedMultiplierOverride: 1,
      weatherData: [],
      currentWeather: "sunny",
      isSoundMuted: true,
      flags: []
    });
  });

  it('should update dataLoaded state', () => {
    const store = useStore.getState();
    store.setDataLoaded(true);
    expect(useStore.getState().dataLoaded).toBe(true);
  });

  it('should update loading state', () => {
    const store = useStore.getState();
    store.setLoading(true);
    expect(useStore.getState().loading).toBe(true);
  });

  it('should update skipNextLap state', () => {
    const store = useStore.getState();
    store.setSkipNextLap(true);
    expect(useStore.getState().skipNextLap).toBe(true);
  });

  it('should update time state', () => {
    const store = useStore.getState();
    store.setTime(100);
    expect(useStore.getState().time).toBe(100);
  });

  it('should update startTime state', () => {
    const store = useStore.getState();
    store.setStartTime(50);
    expect(useStore.getState().startTime).toBe(50);
  });

  it('should update manualStartTime state', () => {
    const store = useStore.getState();
    store.setManualStartTime(30);
    expect(useStore.getState().manualStartTime).toBe(30);
  });

  it('should update currentLap state', () => {
    const store = useStore.getState();
    store.setCurrentLap(5);
    expect(useStore.getState().currentLap).toBe(5);
  });

  it('should update maxLaps state', () => {
    const store = useStore.getState();
    store.setMaxLaps(10);
    expect(useStore.getState().maxLaps).toBe(10);
  });

  it('should update currentLapTime state', () => {
    const store = useStore.getState();
    store.setCurrentLapTime(60);
    expect(useStore.getState().currentLapTime).toBe(60);
  });

  it('should update lapsData state', () => {
    const store = useStore.getState();
    const lapsData = [{ lap: 1, time: 90 }];
    store.setLapsData(lapsData);
    expect(useStore.getState().lapsData).toEqual(lapsData);
  });

  it('should update streamData state', () => {
    const store = useStore.getState();
    const streamData = [{ data: 'example' }];
    store.setStreamData(streamData);
    expect(useStore.getState().streamData).toEqual(streamData);
  });

  it('should update completedLapsData state', () => {
    const store = useStore.getState();
    const completedLapsData = { lap1: 'data' };
    store.setCompletedLapsData(completedLapsData);
    expect(useStore.getState().completedLapsData).toEqual(completedLapsData);
  });

  it('should update driverStatusData state', () => {
    const store = useStore.getState();
    const driverStatusData = { driver: 'status' };
    store.setDriverStatusData(driverStatusData);
    expect(useStore.getState().driverStatusData).toEqual(driverStatusData);
  });

  it('should update driverPositions state', () => {
    const store = useStore.getState();
    const driverPositions = ['P1', 'P2'];
    store.setDriverPositions(driverPositions);
    expect(useStore.getState().driverPositions).toEqual(driverPositions);
  });

  it('should update driverList state', () => {
    const store = useStore.getState();
    const driverList = ['Driver1', 'Driver2'];
    store.setDriverList(driverList);
    expect(useStore.getState().driverList).toEqual(driverList);
  });

  it('should toggle driversVisibility state', () => {
    const store = useStore.getState();
    store.toggleDriverVisibility('HAM');
    expect(useStore.getState().driversVisibility).toContain('HAM');
    store.toggleDriverVisibility('HAM');
    expect(useStore.getState().driversVisibility).not.toContain('HAM');
  });

  it('should update selectedDriver state', () => {
    const store = useStore.getState();
    store.setSelectedDriver('VER');
    expect(useStore.getState().selectedDriver).toBe('VER');
  });

  it('should update selectedYear state', () => {
    const store = useStore.getState();
    store.setSelectedYear(2022);
    expect(useStore.getState().selectedYear).toBe(2022);
  });

  it('should update selectedType state', () => {
    const store = useStore.getState();
    store.setSelectedType('qualifying');
    expect(useStore.getState().selectedType).toBe('qualifying');
  });

  it('should update isYearSelectDisabled state', () => {
    const store = useStore.getState();
    store.setIsYearSelectDisabled(false);
    expect(useStore.getState().isYearSelectDisabled).toBe(false);
  });

  it('should update cameraMode state', () => {
    const store = useStore.getState();
    store.setCameraMode('fixed');
    expect(useStore.getState().cameraMode).toBe('fixed');
  });

  it('should toggle isRacingLineVisible state', () => {
    const store = useStore.getState();
    store.toggleRacingLineVisibility();
    expect(useStore.getState().isRacingLineVisible).toBe(true);
    store.toggleRacingLineVisibility();
    expect(useStore.getState().isRacingLineVisible).toBe(false);
  });

  it('should update translation state', () => {
    const store = useStore.getState();
    const translation = { x: 10, z: 20 };
    store.setTranslation(translation);
    expect(useStore.getState().translation).toEqual(translation);
  });

  it('should update rotation state', () => {
    const store = useStore.getState();
    const rotation = { x: 30 };
    store.setRotation(rotation);
    expect(useStore.getState().rotation).toEqual(rotation);
  });

  it('should update speedData state', () => {
    const store = useStore.getState();
    const speedData = [1, 2, 3];
    store.setSpeedData(speedData);
    expect(useStore.getState().speedData).toEqual(speedData);
  });

  it('should update brakeData state', () => {
    const store = useStore.getState();
    const brakeData = [0.1, 0.2, 0.3];
    store.setBrakeData(brakeData);
    expect(useStore.getState().brakeData).toEqual(brakeData);
  });

  it('should update rpmData state', () => {
    const store = useStore.getState();
    const rpmData = [5000, 6000, 7000];
    store.setRpmData(rpmData);
    expect(useStore.getState().rpmData).toEqual(rpmData);
  });

  it('should update currentSpeed state', () => {
    const store = useStore.getState();
    store.setCurrentSpeed(120);
    expect(useStore.getState().currentSpeed).toBe(120);
  });

  it('should update speedMultiplierOverride state', () => {
    const store = useStore.getState();
    store.setSpeedMultiplierOverride(2);
    expect(useStore.getState().speedMultiplierOverride).toBe(2);
  });

  it('should update weatherData state', () => {
    const store = useStore.getState();
    const weatherData = [{ condition: 'rain' }];
    store.setWeatherData(weatherData);
    expect(useStore.getState().weatherData).toEqual(weatherData);
  });

  it('should update currentWeather state', () => {
    const store = useStore.getState();
    store.setCurrentWeather('cloudy');
    expect(useStore.getState().currentWeather).toBe('cloudy');
  });

  it('should update isSoundMuted state', () => {
    const store = useStore.getState();
    store.setIsSoundMuted(false);
    expect(useStore.getState().isSoundMuted).toBe(false);
  });

  it('should update flags state', () => {
    const store = useStore.getState();
    const flags = ['red'];
    store.setFlags(flags);
    expect(useStore.getState().flags).toEqual(flags);
  });
});
