import React from "react";
import { FaUndo } from "react-icons/fa";
import { Joystick, JoystickShape } from "react-joystick-component";

export default function RacingLineControls({ translation, setTranslation, rotation, setRotation, scale, setScale }) {
  const resetTranslationX = () => setTranslation((prev) => ({ ...prev, x: 0 }));
  const resetTranslationZ = () => setTranslation((prev) => ({ ...prev, z: 0 }));
  const resetRotationY = () => setRotation({ y: 0 });
  const resetScale = () => setScale(1);

  // On joystick move update translation
  function moveJoystick(e) {
    const { x, y } = e;
    const scaledX = x * 100;
    const scaledZ = y * -100;

    setTranslation({ x: scaledX, z: scaledZ });
  }

  return (
    <div className="racing-line-controls">
      <h3>Racing Line Controls</h3>
      <div>Translation:</div>
      <div className="translation-control-group">
        <Joystick
          size={40}
          stickSize={20}
          start={() => console.log("Started")}
          baseShape={JoystickShape.Square}
          stickShape={JoystickShape.Square}
          move={(e) => moveJoystick(e)}
          stop={() => console.log("Stopped")}
          stickColor="#fff"
          baseColor="rgba(0, 0, 0, 0.7)"
        />

        <div className="input-wrapper">
          <span className="prefix">X</span>
          <input
            className="number-input"
            type="number"
            value={translation.x.toFixed(2)}
            onChange={(e) => setTranslation({ ...translation, x: parseFloat(e.target.value) })}
          />
          <span className="suffix">
            <button onClick={resetTranslationX}>
              <FaUndo />
            </button>
          </span>
        </div>

        <div className="input-wrapper">
          <span className="prefix">Z</span>
          <input
            className="number-input"
            type="number"
            value={translation.z.toFixed(2)}
            onChange={(e) => setTranslation({ ...translation, z: parseFloat(e.target.value) })}
            data-prefix="Z"
          />
          <span className="suffix">
            <button onClick={resetTranslationZ}>
              <FaUndo />
            </button>
          </span>
        </div>
      </div>

      <div>Rotation Y:</div>
      <div className="control-group">
        <input
          className="slider-input"
          type="range"
          min="-180"
          max="180"
          value={rotation.y}
          onChange={(e) => setRotation({ ...rotation, y: parseFloat(e.target.value) })}
        />
        <span>{rotation.y.toFixed(2)}</span>
        <button onClick={resetRotationY}>
          <FaUndo />
        </button>
      </div>

      <div>Scale:</div>
      <div className="control-group">
        <input
          className="slider-input"
          type="range"
          value={scale}
          min="0.1"
          max="3"
          step="0.01"
          onChange={(e) => setScale(parseFloat(e.target.value))}
        />
        <span>{scale.toFixed(2)}</span>
        <button onClick={resetScale}>
          <FaUndo />
        </button>
      </div>
    </div>
  );
}
