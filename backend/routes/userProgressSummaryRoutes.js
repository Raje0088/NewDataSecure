const express = require("express")
const { appendFile } = require("fs")
const { createUserProgress,getAdminAssignTaskUserProgress, getUserDailyReport, getUserGraphReport } = require("../controllers/userProgressSummaryController")
const router = express.Router()

// router.post("/userprogress",createUserProgress)
// router.get("/getprogress/:id", getUserDailyReport);
// router.get("/get-graph/:id", getUserGraphReport);
router.get("/get-admintask/:id", getAdminAssignTaskUserProgress);

module.exports = router