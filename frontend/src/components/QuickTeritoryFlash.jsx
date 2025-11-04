import React, { useState, useContext, useEffect } from "react";
import styles from "./QuickTeritoryFlash.module.css";
import { AuthContext } from "../context-api/AuthContext";
import axios from "axios";
import { base_url } from "../config/config";
import { MdOutlineDownloadDone } from "react-icons/md";
import { IoHourglassOutline } from "react-icons/io5";
import { MdClose } from "react-icons/md";
import ReactDOM from "react-dom";

const QuickTeritoryFlash = ({ isOpen, onClose }) => {
  const { userLoginId } = useContext(AuthContext);
  const [reminderList, setReminderList] = useState([]);
  const [areaList, setAreaList] = useState([]);
  const [taskList, setTaskList] = useState([]);
  const [userAssignTask, setUserAssignTask] = useState([]);
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await axios.get(`${base_url}/remainders/user-reminder`, {
          params: {
            userId: userLoginId,
            date: new Date().toISOString().split("T")[0],
          },
        });
        console.log("result", result.data);

        const user = await axios.get(
          `${base_url}/users/search-by-user/${userLoginId}`
        );
        const region = user.data.result;

        const task = await axios.get(
          `${base_url}/task/get-assign-task/${userLoginId}`,
          {
            params: { dateFrom: new Date().toISOString().split("T")[0] },
          }
        );

        const userAssignForm = await axios.get(
          `${base_url}/users/get-userForm/${userLoginId}`
        );
        const userForm = userAssignForm.data.result;
        console.log("userForm", userForm);
        setUserAssignTask(userForm);

        const goals = await axios.get(
          `${base_url}/schedule/get-goals/${userLoginId}`
        );
        console.log("goals===================", goals.data.result);
        setGoals(goals.data.result.goals_db);

        console.log("task", task.data);
        setTaskList(task.data.result);
        setAreaList(region.master_data_db);
        setReminderList(result.data.result);
      } catch (err) {
        console.log("internal error", err);
      }
    };
    fetch();
  }, [userLoginId]);

  let goalsMap = new Map([
    ["New Data Add", "new_data_add_db"],
    ["No of New Calls", "no_of_new_calls_db"],
    ["Leads", "leads_db"],
    ["Demo", "demo_db"],
    ["Follow Up", "follow_up_db"],
    ["Target", "target_db"],
    ["Training", "training_db"],
    ["Installation", "installation_db"],
    ["Recovery", "recovery_db"],
    ["Support", "support_db"],
  ]);

  // Create reverse map for DB key → Display name
  const reverseGoalsMap = new Map(
    [...goalsMap.entries()].map(([display, dbKey]) => [dbKey, display])
  );

  const productTitles =
    userAssignTask.task_product_matrix_db?.[0].products?.map(
      (p) => p.productTitle
    );

  const products = Object.keys(goals);

  // Collect all unique task names (demo_db, installation_db, etc.)
  const allTasks = Array.from(
    new Set(products.flatMap((prod) => Object.keys(goals[prod])))
  );
  //  if (!goals || goals.length === 0) return <p>No data available</p>;
  return ReactDOM.createPortal(
    <div className={styles.main}>
      <div className={styles.overlay}>
        <div className={styles.closebtn}>
          <MdClose onClick={onClose} className="icon-size" />
        </div>
        <div className={styles.heading}>
          <h4>Quick Overview</h4>
        </div>
        <div className={styles.content}>
          <div className={styles.contentup}>
            <div
              style={{
                background: "#FFE7B8",
              }}
              className={styles.card}
            >
              <h4
                style={{
                  textAlign: "center",
                  color: "#1E3A8A",
                  fontSize: "14px",
                  paddingBottom: "5px",
                }}
              >
                Self Assign Task
              </h4>

              <table>
                <thead>
                  <tr>
                    <th style={{ fontSize: "12px" }}>Task / Product</th>
                    {products.map((prod) => (
                      <th key={prod} style={{ fontSize: "12px" }}>
                        {prod}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {allTasks.map((task, index) => (
                    <tr
                      key={task}
                      style={{
                        backgroundColor:
                          index % 2 === 0 ? "#FFE7B8" : "#FFFFFF",
                        borderBottom: "1px solid #E5E7EB",
                      }}
                    >
                      <td
                        style={{
                          color: "#0F172A",
                        }}
                      >
                        {reverseGoalsMap.get(task)}
                      </td>
                      {products.map((prod) => {
                        const data = goals[prod][task];
                        return (
                          <td
                            key={prod + task}
                            style={{
                              // padding: "10px 14px",
                              textAlign: "center",
                              color: "#1E3A8A",
                              fontWeight: "500",
                            }}
                          >
                            {data ? data.assigned_db : "-"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              style={{
                background: "#B8FFBA",
              }}
              className={styles.card}
            >
              <h4
                style={{
                  textAlign: "center",
                  color: "#1E3A8A",
                  fontSize: "14px",
                  paddingBottom: "5px",
                }}
              >
                Admin Assign Task
              </h4>

              <table style={{ fontSize: "12px" }}>
                <thead>
                  <tr style={{ fontSize: "12px" }}>
                    <th style={{ fontSize: "12px" }}>Task ↓ / Product →</th>
                    {productTitles?.map((prod, i) => (
                      <th key={i} style={{ fontSize: "12px" }}>
                        {prod}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {userAssignTask?.task_product_matrix_db?.map((task, i) => (
                    <tr
                      key={i}
                      style={{
                        backgroundColor: i % 2 === 0 ? "#B8FFBA" : "#FFFFFF",
                        borderBottom: "1px solid #E5E7EB",
                      }}
                    >
                      <td
                        style={{
                          // padding: "10px 14px",
                          fontWeight: "500",
                          color: "#0F172A",
                        }}
                      >
                        {task.taskTitle}
                      </td>
                      {productTitles.map((prodTitle, j) => {
                        const product = task.products.find(
                          (p) => p.productTitle === prodTitle
                        );
                        return (
                          <td
                            key={j}
                            style={{
                              // padding: "10px 14px",
                              textAlign: "center",
                              color: "#1E3A8A",
                              fontWeight: "500",
                            }}
                          >
                            {product ? product.num : 0}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className={styles.contentdown}>
            <div style={{ width: "50%", padding: "5px" }}>
              <div className={styles.regiondiv}>
                <div>
                  <h4
                    style={{
                      textAlign: "center",
                      color: "#1E3A8A",
                      fontSize: "14px",
                      paddingBottom: "5px",
                    }}
                  >
                    Region
                  </h4>
                </div>
                <div className={styles.region}>
                  <strong>State</strong>
                  <strong>District</strong>
                </div>
                {areaList?.state?.map((state, i) => (
                  <div key={i} className={styles.region}>
                    <div>{state}</div>
                    <div className={styles.districtCell}>
                     { areaList?.district?.map((item, j) => (
                      <span>
                        {item.name}{" "}
                        <sup className={styles.distnotify}>{item.total}</sup>,
                      </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.getElementById("extra-request-portal")
  );
};

export default QuickTeritoryFlash;
