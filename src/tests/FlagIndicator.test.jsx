import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import FlagIndicator from '../components/FlagIndicator';
import { useStore } from '../utils/store';

vi.mock('../utils/store', () => ({
  useStore: vi.fn(),
}));

describe('FlagIndicator', () => {
  beforeEach(() => {
    useStore.mockReturnValue({ time: 0, flags: [] });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders nothing if currentFlag is invalid', () => {
    render(<FlagIndicator />);
    const flagContainer = screen.queryByTestId('flag-container');
    expect(flagContainer).not.toBeInTheDocument();
  });

  it('renders All Clear flag', () => {
    const flags = [{ Time: 1, Status: '1' }];
    useStore.mockReturnValue({ time: 1, flags });
    render(<FlagIndicator />);
    expect(screen.getByText('All Clear')).toBeInTheDocument();
  });

  it('renders Yellow Flag', () => {
    const flags = [{ Time: 2, Status: '2' }];
    useStore.mockReturnValue({ time: 2, flags });
    render(<FlagIndicator />);
    expect(screen.getByText('Yellow Flag')).toBeInTheDocument();
  });

  it('renders Safety Car flag', () => {
    const flags = [{ Time: 3, Status: '4' }];
    useStore.mockReturnValue({ time: 3, flags });
    render(<FlagIndicator />);
    expect(screen.getByText('Safety Car')).toBeInTheDocument();
  });

  it('renders Red Flag', () => {
    const flags = [{ Time: 4, Status: '5' }];
    useStore.mockReturnValue({ time: 4, flags });
    render(<FlagIndicator />);
    expect(screen.getByText('Red Flag')).toBeInTheDocument();
  });

  it('renders Virtual Safety Car flag', () => {
    const flags = [{ Time: 5, Status: '6' }];
    useStore.mockReturnValue({ time: 5, flags });
    render(<FlagIndicator />);
    expect(screen.getByText('Virtual Safety Car')).toBeInTheDocument();
  });

  it('renders Virtual Safety Car Ending flag', () => {
    const flags = [{ Time: 6, Status: '7' }];
    useStore.mockReturnValue({ time: 6, flags });
    render(<FlagIndicator />);
    expect(screen.getByText('Virtual Safety Car Ending')).toBeInTheDocument();
  });
});
