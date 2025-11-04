import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import styles from "./UserPage.module.css";
import AddField from "../ClientPage/AddField";
import CustomInput from "../../UI/CustomInput";
import CustomSelect from "../CustomSelect";
import { BsShieldCheck } from "react-icons/bs";
import { BsShieldX } from "react-icons/bs";
import { BsDatabaseFillDown } from "react-icons/bs";
import { FaAngleRight, FaTruckMonster } from "react-icons/fa6";
import { FaAngleLeft } from "react-icons/fa6";
import TimePickerComponent from "../../UI/TimePickerComponent";
import { FaFlag } from "react-icons/fa";
import { FaUserClock } from "react-icons/fa6";
import History from "../HistoryPage/History";
import { HiOutlineRefresh } from "react-icons/hi";
import { IoReceipt } from "react-icons/io5";
import { base_url } from "../../config/config";
import { AuthContext } from "../../context-api/AuthContext";
import { useContext } from "react";
import DisplaySearchClientsPortal from "../ClientPage/DisplaySearchClientsPortal";

const UserPage = () => {
  const { userLoginId, userPermissions } = useContext(AuthContext);
  const originalDataRef = useRef(null);
  const navigate = useNavigate();
  const { state } = useLocation();
  const [getSelectedTime, setGetSelectedTime] = useState("");
  const taskDetails = state?.taskdata || "";
  const [region, setRegion] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [lastId, setLastId] = useState(null);
  const [verifiedByEmployee, setVerifiedByEmploye] = useState("SA");
  const [countryOptions, setCountryOptions] = useState([]);
  const [quotationYesNo, setQuotationYesNo] = useState(false);
  const [feedback, setFeedback] = useState(false);
  const [isUnsavedNewForm, setIsUnsavedNewForm] = useState(false);
  const [getSelectedNewTime, setGetSelectedNewTime] = useState("");
  const initialClientDetails = {
    sr_no: "",
    clientId: "",
    bussinessNames: {},
    clientName: "",
    userSubscriptionId: "",
    numbers: {},
    emails: {},
    website: "",
    addresses: {},
    pincode: "",
    district: "",
    state: "",
    country: "",
    assignBy: "",
    assignTo: "",
    product: [],
    stage: [],
    quotationShare: "",
    expectedDate: "",
    remarks: "",
    callType: "",
    followUpDate: "",
    verifiedBy: "",
    time: "",
    action: "",
    database: "",
    tracker: {
      new_data_db: { completed: false, completedDate: "" },
      leads_db: { completed: false, completedDate: "" },
      training_db: { completed: false, completedDate: "" },
      follow_up_db: { completed: false, completedDate: "" },
      installation_db: { completed: false, completedDate: "" },
      demo_db: { completed: false, completedDate: "" },
      recovery_db: { completed: false, completedDate: "", recoveryHistory: [] },
      target_db: { completed: false, completedDate: "" },
      no_of_new_calls_db: { completed: false, completedDate: "" },
      support_db: { completed: false, completedDate: "" },
      out_bound_db: { completed: false, completedDate: "" },
      in_bound_db: { completed: false, completedDate: "" },
      hot_db: { completed: false, completedDate: "" },
      lost_db: { completed: false, completedDate: "" },
      create_db: { completed: false, completedDate: "" },
      update_db: { completed: false, completedDate: "" },
      deactivate_db: { completed: false, completedDate: "" },
    },
    label: "",
    completion: {
      receivedProduct: "",
      status: "",
      newExpectedDate: "",
      newTime: "",
      newRemark: "",
      newStage: "",
    },
    amountDetails: {
      totalAmount: "",
      paidAmount: "",
      extraCharges: "",
      finalCost: "",
      newAmount: "",
      balanceAmount: "",
      gst: "",
      referenceId: "",
      mode: "",
    },
  };
  const [clientDetails, setClientDetails] = useState(initialClientDetails);

  const [isModified, setIsModified] = useState(false);
  const [stageOptions, setStageOptions] = useState([
    { label: "Support", value: "support_db" },
    { label: "Training", value: "training_db" },
    { label: "Hot", value: "hot_db" },
    { label: "Lost", value: "lost_db" },
    { label: "Follow up", value: "follow_up_db" },
    { label: "Recovery", value: "recovery_db" },
    { label: "In-process", value: "in-process_db" },
    { label: "Dispatched", value: "dispatched_db" },
  ]);
  const [selectedStageOptions, setSelectedStageOptions] = useState([]);
  const [userProductList, setUserProductList] = useState([]);
  const [mapClientAllHistory, setMapClientAllHistory] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [databaseStatus, setDatabaseStatus] = useState(true);
  const [newClientFormId, setNewClientFormId] = useState("");
  const [checkPermissionManagement, setCheckPermissionManagement] = useState(
    {}
  );
  const [taskClientIdArray, setTaskClientIdArray] = useState([]);
  const [taskIndex, setTaskIndex] = useState(0);
  const [currentClientId, setCurrentClientId] = useState("");
  const [isTaskMode, setIsTaskMode] = useState(false);
  const [clientCount, setClientCount] = useState("");
  const [currentClientCount, setCurrentClientCount] = useState(1);
  const [isClientIdAvailableInDb, setIsClientIdAvailableInDb] = useState("");
  const [checkRecovery, setCheckRecovery] = useState(true);
  const [checkInstallation, setCheckInstallation] = useState(false);
  const [checkHotClient, setCheckHotClient] = useState(false);
  const [checkDisplaySearchClients, setCheckDisplaySearchClients] =
    useState(false);
  const [allSearchClientData, setAllSearchClientData] = useState([]);
  const [selectedUserProduct, setSelectedUserProduct] = useState([]);
  const [storedtotalAmount, setStoredTotalAmount] = useState("");
  const [storedPaidAmount, setStoredPaidAmount] = useState("");
  const [storedBalanceAmount, setStoredBalanceAmount] = useState("");
  const [refreshHistory, setRefreshHistory] = useState(false);
  const [isNewDataEntry, setIsNewDataEntry] = useState(false);
  const [isNewDataExist, setIsNewDataExist] = useState(false);
  const [stageTab, setStageTab] = useState("Planner");
  const [selectNewStage, setSelectNewStage] = useState([]);
  const [amountHandle, setAmountHandle] = useState({
    prevTotal: 0,
    prevExtra: 0,
    prevFinal: 0,
    prevNewAmount: 0,
    prevPaid: 0,
    prevBalance: 0,
  });
  const onlinePaymentMode = [
    "CASH",
    "DEBIT CARD",
    "CREDIT CARD",
    "NET BANKING",
    "UPI",
    "WALLET",
    "CHEQUE",
  ];
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyPop, setHistoryPop] = useState(false);
  const [activedBackButton, setActivedBackButton] = useState(false);

  useEffect(() => {
    if (!getSelectedNewTime) return;
    setClientDetails((prev) => ({
      ...prev,
      completion: {
        ...prev.completion,
        newTime: getSelectedNewTime,
      },
    }));
  }, [getSelectedNewTime]);

  useEffect(() => {
    const fetchState = async () => {
      // console.log("state main hai========", state);

      if (state?.from === "searchClient") {
        setTaskClientIdArray(state.selectedClients);
        const id = state.selectedClients[taskIndex];
        // console.log("ffrom id", id, state.selectedClients);
        setCurrentClientId(id);
        setActivedBackButton(true);
      } else if (state?.from === "remainder") {
        const id = state.id;
        // console.log("inside remainder", id, state.from);

        setCurrentClientId(id);
        setStageTab("Completion");
      } else if (state?.from === "clientpage") {
        const id = state.id;
        setCurrentClientId(id);
        // console.log("inside clientpage", id, state.from);
      } else {
        handleClientNewForm();
        console.log("inside handlenew form");
      }
    };
    fetchState();
  }, [state]);

  useEffect(() => {
    console.log("Fetching with clientId:---", currentClientId);
  }, [currentClientId]);

  useEffect(() => {
    console.log("inside Id", currentClientId);
    if (!currentClientId) return; // Prevent call if ID is empty
    const fetchUserData = async () => {
      try {
        console.log("inside fun", currentClientId);
        const result = await axios.get(
          `${base_url}/subscribe-user/search-subscribe-user/${currentClientId}`
        );
        const detail = result?.data?.result;
        console.log("details", detail);

        const businessFields = [
          { label: "Business Name", value: detail?.optical_name1_db },
          { label: "Business Name 2", value: detail?.optical_name2_db },
          { label: "Business Name 3", value: detail?.optical_name3_db },
        ];
        const emails = [
          { label: "Email 1", value: detail?.email_1_db },
          { label: "Email 2", value: detail?.email_2_db },
          { label: "Email 3", value: detail?.email_3_db },
        ];
        const addresses = [
          { label: "Address 1", value: detail?.address_1_db },
          { label: "Address 2", value: detail?.address_2_db },
          { label: "Address 3", value: detail?.address_3_db },
        ];

        const mobiles = [
          { label: "Primary Number", value: detail?.mobile_1_db },
          { label: "Secondary Number", value: detail?.mobile_2_db },
          { label: "Tertiary Number", value: detail?.mobile_3_db },
        ];
        const todayDate = todaysDate();

        setSelectedStageOptions(
          (detail.stage_db || []).filter((item) =>
            stageOptions.some((stg) => stg.value === item.value)
          )
        );

        setSelectNewStage((detail.stage_db || []).map((stage) => stage.label));
        //console.log("amount", detail.amountDetails_db);
        setSelectedUserProduct(
          (detail.product_db || []).map((item) => ({
            label: item.label,
            value: item.value,
          }))
        );
        setAmountHandle({
          prevTotal: detail.amountDetails_db.totalAmount,
          prevExtra: detail.amountDetails_db.extraCharges,
          prevFinal: detail.amountDetails_db.finalCost,
          prevNewAmount: detail.amountDetails_db.newAmount,
          prevPaid: detail.amountDetails_db.paidAmount,
          prevBalance: detail.amountDetails_db.balanceAmount,
        });
        const mappedClient = {
          ...initialClientDetails,
          sr_no: detail.client_serial_no_id,
          clientId: detail.client_id,
          userSubscriptionId: detail.client_subscription_id,
          addresses: addresses,
          pincode: detail.pincode_db,
          clientName: detail.client_name_db,
          bussinessNames: businessFields,
          followUpDate: detail.expectedDate_db || todayDate,
          numbers: mobiles,
          emails: emails,
          quotationShare: detail.quotationShare_db,
          expectedDate: "",
          remarks: detail.remarks_db || "",
          callType: detail.callType_db,
          verifiedBy: detail.verifiedBy_db,
          time: detail.time_db,
          label: detail.label_db || "",
          website: detail.website_db,
          database: detail.database_status_db,
          amountDetails: {
            totalAmount: detail.amountDetails_db?.totalAmount || "",
            paidAmount: detail.amountDetails_db?.paidAmount || "",
            extraCharges: detail.amountDetails_db?.extraCharges || "",
            finalCost: detail.amountDetails_db?.finalCost || "",
            newAmount: 0,
            balanceAmount: detail.amountDetails_db?.balanceAmount || "",
            gst: detail.amountDetails_db?.gst || "",
            referenceId: detail.amountDetails_db?.referenceId || "",
            mode: detail.amountDetails_db?.mode || "",
          },
          completion: {
            // ...prev.completion,
            receivedProduct: detail?.product_db?.[0]?.label || "",
            status: detail?.completion_db?.status || "",
            newExpectedDate: "",
            newTime: "",
            newRemark: detail?.completion_db?.newRemark || "",
            newStage: detail?.completion_db?.newStage || "",
          },
        };
        setClientDetails(mappedClient);

        setStoredTotalAmount(
          parseFloat(detail.amountDetails_db.totalAmount) || 0
        );
        setStoredPaidAmount(
          parseFloat(detail.amountDetails_db.paidAmount) || 0
        );
        setStoredBalanceAmount(
          parseFloat(detail.amountDetails_db.balanceAmount) || 0
        );
        setCheckHotClient(detail?.tracking_db?.hot_db?.completed);

        setIsModified(false);
      } catch (err) {
        console.log("internal error", err);
      }
    };

    fetchUserData();
  }, [currentClientId, refresh]);

  //WHEN PINCODE ENTER AUTO FETCH STATE,DISTRICT, DEBOUNCING USED

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (
        clientDetails.pincode ||
        clientDetails.district ||
        clientDetails.state
      ) {
        fetchRegionData();
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [clientDetails.pincode, clientDetails.district, clientDetails.state]);

  const fetchRegionData = async () => {
    try {
      if (clientDetails.pincode) {
        const searching = {
          pincode: clientDetails.pincode,
          limit: 50,
          lastId: lastId || undefined,
        };

        const pincodeRes = await axios.get(
          `${base_url}/pincode/search-pincode`,
          { params: searching }
        );
        const regionData = pincodeRes.data.data;
        const uniqueDistricts = Array.from(
          new Set(regionData.map((place) => place.district_db))
        );
        const uniqueState = Array.from(
          new Set(regionData.map((place) => place.state_db))
        );
        const uniqueCountry = Array.from(
          new Set(regionData.map((place) => place.country_db))
        );

        setDistrictOptions(uniqueDistricts);
        setStateOptions(uniqueState);
        setCountryOptions(uniqueCountry);

        setClientDetails((prev) => ({
          ...prev,
          district: uniqueDistricts[0] || prev.district,
          state: uniqueState[0] || prev.state,
          country: uniqueCountry[0] || prev.country,
        }));
      }

      // Second API for fetching based on names
      const placeData = await axios.get(
        `${base_url}/pincode/search-getplaces`,
        {
          params: {
            state: clientDetails.state,
            district: clientDetails.district,
            village: clientDetails.village,
            pincode: clientDetails.pincode,
            taluka: clientDetails.taluka,
          },
        }
      );

      const regionData = placeData.data;
      setDistrictOptions(regionData.districtname);
      setStateOptions(regionData.statename);
    } catch (err) {
      console.error("Error fetching region data:", err);
    }
  };

  //FETCHING ASSING PRODUCT TO EXECUTIVE BY SA/ADMIN
  useEffect(() => {
    const userProductFetch = async () => {
      try {
        const result = await axios.get(
          `${base_url}/users/search-by-user/${userLoginId}`
        );
        //console.log("product", result.data?.assignProduct);
        const productsList = result.data?.result?.assignProduct.map((item) => ({
          label: item.label,
          value: item.label,
        }));
        //console.log("product", productsList);
        setUserProductList(productsList);
      } catch (err) {
        console.log("internal error", err);
      }
    };
    userProductFetch();
  }, []);

  //FETCHING USER PRODUCTLIST OF SA
  useEffect(() => {
    const fetchSAproductList = async () => {
      try {
        const result = await axios.get(
          `${base_url}/setting/get-superadmin-product`
        );
        //console.log("product", result.data.result);
        const productsList = result.data.result?.map((item) => ({
          label: item.assign_product_name,
          value: item.assign_product_name,
        }));
        //console.log("Super admin product===============", productsList);
        setUserProductList(productsList);
      } catch (err) {
        console.log("internal error", err);
      }
    };
    if (userLoginId === "SA") {
      fetchSAproductList();
    }
  }, []);

  //FETCHING PERMISSION OF USER CREATE,UPDATE,DELETE
  useEffect(() => {
    async function fetch() {
      const result = await axios.get(
        `${base_url}/users/search-by-permission/${userLoginId}`
      );
      const permission = result.data;
      // console.log("permsison", permission);
      setCheckPermissionManagement(permission);
    }
    fetch();
  }, []);

  //CHECING RECORD ALREADY EXIST IN DB OR NOT
  useEffect(() => {
    if (
      clientDetails.bussinessNames?.length > 0 &&
      clientDetails.numbers?.length > 0 &&
      clientDetails.emails?.length > 0 &&
      clientDetails.pincode.trim() &&
      clientDetails.state.trim() &&
      clientDetails.district.trim() &&
      isNewDataEntry
    ) {
      const debouncing = setTimeout(async () => {
        try {
          const result = await axios.post(
            `${base_url}/subscribe-user/check-already-exist`,
            {
              ...clientDetails,
            }
          );
          console.log("record already exist", result.data);
          if (result?.data?.totalCount > 0) {
            alert(result.data.message);
            setIsNewDataExist(true);
            setCheckDisplaySearchClients(true);
            setAllSearchClientData(result?.data);
          } else {
            setIsNewDataExist(false);
          }
        } catch (err) {
          console.log("internal error", err);
        }
      }, 500);
      return () => {
        clearTimeout(debouncing);
      };
    }
  }, [
    clientDetails.bussinessNames,
    clientDetails.numbers,
    clientDetails.emails,
    clientDetails.pincode,
    clientDetails.state,
    clientDetails.district,
  ]);

  function todaysDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const TodaysDate = `${year}-${month}-${day}`;
    // console.log("date", TodaysDate);
    return TodaysDate;
  }

  const handleSearchInput = (name, value) => {
    console.log(value);
    setClientDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const hanldeAmountChange = (fieldType, rawValue) => {
    let value = rawValue;

    // ✅ convert to number only if not gst/mode/referenceId
    if (
      fieldType !== "gst" &&
      fieldType !== "mode" &&
      fieldType !== "referenceId"
    ) {
      value = Math.abs(Number(rawValue)) || 0;
    }

    // ✅ gst validation
    if (fieldType === "gst" && Number(value) > 99) {
      return; // stop update
    }

    // ✅ calculate
    const calculation = handleCalculation(fieldType, value);

    // ✅ update state
    setClientDetails((prev) => ({
      ...prev,
      amountDetails: {
        ...prev.amountDetails,
        [fieldType]: value,
        totalAmount: calculation.totalAmount,
        paidAmount: calculation.paidAmount,
        balanceAmount: calculation.balanceAmount,
        newAmount: calculation.newAmount, // always keep the latest correct newAmount
      },
    }));
  };

  const handleCalculation = (fieldType, value) => {
    const finalCost =
      Number(amountHandle.prevFinal) ||
      Number(clientDetails.amountDetails.finalCost) ||
      0;
    const extraCharges =
      Number(amountHandle.prevExtra) ||
      Number(clientDetails.amountDetails.extraCharges) ||
      0;
    const prevPaidAmount = Number(amountHandle.prevPaid) || 0;

    let updatedFinalCost = finalCost;
    let updatedExtraCharges = extraCharges;
    let newAmount = Number(clientDetails.amountDetails.newAmount) || 0; // keep current newAmount
    let updatedPaidAmount = prevPaidAmount;

    // ✅ update cost fields
    if (fieldType === "finalCost") updatedFinalCost = Number(value) || 0;
    if (fieldType === "extraCharges") updatedExtraCharges = Number(value) || 0;

    // ✅ only update if fieldType = newAmount
    if (fieldType === "newAmount") {
      newAmount = Number(value) || 0;
      updatedPaidAmount = prevPaidAmount + newAmount;
    } else {
      // when editing gst/mode/referenceId, keep same paid + newAmount
      updatedPaidAmount = prevPaidAmount + newAmount;
    }

    const totalAmount = updatedFinalCost + updatedExtraCharges;
    let balanceAmount = totalAmount - updatedPaidAmount;

    // ✅ Rule: if newAmount > totalAmount → reset newAmount, keep paid = prevPaid
    if (updatedPaidAmount > totalAmount) {
      alert("Paid Amount cannot exceed TotalCost");
      newAmount = 0;
      updatedPaidAmount = prevPaidAmount; // rollback to previous paid only
      balanceAmount = totalAmount - updatedPaidAmount;
    }

    return {
      totalAmount,
      paidAmount: updatedPaidAmount,
      balanceAmount,
      newAmount,
    };
  };

  const handleStageChange = (selectedOptions) => {
    //console.log("Full Selected Objects:", selectedOptions);

    let updatedOptions = [...(selectedOptions || [])];
    const tempStageValues = updatedOptions.map((item) => item.value);
    // console.log("ream",selectedStageValues)

    if (tempStageValues.includes("hot_db")) {
      updatedOptions = updatedOptions.filter((opt) => opt.value !== "lost_db");
    } else if (tempStageValues.includes("lost_db")) {
      updatedOptions = updatedOptions.filter((opt) => opt.value !== "hot_db");
    }
    setSelectedStageOptions(updatedOptions);
    // Recalculate selectedStageValues after removing hot/lost conflict
    const selectedStageValues = updatedOptions.map((item) => item.value);

    if (selectedStageValues.includes("recovery_db")) {
      setCheckRecovery(true);
    } else {
      setCheckRecovery(false);
    }

    if (selectedStageValues.includes("installation_db")) {
      setCheckInstallation(true);
    } else {
      setCheckInstallation(false);
      setClientDetails((prev) => ({
        ...prev,
        totalAmount: "",
        paidAmount: "",
      }));
    }

    setClientDetails((prev) => {
      const updatedTracker = { ...(prev.tracker || {}) };
      //Loop over all tracker keys and update based on selection
      //console.log("updatedTracker", updatedTracker);
      Object.keys(updatedTracker).forEach((key) => {
        // Object.keys(updatedTracker) contains all keys from tracker object ---> ["follow_up", "installation_db", "demo_db", "hot_db", "lost_db"]
        if (selectedStageValues.includes(key)) {
          updatedTracker[key] = {
            completed: true,
            completedDate: new Date().toLocaleDateString("en-GB"),
          };
        } else {
          updatedTracker[key] = {
            completed: false,
            completedDate: "",
          };
        }
        // console.log(
        //   `Key: ${key}, Completed: ${updatedTracker[key].completed}, Date: ${updatedTracker[key].completedDate}`
        // );
      });

      return {
        ...prev,
        tracker: updatedTracker,
      };
    });
    // console.log("yooo")
    setIsModified(true);
  };
  const handleSelectedUserProduct = (selectOptions) => {
    //console.log("product list", selectOptions);
    setSelectedUserProduct(selectOptions);
  };

    //FUNCTION FOR FETCH ALL SEARCH CLIENT DATA
    const handleAllSearchClientData = async () => {
      try {
        console.log(
          "searches are",
          clientDetails.clientName,
          clientDetails.bussinessNames[0].value,
          clientDetails.numbers[0].value,
          clientDetails.addresses[0].value,
          clientDetails.emails[0].value,
          clientDetails.pincode,
          clientDetails.district,
          clientDetails.state,
          clientDetails.clientId
        );
        const result = await axios.get(
          `${base_url}/subscribe-user/search-alluser-match`,
          {
            params: {
              name: clientDetails.clientName || "",
              opticalName: clientDetails.bussinessNames[0].value || "",
              mobile: clientDetails.numbers[0].value || "",
              address: clientDetails.addresses[0].value || "",
              email: clientDetails.emails[0].value || "",
              pincode: clientDetails.pincode || "",
              district: clientDetails.district || "",
              state: clientDetails.state || "",
              clientId: clientDetails.clientId || "",
            },
          }
        );
        setAllSearchClientData(result.data);
        //console.log("search found", result.data);
      } catch (err) {
        console.log("internal error", err);
      }
    };
    const handleClientIdClick = (clickId) => {
    //console.log("client page ", clickId);
    setCurrentClientId(clickId);
  };

  const handleSwichTo = () => {
    navigate("/client-page");
  };

  const handleTimeChange = (time) => {
    if (!time || time === "HH:MM:SS AM/PM") {
      setGetSelectedTime("NA");
    } else {
      setGetSelectedTime(time);
    }
  };

  const handleNewTimeChange = (time) => {
    if (!time || time === "HH:MM:SS AM/PM") {
      setGetSelectedNewTime("NA"); // ✅ use null, not "NA"
    } else {
      setGetSelectedNewTime(time);
    }
  };

  const handlePrevButton = () => {
    if (taskIndex > 0) {
      const index = taskIndex - 1;
      console.log("index", index);
      setCurrentClientId(taskClientIdArray[index]);
      setTaskIndex((prev) => prev - 1);
    }
  };
  const handleNextButton = () => {
    if (taskIndex < taskClientIdArray.length - 1) {
      const index = taskIndex + 1;
      console.log("index", index);
      setCurrentClientId(taskClientIdArray[index]);
      setTaskIndex((prev) => prev + 1);
    }
  };

  const handlePaymentDetails = async () => {
    const prod = selectedUserProduct.map((prod) => prod.label);
    try {
      const result = await axios.post(
        `${base_url}/payment/history`,
        {
          amountDetails: clientDetails.amountDetails,
          userId: userLoginId,
          clientId: clientDetails.clientId,
          clientName: clientDetails.clientName,
          quotationShare: clientDetails.quotationShare,
          product: prod[0],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      //console.log("payment done", result);
      alert("Payment done");
    } catch (err) {
      console.log("internal error", err);
    }
  };

  //CREATE NEW FORM FOR CLIENT DB
  const handleClientNewForm = async () => {
    //console.log("faffsadfsd");
    try {
      const result = await axios.get(`${base_url}/raw-data/global-id`);
      //console.log("lastId", result.data.getLastId);
      const lastSrno = result.data.getLastId;
      const getClientId = `C${String(lastSrno).padStart(7, "0")}`;
      //console.log("getClientId", getClientId);
      const userId = getClientId.replace("C", "U");
      const TodaysDate = new Date().toISOString().split("T")[0];
      setClientDetails({
        ...initialClientDetails,
        clientId: getClientId,
        userSubscriptionId: userId,
        sr_no: lastSrno,
        followUpDate: TodaysDate,
        bussinessNames: [{ label: "Business Name", value: "" }],
        numbers: [{ label: "Primary Number", value: "" }],
        emails: [{ label: "Email 1", value: "" }],
        addresses: [{ label: "Address 1", value: "" }],
        assign: { assignBy: "", assignTo: "" },
      });

      setCurrentClientId(getClientId);
      // setIsUnsavedNewForm(true); // FOR FRESH NEW CLIENT WHICH NOT PRESENT IN RAW FOR THIS USING SO ALSO SENDING DEACTIVATED COPY IN RAW DB
      setSelectedStageOptions([]);
      setSelectedUserProduct([]);
      setStageTab("Planner");
      setCheckHotClient(false);
      setFeedback(false);
      handleTimeChange("HH:MM:SS AM/PM");
      handleNewTimeChange("HH:MM:SS AM/PM");
      setIsUnsavedNewForm(true);
    } catch (err) {
      console.log("internal errro", err);
    }
  };

  const handleSaveUserDetails = async () => {
    // console.log(
    //   "selectedUserProduct",
    //   clientDetails.amountDetails,
    //   clientDetails.amountHistory
    // );
       if(isNewDataExist){
      return alert("Record already exist in Database")
    }
    try {
      clientDetails.tracker.no_of_new_calls_db = {
        completed: true,
        completedDate: new Date().toLocaleDateString("en-GB"),
      };

      if (
        clientDetails.tracker.recovery_db.completed === true &&
        clientDetails.amountDetails.finalCost > 0 &&
        clientDetails.amountDetails.newAmount > 0
      ) {
        await handlePaymentDetails();
      }

      const result = await axios.post(
        `${base_url}/subscribe-user/create-subscribe-user`,
        {
          clientSerialNo: clientDetails.sr_no,
          clientId: currentClientId,
          userId: userLoginId || clientDetails.assignTo,
          bussinessNames: clientDetails.bussinessNames,
          clientName: clientDetails.clientName,
          numbers: clientDetails.numbers,
          emails: clientDetails.emails,
          website: clientDetails.website,
          addresses: clientDetails.addresses,
          pincode: clientDetails.pincode,
          district: clientDetails.district,
          state: clientDetails.state,
          assignBy: clientDetails.assignBy,
          assignTo: clientDetails.assignTo || userLoginId,
          product: selectedUserProduct.map((item) => ({
            label: item.label,
            value: item.label,
          })),
          stage: selectedStageOptions.map((stage) => ({
            label: stage.label,
            value: stage.value,
          })),
          quotationShare: clientDetails.quotationShare,
          expectedDate: clientDetails.expectedDate,
          remarks: clientDetails.remarks,
          followUpDate: clientDetails.followUpDate,
          verifiedBy: clientDetails.verifiedBy,
          action: clientDetails.action,
          database: clientDetails.database,
          tracker: clientDetails.tracker,
          amountDetails: clientDetails.amountDetails,
          amountHistory: clientDetails.amountHistory,
          followUpTime: getSelectedTime,
          label: clientDetails.label,
          completion: clientDetails.completion,
          action: "Create User",
          database: "User",
        }
      );

      console.log("User Save Successfully", result);

      const resultHistory = await axios.post(
        `${base_url}/history/create-history`,
        {
          clientSerialNo: clientDetails.sr_no,
          clientId: clientDetails.clientId,
          userId: userLoginId,
          bussinessNames: clientDetails.bussinessNames,
          clientName: clientDetails.clientName,
          numbers: clientDetails.numbers,
          emails: clientDetails.emails,
          website: clientDetails.website,
          addresses: clientDetails.addresses,
          pincode: clientDetails.pincode,
          district: clientDetails.district,
          state: clientDetails.state,
          country: clientDetails.country,
          assignBy: taskDetails.assignBy_db || "NA",
          assignTo: taskDetails.assignTo_db || userLoginId,
          product: selectedUserProduct.map((item) => ({
            label: item.label,
            value: item.label,
          })),
          stage: selectedStageOptions.map((stage) => ({
            label: stage.label,
            value: stage.value,
          })),
          quotationShare: clientDetails.quotationShare,
          expectedDate: clientDetails.expectedDate,
          remarks: clientDetails.remarks,
          callType: clientDetails.callType,
          followUpDate: clientDetails.followUpDate,
          verifiedBy: clientDetails.verifiedBy,
          database: "User",
          tracker: clientDetails.tracker,
          amountDetails: clientDetails.amountDetails,
          amountHistory: clientDetails.amountHistory,
          isUserPage: true,
          followUpTime: getSelectedTime,
          label: clientDetails.label,
          completion: clientDetails.completion,
          action: "Create User",
        }
      );
      console.log("Client History Save Succressfully", resultHistory);
      if (result && resultHistory) {
        alert("User successfully Save");
      }

      setRefreshHistory((prev) => !prev);
      setRefresh((prev) => !prev);
    } catch (err) {
      console.log("internal error", err);
    }
  };
  const handleUpdateUserDetails = async () => {
    console.log(
      "selectedUserProduct",
      clientDetails.amountDetails,
      clientDetails.amountHistory
    );
    try {
      clientDetails.tracker.no_of_new_calls_db = {
        completed: true,
        completedDate: new Date().toLocaleDateString("en-GB"),
      };

      if (
        clientDetails.tracker.recovery_db.completed === true &&
        clientDetails.amountDetails.finalCost > 0 &&
        clientDetails.amountDetails.newAmount > 0
      ) {
        await handlePaymentDetails();
      }

      const result = await axios.put(
        `${base_url}/subscribe-user/update-subscribe-user/${currentClientId}`,
        {
          clientSerialNo: clientDetails.sr_no,
          clientId: clientDetails.userSubscriptionId,
          userId: userLoginId || clientDetails.assignTo,
          bussinessNames: clientDetails.bussinessNames,
          clientName: clientDetails.clientName,
          numbers: clientDetails.numbers,
          emails: clientDetails.emails,
          website: clientDetails.website,
          addresses: clientDetails.addresses,
          pincode: clientDetails.pincode,
          district: clientDetails.district,
          state: clientDetails.state,
          assignBy: clientDetails.assignBy,
          assignTo: clientDetails.assignTo || userLoginId,
          product: selectedUserProduct.map((item) => ({
            label: item.label,
            value: item.label,
          })),
          stage: selectedStageOptions.map((stage) => ({
            label: stage.label,
            value: stage.value,
          })),
          quotationShare: clientDetails.quotationShare,
          expectedDate: clientDetails.expectedDate,
          remarks: clientDetails.remarks,
          followUpDate: clientDetails.followUpDate,
          verifiedBy: clientDetails.verifiedBy,
          action: clientDetails.action,
          database: clientDetails.database,
          tracker: clientDetails.tracker,
          amountDetails: clientDetails.amountDetails,
          amountHistory: clientDetails.amountHistory,
          followUpTime: getSelectedTime,
          label: clientDetails.label,
          completion: clientDetails.completion,
          action: "update User",
          database: "User",
        }
      );

      console.log("User Updated Successfully", result);

      const resultHistory = await axios.post(
        `${base_url}/history/create-history`,
        {
          clientSerialNo: clientDetails.sr_no,
          clientId: clientDetails.clientId,
          userId: userLoginId,
          bussinessNames: clientDetails.bussinessNames,
          clientName: clientDetails.clientName,
          numbers: clientDetails.numbers,
          emails: clientDetails.emails,
          website: clientDetails.website,
          addresses: clientDetails.addresses,
          pincode: clientDetails.pincode,
          district: clientDetails.district,
          state: clientDetails.state,
          country: clientDetails.country,
          assignBy: taskDetails.assignBy_db || "NA",
          assignTo: taskDetails.assignTo_db || userLoginId,
          product: selectedUserProduct.map((item) => ({
            label: item.label,
            value: item.label,
          })),
          stage: selectedStageOptions.map((stage) => ({
            label: stage.label,
            value: stage.value,
          })),
          quotationShare: clientDetails.quotationShare,
          expectedDate: clientDetails.expectedDate,
          remarks: clientDetails.remarks,
          callType: clientDetails.callType,
          followUpDate: clientDetails.followUpDate,
          verifiedBy: clientDetails.verifiedBy,
          database: "User",
          tracker: clientDetails.tracker,
          amountDetails: clientDetails.amountDetails,
          amountHistory: clientDetails.amountHistory,
          isUserPage: true,
          followUpTime: getSelectedTime,
          label: clientDetails.label,
          completion: clientDetails.completion,
          action: "update User",
        }
      );
      console.log("Client History Save Succressfully", resultHistory);
      if (result && resultHistory) {
        alert("User successfully Updated");
      }

      setRefreshHistory((prev) => !prev);

      setRefresh((prev) => !prev);
    } catch (err) {
      console.log("internal error", err);
    }
  };

  const handleNewVisit = () => {
    setSelectedUserProduct([]);
    setSelectedStageOptions([]);
    handleTimeChange("HH:MM:SS AM/PM");
    handleNewTimeChange("HH:MM:SS AM/PM");
    setCheckRecovery(false);
    setClientDetails((prev) => ({
      ...prev,
      followUpTime: "",
      expectedDate: "",
      remarks: "",
      callType: "",
      quotationShare: "",
      tracker: {
        new_data_db: { completed: false, completedDate: "" },
        leads_db: { completed: false, completedDate: "" },
        training_db: { completed: false, completedDate: "" },
        follow_up_db: { completed: false, completedDate: "" },
        installation_db: { completed: false, completedDate: "" },
        demo_db: { completed: false, completedDate: "" },
        recovery_db: {
          completed: false,
          completedDate: "",
          recoveryHistory: [],
        },
        target_db: { completed: false, completedDate: "" },
        no_of_new_calls_db: { completed: false, completedDate: "" },
        support_db: { completed: false, completedDate: "" },
        out_bound_db: { completed: false, completedDate: "" },
        in_bound_db: { completed: false, completedDate: "" },
        hot_db: { completed: false, completedDate: "" },
        lost_db: { completed: false, completedDate: "" },
        create_db: { completed: false, completedDate: "" },
        update_db: { completed: false, completedDate: "" },
        deactivate_db: { completed: false, completedDate: "" },
      },
      label: "",
      completion: {
        receivedProduct: "",
        status: "",
        newExpectedDate: "",
        newTime: "",
        newRemark: "",
        newStage: "",
      },
      amountDetails: {
        totalAmount: "",
        paidAmount: "",
        extraCharges: "",
        finalCost: "",
        newAmount: "",
        balanceAmount: "",
      },
      amountHistory: [
        {
          date: "",
          time: "",
          totalAmount: "",
          paidAmount: "",
          extraCharges: "",
          finalCost: "",
          newAmount: "",
          balanceAmount: "",
          updatedBy: "",
        },
      ],
    }));
  };

  const handlePaymentReceipt = async (id) => {
    try {
      const result = await axios.get(`${base_url}/payment/receipt/${id}`);
      // console.log(result.data.result);
      const paymentData = result.data.result;
      navigate("/receipt", {
        state: {
          paymentData,
          from: "payment-receipt",
          label: "Payment Details",
        },
      });
    } catch (err) {
      console.log("internal err", err);
    }
  };
  const goToBack = () => {
    navigate("/search-client");
  };

  const handleDeactive = async () => {
    try {
      const result = await axios.put(
        `${base_url}/raw-data/deactivate-rawdata/${currentClientId}`
      );
      alert(result.data.message);
    } catch (err) {
      console.log("internal  error", err);
    }
  };
  return (
    <>
      <div className={styles.main}>
        <div className={styles.content}>
          <header className={styles.header}>
            <div className={styles.serialdiv}>
              <label htmlFor="">SrNo</label>
              <input type="text" value={clientDetails.sr_no} readOnly={true} />
              <input
                type="text"
                value={clientDetails.clientId}
                onChange={(e) => {
                  handleSearchInput("clientId", e.target.value);
                }}
              />
            </div>
            <div className={styles.heading}>
              <h2>
                User <strong>Details</strong>
              </h2>
              {checkHotClient && (
                <FaUserClock title="Hot Client" className={styles.hoticon} />
              )}
            </div>
            <div className={styles.db}>
              {databaseStatus === "raw_db" ? (
                <span className={styles.verified}>
                  <BsDatabaseFillDown
                    style={{
                      color: "red",
                      backgroundColor: "white",
                      fontSize: "18px",
                      borderRadius: "5px",
                    }}
                  />
                </span>
              ) : databaseStatus === "client_db" ? (
                <span className={styles.verified}>
                  {verifiedByEmployee ? (
                    <span
                      style={{
                        display: "flex",
                        gap: "10px",
                        alignItems: "center",
                        justifyContent: "center",
                        // background: "red",
                      }}
                    >
                      {" "}
                      Verified by {verifiedByEmployee}
                      <BsShieldCheck
                        style={{
                          color: "green",
                          backgroundColor: "white",
                          fontSize: "18px",
                          borderRadius: "20px",
                        }}
                      />
                    </span>
                  ) : (
                    <span className={styles.verified}>
                      {" "}
                      Verified
                      <BsShieldX
                        style={{
                          color: "red",
                          backgroundColor: "white",
                          fontSize: "18px",
                          borderRadius: "20px",
                        }}
                      />{" "}
                    </span>
                  )}
                  <BsDatabaseFillDown
                    title="Client DB"
                    style={{
                      color: "blue",
                      backgroundColor: "white",
                      fontSize: "18px",
                      borderRadius: "5px",
                    }}
                  />
                </span>
              ) : (
                <span className={styles.verified}>
                  {" "}
                  Verified
                  <BsShieldX
                    style={{
                      color: "red",
                      backgroundColor: "white",
                      fontSize: "18px",
                      borderRadius: "20px",
                    }}
                  />{" "}
                </span>
              )}
              <div className={styles.followupdiv}>
                <label htmlFor="">Follow Up Date </label>
                {clientDetails.time && <span>{clientDetails.time}</span>}

                <input
                  type="date"
                  name=""
                  id=""
                  value={clientDetails.followUpDate}
                  onChange={(e) => {
                    handleSearchInput("followUpDate", e.target.value);
                  }}
                />
              </div>
            </div>
          </header>

          <div className={styles.formlayout}>
            <div className={styles.heading2}>
              <h4>Basic </h4>
            </div>
            <div className={styles["basic-form-name"]}>
              <CustomInput
                type={"text"}
                label={"Client Name"}
                name={"clientName"}
                id={"clientName"}
                value={clientDetails.clientName}
                onChange={(e) => {
                  handleSearchInput("clientName", e.target.value);
                }}
                placeholder={"Enter Client Name"}
                required={false}
              />
            </div>

            <div className={styles["addfield-div"]}>
              <div className={styles.addfield}>
                <AddField
                  fieldType={"text"}
                  initialLabel={"Business Name"}
                  initialFields={clientDetails.bussinessNames}
                  onChange={(values) => {
                    //console.log("Bussiness name values", values);
                    const businessNames = values;
                    setClientDetails((prev) => ({
                      ...prev,
                      bussinessNames: businessNames,
                    }));
                  }}
                />
              </div>
              <div className={styles.addfield}>
                <AddField
                  fieldType={"number"}
                  initialLabel={"Primary Number"}
                  initialFields={clientDetails.numbers}
                  onChange={(values) => {
                    //console.log("numbers", values);
                    setClientDetails((prev) => ({
                      ...prev,
                      numbers: values,
                    }));
                  }}
                />
              </div>

              <div className={styles.addfield}>
                <AddField
                  fieldType={"email"}
                  initialLabel={"Email 1"}
                  initialFields={clientDetails.emails}
                  onChange={(values) => {
                    //console.log("Email", values);
                    setClientDetails((prev) => ({
                      ...prev,
                      emails: values,
                    }));
                  }}
                />
              </div>
              <div className={styles.addfield}>
                <AddField
                  fieldType={"text"}
                  initialLabel={"Address 1"}
                  initialFields={clientDetails.addresses}
                  onChange={(values) => {
                    //console.log("Bussiness name values", values);
                    setClientDetails((prev) => ({
                      ...prev,
                      addresses: values,
                    }));
                  }}
                />
              </div>
            </div>

            <div className={styles["other-fields1"]}>
              <div className={styles["other-fields1-inner"]}>
                <CustomInput
                  type={"text"}
                  label={"Assign By"}
                  name={"assign_by"}
                  id={"assign_by"}
                  value={"NA"}
                  readonly={true}
                  onChange={(e) => {
                    handleSearchInput("assignBy", e.target.value);
                  }}
                  required={false}
                />
                <CustomInput
                  type={"text"}
                  label={"Assign To"}
                  name={"assign_to"}
                  id={"assign_to"}
                  value={userLoginId}
                  readonly={true}
                  onChange={(e) => {
                    handleSearchInput("assignTo", e.target.value);
                  }}
                  required={false}
                />
              </div>
              <CustomInput
                type={"text"}
                label={"Website"}
                name={"website"}
                id={"website"}
                value={clientDetails.website}
                onChange={(e) => {
                  handleSearchInput("website", e.target.value);
                }}
                placeholder={"Enter Website"}
                required={false}
              />
            </div>

            <div className={styles["other-fields2"]}>
              <CustomInput
                type={"number"}
                label={"Pincode"}
                name={"pincode"}
                id={"pincode"}
                value={clientDetails.pincode}
                onChange={(e) => {
                  handleSearchInput("pincode", e.target.value);
                }}
                placeholder={"Enter pincode"}
                required={false}
              />
              <CustomInput
                type={"text"}
                label={"District"}
                name={"district"}
                id={"district"}
                value={clientDetails.district}
                onChange={(e) => {
                  handleSearchInput("district", e.target.value);
                }}
                placeholder={"Enter district"}
                required={false}
              />

              <CustomInput
                type={"text"}
                label={"State"}
                name={"state"}
                id={"state"}
                value={clientDetails.state}
                onChange={(e) => {
                  handleSearchInput("state", e.target.value);
                }}
                placeholder={"Enter state"}
                required={false}
              />
              <CustomInput
                type={"text"}
                label={"Country"}
                name={"country"}
                id={"country"}
                value={clientDetails.country}
                onChange={(e) => {
                  handleSearchInput("country", e.target.value);
                }}
                placeholder={"Enter Country"}
                required={false}
              />
            </div>

            {/* =========================FEEDBACK================================ */}

            <div className={styles.feedback}>
              <div className={styles.scheduleTab}>
                <p
                  onClick={() => {
                    setStageTab("Planner");
                  }}
                  className={stageTab === "Planner" && styles.scheduleTab1}
                >
                  Planner
                </p>
                <p
                  onClick={() => {
                    setStageTab("Completion");
                  }}
                  className={stageTab === "Completion" && styles.scheduleTab1}
                >
                  Completion
                </p>
              </div>
              <div className={styles["feedback-heading"]}>
                <h4>Feedback </h4>
              </div>
              <div className={styles["feedback-btndiv"]}>
                <button onClick={handleNewVisit}>New Visit</button>
              </div>
            </div>

            {/* ================================= PLANNER ============================================================= */}

            <div
              style={{ display: stageTab === "Planner" ? "" : "none" }}
              className={styles["feedback-layout"]}
            >
              <div>
                <label htmlFor="">Product</label>
                <CustomSelect
                  options={userProductList}
                  value={selectedUserProduct}
                  onChange={(selectedOptions) => {
                    handleSelectedUserProduct(selectedOptions);
                  }}
                />
              </div>
              <div className={styles.quo}>
                <span>
                  <label htmlFor="">Quotation Share </label>
                  <label htmlFor="yes">Yes </label>
                  <input
                    type="radio"
                    name="quotation"
                    id="yes"
                    value="yes"
                    checked={quotationYesNo === true}
                    style={{ marginRight: "5px" }}
                    onChange={() => {
                      setQuotationYesNo(true);
                    }}
                  />
                  <label htmlFor="no">No </label>
                  <input
                    type="radio"
                    name="quotation"
                    id="no"
                    value="no"
                    checked={quotationYesNo === false}
                    onChange={() => {
                      setQuotationYesNo(false);
                      handleSearchInput("quotationShare", "");
                    }}
                  />
                </span>
                {quotationYesNo && (
                  <input
                    type="text"
                    name=""
                    id=""
                    value={clientDetails.quotationShare}
                    onChange={(e) => {
                      handleSearchInput("quotationShare", e.target.value);
                    }}
                  />
                )}
              </div>
              <div>
                <label htmlFor="">Stage</label>

                <CustomSelect
                  options={stageOptions}
                  value={selectedStageOptions}
                  onChange={(selected) => {
                    handleStageChange(selected);
                  }}
                  isMulti={true}
                />
              </div>
              {checkRecovery === true && (
                <div className={styles.recovery}>
                  <span
                    className={styles.receiptspan}
                    onClick={() => {
                      handlePaymentReceipt(clientDetails.clientId);
                      setHistoryOpen(true);
                    }}
                  >
                    <IoReceipt className={styles.icon} />
                  </span>

                  <CustomInput
                    type="number"
                    label={"Final Cost"}
                    readonly={amountHandle.prevFinal > 0}
                    value={clientDetails.amountDetails.finalCost}
                    onChange={(e) => {
                      hanldeAmountChange("finalCost", e.target.value);
                    }}
                  />
                  <CustomInput
                    type="number"
                    label={"Extra Charges"}
                    readonly={amountHandle.prevExtra > 0}
                    value={clientDetails.amountDetails.extraCharges}
                    onChange={(e) => {
                      hanldeAmountChange("extraCharges", e.target.value);
                    }}
                  />
                  <CustomInput
                    type="number"
                    label={"Total"}
                    readonly={true}
                    value={clientDetails.amountDetails.totalAmount}
                    onChange={(e) => {
                      hanldeAmountChange("totalAmount", e.target.value);
                    }}
                  />

                  <CustomInput
                    type="number"
                    label={"New Amount"}
                    readonly={amountHandle.prevBalance === 0}
                    value={
                      amountHandle.prevTotal > 0 &&
                      amountHandle.prevTotal === amountHandle.prevPaid
                        ? 0
                        : clientDetails.amountDetails.newAmount
                    }
                    onChange={(e) => {
                      hanldeAmountChange("newAmount", e.target.value);
                    }}
                  />
                  <CustomInput
                    type="number"
                    readonly={true}
                    label={"Paid"}
                    value={clientDetails.amountDetails.paidAmount}
                    onChange={(e) => {
                      hanldeAmountChange("paidAmount", e.target.value);
                    }}
                  />
                  <CustomInput
                    type="number"
                    label={"Balance"}
                    readOnly={true}
                    value={clientDetails.amountDetails.balanceAmount}
                    onChange={(e) => {
                      hanldeAmountChange("balanceAmount", e.target.value);
                    }}
                  />

                  <CustomInput
                    type="text"
                    label={"GST %"}
                    readOnly={
                      clientDetails.amountDetails.gst > 0 ? true : false
                    }
                    value={clientDetails.amountDetails.gst}
                    onChange={(e) => {
                      hanldeAmountChange("gst", e.target.value);
                    }}
                  />

                  <div className={styles.modediv}>
                    <label htmlFor="">Mode</label>
                    <select
                      name=""
                      id=""
                      className={styles.customselect}
                      value={clientDetails.amountDetails.mode}
                      onChange={(e) => {
                        hanldeAmountChange("mode", e.target.value);
                      }}
                    >
                      {onlinePaymentMode.map((item, idx) => (
                        <option key={idx} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                  <CustomInput
                    type="text"
                    label={"Reference Id"}
                    value={clientDetails.amountDetails.referenceId}
                    onChange={(e) => {
                      hanldeAmountChange("referenceId", e.target.value);
                    }}
                  />
                </div>
              )}
              <div>
                <label htmlFor="">Follow Up Time</label>
                <TimePickerComponent
                  value={getSelectedTime}
                  onTimeChange={handleTimeChange}
                />
              </div>

              <div>
                Expected Close Date
                <input
                  type="date"
                  name=""
                  id=""
                  value={clientDetails.expectedDate}
                  className={styles.exdate}
                  onChange={(e) => {
                    handleSearchInput("expectedDate", e.target.value);
                    setClientDetails((prev) => ({
                      ...prev,
                      tracker: {
                        ...prev.tracker,
                        leads_db: {
                          completed: true,
                          completedDate: new Date().toLocaleDateString("en-GB"),
                        },
                      },
                    }));
                  }}
                />
              </div>
              <div>
                Call Type
                <select
                  name=""
                  id=""
                  value={clientDetails.callType}
                  className={styles.customselect}
                  onChange={(e) => {
                    const selectCallType = e.target.value;
                    if (selectCallType === "Out-bound") {
                      setClientDetails((prev) => ({
                        ...prev,
                        tracker: {
                          ...prev.tracker,
                          out_bound_db: {
                            completed: true,
                            completedDate: new Date().toLocaleDateString(
                              "en-GB"
                            ),
                          },
                        },
                      }));
                    } else if (selectCallType === "In-bound") {
                      setClientDetails((prev) => ({
                        ...prev,
                        tracker: {
                          ...prev.tracker,
                          in_bound_db: {
                            completed: true,
                            completedDate: new Date().toLocaleDateString(
                              "en-GB"
                            ),
                          },
                        },
                      }));
                    }
                    handleSearchInput("callType", e.target.value);
                  }}
                >
                  <option value="Out-bound">Out-bound</option>
                  <option value="In-bound">In-bound</option>
                </select>
              </div>
              <div>
                <label htmlFor="">Label</label>
                <select
                  name=""
                  id=""
                  className={styles.customselect}
                  value={clientDetails.label}
                  onChange={(e) => {
                    handleSearchInput("label", e.target.value);
                  }}
                >
                  <option value="NA">NA</option>
                  <option value="Hot">Hot</option>
                  <option value="Interested">Interested</option>
                  <option value="Less Interested">Less Interested</option>
                </select>
              </div>
            </div>
            <div
              style={{ display: stageTab === "Planner" ? "" : "none" }}
              className={styles.remarkdiv}
            >
              <label htmlFor="">Remark</label>
              <textarea
                className={styles["remarks-field"]}
                value={clientDetails.remarks}
                onChange={(e) => {
                  handleSearchInput("remarks", e.target.value);
                }}
              ></textarea>
            </div>

            {/* =================================== COMPLETION ========================================================             */}

            <div
              style={{ display: stageTab === "Completion" ? "" : "none" }}
              className={styles["feedback-layout"]}
            >
              <div>
                <label htmlFor="">Product</label>
                <input
                  type="text"
                  name=""
                  id=""
                  className={styles.customselect}
                  value={clientDetails.completion.receivedProduct}
                />
              </div>

              <div>
                <label htmlFor="">Stage</label>
                <select
                  name=""
                  id=""
                  className={styles.customselect}
                  value={clientDetails.completion.newStage}
                  onChange={(e) => {
                    setClientDetails((prev) => ({
                      ...prev,
                      completion: {
                        ...prev.completion,
                        newStage: e.target.value,
                      },
                    }));
                  }}
                >
                  <option value="">--Select--</option>
                  {(selectNewStage || []).map((item, idx) => (
                    <option key={idx} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="">Status</label>
                <select
                  name=""
                  id=""
                  className={styles.customselect}
                  value={clientDetails.completion.status}
                  onChange={(e) => {
                    setClientDetails((prev) => ({
                      ...prev,
                      completion: {
                        ...prev.completion,
                        status: e.target.value,
                      },
                    }));
                  }}
                >
                  <option value="">--Select--</option>
                  <option value="Done">Done</option>
                  <option value="Postponed">Postponed</option>
                  <option value="Cancel">Cancel</option>
                </select>
              </div>
              <div>
                Expected Close Date
                <input
                  type="date"
                  name=""
                  id=""
                  className={styles.exdate}
                  value={clientDetails.completion.newExpectedDate}
                  onChange={(e) => {
                    setClientDetails((prev) => ({
                      ...prev,
                      completion: {
                        ...prev.completion,
                        newExpectedDate: e.target.value,
                      },
                    }));
                  }}
                />
              </div>
              <div>
                <label htmlFor="">Follow Up Time</label>
                <TimePickerComponent
                  value={getSelectedNewTime}
                  onTimeChange={handleNewTimeChange}
                />
              </div>
            </div>
            <div
              style={{ display: stageTab === "Completion" ? "" : "none" }}
              className={styles.remarkdiv}
            >
              <label htmlFor="">Remark</label>
              <textarea
                className={styles["remarks-field"]}
                value={clientDetails.completion.newRemark}
                onChange={(e) => {
                  setClientDetails((prev) => ({
                    ...prev,
                    completion: {
                      ...prev.completion,
                      newRemark: e.target.value,
                    },
                  }));
                }}
              ></textarea>
            </div>

            <div className={styles.btn}>
              <div
                className={styles["arrow-icon"]}
                style={{
                  position: "relative",
                  backgroundColor: taskIndex === 0 ? "white" : "",
                }}
                onClick={handlePrevButton}
              >
                {taskClientIdArray.length > 0 && (
                  <span className={styles.btncounterleft}>{taskIndex}</span>
                )}
                <FaAngleLeft />
              </div>
              <div
                style={{
                  width: "25px",
                  height: "25px",
                  backgroundColor: "rgb(92, 55, 55)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "100%",
                  fontSize: "140px",
                }}
                onClick={() => {
                  handleSwichTo();
                }}
              >
                <HiOutlineRefresh
                  style={{ fontSize: "40px", color: "white" }}
                />
              </div>
              <button onClick={()=>{handleClientNewForm();setIsNewDataEntry(true)}}>New</button>
              {isUnsavedNewForm === true ? (
                <button onClick={handleSaveUserDetails}>Save</button>
              ) : (
                <button
                  disabled={!isModified}
                  style={
                    !isModified ? { background: "gray", opacity: 0.5 } : {}
                  }
                  onClick={handleUpdateUserDetails}
                >
                  Update
                </button>
              )}
              <button                 onClick={() => {
                  handleAllSearchClientData();
                  setCheckDisplaySearchClients((prev) => !prev);
                }}>Search</button>
              {userPermissions.delete_P && (
                <button
                  onClick={() => {
                    handleDeactive();
                  }}
                >
                  Deactivate
                </button>
              )}
              <button
                style={{ display: activedBackButton === true ? "" : "none" }}
                onClick={() => {
                  goToBack();
                }}
              >
                Back
              </button>
              {checkDisplaySearchClients && (
                <DisplaySearchClientsPortal
                  onClientIdClick={handleClientIdClick}
                  onAllSearchClientData={allSearchClientData}
                  onClose={() => {
                    setCheckDisplaySearchClients(false);
                  }}
                />
              )}
              <div
                className={styles["arrow-icon"]}
                style={{
                  position: "relative",
                  backgroundColor:
                    taskIndex === taskClientIdArray.length - 1 ? "white" : "",
                }}
                onClick={handleNextButton}
              >
                <FaAngleRight />
                {taskClientIdArray.length > 0 && (
                  <span className={styles.btncounterright}>
                    {" "}
                    {taskClientIdArray.length - (taskIndex + 1)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.history}>
          <div className={styles.viewhistory}>
            <button
              onClick={() => {
                setHistoryPop((prev) => !prev);
              }}
            >
              View
            </button>
          </div>
          <History
            onRefresh={refreshHistory}
            onCurrentClientId={clientDetails.clientId}
          />
        </div>
        {historyPop && (
          <div
            style={{
              width: "100%",
              height: "100%",
              position: "fixed",
              background: "gray",
              top: "0",
              left: "0",
              fontSize: "36px",
              padding: "50px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <History
                onRefresh={refreshHistory}
                onCurrentClientId={clientDetails.clientId}
                sorts={"des"}
              />
              <div
                style={{
                  width: "100%",
                  height: "auto",
                  display: "flex",
                  justifyContent: "end",
                  padding: "10px",
                  borderTop: "1px solid #ccc",
                  background: "white",
                }}
              >
                <button
                  onClick={() => {
                    setHistoryPop(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* <div className={styles.main}>
      <div className={styles.content}>
        <header className={styles.header}>
          <div
            style={{
              width: "30%",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "start",
              height: "100%",
              padding: "10px",
              // background: "red",
              gap: "5px",
            }}
          >
            <label
              htmlFor=""
              style={{
                // background: "white",
                padding: "3px 10px",
                width: "15%",
                textAlign: "cnter",
              }}
            >
              SrNo
            </label>
            <input
              type="text"
              value={clientDetails.sr_no}
              readonly
              style={{ padding: "2px 10px", width: "30%", textAlign: "center" }}
            />
            <input
              type="text"
              value={clientDetails.userSubscriptionId}
              readonly
              style={{ padding: "2px 10px", width: "40%", textAlign: "center" }}
            />
          </div>
          <div style={{ width: "40%", position: "relative" }}>
            <h2 style={{ fontSize: "30px" }}>
              User{" "}
              <strong
                style={{
                  fontSize: "30px",
                  color: "white",
                  WebkitTextStroke: "1px red",
                }}
              >
                Details
              </strong>
            </h2>
            {checkHotClient && (
              <FaUserClock
                style={{
                  fontSize: "40px",
                  color: "black",
                  position: "absolute",
                  right: "20%",
                  top: "0px",
                  background: "white",
                  padding: "2px",
                  borderRadius: "100%",
                }}
              />
            )}
          </div>
          <div
            style={{
              width: "30%",
              display: "flex",
              gap: "5px",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              // background:'red'
            }}
          >
            {databaseStatus === "raw_db" ? (
              <span
                style={{ display: "flex", gap: "10px", alignItems: "center" }}
              >
                <BsDatabaseFillDown
                  style={{
                    color: "red",
                    backgroundColor: "white",
                    fontSize: "18px",
                    borderRadius: "5px",
                  }}
                />
              </span>
            ) : databaseStatus === "client_db" ? (
              <span
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "red",
                }}
              >
                {verifiedByEmployee ? (
                  <span
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "red",
                    }}
                  >
                    {" "}
                    Verified by {verifiedByEmployee}
                    <BsShieldCheck
                      style={{
                        color: "green",
                        backgroundColor: "white",
                        fontSize: "18px",
                        borderRadius: "20px",
                      }}
                    />
                  </span>
                ) : (
                  <span
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "white",
                    }}
                  >
                    {" "}
                    Verified
                    <BsShieldX
                      style={{
                        color: "red",
                        backgroundColor: "white",
                        fontSize: "18px",
                        borderRadius: "20px",
                      }}
                    />{" "}
                  </span>
                )}
                <BsDatabaseFillDown
                  style={{
                    color: "blue",
                    backgroundColor: "white",
                    fontSize: "18px",
                    borderRadius: "5px",
                  }}
                />
              </span>
            ) : (
              <span
                style={{ display: "flex", gap: "10px", alignItems: "center" }}
              >
                {" "}
                Verified
                <BsShieldX
                  style={{
                    color: "red",
                    backgroundColor: "white",
                    fontSize: "18px",
                    borderRadius: "20px",
                  }}
                />{" "}
              </span>
            )}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
              }}
            >
              <label htmlFor="">
                Follow Up Date{" "}
                <span
                  style={{
                    border: "1px solid",
                    backgroundColor: "white",
                    padding: "2px 10px",
                  }}
                >
                  {clientDetails.time}
                </span>
              </label>

              <input
                type="date"
                name=""
                id=""
                style={{ padding: "0px 10px" }}
                value={clientDetails.followUpDate}
                onChange={(e) => {
                  handleSearchInput("followUpDate", e.target.value);
                }}
              />
            </div>
          </div>
        </header>

        <div className={styles.basicform}>
          <div className={styles.basic}>
            <h2 style={{ fontSize: "18px" }}>Basic </h2>
          </div>
          <div className={styles["formlayout-down"]}>
            <div>
              <CustomInput
                type={"text"}
                label={"Client Name"}
                name={"clientName"}
                id={"clientName"}
                value={clientDetails.clientName}
                onChange={(e) => {
                  handleSearchInput("clientName", e.target.value);
                }}
                placeholder={"Enter Client Name"}
                required={false}
              />
            </div>
          </div>

          <div className={styles["formlayout-up"]}>
            <AddField
              fieldType={"text"}
              initialLabel={"Business Name"}
              initialFields={clientDetails.bussinessNames}
              onChange={(values) => {
                console.log("Bussiness name values", values);
                const businessNames = values;
                setClientDetails((prev) => ({
                  ...prev,
                  bussinessNames: businessNames,
                }));
              }}
            />
            <AddField
              fieldType={"number"}
              initialLabel={"Primary Number"}
              initialFields={clientDetails.numbers}
              onChange={(values) => {
                console.log("numbers", values);
                setClientDetails((prev) => ({
                  ...prev,
                  numbers: values,
                }));
              }}
            />
            <AddField
              fieldType={"email"}
              initialLabel={"Email 1"}
              initialFields={clientDetails.emails}
              onChange={(values) => {
                console.log("Email", values);
                setClientDetails((prev) => ({
                  ...prev,
                  emails: values,
                }));
              }}
            />
            <AddField
              fieldType={"text"}
              initialLabel={"Address 1"}
              initialFields={clientDetails.addresses}
              onChange={(values) => {
                console.log("Bussiness name values", values);
                setClientDetails((prev) => ({
                  ...prev,
                  addresses: values,
                }));
              }}
            />
          </div>
          <div className={styles["formlayout-down"]}>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "5px" }}
            >
              <div style={{ width: "100%" }}>
                <CustomInput
                  type={"text"}
                  label={"Website"}
                  name={"website"}
                  id={"website"}
                  value={clientDetails.website}
                  onChange={(e) => {
                    handleSearchInput("website", e.target.value);
                  }}
                  placeholder={"Enter Website"}
                  required={false}
                />
              </div>
              <div style={{ display: "flex", width: "100%" }}>
                <CustomInput
                  type={"text"}
                  label={"Assign By"}
                  name={"assign_by"}
                  id={"assign_by"}
                  value={"NA"}
                  readonly={true}
                  onChange={(e) => {
                    handleSearchInput("assignBy", e.target.value);
                  }}
                  required={false}
                />
                <CustomInput
                  type={"text"}
                  label={"Assign To"}
                  name={"assign_to"}
                  id={"assign_to"}
                  value={userLoginId}
                  readonly={true}
                  onChange={(e) => {
                    handleSearchInput("assignTo", e.target.value);
                  }}
                  required={false}
                />
              </div>
            </div>
            <div>
              <div
                style={{
                  width: "50%",
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                }}
              >
                <CustomInput
                  type={"number"}
                  label={"Pincode"}
                  name={"pincode"}
                  id={"pincode"}
                  value={clientDetails.pincode}
                  onChange={(e) => {
                    handleSearchInput("pincode", e.target.value);
                  }}
                  placeholder={"Enter pincode"}
                  required={false}
                />
                <CustomInput
                  type={"text"}
                  label={"District"}
                  name={"district"}
                  id={"district"}
                  value={clientDetails.district}
                  onChange={(e) => {
                    handleSearchInput("district", e.target.value);
                  }}
                  placeholder={"Enter district"}
                  required={false}
                />
              </div>
              <div
                style={{
                  width: "50%",
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                }}
              >
                <CustomInput
                  type={"text"}
                  label={"State"}
                  name={"state"}
                  id={"state"}
                  value={clientDetails.state}
                  onChange={(e) => {
                    handleSearchInput("state", e.target.value);
                  }}
                  placeholder={"Enter state"}
                  required={false}
                />
                <CustomInput
                  type={"text"}
                  label={"Country"}
                  name={"country"}
                  id={"country"}
                  value={clientDetails.country}
                  onChange={(e) => {
                    handleSearchInput("country", e.target.value);
                  }}
                  placeholder={"Enter Country"}
                  required={false}
                />
              </div>
            </div>
          </div>
          // =========================FEEDBACK================================ 

          <div className={styles.feedback}>
            <div className={styles.scheduleTab}>
              <p
                onClick={() => {
                  setStageTab("Planner");
                }}
                className={stageTab === "Planner" && styles.scheduleTab1}
              >
                Planner
              </p>
              <p
                onClick={() => {
                  setStageTab("Completion");
                }}
                className={stageTab === "Completion" && styles.scheduleTab1}
              >
                Completion
              </p>
            </div>
            <h2 style={{ fontSize: "18px" }}>Feedback </h2>
            <div style={{ position: "absolute", right: "10px" }}>
              <button onClick={handleNewVisit}>New Visit</button>
            </div>
          </div>

          // ================================= PLANNER ============================================================= 

          <div
            style={{ display: stageTab === "Planner" ? "" : "none" }}
            className={styles["formlayout-down"]}
          >
            <div
              style={{
                width: "100%",
                display: "flex",
                gap: "5px",
              }}
            >
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                }}
              >
                <label
                  htmlFor=""
                  style={{ fontSize: "16px", fontWeight: "500" }}
                >
                  Product
                </label>
                <CustomSelect
                  options={userProductList}
                  value={selectedUserProduct}
                  onChange={(selectedOptions) => {
                    handleSelectedUserProduct(selectedOptions);
                  }}
                />
              </div>
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                  marginBottom: "5px",
                }}
              >
                <label
                  htmlFor=""
                  style={{
                    fontSize: "16px",
                    fontWeight: "500",
                    display: "flex",
                    gap: "10px",
                  }}
                >
                  Quotation Share{" "}
                  <span>
                    <label htmlFor="yes">Yes </label>
                    <input
                      type="radio"
                      name="quotation"
                      id="yes"
                      value="yes"
                      checked={quotationYesNo === true}
                      style={{ marginRight: "5px" }}
                      onChange={() => {
                        setQuotationYesNo(true);
                      }}
                    />
                    <label htmlFor="no">No </label>
                    <input
                      type="radio"
                      name="quotation"
                      id="no"
                      value="no"
                      checked={quotationYesNo === false}
                      onChange={() => {
                        setQuotationYesNo(false);
                        handleSearchInput("quotationShare", "");
                      }}
                    />
                  </span>
                </label>

                {quotationYesNo && (
                  <input
                    type="text"
                    name=""
                    id=""
                    style={{ padding: "3px 10px", width: "60%" }}
                    value={clientDetails.quotationShare}
                    onChange={(e) => {
                      handleSearchInput("quotationShare", e.target.value);
                    }}
                  />
                )}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                // background: "red",
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  width: "80%",
                }}
              >
                <label
                  htmlFor=""
                  style={{ fontSize: "16px", fontWeight: "500" }}
                >
                  Stage
                </label>

                <CustomSelect
                  options={stageOptions}
                  value={selectedStageOptions}
                  onChange={(selected) => {
                    handleStageChange(selected);
                  }}
                  isMulti={true}
                />
              </div>
              <div style={{ position: "absolute", top: "0px", right: "10%" }}>
                <label
                  htmlFor=""
                  style={{ fontSize: "16px", fontWeight: "500" }}
                >
                  Follow Up Time
                </label>
                <TimePickerComponent
                  value={getSelectedTime}
                  onTimeChange={handleTimeChange}
                />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  gap: "5px",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                    marginBottom: "5px",
                  }}
                >
                  Expected Close Date
                  <input
                    type="date"
                    name=""
                    id=""
                    style={{ padding: "0px 10px", width: "60%" }}
                    value={clientDetails.expectedDate}
                    onChange={(e) => {
                      handleSearchInput("expectedDate", e.target.value);
                      setClientDetails((prev) => ({
                        ...prev,
                        tracker: {
                          ...prev.tracker,
                          leads_db: {
                            completed: true,
                            completedDate: new Date().toLocaleDateString(
                              "en-GB"
                            ),
                          },
                        },
                      }));
                    }}
                  />
                </div>
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                    marginBottom: "5px",
                  }}
                >
                  Call Type
                  <select
                    name=""
                    id=""
                    style={{ padding: "2px 10px", width: "60%" }}
                    value={clientDetails.callType}
                    onChange={(e) => {
                      const selectCallType = e.target.value;
                      if (selectCallType === "Out-bound") {
                        setClientDetails((prev) => ({
                          ...prev,
                          tracker: {
                            ...prev.tracker,
                            out_bound_db: {
                              completed: true,
                              completedDate: new Date().toLocaleDateString(
                                "en-GB"
                              ),
                            },
                          },
                        }));
                      } else if (selectCallType === "In-bound") {
                        setClientDetails((prev) => ({
                          ...prev,
                          tracker: {
                            ...prev.tracker,
                            in_bound_db: {
                              completed: true,
                              completedDate: new Date().toLocaleDateString(
                                "en-GB"
                              ),
                            },
                          },
                        }));
                      }
                      handleSearchInput("callType", e.target.value);
                    }}
                  >
                    <option value="Out-bound">Out-bound</option>
                    <option value="In-bound">In-bound</option>
                  </select>
                </div>
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: "5px",
                  }}
                >
                  Label
                  <select
                    name=""
                    id=""
                    style={{ padding: "2px 10px", width: "60%" }}
                    value={clientDetails.label}
                    onChange={(e) => {
                      handleSearchInput("label", e.target.value);
                    }}
                  >
                    <option value="NA">NA</option>
                    <option value="Hot">Hot</option>
                    <option value="Interested">Interested</option>
                    <option value="Less Interested">Less Interested</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <label htmlFor="">Remark</label>
                <textarea
                  className={styles["remarks-field"]}
                  value={clientDetails.remarks}
                  onChange={(e) => {
                    handleSearchInput("remarks", e.target.value);
                  }}
                ></textarea>
              </div>
            </div>
            {checkRecovery === true ? (
              <div
                className={styles.recovery}
                style={{ width: "90%", padding: "10px" }}
              >
                <span
                  className={styles.history}
                  onClick={() => {
                    handlePaymentReceipt(clientDetails.clientId);
                    setHistoryOpen(true);
                  }}
                >
                  <IoReceipt className={styles.icon} />
                </span>
                {historyOpen && (
                  <div className={styles.popup}>
                    <div className={styles.popups} ref={contentRef}>
                      <table>
                        <tr>
                          <th>Sr No</th>
                          <th>Date And Time</th>
                          <th>Client Id</th>
                          <th>Client Name</th>
                          <th>Final Price</th>
                          <th>Extra Charges</th>
                          <th>Total Amount</th>
                          <th>New Amount</th>
                          <th>Paid Amount</th>
                          <th>Balance Amount</th>
                          <th>Gst %</th>
                          <th>Reference Id</th>
                          <th>Mode Of Payment</th>
                          <th>User Id</th>
                        </tr>
                        {paymentReceiptList.map((item, idx) => (
                          <tr>
                            <td>{idx + 1}</td>
                            <td>
                              {item.updatedAt.split("T")[0]}{" "}
                              {item.updatedAt.split("T")[1].split(".")[0]}
                            </td>
                            <td>{item.client_id}</td>
                            <td>{item.client_name_db}</td>
                            <td>{item.finalCost_db}</td>
                            <td>{item.extraCharges_db}</td>
                            <td>{item.totalAmount_db}</td>
                            <td>{item.newAmount_db}</td>
                            <td>{item.paidAmount_db}</td>
                            <td>{item.balanceAmount_db}</td>
                            <td>{item.gst_db}</td>
                            <td>{item.referenceId_db}</td>
                            <td>{item.mode_db}</td>
                            <td>{item.userId_db}</td>
                          </tr>
                        ))}
                      </table>
                      <div
                        style={{
                          width: "100%",
                          display: "flex",
                          justifyContent: "end",
                          gap: "20px",
                        }}
                      >
                        <button onClick={reactToPrintFn}>Print</button>
                        <button
                          onClick={() => {
                            setHistoryOpen(false);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <span style={{ display: "flex" }}>
                  <CustomInput
                    type="number"
                    label={"Final Cost"}
                    readonly={amountHandle.prevFinal > 0}
                    value={clientDetails.amountDetails.finalCost}
                    onChange={(e) => {
                      hanldeAmountChange("finalCost", e.target.value);
                    }}
                  />
                  <CustomInput
                    type="number"
                    label={"Extra Charges"}
                    readonly={amountHandle.prevExtra > 0}
                    value={clientDetails.amountDetails.extraCharges}
                    onChange={(e) => {
                      hanldeAmountChange("extraCharges", e.target.value);
                    }}
                  />
                  <CustomInput
                    type="number"
                    label={"Total"}
                    readonly={true}
                    value={clientDetails.amountDetails.totalAmount}
                    onChange={(e) => {
                      hanldeAmountChange("totalAmount", e.target.value);
                    }}
                  />
                </span>
                <span style={{ display: "flex" }}>
                  <CustomInput
                    type="number"
                    label={"New Amount"}
                    readonly={amountHandle.prevBalance === 0}
                    value={
                      amountHandle.prevTotal > 0 &&
                      amountHandle.prevTotal === amountHandle.prevPaid
                        ? 0
                        : clientDetails.amountDetails.newAmount
                    }
                    onChange={(e) => {
                      hanldeAmountChange("newAmount", e.target.value);
                    }}
                  />
                  <CustomInput
                    type="number"
                    readonly={true}
                    label={"Paid"}
                    value={clientDetails.amountDetails.paidAmount}
                    onChange={(e) => {
                      hanldeAmountChange("paidAmount", e.target.value);
                    }}
                  />
                  <CustomInput
                    type="number"
                    label={"Balance"}
                    readonly={true}
                    value={clientDetails.amountDetails.balanceAmount}
                    onChange={(e) => {
                      hanldeAmountChange("balanceAmount", e.target.value);
                    }}
                  />
                </span>
                <span style={{ display: "flex" }}>
                  <CustomInput
                    type="text"
                    label={"GST %"}
                    value={clientDetails.amountDetails.gst}
                    onChange={(e) => {
                      hanldeAmountChange("gst", e.target.value);
                    }}
                  />

                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                    }}
                  >
                    <label htmlFor="" style={{ fontSize: "16px" }}>
                      Mode
                    </label>
                    <select
                      name=""
                      id=""
                      value={clientDetails.amountDetails.mode}
                      onChange={(e) => {
                        hanldeAmountChange("mode", e.target.value);
                      }}
                      style={{ width: "60%", padding: "1px 10px" }}
                    >
                      {onlinePaymentMode.map((item, idx) => (
                        <option key={idx} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                  <CustomInput
                    type="text"
                    label={"Reference Id"}
                    value={clientDetails.amountDetails.referenceId}
                    onChange={(e) => {
                      hanldeAmountChange("referenceId", e.target.value);
                    }}
                  />
                </span>
              </div>
            ) : (
              <div></div>
            )}
          </div>

        //  =================================== COMPLETION ========================================================            

          <div
            style={{ display: stageTab === "Completion" ? "" : "none" }}
            className={styles["formlayout-down"]}
          >
            <div
              style={{
                width: "100%",
                display: "flex",
                gap: "5px",
              }}
            >
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                }}
              >
                Product
                <input
                  type="text"
                  name=""
                  id=""
                  style={{ padding: "2px 10px", width: "60%" }}
                  value={clientDetails.completion.receivedProduct}
                />
              </div>

              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                  marginBottom: "5px",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                    marginBottom: "5px",
                  }}
                >
                  Stage
                  <select
                    name=""
                    id=""
                    style={{ padding: "2px 10px", width: "60%" }}
                    value={clientDetails.completion.newStage}
                    onChange={(e) => {
                      setClientDetails((prev) => ({
                        ...prev,
                        completion: {
                          ...prev.completion,
                          newStage: e.target.value,
                        },
                      }));
                    }}
                  >
                    <option value="">--Select--</option>
                    {(selectNewStage || []).map((item, idx) => (
                      <option key={idx} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                // background: "red",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                  marginBottom: "5px",
                }}
              >
                Expected Close Date
                <input
                  type="date"
                  name=""
                  id=""
                  style={{ padding: "0px 10px", width: "30%" }}
                  value={clientDetails.completion.newExpectedDate}
                  onChange={(e) => {
                    setClientDetails((prev) => ({
                      ...prev,
                      completion: {
                        ...prev.completion,
                        newExpectedDate: e.target.value,
                      },
                    }));
                  }}
                />
              </div>
              <div style={{ position: "absolute", top: "0px", right: "10%" }}>
                <label
                  htmlFor=""
                  style={{ fontSize: "16px", fontWeight: "500" }}
                >
                  Follow Up Time
                </label>
                <TimePickerComponent
                  value={getSelectedNewTime}
                  onTimeChange={handleNewTimeChange}
                />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  gap: "5px",
                }}
              ></div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <label htmlFor="">Remark</label>
                <textarea
                  className={styles["remarks-field"]}
                  value={clientDetails.completion.newRemark}
                  onChange={(e) => {
                    setClientDetails((prev) => ({
                      ...prev,
                      completion: {
                        ...prev.completion,
                        newRemark: e.target.value,
                      },
                    }));
                  }}
                ></textarea>
              </div>
            </div>

            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: "2px",
                marginBottom: "5px",
              }}
            >
              Status
              <select
                name=""
                id=""
                style={{ padding: "2px 10px", width: "30%" }}
                value={clientDetails.completion.status}
                onChange={(e) => {
                  setClientDetails((prev) => ({
                    ...prev,
                    completion: {
                      ...prev.completion,
                      status: e.target.value,
                    },
                  }));
                }}
              >
                <option value="">--Select--</option>
                <option value="Done">Done</option>
                <option value="Postponed">Postponed</option>
                <option value="Cancel">Cancel</option>
              </select>
            </div>
          </div>

          <div className={styles.btn}>
            <div
              className={styles["arrow-icon"]}
              style={{
                position: "relative",
                backgroundColor: taskIndex === 0 ? "white" : "",
              }}
              onClick={handlePrevButton}
            >
              <FaAngleLeft />
            </div>
            <div
              style={{
                width: "25px",
                height: "25px",
                backgroundColor: "rgb(92, 55, 55)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: "100%",
                fontSize: "140px",
              }}
              onClick={() => {
                handleSwichTo();
              }}
            >
              <HiOutlineRefresh style={{ fontSize: "40px", color: "white" }} />
            </div>
            <button onClick={handleUpdateUserDetails}>Update</button>
            <button>Search</button>
            <button>Deactivate</button>

            <div
              className={styles["arrow-icon"]}
              style={{
                position: "relative",
                backgroundColor:
                  taskIndex === userIdArray.length - 1 ? "white" : "",
              }}
              onClick={handleNextButton}
            >
              <FaAngleRight />
            </div>
          </div>
        </div>
      </div>
      <div>
        <History
          onRefresh={refreshHistory}
          onCurrentClientId={clientDetails.clientId}
        />
      </div>
    </div> */}
    </>
  );
};

export default UserPage;
