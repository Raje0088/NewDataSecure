import React from "react";
import ReactDOM from "react-dom";
import styles from "./ExtraTaskRequest.module.css";
import { useState } from "react";
const ExtraTaskRequest = ({ onClose, onTaskData }) => {
  const [selectTask, setSelectTask] = useState("");

  return ReactDOM.createPortal(
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <p>Date : {onTaskData.date_db}</p>
          <h2>
            Request by {onTaskData.assignById_db} To {onTaskData.assignToId_db}{" "}
          </h2>
          <p>Deadline : {onTaskData.deadline_db}</p>
        </div>

        <div style={{ display: "flex", gap: "20px", margin: "10px 0",borderBottom:"1px dotted" }}>
          <h2>Assign File </h2>
          <button>open File</button>
        </div>
        <div className={styles.assigntask} style={{ margin: "10px 0"}}>
          <table>
            <tr>
              <th>Asign Task</th>
              <th>Assign</th>
              <th>Completed</th>
            </tr>
            {onTaskData.assign_task.map((todo, idx) => (
              <tr>
                <td>{todo.title}</td>
                <td>{todo.num}</td>
                <td>{todo.completed}</td>
              </tr>
            ))}
          </table>
        </div>
        <div className={styles.assigntask} style={{ margin: "10px 0"}}>
          <table>
            <tr>
              <th>Request</th>
              <th>Note</th>
              <th>Assign</th>
              <th>Completed</th>
            </tr>
            {onTaskData.request_task.map((todo, idx) => (
              <tr>
                <td>{todo.title}</td>
                <td>{todo.text}</td>
                <td>{todo.num}</td>
                <td>{todo.completed}</td>
              </tr>
            ))}
          </table>
        </div>
        <div className={styles.assigntask}>
          <table>
            <tr>
              <th>Product</th>
              <th>Min Price</th>
              <th>Max Price</th>
            </tr>
            {onTaskData.product_task.map((todo, idx) => (
              <tr>
                <td>{todo.title}</td>
                <td>{todo.min}</td>
                <td>{todo.max}</td>
              </tr>
            ))}
          </table>
        </div>
        <button onClick={onClose}>Close</button>
      </div>
    </div>,
    document.getElementById("extra-request-portal")
  );
};

export default ExtraTaskRequest;
