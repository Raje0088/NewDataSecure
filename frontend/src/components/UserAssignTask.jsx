import React, { useEffect, useState } from "react";
import { IoMdAddCircleOutline } from "react-icons/io";
import "./UserAssignTask.css";
import axios from "axios";
import TimepickerComponent from "../UI/TimePickerComponent";
import { base_url } from "../config/config";

const UserAssignTask = ({
  setAuto,
  updateFormId,
  currentFormId,
  userLoginId,
}) => {
  const [addTask, setAddTask] = useState([
    { title: "New Data Add", num: "" },
    { title: "Leads", num: "" },
    { title: "Training", num: "" },
    { title: "Follow Up", num: "" },
  ]);
  const [addRequest, setAddRequest] = useState([
    { title: "New data add", num: "", text: "" },
    { title: "Leads", num: "", text: "" },
    { title: "Training", num: "", text: "" },
    { title: "Follow Up", num: "", text: "" },
    { title: "Product", num: "", text: "" },
  ]);
  const [addProduct, setAddProduct] = useState([]);
  const [userFormId, setUserFormId] = useState("");
  const [checkUpdateIdPresent, setCheckUpdateIdPresent] = useState(false);
  const [deadline, setDeadline] = useState("");

  console.log("addTask--", addTask);
  // console.log("AddRequest--", addRequest);
  // console.log("AddProduct--", addProduct);
  // console.log("setAuto--", setAuto);

  // console.log("ids current->", currentFormId);
  // console.log("ids update->", updateFormId);

  const isEditMode = Boolean(updateFormId);

  useEffect(() => {
    if (
      currentFormId &&
      Array.isArray(setAuto) &&
      setAuto.length > 0 &&
      !isEditMode
    ) {
      const assignData = setAuto.map((item) => ({
        title: item.label || "",
        min: "",
        max: "",
      }));
      setAddProduct(assignData);
      // console.log("CREATE MODE: addProduct set from setAuto", assignData);
    }
  }, [setAuto, currentFormId, isEditMode]);

  // Adding task if required =======
  const handleaddTask = () => {
    // console.log("add");
    setAddTask([...addTask, { title: "", num: "" }]);
    console.log("task-", addTask);
  };
  const handleTitleChange = (index, field, value) => {
    const updated = [...addTask];
    updated[index][field] = value;
    setAddTask(updated);
    // console.log("addTask", addTask);
  };
  const handleRemoveTask = (index) => {
    const updated = [...addTask];
    updated.splice(index, 1);
    setAddTask(updated);
  };
  // Adding Request if required =======
  const handleAddRquestTask = () => {
    setAddRequest([...addRequest, { title: "", num: "", text: "" }]);
  };
  const handleRequestTitleChange = (index, field, value) => {
    const updated = [...addRequest];
    updated[index][field] = value;
    setAddRequest(updated);
    // console.log("addRequest", addRequest);
  };
  const handleRemoveRequest = (index) => {
    const updated = [...addRequest];
    updated.splice(index, 1);
    setAddRequest(updated);
  };

  // Adding Product if required =======

  const handleProductTitleChange = (index, field, value) => {
    const update = [...addProduct];
    update[index][field] = value;
    setAddProduct(update);
    // console.log("addProduct", addProduct);
  };

  const isFieldCheck = () => {
    for (let task of addTask) {
      if (!task.title.trim() || !task.num) {
        return false;
      }
    }
    for (let task of addRequest) {
      const numStr = String(task.num || "").trim();
      if (!task.title.trim() || numStr === "" || Number(numStr) < 0) {
        return false;
      }
    }

    for (let task of addProduct) {
      if (
        !task.title.trim() ||
        !task.min ||
        !task.max ||
        task.min < 0 ||
        task.max < 0
      ) {
        return false;
      }
    }

    return true;
  };

  const fetchId = async () => {
    try {
      const getUpdateFormId = await axios.get(
        `${base_url}/users/searchuser-task-form/${updateFormId}`
      );
      // console.log("Fetched data:", getUpdateFormId.data.result);

      if (getUpdateFormId.data.result) {
        const result = getUpdateFormId.data.result;
        setUserFormId(result.generateUniqueId);
        setCheckUpdateIdPresent(result.generateUniqueId);
        setAddTask(result.assign_task);

        const safeRequests = result.request_task.map((item) => ({
          title: item?.title || "",
          num: String(item?.num ?? ""),
          text: item?.text || "",
        }));
        setAddRequest(safeRequests);

        const rawProducts = result.product_task.map((item) => ({
          title: item?.title || "",
          min: item?.min || "",
          max: item?.max || "",
        }));
        setAddProduct(rawProducts);

        // console.log("Editing mode: setAddProduct from backend", rawProducts);
      } else {
        setUserFormId(null);
      }
    } catch (err) {
      console.error("Error fetching data by `updateFormId`", err);
      setUserFormId(null);
    }
  };
  useEffect(() => {
    if (isEditMode && updateFormId) {
      console.log("Calling fetchId with updateFormId:", updateFormId);
      fetchId();
    }

    // Handle the case where the updateFormId doesn't match checkUpdateIdPresent
    if (checkUpdateIdPresent !== updateFormId) {
      console.log(
        "The updateFormId doesn't match, clearing task fields and assigning values to addProduct"
      );

      // Clear addTask and addRequest fields
      setAddTask([
        { title: "New Data Add", num: "" },
        { title: "Leads", num: "" },
        { title: "Training", num: "" },
        { title: "Follow Up", num: "" },
      ]);
      setAddRequest([
        { title: "New data add", num: "", text: "" },
        { title: "Leads", num: "", text: "" },
        { title: "Training", num: "", text: "" },
        { title: "Follow Up", num: "", text: "" },
        { title: "Product", num: "", text: "" },
      ]);

      // Assign addProduct from setAuto
      if (Array.isArray(setAuto) && setAuto.length > 0) {
        const assignData = setAuto.map((item) => ({
          title: item.label || "",
          min: "",
          max: "",
        }));
        setAddProduct(assignData);
        console.log("CLEAR MODE: addProduct set from setAuto", assignData);
      }
    }
  }, [checkUpdateIdPresent, updateFormId, setAuto, isEditMode]);

  // const handleSaveUser = async (e) => {
  //   e.preventDefault();

  //   if (!isFieldCheck()) {
  //     alert(
  //       "Please fill all fields correctly. No empty or negative values allowed."
  //     );
  //     return;
  //   }

  //   try {
  //     if (checkupdateIdPresent === updateFormId) {
  //       const result = await axios.put(
  //         `${base_url}/users/updateuser-task-form/${updateFormId}`,
  //         {
  //           assignTask: addTask,
  //           requestTask: addRequest,
  //           productTask: addProduct,
  //         }
  //       );
  //       console.log("user Task updated", result.data);
  //       alert("user data update");
  //     } else {
  //       const result = await axios.post(
  //         "${base_url}/users/user-task-form",
  //         {
  //           assignTask: addTask,
  //           requestTask: addRequest,
  //           productTask: addProduct,
  //           generateUniqueId: currentFormId || updateFormId,
  //         }
  //       );
  //       // setUpdateFormId(null);
  //       console.log("User Task Saved", result.data);
  //       alert("user data save");
  //     }
  //   } catch (err) {
  //     console.log("User not save", err);
  //   }
  // };

  // Save User Data
  const handleSaveUser = async (e) => {
    e.preventDefault();

    if (!isFieldCheck()) {
      alert(
        "Please fill all fields correctly. No empty or negative values allowed."
      );
      return;
    }

    try {
      const result = await axios.post(
        `${base_url}/users/user-task-form`,
        {
          assignTask: addTask,
          requestTask: addRequest,
          productTask: addProduct,
          assignById: userLoginId,
          assignToId: updateFormId,
          deadline: deadline,
        }
      );
      console.log("User Task Saved", result.data);
      alert("User data saved successfully!");
    } catch (err) {
      console.error("Error saving user data", err);
      alert("Error saving user data. Please try again.");
    }
  };
  // console.log("ids bolte", userFormId, updateFormId);

  const handleTimeChange = (time) => {
    if (time === "HH:MM:SS AM/PM") {
      time = "23:59:00";
    }
    console.log("time blte", time);
    setDeadline(time);
  };
  return (
    <div className="userassign-task-body">
      <div className="userassign-task-main">
        <div className="heading-div">
          <h3>Setting</h3>
        </div>
        <div className="assign-file-div">
          <h3>Assign File</h3>
          <input type="file" />
        </div>
        <div className="assign-task-div">
          <h3>Assign Task</h3>
          <div className="assign-task-item-div">
            <div className="assign-task-item">
              <p>{addTask[0].title}</p>
              <input
                type="number"
                value={addTask[0].num}
                onChange={(e) => {
                  handleTitleChange(0, "num", e.target.value);
                }}
                className="userassigntask-input"
              />
            </div>
            <div className="assign-task-item">
              <p>{addTask[1].title}</p>{" "}
              <input
                type="number"
                value={addTask[1].num}
                onChange={(e) => handleTitleChange(1, "num", e.target.value)}
                className="userassigntask-input"
              />
            </div>
            <div className="assign-task-item">
              <p>{addTask[2].title}</p>{" "}
              <input
                type="number"
                value={addTask[2].num}
                onChange={(e) => {
                  handleTitleChange(2, "num", e.target.value);
                }}
                className="userassigntask-input"
              />
            </div>
            <div className="assign-task-item">
              <p>{addTask[3].title}</p>{" "}
              <input
                type="number"
                value={addTask[3].num}
                onChange={(e) => {
                  handleTitleChange(3, "num", e.target.value);
                }}
                className="userassigntask-input"
              />
            </div>

            {addTask.slice(4).map((item, idx) => {
              const index = idx + 4;
              return (
                <div
                  className="assign-task-item"
                  style={{ position: "relative" }}
                  key={index + 4}
                >
                  <p>
                    <input
                      className="userassigntask-input align-input"
                      type="text"
                      value={item.title}
                      onChange={(e) => {
                        handleTitleChange(index, "title", e.target.value);
                      }}
                    />
                  </p>
                  <input
                    type="number"
                    className="userassigntask-input"
                    value={item.text}
                    onChange={(e) => {
                      handleTitleChange(index, "text", e.target.value);
                    }}
                  />
                  <p
                    className="remove-x"
                    onClick={() => {
                      handleRemoveTask(index);
                    }}
                  >
                    x
                  </p>
                </div>
              );
            })}
            <div className="assign-task-item">
              <p>
                <IoMdAddCircleOutline
                  onClick={handleaddTask}
                  className="add-icon"
                />
              </p>
            </div>
          </div>
        </div>
        <div className="request-div">
          <h3>Request</h3>
          <div className="request-item-div">
            <div className="request-item">
              <h3></h3> <h3></h3> <h3>Note</h3>
            </div>
            <div className="request-item">
              <p>{addRequest[0].title}</p>
              <input
                type="number"
                value={addRequest[0].num}
                onChange={(e) => {
                  handleRequestTitleChange(0, "num", e.target.value);
                }}
                className="userassigntask-input"
              />
              <input
                type="text"
                value={addRequest[0].text}
                onChange={(e) => {
                  handleRequestTitleChange(0, "text", e.target.value);
                }}
                className="userassigntask-input align-input"
              />
            </div>
            <div className="request-item">
              <p>{addRequest[1].title}</p>
              <input
                type="number"
                value={addRequest[1].num}
                onChange={(e) => {
                  handleRequestTitleChange(1, "num", e.target.value);
                }}
                className="userassigntask-input"
              />
              <input
                type="text"
                value={addRequest[1].text}
                onChange={(e) => {
                  handleRequestTitleChange(1, "text", e.target.value);
                }}
                className="userassigntask-input align-input"
              />
            </div>
            <div className="request-item">
              <p>{addRequest[2].title}</p>
              <input
                type="number"
                value={addRequest[2].num}
                onChange={(e) => {
                  handleRequestTitleChange(2, "num", e.target.value);
                }}
                className="userassigntask-input"
              />
              <input
                type="text"
                value={addRequest[2].text}
                onChange={(e) => {
                  handleRequestTitleChange(2, "text", e.target.value);
                }}
                className="userassigntask-input align-input"
              />
            </div>
            <div className="request-item">
              <p>{addRequest[3].title}</p>
              <input
                type="number"
                value={addRequest[3].num}
                onChange={(e) => {
                  handleRequestTitleChange(3, "num", e.target.value);
                }}
                className="userassigntask-input"
              />
              <input
                type="text"
                value={addRequest[3].text}
                onChange={(e) => {
                  handleRequestTitleChange(3, "text", e.target.value);
                }}
                className="userassigntask-input align-input"
              />
            </div>
            <div className="request-item">
              <p>{addRequest[4].title}</p>
              <input
                type="number"
                value={addRequest[4].num}
                onChange={(e) => {
                  handleRequestTitleChange(4, "num", e.target.value);
                }}
                className="userassigntask-input"
              />
              <input
                type="text"
                value={addRequest[4].text}
                onChange={(e) => {
                  handleRequestTitleChange(4, "text", e.target.value);
                }}
                className="userassigntask-input align-input"
              />
            </div>
            {addRequest.slice(5).map((item, idx) => {
              const index = idx + 5;
              return (
                <div className="request-item" style={{ position: "relative" }}>
                  <p>
                    <input
                      type="text"
                      value={item.title}
                      className="userassigntask-input align-input"
                      onChange={(e) => {
                        handleRequestTitleChange(
                          index,
                          "title",
                          e.target.value
                        );
                      }}
                    />
                  </p>
                  <input
                    type="number"
                    value={item.num}
                    className="userassigntask-input "
                    onChange={(e) => {
                      handleRequestTitleChange(index, "num", e.target.value);
                    }}
                  />
                  <input
                    type="text"
                    value={item.text}
                    className="userassigntask-input align-input"
                    onChange={(e) => {
                      handleRequestTitleChange(index, "text", e.target.value);
                    }}
                  />
                  <p
                    className="remove-x"
                    onClick={() => {
                      handleRemoveRequest(index);
                    }}
                  >
                    x
                  </p>
                </div>
              );
            })}
            <div className="request-item">
              <p>
                <IoMdAddCircleOutline
                  className="add-icon"
                  onClick={handleAddRquestTask}
                />
              </p>
            </div>
          </div>
        </div>
        <div className="product-file-div">
          <h3>Product</h3>
          <div className="product-item-div">
            <div className="product-item">
              <h3></h3> <h3>Min</h3>
              <h3>Max</h3>
            </div>

            {addProduct.map((item, idx) => (
              <div className="product-item" key={idx}>
                <p>{item.title}</p>
                <input
                  type="number"
                  value={item.min}
                  onChange={(e) => {
                    handleProductTitleChange(idx, "min", e.target.value);
                  }}
                  className="userassigntask-input"
                />
                <input
                  type="number"
                  value={item.max}
                  onChange={(e) => {
                    handleProductTitleChange(idx, "max", e.target.value);
                  }}
                  className="userassigntask-input "
                />
              </div>
            ))}
          </div>
        </div>
        <div className="task-save-btn">
          <span>
            Deadline:
            <TimepickerComponent onTimeChange={handleTimeChange} />
          </span>
          <button
            onClick={(e) => {
              handleSaveUser(e);
            }}
          >
            {updateFormId && updateFormId === userFormId
              ? "Update"
              : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserAssignTask;
