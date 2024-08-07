import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { expect, it, describe, vi, beforeEach, afterEach } from 'vitest';
import { useStore } from '../utils/store';
import SimulationControls from '../components/SimulationControls';
import '@testing-library/jest-dom';
import { waitFor } from '@testing-library/react';

vi.mock('../utils/store', () => ({
  useStore: vi.fn(),
}));

describe('SimulationControls', () => {
  const mockStore = {
    selectedYear: null,
    setSelectedYear: vi.fn(),
    selectedType: null,
    setSelectedType: vi.fn(),
    cameraMode: 'free',
    setCameraMode: vi.fn(),
    toggleRacingLineVisibility: vi.fn(),
    isRacingLineVisible: false,
    isYearSelectDisabled: false,
    setIsYearSelectDisabled: vi.fn(),
    currentWeather: 'sunny',
    setCurrentWeather: vi.fn(),
    isSoundMuted: false,
    setIsSoundMuted: vi.fn(),
    loading: false,
  };

  beforeEach(() => {
    useStore.mockReturnValue(mockStore);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<SimulationControls />);
    expect(screen.getByText('BRITISH GRAND PRIX')).toBeInTheDocument();
    expect(screen.getByText('Race Configuration')).toBeInTheDocument();
    expect(screen.getByText('Camera Modes')).toBeInTheDocument();
    expect(screen.getByText('Tools')).toBeInTheDocument();
    expect(screen.getByText('Weather')).toBeInTheDocument();
  });

  it('sets the selected year', async () => {
    render(<SimulationControls />);
    
    const element = await waitFor(() => screen.getByLabelText('Select Year'));

    fireEvent.keyDown(element, { key: 'Enter', code: 'Enter' });

    expect(mockStore.setSelectedYear).toHaveBeenCalled();
  });

  it('toggles camera mode', () => {
    render(<SimulationControls />);
    fireEvent.click(screen.getByLabelText('Free Camera'));
    expect(mockStore.setCameraMode).toHaveBeenCalledWith('free');
    fireEvent.click(screen.getByLabelText('Follow Camera'));
    expect(mockStore.setCameraMode).toHaveBeenCalledWith('follow');
    fireEvent.click(screen.getByLabelText('TV Camera'));
    expect(mockStore.setCameraMode).toHaveBeenCalledWith('tv');
  });

  it('toggles racing line visibility', () => {
    render(<SimulationControls />);
    fireEvent.click(screen.getByLabelText('Toggle Racing Line'));
    expect(mockStore.toggleRacingLineVisibility).toHaveBeenCalled();
  });

  it('sets weather to sunny', () => {
    render(<SimulationControls />);
    fireEvent.click(screen.getByLabelText('Sunny Weather'));
    expect(mockStore.setCurrentWeather).toHaveBeenCalledWith('sunny');
  });

  it('sets weather to cloudy', () => {
    render(<SimulationControls />);
    fireEvent.click(screen.getByLabelText('Cloudy Weather'));
    expect(mockStore.setCurrentWeather).toHaveBeenCalledWith('cloudy');
  });

  it('sets weather to rainy', () => {
    render(<SimulationControls />);
    fireEvent.click(screen.getByLabelText('Rainy Weather'));
    expect(mockStore.setCurrentWeather).toHaveBeenCalledWith('rainy');
  });

  it('toggles sound mute', () => {
    render(<SimulationControls />);
    fireEvent.click(screen.getByLabelText('Toggle Mute Sound'));
    expect(mockStore.setIsSoundMuted).toHaveBeenCalledWith(true);
  });
});
