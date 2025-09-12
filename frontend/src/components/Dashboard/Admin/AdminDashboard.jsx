import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AdminDashboard.module.css";
import { useState } from "react";
import socket from "../../../socketio/socket";
import { useEffect } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [userLoginId, setUserLoginId] = useState("A1_SA");
  const [taskList, setTaskList] = useState({});

  useEffect(() => {
    const adminId = "A1_SA";
    setUserLoginId(adminId);
    socket.on("connect", () => {
      // console.log("✅ Socket connected:", socket.id);

      socket.emit("joinRoom", adminId);
      // console.log("✅ joinRoom emitted with:", executiveId);
    });

    socket.on("taskAssigned", (data) => {
      console.log("🔥 Received taskAssigned:", data);
      setTaskList((prev) => ({...prev, ...data}));
      alert(data.message);
    });

    return () => {
      socket.off("taskAssigned");
      socket.off("connect");
    };
  }, []);

  useEffect(() => {
    console.log("userid", userLoginId);
    const fetchTask = async () => {
      const result = await axios.get(
        `http://localhost:3000/task/get-clientids-assign-by-to/${userLoginId}`
      );
      const data = result.data;
      console.log("task data", data);
      setTaskList(data);
    };
    fetchTask();
  }, []);

  const goToClientPage = () => {
    const userId = "A1_SA";
    navigate("/client-page", { state: { userId, taskList } });
  };
  return (
    <div className={styles.main}>
      <div className={styles["main-content"]}>
        <header className={styles.header}>
          <h3>{userLoginId} Dashboard</h3>
        </header>
        <div className={styles["box-div"]}>
          <div className={styles.box}>
            <button>Schedule Optima</button>
            <button onClick={goToClientPage} style={{ position: "relative" }}>
              Assign Work{" "}
              {taskList.count > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "0px",
                    right: "5px",
                    background: "red",
                    borderRadius: "100%",
                    width: "20px",
                    height: "20px",
                    color:"white",
                  }}
                >
                  {taskList.count}
                </span>
              )}
            </button>
            <button>Master Data</button>
            <button>Report</button>
            <button>Reminder</button>
          </div>
          <div className={styles["show-content"]}>dfa</div>
          <div className={styles.box}>
            <button>Search</button>
            <button>Add</button>
            <button>Delete</button>
            <div className={styles.selects}>
              <select name="" id="">
                <option value="All Data">All Data</option>
                <option value="Follow-ubutton">Follow-up</option>
                <option value="Demo">Demo</option>
                <option value="Hot">Hot</option>
                <option value="buttonayment Due">payment Due</option>
                <option value="buttonroduct">product</option>
                <option value="Won Or Client">Won Or Client</option>
                <option value="Near To Close">Near To Close</option>
                <option value="Defaulter">Defaulter</option>
                <option value="Installation/Hosting">
                  Installation/Hosting
                </option>
              </select>
            </div>
            <button>Calender</button>
            <button>Upload</button>
            <button>Download</button>
            <button>print</button>
            <button>Save</button>
            <button>Update</button>
          </div>
        </div>
        <div>Report</div>
      </div>
    </div>
  );
};

export default AdminDashboard;
