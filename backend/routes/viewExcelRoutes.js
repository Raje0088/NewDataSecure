const {  getTrackerUserToDumpExcel,recordTracker } = require('../controllers/viewExcelController')
const express = require("express")
const router = express.Router()

router.get("/get-viewexcel-user",getTrackerUserToDumpExcel)
router.put("/recordtracker",recordTracker)


module.exports = router