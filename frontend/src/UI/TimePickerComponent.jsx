import React, { useState, useRef, useEffect } from "react";
import styles from "./TimePickerComponent.module.css";

import { FiClock } from "react-icons/fi";

const TimePickerComponent = (props) => {
  const pickerRef = useRef(null);
  const [showPicker, setShowPicker] = useState(false);
  const [time, setTime] = useState({
    hour: "",
    minute: "",
    second: "",
    period: "",
  });

  const togglePicker = () => setShowPicker(!showPicker);

  useEffect(() => {
    if (!props.value || props.value === "NA") {
      // Reset picker to empty
      setTime({ hour: "", minute: "", second: "", period: "" });
    } else {
      const [timePart, period] = props.value.split(" ");
      const [hour, minute, second] = timePart.split(":");
      setTime({ hour, minute, second, period });
    }
  }, [props.value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (type, value) => {
    setTime({ ...time, [type]: value });
  };

  const formatTime = () => {
    const { hour, minute, second, period } = time;
    return `${hour || "HH"}:${minute || "MM"}:${second || "SS"} ${
      period || "AM/PM"
    }`;
  };

  useEffect(() => {
    if (props.onTimeChange) {
      const formatted = formatTime();
      if (formatted !== "HH:MM:SS AM/PM") {
        props.onTimeChange(formatted);
      }
    }
  }, [time]);

  return (
    <div className={styles.timePickerWrapper} ref={pickerRef}>
      <div className={styles.timeInput} onClick={togglePicker}>
        <span>{formatTime()}</span>
        <FiClock className={styles.clockIcon} />
      </div>

      {showPicker && (
        <div className={styles.pickerBox}>
          <div className={styles.pickerColumn}>
            {Array.from({ length: 12 }, (_, i) => (
              <div
                key={i}
                onClick={() =>
                  handleSelect("hour", (i + 1).toString().padStart(2, "0"))
                }
                className={`${styles.pickerItem} ${
                  time.hour === (i + 1).toString().padStart(2, "0")
                    ? styles.selected
                    : ""
                }`}
              >
                {(i + 1).toString().padStart(2, "0")}
              </div>
            ))}
          </div>
          <div className={styles.pickerColumn}>
            {Array.from({ length: 60 }, (_, i) => (
              <div
                key={i}
                onClick={() =>
                  handleSelect("minute", i.toString().padStart(2, "0"))
                }
                className={`${styles.pickerItem} ${
                  time.minute === i.toString().padStart(2, "0")
                    ? styles.selected
                    : ""
                }`}
              >
                {i.toString().padStart(2, "0")}
              </div>
            ))}
          </div>
          <div className={styles.pickerColumn}>
            {Array.from({ length: 60 }, (_, i) => (
              <div
                key={i}
                onClick={() =>
                  handleSelect("second", i.toString().padStart(2, "0"))
                }
                className={`${styles.pickerItem} ${
                  time.second === i.toString().padStart(2, "0")
                    ? styles.selected
                    : ""
                }`}
              >
                {i.toString().padStart(2, "0")}
              </div>
            ))}
          </div>
          <div className={styles.pickerColumn}>
            {["AM", "PM"].map((val) => (
              <div
                key={val}
                onClick={() => handleSelect("period", val)}
                className={`${styles.pickerItem} ${
                  time.period === val ? styles.selected : ""
                }`}
              >
                {val}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimePickerComponent;
