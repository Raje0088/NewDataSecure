import React from "react";
import ReactDOM from "react-dom";
import styles from "./ExtraTaskRequest.module.css";
import { useState } from "react";
const ExtraTaskRequest = ({ onClose, onTaskData }) => {
  console.log("onTaskData", onTaskData);
  return ReactDOM.createPortal(
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h4>
            {onTaskData.taskMode_db} Task assign by {onTaskData.assignBy_db} To{" "}
            {onTaskData.assignTo_db}{" "}
          </h4>
        </div>
        <div className={styles.subheader}>
          <p>Uptil Date : {onTaskData.uptilDate_db}</p>
          <p>Deadline : {onTaskData.deadline_db}</p>
        </div>

        <div className={styles.subheader}>
          <h4>Assign File: {onTaskData?.excelId_db?.title ? onTaskData?.excelId_db?.title  : "NA"} </h4>
        </div>
        {onTaskData.taskMode_db !== "Request" && onTaskData.taskMode_db !== "Regular" ? (
          <div className={styles.assigntask}  style={{ margin: "10px 0" }}>
            <table>
              <tr>
                <th>Asign Task</th>
                <th>Assign</th>
                <th>Completed</th>
              </tr>
              {onTaskData.taskObj_db?.map((todo, idx) => (
                <tr>
                  <td>{todo.title}</td>
                  <td>{todo.num}</td>
                  <td>{todo.completed}</td>
                </tr>
              ))}
            </table>
          </div>
        ) : (
          <div className={styles.assigntask} style={{ margin: "10px 0" }}>
            <table>
              <tr>
                <th>Request</th>
                <th>Note</th>
                <th>Assign</th>
                <th>Completed</th>
              </tr>
              {onTaskData.taskObj_db?.map((todo, idx) => (
                <tr>
                  <td>{todo.title}</td>
                  <td>{todo.text}</td>
                  <td>{todo.num}</td>
                  <td>{todo.completed}</td>
                </tr>
              ))}
            </table>
          </div>
        )}

        <div className={styles.assigntask}>
          <table>
            <tr>
              <th>Product</th>
              <th>Min Price</th>
              <th>Max Price</th>
            </tr>
            {onTaskData.productPriceRange_db?.map((todo, idx) => (
              <tr>
                <td>{todo.title}</td>
                <td>{todo.min}</td>
                <td>{todo.max}</td>
              </tr>
            ))}
          </table>
        </div>
        <div className={styles.btndiv}>
          <button className={styles.btn} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>,
    document.getElementById("extra-request-portal")
  );
};

export default ExtraTaskRequest;
