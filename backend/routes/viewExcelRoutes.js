const {updateAssignExcelToUser,  getTrackerUserToDumpExcel,recordTracker,getExcelRecord,getAllExcelSheetRecord } = require('../controllers/viewExcelController')
const express = require("express")
const router = express.Router()

router.get("/get-viewexcel-user",getTrackerUserToDumpExcel)
router.put("/recordtracker",recordTracker)
router.get("/get-excel-record",getExcelRecord)
router.get("/get-allexcel",getAllExcelSheetRecord)
router.get("/assign-excel",updateAssignExcelToUser)


module.exports = router