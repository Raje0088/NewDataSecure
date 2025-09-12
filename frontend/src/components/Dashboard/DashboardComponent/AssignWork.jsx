import React, { Fragment, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AssignWork.module.css";

const AssignWork = (props) => {
  const [getClientDetailMap, setGetClientDetailMap] = useState([]);
  const [showTaskList, setShowTaskList] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskFiltered, setTaskFiltered] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;
  const totalEntries = getClientDetailMap.length;
  const totalPages = Math.ceil(totalEntries / pageSize);

  const paginatedData = getClientDetailMap.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const ShowTaskDetails = async (taskey, taskdata) => {
    console.log("t", taskdata.filters_db, taskey);
    setTaskTitle(taskey);
    setShowTable(true);
    setGetClientDetailMap(taskdata.clientIds_db);

    const { state_db, district_db, business_name_db } =
      taskdata.filters_db || {};
    setTaskFiltered({ state_db, district_db, business_name_db });
  };

  useEffect(() => {
    console.log("Updated client detail map:", getClientDetailMap);
  }, [getClientDetailMap, taskTitle, taskFiltered]);
  return (
    <Fragment>
      <div style={{ margin: "10px" }}>
        <label htmlFor="">Filter Task By </label>
        <select
          name=""
          id=""
          value={props.taskStatus}
          onChange={(e) => {
            props.setTaskStatus(e.target.value);
          }}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <div className={styles.content}>
        {Object.entries(props.taskList?.tasks || {}).map(
          ([taskKey, taskdata]) => (
            <div
              className={styles.taskdata}
              onClick={() => {
                ShowTaskDetails(taskKey, taskdata);
              }}
            >
              <label
                style={{
                  textDecoration: "2px underline",
                  textUnderlineOffset: "4px",
                }}
                onClick={() => {
                  props.goToClientPage(taskdata);
                }}
                htmlFor=""
              >
                {taskKey} ({taskdata.clientIds_db.length} clients)
              </label>
              <p>{taskdata.assignBy_db}</p>
              <p>{taskdata.time_db}</p>
              <p>{taskdata.date_db}</p>
              <p>{taskdata.task_status_db}</p>
            </div>
          )
        )}
      </div>

      {showTable && (
        <>
          <div style={{ fontWeight: "bolder" }}>
            <span style={{ margin: "10px", fontWeight: "bolder" }}>
              {taskTitle}
            </span>
            <span style={{ margin: "10px" }}>
              Total Clients - {totalEntries}
            </span>
            <span style={{ margin: "10px" }}>
              Page Size ({(currentPage - 1) * pageSize + 1} -{" "}
              {pageSize * currentPage})
            </span>
            <span style={{ margin: "10px" }}>
              Data Filtered - {taskFiltered.state_db},{" "}
              {taskFiltered.district_db}, {taskFiltered.business_name_db}
            </span>
          </div>
          <div className={styles.table}>
            <table>
              <thead>
                <tr>
                  <th>Sr NO</th>
                  <th>Time</th>
                  <th>Date</th>
                  <th>Visited</th>
                  <th>Client Id</th>
                  <th>Client Name</th>
                  <th>CallType</th>
                  <th>Expected Date</th>
                  <th>Quotation Share</th>
                  <th>Remark</th>
                  <th>Business Name</th>
                  <th>Verified By</th>
                  <th>Address</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Stage</th>
                  <th>Task Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((clients) => (
                  <tr
                    onClick={() => {
                      console.log(clients);
                      props.goToClientPage(clients);
                    }}
                  >
                    <td>{clients.client_serial_no_id}</td>
                    <td>{clients.time_db}</td>
                    <td>{clients.date_db}</td>
                    <td>{clients.client_visiting_id}</td>
                    <td>{clients.clientId_db}</td>
                    <td>{clients.client_name_db}</td>
                    <td>{clients.callType_db}</td>
                    <td>{clients.expectedDate_db}</td>
                    <td>{clients.quotationShare_db}</td>
                    <td>{clients.remarks_db}</td>
                    <td>{clients.optical_name_db}</td>
                    <td>{clients.verifiedBy_db}</td>
                    <td>{clients.address_db}</td>
                    <td>{clients.email_1_db}</td>
                    <td>{clients.mobile_1_db}</td>
                    <td>{clients.stage_db}</td>
                    <td>{clients.client_task_status_db}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.btn}>
            <button
              onClick={() => {
                setCurrentPage((prev) => Math.max(prev - 1, 1));
              }}
              disabled={currentPage === 1}
            >
              prev
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
            >
              next
            </button>
          </div>
        </>
      )}
    </Fragment>
  );
};

export default AssignWork;
