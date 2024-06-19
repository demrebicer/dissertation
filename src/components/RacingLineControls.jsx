import React from "react";

export default function RacingLineControls({ translation, setTranslation, rotation, setRotation, scale, setScale }) {
  const resetTranslationX = () => setTranslation((prev) => ({ ...prev, x: 0 }));
  const resetTranslationZ = () => setTranslation((prev) => ({ ...prev, z: 0 }));
  const resetRotationY = () => setRotation({ y: 0 });
  const resetScale = () => setScale(1);

  return (
    <div className="racing-line-controls">
      <h3>Racing Line Controls</h3>
      <div>
        <label>
          Translation X:
          <input
            type="range"
            min="-100"
            max="100"
            step="0.5"
            value={translation.x}
            onChange={(e) => setTranslation({ ...translation, x: parseFloat(e.target.value) })}
          />
          <span>{translation.x.toFixed(1)}</span>
          <button onClick={resetTranslationX}>Reset</button>
        </label>
      </div>
      <div>
        <label>
          Translation Z:
          <input
            type="range"
            min="-100"
            max="100"
            step="0.5"
            value={translation.z}
            onChange={(e) => setTranslation({ ...translation, z: parseFloat(e.target.value) })}
          />
          <span>{translation.z.toFixed(1)}</span>
          <button onClick={resetTranslationZ}>Reset</button>
        </label>
      </div>
      <div>
        <label>
          Rotation Y:
          <input
            type="range"
            min="-180"
            max="180"
            value={rotation.y}
            onChange={(e) => setRotation({ ...rotation, y: parseFloat(e.target.value) })}
          />
          <span>{rotation.y.toFixed(1)}</span>
          <button onClick={resetRotationY}>Reset</button>
        </label>
      </div>
      <div>
        <label>
          Scale:
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.01"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
          />
          <span>{scale.toFixed(2)}</span>
          <button onClick={resetScale}>Reset</button>
        </label>
      </div>
    </div>
  );
}