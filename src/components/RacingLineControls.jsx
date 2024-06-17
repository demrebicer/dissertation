import React from "react";

export default function RacingLineControls({ translation, setTranslation, rotation, setRotation }) {
  const resetTranslationX = () => setTranslation((prev) => ({ ...prev, x: 0 }));
  const resetTranslationZ = () => setTranslation((prev) => ({ ...prev, z: 0 }));
  const resetRotationY = () => setRotation({ y: 0 });

  return (
    <div className="racing-line-controls">
      <h3>Racing Line Controls</h3>
      <div>
        <label>
          Translation X:
          <input
            type="range"
            min="-10"
            max="10"
            step="0.5"
            value={translation.x}
            onChange={(e) => setTranslation({ ...translation, x: parseFloat(e.target.value) })}
          />
          <button onClick={resetTranslationX}>Reset</button>
        </label>
      </div>
      <div>
        <label>
          Translation Z:
          <input
            type="range"
            min="-10"
            max="10"
            step="0.5"
            value={translation.z}
            onChange={(e) => setTranslation({ ...translation, z: parseFloat(e.target.value) })}
          />
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
          <button onClick={resetRotationY}>Reset</button>
        </label>
      </div>
    </div>
  );
}
