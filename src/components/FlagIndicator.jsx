import React, { useEffect, useState } from "react";
import { LuFlag } from "react-icons/lu";
import { FaCar, FaCarCrash, FaCarSide, FaExclamationTriangle, FaStop } from "react-icons/fa"; // Ekstra ikonlar için
import PropTypes from "prop-types";
import "../assets/styles/flagIndicator.scss";

export default function FlagIndicator({ type }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Component render edildikten sonra animasyonu başlatmak için
    setTimeout(() => {
      setVisible(true);
    }, 100); // 100ms gecikme ile animasyonu başlat
  }, []);

  const renderIcon = () => {
    switch (type) {
      case "yellow":
        return <FaExclamationTriangle color="white" size={24} />;
      case "red":
        return <FaStop color="white" size={24} />;
      case "green":
        return <LuFlag color="white" size={24} />;
      case "safety-car":
        return <FaCar color="white" size={24} />;
      case "virtual-safety-car":
        return <FaCarSide color="white" size={24} />;
      case "virtual-safety-car-ending":
        return <FaCarCrash color="white" size={24} />;
      default:
        return <LuFlag color="white" size={24} />;
    }
  };

  const renderText = () => {
    switch (type) {
      case "safety-car":
        return "Safety Car";
      case "virtual-safety-car":
        return "Virtual Safety Car";
      case "virtual-safety-car-ending":
        return "Virtual Safety Car Ending";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1) + " Flag";
    }
  };

  return (
    <div className={`flag-container ${type} ${visible ? "visible" : ""}`}>
      <div className="flag-frame">
        <div className="flag-icon">{renderIcon()}</div>
        <div className="flag-text-container">
          <span className="flag-text">{renderText()}</span>
        </div>
      </div>
    </div>
  );
}

FlagIndicator.propTypes = {
  type: PropTypes.oneOf(["red", "yellow", "green", "safety-car", "virtual-safety-car", "virtual-safety-car-ending"]).isRequired,
};
