import React from 'react';
import { create } from '@react-three/test-renderer';
import { act } from 'react-dom/test-utils';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Rain from '../components/Rain';
import { useStore } from '../utils/store';
import ResizeObserver from 'resize-observer-polyfill';

global.ResizeObserver = ResizeObserver;

vi.mock('../utils/store', () => ({
  useStore: vi.fn(),
}));

describe('Rain', () => {
  let renderer;

  beforeEach(() => {
    vi.useFakeTimers();
    useStore.mockReturnValue({
      currentWeather: 'sunny',
      setCurrentWeather: vi.fn(),
      weatherData: [],
      time: 0,
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    if (renderer) renderer.unmount();
  });

  it('does not render rain when currentWeather is sunny', async () => {
    await act(async () => {
      renderer = await create(<Rain />);
    });
    const instance = renderer.scene;
    expect(instance.children.find(child => child.type === 'LineSegments')).toBeUndefined();
  });

  it('renders rain when currentWeather is rainy', async () => {
    useStore.mockReturnValue({
      currentWeather: 'rainy',
      setCurrentWeather: vi.fn(),
      weatherData: [],
      time: 0,
    });

    await act(async () => {
      renderer = await create(<Rain />);
    });
    const instance = renderer.scene;
    expect(instance.children.find(child => child.type === 'LineSegments')).toBeDefined();
  });

  it('changes weather state based on weatherData and time', async () => {
    const setCurrentWeather = vi.fn();
    useStore.mockReturnValue({
      currentWeather: 'sunny',
      setCurrentWeather,
      weatherData: [{ Time: 1, Rainfall: true }],
      time: 2,
    });

    await act(async () => {
      renderer = await create(<Rain />);
    });

    expect(setCurrentWeather).toHaveBeenCalledWith('rainy');
  });
});
