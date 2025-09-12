const express = require("express")
const { appendFile } = require("fs")
const { createUserProgress, getUserDailyReport, getUserGraphReport } = require("../controllers/userProgressSummaryController")
const router = express.Router()

// router.post("/userprogress",createUserProgress)
router.get("/getprogress/:id", getUserDailyReport);
router.get("/get-graph/:id", getUserGraphReport);

module.exports = router