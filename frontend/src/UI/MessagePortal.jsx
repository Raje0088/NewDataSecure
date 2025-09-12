import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import styles from "./MessagePortal.module.css";

const MessagePortal = ({ message1,message2, onClose, type }) => {
  const closeRef = useRef();
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (closeRef.current && !closeRef.current.contains(event.target)) {
        onClose();
      }
    };
      document.addEventListener("mousedown",handleClickOutside)
      return ()=> document.removeEventListener("mousedown",handleClickOutside)
  },[onClose]);
  return ReactDOM.createPortal(
    <div className={styles.overlay} >
      <div className={`${styles.messageBox} ${styles[type]}`} ref={closeRef}>
        <p>{message1}</p>
        <p>{message2}</p>
        <div className={styles.btn}        >
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>,
    document.getElementById("extra-request-portal")
  );
};

export default MessagePortal;
