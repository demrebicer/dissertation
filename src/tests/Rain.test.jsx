import React, { useRef } from "react";
import { create } from "@react-three/test-renderer";
import { act } from "react-dom/test-utils";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Rain from "../components/Rain";
import { useStore } from "../utils/store";
import ResizeObserver from "resize-observer-polyfill";
import { useFrame } from "@react-three/fiber";

global.ResizeObserver = ResizeObserver;

vi.mock("@react-three/fiber", async () => {
  const actual = await vi.importActual("@react-three/fiber");
  return {
    ...actual,
    useFrame: vi.fn(),
  };
});

vi.mock("../utils/store", () => ({
  useStore: vi.fn(),
}));

describe("Rain", () => {
  let renderer;

  beforeEach(() => {
    vi.useFakeTimers();
    useStore.mockReturnValue({
      currentWeather: "sunny",
      setCurrentWeather: vi.fn(),
      weatherData: [],
      time: 0,
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    if (renderer) renderer.unmount();
  });

  it("does not render rain when currentWeather is sunny", async () => {
    await act(async () => {
      renderer = await create(<Rain />);
    });
    const instance = renderer.scene;
    expect(instance.children.find((child) => child.type === "LineSegments")).toBeUndefined();
  });

  it("renders rain when currentWeather is rainy", async () => {
    useStore.mockReturnValue({
      currentWeather: "rainy",
      setCurrentWeather: vi.fn(),
      weatherData: [],
      time: 0,
    });

    await act(async () => {
      renderer = await create(<Rain />);
    });
    const instance = renderer.scene;
    expect(instance.children.find((child) => child.type === "LineSegments")).toBeDefined();
  });

  it("changes weather state based on weatherData and time", async () => {
    const setCurrentWeather = vi.fn();
    useStore.mockReturnValue({
      currentWeather: "sunny",
      setCurrentWeather,
      weatherData: [{ Time: 1, Rainfall: true }],
      time: 2,
    });

    await act(async () => {
      renderer = await create(<Rain />);
    });

    expect(setCurrentWeather).toHaveBeenCalledWith("rainy");
  });

  it("does not render rain when currentWeather is not rainy", async () => {
    useStore.mockReturnValue({
      currentWeather: "cloudy",
      setCurrentWeather: vi.fn(),
      weatherData: [],
      time: 0,
    });

    await act(async () => {
      renderer = await create(<Rain />);
    });
    const instance = renderer.scene;
    expect(instance.children.find((child) => child.type === "LineSegments")).toBeUndefined();
  });

  it("does not change weather state when weatherData and time do not match", async () => {
    const setCurrentWeather = vi.fn();
    useStore.mockReturnValue({
      currentWeather: "sunny",
      setCurrentWeather,
      weatherData: [{ Time: 1, Rainfall: false }],
      time: 2,
    });

    await act(async () => {
      renderer = await create(<Rain />);
    });

    expect(setCurrentWeather).toHaveBeenCalled();
  });

  it("updates rain particle positions in useFrame", async () => {
    const rainRef = { current: { geometry: { attributes: { position: { array: new Float32Array(12), needsUpdate: false } } } } };
    const useRefSpy = vi.spyOn(React, "useRef").mockReturnValue(rainRef);

    useStore.mockReturnValue({
      currentWeather: "rainy",
      setCurrentWeather: vi.fn(),
      weatherData: [],
      time: 0,
    });

    let frameCallback;
    useFrame.mockImplementation((callback) => {
      frameCallback = callback;
    });

    await act(async () => {
      renderer = await create(<Rain />);
    });

    // Initialize positions
    rainRef.current.geometry.attributes.position.array.set([0, 500, 0, 0, 490, 0, 0, 500, 0, 0, 490, 0]);

    // Simulate a frame
    act(() => {
      frameCallback();
    });

    // Check positions
    const positions = rainRef.current.geometry.attributes.position.array;
    expect(positions).toEqual(new Float32Array([0, 500, 0, 0, 490, 0, 0, 500, 0, 0, 490, 0]));
    expect(rainRef.current.geometry.attributes.position.needsUpdate).toBe(false);

    // Simulate more frames to trigger reset logic
    act(() => {
      for (let i = 0; i < 300; i++) {
        frameCallback();
      }
    });

    expect(positions[1]).toBe(500);
    expect(positions[4]).toBe(490);

    useRefSpy.mockRestore();
  });
});
