import React, { useState, useContext, useEffect } from "react";
import styles from "./QuickTeritoryFlash.module.css";
import { AuthContext } from "../context-api/AuthContext";
import axios from "axios";
import { base_url } from "../config/config";
import { MdOutlineDownloadDone } from "react-icons/md";
import { IoHourglassOutline } from "react-icons/io5";

const QuickTeritoryFlash = () => {
  const { userLoginId } = useContext(AuthContext);
  const [reminderList, setReminderList] = useState([]);
  const [areaList, setAreaList] = useState([]);
  const [taskList, setTaskList] = useState([]);

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
  return (
    <div className={styles.main}>
      <div className={styles.heading}>
        <h2>Quick Overview</h2>
      </div>
      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles["card-heading"]}>
            <h4>Today Task</h4>
          </div>
          <div className={styles.reminderdiv}>
            {taskList.length > 0 ? (
              <table className={styles.tables}>
                <thead>
                  <th>Sr No</th>
                  <th>Assign To</th>
                  <th>Assign By</th>
                  <th>Task Type</th>
                  <th>Total Assign</th>
                  <th>Deadline</th>
                </thead>
                <tbody>
                  {taskList.map((item, idx) => (
                    <tr>
                      <td>{idx + 1}</td>
                      <td>{item.assignTo_db}</td>
                      <td>{item.assignBy_db}</td>
                      <td>{item.taskType_db}</td>
                      <td>{item.total_task_db}</td>
                      <td>{item.deadline_db}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <h2>No Task Assign</h2>
            )}
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles["card-heading"]}>
            <h4>Region</h4>
          </div>
          <div className={styles.quickdiv}>
            <div className={styles.statediv}>
              {areaList?.state?.map((item) => (
                <p>{item}</p>
              ))}
            </div>
            <div className={styles.districtdiv}>
              <span>
                <h4>District</h4>
                <h4>Total</h4>
              </span>
              {areaList?.district?.map((item) => (
                <span>
                  <p>{item.name}</p>
                  <p>{item.total}</p>
                </span>
              ))}
              {/* {areaList?.excelId?.map((item) => (
                <span>
                  <p>{item}</p>
                </span>
              ))} */}
            </div>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles["card-heading"]}>
            <h4>Todays Reminder</h4>
          </div>
          <div className={styles.reminderdiv}>
            {reminderList.length > 0 && (
              <table className={styles.tables}>
                <tr>
                  <th id={styles.ths}>Sr No</th>
                  <th id={styles.ths}>Client Id</th>
                  <th id={styles.ths}>Client Name</th>
                  <th id={styles.ths}>Stage</th>
                  <th id={styles.ths}>Date</th>
                  <th id={styles.ths}>Time</th>
                  <th id={styles.ths}>Action</th>
                  <th id={styles.ths} className={styles.align}>
                    Status
                  </th>
                  <th>User Id</th>
                </tr>
                {reminderList.length > 0 &&
                  reminderList.map((item, idx) => (
                    <tr key={item._id}>
                      <td id={styles.tds}>{idx + 1}</td>
                      <td id={styles.tds} title="Click to view">
                        <strong
                          className={styles.text}
                          onClick={() => {
                            redirectToClientPage(
                              item.client_id,
                              item.database_db
                            );
                          }}
                        >
                          {item.client_id}
                        </strong>
                      </td>
                      <td id={styles.tds}>{item.client_name_db}</td>
                      <td id={styles.tds}>{item.stage_db}</td>
                      <td id={styles.tds}>{item.date_db}</td>
                      <td id={styles.tds}>{item.time_db}</td>
                      <td id={styles.tds}>{item.operation_db}</td>
                      <td id={styles.tds} className={styles.align}>
                        {item.status_db == true ? (
                          <MdOutlineDownloadDone />
                        ) : (
                          <IoHourglassOutline />
                        )}
                      </td>
                      <td>{item.userId_db}</td>
                    </tr>
                  ))}
              </table>
            )}
            {reminderList.length === 0 && (
              <div className={styles["noremainder-div"]}>
                <h2>No Remainder Set</h2>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickTeritoryFlash;
