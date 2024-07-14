import React, { useEffect, useState } from "react";
import { useStore } from "../utils/store";
import { LuFlag } from "react-icons/lu";
import { FaCar, FaCarCrash, FaCarSide, FaExclamationTriangle, FaStop } from "react-icons/fa";
import PropTypes from "prop-types";
import "../assets/styles/flagIndicator.scss";

export default function FlagIndicator() {
  const { time, flags } = useStore();
  const [currentFlag, setCurrentFlag] = useState(null);
  const [visible, setVisible] = useState(false);
  const [initialLoadTime, setInitialLoadTime] = useState(null);

  useEffect(() => {
    // Set the initial load time once time is not zero
    if (time !== 0 && initialLoadTime === null) {
      setInitialLoadTime(time);
    }
  }, [time]);

  useEffect(() => {
    if (flags && flags.length > 0 && initialLoadTime !== null) {
      // Find the current flag based on the global time and ignore flags older than initialLoadTime
      const currentFlagData = flags
        .filter(flag => flag.Time <= time && flag.Time >= initialLoadTime)
        .sort((a, b) => b.Time - a.Time)[0];

      if (currentFlagData) {
        setCurrentFlag(currentFlagData.Status);
      } else {
        setCurrentFlag(null);
      }
    }
  }, [time, flags, initialLoadTime]);

  useEffect(() => {
    if (currentFlag === "1") { // All Clear
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    } else if (currentFlag) {
      setVisible(true);
    }
  }, [currentFlag]);

  const getFlagClass = () => {
    switch (currentFlag) {
      case "2":
        return "yellow";
      case "5":
        return "red";
      case "1":
        return "all-clear";
      case "4":
        return "safety-car";
      case "6":
        return "virtual-safety-car";
      case "7":
        return "virtual-safety-car-ending";
      default:
        return "";
    }
  };

  const renderIcon = () => {
    switch (currentFlag) {
      case "1":
        return <LuFlag color="white" size={24} />;
      case "2":
        return <FaExclamationTriangle color="white" size={24} />;
      case "4":
        return <FaCar color="white" size={24} />;
      case "5":
        return <FaStop color="white" size={24} />;
      case "6":
        return <FaCarSide color="white" size={24} />;
      case "7":
        return <FaCarCrash color="white" size={24} />;
      default:
        return <LuFlag color="white" size={24} />;
    }
  };

  const renderText = () => {
    switch (currentFlag) {
      case "2":
        return "Yellow Flag";
      case "4":
        return "Safety Car";
      case "5":
        return "Red Flag";
      case "6":
        return "Virtual Safety Car";
      case "7":
        return "Virtual Safety Car Ending";
      default:
        return currentFlag === "1" ? "All Clear" : `${currentFlag} Flag`;
    }
  };

  return (
    <div className={`flag-container ${getFlagClass()} ${visible ? "visible" : ""}`}>
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
  currentFlag: PropTypes.oneOf(["1", "2", "4", "5", "6", "7"]),
};
