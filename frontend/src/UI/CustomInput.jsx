import React, { Fragment } from "react";
import styles from "./CustomInput.module.css";
const CustomInput = ({
  type = "text",
  name = "",
  label="Raj",
  value="",
  onChange,
  placeholder="",
  required = false,
  readOnly =false,
  min=0,
  max="",
}) => {
  return (
      <div className={styles.inputbox}>
        <label htmlFor={name}>{label}</label>
        <input
          type={type}
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          readOnly={readOnly}
          min={min}
          max={max}
        />
      </div>
  );
};

export default CustomInput;
