import React, { Fragment, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ExecutiveDashboard.module.css";
import { useState } from "react";
import socket from "../../../socketio/socket";
import { useEffect } from "react";
import axios from "axios";
import AssignWork from "../DashboardComponent/AssignWork";
import ScheduleOptima from "../DashboardComponent/ScheduleOptima";
import ExtraTaskRequest from "../DashboardComponent/ExtraTaskRequest";
import { AuthContext } from "../../../context-api/AuthContext";
import { base_url } from "../../../config/config";

const ExecutiveDashboard = () => {
  const navigate = useNavigate();
  const {userLoginId} = useContext(AuthContext)
  // const [userLoginId, setUserLoginId] = useState("E02_SA");
  const [taskList, setTaskList] = useState({});
  const [checkAssignWork, setCheckAssignWork] = useState(false);
  const [checkScheduleOptima, setCheckScheduleOptima] = useState(true);
  const [taskStatus, setTaskStatus] = useState("pending");
  const [extraTask, setExtraTask] = useState([]);
  const [checkExtraTask, setCheckExtraTask] = useState(false);
  const [showExtraTask, setShowExtraTask] = useState(false);

  useEffect(() => {
    if (!userLoginId) return alert("no user login id available");
    socket.on("connect", () => {
      // console.log("✅ Socket connected:", socket.id);
      socket.emit("joinRoom", userLoginId);
      // console.log("✅ joinRoom emitted with:", executiveId);
    });

    socket.on("taskAssigned", (data) => {
      console.log("🔥 Received taskAssigned:", data);
      setTaskList((prev) => ({ ...prev, ...data }));
      fetchTask(); // ✅ refresh full list
      alert(data.message);
    });

    socket.on("extra-task-assigned", (data) => {
      console.log("🔥 Received Extra-taskAssigned:", data);
      setExtraTask(data.newTask);
      setCheckExtraTask(true);
      fetchTask(); // ✅ refresh full list
      alert(data.message);
    });
    return () => {
      socket.off("taskAssigned");
      socket.off("extra-task-assigned");
      socket.off("connect");
    };
  }, [userLoginId]);

  const fetchTask = async () => {
    const result = await axios.get(
      `${base_url}/task/get-clientids-assign-by-to/${userLoginId}?taskStatus=${taskStatus}`
    );
    const data = result.data;
    // console.log("task data", data);
    setTaskList(data);
  };

  useEffect(() => {
    fetchTask();
  }, [taskStatus]);

  useEffect(() => {
    const fetchExtraTask = async () => {
      const result = await axios.get(
        `${base_url}/users/searchuser-task-form/${userLoginId}`
      );
      if (result.data.result) {
        setExtraTask(result.data.result);
        setCheckExtraTask(true);
      }
      console.log("result bolte", result.data.result);
    };
    fetchExtraTask();
  }, []);

  useEffect(() => {
    console.log("🧠 Updated Extra Task State:", extraTask);
  }, [extraTask]);

  const handleCheckExtraTask = () => {
    setShowExtraTask(true); // this will show pop up
  };

  const goToClientPage = (taskdata) => {
    const userId = "E02_SA";
    navigate("/client-page", { state: { userId, taskdata } });
  };
  return (
    <div className={styles.main}>
      <div className={styles["main-content"]}>
        <header className={styles.header}>
          <h3>{userLoginId} Dashboard</h3>
        </header>
        <div className={styles["box-div"]}>
          <div className={styles.box}>
            <button
              onClick={() => {
                setCheckScheduleOptima((prev) => !prev);
              }}
            >
              Schedule Optima
            </button>
            <button
              onClick={() => {
                setCheckAssignWork((prev) => !prev);
              }}
              style={{ position: "relative" }}
            >
              Assign Work
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
                    color: "white",
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
          <div className={styles["show-content"]}>
            {checkAssignWork && (
              <AssignWork
                taskList={taskList}
                goToClientPage={goToClientPage}
                taskStatus={taskStatus}
                setTaskStatus={setTaskStatus}
              />
            )}
            {checkScheduleOptima && (
              <Fragment>
                <ScheduleOptima
                  userLoginId={userLoginId}
                  onCheckExtraTask={handleCheckExtraTask}
                  onShowOpenRequest={checkExtraTask}
                />
                {showExtraTask && (
                  <ExtraTaskRequest
                    onTaskData={extraTask}
                    onClose={() => setShowExtraTask(false)}
                  />
                )}
              </Fragment>
            )}
          </div>
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

export default ExecutiveDashboard;
