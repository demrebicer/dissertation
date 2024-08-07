import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { expect, it, describe, vi, beforeEach, afterEach } from 'vitest';
import RacingLineControls from '../components/RacingLineControls';
import '@testing-library/jest-dom';

describe('RacingLineControls', () => {
  let translation, setTranslation, rotation, setRotation, scale, setScale;

  beforeEach(() => {
    translation = { x: 0, z: 0 };
    setTranslation = vi.fn((newTranslation) => {
      translation = { ...translation, ...newTranslation };
    });

    rotation = { y: 0 };
    setRotation = vi.fn((newRotation) => {
      rotation = { ...rotation, ...newRotation };
    });

    scale = 1;
    setScale = vi.fn((newScale) => {
      scale = newScale;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <RacingLineControls
        translation={translation}
        setTranslation={setTranslation}
        rotation={rotation}
        setRotation={setRotation}
        scale={scale}
        setScale={setScale}
      />
    );

    expect(screen.getByText('Racing Line Controls')).toBeInTheDocument();
    expect(screen.getByText('Translation:')).toBeInTheDocument();
    expect(screen.getByText('Rotation Y:')).toBeInTheDocument();
    expect(screen.getByText('Scale:')).toBeInTheDocument();
  });

  it('updates translation x on input change', () => {
    render(
      <RacingLineControls
        translation={translation}
        setTranslation={setTranslation}
        rotation={rotation}
        setRotation={setRotation}
        scale={scale}
        setScale={setScale}
      />
    );

    const inputX = screen.getByTestId('input-translation-x');
    fireEvent.change(inputX, { target: { value: '5' } });

    expect(setTranslation).toHaveBeenCalledWith({ x: 5, z: translation.z });
    expect(translation.x).toBe(5);
  });

  it('updates rotation y on slider change', () => {
    render(
      <RacingLineControls
        translation={translation}
        setTranslation={setTranslation}
        rotation={rotation}
        setRotation={setRotation}
        scale={scale}
        setScale={setScale}
      />
    );

    const rotationSlider = screen.getByTestId('slider-rotation-y');
    fireEvent.change(rotationSlider, { target: { value: '45' } });

    expect(setRotation).toHaveBeenCalledWith({ y: 45 });
    expect(rotation.y).toBe(45);
  });

  it('resets rotation y on button click', () => {
    render(
      <RacingLineControls
        translation={translation}
        setTranslation={setTranslation}
        rotation={{ y: 45 }}
        setRotation={setRotation}
        scale={scale}
        setScale={setScale}
      />
    );

    const resetButtonY = screen.getByTestId('reset-rotation-y');
    fireEvent.click(resetButtonY);

    expect(setRotation).toHaveBeenCalledWith({ y: 0 });
    expect(rotation.y).toBe(0);
  });

  it('updates scale on slider change', () => {
    render(
      <RacingLineControls
        translation={translation}
        setTranslation={setTranslation}
        rotation={rotation}
        setRotation={setRotation}
        scale={scale}
        setScale={setScale}
      />
    );

    const scaleSlider = screen.getByTestId('slider-scale');
    fireEvent.change(scaleSlider, { target: { value: '2' } });

    expect(setScale).toHaveBeenCalledWith(2);
    expect(scale).toBe(2);
  });

  it('resets scale on button click', () => {
    render(
      <RacingLineControls
        translation={translation}
        setTranslation={setTranslation}
        rotation={rotation}
        setRotation={setRotation}
        scale={2}
        setScale={setScale}
      />
    );

    const resetButtonScale = screen.getByTestId('reset-scale');
    fireEvent.click(resetButtonScale);

    expect(setScale).toHaveBeenCalledWith(1);
    expect(scale).toBe(1);
  });
});
