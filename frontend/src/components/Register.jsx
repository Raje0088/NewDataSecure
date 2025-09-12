// src/components/Register.jsx
import React, { useEffect, useState } from "react";
// import "./Register.css";
import styles from "./Register.module.css";
import axios from "axios";
import CustomSelect from "./CustomSelect";
import UserAssignTask from "./UserAssignTask";
import { FaWpforms } from "react-icons/fa6";
import { IoMdCloseCircle } from "react-icons/io";
import { base_url } from "../config/config";
import { AuthContext } from "../context-api/AuthContext";
import { useContext } from "react";

const Register = () => {
  const [uniqueUserIdGenerator, setUniqueUserIdGenerator] = useState("");
  const [userAuth, setUserAuth] = useState({
    userIdText: "",
    passwordText: "",
    confirmPasswordText: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    rolename: "",
    division: [],
    mobile: "",
    assignProduct: [],
  });
  const [permissionData, setPermissionData] = useState({
    create_P: false,
    update_P: false,
    delete_P: false,
    edit_P: false,
    view_P: false,
    uploadFile_P: false,
    download_P: false,
  });
  const { userLoginId } = useContext(AuthContext);
  const [userIdStatus, setUserIdStatus] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [roleNameOptions, setRoleNameOption] = useState([]);
  const [divsionOptions, setDivsionOptions] = useState([]);
  const [selectedReloNameOptions, setSelectedReloNameOptions] = useState("");
  const [assignProductOptions, setAssignProductOptions] = useState([]);
  const [serchByUserId, setSearchByUserId] = useState("");
  const [userDataList1, setUserDataList1] = useState([]);
  const [userDataList2, setUserDataList2] = useState([]);
  const [userDataList3, setUserDataList3] = useState([]);
  const [divisionIdxs, setDivisionIdxs] = useState([]); //this used for division ids for assignproduct
  const [updateUniqueId, setUpdateUniqueId] = useState(null);
  const [deleteUniqueId, setDeleteUniqueId] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [selectRolename, setSelectRolename] = useState(null); //
  const [selectedDivisions, setSelectedDivisions] = useState([]);
  const [selectedAssignProducts, setSelectedAssignProducts] = useState([]);
  const [searchByIdActive, setSearchByIdActive] = useState(false);
  const [originalUserId, setOriginalUserId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showFormPopUp, setShowFormPopUp] = useState(false);
  const [currentFormId, setCurrentFormId] = useState("");
  const [updateFormId, setUpdateFormId] = useState("");
  const [isUserFormCreated, setIsUserFormCreated] = useState(false);
  const [searchFlag, setSearchFlag] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const currentId = userAuth.userIdText.trim();

      // If ID is unchanged, skip validation
      if (currentId === originalUserId) {
        setUserIdStatus("original"); // You can use "original" as neutral
        return;
      }

      if (currentId === "") {
        setUserIdStatus("");
        return;
      }

      const checkUserId = async () => {
        try {
          const res = await fetch(
            `${base_url}/users/checked-userId?userId=${currentId}`
          );
          const data = await res.json();
          setUserIdStatus(data.exists ? "taken" : "available");
        } catch (err) {
          console.log("Error checking user ID:", err);
          setUserIdStatus("");
        }
      };

      checkUserId();
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [userAuth.userIdText, refresh, originalUserId]);

  useEffect(() => {
    const fetchRoleOption = async () => {
      const res = await fetch(`${base_url}/setting/rolename-data`);
      const data = await res.json();
      const option = data.result.map((item) => ({
        label: item.rolename_name,
        value: item._id,
      }));
      setRoleNameOption(option);
      // console.log("RoleNameOption", option);
    };
    fetchRoleOption();
  }, []);

  //DIVISIONOPTION FETCHING
  useEffect(() => {
    const fetchDivisionOption = async () => {
      const res = await fetch(`${base_url}/setting/division-data`);
      const data = await res.json();
      const option = data.result.map((item) => ({
        label: item.division_name,
        value: item._id,
      }));
      setDivsionOptions(option);
      // console.log("divisionOption", option);
    };
    fetchDivisionOption();
  }, []);

  useEffect(() => {
    // console.log("assignProductOptions updated:", assignProductOptions,selectRolename);
    console.log("uniqueid", uniqueUserIdGenerator);
  }, [assignProductOptions, selectRolename, uniqueUserIdGenerator]);
  // ==========================

  //DIRECTLY FETCHING ID WHEN ROLENAME SELECTED
  useEffect(() => {
    if (userLoginId) console.log("id", userLoginId, selectRolename);
    const fetch = async () => {
      const result = await axios.post(`${base_url}/utils/send-user-id`, {
        roleName: selectRolename?.label,
        createdBy: userLoginId,
      });
      console.log("result id", result.data.result);
      setUniqueUserIdGenerator(result.data.result);
    };
    if (!searchFlag) {
      fetch();
    }
  }, [selectRolename, searchFlag]);

  //AUTO ASSIGNOPTION FETCHING WHEN SEARCH BY ID
  useEffect(() => {
    if (
      searchByIdActive &&
      userDataList1.length > 0 &&
      assignProductOptions.length > 0
    ) {
      const { assignProduct } = userDataList1[0];
      const assignProductObj = assignProductOptions.filter((opt) =>
        assignProduct.includes(opt.label)
      );
      setSelectedAssignProducts(assignProductObj);
    }
  }, [assignProductOptions, searchByIdActive]);
  // ===================

  //FETCHING ALL ASSIGNPORDUCT OPTION INITIALLY
  useEffect(() => {
    const fetchAssignProduct = async () => {
      try {
        // console.log("ram ram");
        const allAssignProducts = [];

        for (const divisionId of divisionIdxs) {
          const res = await fetch(
            `${base_url}/setting/assignproduct-data/${divisionId}`
          );
          const data = await res.json();

          if (res.ok && Array.isArray(data.result)) {
            const formatted = data.result.map((item) => ({
              label: item.assign_product_name,
              value: item._id,
              divisionId: divisionId,
            }));
            allAssignProducts.push(...formatted);
          }
        }
        setAssignProductOptions(allAssignProducts);
        // console.log("assign product loaded", allAssignProducts);
      } catch (err) {
        console.error("Error fetching assign products:", err);
      }
    };
    if (divisionIdxs.length > 0) {
      fetchAssignProduct();
    } else {
      setAssignProductOptions([]); // clear if no divisions selected
    }
    // console.log("divisionIdxs:", divisionIdxs);
  }, [divisionIdxs]);

  //WHEN SAVE DATA AUTO UPDATE UNIQUE ID INCREASE BY 1
  // useEffect(() => {
  //   fetch("${base_url}/users/next-id")
  //     .then((res) => res.json())
  //     .then((data) => setUniqueUserIdGenerator(data.nextUserId));
  //   // .catch((err)=> console.log("uniqueId not fetch",err))
  // }, [uniqueUserIdGenerator]);

  const handleChange = (e) => {
    if (!e || !e.target) return;
    const { name, value } = e.target;
    console.log(name, value);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleUserAuthChange = (e) => {
    if (!e || !e.target) return;
    const { name, value } = e.target;
    // console.log(name, "->", value);
    setUserAuth((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChangeRoleNameSelectOption = (selectedOptions) => {
    setSelectRolename(selectedOptions);
    setSearchFlag(false);

    setUserAuth({
      userIdText: "",
      passwordText: "",
      confirmPasswordText: "",
    });

    setFormData({
      name: "",
      email: "",
      password: "",
      rolename: "",
      mobile: "",
      assignProduct: [],
    });
    setSelectedDivisions([]);
    setSelectedAssignProducts([]);
    setPermissionData({
      create_P: false,
      update_P: false,
      delete_P: false,
      edit_P: false,
      view_P: false,
      uploadFile_P: false,
      download_P: false,
    });
  };

  const handleChangeDivisionSelectOption = (selectedOptions) => {
    const idx = selectedOptions.map((option) => option.value);
    console.log("division id", idx);
    setSelectedDivisions(selectedOptions);
    setDivisionIdxs(idx);
  };

  const handleChangeAssignProduct = (selected) => {
    console.log("selectA", selected);
    console.log(
      "selectA label",
      selected.map((todo) => todo.label)
    );
    setSelectedAssignProducts(selected);
  };

  const OnSaveUser = async (e) => {
    e.preventDefault();
    console.log("save", selectRolename.label);
    const formDetails = {
      roleName: selectRolename.label,
      name: formData.name,
      mobile: formData.mobile,
      division: selectedDivisions.map((todo) => todo.label),
      email: formData.email,
      assignProduct: selectedAssignProducts.map((todo) => todo.label),
      createdById: userLoginId,
    };

    try {
      const result = await axios.post(
        `${base_url}/users/createUser`,
        formDetails,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      const res = await fetch(`${base_url}/users/next-id`);
      const data = await res.json();
      console.log("User Created Sucessfully", result.data);
      console.log("User Chi id", uniqueUserIdGenerator);
      setCurrentFormId(uniqueUserIdGenerator);
      // setUniqueUserIdGenerator(data.nextUserId);
      setRefresh(true);
      setShowForm(true);
    } catch (err) {
      console.log("User Not Created", err);
    }
  };
  const OnUserPermissionSave = async (e) => {
    e.preventDefault();
    const noPermissionData = Object.values(permissionData).every(
      (val) => val === false
    );
    if (noPermissionData) return alert("at least select one permission");
    try {
      const result = await axios.post(
        `${base_url}/users/checked`,
        { ...permissionData, generateUniqueId: uniqueUserIdGenerator },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log("Permission Checked Assign Successfully", result.data);
    } catch (err) {
      console.log("Permission checked failed", err);
    }
  };

  const permissionChecked = (e, selectPermission) => {
    setPermissionData((prev) => ({
      ...prev,
      [selectPermission]: e.target.checked,
    }));
    console.log(selectPermission, "->", e.target.checked);
  };

  const UserIdAndPassword = async (e) => {
    e.preventDefault();
    if (
      !userAuth.userIdText.trim() ||
      !userAuth.passwordText.trim() ||
      !userAuth.confirmPasswordText
    ) {
      return alert("all fields must filled");
    }
    if (userAuth.passwordText !== userAuth.confirmPasswordText) {
      return alert("Password must  Matched");
    }
    try {
      const result = await axios.post(`${base_url}/users/userIdPassAuth`, {
        userId: userAuth.userIdText,
        password: userAuth.passwordText,
        confirmPassword: userAuth.confirmPasswordText,
        generateUniqueId: uniqueUserIdGenerator,
      });
      console.log("UserId and Password save", result.data);

      alert("User Created Successfully");
      setOriginalUserId(userAuth.userIdText);
    } catch (err) {
      alert("UserId exist, choose new one");
      console.log("UserId already exist", err);
    }
  };

  const searchByUniqueId = async (serchByUserId) => {
    console.log("id hai", serchByUserId);
    setUniqueUserIdGenerator(serchByUserId);
    setUpdateUniqueId(serchByUserId);
    setDeleteUniqueId(serchByUserId);
    setShowForm(true);
    setSearchByIdActive(true);
    setUpdateFormId(serchByUserId);
    setSearchFlag(true);

    if (!serchByUserId) {
      return alert("User Unique Id required");
    }

    console.log("searching");
    //
    try {
      const result1 = await axios.get(
        `${base_url}/users/search-by-user/${serchByUserId}`
      );
      const result2 = await axios.get(
        `${base_url}/users/search-by-permission/${serchByUserId}`
      );
      const result3 = await axios.get(
        `${base_url}/users/search-by-userid-and-password/${serchByUserId}`
      );

      const data1 = result1.data
        ? Array.isArray(result1.data)
          ? result1.data
          : [result1.data]
        : [];
      const data2 = result2.data
        ? Array.isArray(result2.data)
          ? result2.data
          : [result2.data]
        : [];
      const data3 = result3.data
        ? Array.isArray(result3.data)
          ? result3.data
          : [result3.data]
        : [];

      // console.log("data1", data1);

      setUserDataList1(data1);
      setUserDataList2(data2);
      setUserDataList3(data3);

      const { roleName, email, mobile, name, division, assignProduct } =
        data1[0];
      const {
        create_P,
        update_P,
        delete_P,
        edit_P,
        view_P,
        uploadFile_P,
        download_P,
      } = data2[0];
      const { userID, password } = data3[0];

      // Set role name
      const roleNameObj =
        roleNameOptions.find((opt) => opt.label === roleName) || null;
      setSelectRolename(roleNameObj);

      // Set divisions
      const divisionObj = divsionOptions.filter((opt) =>
        division.includes(opt.label)
      );
      setSelectedDivisions(divisionObj);

      const divIdx = divisionObj.map((opt) => opt.value);
      setDivisionIdxs(divIdx);

      // ✅ FIXED: Set assignProduct directly, without setTimeout
      // const assignProductObj = assignProductOptions.filter((opt) =>
      //   assignProduct.includes(opt.label)
      // );
      // setSelectedAssignProducts(assignProductObj);

      // Set form data
      setFormData((prev) => ({
        ...prev,
        email: email,
        name: name,
        mobile: mobile,
      }));

      // Set permission data
      setPermissionData((prev) => ({
        ...prev,
        create_P,
        update_P,
        delete_P,
        edit_P,
        view_P,
        uploadFile_P,
        download_P,
      }));

      // Set user auth
      setUserAuth((prev) => ({
        ...prev,
        userIdText: userID,
        passwordText: password,
      }));
      setOriginalUserId(userID); // From the fetched data
    } catch (err) {
      console.log("Error search", err);
    }
  };

  const fetchAllUser = async () => {
    try {
      const result1 = await axios.get(`${base_url}/users/search-all-user`);
      const result2 = await axios.get(
        `${base_url}/users/search-all-permission`
      );
      const result3 = await axios.get(
        `${base_url}/users/search-all-userid-and-password`
      );

      const data1 = result1.data
        ? Array.isArray(result1.data)
          ? result1.data
          : [result1.data]
        : [];
      const data2 = result2.data
        ? Array.isArray(result2.data)
          ? result2.data
          : [result2.data]
        : [];
      const data3 = result3.data
        ? Array.isArray(result3.data)
          ? result3.data
          : [result3.data]
        : [];

      setUserDataList1(data1);
      setUserDataList2(data2);
      setUserDataList3(data3);
    } catch (err) {
      console.log("Error search", err);
    }
  };
  useEffect(() => {
    fetchAllUser();
  }, [refresh]);

  const UpdateUserData = async (sendUpdatedId) => {
    console.log("updateId", updateUniqueId);
    console.log("updateId", sendUpdatedId);
    const formDetails = {
      roleName: selectRolename.label,
      name: formData.name,
      mobile: formData.mobile,
      division: selectedDivisions.map((todo) => todo.label),
      email: formData.email,
      assignProduct: selectedAssignProducts.map((todo) => todo.label),
    };
    const PermisionDetails = {
      create_P: permissionData.create_P,
      update_P: permissionData.update_P,
      delete_P: permissionData.delete_P,
      edit_P: permissionData.edit_P,
      view_P: permissionData.view_P,
      uploadFile_P: permissionData.uploadFile_P,
      download_P: permissionData.download_P,
    };
    const UserIdPassword = {
      password: userAuth.passwordText,
      confirmPassword: userAuth.confirmPasswordText,
    };
    if (UserIdPassword.password !== UserIdPassword.confirmPassword) {
      return alert("Password must matched");
    }
    if (userIdStatus === "taken") {
      alert("User ID is already taken. Please choose another one.");
      return;
    }
    // Only add username if it's filled
    if (userAuth.userIdText.trim() !== "") {
      UserIdPassword.username = userAuth.userIdText;
    }
    try {
      const data1 = await axios.put(
        `${base_url}/users/updateUser/${updateUniqueId}`,
        formDetails,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      const data2 = await axios.put(
        `${base_url}/users/updateChecked/${updateUniqueId}`,
        PermisionDetails,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      const data3 = await axios.put(
        `${base_url}/users/update-userIdPassAuth/${updateUniqueId}`,
        UserIdPassword,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log("User updated", data1);
      console.log("Permission updated", data2);
      console.log("UserIdPassword updated", data3);
      setRefresh(true);
      setUpdateUniqueId(null);
    } catch (err) {
      console.log("User not updated", err);
    }
  };

  const deleteUserData = async () => {
    console.log("deleting id", deleteUniqueId);
    try {
      const data1 = await axios.delete(
        `${base_url}/users/delete-user/${deleteUniqueId}`
      );
      const data2 = await axios.delete(
        `${base_url}/users/delete-permission/${deleteUniqueId}`
      );
      const data3 = await axios.delete(
        `${base_url}/users/delete-userIdAndPassword/${deleteUniqueId}`
      );
      const isCheckUserForm = await axios.get(
        `${base_url}/users/searchuser-task-form/${deleteUniqueId}`
      );
      if (isCheckUserForm) {
        const userForm = await axios.delete(
          `${base_url}/users/deleteuser-task-form/${deleteUniqueId}`
        );
        console.log("User delete", userForm);
        alert("UserForm delete", userForm);
      }

      console.log("User delete", data1.result);
      console.log("Permission delete", data2.result);
      console.log("UserIdPassword delete", data3.result);
      setRefresh(true);
      setDeleteUniqueId(null);
    } catch (err) {
      console.log("User not delete", err);
    }
  };

  const searchbyNameOrMobile = async (text) => {
    if (searchByIdActive) {
      return;
    }
    const searchText = text;
    try {
      const result1 = await axios.get(
        `${base_url}/users/search-through-mobile-email-name/?query=${searchText}`
      );
      console.log("Search found", result1.data.result);
      setUserDataList1(result1.data.result); // Use correct data shape

      const generatedIds = result1.data.result.map(
        (todo) => todo.generateUniqueId
      );
      // console.log("generatedIds", generatedIds);
    } catch (err) {
      console.log("Error in search", err);
    }
  };
  // console.log("saveId",uniqueUserIdGenerator,userIdStatus,updateUniqueId)

  useEffect(() => {
    axios
      .get(`${base_url}/users/searchuser-task-form/${updateUniqueId}`)
      .then((res) => {
        setIsUserFormCreated(!!res.data.result);
      })
      .catch(() => {
        setIsUserFormCreated(false);
      });
  }, [updateUniqueId]);

  return (
    <>
    <div className={styles.main}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h2>Add User</h2>
        </div>
        <div className={styles.fielddiv}>
          <span className={styles.fields}>
            <div className={styles.searchspan}>
              <p>Id- {uniqueUserIdGenerator}</p>
              <input
                type="text"
                placeholder="search Id"
                onChange={(e) => {
                  const user_id = e.target.value;
                  setSearchByUserId(user_id);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const userId = e.target.value.trim().toUpperCase();
                    searchByUniqueId(userId);
                  }
                }}
              />
            </div>
          </span>
          <span></span>
          <span className={styles.fields}>
            <label htmlFor="">Role Name</label>
            <CustomSelect
              options={roleNameOptions}
              value={selectRolename}
              isMulti={false}
              onChange={handleChangeRoleNameSelectOption}
            />
          </span>
          <span className={styles.fields}>
            <label htmlFor="">Name</label>
            <input
              type="text"
              name="name"
              className={styles.custominput}
              placeholder="Name"
              value={formData.name}
              onChange={(e) => {
                handleChange(e);
                searchbyNameOrMobile(e.target.value);
              }}
              required
            />
          </span>
          <span className={styles.fields}>
            <label htmlFor="">Division</label>
            <CustomSelect
              options={divsionOptions}
              value={selectedDivisions}
              isMulti={true}
              onChange={handleChangeDivisionSelectOption}
            />
          </span>
          <span className={styles.fields}>
            <label htmlFor="">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              className={styles.custominput}
              value={formData.email}
              onChange={(e) => {
                handleChange(e);
                searchbyNameOrMobile(e.target.value);
              }}
              required
            />
          </span>
          <span className={styles.fields}>
            <label htmlFor="">Mobile Number</label>
            <input
              type="tel"
              name="mobile"
              placeholder="Mobile"
              value={formData.mobile}
              className={styles.custominput}
              onChange={(e) => {
                handleChange(e);
                searchbyNameOrMobile(e.target.value);
              }}
              required
            />
          </span>
          <span className={styles.fields}>
            <label htmlFor="">Assign Product</label>

            <CustomSelect
              options={assignProductOptions}
              value={selectedAssignProducts}
              isMulti={true}
              onChange={handleChangeAssignProduct}
            />
          </span>
        </div>
        <div className={styles.subheading}>
          <h4>Permission </h4>
        </div>
        <div className={styles["permission-div"]}>
          <span className={styles.permission}>
            <label className="checkbox" htmlFor="">
              Create
            </label>
            <input
              type="checkbox"
              checked={permissionData.create_P}
              onClick={(e) => permissionChecked(e, "create_P")}
            />
          </span>

          <span className={styles.permission}>
            <label className="checkbox" htmlFor="">
              Update
            </label>
            <input
              type="checkbox"
              checked={permissionData.update_P}
              onClick={(e) => permissionChecked(e, "update_P")}
            />
          </span>

          <span className={styles.permission}>
            <label className="checkbox" htmlFor="">
              Delete
            </label>
            <input
              type="checkbox"
              checked={permissionData.delete_P}
              onClick={(e) => permissionChecked(e, "delete_P")}
            />
          </span>
          <span className={styles.permission}>
            <label className="checkbox" htmlFor="">
              Edit
            </label>
            <input
              type="checkbox"
              checked={permissionData.edit_P}
              onClick={(e) => permissionChecked(e, "edit_P")}
            />
          </span>
          <span className={styles.permission}>
            <label className="checkbox" htmlFor="">
              View
            </label>
            <input
              type="checkbox"
              checked={permissionData.view_P}
              onClick={(e) => permissionChecked(e, "view_P")}
            />
          </span>
          <span className={styles.permission}>
            <label className="checkbox" htmlFor="">
              Upload File
            </label>
            <input
              type="checkbox"
              checked={permissionData.uploadFile_P}
              onClick={(e) => permissionChecked(e, "uploadFile_P")}
            />
          </span>
          <span className={styles.permission}>
            <label className="checkbox" htmlFor="">
              Download
            </label>
            <input
              type="checkbox"
              checked={permissionData.download_P}
              onClick={(e) => permissionChecked(e, "download_P")}
            />
          </span>
        </div>
        <div className={styles["user-div"]}>
          <div className={styles["user"]}>
            <h4>User ID</h4>
            <input
              type="text"
              name="userIdText"
              placeholder="User ID"
              className={styles.custominput}
              value={userAuth.userIdText}
              onChange={handleUserAuthChange}
              required
              style={{
                color: userAuth.userIdText === "taken" ? "red" : "green",
                fontWeight: "bold",
              }}
            />
            <div>
              {userIdStatus === "taken" && (
                <h4 style={{ color: "red" }}>*User Id is already taken</h4>
              )}
              {userIdStatus === "available" && (
                <h4 style={{ color: "green" }}>*User Id is available</h4>
              )}
            </div>
          </div>
          <div className={styles["user"]}>
            <h4>Password</h4>
            <div className={styles.userpassword}>
              <input
                type={showPassword ? "text" : "password"}
                name="passwordText"
                placeholder="Password"
                className={styles.custominput}
                value={userAuth.passwordText}
                onChange={handleUserAuthChange}
                required
              />
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setShowPassword(!showPassword);
                  }}
                >
                  {showPassword ? "hide" : "show"}
                </button>
              </div>
            </div>
          </div>
          <div className={styles["user"]}>
            <h4>Confirm Password</h4>
            <input
              type="password"
              name="confirmPasswordText"
              placeholder="Confirm Password"
              className={styles.custominput}
              value={userAuth.confirmPasswordText}
              onChange={handleUserAuthChange}
              required
              style={{
                color:
                  userAuth.confirmPasswordText === userAuth.passwordText
                    ? "green"
                    : "red",
              }}
            />
            <div>
              {userAuth.confirmPasswordText && (
                <h4
                  className="user-id-status"
                  style={{
                    color:
                      userAuth.confirmPasswordText === userAuth.passwordText
                        ? "green"
                        : "red",
                    fontSize: "14px",
                  }}
                >
                  {userAuth.confirmPasswordText !== userAuth.passwordText
                    ? " Password must match"
                    : "Password match"}
                </h4>
              )}
            </div>
          </div>
        </div>
        <div className={styles.btndiv}>
          <button
            onClick={(e) => {
              window.location.reload();
            }}
          >
            New
          </button>
          <button
            onClick={(e) => {
              OnSaveUser(e);
              OnUserPermissionSave(e);
              UserIdAndPassword(e);
            }}
          >
            Add
          </button>
          <button
            onClick={() => {
              UpdateUserData(updateUniqueId);
            }}
          >
            Update
          </button>
          <button
            onClick={() => {
              deleteUserData();
              console.log("delete");
            }}
          >
            Delete
          </button>

          <button
            onClick={() => {
              searchByUniqueId(serchByUserId.trim().toUpperCase());
            }}
          >
            Search
          </button>
          {showForm && (
            <div className={styles["form-icon-div"]}>
              <FaWpforms
                className={styles["form-icon"]}
                onClick={() => setShowFormPopUp((prev) => !prev)}
                style={{
                  backgroundColor: isUserFormCreated ? "blue" : "red",
                  color: "white",
                }}
              />

              <div
                className={`${styles["popup-wrapper"]} ${
                  showFormPopUp ? styles.show : ""
                }`}
              >
                <div className={styles["popup-content-div"]}>
                  <IoMdCloseCircle
                    className={styles["close-icon"]}
                    onClick={() => setShowFormPopUp(false)}
                  />
                  <div className={styles["popup-content"]}>
                    <UserAssignTask
                      setAuto={selectedAssignProducts}
                      currentFormId={currentFormId || null}
                      updateFormId={updateFormId || null}
                      userLoginId={userLoginId}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className={styles.history}>
        <table>
          <thead>
            <tr>
              <th>Sr No.</th>
              <th>Unique UserId</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Rolename</th>
              <th>Division</th>
              <th>Assign Product</th>
              <th>Permissions</th>
              <th>User Name</th>
            </tr>
          </thead>
          <tbody>
            {userDataList1.map((todo, index) => {
              const permissionsArray = userDataList2.filter((per) => {
                return per.generateUniqueId === todo.generateUniqueId;
              });
              const mergedPermissions = permissionsArray.reduce(
                (acc, curr) => ({
                  create_P: acc.create_P || curr.create_P,
                  update_P: acc.update_P || curr.update_P,
                  view_P: acc.view_P || curr.view_P,
                  download_P: acc.download_P || curr.download_P,
                  delete_P: acc.delete_P || curr.delete_P,
                  edit_P: acc.edit_P || curr.edit_P,
                  uploadFile_P: acc.uploadFile_P || curr.uploadFile_P,
                }),
                {}
              );

              const userName = userDataList3.find(
                (u_name) => todo.generateUniqueId === u_name.generateUniqueId
              );
              return (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>
                    <span
                      style={{
                        color: isUserFormCreated ? "blue" : "red",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        searchByUniqueId(todo.generateUniqueId);
                      }}
                    >
                      {todo.generateUniqueId}
                    </span>
                  </td>
                  <td>{todo.name}</td>
                  <td>{todo.email}</td>
                  <td>{todo.mobile}</td>
                  <td>{todo.roleName}</td>
                  <td>{todo.division.join(", ")} </td>
                  <td>{todo.assignProduct.join(", ")} </td>
                  <td>
                    {permissionsArray.length > 0 ? (
                      <>
                        {mergedPermissions.create_P && <span>create, </span>}
                        {mergedPermissions.update_P && <span>update, </span>}
                        {mergedPermissions.view_P && <span>view, </span>}
                        {mergedPermissions.download_P && (
                          <span>download, </span>
                        )}
                        {mergedPermissions.delete_P && <span>delete, </span>}
                        {mergedPermissions.edit_P && <span>edit, </span>}
                        {mergedPermissions.uploadFile_P && (
                          <span>upload File</span>
                        )}
                      </>
                    ) : (
                      <span>No Permission Allotted</span>
                    )}
                  </td>

                  <td>{userName?.userID}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
    {/* <div className="register-main">
      <div className="register-page">
        <div className="form-detail">
          <div className="form-detail-div1">
            <div className="form-detail-div1-heading">
              <h3>Add User</h3>
            </div>
            <div
              className="unique-id-generator"
              style={{ margin: "0px", padding: "0px" }}
            >
              <p>Id- {uniqueUserIdGenerator}</p>
              <input
                type="text"
                placeholder="search Id"
                onChange={(e) => {
                  const user_id = e.target.value;
                  setSearchByUserId(user_id);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const userId = e.target.value.trim().toUpperCase();
                    // if (!userId) return alert("Please enter a User ID.");
                    searchByUniqueId(userId);
                  }
                }}
              />
            </div>
          </div>
          <div className="form-detail-div2">
            <div className="form-detail-div2-left">
              <label htmlFor="">Role Name</label>
              <CustomSelect
                options={roleNameOptions}
                value={selectRolename}
                isMulti={false}
                onChange={handleChangeRoleNameSelectOption}
              />
              <label htmlFor="">Name</label>
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => {
                  handleChange(e);
                  searchbyNameOrMobile(e.target.value);
                }}
                className=" inputss"
                required
              />

              <label htmlFor="">Division</label>
              <CustomSelect
                options={divsionOptions}
                value={selectedDivisions}
                isMulti={true}
                onChange={handleChangeDivisionSelectOption}
              />
            </div>
            <div className="form-detail-div2-right">
              <label htmlFor="">Email</label>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => {
                  handleChange(e);
                  searchbyNameOrMobile(e.target.value);
                }}
                className=" inputss"
                required
              />
              <label htmlFor="">Mobile Number</label>
              <input
                type="tel"
                name="mobile"
                placeholder="Mobile"
                value={formData.mobile}
                onChange={(e) => {
                  handleChange(e);
                  searchbyNameOrMobile(e.target.value);
                }}
                className=" inputss"
                required
              />
              <label htmlFor="">Assign Product</label>

              <CustomSelect
                options={assignProductOptions}
                value={selectedAssignProducts}
                isMulti={true}
                onChange={handleChangeAssignProduct}
              />
            </div>
          </div>
          <div className="display-item">
            <div className="display-item-division">
              <div className="division-box">
                <div className="register-box">
                  {selectedDivisions.map((division) => (
                    <div key={division.value}>
                      <h4>{division.label}</h4>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="display-item-product">
              <div className="product-box">
                {selectedDivisions.map((divi) => (
                  <div key={divi.value} className="register-box">
                    <h4>{divi.label}</h4>
                    {selectedAssignProducts
                      .filter((product) => product.divisionId === divi.value)
                      .map((product, index) => (
                        <p> {product.label}</p>
                      ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="permission-div">
            <div className="permission-div1">
              <label htmlFor="">Permission</label>
            </div>
            <div className="permission-div2">
              <label className="checkbox" htmlFor="">
                Create
                <input
                  type="checkbox"
                  checked={permissionData.create_P}
                  onClick={(e) => permissionChecked(e, "create_P")}
                />
              </label>
              <label className="checkbox" htmlFor="">
                Update
                <input
                  type="checkbox"
                  checked={permissionData.update_P}
                  onClick={(e) => permissionChecked(e, "update_P")}
                />
              </label>
              <label className="checkbox" htmlFor="">
                Delete
                <input
                  type="checkbox"
                  checked={permissionData.delete_P}
                  onClick={(e) => permissionChecked(e, "delete_P")}
                />
              </label>
              <label className="checkbox" htmlFor="">
                Edit
                <input
                  type="checkbox"
                  checked={permissionData.edit_P}
                  onClick={(e) => permissionChecked(e, "edit_P")}
                />
              </label>
              <label className="checkbox" htmlFor="">
                View
                <input
                  type="checkbox"
                  checked={permissionData.view_P}
                  onClick={(e) => permissionChecked(e, "view_P")}
                />
              </label>
              <label className="checkbox" htmlFor="">
                Upload File
                <input
                  type="checkbox"
                  checked={permissionData.uploadFile_P}
                  onClick={(e) => permissionChecked(e, "uploadFile_P")}
                />
              </label>
              <label className="checkbox" htmlFor="">
                Download
                <input
                  type="checkbox"
                  checked={permissionData.download_P}
                  onClick={(e) => permissionChecked(e, "download_P")}
                />
              </label>
            </div>
          </div>

          <div className="form-detail-left-user">
            <div className="form-detail-left-user-1">
              <div className="form-detail-left-user-1-label">
                <label htmlFor="">User ID</label>
              </div>
              <div className="form-detail-left-user-1-input">
                <input
                  type="text"
                  name="userIdText"
                  placeholder="User ID"
                  value={userAuth.userIdText}
                  onChange={handleUserAuthChange}
                  className="userId inputs"
                  required
                  style={{
                    color: userAuth.userIdText === "taken" ? "red" : "green",
                    fontWeight: "bold",
                  }}
                />
              </div>
              <div className="form-detail-left-user-1-modal">
                {userIdStatus === "taken" && (
                  <p
                    className="user-id-status"
                    style={{ color: "red", fontSize: "14px" }}
                  >
                    User Id is already taken
                  </p>
                )}
                {userIdStatus === "available" && (
                  <p
                    className="user-id-status"
                    style={{ color: "green", fontSize: "14px" }}
                  >
                    User Id is available
                  </p>
                )}
              </div>
            </div>
            <div className="form-detail-left-user-2">
              <div className="form-detail-left-user-1-label">
                <label htmlFor="">Password</label>
              </div>
              <div className="form-detail-left-user-1-input">
                <div className="userpassword">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="passwordText"
                    placeholder="Password"
                    value={userAuth.passwordText}
                    onChange={handleUserAuthChange}
                    className="userpassword-input "
                    required
                  />
                  <button
                    type="button"
                    className="userpassword-btn"
                    onClick={() => {
                      setShowPassword(!showPassword);
                      // console.log("showPassword", showPassword);
                    }}
                  >
                    {showPassword ? "hide" : "show"}
                  </button>
                </div>
              </div>
              <div className="form-detail-left-user-1-modal"></div>
            </div>
            <div className="form-detail-left-user-3">
              <div className="form-detail-left-user-1-label">
                <label htmlFor="">Confirm Password</label>
              </div>
              <div className="form-detail-left-user-1-input">
                <input
                  type="password"
                  name="confirmPasswordText"
                  placeholder="Confirm Password"
                  value={userAuth.confirmPasswordText}
                  onChange={handleUserAuthChange}
                  className="userId inputs"
                  required
                  style={{
                    color:
                      userAuth.confirmPasswordText === userAuth.passwordText
                        ? "green"
                        : "red",
                  }}
                />
              </div>
              <div className="form-detail-left-user-1-modal">
                {userAuth.confirmPasswordText && (
                  <p
                    className="user-id-status"
                    style={{
                      color:
                        userAuth.confirmPasswordText === userAuth.passwordText
                          ? "green"
                          : "red",
                      fontSize: "14px",
                    }}
                  >
                    {userAuth.confirmPasswordText !== userAuth.passwordText
                      ? " Password must match"
                      : "Password match"}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="four-btns">
            <button
              onClick={(e) => {
                window.location.reload();
              }}
            >
              New
            </button>
            <button
              onClick={(e) => {
                OnSaveUser(e);
                OnUserPermissionSave(e);
                UserIdAndPassword(e);
              }}
            >
              Add
            </button>
            <button
              onClick={() => {
                UpdateUserData(updateUniqueId);
              }}
            >
              Update
            </button>
            <button
              onClick={() => {
                deleteUserData();
                console.log("delete");
              }}
            >
              Delete
            </button>

            <button
              onClick={() => {
                searchByUniqueId(serchByUserId.trim().toUpperCase());
              }}
            >
              Search
            </button>
            {showForm && (
              <div className="form-icon-div">
                <FaWpforms
                  className="form-icon"
                  onClick={() => setShowFormPopUp((prev) => !prev)}
                  style={{
                    backgroundColor: isUserFormCreated ? "blue" : "red",
                    color: "white",
                  }}
                />

                <div className={`popup-wrapper ${showFormPopUp ? "show" : ""}`}>
                  <div className="popup-content-div">
                    <IoMdCloseCircle
                      className="close-icon"
                      onClick={() => setShowFormPopUp(false)}
                    />
                    <div className="popup-content">
                      <UserAssignTask
                        setAuto={selectedAssignProducts}
                        currentFormId={currentFormId || null}
                        updateFormId={updateFormId || null}
                        userLoginId={userLoginId}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="show-user-table">
          <div className="show-user-table-div2">
            <table>
              <tr>
                <th>Sr No.</th>
                <th>Unique UserId</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Rolename</th>
                <th>Division</th>
                <th>Assign Product</th>
                <th>Permissions</th>
                <th>User Name</th>
              </tr>

              {userDataList1.map((todo, index) => {
                const permissionsArray = userDataList2.filter((per) => {
                  // console.log("Sample permission data:", userDataList2[0]);

                  // console.log(
                  //   "todo.generateUniqueId:",
                  //   todo.generateUniqueId
                  // );
                  // console.log(
                  //   "per.uniqueUserIdGenerator:",
                  //   per.uniqueUserIdGenerator
                  // );
                  return per.generateUniqueId === todo.generateUniqueId;
                });
                // console.log("User:", todo.generateUniqueId);
                // console.log("Permissions Array:", permissionsArray);
                const mergedPermissions = permissionsArray.reduce(
                  (acc, curr) => ({
                    create_P: acc.create_P || curr.create_P,
                    update_P: acc.update_P || curr.update_P,
                    view_P: acc.view_P || curr.view_P,
                    download_P: acc.download_P || curr.download_P,
                    delete_P: acc.delete_P || curr.delete_P,
                    edit_P: acc.edit_P || curr.edit_P,
                    uploadFile_P: acc.uploadFile_P || curr.uploadFile_P,
                  }),
                  {}
                );
                // console.log("Merged Permissions:", mergedPermissions);
                const userName = userDataList3.find(
                  (u_name) => todo.generateUniqueId === u_name.generateUniqueId
                );
                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      <span
                        style={{
                          color: isUserFormCreated ? "blue" : "red",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          searchByUniqueId(todo.generateUniqueId);
                        }}
                      >
                        {todo.generateUniqueId}
                      </span>
                    </td>
                    <td>{todo.name}</td>
                    <td>{todo.email}</td>
                    <td>{todo.mobile}</td>
                    <td>{todo.roleName}</td>
                    <td>{todo.division.join(", ")} </td>
                    <td>{todo.assignProduct.join(", ")} </td>
                    <td>
                      {permissionsArray.length > 0 ? (
                        <>
                          {mergedPermissions.create_P && <span>create, </span>}
                          {mergedPermissions.update_P && <span>update, </span>}
                          {mergedPermissions.view_P && <span>view, </span>}
                          {mergedPermissions.download_P && (
                            <span>download, </span>
                          )}
                          {mergedPermissions.delete_P && <span>delete, </span>}
                          {mergedPermissions.edit_P && <span>edit, </span>}
                          {mergedPermissions.uploadFile_P && (
                            <span>upload File</span>
                          )}
                        </>
                      ) : (
                        <span>No Permission Allotted</span>
                      )}
                    </td>

                    <td>{userName?.userID}</td>
                  </tr>
                );
              })}
            </table>
          </div>
        </div>
      </div>
    </div> */}
    </>
  );
};

export default Register;
