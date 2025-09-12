import React from "react";
import styles from "./ViewExcel.module.css";
import axios from "axios";
import { useState, useEffect } from "react";
import { FaDownload } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { base_url } from "../config/config";

const ViewExcel = () => {
  const navigate = useNavigate();
  const [seletedFields, setSelectedFields] = useState({
    userId: "",
    fromDate: "",
    toDate: "",
  });

  const [veiwExcelData, setViewExcelData] = useState([]);
  const [executiveId, setExecutiveId] = useState([]);
  const [finalTotal, setFinalTotal] = useState(0);
  const dateFormat = (datee) => {
    const [yyyy, mm, dd] = datee.split("-");
    return `${dd}/${mm}/${yyyy}`;
  };

  const handleExcelView = async () => {
    try {
      const result = await axios.get(
        `${base_url}/view-excel/get-viewexcel-user`
      );
      const excelData = result.data.result;
      let filterData = [...excelData];
      if (seletedFields.userId) {
        filterData = filterData.filter(
          (item) => item.userId_db === seletedFields.userId
        );
      }
      if (seletedFields.fromDate) {
        const fromDatee = dateFormat(seletedFields.fromDate);
        console.log("Yo", fromDatee);
        filterData = filterData.filter((item) => item.date_db >= fromDatee);
      }
      if (seletedFields.toDate) {
        const toDatee = dateFormat(seletedFields.toDate);
        console.log(toDatee);
        filterData = filterData.filter((item) => item.date_db <= toDatee);
      }

      const totalCount = filterData.reduce((acc, curr) => {
        return acc + Number(curr.total_db || 0);
      }, 0);

      setFinalTotal(totalCount);
      const excutiveId = new Set(result.data.result.map((id) => id.userId_db));
      setExecutiveId([...excutiveId]);
      setViewExcelData(filterData);
      console.log("filter", filterData);
    } catch (err) {
      console.log("internal error", err);
    }
  };
  useEffect(() => {
    handleExcelView(); // call when component mounts
  }, [seletedFields.userId, seletedFields.fromDate, seletedFields.toDate]);

  const goToSearchClient = (item) => {
    navigate("/search-client", {
      state: {
        DumpId: item.dumpBy_db,
        DumpBy: item.userId_db,
        DumpURL: item.excelURL_db,
      },
    });
  };

  console.log("excel view", seletedFields);
  return (
    <div className={styles.main}>
      <div className={styles.header}>
        <h2>View Excel Page</h2>
      </div>
      <div className={styles.excelfilter}>
        <h4>Excel Imported Data By User</h4>
        <span>
          <label htmlFor="">User</label>
          <select
            name=""
            id=""
            value={seletedFields.userId}
            onChange={(e) => {
              setSelectedFields((prev) => ({
                ...prev,
                userId: e.target.value,
              }));
            }}
          >
            <option value="">All</option>
            {executiveId.map((item) => (
              <option value={item}>{item}</option>
            ))}
          </select>
        </span>
        <span>
          <label htmlFor="">From</label>
          <input
            type="date"
            value={seletedFields.fromDate}
            onChange={(e) => {
              setSelectedFields((prev) => ({
                ...prev,
                fromDate: e.target.value,
              }));
            }}
          />
          <label htmlFor="">To</label>
          <input
            type="date"
            value={seletedFields.toDate}
            onChange={(e) => {
              setSelectedFields((prev) => ({
                ...prev,
                toDate: e.target.value,
              }));
            }}
          />
        </span>
      </div>
      <div className={styles.tablediv}>
        <div className={styles.tables}>
          <table>
            <thead>
              <tr>
                <th>Sr No</th>
                <th>UserId</th>
                <th>Date</th>
                <th>Time</th>
                <th>Excel Id</th>
                <th>Total</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {veiwExcelData.map((item, idx) => (
                <tr>
                  <td>{idx + 1}</td>
                  <td>{item.userId_db}</td>
                  <td>{item.date_db}</td>
                  <td>{item.time_db}</td>
                  {/* <td>
                  <a
                    href={`${base_url}${item.excelURL_db}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item.dumpBy_db}
                  </a>
                </td> */}
                  <td onClick={() => goToSearchClient(item)}>
                    {item.dumpBy_db}
                  </td>
                  <td>{item.total_db}</td>
                  <td onClick={() => goToSearchClient(item)}>View</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h4>Total Record : {finalTotal}</h4>
      </div>
    </div>
  );
};

export default ViewExcel;
