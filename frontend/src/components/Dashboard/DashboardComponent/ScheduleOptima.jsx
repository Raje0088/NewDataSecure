import axios from "axios";
import React, { useEffect, useState } from "react";
import styles from "./ScheduleOptima.module.css";
import TimePickerComponent from "../../../UI/TimePickerComponent";
import { AuthContext } from "../../../context-api/AuthContext";
import { useContext } from "react";
import { base_url } from "../../../config/config";

const ScheduleOptima = (props) => {
  const {userLoginId} = useContext(AuthContext)
  const [userProduct, setUserProduct] = useState([]);
  const [scheduleData, setScheduleData] = useState();
  const [showProgress, setShowProgress] = useState([]);
  const [showProgressMode, setShowProgressMode] = useState(false);
  const [ScheduleList, setScheduleList] = useState([
    "No of New Calls",
    "Demo",
    "Installation",
    "Target",
    "Recovery",
    "Support",
  ]);
  const [getSelectedTime, setGetSelectedTime] = useState("");
  const [selectDate, setSelectDate] = useState("");
  const taskKeyMap = {
    "No of New Calls": "no_of_new_calls_db",
    Demo: "demo_db",
    Installation: "installation_db",
    Target: "target_db",
    Recovery: "recovery_db",
    Support: "support_db",
  };


  useEffect(() => {
    const fetch = async () => {
      const result = await axios.get(
        `${base_url}/users/search-by-user/${userLoginId}`
      );
      // console.log("product list hai", result.data.assignProduct);
      setUserProduct(result.data.assignProduct);
    };
    fetch();
  }, []);

  const handleGoalsShow = async () => {
    try {
      // Toggle on each click
      setShowProgressMode((prev) => !prev);

      if (!showProgressMode) {
        const result = await axios.get(
          `${base_url}/schedule/get-goals/${userLoginId}`
        );
        console.log("goals", result.data.result.goals_db);
        setShowProgress(result.data.result.goals_db);
      }
    } catch (err) {
      console.log("internal error", err);
    }
  };

  useEffect(() => {
    const initialState = userProduct.reduce((acc, product) => {
      acc[product] = ScheduleList.reduce((colAcc, col) => {
        colAcc[col] = "";
        return colAcc;
      }, {});
      return acc;
    }, {});
    setScheduleData(initialState);
  }, [userProduct]);

  const handleTimeChange = (time) => {
    setGetSelectedTime(time);
    // console.log("Selected Time:", time);
  };

  const handleScheduleGoals = async () => {
    console.log("schedulegoals", scheduleData);
    try {
      const result = await axios.post(`${base_url}/schedule/goal`, {
        userId: props.userLoginId,
        date: selectDate,
        deadline: getSelectedTime,
        goals: scheduleData,
        time: new Date().toLocaleTimeString(),
      });
      console.log(`${props.userLoginId} schedule golas saved`, result);
    } catch (err) {
      console.log("internal error", err);
      if (
        err.response &&
        err.response.data &&
        err.response.data.message === "Missing required fields"
      ) {
        alert("fields cannot be empty");
      }
      if (
        err.response &&
        err.response.data &&
        err.response.data.message === "goal Schedule already"
      ) {
        alert("Goals Schedule already");
      }
    }
  };
return (
    <div className={styles.main}>
      <span>
        <h2 style={{ width: "30%", display: "flex", justifyContent: "start" }}>
          {userLoginId}
        </h2>
        <h2 style={{ fontSize: "22px", width: "40%", textAlign: "center" }}>
          Schedule Goal
        </h2>
        <h2 style={{ width: "30%", display: "flex", justifyContent: "end", gap: "10px" }}>
          Date:{" "}
          <input
            type="date"
            value={selectDate}
            onChange={(e) => setSelectDate(e.target.value)}
          />
        </h2>
      </span>

      {/* Grid */}
      <div className={styles.outerScroll}>
        <div
          className={styles.gridWrapper}
          style={{
            gridTemplateColumns: `150px repeat(${userProduct.length}, 120px)`,
          }}
        >
          {/* Header Row */}
          <div className={`${styles.gridItem} ${styles.stickyCol}`}>Task Type</div>
          {userProduct.map((product) => (
            <div className={styles.gridItem} key={product}>
              {product}
            </div>
          ))}

          {/* Data Rows */}
          {ScheduleList.map((task) => {
            const backendTaskKey = taskKeyMap[task];
            return (
              <React.Fragment key={task}>
                <div className={`${styles.gridItem} ${styles.stickyCol}`}>
                  {task}
                </div>
                {userProduct.map((product) => {
                  const progress = showProgress?.[product]?.[backendTaskKey];
                  return (
                    <div className={styles.gridItem} key={`${task}-${product}`}>
                      <input
                        type={showProgressMode ? "text" : "number"}
                        value={
                          showProgressMode && progress
                            ? `${progress.completed_db}/${progress.assigned_db}`
                            : scheduleData?.[product]?.[task] || ""
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          setScheduleData((prev) => ({
                            ...prev,
                            [product]: {
                              ...prev[product],
                              [task]: val,
                            },
                          }));
                        }}
                        style={{
                          width: "100%",
                          boxSizing: "border-box",
                          textAlign: "center",
                        }}
                      />
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "end", padding: "10px" }}>
        <h2>Set Deadline:</h2>
        <TimePickerComponent onTimeChange={handleTimeChange} />
      </div>

      <div className={styles.btn}>
        <button onClick={handleScheduleGoals}>Save Schedule</button>
        <button onClick={handleGoalsShow}>Refresh</button>
        {props.onShowOpenRequest && (
          <button onClick={props.onCheckExtraTask}>Open Request</button>
        )}
      </div>
    </div>
  );
};

export default ScheduleOptima;
